javascript:(function(){
var old=document.getElementById('nahdi_baz_panel');if(old)old.remove();
var oldStyle=document.getElementById('nahdi_baz_styles');if(oldStyle)oldStyle.remove();
var d=document,db=[],editOn=false,dragOn=false,delRowOn=false,selI=null,selImg=null,dragEl=null,dragOX=0,dragOY=0,panelCollapsed=false;

var undoStack = [];

/* ══════════════════════════════════════════
   ☁️ CLOUD CONFIG — سحب الأصناف المشفرة
   ══════════════════════════════════════════ */
var _EZ_REPO='bazkoo2000/ez-pill-pro';
var _EZ_DRUGS_FILE='ez_drugs_enc.dat';
var _EZ_DRUGS_RAW='https://raw.githubusercontent.com/'+_EZ_REPO+'/main/'+_EZ_DRUGS_FILE;
var _EZ_DRUGS_API='https://api.github.com/repos/'+_EZ_REPO+'/contents/'+_EZ_DRUGS_FILE;
var _EK=[69,90,80,73,76,76,50,48,50,54,83,69,67,82,69,84];
var _ADMIN_PIN='101093';

function _ezGetGHToken(){try{return localStorage.getItem('ez_gh_token')||'';}catch(e){return '';}}

async function _ezDeriveKey(){
    var raw=new Uint8Array(_EK);
    var km=await crypto.subtle.importKey('raw',raw,{name:'PBKDF2'},false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('ezpill_salt_2026'),iterations:100000,hash:'SHA-256'},km,{name:'AES-CBC',length:256},false,['encrypt','decrypt']);
}
async function _ezDecrypt(b64){
    var key=await _ezDeriveKey();
    var raw=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0)});
    var iv=raw.slice(0,16);var data=raw.slice(16);
    var dec=await crypto.subtle.decrypt({name:'AES-CBC',iv:iv},key,data);
    return new TextDecoder().decode(dec);
}
async function _ezEncrypt(text){
    var key=await _ezDeriveKey();
    var iv=crypto.getRandomValues(new Uint8Array(16));
    var encoded=new TextEncoder().encode(text);
    var encrypted=await crypto.subtle.encrypt({name:'AES-CBC',iv:iv},key,encoded);
    var combined=new Uint8Array(iv.length+encrypted.byteLength);
    combined.set(iv);combined.set(new Uint8Array(encrypted),iv.length);
    var chunks=[];for(var i=0;i<combined.length;i+=8192){var slice=combined.subarray(i,Math.min(i+8192,combined.length));var str='';for(var j=0;j<slice.length;j++)str+=String.fromCharCode(slice[j]);chunks.push(str);}
    return btoa(chunks.join(''));
}

async function _ezFetchDrugsFromGH(){
    try{
        var resp=await fetch(_EZ_DRUGS_RAW+'?t='+Date.now());
        if(!resp.ok){console.warn('Drug fetch:',resp.status);return null;}
        var b64=await resp.text();
        var json=await _ezDecrypt(b64.trim());
        var list=JSON.parse(json);
        try{localStorage.setItem('ez_drugs_cache',json);localStorage.setItem('ez_drugs_cache_time',Date.now().toString());}catch(e){}
        console.log('💊 Drugs loaded:',list.length);
        return list;
    }catch(e){
        console.warn('💊 Fetch error:',e);
        try{var c=localStorage.getItem('ez_drugs_cache');if(c)return JSON.parse(c);}catch(e2){}
        return null;
    }
}

async function _ezPushDrugsToGH(list){
    var token=_ezGetGHToken();
    if(!token){toast('لا يوجد توكن جيتهاب','error');return false;}
    try{
        var json=JSON.stringify(list);
        var encrypted=await _ezEncrypt(json);
        var sha='';
        try{var gr=await fetch(_EZ_DRUGS_API,{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});if(gr.ok){var gd=await gr.json();sha=gd.sha;}}catch(e){}
        var b64Content='';
        try{b64Content=btoa(encrypted);}catch(e){
            var enc=new TextEncoder().encode(encrypted);var chunks=[];
            for(var ci=0;ci<enc.length;ci+=8192){var sl=enc.subarray(ci,Math.min(ci+8192,enc.length));var s='';for(var cj=0;cj<sl.length;cj++)s+=String.fromCharCode(sl[cj]);chunks.push(s);}
            b64Content=btoa(chunks.join(''));
        }
        var body={message:'تحديث الأدوية — '+new Date().toLocaleString('ar-EG'),content:b64Content,branch:'main'};
        if(sha)body.sha=sha;
        var resp=await fetch(_EZ_DRUGS_API,{method:'PUT',headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'},body:JSON.stringify(body)});
        if(!resp.ok){var err=await resp.json();toast('فشل الرفع ('+resp.status+'): '+(err.message||''),'error');return false;}
        return true;
    }catch(e){toast('خطأ: '+e.message,'error');return false;}
}

/* ══════════════════════════════════════════ */

var css=d.createElement('style');css.id='nahdi_baz_styles';
css.textContent=`
#nahdi_baz_panel *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Cairo,Helvetica,sans-serif;}
#nahdi_baz_panel{position:fixed;top:14px;right:14px;z-index:999999;width:340px;border-radius:22px;overflow:visible;direction:rtl;opacity:0;transform:translateY(-12px) scale(.97);transition:opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease;background:rgba(243,244,246,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);}
#nahdi_baz_panel.show{opacity:1;transform:translateY(0) scale(1);}
.nbp-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 6px;cursor:grab;user-select:none;-webkit-user-select:none;}
.nbp-header.grabbing{cursor:grabbing;}
.nbp-logo{display:flex;align-items:center;gap:10px;}
.nbp-logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25);}
.nbp-title{color:#1f2937;font-size:15px;font-weight:800;}
.nbp-ver{font-size:10px;color:#9ca3af;font-weight:600;}
.nbp-actions{display:flex;gap:6px;}
.nbp-act-btn{width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .15s;}
.nbp-act-btn:hover{background:rgba(0,0,0,0.1);color:#6b7280;}
.nbp-body{padding:10px 16px 14px;max-height:70vh;overflow-y:auto;overflow-x:hidden;}
.nbp-body::-webkit-scrollbar{width:3px;}
.nbp-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.08);border-radius:3px;}
.nbp-grp{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03);margin-bottom:12px;}
.nbp-grp-title{font-size:10px;color:#9ca3af;font-weight:700;padding:10px 16px 4px;letter-spacing:0.3px;}
.nbp-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:0.5px solid #f3f4f6;cursor:pointer;transition:background 0.15s;}
.nbp-item:last-child{border-bottom:none;}
.nbp-item:hover{background:#f9fafb;}
.nbp-item:active{background:#f3f4f6;}
.nbp-item-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.nbp-item-text{flex:1;font-size:13px;font-weight:700;color:#1f2937;}
.nbp-item-arrow{font-size:12px;color:#d1d5db;}
.nbp-item.active .nbp-item-arrow{color:#ef4444;}
.nbp-item.active .nbp-item-text{color:#ef4444;}
.nbp-item.drag-active .nbp-item-text{color:#22c55e;}
.nbp-item.drag-active .nbp-item-arrow{color:#22c55e;}
.nbp-item.loaded .nbp-item-text{color:#22c55e;}
.nbp-item.loaded .nbp-item-arrow{color:#22c55e;}
.nbp-item.disabled{opacity:0.35;pointer-events:none;}
.nbp-search{width:100%;padding:10px 14px;border:none;border-radius:12px;background:rgba(0,0,0,0.03);color:#1f2937;font-size:13px;outline:none;transition:all .2s;font-family:inherit;margin:8px 0 0;display:none;box-sizing:border-box;}
.nbp-search:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15);}
.nbp-search::placeholder{color:#c4c4c4;}
.nbp-results{background:#fff;border:1px solid rgba(0,0,0,0.04);border-radius:12px;max-height:160px;overflow-y:auto;margin-top:6px;display:none;box-shadow:0 4px 20px rgba(0,0,0,0.06);}
.nbp-results::-webkit-scrollbar{width:3px;}
.nbp-results::-webkit-scrollbar-thumb{background:rgba(0,0,0,.06);border-radius:3px;}
.nbp-result-item{padding:10px 14px;border-bottom:0.5px solid #f3f4f6;cursor:pointer;transition:background .12s;color:#6b7280;font-size:12px;}
.nbp-result-item:last-child{border-bottom:none;}
.nbp-result-item:hover{background:#f9fafb;color:#1f2937;}
.nbp-result-item b{color:#6366f1;font-size:13px;display:block;margin-bottom:1px;}
.nbp-result-item small{color:#9ca3af;}
.nbp-img-preview{display:none;margin-top:6px;text-align:center;background:#fff;border:1px solid rgba(0,0,0,0.04);border-radius:12px;padding:8px;box-shadow:0 1px 2px rgba(0,0,0,0.03);}
.nbp-img-preview img{width:60px;height:60px;object-fit:contain;border-radius:8px;}
.nbp-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(15px);padding:10px 22px;border-radius:14px;font-size:13px;font-weight:700;z-index:9999999;opacity:0;transition:all .35s cubic-bezier(.4,0,.2,1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Cairo,sans-serif;backdrop-filter:blur(20px);pointer-events:none;white-space:nowrap;box-shadow:0 8px 30px rgba(0,0,0,0.1);}
.nbp-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.nbp-toast.success{background:#fff;color:#22c55e;border:1px solid rgba(34,197,94,0.1);}
.nbp-toast.error{background:#fff;color:#ef4444;border:1px solid rgba(239,68,68,0.1);}
.nbp-toast.info{background:#fff;color:#6366f1;border:1px solid rgba(99,102,241,0.1);}
.nbp-drag-outline{outline:2px dashed rgba(99,102,241,.4)!important;outline-offset:2px;cursor:move!important;}
.nbp-drag-active{opacity:.65;z-index:99999!important;box-shadow:0 15px 35px rgba(0,0,0,.15)!important;transition:none!important;}
.nbp-fab{width:52px;height:52px;display:none;align-items:center;justify-content:center;font-size:20px;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;box-shadow:0 8px 24px rgba(99,102,241,0.3);transition:transform .2s;}
.nbp-fab:hover{transform:scale(1.08);}
.nbp-dot{width:6px;height:6px;border-radius:50%;animation:nbpPulse 1.5s infinite;position:absolute;top:10px;right:10px;}
.nbp-dot-red{background:#ef4444;}
.nbp-dot-green{background:#22c55e;}
@keyframes nbpPulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes nbpSlideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
`;
d.head.appendChild(css);

function toast(msg,type){var t=d.createElement('div');t.className='nbp-toast '+type;t.textContent=msg;d.body.appendChild(t);requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('show')})});setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},350)},2200)}
function findT(){var ts=Array.from(d.querySelectorAll('table')).filter(function(t){return/Item Name|اسم الصنف/i.test(t.innerText)});return ts[0]||d.getElementsByTagName('table')[0]}

function performUndo() {
  if (undoStack.length === 0) {toast('لا يوجد عمليات للتراجع عنها', 'error');return;}
  var lastAction = undoStack.pop();
  if (lastAction.type === 'remove') {lastAction.parent.insertBefore(lastAction.element, lastAction.nextSibling);toast('تم استعادة العنصر المحذوف', 'success');}
  else if (lastAction.type === 'move') {lastAction.element.style.position = lastAction.oldStyle.position;lastAction.element.style.left = lastAction.oldStyle.left;lastAction.element.style.top = lastAction.oldStyle.top;toast('تم التراجع عن التحريك', 'success');}
  else if (lastAction.type === 'inject') {lastAction.element.remove();toast('تم التراجع عن الإضافة', 'success');}
  else if (lastAction.type === 'multi-remove') {lastAction.items.forEach(function(item) {item.parent.insertBefore(item.element, item.nextSibling);});toast('تم استعادة العناصر المحذوفة', 'success');}
}

/* CSV parser for manual upload fallback */
function parseCSVLocal(text){
    var lines=text.split(/\r?\n/).filter(function(l){return l.trim()});
    var sep=lines[0].includes('\t')?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
    var head=lines[0].split(sep).map(function(h){return h.toLowerCase().trim()});
    var iN=head.findIndex(function(h){return h.includes('name')||h.includes('اسم')});
    var iC=head.findIndex(function(h){return h.includes('code')||h.includes('كود')});
    iN=iN<0?0:iN;iC=iC<0?1:iC;
    return lines.slice(1).map(function(l){var c=l.split(sep);return{code:(c[iC]||'').replace(/"/g,'').trim(),name:(c[iN]||'').replace(/"/g,'').trim()}}).filter(function(i){return i.name});
}

var ui=d.createElement('div');ui.id='nahdi_baz_panel';
ui.innerHTML=
'<div class="nbp-header" id="nbp_header">'+
  ' <div class="nbp-logo"><div class="nbp-logo-icon">✏️</div><div><div class="nbp-title">Nahdi Editor</div><div class="nbp-ver">v3.0 — Cloud Edition</div></div></div>'+
  ' <div class="nbp-actions"><div class="nbp-act-btn" id="nbp_undo" title="تراجع">↩️</div><div class="nbp-act-btn" id="nbp_min">−</div><div class="nbp-act-btn" id="nbp_cls" style="background:rgba(239,68,68,0.08);color:#ef4444">✕</div></div>'+
'</div>'+
'<div class="nbp-fab" id="nbp_fab">✏️</div>'+
'<div class="nbp-body" id="nbp_body">'+
  ' <div class="nbp-grp"><div class="nbp-grp-title">أدوات التحرير</div>'+
    ' <div class="nbp-item" id="nbp_edit" style="position:relative"><div class="nbp-item-icon" style="background:rgba(99,102,241,0.06)">✏️</div><div class="nbp-item-text">تفعيل التعديل الحر</div><span class="nbp-item-arrow">‹</span></div>'+
    ' <div class="nbp-item" id="nbp_drag" style="position:relative"><div class="nbp-item-icon" style="background:rgba(139,92,246,0.06)">🔀</div><div class="nbp-item-text">تحريك العناصر</div><span class="nbp-item-arrow">‹</span></div>'+
    ' <div class="nbp-item" id="nbp_del_row" style="position:relative"><div class="nbp-item-icon" style="background:rgba(239,68,68,0.06)">✖️</div><div class="nbp-item-text">حذف صفوف الجدول</div><span class="nbp-item-arrow">‹</span></div>'+
  ' </div>'+
  ' <div class="nbp-grp"><div class="nbp-grp-title">عناصر الصفحة</div>'+
    ' <div class="nbp-item" id="nbp_qr"><div class="nbp-item-icon" style="background:rgba(239,68,68,0.06)">🗑️</div><div class="nbp-item-text">حذف الباركود والتذكير</div><span class="nbp-item-arrow">‹</span></div>'+
  ' </div>'+
  ' <div class="nbp-grp"><div class="nbp-grp-title">إدارة الأصناف</div>'+
    ' <div class="nbp-item" id="nbp_cloud_status"><div class="nbp-item-icon" style="background:rgba(99,102,241,0.06)">☁️</div><div class="nbp-item-text" id="nbp_cloud_text">جاري تحميل الأصناف...</div><span class="nbp-item-arrow" id="nbp_cloud_count"></span></div>'+
    ' <div style="padding:0 16px"><input type="text" class="nbp-search" id="nbp_search" placeholder="🔍 بحث بالاسم أو الكود..."><div class="nbp-results" id="nbp_results"></div></div>'+
    ' <label class="nbp-item" id="nbp_img_label" for="nbp_img" style="display:none"><div class="nbp-item-icon" style="background:rgba(59,130,246,0.06)">🖼️</div><div class="nbp-item-text">رفع صورة الصنف (اختياري)</div><span class="nbp-item-arrow">‹</span></label>'+
    ' <input type="file" id="nbp_img" accept="image/*" style="display:none">'+
    ' <div class="nbp-img-preview" id="nbp_img_preview" style="margin:0 16px"><img id="nbp_img_thumb" src="" alt=""></div>'+
    ' <div class="nbp-item" id="nbp_inject" style="display:none"><div class="nbp-item-icon" style="background:rgba(245,158,11,0.06)">✅</div><div class="nbp-item-text" style="color:#f59e0b;font-weight:800">حقن الصنف في الجدول</div><span class="nbp-item-arrow" style="color:#f59e0b">‹</span></div>'+
  ' </div>'+
  ' <div class="nbp-grp"><div class="nbp-grp-title">إدارة (أدمن)</div>'+
    ' <div class="nbp-item" id="nbp_admin"><div class="nbp-item-icon" style="background:rgba(245,158,11,0.06)">🔐</div><div class="nbp-item-text">رفع ملف أصناف جديد</div><span class="nbp-item-arrow">‹</span></div>'+
  ' </div>'+
  ' <div style="text-align:center;padding:10px 0 4px;font-size:9px;color:#9ca3af;font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';
d.body.appendChild(ui);requestAnimationFrame(function(){requestAnimationFrame(function(){ui.classList.add('show')})});

/* ── Panel drag ── */
var hdr=d.getElementById('nbp_header'),panDrag=false,panSX=0,panSY=0,panX=0,panY=0,panCurX=0,panCurY=0,panRAF=null;
var rect=ui.getBoundingClientRect();panX=rect.left;panY=rect.top;ui.style.right='auto';ui.style.left=panX+'px';ui.style.top=panY+'px';ui.style.willChange='transform';
function panAnimate(){if(!panDrag){panRAF=null;return}var dx=panCurX-panSX;var dy=panCurY-panSY;panX+=dx;panY+=dy;panX=Math.max(0,Math.min(window.innerWidth-60,panX));panY=Math.max(0,Math.min(window.innerHeight-40,panY));ui.style.left=panX+'px';ui.style.top=panY+'px';panSX=panCurX;panSY=panCurY;panRAF=requestAnimationFrame(panAnimate)}
hdr.addEventListener('mousedown',function(e){if(e.target.closest('.nbp-act-btn'))return;panDrag=true;panSX=e.clientX;panSY=e.clientY;panCurX=e.clientX;panCurY=e.clientY;hdr.classList.add('grabbing');ui.style.transition='none';e.preventDefault();if(!panRAF)panRAF=requestAnimationFrame(panAnimate)});
d.addEventListener('mousemove',function(e){if(panDrag){panCurX=e.clientX;panCurY=e.clientY}});
d.addEventListener('mouseup',function(){if(panDrag){panDrag=false;hdr.classList.remove('grabbing');ui.style.transition='opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease';if(panRAF){cancelAnimationFrame(panRAF);panRAF=null}}});

/* ── Close / Min / Fab ── */
d.getElementById('nbp_cls').onclick=function(){ui.style.transition='opacity .3s,transform .3s';ui.classList.remove('show');ui.style.transform='translateY(-10px) scale(.95)';setTimeout(function(){ui.remove();css.remove()},300)};
d.getElementById('nbp_undo').onclick=performUndo;
d.getElementById('nbp_min').onclick=function(){if(panelCollapsed)return;var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');body.style.display='none';fab.style.display='flex';ui.style.width='52px';ui.style.borderRadius='50%';ui.style.overflow='hidden';hdr.style.display='none';panelCollapsed=true};
d.getElementById('nbp_fab').onclick=function(){var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');body.style.display='block';fab.style.display='none';ui.style.width='340px';ui.style.borderRadius='22px';ui.style.overflow='visible';hdr.style.display='flex';panelCollapsed=false};

/* ── Edit mode ── */
d.getElementById('nbp_edit').onclick=function(){
  editOn=!editOn;d.body.contentEditable=editOn;
  var el=this;if(editOn){el.classList.add('active');el.querySelector('.nbp-item-text').textContent='إيقاف التعديل الحر';var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-red';el.appendChild(dot)}else{el.classList.remove('active');el.querySelector('.nbp-item-text').textContent='تفعيل التعديل الحر';var dot=el.querySelector('.nbp-dot');if(dot)dot.remove()}
  ui.contentEditable='false';toast(editOn?'تم تفعيل التعديل الحر':'تم إيقاف التعديل',editOn?'info':'success')};

/* ── Drag mode ── */
var dragHover=null,elDragRAF=null,elCurX=0,elCurY=0,oldDragStyle={};
function elAnimate(){if(!dragEl){elDragRAF=null;return}dragEl.style.left=(elCurX-dragOX)+'px';dragEl.style.top=(elCurY-dragOY)+'px';elDragRAF=requestAnimationFrame(elAnimate)}
function onDragOver(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;if(dragHover&&dragHover!==el)dragHover.classList.remove('nbp-drag-outline');el.classList.add('nbp-drag-outline');dragHover=el}
function onDragOut(e){if(e.target.classList)e.target.classList.remove('nbp-drag-outline')}
function onDragDown(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;e.preventDefault();e.stopPropagation();dragEl=el;oldDragStyle={position:el.style.position,left:el.style.left,top:el.style.top};el.classList.add('nbp-drag-active');el.classList.remove('nbp-drag-outline');if(!el.style.position||el.style.position==='static')el.style.position='relative';var cx=parseFloat(el.style.left)||0,cy=parseFloat(el.style.top)||0;dragOX=e.clientX-cx;dragOY=e.clientY-cy;elCurX=e.clientX;elCurY=e.clientY;if(!elDragRAF)elDragRAF=requestAnimationFrame(elAnimate)}
function onDragMove(e){if(dragEl){e.preventDefault();elCurX=e.clientX;elCurY=e.clientY}}
function onDragUp(){if(dragEl){undoStack.push({type:'move',element:dragEl,oldStyle:oldDragStyle});dragEl.classList.remove('nbp-drag-active');dragEl=null;if(elDragRAF){cancelAnimationFrame(elDragRAF);elDragRAF=null}}}

d.getElementById('nbp_drag').onclick=function(){
  dragOn=!dragOn;var el=this;
  if(dragOn){el.classList.add('drag-active');el.querySelector('.nbp-item-text').textContent='إيقاف تحريك العناصر';var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-green';el.appendChild(dot);d.addEventListener('mouseover',onDragOver,true);d.addEventListener('mouseout',onDragOut,true);d.addEventListener('mousedown',onDragDown,true);d.addEventListener('mousemove',onDragMove,true);d.addEventListener('mouseup',onDragUp,true);toast('وضع التحريك: امسك أي عنصر وحرّكه','info')}
  else{el.classList.remove('drag-active');el.querySelector('.nbp-item-text').textContent='تحريك العناصر';var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();d.removeEventListener('mouseover',onDragOver,true);d.removeEventListener('mouseout',onDragOut,true);d.removeEventListener('mousedown',onDragDown,true);d.removeEventListener('mousemove',onDragMove,true);d.removeEventListener('mouseup',onDragUp,true);if(dragHover){dragHover.classList.remove('nbp-drag-outline');dragHover=null}toast('تم إيقاف وضع التحريك','success')}};

/* ── Delete rows ── */
function onRowOver(e){var r=e.target.closest('tr');if(!r||r.closest('#nahdi_baz_panel'))return;r.style.outline='2px solid #ef4444';r.style.cursor='pointer';r.title='اضغط للحذف'}
function onRowOut(e){var r=e.target.closest('tr');if(r)r.style.outline=''}
function onRowClick(e){var r=e.target.closest('tr');if(!r||r.closest('#nahdi_baz_panel'))return;e.preventDefault();e.stopPropagation();undoStack.push({type:'remove',element:r,parent:r.parentNode,nextSibling:r.nextSibling});r.remove();toast('تم حذف الصف بنجاح','success')}
d.getElementById('nbp_del_row').onclick=function(){
  delRowOn=!delRowOn;var el=this;
  if(delRowOn){el.classList.add('active');el.querySelector('.nbp-item-text').textContent='إيقاف حذف الصفوف';var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-red';el.appendChild(dot);d.addEventListener('mouseover',onRowOver,true);d.addEventListener('mouseout',onRowOut,true);d.addEventListener('click',onRowClick,true);toast('وضع الحذف: اضغط على أي صف لحذفه','info');}
  else{el.classList.remove('active');el.querySelector('.nbp-item-text').textContent='حذف صفوف الجدول';var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();d.removeEventListener('mouseover',onRowOver,true);d.removeEventListener('mouseout',onRowOut,true);d.removeEventListener('click',onRowClick,true);toast('تم إيقاف وضع الحذف','success');}};

/* ── QR delete ── */
d.getElementById('nbp_qr').onclick=function(){
  var removedItems=[];
  var qr=d.getElementById('qrcode'),qa=d.getElementById('qr_ar'),qe=d.getElementById('qr_en');
  var qi=d.querySelector('img[src*="qr"],canvas,.qr-code,svg[class*="qr"]');
  [qr,qa,qe,qi].forEach(function(el){if(el&&el.parentNode){removedItems.push({element:el,parent:el.parentNode,nextSibling:el.nextSibling});el.remove();}});
  d.querySelectorAll('label,span,p,div').forEach(function(el){if(el.closest('#nahdi_baz_panel'))return;if(/امسح لادارة تذكير الجرعات|Scan to control your dose reminders/i.test(el.textContent.trim())){removedItems.push({element:el,parent:el.parentNode,nextSibling:el.nextSibling});el.remove();}});
  if(removedItems.length>0){undoStack.push({type:'multi-remove',items:removedItems});toast('تم حذف الباركود ونص التذكير','success');this.classList.add('disabled');this.querySelector('.nbp-item-text').textContent='✓ تم الحذف';}
  else{toast('لم يتم العثور على باركود','error');}};

/* ── Search & inject ── */
d.getElementById('nbp_search').oninput=function(){
  var q=this.value.toLowerCase(),res=d.getElementById('nbp_results');res.innerHTML='';
  if(q.length<2){res.style.display='none';return}
  var m=db.filter(function(i){return i.name.toLowerCase().includes(q)||i.code.includes(q)}).slice(0,10);
  m.forEach(function(i){var v=d.createElement('div');v.className='nbp-result-item';v.innerHTML='<b>'+i.name+'</b><small>'+i.code+'</small>';
    v.onclick=function(){selI=i;d.getElementById('nbp_search').value=i.name;res.style.display='none';d.getElementById('nbp_inject').style.display='flex';d.getElementById('nbp_img_label').style.display='flex'};res.appendChild(v)});
  res.style.display=m.length?'block':'none'};

d.getElementById('nbp_img').onchange=function(e){
  var file=e.target.files[0];if(!file)return;var r=new FileReader();
  r.onload=function(){selImg=this.result;var label=d.getElementById('nbp_img_label');label.querySelector('.nbp-item-text').textContent='✅ تم رفع الصورة';label.classList.add('loaded');var preview=d.getElementById('nbp_img_preview');d.getElementById('nbp_img_thumb').src=selImg;preview.style.display='block';toast('تم رفع الصورة بنجاح','success')};
  r.readAsDataURL(file)};

d.getElementById('nbp_inject').onclick=function(){
  if(!selI)return;var t=findT(),b=t.querySelector('tbody')||t,rows=b.querySelectorAll('tr');
  if(rows.length<1){toast('خطأ: لم يتم العثور على صفوف','error');return}
  var lr=rows[rows.length-1],nr=lr.cloneNode(true),tds=nr.querySelectorAll('td');
  if(tds.length>=2){var im=tds[0].querySelector('img');if(im){if(selImg){im.src=selImg;im.style.width='70px'}else{im.removeAttribute('src');im.style.width='70px';im.alt='—'}}else{tds[0].innerText=selI.code}tds[1].innerText=selI.name;for(var i=2;i<tds.length;i++)tds[i].innerText='-'}
  b.appendChild(nr);nr.style.animation='nbpSlideIn .25s ease';
  undoStack.push({type:'inject',element:nr});
  var hadImg=!!selImg;
  d.getElementById('nbp_search').value='';d.getElementById('nbp_inject').style.display='none';d.getElementById('nbp_img_label').style.display='none';d.getElementById('nbp_img_label').classList.remove('loaded');d.getElementById('nbp_img_label').querySelector('.nbp-item-text').textContent='رفع صورة الصنف (اختياري)';d.getElementById('nbp_img_preview').style.display='none';d.getElementById('nbp_img_thumb').src='';d.getElementById('nbp_img').value='';selI=null;selImg=null;
  toast(hadImg?'تم حقن الصنف مع الصورة ✅':'تم حقن الصنف بنجاح','success')};

/* ── Admin: upload new drugs file ── */
d.getElementById('nbp_admin').onclick=function(){
  var pin=prompt('الرقم السري للأدمن:');
  if(pin!==_ADMIN_PIN){if(pin!==null)toast('الرقم السري غلط','error');return;}
  var overlay=d.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif';
  var card=d.createElement('div');
  card.style.cssText='width:400px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.2);direction:rtl';
  card.innerHTML=
  '<div style="padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px">'+
    '<div style="font-size:22px">🔐</div><div style="flex:1"><div style="font-size:15px;font-weight:900;color:#1e1b4b">رفع ملف أصناف جديد</div><div style="font-size:10px;font-weight:700;color:#9ca3af">تشفير + رفع على جيتهاب</div></div>'+
    '<button id="nbp_adm_close" style="width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:#f3f4f6;font-size:14px">✕</button>'+
  '</div>'+
  '<div style="padding:18px 22px">'+
    '<div style="font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px">توكن جيتهاب:</div>'+
    '<input id="nbp_adm_token" type="password" placeholder="الصق التوكن" value="'+_ezGetGHToken()+'" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:12px;font-family:Cairo;direction:ltr;margin-bottom:12px;box-sizing:border-box;outline:none" />'+
    '<div style="font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px">ملف الأصناف:</div>'+
    '<input id="nbp_adm_file" type="file" accept=".xlsx,.xls,.csv" style="width:100%;padding:10px;border:2px dashed #e2e8f0;border-radius:10px;background:#f8fafc;font-size:12px;box-sizing:border-box;margin-bottom:8px" />'+
    '<div id="nbp_adm_info" style="font-size:11px;color:#64748b;margin-bottom:12px"></div>'+
    '<button id="nbp_adm_push" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5)">🔐 تشفير ورفع</button>'+
    '<div id="nbp_adm_status" style="padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;font-weight:700;margin-top:8px"></div>'+
  '</div>';
  overlay.appendChild(card);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
  d.body.appendChild(overlay);
  d.getElementById('nbp_adm_close').onclick=function(){overlay.remove()};
  var pendingDB=null;
  d.getElementById('nbp_adm_file').onchange=function(e){
    var file=e.target.files[0];if(!file)return;
    var info=d.getElementById('nbp_adm_info');info.textContent='جاري القراءة...';
    var fr=new FileReader();fr.onload=function(){
      pendingDB=parseCSVLocal(String(fr.result||''));
      if(pendingDB&&pendingDB.length){info.innerHTML='✅ تم قراءة <b>'+pendingDB.length+'</b> صنف';}
      else{info.textContent='❌ فشل القراءة';}
    };fr.readAsText(file);
  };
  d.getElementById('nbp_adm_push').onclick=async function(){
    var token=d.getElementById('nbp_adm_token').value.trim();
    if(!token){toast('ادخل التوكن','error');return;}
    localStorage.setItem('ez_gh_token',token);
    if(!pendingDB||!pendingDB.length){toast('ارفع الملف أولاً','error');return;}
    var btn=this;var st=d.getElementById('nbp_adm_status');
    btn.textContent='⏳ جاري التشفير...';btn.disabled=true;st.textContent='🔐 جاري تشفير '+pendingDB.length+' صنف...';
    var ok=await _ezPushDrugsToGH(pendingDB);
    if(ok){
      st.innerHTML='✅ تم رفع <b>'+pendingDB.length+'</b> صنف مشفر';
      db=pendingDB;
      d.getElementById('nbp_search').style.display='block';
      d.getElementById('nbp_cloud_text').textContent='☁️ '+db.length+' صنف محمّل';
      d.getElementById('nbp_cloud_count').textContent=db.length;
      toast('تم رفع '+pendingDB.length+' صنف مشفر','success');
    } else {st.textContent='❌ فشل الرفع';}
    btn.textContent='🔐 تشفير ورفع';btn.disabled=false;
  };
};

/* ══════════════════════════════════════════
   🚀 AUTO-LOAD DRUGS FROM GITHUB
   ══════════════════════════════════════════ */
(async function(){
  var cloudText=d.getElementById('nbp_cloud_text');
  var cloudCount=d.getElementById('nbp_cloud_count');
  var search=d.getElementById('nbp_search');
  cloudText.textContent='☁️ جاري تحميل الأصناف...';
  var list=await _ezFetchDrugsFromGH();
  if(list&&list.length){
    db=list;
    search.style.display='block';
    cloudText.textContent='☁️ '+db.length+' صنف محمّل';
    cloudCount.textContent=db.length;
    toast('تم تحميل '+db.length+' صنف من السحابة','success');
  } else {
    cloudText.textContent='⚠️ لا يوجد ملف أدوية — اضغط 🔐';
    cloudCount.textContent='';
  }
})();
})();

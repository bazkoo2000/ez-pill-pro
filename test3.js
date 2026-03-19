javascript:(function(){
/* ══════════════════════════════════════════════════════════════
   ✏️ Nahdi Editor v4.0 — Enhanced Cloud Edition
   Developed by ALI EL-BAZ
   ══════════════════════════════════════════════════════════════ */

// Cleanup previous instance
var old=document.getElementById('nahdi_baz_panel');if(old)old.remove();
var oldStyle=document.getElementById('nahdi_baz_styles');if(oldStyle)oldStyle.remove();

var d=document;

/* ── State Management ── */
var State = {
  db: [],
  editOn: false,
  dragOn: false,
  delRowOn: false,
  rowOrderOn: false,
  panelCollapsed: false,
  selectedItem: null,
  selectedImage: null,
  undoStack: [],
  MAX_UNDO: 50,
  searchTimer: null
};

/* ══════════════════════════════════════════
    ☁️ CLOUD CONFIG
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
  var retries=2;
  for(var attempt=0;attempt<=retries;attempt++){
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
      if(!resp.ok){var err=await resp.json();if(attempt<retries){await new Promise(function(r){setTimeout(r,1000)});continue;}toast('فشل الرفع ('+resp.status+'): '+(err.message||''),'error');return false;}
      return true;
    }catch(e){if(attempt<retries){await new Promise(function(r){setTimeout(r,1000)});continue;}toast('خطأ: '+e.message,'error');return false;}
  }
  return false;
}

/* ── Utilities ── */
function toast(msg,type){
  var t=d.createElement('div');t.className='nbp-toast '+type;t.textContent=msg;d.body.appendChild(t);
  requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('show')})});
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},350)},2200);
}

function findT(){
  var ts=Array.from(d.querySelectorAll('table')).filter(function(t){return/Item Name|اسم الصنف/i.test(t.innerText)});
  return ts[0]||d.getElementsByTagName('table')[0];
}

function debounce(fn, delay){
  return function(){
    var args=arguments,ctx=this;
    clearTimeout(State.searchTimer);
    State.searchTimer=setTimeout(function(){fn.apply(ctx,args)},delay);
  };
}

function pushUndo(action){
  State.undoStack.push(action);
  if(State.undoStack.length>State.MAX_UNDO) State.undoStack.shift();
  updateUndoBadge();
}

function updateUndoBadge(){
  var badge=d.getElementById('nbp_undo_badge');
  if(badge) badge.textContent=State.undoStack.length||'';
  if(badge) badge.style.display=State.undoStack.length?'flex':'none';
}

function performUndo(){
  if(State.undoStack.length===0){toast('لا يوجد عمليات للتراجع','error');return;}
  var last=State.undoStack.pop();
  if(last.type==='remove'){last.parent.insertBefore(last.element,last.nextSibling);toast('تم استعادة العنصر','success');}
  else if(last.type==='move'){last.element.style.position=last.oldStyle.position;last.element.style.left=last.oldStyle.left;last.element.style.top=last.oldStyle.top;toast('تم التراجع عن التحريك','success');}
  else if(last.type==='inject'){last.element.remove();toast('تم التراجع عن الإضافة','success');}
  else if(last.type==='multi-remove'){last.items.forEach(function(item){item.parent.insertBefore(item.element,item.nextSibling)});toast('تم استعادة العناصر','success');}
  updateUndoBadge();
}

function parseCSVLocal(text){
  var lines=text.split(/\r?\n/).filter(function(l){return l.trim()});
  if(!lines.length) return [];
  var sep=lines[0].includes('\t')?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
  var head=lines[0].split(sep).map(function(h){return h.toLowerCase().trim().replace(/^["']|["']$/g,'')});
  var iN=head.findIndex(function(h){return h.includes('name')||h.includes('اسم')});
  var iC=head.findIndex(function(h){return h.includes('code')||h.includes('كود')});
  iN=iN<0?0:iN;iC=iC<0?1:iC;
  return lines.slice(1).map(function(l){
    var c=l.split(sep);
    return{code:(c[iC]||'').replace(/^["']|["']$/g,'').trim(),name:(c[iN]||'').replace(/^["']|["']$/g,'').trim()};
  }).filter(function(i){return i.name});
}

/* ══════════════════════════════════════════
    🎨 STYLES
   ══════════════════════════════════════════ */
var css=d.createElement('style');css.id='nahdi_baz_styles';
css.textContent=`
#nahdi_baz_panel *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Cairo,Helvetica,sans-serif;}
#nahdi_baz_panel{position:fixed;top:14px;right:14px;z-index:999999;width:360px;border-radius:22px;overflow:visible;direction:rtl;opacity:0;transform:translateY(-12px) scale(.97);transition:opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease;background:rgba(243,244,246,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);}
#nahdi_baz_panel.show{opacity:1;transform:translateY(0) scale(1);}

/* Header */
.nbp-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 6px;cursor:grab;user-select:none;-webkit-user-select:none;}
.nbp-header.grabbing{cursor:grabbing;}
.nbp-logo{display:flex;align-items:center;gap:10px;}
.nbp-logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25);}
.nbp-title{color:#1f2937;font-size:15px;font-weight:800;}
.nbp-ver{font-size:10px;color:#9ca3af;font-weight:600;}
.nbp-actions{display:flex;gap:6px;align-items:center;}
.nbp-act-btn{width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .15s;position:relative;}
.nbp-act-btn:hover{background:rgba(0,0,0,0.1);color:#6b7280;}
.nbp-undo-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#6366f1;color:#fff;font-size:9px;font-weight:800;display:none;align-items:center;justify-content:center;}

/* Body */
.nbp-body{padding:10px 16px 14px;max-height:70vh;overflow-y:auto;overflow-x:hidden;}
.nbp-body::-webkit-scrollbar{width:3px;}
.nbp-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.08);border-radius:3px;}

/* Groups */
.nbp-grp{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03);margin-bottom:12px;}
.nbp-grp-title{font-size:10px;color:#9ca3af;font-weight:700;padding:10px 16px 4px;letter-spacing:0.3px;}

/* Items */
.nbp-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:0.5px solid #f3f4f6;cursor:pointer;transition:background 0.15s;}
.nbp-item:last-child{border-bottom:none;}
.nbp-item:hover{background:#f9fafb;}
.nbp-item:active{background:#f3f4f6;}
.nbp-item-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.nbp-item-text{flex:1;font-size:13px;font-weight:700;color:#1f2937;}
.nbp-item-arrow{font-size:12px;color:#d1d5db;}
.nbp-item.active .nbp-item-arrow,.nbp-item.active .nbp-item-text{color:#ef4444;}
.nbp-item.drag-active .nbp-item-text,.nbp-item.drag-active .nbp-item-arrow{color:#22c55e;}
.nbp-item.loaded .nbp-item-text,.nbp-item.loaded .nbp-item-arrow{color:#22c55e;}
.nbp-item.disabled{opacity:0.35;pointer-events:none;}

/* Search */
.nbp-search{width:100%;padding:10px 14px;border:none;border-radius:12px;background:rgba(0,0,0,0.03);color:#1f2937;font-size:13px;outline:none;transition:all .2s;font-family:inherit;display:none;box-sizing:border-box;}
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

/* ✅ INJECT CARD — The big redesign */
.nbp-inject-card{display:none;margin:10px 0 6px;border-radius:16px;overflow:hidden;border:2px solid #6366f1;background:linear-gradient(135deg,#faf5ff,#eef2ff);animation:nbpCardIn .3s ease;}
.nbp-inject-card.show{display:block;}
.nbp-inject-card-header{display:flex;align-items:center;gap:10px;padding:12px 14px 8px;position:relative;}
.nbp-inject-card-close{position:absolute;top:8px;left:8px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.nbp-inject-card-close:hover{background:rgba(239,68,68,0.1);color:#ef4444;}
.nbp-inject-card-icon{width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;}
.nbp-inject-card-info{flex:1;overflow:hidden;}
.nbp-inject-card-name{font-size:13px;font-weight:800;color:#1e1b4b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.nbp-inject-card-code{font-size:11px;color:#6366f1;font-weight:700;direction:ltr;text-align:right;}
.nbp-inject-card-body{padding:0 14px 12px;display:flex;gap:8px;align-items:stretch;}
.nbp-inject-img-btn{flex:0 0 60px;height:60px;border-radius:12px;border:2px dashed rgba(99,102,241,0.25);background:rgba(255,255,255,0.7);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:all .2s;overflow:hidden;position:relative;}
.nbp-inject-img-btn:hover{border-color:#6366f1;background:rgba(99,102,241,0.04);}
.nbp-inject-img-btn.has-img{border-style:solid;border-color:#22c55e;}
.nbp-inject-img-btn img{width:100%;height:100%;object-fit:contain;position:absolute;inset:0;}
.nbp-inject-img-btn span{font-size:18px;}
.nbp-inject-img-btn small{font-size:8px;color:#9ca3af;font-weight:700;}

/* ✅ THE BIG INJECT BUTTON */
.nbp-inject-btn{flex:1;border:none;border-radius:14px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:15px;font-weight:900;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;transition:all .2s;box-shadow:0 4px 15px rgba(34,197,94,0.3);min-height:60px;}
.nbp-inject-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,197,94,0.4);}
.nbp-inject-btn:active{transform:translateY(0);box-shadow:0 2px 8px rgba(34,197,94,0.3);}
.nbp-inject-btn .btn-icon{font-size:20px;}

/* Toast */
.nbp-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(15px);padding:10px 22px;border-radius:14px;font-size:13px;font-weight:700;z-index:9999999;opacity:0;transition:all .35s cubic-bezier(.4,0,.2,1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Cairo,sans-serif;backdrop-filter:blur(20px);pointer-events:none;white-space:nowrap;box-shadow:0 8px 30px rgba(0,0,0,0.1);}
.nbp-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.nbp-toast.success{background:#fff;color:#22c55e;border:1px solid rgba(34,197,94,0.1);}
.nbp-toast.error{background:#fff;color:#ef4444;border:1px solid rgba(239,68,68,0.1);}
.nbp-toast.info{background:#fff;color:#6366f1;border:1px solid rgba(99,102,241,0.1);}

/* Drag & reorder */
.nbp-drag-outline{outline:2px dashed rgba(99,102,241,.4)!important;outline-offset:2px;cursor:move!important;}
.nbp-drag-active{opacity:.65;z-index:99999!important;box-shadow:0 15px 35px rgba(0,0,0,.15)!important;transition:none!important;}
.nbp-row-ordering{background:rgba(99,102,241,0.1)!important;outline:2px solid #6366f1!important;cursor:ns-resize!important;}

/* FAB */
.nbp-fab{width:52px;height:52px;display:none;align-items:center;justify-content:center;font-size:20px;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;box-shadow:0 8px 24px rgba(99,102,241,0.3);transition:transform .2s;}
.nbp-fab:hover{transform:scale(1.08);}

/* Dots */
.nbp-dot{width:6px;height:6px;border-radius:50%;animation:nbpPulse 1.5s infinite;position:absolute;top:10px;right:10px;}
.nbp-dot-red{background:#ef4444;}
.nbp-dot-green{background:#22c55e;}

/* Animations */
@keyframes nbpPulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes nbpSlideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
@keyframes nbpCardIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

/* Confirm dialog */
.nbp-confirm-overlay{position:fixed;inset:0;background:rgba(15,15,35,0.5);backdrop-filter:blur(6px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:nbpFadeIn .2s ease;}
.nbp-confirm-box{background:#fff;border-radius:20px;padding:24px;width:320px;max-width:90vw;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);direction:rtl;font-family:Cairo,-apple-system,sans-serif;}
.nbp-confirm-icon{font-size:36px;margin-bottom:8px;}
.nbp-confirm-title{font-size:15px;font-weight:800;color:#1f2937;margin-bottom:6px;}
.nbp-confirm-msg{font-size:12px;color:#6b7280;margin-bottom:16px;line-height:1.6;}
.nbp-confirm-actions{display:flex;gap:8px;justify-content:center;}
.nbp-confirm-btn{flex:1;padding:10px;border-radius:12px;border:none;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .15s;}
.nbp-confirm-btn.danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 3px 10px rgba(239,68,68,0.2);}
.nbp-confirm-btn.cancel{background:#f3f4f6;color:#6b7280;}
.nbp-confirm-btn:hover{transform:translateY(-1px);}
@keyframes nbpFadeIn{from{opacity:0}to{opacity:1}}
`;
d.head.appendChild(css);

/* ── Confirm Dialog ── */
function confirm2(icon,title,msg,btnText){
  return new Promise(function(resolve){
    var overlay=d.createElement('div');overlay.className='nbp-confirm-overlay';
    overlay.innerHTML='<div class="nbp-confirm-box">'+
      '<div class="nbp-confirm-icon">'+icon+'</div>'+
      '<div class="nbp-confirm-title">'+title+'</div>'+
      '<div class="nbp-confirm-msg">'+msg+'</div>'+
      '<div class="nbp-confirm-actions">'+
        '<button class="nbp-confirm-btn danger" id="nbp_cf_yes">'+btnText+'</button>'+
        '<button class="nbp-confirm-btn cancel" id="nbp_cf_no">إلغاء</button>'+
      '</div></div>';
    d.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay){overlay.remove();resolve(false)}});
    d.getElementById('nbp_cf_yes').onclick=function(){overlay.remove();resolve(true)};
    d.getElementById('nbp_cf_no').onclick=function(){overlay.remove();resolve(false)};
  });
}

/* ══════════════════════════════════════════
    🏗️ BUILD UI
   ══════════════════════════════════════════ */
var ui=d.createElement('div');ui.id='nahdi_baz_panel';
ui.innerHTML=
'<div class="nbp-header" id="nbp_header">'+
  '<div class="nbp-logo"><div class="nbp-logo-icon">✏️</div><div><div class="nbp-title">Nahdi Editor</div><div class="nbp-ver">v4.0 — Enhanced Edition</div></div></div>'+
  '<div class="nbp-actions">'+
    '<div class="nbp-act-btn" id="nbp_undo" title="تراجع">↩️<span class="nbp-undo-badge" id="nbp_undo_badge"></span></div>'+
    '<div class="nbp-act-btn" id="nbp_min">−</div>'+
    '<div class="nbp-act-btn" id="nbp_cls" style="background:rgba(239,68,68,0.08);color:#ef4444">✕</div>'+
  '</div>'+
'</div>'+
'<div class="nbp-fab" id="nbp_fab">✏️</div>'+
'<div class="nbp-body" id="nbp_body">'+

  /* ── أدوات التحرير ── */
  '<div class="nbp-grp"><div class="nbp-grp-title">أدوات التحرير</div>'+
    '<div class="nbp-item" id="nbp_edit" style="position:relative"><div class="nbp-item-icon" style="background:rgba(99,102,241,0.06)">✏️</div><div class="nbp-item-text">تفعيل التعديل الحر</div><span class="nbp-item-arrow">‹</span></div>'+
    '<div class="nbp-item" id="nbp_drag" style="position:relative"><div class="nbp-item-icon" style="background:rgba(139,92,246,0.06)">🔀</div><div class="nbp-item-text">تحريك العناصر</div><span class="nbp-item-arrow">‹</span></div>'+
    '<div class="nbp-item" id="nbp_reorder_row" style="position:relative"><div class="nbp-item-icon" style="background:rgba(34,197,94,0.06)">↕️</div><div class="nbp-item-text">ترتيب صفوف الجدول</div><span class="nbp-item-arrow">‹</span></div>'+
    '<div class="nbp-item" id="nbp_del_row" style="position:relative"><div class="nbp-item-icon" style="background:rgba(239,68,68,0.06)">✖️</div><div class="nbp-item-text">حذف صفوف الجدول</div><span class="nbp-item-arrow">‹</span></div>'+
  '</div>'+

  /* ── عناصر الصفحة ── */
  '<div class="nbp-grp"><div class="nbp-grp-title">عناصر الصفحة</div>'+
    '<div class="nbp-item" id="nbp_qr"><div class="nbp-item-icon" style="background:rgba(239,68,68,0.06)">🗑️</div><div class="nbp-item-text">حذف الباركود والتذكير</div><span class="nbp-item-arrow">‹</span></div>'+
  '</div>'+

  /* ── اضافة صنف ── */
  '<div class="nbp-grp"><div class="nbp-grp-title">اضافة صنف</div>'+
    '<div class="nbp-item" id="nbp_cloud_status"><div class="nbp-item-icon" style="background:rgba(99,102,241,0.06)">☁️</div><div class="nbp-item-text" id="nbp_cloud_text">جاري تحميل الأصناف...</div><span class="nbp-item-arrow" id="nbp_cloud_count"></span></div>'+
    '<div style="padding:8px 16px 0">'+
      '<input type="text" class="nbp-search" id="nbp_search" placeholder="🔍 بحث بالاسم أو الكود...">'+
      '<div class="nbp-results" id="nbp_results"></div>'+
    '</div>'+

    /* ✅ NEW: Inject Card — appears when item is selected */
    '<div style="padding:0 16px">'+
      '<div class="nbp-inject-card" id="nbp_inject_card">'+
        '<div class="nbp-inject-card-header">'+
          '<button class="nbp-inject-card-close" id="nbp_inject_close">✕</button>'+
          '<div class="nbp-inject-card-icon">💊</div>'+
          '<div class="nbp-inject-card-info">'+
            '<div class="nbp-inject-card-name" id="nbp_sel_name">—</div>'+
            '<div class="nbp-inject-card-code" id="nbp_sel_code">—</div>'+
          '</div>'+
        '</div>'+
        '<div class="nbp-inject-card-body">'+
          '<label class="nbp-inject-img-btn" id="nbp_img_label" for="nbp_img">'+
            '<span id="nbp_img_icon">🖼️</span>'+
            '<small id="nbp_img_hint">صورة</small>'+
            '<img id="nbp_img_thumb" src="" alt="" style="display:none">'+
          '</label>'+
          '<input type="file" id="nbp_img" accept="image/*" style="display:none">'+
          '<button class="nbp-inject-btn" id="nbp_inject">'+
            '<span class="btn-icon">⬇️</span>'+
            'حقن الصنف في الجدول'+
          '</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'+

  /* ── إدارة ── */
  '<div class="nbp-grp"><div class="nbp-grp-title">إدارة (أدمن)</div>'+
    '<div class="nbp-item" id="nbp_admin"><div class="nbp-item-icon" style="background:rgba(245,158,11,0.06)">🔐</div><div class="nbp-item-text">رفع ملف أصناف جديد</div><span class="nbp-item-arrow">‹</span></div>'+
  '</div>'+

  '<div style="text-align:center;padding:10px 0 4px;font-size:9px;color:#9ca3af;font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';
d.body.appendChild(ui);
requestAnimationFrame(function(){requestAnimationFrame(function(){ui.classList.add('show')})});

/* ══════════════════════════════════════════
    🖱️ PANEL DRAG (Mouse + Touch)
   ══════════════════════════════════════════ */
var hdr=d.getElementById('nbp_header'),panDrag=false,panSX=0,panSY=0,panX=0,panY=0,panCurX=0,panCurY=0,panRAF=null;
var rect=ui.getBoundingClientRect();panX=rect.left;panY=rect.top;ui.style.right='auto';ui.style.left=panX+'px';ui.style.top=panY+'px';ui.style.willChange='transform';

function panAnimate(){if(!panDrag){panRAF=null;return}var dx=panCurX-panSX;var dy=panCurY-panSY;panX+=dx;panY+=dy;panX=Math.max(0,Math.min(window.innerWidth-60,panX));panY=Math.max(0,Math.min(window.innerHeight-40,panY));ui.style.left=panX+'px';ui.style.top=panY+'px';panSX=panCurX;panSY=panCurY;panRAF=requestAnimationFrame(panAnimate)}

function panStart(x,y){panDrag=true;panSX=x;panSY=y;panCurX=x;panCurY=y;hdr.classList.add('grabbing');ui.style.transition='none';if(!panRAF)panRAF=requestAnimationFrame(panAnimate)}
function panMove(x,y){if(panDrag){panCurX=x;panCurY=y}}
function panEnd(){if(panDrag){panDrag=false;hdr.classList.remove('grabbing');ui.style.transition='opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease';if(panRAF){cancelAnimationFrame(panRAF);panRAF=null}}}

hdr.addEventListener('mousedown',function(e){if(e.target.closest('.nbp-act-btn'))return;e.preventDefault();panStart(e.clientX,e.clientY)});
hdr.addEventListener('touchstart',function(e){if(e.target.closest('.nbp-act-btn'))return;var t=e.touches[0];panStart(t.clientX,t.clientY)},{passive:true});
d.addEventListener('mousemove',function(e){panMove(e.clientX,e.clientY)});
d.addEventListener('touchmove',function(e){if(panDrag){var t=e.touches[0];panMove(t.clientX,t.clientY)}},{passive:true});
d.addEventListener('mouseup',panEnd);
d.addEventListener('touchend',panEnd);

/* ── Close / Min / Fab ── */
d.getElementById('nbp_cls').onclick=function(){ui.style.transition='opacity .3s,transform .3s';ui.classList.remove('show');ui.style.transform='translateY(-10px) scale(.95)';setTimeout(function(){ui.remove();css.remove()},300)};
d.getElementById('nbp_undo').onclick=performUndo;

d.getElementById('nbp_min').onclick=function(){
  if(State.panelCollapsed)return;
  var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');
  body.style.display='none';fab.style.display='flex';
  ui.style.width='52px';ui.style.borderRadius='50%';ui.style.overflow='hidden';hdr.style.display='none';
  State.panelCollapsed=true;
};
d.getElementById('nbp_fab').onclick=function(){
  var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');
  body.style.display='block';fab.style.display='none';
  ui.style.width='360px';ui.style.borderRadius='22px';ui.style.overflow='visible';hdr.style.display='flex';
  State.panelCollapsed=false;
};

/* ══════════════════════════════════════════
    ✏️ EDIT MODE
   ══════════════════════════════════════════ */
d.getElementById('nbp_edit').onclick=function(){
  State.editOn=!State.editOn;d.body.contentEditable=State.editOn;
  var el=this;
  if(State.editOn){
    el.classList.add('active');el.querySelector('.nbp-item-text').textContent='إيقاف التعديل الحر';
    var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-red';el.appendChild(dot);
    ui.contentEditable='false';
  }else{
    el.classList.remove('active');el.querySelector('.nbp-item-text').textContent='تفعيل التعديل الحر';
    var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();
  }
  toast(State.editOn?'تم تفعيل التعديل الحر':'تم إيقاف التعديل',State.editOn?'info':'success');
};

/* ══════════════════════════════════════════
    🔀 DRAG MODE (Mouse + Touch)
   ══════════════════════════════════════════ */
var dragEl=null,dragOX=0,dragOY=0,dragHover=null,elDragRAF=null,elCurX=0,elCurY=0,oldDragStyle={};

function elAnimate(){if(!dragEl){elDragRAF=null;return}dragEl.style.left=(elCurX-dragOX)+'px';dragEl.style.top=(elCurY-dragOY)+'px';elDragRAF=requestAnimationFrame(elAnimate)}
function onDragOver(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;if(dragHover&&dragHover!==el)dragHover.classList.remove('nbp-drag-outline');el.classList.add('nbp-drag-outline');dragHover=el}
function onDragOut(e){if(e.target.classList)e.target.classList.remove('nbp-drag-outline')}

function startElDrag(el,x,y){
  dragEl=el;oldDragStyle={position:el.style.position,left:el.style.left,top:el.style.top};
  el.classList.add('nbp-drag-active');el.classList.remove('nbp-drag-outline');
  if(!el.style.position||el.style.position==='static')el.style.position='relative';
  var cx=parseFloat(el.style.left)||0,cy=parseFloat(el.style.top)||0;
  dragOX=x-cx;dragOY=y-cy;elCurX=x;elCurY=y;
  if(!elDragRAF)elDragRAF=requestAnimationFrame(elAnimate);
}
function onDragDown(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;e.preventDefault();e.stopPropagation();startElDrag(el,e.clientX,e.clientY)}
function onDragTouchStart(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;var t=e.touches[0];startElDrag(el,t.clientX,t.clientY)}
function onDragMove(e){if(dragEl){e.preventDefault();elCurX=e.clientX;elCurY=e.clientY}}
function onDragTouchMove(e){if(dragEl){var t=e.touches[0];elCurX=t.clientX;elCurY=t.clientY}}
function onDragUp(){if(dragEl){pushUndo({type:'move',element:dragEl,oldStyle:oldDragStyle});dragEl.classList.remove('nbp-drag-active');dragEl=null;if(elDragRAF){cancelAnimationFrame(elDragRAF);elDragRAF=null}}}

d.getElementById('nbp_drag').onclick=function(){
  State.dragOn=!State.dragOn;if(State.dragOn&&State.rowOrderOn)d.getElementById('nbp_reorder_row').click();
  var el=this;
  if(State.dragOn){
    el.classList.add('drag-active');el.querySelector('.nbp-item-text').textContent='إيقاف تحريك العناصر';
    var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-green';el.appendChild(dot);
    d.addEventListener('mouseover',onDragOver,true);d.addEventListener('mouseout',onDragOut,true);
    d.addEventListener('mousedown',onDragDown,true);d.addEventListener('mousemove',onDragMove,true);d.addEventListener('mouseup',onDragUp,true);
    d.addEventListener('touchstart',onDragTouchStart,{capture:true,passive:true});d.addEventListener('touchmove',onDragTouchMove,{capture:true,passive:true});d.addEventListener('touchend',onDragUp,true);
    toast('وضع التحريك: امسك أي عنصر وحرّكه','info');
  }else{
    el.classList.remove('drag-active');el.querySelector('.nbp-item-text').textContent='تحريك العناصر';
    var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();
    d.removeEventListener('mouseover',onDragOver,true);d.removeEventListener('mouseout',onDragOut,true);
    d.removeEventListener('mousedown',onDragDown,true);d.removeEventListener('mousemove',onDragMove,true);d.removeEventListener('mouseup',onDragUp,true);
    d.removeEventListener('touchstart',onDragTouchStart,true);d.removeEventListener('touchmove',onDragTouchMove,true);d.removeEventListener('touchend',onDragUp,true);
    if(dragHover){dragHover.classList.remove('nbp-drag-outline');dragHover=null}
    toast('تم إيقاف وضع التحريك','success');
  }
};

/* ══════════════════════════════════════════
    ↕️ ROW REORDER (Mouse + Touch)
   ══════════════════════════════════════════ */
var activeDraggedRow=null;
function getRowFrom(e){return(e.target||e).closest?e.target.closest('tr'):null}

function onRowOrderDown(e){var row=getRowFrom(e);if(!row||row.closest('#nahdi_baz_panel'))return;e.preventDefault();activeDraggedRow=row;row.classList.add('nbp-row-ordering')}
function onRowOrderTouchStart(e){var row=getRowFrom(e);if(!row||row.closest('#nahdi_baz_panel'))return;activeDraggedRow=row;row.classList.add('nbp-row-ordering')}
function onRowOrderMove(e){
  if(!activeDraggedRow)return;
  var el=d.elementFromPoint?d.elementFromPoint(e.clientX||0,e.clientY||0):e.target;
  var target=el?el.closest('tr'):null;
  if(target&&target!==activeDraggedRow&&target.parentNode===activeDraggedRow.parentNode){
    var parent=activeDraggedRow.parentNode;var children=Array.from(parent.children);
    if(children.indexOf(activeDraggedRow)<children.indexOf(target))parent.insertBefore(activeDraggedRow,target.nextSibling);
    else parent.insertBefore(activeDraggedRow,target);
  }
}
function onRowOrderTouchMove(e){
  if(!activeDraggedRow)return;
  var t=e.touches[0];var el=d.elementFromPoint(t.clientX,t.clientY);
  var target=el?el.closest('tr'):null;
  if(target&&target!==activeDraggedRow&&target.parentNode===activeDraggedRow.parentNode){
    var parent=activeDraggedRow.parentNode;var children=Array.from(parent.children);
    if(children.indexOf(activeDraggedRow)<children.indexOf(target))parent.insertBefore(activeDraggedRow,target.nextSibling);
    else parent.insertBefore(activeDraggedRow,target);
  }
}
function onRowOrderUp(){if(activeDraggedRow){activeDraggedRow.classList.remove('nbp-row-ordering');activeDraggedRow=null}}

d.getElementById('nbp_reorder_row').onclick=function(){
  State.rowOrderOn=!State.rowOrderOn;if(State.rowOrderOn&&State.dragOn)d.getElementById('nbp_drag').click();
  var el=this;
  if(State.rowOrderOn){
    el.classList.add('drag-active');el.querySelector('.nbp-item-text').textContent='إيقاف ترتيب الصفوف';
    var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-green';el.appendChild(dot);
    d.addEventListener('mousedown',onRowOrderDown,true);d.addEventListener('mousemove',onRowOrderMove,true);d.addEventListener('mouseup',onRowOrderUp,true);
    d.addEventListener('touchstart',onRowOrderTouchStart,{capture:true,passive:true});d.addEventListener('touchmove',onRowOrderTouchMove,{capture:true,passive:false});d.addEventListener('touchend',onRowOrderUp,true);
    toast('اسحب الصفوف لإعادة ترتيبها','info');
  }else{
    el.classList.remove('drag-active');el.querySelector('.nbp-item-text').textContent='ترتيب صفوف الجدول';
    var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();
    d.removeEventListener('mousedown',onRowOrderDown,true);d.removeEventListener('mousemove',onRowOrderMove,true);d.removeEventListener('mouseup',onRowOrderUp,true);
    d.removeEventListener('touchstart',onRowOrderTouchStart,true);d.removeEventListener('touchmove',onRowOrderTouchMove,true);d.removeEventListener('touchend',onRowOrderUp,true);
    toast('تم إيقاف وضع الترتيب','success');
  }
};

/* ══════════════════════════════════════════
    ✖️ DELETE ROWS (with confirmation)
   ══════════════════════════════════════════ */
function onRowOver(e){var r=e.target.closest('tr');if(!r||r.closest('#nahdi_baz_panel'))return;r.style.outline='2px solid #ef4444';r.style.cursor='pointer';r.title='اضغط للحذف'}
function onRowOut(e){var r=e.target.closest('tr');if(r)r.style.outline=''}
async function onRowClick(e){
  var r=e.target.closest('tr');if(!r||r.closest('#nahdi_baz_panel'))return;
  e.preventDefault();e.stopPropagation();
  var txt=r.textContent.trim().substring(0,50);
  var yes=await confirm2('🗑️','حذف الصف؟','هل تريد حذف هذا الصف؟\n«'+txt+'...»','نعم، احذف');
  if(yes){pushUndo({type:'remove',element:r,parent:r.parentNode,nextSibling:r.nextSibling});r.remove();toast('تم حذف الصف','success')}
}

d.getElementById('nbp_del_row').onclick=function(){
  State.delRowOn=!State.delRowOn;var el=this;
  if(State.delRowOn){
    el.classList.add('active');el.querySelector('.nbp-item-text').textContent='إيقاف حذف الصفوف';
    var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-red';el.appendChild(dot);
    d.addEventListener('mouseover',onRowOver,true);d.addEventListener('mouseout',onRowOut,true);d.addEventListener('click',onRowClick,true);
    toast('اضغط على أي صف لحذفه','info');
  }else{
    el.classList.remove('active');el.querySelector('.nbp-item-text').textContent='حذف صفوف الجدول';
    var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();
    d.removeEventListener('mouseover',onRowOver,true);d.removeEventListener('mouseout',onRowOut,true);d.removeEventListener('click',onRowClick,true);
    toast('تم إيقاف وضع الحذف','success');
  }
};

/* ══════════════════════════════════════════
    🗑️ QR DELETE
   ══════════════════════════════════════════ */
d.getElementById('nbp_qr').onclick=async function(){
  var yes=await confirm2('🗑️','حذف الباركود؟','سيتم حذف الباركود ونص التذكير من الصفحة','نعم، احذف');
  if(!yes)return;
  var removedItems=[];
  var qr=d.getElementById('qrcode'),qa=d.getElementById('qr_ar'),qe=d.getElementById('qr_en');
  var qi=d.querySelector('img[src*="qr"],canvas,.qr-code,svg[class*="qr"]');
  [qr,qa,qe,qi].forEach(function(el){if(el&&el.parentNode){removedItems.push({element:el,parent:el.parentNode,nextSibling:el.nextSibling});el.remove()}});
  d.querySelectorAll('label,span,p,div').forEach(function(el){if(el.closest('#nahdi_baz_panel'))return;if(/امسح لادارة تذكير الجرعات|Scan to control your dose reminders/i.test(el.textContent.trim())){removedItems.push({element:el,parent:el.parentNode,nextSibling:el.nextSibling});el.remove()}});
  if(removedItems.length>0){pushUndo({type:'multi-remove',items:removedItems});toast('تم حذف الباركود والتذكير','success')}
  else{toast('لم يتم العثور على باركود','error')}
};

/* ══════════════════════════════════════════
    🔍 SEARCH & INJECT (Redesigned)
   ══════════════════════════════════════════ */
var searchFn=debounce(function(q){
  var res=d.getElementById('nbp_results');res.innerHTML='';
  if(q.length<2){res.style.display='none';return}
  var m=State.db.filter(function(i){return i.name.toLowerCase().includes(q)||i.code.includes(q)}).slice(0,10);
  m.forEach(function(i){
    var v=d.createElement('div');v.className='nbp-result-item';
    v.innerHTML='<b>'+i.name+'</b><small>'+i.code+'</small>';
    v.onclick=function(){selectItem(i);res.style.display='none'};
    res.appendChild(v);
  });
  res.style.display=m.length?'block':'none';
},200);

d.getElementById('nbp_search').oninput=function(){searchFn(this.value.toLowerCase())};

function selectItem(item){
  State.selectedItem=item;
  State.selectedImage=null;
  d.getElementById('nbp_search').value=item.name;
  d.getElementById('nbp_sel_name').textContent=item.name;
  d.getElementById('nbp_sel_code').textContent=item.code;

  /* Reset image */
  var imgLabel=d.getElementById('nbp_img_label');
  imgLabel.classList.remove('has-img');
  d.getElementById('nbp_img_icon').style.display='';
  d.getElementById('nbp_img_hint').style.display='';
  d.getElementById('nbp_img_thumb').style.display='none';
  d.getElementById('nbp_img_thumb').src='';
  d.getElementById('nbp_img').value='';

  /* Show card */
  var card=d.getElementById('nbp_inject_card');
  card.classList.add('show');

  /* Scroll to make card visible */
  setTimeout(function(){card.scrollIntoView({behavior:'smooth',block:'nearest'})},100);
}

function clearSelection(){
  State.selectedItem=null;State.selectedImage=null;
  d.getElementById('nbp_inject_card').classList.remove('show');
  d.getElementById('nbp_search').value='';
  d.getElementById('nbp_img').value='';
}

d.getElementById('nbp_inject_close').onclick=clearSelection;

d.getElementById('nbp_img').onchange=function(e){
  var file=e.target.files[0];if(!file)return;
  var r=new FileReader();
  r.onload=function(){
    State.selectedImage=this.result;
    var label=d.getElementById('nbp_img_label');
    label.classList.add('has-img');
    d.getElementById('nbp_img_icon').style.display='none';
    d.getElementById('nbp_img_hint').style.display='none';
    var thumb=d.getElementById('nbp_img_thumb');
    thumb.src=State.selectedImage;thumb.style.display='block';
    toast('تم رفع الصورة','success');
  };
  r.readAsDataURL(file);
};

/* ✅ THE INJECT ACTION */
d.getElementById('nbp_inject').onclick=function(){
  if(!State.selectedItem)return;
  var t=findT();if(!t){toast('لم يتم العثور على جدول','error');return}
  var b=t.querySelector('tbody')||t,rows=b.querySelectorAll('tr');
  if(rows.length<1){toast('لم يتم العثور على صفوف','error');return}
  var lr=rows[rows.length-1],nr=lr.cloneNode(true),tds=nr.querySelectorAll('td');
  if(tds.length>=2){
    var im=tds[0].querySelector('img');
    if(im){
      if(State.selectedImage){im.src=State.selectedImage;im.style.width='70px'}
      else{im.removeAttribute('src');im.style.width='70px';im.alt='—'}
    }else{tds[0].innerText=State.selectedItem.code}
    tds[1].innerText=State.selectedItem.name;
    for(var i=2;i<tds.length;i++)tds[i].innerText='-';
  }
  b.appendChild(nr);nr.style.animation='nbpSlideIn .25s ease';
  pushUndo({type:'inject',element:nr});
  var hadImg=!!State.selectedImage;
  clearSelection();
  toast(hadImg?'تم حقن الصنف مع الصورة ✅':'تم حقن الصنف بنجاح ✅','success');
};

/* ══════════════════════════════════════════
    🔐 ADMIN PANEL
   ══════════════════════════════════════════ */
d.getElementById('nbp_admin').onclick=function(){
  var pin=prompt('الرقم السري للأدمن:');
  if(pin!==_ADMIN_PIN){if(pin!==null)toast('الرقم السري غلط','error');return}

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
      if(pendingDB&&pendingDB.length)info.innerHTML='✅ تم قراءة <b>'+pendingDB.length+'</b> صنف';
      else info.textContent='❌ فشل القراءة';
    };fr.readAsText(file);
  };

  d.getElementById('nbp_adm_push').onclick=async function(){
    var token=d.getElementById('nbp_adm_token').value.trim();
    if(!token){toast('ادخل التوكن','error');return}
    localStorage.setItem('ez_gh_token',token);
    if(!pendingDB||!pendingDB.length){toast('ارفع الملف أولاً','error');return}
    var btn=this;var st=d.getElementById('nbp_adm_status');
    btn.textContent='⏳ جاري التشفير...';btn.disabled=true;
    st.textContent='🔐 جاري تشفير '+pendingDB.length+' صنف...';
    var ok=await _ezPushDrugsToGH(pendingDB);
    if(ok){
      st.innerHTML='✅ تم رفع <b>'+pendingDB.length+'</b> صنف مشفر';
      State.db=pendingDB;
      d.getElementById('nbp_search').style.display='block';
      d.getElementById('nbp_cloud_text').textContent='☁️ '+State.db.length+' صنف محمّل';
      d.getElementById('nbp_cloud_count').textContent=State.db.length;
      toast('تم رفع '+pendingDB.length+' صنف مشفر','success');
    }else{st.textContent='❌ فشل الرفع'}
    btn.textContent='🔐 تشفير ورفع';btn.disabled=false;
  };
};

/* ══════════════════════════════════════════
    🚀 AUTO-LOAD DRUGS
   ══════════════════════════════════════════ */
(async function(){
  var cloudText=d.getElementById('nbp_cloud_text');
  var cloudCount=d.getElementById('nbp_cloud_count');
  var search=d.getElementById('nbp_search');
  cloudText.textContent='☁️ جاري تحميل الأصناف...';
  var list=await _ezFetchDrugsFromGH();
  if(list&&list.length){
    State.db=list;search.style.display='block';
    cloudText.textContent='☁️ '+State.db.length+' صنف محمّل';
    cloudCount.textContent=State.db.length;
    toast('تم تحميل '+State.db.length+' صنف من السحابة','success');
  }else{
    cloudText.textContent='⚠️ لا يوجد ملف أدوية — اضغط 🔐';
    cloudCount.textContent='';
  }
})();

})();

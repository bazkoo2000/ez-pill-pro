javascript:(function(){
var old=document.getElementById('nahdi_baz_panel');if(old)old.remove();
var oldStyle=document.getElementById('nahdi_baz_styles');if(oldStyle)oldStyle.remove();
var d=document,db=[],editOn=false,dragOn=false,selI=null,selImg=null,dragEl=null,dragOX=0,dragOY=0,panelCollapsed=false;

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

var ui=d.createElement('div');ui.id='nahdi_baz_panel';
ui.innerHTML=
'<div class="nbp-header" id="nbp_header">'+
  '<div class="nbp-logo"><div class="nbp-logo-icon">✏️</div><div><div class="nbp-title">Nahdi Editor</div><div class="nbp-ver">v2.3 — iOS Edition</div></div></div>'+
  '<div class="nbp-actions"><div class="nbp-act-btn" id="nbp_min">−</div><div class="nbp-act-btn" id="nbp_cls" style="background:rgba(239,68,68,0.08);color:#ef4444">✕</div></div>'+
'</div>'+
'<div class="nbp-fab" id="nbp_fab">✏️</div>'+
'<div class="nbp-body" id="nbp_body">'+
  '<div class="nbp-grp"><div class="nbp-grp-title">أدوات التحرير</div>'+
    '<div class="nbp-item" id="nbp_edit" style="position:relative"><div class="nbp-item-icon" style="background:rgba(99,102,241,0.06)">✏️</div><div class="nbp-item-text">تفعيل التعديل الحر</div><span class="nbp-item-arrow">‹</span></div>'+
    '<div class="nbp-item" id="nbp_drag" style="position:relative"><div class="nbp-item-icon" style="background:rgba(139,92,246,0.06)">🔀</div><div class="nbp-item-text">تحريك العناصر</div><span class="nbp-item-arrow">‹</span></div>'+
  '</div>'+
  '<div class="nbp-grp"><div class="nbp-grp-title">عناصر الصفحة</div>'+
    '<div class="nbp-item" id="nbp_qr"><div class="nbp-item-icon" style="background:rgba(239,68,68,0.06)">🗑️</div><div class="nbp-item-text">حذف الباركود والتذكير</div><span class="nbp-item-arrow">‹</span></div>'+
  '</div>'+
  '<div class="nbp-grp"><div class="nbp-grp-title">إدارة الأصناف</div>'+
    '<label class="nbp-item" id="nbp_csv_label" for="nbp_csv"><div class="nbp-item-icon" style="background:rgba(34,197,94,0.06)">📁</div><div class="nbp-item-text">رفع ملف الأصناف (CSV)</div><span class="nbp-item-arrow">‹</span></label>'+
    '<input type="file" id="nbp_csv" accept=".csv" style="display:none">'+
    '<div style="padding:0 16px"><input type="text" class="nbp-search" id="nbp_search" placeholder="🔍 بحث بالاسم أو الكود..."><div class="nbp-results" id="nbp_results"></div></div>'+
    '<label class="nbp-item" id="nbp_img_label" for="nbp_img" style="display:none"><div class="nbp-item-icon" style="background:rgba(59,130,246,0.06)">🖼️</div><div class="nbp-item-text">رفع صورة الصنف (اختياري)</div><span class="nbp-item-arrow">‹</span></label>'+
    '<input type="file" id="nbp_img" accept="image/*" style="display:none">'+
    '<div class="nbp-img-preview" id="nbp_img_preview" style="margin:0 16px"><img id="nbp_img_thumb" src="" alt=""></div>'+
    '<div class="nbp-item" id="nbp_inject" style="display:none"><div class="nbp-item-icon" style="background:rgba(245,158,11,0.06)">✅</div><div class="nbp-item-text" style="color:#f59e0b;font-weight:800">حقن الصنف في الجدول</div><span class="nbp-item-arrow" style="color:#f59e0b">‹</span></div>'+
  '</div>'+
  '<div style="text-align:center;padding:10px 0 4px;font-size:9px;color:#9ca3af;font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';
d.body.appendChild(ui);requestAnimationFrame(function(){requestAnimationFrame(function(){ui.classList.add('show')})});

var hdr=d.getElementById('nbp_header'),panDrag=false,panSX=0,panSY=0,panX=0,panY=0,panCurX=0,panCurY=0,panRAF=null;
var rect=ui.getBoundingClientRect();panX=rect.left;panY=rect.top;ui.style.right='auto';ui.style.left=panX+'px';ui.style.top=panY+'px';ui.style.willChange='transform';
function panAnimate(){if(!panDrag){panRAF=null;return}var dx=panCurX-panSX;var dy=panCurY-panSY;panX+=dx;panY+=dy;panX=Math.max(0,Math.min(window.innerWidth-60,panX));panY=Math.max(0,Math.min(window.innerHeight-40,panY));ui.style.left=panX+'px';ui.style.top=panY+'px';panSX=panCurX;panSY=panCurY;panRAF=requestAnimationFrame(panAnimate)}
hdr.addEventListener('mousedown',function(e){if(e.target.closest('.nbp-act-btn'))return;panDrag=true;panSX=e.clientX;panSY=e.clientY;panCurX=e.clientX;panCurY=e.clientY;hdr.classList.add('grabbing');ui.style.transition='none';e.preventDefault();if(!panRAF)panRAF=requestAnimationFrame(panAnimate)});
d.addEventListener('mousemove',function(e){if(panDrag){panCurX=e.clientX;panCurY=e.clientY}});
d.addEventListener('mouseup',function(){if(panDrag){panDrag=false;hdr.classList.remove('grabbing');ui.style.transition='opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease';if(panRAF){cancelAnimationFrame(panRAF);panRAF=null}}});

d.getElementById('nbp_cls').onclick=function(){ui.style.transition='opacity .3s,transform .3s';ui.classList.remove('show');ui.style.transform='translateY(-10px) scale(.95)';setTimeout(function(){ui.remove();css.remove()},300)};
d.getElementById('nbp_min').onclick=function(){if(panelCollapsed)return;var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');body.style.display='none';fab.style.display='flex';ui.style.width='52px';ui.style.borderRadius='50%';ui.style.overflow='hidden';hdr.style.display='none';panelCollapsed=true};
d.getElementById('nbp_fab').onclick=function(){var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');body.style.display='block';fab.style.display='none';ui.style.width='340px';ui.style.borderRadius='22px';ui.style.overflow='visible';hdr.style.display='flex';panelCollapsed=false};

d.getElementById('nbp_edit').onclick=function(){
  editOn=!editOn;d.body.contentEditable=editOn;
  var el=this;if(editOn){el.classList.add('active');el.querySelector('.nbp-item-text').textContent='إيقاف التعديل الحر';var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-red';el.appendChild(dot)}else{el.classList.remove('active');el.querySelector('.nbp-item-text').textContent='تفعيل التعديل الحر';var dot=el.querySelector('.nbp-dot');if(dot)dot.remove()}
  ui.contentEditable='false';toast(editOn?'تم تفعيل التعديل الحر':'تم إيقاف التعديل',editOn?'info':'success')};

var dragHover=null,elDragRAF=null,elCurX=0,elCurY=0;
function elAnimate(){if(!dragEl){elDragRAF=null;return}dragEl.style.left=(elCurX-dragOX)+'px';dragEl.style.top=(elCurY-dragOY)+'px';elDragRAF=requestAnimationFrame(elAnimate)}
function onDragOver(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;if(dragHover&&dragHover!==el)dragHover.classList.remove('nbp-drag-outline');el.classList.add('nbp-drag-outline');dragHover=el}
function onDragOut(e){if(e.target.classList)e.target.classList.remove('nbp-drag-outline')}
function onDragDown(e){var el=e.target;if(el.closest('#nahdi_baz_panel'))return;e.preventDefault();e.stopPropagation();dragEl=el;el.classList.add('nbp-drag-active');el.classList.remove('nbp-drag-outline');if(!el.style.position||el.style.position==='static')el.style.position='relative';var cx=parseFloat(el.style.left)||0,cy=parseFloat(el.style.top)||0;dragOX=e.clientX-cx;dragOY=e.clientY-cy;elCurX=e.clientX;elCurY=e.clientY;if(!elDragRAF)elDragRAF=requestAnimationFrame(elAnimate)}
function onDragMove(e){if(dragEl){e.preventDefault();elCurX=e.clientX;elCurY=e.clientY}}
function onDragUp(){if(dragEl){dragEl.classList.remove('nbp-drag-active');dragEl=null;if(elDragRAF){cancelAnimationFrame(elDragRAF);elDragRAF=null}}}

d.getElementById('nbp_drag').onclick=function(){
  dragOn=!dragOn;var el=this;
  if(dragOn){el.classList.add('drag-active');el.querySelector('.nbp-item-text').textContent='إيقاف تحريك العناصر';var dot=d.createElement('div');dot.className='nbp-dot nbp-dot-green';el.appendChild(dot);d.addEventListener('mouseover',onDragOver,true);d.addEventListener('mouseout',onDragOut,true);d.addEventListener('mousedown',onDragDown,true);d.addEventListener('mousemove',onDragMove,true);d.addEventListener('mouseup',onDragUp,true);toast('وضع التحريك: امسك أي عنصر وحرّكه','info')}
  else{el.classList.remove('drag-active');el.querySelector('.nbp-item-text').textContent='تحريك العناصر';var dot=el.querySelector('.nbp-dot');if(dot)dot.remove();d.removeEventListener('mouseover',onDragOver,true);d.removeEventListener('mouseout',onDragOut,true);d.removeEventListener('mousedown',onDragDown,true);d.removeEventListener('mousemove',onDragMove,true);d.removeEventListener('mouseup',onDragUp,true);if(dragHover){dragHover.classList.remove('nbp-drag-outline');dragHover=null}toast('تم إيقاف وضع التحريك','success')}};

d.getElementById('nbp_qr').onclick=function(){
  var rm=false;var qr=d.getElementById('qrcode'),qa=d.getElementById('qr_ar'),qe=d.getElementById('qr_en');var qi=d.querySelector('img[src*="qr"],canvas,.qr-code,svg[class*="qr"]');
  if(qr){qr.remove();rm=true}if(qa){qa.remove();rm=true}if(qe){qe.remove();rm=true}if(qi&&qi.parentNode){qi.remove();rm=true}
  d.querySelectorAll('label,span,p,div').forEach(function(el){if(el.closest('#nahdi_baz_panel'))return;if(/امسح لادارة تذكير الجرعات|Scan to control your dose reminders/i.test(el.textContent.trim())){el.remove();rm=true}});
  if(rm){toast('تم حذف الباركود ونص التذكير','success');this.classList.add('disabled');this.querySelector('.nbp-item-text').textContent='✓ تم الحذف'}
  else{toast('لم يتم العثور على باركود','error')}};

d.getElementById('nbp_csv').onchange=function(e){
  var r=new FileReader();r.onload=function(){
    var text=this.result,lines=text.split(/\r?\n/).filter(function(l){return l.trim()});
    var sep=lines[0].includes('\t')?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
    var head=lines[0].split(sep).map(function(h){return h.toLowerCase().trim()});
    var iN=head.findIndex(function(h){return h.includes('name')||h.includes('اسم')});
    var iC=head.findIndex(function(h){return h.includes('code')||h.includes('كود')});
    iN=iN<0?0:iN;iC=iC<0?1:iC;
    db=lines.slice(1).map(function(l){var c=l.split(sep);return{code:(c[iC]||'').replace(/"/g,'').trim(),name:(c[iN]||'').replace(/"/g,'').trim()}}).filter(function(i){return i.name});
    d.getElementById('nbp_search').style.display='block';
    var label=d.getElementById('nbp_csv_label');label.querySelector('.nbp-item-text').textContent='✅ تم تحميل '+db.length+' صنف';label.classList.add('loaded');
    toast('تم تحميل '+db.length+' صنف بنجاح','success');
  };r.readAsText(e.target.files[0])};

d.getElementById('nbp_search').oninput=function(){
  var q=this.value.toLowerCase(),res=d.getElementById('nbp_results');res.innerHTML='';
  if(q.length<2){res.style.display='none';return}
  var m=db.filter(function(i){return i.name.toLowerCase().includes(q)||i.code.includes(q)}).slice(0,10);
  m.forEach(function(i){var v=d.createElement('div');v.className='nbp-result-item';v.innerHTML='<b>'+i.name+'</b><small>Code: '+i.code+'</small>';
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
  var hadImg=!!selImg;
  d.getElementById('nbp_search').value='';d.getElementById('nbp_inject').style.display='none';d.getElementById('nbp_img_label').style.display='none';d.getElementById('nbp_img_label').classList.remove('loaded');d.getElementById('nbp_img_label').querySelector('.nbp-item-text').textContent='رفع صورة الصنف (اختياري)';d.getElementById('nbp_img_preview').style.display='none';d.getElementById('nbp_img_thumb').src='';d.getElementById('nbp_img').value='';selI=null;selImg=null;
  toast(hadImg?'تم حقن الصنف مع الصورة ✅':'تم حقن الصنف بنجاح','success')};
})();

javascript:(function(){
var old=document.getElementById('nahdi_baz_panel');if(old)old.remove();
var oldStyle=document.getElementById('nahdi_baz_styles');if(oldStyle)oldStyle.remove();

var d=document,db=[],editOn=false,dragOn=false,selI=null,selImg=null,dragEl=null,dragOX=0,dragOY=0,panelCollapsed=false;

var css=d.createElement('style');
css.id='nahdi_baz_styles';
css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
#nahdi_baz_panel *{box-sizing:border-box;font-family:'Tajawal',sans-serif;}
#nahdi_baz_panel{position:fixed;top:15px;right:15px;z-index:999999;width:320px;border-radius:18px;overflow:visible;direction:rtl;opacity:0;transform:translateY(-15px) scale(.97);transition:opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease;}
#nahdi_baz_panel.show{opacity:1;transform:translateY(0) scale(1);}
.nbp-glass{background:rgba(255,255,255,.92);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border:1px solid rgba(0,0,0,.06);box-shadow:0 12px 48px rgba(0,0,0,.1),0 2px 8px rgba(0,0,0,.04);}
.nbp-header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 10px;border-bottom:1px solid rgba(0,0,0,.05);cursor:grab;user-select:none;-webkit-user-select:none;}
.nbp-header.grabbing{cursor:grabbing;}
.nbp-logo{display:flex;align-items:center;gap:9px;}
.nbp-logo-icon{width:30px;height:30px;background:linear-gradient(135deg,#4f8ef7,#a78bfa);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(79,142,247,.3);}
.nbp-title{color:#1e293b;font-size:13.5px;font-weight:700;letter-spacing:-.2px;}
.nbp-ver{font-size:9.5px;color:#94a3b8;font-weight:400;}
.nbp-actions{display:flex;gap:5px;}
.nbp-act-btn{width:26px;height:26px;border-radius:7px;border:1px solid rgba(0,0,0,.06);background:rgba(0,0,0,.02);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s ease;}
.nbp-act-btn:hover{background:rgba(0,0,0,.06);color:#475569;}
.nbp-body{padding:10px 14px 14px;max-height:65vh;overflow-y:auto;overflow-x:hidden;}
.nbp-body::-webkit-scrollbar{width:3px;}
.nbp-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:3px;}
.nbp-section{margin-bottom:8px;}
.nbp-section-title{font-size:9.5px;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:7px;font-weight:600;}
.nbp-btn{width:100%;padding:10px 12px;border:none;border-radius:11px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s ease;display:flex;align-items:center;gap:9px;position:relative;overflow:hidden;outline:none;}
.nbp-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.08);}
.nbp-btn:active{transform:translateY(0);transition-duration:.08s;}
.nbp-btn-edit{background:linear-gradient(135deg,#eff6ff,#e0edff);color:#3b82f6;border:1px solid rgba(59,130,246,.12);}
.nbp-btn-edit.active{background:linear-gradient(135deg,#fef2f2,#fde8e8);color:#ef4444;border-color:rgba(239,68,68,.15);}
.nbp-btn-edit.active::after{content:'';position:absolute;top:7px;right:7px;width:5px;height:5px;border-radius:50%;background:#ef4444;animation:nbpPulse 1.5s infinite;}
.nbp-btn-drag{background:linear-gradient(135deg,#faf5ff,#f0e7ff);color:#8b5cf6;border:1px solid rgba(139,92,246,.1);}
.nbp-btn-drag.active{background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;border-color:rgba(22,163,74,.15);}
.nbp-btn-drag.active::after{content:'';position:absolute;top:7px;right:7px;width:5px;height:5px;border-radius:50%;background:#16a34a;animation:nbpPulse 1.5s infinite;}
.nbp-btn-qr{background:linear-gradient(135deg,#fff1f2,#ffe4e6);color:#e11d48;border:1px solid rgba(225,29,72,.1);}
.nbp-btn-csv{background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;border:1px solid rgba(22,163,74,.1);}
.nbp-btn-csv.loaded{border-color:rgba(22,163,74,.25);box-shadow:0 0 0 2px rgba(22,163,74,.08);}
.nbp-btn-img{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);color:#0284c7;border:1px solid rgba(2,132,199,.12);display:none;}
.nbp-btn-img.loaded{background:linear-gradient(135deg,#e0f2fe,#bae6fd);border-color:rgba(2,132,199,.3);box-shadow:0 0 0 2px rgba(2,132,199,.08);}
.nbp-btn-img .nbp-btn-icon{background:rgba(2,132,199,.08);}
.nbp-img-preview{display:none;margin-top:7px;text-align:center;background:#f8fafc;border:1px solid rgba(0,0,0,.06);border-radius:10px;padding:8px;}
.nbp-img-preview img{width:70px;height:70px;object-fit:contain;border-radius:6px;border:1px solid rgba(0,0,0,.06);}
.nbp-btn-inject{background:linear-gradient(135deg,#fffbeb,#fef3c7);color:#d97706;border:1px solid rgba(217,119,6,.12);display:none;}
.nbp-btn-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.nbp-btn-edit .nbp-btn-icon{background:rgba(59,130,246,.08);}
.nbp-btn-edit.active .nbp-btn-icon{background:rgba(239,68,68,.08);}
.nbp-btn-drag .nbp-btn-icon{background:rgba(139,92,246,.08);}
.nbp-btn-drag.active .nbp-btn-icon{background:rgba(22,163,74,.08);}
.nbp-btn-qr .nbp-btn-icon{background:rgba(225,29,72,.06);}
.nbp-btn-csv .nbp-btn-icon{background:rgba(22,163,74,.06);}
.nbp-btn-inject .nbp-btn-icon{background:rgba(217,119,6,.08);}
.nbp-search{width:100%;padding:9px 12px;border-radius:9px;border:1px solid rgba(0,0,0,.07);background:#f8fafc;color:#1e293b;font-size:12.5px;outline:none;transition:all .2s;display:none;font-family:'Tajawal',sans-serif;margin-top:7px;}
.nbp-search:focus{border-color:rgba(59,130,246,.35);background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.08);}
.nbp-search::placeholder{color:#b0bec5;}
.nbp-results{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:10px;max-height:170px;overflow-y:auto;margin-top:7px;display:none;box-shadow:0 4px 20px rgba(0,0,0,.06);}
.nbp-results::-webkit-scrollbar{width:3px;}
.nbp-results::-webkit-scrollbar-thumb{background:rgba(0,0,0,.08);border-radius:3px;}
.nbp-result-item{padding:9px 12px;border-bottom:1px solid rgba(0,0,0,.04);cursor:pointer;transition:all .12s;color:#475569;font-size:11.5px;}
.nbp-result-item:last-child{border-bottom:none;}
.nbp-result-item:hover{background:#f0f7ff;color:#1e293b;}
.nbp-result-item b{color:#3b82f6;font-size:12.5px;display:block;margin-bottom:1px;}
.nbp-result-item small{color:#94a3b8;}
.nbp-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.06),transparent);margin:10px 0;}
.nbp-credit{text-align:center;font-size:9px;color:#b0bec5;padding-top:3px;}
.nbp-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(15px);padding:10px 22px;border-radius:10px;font-size:12.5px;font-weight:600;z-index:9999999;opacity:0;transition:all .35s cubic-bezier(.4,0,.2,1);font-family:'Tajawal',sans-serif;backdrop-filter:blur(12px);pointer-events:none;white-space:nowrap;}
.nbp-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.nbp-toast.success{background:rgba(240,253,244,.95);color:#16a34a;border:1px solid rgba(22,163,74,.15);box-shadow:0 6px 20px rgba(22,163,74,.1);}
.nbp-toast.error{background:rgba(254,242,242,.95);color:#dc2626;border:1px solid rgba(220,38,38,.15);box-shadow:0 6px 20px rgba(220,38,38,.1);}
.nbp-toast.info{background:rgba(239,246,255,.95);color:#2563eb;border:1px solid rgba(37,99,235,.12);box-shadow:0 6px 20px rgba(37,99,235,.08);}
.nbp-drag-outline{outline:2px dashed rgba(139,92,246,.5)!important;outline-offset:2px;cursor:move!important;}
.nbp-drag-active{opacity:.65;z-index:99999!important;box-shadow:0 15px 35px rgba(0,0,0,.18)!important;transition:none!important;}
.nbp-fab{width:52px;height:52px;display:none;align-items:center;justify-content:center;font-size:22px;cursor:pointer;background:linear-gradient(135deg,#4f8ef7,#a78bfa);border-radius:50%;box-shadow:0 6px 24px rgba(79,142,247,.35);transition:transform .2s;}
.nbp-fab:hover{transform:scale(1.08);}
@keyframes nbpPulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes nbpSlideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
.nbp-btn{animation:nbpSlideIn .25s ease both;}
.nbp-section:nth-child(1) .nbp-btn:nth-child(2){animation-delay:.04s;}
.nbp-section:nth-child(1) .nbp-btn:nth-child(3){animation-delay:.08s;}
.nbp-section:nth-child(2) .nbp-btn{animation-delay:.12s;}
.nbp-section:nth-child(3) .nbp-btn{animation-delay:.16s;}
`;
d.head.appendChild(css);

function toast(msg,type){
  var t=d.createElement('div');t.className='nbp-toast '+type;t.textContent=msg;
  d.body.appendChild(t);
  requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('show')})});
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},350)},2200);
}

function findT(){
  var ts=Array.from(d.querySelectorAll('table')).filter(function(t){return/Item Name|اسم الصنف/i.test(t.innerText)});
  return ts[0]||d.getElementsByTagName('table')[0];
}

var ui=d.createElement('div');ui.id='nahdi_baz_panel';ui.className='nbp-glass';
ui.innerHTML=
'<div class="nbp-header" id="nbp_header">'+
  '<div class="nbp-logo"><div class="nbp-logo-icon">⚡</div><div><div class="nbp-title">Nahdi Editor Pro</div><div class="nbp-ver">v2.2 — Light</div></div></div>'+
  '<div class="nbp-actions"><div class="nbp-act-btn" id="nbp_min" title="تصغير">—</div><div class="nbp-act-btn" id="nbp_cls" title="إغلاق">✕</div></div>'+
'</div>'+
'<div class="nbp-fab" id="nbp_fab">⚡</div>'+
'<div class="nbp-body" id="nbp_body">'+
  '<div class="nbp-section"><div class="nbp-section-title">أدوات التحرير</div>'+
    '<button class="nbp-btn nbp-btn-edit" id="nbp_edit"><span class="nbp-btn-icon">✏️</span><span>تفعيل التعديل الحر</span></button>'+
    '<div style="height:5px"></div>'+
    '<button class="nbp-btn nbp-btn-drag" id="nbp_drag"><span class="nbp-btn-icon">🔀</span><span>تحريك العناصر</span></button>'+
  '</div>'+
  '<div class="nbp-divider"></div>'+
  '<div class="nbp-section"><div class="nbp-section-title">عناصر الصفحة</div>'+
    '<button class="nbp-btn nbp-btn-qr" id="nbp_qr"><span class="nbp-btn-icon">🗑️</span><span>حذف الباركود والتذكير</span></button>'+
  '</div>'+
  '<div class="nbp-divider"></div>'+
  '<div class="nbp-section"><div class="nbp-section-title">إدارة الأصناف</div>'+
    '<label class="nbp-btn nbp-btn-csv" id="nbp_csv_label" for="nbp_csv"><span class="nbp-btn-icon">📁</span><span>رفع ملف الأصناف (CSV)</span></label>'+
    '<input type="file" id="nbp_csv" accept=".csv" style="display:none">'+
    '<input type="text" class="nbp-search" id="nbp_search" placeholder="🔍 بحث بالاسم أو الكود...">'+
    '<div class="nbp-results" id="nbp_results"></div>'+
    '<div style="height:5px"></div>'+
    '<label class="nbp-btn nbp-btn-img" id="nbp_img_label" for="nbp_img"><span class="nbp-btn-icon">🖼️</span><span>رفع صورة الصنف (اختياري)</span></label>'+
    '<input type="file" id="nbp_img" accept="image/*" style="display:none">'+
    '<div class="nbp-img-preview" id="nbp_img_preview"><img id="nbp_img_thumb" src="" alt="preview"></div>'+
    '<div style="height:5px"></div>'+
    '<button class="nbp-btn nbp-btn-inject" id="nbp_inject"><span class="nbp-btn-icon">✅</span><span>حقن الصنف في الجدول</span></button>'+
  '</div>'+
  '<div class="nbp-divider"></div>'+
  '<div class="nbp-credit">Dev: Ali Al-Baz ⚡ Enhanced Edition</div>'+
'</div>';
d.body.appendChild(ui);
requestAnimationFrame(function(){requestAnimationFrame(function(){ui.classList.add('show')})});

/* ===== SMOOTH PANEL DRAG ===== */
var hdr=d.getElementById('nbp_header'),panDrag=false,panSX=0,panSY=0,panX=0,panY=0,panCurX=0,panCurY=0,panRAF=null;
var rect=ui.getBoundingClientRect();
panX=rect.left;panY=rect.top;
ui.style.right='auto';ui.style.left=panX+'px';ui.style.top=panY+'px';
ui.style.willChange='transform';ui.style.transform='translateX(0) translateY(0)';

function panAnimate(){
  if(!panDrag){panRAF=null;return}
  var dx=panCurX-panSX;var dy=panCurY-panSY;
  panX+=dx;panY+=dy;
  panX=Math.max(0,Math.min(window.innerWidth-60,panX));
  panY=Math.max(0,Math.min(window.innerHeight-40,panY));
  ui.style.left=panX+'px';ui.style.top=panY+'px';
  panSX=panCurX;panSY=panCurY;
  panRAF=requestAnimationFrame(panAnimate);
}
hdr.addEventListener('mousedown',function(e){
  if(e.target.closest('.nbp-act-btn'))return;
  panDrag=true;panSX=e.clientX;panSY=e.clientY;panCurX=e.clientX;panCurY=e.clientY;
  hdr.classList.add('grabbing');
  ui.style.transition='none';
  e.preventDefault();
  if(!panRAF)panRAF=requestAnimationFrame(panAnimate);
});
d.addEventListener('mousemove',function(e){if(panDrag){panCurX=e.clientX;panCurY=e.clientY}});
d.addEventListener('mouseup',function(){
  if(panDrag){panDrag=false;hdr.classList.remove('grabbing');
  ui.style.transition='opacity .35s ease,transform .35s ease,width .3s ease,border-radius .3s ease';
  if(panRAF){cancelAnimationFrame(panRAF);panRAF=null}}
});

/* ===== CLOSE & MINIMIZE ===== */
d.getElementById('nbp_cls').onclick=function(){
  ui.style.transition='opacity .3s ease,transform .3s ease';
  ui.classList.remove('show');ui.style.transform='translateY(-10px) scale(.95)';
  setTimeout(function(){ui.remove();css.remove()},300);
};
d.getElementById('nbp_min').onclick=function(){
  if(panelCollapsed)return;
  var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');
  body.style.display='none';fab.style.display='flex';
  ui.style.width='52px';ui.style.borderRadius='50%';ui.style.overflow='hidden';
  hdr.style.display='none';panelCollapsed=true;
};
d.getElementById('nbp_fab').onclick=function(){
  var body=d.getElementById('nbp_body'),fab=d.getElementById('nbp_fab');
  body.style.display='block';fab.style.display='none';
  ui.style.width='320px';ui.style.borderRadius='18px';ui.style.overflow='visible';
  hdr.style.display='flex';panelCollapsed=false;
};

/* ===== FREE EDIT ===== */
d.getElementById('nbp_edit').onclick=function(){
  editOn=!editOn;d.body.contentEditable=editOn;
  this.classList.toggle('active',editOn);
  this.querySelector('span:last-child').textContent=editOn?'إيقاف التعديل الحر':'تفعيل التعديل الحر';
  ui.contentEditable='false';
  toast(editOn?'تم تفعيل التعديل الحر':'تم إيقاف التعديل',editOn?'info':'success');
};

/* ===== DRAG ELEMENTS (smooth) ===== */
var dragHover=null,elDragRAF=null,elCurX=0,elCurY=0;
function elAnimate(){
  if(!dragEl){elDragRAF=null;return}
  dragEl.style.left=(elCurX-dragOX)+'px';
  dragEl.style.top=(elCurY-dragOY)+'px';
  elDragRAF=requestAnimationFrame(elAnimate);
}
function onDragOver(e){
  var el=e.target;if(el.closest('#nahdi_baz_panel'))return;
  if(dragHover&&dragHover!==el)dragHover.classList.remove('nbp-drag-outline');
  el.classList.add('nbp-drag-outline');dragHover=el;
}
function onDragOut(e){if(e.target.classList)e.target.classList.remove('nbp-drag-outline')}
function onDragDown(e){
  var el=e.target;if(el.closest('#nahdi_baz_panel'))return;
  e.preventDefault();e.stopPropagation();
  dragEl=el;el.classList.add('nbp-drag-active');el.classList.remove('nbp-drag-outline');
  if(!el.style.position||el.style.position==='static')el.style.position='relative';
  var cx=parseFloat(el.style.left)||0,cy=parseFloat(el.style.top)||0;
  dragOX=e.clientX-cx;dragOY=e.clientY-cy;
  elCurX=e.clientX;elCurY=e.clientY;
  if(!elDragRAF)elDragRAF=requestAnimationFrame(elAnimate);
}
function onDragMove(e){if(dragEl){e.preventDefault();elCurX=e.clientX;elCurY=e.clientY}}
function onDragUp(){
  if(dragEl){dragEl.classList.remove('nbp-drag-active');dragEl=null;
  if(elDragRAF){cancelAnimationFrame(elDragRAF);elDragRAF=null}}
}

d.getElementById('nbp_drag').onclick=function(){
  dragOn=!dragOn;this.classList.toggle('active',dragOn);
  this.querySelector('span:last-child').textContent=dragOn?'إيقاف تحريك العناصر':'تحريك العناصر';
  if(dragOn){
    d.addEventListener('mouseover',onDragOver,true);d.addEventListener('mouseout',onDragOut,true);
    d.addEventListener('mousedown',onDragDown,true);d.addEventListener('mousemove',onDragMove,true);
    d.addEventListener('mouseup',onDragUp,true);
    toast('وضع التحريك: امسك أي عنصر وحرّكه','info');
  }else{
    d.removeEventListener('mouseover',onDragOver,true);d.removeEventListener('mouseout',onDragOut,true);
    d.removeEventListener('mousedown',onDragDown,true);d.removeEventListener('mousemove',onDragMove,true);
    d.removeEventListener('mouseup',onDragUp,true);
    if(dragHover){dragHover.classList.remove('nbp-drag-outline');dragHover=null}
    toast('تم إيقاف وضع التحريك','success');
  }
};

/* ===== DELETE QR + TEXT ===== */
d.getElementById('nbp_qr').onclick=function(){
  var rm=false;
  var qr=d.getElementById('qrcode'),qa=d.getElementById('qr_ar'),qe=d.getElementById('qr_en');
  var qi=d.querySelector('img[src*="qr"],canvas,.qr-code,svg[class*="qr"]');
  if(qr){qr.remove();rm=true}if(qa){qa.remove();rm=true}if(qe){qe.remove();rm=true}
  if(qi&&qi.parentNode){qi.remove();rm=true}
  d.querySelectorAll('label,span,p,div').forEach(function(el){
    if(el.closest('#nahdi_baz_panel'))return;
    if(/امسح لادارة تذكير الجرعات|Scan to control your dose reminders/i.test(el.textContent.trim())){el.remove();rm=true}
  });
  if(rm){toast('تم حذف الباركود ونص التذكير','success');this.style.opacity='.35';this.style.pointerEvents='none';this.querySelector('span:last-child').textContent='✓ تم الحذف'}
  else{toast('لم يتم العثور على باركود','error')}
};

/* ===== CSV ===== */
d.getElementById('nbp_csv').onchange=function(e){
  var r=new FileReader();
  r.onload=function(){
    var text=this.result,lines=text.split(/\r?\n/).filter(function(l){return l.trim()});
    var sep=lines[0].includes('\t')?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
    var head=lines[0].split(sep).map(function(h){return h.toLowerCase().trim()});
    var iN=head.findIndex(function(h){return h.includes('name')||h.includes('اسم')});
    var iC=head.findIndex(function(h){return h.includes('code')||h.includes('كود')});
    iN=iN<0?0:iN;iC=iC<0?1:iC;
    db=lines.slice(1).map(function(l){var c=l.split(sep);return{code:(c[iC]||'').replace(/"/g,'').trim(),name:(c[iN]||'').replace(/"/g,'').trim()}}).filter(function(i){return i.name});
    d.getElementById('nbp_search').style.display='block';
    var label=d.getElementById('nbp_csv_label');
    label.querySelector('span:last-child').textContent='✅ تم تحميل '+db.length+' صنف';
    label.classList.add('loaded');
    toast('تم تحميل '+db.length+' صنف بنجاح','success');
  };r.readAsText(e.target.files[0]);
};

/* ===== SEARCH ===== */
d.getElementById('nbp_search').oninput=function(){
  var q=this.value.toLowerCase(),res=d.getElementById('nbp_results');res.innerHTML='';
  if(q.length<2){res.style.display='none';return}
  var m=db.filter(function(i){return i.name.toLowerCase().includes(q)||i.code.includes(q)}).slice(0,10);
  m.forEach(function(i){
    var v=d.createElement('div');v.className='nbp-result-item';
    v.innerHTML='<b>'+i.name+'</b><small>Code: '+i.code+'</small>';
    v.onclick=function(){
      selI=i;
      d.getElementById('nbp_search').value=i.name;
      res.style.display='none';
      d.getElementById('nbp_inject').style.display='flex';
      /* إظهار زر رفع الصورة */
      d.getElementById('nbp_img_label').style.display='flex';
    };
    res.appendChild(v);
  });
  res.style.display=m.length?'block':'none';
};

/* ===== IMAGE UPLOAD ===== */
d.getElementById('nbp_img').onchange=function(e){
  var file=e.target.files[0];
  if(!file)return;
  var r=new FileReader();
  r.onload=function(){
    selImg=this.result;
    /* تحديث زر الرفع */
    var label=d.getElementById('nbp_img_label');
    label.querySelector('span:last-child').textContent='✅ تم رفع الصورة';
    label.classList.add('loaded');
    /* عرض preview */
    var preview=d.getElementById('nbp_img_preview');
    var thumb=d.getElementById('nbp_img_thumb');
    thumb.src=selImg;
    preview.style.display='block';
    toast('تم رفع الصورة بنجاح','success');
  };
  r.readAsDataURL(file);
};

/* ===== INJECT ===== */
d.getElementById('nbp_inject').onclick=function(){
  if(!selI)return;
  var t=findT(),b=t.querySelector('tbody')||t,rows=b.querySelectorAll('tr');
  if(rows.length<1){toast('خطأ: لم يتم العثور على صفوف','error');return}
  var lr=rows[rows.length-1],nr=lr.cloneNode(true),tds=nr.querySelectorAll('td');
  if(tds.length>=2){
    var im=tds[0].querySelector('img');
    if(im){
      if(selImg){
        im.src=selImg;       /* الصورة المرفوعة من الجهاز */
        im.style.width='70px';
      } else {
        im.removeAttribute('src'); /* بدون صورة لو ما رفعش */
        im.style.width='70px';
        im.alt='—';
      }
    } else {
      tds[0].innerText=selI.code;
    }
    tds[1].innerText=selI.name;
    for(var i=2;i<tds.length;i++)tds[i].innerText='-';
  }
  b.appendChild(nr);nr.style.animation='nbpSlideIn .25s ease';

  /* ===== RESET ===== */
  d.getElementById('nbp_search').value='';
  d.getElementById('nbp_inject').style.display='none';
  d.getElementById('nbp_img_label').style.display='none';
  d.getElementById('nbp_img_label').classList.remove('loaded');
  d.getElementById('nbp_img_label').querySelector('span:last-child').textContent='رفع صورة الصنف (اختياري)';
  d.getElementById('nbp_img_preview').style.display='none';
  d.getElementById('nbp_img_thumb').src='';
  d.getElementById('nbp_img').value='';
  selI=null;selImg=null;

  toast(selImg?'تم حقن الصنف مع الصورة ✅':'تم حقن الصنف بنجاح','success');
};

})();

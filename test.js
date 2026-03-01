(function(){
'use strict';

/* ══════════════════════════════════════════
   EZ TOOLS v2.0 — iOS Native Smart Context
   ══════════════════════════════════════════ */

var PID='ez-tools-main';
var old=document.getElementById(PID);if(old){old.remove();return}
var SECRET='101093';

/* ─── Smart Context Detection ─── */
var pageContext='orders'; // default
var loc=window.location.href.toLowerCase();
var isDetails=loc.indexOf('getezpill_details')>-1 || loc.indexOf('getezpill_detail')>-1;

if(isDetails){
  /* Check for red buttons: "Update Status as Packed" or "Download File" */
  var allBtns=document.querySelectorAll('input[type="button"],input[type="submit"],button,a');
  var hasPackedBtn=false;
  for(var bi=0;bi<allBtns.length;bi++){
    var btnText=(allBtns[bi].value||allBtns[bi].textContent||'').toLowerCase().trim();
    if(btnText.indexOf('update status as packed')>-1||btnText.indexOf('download file')>-1){
      hasPackedBtn=true;break;
    }
  }
  pageContext=hasPackedBtn?'tools':'export';
}

/* ─── Remember last tab for return ─── */
var activeTab=pageContext;

/* ─── Loader with Return ─── */
function loadTool(url,name,closePanel){
  if(closePanel){
    var pp=document.getElementById(PID);
    if(pp){pp.style.display='none'}
  }
  var full=url+(url.indexOf('?')>-1?'&':'?')+'t='+Date.now();
  fetch(full).then(function(r){
    if(!r.ok)throw new Error(r.status);
    return r.text();
  }).then(function(code){
    try{
      /* Wrap code to detect tool close and return EZ Tools */
      new Function(code)();
      watchToolClose(name);
    }catch(e){alert('خطأ في '+name+': '+e.message);showPanel()}
  }).catch(function(err){
    try{
      var x=new XMLHttpRequest();
      x.open('GET',full,true);
      x.onload=function(){
        if(x.status===200){
          try{new Function(x.responseText)();watchToolClose(name)}
          catch(e){alert('خطأ في '+name+': '+e.message);showPanel()}
        }else{alert('فشل تحميل '+name);showPanel()}
      };
      x.onerror=function(){alert('فشل تحميل '+name);showPanel()};
      x.send();
    }catch(e2){alert('فشل تحميل '+name);showPanel()}
  });
}

/* ─── Watch for tool panel close → return EZ Tools ─── */
function watchToolClose(name){
  var toolIds=['ali_sys_v4','ali_sys_v5','nahdi_baz_panel','baz-ui','fareye-panel'];
  var checkInterval=setInterval(function(){
    var toolFound=false;
    for(var i=0;i<toolIds.length;i++){
      if(document.getElementById(toolIds[i])){toolFound=true;break}
    }
    if(!toolFound){
      clearInterval(checkInterval);
      /* Tool was closed, bring back EZ Tools */
      setTimeout(function(){showPanel()},200);
    }
  },500);
  /* Safety: stop watching after 10 minutes */
  setTimeout(function(){clearInterval(checkInterval)},600000);
}

function showPanel(){
  var pp=document.getElementById(PID);
  if(pp){
    pp.style.display='block';
    pp.style.animation='ezSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)';
  }
}

/* ─── Password ─── */
function checkPass(name,cb){
  var pass=prompt('🔒 أدخل الرقم السري لـ '+name+':');
  if(pass===null)return;
  if(pass===SECRET){cb()}
  else{alert('❌ الرقم السري غلط')}
}

/* ─── Safe Download ─── */
function safeDownload(){
  try{
    var pname=(document.getElementById('pname')||{}).value||'';
    var mobile=(document.getElementById('mobile')||{}).value||'';
    var inv=(document.getElementById('InvoiceNo')||{innerText:''}).innerText.trim()||'';
    if(!pname||!mobile)return;if(!inv)return;
    var treats=[];var rows=document.querySelectorAll('table.styled-table tr');
    for(var r=1;r<rows.length;r++){
      var tds=rows[r].querySelectorAll('td');if(tds.length<10)continue;
      function gv(td){if(!td)return'';var inp=td.querySelector('input,textarea');if(inp)return inp.value.trim();var sel=td.querySelector('select');if(sel){var o=sel.options[sel.selectedIndex];return o?o.text.trim():''}return td.textContent.trim()}
      var code=gv(tds[1]);if(!code||code.length<3)continue;
      var every=gv(tds[6])||'';var mins=1440;
      if(every.indexOf('12')>-1)mins=720;else if(every.indexOf('8')>-1)mins=480;else if(every.indexOf('6')>-1)mins=360;else if(every.indexOf('4')>-1)mins=240;
      var st=gv(tds[7])||'09:00';
      if(st.toUpperCase().indexOf('PM')>-1){var pts=st.replace(/[^0-9:]/g,'').split(':');var hr=parseInt(pts[0])||0;if(hr<12)hr+=12;st=String(hr)+':'+(pts[1]||'00')}else{st=st.replace(/[^0-9:]/g,'')}
      if(!st||st.length<3)st='09:00';
      function fd(dd){if(!dd||dd.indexOf('yyyy')>-1||dd.indexOf('mm/dd')>-1)return'';if(dd.indexOf('/')>-1){var pp=dd.split('/');if(pp.length===3)return pp[2]+'-'+pp[0].padStart(2,'0')+'-'+pp[1].padStart(2,'0')}return dd}
      var sd=fd(gv(tds[8]));var ed=fd(gv(tds[9]));
      if(!sd)sd=new Date().toISOString().slice(0,10);if(!ed)ed=sd;
      treats.push({medicine_code:code,medicine_name:gv(tds[2]),treatment_plan:'custom_interval',starts_at:sd+' '+st,ends_at:ed+' 23:59',emblist_it:true,force_medicine_code_in_production:false,emblist_in_unique_bag:false,is_if_needed_treatment:false,notes:gv(tds[10])||'',configs:[{first_take:sd+' '+st,dose:gv(tds[5])||'1',minutes_interval:mins}]});
    }
    if(!treats.length)return;
    downloadObjectAsJson({mode:'ONLY_UPDATE_OR_CREATE',patients:[{name:pname,external_id:inv,treatments:treats}]},inv);
  }catch(e){}
}

/* ─── CSS ─── */
if(!document.getElementById('ez-tools-css')){
  var css=document.createElement('style');css.id='ez-tools-css';
  css.textContent=
    '@keyframes ezSlideIn{from{opacity:0;transform:translateY(-18px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes ezFadeTab{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}'+
    '#'+PID+'{position:fixed;top:14px;right:14px;z-index:999999;width:380px;border-radius:22px;overflow:hidden;'+
      'background:rgba(243,244,246,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);'+
      'border:1px solid rgba(255,255,255,0.5);'+
      'box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);'+
      'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif;'+
      'animation:ezSlideIn 0.4s cubic-bezier(0.16,1,0.3,1);direction:rtl}'+
    '#'+PID+' .ez-seg{display:flex;gap:2px;padding:3px;margin:0 16px 10px;border-radius:10px;background:rgba(0,0,0,0.05)}'+
    '#'+PID+' .ez-seg-btn{flex:1;padding:8px 4px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;'+
      'font-size:12px;font-weight:700;color:#9ca3af;background:transparent;transition:all 0.25s;direction:rtl}'+
    '#'+PID+' .ez-seg-btn.active{background:#fff;color:#1f2937;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 0 0 0.5px rgba(0,0,0,0.04)}'+
    '#'+PID+' .ez-group{background:#fff;border-radius:14px;margin:0 16px 12px;overflow:hidden;'+
      'box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)}'+
    '#'+PID+' .ez-item{display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;'+
      'transition:background 0.15s;border-bottom:0.5px solid #f3f4f6;direction:rtl}'+
    '#'+PID+' .ez-item:last-child{border-bottom:none}'+
    '#'+PID+' .ez-item:hover{background:#f9fafb}'+
    '#'+PID+' .ez-item:active{background:#f3f4f6}'+
    '#'+PID+' .ez-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;'+
      'justify-content:center;font-size:17px;flex-shrink:0}'+
    '#'+PID+' .ez-tab-content{animation:ezFadeTab 0.25s ease}'+
    '#'+PID+' .ez-context-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700;letter-spacing:0.3px}';
  document.head.appendChild(css);
}

/* ─── Context Labels ─── */
var ctxLabels={
  orders:{icon:'📋',text:'قائمة الطلبات',color:'#6366f1',bg:'rgba(99,102,241,0.08)'},
  tools:{icon:'🛠️',text:'تفاصيل الطلب',color:'#22c55e',bg:'rgba(34,197,94,0.08)'},
  export:{icon:'📤',text:'تفاصيل (للقراءة)',color:'#f59e0b',bg:'rgba(245,158,11,0.08)'}
};
var ctx=ctxLabels[pageContext];

/* ─── Panel ─── */
var p=document.createElement('div');p.id=PID;

/* ─── Build tabs based on context ─── */
var segHTML='';
var tabsConfig=[];

if(pageContext==='orders'){
  /* Orders page: show all 3 tabs, start on orders */
  tabsConfig=[
    {id:'orders',icon:'📋',label:'الطلبات'},
    {id:'tools',icon:'🛠️',label:'الأدوات'},
    {id:'export',icon:'📤',label:'تصدير'}
  ];
}else if(pageContext==='tools'){
  /* Details with buttons: show tools + export, start on tools */
  tabsConfig=[
    {id:'tools',icon:'🛠️',label:'الأدوات'},
    {id:'export',icon:'📤',label:'تصدير'}
  ];
}else{
  /* Details without buttons: show only export, no tabs needed */
  tabsConfig=[
    {id:'export',icon:'📤',label:'تصدير'}
  ];
}

if(tabsConfig.length>1){
  segHTML='<div class="ez-seg" id="ez-seg">';
  for(var ti=0;ti<tabsConfig.length;ti++){
    var isActive=tabsConfig[ti].id===pageContext;
    segHTML+='<button class="ez-seg-btn'+(isActive?' active':'')+'" data-tab="'+tabsConfig[ti].id+'">'+tabsConfig[ti].icon+' '+tabsConfig[ti].label+'</button>';
  }
  segHTML+='</div>';
}

p.innerHTML=
/* ── Header ── */
'<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
  '<div style="display:flex;align-items:center;gap:10px">'+
    '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25)">EZ</div>'+
    '<div>'+
      '<div style="font-size:15px;font-weight:800;color:#1f2937;letter-spacing:-0.2px">EZ Tools</div>'+
      '<div style="font-size:10px;color:#9ca3af;font-weight:600">v2.0 — Smart Context</div>'+
    '</div>'+
  '</div>'+
  '<div style="display:flex;align-items:center;gap:8px">'+
    '<div class="ez-context-badge" style="background:'+ctx.bg+';color:'+ctx.color+'">'+ctx.icon+' '+ctx.text+'</div>'+
    '<button id="ez-t-close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-family:inherit" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\';this.style.color=\'#ef4444\'" onmouseout="this.style.background=\'rgba(0,0,0,0.06)\';this.style.color=\'#9ca3af\'">×</button>'+
  '</div>'+
'</div>'+

/* ── Segment Control ── */
segHTML+

/* ── Tab: الطلبات ── */
'<div id="ez-tab-orders" class="ez-tab-content" style="display:'+(pageContext==='orders'?'block':'none')+'">'+
  '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-search">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#ede9fe,#e0e7ff)">🔍</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">بحث الطلبات</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">فحص وفتح الطلبات تلقائياً</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
    '<div class="ez-item" id="ez-t-close-orders">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#fee2e2,#fce7f3)">📝</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تقفيل الطلبات</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">تسليم وتصدير الطلبات المجهزة</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
    '<div class="ez-item" id="ez-t-radar">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#dcfce7,#d1fae5)">📡</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">البحث الشامل</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">Radar — بحث متقدم</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
  '</div>'+
'</div>'+

/* ── Tab: الأدوات ── */
'<div id="ez-tab-tools" class="ez-tab-content" style="display:'+(pageContext==='tools'?'block':'none')+'">'+
  '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-add">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#dbeafe,#e0e7ff)">➕</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">إضافة صنف</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">إضافة دواء من ملف Excel/CSV</div></div>'+
      '<span style="font-size:13px">🔒</span>'+
    '</div>'+
    '<div class="ez-item" id="ez-t-editor">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#fef3c7,#fef9c3)">✏️</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تعديل الطباعة</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">Nahdi Editor</div></div>'+
      '<span style="font-size:13px">🔒</span>'+
    '</div>'+
    '<div class="ez-item" id="ez-t-fareye">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#f5d0fe,#fae8ff)">🚀</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">FarEye</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">FarEye Injector</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
  '</div>'+
'</div>'+

/* ── Tab: تصدير ── */
'<div id="ez-tab-export" class="ez-tab-content" style="display:'+(pageContext==='export'?'block':'none')+'">'+
  '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-dl">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0)">📥</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تحميل الملف</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">تحميل صامت بدون رسائل</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
    '<div class="ez-item" id="ez-t-pr">'+
      '<div class="ez-icon" style="background:linear-gradient(135deg,#e0f2fe,#bae6fd)">🖨️</div>'+
      '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">طباعة الملخص</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">Print Summary</div></div>'+
      '<span style="color:#d1d5db;font-size:16px">‹</span>'+
    '</div>'+
  '</div>'+
'</div>'+

/* ── Footer ── */
'<div style="padding:8px 20px 14px;text-align:center">'+
  '<div style="font-size:9px;color:#c4b5fd;font-weight:700;letter-spacing:0.5px">EZ TOOLS v2.0 — DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';

document.body.appendChild(p);

/* ═══ TAB SWITCHING ═══ */
var segBtns=document.querySelectorAll('#'+PID+' .ez-seg-btn');
for(var si=0;si<segBtns.length;si++){
  segBtns[si].addEventListener('click',function(){
    var tab=this.getAttribute('data-tab');
    var allBtns=document.querySelectorAll('#'+PID+' .ez-seg-btn');
    for(var j=0;j<allBtns.length;j++){allBtns[j].classList.remove('active')}
    this.classList.add('active');
    var tabs=['orders','tools','export'];
    for(var k=0;k<tabs.length;k++){
      var el=document.getElementById('ez-tab-'+tabs[k]);
      if(el){
        if(tabs[k]===tab){el.style.display='block';el.style.animation='ezFadeTab 0.25s ease'}
        else{el.style.display='none'}
      }
    }
    activeTab=tab;
  });
}

/* ═══ EVENTS ═══ */

/* Close */
document.getElementById('ez-t-close').onclick=function(){
  p.style.transition='all 0.3s cubic-bezier(0.4,0,1,1)';
  p.style.opacity='0';p.style.transform='translateY(-18px) scale(0.97)';
  setTimeout(function(){p.remove()},300);
};

/* Tab: الطلبات */
var searchBtn=document.getElementById('ez-t-search');
if(searchBtn)searchBtn.onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/Search_Order.js','بحث الطلبات',true);
};
var closeOrdersBtn=document.getElementById('ez-t-close-orders');
if(closeOrdersBtn)closeOrdersBtn.onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/close%20receved.js','تقفيل الطلبات',true);
};
var radarBtn=document.getElementById('ez-t-radar');
if(radarBtn)radarBtn.onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/radar-ali-elbaz-v10.js','البحث الشامل',true);
};

/* Tab: الأدوات */
var addBtn=document.getElementById('ez-t-add');
if(addBtn)addBtn.onclick=function(){
  checkPass('إضافة صنف',function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/EZPillAddDrug.js','إضافة صنف',true);
  });
};
var editorBtn=document.getElementById('ez-t-editor');
if(editorBtn)editorBtn.onclick=function(){
  checkPass('تعديل الطباعة',function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/nahdi-editor.js','تعديل الطباعة',true);
  });
};
var fareyeBtn=document.getElementById('ez-t-fareye');
if(fareyeBtn)fareyeBtn.onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/fareye_injector.js','FarEye',true);
};

/* Tab: تصدير */
var dlBtn=document.getElementById('ez-t-dl');
if(dlBtn)dlBtn.onclick=function(){safeDownload()};
var prBtn=document.getElementById('ez-t-pr');
if(prBtn)prBtn.onclick=function(){if(typeof printsum==='function'){printsum()}};

})();

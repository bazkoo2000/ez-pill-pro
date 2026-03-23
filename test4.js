javascript:(function(){
'use strict';

var PID='ez-tools-main';
var old=document.getElementById(PID);if(old){old.remove();return}
var SECRET='101093';

/* ══════════════════════════════════════
   Smart Context Detection
   ══════════════════════════════════════ */
var loc=window.location.href.toLowerCase();
var isDetails=loc.indexOf('getezpill_details')>-1||loc.indexOf('getezpill_detail')>-1;
var isPrint=loc.indexOf('printorder')>-1;
var isFarmadosis=loc.indexOf('farmadosis.com')>-1;
var isFareye=loc.indexOf('fareye')>-1;
var isFarmadosisTreatments=isFarmadosis&&loc.indexOf('/treatments')>-1;
var isFarmadosisPatients=isFarmadosis&&loc.indexOf('/patients')>-1&&!isFarmadosisTreatments;
var isHomePage=loc.indexOf('ez_pill_web')>-1&&!isDetails&&!isPrint;

/* ══════════════════════════════════════
   Helpers
   ══════════════════════════════════════ */
function gv(td){
  if(!td)return'';
  var inp=td.querySelector('input,textarea');
  if(inp)return inp.value.trim();
  var sel=td.querySelector('select');
  if(sel){var o=sel.options[sel.selectedIndex];return o?o.text.trim():''}
  return td.textContent.trim();
}

function getStoreCode(){
  var labels=document.querySelectorAll('label');
  for(var i=0;i<labels.length;i++){
    var txt=labels[i].textContent||'';
    if(txt.indexOf('StoreCode')>-1){return txt.replace(/[^0-9]/g,'')}
  }
  return'0000';
}

function to24h(t){
  t=(t||'09:00').trim().toUpperCase();
  var isPM=t.indexOf('PM')>-1;
  var isAM=t.indexOf('AM')>-1;
  t=t.replace(/[APM\s]/gi,'').trim();
  var parts=t.split(':');
  var hr=parseInt(parts[0])||0;
  var mn=parts[1]||'00';
  if(isPM&&hr<12)hr+=12;
  if(isAM&&hr===12)hr=0;
  return String(hr).padStart(2,'0')+':'+mn;
}

function toYMD(d){
  if(!d)return'';
  d=d.trim();
  if(d.indexOf('/')>-1){var p=d.split('/');if(p.length===3)return p[2]+p[0].padStart(2,'0')+p[1].padStart(2,'0')}
  if(d.indexOf('-')>-1)return d.replace(/-/g,'');
  return d;
}

/* ══════════════════════════════════════
   Load Tool
   ══════════════════════════════════════ */
function loadTool(url,name,closePanel){
  if(closePanel){var pp=document.getElementById(PID);if(pp)pp.style.display='none'}
  var full=url+(url.indexOf('?')>-1?'&':'?')+'t='+Date.now();
  fetch(full).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(code){
    try{new Function(code)();}catch(e){alert('خطأ في '+name+': '+e.message);showPanel()}
  }).catch(function(){
    try{var x=new XMLHttpRequest();x.open('GET',full,true);x.onload=function(){if(x.status===200){try{new Function(x.responseText)();}catch(e){alert('خطأ في '+name+': '+e.message);showPanel()}}else{alert('فشل تحميل '+name);showPanel()}};x.onerror=function(){alert('فشل تحميل '+name);showPanel()};x.send()}catch(e2){alert('فشل تحميل '+name);showPanel()}
  });
}

function showPanel(){var pp=document.getElementById(PID);if(pp){pp.style.display='block';pp.style.animation='ezSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)'}}

/* ══════════════════════════════════════
   Auto-Launch Detection
   ══════════════════════════════════════ */
var autoDetected=false;

/* ── 1. FarEye ── */
if(!autoDetected&&isFareye){
  autoDetected=true;
  setTimeout(function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/fareye_injector.js','FarEye',true);
  },300);
}

/* ── 1b. Farmadosis Treatments → farmadosis-bulk ── */
else if(!autoDetected&&isFarmadosisTreatments){
  autoDetected=true;
  setTimeout(function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/farmadosis-bulk.js','Farmadosis Bulk',true);
  },300);
}

/* ── 2. Print Order → nahdi-editor ── */
else if(!autoDetected&&isPrint){
  autoDetected=true;
  setTimeout(function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/nahdi-editor.js','تعديل الطباعة',true);
  },300);
}

/* ── 3. Farmadosis Patients → mini menu ── */
else if(!autoDetected&&isFarmadosisPatients){
  autoDetected=true;
  var choiceDiv=document.createElement('div');
  choiceDiv.id='ez-choice-panel';
  choiceDiv.style.cssText='position:fixed;top:14px;right:14px;z-index:999999;background:#fff;border-radius:16px;padding:18px;width:300px;box-shadow:0 20px 60px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,Cairo,sans-serif;direction:rtl;animation:ezSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)';
  choiceDiv.innerHTML=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'+
    '<div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:11px">EZ</div>'+
    '<div><div style="font-size:14px;font-weight:800;color:#1f2937">Farmadosis Patients</div>'+
    '<div style="font-size:10px;color:#9ca3af">اختار الأداة المطلوبة</div></div></div>'+
    '<div id="ez-choice-1" style="padding:13px;border-radius:10px;background:#f0fdf4;cursor:pointer;margin-bottom:8px;border:1px solid #bbf7d0;transition:all 0.2s">'+
    '<div style="font-size:13px;font-weight:700;color:#15803d">📤 رفع ملفات JSON</div>'+
    '<div style="font-size:11px;color:#6b7280;margin-top:2px">رفع الملفات لـ Farmadosis</div></div>'+
    '<div id="ez-choice-2" style="padding:13px;border-radius:10px;background:#fef2f2;cursor:pointer;border:1px solid #fecaca;transition:all 0.2s">'+
    '<div style="font-size:13px;font-weight:700;color:#dc2626">✅ تقفيل البيشنت</div>'+
    '<div style="font-size:11px;color:#6b7280;margin-top:2px">تقفيل دفعة واحدة</div></div>'+
    '<button id="ez-choice-close" style="margin-top:10px;width:100%;padding:8px;border:none;border-radius:8px;background:#f3f4f6;color:#9ca3af;cursor:pointer;font-size:12px;font-family:inherit">إلغاء — عرض البانيل الكامل</button>';
  document.body.appendChild(choiceDiv);

  document.getElementById('ez-choice-1').onmouseover=function(){this.style.background='#dcfce7'};
  document.getElementById('ez-choice-1').onmouseout=function(){this.style.background='#f0fdf4'};
  document.getElementById('ez-choice-2').onmouseover=function(){this.style.background='#fee2e2'};
  document.getElementById('ez-choice-2').onmouseout=function(){this.style.background='#fef2f2'};

  document.getElementById('ez-choice-1').onclick=function(){
    choiceDiv.remove();
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/patient.js','رفع ملفات json',false);
  };
  document.getElementById('ez-choice-2').onclick=function(){
    choiceDiv.remove();
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/auto-checkbox-clicker.js','تقفيل البيشنت',false);
  };
  document.getElementById('ez-choice-close').onclick=function(){
    choiceDiv.remove();
    buildPanel();
    showPanel();
  };
}

/* ── 4. Details Page → EZPillAddDrug (4 buttons check) ── */
else if(!autoDetected&&isDetails){
  var btns=document.querySelectorAll('input[type="button"],input[type="submit"],button,a');
  var hasPacked=false,hasDownload=false,hasAI=false,hasCancel=false;
  for(var bi=0;bi<btns.length;bi++){
    var t=(btns[bi].value||btns[bi].textContent||'').toLowerCase().trim();
    if(t.indexOf('update status as packed')>-1)hasPacked=true;
    if(t.indexOf('download file')>-1)hasDownload=true;
    if(t.indexOf('ai assistant')>-1)hasAI=true;
    if(t.indexOf('cancel')>-1)hasCancel=true;
  }
  if(hasPacked&&hasDownload&&hasAI&&hasCancel){
    autoDetected=true;
    setTimeout(function(){
      loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/EZPillAddDrug.js','إضافة صنف',true);
    },300);
  }
}

/* ── 5. Home Page → Search (accepted) or Close (packed) ── */
else if(!autoDetected&&isHomePage){
  var statusCells=document.querySelectorAll('table td');
  var firstStatus='';
  for(var si=0;si<statusCells.length;si++){
    var stxt=statusCells[si].textContent.trim().toLowerCase();
    if(stxt==='packed'||stxt==='accepted'||stxt==='received'){
      firstStatus=stxt;break;
    }
  }
  if(firstStatus==='packed'){
    autoDetected=true;
    setTimeout(function(){
      loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/close%20receved.js','تقفيل الطلبات packed',true);
    },300);
  } else if(firstStatus==='accepted'){
    autoDetected=true;
    setTimeout(function(){
      loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/Search_Order.js','بحث طلبات ready to pack',true);
    },300);
  }
}

/* ══════════════════════════════════════
   لو مفيش أداة اتعرفت → البانيل الكامل
   ══════════════════════════════════════ */
if(!autoDetected){
  buildPanel();
}

/* ══════════════════════════════════════
   Farmadosis Download (JSON)
   ══════════════════════════════════════ */
function safeDownload(){try{var pname=(document.getElementById('pname')||{}).value||'';var mobile=(document.getElementById('mobile')||{}).value||'';var inv=(document.getElementById('InvoiceNo')||{innerText:''}).innerText.trim()||'';if(!pname||!mobile)return;if(!inv)return;var treats=[];var rows=document.querySelectorAll('table.styled-table tr');for(var r=1;r<rows.length;r++){var tds=rows[r].querySelectorAll('td');if(tds.length<10)continue;var code=gv(tds[1]);if(!code||code.length<3)continue;var every=gv(tds[6])||'';var mins=1440;if(every.indexOf('12')>-1)mins=720;else if(every.indexOf('8')>-1)mins=480;else if(every.indexOf('6')>-1)mins=360;else if(every.indexOf('4')>-1)mins=240;var st=gv(tds[7])||'09:00';if(st.toUpperCase().indexOf('PM')>-1){var pts=st.replace(/[^0-9:]/g,'').split(':');var hr=parseInt(pts[0])||0;if(hr<12)hr+=12;st=String(hr)+':'+(pts[1]||'00')}else{st=st.replace(/[^0-9:]/g,'')}if(!st||st.length<3)st='09:00';function fd(dd){if(!dd||dd.indexOf('yyyy')>-1||dd.indexOf('mm/dd')>-1)return'';if(dd.indexOf('/')>-1){var p=dd.split('/');if(p.length===3)return p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')}return dd}var sd=fd(gv(tds[8]));var ed=fd(gv(tds[9]));if(!sd)sd=new Date().toISOString().slice(0,10);if(!ed)ed=sd;treats.push({medicine_code:code,medicine_name:gv(tds[2]),treatment_plan:'custom_interval',starts_at:sd+' '+st,ends_at:ed+' 23:59',emblist_it:true,force_medicine_code_in_production:false,emblist_in_unique_bag:false,is_if_needed_treatment:false,notes:gv(tds[10])||'',configs:[{first_take:sd+' '+st,dose:gv(tds[5])||'1',minutes_interval:mins}]})}if(!treats.length)return;downloadObjectAsJson({mode:'ONLY_UPDATE_OR_CREATE',patients:[{name:pname,external_id:inv,treatments:treats}]},inv)}catch(e){}}

/* ══════════════════════════════════════
   JVM Download (.OCS)
   ══════════════════════════════════════ */
function jvmDownload(){
  try{
    var pname=(document.getElementById('pname')||{}).value||'';
    var inv=(document.getElementById('InvoiceNo')||{innerText:''}).innerText.trim()||'';
    if(!pname){alert('⚠️ اسم المريض غير موجود');return}
    if(!inv){alert('⚠️ رقم الفاتورة غير موجود');return}
    var storeCode=getStoreCode();
    var lines=[];
    var rows=document.querySelectorAll('table.styled-table tr');
    for(var r=1;r<rows.length;r++){
      var tds=rows[r].querySelectorAll('td');
      if(tds.length<12)continue;
      var code=gv(tds[1]);
      if(!code||code.length<3)continue;
      var itemName=gv(tds[2]);
      var dose=gv(tds[5])||'1';
      var every=gv(tds[6])||'';
      var startTime=gv(tds[7])||'09:00';
      var startDate=gv(tds[8])||'';
      var endDate=gv(tds[9])||'';
      var notes=gv(tds[10])||'';
      var expiry=gv(tds[11])||'';
      var time24=to24h(startTime);
      var sd=toYMD(startDate);
      var ed=toYMD(endDate);
      if(!sd)sd=new Date().toISOString().slice(0,10).replace(/-/g,'');
      if(!ed)ed=sd;
      function pLabel(t){var h=parseInt(t.split(':')[0])||0;return h<12?'صباحا':'مساءا'}
      function mkLine(t,period){return pname+'||Nahdi Pharmacy|Store '+storeCode+'|'+dose+'|'+code+'|'+itemName+'|'+t+'|'+sd+'|'+ed+'|'+expiry+'|'+period+'|'+notes+'|||||';}
      var evH=24;
      if(every.indexOf('4')>-1&&every.indexOf('24')<0)evH=4;
      else if(every.indexOf('6')>-1)evH=6;
      else if(every.indexOf('8')>-1)evH=8;
      else if(every.indexOf('12')>-1)evH=12;
      if(evH===24){lines.push(mkLine(time24,pLabel(time24)));}
      else if(evH===12){lines.push(mkLine('09:00','صباحا'));lines.push(mkLine('21:00','مساءا'));}
      else if(evH===8){lines.push(mkLine('08:00','صباحا'));lines.push(mkLine('16:00','مساءا'));lines.push(mkLine('00:00','صباحا'));}
      else if(evH===6){lines.push(mkLine('06:00','صباحا'));lines.push(mkLine('12:00','مساءا'));lines.push(mkLine('18:00','مساءا'));lines.push(mkLine('00:00','صباحا'));}
      else if(evH===4){lines.push(mkLine('06:00','صباحا'));lines.push(mkLine('10:00','صباحا'));lines.push(mkLine('14:00','مساءا'));lines.push(mkLine('18:00','مساءا'));lines.push(mkLine('22:00','مساءا'));lines.push(mkLine('02:00','صباحا'));}
    }
    if(!lines.length){alert('⚠️ لا توجد أصناف للتصدير');return}
    var content=lines.join('\r\n')+'\r\n';
    var bom='\uFEFF';
    var blob=new Blob([bom+content],{type:'application/octet-stream'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='ezPillDownload'+inv+'.OCS';
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  }catch(e){alert('❌ خطأ في تحميل JVM: '+e.message)}
}

/* ══════════════════════════════════════
   Build Main Panel
   ══════════════════════════════════════ */
function buildPanel(){

  var startTab='orders';
  if(isFarmadosis||isFareye)startTab='tools';
  else if(isPrint)startTab='tools';
  else if(isDetails)startTab='tools';

  var ctxMap={
    'orders':{icon:'📋',text:'قائمة الطلبات',color:'#6366f1',bg:'rgba(99,102,241,0.08)'},
    'tools':{icon:'🛠️',text:'صفحة التفاصيل',color:'#22c55e',bg:'rgba(34,197,94,0.08)'},
    'export':{icon:'📤',text:'عرض فقط',color:'#f59e0b',bg:'rgba(245,158,11,0.08)'},
  };
  if(isFarmadosis)ctxMap['tools']={icon:'💊',text:'Farmadosis',color:'#8b5cf6',bg:'rgba(139,92,246,0.08)'};
  else if(isFareye)ctxMap['tools']={icon:'🚀',text:'FarEye',color:'#f97316',bg:'rgba(249,115,22,0.08)'};
  var ctx=ctxMap[startTab]||ctxMap['orders'];

  if(!document.getElementById('ez-tools-css')){
    var css=document.createElement('style');css.id='ez-tools-css';
    css.textContent=
      '@keyframes ezSlideIn{from{opacity:0;transform:translateY(-18px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}'+
      '@keyframes ezFadeTab{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}'+
      '#'+PID+'{position:fixed;top:14px;right:14px;z-index:999999;width:380px;border-radius:22px;overflow:hidden;background:rgba(243,244,246,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif;animation:ezSlideIn 0.4s cubic-bezier(0.16,1,0.3,1);direction:rtl}'+
      '#'+PID+' .ez-seg{display:flex;gap:2px;padding:3px;margin:0 16px 10px;border-radius:10px;background:rgba(0,0,0,0.05)}'+
      '#'+PID+' .ez-seg-btn{flex:1;padding:8px 4px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;color:#9ca3af;background:transparent;transition:all 0.25s;direction:rtl}'+
      '#'+PID+' .ez-seg-btn.active{background:#fff;color:#1f2937;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 0 0 0.5px rgba(0,0,0,0.04)}'+
      '#'+PID+' .ez-group{background:#fff;border-radius:14px;margin:0 16px 12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)}'+
      '#'+PID+' .ez-item{display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;transition:background 0.15s;border-bottom:0.5px solid #f3f4f6;direction:rtl}'+
      '#'+PID+' .ez-item:last-child{border-bottom:none}'+
      '#'+PID+' .ez-item:hover{background:#f9fafb}'+
      '#'+PID+' .ez-item:active{background:#f3f4f6}'+
      '#'+PID+' .ez-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}'+
      '#'+PID+' .ez-tab-content{animation:ezFadeTab 0.25s ease}'+
      '#'+PID+' .ez-ctx{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700;letter-spacing:0.3px}';
    document.head.appendChild(css);
  }

  var p=document.createElement('div');p.id=PID;
  p.innerHTML=
    '<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
    '<div style="display:flex;align-items:center;gap:10px">'+
    '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25)">EZ</div>'+
    '<div><div style="font-size:15px;font-weight:800;color:#1f2937">EZ Tools</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v3.0 — Auto Launch</div></div></div>'+
    '<div style="display:flex;align-items:center;gap:8px">'+
    '<div class="ez-ctx" style="background:'+ctx.bg+';color:'+ctx.color+'">'+ctx.icon+' '+ctx.text+'</div>'+
    '<button id="ez-t-close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-family:inherit" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\';this.style.color=\'#ef4444\'" onmouseout="this.style.background=\'rgba(0,0,0,0.06)\';this.style.color=\'#9ca3af\'">×</button>'+
    '</div></div>'+
    '<div class="ez-seg">'+
    '<button class="ez-seg-btn'+(startTab==='orders'?' active':'')+'" data-tab="orders">📋 الطلبات</button>'+
    '<button class="ez-seg-btn'+(startTab==='tools'?' active':'')+'" data-tab="tools">🛠️ الأدوات</button>'+
    '<button class="ez-seg-btn'+(startTab==='export'?' active':'')+'" data-tab="export">📤 تصدير</button>'+
    '</div>'+
    '<div id="ez-tab-orders" class="ez-tab-content" style="display:'+(startTab==='orders'?'block':'none')+'">'+
    '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-search"><div class="ez-icon" style="background:linear-gradient(135deg,#ede9fe,#e0e7ff)">🔍</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">بحث طلبات ready to pack</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">فحص وفتح الطلبات تلقائياً</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-close-orders"><div class="ez-icon" style="background:linear-gradient(135deg,#fee2e2,#fce7f3)">📝</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تقفيل الطلبات packed</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">تقفيل طلبات received وتصدير الـ packed</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-radar"><div class="ez-icon" style="background:linear-gradient(135deg,#dcfce7,#d1fae5)">📡</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">البحث الشامل</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">Radar — بحث متقدم</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '</div></div>'+
    '<div id="ez-tab-tools" class="ez-tab-content" style="display:'+(startTab==='tools'?'block':'none')+'">'+
    '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-add"><div class="ez-icon" style="background:linear-gradient(135deg,#dbeafe,#e0e7ff)">➕</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">إضافة صنف</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">إضافة دواء جديد الى الجدول</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-editor"><div class="ez-icon" style="background:linear-gradient(135deg,#fef3c7,#fef9c3)">✏️</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تعديل الطباعة</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">تحكم كامل فى الـ print summary</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-fareye"><div class="ez-icon" style="background:linear-gradient(135deg,#f5d0fe,#fae8ff)">🚀</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">FarEye</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">رفع الطلبات على fareye</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-patient-close"><div class="ez-icon" style="background:linear-gradient(135deg,#fee2e2,#fecaca)">✅</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تقفيل البيشنت</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">تقفيل البيشنت دفعة واحدة farmadosis</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-upload"><div class="ez-icon" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0)">📤</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">رفع ملفات json</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">رفع الملفات لـ Farmadosis</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-bulk"><div class="ez-icon" style="background:linear-gradient(135deg,#fde68a,#fef3c7)">⚡</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">Farmadosis Bulk</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">أداة Treatments — Farmadosis</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '</div></div>'+
    '<div id="ez-tab-export" class="ez-tab-content" style="display:'+(startTab==='export'?'block':'none')+'">'+
    '<div class="ez-group">'+
    '<div class="ez-item" id="ez-t-dl"><div class="ez-icon" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0)">💊</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تحميل Farmadosis</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">ملف JSON — جهاز Farmadosis</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-jvm"><div class="ez-icon" style="background:linear-gradient(135deg,#e0f2fe,#bae6fd)">🏥</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">تحميل JVM</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">ملف OCS — جهاز JVM</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '<div class="ez-item" id="ez-t-pr"><div class="ez-icon" style="background:linear-gradient(135deg,#fef3c7,#fef9c3)">🖨️</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1f2937">طباعة الملخص</div><div style="font-size:11px;color:#9ca3af;margin-top:1px">Print Summary</div></div><span style="color:#d1d5db;font-size:16px">‹</span></div>'+
    '</div></div>'+
    '<div style="padding:8px 20px 14px;text-align:center"><div style="font-size:9px;color:#c4b5fd;font-weight:700;letter-spacing:0.5px">EZ TOOLS v3.0 — DEVELOPED BY ALI EL-BAZ</div></div>';

  document.body.appendChild(p);

  /* Tabs */
  var segBtns=document.querySelectorAll('#'+PID+' .ez-seg-btn');
  for(var si=0;si<segBtns.length;si++){
    segBtns[si].addEventListener('click',function(){
      var tab=this.getAttribute('data-tab');
      var all=document.querySelectorAll('#'+PID+' .ez-seg-btn');
      for(var j=0;j<all.length;j++){all[j].classList.remove('active')}
      this.classList.add('active');
      var tids=['orders','tools','export'];
      for(var k=0;k<tids.length;k++){
        var el=document.getElementById('ez-tab-'+tids[k]);
        if(el){if(tids[k]===tab){el.style.display='block';el.style.animation='ezFadeTab 0.25s ease'}else{el.style.display='none'}}
      }
    });
  }

  /* Close */
  document.getElementById('ez-t-close').onclick=function(){
    p.style.transition='all 0.3s cubic-bezier(0.4,0,1,1)';
    p.style.opacity='0';p.style.transform='translateY(-18px) scale(0.97)';
    setTimeout(function(){p.remove()},300);
  };

  /* Buttons */
  document.getElementById('ez-t-search').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/Search_Order.js','بحث طلبات ready to pack',true);};
  document.getElementById('ez-t-close-orders').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/close%20receved.js','تقفيل الطلبات packed',true);};
  document.getElementById('ez-t-radar').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/radar-ali-elbaz-v10.js','البحث الشامل',true);};
  document.getElementById('ez-t-add').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/EZPillAddDrug.js','إضافة صنف',true);};
  document.getElementById('ez-t-editor').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/nahdi-editor.js','تعديل الطباعة',true);};
  document.getElementById('ez-t-fareye').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/fareye_injector.js','FarEye',true);};
  document.getElementById('ez-t-patient-close').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/auto-checkbox-clicker.js','تقفيل البيشنت',true);};
  document.getElementById('ez-t-upload').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/patient.js','رفع ملفات json',true);};
  document.getElementById('ez-t-bulk').onclick=function(){loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/farmadosis-bulk.js','Farmadosis Bulk',true);};
  document.getElementById('ez-t-dl').onclick=function(){safeDownload()};
  document.getElementById('ez-t-jvm').onclick=function(){jvmDownload()};
  document.getElementById('ez-t-pr').onclick=function(){if(typeof printsum==='function'){printsum()}};
}

})();

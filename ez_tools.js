(function(){
'use strict';

/* ══════════════════════════════════════════
   EZ TOOLS v1.4 — Lightweight Launcher
   ══════════════════════════════════════════ */

var PID='ez-tools-main';
var old=document.getElementById(PID);if(old){old.remove();return}

/* ─── Loader: fetch from GitHub and execute ─── */
function loadTool(url,name,closePanel){
  if(closePanel){var pp=document.getElementById(PID);if(pp)pp.remove()}
  var full=url+(url.indexOf('?')>-1?'&':'?')+'t='+Date.now();
  fetch(full).then(function(r){
    if(!r.ok)throw new Error(r.status);
    return r.text();
  }).then(function(code){
    try{new Function(code)()}catch(e){alert('خطأ في '+name+': '+e.message)}
  }).catch(function(err){
    /* fallback XMLHttpRequest */
    try{
      var x=new XMLHttpRequest();
      x.open('GET',full,true);
      x.onload=function(){if(x.status===200){try{new Function(x.responseText)()}catch(e){alert('خطأ في '+name+': '+e.message)}}else{alert('فشل تحميل '+name)}};
      x.onerror=function(){alert('فشل تحميل '+name)};
      x.send();
    }catch(e2){alert('فشل تحميل '+name)}
  });
}

/* ─── Safe Download (inline) ─── */
function safeDownload(){
  try{
    var pname=(document.getElementById('pname')||{}).value||'';
    var mobile=(document.getElementById('mobile')||{}).value||'';
    var inv=(document.getElementById('InvoiceNo')||{innerText:''}).innerText.trim()||'';
    if(!pname||!mobile){alert('الاسم أو الموبايل فاضي');return}
    if(!inv){alert('رقم الفاتورة مش موجود');return}
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
      function fd(dd){if(!dd||dd.indexOf('yyyy')>-1||dd.indexOf('mm/dd')>-1)return'';if(dd.indexOf('/')>-1){var p=dd.split('/');if(p.length===3)return p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')}return dd}
      var sd=fd(gv(tds[8]));var ed=fd(gv(tds[9]));
      if(!sd)sd=new Date().toISOString().slice(0,10);if(!ed)ed=sd;
      treats.push({medicine_code:code,medicine_name:gv(tds[2]),treatment_plan:'custom_interval',starts_at:sd+' '+st,ends_at:ed+' 23:59',emblist_it:true,force_medicine_code_in_production:false,emblist_in_unique_bag:false,is_if_needed_treatment:false,notes:gv(tds[10])||'',configs:[{first_take:sd+' '+st,dose:gv(tds[5])||'1',minutes_interval:mins}]});
    }
    if(!treats.length){alert('مفيش أصناف');return}
    downloadObjectAsJson({mode:'ONLY_UPDATE_OR_CREATE',patients:[{name:pname,external_id:inv,treatments:treats}]},inv);
  }catch(e){alert('خطأ: '+e.message)}
}

/* ─── CSS ─── */
if(!document.getElementById('ez-tools-css')){
  var css=document.createElement('style');css.id='ez-tools-css';
  css.textContent=
    '@keyframes ezIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}'+
    '#'+PID+' .eztb{width:100%;padding:14px 16px;border:1px solid #edf0f7;border-radius:14px;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#334155;display:flex;align-items:center;gap:12px;transition:all 0.2s;text-align:right;direction:rtl}'+
    '#'+PID+' .eztb:hover{border-color:#c7d2fe;background:#f8f9ff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,0.08)}'+
    '#'+PID+' .ezic{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}'+
    '#'+PID+' .ez-sep{height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:6px 0}';
  document.head.appendChild(css);
}

/* ─── Panel ─── */
var p=document.createElement('div');p.id=PID;
p.style.cssText='position:fixed;top:14px;right:14px;z-index:999999;width:350px;background:#fff;border-radius:20px;overflow:visible;box-shadow:0 12px 40px rgba(15,23,42,0.08),0 0 0 1px rgba(99,102,241,0.06);font-family:Segoe UI,Cairo,Tahoma,sans-serif;animation:ezIn 0.35s ease;direction:rtl';

p.innerHTML=
/* Header */
'<div style="background:linear-gradient(135deg,#fafbff,#eef2ff);padding:18px 20px 14px;border-bottom:1px solid #edf0f7;border-radius:20px 20px 0 0">'+
  '<div style="display:flex;align-items:center;justify-content:space-between">'+
    '<div style="display:flex;align-items:center;gap:10px">'+
      '<div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#a5b4fc,#818cf8);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:900;box-shadow:0 4px 14px rgba(129,140,248,0.25)">EZ</div>'+
      '<div><div style="font-size:16px;font-weight:900;color:#312e81">EZ Tools</div><div style="font-size:10px;color:#a5b4fc;font-weight:600">v1.4 — أدوات مساعدة</div></div>'+
    '</div>'+
    '<button id="ez-t-close" style="width:28px;height:28px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#94a3b8;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#94a3b8\'">×</button>'+
  '</div>'+
'</div>'+

/* Tools */
'<div id="ez-tools-body" style="padding:14px 16px 6px;display:flex;flex-direction:column;gap:8px">'+

  /* 1: بحث الطلبات */
  '<button class="eztb" id="ez-t-search">'+
    '<div class="ezic" style="background:#faf5ff;color:#a855f7">🔍</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">بحث الطلبات</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">فحص وفتح الطلبات تلقائياً</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 2: تقفيل الطلبات */
  '<button class="eztb" id="ez-t-close-orders">'+
    '<div class="ezic" style="background:#fef2f2;color:#ef4444">📝</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">تقفيل الطلبات</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">تسليم وتصدير الطلبات المجهزة</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 3: إضافة صنف */
  '<button class="eztb" id="ez-t-add">'+
    '<div class="ezic" style="background:#eff6ff;color:#60a5fa">➕</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">إضافة صنف</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">إضافة دواء من ملف Excel/CSV</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 4: تعديل الطباعة */
  '<button class="eztb" id="ez-t-editor">'+
    '<div class="ezic" style="background:#fefce8;color:#eab308">✏️</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">تعديل الطباعة</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">Nahdi Editor</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 5: البحث الشامل */
  '<button class="eztb" id="ez-t-radar">'+
    '<div class="ezic" style="background:#f0fdf4;color:#22c55e">📡</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">البحث الشامل</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">Radar — بحث متقدم</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 6: FarEye */
  '<button class="eztb" id="ez-t-fareye">'+
    '<div class="ezic" style="background:#fdf4ff;color:#d946ef">🚀</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">FarEye</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">FarEye Injector</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* ─── Separator ─── */
  '<div class="ez-sep"></div>'+

  /* 7: تحميل الملف */
  '<button class="eztb" id="ez-t-dl">'+
    '<div class="ezic" style="background:#ecfdf5;color:#34d399">📥</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">تحميل الملف</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">بدون مسح البيانات</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

  /* 8: طباعة الملخص */
  '<button class="eztb" id="ez-t-pr">'+
    '<div class="ezic" style="background:#f0f9ff;color:#38bdf8">🖨️</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b">طباعة الملخص</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">Print Summary</div></div>'+
    '<span style="color:#d1d5db">◂</span>'+
  '</button>'+

'</div>'+

/* Footer */
'<div style="padding:8px 20px 10px;text-align:center;border-top:1px solid #f1f5f9;margin-top:2px">'+
  '<div style="font-size:9px;color:#c7d2fe;font-weight:700;letter-spacing:1px">EZ TOOLS v1.4 — DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';

document.body.appendChild(p);

/* ═══ EVENTS ═══ */

/* Close panel */
document.getElementById('ez-t-close').onclick=function(){p.remove()};

/* 1: بحث الطلبات */
document.getElementById('ez-t-search').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/Search_Order.js','بحث الطلبات',true);
};

/* 2: تقفيل الطلبات */
document.getElementById('ez-t-close-orders').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/close%20receved.js','تقفيل الطلبات',true);
};

/* 3: إضافة صنف */
document.getElementById('ez-t-add').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/EZPillAddDrug.js','إضافة صنف',true);
};

/* 4: تعديل الطباعة */
document.getElementById('ez-t-editor').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/nahdi-editor.js','تعديل الطباعة',true);
};

/* 5: البحث الشامل */
document.getElementById('ez-t-radar').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/radar-ali-elbaz-v10.js','البحث الشامل',true);
};

/* 6: FarEye */
document.getElementById('ez-t-fareye').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/fareye_injector.js','FarEye',true);
};

/* 7: تحميل الملف */
document.getElementById('ez-t-dl').onclick=function(){
  safeDownload();
};

/* 8: طباعة الملخص */
document.getElementById('ez-t-pr').onclick=function(){
  if(typeof printsum==='function'){printsum()}else{alert('فانكشن الطباعة مش موجودة')}
};

})();

(function(){
'use strict';

/* ══════════════════════════════════════════
   EZ TOOLS v1.4 — Glass Morphism
   ══════════════════════════════════════════ */

var PID='ez-tools-main';
var old=document.getElementById(PID);if(old){old.remove();return}

var SECRET='101093';

/* ─── Loader ─── */
function loadTool(url,name,closePanel){
  if(closePanel){var pp=document.getElementById(PID);if(pp)pp.remove()}
  var full=url+(url.indexOf('?')>-1?'&':'?')+'t='+Date.now();
  fetch(full).then(function(r){
    if(!r.ok)throw new Error(r.status);
    return r.text();
  }).then(function(code){
    try{new Function(code)()}catch(e){alert('خطأ في '+name+': '+e.message)}
  }).catch(function(err){
    try{
      var x=new XMLHttpRequest();
      x.open('GET',full,true);
      x.onload=function(){if(x.status===200){try{new Function(x.responseText)()}catch(e){alert('خطأ في '+name+': '+e.message)}}else{alert('فشل تحميل '+name)}};
      x.onerror=function(){alert('فشل تحميل '+name)};
      x.send();
    }catch(e2){alert('فشل تحميل '+name)}
  });
}

/* ─── Password ─── */
function checkPass(name,cb){
  var pass=prompt('🔒 أدخل الرقم السري لـ '+name+':');
  if(pass===null)return;
  if(pass===SECRET){cb()}
  else{alert('❌ الرقم السري غلط')}
}

/* ─── Safe Download (silent) ─── */
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
      function fd(dd){if(!dd||dd.indexOf('yyyy')>-1||dd.indexOf('mm/dd')>-1)return'';if(dd.indexOf('/')>-1){var p=dd.split('/');if(p.length===3)return p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')}return dd}
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
    '@keyframes ezSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes ezShine{0%{background-position:200% center}100%{background-position:-200% center}}'+
    '#'+PID+'{position:fixed;top:14px;right:14px;z-index:999999;width:370px;border-radius:24px;overflow:hidden;'+
      'background:rgba(255,255,255,0.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);'+
      'border:1px solid rgba(255,255,255,0.45);'+
      'box-shadow:0 20px 60px rgba(0,0,0,0.08),0 0 0 1px rgba(255,255,255,0.5) inset;'+
      'font-family:Segoe UI,Cairo,Tahoma,sans-serif;animation:ezSlideIn 0.45s cubic-bezier(0.16,1,0.3,1);direction:rtl}'+
    '#'+PID+' .eztb{width:100%;padding:13px 16px;border:1px solid rgba(255,255,255,0.5);border-radius:16px;'+
      'background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);'+
      'cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#334155;'+
      'display:flex;align-items:center;gap:12px;transition:all 0.25s;text-align:right;direction:rtl;box-sizing:border-box}'+
    '#'+PID+' .eztb:hover{background:rgba(255,255,255,0.85);border-color:#c7d2fe;'+
      'transform:translateY(-2px);box-shadow:0 8px 24px rgba(102,126,234,0.12),0 0 0 1px rgba(99,102,241,0.08)}'+
    '#'+PID+' .eztb:active{transform:translateY(0);box-shadow:0 2px 8px rgba(102,126,234,0.08) inset}'+
    '#'+PID+' .ezic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;'+
      'border:1px solid rgba(255,255,255,0.6);box-shadow:0 2px 8px rgba(0,0,0,0.04)}'+
    '#'+PID+' .ez-sep{height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent);margin:4px 0}'+
    '#'+PID+' .ez-lock{font-size:13px;color:#c7d2fe;filter:drop-shadow(0 1px 2px rgba(99,102,241,0.2))}'+
    '#'+PID+' .ez-arrow{font-size:13px;color:#d1d5db;transition:transform 0.2s}'+
    '#'+PID+' .eztb:hover .ez-arrow{transform:translateX(-3px);color:#a5b4fc}';
  document.head.appendChild(css);
}

/* ─── Panel ─── */
var p=document.createElement('div');p.id=PID;

p.innerHTML=
/* ── Header ── */
'<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:24px 24px 20px;position:relative;overflow:hidden">'+
  '<div style="position:absolute;top:-40%;right:-20%;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%);border-radius:50%"></div>'+
  '<div style="position:absolute;bottom:-60%;left:-10%;width:160px;height:160px;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%);border-radius:50%"></div>'+
  '<div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1">'+
    '<div style="display:flex;align-items:center;gap:12px">'+
      '<div style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:900;box-shadow:0 4px 16px rgba(0,0,0,0.1)">EZ</div>'+
      '<div>'+
        '<div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.3px;text-shadow:0 2px 8px rgba(0,0,0,0.15)">EZ Tools</div>'+
        '<div style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:600">v1.4 — Glass Edition</div>'+
      '</div>'+
    '</div>'+
    '<button id="ez-t-close" style="width:30px;height:30px;border-radius:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.12);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);color:rgba(255,255,255,0.8);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s" onmouseover="this.style.background=\'rgba(239,68,68,0.3)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'rgba(255,255,255,0.12)\';this.style.color=\'rgba(255,255,255,0.8)\'">×</button>'+
  '</div>'+
'</div>'+

/* ── Body ── */
'<div style="padding:18px 20px 6px;display:flex;flex-direction:column;gap:8px">'+

  '<button class="eztb" id="ez-t-search">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#faf5ff,#f3e8ff)">🔍</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">بحث الطلبات</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">فحص وفتح الطلبات تلقائياً</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-close-orders">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#fef2f2,#fce7f3)">📝</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">تقفيل الطلبات</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">تسليم وتصدير الطلبات المجهزة</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-add">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#eff6ff,#dbeafe)">➕</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">إضافة صنف</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">إضافة دواء من ملف Excel/CSV</div></div>'+
    '<span class="ez-lock">🔒</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-editor">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#fefce8,#fef3c7)">✏️</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">تعديل الطباعة</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">Nahdi Editor</div></div>'+
    '<span class="ez-lock">🔒</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-radar">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7)">📡</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">البحث الشامل</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">Radar — بحث متقدم</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-fareye">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#fdf4ff,#f5d0fe)">🚀</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">FarEye</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">FarEye Injector</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

  '<div class="ez-sep"></div>'+

  '<button class="eztb" id="ez-t-dl">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5)">📥</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">تحميل الملف</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">تحميل صامت بدون رسائل</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

  '<button class="eztb" id="ez-t-pr">'+
    '<div class="ezic" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe)">🖨️</div>'+
    '<div style="flex:1"><div style="font-weight:800;color:#1e293b;font-size:13px">طباعة الملخص</div><div style="font-size:10px;color:#94a3b8;margin-top:2px">Print Summary</div></div>'+
    '<span class="ez-arrow">◂</span>'+
  '</button>'+

'</div>'+

/* ── Footer ── */
'<div style="padding:10px 24px 14px;text-align:center;border-top:1px solid rgba(99,102,241,0.08);margin-top:4px">'+
  '<div style="font-size:9px;color:#a5b4fc;font-weight:700;letter-spacing:1px">EZ TOOLS v1.4 — DEVELOPED BY ALI EL-BAZ</div>'+
'</div>';

document.body.appendChild(p);

/* ═══ EVENTS ═══ */

document.getElementById('ez-t-close').onclick=function(){
  p.style.transition='all 0.3s cubic-bezier(0.4,0,1,1)';
  p.style.opacity='0';p.style.transform='translateY(-20px) scale(0.95)';
  setTimeout(function(){p.remove()},300);
};

document.getElementById('ez-t-search').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/Search_Order.js','بحث الطلبات',true);
};

document.getElementById('ez-t-close-orders').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/close%20receved.js','تقفيل الطلبات',true);
};

document.getElementById('ez-t-add').onclick=function(){
  checkPass('إضافة صنف',function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/EZPillAddDrug.js','إضافة صنف',true);
  });
};

document.getElementById('ez-t-editor').onclick=function(){
  checkPass('تعديل الطباعة',function(){
    loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/nahdi-editor.js','تعديل الطباعة',true);
  });
};

document.getElementById('ez-t-radar').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/radar-ali-elbaz-v10.js','البحث الشامل',true);
};

document.getElementById('ez-t-fareye').onclick=function(){
  loadTool('https://raw.githubusercontent.com/bazkoo2000/ez-pill-pro/refs/heads/main/fareye_injector.js','FarEye',true);
};

document.getElementById('ez-t-dl').onclick=function(){safeDownload()};

document.getElementById('ez-t-pr').onclick=function(){if(typeof printsum==='function'){printsum()}};

})();

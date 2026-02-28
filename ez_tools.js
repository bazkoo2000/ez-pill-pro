(function(){
'use strict';

/* ══════════════════════════════════════════
   EZ TOOLS v1.0
   ══════════════════════════════════════════ */

/* ─── Helpers ─── */
function n(t){return(t||'').toString().trim().replace(/\s+/g,' ')}
function nl(t){return n(t).toLowerCase()}
function fire(el){
  try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
  try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}
  try{el.dispatchEvent(new Event('blur',{bubbles:true}))}catch(e){}
}
function findT(){
  var ts=document.querySelectorAll('table.styled-table.table-bordered');
  for(var i=0;i<ts.length;i++){var ths=ts[i].querySelectorAll('tr th');for(var j=0;j<ths.length;j++){if(nl(ths[j].textContent)==='note')return ts[i]}}
  return document.querySelector('table.styled-table.table-bordered');
}
function colIdx(ths,name){name=nl(name);for(var i=0;i<ths.length;i++){var t=nl(ths[i].textContent);if(t===name||t.indexOf(name)>-1)return i}return-1}
function getCellInput(td){if(!td)return null;return td.querySelector('input,textarea,select')}
function setCell(td,val){if(!td)return;var inp=getCellInput(td);if(inp){inp.value=String(val);fire(inp)}else{td.textContent=String(val)}}
function clearRow(row){
  if(!row)return;row.removeAttribute('style');
  if(row.dataset){delete row.dataset.spDupAuto;delete row.dataset.spAutoChild;delete row.dataset.spSkipDup;delete row.dataset.originalDuplicate}
  var inputs=row.querySelectorAll('input,textarea,select');
  for(var i=0;i<inputs.length;i++){var x=inputs[i];if(x.type==='checkbox'){x.checked=false;fire(x)}else if(x.tagName==='SELECT'){x.selectedIndex=0;fire(x)}else{x.value='';fire(x)}}
}

/* ─── CSV/Excel ─── */
function parseCSV(text){var lines=text.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(function(x){return x.length});if(!lines.length)return[];var sep=lines[0].indexOf('\t')>-1?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');function splitLine(line){var out=[],cur='',q=false;for(var i=0;i<line.length;i++){var ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else{q=!q}}else if(ch===sep&&!q){out.push(cur);cur=''}else{cur+=ch}}out.push(cur);return out.map(function(s){return n(s.replace(/^"|"$/g,''))})}var head=splitLine(lines[0]).map(nl);var iN=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});var iC=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});if(iN<0)iN=0;if(iC<0)iC=1;var db=[];for(var r=1;r<lines.length;r++){var cols=splitLine(lines[r]);var nm=cols[iN]||'';var cd=cols[iC]||'';if(nm||cd)db.push({name:n(nm),code:n(cd)})}return db}
function ensureXLSX(cb){if(window.XLSX)return cb(true);var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=function(){cb(!!window.XLSX)};s.onerror=function(){cb(false)};document.head.appendChild(s)}
function parseExcel(file,cb){var ext=(file.name||'').toLowerCase();if(ext.endsWith('.csv')){var fr=new FileReader();fr.onload=function(){cb(parseCSV(String(fr.result||'')))};fr.readAsText(file);return}ensureXLSX(function(ok){if(!ok){cb(null);return}var fr=new FileReader();fr.onload=function(e){try{var data=new Uint8Array(e.target.result);var wb=XLSX.read(data,{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false});if(!rows||!rows.length){cb([]);return}var head=(rows[0]||[]).map(function(x){return nl(String(x||''))});var iN=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});var iC=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});if(iN<0)iN=0;if(iC<0)iC=1;var db=[];for(var i=1;i<rows.length;i++){var r=rows[i]||[];var nm=n(r[iN]);var cd=n(r[iC]);if(nm||cd)db.push({name:nm,code:cd})}cb(db)}catch(err){cb(null)}};fr.readAsArrayBuffer(file)})}
function matchDrug(db,q){q=nl(q);if(!q)return null;var exact=db.find(function(x){return nl(x.code)===q||nl(x.name)===q});if(exact)return exact;var byC=db.find(function(x){return nl(x.code).indexOf(q)>-1});if(byC)return byC;return db.find(function(x){return nl(x.name).indexOf(q)>-1})||null}
function addRowWith(name,code){var table=findT();if(!table)return false;var header=table.querySelector('tr');if(!header)return false;var hs=header.querySelectorAll('th,td');var iN=colIdx(hs,'name'),iC=colIdx(hs,'code');if(iN<0||iC<0)return false;var tbody=(table.tBodies&&table.tBodies.length)?table.tBodies[0]:table;var rows=[].slice.call(tbody.querySelectorAll('tr')).filter(function(r){return r.querySelectorAll('th').length===0});if(!rows.length)return false;var base=rows[rows.length-1];var newRow=base.cloneNode(true);clearRow(newRow);var tds=newRow.querySelectorAll('td');if(!tds.length||Math.max(iN,iC)>=tds.length)return false;if(tds[0]&&tds[0].querySelector('input.checkk')){tds[0].querySelector('input.checkk').checked=true;fire(tds[0].querySelector('input.checkk'))}setCell(tds[iN],name||'');setCell(tds[iC],code||'');setCell(tds[3],1);setCell(tds[5],1);tbody.appendChild(newRow);newRow.scrollIntoView({block:'center'});return true}

/* ─── Safe Download ─── */
function safeDownload(){
  try{
    var pname=(document.getElementById('pname')||{}).value||'';
    var mobile=(document.getElementById('mobile')||{}).value||'';
    var inv=(document.getElementById('InvoiceNo')||{innerText:''}).innerText.trim()||'';
    if(!pname||!mobile){alert('الاسم أو الموبايل فاضي');return}
    if(!inv){alert('رقم الفاتورة مش موجود');return}
    var treats=[];var rows=document.querySelectorAll('table.styled-table tr');
    for(var r=1;r<rows.length;r++){var tds=rows[r].querySelectorAll('td');if(tds.length<10)continue;
      function gv(td){if(!td)return'';var inp=td.querySelector('input,textarea');if(inp)return inp.value.trim();var sel=td.querySelector('select');if(sel){var o=sel.options[sel.selectedIndex];return o?o.text.trim():''}return td.textContent.trim()}
      var code=gv(tds[1]);if(!code||code.length<3)continue;
      var every=gv(tds[6])||'';var mins=1440;if(every.indexOf('12')>-1)mins=720;else if(every.indexOf('8')>-1)mins=480;else if(every.indexOf('6')>-1)mins=360;else if(every.indexOf('4')>-1)mins=240;
      var st=gv(tds[7])||'09:00';if(st.toUpperCase().indexOf('PM')>-1){var pts=st.replace(/[^0-9:]/g,'').split(':');var hr=parseInt(pts[0])||0;if(hr<12)hr+=12;st=String(hr)+':'+(pts[1]||'00')}else{st=st.replace(/[^0-9:]/g,'')}if(!st||st.length<3)st='09:00';
      function fd(dd){if(!dd||dd.indexOf('yyyy')>-1||dd.indexOf('mm/dd')>-1)return'';if(dd.indexOf('/')>-1){var p=dd.split('/');if(p.length===3)return p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')}return dd}
      var sd=fd(gv(tds[8]));var ed=fd(gv(tds[9]));if(!sd)sd=new Date().toISOString().slice(0,10);if(!ed)ed=sd;
      treats.push({medicine_code:code,medicine_name:gv(tds[2]),treatment_plan:'custom_interval',starts_at:sd+' '+st,ends_at:ed+' 23:59',emblist_it:true,force_medicine_code_in_production:false,emblist_in_unique_bag:false,is_if_needed_treatment:false,notes:gv(tds[10])||'',configs:[{first_take:sd+' '+st,dose:gv(tds[5])||'1',minutes_interval:mins}]})
    }
    if(!treats.length){alert('مفيش أصناف');return}
    downloadObjectAsJson({mode:'ONLY_UPDATE_OR_CREATE',patients:[{name:pname,external_id:inv,treatments:treats}]},inv);
  }catch(e){alert('خطأ: '+e.message)}
}

/* ═══════════════════════════════════════════
   BUILD UI
   ═══════════════════════════════════════════ */
var PID='ez-tools-main';
var old=document.getElementById(PID);if(old){old.remove();return}

if(!document.getElementById('ez-tools-css')){var css=document.createElement('style');css.id='ez-tools-css';css.textContent='@keyframes ezIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}#'+PID+' .eztb{width:100%;padding:14px 16px;border:1px solid #edf0f7;border-radius:14px;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#334155;display:flex;align-items:center;gap:12px;transition:all 0.2s;text-align:right;direction:rtl}#'+PID+' .eztb:hover{border-color:#c7d2fe;background:#f8f9ff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,0.08)}#'+PID+' .ezic{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}#'+PID+' .ezsub{display:none;margin-top:10px;padding:14px;border-radius:14px;border:1px solid #edf0f7;background:#fafbff;animation:ezIn 0.25s ease}';document.head.appendChild(css)}

var p=document.createElement('div');p.id=PID;
p.style.cssText='position:fixed;top:14px;right:14px;z-index:999999;width:350px;background:#fff;border-radius:20px;overflow:visible;box-shadow:0 12px 40px rgba(15,23,42,0.08),0 0 0 1px rgba(99,102,241,0.06);font-family:Segoe UI,Cairo,Tahoma,sans-serif;animation:ezIn 0.35s ease;direction:rtl';

p.innerHTML=
'<div style="background:linear-gradient(135deg,#fafbff,#eef2ff);padding:18px 20px 14px;border-bottom:1px solid #edf0f7">'+
  '<div style="display:flex;align-items:center;justify-content:space-between">'+
    '<div style="display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#a5b4fc,#818cf8);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:900;box-shadow:0 4px 14px rgba(129,140,248,0.25)">EZ</div><div><div style="font-size:16px;font-weight:900;color:#312e81">EZ Tools</div><div style="font-size:10px;color:#a5b4fc;font-weight:600">أدوات مساعدة</div></div></div>'+
    '<button id="ez-t-close" style="width:28px;height:28px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#94a3b8;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#94a3b8\'">×</button>'+
  '</div>'+
'</div>'+
'<div style="padding:14px 16px 6px;display:flex;flex-direction:column;gap:8px">'+

  '<button class="eztb" id="ez-t-add"><div class="ezic" style="background:#eff6ff;color:#60a5fa">➕</div><div style="flex:1"><div style="font-weight:800;color:#1e293b">إضافة صنف</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">إضافة دواء من ملف Excel/CSV</div></div><span style="color:#d1d5db">◂</span></button>'+
  '<div class="ezsub" id="ez-s-add">'+
    '<div style="margin-bottom:10px"><div style="font-weight:700;color:#64748b;margin-bottom:5px;font-size:11px">📁 ملف الأصناف</div><input id="ez-f-file" type="file" accept=".xlsx,.xls,.csv" style="width:100%;padding:8px;border:2px dashed #dde3ee;border-radius:8px;background:#f8fafc;font-size:11px;box-sizing:border-box;cursor:pointer"></div>'+
    '<div style="margin-bottom:10px;position:relative"><div style="font-weight:700;color:#64748b;margin-bottom:5px;font-size:11px">🔍 بحث</div><input id="ez-f-q" type="text" placeholder="اسم أو كود..." style="width:100%;padding:10px 12px;border:1px solid #dde3ee;border-radius:8px;font-size:12px;box-sizing:border-box;font-family:inherit;direction:rtl"><div id="ez-f-sug" style="position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e8ecf4;border-radius:8px;max-height:160px;overflow-y:auto;display:none;z-index:1000000;box-shadow:0 6px 20px rgba(0,0,0,0.06);margin-top:3px"></div></div>'+
    '<button id="ez-f-go" style="width:100%;padding:10px;border-radius:8px;border:none;background:linear-gradient(145deg,#a5b4fc,#818cf8);color:#fff;cursor:pointer;font-weight:800;font-size:13px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.transform=\'\'">➕ إضافة</button>'+
    '<div id="ez-f-st" style="margin-top:8px;padding:6px;border-radius:6px;background:#f1f5f9;font-size:10px;color:#64748b;text-align:center;font-weight:600"></div>'+
  '</div>'+

  '<button class="eztb" id="ez-t-dl"><div class="ezic" style="background:#ecfdf5;color:#34d399">📥</div><div style="flex:1"><div style="font-weight:800;color:#1e293b">تحميل الملف</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">بدون مسح البيانات</div></div><span style="color:#d1d5db">◂</span></button>'+

  '<button class="eztb" id="ez-t-pr"><div class="ezic" style="background:#f0f9ff;color:#38bdf8">🖨️</div><div style="flex:1"><div style="font-weight:800;color:#1e293b">طباعة الملخص</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">Print Summary</div></div><span style="color:#d1d5db">◂</span></button>'+

'</div>'+
'<div style="padding:8px 20px 10px;text-align:center;border-top:1px solid #f1f5f9;margin-top:2px"><div style="font-size:9px;color:#c7d2fe;font-weight:700;letter-spacing:1px">EZ TOOLS v1.0</div></div>';

document.body.appendChild(p);

/* ─── Events ─── */
document.getElementById('ez-t-close').onclick=function(){p.remove()};

/* Add Drug toggle */
var subAdd=document.getElementById('ez-s-add'),addOpen=false;
if(!window.EZPillDrugDB)window.EZPillDrugDB=[];
document.getElementById('ez-t-add').onclick=function(){
  addOpen=!addOpen;subAdd.style.display=addOpen?'block':'none';
  var ic=this.querySelector('.ezic');ic.style.background=addOpen?'linear-gradient(145deg,#a5b4fc,#818cf8)':'#eff6ff';ic.style.color=addOpen?'#fff':'#60a5fa';
  if(addOpen){var st=document.getElementById('ez-f-st');st.textContent=window.EZPillDrugDB.length?'✅ '+window.EZPillDrugDB.length+' صنف محمّل':'📁 ارفع ملف الأصناف';setTimeout(function(){document.getElementById('ez-f-q').focus()},100)}
};

document.getElementById('ez-f-file').onchange=function(){
  var f=this.files&&this.files[0];if(!f)return;var st=document.getElementById('ez-f-st');st.textContent='⏳ جاري التحميل...';
  parseExcel(f,function(db){if(db===null){st.textContent='❌ خطأ';return}window.EZPillDrugDB=db||[];st.textContent='✅ '+window.EZPillDrugDB.length+' صنف';document.getElementById('ez-f-q').focus()})
};

document.getElementById('ez-f-q').oninput=function(){
  var q=this.value,sug=document.getElementById('ez-f-sug');sug.innerHTML='';
  if(q.length>0&&window.EZPillDrugDB.length){
    var m=window.EZPillDrugDB.filter(function(it){return nl(it.name).indexOf(nl(q))>-1||nl(it.code).indexOf(nl(q))>-1}).slice(0,10);
    if(m.length){for(var i=0;i<m.length;i++){(function(item){var d=document.createElement('div');d.style.cssText='padding:8px 12px;cursor:pointer;border-bottom:1px solid #f5f5f5;direction:rtl';d.innerHTML='<div style="font-weight:700;font-size:11px;color:#1e293b">'+item.name+'</div><div style="font-size:9px;color:#94a3b8">'+item.code+'</div>';d.onmouseover=function(){this.style.background='#f8f9ff'};d.onmouseout=function(){this.style.background=''};d.onclick=function(){document.getElementById('ez-f-q').value=item.name;sug.style.display='none';document.getElementById('ez-f-q').focus()};sug.appendChild(d)})(m[i])}sug.style.display='block'}else{sug.style.display='none'}
  }else{sug.style.display='none'}
};

function doAdd(){var q=document.getElementById('ez-f-q').value||'';var st=document.getElementById('ez-f-st');if(!window.EZPillDrugDB||!window.EZPillDrugDB.length){st.textContent='⚠️ ارفع الملف أولاً';return}var item=matchDrug(window.EZPillDrugDB,q);if(!item){st.textContent='❌ مش موجود: '+q;return}if(addRowWith(item.name,item.code)){st.textContent='✅ '+item.name;document.getElementById('ez-f-q').value='';document.getElementById('ez-f-sug').style.display='none'}else{st.textContent='❌ فشل — الجدول مش موجود'}}
document.getElementById('ez-f-go').onclick=doAdd;
document.getElementById('ez-f-q').onkeydown=function(e){if(e.key==='Enter')doAdd()};

/* Download */
document.getElementById('ez-t-dl').onclick=function(){safeDownload()};

/* Print */
document.getElementById('ez-t-pr').onclick=function(){if(typeof printsum==='function'){printsum()}else{alert('فانكشن الطباعة مش موجودة')}};

})();

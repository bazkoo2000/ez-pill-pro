javascript:(async function(){

/* ═══════════════════════════════════════════════════════
   🏥 مستخرج فروع النهدي v4 - بوكماركلت بواجهة كاملة
   يُحقن مباشرة داخل صفحة rtlapps.nahdi.sa
═══════════════════════════════════════════════════════ */

/* ═══ إزالة أي نسخة سابقة ═══ */
if(document.getElementById('nahdi-dash')){document.getElementById('nahdi-dash').remove();}

/* ═══ بناء الواجهة ═══ */
const dash=document.createElement('div');
dash.id='nahdi-dash';
dash.innerHTML=`
<style>
#nahdi-dash{position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background:#f0f2f5;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;overflow-y:auto;overflow-x:hidden;}
#nahdi-dash *{box-sizing:border-box;margin:0;padding:0;}
.nx-header{background:linear-gradient(135deg,#003d7a,#0057a8,#0070d4);color:#fff;padding:20px 24px;position:sticky;top:0;z-index:10;box-shadow:0 4px 20px rgba(0,57,122,.25);}
.nx-htop{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
.nx-title{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;}
.nx-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:36px;height:36px;border-radius:8px;font-size:18px;cursor:pointer;}
.nx-close:hover{background:rgba(255,255,255,.3);}
.nx-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px;}
.nx-st{background:rgba(255,255,255,.12);border-radius:8px;padding:12px;border:1px solid rgba(255,255,255,.1);}
.nx-st .lb{font-size:11px;opacity:.7;margin-bottom:3px;}
.nx-st .vl{font-size:24px;font-weight:800;line-height:1;}
.nx-st.s1 .vl{color:#6ff5c0;} .nx-st.s2 .vl{color:#fff;} .nx-st.s3 .vl{color:#ffd866;} .nx-st.s4 .vl{color:rgba(255,255,255,.45);} .nx-st.s5 .vl{font-size:18px;}
.nx-pbar{height:8px;background:rgba(255,255,255,.15);border-radius:10px;overflow:hidden;}
.nx-pfill{height:100%;background:linear-gradient(90deg,#6ff5c0,#00b894);border-radius:10px;width:0%;transition:width .4s;}
.nx-pfill.run::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:nxshim 1.5s infinite;}
@keyframes nxshim{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.nx-plbl{display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;opacity:.85;}
.nx-ctrl{padding:12px 24px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#fff;border-bottom:1px solid #e2e8f0;}
.nx-ctrl label{font-size:13px;color:#6b7280;font-weight:500;}
.nx-ctrl input[type=number]{width:75px;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:600;text-align:center;outline:none;}
.nx-ctrl input[type=number]:focus{border-color:#0057a8;box-shadow:0 0 0 3px #e8f0fe;}
.nx-ctrl select{padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;background:#fff;}
.nx-btn{padding:9px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s;}
.nx-go{background:#0057a8;color:#fff;box-shadow:0 2px 8px rgba(0,87,168,.3);} .nx-go:hover{background:#004690;}
.nx-go:disabled{background:#94a3b8;cursor:not-allowed;box-shadow:none;}
.nx-stop{background:#e74c3c;color:#fff;display:none;} .nx-stop:hover{background:#c0392b;}
.nx-csv{background:#00b894;color:#fff;margin-right:auto;} .nx-csv:hover{background:#00a884;} .nx-csv:disabled{background:#94a3b8;cursor:not-allowed;}
.nx-search{flex:1;max-width:250px;margin-right:auto;position:relative;}
.nx-search input{width:100%;padding:7px 10px 7px 32px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;}
.nx-search input:focus{border-color:#0057a8;}
.nx-search .ico{position:absolute;left:9px;top:50%;transform:translateY(-50%);font-size:13px;color:#6b7280;}
.nx-tbl-wrap{margin:8px 24px 24px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #e2e8f0;overflow:hidden;}
.nx-tbl{width:100%;border-collapse:collapse;}
.nx-tbl thead th{background:#f8fafc;padding:12px 14px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2e8f0;text-align:right;position:sticky;top:0;}
.nx-tbl thead th:first-child{text-align:center;width:45px;}
.nx-tbl tbody tr{border-bottom:1px solid #f1f5f9;transition:background .15s;}
.nx-tbl tbody tr:hover{background:#f8fafc;}
.nx-tbl tbody tr.nx-new{animation:nxrow .4s ease-out;background:rgba(0,184,148,.12);}
@keyframes nxrow{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.nx-tbl tbody td{padding:10px 14px;font-size:14px;vertical-align:middle;}
.nx-tbl tbody td:first-child{text-align:center;font-weight:700;color:#6b7280;font-size:12px;}
.nx-code{display:inline-block;background:#e8f0fe;color:#0057a8;padding:2px 8px;border-radius:5px;font-weight:700;font-size:13px;font-family:'Courier New',monospace;}
.nx-name{font-weight:600;}
.nx-addr{color:#6b7280;font-size:13px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nx-map{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#e8f5e9;color:#2e7d32;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;}
.nx-map:hover{background:#c8e6c9;}
.nx-nomap{color:#ccc;font-size:12px;}
.nx-empty{text-align:center;padding:60px 20px;color:#6b7280;}
.nx-empty .ei{font-size:42px;margin-bottom:12px;}
.nx-scan{display:none;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,.8);}
.nx-dot{width:8px;height:8px;background:#6ff5c0;border-radius:50%;animation:nxpls 1s infinite;}
@keyframes nxpls{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
</style>

<div class="nx-header">
  <div class="nx-htop">
    <div class="nx-title">🏥 مستخرج فروع النهدي v4</div>
    <div class="nx-scan" id="nxScan"><span class="nx-dot"></span><span id="nxCurCode">...</span></div>
    <button class="nx-close" id="nxClose" title="إغلاق">✕</button>
  </div>
  <div class="nx-stats">
    <div class="nx-st s1"><div class="lb">فروع جدة ✅</div><div class="vl" id="nxF">0</div></div>
    <div class="nx-st s2"><div class="lb">تم الفحص 📊</div><div class="vl" id="nxS">0</div></div>
    <div class="nx-st s3"><div class="lb">مدن أخرى ⏭️</div><div class="vl" id="nxSk">0</div></div>
    <div class="nx-st s4"><div class="lb">فارغ 📭</div><div class="vl" id="nxE">0</div></div>
    <div class="nx-st s5"><div class="lb">الوقت ⏱️</div><div class="vl" id="nxT">0:00</div></div>
  </div>
  <div class="nx-plbl"><span id="nxPct">0%</span><span id="nxRng">0 / 0</span></div>
  <div class="nx-pbar"><div class="nx-pfill" id="nxBar" style="position:relative;"></div></div>
</div>

<div class="nx-ctrl">
  <label>من:</label><input type="number" id="nxStart" value="1000" min="1">
  <label>إلى:</label><input type="number" id="nxEnd" value="1400" min="1">
  <label>المدينة:</label>
  <select id="nxCity">
    <option value="جدة">جدة</option><option value="الرياض">الرياض</option><option value="مكة">مكة</option>
    <option value="المدينة">المدينة</option><option value="الدمام">الدمام</option><option value="">الكل</option>
  </select>
  <button class="nx-btn nx-go" id="nxGo">🚀 ابدأ</button>
  <button class="nx-btn nx-stop" id="nxStp">⏹ إيقاف</button>
  <div class="nx-search"><span class="ico">🔍</span><input type="text" id="nxQ" placeholder="بحث..." oninput="window._nxFilter()"></div>
  <button class="nx-btn nx-csv" id="nxDl" disabled>📥 CSV</button>
</div>

<div class="nx-tbl-wrap">
  <table class="nx-tbl">
    <thead><tr><th>#</th><th>رقم الصيدلية</th><th>اسم الصيدلية</th><th>العنوان</th><th>المدينة</th><th>جوجل ماب</th></tr></thead>
    <tbody id="nxBody"></tbody>
  </table>
  <div class="nx-empty" id="nxEmpty"><div class="ei">📋</div><p>اضغط <b>ابدأ</b> لسحب بيانات الفروع</p></div>
</div>
`;
document.body.appendChild(dash);

/* ═══ State ═══ */
let running=false,stop=false,results=[],seen=new Set(),st={s:0,f:0,sk:0,e:0},t0,timer,ifr;

/* ═══ Close button ═══ */
document.getElementById('nxClose').onclick=function(){
    stop=true;
    if(ifr){ifr.remove();ifr=null;}
    clearInterval(timer);
    dash.remove();
};

/* ═══ UI helpers ═══ */
function upStats(){
    document.getElementById('nxF').textContent=st.f;
    document.getElementById('nxS').textContent=st.s;
    document.getElementById('nxSk').textContent=st.sk;
    document.getElementById('nxE').textContent=st.e;
    const tot=parseInt(document.getElementById('nxEnd').value)-parseInt(document.getElementById('nxStart').value)+1;
    const pct=tot>0?Math.round((st.s/tot)*100):0;
    document.getElementById('nxPct').textContent=pct+'%';
    document.getElementById('nxRng').textContent=st.s+' / '+tot;
    document.getElementById('nxBar').style.width=pct+'%';
}
function upTime(){
    if(!t0)return;
    const el=Math.floor((Date.now()-t0)/1000),m=Math.floor(el/60),s=el%60;
    document.getElementById('nxT').textContent=m+':'+String(s).padStart(2,'0');
}
function addRow(d,idx){
    document.getElementById('nxEmpty').style.display='none';
    const tb=document.getElementById('nxBody');
    const tr=document.createElement('tr');
    tr.className='nx-new';
    tr.dataset.q=(d.storeCode+' '+d.storeName+' '+d.storeAddress+' '+d.city).toLowerCase();
    const mc=d.googleMapsURL?'<a class="nx-map" href="'+d.googleMapsURL+'" target="_blank">📍 الموقع</a>':'<span class="nx-nomap">—</span>';
    tr.innerHTML='<td>'+idx+'</td><td><span class="nx-code">'+d.storeCode+'</span></td><td class="nx-name">'+d.storeName+'</td><td class="nx-addr" title="'+d.storeAddress+'">'+d.storeAddress+'</td><td>'+d.city+'</td><td>'+mc+'</td>';
    tb.insertBefore(tr,tb.firstChild);
    setTimeout(function(){tr.classList.remove('nx-new');},500);
}
window._nxFilter=function(){
    const q=document.getElementById('nxQ').value.toLowerCase();
    document.querySelectorAll('#nxBody tr').forEach(function(r){r.style.display=r.dataset.q.includes(q)?'':'none';});
};

/* ═══ Load page ═══ */
function loadPg(url){
    return new Promise(function(res){
        let done=false;
        function fin(){if(!done){done=true;ifr.removeEventListener('load',onL);setTimeout(res,400);}}
        function onL(){fin();}
        ifr.addEventListener('load',onL);
        ifr.src=url;
        setTimeout(fin,3000);
    });
}

/* ═══ Extract ═══ */
function extract(doc){
    try{
        const cells=Array.from(doc.querySelectorAll('td'));
        if(!cells.length)return null;
        let d={storeCode:'',storeName:'',storeAddress:'',googleMapsURL:'',city:''};
        for(let c of cells){
            let t=c.innerText.trim();
            if(t.includes('Store Code'))d.storeCode=t.split(':').slice(1).join(':').trim();
            if(t.includes('Store Name'))d.storeName=t.split(':').slice(1).join(':').trim();
            if(t.includes('Store Address'))d.storeAddress=t.split(':').slice(1).join(':').trim();
            if(t.includes('City'))d.city=t.split(':').slice(1).join(':').trim();
        }
        const links=Array.from(doc.querySelectorAll('a'));
        for(let a of links){let h=a.href||a.getAttribute('href')||'';if(h.match(/google.*map|goo\.gl|maps\.app/i)){d.googleMapsURL=h;break;}}
        if(!d.googleMapsURL){const els=doc.querySelectorAll('[onclick]');for(let e of els){let o=e.getAttribute('onclick')||'';let m=o.match(/https?:\/\/[^\s'"]+(?:google|goo\.gl|maps)[^\s'"]*/i);if(m){d.googleMapsURL=m[0];break;}}}
        if(!d.googleMapsURL){let h=doc.body.innerHTML;let ps=[/https?:\/\/(?:www\.)?google\.[a-z.]+\/maps[^\s"'<>]*/gi,/https?:\/\/maps\.google\.[a-z.]+[^\s"'<>]*/gi,/https?:\/\/goo\.gl\/maps\/[^\s"'<>]*/gi,/https?:\/\/maps\.app\.goo\.gl\/[^\s"'<>]*/gi];for(let p of ps){let m=h.match(p);if(m){d.googleMapsURL=m[0];break;}}}
        return d;
    }catch(e){return null;}
}

/* ═══ CSV ═══ */
function dlCSV(){
    if(!results.length)return;
    let csv="\uFEFF"+"رقم الصيدلية,اسم الصيدلية,العنوان,رابط جوجل ماب,المدينة\n";
    results.forEach(function(d){
        csv+='"'+(d.storeCode||'').replace(/"/g,'""')+'","'+(d.storeName||'').replace(/"/g,'""')+'","'+(d.storeAddress||'').replace(/"/g,'""').replace(/\n/g,' ')+'","'+(d.googleMapsURL||'').replace(/"/g,'""')+'","'+(d.city||'').replace(/"/g,'""')+'"\n';
    });
    const b=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(b);
    a.download='Nahdi_'+(document.getElementById('nxCity').value||'All')+'_'+results.length+'_Stores_'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
}

document.getElementById('nxDl').onclick=dlCSV;

/* ═══ Main ═══ */
document.getElementById('nxGo').onclick=async function(){
    if(running)return;
    const s=parseInt(document.getElementById('nxStart').value);
    const e=parseInt(document.getElementById('nxEnd').value);
    const city=document.getElementById('nxCity').value;
    if(isNaN(s)||isNaN(e)||s>e){alert('⚠️ تأكد من النطاق');return;}

    running=true;stop=false;results=[];seen=new Set();st={s:0,f:0,sk:0,e:0};
    document.getElementById('nxBody').innerHTML='';
    document.getElementById('nxEmpty').innerHTML='<div class="ei">⏳</div><p>جاري الاستخراج...</p>';
    document.getElementById('nxEmpty').style.display='block';
    document.getElementById('nxGo').style.display='none';
    document.getElementById('nxStp').style.display='inline-flex';
    document.getElementById('nxDl').disabled=true;
    document.getElementById('nxStart').disabled=true;
    document.getElementById('nxEnd').disabled=true;
    document.getElementById('nxScan').style.display='flex';
    document.getElementById('nxBar').classList.add('run');

    ifr=document.createElement('iframe');
    ifr.style.cssText='position:fixed;top:-9999px;left:-9999px;width:1024px;height:768px;opacity:0;pointer-events:none;';
    document.body.appendChild(ifr);

    t0=Date.now();
    timer=setInterval(upTime,1000);

    const BASE="https://rtlapps.nahdi.sa/ssp/StoreDashboradOnline.asp?StoreCode=";

    for(let i=s;i<=e;i++){
        if(stop)break;
        st.s++;
        document.getElementById('nxCurCode').textContent='كود: '+i;
        upStats();
        await loadPg(BASE+i);
        let doc;
        try{doc=ifr.contentDocument||ifr.contentWindow.document;}catch(ex){st.e++;continue;}
        const data=extract(doc);
        if(!data||!data.storeName){st.e++;continue;}
        let ec=data.storeCode.trim(),rc=String(i);
        if(ec&&ec!==rc){st.e++;continue;}
        if(seen.has(ec))continue;
        seen.add(ec);
        if(city&&!data.city.includes(city)){st.sk++;continue;}
        data.storeCode=ec||rc;
        results.push(data);
        st.f++;
        upStats();
        addRow(data,st.f);
        document.getElementById('nxDl').disabled=false;
    }

    if(ifr){ifr.remove();ifr=null;}
    clearInterval(timer);upTime();running=false;
    document.getElementById('nxGo').style.display='inline-flex';
    document.getElementById('nxStp').style.display='none';
    document.getElementById('nxStart').disabled=false;
    document.getElementById('nxEnd').disabled=false;
    document.getElementById('nxScan').style.display='none';
    document.getElementById('nxBar').classList.remove('run');
    if(!results.length){document.getElementById('nxEmpty').innerHTML='<div class="ei">😕</div><p>لم يتم العثور على فروع</p>';document.getElementById('nxEmpty').style.display='block';}
};

document.getElementById('nxStp').onclick=function(){
    stop=true;
    document.getElementById('nxStp').textContent='⏳ جاري الإيقاف...';
    document.getElementById('nxStp').disabled=true;
};

})();

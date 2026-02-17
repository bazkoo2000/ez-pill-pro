javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_sys_v3';
  const VERSION = '3.8';
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }
  const MAX_PER_FILE = 49;
  const state = {
    savedRows: [],
    visitedSet: new Set(),
    openedWindows: [],
    startTime: null,
    isProcessing: false,
    lastPageSignature: null
  };
  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;
  // ─── Toast & Dialog (كود v3.1 الأصلي) ───
  function showToast(message, type = 'info') {
    let container = document.getElementById('ali-toast-container') || (function(){
      let c = document.createElement('div'); c.id = 'ali-toast-container';
      c.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(c); return c;
    })();
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 22px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Tajawal',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
  }
  // ─── UI (تصميم v3.1 بدون أي تغيير) ───
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}} @keyframes aliToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(styleEl);
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:3%;right:2%;width:400px;background:#fff;border-radius:28px;box-shadow:0 25px 60px rgba(0,0,0,0.15);z-index:999999;font-family:\'Tajawal\',sans-serif;direction:rtl;overflow:hidden;animation:aliSlideIn 0.6s';
  panel.innerHTML = `<div class="ali-inner"><div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px;color:white;"><div style="display:flex;justify-content:space-between;align-items:center"><span id="ali_close" style="cursor:pointer;background:rgba(239,68,68,0.2);padding:5px 10px;border-radius:8px">✕</span><h3 style="margin:0;font-size:20px;font-weight:900">مُنهي الطلبات</h3></div><div style="text-align:right;margin-top:4px"><span style="background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v3.8 Pro</span></div></div><div style="padding:22px" id="ali_body"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;text-align:center"><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_rec" style="font-size:20px;font-weight:900;color:#10b981">0</div><div style="font-size:9px">Received</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_pack" style="font-size:20px;font-weight:900;color:#f59e0b">0</div><div style="font-size:9px">Packed</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_done" style="font-size:20px;font-weight:900;color:#3b82f6">0</div><div style="font-size:9px">المنجز</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_total" style="font-size:20px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px">إجمالي</div></div></div><div id="ali_main_body"><div style="background:#f8fafc;padding:16px;border-radius:16px;margin-bottom:16px;border:1px solid #f1f5f9"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;font-weight:700">📄 صفحات الفحص</span><input type="number" id="p_lim" value="${defaultPages}" style="width:50px;text-align:center;font-weight:800;border:2px solid #e2e8f0;border-radius:8px"></div></div><div id="status-msg" style="padding:10px;background:#f0fdf4;color:#15803d;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;text-align:center">✅ جاهز للبدء</div><button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;">⚡ بدء المعالجة الذكية</button></div><div style="text-align:center;padding-top:14px;font-size:10px;color:#cbd5e1;font-weight:700">DEVELOPED BY ALI EL-BAZ</div></div></div>`;
  document.body.appendChild(panel);
  function updateStats() { let r=0,p=0,d=0; state.savedRows.forEach(x=>{if(x.st==='received')r++; if(x.st==='packed')p++; if(x.st==='processed')d++;}); document.getElementById('stat_rec').innerText=r; document.getElementById('stat_pack').innerText=p; document.getElementById('stat_done').innerText=d; document.getElementById('stat_total').innerText=state.savedRows.length; return r; }
  // ─── بصمة أقوى للكشف عن تغيير الجدول ───
  function getPageSignature() {
    const rows = Array.from(document.querySelectorAll('table tr')).slice(0,4);
    if (rows.length < 2) return null;
    return rows.map(row => row.querySelector('td, th') ? row.querySelector('td, th').innerText.trim() : '').join('|||');
  }
  async function collectWithCheck() {
    let startTime = Date.now();
    const maxWait = 45000;
    while (Date.now() - startTime < maxWait) {
      let currentSig = getPageSignature();
      if (currentSig && currentSig !== state.lastPageSignature && currentSig !== '') {
        state.lastPageSignature = currentSig;
        break;
      }
      await new Promise(r => setTimeout(r, 1200));
    }
    if (Date.now() - startTime >= maxWait) {
      showToast('⚠️ لم يتم اكتشاف تغيير كامل، جاري جمع قسري', 'warning');
    }
    let foundThisPage = 0;
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if(cells.length > 1 && cells[0].innerText.trim().startsWith('0')){
        const key = cells[0].innerText.trim();
        if(!state.visitedSet.has(key)){
          state.visitedSet.add(key);
          const txt = row.innerText.toLowerCase();
          const isR = txt.includes('received'), isP = txt.includes('packed');
          let hId = (row.querySelector('a')?.href.match(/head_id=([^&]+)/) || [])[1] || "";
          state.savedRows.push({id:key, onl:cells[1].innerText.trim(), node:row.cloneNode(true), st:isR?'received':(isP?'packed':'processed'), hid:hId});
          foundThisPage++;
        }
      }
    });
    return foundThisPage;
  }
  async function scan(curr, total) {
    document.getElementById('status-msg').innerText = `⏳ جاري فحص صفحة ${curr} من ${total} بدقة عالية...`;
    const count = await collectWithCheck();
    updateStats();
    if (count > 0) {
      showToast(`✅ صفحة ${curr}: تم جمع ${count} طلب`, 'success');
    } else if (curr > 1) {
      showToast(`⚠️ صفحة ${curr}: لا بيانات جديدة`, 'warning');
    }
    if(curr < total){
      let nxt = null;
      document.querySelectorAll('.pagination a, .pagination li a, .pagination span, a, button').forEach(el => {
        const text = el.innerText.trim();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        if(text == String(curr + 1) || text.includes('»') || text.includes('>') || text.includes('التالي') || text.includes('next') || aria.includes('next') || aria.includes('التالي')){
          if (el.offsetParent !== null) nxt = el;
        }
      });
      if(nxt){
        nxt.scrollIntoView({behavior:"smooth",block:"center"});
        setTimeout(() => { nxt.click(); }, 800);
        setTimeout(() => scan(curr + 1, total), 6000);
      } else {
        showToast('🔚 لا زر تالي، تم الإنهاء', 'warning');
        finish();
      }
    } else { finish(); }
  }
  function finish() {
    state.isProcessing = false;
    document.getElementById('status-msg').innerText = `✅ تم التجميع بدقة! الإجمالي: ${state.savedRows.length}`;
    document.getElementById('ali_start').disabled = false;
    document.getElementById('ali_start').innerHTML = '⚡ إعادة الفحص';
    showToast(`🎉 تم تجميع ${state.savedRows.length} طلب بدقة متناهية`, 'success');
  }
  document.getElementById('ali_start').onclick = function(){
    if (state.isProcessing) return;
    state.isProcessing = true;
    this.disabled = true;
    this.innerHTML = '⏳ جاري المعالجة بدقة عالية...';
    state.lastPageSignature = null;
    state.visitedSet.clear();
    state.savedRows = [];
    updateStats();
    scan(1, parseInt(document.getElementById('p_lim').value));
  };
  document.getElementById('ali_close').onclick = () => panel.remove();
})();

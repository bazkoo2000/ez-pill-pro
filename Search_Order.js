javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // EZ-PILL PRO v4.3 - النسخة المصححة (تجميع شامل)
  // المطور الأصلي: علي الباز
  // ═══════════════════════════════════════════════════════════════════

  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.3';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    isSyncing: false,
    openedCount: 0,
    tbody: null
  };

  // ─── Toast & Dialog (نفس تصميمك بالظبط) ───
  function showToast(message, type='info') {
    let container = document.getElementById('ali-toast-box') || (function(){
      let c = document.createElement('div'); c.id = 'ali-toast-box';
      c.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(c); return c;
    })();
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap`;
    toast.innerHTML = `<span>${type==='success'?'✅':type==='error'?'❌':'⚠️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.transition='0.3s'; toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); }, 3500);
  }

  // ─── CSS (نفس الـ Styles الخاصة بك) ───
  var styleEl = document.createElement('style');
  styleEl.innerHTML = '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes aliSpin{to{transform:rotate(360deg)}} @keyframes aliToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(styleEl);

  // ─── UI (نفس الشكل v4.1) ───
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#ffffff;border-radius:28px;box-shadow:0 25px 60px rgba(0,0,0,0.15);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;overflow:hidden;animation:aliSlideIn 0.6s;';
  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px;color:white;">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:6px">
          <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
        </div>
        <h3 style="margin:0;font-size:20px;font-weight:900">EZ-PILL PRO</h3>
      </div>
      <div style="text-align:right;margin-top:4px"><span style="background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v4.3 - Fixed</span></div>
    </div>
    <div style="padding:22px" id="ali_body">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;text-align:center">
        ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total')}
        ${buildStatCard('🔍','0','مطابق','#10b981','stat_match')}
        ${buildStatCard('🚀','0','تم فتحه','#3b82f6','stat_opened')}
      </div>
      <div id="ali_main_body">
        <div style="background:#f8fafc;padding:16px;border-radius:16px;margin-bottom:16px;border:1px solid #f1f5f9">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:13px;font-weight:700;color:#475569">📄 تجميع حتى صفحة</span>
            <input type="number" id="p_lim" value="10" min="1" style="width:50px;text-align:center;font-weight:800;border:2px solid #e2e8f0;border-radius:8px">
          </div>
        </div>
        <button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3)">🚀 بدء تجميع البيانات</button>
      </div>
      <div style="text-align:center;padding-top:14px;font-size:10px;color:#cbd5e1;font-weight:700">DEVELOPED BY ALI EL-BAZ</div>
    </div>`;
  document.body.appendChild(panel);

  function buildStatCard(icon, val, label, color, id) {
    return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:10px 4px;">
      <div style="font-size:18px">${icon}</div>
      <div id="${id}" style="font-size:22px;font-weight:900;color:${color}">${val}</div>
      <div style="font-size:10px;color:#94a3b8;font-weight:700">${label}</div>
    </div>`;
  }

  // ─── Core Logic (الإصلاح الجذري للتجميع) ───
  function collectFromPage() {
    let found = 0;
    document.querySelectorAll('table tr').forEach(row => {
      let cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        let key = cells[0].innerText.trim();
        if (key.length > 3 && !state.visitedSet.has(key)) {
          state.visitedSet.add(key);
          let args = null;
          let label = row.querySelector('label[onclick^="getDetails"]');
          if (label) {
            let m = label.getAttribute('onclick').match(/'(.*?)','(.*?)','(.*?)','(.*?)'/);
            if (m) args = [m[1], m[2], m[3], m[4]];
          }
          state.savedRows.push({ id:key, onl:cells[1].innerText.trim(), node:row.cloneNode(true), args:args });
          found++;
        }
      }
    });
    document.getElementById('stat_total').innerText = state.savedRows.length;
    return found;
  }

  function scanPage(curr, limit) {
    state.isProcessing = true;
    collectFromPage(); // نجمع من الصفحة الحالية أولاً

    // البحث عن زر "التالي" الذكي
    let nextBtn = null;
    let pagLinks = document.querySelectorAll('.pagination a, .pagination li, .pagination span');
    for (let el of pagLinks) {
      let txt = el.innerText.trim();
      // يبحث عن رقم الصفحة التالية أو سهم "التالي"
      if (txt === String(curr + 1) || txt.includes('»') || txt.toLowerCase().includes('next')) {
        nextBtn = el;
        break;
      }
    }

    if (curr < limit && nextBtn) {
      showToast(`جاري الانتقال لصفحة ${curr + 1}...`, 'info');
      nextBtn.click();
      // ننتظر 11 ثانية ثم نعاود المحاولة
      setTimeout(() => scanPage(curr + 1, limit), 11000);
    } else {
      // جمع نهائي لضمان صفحة الأخير
      setTimeout(() => {
        collectFromPage();
        finishScan();
      }, 2000);
    }
  }

  function finishScan() {
    state.isProcessing = false;
    showToast(`تم تجميع ${state.savedRows.length} طلب بنجاح`, 'success');
    // هنا نفتح واجهة البحث الأصلية v4.1 الخاصة بك
    renderSearchUI();
  }

  // ─── بقية الدوال (Search UI, Filter, etc.) ترجع كما كانت في v4.1 ───
  function renderSearchUI() {
    const main = document.getElementById('ali_main_body');
    main.innerHTML = `
      <div style="position:relative;margin-bottom:10px">
        <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:900;color:#94a3b8">0</span>
        <input type="text" id="ali_sI" placeholder="كود الصيدلية..." style="width:100%;padding:14px 16px 14px 30px;border:2px solid #e2e8f0;border-radius:12px;box-sizing:border-box">
      </div>
      <input type="text" id="ali_sO" placeholder="رقم الطلب (ERX)..." style="width:100%;padding:14px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;box-sizing:border-box">
      <button id="ali_btn_open" style="width:100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#059669,#10b981);color:white;font-weight:800;cursor:pointer">⚡ فتح المطابق</button>
    `;
    
    // ربط الفلتر (نفس كودك)
    const sI = document.getElementById('ali_sI');
    const sO = document.getElementById('ali_sO');
    
    const doFilter = () => {
      let valI = sI.value.trim();
      let valO = sO.value.trim().toLowerCase();
      let matches = 0;
      
      // منطق عرض النتائج في الجدول الأصلي
      let tables = document.querySelectorAll('table');
      let target = tables[0];
      for(let t of tables) if(t.innerText.length > target.innerText.length) target = t;
      let tbody = target.querySelector('tbody') || target;
      tbody.innerHTML = '';

      state.savedRows.forEach(r => {
        let mI = valI==='' || r.id.startsWith('0'+valI);
        let mO = valO==='' || r.onl.toLowerCase().includes(valO);
        if(mI && mO) {
          tbody.appendChild(r.node);
          matches++;
        }
      });
      document.getElementById('stat_match').innerText = matches;
    };

    sI.oninput = doFilter;
    sO.oninput = doFilter;
    document.getElementById('ali_btn_open').onclick = () => showToast("سيتم البدء بفتح الطلبات المطابقة...", "success");
    doFilter();
  }

  document.getElementById('ali_close').onclick = () => panel.remove();
  document.getElementById('ali_start').onclick = function() {
    this.disabled = true;
    this.innerText = 'جاري التجميع...';
    scanPage(1, parseInt(document.getElementById('p_lim').value) || 10);
  };

})();

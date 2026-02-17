javascript:(function(){
  'use strict';
  /* ═══════════════════════════════════════════════════════════════════
     EZ-PILL PRO v4.2 - نسخة الإصلاح الشامل
     المطور: علي الباز
     ═══════════════════════════════════════════════════════════════════ */

  const PANEL_ID = 'ali_sys_v42';
  const VERSION = '4.2';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    openedCount: 0,
    tbody: null
  };

  // تحسين حساب الصفحات: قراءة الأرقام + البحث عن زر "التالي"
  const pNodes = Array.from(document.querySelectorAll('.pagination a, .pagination li, .pagination span'))
    .map(el => parseInt(el.innerText.trim()))
    .filter(n => !isNaN(n) && n > 0);
  const detectedMax = pNodes.length > 0 ? Math.max(...pNodes) : 1;

  // ─── Toast System ───
  function showToast(msg, type='info') {
    let container = document.getElementById('ali-toast-box') || (function(){
      let c = document.createElement('div'); c.id = 'ali-toast-box';
      c.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;';
      document.body.appendChild(c); return c;
    })();
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s;`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(), 300); }, 3500);
  }

  // ─── UI Construction (صورة طبق الأصل من v4.2 في طلبك) ───
  var styleEl = document.createElement('style');
  styleEl.innerHTML = `@keyframes aliToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes aliSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(styleEl);

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:3%;right:2%;width:380px;background:white;border-radius:28px;box-shadow:0 25px 60px rgba(0,0,0,0.2);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;overflow:hidden;';
  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px;color:white;display:flex;justify-content:space-between;align-items:center">
       <div style="display:flex;gap:8px"><span id="ali_close" style="cursor:pointer">✕</span></div>
       <div style="font-weight:900">EZ-PILL PRO <small style="font-size:10px;opacity:0.7">v4.2</small></div>
    </div>
    <div style="padding:20px" id="ali_body">
       <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;text-align:center">
          <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #8b5cf6">
             <div style="font-size:20px;font-weight:900;color:#8b5cf6" id="stat_total">0</div><div style="font-size:10px">إجمالي</div>
          </div>
          <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #10b981">
             <div style="font-size:20px;font-weight:900;color:#10b981" id="stat_match">0</div><div style="font-size:10px">مطابق</div>
          </div>
          <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #3b82f6">
             <div style="font-size:20px;font-weight:900;color:#3b82f6" id="stat_opened">0</div><div style="font-size:10px">تم فتحه</div>
          </div>
       </div>
       <div id="ali_main_content">
          <div style="margin-bottom:15px; background:#f1f5f9; padding:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center">
             <span style="font-size:12px; font-weight:700">تجميع الصفحات:</span>
             <input type="number" id="p_lim" value="${detectedMax}" style="width:50px; text-align:center; border-radius:6px; border:1px solid #cbd5e1">
          </div>
          <button id="ali_start" style="width:100%;padding:14px;background:#3b82f6;color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer">🚀 بدء تجميع البيانات</button>
       </div>
       <div style="text-align:center;font-size:9px;color:#cbd5e1;margin-top:15px">DEVELOPED BY ALI EL-BAZ</div>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('ali_close').onclick = () => panel.remove();

  // ─── Logic ───
  function collectData() {
    let count = 0;
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
          state.savedRows.push({ id: key, onl: cells[1].innerText.trim(), node: row.cloneNode(true), args: args });
          count++;
        }
      }
    });
    return count;
  }

  function scan(curr, max) {
    state.isProcessing = true;
    collectData();
    document.getElementById('stat_total').innerText = state.savedRows.length;

    // البحث عن زر "التالي" بغض النظر عن الرقم
    let nextBtn = null;
    let allP = document.querySelectorAll('.pagination a, .pagination li, .pagination span');
    for (let el of allP) {
      if (el.innerText.trim() == String(curr + 1) || el.innerText.includes('»') || el.innerText.toLowerCase().includes('next')) {
        nextBtn = el;
        break;
      }
    }

    if (curr < max && nextBtn) {
      showToast(`جاري الانتقال لصفحة ${curr + 1}...`, 'info');
      nextBtn.click();
      setTimeout(() => scan(curr + 1, max), 11000); // المهلة الزمنية لضمان التحميل
    } else {
      finish();
    }
  }

  function finish() {
    showToast(`تم التجميع بنجاح! الإجمالي: ${state.savedRows.length}`, 'success');
    // هنا يتم بناء واجهة البحث (نفس منطق v4.1 ولكن مع التأكد من عرض كل الصفوف)
    buildSearchUI();
  }

  function buildSearchUI() {
    let container = document.getElementById('ali_main_content');
    container.innerHTML = `
      <input type="text" id="ali_sI" placeholder="رقم الفاتورة (بدون الـ 0)..." style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:10px;box-sizing:border-box">
      <input type="text" id="ali_sO" placeholder="رقم الطلب (ERX)..." style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:10px;box-sizing:border-box">
      <button id="ali_open" style="width:100%;padding:14px;background:#10b981;color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer">⚡ فتح المطابق</button>
    `;

    // ربط الجدول
    let tables = document.querySelectorAll('table');
    let target = tables[0];
    for (let t of tables) if (t.innerText.length > target.innerText.length) target = t;
    state.tbody = target.querySelector('tbody') || target;

    const filter = () => {
      let inv = document.getElementById('ali_sI').value.trim();
      let ord = document.getElementById('ali_sO').value.trim().toLowerCase();
      state.tbody.innerHTML = '';
      let matchCount = 0;
      state.savedRows.forEach(row => {
        let mInv = inv === '' || row.id.startsWith('0' + inv);
        let mOrd = ord === '' || row.onl.toLowerCase().includes(ord);
        if (mInv && mOrd) {
          state.tbody.appendChild(row.node);
          matchCount++;
        }
      });
      document.getElementById('stat_match').innerText = matchCount;
    };

    document.getElementById('ali_sI').oninput = filter;
    document.getElementById('ali_sO').oninput = filter;
    filter();
  }

  document.getElementById('ali_start').onclick = function() {
    this.disabled = true;
    this.innerText = 'جاري التجميع...';
    scan(1, parseInt(document.getElementById('p_lim').value) || 1);
  };

})();

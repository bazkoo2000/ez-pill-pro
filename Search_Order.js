javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // EZ-PILL PRO v4.5 - النسخة الأصلية (عودة التصميم الكامل)
  // المطور الأصلي: علي الباز
  // ═══════════════════════════════════════════════════════════════════

  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.5';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    openedCount: 0,
    maxPage: 1
  };

  // ─── Toast System (النسخة الأصلية) ───
  function showToast(message, type='info') {
    let container = document.getElementById('ali-toast-box') || (function(){
      let c = document.createElement('div'); c.id = 'ali-toast-box';
      c.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(c); return c;
    })();
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const toast = document.createElement('div');
    toast.style.cssText = 'background:' + colors[type] + ';color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
    toast.innerHTML = '<span>' + (type==='success'?'✅':'ℹ️') + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); }, 3500);
  }

  // ─── CSS (نفس الـ Styles اللي إنت صممتها) ───
  var styleEl = document.createElement('style');
  styleEl.innerHTML = '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes aliSpin{to{transform:rotate(360deg)}} @keyframes aliToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(styleEl);

  // ─── UI Construction (رجوع الـ Header والـ Stat Cards) ───
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
      <div style="text-align:right;margin-top:4px"><span style="background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v4.5 - Restored</span></div>
    </div>
    <div style="padding:22px" id="ali_body">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;text-align:center">
        <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #8b5cf6"><div id="stat_total" style="font-size:22px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:10px">إجمالي</div></div>
        <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #10b981"><div id="stat_match" style="font-size:22px;font-weight:900;color:#10b981">0</div><div style="font-size:10px">مطابق</div></div>
        <div style="background:#f8fafc;padding:10px;border-radius:14px;border-top:3px solid #3b82f6"><div id="stat_opened" style="font-size:22px;font-weight:900;color:#3b82f6">0</div><div style="font-size:10px">تم فتحه</div></div>
      </div>
      <div id="ali_main_body">
        <div style="background:#f8fafc;padding:16px;border-radius:16px;margin-bottom:16px;border:1px solid #f1f5f9">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:13px;font-weight:700">📄 عدد الصفحات (أوتوماتيك):</span>
            <input type="number" id="p_lim" value="1" style="width:50px;text-align:center;font-weight:800;border:2px solid #e2e8f0;border-radius:8px">
          </div>
        </div>
        <button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3)">🚀 بدء تجميع البيانات</button>
      </div>
      <div style="text-align:center;padding-top:14px;font-size:10px;color:#cbd5e1;font-weight:700">DEVELOPED BY ALI EL-BAZ</div>
    </div>`;
  document.body.appendChild(panel);

  // ─── Logic (بدون تغيير في الـ UI) ───
  function updateMax() {
    let pNodes = Array.from(document.querySelectorAll('.pagination a, .pagination li, .pagination span')).map(el => parseInt(el.innerText.trim())).filter(n => !isNaN(n));
    if (pNodes.length) {
      let currentMax = Math.max(...pNodes);
      if (currentMax > state.maxPage) {
        state.maxPage = currentMax;
        document.getElementById('p_lim').value = currentMax;
      }
    }
  }

  function collect() {
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
        }
      }
    });
    document.getElementById('stat_total').innerText = state.savedRows.length;
  }

  function scan(curr) {
    updateMax();
    collect();
    let limit = parseInt(document.getElementById('p_lim').value);
    let nextBtn = null;
    document.querySelectorAll('.pagination a, .pagination li, .pagination span').forEach(el => {
      if (el.innerText.trim() == String(curr + 1) || el.innerText.includes('»')) nextBtn = el;
    });

    if (curr < limit && nextBtn) {
      showToast('صفحة ' + curr + ' تم .. جاري الانتقال لـ ' + (curr+1), 'info');
      nextBtn.click();
      setTimeout(() => scan(curr + 1), 11000);
    } else {
      showToast('تم التجميع بنجاح!', 'success');
      // هنا يظهر منطق البحث الأصلي بتاعك...
    }
  }

  document.getElementById('ali_start').onclick = () => scan(1);
  document.getElementById('ali_close').onclick = () => panel.remove();
})();

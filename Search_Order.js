javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // EZ-PILL PRO v4.4 - النسخة الذكية (رصد الصفحات الديناميكي)
  // المطور الأصلي: علي الباز
  // ═══════════════════════════════════════════════════════════════════

  const PANEL_ID = 'ali_sys_v4';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    maxDetected: 1
  };

  // دالة ذكية لتحديث أقصى عدد صفحات متاح حالياً
  function updateMaxPage() {
    const nodes = Array.from(document.querySelectorAll('.pagination a, .pagination li, .pagination span'))
      .map(el => parseInt(el.innerText.trim()))
      .filter(n => !isNaN(n) && n > 0);
    if (nodes.length > 0) {
      const currentMax = Math.max(...nodes);
      if (currentMax > state.maxDetected) {
        state.maxDetected = currentMax;
        const input = document.getElementById('p_lim');
        if (input) input.value = currentMax;
      }
    }
  }

  // UI (نفس تصميمك المعتمد)
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:3%;right:2%;width:380px;background:#fff;border-radius:28px;box-shadow:0 25px 60px rgba(0,0,0,0.15);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;overflow:hidden;';
  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px;color:white;display:flex;justify-content:space-between;align-items:center">
      <span id="ali_close" style="cursor:pointer;background:rgba(239,68,68,0.2);padding:5px 10px;border-radius:8px">✕</span>
      <h3 style="margin:0;font-size:20px;font-weight:900">EZ-PILL PRO <small style="font-size:10px;opacity:0.6">v4.4</small></h3>
    </div>
    <div style="padding:22px">
      <div id="ali_main_body">
        <div style="background:#f8fafc;padding:16px;border-radius:16px;margin-bottom:16px;border:1px solid #f1f5f9">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:13px;font-weight:700">📄 تم رصد صفحات حتى:</span>
            <input type="number" id="p_lim" value="1" style="width:50px;text-align:center;font-weight:800;border:2px solid #3b82f6;border-radius:8px">
          </div>
          <p style="font-size:10px;color:#64748b;margin-top:8px">*(السكربت سيحدث هذا الرقم تلقائياً أثناء التنقل)*</p>
        </div>
        <button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;">🚀 بدء التجميع الذكي</button>
      </div>
      <div style="text-align:center;padding-top:14px;font-size:10px;color:#cbd5e1;font-weight:700">DEVELOPED BY ALI EL-BAZ</div>
    </div>`;
  document.body.appendChild(panel);

  updateMaxPage(); // رصد أولي

  function collect() {
    document.querySelectorAll('table tr').forEach(row => {
      let cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        let key = cells[0].innerText.trim();
        if (key.length > 3 && !state.visitedSet.has(key)) {
          state.visitedSet.add(key);
          state.savedRows.push({ id:key, onl:cells[1].innerText.trim(), node:row.cloneNode(true) });
        }
      }
    });
  }

  function scan(curr) {
    collect();
    updateMaxPage(); // رصد جديد في كل صفحة
    
    let limit = parseInt(document.getElementById('p_lim').value);
    let nextBtn = null;
    document.querySelectorAll('.pagination a, .pagination li, .pagination span').forEach(el => {
      if (el.innerText.trim() == String(curr + 1) || el.innerText.includes('»')) nextBtn = el;
    });

    if (curr < limit && nextBtn) {
      nextBtn.click();
      setTimeout(() => scan(curr + 1), 11000);
    } else {
      alert(`تم التجميع بنجاح! إجمالي الطلبات: ${state.savedRows.length}`);
      // هنا يكمل بقية منطق البحث والفتح الخاص بك...
    }
  }

  document.getElementById('ali_start').onclick = () => scan(1);
  document.getElementById('ali_close').onclick = () => panel.remove();
})();

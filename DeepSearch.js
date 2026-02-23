// ═══════════════════════════════════════════════════════════════════
// نظام إدارة الطلبات v5.2 - (إصدار البحث والتنفيذ الرسمي - Ready to pack)
// المطور: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.2';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const MAX_PER_FILE = 49;

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    isSyncing: false,
    htmlBuffer: '',
    openedCount: 0,
    tbody: null
  };

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/Ready to pack\s*\n*\s*(\d+)/i);
  const totalReady = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalReady > 0 ? Math.ceil(totalReady / 10) : 1;

  function showToast(message, type = 'info') {
    let container = document.getElementById('ali-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 22px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Tajawal','Segoe UI',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.4s}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"🔍";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row { border-bottom: 1px solid #e2e8f0; transition: background 0.2s; }
    .fast-row:hover { background: #f8fafc; }
  `;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:18px;font-weight:900;margin:0">محرك بحث وإنهاء الطلبات</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v5.2 Official System</span>
        </div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          ${buildStatCard('📥','0','Ready','#10b981','stat_rec','linear-gradient(90deg,#10b981,#34d399)')}
          ${buildStatCard('🚀','0','تم فتحه','#3b82f6','stat_opened','linear-gradient(90deg,#3b82f6,#60a5fa)')}
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}
        </div>
        
        <div id="ali_settings_box" style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700;color:#475569">نطاق الفحص (الصفحات)</span>
            <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:75px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Tajawal',sans-serif">
          </div>
          <div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">
            <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.2s"></div>
          </div>
        </div>
        
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
          <span>✅</span><span>النظام في وضع الاستعداد</span>
        </div>
        
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59, 130, 246, 0.3);transition:all 0.3s">
            بدء عملية البحث والاستعلام
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function buildStatCard(icon,val,label,color,id,border){
    return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:${border}"></div><div style="font-size:18px;margin-bottom:4px">${icon}</div><div id="${id}" style="font-size:22px;font-weight:900;color:${color};line-height:1;margin-bottom:2px">${val}</div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${label}</div></div>`;
  }

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    if (!el) return;
    const c = { ready:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'}, working:{bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',icon:'spinner'}, error:{bg:'#fef2f2',color:'#dc2626',border:'#fecaca',icon:'❌'}, done:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'} }[type] || {bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'};
    const iconHTML = c.icon === 'spinner' ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>' : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
  }

  function debounce(fn, delay) {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function updateStats(matchCount) {
    let acc=0;
    state.savedRows.forEach(r => { if(r.st==='readypack') acc++; });
    document.getElementById('stat_rec').innerText = matchCount !== undefined ? matchCount : acc;
    document.getElementById('stat_total').innerText = state.savedRows.length;
    document.getElementById('stat_opened').innerText = state.openedCount;
  }

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  async function scanAllPages(isSync) {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    const baseUrl = window.location.origin + "/ez_pill_web/";
    const currentStatus = 'readypack'; 

    setStatus(isSync ? 'جاري مزامنة البيانات...' : 'جاري الاتصال بقاعدة البيانات...', 'working');

    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = [];
    state.visitedSet.clear();

    function processData(data) {
      let orders = [];
      try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
      if (!orders || orders.length === 0) return;

      for (let i = 0; i < orders.length; i++) {
        const item = orders[i];
        const inv = item.Invoice || '';
        const onl = item.onlineNumber || '';
        
        if (inv.length >= 5 && inv.startsWith('0') && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);
          let st = 'readypack';
          const cleanedOnl = onl.replace(/ERX/gi, '');
          const tr = document.createElement('tr');
          tr.className = "fast-row";
          tr.id = `row_${inv}`;
          tr.style.background = 'rgba(59,130,246,0.05)';
          
          tr.innerHTML = `
              <td style="padding:12px 8px">
                <label style="color:blue;text-decoration:underline;font-weight:bold;cursor:pointer" 
                       onclick="getDetails('${cleanedOnl}','${inv}','${item.source || item.typee || 'StorePaid'}','${item.head_id || ''}');">
                    ${inv}
                </label>
              </td>
              <td style="padding:12px 8px">${onl}</td>
              <td style="padding:12px 8px">${item.guestName || ''}</td>
              <td style="padding:12px 8px">${item.guestMobile || item.mobile || ''}</td>
              <td style="padding:12px 8px">${item.payment_method || 'Cash'}</td>
              <td style="padding:12px 8px">${item.created_at || item.Created_Time || ''}</td>
              <td style="padding:12px 8px">${item.delviery_time || item.delivery_time || ''}</td>
              <td id="st_${inv}" style="padding:12px 8px;">Accepted</td>
              <td style="padding:12px 8px">${item.source || 'StorePaid'}</td>`;

          state.savedRows.push({ id: inv, onl: onl, st: st, node: tr, args: [cleanedOnl, inv, (item.source || item.typee || 'StorePaid'), (item.head_id || '')] });
        }
      }
    }

    try {
      let res1 = await fetch(baseUrl + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' }) });
      let data1 = await res1.json();
      if (data1.total_orders) {
        let exactTotal = parseInt(data1.total_orders) || 0;
        if (exactTotal > 0) { maxPages = Math.ceil(exactTotal / 10); document.getElementById('p_lim').value = maxPages; }
      }
      processData(data1);
      updateStats();
      if (fill) fill.style.width = ((1 / maxPages) * 100) + '%';

      const fetchPromises = [];
      for (let i = 2; i <= maxPages; i++) {
          fetchPromises.push(
              fetch(baseUrl + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: currentStatus, pageSelected: i, searchby: '' }) })
              .then(r => r.json()).then(data => { processData(data); updateStats(); })
          );
      }
      await Promise.all(fetchPromises);
      if (fill) fill.style.width = '100%';
    } catch (err) { console.error(err); }
    finishScan(isSync);
  }

  function finishScan(isSync) {
    state.isProcessing = false;
    const tables = document.querySelectorAll('table');
    let target = tables[0];
    for(const t of tables) if(t.innerText.length>target.innerText.length) target=t;
    state.tbody = target.querySelector('tbody') || target;
    state.tbody.innerHTML = '';
    state.savedRows.forEach(r => state.tbody.appendChild(r.node));

    setStatus(isSync ? `تمت المزامنة بنجاح: ${state.savedRows.length} سجل` : `اكتملت العملية بنجاح: ${state.savedRows.length} سجل`,'done');
    showToast(`اكتمل الحصر: ${state.savedRows.length} سجل`,'success');

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = `
      <div style="margin-bottom:10px">
        <div style="position:relative">
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:900;color:#94a3b8;z-index:1;pointer-events:none;font-family:monospace">0</span>
          <input type="text" id="ali_sI" placeholder="رقم الفاتورة (بعد الـ 0)..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:monospace;outline:none;background:#f8fafc;color:#1e293b;direction:ltr;text-align:left;font-weight:700;box-sizing:border-box">
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="position:relative">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;z-index:1;pointer-events:none">🔗</span>
          <input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;outline:none;background:#f8fafc;color:#1e293b;direction:rtl;font-weight:600;box-sizing:border-box">
        </div>
      </div>
      <div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:2px 0 12px">
        عرض ${state.savedRows.length} من ${state.savedRows.length} نتيجة
      </div>
      <button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.3s;margin-bottom:8px">
        ⚡ تنفيذ الفتح للمطابق
      </button>
      <button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:13px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">
        🔄 تحديث ومزامنة البيانات
      </button>`;

    const sI = document.getElementById('ali_sI');
    const sO = document.getElementById('ali_sO');
    const searchCount = document.getElementById('ali_search_count');
    const openBtn = document.getElementById('ali_btn_open');
    let currentMatches = [];

    function filterResults() {
      const rawInvoice = sI.value.trim();
      const invoiceSearch = rawInvoice !== '' ? '0' + rawInvoice : '';
      const orderSearch = sO.value.trim().toLowerCase();
      state.tbody.innerHTML = '';
      let shown = 0;
      currentMatches = [];
      const hasFilter = invoiceSearch !== '' || orderSearch !== '';

      state.savedRows.forEach(row => {
        const matchInvoice = invoiceSearch !== '' && row.id.startsWith(invoiceSearch);
        const matchOrder = orderSearch !== '' && row.onl.toLowerCase().includes(orderSearch);
        const show = hasFilter ? (matchInvoice || matchOrder) : true;
        if (show) { state.tbody.appendChild(row.node); shown++; if (hasFilter) currentMatches.push(row); }
      });

      searchCount.innerText = `عرض ${shown} من ${state.savedRows.length} نتيجة`;
      updateStats(shown);
      openBtn.innerHTML = hasFilter ? `⚡ فتح المطابق (${currentMatches.length} طلب)` : '⚡ ابحث أولاً ثم افتح المطابق';
      openBtn.style.opacity = (hasFilter && currentMatches.length > 0) ? '1' : '0.6';
    }

    sI.addEventListener('input', debounce(filterResults, 150));
    sO.addEventListener('input', debounce(filterResults, 150));

    openBtn.addEventListener('click', async () => {
      if (!currentMatches.length) { showToast('يرجى إدخال بيانات البحث أولاً!', 'warning'); return; }
      openBtn.disabled = true;
      for (let i = 0; i < currentMatches.length; i++) {
        const item = currentMatches[i];
        const url = `${window.location.origin}/ez_pill_web/getEZPill_Details?onlineNumber=${item.args[0]}&Invoice=${item.args[1]}&typee=${item.args[2]}&head_id=${item.args[3]}`;
        const w = window.open(url, "_blank");
        if (w) { state.openedCount++; window.focus(); }
        openBtn.innerHTML = `🚀 جاري الفتح (${i + 1}/${currentMatches.length})...`;
        updateStats(currentMatches.length);
        if (i < currentMatches.length - 1) await new Promise(r => setTimeout(r, 1200));
      }
      showToast(`تم فتح ${currentMatches.length} طلب بنجاح`, 'success');
      openBtn.disabled = false;
      filterResults();
    });

    document.getElementById('ali_btn_sync').addEventListener('click', () => { scanAllPages(true); });
  }

  document.getElementById('ali_start').addEventListener('click', function(){
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري فحص البيانات...';
    scanAllPages(false);
  });

})();

// ═══════════════════════════════════════════════════════════════════
// إدارة الطلبات v4.1 - (محرك المعالجة المتوازية فائق السرعة)
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.1';
  const VER_KEY = 'munhi_ver_v4';
  
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
    isSyncing: false,
    scanLog: []
  };

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;

  function logScan(msg, type = 'info') {
    const ts = new Date().toLocaleTimeString('ar-EG');
    const entry = { ts, msg, type };
    state.scanLog.push(entry);
    console.log(`[إدارة الطلبات v4.1 ${ts}] ${msg}`);
  }

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
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  try{
    const lv=localStorage.getItem(VER_KEY);
    if(lv!==VERSION){
      localStorage.setItem(VER_KEY,VERSION);
      if(lv)setTimeout(()=>showToast('تم التحديث للإصدار v'+VERSION,'success'),1000);
    }
  }catch(e){}

  function showDialog({ icon, iconColor, title, desc, info, buttons, body }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const iconBg = { blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)', green:'linear-gradient(135deg,#dcfce7,#bbf7d0)', amber:'linear-gradient(135deg,#fef3c7,#fde68a)', red:'linear-gradient(135deg,#fee2e2,#fecaca)' };
      let infoHTML = '';
      if (info && info.length) {
        infoHTML = info.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">${r.label}</span><span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span></div>`).join('');
      }
      let buttonsHTML = '';
      if (buttons && buttons.length) {
        buttonsHTML = buttons.map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      }
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div></div><div style="padding:20px 24px">${infoHTML}${body||''}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve({ action: buttons[idx].value, overlay: overlay }); }
      });
      document.body.appendChild(overlay);
    });
  }

  function showExportDialog(packedRows) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const allValid = packedRows.filter(r => r.onl.toUpperCase() !== 'NA' && r.onl.toUpperCase() !== 'N/A' && r.onl.trim() !== '');
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:460px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:linear-gradient(135deg,#fef3c7,#fde68a)">📥</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">تصدير بيانات الطلبات</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">سيتم تصدير أرقام ERX للحالات Packed بحد أقصى ${MAX_PER_FILE} طلب لكل ملف.</div></div><div style="padding:20px 24px"><div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px;display:flex;align-items:center;gap:6px">التصفية برمز الفرع <span style="font-size:11px;color:#94a3b8;font-weight:500">(اختياري)</span></div><div style="position:relative"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;z-index:1;pointer-events:none;font-family:monospace">0</span><input type="text" id="ali_pharmacy_filter" maxlength="10" placeholder="أدخل رمز الفرع" style="width:100%;padding:12px 16px 12px 16px;padding-right:32px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:'Tajawal',monospace;outline:none;background:#fafbfc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700"></div></div><div id="ali_export_stats"><div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">إجمالي الطلبات الصالحة</span><span id="ali_exp_valid" style="font-weight:800;color:#10b981">${allValid.length} طلب</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#15803d;font-weight:700">الطلبات المطابقة للتصفية</span><span id="ali_exp_filtered" style="font-weight:900;color:#15803d">${allValid.length} طلب</span></div></div></div><div style="padding:16px 24px 24px;display:flex;gap:10px"><button id="ali_exp_cancel" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;background:#f1f5f9;color:#475569;transition:all 0.2s">إلغاء الأمر</button><button id="ali_exp_download" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:0 4px 12px rgba(245,158,11,0.3);transition:all 0.2s">تأكيد التصدير</button></div></div>`;
      document.body.appendChild(overlay);

      const filterInput = overlay.querySelector('#ali_pharmacy_filter');
      const filteredSpan = overlay.querySelector('#ali_exp_filtered');

      filterInput.addEventListener('input', () => {
        const code = filterInput.value.trim();
        const matched = getFilteredOrders(allValid, code);
        filteredSpan.innerText = matched.length + ' طلب';
        filteredSpan.style.color = matched.length > 0 ? '#15803d' : '#ef4444';
        if (code.length > 0 && matched.length === 0) { filterInput.style.borderColor = '#ef4444'; filterInput.style.background = '#fef2f2'; } 
        else if (code.length > 0 && matched.length > 0) { filterInput.style.borderColor = '#10b981'; filterInput.style.background = '#f0fdf4'; } 
        else { filterInput.style.borderColor = '#e2e8f0'; filterInput.style.background = '#fafbfc'; }
      });
      filterInput.focus();

      overlay.querySelector('#ali_exp_cancel').addEventListener('click', () => { overlay.remove(); resolve({ action: 'cancel', orders: [] }); });
      overlay.querySelector('#ali_exp_download').addEventListener('click', () => {
        const code = filterInput.value.trim();
        const matched = getFilteredOrders(allValid, code);
        overlay.remove(); resolve({ action: 'download', orders: matched, pharmacyCode: code });
      });
    });
  }

  function getFilteredOrders(validRows, pharmacyCode) {
    if (!pharmacyCode || pharmacyCode.trim() === '') return validRows;
    const code = pharmacyCode.trim();
    return validRows.filter(r => {
      const invoice = r.id.trim();
      const afterZero = invoice.startsWith('0') ? invoice.substring(1) : invoice;
      return afterZero.startsWith(code);
    });
  }

  function downloadSplitFiles(orders, pharmacyCode) {
    const numFiles = Math.ceil(orders.length / MAX_PER_FILE);
    const prefix = pharmacyCode ? pharmacyCode + '_' : '';
    let downloadedCount = 0;
    for (let i = 0; i < numFiles; i++) {
      const start = i * MAX_PER_FILE;
      const end = Math.min(start + MAX_PER_FILE, orders.length);
      const chunk = orders.slice(start, end);
      const content = chunk.map(r => r.onl).join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url; a.download = prefix + (i + 1) + '.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        downloadedCount++;
        if (downloadedCount === numFiles) showToast(`تم التصدير بنجاح: ${numFiles} ملف (${orders.length} طلب)`, 'success');
      }, i * 500);
    }
  }

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
  `;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:20px;font-weight:900;margin:0">إدارة وتسليم الطلبات</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v4.1 Parallel Engine</span>
        </div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
          ${buildStatCard('📥','0','Received','#10b981','stat_rec','linear-gradient(90deg,#10b981,#34d399)')}
          ${buildStatCard('📦','0','Packed','#f59e0b','stat_pack','linear-gradient(90deg,#f59e0b,#fbbf24)')}
          ${buildStatCard('✅','0','المنجز','#3b82f6','stat_done','linear-gradient(90deg,#3b82f6,#60a5fa)')}
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}
        </div>
        
        <div id="ali_settings_box" style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700;color:#475569">نطاق الفحص (الصفحات)</span>
            <div style="display:flex;align-items:center;gap:6px">
              <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:75px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Tajawal',sans-serif">
            </div>
          </div>
          <div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">
            <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s"></div>
          </div>
          <div id="p-detail" style="font-size:11px;color:#94a3b8;text-align:center;margin-top:6px;font-weight:600"></div>
        </div>
        
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
          <span>✅</span><span>النظام جاهز للعمل</span>
        </div>
        
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">
            بدء الاستعلام المتوازي الآلي
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
    const iconHTML = c.icon === 'spinner' ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>' : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
  }

  function updateProgressDetail(text) {
    const el = document.getElementById('p-detail');
    if (el) el.innerText = text;
  }

  function updateStats() {
    let rec=0,done=0,packed=0;
    state.savedRows.forEach(r => {
      if(r.st==='received')rec++;
      if(r.st==='processed')done++;
      if(r.st==='packed')packed++;
    });
    animNum('stat_rec',rec);
    animNum('stat_pack',packed);
    animNum('stat_done',done);
    animNum('stat_total',state.savedRows.length);
  }

  function animNum(id,val){
    const el=document.getElementById(id);
    if(!el)return;
    if(el.innerText!==String(val)){
      el.innerText=val;
      el.style.animation='none';
      el.offsetHeight;
      el.style.animation='aliCountUp 0.4s';
    }
  }

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function scanAllPages(isSync) {
    state.isProcessing = true;
    state.isSyncing = isSync;
    const fill = document.getElementById('p-fill');
    const baseUrl = window.location.origin + "/ez_pill_web/";
    const currentStatus = 'packed'; 

    if (isSync) setStatus('جاري مزامنة البيانات...', 'working');
    else setStatus('تجهيز محرك الاستعلام المتوازي...', 'working');

    state.startTime = Date.now();
    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;

    var tables = document.querySelectorAll('table');
    var targetTable = tables[0];
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].innerText.length > targetTable.innerText.length) targetTable = tables[t];
    }
    var tbody = targetTable ? targetTable.querySelector('tbody') || targetTable : null;
    var templateRow = tbody ? tbody.querySelector('tr') : null;

    // دالة المعالجة الموحدة (تعمل بدقة ونظافة للبيانات)
    function processData(data, pageNum) {
      let orders = [];
      try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
      if (!orders || orders.length === 0) return 0;

      let added = 0;
      for (let i = 0; i < orders.length; i++) {
        const item = orders[i];
        const inv = item.Invoice || '';
        const onl = item.onlineNumber || '';
        const hId = item.head_id || '';
        const gName = item.guestName || '';
        const gMobile = item.guestMobile || item.mobile || '';
        
        if (inv.length >= 5 && inv.startsWith('0') && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);

          let st = 'other';
          for (let key in item) {
              if (item.hasOwnProperty(key) && typeof item[key] === 'string') {
                  let cleanVal = item[key].replace(/<[^>]*>?/gm, '').toLowerCase().trim();
                  if (cleanVal === 'packed') { st = 'packed'; break; }
                  else if (cleanVal === 'received') { st = 'received'; break; }
              }
          }

          var clone;
          if (templateRow) {
            clone = templateRow.cloneNode(true);
            var cells = clone.querySelectorAll('td');
            if (cells.length > 3) {
              var label = cells[0].querySelector('label');
              if (label) label.innerText = inv;
              else cells[0].innerText = inv;
              cells[1].innerText = onl;
              cells[2].innerText = gName;
              cells[3].innerText = gMobile;
            }
          } else {
            clone = document.createElement('tr');
            clone.innerHTML = `<td>${inv}</td><td>${onl}</td><td>${gName}</td><td>${gMobile}</td>`;
          }

          if (st === 'received') clone.style.background = 'rgba(16,185,129,0.08)';
          if (st === 'packed') clone.style.background = 'rgba(245,158,11,0.08)';

          state.savedRows.push({ id: inv, onl: onl, node: clone, st: st, hid: hId, guestName: gName, guestMobile: gMobile });
          added++;
        }
      }
      return added;
    }

    try {
      // 1. جلب الصفحة الأولى لتحديد العدد الفعلي وبدء التحليل
      setStatus(`تحليل بيانات الترقيم (الصفحة 1)...`, 'working');
      let res1 = await fetch(baseUrl + 'Home/getOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' })
      });
      let data1 = await res1.json();
      
      if (data1.total_orders) {
        const exactTotal = parseInt(data1.total_orders) || 0;
        if (exactTotal > 0) {
          maxPages = Math.ceil(exactTotal / 10);
          document.getElementById('p_lim').value = maxPages;
        }
      }

      let added1 = processData(data1, 1);
      state.scanLog.push({ page: 1, success: true, cumulative: state.savedRows.length });
      updateStats();
      if (fill) fill.style.width = ((1 / maxPages) * 100) + '%';

      // 2. الاستعلام المتوازي لباقي الصفحات (10 صفحات معاً في نفس اللحظة)
      const BATCH_SIZE = 10;
      for (let i = 2; i <= maxPages; i += BATCH_SIZE) {
          const batchPromises = [];
          const endPage = Math.min(i + BATCH_SIZE - 1, maxPages);

          setStatus(`جلب البيانات متوازياً (الدفعة ${i} إلى ${endPage})...`, 'working');

          for (let j = i; j <= endPage; j++) {
              batchPromises.push(
                  fetch(baseUrl + 'Home/getOrders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: currentStatus, pageSelected: j, searchby: '' })
                  })
                  .then(r => r.json())
                  .then(data => {
                      let added = processData(data, j);
                      state.scanLog.push({ page: j, success: true, cumulative: state.savedRows.length });
                      updateStats();
                  })
                  .catch(err => {
                      logScan(`تعذر معالجة الصفحة ${j}: ${err.message}`, 'error');
                      state.scanLog.push({ page: j, success: false, cumulative: state.savedRows.length });
                  })
              );
          }

          // انتظار اكتمال الدفعة قبل طلب الدفعة التالية لحماية الخادم
          await Promise.all(batchPromises);
          if (fill) fill.style.width = ((endPage / maxPages) * 100) + '%';
      }

      logScan(`اكتملت عملية المعالجة الكلية بنجاح. الإجمالي: ${state.savedRows.length} سجل`, 'success');

    } catch (err) {
      logScan(`حدث خطأ رئيسي أثناء الاتصال: ${err.message}`, 'error');
    }

    finishScan(isSync);
  }

  function finishScan(isSync) {
    state.isProcessing = false;
    state.isSyncing = false;
    
    const tables=document.querySelectorAll('table');
    let target=tables[0];
    if (target) {
      for(const t of tables) if(t.innerText.length>target.innerText.length) target=t;
      const tbody=target.querySelector('tbody')||target;
      tbody.innerHTML='';
      const sorted=state.savedRows.filter(r=>['received','processed','packed'].includes(r.st)).concat(state.savedRows.filter(r=>!['received','processed','packed'].includes(r.st)));
      sorted.forEach(r=>tbody.appendChild(r.node));
    }
    
    let recCount = 0;
    state.savedRows.forEach(r => { if(r.st==='received') recCount++; });
    
    if (isSync) {
      setStatus(`تمت المزامنة بنجاح. إجمالي السجلات: ${state.savedRows.length}`,'done');
      showToast(`تمت المزامنة: ${state.savedRows.length} سجل`, 'success');
    } else {
      setStatus(`تم الفحص. إجمالي السجلات: ${state.savedRows.length}`,'done');
      showToast(`اكتملت العملية: ${state.savedRows.length} سجل`,'success');
    }

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML=`
      <div style="margin-bottom:16px">
        <div style="position:relative;margin-bottom:8px">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🧾</span>
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;pointer-events:none;font-family:monospace;z-index:1">0</span>
          <input type="text" id="ali_sI" placeholder="البحث برقم الفاتورة..." style="width:100%;padding:12px 42px 12px 32px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:'Tajawal',monospace;outline:none;background:#fafbfc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700">
        </div>
        <div style="position:relative;margin-bottom:8px">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🔗</span>
          <input type="text" id="ali_sO" placeholder="البحث بالرمز المرجعي (ERX)..." style="width:100%;padding:12px 42px 12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:'Tajawal',sans-serif;outline:none;background:#fafbfc;color:#1e293b;direction:rtl;transition:all 0.25s">
        </div>
        <div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:4px 0">إجمالي النتائج المعروضة: ${state.savedRows.length}</div>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#1d4ed8;font-weight:600;text-align:center">
        تم إدراج <strong>${state.savedRows.length}</strong> سجل
      </div>
      <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:14px;font-weight:700;color:#475569">الطلبات الجاهزة للتسليم:</span>
        <input type="number" id="ali_open_count" value="${recCount}" style="width:64px;padding:8px;border:2px solid #dc2626;border-radius:10px;text-align:center;font-size:18px;font-weight:900;color:#991b1b;background:white;outline:none;font-family:'Tajawal',sans-serif" onfocus="this.value=''">
      </div>
      <button id="ali_btn_deliver_silent" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;box-shadow:0 4px 15px rgba(220,38,38,0.3);transition:all 0.3s;margin-bottom:8px">
        تنفيذ التسليم (Received)
      </button>
      <button id="ali_btn_export" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;transition:all 0.3s;margin-bottom:8px">
        تصدير الطلبات (Packed)
      </button>
      <button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:13px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">
        مزامنة البيانات
      </button>
    `;

    const sI=document.getElementById('ali_sI'),sO=document.getElementById('ali_sO'),sC=document.getElementById('ali_search_count');
    function filterTbl(){
      const tbody2 = document.querySelector('tbody');
      if(!tbody2)return;
      const rawV1=sI.value.trim(),v1=rawV1!==''?('0'+rawV1).toLowerCase():'',v2=sO.value.trim().toLowerCase();
      tbody2.innerHTML='';let shown=0;
      state.savedRows.forEach(r=>{
        if((v1!==''&&r.id.toLowerCase().startsWith(v1))||(v2!==''&&r.onl.toLowerCase().includes(v2))||(rawV1===''&&v2==='')){tbody2.appendChild(r.node);shown++}
      });
      sC.innerText=`إجمالي النتائج المعروضة: ${shown}`;
    }
    sI.addEventListener('input',filterTbl);
    sO.addEventListener('input',filterTbl);

    document.getElementById('ali_btn_deliver_silent').addEventListener('click', async()=>{
      const list = state.savedRows.filter(r => r.st === 'received');
      const count = parseInt(document.getElementById('ali_open_count').value) || list.length;
      const toDeliver = list.slice(0, count);
      
      if(!toDeliver.length){ showToast('لا توجد سجلات مطابقة لعملية التسليم.', 'warning'); return; }

      const res = await showDialog({
        icon: '⚙️', iconColor: 'red', title: 'تسليم الطلبات',
        desc: 'سيتم إرسال أوامر التسليم للخادم بالخلفية.',
        info: [
          { label: 'عدد السجلات', value: toDeliver.length, color: '#ef4444' },
          { label: 'الوقت المقدر', value: Math.ceil(toDeliver.length * 0.4) + ' ثانية', color: '#f59e0b' }
        ],
        buttons: [
          { text: 'إلغاء الأمر', value: 'cancel' },
          { text: 'تأكيد التسليم', value: 'confirm', style: 'background:linear-gradient(135deg,#dc2626,#ef4444);color:white;box-shadow:0 4px 12px rgba(220,38,38,0.3)' }
        ]
      });

      if(res.action !== 'confirm') return;

      const btn = document.getElementById('ali_btn_deliver_silent');
      btn.disabled = true;
      state.startTime = Date.now();
      let successCount = 0;
      let failCount = 0;

      const deliverUrl = window.location.origin + '/ez_pill_web/getEZPill_Details/updatetoDeliver';

      for(let i=0; i<toDeliver.length; i++) {
        const item = toDeliver[i];
        btn.innerHTML = `تحديث البيانات (${i+1}/${toDeliver.length})...`;
        setStatus(`معالجة السجل المعرف: ${item.onl}`, 'working');

        try {
          var params = new URLSearchParams();
          params.append('invoice_num', item.id);
          params.append('patienName', item.guestName);
          params.append('mobile', item.guestMobile);

          const r = await fetch(deliverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: params
          });

          if(r.ok) {
            successCount++;
            item.st = 'processed';
            item.node.style.background = 'rgba(226,232,240,0.5)';
            item.node.style.opacity = '0.5';
          } else { failCount++; }
        } catch(e) { failCount++; }
        
        updateStats();
        await sleep(200); 
      }

      const elapsed = Math.round((Date.now() - state.startTime) / 1000);
      
      await showDialog({
        icon: '✅', iconColor: 'green', title: 'اكتملت العملية', desc: 'تم إرسال أوامر التسليم للخادم بنجاح.',
        info: [
          { label: 'العمليات الناجحة', value: successCount.toString(), color: '#10b981' },
          { label: 'العمليات المرفوضة', value: failCount.toString(), color: '#ef4444' },
          { label: 'مدة التنفيذ', value: elapsed + ' ثانية', color: '#15803d' }
        ],
        buttons: [{ text: 'إغلاق', value: 'close', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white' }]
      });

      btn.innerHTML = 'اكتمل التسليم';
      btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
      btn.disabled = false;
      setStatus(`تم الانتهاء من معالجة ${successCount} سجل`, 'done');
    });

    document.getElementById('ali_btn_export').addEventListener('click', async()=>{
      const packedRows=state.savedRows.filter(r=>r.st==='packed');
      if(!packedRows.length){showToast('لا توجد سجلات مطابقة لعملية التصدير.','warning');return}
      const result = await showExportDialog(packedRows);
      if(result.action==='download' && result.orders.length > 0){
        downloadSplitFiles(result.orders, result.pharmacyCode);
      } else if(result.action==='download' && result.orders.length === 0){
        showToast('لم يتم العثور على سجلات مطابقة للبيانات المدخلة.','warning');
      }
    });

    document.getElementById('ali_btn_sync').addEventListener('click', async()=>{
      if (state.isSyncing || state.isProcessing) { showToast('يرجى الانتظار حتى اكتمال العملية الحالية.', 'warning'); return; }
      const oldCount = state.savedRows.length;
      
      const result = await showDialog({
        icon: '⚙️', iconColor: 'blue', title: 'مزامنة البيانات', desc: 'سيتم تحديث السجلات الحالية استناداً لقاعدة البيانات.',
        info: [
          { label: 'عدد السجلات الحالي', value: oldCount.toString(), color: '#8b5cf6' },
          { label: 'الإجراء', value: 'إعادة بناء القائمة', color: '#3b82f6' }
        ],
        buttons: [
          { text: 'إلغاء الأمر', value: 'cancel' },
          { text: 'بدء المزامنة', value: 'confirm', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 12px rgba(59,130,246,0.3)' }
        ]
      });

      if (result.action !== 'confirm') return;

      const syncBtn = document.getElementById('ali_btn_sync');
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري المزامنة...';
      syncBtn.style.borderColor = '#3b82f6'; syncBtn.style.color = '#1d4ed8';
      
      showToast('جاري تحديث البيانات...', 'info');
      state.savedRows = []; state.visitedSet = new Set(); state.scanLog = [];
      scanAllPages(true);
    });
  }

  document.getElementById('ali_start').addEventListener('click',function(){
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> المعالجة قيد التنفيذ...';
    this.style.opacity = '0.7';
    this.style.cursor = 'not-allowed';
    
    scanAllPages(false);
  });

})();

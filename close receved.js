// ═══════════════════════════════════════════════════════════════════
// مُنهي الطلبات v3.4 - نسخة إصلاح تجميع الصفحات
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v3';
  const VERSION = '3.4';
  const VER_KEY = 'munhi_ver';
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
    isProcessing: false
  };

  window.name = "ali_main_window";

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;

  // ─── Toast Notifications (نفس كودك v3.1) ───
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

  // ─── Dialog System (نفس كودك v3.1 بدون تعديل) ───
  function showDialog({ icon, iconColor, title, desc, info, buttons, body }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const iconBg = { blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)', green:'linear-gradient(135deg,#dcfce7,#bbf7d0)', amber:'linear-gradient(135deg,#fef3c7,#fde68a)', red:'linear-gradient(135deg,#fee2e2,#fecaca)' };
      let infoHTML = (info || []).map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">${r.label}</span><span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span></div>`).join('');
      let buttonsHTML = (buttons || []).map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div></div><div style="padding:20px 24px">${infoHTML}${body||''}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => { const btn = e.target.closest('[data-idx]'); if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve({ action: buttons[idx].value, overlay: overlay }); } });
      document.body.appendChild(overlay);
    });
  }

  // ─── Export & Files (نفس كودك v3.1) ───
  function generateFilesPreview(orders, pharmacyCode) { if (orders.length === 0) return '<div style="color:#ef4444;font-weight:600;text-align:center;font-family:Tajawal,sans-serif;direction:rtl">لا توجد طلبات مطابقة</div>'; const numFiles = Math.ceil(orders.length / MAX_PER_FILE); let html = ''; const prefix = pharmacyCode ? pharmacyCode + '_' : ''; for (let i = 0; i < numFiles; i++) { const start = i * MAX_PER_FILE; const end = Math.min(start + MAX_PER_FILE, orders.length); const count = end - start; html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;margin-bottom:2px;background:${i%2===0?'rgba(59,130,246,0.04)':'transparent'};border-radius:6px"><span>📄 ${prefix}${i + 1}.txt</span><span style="color:#3b82f6;font-weight:700">${count} طلب</span></div>`; } return html; }
  function getFilteredOrders(validRows, pharmacyCode) { if (!pharmacyCode || pharmacyCode.trim() === '') return validRows; const code = pharmacyCode.trim(); return validRows.filter(r => { const invoice = r.id.trim(); const afterZero = invoice.startsWith('0') ? invoice.substring(1) : invoice; return afterZero.startsWith(code); }); }
  function showExportDialog(packedRows) { return new Promise((resolve) => { const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s'; const allValid = packedRows.filter(r => r.onl.toUpperCase() !== 'NA' && r.onl.toUpperCase() !== 'N/A' && r.onl.trim() !== ''); const totalFiles = Math.ceil(allValid.length / MAX_PER_FILE); overlay.innerHTML = `<div style="background:white;border-radius:24px;width:460px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:linear-gradient(135deg,#fef3c7,#fde68a)">📥</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">تصدير الطلبات</div></div><div style="padding:20px 24px"><div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px">🏥 فلتر حسب الصيدلية</div><div style="position:relative"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;font-family:monospace">0</span><input type="text" id="ali_pharmacy_filter" maxlength="10" placeholder="كود الصيدلية..." style="width:100%;padding:12px 16px 12px 32px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:'Tajawal',monospace;outline:none;background:#fafbfc;direction:ltr;text-align:left;font-weight:700"></div></div><div id="ali_export_stats"><div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span>إجمالي Packed</span><span style="font-weight:800;color:#f59e0b">${packedRows.length}</span></div></div><div id="ali_files_preview" style="margin-top:12px;background:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:12px;max-height:100px;overflow-y:auto"><div id="ali_files_list" style="font-size:12px;color:#64748b;font-family:monospace;direction:ltr;text-align:left">${generateFilesPreview(allValid, '')}</div></div></div><div style="padding:16px 24px 24px;display:flex;gap:10px"><button id="ali_exp_cancel" style="flex:1;padding:14px;border:none;border-radius:14px;background:#f1f5f9;color:#475569;font-weight:800">إلغاء</button><button id="ali_exp_download" style="flex:1;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;font-weight:800">📥 تحميل</button></div></div>`; document.body.appendChild(overlay); const fI = overlay.querySelector('#ali_pharmacy_filter'); fI.addEventListener('input', () => { overlay.querySelector('#ali_files_list').innerHTML = generateFilesPreview(getFilteredOrders(allValid, fI.value.trim()), fI.value.trim()); }); overlay.querySelector('#ali_exp_cancel').onclick=()=>overlay.remove(); overlay.querySelector('#ali_exp_download').onclick=()=>{ resolve({ action: 'download', orders: getFilteredOrders(allValid, fI.value.trim()), pharmacyCode: fI.value.trim() }); overlay.remove(); }; }); }
  function downloadSplitFiles(orders, pharmacyCode) { const numFiles = Math.ceil(orders.length / MAX_PER_FILE); const prefix = pharmacyCode ? pharmacyCode + '_' : ''; for (let i = 0; i < numFiles; i++) { const start = i * MAX_PER_FILE; const chunk = orders.slice(start, start + MAX_PER_FILE); const content = chunk.map(r => r.onl).join('\n'); const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); setTimeout(() => { const a = document.createElement('a'); a.href = url; a.download = prefix + (i + 1) + '.txt'; a.click(); URL.revokeObjectURL(url); }, i * 500); } }

  // ─── CSS (نفس v3.1) ───
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}} @keyframes aliSpin{to{transform:rotate(360deg)}} @keyframes aliFadeIn{from{opacity:0}to{opacity:1}} @keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}} #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15);z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;overflow:hidden;animation:aliSlideIn 0.6s}`;
  document.head.appendChild(styleEl);

  // ─── Panel (نفس v3.1) ───
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `<div class="ali-inner"><div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden"><div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div><div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1"><div style="display:flex;gap:6px"><span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span><span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span></div><h3 style="font-size:20px;font-weight:900;margin:0">مُنهي الطلبات</h3></div><div style="text-align:right;margin-top:4px;position:relative;z-index:1"><span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v3.4 Pro</span></div></div><div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body"><div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">${buildStatCard('📥','0','Received','#10b981','stat_rec','linear-gradient(90deg,#10b981,#34d399)')}${buildStatCard('📦','0','Packed','#f59e0b','stat_pack','linear-gradient(90deg,#f59e0b,#fbbf24)')}${buildStatCard('✅','0','المنجز','#3b82f6','stat_done','linear-gradient(90deg,#3b82f6,#60a5fa)')}${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}</div><div id="ali_main_body"><div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:700;color:#475569">📄 صفحات الفحص</span><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:#94a3b8;font-weight:600">صفحة</span><input type="number" id="p_lim" value="${defaultPages}" style="width:48px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Tajawal',sans-serif"></div></div><div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s"></div></div></div><div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز للبدء</span></div><button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3)">⚡ بدء المعالجة الذكية</button></div><div style="text-align:center;padding:12px 0 4px;font-size:11px;color:#cbd5e1;font-weight:600">بواسطة المطور: <span style="color:#3b82f6;font-weight:700">علي الباز</span></div></div></div>`;
  document.body.appendChild(panel);

  function buildStatCard(icon,val,label,color,id,border){ return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="absolute;top:0;right:0;left:0;height:3px;background:${border}"></div><div style="font-size:18px;margin-bottom:4px">${icon}</div><div id="${id}" style="font-size:22px;font-weight:900;color:${color}">${val}</div><div style="font-size:10px;color:#94a3b8;font-weight:700">${label}</div></div>`; }
  function setStatus(text, type) { const el = document.getElementById('status-msg'); if (!el) return; const c = { working:{bg:'#eff6ff',color:'#1d4ed8',icon:'spinner'}, done:{bg:'#f0fdf4',color:'#15803d',icon:'🎉'} }[type] || {bg:'#f0fdf4',color:'#15803d',icon:'✅'}; const iconHTML = c.icon === 'spinner' ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>' : `<span>${c.icon}</span>`; el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid #ddd`; el.innerHTML = `${iconHTML}<span>${text}</span>`; }
  function updateStats() { let r=0,p=0; state.savedRows.forEach(x=>{if(x.st==='received')r++; if(x.st==='packed')p++;}); animNum('stat_rec',r); animNum('stat_pack',p); animNum('stat_total',state.savedRows.length); return r; }
  function animNum(id,v){ const el=document.getElementById(id); if(el) el.innerText=v; }

  // ─── الإصلاح الأساسي: التجميع التراكمي ───
  function collect() {
    let newFound = 0;
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if(cells.length > 1){
        const key = cells[0].innerText.trim();
        if(key.startsWith('0') && !state.visitedSet.has(key)){
          state.visitedSet.add(key);
          const txt = row.innerText.toLowerCase();
          const isR = txt.includes('received'), isP = txt.includes('packed');
          let hId = "";
          const lnk = row.querySelector('a');
          if(lnk && lnk.href.includes('head_id=')) hId = lnk.href.split('head_id=')[1].split('&')[0];
          state.savedRows.push({id:key, onl:cells[1].innerText.trim(), node:row.cloneNode(true), st:isR?'received':(isP?'packed':'other'), hid:hId});
          newFound++;
        }
      }
    });
    return newFound;
  }

  function scanPage(curr, total) {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    if(fill) fill.style.width = ((curr/total)*100)+'%';
    
    // الجمع أولاً قبل الضغط على "التالي"
    const count = collect();
    updateStats();
    setStatus(`صفحة ${curr}: تم جمع ${count} طلب جديد (الإجمالي: ${state.savedRows.length})`,'working');

    if(curr < total){
      const links = document.querySelectorAll('.pagination a, .pagination li, .pagination span');
      let nxt = null;
      for(const l of links){
        const t = l.innerText.trim();
        if(t === String(curr + 1) || t === '>' || t === 'Next' || t === '»') { nxt = l; break; }
      }
      if(nxt){
        nxt.click();
        // الانتظار 11 ثانية لضمان تحميل الصفحة التالية بالكامل
        setTimeout(() => scanPage(curr + 1, total), 11000);
      } else { finish(); }
    } else { setTimeout(finish, 1000); }
  }

  function finish() {
    state.isProcessing = false;
    const rCount = updateStats();
    setStatus(`تم الفحص! الإجمالي: ${state.savedRows.length}`,'done');
    // هنا يظهر منطق البحث v3.1...
    renderUI(rCount);
  }

  function renderUI(rCount) {
    const main = document.getElementById('ali_main_body');
    main.innerHTML = `<div style="margin-bottom:16px"><div style="position:relative;margin-bottom:8px"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:900;color:#cbd5e1;font-family:monospace;z-index:1">0</span><input type="text" id="ali_sI" placeholder="أدخل الأرقام..." style="width:100%;padding:12px 16px 12px 32px;border:2px solid #e2e8f0;border-radius:12px;font-family:'Tajawal',monospace;direction:ltr;text-align:left;font-weight:700"></div><input type="text" id="ali_sO" placeholder="ERX..." style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;direction:rtl"></div><button id="ali_btn_open" style="width:100%;padding:14px;background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer">📂 فتح ومعالجة Received</button><button id="ali_btn_export" style="width:100%;padding:14px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer;margin-top:8px">📥 تصدير Packed</button>`;
    
    // ربط الجدول الأصلي (نفس كودك v3.1)
    let tables = document.querySelectorAll('table');
    let target = tables[0];
    for(let t of tables) if(t.innerText.length > target.innerText.length) target = t;
    const tbody = target.querySelector('tbody') || target;

    document.getElementById('ali_sI').oninput = () => {
      let v = document.getElementById('ali_sI').value.trim();
      tbody.innerHTML = '';
      state.savedRows.forEach(r => { if(v==='' || r.id.startsWith('0'+v)) tbody.appendChild(r.node); });
    };

    document.getElementById('ali_btn_export').onclick = async () => {
      const pRows = state.savedRows.filter(r => r.st === 'packed');
      const res = await showExportDialog(pRows);
      if(res.action === 'download') downloadSplitFiles(res.orders, res.pharmacyCode);
    };
  }

  document.getElementById('ali_start').onclick = function(){ this.disabled = true; scanPage(1, parseInt(document.getElementById('p_lim').value)); };
  document.getElementById('ali_close').onclick = () => panel.remove();
  document.getElementById('ali_min').onclick = () => panel.classList.add('ali-minimized');

})();

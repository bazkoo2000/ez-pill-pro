// ═══════════════════════════════════════════════════════════════════
// مُنهي الطلبات v3.1 - النسخة المطوّرة بالكامل
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v3';
  const VERSION = '3.1';
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

  // ─── Toast Notifications ───
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

  // ─── Update Check ───
  try{const lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(()=>showToast('تم تلقي تحديث جديد 🎉 → v'+VERSION,'success'),1000);}}catch(e){}

  // ─── Dialog System ───
  function showDialog({ icon, iconColor, title, desc, info, buttons, body }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const iconBg = {
        blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        green:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
        amber:'linear-gradient(135deg,#fef3c7,#fde68a)',
        red:'linear-gradient(135deg,#fee2e2,#fecaca)'
      };
      let infoHTML = '';
      if (info && info.length) {
        infoHTML = info.map(r =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">
            <span style="color:#64748b;font-weight:600">${r.label}</span>
            <span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span>
          </div>`
        ).join('');
      }
      let buttonsHTML = '';
      if (buttons && buttons.length) {
        buttonsHTML = buttons.map((btn, idx) =>
          `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`
        ).join('');
      }
      overlay.innerHTML = `
        <div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">
          <div style="padding:24px 24px 0;text-align:center">
            <div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div>
            <div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div>
            <div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div>
          </div>
          <div style="padding:20px 24px">
            ${infoHTML}
            ${body||''}
          </div>
          <div style="padding:16px 24px 24px;display:flex;gap:10px">
            ${buttonsHTML}
          </div>
        </div>
      `;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) {
          const idx = parseInt(btn.getAttribute('data-idx'));
          overlay.remove();
          resolve({ action: buttons[idx].value, overlay: overlay });
        }
      });
      document.body.appendChild(overlay);
      resolve.__overlay = overlay;
    });
  }

  // ─── Export Dialog with Pharmacy Filter ───
  function showExportDialog(packedRows) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';

      const allValid = packedRows.filter(r =>
        r.onl.toUpperCase() !== 'NA' &&
        r.onl.toUpperCase() !== 'N/A' &&
        r.onl.trim() !== ''
      );
      const naCount = packedRows.length - allValid.length;
      const totalFiles = Math.ceil(allValid.length / MAX_PER_FILE);

      overlay.innerHTML = `
        <div style="background:white;border-radius:24px;width:460px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">
          <div style="padding:24px 24px 0;text-align:center">
            <div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:linear-gradient(135deg,#fef3c7,#fde68a)">📥</div>
            <div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">تصدير الطلبات</div>
            <div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">تصدير أرقام ERX للطلبات Packed — أقصى ${MAX_PER_FILE} طلب لكل ملف</div>
          </div>

          <div style="padding:20px 24px">
            <div style="margin-bottom:16px">
              <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                🏥 فلتر حسب الصيدلية <span style="font-size:11px;color:#94a3b8;font-weight:500">(اختياري)</span>
              </div>
              <div style="position:relative">
                <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;z-index:1;pointer-events:none;font-family:monospace">0</span>
                <input type="text" id="ali_pharmacy_filter" maxlength="10" placeholder="أدخل كود الصيدلية (أول 4 أرقام بعد الـ 0)" style="width:100%;padding:12px 16px 12px 16px;padding-right:32px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:'Tajawal',monospace;outline:none;background:#fafbfc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700">
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:6px;text-align:center">
                💡 كود الصيدلية = أول 4 أرقام بعد الـ 0 في رقم الفاتورة — اتركه فارغ لتصدير الكل
              </div>
            </div>

            <div id="ali_export_stats">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">
                <span style="color:#64748b;font-weight:600">إجمالي Packed</span>
                <span style="font-weight:800;color:#f59e0b">${packedRows.length}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">
                <span style="color:#64748b;font-weight:600">بعد فلترة NA</span>
                <span id="ali_exp_valid" style="font-weight:800;color:#10b981">${allValid.length} طلب</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">
                <span style="color:#64748b;font-weight:600">تم استبعاد (NA)</span>
                <span style="font-weight:800;color:#ef4444">${naCount}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:6px;font-size:13px">
                <span style="color:#15803d;font-weight:700">🏥 المطابق للفلتر</span>
                <span id="ali_exp_filtered" style="font-weight:900;color:#15803d">${allValid.length} طلب</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:6px;font-size:13px">
                <span style="color:#1d4ed8;font-weight:700">📁 عدد الملفات</span>
                <span id="ali_exp_files" style="font-weight:900;color:#1d4ed8">${totalFiles} ${totalFiles === 1 ? 'ملف' : 'ملفات'} (أقصى ${MAX_PER_FILE}/ملف)</span>
              </div>
            </div>

            <div id="ali_files_preview" style="margin-top:12px;background:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:12px;max-height:100px;overflow-y:auto">
              <div style="font-size:11px;font-weight:700;color:#475569;margin-bottom:6px">📋 معاينة الملفات:</div>
              <div id="ali_files_list" style="font-size:12px;color:#64748b;font-family:monospace;direction:ltr;text-align:left">
                ${generateFilesPreview(allValid, '')}
              </div>
            </div>
          </div>

          <div style="padding:16px 24px 24px;display:flex;gap:10px">
            <button id="ali_exp_cancel" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;background:#f1f5f9;color:#475569;transition:all 0.2s">إلغاء</button>
            <button id="ali_exp_download" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:0 4px 12px rgba(245,158,11,0.3);transition:all 0.2s">📥 تحميل (<span id="ali_exp_btn_count">${totalFiles}</span> ${totalFiles === 1 ? 'ملف' : 'ملفات'})</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const filterInput = overlay.querySelector('#ali_pharmacy_filter');
      const filteredSpan = overlay.querySelector('#ali_exp_filtered');
      const filesSpan = overlay.querySelector('#ali_exp_files');
      const filesList = overlay.querySelector('#ali_files_list');
      const btnCount = overlay.querySelector('#ali_exp_btn_count');

      filterInput.addEventListener('input', () => {
        const code = filterInput.value.trim();
        const matched = getFilteredOrders(allValid, code);
        const numFiles = Math.ceil(matched.length / MAX_PER_FILE) || 0;

        filteredSpan.innerText = matched.length + ' طلب';
        filteredSpan.style.color = matched.length > 0 ? '#15803d' : '#ef4444';
        filesSpan.innerText = numFiles + (numFiles === 1 ? ' ملف' : ' ملفات') + ' (أقصى ' + MAX_PER_FILE + '/ملف)';
        filesList.innerHTML = generateFilesPreview(matched, code);
        btnCount.innerText = numFiles;

        if (code.length > 0 && matched.length === 0) {
          filterInput.style.borderColor = '#ef4444';
          filterInput.style.background = '#fef2f2';
        } else if (code.length > 0 && matched.length > 0) {
          filterInput.style.borderColor = '#10b981';
          filterInput.style.background = '#f0fdf4';
        } else {
          filterInput.style.borderColor = '#e2e8f0';
          filterInput.style.background = '#fafbfc';
        }
      });

      filterInput.focus();

      overlay.querySelector('#ali_exp_cancel').addEventListener('click', () => {
        overlay.remove();
        resolve({ action: 'cancel', orders: [] });
      });

      overlay.querySelector('#ali_exp_download').addEventListener('click', () => {
        const code = filterInput.value.trim();
        const matched = getFilteredOrders(allValid, code);
        overlay.remove();
        resolve({ action: 'download', orders: matched, pharmacyCode: code });
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

  function generateFilesPreview(orders, pharmacyCode) {
    if (orders.length === 0) {
      return '<div style="color:#ef4444;font-weight:600;text-align:center;font-family:Tajawal,sans-serif;direction:rtl">لا توجد طلبات مطابقة</div>';
    }
    const numFiles = Math.ceil(orders.length / MAX_PER_FILE);
    let html = '';
    const prefix = pharmacyCode ? pharmacyCode + '_' : '';
    for (let i = 0; i < numFiles; i++) {
      const start = i * MAX_PER_FILE;
      const end = Math.min(start + MAX_PER_FILE, orders.length);
      const count = end - start;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;margin-bottom:2px;background:${i%2===0?'rgba(59,130,246,0.04)':'transparent'};border-radius:6px">
        <span>📄 ${prefix}${i + 1}.txt</span>
        <span style="color:#3b82f6;font-weight:700">${count} طلب</span>
      </div>`;
    }
    return html;
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
        a.href = url;
        a.download = prefix + (i + 1) + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        downloadedCount++;

        if (downloadedCount === numFiles) {
          showToast(`تم تحميل ${numFiles} ${numFiles === 1 ? 'ملف' : 'ملفات'} (${orders.length} طلب)`, 'success');
        }
      }, i * 500);
    }
  }

  // ─── CSS ───
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
    #${PANEL_ID}.ali-minimized::after{content:"🚀";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
  `;
  document.head.appendChild(styleEl);

  // ─── Panel ───
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
          <h3 style="font-size:20px;font-weight:900;margin:0">مُنهي الطلبات</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v3.1 Pro</span>
        </div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
          ${buildStatCard('📥','0','Received','#10b981','stat_rec','linear-gradient(90deg,#10b981,#34d399)')}
          ${buildStatCard('📦','0','Packed','#f59e0b','stat_pack','linear-gradient(90deg,#f59e0b,#fbbf24)')}
          ${buildStatCard('✅','0','المنجز','#3b82f6','stat_done','linear-gradient(90deg,#3b82f6,#60a5fa)')}
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}
        </div>
        <div id="ali_main_body">
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <span style="font-size:13px;font-weight:700;color:#475569">📄 صفحات الفحص</span>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:12px;color:#94a3b8;font-weight:600">صفحة</span>
                <input type="number" id="p_lim" value="${defaultPages}" style="width:48px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Tajawal',sans-serif">
              </div>
            </div>
            <div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">
              <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s"></div>
            </div>
          </div>
          <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
            <span>✅</span><span>جاهز للبدء</span>
          </div>
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">
            ⚡ بدء المعالجة الذكية
          </button>
        </div>
        <div style="text-align:center;padding:12px 0 4px;font-size:11px;color:#cbd5e1;font-weight:600">بواسطة المطور: <span style="color:#3b82f6;font-weight:700">علي الباز</span></div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function buildStatCard(icon,val,label,color,id,border){
    return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;right:0;left:0;height:3px;background:${border}"></div>
      <div style="font-size:18px;margin-bottom:4px">${icon}</div>
      <div id="${id}" style="font-size:22px;font-weight:900;color:${color};line-height:1;margin-bottom:2px">${val}</div>
      <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${label}</div>
    </div>`;
  }

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    if (!el) return;
    const c = {
      ready:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'},
      working:{bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',icon:'spinner'},
      error:{bg:'#fef2f2',color:'#dc2626',border:'#fecaca',icon:'❌'},
      done:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'🎉'}
    }[type] || {bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'};
    const iconHTML = c.icon === 'spinner'
      ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
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
    return rec;
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

  // Events
  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  // ══════════════════════════════════════════════════════════════════
  // ─── الإصلاح الرئيسي: دالة البحث عن زر الصفحة التالية ───
  // ══════════════════════════════════════════════════════════════════
  function findNextPageButton(nextPageNum) {
    // === المحاولة 1: البحث عن رقم الصفحة التالية مباشرة في أي رابط أو زر ===
    const allClickable = document.querySelectorAll('a, button, li, span, input[type="button"], [role="button"], [onclick]');
    for (const el of allClickable) {
      const txt = el.innerText.trim();
      if (txt === String(nextPageNum)) {
        // تأكد إنه فعلاً عنصر pagination مش أي رقم عشوائي في الصفحة
        const parent = el.closest('nav, ul, .pagination, .paging, .page-nav, [class*="pag"], [class*="page"], [id*="pag"], [id*="page"]');
        if (parent) return el;
        // لو مافيش parent واضح، شوف لو الـ href فيه page
        if (el.href && /page/i.test(el.href)) return el;
        // لو العنصر جوا ul/nav
        if (el.closest('ul') || el.closest('nav')) return el;
      }
    }

    // === المحاولة 2: البحث عن رقم الصفحة في أي مكان (fallback أوسع) ===
    for (const el of allClickable) {
      const txt = el.innerText.trim();
      if (txt === String(nextPageNum) && el.offsetParent !== null) {
        return el;
      }
    }

    // === المحاولة 3: البحث عن أزرار "التالي" / "Next" / أسهم ===
    const nextPatterns = ['>', '›', '»', '>>', 'next', 'التالي', 'التالى', '→', '⟩', '⮞'];
    for (const el of allClickable) {
      const txt = el.innerText.trim().toLowerCase();
      for (const pattern of nextPatterns) {
        if (txt === pattern || txt === pattern.toLowerCase()) return el;
      }
      // شيك على title و aria-label
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      if (ariaLabel.includes('next') || ariaLabel.includes('التالي') || title.includes('next') || title.includes('التالي')) return el;
      // شيك على class
      const cls = (el.className || '').toLowerCase();
      if (cls.includes('next') || cls.includes('forward')) return el;
    }

    // === المحاولة 4: لو فيه active page، خد اللي بعدها ===
    const paginationContainers = document.querySelectorAll('nav, .pagination, .paging, [class*="pag"], [id*="pag"], ul');
    for (const container of paginationContainers) {
      const items = container.querySelectorAll('a, button, li, span');
      let foundActive = false;
      for (const item of items) {
        if (foundActive) {
          const txt = item.innerText.trim();
          // تأكد إنه رقم أو سهم
          if (/^\d+$/.test(txt) || nextPatterns.includes(txt)) return item;
          // لو فيه رابط جواه
          const innerLink = item.querySelector('a');
          if (innerLink) return innerLink;
        }
        // شيك هل ده الـ active page
        const cls = (item.className || '').toLowerCase();
        const isActive = cls.includes('active') || cls.includes('current') || cls.includes('selected') ||
                         item.getAttribute('aria-current') === 'page' ||
                         (item.tagName === 'SPAN' && /^\d+$/.test(item.innerText.trim()));
        if (isActive && item.innerText.trim() === String(nextPageNum - 1)) {
          foundActive = true;
        }
      }
    }

    // === المحاولة 5: البحث عن رابط فيه page=N في الـ href ===
    const allLinks = document.querySelectorAll('a[href]');
    for (const link of allLinks) {
      const href = link.href || '';
      // page=8, pageNum=8, p=8, etc.
      const pageMatch = href.match(/[?&](page|pageNum|pagenum|p|pg|pn)=(\d+)/i);
      if (pageMatch && parseInt(pageMatch[2]) === nextPageNum) return link;
    }

    return null;
  }

  // ─── Scan (مع الإصلاح) ───
  function scanPage(curr, total) {
    const fill = document.getElementById('p-fill');
    if(fill)fill.style.width=((curr/total)*100)+'%';
    setStatus(`جاري تحليل الصفحة ${curr} من ${total} ... تم رصد ${state.savedRows.length} طلب`,'working');

    const rows = document.querySelectorAll('table tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if(cells.length>1 && cells[0].innerText.trim().indexOf('0')===0){
        const key=cells[0].innerText.trim();
        if(!state.visitedSet.has(key)){
          state.visitedSet.add(key);
          const txt=row.innerText.toLowerCase();
          const isR=txt.includes('received'), isP=txt.includes('packed');
          let hId="";
          const lnk=row.querySelector('a');
          if(lnk&&lnk.href.includes('head_id='))hId=lnk.href.split('head_id=')[1].split('&')[0];
          const clone=row.cloneNode(true);
          if(isR)clone.style.background='rgba(16,185,129,0.08)';
          if(isP)clone.style.background='rgba(245,158,11,0.08)';
          state.savedRows.push({id:key,onl:cells[1].innerText.trim(),node:clone,st:isR?'received':(isP?'packed':'other'),hid:hId});
        }
      }
    });
    updateStats();

    if(curr < total){
      const nxt = findNextPageButton(curr + 1);
      if(nxt){
        console.log('[مُنهي الطلبات] الانتقال للصفحة', curr + 1, '— العنصر:', nxt.tagName, nxt.innerText.trim());
        nxt.click();
        setTimeout(()=>scanPage(curr+1, total), 11000);
      } else {
        // === Fallback أخير: لو مالقاش الزر، يحاول يعدّل الـ URL مباشرة ===
        console.warn('[مُنهي الطلبات] لم يتم العثور على زر الصفحة', curr + 1, '— محاولة عبر URL...');
        const currentUrl = window.location.href;
        let newUrl = null;

        // جرب يغير page parameter في الـ URL
        if (/[?&](page|pageNum|pagenum|p|pg|pn)=\d+/i.test(currentUrl)) {
          newUrl = currentUrl.replace(/([?&](page|pageNum|pagenum|p|pg|pn)=)\d+/i, '$1' + (curr + 1));
        } else if (currentUrl.includes('?')) {
          newUrl = currentUrl + '&page=' + (curr + 1);
        } else {
          newUrl = currentUrl + '?page=' + (curr + 1);
        }

        if (newUrl && newUrl !== currentUrl) {
          console.log('[مُنهي الطلبات] تحميل URL:', newUrl);
          setStatus(`الصفحة ${curr+1}: تحميل عبر URL...`, 'working');

          // استخدم fetch بدل تغيير الصفحة عشان ما نخسرش البيانات
          fetch(newUrl)
            .then(resp => resp.text())
            .then(html => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              const remoteRows = doc.querySelectorAll('table tr');
              remoteRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if(cells.length>1 && cells[0].innerText.trim().indexOf('0')===0){
                  const key = cells[0].innerText.trim();
                  if(!state.visitedSet.has(key)){
                    state.visitedSet.add(key);
                    const txt = row.innerText.toLowerCase();
                    const isR = txt.includes('received'), isP = txt.includes('packed');
                    let hId = "";
                    const lnk = row.querySelector('a');
                    if(lnk){
                      const hrefVal = lnk.getAttribute('href') || '';
                      if(hrefVal.includes('head_id=')) hId = hrefVal.split('head_id=')[1].split('&')[0];
                    }
                    const clone = row.cloneNode(true);
                    if(isR) clone.style.background='rgba(16,185,129,0.08)';
                    if(isP) clone.style.background='rgba(245,158,11,0.08)';
                    state.savedRows.push({id:key, onl:cells[1].innerText.trim(), node:clone, st:isR?'received':(isP?'packed':'other'), hid:hId});
                  }
                }
              });
              updateStats();
              setStatus(`تم تحليل الصفحة ${curr+1} عبر fetch — ${state.savedRows.length} طلب`, 'working');
              if(curr + 1 < total){
                setTimeout(() => scanPage(curr+1, total), 2000);
              } else {
                finishScan();
              }
            })
            .catch(err => {
              console.error('[مُنهي الطلبات] فشل fetch الصفحة:', err);
              setStatus(`⚠️ توقف عند صفحة ${curr} — لم يتم العثور على التالي`, 'error');
              showToast(`توقف عند صفحة ${curr} من ${total}. جاري إكمال ما تم جمعه...`, 'warning');
              finishScan();
            });
          return; // مهم عشان ما ننادي finishScan مرتين
        }

        setStatus(`⚠️ توقف عند صفحة ${curr} — لم يتم العثور على زر التالي`, 'error');
        showToast(`توقف عند صفحة ${curr} من ${total}. جاري إكمال ما تم جمعه...`, 'warning');
        finishScan();
      }
    } else {
      finishScan();
    }
  }

  // ─── Finish ───
  function finishScan(){
    const tables=document.querySelectorAll('table');
    let target=tables[0];
    for(const t of tables)if(t.innerText.length>target.innerText.length)target=t;
    const tbody=target.querySelector('tbody')||target;
    tbody.innerHTML='';
    const sorted=state.savedRows.filter(r=>['received','processed','packed'].includes(r.st)).concat(state.savedRows.filter(r=>!['received','processed','packed'].includes(r.st)));
    sorted.forEach(r=>tbody.appendChild(r.node));
    const recCount=updateStats();
    setStatus(`تم! — ${state.savedRows.length} طلب (${recCount} جاهز)`,'done');
    showToast(`تم رصد ${state.savedRows.length} طلب بنجاح`,'success');

    const mainBody=document.getElementById('ali_main_body');
    mainBody.innerHTML=`
      <div style="margin-bottom:16px">
        <div style="position:relative;margin-bottom:8px">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🧾</span>
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;pointer-events:none;font-family:monospace;z-index:1">0</span>
          <input type="text" id="ali_sI" placeholder="أدخل الأرقام بعد الـ 0..." style="width:100%;padding:12px 42px 12px 32px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:'Tajawal',monospace;outline:none;background:#fafbfc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700">
        </div>
        <div style="position:relative;margin-bottom:8px">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🔗</span>
          <input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:12px 42px 12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:'Tajawal',sans-serif;outline:none;background:#fafbfc;color:#1e293b;direction:rtl;transition:all 0.25s">
        </div>
        <div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:4px 0">عرض ${state.savedRows.length} من ${state.savedRows.length} نتيجة</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:14px;font-weight:700;color:#475569">عدد النوافذ للفتح:</span>
        <input type="number" id="ali_open_count" value="${recCount}" style="width:64px;padding:8px;border:2px solid #3b82f6;border-radius:10px;text-align:center;font-size:18px;font-weight:900;color:#1e40af;background:white;outline:none;font-family:'Tajawal',sans-serif" onfocus="this.value=''">
      </div>
      <button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.3s;margin-bottom:8px">
        📂 فتح ومعالجة Received
      </button>
      <button id="ali_btn_export" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;transition:all 0.3s;margin-bottom:8px">
        📥 تصدير Packed (فلترة ذكية)
      </button>
      <button id="ali_btn_refresh" style="width:100%;padding:10px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:13px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f1f5f9;color:#475569;transition:all 0.3s">
        🔄 تحديث القائمة
      </button>
    `;

    // Search
    const sI=document.getElementById('ali_sI'),sO=document.getElementById('ali_sO'),sC=document.getElementById('ali_search_count');
    function filterTbl(){
      const rawV1=sI.value.trim(),v1=rawV1!==''?('0'+rawV1).toLowerCase():'',v2=sO.value.trim().toLowerCase();
      tbody.innerHTML='';let shown=0;
      state.savedRows.forEach(r=>{
        if((v1!==''&&r.id.toLowerCase().startsWith(v1))||(v2!==''&&r.onl.toLowerCase().includes(v2))||(rawV1===''&&v2==='')){tbody.appendChild(r.node);shown++}
      });
      sC.innerText=`عرض ${shown} من ${state.savedRows.length} نتيجة`;
    }
    sI.addEventListener('input',filterTbl);
    sO.addEventListener('input',filterTbl);

    // ─── Open & Process ───
    document.getElementById('ali_btn_open').addEventListener('click', async()=>{
      const list=state.savedRows.filter(r=>r.st==='received');
      const count=parseInt(document.getElementById('ali_open_count').value)||list.length;
      const toOpen=list.slice(0,count);
      if(!toOpen.length){showToast('لا توجد طلبات Received!','warning');return}

      const res=await showDialog({
        icon:'📂',iconColor:'blue',title:'فتح الطلبات',
        desc:'سيتم فتح الطلبات في نوافذ منفصلة للمعالجة',
        info:[
          {label:'عدد الطلبات',value:toOpen.length+' طلب',color:'#10b981'},
          {label:'النوع',value:'Received',color:'#3b82f6'},
          {label:'الوقت المتوقع',value:'~'+Math.ceil(toOpen.length*1.5)+' ثانية',color:'#f59e0b'}
        ],
        buttons:[
          {text:'إلغاء',value:'cancel'},
          {text:'✅ تأكيد الفتح',value:'confirm',style:'background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 12px rgba(16,185,129,0.3)'}
        ]
      });
      if(res.action!=='confirm')return;

      state.startTime=Date.now();
      state.openedWindows=[];
      const openBtn=document.getElementById('ali_btn_open');
      openBtn.disabled=true;
      const base=window.location.origin+"/ez_pill_web/getEZPill_Details";

      for(let i=0;i<toOpen.length;i++){
        const item=toOpen[i];
        item.st='processed';
        item.node.style.background='rgba(226,232,240,0.5)';
        item.node.style.opacity='0.5';
        const url=base+"?onlineNumber="+item.onl.replace("ERX","")+"&Invoice="+item.id+"&typee=StorePaid&head_id="+item.hid;
        try{const w=window.open(url,"_blank");if(w)state.openedWindows.push(w)}catch(e){}
        openBtn.innerHTML=`🚀 جاري الفتح (${i+1}/${toOpen.length})`;
        setStatus(`فتح ${i+1} من ${toOpen.length}: ${item.onl}`,'working');
        if(i<toOpen.length-1)await new Promise(r=>setTimeout(r,1500));
      }
      updateStats();
      showToast(`تم فتح ${state.openedWindows.length} طلب`,'success');
      openBtn.innerHTML='✅ تسليم وإغلاق الكل';
      openBtn.disabled=false;
      openBtn.style.background='linear-gradient(135deg,#dc2626,#ef4444)';

      openBtn.onclick=async()=>{
        const cr=await showDialog({
          icon:'✅',iconColor:'green',title:'تسليم وإغلاق الكل',
          desc:'سيتم الضغط على زر التسليم في كل نافذة ثم إغلاقها',
          info:[
            {label:'النوافذ المفتوحة',value:state.openedWindows.length+' نافذة',color:'#3b82f6'},
            {label:'العملية',value:'Deliver ثم Close',color:'#10b981'},
            {label:'⚠️ تحذير',value:'لا يمكن التراجع',color:'#ef4444'}
          ],
          buttons:[
            {text:'إلغاء',value:'cancel'},
            {text:'🔒 تسليم وإغلاق',value:'confirm',style:'background:linear-gradient(135deg,#dc2626,#ef4444);color:white'}
          ]
        });
        if(cr.action!=='confirm')return;
        openBtn.disabled=true;
        let delivered=0;
        for(let i=0;i<state.openedWindows.length;i++){
          const w=state.openedWindows[i];
          try{if(!w.closed){const db=w.document.getElementById("deliverbtn");if(db){db.click();delivered++}await new Promise(r=>setTimeout(r,300));w.close()}}catch(e){try{w.close()}catch(x){}}
          openBtn.innerHTML=`⏳ إغلاق (${i+1}/${state.openedWindows.length})`;
          await new Promise(r=>setTimeout(r,500));
        }
        const elapsed=Math.round((Date.now()-state.startTime)/1000);
        const mins=Math.floor(elapsed/60),secs=elapsed%60;
        await showDialog({
          icon:'🎉',iconColor:'green',title:'تم بنجاح!',desc:'تمت معالجة جميع الطلبات',
          info:[
            {label:'تم فتحها',value:state.openedWindows.length.toString(),color:'#10b981'},
            {label:'تم تسليمها',value:delivered.toString(),color:'#3b82f6'},
            {label:'⏱️ الوقت',value:(mins>0?mins+' دقيقة و ':'')+secs+' ثانية',color:'#15803d'}
          ],
          buttons:[{text:'👍 إغلاق',value:'close',style:'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white'}]
        });
        updateStats();finishScan();
      };
    });

    // ─── Export with Pharmacy Filter & Split Files ───
    document.getElementById('ali_btn_export').addEventListener('click', async()=>{
      const packedRows=state.savedRows.filter(r=>r.st==='packed');
      if(!packedRows.length){showToast('لا توجد طلبات Packed!','warning');return}

      const result = await showExportDialog(packedRows);

      if(result.action==='download' && result.orders.length > 0){
        downloadSplitFiles(result.orders, result.pharmacyCode);
      } else if(result.action==='download' && result.orders.length === 0){
        showToast('لا توجد طلبات مطابقة للتصدير!','warning');
      }
    });

    // Refresh
    document.getElementById('ali_btn_refresh').addEventListener('click',()=>{
      showToast('جاري التحديث...','info');
      scanPage(1,parseInt(document.getElementById('p_lim').value));
    });
  }

  // Start
  document.getElementById('ali_start').addEventListener('click',function(){
    this.disabled=true;this.innerHTML='⏳ جاري الفحص...';this.style.opacity='0.6';this.style.cursor='not-allowed';
    scanPage(1,parseInt(document.getElementById('p_lim').value));
  });

})();

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.4';
  
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
    htmlBuffer: ''
  };

  const NEU = {
    bg: '#e0e5ec',
    shadowDark: 'rgba(163,177,198,0.6)',
    shadowLight: 'rgba(255,255,255,0.8)',
    insetDark: 'rgba(163,177,198,0.5)',
    insetLight: 'rgba(255,255,255,0.7)',
    text: '#2d3748',
    textMuted: '#718096',
    accent: '#7c3aed',
    accentLight: '#a78bfa',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    blue: '#3b82f6'
  };
  const neuOutset = `6px 6px 14px ${NEU.shadowDark},-6px -6px 14px ${NEU.shadowLight}`;
  const neuInset = `inset 3px 3px 6px ${NEU.insetDark},inset -3px -3px 6px ${NEU.insetLight}`;
  const neuBtnSm = `4px 4px 10px ${NEU.shadowDark},-4px -4px 10px ${NEU.shadowLight}`;
  const neuBtnPressed = `inset 2px 2px 5px ${NEU.insetDark},inset -2px -2px 5px ${NEU.insetLight}`;

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('ali-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    const colors = { success:NEU.success, error:NEU.error, warning:NEU.warning, info:'#475569' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${NEU.bg};color:${colors[type]};padding:14px 24px;border-radius:18px;font-size:13px;font-weight:700;font-family:'Tajawal','Segoe UI',sans-serif;box-shadow:${neuOutset};display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    toast.innerHTML = `<span>${icons[type]}</span> ${esc(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showDialog({ icon, title, desc, info, badges, buttons }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(180,190,205,0.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s`;

      let infoHTML = '';
      if (info && info.length) {
        infoHTML = info.map(r =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:${NEU.bg};border-radius:14px;margin-bottom:8px;box-shadow:${neuInset}">` +
            `<span style="font-size:13px;color:${NEU.textMuted};font-weight:700">${esc(r.label)}</span>` +
            `<span style="font-weight:900;color:${esc(r.color||NEU.accent)};font-size:14px;font-family:'Tajawal',monospace">${esc(String(r.value))}</span>` +
          `</div>`
        ).join('');
      }

      let badgesHTML = '';
      if (badges && badges.length) {
        badgesHTML = '<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding:4px 0 8px">';
        badges.forEach(b => {
          const bStyle = b.active
            ? `color:${NEU.accent};background:linear-gradient(135deg,#ede9fe,#e8e0fd)`
            : `color:${NEU.textMuted};background:${NEU.bg}`;
          badgesHTML += `<span style="padding:5px 14px;border-radius:20px;font-size:11px;font-weight:800;${bStyle};box-shadow:3px 3px 6px ${NEU.shadowDark},-3px -3px 6px ${NEU.shadowLight}">${esc(b.text)}</span>`;
        });
        badgesHTML += '</div>';
      }

      let buttonsHTML = '';
      if (buttons && buttons.length) {
        buttonsHTML = buttons.map((btn, idx) => {
          const s = btn.primary
            ? `background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:white;box-shadow:4px 4px 12px rgba(124,58,237,0.35),-2px -2px 8px rgba(255,255,255,0.15)`
            : `background:${NEU.bg};color:${NEU.textMuted};box-shadow:${neuBtnSm}`;
          return `<button data-idx="${idx}" style="flex:1;padding:16px;border:none;border-radius:16px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;transition:all 0.25s;${s}">${esc(btn.text)}</button>`;
        }).join('');
      }

      overlay.innerHTML =
        `<div style="background:${NEU.bg};border-radius:28px;width:440px;max-width:92vw;overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:${NEU.text};box-shadow:12px 12px 30px ${NEU.shadowDark},-12px -12px 30px ${NEU.shadowLight};animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">` +
          `<div style="padding:32px 28px 0;text-align:center">` +
            `<div style="width:80px;height:80px;border-radius:50%;background:${NEU.bg};box-shadow:${neuOutset},inset 2px 2px 4px ${NEU.insetLight};display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 18px">${icon}</div>` +
            `<div style="font-size:21px;font-weight:900;color:${NEU.text};margin-bottom:6px">${esc(title)}</div>` +
            `<div style="font-size:13px;color:${NEU.textMuted};line-height:1.7;font-weight:500">${esc(desc)}</div>` +
          `</div>` +
          badgesHTML +
          `<div style="padding:20px 28px">${infoHTML}</div>` +
          `<div style="padding:8px 28px 28px;display:flex;gap:12px">${buttonsHTML}</div>` +
        `</div>`;

      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) {
          const idx = parseInt(btn.getAttribute('data-idx'));
          overlay.style.transition = 'opacity 0.2s';
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 200);
          resolve({ action: buttons[idx].value });
        }
      });
      document.body.appendChild(overlay);
    });
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
    @keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:${NEU.bg};border-radius:24px;box-shadow:${neuOutset};z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:${NEU.text};overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.4s}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#7c3aed,#a78bfa)!important;box-shadow:6px 6px 16px ${NEU.shadowDark},-6px -6px 16px ${NEU.shadowLight}!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"🔍";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row{border-bottom:1px solid rgba(163,177,198,0.2);transition:background 0.2s}
    .fast-row:hover{background:rgba(163,177,198,0.15)}
    .ali-link{color:${NEU.accent};text-decoration:underline;font-weight:bold;cursor:pointer}
  `;
  document.head.appendChild(styleEl);

  function buildStatCard(icon, val, label, color, id) {
    return `<div style="background:${NEU.bg};border-radius:16px;padding:14px 6px;text-align:center;box-shadow:${neuOutset}">` +
      `<div style="font-size:18px;margin-bottom:5px">${icon}</div>` +
      `<div id="${id}" style="font-size:22px;font-weight:900;color:${color};line-height:1;margin-bottom:3px">${val}</div>` +
      `<div style="font-size:9px;color:${NEU.textMuted};font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${label}</div>` +
    `</div>`;
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#4a1d96,#6d28d9);padding:20px 22px 18px;color:white;position:relative;overflow:hidden;border-radius:0 0 22px 22px;box-shadow:0 6px 20px rgba(109,40,217,0.25)">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.2),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.15);cursor:pointer;backdrop-filter:blur(4px)">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.25);cursor:pointer;backdrop-filter:blur(4px)">✕</span>
          </div>
          <h3 style="font-size:18px;font-weight:900;margin:0">محرك بحث وإنهاء الطلبات</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:10px;padding:3px 10px;border-radius:8px;font-weight:700;backdrop-filter:blur(4px)">v${VERSION} Neumorphic</span>
        </div>
      </div>

      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
          ${buildStatCard('📥','0','Received','#10b981','stat_rec')}
          ${buildStatCard('📦','0','Packed','#f59e0b','stat_pack')}
          ${buildStatCard('✅','0','المنجز','#3b82f6','stat_done')}
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total')}
        </div>
        
        <div id="ali_settings_box" style="background:${NEU.bg};border-radius:18px;padding:16px;margin-bottom:16px;box-shadow:${neuOutset}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-size:13px;font-weight:800;color:${NEU.text}">📄 نطاق الفحص (الصفحات)</span>
            <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:70px;padding:8px 6px;border:none;border-radius:12px;text-align:center;font-size:16px;font-weight:900;color:${NEU.accent};background:${NEU.bg};outline:none;font-family:'Tajawal',sans-serif;box-shadow:${neuInset}">
          </div>
          <div id="p-bar" style="height:8px;background:${NEU.bg};border-radius:10px;overflow:hidden;box-shadow:${neuInset}">
            <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#a78bfa,#c4b5fd);border-radius:10px;transition:width 0.2s"></div>
          </div>
          <div id="p-label" style="text-align:center;margin-top:6px;font-size:11px;color:${NEU.textMuted};font-weight:700;display:none"></div>
        </div>
        
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:${NEU.bg};color:${NEU.success};box-shadow:${neuInset}">
          <span>✅</span><span>النظام في وضع الاستعداد</span>
        </div>
        
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:6px 6px 14px rgba(109,40,217,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s">
            🚀 بدء عملية البحث والاستعلام
          </button>
        </div>

        <div style="text-align:center;padding:14px 0 4px;font-size:10px;color:${NEU.textMuted};font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    if (!el) return;
    const configs = {
      ready:   { color:NEU.success, icon:'✅' },
      working: { color:'#6d28d9', icon:'spinner' },
      error:   { color:NEU.error, icon:'❌' },
      done:    { color:NEU.success, icon:'✅' }
    };
    const c = configs[type] || configs.ready;
    const iconHTML = c.icon === 'spinner'
      ? `<div style="width:16px;height:16px;border:2.5px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>`
      : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:${NEU.bg};color:${c.color};box-shadow:${neuInset};transition:all 0.3s`;
    el.innerHTML = `${iconHTML}<span>${esc(text)}</span>`;
  }

  function animNum(id, val) {
    const el = document.getElementById(id);
    if (!el || el.innerText === String(val)) return;
    requestAnimationFrame(() => {
      el.innerText = val;
      el.style.animation = 'aliCountUp 0.4s';
      setTimeout(() => el.style.animation = '', 400);
    });
  }

  function updateStats() {
    let rec=0, done=0, packed=0;
    state.savedRows.forEach(r => {
      if(r.st==='received') rec++;
      if(r.st==='processed') done++;
      if(r.st==='packed') packed++;
    });
    animNum('stat_rec', rec);
    animNum('stat_pack', packed);
    animNum('stat_done', done);
    animNum('stat_total', state.savedRows.length);
  }

  panel.addEventListener('click', e => { if(panel.classList.contains('ali-minimized')){ panel.classList.remove('ali-minimized'); e.stopPropagation(); } });
  document.getElementById('ali_close').addEventListener('click', e => { e.stopPropagation(); panel.style.animation='aliSlideIn 0.3s reverse'; setTimeout(()=>panel.remove(),280); });
  document.getElementById('ali_min').addEventListener('click', e => { e.stopPropagation(); panel.classList.add('ali-minimized'); });

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function processData(data) {
    let orders = [];
    try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
    if (!orders || orders.length === 0) return;

    for (let i = 0; i < orders.length; i++) {
      const item = orders[i];
      const inv = item.Invoice || '';
      const onl = item.onlineNumber || '';
      const src = item.source || 'StorePaid';
      const hid = item.head_id || '';

      if (inv.length >= 5 && inv.startsWith('0') && !state.visitedSet.has(inv)) {
        state.visitedSet.add(inv);

        let st = 'other';
        let rawStatus = String(item.status || item.Status || item.order_status || item.OrderStatus || '').toLowerCase().replace(/<[^>]*>?/gm, '').trim();
        if (rawStatus.includes('packed')) st = 'packed';
        else if (rawStatus.includes('received')) st = 'received';
        else {
          let cleanStr = JSON.stringify(item).toLowerCase();
          if (cleanStr.includes('"packed"')) st = 'packed';
          else if (cleanStr.includes('"received"')) st = 'received';
        }

        const bgColor = st === 'received' ? 'rgba(16,185,129,0.08)' : (st === 'packed' ? 'rgba(245,158,11,0.08)' : 'transparent');

        state.htmlBuffer += `<tr class="fast-row" id="row_${esc(inv)}" style="background:${bgColor}" data-inv="${esc(inv)}" data-onl="${esc(onl)}" data-src="${esc(src)}" data-hid="${esc(hid)}">
          <td style="padding:12px 8px"><span class="ali-link">${esc(inv)}</span></td>
          <td style="padding:12px 8px">${esc(onl)}</td>
          <td style="padding:12px 8px">${esc(item.guestName || '')}</td>
          <td style="padding:12px 8px">${esc(item.guestMobile || item.mobile || '')}</td>
          <td style="padding:12px 8px">${esc(item.payment_method || 'Cash')}</td>
          <td style="padding:12px 8px">${esc(item.created_at || item.Created_Time || '')}</td>
          <td id="st_${esc(inv)}" style="padding:12px 8px">${esc(st)}</td>
          <td style="padding:12px 8px">${esc(src)}</td>
        </tr>`;

        state.savedRows.push({
          id: inv, onl: onl, st: st,
          guestName: item.guestName || '',
          guestMobile: item.guestMobile || item.mobile || '',
          src: src, hid: hid
        });
      }
    }
  }

  // ═══════════════════════════════════════════
  // Scan — نفس الكود الأصلي بالظبط + تقدم + وقت
  // ═══════════════════════════════════════════
  async function scanAllPages() {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    const pLabel = document.getElementById('p-label');
    const baseUrl = window.location.origin + "/ez_pill_web/";
    const currentStatus = 'packed';
    const startTime = performance.now();

    setStatus('جاري الاتصال بقاعدة البيانات...', 'working');

    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = [];
    state.visitedSet.clear();
    state.htmlBuffer = '';
    let completedPages = 0;

    try {
      const res1 = await fetch(baseUrl + 'Home/getOrders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' })
      });
      const data1 = await res1.json();

      if (data1.total_orders) {
        const exactTotal = parseInt(data1.total_orders) || 0;
        if (exactTotal > 0) {
          maxPages = Math.ceil(exactTotal / 10);
          document.getElementById('p_lim').value = maxPages;
        }
      }

      processData(data1);
      updateStats();
      completedPages = 1;
      if (fill) fill.style.width = ((1 / maxPages) * 100) + '%';
      if (pLabel) { pLabel.style.display = 'block'; pLabel.innerText = `1 / ${maxPages} صفحة`; }

      const fetchPromises = [];
      for (let i = 2; i <= maxPages; i++) {
        fetchPromises.push(
          fetch(baseUrl + 'Home/getOrders', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: currentStatus, pageSelected: i, searchby: '' })
          })
          .then(r => r.json())
          .then(data => {
            processData(data);
            completedPages++;
            updateStats();
            if (fill) fill.style.width = ((completedPages / maxPages) * 100) + '%';
            if (pLabel) pLabel.innerText = `${completedPages} / ${maxPages} صفحة`;
            setStatus(`جاري الجلب... ${completedPages}/${maxPages} (${state.savedRows.length} سجل)`, 'working');
          })
          .catch(err => {
            completedPages++;
            console.warn('فشل تحميل صفحة', err);
          })
        );
      }

      await Promise.all(fetchPromises);
      if (fill) fill.style.width = '100%';

    } catch (err) {
      console.error(err);
      setStatus('خطأ في الاتصال بالخادم', 'error');
      showToast('فشل الاتصال بالخادم', 'error');
      state.isProcessing = false;
      return;
    }

    finishScan(startTime);
  }

  function finishScan(startTime) {
    state.isProcessing = false;
    const elapsed = startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : '?';

    const tables = document.querySelectorAll('table');
    let target = tables[0];
    if (target) {
      for (const t of tables) if (t.innerText.length > target.innerText.length) target = t;
      const tbody = target.querySelector('tbody') || target;
      tbody.innerHTML = state.htmlBuffer;

      tbody.addEventListener('click', (e) => {
        const row = e.target.closest('tr[data-inv]');
        if (!row) return;
        const inv = row.dataset.inv;
        const onl = row.dataset.onl;
        const src = row.dataset.src;
        const hid = row.dataset.hid;
        if (inv && typeof getDetails === 'function') {
          getDetails(onl, inv, src, hid);
        }
      });
    }

    let recCount = 0;
    state.savedRows.forEach(r => { if (r.st === 'received') recCount++; });

    const pLabel = document.getElementById('p-label');
    if (pLabel) pLabel.style.display = 'none';

    setStatus(`اكتملت العملية: ${state.savedRows.length} سجل في ${elapsed} ثانية ⚡`, 'done');
    showToast(`اكتمل الحصر: ${state.savedRows.length} سجل (${elapsed}s)`, 'success');

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = `
      <div style="background:${NEU.bg};border-radius:14px;padding:12px 16px;margin-bottom:14px;font-size:12px;color:#6d28d9;font-weight:700;text-align:center;box-shadow:${neuInset}">
        ✅ تم تفعيل الروابط المباشرة — ⚡ ${elapsed} ثانية
      </div>

      <div style="background:${NEU.bg};border-radius:18px;padding:16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;box-shadow:${neuOutset}">
        <span style="font-size:14px;font-weight:800;color:${NEU.text}">الطلبات القابلة للتسليم:</span>
        <input type="number" id="ali_open_count" value="${recCount}" style="width:64px;padding:10px;border:none;border-radius:14px;text-align:center;font-size:18px;font-weight:900;color:${NEU.error};background:${NEU.bg};outline:none;font-family:'Tajawal',sans-serif;box-shadow:${neuInset}" onfocus="this.value=''">
      </div>

      <button id="ali_btn_deliver_silent" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;box-shadow:6px 6px 14px rgba(220,38,38,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s;margin-bottom:10px">
        📝 تنفيذ أوامر التسليم (Received)
      </button>

      <button id="ali_btn_export" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:6px 6px 14px rgba(217,119,6,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s;margin-bottom:10px">
        📦 تصدير بيانات الطلبات (Packed)
      </button>

      <button id="ali_btn_sync" style="width:100%;padding:14px 16px;border:none;border-radius:16px;cursor:pointer;font-weight:800;font-size:13px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:${NEU.bg};color:${NEU.textMuted};box-shadow:${neuBtnSm};transition:all 0.3s">
        🔄 إعادة فحص البيانات
      </button>
    `;

    document.getElementById('ali_btn_deliver_silent').addEventListener('click', async () => {
      const list = state.savedRows.filter(r => r.st === 'received');
      const count = parseInt(document.getElementById('ali_open_count').value) || list.length;
      const toDeliver = list.slice(0, count);
      if (!toDeliver.length) { showToast('لا توجد سجلات مطابقة للمعايير.', 'warning'); return; }

      const res = await showDialog({
        icon: '📝',
        title: 'تأكيد أمر التسليم',
        desc: 'سيتم إرسال طلبات التحديث للخادم في الخلفية.',
        badges: [
          { text: '📥 Received: ' + toDeliver.length, active: true },
          { text: '⚡ معالجة تلقائية', active: true }
        ],
        info: [
          { label: 'إجمالي السجلات', value: toDeliver.length, color: NEU.error },
          { label: 'العملية', value: 'تحديث حالة التسليم', color: NEU.accent }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '✅ تأكيد التنفيذ', value: 'confirm', primary: true }
        ]
      });

      if (res.action !== 'confirm') return;

      const btn = document.getElementById('ali_btn_deliver_silent');
      btn.disabled = true;
      btn.style.boxShadow = neuBtnPressed;
      btn.style.opacity = '0.8';

      let successCount = 0;
      const deliverUrl = window.location.origin + '/ez_pill_web/getEZPill_Details/updatetoDeliver';

      for (let i = 0; i < toDeliver.length; i++) {
        const item = toDeliver[i];
        btn.innerHTML = `<div style="width:14px;height:14px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري المعالجة (${i+1}/${toDeliver.length})...`;
        try {
          const params = new URLSearchParams();
          params.append('invoice_num', item.id);
          params.append('patienName', item.guestName);
          params.append('mobile', item.guestMobile);
          const r = await fetch(deliverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: params
          });
          if (r.ok) {
            successCount++;
            item.st = 'processed';
            const rowEl = document.getElementById('row_' + item.id);
            if (rowEl) {
              rowEl.style.background = 'rgba(163,177,198,0.2)';
              rowEl.style.opacity = '0.5';
              const stEl = document.getElementById('st_' + item.id);
              if (stEl) stEl.innerText = 'processed';
            }
          }
        } catch(e) { console.warn('فشل تسليم:', item.id, e); }
        updateStats();
        await sleep(150);
      }

      await showDialog({
        icon: '🎉',
        title: 'اكتمل التنفيذ',
        desc: 'تم معالجة أوامر التسليم بنجاح',
        badges: [
          { text: '✅ نجح: ' + successCount, active: true },
          { text: '❌ فشل: ' + (toDeliver.length - successCount), active: (toDeliver.length - successCount) > 0 }
        ],
        info: [
          { label: 'تم تسليمه', value: successCount, color: NEU.success },
          { label: 'من إجمالي', value: toDeliver.length, color: NEU.accent }
        ],
        buttons: [
          { text: '👍 تمام', value: 'ok', primary: true }
        ]
      });

      showToast(`تم تنفيذ ${successCount} سجل بنجاح`, 'success');
      btn.innerHTML = '✅ اكتمل التنفيذ';
      btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
      btn.style.boxShadow = `6px 6px 14px rgba(5,150,105,0.3),-4px -4px 10px ${NEU.shadowLight}`;
      btn.style.opacity = '1';
      btn.disabled = false;
    });

    document.getElementById('ali_btn_export').addEventListener('click', async () => {
      const packedRows = state.savedRows.filter(r => r.st === 'packed');
      if (!packedRows.length) { showToast('لا توجد بيانات متاحة للتصدير.', 'warning'); return; }

      const res = await showDialog({
        icon: '📦',
        title: 'تصدير البيانات',
        desc: 'سيتم تصدير بيانات الطلبات المجهزة كملفات نصية',
        info: [
          { label: 'عدد الطلبات', value: packedRows.length, color: NEU.warning },
          { label: 'عدد الملفات', value: Math.ceil(packedRows.length / MAX_PER_FILE), color: NEU.accent }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '📥 بدء التصدير', value: 'confirm', primary: true }
        ]
      });

      if (res.action !== 'confirm') return;

      const numFiles = Math.ceil(packedRows.length / MAX_PER_FILE);
      for (let i = 0; i < numFiles; i++) {
        const chunk = packedRows.slice(i * MAX_PER_FILE, Math.min((i+1) * MAX_PER_FILE, packedRows.length));
        const content = chunk.map(r => r.onl).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = url; a.download = 'Data_Export_' + (i+1) + '.txt';
          document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(url);
        }, i * 500);
      }
      showToast(`تم تصدير ${numFiles} ملف بنجاح`, 'success');
    });

    document.getElementById('ali_btn_sync').addEventListener('click', async function() {
      if (state.isProcessing) { showToast('العملية جارية بالفعل — انتظر!', 'warning'); return; }

      const syncBtn = this;
      const oldCount = state.savedRows.length;

      const res = await showDialog({
        icon: '🔄',
        title: 'إعادة فحص البيانات',
        desc: 'سيتم إعادة جلب كل البيانات من الخادم وتحديث القائمة',
        badges: [
          { text: 'حذف القديم', active: true },
          { text: 'جلب الجديد', active: true },
          { text: 'تحديث الحالات', active: true }
        ],
        info: [
          { label: 'السجلات الحالية', value: oldCount, color: NEU.accent },
          { label: 'العملية', value: 'فحص شامل', color: NEU.blue }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '🔄 بدء الفحص', value: 'confirm', primary: true }
        ]
      });

      if (res.action !== 'confirm') return;

      syncBtn.disabled = true;
      syncBtn.innerHTML = `<div style="width:14px;height:14px;border:2.5px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري إعادة الفحص...`;
      syncBtn.style.boxShadow = neuBtnPressed;
      syncBtn.style.color = NEU.accent;

      await scanAllPages();
    });
  }

  document.getElementById('ali_start').addEventListener('click', function() {
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = `<div style="width:16px;height:16px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري فحص البيانات...`;
    this.style.boxShadow = neuBtnPressed;
    this.style.opacity = '0.8';
    scanAllPages();
  });

})();

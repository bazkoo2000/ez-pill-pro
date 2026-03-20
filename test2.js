javascript: (function () {
  /* ═══════════════════════════════════════════
     البحث الشامل v14 — iOS Redesign
     ═══════════════════════════════════════════ */

  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';

  const STATUSES = {
    readypack: { label: 'Ready to Pack', color: '#34C759', bg: 'rgba(52,199,89,0.10)', icon: `<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#34C759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    new:       { label: 'New',           color: '#FF9F0A', bg: 'rgba(255,159,10,0.10)', icon: `<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="#FF9F0A" stroke-width="2.5"/></svg>` },
    packed:    { label: 'Packed',        color: '#5E5CE6', bg: 'rgba(94,92,230,0.10)',  icon: `<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#5E5CE6" stroke-width="2"/></svg>` },
    delivered: { label: 'Delivered',     color: '#BF5AF2', bg: 'rgba(191,90,242,0.10)', icon: `<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke="#BF5AF2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  };

  const FETCH_TIMEOUT = 15000;
  const OPEN_DELAY    = 900;
  const MAX_PAGES     = 20;

  /* ── Helpers ── */
  const d = document;
  const esc = (s) => {
    const div = d.createElement('div');
    div.appendChild(d.createTextNode((s || '').toString()));
    return div.innerHTML;
  };
  const sanitizeURL = (url) => {
    try { const u = new URL(url); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; }
    catch { return '#'; }
  };

  let links = [], openedLinks = new Set(), isDragging = false, dragX = 0, dragY = 0;
  let isMinimized = false, searchController = null, isSearching = false;

  /* ── Cleanup old instances ── */
  d.getElementById('baz-ui')?.remove();
  d.getElementById('baz-style')?.remove();

  /* ═══════════════════════════════════════════
     STYLES — True iOS 18 Design
     ═══════════════════════════════════════════ */
  const style = d.createElement('style');
  style.id = 'baz-style';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');

    #baz-ui, #baz-ui * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #baz-ui {
      position: fixed;
      width: 400px;
      max-width: 94vw;
      background: rgba(251,251,253,0.88);
      backdrop-filter: saturate(180%) blur(60px);
      -webkit-backdrop-filter: saturate(180%) blur(60px);
      z-index: 999999;
      border-radius: 20px;
      direction: rtl;
      font-family: 'IBM Plex Sans Arabic', -apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
      max-height: 86vh;
      display: flex;
      flex-direction: column;
      border: 0.5px solid rgba(0,0,0,0.08);
      box-shadow:
        0 0 0 0.5px rgba(0,0,0,0.04),
        0 8px 40px rgba(0,0,0,0.08),
        0 24px 80px rgba(0,0,0,0.06);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
    }

    #baz-ui:hover {
      box-shadow:
        0 0 0 0.5px rgba(0,0,0,0.06),
        0 12px 48px rgba(0,0,0,0.10),
        0 32px 96px rgba(0,0,0,0.08);
    }

    #baz-ui.minimized #baz-body { display: none; }
    #baz-ui.minimized { max-height: unset; border-radius: 16px; }

    /* ── Header ── */
    #baz-ui #baz-header {
      padding: 16px 18px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
      border-bottom: 0.5px solid rgba(0,0,0,0.04);
    }
    #baz-ui #baz-header:active { cursor: grabbing; }

    #baz-ui .hdr-left { display: flex; align-items: center; gap: 12px; }

    #baz-ui .hdr-logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(145deg, #007AFF, #5856D6);
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,122,255,0.3);
      flex-shrink: 0;
    }
    #baz-ui .hdr-logo svg { width: 20px; height: 20px; }

    #baz-ui .hdr-title {
      color: #1C1C1E;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    #baz-ui .hdr-ver {
      color: #8E8E93;
      font-size: 11px;
      font-weight: 500;
    }

    #baz-ui .hdr-btns { display: flex; gap: 8px; }

    #baz-ui .hdr-btn {
      background: rgba(120,120,128,0.08);
      border: none;
      color: #8E8E93;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    #baz-ui .hdr-btn:hover { background: rgba(120,120,128,0.16); color: #636366; }
    #baz-ui .hdr-btn:active { transform: scale(0.92); }

    /* ── Body ── */
    #baz-ui #baz-body {
      padding: 12px 14px 16px;
      overflow-y: auto;
      flex: 1;
      scrollbar-width: none;
    }
    #baz-ui #baz-body::-webkit-scrollbar { display: none; }

    /* ── Search Section ── */
    #baz-ui .search-section {
      background: rgba(255,255,255,0.80);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 10px;
      border: 0.5px solid rgba(0,0,0,0.04);
    }

    #baz-ui .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }

    #baz-ui .field-group { display: flex; flex-direction: column; gap: 4px; }

    #baz-ui .field-label {
      font-size: 11px;
      font-weight: 600;
      color: #8E8E93;
      padding-right: 2px;
    }

    #baz-ui .field-row {
      display: flex;
      align-items: center;
      background: rgba(120,120,128,0.06);
      border: 0.5px solid rgba(0,0,0,0.04);
      border-radius: 10px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    #baz-ui .field-row:focus-within {
      background: rgba(0,122,255,0.04);
      border-color: rgba(0,122,255,0.3);
      box-shadow: 0 0 0 3px rgba(0,122,255,0.08);
    }

    #baz-ui .field-prefix {
      padding: 0 10px;
      color: #007AFF;
      font-size: 12px;
      font-weight: 700;
      border-left: 0.5px solid rgba(0,0,0,0.06);
      height: 100%;
      display: flex;
      align-items: center;
    }

    #baz-ui .baz-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #1C1C1E;
      font-size: 13px;
      padding: 11px 12px;
      font-family: inherit;
      font-weight: 600;
    }
    #baz-ui .baz-input::placeholder { color: #C7C7CC; }

    /* ── Buttons ── */
    #baz-ui .btn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    #baz-ui .btn-grid.has-cancel { grid-template-columns: 1fr 1fr 1fr; }

    #baz-ui .baz-btn {
      padding: 11px 12px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      letter-spacing: -0.1px;
    }
    #baz-ui .baz-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    #baz-ui .baz-btn:not(:disabled):active { transform: scale(0.97); }

    #baz-ui .btn-ready {
      background: #007AFF;
      color: white;
      box-shadow: 0 2px 8px rgba(0,122,255,0.25);
    }
    #baz-ui .btn-ready:not(:disabled):hover { background: #0071E3; }

    #baz-ui .btn-all {
      background: rgba(120,120,128,0.08);
      color: #636366;
    }
    #baz-ui .btn-all:not(:disabled):hover { background: rgba(120,120,128,0.14); }

    #baz-ui .btn-cancel {
      background: rgba(255,59,48,0.08);
      color: #FF3B30;
      display: none;
    }
    #baz-ui .btn-cancel:not(:disabled):hover { background: rgba(255,59,48,0.14); }

    /* ── Status Bar ── */
    #baz-ui #baz-status-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      min-height: 28px;
    }

    #baz-ui #baz-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0,122,255,0.12);
      border-top-color: #007AFF;
      border-radius: 50%;
      animation: baz-spin 0.7s linear infinite;
      display: none;
      flex-shrink: 0;
    }
    @keyframes baz-spin { to { transform: rotate(360deg); } }

    #baz-ui #baz-st {
      font-size: 12px;
      color: #8E8E93;
      flex: 1;
      font-weight: 600;
    }
    #baz-ui #baz-st b { color: #007AFF; }
    #baz-ui #baz-st .err { color: #FF3B30; }
    #baz-ui #baz-st .success { color: #34C759; }

    /* ── Open Panel ── */
    #baz-ui #baz-open-panel {
      background: rgba(255,255,255,0.80);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 10px;
      display: none;
      border: 0.5px solid rgba(0,0,0,0.04);
    }

    #baz-ui .open-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
    }

    #baz-ui .stat-item { display: flex; flex-direction: column; gap: 2px; }

    #baz-ui .stat-val {
      font-size: 22px;
      font-weight: 700;
      color: #1C1C1E;
      letter-spacing: -0.5px;
    }
    #baz-ui .stat-val.green { color: #34C759; }
    #baz-ui .stat-val.orange { color: #FF9F0A; }

    #baz-ui .stat-lbl {
      font-size: 10px;
      color: #8E8E93;
      font-weight: 600;
    }

    #baz-ui .open-row { display: flex; align-items: center; gap: 10px; }

    #baz-ui .open-count-input {
      width: 58px;
      background: rgba(120,120,128,0.06);
      border: 0.5px solid rgba(0,0,0,0.04);
      border-radius: 10px;
      color: #1C1C1E;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      padding: 9px;
      outline: none;
      font-family: inherit;
    }
    #baz-ui .open-count-input:focus {
      border-color: rgba(0,122,255,0.3);
      box-shadow: 0 0 0 3px rgba(0,122,255,0.08);
    }

    #baz-ui .btn-open {
      flex: 1;
      background: #007AFF;
      color: white;
      padding: 10px 18px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,122,255,0.2);
    }
    #baz-ui .btn-open:hover { background: #0071E3; }
    #baz-ui .btn-open:active { transform: scale(0.97); }

    /* ── Result Cards ── */
    #baz-ui #baz-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #baz-ui .result-card {
      background: rgba(255,255,255,0.80);
      border-radius: 14px;
      padding: 14px;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      border: 0.5px solid rgba(0,0,0,0.04);
    }
    #baz-ui .result-card::before {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 0 14px 14px 0;
      background: var(--card-color, #007AFF);
    }
    #baz-ui .result-card:hover {
      background: rgba(255,255,255,0.95);
      transform: translateX(-1px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    #baz-ui .result-card.opened { opacity: 0.3; }

    #baz-ui .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    #baz-ui .card-order {
      font-size: 14px;
      font-weight: 700;
      color: #1C1C1E;
      letter-spacing: -0.2px;
    }

    #baz-ui .card-status {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #baz-ui .card-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }

    #baz-ui .info-item { display: flex; flex-direction: column; gap: 3px; }
    #baz-ui .info-lbl { font-size: 10px; color: #C7C7CC; font-weight: 600; }
    #baz-ui .info-val {
      font-size: 12px;
      color: #636366;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #baz-ui .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #baz-ui .card-invoice {
      font-size: 11px;
      color: #C7C7CC;
      font-family: 'SF Mono', ui-monospace, monospace;
      font-weight: 500;
    }

    #baz-ui .card-open-btn {
      text-decoration: none;
      background: rgba(0,122,255,0.08);
      color: #007AFF;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #baz-ui .card-open-btn:hover {
      background: #007AFF;
      color: white;
    }

    #baz-ui .card-opened-lbl {
      font-size: 11px;
      color: #34C759;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ── Empty State ── */
    #baz-ui .empty-state {
      text-align: center;
      padding: 36px 20px;
      color: #C7C7CC;
    }
    #baz-ui .empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.6; }
    #baz-ui .empty-text { font-size: 13px; font-weight: 600; color: #8E8E93; }
    #baz-ui .empty-sub { font-size: 11px; font-weight: 500; color: #C7C7CC; margin-top: 4px; }

    /* ── Session Alert ── */
    #baz-ui .session-alert {
      background: rgba(255,59,48,0.06);
      border: 0.5px solid rgba(255,59,48,0.15);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 10px;
      display: none;
      font-size: 12px;
      color: #FF3B30;
      font-weight: 600;
      text-align: center;
    }

    /* ── Touch support ── */
    @media (pointer: coarse) {
      #baz-ui .baz-input { font-size: 16px; }
      #baz-ui .baz-btn { padding: 13px 12px; }
    }

    /* ── Sort/Filter bar ── */
    #baz-ui .filter-bar {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    #baz-ui .filter-chip {
      background: rgba(120,120,128,0.08);
      border: none;
      border-radius: 100px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      color: #636366;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #baz-ui .filter-chip:hover { background: rgba(120,120,128,0.14); }
    #baz-ui .filter-chip.active {
      background: rgba(0,122,255,0.10);
      color: #007AFF;
    }
  `;
  d.head.appendChild(style);

  /* ═══════════════════════════════════════════
     HTML Structure
     ═══════════════════════════════════════════ */
  const ui = d.createElement('div');
  ui.id = 'baz-ui';
  ui.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%)';
  ui.innerHTML = `
    <div id="baz-header">
      <div class="hdr-left">
        <div class="hdr-logo">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <span class="hdr-title">البحث الشامل</span><br>
          <span class="hdr-ver">v14 — iOS Edition</span>
        </div>
      </div>
      <div class="hdr-btns">
        <button class="hdr-btn" id="baz-min" title="تصغير">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
        <button class="hdr-btn" id="baz-close" title="إغلاق" style="background:rgba(255,59,48,0.08);color:#FF3B30">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>

    <div id="baz-body">
      <div class="session-alert" id="baz-session-alert">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="display:inline;vertical-align:-2px"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF3B30" stroke-width="2" stroke-linecap="round"/></svg>
        انتهت الجلسة — سجّل دخولك مرة أخرى ثم أعد المحاولة
      </div>

      <div class="search-section">
        <div class="fields-grid">
          <div class="field-group">
            <span class="field-label">رقم الفاتورة</span>
            <div class="field-row"><input class="baz-input" id="f-invoice" placeholder="INV-12345" autocomplete="off"></div>
          </div>
          <div class="field-group">
            <span class="field-label">رقم الطلب</span>
            <div class="field-row"><span class="field-prefix">ERX</span><input class="baz-input" id="f-order" placeholder="أرقام فقط" autocomplete="off"></div>
          </div>
          <div class="field-group">
            <span class="field-label">اسم الضيف</span>
            <div class="field-row"><input class="baz-input" id="f-name" placeholder="اسم العميل" autocomplete="off"></div>
          </div>
          <div class="field-group">
            <span class="field-label">موبايل الضيف</span>
            <div class="field-row"><input class="baz-input" id="f-mobile" placeholder="05xxxxxxxx" autocomplete="off"></div>
          </div>
        </div>
        <div class="btn-grid" id="baz-btn-grid">
          <button id="baz-run-ready" class="baz-btn btn-ready">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="white" stroke-width="2"/></svg>
            Ready to Pack
          </button>
          <button id="baz-run-all" class="baz-btn btn-all">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 019 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            بحث الكل
          </button>
          <button id="baz-cancel" class="baz-btn btn-cancel">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            إلغاء
          </button>
        </div>
      </div>

      <div id="baz-status-bar">
        <div id="baz-spinner"></div>
        <div id="baz-st"></div>
      </div>

      <div id="baz-open-panel">
        <div class="open-stats">
          <div class="stat-item">
            <span class="stat-val" id="stat-total">0</span>
            <span class="stat-lbl">إجمالي</span>
          </div>
          <div class="stat-item">
            <span class="stat-val green" id="stat-opened">0</span>
            <span class="stat-lbl">مفتوحة</span>
          </div>
          <div class="stat-item">
            <span class="stat-val orange" id="stat-remain">0</span>
            <span class="stat-lbl">متبقية</span>
          </div>
        </div>
        <div class="open-row">
          <input class="open-count-input" id="baz-open-count" type="number" min="1" value="10">
          <button class="btn-open" id="baz-do-open">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            فتح الروابط
          </button>
        </div>
      </div>

      <div id="baz-filter-bar" class="filter-bar" style="display:none">
        <button class="filter-chip active" data-filter="all">الكل</button>
        <button class="filter-chip" data-filter="readypack">Ready</button>
        <button class="filter-chip" data-filter="new">New</button>
        <button class="filter-chip" data-filter="packed">Packed</button>
        <button class="filter-chip" data-filter="delivered">Delivered</button>
      </div>

      <div id="baz-cards"></div>
    </div>
  `;
  d.body.appendChild(ui);

  /* ═══════════════════════════════════════════
     Drag — Mouse + Touch
     ═══════════════════════════════════════════ */
  const hdr = d.getElementById('baz-header');
  const startDrag = (x, y) => {
    isDragging = true;
    const rect = ui.getBoundingClientRect();
    dragX = x - rect.left;
    dragY = y - rect.top;
    ui.style.transform = 'none';
  };
  const moveDrag = (x, y) => {
    if (!isDragging) return;
    const maxX = window.innerWidth - ui.offsetWidth;
    const maxY = window.innerHeight - ui.offsetHeight;
    ui.style.left = Math.max(0, Math.min(maxX, x - dragX)) + 'px';
    ui.style.top  = Math.max(0, Math.min(maxY, y - dragY)) + 'px';
  };

  hdr.addEventListener('mousedown', (e) => { if (!e.target.closest('.hdr-btn')) startDrag(e.clientX, e.clientY); });
  d.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  d.addEventListener('mouseup', () => { isDragging = false; });

  hdr.addEventListener('touchstart', (e) => {
    if (e.target.closest('.hdr-btn')) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  d.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  d.addEventListener('touchend', () => { isDragging = false; });

  /* ═══════════════════════════════════════════
     Core Logic
     ═══════════════════════════════════════════ */
  const $ = (id) => d.getElementById(id);

  const getQuery = () => ({
    inv:  $('f-invoice').value.trim(),
    ord:  $('f-order').value.trim(),
    name: $('f-name').value.trim(),
    mob:  $('f-mobile').value.trim()
  });

  const getSearchValue = (q) => q.mob || q.inv || q.ord || q.name || '';

  const setLoading = (on) => {
    $('baz-spinner').style.display = on ? 'block' : 'none';
    $('baz-run-ready').disabled = on;
    $('baz-run-all').disabled   = on;
    $('baz-cancel').style.display = on ? 'flex' : 'none';
    $('baz-btn-grid').className = on ? 'btn-grid has-cancel' : 'btn-grid';
    isSearching = on;
  };

  const updateOpenPanel = () => {
    const rem = links.filter(l => !openedLinks.has(l.key));
    $('stat-total').textContent  = links.length;
    $('stat-opened').textContent = openedLinks.size;
    $('stat-remain').textContent = rem.length;
    const ce = $('baz-open-count');
    ce.max   = rem.length;
    ce.value = Math.min(parseInt(ce.value) || 10, rem.length || 1);
  };

  /* ── Session check ── */
  const checkSession = async () => {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(BASE_URL + 'Home/getOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'readypack', pageSelected: 1, searchby: '___session_test___' }),
        signal: ctrl.signal
      });
      if (res.status === 401 || res.status === 403 || res.redirected) {
        $('baz-session-alert').style.display = 'block';
        return false;
      }
      $('baz-session-alert').style.display = 'none';
      return true;
    } catch {
      return true; /* allow attempt even if check fails */
    }
  };

  /* ── Fetch with timeout ── */
  const fetchWithTimeout = async (url, options, timeout = FETCH_TIMEOUT) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  /* ── Fetch ALL pages for a status ── */
  const fetchAllPages = async (status, searchValue, signal) => {
    let allOrders = [];
    let page = 1;

    while (page <= MAX_PAGES) {
      if (signal?.aborted) break;

      const res = await fetchWithTimeout(BASE_URL + 'Home/getOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pageSelected: page, searchby: searchValue }),
        signal
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          $('baz-session-alert').style.display = 'block';
          throw new Error('SESSION_EXPIRED');
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      let orders;
      try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; }
      catch { orders = []; }

      if (!Array.isArray(orders) || orders.length === 0) break;

      allOrders = allOrders.concat(orders);

      /* If we got fewer results than a typical full page, we're on the last page */
      if (orders.length < 10) break;
      page++;
    }

    return allOrders;
  };

  /* ── Add card ── */
  const addCard = (item, info, statusKey) => {
    const orderNum = (item.onlineNumber || '').replace(/ERX/gi, '');
    const url = sanitizeURL(
      BASE_URL + `getEZPill_Details?onlineNumber=${encodeURIComponent(orderNum)}&Invoice=${encodeURIComponent(item.Invoice || '')}&typee=${encodeURIComponent(item.typee || '')}&head_id=${encodeURIComponent(item.head_id || '')}`
    );
    const key = (item.Invoice || '') + ':' + (item.onlineNumber || '');
    links.push({ url, key, status: statusKey });

    const card = d.createElement('div');
    card.className = 'result-card';
    card.dataset.status = statusKey;
    card.id = 'card-' + links.length;
    card.style.setProperty('--card-color', info.color);
    card.innerHTML = `
      <div class="card-top">
        <span class="card-order">${esc(item.onlineNumber || '—')}</span>
        <span class="card-status" style="background:${info.bg};color:${info.color}">${info.icon} ${esc(info.label)}</span>
      </div>
      <div class="card-info">
        <div class="info-item">
          <span class="info-lbl">الضيف</span>
          <span class="info-val">${esc(item.guestName || '—')}</span>
        </div>
        <div class="info-item">
          <span class="info-lbl">الموبايل</span>
          <span class="info-val">${esc(item.guestMobile || item.mobile || '—')}</span>
        </div>
      </div>
      <div class="card-bottom">
        <span class="card-invoice">${esc(item.Invoice || '')}</span>
        <a href="${esc(url)}" target="_blank" rel="noopener" class="card-open-btn">
          فتح
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>`;
    $('baz-cards').appendChild(card);
  };

  /* ── Filtering ── */
  const applyFilter = (filter) => {
    d.querySelectorAll('.result-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
    d.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === filter);
    });
  };

  /* ══════════════════════════════════════
     MAIN SEARCH
     ══════════════════════════════════════ */
  const runSearch = async (statusKeys) => {
    /* Debounce — block if already searching */
    if (isSearching) return;

    const q = getQuery();
    const searchValue = getSearchValue(q);
    const st = $('baz-st');
    const cards = $('baz-cards');
    const panel = $('baz-open-panel');

    if (!searchValue) {
      st.innerHTML = '<span class="err">أدخل قيمة بحث أولاً</span>';
      return;
    }

    /* Reset */
    cards.innerHTML = '';
    panel.style.display = 'none';
    $('baz-filter-bar').style.display = 'none';
    $('baz-session-alert').style.display = 'none';
    links = [];
    openedLinks = new Set();

    /* Session check */
    const sessionOk = await checkSession();
    if (!sessionOk) { setLoading(false); return; }

    /* Abort controller for cancel */
    searchController = new AbortController();
    setLoading(true);

    let count = 0;
    const seen = new Set();

    /* Save last search to sessionStorage */
    try { sessionStorage.setItem('baz_last_search', JSON.stringify(q)); } catch {}

    for (const status of statusKeys) {
      if (searchController.signal.aborted) break;

      const info = STATUSES[status];
      st.innerHTML = `جاري البحث في <b>${esc(info.label)}</b>...`;

      try {
        const orders = await fetchAllPages(status, searchValue, searchController.signal);

        orders.forEach(item => {
          if (!item) return;
          const key = (item.Invoice || '') + ':' + (item.onlineNumber || '');
          if (seen.has(key)) return;
          seen.add(key);
          count++;
          addCard(item, info, status);
        });
      } catch (err) {
        if (err.message === 'SESSION_EXPIRED') {
          setLoading(false);
          return;
        }
        if (err.name === 'AbortError') break;
        st.innerHTML = `<span class="err">خطأ في "${esc(info.label)}"</span>`;
        console.error('[BazRadar]', status, err);
      }
    }

    setLoading(false);

    if (searchController.signal.aborted) {
      st.innerHTML = `<span class="err">تم الإلغاء</span> — <b>${count}</b> نتيجة`;
    } else if (count > 0) {
      st.innerHTML = `<span class="success">✓</span> اكتمل — <b>${count}</b> نتيجة`;
      panel.style.display = 'block';
      if (statusKeys.length > 1) $('baz-filter-bar').style.display = 'flex';
      updateOpenPanel();
    } else {
      cards.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div class="empty-text">لم نجد نتائج</div>
          <div class="empty-sub">لـ "${esc(searchValue)}"</div>
        </div>`;
      st.innerHTML = '';
    }
  };

  /* ══════════════════════════════════════
     OPEN RESULTS
     ══════════════════════════════════════ */
  const openResults = async () => {
    const n = parseInt($('baz-open-count').value) || 10;
    const remaining = links.filter(l => !openedLinks.has(l.key));
    const st = $('baz-st');

    if (remaining.length === 0) {
      st.innerHTML = '<span class="success">✓</span> كل النتائج تم فتحها';
      return;
    }

    const toOpen = remaining.slice(0, n);

    for (let i = 0; i < toOpen.length; i++) {
      st.innerHTML = `فتح <b>${i + 1}</b> من <b>${toOpen.length}</b>...`;
      window.open(toOpen[i].url, '_blank');
      openedLinks.add(toOpen[i].key);

      const card = d.querySelector(`[id="card-${links.indexOf(toOpen[i]) + 1}"]`);
      if (card) {
        card.classList.add('opened');
        const btn = card.querySelector('.card-open-btn');
        if (btn) btn.outerHTML = `<span class="card-opened-lbl">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#34C759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          تم الفتح
        </span>`;
      }

      await new Promise(r => setTimeout(r, OPEN_DELAY));
    }

    updateOpenPanel();
    const left = links.filter(l => !openedLinks.has(l.key)).length;
    st.innerHTML = `<span class="success">✓</span> فُتح <b>${toOpen.length}</b> — متبقي: <b>${left}</b>`;
  };

  /* ═══════════════════════════════════════════
     Event Bindings
     ═══════════════════════════════════════════ */
  $('baz-min').onclick = () => {
    isMinimized = !isMinimized;
    ui.classList.toggle('minimized', isMinimized);
    $('baz-min').innerHTML = isMinimized
      ? '<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
      : '<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  };

  $('baz-close').onclick = () => {
    ui.remove();
    $('baz-style')?.remove();
  };

  $('baz-run-ready').onclick = () => runSearch(['readypack']);
  $('baz-run-all').onclick   = () => runSearch(['readypack', 'new', 'packed', 'delivered']);

  $('baz-cancel').onclick = () => {
    if (searchController) searchController.abort();
  };

  $('baz-do-open').onclick = openResults;

  /* Filter chips */
  d.querySelectorAll('.filter-chip').forEach(chip => {
    chip.onclick = () => applyFilter(chip.dataset.filter);
  });

  /* Enter key search */
  d.querySelectorAll('#baz-ui .baz-input').forEach(el => {
    el.onkeypress = (e) => { if (e.key === 'Enter') runSearch(['readypack']); };
  });

  /* Restore last search */
  try {
    const last = JSON.parse(sessionStorage.getItem('baz_last_search') || '{}');
    if (last.inv) $('f-invoice').value = last.inv;
    if (last.ord) $('f-order').value   = last.ord;
    if (last.name) $('f-name').value   = last.name;
    if (last.mob) $('f-mobile').value  = last.mob;
  } catch {}

})();

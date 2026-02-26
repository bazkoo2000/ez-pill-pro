javascript: (function () {

  // ============================================================
  //  رادار علي الباز — V12  |  Dark Dashboard + Cards
  // ============================================================

  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';

  const STATUSES = {
    readypack: { label: 'Ready to Pack', color: '#00e5a0', dot: '#00e5a0' },
    new:       { label: 'New',           color: '#fbbf24', dot: '#fbbf24' },
    packed:    { label: 'Packed',        color: '#60a5fa', dot: '#60a5fa' },
    delivered: { label: 'Delivered',     color: '#c084fc', dot: '#c084fc' },
  };

  const d          = document;
  let links        = [];
  let openedLinks  = new Set();
  let isDragging   = false;
  let dragX        = 0, dragY = 0;
  let isMinimized  = false;
  let cancelSearch = false;

  d.getElementById('baz-ui')    && d.getElementById('baz-ui').remove();
  d.getElementById('baz-style') && d.getElementById('baz-style').remove();

  const esc = (s) => (s||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  // ============================================================
  //  STYLES
  // ============================================================
  const style = d.createElement('style');
  style.id = 'baz-style';
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap');

    #baz-ui, #baz-ui * { box-sizing: border-box; margin: 0; padding: 0; }

    #baz-ui {
      position: fixed;
      width: 480px;
      max-width: 96vw;
      background: #0d1117;
      z-index: 999999;
      border-radius: 16px;
      direction: rtl;
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', sans-serif;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      border: 1px solid #21262d;
      box-shadow: 0 0 0 1px #30363d, 0 24px 64px rgba(0,0,0,0.7);
      overflow: hidden;
    }

    #baz-ui.minimized #baz-body   { display: none; }
    #baz-ui.minimized              { max-height: unset; }
    #baz-ui.minimized #baz-header  { border-radius: 16px; }

    /* HEADER */
    #baz-ui #baz-header {
      background: #161b22;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #21262d;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    #baz-ui #baz-header:active { cursor: grabbing; }

    #baz-ui .hdr-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #baz-ui .hdr-logo {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #00e5a0, #00b4d8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }

    #baz-ui .hdr-title {
      color: #e6edf3;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    #baz-ui .hdr-ver {
      color: #00e5a0;
      font-size: 10px;
      font-weight: 500;
      background: rgba(0,229,160,0.1);
      padding: 2px 7px;
      border-radius: 20px;
      border: 1px solid rgba(0,229,160,0.2);
    }

    #baz-ui .hdr-btns {
      display: flex;
      gap: 6px;
    }
    #baz-ui .hdr-btn {
      background: transparent;
      border: 1px solid #30363d;
      color: #8b949e;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    #baz-ui .hdr-btn:hover { background: #21262d; color: #e6edf3; border-color: #8b949e; }

    /* BODY */
    #baz-ui #baz-body {
      padding: 14px;
      overflow-y: auto;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: #30363d transparent;
    }
    #baz-ui #baz-body::-webkit-scrollbar { width: 4px; }
    #baz-ui #baz-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }

    /* SEARCH SECTION */
    #baz-ui .search-section {
      background: #161b22;
      border: 1px solid #21262d;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
    }

    #baz-ui .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }

    #baz-ui .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    #baz-ui .field-label {
      font-size: 10px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    #baz-ui .field-row {
      display: flex;
      align-items: center;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.15s;
    }
    #baz-ui .field-row:focus-within { border-color: #00e5a0; }

    #baz-ui .field-prefix {
      padding: 0 8px;
      color: #00e5a0;
      font-size: 11px;
      font-weight: 700;
      border-left: 1px solid #30363d;
      height: 100%;
      display: flex;
      align-items: center;
      background: rgba(0,229,160,0.06);
    }
    #baz-ui .baz-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e6edf3;
      font-size: 12px;
      padding: 8px 10px;
      font-family: inherit;
    }
    #baz-ui .baz-input::placeholder { color: #484f58; }

    /* BUTTONS */
    #baz-ui .btn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    #baz-ui .btn-grid.has-cancel { grid-template-columns: 1fr 1fr 1fr; }

    #baz-ui .baz-btn {
      padding: 9px 12px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
    }
    #baz-ui .baz-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
    #baz-ui .baz-btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.1); }

    #baz-ui .btn-ready  { background: linear-gradient(135deg,#00e5a0,#00b4d8); color: #0d1117; }
    #baz-ui .btn-all    { background: #21262d; color: #e6edf3; border: 1px solid #30363d; }
    #baz-ui .btn-all:not(:disabled):hover { background: #30363d !important; }
    #baz-ui .btn-cancel { background: rgba(248,81,73,0.15); color: #f85149; border: 1px solid rgba(248,81,73,0.3); display: none; }

    /* STATUS BAR */
    #baz-ui #baz-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      min-height: 32px;
    }
    #baz-ui #baz-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #21262d;
      border-top-color: #00e5a0;
      border-radius: 50%;
      animation: baz-spin 0.6s linear infinite;
      display: none;
      flex-shrink: 0;
    }
    @keyframes baz-spin { to { transform: rotate(360deg); } }
    #baz-ui #baz-st {
      font-size: 12px;
      color: #8b949e;
      flex: 1;
    }
    #baz-ui #baz-st b { color: #00e5a0; }
    #baz-ui #baz-st .err { color: #f85149; }

    /* OPEN PANEL */
    #baz-ui #baz-open-panel {
      background: #161b22;
      border: 1px solid #21262d;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
      display: none;
    }
    #baz-ui .open-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
    }
    #baz-ui .stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #baz-ui .stat-val {
      font-size: 18px;
      font-weight: 700;
      color: #e6edf3;
    }
    #baz-ui .stat-val.green  { color: #00e5a0; }
    #baz-ui .stat-val.orange { color: #fbbf24; }
    #baz-ui .stat-lbl {
      font-size: 10px;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    #baz-ui .open-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #baz-ui .open-count-input {
      width: 56px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 7px;
      color: #e6edf3;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
      padding: 7px;
      outline: none;
      font-family: inherit;
    }
    #baz-ui .open-count-input:focus { border-color: #00e5a0; }
    #baz-ui .btn-open {
      background: linear-gradient(135deg,#f97316,#f59e0b);
      color: #0d1117;
      padding: 8px 16px;
      border: none;
      border-radius: 7px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    #baz-ui .btn-open:hover { filter: brightness(1.1); transform: translateY(-1px); }

    /* CARDS */
    #baz-ui #baz-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #baz-ui .result-card {
      background: #161b22;
      border: 1px solid #21262d;
      border-radius: 10px;
      padding: 12px 14px;
      transition: all 0.15s;
      position: relative;
      overflow: hidden;
    }
    #baz-ui .result-card::before {
      content: '';
      position: absolute;
      right: 0; top: 0; bottom: 0;
      width: 3px;
      border-radius: 0 10px 10px 0;
      background: var(--card-color, #00e5a0);
    }
    #baz-ui .result-card:hover {
      border-color: #30363d;
      background: #1c2128;
      transform: translateX(-2px);
    }
    #baz-ui .result-card.opened {
      opacity: 0.35;
    }

    #baz-ui .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    #baz-ui .card-order {
      font-size: 13px;
      font-weight: 700;
      color: #e6edf3;
      letter-spacing: 0.3px;
    }
    #baz-ui .card-status {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
      background: rgba(255,255,255,0.06);
      color: var(--card-color, #00e5a0);
      border: 1px solid rgba(255,255,255,0.08);
    }

    #baz-ui .card-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 10px;
    }
    #baz-ui .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #baz-ui .info-lbl {
      font-size: 10px;
      color: #484f58;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    #baz-ui .info-val {
      font-size: 12px;
      color: #adbac7;
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
      color: #484f58;
      font-family: monospace;
    }
    #baz-ui .card-open-btn {
      text-decoration: none;
      background: rgba(0,229,160,0.1);
      color: #00e5a0;
      border: 1px solid rgba(0,229,160,0.2);
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.15s;
      font-family: inherit;
    }
    #baz-ui .card-open-btn:hover {
      background: #00e5a0;
      color: #0d1117;
      border-color: #00e5a0;
    }
    #baz-ui .card-opened-lbl {
      font-size: 11px;
      color: #484f58;
    }

    /* EMPTY STATE */
    #baz-ui .empty-state {
      text-align: center;
      padding: 32px 20px;
      color: #484f58;
    }
    #baz-ui .empty-icon { font-size: 32px; margin-bottom: 8px; }
    #baz-ui .empty-text { font-size: 13px; }
  `;
  d.head.appendChild(style);

  // ============================================================
  //  HTML
  // ============================================================
  const ui = d.createElement('div');
  ui.id = 'baz-ui';
  ui.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);';

  ui.innerHTML = `
    <div id="baz-header">
      <div class="hdr-left">
        <div class="hdr-logo">⚡</div>
        <span class="hdr-title">رادار النهدي</span>
        <span class="hdr-ver">V12</span>
      </div>
      <div class="hdr-btns">
        <button class="hdr-btn" id="baz-min" title="تصغير">−</button>
        <button class="hdr-btn" id="baz-close" title="إغلاق">✕</button>
      </div>
    </div>

    <div id="baz-body">

      <div class="search-section">
        <div class="fields-grid">

          <div class="field-group">
            <span class="field-label">رقم الفاتورة</span>
            <div class="field-row">
              <input class="baz-input" id="f-invoice" placeholder="INV-12345">
            </div>
          </div>

          <div class="field-group">
            <span class="field-label">رقم الطلب</span>
            <div class="field-row">
              <span class="field-prefix">ERX</span>
              <input class="baz-input" id="f-order" placeholder="أرقام فقط">
            </div>
          </div>

          <div class="field-group">
            <span class="field-label">اسم الضيف</span>
            <div class="field-row">
              <input class="baz-input" id="f-name" placeholder="اسم العميل">
            </div>
          </div>

          <div class="field-group">
            <span class="field-label">موبايل الضيف</span>
            <div class="field-row">
              <input class="baz-input" id="f-mobile" placeholder="05xxxxxxxx">
            </div>
          </div>

        </div>

        <div class="btn-grid" id="baz-btn-grid">
          <button id="baz-run-ready" class="baz-btn btn-ready">📦 Ready to Pack</button>
          <button id="baz-run-all"   class="baz-btn btn-all">🌐 بحث في الكل</button>
          <button id="baz-cancel"    class="baz-btn btn-cancel">⛔ إلغاء</button>
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
          <button class="btn-open" id="baz-do-open">فتح ▶</button>
        </div>
      </div>

      <div id="baz-cards"></div>

    </div>
  `;
  d.body.appendChild(ui);

  // ============================================================
  //  DRAG
  // ============================================================
  const hdr = d.getElementById('baz-header');
  hdr.addEventListener('mousedown', (e) => {
    if (e.target.closest('.hdr-btn')) return;
    isDragging = true;
    const rect = ui.getBoundingClientRect();
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;
    ui.style.transform = 'none';
  });
  d.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let x = Math.max(0, Math.min(window.innerWidth  - ui.offsetWidth,  e.clientX - dragX));
    let y = Math.max(0, Math.min(window.innerHeight - ui.offsetHeight, e.clientY - dragY));
    ui.style.left = x + 'px';
    ui.style.top  = y + 'px';
  });
  d.addEventListener('mouseup', () => { isDragging = false; });

  // ============================================================
  //  HELPERS
  // ============================================================
  const getQuery = () => ({
    inv:  d.getElementById('f-invoice').value.trim(),
    ord:  d.getElementById('f-order').value.trim(),
    name: d.getElementById('f-name').value.trim(),
    mob:  d.getElementById('f-mobile').value.trim(),
  });
  const getSearchValue = (q) => q.mob || q.inv || q.ord || q.name || '';

  const setLoading = (on) => {
    d.getElementById('baz-spinner').style.display    = on ? 'block' : 'none';
    d.getElementById('baz-run-ready').disabled       = on;
    d.getElementById('baz-run-all').disabled         = on;
    const cancelBtn = d.getElementById('baz-cancel');
    cancelBtn.style.display = on ? 'flex' : 'none';
    const grid = d.getElementById('baz-btn-grid');
    grid.className = on ? 'btn-grid has-cancel' : 'btn-grid';
  };

  const updateOpenPanel = () => {
    const remaining = links.filter(l => !openedLinks.has(l.key));
    d.getElementById('stat-total').textContent  = links.length;
    d.getElementById('stat-opened').textContent = openedLinks.size;
    d.getElementById('stat-remain').textContent = remaining.length;
    const countEl = d.getElementById('baz-open-count');
    countEl.max   = remaining.length;
    countEl.value = Math.min(parseInt(countEl.value) || 10, remaining.length || 1);
  };

  const addCard = (item, info) => {
    const url = BASE_URL
      + `getEZPill_Details?onlineNumber=${encodeURIComponent((item.onlineNumber||'').replace(/ERX/gi,''))}`
      + `&Invoice=${encodeURIComponent(item.Invoice||'')}`
      + `&typee=${encodeURIComponent(item.typee||'')}`
      + `&head_id=${encodeURIComponent(item.head_id||'')}`;

    links.push({ url, key: (item.Invoice||'') + ':' + (item.onlineNumber||'') });

    const card = d.createElement('div');
    card.className = 'result-card';
    card.id = 'card-' + links.length;
    card.style.setProperty('--card-color', info.color);

    card.innerHTML = `
      <div class="card-top">
        <span class="card-order">${esc(item.onlineNumber || '—')}</span>
        <span class="card-status">${esc(info.label)}</span>
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
        <a href="${esc(url)}" target="_blank" class="card-open-btn">فتح ↗</a>
      </div>
    `;
    d.getElementById('baz-cards').appendChild(card);
  };

  // ============================================================
  //  SEARCH
  // ============================================================
  const runSearch = async (statusKeys) => {
    const q           = getQuery();
    const searchValue = getSearchValue(q);
    const st          = d.getElementById('baz-st');
    const cards       = d.getElementById('baz-cards');
    const panel       = d.getElementById('baz-open-panel');

    if (!searchValue) {
      st.innerHTML = '<span class="err">⚠️ أدخل قيمة بحث أولاً</span>';
      return;
    }

    cards.innerHTML        = '';
    panel.style.display    = 'none';
    links                  = [];
    openedLinks            = new Set();
    cancelSearch           = false;

    setLoading(true);

    let count = 0;
    let seen  = new Set();

    for (const status of statusKeys) {
      if (cancelSearch) break;
      const info = STATUSES[status];
      st.innerHTML = `جاري البحث في <b>${info.label}</b>...`;

      try {
        const res  = await fetch(BASE_URL + 'Home/getOrders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status, pageSelected: 1, searchby: searchValue }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        let orders;
        try        { orders = JSON.parse(data.orders_list); }
        catch (_)  { orders = data.orders_list; }

        if (!Array.isArray(orders) || orders.length === 0) continue;

        orders.forEach(item => {
          const key = (item.Invoice||'') + ':' + (item.onlineNumber||'');
          if (seen.has(key)) return;
          seen.add(key);
          count++;
          addCard(item, info);
        });

      } catch (err) {
        st.innerHTML = `<span class="err">❌ خطأ في "${esc(info.label)}"</span>`;
        console.error('[BazRadar]', err);
      }
    }

    setLoading(false);

    if (cancelSearch) {
      st.innerHTML = `<span class="err">⛔ تم الإلغاء</span> — <b>${count}</b> نتيجة`;
    } else if (count > 0) {
      st.innerHTML        = `✅ اكتمل — <b>${count}</b> نتيجة`;
      panel.style.display = 'block';
      updateOpenPanel();
    } else {
      cards.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">لم نجد نتائج لـ "${esc(searchValue)}"</div>
        </div>`;
      st.innerHTML = '';
    }
  };

  // ============================================================
  //  OPEN RESULTS
  // ============================================================
  const openResults = async () => {
    const n         = parseInt(d.getElementById('baz-open-count').value) || 10;
    const remaining = links.filter(l => !openedLinks.has(l.key));
    const st        = d.getElementById('baz-st');

    if (remaining.length === 0) { st.innerHTML = '✅ كل النتائج تم فتحها'; return; }

    const toOpen = remaining.slice(0, n);

    for (let i = 0; i < toOpen.length; i++) {
      st.innerHTML = `🚀 فتح <b>${i + 1}</b> من <b>${toOpen.length}</b>...`;
      window.open(toOpen[i].url, '_blank');
      openedLinks.add(toOpen[i].key);

      // تحديث الكارد
      d.querySelectorAll('.result-card').forEach(card => {
        const btn = card.querySelector('.card-open-btn');
        if (btn && btn.getAttribute('href') === toOpen[i].url) {
          card.classList.add('opened');
          const bottom = card.querySelector('.card-bottom');
          bottom.querySelector('.card-open-btn').outerHTML = `<span class="card-opened-lbl">✓ تم الفتح</span>`;
        }
      });

      await new Promise(r => setTimeout(r, 800));
    }

    updateOpenPanel();
    const left = links.filter(l => !openedLinks.has(l.key)).length;
    st.innerHTML = `✅ فُتح <b>${toOpen.length}</b> — متبقي: <b>${left}</b>`;
  };

  // ============================================================
  //  EVENTS
  // ============================================================
  d.getElementById('baz-min').onclick = () => {
    isMinimized = !isMinimized;
    ui.classList.toggle('minimized', isMinimized);
    d.getElementById('baz-min').innerHTML = isMinimized ? '+' : '−';
  };
  d.getElementById('baz-close').onclick = () => {
    ui.remove();
    d.getElementById('baz-style') && d.getElementById('baz-style').remove();
  };
  d.getElementById('baz-run-ready').onclick = () => runSearch(['readypack']);
  d.getElementById('baz-run-all').onclick   = () => runSearch(['readypack','new','packed','delivered']);
  d.getElementById('baz-cancel').onclick    = () => { cancelSearch = true; };
  d.getElementById('baz-do-open').onclick   = openResults;
  d.querySelectorAll('.baz-input').forEach(el => {
    el.onkeypress = (e) => { if (e.key === 'Enter') runSearch(['readypack']); };
  });

})();

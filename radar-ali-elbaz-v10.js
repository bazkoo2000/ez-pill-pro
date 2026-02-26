/**
 * ============================================================
 *  رادار علي الباز — V11
 *  أداة بحث سريع لنظام EZ Pill الخاص بصيدليات النهدي
 * ============================================================
 *
 *  التغييرات في V11:
 *  - إرسال قيمة البحث مباشرةً للسيرفر عبر حقل searchby
 *  - لا تصفح للصفحات — طلب واحد فقط لكل حالة
 *  - سرعة فائقة مقارنة بالنسخة السابقة
 *  - إضافة زر إلغاء البحث
 *  - حماية XSS عبر دالة esc()
 *
 *  Base URL: https://rtlapps.nahdi.sa/ez_pill_web/
 * ============================================================
 */

javascript: (function () {

  // ============================================================
  //  CONSTANTS
  // ============================================================

  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';

  const STATUSES = {
    readypack: { label: 'Ready to Pack', badge: 'badge-ready'     },
    new:       { label: 'New Orders',    badge: 'badge-new'       },
    packed:    { label: 'Packed',        badge: 'badge-packed'    },
    delivered: { label: 'Delivered',     badge: 'badge-delivered' },
  };

  const TH = {
    bg:              '#f0f4ff',
    card:            '#ffffff',
    border:          '#d0e2ff',
    header:          'linear-gradient(135deg, #1a73e8, #4facfe)',
    headerText:      '#ffffff',
    accent:          '#1a73e8',
    accentLight:     '#e8f0fe',
    btnPrimary:      'linear-gradient(135deg, #34a853, #00c853)',
    btnAll:          'linear-gradient(135deg, #1a73e8, #4facfe)',
    btnOpen:         'linear-gradient(135deg, #ff6d00, #ffab40)',
    btnCancel:       'linear-gradient(135deg, #e53935, #ff5252)',
    text:            '#333333',
    subtext:         '#666666',
    rowHover:        '#f8fbff',
    shadow:          '0 8px 60px rgba(26, 115, 232, 0.18)',
    inputBg:         '#f8fbff',
    statusReady:     { bg: '#e6f4ea', color: '#34a853' },
    statusNew:       { bg: '#fff8e1', color: '#f9a825' },
    statusPacked:    { bg: '#e8f0fe', color: '#1a73e8' },
    statusDelivered: { bg: '#f3e8ff', color: '#7b1fa2' },
  };


  // ============================================================
  //  STATE
  // ============================================================

  const d          = document;
  let links        = [];
  let openedLinks  = new Set();
  let isDragging   = false;
  let dragX        = 0;
  let dragY        = 0;
  let isMinimized  = false;
  let cancelSearch = false;


  // ============================================================
  //  CLEANUP
  // ============================================================

  d.getElementById('baz-ui')    && d.getElementById('baz-ui').remove();
  d.getElementById('baz-style') && d.getElementById('baz-style').remove();


  // ============================================================
  //  XSS PROTECTION
  // ============================================================

  const esc = (s) =>
    (s || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');


  // ============================================================
  //  STYLES
  // ============================================================

  const buildStyles = () => {
    const s    = d.createElement('style');
    s.id       = 'baz-style';
    s.innerHTML = `

      #baz-ui, #baz-ui * { box-sizing: border-box; }

      #baz-ui {
        position:        fixed;
        width:           96%;
        max-width:       1020px;
        background:      ${TH.bg};
        z-index:         999999;
        padding:         0;
        border-radius:   24px;
        direction:       rtl;
        font-family:     'Segoe UI', Tahoma, sans-serif;
        max-height:      90vh;
        overflow:        hidden;
        display:         flex;
        flex-direction:  column;
        border:          1.5px solid ${TH.border};
        box-shadow:      ${TH.shadow};
        transition:      box-shadow 0.3s;
      }

      #baz-ui.minimized            { max-height: unset; }
      #baz-ui.minimized #baz-body  { display: none; }
      #baz-ui.minimized #baz-header{ border-radius: 20px; }

      #baz-ui #baz-header {
        background:      ${TH.header};
        padding:         14px 20px;
        display:         flex;
        justify-content: space-between;
        align-items:     center;
        border-radius:   24px 24px 0 0;
        flex-shrink:     0;
        cursor:          grab;
        user-select:     none;
      }
      #baz-ui #baz-header:active { cursor: grabbing; }

      #baz-ui #baz-header h2 {
        margin:      0;
        color:       ${TH.headerText};
        font-size:   16px;
        letter-spacing: 0.5px;
        display:     flex;
        align-items: center;
        gap:         8px;
      }

      #baz-ui .hdr-btns {
        display:     flex;
        gap:         8px;
        align-items: center;
      }

      #baz-ui .hdr-btn {
        background:      rgba(255,255,255,0.2);
        border:          none;
        color:           #fff;
        width:           30px;
        height:          30px;
        border-radius:   50%;
        cursor:          pointer;
        font-size:       14px;
        font-weight:     bold;
        display:         flex;
        align-items:     center;
        justify-content: center;
        transition:      background 0.2s;
        flex-shrink:     0;
      }
      #baz-ui .hdr-btn:hover { background: rgba(255,255,255,0.4); }

      #baz-ui #baz-body {
        padding:    18px 22px;
        overflow-y: auto;
        flex:       1;
      }

      #baz-ui .search-box {
        background:    ${TH.card};
        padding:       16px;
        border-radius: 16px;
        border:        1.5px solid ${TH.border};
        margin-bottom: 14px;
        box-shadow:    0 2px 12px rgba(0,0,0,0.06);
      }

      #baz-ui .search-grid {
        display:               grid;
        grid-template-columns: 1fr 1fr;
        gap:                   11px;
        margin-bottom:         13px;
      }

      #baz-ui .field-wrap {
        display:        flex;
        flex-direction: column;
        gap:            5px;
      }

      #baz-ui .field-label {
        font-size:   12px;
        font-weight: 700;
        color:       ${TH.accent};
      }

      #baz-ui .field-inner {
        display:     flex;
        gap:         6px;
        align-items: center;
      }

      #baz-ui .prefix {
        background:    ${TH.accentLight};
        color:         ${TH.accent};
        padding:       7px 10px;
        border-radius: 8px;
        font-weight:   bold;
        font-size:     13px;
        white-space:   nowrap;
      }

      #baz-ui .baz-input {
        flex:          1;
        padding:       8px 11px;
        border:        1.5px solid ${TH.border};
        border-radius: 8px;
        font-size:     14px;
        outline:       none;
        transition:    border 0.2s;
        background:    ${TH.inputBg};
        color:         ${TH.text};
      }
      #baz-ui .baz-input:focus {
        border-color: ${TH.accent};
        background:   ${TH.card};
      }

      #baz-ui .btn-row {
        display:               grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap:                   10px;
      }

      #baz-ui .btn {
        padding:         10px;
        border:          none;
        border-radius:   10px;
        cursor:          pointer;
        font-weight:     bold;
        font-size:       13px;
        transition:      all 0.2s;
        display:         flex;
        align-items:     center;
        justify-content: center;
        gap:             6px;
        color:           #fff;
      }
      #baz-ui .btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
      #baz-ui .btn:disabled {
        opacity: 0.5;
        cursor:  not-allowed;
        transform: none;
        filter: none;
      }

      #baz-ui .btn-primary { background: ${TH.btnPrimary}; box-shadow: 0 3px 12px rgba(52,168,83,0.25); }
      #baz-ui .btn-all     { background: ${TH.btnAll};     box-shadow: 0 3px 12px rgba(26,115,232,0.25); }
      #baz-ui .btn-cancel  { background: ${TH.btnCancel};  box-shadow: 0 3px 12px rgba(229,57,53,0.25); display:none; }

      /* ── Status Bar ── */
      #baz-ui #baz-status-bar {
        display:       flex;
        align-items:   center;
        gap:           10px;
        margin:        8px 0;
        min-height:    28px;
      }

      #baz-ui #baz-spinner {
        width:         20px;
        height:        20px;
        border:        3px solid ${TH.accentLight};
        border-top:    3px solid ${TH.accent};
        border-radius: 50%;
        animation:     baz-spin 0.7s linear infinite;
        flex-shrink:   0;
        display:       none;
      }
      @keyframes baz-spin { to { transform: rotate(360deg); } }

      #baz-ui #baz-st {
        font-weight: bold;
        color:       ${TH.accent};
        font-size:   13px;
        flex:        1;
      }

      /* ── Open Panel ── */
      #baz-ui #baz-open-panel {
        background:    ${TH.card};
        border:        1.5px solid ${TH.border};
        border-radius: 14px;
        padding:       14px 16px;
        margin-bottom: 12px;
        display:       none;
      }

      #baz-ui .open-panel-title {
        font-weight:   700;
        color:         ${TH.accent};
        margin-bottom: 10px;
        font-size:     14px;
      }

      #baz-ui .open-panel-body {
        display:     flex;
        gap:         10px;
        align-items: center;
        flex-wrap:   wrap;
      }

      #baz-ui .open-count-input {
        width:         70px;
        padding:       7px;
        border:        1.5px solid ${TH.border};
        border-radius: 8px;
        font-size:     15px;
        text-align:    center;
        background:    ${TH.inputBg};
        color:         ${TH.text};
        outline:       none;
      }
      #baz-ui .open-count-input:focus { border-color: ${TH.accent}; }

      #baz-ui .btn-do-open {
        background:    ${TH.btnOpen};
        color:         #fff;
        padding:       8px 18px;
        border:        none;
        border-radius: 9px;
        font-weight:   bold;
        cursor:        pointer;
        font-size:     13px;
        transition:    all 0.2s;
      }
      #baz-ui .btn-do-open:hover { filter: brightness(1.1); transform: translateY(-1px); }

      #baz-ui .open-info {
        font-size:  12px;
        color:      ${TH.subtext};
        flex:       1;
        min-width:  150px;
      }

      /* ── Results Table ── */
      #baz-ui #baz-table-wrap {
        overflow-x:    auto;
        border-radius: 12px;
        box-shadow:    0 2px 10px rgba(0,0,0,0.08);
      }

      #baz-ui #baz-table {
        width:           100%;
        border-collapse: collapse;
        background:      ${TH.card};
        border-radius:   12px;
        overflow:        hidden;
      }

      #baz-ui #baz-table th {
        background:    ${TH.accentLight};
        color:         ${TH.accent};
        padding:       11px 9px;
        font-size:     12px;
        border-bottom: 2px solid ${TH.border};
        position:      sticky;
        top:           0;
      }

      #baz-ui #baz-table td {
        padding:       9px;
        border-bottom: 1px solid ${TH.border};
        text-align:    center;
        font-size:     13px;
        color:         ${TH.text};
      }

      #baz-ui #baz-table tr:hover td { background: ${TH.rowHover}; }

      #baz-ui .status-badge {
        display:       inline-block;
        padding:       3px 9px;
        border-radius: 20px;
        font-size:     11px;
        font-weight:   bold;
      }

      #baz-ui .badge-ready     { background: ${TH.statusReady.bg};     color: ${TH.statusReady.color};     }
      #baz-ui .badge-new       { background: ${TH.statusNew.bg};       color: ${TH.statusNew.color};       }
      #baz-ui .badge-packed    { background: ${TH.statusPacked.bg};    color: ${TH.statusPacked.color};    }
      #baz-ui .badge-delivered { background: ${TH.statusDelivered.bg}; color: ${TH.statusDelivered.color}; }

      #baz-ui .open-link {
        color:           ${TH.accent};
        font-weight:     bold;
        text-decoration: none;
        padding:         3px 9px;
        background:      ${TH.accentLight};
        border-radius:   6px;
        transition:      all 0.2s;
        font-size:       12px;
      }
      #baz-ui .open-link:hover { background: ${TH.accent}; color: #fff; }

      #baz-ui .opened-row td   { opacity: 0.4; }
      #baz-ui .opened-mark     { color: #aaa; font-size: 11px; }

      /* ── Search mode hint ── */
      #baz-ui .search-hint {
        font-size:     11px;
        color:         ${TH.subtext};
        margin-bottom: 10px;
        padding:       7px 12px;
        background:    ${TH.accentLight};
        border-radius: 8px;
        border-right:  3px solid ${TH.accent};
      }
    `;
    d.head.appendChild(s);
  };


  // ============================================================
  //  HTML
  // ============================================================

  const buildUI = () => {
    const ui      = d.createElement('div');
    ui.id         = 'baz-ui';
    ui.style.cssText = 'top:50%; left:50%; transform:translate(-50%,-50%);';

    ui.innerHTML = `

      <div id="baz-header">
        <h2>⚡ رادار النهدي <span style="opacity:0.6; font-size:13px">V11 — بحث سريع</span></h2>
        <div class="hdr-btns">
          <button class="hdr-btn" id="baz-min"   title="تصغير">﹣</button>
          <button class="hdr-btn" id="baz-close" title="إغلاق">✕</button>
        </div>
      </div>

      <div id="baz-body">

        <div class="search-box">

          <div class="search-hint">
            💡 <b>بحث سريع:</b> أدخل قيمة واحدة فقط — رقم الموبايل أو رقم الطلب أو رقم الفاتورة أو اسم الضيف، وسيُرسَل مباشرةً للسيرفر بدون تصفح صفحات
          </div>

          <div class="search-grid">

            <div class="field-wrap">
              <span class="field-label">📋 رقم الفاتورة</span>
              <div class="field-inner">
                <input class="baz-input" id="f-invoice" placeholder="INV-12345" aria-label="رقم الفاتورة">
              </div>
            </div>

            <div class="field-wrap">
              <span class="field-label">🔢 رقم الطلب</span>
              <div class="field-inner">
                <span class="prefix">ERX</span>
                <input class="baz-input" id="f-order" placeholder="أرقام فقط..." aria-label="رقم الطلب">
              </div>
            </div>

            <div class="field-wrap">
              <span class="field-label">👤 اسم الضيف</span>
              <div class="field-inner">
                <input class="baz-input" id="f-name" placeholder="اسم العميل..." aria-label="اسم الضيف">
              </div>
            </div>

            <div class="field-wrap">
              <span class="field-label">📱 موبايل الضيف</span>
              <div class="field-inner">
                <input class="baz-input" id="f-mobile" placeholder="05xxxxxxxx" aria-label="موبايل الضيف">
              </div>
            </div>

          </div>

          <div class="btn-row">
            <button id="baz-run-ready" class="btn btn-primary">📦 Ready to Pack</button>
            <button id="baz-run-all"   class="btn btn-all">🌐 بحث في الكل</button>
            <button id="baz-cancel"    class="btn btn-cancel">⛔ إلغاء</button>
          </div>
        </div>

        <div id="baz-status-bar">
          <div id="baz-spinner"></div>
          <div id="baz-st"></div>
        </div>

        <div id="baz-open-panel">
          <div class="open-panel-title">🔓 فتح النتائج</div>
          <div class="open-panel-body">
            <div class="open-info" id="baz-open-info">جاهز للفتح</div>
            <input class="open-count-input" id="baz-open-count" type="number" min="1" value="10">
            <button class="btn-do-open" id="baz-do-open">فتح ▶</button>
          </div>
        </div>

        <div id="baz-res"></div>

      </div>
    `;

    d.body.appendChild(ui);
    return ui;
  };


  // ============================================================
  //  DRAG
  // ============================================================

  const initDrag = (ui) => {
    const hdr = d.getElementById('baz-header');

    hdr.addEventListener('mousedown', (e) => {
      if (e.target.closest('.hdr-btn')) return;
      isDragging = true;
      const rect = ui.getBoundingClientRect();
      dragX = e.clientX - rect.left;
      dragY = e.clientY - rect.top;
      ui.style.transform = 'none';
      ui.style.transition = 'none';
    });

    d.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let x = e.clientX - dragX;
      let y = e.clientY - dragY;
      x = Math.max(0, Math.min(window.innerWidth  - ui.offsetWidth,  x));
      y = Math.max(0, Math.min(window.innerHeight - ui.offsetHeight, y));
      ui.style.left = x + 'px';
      ui.style.top  = y + 'px';
    });

    d.addEventListener('mouseup', () => { isDragging = false; });
  };


  // ============================================================
  //  HELPERS
  // ============================================================

  const getQuery = () => ({
    inv:  d.getElementById('f-invoice').value.trim(),
    ord:  d.getElementById('f-order').value.trim(),
    name: d.getElementById('f-name').value.trim(),
    mob:  d.getElementById('f-mobile').value.trim(),
  });

  // أولوية قيمة البحث المرسلة للسيرفر
  const getSearchValue = (q) => q.mob || q.inv || q.ord || q.name || '';

  const setLoading = (on) => {
    d.getElementById('baz-spinner').style.display      = on ? 'block' : 'none';
    d.getElementById('baz-run-ready').disabled         = on;
    d.getElementById('baz-run-all').disabled           = on;
    d.getElementById('baz-cancel').style.display       = on ? 'flex'  : 'none';
  };

  const buildTableIfNeeded = (rs) => {
    if (d.getElementById('baz-table')) return;
    rs.innerHTML = `
      <div id="baz-table-wrap">
        <table id="baz-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>اسم الضيف</th>
              <th>موبايل</th>
              <th>الفاتورة</th>
              <th>الحالة</th>
              <th>فتح</th>
            </tr>
          </thead>
          <tbody id="baz-tb"></tbody>
        </table>
      </div>
    `;
  };

  const addResultRow = (item, info, count) => {
    const url = BASE_URL
      + `getEZPill_Details?onlineNumber=${encodeURIComponent((item.onlineNumber || '').replace(/ERX/gi, ''))}`
      + `&Invoice=${encodeURIComponent(item.Invoice || '')}`
      + `&typee=${encodeURIComponent(item.typee || '')}`
      + `&head_id=${encodeURIComponent(item.head_id || '')}`;

    links.push({ url, key: (item.Invoice || '') + ':' + (item.onlineNumber || '') });

    const row    = d.getElementById('baz-tb').insertRow(-1);
    row.id       = 'baz-row-' + count;
    row.innerHTML = `
      <td><b>${esc(item.onlineNumber)}</b></td>
      <td>${esc(item.guestName)}</td>
      <td>${esc(item.guestMobile || item.mobile || '—')}</td>
      <td>${esc(item.Invoice)}</td>
      <td><span class="status-badge ${info.badge}">${esc(info.label)}</span></td>
      <td><a href="${esc(url)}" target="_blank" class="open-link">فتح ✅</a></td>
    `;
  };

  const updateOpenPanel = () => {
    const remaining = links.filter(l => !openedLinks.has(l.key));
    const infoEl    = d.getElementById('baz-open-info');
    const countEl   = d.getElementById('baz-open-count');
    if (infoEl) {
      infoEl.innerHTML =
        `إجمالي: <b>${links.length}</b> &nbsp;|&nbsp; `
        + `مفتوحة: <b style="color:#34a853">${openedLinks.size}</b> &nbsp;|&nbsp; `
        + `متبقية: <b style="color:#ff6d00">${remaining.length}</b>`;
    }
    if (countEl) {
      countEl.max   = remaining.length;
      countEl.value = Math.min(parseInt(countEl.value) || 10, remaining.length || 1);
    }
  };


  // ============================================================
  //  MAIN SEARCH — بحث سريع بدون تصفح صفحات
  // ============================================================

  const runSearch = async (statusKeys) => {
    const q           = getQuery();
    const searchValue = getSearchValue(q);

    if (!searchValue) {
      d.getElementById('baz-st').innerHTML = '⚠️ أدخل قيمة بحث أولاً';
      return;
    }

    const st    = d.getElementById('baz-st');
    const rs    = d.getElementById('baz-res');
    const panel = d.getElementById('baz-open-panel');

    // Reset
    rs.innerHTML        = '';
    panel.style.display = 'none';
    links               = [];
    openedLinks         = new Set();
    cancelSearch        = false;

    setLoading(true);

    let count = 0;
    let seen  = new Set();

    for (const status of statusKeys) {

      if (cancelSearch) break;

      const info = STATUSES[status];
      st.innerHTML = `📡 يبحث في "${info.label}"...`;

      try {
        const res  = await fetch(BASE_URL + 'Home/getOrders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            status,
            pageSelected: 1,
            searchby: searchValue,     // ← إرسال قيمة البحث مباشرةً للسيرفر
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        let orders;
        try        { orders = JSON.parse(data.orders_list); }
        catch (_e) { orders = data.orders_list; }

        if (!Array.isArray(orders) || orders.length === 0) continue;

        orders.forEach(item => {
          const key = (item.Invoice || '') + ':' + (item.onlineNumber || '');
          if (seen.has(key)) return;
          seen.add(key);
          count++;
          buildTableIfNeeded(rs);
          addResultRow(item, info, count);
        });

      } catch (err) {
        st.innerHTML = `❌ خطأ في الاتصال بـ "${info.label}": ${esc(err.message)}`;
        console.error('[BazRadar]', err);
      }
    }

    setLoading(false);

    if (cancelSearch) {
      st.innerHTML = `⛔ تم إلغاء البحث — ${count} نتيجة حتى الآن`;
    } else if (count > 0) {
      st.innerHTML        = `✅ اكتمل البحث — <b>${count}</b> نتيجة`;
      panel.style.display = 'block';
      updateOpenPanel();
    } else {
      st.innerHTML = `❌ لم نجد نتائج لـ "<b>${esc(searchValue)}</b>"`;
    }
  };


  // ============================================================
  //  OPEN RESULTS
  // ============================================================

  const openResults = async () => {
    const n         = parseInt(d.getElementById('baz-open-count').value) || 10;
    const remaining = links.filter(l => !openedLinks.has(l.key));
    const st        = d.getElementById('baz-st');

    if (remaining.length === 0) {
      st.innerHTML = '✅ كل النتائج تم فتحها';
      return;
    }

    const toOpen = remaining.slice(0, n);

    for (let i = 0; i < toOpen.length; i++) {
      st.innerHTML = `🚀 فتح (${i + 1} من ${toOpen.length})...`;
      window.open(toOpen[i].url, '_blank');
      openedLinks.add(toOpen[i].key);

      d.querySelectorAll('#baz-tb tr').forEach(row => {
        const link = row.querySelector('.open-link');
        if (link && link.getAttribute('href') === toOpen[i].url) {
          row.classList.add('opened-row');
          row.querySelector('td:last-child').innerHTML = '<span class="opened-mark">✓ تم الفتح</span>';
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    updateOpenPanel();
    const leftCount = links.filter(l => !openedLinks.has(l.key)).length;
    st.innerHTML = `✅ تم فتح ${toOpen.length} صفحة — متبقي: ${leftCount}`;
  };


  // ============================================================
  //  INIT
  // ============================================================

  buildStyles();
  const ui = buildUI();
  initDrag(ui);

  d.getElementById('baz-min').onclick = () => {
    isMinimized = !isMinimized;
    ui.classList.toggle('minimized', isMinimized);
    d.getElementById('baz-min').innerHTML = isMinimized ? '▲' : '﹣';
    d.getElementById('baz-min').title     = isMinimized ? 'توسيع' : 'تصغير';
  };

  d.getElementById('baz-close').onclick = () => {
    ui.remove();
    d.getElementById('baz-style') && d.getElementById('baz-style').remove();
  };

  d.getElementById('baz-run-ready').onclick = () => runSearch(['readypack']);
  d.getElementById('baz-run-all').onclick   = () => runSearch(['readypack', 'new', 'packed', 'delivered']);
  d.getElementById('baz-cancel').onclick    = () => { cancelSearch = true; };
  d.getElementById('baz-do-open').onclick   = openResults;

  d.querySelectorAll('.baz-input').forEach(el => {
    el.onkeypress = (e) => { if (e.key === 'Enter') runSearch(['readypack']); };
  });

})();

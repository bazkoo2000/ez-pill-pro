javascript:(function () {
  /* ═══════════════════════════════════════════════════════
   *  رادار علي الباز V10.0 — النسخة المطورة
   *  التحسينات:
   *    ✅ أمان: XSS protection + safe JSON parsing
   *    ✅ أداء: AbortController + timeout + cancel
   *    ✅ قراءة: أسماء واضحة + تنظيم + تعليقات
   *    ✅ موبايل: تصميم متجاوب بالكامل
   * ═══════════════════════════════════════════════════════ */

  // ─── إزالة النسخة القديمة لو موجودة ───
  const existingUI = document.getElementById('radar-ui');
  if (existingUI) existingUI.remove();

  // ─── متغيرات عامة ───
  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const READY_STATUSES = ['readypack'];
  const ALL_STATUSES = ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];
  const MAX_PAGES_FULL_SCAN = 25;
  const FETCH_TIMEOUT_MS = 15000;
  const TAB_OPEN_DELAY_MS = 1000;

  let collectedLinks = [];
  let currentAbortController = null;
  let isSearching = false;

  // ─── حقن الأنماط (CSS) ───
  const styleElement = document.createElement('style');
  styleElement.id = 'radar-styles';
  styleElement.textContent = `
    /* ── الحاوية الرئيسية ── */
    #radar-ui {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 95%; max-width: 900px;
      background: #fff; z-index: 999999;
      padding: 20px 22px; border-radius: 18px;
      box-shadow: 0 8px 50px rgba(0,0,0,0.35);
      direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;
      max-height: 90vh; overflow: auto;
      border-top: 6px solid #1a73e8;
      opacity: 0;
      animation: radarFadeIn 0.3s ease forwards;
      box-sizing: border-box;
    }
    @keyframes radarFadeIn {
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    /* ── الهيدر ── */
    #radar-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
    }
    #radar-header h2 {
      margin: 0; font-size: 18px; color: #1a73e8;
    }
    .radar-header-actions {
      display: flex; gap: 6px;
    }

    /* ── منطقة البحث ── */
    .radar-search-area {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      background: #f8f9fa; padding: 18px;
      border-radius: 14px; border: 1px solid #e8eaed;
    }
    .radar-field-group {
      display: flex; flex-direction: column; gap: 5px;
    }
    .radar-field-group label {
      font-weight: 600; color: #1a73e8; font-size: 13px;
    }
    .radar-input-row {
      display: flex; gap: 5px;
    }
    .radar-prefix {
      background: #1a73e8; color: #fff;
      padding: 9px 12px; border-radius: 8px;
      font-weight: bold; font-size: 14px;
      display: flex; align-items: center;
      min-width: 40px; justify-content: center;
      user-select: none;
    }
    .radar-input {
      flex: 1; padding: 9px 12px;
      border: 2px solid #ddd; border-radius: 8px;
      font-size: 15px; outline: none;
      transition: border-color 0.2s;
      min-width: 0;
    }
    .radar-input:focus {
      border-color: #1a73e8;
    }

    /* ── خيارات البحث ── */
    .radar-options {
      grid-column: span 2;
      display: flex; justify-content: center;
      gap: 24px; margin-top: 6px; padding: 10px 8px;
      background: #fff; border-radius: 10px;
      border: 1px dashed #1a73e8;
      flex-wrap: wrap;
    }
    .radar-options label {
      cursor: pointer; font-weight: 600; color: #444;
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; white-space: nowrap;
    }

    /* ── الأزرار ── */
    .radar-btn {
      padding: 11px 16px; border: none; border-radius: 10px;
      cursor: pointer; font-weight: bold; font-size: 14px;
      transition: opacity 0.2s, transform 0.1s;
    }
    .radar-btn:hover { opacity: 0.9; }
    .radar-btn:active { transform: scale(0.97); }
    .radar-btn-start {
      background: #34a853; color: #fff;
      grid-column: span 2; margin-top: 4px;
    }
    .radar-btn-cancel {
      background: #f44336; color: #fff;
      grid-column: span 2; margin-top: 4px;
      display: none;
    }
    .radar-btn-close {
      background: #f44336; color: #fff;
      font-size: 16px; padding: 6px 12px;
      border-radius: 8px;
    }
    .radar-btn-minimize {
      background: #ff9800; color: #fff;
      font-size: 16px; padding: 6px 12px;
      border-radius: 8px;
    }
    .radar-btn-open-all {
      background: #1a73e8; color: #fff;
      width: 100%; display: none; margin-bottom: 10px;
    }
    .radar-btn-export {
      background: #ff9800; color: #fff;
      width: 100%; display: none; margin-bottom: 10px;
    }

    /* ── شريط التقدم ── */
    .radar-progress-wrapper {
      width: 100%; background: #eee;
      border-radius: 10px; height: 10px;
      margin: 12px 0; display: none;
      overflow: hidden;
    }
    .radar-progress-bar {
      width: 0%; height: 100%;
      background: linear-gradient(90deg, #34a853, #1a73e8);
      border-radius: 10px;
      transition: width 0.25s ease;
    }

    /* ── حالة البحث ── */
    .radar-status {
      text-align: center; margin: 8px 0;
      font-weight: 600; color: #1a73e8;
      font-size: 14px; min-height: 20px;
    }

    /* ── جدول النتائج ── */
    #radar-table {
      width: 100%; border-collapse: collapse; margin-top: 14px;
    }
    #radar-table th {
      background: #f1f3f4; color: #1a73e8;
      padding: 10px 8px; font-size: 13px;
      border-bottom: 2px solid #1a73e8;
      position: sticky; top: 0; z-index: 1;
    }
    #radar-table td {
      padding: 9px 8px; border-bottom: 1px solid #eee;
      text-align: center; font-size: 13px;
    }
    #radar-table tr:hover td {
      background: #f0f7ff;
    }
    .radar-badge {
      padding: 3px 8px; border-radius: 12px;
      font-size: 11px; font-weight: bold;
      background: #e3f2fd; color: #1565c0;
      display: inline-block;
    }
    .radar-link {
      color: #34a853; font-weight: bold;
      text-decoration: none;
    }
    .radar-link:hover { text-decoration: underline; }

    /* ── عداد النتائج ── */
    .radar-counter {
      text-align: center; padding: 6px;
      font-size: 12px; color: #666;
      margin-top: 4px;
    }

    /* ═══ الموبايل ═══ */
    @media (max-width: 640px) {
      #radar-ui {
        width: 98%; padding: 14px 12px;
        border-radius: 14px; max-height: 95vh;
        top: 2%; left: 50%;
        transform: translateX(-50%) scale(0.97);
      }
      @keyframes radarFadeIn {
        to { opacity: 1; transform: translateX(-50%) scale(1); }
      }
      #radar-header h2 { font-size: 15px; }
      .radar-search-area {
        grid-template-columns: 1fr;
        padding: 12px; gap: 10px;
      }
      .radar-options {
        grid-column: span 1;
        flex-direction: column; gap: 10px;
        align-items: flex-start;
      }
      .radar-btn-start,
      .radar-btn-cancel {
        grid-column: span 1;
      }
      #radar-table th, #radar-table td {
        padding: 7px 4px; font-size: 11px;
      }
      .radar-prefix { padding: 8px 8px; min-width: 32px; font-size: 12px; }
      .radar-input { padding: 8px 10px; font-size: 14px; }
    }
  `;
  document.head.appendChild(styleElement);

  // ─── بناء الواجهة (HTML) ───
  const uiContainer = document.createElement('div');
  uiContainer.id = 'radar-ui';
  uiContainer.innerHTML = buildUIMarkup();
  document.body.appendChild(uiContainer);

  // ─── ربط الأحداث ───
  bindEvents();

  /* ═══════════════════════════════════════════════════════
   *  الدوال المساعدة
   * ═══════════════════════════════════════════════════════ */

  /** بناء HTML الواجهة */
  function buildUIMarkup() {
    return `
      <div id="radar-header">
        <h2>🚀 رادار علي الباز V10.0 — المطور</h2>
        <div class="radar-header-actions">
          <button class="radar-btn radar-btn-minimize" id="radar-minimize" title="تصغير">—</button>
          <button class="radar-btn radar-btn-close" id="radar-close" title="إغلاق">✕</button>
        </div>
      </div>
      <div id="radar-body">
        <div class="radar-search-area">
          <div class="radar-field-group">
            <label>الفاتورة / الصيدلية:</label>
            <div class="radar-input-row">
              <span class="radar-prefix">0</span>
              <input type="text" class="radar-input" id="radar-store" placeholder="كود الصيدلية أو رقم الفاتورة..." autocomplete="off">
            </div>
          </div>
          <div class="radar-field-group">
            <label>رقم الطلب:</label>
            <div class="radar-input-row">
              <span class="radar-prefix">ERX</span>
              <input type="text" class="radar-input" id="radar-order" placeholder="الأرقام فقط..." autocomplete="off">
            </div>
          </div>
          <div class="radar-options">
            <label><input type="radio" name="radar-mode" value="ready" checked> فقط Ready to Pack ⚡</label>
            <label><input type="radio" name="radar-mode" value="all"> بحث شامل كافة الحالات 🔎</label>
          </div>
          <button class="radar-btn radar-btn-start" id="radar-start">بدء المسح الذكي 📡</button>
          <button class="radar-btn radar-btn-cancel" id="radar-cancel">⏹ إيقاف البحث</button>
        </div>
        <div class="radar-progress-wrapper" id="radar-progress-wrap">
          <div class="radar-progress-bar" id="radar-progress-bar"></div>
        </div>
        <div class="radar-status" id="radar-status"></div>
        <button class="radar-btn radar-btn-export" id="radar-export">📥 تصدير النتائج (CSV)</button>
        <button class="radar-btn radar-btn-open-all" id="radar-open-all">🔓 فتح كافة النتائج المكتشفة</button>
        <div id="radar-results"></div>
      </div>
    `;
  }

  /** ربط جميع الأحداث */
  function bindEvents() {
    // إغلاق
    document.getElementById('radar-close').addEventListener('click', function () {
      const ui = document.getElementById('radar-ui');
      if (cancelCurrentSearch()) { /* أوقف أي بحث شغال */ }
      ui.style.animation = 'none';
      ui.style.opacity = '0';
      ui.style.transform += ' scale(0.95)';
      setTimeout(function () { ui.remove(); }, 200);
    });

    // تصغير / تكبير
    document.getElementById('radar-minimize').addEventListener('click', function () {
      const body = document.getElementById('radar-body');
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? '' : 'none';
      this.textContent = isHidden ? '—' : '+';
      this.title = isHidden ? 'تصغير' : 'تكبير';
    });

    // بدء البحث
    document.getElementById('radar-start').addEventListener('click', startSearch);

    // إيقاف البحث
    document.getElementById('radar-cancel').addEventListener('click', cancelCurrentSearch);

    // بحث بالـ Enter
    document.querySelectorAll('.radar-input').forEach(function (input) {
      input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') startSearch();
      });
    });

    // فتح كل النتائج
    document.getElementById('radar-open-all').addEventListener('click', openAllResults);

    // تصدير CSV
    document.getElementById('radar-export').addEventListener('click', exportResultsCSV);
  }

  /** إلغاء البحث الحالي */
  function cancelCurrentSearch() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    if (isSearching) {
      isSearching = false;
      updateSearchUI(false);
      setStatus('⏹ تم إيقاف البحث');
      return true;
    }
    return false;
  }

  /** تحديث حالة أزرار البحث */
  function updateSearchUI(searching) {
    const startBtn = document.getElementById('radar-start');
    const cancelBtn = document.getElementById('radar-cancel');
    const progressWrap = document.getElementById('radar-progress-wrap');

    startBtn.style.display = searching ? 'none' : '';
    cancelBtn.style.display = searching ? '' : 'none';
    progressWrap.style.display = searching ? 'block' : 'none';
  }

  /** تحديث نص الحالة (آمن من XSS) */
  function setStatus(text) {
    document.getElementById('radar-status').textContent = text;
  }

  /** تحديث شريط التقدم */
  function setProgress(percent) {
    document.getElementById('radar-progress-bar').style.width = Math.min(percent, 100) + '%';
  }

  /** Fetch آمن مع timeout و abort */
  async function safeFetch(url, options, abortSignal) {
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

    // دمج الـ abort signal الخارجي
    if (abortSignal) {
      abortSignal.addEventListener('abort', function () { controller.abort(); });
    }

    try {
      const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /** تحليل JSON بأمان */
  function safeParseJSON(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') return [];
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('[Radar] فشل تحليل JSON:', e.message);
      return [];
    }
  }

  /** تنظيف النص من أي HTML (حماية XSS) */
  function sanitize(text) {
    if (text === null || text === undefined) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /** بناء رابط تفاصيل الطلب */
  function buildOrderURL(order) {
    var orderNum = String(order.onlineNumber || '').replace(/ERX/gi, '');
    return BASE_URL + 'getEZPill_Details'
      + '?onlineNumber=' + encodeURIComponent(orderNum)
      + '&Invoice=' + encodeURIComponent(order.Invoice || '')
      + '&typee=' + encodeURIComponent(order.typee || '')
      + '&head_id=' + encodeURIComponent(order.head_id || '');
  }

  /** ═══ دالة البحث الرئيسية ═══ */
  async function startSearch() {
    if (isSearching) return;

    var storeValue = document.getElementById('radar-store').value.trim();
    var orderValue = document.getElementById('radar-order').value.trim();

    if (!storeValue && !orderValue) {
      setStatus('⚠️ أدخل كود الصيدلية أو رقم الطلب');
      return;
    }

    var searchMode = document.querySelector('input[name="radar-mode"]:checked').value;
    var searchQuery = orderValue ? 'ERX' + orderValue : '0' + storeValue;
    var statuses = searchMode === 'ready' ? READY_STATUSES : ALL_STATUSES;

    // تجهيز الحالة
    isSearching = true;
    collectedLinks = [];
    currentAbortController = new AbortController();
    var abortSignal = currentAbortController.signal;

    var resultsContainer = document.getElementById('radar-results');
    resultsContainer.innerHTML = '';
    document.getElementById('radar-open-all').style.display = 'none';
    document.getElementById('radar-export').style.display = 'none';
    updateSearchUI(true);
    setProgress(0);

    var resultsCount = 0;
    var seenInvoices = new Set();
    var allMatchedOrders = [];

    try {
      var totalSteps = statuses.length;

      for (var statusIdx = 0; statusIdx < statuses.length; statusIdx++) {
        if (!isSearching) break;

        var currentStatus = statuses[statusIdx];
        setStatus('📡 جاري فحص حالة [' + currentStatus + ']...');

        // جلب الصفحة الأولى لمعرفة إجمالي الصفحات
        var firstPageData = await safeFetch(
          BASE_URL + 'Home/getOrders',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' })
          },
          abortSignal
        );

        var totalOrders = firstPageData.total_orders || 0;
        var totalPages = Math.ceil(totalOrders / 10) || 1;
        if (searchMode === 'all') totalPages = Math.min(totalPages, MAX_PAGES_FULL_SCAN);

        for (var page = 1; page <= totalPages; page++) {
          if (!isSearching) break;

          // حساب التقدم الكلي
          var overallProgress = ((statusIdx / totalSteps) + (page / totalPages / totalSteps)) * 100;
          setProgress(overallProgress);
          setStatus('🔍 فحص [' + currentStatus + '] صفحة ' + page + '/' + totalPages + ' — وُجد: ' + resultsCount);

          var pageData;
          if (page === 1) {
            pageData = firstPageData; // استخدم البيانات المحملة مسبقاً
          } else {
            pageData = await safeFetch(
              BASE_URL + 'Home/getOrders',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus, pageSelected: page, searchby: '' })
              },
              abortSignal
            );
          }

          var ordersList = safeParseJSON(pageData.orders_list);
          if (!ordersList || ordersList.length === 0) break;

          // فلترة النتائج المطابقة
          var matchedOrders = ordersList.filter(function (order) {
            var invoice = String(order.Invoice || '');
            var onlineNum = String(order.onlineNumber || '');
            return invoice.includes(searchQuery) || onlineNum.includes(searchQuery);
          });

          if (matchedOrders.length > 0) {
            ensureTableExists(resultsContainer);

            matchedOrders.forEach(function (order) {
              var invoiceKey = String(order.Invoice || '');
              if (seenInvoices.has(invoiceKey)) return;
              seenInvoices.add(invoiceKey);

              resultsCount++;
              var orderURL = buildOrderURL(order);
              collectedLinks.push(orderURL);
              allMatchedOrders.push(order);
              appendOrderRow(order, orderURL, resultsCount);
            });
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus('⏹ تم إيقاف البحث — وُجد: ' + resultsCount);
      } else {
        console.error('[Radar] خطأ:', error);
        setStatus('❌ خطأ في الاتصال: ' + sanitize(error.message));
      }
    }

    // انتهاء البحث
    isSearching = false;
    updateSearchUI(false);
    setProgress(100);

    if (resultsCount > 0) {
      setStatus('✅ تم بنجاح! وُجد (' + resultsCount + ') نتيجة لـ "' + sanitize(searchQuery) + '"');
      document.getElementById('radar-open-all').style.display = 'block';
      document.getElementById('radar-export').style.display = 'block';
    } else if (isSearching !== false) {
      setStatus('❌ لم نجد نتائج لـ "' + sanitize(searchQuery) + '" في الحالات المختارة');
    }
  }

  /** إنشاء الجدول لو مش موجود */
  function ensureTableExists(container) {
    if (document.getElementById('radar-table')) return;
    var table = document.createElement('table');
    table.id = 'radar-table';
    table.innerHTML = '<thead><tr>'
      + '<th>#</th>'
      + '<th>الطلب</th>'
      + '<th>العميل</th>'
      + '<th>الفاتورة</th>'
      + '<th>الحالة</th>'
      + '<th>فتح</th>'
      + '</tr></thead><tbody id="radar-tbody"></tbody>';
    container.appendChild(table);
  }

  /** إضافة صف في جدول النتائج (آمن من XSS) */
  function appendOrderRow(order, url, index) {
    var tbody = document.getElementById('radar-tbody');
    if (!tbody) return;
    var row = tbody.insertRow(-1);

    var cellIndex = row.insertCell(0);
    cellIndex.textContent = index;

    var cellOrder = row.insertCell(1);
    var boldOrder = document.createElement('b');
    boldOrder.textContent = order.onlineNumber || '—';
    cellOrder.appendChild(boldOrder);

    var cellName = row.insertCell(2);
    cellName.textContent = order.guestName || '—';

    var cellInvoice = row.insertCell(3);
    cellInvoice.textContent = order.Invoice || '—';

    var cellStatus = row.insertCell(4);
    var badge = document.createElement('span');
    badge.className = 'radar-badge';
    badge.textContent = order.status || '—';
    cellStatus.appendChild(badge);

    var cellAction = row.insertCell(5);
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'radar-link';
    link.textContent = 'فتح ✅';
    cellAction.appendChild(link);
  }

  /** فتح جميع النتائج في تابات */
  async function openAllResults() {
    if (collectedLinks.length === 0) return;
    if (!confirm('فتح ' + collectedLinks.length + ' تاب بتتابع ثانية؟')) return;

    for (var i = 0; i < collectedLinks.length; i++) {
      setStatus('🚀 فتح (' + (i + 1) + ' من ' + collectedLinks.length + ')...');
      window.open(collectedLinks[i], '_blank');
      await new Promise(function (resolve) { setTimeout(resolve, TAB_OPEN_DELAY_MS); });
    }
    setStatus('✅ تم فتح ' + collectedLinks.length + ' تاب');
  }

  /** تصدير النتائج كـ CSV */
  function exportResultsCSV() {
    var table = document.getElementById('radar-table');
    if (!table) return;

    var rows = table.querySelectorAll('tr');
    var csvLines = [];

    rows.forEach(function (row) {
      var cols = row.querySelectorAll('th, td');
      var rowData = [];
      cols.forEach(function (col) {
        // تنظيف النص واستبدال الفواصل
        var text = (col.textContent || '').replace(/,/g, ' ').replace(/\n/g, ' ').trim();
        rowData.push(text);
      });
      csvLines.push(rowData.join(','));
    });

    var csvContent = '\uFEFF' + csvLines.join('\n'); // BOM for Arabic support
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'radar_results_' + new Date().toISOString().slice(0, 10) + '.csv';
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);

    setStatus('📥 تم تحميل ملف CSV');
  }

})();

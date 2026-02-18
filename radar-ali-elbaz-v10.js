(function () {
  const d = document;
  const base = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const LS_KEY = 'bazRadarLastSearch';

  // إزالة واجهة قديمة
  const old = d.getElementById('baz-ui');
  if (old) old.remove();

  // ========== STYLE ==========
  const s = d.createElement('style');
  s.innerHTML = `
  #baz-ui{
    position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
    z-index:999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    direction:rtl;background:rgba(0,0,0,0.25);backdrop-filter:blur(6px);
  }
  #baz-ui .baz-window{
    width:95%;max-width:900px;max-height:85vh;overflow:auto;
    background:rgba(255,255,255,0.93);
    border-radius:18px;
    box-shadow:0 18px 45px rgba(0,0,0,0.35);
    border:1px solid rgba(255,255,255,0.7);
  }
  #baz-header{
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 18px;
    border-bottom:1px solid #e0e0e0;
    background:linear-gradient(120deg,#f3f4f6,#e7f0ff);
    border-radius:18px 18px 0 0;
  }
  #baz-header h2{
    margin:0;font-size:18px;color:#1f2933;
  }
  #baz-header .title-sub{
    display:block;font-size:11px;color:#6b7280;font-weight:400;
  }
  #baz-header .btn-close{
    width:30px;height:30px;border-radius:999px;border:none;
    background:#f87171;color:#fff;font-weight:bold;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 1px rgba(0,0,0,0.05);
  }
  #baz-header .btn-close:hover{background:#ef4444;}
  .baz-body{padding:16px 18px 16px;}
  .search-container{
    display:grid;grid-template-columns:1fr 1fr;gap:15px;
    background:#f9fafb;padding:16px;border-radius:14px;
    border:1px solid #e5e7eb;margin-bottom:10px;
  }
  .prefix{
    background:#1a73e8;color:#fff;padding:8px 10px;border-radius:10px;
    font-weight:600;min-width:46px;text-align:center;font-size:14px;
  }
  .search-container label{
    font-weight:600;color:#1f2933;font-size:13px;
  }
  .search-container input{
    flex:1;padding:8px 10px;border:1px solid #d1d5db;border-radius:10px;
    font-size:14px;outline:none;background:#fff;
  }
  .search-container input:focus{
    border-color:#1a73e8;box-shadow:0 0 0 1px rgba(26,115,232,0.25);
  }
  .baz-actions{
    display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px;
  }
  .progress-wrap{
    width:100%;background:#e5e7eb;border-radius:999px;
    height:8px;margin:10px 0;display:none;overflow:hidden;
  }
  .progress-bar{
    width:0%;height:100%;background:linear-gradient(90deg,#34d399,#22c55e);
    transition:width 0.18s ease-out;
  }
  .btn{
    padding:9px 14px;border:none;border-radius:999px;cursor:pointer;
    font-weight:600;font-size:13px;
  }
  .btn-primary{
    background:#1a73e8;color:#fff;box-shadow:0 4px 10px rgba(26,115,232,0.35);
  }
  .btn-primary:hover{background:#185abc;}
  .btn-secondary{
    background:#eef2ff;color:#1a73e8;border:1px solid #c7d2fe;
  }
  .btn-secondary:hover{background:#e0e7ff;}
  .btn-outline{
    background:#fff;color:#1a73e8;border:1px solid #d1e3ff;
  }
  .btn-danger{background:#f44336;color:#fff;}
  #baz-st{
    text-align:center;margin:8px 0;font-weight:600;color:#1a73e8;font-size:13px;
  }
  #baz-table{
    width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;
  }
  #baz-table th{
    background:#f3f4f6;color:#1a73e8;padding:9px 6px;
    border-bottom:2px solid #d1e3ff;position:sticky;top:0;
  }
  #baz-table td{
    padding:8px;border-bottom:1px solid #eee;text-align:center;
  }
  #baz-table tr:nth-child(even){background:#f9fafb;}
  #baz-table a{
    color:#1d4ed8;font-weight:600;text-decoration:none;
  }
  #baz-table a:hover{text-decoration:underline;}
  @media(max-width:640px){
    .search-container{grid-template-columns:1fr;}
    .baz-actions{flex-direction:column;}
  }
  `;
  d.head.appendChild(s);

  // ========== UI ==========
  const ui = d.createElement('div');
  ui.id = 'baz-ui';
  ui.innerHTML = `
    <div class="baz-window">
      <div id="baz-header">
        <div>
          <h2>رادار علي الباز V8.0</h2>
          <span class="title-sub">تمشيط الأرشيف حسب الحالة / الفاتورة / الطلب</span>
        </div>
        <button class="btn-close" title="إغلاق"
          onclick="document.getElementById('baz-ui').remove()">×</button>
      </div>
      <div class="baz-body">
        <div class="search-container">
          <div style="display:flex;flex-direction:column;gap:5px">
            <label>كود الصيدلية (Invoice):</label>
            <div style="display:flex;gap:5px">
              <span class="prefix">0</span>
              <input type="text" id="baz-store" placeholder="مثلاً: 1300" maxlength="6">
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px">
            <label>رقم الطلب (Online Number):</label>
            <div style="display:flex;gap:5px">
              <span class="prefix">ERX</span>
              <input type="text" id="baz-order" placeholder="الأرقام فقط...">
            </div>
          </div>
        </div>

        <div class="baz-actions">
          <button id="baz-run-ready" class="btn btn-primary">🔍 تمشيط Ready to pack</button>
          <button id="baz-run-all" class="btn btn-secondary">🌐 بحث شامل في جميع الحالات</button>
          <button id="baz-all" class="btn btn-outline" style="margin-right:auto;display:none">🔓 فتح كافة النتائج</button>
          <button id="baz-export" class="btn btn-outline" style="display:none">💾 تصدير CSV</button>
        </div>

        <div id="baz-p-wrap" class="progress-wrap">
          <div id="baz-p-bar" class="progress-bar"></div>
        </div>
        <div id="baz-st"></div>

        <dialog id="baz-dialog"
          style="border:none;border-radius:16px;padding:0;max-width:520px;width:90%">
          <div style="padding:16px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;direction:rtl">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <h3 style="margin:0;font-size:16px;color:#111827">تفاصيل الطلب</h3>
              <button type="button" id="baz-dialog-close"
                style="border:none;border-radius:999px;width:26px;height:26px;background:#ef4444;color:#fff;cursor:pointer;font-weight:bold">×</button>
            </div>
            <div id="baz-dialog-body" style="font-size:13px;color:#111827"></div>
          </div>
        </dialog>

        <div id="baz-res"></div>
      </div>
    </div>
  `;
  d.body.appendChild(ui);

  const st = d.getElementById('baz-st');
  const rs = d.getElementById('baz-res');
  const pBar = d.getElementById('baz-p-bar');
  const pWrap = d.getElementById('baz-p-wrap');
  const btnAll = d.getElementById('baz-all');
  const btnExport = d.getElementById('baz-export');
  const dialog = d.getElementById('baz-dialog');
  const dialogBody = d.getElementById('baz-dialog-body');
  const dialogClose = d.getElementById('baz-dialog-close');

  const links = [];
  const seen = new Set();

  if (dialogClose) {
    dialogClose.onclick = () => dialog.close();
  }

  // ========== HELPERS ==========
  function saveLastSearch(store, order) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        store: store || '',
        order: order || ''
      }));
    } catch (e) {}
  }

  function loadLastSearch() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj.store) d.getElementById('baz-store').value = obj.store;
      if (obj.order) d.getElementById('baz-order').value = obj.order;
    } catch (e) {}
  }
  loadLastSearch();

  function exportTableToCSV(filename) {
    const table = d.getElementById('baz-table');
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tr'));
    const lines = rows.map(tr => {
      const cells = Array.from(tr.querySelectorAll('th,td')).map(td => {
        let text = td.innerText.replace(/\r?\n|\r/g, ' ').trim();
        if (text.includes('"') || text.includes(',') || text.includes(';')) {
          text = '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
      });
      return cells.join(',');
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = d.createElement('a');
    a.href = url;
    a.download = filename;
    d.body.appendChild(a);
    a.click();
    d.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function normalizeSearchInputs() {
    const storeRaw = d.getElementById('baz-store').value.trim();
    const orderRaw = d.getElementById('baz-order').value.trim();
    const sVal = storeRaw.replace(/\D+/g, '');
    const oVal = orderRaw.replace(/\D+/g, '');
    if (!sVal && !oVal) return null;

    const queryInvoice = sVal ? ('0' + sVal) : '';
    const queryErxNumber = oVal || '';
    saveLastSearch(storeRaw, orderRaw);

    return { queryInvoice, queryErxNumber };
  }

  function matchOrderByQuery(item, q) {
    const inv = (item.Invoice || '').toString();
    const erx = (item.onlineNumber || '').toString().toUpperCase();
    const byInvoice = q.queryInvoice ? inv.includes(q.queryInvoice) : false;
    const byErx = q.queryErxNumber ? erx.includes('ERX' + q.queryErxNumber) : false;
    return byInvoice || byErx;
  }

  function ensureTable() {
    if (!d.getElementById('baz-table')) {
      rs.innerHTML = `
        <table id="baz-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Online Number</th>
              <th>Guest Name</th>
              <th>Guest Mobile</th>
              <th>Payment</th>
              <th>Created Time</th>
              <th>Status</th>
              <th>Source</th>
              <th>عرض</th>
            </tr>
          </thead>
          <tbody id="baz-tb"></tbody>
        </table>
      `;
    }
    return d.getElementById('baz-tb');
  }

  function pushResultRow(item, statusLabel) {
    const key = (item.Invoice || '') + '|' + (item.onlineNumber || '');
    if (!item.Invoice || seen.has(key)) return;
    seen.add(key);

    const url = base + `getEZPill_Details?onlineNumber=${
      (item.onlineNumber || '').toString().replace(/ERX/gi, '')
    }&Invoice=${item.Invoice}&typee=${item.typee || ''}&head_id=${item.head_id || ''}`;

    links.push(url);

    const tb = ensureTable();
    const row = tb.insertRow(-1);

    row.dataset.invoice = item.Invoice || '';
    row.dataset.onlineNumber = item.onlineNumber || '';
    row.dataset.guestName = item.guestName || '';
    row.dataset.guestMobile = item.guestMobile || '';
    row.dataset.payment = item.Payment || item.payment || '';
    row.dataset.createdTime = item.CreatedTime || item.createdTime || '';
    row.dataset.status = item.Status || item.status || statusLabel || '';
    row.dataset.source = item.Source || item.source || '';
    row.dataset.url = url;

    row.innerHTML = `
      <td><a href="${url}" target="_blank">${item.Invoice || ''}</a></td>
      <td>${item.onlineNumber || ''}</td>
      <td>${item.guestName || ''}</td>
      <td>${item.guestMobile || ''}</td>
      <td>${row.dataset.payment}</td>
      <td>${row.dataset.createdTime}</td>
      <td>${row.dataset.status}</td>
      <td>${row.dataset.source}</td>
      <td>
        <button type="button" class="baz-view btn btn-outline"
          style="padding:4px 10px;font-size:12px">عرض</button>
      </td>
    `;
  }

  async function scanStatus(statusCode, statusLabel, queryObj, countRef) {
    try {
      st.innerHTML = `📡 فحص حالة "${statusLabel}"...`;
      const firstRes = await fetch(base + 'Home/getOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusCode,
          pageSelected: 1,
          searchby: ''
        })
      });
      const firstJson = await firstRes.json();
      const totalOrders = firstJson.total_orders || 0;
      const totalPages = Math.max(1, Math.ceil(totalOrders / 10));

      for (let p = 1; p <= totalPages; p++) {
        pBar.style.width = (p / totalPages * 100) + '%';
        st.innerHTML = `🔍 ${statusLabel}: صفحة ${p} من ${totalPages}... (نتائج حتى الآن: ${countRef.count})`;

        const r = await fetch(base + 'Home/getOrders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: statusCode,
            pageSelected: p,
            searchby: ''
          })
        });
        const js = await r.json();
        const listStr = js.orders_list;
        if (!listStr) continue;

        let orders;
        try { orders = JSON.parse(listStr); } catch (e) { orders = []; }
        if (!orders || !orders.length) break;

        const matches = orders.filter(item => matchOrderByQuery(item, queryObj));
        if (matches.length) {
          matches.forEach(item => {
            const before = seen.size;
            pushResultRow(item, statusLabel);
            if (seen.size > before) countRef.count++;
          });
        }
      }
    } catch (e) {}
  }

  async function runSearchSingleStatus(statusCode, statusLabel) {
    const q = normalizeSearchInputs();
    if (!q) return;

    rs.innerHTML = '';
    st.innerHTML = '';
    pBar.style.width = '0%';
    pWrap.style.display = 'block';
    btnAll.style.display = 'none';
    btnExport.style.display = 'none';
    links.length = 0;
    seen.clear();

    const countRef = { count: 0 };
    await scanStatus(statusCode, statusLabel, q, countRef);

    pWrap.style.display = 'none';
    const queryLabel = q.queryInvoice || ('ERX' + q.queryErxNumber);
    const count = countRef.count;
    st.innerHTML = count
      ? `✅ اكتمل تمشيط "${statusLabel}"! وجدنا (${count}) نتيجة لـ "${queryLabel}"`
      : `❌ لا توجد نتائج في "${statusLabel}" لـ "${queryLabel}"`;

    if (count > 0) {
      btnAll.style.display = 'inline-block';
      btnExport.style.display = 'inline-block';
    }
  }

  async function runSearchAllStatuses() {
    const q = normalizeSearchInputs();
    if (!q) return;

    rs.innerHTML = '';
    st.innerHTML = '';
    pBar.style.width = '0%';
    pWrap.style.display = 'block';
    btnAll.style.display = 'none';
    btnExport.style.display = 'none';
    links.length = 0;
    seen.clear();

    const countRef = { count: 0 };

    const statuses = [
      { code: 'neworder', label: 'New Orders' },
      { code: 'readypack', label: 'Ready to pack' },
      { code: 'packed', label: 'Packed' },
      { code: 'delivered', label: 'Delivered' }
    ];

    for (let i = 0; i < statuses.length; i++) {
      await scanStatus(statuses[i].code, statuses[i].label, q, countRef);
    }

    pWrap.style.display = 'none';
    const queryLabel = q.queryInvoice || ('ERX' + q.queryErxNumber);
    const count = countRef.count;
    st.innerHTML = count
      ? `✅ اكتمل البحث الشامل! وجدنا (${count}) نتيجة لـ "${queryLabel}" عبر كل الحالات`
      : `❌ لا توجد نتائج في أي حالة لـ "${queryLabel}"`;

    if (count > 0) {
      btnAll.style.display = 'inline-block';
      btnExport.style.display = 'inline-block';
    }
  }

  // ========== EVENTS ==========
  d.getElementById('baz-run-ready').onclick = function () {
    runSearchSingleStatus('readypack', 'Ready to pack');
  };
  d.getElementById('baz-run-all').onclick = function () {
    runSearchAllStatuses();
  };

  d.querySelectorAll('#baz-store,#baz-order').forEach(el => {
    el.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        runSearchSingleStatus('readypack', 'Ready to pack');
      }
    });
  });

  btnAll.onclick = async function () {
    if (!links.length) return;
    if (!confirm(`فتح ${links.length} صفحات بتتابع ثانية؟`)) return;
    for (let i = 0; i < links.length; i++) {
      st.innerHTML = `🚀 فتح (${i + 1} من ${links.length})...`;
      window.open(links[i], '_blank');
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  btnExport.onclick = function () {
    const namePart = (
      d.getElementById('baz-order').value.trim() ||
      d.getElementById('baz-store').value.trim() ||
      'results'
    ).replace(/[^\w\-]+/g, '_');
    exportTableToCSV('baz_radar_' + namePart + '.csv');
  };

  // dialog من زر "عرض"
  d.addEventListener('click', function (e) {
    const btn = e.target.closest('.baz-view');
    if (!btn) return;
    const row = btn.closest('tr');
    if (!row) return;

    const invoice = row.dataset.invoice || '';
    const onlineNumber = row.dataset.onlineNumber || '';
    const guestName = row.dataset.guestName || '';
    const guestMobile = row.dataset.guestMobile || '';
    const payment = row.dataset.payment || '';
    const createdTime = row.dataset.createdTime || '';
    const status = row.dataset.status || '';
    const source = row.dataset.source || '';
    const url = row.dataset.url || '#';

    dialogBody.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Invoice</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">
            <a href="${url}" target="_blank" style="color:#1d4ed8;text-decoration:none">${invoice}</a>
          </td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Online Number</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${onlineNumber}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Guest Name</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${guestName}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Guest Mobile</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${guestMobile}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Payment</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${payment}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Created Time</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${createdTime}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px;border-bottom:1px solid #eee">Status</th>
          <td style="padding:4px 6px;border-bottom:1px solid #eee">${status}</td>
        </tr>
        <tr>
          <th style="text-align:right;padding:4px 6px">Source</th>
          <td style="padding:4px 6px">${source}</td>
        </tr>
      </table>
    `;

    try { dialog.showModal(); }
    catch (err) { dialog.setAttribute('open', 'open'); }
  });
})();

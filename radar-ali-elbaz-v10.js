javascript:(function () {
  /* ═══════════════════════════════════════════════════════
   *  نظام البحث — المطور علي الباز V10.0
   *  Light Glassmorphism Theme
   * ═══════════════════════════════════════════════════════ */

  var existingUI = document.getElementById('radar-ui');
  if (existingUI) existingUI.remove();
  var existingStyle = document.getElementById('radar-styles');
  if (existingStyle) existingStyle.remove();

  var BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  var READY_STATUSES = ['readypack'];
  var ALL_STATUSES = ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];
  var MAX_PAGES_FULL_SCAN = 25;
  var FETCH_TIMEOUT_MS = 15000;
  var TAB_OPEN_DELAY_MS = 1000;

  var collectedLinks = [];
  var currentAbortController = null;
  var isSearching = false;

  var styleElement = document.createElement('style');
  styleElement.id = 'radar-styles';
  styleElement.textContent = '#radar-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.96);width:95%;max-width:880px;background:rgba(255,255,255,0.82);backdrop-filter:blur(50px);-webkit-backdrop-filter:blur(50px);border:1px solid rgba(255,255,255,0.6);border-radius:24px;z-index:999999;overflow:hidden;box-shadow:0 1px 0 0 rgba(255,255,255,0.8) inset,0 20px 60px rgba(0,0,0,0.08),0 4px 20px rgba(59,130,246,0.06);direction:rtl;font-family:Segoe UI,Tahoma,sans-serif;max-height:90vh;opacity:0;animation:radarIn .35s ease forwards;box-sizing:border-box}@keyframes radarIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.96) translateY(10px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0)}}.radar-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid rgba(0,0,0,0.05);background:rgba(255,255,255,0.5)}.radar-title-area{display:flex;align-items:center;gap:14px}.radar-logo{width:44px;height:44px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 14px rgba(59,130,246,0.25)}.radar-header h2{font-size:18px;font-weight:900;color:#1e293b;margin:0}.radar-header .radar-ver{font-size:11px;color:#94a3b8;font-weight:600}.radar-actions{display:flex;gap:6px}.radar-actions button{width:34px;height:34px;border-radius:10px;border:1px solid rgba(0,0,0,0.06);background:rgba(0,0,0,0.03);color:#94a3b8;cursor:pointer;font-size:14px;transition:all .2s;display:flex;align-items:center;justify-content:center}.radar-actions button:hover{background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.2);color:#ef4444}.radar-body{padding:24px;overflow:auto;max-height:calc(90vh - 80px)}.radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.radar-field label{display:block;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}.radar-input-wrap{display:flex;border:1.5px solid rgba(0,0,0,0.08);border-radius:12px;overflow:hidden;background:rgba(255,255,255,0.7);transition:border-color .3s,box-shadow .3s}.radar-input-wrap:focus-within{border-color:rgba(59,130,246,0.4);box-shadow:0 0 0 3px rgba(59,130,246,0.07);background:#fff}.radar-prefix{padding:12px 14px;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center}.radar-input{flex:1;background:transparent;border:none;padding:12px 14px;color:#1e293b;font-size:14px;font-family:Segoe UI,Tahoma,sans-serif;outline:none}.radar-input::placeholder{color:#b0bec5}.radar-modes{grid-column:span 2;display:flex;gap:10px;margin-top:4px}.radar-mode-btn{flex:1;padding:12px;border-radius:12px;border:1.5px solid rgba(0,0,0,0.06);background:rgba(255,255,255,0.6);color:#94a3b8;font-family:Segoe UI,Tahoma,sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .3s;text-align:center}.radar-mode-btn.active{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.25);color:#3b82f6;box-shadow:0 2px 12px rgba(59,130,246,0.08)}.radar-mode-btn:hover:not(.active){background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.1);color:#64748b}.radar-start{grid-column:span 2;margin-top:4px;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-family:Segoe UI,Tahoma,sans-serif;font-weight:800;font-size:15px;cursor:pointer;transition:all .3s;box-shadow:0 4px 18px rgba(59,130,246,0.2);position:relative;overflow:hidden}.radar-start::before{content:\"\";position:absolute;top:0;left:-100%;right:0;bottom:0;width:300%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:shimmer 3s ease-in-out infinite}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}.radar-start:hover{box-shadow:0 6px 28px rgba(59,130,246,0.3);transform:translateY(-1px)}.radar-cancel{grid-column:span 2;margin-top:4px;padding:14px;border-radius:14px;border:none;background:#ef4444;color:#fff;font-family:Segoe UI,Tahoma,sans-serif;font-weight:800;font-size:15px;cursor:pointer;display:none}.radar-progress-wrap{margin-top:20px;height:5px;border-radius:5px;background:rgba(0,0,0,0.04);overflow:hidden;display:none}.radar-progress-bar{width:0%;height:100%;border-radius:5px;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899);background-size:200% 100%;animation:progAnim 2s ease-in-out infinite;transition:width .25s}@keyframes progAnim{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}.radar-status{text-align:center;margin:14px 0;font-size:13px;color:#3b82f6;font-weight:600;min-height:20px}.radar-action-row{display:flex;gap:10px;margin-top:6px}.radar-act-btn{flex:1;padding:11px;border-radius:12px;border:1.5px solid rgba(59,130,246,0.15);background:rgba(59,130,246,0.04);color:#3b82f6;font-family:Segoe UI,Tahoma,sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;text-align:center}.radar-act-btn:hover{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.25)}.radar-act-btn.export{border-color:rgba(249,115,22,0.15);background:rgba(249,115,22,0.04);color:#f97316}.radar-act-btn.export:hover{background:rgba(249,115,22,0.08);border-color:rgba(249,115,22,0.25)}#radar-table{width:100%;border-collapse:separate;border-spacing:0 5px;margin-top:14px}#radar-table th{padding:10px 12px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;text-align:center;font-weight:700}#radar-table td{padding:13px 12px;text-align:center;font-size:13px;color:#334155;background:rgba(255,255,255,0.6);font-weight:500}#radar-table tr td:first-child{border-radius:0 12px 12px 0}#radar-table tr td:last-child{border-radius:12px 0 0 12px}#radar-table tbody tr:hover td{background:rgba(59,130,246,0.05)}.radar-badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(52,211,153,0.1);color:#10b981;border:1px solid rgba(52,211,153,0.15);display:inline-block}.radar-open-link{color:#fff;text-decoration:none;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#6366f1);box-shadow:0 2px 8px rgba(59,130,246,0.15);transition:all .2s;display:inline-block}.radar-open-link:hover{box-shadow:0 4px 14px rgba(59,130,246,0.25);transform:translateY(-1px)}.radar-counter{text-align:center;margin-top:10px;font-size:12px;color:#94a3b8;font-weight:600}@media(max-width:640px){#radar-ui{width:98%;border-radius:18px;top:2%;transform:translateX(-50%) scale(0.97)}@keyframes radarIn{from{opacity:0;transform:translateX(-50%) scale(0.97) translateY(10px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}.radar-header{padding:14px 16px}.radar-header h2{font-size:15px}.radar-body{padding:16px}.radar-grid{grid-template-columns:1fr}.radar-modes{grid-column:span 1;flex-direction:column}.radar-start,.radar-cancel{grid-column:span 1}.radar-action-row{flex-direction:column}#radar-table th,#radar-table td{padding:8px 6px;font-size:11px}.radar-prefix{padding:10px 10px;font-size:12px}.radar-input{padding:10px;font-size:13px}}';
  document.head.appendChild(styleElement);

  var ui = document.createElement('div');
  ui.id = 'radar-ui';
  ui.innerHTML = '<div class="radar-header"><div class="radar-title-area"><div class="radar-logo">\u{1F4E1}</div><div><h2>\u0646\u0638\u0627\u0645 \u0627\u0644\u0628\u062D\u062B</h2><div class="radar-ver">\u0627\u0644\u0645\u0637\u0648\u0631 \u2014 \u0639\u0644\u064A \u0627\u0644\u0628\u0627\u0632</div></div></div><div class="radar-actions"><button id="radar-minimize" title="\u062A\u0635\u063A\u064A\u0631">\u2014</button><button id="radar-close" title="\u0625\u063A\u0644\u0627\u0642">\u2715</button></div></div><div class="radar-body" id="radar-body"><div class="radar-grid"><div class="radar-field"><label>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 / \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629</label><div class="radar-input-wrap"><span class="radar-prefix">0</span><input class="radar-input" id="radar-store" placeholder="\u0623\u062F\u062E\u0644 \u0643\u0648\u062F \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629..." autocomplete="off"></div></div><div class="radar-field"><label>\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628</label><div class="radar-input-wrap"><span class="radar-prefix">ERX</span><input class="radar-input" id="radar-order" placeholder="\u0623\u062F\u062E\u0644 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0641\u0642\u0637..." autocomplete="off"></div></div><div class="radar-modes"><button class="radar-mode-btn active" data-mode="ready">\u26A1 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0627\u0647\u0632\u0629 \u0641\u0642\u0637</button><button class="radar-mode-btn" data-mode="all">\u{1F50E} \u0628\u062D\u062B \u0634\u0627\u0645\u0644 \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A</button></div><button class="radar-start" id="radar-start">\u0628\u062F\u0621 \u0627\u0644\u0645\u0633\u062D \u{1F4E1}</button><button class="radar-cancel" id="radar-cancel">\u23F9 \u0625\u064A\u0642\u0627\u0641</button></div><div class="radar-progress-wrap" id="radar-progress-wrap"><div class="radar-progress-bar" id="radar-progress-bar"></div></div><div class="radar-status" id="radar-status"></div><div class="radar-action-row" id="radar-action-row" style="display:none"><button class="radar-act-btn" id="radar-open-all">\u{1F513} \u0641\u062A\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0646\u062A\u0627\u0626\u062C</button><button class="radar-act-btn export" id="radar-export">\u{1F4E5} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0646\u062A\u0627\u0626\u062C (CSV)</button></div><div id="radar-results"></div></div>';
  document.body.appendChild(ui);

  document.getElementById('radar-close').addEventListener('click', function () {
    cancelSearch();
    var el = document.getElementById('radar-ui');
    el.style.opacity = '0'; el.style.transform += ' scale(0.96)'; el.style.transition = 'all .2s';
    setTimeout(function () { el.remove(); }, 200);
  });
  document.getElementById('radar-minimize').addEventListener('click', function () {
    var body = document.getElementById('radar-body');
    var hidden = body.style.display === 'none';
    body.style.display = hidden ? '' : 'none';
    this.textContent = hidden ? '\u2014' : '+';
  });
  document.querySelectorAll('.radar-mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.radar-mode-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });
  document.getElementById('radar-start').addEventListener('click', startSearch);
  document.getElementById('radar-cancel').addEventListener('click', cancelSearch);
  document.querySelectorAll('.radar-input').forEach(function (el) {
    el.addEventListener('keypress', function (e) { if (e.key === 'Enter') startSearch(); });
  });
  document.getElementById('radar-open-all').addEventListener('click', openAllResults);
  document.getElementById('radar-export').addEventListener('click', exportCSV);

  var STATUS_MAP = { readypack: '\u062C\u0627\u0647\u0632', packed: '\u0645\u0639\u0628\u0623', delivered: '\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645', new: '\u062C\u062F\u064A\u062F', canceled: '\u0645\u0644\u063A\u064A', all: '\u0627\u0644\u0643\u0644' };

  function cancelSearch() {
    if (currentAbortController) { currentAbortController.abort(); currentAbortController = null; }
    if (isSearching) { isSearching = false; toggleUI(false); setStatus('\u23F9 \u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0645\u0633\u062D'); return true; }
    return false;
  }
  function toggleUI(s) {
    document.getElementById('radar-start').style.display = s ? 'none' : '';
    document.getElementById('radar-cancel').style.display = s ? '' : 'none';
    document.getElementById('radar-progress-wrap').style.display = s ? 'block' : 'none';
  }
  function setStatus(t) { document.getElementById('radar-status').textContent = t; }
  function setProgress(p) { document.getElementById('radar-progress-bar').style.width = Math.min(p, 100) + '%'; }

  async function safeFetch(url, opts, signal) {
    var ctrl = new AbortController();
    var tid = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
    if (signal) signal.addEventListener('abort', function () { ctrl.abort(); });
    try { var r = await fetch(url, Object.assign({}, opts, { signal: ctrl.signal })); clearTimeout(tid); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
    catch (e) { clearTimeout(tid); throw e; }
  }
  function safeJSON(s) { if (!s || typeof s !== 'string') return []; try { return JSON.parse(s); } catch (e) { return []; } }
  function sanitize(t) { if (t == null) return ''; var d = document.createElement('div'); d.textContent = String(t); return d.innerHTML; }
  function buildURL(o) {
    var n = String(o.onlineNumber || '').replace(/ERX/gi, '');
    return BASE_URL + 'getEZPill_Details?onlineNumber=' + encodeURIComponent(n) + '&Invoice=' + encodeURIComponent(o.Invoice || '') + '&typee=' + encodeURIComponent(o.typee || '') + '&head_id=' + encodeURIComponent(o.head_id || '');
  }

  async function startSearch() {
    if (isSearching) return;
    var sv = document.getElementById('radar-store').value.trim();
    var ov = document.getElementById('radar-order').value.trim();
    if (!sv && !ov) { setStatus('\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628'); return; }
    var mode = document.querySelector('.radar-mode-btn.active').dataset.mode;
    var query = ov ? 'ERX' + ov : '0' + sv;
    var statuses = mode === 'ready' ? READY_STATUSES : ALL_STATUSES;
    isSearching = true; collectedLinks = []; currentAbortController = new AbortController(); var sig = currentAbortController.signal;
    document.getElementById('radar-results').innerHTML = ''; document.getElementById('radar-action-row').style.display = 'none';
    toggleUI(true); setProgress(0);
    var count = 0, seen = new Set();
    try {
      for (var si = 0; si < statuses.length; si++) {
        if (!isSearching) break;
        var st = statuses[si];
        setStatus('\u{1F4E1} \u062C\u0627\u0631\u064A \u0641\u062D\u0635 \u0627\u0644\u062D\u0627\u0644\u0629 [' + (STATUS_MAP[st] || st) + ']...');
        var first = await safeFetch(BASE_URL + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: st, pageSelected: 1, searchby: '' }) }, sig);
        var tp = Math.ceil((first.total_orders || 0) / 10) || 1;
        if (mode === 'all') tp = Math.min(tp, MAX_PAGES_FULL_SCAN);
        for (var p = 1; p <= tp; p++) {
          if (!isSearching) break;
          setProgress(((si / statuses.length) + (p / tp / statuses.length)) * 100);
          setStatus('\u{1F50D} \u0641\u062D\u0635 [' + (STATUS_MAP[st] || st) + '] \u2014 \u0627\u0644\u0635\u0641\u062D\u0629 ' + p + ' \u0645\u0646 ' + tp + ' \u2014 \u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649: ' + count);
          var pd = p === 1 ? first : await safeFetch(BASE_URL + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: st, pageSelected: p, searchby: '' }) }, sig);
          var list = safeJSON(pd.orders_list); if (!list || !list.length) break;
          var matches = list.filter(function (o) { return (String(o.Invoice || '')).includes(query) || (String(o.onlineNumber || '')).includes(query); });
          if (matches.length) {
            ensureTable();
            matches.forEach(function (o) {
              var k = String(o.Invoice || ''); if (seen.has(k)) return; seen.add(k); count++;
              var url = buildURL(o); collectedLinks.push(url); addRow(o, url, count);
            });
          }
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') setStatus('\u23F9 \u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0645\u0633\u062D \u2014 \u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649: ' + count);
      else setStatus('\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644: ' + sanitize(e.message));
    }
    isSearching = false; toggleUI(false); setProgress(100);
    if (count > 0) { setStatus('\u2705 \u062A\u0645 \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 (' + count + ') \u0646\u062A\u064A\u062C\u0629 \u0644\u0640 "' + sanitize(query) + '"'); document.getElementById('radar-action-row').style.display = 'flex'; }
    else setStatus('\u274C \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u0644\u0640 "' + sanitize(query) + '"');
  }

  function ensureTable() {
    if (document.getElementById('radar-table')) return;
    var t = document.createElement('table'); t.id = 'radar-table';
    t.innerHTML = '<thead><tr><th>#</th><th>\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628</th><th>\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644</th><th>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629</th><th>\u0627\u0644\u062D\u0627\u0644\u0629</th><th>\u0625\u062C\u0631\u0627\u0621</th></tr></thead><tbody id="radar-tbody"></tbody>';
    document.getElementById('radar-results').appendChild(t);
  }
  function addRow(o, url, idx) {
    var tb = document.getElementById('radar-tbody'); if (!tb) return;
    var r = tb.insertRow(-1);
    r.insertCell(0).textContent = idx;
    var c1 = r.insertCell(1); var b = document.createElement('b'); b.textContent = o.onlineNumber || '\u2014'; c1.appendChild(b);
    r.insertCell(2).textContent = o.guestName || '\u2014';
    r.insertCell(3).textContent = o.Invoice || '\u2014';
    var c4 = r.insertCell(4); var sp = document.createElement('span'); sp.className = 'radar-badge'; sp.textContent = STATUS_MAP[String(o.status || '').toLowerCase()] || o.status || '\u2014'; c4.appendChild(sp);
    var c5 = r.insertCell(5); var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'radar-open-link'; a.textContent = '\u0641\u062A\u062D \u2705'; c5.appendChild(a);
  }

  async function openAllResults() {
    if (!collectedLinks.length) return;
    if (!confirm('\u0633\u064A\u062A\u0645 \u0641\u062A\u062D ' + collectedLinks.length + ' \u0646\u0627\u0641\u0630\u0629 \u0628\u0627\u0644\u062A\u062A\u0627\u0628\u0639. \u0647\u0644 \u062A\u0631\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629\u061F')) return;
    for (var i = 0; i < collectedLinks.length; i++) {
      setStatus('\u{1F680} \u062C\u0627\u0631\u064A \u0641\u062A\u062D (' + (i + 1) + ' \u0645\u0646 ' + collectedLinks.length + ')...');
      window.open(collectedLinks[i], '_blank');
      await new Promise(function (r) { setTimeout(r, TAB_OPEN_DELAY_MS); });
    }
    setStatus('\u2705 \u062A\u0645 \u0641\u062A\u062D ' + collectedLinks.length + ' \u0646\u0627\u0641\u0630\u0629 \u0628\u0646\u062C\u0627\u062D');
  }

  function exportCSV() {
    var t = document.getElementById('radar-table'); if (!t) return;
    var lines = [];
    t.querySelectorAll('tr').forEach(function (row) {
      var cols = []; row.querySelectorAll('th,td').forEach(function (c) { cols.push((c.textContent || '').replace(/,/g, ' ').replace(/\n/g, ' ').trim()); });
      lines.push(cols.join(','));
    });
    var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'search_results_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click(); URL.revokeObjectURL(a.href);
    setStatus('\u{1F4E5} \u062A\u0645 \u062A\u062D\u0645\u064A\u0644 \u0645\u0644\u0641 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0628\u0646\u062C\u0627\u062D');
  }

})();

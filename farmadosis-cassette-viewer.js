(async function () {
  "use strict";

  var oldPanel = document.getElementById("fd-cassette-panel");
  if (oldPanel) oldPanel.remove();

  // ============ AUTO-DETECT PRODUCTION ID ============
  function getCheckedProductions() {
    var prods = [];
    var selectedRows = document.querySelectorAll("tr.v-data-table__selected");
    selectedRows.forEach(function (row) {
      var link = row.querySelector("a[href*='/productions/']");
      if (!link) return;
      var match = link.getAttribute("href").match(/productions\/(\d+)/);
      if (!match) return;
      var id = match[1];
      // Get status from the Status cell
      var status = "unknown";
      var cells = row.querySelectorAll("td");
      cells.forEach(function (td) {
        var header = td.querySelector(".v-data-table__mobile-row__header");
        if (header && header.textContent.trim() === "Status") {
          var cell = td.querySelector(".v-data-table__mobile-row__cell");
          if (cell) status = cell.textContent.trim();
        }
      });
      prods.push({ id: id, status: status });
    });
    return prods;
  }
  function getProductionIdFromUrl() { var m = window.location.href.match(/productions\/(\d+)/); return m ? m[1] : null; }
  function getInstallationId() { var m = window.location.href.match(/installations\/(\d+)/); return m ? m[1] : "22"; }

  // ============ TOKEN ============
  function getAuthToken() {
    if (window._fd_capturedToken) return window._fd_capturedToken;
    var storages = [localStorage, sessionStorage];
    for (var si = 0; si < storages.length; si++) { var store = storages[si];
      for (var j = 0; j < store.length; j++) { var key = store.key(j); var v = store.getItem(key);
        try { var p = JSON.parse(v); if (p && typeof p === "object") { if (p.token) return p.token; if (p.access_token) return p.access_token; } }
        catch (e) { if (v && v.length > 30 && v.length < 1000 && /^[A-Za-z0-9._-]+$/.test(v)) return v; } } }
    return null;
  }
  if (!window._fd_cassette_intercepted) {
    window._fd_cassette_intercepted = true;
    var origXHR = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (n, v) {
      if (n.toLowerCase() === "authorization" && v.indexOf("Bearer") > -1) window._fd_capturedToken = v.replace("Bearer ", "");
      return origXHR.apply(this, arguments);
    };
  }

  var API_ROOT = "https://amcoplusapi.farmadosis.com/api/installations/" + getInstallationId();
  var detectedProds = getCheckedProductions();
  var detectedIds = detectedProds.map(function(p) { return p.id; });
  var urlId = getProductionIdFromUrl();

  // ============ STYLES ============
  var css = '\
    #fd-cassette-panel{position:fixed;top:0;left:0;width:540px;height:100vh;background:#fff;border-right:3px solid #1565c0;z-index:999999;font-family:Arial,sans-serif;font-size:13px;overflow-y:auto;box-shadow:4px 0 20px rgba(0,0,0,.3)}\
    #fd-cassette-panel *{box-sizing:border-box}\
    #fd-cassette-panel .fc-header{background:#1565c0;color:#fff;padding:14px 18px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center}\
    #fd-cassette-panel .fc-close{cursor:pointer;font-size:22px;background:none;border:none;color:#fff;font-weight:bold}\
    #fd-cassette-panel .fc-body{padding:15px}\
    #fd-cassette-panel .fc-btn{width:100%;padding:10px;margin-top:8px;border:none;border-radius:6px;font-size:13px;font-weight:bold;cursor:pointer;color:#fff}\
    #fd-cassette-panel .fc-btn:hover{opacity:.9}\
    #fd-cassette-panel .fc-btn:disabled{background:#ccc;cursor:not-allowed}\
    #fd-cassette-panel .fc-btn-blue{background:#1565c0}\
    #fd-cassette-panel .fc-detected{margin:8px 0;padding:10px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;font-size:12px;color:#2e7d32;font-weight:bold}\
    #fd-cassette-panel .fc-detected-none{background:#fff3e0;border-color:#ffcc80;color:#e65100}\
    #fd-cassette-panel .fc-log{margin-top:8px;padding:8px;background:#f5f5f5;border-radius:4px;max-height:80px;overflow-y:auto;font-size:11px;line-height:1.5;direction:ltr}\
    #fd-cassette-panel .fc-log .ok{color:green}\
    #fd-cassette-panel .fc-log .err{color:red}\
    #fd-cassette-panel .fc-log .info{color:#1565c0}\
    #fd-cassette-panel .fc-table-wrap{margin-top:8px;max-height:calc(100vh - 420px);overflow-y:auto;border:1px solid #ddd;border-radius:6px}\
    #fd-cassette-panel table{width:100%;border-collapse:collapse;font-size:12px}\
    #fd-cassette-panel thead{position:sticky;top:0;z-index:1}\
    #fd-cassette-panel th{background:#1565c0;color:#fff;padding:8px 6px;text-align:left;font-size:11px;white-space:nowrap}\
    #fd-cassette-panel td{padding:7px 6px;border-bottom:1px solid #eee}\
    #fd-cassette-panel tr:hover td{background:#e3f2fd}\
    #fd-cassette-panel .fc-tray{background:#fff3e0;color:#e65100;font-weight:bold;padding:2px 8px;border-radius:10px;font-size:11px;display:inline-block}\
    #fd-cassette-panel .fc-cassette{background:#e8f5e9;color:#2e7d32;font-weight:bold;padding:2px 8px;border-radius:10px;font-size:11px;display:inline-block}\
    #fd-cassette-panel .fc-no-cassette{background:#ffebee;color:#c62828;font-weight:bold;padding:2px 8px;border-radius:10px;font-size:11px;display:inline-block}\
    #fd-cassette-panel .fc-summary{display:flex;gap:8px;margin:8px 0;flex-wrap:wrap}\
    #fd-cassette-panel .fc-stat{flex:1;min-width:70px;padding:8px;border-radius:8px;text-align:center;font-weight:bold}\
    #fd-cassette-panel .fc-stat .fc-num{font-size:20px}\
    #fd-cassette-panel .fc-stat .fc-label{font-size:10px;color:#666}\
    #fd-cassette-panel .fc-search{width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;margin-top:8px}\
    #fd-cassette-panel .fc-section{margin-top:12px;padding:12px;border-radius:8px;border:1px solid #ddd}\
    #fd-cassette-panel .fc-section-title{font-weight:bold;font-size:13px;margin-bottom:8px;display:flex;align-items:center;gap:6px}\
    #fd-cassette-panel .fc-lookup-box{background:#f3e5f5;border-color:#ce93d8}\
    #fd-cassette-panel .fc-lookup-box .fc-section-title{color:#7b1fa2}\
    #fd-cassette-panel .fc-prod-box{background:#e3f2fd;border-color:#90caf9}\
    #fd-cassette-panel .fc-prod-box .fc-section-title{color:#1565c0}\
    #fd-cassette-panel .fc-lookup-result{margin-top:8px;padding:10px;background:#fff;border-radius:6px;border:1px solid #e0e0e0;font-size:12px;display:none}\
    #fd-cassette-panel .fc-lookup-result .fc-lr-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f5f5f5}\
    #fd-cassette-panel .fc-lookup-result .fc-lr-label{color:#666;font-size:11px}\
    #fd-cassette-panel .fc-lookup-result .fc-lr-value{font-weight:bold;font-size:12px}\
    #fd-cassette-panel .fc-lookup-input{display:flex;gap:6px}\
    #fd-cassette-panel .fc-lookup-input input{flex:1;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px}\
    #fd-cassette-panel .fc-lookup-input button{padding:8px 16px;border:none;border-radius:4px;background:#7b1fa2;color:#fff;font-weight:bold;cursor:pointer;font-size:13px;white-space:nowrap}\
    #fd-cassette-panel .fc-lookup-input button:hover{opacity:.9}\
  ';

  // ============ PANEL ============
  var panel = document.createElement("div");
  panel.id = "fd-cassette-panel";

  var detectedHtml = '';
  if (detectedIds.length > 0) {
    var detectedInfo = detectedProds.map(function(p) { return p.id + ' (' + p.status + ')'; }).join(", ");
    detectedHtml = '<div class="fc-detected">Selected: ' + detectedInfo + '</div>';
  }
  else if (urlId) detectedHtml = '<div class="fc-detected">From URL: ' + urlId + '</div>';
  else detectedHtml = '<div class="fc-detected fc-detected-none">No production selected. Check a row or enter from production page.</div>';

  panel.innerHTML = '<style>' + css + '</style>\
    <div class="fc-header"><span>Cassette Viewer</span><button class="fc-close" id="fc-close-btn">&times;</button></div>\
    <div class="fc-body">\
      <!-- CASSETTE LOOKUP -->\
      <div class="fc-section fc-lookup-box">\
        <div class="fc-section-title">&#128270; Cassette Lookup</div>\
        <div class="fc-lookup-input">\
          <input type="text" id="fc-lookup-code" placeholder="Medicine code e.g. 101066105" />\
          <button id="fc-lookup-btn">Search</button>\
        </div>\
        <div class="fc-lookup-result" id="fc-lookup-result"></div>\
      </div>\
      <!-- PRODUCTION REPORT -->\
      <div class="fc-section fc-prod-box">\
        <div class="fc-section-title">&#128203; Production Cassettes</div>\
        ' + detectedHtml + '\
        <button class="fc-btn fc-btn-blue" id="fc-load-btn">Load Cassette Data</button>\
      </div>\
      <div class="fc-summary" id="fc-summary" style="display:none;"></div>\
      <input type="text" class="fc-search" id="fc-search" placeholder="Filter by code, name, or cassette..." style="display:none;" />\
      <div class="fc-table-wrap" id="fc-table-wrap" style="display:none;"></div>\
      <div class="fc-log" id="fc-log"></div>\
    </div>';
  document.body.appendChild(panel);

  document.getElementById("fc-close-btn").onclick = function () { document.getElementById("fd-cassette-panel").remove(); };

  var logEl = document.getElementById("fc-log");
  function fcLog(m, c) { logEl.innerHTML += '<div class="' + (c || "info") + '">' + m + '</div>'; logEl.scrollTop = logEl.scrollHeight; }

  // ============ CASSETTE LOOKUP ============
  document.getElementById("fc-lookup-btn").onclick = async function () {
    var code = document.getElementById("fc-lookup-code").value.trim();
    if (!code) return;
    var token = getAuthToken();
    if (!token) { fcLog("Token not found!", "err"); return; }

    this.disabled = true;
    this.textContent = "...";
    var resultEl = document.getElementById("fc-lookup-result");
    resultEl.style.display = "none";

    try {
      var url = API_ROOT + "/cassettes/search?page=1&itemsPerPage=10&sortDesc[]=false&mustSort=false&multiSort=false&is_active=true&query=" + encodeURIComponent(code) + "&find_deactived_cassette_medicines=0";
      var resp = await fetch(url, {
        headers: { "Authorization": "Bearer " + token, "Accept": "application/json, text/plain, */*", "X-Client-ID": "Web" }
      });

      if (!resp.ok) { fcLog("Search failed: " + resp.status, "err"); this.disabled = false; this.textContent = "Search"; return; }

      var data = await resp.json();
      var items = data.items || data.data || [];

      if (items.length === 0) {
        resultEl.style.display = "block";
        resultEl.innerHTML = '<div style="text-align:center;color:#e65100;font-weight:bold;padding:10px;">&#10060; No cassette found for this code.<br/><span class="fc-tray">Will use Tray</span></div>';
      } else {
        var c = items[0];
        var medName = (c.medicines && c.medicines.length > 0) ? c.medicines[0].name : (c.medicine_name || "—");
        var medCode = (c.medicines && c.medicines.length > 0) ? c.medicines[0].code : (c.medicine_code || "—");

        resultEl.style.display = "block";
        resultEl.innerHTML = '\
          <div style="text-align:center;margin-bottom:8px;"><span class="fc-cassette" style="font-size:13px;">&#9989; Cassette #' + (c.number || "—") + '</span></div>\
          <div class="fc-lr-row"><span class="fc-lr-label">Medicine</span><span class="fc-lr-value">' + medCode + ' - ' + medName + '</span></div>\
          <div class="fc-lr-row"><span class="fc-lr-label">Chip</span><span class="fc-lr-value">' + (c.chip || "—") + '</span></div>\
          <div class="fc-lr-row"><span class="fc-lr-label">Base</span><span class="fc-lr-value" style="color:#1565c0;font-size:14px;background:#e3f2fd;padding:2px 10px;border-radius:6px;">' + (c.base_name || "—") + '</span></div>\
          <div class="fc-lr-row"><span class="fc-lr-label">Number</span><span class="fc-lr-value">' + (c.number || "—") + '</span></div>\
          ' + (items.length > 1 ? '<div style="margin-top:6px;font-size:10px;color:#999;text-align:center;">+ ' + (items.length - 1) + ' more result(s)</div>' : '') + '';
      }
    } catch (e) {
      fcLog("Error: " + e.message, "err");
    }

    this.disabled = false;
    this.textContent = "Search";
  };

  // Enter key in lookup
  document.getElementById("fc-lookup-code").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("fc-lookup-btn").click();
  });

  // ============ LOAD PRODUCTION DATA ============
  var allItems = [];

  document.getElementById("fc-load-btn").onclick = async function () {
    var freshProds = getCheckedProductions();
    if (freshProds.length === 0) {
      var fromUrl = getProductionIdFromUrl();
      if (fromUrl) freshProds = [{ id: fromUrl, status: "unknown" }];
    }
    if (freshProds.length === 0) { fcLog("No production selected! Check a row first.", "err"); return; }

    var token = getAuthToken();
    if (!token) { fcLog("Token not found!", "err"); return; }

    this.disabled = true;
    logEl.innerHTML = "";
    allItems = [];

    for (var pi = 0; pi < freshProds.length; pi++) {
      var prod = freshProds[pi];
      var productionId = prod.id;
      var status = prod.status.toLowerCase().trim();

      fcLog("[" + productionId + "] Status: " + prod.status, "info");

      // Only save if status is "Not Sent"
      if (status === "not sent") {
        fcLog("[" + productionId + "] Saving to machine...", "info");
        try {
          var saveResp = await fetch(API_ROOT + "/productions/" + productionId + "/save-to-machine", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token, "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "X-Client-ID": "Web" },
            body: JSON.stringify({ machine_id: 59, production_layout_id: 101 })
          });
          if (saveResp.ok) { fcLog("[" + productionId + "] Saved", "ok"); }
          else { fcLog("[" + productionId + "] Save failed, trying report anyway", "info"); }
        } catch (e) { fcLog("[" + productionId + "] Save error, trying report anyway", "info"); }
      } else {
        fcLog("[" + productionId + "] Skipping save (already " + prod.status + ")", "ok");
      }

      // Get recharge report
      try {
        var url = API_ROOT + "/productions/" + productionId + "/reports/recharge?sortBy[]=device&sortBy[]=quantity&sortDesc[]=true&sortDesc[]=true&itemsPerPage=-1&page=1&parameters[]=with-details";
        var resp = await fetch(url, {
          headers: { "Authorization": "Bearer " + token, "Accept": "application/json, text/plain, */*", "X-Client-ID": "Web" }
        });
        if (!resp.ok) { fcLog("[" + productionId + "] Report failed", "err"); continue; }
        var data = await resp.json();
        var items = Array.isArray(data) ? data : (data.items || data.data || []);
        items.forEach(function (item) { item._prodId = productionId; });
        allItems = allItems.concat(items);
        fcLog("[" + productionId + "] Found " + items.length + " medicines", "ok");
      } catch (e) { fcLog("[" + productionId + "] " + e.message, "err"); }

      if (pi < freshProds.length - 1) await new Promise(function (r) { setTimeout(r, 300); });
    }

    if (allItems.length > 0) { renderSummary(); renderTable(allItems); document.getElementById("fc-search").style.display = "block"; }
    this.disabled = false;
  };

  // ============ SUMMARY ============
  function renderSummary() {
    var total = allItems.length;
    var cassettes = allItems.filter(function (i) { return i.device && i.device.toLowerCase().indexOf("cassette") > -1; }).length;
    var trays = allItems.filter(function (i) { return i.device && i.device.toLowerCase().indexOf("tray") > -1; }).length;
    var totalQty = allItems.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
    var el = document.getElementById("fc-summary");
    el.style.display = "flex";
    el.innerHTML = '<div class="fc-stat" style="background:#e3f2fd;"><div class="fc-num">' + total + '</div><div class="fc-label">Total</div></div>\
      <div class="fc-stat" style="background:#e8f5e9;"><div class="fc-num">' + cassettes + '</div><div class="fc-label">Cassettes</div></div>\
      <div class="fc-stat" style="background:#fff3e0;"><div class="fc-num">' + trays + '</div><div class="fc-label">Trays</div></div>';
  }

  // ============ TABLE ============
  function renderTable(items) {
    var wrap = document.getElementById("fc-table-wrap");
    wrap.style.display = "block";
    if (items.length === 0) { wrap.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">No data</div>'; return; }
    var html = '<table><thead><tr><th>#</th><th>Code</th><th>Name</th><th>Device</th><th>Chip</th><th>Base</th><th>Qty</th><th>Stock</th></tr></thead><tbody>';
    items.forEach(function (item, i) {
      var isCassette = item.device && item.device.toLowerCase().indexOf("cassette") > -1;
      var deviceHtml = isCassette ? '<span class="fc-cassette">' + item.device + '</span>' : '<span class="fc-tray">' + (item.device || "N/A") + '</span>';
      var baseHtml = item.base ? '<span style="background:#1565c0;color:#fff;font-weight:bold;padding:3px 10px;border-radius:6px;font-size:12px;">' + item.base + '</span>' : '<span style="color:#ccc;">—</span>';
      html += '<tr><td>' + (i + 1) + '</td><td><strong>' + (item.code || "") + '</strong></td><td>' + (item.name || "") + '</td><td>' + deviceHtml + '</td><td>' + (item.chip || "—") + '</td><td>' + baseHtml + '</td><td><strong>' + (item.quantity || 0) + '</strong></td><td>' + (item.stock || 0) + '</td></tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  // ============ FILTER TABLE ============
  document.getElementById("fc-search").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase();
    if (!q) { renderTable(allItems); return; }
    var filtered = allItems.filter(function (item) {
      return (item.code && item.code.toLowerCase().indexOf(q) > -1) || (item.name && item.name.toLowerCase().indexOf(q) > -1) || (item.device && item.device.toLowerCase().indexOf(q) > -1) || (item.chip && item.chip.toLowerCase().indexOf(q) > -1);
    });
    renderTable(filtered);
  });

  fcLog("Ready!", "ok");
  if (detectedProds.length > 0) {
    fcLog("Detected " + detectedProds.length + " checked production(s)", "ok");
    detectedProds.forEach(function(p) { fcLog("  #" + p.id + " → " + p.status, "info"); });
  }
  else fcLog("No checked rows found. Check a production row first.", "info");

  // Debug
  var selectedRows = document.querySelectorAll("tr.v-data-table__selected");
  fcLog("Debug: " + selectedRows.length + " selected rows in page", "info");
})();

(async function () {
  "use strict";

  var oldPanel = document.getElementById("fd-cassette-panel");
  if (oldPanel) oldPanel.remove();

  // ============ AUTO-DETECT PRODUCTION ID ============
  function getCheckedProductionIds() {
    var ids = [];
    // Find all checked checkboxes in table rows
    var rows = document.querySelectorAll("tr");
    rows.forEach(function (row) {
      // Check if this row has a checked checkbox
      var checkbox = row.querySelector(".v-input--selection-controls__ripple");
      if (!checkbox) return;
      var input = row.querySelector("input[type=checkbox]");
      var isChecked = false;
      if (input && input.checked) {
        isChecked = true;
      } else {
        // Vuetify uses aria-checked or class
        var vInput = row.querySelector(".v-input--is-label-active, .v-input--is-dirty");
        if (vInput) isChecked = true;
      }
      if (!isChecked) return;

      // Find production ID from link in this row
      var link = row.querySelector("a[href*='/productions/']");
      if (link) {
        var match = link.getAttribute("href").match(/productions\/(\d+)/);
        if (match) ids.push(match[1]);
      }
    });
    return ids;
  }

  // Also try from URL
  function getProductionIdFromUrl() {
    var m = window.location.href.match(/productions\/(\d+)/);
    return m ? m[1] : null;
  }

  function getInstallationId() {
    var m = window.location.href.match(/installations\/(\d+)/);
    return m ? m[1] : "22";
  }

  // ============ TOKEN ============
  function getAuthToken() {
    if (window._fd_capturedToken) return window._fd_capturedToken;
    var storages = [localStorage, sessionStorage];
    for (var si = 0; si < storages.length; si++) {
      var store = storages[si];
      for (var j = 0; j < store.length; j++) {
        var key = store.key(j);
        var v = store.getItem(key);
        try {
          var p = JSON.parse(v);
          if (p && typeof p === "object") {
            if (p.token) return p.token;
            if (p.access_token) return p.access_token;
            if (p.data && p.data.token) return p.data.token;
          }
        } catch (e) {
          if (v && v.length > 30 && v.length < 1000 && /^[A-Za-z0-9._-]+$/.test(v)) return v;
        }
      }
    }
    return null;
  }

  if (!window._fd_cassette_intercepted) {
    window._fd_cassette_intercepted = true;
    var origXHR = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (n, v) {
      if (n.toLowerCase() === "authorization" && v.indexOf("Bearer") > -1) {
        window._fd_capturedToken = v.replace("Bearer ", "");
      }
      return origXHR.apply(this, arguments);
    };
  }

  var API_ROOT = "https://amcoplusapi.farmadosis.com/api/installations/" + getInstallationId();

  // ============ DETECT IDS ============
  var detectedIds = getCheckedProductionIds();
  var urlId = getProductionIdFromUrl();
  var defaultId = detectedIds.length > 0 ? detectedIds.join(", ") : (urlId || "");

  // ============ STYLES ============
  var css = '\
    #fd-cassette-panel{position:fixed;top:0;left:0;width:520px;height:100vh;background:#fff;border-right:3px solid #1565c0;z-index:999999;font-family:Arial,sans-serif;font-size:13px;overflow-y:auto;box-shadow:4px 0 20px rgba(0,0,0,.3)}\
    #fd-cassette-panel *{box-sizing:border-box}\
    #fd-cassette-panel .fc-header{background:#1565c0;color:#fff;padding:14px 18px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center}\
    #fd-cassette-panel .fc-close{cursor:pointer;font-size:22px;background:none;border:none;color:#fff;font-weight:bold}\
    #fd-cassette-panel .fc-body{padding:15px}\
    #fd-cassette-panel .fc-btn{width:100%;padding:12px;margin-top:10px;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;color:#fff}\
    #fd-cassette-panel .fc-btn:hover{opacity:.9}\
    #fd-cassette-panel .fc-btn:disabled{background:#ccc;cursor:not-allowed}\
    #fd-cassette-panel .fc-btn-blue{background:#1565c0}\
    #fd-cassette-panel .fc-detected{margin:8px 0;padding:10px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;font-size:12px;color:#2e7d32;font-weight:bold}\
    #fd-cassette-panel .fc-detected-none{background:#fff3e0;border-color:#ffcc80;color:#e65100}\
    #fd-cassette-panel .fc-log{margin-top:10px;padding:8px;background:#f5f5f5;border-radius:4px;max-height:100px;overflow-y:auto;font-size:11px;line-height:1.5;direction:ltr}\
    #fd-cassette-panel .fc-log .ok{color:green}\
    #fd-cassette-panel .fc-log .err{color:red}\
    #fd-cassette-panel .fc-log .info{color:#1565c0}\
    #fd-cassette-panel .fc-table-wrap{margin-top:10px;max-height:calc(100vh - 320px);overflow-y:auto;border:1px solid #ddd;border-radius:6px}\
    #fd-cassette-panel table{width:100%;border-collapse:collapse;font-size:12px}\
    #fd-cassette-panel thead{position:sticky;top:0;z-index:1}\
    #fd-cassette-panel th{background:#1565c0;color:#fff;padding:8px 6px;text-align:left;font-size:11px;white-space:nowrap}\
    #fd-cassette-panel td{padding:7px 6px;border-bottom:1px solid #eee}\
    #fd-cassette-panel tr:hover td{background:#e3f2fd}\
    #fd-cassette-panel .fc-tray{background:#fff3e0;color:#e65100;font-weight:bold;padding:2px 8px;border-radius:10px;font-size:11px;display:inline-block}\
    #fd-cassette-panel .fc-cassette{background:#e8f5e9;color:#2e7d32;font-weight:bold;padding:2px 8px;border-radius:10px;font-size:11px;display:inline-block}\
    #fd-cassette-panel .fc-summary{display:flex;gap:10px;margin:10px 0;flex-wrap:wrap}\
    #fd-cassette-panel .fc-stat{flex:1;min-width:80px;padding:10px;border-radius:8px;text-align:center;font-weight:bold}\
    #fd-cassette-panel .fc-stat .fc-num{font-size:22px}\
    #fd-cassette-panel .fc-stat .fc-label{font-size:10px;color:#666}\
    #fd-cassette-panel .fc-search{width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;margin-top:8px}\
  ';

  // ============ PANEL ============
  var panel = document.createElement("div");
  panel.id = "fd-cassette-panel";

  var detectedHtml = '';
  if (detectedIds.length > 0) {
    detectedHtml = '<div class="fc-detected">Auto-detected ' + detectedIds.length + ' selected production(s): ' + detectedIds.join(", ") + '</div>';
  } else if (urlId) {
    detectedHtml = '<div class="fc-detected">From URL: ' + urlId + '</div>';
  } else {
    detectedHtml = '<div class="fc-detected fc-detected-none">No production selected. Check a row in the table or enter ID manually.</div>';
  }

  panel.innerHTML = '<style>' + css + '</style>\
    <div class="fc-header"><span>Cassette Viewer</span><button class="fc-close" id="fc-close-btn">&times;</button></div>\
    <div class="fc-body">\
      ' + detectedHtml + '\
      <button class="fc-btn fc-btn-blue" id="fc-load-btn">Load Cassette Data</button>\
      <div class="fc-summary" id="fc-summary" style="display:none;"></div>\
      <input type="text" class="fc-search" id="fc-search" placeholder="Search by code, name, or cassette..." style="display:none;" />\
      <div class="fc-table-wrap" id="fc-table-wrap" style="display:none;"></div>\
      <div class="fc-log" id="fc-log"></div>\
    </div>';
  document.body.appendChild(panel);

  document.getElementById("fc-close-btn").onclick = function () {
    document.getElementById("fd-cassette-panel").remove();
  };

  var logEl = document.getElementById("fc-log");
  function fcLog(m, c) { logEl.innerHTML += '<div class="' + (c || "info") + '">' + m + '</div>'; logEl.scrollTop = logEl.scrollHeight; }

  // ============ LOAD DATA ============
  var allItems = [];

  document.getElementById("fc-load-btn").onclick = async function () {
    // Re-detect in case user checked after opening panel
    var freshIds = getCheckedProductionIds();
    if (freshIds.length === 0) {
      var fromUrl = getProductionIdFromUrl();
      if (fromUrl) freshIds = [fromUrl];
    }

    if (freshIds.length === 0) {
      fcLog("No production selected! Check a row first.", "err");
      return;
    }

    var token = getAuthToken();
    if (!token) { fcLog("Token not found! Click any link in the app first.", "err"); return; }

    this.disabled = true;
    logEl.innerHTML = "";
    allItems = [];

    for (var pi = 0; pi < freshIds.length; pi++) {
      var productionId = freshIds[pi];
      fcLog("Loading production " + productionId + "...", "info");

      // Step 1: Save to machine
      try {
        var saveResp = await fetch(API_ROOT + "/productions/" + productionId + "/save-to-machine", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-Client-ID": "Web"
          },
          body: JSON.stringify({ machine_id: 59, production_layout_id: 101 })
        });
        if (!saveResp.ok) { fcLog("[" + productionId + "] Save failed: " + saveResp.status, "err"); continue; }
        fcLog("[" + productionId + "] Saved to machine", "ok");
      } catch (e) { fcLog("[" + productionId + "] Save error: " + e.message, "err"); continue; }

      // Step 2: Get recharge report
      try {
        var url = API_ROOT + "/productions/" + productionId + "/reports/recharge?sortBy[]=device&sortBy[]=quantity&sortDesc[]=true&sortDesc[]=true&itemsPerPage=-1&page=1&parameters[]=with-details";
        var resp = await fetch(url, {
          headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/json, text/plain, */*",
            "X-Client-ID": "Web"
          }
        });
        if (!resp.ok) { fcLog("[" + productionId + "] Report failed: " + resp.status, "err"); continue; }

        var data = await resp.json();
        var items = Array.isArray(data) ? data : (data.items || data.data || []);

        // Tag each item with production ID
        items.forEach(function (item) { item._prodId = productionId; });
        allItems = allItems.concat(items);
        fcLog("[" + productionId + "] Found " + items.length + " medicines", "ok");
      } catch (e) { fcLog("[" + productionId + "] Error: " + e.message, "err"); }

      if (pi < freshIds.length - 1) await new Promise(function (r) { setTimeout(r, 300); });
    }

    if (allItems.length > 0) {
      renderSummary();
      renderTable(allItems);
      document.getElementById("fc-search").style.display = "block";
    }

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
    el.innerHTML = '\
      <div class="fc-stat" style="background:#e3f2fd;"><div class="fc-num">' + total + '</div><div class="fc-label">Total</div></div>\
      <div class="fc-stat" style="background:#e8f5e9;"><div class="fc-num">' + cassettes + '</div><div class="fc-label">Cassettes</div></div>\
      <div class="fc-stat" style="background:#fff3e0;"><div class="fc-num">' + trays + '</div><div class="fc-label">Trays</div></div>\
      <div class="fc-stat" style="background:#f3e5f5;"><div class="fc-num">' + totalQty + '</div><div class="fc-label">Total Qty</div></div>';
  }

  // ============ TABLE ============
  function renderTable(items) {
    var wrap = document.getElementById("fc-table-wrap");
    wrap.style.display = "block";

    if (items.length === 0) {
      wrap.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">No data</div>';
      return;
    }

    var html = '<table><thead><tr><th>#</th><th>Code</th><th>Name</th><th>Device</th><th>Chip</th><th>Base</th><th>Qty</th><th>Stock</th></tr></thead><tbody>';

    items.forEach(function (item, i) {
      var isCassette = item.device && item.device.toLowerCase().indexOf("cassette") > -1;
      var deviceHtml = isCassette
        ? '<span class="fc-cassette">' + item.device + '</span>'
        : '<span class="fc-tray">' + (item.device || "N/A") + '</span>';

      html += '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><strong>' + (item.code || "") + '</strong></td>' +
        '<td>' + (item.name || "") + '</td>' +
        '<td>' + deviceHtml + '</td>' +
        '<td>' + (item.chip || "—") + '</td>' +
        '<td>' + (item.base || "—") + '</td>' +
        '<td><strong>' + (item.quantity || 0) + '</strong></td>' +
        '<td>' + (item.stock || 0) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  // ============ SEARCH ============
  document.getElementById("fc-search").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase();
    if (!q) { renderTable(allItems); return; }
    var filtered = allItems.filter(function (item) {
      return (item.code && item.code.toLowerCase().indexOf(q) > -1) ||
        (item.name && item.name.toLowerCase().indexOf(q) > -1) ||
        (item.device && item.device.toLowerCase().indexOf(q) > -1) ||
        (item.chip && item.chip.toLowerCase().indexOf(q) > -1);
    });
    renderTable(filtered);
  });

  fcLog("Ready!", "ok");
  if (detectedIds.length > 0) fcLog("Click 'Load Cassette Data' to start.", "ok");
  else fcLog("Check a production row, then click Load.", "info");
})();

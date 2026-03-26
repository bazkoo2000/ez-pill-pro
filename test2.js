(async function () {
  "use strict";

  // ============ CLEANUP ============
  var oldPanel = document.getElementById("fd-cassette-panel");
  if (oldPanel) oldPanel.remove();

  // ============ HELPERS ============
  function getAuthToken() {
    // Try captured token
    if (window._fd_capturedToken) return window._fd_capturedToken;
    // Try storage
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

  // Intercept token from app requests
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

  function getInstallationId() {
    var m = window.location.href.match(/installations\/(\d+)/);
    return m ? m[1] : "22";
  }

  function getProductionId() {
    var m = window.location.href.match(/productions\/(\d+)/);
    return m ? m[1] : null;
  }

  var API_ROOT = "https://amcoplusapi.farmadosis.com/api/installations/" + getInstallationId();

  // ============ STYLES ============
  var css = '\
    #fd-cassette-panel {\
      position: fixed; top: 0; left: 0; width: 500px; height: 100vh;\
      background: #fff; border-right: 3px solid #1565c0; z-index: 999999;\
      font-family: Arial, sans-serif; font-size: 13px; overflow-y: auto;\
      box-shadow: 4px 0 20px rgba(0,0,0,0.3);\
    }\
    #fd-cassette-panel * { box-sizing: border-box; }\
    #fd-cassette-panel .fc-header {\
      background: #1565c0; color: #fff; padding: 14px 18px;\
      font-size: 16px; font-weight: bold; display: flex;\
      justify-content: space-between; align-items: center;\
    }\
    #fd-cassette-panel .fc-close {\
      cursor: pointer; font-size: 22px; background: none;\
      border: none; color: #fff; font-weight: bold;\
    }\
    #fd-cassette-panel .fc-body { padding: 15px; }\
    #fd-cassette-panel .fc-btn {\
      width: 100%; padding: 12px; margin-top: 10px; border: none;\
      border-radius: 6px; font-size: 14px; font-weight: bold;\
      cursor: pointer; color: #fff;\
    }\
    #fd-cassette-panel .fc-btn:hover { opacity: 0.9; }\
    #fd-cassette-panel .fc-btn:disabled { background: #ccc; cursor: not-allowed; }\
    #fd-cassette-panel .fc-btn-blue { background: #1565c0; }\
    #fd-cassette-panel .fc-btn-green { background: #2e7d32; }\
    #fd-cassette-panel .fc-btn-orange { background: #e65100; }\
    #fd-cassette-panel .fc-log {\
      margin-top: 10px; padding: 8px; background: #f5f5f5;\
      border-radius: 4px; max-height: 100px; overflow-y: auto;\
      font-size: 11px; line-height: 1.5; direction: ltr;\
    }\
    #fd-cassette-panel .fc-log .ok { color: green; }\
    #fd-cassette-panel .fc-log .err { color: red; }\
    #fd-cassette-panel .fc-log .info { color: #1565c0; }\
    #fd-cassette-panel .fc-table-wrap {\
      margin-top: 10px; max-height: calc(100vh - 280px); overflow-y: auto;\
      border: 1px solid #ddd; border-radius: 6px;\
    }\
    #fd-cassette-panel table {\
      width: 100%; border-collapse: collapse; font-size: 12px;\
    }\
    #fd-cassette-panel thead { position: sticky; top: 0; z-index: 1; }\
    #fd-cassette-panel th {\
      background: #1565c0; color: #fff; padding: 8px 6px;\
      text-align: left; font-size: 11px; white-space: nowrap;\
    }\
    #fd-cassette-panel td {\
      padding: 7px 6px; border-bottom: 1px solid #eee;\
    }\
    #fd-cassette-panel tr:hover td { background: #e3f2fd; }\
    #fd-cassette-panel .fc-tray {\
      background: #fff3e0; color: #e65100; font-weight: bold;\
      padding: 2px 8px; border-radius: 10px; font-size: 11px;\
      display: inline-block;\
    }\
    #fd-cassette-panel .fc-cassette {\
      background: #e8f5e9; color: #2e7d32; font-weight: bold;\
      padding: 2px 8px; border-radius: 10px; font-size: 11px;\
      display: inline-block;\
    }\
    #fd-cassette-panel .fc-summary {\
      display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap;\
    }\
    #fd-cassette-panel .fc-stat {\
      flex: 1; min-width: 80px; padding: 10px; border-radius: 8px;\
      text-align: center; font-weight: bold;\
    }\
    #fd-cassette-panel .fc-stat .fc-num { font-size: 22px; }\
    #fd-cassette-panel .fc-stat .fc-label { font-size: 10px; color: #666; }\
    #fd-cassette-panel .fc-search {\
      width: 100%; padding: 8px; border: 1px solid #ccc;\
      border-radius: 4px; font-size: 13px; margin-top: 8px;\
    }\
    #fd-cassette-panel .fc-prod-input {\
      width: 100%; padding: 8px; border: 1px solid #ccc;\
      border-radius: 4px; font-size: 13px; margin-top: 5px;\
    }\
  ';

  // ============ PANEL HTML ============
  var panel = document.createElement("div");
  panel.id = "fd-cassette-panel";
  panel.innerHTML = '<style>' + css + '</style>\
    <div class="fc-header">\
      <span>Cassette Viewer</span>\
      <button class="fc-close" id="fc-close-btn">&times;</button>\
    </div>\
    <div class="fc-body">\
      <label style="display:block;font-weight:bold;font-size:12px;margin-bottom:3px;">Production ID:</label>\
      <input type="text" class="fc-prod-input" id="fc-prod-id" placeholder="e.g. 344279" />\
      <button class="fc-btn fc-btn-blue" id="fc-load-btn">Load Cassette Data</button>\
      <div class="fc-summary" id="fc-summary" style="display:none;"></div>\
      <input type="text" class="fc-search" id="fc-search" placeholder="Search by code or name..." style="display:none;" />\
      <div class="fc-table-wrap" id="fc-table-wrap" style="display:none;"></div>\
      <div class="fc-log" id="fc-log"></div>\
    </div>';
  document.body.appendChild(panel);

  // Auto-fill production ID from URL
  var prodId = getProductionId();
  if (prodId) document.getElementById("fc-prod-id").value = prodId;

  // Close
  document.getElementById("fc-close-btn").onclick = function () {
    document.getElementById("fd-cassette-panel").remove();
  };

  // Log
  var logEl = document.getElementById("fc-log");
  function fcLog(m, c) {
    logEl.innerHTML += '<div class="' + (c || "info") + '">' + m + '</div>';
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ============ LOAD DATA ============
  var allItems = [];

  document.getElementById("fc-load-btn").onclick = async function () {
    var productionId = document.getElementById("fc-prod-id").value.trim();
    if (!productionId) { fcLog("Enter a Production ID!", "err"); return; }

    var token = getAuthToken();
    if (!token) { fcLog("Token not found! Click any link in the app first.", "err"); return; }

    this.disabled = true;
    logEl.innerHTML = "";
    fcLog("Loading cassette data for production " + productionId + "...", "info");

    // Step 1: Save to machine first (required to generate recharge data)
    fcLog("Saving to machine...", "info");
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

      if (!saveResp.ok) {
        fcLog("Save to machine failed: " + saveResp.status, "err");
        this.disabled = false;
        return;
      }
      fcLog("Saved to machine", "ok");
    } catch (e) {
      fcLog("Save error: " + e.message, "err");
      this.disabled = false;
      return;
    }

    // Step 2: Get recharge report with details
    fcLog("Loading recharge report...", "info");
    try {
      var url = API_ROOT + "/productions/" + productionId + "/reports/recharge?sortBy[]=device&sortBy[]=quantity&sortDesc[]=true&sortDesc[]=true&itemsPerPage=-1&page=1&parameters[]=with-details";
      var resp = await fetch(url, {
        headers: {
          "Authorization": "Bearer " + token,
          "Accept": "application/json, text/plain, */*",
          "X-Client-ID": "Web"
        }
      });

      if (!resp.ok) {
        fcLog("Recharge report failed: " + resp.status, "err");
        this.disabled = false;
        return;
      }

      var data = await resp.json();
      allItems = Array.isArray(data) ? data : (data.items || data.data || []);
      fcLog("Found " + allItems.length + " medicines", "ok");

      renderSummary();
      renderTable(allItems);
      document.getElementById("fc-search").style.display = "block";
    } catch (e) {
      fcLog("Error: " + e.message, "err");
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
    if (!q) {
      renderTable(allItems);
      return;
    }
    var filtered = allItems.filter(function (item) {
      return (item.code && item.code.toLowerCase().indexOf(q) > -1) ||
        (item.name && item.name.toLowerCase().indexOf(q) > -1) ||
        (item.device && item.device.toLowerCase().indexOf(q) > -1) ||
        (item.chip && item.chip.toLowerCase().indexOf(q) > -1);
    });
    renderTable(filtered);
  });

  fcLog("Ready! Enter Production ID and click Load.", "ok");
})();

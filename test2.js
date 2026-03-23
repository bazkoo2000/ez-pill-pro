(async function () {
  // ============ FULL CLEANUP ============
  var oldPanel = document.getElementById("fd-bulk-panel");
  if (oldPanel) oldPanel.remove();
  if (window._fd_origFetch) window.fetch = window._fd_origFetch;
  if (window._fd_origSetHeader) XMLHttpRequest.prototype.setRequestHeader = window._fd_origSetHeader;
  window._fd_treatments = [];
  window._fd_capturedToken = null;

  var INTAKES = [];

  // ============ STYLES ============
  var css = '\
    #fd-bulk-panel{position:fixed;top:0;right:0;width:440px;height:100vh;background:#fff;border-left:3px solid #f57c00;z-index:999999;font-family:Arial,sans-serif;font-size:13px;overflow-y:auto;box-shadow:-4px 0 20px rgba(0,0,0,.3)}\
    #fd-bulk-panel *{box-sizing:border-box}\
    #fd-bulk-panel .fd-header{background:#f57c00;color:#fff;padding:12px 15px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center}\
    #fd-bulk-panel .fd-close{cursor:pointer;font-size:22px;background:none;border:none;color:#fff;font-weight:bold}\
    #fd-bulk-panel .fd-tabs{display:flex;background:#f5f5f5;border-bottom:2px solid #eee}\
    #fd-bulk-panel .fd-tab{flex:1;padding:10px;text-align:center;cursor:pointer;font-weight:bold;color:#666;border:none;background:none;font-size:13px}\
    #fd-bulk-panel .fd-tab.active{color:#f57c00;border-bottom:3px solid #f57c00;background:#fff}\
    #fd-bulk-panel .fd-tab-content{display:none;padding:15px}\
    #fd-bulk-panel .fd-tab-content.active{display:block}\
    #fd-bulk-panel label{display:block;margin:8px 0 3px;font-weight:bold;color:#333;font-size:12px}\
    #fd-bulk-panel input[type=date],#fd-bulk-panel input[type=number],#fd-bulk-panel input[type=text],#fd-bulk-panel select{width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:13px}\
    #fd-bulk-panel .fd-row{display:flex;gap:8px;align-items:flex-end}\
    #fd-bulk-panel .fd-row>div{flex:1}\
    #fd-bulk-panel .fd-btn{width:100%;padding:10px;margin-top:10px;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;color:#fff}\
    #fd-bulk-panel .fd-btn-blue{background:#1976d2} #fd-bulk-panel .fd-btn-orange{background:#f57c00}\
    #fd-bulk-panel .fd-btn-green{background:#388e3c} #fd-bulk-panel .fd-btn:hover{opacity:.9}\
    #fd-bulk-panel .fd-btn:disabled{background:#ccc;cursor:not-allowed}\
    #fd-bulk-panel .fd-log{margin-top:10px;padding:8px;background:#f5f5f5;border-radius:4px;max-height:180px;overflow-y:auto;font-size:11px;line-height:1.5;direction:ltr}\
    #fd-bulk-panel .fd-log .ok{color:green} #fd-bulk-panel .fd-log .err{color:red} #fd-bulk-panel .fd-log .info{color:#1976d2}\
    #fd-bulk-panel .fd-treatments{margin-top:8px;max-height:220px;overflow-y:auto}\
    #fd-bulk-panel .fd-treat-item{display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid #eee;gap:6px}\
    #fd-bulk-panel .fd-treat-item:hover{background:#f9f9f9}\
    #fd-bulk-panel .fd-treat-item input[type=checkbox]{width:16px;height:16px;flex-shrink:0}\
    #fd-bulk-panel .fd-tid{color:#999;font-size:10px} #fd-bulk-panel .fd-dates{color:#1976d2;font-size:11px}\
    #fd-bulk-panel .fd-filter{margin:8px 0;padding:6px;background:#e3f2fd;border-radius:4px;font-size:12px}\
    #fd-bulk-panel .fd-filter label{display:inline;margin:0 8px 0 0;font-weight:normal}\
    #fd-bulk-panel .fd-progress{background:#e0e0e0;border-radius:4px;height:5px;margin:6px 0}\
    #fd-bulk-panel .fd-progress-bar{background:#f57c00;height:5px;border-radius:4px;transition:width .3s}\
    #fd-bulk-panel .fd-calc-box{margin-top:8px;padding:10px;background:#fff3e0;border:1px solid #ffcc80;border-radius:6px}\
    #fd-bulk-panel .fd-calc-box .fd-calc-title{font-weight:bold;color:#e65100;margin-bottom:6px;font-size:12px}\
    #fd-bulk-panel .fd-calc-result{margin-top:6px;padding:6px;background:#fff;border-radius:4px;font-weight:bold;color:#2e7d32;text-align:center;font-size:13px;border:1px dashed #a5d6a7;display:none}\
    #fd-bulk-panel .fd-or-divider{text-align:center;color:#999;margin:10px 0;font-size:11px;position:relative}\
    #fd-bulk-panel .fd-or-divider::before,#fd-bulk-panel .fd-or-divider::after{content:"";position:absolute;top:50%;width:38%;height:1px;background:#ddd}\
    #fd-bulk-panel .fd-or-divider::before{left:0} #fd-bulk-panel .fd-or-divider::after{right:0}\
    #fd-bulk-panel .fd-search-results{max-height:150px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;margin-top:5px;display:none}\
    #fd-bulk-panel .fd-search-item{padding:8px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:12px}\
    #fd-bulk-panel .fd-search-item:hover{background:#e3f2fd}\
    #fd-bulk-panel .fd-selected-med{margin-top:5px;padding:8px;background:#e8f5e9;border-radius:4px;font-size:12px;color:#2e7d32;display:none}\
    #fd-bulk-panel .fd-intake-grid{max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;margin-top:5px}\
    #fd-bulk-panel .fd-intake-item{display:flex;align-items:center;padding:5px 8px;border-bottom:1px solid #f0f0f0;gap:8px;font-size:12px}\
    #fd-bulk-panel .fd-intake-item:hover{background:#f5f5f5}\
    #fd-bulk-panel .fd-intake-item input[type=checkbox]{width:16px;height:16px}\
    #fd-bulk-panel .fd-intake-time{color:#1976d2;font-weight:bold;min-width:45px}\
    #fd-bulk-panel .fd-intake-dose{width:50px;padding:3px;border:1px solid #ccc;border-radius:3px;text-align:center;font-size:12px}\
    #fd-bulk-panel .fd-manual-box{margin-top:8px;padding:10px;background:#e8eaf6;border:1px solid #9fa8da;border-radius:6px}\
    #fd-bulk-panel .fd-manual-box .fd-manual-title{font-weight:bold;color:#283593;margin-bottom:6px;font-size:12px}\
  ';

  // ============ HTML ============
  var panel = document.createElement("div");
  panel.id = "fd-bulk-panel";
  panel.innerHTML = '<style>' + css + '</style>\
    <div class="fd-header"><span>Farmadosis Tools</span><button class="fd-close" id="fd-close-btn">&times;</button></div>\
    <div class="fd-tabs">\
      <button class="fd-tab active" data-tab="update">Update Dates</button>\
      <button class="fd-tab" data-tab="add">Add Treatment</button>\
    </div>\
    <!-- TAB 1: UPDATE -->\
    <div class="fd-tab-content active" id="fd-tab-update">\
      <button class="fd-btn fd-btn-blue" id="fd-load-btn">Load Treatments</button>\
      <div id="fd-filter-section" style="display:none;" class="fd-filter"><label><input type="checkbox" id="fd-filter-active" checked /> Active only</label></div>\
      <div id="fd-treat-list" class="fd-treatments"></div>\
      <div id="fd-date-section" style="display:none;">\
        <label>Start Date:</label><input type="date" id="fd-start-date" />\
        <div class="fd-calc-box"><div class="fd-calc-title">Auto-Calculate End Date (QTY &times; Size)</div>\
          <div class="fd-row"><div><label style="font-size:11px;margin:0 0 2px;">QTY</label><input type="number" id="fd-qty" value="1" min="1" /></div>\
          <div><label style="font-size:11px;margin:0 0 2px;">Size</label><input type="number" id="fd-size" value="30" min="1" /></div>\
          <div><label style="font-size:11px;margin:0 0 2px;">Days</label><input type="number" id="fd-total-days" readonly style="background:#eee;font-weight:bold;" /></div></div>\
          <div class="fd-calc-result" id="fd-calc-result"></div></div>\
        <div class="fd-or-divider">OR set manually</div>\
        <label>End Date:</label><input type="date" id="fd-end-date" />\
        <div id="fd-progress-wrap" style="display:none;"><div class="fd-progress"><div class="fd-progress-bar" id="fd-progress-bar" style="width:0%"></div></div></div>\
        <button class="fd-btn fd-btn-orange" id="fd-update-btn">Update Selected</button>\
        <button class="fd-btn fd-btn-green" id="fd-refresh-btn" style="display:none;">Reload</button>\
      </div>\
      <div class="fd-log" id="fd-log"></div>\
    </div>\
    <!-- TAB 2: ADD -->\
    <div class="fd-tab-content" id="fd-tab-add">\
      <label>Search Medicine (Code or Name):</label>\
      <input type="text" id="fd-med-search" placeholder="e.g. 100022733 or Crestor" />\
      <div class="fd-search-results" id="fd-search-results"></div>\
      <div class="fd-selected-med" id="fd-selected-med"></div>\
      <div class="fd-manual-box">\
        <div class="fd-manual-title">Or enter manually:</div>\
        <div class="fd-row">\
          <div><label style="font-size:11px;margin:0 0 2px;">Code</label><input type="text" id="fd-manual-code" placeholder="100022733" /></div>\
          <div><label style="font-size:11px;margin:0 0 2px;">Name</label><input type="text" id="fd-manual-name" placeholder="Crestor 10mg" /></div>\
        </div>\
        <button class="fd-btn fd-btn-blue" id="fd-manual-set" style="margin-top:6px;padding:6px;font-size:12px;">Use This Medicine</button>\
      </div>\
      <label>Start Date:</label><input type="date" id="fd-add-start" />\
      <div class="fd-calc-box"><div class="fd-calc-title">Auto-Calculate End Date</div>\
        <div class="fd-row"><div><label style="font-size:11px;margin:0 0 2px;">QTY</label><input type="number" id="fd-add-qty" value="1" min="1" /></div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Size</label><input type="number" id="fd-add-size" value="30" min="1" /></div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Days</label><input type="number" id="fd-add-total" readonly style="background:#eee;font-weight:bold;" /></div></div>\
        <div class="fd-calc-result" id="fd-add-calc-result"></div></div>\
      <div class="fd-or-divider">OR set manually</div>\
      <label>End Date:</label><input type="date" id="fd-add-end" />\
      <label>Dose Timing:</label>\
      <div class="fd-intake-grid" id="fd-intake-grid"></div>\
      <div class="fd-row" style="margin-top:8px;">\
        <div><label style="font-size:11px;margin:0 0 2px;">Every</label>\
          <select id="fd-add-freq">\
            <option value="720">12 hours</option>\
            <option value="1440" selected>24 hours (daily)</option>\
            <option value="2880">48 hours (every 2 days)</option>\
            <option value="4320">72 hours (every 3 days)</option>\
            <option value="10080">Weekly</option>\
          </select>\
        </div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Notes</label><input type="text" id="fd-add-notes" placeholder="Optional" /></div>\
      </div>\
      <button class="fd-btn fd-btn-green" id="fd-add-btn">Add Treatment</button>\
      <div class="fd-log" id="fd-add-log"></div>\
    </div>';

  document.body.appendChild(panel);

  // ============ TABS ============
  panel.querySelectorAll(".fd-tab").forEach(function (tab) {
    tab.onclick = function () {
      panel.querySelectorAll(".fd-tab").forEach(function (t) { t.classList.remove("active"); });
      panel.querySelectorAll(".fd-tab-content").forEach(function (c) { c.classList.remove("active"); });
      tab.classList.add("active");
      document.getElementById("fd-tab-" + tab.getAttribute("data-tab")).classList.add("active");
    };
  });

  document.getElementById("fd-close-btn").onclick = function () {
    document.getElementById("fd-bulk-panel").remove();
    if (window._fd_origFetch) { window.fetch = window._fd_origFetch; window._fd_origFetch = null; }
    if (window._fd_origSetHeader) { XMLHttpRequest.prototype.setRequestHeader = window._fd_origSetHeader; window._fd_origSetHeader = null; }
    window._fd_treatments = []; window._fd_capturedToken = null;
  };

  // ============ HELPERS ============
  function logTo(elId, msg, cls) {
    var el = document.getElementById(elId);
    el.innerHTML += '<div class="' + (cls || "info") + '">' + msg + "</div>";
    el.scrollTop = el.scrollHeight;
  }
  function log(m, c) { logTo("fd-log", m, c); }
  function addLog(m, c) { logTo("fd-add-log", m, c); }
  function clearLog(id) { document.getElementById(id || "fd-log").innerHTML = ""; }
  function setProgress(p) { document.getElementById("fd-progress-bar").style.width = p + "%"; }

  function getAuthToken() {
    if (window._fd_capturedToken) return window._fd_capturedToken;
    var storages = [localStorage, sessionStorage];
    for (var si = 0; si < storages.length; si++) {
      var store = storages[si];
      for (var j = 0; j < store.length; j++) {
        var key = store.key(j);
        if (key.toLowerCase().indexOf("token") > -1 || key.toLowerCase().indexOf("auth") > -1) {
          var v = store.getItem(key);
          try { var p = JSON.parse(v); if (p && p.token) return p.token; if (p && p.access_token) return p.access_token; }
          catch (e) { if (v && v.length > 20 && v.length < 500) return v; }
        }
      }
    }
    return null;
  }

  function getIdsFromUrl() {
    var match = window.location.href.match(/installations\/(\d+)\/centers\/(\d+)\/patients\/(\d+)/);
    if (!match) return null;
    return { installationId: match[1], centerId: match[2], patientId: match[3] };
  }

  function extractDate(obj) {
    if (!obj) return null;
    if (typeof obj === "string" && obj.length >= 10) return obj.substring(0, 10);
    if (obj.date) return obj.date.substring(0, 10);
    return null;
  }

  function toUTCDate(dateStr, isEnd) {
    var parts = dateStr.split("-");
    var d = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    if (isEnd) {
      d.setUTCDate(d.getUTCDate() - 1);
      return { date: d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0") + " 20:59:59.000000", timezone_type: 3, timezone: "UTC" };
    } else {
      d.setUTCDate(d.getUTCDate() - 1);
      return { date: d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0") + " 21:00:00.000000", timezone_type: 3, timezone: "UTC" };
    }
  }

  function addDays(dateStr, days) {
    var parts = dateStr.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + days - 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    var parts = dateStr.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  // ============ INTERCEPT AUTH TOKEN ============
  if (!window._fd_origFetch) {
    window._fd_origFetch = window.fetch;
    window.fetch = function () {
      var args = arguments;
      if (args[1] && args[1].headers) {
        var h = args[1].headers;
        var authVal = null;
        if (h instanceof Headers) { authVal = h.get("Authorization"); }
        else if (typeof h === "object") { authVal = h["Authorization"] || h["authorization"]; }
        if (authVal && authVal.indexOf("Bearer") > -1) { window._fd_capturedToken = authVal.replace("Bearer ", ""); }
      }
      return window._fd_origFetch.apply(this, args);
    };
  }
  if (!window._fd_origSetHeader) {
    window._fd_origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
      if (name.toLowerCase() === "authorization" && value.indexOf("Bearer") > -1) { window._fd_capturedToken = value.replace("Bearer ", ""); }
      return window._fd_origSetHeader.apply(this, arguments);
    };
  }

  var apiFetch = window._fd_origFetch || window.fetch;
  var ids = getIdsFromUrl();
  if (!ids) { log("Navigate to patient Treatments page first!", "err"); return; }

  var API_BASE = "https://amcoplusapi.farmadosis.com/api/installations/" + ids.installationId + "/centers/" + ids.centerId + "/patients/" + ids.patientId;
  var API_ROOT = "https://amcoplusapi.farmadosis.com/api/installations/" + ids.installationId;

  log("Patient ID: " + ids.patientId, "info");

  // ============ LOAD INTAKES ============
  async function loadIntakes() {
    var token = getAuthToken();
    if (!token) return;
    try {
      var resp = await apiFetch(API_ROOT + "/centers/" + ids.centerId + "/intakes-association", {
        headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
      });
      if (resp.ok) {
        var data = await resp.json();
        INTAKES = (Array.isArray(data) ? data : data.data || [])
          .filter(function (i) { return i.is_active; })
          .sort(function (a, b) { return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute); });
        renderIntakeGrid();
        addLog("Loaded " + INTAKES.length + " dose times", "ok");
      }
    } catch (e) { addLog("Could not load intakes: " + e.message, "err"); }
  }

  function renderIntakeGrid() {
    var grid = document.getElementById("fd-intake-grid");
    var html = "";
    INTAKES.forEach(function (intake) {
      var timeStr = String(intake.hour).padStart(2, "0") + ":" + String(intake.minute).padStart(2, "0");
      html += '<div class="fd-intake-item">' +
        '<input type="checkbox" class="fd-intake-cb" data-id="' + intake.id + '" data-hour="' + intake.hour + '" data-minute="' + intake.minute + '" />' +
        '<span class="fd-intake-time">' + timeStr + '</span>' +
        '<span>' + intake.name + '</span>' +
        '<input type="number" class="fd-intake-dose" value="1" min="0.25" step="0.25" title="Dose" />' +
        '</div>';
    });
    grid.innerHTML = html;
  }

  // ============ AUTO-CALC (Update tab) ============
  function recalcEndDate() {
    var s = document.getElementById("fd-start-date").value;
    var q = parseInt(document.getElementById("fd-qty").value) || 0;
    var sz = parseInt(document.getElementById("fd-size").value) || 0;
    var t = q * sz;
    document.getElementById("fd-total-days").value = t > 0 ? t : "";
    var r = document.getElementById("fd-calc-result");
    if (s && t > 0) { var e = addDays(s, t); document.getElementById("fd-end-date").value = e; r.style.display = "block"; r.innerHTML = "End: " + formatDateDisplay(e) + " (" + t + " days)"; }
    else { r.style.display = "none"; }
  }

  // ============ AUTO-CALC (Add tab) ============
  function recalcAddEndDate() {
    var s = document.getElementById("fd-add-start").value;
    var q = parseInt(document.getElementById("fd-add-qty").value) || 0;
    var sz = parseInt(document.getElementById("fd-add-size").value) || 0;
    var t = q * sz;
    document.getElementById("fd-add-total").value = t > 0 ? t : "";
    var r = document.getElementById("fd-add-calc-result");
    if (s && t > 0) { var e = addDays(s, t); document.getElementById("fd-add-end").value = e; r.style.display = "block"; r.innerHTML = "End: " + formatDateDisplay(e) + " (" + t + " days)"; }
    else { r.style.display = "none"; }
  }

  document.getElementById("fd-start-date").addEventListener("change", recalcEndDate);
  document.getElementById("fd-qty").addEventListener("input", recalcEndDate);
  document.getElementById("fd-size").addEventListener("input", recalcEndDate);
  document.getElementById("fd-add-start").addEventListener("change", recalcAddEndDate);
  document.getElementById("fd-add-qty").addEventListener("input", recalcAddEndDate);
  document.getElementById("fd-add-size").addEventListener("input", recalcAddEndDate);

  var today = new Date();
  var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  document.getElementById("fd-add-start").value = todayStr;

  // ============ MEDICINE SEARCH ============
  var searchTimeout = null;
  var selectedMedicine = null;

  document.getElementById("fd-med-search").addEventListener("input", function () {
    var query = this.value.trim();
    if (query.length < 3) { document.getElementById("fd-search-results").style.display = "none"; return; }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () { searchMedicine(query); }, 500);
  });

  async function searchMedicine(query) {
    var token = getAuthToken();
    if (!token) { addLog("Token not found! Click any link in the app first.", "err"); return; }

    // Try multiple search endpoints
    var endpoints = [
      API_ROOT + "/medicines/search?query=" + encodeURIComponent(query) + "&with_count=false",
      API_ROOT + "/centers/" + ids.centerId + "/medicines/search?query=" + encodeURIComponent(query) + "&with_count=false",
      API_ROOT + "/medicines/search?query=" + encodeURIComponent(query),
    ];

    var results = [];
    for (var ei = 0; ei < endpoints.length; ei++) {
      try {
        var resp = await apiFetch(endpoints[ei], {
          headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
        });
        if (resp.ok) {
          var data = await resp.json();
          results = Array.isArray(data) ? data : (data.data || []);
          if (results.length > 0) {
            addLog("Search OK (endpoint " + (ei + 1) + ")", "ok");
            break;
          }
        }
      } catch (e) { }
    }

    var resultsEl = document.getElementById("fd-search-results");
    if (results.length === 0) {
      resultsEl.innerHTML = '<div style="padding:10px;color:#999;text-align:center;">No results — use manual entry below</div>';
      resultsEl.style.display = "block";
      return;
    }

    var html = "";
    results.slice(0, 20).forEach(function (med) {
      html += '<div class="fd-search-item" data-med=\'' + JSON.stringify({
        id: med.id, code: med.code, name: med.name, pills_per_pack: med.pills_per_pack || 1
      }).replace(/'/g, "&#39;") + '\'><strong>' + (med.code || "") + '</strong> - ' + med.name + '</div>';
    });
    resultsEl.innerHTML = html;
    resultsEl.style.display = "block";

    resultsEl.querySelectorAll(".fd-search-item").forEach(function (item) {
      item.onclick = function () {
        selectMedicine(JSON.parse(this.getAttribute("data-med")));
      };
    });
  }

  function selectMedicine(med) {
    selectedMedicine = med;
    document.getElementById("fd-selected-med").style.display = "block";
    document.getElementById("fd-selected-med").innerHTML = "Selected: <strong>" + med.code + "</strong> - " + med.name;
    document.getElementById("fd-search-results").style.display = "none";
    document.getElementById("fd-med-search").value = med.code + " - " + med.name;
    if (med.pills_per_pack && med.pills_per_pack > 1) {
      document.getElementById("fd-add-size").value = med.pills_per_pack;
      recalcAddEndDate();
    }
  }

  // ============ MANUAL MEDICINE ENTRY ============
  document.getElementById("fd-manual-set").onclick = function () {
    var code = document.getElementById("fd-manual-code").value.trim();
    var name = document.getElementById("fd-manual-name").value.trim();
    if (!code) { addLog("Enter medicine code!", "err"); return; }
    if (!name) name = "Medicine " + code;

    // We need the medicine_id. Try to search API first with exact code.
    var token = getAuthToken();
    if (token) {
      apiFetch(API_ROOT + "/medicines/search?query=" + encodeURIComponent(code) + "&with_count=false", {
        headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
      }).then(function (r) { return r.json(); }).then(function (data) {
        var results = Array.isArray(data) ? data : (data.data || []);
        var match = results.find(function (m) { return m.code === code; });
        if (match) {
          selectMedicine({ id: match.id, code: match.code, name: match.name, pills_per_pack: match.pills_per_pack || 1 });
          addLog("Found medicine ID: " + match.id, "ok");
        } else {
          // Use code as fallback — the API might accept medicine_code without ID
          selectMedicine({ id: null, code: code, name: name, pills_per_pack: 1 });
          addLog("Using code directly (no ID found)", "info");
        }
      }).catch(function () {
        selectMedicine({ id: null, code: code, name: name, pills_per_pack: 1 });
        addLog("Using code directly", "info");
      });
    } else {
      selectMedicine({ id: null, code: code, name: name, pills_per_pack: 1 });
      addLog("Using code directly (no token)", "info");
    }
  };

  // ============ LOAD TREATMENTS ============
  async function loadTreatments() {
    clearLog("fd-log"); log("Loading...", "info");
    var token = getAuthToken();
    if (!token) { log("Token not found. Click any link first.", "err"); return false; }
    try {
      var resp = await apiFetch(API_BASE + "/treatments", {
        headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
      });
      if (!resp.ok) { log("Failed: " + resp.status, "err"); return false; }
      var data = await resp.json();
      window._fd_allTreatments = Array.isArray(data) ? data : (data.data || data.treatments || []);
      log("Found " + window._fd_allTreatments.length + " total", "ok");
      renderList(); return true;
    } catch (err) { log("Error: " + err.message, "err"); return false; }
  }

  function renderList() {
    var activeOnly = document.getElementById("fd-filter-active").checked;
    var list = window._fd_allTreatments || [];
    var filtered = list.filter(function (t) { return activeOnly ? t.is_active !== false : true; });
    window._fd_treatments = filtered;
    var listEl = document.getElementById("fd-treat-list");
    listEl.innerHTML = "";
    var html = '<label><input type="checkbox" id="fd-select-all" checked /> <b>Select All (' + filtered.length + ')</b></label>';
    filtered.forEach(function (t, i) {
      var name = (t.medicine ? t.medicine.name : t.medicine_code) || "Unknown";
      var sd = extractDate(t.starts_at) || extractDate(t.starts_at_8601) || "-";
      var ed = extractDate(t.ends_at) || extractDate(t.ends_at_8601) || "-";
      html += '<div class="fd-treat-item"><input type="checkbox" class="fd-treat-cb" data-index="' + i + '" checked />' +
        '<div><strong style="font-size:12px;">' + name + '</strong><br/><span class="fd-tid">ID: ' + t.id + '</span>' +
        '<br/><span class="fd-dates">' + sd + ' &rarr; ' + ed + '</span></div></div>';
    });
    listEl.innerHTML = html;
    document.getElementById("fd-date-section").style.display = "block";
    document.getElementById("fd-filter-section").style.display = "block";
    document.getElementById("fd-refresh-btn").style.display = "none";
    log("Showing " + filtered.length + " treatments", "info");
    document.getElementById("fd-select-all").onchange = function () {
      var cbs = document.querySelectorAll(".fd-treat-cb");
      for (var c = 0; c < cbs.length; c++) cbs[c].checked = this.checked;
    };
  }

  document.getElementById("fd-filter-active").onchange = function () { renderList(); };

  // ============ BUTTON: LOAD ============
  document.getElementById("fd-load-btn").onclick = async function () { this.disabled = true; await loadTreatments(); this.disabled = false; };
  document.getElementById("fd-refresh-btn").onclick = async function () { this.disabled = true; await loadTreatments(); this.disabled = false; };

  // ============ BUTTON: UPDATE ============
  document.getElementById("fd-update-btn").onclick = async function () {
    var newStart = document.getElementById("fd-start-date").value;
    var newEnd = document.getElementById("fd-end-date").value;
    if (!newStart || !newEnd) { log("Set both dates!", "err"); return; }
    var token = getAuthToken();
    if (!token) { log("Token not found!", "err"); return; }
    var selected = document.querySelectorAll(".fd-treat-cb:checked");
    if (selected.length === 0) { log("No treatments selected", "err"); return; }
    if (!confirm("Update " + selected.length + " treatments?\nStart: " + newStart + "\nEnd: " + newEnd)) return;

    this.disabled = true; document.getElementById("fd-load-btn").disabled = true;
    document.getElementById("fd-progress-wrap").style.display = "block";
    clearLog("fd-log"); log("Updating " + selected.length + "...", "info");
    var success = 0, failed = 0, total = selected.length;

    for (var s = 0; s < selected.length; s++) {
      var idx = parseInt(selected[s].getAttribute("data-index"));
      var t = window._fd_treatments[idx];
      var tName = (t.medicine ? t.medicine.name : t.medicine_code) || "Unknown";
      setProgress(Math.round(((s + 1) / total) * 100));
      try {
        var getResp = await apiFetch(API_BASE + "/treatments/" + t.id, {
          headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
        });
        if (!getResp.ok) { log("[" + tName + "] Load fail", "err"); failed++; continue; }
        var fd = await getResp.json();
        fd.starts_at = newStart; fd.ends_at = newEnd;
        fd.starts_at_8601 = toUTCDate(newStart, false); fd.ends_at_8601 = toUTCDate(newEnd, true);
        var sp = newStart.split("-");
        var sdd = new Date(Date.UTC(parseInt(sp[0]), parseInt(sp[1]) - 1, parseInt(sp[2])));
        sdd.setUTCDate(sdd.getUTCDate() - 1); sdd.setUTCHours(21, 0, 0, 0);
        fd.startsAtLocal = sdd.toISOString();
        var putResp = await apiFetch(API_BASE + "/treatments/" + t.id + "/update", {
          method: "PUT",
          headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*", "Content-Type": "application/json" },
          body: JSON.stringify(fd),
        });
        if (putResp.ok) { log("(" + (s+1) + "/" + total + ") [" + tName + "] Done", "ok"); success++; }
        else { log("[" + tName + "] Error " + putResp.status, "err"); failed++; }
      } catch (err) { log("[" + tName + "] " + err.message, "err"); failed++; }
      await new Promise(function (r) { setTimeout(r, 300); });
    }
    log("===== DONE: " + success + " ok, " + failed + " failed =====", success > 0 ? "ok" : "err");
    this.disabled = false; document.getElementById("fd-load-btn").disabled = false;
    document.getElementById("fd-progress-wrap").style.display = "none";
    document.getElementById("fd-refresh-btn").style.display = "block";
  };

  // ============ BUTTON: ADD TREATMENT ============
  document.getElementById("fd-add-btn").onclick = async function () {
    clearLog("fd-add-log");
    if (!selectedMedicine) { addLog("Select a medicine first!", "err"); return; }
    var startDate = document.getElementById("fd-add-start").value;
    var endDate = document.getElementById("fd-add-end").value;
    if (!startDate || !endDate) { addLog("Set both dates!", "err"); return; }
    var token = getAuthToken();
    if (!token) { addLog("Token not found!", "err"); return; }

    var intakeChecks = document.querySelectorAll(".fd-intake-cb:checked");
    if (intakeChecks.length === 0) { addLog("Select at least one dose time!", "err"); return; }

    var freqMinutes = parseInt(document.getElementById("fd-add-freq").value) || 1440;
    var notes = document.getElementById("fd-add-notes").value || "";

    var configs = [];
    intakeChecks.forEach(function (cb) {
      var doseInput = cb.closest(".fd-intake-item").querySelector(".fd-intake-dose");
      var dose = parseFloat(doseInput.value) || 1;
      var hour = parseInt(cb.getAttribute("data-hour"));
      var minute = parseInt(cb.getAttribute("data-minute"));
      var firstTake = startDate + " " + String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
      configs.push({
        first_take: firstTake, firstTake8601: "", dose: dose,
        days_to_take: null, range_to_take: null,
        minutes_interval: freqMinutes,
        days_in_months: null, month_ids: []
      });
    });

    var treatmentData = {
      medicine_code: selectedMedicine.code,
      patient_id: parseInt(ids.patientId),
      treatment_plan_id: 3,
      starts_at: startDate, ends_at: endDate,
      starts_at_8601: toUTCDate(startDate, false),
      ends_at_8601: toUTCDate(endDate, true),
      emblist_it: true, is_active: true,
      is_if_needed_treatment: false, is_replaceable: false,
      emblist_in_unique_bag: false, force_medicine_code_in_production: false,
      notes: notes, doctor_id: null, administration_route_id: null,
      configs: configs
    };

    if (selectedMedicine.id) treatmentData.medicine_id = selectedMedicine.id;

    var sp2 = startDate.split("-");
    var sd2 = new Date(Date.UTC(parseInt(sp2[0]), parseInt(sp2[1]) - 1, parseInt(sp2[2])));
    sd2.setUTCDate(sd2.getUTCDate() - 1); sd2.setUTCHours(21, 0, 0, 0);
    treatmentData.startsAtLocal = sd2.toISOString();

    var freqLabel = document.getElementById("fd-add-freq").options[document.getElementById("fd-add-freq").selectedIndex].text;
    if (!confirm("Add treatment?\n" + selectedMedicine.code + " - " + selectedMedicine.name +
      "\nStart: " + startDate + " | End: " + endDate +
      "\nDose times: " + intakeChecks.length + " | Every: " + freqLabel)) return;

    this.disabled = true;
    addLog("Creating treatment...", "info");

    try {
      var resp = await apiFetch(API_BASE + "/treatments/create", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*", "Content-Type": "application/json" },
        body: JSON.stringify(treatmentData),
      });

      if (resp.ok) {
        var result = await resp.json();
        addLog("Treatment created! ID: " + (result.id || "OK"), "ok");
        selectedMedicine = null;
        document.getElementById("fd-selected-med").style.display = "none";
        document.getElementById("fd-med-search").value = "";
        document.querySelectorAll(".fd-intake-cb:checked").forEach(function (cb) { cb.checked = false; });
      } else {
        var errText = await resp.text();
        addLog("Error " + resp.status + ": " + errText.substring(0, 300), "err");
      }
    } catch (err) { addLog("Error: " + err.message, "err"); }
    this.disabled = false;
  };

  // ============ INIT ============
  loadIntakes();
  log("Ready!", "ok");
  addLog("Search or enter medicine manually.", "info");
})();

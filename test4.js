(async function () {
  // ============ FULL CLEANUP on re-run ============
  var oldPanel = document.getElementById("fd-bulk-panel");
  if (oldPanel) oldPanel.remove();
  if (window._fd_origFetch) window.fetch = window._fd_origFetch;
  if (window._fd_origSetHeader) XMLHttpRequest.prototype.setRequestHeader = window._fd_origSetHeader;
  window._fd_treatments = [];
  window._fd_capturedToken = null;

  // ============ UI PANEL ============
  var panel = document.createElement("div");
  panel.id = "fd-bulk-panel";
  panel.innerHTML = '\
    <style>\
      #fd-bulk-panel {\
        position: fixed; top: 0; right: 0; width: 420px; height: 100vh;\
        background: #fff; border-left: 3px solid #f57c00; z-index: 999999;\
        font-family: Arial, sans-serif; font-size: 14px; overflow-y: auto;\
        box-shadow: -4px 0 20px rgba(0,0,0,0.3);\
      }\
      #fd-bulk-panel .fd-header {\
        background: #f57c00; color: #fff; padding: 15px;\
        font-size: 16px; font-weight: bold; display: flex;\
        justify-content: space-between; align-items: center;\
      }\
      #fd-bulk-panel .fd-close {\
        cursor: pointer; font-size: 22px; background: none;\
        border: none; color: #fff; font-weight: bold;\
      }\
      #fd-bulk-panel .fd-body { padding: 15px; }\
      #fd-bulk-panel label { display: block; margin: 10px 0 4px; font-weight: bold; color: #333; }\
      #fd-bulk-panel input[type="date"],\
      #fd-bulk-panel input[type="number"] {\
        width: 100%; padding: 8px; border: 1px solid #ccc;\
        border-radius: 4px; font-size: 14px; box-sizing: border-box;\
      }\
      #fd-bulk-panel .fd-row {\
        display: flex; gap: 10px; align-items: flex-end;\
      }\
      #fd-bulk-panel .fd-row > div { flex: 1; }\
      #fd-bulk-panel .fd-btn {\
        width: 100%; padding: 12px; margin-top: 12px; border: none;\
        border-radius: 6px; font-size: 15px; font-weight: bold;\
        cursor: pointer; color: #fff;\
      }\
      #fd-bulk-panel .fd-btn-load { background: #1976d2; }\
      #fd-bulk-panel .fd-btn-update { background: #f57c00; }\
      #fd-bulk-panel .fd-btn-refresh { background: #388e3c; }\
      #fd-bulk-panel .fd-btn:hover { opacity: 0.9; }\
      #fd-bulk-panel .fd-btn:disabled { background: #ccc; cursor: not-allowed; }\
      #fd-bulk-panel .fd-log {\
        margin-top: 15px; padding: 10px; background: #f5f5f5;\
        border-radius: 4px; max-height: 200px; overflow-y: auto;\
        font-size: 12px; line-height: 1.6; direction: ltr;\
      }\
      #fd-bulk-panel .fd-log .ok { color: green; }\
      #fd-bulk-panel .fd-log .err { color: red; }\
      #fd-bulk-panel .fd-log .info { color: #1976d2; }\
      #fd-bulk-panel .fd-treatments { margin-top: 10px; max-height: 250px; overflow-y: auto; }\
      #fd-bulk-panel .fd-treat-item {\
        display: flex; align-items: center; padding: 8px 4px;\
        border-bottom: 1px solid #eee; gap: 8px;\
      }\
      #fd-bulk-panel .fd-treat-item:hover { background: #f9f9f9; }\
      #fd-bulk-panel .fd-treat-item input[type="checkbox"] { width: 18px; height: 18px; flex-shrink: 0; }\
      #fd-bulk-panel .fd-tid { color: #999; font-size: 11px; }\
      #fd-bulk-panel .fd-dates { color: #1976d2; font-size: 12px; }\
      #fd-bulk-panel .fd-inactive { color: red; font-size: 11px; font-weight: bold; }\
      #fd-bulk-panel .fd-filter { margin: 10px 0; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 13px; }\
      #fd-bulk-panel .fd-filter label { display: inline; margin: 0 10px 0 0; font-weight: normal; }\
      #fd-bulk-panel .fd-progress { background: #e0e0e0; border-radius: 4px; height: 6px; margin: 8px 0; }\
      #fd-bulk-panel .fd-progress-bar { background: #f57c00; height: 6px; border-radius: 4px; transition: width 0.3s; }\
      #fd-bulk-panel .fd-calc-box {\
        margin-top: 10px; padding: 12px; background: #fff3e0; border: 1px solid #ffcc80;\
        border-radius: 6px;\
      }\
      #fd-bulk-panel .fd-calc-box .fd-calc-title {\
        font-weight: bold; color: #e65100; margin-bottom: 8px; font-size: 13px;\
      }\
      #fd-bulk-panel .fd-calc-result {\
        margin-top: 8px; padding: 8px; background: #fff; border-radius: 4px;\
        font-weight: bold; color: #2e7d32; text-align: center; font-size: 14px;\
        border: 1px dashed #a5d6a7; display: none;\
      }\
      #fd-bulk-panel .fd-or-divider {\
        text-align: center; color: #999; margin: 12px 0; font-size: 12px;\
        position: relative;\
      }\
      #fd-bulk-panel .fd-or-divider::before,\
      #fd-bulk-panel .fd-or-divider::after {\
        content: ""; position: absolute; top: 50%; width: 40%; height: 1px; background: #ddd;\
      }\
      #fd-bulk-panel .fd-or-divider::before { left: 0; }\
      #fd-bulk-panel .fd-or-divider::after { right: 0; }\
    </style>\
    <div class="fd-header">\
      <span>Bulk Date Update</span>\
      <button class="fd-close" id="fd-close-btn">&times;</button>\
    </div>\
    <div class="fd-body">\
      <button class="fd-btn fd-btn-load" id="fd-load-btn">1. Load Treatments</button>\
      <div id="fd-filter-section" style="display:none;" class="fd-filter">\
        <label><input type="checkbox" id="fd-filter-active" checked /> Active only</label>\
      </div>\
      <div id="fd-treat-list" class="fd-treatments"></div>\
      <div id="fd-date-section" style="display:none;">\
        <label>Start Date:</label>\
        <input type="date" id="fd-start-date" />\
\
        <div class="fd-calc-box">\
          <div class="fd-calc-title">Auto-Calculate End Date (QTY &times; Size)</div>\
          <div class="fd-row">\
            <div>\
              <label style="font-size:12px; margin:0 0 4px;">QTY</label>\
              <input type="number" id="fd-qty" value="1" min="1" />\
            </div>\
            <div>\
              <label style="font-size:12px; margin:0 0 4px;">Size</label>\
              <input type="number" id="fd-size" value="30" min="1" />\
            </div>\
            <div>\
              <label style="font-size:12px; margin:0 0 4px;">Days</label>\
              <input type="number" id="fd-total-days" readonly style="background:#eee; font-weight:bold;" />\
            </div>\
          </div>\
          <div class="fd-calc-result" id="fd-calc-result"></div>\
        </div>\
\
        <div class="fd-or-divider">OR set manually</div>\
\
        <label>End Date:</label>\
        <input type="date" id="fd-end-date" />\
\
        <div id="fd-progress-wrap" style="display:none;">\
          <div class="fd-progress"><div class="fd-progress-bar" id="fd-progress-bar" style="width:0%"></div></div>\
        </div>\
        <button class="fd-btn fd-btn-update" id="fd-update-btn">2. Update Selected</button>\
        <button class="fd-btn fd-btn-refresh" id="fd-refresh-btn" style="display:none;">Reload Treatments</button>\
      </div>\
      <div class="fd-log" id="fd-log"></div>\
    </div>';
  document.body.appendChild(panel);

  document.getElementById("fd-close-btn").onclick = function () {
    document.getElementById("fd-bulk-panel").remove();
    if (window._fd_origFetch) { window.fetch = window._fd_origFetch; window._fd_origFetch = null; }
    if (window._fd_origSetHeader) { XMLHttpRequest.prototype.setRequestHeader = window._fd_origSetHeader; window._fd_origSetHeader = null; }
    window._fd_treatments = [];
    window._fd_capturedToken = null;
  };

  // ============ HELPERS ============
  var logEl = document.getElementById("fd-log");
  function log(msg, cls) {
    logEl.innerHTML += '<div class="' + (cls || "info") + '">' + msg + "</div>";
    logEl.scrollTop = logEl.scrollHeight;
  }
  function clearLog() { logEl.innerHTML = ""; }
  function setProgress(pct) {
    document.getElementById("fd-progress-bar").style.width = pct + "%";
  }

  function getAuthToken() {
    if (window._fd_capturedToken) return window._fd_capturedToken;
    var storages = [localStorage, sessionStorage];
    for (var si = 0; si < storages.length; si++) {
      var store = storages[si];
      for (var j = 0; j < store.length; j++) {
        var key = store.key(j);
        if (key.toLowerCase().indexOf("token") > -1 || key.toLowerCase().indexOf("auth") > -1) {
          var v = store.getItem(key);
          try {
            var p = JSON.parse(v);
            if (p && p.token) return p.token;
            if (p && p.access_token) return p.access_token;
          } catch (e) {
            if (v && v.length > 20 && v.length < 500) return v;
          }
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
      return {
        date: d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0") + " 20:59:59.000000",
        timezone_type: 3, timezone: "UTC"
      };
    } else {
      d.setUTCDate(d.getUTCDate() - 1);
      return {
        date: d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0") + " 21:00:00.000000",
        timezone_type: 3, timezone: "UTC"
      };
    }
  }

  function addDays(dateStr, days) {
    var parts = dateStr.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + days - 1); // -1 as per requirement
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + dd;
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    var parts = dateStr.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0]; // DD/MM/YYYY
  }

  // ============ AUTO-CALCULATE END DATE ============
  function recalcEndDate() {
    var startDate = document.getElementById("fd-start-date").value;
    var qty = parseInt(document.getElementById("fd-qty").value) || 0;
    var size = parseInt(document.getElementById("fd-size").value) || 0;
    var totalDays = qty * size;
    var resultEl = document.getElementById("fd-calc-result");
    var totalEl = document.getElementById("fd-total-days");

    totalEl.value = totalDays > 0 ? totalDays : "";

    if (startDate && totalDays > 0) {
      var endDate = addDays(startDate, totalDays);
      document.getElementById("fd-end-date").value = endDate;
      resultEl.style.display = "block";
      resultEl.innerHTML = "End Date: " + formatDateDisplay(endDate) + " (" + totalDays + " days)";
    } else {
      resultEl.style.display = "none";
    }
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
        if (authVal && authVal.indexOf("Bearer") > -1) {
          window._fd_capturedToken = authVal.replace("Bearer ", "");
        }
      }
      return window._fd_origFetch.apply(this, args);
    };
  }
  if (!window._fd_origSetHeader) {
    window._fd_origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
      if (name.toLowerCase() === "authorization" && value.indexOf("Bearer") > -1) {
        window._fd_capturedToken = value.replace("Bearer ", "");
      }
      return window._fd_origSetHeader.apply(this, arguments);
    };
  }

  var apiFetch = window._fd_origFetch || window.fetch;

  // ============ STATE ============
  var ids = getIdsFromUrl();
  if (!ids) { log("Navigate to patient Treatments page first!", "err"); return; }

  var API_BASE = "https://amcoplusapi.farmadosis.com/api/installations/" +
    ids.installationId + "/centers/" + ids.centerId + "/patients/" + ids.patientId;

  log("Patient ID: " + ids.patientId, "info");

  // ============ BIND EVENTS for auto-calc ============
  document.getElementById("fd-start-date").addEventListener("change", recalcEndDate);
  document.getElementById("fd-qty").addEventListener("input", recalcEndDate);
  document.getElementById("fd-size").addEventListener("input", recalcEndDate);

  // ============ LOAD TREATMENTS ============
  async function loadTreatments() {
    clearLog();
    log("Loading...", "info");

    var token = getAuthToken();
    if (!token) {
      log("Token not found. Click any link in the app, then try again.", "err");
      return false;
    }

    try {
      var resp = await apiFetch(API_BASE + "/treatments", {
        headers: { Authorization: "Bearer " + token, Accept: "application/json, text/plain, */*" },
      });

      if (!resp.ok) { log("Failed: " + resp.status, "err"); return false; }

      var data = await resp.json();
      window._fd_allTreatments = Array.isArray(data) ? data : (data.data || data.treatments || []);

      log("Found " + window._fd_allTreatments.length + " total", "ok");
      renderList();
      return true;
    } catch (err) {
      log("Error: " + err.message, "err");
      return false;
    }
  }

  function renderList() {
    var activeOnly = document.getElementById("fd-filter-active").checked;
    var list = window._fd_allTreatments || [];

    var filtered = list.filter(function (t) {
      if (activeOnly && t.is_active === false) return false;
      return true;
    });

    window._fd_treatments = filtered;

    var listEl = document.getElementById("fd-treat-list");
    listEl.innerHTML = "";

    var html = '<label><input type="checkbox" id="fd-select-all" checked /> <b>Select All (' + filtered.length + ')</b></label>';

    filtered.forEach(function (t, i) {
      var name = (t.medicine ? t.medicine.name : t.medicine_code) || "Unknown";
      var startDate = extractDate(t.starts_at) || extractDate(t.starts_at_8601) || "—";
      var endDate = extractDate(t.ends_at) || extractDate(t.ends_at_8601) || "—";
      var activeTag = t.is_active ? "" : ' <span class="fd-inactive">[INACTIVE]</span>';

      html += '<div class="fd-treat-item">' +
        '<input type="checkbox" class="fd-treat-cb" data-index="' + i + '" checked />' +
        '<div><strong>' + name + '</strong>' + activeTag +
        '<br/><span class="fd-tid">ID: ' + t.id + ' | Code: ' + (t.medicine_code || "") + '</span>' +
        '<br/><span class="fd-dates">' + startDate + ' &rarr; ' + endDate + '</span>' +
        '</div></div>';
    });

    listEl.innerHTML = html;
    document.getElementById("fd-date-section").style.display = "block";
    document.getElementById("fd-filter-section").style.display = "block";
    document.getElementById("fd-refresh-btn").style.display = "none";

    log("Showing " + filtered.length + (activeOnly ? " active" : "") + " treatments", "info");

    document.getElementById("fd-select-all").onchange = function () {
      var cbs = document.querySelectorAll(".fd-treat-cb");
      for (var c = 0; c < cbs.length; c++) cbs[c].checked = this.checked;
    };
  }

  document.getElementById("fd-filter-active").onchange = function () { renderList(); };

  // ============ BUTTONS ============
  document.getElementById("fd-load-btn").onclick = async function () {
    this.disabled = true;
    await loadTreatments();
    this.disabled = false;
  };

  document.getElementById("fd-refresh-btn").onclick = async function () {
    this.disabled = true;
    await loadTreatments();
    this.disabled = false;
  };

  document.getElementById("fd-update-btn").onclick = async function () {
    var newStart = document.getElementById("fd-start-date").value;
    var newEnd = document.getElementById("fd-end-date").value;

    if (!newStart || !newEnd) { log("Set both dates!", "err"); return; }

    var token = getAuthToken();
    if (!token) { log("Token not found!", "err"); return; }

    var selected = document.querySelectorAll(".fd-treat-cb:checked");
    if (selected.length === 0) { log("No treatments selected", "err"); return; }

    var qty = document.getElementById("fd-qty").value;
    var size = document.getElementById("fd-size").value;
    var confirmMsg = "Update " + selected.length + " treatments?\n" +
      "Start: " + newStart + "\nEnd: " + newEnd;
    if (qty && size) confirmMsg += "\n(QTY: " + qty + " x Size: " + size + " = " + (qty * size) + " days)";

    if (!confirm(confirmMsg)) return;

    this.disabled = true;
    document.getElementById("fd-load-btn").disabled = true;
    document.getElementById("fd-progress-wrap").style.display = "block";
    clearLog();
    log("Updating " + selected.length + " treatments...", "info");

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

        if (!getResp.ok) {
          log("[" + tName + "] Load failed: " + getResp.status, "err");
          failed++; continue;
        }

        var freshData = await getResp.json();

        freshData.starts_at = newStart;
        freshData.ends_at = newEnd;
        freshData.starts_at_8601 = toUTCDate(newStart, false);
        freshData.ends_at_8601 = toUTCDate(newEnd, true);

        var sp = newStart.split("-");
        var sd = new Date(Date.UTC(parseInt(sp[0]), parseInt(sp[1]) - 1, parseInt(sp[2])));
        sd.setUTCDate(sd.getUTCDate() - 1);
        sd.setUTCHours(21, 0, 0, 0);
        freshData.startsAtLocal = sd.toISOString();

        var putResp = await apiFetch(API_BASE + "/treatments/" + t.id + "/update", {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(freshData),
        });

        if (putResp.ok) {
          log("(" + (s + 1) + "/" + total + ") [" + tName + "] Done", "ok");
          success++;
        } else {
          var errText = await putResp.text();
          log("[" + tName + "] Error " + putResp.status, "err");
          failed++;
        }
      } catch (err) {
        log("[" + tName + "] " + err.message, "err");
        failed++;
      }

      await new Promise(function (r) { setTimeout(r, 300); });
    }

    log("", "info");
    log("===== DONE =====", "info");
    log("Success: " + success + " | Failed: " + failed, success > 0 ? "ok" : "err");

    this.disabled = false;
    document.getElementById("fd-load-btn").disabled = false;
    document.getElementById("fd-progress-wrap").style.display = "none";
    document.getElementById("fd-refresh-btn").style.display = "block";
  };

  log("Ready! Click 'Load Treatments'.", "ok");
})();

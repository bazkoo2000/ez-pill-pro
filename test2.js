(async function () {
  // Prevent running twice
  if (document.getElementById("fd-bulk-panel")) {
    document.getElementById("fd-bulk-panel").remove();
    return;
  }

  // ============ UI PANEL ============
  var panel = document.createElement("div");
  panel.id = "fd-bulk-panel";
  panel.innerHTML = `
    <style>
      #fd-bulk-panel {
        position: fixed; top: 0; right: 0; width: 380px; height: 100vh;
        background: #fff; border-left: 3px solid #f57c00; z-index: 999999;
        font-family: Arial, sans-serif; font-size: 14px; overflow-y: auto;
        box-shadow: -4px 0 20px rgba(0,0,0,0.3);
      }
      #fd-bulk-panel .fd-header {
        background: #f57c00; color: #fff; padding: 15px;
        font-size: 16px; font-weight: bold; display: flex;
        justify-content: space-between; align-items: center;
      }
      #fd-bulk-panel .fd-close {
        cursor: pointer; font-size: 22px; background: none;
        border: none; color: #fff; font-weight: bold;
      }
      #fd-bulk-panel .fd-body { padding: 15px; }
      #fd-bulk-panel label { display: block; margin: 10px 0 4px; font-weight: bold; color: #333; }
      #fd-bulk-panel input[type="date"] {
        width: 100%; padding: 8px; border: 1px solid #ccc;
        border-radius: 4px; font-size: 14px; box-sizing: border-box;
      }
      #fd-bulk-panel .fd-btn {
        width: 100%; padding: 12px; margin-top: 15px; border: none;
        border-radius: 6px; font-size: 15px; font-weight: bold;
        cursor: pointer; color: #fff;
      }
      #fd-bulk-panel .fd-btn-load { background: #1976d2; }
      #fd-bulk-panel .fd-btn-update { background: #f57c00; }
      #fd-bulk-panel .fd-btn:hover { opacity: 0.9; }
      #fd-bulk-panel .fd-btn:disabled { background: #ccc; cursor: not-allowed; }
      #fd-bulk-panel .fd-log {
        margin-top: 15px; padding: 10px; background: #f5f5f5;
        border-radius: 4px; max-height: 300px; overflow-y: auto;
        font-size: 12px; line-height: 1.6; direction: ltr;
      }
      #fd-bulk-panel .fd-log .ok { color: green; }
      #fd-bulk-panel .fd-log .err { color: red; }
      #fd-bulk-panel .fd-log .info { color: #1976d2; }
      #fd-bulk-panel .fd-treatments { margin-top: 10px; }
      #fd-bulk-panel .fd-treat-item {
        display: flex; align-items: center; padding: 6px 0;
        border-bottom: 1px solid #eee; gap: 8px;
      }
      #fd-bulk-panel .fd-treat-item input[type="checkbox"] { width: 18px; height: 18px; }
      #fd-bulk-panel .fd-select-all { margin: 10px 0; }
    </style>
    <div class="fd-header">
      <span>Bulk Date Update</span>
      <button class="fd-close" onclick="document.getElementById('fd-bulk-panel').remove()">✕</button>
    </div>
    <div class="fd-body">
      <button class="fd-btn fd-btn-load" id="fd-load-btn">1. Load Treatments</button>

      <div id="fd-treat-list" class="fd-treatments"></div>

      <div id="fd-date-section" style="display:none;">
        <label>New Start Date:</label>
        <input type="date" id="fd-start-date" />

        <label>New End Date:</label>
        <input type="date" id="fd-end-date" />

        <button class="fd-btn fd-btn-update" id="fd-update-btn">2. Update Selected</button>
      </div>

      <div class="fd-log" id="fd-log"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // ============ HELPERS ============
  var logEl = document.getElementById("fd-log");
  function log(msg, cls) {
    logEl.innerHTML += '<div class="' + (cls || "info") + '">' + msg + "</div>";
    logEl.scrollTop = logEl.scrollHeight;
  }

  function getAuthToken() {
    // Try multiple ways to get the token
    // 1. From cookies
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf("token=") === 0 || c.indexOf("access_token=") === 0) {
        return c.split("=").slice(1).join("=");
      }
    }
    // 2. From localStorage
    var keys = ["token", "access_token", "auth_token", "jwt", "bearerToken"];
    for (var k = 0; k < keys.length; k++) {
      var val = localStorage.getItem(keys[k]);
      if (val) {
        try {
          var parsed = JSON.parse(val);
          return parsed.token || parsed.access_token || parsed;
        } catch (e) {
          return val;
        }
      }
    }
    // 3. Try to find in sessionStorage
    for (var k2 = 0; k2 < keys.length; k2++) {
      var val2 = sessionStorage.getItem(keys[k2]);
      if (val2) {
        try {
          var parsed2 = JSON.parse(val2);
          return parsed2.token || parsed2.access_token || parsed2;
        } catch (e2) {
          return val2;
        }
      }
    }
    // 4. Search all localStorage for anything with 'token'
    for (var j = 0; j < localStorage.length; j++) {
      var key = localStorage.key(j);
      if (key.toLowerCase().indexOf("token") > -1 || key.toLowerCase().indexOf("auth") > -1) {
        var v = localStorage.getItem(key);
        try {
          var p = JSON.parse(v);
          if (p.token) return p.token;
          if (p.access_token) return p.access_token;
        } catch (e3) {
          if (v && v.length > 20 && v.length < 500) return v;
        }
      }
    }
    return null;
  }

  function getIdsFromUrl() {
    var match = window.location.href.match(
      /installations\/(\d+)\/centers\/(\d+)\/patients\/(\d+)/
    );
    if (!match) return null;
    return {
      installationId: match[1],
      centerId: match[2],
      patientId: match[3],
    };
  }

  function toUTCDate(dateStr, isEnd) {
    // dateStr = "YYYY-MM-DD"
    // For start: set to previous day 21:00:00 UTC (midnight Saudi = UTC-3)
    // For end: set to day before at 20:59:59 UTC
    var parts = dateStr.split("-");
    var d = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    if (isEnd) {
      d.setUTCDate(d.getUTCDate() - 1);
      return {
        date: d.getUTCFullYear() + "-" +
          String(d.getUTCMonth() + 1).padStart(2, "0") + "-" +
          String(d.getUTCDate()).padStart(2, "0") + " 20:59:59.000000",
        timezone_type: 3,
        timezone: "UTC",
      };
    } else {
      d.setUTCDate(d.getUTCDate() - 1);
      return {
        date: d.getUTCFullYear() + "-" +
          String(d.getUTCMonth() + 1).padStart(2, "0") + "-" +
          String(d.getUTCDate()).padStart(2, "0") + " 21:00:00.000000",
        timezone_type: 3,
        timezone: "UTC",
      };
    }
  }

  // ============ INTERCEPTOR to capture auth token ============
  var capturedToken = null;

  // Override fetch to capture token
  var origFetch = window.fetch;
  window.fetch = function () {
    var args = arguments;
    if (args[1] && args[1].headers) {
      var h = args[1].headers;
      var authVal = null;
      if (h instanceof Headers) {
        authVal = h.get("Authorization");
      } else if (typeof h === "object") {
        authVal = h["Authorization"] || h["authorization"];
      }
      if (authVal && authVal.indexOf("Bearer") > -1) {
        capturedToken = authVal.replace("Bearer ", "");
      }
    }
    return origFetch.apply(this, args);
  };

  // Override XMLHttpRequest to capture token
  var origOpen = XMLHttpRequest.prototype.open;
  var origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (name.toLowerCase() === "authorization" && value.indexOf("Bearer") > -1) {
      capturedToken = value.replace("Bearer ", "");
    }
    return origSetHeader.apply(this, arguments);
  };

  // ============ GLOBALS ============
  var treatments = [];
  var ids = getIdsFromUrl();
  var API_BASE_FRONT = "https://amcoplus.farmadosis.com/installations/" +
    (ids ? ids.installationId : "") + "/centers/" + (ids ? ids.centerId : "") +
    "/patients/" + (ids ? ids.patientId : "");
  var API_BASE = "https://amcoplusapi.farmadosis.com/api/installations/" +
    (ids ? ids.installationId : "") + "/centers/" + (ids ? ids.centerId : "") +
    "/patients/" + (ids ? ids.patientId : "");

  if (!ids) {
    log("❌ Navigate to patient Treatments page first!", "err");
    return;
  }
  log("Patient ID: " + ids.patientId, "info");

  // ============ LOAD TREATMENTS ============
  document.getElementById("fd-load-btn").onclick = async function () {
    log("Loading treatments...", "info");
    this.disabled = true;

    var token = capturedToken || getAuthToken();
    if (!token) {
      log("⚠ Token not found yet. Navigate or click any link in the app, then try again.", "err");
      this.disabled = false;
      return;
    }
    log("✅ Auth token found", "ok");

    try {
      // Fetch patient page to get treatment list
      var resp = await fetch(API_BASE + "/treatments", {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json, text/plain, */*",
        },
      });

      if (!resp.ok) {
        log("❌ Failed to load treatments: " + resp.status, "err");
        this.disabled = false;
        return;
      }

      var data = await resp.json();

      // data could be an array or have a data property
      treatments = Array.isArray(data) ? data : data.data || data.treatments || [];

      if (treatments.length === 0) {
        log("⚠ No treatments found", "err");
        this.disabled = false;
        return;
      }

      log("✅ Found " + treatments.length + " treatments", "ok");

      // Render treatment list
      var listHtml = '<label class="fd-select-all"><input type="checkbox" id="fd-select-all" checked /> Select All</label>';
      treatments.forEach(function (t, i) {
        var name = (t.medicine ? t.medicine.name : t.medicine_code) || "Unknown";
        var start = t.starts_at || "N/A";
        var end = t.ends_at || "N/A";
        listHtml +=
          '<div class="fd-treat-item">' +
          '<input type="checkbox" class="fd-treat-cb" data-index="' + i + '" checked />' +
          "<div><strong>" + name + "</strong><br/>" +
          '<small style="color:#666">' + start + " → " + end + "</small></div></div>";
      });

      document.getElementById("fd-treat-list").innerHTML = listHtml;
      document.getElementById("fd-date-section").style.display = "block";

      // Set default dates
      if (treatments[0]) {
        document.getElementById("fd-start-date").value = treatments[0].starts_at || "";
        document.getElementById("fd-end-date").value = treatments[0].ends_at || "";
      }

      // Select all toggle
      document.getElementById("fd-select-all").onchange = function () {
        var cbs = document.querySelectorAll(".fd-treat-cb");
        for (var c = 0; c < cbs.length; c++) cbs[c].checked = this.checked;
      };
    } catch (err) {
      log("❌ Error: " + err.message, "err");
      this.disabled = false;
    }
  };

  // ============ UPDATE TREATMENTS ============
  document.getElementById("fd-update-btn").onclick = async function () {
    var newStart = document.getElementById("fd-start-date").value;
    var newEnd = document.getElementById("fd-end-date").value;

    if (!newStart || !newEnd) {
      log("❌ Please set both dates", "err");
      return;
    }

    var token = capturedToken || getAuthToken();
    if (!token) {
      log("❌ Token not found!", "err");
      return;
    }

    var selected = document.querySelectorAll(".fd-treat-cb:checked");
    if (selected.length === 0) {
      log("❌ No treatments selected", "err");
      return;
    }

    var confirmMsg = "Update " + selected.length + " treatments?\n" +
      "Start: " + newStart + "\nEnd: " + newEnd;
    if (!confirm(confirmMsg)) return;

    this.disabled = true;
    log("🔄 Updating " + selected.length + " treatments...", "info");

    var success = 0;
    var failed = 0;

    for (var s = 0; s < selected.length; s++) {
      var idx = parseInt(selected[s].getAttribute("data-index"));
      var t = treatments[idx];
      var tName = (t.medicine ? t.medicine.name : t.medicine_code) || "Unknown";

      try {
        // First, get the full treatment data
        var getResp = await fetch(API_BASE + "/treatments/" + t.id, {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json, text/plain, */*",
          },
        });

        if (!getResp.ok) {
          log("❌ [" + tName + "] Failed to load: " + getResp.status, "err");
          failed++;
          continue;
        }

        var fullData = await getResp.json();

        // Update dates
        fullData.starts_at = newStart;
        fullData.ends_at = newEnd;
        fullData.starts_at_8601 = toUTCDate(newStart, false);
        fullData.ends_at_8601 = toUTCDate(newEnd, true);

        // Also update startsAtLocal
        var startParts = newStart.split("-");
        var startD = new Date(Date.UTC(
          parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2])
        ));
        startD.setUTCDate(startD.getUTCDate() - 1);
        startD.setUTCHours(21, 0, 0, 0);
        fullData.startsAtLocal = startD.toISOString();

        // Send update
        var putResp = await fetch(API_BASE + "/treatments/" + t.id + "/update", {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fullData),
        });

        if (putResp.ok) {
          log("✅ [" + tName + "] Updated", "ok");
          success++;
        } else {
          var errText = await putResp.text();
          log("❌ [" + tName + "] Error " + putResp.status + ": " + errText.substring(0, 100), "err");
          failed++;
        }
      } catch (err) {
        log("❌ [" + tName + "] " + err.message, "err");
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(function (r) { setTimeout(r, 500); });
    }

    log("", "info");
    log("========== DONE ==========", "info");
    log("✅ Success: " + success + " | ❌ Failed: " + failed, success > 0 ? "ok" : "err");
    this.disabled = false;
  };

  log("✅ Panel ready. Click 'Load Treatments' to start.", "ok");
})();

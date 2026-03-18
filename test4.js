/**
 * ============================================================
 *  JSON Files Auto Uploader — Vuetify + SweetAlert2
 * ============================================================
 *
 *  الوصف:    أداة لرفع ملفات JSON تلقائياً على مواقع Vuetify
 *            مع تأكيد SweetAlert2 وإعادة محاولة تلقائية
 *
 *  المميزات:
 *    ✅ رفع دفعة ملفات JSON دفعة واحدة
 *    ✅ إعادة محاولة تلقائية عند الفشل (3 محاولات)
 *    ✅ إيقاف مؤقت / استكمال / إيقاف كامل
 *    ✅ واجهة عربية قابلة للسحب
 *    ✅ حقن الملفات عبر DataTransfer (بدون نافذة اختيار)
 *    ✅ سجل عمليات مباشر مع حالة كل ملف
 *
 *  الاستخدام: يُنفَّذ ككود Bookmarklet أو عبر Console
 *  التوافق:  المواقع التي تستخدم Vuetify + SweetAlert2
 *
 *  @version  2.0.0
 *  @license  MIT
 * ============================================================
 */

(async function () {
  "use strict";

  // ╔══════════════════════════════════════════════════════════╗
  // ║  ⚙️  الإعدادات — عدّلها حسب حاجتك                      ║
  // ╚══════════════════════════════════════════════════════════╝

  var CONFIG = {
    // ── التأخيرات (مللي ثانية) ──
    // متوازنة بين السرعة والأمان — لا تقل عن 50ms لتجنب تجمّد المتصفح
    AFTER_ESCAPE_DIALOG:    200,   // بعد إغلاق dialog مفتوح
    AFTER_SELECT_ITEM:      200,   // بعد اختيار عنصر من القائمة المنسدلة
    AFTER_FILE_INJECT:      200,   // بعد حقن الملف في الحقل
    IMPORT_BTN_POLL:        150,   // فترة فحص زر Import (كل X مللي ثانية)
    BEFORE_SWAL_CONFIRM:    100,   // قبل نقر زر تأكيد SweetAlert
    BETWEEN_FILES:          200,   // بين ملف وآخر
    RETRY_BASE:             600,   // تأخير أساسي قبل إعادة المحاولة
    RETRY_INCREMENT:        300,   // زيادة التأخير مع كل محاولة
    FOCUS_SETTLE:           300,   // بعد focus على النافذة قبل البدء
    PAUSE_CHECK_INTERVAL:   150,   // فترة فحص حالة الإيقاف المؤقت

    // ── المهل (Timeouts) ──
    DIALOG_TIMEOUT:        6000,   // مهلة ظهور الـ Dialog
    FILE_INPUT_TIMEOUT:    7000,   // مهلة ظهور حقل الملف
    SWAL_TIMEOUT:         10000,   // مهلة ظهور نافذة SweetAlert
    MENU_TIMEOUT:          2500,   // مهلة ظهور القائمة المنسدلة
    GONE_TIMEOUT:          4000,   // مهلة اختفاء عنصر

    // ── إعادة المحاولة ──
    MAX_RETRIES:               3,  // عدد المحاولات لكل ملف
    IMPORT_BTN_MAX_POLLS:     25,  // أقصى عدد فحوصات لزر Import

    // ── محددات CSS ──
    SELECTORS: {
      UPLOAD_ICON:     ".mdi-briefcase-upload",
      UPLOAD_ALT:      "[title*='upload'], [title*='Upload']",
      ACTIVE_DIALOG:   ".v-dialog--active",
      SELECT_SLOT:     ".v-select__slot",
      SELECT_INPUT:    "input[readonly]",
      SELECT_FALLBACK: ".v-select",
      MENU_ACTIVE:     ".menuable__content__active",
      MENU_ITEM:       ".v-list-item",
      FILE_INPUT:      'input[type="file"]',
      FILE_BTN_1:      ".v-file-input button",
      FILE_BTN_2:      "[class*='file'] button",
      FILE_BTN_3:      "button[type='button']:not(.v-btn--icon)",
      IMPORT_SPANS:    "span.v-btn__content",
      SWAL_CONFIRM:    ".swal2-confirm",
      SWAL_POPUP:      ".swal2-popup",
    },
  };

  // ╔══════════════════════════════════════════════════════════╗
  // ║  🛠️  الدوال المساعدة الأساسية                           ║
  // ╚══════════════════════════════════════════════════════════╝

  /**
   * تأخير بعدد محدد من المللي ثوانِ
   */
  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /**
   * محاكاة نقرة حقيقية — تُرسل سلسلة أحداث pointer + mouse بالترتيب الطبيعي
   */
  function simulateClick(el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var x = r.left + r.width / 2;
    var y = r.top + r.height / 2;
    var opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };

    var events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    events.forEach(function (name) {
      var Ctor = name.includes("pointer") ? PointerEvent : MouseEvent;
      el.dispatchEvent(new Ctor(name, opts));
    });
  }

  /**
   * انتظار ظهور عنصر في الـ DOM (عبر MutationObserver)
   */
  function waitFor(selector, timeout, root) {
    root = root || document;
    timeout = timeout || 8000;
    return new Promise(function (res, rej) {
      var el = root.querySelector(selector);
      if (el) return res(el);

      var ob = new MutationObserver(function () {
        var found = root.querySelector(selector);
        if (found) { ob.disconnect(); res(found); }
      });
      ob.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { ob.disconnect(); rej(new Error("Timeout: " + selector)); }, timeout);
    });
  }

  /**
   * انتظار اختفاء عنصر من الـ DOM
   */
  function waitForGone(selector, timeout) {
    timeout = timeout || CONFIG.GONE_TIMEOUT;
    return new Promise(function (res) {
      if (!document.querySelector(selector)) return res();

      var ob = new MutationObserver(function () {
        if (!document.querySelector(selector)) { ob.disconnect(); res(); }
      });
      ob.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { ob.disconnect(); res(); }, timeout);
    });
  }

  /**
   * البحث عن زر بنصّه (عبر spans داخل أزرار Vuetify)
   */
  function findBtn(txt) {
    var spans = document.querySelectorAll(CONFIG.SELECTORS.IMPORT_SPANS);
    for (var i = 0; i < spans.length; i++) {
      if (spans[i].textContent.trim().toLowerCase() === txt.toLowerCase()) return spans[i];
    }
    return null;
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  📄  حقن الملف عبر DataTransfer                         ║
  // ╚══════════════════════════════════════════════════════════╝

  /**
   * يراقب الـ DOM لظهور أي input[type=file] ويحقن الملف فيه مباشرة
   * بدون فتح نافذة اختيار الملفات
   */
  function injectFile(file) {
    return new Promise(function (res) {
      var done = false;
      var SEL = CONFIG.SELECTORS.FILE_INPUT;

      /** حقن الملف في عنصر input واحد */
      function inject(inp) {
        if (done) return false;
        // منع فتح نافذة اختيار الملفات
        if (!inp._ezhooked) {
          inp._ezhooked = true;
          inp.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); }, true);
        }
        try {
          var dt = new DataTransfer();
          dt.items.add(file);
          inp.files = dt.files;
          inp.dispatchEvent(new Event("change", { bubbles: true }));
          inp.dispatchEvent(new Event("input",  { bubbles: true }));
          done = true;
          return true;
        } catch (e) {
          console.warn("[Uploader] inject err:", e);
          return false;
        }
      }

      // مراقبة ظهور حقول ملفات جديدة
      var ob = new MutationObserver(function () {
        document.querySelectorAll(SEL).forEach(function (inp) {
          if (inject(inp)) { ob.disconnect(); res(inp); }
        });
      });
      ob.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["type"] });

      // جرّب الحقن في أي input موجود حالياً
      var existing = document.querySelector(SEL);
      if (existing && inject(existing)) { ob.disconnect(); res(existing); return; }

      // مهلة أمان
      setTimeout(function () { ob.disconnect(); if (!done) res(null); }, CONFIG.FILE_INPUT_TIMEOUT);
    });
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  🎨  واجهة المستخدم (UI Panel)                          ║
  // ╚══════════════════════════════════════════════════════════╝

  // إزالة أي نسخة سابقة
  var old = document.getElementById("ez-uploader-panel");
  if (old) old.remove();

  var panel = document.createElement("div");
  panel.id = "ez-uploader-panel";
  panel.style.cssText =
    "position:fixed;top:20px;right:20px;z-index:9999999;width:400px;max-width:95vw;" +
    "background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);" +
    "font-family:Cairo,-apple-system,sans-serif;overflow:hidden;direction:rtl";

  panel.innerHTML =
    // ── Header ──
    '<div style="padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;cursor:move" id="ez-up-header">' +
      '<div style="width:38px;height:38px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff">📤</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:15px;font-weight:900;color:#1e1b4b">رفع ملفات JSON</div>' +
        '<div style="font-size:10px;font-weight:700;color:#94a3b8" id="ez-up-subtitle">اختر الملفات للبدء</div>' +
      "</div>" +
      '<button id="ez-up-close" style="width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:#f3f4f6;font-size:14px">✕</button>' +
    "</div>" +

    // ── Body ──
    '<div style="padding:16px 22px">' +
      // شريط التقدم
      '<div id="ez-up-progress-wrap" style="display:none;margin-bottom:14px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
          '<span id="ez-up-progress-text" style="font-size:12px;font-weight:800;color:#1e1b4b">0/0</span>' +
          '<span id="ez-up-progress-pct" style="font-size:12px;font-weight:800;color:#6366f1">0%</span>' +
        "</div>" +
        '<div style="height:8px;background:#f1f5f9;border-radius:8px;overflow:hidden">' +
          '<div id="ez-up-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;transition:width 0.3s ease"></div>' +
        "</div>" +
      "</div>" +

      // الملف الحالي
      '<div id="ez-up-current" style="display:none;padding:10px 14px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.1);border-radius:12px;margin-bottom:12px">' +
        '<div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:2px">الملف الحالي:</div>' +
        '<div id="ez-up-filename" style="font-size:13px;font-weight:800;color:#1e1b4b;direction:ltr;text-align:left"></div>' +
        '<div id="ez-up-step" style="font-size:11px;font-weight:700;color:#6366f1;margin-top:4px"></div>' +
      "</div>" +

      // سجل العمليات
      '<div id="ez-up-log" style="max-height:200px;overflow-y:auto;margin-bottom:12px;font-size:12px"></div>' +

      // أزرار التحكم
      '<button id="ez-up-start" style="width:100%;height:44px;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,0.25)">📂 اختيار الملفات والبدء</button>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
        '<button id="ez-up-pause" style="display:none;flex:1;height:36px;border:1.5px solid rgba(245,158,11,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#f59e0b;background:rgba(245,158,11,0.04)">⏸️ إيقاف مؤقت</button>' +
        '<button id="ez-up-stop"  style="display:none;flex:1;height:36px;border:1.5px solid rgba(239,68,68,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#dc2626;background:rgba(239,68,68,0.04)">⏹️ إيقاف</button>' +
      "</div>" +
    "</div>";

  document.body.appendChild(panel);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  🖱️  سحب النافذة (Drag)                                ║
  // ╚══════════════════════════════════════════════════════════╝

  var hdr = document.getElementById("ez-up-header");
  var dragging = false, startX = 0, startY = 0, panelRight = 20, panelTop = 20;

  hdr.addEventListener("mousedown", function (e) {
    if (e.target.closest("button")) return;
    dragging = true;
    startX = e.clientX + panelRight;
    startY = e.clientY - panelTop;
    e.preventDefault();
  });
  document.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    panelRight = Math.max(0, startX - e.clientX);
    panelTop   = Math.max(0, e.clientY - startY);
    panel.style.right = panelRight + "px";
    panel.style.top   = panelTop + "px";
  });
  document.addEventListener("mouseup", function () { dragging = false; });

  // زر الإغلاق
  document.getElementById("ez-up-close").onclick = function () { panel.remove(); };

  // ╔══════════════════════════════════════════════════════════╗
  // ║  📊  دوال تحديث الواجهة                                 ║
  // ╚══════════════════════════════════════════════════════════╝

  var paused = false, stopped = false;

  var els = {
    subtitle:     document.getElementById("ez-up-subtitle"),
    progressWrap: document.getElementById("ez-up-progress-wrap"),
    progressText: document.getElementById("ez-up-progress-text"),
    progressPct:  document.getElementById("ez-up-progress-pct"),
    bar:          document.getElementById("ez-up-bar"),
    current:      document.getElementById("ez-up-current"),
    filename:     document.getElementById("ez-up-filename"),
    step:         document.getElementById("ez-up-step"),
    log:          document.getElementById("ez-up-log"),
    startBtn:     document.getElementById("ez-up-start"),
    pauseBtn:     document.getElementById("ez-up-pause"),
    stopBtn:      document.getElementById("ez-up-stop"),
  };

  function updateProgress(i, total) {
    var pct = Math.round((i / total) * 100);
    els.progressText.textContent = i + "/" + total;
    els.progressPct.textContent  = pct + "%";
    els.bar.style.width          = pct + "%";
  }

  function setStep(txt) {
    els.step.textContent = txt;
  }

  function updateLog(name, ok, msg, retryNum) {
    var key = CSS.escape(name);
    var existing = els.log.querySelector('[data-file="' + key + '"]');

    if (!existing) {
      existing = document.createElement("div");
      existing.setAttribute("data-file", name);
      existing.style.cssText =
        "padding:8px 12px;border-radius:8px;margin-bottom:4px;" +
        "display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;transition:all 0.3s";
      els.log.appendChild(existing);
    }

    existing.style.background = ok ? "rgba(5,150,105,0.04)" : "rgba(239,68,68,0.04)";
    existing.style.color      = ok ? "#059669" : "#dc2626";

    var retryBadge = retryNum > 0
      ? '<span style="font-size:9px;background:rgba(245,158,11,0.15);color:#d97706;padding:1px 5px;border-radius:4px;margin-right:4px">محاولة ' + (retryNum + 1) + "</span>"
      : "";

    var icon = ok ? "✅" : (msg === "فشل نهائي" ? "❌" : "⏳");

    existing.innerHTML =
      "<span>" + icon + "</span>" +
      retryBadge +
      '<span style="flex:1;direction:ltr;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + name + "</span>" +
      '<span style="font-size:10px;color:#94a3b8;white-space:nowrap">' + (msg || "") + "</span>";

    els.log.scrollTop = els.log.scrollHeight;
  }

  /** انتظار إذا كان المستخدم ضغط إيقاف مؤقت */
  async function checkPause() {
    while (paused && !stopped) {
      await delay(CONFIG.PAUSE_CHECK_INTERVAL);
    }
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  📤  محاولة رفع ملف واحد                                ║
  // ╚══════════════════════════════════════════════════════════╝

  async function attemptUpload(file) {
    var S = CONFIG.SELECTORS;

    // ── 1. إغلاق أي dialog مفتوح ──
    if (document.querySelector(S.ACTIVE_DIALOG)) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }));
      await waitForGone(S.ACTIVE_DIALOG, 3000);
      await delay(CONFIG.AFTER_ESCAPE_DIALOG);
    }

    // ── 2. النقر على زر الرفع ──
    setStep("🔍 البحث عن زر الرفع...");
    var uploadBtn = document.querySelector(S.UPLOAD_ICON) || document.querySelector(S.UPLOAD_ALT);
    if (!uploadBtn) return { ok: false, reason: "زر الرفع غير موجود" };
    simulateClick(uploadBtn);

    // ── 3. انتظار ظهور الـ Dialog ──
    setStep("⏳ انتظار Dialog...");
    var activeDialog;
    try {
      activeDialog = await waitFor(S.ACTIVE_DIALOG, CONFIG.DIALOG_TIMEOUT);
    } catch (e) {
      return { ok: false, reason: "Dialog لم يظهر" };
    }
    await checkPause();
    if (stopped) return { ok: false, reason: "stopped" };

    // ── 4. اختيار النوع من القائمة المنسدلة ──
    setStep("📋 اختيار النوع...");
    try {
      var selectEl =
        activeDialog.querySelector(S.SELECT_SLOT) ||
        activeDialog.querySelector(S.SELECT_INPUT) ||
        activeDialog.querySelector(S.SELECT_FALLBACK);

      if (selectEl) {
        simulateClick(selectEl);
        var menu = await waitFor(S.MENU_ACTIVE, CONFIG.MENU_TIMEOUT);
        var firstItem = menu.querySelector(S.MENU_ITEM);
        if (firstItem) {
          simulateClick(firstItem);
          await waitForGone(S.MENU_ACTIVE, 2000);
        }
        await delay(CONFIG.AFTER_SELECT_ITEM);
      }
    } catch (e) { /* القائمة اختيارية — نتابع */ }
    await checkPause();
    if (stopped) return { ok: false, reason: "stopped" };

    // ── 5. حقن الملف ──
    setStep("📄 انتظار وحقن الملف...");

    // نبدأ المراقبة قبل أي نقرة
    var injectPromise = injectFile(file);

    // نقر زر اختيار الملف في Vuetify (إن وُجد)
    var fileBtn =
      activeDialog.querySelector(S.FILE_BTN_1) ||
      activeDialog.querySelector(S.FILE_BTN_2) ||
      activeDialog.querySelector(S.FILE_BTN_3);
    if (fileBtn) simulateClick(fileBtn);

    var injected = await injectPromise;
    if (!injected) return { ok: false, reason: "حقل الملف غير موجود" };

    await delay(CONFIG.AFTER_FILE_INJECT);
    await checkPause();
    if (stopped) return { ok: false, reason: "stopped" };

    // ── 6. النقر على زر Import ──
    setStep("📥 انتظار زر Import...");
    var pressed = false;
    for (var j = 0; j < CONFIG.IMPORT_BTN_MAX_POLLS; j++) {
      var importSpan = findBtn("Import");
      if (importSpan) {
        var btn = importSpan.closest("button");
        if (btn && !btn.disabled && !btn.hasAttribute("disabled")) {
          simulateClick(btn);
          pressed = true;
          break;
        }
      }
      await delay(CONFIG.IMPORT_BTN_POLL);
    }
    if (!pressed) return { ok: false, reason: "زر Import غير نشط" };
    await checkPause();
    if (stopped) return { ok: false, reason: "stopped" };

    // ── 7. تأكيد SweetAlert ──
    setStep("⏳ انتظار التأكيد...");
    try {
      var swalOk = await waitFor(S.SWAL_CONFIRM, CONFIG.SWAL_TIMEOUT);
      await delay(CONFIG.BEFORE_SWAL_CONFIRM);
      simulateClick(swalOk);
      await waitForGone(S.SWAL_POPUP, CONFIG.GONE_TIMEOUT);
      await waitForGone(S.ACTIVE_DIALOG, 3000);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: "لم يظهر تأكيد" };
    }
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  🔄  رفع ملف واحد مع إعادة المحاولة                    ║
  // ╚══════════════════════════════════════════════════════════╝

  async function uploadWithRetry(file, index, total) {
    els.filename.textContent = file.name;
    updateProgress(index, total);

    for (var attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      if (stopped) return false;
      await checkPause();
      if (stopped) return false;

      // تأخير متصاعد بين المحاولات
      if (attempt > 0) {
        setStep("🔄 إعادة المحاولة " + attempt + "/" + CONFIG.MAX_RETRIES + "...");
        updateLog(file.name, false, "جاري إعادة المحاولة " + attempt + "...", attempt);
        await delay(CONFIG.RETRY_BASE + attempt * CONFIG.RETRY_INCREMENT);
      }

      var result = await attemptUpload(file);

      if (result.ok) {
        updateLog(file.name, true, "", attempt);
        return true;
      }

      if (result.reason === "stopped") return false;

      // فشل مؤقت أو نهائي
      if (attempt < CONFIG.MAX_RETRIES) {
        updateLog(file.name, false, result.reason + "  ← سيعيد", attempt);
      } else {
        updateLog(file.name, false, "فشل نهائي: " + result.reason, attempt);
        return false;
      }
    }
    return false;
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  ▶️  ربط أزرار التحكم                                   ║
  // ╚══════════════════════════════════════════════════════════╝

  els.startBtn.onclick = async function () {
    // اختيار الملفات
    var files = await new Promise(function (res) {
      var inp = document.createElement("input");
      inp.type = "file";
      inp.multiple = true;
      inp.accept = ".json";
      inp.onchange = function () { res(inp.files); };
      inp.click();
    });
    if (!files || !files.length) { els.subtitle.textContent = "لم يتم اختيار ملفات"; return; }

    // تجهيز الواجهة
    var total = files.length;
    els.subtitle.textContent       = "جاري رفع " + total + " ملف...";
    els.progressWrap.style.display = "block";
    els.current.style.display      = "block";
    els.startBtn.style.display     = "none";
    els.pauseBtn.style.display     = "block";
    els.stopBtn.style.display      = "block";
    els.bar.style.background       = "linear-gradient(90deg,#6366f1,#8b5cf6)";
    paused = false;
    stopped = false;
    els.log.innerHTML = "";

    // تأكد إن النافذة مركّزة
    window.focus();
    document.body.click();
    await delay(CONFIG.FOCUS_SETTLE);

    // ── حلقة الرفع الرئيسية ──
    var success = 0, fail = 0;
    for (var i = 0; i < total; i++) {
      if (stopped) break;
      await checkPause();
      if (stopped) break;

      var ok = await uploadWithRetry(files[i], i + 1, total);
      if (ok) success++; else fail++;

      if (i < total - 1) await delay(CONFIG.BETWEEN_FILES);
    }

    // ── ملخص النتائج ──
    updateProgress(total, total);
    els.current.style.display  = "none";
    els.pauseBtn.style.display = "none";
    els.stopBtn.style.display  = "none";
    els.startBtn.style.display = "block";
    els.startBtn.textContent   = "📂 رفع ملفات جديدة";
    els.subtitle.textContent   =
      (stopped ? "تم الإيقاف — " : "اكتمل — ") +
      success + " نجح" +
      (fail > 0 ? " | " + fail + " فشل" : "");
    els.bar.style.background = fail > 0
      ? "linear-gradient(90deg,#f59e0b,#ef4444)"
      : "linear-gradient(90deg,#10b981,#059669)";
  };

  // إيقاف مؤقت / استكمال
  els.pauseBtn.onclick = function () {
    paused = !paused;
    this.textContent        = paused ? "▶️ استكمال" : "⏸️ إيقاف مؤقت";
    this.style.color        = paused ? "#059669" : "#f59e0b";
    els.subtitle.textContent = paused ? "متوقف مؤقتاً..." : "جاري الرفع...";
  };

  // إيقاف كامل
  els.stopBtn.onclick = function () {
    stopped = true;
    els.subtitle.textContent = "جاري الإيقاف...";
  };

})();

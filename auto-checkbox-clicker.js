/**
 * ============================================================
 *  Auto Checkbox Clicker — Vuetify Tables + SweetAlert2
 * ============================================================
 *
 *  الوصف:    أداة للنقر التلقائي على جميع عناصر التحديد (Checkboxes)
 *            في جداول Vuetify مع تأكيد تلقائي لنوافذ SweetAlert2
 *
 *  المميزات:
 *    ✅ نقر تلقائي على كل الـ Checkboxes المرئية في الجدول
 *    ✅ تأكيد تلقائي لنوافذ SweetAlert2 بعد كل نقرة
 *    ✅ تأخير عشوائي بين النقرات لمحاكاة سلوك بشري
 *    ✅ إعادة جلب العناصر كل دورة (يتعامل مع تغيّر الـ DOM)
 *    ✅ تمرير تلقائي للعنصر ليكون مرئياً قبل النقر
 *    ✅ سجل عمليات ملوّن في الـ Console
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
    // عشوائية بين MIN و MAX لمحاكاة سلوك بشري
    CLICK_DELAY_MIN:         80,    // أقل تأخير قبل النقر على الـ Checkbox
    CLICK_DELAY_MAX:        200,    // أعلى تأخير قبل النقر على الـ Checkbox

    CONFIRM_DELAY_MIN:      100,    // أقل تأخير قبل نقر زر التأكيد
    CONFIRM_DELAY_MAX:      250,    // أعلى تأخير قبل نقر زر التأكيد

    POST_CONFIRM_DELAY_MIN: 150,    // أقل تأخير بعد التأكيد (قبل العنصر التالي)
    POST_CONFIRM_DELAY_MAX: 350,    // أعلى تأخير بعد التأكيد

    // ── المهل (Timeouts) ──
    SWAL_TIMEOUT:          5000,    // مهلة انتظار ظهور نافذة SweetAlert2

    // ── محددات CSS ──
    SELECTORS: {
      CHECKBOXES:   "td .v-input--selection-controls__ripple",
      SWAL_CONFIRM: ".swal2-confirm",
    },

    // ── سجل العمليات ──
    ENABLE_LOGGING: true,
  };

  // ╔══════════════════════════════════════════════════════════╗
  // ║  🛠️  الدوال المساعدة                                    ║
  // ╚══════════════════════════════════════════════════════════╝

  /**
   * تأخير عشوائي بين قيمتين (مللي ثانية)
   * @param {number} min - الحد الأدنى
   * @param {number} max - الحد الأعلى
   * @returns {Promise<void>}
   */
  function delay(min, max) {
    var ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /**
   * طباعة رسالة ملوّنة في الـ Console
   * @param {string} message - نص الرسالة
   * @param {"info"|"success"|"warn"|"error"} type - نوع الرسالة
   */
  function log(message, type) {
    if (!CONFIG.ENABLE_LOGGING) return;
    type = type || "info";

    var styles = {
      info:    "color:#2196F3;font-weight:bold",
      success: "color:#4CAF50;font-weight:bold",
      warn:    "color:#FF9800;font-weight:bold",
      error:   "color:#F44336;font-weight:bold",
    };

    console.log("%c[AutoClicker] " + message, styles[type]);
  }

  /**
   * محاكاة نقرة حقيقية على عنصر HTML
   * يُرسل سلسلة أحداث pointer + mouse بالترتيب الطبيعي
   * @param {HTMLElement} el - العنصر المراد النقر عليه
   */
  function simulateClick(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top  + rect.height / 2;
    var opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };

    var events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    events.forEach(function (name) {
      var Ctor = name.includes("pointer") ? PointerEvent : MouseEvent;
      el.dispatchEvent(new Ctor(name, opts));
    });
  }

  /**
   * انتظار ظهور عنصر في الـ DOM عبر MutationObserver
   * @param {string} selector - محدد CSS للعنصر المطلوب
   * @param {number} timeout  - مهلة الانتظار (مللي ثانية)
   * @returns {Promise<HTMLElement>}
   */
  function waitFor(selector, timeout) {
    timeout = timeout || CONFIG.SWAL_TIMEOUT;
    return new Promise(function (res, rej) {
      // تحقق إذا كان العنصر موجوداً مسبقاً
      var el = document.querySelector(selector);
      if (el) return res(el);

      var ob = new MutationObserver(function () {
        var found = document.querySelector(selector);
        if (found) { ob.disconnect(); res(found); }
      });
      ob.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { ob.disconnect(); rej(new Error("Timeout: " + selector)); }, timeout);
    });
  }

  /**
   * جلب جميع أزرار التحديد (Checkboxes) المرئية في الجدول
   * يتجاهل العناصر المخفية (offsetParent === null)
   * @returns {HTMLElement[]}
   */
  function getVisibleCheckboxes() {
    return [].slice.call(document.querySelectorAll(CONFIG.SELECTORS.CHECKBOXES)).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  ▶️  التنفيذ الرئيسي                                    ║
  // ╚══════════════════════════════════════════════════════════╝

  log("▶ بدء التنفيذ...", "info");
  var startTime = performance.now();
  var processedCount = 0;
  var errorCount = 0;

  var checkboxes = getVisibleCheckboxes();
  var totalCount = checkboxes.length;

  log("📋 تم العثور على " + totalCount + " عنصر", "info");

  if (totalCount === 0) {
    log("⚠ لا توجد عناصر للنقر عليها!", "warn");
    return;
  }

  for (var i = 0; i < totalCount; i++) {
    // ── إعادة جلب العناصر في كل دورة (الـ DOM قد يتغير) ──
    checkboxes = getVisibleCheckboxes();
    if (i >= checkboxes.length) {
      log("⚠ العنصر " + (i + 1) + " لم يعد موجوداً، تخطي...", "warn");
      break;
    }

    var checkbox = checkboxes[i];

    // ── تمرير العنصر ليكون مرئياً في منتصف الشاشة ──
    checkbox.scrollIntoView({ behavior: "auto", block: "center" });

    // ── تأخير عشوائي قبل النقر ──
    await delay(CONFIG.CLICK_DELAY_MIN, CONFIG.CLICK_DELAY_MAX);

    // ── النقر على عنصر التحديد ──
    simulateClick(checkbox);
    log("☑ نقر على العنصر " + (i + 1) + "/" + totalCount, "info");

    // ── انتظار نافذة التأكيد والنقر عليها ──
    try {
      var confirmBtn = await waitFor(CONFIG.SELECTORS.SWAL_CONFIRM, CONFIG.SWAL_TIMEOUT);
      await delay(CONFIG.CONFIRM_DELAY_MIN, CONFIG.CONFIRM_DELAY_MAX);
      simulateClick(confirmBtn);
      log("✅ تم تأكيد العنصر " + (i + 1), "success");
      processedCount++;
    } catch (e) {
      log("⚠ لم تظهر نافذة تأكيد للعنصر " + (i + 1), "warn");
      errorCount++;
    }

    // ── تأخير بعد التأكيد قبل الانتقال للعنصر التالي ──
    await delay(CONFIG.POST_CONFIRM_DELAY_MIN, CONFIG.POST_CONFIRM_DELAY_MAX);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  📊  ملخص التنفيذ                                       ║
  // ╚══════════════════════════════════════════════════════════╝

  var elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

  log("═══════════════════════════════════════", "info");
  log("🏁 انتهى التنفيذ في " + elapsed + " ثانية", "success");
  log("   ✅ ناجح: " + processedCount, "success");
  log("   ⚠ أخطاء: " + errorCount, errorCount > 0 ? "warn" : "info");
  log("   📋 إجمالي: " + totalCount, "info");
  log("═══════════════════════════════════════", "info");

})();

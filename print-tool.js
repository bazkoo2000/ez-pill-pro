/**
 * 🖨️ Print RTL Control Tool
 * -------------------------
 * أداة التحكم بالطباعة مع دعم المحاذاة اليمين (RTL)
 *
 * الاستخدام كـ Bookmarklet:
 *   انسخ محتوى المتغير BOOKMARKLET في أسفل الملف
 *   وأنشئ إشارة مرجعية جديدة في المتصفح والصق الكود في حقل URL
 *
 * GitHub: https://github.com/your-username/print-rtl-tool
 * License: MIT
 */

(function () {

  /* =========================================================
     الثوابت
  ========================================================= */
  var SPACER_ID = 'print-spacer-element';
  var STYLE_ID  = 'print-rtl-style';

  /* =========================================================
     وظائف مساعدة
  ========================================================= */

  /** هل الفاصل موجود حالياً؟ */
  function spacerExists() {
    return !!document.getElementById(SPACER_ID);
  }

  /** إضافة فاصل الصفحة */
  function addSpacer() {
    var div = document.createElement('div');
    div.id = SPACER_ID;
    Object.assign(div.style, {
      display       : 'block',
      height        : '0',
      pageBreakAfter: 'always',  // دعم المتصفحات القديمة
      breakAfter    : 'page'     // معيار CSS الحديث
    });
    document.body.prepend(div);
  }

  /** حذف فاصل الصفحة */
  function removeSpacer() {
    var el = document.getElementById(SPACER_ID);
    if (el) el.remove();
  }

  /** حقن CSS لإصلاح محاذاة RTL عند الطباعة */
  function addPrintStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '@media print {',
      '  body {',
      '    direction: rtl !important;',
      '    unicode-bidi: bidi-override !important;',
      '  }',
      '  * {',
      '    text-align: right !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /** إزالة CSS إصلاح RTL */
  function removePrintStyle() {
    var el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  /* =========================================================
     Toast — إشعار سريع
  ========================================================= */
  function toast(msg, bg) {
    var t = document.createElement('div');
    Object.assign(t.style, {
      position    : 'fixed',
      bottom      : '30px',
      right       : '30px',
      background  : bg || '#1a1a2e',
      color       : '#fff',
      padding     : '12px 22px',
      borderRadius: '10px',
      fontSize    : '14px',
      zIndex      : '2147483647',
      boxShadow   : '0 4px 18px rgba(0,0,0,.25)',
      direction   : 'rtl',
      transition  : 'opacity .4s'
    });
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1800);
    setTimeout(function () { t.remove(); }, 2300);
  }

  /* =========================================================
     بناء نافذة الحوار
  ========================================================= */

  /** ستايل الأزرار */
  function btnStyle(bg, small) {
    return [
      'display:block;width:100%;margin-bottom:9px;',
      'padding:' + (small ? '8px' : '11px') + ' 16px;',
      'background:' + bg + ';color:#fff;border:none;',
      'border-radius:8px;cursor:pointer;',
      'font-size:' + (small ? '13' : '14') + 'px;text-align:center;',
      'transition:opacity .15s'
    ].join('');
  }

  /* الطبقة الخلفية */
  var overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position      : 'fixed',
    inset         : '0',
    background    : 'rgba(0,0,0,.55)',
    zIndex        : '2147483647',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
    fontFamily    : 'Segoe UI, Arial, sans-serif',
    direction     : 'rtl'
  });

  /* صندوق الحوار */
  var box = document.createElement('div');
  Object.assign(box.style, {
    background   : '#fff',
    borderRadius : '14px',
    padding      : '28px 32px',
    minWidth     : '340px',
    maxWidth     : '92vw',
    boxShadow    : '0 8px 40px rgba(0,0,0,.28)',
    textAlign    : 'right'
  });

  var active = spacerExists();

  box.innerHTML = [
    '<h3 style="margin:0 0 6px;font-size:17px;color:#1a1a2e">',
      '🖨️ أداة التحكم بالطباعة',
    '</h3>',
    '<p style="margin:0 0 18px;font-size:13px;color:#555">',
      'الحالة الحالية: ',
      '<strong style="color:' + (active ? '#e74c3c' : '#27ae60') + '">',
        active ? '🟥 الفاصل مفعّل' : '🟩 الفاصل غير مفعّل',
      '</strong>',
    '</p>',

    /* زر تبديل الفاصل */
    '<button id="pb-toggle" style="' + btnStyle('#0066cc') + '">',
      active ? '❌ إزالة الفاصل' : '✅ إضافة فاصل صفحة',
    '</button>',

    /* زر تفعيل RTL */
    '<button id="pb-rtl" style="' + btnStyle('#7b2ff7') + '">',
      '🔤 تفعيل محاذاة يمين عند الطباعة',
    '</button>',

    /* زر إلغاء RTL */
    '<button id="pb-rtl-off" style="' + btnStyle('#888') + '">',
      '↩️ إلغاء إصلاح المحاذاة',
    '</button>',

    /* زر الطباعة الفورية */
    '<button id="pb-print" style="' + btnStyle('#27ae60') + '">',
      '🖨️ طباعة الآن',
    '</button>',

    '<hr style="border:none;border-top:1px solid #eee;margin:14px 0">',

    /* زر الإغلاق */
    '<button id="pb-close" style="' + btnStyle('#e74c3c', true) + '">',
      'إغلاق',
    '</button>'
  ].join('');

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  /* =========================================================
     أحداث الأزرار
  ========================================================= */

  document.getElementById('pb-toggle').onclick = function () {
    if (spacerExists()) {
      removeSpacer();
      toast('✅ تم إزالة الفاصل', '#e74c3c');
    } else {
      addSpacer();
      toast('✅ تم إضافة فاصل الصفحة', '#0066cc');
    }
    overlay.remove();
  };

  document.getElementById('pb-rtl').onclick = function () {
    addPrintStyle();
    toast('✅ تم تفعيل محاذاة اليمين للطباعة', '#7b2ff7');
    overlay.remove();
  };

  document.getElementById('pb-rtl-off').onclick = function () {
    removePrintStyle();
    toast('↩️ تم إلغاء إصلاح المحاذاة', '#888');
    overlay.remove();
  };

  document.getElementById('pb-print').onclick = function () {
    overlay.remove();
    setTimeout(function () { window.print(); }, 200);
  };

  document.getElementById('pb-close').onclick = function () {
    overlay.remove();
  };

  /* إغلاق بالنقر خارج الصندوق */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });

})();


/* =========================================================
   BOOKMARKLET — انسخ السطر التالي كاملاً في حقل URL
   للإشارة المرجعية في المتصفح
========================================================= */

// javascript:(function(){var SPACER_ID='print-spacer-element',STYLE_ID='print-rtl-style';function spacerExists(){return!!document.getElementById(SPACER_ID)}function addSpacer(){var div=document.createElement('div');div.id=SPACER_ID;Object.assign(div.style,{display:'block',height:'0',pageBreakAfter:'always',breakAfter:'page'});document.body.prepend(div)}function removeSpacer(){var el=document.getElementById(SPACER_ID);if(el)el.remove()}function addPrintStyle(){if(document.getElementById(STYLE_ID))return;var s=document.createElement('style');s.id=STYLE_ID;s.textContent='@media print{body{direction:rtl!important;unicode-bidi:bidi-override!important;}*{text-align:right!important;}}';document.head.appendChild(s)}function removePrintStyle(){var el=document.getElementById(STYLE_ID);if(el)el.remove()}function toast(msg,bg){var t=document.createElement('div');Object.assign(t.style,{position:'fixed',bottom:'30px',right:'30px',background:bg||'#1a1a2e',color:'#fff',padding:'12px 22px',borderRadius:'10px',fontSize:'14px',zIndex:'2147483647',boxShadow:'0 4px 18px rgba(0,0,0,.25)',direction:'rtl',transition:'opacity .4s'});t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.style.opacity='0'},1800);setTimeout(function(){t.remove()},2300)}function btnStyle(bg,small){return'display:block;width:100%;margin-bottom:9px;padding:'+(small?'8px':'11px')+' 16px;background:'+bg+';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:'+(small?'13':'14')+'px;text-align:center;transition:opacity .15s'}var overlay=document.createElement('div');Object.assign(overlay.style,{position:'fixed',inset:'0',background:'rgba(0,0,0,.55)',zIndex:'2147483647',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Segoe UI,Arial,sans-serif',direction:'rtl'});var box=document.createElement('div');Object.assign(box.style,{background:'#fff',borderRadius:'14px',padding:'28px 32px',minWidth:'340px',maxWidth:'92vw',boxShadow:'0 8px 40px rgba(0,0,0,.28)',textAlign:'right'});var active=spacerExists();box.innerHTML='<h3 style="margin:0 0 6px;font-size:17px;color:#1a1a2e">🖨️ أداة التحكم بالطباعة</h3><p style="margin:0 0 18px;font-size:13px;color:#555">الحالة الحالية: <strong style="color:'+(active?'#e74c3c':'#27ae60')+'">'+(active?'🟥 الفاصل مفعّل':'🟩 الفاصل غير مفعّل')+'</strong></p><button id="pb-toggle" style="'+btnStyle('#0066cc')+'">'+(active?'❌ إزالة الفاصل':'✅ إضافة فاصل صفحة')+'</button><button id="pb-rtl" style="'+btnStyle('#7b2ff7')+'">🔤 تفعيل محاذاة يمين عند الطباعة</button><button id="pb-rtl-off" style="'+btnStyle('#888')+'">↩️ إلغاء إصلاح المحاذاة</button><button id="pb-print" style="'+btnStyle('#27ae60')+'">🖨️ طباعة الآن</button><hr style="border:none;border-top:1px solid #eee;margin:14px 0"><button id="pb-close" style="'+btnStyle('#e74c3c',true)+'">إغلاق</button>';overlay.appendChild(box);document.body.appendChild(overlay);document.getElementById('pb-toggle').onclick=function(){if(spacerExists()){removeSpacer();toast('✅ تم إزالة الفاصل','#e74c3c')}else{addSpacer();toast('✅ تم إضافة فاصل الصفحة','#0066cc')}overlay.remove()};document.getElementById('pb-rtl').onclick=function(){addPrintStyle();toast('✅ تم تفعيل محاذاة اليمين للطباعة','#7b2ff7');overlay.remove()};document.getElementById('pb-rtl-off').onclick=function(){removePrintStyle();toast('↩️ تم إلغاء إصلاح المحاذاة','#888');overlay.remove()};document.getElementById('pb-print').onclick=function(){overlay.remove();setTimeout(function(){window.print()},200)};document.getElementById('pb-close').onclick=function(){overlay.remove()};overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()})})();

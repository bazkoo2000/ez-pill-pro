/**
 * 🖨️ Print RTL Control Tool — v2.0
 * ----------------------------------
 * أداة التحكم بالطباعة مع دعم المحاذاة اليمين (RTL)
 * الحوار يبقى مفتوحاً حتى تضغط "إغلاق" أو تنقر خارجه
 *
 * GitHub: https://github.com/your-username/print-rtl-bookmarklet
 * License: MIT
 */

(function () {

  /* =========================================================
     الثوابت
  ========================================================= */
  var SPACER_ID  = 'print-spacer-element';
  var STYLE_ID   = 'print-rtl-style';
  var OVERLAY_ID = 'print-tool-overlay';

  /* منع تشغيل الأداة مرتين */
  if (document.getElementById(OVERLAY_ID)) return;

  /* =========================================================
     وظائف الفاصل والستايل
  ========================================================= */
  function spacerExists()     { return !!document.getElementById(SPACER_ID); }
  function printStyleExists() { return !!document.getElementById(STYLE_ID);  }

  function addSpacer() {
    if (spacerExists()) return;
    var div = document.createElement('div');
    div.id = SPACER_ID;
    Object.assign(div.style, {
      display       : 'block',
      height        : '0',
      pageBreakAfter: 'always',
      breakAfter    : 'page'
    });
    document.body.prepend(div);
  }

  function removeSpacer() {
    var el = document.getElementById(SPACER_ID);
    if (el) el.remove();
  }

  function addPrintStyle() {
    if (printStyleExists()) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '@media print {',
      '  body {',
      '    direction: rtl !important;',
      '    unicode-bidi: bidi-override !important;',
      '  }',
      '  * { text-align: right !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function removePrintStyle() {
    var el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  /* =========================================================
     Toast
  ========================================================= */
  function toast(msg, bg) {
    var old = document.getElementById('print-tool-toast');
    if (old) old.remove();

    var t = document.createElement('div');
    t.id = 'print-tool-toast';
    Object.assign(t.style, {
      position    : 'fixed',
      bottom      : '30px',
      left        : '50%',
      transform   : 'translateX(-50%)',
      background  : bg || '#1a1a2e',
      color       : '#fff',
      padding     : '10px 24px',
      borderRadius: '10px',
      fontSize    : '13px',
      zIndex      : '2147483648',
      boxShadow   : '0 4px 18px rgba(0,0,0,.3)',
      direction   : 'rtl',
      whiteSpace  : 'nowrap',
      transition  : 'opacity .4s'
    });
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 2000);
    setTimeout(function () { t.remove(); }, 2500);
  }

  /* =========================================================
     وظائف مساعدة للبناء
  ========================================================= */
  function applyBtnStyle(btn, bg, full, width) {
    Object.assign(btn.style, {
      display     : 'inline-block',
      width       : full ? '100%' : (width || 'auto'),
      padding     : '9px 14px',
      background  : bg,
      color       : '#fff',
      border      : 'none',
      borderRadius: '8px',
      cursor      : 'pointer',
      fontSize    : '13px',
      fontWeight  : '600',
      textAlign   : 'center',
      transition  : 'background .2s, transform .15s, box-shadow .2s'
    });
  }

  function divider() {
    var hr = document.createElement('hr');
    Object.assign(hr.style, {
      border    : 'none',
      borderTop : '1px solid #e2e8f0',
      margin    : '14px 0'
    });
    return hr;
  }

  function makeSection(title, desc, buttons) {
    var sec = document.createElement('div');
    sec.style.marginBottom = '4px';

    var t = document.createElement('div');
    Object.assign(t.style, {
      fontSize    : '14px',
      fontWeight  : '700',
      color       : '#1e293b',
      marginBottom: '4px'
    });
    t.textContent = title;

    var d = document.createElement('div');
    Object.assign(d.style, {
      fontSize    : '12px',
      color       : '#64748b',
      lineHeight  : '1.6',
      marginBottom: '10px'
    });
    d.textContent = desc;

    var row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '8px' });

    buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.id = b.id;
      btn.textContent = b.label;
      applyBtnStyle(btn, b.bg, false, 'auto');
      btn.style.flex = '1';
      row.appendChild(btn);
    });

    sec.appendChild(t);
    sec.appendChild(d);
    sec.appendChild(row);
    return sec;
  }

  /* =========================================================
     بناء الواجهة
  ========================================================= */
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position      : 'fixed',
    inset         : '0',
    background    : 'rgba(0,0,0,.5)',
    zIndex        : '2147483647',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
    fontFamily    : 'Segoe UI, Tahoma, Arial, sans-serif',
    direction     : 'rtl'
  });

  var box = document.createElement('div');
  Object.assign(box.style, {
    background   : '#f9f9fb',
    borderRadius : '16px',
    padding      : '0',
    width        : '370px',
    maxWidth     : '95vw',
    boxShadow    : '0 12px 50px rgba(0,0,0,.3)',
    overflow     : 'hidden'
  });

  /* ---- الرأس ---- */
  var header = document.createElement('div');
  Object.assign(header.style, {
    background: 'linear-gradient(135deg,#0066cc,#004499)',
    color     : '#fff',
    padding   : '18px 22px 14px',
    textAlign : 'right'
  });
  header.innerHTML =
    '<div style="font-size:18px;font-weight:700;margin-bottom:4px">' +
      '🖨️ أداة التحكم بالطباعة' +
    '</div>' +
    '<div style="font-size:12px;opacity:.8">' +
      'اضبط الإعدادات ثم اطبع — الحوار يبقى مفتوحاً' +
    '</div>';

  /* ---- شريط الحالة الحية ---- */
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    background    : '#fff',
    borderBottom  : '1px solid #eee',
    padding       : '10px 22px',
    display       : 'flex',
    gap           : '14px',
    justifyContent: 'flex-start'
  });

  function makeBadge(id) {
    var b = document.createElement('span');
    b.id = id;
    Object.assign(b.style, {
      fontSize    : '12px',
      padding     : '3px 10px',
      borderRadius: '20px',
      fontWeight  : '600'
    });
    return b;
  }

  var badgeSpacer = makeBadge('pt-badge-spacer');
  var badgeRTL    = makeBadge('pt-badge-rtl');
  statusBar.appendChild(badgeSpacer);
  statusBar.appendChild(badgeRTL);

  /* ---- المحتوى ---- */
  var bodyEl = document.createElement('div');
  Object.assign(bodyEl.style, { padding: '18px 22px' });

  /*
   * قسم 1 — فاصل الصفحة
   * الهدف: إضافة صفحة فارغة قبل المحتوى عند الطباعة.
   * زر "إضافة" يُفعّل الفاصل — زر "إزالة" يُلغيه.
   */
  var sec1 = makeSection(
    '📄 فاصل الصفحة',
    'يضيف عنصراً غير مرئي في أعلى الصفحة يجعل الطابعة تبدأ المحتوى ' +
    'من الصفحة الثانية — مفيد إذا أردت الصفحة الأولى فارغة.',
    [
      { id: 'pt-add-spacer',    label: '➕ إضافة الفاصل',  bg: '#0066cc' },
      { id: 'pt-remove-spacer', label: '➖ إزالة الفاصل',  bg: '#95a5a6' }
    ]
  );

  /*
   * قسم 2 — محاذاة الطباعة RTL
   * الهدف: إصلاح مشكلة Edge الذي يطبع النص من اليسار رغم أن الصفحة RTL.
   * زر "تفعيل" يحقن CSS خاص بالطباعة فقط — زر "إلغاء" يحذف هذا CSS.
   */
  var sec2 = makeSection(
    '🔤 محاذاة الطباعة (RTL)',
    'يضيف CSS يُجبر المتصفح على طباعة النص من اليمين — يحلّ مشكلة ' +
    'Edge الذي يتجاهل إعداد RTL أحياناً عند التقسيم إلى 4 أقسام.',
    [
      { id: 'pt-rtl-on',  label: '◀ تفعيل اليمين', bg: '#7b2ff7' },
      { id: 'pt-rtl-off', label: '▶ إلغاء اليمين', bg: '#95a5a6' }
    ]
  );

  /* قسم 3 — طباعة */
  var sec3 = document.createElement('div');
  sec3.style.marginTop = '4px';
  var printBtn = document.createElement('button');
  printBtn.id = 'pt-print';
  printBtn.textContent = '🖨️ طباعة الآن';
  applyBtnStyle(printBtn, '#27ae60', true);
  sec3.appendChild(printBtn);

  bodyEl.appendChild(sec1);
  bodyEl.appendChild(divider());
  bodyEl.appendChild(sec2);
  bodyEl.appendChild(divider());
  bodyEl.appendChild(sec3);

  /* ---- الذيل ---- */
  var footer = document.createElement('div');
  Object.assign(footer.style, {
    padding    : '12px 22px',
    borderTop  : '1px solid #eee',
    background : '#fff',
    textAlign  : 'center'
  });
  var closeBtn = document.createElement('button');
  closeBtn.textContent = 'إغلاق';
  applyBtnStyle(closeBtn, '#e74c3c', false, '120px');
  footer.appendChild(closeBtn);

  /* ---- التجميع ---- */
  box.appendChild(header);
  box.appendChild(statusBar);
  box.appendChild(bodyEl);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  /* =========================================================
     تحديث شارات الحالة + تمييز الأزرار النشطة
  ========================================================= */
  function refreshStatus() {
    var sOn = spacerExists();
    var rOn = printStyleExists();

    badgeSpacer.textContent = sOn ? '🟦 فاصل: مفعّل' : '⬜ فاصل: معطّل';
    Object.assign(badgeSpacer.style, {
      background: sOn ? '#dbeafe' : '#f1f5f9',
      color     : sOn ? '#1d4ed8' : '#64748b'
    });

    badgeRTL.textContent = rOn ? '🟪 RTL: مفعّل' : '⬜ RTL: معطّل';
    Object.assign(badgeRTL.style, {
      background: rOn ? '#ede9fe' : '#f1f5f9',
      color     : rOn ? '#6d28d9' : '#64748b'
    });

    highlight('pt-add-spacer',    sOn,  '#0066cc');
    highlight('pt-remove-spacer', !sOn, '#64748b');
    highlight('pt-rtl-on',        rOn,  '#7b2ff7');
    highlight('pt-rtl-off',       !rOn, '#64748b');
  }

  function highlight(id, isActive, activeBg) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.style.background  = isActive ? activeBg : '#cbd5e1';
    btn.style.boxShadow   = isActive ? '0 0 0 3px ' + activeBg + '44' : 'none';
    btn.style.transform   = isActive ? 'scale(1.02)' : 'scale(1)';
  }

  refreshStatus();

  /* =========================================================
     الأحداث — الحوار لا يُغلق إلا بزر "إغلاق"
  ========================================================= */
  document.getElementById('pt-add-spacer').onclick = function () {
    addSpacer();
    toast('✅ تم إضافة فاصل الصفحة', '#0066cc');
    refreshStatus();
  };

  document.getElementById('pt-remove-spacer').onclick = function () {
    removeSpacer();
    toast('🗑️ تم إزالة الفاصل', '#64748b');
    refreshStatus();
  };

  document.getElementById('pt-rtl-on').onclick = function () {
    addPrintStyle();
    toast('✅ تم تفعيل محاذاة اليمين للطباعة', '#7b2ff7');
    refreshStatus();
    /* الحوار يبقى مفتوحاً — يمكن الضغط على زر الطباعة مباشرة */
  };

  document.getElementById('pt-rtl-off').onclick = function () {
    removePrintStyle();
    toast('↩️ تم إلغاء محاذاة اليمين', '#64748b');
    refreshStatus();
  };

  document.getElementById('pt-print').onclick = function () {
    overlay.remove();
    setTimeout(function () { window.print(); }, 200);
  };

  closeBtn.onclick = function () { overlay.remove(); };

  /* إغلاق بالنقر على الخلفية */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });

})();


/* =========================================================
   BOOKMARKLET — انسخ السطر أدناه كاملاً في حقل URL
   عند إنشاء إشارة مرجعية جديدة في المتصفح
========================================================= */

// javascript:(function(){var SPACER_ID='print-spacer-element',STYLE_ID='print-rtl-style',OVERLAY_ID='print-tool-overlay';if(document.getElementById(OVERLAY_ID))return;function spacerExists(){return!!document.getElementById(SPACER_ID)}function printStyleExists(){return!!document.getElementById(STYLE_ID)}function addSpacer(){if(spacerExists())return;var div=document.createElement('div');div.id=SPACER_ID;Object.assign(div.style,{display:'block',height:'0',pageBreakAfter:'always',breakAfter:'page'});document.body.prepend(div)}function removeSpacer(){var el=document.getElementById(SPACER_ID);if(el)el.remove()}function addPrintStyle(){if(printStyleExists())return;var s=document.createElement('style');s.id=STYLE_ID;s.textContent='@media print{body{direction:rtl!important;unicode-bidi:bidi-override!important;}*{text-align:right!important;}}';document.head.appendChild(s)}function removePrintStyle(){var el=document.getElementById(STYLE_ID);if(el)el.remove()}function toast(msg,bg){var old=document.getElementById('print-tool-toast');if(old)old.remove();var t=document.createElement('div');t.id='print-tool-toast';Object.assign(t.style,{position:'fixed',bottom:'30px',left:'50%',transform:'translateX(-50%)',background:bg||'#1a1a2e',color:'#fff',padding:'10px 24px',borderRadius:'10px',fontSize:'13px',zIndex:'2147483648',boxShadow:'0 4px 18px rgba(0,0,0,.3)',direction:'rtl',whiteSpace:'nowrap',transition:'opacity .4s'});t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.style.opacity='0'},2000);setTimeout(function(){t.remove()},2500)}function applyBtnStyle(btn,bg,full,width){Object.assign(btn.style,{display:'inline-block',width:full?'100%':(width||'auto'),padding:'9px 14px',background:bg,color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600',textAlign:'center',transition:'background .2s,transform .15s,box-shadow .2s'})}function divider(){var hr=document.createElement('hr');Object.assign(hr.style,{border:'none',borderTop:'1px solid #e2e8f0',margin:'14px 0'});return hr}function makeSection(title,desc,buttons){var sec=document.createElement('div');sec.style.marginBottom='4px';var t=document.createElement('div');Object.assign(t.style,{fontSize:'14px',fontWeight:'700',color:'#1e293b',marginBottom:'4px'});t.textContent=title;var d=document.createElement('div');Object.assign(d.style,{fontSize:'12px',color:'#64748b',lineHeight:'1.6',marginBottom:'10px'});d.textContent=desc;var row=document.createElement('div');Object.assign(row.style,{display:'flex',gap:'8px'});buttons.forEach(function(b){var btn=document.createElement('button');btn.id=b.id;btn.textContent=b.label;applyBtnStyle(btn,b.bg,false,'auto');btn.style.flex='1';row.appendChild(btn)});sec.appendChild(t);sec.appendChild(d);sec.appendChild(row);return sec}var overlay=document.createElement('div');overlay.id=OVERLAY_ID;Object.assign(overlay.style,{position:'fixed',inset:'0',background:'rgba(0,0,0,.5)',zIndex:'2147483647',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Segoe UI,Tahoma,Arial,sans-serif',direction:'rtl'});var box=document.createElement('div');Object.assign(box.style,{background:'#f9f9fb',borderRadius:'16px',padding:'0',width:'370px',maxWidth:'95vw',boxShadow:'0 12px 50px rgba(0,0,0,.3)',overflow:'hidden'});var header=document.createElement('div');Object.assign(header.style,{background:'linear-gradient(135deg,#0066cc,#004499)',color:'#fff',padding:'18px 22px 14px',textAlign:'right'});header.innerHTML='<div style="font-size:18px;font-weight:700;margin-bottom:4px">🖨️ أداة التحكم بالطباعة</div><div style="font-size:12px;opacity:.8">اضبط الإعدادات ثم اطبع — الحوار يبقى مفتوحاً</div>';var statusBar=document.createElement('div');Object.assign(statusBar.style,{background:'#fff',borderBottom:'1px solid #eee',padding:'10px 22px',display:'flex',gap:'14px',justifyContent:'flex-start'});function makeBadge(id){var b=document.createElement('span');b.id=id;Object.assign(b.style,{fontSize:'12px',padding:'3px 10px',borderRadius:'20px',fontWeight:'600'});return b}var badgeSpacer=makeBadge('pt-badge-spacer'),badgeRTL=makeBadge('pt-badge-rtl');statusBar.appendChild(badgeSpacer);statusBar.appendChild(badgeRTL);var bodyEl=document.createElement('div');Object.assign(bodyEl.style,{padding:'18px 22px'});var sec1=makeSection('📄 فاصل الصفحة','يضيف عنصراً غير مرئي يجعل الطابعة تبدأ المحتوى من الصفحة الثانية — مفيد إذا أردت الصفحة الأولى فارغة.',[{id:'pt-add-spacer',label:'➕ إضافة الفاصل',bg:'#0066cc'},{id:'pt-remove-spacer',label:'➖ إزالة الفاصل',bg:'#95a5a6'}]);var sec2=makeSection('🔤 محاذاة الطباعة (RTL)','يضيف CSS يجبر Edge على طباعة النص من اليمين — يحل مشكلة تجاهل RTL عند التقسيم إلى 4 أقسام.',[{id:'pt-rtl-on',label:'◀ تفعيل اليمين',bg:'#7b2ff7'},{id:'pt-rtl-off',label:'▶ إلغاء اليمين',bg:'#95a5a6'}]);var sec3=document.createElement('div');sec3.style.marginTop='4px';var printBtn=document.createElement('button');printBtn.id='pt-print';printBtn.textContent='🖨️ طباعة الآن';applyBtnStyle(printBtn,'#27ae60',true);sec3.appendChild(printBtn);bodyEl.appendChild(sec1);bodyEl.appendChild(divider());bodyEl.appendChild(sec2);bodyEl.appendChild(divider());bodyEl.appendChild(sec3);var footer=document.createElement('div');Object.assign(footer.style,{padding:'12px 22px',borderTop:'1px solid #eee',background:'#fff',textAlign:'center'});var closeBtn=document.createElement('button');closeBtn.textContent='إغلاق';applyBtnStyle(closeBtn,'#e74c3c',false,'120px');footer.appendChild(closeBtn);box.appendChild(header);box.appendChild(statusBar);box.appendChild(bodyEl);box.appendChild(footer);overlay.appendChild(box);document.body.appendChild(overlay);function refreshStatus(){var sOn=spacerExists(),rOn=printStyleExists();badgeSpacer.textContent=sOn?'🟦 فاصل: مفعّل':'⬜ فاصل: معطّل';Object.assign(badgeSpacer.style,{background:sOn?'#dbeafe':'#f1f5f9',color:sOn?'#1d4ed8':'#64748b'});badgeRTL.textContent=rOn?'🟪 RTL: مفعّل':'⬜ RTL: معطّل';Object.assign(badgeRTL.style,{background:rOn?'#ede9fe':'#f1f5f9',color:rOn?'#6d28d9':'#64748b'});function highlight(id,isActive,activeBg){var btn=document.getElementById(id);if(!btn)return;btn.style.background=isActive?activeBg:'#cbd5e1';btn.style.boxShadow=isActive?'0 0 0 3px '+activeBg+'44':'none';btn.style.transform=isActive?'scale(1.02)':'scale(1)'}highlight('pt-add-spacer',sOn,'#0066cc');highlight('pt-remove-spacer',!sOn,'#64748b');highlight('pt-rtl-on',rOn,'#7b2ff7');highlight('pt-rtl-off',!rOn,'#64748b')}refreshStatus();document.getElementById('pt-add-spacer').onclick=function(){addSpacer();toast('✅ تم إضافة فاصل الصفحة','#0066cc');refreshStatus()};document.getElementById('pt-remove-spacer').onclick=function(){removeSpacer();toast('🗑️ تم إزالة الفاصل','#64748b');refreshStatus()};document.getElementById('pt-rtl-on').onclick=function(){addPrintStyle();toast('✅ تم تفعيل محاذاة اليمين','#7b2ff7');refreshStatus()};document.getElementById('pt-rtl-off').onclick=function(){removePrintStyle();toast('↩️ تم إلغاء محاذاة اليمين','#64748b');refreshStatus()};document.getElementById('pt-print').onclick=function(){overlay.remove();setTimeout(function(){window.print()},200)};closeBtn.onclick=function(){overlay.remove()};overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()})})();

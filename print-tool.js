/**
 * Print RTL Control Tool — v3.1
 * License: MIT
 */
(function () {

  var SPACER_ID  = 'print-spacer-element';
  var STYLE_ID   = 'print-rtl-style';
  var OVERLAY_ID = 'print-tool-overlay';
  var HIDE_ID    = 'print-tool-hide-style';

  if (document.getElementById(OVERLAY_ID)) return;

  /* =========================================================
     إخفاء الحوار أثناء الطباعة (حتى لا يظهر في الورقة)
  ========================================================= */
  var hideStyle = document.createElement('style');
  hideStyle.id = HIDE_ID;
  hideStyle.textContent = '@media print { #' + OVERLAY_ID + ' { display: none !important; } }';
  document.head.appendChild(hideStyle);

  /* =========================================================
     وظائف الفاصل والـ RTL
  ========================================================= */
  function spacerExists()     { return !!document.getElementById(SPACER_ID); }
  function printStyleExists() { return !!document.getElementById(STYLE_ID);  }

  function addSpacer() {
    if (spacerExists()) return;
    var div = document.createElement('div');
    div.id = SPACER_ID;
    Object.assign(div.style, {
      display: 'block', height: '0',
      pageBreakAfter: 'always', breakAfter: 'page'
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
    s.textContent = '@media print { body { direction: rtl !important; unicode-bidi: bidi-override !important; } * { text-align: right !important; } }';
    document.head.appendChild(s);
  }

  function removePrintStyle() {
    var el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  /* =========================================================
     تفعيل الفاصل + RTL تلقائياً عند التشغيل
  ========================================================= */
  addSpacer();
  addPrintStyle();

  /* =========================================================
     Toast
  ========================================================= */
  function toast(msg, bg) {
    var old = document.getElementById('print-tool-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'print-tool-toast';
    Object.assign(t.style, {
      position: 'fixed', bottom: '30px', left: '50%',
      transform: 'translateX(-50%)', background: bg || '#1a1a2e',
      color: '#fff', padding: '10px 24px', borderRadius: '10px',
      fontSize: '13px', zIndex: '2147483648',
      boxShadow: '0 4px 18px rgba(0,0,0,.3)',
      direction: 'rtl', whiteSpace: 'nowrap', transition: 'opacity .4s'
    });
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 2000);
    setTimeout(function () { t.remove(); }, 2500);
  }

  /* =========================================================
     وظائف بناء الواجهة
  ========================================================= */
  function btn(id, label, bg) {
    var b = document.createElement('button');
    b.id = id;
    b.textContent = label;
    Object.assign(b.style, {
      flex: '1', padding: '9px 10px', background: bg,
      color: '#fff', border: 'none', borderRadius: '8px',
      cursor: 'pointer', fontSize: '13px', fontWeight: '600',
      transition: 'background .2s, transform .15s, box-shadow .2s'
    });
    return b;
  }

  function badge(id) {
    var b = document.createElement('span');
    b.id = id;
    Object.assign(b.style, {
      fontSize: '12px', padding: '3px 10px',
      borderRadius: '20px', fontWeight: '600'
    });
    return b;
  }

  function section(title, btns) {
    var sec = document.createElement('div');
    sec.style.marginBottom = '14px';
    var lbl = document.createElement('div');
    Object.assign(lbl.style, {
      fontSize: '12px', color: '#64748b',
      fontWeight: '600', marginBottom: '7px'
    });
    lbl.textContent = title;
    var row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '8px' });
    btns.forEach(function (b) { row.appendChild(b); });
    sec.appendChild(lbl);
    sec.appendChild(row);
    return sec;
  }

  function hr() {
    var d = document.createElement('hr');
    Object.assign(d.style, { border: 'none', borderTop: '1px solid #e2e8f0', margin: '14px 0' });
    return d;
  }

  /* =========================================================
     بناء الحوار
  ========================================================= */
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,.5)',
    zIndex: '2147483647', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', direction: 'rtl'
  });

  var box = document.createElement('div');
  Object.assign(box.style, {
    background: '#f9f9fb', borderRadius: '16px',
    width: '340px', maxWidth: '95vw',
    boxShadow: '0 12px 50px rgba(0,0,0,.3)', overflow: 'hidden'
  });

  /* رأس */
  var head = document.createElement('div');
  Object.assign(head.style, {
    background: 'linear-gradient(135deg,#0066cc,#004499)',
    color: '#fff', padding: '16px 20px', textAlign: 'right'
  });
  head.innerHTML =
    '<div style="font-size:16px;font-weight:700">🖨️ أداة التحكم بالطباعة</div>';

  /* شريط الحالة */
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    background: '#fff', borderBottom: '1px solid #eee',
    padding: '9px 20px', display: 'flex', gap: '10px'
  });
  var bSpacer = badge('pt-b-spacer');
  var bRTL    = badge('pt-b-rtl');
  statusBar.appendChild(bSpacer);
  statusBar.appendChild(bRTL);

  /* جسم */
  var body = document.createElement('div');
  Object.assign(body.style, { padding: '16px 20px' });

  /* --- قسم الفاصل --- */
  var addSpacerBtn    = btn('pt-add',    '➕ إضافة فاصل',   '#0066cc');
  var removeSpacerBtn = btn('pt-remove', '➖ إزالة الفاصل', '#95a5a6');
  body.appendChild(section('📄 فاصل الصفحة — يجعل المحتوى يبدأ من الصفحة الثانية', [addSpacerBtn, removeSpacerBtn]));

  body.appendChild(hr());

  /* --- قسم RTL --- */
  var rtlOnBtn  = btn('pt-rtl-on',  '◀ تفعيل اليمين',  '#7b2ff7');
  var rtlOffBtn = btn('pt-rtl-off', '▶ إلغاء اليمين',  '#95a5a6');
  body.appendChild(section('🔤 محاذاة الطباعة — إصلاح مشكلة Edge مع RTL', [rtlOnBtn, rtlOffBtn]));

  body.appendChild(hr());

  /* --- زر الطباعة --- */
  var printBtn = btn('pt-print', '🖨️ طباعة الآن', '#27ae60');
  printBtn.style.flex = 'unset';
  printBtn.style.width = '100%';
  printBtn.style.padding = '11px';
  printBtn.style.fontSize = '14px';
  body.appendChild(printBtn);

  /* ملاحظة Pages per Sheet */
  var note = document.createElement('div');
  Object.assign(note.style, {
    fontSize: '11px', color: '#94a3b8',
    marginTop: '8px', textAlign: 'center', lineHeight: '1.5'
  });
  note.textContent = '💡 بعد فتح نافذة الطباعة: خصائص ← تخطيط ← صفحات في كل ورقة ← 4';
  body.appendChild(note);

  /* ذيل */
  var foot = document.createElement('div');
  Object.assign(foot.style, {
    padding: '11px 20px', borderTop: '1px solid #eee',
    background: '#fff', textAlign: 'center'
  });
  var closeBtn = btn('pt-close', 'إغلاق', '#e74c3c');
  closeBtn.style.flex = 'unset';
  closeBtn.style.width = '120px';
  closeBtn.style.padding = '8px';
  closeBtn.style.fontSize = '13px';
  foot.appendChild(closeBtn);

  box.appendChild(head);
  box.appendChild(statusBar);
  box.appendChild(body);
  box.appendChild(foot);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  /* =========================================================
     تحديث الحالة
  ========================================================= */
  function refresh() {
    var sOn = spacerExists();
    var rOn = printStyleExists();

    bSpacer.textContent = sOn ? '🟦 فاصل: مفعّل' : '⬜ فاصل: معطّل';
    Object.assign(bSpacer.style, {
      background: sOn ? '#dbeafe' : '#f1f5f9',
      color: sOn ? '#1d4ed8' : '#64748b'
    });

    bRTL.textContent = rOn ? '🟪 RTL: مفعّل' : '⬜ RTL: معطّل';
    Object.assign(bRTL.style, {
      background: rOn ? '#ede9fe' : '#f1f5f9',
      color: rOn ? '#6d28d9' : '#64748b'
    });

    hl('pt-add',     sOn,  '#0066cc');
    hl('pt-remove',  !sOn, '#64748b');
    hl('pt-rtl-on',  rOn,  '#7b2ff7');
    hl('pt-rtl-off', !rOn, '#64748b');
  }

  function hl(id, active, color) {
    var b = document.getElementById(id);
    if (!b) return;
    b.style.background = active ? color : '#cbd5e1';
    b.style.boxShadow  = active ? '0 0 0 3px ' + color + '44' : 'none';
    b.style.transform  = active ? 'scale(1.02)' : 'scale(1)';
  }

  refresh();

  /* =========================================================
     الأحداث
  ========================================================= */
  addSpacerBtn.onclick    = function () { addSpacer();        toast('✅ تم إضافة الفاصل', '#0066cc');          refresh(); };
  removeSpacerBtn.onclick = function () { removeSpacer();     toast('🗑️ تم إزالة الفاصل', '#64748b');         refresh(); };
  rtlOnBtn.onclick        = function () { addPrintStyle();    toast('✅ تم تفعيل محاذاة اليمين', '#7b2ff7');   refresh(); };
  rtlOffBtn.onclick       = function () { removePrintStyle(); toast('↩️ تم إلغاء محاذاة اليمين', '#64748b'); refresh(); };

  printBtn.onclick = function () { overlay.remove(); setTimeout(function () { window.print(); }, 150); };
  closeBtn.onclick = function () { overlay.remove(); };
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });

})();

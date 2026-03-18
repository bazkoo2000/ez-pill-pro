/**
 * Print Page Break Tool — v4.0
 * License: MIT
 */
(function () {

  var SPACER_ID  = 'print-spacer-element';
  var OVERLAY_ID = 'print-tool-overlay';
  var HIDE_ID    = 'print-tool-hide-style';

  if (document.getElementById(OVERLAY_ID)) return;

  /* إخفاء الحوار أثناء الطباعة */
  var hideStyle = document.createElement('style');
  hideStyle.id = HIDE_ID;
  hideStyle.textContent = '@media print { #' + OVERLAY_ID + ' { display: none !important; } }';
  document.head.appendChild(hideStyle);

  /* =========================================================
     وظائف الفاصل
  ========================================================= */
  function spacerExists() { return !!document.getElementById(SPACER_ID); }

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

  /* تفعيل الفاصل تلقائياً عند التشغيل */
  addSpacer();

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
    width: '320px', maxWidth: '95vw',
    boxShadow: '0 12px 50px rgba(0,0,0,.3)', overflow: 'hidden'
  });

  /* رأس */
  var head = document.createElement('div');
  Object.assign(head.style, {
    background: 'linear-gradient(135deg,#0066cc,#004499)',
    color: '#fff', padding: '16px 20px', textAlign: 'right'
  });
  head.innerHTML = '<div style="font-size:16px;font-weight:700">🖨️ أداة التحكم بالطباعة</div>';

  /* شريط الحالة */
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    background: '#fff', borderBottom: '1px solid #eee',
    padding: '9px 20px'
  });
  var bSpacer = document.createElement('span');
  bSpacer.id = 'pt-b-spacer';
  Object.assign(bSpacer.style, {
    fontSize: '12px', padding: '3px 10px',
    borderRadius: '20px', fontWeight: '600'
  });
  statusBar.appendChild(bSpacer);

  /* جسم */
  var body = document.createElement('div');
  Object.assign(body.style, { padding: '16px 20px' });

  /* وصف */
  var desc = document.createElement('div');
  Object.assign(desc.style, {
    fontSize: '12px', color: '#64748b',
    fontWeight: '600', marginBottom: '10px'
  });
  desc.textContent = '📄 فاصل الصفحة — يجعل المحتوى يبدأ من الصفحة الثانية';
  body.appendChild(desc);

  /* أزرار الفاصل */
  var row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', gap: '8px', marginBottom: '16px' });

  function makeBtn(id, label, bg) {
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

  var addBtn    = makeBtn('pt-add',    '➕ إضافة الفاصل',  '#0066cc');
  var removeBtn = makeBtn('pt-remove', '➖ إزالة الفاصل',  '#95a5a6');
  row.appendChild(addBtn);
  row.appendChild(removeBtn);
  body.appendChild(row);

  /* زر الطباعة */
  var printBtn = makeBtn('pt-print', '🖨️ طباعة الآن', '#27ae60');
  printBtn.style.flex = 'unset';
  printBtn.style.width = '100%';
  printBtn.style.padding = '11px';
  printBtn.style.fontSize = '14px';
  body.appendChild(printBtn);

  /* ملاحظة */
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
  var closeBtn = makeBtn('pt-close', 'إغلاق', '#e74c3c');
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
    bSpacer.textContent = sOn ? '🟦 فاصل: مفعّل' : '⬜ فاصل: معطّل';
    Object.assign(bSpacer.style, {
      background: sOn ? '#dbeafe' : '#f1f5f9',
      color: sOn ? '#1d4ed8' : '#64748b'
    });
    var addB = document.getElementById('pt-add');
    var remB = document.getElementById('pt-remove');
    if (addB) {
      addB.style.background = sOn ? '#0066cc' : '#cbd5e1';
      addB.style.boxShadow  = sOn ? '0 0 0 3px #0066cc44' : 'none';
      addB.style.transform  = sOn ? 'scale(1.02)' : 'scale(1)';
    }
    if (remB) {
      remB.style.background = !sOn ? '#64748b' : '#cbd5e1';
      remB.style.boxShadow  = !sOn ? '0 0 0 3px #64748b44' : 'none';
      remB.style.transform  = !sOn ? 'scale(1.02)' : 'scale(1)';
    }
  }

  refresh();

  /* =========================================================
     الأحداث
  ========================================================= */
  addBtn.onclick   = function () { addSpacer();    toast('✅ تم إضافة الفاصل', '#0066cc'); refresh(); };
  removeBtn.onclick = function () { removeSpacer(); toast('🗑️ تم إزالة الفاصل', '#64748b'); refresh(); };
  printBtn.onclick  = function () { overlay.remove(); setTimeout(function () { window.print(); }, 150); };
  closeBtn.onclick  = function () { overlay.remove(); };
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });

})();

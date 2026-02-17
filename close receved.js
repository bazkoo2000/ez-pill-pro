javascript:(function(){

  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // EZ-PILL PRO v5.1 - النسخة النهائية المصلّحة
  // المطور الأصلي: علي الباز
  // ═══════════════════════════════════════════════════════════════════
  //
  // ┌─────────────────────────────────────────────────────────────────┐
  // │  إصلاحات v5.1                                                 │
  // ├─────────────────────────────────────────────────────────────────┤
  // │  ✅ استخدام nextOrdersTableMenu() مباشرة بدل click           │
  // │  ✅ كشف totalRecords تلقائي من أي رابط pagination             │
  // │  ✅ حساب عدد الصفحات تلقائي (totalRecords / perPage)         │
  // │  ✅ انتظار ذكي لتحديث الجدول (MutationObserver + fallback)   │
  // │  ✅ لا يعتمد على أرقام الصفحات الظاهرة — بيجيب كلهم          │
  // │  ✅ Retry تلقائي لو الصفحة مرجعتش بيانات                     │
  // │  ✅ زر إلغاء + كل مميزات v4.1                                │
  // └─────────────────────────────────────────────────────────────────┘

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.1';
  const VER_KEY = 'ezpill_ver';
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    isSyncing: false,
    cancelled: false,
    openedCount: 0,
    tbody: null,
    totalRecords: 0,
    perPage: 0
  };

  // ═══════════════════════════════════════════
  //  كشف totalRecords + perPage تلقائي
  // ═══════════════════════════════════════════
  function detectPaginationInfo() {
    // استخراج totalRecords من onclick
    var allLinks = document.querySelectorAll('a[onclick*="nextOrdersTableMenu"]');
    var totalRecords = 0;
    for (var i = 0; i < allLinks.length; i++) {
      var m = allLinks[i].getAttribute('onclick').match(/nextOrdersTableMenu\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (m) {
        totalRecords = parseInt(m[2]);
        break;
      }
    }

    // حساب عدد الصف في الصفحة الحالية
    var rows = document.querySelectorAll('table tr');
    var dataRows = 0;
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length > 1 && cells[0].innerText.trim().length > 3) dataRows++;
    });

    return {
      totalRecords: totalRecords,
      perPage: dataRows || 10,
      totalPages: totalRecords > 0 && dataRows > 0 ? Math.ceil(totalRecords / dataRows) : 1
    };
  }

  var pageInfo = detectPaginationInfo();
  state.totalRecords = pageInfo.totalRecords;
  state.perPage = pageInfo.perPage;
  var defaultPages = pageInfo.totalPages;

  // ═══════════════════════════════════════════
  //  Toast Notifications
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('ali-toast-box');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-box';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    var colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    var icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    var toast = document.createElement('div');
    toast.style.cssText = 'background:' + colors[type] + ';color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
    toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3500);
  }

  // ─── Update Check ───
  try{var lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(function(){showToast('تم تلقي تحديث جديد 🎉 → v'+VERSION,'success')},1000);}}catch(e){}

  // ═══════════════════════════════════════════
  //  Dialog System
  // ═══════════════════════════════════════════
  function showDialog(opts) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';

      var iconBg = {
        blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        green:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
        amber:'linear-gradient(135deg,#fef3c7,#fde68a)',
        red:'linear-gradient(135deg,#fee2e2,#fecaca)'
      };

      var infoHTML = '';
      if (opts.info && opts.info.length) {
        for (var i = 0; i < opts.info.length; i++) {
          var r = opts.info[i];
          infoHTML += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">' +
            '<span style="color:#64748b;font-weight:600">' + r.label + '</span>' +
            '<span style="font-weight:800;color:' + (r.color || '#1e293b') + ';font-size:12px">' + r.value + '</span></div>';
        }
      }

      var buttonsHTML = '';
      if (opts.buttons && opts.buttons.length) {
        for (var j = 0; j < opts.buttons.length; j++) {
          var btn = opts.buttons[j];
          buttonsHTML += '<button data-idx="' + j + '" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;' + (btn.style || 'background:#f1f5f9;color:#475569') + ';transition:all 0.2s">' + btn.text + '</button>';
        }
      }

      overlay.innerHTML =
        '<div style="background:white;border-radius:24px;width:420px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:Segoe UI,Roboto,sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">' +
          '<div style="padding:24px 24px 0;text-align:center">' +
            '<div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:' + (iconBg[opts.iconColor] || iconBg.blue) + '">' + opts.icon + '</div>' +
            '<div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">' + opts.title + '</div>' +
            '<div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">' + opts.desc + '</div>' +
          '</div>' +
          '<div style="padding:20px 24px">' + infoHTML + (opts.body || '') + '</div>' +
          '<div style="padding:16px 24px 24px;display:flex;gap:10px">' + buttonsHTML + '</div>' +
        '</div>';

      overlay.addEventListener('click', function(e) {
        var btnEl = e.target.closest('[data-idx]');
        if (btnEl) {
          var idx = parseInt(btnEl.getAttribute('data-idx'));
          overlay.remove();
          resolve(opts.buttons[idx].value);
        }
      });

      document.body.appendChild(overlay);
    });
  }

  // ═══════════════════════════════════════════
  //  CSS
  // ═══════════════════════════════════════════
  var styleEl = document.createElement('style');
  styleEl.innerHTML =
    '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}' +
    '@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}' +
    '@keyframes aliSpin{to{transform:rotate(360deg)}}' +
    '@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
    '@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}' +
    '@keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}' +
    '#' + PANEL_ID + '{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#ffffff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:9999999;font-family:Segoe UI,Roboto,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}' +
    '#' + PANEL_ID + '.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}' +
    '#' + PANEL_ID + '.ali-minimized .ali-inner{display:none!important}' +
    '#' + PANEL_ID + '.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(styleEl);

  // ═══════════════════════════════════════════
  //  Panel
  // ═══════════════════════════════════════════
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML =
    '<div class="ali-inner">' +
      '<div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">' +
        '<div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">' +
          '<div style="display:flex;gap:6px">' +
            '<span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer;transition:0.2s">−</span>' +
            '<span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer;transition:0.2s">✕</span>' +
          '</div>' +
          '<h3 style="font-size:20px;font-weight:900;letter-spacing:-0.3px;margin:0">EZ-PILL PRO</h3>' +
        '</div>' +
        '<div style="text-align:right;margin-top:4px;position:relative;z-index:1">' +
          '<span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v5.1</span>' +
          '<span style="display:inline-block;background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700;margin-right:4px">' + state.totalRecords + ' سجل — ' + defaultPages + ' صفحة</span>' +
        '</div>' +
      '</div>' +
      '<div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">' +
          buildStatCard('📊', '0', 'إجمالي', '#8b5cf6', 'stat_total', 'linear-gradient(90deg,#8b5cf6,#a78bfa)') +
          buildStatCard('🔍', '0', 'مطابق', '#10b981', 'stat_match', 'linear-gradient(90deg,#10b981,#34d399)') +
          buildStatCard('🚀', '0', 'تم فتحه', '#3b82f6', 'stat_opened', 'linear-gradient(90deg,#3b82f6,#60a5fa)') +
        '</div>' +
        '<div id="ali_main_body">' +
          '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
              '<span style="font-size:13px;font-weight:700;color:#475569">📄 عدد الصفحات</span>' +
              '<div style="display:flex;align-items:center;gap:6px">' +
                '<span style="font-size:12px;color:#94a3b8;font-weight:600">صفحة</span>' +
                '<input type="number" id="p_lim" value="' + defaultPages + '" min="1" style="width:48px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:Segoe UI,Roboto,sans-serif">' +
              '</div>' +
            '</div>' +
            '<div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">' +
              '<div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)"></div>' +
            '</div>' +
          '</div>' +
          '<div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">' +
            '<span>✅</span><span>جاهز — تم كشف ' + state.totalRecords + ' سجل في ' + defaultPages + ' صفحة</span>' +
          '</div>' +
          '<button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">' +
            '🚀 بدء تجميع الكل (' + state.totalRecords + ' طلب)' +
          '</button>' +
          '<button id="ali_cancel" style="display:none;width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:13px;font-family:Segoe UI,Roboto,sans-serif;margin-top:8px;background:#fef2f2;border:2px solid #fecaca;color:#dc2626;transition:all 0.3s">' +
            '⛔ إلغاء التجميع' +
          '</button>' +
        '</div>' +
        '<div style="text-align:center;padding:14px 0 4px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(panel);

  // ═══════════════════════════════════════════
  //  Helper Functions
  // ═══════════════════════════════════════════
  function buildStatCard(icon, val, label, color, id, border) {
    return '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:0;right:0;left:0;height:3px;background:' + border + '"></div>' +
      '<div style="font-size:18px;margin-bottom:4px">' + icon + '</div>' +
      '<div id="' + id + '" style="font-size:22px;font-weight:900;color:' + color + ';line-height:1;margin-bottom:2px">' + val + '</div>' +
      '<div style="font-size:10px;color:#94a3b8;font-weight:700">' + label + '</div>' +
    '</div>';
  }

  function setStatus(text, type) {
    var el = document.getElementById('status-msg');
    if (!el) return;
    var configs = {
      ready:   { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'✅' },
      working: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', icon:'spinner' },
      error:   { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', icon:'❌' },
      done:    { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'🎉' },
      sync:    { bg:'#fefce8', color:'#a16207', border:'#fef08a', icon:'spinner' }
    };
    var c = configs[type] || configs.ready;
    var iconHTML = c.icon === 'spinner'
      ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : '<span>' + c.icon + '</span>';
    el.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:' + c.bg + ';color:' + c.color + ';border:1px solid ' + c.border + ';transition:all 0.3s';
    el.innerHTML = iconHTML + '<span>' + text + '</span>';
  }

  function animNum(id, val) {
    var el = document.getElementById(id);
    if (!el || el.innerText === String(val)) return;
    requestAnimationFrame(function() {
      el.innerText = val;
      el.style.animation = 'aliCountUp 0.4s';
      setTimeout(function() { el.style.animation = ''; }, 400);
    });
  }

  function updateStats(matchCount) {
    animNum('stat_total', state.savedRows.length);
    animNum('stat_match', matchCount !== undefined ? matchCount : state.savedRows.length);
    animNum('stat_opened', state.openedCount);
  }

  function debounce(fn, delay) {
    var timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  // ═══════════════════════════════════════════
  //  Header Events
  // ═══════════════════════════════════════════
  panel.addEventListener('click', function(e) {
    if (panel.classList.contains('ali-minimized')) {
      panel.classList.remove('ali-minimized');
      e.stopPropagation();
    }
  });
  document.getElementById('ali_close').addEventListener('click', function(e) {
    e.stopPropagation();
    state.cancelled = true;
    panel.style.animation = 'aliSlideIn 0.3s reverse';
    setTimeout(function() { panel.remove(); }, 280);
  });
  document.getElementById('ali_min').addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.add('ali-minimized');
  });

  // ═══════════════════════════════════════════
  //  استخراج البيانات من الجدول الحالي
  // ═══════════════════════════════════════════
  function collectFromCurrentPage() {
    var newCount = 0;
    var noArgsCount = 0;
    document.querySelectorAll('table tr').forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        var key = cells[0].innerText.trim();
        if (key.length > 3 && !state.visitedSet.has(key)) {
          state.visitedSet.add(key);

          var args = null;
          var label = row.querySelector('label[onclick^="getDetails"]');
          if (label) {
            var m = label.getAttribute('onclick').match(/'(.*?)','(.*?)','(.*?)','(.*?)'/);
            if (m) args = [m[1], m[2], m[3], m[4]];
          }

          if (!args) noArgsCount++;

          var clone = row.cloneNode(true);
          state.savedRows.push({
            id: key,
            onl: cells[1].innerText.trim(),
            node: clone,
            args: args
          });
          newCount++;
        }
      }
    });
    return { newCount: newCount, noArgs: noArgsCount };
  }

  // ═══════════════════════════════════════════
  //  انتظار تحديث الجدول بعد nextOrdersTableMenu
  // ═══════════════════════════════════════════
  function waitForTableUpdate(previousFirstCell, timeout) {
    timeout = timeout || 15000;
    return new Promise(function(resolve) {
      var startTime = Date.now();

      // طريقة 1: MutationObserver
      var resolved = false;
      var mainTable = document.querySelector('table tbody') || document.querySelector('table');

      if (mainTable) {
        var observer = new MutationObserver(function() {
          var currentFirst = getFirstCellText();
          if (currentFirst !== previousFirstCell) {
            resolved = true;
            observer.disconnect();
            // انتظر شوية عشان الـ DOM يستقر
            setTimeout(resolve, 500);
          }
        });
        observer.observe(mainTable, { childList: true, subtree: true, characterData: true });
      }

      // طريقة 2: Polling كـ fallback
      var pollInterval = setInterval(function() {
        if (resolved) {
          clearInterval(pollInterval);
          return;
        }

        var currentFirst = getFirstCellText();
        if (currentFirst !== previousFirstCell) {
          resolved = true;
          if (mainTable) try { /* observer might be disconnected */ } catch(e) {}
          clearInterval(pollInterval);
          setTimeout(resolve, 500);
          return;
        }

        // Timeout
        if (Date.now() - startTime > timeout) {
          resolved = true;
          clearInterval(pollInterval);
          setTimeout(resolve, 500);
        }
      }, 300);
    });
  }

  function getFirstCellText() {
    var firstRow = document.querySelector('table tr td');
    return firstRow ? firstRow.innerText.trim() : '';
  }

  // ═══════════════════════════════════════════
  //  المسح الرئيسي — nextOrdersTableMenu
  // ═══════════════════════════════════════════
  var totalNoArgs = 0;

  async function scanAllPages(totalPages, isSync) {
    state.isProcessing = true;
    state.cancelled = false;
    totalNoArgs = 0;

    var fill = document.getElementById('p-fill');
    var cancelBtn = document.getElementById('ali_cancel');
    if (cancelBtn) cancelBtn.style.display = 'block';

    var totalRec = state.totalRecords;

    // ─── الصفحة 1: اجمع من الجدول الحالي ───
    if (fill) fill.style.width = ((1 / totalPages) * 100) + '%';
    setStatus(isSync
      ? 'مزامنة الصفحة 1 من ' + totalPages + '...'
      : 'تحليل الصفحة 1 من ' + totalPages + ' ... تم رصد ' + state.savedRows.length + ' طلب',
      isSync ? 'sync' : 'working');

    // لو مش في الصفحة الأولى، روح للأولى
    if (typeof nextOrdersTableMenu === 'function') {
      var prevCell = getFirstCellText();
      try {
        nextOrdersTableMenu(1, totalRec);
        await waitForTableUpdate(prevCell);
      } catch(e) {
        // لو فشل، نكمل من الصفحة الحالية
      }
    }

    var result1 = collectFromCurrentPage();
    totalNoArgs += result1.noArgs;
    updateStats();

    // ─── الصفحات 2 إلى totalPages ───
    var failedPages = [];

    for (var p = 2; p <= totalPages; p++) {
      if (state.cancelled) {
        showToast('تم إلغاء التجميع', 'warning');
        break;
      }

      if (fill) fill.style.width = ((p / totalPages) * 100) + '%';
      setStatus(isSync
        ? 'مزامنة الصفحة ' + p + ' من ' + totalPages + ' (' + state.savedRows.length + ' طلب)...'
        : 'تحليل الصفحة ' + p + ' من ' + totalPages + ' ... تم رصد ' + state.savedRows.length + ' طلب',
        isSync ? 'sync' : 'working');

      var prevText = getFirstCellText();
      var pageSuccess = false;

      // محاولة 1: nextOrdersTableMenu مباشرة
      for (var attempt = 1; attempt <= 3; attempt++) {
        if (state.cancelled) break;
        try {
          nextOrdersTableMenu(p, totalRec);
          await waitForTableUpdate(prevText, attempt === 3 ? 20000 : 12000);

          var newFirst = getFirstCellText();
          if (newFirst !== prevText || attempt === 3) {
            var result = collectFromCurrentPage();
            totalNoArgs += result.noArgs;
            updateStats();
            pageSuccess = true;
            break;
          }
        } catch(e) {
          // انتظر وجرب تاني
          await new Promise(function(r) { setTimeout(r, 2000 * attempt); });
        }
      }

      if (!pageSuccess && !state.cancelled) {
        failedPages.push(p);
        showToast('تعذر تحميل الصفحة ' + p + ' — تم التخطي', 'warning');
      }

      // تأخير بسيط بين الصفحات
      if (p < totalPages && !state.cancelled) {
        await new Promise(function(r) { setTimeout(r, 800); });
      }
    }

    // ─── إعادة محاولة الصفحات الفاشلة ───
    if (failedPages.length > 0 && !state.cancelled) {
      showToast('إعادة محاولة ' + failedPages.length + ' صفحة...', 'info');
      for (var fi = 0; fi < failedPages.length; fi++) {
        if (state.cancelled) break;
        var fp = failedPages[fi];
        setStatus('إعادة محاولة الصفحة ' + fp + '...', 'working');
        await new Promise(function(r) { setTimeout(r, 3000); });
        try {
          var prev = getFirstCellText();
          nextOrdersTableMenu(fp, totalRec);
          await waitForTableUpdate(prev, 20000);
          var retryResult = collectFromCurrentPage();
          totalNoArgs += retryResult.noArgs;
          updateStats();
          failedPages.splice(fi, 1);
          fi--;
        } catch(e2) { /* لسه فاشلة */ }
      }
    }

    finishScan(isSync, failedPages);
  }

  // ═══════════════════════════════════════════
  //  Finish Scan — Build Search UI
  // ═══════════════════════════════════════════
  function finishScan(isSync, failedPages) {
    state.isProcessing = false;
    state.isSyncing = false;

    var cancelBtn = document.getElementById('ali_cancel');
    if (cancelBtn) cancelBtn.style.display = 'none';

    // ترتيب الجدول الأصلي
    var tables = document.querySelectorAll('table');
    var target = tables[0];
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].innerText.length > target.innerText.length) target = tables[t];
    }
    state.tbody = target.querySelector('tbody') || target;
    state.tbody.innerHTML = '';
    for (var i = 0; i < state.savedRows.length; i++) {
      state.savedRows[i].node.style.cursor = 'pointer';
      state.tbody.appendChild(state.savedRows[i].node);
    }

    updateStats(state.savedRows.length);

    if (totalNoArgs > 0) {
      showToast(totalNoArgs + ' طلب بدون بيانات فتح (لن يتم فتحها)', 'warning');
    }
    if (failedPages && failedPages.length > 0) {
      showToast('⚠️ ' + failedPages.length + ' صفحة لم يتم تحميلها: ' + failedPages.join(', '), 'error');
    }

    if (isSync) {
      setStatus('تمت المزامنة — ' + state.savedRows.length + ' طلب', 'done');
      showToast('تمت المزامنة: ' + state.savedRows.length + ' طلب', 'success');
    } else {
      setStatus('تم التجميع — ' + state.savedRows.length + ' طلب جاهز', 'done');
      showToast('تم تجميع ' + state.savedRows.length + ' طلب بنجاح ✅', 'success');
    }

    // بناء واجهة البحث
    var mainBody = document.getElementById('ali_main_body');
    mainBody.innerHTML =
      '<div style="margin-bottom:10px">' +
        '<div style="position:relative">' +
          '<span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:900;color:#94a3b8;z-index:1;pointer-events:none;font-family:monospace">0</span>' +
          '<input type="text" id="ali_sI" placeholder="أدخل الأرقام بعد الـ 0 (كود الصيدلية = أول 4 أرقام)..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Segoe UI,monospace;outline:none;background:#f8fafc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700;box-sizing:border-box">' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:10px">' +
        '<div style="position:relative">' +
          '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;z-index:1;pointer-events:none">🔗</span>' +
          '<input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:Segoe UI,Roboto,sans-serif;outline:none;background:#f8fafc;color:#1e293b;direction:rtl;transition:all 0.25s;font-weight:600;box-sizing:border-box">' +
        '</div>' +
      '</div>' +
      '<div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:2px 0 12px">' +
        'عرض ' + state.savedRows.length + ' من ' + state.savedRows.length + ' نتيجة' +
      '</div>' +
      '<button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.3s;margin-bottom:8px">' +
        '⚡ ابحث أولاً ثم افتح المطابق' +
      '</button>' +
      '<button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:13px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">' +
        '🔄 مزامنة (تحديث + حذف المُغلق + إضافة الجديد)' +
      '</button>';

    // ─── Search Logic ───
    var sI = document.getElementById('ali_sI');
    var sO = document.getElementById('ali_sO');
    var searchCount = document.getElementById('ali_search_count');
    var openBtn = document.getElementById('ali_btn_open');
    var currentMatches = [];

    function filterResults() {
      var rawInvoice = sI.value.trim();
      var invoiceSearch = rawInvoice !== '' ? '0' + rawInvoice : '';
      var orderSearch = sO.value.trim().toLowerCase();

      state.tbody.innerHTML = '';
      var shown = 0;
      currentMatches = [];
      var hasFilter = invoiceSearch !== '' || orderSearch !== '';

      for (var i = 0; i < state.savedRows.length; i++) {
        var row = state.savedRows[i];
        var matchInvoice = invoiceSearch !== '' && row.id.startsWith(invoiceSearch);
        var matchOrder = orderSearch !== '' && row.onl.toLowerCase().indexOf(orderSearch) !== -1;
        var show = hasFilter ? (matchInvoice || matchOrder) : true;

        if (show) {
          state.tbody.appendChild(row.node);
          shown++;
          if (hasFilter) currentMatches.push(row);
        }
      }

      searchCount.innerText = 'عرض ' + shown + ' من ' + state.savedRows.length + ' نتيجة';
      updateStats(shown);

      if (hasFilter && currentMatches.length > 0) {
        var openable = currentMatches.filter(function(r) { return r.args !== null; }).length;
        openBtn.innerHTML = '⚡ فتح المطابق (' + openable + ' طلب)';
        openBtn.style.opacity = '1';
        openBtn.style.cursor = 'pointer';
      } else if (hasFilter && currentMatches.length === 0) {
        openBtn.innerHTML = '⚡ لا توجد نتائج مطابقة';
        openBtn.style.opacity = '0.5';
        openBtn.style.cursor = 'not-allowed';
      } else {
        openBtn.innerHTML = '⚡ ابحث أولاً ثم افتح المطابق';
        openBtn.style.opacity = '0.7';
        openBtn.style.cursor = 'not-allowed';
      }

      if (rawInvoice.length > 0 && shown === 0) {
        sI.style.borderColor = '#ef4444'; sI.style.background = '#fef2f2';
      } else if (rawInvoice.length > 0 && shown > 0) {
        sI.style.borderColor = '#10b981'; sI.style.background = '#f0fdf4';
      } else {
        sI.style.borderColor = '#e2e8f0'; sI.style.background = '#f8fafc';
      }

      if (orderSearch.length > 0 && shown === 0) {
        sO.style.borderColor = '#ef4444'; sO.style.background = '#fef2f2';
      } else if (orderSearch.length > 0 && shown > 0) {
        sO.style.borderColor = '#10b981'; sO.style.background = '#f0fdf4';
      } else {
        sO.style.borderColor = '#e2e8f0'; sO.style.background = '#f8fafc';
      }
    }

    var debouncedFilter = debounce(filterResults, 150);
    sI.addEventListener('input', debouncedFilter);
    sO.addEventListener('input', debouncedFilter);

    // ─── Open Button ───
    openBtn.addEventListener('click', async function() {
      var rawInvoice = sI.value.trim();
      var orderSearch = sO.value.trim().toLowerCase();
      var hasFilter = rawInvoice !== '' || orderSearch !== '';

      if (!hasFilter) {
        showToast('ابحث أولاً برقم الفاتورة أو رقم الطلب!', 'warning');
        sI.focus();
        sI.style.animation = 'aliBlink 0.5s 3';
        setTimeout(function() { sI.style.animation = ''; }, 1500);
        return;
      }

      var openable = currentMatches.filter(function(r) { return r.args !== null; });
      var skipped = currentMatches.length - openable.length;

      if (openable.length === 0) {
        if (skipped > 0) showToast(skipped + ' طلب مطابق لكن بدون بيانات فتح!', 'error');
        else showToast('لا توجد طلبات مطابقة!', 'warning');
        return;
      }

      var dialogInfo = [
        { label: 'عدد الطلبات', value: openable.length + ' طلب', color: '#10b981' },
        { label: 'الوقت المتوقع', value: '~' + Math.ceil(openable.length * 1.2) + ' ثانية', color: '#f59e0b' }
      ];
      if (rawInvoice) dialogInfo.push({ label: 'فلتر الفاتورة', value: '0' + rawInvoice, color: '#3b82f6' });
      if (orderSearch) dialogInfo.push({ label: 'فلتر الطلب', value: orderSearch, color: '#8b5cf6' });
      if (skipped > 0) dialogInfo.push({ label: '⚠️ تم تخطي', value: skipped + ' طلب (بدون بيانات)', color: '#ef4444' });

      var result = await showDialog({
        icon: '📂', iconColor: 'blue',
        title: 'فتح الطلبات المطابقة',
        desc: 'سيتم فتح ' + openable.length + ' طلب في نوافذ منفصلة',
        info: dialogInfo,
        buttons: [
          { text: 'إلغاء', value: 'cancel' },
          { text: '✅ تأكيد الفتح', value: 'confirm', style: 'background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 12px rgba(16,185,129,0.3)' }
        ]
      });

      if (result !== 'confirm') return;

      openBtn.disabled = true;
      openBtn.style.opacity = '0.6';
      openBtn.style.cursor = 'not-allowed';

      var opened = 0;
      var failed = 0;
      var base = window.location.origin + "/ez_pill_web/getEZPill_Details";

      for (var idx = 0; idx < openable.length; idx++) {
        var item = openable[idx];
        var url = base + "?onlineNumber=" + item.args[0].replace("ERX", "") +
          "&Invoice=" + item.args[1] + "&typee=" + item.args[2] + "&head_id=" + item.args[3];

        try {
          var w = window.open(url, "_blank");
          if (w) { opened++; state.openedCount++; } else { failed++; }
        } catch (e) { failed++; }

        openBtn.innerHTML = '🚀 جاري الفتح (' + (idx + 1) + '/' + openable.length + ')';
        setStatus('فتح ' + (idx + 1) + ' من ' + openable.length + ': ' + (item.onl || item.id), 'working');
        updateStats();

        if (idx < openable.length - 1) {
          await new Promise(function(resolve) { setTimeout(resolve, 1200); });
        }
      }

      if (failed > 0) {
        await showDialog({
          icon: '⚠️', iconColor: 'red', title: 'تنبيه',
          desc: 'تعذر فتح ' + failed + ' نافذة — تأكد من السماح بالنوافذ المنبثقة',
          info: [
            { label: 'تم فتحها', value: opened.toString(), color: '#10b981' },
            { label: 'فشلت', value: failed.toString(), color: '#ef4444' }
          ],
          buttons: [{ text: '👍 حسناً', value: 'ok', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white' }]
        });
      } else {
        await showDialog({
          icon: '🎉', iconColor: 'green', title: 'تم بنجاح!',
          desc: 'تم فتح جميع الطلبات المطابقة',
          info: [
            { label: 'تم فتحها', value: opened + ' طلب', color: '#10b981' },
            { label: 'إجمالي المفتوح', value: state.openedCount + ' طلب', color: '#3b82f6' }
          ],
          buttons: [{ text: '👍 إغلاق', value: 'ok', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white' }]
        });
      }

      showToast('تم فتح ' + opened + ' طلب', opened > 0 ? 'success' : 'error');
      setStatus('تم فتح ' + opened + ' — الإجمالي: ' + state.openedCount, 'done');
      openBtn.disabled = false;
      filterResults();
    });

    // ─── Sync Button ───
    document.getElementById('ali_btn_sync').addEventListener('click', async function() {
      if (state.isSyncing || state.isProcessing) {
        showToast('المزامنة شغالة بالفعل — انتظر!', 'warning');
        return;
      }

      var syncBtn = this;
      var oldCount = state.savedRows.length;

      // إعادة كشف الـ pagination
      var freshInfo = detectPaginationInfo();
      state.totalRecords = freshInfo.totalRecords;
      state.perPage = freshInfo.perPage;

      var result = await showDialog({
        icon: '🔄', iconColor: 'blue', title: 'المزامنة الذكية',
        desc: 'سيتم إعادة فحص الصفحات لتحديث القائمة',
        info: [
          { label: 'الطلبات الحالية', value: oldCount.toString(), color: '#8b5cf6' },
          { label: 'العملية', value: 'حذف المُغلق + إضافة الجديد', color: '#3b82f6' },
          { label: 'الصفحات', value: freshInfo.totalPages + ' صفحة (' + freshInfo.totalRecords + ' سجل)', color: '#f59e0b' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel' },
          { text: '🔄 بدء المزامنة', value: 'confirm', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 12px rgba(59,130,246,0.3)' }
        ]
      });

      if (result !== 'confirm') return;

      state.isSyncing = true;
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري المزامنة...';

      state.visitedSet.clear();
      state.savedRows = [];
      totalNoArgs = 0;

      await scanAllPages(freshInfo.totalPages, true);
    });
  }

  // ═══════════════════════════════════════════
  //  Cancel Button
  // ═══════════════════════════════════════════
  document.getElementById('ali_cancel').addEventListener('click', function() {
    state.cancelled = true;
    state.isProcessing = false;
    state.isSyncing = false;
    setStatus('تم الإلغاء — ' + state.savedRows.length + ' طلب تم تجميعه', 'error');
    showToast('تم إلغاء التجميع', 'warning');
  });

  // ═══════════════════════════════════════════
  //  Start
  // ═══════════════════════════════════════════
  document.getElementById('ali_start').addEventListener('click', async function() {
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري التجميع...';
    this.style.opacity = '0.7';
    this.style.cursor = 'not-allowed';

    totalNoArgs = 0;
    var pages = parseInt(document.getElementById('p_lim').value) || defaultPages;
    await scanAllPages(pages, false);
  });

})();

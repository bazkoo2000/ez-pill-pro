javascript:(function(){
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     بحث الطلبات — v5.0 — iOS Edition (Improved)
     DEVELOPED BY ALI EL-BAZ
     ═══════════════════════════════════════════════════════════════ */

  const PANEL_ID   = 'ali_sys_v5';
  const VERSION    = '5.0';
  const VER_KEY    = 'ezpill_ver';
  const BATCH_SIZE = 5;          // عدد الصفحات في كل دفعة (بدون تغيير السرعة)
  const BATCH_DELAY = 250;       // مللي ثانية بين كل دفعة
  const MAX_PAGES  = 500;        // حد أقصى لعدد الصفحات لحماية السيرفر
  const OPEN_DELAY = 1200;       // مللي ثانية بين فتح كل نافذة

  // ── Toggle: لو البانل موجود، أزيله بالكامل ──
  if (document.getElementById(PANEL_ID)) {
    cleanupPanel();
    return;
  }

  // ══════════════════════════════════════════════
  //  State
  // ══════════════════════════════════════════════
  const state = {
    savedRows:    [],
    visitedSet:   new Set(),
    isProcessing: false,
    isSyncing:    false,
    openedCount:  0,
    openedSet:    new Set(),   // ← تتبع الطلبات اللي اتفتحت فعلاً
    tbody:        null,
    abortCtrl:    null         // ← للإلغاء
  };

  // ══════════════════════════════════════════════
  //  iOS Design Tokens
  // ══════════════════════════════════════════════
  const IOS = {
    bg:      'rgba(243,244,246,0.92)',
    card:    '#ffffff',
    border:  'rgba(0,0,0,0.04)',
    text:    '#1f2937',
    muted:   '#9ca3af',
    accent:  '#6366f1',
    accent2: '#818cf8',
    success: '#22c55e',
    error:   '#ef4444',
    warn:    '#f59e0b',
    shadow:  '0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)',
    font:    '-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif'
  };

  // ══════════════════════════════════════════════
  //  Utility: Safe Text (XSS Protection)
  // ══════════════════════════════════════════════
  function safeText(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ══════════════════════════════════════════════
  //  Toast System
  // ══════════════════════════════════════════════
  function showToast(msg, type) {
    type = type || 'info';
    var container = document.getElementById('ali-toast-box');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-box';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    var colors = { success:'#22c55e', error:'#ef4444', warning:'#f59e0b', info:'#6366f1' };
    var icons  = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    var toast = document.createElement('div');
    toast.style.cssText = 'background:'+IOS.card+';color:'+colors[type]+';padding:12px 22px;border-radius:14px;font-size:13px;font-weight:700;font-family:'+IOS.font+';box-shadow:0 8px 30px rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)';
    var iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type];
    toast.appendChild(iconSpan);
    var msgSpan = document.createElement('span');
    msgSpan.textContent = msg;                    // ← textContent بدل innerHTML
    toast.appendChild(msgSpan);
    container.appendChild(toast);
    setTimeout(function(){
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(function(){ toast.remove(); }, 300);
    }, 3500);
  }

  // Version check
  try {
    var lastVer = localStorage.getItem(VER_KEY);
    if (lastVer !== VERSION) {
      localStorage.setItem(VER_KEY, VERSION);
      if (lastVer) setTimeout(function(){ showToast('تم التحديث لـ v'+VERSION+' — iOS Design 📱','success'); }, 1000);
    }
  } catch(e){}

  // ══════════════════════════════════════════════
  //  Dialog System (XSS-safe)
  // ══════════════════════════════════════════════
  function showDialog(opts) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.25);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.2s';

      var infoHTML = '';
      if (opts.info && opts.info.length) {
        for (var i = 0; i < opts.info.length; i++) {
          var row = opts.info[i];
          infoHTML += '<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 16px;background:'+IOS.bg+';border-radius:12px;margin-bottom:6px"><span style="font-size:13px;color:'+IOS.muted+';font-weight:600">'+safeText(row.label)+'</span><span style="font-weight:800;color:'+(row.color||IOS.accent)+';font-size:14px">'+safeText(row.value)+'</span></div>';
        }
      }

      var badgeHTML = '';
      if (opts.badges && opts.badges.length) {
        badgeHTML = '<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:4px 0 8px">';
        for (var b = 0; b < opts.badges.length; b++) {
          var bg = opts.badges[b];
          var bs = bg.active ? 'color:'+IOS.accent+';background:rgba(99,102,241,0.08)' : 'color:'+IOS.muted+';background:'+IOS.bg;
          badgeHTML += '<span style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;'+bs+'">'+safeText(bg.text)+'</span>';
        }
        badgeHTML += '</div>';
      }

      var btnHTML = '';
      if (opts.buttons && opts.buttons.length) {
        for (var j = 0; j < opts.buttons.length; j++) {
          var btn = opts.buttons[j];
          var bc = btn.primary ? 'background:'+IOS.accent+';color:white;font-weight:800' : 'background:rgba(0,0,0,0.04);color:'+IOS.muted+';font-weight:700';
          btnHTML += '<button data-idx="'+j+'" style="flex:1;padding:14px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-family:'+IOS.font+';transition:all 0.2s;'+bc+'">'+safeText(btn.text)+'</button>';
        }
      }

      overlay.innerHTML = '<div style="background:'+IOS.card+';border-radius:20px;width:380px;max-width:90vw;overflow:hidden;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';box-shadow:0 20px 60px rgba(0,0,0,0.12);animation:aliDialogIn 0.35s cubic-bezier(0.16,1,0.3,1)"><div style="padding:28px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:18px;background:rgba(99,102,241,0.06);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px">'+safeText(opts.icon)+'</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">'+safeText(opts.title)+'</div><div style="font-size:13px;color:'+IOS.muted+';line-height:1.7">'+safeText(opts.desc)+'</div></div>'+badgeHTML+'<div style="padding:16px 24px">'+infoHTML+(opts.body||'')+'</div><div style="padding:6px 24px 24px;display:flex;gap:10px">'+btnHTML+'</div></div>';

      overlay.addEventListener('click', function(e) {
        var el = e.target.closest('[data-idx]');
        if (el) {
          var idx = parseInt(el.getAttribute('data-idx'));
          overlay.style.transition = 'opacity 0.2s';
          overlay.style.opacity = '0';
          setTimeout(function(){ overlay.remove(); }, 200);
          resolve(opts.buttons[idx].value);
        }
      });
      document.body.appendChild(overlay);
    });
  }

  // ══════════════════════════════════════════════
  //  Styles
  // ══════════════════════════════════════════════
  var styleEl = document.createElement('style');
  styleEl.id = 'ali-pro-css';
  styleEl.textContent =
    '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}'+
    '@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
    '@keyframes aliSpin{to{transform:rotate(360deg)}}'+
    '@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}'+
    '@keyframes aliDialogIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'+
    '@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}'+
    '@keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}'+
    '@keyframes aliFadeTab{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}'+
    '#'+PANEL_ID+'{position:fixed;top:14px;right:14px;width:380px;max-height:92vh;background:'+IOS.bg+';backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);z-index:9999999;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';overflow:hidden;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)}'+
    '#'+PANEL_ID+'.ali-minimized{width:56px!important;height:56px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6366f1,#8b5cf6)!important;box-shadow:0 8px 24px rgba(99,102,241,0.3)!important;animation:aliPulse 2s infinite;overflow:hidden}'+
    '#'+PANEL_ID+'.ali-minimized .ali-inner{display:none!important}'+
    '#'+PANEL_ID+'.ali-minimized::after{content:"🔍";font-size:22px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}'+
    '#'+PANEL_ID+' .ios-grp{background:'+IOS.card+';border-radius:14px;overflow:hidden;box-shadow:'+IOS.shadow+';margin-bottom:12px}'+
    '#'+PANEL_ID+' .ios-item{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:0.5px solid #f3f4f6;transition:background 0.15s}'+
    '#'+PANEL_ID+' .ios-item:last-child{border-bottom:none}'+
    '#'+PANEL_ID+' .ios-item:hover{background:#f9fafb}'+
    '#'+PANEL_ID+' .ios-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:'+IOS.font+';transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}'+
    '#'+PANEL_ID+' .ios-btn:active{transform:scale(0.98);opacity:0.9}'+
    '#'+PANEL_ID+' .ios-primary{background:'+IOS.accent+';color:white}'+
    '#'+PANEL_ID+' .ios-success{background:'+IOS.success+';color:white}'+
    '#'+PANEL_ID+' .ios-warn{background:'+IOS.warn+';color:white}'+
    '#'+PANEL_ID+' .ios-ghost{background:rgba(0,0,0,0.03);color:'+IOS.muted+'}'+
    '#'+PANEL_ID+' .ios-input{width:100%;padding:12px 16px;border:none;border-radius:12px;font-size:14px;font-family:'+IOS.font+';outline:none;background:rgba(0,0,0,0.03);color:'+IOS.text+';transition:all 0.2s;font-weight:600;box-sizing:border-box}'+
    '#'+PANEL_ID+' .ios-input:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15)}'+
    '#'+PANEL_ID+' .ios-input.match{background:rgba(34,197,94,0.04);box-shadow:0 0 0 2px rgba(34,197,94,0.15)}'+
    '#'+PANEL_ID+' .ios-input.nomatch{background:rgba(239,68,68,0.04);box-shadow:0 0 0 2px rgba(239,68,68,0.15)}';
  document.head.appendChild(styleEl);

  // ══════════════════════════════════════════════
  //  Detect current page count
  // ══════════════════════════════════════════════
  var calculatedPages = 10;
  try {
    var targetText = 'ready to pack';
    var loc = window.location.href.toLowerCase();
    if (loc.indexOf('new') !== -1) targetText = 'new orders';
    else if (loc.indexOf('packed') !== -1 && loc.indexOf('ready') === -1) targetText = 'packed';
    else if (loc.indexOf('delivered') !== -1) targetText = 'delivered orders';
    var elements = document.querySelectorAll('*');
    for (var ei = 0; ei < elements.length; ei++) {
      var el = elements[ei];
      if (el.children.length === 0 && el.textContent && el.textContent.trim().toLowerCase() === targetText) {
        var parent = el.parentElement;
        for (var pj = 0; pj < 4; pj++) {
          if (parent) {
            var txt = parent.innerText || parent.textContent || '';
            var nums = txt.match(/\d+/g);
            if (nums && nums.length > 0) {
              var maxN = 0;
              for (var k = 0; k < nums.length; k++) {
                var n = parseInt(nums[k]);
                if (n > maxN) maxN = n;
              }
              if (maxN > 0) { calculatedPages = Math.ceil(maxN / 10); break; }
            }
            parent = parent.parentElement;
          }
        }
        break;
      }
    }
    if (calculatedPages < 1) calculatedPages = 1;
  } catch(err){}

  // ══════════════════════════════════════════════
  //  Build Panel
  // ══════════════════════════════════════════════
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML =
    '<div class="ali-inner">'+
    '<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25)">🔍</div>'+
        '<div><div style="font-size:15px;font-weight:800;color:#1f2937">بحث الطلبات</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v'+VERSION+' — iOS Edition</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button id="ali_min" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">−</button>'+
        '<button id="ali_close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">✕</button>'+
      '</div>'+
    '</div>'+
    '<div style="padding:10px 16px;overflow-y:auto;max-height:calc(92vh - 60px)" id="ali_body">'+
      // Stats cards
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 6px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">📊</div><div id="stat_total" style="font-size:20px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">إجمالي</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 6px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">🔍</div><div id="stat_match" style="font-size:20px;font-weight:900;color:#22c55e">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">مطابق</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 6px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">🚀</div><div id="stat_opened" style="font-size:20px;font-weight:900;color:#6366f1">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">تم فتحه</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 6px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">📦</div><div id="stat_remaining" style="font-size:20px;font-weight:900;color:#f59e0b">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">متبقي</div></div>'+
      '</div>'+
      // Page limit
      '<div class="ios-grp" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:13px;font-weight:700">📄 عدد الصفحات</span>'+
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:'+IOS.muted+';font-weight:600">صفحة</span><input type="number" id="p_lim" value="'+calculatedPages+'" min="1" max="'+MAX_PAGES+'" class="ios-input" style="width:60px;padding:8px;text-align:center;font-size:15px;font-weight:900;color:'+IOS.accent+'"></div>'+
        '</div>'+
        '<div style="height:6px;background:rgba(0,0,0,0.04);border-radius:6px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:6px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)"></div></div>'+
      '</div>'+
      // Status
      '<div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:rgba(34,197,94,0.06);color:#22c55e"><span>✅</span><span>جاهز للبدء التلقائي</span></div>'+
      // Dynamic area
      '<div id="ali_dynamic_area"><button id="ali_start" class="ios-btn ios-primary" style="font-size:15px;padding:16px">🚀 بدء الفحص الذكي</button></div>'+
      '<div style="text-align:center;padding:12px 0 4px;font-size:9px;color:'+IOS.muted+';font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
    '</div></div>';
  document.body.appendChild(panel);

  // ══════════════════════════════════════════════
  //  Helper Functions
  // ══════════════════════════════════════════════
  function setStatus(text, type) {
    var el = document.getElementById('status-msg');
    if (!el) return;
    var configs = {
      ready:   { color:'#22c55e', bg:'rgba(34,197,94,0.06)',  icon:'✅' },
      working: { color:'#6366f1', bg:'rgba(99,102,241,0.06)', icon:'spinner' },
      error:   { color:'#ef4444', bg:'rgba(239,68,68,0.06)',  icon:'❌' },
      done:    { color:'#22c55e', bg:'rgba(34,197,94,0.06)',  icon:'🎉' },
      sync:    { color:'#f59e0b', bg:'rgba(245,158,11,0.06)', icon:'spinner' }
    };
    var cfg = configs[type] || configs.ready;
    var iconHTML = cfg.icon === 'spinner'
      ? '<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:'+IOS.accent+';border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : '<span>'+cfg.icon+'</span>';
    el.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:'+cfg.bg+';color:'+cfg.color+';transition:all 0.3s';
    el.innerHTML = iconHTML+'<span>'+safeText(text)+'</span>';
  }

  function animNum(id, val) {
    var el = document.getElementById(id);
    if (!el || el.innerText === String(val)) return;
    requestAnimationFrame(function(){
      el.innerText = val;
      el.style.animation = 'aliCountUp 0.4s';
      setTimeout(function(){ el.style.animation = ''; }, 400);
    });
  }

  function getRemainingCount() {
    // الطلبات المتبقية = الإجمالي - اللي اتفتحت فعلاً
    var openable = state.savedRows.filter(function(r){ return r.hasArgs; });
    var remaining = openable.filter(function(r){ return !state.openedSet.has(r.id); });
    return remaining.length;
  }

  function updateStats(matchCount) {
    animNum('stat_total', state.savedRows.length);
    animNum('stat_match', matchCount !== undefined ? matchCount : state.savedRows.length);
    animNum('stat_opened', state.openedCount);
    animNum('stat_remaining', getRemainingCount());
  }

  function debounce(fn, delay) {
    var timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function getCurrentStatus() {
    var status = 'readypack';
    var url = window.location.href.toLowerCase();
    if (url.indexOf('new') !== -1) status = 'new';
    else if (url.indexOf('packed') !== -1 && url.indexOf('ready') === -1) status = 'packed';
    else if (url.indexOf('delivered') !== -1) status = 'delivered';
    return status;
  }

  function clampPages(val) {
    var n = parseInt(val) || 1;
    if (n < 1) n = 1;
    if (n > MAX_PAGES) n = MAX_PAGES;
    return n;
  }

  // ══════════════════════════════════════════════
  //  getDetails — فتح تفاصيل الطلب
  // ══════════════════════════════════════════════
  function getDetails(onlineNumber, invoice, typee, headId) {
    var base = window.location.origin + "/ez_pill_web/getEZPill_Details";
    var url = base
      + "?onlineNumber=" + encodeURIComponent(onlineNumber)
      + "&Invoice="      + encodeURIComponent(invoice)
      + "&typee="        + encodeURIComponent(typee)
      + "&head_id="      + encodeURIComponent(headId);
    var win = window.open(url, "_blank");
    if (win) {
      state.openedCount++;
      state.openedSet.add(invoice);
      updateStats();
      window.focus();
      try { win.blur(); } catch(e){}
    } else {
      showToast('المتصفح حظر النافذة — فعّل النوافذ المنبثقة', 'error');
    }
  }

  // ══════════════════════════════════════════════
  //  Order Row Builder
  // ══════════════════════════════════════════════
  function createSafeLabel(invoice, args) {
    var label = document.createElement('label');
    label.style.cssText = 'cursor:pointer;color:'+IOS.accent+';text-decoration:underline;font-weight:bold';
    label.textContent = invoice;
    if (args) {
      label.addEventListener('click', function() {
        getDetails(args[0], args[1], args[2], args[3]);
      });
    }
    return label;
  }

  function buildOrderRow(item, template) {
    var invoice      = item.Invoice || '';
    var onlineNum    = item.onlineNumber || '';
    var typee        = item.typee !== undefined ? item.typee : '';
    var headId       = item.head_id !== undefined ? item.head_id : '';
    var args         = null;

    if (onlineNum !== '' && invoice !== '') {
      args = [onlineNum.replace(/ERX/gi,''), invoice, typee, headId];
    }

    var row;
    if (template) {
      row = template.cloneNode(true);
      var cells = row.querySelectorAll('td');
      if (cells.length > 3) {
        cells[0].innerHTML = '';
        cells[0].appendChild(createSafeLabel(invoice, args));
        cells[1].textContent = onlineNum;
        cells[2].textContent = item.guestName || '';
        cells[3].textContent = item.guestMobile || item.mobile || '';
      }
    } else {
      row = document.createElement('tr');
      var td0 = document.createElement('td');
      var td1 = document.createElement('td');
      var td2 = document.createElement('td');
      var td3 = document.createElement('td');
      td0.appendChild(createSafeLabel(invoice, args));
      td1.textContent = onlineNum;
      td2.textContent = item.guestName || '';
      td3.textContent = item.guestMobile || item.mobile || '';
      row.appendChild(td0);
      row.appendChild(td1);
      row.appendChild(td2);
      row.appendChild(td3);
    }

    return {
      id:      invoice,
      onl:     onlineNum,
      node:    row,
      args:    args,
      hasArgs: args !== null
    };
  }

  // ══════════════════════════════════════════════
  //  Core: Fetch Page Orders
  // ══════════════════════════════════════════════
  function fetchPageOrders(pageNum, currentStatus, signal) {
    var baseUrl = window.location.origin + "/ez_pill_web/";
    return fetch(baseUrl + 'Home/getOrders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: currentStatus, pageSelected: pageNum, searchby: '' }),
      signal:  signal   // ← AbortController signal
    }).then(function(res){ return res.json(); });
  }

  // ══════════════════════════════════════════════
  //  Core: Batch Fetch All Pages (مشتركة — بدون تكرار)
  //  نفس السرعة: BATCH_SIZE=5 و BATCH_DELAY=250ms
  // ══════════════════════════════════════════════
  async function fetchAllPages(opts) {
    /*
      opts = {
        currentStatus: string,
        signal: AbortSignal,
        onPageData: function(orders, pageNum),  // callback لكل صفحة
        onProgress: function(currentPage, maxPages),
        statusLabel: string  // 'تحليل' أو 'مزامنة'
      }
      returns: maxPages
    */
    var currentStatus = opts.currentStatus;
    var signal        = opts.signal;
    var fillBar       = document.getElementById('p-fill');

    // ─ الصفحة الأولى ─
    var firstData = await fetchPageOrders(1, currentStatus, signal);
    var maxPages  = parseInt(document.getElementById('p_lim').value) || 1;

    if (firstData.total_orders) {
      var total = parseInt(firstData.total_orders) || 0;
      if (total > 0) {
        maxPages = Math.ceil(total / 10);
        maxPages = Math.min(maxPages, MAX_PAGES);
        document.getElementById('p_lim').value = maxPages;
      }
    }

    var firstOrders = [];
    try {
      firstOrders = typeof firstData.orders_list === 'string'
        ? JSON.parse(firstData.orders_list)
        : firstData.orders_list;
    } catch(e){}

    if (firstOrders && firstOrders.length > 0) {
      opts.onPageData(firstOrders, 1);
    }
    if (fillBar) fillBar.style.width = ((1/maxPages)*100) + '%';
    if (opts.onProgress) opts.onProgress(1, maxPages);

    // ─ باقي الصفحات بنظام الدفعات ─
    for (var pg = 2; pg <= maxPages; pg += BATCH_SIZE) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');

      var endPage = Math.min(pg + BATCH_SIZE - 1, maxPages);
      setStatus(opts.statusLabel + ' الدفعة (' + pg + ' إلى ' + endPage + ') من ' + maxPages + ' ...',
                opts.statusLabel === 'مزامنة' ? 'sync' : 'working');

      var batchPromises = [];
      for (var j = pg; j <= endPage; j++) {
        (function(pageNum) {
          batchPromises.push(
            fetchPageOrders(pageNum, currentStatus, signal)
              .then(function(data) {
                var orders = [];
                try {
                  orders = typeof data.orders_list === 'string'
                    ? JSON.parse(data.orders_list)
                    : data.orders_list;
                } catch(e){}
                if (orders && orders.length > 0) {
                  opts.onPageData(orders, pageNum);
                }
              })
              .catch(function(err) {
                if (err.name !== 'AbortError') console.error('Page fetch error:', err);
              })
          );
        })(j);
      }

      await Promise.all(batchPromises);
      if (fillBar) fillBar.style.width = ((endPage / maxPages) * 100) + '%';
      if (opts.onProgress) opts.onProgress(endPage, maxPages);

      // نفس الفاصل الزمني = نفس السرعة
      if (endPage < maxPages) await new Promise(function(r){ setTimeout(r, BATCH_DELAY); });
    }

    return maxPages;
  }

  // ══════════════════════════════════════════════
  //  Scan Page (الفحص الأولي)
  // ══════════════════════════════════════════════
  var totalNoArgs = 0;

  async function scanPage(isSync) {
    state.isProcessing = true;
    state.abortCtrl = new AbortController();
    var signal = state.abortCtrl.signal;
    var currentStatus = getCurrentStatus();

    try {
      setStatus(isSync ? 'جاري المزامنة...' : 'جاري الفحص المبدئي...', isSync ? 'sync' : 'working');

      var tables = document.querySelectorAll('table');
      var biggestTable = tables[0];
      for (var t = 0; t < tables.length; t++) {
        if (tables[t].innerText.length > biggestTable.innerText.length) biggestTable = tables[t];
      }
      var tbody = biggestTable.querySelector('tbody') || biggestTable;
      var template = tbody.querySelector('tr');

      await fetchAllPages({
        currentStatus: currentStatus,
        signal: signal,
        statusLabel: isSync ? 'مزامنة' : 'تحليل',
        onPageData: function(orders) {
          var noArgsCount = 0;
          for (var i = 0; i < orders.length; i++) {
            var invoice = orders[i].Invoice || '';
            if (invoice.length > 3 && !state.visitedSet.has(invoice)) {
              state.visitedSet.add(invoice);
              var rowData = buildOrderRow(orders[i], template);
              if (!rowData.hasArgs) noArgsCount++;
              state.savedRows.push(rowData);
            }
          }
          totalNoArgs += noArgsCount;
          updateStats();
        }
      });

      finishScan(isSync);

    } catch(err) {
      if (err.name === 'AbortError') {
        setStatus('تم إلغاء العملية', 'error');
        showToast('تم الإلغاء بنجاح', 'warning');
        // لو في بيانات اتجمعت قبل الإلغاء، اعرضها
        if (state.savedRows.length > 0) finishScan(false);
      } else {
        console.error(err);
        setStatus('حدث خطأ في الاتصال بالخادم', 'error');
        showToast('مشكلة في سحب البيانات!', 'error');
      }
    } finally {
      state.isProcessing = false;
      state.isSyncing = false;
      state.abortCtrl = null;
    }
  }

  // ══════════════════════════════════════════════
  //  Smart Sync (المزامنة الذكية)
  // ══════════════════════════════════════════════
  async function smartSync() {
    state.isSyncing = true;
    state.isProcessing = true;
    state.abortCtrl = new AbortController();
    var signal = state.abortCtrl.signal;
    var currentStatus = getCurrentStatus();

    try {
      setStatus('جاري جلب البيانات المبدئية...', 'sync');
      var serverOrders = new Map();

      await fetchAllPages({
        currentStatus: currentStatus,
        signal: signal,
        statusLabel: 'مزامنة',
        onPageData: function(orders) {
          for (var i = 0; i < orders.length; i++) {
            var invoice = orders[i].Invoice || '';
            if (invoice.length > 3) serverOrders.set(invoice, orders[i]);
          }
        }
      });

      setStatus('جاري مقارنة البيانات...', 'sync');

      var oldIds = new Set(state.savedRows.map(function(r){ return r.id; }));
      var removedIds = [];
      var keptRows = [];

      for (var ri = 0; ri < state.savedRows.length; ri++) {
        if (serverOrders.has(state.savedRows[ri].id)) {
          keptRows.push(state.savedRows[ri]);
        } else {
          removedIds.push(state.savedRows[ri].id);
          // لو الطلب المحذوف كان اتفتح، أزيله من openedSet
          state.openedSet.delete(state.savedRows[ri].id);
        }
      }

      var tables = document.querySelectorAll('table');
      var biggestTable = tables[0];
      for (var t = 0; t < tables.length; t++) {
        if (tables[t].innerText.length > biggestTable.innerText.length) biggestTable = tables[t];
      }
      var tbody = biggestTable.querySelector('tbody') || biggestTable;
      var template = tbody.querySelector('tr');

      var newRows = [];
      var newNoArgs = 0;
      serverOrders.forEach(function(item, invoice) {
        if (!oldIds.has(invoice)) {
          var rowData = buildOrderRow(item, template);
          if (!rowData.hasArgs) newNoArgs++;
          newRows.push(rowData);
        }
      });

      state.savedRows = keptRows.concat(newRows);
      state.visitedSet.clear();
      for (var si = 0; si < state.savedRows.length; si++) {
        state.visitedSet.add(state.savedRows[si].id);
      }

      state.tbody = tbody;
      state.tbody.innerHTML = '';
      for (var di = 0; di < state.savedRows.length; di++) {
        state.savedRows[di].node.style.cursor = 'pointer';
        state.tbody.appendChild(state.savedRows[di].node);
      }
      updateStats(state.savedRows.length);

      var summaryParts = [];
      if (removedIds.length > 0) summaryParts.push('🗑 '+removedIds.length+' تم إزالته');
      if (newRows.length > 0) summaryParts.push('✨ '+newRows.length+' جديد');
      if (removedIds.length === 0 && newRows.length === 0) summaryParts.push('لا تغييرات');
      var summaryText = summaryParts.join(' | ') + ' — الإجمالي: ' + state.savedRows.length;

      setStatus('تمت المزامنة — ' + summaryText, 'done');
      if (newNoArgs > 0) showToast(newNoArgs + ' طلب جديد بدون بيانات فتح', 'warning');

      await showDialog({
        icon: '✅',
        title: 'تمت المزامنة بنجاح',
        desc: 'تم تحديث القائمة بأحدث البيانات من الخادم',
        badges: [
          { text: '🗑 حُذف '+removedIds.length, active: removedIds.length > 0 },
          { text: '✨ جديد '+newRows.length, active: newRows.length > 0 },
          { text: '📦 إجمالي '+state.savedRows.length, active: true }
        ],
        info: [
          { label:'تم إزالته', value: removedIds.length.toString(), color: removedIds.length > 0 ? '#ef4444' : '#9ca3af' },
          { label:'أوردرات جديدة', value: newRows.length.toString(), color: newRows.length > 0 ? '#22c55e' : '#9ca3af' },
          { label:'الإجمالي', value: state.savedRows.length.toString(), color: '#6366f1' }
        ],
        buttons: [
          { text:'إلغاء', value:'cancel', primary:false },
          { text:'👍 تمام', value:'ok', primary:true }
        ]
      });
      showToast(summaryText, 'success');

    } catch(err) {
      if (err.name === 'AbortError') {
        setStatus('تم إلغاء المزامنة', 'error');
        showToast('تم الإلغاء', 'warning');
      } else {
        console.error('Sync error:', err);
        setStatus('خطأ في المزامنة — حاول تاني', 'error');
        showToast('فشلت المزامنة: '+(err.message||'خطأ'), 'error');
      }
    } finally {
      state.isSyncing = false;
      state.isProcessing = false;
      state.abortCtrl = null;
      var syncBtn = document.getElementById('ali_btn_sync');
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = '🔄 مزامنة ذكية';
        syncBtn.className = 'ios-btn ios-ghost';
      }
    }
  }

  // ══════════════════════════════════════════════
  //  Finish Scan
  // ══════════════════════════════════════════════
  function finishScan(isSync) {
    var tables = document.querySelectorAll('table');
    var biggestTable = tables[0];
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].innerText.length > biggestTable.innerText.length) biggestTable = tables[t];
    }
    state.tbody = biggestTable.querySelector('tbody') || biggestTable;
    state.tbody.innerHTML = '';
    for (var i = 0; i < state.savedRows.length; i++) {
      state.savedRows[i].node.style.cursor = 'pointer';
      state.tbody.appendChild(state.savedRows[i].node);
    }
    updateStats(state.savedRows.length);

    if (totalNoArgs > 0) showToast(totalNoArgs + ' طلب بدون بيانات فتح', 'warning');

    if (isSync) {
      setStatus('تمت المزامنة — ' + state.savedRows.length + ' طلب', 'done');
      showToast('تمت المزامنة: ' + state.savedRows.length + ' طلب', 'success');
    } else {
      setStatus('تم التجميع — ' + state.savedRows.length + ' طلب جاهز', 'done');
      showToast('تم تجميع ' + state.savedRows.length + ' طلب بنجاح', 'success');
    }
    buildSearchUI();
  }

  // ══════════════════════════════════════════════
  //  Search UI + Open N Orders Feature
  // ══════════════════════════════════════════════
  function buildSearchUI() {
    var dynamicArea = document.getElementById('ali_dynamic_area');
    var remaining = getRemainingCount();

    dynamicArea.innerHTML =
      // ─ خانة البحث ─
      '<div class="ios-grp" style="padding:14px 16px">' +
        '<div style="position:relative;margin-bottom:8px">' +
          '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:900;color:'+IOS.muted+';pointer-events:none;font-family:monospace">0</span>' +
          '<input type="text" id="ali_sI" class="ios-input" placeholder="أدخل الأرقام بعد الـ 0..." style="padding-left:30px;direction:ltr;text-align:left;letter-spacing:1px;font-family:monospace;font-weight:700">' +
        '</div>' +
        '<div style="position:relative">' +
          '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">🔗</span>' +
          '<input type="text" id="ali_sO" class="ios-input" placeholder="بحث برقم الطلب (ERX)..." style="padding-right:36px;direction:rtl">' +
        '</div>' +
      '</div>' +

      // ─ عدد النتائج ─
      '<div id="ali_search_count" style="font-size:11px;color:'+IOS.muted+';text-align:center;font-weight:600;padding:2px 0 10px">' +
        'عرض '+state.savedRows.length+' من '+state.savedRows.length+' نتيجة' +
      '</div>' +

      // ─ فتح المطابق ─
      '<button id="ali_btn_open" class="ios-btn ios-success" style="margin-bottom:8px;opacity:0.7;cursor:not-allowed">' +
        '⚡ ابحث أولاً ثم افتح المطابق' +
      '</button>' +

      // ─ فتح عدد معين للتسليم ─
      '<div class="ios-grp" style="padding:14px 16px;margin-top:4px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
          '<span style="font-size:13px;font-weight:700">📦 فتح عدد معين للتسليم</span>' +
          '<span id="ali_remaining_label" style="font-size:12px;font-weight:800;color:'+IOS.warn+'">متبقي: '+remaining+'</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input type="number" id="ali_open_n" class="ios-input" placeholder="عدد الطلبات" min="1" max="'+remaining+'" style="flex:1;text-align:center;font-size:15px;font-weight:800">' +
          '<button id="ali_btn_open_n" class="ios-btn ios-warn" style="width:auto;padding:12px 20px;white-space:nowrap;font-size:13px">📦 فتح</button>' +
        '</div>' +
        '<div style="margin-top:8px;display:flex;gap:6px">' +
          '<button class="ali-quick-n" data-n="5" style="flex:1;padding:8px;border:none;border-radius:8px;background:rgba(245,158,11,0.08);color:#f59e0b;font-weight:800;font-size:12px;cursor:pointer;font-family:'+IOS.font+'">5</button>' +
          '<button class="ali-quick-n" data-n="10" style="flex:1;padding:8px;border:none;border-radius:8px;background:rgba(245,158,11,0.08);color:#f59e0b;font-weight:800;font-size:12px;cursor:pointer;font-family:'+IOS.font+'">10</button>' +
          '<button class="ali-quick-n" data-n="15" style="flex:1;padding:8px;border:none;border-radius:8px;background:rgba(245,158,11,0.08);color:#f59e0b;font-weight:800;font-size:12px;cursor:pointer;font-family:'+IOS.font+'">15</button>' +
          '<button class="ali-quick-n" data-n="20" style="flex:1;padding:8px;border:none;border-radius:8px;background:rgba(245,158,11,0.08);color:#f59e0b;font-weight:800;font-size:12px;cursor:pointer;font-family:'+IOS.font+'">20</button>' +
        '</div>' +
      '</div>' +

      // ─ مزامنة ─
      '<button id="ali_btn_sync" class="ios-btn ios-ghost" style="margin-top:8px">🔄 مزامنة ذكية</button>';

    // ── Wire up search ──
    var searchInvoice  = document.getElementById('ali_sI');
    var searchOnline   = document.getElementById('ali_sO');
    var searchCount    = document.getElementById('ali_search_count');
    var openMatchBtn   = document.getElementById('ali_btn_open');
    var currentMatches = [];

    function filterRows() {
      var rawInvoice = searchInvoice.value.trim();
      var invoiceSearch = rawInvoice !== '' ? '0' + rawInvoice : '';
      var onlineSearch = searchOnline.value.trim().toLowerCase();
      var hasFilter = invoiceSearch !== '' || onlineSearch !== '';

      state.tbody.innerHTML = '';
      var shown = 0;
      currentMatches = [];

      for (var i = 0; i < state.savedRows.length; i++) {
        var row = state.savedRows[i];
        var matchInvoice = invoiceSearch !== '' && row.id.startsWith(invoiceSearch);
        var matchOnline  = onlineSearch !== '' && row.onl.toLowerCase().indexOf(onlineSearch) !== -1;
        var show = hasFilter ? (matchInvoice || matchOnline) : true;

        if (show) {
          state.tbody.appendChild(row.node);
          shown++;
          if (hasFilter) currentMatches.push(row);
        }
      }

      searchCount.textContent = 'عرض ' + shown + ' من ' + state.savedRows.length + ' نتيجة';
      updateStats(shown);

      if (hasFilter && currentMatches.length > 0) {
        var openable = currentMatches.filter(function(r){ return r.args !== null; }).length;
        openMatchBtn.innerHTML = '⚡ فتح المطابق (' + openable + ' طلب)';
        openMatchBtn.style.opacity = '1';
        openMatchBtn.style.cursor = 'pointer';
      } else if (hasFilter && currentMatches.length === 0) {
        openMatchBtn.innerHTML = '⚡ لا توجد نتائج';
        openMatchBtn.style.opacity = '0.5';
        openMatchBtn.style.cursor = 'not-allowed';
      } else {
        openMatchBtn.innerHTML = '⚡ ابحث أولاً ثم افتح المطابق';
        openMatchBtn.style.opacity = '0.7';
        openMatchBtn.style.cursor = 'not-allowed';
      }

      searchInvoice.className = 'ios-input' + (rawInvoice.length > 0 ? (shown > 0 ? ' match' : ' nomatch') : '');
      searchOnline.className  = 'ios-input' + (onlineSearch.length > 0 ? (shown > 0 ? ' match' : ' nomatch') : '');
    }

    var debouncedFilter = debounce(filterRows, 150);
    searchInvoice.addEventListener('input', debouncedFilter);
    searchOnline.addEventListener('input', debouncedFilter);

    // ── Open matched orders ──
    openMatchBtn.addEventListener('click', async function() {
      var rawInvoice = searchInvoice.value.trim();
      var onlineSearch = searchOnline.value.trim().toLowerCase();
      var hasFilter = rawInvoice !== '' || onlineSearch !== '';

      if (!hasFilter) {
        showToast('ابحث أولاً برقم الفاتورة أو رقم الطلب!', 'warning');
        searchInvoice.focus();
        searchInvoice.style.animation = 'aliBlink 0.5s 3';
        setTimeout(function(){ searchInvoice.style.animation = ''; }, 1500);
        return;
      }

      var openable = currentMatches.filter(function(r){ return r.args !== null; });
      var skipped  = currentMatches.length - openable.length;

      if (openable.length === 0) {
        showToast(skipped > 0 ? skipped+' طلب مطابق لكن بدون بيانات فتح!' : 'لا توجد طلبات مطابقة!', skipped > 0 ? 'error' : 'warning');
        return;
      }
      if (skipped > 0) showToast('⚠️ تم تخطي '+skipped+' طلب بدون بيانات فتح', 'warning');

      openMatchBtn.disabled = true;
      openMatchBtn.style.opacity = '0.6';
      openMatchBtn.style.cursor = 'not-allowed';

      var opened = 0, failed = 0;

      for (var idx = 0; idx < openable.length; idx++) {
        var item = openable[idx];
        var base = window.location.origin + "/ez_pill_web/getEZPill_Details";
        var url = base
          + "?onlineNumber=" + encodeURIComponent(item.args[0])
          + "&Invoice="      + encodeURIComponent(item.args[1])
          + "&typee="        + encodeURIComponent(item.args[2])
          + "&head_id="      + encodeURIComponent(item.args[3]);

        try {
          var win = window.open(url, "_blank");
          if (win) {
            opened++;
            state.openedCount++;
            state.openedSet.add(item.id);
            window.focus();
            try { win.blur(); } catch(e){}
          } else { failed++; }
        } catch(e) { failed++; }

        openMatchBtn.innerHTML = '🚀 جاري الفتح (' + (idx+1) + '/' + openable.length + ')';
        setStatus('فتح '+(idx+1)+' من '+openable.length+': '+(item.onl||item.id), 'working');
        updateStats();
        updateRemainingLabel();

        if (idx < openable.length - 1) {
          await new Promise(function(r){ setTimeout(r, OPEN_DELAY); });
        }
      }

      if (failed > 0) showToast('المتصفح حظر '+failed+' نافذة — فعّل النوافذ المنبثقة', 'error');
      showToast('تم فتح '+opened+' طلب', opened > 0 ? 'success' : 'error');
      setStatus('تم فتح '+opened+' — الإجمالي: '+state.openedCount, 'done');
      openMatchBtn.disabled = false;
      openMatchBtn.innerHTML = '⚡ فتح المطابق (' + openable.length + ' طلب)';
      filterRows();
    });

    // ── Open N orders (فتح عدد معين) ──
    var openNInput = document.getElementById('ali_open_n');
    var openNBtn   = document.getElementById('ali_btn_open_n');

    // Quick buttons (5, 10, 15, 20)
    var quickBtns = dynamicArea.querySelectorAll('.ali-quick-n');
    for (var qi = 0; qi < quickBtns.length; qi++) {
      quickBtns[qi].addEventListener('click', function() {
        openNInput.value = this.getAttribute('data-n');
        openNInput.dispatchEvent(new Event('input'));
      });
    }

    // Validate input against remaining
    openNInput.addEventListener('input', function() {
      var currentRemaining = getRemainingCount();
      var val = parseInt(this.value) || 0;
      if (val > currentRemaining) this.value = currentRemaining;
      if (val < 0) this.value = 0;
    });

    openNBtn.addEventListener('click', async function() {
      var count = parseInt(openNInput.value) || 0;
      var currentRemaining = getRemainingCount();

      if (count <= 0) {
        showToast('أدخل عدد صحيح!', 'warning');
        openNInput.focus();
        return;
      }
      if (count > currentRemaining) {
        count = currentRemaining;
        openNInput.value = count;
      }
      if (currentRemaining === 0) {
        showToast('لا توجد طلبات متبقية للفتح!', 'warning');
        return;
      }

      // فلترة الطلبات اللي لسه ما اتفتحتش
      var unopened = state.savedRows.filter(function(r) {
        return r.hasArgs && !state.openedSet.has(r.id);
      });

      var toOpen = unopened.slice(0, count);

      if (toOpen.length === 0) {
        showToast('لا توجد طلبات متبقية!', 'warning');
        return;
      }

      var result = await showDialog({
        icon: '📦',
        title: 'فتح ' + toOpen.length + ' طلب للتسليم',
        desc: 'سيتم فتح أول ' + toOpen.length + ' طلب من المتبقي',
        info: [
          { label: 'سيتم فتحه', value: toOpen.length.toString(), color: '#f59e0b' },
          { label: 'متبقي بعد الفتح', value: (currentRemaining - toOpen.length).toString(), color: '#6366f1' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '📦 فتح الآن', value: 'confirm', primary: true }
        ]
      });

      if (result !== 'confirm') return;

      openNBtn.disabled = true;
      openNBtn.innerHTML = '<div style="width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div>';

      var opened = 0, failed = 0;

      for (var idx = 0; idx < toOpen.length; idx++) {
        var item = toOpen[idx];
        var base = window.location.origin + "/ez_pill_web/getEZPill_Details";
        var url = base
          + "?onlineNumber=" + encodeURIComponent(item.args[0])
          + "&Invoice="      + encodeURIComponent(item.args[1])
          + "&typee="        + encodeURIComponent(item.args[2])
          + "&head_id="      + encodeURIComponent(item.args[3]);

        try {
          var win = window.open(url, "_blank");
          if (win) {
            opened++;
            state.openedCount++;
            state.openedSet.add(item.id);   // ← تسجيل إنه اتفتح
            window.focus();
            try { win.blur(); } catch(e){}
          } else { failed++; }
        } catch(e) { failed++; }

        setStatus('فتح ' + (idx+1) + ' من ' + toOpen.length + ': ' + (item.onl||item.id), 'working');
        updateStats();
        updateRemainingLabel();

        if (idx < toOpen.length - 1) {
          await new Promise(function(r){ setTimeout(r, OPEN_DELAY); });
        }
      }

      openNBtn.disabled = false;
      openNBtn.innerHTML = '📦 فتح';

      // تحديث الـ max و الـ label
      var newRemaining = getRemainingCount();
      openNInput.max = newRemaining;
      openNInput.value = '';
      updateRemainingLabel();
      updateStats();

      if (failed > 0) showToast('المتصفح حظر '+failed+' نافذة — فعّل النوافذ المنبثقة', 'error');
      showToast('تم فتح '+opened+' طلب — متبقي '+newRemaining, opened > 0 ? 'success' : 'error');
      setStatus('تم فتح '+opened+' — متبقي: '+newRemaining, 'done');
    });

    // ── Sync button ──
    document.getElementById('ali_btn_sync').addEventListener('click', async function() {
      if (state.isSyncing || state.isProcessing) {
        showToast('المزامنة شغالة — انتظر!', 'warning');
        return;
      }
      var syncBtn = this;
      var oldCount = state.savedRows.length;

      var result = await showDialog({
        icon: '🔄',
        title: 'المزامنة الذكية',
        desc: 'هيتم مقارنة بياناتك مع الخادم',
        badges: [
          { text:'حذف المُغلق', active:true },
          { text:'إضافة الجديد', active:true },
          { text:'تحديث البيانات', active:true }
        ],
        info: [
          { label:'الطلبات الحالية', value: oldCount.toString(), color:'#6366f1' },
          { label:'العملية', value:'مقارنة + تحديث', color:'#3b82f6' }
        ],
        buttons: [
          { text:'إلغاء', value:'cancel', primary:false },
          { text:'🔄 بدء المزامنة', value:'confirm', primary:true }
        ]
      });

      if (result !== 'confirm') return;

      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري المزامنة...';
      syncBtn.style.color = IOS.accent;

      await smartSync();
      buildSearchUI();
    });
  }

  function updateRemainingLabel() {
    var label = document.getElementById('ali_remaining_label');
    var remaining = getRemainingCount();
    if (label) label.textContent = 'متبقي: ' + remaining;
    var openNInput = document.getElementById('ali_open_n');
    if (openNInput) openNInput.max = remaining;
  }

  // ══════════════════════════════════════════════
  //  Panel Controls
  // ══════════════════════════════════════════════
  panel.addEventListener('click', function(e) {
    if (panel.classList.contains('ali-minimized')) {
      panel.classList.remove('ali-minimized');
      e.stopPropagation();
    }
  });

  document.getElementById('ali_close').addEventListener('click', function(e) {
    e.stopPropagation();
    // إلغاء أي عملية جارية
    if (state.abortCtrl) state.abortCtrl.abort();
    panel.style.transition = 'all 0.3s';
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(40px) scale(0.97)';
    setTimeout(function(){ cleanupPanel(); }, 300);
  });

  document.getElementById('ali_min').addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.add('ali-minimized');
  });

  // ── Start button ──
  document.getElementById('ali_start').addEventListener('click', function() {
    if (state.isProcessing) return;

    // Validate page limit
    var pageLim = document.getElementById('p_lim');
    pageLim.value = clampPages(pageLim.value);

    this.disabled = true;
    this.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري الفحص...<button id="ali_cancel_scan" style="margin-right:8px;padding:4px 12px;border:1px solid rgba(255,255,255,0.4);border-radius:8px;background:transparent;color:white;font-weight:700;cursor:pointer;font-family:'+IOS.font+';font-size:12px">إلغاء</button></div>';
    this.style.opacity = '0.9';
    this.style.cursor = 'not-allowed';

    // زر الإلغاء
    var cancelBtn = document.getElementById('ali_cancel_scan');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (state.abortCtrl) state.abortCtrl.abort();
      });
    }

    totalNoArgs = 0;
    scanPage(false);
  });

  // ══════════════════════════════════════════════
  //  Cleanup (إزالة كل شيء عند الإغلاق)
  // ══════════════════════════════════════════════
  function cleanupPanel() {
    var panelEl = document.getElementById(PANEL_ID);
    if (panelEl) panelEl.remove();
    var styleElm = document.getElementById('ali-pro-css');
    if (styleElm) styleElm.remove();
    var toastBox = document.getElementById('ali-toast-box');
    if (toastBox) toastBox.remove();
    // إلغاء أي عملية جارية
    if (state.abortCtrl) state.abortCtrl.abort();
  }

})();

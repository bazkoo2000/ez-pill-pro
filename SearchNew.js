javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.8';
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
    openedCount: 0,
    tbody: null,
    noNewStreak: 0
  };

  // ═══════════════════════════════════════════
  // Neumorphic Color System
  // ═══════════════════════════════════════════
  const NEU = {
    bg: '#e0e5ec',
    shadowDark: 'rgba(163,177,198,0.6)',
    shadowLight: 'rgba(255,255,255,0.8)',
    insetDark: 'rgba(163,177,198,0.5)',
    insetLight: 'rgba(255,255,255,0.7)',
    text: '#2d3748',
    textMuted: '#718096',
    accent: '#7c3aed',
    accentLight: '#a78bfa',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706'
  };
  
  // ═══════════════════════════════════════════
  // Toast Notifications
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('ali-toast-box');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-box';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#475569' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = 'background:'+NEU.bg+';color:'+colors[type]+';padding:12px 24px;border-radius:16px;font-size:13px;font-weight:700;font-family:Segoe UI,Roboto,sans-serif;box-shadow:6px 6px 14px '+NEU.shadowDark+',-6px -6px 14px '+NEU.shadowLight+';display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
    toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3500);
  }
  
  try{
    var lv=localStorage.getItem(VER_KEY);
    if(lv!==VERSION){
      localStorage.setItem(VER_KEY,VERSION);
      if(lv)setTimeout(function(){showToast('تم التحديث لـ v'+VERSION+' — Neumorphic Design 🎨','success')},1000);
    }
  }catch(e){}
  
  // ═══════════════════════════════════════════
  // Neumorphic Dialog System
  // ═══════════════════════════════════════════
  function showDialog(opts) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(180,190,205,0.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      
      var infoHTML = '';
      if (opts.info && opts.info.length) {
        for (var i = 0; i < opts.info.length; i++) {
          var r = opts.info[i];
          infoHTML +=
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:'+NEU.bg+';border-radius:14px;margin-bottom:8px;box-shadow:inset 3px 3px 6px '+NEU.insetDark+',inset -3px -3px 6px '+NEU.insetLight+'">' +
              '<span style="font-size:13px;color:'+NEU.textMuted+';font-weight:700">' + r.label + '</span>' +
              '<span style="font-weight:900;color:' + (r.color || NEU.accent) + ';font-size:14px;font-family:Segoe UI,monospace">' + r.value + '</span>' +
            '</div>';
        }
      }

      var badgesHTML = '';
      if (opts.badges && opts.badges.length) {
        badgesHTML = '<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding:4px 0 8px">';
        for (var b = 0; b < opts.badges.length; b++) {
          var badge = opts.badges[b];
          var bStyle = badge.active
            ? 'color:'+NEU.accent+';background:linear-gradient(135deg,#ede9fe,#e8e0fd)'
            : 'color:'+NEU.textMuted+';background:'+NEU.bg;
          badgesHTML +=
            '<span style="padding:5px 14px;border-radius:20px;font-size:11px;font-weight:800;'+bStyle+';box-shadow:3px 3px 6px '+NEU.shadowDark+',-3px -3px 6px '+NEU.shadowLight+'">' +
              badge.text +
            '</span>';
        }
        badgesHTML += '</div>';
      }
      
      var buttonsHTML = '';
      if (opts.buttons && opts.buttons.length) {
        for (var j = 0; j < opts.buttons.length; j++) {
          var btn = opts.buttons[j];
          var btnCSS = btn.primary
            ? 'background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:white;box-shadow:4px 4px 12px rgba(124,58,237,0.35),-2px -2px 8px rgba(255,255,255,0.15)'
            : 'background:'+NEU.bg+';color:'+NEU.textMuted+';box-shadow:4px 4px 10px '+NEU.shadowDark+',-4px -4px 10px '+NEU.shadowLight;
          buttonsHTML +=
            '<button data-idx="'+j+'" style="flex:1;padding:16px;border:none;border-radius:16px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;transition:all 0.25s;'+btnCSS+'">'+btn.text+'</button>';
        }
      }
      
      overlay.innerHTML =
        '<div style="background:'+NEU.bg+';border-radius:28px;width:420px;max-width:92vw;overflow:hidden;font-family:Segoe UI,Roboto,sans-serif;direction:rtl;color:'+NEU.text+';box-shadow:12px 12px 30px '+NEU.shadowDark+',-12px -12px 30px '+NEU.shadowLight+';animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">' +
          '<div style="padding:32px 28px 0;text-align:center">' +
            '<div style="width:80px;height:80px;border-radius:50%;background:'+NEU.bg+';box-shadow:6px 6px 14px '+NEU.shadowDark+',-6px -6px 14px '+NEU.shadowLight+',inset 2px 2px 4px '+NEU.insetLight+';display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 18px">'+opts.icon+'</div>' +
            '<div style="font-size:21px;font-weight:900;color:'+NEU.text+';margin-bottom:6px">'+opts.title+'</div>' +
            '<div style="font-size:13px;color:'+NEU.textMuted+';line-height:1.7;font-weight:500">'+opts.desc+'</div>' +
          '</div>' +
          badgesHTML +
          '<div style="padding:20px 28px">' + infoHTML + (opts.body||'') + '</div>' +
          '<div style="padding:8px 28px 28px;display:flex;gap:12px">' + buttonsHTML + '</div>' +
        '</div>';

      overlay.addEventListener('click', function(e) {
        var btnEl = e.target.closest('[data-idx]');
        if (btnEl) {
          var idx = parseInt(btnEl.getAttribute('data-idx'));
          overlay.style.transition = 'opacity 0.2s';
          overlay.style.opacity = '0';
          setTimeout(function() { overlay.remove(); }, 200);
          resolve(opts.buttons[idx].value);
        }
      });
      document.body.appendChild(overlay);
    });
  }
  
  // ═══════════════════════════════════════════
  // CSS — Full Neumorphic
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
    '#'+PANEL_ID+'{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:'+NEU.bg+';border-radius:24px;box-shadow:10px 10px 30px '+NEU.shadowDark+',-10px -10px 30px '+NEU.shadowLight+';z-index:9999999;font-family:Segoe UI,Roboto,sans-serif;direction:rtl;color:'+NEU.text+';overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}' +
    '#'+PANEL_ID+'.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#7c3aed,#a78bfa)!important;box-shadow:6px 6px 16px '+NEU.shadowDark+',-6px -6px 16px '+NEU.shadowLight+'!important;animation:aliPulse 2s infinite;overflow:hidden}' +
    '#'+PANEL_ID+'.ali-minimized .ali-inner{display:none!important}' +
    '#'+PANEL_ID+'.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(styleEl);
  
  // ═══════════════════════════════════════════
  // استخراج عدد الصفحات
  // ═══════════════════════════════════════════
  var calculatedPages = 10;
  try {
    var targetText = 'ready to pack';
    var loc = window.location.href.toLowerCase();
    if (loc.indexOf('new') !== -1) targetText = 'new orders';
    else if (loc.indexOf('packed') !== -1 && loc.indexOf('ready') === -1) targetText = 'packed';
    else if (loc.indexOf('delivered') !== -1) targetText = 'delivered orders';
    var elements = document.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.children.length === 0 && el.textContent && el.textContent.trim().toLowerCase() === targetText) {
        var parent = el.parentElement;
        for (var j = 0; j < 4; j++) {
          if (parent) {
            var txt = parent.innerText || parent.textContent || '';
            var nums = txt.match(/\d+/g);
            if (nums && nums.length > 0) {
              var maxN = 0;
              for (var k = 0; k < nums.length; k++) { var n = parseInt(nums[k]); if (n > maxN) maxN = n; }
              if (maxN > 0) { calculatedPages = Math.ceil(maxN / 10); break; }
            }
            parent = parent.parentElement;
          }
        }
        break;
      }
    }
    if (calculatedPages < 1) calculatedPages = 1;
  } catch (err) {}

  // ═══════════════════════════════════════════
  // Neumorphic Helpers
  // ═══════════════════════════════════════════
  var neuOutset = '6px 6px 14px '+NEU.shadowDark+',-6px -6px 14px '+NEU.shadowLight;
  var neuInset = 'inset 3px 3px 6px '+NEU.insetDark+',inset -3px -3px 6px '+NEU.insetLight;
  var neuBtnSm = '4px 4px 10px '+NEU.shadowDark+',-4px -4px 10px '+NEU.shadowLight;

  function neuStatCard(icon, val, label, color, id) {
    return '<div style="background:'+NEU.bg+';border-radius:16px;padding:14px 8px;text-align:center;box-shadow:'+neuOutset+'">' +
      '<div style="font-size:20px;margin-bottom:6px">'+icon+'</div>' +
      '<div id="'+id+'" style="font-size:24px;font-weight:900;color:'+color+';line-height:1;margin-bottom:4px">'+val+'</div>' +
      '<div style="font-size:10px;color:'+NEU.textMuted+';font-weight:700;letter-spacing:0.5px">'+label+'</div>' +
    '</div>';
  }

  // ═══════════════════════════════════════════
  // Panel — Full Neumorphic Design
  // ═══════════════════════════════════════════
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML =
    '<div class="ali-inner">' +
      // ─── Header (dark gradient kept for contrast) ───
      '<div style="background:linear-gradient(135deg,#4a1d96,#6d28d9);padding:20px 22px 18px;color:white;position:relative;overflow:hidden;border-radius:0 0 24px 24px;box-shadow:0 6px 20px rgba(109,40,217,0.25)">' +
        '<div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.2),transparent 70%);border-radius:50%"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">' +
          '<div style="display:flex;gap:6px">' +
            '<span id="ali_min" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.15);cursor:pointer;transition:0.2s;backdrop-filter:blur(4px)">−</span>' +
            '<span id="ali_close" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.25);cursor:pointer;transition:0.2s;backdrop-filter:blur(4px)">✕</span>' +
          '</div>' +
          '<h3 style="font-size:20px;font-weight:900;letter-spacing:-0.3px;margin:0">EZ-PILL PRO</h3>' +
        '</div>' +
        '<div style="text-align:right;margin-top:4px;position:relative;z-index:1">' +
          '<span style="display:inline-block;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:10px;padding:3px 10px;border-radius:8px;font-weight:700;backdrop-filter:blur(4px)">v'+VERSION+' Neumorphic</span>' +
        '</div>' +
      '</div>' +

      '<div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">' +
        // ─── Stats ───
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">' +
          neuStatCard('📊', '0', 'إجمالي', '#8b5cf6', 'stat_total') +
          neuStatCard('🔍', '0', 'مطابق', '#10b981', 'stat_match') +
          neuStatCard('🚀', '0', 'تم فتحه', '#3b82f6', 'stat_opened') +
        '</div>' +
        
        // ─── Pages Setting ───
        '<div id="ali_settings_box" style="background:'+NEU.bg+';border-radius:18px;padding:16px;margin-bottom:16px;box-shadow:'+neuOutset+'">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
            '<span style="font-size:13px;font-weight:800;color:'+NEU.text+'">📄 عدد الصفحات</span>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-size:12px;color:'+NEU.textMuted+';font-weight:600">صفحة</span>' +
              '<input type="number" id="p_lim" value="'+calculatedPages+'" min="1" style="width:70px;padding:8px 6px;border:none;border-radius:12px;text-align:center;font-size:16px;font-weight:900;color:'+NEU.accent+';background:'+NEU.bg+';outline:none;font-family:Segoe UI,Roboto,sans-serif;box-shadow:'+neuInset+'">' +
            '</div>' +
          '</div>' +
          '<div id="p-bar" style="height:8px;background:'+NEU.bg+';border-radius:10px;overflow:hidden;box-shadow:'+neuInset+'">' +
            '<div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#a78bfa,#c4b5fd);border-radius:10px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)"></div>' +
          '</div>' +
        '</div>' +

        // ─── Status ───
        '<div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:'+NEU.bg+';color:#059669;box-shadow:'+neuInset+'">' +
          '<span>✅</span><span>جاهز للبدء التلقائي</span>' +
        '</div>' +
        
        // ─── Dynamic Area ───
        '<div id="ali_dynamic_area">' +
          '<button id="ali_start" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:6px 6px 14px rgba(109,40,217,0.3),-4px -4px 10px '+NEU.shadowLight+';transition:all 0.3s">' +
            '🚀 بدء الفحص الذكي' +
          '</button>' +
        '</div>' +
        
        '<div style="text-align:center;padding:14px 0 4px;font-size:10px;color:'+NEU.textMuted+';font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(panel);
  
  // ═══════════════════════════════════════════
  // Core Helpers
  // ═══════════════════════════════════════════
  function setStatus(text, type) {
    var el = document.getElementById('status-msg');
    if (!el) return;
    var configs = {
      ready:   { color:'#059669', icon:'✅' },
      working: { color:'#6d28d9', icon:'spinner' },
      error:   { color:'#dc2626', icon:'❌' },
      done:    { color:'#059669', icon:'🎉' },
      sync:    { color:'#a16207', icon:'spinner' }
    };
    var c = configs[type] || configs.ready;
    var iconHTML = c.icon === 'spinner'
      ? '<div style="width:16px;height:16px;border:2.5px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : '<span>'+c.icon+'</span>';
    el.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:'+NEU.bg+';color:'+c.color+';box-shadow:'+neuInset+';transition:all 0.3s';
    el.innerHTML = iconHTML + '<span>'+text+'</span>';
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
  
  function debounce(fn, delay) { var t; return function() { clearTimeout(t); t = setTimeout(fn, delay); }; }

  function getCurrentStatus() {
    var s = 'readypack';
    var l = window.location.href.toLowerCase();
    if (l.indexOf('new') !== -1) s = 'new';
    else if (l.indexOf('packed') !== -1 && l.indexOf('ready') === -1) s = 'packed';
    else if (l.indexOf('delivered') !== -1) s = 'delivered';
    return s;
  }
  
  // ═══════════════════════════════════════════
  // Header Events
  // ═══════════════════════════════════════════
  panel.addEventListener('click', function(e) {
    if (panel.classList.contains('ali-minimized')) { panel.classList.remove('ali-minimized'); e.stopPropagation(); }
  });
  document.getElementById('ali_close').addEventListener('click', function(e) {
    e.stopPropagation();
    panel.style.animation = 'aliSlideIn 0.3s reverse';
    setTimeout(function() { panel.remove(); }, 280);
  });
  document.getElementById('ali_min').addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.add('ali-minimized');
  });
  
  // ═══════════════════════════════════════════
  // Safe Label
  // ═══════════════════════════════════════════
  function createSafeLabel(inv, args) {
    var label = document.createElement('label');
    label.style.cssText = 'cursor:pointer;color:'+NEU.accent+';text-decoration:underline;font-weight:bold';
    label.textContent = inv;
    if (args) {
      label.addEventListener('click', function() { getDetails(args[0], args[1], args[2], args[3]); });
    }
    return label;
  }

  // ═══════════════════════════════════════════
  // API Helpers
  // ═══════════════════════════════════════════
  async function fetchPageOrders(pageNum, currentStatus) {
    var baseUrl = window.location.origin + "/ez_pill_web/";
    var res = await fetch(baseUrl + 'Home/getOrders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus, pageSelected: pageNum, searchby: '' })
    });
    return await res.json();
  }

  function buildOrderRow(item, templateRow) {
    var inv = item.Invoice || '';
    var onl = item.onlineNumber || '';
    var typee = item.typee !== undefined ? item.typee : '';
    var head_id = item.head_id !== undefined ? item.head_id : '';
    var args = null;
    if (onl !== '' && inv !== '') args = [onl.replace(/ERX/gi, ''), inv, typee, head_id];

    var clone;
    if (templateRow) {
      clone = templateRow.cloneNode(true);
      var cells = clone.querySelectorAll('td');
      if (cells.length > 3) {
        cells[0].innerHTML = '';
        cells[0].appendChild(createSafeLabel(inv, args));
        cells[1].textContent = onl;
        cells[2].textContent = item.guestName || '';
        cells[3].textContent = item.guestMobile || item.mobile || '';
      }
    } else {
      clone = document.createElement('tr');
      var td0 = document.createElement('td'), td1 = document.createElement('td'), td2 = document.createElement('td'), td3 = document.createElement('td');
      td0.appendChild(createSafeLabel(inv, args));
      td1.textContent = onl;
      td2.textContent = item.guestName || '';
      td3.textContent = item.guestMobile || item.mobile || '';
      clone.appendChild(td0); clone.appendChild(td1); clone.appendChild(td2); clone.appendChild(td3);
    }
    return { id: inv, onl: onl, node: clone, args: args, hasArgs: args !== null };
  }

  // ═══════════════════════════════════════════
  // Scan Pages
  // ═══════════════════════════════════════════
  var totalNoArgs = 0;
  async function scanPage(isSync) {
    state.isProcessing = true;
    var fill = document.getElementById('p-fill');
    var currentStatus = getCurrentStatus();

    try {
      setStatus(isSync ? 'جاري المزامنة...' : 'جاري حساب الصفحات...', isSync ? 'sync' : 'working');
      var maxPages = parseInt(document.getElementById('p_lim').value) || 1;

      var tables = document.querySelectorAll('table');
      var targetTable = tables[0];
      for (var t = 0; t < tables.length; t++) { if (tables[t].innerText.length > targetTable.innerText.length) targetTable = tables[t]; }
      var tbody = targetTable.querySelector('tbody') || targetTable;
      var templateRow = tbody.querySelector('tr');
      var consecutiveEmpty = 0;
      
      for (var page = 1; page <= maxPages; page++) {
        if (fill) fill.style.width = ((page / maxPages) * 100) + '%';
        setStatus((isSync?'مزامنة':'تحليل')+' الصفحة '+page+' من '+maxPages+' ...', isSync?'sync':'working');

        var data = await fetchPageOrders(page, currentStatus);
        if (page === 1 && data.total_orders) {
          var exactTotal = parseInt(data.total_orders) || 0;
          if (exactTotal > 0) { maxPages = Math.ceil(exactTotal / 10); document.getElementById('p_lim').value = maxPages; }
        }

        var orders = [];
        try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
        if (!orders || orders.length === 0) { consecutiveEmpty++; if (consecutiveEmpty >= 2) break; continue; }
        else consecutiveEmpty = 0;

        var noArgsCount = 0;
        for (var i = 0; i < orders.length; i++) {
          var inv = orders[i].Invoice || '';
          if (inv.length > 3 && !state.visitedSet.has(inv)) {
            state.visitedSet.add(inv);
            var rowData = buildOrderRow(orders[i], templateRow);
            if (!rowData.hasArgs) noArgsCount++;
            state.savedRows.push(rowData);
          }
        }
        totalNoArgs += noArgsCount;
        updateStats();
      }
      finishScan(isSync);
    } catch (err) {
      console.error(err);
      setStatus('حدث خطأ في الاتصال بالخادم', 'error');
      showToast('مشكلة في سحب البيانات!', 'error');
      state.isProcessing = false;
      state.isSyncing = false;
    }
  }

  // ═══════════════════════════════════════════
  // ✅ Smart Sync
  // ═══════════════════════════════════════════
  async function smartSync() {
    state.isSyncing = true;
    state.isProcessing = true;
    var fill = document.getElementById('p-fill');
    var currentStatus = getCurrentStatus();

    try {
      setStatus('جاري جلب البيانات الحديثة...', 'sync');
      var serverOrders = new Map();
      var maxPages = parseInt(document.getElementById('p_lim').value) || 1;
      var consecutiveEmpty = 0;

      var firstData = await fetchPageOrders(1, currentStatus);
      if (firstData.total_orders) {
        var exactTotal = parseInt(firstData.total_orders) || 0;
        if (exactTotal > 0) { maxPages = Math.ceil(exactTotal / 10); document.getElementById('p_lim').value = maxPages; }
      }

      var firstOrders = [];
      try { firstOrders = typeof firstData.orders_list === 'string' ? JSON.parse(firstData.orders_list) : firstData.orders_list; } catch(e) {}
      if (firstOrders && firstOrders.length > 0) {
        for (var fi = 0; fi < firstOrders.length; fi++) {
          var fInv = firstOrders[fi].Invoice || '';
          if (fInv.length > 3) serverOrders.set(fInv, firstOrders[fi]);
        }
      }
      if (fill) fill.style.width = ((1 / maxPages) * 100) + '%';

      for (var page = 2; page <= maxPages; page++) {
        if (fill) fill.style.width = ((page / maxPages) * 100) + '%';
        setStatus('مزامنة الصفحة '+page+' من '+maxPages+'...', 'sync');
        var data = await fetchPageOrders(page, currentStatus);
        var orders = [];
        try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
        if (!orders || orders.length === 0) { consecutiveEmpty++; if (consecutiveEmpty >= 2) break; continue; }
        else consecutiveEmpty = 0;
        for (var oi = 0; oi < orders.length; oi++) {
          var oInv = orders[oi].Invoice || '';
          if (oInv.length > 3) serverOrders.set(oInv, orders[oi]);
        }
      }

      setStatus('جاري مقارنة البيانات...', 'sync');
      var oldIds = new Set(state.savedRows.map(function(r) { return r.id; }));
      var removedIds = [];
      var keptRows = [];
      for (var ri = 0; ri < state.savedRows.length; ri++) {
        if (serverOrders.has(state.savedRows[ri].id)) keptRows.push(state.savedRows[ri]);
        else removedIds.push(state.savedRows[ri].id);
      }

      var tables = document.querySelectorAll('table');
      var targetTable = tables[0];
      for (var t = 0; t < tables.length; t++) { if (tables[t].innerText.length > targetTable.innerText.length) targetTable = tables[t]; }
      var tbody = targetTable.querySelector('tbody') || targetTable;
      var templateRow = tbody.querySelector('tr');

      var newRows = [];
      var noArgsNew = 0;
      serverOrders.forEach(function(item, inv) {
        if (!oldIds.has(inv)) {
          var rowData = buildOrderRow(item, templateRow);
          if (!rowData.hasArgs) noArgsNew++;
          newRows.push(rowData);
        }
      });

      state.savedRows = keptRows.concat(newRows);
      state.visitedSet.clear();
      for (var si = 0; si < state.savedRows.length; si++) state.visitedSet.add(state.savedRows[si].id);

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
      var summaryText = summaryParts.join(' | ') + ' — الإجمالي: '+state.savedRows.length;
      setStatus('تمت المزامنة — '+summaryText, 'done');
      if (noArgsNew > 0) showToast(noArgsNew+' طلب جديد بدون بيانات فتح', 'warning');

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
          { label: 'تم إزالته (مُغلق)', value: removedIds.length.toString(), color: removedIds.length > 0 ? '#dc2626' : '#94a3b8' },
          { label: 'أوردرات جديدة', value: newRows.length.toString(), color: newRows.length > 0 ? '#059669' : '#94a3b8' },
          { label: 'الإجمالي الحالي', value: state.savedRows.length.toString(), color: '#7c3aed' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '👍 تمام', value: 'ok', primary: true }
        ]
      });
      showToast(summaryText, 'success');
    } catch (err) {
      console.error('Sync error:', err);
      setStatus('خطأ في المزامنة — حاول تاني', 'error');
      showToast('فشلت المزامنة: '+(err.message||'خطأ غير متوقع'), 'error');
    } finally {
      state.isSyncing = false;
      state.isProcessing = false;
      var syncBtn = document.getElementById('ali_btn_sync');
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = '🔄 مزامنة ذكية';
        syncBtn.style.boxShadow = neuBtnSm;
        syncBtn.style.color = NEU.textMuted;
      }
    }
  }
  
  // ═══════════════════════════════════════════
  // Finish Scan
  // ═══════════════════════════════════════════
  function finishScan(isSync) {
    state.isProcessing = false;
    state.isSyncing = false;
    var tables = document.querySelectorAll('table');
    var target = tables[0];
    for (var t = 0; t < tables.length; t++) { if (tables[t].innerText.length > target.innerText.length) target = tables[t]; }
    state.tbody = target.querySelector('tbody') || target;
    state.tbody.innerHTML = '';
    for (var i = 0; i < state.savedRows.length; i++) {
      state.savedRows[i].node.style.cursor = 'pointer';
      state.tbody.appendChild(state.savedRows[i].node);
    }
    updateStats(state.savedRows.length);
    if (totalNoArgs > 0) showToast(totalNoArgs+' طلب بدون بيانات فتح', 'warning');
    if (isSync) {
      setStatus('تمت المزامنة — '+state.savedRows.length+' طلب', 'done');
      showToast('تمت المزامنة: '+state.savedRows.length+' طلب', 'success');
    } else {
      setStatus('تم التجميع — '+state.savedRows.length+' طلب جاهز', 'done');
      showToast('تم تجميع '+state.savedRows.length+' طلب بنجاح', 'success');
    }
    buildSearchUI();
  }

  // ═══════════════════════════════════════════
  // Build Search UI — Neumorphic
  // ═══════════════════════════════════════════
  function buildSearchUI() {
    var dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML =
      // ─── Invoice Search ───
      '<div style="margin-bottom:10px">' +
        '<div style="position:relative">' +
          '<span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:900;color:'+NEU.textMuted+';z-index:1;pointer-events:none;font-family:monospace">0</span>' +
          '<input type="text" id="ali_sI" placeholder="أدخل الأرقام بعد الـ 0..." style="width:100%;padding:14px 16px 14px 34px;border:none;border-radius:14px;font-size:15px;font-family:Segoe UI,monospace;outline:none;background:'+NEU.bg+';color:'+NEU.text+';direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700;box-sizing:border-box;box-shadow:'+neuInset+'">' +
        '</div>' +
      '</div>' +
      // ─── Order Search ───
      '<div style="margin-bottom:10px">' +
        '<div style="position:relative">' +
          '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;z-index:1;pointer-events:none">🔗</span>' +
          '<input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:none;border-radius:14px;font-size:14px;font-family:Segoe UI,Roboto,sans-serif;outline:none;background:'+NEU.bg+';color:'+NEU.text+';direction:rtl;transition:all 0.25s;font-weight:600;box-sizing:border-box;box-shadow:'+neuInset+'">' +
        '</div>' +
      '</div>' +
      '<div id="ali_search_count" style="font-size:11px;color:'+NEU.textMuted+';text-align:center;font-weight:600;padding:2px 0 12px">' +
        'عرض '+state.savedRows.length+' من '+state.savedRows.length+' نتيجة' +
      '</div>' +
      // ─── Open Button ───
      '<button id="ali_btn_open" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:6px 6px 14px rgba(5,150,105,0.3),-4px -4px 10px '+NEU.shadowLight+';transition:all 0.3s;margin-bottom:10px">' +
        '⚡ ابحث أولاً ثم افتح المطابق' +
      '</button>' +
      // ─── Sync Button ───
      '<button id="ali_btn_sync" style="width:100%;padding:14px 16px;border:none;border-radius:16px;cursor:pointer;font-weight:800;font-size:13px;font-family:Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:'+NEU.bg+';color:'+NEU.textMuted+';box-shadow:'+neuBtnSm+';transition:all 0.3s">' +
        '🔄 مزامنة ذكية' +
      '</button>';
      
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
        if (show) { state.tbody.appendChild(row.node); shown++; if (hasFilter) currentMatches.push(row); }
      }
      
      searchCount.innerText = 'عرض '+shown+' من '+state.savedRows.length+' نتيجة';
      updateStats(shown);
      
      if (hasFilter && currentMatches.length > 0) {
        var openable = currentMatches.filter(function(r) { return r.args !== null; }).length;
        openBtn.innerHTML = '⚡ فتح المطابق ('+openable+' طلب)';
        openBtn.style.opacity = '1'; openBtn.style.cursor = 'pointer';
      } else if (hasFilter && currentMatches.length === 0) {
        openBtn.innerHTML = '⚡ لا توجد نتائج مطابقة';
        openBtn.style.opacity = '0.5'; openBtn.style.cursor = 'not-allowed';
      } else {
        openBtn.innerHTML = '⚡ ابحث أولاً ثم افتح المطابق';
        openBtn.style.opacity = '0.7'; openBtn.style.cursor = 'not-allowed';
      }
      
      // Input visual feedback
      if (rawInvoice.length > 0 && shown === 0) { sI.style.boxShadow = 'inset 3px 3px 6px rgba(239,68,68,0.2),inset -3px -3px 6px rgba(255,255,255,0.7)'; }
      else if (rawInvoice.length > 0 && shown > 0) { sI.style.boxShadow = 'inset 3px 3px 6px rgba(16,185,129,0.2),inset -3px -3px 6px rgba(255,255,255,0.7)'; }
      else { sI.style.boxShadow = neuInset; }

      if (orderSearch.length > 0 && shown === 0) { sO.style.boxShadow = 'inset 3px 3px 6px rgba(239,68,68,0.2),inset -3px -3px 6px rgba(255,255,255,0.7)'; }
      else if (orderSearch.length > 0 && shown > 0) { sO.style.boxShadow = 'inset 3px 3px 6px rgba(16,185,129,0.2),inset -3px -3px 6px rgba(255,255,255,0.7)'; }
      else { sO.style.boxShadow = neuInset; }
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
        sI.focus(); sI.style.animation = 'aliBlink 0.5s 3';
        setTimeout(function() { sI.style.animation = ''; }, 1500);
        return;
      }
      var openable = currentMatches.filter(function(r) { return r.args !== null; });
      var skipped = currentMatches.length - openable.length;
      if (openable.length === 0) {
        showToast(skipped > 0 ? skipped+' طلب مطابق لكن بدون بيانات فتح!' : 'لا توجد طلبات مطابقة!', skipped > 0 ? 'error' : 'warning');
        return;
      }
      if (skipped > 0) showToast('⚠️ تم تخطي '+skipped+' طلب بدون بيانات فتح', 'warning');
      
      openBtn.disabled = true; openBtn.style.opacity = '0.6'; openBtn.style.cursor = 'not-allowed';
      var opened = 0, failed = 0;
      var base = window.location.origin + "/ez_pill_web/getEZPill_Details";
      
      for (var idx = 0; idx < openable.length; idx++) {
        var item = openable[idx];
        var url = base + "?onlineNumber="+encodeURIComponent(item.args[0])+"&Invoice="+encodeURIComponent(item.args[1])+"&typee="+encodeURIComponent(item.args[2])+"&head_id="+encodeURIComponent(item.args[3]);
        try {
          var w = window.open(url, "_blank");
          if (w) { opened++; state.openedCount++; window.focus(); try{w.blur();}catch(e){} } else failed++;
        } catch (e) { failed++; }
        openBtn.innerHTML = '🚀 جاري الفتح ('+( idx+1)+'/'+openable.length+')';
        setStatus('فتح '+(idx+1)+' من '+openable.length+': '+(item.onl||item.id), 'working');
        updateStats();
        if (idx < openable.length - 1) await new Promise(function(r) { setTimeout(r, 1200); });
      }
      showToast('تم فتح '+opened+' طلب (فشل '+failed+')', opened > 0 ? 'success' : 'error');
      setStatus('تم فتح '+opened+' — الإجمالي: '+state.openedCount, 'done');
      openBtn.disabled = false;
      openBtn.innerHTML = '⚡ فتح المطابق ('+openable.length+' طلب)';
      filterResults();
    });
    
    // ─── ✅ Sync Button ───
    document.getElementById('ali_btn_sync').addEventListener('click', async function() {
      if (state.isSyncing || state.isProcessing) { showToast('المزامنة شغالة بالفعل — انتظر!', 'warning'); return; }
      var syncBtn = this;
      var oldCount = state.savedRows.length;
      
      var result = await showDialog({
        icon: '🔄',
        title: 'المزامنة الذكية',
        desc: 'هيتم مقارنة بياناتك مع الخادم — حذف المُغلق وإضافة الجديد',
        badges: [
          { text: 'حذف المُغلق', active: true },
          { text: 'إضافة الجديد', active: true },
          { text: 'تحديث البيانات', active: true }
        ],
        info: [
          { label: 'الطلبات الحالية', value: oldCount.toString(), color: '#7c3aed' },
          { label: 'العملية', value: 'مقارنة + تحديث ذكي', color: '#3b82f6' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel', primary: false },
          { text: '🔄 بدء المزامنة', value: 'confirm', primary: true }
        ]
      });
      
      if (result !== 'confirm') return;
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div style="width:14px;height:14px;border:2.5px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري المزامنة...';
      syncBtn.style.boxShadow = neuInset;
      syncBtn.style.color = NEU.accent;
      
      await smartSync();
      buildSearchUI();
    });
  }
  
  // ═══════════════════════════════════════════
  // Start
  // ═══════════════════════════════════════════
  document.getElementById('ali_start').addEventListener('click', function() {
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري الفحص...';
    this.style.opacity = '0.7'; this.style.cursor = 'not-allowed';
    this.style.boxShadow = neuInset;
    totalNoArgs = 0;
    scanPage(false);
  });
})();

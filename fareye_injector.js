javascript:(function(){
  'use strict';

  var PANEL_ID = 'fareye_injector';
  var VERSION = '1.7';
  var VER_KEY = 'fareye_ver';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  var state = { orders:[], injectedCount:0, failedCount:0, isRunning:false, delayMs:600 };

  function showToast(msg, type) {
    type = type || 'info';
    var box = document.getElementById('fareye-toast-box');
    if (!box) { box = document.createElement('div'); box.id = 'fareye-toast-box'; box.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center'; document.body.appendChild(box); }
    var colors = {success:'#059669',error:'#dc2626',warning:'#d97706',info:'#1e293b'};
    var icons = {success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    var t = document.createElement('div');
    t.style.cssText = 'background:'+colors[type]+';color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:feyToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
    t.innerHTML = '<span>'+icons[type]+'</span> '+msg;
    box.appendChild(t);
    setTimeout(function(){t.style.transition='all 0.3s';t.style.opacity='0';setTimeout(function(){t.remove()},300)},3500);
  }
  try{var lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(function(){showToast('تم تلقي تحديث جديد 🎉 → v'+VERSION,'success')},1000);}}catch(e){}

  function showDialog(o) {
    return new Promise(function(resolve) {
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:feyFadeIn 0.25s';
      var ibg = {blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)',green:'linear-gradient(135deg,#dcfce7,#bbf7d0)',amber:'linear-gradient(135deg,#fef3c7,#fde68a)',red:'linear-gradient(135deg,#fee2e2,#fecaca)',purple:'linear-gradient(135deg,#ede9fe,#ddd6fe)'};
      var ih='',bh='';
      if(o.info)for(var i=0;i<o.info.length;i++){var r=o.info[i];ih+='<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">'+r.label+'</span><span style="font-weight:800;color:'+(r.color||'#1e293b')+';font-size:12px">'+r.value+'</span></div>';}
      if(o.buttons)for(var j=0;j<o.buttons.length;j++)bh+='<button data-idx="'+j+'" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,sans-serif;'+(o.buttons[j].style||'background:#f1f5f9;color:#475569')+';transition:all 0.2s">'+o.buttons[j].text+'</button>';
      ov.innerHTML='<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;animation:feyDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:'+(ibg[o.iconColor]||ibg.blue)+'">'+o.icon+'</div><div style="font-size:20px;font-weight:900;margin-bottom:6px">'+o.title+'</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">'+o.desc+'</div></div><div style="padding:20px 24px">'+ih+(o.body||'')+'</div><div style="padding:16px 24px 24px;display:flex;gap:10px">'+bh+'</div></div>';
      ov.addEventListener('click',function(e){var b=e.target.closest('[data-idx]');if(b){ov.remove();resolve(o.buttons[parseInt(b.getAttribute('data-idx'))].value);}});
      document.body.appendChild(ov);
    });
  }

  var css = document.createElement('style');
  css.innerHTML =
    '@keyframes feySlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}'+
    '@keyframes feyPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
    '@keyframes feySpin{to{transform:rotate(360deg)}}'+
    '@keyframes feyFadeIn{from{opacity:0}to{opacity:1}}'+
    '@keyframes feyDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}'+
    '@keyframes feyToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes feyCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}'+
    '@keyframes feyBlink{0%,100%{opacity:1}50%{opacity:0.3}}'+
    '#'+PANEL_ID+'{position:fixed;top:3%;left:2%;width:390px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(124,58,237,0.1);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s;animation:feySlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}'+
    '#'+PANEL_ID+'.fey-min{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6d28d9,#8b5cf6)!important;box-shadow:0 8px 30px rgba(124,58,237,0.4)!important;animation:feyPulse 2s infinite;overflow:hidden}'+
    '#'+PANEL_ID+'.fey-min .fey-inner{display:none!important}'+
    '#'+PANEL_ID+'.fey-min::after{content:"📋";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(css);

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML =
    '<div class="fey-inner">'+
      '<div style="background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">'+
        '<div style="position:absolute;top:-50%;left:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.2),transparent 70%);border-radius:50%"></div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">'+
          '<div style="display:flex;gap:6px">'+
            '<span id="fey_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span>'+
            '<span id="fey_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>'+
          '</div>'+
          '<h3 style="font-size:20px;font-weight:900;margin:0">FAREYE</h3>'+
        '</div>'+
        '<div style="text-align:right;margin-top:4px;position:relative;z-index:1"><span style="display:inline-block;background:rgba(167,139,250,0.25);color:#c4b5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v1.7</span></div>'+
      '</div>'+
      '<div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="fey_body">'+
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">'+
          '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#a78bfa)"></div><div style="font-size:18px;margin-bottom:4px">📋</div><div id="fey_s_t" style="font-size:22px;font-weight:900;color:#8b5cf6;line-height:1;margin-bottom:2px">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">إجمالي</div></div>'+
          '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#10b981,#34d399)"></div><div style="font-size:18px;margin-bottom:4px">✅</div><div id="fey_s_d" style="font-size:22px;font-weight:900;color:#10b981;line-height:1;margin-bottom:2px">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">تم رفعه</div></div>'+
          '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#ef4444,#f87171)"></div><div style="font-size:18px;margin-bottom:4px">❌</div><div id="fey_s_f" style="font-size:22px;font-weight:900;color:#ef4444;line-height:1;margin-bottom:2px">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">فشل</div></div>'+
        '</div>'+
        '<div id="fey_main">'+
          '<div id="fey_upload" style="border:2px dashed #d8b4fe;border-radius:16px;padding:30px 20px;text-align:center;cursor:pointer;transition:all 0.3s;background:#faf5ff;margin-bottom:16px">'+
            '<div style="font-size:40px;margin-bottom:8px">📂</div>'+
            '<div style="font-size:15px;font-weight:800;color:#6d28d9;margin-bottom:4px">اضغط لرفع ملف الطلبات</div>'+
            '<div style="font-size:12px;color:#a78bfa;font-weight:600">ملف .txt (أرقام ERX)</div>'+
            '<input type="file" id="fey_file" accept=".txt,.csv" multiple style="display:none">'+
          '</div>'+
          '<div style="text-align:center;color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:12px">— أو أدخل يدوياً —</div>'+
          '<textarea id="fey_manual" placeholder="الصق أرقام الطلبات (سطر لكل رقم)..." style="width:100%;height:80px;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:13px;font-family:Consolas,monospace;outline:none;background:#f8fafc;color:#1e293b;direction:ltr;text-align:left;resize:vertical;box-sizing:border-box;line-height:1.6"></textarea>'+
          '<div id="fey_status" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin:12px 0;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز</span></div>'+
          '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">'+
            '<span style="font-size:13px;font-weight:700;color:#475569">⏱️ التأخير:</span>'+
            '<div style="display:flex;align-items:center;gap:6px"><input type="range" id="fey_speed" min="300" max="2000" value="600" step="100" style="width:80px;accent-color:#8b5cf6"><span id="fey_speed_l" style="font-size:13px;font-weight:800;color:#8b5cf6;min-width:42px;text-align:center">0.6s</span></div>'+
          '</div>'+
          '<button id="fey_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:not-allowed;font-weight:800;font-size:15px;font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:0 4px 15px rgba(124,58,237,0.3);transition:all 0.3s;margin-bottom:8px;opacity:0.5" disabled>📤 رفع الطلبات (ارفع ملف أولاً)</button>'+
        '</div>'+
        '<div id="fey_pw" style="display:none;margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:#475569">التقدم</span><span id="fey_pt" style="font-size:12px;font-weight:800;color:#8b5cf6">0/0</span></div><div style="height:10px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="fey_pf" style="height:100%;width:0%;background:linear-gradient(90deg,#8b5cf6,#a78bfa,#c4b5fd);border-radius:10px;transition:width 0.5s"></div></div></div>'+
        '<div id="fey_lw" style="display:none;background:#1e293b;border-radius:14px;padding:12px;margin-bottom:12px;max-height:180px;overflow-y:auto"><div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px;direction:rtl">📝 سجل:</div><div id="fey_log" style="font-size:11px;color:#e2e8f0;font-family:Consolas,monospace;direction:ltr;text-align:left;line-height:1.8"></div></div>'+
        '<div style="text-align:center;padding:14px 0 4px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>'+
      '</div>'+
    '</div>';
  document.body.appendChild(panel);

  // ─── Helpers ───
  function animN(id,v){var e=document.getElementById(id);if(!e||e.innerText===String(v))return;requestAnimationFrame(function(){e.innerText=v;e.style.animation='feyCountUp 0.4s';setTimeout(function(){e.style.animation=''},400)});}
  function upStats(){animN('fey_s_t',state.orders.length);animN('fey_s_d',state.injectedCount);animN('fey_s_f',state.failedCount);}
  function setSt(t,type){var e=document.getElementById('fey_status');if(!e)return;var c={ready:{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'✅'},working:{bg:'#f5f3ff',co:'#6d28d9',bo:'#ddd6fe',ic:'spinner'},error:{bg:'#fef2f2',co:'#dc2626',bo:'#fecaca',ic:'❌'},done:{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'🎉'},loaded:{bg:'#f5f3ff',co:'#6d28d9',bo:'#ddd6fe',ic:'📋'},waiting:{bg:'#fefce8',co:'#a16207',bo:'#fef08a',ic:'blink'}}[type]||{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'✅'};var ih=c.ic==='spinner'?'<div style="width:16px;height:16px;border:2px solid rgba(124,58,237,0.2);border-top-color:#8b5cf6;border-radius:50%;animation:feySpin 0.8s linear infinite;flex-shrink:0"></div>':c.ic==='blink'?'<span style="font-size:20px;animation:feyBlink 0.8s infinite">👆</span>':'<span>'+c.ic+'</span>';e.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin:12px 0;font-size:13px;font-weight:600;background:'+c.bg+';color:'+c.co+';border:1px solid '+c.bo;e.innerHTML=ih+'<span>'+t+'</span>';}
  function addLog(t,type){var l=document.getElementById('fey_log');if(!l)return;var co={ok:'#34d399',err:'#f87171',info:'#94a3b8',warn:'#fbbf24',debug:'#818cf8'};var d=document.createElement('div');d.innerHTML='<span style="color:'+(co[type]||co.info)+'">'+t+'</span>';l.appendChild(d);l.parentElement.scrollTop=l.parentElement.scrollHeight;}
  function parse(t){return t.split(/[\n\r]+/).map(function(l){return l.trim()}).filter(function(l){return l.length>0});}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)});}

  // ═══════════════════════════════════════════════════════════════
  //  Injection — نفس طريقة v1.4 بالظبط
  // ═══════════════════════════════════════════════════════════════

  var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

  function getInput() {
    return document.getElementById('rc_select_1')
      || document.querySelector('input.ant-select-selection-search-input[role="combobox"]')
      || document.querySelector('input.ant-select-selection-search-input')
      || document.querySelector('input[aria-haspopup="listbox"]');
  }

  function getSelector() {
    var input = getInput();
    if (!input) return null;
    return input.closest('.ant-select-selector') || input.closest('.ant-select');
  }

  function countTags() {
    return document.querySelectorAll('.ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix)').length;
  }

  async function waitForOpen(input, timeout) {
    var start = Date.now();
    while (Date.now() - start < timeout) {
      if (input.getAttribute('aria-expanded') === 'true') return true;
      await wait(50);
    }
    return false;
  }

  async function forceOpenSelect() {
    var input = getInput();
    var selector = getSelector();
    if (!input || !selector) return false;

    selector.dispatchEvent(new MouseEvent('mousedown', { bubbles:true, cancelable:true }));
    selector.dispatchEvent(new MouseEvent('mouseup', { bubbles:true, cancelable:true }));
    selector.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
    await wait(50);

    input.focus();
    await wait(50);

    if (input.getAttribute('aria-expanded') !== 'true') {
      var overflow = document.querySelector('.ant-select-selection-overflow');
      if (overflow) {
        overflow.dispatchEvent(new MouseEvent('mousedown', { bubbles:true }));
        overflow.click();
        await wait(50);
        input.focus();
      }
    }

    if (input.getAttribute('aria-expanded') !== 'true') {
      input.dispatchEvent(new KeyboardEvent('keydown', { key:'ArrowDown', code:'ArrowDown', keyCode:40, bubbles:true }));
      await wait(50);
    }

    var isOpen = await waitForOpen(input, 400);
    return isOpen;
  }

  async function injectOne(orderNum) {
    var input = getInput();
    if (!input) return false;

    var tagsBefore = countTags();

    // فتح الـ Select
    var opened = await forceOpenSelect();
    addLog('  📂 open=' + (opened?'yes':'no') + ' aria=' + input.getAttribute('aria-expanded'), 'debug');

    // مسح
    nativeSetter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles:true }));
    await wait(30);

    // كتابة بـ execCommand
    input.focus();
    document.execCommand('selectAll', false);
    document.execCommand('delete', false);
    document.execCommand('insertText', false, orderNum);
    await wait(50);

    // fallback
    if (input.value !== orderNum) {
      nativeSetter.call(input, orderNum);
      input.dispatchEvent(new Event('input', { bubbles:true }));
      input.dispatchEvent(new Event('change', { bubbles:true }));
      input.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:orderNum }));
    }
    await wait(80);

    addLog('  ✏️ val="' + input.value + '"', 'debug');

    // Enter
    var enterOpts = { key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true, cancelable:true };
    input.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
    await wait(30);
    input.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
    await wait(30);
    input.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
    await wait(200);

    var tagsAfter = countTags();

    // retry Enter
    if (tagsAfter <= tagsBefore) {
      input.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
      await wait(50);
      input.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
      await wait(200);
      tagsAfter = countTags();
    }

    addLog('  🏷️ tags: ' + tagsBefore + '→' + tagsAfter, 'debug');
    return tagsAfter > tagsBefore;
  }

  // ─── تنبيه صغير تحت + كشف لمس الخانة ───
  function showTouchBanner(input) {
    return new Promise(function(resolve) {
      var resolved = false;
      var selector = getSelector();
      var antSelect = input.closest('.ant-select');

      // تنبيه صغير تحت
      var alert = document.createElement('div');
      alert.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);opacity:0;z-index:99999999;background:linear-gradient(135deg,#4c1d95,#6d28d9);color:white;padding:14px 28px;border-radius:16px;font-family:Segoe UI,sans-serif;direction:rtl;display:flex;align-items:center;gap:10px;box-shadow:0 10px 40px rgba(124,58,237,0.4);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
      alert.innerHTML = '<span style="font-size:22px;animation:feyBlink 0.8s infinite">👆</span><span style="font-weight:700;font-size:14px">المس خانة Reference Number</span><span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:8px;font-size:12px;font-weight:800">' + state.orders.length + ' طلب</span>';
      document.body.appendChild(alert);
      requestAnimationFrame(function(){alert.style.opacity='1';alert.style.transform='translateX(-50%) translateY(0)';});

      function done() {
        if (resolved) return;
        resolved = true;
        clearInterval(pollTimer);
        if (observer) observer.disconnect();
        input.removeEventListener('focus', onTouch);
        if (selector) selector.removeEventListener('mousedown', onTouch, true);
        if (antSelect) antSelect.removeEventListener('click', onTouch, true);
        // اختفاء
        alert.style.opacity='0';alert.style.transform='translateX(-50%) translateY(20px)';
        setTimeout(function(){alert.remove()},400);
        resolve(true);
      }

      // 1. Polling
      var pollTimer = setInterval(function() {
        if (document.activeElement === input || input.getAttribute('aria-expanded') === 'true') done();
      }, 150);

      // 2. MutationObserver
      var observer = null;
      try {
        observer = new MutationObserver(function() {
          if (input.getAttribute('aria-expanded') === 'true') done();
        });
        observer.observe(input, { attributes: true, attributeFilter: ['aria-expanded'] });
      } catch(e) {}

      // 3. Events
      function onTouch() { setTimeout(done, 200); }
      input.addEventListener('focus', onTouch);
      if (selector) selector.addEventListener('mousedown', onTouch, true);
      if (antSelect) antSelect.addEventListener('click', onTouch, true);

      // Timeout 60 ثانية
      setTimeout(function() {
        if (!resolved) { resolved = true; clearInterval(pollTimer); if(observer)observer.disconnect(); alert.remove(); resolve(false); }
      }, 60000);
    });
  }

  // ─── Events ───
  panel.addEventListener('click',function(e){if(panel.classList.contains('fey-min')){panel.classList.remove('fey-min');e.stopPropagation();}});
  document.getElementById('fey_close').addEventListener('click',function(e){e.stopPropagation();panel.style.animation='feySlideIn 0.3s reverse';setTimeout(function(){panel.remove()},280);});
  document.getElementById('fey_min').addEventListener('click',function(e){e.stopPropagation();panel.classList.add('fey-min');});

  var uploadArea=document.getElementById('fey_upload');
  var fileInput=document.getElementById('fey_file');
  var startBtn=document.getElementById('fey_start');
  var manualInput=document.getElementById('fey_manual');

  uploadArea.addEventListener('click',function(){fileInput.click()});
  uploadArea.addEventListener('dragover',function(e){e.preventDefault();this.style.borderColor='#8b5cf6';this.style.background='#ede9fe'});
  uploadArea.addEventListener('dragleave',function(){this.style.borderColor='#d8b4fe';this.style.background='#faf5ff'});
  uploadArea.addEventListener('drop',function(e){e.preventDefault();this.style.borderColor='#d8b4fe';this.style.background='#faf5ff';if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files)});
  fileInput.addEventListener('change',function(){if(this.files.length)handleFiles(this.files)});

  function handleFiles(files){var all=[],loaded=0,total=files.length;for(var i=0;i<files.length;i++){(function(f){var r=new FileReader();r.onload=function(e){all=all.concat(parse(e.target.result));loaded++;if(loaded===total){var u=[],s={};for(var j=0;j<all.length;j++)if(!s[all[j]]){s[all[j]]=true;u.push(all[j])}state.orders=u;state.injectedCount=0;state.failedCount=0;upStats();var d=all.length-u.length;uploadArea.innerHTML='<div style="font-size:30px;margin-bottom:6px">✅</div><div style="font-size:15px;font-weight:800;color:#059669;margin-bottom:4px">تم تحميل '+total+(total===1?' ملف':' ملفات')+'</div><div style="font-size:13px;color:#10b981;font-weight:600">'+u.length+' طلب'+(d>0?' (حذف '+d+' مكرر)':'')+'</div>';uploadArea.style.borderColor='#34d399';uploadArea.style.background='#f0fdf4';setSt(u.length+' طلب جاهز','loaded');showToast(u.length+' طلب','success');enableStart()}};r.readAsText(f)})(files[i])}}

  manualInput.addEventListener('input',function(){var o=parse(this.value);if(o.length>0){state.orders=o;state.injectedCount=0;state.failedCount=0;upStats();enableStart()}else{startBtn.disabled=true;startBtn.style.opacity='0.5';startBtn.innerHTML='📤 رفع الطلبات (ارفع ملف أولاً)'}});
  function enableStart(){startBtn.disabled=false;startBtn.style.opacity='1';startBtn.style.cursor='pointer';startBtn.innerHTML='📤 رفع الطلبات ('+state.orders.length+' طلب)';}
  document.getElementById('fey_speed').addEventListener('input',function(){state.delayMs=parseInt(this.value);document.getElementById('fey_speed_l').innerText=(state.delayMs/1000).toFixed(1)+'s'});

  // ─── Start ───
  startBtn.addEventListener('click', async function() {
    if (state.isRunning || !state.orders.length) return;

    var input = getInput();
    if (!input) {
      await showDialog({icon:'❌',iconColor:'red',title:'لم يتم العثور على الحقل',desc:'تأكد إنك في صفحة FarEye الصحيحة',
        buttons:[{text:'👍 حسناً',value:'ok',style:'background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white'}]});
      return;
    }

    // ═══ بانر "المس الخانة" — يختفي تلقائي لما تلمسها ═══
    startBtn.innerHTML = '👆 المس الخانة...';
    startBtn.disabled = true;
    startBtn.style.opacity = '0.8';

    var touched = await showTouchBanner(input);
    if (!touched) {
      startBtn.disabled = false; startBtn.style.opacity = '1'; startBtn.style.cursor = 'pointer';
      startBtn.innerHTML = '📤 رفع الطلبات (' + state.orders.length + ' طلب)';
      return;
    }

    await wait(300);

    // ═══ بدء الرفع ═══
    setSt('🚀 جاري الرفع...', 'working');
    showToast('جاري الرفع!', 'success');

    state.isRunning = true;
    state.injectedCount = 0;
    state.failedCount = 0;
    document.getElementById('fey_pw').style.display = 'block';
    document.getElementById('fey_lw').style.display = 'block';
    document.getElementById('fey_log').innerHTML = '';
    upStats();

    var pf = document.getElementById('fey_pf');
    var pt = document.getElementById('fey_pt');

    addLog('═══ بدء الرفع — ' + state.orders.length + ' طلب ═══', 'info');
    addLog('Tags قبل: ' + countTags(), 'info');

    for (var i = 0; i < state.orders.length; i++) {
      var order = state.orders[i];
      setSt((i+1) + '/' + state.orders.length + ': ' + order, 'working');
      pf.style.width = (((i+1) / state.orders.length) * 100) + '%';
      pt.innerText = (i+1) + '/' + state.orders.length;
      startBtn.innerHTML = '📤 ' + (i+1) + '/' + state.orders.length;

      addLog('[' + (i+1) + '] ' + order, 'info');

      var ok = await injectOne(order);

      if (ok) {
        state.injectedCount++;
        addLog('  ✅ OK', 'ok');
      } else {
        // retry
        addLog('  🔄 retry...', 'warn');
        await wait(300);
        ok = await injectOne(order);
        if (ok) {
          state.injectedCount++;
          addLog('  ✅ OK (retry)', 'ok');
        } else {
          state.failedCount++;
          addLog('  ❌ FAILED', 'err');
        }
      }
      upStats();

      if (i < state.orders.length - 1) await wait(state.delayMs);
    }

    // ═══ انتهى ═══
    state.isRunning = false;
    pf.style.width = '100%';
    startBtn.disabled = false; startBtn.style.opacity = '1'; startBtn.style.cursor = 'pointer';
    startBtn.innerHTML = '🔄 إعادة (' + state.orders.length + ')';

    addLog('', 'info');
    addLog('═══ ' + state.injectedCount + '✅ / ' + state.failedCount + '❌ — Tags: ' + countTags() + ' ═══', state.failedCount > 0 ? 'warn' : 'ok');

    // ═══ إشعار النهاية — يختفي لوحده ═══
    var banner = document.createElement('div');
    var bannerColor = state.failedCount > 0 ? '#d97706' : '#059669';
    banner.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);opacity:0;z-index:99999999;background:white;border-radius:24px;padding:30px 40px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.3);font-family:Segoe UI,sans-serif;direction:rtl;transition:all 0.4s cubic-bezier(0.16,1,0.3,1)';
    banner.innerHTML = '<div style="font-size:50px;margin-bottom:10px">' + (state.failedCount > 0 ? '⚠️' : '🎉') + '</div><div style="font-size:22px;font-weight:900;color:#1e293b;margin-bottom:8px">انتهى الرفع</div><div style="display:flex;gap:20px;justify-content:center;margin-top:12px"><div><span style="font-size:28px;font-weight:900;color:#10b981">' + state.injectedCount + '</span><div style="font-size:11px;color:#94a3b8;font-weight:700">نجاح ✅</div></div><div><span style="font-size:28px;font-weight:900;color:' + (state.failedCount > 0 ? '#ef4444' : '#10b981') + '">' + state.failedCount + '</span><div style="font-size:11px;color:#94a3b8;font-weight:700">فشل ❌</div></div><div><span style="font-size:28px;font-weight:900;color:#8b5cf6">' + countTags() + '</span><div style="font-size:11px;color:#94a3b8;font-weight:700">Tags</div></div></div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function(){banner.style.opacity='1';banner.style.transform='translate(-50%,-50%) scale(1)';});
    setTimeout(function(){banner.style.opacity='0';banner.style.transform='translate(-50%,-50%) scale(0.8)';setTimeout(function(){banner.remove()},400);}, 3000);
    setSt(state.injectedCount + '✅ / ' + state.failedCount + '❌', 'done');
  });

})();

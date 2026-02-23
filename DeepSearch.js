javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // EZ-PILL PRO v4.6 - (المحرك المتوازي - حصر الـ 18 طلب كاملة)
  // المطور: علي الباز
  // ═══════════════════════════════════════════════════════════════════
  
  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.6';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }
  
  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    openedCount: 0,
    tbody: null
  };
  
  function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('ali-toast-box');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-box';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = 'background:' + colors[type] + ';color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s';
    toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
  }

  const styleEl = document.createElement('style');
  styleEl.innerHTML = '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}@keyframes aliSpin{to{transform:rotate(360deg)}}#' + PANEL_ID + '{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 25px 60px -12px rgba(0,0,0,0.15);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;animation:aliSlideIn 0.6s}#' + PANEL_ID + '.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important}#' + PANEL_ID + '.ali-minimized::after{content:"🔍";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(styleEl);
  
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = '<div class="ali-inner"><div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:6px"><span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.12);cursor:pointer">−</span><span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.2);cursor:pointer">✕</span></div><h3 style="font-size:20px;font-weight:900;margin:0">EZ-PILL PRO</h3></div></div><div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">' + buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total') + buildStatCard('🔍','0','مطابق','#10b981','stat_match') + buildStatCard('🚀','0','تم فتحه','#3b82f6','stat_opened') + '</div><div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:700;color:#475569">📄 عدد الصفحات</span><input type="number" id="p_lim" value="10" min="1" style="width:75px;padding:4px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;outline:none"></div><div style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width 0.4s"></div></div></div><div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز للعمل</span></div><div id="ali_dynamic_area"><button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;transition:0.3s">🚀 بدء البحث والاستعلام</button></div><div style="text-align:center;padding:14px 0 4px;font-size:10px;color:#cbd5e1;font-weight:700">DEVELOPED BY ALI EL-BAZ</div></div></div>';
  document.body.appendChild(panel);
  
  function buildStatCard(icon,val,label,color,id){ return '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center"><div style="font-size:18px;margin-bottom:4px">' + icon + '</div><div id="' + id + '" style="font-size:22px;font-weight:900;color:' + color + ';line-height:1">' + val + '</div><div style="font-size:10px;color:#94a3b8">' + label + '</div></div>'; }
  
  async function scanPage() {
    state.isProcessing = true;
    var fill = document.getElementById('p-fill'), baseUrl = window.location.origin + "/ez_pill_web/", currentStatus = 'readypack';
    var elMsg = document.getElementById('status-msg');
    elMsg.innerHTML = '<div style="width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div><span>جاري الاستعلام المتوازي...</span>';
    
    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = []; state.visitedSet.clear();

    function processData(data) {
      let orders = []; try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e){}
      if (!orders || orders.length === 0) return;
      for (let item of orders) {
        let inv = item.Invoice || '', onl = item.onlineNumber || '';
        if (inv.length >= 5 && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);
          let cleanedOnl = onl.replace(/ERX/gi, '');
          
          // 🟢 تم الالتزام بالمفاتيح الصحيحة لضمان ظهور البيانات كاملة 🟢
          let createdTime = item.Created_Time || item.created_at || '';
          let deliveryTime = item.delviery_time || item.delivery_time || '';
          let payment = item.payment_method || item.payment || 'Cash';
          let source = item.source || item.typee || 'StorePaid';
          
          let tr = document.createElement('tr');
          tr.style.background = 'rgba(59,130,246,0.05)';
          tr.innerHTML = `<td style="padding:12px 8px"><label style="color:blue;text-decoration:underline;font-weight:bold;cursor:pointer" onclick="getDetails('${cleanedOnl}','${inv}','${source}','${item.head_id || ''}');">${inv}</label></td><td style="padding:12px 8px">${onl}</td><td style="padding:12px 8px">${item.guestName || ''}</td><td style="padding:12px 8px">${item.guestMobile || item.mobile || ''}</td><td style="padding:12px 8px">${payment}</td><td style="padding:12px 8px">${createdTime}</td><td style="padding:12px 8px">${deliveryTime}</td><td style="padding:12px 8px">Accepted</td><td style="padding:12px 8px">${source}</td>`;
          state.savedRows.push({ id: inv, onl: onl, node: tr, args: [cleanedOnl, inv, source, (item.head_id || '')] });
        }
      }
    }

    try {
      let res1 = await fetch(baseUrl + 'Home/getOrders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:currentStatus, pageSelected:1, searchby:''}) });
      let data1 = await res1.json();
      if (data1.total_orders) { let exactTotal = parseInt(data1.total_orders) || 0; if (exactTotal > 0) { maxPages = Math.ceil(exactTotal / 10); document.getElementById('p_lim').value = maxPages; } }
      processData(data1); 
      if (fill) fill.style.width = '15%';

      let promises = [];
      for (let i = 2; i <= maxPages; i++) {
        promises.push(fetch(baseUrl + 'Home/getOrders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:currentStatus, pageSelected:i, searchby:''}) }).then(r=>r.json()).then(d=>processData(d)));
      }
      await Promise.all(promises); 
      if (fill) fill.style.width = '100%';
    } catch (err) { console.error(err); }
    finishScan();
  }

  function finishScan() {
    state.isProcessing = false;
    var tables = document.querySelectorAll('table'), target = tables[0];
    for (var t of tables) if (t.innerText.length > target.innerText.length) target = t;
    state.tbody = target.querySelector('tbody') || target;
    state.tbody.innerHTML = '';
    state.savedRows.forEach(r => state.tbody.appendChild(r.node));
    
    document.getElementById('stat_total').innerText = state.savedRows.length;
    document.getElementById('status-msg').innerHTML = '<span>🎉</span><span>اكتمل الحصر — ' + state.savedRows.length + ' طلب جاهز</span>';
    
    var dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = '<div style="margin-bottom:10px"><div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:900;color:#94a3b8;pointer-events:none">0</span><input type="text" id="ali_sI" placeholder="رقم الفاتورة..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;outline:none;background:#f8fafc;font-weight:700;box-sizing:border-box"></div></div><div style="margin-bottom:10px"><div style="position:relative"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px">🔗</span><input type="text" id="ali_sO" placeholder="رقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;outline:none;background:#f8fafc;box-sizing:border-box"></div></div><div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;padding:2px 0 12px">عرض ' + state.savedRows.length + ' نتيجة</div><button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;background:linear-gradient(135deg,#059669,#10b981);color:white;margin-bottom:8px">⚡ تنفيذ الفتح للمطابق</button>';
    
    var sI = document.getElementById('ali_sI'), sO = document.getElementById('ali_sO'), searchCount = document.getElementById('ali_search_count'), openBtn = document.getElementById('ali_btn_open'), currentMatches = [];

    function filterResults() {
      var rawInv = sI.value.trim(), invSearch = rawInv !== '' ? '0' + rawInv : '', ordSearch = sO.value.trim().toLowerCase();
      state.tbody.innerHTML = ''; var shown = 0; currentMatches = []; var hasF = invSearch !== '' || ordSearch !== '';
      state.savedRows.forEach(row => {
        var matchInv = invSearch !== '' && row.id.startsWith(invSearch), matchOrd = ordSearch !== '' && row.onl.toLowerCase().includes(ordSearch);
        if (!hasF || matchInv || matchOrd) { state.tbody.appendChild(row.node); shown++; if(hasF) currentMatches.push(row); }
      });
      searchCount.innerText = 'عرض ' + shown + ' من ' + state.savedRows.length + ' نتيجة';
      document.getElementById('stat_match').innerText = shown;
      openBtn.style.opacity = (hasF && currentMatches.length > 0) ? '1' : '0.6';
    }

    sI.addEventListener('input', filterResults); sO.addEventListener('input', filterResults);
    
    openBtn.addEventListener('click', async function() {
      if (!currentMatches.length) return;
      openBtn.disabled = true;
      for (let i = 0; i < currentMatches.length; i++) {
        let item = currentMatches[i], url = `${window.location.origin}/ez_pill_web/getEZPill_Details?onlineNumber=${item.args[0]}&Invoice=${item.args[1]}&typee=${item.args[2]}&head_id=${item.args[3]}`;
        if (window.open(url, "_blank")) { state.openedCount++; document.getElementById('stat_opened').innerText = state.openedCount; window.focus(); }
        if (i < currentMatches.length - 1) await new Promise(r => setTimeout(r, 1200));
      }
      openBtn.disabled = false;
    });
  }

  document.getElementById('ali_start').addEventListener('click', function() { if (state.isProcessing) return; this.disabled = true; this.innerHTML = 'جاري الفتح...'; scanPage(); });
  document.getElementById('ali_min').addEventListener('click', function(e){ e.stopPropagation(); document.getElementById(PANEL_ID).classList.add('ali-minimized'); });
  document.getElementById(PANEL_ID).addEventListener('click', function(){ if(this.classList.contains('ali-minimized')) this.classList.remove('ali-minimized'); });
  document.getElementById('ali_close').addEventListener('click', function(e){ e.stopPropagation(); document.getElementById(PANEL_ID).remove(); });
})();

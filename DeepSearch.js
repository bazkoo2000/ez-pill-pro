// ═══════════════════════════════════════════════════════════════════
// محرك البحث الصاروخي (Ready to Pack / New) 🔍🚀
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_fast_search';
  const VERSION = '1.0';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false
  };

  // ─── CSS ───
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(139,92,246,0.15);z-index:999999;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6d28d9,#8b5cf6)!important;box-shadow:0 8px 30px rgba(139,92,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"🔍";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .ali-row-hover:hover{background-color:rgba(139,92,246,0.08)!important}
  `;
  document.head.appendChild(styleEl);

  // ─── بناء النافذة ───
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.15);cursor:pointer">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.3);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:20px;font-weight:900;margin:0">محرك البحث الصاروخي</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(139,92,246,0.3);color:#ddd6fe;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">Ready To Pack / New</span>
        </div>
      </div>
      
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)">
        
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:800;background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe">
          <span>✅</span><span>جاهز لسحب الطلبات</span>
        </div>

        <button id="ali_start_fetch" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:0 4px 15px rgba(139,92,246,0.3);transition:all 0.3s;margin-bottom:16px">
          🚀 جلب الداتا بسرعة البرق
        </button>

        <div id="ali_search_area" style="display:none;opacity:0;transition:opacity 0.5s">
          <div style="position:relative;margin-bottom:10px">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:900;color:#cbd5e1;pointer-events:none;font-family:monospace">0</span>
            <input type="text" id="ali_sI" placeholder="بحث برقم الفاتورة (أول 4 أرقام)..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-weight:800;color:#1e293b;outline:none;background:#f8fafc;direction:ltr;text-align:left;transition:all 0.25s;box-sizing:border-box">
          </div>
          <div style="position:relative;margin-bottom:12px">
            <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none">🔗</span>
            <input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:800;color:#1e293b;outline:none;background:#f8fafc;direction:rtl;transition:all 0.25s;box-sizing:border-box">
          </div>
          
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:12px;margin-bottom:12px">
             <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;color:#64748b">
               <span>إجمالي الطلبات في الذاكرة:</span>
               <span id="ali_total_memory" style="color:#6d28d9;font-size:14px">0</span>
             </div>
             <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;color:#64748b;margin-top:6px">
               <span>نتائج البحث الحالية:</span>
               <span id="ali_search_count" style="color:#10b981;font-size:14px">0</span>
             </div>
          </div>
        </div>

        <div style="text-align:center;padding:12px 0 4px;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ─── Events ───
  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    const c = {
      ready:{bg:'#f5f3ff',color:'#6d28d9',border:'#ddd6fe',icon:'✅'},
      working:{bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',icon:'spinner'},
      error:{bg:'#fef2f2',color:'#dc2626',border:'#fecaca',icon:'❌'}
    }[type] || {bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'};
    
    const iconHTML = c.icon === 'spinner'
      ? '<div style="width:16px;height:16px;border:2px solid rgba(109,40,217,0.2);border-top-color:#6d28d9;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:800;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
  }

  // ─── جلب الداتا الصاروخي ───
  document.getElementById('ali_start_fetch').addEventListener('click', async function() {
    if(state.isProcessing) return;
    state.isProcessing = true;
    
    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '⏳ جاري الاتصال بالسيرفر...';
    btn.style.opacity = '0.7';

    // تحديد الحالة تلقائياً (Ready to Pack أو New بناءً على الصفحة)
    let currentStatus = 'readypack';
    if (window.location.href.toLowerCase().includes('new')) currentStatus = 'new';

    const baseUrl = window.location.origin + "/ez_pill_web/";
    state.savedRows = [];
    state.visitedSet.clear();

    try {
      setStatus('حساب عدد الصفحات...', 'working');
      
      // أول طلب لمعرفة العدد الإجمالي
      let res = await fetch(baseUrl + 'Home/getOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' })
      });
      let data = await res.json();
      
      let exactTotal = parseInt(data.total_orders) || 0;
      let maxPages = exactTotal > 0 ? Math.ceil(exactTotal / 10) : 1;

      // نسخ صف فارغ من الجدول للحفاظ على التصميم
      let tables = document.querySelectorAll('table');
      let targetTable = tables[0];
      for (let t = 0; t < tables.length; t++) {
        if (tables[t].innerText.length > targetTable.innerText.length) targetTable = tables[t];
      }
      let tbody = targetTable ? targetTable.querySelector('tbody') || targetTable : null;
      let templateRow = tbody ? tbody.querySelector('tr') : null;

      // لوب لسحب جميع الصفحات
      for (let page = 1; page <= maxPages; page++) {
        setStatus(`جلب البيانات: صفحة ${page} من ${maxPages}...`, 'working');
        btn.innerHTML = `🚀 سحب صفحة (${page}/${maxPages})`;

        if(page > 1) { // الصفحة الأولى جبناها خلاص
          res = await fetch(baseUrl + 'Home/getOrders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: currentStatus, pageSelected: page, searchby: '' })
          });
          data = await res.json();
        }

        let orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list;
        if (!orders || orders.length === 0) continue;

        for (let i = 0; i < orders.length; i++) {
          let item = orders[i];
          let inv = item.Invoice || '';
          let onl = item.onlineNumber || '';
          let typee = item.typee || '';
          let head_id = item.head_id || '';

          if (inv.length >= 5 && !state.visitedSet.has(inv)) {
            state.visitedSet.add(inv);
            
            let clone;
            if (templateRow) {
              clone = templateRow.cloneNode(true);
              let cells = clone.querySelectorAll('td');
              if (cells.length > 3) {
                // جعل رقم الفاتورة قابل للضغط ويفتح تفاصيل الطلب
                cells[0].innerHTML = `<label style="cursor:pointer;color:#3b82f6;text-decoration:underline;font-weight:900;" onclick="getDetails('${onl.replace(/ERX/gi, '')}','${inv}','${typee}','${head_id}')">${inv}</label>`;
                cells[1].innerText = onl;
                cells[2].innerText = item.guestName || '';
                cells[3].innerText = item.guestMobile || item.mobile || '';
              }
            } else {
              clone = document.createElement('tr');
              clone.innerHTML = `<td><label style="cursor:pointer;color:#3b82f6;text-decoration:underline;font-weight:900;" onclick="getDetails('${onl.replace(/ERX/gi, '')}','${inv}','${typee}','${head_id}')">${inv}</label></td><td>${onl}</td><td>${item.guestName || ''}</td><td>${item.guestMobile || item.mobile || ''}</td>`;
            }
            
            clone.className = 'ali-row-hover'; // تأثير عند الوقوف بالماوس
            clone.style.transition = 'background 0.2s';

            state.savedRows.push({
              id: inv,
              onl: onl,
              node: clone
            });
          }
        }
      }

      setStatus(`تم تجميع ${state.savedRows.length} طلب بنجاح!`, 'ready');
      document.getElementById('ali_total_memory').innerText = state.savedRows.length;
      document.getElementById('ali_search_count').innerText = state.savedRows.length;
      
      // إخفاء زر الجلب وإظهار منطقة البحث
      btn.style.display = 'none';
      const searchArea = document.getElementById('ali_search_area');
      searchArea.style.display = 'block';
      setTimeout(() => searchArea.style.opacity = '1', 50);

      // تفريغ الجدول الأصلي ووضع البيانات الجديدة
      if (tbody) {
        tbody.innerHTML = '';
        state.savedRows.forEach(r => tbody.appendChild(r.node));
      }

      state.isProcessing = false;

    } catch (err) {
      console.error(err);
      setStatus('حدث خطأ أثناء جلب البيانات', 'error');
      btn.innerHTML = '❌ إعادة المحاولة';
      btn.disabled = false;
      btn.style.opacity = '1';
      state.isProcessing = false;
    }
  });

  // ─── دالة البحث الفورية ───
  const sI = document.getElementById('ali_sI');
  const sO = document.getElementById('ali_sO');
  
  function filterTable() {
    const tbody = document.querySelector('table tbody');
    if(!tbody) return;

    const rawInv = sI.value.trim();
    const invSearch = rawInv !== '' ? ('0' + rawInv).toLowerCase() : '';
    const ordSearch = sO.value.trim().toLowerCase();

    tbody.innerHTML = '';
    let shown = 0;

    state.savedRows.forEach(row => {
      const matchInv = invSearch !== '' && row.id.toLowerCase().startsWith(invSearch);
      const matchOrd = ordSearch !== '' && row.onl.toLowerCase().includes(ordSearch);
      const show = (rawInv === '' && ordSearch === '') ? true : (matchInv || matchOrd);

      if (show) {
        tbody.appendChild(row.node);
        shown++;
      }
    });

    document.getElementById('ali_search_count').innerText = shown;
    
    // تلوين خانات البحث حسب النتيجة
    if (rawInv.length > 0 && shown === 0) {
      sI.style.borderColor = '#ef4444'; sI.style.background = '#fef2f2';
    } else if (rawInv.length > 0 && shown > 0) {
      sI.style.borderColor = '#10b981'; sI.style.background = '#f0fdf4';
    } else {
      sI.style.borderColor = '#e2e8f0'; sI.style.background = '#f8fafc';
    }

    if (ordSearch.length > 0 && shown === 0) {
      sO.style.borderColor = '#ef4444'; sO.style.background = '#fef2f2';
    } else if (ordSearch.length > 0 && shown > 0) {
      sO.style.borderColor = '#10b981'; sO.style.background = '#f0fdf4';
    } else {
      sO.style.borderColor = '#e2e8f0'; sO.style.background = '#f8fafc';
    }
  }

  sI.addEventListener('input', filterTable);
  sO.addEventListener('input', filterTable);

})();
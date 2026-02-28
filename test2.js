javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '8.3';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const MAX_PER_FILE = 49;

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    htmlBuffer: '',
    timerInterval: null
  };

  const NEU = {
    bg: '#e0e5ec',
    shadowDark: 'rgba(163,177,198,0.6)',
    shadowLight: 'rgba(255,255,255,0.8)',
    insetDark: 'rgba(163,177,198,0.5)',
    insetLight: 'rgba(255,255,255,0.7)',
    text: '#2d3748',
    textMuted: '#718096',
    accent: '#7c3aed',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    blue: '#3b82f6'
  };
  const neuOutset = `6px 6px 14px ${NEU.shadowDark},-6px -6px 14px ${NEU.shadowLight}`;
  const neuInset = `inset 3px 3px 6px ${NEU.insetDark},inset -3px -3px 6px ${NEU.insetLight}`;
  const neuBtnSm = `4px 4px 10px ${NEU.shadowDark},-4px -4px 10px ${NEU.shadowLight}`;
  const neuBtnPressed = `inset 2px 2px 5px ${NEU.insetDark},inset -2px -2px 5px ${NEU.insetLight}`;

  function esc(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;'); }

  function showToast(msg, type='info') {
    let c = document.getElementById('ali-toast-container');
    if (!c) { c = document.createElement('div'); c.id='ali-toast-container'; c.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center'; document.body.appendChild(c); }
    const colors={success:NEU.success,error:NEU.error,warning:NEU.warning,info:'#475569'}; const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    const t = document.createElement('div');
    t.style.cssText=`background:${NEU.bg};color:${colors[type]};padding:14px 24px;border-radius:18px;font-size:13px;font-weight:700;font-family:'Tajawal','Segoe UI',sans-serif;box-shadow:${neuOutset};display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    t.innerHTML=`<span>${icons[type]}</span> ${esc(msg)}`; c.appendChild(t);
    setTimeout(()=>{t.style.transition='all 0.3s';t.style.opacity='0';t.style.transform='translateY(10px)';setTimeout(()=>t.remove(),300);},3500);
  }

  function showDialog({icon,title,desc,info,badges,buttons}) {
    return new Promise(resolve=>{
      const o=document.createElement('div');
      o.style.cssText=`position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(180,190,205,0.55);backdrop-filter:blur(14px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s`;
      let ih=''; if(info&&info.length) ih=info.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:${NEU.bg};border-radius:14px;margin-bottom:8px;box-shadow:${neuInset}"><span style="font-size:13px;color:${NEU.textMuted};font-weight:700">${esc(r.label)}</span><span style="font-weight:900;color:${esc(r.color||NEU.accent)};font-size:14px">${esc(String(r.value))}</span></div>`).join('');
      let btnh=''; if(buttons&&buttons.length) btnh=buttons.map((b,i)=>{const s=b.primary?`background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:white;box-shadow:4px 4px 12px rgba(124,58,237,0.35)`:`background:${NEU.bg};color:${NEU.textMuted};box-shadow:${neuBtnSm}`; return `<button data-idx="${i}" style="flex:1;padding:16px;border:none;border-radius:16px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;${s}">${esc(b.text)}</button>`;}).join('');
      o.innerHTML=`<div style="background:${NEU.bg};border-radius:28px;width:440px;max-width:92vw;overflow:hidden;font-family:'Tajawal',sans-serif;direction:rtl;color:${NEU.text};box-shadow:12px 12px 30px ${NEU.shadowDark},-12px -12px 30px ${NEU.shadowLight};animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:32px 28px 0;text-align:center"><div style="width:80px;height:80px;border-radius:50%;background:${NEU.bg};box-shadow:${neuOutset};display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 18px">${icon}</div><div style="font-size:21px;font-weight:900;margin-bottom:6px">${esc(title)}</div><div style="font-size:13px;color:${NEU.textMuted};line-height:1.7">${esc(desc)}</div></div><div style="padding:20px 28px">${ih}</div><div style="padding:8px 28px 28px;display:flex;gap:12px">${btnh}</div></div>`;
      o.addEventListener('click',e=>{const b=e.target.closest('[data-idx]');if(b){const i=parseInt(b.getAttribute('data-idx'));o.style.transition='opacity 0.2s';o.style.opacity='0';setTimeout(()=>o.remove(),200);resolve({action:buttons[i].value});}});
      document.body.appendChild(o);
    });
  }

  const styleEl=document.createElement('style');
  styleEl.innerHTML=`@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}@keyframes aliSpin{to{transform:rotate(360deg)}}@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}@keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}#${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:${NEU.bg};border-radius:24px;box-shadow:${neuOutset};z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:${NEU.text};overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.4s}#${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#7c3aed,#a78bfa)!important;box-shadow:6px 6px 16px ${NEU.shadowDark},-6px -6px 16px ${NEU.shadowLight}!important;animation:aliPulse 2s infinite;overflow:hidden}#${PANEL_ID}.ali-minimized .ali-inner{display:none!important}#${PANEL_ID}.ali-minimized::after{content:"🔍";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.fast-row{border-bottom:1px solid rgba(163,177,198,0.2);transition:background 0.2s}.fast-row:hover{background:rgba(163,177,198,0.15)}.ali-link{color:${NEU.accent};text-decoration:underline;font-weight:bold;cursor:pointer}`;
  document.head.appendChild(styleEl);

  function buildStat(icon,val,label,color,id){return `<div style="background:${NEU.bg};border-radius:16px;padding:14px 6px;text-align:center;box-shadow:${neuOutset}"><div style="font-size:18px;margin-bottom:5px">${icon}</div><div id="${id}" style="font-size:22px;font-weight:900;color:${color};line-height:1;margin-bottom:3px">${val}</div><div style="font-size:9px;color:${NEU.textMuted};font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${label}</div></div>`;}

  const panel=document.createElement('div'); panel.id=PANEL_ID;
  panel.innerHTML=`<div class="ali-inner"><div style="background:linear-gradient(135deg,#4a1d96,#6d28d9);padding:20px 22px 18px;color:white;position:relative;overflow:hidden;border-radius:0 0 22px 22px;box-shadow:0 6px 20px rgba(109,40,217,0.25)"><div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.2),transparent 70%);border-radius:50%"></div><div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1"><div style="display:flex;gap:6px"><span id="ali_min" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.15);cursor:pointer">−</span><span id="ali_close" style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.25);cursor:pointer">✕</span></div><h3 style="font-size:18px;font-weight:900;margin:0">محرك بحث وإنهاء الطلبات</h3></div><div style="text-align:right;margin-top:4px;position:relative;z-index:1"><span style="display:inline-block;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:10px;padding:3px 10px;border-radius:8px;font-weight:700">v${VERSION}</span></div></div><div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body"><div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">${buildStat('📥','0','Received','#10b981','stat_rec')}${buildStat('📦','0','Packed','#f59e0b','stat_pack')}${buildStat('✅','0','المنجز','#3b82f6','stat_done')}${buildStat('📊','0','إجمالي','#8b5cf6','stat_total')}</div><div style="background:${NEU.bg};border-radius:18px;padding:16px;margin-bottom:16px;box-shadow:${neuOutset}"><div id="p-bar" style="height:8px;background:${NEU.bg};border-radius:10px;overflow:hidden;box-shadow:${neuInset}"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#a78bfa,#c4b5fd);border-radius:10px;transition:width 0.2s"></div></div><div id="p-label" style="text-align:center;margin-top:8px;font-size:11px;color:${NEU.textMuted};font-weight:700;display:none"></div></div><div id="ali_timer" style="display:none;text-align:center;padding:10px;margin-bottom:16px;border-radius:14px;background:${NEU.bg};box-shadow:${neuInset}"><span style="font-size:11px;color:${NEU.textMuted};font-weight:700">⏱️ </span><span id="ali_timer_val" style="font-size:20px;font-weight:900;color:${NEU.accent};font-family:'Tajawal',monospace">0.0s</span></div><div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:${NEU.bg};color:${NEU.success};box-shadow:${neuInset}"><span>✅</span><span>اختر نوع البحث</span></div><div id="ali_dynamic_area"><button id="ali_btn_packed" style="width:100%;padding:14px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:14px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:6px 6px 14px rgba(217,119,6,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s;margin-bottom:10px">📦 بحث Packed فقط</button><button id="ali_btn_received" style="width:100%;padding:14px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:14px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:6px 6px 14px rgba(5,150,105,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s;margin-bottom:10px">📥 بحث Received فقط</button><button id="ali_btn_both" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:6px 6px 14px rgba(109,40,217,0.3),-4px -4px 10px ${NEU.shadowLight};transition:all 0.3s;margin-bottom:10px">🚀 بحث الكل (Packed + Received)</button></div><div style="text-align:center;padding:14px 0 4px;font-size:10px;color:${NEU.textMuted};font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div></div></div>`;
  document.body.appendChild(panel);

  function startTimer() {
    const timerEl = document.getElementById('ali_timer');
    const timerVal = document.getElementById('ali_timer_val');
    if (timerEl) timerEl.style.display = 'block';
    const t0 = performance.now();
    state.timerInterval = setInterval(() => {
      if (timerVal) timerVal.innerText = ((performance.now() - t0) / 1000).toFixed(1) + 's';
    }, 100);
    return t0;
  }
  function stopTimer() { if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; } }

  function setStatus(text,type){const el=document.getElementById('status-msg');if(!el)return;const c={ready:{color:NEU.success,icon:'✅'},working:{color:'#6d28d9',icon:'spinner'},error:{color:NEU.error,icon:'❌'},done:{color:NEU.success,icon:'✅'}}[type]||{color:NEU.success,icon:'✅'};const ic=c.icon==='spinner'?`<div style="width:16px;height:16px;border:2.5px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>`:`<span>${c.icon}</span>`;el.style.cssText=`display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:700;background:${NEU.bg};color:${c.color};box-shadow:${neuInset}`;el.innerHTML=`${ic}<span>${esc(text)}</span>`;}

  function animNum(id,val){const el=document.getElementById(id);if(!el||el.innerText===String(val))return;requestAnimationFrame(()=>{el.innerText=val;el.style.animation='aliCountUp 0.4s';setTimeout(()=>el.style.animation='',400);});}
  function updateStats(){let r=0,d=0,p=0;state.savedRows.forEach(x=>{if(x.st==='received')r++;if(x.st==='processed')d++;if(x.st==='packed')p++;});animNum('stat_rec',r);animNum('stat_pack',p);animNum('stat_done',d);animNum('stat_total',state.savedRows.length);}

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation();}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();stopTimer();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280);});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized');});

  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  function processData(data){
    let orders=[];try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list;}catch(e){}
    if(!orders||orders.length===0)return;
    for(let i=0;i<orders.length;i++){
      const item=orders[i],inv=item.Invoice||'',onl=item.onlineNumber||'',src=item.source||'StorePaid',hid=item.head_id||'';
      if(inv.length>=5&&inv.startsWith('0')&&!state.visitedSet.has(inv)){
        state.visitedSet.add(inv);
        let st='other',raw=String(item.status||item.Status||item.order_status||item.OrderStatus||'').toLowerCase().replace(/<[^>]*>?/gm,'').trim();
        if(raw.includes('packed'))st='packed';else if(raw.includes('received'))st='received';
        else{let c=JSON.stringify(item).toLowerCase();if(c.includes('"packed"'))st='packed';else if(c.includes('"received"'))st='received';}
        const bg=st==='received'?'rgba(16,185,129,0.08)':(st==='packed'?'rgba(245,158,11,0.08)':'transparent');
        state.htmlBuffer+=`<tr class="fast-row" id="row_${esc(inv)}" style="background:${bg}" data-inv="${esc(inv)}" data-onl="${esc(onl)}" data-src="${esc(src)}" data-hid="${esc(hid)}"><td style="padding:12px 8px"><span class="ali-link">${esc(inv)}</span></td><td style="padding:12px 8px">${esc(onl)}</td><td style="padding:12px 8px">${esc(item.guestName||'')}</td><td style="padding:12px 8px">${esc(item.guestMobile||item.mobile||'')}</td><td style="padding:12px 8px">${esc(item.payment_method||'Cash')}</td><td style="padding:12px 8px">${esc(item.created_at||item.Created_Time||'')}</td><td id="st_${esc(inv)}" style="padding:12px 8px">${esc(st)}</td><td style="padding:12px 8px">${esc(src)}</td></tr>`;
        state.savedRows.push({id:inv,onl:onl,st:st,guestName:item.guestName||'',guestMobile:item.guestMobile||item.mobile||'',src:src,hid:hid});
      }
    }
  }

  // ═══════════════════════════════════════════
  // حساب عدد الصفحات — يجرب كل الأسماء الممكنة
  // ═══════════════════════════════════════════
  function getTotalFromResponse(data, statusName) {
    // جرب كل الأسماء الممكنة
    let total = 0;

    // 1. total_orders
    if (data.total_orders) total = parseInt(data.total_orders) || 0;

    // 2. totalLength
    if (!total && data.totalLength) total = parseInt(data.totalLength) || 0;

    // 3. counter حسب الحالة
    if (!total) {
      if (statusName === 'packed' && data.counter_orders_packed_Q) total = parseInt(data.counter_orders_packed_Q) || 0;
      if (statusName === 'received' && data.counter_orders_new_Q) total = parseInt(data.counter_orders_new_Q) || 0;
      if (statusName === 'received' && !total && data.counter_orders_readypack_Q) total = parseInt(data.counter_orders_readypack_Q) || 0;
    }

    // 4. لو لسه 0، نحسب من orders_list
    if (!total) {
      try {
        const ol = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list;
        if (ol && ol.length > 0) total = ol.length; // على الأقل عندنا صفحة واحدة
      } catch(e) {}
    }

    return total;
  }

  // ═══════════════════════════════════════════
  // scanAllPages — for loop مضمون + تايمر حي
  // ═══════════════════════════════════════════
  async function scanAllPages(statusList) {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    const pLabel = document.getElementById('p-label');
    const baseUrl = window.location.origin + "/ez_pill_web/";

    state.savedRows = [];
    state.visitedSet.clear();
    state.htmlBuffer = '';

    const startTime = startTimer();
    if (pLabel) { pLabel.style.display = 'block'; pLabel.innerText = 'جاري الاكتشاف...'; }

    let totalPages = 0;
    let completedPages = 0;
    let statusInfo = [];

    try {
      // ─── مرحلة 1: الصفحة الأولى لكل حالة ───
      for (let s = 0; s < statusList.length; s++) {
        const st = statusList[s];
        setStatus(`جاري اكتشاف ${st}...`, 'working');

        const res = await fetch(baseUrl + 'Home/getOrders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: st, pageSelected: 1, searchby: '' })
        });
        const data = await res.json();

        // DEBUG: نطبع كل المفاتيح عشان نعرف
        console.log('[v8.3] Response keys for ' + st + ':', Object.keys(data));
        console.log('[v8.3] total_orders:', data.total_orders, 'totalLength:', data.totalLength, 'packed_Q:', data.counter_orders_packed_Q, 'new_Q:', data.counter_orders_new_Q);

        processData(data);
        updateStats();

        const total = getTotalFromResponse(data, st);
        const pages = total > 0 ? Math.ceil(total / 10) : 1;
        statusInfo.push({ status: st, pages: pages, total: total });
        totalPages += pages;
        completedPages++;

        if (fill) fill.style.width = ((completedPages / Math.max(totalPages, 1)) * 100) + '%';
        if (pLabel) pLabel.innerText = `${st}: اكتشف ${total} طلب (${pages} صفحة)`;
        setStatus(`${st}: ${total} طلب = ${pages} صفحة`, 'working');
      }

      // ─── مرحلة 2: باقي الصفحات — واحدة واحدة ───
      for (let si = 0; si < statusInfo.length; si++) {
        const info = statusInfo[si];
        for (let page = 2; page <= info.pages; page++) {
          setStatus(`${info.status} — صفحة ${page}/${info.pages} (${state.savedRows.length} سجل)`, 'working');

          try {
            const res = await fetch(baseUrl + 'Home/getOrders', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: info.status, pageSelected: page, searchby: '' })
            });
            const data = await res.json();
            processData(data);
            updateStats();
          } catch (err) {
            console.warn(`فشل ${info.status} صفحة ${page}:`, err);
          }

          completedPages++;
          if (fill) fill.style.width = ((completedPages / totalPages) * 100) + '%';
          if (pLabel) pLabel.innerText = `${completedPages} / ${totalPages} صفحة — ${state.savedRows.length} سجل`;
        }
      }

      if (fill) fill.style.width = '100%';

    } catch (err) {
      console.error(err);
      stopTimer();
      setStatus('خطأ: ' + err.message, 'error');
      state.isProcessing = false;
      return;
    }

    stopTimer();
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    finishScan(elapsed);
  }

  function finishScan(elapsed) {
    state.isProcessing = false;

    const tables = document.querySelectorAll('table');
    let target = tables[0];
    if (target) {
      for (const t of tables) if (t.innerText.length > target.innerText.length) target = t;
      const tbody = target.querySelector('tbody') || target;
      tbody.innerHTML = state.htmlBuffer;
      tbody.addEventListener('click', e => {
        const row = e.target.closest('tr[data-inv]'); if (!row) return;
        if (row.dataset.inv && typeof getDetails === 'function') getDetails(row.dataset.onl, row.dataset.inv, row.dataset.src, row.dataset.hid);
      });
    }

    let recCount=0, packedCount=0;
    state.savedRows.forEach(r => { if(r.st==='received') recCount++; if(r.st==='packed') packedCount++; });

    const timerVal = document.getElementById('ali_timer_val');
    if (timerVal) timerVal.innerText = elapsed + 's ✅';

    const pLabel = document.getElementById('p-label');
    if (pLabel) pLabel.innerText = `✅ ${state.savedRows.length} سجل — ⚡ ${elapsed}s`;

    setStatus(`اكتمل: ${state.savedRows.length} سجل (📦${packedCount} 📥${recCount}) — ${elapsed}s ⚡`, 'done');
    showToast(`${state.savedRows.length} سجل (${elapsed}s)`, 'success');

    const showDeliver = recCount > 0;
    const showExport = packedCount > 0;

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = `
      <div style="background:${NEU.bg};border-radius:14px;padding:12px 16px;margin-bottom:14px;font-size:12px;color:#6d28d9;font-weight:700;text-align:center;box-shadow:${neuInset}">
        ${packedCount>0?'📦 Packed: '+packedCount+' — ':''}${recCount>0?'📥 Received: '+recCount+' — ':''}⚡ ${elapsed}s
      </div>
      ${showDeliver?`<div style="background:${NEU.bg};border-radius:18px;padding:16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;box-shadow:${neuOutset}"><span style="font-size:14px;font-weight:800;color:${NEU.text}">عدد التسليم:</span><input type="number" id="ali_open_count" value="${recCount}" style="width:64px;padding:10px;border:none;border-radius:14px;text-align:center;font-size:18px;font-weight:900;color:${NEU.error};background:${NEU.bg};outline:none;font-family:'Tajawal',sans-serif;box-shadow:${neuInset}" onfocus="this.value=''"></div><button id="ali_btn_deliver_silent" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;box-shadow:6px 6px 14px rgba(220,38,38,0.3),-4px -4px 10px ${NEU.shadowLight};margin-bottom:10px">📝 تسليم (${recCount} Received)</button>`:''}
      ${showExport?`<button id="ali_btn_export" style="width:100%;padding:16px 20px;border:none;border-radius:16px;cursor:pointer;font-weight:900;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:6px 6px 14px rgba(217,119,6,0.3),-4px -4px 10px ${NEU.shadowLight};margin-bottom:10px">📦 تصدير Packed (${packedCount})</button>`:''}
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="ali-re" data-m="packed" style="flex:1;padding:12px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:11px;font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;box-shadow:${neuBtnSm}">📦 Packed</button>
        <button class="ali-re" data-m="received" style="flex:1;padding:12px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:11px;font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:${neuBtnSm}">📥 Received</button>
        <button class="ali-re" data-m="both" style="flex:1;padding:12px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:11px;font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:white;box-shadow:${neuBtnSm}">🔄 الكل</button>
      </div>`;

    dynArea.querySelectorAll('.ali-re').forEach(btn=>{btn.addEventListener('click',function(){const m=this.dataset.m;if(m==='packed')scanAllPages(['packed']);else if(m==='received')scanAllPages(['received']);else scanAllPages(['packed','received']);});});

    if(document.getElementById('ali_btn_deliver_silent')){
      document.getElementById('ali_btn_deliver_silent').addEventListener('click', async()=>{
        const list=state.savedRows.filter(r=>r.st==='received');
        const count=parseInt(document.getElementById('ali_open_count').value)||list.length;
        const toDeliver=list.slice(0,count);
        if(!toDeliver.length){showToast('لا يوجد Received','warning');return;}
        const res=await showDialog({icon:'📝',title:'تأكيد التسليم',desc:`تسليم ${toDeliver.length} طلب`,info:[{label:'العدد',value:toDeliver.length,color:NEU.error}],buttons:[{text:'إلغاء',value:'cancel',primary:false},{text:'✅ تنفيذ',value:'confirm',primary:true}]});
        if(res.action!=='confirm')return;
        const btn=document.getElementById('ali_btn_deliver_silent');btn.disabled=true;btn.style.opacity='0.8';
        let ok=0;const url=window.location.origin+'/ez_pill_web/getEZPill_Details/updatetoDeliver';
        for(let i=0;i<toDeliver.length;i++){
          const item=toDeliver[i];btn.innerHTML=`<div style="width:14px;height:14px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> (${i+1}/${toDeliver.length})`;
          try{const p=new URLSearchParams();p.append('invoice_num',item.id);p.append('patienName',item.guestName);p.append('mobile',item.guestMobile);const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:p});if(r.ok){ok++;item.st='processed';const re=document.getElementById('row_'+item.id);if(re){re.style.background='rgba(163,177,198,0.2)';re.style.opacity='0.5';}const se=document.getElementById('st_'+item.id);if(se)se.innerText='processed';}}catch(e){}
          updateStats();await sleep(150);
        }
        await showDialog({icon:'🎉',title:'اكتمل',desc:`${ok}/${toDeliver.length}`,info:[{label:'نجح',value:ok,color:NEU.success}],buttons:[{text:'👍',value:'ok',primary:true}]});
        btn.innerHTML='✅';btn.style.background='linear-gradient(135deg,#059669,#10b981)';btn.style.opacity='1';btn.disabled=false;
      });
    }

    if(document.getElementById('ali_btn_export')){
      document.getElementById('ali_btn_export').addEventListener('click', async()=>{
        const rows=state.savedRows.filter(r=>r.st==='packed');if(!rows.length){showToast('لا يوجد','warning');return;}
        const res=await showDialog({icon:'📦',title:'تصدير',desc:`${rows.length} طلب`,info:[{label:'ملفات',value:Math.ceil(rows.length/MAX_PER_FILE),color:NEU.accent}],buttons:[{text:'إلغاء',value:'cancel',primary:false},{text:'📥 تصدير',value:'confirm',primary:true}]});
        if(res.action!=='confirm')return;
        const n=Math.ceil(rows.length/MAX_PER_FILE);
        for(let i=0;i<n;i++){const ch=rows.slice(i*MAX_PER_FILE,Math.min((i+1)*MAX_PER_FILE,rows.length));const b=new Blob([ch.map(r=>r.onl).join('\n')],{type:'text/plain'});const u=URL.createObjectURL(b);setTimeout(()=>{const a=document.createElement('a');a.href=u;a.download='Export_'+(i+1)+'.txt';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);},i*500);}
        showToast(`تم ${n} ملف`,'success');
      });
    }
  }

  document.getElementById('ali_btn_packed').addEventListener('click',function(){if(state.isProcessing)return;this.disabled=true;this.style.opacity='0.5';this.innerHTML='📦 جاري...';scanAllPages(['packed']);});
  document.getElementById('ali_btn_received').addEventListener('click',function(){if(state.isProcessing)return;this.disabled=true;this.style.opacity='0.5';this.innerHTML='📥 جاري...';scanAllPages(['received']);});
  document.getElementById('ali_btn_both').addEventListener('click',function(){if(state.isProcessing)return;this.disabled=true;this.style.opacity='0.5';this.innerHTML='🚀 جاري...';scanAllPages(['packed','received']);});

})();

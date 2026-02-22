// ═══════════════════════════════════════════════════════════════════
// إدارة الطلبات v5.1 - (إصدار تصحيح العرض والمطابقة البصرية)
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.1';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const MAX_PER_FILE = 49;

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    isSyncing: false,
    htmlBuffer: ''
  };

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;

  function showToast(message, type = 'info') {
    let container = document.getElementById('ali-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ali-toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';
      document.body.appendChild(container);
    }
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 22px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Tajawal','Segoe UI',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showDialog({ icon, iconColor, title, desc, info, buttons }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.2s';
      const iconBg = { blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)', green:'linear-gradient(135deg,#dcfce7,#bbf7d0)', amber:'linear-gradient(135deg,#fef3c7,#fde68a)', red:'linear-gradient(135deg,#fee2e2,#fecaca)' };
      let infoHTML = '';
      if (info && info.length) {
        infoHTML = info.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">${r.label}</span><span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span></div>`).join('');
      }
      let buttonsHTML = '';
      if (buttons && buttons.length) {
        buttonsHTML = buttons.map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      }
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div></div><div style="padding:20px 24px">${infoHTML}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve({ action: buttons[idx].value }); }
      });
      document.body.appendChild(overlay);
    });
  }

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:999999;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.4s}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"⚡";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row { border-bottom: 1px solid #e2e8f0; transition: background 0.2s; }
    .fast-row:hover { background: #f8fafc; }
  `;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:20px;font-weight:900;margin:0">محرك الأداء الأقصى</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v5.1 Optimized</span>
        </div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
          ${buildStatCard('📥','0','Received','#10b981','stat_rec','linear-gradient(90deg,#10b981,#34d399)')}
          ${buildStatCard('📦','0','Packed','#f59e0b','stat_pack','linear-gradient(90deg,#f59e0b,#fbbf24)')}
          ${buildStatCard('✅','0','المنجز','#3b82f6','stat_done','linear-gradient(90deg,#3b82f6,#60a5fa)')}
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}
        </div>
        
        <div id="ali_settings_box" style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700;color:#475569">نطاق الفحص (الصفحات)</span>
            <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:75px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Tajawal',sans-serif">
          </div>
          <div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">
            <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.2s"></div>
          </div>
        </div>
        
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
          <span>✅</span><span>النظام جاهز للعمل</span>
        </div>
        
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">
            ⚡ بدء الاستعلام الصاروخي
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function buildStatCard(icon,val,label,color,id,border){
    return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:${border}"></div><div style="font-size:18px;margin-bottom:4px">${icon}</div><div id="${id}" style="font-size:22px;font-weight:900;color:${color};line-height:1;margin-bottom:2px">${val}</div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${label}</div></div>`;
  }

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    if (!el) return;
    const c = { ready:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'}, working:{bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',icon:'spinner'}, error:{bg:'#fef2f2',color:'#dc2626',border:'#fecaca',icon:'❌'}, done:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'} }[type] || {bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'};
    const iconHTML = c.icon === 'spinner' ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>' : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
  }

  function updateStats() {
    let rec=0,done=0,packed=0;
    state.savedRows.forEach(r => {
      if(r.st==='received')rec++;
      if(r.st==='processed')done++;
      if(r.st==='packed')packed++;
    });
    document.getElementById('stat_rec').innerText = rec;
    document.getElementById('stat_pack').innerText = packed;
    document.getElementById('stat_done').innerText = done;
    document.getElementById('stat_total').innerText = state.savedRows.length;
  }

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(()=>panel.remove(),280)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function scanAllPages() {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    const baseUrl = window.location.origin + "/ez_pill_web/";
    const currentStatus = 'packed'; 

    setStatus('جاري الاتصال السريع بالخادم...', 'working');

    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = [];
    state.visitedSet.clear();
    state.htmlBuffer = ''; 

    function processData(data) {
      let orders = [];
      try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
      if (!orders || orders.length === 0) return;

      for (let i = 0; i < orders.length; i++) {
        const item = orders[i];
        const inv = item.Invoice || '';
        const onl = item.onlineNumber || '';
        
        if (inv.length >= 5 && inv.startsWith('0') && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);

          let st = 'other';
          let rawStatus = String(item.status || item.Status || item.order_status || item.OrderStatus || '').toLowerCase().replace(/<[^>]*>?/gm, '').trim();
          
          if(rawStatus.includes('packed')) st = 'packed';
          else if(rawStatus.includes('received')) st = 'received';
          else {
              let cleanStr = JSON.stringify(item).toLowerCase();
              if(cleanStr.includes('"packed"')) st = 'packed';
              else if(cleanStr.includes('"received"')) st = 'received';
          }

          let bgColor = st === 'received' ? 'rgba(16,185,129,0.05)' : (st === 'packed' ? 'rgba(245,158,11,0.05)' : 'transparent');
          let stColor = st === 'received' ? '#059669' : '#d97706';

          // 🟢 تصحيح الهيكل بـ 8 أعمدة لمطابقة التصميم الأصلي ومنع ترحيل الحالة
          let rowHTML = `<tr class="fast-row" id="row_${inv}" style="background:${bgColor}">
              <td style="padding:12px 8px">${inv}</td>
              <td style="padding:12px 8px">${onl}</td>
              <td style="padding:12px 8px">${item.guestName || ''}</td>
              <td style="padding:12px 8px">${item.guestMobile || item.mobile || ''}</td>
              <td style="padding:12px 8px">${item.payment_method || 'Cash'}</td>
              <td style="padding:12px 8px">${item.created_at || item.Created_Time || ''}</td>
              <td id="st_${inv}" style="padding:12px 8px; font-weight:900; color:${stColor}; text-transform:capitalize;">${st}</td>
              <td style="padding:12px 8px">${item.source || 'StorePaid'}</td>
          </tr>`;

          state.htmlBuffer += rowHTML;
          state.savedRows.push({ id: inv, onl: onl, st: st, guestName: item.guestName||'', guestMobile: item.guestMobile||'' });
        }
      }
    }

    try {
      let res1 = await fetch(baseUrl + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: currentStatus, pageSelected: 1, searchby: '' }) });
      let data1 = await res1.json();
      
      if (data1.total_orders) {
        let exactTotal = parseInt(data1.total_orders) || 0;
        if (exactTotal > 0) { maxPages = Math.ceil(exactTotal / 10); document.getElementById('p_lim').value = maxPages; }
      }

      processData(data1);
      updateStats();
      if (fill) fill.style.width = ((1 / maxPages) * 100) + '%';

      const fetchPromises = [];
      for (let i = 2; i <= maxPages; i++) {
          fetchPromises.push(
              fetch(baseUrl + 'Home/getOrders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: currentStatus, pageSelected: i, searchby: '' }) })
              .then(r => r.json())
              .then(data => {
                  processData(data);
                  updateStats();
              })
          );
      }
      
      await Promise.all(fetchPromises);
      if (fill) fill.style.width = '100%';

    } catch (err) { console.error(err); }
    finishScan();
  }

  function finishScan() {
    state.isProcessing = false;
    const tables = document.querySelectorAll('table');
    let target = tables[0];
    if (target) {
      for(const t of tables) if(t.innerText.length>target.innerText.length) target=t;
      const tbody = target.querySelector('tbody') || target;
      tbody.innerHTML = state.htmlBuffer;
    }
    
    let recCount = 0;
    state.savedRows.forEach(r => { if(r.st==='received') recCount++; });
    
    setStatus(`اكتمل الفحص: ${state.savedRows.length} سجل`,'done');
    showToast(`اكتملت العملية: ${state.savedRows.length} سجل`,'success');

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML=`
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#1d4ed8;font-weight:600;text-align:center">
        تم إدراج <strong>${state.savedRows.length}</strong> سجل بمطابقة بصرية كاملة
      </div>
      <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:14px;font-weight:700;color:#475569">الطلبات الجاهزة للتسليم:</span>
        <input type="number" id="ali_open_count" value="${recCount}" style="width:64px;padding:8px;border:2px solid #dc2626;border-radius:10px;text-align:center;font-size:18px;font-weight:900;color:#991b1b;background:white;outline:none;font-family:'Tajawal',sans-serif" onfocus="this.value=''">
      </div>
      <button id="ali_btn_deliver_silent" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;box-shadow:0 4px 15px rgba(220,38,38,0.3);transition:all 0.3s;margin-bottom:8px">
        🚀 تنفيذ التسليم (Received)
      </button>
      <button id="ali_btn_export" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;transition:all 0.3s;margin-bottom:8px">
        📥 تصدير الطلبات (Packed)
      </button>
      <button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:13px;font-family:'Tajawal',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">
        🔄 إعادة الفحص السريع
      </button>
    `;

    document.getElementById('ali_btn_deliver_silent').addEventListener('click', async()=>{
      const list = state.savedRows.filter(r => r.st === 'received');
      const count = parseInt(document.getElementById('ali_open_count').value) || list.length;
      const toDeliver = list.slice(0, count);
      if(!toDeliver.length){ showToast('لا توجد سجلات مطابقة.', 'warning'); return; }

      const res = await showDialog({
        icon: '🚀', iconColor: 'red', title: 'تسليم الطلبات',
        desc: 'سيتم إرسال أوامر التسليم للخادم بالخلفية.',
        info: [ { label: 'عدد السجلات', value: toDeliver.length, color: '#ef4444' } ],
        buttons: [
          { text: 'إلغاء الأمر', value: 'cancel' },
          { text: 'تأكيد التسليم', value: 'confirm', style: 'background:linear-gradient(135deg,#dc2626,#ef4444);color:white;' }
        ]
      });

      if(res.action !== 'confirm') return;
      const btn = document.getElementById('ali_btn_deliver_silent');
      btn.disabled = true;
      let successCount = 0;
      const deliverUrl = window.location.origin + '/ez_pill_web/getEZPill_Details/updatetoDeliver';

      for(let i=0; i<toDeliver.length; i++) {
        const item = toDeliver[i];
        btn.innerHTML = `تحديث (${i+1}/${toDeliver.length})...`;
        try {
          var params = new URLSearchParams();
          params.append('invoice_num', item.id);
          params.append('patienName', item.guestName);
          params.append('mobile', item.guestMobile);
          const r = await fetch(deliverUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: params });
          if(r.ok) {
            successCount++;
            item.st = 'processed';
            let rowEl = document.getElementById('row_' + item.id);
            if(rowEl) {
                rowEl.style.background = 'rgba(226,232,240,0.5)';
                rowEl.style.opacity = '0.5';
                document.getElementById('st_' + item.id).innerHTML = `<span style="color:#3b82f6;">Processed</span>`;
            }
          }
        } catch(e) {}
        updateStats();
        await sleep(150);
      }
      showToast(`اكتمل تسليم ${successCount} سجل بنجاح`, 'success');
      btn.innerHTML = 'اكتمل التسليم';
      btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
      btn.disabled = false;
    });

    document.getElementById('ali_btn_export').addEventListener('click', async()=>{
      const packedRows=state.savedRows.filter(r=>r.st==='packed');
      if(!packedRows.length){showToast('لا توجد سجلات.','warning');return}
      const numFiles = Math.ceil(packedRows.length / MAX_PER_FILE);
      for (let i = 0; i < numFiles; i++) {
        const start = i * MAX_PER_FILE;
        const end = Math.min(start + MAX_PER_FILE, packedRows.length);
        const chunk = packedRows.slice(start, end);
        const content = chunk.map(r => r.onl).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = url; a.download = 'Export_' + (i + 1) + '.txt';
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        }, i * 500);
      }
    });

    document.getElementById('ali_btn_sync').addEventListener('click', ()=>{ scanAllPages(); });
  }

  document.getElementById('ali_start').addEventListener('click',function(){
    if (state.isProcessing) return;
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري المعالجة...';
    scanAllPages();
  });

})();

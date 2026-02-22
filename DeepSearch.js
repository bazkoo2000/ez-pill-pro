// ═══════════════════════════════════════════════════════════════════
// EZ-PILL PRO v5.4 - (دمج محرك البحث مع محرك السرعة القصوى)
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.4';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const MAX_PER_FILE = 49;

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    isProcessing: false,
    openedCount: 0,
    htmlBuffer: ''
  };

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 10;

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
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 22px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Tajawal',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
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
        buttonsHTML = buttons.map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      }
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal',sans-serif;direction:rtl;color:#1e293b;"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div></div><div style="padding:20px 24px">${infoHTML}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve(buttons[idx].value); }
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
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15);z-index:9999999;font-family:'Tajawal',sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.4s}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row { border-bottom: 1px solid #e2e8f0; transition: background 0.2s; }
  `;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:18px;font-weight:900;margin:0">إدارة الطلبات المتطورة</h3>
        </div>
        <div style="text-align:right;margin-top:4px"><span style="background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v5.4 Integrated Search</span></div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          ${buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')}
          ${buildStatCard('🔍','0','مطابق','#10b981','stat_match','linear-gradient(90deg,#10b981,#34d399)')}
          ${buildStatCard('🚀','0','مفتوح','#3b82f6','stat_opened','linear-gradient(90deg,#3b82f6,#60a5fa)')}
        </div>
        <div id="ali_settings_box" style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700;color:#475569">نطاق الفحص (الصفحات)</span>
            <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:75px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-weight:800;color:#3b82f6;outline:none">
          </div>
          <div id="p-bar" style="height:6px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width 0.2s"></div></div>
        </div>
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز للعمل</span></div>
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">🚀 بدء الاستعلام الصاروخي</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function buildStatCard(icon,val,label,color,id,border){
    return `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:${border}"></div><div style="font-size:18px">${icon}</div><div id="${id}" style="font-size:22px;font-weight:900;color:${color}">${val}</div><div style="font-size:10px;color:#94a3b8;font-weight:700">${label}</div></div>`;
  }

  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    const c = { ready:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'}, working:{bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',icon:'spinner'}, done:{bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'} }[type] || {bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',icon:'✅'};
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    el.innerHTML = c.icon==='spinner' ? `<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div><span>${text}</span>` : `<span>${c.icon}</span><span>${text}</span>`;
  }

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.remove()});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  async function scanAllPages() {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill');
    const baseUrl = window.location.origin + "/ez_pill_web/";
    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = []; state.visitedSet.clear(); state.htmlBuffer = '';

    function processData(data) {
      let orders = []; try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
      if (!orders) return;
      orders.forEach(item => {
        const inv = item.Invoice || ''; const onl = item.onlineNumber || '';
        if (inv.length > 3 && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);
          let rawSt = String(item.status || item.Status || item.order_status || '').toLowerCase().replace(/<[^>]*>?/gm, '').trim();
          let st = rawSt.includes('packed') ? 'packed' : (rawSt.includes('received') ? 'received' : 'other');
          let stColor = st === 'received' ? '#059669' : '#d97706';
          
          let rowHTML = `<tr class="fast-row" style="background:${st==='received'?'rgba(16,185,129,0.05)':'transparent'}">
            <td style="padding:12px 8px"><label style="color:blue;text-decoration:underline;font-weight:bold;cursor:pointer" onclick="getDetails('${onl}','${inv}','${item.source||'StorePaid'}','${item.head_id||''}');">${inv}</label></td>
            <td style="padding:12px 8px">${onl}</td>
            <td style="padding:12px 8px">${item.guestName || ''}</td>
            <td style="padding:12px 8px">${item.guestMobile || item.mobile || ''}</td>
            <td style="padding:12px 8px">${item.payment_method || 'Cash'}</td>
            <td style="padding:12px 8px">${item.created_at || ''}</td>
            <td style="padding:12px 8px; font-weight:900; color:${stColor}; text-transform:capitalize;">${st}</td>
            <td style="padding:12px 8px">${item.source || 'StorePaid'}</td>
          </tr>`;
          state.htmlBuffer += rowHTML;
          state.savedRows.push({ id: inv, onl: onl, st: st, args: [onl, inv, item.source||'StorePaid', item.head_id||''] });
        }
      });
    }

    try {
      setStatus('جاري الفحص المفتوح...', 'working');
      const fetchPromises = [];
      for (let i = 1; i <= maxPages; i++) {
          fetchPromises.push(fetch(baseUrl+'Home/getOrders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'packed', pageSelected:i, searchby:''}) }).then(r=>r.json()).then(d=>processData(d)));
      }
      await Promise.all(fetchPromises);
      if (fill) fill.style.width = '100%';
    } catch (e) { console.error(e); }
    finishScan();
  }

  function finishScan() {
    state.isProcessing = false;
    const tables = document.querySelectorAll('table');
    let target = tables[0]; for(const t of tables) if(t.innerText.length>target.innerText.length) target=t;
    const tbody = target.querySelector('tbody') || target;
    tbody.innerHTML = state.htmlBuffer;
    
    document.getElementById('stat_total').innerText = state.savedRows.length;
    document.getElementById('stat_match').innerText = state.savedRows.length;
    setStatus(`تم تجميع ${state.savedRows.length} طلب`, 'done');

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = `
      <div style="margin-bottom:10px; position:relative">
        <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:900;color:#94a3b8;font-family:monospace;pointer-events:none">0</span>
        <input type="text" id="ali_sI" placeholder="أدخل الأرقام بعد الـ 0..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-weight:700;direction:ltr;box-sizing:border-box;outline:none;background:#f8fafc">
      </div>
      <div style="margin-bottom:10px; position:relative">
        <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none">🔗</span>
        <input type="text" id="ali_sO" placeholder="رقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;box-sizing:border-box;outline:none;background:#f8fafc">
      </div>
      <button id="ali_btn_open" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#059669,#10b981);color:white;margin-bottom:8px">⚡ ابحث ثم افتح المطابق</button>
      <button id="ali_btn_sync" style="width:100%;padding:10px;border:none;border-radius:14px;cursor:pointer;font-weight:700;background:#f8fafc;border:2px solid #e2e8f0;color:#475569">🔄 إعادة الفحص</button>
    `;

    const sI = document.getElementById('ali_sI'), sO = document.getElementById('ali_sO'), openBtn = document.getElementById('ali_btn_open');
    let currentMatches = [];

    function filter() {
      const v1 = sI.value.trim() !== '' ? '0' + sI.value.trim() : '', v2 = sO.value.trim().toLowerCase();
      tbody.innerHTML = ''; let shown = 0; currentMatches = [];
      state.savedRows.forEach(r => {
        if ((v1!=='' && r.id.startsWith(v1)) || (v2!=='' && r.onl.toLowerCase().includes(v2)) || (v1==='' && v2==='')) {
          const rowNode = document.createElement('tr'); rowNode.className='fast-row';
          rowNode.style.background = r.st==='received' ? 'rgba(16,185,129,0.05)' : 'transparent';
          rowNode.innerHTML = `<td style="padding:12px 8px"><label style="color:blue;text-decoration:underline;font-weight:bold;cursor:pointer" onclick="getDetails('${r.args[0]}','${r.args[1]}','${r.args[2]}','${r.args[3]}');">${r.id}</label></td><td style="padding:12px 8px">${r.onl}</td><td colspan="4"></td><td style="padding:12px 8px; font-weight:900; color:${r.st==='received'?'#059669':'#d97706'}">${r.st}</td><td></td>`;
          tbody.appendChild(rowNode); shown++; currentMatches.push(r);
        }
      });
      document.getElementById('stat_match').innerText = shown;
      openBtn.innerText = (v1||v2) ? `⚡ فتح المطابق (${shown} طلب)` : '⚡ ابحث ثم افتح المطابق';
    }

    sI.addEventListener('input', filter); sO.addEventListener('input', filter);
    
    openBtn.addEventListener('click', async () => {
      if (!currentMatches.length) return showToast('لا توجد نتائج مطابقة', 'warning');
      const confirm = await showDialog({ icon:'🚀', iconColor:'green', title:'فتح الطلبات', desc:`سيتم فتح ${currentMatches.length} نافذة جديدة.`, buttons:[{text:'إلغاء',value:'no'},{text:'تأكيد',value:'yes',style:'background:#059669;color:white'}] });
      if (confirm !== 'yes') return;
      for (let i=0; i<currentMatches.length; i++) {
        const r = currentMatches[i];
        const url = `${window.location.origin}/ez_pill_web/getEZPill_Details?onlineNumber=${r.args[0]}&Invoice=${r.args[1]}&typee=${r.args[2]}&head_id=${r.args[3]}`;
        window.open(url, "_blank"); state.openedCount++; document.getElementById('stat_opened').innerText = state.openedCount;
        if(i < currentMatches.length - 1) await new Promise(res => setTimeout(res, 1200));
      }
    });

    document.getElementById('ali_btn_sync').addEventListener('click', () => scanAllPages());
  }

  document.getElementById('ali_start').addEventListener('click', function() { scanAllPages(); this.disabled = true; });

})();

// ═══════════════════════════════════════════════════════════════════
// EZ-PILL PRO v5.7 - (الإصدار المصلح: مطابقة كاملة للبيانات والخانات)
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v5';
  const VERSION = '5.7';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

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
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showDialog(opts) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const iconBg = { blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)', green:'linear-gradient(135deg,#dcfce7,#bbf7d0)' };
      const buttonsHTML = opts.buttons.map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:420px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[opts.iconColor]||iconBg.blue}">${opts.icon}</div><div style="font-size:20px;font-weight:900;margin-bottom:6px">${opts.title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${opts.desc}</div></div><div style="padding:20px 24px">${opts.body||''}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve(opts.buttons[idx].value); }
      });
      document.body.appendChild(overlay);
    });
  }

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 25px 60px -12px rgba(0,0,0,0.15);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;animation:aliSlideIn 0.5s}
    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#0f2744)}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none}
    #${PANEL_ID}.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row { border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
  `;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px;color:white;position:relative;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);cursor:pointer">−</span>
            <span id="ali_close" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.2);cursor:pointer">✕</span>
          </div>
          <h3 style="font-size:18px;font-weight:900;margin:0">مُنهي الطلبات v5.7</h3>
        </div>
        <div style="text-align:right;margin-top:4px"><span style="background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">Original Layout Verified</span></div>
      </div>
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">
        <div id="ali_stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          <div style="background:#f8fafc;padding:12px 6px;text-align:center;border-radius:14px">📊<div id="stat_total" style="font-size:20px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:10px">إجمالي</div></div>
          <div style="background:#f8fafc;padding:12px 6px;text-align:center;border-radius:14px">🔍<div id="stat_match" style="font-size:20px;font-weight:900;color:#10b981">0</div><div style="font-size:10px">مطابق</div></div>
          <div style="background:#f8fafc;padding:12px 6px;text-align:center;border-radius:14px">🚀<div id="stat_opened" style="font-size:20px;font-weight:900;color:#3b82f6">0</div><div style="font-size:10px">مفتوح</div></div>
        </div>
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:700">📄 عدد الصفحات</span><input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:70px;padding:4px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-weight:800;color:#3b82f6;outline:none"></div>
          <div id="p-bar" style="height:6px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width 0.2s"></div></div>
        </div>
        <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز للفحص</span></div>
        <div id="ali_dynamic_area">
          <button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e3a5f,#3b82f6);color:white">🚀 بدء الفحص المتوازي</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').onclick=e=>{e.stopPropagation();panel.remove()};
  document.getElementById('ali_min').onclick=e=>{e.stopPropagation();panel.classList.add('ali-minimized')};

  async function scanAllPages() {
    state.isProcessing = true;
    const fill = document.getElementById('p-fill'), baseUrl = window.location.origin + "/ez_pill_web/";
    let maxPages = parseInt(document.getElementById('p_lim').value) || 1;
    state.savedRows = []; state.visitedSet.clear();

    const statusEl = document.getElementById('status-msg');
    statusEl.innerHTML = `<div style="width:14px;height:14px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.6s linear infinite"></div><span>جاري السحب...</span>`;

    function processData(data) {
      let orders = []; try { orders = typeof data.orders_list === 'string' ? JSON.parse(data.orders_list) : data.orders_list; } catch(e) {}
      if (!orders) return;
      orders.forEach(item => {
        const inv = item.Invoice || ''; const onl = item.onlineNumber || '';
        if (inv.length > 3 && !state.visitedSet.has(inv)) {
          state.visitedSet.add(inv);
          
          // قراءة الحالة الطبيعية دون تدخل
          let st = String(item.status || item.Status || item.order_status || '').toLowerCase().replace(/<[^>]*>?/gm, '').trim();
          let stColor = st.includes('received') ? '#059669' : (st.includes('packed') ? '#d97706' : '#64748b');

          state.savedRows.push({ 
            id: inv, onl: onl, st: st, stColor: stColor,
            name: item.guestName || '', 
            mobile: item.guestMobile || item.mobile || '',
            pay: item.payment_method || '',
            created: item.created_at || item.Created_Time || '',
            delivery: item.delivery_time || '',
            source: item.source || '',
            args: [onl, inv, item.source||'StorePaid', item.head_id||''] 
          });
        }
      });
    }

    try {
      const promises = [];
      for (let i = 1; i <= maxPages; i++) {
        promises.push(fetch(baseUrl+'Home/getOrders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'packed', pageSelected:i, searchby:''}) }).then(r=>r.json()).then(d=>processData(d)));
      }
      await Promise.all(promises);
      if (fill) fill.style.width = '100%';
    } catch (e) { console.error(e); }
    finishScan();
  }

  function finishScan() {
    state.isProcessing = false;
    const tables = document.querySelectorAll('table');
    let target = tables[0]; for(const t of tables) if(t.innerText.length>target.innerText.length) target=t;
    const tbody = target.querySelector('tbody') || target;
    
    document.getElementById('stat_total').innerText = state.savedRows.length;
    document.getElementById('stat_match').innerText = state.savedRows.length;
    document.getElementById('status-msg').innerHTML = `<span>🎉</span><span>تم تجميع ${state.savedRows.length} طلب</span>`;

    const dynArea = document.getElementById('ali_dynamic_area');
    dynArea.innerHTML = `
      <div style="margin-bottom:10px; position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:900;color:#94a3b8;font-family:monospace">0</span><input type="text" id="ali_sI" placeholder="رقم الفاتورة..." style="width:100%;padding:12px 16px 12px 34px;border:2px solid #e2e8f0;border-radius:12px;font-weight:700;direction:ltr;box-sizing:border-box;outline:none"></div>
      <div style="margin-bottom:10px; position:relative"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%)">🔗</span><input type="text" id="ali_sO" placeholder="الرمز المرجعي..." style="width:100%;padding:12px 42px 12px 16px;border:2px solid #e2e8f0;border-radius:12px;box-sizing:border-box;outline:none"></div>
      <button id="ali_btn_open" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#059669,#10b981);color:white;margin-bottom:8px">⚡ فتح المطابق</button>
      <button id="ali_btn_sync" style="width:100%;padding:10px;border:none;border-radius:14px;cursor:pointer;font-weight:700;background:#f8fafc;border:2px solid #e2e8f0;color:#475569">🔄 إعادة الفحص</button>
    `;

    const sI=document.getElementById('ali_sI'), sO=document.getElementById('ali_sO'), openBtn=document.getElementById('ali_btn_open');
    let currentMatches = [];

    function filter() {
      const v1 = sI.value.trim() !== '' ? '0' + sI.value.trim() : '', v2 = sO.value.trim().toLowerCase();
      tbody.innerHTML = ''; let shown = 0; currentMatches = [];
      state.savedRows.forEach(r => {
        if ((v1!=='' && r.id.startsWith(v1)) || (v2!=='' && r.onl.toLowerCase().includes(v2)) || (v1==='' && v2==='')) {
          const row = document.createElement('tr');
          row.className = 'fast-row';
          row.style.background = r.st.includes('received') ? 'rgba(16,185,129,0.05)' : 'transparent';
          
          // 🟢 بناء الهيكل بـ 9 أعمدة طبق الأصل من النظام 🟢
          row.innerHTML = `
            <td style="padding:10px 8px"><label style="color:blue;text-decoration:underline;font-weight:bold;cursor:pointer" onclick="getDetails('${r.args[0]}','${r.args[1]}','${r.args[2]}','${r.args[3]}');">${r.id}</label></td>
            <td style="padding:10px 8px">${r.onl}</td>
            <td style="padding:10px 8px">${r.name}</td>
            <td style="padding:10px 8px">${r.mobile}</td>
            <td style="padding:10px 8px">${r.pay}</td>
            <td style="padding:10px 8px">${r.created}</td>
            <td style="padding:10px 8px">${r.delivery}</td>
            <td style="padding:10px 8px; font-weight:900; color:${r.stColor}; text-transform:capitalize;">${r.st}</td>
            <td style="padding:10px 8px">${r.source}</td>
          `;
          tbody.appendChild(row); shown++; currentMatches.push(r);
        }
      });
      document.getElementById('stat_match').innerText = shown;
      openBtn.innerText = (v1||v2) ? `⚡ فتح المطابق (${shown})` : '⚡ فتح المطابق';
    }

    sI.addEventListener('input', filter); sO.addEventListener('input', filter);
    filter();

    openBtn.onclick = async () => {
      if (!currentMatches.length) return showToast('لا توجد نتائج', 'warning');
      const confirm = await showDialog({ icon:'🚀', iconColor:'green', title:'فتح الطلبات', desc:`سيتم فتح ${currentMatches.length} نافذة.`, buttons:[{text:'إلغاء',value:'no'},{text:'تأكيد',value:'yes',style:'background:#059669;color:white'}] });
      if (confirm !== 'yes') return;
      for (let i=0; i<currentMatches.length; i++) {
        const r = currentMatches[i];
        window.open(`${window.location.origin}/ez_pill_web/getEZPill_Details?onlineNumber=${r.args[0]}&Invoice=${r.args[1]}&typee=${r.args[2]}&head_id=${r.args[3]}`, "_blank");
        state.openedCount++; document.getElementById('stat_opened').innerText = state.openedCount;
        if(i < currentMatches.length - 1) await new Promise(res => setTimeout(res, 1200));
      }
    };

    document.getElementById('ali_btn_sync').onclick = () => scanAllPages();
  }

  document.getElementById('ali_start').onclick = function() { scanAllPages(); this.disabled = true; };

})();

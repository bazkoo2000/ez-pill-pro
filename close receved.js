// ═══════════════════════════════════════════════════════════════════
// مُنهي الطلبات v3.5 - نسخة الإصلاح النهائي للتجميع
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v3';
  const VERSION = '3.5';
  const VER_KEY = 'munhi_ver';
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  const MAX_PER_FILE = 49;

  const state = {
    savedRows: [],
    visitedSet: new Set(),
    openedWindows: [],
    startTime: null,
    isProcessing: false
  };

  window.name = "ali_main_window";

  const bodyText = document.body.innerText;
  const packedMatch = bodyText.match(/packed\s*\n*\s*(\d+)/i);
  const totalPacked = packedMatch ? parseInt(packedMatch[1]) : 0;
  const defaultPages = totalPacked > 0 ? Math.ceil(totalPacked / 10) : 1;

  // ─── Toast Notifications (نفس كودك v3.1) ───
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
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ─── Dialog System (نفس كودك v3.1 بدون تعديل) ───
  function showDialog({ icon, iconColor, title, desc, info, buttons, body }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      const iconBg = { blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)', green:'linear-gradient(135deg,#dcfce7,#bbf7d0)', amber:'linear-gradient(135deg,#fef3c7,#fde68a)', red:'linear-gradient(135deg,#fee2e2,#fecaca)' };
      let infoHTML = (info || []).map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">${r.label}</span><span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span></div>`).join('');
      let buttonsHTML = (buttons || []).map((btn, idx) => `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Tajawal','Segoe UI',sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`).join('');
      overlay.innerHTML = `<div style="background:white;border-radius:24px;width:440px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal','Segoe UI',sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div><div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div></div><div style="padding:20px 24px">${infoHTML}${body||''}</div><div style="padding:16px 24px 24px;display:flex;gap:10px">${buttonsHTML}</div></div>`;
      overlay.addEventListener('click', (e) => { const btn = e.target.closest('[data-idx]'); if (btn) { const idx = parseInt(btn.getAttribute('data-idx')); overlay.remove(); resolve({ action: buttons[idx].value, overlay: overlay }); } });
      document.body.appendChild(overlay);
    });
  }

  // ─── Export Logic (نفس كودك v3.1) ───
  function showExportDialog(packedRows) { return new Promise((resolve) => { const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s'; overlay.innerHTML = `<div style="background:white;border-radius:24px;width:460px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Tajawal',sans-serif;direction:rtl;"><div style="padding:24px;text-align:center"><div style="font-size:20px;font-weight:900">تصدير الطلبات</div></div><div style="padding:0 24px 24px"><input type="text" id="ali_pharmacy_filter" placeholder="كود الصيدلية..." style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;text-align:left;direction:ltr;font-weight:700"><button id="ali_exp_download" style="width:100%;padding:14px;margin-top:10px;background:#f59e0b;color:white;border:none;border-radius:12px;font-weight:800">📥 تحميل الملفات</button></div></div>`; document.body.appendChild(overlay); overlay.querySelector('#ali_exp_download').onclick=()=>{ resolve({ action:'download', orders: packedRows, pharmacyCode: overlay.querySelector('#ali_pharmacy_filter').value.trim() }); overlay.remove(); }; }); }

  // ─── CSS & Panel (نفس كودك v3.1) ───
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes aliSpin{to{transform:rotate(360deg)}} @keyframes aliToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes aliCountUp{from{transform:scale(1.2)}to{transform:scale(1)}} #${PANEL_ID}{position:fixed;top:3%;right:2%;width:400px;background:#fff;border-radius:28px;box-shadow:0 25px 60px rgba(0,0,0,0.15);z-index:999999;font-family:'Tajawal',sans-serif;direction:rtl;animation:aliSlideIn 0.6s}`;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `<div class="ali-inner"><div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px;color:white;border-radius:28px 28px 0 0"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:6px"><span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.2);cursor:pointer">✕</span></div><h3 style="margin:0;font-size:20px;font-weight:900">مُنهي الطلبات</h3></div></div><div style="padding:22px" id="ali_body"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;text-align:center"><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_rec" style="font-size:20px;font-weight:900;color:#10b981">0</div><div style="font-size:9px">Received</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_pack" style="font-size:20px;font-weight:900;color:#f59e0b">0</div><div style="font-size:9px">Packed</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_done" style="font-size:20px;font-weight:900;color:#3b82f6">0</div><div style="font-size:9px">المنجز</div></div><div style="background:#f8fafc;padding:10px;border-radius:14px"><div id="stat_total" style="font-size:20px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px">إجمالي</div></div></div><div id="ali_main_body"><div style="background:#f8fafc;padding:16px;border-radius:16px;margin-bottom:16px;border:1px solid #f1f5f9"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;font-weight:700">📄 صفحات الفحص</span><input type="number" id="p_lim" value="${defaultPages}" style="width:50px;text-align:center;font-weight:800;border:2px solid #e2e8f0;border-radius:8px"></div></div><div id="status-msg" style="padding:10px;background:#f0fdf4;color:#15803d;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;text-align:center">✅ جاهز للبدء</div><button id="ali_start" style="width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3)">⚡ بدء المعالجة الذكية</button></div></div></div>`;
  document.body.appendChild(panel);

  function updateStats() { let r=0,p=0,d=0; state.savedRows.forEach(x=>{if(x.st==='received')r++; if(x.st==='packed')p++; if(x.st==='processed')d++;}); document.getElementById('stat_rec').innerText=r; document.getElementById('stat_pack').innerText=p; document.getElementById('stat_done').innerText=d; document.getElementById('stat_total').innerText=state.savedRows.length; return r; }

  // ─── الموتور الداخلي (إصلاح تجميع الصفحات) ───
  function collect() {
    let found = 0;
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if(cells.length > 1 && cells[0].innerText.trim().startsWith('0')){
        const key = cells[0].innerText.trim();
        if(!state.visitedSet.has(key)){
          state.visitedSet.add(key);
          const txt = row.innerText.toLowerCase();
          const isR = txt.includes('received'), isP = txt.includes('packed');
          let hId = "";
          const lnk = row.querySelector('a');
          if(lnk && lnk.href.includes('head_id=')) hId = lnk.href.split('head_id=')[1].split('&')[0];
          state.savedRows.push({id:key, onl:cells[1].innerText.trim(), node:row.cloneNode(true), st:isR?'received':(isP?'packed':'other'), hid:hId});
          found++;
        }
      }
    });
    return found;
  }

  function scan(curr, total) {
    // تحديث أقصى عدد صفحات لو ظهر جديد
    const pNodes = Array.from(document.querySelectorAll('.pagination a, .pagination li, .pagination span')).map(el => parseInt(el.innerText.trim())).filter(n => !isNaN(n));
    if (pNodes.length) { let m = Math.max(...pNodes); if (m > total) { total = m; document.getElementById('p_lim').value = m; } }

    const newOnPage = collect();
    updateStats();
    document.getElementById('status-msg').innerText = `⏳ جاري معالجة صفحة ${curr} من ${total}...`;

    if(curr < total){
      let nxt = null;
      document.querySelectorAll('.pagination a, .pagination li, .pagination span').forEach(el => {
        if(el.innerText.trim() == String(curr + 1) || el.innerText.includes('»') || el.innerText.includes('>')) nxt = el;
      });
      if(nxt){
        nxt.click();
        // الانتظار 11 ثانية لضمان تحميل بيانات الجدول الجديد
        setTimeout(() => scan(curr + 1, total), 11000);
      } else { finish(); }
    } else { setTimeout(finish, 1000); }
  }

  function finish() {
    state.isProcessing = false;
    document.getElementById('status-msg').innerText = `✅ تم تجميع ${state.savedRows.length} طلب بنجاح`;
    showToast(`تم التجميع بنجاح!`,'success');
    // هنا يرجع زر "بدا المعالجة" كما كان لو احتجت تعيد الفحص
    const btn = document.getElementById('ali_start');
    btn.disabled = false;
    btn.innerHTML = '⚡ بدء المعالجة الذكية';
  }

  document.getElementById('ali_start').onclick = function(){
    this.disabled = true;
    this.innerHTML = '⏳ جاري المعالجة...'; // تغيير النص فوراً كما طلبت
    scan(1, parseInt(document.getElementById('p_lim').value));
  };
  document.getElementById('ali_close').onclick = () => panel.remove();
})();

javascript

// ═══════════════════════════════════════════════════════════════════
// EZ-PILL PRO v4.0 - النسخة المطوّرة بالكامل
// المطور الأصلي: علي الباز
// ═══════════════════════════════════════════════════════════════════
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  التحسينات المُنفذة                                            │
// ├─────────────────────────────────────────────────────────────────┤
// │  1. دايلوجات احترافية لكل مرحلة (تأكيد/خطأ/إنجاز)            │
// │  2. زر المزامنة الذكي: يحدّث نفس الصفحة بدون reload           │
// │     - يمسح الطلبات اللي اتقفلت                                │
// │     - يضيف الطلبات الجديدة                                    │
// │  3. بحث الفاتورة بـ startsWith (تطابق بالترتيب من البداية)     │
// │  4. بحث الطلب بـ includes (بحث حر)                            │
// │  5. نظام Toast Notifications                                   │
// │  6. أنيميشن وتصميم احترافي                                    │
// │  7. إحصائيات محدّثة لحظياً                                    │
// │  8. معالجة أخطاء popup blocker                                 │
// │  9. عداد النوافذ المفتوحة والمنجزة                             │
// │ 10. const/let بدل var                                          │
// └─────────────────────────────────────────────────────────────────┘

javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v4';
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

  // ─── حساب عدد الصفحات من الـ Pagination ───
  const pNodes = Array.from(document.querySelectorAll('.pagination a, .pagination li'))
    .map(el => parseInt(el.innerText.trim()))
    .filter(n => !isNaN(n));
  const defaultPages = pNodes.length > 0 ? Math.max(...pNodes) : 1;

  // ═══════════════════════════════════════════
  //  نظام الإشعارات Toast
  // ═══════════════════════════════════════════
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
    toast.style.cssText = `background:${colors[type]};color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Segoe UI',Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap`;
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ═══════════════════════════════════════════
  //  نظام الدايلوجات الاحترافية
  // ═══════════════════════════════════════════
  function showDialog({ icon, iconColor, title, desc, info, buttons, body }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';

      const iconBg = {
        blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        green:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
        amber:'linear-gradient(135deg,#fef3c7,#fde68a)',
        red:'linear-gradient(135deg,#fee2e2,#fecaca)'
      };

      let infoHTML = '';
      if (info && info.length) {
        infoHTML = info.map(r =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px">
            <span style="color:#64748b;font-weight:600">${r.label}</span>
            <span style="font-weight:800;color:${r.color||'#1e293b'};font-size:12px">${r.value}</span>
          </div>`
        ).join('');
      }

      let buttonsHTML = '';
      if (buttons && buttons.length) {
        buttonsHTML = buttons.map((btn, idx) =>
          `<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Segoe UI',Roboto,sans-serif;${btn.style||'background:#f1f5f9;color:#475569'};transition:all 0.2s">${btn.text}</button>`
        ).join('');
      }

      overlay.innerHTML = `
        <div style="background:white;border-radius:24px;width:420px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:'Segoe UI',Roboto,sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)">
          <div style="padding:24px 24px 0;text-align:center">
            <div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:${iconBg[iconColor]||iconBg.blue}">${icon}</div>
            <div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:6px">${title}</div>
            <div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">${desc}</div>
          </div>
          <div style="padding:20px 24px">
            ${infoHTML}
            ${body||''}
          </div>
          <div style="padding:16px 24px 24px;display:flex;gap:10px">
            ${buttonsHTML}
          </div>
        </div>
      `;

      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (btn) {
          const idx = parseInt(btn.getAttribute('data-idx'));
          overlay.remove();
          resolve(buttons[idx].value);
        }
      });

      document.body.appendChild(overlay);
    });
  }

  // ═══════════════════════════════════════════
  //  CSS Styles
  // ═══════════════════════════════════════════
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}
    @keyframes aliGlow{0%,100%{box-shadow:0 0 8px rgba(59,130,246,0.3)}50%{box-shadow:0 0 20px rgba(59,130,246,0.6)}}

    #${PANEL_ID}{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#ffffff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:9999999;font-family:'Segoe UI',Roboto,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}

    #${PANEL_ID}.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
  `;
  document.head.appendChild(styleEl);

  // ═══════════════════════════════════════════
  //  بناء اللوحة الرئيسية
  // ═══════════════════════════════════════════
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ali-inner">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
          <div style="display:flex;gap:6px">
            <span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer;transition:0.2s">−</span>
            <span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer;transition:0.2s">✕</span>
          </div>
          <h3 style="font-size:20px;font-weight:900;letter-spacing:-0.3px;margin:0">EZ-PILL PRO</h3>
        </div>
        <div style="text-align:right;margin-top:4px;position:relative;z-index:1">
          <span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v4.0</span>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body">

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#a78bfa)"></div>
            <div style="font-size:18px;margin-bottom:4px">📊</div>
            <div id="stat_total" style="font-size:22px;font-weight:900;color:#8b5cf6;line-height:1;margin-bottom:2px">0</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:700">إجمالي</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#10b981,#34d399)"></div>
            <div style="font-size:18px;margin-bottom:4px">🔍</div>
            <div id="stat_match" style="font-size:22px;font-weight:900;color:#10b981;line-height:1;margin-bottom:2px">0</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:700">مطابق</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;left:0;height:3px;background:linear-gradient(90deg,#3b82f6,#60a5fa)"></div>
            <div style="font-size:18px;margin-bottom:4px">🚀</div>
            <div id="stat_opened" style="font-size:22px;font-weight:900;color:#3b82f6;line-height:1;margin-bottom:2px">0</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:700">تم فتحه</div>
          </div>
        </div>

        <div id="ali_main_body">
          <!-- Progress Section -->
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <span style="font-size:13px;font-weight:700;color:#475569">📄 عدد الصفحات</span>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:12px;color:#94a3b8;font-weight:600">صفحة</span>
                <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:48px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none;font-family:'Segoe UI',Roboto,sans-serif;transition:0.2s">
              </div>
            </div>
            <div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden">
              <div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)"></div>
            </div>
          </div>

          <!-- Status -->
          <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
            <span>✅</span><span>جاهز لبدء تجميع البيانات</span>
          </div>

          <!-- Start Button -->
          <button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">
            🚀 بدء تجميع البيانات
          </button>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:14px 0 4px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ═══════════════════════════════════════════
  //  دوال مساعدة
  // ═══════════════════════════════════════════
  function setStatus(text, type) {
    const el = document.getElementById('status-msg');
    if (!el) return;
    const c = {
      ready:   { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'✅' },
      working: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', icon:'spinner' },
      error:   { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', icon:'❌' },
      done:    { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'🎉' },
      sync:    { bg:'#fefce8', color:'#a16207', border:'#fef08a', icon:'spinner' }
    }[type] || { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'✅' };
    const iconHTML = c.icon === 'spinner'
      ? '<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>'
      : `<span>${c.icon}</span>`;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border};transition:all 0.3s`;
    el.innerHTML = `${iconHTML}<span>${text}</span>`;
  }

  function animNum(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.innerText !== String(val)) {
      el.innerText = val;
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'aliCountUp 0.4s';
    }
  }

  function updateStats(matchCount) {
    animNum('stat_total', state.savedRows.length);
    animNum('stat_match', matchCount !== undefined ? matchCount : state.savedRows.length);
    animNum('stat_opened', state.openedCount);
  }

  // ═══════════════════════════════════════════
  //  أحداث Header
  // ═══════════════════════════════════════════
  panel.addEventListener('click', e => {
    if (panel.classList.contains('ali-minimized')) {
      panel.classList.remove('ali-minimized');
      e.stopPropagation();
    }
  });
  document.getElementById('ali_close').addEventListener('click', e => {
    e.stopPropagation();
    panel.style.animation = 'aliSlideIn 0.3s reverse';
    setTimeout(() => panel.remove(), 280);
  });
  document.getElementById('ali_min').addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.add('ali-minimized');
  });

  // ═══════════════════════════════════════════
  //  فحص الصفحات وتجميع البيانات
  // ═══════════════════════════════════════════
  function collectFromCurrentPage() {
    let newCount = 0;
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        const key = cells[0].innerText.trim();
        if (key.length > 3 && !state.visitedSet.has(key)) {
          state.visitedSet.add(key);

          // استخراج الـ args من label onclick
          let args = null;
          const label = row.querySelector('label[onclick^="getDetails"]');
          if (label) {
            const m = label.getAttribute('onclick').match(/'(.*?)','(.*?)','(.*?)','(.*?)'/);
            if (m) args = [m[1], m[2], m[3], m[4]];
          }

          const clone = row.cloneNode(true);
          state.savedRows.push({
            id: key,
            onl: cells[1].innerText.trim(),
            node: clone,
            args: args
          });
          newCount++;
        }
      }
    });
    return newCount;
  }

  function scanPage(curr, total, isSync) {
    const fill = document.getElementById('p-fill');
    if (fill) fill.style.width = ((curr / total) * 100) + '%';

    if (isSync) {
      setStatus(`مزامنة الصفحة ${curr} من ${total}...`, 'sync');
    } else {
      setStatus(`تحليل الصفحة ${curr} من ${total} ... تم رصد ${state.savedRows.length} طلب`, 'working');
    }

    collectFromCurrentPage();
    updateStats();

    if (curr < total) {
      const nxt = Array.from(document.querySelectorAll('.pagination a, .pagination li'))
        .find(el => el.innerText.trim() == String(curr + 1));
      if (nxt) {
        nxt.click();
        setTimeout(() => scanPage(curr + 1, total, isSync), 11000);
      } else {
        finishScan(isSync);
      }
    } else {
      finishScan(isSync);
    }
  }

  // ═══════════════════════════════════════════
  //  المزامنة الذكية
  // ═══════════════════════════════════════════
  async function smartSync() {
    const oldCount = state.savedRows.length;

    // إعادة فحص: نجمع الـ IDs الموجودة حالياً في الجدول
    const currentPageIds = new Set();
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        const key = cells[0].innerText.trim();
        if (key.length > 3) currentPageIds.add(key);
      }
    });

    // حذف الطلبات اللي اختفت (اتقفلت)
    const beforeRemove = state.savedRows.length;
    state.savedRows = state.savedRows.filter(row => {
      // لو الطلب مش موجود في الصفحة الحالية، يتحذف
      // لكن لو عندنا أكتر من صفحة، نحتاج نعيد الفحص الكامل
      return true; // هنحذف بعد إعادة الفحص الكامل
    });

    // مسح الـ Set ونعيد التجميع من الصفر
    state.visitedSet.clear();
    state.savedRows = [];

    // إعادة الفحص
    const pages = parseInt(document.getElementById('p_lim').value) || 1;
    scanPage(1, pages, true);
  }

  // ═══════════════════════════════════════════
  //  انتهاء الفحص — بناء واجهة البحث
  // ═══════════════════════════════════════════
  function finishScan(isSync) {
    // ترتيب الجدول الأصلي
    const tables = document.querySelectorAll('table');
    let target = tables[0];
    for (const t of tables) {
      if (t.innerText.length > target.innerText.length) target = t;
    }
    state.tbody = target.querySelector('tbody') || target;
    state.tbody.innerHTML = '';
    state.savedRows.forEach(row => state.tbody.appendChild(row.node));

    updateStats(state.savedRows.length);

    if (isSync) {
      setStatus(`تمت المزامنة — ${state.savedRows.length} طلب`, 'done');
      showToast(`تمت المزامنة: ${state.savedRows.length} طلب`, 'success');
    } else {
      setStatus(`تم التجميع — ${state.savedRows.length} طلب جاهز`, 'done');
      showToast(`تم تجميع ${state.savedRows.length} طلب بنجاح`, 'success');
    }

    // بناء واجهة البحث والعمليات
    const mainBody = document.getElementById('ali_main_body');
    mainBody.innerHTML = `
      <!-- بحث بالفاتورة -->
      <div style="margin-bottom:10px">
        <div style="position:relative">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:900;color:#cbd5e1;z-index:1;pointer-events:none;font-family:monospace">0</span>
          <input type="text" id="ali_sI" placeholder="بحث برقم الفاتورة (بالترتيب من البداية)..." style="width:100%;padding:14px 16px 14px 16px;padding-right:32px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:'Segoe UI',monospace;outline:none;background:#f8fafc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:0.5px;font-weight:700;box-sizing:border-box">
        </div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;text-align:center;font-weight:600">
          🧾 البحث بالتطابق من البداية — أول 4 أرقام بعد الـ 0 = كود الصيدلية
        </div>
      </div>

      <!-- بحث بالطلب -->
      <div style="margin-bottom:12px">
        <div style="position:relative">
          <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;z-index:1;pointer-events:none">🔗</span>
          <input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 16px 14px 42px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:'Segoe UI',Roboto,sans-serif;outline:none;background:#f8fafc;color:#1e293b;direction:rtl;transition:all 0.25s;font-weight:600;box-sizing:border-box">
        </div>
      </div>

      <!-- عداد النتائج -->
      <div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:2px 0 12px">
        عرض ${state.savedRows.length} من ${state.savedRows.length} نتيجة
      </div>

      <!-- زر الفتح -->
      <button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.3s;margin-bottom:8px">
        ⚡ فتح المطابق (<span id="ali_open_num">0</span>)
      </button>

      <!-- زر المزامنة -->
      <button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:13px;font-family:'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">
        🔄 مزامنة ذكية (تحديث + حذف المُغلق + إضافة الجديد)
      </button>
    `;

    // ─── أحداث البحث ───
    const sI = document.getElementById('ali_sI');
    const sO = document.getElementById('ali_sO');
    const searchCount = document.getElementById('ali_search_count');
    const openNum = document.getElementById('ali_open_num');

    function filterResults() {
      // الفاتورة: نضمن إن القيمة تبدأ بـ 0 دايماً
      let v1 = sI.value.trim();
      // لو المستخدم مسح الـ 0 نرجعه
      if (v1 !== '' && !v1.startsWith('0')) {
        v1 = '0' + v1.replace(/^0+/, '');
        sI.value = v1;
      }

      const v2 = sO.value.trim().toLowerCase();
      state.tbody.innerHTML = '';
      let shown = 0;
      let matchList = [];

      state.savedRows.forEach(row => {
        // الفاتورة: startsWith — تطابق بالترتيب من البداية فقط
        const matchInvoice = (v1 !== '' && v1 !== '0') && row.id.startsWith(v1);
        // الطلب: includes — بحث حر
        const matchOrder = v2 !== '' && row.onl.toLowerCase().includes(v2);
        // لو مفيش بحث نعرض الكل
        const noFilter = (v1 === '' || v1 === '0') && v2 === '';

        if (matchInvoice || matchOrder || noFilter) {
          state.tbody.appendChild(row.node);
          shown++;
          if (matchInvoice || matchOrder) matchList.push(row);
        }
      });

      searchCount.innerText = `عرض ${shown} من ${state.savedRows.length} نتيجة`;
      const matchCount = (v1 === '' || v1 === '0') && v2 === '' ? 0 : matchList.length;
      openNum.innerText = matchCount;
      updateStats(shown);

      // تلوين خانة الفاتورة
      if (v1.length > 1 && shown === 0) {
        sI.style.borderColor = '#ef4444';
        sI.style.background = '#fef2f2';
      } else if (v1.length > 1 && shown > 0) {
        sI.style.borderColor = '#10b981';
        sI.style.background = '#f0fdf4';
      } else {
        sI.style.borderColor = '#e2e8f0';
        sI.style.background = '#f8fafc';
      }
    }

    sI.addEventListener('input', filterResults);
    sO.addEventListener('input', filterResults);

    // ─── زر الفتح مع دايلوج تأكيد ───
    document.getElementById('ali_btn_open').addEventListener('click', async () => {
      const v1 = sI.value.trim();
      const v2 = sO.value.trim().toLowerCase();

      // تجميع المطابق
      const list = state.savedRows.filter(row => {
        const matchInvoice = (v1 !== '' && v1 !== '0') && row.id.startsWith(v1);
        const matchOrder = v2 !== '' && row.onl.toLowerCase().includes(v2);
        return matchInvoice || matchOrder;
      });

      if (!list.length) {
        showToast('لا توجد طلبات مطابقة للفتح — ابحث أولاً!', 'warning');
        return;
      }

      // دايلوج تأكيد
      const result = await showDialog({
        icon: '📂',
        iconColor: 'blue',
        title: 'فتح الطلبات المطابقة',
        desc: `سيتم فتح ${list.length} طلب في نوافذ منفصلة`,
        info: [
          { label: 'عدد الطلبات', value: list.length + ' طلب', color: '#10b981' },
          { label: 'الوقت المتوقع', value: '~' + Math.ceil(list.length * 1.2) + ' ثانية', color: '#f59e0b' },
          { label: 'فلتر الفاتورة', value: v1.length > 1 ? v1 : 'غير محدد', color: '#3b82f6' },
          { label: 'فلتر الطلب', value: v2 || 'غير محدد', color: '#8b5cf6' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel' },
          { text: '✅ تأكيد الفتح', value: 'confirm', style: 'background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 12px rgba(16,185,129,0.3)' }
        ]
      });

      if (result !== 'confirm') return;

      // بدء الفتح
      const openBtn = document.getElementById('ali_btn_open');
      openBtn.disabled = true;
      openBtn.style.opacity = '0.6';
      openBtn.style.cursor = 'not-allowed';

      let opened = 0;
      let failed = 0;
      const base = window.location.origin + "/ez_pill_web/getEZPill_Details";

      for (let i = 0; i < list.length; i++) {
        const item = list[i];

        if (item.args) {
          const url = base + "?onlineNumber=" + item.args[0].replace("ERX", "") +
            "&Invoice=" + item.args[1] + "&typee=" + item.args[2] + "&head_id=" + item.args[3];

          try {
            const w = window.open(url, "_blank");
            if (w) {
              opened++;
              state.openedCount++;
            } else {
              failed++;
            }
          } catch (e) {
            failed++;
          }
        }

        openBtn.innerHTML = `🚀 جاري الفتح (${i + 1}/${list.length})`;
        setStatus(`فتح ${i + 1} من ${list.length}: ${item.onl || item.id}`, 'working');
        updateStats();

        if (i < list.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }

      // معالجة النتيجة
      if (failed > 0) {
        await showDialog({
          icon: '⚠️',
          iconColor: 'red',
          title: 'تنبيه',
          desc: `تعذر فتح ${failed} نافذة — تأكد من السماح بالنوافذ المنبثقة`,
          info: [
            { label: 'تم فتحها', value: opened.toString(), color: '#10b981' },
            { label: 'فشلت', value: failed.toString(), color: '#ef4444' }
          ],
          buttons: [
            { text: '👍 حسناً', value: 'ok', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white' }
          ]
        });
      } else {
        // دايلوج نجاح
        await showDialog({
          icon: '🎉',
          iconColor: 'green',
          title: 'تم بنجاح!',
          desc: 'تم فتح جميع الطلبات المطابقة',
          info: [
            { label: 'تم فتحها', value: opened + ' طلب', color: '#10b981' },
            { label: 'إجمالي المفتوح', value: state.openedCount + ' طلب', color: '#3b82f6' }
          ],
          buttons: [
            { text: '👍 إغلاق', value: 'ok', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white' }
          ]
        });
      }

      showToast(`تم فتح ${opened} طلب بنجاح`, opened > 0 ? 'success' : 'error');
      setStatus(`تم فتح ${opened} طلب — الإجمالي: ${state.openedCount}`, 'done');

      openBtn.disabled = false;
      openBtn.style.opacity = '1';
      openBtn.style.cursor = 'pointer';
      openBtn.innerHTML = `⚡ فتح المطابق (<span id="ali_open_num">${parseInt(document.getElementById('ali_open_num')?.innerText || 0)}</span>)`;
      filterResults(); // تحديث العداد
    });

    // ─── زر المزامنة الذكية ───
    document.getElementById('ali_btn_sync').addEventListener('click', async () => {
      const syncBtn = document.getElementById('ali_btn_sync');
      const oldCount = state.savedRows.length;

      // دايلوج تأكيد المزامنة
      const result = await showDialog({
        icon: '🔄',
        iconColor: 'blue',
        title: 'المزامنة الذكية',
        desc: 'سيتم إعادة فحص الصفحات لتحديث القائمة',
        info: [
          { label: 'الطلبات الحالية', value: oldCount.toString(), color: '#8b5cf6' },
          { label: 'العملية', value: 'حذف المُغلق + إضافة الجديد', color: '#3b82f6' },
          { label: 'الصفحات', value: document.getElementById('p_lim').value + ' صفحة', color: '#f59e0b' }
        ],
        buttons: [
          { text: 'إلغاء', value: 'cancel' },
          { text: '🔄 بدء المزامنة', value: 'confirm', style: 'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 12px rgba(59,130,246,0.3)' }
        ]
      });

      if (result !== 'confirm') return;

      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري المزامنة...';
      syncBtn.style.borderColor = '#3b82f6';
      syncBtn.style.color = '#1d4ed8';

      showToast('جاري المزامنة...', 'info');

      // مسح البيانات وإعادة التجميع
      state.visitedSet.clear();
      state.savedRows = [];

      const pages = parseInt(document.getElementById('p_lim').value) || 1;
      scanPage(1, pages, true);
    });
  }

  // ═══════════════════════════════════════════
  //  بدء التشغيل
  // ═══════════════════════════════════════════
  document.getElementById('ali_start').addEventListener('click', function() {
    this.disabled = true;
    this.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.8s linear infinite"></div> جاري التجميع...';
    this.style.opacity = '0.7';
    this.style.cursor = 'not-allowed';
    scanPage(1, parseInt(document.getElementById('p_lim').value) || 1, false);
  });

})();



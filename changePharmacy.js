javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_store_changer';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  function decodeData(b64) {
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }

  const _U = 'W3siZCI6Iti52YTZiiDYp9mE2KjYp9iyICjYp9mE2KPYs9in2LPZiikiLCJlIjoiMTAxMDkzIiwibiI6IkFsaSBFbGJheiIsInUiOiJhbGJhei5hYSJ9LHsiZCI6ItmF2YbYtdmI2LEg2KfZhNio2YPYsdmJIiwiZSI6IjEwMjU5OSIsIm4iOiJFTEJBS1JJLk1NIiwidSI6IkVMQkFLUkkuTU0ifSx7ImQiOiLZhdit2YXYryDYp9mE2LTYp9i32LEiLCJlIjoiMTA2MDIzIiwibiI6IkVMU0hBVEVSLk1BIiwidSI6IkVMU0hBVEVSLk1BIn0seyJkIjoi2YXYrdmF2K8g2KrZiNmB2YrZgiIsImUiOiIxMDY1MDkiLCJuIjoiYWxmYWhhZC5tdCIsInUiOiJhbGZhaGFkLm10In0seyJkIjoi2YXYrdmF2K8g2LLZitiv2KfZhiIsImUiOiIxMDUxNDMiLCJuIjoiTW9oYW1lZCBaZWRhbiIsInUiOiJaZWRhbi5NSSJ9LHsiZCI6Itin2LPYp9mF2Ycg2KfZhNiz2YLYpyIsImUiOiIxMDU4OTMiLCJuIjoiT3NhbWEgRWxzYWtrYSIsInUiOiJFbHNha2thLm9tIn0seyJkIjoi2YXYrNiv2Ykg2LPZhdmK2LEiLCJlIjoiMTA0OTg5IiwibiI6Ik1hZ2R5IFNhbWlyIiwidSI6ImVsc2F5ZWQubXMxIn0seyJkIjoi2KfYrdmF2K8g2YjYrdmK2K8iLCJlIjoiMTA1NjA3IiwibiI6IkFobWVkIFdhaGVlZCIsInUiOiJlbHplYWlreS5hdyJ9LHsiZCI6ItmF2K3ZhdmI2K8g2YfZhdin2YUiLCJlIjoiMTA1NTkxIiwibiI6Im1haG1vdWQgaGFtYW0iLCJ1IjoiZWxzYXllZC5tbTQifSx7ImQiOiLZhdit2YXYryDYp9mE2KfZhti12KfYsdmJIiwiZSI6IjEwNTIyNSIsIm4iOiJNb2hhbWVkIEFsYW5zYXJpIiwidSI6ImFsYW5zYXJpLm1oIn0seyJkIjoi2YXYrdmF2K8g2KzZhNin2YQiLCJlIjoiMTA1MTAzIiwibiI6Ik1vaGFtZWQgZ2FsYWwiLCJ1IjoiTU9IQU1FRC5NRzQifSx7ImQiOiLYp9iz2KfZhdmHINin2K3ZhdivIiwiZSI6IjEwMTgzOSIsIm4iOiJPc2FtYSBBaG1lZCIsInUiOiJNQUhNT1VELk9BIn0seyJkIjoi2YXYrdmF2YjYryDYp9mE2KzZhtiv2YkiLCJlIjoiMTAxMTI5IiwibiI6IkFMR0VORElFLk1NIiwidSI6IkFMR0VORElFLk1NIn0seyJkIjoi2LnYqNiv2KfZhNmE2Ycg2LHYp9i02K8iLCJlIjoiMTAyMzcwIiwibiI6IkFiZGFsbGFoIFJhc2hlZCIsInUiOiJyYXNoZWQuYW0xIn1d';
  const _P = 'W3siYyI6IjEzMDAiLCJuIjoi2KfZhNis2YjYr9mJIn0seyJjIjoiNDA4MyIsIm4iOiLZg9ix2YrZhSJ9LHsiYyI6IjExMTkiLCJuIjoi2KfYqNmGINin2YTZiNmE2YrYryJ9LHsiYyI6IjYwNzkiLCJuIjoi2KfZhNmG2YfYrCJ9LHsiYyI6IjI1MjUiLCJuIjoi2KfZhNmG2YIYp9ihIn0seyJjIjoiNDA2MSIsIm4iOiLZhdis2LLZitmHIn0seyJjIjoiNzYwNyIsIm4iOiLYp9mE2KzYp9mF2K0ifSx7ImMiOiI3MTExIiwibiI6Itin2YTYp9ix2KrYp9mEIn0seyJjIjoiNTA3MCIsIm4iOiLYp9mE2LnYp9isIn0seyJjIjoiMjA5NSIsIm4iOiLYp9mE2LPZitix2YcifSx7ImMiOiIzMDgwIiwibiI6Itin2YTYqNin2LIifV0=';

  const USERS      = decodeData(_U).map(u => ({ display:u.d, emp_id:u.e, emp_name:u.n, user_name:u.u }));
  const PHARMACIES = decodeData(_P).map(p => ({ code:p.c, name:p.n }));

  // ═══════════════════════════════════════════
  // CSS — Light Theme
  // ═══════════════════════════════════════════
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap');
    @keyframes scOverlay{from{opacity:0}to{opacity:1}}
    @keyframes scCard{from{opacity:0;transform:translate(-50%,-48%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes scSpin{to{transform:rotate(360deg)}}
    #${PANEL_ID} *{box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}

    /* === OVERLAY === */
    #sc-overlay{position:fixed;inset:0;background:rgba(100,116,139,0.45);backdrop-filter:blur(10px);z-index:9999999;animation:scOverlay 0.3s ease forwards}

    /* === CARD === */
    #sc-card{position:absolute;top:50%;left:50%;width:420px;max-width:94vw;
      background:#ffffff;
      border:1px solid #e2e8f0;
      border-radius:24px;overflow:hidden;
      box-shadow:0 4px 6px rgba(0,0,0,0.05),0 20px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.03);
      animation:scCard 0.4s cubic-bezier(0.16,1,0.3,1) forwards}

    /* === HEADER === */
    #sc-header{padding:26px 28px 22px;border-bottom:1px solid #f1f5f9;position:relative;background:linear-gradient(160deg,#f8fafc 0%,#eef2ff 100%)}
    #sc-header::after{content:'';position:absolute;top:-1px;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,#6366f1,transparent)}
    #sc-title{font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;margin:0;position:relative;z-index:1}
    #sc-subtitle{font-size:11px;color:#94a3b8;font-weight:600;margin-top:3px;position:relative;z-index:1;letter-spacing:0.5px;text-transform:uppercase}
    #sc-close{position:absolute;top:24px;left:24px;width:32px;height:32px;border-radius:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;font-weight:900;transition:all 0.2s;z-index:2}
    #sc-close:hover{background:rgba(239,68,68,0.15)}

    /* === BODY === */
    #sc-body{padding:24px 28px 28px;direction:rtl;background:#ffffff}
    .sc-field{margin-bottom:18px}
    .sc-label{display:block;margin-bottom:8px;font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.8px;text-transform:uppercase}

    /* === INPUTS === */
    .sc-select,.sc-input{width:100%;padding:13px 16px;
      background:#f8fafc;
      border:1.5px solid #e2e8f0;
      border-radius:12px;font-size:14px;font-weight:700;color:#1e293b;outline:none;transition:all 0.25s;-webkit-appearance:none}
    .sc-select:focus,.sc-input:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,0.1)}
    .sc-select option{background:#fff;color:#1e293b}

    /* === USER PREVIEW === */
    #sc-user-preview{margin-top:10px;padding:12px 14px;background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;display:flex;align-items:center;gap:10px;transition:all 0.3s}
    #sc-user-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:white;flex-shrink:0}
    #sc-user-name{font-size:13px;font-weight:800;color:#0369a1}
    #sc-user-meta{font-size:11px;color:#64748b;font-weight:600;margin-top:2px}

    /* === STORE INPUT === */
    .sc-input-wrap{position:relative}
    .sc-input-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none}
    .sc-input-wrap .sc-input{padding-right:42px;text-align:center;font-size:17px;letter-spacing:2px;color:#059669}

    /* === FORMAT BUTTONS === */
    #sc-format-wrap{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
    .sc-fmt-btn{padding:12px;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;color:#94a3b8;font-size:13px;font-weight:800;cursor:pointer;text-align:center;transition:all 0.2s}
    .sc-fmt-btn.active{background:#eef2ff;border-color:#a5b4fc;color:#4f46e5}
    .sc-fmt-btn:hover:not(.active){background:#f1f5f9;border-color:#cbd5e1}

    /* === DIVIDER === */
    .sc-divider{height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:20px 0}

    /* === SUBMIT === */
    #sc-submit{width:100%;padding:15px 20px;border:none;border-radius:14px;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,#059669,#10b981,#059669);background-size:200% auto;box-shadow:0 8px 24px rgba(16,185,129,0.3);transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px}
    #sc-submit:hover:not(:disabled){background-position:right center;transform:translateY(-1px);box-shadow:0 12px 28px rgba(16,185,129,0.35)}
    #sc-submit:disabled{opacity:0.7;cursor:not-allowed;transform:none}

    /* === TOAST === */
    #sc-toast-wrap{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center}
    .sc-toast{padding:12px 22px;border-radius:12px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;direction:rtl;color:white;animation:scCard 0.3s cubic-bezier(0.16,1,0.3,1);white-space:nowrap;transition:opacity 0.3s;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
  `;
  document.head.appendChild(style);

  const usersHTML = USERS.map((u,i) => `<option value="${i}">${u.display}</option>`).join('');
  const pharmHTML = PHARMACIES.map(p => `<option value="${p.code} - ${p.name}">`).join('');

  const overlay = document.createElement('div');
  overlay.id = PANEL_ID;
  overlay.innerHTML = `
    <div id="sc-overlay">
      <div id="sc-card">
        <div id="sc-header">
          <div id="sc-close">✕</div>
          <div style="display:flex;align-items:center;gap:12px;direction:rtl;">
            <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#6366f1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid rgba(99,102,241,0.2);">🎛️</div>
            <div>
              <div id="sc-title">مُدير النظام المتقدم</div>
              <div id="sc-subtitle">Advanced Store Manager — v2.2</div>
            </div>
          </div>
        </div>
        <div id="sc-body">
          <div class="sc-field">
            <label class="sc-label">👤 اختيار الحساب</label>
            <select id="ali_user_select" class="sc-select">${usersHTML}</select>
            <div id="sc-user-preview">
              <div id="sc-user-avatar">ع</div>
              <div>
                <div id="sc-user-name">—</div>
                <div id="sc-user-meta">—</div>
              </div>
            </div>
          </div>
          <div class="sc-field">
            <label class="sc-label">🏥 كود الصيدلية</label>
            <div class="sc-input-wrap">
              <span class="sc-input-icon">🔍</span>
              <input list="ali_pharmacies_list" type="text" id="ali_new_store" placeholder="1300 أو الجودي..." class="sc-input">
              <datalist id="ali_pharmacies_list">${pharmHTML}</datalist>
            </div>
          </div>
          <div class="sc-field">
            <label class="sc-label">⚙️ بيئة العمل</label>
            <div id="sc-format-wrap">
              <div class="sc-fmt-btn active" data-val="OCS">OCS</div>
              <div class="sc-fmt-btn" data-val="JSON">JSON</div>
            </div>
            <input type="hidden" id="ali_new_format" value="OCS">
          </div>
          <div class="sc-divider"></div>
          <button id="sc-submit"><span>🚀</span><span>تنفيذ التحديث</span></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Toast
  function toast(msg, type) {
    type = type || 'info';
    let wrap = document.getElementById('sc-toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'sc-toast-wrap'; document.body.appendChild(wrap); }
    const colors = { success:'rgba(5,150,105,0.95)', error:'rgba(220,38,38,0.95)', warning:'rgba(217,119,6,0.95)', info:'rgba(30,41,59,0.92)' };
    const icons  = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = 'sc-toast';
    t.style.background = colors[type];
    t.innerHTML = '<span>' + icons[type] + '</span><span>' + msg + '</span>';
    wrap.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 3500);
  }

  // Preview
  function updatePreview(idx) {
    const u = USERS[idx];
    if (!u) return;
    document.getElementById('sc-user-avatar').textContent = u.display.trim().charAt(0);
    document.getElementById('sc-user-name').textContent   = u.display;
    document.getElementById('sc-user-meta').textContent   = 'ID: ' + u.emp_id + '  |  @' + u.user_name;
  }
  updatePreview(0);
  document.getElementById('ali_user_select').addEventListener('change', function() { updatePreview(parseInt(this.value)); });

  // Format Toggle
  document.querySelectorAll('.sc-fmt-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sc-fmt-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      document.getElementById('ali_new_format').value = this.dataset.val;
    });
  });

  // Close
  function closePanel() {
    const ov = document.getElementById('sc-overlay');
    if (ov) { ov.style.opacity = '0'; ov.style.transition = 'opacity 0.25s'; }
    setTimeout(function() { overlay.remove(); }, 260);
  }
  document.getElementById('sc-close').addEventListener('click', closePanel);
  document.getElementById('sc-overlay').addEventListener('mousedown', function(e) {
    if (e.target.id === 'sc-overlay') closePanel();
  });

  // ═══════════════════════════════════════════
  // حل مشكلة الكاش — الدالة الرئيسية
  // ═══════════════════════════════════════════
  async function forceClearSessionAndRedirect() {
    // 1️⃣ مسح كل الـ Storage محلياً
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}

    // 2️⃣ مسح الـ Cookies الخاصة بالموقع
    document.cookie.split(';').forEach(function(c) {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // 3️⃣ قائمة محتملة لـ URLs الـ Logout — جرب كلها بالترتيب
    const logoutUrls = [
      window.location.origin + '/ez_pill_web/j_spring_security_logout',
      window.location.origin + '/ez_pill_web/logout',
      window.location.origin + '/ez_pill_web/signout',
      window.location.origin + '/ez_pill_web/auth/logout',
    ];

    // 4️⃣ اضرب fetch لكل URL بالترتيب (بدون redirect) عشان تمسح الـ Session من السيرفر
    for (const url of logoutUrls) {
      try {
        await fetch(url, { method:'GET', credentials:'include', redirect:'manual', cache:'no-store' });
      } catch(e) {}
    }

    // 5️⃣ دور على زرار Logout في الصفحة
    const allLinks = Array.from(document.querySelectorAll('a, button, input[type=button], input[type=submit]'));
    const logoutBtn = allLinks.find(function(el) {
      const txt    = (el.innerText || el.value || '').trim().toLowerCase();
      const href   = (el.href || '').toLowerCase();
      const action = (el.getAttribute('onclick') || '').toLowerCase();
      return txt.includes('log out') || txt.includes('logout') || txt.includes('خروج') ||
             href.includes('logout') || href.includes('logoff') || href.includes('signout') || href.includes('j_spring') ||
             action.includes('logout') || action.includes('logoff');
    });

    if (logoutBtn) {
      console.log('[StoreManager] ✅ Logout button found:', logoutBtn.innerText.trim());
      logoutBtn.click();
      // انتظر ثانية ثم force reload بدون كاش
      await new Promise(r => setTimeout(r, 1000));
    }

    // 6️⃣ Force redirect مع cache-bust للـ Login
    const loginUrl = window.location.origin + '/ez_pill_web/?t=' + Date.now();
    window.location.replace(loginUrl);
  }

  // Submit
  document.getElementById('sc-submit').addEventListener('click', async function() {
    const btn          = this;
    const userIndex    = parseInt(document.getElementById('ali_user_select').value);
    const selectedUser = USERS[userIndex];
    const rawStore     = document.getElementById('ali_new_store').value.trim();
    const format       = document.getElementById('ali_new_format').value;

    if (!rawStore) {
      const inp = document.getElementById('ali_new_store');
      inp.style.borderColor = 'rgba(239,68,68,0.6)';
      inp.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
      setTimeout(function() { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 2000);
      toast('أدخل كود أو اسم الصيدلية', 'warning');
      return;
    }

    const storeMatch = rawStore.match(/\d+/);
    const storeCode  = storeMatch ? storeMatch[0] : rawStore;

    const confirmed = await showConfirmDialog(selectedUser, storeCode, format);
    if (!confirmed) return;

    btn.disabled = true;
    btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:scSpin 0.8s linear infinite;flex-shrink:0"></div><span>جاري التحديث...</span>';

    try {
      const params = new URLSearchParams();
      params.append('emp_id',         selectedUser.emp_id);
      params.append('emp_name',       selectedUser.emp_name);
      params.append('user_name',      selectedUser.user_name);
      params.append('storecode',      storeCode);
      params.append('machine_format', format);

      const res = await fetch(window.location.origin + '/ez_pill_web/manageUsers/addNew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params,
        cache: 'no-store'
      });

      if (res.ok) {
        btn.innerHTML = '✅ تم — جاري مسح الكاش وإعادة التشغيل...';
        btn.style.background = 'linear-gradient(135deg,#2563eb,#3b82f6)';
        toast('تم التحديث ✔ — جاري مسح الجلسة القديمة...', 'success');

        // انتظر ثانيتين عشان يشوف التوست، ثم امسح الكاش بالكامل
        setTimeout(function() {
          forceClearSessionAndRedirect();
        }, 2000);

      } else {
        throw new Error('server');
      }
    } catch(e) {
      btn.innerHTML = '❌ فشل التحديث — أعد المحاولة';
      btn.style.background = 'linear-gradient(135deg,#dc2626,#ef4444)';
      toast('حدث خطأ في الاتصال بالخادم', 'error');
      setTimeout(function() {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀</span><span>تنفيذ التحديث</span>';
        btn.style.background = '';
      }, 2500);
    }
  });

  document.getElementById('ali_new_store').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') document.getElementById('sc-submit').click();
  });

  // ═══════════════════════════════════════════
  // Confirm Dialog — Light Theme
  // ═══════════════════════════════════════════
  function showConfirmDialog(user, storeCode, format) {
    return new Promise(function(resolve) {
      const pharmacy  = PHARMACIES.find(function(p) { return p.code === storeCode; });
      const pharmName = pharmacy ? pharmacy.name : '—';

      const dlg = document.createElement('div');
      dlg.style.cssText = "position:fixed;inset:0;z-index:99999999;display:flex;align-items:center;justify-content:center;background:rgba(100,116,139,0.5);backdrop-filter:blur(12px);animation:scOverlay 0.2s ease;font-family:'IBM Plex Sans Arabic',sans-serif;";

      dlg.innerHTML = `
        <div style="width:360px;max-width:92vw;
          background:#ffffff;
          border:1px solid #e2e8f0;
          border-radius:20px;overflow:hidden;
          box-shadow:0 4px 6px rgba(0,0,0,0.05),0 20px 60px rgba(0,0,0,0.15);
          animation:scCard 0.35s cubic-bezier(0.16,1,0.3,1);direction:rtl;">

          <!-- Header -->
          <div style="padding:22px 24px 18px;border-bottom:1px solid #f1f5f9;text-align:center;background:linear-gradient(160deg,#fffbeb,#fef3c7);">
            <div style="width:52px;height:52px;margin:0 auto 12px;border-radius:14px;background:rgba(245,158,11,0.12);border:1.5px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;font-size:22px;">⚠️</div>
            <div style="font-size:17px;font-weight:800;color:#1e293b;margin-bottom:4px;">تأكيد تنفيذ الأمر</div>
            <div style="font-size:12px;color:#94a3b8;font-weight:600;">تحقق من البيانات قبل المتابعة</div>
          </div>

          <!-- Body -->
          <div style="padding:16px 22px 20px;background:#ffffff;">
            <div style="border-radius:12px;overflow:hidden;border:1.5px solid #e2e8f0;margin-bottom:16px;">

              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">👤 الحساب</span>
                <span style="font-size:13px;color:#2563eb;font-weight:800;">${user.display}</span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🔑 ID الموظف</span>
                <span style="font-size:13px;color:#1e293b;font-weight:800;letter-spacing:2px;">${user.emp_id}</span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🏥 الصيدلية</span>
                <span style="font-size:13px;font-weight:800;">
                  <span style="color:#059669;">${storeCode}</span>
                  <span style="color:#cbd5e1;"> — </span>
                  <span style="color:#475569;">${pharmName}</span>
                </span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">⚙️ البيئة</span>
                <span style="font-size:12px;color:#4f46e5;font-weight:800;background:#eef2ff;padding:3px 12px;border-radius:6px;border:1px solid #a5b4fc;">${format}</span>
              </div>
            </div>

            <div style="display:flex;gap:10px;">
              <button id="dlg-cancel" style="flex:1;padding:12px;border:1.5px solid #e2e8f0;border-radius:11px;background:#f8fafc;color:#64748b;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;transition:all 0.2s;">إلغاء</button>
              <button id="dlg-confirm" style="flex:2;padding:12px;border:none;border-radius:11px;background:linear-gradient(135deg,#059669,#10b981);color:white;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;box-shadow:0 4px 14px rgba(16,185,129,0.3);">✔ تأكيد التنفيذ</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(dlg);
      dlg.querySelector('#dlg-confirm').addEventListener('click', function() { dlg.remove(); resolve(true);  });
      dlg.querySelector('#dlg-cancel').addEventListener('click',  function() { dlg.remove(); resolve(false); });
      dlg.addEventListener('mousedown', function(e) { if (e.target === dlg) { dlg.remove(); resolve(false); } });
    });
  }

})();

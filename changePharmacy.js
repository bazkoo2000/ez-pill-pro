javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_store_changer';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  // ═══════════════════════════════════════════
  // فك التشفير بـ TextDecoder — يدعم UTF-8/عربي بشكل كامل
  // بدل decodeURIComponent اللي بيطلع URI malformed
  // ═══════════════════════════════════════════
  function decodeData(b64) {
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }

  const _U = 'W3siZCI6Iti52YTZiiDYp9mE2KjYp9iyICjYp9mE2KPYs9in2LPZiikiLCJlIjoiMTAxMDkzIiwibiI6IkFsaSBFbGJheiIsInUiOiJhbGJhei5hYSJ9LHsiZCI6ItmF2YbYtdmI2LEg2KfZhNio2YPYsdmJIiwiZSI6IjEwMjU5OSIsIm4iOiJFTEJBS1JJLk1NIiwidSI6IkVMQkFLUkkuTU0ifSx7ImQiOiLZhdit2YXYryDYp9mE2LTYp9i32LEiLCJlIjoiMTA2MDIzIiwibiI6IkVMU0hBVEVSLk1BIiwidSI6IkVMU0hBVEVSLk1BIn0seyJkIjoi2YXYrdmF2K8g2KrZiNmB2YrZgiIsImUiOiIxMDY1MDkiLCJuIjoiYWxmYWhhZC5tdCIsInUiOiJhbGZhaGFkLm10In0seyJkIjoi2YXYrdmF2K8g2LLZitiv2KfZhiIsImUiOiIxMDUxNDMiLCJuIjoiTW9oYW1lZCBaZWRhbiIsInUiOiJaZWRhbi5NSSJ9LHsiZCI6Itin2LPYp9mF2Ycg2KfZhNiz2YLYpyIsImUiOiIxMDU4OTMiLCJuIjoiT3NhbWEgRWxzYWtrYSIsInUiOiJFbHNha2thLm9tIn0seyJkIjoi2YXYrNiv2Ykg2LPZhdmK2LEiLCJlIjoiMTA0OTg5IiwibiI6Ik1hZ2R5IFNhbWlyIiwidSI6ImVsc2F5ZWQubXMxIn0seyJkIjoi2KfYrdmF2K8g2YjYrdmK2K8iLCJlIjoiMTA1NjA3IiwibiI6IkFobWVkIFdhaGVlZCIsInUiOiJlbHplYWlreS5hdyJ9LHsiZCI6ItmF2K3ZhdmI2K8g2YfZhdin2YUiLCJlIjoiMTA1NTkxIiwibiI6Im1haG1vdWQgaGFtYW0iLCJ1IjoiZWxzYXllZC5tbTQifSx7ImQiOiLZhdit2YXYryDYp9mE2KfZhti12KfYsdmJIiwiZSI6IjEwNTIyNSIsIm4iOiJNb2hhbWVkIEFsYW5zYXJpIiwidSI6ImFsYW5zYXJpLm1oIn0seyJkIjoi2YXYrdmF2K8g2KzZhNin2YQiLCJlIjoiMTA1MTAzIiwibiI6Ik1vaGFtZWQgZ2FsYWwiLCJ1IjoiTU9IQU1FRC5NRzQifSx7ImQiOiLYp9iz2KfZhdmHINin2K3ZhdivIiwiZSI6IjEwMTgzOSIsIm4iOiJPc2FtYSBBaG1lZCIsInUiOiJNQUhNT1VELk9BIn0seyJkIjoi2YXYrdmF2YjYryDYp9mE2KzZhtiv2YkiLCJlIjoiMTAxMTI5IiwibiI6IkFMR0VORElFLk1NIiwidSI6IkFMR0VORElFLk1NIn0seyJkIjoi2LnYqNiv2KfZhNmE2Ycg2LHYp9i02K8iLCJlIjoiMTAyMzcwIiwibiI6IkFiZGFsbGFoIFJhc2hlZCIsInUiOiJyYXNoZWQuYW0xIn1d';
  const _P = 'W3siYyI6IjEzMDAiLCJuIjoi2KfZhNis2YjYr9mJIn0seyJjIjoiNDA4MyIsIm4iOiLZg9ix2YrZhSJ9LHsiYyI6IjExMTkiLCJuIjoi2KfYqNmGINin2YTZiNmE2YrYryJ9LHsiYyI6IjYwNzkiLCJuIjoi2KfZhNmG2YfYrCJ9LHsiYyI6IjI1MjUiLCJuIjoi2KfZhNmG2YLYp9ihIn0seyJjIjoiNDA2MSIsIm4iOiLZhdis2LLZitmHIn0seyJjIjoiNzYwNyIsIm4iOiLYp9mE2KzYp9mF2K0ifSx7ImMiOiI3MTExIiwibiI6Itin2YTYp9ix2KrYp9mEIn0seyJjIjoiNTA3MCIsIm4iOiLYp9mE2LnYp9isIn0seyJjIjoiMjA5NSIsIm4iOiLYp9mE2LPZitix2YcifSx7ImMiOiIzMDgwIiwibiI6Itin2YTYqNin2LIifV0=';

  const USERS      = decodeData(_U).map(u => ({ display:u.d, emp_id:u.e, emp_name:u.n, user_name:u.u }));
  const PHARMACIES = decodeData(_P).map(p => ({ code:p.c, name:p.n }));

  // ═══════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap');
    @keyframes scOverlay{from{opacity:0}to{opacity:1}}
    @keyframes scCard{from{opacity:0;transform:translate(-50%,-48%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes scSpin{to{transform:rotate(360deg)}}
    #${PANEL_ID} *{box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}
    #sc-overlay{position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(12px);z-index:9999999;animation:scOverlay 0.3s ease forwards}
    #sc-card{position:absolute;top:50%;left:50%;width:420px;max-width:94vw;background:linear-gradient(160deg,#0f172a 0%,#0c1528 60%,#0a1020 100%);border:1px solid rgba(99,179,237,0.12);border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 40px 80px rgba(0,0,0,0.6),0 0 120px rgba(59,130,246,0.08);animation:scCard 0.4s cubic-bezier(0.16,1,0.3,1) forwards}
    #sc-header{padding:26px 28px 22px;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;overflow:hidden}
    #sc-header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 100% 0%,rgba(59,130,246,0.12),transparent)}
    #sc-header::after{content:'';position:absolute;top:-1px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(99,179,237,0.4),transparent)}
    #sc-title{font-size:17px;font-weight:800;color:#f1f5f9;letter-spacing:-0.3px;margin:0;position:relative;z-index:1}
    #sc-subtitle{font-size:11px;color:#64748b;font-weight:600;margin-top:3px;position:relative;z-index:1;letter-spacing:0.5px;text-transform:uppercase}
    #sc-close{position:absolute;top:24px;left:24px;width:32px;height:32px;border-radius:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.15);color:#f87171;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;font-weight:900;transition:all 0.2s;z-index:2}
    #sc-close:hover{background:rgba(239,68,68,0.2)}
    #sc-body{padding:24px 28px 28px;direction:rtl}
    .sc-field{margin-bottom:18px}
    .sc-label{display:block;margin-bottom:8px;font-size:11px;font-weight:700;color:#475569;letter-spacing:0.8px;text-transform:uppercase}
    .sc-select,.sc-input{width:100%;padding:13px 16px;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:12px;font-size:14px;font-weight:700;color:#e2e8f0;outline:none;transition:all 0.25s;-webkit-appearance:none}
    .sc-select:focus,.sc-input:focus{border-color:rgba(59,130,246,0.5);background:rgba(15,23,42,1);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
    .sc-select option{background:#0f172a;color:#e2e8f0}
    #sc-user-preview{margin-top:10px;padding:12px 14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.12);border-radius:10px;display:flex;align-items:center;gap:10px;transition:all 0.3s}
    #sc-user-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1e40af,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:white;flex-shrink:0}
    #sc-user-name{font-size:13px;font-weight:800;color:#93c5fd}
    #sc-user-meta{font-size:11px;color:#475569;font-weight:600;margin-top:2px}
    .sc-input-wrap{position:relative}
    .sc-input-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none}
    .sc-input-wrap .sc-input{padding-right:42px;text-align:center;font-size:17px;letter-spacing:2px;color:#34d399}
    #sc-format-wrap{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
    .sc-fmt-btn{padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(15,23,42,0.6);color:#64748b;font-size:13px;font-weight:800;cursor:pointer;text-align:center;transition:all 0.2s}
    .sc-fmt-btn.active{background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.3);color:#60a5fa}
    .sc-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:20px 0}
    #sc-submit{width:100%;padding:15px 20px;border:none;border-radius:14px;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,#059669,#10b981,#059669);background-size:200% auto;box-shadow:0 8px 24px rgba(16,185,129,0.25);transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px}
    #sc-submit:hover:not(:disabled){background-position:right center;transform:translateY(-1px)}
    #sc-submit:disabled{opacity:0.7;cursor:not-allowed;transform:none}
    #sc-toast-wrap{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center}
    .sc-toast{padding:12px 22px;border-radius:12px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;direction:rtl;color:white;animation:scCard 0.3s cubic-bezier(0.16,1,0.3,1);white-space:nowrap;transition:opacity 0.3s}
  `;
  document.head.appendChild(style);

  // HTML
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
            <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#1e3a5f,#1e40af);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid rgba(99,179,237,0.15);">🎛️</div>
            <div>
              <div id="sc-title">مُدير النظام المتقدم</div>
              <div id="sc-subtitle">Advanced Store Manager — v2.1</div>
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
    const colors = { success:'rgba(5,150,105,0.95)', error:'rgba(220,38,38,0.95)', warning:'rgba(217,119,6,0.95)', info:'rgba(15,23,42,0.95)' };
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
      inp.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.1)';
      setTimeout(function() { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 2000);
      toast('أدخل كود أو اسم الصيدلية', 'warning');
      return;
    }

    const storeMatch = rawStore.match(/\d+/);
    const storeCode  = storeMatch ? storeMatch[0] : rawStore;

    const confirmed = await showConfirmDialog(selectedUser, storeCode, format);
    if (!confirmed) return;

    btn.disabled = true;
    btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:scSpin 0.8s linear infinite;flex-shrink:0"></div><span>جاري التحديث...</span>';

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
        body: params
      });

      if (res.ok) {
        btn.innerHTML = '✅ تم — جاري إعادة التشغيل...';
        btn.style.background = 'linear-gradient(135deg,#1e40af,#3b82f6)';
        toast('تم التحديث ✔ — جاري تسجيل الخروج وإعادة الدخول...', 'success');

        setTimeout(async function() {
          // 1. مسح الـ storage المحلي
          try { sessionStorage.clear(); } catch(e) {}
          try { localStorage.clear();   } catch(e) {}

          // 2. مسح الـ cookies
          document.cookie.split(';').forEach(function(c) {
            const key = c.trim().split('=')[0];
            if (key) {
              document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
              document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/ez_pill_web/';
            }
          });

          // 3. logout من السيرفر عشان يمسح الـ session من جهته
          try {
            await fetch(window.location.origin + '/ez_pill_web/Home/logout', {
              method: 'POST',
              credentials: 'include'
            });
          } catch(e) {
            // لو الـ logout endpoint مختلف نجرب الـ GET
            try {
              await fetch(window.location.origin + '/ez_pill_web/logout', {
                method: 'GET',
                credentials: 'include'
              });
            } catch(e2) {}
          }

          // 4. توجيه لصفحة Login مباشرة بدل reload
          window.location.href = window.location.origin + '/ez_pill_web/Home/login?_r=' + Date.now();
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

  // Confirm Dialog
  function showConfirmDialog(user, storeCode, format) {
    return new Promise(function(resolve) {
      const pharmacy  = PHARMACIES.find(function(p) { return p.code === storeCode; });
      const pharmName = pharmacy ? pharmacy.name : '—';

      const dlg = document.createElement('div');
      dlg.style.cssText = "position:fixed;inset:0;z-index:99999999;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,0.75);backdrop-filter:blur(16px);animation:scOverlay 0.2s ease;font-family:'IBM Plex Sans Arabic',sans-serif;";

      dlg.innerHTML = `
        <div style="width:360px;max-width:92vw;background:linear-gradient(160deg,#0f172a,#0a1020);border:1px solid rgba(99,179,237,0.1);border-radius:20px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.03);animation:scCard 0.35s cubic-bezier(0.16,1,0.3,1);direction:rtl;">
          <div style="padding:22px 24px 18px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;">
            <div style="width:52px;height:52px;margin:0 auto 12px;border-radius:14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;">⚠️</div>
            <div style="font-size:17px;font-weight:800;color:#f1f5f9;margin-bottom:4px;">تأكيد تنفيذ الأمر</div>
            <div style="font-size:12px;color:#475569;font-weight:600;">تحقق من البيانات قبل المتابعة</div>
          </div>
          <div style="padding:16px 22px 20px;">
            <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.01);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">👤 الحساب</span>
                <span style="font-size:13px;color:#93c5fd;font-weight:800;">${user.display}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🔑 ID الموظف</span>
                <span style="font-size:13px;color:#e2e8f0;font-weight:800;letter-spacing:2px;">${user.emp_id}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.01);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🏥 الصيدلية</span>
                <span style="font-size:13px;font-weight:800;"><span style="color:#34d399;">${storeCode}</span><span style="color:#334155;"> — </span><span style="color:#94a3b8;">${pharmName}</span></span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">⚙️ البيئة</span>
                <span style="font-size:12px;color:#a78bfa;font-weight:800;background:rgba(139,92,246,0.1);padding:3px 12px;border-radius:6px;border:1px solid rgba(139,92,246,0.2);">${format}</span>
              </div>
            </div>
            <div style="display:flex;gap:10px;">
              <button id="dlg-cancel"  style="flex:1;padding:12px;border:1px solid rgba(255,255,255,0.07);border-radius:11px;background:transparent;color:#475569;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;">إلغاء</button>
              <button id="dlg-confirm" style="flex:2;padding:12px;border:none;border-radius:11px;background:linear-gradient(135deg,#059669,#10b981);color:white;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;box-shadow:0 4px 14px rgba(16,185,129,0.25);">✔ تأكيد التنفيذ</button>
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

javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_store_changer';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  // ═══════════════════════════════════════════
  // البيانات مشفرة بـ Base64 — مش واضحة في الكود
  // لفكها: atob(str) ثم JSON.parse
  // ═══════════════════════════════════════════
  const _U = JSON.parse(atob('W3siZCI6Itin2YTZiiDYp9mE2KจY3IiwiZSI6IjEwMTA5MyIsIm4iOiJBbGkgRWxiYXoiLCJ1IjoiYWxiYXouYWEifSx7ImQiOiLZhdmG2LXZiNixINin2YTYqNmD2LHZiiIsImUiOiIxMDI1OTkiLCJuIjoiRUxCQUtSSS5NTSJ7InUiOiJFTEJBS1JJLk1NIn0seyJkIjoi2YXYrdmF2K8g2KfZhNi42KfYt9ixIiwiZSI6IjEwNjAyMyIsIm4iOiJFTFNIQVRFUi5NQSIsInUiOiJFTFNIQVRFUi5NQSJ9LHsiZCI6ItmF2K3ZhdK7INiq2YjZgdmKqiIsImUiOiIxMDY1MDkiLCJuIjoiYWxmYWhhZC5tdCIsInUiOiJhbGZhaGFkLm10In0seyJkIjoi2YXYrdmF2K8g2LLZitiv2KfZhiIsImUiOiIxMDUxNDMiLCJuIjoiTW9oYW1lZCBaZWRhbiIsInUiOiJaZWRhbi5NSSJ9LHsiZCI6Itin2LPYp9mF2Ycg2KfZhNiz2YLYoSIsImUiOiIxMDU4OTMiLCJuIjoiT3NhbWEgRWxzYWtrYSIsInUiOiJFbHNha2thLm9tIn0seyJkIjoi2YXYrtiw2K8g2LPZhdmK2LEiLCJlIjoiMTA0OTg5IiwibiI6Ik1hZ2R5IFNhbWlyIiwidSI6ImVsc2F5ZWQubXMxIn0seyJkIjoi2KfYrdmF2K8g2YjYrdmK2K8iLCJlIjoiMTA1NjA3IiwibiI6IkFobWVkIFdhaGVlZCIsInUiOiJlbHplaypreS5hdyJ9LHsiZCI6ItmF2K3ZhdmI2K8g2YfZhdYmeiIsImUiOiIxMDU1OTEiLCJuIjoibWFobW91ZCBoYW1hbSIsInUiOiJlbHNheWVkLm1tNCJ9LHsiZCI6ItmF2K3ZhdK7INin2YTYp9mG2LXYp9ixeSIsImUiOiIxMDUyMjUiLCJuIjoiTW9oYW1lZCBBbGFuc2FyaSIsInUiOiJhbGFuc2FyaS5taCJ9LHsiZCI6ItmF2K3ZhdK7INis2YTYp9YmIiwiZSI6IjEwNTEwMyIsIm4iOiJNb2hhbWVkIGdhbGFsIiwidSI6Ik1PSEFNRUQK0U1HNCCfeyJkIjoi2KfYs9Ym2YXYrSCY2K3ZhdK7IiwiZSI6IjEwMTgzOSIsIm4iOiJPc2FtYSBBaG1lZCIsInUiOiJNQUhNT1VELk9BIn0seyJkIjoi2YXYrdmF2YjYryDYp9mE2K_ZhuqMcHkiLCJlIjoiMTAxMTI5IiwibiI6IkFMR0VORElFLk1NIiwidSI6IkFMR0VORElFLk1NIn0seyJkIjoi2LnYqNui2YTYp9mHINix2KfYtNK7IiwiZSI6IjEwMjM3MCIsIm4iOiJBYmRhbGxhaCBSYXNoZWQiLCJ1IjoicmFzaGVkLmFtMSJ9XQ=='));

  const _P = JSON.parse(atob('W3siYyI6IjEzMDAiLCJuIjoi2KfZhNis2YjYr9mKIn0seyJjIjoiNDA4MyIsIm4iOiLZg9ix2YrZhSJ9LHsiYyI6IjExMTkiLCJuIjoi2KfYqNmGINin2YTZiNmK2YEifSx7ImMiOiI2MDc5IiwibiI6Itiu2KfZhNmG2Iqifsx7ImMiOiIyNTI1IiwibiI6Itiu2KfZhNmG2YLYoSJ9LHsiYyI6IjQwNjEiLCJuIjoi2YXYrNi52YrYrSJ9LHsiYyI6Ijc2MDciLCJuIjoi2KfZhNis2KfZhdiyIn0seyJjIjoiNzExMSIsIm4iOiLYp9mE2KfYsdiq2KfZhCJ9LHsiYyI6IjUwNzAiLCJuIjoi2KfZhNi52KfYrSJ9LHsiYyI6IjIwOTUiLCJuIjoi2KfZhNiz2YrYsdYmIn0seyJjIjoiMzA4MCIsIm4iOiLYp9mE2KjYp9iyIn1d'));

  // فك التشفير عند الاستخدام فقط
  const USERS = _U.map(u => ({ display: u.d, emp_id: u.e, emp_name: u.n, user_name: u.u }));
  const PHARMACIES = _P.map(p => ({ code: p.c, name: p.n }));

  // ═══════════════════════════════════════════
  // CSS — تصميم فاخر داكن
  // ═══════════════════════════════════════════
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap');

    @keyframes scOverlay { from { opacity:0 } to { opacity:1 } }
    @keyframes scCard   { from { opacity:0; transform:translate(-50%,-48%) scale(0.96) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
    @keyframes scShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
    @keyframes scPulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }

    #${PANEL_ID} * { box-sizing:border-box; font-family:'IBM Plex Sans Arabic', sans-serif; }

    #sc-overlay {
      position:fixed;inset:0;
      background:rgba(2,6,23,0.85);
      backdrop-filter:blur(12px);
      z-index:9999999;
      animation:scOverlay 0.3s ease forwards;
    }

    #sc-card {
      position:absolute;top:50%;left:50%;
      width:420px;max-width:94vw;
      background:linear-gradient(160deg,#0f172a 0%,#0c1528 60%,#0a1020 100%);
      border:1px solid rgba(99,179,237,0.12);
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6), 0 0 120px rgba(59,130,246,0.08);
      animation:scCard 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    }

    /* شريط علوي */
    #sc-header {
      padding:26px 28px 22px;
      border-bottom:1px solid rgba(255,255,255,0.06);
      position:relative;
      overflow:hidden;
    }
    #sc-header::before {
      content:'';
      position:absolute;inset:0;
      background:radial-gradient(ellipse 80% 60% at 100% 0%, rgba(59,130,246,0.12), transparent);
    }
    #sc-header::after {
      content:'';
      position:absolute;
      top:-1px;left:10%;right:10%;height:1px;
      background:linear-gradient(90deg,transparent,rgba(99,179,237,0.4),transparent);
    }

    #sc-title {
      font-size:17px;font-weight:800;
      color:#f1f5f9;
      letter-spacing:-0.3px;
      margin:0;
      position:relative;z-index:1;
    }
    #sc-subtitle {
      font-size:11px;color:#64748b;font-weight:600;
      margin-top:3px;
      position:relative;z-index:1;
      letter-spacing:0.5px;
      text-transform:uppercase;
    }
    #sc-close {
      position:absolute;top:22px;left:24px;
      width:32px;height:32px;
      border-radius:10px;
      background:rgba(239,68,68,0.1);
      border:1px solid rgba(239,68,68,0.15);
      color:#f87171;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:13px;font-weight:900;
      transition:all 0.2s;
      position:absolute;top:24px;left:24px;z-index:2;
    }
    #sc-close:hover { background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.3); }

    /* Body */
    #sc-body { padding:24px 28px 28px; direction:rtl; }

    .sc-field { margin-bottom:18px; }
    .sc-label {
      display:block;margin-bottom:8px;
      font-size:11px;font-weight:700;color:#475569;
      letter-spacing:0.8px;text-transform:uppercase;
    }

    /* Select & Input */
    .sc-select, .sc-input {
      width:100%;padding:13px 16px;
      background:rgba(15,23,42,0.8);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:12px;
      font-size:14px;font-weight:700;
      color:#e2e8f0;
      outline:none;
      transition:all 0.25s;
      -webkit-appearance:none;
    }
    .sc-select:focus, .sc-input:focus {
      border-color:rgba(59,130,246,0.5);
      background:rgba(15,23,42,1);
      box-shadow:0 0 0 3px rgba(59,130,246,0.1);
    }
    .sc-select option { background:#0f172a; color:#e2e8f0; }

    /* User card preview */
    #sc-user-preview {
      margin-top:10px;
      padding:12px 14px;
      background:rgba(59,130,246,0.06);
      border:1px solid rgba(59,130,246,0.12);
      border-radius:10px;
      display:flex;align-items:center;gap:10px;
      transition:all 0.3s;
    }
    #sc-user-avatar {
      width:36px;height:36px;border-radius:10px;
      background:linear-gradient(135deg,#1e40af,#3b82f6);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:900;color:white;
      flex-shrink:0;
    }
    #sc-user-name { font-size:13px;font-weight:800;color:#93c5fd; }
    #sc-user-meta { font-size:11px;color:#475569;font-weight:600;margin-top:2px; }

    /* Store input wrapper */
    .sc-input-wrap { position:relative; }
    .sc-input-icon {
      position:absolute;right:14px;top:50%;transform:translateY(-50%);
      font-size:16px;pointer-events:none;
    }
    .sc-input-wrap .sc-input { padding-right:42px; text-align:center; font-size:17px; letter-spacing:2px; color:#34d399; }

    /* Format toggle */
    #sc-format-wrap {
      display:grid;grid-template-columns:1fr 1fr;gap:8px;
      margin-top:8px;
    }
    .sc-fmt-btn {
      padding:12px;border-radius:10px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(15,23,42,0.6);
      color:#64748b;font-size:13px;font-weight:800;
      cursor:pointer;text-align:center;
      transition:all 0.2s;
    }
    .sc-fmt-btn.active {
      background:rgba(59,130,246,0.12);
      border-color:rgba(59,130,246,0.3);
      color:#60a5fa;
    }

    /* Divider */
    .sc-divider {
      height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);
      margin:20px 0;
    }

    /* Submit */
    #sc-submit {
      width:100%;padding:15px 20px;
      border:none;border-radius:14px;cursor:pointer;
      font-size:15px;font-weight:800;
      color:white;
      background:linear-gradient(135deg,#059669,#10b981,#059669);
      background-size:200% auto;
      box-shadow:0 8px 24px rgba(16,185,129,0.25);
      transition:all 0.3s;
      letter-spacing:0.3px;
      display:flex;align-items:center;justify-content:center;gap:8px;
    }
    #sc-submit:hover:not(:disabled) {
      background-position:right center;
      box-shadow:0 12px 30px rgba(16,185,129,0.35);
      transform:translateY(-1px);
    }
    #sc-submit:disabled { opacity:0.7;cursor:not-allowed;transform:none; }

    /* Toast */
    #sc-toast-wrap {
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center;
    }
    .sc-toast {
      padding:12px 22px;border-radius:12px;
      font-size:13px;font-weight:700;
      display:flex;align-items:center;gap:8px;
      direction:rtl;color:white;
      backdrop-filter:blur(12px);
      animation:scCard 0.3s cubic-bezier(0.16,1,0.3,1);
      white-space:nowrap;
    }
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════
  // HTML
  // ═══════════════════════════════════════════
  let usersHTML = USERS.map((u, i) => `<option value="${i}">${u.display}</option>`).join('');
  let pharmHTML = PHARMACIES.map(p => `<option value="${p.code} - ${p.name}">`).join('');

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
              <div id="sc-subtitle">Advanced Store Manager — v2.0</div>
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
                <div id="sc-user-name">علي الباز (الأساسي)</div>
                <div id="sc-user-meta">ID: ••••••• &nbsp;|&nbsp; @••••••</div>
              </div>
            </div>
          </div>

          <div class="sc-field">
            <label class="sc-label">🏥 كود الصيدلية</label>
            <div class="sc-input-wrap">
              <span class="sc-input-icon">🔍</span>
              <input list="ali_pharmacies_list" type="text" id="ali_new_store"
                placeholder="1300 أو الجودي..." class="sc-input">
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

          <button id="sc-submit">
            <span>🚀</span><span>تنفيذ التحديث</span>
          </button>

        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ═══════════════════════════════════════════
  // Toast
  // ═══════════════════════════════════════════
  function toast(msg, type = 'info') {
    let wrap = document.getElementById('sc-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'sc-toast-wrap';
      document.body.appendChild(wrap);
    }
    const colors = { success:'rgba(5,150,105,0.95)', error:'rgba(220,38,38,0.95)', warning:'rgba(217,119,6,0.95)', info:'rgba(15,23,42,0.95)' };
    const icons  = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = 'sc-toast';
    t.style.background = colors[type];
    t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 3500);
  }

  // ═══════════════════════════════════════════
  // User Preview — يعرض البيانات بس لما تختار
  // ═══════════════════════════════════════════
  function updatePreview(idx) {
    const u = USERS[idx];
    if (!u) return;
    const initials = u.display.trim().charAt(0);
    document.getElementById('sc-user-avatar').textContent = initials;
    document.getElementById('sc-user-name').textContent = u.display;
    // الـ ID والـ username يظهروا بس في الـ preview — مش في الكود العلني
    document.getElementById('sc-user-meta').textContent = `ID: ${u.emp_id}  |  @${u.user_name}`;
  }

  updatePreview(0);

  document.getElementById('ali_user_select').addEventListener('change', function() {
    updatePreview(parseInt(this.value));
  });

  // ═══════════════════════════════════════════
  // Format Toggle
  // ═══════════════════════════════════════════
  document.querySelectorAll('.sc-fmt-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sc-fmt-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('ali_new_format').value = this.dataset.val;
    });
  });

  // ═══════════════════════════════════════════
  // Close
  // ═══════════════════════════════════════════
  function closePanel() {
    const ov = document.getElementById('sc-overlay');
    if (ov) { ov.style.opacity = '0'; ov.style.transition = 'opacity 0.25s'; }
    setTimeout(() => overlay.remove(), 260);
  }
  document.getElementById('sc-close').addEventListener('click', closePanel);
  document.getElementById('sc-overlay').addEventListener('mousedown', function(e) {
    if (e.target === this) closePanel();
  });

  // ═══════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════
  document.getElementById('sc-submit').addEventListener('click', async function() {
    const btn = this;
    const userIndex = parseInt(document.getElementById('ali_user_select').value);
    const selectedUser = USERS[userIndex];
    const rawStore = document.getElementById('ali_new_store').value.trim();
    const format = document.getElementById('ali_new_format').value;

    if (!rawStore) {
      const inp = document.getElementById('ali_new_store');
      inp.style.borderColor = 'rgba(239,68,68,0.6)';
      inp.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
      setTimeout(() => { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 2000);
      toast('أدخل كود أو اسم الصيدلية', 'warning');
      return;
    }

    const storeMatch = rawStore.match(/\d+/);
    const storeCode = storeMatch ? storeMatch[0] : rawStore;

    // Dialog تأكيد
    const confirmed = await showConfirmDialog(selectedUser, storeCode, format);
    if (!confirmed) return;

    btn.disabled = true;
    btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:scPulse 0.8s linear infinite"></div> جاري التحديث...';

    try {
      const params = new URLSearchParams();
      params.append('emp_id',       selectedUser.emp_id);
      params.append('emp_name',     selectedUser.emp_name);
      params.append('user_name',    selectedUser.user_name);
      params.append('storecode',    storeCode);
      params.append('machine_format', format);

      const res = await fetch(window.location.origin + '/ez_pill_web/manageUsers/addNew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params
      });

      if (res.ok) {
        btn.innerHTML = '✅ تم التحديث بنجاح';
        btn.style.background = 'linear-gradient(135deg,#1e40af,#3b82f6)';
        toast('تم تحديث الصيدلية بنجاح ✔', 'success');
        // مسح مفاتيح محددة بدل clear() كامل
        ['storeCode','currentStore','activeSession'].forEach(k => {
          try { sessionStorage.removeItem(k); } catch(e){}
        });
      } else {
        throw new Error('server');
      }
    } catch(e) {
      btn.innerHTML = '❌ فشل التحديث — أعد المحاولة';
      btn.style.background = 'linear-gradient(135deg,#dc2626,#ef4444)';
      toast('حدث خطأ في الاتصال بالخادم', 'error');
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀</span><span>تنفيذ التحديث</span>';
        btn.style.background = '';
      }, 2500);
    }
  });

  // Enter key
  document.getElementById('ali_new_store').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('sc-submit').click();
  });

  // ═══════════════════════════════════════════
  // Dialog تأكيد احترافي
  // ═══════════════════════════════════════════
  function showConfirmDialog(user, storeCode, format) {
    return new Promise(resolve => {
      const pharmacy = PHARMACIES.find(p => p.code === storeCode);
      const pharmName = pharmacy ? pharmacy.name : 'غير معروف';

      const dlg = document.createElement('div');
      dlg.style.cssText = `
        position:fixed;inset:0;z-index:99999999;
        display:flex;align-items:center;justify-content:center;
        background:rgba(2,6,23,0.7);backdrop-filter:blur(16px);
        animation:scOverlay 0.2s ease;
      `;
      dlg.innerHTML = `
        <div style="
          width:360px;max-width:92vw;
          background:linear-gradient(160deg,#0f172a,#0a1020);
          border:1px solid rgba(99,179,237,0.1);
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.03);
          animation:scCard 0.35s cubic-bezier(0.16,1,0.3,1);
          font-family:'IBM Plex Sans Arabic',sans-serif;
          direction:rtl;
        ">
          <!-- Header -->
          <div style="padding:22px 24px 18px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;position:relative;">
            <div style="width:56px;height:56px;margin:0 auto 14px;border-radius:16px;
              background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05));
              border:1px solid rgba(245,158,11,0.2);
              display:flex;align-items:center;justify-content:center;font-size:24px;">⚠️</div>
            <div style="font-size:17px;font-weight:800;color:#f1f5f9;margin-bottom:6px;">تأكيد تنفيذ الأمر</div>
            <div style="font-size:12px;color:#475569;font-weight:600;">تحقق من البيانات قبل المتابعة</div>
          </div>

          <!-- Info rows -->
          <div style="padding:18px 24px;">

            <div style="border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);overflow:hidden;margin-bottom:14px;">

              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">👤 الحساب</span>
                <span style="font-size:13px;color:#93c5fd;font-weight:800;">${user.display}</span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🔑 ID الموظف</span>
                <span style="font-size:13px;color:#e2e8f0;font-weight:800;letter-spacing:1px;">${user.emp_id}</span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#64748b;font-weight:700;">🏥 الصيدلية</span>
                <span style="font-size:13px;font-weight:800;">
                  <span style="color:#34d399;">${storeCode}</span>
                  <span style="color:#475569;"> — </span>
                  <span style="color:#94a3b8;">${pharmName}</span>
                </span>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;">
                <span style="font-size:12px;color:#64748b;font-weight:700;">⚙️ البيئة</span>
                <span style="font-size:12px;color:#a78bfa;font-weight:800;background:rgba(139,92,246,0.1);padding:3px 10px;border-radius:6px;border:1px solid rgba(139,92,246,0.2);">${format}</span>
              </div>
            </div>

            <!-- Buttons -->
            <div style="display:flex;gap:10px;">
              <button id="dlg-cancel" style="
                flex:1;padding:13px;border:1px solid rgba(255,255,255,0.08);
                border-radius:12px;background:rgba(255,255,255,0.03);
                color:#64748b;font-size:14px;font-weight:800;cursor:pointer;
                font-family:'IBM Plex Sans Arabic',sans-serif;
                transition:all 0.2s;
              ">إلغاء</button>
              <button id="dlg-confirm" style="
                flex:2;padding:13px;border:none;
                border-radius:12px;
                background:linear-gradient(135deg,#059669,#10b981);
                color:white;font-size:14px;font-weight:800;cursor:pointer;
                font-family:'IBM Plex Sans Arabic',sans-serif;
                box-shadow:0 4px 16px rgba(16,185,129,0.25);
                transition:all 0.2s;
              ">✔ تأكيد التنفيذ</button>
            </div>

          </div>
        </div>
      `;

      document.body.appendChild(dlg);

      dlg.querySelector('#dlg-confirm').addEventListener('click', () => { dlg.remove(); resolve(true); });
      dlg.querySelector('#dlg-cancel').addEventListener('click',  () => { dlg.remove(); resolve(false); });
      dlg.addEventListener('mousedown', e => { if (e.target === dlg) { dlg.remove(); resolve(false); } });
    });
  }

})();

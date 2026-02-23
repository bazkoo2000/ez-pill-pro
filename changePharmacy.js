javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_store_changer';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  // ═══════════════════════════════════════════
  // Unicode-safe decoding — يدعم العربي بشكل صحيح
  // الطريقة: base64 → decodeURIComponent → JSON.parse
  // ═══════════════════════════════════════════
  function decodeData(b64) {
    return JSON.parse(decodeURIComponent(atob(b64)));
  }

  const _U = 'JTVCJTdCJTIyZCUyMiUzQSUyMiVEOCVCOSVEOSU4NCVEOSU4QSUyMCVEOCVBNyVEOSU4NCVEOCVBOCVEOCVBNyVEOCVCMiUyMCglRDglQTclRDklODQlRDglQTMlRDglQjMlRDglQTclRDglQjMlRDklOEEpJTIyJTJDJTIyZSUyMiUzQSUyMjEwMTA5MyUyMiUyQyUyMm4lMjIlM0ElMjJBbGklMjBFbGJheiUyMiUyQyUyMnUlMjIlM0ElMjJhbGJhei5hYSUyMiU3RCUyQyU3QiUyMmQlMjIlM0ElMjIlRDklODUlRDklODYlRDglQjUlRDklODglRDglQjElMjAlRDglQTclRDklODQlRDglQTglRDklODMlRDglQjElRDklODklMjIlMkMlMjJlJTIyJTNBJTIyMTAyNTk5JTIyJTJDJTIybiUyMiUzQSUyMkVMQkFLUkkuTU0lMjIlMkMlMjJ1JTIyJTNBJTIyRUxCQUtSSS5NTSUyMiU3RCUyQyU3QiUyMmQlMjIlM0ElMjIlRDklODUlRDglQUQlRDklODUlRDglQUYlMjAlRDglQTclRDklODQlRDglQjQlRDglQTclRDglQjclRDglQjElMjIlMkMlMjJlJTIyJTNBJTIyMTA2MDIzJTIyJTJDJTIybiUyMiUzQSUyMkVMU0hBVEVSLk1BJTIyJTJDJTIydSUyMiUzQSUyMkVMU0hBVEVSLk1BJTIyJTdEJTJDJTdCJTIyZCUyMiUzQSUyMiVEOSU4NSVEOCVBRCVEOSU4NVFEOCVBRCUUMCVEOSVBQSVEOSU4OCVEOSU4MSVEOSU4QSVEOSU4MiUyMiUyQyUyMmUlMjIlM0ElMjIxMDY1MDklMjIlMkMlMjJuJTIyJTNBJTIyYWxmYWhhZC5tdCUyMiUyQyUyMnUlMjIlM0ElMjJhbGZhaGFkLm10JTIyJTdEJTJDJTdCJTIyZCUyMiUzQSUyMiVEOSU4NSVEOCVBRCVEOSU4NSVEOCVBRiUyMCVEOCVCMiVEOSU4QSVEOCVBRiVEOCVBNyVEOSU4NiUyMiUyQyUyMmUlMjIlM0ElMjIxMDUxNDMlMjIlMkMlMjJuJTIyJTNBJTIyTW9oYW1lZCUyMFplZGFuJTIyJTJDJTIydSUyMiUzQSUyMlplZGFuLk1JJTIyJTdEJTJDJTdCJTIyZCUyMiUzQSUyMiVEOCVBNyVEOCVCMyVEOCVBNyVEOSU4NSVEOSU4NyUyMCVEOCVBNyVEOSU4NCVEOCVCMyVEOSU4MiVEOCVBNyUyMiUyQyUyMmUlMjIlM0ElMjIxMDU4OTMlMjIlMkMlMjJuJTIyJTNBJTIyT3NhbWElMjBFbHNha2thJTIyJTJDJTIydSUyMiUzQSUyMkVsc2Fra2Eub20lMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ5JTg1JUQ4JUFDJUQ4JUFGJUQ5JTg5JTIwJUQ4JUIzJUQ5JTg1JUQ5JThBJUQ4JUIxJTIyJTJDJTIyZSUyMiUzQSUyMjEwNDk4OSUyMiUyQyUyMm4lMjIlM0ElMjJNYWdkeSUyMFNhbWlyJTIyJTJDJTIydSUyMiUzQSUyMmVsc2F5ZWQubXMxJTIyJTdEJTJDJTdCJTIyZCUyMiUzQSUyMiVEOCVBNyVEOCVBRCVEOSU4NSVEOCVBRiUyMCVEOSU4OCVEOCVBRCVEOSU4QSVEOCVBRiUyMiUyQyUyMmUlMjIlM0ElMjIxMDU2MDclMjIlMkMlMjJuJTIyJTNBJTIyQWhtZWQlMjBXYWhlZWQlMjIlMkMlMjJ1JTIyJTNBJTIyZWx6ZWFpa3kuYXclMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ5JTg1JUQ4JUFEJUQ5JTg1JUQ5JTg4JUQ4JUFGJTIwJUQ5JTg3JUQ5JTg1JUQ4JUE3JUQ5JTg1JTIyJTJDJTIyZSUyMiUzQSUyMjEwNTU5MSUyMiUyQyUyMm4lMjIlM0ElMjJtYWhtb3VkJTIwaGFtYW0lMjIlMkMlMjJ1JTIyJTNBJTIyZWxzYXllZC5tbTQlMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ5JTg1JUQ4JUFEJUQ5JTg1JUQ4JUFGJTIwJUQ4JUE3JUQ5JTg0JUQ4JUE3JUQ5JTg2JUQ4JUI1JUQ4JUE3JUQ4JUIxJUQ5JTg5JTIyJTJDJTIyZSUyMiUzQSUyMjEwNTIyNSUyMiUyQyUyMm4lMjIlM0ElMjJNb2hhbWVkJTIwQWxhbnNhcmklMjIlMkMlMjJ1JTIyJTNBJTIyYWxhbnNhcmkubWglMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ5JTg1JUQ4JUFEJUQ5JTg1JUQ4JUFGJTIwJUQ4JUFDJUQ5JTg0JUQ4JUE3JUQ5JTg0JTIyJTJDJTIyZSUyMiUzQSUyMjEwNTEwMyUyMiUyQyUyMm4lMjIlM0ElMjJNb2hhbWVkJTIwZ2FsYWwlMjIlMkMlMjJ1JTIyJTNBJTIyTU9IQU1FRC5NRzQlMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ4JUE3JUQ4JUIzJUQ4JUE3JUQ5JTg1JUQ5JTg3JTIwJUQ4JUE3JUQ4JUFEJUQ5JTg1JUQ4JUFGJTIyJTJDJTIyZSUyMiUzQSUyMjEwMTgzOSUyMiUyQyUyMm4lMjIlM0ElMjJPc2FtYSUyMEFobWVkJTIyJTJDJTIydSUyMiUzQSUyMk1BSE1PVUQuT0ElMjIlN0QlMkMlN0IlMjJkJTIyJTNBJTIyJUQ5JTg1JUQ4JUFEJUQ5JTg1JUQ5JTg4JUQ4JUFGJTIwJUQ4JUE3JUQ5JTg0JUQ4JUFDJUQ5JTg2JUQ4JUFGJUQ5JTg5JTIyJTJDJTIyZSUyMiUzQSUyMjEwMTEyOSUyMiUyQyUyMm4lMjIlM0ElMjJBTEdFTkRJRS5NTSUyMiUyQyUyMnUlMjIlM0ElMjJBTEdFTkRJRS5NTSUyMiU3RCUyQyU3QiUyMmQlMjIlM0ElMjIlRDglQjklRDglQTglRDglQUYlRDglQTclRDklODQlRDklODQlRDklODclMjAlRDglQjElRDglQTclRDglQjQlRDglQUYlMjIlMkMlMjJlJTIyJTNBJTIyMTAyMzcwJTIyJTJDJTIybiUyMiUzQSUyMkFiZGFsbGFoJTIwUmFzaGVkJTIyJTJDJTIydSUyMiUzQSUyMnJhc2hlZC5hbTElMjIlN0QlNUQ=';

  const _P = 'JTVCJTdCJTIyYyUyMiUzQSUyMjEzMDAlMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUFDJUQ5JTg4JUQ4JUFGJUQ5JTg5JTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjQwODMlMjIlMkMlMjJuJTIyJTNBJTIyJUQ5JTgzJUQ4JUIxJUQ5JThBJUQ5JTg1JTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjExMTklMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ4JUE4JUQ5JTg2JTIwJUQ4JUE3JUQ5JTg0JUQ5JTg4JUQ5JTg0JUQ5JThBJUQ4JUFGJTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjYwNzklMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ5JTg2JUQ5JTg3JUQ4JUFDJTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjI1MjUlMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ5JTg2JUQ5JTgyJUQ4JUE3JUQ4JUExJTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjQwNjElMjIlMkMlMjJuJTIyJTNBJTIyJUQ5JTg1JUQ4JUFDJUQ4JUIyJUQ5JThBJUQ5JTg3JTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjc2MDclMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUFDJUQ4JUE3JUQ5JTg1JUQ4JUFEJTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjcxMTElMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUE3JUQ4JUIxJUQ4JUFBJUQ4JUE3JUQ5JTg0JTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjUwNzAlMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUI5JUQ4JUE3JUQ4JUFDJTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjIwOTUlMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUIzJUQ5JThBJUQ4JUIxJUQ5JTg3JTIyJTdEJTJDJTdCJTIyYyUyMiUzQSUyMjMwODAlMjIlMkMlMjJuJTIyJTNBJTIyJUQ4JUE3JUQ5JTg0JUQ4JUE4JUQ4JUE3JUQ4JUIyJTIyJTdEJTVE';

  const USERS     = decodeData(_U).map(u => ({ display:u.d, emp_id:u.e, emp_name:u.n, user_name:u.u }));
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
    @keyframes scPulse{0%,100%{opacity:1}50%{opacity:0.5}}

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
    #sc-submit{width:100%;padding:15px 20px;border:none;border-radius:14px;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,#059669,#10b981,#059669);background-size:200% auto;box-shadow:0 8px 24px rgba(16,185,129,0.25);transition:all 0.3s;letter-spacing:0.3px;display:flex;align-items:center;justify-content:center;gap:8px}
    #sc-submit:hover:not(:disabled){background-position:right center;box-shadow:0 12px 30px rgba(16,185,129,0.35);transform:translateY(-1px)}
    #sc-submit:disabled{opacity:0.7;cursor:not-allowed;transform:none}
    #sc-toast-wrap{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center}
    .sc-toast{padding:12px 22px;border-radius:12px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;direction:rtl;color:white;backdrop-filter:blur(12px);animation:scCard 0.3s cubic-bezier(0.16,1,0.3,1);white-space:nowrap;transition:opacity 0.3s}
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════
  // HTML
  // ═══════════════════════════════════════════
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
                <div id="sc-user-name">علي الباز (الأساسي)</div>
                <div id="sc-user-meta">ID: ••••••• &nbsp;|&nbsp; @••••••</div>
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

  // ═══════════════════════════════════════════
  // Toast
  // ═══════════════════════════════════════════
  function toast(msg, type = 'info') {
    let wrap = document.getElementById('sc-toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'sc-toast-wrap'; document.body.appendChild(wrap); }
    const colors = { success:'rgba(5,150,105,0.95)', error:'rgba(220,38,38,0.95)', warning:'rgba(217,119,6,0.95)', info:'rgba(15,23,42,0.95)' };
    const icons  = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = 'sc-toast';
    t.style.background = colors[type];
    t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3500);
  }

  // ═══════════════════════════════════════════
  // Preview — بيانات الموظف تظهر بس لما تختار
  // ═══════════════════════════════════════════
  function updatePreview(idx) {
    const u = USERS[idx];
    if (!u) return;
    document.getElementById('sc-user-avatar').textContent = u.display.trim().charAt(0);
    document.getElementById('sc-user-name').textContent   = u.display;
    document.getElementById('sc-user-meta').textContent   = `ID: ${u.emp_id}  |  @${u.user_name}`;
  }
  updatePreview(0);
  document.getElementById('ali_user_select').addEventListener('change', function() { updatePreview(parseInt(this.value)); });

  // Format Toggle
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
    if (ov) { ov.style.opacity='0'; ov.style.transition='opacity 0.25s'; }
    setTimeout(() => overlay.remove(), 260);
  }
  document.getElementById('sc-close').addEventListener('click', closePanel);
  document.getElementById('sc-overlay').addEventListener('mousedown', e => { if (e.target.id==='sc-overlay') closePanel(); });

  // ═══════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════
  document.getElementById('sc-submit').addEventListener('click', async function() {
    const btn = this;
    const userIndex   = parseInt(document.getElementById('ali_user_select').value);
    const selectedUser = USERS[userIndex];
    const rawStore    = document.getElementById('ali_new_store').value.trim();
    const format      = document.getElementById('ali_new_format').value;

    if (!rawStore) {
      const inp = document.getElementById('ali_new_store');
      inp.style.borderColor = 'rgba(239,68,68,0.6)';
      inp.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.1)';
      setTimeout(() => { inp.style.borderColor=''; inp.style.boxShadow=''; }, 2000);
      toast('أدخل كود أو اسم الصيدلية', 'warning');
      return;
    }

    const storeMatch = rawStore.match(/\d+/);
    const storeCode  = storeMatch ? storeMatch[0] : rawStore;

    const confirmed = await showConfirmDialog(selectedUser, storeCode, format);
    if (!confirmed) return;

    btn.disabled = true;
    btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:scSpin 0.8s linear infinite"></div> جاري التحديث...';

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
        toast('تم التحديث ✔ — إعادة تحميل تلقائية خلال ثانيتين...', 'success');

        setTimeout(() => {
          // 1. مسح sessionStorage و localStorage
          try { sessionStorage.clear(); } catch(e) {}
          try { localStorage.clear();   } catch(e) {}

          // 2. مسح كل الـ cookies الخاصة بالموقع
          document.cookie.split(';').forEach(c => {
            const key = c.trim().split('=')[0];
            if (key) document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
          });

          // 3. Hard reload يتجاوز الـ cache — بيضيف timestamp في الـ URL
          const cleanUrl = window.location.origin + window.location.pathname;
          window.location.href = cleanUrl + '?_reload=' + Date.now();
        }, 2000);

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

  document.getElementById('ali_new_store').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('sc-submit').click();
  });

  // ═══════════════════════════════════════════
  // Confirm Dialog
  // ═══════════════════════════════════════════
  function showConfirmDialog(user, storeCode, format) {
    return new Promise(resolve => {
      const pharmacy = PHARMACIES.find(p => p.code === storeCode);
      const pharmName = pharmacy ? pharmacy.name : '—';

      const dlg = document.createElement('div');
      dlg.style.cssText = 'position:fixed;inset:0;z-index:99999999;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,0.7);backdrop-filter:blur(16px);animation:scOverlay 0.2s ease;font-family:\'IBM Plex Sans Arabic\',sans-serif;';
      dlg.innerHTML = `
        <div style="width:360px;max-width:92vw;background:linear-gradient(160deg,#0f172a,#0a1020);border:1px solid rgba(99,179,237,0.1);border-radius:20px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.03);animation:scCard 0.35s cubic-bezier(0.16,1,0.3,1);direction:rtl;">

          <div style="padding:22px 24px 18px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;">
            <div style="width:56px;height:56px;margin:0 auto 14px;border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05));border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;">⚠️</div>
            <div style="font-size:17px;font-weight:800;color:#f1f5f9;margin-bottom:6px;">تأكيد تنفيذ الأمر</div>
            <div style="font-size:12px;color:#475569;font-weight:600;">تحقق من البيانات قبل المتابعة</div>
          </div>

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

            <div style="display:flex;gap:10px;">
              <button id="dlg-cancel" style="flex:1;padding:13px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);color:#64748b;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;transition:all 0.2s;">إلغاء</button>
              <button id="dlg-confirm" style="flex:2;padding:13px;border:none;border-radius:12px;background:linear-gradient(135deg,#059669,#10b981);color:white;font-size:14px;font-weight:800;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;box-shadow:0 4px 16px rgba(16,185,129,0.25);transition:all 0.2s;">✔ تأكيد التنفيذ</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(dlg);
      dlg.querySelector('#dlg-confirm').addEventListener('click', () => { dlg.remove(); resolve(true);  });
      dlg.querySelector('#dlg-cancel').addEventListener('click',  () => { dlg.remove(); resolve(false); });
      dlg.addEventListener('mousedown', e => { if (e.target === dlg) { dlg.remove(); resolve(false); } });
    });
  }

})();

javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_store_changer';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const USERS = [
    { display: "علي الباز (الأساسي)", emp_id: "101093", emp_name: "Ali Elbaz", user_name: "albaz.aa" },
    { display: "منصور البكرى", emp_id: "102599", emp_name: "ELBAKRI.MM", user_name: "ELBAKRI.MM" },
    { display: "محمد الشاطر", emp_id: "106023", emp_name: "ELSHATER.MA", user_name: "ELSHATER.MA" },
    { display: "محمد توفيق", emp_id: "106509", emp_name: "alfahad.mt", user_name: "alfahad.mt" },
    { display: "محمد زيدان", emp_id: "105143", emp_name: "Mohamed Zedan", user_name: "Zedan.MI" },
    { display: "اسامه السقا", emp_id: "105893", emp_name: "Osama Elsakka", user_name: "Elsakka.om" },
    { display: "مجدى سمير", emp_id: "104989", emp_name: "Magdy Samir", user_name: "elsayed.ms1" },
    { display: "احمد وحيد", emp_id: "105607", emp_name: "Ahmed Waheed", user_name: "elzeaiky.aw" },
    { display: "محمود همام", emp_id: "105591", emp_name: "mahmoud hamam", user_name: "elsayed.mm4" },
    { display: "محمد الانصارى", emp_id: "105225", emp_name: "Mohamed Alansari", user_name: "alansari.mh" },
    { display: "محمد جلال", emp_id: "105103", emp_name: "Mohamed galal", user_name: "MOHAMED.MG4" },
    { display: "اسامه احمد", emp_id: "101839", emp_name: "Osama Ahmed", user_name: "MAHMOUD.OA" },
    { display: "محمود الجندى", emp_id: "101129", emp_name: "ALGENDIE.MM", user_name: "ALGENDIE.MM" },
    { display: "عبدالله راشد", emp_id: "102370", emp_name: "Abdallah Rashed", user_name: "rashed.am1" }
  ];

  const PHARMACIES = [
    { code: "1300", name: "الجودى" }, { code: "4083", name: "كريم" }, { code: "1119", name: "ابن الوليد" },
    { code: "6079", name: "النهج" }, { code: "2525", name: "النقاء" }, { code: "4061", name: "مجزيه" },
    { code: "7607", name: "الجامح" }, { code: "7111", name: "الارتال" }, { code: "5070", name: "العاج" },
    { code: "2095", name: "السيره" }, { code: "3080", name: "الباز" }
  ];

  let usersHTML = ''; USERS.forEach((u, i) => usersHTML += `<option value="${i}">${u.display}</option>`);
  let pharmHTML = ''; PHARMACIES.forEach(p => pharmHTML += `<option value="${p.code} - ${p.name}">`);

  var styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliFadeBlur { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(6px); } }
    @keyframes aliDropIn { from { opacity: 0; transform: translate(-50%, -60%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    .ali-input-premium { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 14px; font-size: 15px; font-weight: 800; color: #1e293b; outline: none; box-sizing: border-box; background: #f8fafc; transition: all 0.3s; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .ali-input-premium:focus, .ali-input-premium:hover { border-color: #3b82f6; background: #ffffff; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1); }
    .ali-select-premium { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: left 16px top 50%; background-size: 12px auto; padding-left: 40px; }
  `;
  document.head.appendChild(styleEl);

  const overlay = document.createElement('div');
  overlay.id = PANEL_ID;
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.5);z-index:9999999;animation:aliFadeBlur 0.3s forwards;';
  
  overlay.innerHTML = `
    <div style="position:absolute;top:50%;left:50%;width:380px;background:#ffffff;border-radius:24px;box-shadow:0 25px 60px rgba(0,0,0,0.4);font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;animation:aliDropIn 0.4s forwards;">
      <div style="background:linear-gradient(135deg, #1e3a5f, #0f2744);padding:22px 24px;color:white;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-50%;right:-20%;width:150px;height:150px;background:radial-gradient(circle,rgba(59,130,246,0.2),transparent 70%);border-radius:50%;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:24px;">🎛️</span><h3 style="margin:0;font-size:18px;font-weight:900;">مُدير النظام المتقدم</h3></div>
          <span id="close_changer" style="cursor:pointer;background:rgba(239,68,68,0.2);color:#fca5a5;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:14px;font-weight:900;transition:all 0.2s;">✕</span>
        </div>
      </div>
      <div style="padding:24px;">
        <div style="margin-bottom:18px;">
          <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:800;color:#64748b;">👤 اختيار الحساب:</label>
          <select id="ali_user_select" class="ali-input-premium ali-select-premium" style="color:#1d4ed8;">${usersHTML}</select>
        </div>
        <div style="margin-bottom:18px;">
          <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:800;color:#64748b;">🏥 الصيدلية (الاسم أو الكود):</label>
          <input list="ali_pharmacies_list" type="text" id="ali_new_store" placeholder="مثلاً: 1300 أو الجودي" class="ali-input-premium" style="text-align:center;font-size:18px;letter-spacing:1px;color:#059669;">
          <datalist id="ali_pharmacies_list">${pharmHTML}</datalist>
        </div>
        <div style="margin-bottom:28px;">
          <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:800;color:#64748b;">⚙️ نوع بيئة العمل:</label>
          <select id="ali_new_format" class="ali-input-premium ali-select-premium"><option value="OCS" selected>OCS</option><option value="JSON">JSON</option></select>
        </div>
        <button id="ali_save_store" style="width:100%;padding:16px;background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;border-radius:16px;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.35);transition:all 0.3s;">🚀 تنفيذ التحديث</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('ali_new_store').focus();

  document.getElementById('close_changer').onclick = function() {
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 300);
  };

  overlay.addEventListener('mousedown', function(e) {
    if (e.target === overlay) document.getElementById('close_changer').click();
  });

  document.getElementById('ali_save_store').onclick = async function() {
    var btn = this;
    var userIndex = document.getElementById('ali_user_select').value;
    var selectedUser = USERS[userIndex];
    var rawStoreValue = document.getElementById('ali_new_store').value.trim();
    var format = document.getElementById('ali_new_format').value;

    if (!rawStoreValue) {
      document.getElementById('ali_new_store').style.borderColor = '#ef4444';
      return;
    }

    var storeMatch = rawStoreValue.match(/\d+/);
    var storeCode = storeMatch ? storeMatch[0] : rawStoreValue;

    btn.disabled = true;
    btn.innerHTML = '⏳ جاري التحديث بالخلفية...';
    btn.style.opacity = '0.9';

    try {
      var params = new URLSearchParams();
      params.append('emp_id', selectedUser.emp_id);
      params.append('emp_name', selectedUser.emp_name);
      params.append('user_name', selectedUser.user_name);
      params.append('storecode', storeCode);
      params.append('machine_format', format);

      var res = await fetch(window.location.origin + '/ez_pill_web/manageUsers/addNew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params
      });

      if (res.ok) {
        btn.innerHTML = '✅ تم! أغلق المتصفح لإنهاء الجلسة';
        btn.style.background = 'linear-gradient(135deg, #1e40af, #3b82f6)';
        sessionStorage.clear();
      } else {
        throw new Error('Server Error');
      }
    } catch (e) {
      btn.innerHTML = '❌ حدث خطأ، أعد المحاولة';
      btn.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
      setTimeout(function() { 
        btn.disabled = false; 
        btn.innerHTML = '🚀 تنفيذ التحديث'; 
        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)'; 
      }, 2500);
    }
  };

  document.getElementById('ali_new_store').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') document.getElementById('ali_save_store').click();
  });

})();

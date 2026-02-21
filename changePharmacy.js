javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // مُبدل الصيدليات السريع (EZ-Admin Switcher) - إصدار المستخدمين
  // المطور الأصلي: علي الباز
  // ═══════════════════════════════════════════════════════════════════

  const PANEL_ID = 'ali_store_changer';
  
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  // ─── قائمة المستخدمين ───
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

  // ─── قائمة الصيدليات ───
  const PHARMACIES = [
    { code: "1300", name: "الجودى" },
    { code: "4083", name: "كريم" },
    { code: "1119", name: "ابن الوليد" },
    { code: "6079", name: "النهج" },
    { code: "2525", name: "النقاء" },
    { code: "4061", name: "مجزيه" },
    { code: "7607", name: "الجامح" },
    { code: "7111", name: "الارتال" },
    { code: "5070", name: "العاج" },
    { code: "2095", name: "السيره" },
    { code: "3080", name: "الباز" }
  ];

  // تجهيز HTML للمستخدمين
  let usersHTML = '';
  USERS.forEach((user, index) => {
    usersHTML += `<option value="${index}">${user.display}</option>`;
  });

  // تجهيز HTML للصيدليات (Datalist الذكية)
  let pharmHTML = '';
  PHARMACIES.forEach(pharm => {
    pharmHTML += `<option value="${pharm.code} - ${pharm.name}">`;
  });

  // ─── CSS Animations ───
  var styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes aliZoomIn {
      from { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(styleEl);

  // ─── بناء النافذة ───
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:340px;background:#ffffff;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.3);z-index:9999999;font-family:"Segoe UI",Tahoma,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;border:1px solid #e2e8f0;animation:aliZoomIn 0.3s cubic-bezier(0.16,1,0.3,1);';

  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:16px 20px;color:white;display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0;font-size:16px;font-weight:900;">🔄 لوحة الإدارة السريعة</h3>
      <span id="close_changer" style="cursor:pointer;background:rgba(239,68,68,0.2);width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;font-weight:bold;transition:0.2s;">✕</span>
    </div>
    <div style="padding:20px 20px;">
      
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:700;color:#475569;">👤 اختيار المستخدم:</label>
        <select id="ali_user_select" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:bold;color:#1e40af;outline:none;box-sizing:border-box;background:#f8fafc;cursor:pointer;">
          ${usersHTML}
        </select>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:700;color:#475569;">🏥 الصيدلية (ابحث بالاسم أو الكود):</label>
        <input list="ali_pharmacies_list" type="text" id="ali_new_store" placeholder="مثال: 1300 أو الجودي" autocomplete="off" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:16px;text-align:center;font-weight:900;color:#3b82f6;outline:none;box-sizing:border-box;background:#f8fafc;">
        <datalist id="ali_pharmacies_list">
          ${pharmHTML}
        </datalist>
      </div>

      <div style="margin-bottom:24px;">
        <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:700;color:#475569;">⚙️ نوع الملف (Format):</label>
        <select id="ali_new_format" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:bold;color:#1e293b;outline:none;box-sizing:border-box;background:#f8fafc;cursor:pointer;">
          <option value="OCS" selected>OCS</option>
          <option value="JSON">JSON</option>
        </select>
      </div>
      
      <button id="ali_save_store" style="width:100%;padding:14px;background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.2s;">
        💾 حفظ الإعدادات
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('ali_new_store').focus();

  document.getElementById('close_changer').onclick = function() {
    panel.style.opacity = '0';
    panel.style.transform = 'translate(-50%, -45%) scale(0.95)';
    panel.style.transition = 'all 0.2s';
    setTimeout(function() { panel.remove(); }, 200);
  };

  document.getElementById('ali_save_store').onclick = async function() {
    var btn = this;
    var userIndex = document.getElementById('ali_user_select').value;
    var selectedUser = USERS[userIndex];
    
    var rawStoreValue = document.getElementById('ali_new_store').value.trim();
    var format = document.getElementById('ali_new_format').value;

    if (!rawStoreValue) {
      document.getElementById('ali_new_store').style.borderColor = '#ef4444';
      document.getElementById('ali_new_store').style.background = '#fef2f2';
      return;
    }

    // استخراج رقم الصيدلية فقط (حتى لو اختار "1300 - الجودي" هياخد 1300 بس)
    var storeMatch = rawStoreValue.match(/\d+/);
    var storeCode = storeMatch ? storeMatch[0] : rawStoreValue;

    btn.disabled = true;
    btn.innerHTML = '⏳ جاري الحفظ...';
    btn.style.opacity = '0.8';

    try {
      var params = new URLSearchParams();
      // سحب بيانات المستخدم المختار من القائمة المنسدلة
      params.append('emp_id', selectedUser.emp_id);
      params.append('emp_name', selectedUser.emp_name);
      params.append('user_name', selectedUser.user_name);
      params.append('storecode', storeCode);
      params.append('machine_format', format);

      var baseUrl = window.location.origin + '/ez_pill_web/manageUsers/addNew';

      var res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: params
      });

      if (res.ok) {
        btn.innerHTML = '✅ تم! اغلق المتصفح وافتحه';
        btn.style.background = 'linear-gradient(135deg,#1e40af,#3b82f6)';
        
        sessionStorage.clear();
        
        // إغلاق النافذة تلقائياً بعد 3 ثواني
        setTimeout(function() {
          if (document.getElementById(PANEL_ID)) {
             document.getElementById('close_changer').click();
          }
        }, 3000);

      } else {
        throw new Error('Server Error');
      }
    } catch (e) {
      btn.innerHTML = '❌ حدث خطأ، أعد المحاولة';
      btn.style.background = 'linear-gradient(135deg,#dc2626,#ef4444)';
      setTimeout(function() { 
        btn.disabled = false; 
        btn.innerHTML = '💾 حفظ الإعدادات'; 
        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)'; 
        btn.style.opacity = '1';
      }, 2000);
    }
  };

  document.getElementById('ali_new_store').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('ali_save_store').click();
    }
  });

})();

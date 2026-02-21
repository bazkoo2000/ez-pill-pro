javascript:(function(){
  'use strict';
  // ═══════════════════════════════════════════════════════════════════
  // مُبدل الصيدليات السريع (EZ-Switcher) - خاص بحساب: علي الباز
  // ═══════════════════════════════════════════════════════════════════

  const PANEL_ID = 'ali_store_changer';
  
  // إذا كانت النافذة مفتوحة، قم بإغلاقها
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
    return;
  }

  // ─── بيانات المستخدم الثابتة (من الـ Network) ───
  const USER_INFO = {
    emp_id: "101093",
    emp_name: "Ali Elbaz",
    user_name: "albaz.aa"
  };

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
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:320px;background:#ffffff;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.3);z-index:9999999;font-family:"Segoe UI",Tahoma,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;border:1px solid #e2e8f0;animation:aliZoomIn 0.3s cubic-bezier(0.16,1,0.3,1);';

  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:16px 20px;color:white;display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0;font-size:16px;font-weight:900;">🔄 تبديل الصيدلية السريع</h3>
      <span id="close_changer" style="cursor:pointer;background:rgba(239,68,68,0.2);width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;font-weight:bold;transition:0.2s;">✕</span>
    </div>
    <div style="padding:24px 20px;">
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:700;color:#475569;">🏥 كود الصيدلية الجديد:</label>
        <input type="text" id="ali_new_store" placeholder="مثال: 1300" autocomplete="off" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:18px;text-align:center;font-weight:900;color:#3b82f6;outline:none;box-sizing:border-box;background:#f8fafc;letter-spacing:2px;">
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block;margin-bottom:8px;font-size:13px;font-weight:700;color:#475569;">⚙️ نوع الملف (Format):</label>
        <select id="ali_new_format" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-weight:bold;color:#1e293b;outline:none;box-sizing:border-box;background:#f8fafc;cursor:pointer;">
          <option value="OCS" selected>OCS</option>
          <option value="JSON">JSON</option>
        </select>
      </div>
      <button id="ali_save_store" style="width:100%;padding:14px;background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.2s;">
        💾 حفظ وتحديث فوري
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // تركيز المؤشر تلقائياً داخل خانة الصيدلية
  document.getElementById('ali_new_store').focus();

  // إغلاق النافذة
  document.getElementById('close_changer').onclick = function() {
    panel.style.opacity = '0';
    panel.style.transform = 'translate(-50%, -45%) scale(0.95)';
    panel.style.transition = 'all 0.2s';
    setTimeout(function() { panel.remove(); }, 200);
  };

  // ─── دالة الحفظ وإرسال الـ API ───
  document.getElementById('ali_save_store').onclick = async function() {
    var btn = this;
    var storeCode = document.getElementById('ali_new_store').value.trim();
    var format = document.getElementById('ali_new_format').value;

    if (!storeCode) {
      document.getElementById('ali_new_store').style.borderColor = '#ef4444';
      document.getElementById('ali_new_store').style.background = '#fef2f2';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '⏳ جاري الحفظ...';
    btn.style.opacity = '0.8';

    try {
      // تجهيز البيانات بنفس الصيغة المطلوبة في الـ Network
      var params = new URLSearchParams();
      params.append('emp_id', USER_INFO.emp_id);
      params.append('emp_name', USER_INFO.emp_name);
      params.append('user_name', USER_INFO.user_name);
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
        btn.innerHTML = '✅ تم التغيير! جاري التحديث...';
        btn.style.background = 'linear-gradient(135deg,#1e40af,#3b82f6)';
        
        // السر هنا: تنظيف الكاش وإجبار المتصفح على جلب البيانات الجديدة
        sessionStorage.clear();
        localStorage.clear();
        
        setTimeout(function() {
          var cleanUrl = window.location.href.split('?')[0];
          window.location.replace(cleanUrl + '?refresh=' + new Date().getTime());
        }, 800);
      } else {
        throw new Error('Server Error');
      }
    } catch (e) {
      btn.innerHTML = '❌ حدث خطأ، أعد المحاولة';
      btn.style.background = 'linear-gradient(135deg,#dc2626,#ef4444)';
      setTimeout(function() { 
        btn.disabled = false; 
        btn.innerHTML = '💾 حفظ وتحديث فوري'; 
        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)'; 
        btn.style.opacity = '1';
      }, 2000);
    }
  };

  // دعم زر الـ Enter للحفظ السريع
  document.getElementById('ali_new_store').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('ali_save_store').click();
    }
  });

})();
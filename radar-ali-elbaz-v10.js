/**
 * Baz Radar V8.0 - التمشيط المحلي
 * نظام بحث متقدم للطلبات في أرشيف الصيدليات
 * 
 * @version 8.0
 * @author Ali Baz
 * @license MIT
 */

(function() {
    'use strict';
    
    const d = document;
    
    // إزالة النافذة القديمة إن وجدت
    if (d.getElementById('baz-ui')) {
        d.getElementById('baz-ui').remove();
    }
    if (d.getElementById('baz-overlay')) {
        d.getElementById('baz-overlay').remove();
    }
    
    // ====================================
    // إضافة الأنماط (Styles)
    // ====================================
    const styles = d.createElement('style');
    styles.innerHTML = `
        /* الخلفية الشفافة */
        #baz-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999998;
            backdrop-filter: blur(3px);
        }
        
        /* نافذة الحوار الرئيسية */
        #baz-ui {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 95%;
            max-width: 900px;
            background: #fff;
            z-index: 999999;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.4);
            direction: rtl;
            font-family: sans-serif;
            max-height: 85vh;
            overflow: auto;
            border-top: 10px solid #1a73e8;
        }
        
        /* رأس النافذة */
        #baz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        #baz-header h2 {
            margin: 0;
            color: #1a73e8;
            font-size: 24px;
        }
        
        /* حاوية البحث */
        .search-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            border: 1px solid #eee;
        }
        
        /* البادئة (Prefix) */
        .prefix {
            background: #1a73e8;
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            font-weight: bold;
            min-width: 45px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* حقول الإدخال */
        input {
            flex: 1;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }
        
        input:focus {
            border-color: #1a73e8;
        }
        
        /* شريط التقدم */
        .progress-wrap {
            width: 100%;
            background: #eee;
            border-radius: 10px;
            height: 12px;
            margin: 15px 0;
            display: none;
            overflow: hidden;
        }
        
        .progress-bar {
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #34a853, #1a73e8);
            transition: width 0.2s;
        }
        
        /* الأزرار */
        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        /* الجدول */
        #baz-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        
        #baz-table th {
            background: #f1f3f4;
            color: #1a73e8;
            padding: 12px;
            border-bottom: 2px solid #1a73e8;
            position: sticky;
            top: 0;
            font-weight: bold;
        }
        
        #baz-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: center;
        }
        
        #baz-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* رسالة الحالة */
        #baz-st {
            text-align: center;
            margin: 10px 0;
            font-weight: bold;
            color: #1a73e8;
            font-size: 16px;
        }
    `;
    d.head.appendChild(styles);
    
    // ====================================
    // إنشاء الخلفية الشفافة
    // ====================================
    const overlay = d.createElement('div');
    overlay.id = 'baz-overlay';
    overlay.onclick = function() {
        this.remove();
        d.getElementById('baz-ui').remove();
    };
    d.body.appendChild(overlay);
    
    // ====================================
    // إنشاء نافذة الحوار
    // ====================================
    const ui = d.createElement('div');
    ui.id = 'baz-ui';
    ui.innerHTML = `
        <div id="baz-header">
            <h2>🚀 رادار علي الباز V8.0 - التمشيط المحلي</h2>
            <button class="btn" style="background:#f44336;color:#fff" onclick="document.getElementById('baz-overlay').remove();this.parentElement.parentElement.remove()">
                ✕
            </button>
        </div>
        
        <div class="search-container">
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-weight:bold;color:#1a73e8">كود الصيدلية:</label>
                <div style="display:flex;gap:5px">
                    <span class="prefix">0</span>
                    <input type="text" id="baz-store" placeholder="مثلاً: 1300" maxlength="4">
                </div>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-weight:bold;color:#1a73e8">رقم الطلب:</label>
                <div style="display:flex;gap:5px">
                    <span class="prefix">ERX</span>
                    <input type="text" id="baz-order" placeholder="الأرقام فقط...">
                </div>
            </div>
            
            <button id="baz-run" class="btn" style="background:#34a853;color:#fff;grid-column:span 2;margin-top:10px">
                بدء المسح الشامل 📡
            </button>
        </div>
        
        <div id="baz-p-wrap" class="progress-wrap">
            <div id="baz-p-bar" class="progress-bar"></div>
        </div>
        
        <div id="baz-st"></div>
        
        <button id="baz-all" class="btn" style="background:#1a73e8;color:#fff;width:100%;display:none;margin-bottom:10px">
            🔓 فتح كافة النتائج المكتشفة
        </button>
        
        <div id="baz-res"></div>
    `;
    d.body.appendChild(ui);
    
    // ====================================
    // المتغيرات العامة
    // ====================================
    let links = [];
    const API_BASE = 'https://rtlapps.nahdi.sa/ez_pill_web/';
    
    // ====================================
    // دالة البحث الرئيسية
    // ====================================
    const runSearch = async () => {
        const storeValue = d.getElementById('baz-store').value.trim();
        const orderValue = d.getElementById('baz-order').value.trim();
        
        // التحقق من وجود قيمة للبحث
        if (!storeValue && !orderValue) {
            alert('⚠️ يرجى إدخال كود الصيدلية أو رقم الطلب');
            return;
        }
        
        const searchQuery = orderValue ? 'ERX' + orderValue : '0' + storeValue;
        
        // عناصر الواجهة
        const statusElement = d.getElementById('baz-st');
        const resultsElement = d.getElementById('baz-res');
        const progressBar = d.getElementById('baz-p-bar');
        const progressWrap = d.getElementById('baz-p-wrap');
        const openAllBtn = d.getElementById('baz-all');
        
        // إعادة تعيين الواجهة
        resultsElement.innerHTML = '';
        progressWrap.style.display = 'block';
        openAllBtn.style.display = 'none';
        links = [];
        
        let foundCount = 0;
        const seenInvoices = new Set();
        
        try {
            statusElement.innerHTML = '📡 جاري فحص الأرشيف...';
            
            // جلب العدد الإجمالي للصفحات
            const initialRequest = await fetch(API_BASE + 'Home/getOrders', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    status: 'readypack',
                    pageSelected: 1,
                    searchby: ''
                })
            });
            
            const initialResponse = await initialRequest.json();
            const totalPages = Math.ceil((initialResponse.total_orders || 0) / 10) || 30;
            
            // البحث في كل صفحة
            for (let page = 1; page <= totalPages; page++) {
                // تحديث شريط التقدم
                progressBar.style.width = (page / totalPages * 100) + '%';
                statusElement.innerHTML = `🔍 فحص صفحة ${page} من ${totalPages}... (وجدنا: ${foundCount})`;
                
                // جلب بيانات الصفحة الحالية
                const pageRequest = await fetch(API_BASE + 'Home/getOrders', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        status: 'readypack',
                        pageSelected: page,
                        searchby: ''
                    })
                });
                
                const pageResponse = await pageRequest.json();
                const orders = JSON.parse(pageResponse.orders_list);
                
                // التحقق من وجود طلبات
                if (!orders || orders.length === 0) break;
                
                // البحث عن التطابقات
                const matches = orders.filter(order => 
                    (order.Invoice || '').includes(searchQuery) || 
                    (order.onlineNumber || '').includes(searchQuery)
                );
                
                // معالجة النتائج المطابقة
                if (matches.length > 0) {
                    // إنشاء الجدول إذا لم يكن موجوداً
                    if (!d.getElementById('baz-table')) {
                        resultsElement.innerHTML = `
                            <table id="baz-table">
                                <thead>
                                    <tr>
                                        <th>الطلب</th>
                                        <th>العميل</th>
                                        <th>الفاتورة</th>
                                        <th>فتح</th>
                                    </tr>
                                </thead>
                                <tbody id="baz-tb"></tbody>
                            </table>
                        `;
                    }
                    
                    // إضافة كل نتيجة إلى الجدول
                    matches.forEach(order => {
                        if (!seenInvoices.has(order.Invoice)) {
                            seenInvoices.add(order.Invoice);
                            foundCount++;
                            
                            const detailsUrl = API_BASE + `getEZPill_Details?onlineNumber=${order.onlineNumber.replace(/ERX/gi, '')}&Invoice=${order.Invoice}&typee=${order.typee}&head_id=${order.head_id}`;
                            links.push(detailsUrl);
                            
                            const row = d.getElementById('baz-tb').insertRow(-1);
                            row.innerHTML = `
                                <td><b>${order.onlineNumber}</b></td>
                                <td>${order.guestName}</td>
                                <td>${order.Invoice}</td>
                                <td><a href="${detailsUrl}" target="_blank" style="color:#34a853;font-weight:bold">فتح ✅</a></td>
                            `;
                        }
                    });
                }
            }
            
        } catch (error) {
            console.error('خطأ في البحث:', error);
            statusElement.innerHTML = '❌ خطأ في الاتصال بالخادم';
        }
        
        // إخفاء شريط التقدم
        progressWrap.style.display = 'none';
        
        // عرض النتيجة النهائية
        if (foundCount > 0) {
            statusElement.innerHTML = `✅ اكتمل التمشيط! وجدنا (${foundCount}) نتيجة لـ "${searchQuery}"`;
            openAllBtn.style.display = 'block';
        } else {
            statusElement.innerHTML = `❌ لم نجد نتائج لـ "${searchQuery}"`;
        }
    };
    
    // ====================================
    // دالة فتح جميع الروابط
    // ====================================
    const openAllLinks = async () => {
        if (confirm(`هل تريد فتح ${links.length} صفحة بتتابع ثانية واحدة؟`)) {
            for (let i = 0; i < links.length; i++) {
                d.getElementById('baz-st').innerHTML = `🚀 فتح (${i + 1} من ${links.length})...`;
                window.open(links[i], '_blank');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            d.getElementById('baz-st').innerHTML = '✅ تم فتح جميع الصفحات';
        }
    };
    
    // ====================================
    // ربط الأحداث (Event Listeners)
    // ====================================
    d.getElementById('baz-run').onclick = runSearch;
    d.getElementById('baz-all').onclick = openAllLinks;
    
    // البحث عند الضغط على Enter
    d.querySelectorAll('input').forEach(input => {
        input.onkeypress = (event) => {
            if (event.key === 'Enter') {
                runSearch();
            }
        };
    });
    
})();

javascript:(function () {
    /* ═══════════════════════════════════════════════════════
     * مجمّع النتائج الشامل — المطور علي الباز V12.0
     * جلب كافة النتائج من جميع الصفحات في جدول واحد
     * ═══════════════════════════════════════════════════════ */

    var existingUI = document.getElementById('radar-ui');
    if (existingUI) existingUI.remove();
    var existingStyle = document.getElementById('radar-styles');
    if (existingStyle) existingStyle.remove();

    var BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
    var READY_STATUSES = ['readypack'];
    var ALL_STATUSES = ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];
    var FETCH_TIMEOUT_MS = 15000;
    var TAB_OPEN_DELAY_MS = 800; /* تسريع فتح التابات قليلاً */

    var collectedLinks = [];
    var isSearching = false;

    var styleElement = document.createElement('style');
    styleElement.id = 'radar-styles';
    styleElement.textContent = '#radar-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:900px;background:rgba(255,255,255,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.6);border-radius:28px;z-index:999999;box-shadow:0 25px 80px rgba(0,0,0,0.18);direction:rtl;font-family:Segoe UI,Tahoma,sans-serif;max-height:92vh;overflow:hidden;box-sizing:border-box;animation:radarIn .4s cubic-bezier(0.16, 1, 0.3, 1)}@keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.radar-header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px;background:rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.06)}.radar-logo{width:42px;height:42px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 14px rgba(59,130,246,0.3)}.radar-body{padding:24px;overflow:auto;max-height:calc(92vh - 85px)}.radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}.radar-input-wrap{display:flex;border:2px solid rgba(0,0,0,0.08);border-radius:14px;overflow:hidden;background:#fff;transition:0.3s}.radar-input-wrap:focus-within{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,0.1)}.radar-prefix{padding:12px 15px;background:#3b82f6;color:#fff;font-weight:900;font-size:14px}.radar-input{flex:1;border:none;padding:12px;outline:none;font-size:15px;font-weight:600}.radar-mode-btn{flex:1;padding:14px;border-radius:14px;border:1.5px solid rgba(0,0,0,0.06);background:#f8fafc;cursor:pointer;font-weight:bold;color:#64748b;transition:0.3s}.radar-mode-btn.active{background:rgba(59,130,246,0.12);border-color:#3b82f6;color:#3b82f6}.radar-start{grid-column:span 2;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 8px 25px rgba(59,130,246,0.35);transition:0.3s}.radar-start:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(59,130,246,0.45)}.radar-progress-wrap{height:8px;border-radius:10px;background:#eee;overflow:hidden;margin-bottom:15px;display:none}.radar-progress-bar{width:0%;height:100%;background:linear-gradient(90deg,#3b82f6,#34a853);transition:width 0.3s}#radar-table{width:100%;border-collapse:separate;border-spacing:0 8px}#radar-table th{color:#94a3b8;font-size:12px;padding:12px;text-transform:uppercase;letter-spacing:1px}#radar-table td{background:#fff;padding:15px;text-align:center;border-radius:12px;font-size:14px;color:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,0.03)}';
    document.head.appendChild(styleElement);

    var ui = document.createElement('div');
    ui.id = 'radar-ui';
    ui.innerHTML = `<div class="radar-header"><div style="display:flex;gap:15px;align-items:center"><div class="radar-logo">📡</div><div><h2 style="margin:0">مجمّع النتائج الذكي</h2><div style="font-size:11px;color:#64748b;font-weight:bold">إصدار التجميع — علي الباز V12.0</div></div></div><button id="radar-close" style="border:none;background:none;cursor:pointer;font-size:22px;color:#94a3b8">✕</button></div>
    <div class="radar-body">
        <div class="radar-grid">
            <div class="radar-field"><label style="font-weight:800;font-size:12px;color:#475569">كود الصيدلية / الفاتورة</label><div class="radar-input-wrap"><span class="radar-prefix">0</span><input class="radar-input" id="radar-store" placeholder="مثلاً: 1300"></div></div>
            <div class="radar-field"><label style="font-weight:800;font-size:12px;color:#475569">رقم الطلب (ERX)</label><div class="radar-input-wrap"><span class="radar-prefix">ERX</span><input class="radar-input" id="radar-order" placeholder="الأرقام فقط..."></div></div>
            <div class="radar-modes" style="grid-column:span 2;display:flex;gap:12px"><button class="radar-mode-btn active" data-mode="ready">Ready to Pack (تجميع كامل)</button><button class="radar-mode-btn" data-mode="all">بحث شامل في كافة الحالات</button></div>
            <button class="radar-start" id="radar-start">بدء تجميع كافة الطلبات 🚀</button>
            <button class="radar-start" id="radar-cancel" style="background:#ef4444;display:none">إيقاف التجميع ⏹</button>
        </div>
        <div class="radar-progress-wrap" id="radar-progress-wrap"><div class="radar-progress-bar" id="radar-progress-bar"></div></div>
        <div id="radar-status" style="text-align:center;margin-bottom:15px;font-weight:800;color:#3b82f6;font-size:15px"></div>
        <div id="radar-action-row" style="display:none;gap:10px;margin-bottom:20px"><button class="radar-mode-btn active" id="radar-open-all" style="background:#3b82f6;color:#fff;border:none">فتح كافة الطلبات المجمّعة</button></div>
        <div id="radar-results"></div>
    </div>`;
    document.body.appendChild(ui);

    /* Actions */
    document.getElementById('radar-close').onclick = () => { isSearching = false; ui.remove(); };
    document.querySelectorAll('.radar-mode-btn[data-mode]').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.radar-mode-btn[data-mode]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    document.getElementById('radar-start').onclick = startSearch;
    document.getElementById('radar-cancel').onclick = () => { isSearching = false; };
    document.getElementById('radar-open-all').onclick = openAllResults;

    var STATUS_MAP = { readypack: 'جاهز للتعبئة', packed: 'تم التعبئة', delivered: 'تم التسليم', new: 'طلب جديد', canceled: 'ملغى' };

    async function startSearch() {
        if (isSearching) return;
        var sv = document.getElementById('radar-store').value.trim();
        var ov = document.getElementById('radar-order').value.trim();
        if (!sv && !ov) return;
        
        var mode = document.querySelector('.radar-mode-btn.active').dataset.mode;
        var query = ov ? 'ERX' + ov : '0' + sv;
        var statuses = mode === 'ready' ? READY_STATUSES : ALL_STATUSES;
        
        isSearching = true; collectedLinks = []; 
        document.getElementById('radar-results').innerHTML = ''; 
        document.getElementById('radar-action-row').style.display = 'none';
        document.getElementById('radar-progress-wrap').style.display = 'block';
        document.getElementById('radar-start').style.display = 'none';
        document.getElementById('radar-cancel').style.display = 'block';

        var count = 0, seen = new Set();

        try {
            for (var si = 0; si < statuses.length; si++) {
                if (!isSearching) break;
                var st = statuses[si];
                
                /* الخطوة 1: معرفة إجمالي الطلبات في هذه الحالة */
                var first = await fetch(BASE_URL + 'Home/getOrders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: st, pageSelected: 1, searchby: '' })
                });
                var firstData = await first.json();
                var totalRecords = firstData.total_orders || 0;
                var totalPages = Math.ceil(totalRecords / 10) || 1;
                
                /* الخطوة 2: التمشيط عبر كافة الصفحات */
                for (var p = 1; p <= totalPages; p++) {
                    if (!isSearching) break;
                    
                    document.getElementById('radar-status').textContent = `🔄 تجميع [${STATUS_MAP[st] || st}]: صفحة ${p} من ${totalPages}...`;
                    document.getElementById('radar-progress-bar').style.width = ((si / statuses.length) + (p / totalPages / statuses.length)) * 100 + '%';

                    var resp = (p === 1) ? firstData : await (await fetch(BASE_URL + 'Home/getOrders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: st, pageSelected: p, searchby: '' })
                    })).json();
                    
                    var list = [];
                    try { list = JSON.parse(resp.orders_list); } catch(e) { list = []; }
                    if (!list || list.length === 0) break;

                    var matches = list.filter(o => (String(o.Invoice || '')).includes(query) || (String(o.onlineNumber || '')).includes(query));
                    if (matches.length) {
                        ensureTable();
                        matches.forEach(o => {
                            if (seen.has(o.Invoice)) return;
                            seen.add(o.Invoice); count++;
                            var url = BASE_URL + `getEZPill_Details?onlineNumber=${String(o.onlineNumber).replace(/ERX/gi,'')}&Invoice=${o.Invoice}&typee=${o.typee}&head_id=${o.head_id}`;
                            collectedLinks.push(url);
                            addRow(o, url, count);
                        });
                    }
                }
            }
        } catch (e) { document.getElementById('radar-status').textContent = '❌ خطأ في الاتصال بالسيرفر'; }
        
        isSearching = false;
        document.getElementById('radar-start').style.display = 'block';
        document.getElementById('radar-cancel').style.display = 'none';
        document.getElementById('radar-progress-wrap').style.display = 'none';

        if (count > 0) {
            document.getElementById('radar-status').textContent = `✅ اكتمل التجميع! تم حصر (${count}) طلب في مكان واحد`;
            document.getElementById('radar-action-row').style.display = 'flex';
        } else {
            document.getElementById('radar-status').textContent = `❌ لم نجد أي طلبات مطابقة لـ "${query}"`;
        }
    }

    function ensureTable() {
        if (document.getElementById('radar-table')) return;
        document.getElementById('radar-results').innerHTML = '<table id="radar-table"><thead><tr><th>#</th><th>رقم الطلب</th><th>اسم العميل</th><th>الفاتورة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody id="radar-tbody"></tbody></table>';
    }

    function addRow(o, url, idx) {
        var tb = document.getElementById('radar-tbody');
        var r = tb.insertRow(-1);
        r.innerHTML = `<td>${idx}</td><td><b>${o.onlineNumber}</b></td><td>${o.guestName}</td><td>${o.Invoice}</td><td><span style="padding:4px 10px;background:#e0f2fe;color:#0369a1;border-radius:10px;font-size:11px;font-weight:bold">${STATUS_MAP[String(o.status).toLowerCase()] || o.status}</span></td><td><a href="${url}" target="_blank" style="text-decoration:none;color:#fff;background:#3b82f6;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:bold">فتح ✅</a></td>`;
    }

    async function openAllResults() {
        if (!confirm(`فتح ${collectedLinks.length} تابات بتتابع هادئ؟`)) return;
        for (var i = 0; i < collectedLinks.length; i++) {
            window.open(collectedLinks[i], '_blank');
            await new Promise(r => setTimeout(r, TAB_OPEN_DELAY_MS));
        }
    }
})();

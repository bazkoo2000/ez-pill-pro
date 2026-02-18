javascript:(function () {
    /* ═══════════════════════════════════════════════════════
     * نظام البحث الذكي — المطور علي الباز V11.0
     * إصلاح مشكلة الصفحات + Light Glassmorphism
     * ═══════════════════════════════════════════════════════ */

    var existingUI = document.getElementById('radar-ui');
    if (existingUI) existingUI.remove();
    var existingStyle = document.getElementById('radar-styles');
    if (existingStyle) existingStyle.remove();

    var BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
    var READY_STATUSES = ['readypack'];
    var ALL_STATUSES = ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];
    var MAX_PAGES_LIMIT = 40; /* زيادة الحد لضمان عدم ضياع أي طلب */
    var FETCH_TIMEOUT_MS = 20000;
    var TAB_OPEN_DELAY_MS = 1000;

    var collectedLinks = [];
    var currentAbortController = null;
    var isSearching = false;

    var styleElement = document.createElement('style');
    styleElement.id = 'radar-styles';
    styleElement.textContent = '#radar-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.85);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.5);border-radius:24px;z-index:999999;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.1);direction:rtl;font-family:Segoe UI,Tahoma,sans-serif;max-height:90vh;box-sizing:border-box;animation:radarIn .4s ease-out}@keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.radar-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.05)}.radar-logo{width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(59,130,246,0.2)}.radar-body{padding:24px;overflow:auto;max-height:calc(90vh - 80px)}.radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.radar-input-wrap{display:flex;border:1.5px solid rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;background:#fff;margin-top:8px}.radar-prefix{padding:12px;background:#3b82f6;color:#fff;font-weight:bold;min-width:45px;text-align:center}.radar-input{flex:1;border:none;padding:12px;outline:none;font-size:14px}.radar-mode-btn{flex:1;padding:12px;border-radius:12px;border:1.5px solid rgba(0,0,0,0.06);background:#f8fafc;cursor:pointer;font-weight:bold;color:#64748b;transition:0.3s}.radar-mode-btn.active{background:rgba(59,130,246,0.1);border-color:#3b82f6;color:#3b82f6}.radar-start{grid-column:span 2;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:bold;cursor:pointer;margin-top:10px;box-shadow:0 4px 15px rgba(59,130,246,0.3)}.radar-progress-wrap{margin-top:20px;height:8px;border-radius:10px;background:#eee;overflow:hidden;display:none}.radar-progress-bar{width:0%;height:100%;background:#34a853;transition:width 0.3s}#radar-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:15px}#radar-table th{color:#64748b;font-size:12px;padding:10px}#radar-table td{background:#fff;padding:12px;text-align:center;border-radius:8px;font-size:13px;box-shadow:0 2px 5px rgba(0,0,0,0.02)}.radar-badge{padding:4px 10px;border-radius:15px;background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:bold}.radar-open-link{text-decoration:none;color:#fff;background:#3b82f6;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:bold}';
    document.head.appendChild(styleElement);

    var ui = document.createElement('div');
    ui.id = 'radar-ui';
    ui.innerHTML = `<div class="radar-header"><div class="radar-title-area" style="display:flex;gap:12px;align-items:center"><div class="radar-logo">📡</div><div><h2 style="margin:0">نظام البحث الذكي</h2><div style="font-size:11px;color:#64748b">بواسطة: علي الباز V11.0</div></div></div><div class="radar-actions"><button id="radar-close" style="border:none;background:none;cursor:pointer;font-size:18px;color:#94a3b8">✕</button></div></div>
    <div class="radar-body">
        <div class="radar-grid">
            <div class="radar-field"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الفاتورة / الصيدلية</label><div class="radar-input-wrap"><span class="radar-prefix">0</span><input class="radar-input" id="radar-store" placeholder="كود الصيدلية..."></div></div>
            <div class="radar-field"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الطلب</label><div class="radar-input-wrap"><span class="radar-prefix">ERX</span><input class="radar-input" id="radar-order" placeholder="الأرقام فقط..."></div></div>
            <div class="radar-modes" style="grid-column:span 2;display:flex;gap:10px"><button class="radar-mode-btn active" data-mode="ready">Ready to Pack</button><button class="radar-mode-btn" data-mode="all">بحث في كافة الحالات</button></div>
            <button class="radar-start" id="radar-start">بدء التمشيط الذكي 📡</button>
            <button class="radar-start" id="radar-cancel" style="background:#ef4444;display:none">إيقاف المسح ⏹</button>
        </div>
        <div class="radar-progress-wrap" id="radar-progress-wrap"><div class="radar-progress-bar" id="radar-progress-bar"></div></div>
        <div id="radar-status" style="text-align:center;margin:15px 0;font-weight:bold;color:#3b82f6"></div>
        <div id="radar-action-row" style="display:none;gap:10px;margin-bottom:15px"><button class="radar-mode-btn active" id="radar-open-all">فتح كافة النتائج</button><button class="radar-mode-btn" id="radar-export" style="border-color:#f97316;color:#f97316">تصدير CSV</button></div>
        <div id="radar-results"></div>
    </div>`;
    document.body.appendChild(ui);

    /* الأحداث (Events) */
    document.getElementById('radar-close').onclick = () => { cancelSearch(); ui.remove(); };
    document.querySelectorAll('.radar-mode-btn[data-mode]').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.radar-mode-btn[data-mode]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    document.getElementById('radar-start').onclick = startSearch;
    document.getElementById('radar-cancel').onclick = cancelSearch;
    document.getElementById('radar-open-all').onclick = openAllResults;
    document.getElementById('radar-export').onclick = exportCSV;

    var STATUS_MAP = { readypack: 'جاهز', packed: 'معبأ', delivered: 'تم التسليم', new: 'جديد', canceled: 'ملغى' };

    function setStatus(t) { document.getElementById('radar-status').textContent = t; }
    function setProgress(p) { document.getElementById('radar-progress-bar').style.width = p + '%'; }
    function cancelSearch() { isSearching = false; toggleUI(false); setStatus('⏹ تم إيقاف المسح'); }
    function toggleUI(s) {
        document.getElementById('radar-start').style.display = s ? 'none' : '';
        document.getElementById('radar-cancel').style.display = s ? 'block' : 'none';
        document.getElementById('radar-progress-wrap').style.display = s ? 'block' : 'none';
    }

    async function startSearch() {
        if (isSearching) return;
        var sv = document.getElementById('radar-store').value.trim();
        var ov = document.getElementById('radar-order').value.trim();
        if (!sv && !ov) { setStatus('⚠️ يرجى إدخال بيانات للبحث'); return; }
        
        var mode = document.querySelector('.radar-mode-btn.active').dataset.mode;
        var query = ov ? 'ERX' + ov : '0' + sv;
        var statuses = mode === 'ready' ? READY_STATUSES : ALL_STATUSES;
        
        isSearching = true; collectedLinks = []; 
        document.getElementById('radar-results').innerHTML = ''; 
        document.getElementById('radar-action-row').style.display = 'none';
        toggleUI(true); setProgress(0);
        
        var count = 0, seen = new Set();

        try {
            for (var si = 0; si < statuses.length; si++) {
                if (!isSearching) break;
                var st = statuses[si];
                
                /* منطق الصفحات الجديد: البحث حتى الصفحة 40 أو حتى تفرغ النتائج */
                for (var p = 1; p <= MAX_PAGES_LIMIT; p++) {
                    if (!isSearching) break;
                    
                    setStatus(`🔍 [${STATUS_MAP[st] || st}] - فحص صفحة ${p}... (وجدنا: ${count})`);
                    setProgress(((si / statuses.length) + (p / MAX_PAGES_LIMIT / statuses.length)) * 100);

                    var resp = await fetch(BASE_URL + 'Home/getOrders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: st, pageSelected: p, searchby: '' })
                    });
                    
                    var data = await resp.json();
                    var list = [];
                    try { list = JSON.parse(data.orders_list); } catch(e) { list = []; }
                    
                    if (!list || list.length === 0) break; /* إذا الصفحة فاضية، انقل للحالة اللي بعدها */

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
                    
                    /* إذا الصفحة فيها أقل من 10 طلبات، معناها دي آخر صفحة في الحالة دي */
                    if (list.length < 10) break; 
                }
            }
        } catch (e) { setStatus('❌ خطأ في الاتصال: ' + e.message); }
        
        isSearching = false; toggleUI(false); setProgress(100);
        if (count > 0) {
            setStatus(`✅ اكتمل البحث! وجدنا (${count}) نتيجة`);
            document.getElementById('radar-action-row').style.display = 'flex';
        } else {
            setStatus(`❌ لم نجد نتائج لـ "${query}"`);
        }
    }

    function ensureTable() {
        if (document.getElementById('radar-table')) return;
        var res = document.getElementById('radar-results');
        res.innerHTML = '<table id="radar-table"><thead><tr><th>#</th><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody id="radar-tbody"></tbody></table>';
    }

    function addRow(o, url, idx) {
        var tb = document.getElementById('radar-tbody');
        var r = tb.insertRow(-1);
        r.innerHTML = `<td>${idx}</td><td><b>${o.onlineNumber}</b></td><td>${o.guestName}</td><td>${o.Invoice}</td><td><span class="radar-badge">${STATUS_MAP[String(o.status).toLowerCase()] || o.status}</span></td><td><a href="${url}" target="_blank" class="radar-open-link">فتح ✅</a></td>`;
    }

    async function openAllResults() {
        if (!confirm(`فتح ${collectedLinks.length} طلب بتتابع ثانية واحدة؟`)) return;
        for (var i = 0; i < collectedLinks.length; i++) {
            window.open(collectedLinks[i], '_blank');
            await new Promise(r => setTimeout(r, TAB_OPEN_DELAY_MS));
        }
    }

    function exportCSV() {
        var rows = [['#', 'Order Number', 'Guest Name', 'Invoice', 'Status']];
        document.querySelectorAll('#radar-table tbody tr').forEach(tr => {
            var cols = [];
            tr.querySelectorAll('td').forEach((td, i) => { if(i < 5) cols.push(td.innerText); });
            rows.push(cols);
        });
        var csv = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Nahdi_Search_${new Date().toLocaleDateString()}.csv`;
        link.click();
    }
})();

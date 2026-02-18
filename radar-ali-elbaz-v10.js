javascript:(function () {
    /* ═══════════════════════════════════════════════════════
     * رادار علي الباز المكتمل — الإصدار الذهبي V14.0
     * دمج محرك V9 القوي مع تصميم V10 الزجاجي
     * ═══════════════════════════════════════════════════════ */

    var existingUI = document.getElementById('radar-ui');
    if (existingUI) existingUI.remove();
    var existingStyle = document.getElementById('radar-styles');
    if (existingStyle) existingStyle.remove();

    var BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
    var READY_STATUSES = ['readypack'];
    var ALL_STATUSES = ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];
    var TAB_OPEN_DELAY_MS = 1000;

    var collectedLinks = [];
    var isSearching = false;

    var styleElement = document.createElement('style');
    styleElement.id = 'radar-styles';
    styleElement.textContent = `
        #radar-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.85);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.5);border-radius:24px;z-index:999999;box-shadow:0 20px 60px rgba(0,0,0,0.15);direction:rtl;font-family:Segoe UI,Tahoma,sans-serif;max-height:90vh;overflow:hidden;animation:radarIn .4s ease-out}
        @keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .radar-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.05)}
        .radar-logo{width:42px;height:42px;background:linear-gradient(135deg,#3b82f6,#10b981);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(59,130,246,0.2)}
        .radar-body{padding:24px;overflow:auto;max-height:calc(90vh - 85px)}
        .radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .radar-input-wrap{display:flex;border:1.5px solid rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;background:#fff;margin-top:8px}
        .radar-prefix{padding:12px;background:#3b82f6;color:#fff;font-weight:bold;min-width:45px;text-align:center}
        .radar-input{flex:1;border:none;padding:12px;outline:none;font-size:14px;font-weight:600}
        .radar-mode-btn{flex:1;padding:12px;border-radius:12px;border:1.5px solid rgba(0,0,0,0.06);background:#f8fafc;cursor:pointer;font-weight:bold;color:#64748b;transition:0.3s}
        .radar-mode-btn.active{background:rgba(59,130,246,0.1);border-color:#3b82f6;color:#3b82f6}
        .radar-start{grid-column:span 2;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:bold;cursor:pointer;margin-top:10px;box-shadow:0 4px 15px rgba(59,130,246,0.3)}
        .radar-progress-wrap{margin-top:20px;height:8px;border-radius:10px;background:#eee;overflow:hidden;display:none}
        .radar-progress-bar{width:0%;height:100%;background:linear-gradient(90deg,#3b82f6,#10b981);transition:width 0.3s}
        #radar-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:15px}
        #radar-table th{color:#64748b;font-size:11px;padding:10px;text-transform:uppercase}
        #radar-table td{background:rgba(255,255,255,0.7);padding:12px;text-align:center;border-radius:10px;font-size:13px;box-shadow:0 2px 5px rgba(0,0,0,0.02)}
        .radar-badge{padding:4px 10px;border-radius:15px;background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:bold}
        .radar-btn-action{flex:1;padding:11px;border-radius:12px;border:1.5px solid #3b82f6;background:rgba(59,130,246,0.05);color:#3b82f6;font-weight:bold;cursor:pointer;transition:0.2s}
    `;
    document.head.appendChild(styleElement);

    var ui = document.createElement('div');
    ui.id = 'radar-ui';
    ui.innerHTML = `
        <div class="radar-header"><div style="display:flex;gap:12px;align-items:center"><div class="radar-logo">📡</div><div><h2 style="margin:0;font-size:18px">رادار علي الباز V14.0</h2><div style="font-size:11px;color:#64748b">إصدار التجميع الذهبي - المظبوط</div></div></div><button id="radar-close" style="border:none;background:none;cursor:pointer;font-size:20px;color:#94a3b8">✕</button></div>
        <div class="radar-body">
            <div class="radar-grid">
                <div class="radar-field"><label style="font-weight:bold;font-size:12px;color:#64748b">الفاتورة / الصيدلية</label><div class="radar-input-wrap"><span class="radar-prefix">0</span><input class="radar-input" id="radar-store" placeholder="كود الصيدلية..."></div></div>
                <div class="radar-field"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الطلب</label><div class="radar-input-wrap"><span class="radar-prefix">ERX</span><input class="radar-input" id="radar-order" placeholder="رقم الطلب..."></div></div>
                <div class="radar-modes" style="grid-column:span 2;display:flex;gap:10px"><button class="radar-mode-btn active" data-mode="ready">Ready to Pack</button><button class="radar-mode-btn" data-mode="all">بحث في كافة الحالات</button></div>
                <button class="radar-start" id="radar-start">بدء التجميع الشامل 📡</button>
                <button class="radar-start" id="radar-cancel" style="background:#ef4444;display:none">إيقاف المسح ⏹</button>
            </div>
            <div class="radar-progress-wrap" id="radar-progress-wrap"><div class="radar-progress-bar" id="radar-progress-bar"></div></div>
            <div id="radar-status" style="text-align:center;margin:15px 0;font-weight:bold;color:#3b82f6;min-height:20px"></div>
            <div id="radar-action-row" style="display:none;gap:10px;margin-bottom:15px"><button class="radar-btn-action" id="radar-open-all">فتح كافة النتائج المجمّعة</button><button class="radar-btn-action" id="radar-export" style="border-color:#f97316;color:#f97316">تصدير CSV</button></div>
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
    document.getElementById('radar-export').onclick = exportCSV;

    var STATUS_MAP = { readypack: 'جاهز', packed: 'معبأ', delivered: 'تم التسليم', new: 'جديد', canceled: 'ملغى' };

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
        document.getElementById('radar-start').style.display = 'none';
        document.getElementById('radar-cancel').style.display = 'block';
        document.getElementById('radar-progress-wrap').style.display = 'block';
        
        var count = 0, seen = new Set();

        try {
            for (var si = 0; si < statuses.length; si++) {
                if (!isSearching) break;
                var st = statuses[si];
                
                /* محرك V9 المظبوط: طلب أول صفحة لمعرفة الإجمالي */
                var first = await fetch(BASE_URL + 'Home/getOrders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: st, pageSelected: 1, searchby: '' })
                });
                var firstData = await first.json();
                var totalPages = Math.ceil((firstData.total_orders || 0) / 10) || 1;

                for (var p = 1; p <= totalPages; p++) {
                    if (!isSearching) break;
                    
                    document.getElementById('radar-status').textContent = `🔍 [${STATUS_MAP[st] || st}] صفحة ${p} من ${totalPages}... (وجدنا: ${count})`;
                    document.getElementById('radar-progress-bar').style.width = ((si / statuses.length) + (p / totalPages / statuses.length)) * 100 + '%';

                    var resp = (p === 1) ? firstData : await (await fetch(BASE_URL + 'Home/getOrders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: st, pageSelected: p, searchby: '' })
                    })).json();
                    
                    var list = [];
                    try { list = JSON.parse(resp.orders_list); } catch(e) { list = []; }
                    if (!list || list.length === 0) break;

                    /* الفلترة المحلية القوية */
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
        } catch (e) { document.getElementById('radar-status').textContent = '❌ خطأ في الاتصال'; }
        
        isSearching = false;
        document.getElementById('radar-start').style.display = 'block';
        document.getElementById('radar-cancel').style.display = 'none';
        document.getElementById('radar-progress-wrap').style.display = 'none';

        if (count > 0) {
            document.getElementById('radar-status').textContent = `✅ تم تجميع (${count}) نتيجة بنجاح!`;
            document.getElementById('radar-action-row').style.display = 'flex';
        } else {
            document.getElementById('radar-status').textContent = `❌ لم نجد نتائج لـ "${query}"`;
        }
    }

    function ensureTable() {
        if (document.getElementById('radar-table')) return;
        document.getElementById('radar-results').innerHTML = '<table id="radar-table"><thead><tr><th>#</th><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody id="radar-tbody"></tbody></table>';
    }

    function addRow(o, url, idx) {
        var tb = document.getElementById('radar-tbody');
        var r = tb.insertRow(-1);
        r.innerHTML = `<td>${idx}</td><td><b>${o.onlineNumber}</b></td><td>${o.guestName}</td><td>${o.Invoice}</td><td><span class="radar-badge">${STATUS_MAP[String(o.status).toLowerCase()] || o.status}</span></td><td><a href="${url}" target="_blank" style="text-decoration:none;color:#fff;background:#3b82f6;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:bold">فتح ✅</a></td>`;
    }

    async function openAllResults() {
        if (!confirm(`فتح ${collectedLinks.length} تابات؟`)) return;
        for (var i = 0; i < collectedLinks.length; i++) {
            window.open(collectedLinks[i], '_blank');
            await new Promise(r => setTimeout(r, TAB_OPEN_DELAY_MS));
        }
    }

    function exportCSV() {
        var rows = [['#', 'Order', 'Customer', 'Invoice', 'Status']];
        document.querySelectorAll('#radar-table tbody tr').forEach(tr => {
            var cols = []; tr.querySelectorAll('td').forEach((td, i) => { if(i<5) cols.push(td.innerText); });
            rows.push(cols);
        });
        var csv = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Nahdi_Report_${new Date().toLocaleDateString()}.csv`;
        link.click();
    }
})();

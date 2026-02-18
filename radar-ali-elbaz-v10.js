javascript:(function(){
    /* ═══════════════════════════════════════════════════════
     * رادار علي الباز V16.0 — الإصدار المعتمد (محرك V8 الأصلي)
     * دمج التمشيط المحلي الشامل مع واجهة Glassmorphism
     * ═══════════════════════════════════════════════════════ */

    var existingUI = document.getElementById('baz-ui');
    if(existingUI) existingUI.remove();
    var existingStyle = document.getElementById('baz-style');
    if(existingStyle) existingStyle.remove();

    var style = document.createElement('style');
    style.id = 'baz-style';
    style.innerHTML = `
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.5);border-radius:24px;z-index:999999;box-shadow:0 25px 80px rgba(0,0,0,0.2);direction:rtl;font-family:sans-serif;max-height:90vh;overflow:hidden;animation:radarIn .4s ease-out}
        @keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .baz-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:rgba(255,255,255,0.3);border-bottom:1px solid rgba(0,0,0,0.05)}
        .baz-body{padding:24px;overflow:auto;max-height:calc(90vh - 85px)}
        .baz-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:15px}
        .baz-input-wrap{display:flex;border:1.5px solid rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;background:#fff}
        .baz-prefix{padding:12px;background:#1a73e8;color:#fff;font-weight:bold;min-width:45px;text-align:center}
        .baz-input{flex:1;border:none;padding:12px;outline:none;font-weight:bold}
        .baz-mode-group{grid-column:span 2;display:flex;gap:10px;margin:5px 0}
        .baz-mode-btn{flex:1;padding:12px;border-radius:12px;border:1.5px solid #eee;background:#f8fafc;cursor:pointer;font-weight:bold;color:#64748b;transition:0.3s}
        .baz-mode-btn.active{background:rgba(26,115,232,0.1);border-color:#1a73e8;color:#1a73e8}
        .baz-start{grid-column:span 2;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 4px 15px rgba(26,115,232,0.3)}
        .baz-progress-wrap{height:8px;border-radius:10px;background:#eee;overflow:hidden;margin:15px 0;display:none}
        .baz-progress-bar{width:0%;height:100%;background:#34a853;transition:width 0.2s}
        #baz-table{width:100%;border-collapse:separate;border-spacing:0 8px}
        #baz-table th{color:#64748b;font-size:12px;padding:10px}
        #baz-table td{background:#fff;padding:12px;text-align:center;border-radius:10px;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
        .baz-open-link{text-decoration:none;color:#fff;background:#1a73e8;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:bold}
    `;
    document.head.appendChild(style);

    var ui = document.createElement('div');
    ui.id = 'baz-ui';
    ui.innerHTML = `
        <div class="baz-header"><div><h2 style="margin:0">🚀 رادار علي الباز V16.0</h2><div style="font-size:11px;color:#64748b">إصدار المحرك الأصلي المظبوط</div></div><button id="baz-close" style="border:none;background:none;cursor:pointer;font-size:20px;color:#94a3b8">✕</button></div>
        <div class="baz-body">
            <div class="baz-grid">
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8;font-size:12px">الصيدلية / الفاتورة</label><div class="baz-input-wrap"><span class="baz-prefix">0</span><input class="baz-input" id="baz-store" placeholder="كود الصيدلية..."></div></div>
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8;font-size:12px">رقم الطلب</label><div class="baz-input-wrap"><span class="baz-prefix">ERX</span><input class="baz-input" id="baz-order" placeholder="رقم ERX..."></div></div>
                <div class="baz-mode-group"><button class="baz-mode-btn active" data-mode="ready">Ready to Pack فقط</button><button class="baz-mode-btn" data-mode="all">بحث في كافة الحالات</button></div>
                <button class="baz-start" id="baz-run">بدء المسح الشامل (محرك V8) 📡</button>
            </div>
            <div class="baz-progress-wrap" id="baz-p-wrap"><div class="baz-progress-bar" id="baz-p-bar"></div></div>
            <div id="baz-st" style="text-align:center;margin:10px 0;font-weight:bold;color:#1a73e8"></div>
            <button class="baz-start" id="baz-all" style="background:#1a73e8;display:none;margin-bottom:15px">🔓 فتح كافة النتائج المكتشفة</button>
            <div id="baz-res"></div>
        </div>`;
    document.body.appendChild(ui);

    /* Actions */
    document.getElementById('baz-close').onclick = () => ui.remove();
    document.querySelectorAll('.baz-mode-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.baz-mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });

    let links = [];
    document.getElementById('baz-run').onclick = async function() {
        const sVal = document.getElementById('baz-store').value.trim();
        const oVal = document.getElementById('baz-order').value.trim();
        if(!sVal && !oVal) return;
        
        const mode = document.querySelector('.baz-mode-btn.active').dataset.mode;
        const query = oVal ? 'ERX' + oVal : '0' + sVal;
        const st=document.getElementById('baz-st'), rs=document.getElementById('baz-res'), pBar=document.getElementById('baz-p-bar'), pWrap=document.getElementById('baz-p-wrap'), btnAll=document.getElementById('baz-all');
        
        rs.innerHTML=''; pWrap.style.display='block'; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';
        const statuses = mode === 'ready' ? ['readypack'] : ['readypack', 'packed', 'delivered', 'all', 'new', 'canceled'];

        try {
            for(let status of statuses) {
                st.innerHTML = `📡 جاري فحص حالة [${status}]...`;
                
                /* محرك V8: طلب أول صفحة خالية من البحث لمعرفة الإجمالي */
                const fReq = await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:status,pageSelected:1,searchby:''})});
                const fRes = await fReq.json();
                const totalP = Math.ceil((fRes.total_orders || 0) / 10) || 30;

                for(let p=1;p<=totalP;p++){
                    pBar.style.width = (p/totalP*100) + '%';
                    st.innerHTML = `🔍 فحص [${status}] صفحة ${p} من ${totalP}... (وجدنا: ${count})`;
                    
                    /* محرك V8: نرسل searchby دائماً فاضية لإرغام السيرفر على إرسال كل الصفحات */
                    const r=await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:status,pageSelected:p,searchby:''})});
                    const res=await r.json();
                    
                    let o = [];
                    try { o = JSON.parse(res.orders_list); } catch(e) { o = []; }
                    if(!o || o.length == 0) break;

                    /* الفلترة المحلية القوية التي نجحت معك سابقاً */
                    const matches = o.filter(i => (String(i.Invoice || '')).includes(query) || (String(i.onlineNumber || '')).includes(query));
                    if(matches.length > 0){
                        if(!document.getElementById('baz-table')){
                            rs.innerHTML=`<table id="baz-table"><thead><tr><th>#</th><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>فتح</th></tr></thead><tbody id="baz-tb"></tbody></table>`;
                        }
                        matches.forEach(i=>{
                            if(!seen.has(i.Invoice)){
                                seen.add(i.Invoice); count++;
                                const url=base+`getEZPill_Details?onlineNumber=${i.onlineNumber.replace(/ERX/gi,'')}&Invoice=${i.Invoice}&typee=${i.typee}&head_id=${i.head_id}`;
                                links.push(url);
                                const row=document.getElementById('baz-tb').insertRow(-1);
                                row.innerHTML=`<td>${count}</td><td><b>${i.onlineNumber}</b></td><td>${i.guestName}</td><td>${i.Invoice}</td><td><a href="${url}" target="_blank" class="baz-open-link">فتح ✅</a></td>`;
                            }
                        });
                    }
                }
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال"; }
        
        pWrap.style.display='none';
        st.innerHTML=count?`✅ تم التجميع! وجدنا (${count}) نتيجة لـ "${query}"`:`❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    document.getElementById('baz-all').onclick = async () => {
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };
})();

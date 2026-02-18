javascript:(function(){
    const d=document;
    if(d.getElementById('baz-ui'))d.getElementById('baz-ui').remove();
    const s=d.createElement('style');
    s.innerHTML=`
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:900px;background:#fff;z-index:999999;padding:25px;border-radius:20px;box-shadow:0 0 60px rgba(0,0,0,0.5);direction:rtl;font-family:sans-serif;max-height:85vh;overflow:auto;border-top:10px solid #1a73e8}
        #baz-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}
        .search-container{display:grid;grid-template-columns:1fr 1fr;gap:15px;background:#f8f9fa;padding:20px;border-radius:15px;border:1px solid #eee}
        .prefix{background:#1a73e8;color:#fff;padding:10px;border-radius:8px;font-weight:bold;min-width:45px;text-align:center}
        input{flex:1;padding:10px;border:2px solid #ddd;border-radius:8px;font-size:16px;outline:none}
        .btn{padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:bold}
        #baz-table{width:100%;border-collapse:collapse;margin-top:20px}
        #baz-table th{background:#f1f3f4;color:#1a73e8;padding:12px;border-bottom:2px solid #1a73e8;position:sticky;top:0}
        #baz-table td{padding:10px;border-bottom:1px solid #eee;text-align:center}
        .status-badge{padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold;background:#e3f2fd;color:#1565c0}
    `;
    d.head.appendChild(s);
    const ui=d.createElement('div');
    ui.id='baz-ui';
    ui.innerHTML=`
        <div id="baz-header"><h2>🚀 رادار علي الباز V16.0 - كاسر الصفحات</h2><button class="btn" style="background:#f44336;color:#fff" onclick="this.parentElement.parentElement.remove()">X</button></div>
        <div class="search-container">
            <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8">كود الصيدلية / الفاتورة:</label><div style="display:flex;gap:5px"><span class="prefix">0</span><input type="text" id="baz-store" placeholder="مثلاً: 1300"></div></div>
            <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8">رقم الطلب:</label><div style="display:flex;gap:5px"><span class="prefix">ERX</span><input type="text" id="baz-order" placeholder="رقم الطلب..."></div></div>
            <button id="baz-run" class="btn" style="background:#34a853;color:#fff;grid-column:span 2;margin-top:10px">بدء التمشيط العميق لجميع الصفحات 📡</button>
        </div>
        <div id="baz-st" style="text-align:center;margin:15px 0;font-weight:bold;color:#1a73e8;font-size:16px"></div>
        <button id="baz-all" class="btn" style="background:#1a73e8;color:#fff;width:100%;display:none;margin-bottom:10px">🔓 فتح كافة النتائج المكتشفة</button>
        <div id="baz-res"></div>
    `;
    d.body.appendChild(ui);

    let links = [];
    const runSearch=async()=>{
        const sVal=d.getElementById('baz-store').value.trim(), oVal=d.getElementById('baz-order').value.trim();
        if(!sVal && !oVal) return;
        const query = oVal ? 'ERX' + oVal : '0' + sVal;
        const st=d.getElementById('baz-st'), rs=d.getElementById('baz-res'), btnAll=d.getElementById('baz-all');
        
        rs.innerHTML=''; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set(), page = 1;
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            /* حلقة تكرار لا تتوقف إلا عند انتهاء البيانات فعلياً */
            while(page <= 50) { 
                st.innerHTML = `🔍 جاري فحص الصفحة رقم (${page})... (وجدنا حتى الآن: ${count})`;
                
                const r = await fetch(base+'Home/getOrders',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({status:'readypack', pageSelected: page, searchby:''})
                });
                const res = await r.json();
                
                let list = [];
                try { list = JSON.parse(res.orders_list); } catch(e) { list = []; }

                /* الشرط القاتل: إذا الصفحة فارغة، اخرج من الحلقة فوراً */
                if(!list || list.length === 0) {
                    console.log("انتهت الصفحات عند: " + page);
                    break;
                }

                const matches = list.filter(i => (String(i.Invoice || '')).includes(query) || (String(i.onlineNumber || '')).includes(query));
                if(matches.length > 0){
                    if(!d.getElementById('baz-table')){
                        rs.innerHTML=`<table id="baz-table"><thead><tr><th>#</th><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>فتح</th></tr></thead><tbody id="baz-tb"></tbody></table>`;
                    }
                    matches.forEach(i=>{
                        if(!seen.has(i.Invoice)){
                            seen.add(i.Invoice); count++;
                            const url=base+`getEZPill_Details?onlineNumber=${i.onlineNumber.replace(/ERX/gi,'')}&Invoice=${i.Invoice}&typee=${i.typee}&head_id=${i.head_id}`;
                            links.push(url);
                            const row=d.getElementById('baz-tb').insertRow(-1);
                            row.innerHTML=`<td>${count}</td><td><b>${i.onlineNumber}</b></td><td>${i.guestName}</td><td>${i.Invoice}</td><td><a href="${url}" target="_blank" style="color:#34a853;font-weight:bold">فتح ✅</a></td>`;
                        }
                    });
                }
                
                page++; /* انتقل للصفحة التالية مهما كان رأي السيرفر */
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال بالسيرفر"; }
        
        st.innerHTML=count?`✅ اكتمل التجميع! وجدنا (${count}) نتيجة في ${page-1} صفحات`:`❌ لم نجد نتائج لـ "${query}" في كافة الصفحات`;
        if(count>0) btnAll.style.display='block';
    };

    d.getElementById('baz-run').onclick=runSearch;
    d.getElementById('baz-all').onclick=async()=>{
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };
})();

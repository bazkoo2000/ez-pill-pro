/* ═══════════════════════════════════════════════════════
 * رادار علي الباز النهائي - إصدار الاستقرار التام
 * ═══════════════════════════════════════════════════════ */
(function(){
    const d=document;
    if(d.getElementById('baz-ui'))d.getElementById('baz-ui').remove();
    const s=d.createElement('style');
    s.innerHTML=`
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:#fff;z-index:999999;padding:25px;border-radius:24px;box-shadow:0 30px 100px rgba(0,0,0,0.4);direction:rtl;font-family:sans-serif;max-height:90vh;overflow:auto;border-top:10px solid #1a73e8}
        .baz-header{display:flex;justify-content:space-between;align-items:center;padding:15px;border-bottom:1px solid #eee}
        .baz-input-wrap{display:flex;border:2px solid #1a73e8;border-radius:12px;overflow:hidden;background:#fff;margin-bottom:15px}
        .baz-prefix{padding:10px 15px;background:#1a73e8;color:#fff;font-weight:bold}
        .baz-input{flex:1;border:none;padding:10px;outline:none;font-weight:bold;font-size:16px}
        .baz-start{width:100%;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer}
        #baz-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:10px}
        #baz-table td{background:#f8fafc;padding:12px;text-align:center;border-radius:10px;font-size:14px}
    `;
    d.head.appendChild(s);

    const ui=d.createElement('div');
    ui.id='baz-ui';
    ui.innerHTML=`
        <div class="baz-header"><h2>🚀 رادار علي الباز - النسخة النهائية</h2><button style="border:none;background:none;cursor:pointer;font-size:20px" onclick="this.parentElement.parentElement.remove()">✕</button></div>
        <div style="padding:20px">
            <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8">كود الصيدلية / الفاتورة</label><div class="baz-input-wrap"><span class="baz-prefix">0</span><input class="baz-input" id="baz-store" placeholder="1300 مثلاً"></div></div>
            <button class="baz-start" id="baz-run">بدء التجميع الشامل (محرك V8) 📡</button>
            <div id="baz-st" style="text-align:center;margin:15px 0;font-weight:bold;color:#1a73e8"></div>
            <button class="baz-start" id="baz-all" style="background:#1a73e8;display:none;margin-bottom:15px">🔓 فتح كافة النتائج</button>
            <div id="baz-res"></div>
        </div>`;
    d.body.appendChild(ui);

    let links = [];
    d.getElementById('baz-run').onclick = async function() {
        const sVal = d.getElementById('baz-store').value.trim();
        if(!sVal) return;
        const query = '0' + sVal;
        const st=d.getElementById('baz-st'), rs=d.getElementById('baz-res'), btnAll=d.getElementById('baz-all');
        rs.innerHTML=''; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            st.innerHTML = `📡 جاري فحص الأرشيف كامل...`;
            /* الخطوة 1: معرفة عدد الصفحات (أو افتراض 40 صفحة لليقين) */
            const fReq = await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:1,searchby:''})});
            const fRes = await fReq.json();
            const totalP = Math.ceil((fRes.total_orders || 0) / 10) || 40;

            for(let p=1; p<=totalP; p++) {
                st.innerHTML = `🔍 تمشيط صفحة ${p} من ${totalP}... (وجدنا: ${count})`;
                /* المحرك الأصلي: نطلب الصفحات خالية من أي كلمة بحث لضمان وصولها كاملة */
                const r = await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:p,searchby:''})});
                const res = await r.json();
                let o = JSON.parse(res.orders_list);
                if(!o || o.length == 0) break;

                /* الفلترة المحلية (المحرك المظبوط) */
                const matches = o.filter(i => (String(i.Invoice || '')).includes(query));
                if(matches.length > 0){
                    if(!d.getElementById('baz-table')){
                        rs.innerHTML='<table id="baz-table"><thead><tr><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>فتح</th></tr></thead><tbody id="baz-tb"></tbody></table>';
                    }
                    matches.forEach(i=>{
                        if(!seen.has(i.Invoice)){
                            seen.add(i.Invoice); count++;
                            const url=base+'getEZPill_Details?onlineNumber='+i.onlineNumber.replace(/ERX/gi,'')+'&Invoice='+i.Invoice+'&typee='+i.typee+'&head_id='+i.head_id;
                            links.push(url);
                            const row=d.getElementById('baz-tb').insertRow(-1);
                            row.innerHTML='<td><b>'+i.onlineNumber+'</b></td><td>'+i.guestName+'</td><td>'+i.Invoice+'</td><td><a href="'+url+'" target="_blank" style="color:#1a73e8;font-weight:bold">فتح ✅</a></td>';
                        }
                    });
                }
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال"; }
        st.innerHTML=count? `✅ تم بنجاح! وجدنا (${count}) طلب في كامل الأرشيف` : `❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    d.getElementById('baz-all').onclick = async () => {
        for(let i=0; i<links.length; i++){
            window.open(links[i], '_blank');
            await new Promise(r => setTimeout(r, 1000));
        }
    };
})();

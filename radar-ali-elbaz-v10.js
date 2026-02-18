javascript:(function(){
    /* ═══════════════════════════════════════════════════════
     * رادار علي الباز V17.0 — وحش التجميع (Brute Force)
     * إجبار السيرفر على إظهار كافة الصفحات المخفية
     * ═══════════════════════════════════════════════════════ */

    var existingUI = document.getElementById('baz-ui');
    if(existingUI) existingUI.remove();
    var existingStyle = document.getElementById('baz-style');
    if(existingStyle) existingStyle.remove();

    var style = document.createElement('style');
    style.id = 'baz-style';
    style.innerHTML = `
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.95);backdrop-filter:blur(25px);border-radius:24px;z-index:999999;box-shadow:0 30px 100px rgba(0,0,0,0.3);direction:rtl;font-family:sans-serif;max-height:90vh;overflow:hidden;animation:radarIn .4s ease-out}
        @keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .baz-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:rgba(255,255,255,0.5);border-bottom:1px solid rgba(0,0,0,0.05)}
        .baz-body{padding:24px;overflow:auto;max-height:calc(90vh - 85px)}
        .baz-input-wrap{display:flex;border:2px solid #1a73e8;border-radius:12px;overflow:hidden;background:#fff;margin-bottom:15px}
        .baz-prefix{padding:12px;background:#1a73e8;color:#fff;font-weight:bold;min-width:50px;text-align:center}
        .baz-input{flex:1;border:none;padding:12px;outline:none;font-weight:bold;font-size:16px}
        .baz-start{width:100%;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 4px 15px rgba(26,115,232,0.3)}
        #baz-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:15px}
        #baz-table th{color:#64748b;font-size:12px;padding:10px}
        #baz-table td{background:#fff;padding:12px;text-align:center;border-radius:10px;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
        .baz-open-link{text-decoration:none;color:#fff;background:#1a73e8;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:bold}
    `;
    document.head.appendChild(style);

    var ui = document.createElement('div');
    ui.id = 'baz-ui';
    ui.innerHTML = `
        <div class="baz-header"><div><h2 style="margin:0;color:#1a73e8">🚀 رادار علي الباز V17.0</h2><div style="font-size:11px;color:#64748b">إصدار التجميع القسري - Brute Force</div></div><button id="baz-close" style="border:none;background:none;cursor:pointer;font-size:20px">✕</button></div>
        <div class="baz-body">
            <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8;font-size:13px">كود الصيدلية (0XXXX)</label><div class="baz-input-wrap"><span class="baz-prefix">0</span><input class="baz-input" id="baz-store" placeholder="مثلاً: 1300"></div></div>
            <button class="baz-start" id="baz-run">بدء التجميع الشامل (قنص الـ 25 فاتورة) 📡</button>
            <div id="baz-st" style="text-align:center;margin:15px 0;font-weight:bold;color:#1a73e8;min-height:20px"></div>
            <button class="baz-start" id="baz-all" style="background:#1a73e8;display:none;margin-bottom:15px">🔓 فتح كافة الطلبات المكتشفة</button>
            <div id="baz-res"></div>
        </div>`;
    document.body.appendChild(ui);

    document.getElementById('baz-close').onclick = () => ui.remove();

    let links = [];
    document.getElementById('baz-run').onclick = async function() {
        const sVal = document.getElementById('baz-store').value.trim();
        if(!sVal) return;
        
        const query = '0' + sVal;
        const st=document.getElementById('baz-st'), rs=document.getElementById('baz-res'), btnAll=document.getElementById('baz-all');
        
        rs.innerHTML=''; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            /* الحلقة القسرية: سنفحص حتى 50 صفحة غصب عن السيرفر */
            for(let p=1; p<=50; p++) {
                st.innerHTML = `🔄 جاري سحب الصفحة [${p}]... (وجدنا حتى الآن: ${count})`;
                
                const r = await fetch(base+'Home/getOrders',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({status:'readypack', pageSelected: p, searchby:''})
                });
                const res = await r.json();
                
                let o = [];
                try { o = JSON.parse(res.orders_list); } catch(e) { o = []; }

                /* شرط التوقف الوحيد: لو الصفحة رجعت فاضية تماماً */
                if(!o || o.length == 0) {
                    console.log("توقف التمشيط عند الصفحة: " + p);
                    break;
                }

                /* فلترة البيانات يدوياً لضمان عدم سقوط أي فاتورة */
                const matches = o.filter(i => (String(i.Invoice || '')).includes(query));
                
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
        } catch(e) { st.innerHTML="❌ خطأ في الشبكة (تأكد من الـ VPN)"; }
        
        st.innerHTML=count?`✅ مبروك يا علي! جمعنا (${count}) فاتورة من كافة الصفحات`:`❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    document.getElementById('baz-all').onclick = async () => {
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 800));
            }
        }
    };
})();

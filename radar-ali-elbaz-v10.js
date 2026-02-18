/* ═══════════════════════════════════════════════════════
 * رادار علي الباز المعتمد — استدعاء خارجي V19.0
 * ═══════════════════════════════════════════════════════ */
(function(){
    const d=document;
    if(d.getElementById('baz-ui'))d.getElementById('baz-ui').remove();
    const s=d.createElement('style');
    s.innerHTML=`
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.95);backdrop-filter:blur(30px);border-radius:24px;z-index:999999;box-shadow:0 30px 100px rgba(0,0,0,0.3);direction:rtl;font-family:sans-serif;max-height:92vh;overflow:auto;border-top:10px solid #1a73e8}
        .baz-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:rgba(255,255,255,0.5);border-bottom:1px solid rgba(0,0,0,0.05)}
        .baz-body{padding:24px;overflow:auto}
        .baz-input-wrap{display:flex;border:2px solid #1a73e8;border-radius:12px;overflow:hidden;background:#fff;margin-bottom:15px}
        .baz-prefix{padding:10px 15px;background:#1a73e8;color:#fff;font-weight:bold;min-width:50px;text-align:center}
        .baz-input{flex:1;border:none;padding:10px;outline:none;font-weight:bold;font-size:16px}
        .baz-start{width:100%;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer}
        .baz-p-wrap{height:8px;border-radius:10px;background:#eee;overflow:hidden;margin:15px 0;display:none}
        .baz-p-bar{width:0%;height:100%;background:#34a853;transition:width 0.2s}
        #baz-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:10px}
        #baz-table th{color:#64748b;font-size:12px;padding:10px}
        #baz-table td{background:#fff;padding:12px;text-align:center;border-radius:10px;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
    `;
    d.head.appendChild(s);

    const ui=d.createElement('div');
    ui.id='baz-ui';
    ui.innerHTML=`
        <div class="baz-header"><div><h2 style="margin:0;color:#1a73e8">🚀 رادار علي الباز V19.0</h2><div style="font-size:11px;color:#64748b">إصدار التحديث الحي — GitHub Hosted</div></div><button style="border:none;background:none;cursor:pointer;font-size:20px" onclick="this.parentElement.parentElement.remove()">✕</button></div>
        <div class="baz-body">
            <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;color:#1a73e8;font-size:13px">كود الصيدلية / الفاتورة</label><div class="baz-input-wrap"><span class="baz-prefix">0</span><input class="baz-input" id="baz-store" placeholder="مثلاً: 1300" autocomplete="off"></div></div>
            <button class="baz-start" id="baz-run">بدء التجميع الشامل 📡</button>
            <div class="baz-p-wrap" id="baz-p-wrap"><div class="baz-p-bar" id="baz-p-bar"></div></div>
            <div id="baz-st" style="text-align:center;margin:15px 0;font-weight:bold;color:#1a73e8"></div>
            <button class="baz-start" id="baz-all" style="background:#1a73e8;display:none;margin-bottom:15px">🔓 فتح كافة النتائج المكتشفة</button>
            <div id="baz-res"></div>
        </div>`;
    d.body.appendChild(ui);

    let links = [];
    d.getElementById('baz-run').onclick = async function() {
        const sVal = d.getElementById('baz-store').value.trim();
        if(!sVal) return;
        const query = '0' + sVal;
        const st=d.getElementById('baz-st'), rs=d.getElementById('baz-res'), pBar=d.getElementById('baz-p-bar'), pWrap=d.getElementById('baz-p-wrap'), btnAll=d.getElementById('baz-all');
        rs.innerHTML=''; pWrap.style.display='block'; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            for(let p=1; p<=50; p++) {
                st.innerHTML = `🔄 تمشيط حي للصفحة [${p}]... (وجدنا: ${count})`;
                pBar.style.width = (p/50*100) + '%';
                const r = await fetch(base + `Home/getOrders?t=${Date.now()}`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({status:'readypack', pageSelected: p, searchby:''})
                });
                const res = await r.json();
                let o = [];
                try { o = JSON.parse(res.orders_list); } catch(e) { o = []; }
                if(!o || o.length == 0) break;

                const matches = o.filter(i => (String(i.Invoice || '')).includes(query));
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
                            row.innerHTML=`<td>${count}</td><td><b>${i.onlineNumber}</b></td><td>${i.guestName}</td><td>${i.Invoice}</td><td><a href="${url}" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:none">فتح ✅</a></td>`;
                        }
                    });
                }
                if(o.length < 10) break;
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال"; }
        pWrap.style.display='none';
        st.innerHTML=count?`✅ تم التجميع! وجدنا (${count}) نتيجة`:`❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    d.getElementById('baz-all').onclick = async () => {
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };
})();

javascript:(function(){
    /* ═══════════════════════════════════════════════════════
     * رادار علي الباز V18.0 — المحرك الأصلي V8 + واجهة احترافية
     * ═══════════════════════════════════════════════════════ */

    const d=document;
    if(d.getElementById('baz-ui'))d.getElementById('baz-ui').remove();
    
    const s=d.createElement('style');
    s.innerHTML=`
        #baz-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.85);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.5);border-radius:28px;z-index:999999;box-shadow:0 25px 80px rgba(0,0,0,0.15);direction:rtl;font-family:sans-serif;max-height:90vh;overflow:hidden;animation:radarIn .4s ease-out}
        @keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .baz-header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px;background:rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.05)}
        .baz-logo{width:40px;height:40px;background:linear-gradient(135deg,#1a73e8,#34a853);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 12px rgba(26,115,232,0.2)}
        .baz-body{padding:25px;overflow:auto;max-height:calc(90vh - 85px)}
        .baz-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px}
        .baz-input-wrap{display:flex;border:2px solid rgba(0,0,0,0.08);border-radius:14px;overflow:hidden;background:#fff;transition:0.3s}
        .baz-input-wrap:focus-within{border-color:#1a73e8;box-shadow:0 0 0 4px rgba(26,115,232,0.1)}
        .baz-prefix{padding:12px 15px;background:#1a73e8;color:#fff;font-weight:900;font-size:14px}
        .baz-input{flex:1;border:none;padding:12px;outline:none;font-size:15px;font-weight:bold}
        .baz-start{grid-column:span 2;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 8px 25px rgba(26,115,232,0.3);transition:0.3s}
        .baz-start:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(26,115,232,0.4)}
        .baz-progress-wrap{height:8px;border-radius:10px;background:#eee;overflow:hidden;margin-bottom:15px;display:none;border:1px solid #eee}
        .baz-progress-bar{width:0%;height:100%;background:linear-gradient(90deg,#1a73e8,#34a853);transition:width 0.3s}
        #baz-table{width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:10px}
        #baz-table th{color:#94a3b8;font-size:12px;padding:12px;text-transform:uppercase}
        #baz-table td{background:#fff;padding:15px;text-align:center;border-radius:12px;font-size:14px;color:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,0.03)}
        .baz-open-link{text-decoration:none;color:#fff;background:#1a73e8;padding:8px 15px;border-radius:10px;font-size:13px;font-weight:bold;box-shadow:0 4px 10px rgba(26,115,232,0.2)}
    `;
    d.head.appendChild(s);

    const ui=d.createElement('div');
    ui.id='baz-ui';
    ui.innerHTML=`
        <div class="baz-header">
            <div style="display:flex;gap:15px;align-items:center">
                <div class="baz-logo">📡</div>
                <div><h2 style="margin:0;font-size:19px;color:#1e293b">نظام البحث المطور</h2><div style="font-size:11px;color:#64748b;font-weight:bold">علي الباز V18.0</div></div>
            </div>
            <button id="baz-close" style="border:none;background:none;cursor:pointer;font-size:22px;color:#94a3b8">✕</button>
        </div>
        <div class="baz-body">
            <div class="baz-grid">
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;font-size:12px;color:#64748b">كود الصيدلية / الفاتورة</label><div class="baz-input-wrap"><span class="baz-prefix">0</span><input class="baz-input" id="baz-store" placeholder="مثلاً: 1300" maxlength="4"></div></div>
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الطلب</label><div class="baz-input-wrap"><span class="baz-prefix">ERX</span><input class="baz-input" id="baz-order" placeholder="الأرقام فقط..."></div></div>
                <button id="baz-run" class="baz-start">بدء التمشيط الشامل 🚀</button>
            </div>
            <div class="baz-progress-wrap" id="baz-p-wrap"><div class="baz-progress-bar" id="baz-p-bar"></div></div>
            <div id="baz-st" style="text-align:center;margin-bottom:15px;font-weight:bold;color:#1a73e8;font-size:15px"></div>
            <button class="baz-start" id="baz-all" style="background:#1a73e8;display:none;margin-bottom:20px">🔓 فتح كافة الطلبات المكتشفة</button>
            <div id="baz-res"></div>
        </div>`;
    d.body.appendChild(ui);

    /* Actions */
    d.getElementById('baz-close').onclick = () => ui.remove();
    let links = [];

    const runSearch=async()=>{
        const sVal=d.getElementById('baz-store').value.trim(), oVal=d.getElementById('baz-order').value.trim();
        if(!sVal && !oVal) return;
        
        const query = oVal ? 'ERX' + oVal : '0' + sVal;
        const st=d.getElementById('baz-st'), rs=d.getElementById('baz-res'), pBar=d.getElementById('baz-p-bar'), pWrap=d.getElementById('baz-p-wrap'), btnAll=d.getElementById('baz-all');
        
        rs.innerHTML=''; pWrap.style.display='block'; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            st.innerHTML = `📡 جاري فحص الأرشيف...`;
            /* نفس المحرك V8 بالظبط */
            const fReq = await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:1,searchby:''})});
            const fRes = await fReq.json();
            const totalP = Math.ceil((fRes.total_orders || 0) / 10) || 30;

            for(let p=1;p<=totalP;p++){
                pBar.style.width = (p/totalP*100) + '%';
                st.innerHTML = `🔍 فحص صفحة ${p} من ${totalP}... (وجدنا: ${count})`;
                
                const r=await fetch(base+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:p,searchby:''})});
                const res=await r.json();
                const o=JSON.parse(res.orders_list);
                if(!o||o.length==0)break;

                /* الفلترة المحلية اللي إنت طلبتها */
                const matches = o.filter(i => (i.Invoice || '').includes(query) || (i.onlineNumber || '').includes(query));
                if(matches.length>0){
                    if(!d.getElementById('baz-table')){
                        rs.innerHTML=`<table id="baz-table"><thead><tr><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>إجراء</th></tr></thead><tbody id="baz-tb"></tbody></table>`;
                    }
                    matches.forEach(i=>{
                        if(!seen.has(i.Invoice)){
                            seen.add(i.Invoice); count++;
                            const url=base+`getEZPill_Details?onlineNumber=${i.onlineNumber.replace(/ERX/gi,'')}&Invoice=${i.Invoice}&typee=${i.typee}&head_id=${i.head_id}`;
                            links.push(url);
                            const row=d.getElementById('baz-tb').insertRow(-1);
                            row.innerHTML=`<td><b>${i.onlineNumber}</b></td><td>${i.guestName}</td><td>${i.Invoice}</td><td><a href="${url}" target="_blank" class="baz-open-link">فتح ✅</a></td>`;
                        }
                    });
                }
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال"; }
        
        pWrap.style.display='none';
        st.innerHTML=count?`✅ تم التجميع! وجدنا (${count}) نتيجة لـ "${query}"`:`❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    d.getElementById('baz-run').onclick=runSearch;
    d.querySelectorAll('input').forEach(el=>el.onkeypress=(e)=>{if(e.key==='Enter')runSearch()});
    d.getElementById('baz-all').onclick=async()=>{
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };
})();

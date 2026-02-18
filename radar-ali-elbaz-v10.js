/* ═══════════════════════════════════════════════════════
 * رادار علي الباز PRO — الإصدار المعتمد V20.0
 * (محرك V8 الأصلي المظبوط + تصميم Glassmorphism)
 * ═══════════════════════════════════════════════════════ */
(function(){
    const d=document;
    if(d.getElementById('radar-ui'))d.getElementById('radar-ui').remove();
    const s=d.createElement('style');
    s.innerHTML=`
        #radar-ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;max-width:880px;background:rgba(255,255,255,0.82);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.5);border-radius:24px;z-index:999999;box-shadow:0 25px 80px rgba(0,0,0,0.15);direction:rtl;font-family:sans-serif;max-height:92vh;overflow:hidden;animation:radarIn .4s cubic-bezier(0.16, 1, 0.3, 1)}
        @keyframes radarIn{from{opacity:0;transform:translate(-50%,-45%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .radar-header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px;background:rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.06)}
        .radar-logo{width:42px;height:42px;background:linear-gradient(135deg,#1a73e8,#34a853);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 14px rgba(26,115,232,0.3)}
        .radar-body{padding:25px;overflow:auto;max-height:calc(92vh - 85px)}
        .radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
        .radar-input-wrap{display:flex;border:2px solid rgba(0,0,0,0.08);border-radius:14px;overflow:hidden;background:#fff;transition:0.3s}
        .radar-input-wrap:focus-within{border-color:#1a73e8;box-shadow:0 0 0 4px rgba(26,115,232,0.1)}
        .radar-prefix{padding:12px 15px;background:#1a73e8;color:#fff;font-weight:900;font-size:14px}
        .radar-input{flex:1;border:none;padding:12px;outline:none;font-size:15px;font-weight:bold}
        .radar-start{grid-column:span 2;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#1a73e8,#34a853);color:#fff;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 8px 25px rgba(26,115,232,0.3);transition:0.3s}
        .radar-progress-wrap{height:8px;border-radius:10px;background:#eee;overflow:hidden;margin-bottom:15px;display:none}
        .radar-progress-bar{width:0%;height:100%;background:linear-gradient(90deg,#1a73e8,#34a853);transition:width 0.3s}
        #radar-table{width:100%;border-collapse:separate;border-spacing:0 8px}
        #radar-table td{background:#fff;padding:15px;text-align:center;border-radius:12px;font-size:14px;color:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,0.03)}
    `;
    d.head.appendChild(s);

    const ui=d.createElement('div');
    ui.id='radar-ui';
    ui.innerHTML = `
        <div class="radar-header">
            <div style="display:flex;gap:15px;align-items:center">
                <div class="radar-logo">📡</div>
                <div><h2 style="margin:0;font-size:19px">رادار علي الباز PRO</h2><div style="font-size:11px;color:#64748b;font-weight:bold">إصدار المحرك الأصلي المظبوط V20</div></div>
            </div>
            <button id="radar-close" style="border:none;background:none;cursor:pointer;font-size:22px;color:#94a3b8">✕</button>
        </div>
        <div class="radar-body">
            <div class="radar-grid">
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الفاتورة / الصيدلية</label><div class="radar-input-wrap"><span class="radar-prefix">0</span><input class="radar-input" id="radar-store" placeholder="مثلاً: 1300" maxlength="4"></div></div>
                <div style="display:flex;flex-direction:column;gap:5px"><label style="font-weight:bold;font-size:12px;color:#64748b">رقم الطلب</label><div class="radar-input-wrap"><span class="radar-prefix">ERX</span><input class="radar-input" id="radar-order" placeholder="الأرقام فقط..."></div></div>
                <button id="radar-run" class="radar-start">بدء المسح الشامل الموثوق 🚀</button>
            </div>
            <div class="radar-progress-wrap" id="radar-p-wrap"><div class="radar-progress-bar" id="radar-p-bar"></div></div>
            <div id="radar-st" style="text-align:center;margin-bottom:15px;font-weight:bold;color:#1a73e8;font-size:15px"></div>
            <button class="radar-start" id="radar-all" style="background:#1a73e8;display:none;margin-bottom:20px">🔓 فتح كافة الطلبات المكتشفة</button>
            <div id="radar-res"></div>
        </div>`;
    d.body.appendChild(ui);

    d.getElementById('radar-close').onclick = () => ui.remove();
    let links = [];

    const runSearch=async()=>{
        const sVal=d.getElementById('radar-store').value.trim(), oVal=d.getElementById('radar-order').value.trim();
        if(!sVal && !oVal) return;
        
        const query = oVal ? 'ERX' + oVal : '0' + sVal;
        const st=d.getElementById('radar-st'), rs=d.getElementById('radar-res'), pBar=d.getElementById('radar-p-bar'), pWrap=d.getElementById('radar-p-wrap'), btnAll=d.getElementById('radar-all');
        
        rs.innerHTML=''; pWrap.style.display='block'; btnAll.style.display='none'; links=[];
        let count=0, seen=new Set();
        const base='https://rtlapps.nahdi.sa/ez_pill_web/';

        try {
            st.innerHTML = `📡 جاري التمشيط المحلي الشامل...`;
            /* تنفيذ محرك V8 المظبوط بالحرف */
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

                const matches = o.filter(i => (i.Invoice || '').includes(query) || (i.onlineNumber || '').includes(query));
                if(matches.length>0){
                    if(!d.getElementById('radar-table')){
                        rs.innerHTML=`<table id="radar-table"><thead><tr><th>الطلب</th><th>العميل</th><th>الفاتورة</th><th>إجراء</th></tr></thead><tbody id="radar-tbody"></tbody></table>`;
                    }
                    matches.forEach(i=>{
                        if(!seen.has(i.Invoice)){
                            seen.add(i.Invoice); count++;
                            const url=base+`getEZPill_Details?onlineNumber=${i.onlineNumber.replace(/ERX/gi,'')}&Invoice=${i.Invoice}&typee=${i.typee}&head_id=${i.head_id}`;
                            links.push(url);
                            const row=d.getElementById('radar-tbody').insertRow(-1);
                            row.innerHTML=`<td><b>${i.onlineNumber}</b></td><td>${i.guestName}</td><td>${i.Invoice}</td><td><a href="${url}" target="_blank" style="text-decoration:none;color:#fff;background:#1a73e8;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:bold">فتح ✅</a></td>`;
                        }
                    });
                }
            }
        } catch(e) { st.innerHTML="❌ خطأ في الاتصال"; }
        
        pWrap.style.display='none';
        st.innerHTML=count?`✅ تم التجميع! وجدنا (${count}) نتيجة لـ "${query}"`:`❌ لم نجد نتائج لـ "${query}"`;
        if(count>0) btnAll.style.display='block';
    };

    d.getElementById('radar-run').onclick=runSearch;
    d.querySelectorAll('input').forEach(el=>el.onkeypress=(e)=>{if(e.key==='Enter')runSearch()});
    d.getElementById('radar-all').onclick=async()=>{
        if(confirm(`فتح ${links.length} تابات؟`)){
            for(let i=0; i<links.length; i++){
                window.open(links[i], '_blank');
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };
})();

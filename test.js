javascript:(function(){
  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const STATUSES = {
    new:       { label: 'New',           color: '#f59e0b', dot: '#f59e0b' },
    readypack: { label: 'Ready to Pack', color: '#22c55e', dot: '#22c55e' },
    packed:    { label: 'Packed',        color: '#6366f1', dot: '#6366f1' },
    delivered: { label: 'Delivered',     color: '#8b5cf6', dot: '#8b5cf6' },
    cancelled: { label: 'Cancelled',     color: '#ef4444', dot: '#ef4444' }
  };
  const d=document;let links=[],openedLinks=new Set(),isDragging=false,dragX=0,dragY=0,isMinimized=false,cancelSearch=false;
  d.getElementById('baz-ui')&&d.getElementById('baz-ui').remove();d.getElementById('baz-style')&&d.getElementById('baz-style').remove();
  const esc=(s)=>(s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const style=d.createElement('style');style.id='baz-style';
  style.innerHTML=`
    #baz-ui,#baz-ui *{box-sizing:border-box;margin:0;padding:0}
    #baz-ui{position:fixed;width:460px;max-width:96vw;background:rgba(243,244,246,0.92);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);z-index:999999;border-radius:22px;direction:rtl;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Cairo,Helvetica,sans-serif;max-height:88vh;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);overflow:hidden}
    #baz-ui.minimized #baz-body{display:none}#baz-ui.minimized{max-height:unset;width:420px}
    #baz-ui #baz-header{padding:14px 20px 6px;display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;flex-shrink:0}
    #baz-ui #baz-header:active{cursor:grabbing}
    #baz-ui .hdr-left{display:flex;align-items:center;gap:10px}
    #baz-ui .hdr-logo{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25);flex-shrink:0}
    #baz-ui .hdr-title{color:#1f2937;font-size:15px;font-weight:800}
    #baz-ui .hdr-ver{color:#6366f1;font-size:10px;font-weight:600}
    #baz-ui .hdr-btns{display:flex;gap:6px}
    #baz-ui .hdr-btn{background:rgba(0,0,0,0.06);border:none;color:#9ca3af;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s}
    #baz-ui .hdr-btn:hover{background:rgba(0,0,0,0.1);color:#6b7280}
    #baz-ui #baz-body{padding:10px 16px 14px;overflow-y:auto;flex:1;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.08) transparent}
    #baz-ui #baz-body::-webkit-scrollbar{width:3px}#baz-ui #baz-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:3px}
    #baz-ui .search-section{background:#fff;border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)}
    #baz-ui .fields-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
    #baz-ui .field-group{display:flex;flex-direction:column;gap:4px}
    #baz-ui .field-label{font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.3px}
    #baz-ui .field-row{display:flex;align-items:center;background:rgba(0,0,0,0.03);border:none;border-radius:10px;overflow:hidden;transition:all .15s}
    #baz-ui .field-row:focus-within{box-shadow:0 0 0 2px rgba(99,102,241,0.15);background:rgba(99,102,241,0.03)}
    #baz-ui .field-prefix{padding:0 8px;color:#6366f1;font-size:11px;font-weight:700;border-left:1px solid rgba(0,0,0,0.04);height:100%;display:flex;align-items:center}
    #baz-ui .baz-input{flex:1;background:transparent;border:none;outline:none;color:#1f2937;font-size:12px;padding:10px 12px;font-family:inherit;font-weight:600}
    #baz-ui .baz-input::placeholder{color:#d1d5db}
    #baz-ui .baz-btn{padding:10px 12px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}
    #baz-ui .baz-btn:disabled{opacity:0.4;cursor:not-allowed}
    #baz-ui .baz-btn:not(:disabled):active{transform:scale(0.98);opacity:0.9}
    #baz-ui .btn-ready{background:#6366f1;color:white}
    #baz-ui .btn-cancel{background:rgba(239,68,68,0.06);color:#ef4444;display:none}
    #baz-ui #baz-status-bar{display:flex;align-items:center;gap:8px;padding:8px 0;min-height:32px}
    #baz-ui #baz-spinner{width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:baz-spin 0.6s linear infinite;display:none;flex-shrink:0}
    @keyframes baz-spin{to{transform:rotate(360deg)}}
    #baz-ui #baz-st{font-size:12px;color:#9ca3af;flex:1;font-weight:600}
    #baz-ui #baz-st b{color:#6366f1}
    #baz-ui #baz-st .err{color:#ef4444}
    #baz-ui #baz-open-panel{background:#fff;border-radius:14px;padding:12px 14px;margin-bottom:12px;display:none;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)}
    #baz-ui .open-stats{display:flex;gap:16px;margin-bottom:10px}
    #baz-ui .stat-item{display:flex;flex-direction:column;gap:2px}
    #baz-ui .stat-val{font-size:18px;font-weight:900;color:#1f2937}
    #baz-ui .stat-val.green{color:#22c55e}#baz-ui .stat-val.orange{color:#f59e0b}
    #baz-ui .stat-lbl{font-size:9px;color:#9ca3af;font-weight:700;letter-spacing:0.3px}
    #baz-ui .open-row{display:flex;align-items:center;gap:8px}
    #baz-ui .open-count-input{width:56px;background:rgba(0,0,0,0.03);border:none;border-radius:10px;color:#1f2937;font-size:13px;font-weight:900;text-align:center;padding:8px;outline:none;font-family:inherit}
    #baz-ui .open-count-input:focus{box-shadow:0 0 0 2px rgba(99,102,241,0.15)}
    #baz-ui .btn-open{background:#6366f1;color:white;padding:8px 16px;border:none;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
    #baz-ui .btn-open:active{transform:scale(0.98);opacity:0.9}
    #baz-ui #baz-cards{display:flex;flex-direction:column;gap:8px}
    
    /* تعديلات الكروت وعرض البيانات الكاملة */
    #baz-ui .result-card{background:#fff;border-radius:14px;padding:14px 16px;transition:all .15s;position:relative;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)}
    #baz-ui .result-card::before{content:'';position:absolute;right:0;top:0;bottom:0;width:4px;border-radius:0 14px 14px 0;background:var(--card-color,#6366f1)}
    #baz-ui .result-card:hover{background:#f9fafb;transform:translateX(-2px)}
    #baz-ui .result-card.opened{opacity:0.35}
    #baz-ui .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,0.04)}
    #baz-ui .card-idx{background:rgba(99,102,241,0.08);color:#6366f1;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:800;margin-left:8px}
    #baz-ui .card-order{font-size:14px;font-weight:800;color:#1f2937}
    #baz-ui .card-status{font-size:10px;font-weight:800;padding:4px 10px;border-radius:8px;background:rgba(99,102,241,0.06);color:var(--card-color,#6366f1);letter-spacing:0.3px}
    #baz-ui .card-info{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    #baz-ui .info-item{display:flex;flex-direction:column;gap:3px}
    #baz-ui .info-lbl{font-size:10px;color:#9ca3af;font-weight:700}
    #baz-ui .info-val{font-size:13px;color:#374151;font-weight:800;line-height:1.4;word-break:break-word}
    #baz-ui .card-bottom{display:flex;justify-content:space-between;align-items:flex-end;padding-top:10px;border-top:1px dashed rgba(0,0,0,0.06)}
    #baz-ui .card-invoice{font-size:11px;color:#6b7280;font-weight:700;font-family:monospace;letter-spacing:0.5px}
    #baz-ui .card-date{font-size:10px;color:#9ca3af;font-weight:600;margin-top:4px}
    #baz-ui .card-open-btn{text-decoration:none;background:rgba(99,102,241,0.08);color:#6366f1;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:800;transition:all .15s;font-family:inherit}
    #baz-ui .card-open-btn:hover{background:#6366f1;color:white;box-shadow:0 4px 12px rgba(99,102,241,0.2)}
    #baz-ui .card-opened-lbl{font-size:11px;color:#9ca3af;font-weight:700;padding:8px 0}
    #baz-ui .empty-state{text-align:center;padding:32px 20px;color:#d1d5db}
    #baz-ui .empty-icon{font-size:32px;margin-bottom:8px}
    #baz-ui .empty-text{font-size:13px;font-weight:600}
  `;d.head.appendChild(style);

  const ui=d.createElement('div');ui.id='baz-ui';ui.style.cssText='top:50%;left:50%;transform:translate(-50%,-50%);';
  ui.innerHTML=`
    <div id="baz-header">
      <div class="hdr-left">
        <div class="hdr-logo">📡</div>
        <div><span class="hdr-title">البحث الشامل</span><br><span class="hdr-ver">v14.3 — Full Data & Lightning ⚡</span></div>
      </div>
      <div class="hdr-btns">
        <button class="hdr-btn" id="baz-min">−</button>
        <button class="hdr-btn" id="baz-close" style="background:rgba(239,68,68,0.08);color:#ef4444">✕</button>
      </div>
    </div>
    <div id="baz-body">
      <div class="search-section">
        <div class="fields-grid">
          <div class="field-group"><span class="field-label">رقم الفاتورة</span><div class="field-row"><input class="baz-input" id="f-invoice" placeholder="INV-12345"></div></div>
          <div class="field-group"><span class="field-label">رقم الطلب</span><div class="field-row"><span class="field-prefix">ERX</span><input class="baz-input" id="f-order" placeholder="أرقام فقط"></div></div>
          <div class="field-group" style="grid-column: 1 / -1;"><span class="field-label">موبايل الضيف</span><div class="field-row"><input class="baz-input" id="f-mobile" placeholder="05xxxxxxxx"></div></div>
        </div>
        <div style="display:flex; gap:8px;" id="baz-btn-grid">
          <button id="baz-run-all" class="baz-btn btn-ready" style="flex:1; font-size:14px; padding:12px;">🔍 بحث شامل في كل الحالات</button>
          <button id="baz-cancel" class="baz-btn btn-cancel" style="flex:0.35;">⛔ إلغاء</button>
        </div>
      </div>
      <div id="baz-status-bar"><div id="baz-spinner"></div><div id="baz-st"></div></div>
      <div id="baz-open-panel">
        <div class="open-stats">
          <div class="stat-item"><span class="stat-val" id="stat-total">0</span><span class="stat-lbl">إجمالي</span></div>
          <div class="stat-item"><span class="stat-val green" id="stat-opened">0</span><span class="stat-lbl">مفتوحة</span></div>
          <div class="stat-item"><span class="stat-val orange" id="stat-remain">0</span><span class="stat-lbl">متبقية</span></div>
        </div>
        <div class="open-row"><input class="open-count-input" id="baz-open-count" type="number" min="1" value="10"><button class="btn-open" id="baz-do-open">فتح ▶</button></div>
      </div>
      <div id="baz-cards"></div>
    </div>`;
  d.body.appendChild(ui);

  const hdr=d.getElementById('baz-header');
  hdr.addEventListener('mousedown',(e)=>{if(e.target.closest('.hdr-btn'))return;isDragging=true;const rect=ui.getBoundingClientRect();dragX=e.clientX-rect.left;dragY=e.clientY-rect.top;ui.style.transform='none'});
  d.addEventListener('mousemove',(e)=>{if(!isDragging)return;let x=Math.max(0,Math.min(window.innerWidth-ui.offsetWidth,e.clientX-dragX));let y=Math.max(0,Math.min(window.innerHeight-ui.offsetHeight,e.clientY-dragY));ui.style.left=x+'px';ui.style.top=y+'px'});
  d.addEventListener('mouseup',()=>{isDragging=false});

  const getQuery=()=>{
    let ord = d.getElementById('f-order').value.trim();
    if(ord) {
      ord = ord.replace(/^ERX/i, '');
      ord = 'ERX' + ord;
    }
    return {
      inv: d.getElementById('f-invoice').value.trim(),
      ord: ord,
      mob: d.getElementById('f-mobile').value.trim()
    };
  };

  const getSearchValue=(q)=>q.mob||q.inv||q.ord||'';
  const setLoading=(on)=>{d.getElementById('baz-spinner').style.display=on?'block':'none';d.getElementById('baz-run-all').disabled=on;const cb=d.getElementById('baz-cancel');cb.style.display=on?'flex':'none'};
  const updateOpenPanel=()=>{const rem=links.filter(l=>!openedLinks.has(l.key));d.getElementById('stat-total').textContent=links.length;d.getElementById('stat-opened').textContent=openedLinks.size;d.getElementById('stat-remain').textContent=rem.length;const ce=d.getElementById('baz-open-count');ce.max=rem.length;ce.value=Math.min(parseInt(ce.value)||10,rem.length||1)};

  const addCard=(item,info,index)=>{
    const url=BASE_URL+`getEZPill_Details?onlineNumber=${encodeURIComponent((item.onlineNumber||'').replace(/ERX/gi,''))}&Invoice=${encodeURIComponent(item.Invoice||'')}&typee=${encodeURIComponent(item.typee||'')}&head_id=${encodeURIComponent(item.head_id||'')}`;
    links.push({url,key:(item.Invoice||'')+':'+(item.onlineNumber||'')});
    const card=d.createElement('div');card.className='result-card';card.id='card-'+links.length;
    card.style.setProperty('--card-color',info.color);
    
    // تنسيق التاريخ والوقت ليظهر بشكل جميل
    let dateStr = item.created_at || item.Created_Time || item.createdAt || item.date || '—';
    
    card.innerHTML=`
      <div class="card-top">
        <div style="display:flex; align-items:center;">
          <span class="card-idx">#${index}</span>
          <span class="card-order">${esc(item.onlineNumber||'—')}</span>
        </div>
        <span class="card-status" style="background:${info.color}15; color:${info.color}">${esc(info.label)}</span>
      </div>
      <div class="card-info">
        <div class="info-item"><span class="info-lbl">الضيف</span><span class="info-val">${esc(item.guestName||'—')}</span></div>
        <div class="info-item"><span class="info-lbl">الموبايل</span><span class="info-val" style="direction:ltr; text-align:right">${esc(item.guestMobile||item.mobile||'—')}</span></div>
      </div>
      <div class="card-bottom">
        <div style="display:flex; flex-direction:column; gap:3px;">
          <span class="card-invoice" title="رقم الفاتورة">🧾 ${esc(item.Invoice||'—')}</span>
          <span class="card-date" title="تاريخ ووقت الإنشاء">🕒 ${esc(dateStr)}</span>
        </div>
        <a href="${esc(url)}" target="_blank" class="card-open-btn">فتح ↗</a>
      </div>
    `;
    d.getElementById('baz-cards').appendChild(card);
  };

  const runSearch=async(statusKeys)=>{
    const q=getQuery();const searchValue=getSearchValue(q);const st=d.getElementById('baz-st');const cards=d.getElementById('baz-cards');const panel=d.getElementById('baz-open-panel');
    if(!searchValue){st.innerHTML='<span class="err">⚠️ أدخل قيمة بحث أولاً</span>';return}
    cards.innerHTML='';panel.style.display='none';links=[];openedLinks=new Set();cancelSearch=false;setLoading(true);
    let count=0;let seen=new Set();
    
    st.innerHTML=`جاري البحث <b>بسرعة البرق...</b> ⚡`;

    let allResults = [];

    const fetchPromises = statusKeys.map(async (status) => {
      if(cancelSearch) return;
      const info = STATUSES[status];
      try {
        const res = await fetch(BASE_URL+'Home/getOrders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, pageSelected: 1, searchby: searchValue })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if(cancelSearch) return; 

        let orders;
        try { orders = JSON.parse(data.orders_list) } catch (_) { orders = data.orders_list }
        
        if (Array.isArray(orders) && orders.length > 0) {
          orders.forEach(item => {
            const key = (item.Invoice || '') + ':' + (item.onlineNumber || '');
            if (seen.has(key)) return;
            seen.add(key);
            count++;

            let raw = String(item.status || item.Status || item.order_status || item.OrderStatus || '').toLowerCase().replace(/<[^>]*>?/gm, '').trim();
            if(!raw) {
              let cs = JSON.stringify(item).toLowerCase();
              if(cs.includes('"delivered"')) raw = 'delivered';
              else if(cs.includes('"packed"')) raw = 'packed';
              else if(cs.includes('"ready to pack"') || cs.includes('"received"')) raw = 'readypack';
              else if(cs.includes('"cancelled"')) raw = 'cancelled';
              else if(cs.includes('"new"')) raw = 'new';
            }
            
            let actualInfo = info;
            if(raw.includes('delivered')) actualInfo = STATUSES['delivered'];
            else if(raw.includes('packed')) actualInfo = STATUSES['packed'];
            else if(raw.includes('ready') || raw.includes('received')) actualInfo = STATUSES['readypack'];
            else if(raw.includes('cancel')) actualInfo = STATUSES['cancelled'];
            else if(raw.includes('new')) actualInfo = STATUSES['new'];

            allResults.push({ item: item, info: actualInfo });
          });
        }
      } catch(err) {
        console.error(`[BazRadar - ${info.label}]`, err);
      }
    });

    await Promise.all(fetchPromises);

    // الترتيب من الأقدم إلى الأحدث
    allResults.sort((a, b) => {
      const getMs = (obj) => {
        let s = obj.created_at || obj.Created_Time || obj.createdAt || obj.date || '';
        if(!s) return 0;
        let t = new Date(s).getTime();
        if(!isNaN(t)) return t;
        let parts = s.split('|');
        if(parts.length === 2) {
          t = new Date(parts[1].trim() + ' ' + parts[0].trim()).getTime();
          if(!isNaN(t)) return t;
        }
        return 0;
      };
      return getMs(a.item) - getMs(b.item);
    });

    // طباعة الطلبات بعد الترتيب مع إعطائها رقم تسلسلي
    allResults.forEach((res, index) => {
      addCard(res.item, res.info, index + 1);
    });

    setLoading(false);
    if(cancelSearch){st.innerHTML=`<span class="err">⛔ تم الإلغاء</span> — <b>${count}</b> نتيجة`}
    else if(count>0){st.innerHTML=`✅ اكتمل بسرعة البرق — <b>${count}</b> نتيجة`;panel.style.display='block';updateOpenPanel()}
    else{cards.innerHTML=`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">لم نجد نتائج لـ "${esc(searchValue)}"</div></div>`;st.innerHTML=''}
  };

  const openResults=async()=>{
    const n=parseInt(d.getElementById('baz-open-count').value)||10;const remaining=links.filter(l=>!openedLinks.has(l.key));const st=d.getElementById('baz-st');
    if(remaining.length===0){st.innerHTML='✅ كل النتائج تم فتحها';return}
    const toOpen=remaining.slice(0,n);
    for(let i=0;i<toOpen.length;i++){st.innerHTML=`🚀 فتح <b>${i+1}</b> من <b>${toOpen.length}</b>...`;window.open(toOpen[i].url,'_blank');openedLinks.add(toOpen[i].key);
      d.querySelectorAll('.result-card').forEach(card=>{const btn=card.querySelector('.card-open-btn');if(btn&&btn.getAttribute('href')===toOpen[i].url){card.classList.add('opened');card.querySelector('.card-bottom').querySelector('.card-open-btn').outerHTML=`<span class="card-opened-lbl">✓ تم الفتح</span>`}});
      await new Promise(r=>setTimeout(r,800))}
    updateOpenPanel();const left=links.filter(l=>!openedLinks.has(l.key)).length;st.innerHTML=`✅ فُتح <b>${toOpen.length}</b> — متبقي: <b>${left}</b>`};

  d.getElementById('baz-min').onclick=()=>{isMinimized=!isMinimized;ui.classList.toggle('minimized',isMinimized);d.getElementById('baz-min').innerHTML=isMinimized?'+':'−'};
  d.getElementById('baz-close').onclick=()=>{ui.remove();d.getElementById('baz-style')&&d.getElementById('baz-style').remove()};
  
  d.getElementById('baz-run-all').onclick=()=>runSearch(['new', 'readypack', 'packed', 'delivered', 'cancelled']);
  d.getElementById('baz-cancel').onclick=()=>{cancelSearch=true};
  d.getElementById('baz-do-open').onclick=openResults;
  d.querySelectorAll('.baz-input').forEach(el=>{el.onkeypress=(e)=>{if(e.key==='Enter')runSearch(['new', 'readypack', 'packed', 'delivered', 'cancelled'])}});
})();

javascript: (function () {
  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const STATUSES = {
    readypack: { label: 'Ready to Pack', color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
    new:       { label: 'New',           color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)' },
    packed:    { label: 'Packed',        color: '#5856D6', bg: 'rgba(88,86,214,0.08)' },
    delivered: { label: 'Delivered',     color: '#AF52DE', bg: 'rgba(175,82,222,0.08)' },
  };
  const FETCH_TIMEOUT = 15000, OPEN_DELAY = 900, MAX_PAGES = 20;
  const d = document;
  const esc = (s) => { const div = d.createElement('div'); div.appendChild(d.createTextNode((s||'').toString())); return div.innerHTML; };
  const sanitizeURL = (url) => { try { const u = new URL(url); return ['http:','https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
  let links=[], openedLinks=new Set(), isDragging=false, dragX=0, dragY=0, isMinimized=false, searchController=null, isSearching=false;
  d.getElementById('baz-ui')?.remove(); d.getElementById('baz-style')?.remove();

  const style = d.createElement('style'); style.id = 'baz-style';
  style.textContent = `
#baz-ui,#baz-ui *{box-sizing:border-box;margin:0;padding:0}
#baz-ui{
  position:fixed;width:380px;max-width:94vw;
  background:rgba(255,255,255,0.82);
  backdrop-filter:saturate(180%) blur(50px);-webkit-backdrop-filter:saturate(180%) blur(50px);
  z-index:999999;border-radius:16px;direction:rtl;
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Arabic','Segoe UI',system-ui,sans-serif;
  max-height:85vh;display:flex;flex-direction:column;
  border:0.5px solid rgba(60,60,67,0.08);
  box-shadow:0 8px 32px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.04);
  overflow:hidden
}
#baz-ui.minimized #baz-body{display:none}
#baz-ui.minimized{max-height:unset}
#baz-hdr{
  padding:14px 16px;display:flex;align-items:center;justify-content:space-between;
  cursor:grab;user-select:none;flex-shrink:0;
  background:rgba(255,255,255,0.5);
  border-bottom:0.5px solid rgba(60,60,67,0.06)
}
#baz-hdr:active{cursor:grabbing}
.h-right{display:flex;align-items:center;gap:10px}
.h-icon{
  width:34px;height:34px;border-radius:9px;
  background:linear-gradient(135deg,#007AFF,#5856D6);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,122,255,0.25)
}
.h-icon svg{width:18px;height:18px}
.h-title{font-size:15px;font-weight:700;color:#1C1C1E;line-height:1.2}
.h-ver{font-size:10px;color:#8E8E93;font-weight:500}
.h-btns{display:flex;gap:6px}
.h-btn{
  width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  background:rgba(60,60,67,0.06);color:#8E8E93;transition:all .15s
}
.h-btn:hover{background:rgba(60,60,67,0.12)}
.h-btn:active{transform:scale(0.9)}
.h-btn.close{background:rgba(255,59,48,0.08);color:#FF3B30}
#baz-body{padding:12px;overflow-y:auto;flex:1;scrollbar-width:none}
#baz-body::-webkit-scrollbar{display:none}
.s-box{
  background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;
  margin-bottom:10px;border:0.5px solid rgba(60,60,67,0.05)
}
.s-fields{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.s-field{
  display:flex;align-items:center;
  background:rgba(120,120,128,0.06);border-radius:10px;
  border:0.5px solid transparent;transition:all .2s;overflow:hidden
}
.s-field:focus-within{
  border-color:rgba(0,122,255,0.35);
  box-shadow:0 0 0 3px rgba(0,122,255,0.06);
  background:rgba(0,122,255,0.03)
}
.s-label{
  padding:0 12px;font-size:11px;font-weight:600;color:#8E8E93;
  white-space:nowrap;min-width:62px;text-align:center;
  border-left:0.5px solid rgba(60,60,67,0.06);
  height:40px;display:flex;align-items:center;justify-content:center
}
.s-label.erx{color:#007AFF;font-weight:700;min-width:46px}
.s-input{
  flex:1;border:none;outline:none;background:transparent;
  padding:10px 12px;font-size:13px;font-weight:600;color:#1C1C1E;
  font-family:inherit
}
.s-input::placeholder{color:#C7C7CC}
.s-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.s-btns.cancel-on{grid-template-columns:1fr 1fr 1fr}
.s-btn{
  padding:10px;border:none;border-radius:10px;cursor:pointer;
  font-size:12px;font-weight:700;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:5px;
  transition:all .15s;white-space:nowrap
}
.s-btn:disabled{opacity:0.3;cursor:not-allowed}
.s-btn:not(:disabled):active{transform:scale(0.97)}
.s-btn.primary{background:#007AFF;color:#fff;box-shadow:0 2px 6px rgba(0,122,255,0.2)}
.s-btn.primary:not(:disabled):hover{background:#0066DD}
.s-btn.secondary{background:rgba(60,60,67,0.06);color:#636366}
.s-btn.secondary:not(:disabled):hover{background:rgba(60,60,67,0.1)}
.s-btn.danger{background:rgba(255,59,48,0.08);color:#FF3B30;display:none}
#baz-sbar{display:flex;align-items:center;gap:8px;padding:4px 4px 6px;min-height:24px}
#baz-spin{
  width:14px;height:14px;border:2px solid rgba(0,122,255,0.12);
  border-top-color:#007AFF;border-radius:50%;
  animation:bspin .65s linear infinite;display:none;flex-shrink:0
}
@keyframes bspin{to{transform:rotate(360deg)}}
#baz-st{font-size:11px;color:#8E8E93;flex:1;font-weight:600;line-height:1.4}
#baz-st b{color:#007AFF}
#baz-st .err{color:#FF3B30}
#baz-st .ok{color:#34C759}
.s-alert{
  background:rgba(255,59,48,0.06);border:0.5px solid rgba(255,59,48,0.12);
  border-radius:10px;padding:10px 12px;margin-bottom:10px;display:none;
  font-size:11px;color:#FF3B30;font-weight:600;text-align:center;line-height:1.5
}
#baz-opanel{
  background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;
  margin-bottom:10px;display:none;border:0.5px solid rgba(60,60,67,0.05)
}
.o-stats{display:flex;gap:20px;margin-bottom:10px}
.o-stat span:first-child{font-size:20px;font-weight:700;color:#1C1C1E;display:block;letter-spacing:-0.5px}
.o-stat span:last-child{font-size:9px;color:#8E8E93;font-weight:600;letter-spacing:0.2px}
.o-stat .green{color:#34C759}.o-stat .orange{color:#FF9F0A}
.o-row{display:flex;align-items:center;gap:8px}
.o-num{
  width:52px;background:rgba(120,120,128,0.06);border:0.5px solid rgba(60,60,67,0.06);
  border-radius:8px;color:#1C1C1E;font-size:13px;font-weight:700;
  text-align:center;padding:8px;outline:none;font-family:inherit
}
.o-num:focus{border-color:rgba(0,122,255,0.3);box-shadow:0 0 0 3px rgba(0,122,255,0.06)}
.o-go{
  flex:1;background:#007AFF;color:#fff;border:none;border-radius:10px;
  padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;
  transition:all .15s;box-shadow:0 2px 6px rgba(0,122,255,0.15)
}
.o-go:hover{background:#0066DD}
.o-go:active{transform:scale(0.97)}
.f-bar{display:none;gap:5px;margin-bottom:10px;flex-wrap:wrap}
.f-chip{
  background:rgba(120,120,128,0.06);border:none;border-radius:100px;
  padding:5px 11px;font-size:10px;font-weight:600;color:#8E8E93;
  cursor:pointer;font-family:inherit;transition:all .15s
}
.f-chip:hover{background:rgba(120,120,128,0.12)}
.f-chip.on{background:rgba(0,122,255,0.08);color:#007AFF}
#baz-cards{display:flex;flex-direction:column;gap:6px}
.r-card{
  background:rgba(255,255,255,0.75);border-radius:12px;padding:12px;
  position:relative;overflow:hidden;transition:all .15s;
  border:0.5px solid rgba(60,60,67,0.05)
}
.r-card::after{
  content:'';position:absolute;right:0;top:0;bottom:0;width:3px;
  background:var(--cc,#007AFF)
}
.r-card:hover{background:rgba(255,255,255,0.95);box-shadow:0 2px 8px rgba(0,0,0,0.03)}
.r-card.opened{opacity:0.25}
.r-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.r-order{font-size:13px;font-weight:700;color:#1C1C1E}
.r-badge{
  font-size:10px;font-weight:600;padding:3px 9px;border-radius:100px;
  background:var(--cbg,rgba(0,122,255,0.08));color:var(--cc,#007AFF)
}
.r-info{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.r-info div{display:flex;flex-direction:column;gap:2px}
.r-lbl{font-size:9px;color:#C7C7CC;font-weight:600}
.r-val{font-size:11px;color:#636366;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.r-bot{display:flex;justify-content:space-between;align-items:center}
.r-inv{font-size:10px;color:#C7C7CC;font-family:ui-monospace,'SF Mono',monospace}
.r-open{
  text-decoration:none;background:rgba(0,122,255,0.06);color:#007AFF;
  padding:5px 12px;border-radius:100px;font-size:11px;font-weight:700;
  font-family:inherit;transition:all .15s
}
.r-open:hover{background:#007AFF;color:#fff}
.r-done{font-size:10px;color:#34C759;font-weight:600}
.empty{text-align:center;padding:30px 16px}
.empty-t{font-size:13px;color:#8E8E93;font-weight:600;margin-top:8px}
.empty-s{font-size:11px;color:#C7C7CC;margin-top:3px}
@media(pointer:coarse){.s-input{font-size:16px}.s-btn{padding:12px}}
  `;
  d.head.appendChild(style);

  const ui = d.createElement('div'); ui.id = 'baz-ui';
  ui.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%)';
  ui.innerHTML = `
<div id="baz-hdr">
  <div class="h-right">
    <div class="h-icon"><svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg></div>
    <div><div class="h-title">البحث الشامل</div><div class="h-ver">v14</div></div>
  </div>
  <div class="h-btns">
    <button class="h-btn" id="baz-min"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
    <button class="h-btn close" id="baz-close"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button>
  </div>
</div>
<div id="baz-body">
  <div class="s-alert" id="baz-alert">انتهت الجلسة — سجّل دخولك مرة أخرى</div>
  <div class="s-box">
    <div class="s-fields">
      <div class="s-field">
        <span class="s-label">الفاتورة</span>
        <input class="s-input" id="f-inv" placeholder="INV-12345" autocomplete="off">
      </div>
      <div class="s-field">
        <span class="s-label erx">ERX</span>
        <input class="s-input" id="f-ord" placeholder="رقم الطلب" autocomplete="off">
      </div>
      <div class="s-field">
        <span class="s-label">الجوال</span>
        <input class="s-input" id="f-mob" placeholder="05xxxxxxxx" autocomplete="off">
      </div>
    </div>
    <div class="s-btns" id="baz-btns">
      <button class="s-btn primary" id="baz-ready">Ready to Pack</button>
      <button class="s-btn secondary" id="baz-all">بحث الكل</button>
      <button class="s-btn danger" id="baz-stop">إلغاء</button>
    </div>
  </div>
  <div id="baz-sbar"><div id="baz-spin"></div><div id="baz-st"></div></div>
  <div id="baz-opanel">
    <div class="o-stats">
      <div class="o-stat"><span id="st-t">0</span><span>إجمالي</span></div>
      <div class="o-stat"><span class="green" id="st-o">0</span><span>مفتوحة</span></div>
      <div class="o-stat"><span class="orange" id="st-r">0</span><span>متبقية</span></div>
    </div>
    <div class="o-row">
      <input class="o-num" id="baz-onum" type="number" min="1" value="10">
      <button class="o-go" id="baz-ogo">فتح الروابط</button>
    </div>
  </div>
  <div class="f-bar" id="baz-fbar">
    <button class="f-chip on" data-f="all">الكل</button>
    <button class="f-chip" data-f="readypack">Ready</button>
    <button class="f-chip" data-f="new">New</button>
    <button class="f-chip" data-f="packed">Packed</button>
    <button class="f-chip" data-f="delivered">Delivered</button>
  </div>
  <div id="baz-cards"></div>
</div>`;
  d.body.appendChild(ui);

  /* DRAG */
  const hdr = d.getElementById('baz-hdr');
  const startDrag=(x,y)=>{isDragging=true;const r=ui.getBoundingClientRect();dragX=x-r.left;dragY=y-r.top;ui.style.transform='none';};
  const moveDrag=(x,y)=>{if(!isDragging)return;ui.style.left=Math.max(0,Math.min(innerWidth-ui.offsetWidth,x-dragX))+'px';ui.style.top=Math.max(0,Math.min(innerHeight-ui.offsetHeight,y-dragY))+'px';};
  hdr.onmousedown=(e)=>{if(!e.target.closest('.h-btn'))startDrag(e.clientX,e.clientY);};
  d.onmousemove=(e)=>moveDrag(e.clientX,e.clientY);
  d.onmouseup=()=>{isDragging=false;};
  hdr.addEventListener('touchstart',(e)=>{if(!e.target.closest('.h-btn')){const t=e.touches[0];startDrag(t.clientX,t.clientY);}},{passive:true});
  d.addEventListener('touchmove',(e)=>{if(isDragging){const t=e.touches[0];moveDrag(t.clientX,t.clientY);}},{passive:true});
  d.addEventListener('touchend',()=>{isDragging=false},{passive:true});

  /* HELPERS */
  const $=id=>d.getElementById(id);
  const getVal=()=>$('f-mob').value.trim()||$('f-inv').value.trim()||$('f-ord').value.trim()||'';
  const setLoad=(on)=>{
    $('baz-spin').style.display=on?'block':'none';
    $('baz-ready').disabled=on;$('baz-all').disabled=on;
    $('baz-stop').style.display=on?'flex':'none';
    $('baz-btns').className=on?'s-btns cancel-on':'s-btns';
    isSearching=on;
  };
  const updPanel=()=>{
    const rem=links.filter(l=>!openedLinks.has(l.key));
    $('st-t').textContent=links.length;$('st-o').textContent=openedLinks.size;$('st-r').textContent=rem.length;
    const c=$('baz-onum');c.max=rem.length;c.value=Math.min(+c.value||10,rem.length||1);
  };
  const checkSession=async()=>{
    try{const ctrl=new AbortController();setTimeout(()=>ctrl.abort(),5000);
    const r=await fetch(BASE_URL+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:1,searchby:'___test___'}),signal:ctrl.signal});
    if(r.status===401||r.status===403||r.redirected){$('baz-alert').style.display='block';return false;}
    $('baz-alert').style.display='none';return true;}catch{return true;}
  };
  const fetchTO=async(url,opt,ms=FETCH_TIMEOUT)=>{
    const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);
    try{const r=await fetch(url,{...opt,signal:c.signal});clearTimeout(t);return r;}catch(e){clearTimeout(t);throw e;}
  };
  const fetchAll=async(status,val,signal)=>{
    let all=[],pg=1;
    while(pg<=MAX_PAGES){
      if(signal?.aborted)break;
      const r=await fetchTO(BASE_URL+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,pageSelected:pg,searchby:val}),signal});
      if(!r.ok){if(r.status===401||r.status===403){$('baz-alert').style.display='block';throw new Error('SESSION');}throw new Error('HTTP '+r.status);}
      const data=await r.json();let ord;try{ord=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list;}catch{ord=[];}
      if(!Array.isArray(ord)||!ord.length)break;
      all=all.concat(ord);if(ord.length<10)break;pg++;
    }
    return all;
  };
  const addCard=(item,info,sk)=>{
    const num=(item.onlineNumber||'').replace(/ERX/gi,'');
    const url=sanitizeURL(BASE_URL+`getEZPill_Details?onlineNumber=${encodeURIComponent(num)}&Invoice=${encodeURIComponent(item.Invoice||'')}&typee=${encodeURIComponent(item.typee||'')}&head_id=${encodeURIComponent(item.head_id||'')}`);
    const key=(item.Invoice||'')+':'+(item.onlineNumber||'');
    links.push({url,key,status:sk});
    const c=d.createElement('div');c.className='r-card';c.dataset.status=sk;c.id='c'+links.length;
    c.style.setProperty('--cc',info.color);c.style.setProperty('--cbg',info.bg);
    c.innerHTML=`<div class="r-top"><span class="r-order">${esc(item.onlineNumber||'—')}</span><span class="r-badge">${esc(info.label)}</span></div><div class="r-info"><div><span class="r-lbl">الضيف</span><span class="r-val">${esc(item.guestName||'—')}</span></div><div><span class="r-lbl">الجوال</span><span class="r-val">${esc(item.guestMobile||item.mobile||'—')}</span></div></div><div class="r-bot"><span class="r-inv">${esc(item.Invoice||'')}</span><a href="${esc(url)}" target="_blank" rel="noopener" class="r-open">فتح ↗</a></div>`;
    $('baz-cards').appendChild(c);
  };
  const applyFilter=(f)=>{
    d.querySelectorAll('.r-card').forEach(c=>{c.style.display=(f==='all'||c.dataset.status===f)?'':'none';});
    d.querySelectorAll('.f-chip').forEach(c=>{c.classList.toggle('on',c.dataset.f===f);});
  };

  /* SEARCH */
  const runSearch=async(keys)=>{
    if(isSearching)return;
    const val=getVal();const st=$('baz-st');
    if(!val){st.innerHTML='<span class="err">أدخل قيمة بحث أولاً</span>';return;}
    $('baz-cards').innerHTML='';$('baz-opanel').style.display='none';$('baz-fbar').style.display='none';$('baz-alert').style.display='none';
    links=[];openedLinks=new Set();
    const ok=await checkSession();if(!ok){setLoad(false);return;}
    searchController=new AbortController();setLoad(true);
    let count=0;const seen=new Set();
    try{sessionStorage.setItem('baz_q',JSON.stringify({inv:$('f-inv').value,ord:$('f-ord').value,mob:$('f-mob').value}));}catch{}
    for(const sk of keys){
      if(searchController.signal.aborted)break;
      const info=STATUSES[sk];st.innerHTML=`جاري البحث في <b>${esc(info.label)}</b> ...`;
      try{
        const orders=await fetchAll(sk,val,searchController.signal);
        orders.forEach(item=>{if(!item)return;const k=(item.Invoice||'')+':'+(item.onlineNumber||'');if(seen.has(k))return;seen.add(k);count++;addCard(item,info,sk);});
      }catch(e){
        if(e.message==='SESSION'){setLoad(false);return;}
        if(e.name==='AbortError')break;
        st.innerHTML=`<span class="err">خطأ: ${esc(info.label)}</span>`;
      }
    }
    setLoad(false);
    if(searchController.signal.aborted){st.innerHTML=`<span class="err">تم الإلغاء</span> — <b>${count}</b>`;}
    else if(count>0){st.innerHTML=`<span class="ok">✓</span> <b>${count}</b> نتيجة`;$('baz-opanel').style.display='block';if(keys.length>1)$('baz-fbar').style.display='flex';updPanel();}
    else{$('baz-cards').innerHTML=`<div class="empty"><svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#D1D1D6" stroke-width="1.5" stroke-linecap="round"/></svg><div class="empty-t">لا توجد نتائج</div><div class="empty-s">"${esc(val)}"</div></div>`;st.innerHTML='';}
  };

  /* OPEN */
  const openResults=async()=>{
    const n=+$('baz-onum').value||10;const rem=links.filter(l=>!openedLinks.has(l.key));const st=$('baz-st');
    if(!rem.length){st.innerHTML='<span class="ok">✓</span> تم فتح الكل';return;}
    const batch=rem.slice(0,n);
    for(let i=0;i<batch.length;i++){
      st.innerHTML=`فتح <b>${i+1}</b>/<b>${batch.length}</b> ...`;
      window.open(batch[i].url,'_blank');openedLinks.add(batch[i].key);
      const card=d.getElementById('c'+(links.indexOf(batch[i])+1));
      if(card){card.classList.add('opened');const b=card.querySelector('.r-open');if(b)b.outerHTML='<span class="r-done">✓ تم</span>';}
      await new Promise(r=>setTimeout(r,OPEN_DELAY));
    }
    updPanel();const left=links.filter(l=>!openedLinks.has(l.key)).length;
    st.innerHTML=`<span class="ok">✓</span> فُتح <b>${batch.length}</b> — متبقي <b>${left}</b>`;
  };

  /* EVENTS */
  $('baz-min').onclick=()=>{
    isMinimized=!isMinimized;ui.classList.toggle('minimized',isMinimized);
    $('baz-min').innerHTML=isMinimized?'<svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>':'<svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  };
  $('baz-close').onclick=()=>{ui.remove();$('baz-style')?.remove();};
  $('baz-ready').onclick=()=>runSearch(['readypack']);
  $('baz-all').onclick=()=>runSearch(['readypack','new','packed','delivered']);
  $('baz-stop').onclick=()=>{if(searchController)searchController.abort();};
  $('baz-ogo').onclick=openResults;
  d.querySelectorAll('.f-chip').forEach(c=>{c.onclick=()=>applyFilter(c.dataset.f);});
  d.querySelectorAll('#baz-ui .s-input').forEach(el=>{el.onkeypress=e=>{if(e.key==='Enter')runSearch(['readypack']);};});
  try{const q=JSON.parse(sessionStorage.getItem('baz_q')||'{}');if(q.inv)$('f-inv').value=q.inv;if(q.ord)$('f-ord').value=q.ord;if(q.mob)$('f-mob').value=q.mob;}catch{}
})();

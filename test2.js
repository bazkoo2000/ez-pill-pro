javascript: (function () {
  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const STATUSES = {
    readypack: { label: 'Ready to Pack', color: '#10b981', bg: '#ecfdf5', ring: 'rgba(16,185,129,0.15)' },
    new:       { label: 'New',           color: '#f59e0b', bg: '#fffbeb', ring: 'rgba(245,158,11,0.15)' },
    packed:    { label: 'Packed',        color: '#6366f1', bg: '#eef2ff', ring: 'rgba(99,102,241,0.15)' },
    delivered: { label: 'Delivered',     color: '#a855f7', bg: '#faf5ff', ring: 'rgba(168,85,247,0.15)' },
  };
  const FETCH_TIMEOUT=15000,MAX_PAGES=20;
  const d=document;
  const esc=s=>{const el=d.createElement('div');el.appendChild(d.createTextNode((s||'').toString()));return el.innerHTML;};
  const sanitizeURL=url=>{try{const u=new URL(url);return['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return'#';}};
  let links=[],isDrag=false,dX=0,dY=0,isMin=false,ctrl=null,busy=false;
  d.getElementById('bz-w')?.remove();d.getElementById('bz-s')?.remove();

  /* ═══════════════ CSS ═══════════════ */
  const css=d.createElement('style');css.id='bz-s';
  css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
@keyframes bzOpen{from{opacity:0;transform:translate(-50%,-48%) scale(.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes bzCardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes bzSpin{to{transform:rotate(360deg)}}
@keyframes bzShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes bzPulse{0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0.3)}70%{box-shadow:0 0 0 8px rgba(79,70,229,0)}}

#bz-w,#bz-w *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
#bz-w{
  position:fixed;width:440px;max-width:96vw;
  background:#fff;
  z-index:999999;border-radius:16px;direction:rtl;
  font-family:'Tajawal',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  max-height:90vh;display:flex;flex-direction:column;
  border:1px solid #e5e7eb;
  box-shadow:0 20px 60px -15px rgba(0,0,0,0.12),0 4px 20px rgba(0,0,0,0.05);
  overflow:hidden;
  animation:bzOpen .35s cubic-bezier(.16,1,.3,1) both
}
#bz-w.min .bz-bd{display:none}
#bz-w.min{max-height:unset}

/* ── TOP ACCENT ── */
#bz-w::before{
  content:'';position:absolute;top:0;right:0;left:0;height:3px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,#6366f1);
  background-size:200% 100%;animation:bzShimmer 4s linear infinite;
  z-index:1
}

/* ── HEADER ── */
.bz-hd{
  padding:18px 22px 14px;display:flex;align-items:center;justify-content:space-between;
  cursor:grab;user-select:none;flex-shrink:0;
  border-bottom:1px solid #f3f4f6;position:relative
}
.bz-hd:active{cursor:grabbing}
.bz-hd-r{display:flex;align-items:center;gap:14px}
.bz-hd-icon{
  width:44px;height:44px;border-radius:14px;position:relative;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 4px 12px rgba(99,102,241,0.3)
}
.bz-hd-icon::after{
  content:'';position:absolute;inset:0;border-radius:14px;
  background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);pointer-events:none
}
.bz-hd-icon svg{width:22px;height:22px;position:relative;z-index:1}
.bz-hd-title{font-size:19px;font-weight:800;color:#111827;letter-spacing:-0.3px}
.bz-hd-sub{font-size:11px;color:#9ca3af;font-weight:500;margin-top:2px;letter-spacing:0.5px}
.bz-hd-btns{display:flex;gap:6px}
.bz-hd-b{
  width:32px;height:32px;border-radius:10px;border:1px solid #f3f4f6;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:0;
  background:#fff;color:#9ca3af;transition:all .2s
}
.bz-hd-b:hover{background:#f9fafb;color:#6b7280;border-color:#e5e7eb}
.bz-hd-b:active{transform:scale(.9)}
.bz-hd-b.close{color:#ef4444;border-color:rgba(239,68,68,0.15);background:rgba(239,68,68,0.03)}
.bz-hd-b.close:hover{background:rgba(239,68,68,0.06)}

/* ── BODY ── */
.bz-bd{padding:18px 20px 22px;overflow-y:auto;flex:1;scrollbar-width:thin;scrollbar-color:#e5e7eb transparent}
.bz-bd::-webkit-scrollbar{width:4px}
.bz-bd::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px}

/* ── ALERT ── */
.bz-alt{
  background:#fef2f2;border:1px solid #fecaca;border-radius:12px;
  padding:12px 16px;margin-bottom:16px;display:none;
  font-size:13px;color:#dc2626;font-weight:600;text-align:center
}

/* ── INPUTS ── */
.bz-inputs{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.bz-input-wrap{position:relative}
.bz-input-tag{
  position:absolute;right:14px;top:50%;transform:translateY(-50%);
  font-size:12px;font-weight:700;color:#9ca3af;pointer-events:none;
  transition:all .2s
}
.bz-input-tag.accent{
  color:#6366f1;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  font-size:14px;font-weight:900
}
.bz-inp{
  width:100%;height:50px;padding:0 14px 0 14px;padding-right:75px;
  background:#f9fafb;border:1.5px solid #f3f4f6;border-radius:12px;
  font-size:15px;font-weight:600;color:#111827;font-family:inherit;
  outline:none;transition:all .25s cubic-bezier(.16,1,.3,1);
  direction:ltr;text-align:left
}
.bz-inp::placeholder{color:#d1d5db;font-weight:500}
.bz-inp:hover{border-color:#e5e7eb;background:#fff}
.bz-inp:focus{
  border-color:#6366f1;background:#fff;
  box-shadow:0 0 0 4px rgba(99,102,241,0.08)
}
.bz-inp:focus+.bz-input-tag{color:#6366f1}

/* ── SEARCH BTN ── */
.bz-go{
  width:100%;height:52px;border:none;border-radius:12px;cursor:pointer;
  font-size:16px;font-weight:800;font-family:inherit;letter-spacing:-0.2px;
  display:flex;align-items:center;justify-content:center;gap:10px;
  background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);color:#fff;
  box-shadow:0 4px 16px rgba(99,102,241,0.3),0 1px 3px rgba(99,102,241,0.2);
  transition:all .3s cubic-bezier(.16,1,.3,1);
  position:relative;overflow:hidden;margin-bottom:16px
}
.bz-go::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 60%);
  pointer-events:none
}
.bz-go:not(:disabled):hover{
  transform:translateY(-1px);
  box-shadow:0 8px 24px rgba(99,102,241,0.35),0 2px 6px rgba(99,102,241,0.2)
}
.bz-go:not(:disabled):active{transform:translateY(0) scale(.985)}
.bz-go:disabled{opacity:.55;cursor:not-allowed}
.bz-go svg{width:20px;height:20px}
.bz-go.loading{animation:bzPulse 1.5s infinite}

.bz-stop{
  position:absolute;left:8px;top:50%;transform:translateY(-50%);
  width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;
  background:rgba(255,255,255,0.2);color:#fff;
  display:none;align-items:center;justify-content:center;font-size:0;
  transition:all .15s;z-index:1
}
.bz-stop:hover{background:rgba(255,255,255,0.3)}
.bz-stop svg{width:14px;height:14px}

/* ── STATUS ── */
.bz-sbar{display:flex;align-items:center;gap:10px;min-height:20px;margin-bottom:4px}
.bz-spin{
  width:16px;height:16px;border:2.5px solid rgba(99,102,241,0.15);
  border-top-color:#6366f1;border-radius:50%;
  animation:bzSpin .6s linear infinite;display:none;flex-shrink:0
}
.bz-st{font-size:13px;color:#9ca3af;flex:1;font-weight:600}
.bz-st b{color:#6366f1}
.bz-st .err{color:#ef4444}
.bz-st .ok{color:#10b981}

/* ── RESULTS HEADER ── */
.bz-rh{
  display:none;align-items:center;justify-content:space-between;
  padding:14px 0 12px;border-top:1px solid #f3f4f6;margin-top:8px
}
.bz-rh-count{font-size:14px;font-weight:700;color:#111827}
.bz-rh-count span{
  display:inline-flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
  min-width:26px;height:26px;border-radius:8px;font-size:13px;font-weight:800;
  padding:0 6px;margin:0 6px
}
.bz-rh-hint{font-size:11px;color:#d1d5db;font-weight:500}

/* ── FILTER TABS ── */
.bz-tabs{
  display:none;gap:6px;margin-bottom:16px;
  background:#f9fafb;border-radius:12px;padding:4px;border:1px solid #f3f4f6
}
.bz-tab{
  flex:1;padding:9px 8px;border:none;border-radius:9px;
  font-size:12px;font-weight:700;color:#9ca3af;cursor:pointer;
  font-family:inherit;background:transparent;
  transition:all .25s cubic-bezier(.16,1,.3,1);text-align:center;
  position:relative
}
.bz-tab:hover{color:#6b7280}
.bz-tab.on{
  background:#fff;color:#111827;
  box-shadow:0 1px 4px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.03)
}

/* ── CARDS ── */
.bz-cards{display:flex;flex-direction:column;gap:10px}

.bz-c{
  background:#fff;border-radius:14px;position:relative;
  border:1px solid #f3f4f6;cursor:pointer;overflow:hidden;
  transition:all .3s cubic-bezier(.16,1,.3,1);
  animation:bzCardIn .4s cubic-bezier(.16,1,.3,1) both
}
.bz-c:hover{
  border-color:#e5e7eb;
  box-shadow:0 8px 32px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.03);
  transform:translateY(-2px)
}
.bz-c:active{transform:translateY(0) scale(.99);opacity:.95}

/* Color stripe */
.bz-c-stripe{
  position:absolute;right:0;top:12px;bottom:12px;width:4px;
  border-radius:4px 0 0 4px;background:var(--ac)
}

/* Card inner */
.bz-c-in{padding:16px 18px 14px 16px}

.bz-c-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.bz-c-id{
  font-size:17px;font-weight:800;color:#111827;letter-spacing:-0.3px;
  font-variant-numeric:tabular-nums
}
.bz-c-pill{
  font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;
  background:var(--abg);color:var(--ac);letter-spacing:0.2px;
  border:1px solid var(--aring)
}

.bz-c-data{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bz-c-field{}
.bz-c-lbl{font-size:11px;color:#9ca3af;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.bz-c-lbl svg{width:12px;height:12px;opacity:.5}
.bz-c-val{font-size:14px;color:#374151;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.bz-c-ft{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 18px 10px 16px;background:#fafafa;
  border-top:1px solid #f3f4f6
}
.bz-c-inv{font-size:11px;color:#d1d5db;font-family:'SF Mono',ui-monospace,monospace;font-weight:600;letter-spacing:.5px}
.bz-c-go{
  font-size:12px;font-weight:700;color:#6366f1;
  display:flex;align-items:center;gap:5px;transition:gap .2s
}
.bz-c:hover .bz-c-go{gap:8px}
.bz-c-go svg{width:14px;height:14px;transition:transform .25s}
.bz-c:hover .bz-c-go svg{transform:translate(-3px,-3px)}

/* ── EMPTY ── */
.bz-empty{text-align:center;padding:44px 24px}
.bz-empty-ico{
  width:72px;height:72px;border-radius:20px;
  background:#f9fafb;border:1px dashed #e5e7eb;
  display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px
}
.bz-empty-ico svg{width:28px;height:28px;color:#d1d5db}
.bz-empty-t{font-size:16px;color:#374151;font-weight:700;margin-bottom:4px}
.bz-empty-s{font-size:13px;color:#9ca3af;font-weight:500}

/* ── RESPONSIVE ── */
@media(pointer:coarse){
  .bz-inp{height:54px;font-size:16px}
  .bz-go{height:56px;font-size:17px}
}
@media(max-width:460px){
  #bz-w{width:100%;max-width:100%;border-radius:16px 16px 0 0;bottom:0;top:auto!important;left:0!important;transform:none!important;max-height:92vh}
  .bz-c-data{grid-template-columns:1fr}
}
  `;
  d.head.appendChild(css);

  /* ═══════════════ HTML ═══════════════ */
  const ui=d.createElement('div');ui.id='bz-w';
  ui.style.cssText='top:50%;left:50%;transform:translate(-50%,-50%)';
  ui.innerHTML=`
<div class="bz-hd" id="bz-hdr">
  <div class="bz-hd-r">
    <div class="bz-hd-icon"><svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg></div>
    <div><div class="bz-hd-title">البحث الشامل</div><div class="bz-hd-sub">NAHDI · EZ PILL</div></div>
  </div>
  <div class="bz-hd-btns">
    <button class="bz-hd-b" id="bz-min"><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
    <button class="bz-hd-b close" id="bz-x"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
  </div>
</div>
<div class="bz-bd" id="bz-bd">
  <div class="bz-alt" id="bz-alt">انتهت الجلسة — سجّل دخولك مرة أخرى</div>

  <div class="bz-inputs">
    <div class="bz-input-wrap">
      <input class="bz-inp" id="f-inv" placeholder="أدخل رقم الفاتورة" autocomplete="off" style="padding-right:80px">
      <span class="bz-input-tag">الفاتورة</span>
    </div>
    <div class="bz-input-wrap">
      <input class="bz-inp" id="f-ord" placeholder="أدخل رقم الطلب" autocomplete="off" style="padding-right:58px">
      <span class="bz-input-tag accent">ERX</span>
    </div>
    <div class="bz-input-wrap">
      <input class="bz-inp" id="f-mob" placeholder="05xxxxxxxx" autocomplete="off" style="padding-right:65px">
      <span class="bz-input-tag">الجوال</span>
    </div>
  </div>

  <div style="position:relative">
    <button class="bz-go" id="bz-go">
      <svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      بحث في جميع الحالات
    </button>
    <button class="bz-stop" id="bz-stop"><svg fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
  </div>

  <div class="bz-sbar"><div class="bz-spin" id="bz-spin"></div><div class="bz-st" id="bz-st"></div></div>

  <div class="bz-rh" id="bz-rh">
    <div class="bz-rh-count" id="bz-rc"></div>
    <div class="bz-rh-hint">اضغط على الطلب لفتح التفاصيل</div>
  </div>

  <div class="bz-tabs" id="bz-tabs">
    <button class="bz-tab on" data-f="all">الكل</button>
    <button class="bz-tab" data-f="readypack">Ready</button>
    <button class="bz-tab" data-f="new">New</button>
    <button class="bz-tab" data-f="packed">Packed</button>
    <button class="bz-tab" data-f="delivered">Delivered</button>
  </div>

  <div class="bz-cards" id="bz-cards"></div>
</div>`;
  d.body.appendChild(ui);

  /* ═══════════════ DRAG ═══════════════ */
  const hdr=d.getElementById('bz-hdr');
  const startD=(x,y)=>{isDrag=true;const r=ui.getBoundingClientRect();dX=x-r.left;dY=y-r.top;ui.style.transform='none';ui.style.transition='none';};
  const moveD=(x,y)=>{if(!isDrag)return;ui.style.left=Math.max(0,Math.min(innerWidth-ui.offsetWidth,x-dX))+'px';ui.style.top=Math.max(0,Math.min(innerHeight-ui.offsetHeight,y-dY))+'px';};
  const endD=()=>{isDrag=false;ui.style.transition='';};
  hdr.onmousedown=e=>{if(!e.target.closest('.bz-hd-b'))startD(e.clientX,e.clientY);};
  d.onmousemove=e=>moveD(e.clientX,e.clientY);
  d.onmouseup=endD;
  hdr.addEventListener('touchstart',e=>{if(!e.target.closest('.bz-hd-b')){const t=e.touches[0];startD(t.clientX,t.clientY);}},{passive:true});
  d.addEventListener('touchmove',e=>{if(isDrag){const t=e.touches[0];moveD(t.clientX,t.clientY);}},{passive:true});
  d.addEventListener('touchend',endD,{passive:true});

  /* ═══════════════ CORE ═══════════════ */
  const $=id=>d.getElementById(id);

  const getVal=()=>$('f-mob').value.trim()||$('f-inv').value.trim()||$('f-ord').value.trim()||'';

  const setLoad=on=>{
    $('bz-spin').style.display=on?'block':'none';
    $('bz-go').disabled=on;
    if(on)$('bz-go').classList.add('loading');else $('bz-go').classList.remove('loading');
    $('bz-stop').style.display=on?'flex':'none';
    busy=on;
  };

  const checkSession=async()=>{
    try{const c=new AbortController();setTimeout(()=>c.abort(),5000);
    const r=await fetch(BASE_URL+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:1,searchby:'___test___'}),signal:c.signal});
    if(r.status===401||r.status===403||r.redirected){$('bz-alt').style.display='block';return false;}
    $('bz-alt').style.display='none';return true;}catch{return true;}
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
      if(!r.ok){if(r.status===401||r.status===403){$('bz-alt').style.display='block';throw new Error('SESSION');}throw new Error('HTTP '+r.status);}
      const data=await r.json();let ord;try{ord=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list;}catch{ord=[];}
      if(!Array.isArray(ord)||!ord.length)break;
      all=all.concat(ord);if(ord.length<10)break;pg++;
    }
    return all;
  };

  const addCard=(item,info,sk,idx)=>{
    const num=(item.onlineNumber||'').replace(/ERX/gi,'');
    const url=sanitizeURL(BASE_URL+`getEZPill_Details?onlineNumber=${encodeURIComponent(num)}&Invoice=${encodeURIComponent(item.Invoice||'')}&typee=${encodeURIComponent(item.typee||'')}&head_id=${encodeURIComponent(item.head_id||'')}`);
    links.push({url,status:sk});
    const c=d.createElement('div');c.className='bz-c';c.dataset.st=sk;
    c.style.setProperty('--ac',info.color);c.style.setProperty('--abg',info.bg);c.style.setProperty('--aring',info.ring);
    c.style.animationDelay=(idx*0.05)+'s';
    c.innerHTML=`
      <div class="bz-c-stripe"></div>
      <div class="bz-c-in">
        <div class="bz-c-top">
          <span class="bz-c-id">${esc(item.onlineNumber||'—')}</span>
          <span class="bz-c-pill">${esc(info.label)}</span>
        </div>
        <div class="bz-c-data">
          <div class="bz-c-field">
            <div class="bz-c-lbl"><svg fill="none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg> الضيف</div>
            <div class="bz-c-val">${esc(item.guestName||'—')}</div>
          </div>
          <div class="bz-c-field">
            <div class="bz-c-lbl"><svg fill="none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> الجوال</div>
            <div class="bz-c-val">${esc(item.guestMobile||item.mobile||'—')}</div>
          </div>
        </div>
      </div>
      <div class="bz-c-ft">
        <span class="bz-c-inv">${esc(item.Invoice||'')}</span>
        <span class="bz-c-go">فتح التفاصيل <svg fill="none" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>`;
    c.onclick=()=>window.open(url,'_blank');
    $('bz-cards').appendChild(c);
  };

  const applyFilter=f=>{
    d.querySelectorAll('.bz-c').forEach(c=>{c.style.display=(f==='all'||c.dataset.st===f)?'':'none';});
    d.querySelectorAll('.bz-tab').forEach(t=>{t.classList.toggle('on',t.dataset.f===f);});
    const n=f==='all'?links.length:links.filter(l=>l.status===f).length;
    $('bz-rc').innerHTML=`تم العثور على <span>${n}</span> طلب`;
  };

  /* ═══════════════ PARALLEL SEARCH ═══════════════ */
  const runSearch=async()=>{
    if(busy)return;
    const val=getVal();const st=$('bz-st');
    if(!val){st.innerHTML='<span class="err">أدخل قيمة بحث أولاً</span>';return;}
    $('bz-cards').innerHTML='';$('bz-tabs').style.display='none';$('bz-rh').style.display='none';$('bz-alt').style.display='none';
    links=[];
    const ok=await checkSession();if(!ok){setLoad(false);return;}
    ctrl=new AbortController();setLoad(true);
    st.innerHTML='جاري البحث في جميع الحالات ...';
    try{sessionStorage.setItem('bz_q',JSON.stringify({inv:$('f-inv').value,ord:$('f-ord').value,mob:$('f-mob').value}));}catch{}

    const results=await Promise.allSettled(
      Object.keys(STATUSES).map(sk=>fetchAll(sk,val,ctrl.signal).then(orders=>({sk,orders})))
    );

    if(ctrl.signal.aborted){setLoad(false);st.innerHTML='<span class="err">تم الإلغاء</span>';return;}

    let count=0;const seen=new Set();let hasErr=false;
    for(const r of results){
      if(r.status==='rejected'){if(r.reason?.message==='SESSION'){setLoad(false);return;}hasErr=true;continue;}
      const{sk,orders}=r.value;const info=STATUSES[sk];
      orders.forEach(item=>{
        if(!item)return;const k=(item.Invoice||'')+':'+(item.onlineNumber||'');
        if(seen.has(k))return;seen.add(k);
        addCard(item,info,sk,count);count++;
      });
    }
    setLoad(false);

    if(count>0){
      st.innerHTML='';
      $('bz-rh').style.display='flex';
      $('bz-rc').innerHTML=`تم العثور على <span>${count}</span> طلب`;
      $('bz-tabs').style.display='flex';
    }else{
      $('bz-cards').innerHTML=`<div class="bz-empty"><div class="bz-empty-ico"><svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="bz-empty-t">لا توجد نتائج</div><div class="bz-empty-s">لم نجد طلبات مطابقة لـ "${esc(val)}"</div></div>`;
      st.innerHTML=hasErr?'<span class="err">حدث خطأ — حاول مرة أخرى</span>':'';
    }
  };

  /* ═══════════════ EVENTS ═══════════════ */
  $('bz-min').onclick=()=>{
    isMin=!isMin;ui.classList.toggle('min',isMin);
    $('bz-min').innerHTML=isMin?'<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>':'<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  };
  $('bz-x').onclick=()=>{ui.remove();d.getElementById('bz-s')?.remove();};
  $('bz-go').onclick=runSearch;
  $('bz-stop').onclick=()=>{if(ctrl)ctrl.abort();};
  d.querySelectorAll('.bz-tab').forEach(t=>{t.onclick=()=>applyFilter(t.dataset.f);});
  d.querySelectorAll('#bz-w .bz-inp').forEach(el=>{el.onkeypress=e=>{if(e.key==='Enter')runSearch();};});
  try{const q=JSON.parse(sessionStorage.getItem('bz_q')||'{}');if(q.inv)$('f-inv').value=q.inv;if(q.ord)$('f-ord').value=q.ord;if(q.mob)$('f-mob').value=q.mob;}catch{}
})();

javascript: (function () {
  const BASE_URL = 'https://rtlapps.nahdi.sa/ez_pill_web/';
  const STATUS_KEYS = ['readypack','new','packed','delivered'];
  const FETCH_TIMEOUT=15000,MAX_PAGES=20;
  const d=document;
  const esc=s=>{const el=d.createElement('div');el.appendChild(d.createTextNode((s||'').toString()));return el.innerHTML;};
  const sanitizeURL=url=>{try{const u=new URL(url);return['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return'#';}};
  let links=[],ctrl=null,busy=false;
  d.getElementById('nz-panel')?.remove();d.getElementById('nz-css')?.remove();

  const css=d.createElement('style');css.id='nz-css';
  css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
@keyframes nzSlide{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes nzFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes nzSpin{to{transform:rotate(360deg)}}

#nz-panel,#nz-panel *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}

#nz-panel{
  position:fixed;top:0;right:0;bottom:0;width:480px;max-width:100vw;
  background:#f8f9fb;z-index:999999;direction:rtl;
  font-family:'Tajawal',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  display:flex;flex-direction:column;
  box-shadow:-8px 0 40px rgba(0,0,0,0.07),-2px 0 8px rgba(0,0,0,0.02);
  animation:nzSlide .4s cubic-bezier(.22,1,.36,1) both;
  border-left:1px solid #e8eaed
}

/* ── HEADER ── */
.nz-hd{
  padding:22px 36px;display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid #ecedf0;flex-shrink:0;background:#fff
}
.nz-hd-r{display:flex;align-items:center;gap:14px}
.nz-hd-dot{
  width:11px;height:11px;border-radius:50%;
  background:linear-gradient(135deg,#4f6cf7,#7c5cf5);
  box-shadow:0 0 0 3px rgba(79,108,247,0.12);flex-shrink:0
}
.nz-hd-t{font-size:18px;font-weight:800;color:#1a1a2e;letter-spacing:-.3px}
.nz-close{
  width:36px;height:36px;border-radius:10px;border:1px solid #ecedf0;
  background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:#aaa;transition:all .2s
}
.nz-close:hover{background:#f5f5f7;color:#777;border-color:#ddd}
.nz-close:active{transform:scale(.9)}
.nz-close svg{width:15px;height:15px}

/* ── SEARCH ── */
.nz-search{
  padding:28px 36px;border-bottom:1px solid #ecedf0;flex-shrink:0;background:#fff
}
.nz-field{margin-bottom:16px;position:relative}
.nz-field:last-of-type{margin-bottom:20px}
.nz-label{
  display:block;font-size:13px;font-weight:700;color:#7a7f8e;
  margin-bottom:8px;letter-spacing:.2px
}
.nz-input{
  width:100%;height:50px;padding:0 18px;
  background:#f5f6f8;border:1.5px solid #ecedf0;border-radius:12px;
  font-size:15px;font-weight:600;color:#1a1a2e;font-family:inherit;
  outline:none;transition:all .2s;direction:ltr;text-align:left
}
.nz-input::placeholder{color:#c5c8d0;font-weight:500}
.nz-input:hover{border-color:#d8dae0;background:#f0f1f4}
.nz-input:focus{border-color:#4f6cf7;background:#fff;box-shadow:0 0 0 4px rgba(79,108,247,0.07)}

.nz-input-erx{padding-right:65px}
.nz-erx-tag{
  position:absolute;right:18px;top:50%;transform:translateY(-50%);margin-top:14px;
  font-size:15px;font-weight:900;color:#4f6cf7;pointer-events:none
}

.nz-go-wrap{position:relative}
.nz-go{
  width:100%;height:52px;border:none;border-radius:12px;cursor:pointer;
  font-size:16px;font-weight:800;font-family:inherit;letter-spacing:-.1px;
  display:flex;align-items:center;justify-content:center;gap:10px;
  background:linear-gradient(135deg,#4f6cf7 0%,#6558f5 100%);color:#fff;
  box-shadow:0 4px 14px rgba(79,108,247,0.25);
  transition:all .25s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden
}
.nz-go::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent 60%);pointer-events:none}
.nz-go:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,108,247,0.3)}
.nz-go:not(:disabled):active{transform:translateY(0) scale(.985)}
.nz-go:disabled{opacity:.5;cursor:not-allowed}
.nz-go svg{width:19px;height:19px}

.nz-cancel{
  position:absolute;left:10px;top:50%;transform:translateY(-50%);
  width:34px;height:34px;border-radius:9px;border:none;cursor:pointer;
  background:rgba(255,255,255,0.18);color:#fff;
  display:none;align-items:center;justify-content:center;font-size:0;
  transition:all .15s;z-index:1
}
.nz-cancel:hover{background:rgba(255,255,255,0.28)}
.nz-cancel svg{width:14px;height:14px}

/* ── STATUS ── */
.nz-status{
  padding:14px 36px;display:flex;align-items:center;gap:10px;
  min-height:20px;flex-shrink:0;background:#f8f9fb
}
.nz-spin{
  width:15px;height:15px;border:2px solid #e0e2e8;
  border-top-color:#4f6cf7;border-radius:50%;
  animation:nzSpin .6s linear infinite;display:none;flex-shrink:0
}
.nz-st{font-size:13px;color:#9a9fae;font-weight:600;flex:1}
.nz-st b{color:#4f6cf7}
.nz-st .err{color:#ef4444}
.nz-st .ok{color:#22c55e}

/* ── COUNT ── */
.nz-cbar{
  padding:14px 36px;display:none;align-items:center;justify-content:space-between;
  background:#fff;border-bottom:1px solid #ecedf0;flex-shrink:0
}
.nz-ctxt{font-size:14px;font-weight:700;color:#1a1a2e}
.nz-ctxt b{
  display:inline-flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#4f6cf7,#6558f5);color:#fff;
  min-width:26px;height:26px;border-radius:8px;font-size:13px;font-weight:800;
  padding:0 7px;margin:0 5px
}
.nz-chint{font-size:11px;color:#c5c8d0;font-weight:500}

/* ── ALERT ── */
.nz-alt{
  margin:0 0 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;
  padding:12px 16px;display:none;font-size:13px;color:#dc2626;font-weight:600;text-align:center
}

/* ── RESULTS ── */
.nz-results{flex:1;overflow-y:auto;padding:0;background:#f8f9fb}
.nz-results::-webkit-scrollbar{width:0}

.nz-list{
  display:flex;flex-direction:column;gap:10px;
  padding:20px 32px
}

.nz-row{
  display:grid;grid-template-columns:1.1fr 1fr auto;
  align-items:center;gap:20px;padding:16px 20px;
  background:#fff;cursor:pointer;transition:all .2s;
  animation:nzFade .3s ease both;border-radius:12px;
  border:1px solid #ecedf0
}
.nz-row:hover{border-color:#d5d7e0;box-shadow:0 4px 16px rgba(0,0,0,0.04);transform:translateY(-1px)}
.nz-row:active{transform:translateY(0) scale(.99)}

.nz-row-order{font-size:15px;font-weight:800;color:#1a1a2e;letter-spacing:-.2px}
.nz-row-sub{font-size:11px;color:#b8bcc8;font-weight:500;margin-top:4px}
.nz-row-name{font-size:13px;font-weight:700;color:#4a4e5a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.nz-row-arrow{
  width:32px;height:32px;border-radius:9px;background:#f0f1f5;
  display:flex;align-items:center;justify-content:center;
  transition:all .25s;flex-shrink:0
}
.nz-row-arrow svg{width:15px;height:15px;color:#b8bcc8;transition:all .25s}
.nz-row:hover .nz-row-arrow{background:#4f6cf7;box-shadow:0 3px 10px rgba(79,108,247,0.2)}
.nz-row:hover .nz-row-arrow svg{color:#fff;transform:translate(-1px,-1px)}

/* ── EMPTY ── */
.nz-empty{text-align:center;padding:60px 28px}
.nz-empty-ico{
  width:68px;height:68px;border-radius:18px;background:#f0f1f5;
  display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px
}
.nz-empty-ico svg{width:28px;height:28px;color:#c5c8d0}
.nz-empty-t{font-size:16px;color:#4a4e5a;font-weight:700;margin-bottom:6px}
.nz-empty-s{font-size:13px;color:#9a9fae;font-weight:500}

/* ── MOBILE ── */
@media(max-width:520px){
  #nz-panel{width:100%}
  .nz-row{grid-template-columns:1fr 1fr auto;gap:12px;padding:14px 16px}
  .nz-list{padding:16px 20px}
  .nz-search{padding:20px 24px}
  .nz-hd{padding:18px 24px}
  .nz-status{padding:12px 24px}
  .nz-cbar{padding:12px 24px}
}
  `;
  d.head.appendChild(css);

  const panel=d.createElement('div');panel.id='nz-panel';
  panel.innerHTML=`
<div class="nz-hd">
  <div class="nz-hd-r">
    <div class="nz-hd-dot"></div>
    <div class="nz-hd-t">البحث الشامل</div>
  </div>
  <button class="nz-close" id="nz-x"><svg fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
</div>

<div class="nz-search">
  <div class="nz-alt" id="nz-alt">انتهت الجلسة — سجّل دخولك مرة أخرى</div>
  <div class="nz-field">
    <label class="nz-label">رقم الفاتورة</label>
    <input class="nz-input" id="f-inv" placeholder="INV-12345" autocomplete="off">
  </div>
  <div class="nz-field" style="position:relative">
    <label class="nz-label">رقم الطلب</label>
    <input class="nz-input nz-input-erx" id="f-ord" placeholder="أدخل الرقم" autocomplete="off">
    <span class="nz-erx-tag">ERX</span>
  </div>
  <div class="nz-field">
    <label class="nz-label">رقم الجوال</label>
    <input class="nz-input" id="f-mob" placeholder="05xxxxxxxx" autocomplete="off">
  </div>
  <div class="nz-go-wrap">
    <button class="nz-go" id="nz-go">
      <svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      بحث
    </button>
    <button class="nz-cancel" id="nz-stop"><svg fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
  </div>
</div>

<div class="nz-status"><div class="nz-spin" id="nz-spin"></div><div class="nz-st" id="nz-st"></div></div>

<div class="nz-cbar" id="nz-cbar">
  <div class="nz-ctxt" id="nz-ctxt"></div>
  <div class="nz-chint">اضغط على أي طلب لفتحه</div>
</div>

<div class="nz-results" id="nz-results">
  <div class="nz-list" id="nz-list"></div>
</div>`;
  d.body.appendChild(panel);

  /* ═══════ CORE ═══════ */
  const $=id=>d.getElementById(id);
  const getVal=()=>$('f-mob').value.trim()||$('f-inv').value.trim()||$('f-ord').value.trim()||'';

  const setLoad=on=>{
    $('nz-spin').style.display=on?'block':'none';
    $('nz-go').disabled=on;
    $('nz-stop').style.display=on?'flex':'none';
    busy=on;
  };

  const checkSession=async()=>{
    try{const c=new AbortController();setTimeout(()=>c.abort(),5000);
    const r=await fetch(BASE_URL+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'readypack',pageSelected:1,searchby:'___test___'}),signal:c.signal});
    if(r.status===401||r.status===403||r.redirected){$('nz-alt').style.display='block';return false;}
    $('nz-alt').style.display='none';return true;}catch{return true;}
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
      if(!r.ok){if(r.status===401||r.status===403){$('nz-alt').style.display='block';throw new Error('SESSION');}throw new Error('HTTP '+r.status);}
      const data=await r.json();let ord;try{ord=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list;}catch{ord=[];}
      if(!Array.isArray(ord)||!ord.length)break;
      all=all.concat(ord);if(ord.length<10)break;pg++;
    }
    return all;
  };

  const addRow=(item,idx)=>{
    const num=(item.onlineNumber||'').replace(/ERX/gi,'');
    const url=sanitizeURL(BASE_URL+`getEZPill_Details?onlineNumber=${encodeURIComponent(num)}&Invoice=${encodeURIComponent(item.Invoice||'')}&typee=${encodeURIComponent(item.typee||'')}&head_id=${encodeURIComponent(item.head_id||'')}`);
    links.push({url});
    const row=d.createElement('div');row.className='nz-row';
    row.style.animationDelay=(idx*0.04)+'s';
    row.innerHTML=`
      <div>
        <div class="nz-row-order">${esc(item.onlineNumber||'—')}</div>
        <div class="nz-row-sub">${esc(item.Invoice||'')}</div>
      </div>
      <div>
        <div class="nz-row-name">${esc(item.guestName||'—')}</div>
        <div class="nz-row-sub" style="direction:ltr;text-align:left">${esc(item.guestMobile||item.mobile||'—')}</div>
      </div>
      <div class="nz-row-arrow"><svg fill="none" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
    row.onclick=()=>window.open(url,'_blank');
    $('nz-list').appendChild(row);
  };

  const runSearch=async()=>{
    if(busy)return;
    const val=getVal();const st=$('nz-st');
    if(!val){st.innerHTML='<span class="err">أدخل قيمة بحث أولاً</span>';return;}
    $('nz-list').innerHTML='';$('nz-cbar').style.display='none';$('nz-alt').style.display='none';
    links=[];
    const ok=await checkSession();if(!ok){setLoad(false);return;}
    ctrl=new AbortController();setLoad(true);
    st.innerHTML='جاري البحث ...';
    try{sessionStorage.setItem('nz_q',JSON.stringify({inv:$('f-inv').value,ord:$('f-ord').value,mob:$('f-mob').value}));}catch{}

    const results=await Promise.allSettled(
      STATUS_KEYS.map(sk=>fetchAll(sk,val,ctrl.signal).then(orders=>({sk,orders})))
    );
    if(ctrl.signal.aborted){setLoad(false);st.innerHTML='<span class="err">تم الإلغاء</span>';return;}

    let count=0;const seen=new Set();let hasErr=false;
    for(const r of results){
      if(r.status==='rejected'){if(r.reason?.message==='SESSION'){setLoad(false);return;}hasErr=true;continue;}
      r.value.orders.forEach(item=>{
        if(!item)return;const k=(item.Invoice||'')+':'+(item.onlineNumber||'');
        if(seen.has(k))return;seen.add(k);
        addRow(item,count);count++;
      });
    }
    setLoad(false);

    if(count>0){
      st.innerHTML='';
      $('nz-cbar').style.display='flex';
      $('nz-ctxt').innerHTML=`النتائج <b>${count}</b>`;
    }else{
      $('nz-list').innerHTML=`<div class="nz-empty"><div class="nz-empty-ico"><svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="nz-empty-t">لا توجد نتائج</div><div class="nz-empty-s">لم نجد طلبات مطابقة</div></div>`;
      st.innerHTML=hasErr?'<span class="err">حدث خطأ — حاول مرة أخرى</span>':'';
    }
  };

  $('nz-x').onclick=()=>{panel.style.animation='nzSlide .3s cubic-bezier(.22,1,.36,1) reverse both';setTimeout(()=>{panel.remove();d.getElementById('nz-css')?.remove();},300);};
  $('nz-go').onclick=runSearch;
  $('nz-stop').onclick=()=>{if(ctrl)ctrl.abort();};
  d.querySelectorAll('#nz-panel .nz-input').forEach(el=>{el.onkeypress=e=>{if(e.key==='Enter')runSearch();};});
  try{const q=JSON.parse(sessionStorage.getItem('nz_q')||'{}');if(q.inv)$('f-inv').value=q.inv;if(q.ord)$('f-ord').value=q.ord;if(q.mob)$('f-mob').value=q.mob;}catch{}
})();

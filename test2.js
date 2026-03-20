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

@keyframes nzModalEnter {
  from { opacity: 0; transform: scale(0.96) translateY(15px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes nzBackdropEnter {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(5px); }
}
@keyframes nzSpin {
  to { transform: rotate(360deg); }
}

#nz-panel, #nz-panel * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

#nz-panel {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 999999;
  direction: rtl;
  font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: nzBackdropEnter 0.4s ease forwards;
}

.nz-dialog {
  background: #ffffff;
  width: 540px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  animation: nzModalEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
}

/* ── HEADER ── */
.nz-hd {
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
}
.nz-hd-r {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nz-hd-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
}
.nz-hd-icon svg { width: 22px; height: 22px; }
.nz-hd-text-wrap { display: flex; flex-direction: column; }
.nz-hd-t { font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
.nz-hd-sub { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px; }
.nz-close {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
}
.nz-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.nz-close svg { width: 18px; height: 18px; }

/* ── BODY & SEARCH ── */
.nz-body {
  padding: 32px;
  background: #f8fafc;
  flex-shrink: 0;
}
.nz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
.nz-field.full { grid-column: span 2; }
.nz-label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
}
.nz-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.nz-input-wrap svg {
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}
.nz-input {
  width: 100%;
  height: 54px;
  padding: 0 46px 0 16px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  direction: ltr;
  text-align: right;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.nz-input::placeholder { color: #94a3b8; font-weight: 500; }
.nz-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
.nz-erx-tag {
  position: absolute;
  left: 16px;
  font-size: 13px;
  font-weight: 800;
  background: #eff6ff;
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 6px;
  pointer-events: none;
}

/* ── BUTTONS ── */
.nz-actions {
  display: flex;
  gap: 12px;
  position: relative;
}
.nz-go {
  flex: 1;
  height: 56px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 17px;
  font-weight: 800;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #1e293b;
  color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.25);
}
.nz-go:not(:disabled):hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.3); }
.nz-go:not(:disabled):active { transform: translateY(0); }
.nz-go:disabled { opacity: 0.6; cursor: not-allowed; }
.nz-go svg { width: 22px; height: 22px; }

.nz-cancel {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid #fecaca;
  cursor: pointer;
  background: #fef2f2;
  color: #ef4444;
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.nz-cancel:hover { background: #fee2e2; }
.nz-cancel svg { width: 24px; height: 24px; }

/* ── STATUS & ALERTS ── */
.nz-status {
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}
.nz-spin {
  width: 20px;
  height: 20px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: nzSpin 0.7s linear infinite;
  display: none;
}
.nz-st { font-size: 14px; color: #475569; font-weight: 600; flex: 1; }
.nz-st b { color: #3b82f6; font-weight: 800; }
.nz-st .err { color: #ef4444; }

.nz-alt {
  grid-column: span 2;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 20px;
  display: none;
  font-size: 14px;
  color: #b91c1c;
  font-weight: 700;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* ── INFO BAR ── */
.nz-cbar {
  padding: 16px 32px;
  display: none;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.nz-ctxt { font-size: 15px; font-weight: 700; color: #1e293b; }
.nz-ctxt b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 14px;
  margin: 0 6px;
}
.nz-chint { font-size: 13px; color: #64748b; font-weight: 600; }

/* ── RESULTS ── */
.nz-results {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
  max-height: 45vh;
}
.nz-results::-webkit-scrollbar { width: 6px; }
.nz-results::-webkit-scrollbar-track { background: transparent; }
.nz-results::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.nz-list {
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  gap: 14px;
}

.nz-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.nz-row:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.nz-row-info { flex: 1; }
.nz-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.nz-row-order { font-size: 16px; font-weight: 800; color: #0f172a; }
.nz-row-inv { font-size: 13px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; }
.nz-row-details { display: flex; gap: 16px; font-size: 14px; color: #475569; font-weight: 600; }
.nz-row-details div { display: flex; align-items: center; gap: 6px; }
.nz-row-details svg { width: 16px; height: 16px; color: #94a3b8; }

.nz-row-arrow {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-right: 20px;
  border: 1px solid #f1f5f9;
}
.nz-row:hover .nz-row-arrow { background: #1e293b; border-color: #1e293b; }
.nz-row:hover .nz-row-arrow svg { color: #ffffff; transform: translateX(-3px); }
.nz-row-arrow svg { width: 20px; height: 20px; color: #64748b; transition: all 0.2s ease; }

/* ── EMPTY STATE ── */
.nz-empty { text-align: center; padding: 60px 20px; }
.nz-empty-ico {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.nz-empty-ico svg { width: 36px; height: 36px; color: #94a3b8; }
.nz-empty-t { font-size: 18px; color: #0f172a; font-weight: 800; margin-bottom: 8px; }
.nz-empty-s { font-size: 14px; color: #64748b; font-weight: 600; }
  `;
  d.head.appendChild(css);

  const panel=d.createElement('div');
  panel.id='nz-panel';
  panel.innerHTML=`
<div class="nz-dialog">
  <div class="nz-hd">
    <div class="nz-hd-r">
      <div class="nz-hd-icon">
        <svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </div>
      <div class="nz-hd-text-wrap">
        <div class="nz-hd-t">نظام الاستعلام المتقدم</div>
        <div class="nz-hd-sub">إدارة الطلبات والسجلات الطبية</div>
      </div>
    </div>
    <button class="nz-close" id="nz-x"><svg fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
  </div>

  <div class="nz-body">
    <div class="nz-alt" id="nz-alt" style="display:none;">
      <svg fill="none" viewBox="0 0 24 24" width="20" height="20"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      انتهت صلاحية الجلسة النظامية، يُرجى إعادة تسجيل الدخول.
    </div>
    
    <div class="nz-grid">
      <div class="nz-field full">
        <label class="nz-label">معرّف الطلب</label>
        <div class="nz-input-wrap">
          <svg fill="none" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <input class="nz-input" id="f-ord" placeholder="أدخل معرّف الطلب هنا" autocomplete="off" style="padding-left: 60px;">
          <span class="nz-erx-tag">ERX</span>
        </div>
      </div>
      <div class="nz-field">
        <label class="nz-label">معرّف الفاتورة</label>
        <div class="nz-input-wrap">
          <svg fill="none" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <input class="nz-input" id="f-inv" placeholder="مثال: INV-123" autocomplete="off">
        </div>
      </div>
      <div class="nz-field">
        <label class="nz-label">رقم الهاتف المحمول</label>
        <div class="nz-input-wrap">
          <svg fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <input class="nz-input" id="f-mob" placeholder="05xxxxxxxx" autocomplete="off">
        </div>
      </div>
    </div>

    <div class="nz-actions">
      <button class="nz-go" id="nz-go">
        تنفيذ الاستعلام
      </button>
      <button class="nz-cancel" id="nz-stop"><svg fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>
    </div>
  </div>

  <div class="nz-status">
    <div class="nz-spin" id="nz-spin"></div>
    <div class="nz-st" id="nz-st">في انتظار تحديد معايير البحث...</div>
  </div>

  <div class="nz-cbar" id="nz-cbar">
    <div class="nz-ctxt" id="nz-ctxt"></div>
    <div class="nz-chint">انقر على السجل لعرض التفاصيل الكاملة</div>
  </div>

  <div class="nz-results" id="nz-results">
    <div class="nz-list" id="nz-list"></div>
  </div>
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
    if(r.status===401||r.status===403||r.redirected){$('nz-alt').style.display='flex';return false;}
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
      if(!r.ok){if(r.status===401||r.status===403){$('nz-alt').style.display='flex';throw new Error('SESSION');}throw new Error('HTTP '+r.status);}
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
    row.style.animation=`nzModalEnter 0.4s cubic-bezier(0.16,1,0.3,1) ${(idx*0.05)}s both`;
    row.innerHTML=`
      <div class="nz-row-info">
        <div class="nz-row-header">
          <span class="nz-row-order">${esc(item.onlineNumber||'—')}</span>
          <span class="nz-row-inv">${esc(item.Invoice||'—')}</span>
        </div>
        <div class="nz-row-details">
          <div>
            <svg fill="none" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ${esc(item.guestName||'غير مسجل')}
          </div>
          <div style="direction:ltr">
            <svg fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ${esc(item.guestMobile||item.mobile||'—')}
          </div>
        </div>
      </div>
      <div class="nz-row-arrow"><svg fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
    row.onclick=()=>window.open(url,'_blank');
    $('nz-list').appendChild(row);
  };

  const runSearch=async()=>{
    if(busy)return;
    const val=getVal();const st=$('nz-st');
    if(!val){st.innerHTML='<span class="err">يُرجى إدخال معيار للبحث أولاً.</span>';return;}
    $('nz-list').innerHTML='';$('nz-cbar').style.display='none';$('nz-alt').style.display='none';
    links=[];
    const ok=await checkSession();if(!ok){setLoad(false);return;}
    ctrl=new AbortController();setLoad(true);
    st.innerHTML='جاري معالجة الاستعلام واستخراج السجلات...';
    try{sessionStorage.setItem('nz_q',JSON.stringify({inv:$('f-inv').value,ord:$('f-ord').value,mob:$('f-mob').value}));}catch{}

    const results=await Promise.allSettled(
      STATUS_KEYS.map(sk=>fetchAll(sk,val,ctrl.signal).then(orders=>({sk,orders})))
    );
    if(ctrl.signal.aborted){setLoad(false);st.innerHTML='<span class="err">تم إلغاء عملية الاستعلام.</span>';return;}

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
      st.innerHTML='اكتمل الاستعلام بنجاح.';
      $('nz-cbar').style.display='flex';
      $('nz-ctxt').innerHTML=`إجمالي السجلات المطابقة: <b>${count}</b>`;
    }else{
      $('nz-list').innerHTML=`<div class="nz-empty"><div class="nz-empty-ico"><svg fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="nz-empty-t">لا توجد سجلات مطابقة</div><div class="nz-empty-s">لم يتم العثور على أي بيانات تطابق معايير البحث المدخلة.</div></div>`;
      st.innerHTML=hasErr?'<span class="err">حدث خطأ أثناء الاتصال بالنظام — يُرجى المحاولة لاحقاً.</span>':'';
    }
  };

  $('nz-x').onclick=()=>{
    panel.style.animation='nzBackdropEnter 0.3s reverse forwards';
    panel.querySelector('.nz-dialog').style.animation='nzModalEnter 0.3s reverse forwards';
    setTimeout(()=>{panel.remove();d.getElementById('nz-css')?.remove();},300);
  };
  $('nz-go').onclick=runSearch;
  $('nz-stop').onclick=()=>{if(ctrl)ctrl.abort();};
  d.querySelectorAll('#nz-panel .nz-input').forEach(el=>{el.onkeypress=e=>{if(e.key==='Enter')runSearch();};});
  try{const q=JSON.parse(sessionStorage.getItem('nz_q')||'{}');if(q.inv)$('f-inv').value=q.inv;if(q.ord)$('f-ord').value=q.ord;if(q.mob)$('f-mob').value=q.mob;}catch{}
})();

(function(){
  'use strict';
  const PANEL_ID='ali_sys_v5';const VERSION='5.4';
  if(document.getElementById(PANEL_ID)){document.getElementById(PANEL_ID).remove();return}
  const MAX_PER_FILE=49;
  const state={savedRows:[],visitedSet:new Set(),isProcessing:false,isSyncing:false,htmlBuffer:''};
  const IOS={bg:'rgba(243,244,246,0.92)',card:'#ffffff',text:'#1f2937',muted:'#9ca3af',accent:'#6366f1',accent2:'#818cf8',success:'#22c55e',error:'#ef4444',warn:'#f59e0b',blue:'#3b82f6',shadow:'0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)',font:'-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif'};

  const bodyText=document.body.innerText;const packedMatch=bodyText.match(/packed\s*\n*\s*(\d+)/i);const totalPacked=packedMatch?parseInt(packedMatch[1]):0;const defaultPages=totalPacked>0?Math.ceil(totalPacked/10):1;
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')}

  function showToast(msg,type='info'){
    let c=document.getElementById('ali-toast-container');if(!c){c=document.createElement('div');c.id='ali-toast-container';c.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';document.body.appendChild(c)}
    const cl={success:'#22c55e',error:'#ef4444',warning:'#f59e0b',info:'#6366f1'};const ic={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    const t=document.createElement('div');t.style.cssText=`background:${IOS.card};color:${cl[type]};padding:12px 22px;border-radius:14px;font-size:13px;font-weight:700;font-family:${IOS.font};box-shadow:0 8px 30px rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)`;
    t.innerHTML=`<span>${ic[type]}</span> ${esc(msg)}`;c.appendChild(t);setTimeout(()=>{t.style.transition='all 0.3s';t.style.opacity='0';t.style.transform='translateY(10px)';setTimeout(()=>t.remove(),300)},3500);
  }

  function showDialog({icon,title,desc,info,badges,buttons}){
    return new Promise(resolve=>{
      const ov=document.createElement('div');ov.style.cssText=`position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.25);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.2s`;
      let infoH='';if(info&&info.length){infoH=info.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 16px;background:${IOS.bg};border-radius:12px;margin-bottom:6px"><span style="font-size:13px;color:${IOS.muted};font-weight:600">${esc(r.label)}</span><span style="font-weight:800;color:${esc(r.color||IOS.accent)};font-size:14px">${esc(String(r.value))}</span></div>`).join('')}
      let badH='';if(badges&&badges.length){badH='<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:4px 0 8px">';badges.forEach(b=>{const bs=b.active?`color:${IOS.accent};background:rgba(99,102,241,0.08)`:`color:${IOS.muted};background:${IOS.bg}`;badH+=`<span style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;${bs}">${esc(b.text)}</span>`});badH+='</div>'}
      let btnH='';if(buttons&&buttons.length){btnH=buttons.map((bt,idx)=>{const bc=bt.primary?`background:${IOS.accent};color:white;font-weight:800`:`background:rgba(0,0,0,0.04);color:${IOS.muted};font-weight:700`;return`<button data-idx="${idx}" style="flex:1;padding:14px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-family:${IOS.font};transition:all 0.2s;${bc}">${esc(bt.text)}</button>`}).join('')}
      ov.innerHTML=`<div style="background:${IOS.card};border-radius:20px;width:380px;max-width:90vw;overflow:hidden;font-family:${IOS.font};direction:rtl;color:${IOS.text};box-shadow:0 20px 60px rgba(0,0,0,0.12);animation:aliDialogIn 0.35s cubic-bezier(0.16,1,0.3,1)"><div style="padding:28px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:18px;background:rgba(99,102,241,0.06);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px">${icon}</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">${esc(title)}</div><div style="font-size:13px;color:${IOS.muted};line-height:1.7">${esc(desc)}</div></div>${badH}<div style="padding:16px 24px">${infoH}</div><div style="padding:6px 24px 24px;display:flex;gap:10px">${btnH}</div></div>`;
      ov.addEventListener('click',e=>{const btn=e.target.closest('[data-idx]');if(btn){const idx=parseInt(btn.getAttribute('data-idx'));ov.style.transition='opacity 0.2s';ov.style.opacity='0';setTimeout(()=>ov.remove(),200);resolve({action:buttons[idx].value})}});
      document.body.appendChild(ov);
    });
  }

  const styleEl=document.createElement('style');styleEl.innerHTML=`
    @keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes aliSpin{to{transform:rotate(360deg)}}
    @keyframes aliFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes aliDialogIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}
    @keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}
    #${PANEL_ID}{position:fixed;top:14px;right:14px;width:400px;max-height:92vh;background:${IOS.bg};backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);z-index:999999;font-family:${IOS.font};direction:rtl;color:${IOS.text};overflow:hidden;transition:all 0.4s;animation:aliSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)}
    #${PANEL_ID}.ali-minimized{width:56px!important;height:56px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6366f1,#8b5cf6)!important;box-shadow:0 8px 24px rgba(99,102,241,0.3)!important;animation:aliPulse 2s infinite;overflow:hidden}
    #${PANEL_ID}.ali-minimized .ali-inner{display:none!important}
    #${PANEL_ID}.ali-minimized::after{content:"📝";font-size:22px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
    .fast-row{border-bottom:0.5px solid #f3f4f6;transition:background 0.15s}
    .fast-row:hover{background:#f9fafb}
    .ali-link{color:${IOS.accent};text-decoration:underline;font-weight:bold;cursor:pointer}
    .ios-input:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15)}
    .ios-input.match{background:rgba(34,197,94,0.04);box-shadow:0 0 0 2px rgba(34,197,94,0.15)}
    .ios-input.nomatch{background:rgba(239,68,68,0.04);box-shadow:0 0 0 2px rgba(239,68,68,0.15)}
  `;document.head.appendChild(styleEl);

  const panel=document.createElement('div');panel.id=PANEL_ID;
  panel.innerHTML=`<div class="ali-inner">
    <div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25)">📝</div>
        <div><div style="font-size:15px;font-weight:800;color:#1f2937">تقفيل الطلبات</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v${VERSION} — iOS Edition</div></div>
      </div>
      <div style="display:flex;gap:6px">
        <button id="ali_min" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">−</button>
        <button id="ali_close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
    </div>
    <div style="padding:10px 16px;overflow-y:auto;max-height:calc(92vh - 60px)" id="ali_body">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
        <div style="background:${IOS.card};border-radius:14px;padding:10px 6px;text-align:center;box-shadow:${IOS.shadow}"><div style="font-size:16px;margin-bottom:3px">📥</div><div id="stat_rec" style="font-size:20px;font-weight:900;color:#22c55e">0</div><div style="font-size:8px;color:${IOS.muted};font-weight:700">Received</div></div>
        <div style="background:${IOS.card};border-radius:14px;padding:10px 6px;text-align:center;box-shadow:${IOS.shadow}"><div style="font-size:16px;margin-bottom:3px">📦</div><div id="stat_pack" style="font-size:20px;font-weight:900;color:#f59e0b">0</div><div style="font-size:8px;color:${IOS.muted};font-weight:700">Packed</div></div>
        <div style="background:${IOS.card};border-radius:14px;padding:10px 6px;text-align:center;box-shadow:${IOS.shadow}"><div style="font-size:16px;margin-bottom:3px">✅</div><div id="stat_done" style="font-size:20px;font-weight:900;color:#3b82f6">0</div><div style="font-size:8px;color:${IOS.muted};font-weight:700">المنجز</div></div>
        <div style="background:${IOS.card};border-radius:14px;padding:10px 6px;text-align:center;box-shadow:${IOS.shadow}"><div style="font-size:16px;margin-bottom:3px">📊</div><div id="stat_total" style="font-size:20px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:8px;color:${IOS.muted};font-weight:700">إجمالي</div></div>
      </div>
      <div style="background:${IOS.card};border-radius:14px;padding:14px 16px;box-shadow:${IOS.shadow};margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:13px;font-weight:700">📄 نطاق الفحص</span>
          <input type="number" id="p_lim" value="${defaultPages}" min="1" style="width:60px;padding:8px;border:none;border-radius:10px;text-align:center;font-size:15px;font-weight:900;color:${IOS.accent};background:rgba(0,0,0,0.03);outline:none;font-family:${IOS.font}">
        </div>
        <div style="height:6px;background:rgba(0,0,0,0.04);border-radius:6px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:6px;transition:width 0.2s"></div></div>
      </div>
      <div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:rgba(34,197,94,0.06);color:#22c55e"><span>✅</span><span>النظام في وضع الاستعداد</span></div>
      <div id="ali_dynamic_area"><button id="ali_start" style="width:100%;padding:16px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:15px;font-family:${IOS.font};background:${IOS.accent};color:white;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s">🚀 بدء عملية البحث والاستعلام</button></div>
      <div style="text-align:center;padding:12px 0 4px;font-size:9px;color:${IOS.muted};font-weight:700;letter-spacing:0.5px">DEVELOPED BY على الباز</div>
    </div>
  </div>`;
  document.body.appendChild(panel);

  function setStatus(text,type){const el=document.getElementById('status-msg');if(!el)return;const cf={ready:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'✅'},working:{color:'#6366f1',bg:'rgba(99,102,241,0.06)',icon:'spinner'},error:{color:'#ef4444',bg:'rgba(239,68,68,0.06)',icon:'❌'},done:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'✅'}};const c=cf[type]||cf.ready;const ih=c.icon==='spinner'?`<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:${IOS.accent};border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>`:`<span>${c.icon}</span>`;el.style.cssText=`display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:${c.bg};color:${c.color};transition:all 0.3s`;el.innerHTML=`${ih}<span>${esc(text)}</span>`}
  function animNum(id,val){const el=document.getElementById(id);if(!el||el.innerText===String(val))return;requestAnimationFrame(()=>{el.innerText=val;el.style.animation='aliCountUp 0.4s';setTimeout(()=>el.style.animation='',400)})}
  function updateStats(){let rec=0,done=0,packed=0;state.savedRows.forEach(r=>{if(r.st==='received')rec++;if(r.st==='processed')done++;if(r.st==='packed')packed++});animNum('stat_rec',rec);animNum('stat_pack',packed);animNum('stat_done',done);animNum('stat_total',state.savedRows.length)}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  function debounce(fn,d){let t;return function(){clearTimeout(t);t=setTimeout(fn,d)}}

  panel.addEventListener('click',e=>{if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',e=>{e.stopPropagation();panel.style.transition='all 0.3s';panel.style.opacity='0';panel.style.transform='translateX(40px) scale(0.97)';setTimeout(()=>panel.remove(),300)});
  document.getElementById('ali_min').addEventListener('click',e=>{e.stopPropagation();panel.classList.add('ali-minimized')});

  function processData(data){let orders=[];try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list}catch(e){}if(!orders||orders.length===0)return;for(let i=0;i<orders.length;i++){const item=orders[i];const inv=item.Invoice||'';const onl=item.onlineNumber||'';const src=item.source||'StorePaid';const hid=item.head_id||'';const typee=item.typee!==undefined?item.typee:'';if(inv.length>=5&&inv.startsWith('0')&&!state.visitedSet.has(inv)){state.visitedSet.add(inv);let st='other';let raw=String(item.status||item.Status||item.order_status||item.OrderStatus||'').toLowerCase().replace(/<[^>]*>?/gm,'').trim();if(raw.includes('packed'))st='packed';else if(raw.includes('received'))st='received';else{let cs=JSON.stringify(item).toLowerCase();if(cs.includes('"packed"'))st='packed';else if(cs.includes('"received"'))st='received'}const bg=st==='received'?'rgba(34,197,94,0.06)':(st==='packed'?'rgba(245,158,11,0.06)':'transparent');state.htmlBuffer+=`<tr class="fast-row" id="row_${esc(inv)}" style="background:${bg}" data-inv="${esc(inv)}" data-onl="${esc(onl)}" data-src="${esc(src)}" data-hid="${esc(hid)}"><td style="padding:12px 8px"><span class="ali-link">${esc(inv)}</span></td><td style="padding:12px 8px">${esc(onl)}</td><td style="padding:12px 8px">${esc(item.guestName||'')}</td><td style="padding:12px 8px">${esc(item.guestMobile||item.mobile||'')}</td><td style="padding:12px 8px">${esc(item.payment_method||'Cash')}</td><td style="padding:12px 8px">${esc(item.created_at||item.Created_Time||'')}</td><td id="st_${esc(inv)}" style="padding:12px 8px">${esc(st)}</td><td style="padding:12px 8px">${esc(src)}</td></tr>`;state.savedRows.push({id:inv,onl:onl,st:st,typee:typee,guestName:item.guestName||'',guestMobile:item.guestMobile||item.mobile||'',src:src,hid:hid})}}}

  async function scanAllPages(){state.isProcessing=true;const fill=document.getElementById('p-fill');const baseUrl=window.location.origin+"/ez_pill_web/";const currentStatus='packed';setStatus('جاري الاتصال بقاعدة البيانات...','working');let maxPages=parseInt(document.getElementById('p_lim').value)||1;state.savedRows=[];state.visitedSet.clear();state.htmlBuffer='';try{const res1=await fetch(baseUrl+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:currentStatus,pageSelected:1,searchby:''})});const data1=await res1.json();if(data1.total_orders){const et=parseInt(data1.total_orders)||0;if(et>0){maxPages=Math.ceil(et/10);document.getElementById('p_lim').value=maxPages}}processData(data1);updateStats();if(fill)fill.style.width=((1/maxPages)*100)+'%';const fp=[];for(let i=2;i<=maxPages;i++){fp.push(fetch(baseUrl+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:currentStatus,pageSelected:i,searchby:''})}).then(r=>r.json()).then(data=>{processData(data);updateStats()}).catch(err=>{console.warn('فشل صفحة '+i,err)}))}await Promise.all(fp);if(fill)fill.style.width='100%'}catch(err){console.error(err);setStatus('خطأ في الاتصال بالخادم','error');showToast('فشل الاتصال بالخادم','error');state.isProcessing=false;return}finishScan()}

  function finishScan(){state.isProcessing=false;const tables=document.querySelectorAll('table');let target=tables[0];if(target){for(const t of tables)if(t.innerText.length>target.innerText.length)target=t;const tbody=target.querySelector('tbody')||target;tbody.innerHTML=state.htmlBuffer;tbody.addEventListener('click',e=>{const row=e.target.closest('tr[data-inv]');if(!row)return;const inv=row.dataset.inv;const onl=row.dataset.onl;const src=row.dataset.src;const hid=row.dataset.hid;if(inv&&typeof getDetails==='function')getDetails(onl,inv,src,hid)})}
    let recCount=0;state.savedRows.forEach(r=>{if(r.st==='received')recCount++});
    setStatus(`اكتملت العملية: تم حصر ${state.savedRows.length} سجل`,'done');showToast(`اكتمل الحصر: ${state.savedRows.length} سجل`,'success');

    const da=document.getElementById('ali_dynamic_area');
    da.innerHTML=`
      <div style="background:rgba(99,102,241,0.06);border-radius:12px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:${IOS.accent};font-weight:700;text-align:center">✅ تم تفعيل الروابط المباشرة لفتح تفاصيل الطلبات</div>
      <div style="background:${IOS.card};border-radius:14px;padding:14px 16px;box-shadow:${IOS.shadow};margin-bottom:10px">
        <div style="position:relative;margin-bottom:8px">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:900;color:${IOS.muted};pointer-events:none;font-family:monospace">0</span>
          <input type="text" id="ali_sI" class="ios-input" placeholder="أدخل الأرقام بعد الـ 0..." style="width:100%;padding:12px 16px;padding-left:30px;border:none;border-radius:12px;font-size:14px;font-family:${IOS.font};outline:none;background:rgba(0,0,0,0.03);color:${IOS.text};transition:all 0.2s;font-weight:600;box-sizing:border-box;direction:ltr;text-align:left;letter-spacing:1px;font-family:monospace">
        </div>
        <div style="position:relative">
          <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">🔗</span>
          <input type="text" id="ali_sO" class="ios-input" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:12px 16px;padding-right:36px;border:none;border-radius:12px;font-size:14px;font-family:${IOS.font};outline:none;background:rgba(0,0,0,0.03);color:${IOS.text};transition:all 0.2s;font-weight:600;box-sizing:border-box;direction:rtl">
        </div>
      </div>
      <div id="ali_search_count" style="font-size:11px;color:${IOS.muted};text-align:center;font-weight:600;padding:2px 0 10px">عرض ${state.savedRows.length} من ${state.savedRows.length} نتيجة</div>
      <button id="ali_btn_open" style="width:100%;padding:14px;border:none;border-radius:12px;cursor:not-allowed;font-weight:800;font-size:14px;font-family:${IOS.font};background:${IOS.success};color:white;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;margin-bottom:8px;opacity:0.7">⚡ ابحث أولاً ثم افتح المطابق</button>
      <div style="background:${IOS.card};border-radius:14px;padding:14px 16px;box-shadow:${IOS.shadow};margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:700">الطلبات القابلة للتسليم:</span>
        <input type="number" id="ali_open_count" value="${recCount}" style="width:56px;padding:8px;border:none;border-radius:10px;text-align:center;font-size:16px;font-weight:900;color:${IOS.error};background:rgba(0,0,0,0.03);outline:none;font-family:${IOS.font}" onfocus="this.value=''">
      </div>
      <button id="ali_btn_deliver_silent" style="width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:${IOS.font};background:${IOS.error};color:white;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;margin-bottom:8px">📝 تنفيذ أوامر التسليم (Received)</button>
      <button id="ali_btn_export" style="width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:${IOS.font};background:${IOS.warn};color:white;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;margin-bottom:8px">📦 تصدير بيانات الطلبات (Packed)</button>
      <button id="ali_btn_sync" style="width:100%;padding:12px;border:none;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px;font-family:${IOS.font};background:rgba(0,0,0,0.03);color:${IOS.muted};display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s">🔄 إعادة فحص البيانات</button>`;

    // Search Logic
    const sI=document.getElementById('ali_sI'), sO=document.getElementById('ali_sO'), sc=document.getElementById('ali_search_count'), ob=document.getElementById('ali_btn_open');
    let cm=[];
    function fr(){
      const ri=sI.value.trim(); const is=ri!==''?'0'+ri:''; const os=sO.value.trim().toLowerCase();
      let sh=0; cm=[]; const hf=is!==''||os!=='';
      for(let i=0;i<state.savedRows.length;i++){
        const rw=state.savedRows[i];
        const mi=is!==''&&rw.id.startsWith(is);
        const mo=os!==''&&rw.onl.toLowerCase().includes(os);
        const s=hf?(mi||mo):true;
        const rowEl=document.getElementById('row_'+rw.id);
        if(rowEl) rowEl.style.display=s?'':'none';
        if(s){sh++; if(hf)cm.push(rw);}
      }
      sc.innerText=`عرض ${sh} من ${state.savedRows.length} نتيجة`;
      if(hf&&cm.length>0){
        ob.innerHTML=`⚡ فتح المطابق (${cm.length} طلب)`; ob.style.opacity='1'; ob.style.cursor='pointer';
      }else if(hf&&cm.length===0){
        ob.innerHTML='⚡ لا توجد نتائج'; ob.style.opacity='0.5'; ob.style.cursor='not-allowed';
      }else{
        ob.innerHTML='⚡ ابحث أولاً ثم افتح المطابق'; ob.style.opacity='0.7'; ob.style.cursor='not-allowed';
      }
      sI.className='ios-input'+(ri.length>0?(sh>0?' match':' nomatch'):'');
      sO.className='ios-input'+(os.length>0?(sh>0?' match':' nomatch'):'');
    }
    sI.addEventListener('input',debounce(fr,150));
    sO.addEventListener('input',debounce(fr,150));

    ob.addEventListener('click',async function(){
      const ri=sI.value.trim(); const os=sO.value.trim().toLowerCase(); const hf=ri!==''||os!=='';
      if(!hf){
        showToast('ابحث أولاً برقم الفاتورة أو رقم الطلب!','warning');
        sI.focus(); sI.style.animation='aliBlink 0.5s 3'; setTimeout(()=>{sI.style.animation=''},1500); return;
      }
      if(cm.length===0){showToast('لا توجد طلبات مطابقة!','warning');return;}
      ob.disabled=true; ob.style.opacity='0.6'; ob.style.cursor='not-allowed';
      let opened=0, failed=0;
      const baseUrl=window.location.origin+"/ez_pill_web/getEZPill_Details";
      for(let idx=0;idx<cm.length;idx++){
        const it=cm[idx];
        const url=`${baseUrl}?onlineNumber=${encodeURIComponent(it.onl.replace(/ERX/gi,''))}&Invoice=${encodeURIComponent(it.id)}&typee=${encodeURIComponent(it.typee)}&head_id=${encodeURIComponent(it.hid)}`;
        try{
          const w=window.open(url,"_blank");
          if(w){opened++;window.focus();try{w.blur()}catch(e){}}else failed++;
        }catch(e){failed++;}
        ob.innerHTML=`🚀 جاري الفتح (${idx+1}/${cm.length})`;
        setStatus(`فتح ${idx+1} من ${cm.length}: ${it.onl||it.id}`,'working');
        if(idx<cm.length-1) await sleep(1200);
      }
      showToast(`تم فتح ${opened} طلب (فشل ${failed})`,opened>0?'success':'error');
      setStatus('تم فتح المطابق بنجاح','done');
      ob.disabled=false; ob.innerHTML=`⚡ فتح المطابق (${cm.length} طلب)`; fr();
    });

    // Deliver
    document.getElementById('ali_btn_deliver_silent').addEventListener('click',async()=>{
      const list=state.savedRows.filter(r=>r.st==='received');const count=parseInt(document.getElementById('ali_open_count').value)||list.length;const toD=list.slice(0,count);
      if(!toD.length){showToast('لا توجد سجلات مطابقة','warning');return}
      const res=await showDialog({icon:'📝',title:'تأكيد أمر التسليم',desc:'سيتم إرسال طلبات التحديث للخادم',badges:[{text:'📥 Received: '+toD.length,active:true},{text:'⚡ معالجة تلقائية',active:true}],info:[{label:'إجمالي السجلات',value:toD.length,color:IOS.error},{label:'العملية',value:'تحديث حالة التسليم',color:IOS.accent}],buttons:[{text:'إلغاء',value:'cancel',primary:false},{text:'✅ تأكيد',value:'confirm',primary:true}]});
      if(res.action!=='confirm')return;
      const btn=document.getElementById('ali_btn_deliver_silent');btn.disabled=true;btn.style.opacity='0.7';
      let sc=0;const dUrl=window.location.origin+'/ez_pill_web/getEZPill_Details/updatetoDeliver';
      for(let i=0;i<toD.length;i++){const it=toD[i];btn.innerHTML=`<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري (${i+1}/${toD.length})...`;
        try{const params=new URLSearchParams();params.append('invoice_num',it.id);params.append('patienName',it.guestName);params.append('mobile',it.guestMobile);const r=await fetch(dUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:params});if(r.ok){sc++;it.st='processed';const rowEl=document.getElementById('row_'+it.id);if(rowEl){rowEl.style.background='rgba(0,0,0,0.03)';rowEl.style.opacity='0.5';const stEl=document.getElementById('st_'+it.id);if(stEl)stEl.innerText='processed'}}}catch(e){console.warn('فشل:',it.id,e)}updateStats();await sleep(150)}
      await showDialog({icon:'🎉',title:'اكتمل التنفيذ',desc:'تم معالجة أوامر التسليم بنجاح',badges:[{text:'✅ نجح: '+sc,active:true},{text:'❌ فشل: '+(toD.length-sc),active:(toD.length-sc)>0}],info:[{label:'تم تسليمه',value:sc,color:IOS.success},{label:'من إجمالي',value:toD.length,color:IOS.accent}],buttons:[{text:'👍 تمام',value:'ok',primary:true}]});
      showToast(`تم تنفيذ ${sc} سجل`,'success');btn.innerHTML='✅ اكتمل التنفيذ';btn.style.background=IOS.success;btn.style.opacity='1';btn.disabled=false});

    // Export
    document.getElementById('ali_btn_export').addEventListener('click',async()=>{
      const ri=sI.value.trim(); const os=sO.value.trim().toLowerCase(); const hf=ri!==''||os!=='';
      const targetList=hf?cm:state.savedRows;
      const pr=targetList.filter(r=>r.st==='packed');
      if(!pr.length){showToast('لا توجد بيانات مطابقة للتصدير','warning');return}
      const res=await showDialog({icon:'📦',title:'تصدير البيانات',desc:'سيتم تصدير بيانات الطلبات المجهزة كملفات نصية',info:[{label:'عدد الطلبات',value:pr.length,color:IOS.warn},{label:'عدد الملفات',value:Math.ceil(pr.length/MAX_PER_FILE),color:IOS.accent}],buttons:[{text:'إلغاء',value:'cancel',primary:false},{text:'📥 تصدير',value:'confirm',primary:true}]});
      if(res.action!=='confirm')return;
      const nf=Math.ceil(pr.length/MAX_PER_FILE);for(let i=0;i<nf;i++){const chunk=pr.slice(i*MAX_PER_FILE,Math.min((i+1)*MAX_PER_FILE,pr.length));const content=chunk.map(r=>r.onl).join('\n');const blob=new Blob([content],{type:'text/plain'});const url=URL.createObjectURL(blob);setTimeout(()=>{const a=document.createElement('a');a.href=url;a.download='Data_Export_'+(i+1)+'.txt';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)},i*500)}showToast(`تم تصدير ${nf} ملف`,'success')});

    // Sync
    document.getElementById('ali_btn_sync').addEventListener('click',async function(){
      if(state.isProcessing){showToast('العملية جارية — انتظر!','warning');return}
      const sb=this;const oc=state.savedRows.length;
      const res=await showDialog({icon:'🔄',title:'إعادة فحص البيانات',desc:'سيتم إعادة جلب كل البيانات من الخادم',badges:[{text:'حذف القديم',active:true},{text:'جلب الجديد',active:true},{text:'تحديث الحالات',active:true}],info:[{label:'السجلات الحالية',value:oc,color:IOS.accent},{label:'العملية',value:'فحص شامل',color:IOS.blue}],buttons:[{text:'إلغاء',value:'cancel',primary:false},{text:'🔄 بدء',value:'confirm',primary:true}]});
      if(res.action!=='confirm')return;
      sb.disabled=true;sb.innerHTML=`<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري الفحص...`;sb.style.color=IOS.accent;
      await scanAllPages()});
  }

  document.getElementById('ali_start').addEventListener('click',function(){if(state.isProcessing)return;this.disabled=true;this.innerHTML=`<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري الفحص...`;this.style.opacity='0.7';scanAllPages()});
})();

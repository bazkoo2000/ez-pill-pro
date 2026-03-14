javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '5.1';
  const VER_KEY = 'ezpill_ver';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }
  
  const state = { 
    savedRows:[], 
    visitedSet:new Set(), 
    openedInSession:new Set(),
    isProcessing:false, 
    isSyncing:false, 
    openedCount:0, 
    tbody:null, 
    noNewStreak:0 
  };

  const IOS = { bg:'rgba(243,244,246,0.92)', card:'#ffffff', border:'rgba(0,0,0,0.04)', text:'#1f2937', muted:'#9ca3af', accent:'#6366f1', accent2:'#818cf8', success:'#22c55e', error:'#ef4444', warn:'#f59e0b', shadow:'0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)', font:'-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif' };

  function showToast(msg,type){
    type=type||'info';var c=document.getElementById('ali-toast-box');
    if(!c){c=document.createElement('div');c.id='ali-toast-box';c.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';document.body.appendChild(c)}
    var cl={success:'#22c55e',error:'#ef4444',warning:'#f59e0b',info:'#6366f1'};var ic={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    var t=document.createElement('div');t.style.cssText='background:'+IOS.card+';color:'+cl[type]+';padding:12px 22px;border-radius:14px;font-size:13px;font-weight:700;font-family:'+IOS.font+';box-shadow:0 8px 30px rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1)';
    t.innerHTML='<span>'+ic[type]+'</span> '+msg;c.appendChild(t);
    setTimeout(function(){t.style.transition='all 0.3s';t.style.opacity='0';t.style.transform='translateY(10px)';setTimeout(function(){t.remove()},300)},3500);
  }

  try{var lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(function(){showToast('تم التحديث لـ v'+VERSION+' — تحكم كامل في التابات ⚡','success')},1000)}}catch(e){}

  var styleEl=document.createElement('style');styleEl.id='ali-pro-css';
  styleEl.innerHTML=
    '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}'+
    '@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
    '@keyframes aliSpin{to{transform:rotate(360deg)}}'+
    '@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}'+
    '@keyframes aliDialogIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'+
    '@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}'+
    '#'+PANEL_ID+'{position:fixed;top:14px;right:14px;width:380px;max-height:92vh;background:'+IOS.bg+';backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);z-index:9999999;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';overflow:hidden;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)}'+
    '#'+PANEL_ID+'.ali-minimized{width:56px!important;height:56px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6366f1,#8b5cf6)!important;box-shadow:0 8px 24px rgba(99,102,241,0.3)!important;animation:aliPulse 2s infinite;overflow:hidden}'+
    '#'+PANEL_ID+'.ali-minimized .ali-inner{display:none!important}'+
    '#'+PANEL_ID+'.ali-minimized::after{content:"🔍";font-size:22px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}'+
    '#'+PANEL_ID+' .ios-grp{background:'+IOS.card+';border-radius:14px;overflow:hidden;box-shadow:'+IOS.shadow+';margin-bottom:12px}'+
    '#'+PANEL_ID+' .ios-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:'+IOS.font+';transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}'+
    '#'+PANEL_ID+' .ios-primary{background:'+IOS.accent+';color:white}'+
    '#'+PANEL_ID+' .ios-success{background:'+IOS.success+';color:white}'+
    '#'+PANEL_ID+' .ios-ghost{background:rgba(0,0,0,0.03);color:'+IOS.muted+'}'+
    '#'+PANEL_ID+' .ios-input{width:100%;padding:12px 16px;border:none;border-radius:12px;font-size:14px;font-family:'+IOS.font+';outline:none;background:rgba(0,0,0,0.03);color:'+IOS.text+';transition:all 0.2s;font-weight:600;box-sizing:border-box}'+
    '#'+PANEL_ID+' .ios-input:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15)}';
  document.head.appendChild(styleEl);

  function getCurrentStatus(){var s='readypack';var l=window.location.href.toLowerCase();if(l.indexOf('new')!==-1)s='new';else if(l.indexOf('packed')!==-1&&l.indexOf('ready')===-1)s='packed';else if(l.indexOf('delivered')!==-1)s='delivered';return s}

  var panel=document.createElement('div');panel.id=PANEL_ID;
  panel.innerHTML=
    '<div class="ali-inner">'+
    '<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;">🔍</div>'+
        '<div><div style="font-size:15px;font-weight:800;color:#1f2937">بحث الطلبات</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v'+VERSION+'</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button id="ali_min" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;">−</button>'+
        '<button id="ali_close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;">✕</button>'+
      '</div>'+
    '</div>'+
    '<div style="padding:10px 16px;overflow-y:auto;max-height:calc(92vh - 60px)" id="ali_body">'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;"><div id="stat_total" style="font-size:22px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px;color:'+IOS.muted+';">إجمالي</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;"><div id="stat_match" style="font-size:22px;font-weight:900;color:#22c55e">0</div><div style="font-size:9px;color:'+IOS.muted+';">متاح</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;"><div id="stat_opened" style="font-size:22px;font-weight:900;color:#6366f1">0</div><div style="font-size:9px;color:'+IOS.muted+';">تم فتحه</div></div>'+
      '</div>'+
      '<div class="ios-grp" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:13px;font-weight:700">📄 عدد الصفحات</span>'+
          '<input type="number" id="p_lim" value="10" min="1" class="ios-input" style="width:60px;padding:8px;text-align:center;">'+
        '</div>'+
        '<div style="height:6px;background:rgba(0,0,0,0.04);border-radius:6px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:6px;"></div></div>'+
      '</div>'+
      '<div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:rgba(34,197,94,0.06);color:#22c55e"><span>✅</span><span>جاهز</span></div>'+
      '<div id="ali_dynamic_area"><button id="ali_start" class="ios-btn ios-primary" style="font-size:15px;padding:16px">🚀 بدء الفحص</button></div>'+
    '</div></div>';
  document.body.appendChild(panel);

  function setStatus(text,type){var el=document.getElementById('status-msg');if(!el)return;el.innerText=text;}
  function updateStats(mc){document.getElementById('stat_total').innerText=state.savedRows.length;document.getElementById('stat_match').innerText=mc!==undefined?mc:state.savedRows.length;document.getElementById('stat_opened').innerText=state.openedCount}
  function debounce(fn,d){var t;return function(){clearTimeout(t);t=setTimeout(fn,d)}}

  panel.addEventListener('click',function(e){if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',function(e){panel.remove()});
  document.getElementById('ali_min').addEventListener('click',function(e){e.stopPropagation();panel.classList.add('ali-minimized')});

  async function fetchPageOrders(pn,cs){var bu=window.location.origin+"/ez_pill_web/";var res=await fetch(bu+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:cs,pageSelected:pn,searchby:''})});return await res.json()}
  
  function buildOrderRow(item,tpl){
    var inv=item.Invoice||''; var onl=item.onlineNumber||'';
    var args=[(onl||'').replace(/ERX/gi,''), inv, item.typee||'', item.head_id||''];
    var cl=document.createElement('tr');
    cl.innerHTML='<td>'+inv+'</td><td>'+onl+'</td><td>'+(item.guestName||'')+'</td><td>'+(item.guestMobile||'')+'</td>';
    return {id:inv, onl:onl, node:cl, args:args, hasArgs: (inv!=='' && onl!=='')};
  }

  async function scanPage(){
    state.isProcessing=true; var cs=getCurrentStatus(); var mp=parseInt(document.getElementById('p_lim').value)||1;
    var tables=document.querySelectorAll('table'); var tt=tables[0];
    for(var t=0;t<tables.length;t++){if(tables[t].innerText.length>tt.innerText.length)tt=tables[t]}
    state.tbody=tt.querySelector('tbody')||tt;
    
    for(var pg=1;pg<=mp;pg++){
      setStatus('جاري سحب صفحة '+pg,'working');
      var data=await fetchPageOrders(pg,cs);
      var orders=[]; try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list}catch(e){}
      if(orders){
        for(var i=0;i<orders.length;i++){
          var inv=orders[i].Invoice||'';
          if(inv && !state.visitedSet.has(inv)){
            state.visitedSet.add(inv);
            state.savedRows.push(buildOrderRow(orders[i]));
          }
        }
      }
      document.getElementById('p-fill').style.width=((pg/mp)*100)+'%';
      updateStats();
    }
    state.isProcessing=false; buildSearchUI(); setStatus('تم الفحص','done');
  }

  function buildSearchUI(){
    var da=document.getElementById('ali_dynamic_area');
    da.innerHTML=
      '<div class="ios-grp" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:12px;font-weight:700">🚀 عدد التابات (اختياري)</span>'+
          '<input type="number" id="ali_max_tabs" placeholder="الكل" class="ios-input" style="width:70px;padding:6px;text-align:center;color:'+IOS.accent+'">'+
        '</div>'+
        '<input type="text" id="ali_sI" class="ios-input" placeholder="رقم الفاتورة..." style="margin-bottom:8px;direction:ltr;">'+
        '<input type="text" id="ali_sO" class="ios-input" placeholder="رقم الطلب (ERX)..." style="direction:rtl">'+
      '</div>'+
      '<div id="ali_search_count" style="font-size:11px;color:'+IOS.muted+';text-align:center;padding-bottom:10px"></div>'+
      '<button id="ali_btn_open" class="ios-btn ios-success" style="margin-bottom:8px;">⚡ فتح النتائج</button>'+
      '<button id="ali_btn_sync" class="ios-btn ios-ghost">🔄 تحديث</button>';

    var sI=document.getElementById('ali_sI'), sO=document.getElementById('ali_sO'), ob=document.getElementById('ali_btn_open'), sc=document.getElementById('ali_search_count'), mx=document.getElementById('ali_max_tabs');
    var currentMatches = [];

    function filterRows(){
      var ri=sI.value.trim(); var is=ri!==''?'0'+ri:''; var os=sO.value.trim().toLowerCase();
      state.tbody.innerHTML=''; currentMatches = [];
      var available = state.savedRows.filter(r => !state.openedInSession.has(r.id));
      
      for(var i=0; i<available.length; i++){
        var rw=available[i];
        if((is==='' && os==='') || (rw.id.startsWith(is) || rw.onl.toLowerCase().indexOf(os)!==-1)){
          state.tbody.appendChild(rw.node);
          if(rw.hasArgs) currentMatches.push(rw);
        }
      }
      
      var limitVal = mx.value.trim();
      var limit = limitVal !== '' ? parseInt(limitVal) : currentMatches.length;
      var countToOpen = Math.min(currentMatches.length, limit);

      sc.innerText = 'المتاح: ' + available.length + ' | مطابق: ' + currentMatches.length;
      ob.innerHTML = limitVal !== '' ? '⚡ فتح عدد (' + countToOpen + ') طلب' : '⚡ فتح الكل (' + currentMatches.length + ')';
      ob.style.opacity = countToOpen > 0 ? '1' : '0.5';
      updateStats(available.length);
    }

    [sI, sO, mx].forEach(el => el.addEventListener('input', debounce(filterRows, 150)));
    filterRows();

    ob.addEventListener('click', async function(){
      var limitVal = mx.value.trim();
      var limit = limitVal !== '' ? parseInt(limitVal) : currentMatches.length;
      var toOpen = currentMatches.slice(0, limit);
      if(toOpen.length === 0) return;

      ob.disabled = true;
      for(var i=0; i<toOpen.length; i++){
        var it = toOpen[i];
        var url = window.location.origin+"/ez_pill_web/getEZPill_Details?onlineNumber="+encodeURIComponent(it.args[0])+"&Invoice="+encodeURIComponent(it.args[1])+"&typee="+encodeURIComponent(it.args[2])+"&head_id="+encodeURIComponent(it.args[3]);
        if(window.open(url, "_blank")){
            state.openedInSession.add(it.id);
            state.openedCount++;
        }
        if(i < toOpen.length - 1) await new Promise(r => setTimeout(r, 1100));
      }
      ob.disabled = false;
      showToast('تم فتح ' + toOpen.length + ' طلب بنجاح', 'success');
      filterRows();
    });

    document.getElementById('ali_btn_sync').addEventListener('click', function(){ state.savedRows=[]; state.visitedSet.clear(); scanPage(); });
  }

  document.getElementById('ali_start').addEventListener('click', function(){ this.disabled=true; scanPage(); });
})();

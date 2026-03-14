javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '5.0';
  const VER_KEY = 'ezpill_ver';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }
  
  /* تم إضافة openedInSession لتتبع ما تم فتحه خلال الجلسة */
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

  try{var lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(function(){showToast('تم التحديث لـ v'+VERSION+' — نظام الدفعات 🚀','success')},1000)}}catch(e){}

  function showDialog(opts){
    return new Promise(function(resolve){
      var ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.25);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.2s';
      var infoH='';if(opts.info&&opts.info.length){for(var i=0;i<opts.info.length;i++){var r=opts.info[i];infoH+='<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 16px;background:'+IOS.bg+';border-radius:12px;margin-bottom:6px"><span style="font-size:13px;color:'+IOS.muted+';font-weight:600">'+r.label+'</span><span style="font-weight:800;color:'+(r.color||IOS.accent)+';font-size:14px">'+r.value+'</span></div>'}}
      var badH='';if(opts.badges&&opts.badges.length){badH='<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:4px 0 8px">';for(var b=0;b<opts.badges.length;b++){var bg=opts.badges[b];var bs=bg.active?'color:'+IOS.accent+';background:rgba(99,102,241,0.08)':'color:'+IOS.muted+';background:'+IOS.bg;badH+='<span style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;'+bs+'">'+bg.text+'</span>'}badH+='</div>'}
      var btnH='';if(opts.buttons&&opts.buttons.length){for(var j=0;j<opts.buttons.length;j++){var bt=opts.buttons[j];var bc=bt.primary?'background:'+IOS.accent+';color:white;font-weight:800':'background:rgba(0,0,0,0.04);color:'+IOS.muted+';font-weight:700';btnH+='<button data-idx="'+j+'" style="flex:1;padding:14px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-family:'+IOS.font+';transition:all 0.2s;'+bc+'">'+bt.text+'</button>'}}
      ov.innerHTML='<div style="background:'+IOS.card+';border-radius:20px;width:380px;max-width:90vw;overflow:hidden;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';box-shadow:0 20px 60px rgba(0,0,0,0.12);animation:aliDialogIn 0.35s cubic-bezier(0.16,1,0.3,1)"><div style="padding:28px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:18px;background:rgba(99,102,241,0.06);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px">'+opts.icon+'</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">'+opts.title+'</div><div style="font-size:13px;color:'+IOS.muted+';line-height:1.7">'+opts.desc+'</div></div>'+badH+'<div style="padding:16px 24px">'+infoH+(opts.body||'')+'</div><div style="padding:6px 24px 24px;display:flex;gap:10px">'+btnH+'</div></div>';
      ov.addEventListener('click',function(e){var el=e.target.closest('[data-idx]');if(el){var idx=parseInt(el.getAttribute('data-idx'));ov.style.transition='opacity 0.2s';ov.style.opacity='0';setTimeout(function(){ov.remove()},200);resolve(opts.buttons[idx].value)}});
      document.body.appendChild(ov);
    });
  }

  var styleEl=document.createElement('style');styleEl.id='ali-pro-css';
  styleEl.innerHTML=
    '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}'+
    '@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
    '@keyframes aliSpin{to{transform:rotate(360deg)}}'+
    '@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}'+
    '@keyframes aliDialogIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'+
    '@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'+
    '@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}'+
    '@keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}'+
    '#'+PANEL_ID+'{position:fixed;top:14px;right:14px;width:380px;max-height:92vh;background:'+IOS.bg+';backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1),0 0 0 0.5px rgba(0,0,0,0.05);z-index:9999999;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';overflow:hidden;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);animation:aliSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)}'+
    '#'+PANEL_ID+'.ali-minimized{width:56px!important;height:56px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#6366f1,#8b5cf6)!important;box-shadow:0 8px 24px rgba(99,102,241,0.3)!important;animation:aliPulse 2s infinite;overflow:hidden}'+
    '#'+PANEL_ID+'.ali-minimized .ali-inner{display:none!important}'+
    '#'+PANEL_ID+'.ali-minimized::after{content:"🔍";font-size:22px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}'+
    '#'+PANEL_ID+' .ios-grp{background:'+IOS.card+';border-radius:14px;overflow:hidden;box-shadow:'+IOS.shadow+';margin-bottom:12px}'+
    '#'+PANEL_ID+' .ios-item{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:0.5px solid #f3f4f6}'+
    '#'+PANEL_ID+' .ios-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:'+IOS.font+';transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}'+
    '#'+PANEL_ID+' .ios-btn:active{transform:scale(0.98);opacity:0.9}'+
    '#'+PANEL_ID+' .ios-primary{background:'+IOS.accent+';color:white}'+
    '#'+PANEL_ID+' .ios-success{background:'+IOS.success+';color:white}'+
    '#'+PANEL_ID+' .ios-ghost{background:rgba(0,0,0,0.03);color:'+IOS.muted+'}'+
    '#'+PANEL_ID+' .ios-input{width:100%;padding:12px 16px;border:none;border-radius:12px;font-size:14px;font-family:'+IOS.font+';outline:none;background:rgba(0,0,0,0.03);color:'+IOS.text+';transition:all 0.2s;font-weight:600;box-sizing:border-box}'+
    '#'+PANEL_ID+' .ios-input:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15)}'+
    '#'+PANEL_ID+' .ios-input.match{background:rgba(34,197,94,0.04);box-shadow:0 0 0 2px rgba(34,197,94,0.15)}'+
    '#'+PANEL_ID+' .ios-input.nomatch{background:rgba(239,68,68,0.04);box-shadow:0 0 0 2px rgba(239,68,68,0.15)}';
  document.head.appendChild(styleEl);

  var calculatedPages=10;try{var targetText='ready to pack';var loc=window.location.href.toLowerCase();if(loc.indexOf('new')!==-1)targetText='new orders';else if(loc.indexOf('packed')!==-1&&loc.indexOf('ready')===-1)targetText='packed';else if(loc.indexOf('delivered')!==-1)targetText='delivered orders';var elements=document.querySelectorAll('*');for(var i=0;i<elements.length;i++){var el=elements[i];if(el.children.length===0&&el.textContent&&el.textContent.trim().toLowerCase()===targetText){var parent=el.parentElement;for(var j=0;j<4;j++){if(parent){var txt=parent.innerText||parent.textContent||'';var nums=txt.match(/\d+/g);if(nums&&nums.length>0){var maxN=0;for(var k=0;k<nums.length;k++){var n=parseInt(nums[k]);if(n>maxN)maxN=n}if(maxN>0){calculatedPages=Math.ceil(maxN/10);break}}parent=parent.parentElement}}break}}if(calculatedPages<1)calculatedPages=1}catch(err){}

  var panel=document.createElement('div');panel.id=PANEL_ID;
  panel.innerHTML=
    '<div class="ali-inner">'+
    '<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(99,102,241,0.25)">🔍</div>'+
        '<div><div style="font-size:15px;font-weight:800;color:#1f2937">بحث الطلبات</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v'+VERSION+' — Batch System</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button id="ali_min" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#9ca3af;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">−</button>'+
        '<button id="ali_close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">✕</button>'+
      '</div>'+
    '</div>'+
    '<div style="padding:10px 16px;overflow-y:auto;max-height:calc(92vh - 60px)" id="ali_body">'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:18px;margin-bottom:4px">📊</div><div id="stat_total" style="font-size:22px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">إجمالي</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:18px;margin-bottom:4px">🔍</div><div id="stat_match" style="font-size:22px;font-weight:900;color:#22c55e">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">متاح</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:18px;margin-bottom:4px">🚀</div><div id="stat_opened" style="font-size:22px;font-weight:900;color:#6366f1">0</div><div style="font-size:9px;color:'+IOS.muted+';font-weight:700">تم فتحه</div></div>'+
      '</div>'+
      '<div class="ios-grp" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:13px;font-weight:700">📄 عدد الصفحات</span>'+
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:'+IOS.muted+';font-weight:600">صفحة</span><input type="number" id="p_lim" value="'+calculatedPages+'" min="1" class="ios-input" style="width:60px;padding:8px;text-align:center;font-size:15px;font-weight:900;color:'+IOS.accent+'"></div>'+
        '</div>'+
        '<div style="height:6px;background:rgba(0,0,0,0.04);border-radius:6px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:6px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)"></div></div>'+
      '</div>'+
      '<div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:rgba(34,197,94,0.06);color:#22c55e"><span>✅</span><span>جاهز للبدء</span></div>'+
      '<div id="ali_dynamic_area"><button id="ali_start" class="ios-btn ios-primary" style="font-size:15px;padding:16px">🚀 بدء الفحص الذكي</button></div>'+
      '<div style="text-align:center;padding:12px 0 4px;font-size:9px;color:'+IOS.muted+';font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
    '</div></div>';
  document.body.appendChild(panel);

  function setStatus(text,type){var el=document.getElementById('status-msg');if(!el)return;var cf={ready:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'✅'},working:{color:'#6366f1',bg:'rgba(99,102,241,0.06)',icon:'spinner'},error:{color:'#ef4444',bg:'rgba(239,68,68,0.06)',icon:'❌'},done:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'🎉'},sync:{color:'#f59e0b',bg:'rgba(245,158,11,0.06)',icon:'spinner'}};var c=cf[type]||cf.ready;var ih=c.icon==='spinner'?'<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:'+IOS.accent+';border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>':'<span>'+c.icon+'</span>';el.style.cssText='display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:'+c.bg+';color:'+c.color+';transition:all 0.3s';el.innerHTML=ih+'<span>'+text+'</span>'}
  function animNum(id,val){var el=document.getElementById(id);if(!el||el.innerText===String(val))return;requestAnimationFrame(function(){el.innerText=val;el.style.animation='aliCountUp 0.4s';setTimeout(function(){el.style.animation=''},400)})}
  function updateStats(mc){animNum('stat_total',state.savedRows.length);animNum('stat_match',mc!==undefined?mc:state.savedRows.length);animNum('stat_opened',state.openedCount)}
  function debounce(fn,d){var t;return function(){clearTimeout(t);t=setTimeout(fn,d)}}
  function getCurrentStatus(){var s='readypack';var l=window.location.href.toLowerCase();if(l.indexOf('new')!==-1)s='new';else if(l.indexOf('packed')!==-1&&l.indexOf('ready')===-1)s='packed';else if(l.indexOf('delivered')!==-1)s='delivered';return s}

  panel.addEventListener('click',function(e){if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation()}});
  document.getElementById('ali_close').addEventListener('click',function(e){e.stopPropagation();panel.style.transition='all 0.3s';panel.style.opacity='0';panel.style.transform='translateX(40px) scale(0.97)';setTimeout(function(){panel.remove()},300)});
  document.getElementById('ali_min').addEventListener('click',function(e){e.stopPropagation();panel.classList.add('ali-minimized')});

  function createSafeLabel(inv,args){var label=document.createElement('label');label.style.cssText='cursor:pointer;color:'+IOS.accent+';text-decoration:underline;font-weight:bold';label.textContent=inv;if(args){label.addEventListener('click',function(){getDetails(args[0],args[1],args[2],args[3])})}return label}
  async function fetchPageOrders(pn,cs){var bu=window.location.origin+"/ez_pill_web/";var res=await fetch(bu+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:cs,pageSelected:pn,searchby:''})});return await res.json()}
  function buildOrderRow(item,tpl){var inv=item.Invoice||'';var onl=item.onlineNumber||'';var ty=item.typee!==undefined?item.typee:'';var hid=item.head_id!==undefined?item.head_id:'';var args=null;if(onl!==''&&inv!=='')args=[onl.replace(/ERX/gi,''),inv,ty,hid];var cl;if(tpl){cl=tpl.cloneNode(true);var cs=cl.querySelectorAll('td');if(cs.length>3){cs[0].innerHTML='';cs[0].appendChild(createSafeLabel(inv,args));cs[1].textContent=onl;cs[2].textContent=item.guestName||'';cs[3].textContent=item.guestMobile||item.mobile||''}}else{cl=document.createElement('tr');var t0=document.createElement('td'),t1=document.createElement('td'),t2=document.createElement('td'),t3=document.createElement('td');t0.appendChild(createSafeLabel(inv,args));t1.textContent=onl;t2.textContent=item.guestName||'';t3.textContent=item.guestMobile||item.mobile||'';cl.appendChild(t0);cl.appendChild(t1);cl.appendChild(t2);cl.appendChild(t3)}return{id:inv,onl:onl,node:cl,args:args,hasArgs:args!==null}}

  async function scanPage(isSync){
    state.isProcessing=true;var fill=document.getElementById('p-fill');var cs=getCurrentStatus();
    try{
      setStatus(isSync?'جاري المزامنة...':'جاري الفحص...',isSync?'sync':'working');
      var mp=parseInt(document.getElementById('p_lim').value)||1;
      var tables=document.querySelectorAll('table');var tt=tables[0];
      for(var t=0;t<tables.length;t++){if(tables[t].innerText.length>tt.innerText.length)tt=tables[t]}
      var tbody=tt.querySelector('tbody')||tt;var tpl=tbody.querySelector('tr');
      
      var BATCH_SIZE=5;
      for(var pg=1;pg<=mp;pg+=BATCH_SIZE){
        var endPg=Math.min(pg+BATCH_SIZE-1,mp);
        var batchPromises=[];
        for(var j=pg;j<=endPg;j++){
          (function(pageNum){
            batchPromises.push(fetchPageOrders(pageNum,cs).then(function(data){
              var orders=[];try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list}catch(e){}
              if(!orders||orders.length===0)return;
              for(var i=0;i<orders.length;i++){
                var inv=orders[i].Invoice||'';
                if(inv.length>3&&!state.visitedSet.has(inv)){
                  state.visitedSet.add(inv);
                  state.savedRows.push(buildOrderRow(orders[i],tpl));
                }
              }
            }));
          })(j);
        }
        await Promise.all(batchPromises);
        if(fill)fill.style.width=((endPg/mp)*100)+'%';
        updateStats();
        if(endPg<mp) await new Promise(function(r){setTimeout(r,250)});
      }
      finishScan(isSync)
    }catch(err){setStatus('خطأ في الاتصال بالخادم','error');state.isProcessing=false;}
  }

  function finishScan(isSync){
    state.isProcessing=false;
    var tables=document.querySelectorAll('table');var tt=tables[0];
    for(var t=0;t<tables.length;t++){if(tables[t].innerText.length>tt.innerText.length)tt=tables[t]}
    state.tbody=tt.querySelector('tbody')||tt;
    state.tbody.innerHTML='';
    for(var i=0;i<state.savedRows.length;i++){
        if(!state.openedInSession.has(state.savedRows[i].id)) state.tbody.appendChild(state.savedRows[i].node);
    }
    updateStats();
    buildSearchUI();
    setStatus(isSync?'تمت المزامنة':'تم الفحص','done');
  }

  function buildSearchUI(){
    var da=document.getElementById('ali_dynamic_area');
    da.innerHTML=
      '<div class="ios-grp" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:12px;font-weight:700">🚀 حد التابات</span>'+
          '<input type="number" id="ali_max_tabs" value="10" min="1" class="ios-input" style="width:60px;padding:6px;text-align:center;font-size:14px;color:'+IOS.accent+'">'+
        '</div>'+
        '<div style="position:relative;margin-bottom:8px">'+
          '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:900;color:'+IOS.muted+';font-family:monospace">0</span>'+
          '<input type="text" id="ali_sI" class="ios-input" placeholder="رقم الفاتورة..." style="padding-left:30px;direction:ltr;text-align:left;font-family:monospace">'+
        '</div>'+
        '<div style="position:relative">'+
          '<input type="text" id="ali_sO" class="ios-input" placeholder="رقم الطلب (ERX)..." style="direction:rtl">'+
        '</div>'+
      '</div>'+
      '<div id="ali_search_count" style="font-size:11px;color:'+IOS.muted+';text-align:center;font-weight:600;padding:2px 0 10px"></div>'+
      '<button id="ali_btn_open" class="ios-btn ios-success" style="margin-bottom:8px;opacity:0.7">⚡ فتح الدفعة التالية</button>'+
      '<button id="ali_btn_sync" class="ios-btn ios-ghost">🔄 مزامنة ذكية</button>';

    var sI=document.getElementById('ali_sI'), sO=document.getElementById('ali_sO'), ob=document.getElementById('ali_btn_open'), sc=document.getElementById('ali_search_count');
    var currentMatches = [];

    function filterRows(){
      var ri=sI.value.trim(); var is=ri!==''?'0'+ri:''; var os=sO.value.trim().toLowerCase();
      state.tbody.innerHTML=''; currentMatches = [];
      var availableRows = state.savedRows.filter(r => !state.openedInSession.has(r.id));
      
      for(var i=0; i<availableRows.length; i++){
        var rw=availableRows[i];
        var mi=is!=='' && rw.id.startsWith(is);
        var mo=os!=='' && rw.onl.toLowerCase().indexOf(os)!==-1;
        if((is==='' && os==='') || (mi || mo)){
          state.tbody.appendChild(rw.node);
          if(rw.args) currentMatches.push(rw);
        }
      }
      
      var limit = parseInt(document.getElementById('ali_max_tabs').value) || 10;
      var canOpen = Math.min(currentMatches.length, limit);
      sc.innerText = 'متاح الآن: ' + availableRows.length + ' طلب | مطابق للبحث: ' + currentMatches.length;
      ob.innerHTML = '⚡ فتح الدفعة (' + canOpen + ')';
      ob.style.opacity = canOpen > 0 ? '1' : '0.5';
      updateStats(availableRows.length);
    }

    sI.addEventListener('input', debounce(filterRows, 150));
    sO.addEventListener('input', debounce(filterRows, 150));
    filterRows();

    ob.addEventListener('click', async function(){
      var limit = parseInt(document.getElementById('ali_max_tabs').value) || 10;
      var toOpen = currentMatches.slice(0, limit);
      if(toOpen.length === 0){ showToast('لا توجد طلبات مطابقة لفتحها!','warning'); return; }

      ob.disabled = true;
      for(var i=0; i<toOpen.length; i++){
        var it = toOpen[i];
        var url = window.location.origin+"/ez_pill_web/getEZPill_Details?onlineNumber="+encodeURIComponent(it.args[0])+"&Invoice="+encodeURIComponent(it.args[1])+"&typee="+encodeURIComponent(it.args[2])+"&head_id="+encodeURIComponent(it.args[3]);
        if(window.open(url, "_blank")){
            state.openedInSession.add(it.id);
            state.openedCount++;
        }
        setStatus('جاري فتح '+(i+1)+' من '+toOpen.length,'working');
        if(i < toOpen.length - 1) await new Promise(r => setTimeout(r, 1000));
      }
      
      ob.disabled = false;
      showToast('تم فتح ' + toOpen.length + ' تابات بنجاح', 'success');
      filterRows(); // إعادة الفلترة لإخفاء ما تم فتحه
    });

    document.getElementById('ali_btn_sync').addEventListener('click', function(){ scanPage(true); });
  }

  document.getElementById('ali_start').addEventListener('click', function(){ this.disabled=true; scanPage(false); });
})();

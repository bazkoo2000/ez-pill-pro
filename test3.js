javascript:(function(){
  'use strict';
  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '5.2';
  const VER_KEY = 'ezpill_ver';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }
  
  const state = { 
    savedRows:[], 
    visitedSet:new Set(), 
    openedInSession:new Set(),
    isProcessing:false, 
    openedCount:0, 
    tbody:null 
  };

  const IOS = { 
    bg:'rgba(243,244,246,0.92)', 
    card:'#ffffff', 
    text:'#1f2937', 
    muted:'#9ca3af', 
    accent:'#6366f1', 
    success:'#22c55e', 
    error:'#ef4444', 
    shadow:'0 1px 2px rgba(0,0,0,0.03)', 
    font:'-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif' 
  };

  function showToast(msg,type){
    type=type||'info';var c=document.getElementById('ali-toast-box');
    if(!c){c=document.createElement('div');c.id='ali-toast-box';c.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';document.body.appendChild(c)}
    var cl={success:'#22c55e',error:'#ef4444',info:'#6366f1'};
    var t=document.createElement('div');t.style.cssText='background:'+IOS.card+';color:'+cl[type]+';padding:12px 22px;border-radius:14px;font-size:13px;font-weight:700;font-family:'+IOS.font+';box-shadow:0 8px 30px rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;direction:rtl;';
    t.innerHTML=msg;c.appendChild(t);
    setTimeout(function(){t.remove()},3500);
  }

  var styleEl=document.createElement('style');
  styleEl.innerHTML=
    '#'+PANEL_ID+'{position:fixed;top:14px;right:14px;width:380px;background:'+IOS.bg+';backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1);z-index:9999999;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';}'+
    '#'+PANEL_ID+' .ios-grp{background:'+IOS.card+';border-radius:14px;margin-bottom:12px;padding:12px;}'+
    '#'+PANEL_ID+' .ios-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}'+
    '#'+PANEL_ID+' .ios-primary{background:'+IOS.accent+';color:white}'+
    '#'+PANEL_ID+' .ios-success{background:'+IOS.success+';color:white}'+
    '#'+PANEL_ID+' .ios-input{width:100%;padding:10px;border:none;border-radius:10px;font-size:14px;background:rgba(0,0,0,0.04);color:'+IOS.text+';outline:none;box-sizing:border-box;margin-top:5px;}';
  document.head.appendChild(styleEl);

  var panel=document.createElement('div');panel.id=PANEL_ID;
  panel.innerHTML=
    '<div style="padding:15px;display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-weight:900;">نظام الفتح الذكي v'+VERSION+'</span>'+
      '<button id="ali_close" style="background:none;border:none;cursor:pointer;">✕</button>'+
    '</div>'+
    '<div style="padding:0 15px 15px;">'+
      '<div id="initial_scan_area" class="ios-grp">'+
        '<label style="font-size:12px;font-weight:700;">عدد الصفحات المراد فحصها:</label>'+
        '<input type="number" id="p_lim" value="10" class="ios-input">'+
        '<button id="ali_start" class="ios-btn ios-primary" style="margin-top:10px;">بدء سحب البيانات</button>'+
      '</div>'+
      '<div id="search_control_area" style="display:none;">'+
        '<div class="ios-grp">'+
          '<label style="font-size:12px;font-weight:700;">فلترة برقم الفاتورة:</label>'+
          '<input type="text" id="ali_sI" class="ios-input" placeholder="0XXXXXXXXX">'+
          '<label style="font-size:12px;font-weight:700;margin-top:10px;display:block;">فلترة برقم الطلب (ERX):</label>'+
          '<input type="text" id="ali_sO" class="ios-input" placeholder="ERX...">'+
        '</div>'+
        '<div class="ios-grp" style="border: 2px solid '+IOS.accent+';">'+
          '<label style="font-weight:800;color:'+IOS.accent+';">عدد التابات المراد فتحها (اختياري):</label>'+
          '<input type="number" id="ali_tab_limit" class="ios-input" placeholder="اتركه فارغاً لفتح الكل" style="background:rgba(99,102,241,0.05)">'+
          '<p style="font-size:10px;color:'+IOS.muted+';margin-top:5px;">* إذا تم تحديد عدد، سيتم فتح هذا العدد فقط من نتائج البحث.</p>'+
        '</div>'+
        '<button id="ali_btn_open" class="ios-btn ios-success">فتح الطلبات المفلترة ⚡</button>'+
        '<button id="ali_reset" class="ios-btn" style="background:none;color:'+IOS.muted+';font-size:11px;">إعادة فحص الصفحات</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(panel);

  function getCurrentStatus(){
    var l=window.location.href.toLowerCase();
    if(l.indexOf('new')!==-1) return 'new';
    if(l.indexOf('packed')!==-1 && l.indexOf('ready')===-1) return 'packed';
    if(l.indexOf('delivered')!==-1) return 'delivered';
    return 'readypack';
  }

  async function fetchOrders(pn,cs){
    var bu=window.location.origin+"/ez_pill_web/";
    var res=await fetch(bu+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:cs,pageSelected:pn,searchby:''})});
    return await res.json();
  }

  async function startScanning(){
    state.isProcessing=true;
    var mp=parseInt(document.getElementById('p_lim').value)||1;
    var cs=getCurrentStatus();
    
    var tables=document.querySelectorAll('table'); var tt=tables[0];
    for(var t=0;t<tables.length;t++){if(tables[t].innerText.length>tt.innerText.length)tt=tables[t]}
    state.tbody=tt.querySelector('tbody')||tt;

    for(var pg=1;pg<=mp;pg++){
      var data=await fetchOrders(pg,cs);
      var orders=[]; try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list}catch(e){}
      if(orders){
        orders.forEach(item => {
          var inv=item.Invoice||'';
          if(inv && !state.visitedSet.has(inv)){
            state.visitedSet.add(inv);
            var onl=item.onlineNumber||'';
            var tr=document.createElement('tr');
            tr.innerHTML='<td>'+inv+'</td><td>'+onl+'</td><td>'+(item.guestName||'')+'</td>';
            state.savedRows.push({id:inv, onl:onl, node:tr, args:[(onl||'').replace(/ERX/gi,''), inv, item.typee||'', item.head_id||'']});
          }
        });
      }
    }
    
    document.getElementById('initial_scan_area').style.display='none';
    document.getElementById('search_control_area').style.display='block';
    applyFilter();
  }

  function applyFilter(){
    var invVal=document.getElementById('ali_sI').value.trim();
    var matchInv=invVal!==''?'0'+invVal:'';
    var erxVal=document.getElementById('ali_sO').value.trim().toLowerCase();
    
    state.tbody.innerHTML='';
    var currentMatches = [];

    state.savedRows.forEach(row => {
      if(state.openedInSession.has(row.id)) return;
      var match = (matchInv==='' && erxVal==='') || (row.id.startsWith(matchInv) || row.onl.toLowerCase().indexOf(erxVal)!==-1);
      if(match){
        state.tbody.appendChild(row.node);
        currentMatches.push(row);
      }
    });
    return currentMatches;
  }

  document.getElementById('ali_btn_open').addEventListener('click', async function(){
    var filtered = applyFilter();
    var tabLimitInput = document.getElementById('ali_tab_limit').value;
    var limit = tabLimitInput !== '' ? parseInt(tabLimitInput) : filtered.length;
    
    var toOpen = filtered.slice(0, limit);
    if(toOpen.length === 0) { showToast('لا توجد نتائج لفتحها','error'); return; }

    this.disabled = true;
    for(var i=0; i<toOpen.length; i++){
      var it = toOpen[i];
      var url = window.location.origin+"/ez_pill_web/getEZPill_Details?onlineNumber="+encodeURIComponent(it.args[0])+"&Invoice="+encodeURIComponent(it.args[1])+"&typee="+encodeURIComponent(it.args[2])+"&head_id="+encodeURIComponent(it.args[3]);
      if(window.open(url, "_blank")){
          state.openedInSession.add(it.id);
      }
      if(i < toOpen.length - 1) await new Promise(r => setTimeout(r, 1000));
    }
    this.disabled = false;
    showToast('تم فتح ' + toOpen.length + ' طلب','success');
    applyFilter();
  });

  document.getElementById('ali_start').addEventListener('click', startScanning);
  document.getElementById('ali_sI').addEventListener('input', applyFilter);
  document.getElementById('ali_sO').addEventListener('input', applyFilter);
  document.getElementById('ali_close').addEventListener('click', function(){ panel.remove(); });
  document.getElementById('ali_reset').addEventListener('click', function(){ location.reload(); });

})();

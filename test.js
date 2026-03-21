javascript:(function(){
  'use strict';
  const PANEL_ID='ali_search_v2';const VERSION='1.1';
  if(document.getElementById(PANEL_ID)){document.getElementById(PANEL_ID).remove();return}
  const state={savedRows:[],visitedSet:new Set(),isProcessing:false};
  const IOS={bg:'rgba(243,244,246,0.92)',card:'#ffffff',text:'#1f2937',muted:'#9ca3af',accent:'#6366f1',accent2:'#818cf8',success:'#22c55e',error:'#ef4444',shadow:'0 1px 2px rgba(0,0,0,0.03),0 0 0 0.5px rgba(0,0,0,0.03)',font:'-apple-system,BlinkMacSystemFont,Segoe UI,Cairo,Helvetica,sans-serif'};

  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')}
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}

  function showToast(msg,type){
    type=type||'info';var c=document.getElementById('ali-toast-box2');
    if(!c){c=document.createElement('div');c.id='ali-toast-box2';c.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center';document.body.appendChild(c)}
    var cl={success:'#22c55e',error:'#ef4444',warning:'#f59e0b',info:'#6366f1'};var ic={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    var t=document.createElement('div');t.style.cssText='background:'+IOS.card+';color:'+cl[type]+';padding:12px 22px;border-radius:14px;font-size:13px;font-weight:700;font-family:'+IOS.font+';box-shadow:0 8px 30px rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;direction:rtl';
    t.innerHTML='<span>'+ic[type]+'</span> '+esc(msg);c.appendChild(t);
    setTimeout(function(){t.style.transition='all 0.3s';t.style.opacity='0';setTimeout(function(){t.remove()},300)},3500);
  }

  var styleEl=document.createElement('style');styleEl.id='ali-search-css2';
  styleEl.innerHTML=
    '@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}'+
    '@keyframes aliSpin{to{transform:rotate(360deg)}}'+
    '@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}'+
    '@keyframes aliDotPulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}'+
    '@keyframes aliRingGlow{0%,100%{filter:drop-shadow(0 0 4px rgba(99,102,241,0.3))}50%{filter:drop-shadow(0 0 12px rgba(99,102,241,0.6))}}'+
    '#'+PANEL_ID+'{position:fixed;top:14px;right:14px;width:380px;max-height:92vh;background:'+IOS.bg+';backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 20px 60px rgba(0,0,0,0.1);z-index:9999999;font-family:'+IOS.font+';direction:rtl;color:'+IOS.text+';overflow:hidden;animation:aliSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)}'+
    '#'+PANEL_ID+' .ios-grp{background:'+IOS.card+';border-radius:14px;overflow:hidden;box-shadow:'+IOS.shadow+';margin-bottom:12px}'+
    '#'+PANEL_ID+' .ios-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;font-family:'+IOS.font+';transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}'+
    '#'+PANEL_ID+' .ios-btn:active{transform:scale(0.98);opacity:0.9}'+
    '#'+PANEL_ID+' .ios-primary{background:'+IOS.accent+';color:white}'+
    '#'+PANEL_ID+' .ios-ghost{background:rgba(0,0,0,0.03);color:'+IOS.muted+'}'+
    '#'+PANEL_ID+' .ios-input{width:100%;padding:12px 16px;border:none;border-radius:12px;font-size:14px;font-family:'+IOS.font+';outline:none;background:rgba(0,0,0,0.03);color:'+IOS.text+';transition:all 0.2s;font-weight:600;box-sizing:border-box}'+
    '#'+PANEL_ID+' .ios-input:focus{background:rgba(99,102,241,0.04);box-shadow:0 0 0 2px rgba(99,102,241,0.15)}'+
    '#'+PANEL_ID+' .ios-input.match{background:rgba(34,197,94,0.04);box-shadow:0 0 0 2px rgba(34,197,94,0.15)}'+
    '#'+PANEL_ID+' .ios-input.nomatch{background:rgba(239,68,68,0.04);box-shadow:0 0 0 2px rgba(239,68,68,0.15)}'+
    '#'+PANEL_ID+' .res-row{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-bottom:0.5px solid #f3f4f6;cursor:default;transition:background 0.15s}'+
    '#'+PANEL_ID+' .res-row:hover{background:#f9fafb}'+
    '#'+PANEL_ID+' .res-row:last-child{border-bottom:none}'+
    '#'+PANEL_ID+' .res-inv{font-size:14px;font-weight:800;color:'+IOS.accent+';font-family:monospace;letter-spacing:0.5px}'+
    '#'+PANEL_ID+' .res-meta{font-size:11px;color:'+IOS.muted+';font-weight:600;display:flex;gap:10px;flex-wrap:wrap}'+
    '#'+PANEL_ID+' .badge{display:inline-flex;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800}';
  document.head.appendChild(styleEl);

  // ✅ احسب عدد الصفحات من newCount في الصفحة
  var calculatedPages=5;
  try{
    var nc=document.getElementById('newCount');
    if(nc){var n=parseInt(nc.innerText||nc.textContent);if(n>0)calculatedPages=Math.ceil(n/10)}
  }catch(e){}

  var panel=document.createElement('div');panel.id=PANEL_ID;
  panel.innerHTML=
    '<div style="padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;box-shadow:0 3px 12px rgba(99,102,241,0.25)">🗂</div>'+
        '<div><div style="font-size:15px;font-weight:800;color:#1f2937">بحث الطلبات الجديدة</div><div style="font-size:10px;color:#9ca3af;font-weight:600">v'+VERSION+' — New Orders Search</div></div>'+
      '</div>'+
      '<button id="ali2_close" style="width:26px;height:26px;border-radius:50%;border:none;background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">✕</button>'+
    '</div>'+

    '<div style="padding:10px 16px;overflow-y:auto;max-height:calc(92vh - 60px)" id="ali2_body">'+

      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px">'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">📦</div><div id="s2_total" style="font-size:22px;font-weight:900;color:#8b5cf6">0</div><div style="font-size:9px;color:#9ca3af;font-weight:700">إجمالي الطلبات</div></div>'+
        '<div style="background:'+IOS.card+';border-radius:14px;padding:12px 8px;text-align:center;box-shadow:'+IOS.shadow+'"><div style="font-size:16px;margin-bottom:4px">🔍</div><div id="s2_match" style="font-size:22px;font-weight:900;color:#22c55e">0</div><div style="font-size:9px;color:#9ca3af;font-weight:700">نتائج البحث</div></div>'+
      '</div>'+

      '<div class="ios-grp" style="padding:16px">'+
        '<div style="display:flex;align-items:center;gap:16px">'+
          '<div style="position:relative;width:80px;height:80px;flex-shrink:0">'+
            '<svg id="ali2_ring_svg" width="80" height="80" viewBox="0 0 80 80" style="transform:rotate(-90deg)">'+
              '<circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="6"/>'+
              '<circle id="ali2_ring_track" cx="40" cy="40" r="34" fill="none" stroke="url(#aliGrad3)" stroke-width="6" stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="213.6" style="transition:stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)"/>'+
              '<defs><linearGradient id="aliGrad3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#22c55e"/></linearGradient></defs>'+
            '</svg>'+
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">'+
              '<div id="ali2_ring_pct" style="font-size:18px;font-weight:900;color:#6366f1;line-height:1;font-family:monospace">0%</div>'+
            '</div>'+
          '</div>'+
          '<div style="flex:1;min-width:0">'+
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
              '<span style="font-size:13px;font-weight:700">📄 عدد الصفحات</span>'+
              '<input type="number" id="ali2_p_lim" value="'+calculatedPages+'" min="1" class="ios-input" style="width:55px;padding:6px;text-align:center;font-size:14px;font-weight:900;color:#6366f1">'+
            '</div>'+
            '<div style="font-size:11px;color:#9ca3af;font-weight:600;line-height:1.8">'+
              '<div style="display:flex;justify-content:space-between"><span>الصفحات</span><span id="ali2_prog_p">0 / 0</span></div>'+
              '<div style="display:flex;justify-content:space-between"><span>السجلات</span><span id="ali2_prog_r" style="color:#6366f1;font-weight:800">0</span></div>'+
            '</div>'+
            '<div id="ali2_dots" style="display:flex;gap:3px;margin-top:6px;justify-content:center;opacity:0;transition:opacity 0.3s">'+
              '<div style="width:5px;height:5px;border-radius:50%;background:#6366f1;animation:aliDotPulse 1s infinite 0s"></div>'+
              '<div style="width:5px;height:5px;border-radius:50%;background:#8b5cf6;animation:aliDotPulse 1s infinite 0.2s"></div>'+
              '<div style="width:5px;height:5px;border-radius:50%;background:#22c55e;animation:aliDotPulse 1s infinite 0.4s"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+

      '<div id="ali2_status" style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:rgba(34,197,94,0.06);color:#22c55e"><span>✅</span><span>جاهز للبدء</span></div>'+

      '<div id="ali2_main_area">'+
        '<button id="ali2_start" class="ios-btn ios-primary" style="font-size:15px;padding:16px;margin-bottom:8px">🚀 جلب كل الطلبات الجديدة</button>'+
      '</div>'+

      '<div style="text-align:center;padding:8px 0 4px;font-size:9px;color:#9ca3af;font-weight:700;letter-spacing:0.5px">DEVELOPED BY ALI EL-BAZ</div>'+
    '</div>';
  document.body.appendChild(panel);

  document.getElementById('ali2_close').addEventListener('click',function(){
    panel.style.transition='all 0.3s';panel.style.opacity='0';panel.style.transform='translateX(40px) scale(0.97)';
    setTimeout(function(){panel.remove()},300);
  });

  function updateProgress(current,total,records){
    var CIRC=213.6;
    var ring=document.getElementById('ali2_ring_track');
    var pctEl=document.getElementById('ali2_ring_pct');
    var pVal=document.getElementById('ali2_prog_p');
    var rVal=document.getElementById('ali2_prog_r');
    var dots=document.getElementById('ali2_dots');
    var svg=document.getElementById('ali2_ring_svg');
    var pct=total>0?Math.round((current/total)*100):0;
    var offset=CIRC-(pct/100)*CIRC;
    if(ring)ring.style.strokeDashoffset=offset;
    if(pctEl){pctEl.textContent=pct+'%';pctEl.style.color=pct>=100?IOS.success:IOS.accent}
    if(pVal)pVal.textContent=current+' / '+total;
    if(rVal)rVal.textContent=records!==undefined?records:state.savedRows.length;
    if(dots)dots.style.opacity=(pct>0&&pct<100)?'1':'0';
    if(svg)svg.style.animation=(pct>0&&pct<100)?'aliRingGlow 1.5s ease-in-out infinite':'none';
  }

  function setStatus(text,type){
    var el=document.getElementById('ali2_status');if(!el)return;
    var cf={ready:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'✅'},working:{color:'#6366f1',bg:'rgba(99,102,241,0.06)',icon:'spinner'},error:{color:'#ef4444',bg:'rgba(239,68,68,0.06)',icon:'❌'},done:{color:'#22c55e',bg:'rgba(34,197,94,0.06)',icon:'🎉'}};
    var c=cf[type]||cf.ready;
    var ih=c.icon==='spinner'?'<div style="width:14px;height:14px;border:2px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:aliSpin 0.5s linear infinite;flex-shrink:0"></div>':'<span>'+c.icon+'</span>';
    el.style.cssText='display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:700;background:'+c.bg+';color:'+c.color+';transition:all 0.3s';
    el.innerHTML=ih+'<span>'+esc(text)+'</span>';
  }

  function animNum(id,val){
    var el=document.getElementById(id);if(!el||el.innerText===String(val))return;
    el.innerText=val;el.style.animation='aliCountUp 0.4s';setTimeout(function(){el.style.animation=''},400);
  }

  function debounce(fn,d){var t;return function(){clearTimeout(t);t=setTimeout(fn,d)}}

  async function fetchPageOrders(pn,cs){
    var bu=window.location.origin+"/ez_pill_web/";
    var res=await fetch(bu+'Home/getOrders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:cs,pageSelected:pn,searchby:''})});
    return await res.json();
  }

  function parseRow(item){
    return{
      id:item.Invoice||'',
      onl:item.onlineNumber||'',
      name:item.guestName||'',
      mobile:item.guestMobile||item.mobile||''
    };
  }

  async function fetchAll(){
    state.isProcessing=true;state.savedRows=[];state.visitedSet.clear();
    var cs='new';
    var failedPages=[];
    updateProgress(0,0,0);

    try{
      setStatus('جاري الجلب المبدئي...','working');
      var mp=parseInt(document.getElementById('ali2_p_lim').value)||1;

      var fd=await fetchPageOrders(1,cs);
      if(fd.total_orders){var et=parseInt(fd.total_orders)||0;if(et>0){mp=Math.ceil(et/10);document.getElementById('ali2_p_lim').value=mp}}

      var fo=[];try{fo=typeof fd.orders_list==='string'?JSON.parse(fd.orders_list):fd.orders_list}catch(e){}
      if(fo&&fo.length>0){
        for(var fi=0;fi<fo.length;fi++){
          var fI=fo[fi].Invoice||'';
          if(fI.length>2&&!state.visitedSet.has(fI)){state.visitedSet.add(fI);state.savedRows.push(parseRow(fo[fi]))}
        }
      }
      var done=1;updateProgress(1,mp,state.savedRows.length);

      var BATCH=5;
      for(var pg=2;pg<=mp;pg+=BATCH){
        var batch=[];
        for(var j=pg;j<pg+BATCH&&j<=mp;j++){
          (function(pn){
            batch.push(
              fetchPageOrders(pn,cs).then(function(data){
                var orders=[];try{orders=typeof data.orders_list==='string'?JSON.parse(data.orders_list):data.orders_list}catch(e){}
                if(!orders||orders.length===0)return;
                for(var i=0;i<orders.length;i++){
                  var inv=orders[i].Invoice||'';
                  if(inv.length>2&&!state.visitedSet.has(inv)){state.visitedSet.add(inv);state.savedRows.push(parseRow(orders[i]))}
                }
                done++;updateProgress(done,mp,state.savedRows.length);
                setStatus('جلب '+done+'/'+mp+' صفحة...','working');
              }).catch(function(e){console.warn('فشل صفحة '+pn,e);failedPages.push(pn);done++;updateProgress(done,mp,state.savedRows.length)})
            );
          })(j);
        }
        await Promise.all(batch);
        if(pg+BATCH<=mp)await sleep(250);
      }

      updateProgress(mp,mp,state.savedRows.length);
      if(failedPages.length>0)showToast('تنبيه: '+failedPages.length+' صفحة لم تُجلب','warning');
      setStatus('تم جلب '+state.savedRows.length+' طلب جديد','done');
      showToast('تم جلب '+state.savedRows.length+' طلب بنجاح','success');
      animNum('s2_total',state.savedRows.length);animNum('s2_match',state.savedRows.length);
      buildSearchUI();
    }catch(err){
      console.error(err);setStatus('خطأ في الاتصال بالخادم','error');showToast('مشكلة في جلب البيانات!','error');
    }finally{state.isProcessing=false}
  }

  function buildSearchUI(){
    var ma=document.getElementById('ali2_main_area');
    ma.innerHTML=
      '<div class="ios-grp" style="padding:14px 16px">'+

        // ✅ بحث برقم الفاتورة — 0 ثابت + باقي الأرقام
        '<div style="margin-bottom:8px">'+
          '<div style="font-size:11px;font-weight:700;color:'+IOS.muted+';margin-bottom:4px;padding-right:4px">🔢 رقم الفاتورة</div>'+
          '<div style="position:relative">'+
            '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:900;color:'+IOS.muted+';pointer-events:none;font-family:monospace;z-index:1">0</span>'+
            '<input type="text" id="ali2_sInv" inputmode="numeric" class="ios-input" placeholder="أدخل الأرقام بعد الـ 0..." style="padding-right:30px;direction:ltr;text-align:left;letter-spacing:1px;font-family:monospace;font-weight:700">'+
          '</div>'+
        '</div>'+

        // ✅ بحث برقم الصيدلية — أول 4 أرقام بعد الـ 0 (نفس منطق الفاتورة بس 4 أرقام بس)
        '<div style="margin-bottom:8px">'+
          '<div style="font-size:11px;font-weight:700;color:'+IOS.muted+';margin-bottom:4px;padding-right:4px">🏪 رقم الصيدلية <span style="font-weight:600;color:'+IOS.accent+'">(4 أرقام بعد الـ 0)</span></div>'+
          '<div style="position:relative">'+
            '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:900;color:'+IOS.muted+';pointer-events:none;font-family:monospace;z-index:1">0</span>'+
            '<input type="text" id="ali2_sPha" inputmode="numeric" maxlength="4" class="ios-input" placeholder="مثال: 1234 ← يبحث بـ 01234" style="padding-right:30px;direction:ltr;text-align:left;letter-spacing:2px;font-family:monospace;font-weight:700">'+
          '</div>'+
        '</div>'+

        // ✅ بحث برقم الطلب ERX
        '<div>'+
          '<div style="font-size:11px;font-weight:700;color:'+IOS.muted+';margin-bottom:4px;padding-right:4px">🔗 رقم الطلب (ERX)</div>'+
          '<input type="text" id="ali2_sOnl" class="ios-input" placeholder="ابحث برقم الطلب ERX..." style="direction:ltr;text-align:left;font-family:monospace">'+
        '</div>'+

      '</div>'+

      '<div id="ali2_count" style="font-size:11px;color:'+IOS.muted+';text-align:center;font-weight:600;padding:2px 0 10px">عرض '+state.savedRows.length+' من '+state.savedRows.length+' نتيجة</div>'+

      '<div class="ios-grp" id="ali2_results" style="max-height:340px;overflow-y:auto;padding:0"></div>'+

      '<button id="ali2_reset" class="ios-btn ios-ghost" style="margin-top:8px">🔄 إعادة الجلب</button>';

    renderResults(state.savedRows);

    var sInv=document.getElementById('ali2_sInv');
    var sPha=document.getElementById('ali2_sPha');
    var sOnl=document.getElementById('ali2_sOnl');

    function doSearch(){
      var riRaw=sInv.value.trim();
      var phRaw=sPha.value.trim();
      var os=sOnl.value.trim().toLowerCase();

      // ✅ رقم الفاتورة: 0 + ما كتبه المستخدم
      var invFilter=riRaw!==''?('0'+riRaw):'';
      // ✅ رقم الصيدلية: أول 5 أرقام من الفاتورة = 0 + 4 أرقام
      var phaFilter=phRaw!==''?('0'+phRaw):'';

      var hf=invFilter!==''||phaFilter!==''||os!=='';
      var matched=[];

      for(var i=0;i<state.savedRows.length;i++){
        var rw=state.savedRows[i];
        var idLow=rw.id.toLowerCase();

        // بحث برقم الفاتورة — startsWith كامل
        var mi=invFilter!==''&&idLow.startsWith(invFilter.toLowerCase());

        // ✅ بحث برقم الصيدلية — أول 5 أرقام من رقم الفاتورة
        // يطابق فقط لو الـ 5 أرقام الأولى مساوية لـ 0+الأربعة أرقام
        var mp=phaFilter!==''&&idLow.substring(0,phaFilter.length)===phaFilter.toLowerCase();

        // بحث برقم الطلب ERX
        var mo=os!==''&&rw.onl.toLowerCase().indexOf(os)!==-1;

        var ok=hf?(mi||mp||mo):true;
        if(ok)matched.push(rw);
      }

      renderResults(matched);
      var sc=document.getElementById('ali2_count');
      if(sc)sc.innerText='عرض '+matched.length+' من '+state.savedRows.length+' نتيجة';
      animNum('s2_match',matched.length);

      // ✅ تلوين الخانات
      sInv.className='ios-input'+(riRaw.length>0?(matched.length>0?' match':' nomatch'):'');
      sPha.className='ios-input'+(phRaw.length>0?(matched.length>0?' match':' nomatch'):'');
      sOnl.className='ios-input'+(os.length>0?(matched.length>0?' match':' nomatch'):'');
    }

    var df=debounce(doSearch,150);
    sInv.addEventListener('input',df);
    sPha.addEventListener('input',df);
    sOnl.addEventListener('input',df);

    document.getElementById('ali2_reset').addEventListener('click',function(){
      if(state.isProcessing)return;
      var ma2=document.getElementById('ali2_main_area');
      ma2.innerHTML='<button id="ali2_start" class="ios-btn ios-primary" style="font-size:15px;padding:16px;margin-bottom:8px">🚀 جلب كل الطلبات الجديدة</button>';
      state.savedRows=[];state.visitedSet.clear();
      animNum('s2_total',0);animNum('s2_match',0);
      updateProgress(0,0,0);
      setStatus('جاهز للبدء','ready');
      document.getElementById('ali2_start').addEventListener('click',startFetch);
    });
  }

  function renderResults(rows){
    var box=document.getElementById('ali2_results');if(!box)return;
    if(rows.length===0){
      box.innerHTML='<div style="padding:24px;text-align:center;color:'+IOS.muted+';font-size:13px;font-weight:600">لا توجد نتائج مطابقة</div>';
      return;
    }
    var h='';
    // ✅ استخراج رقم الصيدلية من أول 5 أرقام من الفاتورة
    for(var i=0;i<Math.min(rows.length,200);i++){
      var r=rows[i];
      var pharmaCode=r.id.length>=5?r.id.substring(0,5):'';
      var pBadge=pharmaCode?'<span class="badge" style="background:rgba(99,102,241,0.08);color:'+IOS.accent+'">🏪 '+esc(pharmaCode)+'</span>':'';
      var onlBadge=r.onl?'<span class="badge" style="background:rgba(34,197,94,0.08);color:#22c55e">'+esc(r.onl)+'</span>':'';
      h+='<div class="res-row">'+
        '<div style="display:flex;align-items:center;justify-content:space-between">'+
          '<div class="res-inv">'+esc(r.id)+'</div>'+
          '<div style="display:flex;gap:4px">'+onlBadge+pBadge+'</div>'+
        '</div>'+
        '<div class="res-meta">'+
          (r.name?'<span>👤 '+esc(r.name)+'</span>':'')+
          (r.mobile?'<span>📱 '+esc(r.mobile)+'</span>':'')+
        '</div>'+
      '</div>';
    }
    if(rows.length>200)h+='<div style="padding:12px;text-align:center;font-size:11px;color:'+IOS.muted+';font-weight:600">... و '+(rows.length-200)+' نتيجة أخرى — ضيّق البحث</div>';
    box.innerHTML=h;
  }

  function startFetch(){
    if(state.isProcessing)return;
    var btn=document.getElementById('ali2_start');
    if(btn){btn.disabled=true;btn.innerHTML='<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:aliSpin 0.5s linear infinite"></div> جاري الجلب...';btn.style.opacity='0.7'}
    fetchAll();
  }

  document.getElementById('ali2_start').addEventListener('click',startFetch);
})();

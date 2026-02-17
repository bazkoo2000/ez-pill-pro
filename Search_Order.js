javascript:(function(){
  'use strict';

  const PANEL_ID = 'ali_sys_v4';
  const VERSION = '4.2';
  const VER_KEY = 'ezpill_ver';
  if (document.getElementById(PANEL_ID)) { document.getElementById(PANEL_ID).remove(); return; }

  const state = { savedRows: [], visitedSet: new Set(), isProcessing: false, isSyncing: false, openedCount: 0, tbody: null };

  const pNodes = Array.from(document.querySelectorAll('.pagination a, .pagination li, .pagination span')).map(el => parseInt(el.innerText.trim())).filter(n => !isNaN(n) && n > 0);
  const defaultPages = pNodes.length > 0 ? Math.max(...pNodes) : 1;

  function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('ali-toast-box');
    if (!container) { container = document.createElement('div'); container.id = 'ali-toast-box'; container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center'; document.body.appendChild(container); }
    const colors = { success:'#059669', error:'#dc2626', warning:'#d97706', info:'#1e293b' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const toast = document.createElement('div');
    toast.style.cssText = 'background:' + colors[type] + ';color:white;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;direction:rtl;animation:aliToastIn 0.4s cubic-bezier(0.16,1,0.3,1);white-space:nowrap';
    toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(function() { toast.style.transition = 'all 0.3s'; toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 3500);
  }
  try{var lv=localStorage.getItem(VER_KEY);if(lv!==VERSION){localStorage.setItem(VER_KEY,VERSION);if(lv)setTimeout(function(){showToast('تم تلقي تحديث جديد 🎉 → v'+VERSION,'success')},1000);}}catch(e){}

  function showDialog(opts) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;animation:aliFadeIn 0.25s';
      var iconBg = {blue:'linear-gradient(135deg,#dbeafe,#bfdbfe)',green:'linear-gradient(135deg,#dcfce7,#bbf7d0)',amber:'linear-gradient(135deg,#fef3c7,#fde68a)',red:'linear-gradient(135deg,#fee2e2,#fecaca)'};
      var ih='',bh='';
      if(opts.info)for(var i=0;i<opts.info.length;i++){var r=opts.info[i];ih+='<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px"><span style="color:#64748b;font-weight:600">'+r.label+'</span><span style="font-weight:800;color:'+(r.color||'#1e293b')+';font-size:12px">'+r.value+'</span></div>';}
      if(opts.buttons)for(var j=0;j<opts.buttons.length;j++){var btn=opts.buttons[j];bh+='<button data-idx="'+j+'" style="flex:1;padding:14px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,sans-serif;'+(btn.style||'background:#f1f5f9;color:#475569')+';transition:all 0.2s">'+btn.text+'</button>';}
      overlay.innerHTML='<div style="background:white;border-radius:24px;width:420px;max-width:92vw;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;animation:aliDialogIn 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="padding:24px 24px 0;text-align:center"><div style="width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;background:'+(iconBg[opts.iconColor]||iconBg.blue)+'">'+opts.icon+'</div><div style="font-size:20px;font-weight:900;margin-bottom:6px">'+opts.title+'</div><div style="font-size:14px;color:#64748b;line-height:1.6;font-weight:500">'+opts.desc+'</div></div><div style="padding:20px 24px">'+ih+(opts.body||'')+'</div><div style="padding:16px 24px 24px;display:flex;gap:10px">'+bh+'</div></div>';
      overlay.addEventListener('click',function(e){var b=e.target.closest('[data-idx]');if(b){overlay.remove();resolve(opts.buttons[parseInt(b.getAttribute('data-idx'))].value);}});
      document.body.appendChild(overlay);
    });
  }

  var styleEl = document.createElement('style');
  styleEl.innerHTML='@keyframes aliSlideIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}@keyframes aliPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}@keyframes aliSpin{to{transform:rotate(360deg)}}@keyframes aliFadeIn{from{opacity:0}to{opacity:1}}@keyframes aliDialogIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes aliToastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes aliCountUp{from{transform:scale(1.3);opacity:0.5}to{transform:scale(1);opacity:1}}@keyframes aliBlink{0%,100%{opacity:1}50%{opacity:0.4}}#'+PANEL_ID+'{position:fixed;top:3%;right:2%;width:380px;max-height:92vh;background:#fff;border-radius:28px;box-shadow:0 0 0 1px rgba(0,0,0,0.04),0 25px 60px -12px rgba(0,0,0,0.15),0 0 100px -20px rgba(59,130,246,0.1);z-index:9999999;font-family:Segoe UI,sans-serif;direction:rtl;color:#1e293b;overflow:hidden;transition:all 0.5s;animation:aliSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)}#'+PANEL_ID+'.ali-minimized{width:60px!important;height:60px!important;border-radius:50%!important;cursor:pointer!important;background:linear-gradient(135deg,#1e40af,#3b82f6)!important;box-shadow:0 8px 30px rgba(59,130,246,0.4)!important;animation:aliPulse 2s infinite;overflow:hidden}#'+PANEL_ID+'.ali-minimized .ali-inner{display:none!important}#'+PANEL_ID+'.ali-minimized::after{content:"⚙️";font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(styleEl);

  function buildStatCard(icon,val,label,color,id,border){return '<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 6px;text-align:center;position:relative;overflow:hidden"><div style="position:absolute;top:0;right:0;left:0;height:3px;background:'+border+'"></div><div style="font-size:18px;margin-bottom:4px">'+icon+'</div><div id="'+id+'" style="font-size:22px;font-weight:900;color:'+color+';line-height:1;margin-bottom:2px">'+val+'</div><div style="font-size:10px;color:#94a3b8;font-weight:700">'+label+'</div></div>';}

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML='<div class="ali-inner"><div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);padding:20px 22px 18px;color:white;position:relative;overflow:hidden"><div style="position:absolute;top:-50%;right:-30%;width:200px;height:200px;background:radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%);border-radius:50%"></div><div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1"><div style="display:flex;gap:6px"><span id="ali_min" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(255,255,255,0.12);cursor:pointer">−</span><span id="ali_close" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;background:rgba(239,68,68,0.2);cursor:pointer">✕</span></div><h3 style="font-size:20px;font-weight:900;margin:0">EZ-PILL PRO</h3></div><div style="text-align:right;margin-top:4px;position:relative;z-index:1"><span style="display:inline-block;background:rgba(59,130,246,0.2);color:#93c5fd;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700">v4.2 💪</span></div></div><div style="padding:20px 22px;overflow-y:auto;max-height:calc(92vh - 100px)" id="ali_body"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">'+buildStatCard('📊','0','إجمالي','#8b5cf6','stat_total','linear-gradient(90deg,#8b5cf6,#a78bfa)')+buildStatCard('🔍','0','مطابق','#10b981','stat_match','linear-gradient(90deg,#10b981,#34d399)')+buildStatCard('🚀','0','تم فتحه','#3b82f6','stat_opened','linear-gradient(90deg,#3b82f6,#60a5fa)')+'</div><div id="ali_main_body"><div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:16px;padding:16px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:700;color:#475569">📄 عدد الصفحات</span><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:#94a3b8;font-weight:600">صفحة</span><input type="number" id="p_lim" value="'+defaultPages+'" min="1" style="width:48px;padding:4px 6px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;font-size:16px;font-weight:800;color:#3b82f6;background:white;outline:none"></div></div><div id="p-bar" style="height:8px;background:#e2e8f0;border-radius:10px;overflow:hidden"><div id="p-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd);border-radius:10px;transition:width 0.8s"></div></div></div><div id="status-msg" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:600;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0"><span>✅</span><span>جاهز لبدء تجميع البيانات</span></div><div id="ali_scan_log" style="display:none;background:#1e293b;border-radius:12px;padding:10px;margin-bottom:12px;max-height:120px;overflow-y:auto;font-size:11px;color:#94a3b8;font-family:Consolas,monospace;direction:ltr;text-align:left;line-height:1.8"></div><button id="ali_start" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:all 0.3s">🚀 بدء تجميع البيانات</button></div><div style="text-align:center;padding:14px 0 4px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div></div></div>';
  document.body.appendChild(panel);

  function setStatus(text,type){var el=document.getElementById('status-msg');if(!el)return;var c={ready:{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'✅'},working:{bg:'#eff6ff',co:'#1d4ed8',bo:'#bfdbfe',ic:'spinner'},error:{bg:'#fef2f2',co:'#dc2626',bo:'#fecaca',ic:'❌'},done:{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'🎉'},sync:{bg:'#fefce8',co:'#a16207',bo:'#fef08a',ic:'spinner'}}[type]||{bg:'#f0fdf4',co:'#15803d',bo:'#bbf7d0',ic:'✅'};var ih=c.ic==='spinner'?'<div style="width:16px;height:16px;border:2px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:aliSpin 0.8s linear infinite;flex-shrink:0"></div>':'<span>'+c.ic+'</span>';el.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-bottom:12px;font-size:13px;font-weight:600;background:'+c.bg+';color:'+c.co+';border:1px solid '+c.bo;el.innerHTML=ih+'<span>'+text+'</span>';}
  function animNum(id,val){var el=document.getElementById(id);if(!el||el.innerText===String(val))return;requestAnimationFrame(function(){el.innerText=val;el.style.animation='aliCountUp 0.4s';setTimeout(function(){el.style.animation=''},400);});}
  function updateStats(mc){animNum('stat_total',state.savedRows.length);animNum('stat_match',mc!==undefined?mc:state.savedRows.length);animNum('stat_opened',state.openedCount);}
  function debounce(fn,d){var t;return function(){clearTimeout(t);t=setTimeout(fn,d);};}
  function addScanLog(msg){var el=document.getElementById('ali_scan_log');if(!el)return;el.style.display='block';var d=document.createElement('div');d.textContent=msg;el.appendChild(d);el.scrollTop=el.scrollHeight;}

  panel.addEventListener('click',function(e){if(panel.classList.contains('ali-minimized')){panel.classList.remove('ali-minimized');e.stopPropagation();}});
  document.getElementById('ali_close').addEventListener('click',function(e){e.stopPropagation();panel.style.animation='aliSlideIn 0.3s reverse';setTimeout(function(){panel.remove()},280);});
  document.getElementById('ali_min').addEventListener('click',function(e){e.stopPropagation();panel.classList.add('ali-minimized');});

  // ═══════════════════════════════════════════
  //  Data Collection
  // ═══════════════════════════════════════════
  function collectFromCurrentPage(){
    var newCount=0,noArgs=0;
    document.querySelectorAll('table tr').forEach(function(row){
      var cells=row.querySelectorAll('td');
      if(cells.length>1){var key=cells[0].innerText.trim();if(key.length>3&&!state.visitedSet.has(key)){state.visitedSet.add(key);var args=null;var label=row.querySelector('label[onclick^="getDetails"]');if(label){var m=label.getAttribute('onclick').match(/'(.*?)','(.*?)','(.*?)','(.*?)'/);if(m)args=[m[1],m[2],m[3],m[4]];}if(!args)noArgs++;state.savedRows.push({id:key,onl:cells[1].innerText.trim(),node:row.cloneNode(true),args:args});newCount++;}}
    });
    return {newCount:newCount,noArgs:noArgs};
  }

  // ═══════════════════════════════════════════════════════════════
  //  🔥 ROBUST PAGE NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  function getTableFingerprint(){var cells=document.querySelectorAll('table td:first-child');var keys=[];for(var i=0;i<Math.min(cells.length,5);i++)keys.push(cells[i].innerText.trim());return keys.join('|');}

  function clickNextPage(target){
    // طريقة 1: رقم الصفحة المطلوب
    var selectors=['.pagination a','.pagination li a','.pagination span','.paginate_button','[class*="page"] a','a[href*="page"]','.pagination button','nav a','ul.pagination li a'];
    for(var s=0;s<selectors.length;s++){var links=document.querySelectorAll(selectors[s]);for(var i=0;i<links.length;i++){if(links[i].innerText.trim()===String(target)){links[i].click();return 'num';}}}
    // طريقة 2: Next / > / »
    var nextT=['>','»','>>','Next','next','التالي','›'];
    for(var s2=0;s2<selectors.length;s2++){var l2=document.querySelectorAll(selectors[s2]);for(var j=0;j<l2.length;j++){var t=l2[j].innerText.trim();for(var k=0;k<nextT.length;k++){if(t===nextT[k]){l2[j].click();return 'next';}}}}
    // طريقة 3: aria-label
    var aria=document.querySelector('[aria-label="Next"],[aria-label="next"],.next a,.next');
    if(aria){aria.click();return 'aria';}
    return false;
  }

  function waitForPageChange(oldFP,maxWait){
    return new Promise(function(resolve){
      var start=Date.now();
      var check=setInterval(function(){
        var newFP=getTableFingerprint();
        if(newFP!==oldFP&&newFP.length>0){clearInterval(check);setTimeout(function(){resolve(true)},2000);}
        else if(Date.now()-start>maxWait){clearInterval(check);resolve(false);}
      },500);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  🔥 ROBUST SCANNER — 3 محاولات لكل صفحة
  // ═══════════════════════════════════════════════════════════════
  var totalNoArgs=0;

  async function scanPageRobust(curr,total,isSync){
    state.isProcessing=true;
    var fill=document.getElementById('p-fill');if(fill)fill.style.width=((curr/total)*100)+'%';
    setStatus((isSync?'مزامنة':'تحليل')+' الصفحة '+curr+' من '+total+' — '+state.savedRows.length+' طلب',isSync?'sync':'working');

    var before=state.savedRows.length;
    var result=collectFromCurrentPage();
    totalNoArgs+=result.noArgs;
    updateStats();
    addScanLog('📄 صفحة '+curr+': +'+(state.savedRows.length-before)+' جديد (إجمالي: '+state.savedRows.length+')');

    if(curr<total){
      var oldFP=getTableFingerprint();
      var moved=false;

      for(var attempt=1;attempt<=3;attempt++){
        var method=clickNextPage(curr+1);
        if(!method){
          addScanLog('⚠️ ['+attempt+'/3] زر صفحة '+(curr+1)+' غير موجود');
          if(attempt<3){await new Promise(function(r){setTimeout(r,2000)});continue;}
          break;
        }
        addScanLog('⏳ ['+attempt+'/3] ضغط '+method+' — انتظار...');
        var changed=await waitForPageChange(oldFP,20000);
        if(changed){addScanLog('✅ صفحة '+(curr+1)+' تم تحميلها');moved=true;break;}
        else{addScanLog('⚠️ ['+attempt+'/3] لم تتغير بعد 20 ثانية');if(attempt<3)await new Promise(function(r){setTimeout(r,3000)});}
      }

      if(moved){await scanPageRobust(curr+1,total,isSync);}
      else{addScanLog('❌ فشل الانتقال لصفحة '+(curr+1)+' بعد 3 محاولات');showToast('⚠️ توقف عند صفحة '+curr+' — '+state.savedRows.length+' طلب','warning');finishScan(isSync);}
    }else{addScanLog('🎉 تم فحص كل الصفحات!');finishScan(isSync);}
  }

  // ═══════════════════════════════════════════
  //  Finish Scan
  // ═══════════════════════════════════════════
  function finishScan(isSync){
    state.isProcessing=false;state.isSyncing=false;
    var tables=document.querySelectorAll('table');var target=tables[0];for(var t=0;t<tables.length;t++){if(tables[t].innerText.length>target.innerText.length)target=tables[t];}
    state.tbody=target.querySelector('tbody')||target;state.tbody.innerHTML='';
    for(var i=0;i<state.savedRows.length;i++){state.savedRows[i].node.style.cursor='pointer';state.tbody.appendChild(state.savedRows[i].node);}
    updateStats(state.savedRows.length);
    if(totalNoArgs>0)showToast(totalNoArgs+' طلب بدون بيانات فتح','warning');
    setStatus((isSync?'تمت المزامنة':'تم التجميع')+' — '+state.savedRows.length+' طلب','done');
    showToast((isSync?'مزامنة: ':'تم تجميع ')+state.savedRows.length+' طلب','success');

    var mainBody=document.getElementById('ali_main_body');
    mainBody.innerHTML='<div style="margin-bottom:10px"><div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:900;color:#94a3b8;z-index:1;pointer-events:none;font-family:monospace">0</span><input type="text" id="ali_sI" placeholder="أدخل الأرقام بعد الـ 0 (كود الصيدلية)..." style="width:100%;padding:14px 16px 14px 34px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Segoe UI,monospace;outline:none;background:#f8fafc;color:#1e293b;direction:ltr;text-align:left;transition:all 0.25s;letter-spacing:1px;font-weight:700;box-sizing:border-box"></div></div><div style="margin-bottom:10px"><div style="position:relative"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;z-index:1;pointer-events:none">🔗</span><input type="text" id="ali_sO" placeholder="بحث برقم الطلب (ERX)..." style="width:100%;padding:14px 42px 14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:Segoe UI,sans-serif;outline:none;background:#f8fafc;color:#1e293b;direction:rtl;transition:all 0.25s;font-weight:600;box-sizing:border-box"></div></div><div id="ali_search_count" style="font-size:11px;color:#94a3b8;text-align:center;font-weight:600;padding:2px 0 12px">عرض '+state.savedRows.length+' من '+state.savedRows.length+' نتيجة</div><button id="ali_btn_open" style="width:100%;padding:14px 20px;border:none;border-radius:14px;cursor:pointer;font-weight:800;font-size:15px;font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 15px rgba(16,185,129,0.3);transition:all 0.3s;margin-bottom:8px">⚡ ابحث أولاً ثم افتح المطابق</button><button id="ali_btn_sync" style="width:100%;padding:12px 16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:13px;font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;background:#f8fafc;border:2px solid #e2e8f0;color:#475569;transition:all 0.3s">🔄 مزامنة (تحديث + حذف المُغلق + إضافة الجديد)</button>';

    var sI=document.getElementById('ali_sI'),sO=document.getElementById('ali_sO'),searchCount=document.getElementById('ali_search_count'),openBtn=document.getElementById('ali_btn_open');
    var currentMatches=[];

    function filterResults(){
      var rawInv=sI.value.trim(),invS=rawInv!==''?'0'+rawInv:'',ordS=sO.value.trim().toLowerCase();
      state.tbody.innerHTML='';var shown=0;currentMatches=[];var hasF=invS!==''||ordS!=='';
      for(var i=0;i<state.savedRows.length;i++){var row=state.savedRows[i];var show=hasF?((invS!==''&&row.id.startsWith(invS))||(ordS!==''&&row.onl.toLowerCase().indexOf(ordS)!==-1)):true;if(show){state.tbody.appendChild(row.node);shown++;if(hasF)currentMatches.push(row);}}
      searchCount.innerText='عرض '+shown+' من '+state.savedRows.length+' نتيجة';updateStats(shown);
      if(hasF&&currentMatches.length>0){var op=currentMatches.filter(function(r){return r.args!==null}).length;openBtn.innerHTML='⚡ فتح المطابق ('+op+' طلب)';openBtn.style.opacity='1';openBtn.style.cursor='pointer';}
      else if(hasF){openBtn.innerHTML='⚡ لا توجد نتائج';openBtn.style.opacity='0.5';openBtn.style.cursor='not-allowed';}
      else{openBtn.innerHTML='⚡ ابحث أولاً ثم افتح المطابق';openBtn.style.opacity='0.7';openBtn.style.cursor='not-allowed';}
      sI.style.borderColor=rawInv.length>0?(shown>0?'#10b981':'#ef4444'):'#e2e8f0';sI.style.background=rawInv.length>0?(shown>0?'#f0fdf4':'#fef2f2'):'#f8fafc';
      sO.style.borderColor=ordS.length>0?(shown>0?'#10b981':'#ef4444'):'#e2e8f0';sO.style.background=ordS.length>0?(shown>0?'#f0fdf4':'#fef2f2'):'#f8fafc';
    }
    var df=debounce(filterResults,150);sI.addEventListener('input',df);sO.addEventListener('input',df);

    openBtn.addEventListener('click',async function(){
      if(!sI.value.trim()&&!sO.value.trim()){showToast('ابحث أولاً!','warning');sI.focus();sI.style.animation='aliBlink 0.5s 3';setTimeout(function(){sI.style.animation=''},1500);return;}
      var openable=currentMatches.filter(function(r){return r.args!==null}),skipped=currentMatches.length-openable.length;
      if(!openable.length){showToast(skipped>0?skipped+' طلب بدون بيانات فتح!':'لا توجد نتائج','warning');return;}
      var info=[{label:'عدد الطلبات',value:openable.length+' طلب',color:'#10b981'},{label:'الوقت المتوقع',value:'~'+Math.ceil(openable.length*1.2)+' ثانية',color:'#f59e0b'}];
      if(skipped>0)info.push({label:'⚠️ تخطي',value:skipped+' (بدون بيانات)',color:'#ef4444'});
      var res=await showDialog({icon:'📂',iconColor:'blue',title:'فتح '+openable.length+' طلب',desc:'الصفحة الرئيسية ستبقى أمامك',info:info,buttons:[{text:'إلغاء',value:'cancel'},{text:'✅ تأكيد',value:'confirm',style:'background:linear-gradient(135deg,#059669,#10b981);color:white'}]});
      if(res!=='confirm')return;
      openBtn.disabled=true;openBtn.style.opacity='0.6';
      var opened=0,base=window.location.origin+"/ez_pill_web/getEZPill_Details";
      for(var idx=0;idx<openable.length;idx++){
        var item=openable[idx];var url=base+"?onlineNumber="+item.args[0].replace("ERX","")+"&Invoice="+item.args[1]+"&typee="+item.args[2]+"&head_id="+item.args[3];
        try{var w=window.open(url,"_blank");if(w){opened++;state.openedCount++;w.blur();window.focus();}}catch(e){}
        openBtn.innerHTML='🚀 فتح ('+(idx+1)+'/'+openable.length+')';setStatus('فتح '+(idx+1)+' من '+openable.length+': '+(item.onl||item.id),'working');updateStats();
        if(idx<openable.length-1)await new Promise(function(r){setTimeout(r,1200)});
      }
      showToast('تم فتح '+opened+' طلب','success');setStatus('تم فتح '+opened+' — إجمالي: '+state.openedCount,'done');
      openBtn.disabled=false;filterResults();
    });

    document.getElementById('ali_btn_sync').addEventListener('click',async function(){
      if(state.isSyncing||state.isProcessing){showToast('المزامنة شغالة!','warning');return;}
      var syncBtn=this;
      var res=await showDialog({icon:'🔄',iconColor:'blue',title:'المزامنة الذكية',desc:'إعادة فحص الصفحات',info:[{label:'الحالية',value:state.savedRows.length+'',color:'#8b5cf6'},{label:'الصفحات',value:(document.getElementById('p_lim').value||'1'),color:'#f59e0b'}],buttons:[{text:'إلغاء',value:'cancel'},{text:'🔄 بدء',value:'confirm',style:'background:linear-gradient(135deg,#1e40af,#3b82f6);color:white'}]});
      if(res!=='confirm')return;
      state.isSyncing=true;syncBtn.disabled=true;syncBtn.innerHTML='⏳ مزامنة...';
      state.visitedSet.clear();state.savedRows=[];totalNoArgs=0;
      var logEl=document.getElementById('ali_scan_log');if(logEl)logEl.innerHTML='';
      await scanPageRobust(1,parseInt(document.getElementById('p_lim').value)||1,true);
    });
  }

  document.getElementById('ali_start').addEventListener('click',async function(){
    if(state.isProcessing)return;
    this.disabled=true;this.innerHTML='⏳ جاري التجميع...';this.style.opacity='0.7';this.style.cursor='not-allowed';
    totalNoArgs=0;
    await scanPageRobust(1,parseInt(document.getElementById('p_lim').value)||1,false);
  });

})();

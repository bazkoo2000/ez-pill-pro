javascript:(function(){
var APP_VERSION='134.0';
var APP_NAME='EZ_Pill Farmadosis';

/* ══════════════════════════════════════════
   WHAT'S NEW - CHANGELOG SYSTEM
   ══════════════════════════════════════════ */
var CHANGELOG={
  '134.0':{
    title:'تحديث ذكي ⚡',
    features:[
      {icon:'💾',text:'حفظ الإعدادات تلقائياً - الأشهر والأيام والخيارات تترجع زي ما سبتها'},
      {icon:'🔁',text:'تنبيه التكرار - لو نفس الصنف موجود أكتر من مرة في الطلب'},
      {icon:'📊',text:'ملخص الطلب - إحصائيات كاملة بعد المعالجة'},
      {icon:'🌙',text:'الوضع الليلي (Dark Mode) - للشغل بالليل'},
      {icon:'🔔',text:'أصوات تنبيه ذكية - تختلف حسب نوع التنبيه'}
    ]
  },
  '133.0':{
    title:'تحديث ذكي 🧠',
    features:[
      {icon:'👤',text:'استخلاص اسم الضيف/المريض من Prescription Notes تلقائياً'},
      {icon:'⚠️',text:'نظام تحذيرات جديد بالكامل - لكل تحذير زرار تطبيق أو تجاهل'},
      {icon:'💊',text:'اكتشاف الجرعة المزدوجة (2 Undefined/tablets) مع تغيير Dose وتضاعف Size'},
      {icon:'🔍',text:'بحث ذكي في Import Invoice بالفاتورة أو ERX'},
      {icon:'🛡️',text:'حماية الفاتورة الحالية من الاستيراد المكرر'},
      {icon:'📋',text:'زرار تصغير لدايلوج خيارات إضافية'},
      {icon:'📦',text:'اكتشاف تعليمات التغليف: دمج بوكس واحد أو كل شهر بصندوق منفصل'},
      {icon:'🎉',text:'شاشة What\'s New تظهر مرة واحدة مع كل تحديث'}
    ]
  },
  '132.0':{
    title:'تحديث رئيسي 🎉',
    features:[
      {icon:'🎨',text:'واجهة Dialog جديدة بتصميم احترافي'},
      {icon:'💊',text:'دعم كل 6 ساعات (Q6H) → صفين × 12 ساعة'},
      {icon:'📋',text:'جدول جرعات محسن مع تعليم أصناف التكرار ⚡'},
      {icon:'🌐',text:'اكتشاف لغة الجرعات وضبط Patient Language'},
      {icon:'🖌️',text:'تنسيق احترافي للصفحة والأزرار والجداول'}
    ]
  }
};

function showWhatsNew(){
  try{
    var lastSeen=localStorage.getItem('ez_pill_version');
    if(lastSeen===APP_VERSION) return;
    var info=CHANGELOG[APP_VERSION];
    if(!info&&lastSeen) {localStorage.setItem('ez_pill_version',APP_VERSION);return;}
    if(!info) info={title:'تحديث جديد ✨',features:[{icon:'🚀',text:'تم التحديث إلى النسخة '+APP_VERSION}]};

    /* Build features HTML */
    var featuresHtml='';
    for(var i=0;i<info.features.length;i++){
      var f=info.features[i];
      featuresHtml+='<div class="ez-wn-item" style="animation-delay:'+(0.1+i*0.07)+'s">'+
        '<span class="ez-wn-icon">'+f.icon+'</span>'+
        '<span class="ez-wn-text">'+f.text+'</span></div>';
    }

    /* Create overlay */
    var overlay=document.createElement('div');
    overlay.id='ez-whats-new';
    overlay.innerHTML='\
    <style>\
    @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap");\
    #ez-whats-new{position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:999998;display:flex;align-items:center;justify-content:center;animation:ezWnFadeIn 0.4s ease}\
    @keyframes ezWnFadeIn{from{opacity:0}to{opacity:1}}\
    @keyframes ezWnSlideUp{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}\
    @keyframes ezWnItemIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}\
    @keyframes ezWnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}\
    @keyframes ezWnShine{0%{background-position:-200% 0}100%{background-position:200% 0}}\
    @keyframes ezWnConfetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-60px) rotate(360deg);opacity:0}}\
    .ez-wn-card{background:#fff;border-radius:22px;width:380px;max-height:85vh;overflow:hidden;box-shadow:0 24px 80px rgba(99,102,241,0.2),0 8px 24px rgba(0,0,0,0.08);animation:ezWnSlideUp 0.5s cubic-bezier(0.16,1,0.3,1);border:2px solid rgba(129,140,248,0.12);position:relative}\
    .ez-wn-confetti{position:absolute;top:0;left:0;right:0;height:120px;pointer-events:none;overflow:hidden}\
    .ez-wn-dot{position:absolute;width:6px;height:6px;border-radius:50%;animation:ezWnConfetti 1.5s ease-out forwards}\
    .ez-wn-header{background:linear-gradient(145deg,#6366f1,#4f46e5);padding:28px 24px 22px;text-align:center;position:relative;overflow:hidden}\
    .ez-wn-header::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);background-size:200% 100%;animation:ezWnShine 3s ease infinite}\
    .ez-wn-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);padding:5px 14px;border-radius:20px;font-size:11px;font-weight:800;color:rgba(255,255,255,0.9);margin-bottom:10px;border:1px solid rgba(255,255,255,0.15);letter-spacing:0.5px}\
    .ez-wn-badge-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,0.5);animation:ezWnPulse 1.5s ease infinite}\
    .ez-wn-ver{font-size:36px;font-weight:900;color:#fff;font-family:Cairo,sans-serif;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,0.15)}\
    .ez-wn-ver-sub{font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);margin-top:4px;font-family:Cairo,sans-serif}\
    .ez-wn-body{padding:20px 22px;max-height:300px;overflow-y:auto}\
    .ez-wn-title{font-size:16px;font-weight:900;color:#1e1b4b;font-family:Cairo,sans-serif;margin-bottom:12px;display:flex;align-items:center;gap:6px}\
    .ez-wn-item{display:flex;align-items:flex-start;gap:10px;padding:8px 10px;margin-bottom:4px;border-radius:10px;transition:all 0.25s;opacity:0;animation:ezWnItemIn 0.4s ease forwards}\
    .ez-wn-item:hover{background:rgba(129,140,248,0.05)}\
    .ez-wn-icon{font-size:18px;flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(129,140,248,0.08);border-radius:8px}\
    .ez-wn-text{font-size:13px;font-weight:700;color:#3730a3;font-family:Cairo,sans-serif;line-height:1.5;direction:rtl;flex:1}\
    .ez-wn-footer{padding:14px 22px 18px;border-top:1px solid rgba(129,140,248,0.08)}\
    .ez-wn-btn{width:100%;height:48px;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#818cf8,#6366f1);box-shadow:0 6px 20px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -2px 0 rgba(0,0,0,0.1);transition:all 0.3s;position:relative;overflow:hidden}\
    .ez-wn-btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(99,102,241,0.3),inset 0 1px 0 rgba(255,255,255,0.2)}\
    .ez-wn-btn::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);transition:0.5s}\
    .ez-wn-btn:hover::after{left:100%}\
    .ez-wn-skip{display:block;text-align:center;margin-top:8px;font-size:11px;font-weight:700;color:#a5b4fc;cursor:pointer;font-family:Cairo,sans-serif;transition:color 0.2s;background:none;border:none;width:100%}\
    .ez-wn-skip:hover{color:#6366f1}\
    </style>\
    <div class="ez-wn-card">\
      <div class="ez-wn-confetti" id="ez-wn-confetti"></div>\
      <div class="ez-wn-header">\
        <div class="ez-wn-badge"><span class="ez-wn-badge-dot"></span> NEW UPDATE</div>\
        <div class="ez-wn-ver">v'+APP_VERSION+'</div>\
        <div class="ez-wn-ver-sub">'+APP_NAME+'</div>\
      </div>\
      <div class="ez-wn-body">\
        <div class="ez-wn-title">'+info.title+'</div>\
        '+featuresHtml+'\
      </div>\
      <div class="ez-wn-footer">\
        <button class="ez-wn-btn" id="ez-wn-ok">تمام، يلا نبدأ 🚀</button>\
        <button class="ez-wn-skip" id="ez-wn-skip">عدم الإظهار لهذا التحديث</button>\
      </div>\
    </div>';
    document.body.appendChild(overlay);

    /* Confetti dots */
    var confettiEl=document.getElementById('ez-wn-confetti');
    var colors=['#818cf8','#a78bfa','#f59e0b','#10b981','#f472b6','#22d3ee','#6366f1'];
    for(var c=0;c<20;c++){
      var dot=document.createElement('div');
      dot.className='ez-wn-dot';
      dot.style.cssText='left:'+Math.random()*100+'%;top:'+(60+Math.random()*40)+'%;background:'+colors[c%colors.length]+';animation-delay:'+Math.random()*0.8+'s;animation-duration:'+(1+Math.random()*0.8)+'s;width:'+(4+Math.random()*5)+'px;height:'+(4+Math.random()*5)+'px';
      confettiEl.appendChild(dot);
    }

    /* Close handlers */
    function closeWN(){
      localStorage.setItem('ez_pill_version',APP_VERSION);
      overlay.style.animation='ezWnFadeIn 0.3s ease reverse';
      setTimeout(function(){overlay.remove();},300);
    }
    document.getElementById('ez-wn-ok').addEventListener('click',closeWN);
    document.getElementById('ez-wn-skip').addEventListener('click',closeWN);
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeWN();});
  }catch(e){
    /* localStorage not available or error - skip silently */
    console.log('EZ WhatsNew:',e);
  }
}

/* ══════════════════════════════════════════
   SETTINGS PERSISTENCE (localStorage)
   ══════════════════════════════════════════ */
var EZ_SETTINGS_KEY='ez_pill_settings';
function loadSettings(){
  try{
    var s=localStorage.getItem(EZ_SETTINGS_KEY);
    return s?JSON.parse(s):{m:1,t:30,autoDuration:true,showWarnings:true,darkMode:false};
  }catch(e){return{m:1,t:30,autoDuration:true,showWarnings:true,darkMode:false};}
}
function saveSettings(obj){
  try{var cur=loadSettings();for(var k in obj)cur[k]=obj[k];localStorage.setItem(EZ_SETTINGS_KEY,JSON.stringify(cur));}catch(e){}
}
var savedSettings=loadSettings();

/* ══════════════════════════════════════════
   SOUND ALERTS (Web Audio API)
   ══════════════════════════════════════════ */
function ezBeep(type){
  try{
    var ctx=new(window.AudioContext||window.webkitAudioContext)();
    var osc=ctx.createOscillator();
    var gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    gain.gain.value=0.08;
    if(type==='success'){osc.frequency.value=880;osc.type='sine';gain.gain.value=0.06;}
    else if(type==='warning'){osc.frequency.value=440;osc.type='triangle';gain.gain.value=0.08;}
    else if(type==='error'){osc.frequency.value=280;osc.type='sawtooth';gain.gain.value=0.05;}
    else if(type==='info'){osc.frequency.value=660;osc.type='sine';gain.gain.value=0.05;}
    else{osc.frequency.value=550;osc.type='sine';}
    osc.start();
    if(type==='warning'){
      /* Double beep for warnings */
      gain.gain.setValueAtTime(0.08,ctx.currentTime);
      gain.gain.setValueAtTime(0,ctx.currentTime+0.12);
      gain.gain.setValueAtTime(0.08,ctx.currentTime+0.2);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.35);
      osc.stop(ctx.currentTime+0.4);
    } else if(type==='success'){
      /* Rising tone */
      osc.frequency.setValueAtTime(660,ctx.currentTime);
      osc.frequency.setValueAtTime(880,ctx.currentTime+0.1);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.25);
      osc.stop(ctx.currentTime+0.3);
    } else {
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      osc.stop(ctx.currentTime+0.25);
    }
  }catch(e){}
}
var fixedSizeCodes={
  '100015980':24,'100015955':24,'100015971':24,'102988654':48,
  '100013423':10,'100013562':20,'101826688':20,'101284170':30,
  '103243857':30,'101859640':20,'100726280':24,'100011436':20,
  '100030493':40,'100011743':30,'103169239':20,'100684294':30,
  '100009934':48,'100014565':6,'100017942':20,'100633972':20,
  '100634019':20,'100009926':24,'102371620':24,'100015947':24,
  '100010652':30,'103437918':30,'103683617':30,'100023592':30,
  '100023875':20,'100013431':15,'100027201':20,'100016106':10,
  '100010097':20,'100013167':20
};

var weeklyInjections=['102785890','101133232','101943745','101049031','101528656'];

var warningQueue=[];
var monthCounter=0;
var originalStartDate='';
var duplicatedRows=[];
var duplicatedCount=0;

/* ══════════════════════════════════════════
   LANGUAGE DETECTION
   ══════════════════════════════════════════ */
function detectLanguage(text){
  if(!text) return 'arabic';
  var arabicCount=(text.match(/[\u0600-\u06FF]/g)||[]).length;
  var englishCount=(text.match(/[a-zA-Z]/g)||[]).length;
  var medAbbrev=(text.match(/\b(mg|mcg|ml|kg|gr|gm|iu|bid|tid|qid|prn|tab|cap|pcs?)\b/gi)||[]).length;
  var adjustedEnglish=englishCount-(medAbbrev*3);
  if(arabicCount===0 && englishCount>2) return 'english';
  if(adjustedEnglish>arabicCount && adjustedEnglish>5) return 'english';
  return 'arabic';
}

function setPatientLanguage(language){
  var langSelect=document.querySelector('select[name*="language" i], select[id*="language" i], #flanguage, #fplanguage, #patientLanguage');
  if(!langSelect){
    var allSelects=document.querySelectorAll('select');
    for(var j=0;j<allSelects.length;j++){
      var prev=allSelects[j].previousElementSibling||allSelects[j].parentNode;
      var txt=(prev?prev.textContent:'').toLowerCase();
      if(txt.indexOf('language')>-1||txt.indexOf('لغة')>-1||txt.indexOf('lang')>-1){langSelect=allSelects[j];break;}
      var ops=allSelects[j].options;
      var hasAr=false,hasEn=false;
      for(var k=0;k<ops.length;k++){var ot=ops[k].text.toLowerCase();if(ot==='arabic'||ot==='عربي')hasAr=true;if(ot==='english'||ot==='انجليزي')hasEn=true;}
      if(hasAr&&hasEn){langSelect=allSelects[j];break;}
    }
  }
  if(langSelect){
    var targetValue=language==='english'?'English':'Arabic';
    var options=langSelect.options;
    for(var i=0;i<options.length;i++){
      if(options[i].text===targetValue||options[i].value===targetValue||
         options[i].text.toLowerCase()===targetValue.toLowerCase()){
        langSelect.selectedIndex=i;
        langSelect.dispatchEvent(new Event('input',{bubbles:true}));
        langSelect.dispatchEvent(new Event('change',{bubbles:true}));
        langSelect.dispatchEvent(new Event('blur',{bubbles:true}));
        if(typeof angular!=='undefined'){try{angular.element(langSelect).triggerHandler('change');}catch(e){}}
        if(typeof jQuery!=='undefined'){try{jQuery(langSelect).trigger('change');}catch(e){}}
        return true;
      }
    }
  }
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ══════════════════════════════════════════ */
window.ezShowToast=function(msg,type){
  var t=document.createElement('div');
  t.className='ez-toast ez-toast-'+type;
  t.innerHTML='<div class="ez-toast-icon">'+
    {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'}[type]+
    '</div><div class="ez-toast-msg">'+msg+'</div>';
  document.body.appendChild(t);
  setTimeout(function(){t.classList.add('show');},10);
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},300);},3000);
  /* Sound alert */
  if(type==='warning'||type==='error') ezBeep(type);
};

/* ══════════════════════════════════════════
   DIALOG CONTROL FUNCTIONS
   ══════════════════════════════════════════ */
window.ezCancel=function(){
  var d=document.getElementById('ez-dialog-box');
  if(d) d.remove();
};

window.ezClosePost=function(){
  var d=document.getElementById('ez-post-dialog');
  if(d) d.remove();
};

window.ezMinimizePost=function(){
  var d=document.getElementById('ez-post-dialog');
  if(d){
    var body=d.querySelector('.ez-post-body');
    var foot=d.querySelector('.ez-post-foot');
    var btn=d.querySelector('.ez-post-min-btn');
    if(body.style.display==='none'){
      body.style.display='block';
      if(foot) foot.style.display='block';
      btn.innerHTML='−';
    } else {
      body.style.display='none';
      if(foot) foot.style.display='none';
      btn.innerHTML='+';
    }
  }
};

window.ezCloseDoses=function(){
  var d=document.getElementById('ez-doses-dialog');
  if(d) d.remove();
};

window.ezToggleDark=function(){
  var isDark=document.body.classList.toggle('ez-dark-mode');
  saveSettings({darkMode:isDark});
  var btn=document.querySelector('.ez-header-actions .ez-btn-icon[onclick*="ezToggleDark"]');
  if(btn) btn.textContent=isDark?'☀️':'🌙';
  ezBeep('info');
};

window.ezMinimize=function(){
  var d=document.getElementById('ez-dialog-box');
  if(d){
    var content=d.querySelector('.ez-content');
    var foot=d.querySelector('.ez-footer');
    var minBtn=d.querySelector('.ez-btn-icon-min');
    if(content.style.display==='none'){
      content.style.display='block';
      if(foot) foot.style.display='block';
      minBtn.innerHTML='−';
    } else {
      content.style.display='none';
      if(foot) foot.style.display='none';
      minBtn.innerHTML='+';
    }
  }
};

window.ezSelect=function(el,type,val){
  var p=el.parentNode;
  var pills=p.querySelectorAll('.ez-pill');
  for(var i=0;i<pills.length;i++) pills[i].classList.remove('active');
  el.classList.add('active');
  var d=document.getElementById('ez-dialog-box');
  if(type==='m') d.setAttribute('data-m',val);
  else d.setAttribute('data-t',val);
};

/* ══════════════════════════════════════════
   DOSES VIEWER
   ══════════════════════════════════════════ */
window.ezShowDoses=function(){
  var existing=document.getElementById('ez-doses-dialog');
  if(existing){existing.remove();return;}
  var ts=document.querySelectorAll('table'),tb=null;
  for(var i=0;i<ts.length;i++){
    if(ts[i].querySelector('th')&&(ts[i].innerText.toLowerCase().includes('qty')||
       ts[i].innerText.toLowerCase().includes('quantity'))){tb=ts[i];break;}
  }
  if(!tb){window.ezShowToast('لم يتم العثور على الجدول','error');return;}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  function idxOf(n){
    for(var i=0;i<hs.length;i++){if(hs[i].textContent.toLowerCase().indexOf(n)>-1)return i;}return-1;
  }
  var ni=idxOf('note'),nmi=idxOf('name');
  if(nmi<0) nmi=idxOf('item');
  var cdi=idxOf('code');
  if(ni<0||nmi<0){window.ezShowToast('لم يتم العثور على الأعمدة','error');return;}
  function getVal(td){
    if(!td)return'';
    var inp=td.querySelector('input,textarea,select');
    if(inp){if(inp.tagName==='SELECT'){var o=inp.options[inp.selectedIndex];return o?o.textContent.trim():inp.value.trim();}return inp.value.trim();}
    return(td.innerText||td.textContent).trim();
  }
  function cleanN(txt){
    if(!txt)return'';
    var c=txt.toString().replace(/[،,.\-_\\]/g,' ');
    c=c.replace(/(.*?)أيام/,'').replace(/(.*?)days/i,'').replace(/^\s*-\s*/,'').trim();
    return c.replace(/\s+/g,' ').trim();
  }
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  var seenCodes={};var items=[];
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');
    if(tds.length>Math.max(ni,nmi)){
      var name=getVal(tds[nmi]);
      var note=cleanN(getVal(tds[ni]));
      var code=cdi>=0&&tds.length>cdi?getVal(tds[cdi]).replace(/\D/g,''):'';
      if(code&&seenCodes[code]){return;}
      if(code) seenCodes[code]=true;
      var isDup=false;
      if(note){var nl=note.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();isDup=!!shouldDuplicateRow(nl);}
      if(name&&note) items.push({name:name,note:note,isDup:isDup});
    }
  });
  if(items.length===0){window.ezShowToast('لا توجد بيانات جرعات','info');return;}
  var html='';
  html+='<div class="ez-doses-header"><div class="ez-logo-group"><div class="ez-doses-logo">📋</div><div class="ez-title-block"><div class="ez-doses-title">جدول الجرعات</div><div class="ez-sub-info"><span class="ez-items-count">📦 '+items.length+' صنف</span></div></div></div><button class="ez-btn-icon" onclick="window.ezCloseDoses()">×</button></div>';
  html+='<div class="ez-doses-body">';
  html+='<div class="ez-dose-header-row"><div class="ez-dose-num">#</div><div class="ez-dose-name">اسم الصنف</div><div class="ez-dose-note">الجرعة</div></div>';
  for(var i=0;i<items.length;i++){
    var dupClass=items[i].isDup?' ez-dose-item-dup':'';
    var dupIcon=items[i].isDup?' ⚡':'';
    html+='<div class="ez-dose-item'+dupClass+'"><div class="ez-dose-num">'+(i+1)+'</div><div class="ez-dose-name">'+items[i].name+'</div><div class="ez-dose-note">'+items[i].note+dupIcon+'</div></div>';
  }
  html+='</div>';
  html+='<div class="ez-doses-footer"><button class="ez-btn-close-doses" onclick="window.ezCloseDoses()">✕ إغلاق</button></div>';
  var dialog=document.createElement('div');
  dialog.id='ez-doses-dialog';
  dialog.className='ez-doses-dialog';
  dialog.innerHTML=html;
  document.body.appendChild(dialog);
  makeDraggable(dialog);
};

/* ══════════════════════════════════════════
   WARNING SYSTEM
   ══════════════════════════════════════════ */
window.showWarnings=function(warnings,callback){
  if(!warnings||warnings.length===0){callback();return;}
  var html='<div style="width:500px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(99,102,241,0.15),0 4px 16px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.12);font-family:Cairo,sans-serif;animation:dialogEnter 0.5s cubic-bezier(0.16,1,0.3,1)">';
  html+='<div style="position:relative;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b);background-size:200% 100%;animation:barShift 4s ease infinite"></div>';
  html+='<div style="padding:16px 22px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(129,140,248,0.08)">';
  html+='<div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 14px rgba(245,158,11,0.25),inset 0 1px 0 rgba(255,255,255,0.3)">⚠️</div>';
  html+='<div><div style="font-size:16px;font-weight:900;color:#1e1b4b">تحذيرات تحتاج مراجعة</div>';
  html+='<div style="font-size:11px;font-weight:700;color:#92400e;margin-top:1px">'+warnings.length+' تحذير · اختر لكل تحذير: تطبيق أو تجاهل</div></div></div>';
  html+='<div style="padding:14px 18px;max-height:420px;overflow-y:auto">';

  for(var i=0;i<warnings.length;i++){
    var w=warnings[i];
    var levelConfig={
      warning:{bg:'rgba(245,158,11,0.04)',bdr:'rgba(245,158,11,0.15)',icon:'⚠️',iconBg:'linear-gradient(145deg,#fbbf24,#f59e0b)',labelColor:'#92400e',labelBg:'rgba(245,158,11,0.08)',label:'تحذير'},
      danger:{bg:'rgba(239,68,68,0.04)',bdr:'rgba(239,68,68,0.15)',icon:'🚨',iconBg:'linear-gradient(145deg,#f87171,#ef4444)',labelColor:'#991b1b',labelBg:'rgba(239,68,68,0.08)',label:'هام'},
      info:{bg:'rgba(99,102,241,0.04)',bdr:'rgba(99,102,241,0.12)',icon:'ℹ️',iconBg:'linear-gradient(145deg,#818cf8,#6366f1)',labelColor:'#3730a3',labelBg:'rgba(99,102,241,0.08)',label:'معلومة'}
    };
    var lc=levelConfig[w.level]||levelConfig.info;

    var itemName='';var reason='';var detail='';var actionLabel='';
    var msgText=w.message.replace(/^[^\s]+\s*/,'');
    var itemMatch=msgText.match(/الصنف[:\s]*["""]?([^"""-]+)["""]?/);
    if(itemMatch) itemName=itemMatch[1].trim();

    if(w.type==='dose2'){
      reason='💊 جرعة مزدوجة (2) مكتوبة في الملاحظات';
      detail='الطبيب كتب جرعة 2 - يعني حبتين في الجرعة الواحدة. لو ضغطت تطبيق: الجرعة هتتغير لـ 2 والكمية هتتضاعف.';
      actionLabel='تغيير الجرعة لـ 2 وتضاعف الكمية';
    } else if(w.type==='days'){
      var dayMatch=w.message.match(/"(\d+)\s*يوم"/);
      var selectedMatch=w.message.match(/المحدد\s*(\d+)/);
      reason='📅 اختلاف في مدة العلاج';
      detail='المكتوب في الملاحظات '+(dayMatch?dayMatch[1]:'')+' يوم، لكن المحدد '+(selectedMatch?selectedMatch[1]:'')+' يوم. لو ضغطت تطبيق: هيتعدل حسب القيمة اللي تحددها.';
      actionLabel='تطبيق عدد الأيام';
    } else if(w.type==='smallsplit'){
      reason='📏 كمية صغيرة بعد التقسيم';
      detail='بعد تقسيم الصنف لجرعات متعددة كل جرعة هتكون كمية قليلة. للعلم فقط.';
      actionLabel='';
    } else if(w.type==='duplicate'){
      reason='🔁 صنف مكرر في نفس الطلب';
      detail=w.detail||'نفس الصنف موجود أكتر من مرة. ممكن يكون الدكتور كتبه مرتين بالغلط. راجع واحذف المكرر لو مش محتاجه.';
      actionLabel='';
    } else {
      reason='📌 يحتاج مراجعة';
      detail=msgText;
      actionLabel='تطبيق';
    }

    html+='<div id="warn-card-'+i+'" style="background:'+lc.bg+';border:1.5px solid '+lc.bdr+';border-radius:14px;padding:14px 16px;margin-bottom:10px;position:relative;transition:all 0.3s">';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    html+='<div style="width:30px;height:30px;border-radius:9px;background:'+lc.iconBg+';display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.1);flex-shrink:0">'+lc.icon+'</div>';
    if(itemName) html+='<div style="flex:1;font-size:13px;font-weight:800;color:#1e1b4b;direction:rtl">'+itemName+'</div>';
    html+='<span style="font-size:9px;font-weight:800;color:'+lc.labelColor+';background:'+lc.labelBg+';padding:3px 10px;border-radius:6px;letter-spacing:0.5px;flex-shrink:0">'+lc.label+'</span>';
    html+='</div>';
    html+='<div style="font-size:12.5px;font-weight:800;color:#312e81;margin-bottom:4px;direction:rtl">'+reason+'</div>';
    html+='<div style="font-size:11px;font-weight:700;color:#64748b;line-height:1.7;direction:rtl;padding:8px 10px;background:rgba(255,255,255,0.6);border-radius:8px;border:1px solid rgba(0,0,0,0.04);margin-bottom:8px">'+detail+'</div>';

    if(w.editable){
      html+='<div style="display:flex;align-items:center;gap:8px;direction:rtl;margin-bottom:8px">';
      html+='<label style="font-size:11px;font-weight:800;color:'+lc.labelColor+'">'+w.editLabel+':</label>';
      html+='<input type="number" id="edit-'+i+'" value="'+w.currentValue+'" min="'+w.minValue+'" max="'+w.maxValue+'" style="width:80px;padding:6px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:14px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" />';
      html+='<span style="font-size:11px;font-weight:700;color:#94a3b8">يوم</span></div>';
    }

    /* Per-warning action buttons */
    if(w.type!=='smallsplit'&&w.type!=='duplicate'){
      html+='<div style="display:flex;gap:6px;direction:rtl">';
      html+='<button onclick="window.applyWarning('+i+')" style="flex:1;height:34px;border:none;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 3px 10px rgba(16,185,129,0.2);transition:all 0.3s">✅ '+actionLabel+'</button>';
      html+='<button onclick="window.skipWarning('+i+')" style="height:34px;padding:0 14px;border:none;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#94a3b8;background:rgba(148,163,184,0.08);border:1px solid rgba(148,163,184,0.15);transition:all 0.3s">تجاهل</button>';
      html+='</div>';
    }
    html+='</div>';
  }
  html+='</div>';
  html+='<div style="padding:10px 18px 14px;border-top:1px solid rgba(129,140,248,0.06);display:flex;gap:8px">';
  html+='<button onclick="window.closeWarnings()" style="flex:1;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#818cf8,#6366f1);box-shadow:0 4px 14px rgba(99,102,241,0.2);transition:all 0.3s">✅ تم المراجعة - متابعة</button>';
  html+='</div></div>';

  var overlay=document.createElement('div');
  overlay.id='warning-overlay';
  overlay.innerHTML=html;
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,15,35,0.5);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);
  ezBeep('warning');
  window.warningCallback=callback;
};

window.applyWarning=function(idx){
  var w=warningQueue[idx];
  if(!w) return;
  var card=document.getElementById('warn-card-'+idx);

  if(w.type==='dose2'){
    /* Mark row for dose=2 override - continueProcessing will apply it */
    var rd=window._ezRows?window._ezRows[w.rowIndex]:null;
    if(rd){
      rd.forceDose2=true;
      window.ezShowToast('✅ سيتم تطبيق الجرعة المزدوجة عند المتابعة','info');
    }
  } else if(w.type==='days'&&w.onEdit){
    var editInput=document.getElementById('edit-'+idx);
    if(editInput){w.onEdit(parseInt(editInput.value));}
    window.ezShowToast('✅ تم تعديل عدد الأيام','success');
  }

  /* Mark card as applied */
  if(card){
    card.style.cssText='background:rgba(16,185,129,0.06)!important;border:1.5px solid rgba(16,185,129,0.25)!important;border-radius:14px;padding:14px 16px;margin-bottom:10px';
    var btns=card.querySelectorAll('button');
    for(var b=0;b<btns.length;b++) btns[b].remove();
    var badge=document.createElement('div');
    badge.style.cssText='text-align:center;font-size:13px;font-weight:800;color:#059669;padding:6px;background:rgba(16,185,129,0.06);border-radius:8px;margin-top:6px';
    badge.textContent='✅ سيتم التطبيق عند المتابعة';
    card.appendChild(badge);
  }
};

window.skipWarning=function(idx){
  var card=document.getElementById('warn-card-'+idx);
  if(card){
    card.style.cssText='background:rgba(148,163,184,0.03)!important;border:1.5px solid rgba(148,163,184,0.1)!important;border-radius:14px;padding:14px 16px;margin-bottom:10px;opacity:0.4';
    var btns=card.querySelectorAll('button');
    for(var b=0;b<btns.length;b++) btns[b].remove();
    var badge=document.createElement('div');
    badge.style.cssText='text-align:center;font-size:13px;font-weight:800;color:#94a3b8;padding:6px;background:rgba(148,163,184,0.06);border-radius:8px;margin-top:6px';
    badge.textContent='⏭️ تم التجاهل';
    card.appendChild(badge);
  }
};

window.closeWarnings=function(){
  var overlay=document.getElementById('warning-overlay');
  if(overlay) overlay.remove();
  if(window.warningCallback) window.warningCallback();
};

window.acceptWarnings=function(){
  var edits={};
  var inputs=document.querySelectorAll('[id^="edit-"]');
  for(var i=0;i<inputs.length;i++){
    var id=inputs[i].id.replace('edit-','');
    edits[id]=parseInt(inputs[i].value);
  }
  for(var key in edits){
    if(warningQueue[key]&&warningQueue[key].onEdit) warningQueue[key].onEdit(edits[key]);
  }
  var overlay=document.getElementById('warning-overlay');
  if(overlay) overlay.remove();
  if(window.warningCallback) window.warningCallback();
};

window.cancelWarnings=function(){
  var overlay=document.getElementById('warning-overlay');
  if(overlay) overlay.remove();
  if(window.warningCallback) window.warningCallback();
};

/* ══════════════════════════════════════════
   SUBMIT HANDLER
   ══════════════════════════════════════════ */
window.ezSubmit=function(){
  try{
    var d=document.getElementById('ez-dialog-box');
    if(!d) return;
    var m=parseInt(d.getAttribute('data-m'))||1;
    var t=parseInt(d.getAttribute('data-t'))||30;
    var autoDuration=document.getElementById('auto-duration')?document.getElementById('auto-duration').checked:true;
    var showWarningsFlag=document.getElementById('show-warnings')?document.getElementById('show-warnings').checked:true;
    var showPostDialog=document.getElementById('show-post-dialog')?document.getElementById('show-post-dialog').checked:false;
    /* Save settings for next time */
    saveSettings({m:m,t:t,autoDuration:autoDuration,showWarnings:showWarningsFlag});
    d.remove();
    var loader=document.createElement('div');
    loader.id='ez-loader';
    loader.innerHTML='<div class="ez-loader-spinner"></div><div class="ez-loader-text">جاري المعالجة...</div>';
    loader.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);padding:40px 60px;border-radius:20px;box-shadow:0 20px 60px rgba(99,102,241,0.15);z-index:99998;text-align:center;font-family:Cairo,sans-serif;border:2px solid rgba(129,140,248,0.12);';
    document.body.appendChild(loader);
    setTimeout(function(){
      if(loader) loader.remove();
      processTable(m,t,autoDuration,showWarningsFlag,showPostDialog);
    },800);
  } catch(e){
    alert("خطأ: "+e.message);
  }
};

/* ══════════════════════════════════════════
   UNDO DUPLICATES - FIXED: ignores non-⚡ rows
   ══════════════════════════════════════════ */
window.ezUndoDuplicates=function(){
  try{
    var ts=document.querySelectorAll('table'),tb=null;
    for(var i=0;i<ts.length;i++){
      if(ts[i].querySelector('th')&&(ts[i].innerText.toLowerCase().includes('qty')||
         ts[i].innerText.toLowerCase().includes('quantity'))){tb=ts[i];break;}
    }
    if(!tb) return;

    function fire(el){
      if(!el)return;
      el.focus();
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      el.dispatchEvent(new Event('blur',{bubbles:true}));
    }
    function normL(t){return(t||'').toString().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();}
    function get(td){
      var i=td.querySelector('input,textarea,select');
      if(i){
        if(i.tagName==='SELECT'){var o=i.options[i.selectedIndex];return o?o.textContent:i.value;}
        return i.value;
      }
      return td.innerText||td.textContent;
    }
    function set(td,v){
      var i=td.querySelector('input,textarea');
      if(i){i.value=v;fire(i);}
      else{var s=td.querySelector('select');if(s){s.value=String(v);fire(s);}else{td.textContent=v;}}
    }
    function idx(ths,n){
      for(var i=0;i<ths.length;i++){if(normL(ths[i].textContent).indexOf(normL(n))>-1)return i;}return-1;
    }

    var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
    var ci=idx(hs,'code'),si=idx(hs,'size'),ni=idx(hs,'note'),ei=idx(hs,'evry');
    if(ei<0) ei=idx(hs,'every');
    if(ci<0||si<0||ni<0||ei<0) return;

    var groups={},rows=Array.from(tb.querySelectorAll('tr')).slice(1);
    rows.forEach(function(r){
      var tds=r.querySelectorAll('td');
      var code=get(tds[ci]).trim();
      var noteText=get(tds[ni]).trim();
      var isSplitRow=noteText.indexOf('⚡')===0;
      if(code&&isSplitRow){
        if(!groups[code]) groups[code]=[];
        groups[code].push(r);
      }
    });

    var foundDuplicates=false;
    Object.keys(groups).forEach(function(code){
      var g=groups[code],n=g.length;
      if(n>1){
        foundDuplicates=true;
        var master=g[0],tds=master.querySelectorAll('td');
        var curS=parseInt(get(tds[si]))||0;
        var mult=n;
        var isQ6H=g[0].getAttribute('data-q6h')==='true';
        var ev=isQ6H?6:(n===2?12:8);
        set(tds[si],curS*mult);
        set(tds[ei],ev);
        var allN=g.map(function(row){return get(row.querySelectorAll('td')[ni]);});
        var fN=allN[0];
        fN=fN.replace(/^⚡\s*/,'');
        for(var k=1;k<allN.length;k++){
          var next=allN[k].replace(/^⚡\s*/,'');
          if((fN.includes('بعد')&&next.includes('بعد'))||(fN.toLowerCase().includes('after')&&next.toLowerCase().includes('after'))){
            fN+=' & '+next.replace(/بعد|after/gi,'').trim();
          } else if((fN.includes('قبل')&&next.includes('قبل'))||(fN.toLowerCase().includes('before')&&next.toLowerCase().includes('before'))){
            fN+=' & '+next.replace(/قبل|before/gi,'').trim();
          } else {
            fN+=' & '+next;
          }
        }
        set(tds[ni],fN);
        for(var j=1;j<n;j++){if(g[j].parentNode) g[j].parentNode.removeChild(g[j]);}
      }
    });
    if(foundDuplicates) window.ezShowToast('تم إلغاء التقسيم بنجاح','success');
    else window.ezShowToast('لا يوجد صفوف مقسمة','info');
  } catch(e){
    window.ezShowToast('خطأ في إلغاء التقسيم','error');
  }
};

/* ══════════════════════════════════════════
   NEXT MONTH HANDLER
   ══════════════════════════════════════════ */
window.ezNextMonth=function(){
  monthCounter++;
  var btn=document.getElementById('ez-next-month-btn');
  var sDateElem=document.querySelector('#fstartDate');
  if(!sDateElem) return;

  var ts=document.querySelectorAll('table'),tb=null;
  for(var i=0;i<ts.length;i++){
    if(ts[i].innerText.toLowerCase().includes('qty')||ts[i].innerText.toLowerCase().includes('quantity')){tb=ts[i];break;}
  }
  if(!tb) return;

  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var si=-1,edi=-1,qi=-1;
  for(var j=0;j<hs.length;j++){
    var txt=hs[j].textContent.toLowerCase();
    if(txt.includes('size')) si=j;
    if(txt.includes('end date')) edi=j;
    if(txt.includes('qty')) qi=j;
  }

  var rows=tb.querySelectorAll('tr');

  function fireEv(el){
    if(!el)return;
    el.focus();
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('blur',{bubbles:true}));
  }

  if(monthCounter===1||monthCounter===2){
    var newStart='';
    for(var i=1;i<rows.length;i++){
      var tds=rows[i].querySelectorAll('td');
      if(tds.length>edi){
        var ev='';
        var inp=tds[edi].querySelector('input');
        ev=inp?inp.value:tds[edi].textContent.trim();
        if(ev&&ev.match(/\d{4}-\d{2}-\d{2}/)){newStart=ev;break;}
      }
    }
    if(newStart){
      sDateElem.value=newStart;
      fireEv(sDateElem);
      rows.forEach(function(r,ix){
        if(ix===0)return;
        var sInput=r.querySelectorAll('td')[si]?r.querySelectorAll('td')[si].querySelector('input,textarea'):null;
        if(sInput) fireEv(sInput);
      });
      btn.innerHTML=(monthCounter===1)?'📅 الشهر الثالث':'🖨️ تجميع للطباعة';
      btn.style.background=(monthCounter===1)?'linear-gradient(135deg, #818cf8, #6366f1)':'linear-gradient(135deg, #10b981, #059669)';
      btn.style.color='#fff';
      btn.setAttribute('data-step',String(monthCounter+1));
    }
  } else if(monthCounter===3){
    if(originalStartDate){sDateElem.value=originalStartDate;fireEv(sDateElem);}
    rows.forEach(function(r,ix){
      if(ix===0)return;
      var tds=r.querySelectorAll('td');
      if(qi>=0&&tds.length>qi){
        var qInput=tds[qi].querySelector('input,textarea');
        if(qInput){qInput.value='3';fireEv(qInput);}
        else tds[qi].textContent='3';
      }
      if(tds.length>si){
        var sInput=tds[si].querySelector('input,textarea');
        if(sInput) fireEv(sInput);
      }
    });
    btn.innerHTML='✅ تم التجميع بنجاح';
    btn.style.background='linear-gradient(135deg, #10b981, #059669)';
    btn.style.color='#fff';
    btn.disabled=true;
  }
};

/* ══════════════════════════════════════════
   END DATE FIXING
   ══════════════════════════════════════════ */
window.fixEndDates=function(targetDate,ediIdx){
  var tb=document.querySelector('table');
  if(!tb) return;
  function fire(el){
    if(!el)return;el.focus();
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('blur',{bubbles:true}));
  }
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');
    if(tds.length>ediIdx){
      var inp=tds[ediIdx].querySelector('input');
      if(inp){inp.value=targetDate;fire(inp);}
    }
  });
  window.closeEndDateAlert();
  window.ezShowToast('تم توحيد التواريخ','success');
};

window.closeEndDateAlert=function(){
  var overlay=document.getElementById('end-date-overlay');
  if(overlay) overlay.remove();
};

/* ══════════════════════════════════════════
   CORE UTILITY FUNCTIONS
   ══════════════════════════════════════════ */
function fireEvent(el){
  try{if(!el)return;el.focus();
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true}));
  el.dispatchEvent(new Event('blur',{bubbles:true}));
  }catch(e){}
}

function cleanNote(txt){
  if(!txt) return '';
  var c=txt.toString().replace(/[،,.\-_\\]/g,' ');
  var a=/(.*?)أيام/;var e=/(.*?)days/i;
  if(a.test(c)) c=c.replace(a,'').replace(/^\s*-\s*/,'').trim();
  else if(e.test(c)) c=c.replace(e,'').replace(/^\s*-\s*/,'').trim();
  return c.replace(/\s+/g,' ').trim();
}

/* ══════════════════════════════════════════
   PILL COUNT EXTRACTION
   ══════════════════════════════════════════ */
function extractPillCount(itemName){
  var s=itemName.trim().toUpperCase().replace(/\s+/g,' ');
  var cleaned=s.replace(/(\d+(?:\.\d+)?)\s*(MG|ملجم|ملغ|مجم|MCG|µG|μG|GR|GM|GRAM|جرام|جم|ML|IU|KG|كجم)/g,'');
  cleaned=cleaned.replace(/\s+/g,' ').trim();
  var allMatches=[];
  var patterns=[
    {r:/(\d+)\s*(TAB|TABLET|TABLETS)/g,p:1,n:'tablet'},
    {r:/(\d+)\s*(قرص|اقراص|أقراص)/g,p:1,n:'قرص'},
    {r:/(\d+)\s*(حبة|حبه|حبوب)/g,p:1,n:'حبة'},
    {r:/(\d+)\s*(CAP|CAPS|CAPSULE|CAPSULES)/g,p:1,n:'capsule'},
    {r:/(\d+)\s*(كبسولة|كبسوله|كبسولات)/g,p:1,n:'كبسولة'},
    {r:/(\d+)\s*[PTC]/g,p:2,n:'letter'},
    {r:/(\d+)\s*(PCS|PC|PIECE|PIECES)/g,p:3,n:'pcs'},
    {r:/(\d+)\s*(علبة|علب)/g,p:3,n:'علبة'}
  ];
  for(var i=0;i<patterns.length;i++){
    var pat=patterns[i];pat.r.lastIndex=0;var m;
    while((m=pat.r.exec(cleaned))!==null){
      var num=parseInt(m[1]);
      if(num>0&&num<=500) allMatches.push({val:num,pri:pat.p,pos:m.index,name:pat.n});
    }
  }
  if(allMatches.length===0) return null;
  allMatches.sort(function(a,b){if(a.pri!==b.pri)return a.pri-b.pri;return b.pos-a.pos;});
  return allMatches[0].val;
}

function extractDayOfWeek(note){
  var s=note.trim();
  var days=[
    {ar:['الأحد','الاحد','احد','يوم الأحد','يوم الاحد'],en:['sunday','sun'],day:0},
    {ar:['الاثنين','الإثنين','اثنين','إثنين','يوم الاثنين'],en:['monday','mon'],day:1},
    {ar:['الثلاثاء','ثلاثاء','يوم الثلاثاء'],en:['tuesday','tue','tues'],day:2},
    {ar:['الأربعاء','الاربعاء','أربعاء','اربعاء','يوم الاربعاء'],en:['wednesday','wed'],day:3},
    {ar:['الخميس','خميس','يوم الخميس'],en:['thursday','thu','thur','thurs'],day:4},
    {ar:['الجمعة','الجمعه','جمعة','جمعه','يوم الجمعة'],en:['friday','fri'],day:5},
    {ar:['السبت','سبت','يوم السبت'],en:['saturday','sat'],day:6}
  ];
  var sl=s.toLowerCase();
  for(var i=0;i<days.length;i++){var d=days[i];for(var j=0;j<d.ar.length;j++){if(s.indexOf(d.ar[j])>-1)return d.day;}for(var j=0;j<d.en.length;j++){if(sl.indexOf(d.en[j])>-1)return d.day;}}
  return null;
}

function extractDuration(note){
  var s=note.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').trim();
  var result={hasDuration:false,days:null,isPRN:false,isUntilFinish:false,original:note};
  if(/عند الحاجه|عند اللزوم|prn|as\s*needed|when\s*needed|sos|عند الضرورة|if\s*needed|p\.r\.n/i.test(s)){result.isPRN=true;return result;}
  if(/حتى (نفاد|انتهاء|انهاء|الشفاء)|until\s*(finish|complete|symptom|gone|resolved)|till\s*finish/i.test(s)){result.isUntilFinish=true;return result;}
  var dayPatterns=[{r:/لمده?\s*(\d+)\s*(يوم|ايام)/i,g:1},{r:/مده?\s*(\d+)\s*(يوم|ايام)/i,g:1},{r:/(\d+)\s*(يوم|ايام)\s*فقط/i,g:1},{r:/(\d+)\s*(يوم|ايام)/i,g:1},{r:/(\d+)\s*days?/i,g:1},{r:/for\s*(\d+)\s*days?/i,g:1},{r:/x\s*(\d+)\s*days?/i,g:1},{r:/duration[:\s]*(\d+)\s*days?/i,g:1}];
  for(var i=0;i<dayPatterns.length;i++){var m=s.match(dayPatterns[i].r);if(m){result.hasDuration=true;result.days=parseInt(m[dayPatterns[i].g]);return result;}}
  var weekPatterns=[{r:/اسبوع واحد|واحد اسبوع|1\s*اسبوع|one\s*week|1\s*week/i,d:7},{r:/اسبوعين|2\s*اسبوع|two\s*weeks?|2\s*weeks?/i,d:14},{r:/ثلاث(ه)?\s*اسابيع|3\s*اسابيع|three\s*weeks?|3\s*weeks?/i,d:21},{r:/اربع(ه)?\s*اسابيع|4\s*اسابيع|four\s*weeks?|4\s*weeks?/i,d:28},{r:/شهر واحد|واحد شهر|1\s*شهر|one\s*month|1\s*month/i,d:30},{r:/شهرين|2\s*شهر|two\s*months?|2\s*months?/i,d:60},{r:/ثلاث(ه)?\s*اشهر|3\s*اشهر|three\s*months?|3\s*months?/i,d:90}];
  for(var i=0;i<weekPatterns.length;i++){if(weekPatterns[i].r.test(s)){result.hasDuration=true;result.days=weekPatterns[i].d;return result;}}
  return result;
}

function extractHourlyInterval(note){
  var s=note.toLowerCase().trim();
  var result={hasInterval:false,hours:null,timesPerDay:null};
  var patterns=[{r:/كل\s*(\d+)\s*ساع(ه|ات|ة|ه)/i,g:1},{r:/every\s*(\d+)\s*hours?/i,g:1},{r:/q\s*(\d+)\s*h/i,g:1},{r:/(\d+)\s*hourly/i,g:1},{r:/(\d+)\s*hrly/i,g:1}];
  for(var i=0;i<patterns.length;i++){var m=s.match(patterns[i].r);if(m){result.hasInterval=true;result.hours=parseInt(m[patterns[i].g]);result.timesPerDay=Math.floor(24/result.hours);return result;}}
  if(/q4h/i.test(s)){result.hasInterval=true;result.hours=4;result.timesPerDay=6;return result;}
  if(/q6h/i.test(s)){result.hasInterval=true;result.hours=6;result.timesPerDay=4;return result;}
  if(/q8h/i.test(s)){result.hasInterval=true;result.hours=8;result.timesPerDay=3;return result;}
  if(/q12h/i.test(s)){result.hasInterval=true;result.hours=12;result.timesPerDay=2;return result;}
  if(/q24h/i.test(s)){result.hasInterval=true;result.hours=24;result.timesPerDay=1;return result;}
  return result;
}

function moveColumnAfter(table,colToMove,colAfter){
  var rows=table.querySelectorAll('tr');
  for(var r=0;r<rows.length;r++){
    var cells=rows[r].querySelectorAll('th,td');
    if(cells.length<=Math.max(colToMove,colAfter)) continue;
    var cellToMove=cells[colToMove];var cellAfter2=cells[colAfter];
    if(cellToMove&&cellAfter2&&cellToMove.parentNode===cellAfter2.parentNode){cellAfter2.parentNode.insertBefore(cellToMove,cellAfter2.nextSibling);}
  }
}

function checkEndDateConsistency(){
  var tb=document.querySelector('table');if(!tb)return;
  var ths=tb.querySelectorAll('th');var ediIdx=-1;
  for(var i=0;i<ths.length;i++){if(ths[i].textContent.toLowerCase().includes('end')&&ths[i].textContent.toLowerCase().includes('date')){ediIdx=i;break;}}
  if(ediIdx<0)return;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);var dates={};var mostCommonDate='';var maxCount=0;
  rows.forEach(function(r){var tds=r.querySelectorAll('td');if(tds.length>ediIdx){var inp=tds[ediIdx].querySelector('input');var date=inp?inp.value:tds[ediIdx].textContent.trim();if(date&&/\d{4}-\d{2}-\d{2}/.test(date)){dates[date]=(dates[date]||0)+1;if(dates[date]>maxCount){maxCount=dates[date];mostCommonDate=date;}}}});
  if(Object.keys(dates).length>1) showEndDateAlert(mostCommonDate,ediIdx);
}

function showEndDateAlert(commonDate,ediIdx){
  var html='<div style="width:380px;border-radius:20px;background:#fff;box-shadow:0 16px 48px rgba(99,102,241,0.12);border:2px solid rgba(129,140,248,0.15);overflow:hidden;position:relative"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa,#818cf8);background-size:200% 100%;animation:barShift 4s ease infinite"></div>';
  html+='<div style="padding:14px 20px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.1)"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(145deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,0.25)">📅</div><div style="font-size:15px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif">تواريخ انتهاء مختلفة</div></div><button onclick="window.closeEndDateAlert()" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.05);color:#818cf8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif">×</button></div>';
  html+='<div style="padding:16px 20px;text-align:center"><div style="font-size:13px;color:#3730a3;font-weight:600;line-height:1.6;margin-bottom:12px;font-family:Cairo,sans-serif">تم اكتشاف صفوف بتواريخ انتهاء مختلفة<br>هل تريد توحيد جميع التواريخ؟</div>';
  html+='<div style="display:flex;align-items:center;justify-content:center;margin:10px 0 16px"><div style="padding:8px 18px;background:rgba(129,140,248,0.06);border:1.5px solid rgba(129,140,248,0.15);border-radius:10px"><div style="font-size:16px;font-weight:900;color:#1e1b4b;font-family:Cairo,sans-serif">'+commonDate+'</div><div style="font-size:9px;font-weight:700;color:#818cf8;letter-spacing:1px">التاريخ الأكثر شيوعاً</div></div></div>';
  html+='<div style="display:flex;gap:8px"><button onclick="window.fixEndDates(\''+commonDate+'\','+ediIdx+')" style="flex:1;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#818cf8,#6366f1);box-shadow:0 4px 16px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.1)">✅ توحيد التواريخ</button>';
  html+='<button onclick="window.closeEndDateAlert()" style="flex:1;height:42px;border:1.5px solid rgba(129,140,248,0.15);border-radius:12px;background:linear-gradient(145deg,#fff,#f8fafc);color:#6366f1;cursor:pointer;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,0.8)">❌ إلغاء</button></div></div></div>';
  var overlay=document.createElement('div');overlay.id='end-date-overlay';overlay.innerHTML=html;
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(30,27,75,0.5);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);
}

/* ══════════════════════════════════════════
   POST PROCESS DIALOG
   ══════════════════════════════════════════ */
function showPostProcessDialog(){
  var sdInput=document.querySelector('#fstartDate');
  if(sdInput) originalStartDate=sdInput.value;
  monthCounter=0;
  var dupInfo=duplicatedCount>0?'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 14px;margin-bottom:10px;background:rgba(129,140,248,0.06);border:1px solid rgba(129,140,248,0.12);border-radius:10px"><span style="font-size:18px">⚡</span><span style="font-size:13px;font-weight:800;color:#4338ca;font-family:Cairo,sans-serif">'+duplicatedCount+' صنف مقسم</span></div>':'';
  var dialog=document.createElement('div');
  dialog.id='ez-post-dialog';
  dialog.style.cssText='position:fixed;top:80px;right:20px;z-index:99998;width:280px;border-radius:20px;background:#fff;box-shadow:0 16px 48px rgba(99,102,241,0.12),0 4px 16px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.15);overflow:hidden;';
  dialog.innerHTML='<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa,#818cf8);background-size:200% 100%;animation:barShift 4s ease infinite"></div><div class="ez-post-header" style="padding:14px 18px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.1);cursor:move;background:linear-gradient(180deg,rgba(129,140,248,0.03) 0%,transparent 100%)"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(145deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,0.25)">⚙️</div><div style="font-size:15px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif">خيارات إضافية</div></div><div style="display:flex;gap:4px"><button class="ez-post-min-btn" onclick="window.ezMinimizePost()" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.05);color:#818cf8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;transition:all 0.25s">−</button><button onclick="window.ezClosePost()" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.05);color:#818cf8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.25s">×</button></div></div><div class="ez-post-body" style="padding:14px 18px 16px;font-family:Cairo,sans-serif">'+dupInfo+'<button id="ez-undo-btn" onclick="window.ezUndoDuplicates()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#fbbf24,#f59e0b);box-shadow:0 4px 14px rgba(245,158,11,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.1);transition:all 0.3s;margin:4px 0" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'">🔄 إلغاء التقسيم</button><button id="ez-next-month-btn" onclick="window.ezNextMonth()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#22d3ee,#06b6d4);box-shadow:0 4px 14px rgba(6,182,212,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.1);transition:all 0.3s;margin:4px 0" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'">🗓️ الشهر التالي (2)</button></div><div class="ez-post-foot" style="padding:6px 18px;text-align:center;font-size:9px;color:#c7d2fe;font-weight:700;letter-spacing:1.5px;border-top:1px solid rgba(129,140,248,0.08);background:rgba(241,245,249,0.4)">EZ_PILL FARMADOSIS · V'+APP_VERSION+'</div>';
  document.body.appendChild(dialog);
  makeDraggable(dialog);
}

/* ══════════════════════════════════════════
   DRAGGABLE FUNCTIONALITY
   ══════════════════════════════════════════ */
function makeDraggable(el){
  var pos1=0,pos2=0,pos3=0,pos4=0;
  var header=el.querySelector('.ez-post-header')||el.querySelector('.ez-doses-header')||el.querySelector('.ez-header')||el;
  header.style.cursor='move';
  header.onmousedown=dragMouseDown;
  function dragMouseDown(e){e=e||window.event;e.preventDefault();pos3=e.clientX;pos4=e.clientY;document.onmouseup=closeDragElement;document.onmousemove=elementDrag;}
  function elementDrag(e){e=e||window.event;e.preventDefault();pos1=pos3-e.clientX;pos2=pos4-e.clientY;pos3=e.clientX;pos4=e.clientY;el.style.top=(el.offsetTop-pos2)+'px';el.style.left=(el.offsetLeft-pos1)+'px';el.style.right='auto';el.style.transform='none';}
  function closeDragElement(){document.onmouseup=null;document.onmousemove=null;}
}

/* ══════════════════════════════════════════
   DOSE RECOGNIZER
   ══════════════════════════════════════════ */
function smartDoseRecognizer(note){
  var raw=note;
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
  var res={count:1,hasB:false,hasL:false,hasD:false,isBefore:false,hasM:false,hasN:false,hasA:false,hasE:false,hasBed:false,hasEmpty:false,language:'arabic',confidence:'high',rawFrequency:null};
  res.language=detectLanguage(raw);
  res.hasB=/\b(bre|breakfast|fatur|ftor)\b|فطر|فطار|فطور|افطار|إفطار|الافطار|الفطور|الفطار/i.test(s);
  res.hasL=/\b(lun|lunch|lau)\b|غدا|غداء|الغدا|الغداء/i.test(s);
  res.hasD=/\b(din|dinner|sup|supper|asha|isha)\b|عشا|عشو|تعشى|عشاء|العشاء|العشا/i.test(s);
  res.hasM=/\b(morning|am|morn|a\.m)\b|صباح|الصباح|صبح/i.test(s);
  res.hasN=/\b(noon|midday|ظهر|الظهر)\b/i.test(s);
  res.hasA=/\b(asr|afternoon|pm|p\.m|عصر|العصر)\b/i.test(s);
  res.hasE=/\b(evening|eve|مساء|مسا|المساء|المسا|ليل|الليل)\b/i.test(s);
  res.hasBed=/\b(bed|bedtime|sleep|sle|hs|h\.s|نوم|النوم|قبل النوم|عند النوم|before\s*bed|before\s*sleep|at\s*bed)\b/i.test(s);
  res.hasEmpty=/\b(empty|fasting|ريق|الريق|على الريق|معدهـ فارغهـ|empty\s*stomach)\b/i.test(s);
  res.isBefore=/\b(before|bef|pre|ac|a\.c|قبل|قبل الاكل|قبل الأكل|before\s*meal|before\s*food)\b/i.test(s);
  if(/\bqid\b|q\.i\.d|اربع مرات|4\s*مرات|four\s*times?\s*(a\s*day|daily|يوميا)?|4\s*times?\s*(a\s*day|daily)?/i.test(s)){res.count=4;res.rawFrequency='QID';return res;}
  if(/\btid\b|t\.i\.d|ثلاث مرات|3\s*مرات|three\s*times?\s*(a\s*day|daily|يوميا)?|3\s*times?\s*(a\s*day|daily)?|thrice\s*(daily)?/i.test(s)){res.count=3;res.rawFrequency='TID';return res;}
  if(/\bbid\b|b\.i\.d|مرتين|مرتان|مره مرتين|twice\s*(a\s*day|daily)?|2\s*times?\s*(a\s*day|daily|يوميا)?/i.test(s)){res.count=2;res.rawFrequency='BID';return res;}
  if(/\bod\b|o\.d|\bqd\b|q\.d|once\s*(a\s*day|daily)?|مره واحده يوميا|مرهـ واحدهـ/i.test(s)){res.count=1;res.rawFrequency='OD';return res;}
  if(/كل\s*6|every\s*6\s*h|q6h|q\s*6\s*h/i.test(s)){res.count=4;res.rawFrequency='Q6H';return res;}
  if(/كل\s*8|every\s*8\s*h|q8h|q\s*8\s*h/i.test(s)){res.count=3;res.rawFrequency='Q8H';return res;}
  if(/كل\s*12|every\s*12\s*h|q12h|q\s*12\s*h/i.test(s)){res.count=2;res.rawFrequency='Q12H';return res;}
  if(/كل\s*24|every\s*24\s*h|q24h|q\s*24\s*h/i.test(s)){res.count=1;res.rawFrequency='Q24H';return res;}
  if(/كل\s*4\s*ساع|every\s*4\s*h|q4h|q\s*4\s*h/i.test(s)){res.count=6;res.rawFrequency='Q4H';return res;}
  var mealCount=0;
  if(res.hasB||res.hasM) mealCount++;
  if(res.hasL||res.hasN) mealCount++;
  if(res.hasD||res.hasE) mealCount++;
  if(res.hasA&&mealCount<3) mealCount++;
  if(/قبل\s*(الوجبات|الاكل|الأكل)\s*(الثلاث|3)?|before\s*(all\s*)?meals|ac\s*meals/i.test(s)){res.count=3;res.isBefore=true;return res;}
  if(/بعد\s*(الوجبات|الاكل|الأكل)\s*(الثلاث|3)?|after\s*(all\s*)?meals|pc\s*meals/i.test(s)){res.count=3;return res;}
  if(/قبل\s*(الاكل|الأكل|الوجبات)\s*مرتين|before\s*meals?\s*twice/i.test(s)){res.count=2;res.isBefore=true;return res;}
  if(mealCount>=3){res.count=3;return res;}
  var pairDual=/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i;
  if(mealCount===2||pairDual.test(s)){res.count=2;return res;}
  if(res.hasBed&&mealCount===0){res.count=1;return res;}
  if(res.hasEmpty&&mealCount===0){res.count=1;return res;}
  return res;
}

function getTwoPillsPerDoseInfo(n){
  var s=(n||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();
  if(/نص حبه|نص قرص|نصف حبه|نصف قرص|half\s*(a\s*)?(tab|tablet|pill|cap|capsule)|0\.5\s*(tab|tablet|pill)/i.test(n))return{dose:0.5,multiplier:0.5};
  if(/ربع حبه|ربع قرص|quarter\s*(a\s*)?(tab|tablet|pill)|0\.25\s*(tab|tablet|pill)/i.test(n))return{dose:0.25,multiplier:0.25};
  var twoP=['2 حبه','2 حبة','حبتين','حبتان','2 حبوب','2 قرص','قرصين','قرصان','2 كبسولة','كبسولتين','كبسولتان','2 pill','2 pills','two pill','two pills','2 tablet','2 tablets','two tablet','two tablets','2 tab','2 tabs','two tab','two tabs','2 cap','2 caps','two cap','two caps'];
  for(var i=0;i<twoP.length;i++){if(s.includes(twoP[i].toLowerCase())){var is2=/مرتين|twice|2\s*times|bid|b\.i\.d/i.test(n);var is3=/ثلاث مرات|3\s*مرات|three\s*times|3\s*times|tid|t\.i\.d/i.test(n);var ml=1;if(is3)ml=6;else if(is2)ml=4;else ml=2;return{dose:2,multiplier:ml};}}
  var threeP=['3 حبه','3 حبات','3 حبوب','3 قرص','3 اقراص','3 كبسول','3 tab','3 tabs','3 pill','3 pills','three tab','three pill'];
  for(var i=0;i<threeP.length;i++){if(s.includes(threeP[i].toLowerCase()))return{dose:3,multiplier:3};}
  return{dose:1,multiplier:1};
}

function getTimeFromWords(w){
  var s=(w||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();
  var st=s.match(/(?:at|الساعهـ|الساعه)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|صباحا|مساء)?/i);
  if(st){var hr=parseInt(st[1]);var min=st[2]?parseInt(st[2]):0;var ap=st[3]||'';if(/pm|مساء/i.test(ap)&&hr<12)hr+=12;if(/am|صباحا/i.test(ap)&&hr===12)hr=0;return{time:('0'+hr).slice(-2)+':'+('0'+min).slice(-2)};}
  var rules=[{test:/empty|stomach|ريق|الريق|على الريق|fasting/,time:'07:00'},{test:/قبل\s*(الاكل|الأكل|meal)|before\s*(meal|food)/,time:'08:00'},{test:/before.*bre|before.*fatur|before.*breakfast|قبل.*فطر|قبل.*فطار|قبل.*فطور|قبل.*افطار/,time:'08:00'},{test:/after.*bre|after.*fatur|after.*breakfast|بعد.*فطر|بعد.*فطار|بعد.*فطور|بعد.*افطار/,time:'09:00'},{test:/\b(morning|am|a\.m)\b|صباح|الصباح|صبح/,time:'09:30'},{test:/\b(noon|midday)\b|ظهر|الظهر/,time:'12:00'},{test:/before.*lun|before.*lunch|قبل.*غدا|قبل.*غداء/,time:'13:00'},{test:/after.*lun|after.*lunch|بعد.*غدا|بعد.*غداء/,time:'14:00'},{test:/\b(asr|afternoon|pm|p\.m)\b|عصر|العصر/,time:'15:00'},{test:/maghrib|مغرب|المغرب/,time:'18:00'},{test:/before.*din|before.*sup|before.*dinner|before.*asha|قبل.*عشا|قبل.*عشو|قبل.*عشاء/,time:'20:00'},{test:/after.*din|after.*sup|after.*dinner|after.*asha|بعد.*عشا|بعد.*عشو|بعد.*عشاء/,time:'21:00'},{test:/مساء|مسا|evening|eve/,time:'21:30'},{test:/bed|sleep|sle|نوم|النوم|hs|h\.s/,time:'22:00'}];
  for(var i=0;i<rules.length;i++){if(rules[i].test.test(s))return{time:rules[i].time};}
  return{time:'09:00'};
}

function shouldDuplicateRow(note){
  var d=smartDoseRecognizer(note);
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();
  var isEvery8=/كل\s*8|every\s*8|q8h/i.test(s);
  if(isEvery8||d.count===3)return{type:'three',doseInfo:d,isBefore:d.isBefore};
  var isMN=(d.hasM||d.hasB)&&(d.hasN||d.hasL);var isNE=(d.hasN||d.hasL)&&(d.hasE||d.hasD);var isMA=(d.hasM||d.hasB)&&d.hasA;var isAE=d.hasA&&(d.hasE||d.hasD);
  if(isMN||isNE||isMA||isAE)return{type:'two',doseInfo:d,isBefore:d.isBefore};
  var isRegularTwice=((d.hasB||d.hasM)&&(d.hasD||d.hasE))||/12|twice|bid|b\s*i\s*d|مرتين/.test(s)||/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(s)||/قبل\s*(الاكل|الأكل)\s*مرتين/.test(s);
  if(d.count===2&&!isRegularTwice)return{type:'two',doseInfo:d,isBefore:d.isBefore};
  var isEvery6=/كل\s*6|every\s*6|q6h|q\s*6\s*h/i.test(s);
  if(isEvery6)return{type:'q6h',doseInfo:d,isBefore:d.isBefore};
  return null;
}

function scanForDuplicateNotes(){
  var ts=document.querySelectorAll('table'),tb=null;
  for(var i=0;i<ts.length;i++){if(ts[i].querySelector('th')&&(ts[i].innerText.toLowerCase().includes('qty')||ts[i].innerText.toLowerCase().includes('quantity'))){tb=ts[i];break;}}
  if(!tb)return false;
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');var ni=-1;
  for(var i=0;i<hs.length;i++){if((hs[i].textContent||'').toLowerCase().replace(/\s+/g,'').indexOf('note')>-1){ni=i;break;}}
  if(ni<0)return false;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  for(var i=0;i<rows.length;i++){var tds=rows[i].querySelectorAll('td');if(tds.length>ni){var inp=tds[ni].querySelector('input,textarea');var noteText=inp?inp.value:tds[ni].textContent;var cleaned=cleanNote(noteText);var nl=cleaned.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();if(nl&&shouldDuplicateRow(nl))return true;}}
  return false;
}

/* ══════════════════════════════════════════
   ★ MAIN PROCESSING ENGINE ★
   ══════════════════════════════════════════ */
function processTable(m,t,autoDuration,enableWarnings,showPostDialog){
  warningQueue=[];duplicatedRows=[];duplicatedCount=0;var detectedLanguagesPerRow=[];window._ezDose2Applied=null;
  function fire(el){try{if(!el)return;el.focus();el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));}catch(e){}}
  function norm(txt){return(txt||'').toString().trim().replace(/\s+/g,' ');}
  function normL(txt){return norm(txt).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ى/g,'ي').trim();}
  function get(td){if(!td)return'';var i=td.querySelector('input,textarea,select');if(i){if(i.tagName==='SELECT'){var o=i.options[i.selectedIndex];return norm(o?o.textContent:i.value);}return norm(i.value);}return norm(td.innerText||td.textContent);}
  function getCleanCode(td){var text=get(td);var match=text.match(/\d+/);return match?match[0]:'';}
  function setSize(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setEvry(td,v){if(!td)return;var s=td.querySelector('select');if(s){s.value=String(v);fire(s);}else{td.textContent=String(v);}}
  function setDose(td,v){if(!td)return;var s=td.querySelector('select');if(s){s.value=String(v);fire(s);return;}var i=td.querySelector('input,textarea');if(i){i.value=String(v);fire(i);return;}td.textContent=String(v);}
  function setTime(r,tm){if(!r||!tm)return;var i=r.querySelector("input[type='time']");if(i){i.value=tm;fire(i);}}
  function setNote(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setStartDate(r,dateStr){if(!r||!dateStr)return;var sdInput=r.querySelector('input[type="date"]');if(!sdInput){var inputs=r.querySelectorAll('input');for(var i=0;i<inputs.length;i++){if(inputs[i].value&&/\d{4}-\d{2}-\d{2}/.test(inputs[i].value)){sdInput=inputs[i];break;}}}if(sdInput){sdInput.value=dateStr;fire(sdInput);}}
  function idx(ths,n){n=normL(n);for(var i=0;i<ths.length;i++){var txt=normL(ths[i].textContent);if(txt===n||txt.indexOf(n)>-1)return i;}return-1;}
  function setTopStartDate(){var d=new Date();d.setDate(d.getDate()+1);var y=d.getFullYear(),ms=('0'+(d.getMonth()+1)).slice(-2),da=('0'+d.getDate()).slice(-2);var ts2=y+'-'+ms+'-'+da;var s=document.querySelector('#fstartDate');if(s){s.value=ts2;fire(s);return true;}return false;}
  function getNextDayOfWeek(baseDate,targetDay){var base=new Date(baseDate);var currentDay=base.getDay();var daysUntilTarget=(targetDay-currentDay+7)%7;if(daysUntilTarget===0)daysUntilTarget=7;var result=new Date(base);result.setDate(base.getDate()+daysUntilTarget);var y=result.getFullYear();var mm=('0'+(result.getMonth()+1)).slice(-2);var dd=('0'+result.getDate()).slice(-2);return y+'-'+mm+'-'+dd;}

  function createDuplicateRows(t_val,r,ni,bs,niIdx,si,ei,di,ti,sdi,edi,m_val,tc,ci,qi){
    var tds=r.querySelectorAll('td');var u_code=getCleanCode(tds[ci]);var ns=bs;
    if(fixedSizeCodes[u_code]&&ni.type!=='q6h'){var div=(ni.type==='three')?3:2;ns=Math.floor(fixedSizeCodes[u_code]/div);var remainder=fixedSizeCodes[u_code]%div;if(remainder>0){var splits=[];for(var x=0;x<div;x++){if(x<remainder)splits.push(Math.ceil(fixedSizeCodes[u_code]/div));else splits.push(Math.floor(fixedSizeCodes[u_code]/div));}ni.customSplits=splits;}}
    var on=get(r.querySelectorAll('td')[niIdx]);var isEn=/[a-z]/i.test(on)||ni.doseInfo.language==='english';
    var p=ni.isBefore?(isEn?'Before ':'قبل '):(isEn?'After ':'بعد ');
    var bf=isEn?'Breakfast':'الفطار';var ln=isEn?'Lunch':'الغداء';var dn=isEn?'Dinner':'العشاء';
    var m_lbl=isEn?'Morning':'صباحا';var n_lbl=isEn?'Noon':'ظهرا';var a_lbl=isEn?'Afternoon':'عصرا';var e_lbl=isEn?'Evening':'مساءا';
    var calcQ=1;if(qi>=0){var cur=parseInt(get(tds[qi]))||1;calcQ=cur;}
    var dupRows=[];var meals=[];
    if(ni.type==='two'){
      var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');
      var sz1=ni.customSplits?ni.customSplits[0]:ns;var sz2=ni.customSplits?ni.customSplits[1]:ns;
      setSize(nt1[si],sz1);setSize(nt2[si],sz2);setEvry(nt1[ei],'24');setEvry(nt2[ei],'24');
      if(di>=0){var tpi=getTwoPillsPerDoseInfo(get(r.querySelectorAll('td')[niIdx]));setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);}
      if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);}
      var n1='',t1='',n2='',t2='';
      if(ni.doseInfo.hasM&&ni.doseInfo.hasN){n1=m_lbl;t1='09:30';n2=n_lbl;t2='12:00';meals=['الصباح','الظهر'];}
      else if(ni.doseInfo.hasN&&ni.doseInfo.hasE){n1=n_lbl;t1='12:00';n2=e_lbl;t2='21:30';meals=['الظهر','المساء'];}
      else if(ni.doseInfo.hasM&&ni.doseInfo.hasA){n1=m_lbl;t1='09:30';n2=a_lbl;t2='15:00';meals=['الصباح','العصر'];}
      else if(ni.doseInfo.hasA&&ni.doseInfo.hasE){n1=a_lbl;t1='15:00';n2=e_lbl;t2='21:30';meals=['العصر','المساء'];}
      else if(ni.doseInfo.hasB&&ni.doseInfo.hasL){if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+ln;t2='13:00';}else{n1=p+bf;t1='09:00';n2=p+ln;t2='14:00';}meals=isEn?['Breakfast','Lunch']:['الفطار','الغداء'];}
      else if(ni.doseInfo.hasL&&ni.doseInfo.hasD){if(ni.isBefore){n1=p+ln;t1='13:00';n2=p+dn;t2='20:00';}else{n1=p+ln;t1='14:00';n2=p+dn;t2='21:00';}meals=isEn?['Lunch','Dinner']:['الغداء','العشاء'];}
      else{if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+dn;t2='20:00';}else{n1=p+bf;t1='09:00';n2=p+dn;t2='21:00';}meals=isEn?['Breakfast','Dinner']:['الفطار','العشاء'];}
      setNote(nt1[niIdx],'⚡ '+n1);setNote(nt2[niIdx],'⚡ '+n2);setTime(nr1,t1);setTime(nr2,t2);
      r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);dupRows=[nr1,nr2];
    } else if(ni.type==='three'){
      var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);var nr3=r.cloneNode(true);
      var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');var nt3=nr3.querySelectorAll('td');
      var sz1=ni.customSplits?ni.customSplits[0]:ns;var sz2=ni.customSplits?ni.customSplits[1]:ns;var sz3=ni.customSplits?ni.customSplits[2]:ns;
      setSize(nt1[si],sz1);setSize(nt2[si],sz2);setSize(nt3[si],sz3);setEvry(nt1[ei],'24');setEvry(nt2[ei],'24');setEvry(nt3[ei],'24');
      if(di>=0){var tpi=getTwoPillsPerDoseInfo(get(r.querySelectorAll('td')[niIdx]));setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);setDose(nt3[di],tpi.dose);}
      if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);setSize(nt3[qi],calcQ);}
      var n1='',t1='',n2='',t2='',n3='',t3='';
      if(ni.doseInfo.hasM&&ni.doseInfo.hasA&&ni.doseInfo.hasE){n1=m_lbl;t1='09:30';n2=a_lbl;t2='15:00';n3=e_lbl;t3='21:30';meals=isEn?['Morning','Afternoon','Evening']:['الصباح','العصر','المساء'];}
      else{if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+ln;t2='13:00';n3=p+dn;t3='20:00';}else{n1=p+bf;t1='09:00';n2=p+ln;t2='14:00';n3=p+dn;t3='21:00';}meals=isEn?['Breakfast','Lunch','Dinner']:['الفطار','الغداء','العشاء'];}
      setNote(nt1[niIdx],'⚡ '+n1);setNote(nt2[niIdx],'⚡ '+n2);setNote(nt3[niIdx],'⚡ '+n3);setTime(nr1,t1);setTime(nr2,t2);setTime(nr3,t3);
      r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);r.parentNode.insertBefore(nr3,r);dupRows=[nr1,nr2,nr3];
    } else if(ni.type==='q6h'){
      var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);
      var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');
      var q6hSize=bs*2;
      setSize(nt1[si],q6hSize);setSize(nt2[si],q6hSize);
      setEvry(nt1[ei],'12');setEvry(nt2[ei],'12');
      if(di>=0){var tpi=getTwoPillsPerDoseInfo(get(r.querySelectorAll('td')[niIdx]));setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);}
      if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);}
      var andW=isEn?' & ':' و';var bedLbl=isEn?'Before Bed':'قبل النوم';
      var n1='',t1='',n2='',t2='';
      if(ni.isBefore){n1=p+bf+andW+dn;t1='08:00';n2=p+ln+andW+bedLbl;t2='13:00';}
      else{n1=p+bf+andW+dn;t1='09:00';n2=p+ln+andW+bedLbl;t2='14:00';}
      setNote(nt1[niIdx],'⚡ '+n1);setNote(nt2[niIdx],'⚡ '+n2);setTime(nr1,t1);setTime(nr2,t2);
      nr1.setAttribute('data-q6h','true');nr2.setAttribute('data-q6h','true');
      r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);dupRows=[nr1,nr2];
      meals=isEn?['Breakfast&Dinner','Lunch&Bed']:['الفطار والعشاء','الغداء والنوم'];
    }
    duplicatedRows.push({originalRow:r,duplicates:dupRows,type:ni.type,meals:meals});duplicatedCount++;
    if(r.parentNode)r.parentNode.removeChild(r);
  }

  function sortRowsByTime(t_elem,ti_idx,ei_idx){
    if(ti_idx<0)return;var rs=Array.from(t_elem.querySelectorAll('tr'));var he=rs.shift();var rwt=[];var rwot=[];
    rs.forEach(function(r){var tds=r.querySelectorAll('td');if(tds.length<=ti_idx){rwot.push(r);return;}var tv=get(tds[ti_idx]);if(!tv||tv.trim()===''){rwot.push(r);return;}rwt.push({row:r,time:tv});});
    rwt.sort(function(a,b){var ta=a.time.split(':').map(Number);var tb2=b.time.split(':').map(Number);var diff=(ta[0]*60+ta[1])-(tb2[0]*60+tb2[1]);if(diff===0&&ei_idx>=0){var evA=parseInt(get(a.row.querySelectorAll('td')[ei_idx]))||0;var evB=parseInt(get(b.row.querySelectorAll('td')[ei_idx]))||0;return evB-evA;}return diff;});
    t_elem.innerHTML='';t_elem.appendChild(he);rwt.forEach(function(i){t_elem.appendChild(i.row);});rwot.forEach(function(r){t_elem.appendChild(r);});
  }

  function showUniqueItemsCount(t_elem,ci_idx){var s2=new Set();t_elem.querySelectorAll('tr').forEach(function(r,ri){if(ri===0)return;var tds=r.querySelectorAll('td');if(tds.length<=ci_idx)return;var c=get(tds[ci_idx]);if(c&&c.trim()!=='')s2.add(c.trim());});return s2.size;}
  function getCheckmarkCellIndex(r){var tds=r.querySelectorAll('td');for(var i=0;i<tds.length;i++){if(tds[i].querySelector('input[type="checkbox"]')||tds[i].querySelector('img[src*="check"]'))return i;}return-1;}
  function resetCheckmark(r,ci2){if(ci2<0)return;var tds=r.querySelectorAll('td');if(tds.length<=ci2)return;var cb=tds[ci2].querySelector('input[type="checkbox"]');if(cb){cb.checked=false;fire(cb);}}

  setTopStartDate();
  var ts_list=document.querySelectorAll('table');var tb_main=null;
  for(var i=0;i<ts_list.length;i++){if(ts_list[i].querySelector('th')&&(ts_list[i].innerText.toLowerCase().includes('qty')||ts_list[i].innerText.toLowerCase().includes('quantity'))){tb_main=ts_list[i];break;}}
  if(!tb_main){alert('❌ لم يتم العثور على الجدول');return;}
  var h_main=tb_main.querySelector('tr');var hs_main=h_main.querySelectorAll('th,td');
  var qi_main=idx(hs_main,'qty');var si_main=idx(hs_main,'size');var ni_main=idx(hs_main,'note');var ei_main=idx(hs_main,'every');if(ei_main<0)ei_main=idx(hs_main,'evry');
  var ti_main=idx(hs_main,'time');var di_main=idx(hs_main,'dose');var ci_main=idx(hs_main,'code');var sdi_main=idx(hs_main,'start date');var edi_main=idx(hs_main,'end date');var nm_main=idx(hs_main,'name');if(nm_main<0)nm_main=idx(hs_main,'item');
  window._ezCols={di:di_main,si:si_main,qi:qi_main,ni:ni_main,ei:ei_main};
  if(qi_main<0||si_main<0||ni_main<0||ei_main<0){alert('❌ لم يتم العثور على الأعمدة المطلوبة');return;}
  if(ti_main>=0&&ni_main>=0&&ti_main<ni_main){moveColumnAfter(tb_main,ni_main,ti_main);ni_main=ti_main+1;if(ti_main<di_main)di_main++;if(ti_main<ei_main)ei_main++;if(ti_main<sdi_main)sdi_main++;if(ti_main<edi_main)edi_main++;}
  if(sdi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[sdi_main].style.width='120px';hs_main[sdi_main].style.minWidth='120px';}
  if(edi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[edi_main].style.width='120px';hs_main[edi_main].style.minWidth='120px';}
  if(ni_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ni_main].style.width='180px';hs_main[ni_main].style.minWidth='180px';}

  var rtd_list=[];var rtp_list=[];var skp_list=[];var processedCodes={};var allRowsData=[];window._ezRows=allRowsData;

  tb_main.querySelectorAll('tr').forEach(function(r_node,ri_idx){
    if(ri_idx===0)return;var tds_nodes=r_node.querySelectorAll('td');
    if(nm_main>=0&&tds_nodes.length>nm_main){var n_val=get(tds_nodes[nm_main]);if(/refrigerator|ثلاجه|ثلاجة|cream|syrup|كريم|مرهم|شراب|قطرة|drop|حقنة|injection|لبوس|suppository|غرغرة|mouthwash|بخاخ|spray|محلول|solution|أنف|nasal|عين|eye|أذن|ear|glucose|جلوكوز|strip|شريط|شرائط|lancet|لانسيت|شكاكة|alcohol|كحول|pads|باد|accu|chek|test|فحص|blood|دم|device|جهاز|disposable|one-touch|ون تاتش|وان تاش|نانو|نهدي|nahdi/i.test(n_val)){var ck=getCheckmarkCellIndex(r_node);resetCheckmark(r_node,ck);skp_list.push(r_node);return;}}
    var cb=r_node.querySelector('input[type="checkbox"]');if(cb&&!cb.checked){skp_list.push(r_node);return;}
    if(ci_main>=0&&tds_nodes.length>ci_main){var cd=getCleanCode(tds_nodes[ci_main]);if(cd){if(processedCodes[cd]){var ck=getCheckmarkCellIndex(r_node);resetCheckmark(r_node,ck);skp_list.push(r_node);return;}else{processedCodes[cd]={row:r_node,note:cleanNote(get(tds_nodes[ni_main]))};rtp_list.push(r_node);return;}}}
    rtp_list.push(r_node);
  });

  for(var i=0;i<rtp_list.length;i++){
    var r_node=rtp_list[i];var tds_nodes=r_node.querySelectorAll('td');
    if(tds_nodes.length<=Math.max(qi_main,si_main,ni_main,ei_main))continue;
    if(sdi_main>=0){var sdInp=tds_nodes[sdi_main].querySelector('input');if(sdInp)sdInp.style.width='120px';}
    if(edi_main>=0){var edInp=tds_nodes[edi_main].querySelector('input');if(edInp)edInp.style.width='120px';}
    if(ni_main>=0){var nInp=tds_nodes[ni_main].querySelector('input,textarea');if(nInp){nInp.style.width='100%';nInp.style.minWidth='180px';}}
    var nc=tds_nodes[ni_main];var ni3=nc.querySelector('input,textarea');var nt_str=ni3?ni3.value:nc.textContent;var cn_str=cleanNote(nt_str);
    if(ni3){ni3.value=cn_str;fire(ni3);}else nc.textContent=cn_str;
    var itemCode=getCleanCode(tds_nodes[ci_main]);var itemName=nm_main>=0?get(tds_nodes[nm_main]):'';
    if(processedCodes[itemCode])processedCodes[itemCode].note=cn_str;
    var fn_str=cn_str;var original_note=nt_str;var rowLang=detectLanguage(fn_str);detectedLanguagesPerRow.push(rowLang);
    var nl_str=normL(fn_str);var dui_obj=shouldDuplicateRow(nl_str);var hasFixedSize=!!(itemCode&&fixedSizeCodes[itemCode]);var h_s=!!(itemCode&&weeklyInjections.indexOf(itemCode)>-1);
    var durationInfo=null;var hourlyInfo=null;var calculatedDays=t;var calculatedSize=t;
    if(autoDuration){durationInfo=extractDuration(fn_str);if(durationInfo.hasDuration){calculatedDays=durationInfo.days;calculatedSize=durationInfo.days;}else if(durationInfo.isPRN){calculatedDays=t;calculatedSize=Math.floor(t/2);}else if(durationInfo.isUntilFinish){calculatedDays=t;calculatedSize=t;}}
    hourlyInfo=extractHourlyInterval(fn_str);var timesPerDay=1;if(hourlyInfo.hasInterval)timesPerDay=hourlyInfo.timesPerDay;
    allRowsData.push({row:r_node,tds:tds_nodes,itemCode:itemCode,itemName:itemName,note:fn_str,dui:dui_obj,hasFixedSize:hasFixedSize,isWeekly:h_s,durationInfo:durationInfo,hourlyInfo:hourlyInfo,calculatedDays:calculatedDays,calculatedSize:calculatedSize,timesPerDay:timesPerDay,extractedPillCount:null,warningOverride:false});
    /* Detect dose=2 patterns AFTER push so rowIndex is correct */
    var dose2pattern=/^2\s+(tablet|pill|cap|capsule|undefined|tab|قرص|حبة|حبه|كبسول|كبسولة)/i;
    var dose2pattern2=/\b2\s*(tablet|pill|cap|capsule|undefined|tab|قرص|حبة|حبه|كبسول|كبسولة)/gi;
    if(dose2pattern.test(original_note.trim())||dose2pattern2.test(original_note)){warningQueue.push({level:'warning',message:'💊 الصنف "'+itemName+'" - مكتوب جرعة مزدوجة (2) في الملاحظات',detail:original_note,editable:false,rowIndex:allRowsData.length-1,type:'dose2'});}
  }

  /* Feature 2: Detect duplicate items (same item code, different notes) */
  if(enableWarnings){
    var itemCodeMap={};
    for(var di2=0;di2<allRowsData.length;di2++){
      var rd2=allRowsData[di2];
      var code2=rd2.itemCode;
      if(!code2) continue;
      if(itemCodeMap[code2]!==undefined){
        var prevIdx=itemCodeMap[code2];
        var prevRd=allRowsData[prevIdx];
        warningQueue.push({level:'danger',message:'🔁 الصنف "'+rd2.itemName+'" مكرر في الطلب',detail:'موجود في سطر '+(prevIdx+1)+' وسطر '+(di2+1)+(prevRd.note!==rd2.note?' بملاحظات مختلفة':''),editable:false,rowIndex:di2,type:'duplicate',dupPairIndex:prevIdx});
      } else {
        itemCodeMap[code2]=di2;
      }
    }
  }

  if(enableWarnings){for(var i=0;i<allRowsData.length;i++){var rd=allRowsData[i];if(rd.durationInfo&&rd.durationInfo.hasDuration){var extracted=rd.durationInfo.days;if(extracted!==t){warningQueue.push({level:'warning',message:'📅 الصنف: '+rd.itemName+' - مكتوب "'+extracted+' يوم" لكن المحدد '+t+' يوم',editable:true,editLabel:'عدد الأيام',currentValue:extracted,minValue:1,maxValue:365,rowIndex:i,type:'days',onEdit:(function(idx2){return function(newVal){allRowsData[idx2].calculatedDays=newVal;allRowsData[idx2].calculatedSize=newVal;allRowsData[idx2].warningOverride=true;};})(i)});}}if(rd.hasFixedSize&&rd.dui){var totalSize=fixedSizeCodes[rd.itemCode];var parts=rd.dui.type==='three'?3:(rd.dui.type==='q6h'?1:2);var eachPart=rd.dui.type==='q6h'?totalSize*2:Math.floor(totalSize/parts);if(eachPart<5){warningQueue.push({level:'info',message:'ℹ️ تقسيم صغير: '+rd.itemName+' سيصبح '+eachPart+' حبة لكل جرعة',editable:false,rowIndex:i,type:'smallsplit'});}}}}

  if(warningQueue.length>0&&enableWarnings){window.showWarnings(warningQueue,function(){continueProcessing();});}else{continueProcessing();}

  function continueProcessing(){
    var defaultStartDate=document.querySelector('#fstartDate')?document.querySelector('#fstartDate').value:null;
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];var r_node=rd.row;var tds_nodes=rd.tds;
      if(rd.dui){if(qi_main>=0){var qc=tds_nodes[qi_main];var cv=parseInt(get(qc))||1;setSize(qc,cv*m);}rtd_list.push({row:r_node,info:rd.dui,calcDays:rd.calculatedDays});continue;}
      if(rd.hasFixedSize&&!rd.warningOverride){setSize(tds_nodes[si_main],fixedSizeCodes[rd.itemCode]);var tm_fix=getTimeFromWords(rd.note);setTime(r_node,tm_fix.time);var dose_fix=smartDoseRecognizer(rd.note);var isE12_fix=/12|twice|bid|b\.?i\.?d|مرتين/.test(rd.note)||(dose_fix.hasB&&dose_fix.hasD)||(dose_fix.hasM&&dose_fix.hasE)||/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(rd.note)||/قبل\s*(الاكل|الأكل)\s*مرتين/.test(rd.note);if(dose_fix.count>=4||rd.timesPerDay>=4){setEvry(tds_nodes[ei_main],'6');}else if(dose_fix.count===3||rd.timesPerDay===3){setEvry(tds_nodes[ei_main],'8');}else if(dose_fix.count===2||isE12_fix||rd.timesPerDay===2){setEvry(tds_nodes[ei_main],'12');}else{setEvry(tds_nodes[ei_main],'24');}if(di_main>=0){var tpi_fix=getTwoPillsPerDoseInfo(rd.note);setDose(tds_nodes[di_main],tpi_fix.dose===2?2:tpi_fix.dose);}if(rd.forceDose2&&di_main>=0){setDose(tds_nodes[di_main],2);var fsCur=parseInt(get(tds_nodes[si_main]))||1;setSize(tds_nodes[si_main],fsCur*2);if(!window._ezDose2Applied) window._ezDose2Applied=[];window._ezDose2Applied.push({name:rd.itemName,newSize:fsCur*2,dose:2});}if(qi_main>=0){var cur2=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur2*m);}continue;}
      if(rd.isWeekly){var bs_val=(rd.calculatedDays==28?4:5)+(m-1)*4;setSize(tds_nodes[si_main],bs_val);setEvry(tds_nodes[ei_main],'168');if(qi_main>=0){var cur3=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur3);}var tm_fix2=getTimeFromWords(rd.note);setTime(r_node,tm_fix2.time);var targetDay=extractDayOfWeek(rd.note);if(targetDay!==null&&defaultStartDate&&sdi_main>=0){var newSD=getNextDayOfWeek(defaultStartDate,targetDay);setStartDate(r_node,newSD);}continue;}
      if(qi_main>=0){var qc2=tds_nodes[qi_main];var cv2=parseInt(get(qc2))||1;setSize(qc2,cv2*m);}
      var doseInfo=smartDoseRecognizer(rd.note);var tpi_obj=getTwoPillsPerDoseInfo(rd.note);var doseMultiplier=tpi_obj.dose;var tm2_obj=getTimeFromWords(rd.note);
      var is48h=/48|يوم بعد يوم|يوم ويوم|every\s*other\s*day|day\s*after\s*day|alternate\s*day|eod|e\.o\.d/i.test(rd.note);
      if(is48h){setEvry(tds_nodes[ei_main],'48');var mult2=doseMultiplier;if(doseInfo.count>=2)setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*mult2));else setSize(tds_nodes[si_main],Math.ceil((rd.calculatedSize*mult2)/2));setTime(r_node,tm2_obj.time);continue;}
      var finalTPD=rd.timesPerDay;if(rd.hourlyInfo.hasInterval)finalTPD=rd.hourlyInfo.timesPerDay;
      var isE12=/كل\s*12|12|twice|bid|b\.?i\.?d|مرتين/.test(rd.note)||(doseInfo.hasB&&doseInfo.hasD)||(doseInfo.hasM&&doseInfo.hasE)||/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(rd.note)||/قبل\s*(الاكل|الأكل)\s*مرتين/.test(rd.note);
      if(finalTPD>=6){setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*6));setEvry(tds_nodes[ei_main],'4');}
      else if(finalTPD===4){setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*4));setEvry(tds_nodes[ei_main],'6');}
      else if(isE12||finalTPD===2){setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*2));setEvry(tds_nodes[ei_main],'12');setTime(r_node,tm2_obj.time);}
      else if(doseInfo.count===3||finalTPD===3){setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*3));setEvry(tds_nodes[ei_main],'8');}
      else if(doseInfo.count===2){setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*2));setEvry(tds_nodes[ei_main],'12');setTime(r_node,tm2_obj.time);}
      else{setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier));setEvry(tds_nodes[ei_main],'24');}
      if(di_main>=0)setDose(tds_nodes[di_main],doseMultiplier>=1?doseMultiplier:1);
      if(!isE12)setTime(r_node,tm2_obj.time);
      /* Apply forceDose2 override AFTER normal processing */
      if(rd.forceDose2){
        if(di_main>=0)setDose(tds_nodes[di_main],2);
        if(si_main>=0){var curSz=parseInt(get(tds_nodes[si_main]))||1;setSize(tds_nodes[si_main],curSz*2);}
        /* Queue safety confirmation */
        if(!window._ezDose2Applied) window._ezDose2Applied=[];
        window._ezDose2Applied.push({name:rd.itemName,newSize:curSz*2,dose:2});
      }
    }
    for(var i=0;i<rtd_list.length;i++){var it=rtd_list[i];createDuplicateRows(it.calcDays,it.row,it.info,it.calcDays,ni_main,si_main,ei_main,di_main,ti_main,sdi_main,edi_main,m,it.calcDays,ci_main,qi_main);}
    sortRowsByTime(tb_main,ti_main,ei_main);
    for(var i=0;i<skp_list.length;i++){var r_node=skp_list[i];var tds_nodes=r_node.querySelectorAll('td');var u_code_skp=getCleanCode(tds_nodes[ci_main]);if(sdi_main>=0&&tds_nodes[sdi_main]){var sdInp2=tds_nodes[sdi_main].querySelector('input');if(sdInp2)sdInp2.style.width='120px';}if(edi_main>=0&&tds_nodes[edi_main]){var edInp2=tds_nodes[edi_main].querySelector('input');if(edInp2)edInp2.style.width='120px';}if(ni_main>=0&&tds_nodes[ni_main]){var nInp2=tds_nodes[ni_main].querySelector('input,textarea');var crn=get(tds_nodes[ni_main]);var ccn=cleanNote(crn);if(nInp2){nInp2.style.width='100%';nInp2.style.minWidth='180px';nInp2.value=ccn;fire(nInp2);var fo=processedCodes[u_code_skp];if(fo&&ccn!==fo.note){nInp2.style.backgroundColor='rgba(240,147,251,0.12)';nInp2.style.border='2px solid rgba(118,75,162,0.4)';var fi=fo.row.querySelectorAll('td')[ni_main].querySelector('input,textarea');if(fi){fi.style.backgroundColor='rgba(240,147,251,0.12)';fi.style.border='2px solid rgba(118,75,162,0.4)';}}}else{tds_nodes[ni_main].textContent=ccn;}}tb_main.appendChild(r_node);}
    var uc=showUniqueItemsCount(tb_main,ci_main);var genBtn=Array.from(document.querySelectorAll('button,input')).find(function(b){return(b.innerText||b.value||'').toLowerCase().includes('generate csv');});
    if(genBtn){genBtn.className='ez-gen-csv-btn';var bdg=document.createElement('span');bdg.className='unique-count-badge';bdg.innerHTML='📦 عدد الأصناف: '+uc;genBtn.parentNode.insertBefore(bdg,genBtn.nextSibling);}
    beautifyPage();
    var enC=detectedLanguagesPerRow.filter(function(l){return l==='english';}).length;var arC=detectedLanguagesPerRow.filter(function(l){return l==='arabic';}).length;
    if(enC>0&&enC>=arC){setPatientLanguage('english');}else if(arC>0){setPatientLanguage('arabic');}
    if(duplicatedCount>0)window.ezShowToast('تم تقسيم '+duplicatedCount+' صنف إلى صفوف متعددة ⚡','info');
    if(showPostDialog)showPostProcessDialog();
    checkEndDateConsistency();
    window.ezShowToast('تمت المعالجة بنجاح ✅','success');
    ezBeep('success');

    /* Feature 4: Order Summary */
    var summaryStats={
      totalItems:allRowsData.length,
      uniqueItems:uc||allRowsData.length,
      duplicated:duplicatedCount,
      skipped:skp_list.length,
      fixedSize:allRowsData.filter(function(r){return r.hasFixedSize;}).length,
      weekly:allRowsData.filter(function(r){return r.isWeekly;}).length,
      dose2Applied:window._ezDose2Applied?window._ezDose2Applied.length:0,
      daysOverride:allRowsData.filter(function(r){return r.warningOverride;}).length,
      lang:enC>arC?'English':'Arabic'
    };
    setTimeout(function(){
      var sm=summaryStats;
      var rows='';
      function addRow(icon,label,val,color){
        if(!val&&val!==0) return;
        rows+='<div style="display:flex;align-items:center;gap:8px;padding:5px 0;direction:rtl">';
        rows+='<span style="font-size:14px;width:22px;text-align:center">'+icon+'</span>';
        rows+='<span style="flex:1;font-size:11px;font-weight:700;color:#64748b">'+label+'</span>';
        rows+='<span style="font-size:13px;font-weight:900;color:'+(color||'#1e1b4b')+'">'+val+'</span>';
        rows+='</div>';
      }
      addRow('📦','إجمالي الأصناف',sm.totalItems,'#6366f1');
      addRow('🏷️','أصناف فريدة',sm.uniqueItems,'#059669');
      if(sm.duplicated>0) addRow('⚡','أصناف مقسمة (Q6H/Q8H)',sm.duplicated,'#f59e0b');
      if(sm.skipped>0) addRow('⏭️','أصناف متجاهلة',sm.skipped,'#94a3b8');
      if(sm.fixedSize>0) addRow('📌','أصناف بحجم ثابت',sm.fixedSize,'#8b5cf6');
      if(sm.weekly>0) addRow('💉','حقن أسبوعية',sm.weekly,'#06b6d4');
      if(sm.dose2Applied>0) addRow('💊','تعديل جرعة مزدوجة',sm.dose2Applied,'#ef4444');
      if(sm.daysOverride>0) addRow('📅','تعديل أيام',sm.daysOverride,'#f59e0b');
      addRow('🌐','اللغة المكتشفة',sm.lang,'#6366f1');

      var sumEl=document.createElement('div');
      sumEl.id='ez-summary';
      sumEl.style.cssText='position:fixed;left:-400px;bottom:80px;width:280px;z-index:9999995;transition:left 0.6s cubic-bezier(0.16,1,0.3,1);font-family:Cairo,sans-serif';
      sumEl.innerHTML='\
      <div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(99,102,241,0.12),0 4px 12px rgba(0,0,0,0.04);border:2px solid rgba(129,140,248,0.12)">\
        <div style="height:3px;background:linear-gradient(90deg,#10b981,#6366f1,#10b981);background-size:200% 100%;animation:barShift 4s ease infinite"></div>\
        <div style="padding:12px 16px 8px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(129,140,248,0.06)">\
          <div style="font-size:18px">📊</div>\
          <div style="flex:1;font-size:13px;font-weight:900;color:#1e1b4b">ملخص الطلب</div>\
          <button onclick="var el=document.getElementById(\'ez-summary\');el.style.left=\'-400px\';setTimeout(function(){el.remove()},600)" style="width:24px;height:24px;border:none;border-radius:7px;font-size:12px;cursor:pointer;color:#94a3b8;background:rgba(148,163,184,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">✕</button>\
        </div>\
        <div style="padding:10px 16px 14px">'+rows+'</div>\
      </div>';
      document.body.appendChild(sumEl);
      setTimeout(function(){sumEl.style.left='16px';},100);
      setTimeout(function(){if(document.getElementById('ez-summary')){sumEl.style.left='-400px';setTimeout(function(){sumEl.remove();},600);}},15000);
    },300);
    /* Show safety confirmation for dose2 changes */
    if(window._ezDose2Applied&&window._ezDose2Applied.length>0){
      setTimeout(function(){
        var items=window._ezDose2Applied;
        var listHtml='';
        for(var d2=0;d2<items.length;d2++){
          listHtml+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(245,158,11,0.04);border:1px solid rgba(245,158,11,0.1);border-radius:8px;margin-bottom:6px;direction:rtl">';
          listHtml+='<span style="font-size:16px">💊</span>';
          listHtml+='<span style="flex:1;font-size:12px;font-weight:800;color:#1e1b4b">'+items[d2].name+'</span>';
          listHtml+='<span style="font-size:11px;font-weight:800;color:#059669;background:rgba(16,185,129,0.08);padding:2px 8px;border-radius:6px">الجرعة: '+items[d2].dose+'</span>';
          listHtml+='<span style="font-size:11px;font-weight:800;color:#6366f1;background:rgba(99,102,241,0.08);padding:2px 8px;border-radius:6px">الكمية: '+items[d2].newSize+'</span>';
          listHtml+='</div>';
        }
        var safetyBanner=document.createElement('div');
        safetyBanner.id='ez-safety-confirm';
        safetyBanner.style.cssText='position:fixed;bottom:-300px;left:50%;transform:translateX(-50%);width:440px;max-width:94vw;z-index:9999998;transition:bottom 0.6s cubic-bezier(0.16,1,0.3,1);font-family:Cairo,sans-serif';
        safetyBanner.innerHTML='\
        <div style="background:#fff;border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 40px rgba(245,158,11,0.12),0 -4px 12px rgba(0,0,0,0.06);border:2px solid rgba(245,158,11,0.15);border-bottom:none">\
          <div style="height:3px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b);background-size:200% 100%;animation:barShift 4s ease infinite"></div>\
          <div style="padding:14px 18px 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(245,158,11,0.08)">\
            <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(145deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(245,158,11,0.2);flex-shrink:0">🔔</div>\
            <div style="flex:1"><div style="font-size:13px;font-weight:800;color:#92400e">تأكد من كمية الأدوية التالية</div>\
            <div style="font-size:10px;font-weight:700;color:#b45309;margin-top:1px">تم تعديل الجرعة والكمية - برجاء المراجعة</div></div>\
          </div>\
          <div style="padding:12px 18px">'+listHtml+'</div>\
          <div style="padding:8px 18px 14px;display:flex;gap:6px">\
            <button onclick="var el=document.getElementById(\'ez-safety-confirm\');el.style.bottom=\'-300px\';setTimeout(function(){el.remove()},600);window.ezShowToast(\'✅ تم التأكيد\',\'success\')" style="flex:1;height:36px;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 3px 10px rgba(16,185,129,0.2);transition:all 0.3s">✅ تم المراجعة - الكميات صحيحة</button>\
          </div>\
        </div>';
        document.body.appendChild(safetyBanner);
        setTimeout(function(){safetyBanner.style.bottom='0px';},100);
        /* Auto dismiss after 20 seconds */
        setTimeout(function(){if(document.getElementById('ez-safety-confirm')){safetyBanner.style.bottom='-300px';setTimeout(function(){safetyBanner.remove();},600);}},20000);
        window._ezDose2Applied=null;
      },500);
    }
    setTimeout(function(){extractAndConfirmName();},800);
    setTimeout(function(){detectPackagingInstructions();},1200);
  }
}

/* ══════════════════════════════════════════
   PACKAGING INSTRUCTIONS DETECTION
   ══════════════════════════════════════════ */
function detectPackagingInstructions(){
  try{
    /* Find Prescription Notes */
    var inputs=document.querySelectorAll('input[type="text"],textarea');
    var notesText='';
    for(var i=0;i<inputs.length;i++){
      var v=(inputs[i].value||'').trim();
      if(v.length>30&&/[\u0600-\u06FF]/.test(v)&&(/ضيف|توصيل|صيدل|دمج|بوكس|صندوق|شهر/i.test(v))){notesText=v;break;}
      var attrs=(inputs[i].name||'')+(inputs[i].id||'')+(inputs[i].placeholder||'');
      if(/presc.*note|prescription.*note/i.test(attrs)&&v.length>10){notesText=v;break;}
    }
    if(!notesText) return;

    var detected=null;
    var s=notesText;

    /* ── Pattern 1: MERGE - دمج الطلبات في بوكس واحد ── */
    var mergePatterns=[
      /دمج(هم|هن|وهم|وا|يهم)?\s*(في|فى|ب)?\s*(بوكس|صندوق|كرتون|شنطه|شنطة)?\s*(واحد)?/i,
      /(بوكس|صندوق|كرتون|شنطه|شنطة)\s*(واحد|واحده)/i,
      /تجميع(هم|هن)?\s*(في|فى|ب)?\s*(بوكس|صندوق)?/i,
      /(في|فى)\s*(بوكس|صندوق|كرتون)\s*(واحد)/i,
      /مع\s*بعض\s*(في|فى|ب)?\s*(بوكس|صندوق)?/i,
      /طلب(ات|ين)?\s*(ب)?رجاء\s*دمج/i
    ];

    /* Extract order count */
    var orderCount='';
    var countMatch=s.match(/(\d+)\s*(طلب|طلبات|اوردر|order)/i);
    if(countMatch) orderCount=countMatch[1];
    var countMatch2=s.match(/(ثلاث|ثلاثة|اربع|أربع|خمس|خمسة|ست|سته|سبع|ثمان|تسع|عشر)\s*(طلب|طلبات)/i);
    if(countMatch2){
      var arabicNums={'ثلاث':'3','ثلاثة':'3','اربع':'4','أربع':'4','خمس':'5','خمسة':'5','ست':'6','سته':'6','سبع':'7','ثمان':'8','تسع':'9','عشر':'10'};
      orderCount=arabicNums[countMatch2[1]]||countMatch2[1];
    }

    for(var p=0;p<mergePatterns.length;p++){
      if(mergePatterns[p].test(s)){
        detected={
          type:'merge',
          icon:'📦',
          color:'#6366f1',
          colorLight:'rgba(99,102,241,0.06)',
          colorBorder:'rgba(99,102,241,0.15)',
          title:'دمج الطلبات في بوكس واحد',
          detail:'الضيف عنده '+(orderCount?orderCount+' طلبات':'عدة طلبات')+' - المطلوب تجميعهم في بوكس واحد',
          action:'تأكد من دمج جميع الطلبات في صندوق واحد قبل التوصيل'
        };
        break;
      }
    }

    /* ── Pattern 2: SEPARATE BOXES - كل شهر بصندوق منفصل ── */
    if(!detected){
      var separatePatterns=[
        /كل\s*(شهر|بوكس)\s*(ب|في|فى)?\s*(صندوق|بوكس|كرتون)/i,
        /كل\s*شهر\s*(لوحد|منفصل|لحال)/i,
        /(بوكسات|صناديق|كراتين)\s*(منفصل|منفصله|لوحد)/i,
        /كل\s*شهر\s*(ب|في|فى)\s*(بوكس|صندوق)/i,
        /(فصل|افصل|يفصل)\s*(كل)?\s*(شهر|بوكس)/i,
        /شهر\s*(ب|في|فى)\s*(صندوق|بوكس)\s*(منفصل)?/i,
        /جعل\s*كل\s*شهر\s*(ب|في|فى)?\s*(صندوق|بوكس)/i
      ];

      /* Extract month count */
      var monthCount='';
      var mMatch=s.match(/(\d+)\s*(شهر|اشهر|أشهر|شهور)/i);
      if(mMatch) monthCount=mMatch[1];
      var mMatch2=s.match(/(شهرين|ثلاث|ثلاثة|اربع|أربع|خمس|خمسة|ست|سته)\s*(شهر|اشهر|أشهر|شهور)?/i);
      if(mMatch2){
        var arabicNums2={'شهرين':'2','ثلاث':'3','ثلاثة':'3','اربع':'4','أربع':'4','خمس':'5','خمسة':'5','ست':'6','سته':'6'};
        monthCount=arabicNums2[mMatch2[1]]||mMatch2[1];
      }
      var lMatch=s.match(/ل(ثلاث|ثلاثة|اربع|أربع|خمس|ست)\s*(اشهر|أشهر|شهور)/i);
      if(lMatch){
        var arabicNums3={'ثلاث':'3','ثلاثة':'3','اربع':'4','أربع':'4','خمس':'5','ست':'6'};
        monthCount=arabicNums3[lMatch[1]]||lMatch[1];
      }

      for(var p2=0;p2<separatePatterns.length;p2++){
        if(separatePatterns[p2].test(s)){
          detected={
            type:'separate',
            icon:'📦📦📦',
            color:'#f59e0b',
            colorLight:'rgba(245,158,11,0.06)',
            colorBorder:'rgba(245,158,11,0.15)',
            title:'كل شهر في صندوق منفصل',
            detail:'المطلوب '+(monthCount?monthCount+' صناديق - صندوق لكل شهر':'تقسيم الأدوية لصناديق منفصلة - صندوق لكل شهر'),
            action:'تأكد من فصل أدوية كل شهر في بوكس منفصل عند التجهيز'
          };
          break;
        }
      }
    }

    if(!detected) return;

    /* Show packaging banner - right side */
    var pkgBanner=document.createElement('div');
    pkgBanner.id='ez-pkg-alert';
    pkgBanner.style.cssText='position:fixed;right:-500px;top:80px;width:340px;z-index:9999996;transition:right 0.6s cubic-bezier(0.16,1,0.3,1);font-family:Cairo,sans-serif';

    pkgBanner.innerHTML='\
    <div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.1),0 4px 12px rgba(0,0,0,0.04);border:2px solid '+detected.colorBorder+'">\
      <div style="height:3px;background:linear-gradient(90deg,'+detected.color+','+detected.color+'88,'+detected.color+');background-size:200% 100%;animation:barShift 4s ease infinite"></div>\
      <div style="padding:14px 16px 10px;display:flex;align-items:center;gap:10px">\
        <div style="font-size:24px;flex-shrink:0">'+detected.icon+'</div>\
        <div style="flex:1"><div style="font-size:14px;font-weight:900;color:#1e1b4b">'+detected.title+'</div></div>\
        <button onclick="var el=document.getElementById(\'ez-pkg-alert\');el.style.right=\'-500px\';setTimeout(function(){el.remove()},600)" style="width:26px;height:26px;border:none;border-radius:7px;font-size:13px;cursor:pointer;color:#94a3b8;background:rgba(148,163,184,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">✕</button>\
      </div>\
      <div style="padding:0 16px 12px">\
        <div style="background:'+detected.colorLight+';border:1px solid '+detected.colorBorder+';border-radius:10px;padding:10px 12px;margin-bottom:8px;direction:rtl">\
          <div style="font-size:12px;font-weight:800;color:#1e1b4b;line-height:1.6">'+detected.detail+'</div>\
        </div>\
        <div style="display:flex;align-items:flex-start;gap:6px;direction:rtl;padding:6px 8px;background:rgba(245,158,11,0.04);border-radius:8px;border:1px solid rgba(245,158,11,0.08)">\
          <span style="font-size:14px;flex-shrink:0;margin-top:1px">⚡</span>\
          <div style="font-size:11px;font-weight:700;color:#92400e;line-height:1.6">'+detected.action+'</div>\
        </div>\
      </div>\
      <div style="padding:6px 16px 12px">\
        <button onclick="var el=document.getElementById(\'ez-pkg-alert\');el.style.right=\'-500px\';setTimeout(function(){el.remove()},600);window.ezShowToast(\'✅ تم الاطلاع\',\'success\')" style="width:100%;height:36px;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,'+detected.color+','+detected.color+'dd);box-shadow:0 3px 10px '+detected.color+'33;transition:all 0.3s">👍 تم - فاهم</button>\
      </div>\
    </div>';

    document.body.appendChild(pkgBanner);
    setTimeout(function(){pkgBanner.style.right='16px';ezBeep('warning');},100);
    /* Auto dismiss after 25 seconds */
    setTimeout(function(){if(document.getElementById('ez-pkg-alert')){pkgBanner.style.right='-500px';setTimeout(function(){pkgBanner.remove();},600);}},25000);

  }catch(e){console.log('EZ PackageDetect:',e);}
}

/* ══════════════════════════════════════════
   STYLES - NEW PROFESSIONAL DESIGN
   ══════════════════════════════════════════ */
var s_style=document.createElement('style');
s_style.textContent='\
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap");\
@keyframes barShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}\
@keyframes dialogEnter{from{opacity:0;transform:translate(-50%,-46%) scale(0.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}\
@keyframes shimmer{0%,70%{left:-100%}100%{left:200%}}\
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
@keyframes spin{to{transform:rotate(360deg)}}\
@keyframes meshFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}\
.ez-dialog-v2{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:560px;z-index:99999;border-radius:20px;background:#fff;box-shadow:0 16px 48px rgba(99,102,241,0.12),0 4px 16px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.2);overflow:hidden;animation:dialogEnter 0.5s cubic-bezier(0.16,1,0.3,1) forwards;font-family:Cairo,sans-serif}\
.ez-dialog-v2::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa,#6366f1,#a78bfa,#818cf8);background-size:200% 100%;animation:barShift 4s ease infinite;z-index:1}\
.ez-header{padding:20px 28px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.1);cursor:move;background:linear-gradient(180deg,rgba(129,140,248,0.03) 0%,transparent 100%)}\
.ez-logo-group{display:flex;align-items:center;gap:12px}\
.ez-logo{width:52px;height:52px;border-radius:15px;background:linear-gradient(145deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 16px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12);position:relative}\
.ez-logo::after{content:"";position:absolute;inset:0;border-radius:15px;background:linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 50%);pointer-events:none}\
.ez-title-block{display:flex;flex-direction:column;gap:1px}\
.ez-title{font-size:23px;font-weight:800;color:#1e1b4b;letter-spacing:-0.3px;line-height:1.2}\
.ez-subtitle{font-size:12px;font-weight:600;color:#7c7cb0;letter-spacing:0.5px}\
.ez-header-actions{display:flex;align-items:center;gap:6px}\
.ez-version{font-size:11px;font-weight:700;color:#818cf8;background:rgba(129,140,248,0.06);border:1px solid rgba(129,140,248,0.12);padding:3px 10px;border-radius:8px;letter-spacing:0.5px}\
.ez-btn-icon{width:34px;height:34px;border-radius:9px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.06);color:#818cf8;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all 0.25s;font-family:Cairo,sans-serif}\
.ez-btn-icon:hover{background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.2);color:#ef4444;transform:rotate(90deg)}\
.ez-content{padding:20px 28px 24px}\
.ez-section-label{font-size:12px;font-weight:800;color:#6366f1;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px}\
.ez-section-label .dot{width:4px;height:4px;border-radius:50%;background:#818cf8}\
.ez-pill-group{display:flex;gap:8px;margin-bottom:18px;padding:5px;background:rgba(241,245,249,0.8);border:1px solid rgba(129,140,248,0.1);border-radius:14px}\
.ez-pill{flex:1;height:52px;border-radius:12px;border:none;background:transparent;font-size:20px;font-weight:800;color:#94a3b8;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);font-family:Cairo,sans-serif;position:relative}\
.ez-pill:hover:not(.active){color:#6366f1;background:rgba(255,255,255,0.6)}\
.ez-pill.active{color:#fff;background:linear-gradient(145deg,#818cf8,#6366f1);box-shadow:0 4px 16px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12);transform:translateY(-1px)}\
.ez-pill.active::before{content:"";position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.2),transparent);border-radius:10px 10px 0 0;pointer-events:none}\
.ez-sep{height:1px;margin:16px 0;background:linear-gradient(90deg,transparent,rgba(129,140,248,0.15),transparent);position:relative}\
.ez-sep::after{content:"";position:absolute;width:30px;height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa);border-radius:2px;top:-1px;right:0;opacity:0.6}\
.ez-toggle-row{display:flex;align-items:center;padding:10px 8px;gap:14px;direction:rtl;cursor:pointer;border-radius:10px;transition:background 0.2s}\
.ez-toggle-row:hover{background:rgba(129,140,248,0.04)}\
.ez-switch{position:relative;width:48px;height:28px;flex-shrink:0}\
.ez-switch input{display:none}\
.ez-switch-track{position:absolute;inset:0;background:#ddd6fe;border-radius:14px;transition:all 0.35s;box-shadow:inset 0 1px 3px rgba(0,0,0,0.08)}\
.ez-switch input:checked+.ez-switch-track{background:linear-gradient(135deg,#818cf8,#6366f1);box-shadow:0 2px 10px rgba(99,102,241,0.3)}\
.ez-switch-knob{position:absolute;top:3px;right:3px;width:22px;height:22px;background:#fff;border-radius:50%;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);box-shadow:0 1px 4px rgba(0,0,0,0.15);pointer-events:none}\
.ez-switch input:checked~.ez-switch-knob{right:23px}\
.ez-toggle-text{font-size:15px;font-weight:700;color:#3730a3;flex:1;line-height:1.4}\
.ez-toggle-text .auto-tag{font-size:10px;font-weight:800;color:#818cf8;background:rgba(129,140,248,0.08);padding:1px 6px;border-radius:4px;margin-right:4px}\
.ez-toggle-icon{font-size:18px;opacity:0.5;transition:all 0.25s}\
.ez-toggle-row:hover .ez-toggle-icon{opacity:0.85;transform:scale(1.15)}\
.ez-actions{display:flex;gap:10px;margin-top:22px}\
.ez-btn-primary{flex:1;height:54px;border:none;border-radius:14px;font-size:17px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#818cf8,#6366f1);box-shadow:0 4px 14px rgba(99,102,241,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12);transition:all 0.3s;position:relative;overflow:hidden;letter-spacing:0.3px}\
.ez-btn-primary::before{content:"";position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.2),transparent);pointer-events:none;border-radius:14px 14px 0 0}\
.ez-btn-primary::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:shimmer 5s ease-in-out infinite}\
.ez-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,0.28),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12)}\
.ez-btn-primary:active{transform:translateY(0);box-shadow:0 2px 8px rgba(99,102,241,0.2),inset 0 2px 4px rgba(0,0,0,0.1)}\
.ez-btn-doses{width:54px;height:54px;border-radius:14px;border:none;background:linear-gradient(145deg,#a78bfa,#8b5cf6);color:#fff;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;box-shadow:0 4px 14px rgba(139,92,246,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12);position:relative;overflow:hidden}\
.ez-btn-doses::before{content:"";position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.2),transparent);pointer-events:none;border-radius:14px 14px 0 0}\
.ez-btn-doses:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(139,92,246,0.3),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12)}\
.ez-btn-cancel{width:54px;height:54px;border-radius:14px;border:1.5px solid rgba(129,140,248,0.15);background:linear-gradient(145deg,#fff,#f8fafc);color:#94a3b8;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:Cairo,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(0,0,0,0.04)}\
.ez-btn-cancel:hover{background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2);color:#ef4444;transform:rotate(90deg) translateY(-2px)}\
.ez-footer{padding:10px 28px;text-align:center;font-size:10px;color:#c7d2fe;font-weight:700;letter-spacing:1.5px;border-top:1px solid rgba(129,140,248,0.08);background:rgba(241,245,249,0.4)}\
.ez-content>*{animation:fadeSlideUp 0.4s ease backwards}\
.ez-content>*:nth-child(1){animation-delay:0.05s}.ez-content>*:nth-child(2){animation-delay:0.1s}.ez-content>*:nth-child(3){animation-delay:0.15s}.ez-content>*:nth-child(4){animation-delay:0.2s}.ez-content>*:nth-child(5){animation-delay:0.25s}.ez-content>*:nth-child(6){animation-delay:0.3s}.ez-content>*:nth-child(7){animation-delay:0.35s}.ez-content>*:nth-child(8){animation-delay:0.4s}.ez-content>*:nth-child(9){animation-delay:0.45s}\
.ez-doses-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;z-index:100000;border-radius:20px;background:#fff;box-shadow:0 20px 60px rgba(99,102,241,0.15),0 4px 16px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.2);overflow:hidden;font-family:Cairo,sans-serif}\
.ez-doses-dialog::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#a78bfa,#8b5cf6,#6366f1,#8b5cf6,#a78bfa);background-size:200% 100%;animation:barShift 4s ease infinite;z-index:1}\
.ez-doses-header{padding:14px 22px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.1);cursor:move;background:linear-gradient(180deg,rgba(167,139,250,0.03) 0%,transparent 100%)}\
.ez-doses-logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(145deg,#a78bfa,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(139,92,246,0.25),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.12);position:relative}\
.ez-doses-logo::after{content:"";position:absolute;inset:0;border-radius:11px;background:linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 50%);pointer-events:none}\
.ez-doses-title{font-size:17px;font-weight:800;color:#1e1b4b}\
.ez-items-count{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;color:#818cf8;background:rgba(129,140,248,0.06);border:1px solid rgba(129,140,248,0.12);padding:2px 10px;border-radius:8px}\
.ez-doses-body{padding:16px 22px 16px;max-height:60vh;overflow-y:auto}\
.ez-dose-header-row{display:flex;align-items:center;gap:0;margin-bottom:6px;border-radius:10px;overflow:hidden;background:linear-gradient(145deg,#818cf8,#6366f1)}\
.ez-dose-header-row .ez-dose-num{width:36px;text-align:center;padding:8px 0;color:rgba(255,255,255,0.7);font-size:11px;font-weight:800;border-left:1px solid rgba(255,255,255,0.15)}\
.ez-dose-header-row .ez-dose-name,.ez-dose-header-row .ez-dose-note{flex:1;padding:8px 14px;color:#fff;font-size:11px;font-weight:800;letter-spacing:0.5px;border-left:1px solid rgba(255,255,255,0.15)}\
.ez-dose-item{display:flex;align-items:stretch;gap:0;margin-bottom:6px;border-radius:10px;border:1px solid rgba(129,140,248,0.1);overflow:hidden;background:#fff;transition:all 0.2s}\
.ez-dose-item:hover{border-color:rgba(129,140,248,0.2);box-shadow:0 2px 12px rgba(99,102,241,0.06)}\
.ez-dose-item-dup{border:1.5px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.04)}\
.ez-dose-item-dup:hover{border-color:rgba(251,191,36,0.6);box-shadow:0 2px 12px rgba(251,191,36,0.1)}\
.ez-dose-num{width:36px;display:flex;align-items:center;justify-content:center;background:rgba(129,140,248,0.05);font-size:12px;font-weight:800;color:#818cf8;border-left:1px solid rgba(129,140,248,0.08);flex-shrink:0}\
.ez-dose-name{flex:1;padding:10px 14px;font-size:12px;font-weight:700;color:#1e1b4b;line-height:1.4;border-left:1px solid rgba(129,140,248,0.08);word-break:break-word}\
.ez-dose-note{flex:1.2;padding:10px 14px;font-size:12px;font-weight:600;color:#3730a3;line-height:1.4;background:rgba(241,245,249,0.5);word-break:break-word;direction:rtl}\
.ez-doses-footer{padding:12px 22px;display:flex;gap:8px;border-top:1px solid rgba(129,140,248,0.08);background:rgba(241,245,249,0.4)}\
.ez-btn-close-doses{flex:1;height:42px;border:1.5px solid rgba(129,140,248,0.15);border-radius:12px;background:linear-gradient(145deg,#fff,#f8fafc);color:#6366f1;cursor:pointer;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;transition:all 0.25s;box-shadow:0 2px 6px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,0.8)}\
.ez-btn-close-doses:hover{border-color:#818cf8;color:#4338ca;background:rgba(129,140,248,0.06)}\
.unique-count-badge{background:linear-gradient(145deg,#818cf8,#6366f1);color:#fff;padding:0 16px;border-radius:12px;font-size:13px;font-weight:800;margin-left:10px;display:inline-flex;align-items:center;vertical-align:middle;height:34px;font-family:Cairo,sans-serif;box-shadow:0 4px 14px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.2);letter-spacing:0.3px}\
.ez-gen-csv-btn{background:linear-gradient(145deg,#10b981,#059669)!important;color:#fff!important;border:none!important;padding:0 22px!important;height:34px!important;border-radius:12px!important;font-size:13px!important;font-weight:800!important;cursor:pointer!important;font-family:Cairo,sans-serif!important;box-shadow:0 4px 14px rgba(16,185,129,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -2px 0 rgba(0,0,0,0.1)!important;transition:all 0.3s!important;letter-spacing:0.3px!important;vertical-align:middle!important}\
.ez-gen-csv-btn:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(16,185,129,0.3),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -2px 0 rgba(0,0,0,0.1)!important}\
.ez-page-styled table{border-collapse:separate!important;border-spacing:0!important;width:100%!important;font-family:Cairo,sans-serif!important;border-radius:12px!important;overflow:hidden!important;box-shadow:0 4px 20px rgba(99,102,241,0.08),0 1px 4px rgba(0,0,0,0.04)!important;border:1.5px solid rgba(129,140,248,0.12)!important}\
.ez-page-styled table th{background:linear-gradient(145deg,#6366f1,#4f46e5)!important;color:#fff!important;font-size:11.5px!important;font-weight:800!important;padding:10px 6px!important;text-align:center!important;letter-spacing:0.3px!important;border:none!important;border-bottom:2px solid #4338ca!important;border-left:1px solid rgba(255,255,255,0.12)!important;white-space:nowrap!important;text-shadow:0 1px 2px rgba(0,0,0,0.15)!important}\
.ez-page-styled table th:first-child{border-left:none!important}\
.ez-page-styled table td{padding:5px 6px!important;font-size:12px!important;font-weight:700!important;color:#1e1b4b!important;border:none!important;border-bottom:1px solid rgba(129,140,248,0.08)!important;border-left:1px solid rgba(129,140,248,0.06)!important;vertical-align:middle!important;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)!important}\
.ez-page-styled table td:first-child{border-left:none!important}\
.ez-page-styled table input[type="text"],.ez-page-styled table input[type="number"],.ez-page-styled table input[type="time"],.ez-page-styled table input[type="date"],.ez-page-styled table select,.ez-page-styled table textarea{font-family:Cairo,sans-serif!important;font-weight:700!important;color:#1e1b4b!important;font-size:12px!important;border:1px solid rgba(129,140,248,0.1)!important;border-radius:6px!important;padding:3px 5px!important;background:rgba(255,255,255,0.8)!important;transition:all 0.25s!important}\
.ez-page-styled table input:focus,.ez-page-styled table select:focus,.ez-page-styled table textarea:focus{border-color:#818cf8!important;box-shadow:0 0 0 2px rgba(129,140,248,0.1)!important;background:#fff!important}\
.ez-page-styled table input[type="checkbox"]{width:18px!important;height:18px!important;accent-color:#6366f1!important;cursor:pointer!important}\
.ez-toast{position:fixed;bottom:30px;right:30px;background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);padding:12px 16px;border-radius:14px;box-shadow:0 10px 35px rgba(45,43,58,0.12),0 2px 8px rgba(0,0,0,0.06);z-index:999999;display:flex;align-items:center;gap:10px;font-family:Cairo,sans-serif;transform:translateX(400px);opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);border:1px solid rgba(129,140,248,0.1)}\
.ez-toast.show{transform:translateX(0);opacity:1}\
.ez-toast-icon{font-size:18px}\
.ez-toast-msg{font-size:13px;font-weight:700;color:#1e1b4b}\
.ez-toast-success{border-right:4px solid #10b981}\
.ez-toast-error{border-right:4px solid #ef4444}\
.ez-toast-info{border-right:4px solid #818cf8}\
.ez-toast-warning{border-right:4px solid #f59e0b}\
.ez-loader-spinner{width:40px;height:40px;border:4px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}\
.ez-loader-text{font-size:14px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif}\
table td,table th{border:1px solid rgba(129,140,248,0.08)!important}\
\
body.ez-dark-mode{background:#0f0f23!important;color:#e2e8f0!important}\
body.ez-dark-mode *:not(.ez-dialog-v2):not(.ez-dialog-v2 *):not([id^="ez-"]):not([id^="ez-"] *):not(.ez-toast):not(.ez-toast *){background-color:#1a1a2e!important;color:#e2e8f0!important;border-color:rgba(129,140,248,0.15)!important}\
body.ez-dark-mode table{background:#1a1a2e!important}\
body.ez-dark-mode table th{background:linear-gradient(180deg,#1e1b4b,#0f0f23)!important;color:#c7d2fe!important}\
body.ez-dark-mode table td{background:#16162a!important;color:#e2e8f0!important}\
body.ez-dark-mode table tr:hover td{background:#1e1e3a!important}\
body.ez-dark-mode input,body.ez-dark-mode textarea,body.ez-dark-mode select{background:#16162a!important;color:#e2e8f0!important;border-color:rgba(129,140,248,0.2)!important}\
body.ez-dark-mode .form-control{background:#16162a!important;color:#e2e8f0!important}\
body.ez-dark-mode a{color:#818cf8!important}\
body.ez-dark-mode button:not(.ez-pill):not(.ez-btn-primary):not(.ez-btn-cancel):not(.ez-btn-doses):not(.ez-btn-icon):not([onclick*="ez"]){background:#1e1e3a!important;color:#c7d2fe!important;border-color:rgba(129,140,248,0.2)!important}\
body.ez-dark-mode label,body.ez-dark-mode span{color:#c7d2fe!important}';
document.head.appendChild(s_style);

/* ══════════════════════════════════════════
   PAGE BEAUTIFICATION
   ══════════════════════════════════════════ */
function beautifyPage(){
  try{
    document.body.classList.add('ez-page-styled');
    var allTables=document.querySelectorAll('table');

    /* ── Style top form section ── */
    var topTable=null;
    for(var i=0;i<allTables.length;i++){
      var txt=allTables[i].innerText.toLowerCase();
      if((txt.indexOf('name')>-1||txt.indexOf('mobile')>-1)&&txt.indexOf('start date')>-1){
        if(allTables[i].querySelectorAll('tr').length<5){topTable=allTables[i];break;}
      }
    }
    if(topTable){
      topTable.style.cssText='background:linear-gradient(145deg,#6366f1,#4f46e5)!important;border:2px solid rgba(79,70,229,0.3)!important;border-radius:16px!important;padding:14px 18px!important;box-shadow:0 6px 24px rgba(99,102,241,0.15),0 2px 8px rgba(0,0,0,0.06)!important;margin-bottom:14px!important;overflow:visible!important;border-collapse:separate!important';
      var topCells=topTable.querySelectorAll('td,th');
      for(var i=0;i<topCells.length;i++){
        topCells[i].style.cssText+='border:none!important;padding:4px 8px!important';
        var txt=(topCells[i].textContent||'').trim();
        if(txt.endsWith(':')){
          topCells[i].style.cssText='font-family:Cairo,sans-serif!important;font-size:10px!important;font-weight:900!important;color:#fff!important;letter-spacing:0.8px!important;border:none!important;padding:2px 8px 0!important;white-space:nowrap!important;text-transform:uppercase!important;text-shadow:0 1px 3px rgba(0,0,0,0.15)!important';
        }
      }
      var topInputs=topTable.querySelectorAll('input,select');
      for(var i=0;i<topInputs.length;i++){
        topInputs[i].style.cssText='font-family:Cairo,sans-serif!important;font-size:14px!important;font-weight:800!important;color:#1e1b4b!important;border:1.5px solid rgba(255,255,255,0.3)!important;border-radius:10px!important;padding:7px 14px!important;background:#fff!important;transition:all 0.25s!important;outline:none!important;box-shadow:0 2px 8px rgba(0,0,0,0.08)!important;width:100%!important;min-width:120px!important';
      }
    }

    /* ── Style main data table columns ── */
    var dataTable=null;
    for(var i=0;i<allTables.length;i++){
      var txt=allTables[i].innerText.toLowerCase();
      if((txt.indexOf('qty')>-1||txt.indexOf('quantity')>-1)&&txt.indexOf('note')>-1){
        dataTable=allTables[i];break;
      }
    }
    if(dataTable){
      var ths=dataTable.querySelectorAll('th');
      var colMap={};
      for(var i=0;i<ths.length;i++){
        var t=ths[i].textContent.trim().toLowerCase();
        colMap[t]=i;
        if(t==='#') ths[i].innerHTML='#️⃣';
        else if(t==='code') ths[i].innerHTML='🔑 Code';
        else if(t==='name'||t==='item') ths[i].innerHTML='💊 Name';
        else if(t==='qty') ths[i].innerHTML='📦 QTY';
        else if(t==='size') ths[i].innerHTML='📏 Size';
        else if(t==='dose') ths[i].innerHTML='💉 Dose';
        else if(t.indexOf('every')>-1||t.indexOf('evry')>-1) ths[i].innerHTML='⏰ Every';
        else if(t==='start time') ths[i].innerHTML='🕐 Time';
        else if(t==='note') ths[i].innerHTML='📝 Note';
        else if(t==='start date') ths[i].innerHTML='📅 Start';
        else if(t==='end date') ths[i].innerHTML='📅 End';
        else if(t==='expiry') ths[i].innerHTML='⏳ Exp';
        else if(t==='remaining') ths[i].innerHTML='📊';
        else if(t==='critical') ths[i].innerHTML='🚨';
        else if(t==='action') ths[i].innerHTML='⚡';
      }
      var ri=colMap['remaining'];
      var nmi2=colMap['name']!==undefined?colMap['name']:colMap['item'];
      if(ri!==undefined){ths[ri].style.cssText+='width:35px!important;min-width:35px!important;max-width:40px!important;padding:10px 2px!important';}
      if(nmi2!==undefined){ths[nmi2].style.cssText+='min-width:210px!important';}
      if(colMap['#']!==undefined){ths[colMap['#']].style.cssText+='width:28px!important;min-width:28px!important;padding:10px 2px!important';}
      if(colMap['critical']!==undefined){ths[colMap['critical']].style.cssText+='width:40px!important;min-width:40px!important;padding:10px 2px!important';}
      if(colMap['action']!==undefined){ths[colMap['action']].style.cssText+='width:58px!important;min-width:58px!important';}

      var rows=dataTable.querySelectorAll('tr');
      for(var r=1;r<rows.length;r++){
        var tds=rows[r].querySelectorAll('td');
        if(ri!==undefined&&tds[ri]){tds[ri].style.cssText+='text-align:center!important;width:35px!important;max-width:40px!important;padding:5px 2px!important;font-size:11px!important';}
        if(nmi2!==undefined&&tds[nmi2]){tds[nmi2].style.cssText+='font-weight:800!important;color:#312e81!important;font-size:11.5px!important';}
        if(colMap['critical']!==undefined&&tds[colMap['critical']]){tds[colMap['critical']].style.cssText+='text-align:center!important;width:40px!important;font-size:11px!important;padding:5px 2px!important';}
      }
    }

    /* ── Style buttons ── */
    var allBtns=document.querySelectorAll('button,input[type="button"],input[type="submit"],a.btn,a');
    for(var i=0;i<allBtns.length;i++){
      var txt=(allBtns[i].innerText||allBtns[i].value||'').toLowerCase();
      if(txt.indexOf('import')>-1&&txt.indexOf('invoice')>-1){
        allBtns[i].style.cssText='background:linear-gradient(145deg,#818cf8,#6366f1)!important;color:#fff!important;border:none!important;padding:8px 20px!important;border-radius:12px!important;font-size:13px!important;font-weight:800!important;cursor:pointer!important;font-family:Cairo,sans-serif!important;box-shadow:0 4px 14px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -2px 0 rgba(0,0,0,0.1)!important;transition:all 0.3s!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important';
      }
      if(txt.indexOf('duplicate')>-1){
        allBtns[i].style.cssText='background:linear-gradient(145deg,#f59e0b,#d97706)!important;color:#fff!important;border:none!important;padding:4px 12px!important;border-radius:8px!important;font-size:11px!important;font-weight:800!important;cursor:pointer!important;font-family:Cairo,sans-serif!important;box-shadow:0 3px 10px rgba(245,158,11,0.2),inset 0 1px 0 rgba(255,255,255,0.2)!important;transition:all 0.3s!important;text-decoration:none!important';
      }
    }

    /* ── Delivery Time label ── */
    var allEls=document.querySelectorAll('span,div,label,td');
    for(var i=0;i<allEls.length;i++){
      var txt=(allEls[i].textContent||'').trim();
      if(txt.indexOf('Delivery Time:')>-1&&txt.length<100){
        allEls[i].style.cssText='font-family:Cairo,sans-serif!important;font-size:12px!important;font-weight:700!important;color:#4338ca!important;background:rgba(129,140,248,0.06)!important;padding:6px 14px!important;border-radius:10px!important;border:1px solid rgba(129,140,248,0.12)!important;display:inline-block!important;margin:6px 0!important';
      }
    }
  }catch(e){console.log('EZ beautify:',e);}
}

/* ══════════════════════════════════════════
   MAIN DIALOG - NEW PROFESSIONAL DESIGN
   ══════════════════════════════════════════ */
var hasDuplicateNotes=scanForDuplicateNotes();

var d_box=document.createElement('div');
d_box.id='ez-dialog-box';
d_box.className='ez-dialog-v2';
d_box.setAttribute('data-m',String(savedSettings.m||1));
d_box.setAttribute('data-t',String(savedSettings.t||30));
var _m=savedSettings.m||1,_t=savedSettings.t||30,_ad=savedSettings.autoDuration!==false,_sw=savedSettings.showWarnings!==false,_dk=savedSettings.darkMode||false;
d_box.innerHTML='\
<div class="ez-header">\
  <div class="ez-logo-group">\
    <div class="ez-logo">💊</div>\
    <div class="ez-title-block">\
      <div class="ez-title">EZ_Pill Farmadosis</div>\
      <div class="ez-subtitle">معالج الجرعات الذكي</div>\
    </div>\
  </div>\
  <div class="ez-header-actions">\
    <div class="ez-version">v'+APP_VERSION+'</div>\
    <button class="ez-btn-icon" onclick="window.ezToggleDark()" title="الوضع الليلي" style="font-size:14px">'+(_dk?'☀️':'🌙')+'</button>\
    <button class="ez-btn-icon ez-btn-icon-min" onclick="window.ezMinimize()">−</button>\
  </div>\
</div>\
<div class="ez-content">\
  <div class="ez-section-label"><span class="dot"></span> الأشهر</div>\
  <div class="ez-pill-group">\
    <button class="ez-pill '+(_m===1?'active':'')+'" onclick="window.ezSelect(this,\'m\',1)">1</button>\
    <button class="ez-pill '+(_m===2?'active':'')+'" onclick="window.ezSelect(this,\'m\',2)">2</button>\
    <button class="ez-pill '+(_m===3?'active':'')+'" onclick="window.ezSelect(this,\'m\',3)">3</button>\
  </div>\
  <div class="ez-section-label"><span class="dot"></span> أيام الشهر</div>\
  <div class="ez-pill-group">\
    <button class="ez-pill '+(_t===28?'active':'')+'" onclick="window.ezSelect(this,\'t\',28)">28</button>\
    <button class="ez-pill '+(_t===30?'active':'')+'" onclick="window.ezSelect(this,\'t\',30)">30</button>\
  </div>\
  <div class="ez-sep"></div>\
  <label class="ez-toggle-row">\
    <div class="ez-switch"><input type="checkbox" id="auto-duration" '+(_ad?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">استخراج المدة تلقائياً</span>\
    <span class="ez-toggle-icon">✨</span>\
  </label>\
  <label class="ez-toggle-row">\
    <div class="ez-switch"><input type="checkbox" id="show-warnings" '+(_sw?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">عرض التحذيرات</span>\
    <span class="ez-toggle-icon">⚠️</span>\
  </label>\
  <label class="ez-toggle-row">\
    <div class="ez-switch"><input type="checkbox" id="show-post-dialog" '+(hasDuplicateNotes?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">خيارات إضافية'+(hasDuplicateNotes?' <span class="auto-tag">تقسيم مكتشف</span>':'')+'</span>\
    <span class="ez-toggle-icon">⚙️</span>\
  </label>\
  <div class="ez-actions">\
    <button class="ez-btn-primary" onclick="window.ezSubmit()">⚡ بدء المعالجة</button>\
    <button class="ez-btn-doses" onclick="window.ezShowDoses()" title="عرض الجرعات">📋</button>\
    <button class="ez-btn-cancel" onclick="window.ezCancel()">✖</button>\
  </div>\
</div>\
<div class="ez-footer">EZ_PILL FARMADOSIS · V'+APP_VERSION+' · علي الباز</div>';

document.body.appendChild(d_box);
if(_dk) document.body.classList.add('ez-dark-mode');

document.addEventListener('keydown',function(e){
  if(e.key==='Enter'){var sub=document.querySelector('.ez-btn-primary');if(sub)sub.click();}
  else if(e.key==='Escape'){window.ezCancel();}
});

makeDraggable(d_box);
beautifyPage();
showWhatsNew();

/* ══════════════════════════════════════════
   NAME EXTRACTION FROM PRESCRIPTION NOTES
   ══════════════════════════════════════════ */
function extractAndConfirmName(){
  try{
    /* Find Prescription Notes field */
    function findNotesField(){
      var inputs=document.querySelectorAll('input[type="text"],textarea');
      for(var i=0;i<inputs.length;i++){
        var lbl=null;
        /* Check associated label */
        if(inputs[i].id){lbl=document.querySelector('label[for="'+inputs[i].id+'"]');}
        if(!lbl){var prev=inputs[i].previousElementSibling;if(prev) lbl=prev;}
        if(!lbl){var parent=inputs[i].parentElement;if(parent){var spans=parent.querySelectorAll('label,span,b,strong,td');for(var j=0;j<spans.length;j++){var st=spans[j].textContent.toLowerCase();if(st.indexOf('prescription')>-1||st.indexOf('note')>-1){lbl=spans[j];break;}}}}
        if(lbl){
          var lt=(lbl.textContent||'').toLowerCase();
          if(lt.indexOf('prescription')>-1&&lt.indexOf('note')>-1) return inputs[i];
        }
        /* Check by name/id/placeholder */
        var attrs=(inputs[i].name||'')+(inputs[i].id||'')+(inputs[i].placeholder||'');
        if(/presc.*note|prescription.*note/i.test(attrs)) return inputs[i];
      }
      /* Last resort: large text input with Arabic content */
      for(var i=0;i<inputs.length;i++){
        var v=inputs[i].value||'';
        if(v.length>30&&/[\u0600-\u06FF]/.test(v)&&(/ضيف|اسم|توصيل|صيدل/i.test(v))) return inputs[i];
      }
      return null;
    }

    /* Extract name from text */
    function extractName(text){
      if(!text||text.length<5) return null;
      var s=text.trim();

      /* Patterns ordered by specificity */
      var patterns=[
        /(?:اسم\s*(?:ال)?ضيف[ةه]?)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:اسم\s*(?:ال)?مريض[ةه]?)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:اسم\s*(?:ال)?عمي[لة]?)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:تغيير\s*الاسم\s*(?:ال[يى]|ل))\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:يكتب\s*(?:عليه|عليها)?\s*اسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:كتاب[ةه]\s*اسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:وكتاب[ةه]\s*اسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:باسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:الاسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i
      ];

      /* Stop words - remove from end of extracted name */
      var stopWords=['وتوصيل','والتوصيل','وشكر','وشكرا','للضيف','للضيفه','للمريض','للمريضه',
        'وجعل','والتغيير','بصندوق','بالحمدانيه','بالحمدانية','برجاء','الرجاء','صيدلية','صيدليه',
        'للضروره','للضرورة','طلبات','طلب','وكتابه','وكتابة','الى','الي','على','عند','اليوم',
        'شهر','لثلاث','لشهر','بوكس','دمج','دمجهم','توصيل','توصيلهم','والتوصيل','في'];

      for(var p=0;p<patterns.length;p++){
        var m=s.match(patterns[p]);
        if(m&&m[1]){
          var name=m[1].trim();
          /* Remove stop words from end */
          var words=name.split(/\s+/);
          var cleaned=[];
          for(var w=0;w<words.length;w++){
            var wl=words[w].replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
            var isStop=false;
            for(var st=0;st<stopWords.length;st++){
              if(wl===stopWords[st].replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')){isStop=true;break;}
            }
            if(isStop) break;
            /* Skip single-letter words unless first */
            if(words[w].length<=1&&cleaned.length>0) break;
            cleaned.push(words[w]);
          }
          if(cleaned.length>=1&&cleaned.join(' ').length>=3){
            return cleaned.join(' ');
          }
        }
      }
      return null;
    }

    /* Find Name input in top form */
    function findNameField(){
      /* Direct ID match */
      var direct=document.getElementById('pname');
      if(direct) return direct;
      var inp=document.querySelector('input[id*="name" i]:not([id*="user"]):not([type="hidden"]):not([id*="mobile"]):not([id*="phone"])');
      if(inp) return inp;
      inp=document.querySelector('input[placeholder*="Patient Name" i]');
      if(inp) return inp;
      /* Search by label */
      var labels=document.querySelectorAll('td,th,label,span');
      for(var i=0;i<labels.length;i++){
        var lt=labels[i].textContent.trim().toLowerCase();
        if(lt==='name:'||lt==='name'){
          var parent2=labels[i].parentElement;
          if(parent2){
            var nextTd=parent2.nextElementSibling;
            if(nextTd){var nInp3=nextTd.querySelector('input');if(nInp3) return nInp3;}
          }
        }
      }
      return null;
    }

    var notesField=findNotesField();
    if(!notesField) return;
    var notesText=(notesField.value||'').trim();
    if(!notesText) return;
    var extractedName=extractName(notesText);
    if(!extractedName) return;
    var nameField=findNameField();
    if(!nameField) return;

    /* Show as gentle slide-down banner */
    var banner=document.createElement('div');
    banner.id='ez-name-confirm';
    banner.style.cssText='position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:460px;max-width:94vw;z-index:9999999;transition:top 0.6s cubic-bezier(0.16,1,0.3,1);font-family:Cairo,sans-serif';

    banner.innerHTML='\
    <div style="background:#fff;border-radius:0 0 18px 18px;overflow:hidden;box-shadow:0 12px 40px rgba(99,102,241,0.15),0 4px 12px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.12);border-top:none">\
      <div style="height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa,#818cf8);background-size:200% 100%;animation:barShift 4s ease infinite"></div>\
      <div style="padding:14px 18px 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(129,140,248,0.06)">\
        <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(145deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(99,102,241,0.2);flex-shrink:0">👤</div>\
        <div style="flex:1"><div style="font-size:13px;font-weight:800;color:#1e1b4b">تم اكتشاف اسم في الملاحظات</div></div>\
        <button id="ez-name-no" style="width:28px;height:28px;border:none;border-radius:8px;font-size:14px;cursor:pointer;color:#94a3b8;background:rgba(148,163,184,0.08);display:flex;align-items:center;justify-content:center;transition:all 0.25s;flex-shrink:0">✕</button>\
      </div>\
      <div style="padding:12px 18px">\
        <div style="background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.08);border-radius:10px;padding:8px 12px;margin-bottom:10px;direction:rtl;max-height:50px;overflow-y:auto">\
          <div style="font-size:11px;font-weight:700;color:#64748b;line-height:1.6">'+notesText.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>\
        </div>\
        <div style="display:flex;align-items:center;gap:10px;direction:rtl">\
          <div style="flex:1;background:linear-gradient(145deg,#ecfdf5,#d1fae5);border:1.5px solid rgba(16,185,129,0.15);border-radius:10px;padding:8px 14px;text-align:center">\
            <div style="font-size:9px;font-weight:800;color:#047857;letter-spacing:0.5px;margin-bottom:2px">الاسم المستخلص</div>\
            <div style="font-size:18px;font-weight:900;color:#064e3b" id="ez-extracted-name">'+extractedName+'</div>\
            <input type="text" id="ez-name-edit" value="'+extractedName+'" style="display:none;width:100%;padding:4px 8px;border:1px solid rgba(16,185,129,0.2);border-radius:8px;font-size:16px;font-weight:800;color:#064e3b;text-align:center;font-family:Cairo,sans-serif;outline:none;direction:rtl;margin-top:2px" />\
          </div>\
        </div>\
      </div>\
      <div style="padding:8px 18px 14px;display:flex;gap:6px">\
        <button id="ez-name-ok" style="flex:1;height:38px;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 3px 10px rgba(16,185,129,0.2);transition:all 0.3s">✅ تأكيد وكتابة الاسم</button>\
        <button id="ez-name-edit-btn" style="height:38px;padding:0 12px;border:none;border-radius:10px;font-size:14px;cursor:pointer;font-family:Cairo,sans-serif;color:#6366f1;background:rgba(129,140,248,0.06);border:1px solid rgba(129,140,248,0.12);transition:all 0.3s;display:flex;align-items:center;justify-content:center">✏️</button>\
      </div>\
    </div>';

    document.body.appendChild(banner);
    /* Smooth slide down */
    setTimeout(function(){banner.style.top='0px';},50);

    function closeBanner(){
      banner.style.top='-200px';
      setTimeout(function(){banner.remove();},600);
    }

    /* Edit mode toggle */
    var editMode=false;
    document.getElementById('ez-name-edit-btn').addEventListener('click',function(){
      var display=document.getElementById('ez-extracted-name');
      var input=document.getElementById('ez-name-edit');
      if(!editMode){
        display.style.display='none';
        input.style.display='block';
        input.focus();
        input.select();
        this.innerHTML='💾';
        this.style.color='#10b981';
        editMode=true;
      } else {
        var newVal=input.value.trim();
        if(newVal){display.textContent=newVal;}
        display.style.display='block';
        input.style.display='none';
        this.innerHTML='✏️';
        this.style.color='#6366f1';
        editMode=false;
      }
    });

    /* Confirm */
    document.getElementById('ez-name-ok').addEventListener('click',function(){
      var finalName=editMode?document.getElementById('ez-name-edit').value.trim():document.getElementById('ez-extracted-name').textContent.trim();
      if(finalName&&nameField){
        nameField.value=finalName;
        nameField.dispatchEvent(new Event('input',{bubbles:true}));
        nameField.dispatchEvent(new Event('change',{bubbles:true}));
        if(typeof angular!=='undefined'){try{angular.element(nameField).triggerHandler('change');}catch(e){}}
        if(typeof jQuery!=='undefined'){try{jQuery(nameField).trigger('change');}catch(e){}}
        window.ezShowToast('تم كتابة الاسم: '+finalName+' ✅','success');
      }
      closeBanner();
    });

    /* Reject */
    document.getElementById('ez-name-no').addEventListener('click',function(){
      closeBanner();
    });

    /* Auto-dismiss after 30 seconds if no action */
    setTimeout(function(){if(document.getElementById('ez-name-confirm'))closeBanner();},30000);

  }catch(e){console.log('EZ NameExtract:',e);}
}

/* ══════════════════════════════════════════
   IMPORT INVOICE - SMART SEARCH
   ══════════════════════════════════════════ */
(function(){
  /* Get current invoice number from main page */
  function getCurrentInvoice(){
    var allEls=document.querySelectorAll('td,span,div,label,input,b,strong');
    for(var i=0;i<allEls.length;i++){
      var txt=(allEls[i].textContent||'').trim();
      if(txt.toLowerCase().indexOf('invoice')>-1){
        var next=allEls[i].nextElementSibling;
        if(next){
          var val=(next.value||next.textContent||'').trim();
          if(val&&/\d{5,}/.test(val)) return val.replace(/\D/g,'');
        }
        var parent=allEls[i].parentElement;
        if(parent){
          var inp=parent.querySelector('input');
          if(inp&&inp.value&&/\d{5,}/.test(inp.value)) return inp.value.trim();
        }
      }
    }
    /* Try finding in top form area by pattern */
    var inputs=document.querySelectorAll('input[type="text"],input:not([type])');
    for(var i=0;i<inputs.length;i++){
      var v=inputs[i].value||'';
      if(/^0\d{8,}$/.test(v.trim())) return v.trim();
    }
    /* Try from URL or page content */
    var bodyText=document.body.innerText;
    var invMatch=bodyText.match(/Invoice\s*(?:Number|No|#)?[:\s]*(\d{8,})/i);
    if(invMatch) return invMatch[1];
    return '';
  }

  var currentInvoice=getCurrentInvoice();
  var searchInjected=false;

  function injectSearch(){
    var modal=document.querySelector('#exampleModal');
    if(!modal) return;
    var modalBody=modal.querySelector('.modal-body');
    if(!modalBody) return;
    if(modal.querySelector('.ez-search-box')) return;

    var tb=modalBody.querySelector('table');
    if(!tb) return;

    /* Build search UI */
    var box=document.createElement('div');
    box.className='ez-search-box';
    box.style.cssText='display:flex;gap:10px;padding:14px 18px;margin:0 0 12px;background:linear-gradient(145deg,#f8f7ff,#eef2ff);border:1.5px solid rgba(129,140,248,0.15);border-radius:14px;font-family:Cairo,sans-serif;align-items:stretch;box-shadow:0 2px 10px rgba(99,102,241,0.06);position:relative;z-index:5';

    /* Invoice search */
    var invWrap=document.createElement('div');
    invWrap.style.cssText='flex:1;position:relative';
    invWrap.innerHTML='\
      <label style="display:block;font-size:9px;font-weight:900;color:#6366f1;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">🔍 Invoice Number</label>\
      <div style="position:relative">\
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:800;color:#d4d4e0;pointer-events:none;font-family:Cairo,sans-serif;letter-spacing:1px" id="ez-inv-ghost">0</span>\
        <input type="text" id="ez-inv-search" placeholder="رقم الفاتورة..." style="width:100%;padding:9px 14px;padding-right:24px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:14px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif;outline:none;background:#fff;box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);transition:all 0.25s;direction:ltr;text-align:left" />\
      </div>';
    box.appendChild(invWrap);

    /* ERX search */
    var erxWrap=document.createElement('div');
    erxWrap.style.cssText='flex:1;position:relative';
    erxWrap.innerHTML='\
      <label style="display:block;font-size:9px;font-weight:900;color:#8b5cf6;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">🔍 ERX Number</label>\
      <div style="position:relative">\
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:800;color:#d4d4e0;pointer-events:none;font-family:Cairo,sans-serif;letter-spacing:0.5px" id="ez-erx-ghost">ERX-</span>\
        <input type="text" id="ez-erx-search" placeholder="رقم الطلب..." style="width:100%;padding:9px 14px;padding-right:48px;border:1.5px solid rgba(139,92,246,0.15);border-radius:10px;font-size:14px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif;outline:none;background:#fff;box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);transition:all 0.25s;direction:ltr;text-align:left" />\
      </div>';
    box.appendChild(erxWrap);

    /* Result counter */
    var counter=document.createElement('div');
    counter.id='ez-search-counter';
    counter.style.cssText='display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:50px;background:linear-gradient(145deg,#818cf8,#6366f1);border-radius:10px;padding:4px 10px;box-shadow:0 3px 10px rgba(99,102,241,0.2),inset 0 1px 0 rgba(255,255,255,0.2)';
    counter.innerHTML='<div style="font-size:18px;font-weight:900;color:#fff;line-height:1" id="ez-match-count">-</div><div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.5px">نتيجة</div>';
    box.appendChild(counter);

    modalBody.insertBefore(box,modalBody.firstChild);

    /* ── Search Logic ── */
    function getAllRows(){
      return Array.from(tb.querySelectorAll('tr')).slice(1);
    }

    function getRowAllText(row){
      var txt=(row.innerText||row.textContent||'').trim();
      /* Also grab onclick attributes from buttons */
      var btns=row.querySelectorAll('button[onclick]');
      for(var b=0;b<btns.length;b++){txt+=' '+(btns[b].getAttribute('onclick')||'');}
      /* Also grab input values */
      var inps=row.querySelectorAll('input,textarea,select');
      for(var b=0;b<inps.length;b++){txt+=' '+(inps[b].value||'');}
      return txt;
    }

    function doSearch(){
      var invVal=(document.getElementById('ez-inv-search').value||'').trim();
      var erxVal=(document.getElementById('ez-erx-search').value||'').trim();
      /* Strip non-digits for invoice search */
      var invDigits=invVal.replace(/\D/g,'');
      var rows=getAllRows();
      var matched=[];
      var unmatched=[];
      var hasSearch=invDigits.length>0||erxVal.length>0;

      /* Update ghost visibility */
      var invGhost=document.getElementById('ez-inv-ghost');
      var erxGhost=document.getElementById('ez-erx-ghost');
      if(invGhost) invGhost.style.display=invDigits.length>0?'none':'block';
      if(erxGhost) erxGhost.style.display=erxVal.length>0?'none':'block';

      rows.forEach(function(r){
        var allText=getRowAllText(r);
        var isMatch=true;

        /* Invoice search: find any number containing the search digits */
        if(invDigits.length>0){
          if(allText.indexOf(invDigits)===-1) isMatch=false;
        }

        /* ERX search: smart match */
        if(erxVal.length>0){
          var searchUpper=erxVal.toUpperCase();
          var allUpper=allText.toUpperCase();
          var searchDigitsOnly=erxVal.replace(/[^0-9]/g,'');
          var erxFound=false;
          /* Direct text match */
          if(allUpper.indexOf(searchUpper)>-1) erxFound=true;
          /* Smart: user typed just digits - find in ERX numbers */
          if(!erxFound&&searchDigitsOnly.length>0){
            var erxMatches=allUpper.match(/ERX-(\d+)/g);
            if(erxMatches){
              for(var e=0;e<erxMatches.length;e++){
                var erxD=erxMatches[e].replace(/[^0-9]/g,'');
                if(erxD.indexOf(searchDigitsOnly)>-1||erxD.endsWith(searchDigitsOnly)){erxFound=true;break;}
              }
            }
            /* Also try plain number match anywhere */
            if(!erxFound&&allText.indexOf(searchDigitsOnly)>-1) erxFound=true;
          }
          if(!erxFound) isMatch=false;
        }

        if(!hasSearch||isMatch) matched.push(r);
        else unmatched.push(r);

        /* Highlight/unhighlight */
        if(hasSearch&&isMatch){
          r.style.cssText='background:rgba(129,140,248,0.06)!important;border-right:3px solid #818cf8!important;transition:all 0.3s!important';
        } else if(hasSearch&&!isMatch){
          r.style.cssText='opacity:0.35!important;transition:all 0.3s!important';
        } else {
          r.style.cssText='transition:all 0.3s!important';
        }

        /* Protect current invoice - disable Import button */
        if(currentInvoice&&allText.indexOf(currentInvoice)>-1){
          var btns=r.querySelectorAll('button');
          btns.forEach(function(b){
            var bt=(b.innerText||'').toLowerCase();
            if(bt.indexOf('import')>-1){
              b.disabled=true;
              b.style.cssText='background:#94a3b8!important;color:#fff!important;border:none!important;padding:4px 12px!important;border-radius:8px!important;font-size:11px!important;font-weight:700!important;cursor:not-allowed!important;font-family:Cairo,sans-serif!important;opacity:0.6!important';
              b.innerHTML='✅ الحالي';
            }
          });
        }
      });

      /* Reorder: matched first, then unmatched */
      if(hasSearch){
        var parent=tb.querySelector('tbody')||tb;
        matched.forEach(function(r){parent.appendChild(r);});
        unmatched.forEach(function(r){parent.appendChild(r);});
      }

      /* Update counter */
      var countEl=document.getElementById('ez-match-count');
      if(countEl){
        if(hasSearch) countEl.textContent=matched.length;
        else countEl.textContent=rows.length;
      }
    }

    /* Bind events */
    var invInput=document.getElementById('ez-inv-search');
    var erxInput=document.getElementById('ez-erx-search');
    if(invInput) invInput.addEventListener('input',doSearch);
    if(erxInput) erxInput.addEventListener('input',doSearch);

    /* Focus animation */
    [invInput,erxInput].forEach(function(inp){
      if(!inp) return;
      inp.addEventListener('focus',function(){this.style.borderColor='#818cf8';this.style.boxShadow='0 0 0 3px rgba(129,140,248,0.12)';});
      inp.addEventListener('blur',function(){this.style.borderColor='rgba(129,140,248,0.15)';this.style.boxShadow='inset 0 1px 3px rgba(0,0,0,0.04)';});
    });

    /* Style modal itself */
    var modalContent=modal.querySelector('.modal-content');
    if(modalContent){
      modalContent.style.cssText+='border-radius:18px!important;border:2px solid rgba(129,140,248,0.15)!important;overflow:hidden!important;box-shadow:0 20px 60px rgba(99,102,241,0.15),0 4px 16px rgba(0,0,0,0.06)!important';
    }
    var modalHeader=modal.querySelector('.modal-header');
    if(modalHeader){
      modalHeader.style.cssText+='background:linear-gradient(145deg,#6366f1,#4f46e5)!important;border-bottom:2px solid #4338ca!important;padding:14px 20px!important';
      var title=modalHeader.querySelector('.modal-title,h4,h5');
      if(title) title.style.cssText='color:#fff!important;font-family:Cairo,sans-serif!important;font-weight:900!important;font-size:16px!important;text-shadow:0 1px 3px rgba(0,0,0,0.15)!important';
      var closeBtn=modalHeader.querySelector('button.close,[data-dismiss="modal"]');
      if(closeBtn) closeBtn.style.cssText+='color:#fff!important;opacity:0.8!important;text-shadow:none!important;font-size:22px!important';
    }

    /* Style modal table header */
    var mThs=tb.querySelectorAll('th');
    for(var i=0;i<mThs.length;i++){
      mThs[i].style.cssText='background:linear-gradient(145deg,#818cf8,#6366f1)!important;color:#fff!important;font-size:11px!important;font-weight:800!important;padding:8px 6px!important;text-align:center!important;border:none!important;border-left:1px solid rgba(255,255,255,0.12)!important;white-space:nowrap!important;font-family:Cairo,sans-serif!important;text-shadow:0 1px 2px rgba(0,0,0,0.15)!important;position:sticky!important;top:0!important;z-index:2!important';
    }

    /* Style modal table */
    tb.style.cssText+='border-collapse:separate!important;border-spacing:0!important;width:100%!important;font-family:Cairo,sans-serif!important;border-radius:10px!important;overflow:hidden!important';

    /* Init counter */
    doSearch();
    searchInjected=true;
  }

  /* Watch for modal open */
  var modal=document.querySelector('#exampleModal');
  if(modal){
    var observer=new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.attributeName==='style'||m.attributeName==='class'){
          var isVisible=modal.classList.contains('show')||
                        modal.style.display==='block'||
                        getComputedStyle(modal).display!=='none';
          if(isVisible&&!searchInjected){
            setTimeout(injectSearch,200);
          }
          if(!isVisible) searchInjected=false;
        }
      });
    });
    observer.observe(modal,{attributes:true});

    /* Also hook the button click */
    var importBtn=document.getElementById('importinv');
    if(importBtn){
      importBtn.addEventListener('click',function(){
        searchInjected=false;
        setTimeout(injectSearch,500);
      });
    }
  }
})();

})();

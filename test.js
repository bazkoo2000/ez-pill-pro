javascript:(function(){
var APP_VERSION='136.7';
/* Load font non-blocking (single request) */
if(!document.getElementById('ez-cairo-font')){var _lnk=document.createElement('link');_lnk.id='ez-cairo-font';_lnk.rel='stylesheet';_lnk.href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';document.head.appendChild(_lnk);}
var APP_NAME='EZ_Pill Farmadosis';

/* ══════════════════════════════════════════
   WHAT'S NEW - CHANGELOG SYSTEM
   ══════════════════════════════════════════ */
var CHANGELOG={
  '136.3':{
    title:'إصلاح الأوقات والتحذيرات 🕐⚠️',
    features:[
      {icon:'🕐',text:'إصلاح: "قبل الأكل مرتين" → 8:00 (كان 9:00)'},
      {icon:'🍽️',text:'إضافة: "قبل/بعد الغذاء" و "الغداء" → 13:00/14:00'},
      {icon:'⚠️',text:'تحذير للجرعات غير المفهومة'},
      {icon:'📝',text:'النوت الفاضي → وقت افتراضي 9:00'}
    ]
  },
  '136.2':{
    title:'تصليح حساب تواريخ رمضان النهائي 🌙✅',
    features:[
      {icon:'✅',text:'إصلاح التعارض بين الدالتين في حساب التواريخ'},
      {icon:'📅',text:'الفطار: لا تزيد شيء (15→16 تم بالفعل) = يوم 16 ✓'},
      {icon:'🌙',text:'السحور: تزيد يوم واحد فقط (16+1) = يوم 17 ✓'}
    ]
  },
  '136.0':{
    title:'وضع رمضان + لوحة إعدادات 🌙⚙️',
    features:[
      {icon:'🌙',text:'سويتش وضع رمضان - تحويل الجرعات لأوقات الفطار والسحور'},
      {icon:'🕌',text:'4 أوقات رمضان: قبل الفطار · بعد الفطار · قبل السحور · بعد السحور'},
      {icon:'⚙️',text:'لوحة إعدادات محمية برقم سري - تعديل الأوقات والأكواد'},
      {icon:'💊',text:'إضافة/تعديل/حذف أكواد الأصناف ذات الحجم الثابت'},
      {icon:'🗓️',text:'إدارة أكواد الجرعات الأسبوعية'},
      {icon:'⏰',text:'تخصيص جميع أوقات الجرعات (عادية + رمضان)'},
      {icon:'💾',text:'جميع التعديلات تُحفظ في المتصفح وتبقى حتى بعد الإغلاق'}
    ]
  },
  '135.0':{
    title:'تصميم جديد بالكامل 🎨',
    features:[
      {icon:'✨',text:'دايلوج جديد بتصميم Glassmorphism مع تأثيرات Shimmer'},
      {icon:'📅',text:'أزرار الأشهر بوصف عربي (شهر / شهرين / ٣ شهور)'},
      {icon:'🔘',text:'Toggles ذكية بتنور لما تتفعّل'},
      {icon:'⚡',text:'زرار المعالجة بتأثير Pulse + progress bar جديد'},
      {icon:'🛡️',text:'Functions موحدة + Column Aliases لحماية من تغيير الأعمدة'},
      {icon:'🔍',text:'Error handling واضح - بيقولك إيه العمود الناقص بالاسم'},
      {icon:'🔁',text:'تنبيه الأصناف المكررة في نفس الطلب'}
    ]
  },
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
var EZ_CUSTOM_KEY='ez_pill_custom';
var EZ_USERS_KEY='ez_pill_users';
/* ── PIN hash (SHA-like simple hash for obfuscation) ── */
function _ezHashPin(pin){var h=0,s=String(pin);for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return 'ezh_'+(h>>>0).toString(36);}
var _EZ_PIN_HASH=_ezHashPin(101093);
/* ── Default Users (Auto-generated by Editor) ── */
var _DEFAULT_USERS = [
  { name: 'على', hash: _ezHashPin(101010) }
];


/* User management */
function loadUsers(){try{var s=localStorage.getItem(EZ_USERS_KEY);if(s)return JSON.parse(s);if(typeof _DEFAULT_USERS!=='undefined'){localStorage.setItem(EZ_USERS_KEY,JSON.stringify(_DEFAULT_USERS));return _DEFAULT_USERS;}return[];}catch(e){return[];}}
function saveUsers(arr){try{localStorage.setItem(EZ_USERS_KEY,JSON.stringify(arr));}catch(e){}}
function authenticatePin(pin){
  var hash=_ezHashPin(pin);
  if(hash===_EZ_PIN_HASH) return {role:'admin',name:'Admin'};
  var users=loadUsers();
  for(var i=0;i<users.length;i++){if(users[i].hash===hash) return {role:'user',name:users[i].name};}
  return null;
}

function loadSettings(){
  try{
    var s=localStorage.getItem(EZ_SETTINGS_KEY);
    return s?JSON.parse(s):{m:1,t:30,autoDuration:true,showWarnings:true,darkMode:false,ramadanMode:false};
  }catch(e){return{m:1,t:30,autoDuration:true,showWarnings:true,darkMode:false,ramadanMode:false};}
}
function saveSettings(obj){
  try{var cur=loadSettings();for(var k in obj)cur[k]=obj[k];localStorage.setItem(EZ_SETTINGS_KEY,JSON.stringify(cur));}catch(e){}
}
function loadCustomConfig(){
  try{var s=localStorage.getItem(EZ_CUSTOM_KEY);return s?JSON.parse(s):{};}catch(e){return{};}
}
function saveCustomConfig(obj){
  try{localStorage.setItem(EZ_CUSTOM_KEY,JSON.stringify(obj));}catch(e){}
}
var savedSettings=loadSettings();
var customConfig=loadCustomConfig();

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
var _defaultFixedSizeCodes={
  '100009926':24,  '100009934':48,  '100010097':20,  '100010652':30,  '100011436':20,  '100011743':30,  '100013167':20,  '100013423':10,  '100013431':15,  '100013562':20,  '100014565':6,  '100015947':24,  '100015955':24,  '100015971':24,  '100015980':24,  '100016106':10,  '100017942':20,  '100023592':30,  '100023875':20,  '100027201':20,  '100030493':40,  '100633972':20,  '100634019':20,  '100684294':30,  '100726280':24,  '101284170':30,  '101826688':20,  '101859640':20,  '102371620':24,  '102988654':48,  '103169239':20,  '103243857':30,  '103437918':30,  '103683617':30
};
var _defaultWeeklyInjections=['102785890','101133232','101943745','101049031','101528656'];
var _defaultNormalTimes={empty:'07:00',beforeMeal:'08:00',beforeBreakfast:'08:00',afterBreakfast:'09:00',morning:'09:30',noon:'12:00',beforeLunch:'13:00',afterLunch:'14:00',afternoon:'15:00',maghrib:'18:00',beforeDinner:'20:00',afterDinner:'21:00',evening:'21:30',bed:'22:00',defaultTime:'09:00'};
var _defaultRamadanTimes={beforeIftar:'18:30',afterIftar:'19:00',beforeSuhoor:'03:00',afterSuhoor:'04:00'};

/* Merge defaults with custom overrides */
var fixedSizeCodes=(function(){var base={};for(var k in _defaultFixedSizeCodes)base[k]=_defaultFixedSizeCodes[k];if(customConfig.fixedSizeCodes){for(var k in customConfig.fixedSizeCodes)base[k]=customConfig.fixedSizeCodes[k];}if(customConfig.removedCodes){for(var i=0;i<customConfig.removedCodes.length;i++)delete base[customConfig.removedCodes[i]];}return base;})();

var weeklyInjections=(function(){var base=_defaultWeeklyInjections.slice();if(customConfig.addedWeekly){for(var i=0;i<customConfig.addedWeekly.length;i++){if(base.indexOf(customConfig.addedWeekly[i])===-1)base.push(customConfig.addedWeekly[i]);}}if(customConfig.removedWeekly){base=base.filter(function(c){return customConfig.removedWeekly.indexOf(c)===-1;});}return base;})();

var NORMAL_TIMES=(function(){var base={};for(var k in _defaultNormalTimes)base[k]=_defaultNormalTimes[k];if(customConfig.normalTimes){for(var k in customConfig.normalTimes)base[k]=customConfig.normalTimes[k];}return base;})();

/* ══════════════════════════════════════════
   RAMADAN MODE CONSTANTS & HELPERS
   ══════════════════════════════════════════ */
var RAMADAN_TIMES=(function(){var base={};for(var k in _defaultRamadanTimes)base[k]=_defaultRamadanTimes[k];if(customConfig.ramadanTimes){for(var k in customConfig.ramadanTimes)base[k]=customConfig.ramadanTimes[k];}return base;})();

/* Map normal meal words to Ramadan equivalents */
function ramadanMapNote(note){
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();

  /* ── Check custom Ramadan keywords FIRST ── */
  if(customConfig.customRamadanRules){
    for(var i=0;i<customConfig.customRamadanRules.length;i++){
      var cr=customConfig.customRamadanRules[i];
      try{if(new RegExp(cr.pattern,'i').test(note)){
        return {meal:cr.meal,label_ar:cr.label_ar||cr.label,label_en:cr.label_en||cr.label,time:cr.time};
      }}catch(e){}
    }
  }
  /* ── Check custom normal keywords mapped to Ramadan ── */
  if(customConfig.customTimeRules){
    for(var i=0;i<customConfig.customTimeRules.length;i++){
      var cr=customConfig.customTimeRules[i];
      try{
        /* Smart matching: normalize both pattern and input for Arabic flexibility */
        var nNote=(note||'').replace(/[أإآ]/g,'ا').replace(/ة/g,'[ةه]').replace(/ى/g,'[يى]');
        var nPat=cr.pattern.replace(/[أإآ]/g,'ا').replace(/ة/g,'[ةه]').replace(/ى/g,'[يى]');
        /* Also try matching without ال التعريف */
        var nPat2=nPat.replace(/^ال/,'(ال)?');
        if(new RegExp(nPat,'i').test(note)||new RegExp(nPat2,'i').test(note)){
          /* Map custom time to nearest Ramadan meal */
          var h=parseInt(cr.time.split(':')[0]);
          var meal,lbl_ar,lbl_en,tm;
          if(h>=15&&h<19){meal='beforeIftar';lbl_ar='قبل الفطار';lbl_en='Before Iftar';tm=RAMADAN_TIMES.beforeIftar;}
          else if(h>=19||h<1){meal='afterIftar';lbl_ar='بعد الفطار';lbl_en='After Iftar';tm=RAMADAN_TIMES.afterIftar;}
          else if(h>=1&&h<4){meal='beforeSuhoor';lbl_ar='قبل السحور';lbl_en='Before Suhoor';tm=RAMADAN_TIMES.beforeSuhoor;}
          else if(h>=4&&h<7){meal='afterSuhoor';lbl_ar='بعد السحور';lbl_en='After Suhoor';tm=RAMADAN_TIMES.afterSuhoor;}
          else{meal='afterIftar';lbl_ar='بعد الفطار';lbl_en='After Iftar';tm=RAMADAN_TIMES.afterIftar;}
          return {meal:meal,label_ar:lbl_ar,label_en:lbl_en,time:tm};
        }
      }catch(e){}
    }
  }
  /* ── SPECIAL: Note mentions BOTH iftar AND suhoor → return special marker for duplicate ── */
  if((/فطار|فطور|فطر|افطار|iftar/i.test(note))&&(/سحور|سحر|suhoor|sahoor/i.test(note))){
    return {meal:'both',label_ar:'فطار + سحور',label_en:'Iftar + Suhoor',time:RAMADAN_TIMES.afterIftar,isBoth:true};
  }

  /* ── CRITICAL: Check Suhoor BEFORE dinner mapping ── */
  /* قبل السحور / before suhoor */
  if(/قبل.*سحور|قبل.*سحر|before.*suhoor|before.*sahoor|before.*sahor/i.test(note)) return {meal:'beforeSuhoor',label_ar:'قبل السحور',label_en:'Before Suhoor',time:RAMADAN_TIMES.beforeSuhoor};
  /* بعد السحور / after suhoor */
  if(/بعد.*سحور|بعد.*سحر|after.*suhoor|after.*sahoor|after.*sahor/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};

  /* ── Check Iftar (Breakfast in Ramadan) ── */
  /* قبل الفطار / before iftar */
  if(/قبل.*فطار|قبل.*فطور|قبل.*افطار|before.*iftar|before.*breakfast/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
  /* بعد الفطار / after iftar */
  if(/بعد.*فطار|بعد.*فطور|بعد.*افطار|after.*iftar|after.*breakfast/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};

  /* ── Map dinner → Suhoor (NOT Iftar) ── */
  /* قبل العشاء / before dinner → قبل السحور */
  if(/قبل.*عشا|قبل.*عشو|قبل.*عشاء|before.*din|before.*sup|before.*dinner|before.*asha/i.test(note)) return {meal:'beforeSuhoor',label_ar:'قبل السحور',label_en:'Before Suhoor',time:RAMADAN_TIMES.beforeSuhoor};
  /* بعد العشاء / after dinner → بعد السحور */
  if(/بعد.*عشا|بعد.*عشو|بعد.*عشاء|after.*din|after.*sup|after.*dinner|after.*asha/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  if(/بعد.*سحور|بعد.*سحر|after.*suhoor|after.*sahoor|after.*sahor/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  /* قبل الفطار / before iftar (explicit) */
  if(/قبل.*فطار|قبل.*فطر|قبل.*فطور|قبل.*افطار|before.*iftar|before.*bre/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
  /* بعد الفطار / after iftar / breakfast */
  if(/بعد.*فطار|بعد.*فطر|بعد.*فطور|بعد.*افطار|after.*iftar|after.*bre/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
  /* Morning / صباح → بعد السحور */
  if(/صباح|الصباح|morning|am\b/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  /* Evening / مساء / bed / نوم → بعد الفطار */
  if(/مساء|مسا|evening|eve|bed|sleep|نوم|النوم|hs\b/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
  /* Noon / ظهر / Lunch / غداء → قبل الفطار (closest meaningful time) */
  if(/ظهر|الظهر|noon|midday|غدا|غداء|الغدا|الغداء|lunch|lun/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
  /* عصر / afternoon → قبل الفطار */
  if(/عصر|العصر|asr|afternoon/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
  /* على الريق / empty stomach → قبل السحور */
  if(/ريق|الريق|empty|fasting|stomach/i.test(note)) return {meal:'beforeSuhoor',label_ar:'قبل السحور',label_en:'Before Suhoor',time:RAMADAN_TIMES.beforeSuhoor};
  /* قبل الأكل / before meal → قبل الفطار */
  if(/قبل\s*(الاكل|الأكل|الوجبات)|before\s*(meal|food)|ac\b/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
  /* بعد الأكل / after meal → بعد الفطار */
  if(/بعد\s*(الاكل|الأكل|الوجبات)|after\s*(meal|food)|pc\b/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
  return null;
}

/* Check if a Ramadan time is Suhoor (past midnight, need +1 extra day) */
function isRamadanSuhoorTime(meal){
  return meal==='beforeSuhoor'||meal==='afterSuhoor';
}

/* Get Ramadan start date for a given meal type */
function getRamadanStartDate(baseDateStr,meal){
  if(!baseDateStr) return baseDateStr;
  var base=new Date(baseDateStr);
  /* ملاحظة: baseDateStr بيجي من #fstartDate اللي فيه +1 يوم بالفعل
     يعني لو اليوم 15، baseDateStr = 16
     الفطار: ما نزودش حاجة → يبقى 16 ✓
     السحور: نزود يوم واحد بس → 16+1 = 17 ✓ */
  if(isRamadanSuhoorTime(meal)){
    base.setDate(base.getDate()+1);
  }
  /* الفطار: ما نزودش حاجة - نرجع التاريخ زي ما هو */
  return _fmtDate(base);
}
function _fmtDate(d){var y=d.getFullYear(),ms=('0'+(d.getMonth()+1)).slice(-2),da=('0'+d.getDate()).slice(-2);return y+'-'+ms+'-'+da;}

/* Determine Ramadan duplicate type from note (all Ramadan doses with 2 times = duplicate) */
function ramadanShouldDuplicate(note){
  var d=smartDoseRecognizer(note);
  /* BID / مرتين / كل 12 ساعة → duplicate to فطار + سحور */
  if(d.count===2||d.rawFrequency==='BID'||d.rawFrequency==='Q12H') return {type:'ramadan_two',meals:['iftar','suhoor']};
  /* TID / 3 مرات / كل 8 → duplicate to فطار + سحور (+ warning) */
  if(d.count===3||d.rawFrequency==='TID'||d.rawFrequency==='Q8H') return {type:'ramadan_two',meals:['iftar','suhoor']};
  /* QID / 4 مرات / كل 6 → duplicate to فطار + سحور */
  if(d.count>=4||d.rawFrequency==='QID'||d.rawFrequency==='Q6H'||d.rawFrequency==='Q4H') return {type:'ramadan_two',meals:['iftar','suhoor']};
  /* OD / once daily → single, will be handled by the "once daily" prompt */
  if(d.count===1) return null;
  return null;
}

/* Check if item is injection/syrup/ointment/cream (non-oral solid) */
function isNonTabletItem(itemName){
  return /injection|حقن|حقنة|حقنه|syrup|شراب|cream|كريم|ointment|مرهم|مره|lotion|لوشن|gel|جل|drop|قطر|قطره|spray|بخاخ|inhaler|بخاخة|suppository|لبوس|solution|محلول|suspension|معلق|emulsion|مستحلب|patch|لصقة|لاصق/i.test(itemName||'');
}

var warningQueue=[];
var monthCounter=0;
var originalStartDate='';
var duplicatedRows=[];
var duplicatedCount=0;

/* ══════════════════════════════════════════
   SHARED UTILITY FUNCTIONS (Single Source)
   ══════════════════════════════════════════ */
function _ezFire(el){
  try{
    if(!el)return;
    el.focus();
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('blur',{bubbles:true}));
    if(typeof angular!=='undefined'){try{angular.element(el).triggerHandler('change');}catch(e){}}
    if(typeof jQuery!=='undefined'){try{jQuery(el).trigger('change');}catch(e){}}
  }catch(e){}
}

function _ezNorm(txt){
  return(txt||'').toString().trim().replace(/\s+/g,' ');
}

function _ezNormL(txt){
  return _ezNorm(txt).toLowerCase()
    .replace(/[أإآ]/g,'ا')
    .replace(/ة/g,'هـ')
    .replace(/ئ/g,'ي')
    .replace(/ؤ/g,'و')
    .replace(/ى/g,'ي')
    .trim();
}

function _ezGet(td){
  if(!td) return '';
  var i=td.querySelector('input,textarea,select');
  if(i){
    if(i.tagName==='SELECT'){var o=i.options[i.selectedIndex];return _ezNorm(o?o.textContent:i.value);}
    return _ezNorm(i.value);
  }
  return _ezNorm(td.innerText||td.textContent);
}

function _ezSet(td,v){
  if(!td) return;
  var s=td.querySelector('select');
  if(s){s.value=String(v);_ezFire(s);return;}
  var i=td.querySelector('input,textarea');
  if(i){i.value=v;_ezFire(i);}
  else td.textContent=v;
}

/* Column aliases - Point 1: Resilient column detection */
var COLUMN_ALIASES={
  'qty':['qty','quantity','كمية','الكمية','qnty','q.ty','عدد'],
  'size':['size','حجم','الحجم','sz','pack size','pack'],
  'note':['note','notes','ملاحظة','ملاحظات','remark','remarks','prescription note'],
  'every':['every','evry','كل','المدة','frequency','freq','interval'],
  'time':['time','وقت','الوقت','timing'],
  'dose':['dose','جرعة','الجرعة','dosage','dos'],
  'code':['code','كود','الكود','item code','barcode','رمز'],
  'start date':['start date','start','تاريخ البدء','بداية','from'],
  'end date':['end date','end','تاريخ الانتهاء','نهاية','to','expiry'],
  'name':['name','item','اسم','الاسم','item name','drug name','medication','drug']
};

function _ezIdx(ths,name){
  var key=name.toLowerCase().trim();
  var aliases=COLUMN_ALIASES[key]||[key];
  for(var i=0;i<ths.length;i++){
    var txt=_ezNormL(ths[i].textContent);
    for(var a=0;a<aliases.length;a++){
      if(txt===aliases[a]||txt.indexOf(aliases[a])>-1) return i;
    }
  }
  return-1;
}

/* Find main data table with resilient detection */
function _ezFindTable(){
  var tables=document.querySelectorAll('table');
  for(var i=0;i<tables.length;i++){
    var ths=tables[i].querySelectorAll('th');
    if(ths.length>3){
      var hasQty=_ezIdx(ths,'qty')>=0;
      var hasNote=_ezIdx(ths,'note')>=0;
      if(hasQty&&hasNote) return tables[i];
    }
  }
  /* Fallback: largest table */
  var best=null,bestCols=0;
  for(var j=0;j<tables.length;j++){
    var cols=tables[j].querySelectorAll('th').length;
    if(cols>bestCols){bestCols=cols;best=tables[j];}
  }
  return best;
}

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
  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('لم يتم العثور على الجدول','error');return;}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ni=_ezIdx(hs,'note'),nmi=_ezIdx(hs,'name');
  if(nmi<0) nmi=_ezIdx(hs,'item');
  var cdi=_ezIdx(hs,'code');
  if(ni<0||nmi<0){window.ezShowToast('أعمدة Note أو Name مش موجودة','error');return;}
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
    } else if(w.type==='ramadan_unclear'){
      reason='🌙 جرعة غير واضحة في رمضان';
      detail='الجرعة المكتوبة: '+w.currentNote+'\n\nلم يتم التعرف على وقت رمضان محدد. عدّل التكرار والوقت أدناه ثم اضغط تطبيق.';
      actionLabel='تطبيق التعديلات';
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
      if(w.type==='ramadan_unclear'){
        /* Special UI for ramadan_unclear: dropdown + time input */
        html+='<div style="display:flex;gap:8px;direction:rtl;margin-bottom:8px;flex-wrap:wrap">';
        html+='<div style="flex:1;min-width:120px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">Every (كل كام ساعة)</label>';
        html+='<select id="edit-every-'+i+'" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:13px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;direction:rtl">';
        html+='<option value="24"'+(w.currentEvery===24?' selected':'')+'>كل 24 ساعة (مرة في اليوم)</option>';
        html+='<option value="12"'+(w.currentEvery===12?' selected':'')+'>كل 12 ساعة (مرتين)</option>';
        html+='<option value="8"'+(w.currentEvery===8?' selected':'')+'>كل 8 ساعات (3 مرات)</option>';
        html+='<option value="6"'+(w.currentEvery===6?' selected':'')+'>كل 6 ساعات (4 مرات)</option>';
        html+='<option value="48"'+(w.currentEvery===48?' selected':'')+'>كل 48 ساعة (يوم بعد يوم)</option>';
        html+='<option value="168"'+(w.currentEvery===168?' selected':'')+'>كل 168 ساعة (أسبوعياً)</option>';
        html+='</select></div>';
        html+='<div style="width:140px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">وقت الجرعة (Start Time)</label>';
        html+='<input type="time" id="edit-time-'+i+'" value="'+w.currentTime+'" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:13px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>';
        html+='</div>';
      } else {
        /* Default editable UI */
        html+='<div style="display:flex;align-items:center;gap:8px;direction:rtl;margin-bottom:8px">';
        html+='<label style="font-size:11px;font-weight:800;color:'+lc.labelColor+'">'+w.editLabel+':</label>';
        html+='<input type="number" id="edit-'+i+'" value="'+w.currentValue+'" min="'+w.minValue+'" max="'+w.maxValue+'" style="width:80px;padding:6px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:14px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" />';
        html+='<span style="font-size:11px;font-weight:700;color:#94a3b8">يوم</span></div>';
      }
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
  } else if(w.type==='ramadan_unclear'&&w.onEdit){
    /* Get values from dropdown and time input */
    var everySelect=document.getElementById('edit-every-'+idx);
    var timeInput=document.getElementById('edit-time-'+idx);
    if(everySelect&&timeInput){
      var newEvery=parseInt(everySelect.value);
      var newTime=timeInput.value;
      w.onEdit(newEvery,newTime);
      window.ezShowToast('✅ تم تطبيق Every='+newEvery+'h و Time='+newTime,'success');
    }
  }

  /* Mark card as applied */
  if(card){
    card.style.cssText='background:rgba(16,185,129,0.06)!important;border:1.5px solid rgba(16,185,129,0.25)!important;border-radius:14px;padding:14px 16px;margin-bottom:10px';
    var btns=card.querySelectorAll('button');
    for(var b=0;b<btns.length;b++) btns[b].remove();
    var badge=document.createElement('div');
    badge.style.cssText='text-align:center;font-size:13px;font-weight:800;color:#059669;padding:6px;background:rgba(16,185,129,0.06);border-radius:8px;margin-top:6px';
    badge.textContent='✅ تم التطبيق';
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
    var ramadanMode=document.getElementById('ramadan-mode')?document.getElementById('ramadan-mode').checked:false;
    /* Save settings for next time */
    saveSettings({m:m,t:t,autoDuration:autoDuration,showWarnings:showWarningsFlag,ramadanMode:ramadanMode});
    d.remove();
    var loader=document.createElement('div');
    loader.id='ez-loader';
    loader.innerHTML='<div style="display:flex;align-items:center;gap:14px"><div class="ez-loader-spinner"></div><div class="ez-loader-text">'+(ramadanMode?'🌙 جاري المعالجة (وضع رمضان)...':'جاري المعالجة...')+'</div></div><div style="margin-top:14px;height:4px;background:rgba(129,140,248,0.1);border-radius:4px;overflow:hidden"><div style="height:100%;width:60%;background:linear-gradient(90deg,#6366f1,#818cf8,#6366f1);background-size:200% 100%;animation:barShift 1.5s ease infinite;border-radius:4px"></div></div>';
    loader.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);padding:30px 50px;border-radius:24px;box-shadow:0 30px 80px rgba(99,102,241,0.12),0 0 0 1px rgba(129,140,248,0.08);z-index:99998;text-align:center;font-family:Cairo,sans-serif;min-width:260px;animation:dialogEnter 0.4s ease';
    document.body.appendChild(loader);
    setTimeout(function(){
      if(loader) loader.remove();
      processTable(m,t,autoDuration,showWarningsFlag,showPostDialog,ramadanMode);
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
    var tb=_ezFindTable();
    if(!tb) return;

    var fire=_ezFire,normL=_ezNormL,get=_ezGet,set=_ezSet,idx=_ezIdx;

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

  var tb=_ezFindTable();
  if(!tb) return;

  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var si=_ezIdx(hs,'size'),edi=_ezIdx(hs,'end date'),qi=_ezIdx(hs,'qty');

  var rows=tb.querySelectorAll('tr');

  var fireEv=_ezFire;

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
  var fire=_ezFire;
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
var fireEvent=_ezFire;

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
  var NT=NORMAL_TIMES;
  
  /* CRITICAL FIX: "قبل الأكل مرتين" should be beforeMeal (8:00) not morning (9:30) */
  var beforeMealTwice=/قبل\s*(الاكل|الأكل)\s*مرتين|مرتين\s*قبل\s*(الاكل|الأكل)|before\s*(meal|food)\s*twice|twice\s*before\s*(meal|food)/;
  if(beforeMealTwice.test(s))return{time:NT.beforeMeal};
  
  var rules=[
    {test:/empty|stomach|ريق|الريق|على الريق|fasting/,time:NT.empty},
    {test:/قبل\s*(الاكل|الأكل|meal)|before\s*(meal|food)/,time:NT.beforeMeal},
    {test:/before.*bre|before.*fatur|before.*breakfast|قبل.*فطر|قبل.*فطار|قبل.*فطور|قبل.*افطار/,time:NT.beforeBreakfast},
    {test:/after.*bre|after.*fatur|after.*breakfast|بعد.*فطر|بعد.*فطار|بعد.*فطور|بعد.*افطار/,time:NT.afterBreakfast},
    {test:/\b(morning|am|a\.m)\b|صباح|الصباح|صبح/,time:NT.morning},
    {test:/\b(noon|midday)\b|ظهر|الظهر/,time:NT.noon},
    /* FIX: Support both غداء AND غذاء (الغداء/الغذاء) */
    {test:/قبل\s*(الغدا|الغداء|الغذا|الغذاء|غدا|غداء|غذا|غذاء)|before\s*lunch/,time:NT.beforeLunch},
    {test:/بعد\s*(الغدا|الغداء|الغذا|الغذاء|غدا|غداء|غذا|غذاء)|after\s*lunch/,time:NT.afterLunch},
    {test:/\b(asr|afternoon|pm|p\.m)\b|عصر|العصر/,time:NT.afternoon},
    {test:/maghrib|مغرب|المغرب/,time:NT.maghrib},
    {test:/before.*din|before.*sup|before.*dinner|before.*asha|قبل.*عشا|قبل.*عشو|قبل.*عشاء/,time:NT.beforeDinner},
    {test:/after.*din|after.*sup|after.*dinner|after.*asha|بعد.*عشا|بعد.*عشو|بعد.*عشاء/,time:NT.afterDinner},
    {test:/مساء|مسا|evening|eve/,time:NT.evening},
    {test:/bed|sleep|sle|نوم|النوم|hs|h\.s/,time:NT.bed}
  ];
  /* Custom time rules from settings (checked FIRST for priority) */
  if(customConfig.customTimeRules){for(var i=0;i<customConfig.customTimeRules.length;i++){var cr=customConfig.customTimeRules[i];try{var nPat=cr.pattern.replace(/[أإآ]/g,'ا').replace(/ة/g,'[ةه]').replace(/ى/g,'[يى]');var nPat2=nPat.replace(/^ال/,'(ال)?');if(new RegExp(nPat,'i').test(s)||new RegExp(nPat2,'i').test(s))return{time:cr.time};}catch(e){}}}
  for(var i=0;i<rules.length;i++){if(rules[i].test.test(s))return{time:rules[i].time};}
  /* If note is empty or very short, return default time */
  if(!s||s.length<3)return{time:NT.defaultTime,isEmpty:true};
  /* Unrecognized pattern - return default but flag it */
  return{time:NT.defaultTime,isUnrecognized:true};
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
  var tb=_ezFindTable();
  if(!tb)return false;
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');var ni=_ezIdx(hs,'note');
  if(ni<0)return false;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  for(var i=0;i<rows.length;i++){var tds=rows[i].querySelectorAll('td');if(tds.length>ni){var inp=tds[ni].querySelector('input,textarea');var noteText=inp?inp.value:tds[ni].textContent;var cleaned=cleanNote(noteText);var nl=cleaned.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();if(nl&&shouldDuplicateRow(nl))return true;}}
  return false;
}

/* ══════════════════════════════════════════
   ★ MAIN PROCESSING ENGINE ★
   ══════════════════════════════════════════ */
function processTable(m,t,autoDuration,enableWarnings,showPostDialog,ramadanMode){
  warningQueue=[];duplicatedRows=[];duplicatedCount=0;var detectedLanguagesPerRow=[];window._ezDose2Applied=null;window._ramadanMode=ramadanMode||false;
  var fire=_ezFire,norm=_ezNorm,normL=_ezNormL,get=_ezGet,idx=_ezIdx;
  function getCleanCode(td){var text=get(td);var match=text.match(/\d+/);return match?match[0]:'';}
  function setSize(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setEvry(td,v){if(!td)return;var s=td.querySelector('select');if(s){s.value=String(v);fire(s);}else{td.textContent=String(v);}}
  function setDose(td,v){if(!td)return;var s=td.querySelector('select');if(s){s.value=String(v);fire(s);return;}var i=td.querySelector('input,textarea');if(i){i.value=String(v);fire(i);return;}td.textContent=String(v);}
  function setTime(r,tm){if(!r||!tm)return;var i=r.querySelector("input[type='time']");if(i){i.value=tm;fire(i);}}
  function setNote(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setStartDate(r,dateStr){if(!r||!dateStr)return;var sdInput=r.querySelector('input[type="date"]');if(!sdInput){var inputs=r.querySelectorAll('input');for(var i=0;i<inputs.length;i++){if(inputs[i].value&&/\d{4}-\d{2}-\d{2}/.test(inputs[i].value)){sdInput=inputs[i];break;}}}if(sdInput){sdInput.value=dateStr;fire(sdInput);}}
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

  /* ── RAMADAN DUPLICATE ROWS ── */
  function createRamadanDuplicateRows(t_val,r,rInfo,bs,niIdx,si,ei,di,ti,sdi,edi,m_val,tc,ci,qi){
    var tds=r.querySelectorAll('td');var u_code=getCleanCode(tds[ci]);
    var on=get(tds[niIdx]);var isEn=/[a-z]/i.test(on)||detectLanguage(on)==='english';
    var calcQ=1;if(qi>=0){calcQ=parseInt(get(tds[qi]))||1;}
    var defaultStartDate=document.querySelector('#fstartDate')?document.querySelector('#fstartDate').value:null;
    var tpi=getTwoPillsPerDoseInfo(on);

    /* Ramadan always creates 2 rows: Iftar + Suhoor */
    var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);
    var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');

    /* Size = t_val (days) for each row */
    var ns=t_val;
    if(fixedSizeCodes[u_code]){ns=Math.floor(fixedSizeCodes[u_code]/2);var rem=fixedSizeCodes[u_code]%2;setSize(nt1[si],ns+(rem>0?1:0));setSize(nt2[si],ns);}
    else{setSize(nt1[si],ns);setSize(nt2[si],ns);}
    setEvry(nt1[ei],'24');setEvry(nt2[ei],'24');
    if(di>=0){setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);}
    if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);}

    /* Determine before/after from note */
    var noteMap=ramadanMapNote(on);
    var isBefore=/قبل|before|ac\b/i.test(on);
    var iftarLabel,suhoorLabel,iftarTime,suhoorTime;
    if(isBefore){
      iftarLabel=isEn?'Before Iftar':'قبل الفطار';
      suhoorLabel=isEn?'Before Suhoor':'قبل السحور';
      iftarTime=RAMADAN_TIMES.beforeIftar;
      suhoorTime=RAMADAN_TIMES.beforeSuhoor;
    } else {
      iftarLabel=isEn?'After Iftar':'بعد الفطار';
      suhoorLabel=isEn?'After Suhoor':'بعد السحور';
      iftarTime=RAMADAN_TIMES.afterIftar;
      suhoorTime=RAMADAN_TIMES.afterSuhoor;
    }

    setNote(nt1[niIdx],'⚡ '+iftarLabel);setNote(nt2[niIdx],'⚡ '+suhoorLabel);
    setTime(nr1,iftarTime);setTime(nr2,suhoorTime);

    /* Set Ramadan start dates */
    if(sdi>=0&&defaultStartDate){
      var iftarSD=getRamadanStartDate(defaultStartDate,'afterIftar');
      var suhoorSD=getRamadanStartDate(defaultStartDate,'afterSuhoor');
      setStartDate(nr1,iftarSD);
      setStartDate(nr2,suhoorSD);
    }

    r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);
    var dupRows=[nr1,nr2];
    var meals=isEn?['Iftar','Suhoor']:['الفطار','السحور'];
    duplicatedRows.push({originalRow:r,duplicates:dupRows,type:'ramadan_two',meals:meals});duplicatedCount++;
    if(r.parentNode)r.parentNode.removeChild(r);
  }

  function sortRowsByTime(t_elem,ti_idx,ei_idx){
    if(ti_idx<0)return;var rs=Array.from(t_elem.querySelectorAll('tr'));var he=rs.shift();var rwt=[];var rwot=[];
    rs.forEach(function(r){var tds=r.querySelectorAll('td');if(tds.length<=ti_idx){rwot.push(r);return;}var tv=get(tds[ti_idx]);if(!tv||tv.trim()===''){rwot.push(r);return;}rwt.push({row:r,time:tv});});
    rwt.sort(function(a,b){
      var ta=a.time.split(':').map(Number);
      var tb2=b.time.split(':').map(Number);
      var timeA=ta[0]*60+ta[1];
      var timeB=tb2[0]*60+tb2[1];
      /* في رمضان: السحور (1-5 صباحاً) يجي بعد الفطار (6 مساءً - 12 منتصف الليل) */
      /* إذا كان وقت A صباحاً مبكر (0-5) ووقت B مساءً/ليلاً (18-23)، A يجي بعد B */
      if(timeA>=0&&timeA<=300&&timeB>=1080){return 1;}
      if(timeB>=0&&timeB<=300&&timeA>=1080){return -1;}
      var diff=timeA-timeB;
      if(diff===0&&ei_idx>=0){var evA=parseInt(get(a.row.querySelectorAll('td')[ei_idx]))||0;var evB=parseInt(get(b.row.querySelectorAll('td')[ei_idx]))||0;return evB-evA;}
      return diff;
    });
    t_elem.innerHTML='';t_elem.appendChild(he);rwt.forEach(function(i){t_elem.appendChild(i.row);});rwot.forEach(function(r){t_elem.appendChild(r);});
  }

  function showUniqueItemsCount(t_elem,ci_idx){var s2=new Set();t_elem.querySelectorAll('tr').forEach(function(r,ri){if(ri===0)return;var tds=r.querySelectorAll('td');if(tds.length<=ci_idx)return;var c=get(tds[ci_idx]);if(c&&c.trim()!=='')s2.add(c.trim());});return s2.size;}
  function getCheckmarkCellIndex(r){var tds=r.querySelectorAll('td');for(var i=0;i<tds.length;i++){if(tds[i].querySelector('input[type="checkbox"]')||tds[i].querySelector('img[src*="check"]'))return i;}return-1;}
  function resetCheckmark(r,ci2){if(ci2<0)return;var tds=r.querySelectorAll('td');if(tds.length<=ci2)return;var cb=tds[ci2].querySelector('input[type="checkbox"]');if(cb){cb.checked=false;fire(cb);}}

  setTopStartDate();
  var tb_main=_ezFindTable();
  if(!tb_main){window.ezShowToast('❌ لم يتم العثور على جدول الأدوية','error');ezBeep('error');return;}
  var h_main=tb_main.querySelector('tr');var hs_main=h_main.querySelectorAll('th,td');
  var qi_main=idx(hs_main,'qty');var si_main=idx(hs_main,'size');var ni_main=idx(hs_main,'note');var ei_main=idx(hs_main,'every');if(ei_main<0)ei_main=idx(hs_main,'evry');
  var ti_main=idx(hs_main,'time');var di_main=idx(hs_main,'dose');var ci_main=idx(hs_main,'code');var sdi_main=idx(hs_main,'start date');var edi_main=idx(hs_main,'end date');var nm_main=idx(hs_main,'name');if(nm_main<0)nm_main=idx(hs_main,'item');
  window._ezCols={di:di_main,si:si_main,qi:qi_main,ni:ni_main,ei:ei_main};
  /* Point 2: Detailed error for missing columns */
  var missingCols=[];
  if(qi_main<0) missingCols.push('Qty (الكمية)');
  if(si_main<0) missingCols.push('Size (الحجم)');
  if(ni_main<0) missingCols.push('Note (الملاحظات)');
  if(ei_main<0) missingCols.push('Every (التكرار)');
  if(missingCols.length>0){
    var availCols=[];for(var ac=0;ac<hs_main.length;ac++){var ct=_ezNorm(hs_main[ac].textContent);if(ct)availCols.push(ct);}
    window.ezShowToast('❌ أعمدة ناقصة: '+missingCols.join(' + '),'error');
    ezBeep('error');
    console.log('EZ Pill - أعمدة ناقصة:',missingCols);
    console.log('EZ Pill - الأعمدة الموجودة:',availCols);
    return;
  }
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

    /* ── RAMADAN MODE OVERRIDES ── */
    var ramadanInfo=null;
    if(ramadanMode){
      var doseRec=smartDoseRecognizer(fn_str);
      var noteMapR=ramadanMapNote(fn_str);

      /* ── CASE A: Note explicitly mentions BOTH iftar+suhoor → force duplicate even if count=1 ── */
      if(noteMapR && noteMapR.isBoth){
        dui_obj={type:'ramadan_two',doseInfo:doseRec,isBefore:doseRec.isBefore};
        /* ramadanInfo stays null → will be handled by duplicate logic */
      }
      /* ── CASE B: Weekly items ── */
      else if(h_s){
        ramadanInfo={type:'weekly_ramadan',meal:noteMapR?noteMapR.meal:'afterIftar',time:noteMapR?noteMapR.time:RAMADAN_TIMES.afterIftar};
      }
      /* ── CASE C: Items with count >= 2: force Ramadan duplicate ── */
      else if(doseRec.count>=2 && !h_s){
        dui_obj={type:'ramadan_two',doseInfo:doseRec,isBefore:doseRec.isBefore};
      }
      /* ── CASE D: Once daily ── */
      else if(doseRec.count===1 && !h_s){
        /* SMART FALLBACK: try multiple methods to understand the note */
        if(!noteMapR){
          var twResult=getTimeFromWords(fn_str);
          if(twResult && twResult.time!==NORMAL_TIMES.defaultTime){
            var h2=parseInt(twResult.time.split(':')[0]);
            var meal2,lbl_ar2,lbl_en2,tm2;
            if(h2>=5&&h2<10){meal2='afterSuhoor';lbl_ar2='بعد السحور';lbl_en2='After Suhoor';tm2=RAMADAN_TIMES.afterSuhoor;}
            else if(h2>=10&&h2<17){meal2='beforeIftar';lbl_ar2='قبل الفطار';lbl_en2='Before Iftar';tm2=RAMADAN_TIMES.beforeIftar;}
            else if(h2>=17&&h2<20){meal2='afterIftar';lbl_ar2='بعد الفطار';lbl_en2='After Iftar';tm2=RAMADAN_TIMES.afterIftar;}
            else if(h2>=20||h2<1){meal2='afterIftar';lbl_ar2='بعد الفطار';lbl_en2='After Iftar';tm2=RAMADAN_TIMES.afterIftar;}
            else{meal2='beforeSuhoor';lbl_ar2='قبل السحور';lbl_en2='Before Suhoor';tm2=RAMADAN_TIMES.beforeSuhoor;}
            noteMapR={meal:meal2,label_ar:lbl_ar2,label_en:lbl_en2,time:tm2};
          }
        }
        if(!noteMapR && (doseRec.hasB||doseRec.hasL||doseRec.hasD||doseRec.hasM||doseRec.hasN||doseRec.hasA||doseRec.hasE||doseRec.hasBed||doseRec.hasEmpty)){
          if(doseRec.hasB||doseRec.hasM||doseRec.hasEmpty) noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
          else if(doseRec.hasL||doseRec.hasN||doseRec.hasA) noteMapR={meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
          else if(doseRec.hasD||doseRec.hasE) noteMapR={meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
          else if(doseRec.hasBed) noteMapR={meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
        }

        var isNonTab=isNonTabletItem(itemName);
        if(isNonTab){
          dui_obj={type:'ramadan_two',doseInfo:doseRec,isBefore:doseRec.isBefore};
          ramadanInfo={type:'nontablet_ramadan',forceUncheck:true};
        } else if(noteMapR){
          ramadanInfo={type:'once_ramadan',meal:noteMapR.meal,time:noteMapR.time};
        } else {
          ramadanInfo={type:'once_ramadan',meal:'afterIftar',time:RAMADAN_TIMES.afterIftar};
          var evryVal2=get(tds_nodes[ei_main]);
          var timeVal2=ti_main>=0?get(tds_nodes[ti_main]):'';
          warningQueue.push({level:'warning',message:'🌙 جرعة غير واضحة في رمضان: "'+itemName+'"',detail:'الجرعة المكتوبة: '+fn_str+'\n\nلم يتم التعرف على وقت رمضان. سيتم تعيينها بعد الفطار '+RAMADAN_TIMES.afterIftar+' افتراضياً.',editable:true,editLabel:'Every (ساعات)',currentEvery:parseInt(evryVal2)||24,currentTime:timeVal2||'19:00',currentNote:fn_str,rowIndex:allRowsData.length,type:'ramadan_unclear',onEdit:(function(idx2,tdsRef,eiIdx,tiIdx){return function(newEvery,newTime){allRowsData[idx2].ramadanOverrideEvery=newEvery;allRowsData[idx2].ramadanOverrideTime=newTime;if(eiIdx>=0&&tdsRef[eiIdx]){var eInp=tdsRef[eiIdx].querySelector('input,select');if(eInp){eInp.value=newEvery;_ezFire(eInp);}}if(tiIdx>=0&&tdsRef[tiIdx]){var tInp=tdsRef[tiIdx].querySelector('input');if(tInp){tInp.value=newTime;_ezFire(tInp);}}};})(allRowsData.length,tds_nodes,ei_main,ti_main)});
        }
      }
    }
    var durationInfo=null;var hourlyInfo=null;var calculatedDays=t;var calculatedSize=t;
    if(autoDuration){durationInfo=extractDuration(fn_str);if(durationInfo.hasDuration){calculatedDays=durationInfo.days;calculatedSize=durationInfo.days;}else if(durationInfo.isPRN){calculatedDays=t;calculatedSize=Math.floor(t/2);}else if(durationInfo.isUntilFinish){calculatedDays=t;calculatedSize=t;}}
    hourlyInfo=extractHourlyInterval(fn_str);var timesPerDay=1;if(hourlyInfo.hasInterval)timesPerDay=hourlyInfo.timesPerDay;
    allRowsData.push({row:r_node,tds:tds_nodes,itemCode:itemCode,itemName:itemName,note:fn_str,dui:dui_obj,hasFixedSize:hasFixedSize,isWeekly:h_s,durationInfo:durationInfo,hourlyInfo:hourlyInfo,calculatedDays:calculatedDays,calculatedSize:calculatedSize,timesPerDay:timesPerDay,extractedPillCount:null,warningOverride:false,ramadanInfo:ramadanInfo,ramadanOverrideEvery:null});
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

  if(enableWarnings){
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];
      
      /* Check for unrecognized time patterns */
      if(rd.note&&rd.note.trim().length>=3){
        var timeResult=getTimeFromWords(rd.note);
        if(timeResult.isUnrecognized){
          warningQueue.push({
            level:'warning',
            message:'⚠️ الصنف: '+rd.itemName+' - الجرعة غير مفهومة',
            detail:'النص: "'+rd.note+'" - تم استخدام الوقت الافتراضي '+timeResult.time,
            editable:false,
            rowIndex:i,
            type:'unrecognized_dose'
          });
        }
      }
      
      if(rd.durationInfo&&rd.durationInfo.hasDuration){
        var extracted=rd.durationInfo.days;
        if(extracted!==t){
          warningQueue.push({
            level:'warning',
            message:'📅 الصنف: '+rd.itemName+' - مكتوب "'+extracted+' يوم" لكن المحدد '+t+' يوم',
            editable:true,
            editLabel:'عدد الأيام',
            currentValue:extracted,
            minValue:1,
            maxValue:365,
            rowIndex:i,
            type:'days',
            onEdit:(function(idx2){return function(newVal){allRowsData[idx2].calculatedDays=newVal;allRowsData[idx2].calculatedSize=newVal;allRowsData[idx2].warningOverride=true;};})(i)
          });
        }
      }
      
      if(rd.hasFixedSize&&rd.dui){
        var totalSize=fixedSizeCodes[rd.itemCode];
        var parts=rd.dui.type==='three'?3:(rd.dui.type==='q6h'?1:2);
        var eachPart=rd.dui.type==='q6h'?totalSize*2:Math.floor(totalSize/parts);
        if(eachPart<5){
          warningQueue.push({
            level:'info',
            message:'ℹ️ تقسيم صغير: '+rd.itemName+' سيصبح '+eachPart+' حبة لكل جرعة',
            editable:false,
            rowIndex:i,
            type:'smallsplit'
          });
        }
      }
    }
  }

  if(warningQueue.length>0&&enableWarnings){window.showWarnings(warningQueue,function(){continueProcessing();});}else{continueProcessing();}

  function continueProcessing(){
    var defaultStartDate=document.querySelector('#fstartDate')?document.querySelector('#fstartDate').value:null;
    var ramadanRtd=[];/* Ramadan duplicate list */
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];var r_node=rd.row;var tds_nodes=rd.tds;

      /* ── RAMADAN MODE: Ramadan duplicate (فطار + سحور) ── */
      if(ramadanMode&&rd.dui&&rd.dui.type==='ramadan_two'){
        if(qi_main>=0){var qc=tds_nodes[qi_main];var cv=parseInt(get(qc))||1;setSize(qc,cv*m);}
        /* Non-tablet items: uncheck and move to skip list */
        if(rd.ramadanInfo&&rd.ramadanInfo.type==='nontablet_ramadan'){
          var ck=getCheckmarkCellIndex(r_node);
          resetCheckmark(r_node,ck);
        }
        ramadanRtd.push({row:r_node,info:rd.dui,calcDays:rd.calculatedDays});continue;
      }

      /* ── RAMADAN MODE: Once daily → single Ramadan time ── */
      if(ramadanMode&&rd.ramadanInfo&&(rd.ramadanInfo.type==='once_ramadan'||rd.ramadanInfo.type==='weekly_ramadan')){
        if(rd.ramadanInfo.type==='weekly_ramadan'&&rd.isWeekly){
          /* Weekly in Ramadan: same logic but Ramadan time */
          var bs_val=(rd.calculatedDays==28?4:5)+(m-1)*4;
          setSize(tds_nodes[si_main],bs_val);setEvry(tds_nodes[ei_main],'168');
          if(qi_main>=0){var cur3=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur3);}
          setTime(r_node,rd.ramadanInfo.time);
          var targetDay=extractDayOfWeek(rd.note);
          if(targetDay!==null&&defaultStartDate&&sdi_main>=0){var newSD=getNextDayOfWeek(defaultStartDate,targetDay);setStartDate(r_node,newSD);}
          continue;
        }
        /* Single dose Ramadan: apply Ramadan time */
        var rmEvery=rd.ramadanOverrideEvery||24;
        setEvry(tds_nodes[ei_main],String(rmEvery));
        setSize(tds_nodes[si_main],rd.calculatedSize);
        setTime(r_node,rd.ramadanInfo.time);
        if(di_main>=0){var tpi_once=getTwoPillsPerDoseInfo(rd.note);setDose(tds_nodes[di_main],tpi_once.dose);}
        if(qi_main>=0){var qc2=tds_nodes[qi_main];var cv2=parseInt(get(qc2))||1;setSize(qc2,cv2*m);}
        /* Set Ramadan start date */
        if(sdi_main>=0&&defaultStartDate){
          var rmSD=getRamadanStartDate(defaultStartDate,rd.ramadanInfo.meal);
          setStartDate(r_node,rmSD);
        }
        /* Apply note label */
        var isEn=detectLanguage(rd.note)==='english';
        var noteMap=ramadanMapNote(rd.note);
        if(noteMap){
          var newLabel=isEn?noteMap.label_en:noteMap.label_ar;
          setNote(tds_nodes[ni_main],newLabel);
        }
        continue;
      }

      /* ── NORMAL MODE (original logic) ── */
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
    /* Ramadan duplicates */
    for(var i=0;i<ramadanRtd.length;i++){var it=ramadanRtd[i];createRamadanDuplicateRows(it.calcDays,it.row,it.info,it.calcDays,ni_main,si_main,ei_main,di_main,ti_main,sdi_main,edi_main,m,it.calcDays,ci_main,qi_main);}
    sortRowsByTime(tb_main,ti_main,ei_main);
    for(var i=0;i<skp_list.length;i++){var r_node=skp_list[i];var tds_nodes=r_node.querySelectorAll('td');var u_code_skp=getCleanCode(tds_nodes[ci_main]);if(sdi_main>=0&&tds_nodes[sdi_main]){var sdInp2=tds_nodes[sdi_main].querySelector('input');if(sdInp2)sdInp2.style.width='120px';}if(edi_main>=0&&tds_nodes[edi_main]){var edInp2=tds_nodes[edi_main].querySelector('input');if(edInp2)edInp2.style.width='120px';}if(ni_main>=0&&tds_nodes[ni_main]){var nInp2=tds_nodes[ni_main].querySelector('input,textarea');var crn=get(tds_nodes[ni_main]);var ccn=cleanNote(crn);if(nInp2){nInp2.style.width='100%';nInp2.style.minWidth='180px';nInp2.value=ccn;fire(nInp2);var fo=processedCodes[u_code_skp];if(fo&&ccn!==fo.note){nInp2.style.backgroundColor='rgba(240,147,251,0.12)';nInp2.style.border='2px solid rgba(118,75,162,0.4)';var fi=fo.row.querySelectorAll('td')[ni_main].querySelector('input,textarea');if(fi){fi.style.backgroundColor='rgba(240,147,251,0.12)';fi.style.border='2px solid rgba(118,75,162,0.4)';}}}else{tds_nodes[ni_main].textContent=ccn;}}tb_main.appendChild(r_node);}
    var uc=showUniqueItemsCount(tb_main,ci_main);var genBtn=Array.from(document.querySelectorAll('button,input')).find(function(b){return(b.innerText||b.value||'').toLowerCase().includes('generate csv');});
    if(genBtn){genBtn.className='ez-gen-csv-btn';var bdg=document.createElement('span');bdg.className='unique-count-badge';bdg.innerHTML='📦 عدد الأصناف: '+uc;genBtn.parentNode.insertBefore(bdg,genBtn.nextSibling);}
    beautifyPage();
    var enC=detectedLanguagesPerRow.filter(function(l){return l==='english';}).length;var arC=detectedLanguagesPerRow.filter(function(l){return l==='arabic';}).length;
    if(enC>0&&enC>=arC){setPatientLanguage('english');}else if(arC>0){setPatientLanguage('arabic');}
    if(duplicatedCount>0)window.ezShowToast('تم تقسيم '+duplicatedCount+' صنف إلى صفوف متعددة ⚡'+(ramadanMode?' 🌙':''),'info');
    if(showPostDialog||(ramadanMode&&duplicatedCount>0))showPostProcessDialog();
    /* Ramadan mode notification */
    if(ramadanMode){
      var rmBadge=document.createElement('div');
      rmBadge.id='ez-ramadan-active-badge';
      rmBadge.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9999994;background:linear-gradient(145deg,#1e1b4b,#312e81);color:#fbbf24;padding:8px 24px;border-radius:30px;font-family:Cairo,sans-serif;font-size:13px;font-weight:900;box-shadow:0 6px 20px rgba(30,27,75,0.3),inset 0 1px 0 rgba(255,255,255,0.1);display:flex;align-items:center;gap:8px;animation:fadeSlideUp 0.5s ease;border:1.5px solid rgba(251,191,36,0.3)';
      rmBadge.innerHTML='<span style="font-size:18px">🌙</span> وضع رمضان مفعّل <span style="font-size:10px;color:rgba(251,191,36,0.6);margin-right:6px">فطار '+RAMADAN_TIMES.afterIftar+' · سحور '+RAMADAN_TIMES.afterSuhoor+'</span>';
      document.body.appendChild(rmBadge);
      setTimeout(function(){if(document.getElementById('ez-ramadan-active-badge')){rmBadge.style.opacity='0';rmBadge.style.transition='opacity 0.5s';setTimeout(function(){rmBadge.remove();},500);}},8000);
    }
    checkEndDateConsistency();
    window.ezShowToast('تمت المعالجة بنجاح ✅','success');
    ezBeep('success');

    /* Feature 4: Order Summary - DISABLED */
    /* Summary popup has been removed as per user request */
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
@keyframes barShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}\
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}\
@keyframes dialogEnter{from{opacity:0;transform:translate(-50%,-46%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}\
@keyframes shimmer{0%,70%{left:-100%}100%{left:200%}}\
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
@keyframes spin{to{transform:rotate(360deg)}}\
@keyframes meshFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}\
.ez-dialog-v2{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:480px;max-width:96vw;z-index:99999;border-radius:28px;background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);box-shadow:0 30px 80px rgba(99,102,241,0.12),0 8px 24px rgba(0,0,0,0.04),0 0 0 1px rgba(129,140,248,0.08),inset 0 1px 0 rgba(255,255,255,0.8);overflow:hidden;animation:dialogEnter 0.8s cubic-bezier(0.16,1,0.3,1) forwards;font-family:Cairo,sans-serif}\
.ez-dialog-v2::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6366f1,#a78bfa,#818cf8,#6366f1);background-size:300% 100%;animation:barShift 4s ease infinite;z-index:1}\
.ez-header{padding:20px 24px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.08);cursor:move}\
.ez-logo-group{display:flex;align-items:center;gap:14px}\
.ez-logo{width:52px;height:52px;border-radius:16px;background:linear-gradient(145deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 8px 24px rgba(99,102,241,0.3),inset 0 1px 0 rgba(255,255,255,0.2);position:relative;overflow:hidden}\
.ez-logo::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);animation:shimmer 3s ease infinite}\
.ez-title-block{display:flex;flex-direction:column;gap:2px}\
.ez-title{font-size:20px;font-weight:900;color:#1e1b4b;letter-spacing:-0.5px;line-height:1.2;display:flex;align-items:center;gap:8px}\
.ez-title .ez-brand{font-size:13px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:0.5px}\
.ez-subtitle{font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.3px}\
.ez-header-actions{display:flex;align-items:center;gap:6px}\
.ez-version{font-size:9px;font-weight:800;color:#818cf8;background:rgba(129,140,248,0.08);padding:3px 10px;border-radius:8px;letter-spacing:0.5px}\
.ez-btn-icon{width:34px;height:34px;border-radius:10px;border:1px solid rgba(129,140,248,0.1);background:rgba(129,140,248,0.04);color:#94a3b8;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:Cairo,sans-serif}\
.ez-btn-icon:hover{background:rgba(129,140,248,0.1);color:#6366f1}\
.ez-content{padding:20px 24px 24px}\
.ez-section-label{display:flex;align-items:center;gap:8px;direction:rtl;margin-bottom:10px}\
.ez-section-label .dot{font-size:14px}\
.ez-section-label span:last-child{font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.3px}\
.ez-section-label::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(129,140,248,0.08),transparent)}\
.ez-pill-group{display:flex;gap:8px;margin-bottom:20px}\
.ez-pill{flex:1;height:52px;border-radius:14px;border:1.5px solid rgba(129,140,248,0.1);background:transparent;font-size:18px;font-weight:900;color:#94a3b8;cursor:pointer;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);font-family:Cairo,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}\
.ez-pill .ez-pill-sub{font-size:8px;font-weight:700;opacity:0.5;letter-spacing:0.5px}\
.ez-pill:hover:not(.active){color:#6366f1;border-color:rgba(99,102,241,0.15);background:rgba(99,102,241,0.02)}\
.ez-pill.active{color:#fff;background:linear-gradient(145deg,#6366f1,#818cf8);border-color:#6366f1;box-shadow:0 6px 20px rgba(99,102,241,0.3),inset 0 1px 0 rgba(255,255,255,0.2);transform:scale(1.02)}\
.ez-pill.active .ez-pill-sub{opacity:0.9}\
.ez-sep{height:1px;margin:16px 0;background:linear-gradient(90deg,transparent,rgba(129,140,248,0.12),transparent)}\
.ez-toggle-row{display:flex;align-items:center;padding:10px 14px;gap:12px;direction:rtl;cursor:pointer;border-radius:12px;border:1px solid transparent;transition:all 0.3s;margin-bottom:4px}\
.ez-toggle-row:hover{background:rgba(99,102,241,0.02);border-color:rgba(129,140,248,0.06)}\
.ez-toggle-row.ez-tog-on{background:rgba(99,102,241,0.02);border-color:rgba(129,140,248,0.06)}\
.ez-switch{position:relative;width:42px;height:24px;flex-shrink:0}\
.ez-switch input{display:none}\
.ez-switch-track{position:absolute;inset:0;background:rgba(148,163,184,0.3);border-radius:12px;transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}\
.ez-switch input:checked+.ez-switch-track{background:linear-gradient(145deg,#6366f1,#818cf8);box-shadow:0 2px 8px rgba(99,102,241,0.3)}\
.ez-switch-knob{position:absolute;top:3px;right:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 1px 4px rgba(0,0,0,0.15);pointer-events:none}\
.ez-switch input:checked~.ez-switch-knob{right:21px}\
.ez-toggle-text{font-size:12px;font-weight:700;color:#64748b;flex:1;transition:color 0.3s}\
.ez-tog-on .ez-toggle-text{color:#1e1b4b}\
.ez-toggle-text .auto-tag{font-size:8px;font-weight:800;color:#fff;background:linear-gradient(135deg,#10b981,#059669);padding:1px 6px;border-radius:4px;margin-right:6px;vertical-align:middle}\
.ez-toggle-icon{font-size:14px;opacity:0.4;transition:all 0.3s}\
.ez-tog-on .ez-toggle-icon{opacity:1}\
.ez-ramadan-toggle.ez-tog-on{background:linear-gradient(135deg,rgba(30,27,75,0.06),rgba(251,191,36,0.06))!important;border-color:rgba(251,191,36,0.2)!important}\
.ez-ramadan-toggle.ez-tog-on .ez-switch-track{background:linear-gradient(145deg,#1e1b4b,#312e81)!important;box-shadow:0 2px 8px rgba(30,27,75,0.4)!important}\
.ez-ramadan-toggle.ez-tog-on .ez-toggle-text{color:#1e1b4b!important;font-weight:800!important}\
.ez-actions{display:flex;gap:8px;margin-top:20px}\
.ez-btn-primary{flex:1;height:52px;border:none;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5);box-shadow:0 6px 24px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;letter-spacing:0.3px}\
.ez-btn-primary::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 4s ease-in-out infinite}\
.ez-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,0.35),inset 0 1px 0 rgba(255,255,255,0.15)}\
.ez-btn-primary:active{transform:translateY(0)}\
.ez-btn-primary.ez-pulse{box-shadow:0 8px 30px rgba(99,102,241,0.4),0 0 0 3px rgba(99,102,241,0.1)}\
.ez-btn-doses{width:52px;height:52px;border-radius:14px;border:1.5px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.04);color:#818cf8;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all 0.3s}\
.ez-btn-doses:hover{background:linear-gradient(145deg,#6366f1,#818cf8);color:#fff;border-color:#6366f1;box-shadow:0 6px 20px rgba(99,102,241,0.25)}\
.ez-btn-cancel{width:52px;height:52px;border-radius:14px;border:1.5px solid rgba(239,68,68,0.1);background:rgba(239,68,68,0.03);color:#ef4444;cursor:pointer;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:Cairo,sans-serif}\
.ez-btn-cancel:hover{background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2)}\
.ez-footer{padding:10px 24px;text-align:center;font-size:9px;font-weight:800;letter-spacing:2px;border-top:1px solid rgba(129,140,248,0.06);background:rgba(129,140,248,0.02)}\
.ez-footer span{color:#c7d2fe}\
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
.ez-page-styled table th{background:linear-gradient(145deg,#6366f1,#4f46e5)!important;color:#fff!important;font-size:13px!important;font-weight:800!important;padding:10px 6px!important;text-align:center!important;letter-spacing:0.3px!important;border:none!important;border-bottom:2px solid #4338ca!important;border-left:1px solid rgba(255,255,255,0.12)!important;white-space:nowrap!important;text-shadow:0 1px 2px rgba(0,0,0,0.15)!important}\
.ez-page-styled table th:first-child{border-left:none!important}\
.ez-page-styled table td{padding:5px 6px!important;font-size:14px!important;font-weight:700!important;color:#1e1b4b!important;border:none!important;border-bottom:1px solid rgba(129,140,248,0.08)!important;border-left:1px solid rgba(129,140,248,0.06)!important;vertical-align:middle!important;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)!important}\
.ez-page-styled table td:first-child{border-left:none!important}\
.ez-page-styled table input[type="text"],.ez-page-styled table input[type="number"],.ez-page-styled table input[type="time"],.ez-page-styled table input[type="date"],.ez-page-styled table select,.ez-page-styled table textarea{font-family:Cairo,sans-serif!important;font-weight:700!important;color:#1e1b4b!important;font-size:14px!important;border:1px solid rgba(129,140,248,0.1)!important;border-radius:6px!important;padding:3px 5px!important;background:rgba(255,255,255,0.8)!important;transition:all 0.25s!important}\
.ez-page-styled table input[type="time"]{min-width:110px!important;font-size:12px!important;padding:3px 4px!important}\
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
.ez-loader-spinner{width:22px;height:22px;border:3px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite}\
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
body.ez-dark-mode .ez-dialog-v2{background:rgba(20,20,45,0.95)!important;box-shadow:0 30px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(129,140,248,0.1),inset 0 1px 0 rgba(255,255,255,0.03)!important}\
body.ez-dark-mode .ez-title{color:#e2e8f0!important}\
body.ez-dark-mode .ez-subtitle{color:#64748b!important}\
body.ez-dark-mode .ez-section-label span:last-child{color:#94a3b8!important}\
body.ez-dark-mode .ez-pill:not(.active){color:#94a3b8!important;border-color:rgba(129,140,248,0.12)!important}\
body.ez-dark-mode .ez-pill:hover:not(.active){background:rgba(129,140,248,0.08)!important;color:#c7d2fe!important}\
body.ez-dark-mode .ez-toggle-text{color:#94a3b8!important}\
body.ez-dark-mode .ez-tog-on .ez-toggle-text{color:#e2e8f0!important}\
body.ez-dark-mode .ez-toggle-row{border-color:rgba(129,140,248,0.06)!important}\
body.ez-dark-mode .ez-toggle-row:hover,.ez-dark-mode .ez-tog-on{background:rgba(99,102,241,0.06)!important}\
body.ez-dark-mode .ez-footer{background:rgba(129,140,248,0.03)!important;border-color:rgba(129,140,248,0.06)!important}\
body.ez-dark-mode .ez-footer span{color:#475569!important}\
body.ez-dark-mode .ez-btn-cancel{background:rgba(239,68,68,0.06)!important;border-color:rgba(239,68,68,0.12)!important}\
body.ez-dark-mode .ez-btn-doses{background:rgba(129,140,248,0.06)!important;border-color:rgba(129,140,248,0.12)!important}\
body.ez-dark-mode .ez-sep{background:linear-gradient(90deg,transparent,rgba(129,140,248,0.1),transparent)!important}\
body.ez-dark-mode label,body.ez-dark-mode span{color:#c7d2fe!important}';
document.head.appendChild(s_style);

/* ══════════════════════════════════════════
   PAGE BEAUTIFICATION
   ══════════════════════════════════════════ */
function beautifyPage(){/* DISABLED by Editor */}

/* ══════════════════════════════════════════
   MAIN DIALOG - NEW PROFESSIONAL DESIGN
   ══════════════════════════════════════════ */

/* ── ADMIN SETTINGS PANEL ── */
window.ezOpenSettings=function(){
  if(document.getElementById('ez-settings-overlay')) return;
  /* PIN prompt */
  var pinOverlay=document.createElement('div');
  pinOverlay.id='ez-pin-overlay';
  pinOverlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.7);backdrop-filter:blur(12px);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;animation:ezWnFadeIn 0.3s ease';
  pinOverlay.innerHTML='<div style="background:#fff;border-radius:22px;width:340px;padding:32px 28px;text-align:center;box-shadow:0 30px 80px rgba(99,102,241,0.2);border:2px solid rgba(129,140,248,0.12);animation:ezWnSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)"><div style="width:60px;height:60px;border-radius:18px;background:linear-gradient(145deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;box-shadow:0 8px 24px rgba(99,102,241,0.3)">🔐</div><div style="font-size:18px;font-weight:900;color:#1e1b4b;margin-bottom:4px">لوحة الإعدادات</div><div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:20px">أدخل الرقم السري للمتابعة</div><div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;direction:ltr" id="ez-pin-dots"></div><input type="password" id="ez-pin-input" maxlength="6" style="width:180px;padding:12px 16px;border:2px solid rgba(129,140,248,0.15);border-radius:14px;font-size:24px;font-weight:900;color:#1e1b4b;text-align:center;font-family:Cairo,sans-serif;outline:none;letter-spacing:8px;background:rgba(241,245,249,0.5);transition:all 0.3s" placeholder="••••••" autocomplete="off" /><div id="ez-pin-error" style="font-size:11px;font-weight:800;color:#ef4444;margin-top:8px;height:16px"></div><div style="display:flex;gap:8px;margin-top:16px"><button id="ez-pin-ok" style="flex:1;height:44px;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5);box-shadow:0 4px 16px rgba(99,102,241,0.25);transition:all 0.3s">دخول</button><button id="ez-pin-cancel" style="height:44px;padding:0 20px;border:1.5px solid rgba(129,140,248,0.15);border-radius:12px;background:#fff;color:#6366f1;cursor:pointer;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;transition:all 0.3s">إلغاء</button></div></div>';
  document.body.appendChild(pinOverlay);
  var pinInput=document.getElementById('ez-pin-input');
  setTimeout(function(){pinInput.focus();},100);
  document.getElementById('ez-pin-cancel').onclick=function(){pinOverlay.remove();};
  pinOverlay.onclick=function(e){if(e.target===pinOverlay)pinOverlay.remove();};
  function tryPin(){
    var val=pinInput.value.trim();
    var auth=authenticatePin(val);
    if(auth){
      pinOverlay.remove();
      _ezShowSettingsPanel(auth.role,auth.name);
    } else {
      document.getElementById('ez-pin-error').textContent='❌ الرقم السري غلط';
      pinInput.style.borderColor='#ef4444';pinInput.style.animation='shake 0.4s ease';
      setTimeout(function(){pinInput.style.borderColor='rgba(129,140,248,0.15)';pinInput.style.animation='';pinInput.value='';pinInput.focus();},800);
    }
  }
  document.getElementById('ez-pin-ok').onclick=tryPin;
  pinInput.onkeydown=function(e){if(e.key==='Enter')tryPin();if(e.key==='Escape')pinOverlay.remove();};
};

function _ezShowSettingsPanel(role,userName){
  var isAdmin=(role==='admin');
  var cc=loadCustomConfig();
  var RT=RAMADAN_TIMES;var NT=NORMAL_TIMES;

  var overlay=document.createElement('div');
  overlay.id='ez-settings-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(10px);z-index:9999998;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;animation:ezWnFadeIn 0.3s ease';

  /* Build Fixed Size Codes table */
  var fscRows='';var fscKeys=Object.keys(fixedSizeCodes);
  for(var i=0;i<fscKeys.length;i++){
    var isCustom=cc.fixedSizeCodes&&cc.fixedSizeCodes[fscKeys[i]]!==undefined;
    fscRows+='<tr style="'+(isCustom?'background:rgba(16,185,129,0.04)':'')+'"><td style="padding:4px 8px;font-size:12px;font-weight:800;color:#1e1b4b;direction:ltr">'+fscKeys[i]+'</td><td style="padding:4px 8px;text-align:center"><input type="number" class="ez-cfg-fsc-val" data-code="'+fscKeys[i]+'" value="'+fixedSizeCodes[fscKeys[i]]+'" style="width:60px;padding:4px 6px;border:1.5px solid rgba(129,140,248,0.15);border-radius:8px;font-size:13px;font-weight:800;text-align:center;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none" /></td><td style="padding:4px;text-align:center"><button class="ez-cfg-del-fsc" data-code="'+fscKeys[i]+'" style="width:26px;height:26px;border:none;border-radius:7px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:12px">✕</button></td></tr>';
  }

  /* Build Weekly Injections list */
  var wiRows='';
  for(var i=0;i<weeklyInjections.length;i++){
    var isCustomW=cc.addedWeekly&&cc.addedWeekly.indexOf(weeklyInjections[i])>-1;
    wiRows+='<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;margin-bottom:4px;background:'+(isCustomW?'rgba(16,185,129,0.04)':'rgba(241,245,249,0.5)')+';border-radius:8px;border:1px solid rgba(129,140,248,0.06)"><span style="flex:1;font-size:12px;font-weight:800;color:#1e1b4b;direction:ltr">'+weeklyInjections[i]+'</span><button class="ez-cfg-del-wi" data-code="'+weeklyInjections[i]+'" style="width:22px;height:22px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px">✕</button></div>';
  }

  /* Build Custom Keywords list */
  var kwRows='';
  var allKwRules=[];
  /* Add normal rules with type marker */
  if(cc.customTimeRules){
    for(var i=0;i<cc.customTimeRules.length;i++){
      allKwRules.push({rule:cc.customTimeRules[i],type:'normal',originalIdx:i});
    }
  }
  /* Add ramadan rules with type marker */
  if(cc.customRamadanRules){
    for(var i=0;i<cc.customRamadanRules.length;i++){
      allKwRules.push({rule:cc.customRamadanRules[i],type:'ramadan',originalIdx:i});
    }
  }
  for(var i=0;i<allKwRules.length;i++){
    var item=allKwRules[i];
    var kr=item.rule;
    var isRm=item.type==='ramadan';
    kwRows+='<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:'+(isRm?'rgba(251,191,36,0.04)':'rgba(139,92,246,0.04)')+';border-radius:8px;border:1px solid '+(isRm?'rgba(251,191,36,0.12)':'rgba(139,92,246,0.08)')+';direction:rtl"><span style="font-size:12px;font-weight:800;color:#1e1b4b;flex:1">'+kr.pattern+'</span><span style="font-size:11px;font-weight:800;color:#6366f1;background:rgba(99,102,241,0.06);padding:2px 8px;border-radius:6px;direction:ltr">'+kr.time+'</span>'+(kr.label?'<span style="font-size:9px;font-weight:700;color:#94a3b8">'+kr.label+'</span>':'')+'<button class="ez-cfg-del-kw" data-idx="'+i+'" data-type="'+item.type+'" data-original-idx="'+item.originalIdx+'" style="width:22px;height:22px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px;flex-shrink:0">✕</button></div>';
  }
  if(allKwRules.length===0) kwRows='<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;font-weight:700">لا توجد كلمات مخصصة بعد</div>';

  /* Build Users list (admin only) */
  var usrRows='';var usrRows_count=0;
  if(isAdmin){
    var users=loadUsers();usrRows_count=users.length;
    for(var i=0;i<users.length;i++){
      usrRows+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;background:rgba(245,158,11,0.04);border-radius:8px;border:1px solid rgba(245,158,11,0.1);direction:rtl"><span style="width:28px;height:28px;border-radius:8px;background:linear-gradient(145deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;font-weight:900;flex-shrink:0">👤</span><span style="flex:1;font-size:12px;font-weight:800;color:#1e1b4b">'+users[i].name+'</span><span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 6px;border-radius:4px">مستخدم</span><button class="ez-cfg-del-usr" data-idx="'+i+'" style="width:24px;height:24px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px;flex-shrink:0">✕</button></div>';
    }
    if(users.length===0) usrRows='<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;font-weight:700">لا يوجد مستخدمين بعد</div>';
  }

  function timeInput(id,label,value,icon){
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(241,245,249,0.5);border-radius:10px;border:1px solid rgba(129,140,248,0.06);margin-bottom:6px"><span style="font-size:14px;flex-shrink:0">'+icon+'</span><span style="flex:1;font-size:11px;font-weight:700;color:#64748b;direction:rtl">'+label+'</span><input type="time" id="'+id+'" value="'+value+'" style="width:110px;padding:4px 8px;border:1.5px solid rgba(129,140,248,0.12);border-radius:8px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;text-align:center" /></div>';
  }

  overlay.innerHTML='<div style="background:#fff;border-radius:24px;width:580px;max-width:96vw;max-height:90vh;overflow:hidden;box-shadow:0 30px 80px rgba(99,102,241,0.2);border:2px solid rgba(129,140,248,0.12);animation:ezWnSlideUp 0.5s cubic-bezier(0.16,1,0.3,1);display:flex;flex-direction:column">\
    <div style="padding:18px 24px 14px;display:flex;align-items:center;gap:14px;border-bottom:2px solid rgba(129,140,248,0.08);background:linear-gradient(180deg,rgba(99,102,241,0.03),transparent);flex-shrink:0">\
      <div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,'+(isAdmin?'#6366f1,#4f46e5':'#10b981,#059669')+');display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 20px '+(isAdmin?'rgba(99,102,241,0.3)':'rgba(16,185,129,0.3)')+'">⚙️</div>\
      <div style="flex:1"><div style="font-size:17px;font-weight:900;color:#1e1b4b">لوحة الإعدادات</div><div style="font-size:10px;font-weight:700;margin-top:1px;display:flex;align-items:center;gap:6px"><span style="color:#94a3b8">مرحباً</span><span style="color:'+(isAdmin?'#6366f1':'#10b981')+';background:'+(isAdmin?'rgba(99,102,241,0.08)':'rgba(16,185,129,0.08)')+';padding:1px 8px;border-radius:6px;font-size:9px">'+(isAdmin?'🔑 Admin':'👤 '+userName)+'</span></div></div>\
      <button onclick="document.getElementById(\'ez-settings-overlay\').remove()" style="width:32px;height:32px;border-radius:10px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.04);color:#94a3b8;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>\
    </div>\
    <div style="flex:1;overflow-y:auto;padding:16px 22px">\
      <div style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap" id="ez-cfg-tabs">\
        <button class="ez-cfg-tab active" data-tab="ramadan" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:linear-gradient(145deg,#6366f1,#4f46e5);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">🌙 أوقات رمضان</button>\
        <button class="ez-cfg-tab" data-tab="normal" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">⏰ الأوقات العادية</button>\
        <button class="ez-cfg-tab" data-tab="keywords" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">📝 كلمات مخصصة</button>\
        '+(isAdmin?'<button class="ez-cfg-tab" data-tab="codes" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">💊 أكواد الأصناف</button>':'')+'\
        '+(isAdmin?'<button class="ez-cfg-tab" data-tab="weekly" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">🗓️ الجرعات الأسبوعية</button>':'')+'\
        '+(isAdmin?'<button class="ez-cfg-tab" data-tab="users" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">👥 إدارة المستخدمين</button>':'')+'\
      </div>\
      <div id="ez-cfg-panel-ramadan" class="ez-cfg-panel">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🌙</span> أوقات جرعات رمضان الأساسية</div>\
        '+timeInput('cfg-rm-bi','قبل الفطار',RT.beforeIftar,'🌅')+'\
        '+timeInput('cfg-rm-ai','بعد الفطار',RT.afterIftar,'🍽️')+'\
        '+timeInput('cfg-rm-bs','قبل السحور',RT.beforeSuhoor,'🌃')+'\
        '+timeInput('cfg-rm-as','بعد السحور',RT.afterSuhoor,'🌄')+'\
        '+(function(){
          var customHtml='';
          if(cc.customRamadanRules&&cc.customRamadanRules.length>0){
            customHtml+='<div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(251,191,36,0.12)"><div style="font-size:11px;font-weight:800;color:#f59e0b;margin-bottom:8px;display:flex;align-items:center;gap:6px"><span style="font-size:14px">✨</span> أوقات مخصصة</div>';
            for(var i=0;i<cc.customRamadanRules.length;i++){
              var cr=cc.customRamadanRules[i];
              customHtml+='<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(251,191,36,0.04);border-radius:10px;border:1px solid rgba(251,191,36,0.08);margin-bottom:6px"><span style="font-size:12px;width:18px;text-align:center">⭐</span><span style="flex:1;font-size:11px;font-weight:700;color:#64748b;direction:rtl">'+cr.label+'</span><input type="time" id="cfg-rm-custom-'+i+'" value="'+cr.time+'" data-pattern="'+cr.pattern+'" style="width:110px;padding:4px 8px;border:1.5px solid rgba(251,191,36,0.15);border-radius:8px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;text-align:center" /><button class="ez-cfg-del-rm-custom" data-idx="'+i+'" style="width:24px;height:24px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px;flex-shrink:0">✕</button></div>';
            }
            customHtml+='</div>';
          }
          return customHtml;
        })()+'\
      </div>\
      <div id="ez-cfg-panel-normal" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">⏰</span> أوقات الجرعات العادية الأساسية</div>\
        '+timeInput('cfg-nt-empty','على الريق',NT.empty,'🌅')+'\
        '+timeInput('cfg-nt-bm','قبل الأكل',NT.beforeMeal,'🍴')+'\
        '+timeInput('cfg-nt-bb','قبل الفطار',NT.beforeBreakfast,'☀️')+'\
        '+timeInput('cfg-nt-ab','بعد الفطار',NT.afterBreakfast,'🌤️')+'\
        '+timeInput('cfg-nt-morn','الصباح',NT.morning,'🌞')+'\
        '+timeInput('cfg-nt-noon','الظهر',NT.noon,'☀️')+'\
        '+timeInput('cfg-nt-bl','قبل الغداء',NT.beforeLunch,'🍽️')+'\
        '+timeInput('cfg-nt-al','بعد الغداء',NT.afterLunch,'🥗')+'\
        '+timeInput('cfg-nt-aftn','العصر',NT.afternoon,'🌇')+'\
        '+timeInput('cfg-nt-magh','المغرب',NT.maghrib,'🌆')+'\
        '+timeInput('cfg-nt-bd','قبل العشاء',NT.beforeDinner,'🌙')+'\
        '+timeInput('cfg-nt-ad','بعد العشاء',NT.afterDinner,'🍲')+'\
        '+timeInput('cfg-nt-eve','المساء',NT.evening,'🌃')+'\
        '+timeInput('cfg-nt-bed','قبل النوم',NT.bed,'😴')+'\
        '+timeInput('cfg-nt-def','الافتراضي',NT.defaultTime,'⏱️')+'\
        '+(function(){
          var customHtml='';
          if(cc.customTimeRules&&cc.customTimeRules.length>0){
            customHtml+='<div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(129,140,248,0.12)"><div style="font-size:11px;font-weight:800;color:#6366f1;margin-bottom:8px;display:flex;align-items:center;gap:6px"><span style="font-size:14px">✨</span> أوقات مخصصة</div>';
            for(var i=0;i<cc.customTimeRules.length;i++){
              var cr=cc.customTimeRules[i];
              customHtml+='<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(139,92,246,0.04);border-radius:10px;border:1px solid rgba(139,92,246,0.08);margin-bottom:6px"><span style="font-size:12px;width:18px;text-align:center">⭐</span><span style="flex:1;font-size:11px;font-weight:700;color:#64748b;direction:rtl">'+cr.label+'</span><input type="time" id="cfg-nt-custom-'+i+'" value="'+cr.time+'" data-pattern="'+cr.pattern+'" style="width:110px;padding:4px 8px;border:1.5px solid rgba(139,92,246,0.15);border-radius:8px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;text-align:center" /><button class="ez-cfg-del-nt-custom" data-idx="'+i+'" style="width:24px;height:24px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px;flex-shrink:0">✕</button></div>';
            }
            customHtml+='</div>';
          }
          return customHtml;
        })()+'\
      </div>\
      '+(isAdmin?'<div id="ez-cfg-panel-codes" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">💊</span> أكواد الأصناف ذات الحجم الثابت <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+fscKeys.length+' كود</span></div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:ltr"><input type="text" id="ez-cfg-new-code" placeholder="كود الصنف" style="flex:1;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:ltr" /><input type="number" id="ez-cfg-new-count" placeholder="العدد" style="width:70px;padding:8px 10px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center" /><button id="ez-cfg-add-fsc" style="padding:0 16px;border:none;border-radius:10px;background:linear-gradient(145deg,#10b981,#059669);color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(16,185,129,0.2)">+ إضافة</button></div>\
        <div style="max-height:280px;overflow-y:auto;border:1px solid rgba(129,140,248,0.08);border-radius:12px"><table style="width:100%;border-collapse:collapse" id="ez-cfg-fsc-table"><thead><tr style="background:linear-gradient(145deg,#f8f7ff,#eef2ff)"><th style="padding:8px;font-size:10px;font-weight:800;color:#6366f1;text-align:right">الكود</th><th style="padding:8px;font-size:10px;font-weight:800;color:#6366f1;text-align:center">العدد</th><th style="padding:8px;width:40px"></th></tr></thead><tbody>'+fscRows+'</tbody></table></div>\
      </div>\
      <div id="ez-cfg-panel-weekly" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🗓️</span> أكواد الجرعات الأسبوعية <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+weeklyInjections.length+' كود</span></div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:ltr"><input type="text" id="ez-cfg-new-wi" placeholder="كود الجرعة الأسبوعية" style="flex:1;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:ltr" /><button id="ez-cfg-add-wi" style="padding:0 16px;border:none;border-radius:10px;background:linear-gradient(145deg,#06b6d4,#0891b2);color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(6,182,212,0.2)">+ إضافة</button></div>\
        <div id="ez-cfg-wi-list">'+wiRows+'</div>\
      </div>':'')+'\
      <div id="ez-cfg-panel-keywords" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:6px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">📝</span> كلمات مخصصة للجرعات</div>\
        <div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:12px;direction:rtl;line-height:1.6;padding:8px 10px;background:rgba(99,102,241,0.03);border-radius:8px;border:1px solid rgba(129,140,248,0.06)">أضف كلمة أو عبارة مخصصة وحدد نوعها: للأوقات العادية أو لأوقات رمضان.<br>مثال للعادي: "بعد الغروب" → 18:45<br>مثال لرمضان: "بعد التراويح" → بعد الفطار</div>\
        \
        <div style="margin-bottom:16px;padding:12px;background:rgba(99,102,241,0.04);border-radius:10px;border:1px solid rgba(129,140,248,0.08)">\
          <div style="font-size:11px;font-weight:800;color:#6366f1;margin-bottom:8px">⏰ إضافة للأوقات العادية</div>\
          <div style="display:flex;gap:6px;direction:rtl;flex-wrap:wrap;align-items:end">\
            <div style="flex:1;min-width:140px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">الكلمة / العبارة</label><input type="text" id="ez-cfg-new-kw-normal" placeholder="مثال: بعد الغروب" style="width:100%;padding:8px 10px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:12px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:rtl" /></div>\
            <div style="width:100px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">الوقت</label><input type="time" id="ez-cfg-new-kw-normal-time" value="09:00" style="width:100%;padding:8px 6px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:12px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>\
            <button id="ez-cfg-add-kw-normal" style="padding:8px 14px;border:none;border-radius:10px;background:linear-gradient(145deg,#8b5cf6,#7c3aed);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(139,92,246,0.2);white-space:nowrap">+ إضافة</button>\
          </div>\
        </div>\
        \
        <div style="margin-bottom:12px;padding:12px;background:rgba(251,191,36,0.04);border-radius:10px;border:1px solid rgba(251,191,36,0.12)">\
          <div style="font-size:11px;font-weight:800;color:#f59e0b;margin-bottom:8px">🌙 إضافة لأوقات رمضان</div>\
          <div style="display:flex;gap:6px;direction:rtl;flex-wrap:wrap;align-items:end">\
            <div style="flex:1;min-width:140px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">الكلمة / العبارة</label><input type="text" id="ez-cfg-new-kw-ramadan" placeholder="مثال: بعد التراويح" style="width:100%;padding:8px 10px;border:1.5px solid rgba(251,191,36,0.15);border-radius:10px;font-size:12px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:rtl" /></div>\
            <div style="width:140px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">اسم الجرعة</label><input type="text" id="ez-cfg-new-kw-ramadan-label" placeholder="مثال: بعد الفطار" style="width:100%;padding:8px 6px;border:1.5px solid rgba(251,191,36,0.15);border-radius:10px;font-size:11px;font-weight:700;font-family:Cairo,sans-serif;outline:none;text-align:center;direction:rtl" /></div>\
            <div style="width:100px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">الوقت</label><input type="time" id="ez-cfg-new-kw-ramadan-time" value="19:00" style="width:100%;padding:8px 6px;border:1.5px solid rgba(251,191,36,0.15);border-radius:10px;font-size:12px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>\
            <button id="ez-cfg-add-kw-ramadan" style="padding:8px 14px;border:none;border-radius:10px;background:linear-gradient(145deg,#fbbf24,#f59e0b);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(251,191,36,0.2);white-space:nowrap">+ إضافة</button>\
          </div>\
        </div>\
        \
        <div id="ez-cfg-kw-list">'+kwRows+'</div>\
      </div>\
      '+(isAdmin?'<div id="ez-cfg-panel-users" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">👥</span> إدارة المستخدمين <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+usrRows_count+' مستخدم</span></div>\
        <div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:12px;direction:rtl;padding:6px 10px;background:rgba(99,102,241,0.03);border-radius:8px;border:1px solid rgba(129,140,248,0.06)">المستخدم يقدر يعدل على الأوقات والكلمات المخصصة فقط. لا يمكنه إنشاء مستخدمين آخرين أو تعديل الأكواد.</div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:rtl;flex-wrap:wrap;align-items:end">\
          <div style="flex:1;min-width:100px"><label style="display:block;font-size:9px;font-weight:800;color:#6366f1;margin-bottom:3px">اسم المستخدم</label><input type="text" id="ez-cfg-new-usr-name" placeholder="مثال: أحمد" style="width:100%;padding:8px 10px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:12px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:rtl" /></div>\
          <div style="width:120px"><label style="display:block;font-size:9px;font-weight:800;color:#6366f1;margin-bottom:3px">الرقم السري</label><input type="password" id="ez-cfg-new-usr-pin" placeholder="رقم سري" style="width:100%;padding:8px 10px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:12px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center;letter-spacing:3px" /></div>\
          <button id="ez-cfg-add-usr" style="padding:8px 14px;border:none;border-radius:10px;background:linear-gradient(145deg,#f59e0b,#d97706);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(245,158,11,0.2);white-space:nowrap">+ إضافة مستخدم</button>\
        </div>\
        <div id="ez-cfg-usr-list">'+usrRows+'</div>\
      </div>':'')+'\
    </div>\
    <div style="padding:12px 22px 16px;border-top:2px solid rgba(129,140,248,0.06);display:flex;gap:8px;flex-shrink:0;background:rgba(241,245,249,0.4)">\
      <button id="ez-cfg-save" style="flex:1;height:46px;border:none;border-radius:14px;font-size:14px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 16px rgba(16,185,129,0.25);transition:all 0.3s">💾 حفظ التعديلات</button>\
      <button id="ez-cfg-reset" style="height:46px;padding:0 18px;border:1.5px solid rgba(239,68,68,0.15);border-radius:14px;background:rgba(239,68,68,0.03);color:#ef4444;cursor:pointer;font-size:12px;font-weight:800;font-family:Cairo,sans-serif;transition:all 0.3s">🗑️ استعادة الافتراضي</button>\
    </div>\
  </div>';

  document.body.appendChild(overlay);
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};

  /* Tab switching */
  var tabs=overlay.querySelectorAll('.ez-cfg-tab');
  tabs.forEach(function(tab){
    tab.onclick=function(){
      tabs.forEach(function(t){t.style.background='#fff';t.style.color='#6366f1';t.classList.remove('active');});
      this.style.background='linear-gradient(145deg,#6366f1,#4f46e5)';this.style.color='#fff';this.classList.add('active');
      var panels=overlay.querySelectorAll('.ez-cfg-panel');panels.forEach(function(p){p.style.display='none';});
      document.getElementById('ez-cfg-panel-'+this.getAttribute('data-tab')).style.display='block';
    };
  });

  /* Add Fixed Size Code (admin only) */
  if(isAdmin && document.getElementById('ez-cfg-add-fsc')){
  document.getElementById('ez-cfg-add-fsc').onclick=function(){
    var code=document.getElementById('ez-cfg-new-code').value.trim();
    var count=parseInt(document.getElementById('ez-cfg-new-count').value);
    if(!code||!count||count<1){window.ezShowToast('أدخل الكود والعدد','warning');return;}
    var c2=loadCustomConfig();if(!c2.fixedSizeCodes)c2.fixedSizeCodes={};
    c2.fixedSizeCodes[code]=count;saveCustomConfig(c2);
    window.ezShowToast('✅ تم إضافة كود '+code+' = '+count,'success');
    overlay.remove();_ezShowSettingsPanel(role,userName);
  };

  /* Delete Fixed Size Code */
  overlay.querySelectorAll('.ez-cfg-del-fsc').forEach(function(btn){
    btn.onclick=function(){
      var code=this.getAttribute('data-code');
      var c2=loadCustomConfig();if(!c2.removedCodes)c2.removedCodes=[];
      if(c2.removedCodes.indexOf(code)===-1)c2.removedCodes.push(code);
      if(c2.fixedSizeCodes)delete c2.fixedSizeCodes[code];
      saveCustomConfig(c2);
      window.ezShowToast('🗑️ تم حذف كود '+code,'info');
      overlay.remove();_ezShowSettingsPanel(role,userName);
    };
  });

  /* Update Fixed Size Code values on change */
  overlay.querySelectorAll('.ez-cfg-fsc-val').forEach(function(inp){
    inp.onchange=function(){
      var code=this.getAttribute('data-code');var val=parseInt(this.value);
      if(!val||val<1)return;
      var c2=loadCustomConfig();if(!c2.fixedSizeCodes)c2.fixedSizeCodes={};
      c2.fixedSizeCodes[code]=val;saveCustomConfig(c2);
      this.style.borderColor='#10b981';setTimeout(function(){inp.style.borderColor='rgba(129,140,248,0.15)';},1000);
    };
  });

  /* Add Weekly Injection */
  if(document.getElementById('ez-cfg-add-wi')){
  document.getElementById('ez-cfg-add-wi').onclick=function(){
    var code=document.getElementById('ez-cfg-new-wi').value.trim();
    if(!code){window.ezShowToast('أدخل الكود','warning');return;}
    var c2=loadCustomConfig();if(!c2.addedWeekly)c2.addedWeekly=[];
    if(c2.addedWeekly.indexOf(code)===-1)c2.addedWeekly.push(code);
    saveCustomConfig(c2);
    window.ezShowToast('✅ تم إضافة جرعة أسبوعية '+code,'success');
    overlay.remove();_ezShowSettingsPanel(role,userName);
  };}

  /* Delete Weekly Injection */
  overlay.querySelectorAll('.ez-cfg-del-wi').forEach(function(btn){
    btn.onclick=function(){
      var code=this.getAttribute('data-code');
      var c2=loadCustomConfig();if(!c2.removedWeekly)c2.removedWeekly=[];
      if(c2.removedWeekly.indexOf(code)===-1)c2.removedWeekly.push(code);
      if(c2.addedWeekly){c2.addedWeekly=c2.addedWeekly.filter(function(c){return c!==code;});}
      saveCustomConfig(c2);
      window.ezShowToast('🗑️ تم حذف '+code,'info');
      overlay.remove();_ezShowSettingsPanel(role,userName);
    };
  });
  }/* end isAdmin guard for codes+weekly */

  /* Add Custom Keyword for NORMAL times */
  if(document.getElementById('ez-cfg-add-kw-normal')){
  document.getElementById('ez-cfg-add-kw-normal').onclick=function(){
    var kw=document.getElementById('ez-cfg-new-kw-normal').value.trim();
    var kwTime=document.getElementById('ez-cfg-new-kw-normal-time').value;
    if(!kw){window.ezShowToast('أدخل الكلمة أو العبارة','warning');return;}
    /* Escape special regex chars but keep it as a simple text match */
    var pattern=kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    var c2=loadCustomConfig();
    if(!c2.customTimeRules)c2.customTimeRules=[];
    /* Check for duplicate */
    for(var i=0;i<c2.customTimeRules.length;i++){if(c2.customTimeRules[i].pattern===pattern){window.ezShowToast('الكلمة موجودة بالفعل','warning');return;}}
    c2.customTimeRules.push({pattern:pattern,time:kwTime,label:kw});
    saveCustomConfig(c2);
    window.ezShowToast('✅ تم إضافة "'+kw+'" للأوقات العادية → '+kwTime,'success');
    overlay.remove();_ezShowSettingsPanel(role,userName);
  };
  }

  /* Add Custom Keyword for RAMADAN times */
  var addRamadanBtn=document.getElementById('ez-cfg-add-kw-ramadan');
  if(addRamadanBtn){
    console.log('Ramadan button found, attaching event');
    addRamadanBtn.onclick=function(){
      try{
        console.log('Ramadan button clicked');
        var kwInput=document.getElementById('ez-cfg-new-kw-ramadan');
        var kwLabelInput=document.getElementById('ez-cfg-new-kw-ramadan-label');
        var kwTimeInput=document.getElementById('ez-cfg-new-kw-ramadan-time');
        
        if(!kwInput||!kwLabelInput||!kwTimeInput){
          console.error('Missing inputs:',{kw:!!kwInput,label:!!kwLabelInput,time:!!kwTimeInput});
          window.ezShowToast('❌ خطأ: الحقول غير موجودة','error');
          ezBeep('error');
          return;
        }
        
        var kw=kwInput.value.trim();
        var kwLabel=kwLabelInput.value.trim();
        var kwTime=kwTimeInput.value;
        
        /* If label is empty, use the keyword as label */
        if(!kwLabel && kw){
          kwLabel=kw;
          console.log('Label empty, using keyword as label:',kwLabel);
        }
        
        console.log('Values: kw=',kw,'label=',kwLabel,'time=',kwTime);
        
        if(!kw){window.ezShowToast('أدخل الكلمة أو العبارة','warning');ezBeep('warning');return;}
        if(!kwLabel){window.ezShowToast('أدخل اسم الجرعة أو الكلمة','warning');ezBeep('warning');return;}
        if(!kwTime){window.ezShowToast('أدخل الوقت','warning');ezBeep('warning');return;}
        
        /* Escape special regex chars but keep it as a simple text match */
        var pattern=kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        var c2=loadCustomConfig();
        if(!c2.customRamadanRules)c2.customRamadanRules=[];
        
        console.log('Current ramadan rules:',c2.customRamadanRules.length);
        
        /* Check for duplicate in ramadan rules */
        for(var i=0;i<c2.customRamadanRules.length;i++){
          if(c2.customRamadanRules[i].pattern===pattern){
            window.ezShowToast('⚠️ الكلمة موجودة بالفعل في أوقات رمضان','warning');
            ezBeep('warning');
            console.log('Duplicate in ramadan');
            return;
          }
        }
        /* Check for duplicate in normal rules too */
        if(c2.customTimeRules){
          for(var i=0;i<c2.customTimeRules.length;i++){
            if(c2.customTimeRules[i].pattern===pattern){
              window.ezShowToast('⚠️ الكلمة موجودة بالفعل في الأوقات العادية','warning');
              ezBeep('warning');
              console.log('Duplicate in normal');
              return;
            }
          }
        }
        /* Save with custom label and time */
        var newRule={pattern:pattern,meal:'custom',time:kwTime,label:kwLabel,label_ar:kwLabel,label_en:kwLabel};
        console.log('Saving rule:',newRule);
        c2.customRamadanRules.push(newRule);
        saveCustomConfig(c2);
        console.log('Saved successfully');
        window.ezShowToast('✅ تم إضافة "'+kw+'" لرمضان → '+kwLabel+' ('+kwTime+')','success');
        ezBeep('success');
        overlay.remove();_ezShowSettingsPanel(role,userName);
      }catch(e){
        console.error('Error in ramadan add:',e);
        window.ezShowToast('❌ خطأ: '+e.message,'error');
        ezBeep('error');
      }
    };
  }else{
    console.error('Ramadan add button NOT found!');
  }

  /* Delete Custom Keyword */
  overlay.querySelectorAll('.ez-cfg-del-kw').forEach(function(btn){
    btn.onclick=function(){
      var type=this.getAttribute('data-type');
      var originalIdx=parseInt(this.getAttribute('data-original-idx'));
      var c2=loadCustomConfig();
      if(type==='normal'){
        if(c2.customTimeRules&&c2.customTimeRules[originalIdx]){
          c2.customTimeRules.splice(originalIdx,1);
        }
      } else if(type==='ramadan'){
        if(c2.customRamadanRules&&c2.customRamadanRules[originalIdx]){
          c2.customRamadanRules.splice(originalIdx,1);
        }
      }
      saveCustomConfig(c2);
      window.ezShowToast('🗑️ تم حذف الكلمة المخصصة','info');
      overlay.remove();_ezShowSettingsPanel(role,userName);
    };
  });

  /* Delete Custom Ramadan time from main panel */
  overlay.querySelectorAll('.ez-cfg-del-rm-custom').forEach(function(btn){
    btn.onclick=function(){
      var idx=parseInt(this.getAttribute('data-idx'));
      var c2=loadCustomConfig();
      if(c2.customRamadanRules&&c2.customRamadanRules[idx]){
        var label=c2.customRamadanRules[idx].label;
        c2.customRamadanRules.splice(idx,1);
        saveCustomConfig(c2);
        window.ezShowToast('🗑️ تم حذف "'+label+'"','info');
        overlay.remove();_ezShowSettingsPanel(role,userName);
      }
    };
  });

  /* Delete Custom Normal time from main panel */
  overlay.querySelectorAll('.ez-cfg-del-nt-custom').forEach(function(btn){
    btn.onclick=function(){
      var idx=parseInt(this.getAttribute('data-idx'));
      var c2=loadCustomConfig();
      if(c2.customTimeRules&&c2.customTimeRules[idx]){
        var label=c2.customTimeRules[idx].label;
        c2.customTimeRules.splice(idx,1);
        saveCustomConfig(c2);
        window.ezShowToast('🗑️ تم حذف "'+label+'"','info');
        overlay.remove();_ezShowSettingsPanel(role,userName);
      }
    };
  });

  /* Update Custom Ramadan times on change */
  for(var cri=0;cri<(cc.customRamadanRules||[]).length;cri++){
    (function(idx){
      var inp=document.getElementById('cfg-rm-custom-'+idx);
      if(inp){
        inp.onchange=function(){
          var newTime=this.value;
          var c2=loadCustomConfig();
          if(c2.customRamadanRules&&c2.customRamadanRules[idx]){
            c2.customRamadanRules[idx].time=newTime;
            saveCustomConfig(c2);
            this.style.borderColor='#10b981';
            setTimeout(function(){inp.style.borderColor='rgba(251,191,36,0.15)';},1000);
          }
        };
      }
    })(cri);
  }

  /* Update Custom Normal times on change */
  for(var cni=0;cni<(cc.customTimeRules||[]).length;cni++){
    (function(idx){
      var inp=document.getElementById('cfg-nt-custom-'+idx);
      if(inp){
        inp.onchange=function(){
          var newTime=this.value;
          var c2=loadCustomConfig();
          if(c2.customTimeRules&&c2.customTimeRules[idx]){
            c2.customTimeRules[idx].time=newTime;
            saveCustomConfig(c2);
            this.style.borderColor='#10b981';
            setTimeout(function(){inp.style.borderColor='rgba(139,92,246,0.15)';},1000);
          }
        };
      }
    })(cni);
  }

  /* Add User (admin only) */
  if(isAdmin && document.getElementById('ez-cfg-add-usr')){
    document.getElementById('ez-cfg-add-usr').onclick=function(){
      var uName=document.getElementById('ez-cfg-new-usr-name').value.trim();
      var uPin=document.getElementById('ez-cfg-new-usr-pin').value.trim();
      if(!uName||!uPin){window.ezShowToast('أدخل الاسم والرقم السري','warning');return;}
      if(uPin.length<4){window.ezShowToast('الرقم السري لازم 4 أرقام على الأقل','warning');return;}
      var hash=_ezHashPin(uPin);
      if(hash===_EZ_PIN_HASH){window.ezShowToast('لا يمكن استخدام رقم الأدمن','warning');return;}
      var users=loadUsers();
      for(var i=0;i<users.length;i++){if(users[i].hash===hash){window.ezShowToast('الرقم السري مستخدم بالفعل','warning');return;}}
      users.push({name:uName,hash:hash});saveUsers(users);
      window.ezShowToast('✅ تم إضافة المستخدم '+uName,'success');
      overlay.remove();_ezShowSettingsPanel(role,userName);
    };
  }

  /* Delete User (admin only) */
  overlay.querySelectorAll('.ez-cfg-del-usr').forEach(function(btn){
    btn.onclick=function(){
      var idx=parseInt(this.getAttribute('data-idx'));
      var users=loadUsers();
      var delName=users[idx]?users[idx].name:'';
      users.splice(idx,1);saveUsers(users);
      window.ezShowToast('🗑️ تم حذف المستخدم '+delName,'info');
      overlay.remove();_ezShowSettingsPanel(role,userName);
    };
  });

  /* SAVE ALL */
  document.getElementById('ez-cfg-save').onclick=function(){
    var c2=loadCustomConfig();
    /* Ramadan times */
    c2.ramadanTimes={
      beforeIftar:document.getElementById('cfg-rm-bi').value,
      afterIftar:document.getElementById('cfg-rm-ai').value,
      beforeSuhoor:document.getElementById('cfg-rm-bs').value,
      afterSuhoor:document.getElementById('cfg-rm-as').value
    };
    /* Normal times */
    c2.normalTimes={
      empty:document.getElementById('cfg-nt-empty').value,
      beforeMeal:document.getElementById('cfg-nt-bm').value,
      beforeBreakfast:document.getElementById('cfg-nt-bb').value,
      afterBreakfast:document.getElementById('cfg-nt-ab').value,
      morning:document.getElementById('cfg-nt-morn').value,
      noon:document.getElementById('cfg-nt-noon').value,
      beforeLunch:document.getElementById('cfg-nt-bl').value,
      afterLunch:document.getElementById('cfg-nt-al').value,
      afternoon:document.getElementById('cfg-nt-aftn').value,
      maghrib:document.getElementById('cfg-nt-magh').value,
      beforeDinner:document.getElementById('cfg-nt-bd').value,
      afterDinner:document.getElementById('cfg-nt-ad').value,
      evening:document.getElementById('cfg-nt-eve').value,
      bed:document.getElementById('cfg-nt-bed').value,
      defaultTime:document.getElementById('cfg-nt-def').value
    };
    saveCustomConfig(c2);
    overlay.remove();
    window.ezShowToast('✅ تم حفظ جميع الإعدادات - أعد تشغيل الأداة لتطبيقها','success');
    ezBeep('success');
  };

  /* RESET */
  document.getElementById('ez-cfg-reset').onclick=function(){
    if(!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟ سيتم حذف جميع التعديلات.')) return;
    localStorage.removeItem(EZ_CUSTOM_KEY);
    overlay.remove();
    window.ezShowToast('🔄 تم استعادة الإعدادات الافتراضية - أعد تشغيل الأداة','info');
  };
}
var hasDuplicateNotes=scanForDuplicateNotes();
var _rm_setting=savedSettings.ramadanMode||false;
/* Ramadan mode: post dialog is shown ONLY after processing if actual duplicates were created */
/* We don't force hasDuplicateNotes=true here anymore */

var d_box=document.createElement('div');
d_box.id='ez-dialog-box';
d_box.className='ez-dialog-v2';
d_box.setAttribute('data-m',String(savedSettings.m||1));
d_box.setAttribute('data-t',String(savedSettings.t||30));
var _m=savedSettings.m||1,_t=savedSettings.t||30,_ad=savedSettings.autoDuration!==false,_sw=savedSettings.showWarnings!==false,_dk=savedSettings.darkMode||false,_rm=savedSettings.ramadanMode||false;
d_box.innerHTML='\
<div class="ez-header">\
  <div class="ez-logo-group">\
    <div class="ez-logo">💊</div>\
    <div class="ez-title-block">\
      <div class="ez-title">EZ_Pill <span class="ez-brand">Farmadosis</span></div>\
      <div class="ez-subtitle">معالج الجرعات الذكي</div>\
    </div>\
  </div>\
  <div class="ez-header-actions">\
    <div class="ez-version">v'+APP_VERSION+'</div>\
    <button class="ez-btn-icon" onclick="window.ezOpenSettings()" title="إعدادات متقدمة" style="font-size:14px">⚙️</button>\
    <button class="ez-btn-icon" onclick="window.ezToggleDark()" title="الوضع الليلي" style="font-size:14px">'+(_dk?'☀️':'🌙')+'</button>\
    <button class="ez-btn-icon ez-btn-icon-min" onclick="window.ezMinimize()">−</button>\
  </div>\
</div>\
<div class="ez-content">\
  <div class="ez-section-label"><span class="dot">📅</span><span>عدد الأشهر</span></div>\
  <div class="ez-pill-group">\
    <button class="ez-pill '+(_m===1?'active':'')+'" onclick="window.ezSelect(this,\'m\',1)"><span>1</span><span class="ez-pill-sub">شهر</span></button>\
    <button class="ez-pill '+(_m===2?'active':'')+'" onclick="window.ezSelect(this,\'m\',2)"><span>2</span><span class="ez-pill-sub">شهرين</span></button>\
    <button class="ez-pill '+(_m===3?'active':'')+'" onclick="window.ezSelect(this,\'m\',3)"><span>3</span><span class="ez-pill-sub">٣ شهور</span></button>\
  </div>\
  <div class="ez-section-label"><span class="dot">🗓️</span><span>أيام الشهر</span></div>\
  <div class="ez-pill-group">\
    <button class="ez-pill '+(_t===28?'active':'')+'" onclick="window.ezSelect(this,\'t\',28)"><span>28</span><span class="ez-pill-sub">يوم</span></button>\
    <button class="ez-pill '+(_t===30?'active':'')+'" onclick="window.ezSelect(this,\'t\',30)"><span>30</span><span class="ez-pill-sub">يوم</span></button>\
  </div>\
  <div class="ez-sep"></div>\
  <label class="ez-toggle-row '+(_ad?'ez-tog-on':'')+'" onclick="var t=this;setTimeout(function(){t.classList.toggle(\'ez-tog-on\',t.querySelector(\'input\').checked)},10)">\
    <div class="ez-switch"><input type="checkbox" id="auto-duration" '+(_ad?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">استخراج المدة تلقائياً</span>\
    <span class="ez-toggle-icon">✨</span>\
  </label>\
  <label class="ez-toggle-row '+(_sw?'ez-tog-on':'')+'" onclick="var t=this;setTimeout(function(){t.classList.toggle(\'ez-tog-on\',t.querySelector(\'input\').checked)},10)">\
    <div class="ez-switch"><input type="checkbox" id="show-warnings" '+(_sw?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">عرض التحذيرات</span>\
    <span class="ez-toggle-icon">⚠️</span>\
  </label>\
  <label class="ez-toggle-row '+(hasDuplicateNotes?'ez-tog-on':'')+'" onclick="var t=this;setTimeout(function(){t.classList.toggle(\'ez-tog-on\',t.querySelector(\'input\').checked)},10)">\
    <div class="ez-switch"><input type="checkbox" id="show-post-dialog" '+(hasDuplicateNotes?'checked':'')+'><div class="ez-switch-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">خيارات إضافية'+(hasDuplicateNotes?' <span class="auto-tag">تقسيم مكتشف</span>':'')+'</span>\
    <span class="ez-toggle-icon">⚙️</span>\
  </label>\
  <label class="ez-toggle-row ez-ramadan-toggle '+(_rm?'ez-tog-on':'')+'" onclick="var t=this;setTimeout(function(){var ch=t.querySelector(\'input\').checked;t.classList.toggle(\'ez-tog-on\',ch);var badge=document.getElementById(\'ez-ramadan-badge\');if(badge)badge.style.display=ch?\'flex\':\'none\';},10)">\
    <div class="ez-switch"><input type="checkbox" id="ramadan-mode" '+(_rm?'checked':'')+'><div class="ez-switch-track ez-ramadan-track"></div><div class="ez-switch-knob"></div></div>\
    <span class="ez-toggle-text">جرعات شهر رمضان</span>\
    <span class="ez-toggle-icon">🌙</span>\
  </label>\
  <div class="ez-actions">\
    <button class="ez-btn-primary" onclick="window.ezSubmit()">⚡ بدء المعالجة</button>\
    <button class="ez-btn-doses" onclick="window.ezShowDoses()" title="عرض الجرعات">📋</button>\
    <button class="ez-btn-cancel" onclick="window.ezCancel()">✕</button>\
  </div>\
</div>\
<div class="ez-footer"><span>EZ_PILL FARMADOSIS · V'+APP_VERSION+' · علي الباز</span></div>';

document.body.appendChild(d_box);
if(_dk) document.body.classList.add('ez-dark-mode');
/* Pulse effect on primary button */
setInterval(function(){var btn=document.querySelector('.ez-btn-primary');if(btn){btn.classList.toggle('ez-pulse');}},2000);

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

      /* Generic title words - NOT actual names */
      var genericWords=['الضيف','الضيفه','الضيفة','ضيف','ضيفه','ضيفة',
        'المريض','المريضه','المريضة','مريض','مريضه','مريضة',
        'العميل','العميله','العميلة','عميل','عميله','عميلة'];

      function isGeneric(w){
        var n=w.replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
        for(var g=0;g<genericWords.length;g++){
          if(n===genericWords[g].replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')) return true;
        }
        return false;
      }

      /* PRIORITY 1: Look for name in parentheses after keywords */
      var parenPatterns=[
        /(?:اسم|كتاب[ةه]\s*اسم|وكتاب[ةه]\s*اسم|باسم)\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?|عمي[لة]?)\s*\(([^)]+)\)/i,
        /(?:اسم|كتاب[ةه]\s*اسم|وكتاب[ةه]\s*اسم|باسم)\s*[:\-]?\s*\(([^)]+)\)/i
      ];
      for(var pp=0;pp<parenPatterns.length;pp++){
        var pm=s.match(parenPatterns[pp]);
        if(pm&&pm[1]&&pm[1].trim().length>=2){
          return pm[1].trim();
        }
      }

      /* PRIORITY 2: Standard Arabic name patterns */
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
          /* If first word is generic (الضيف/المريض), check for English name in parens after it */
          var firstWord=name.split(/\s+/)[0];
          if(isGeneric(firstWord)){
            var afterMatch=s.substring(s.indexOf(m[0])+m[0].length);
            var parenMatch=afterMatch.match(/^\s*\(([^)]+)\)/);
            if(parenMatch&&parenMatch[1]&&parenMatch[1].trim().length>=2){
              return parenMatch[1].trim();
            }
            /* Skip this match - الضيف is not a real name */
            continue;
          }
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

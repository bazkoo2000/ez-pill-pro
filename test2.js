javascript:(function(){
var APP_VERSION='141.0';
/* Load font non-blocking (single request) */
if(!document.getElementById('ez-cairo-font')){var _lnk=document.createElement('link');_lnk.id='ez-cairo-font';_lnk.rel='stylesheet';_lnk.href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';document.head.appendChild(_lnk);}
var APP_NAME='EZ_Pill Farmadosis';

/* ══════════════════════════════════════════
   WHAT'S NEW - CHANGELOG SYSTEM
   ══════════════════════════════════════════ */
var CHANGELOG={
  '141.0':{
    title:'🔧 إصلاحات منطقية + تحسينات واجهة المستخدم',
    features:[
      {icon:'🧮',text:'إصلاح مضاعفة الكميات: حبتين×28=56 صح (كان 112 غلط)'},
      {icon:'🧠',text:'تطوير دالة التكرار: تفهم بعد الفطار وقبل النوم / ظهراً وقبل النوم'},
      {icon:'🔒',text:'منع تغيير توقيت الجرعة: قبل الغداء والعشاء تظل قبل'},
      {icon:'⚠️',text:'تحذير "عبوة": لو الاسم فيه كلمة عبوة يحذرك ويفضي الحقل'},
      {icon:'📋',text:'زر عرض الجرعات انتقل بجوار الإعدادات المتقدمة'},
      {icon:'🌙',text:'حذف الوضع الليلي نهائياً'},
      {icon:'🔵',text:'إطار أزرق حول الخيارات المفعّلة'},
      {icon:'⚡',text:'تفعيل تلقائي للخيارات عند اكتشاف طلب تقسيم'},
      {icon:'🖨️',text:'زر تجميع للطباعة مرن: شهر / شهرين / ثلاثة'}
    ]
  }
};

/* ── helpers: read/write version from localStorage + cookie fallback ── */
function _ezGetSeenVersion(){
  try{
    var ls=localStorage.getItem('ez_pill_version');
    if(ls) return ls;
  }catch(e){}
  /* cookie fallback */
  try{
    var m=document.cookie.match(/(?:^|;\s*)ez_pill_version=([^;]+)/);
    if(m) return decodeURIComponent(m[1]);
  }catch(e){}
  return null;
}
function _ezSetSeenVersion(v){
  try{localStorage.setItem('ez_pill_version',v);}catch(e){}
  /* also set cookie with 1-year expiry as fallback */
  try{
    var exp=new Date();exp.setFullYear(exp.getFullYear()+1);
    document.cookie='ez_pill_version='+encodeURIComponent(v)+';expires='+exp.toUTCString()+';path=/;SameSite=Lax';
  }catch(e){}
}

function showWhatsNew(){
  try{
    var lastSeen=_ezGetSeenVersion();
    if(lastSeen===APP_VERSION) return;
    var info=CHANGELOG[APP_VERSION];
    /* No changelog entry for this version → silently mark as seen and skip */
    if(!info){_ezSetSeenVersion(APP_VERSION);return;}

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
      _ezSetSeenVersion(APP_VERSION);
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
/* PIN system removed - settings open to all */

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

/* ══════════════════════════════════════════
   🤖 GEMINI AI FALLBACK - للجرعات غير المفهومة فقط
   لا يتم إرسال أي بيانات شخصية — فقط نص الجرعة
   ══════════════════════════════════════════ */
function _ezGetGeminiKey(){try{return localStorage.getItem('ez_gemini_key')||'';}catch(e){return '';}}
function _ezGetGeminiModel(){try{return localStorage.getItem('ez_gemini_model')||'gemini-flash-latest';}catch(e){return 'gemini-flash-latest';}}
function _ezSetGeminiModel(m){try{localStorage.setItem('ez_gemini_model',m);}catch(e){}}
function _ezSetGeminiKey(k){try{localStorage.setItem('ez_gemini_key',k);}catch(e){}}

/* Prompt مصمم للصيدلة — يرجع JSON فقط */
var _GEMINI_PROMPT='You are a pharmacy dose interpreter for Saudi pharmacies.\n\nIMPORTANT RULES:\n- Words like حبه/حبة/قرص/كبسولة are UNIT WORDS meaning \"1 pill\" — they are NOT the dose count. Ignore them.\n- حبتين/قرصين = dose of 2 pills per time (set dose field to 2)\n- Focus ONLY on TIMING and FREQUENCY, not pill count.\n- Notes may have typos in Arabic (صبلح=صباحا، مسلء=مساء، etc). Interpret the intended meaning.\n\nReturn ONLY a JSON object:\n- count: times per day (1,2,3,4)\n- startTime: first dose HH:MM (24h)\n- every: hours between doses (24,12,8,6)\n- isBefore: true=before meals, false=after\n- dose: pills per time (1 unless حبتين/قرصين)\n- confidence: \"high\" or \"low\"\n- readable_ar: Arabic description WITHOUT pill count words\n\nExamples:\n\"حبه صباحا ومساء\" → {\"count\":2,\"startTime\":\"09:00\",\"every\":12,\"isBefore\":false,\"dose\":1,\"confidence\":\"high\",\"readable_ar\":\"مرتين صباحاً ومساءً\"}\n\"بعد الفطار والعشاء\" → {\"count\":2,\"startTime\":\"09:00\",\"every\":12,\"isBefore\":false,\"dose\":1,\"confidence\":\"high\",\"readable_ar\":\"مرتين بعد الفطار والعشاء\"}\n\"حبتين بعد الاكل\" → {\"count\":1,\"startTime\":\"09:00\",\"every\":24,\"isBefore\":false,\"dose\":2,\"confidence\":\"high\",\"readable_ar\":\"مرة بعد الأكل (حبتين)\"}\n\"once daily at night\" → {\"count\":1,\"startTime\":\"21:00\",\"every\":24,\"isBefore\":false,\"dose\":1,\"confidence\":\"high\",\"readable_ar\":\"مرة واحدة ليلاً\"}\n\"tid pc\" → {\"count\":3,\"startTime\":\"08:00\",\"every\":8,\"isBefore\":true,\"dose\":1,\"confidence\":\"high\",\"readable_ar\":\"ثلاث مرات قبل الأكل\"}';

async function _ezGeminiParse(noteText){
  var key=_ezGetGeminiKey();
  if(!key) return null;
  try{
    var resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key='+key,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts:[{text:_GEMINI_PROMPT+'\n\nNote: "'+noteText+'"'}]}],
        generationConfig:{temperature:0.1,maxOutputTokens:200,responseMimeType:'application/json'}
      })
    });
    if(!resp.ok) return null;
    var data=await resp.json();
    var text=(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text)||'';
    text=text.replace(/```json|```/g,'').trim();
    return JSON.parse(text);
  }catch(e){console.warn('Gemini error:',e);return null;}
}

/* Batch: parse multiple notes at once (more efficient) */
async function _ezGeminiBatch(notes){
  var key=_ezGetGeminiKey();
  if(!key||notes.length===0){console.log('🤖 Batch: no key or empty notes');return [];}
  console.log('🤖 Batch: sending '+notes.length+' notes to Gemini (model: '+_ezGetGeminiModel()+')...');
  var prompt=_GEMINI_PROMPT+'\n\nParse ALL of these notes. Return a JSON ARRAY with one object per note, in the same order:\n';
  for(var i=0;i<notes.length;i++) prompt+=(i+1)+'. "'+notes[i]+'"\n';
  var _model=_ezGetGeminiModel();
  var url='https://generativelanguage.googleapis.com/v1beta/models/'+_model+':generateContent?key='+key;
  console.log('🤖 URL:',url.replace(/key=.*/,'key=***'));
  var _body=JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.1,maxOutputTokens:1000,responseMimeType:'application/json'}});
  var resp=null;
  /* Retry up to 2 times with delay if rate limited (429) */
  for(var _retry=0;_retry<3;_retry++){
    resp=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:_body});
    console.log('🤖 Attempt '+(_retry+1)+': status='+resp.status);
    if(resp.status!==429) break;
    if(_retry<2){console.log('🤖 Rate limited, waiting 3s...');await new Promise(function(r){setTimeout(r,3000)});}
  }
  if(!resp||!resp.ok){
    var errText=resp?await resp.text():'No response';
    console.error('🤖 API Error:',errText);
    throw new Error('Gemini API '+(resp?resp.status:'?')+': '+(errText||'').substring(0,100));
  }
  var data=await resp.json();
  console.log('🤖 Raw response:',JSON.stringify(data).substring(0,200));
  var text=(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text)||'';
  console.log('🤖 Extracted text:',text);
  text=text.replace(/```json|```/g,'').trim();
  var parsed=JSON.parse(text);
  /* If single note sent, Gemini might return object instead of array */
  if(!Array.isArray(parsed)) parsed=[parsed];
  return parsed;
}

/* UI: Setup Gemini key (called from settings) */
window.ezSetupGemini=function(){
  var current=_ezGetGeminiKey();
  var masked=current?String.fromCharCode(8226).repeat(20)+current.slice(-6):'لم يتم التعيين';
  var statusColor=current?'#059669':'#dc2626';
  var statusText=current?'✅ مفعّل ('+_ezGetGeminiModel()+')':'❌ غير مفعّل';
  var overlay=document.createElement('div');
  overlay.id='ez-gemini-setup';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif';
  var card=document.createElement('div');
  card.style.cssText='width:380px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.2);border:2px solid rgba(129,140,248,0.12)';
  /* Header */
  var hdr=document.createElement('div');
  hdr.style.cssText='padding:18px 22px;border-bottom:1px solid rgba(129,140,248,0.08);display:flex;align-items:center;gap:10px';
  hdr.innerHTML='<div style="font-size:24px">🤖</div><div><div style="font-size:15px;font-weight:900;color:#1e1b4b">إعداد الذكاء الاصطناعي</div><div style="font-size:10px;font-weight:700;color:#64748b">جيميناي — لفهم الجرعات غير المعروفة</div></div>';
  card.appendChild(hdr);
  /* Body */
  var body=document.createElement('div');
  body.style.cssText='padding:16px 22px;direction:rtl';
  body.innerHTML='<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px">الحالة: <b style="color:'+statusColor+'">'+statusText+'</b></div><div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:8px">'+masked+'</div>';
  /* Model selector */
  var modelLabel=document.createElement('div');
  modelLabel.style.cssText='font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px';
  modelLabel.textContent='الموديل:';
  body.appendChild(modelLabel);
  var modelSel=document.createElement('select');
  modelSel.id='ez-gemini-model-select';
  modelSel.style.cssText='width:100%;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.2);border-radius:10px;font-size:12px;font-weight:700;font-family:Cairo,sans-serif;margin-bottom:10px;direction:ltr;outline:none;box-sizing:border-box';
  var models=[
    {value:'gemini-flash-latest',label:'gemini-flash-latest (المستقر ✅)'},
    {value:'gemini-2.0-flash',label:'gemini-2.0-flash'},
    {value:'gemini-2.5-flash-lite',label:'gemini-2.5-flash-lite (سريع)'},
    {value:'gemini-1.5-flash',label:'gemini-1.5-flash (قديم)'}
  ];
  var currentModel=_ezGetGeminiModel();
  for(var mi=0;mi<models.length;mi++){
    var opt=document.createElement('option');
    opt.value=models[mi].value;opt.textContent=models[mi].label;
    if(models[mi].value===currentModel) opt.selected=true;
    modelSel.appendChild(opt);
  }
  body.appendChild(modelSel);

  var keyLabel=document.createElement('div');
  keyLabel.style.cssText='font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px';
  keyLabel.textContent='مفتاح API:';
  body.appendChild(keyLabel);
  var inp=document.createElement('input');
  inp.id='ez-gemini-key-input';inp.type='password';inp.placeholder='الصق مفتاح Gemini API هنا';
  inp.style.cssText='width:100%;padding:10px 14px;border:1.5px solid rgba(129,140,248,0.2);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;direction:ltr;text-align:left;outline:none;margin-bottom:8px;box-sizing:border-box';
  body.appendChild(inp);
  var info=document.createElement('div');
  info.style.cssText='font-size:9px;font-weight:600;color:#94a3b8;line-height:1.6;margin-bottom:12px';
  info.innerHTML='🔒 المفتاح يُحفظ في متصفحك فقط — فقط نص الجرعة يتم إرساله<br>📎 <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#6366f1;text-decoration:underline">احصل على مفتاح مجاني من Google AI Studio</a>';
  body.appendChild(info);
  card.appendChild(body);
  /* Buttons */
  var foot=document.createElement('div');
  foot.style.cssText='padding:10px 22px 16px;display:flex;gap:8px';
  var saveBtn=document.createElement('button');
  saveBtn.textContent='💾 حفظ';
  saveBtn.style.cssText='flex:1;height:40px;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669)';
  saveBtn.addEventListener('click',function(){
    var k=document.getElementById('ez-gemini-key-input').value.trim();
    var selModel=document.getElementById('ez-gemini-model-select').value;
    _ezSetGeminiModel(selModel);
    if(k){_ezSetGeminiKey(k);window.ezShowToast('✅ تم حفظ المفتاح ('+selModel+')','success');overlay.remove();}
    else if(current){_ezSetGeminiModel(selModel);window.ezShowToast('✅ تم تغيير الموديل إلى '+selModel,'success');overlay.remove();}
    else{window.ezShowToast('❌ ادخل المفتاح','error');}
  });
  foot.appendChild(saveBtn);
  /* زر حذف — يظهر فقط لو فيه مفتاح محفوظ */
  if(current){
    var delBtn=document.createElement('button');
    delBtn.textContent='🗑️ حذف';
    delBtn.style.cssText='height:40px;padding:0 16px;border:1px solid rgba(239,68,68,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;color:#dc2626;background:rgba(239,68,68,0.04)';
    delBtn.addEventListener('click',function(){
      _ezSetGeminiKey('');window.ezShowToast('تم حذف المفتاح','info');overlay.remove();
    });
    foot.appendChild(delBtn);
  }
  /* زر إلغاء — يظهر دائماً */
  var cancelBtn=document.createElement('button');
  cancelBtn.textContent='إلغاء';
  cancelBtn.style.cssText='height:40px;padding:0 16px;border:1px solid rgba(148,163,184,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;color:#64748b;background:#fff';
  cancelBtn.addEventListener('click',function(){overlay.remove();});
  foot.appendChild(cancelBtn);
  /* Test button */
  var testBtn=document.createElement('button');
  testBtn.textContent='🧪 اختبار الاتصال';
  testBtn.style.cssText='width:100%;height:36px;border:1.5px solid rgba(99,102,241,0.2);border-radius:10px;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#6366f1;background:rgba(99,102,241,0.04);margin-top:8px';
  testBtn.addEventListener('click',function(){
    var testKey=document.getElementById('ez-gemini-key-input').value.trim()||_ezGetGeminiKey();
    if(!testKey){window.ezShowToast('❌ ادخل المفتاح أولاً','error');return;}
    testBtn.textContent='⏳ جاري الاختبار...';testBtn.disabled=true;
    fetch('https://generativelanguage.googleapis.com/v1beta/models/'+_ezGetGeminiModel()+':generateContent?key='+testKey,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({contents:[{parts:[{text:'You are a pharmacy dose interpreter. Parse this dose: "twice daily after meals". Return JSON: {"count":2,"startTime":"09:00","every":12,"isBefore":false,"dose":1,"confidence":"high","readable_ar":"مرتين بعد الأكل"}'}]}],generationConfig:{temperature:0.1,maxOutputTokens:200,responseMimeType:'application/json'}})
    }).then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function(data){
      var text=(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text)||'';
      testBtn.textContent='✅ الاتصال ناجح!';testBtn.style.color='#059669';testBtn.style.borderColor='#059669';
      window.ezShowToast('✅ جيميناي يعمل! الرد: '+text.substring(0,60),'success');
      console.log('🤖 Test response:',text);
    }).catch(function(err){
      testBtn.textContent='❌ فشل: '+err.message;testBtn.style.color='#dc2626';testBtn.style.borderColor='#dc2626';
      window.ezShowToast('❌ خطأ: '+err.message,'error');
      console.error('🤖 Test error:',err);
    });
  });
  body.appendChild(testBtn);
  card.appendChild(foot);
  overlay.appendChild(card);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
  inp.focus();
};

var _defaultFixedSizeCodes={
  '100009926':24,
  '100009934':48,
  '100010097':20,
  '100010652':30,
  '100011436':20,
  '100011743':30,
  '100013167':20,
  '100013423':10,
  '100013431':15,
  '100014565':6,
  '100015947':24,
  '100015955':24,
  '100015971':24,
  '100015980':24,
  '100016077':15,
  '100016106':10,
  '100017942':20,
  '100023592':30,
  '100023875':20,
  '100027201':20,
  '100030493':40,
  '100633972':20,
  '100634019':20,
  '100684294':30,
  '100726280':24,
  '101284170':30,
  '101826688':20,
  '101859640':20,
  '102073622':10,
  '102073631':10,
  '102077738':10,
  '102371620':24,
  '102988654':48,
  '103169239':20,
  '103243857':30,
  '103437918':30,
  '103683617':30
};
var _defaultWeeklyInjections=['102785890','101133232','101943745','101049031','101528656'];
var _defaultNormalTimes={empty:'07:00',beforeMeal:'08:00',beforeBreakfast:'08:00',afterBreakfast:'09:00',morning:'09:30',noon:'12:00',beforeLunch:'13:00',afterLunch:'14:00',afternoon:'15:00',maghrib:'18:00',beforeDinner:'20:00',afterDinner:'21:00',evening:'21:30',bed:'22:00',defaultTime:'09:00'};
var _defaultRamadanTimes={beforeIftar:'18:30',afterIftar:'19:00',beforeSuhoor:'03:00',afterSuhoor:'04:00',afterTarawih:'23:00'};

/* Merge defaults with custom overrides */
var fixedSizeCodes=(function(){var base={};for(var k in _defaultFixedSizeCodes)base[k]=_defaultFixedSizeCodes[k];if(customConfig.fixedSizeCodes){for(var k in customConfig.fixedSizeCodes)base[k]=customConfig.fixedSizeCodes[k];}if(customConfig.removedCodes){for(var i=0;i<customConfig.removedCodes.length;i++)delete base[customConfig.removedCodes[i]];}return base;})();

var weeklyInjections=(function(){var base=_defaultWeeklyInjections.slice();if(customConfig.addedWeekly){for(var i=0;i<customConfig.addedWeekly.length;i++){if(base.indexOf(customConfig.addedWeekly[i])===-1)base.push(customConfig.addedWeekly[i]);}}if(customConfig.removedWeekly){base=base.filter(function(c){return customConfig.removedWeekly.indexOf(c)===-1;});}return base;})();

var NORMAL_TIMES=(function(){var base={};for(var k in _defaultNormalTimes)base[k]=_defaultNormalTimes[k];if(customConfig.normalTimes){for(var k in customConfig.normalTimes)base[k]=customConfig.normalTimes[k];}return base;})();

/* Code-specific start times (used when note is empty/unrecognized instead of default 9:00) */
var _defaultCodeStartTimes={'100005052':{time:'14:00',every:24},'100010652':{time:'21:00',every:24},'100010812':{time:'21:00',every:24},'100016077':{time:'21:00',every:24},'100016106':{time:'21:00',every:24},'100016851':{time:'21:00',every:24},'100022733':{time:'21:00',every:24},'100023875':{time:'21:00',every:24},'100027091':{time:'21:00',every:24},'100029564':{time:'21:00',every:24},'100030493':{time:'09:00',every:12},'100033601':{time:'21:00',every:24},'100033803':{time:'09:00',every:12},'100615256':{time:'21:00',every:24},'100633972':{time:'14:00',every:24},'100634019':{time:'14:00',every:24},'100726280':{time:'14:00',every:24},'100954004':{time:'21:00',every:24},'100957942':{time:'09:00',every:12},'101078974':{time:'21:00',every:24},'101148979':{time:'21:00',every:24},'101225081':{time:'21:00',every:24},'101281201':{time:'21:00',every:24},'101284188':{time:'21:00',every:24},'101859640':{time:'14:00',every:24},'102073622':{time:'21:00',every:24},'102073631':{time:'21:00',every:24},'102782795':{time:'21:00',every:24},'102792782':{time:'09:00',every:12},'102988654':{time:'09:00',every:12},'103008671':{time:'21:00',every:24},'103069617':{time:'21:00',every:24},'103079621':{time:'09:00',every:12},'103243857':{time:'14:00',every:24},'103340593':{time:'21:00',every:24},'103344851':{time:'21:00',every:24},'103344869':{time:'21:00',every:24},'103350804':{time:'09:00',every:12},'103483965':{time:'21:00',every:24},'103683617':{time:'21:00',every:24},'100010812100010812':{time:'21:00',every:24}};
var CODE_START_TIMES=(function(){var base={};var k;for(k in _defaultCodeStartTimes){var dv=_defaultCodeStartTimes[k];if(typeof dv==='string')base[k]={time:dv,every:24};else base[k]=dv;}if(customConfig.codeStartTimes){for(k in customConfig.codeStartTimes){var v=customConfig.codeStartTimes[k];if(typeof v==='string')base[k]={time:v,every:24};else base[k]=v;}}return base;})();

/* ══════════════════════════════════════════
   RAMADAN MODE CONSTANTS & HELPERS
   ══════════════════════════════════════════ */
var RAMADAN_TIMES=(function(){var base={};for(var k in _defaultRamadanTimes)base[k]=_defaultRamadanTimes[k];if(customConfig.ramadanTimes){for(var k in customConfig.ramadanTimes)base[k]=customConfig.ramadanTimes[k];}return base;})();

/* ══════════════════════════════════════════
   🌙 RAMADAN DATE AUTO-DETECTION
   ══════════════════════════════════════════ */
var RAMADAN_START=new Date(2026,1,18); /* 18 Feb 2026 - أول يوم صيام */
var RAMADAN_DAYS=30;
var RAMADAN_END=new Date(RAMADAN_START);RAMADAN_END.setDate(RAMADAN_END.getDate()+RAMADAN_DAYS-1);

function _ezRamadanDaysLeft(startDateStr){
  var sd;
  if(startDateStr&&/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)){
    var p=startDateStr.split('-');sd=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  } else {
    sd=new Date();sd.setDate(sd.getDate()+1);
  }
  sd.setHours(0,0,0,0);
  var rs=new Date(RAMADAN_START);rs.setHours(0,0,0,0);
  var re=new Date(RAMADAN_END);re.setHours(0,0,0,0);
  if(sd<rs||sd>re) return 0;
  var diff=re.getTime()-sd.getTime();
  return Math.floor(diff/(1000*60*60*24))+1;
}
function _ezRamadanToday(){
  var today=new Date();today.setHours(0,0,0,0);
  var rs=new Date(RAMADAN_START);rs.setHours(0,0,0,0);
  var re=new Date(RAMADAN_END);re.setHours(0,0,0,0);
  if(today<rs||today>re) return {inRamadan:false,dayNum:0,daysLeft:0};
  var dayNum=Math.floor((today.getTime()-rs.getTime())/(1000*60*60*24))+1;
  var daysLeft=RAMADAN_DAYS-dayNum;
  return {inRamadan:true,dayNum:dayNum,daysLeft:daysLeft};
}

/* Map normal meal words to Ramadan equivalents */
function ramadanMapNote(note){
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();

  /* ── PRIORITY: بعد الغداء / after lunch → بعد التراويح - يجب التحقق أولاً قبل أي قواعد مخصصة ── */
  /* هذا الـ check لازم يكون قبل customTimeRules لأنها بتلتقط "الغداء" وتحوله لـ 14:00 وبيضيع */
  if(/بعد.*غدا|بعد.*غداء|بعد.*غذا|بعد.*غذاء|بعد.*عداء|بعد.*العداء|after.*lun|after.*lunch/i.test(note))
    return {meal:'afterTarawih',label_ar:'بعد التراويح',label_en:'After Tarawih',time:RAMADAN_TIMES.afterTarawih||'23:00'};

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
  /* ── "مع" = "بعد" unified logic (مع الوجبة = بعد الوجبة) ── */
  if(/مع\s*(ال)?(سحور|سحر)/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  if(/مع\s*(ال)?(فطار|فطور|افطار)/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
  if(/مع\s*(ال)?(عشا|عشاء)/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  if(/مع\s*(ال)?(غدا|غداء|غذا|غذاء|عداء)/i.test(note)) return {meal:'afterTarawih',label_ar:'بعد التراويح',label_en:'After Tarawih',time:RAMADAN_TIMES.afterTarawih||'23:00'};
  if(/مع\s*(ال)?(اكل|أكل|وجب)/i.test(note)) return {meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
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
  /* Evening / مساء / bed / نوم → بعد السحور (مثل بعد العشاء) */
  if(/مساء|مسا|evening|eve|bed|sleep|نوم|النوم|hs\b/i.test(note)) return {meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
  /* بعد الغداء / after lunch → بعد التراويح 23:00 */
  if(/بعد.*غدا|بعد.*غداء|بعد.*غذا|بعد.*غذاء|بعد.*عداء|بعد.*العداء|after.*lun|after.*lunch/i.test(note)) return {meal:'afterTarawih',label_ar:'بعد التراويح',label_en:'After Tarawih',time:RAMADAN_TIMES.afterTarawih||'23:00'};
  /* Noon / ظهر / قبل الغداء → قبل الفطار */
  if(/ظهر|الظهر|noon|midday|غدا|غداء|الغدا|الغداء|الغدى|غذا|غذاء|الغذا|الغذاء|عداء|العداء|lunch|lun/i.test(note)) return {meal:'beforeIftar',label_ar:'قبل الفطار',label_en:'Before Iftar',time:RAMADAN_TIMES.beforeIftar};
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
  /* FIX: كل صفوف رمضان (فطار + سحور) تبدأ من نفس التاريخ - لا نضيف يوم للسحور */
  return baseDateStr;
}
function _fmtDate(d){var y=d.getFullYear(),ms=('0'+(d.getMonth()+1)).slice(-2),da=('0'+d.getDate()).slice(-2);return y+'-'+ms+'-'+da;}

/* Determine Ramadan duplicate type from note (all Ramadan doses with 2 times = duplicate) */

/* Check if item is injection/syrup/ointment/cream (non-oral solid) */
function isNonTabletItem(itemName){
  return /injection|حقن|حقنة|حقنه|syrup|شراب|cream|كريم|ointment|مرهم|مره|lotion|لوشن|gel|جل|drop|قطر|قطره|spray|بخاخ|inhaler|بخاخة|suppository|لبوس|solution|محلول|suspension|معلق|emulsion|مستحلب|patch|لصقة|لاصق/i.test(itemName||'');
}

/* ══════════════════════════════════════
   PACK SIZE EXTRACTION FROM DRUG NAME
   ══════════════════════════════════════ */
var _PACK_SIZES=[14,28,30,42,56,60,84,90,100,120];
window._ez14Choices=window._ez14Choices||{};
/* Regex to match strength patterns - these get REMOVED from name before scanning */
var _STRENGTH_STRIP=/\d+\.?\d*\s*(?:mg|mcg|µg|مجم|ملجم|ملغم|ملغ|مج|ml|g\b|iu|units?|وحد[ةه]?|u\/ml|mg\/ml|mcg\/hr|مايكرو)/gi;

function _extractPackFromName(name){
  if(!name||name.length<3) return null;
  /* Step 1: Remove strength (numbers near mg/mcg/مجم etc) */
  var clean=name.replace(_STRENGTH_STRIP,'~');
  /* Step 2: Find ALL remaining numbers */
  var nums=[];
  var re=/(\d+)/g;var m;
  while((m=re.exec(clean))!==null){
    var v=parseInt(m[1]);
    /* Only care about known pack sizes */
    if(_PACK_SIZES.indexOf(v)>-1) nums.push(v);
  }
  if(nums.length===0) return null;
  /* Step 3: If multiple matches, prefer 28/56 (the ones that cause issues) */
  if(nums.length===1) return nums[0];
  /* If has both 28 and 30, something is wrong, take the last one (usually pack size at end) */
  return nums[nums.length-1];
}

function _estimateTPD(noteText){
  if(!noteText) return 1;
  var n=(noteText+'').toLowerCase().replace(/[أإآ]/g,'ا');
  if(/مرتين|twice|bid|b\.?i\.?d|صباح.*مسا|مسا.*صباح|morning.*evening|12\s*h/i.test(n)) return 2;
  if(/ثلاث|three|tid|t\.?i\.?d|8\s*h/i.test(n)) return 3;
  if(/اربع|four|qid|q\.?i\.?d|6\s*h/i.test(n)) return 4;
  return 1;
}

function _scanPackSizeWarnings(dialogM,dialogT){
  var tb=_ezFindTable();
  if(!tb){console.warn('PACK: no table');return {items:[],items14:[],warnings:[]};}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var nmi=_ezIdx(hs,'name'),ci=_ezIdx(hs,'code'),ni=_ezIdx(hs,'note');
  if(nmi<0) nmi=_ezIdx(hs,'item');
  console.log('PACK IDX: name='+nmi+' code='+ci+' note='+ni);
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  var items=[],items14=[];
  for(var i=0;i<rows.length;i++){
    var tds=rows[i].querySelectorAll('td');
    var cb=rows[i].querySelector('input[type="checkbox"]');
    if(cb&&!cb.checked) continue;
    var itemCode=ci>=0?(_ezGet(tds[ci]).match(/\d+/)||[''])[0]:'';
    if(itemCode&&fixedSizeCodes&&fixedSizeCodes[itemCode]) continue;
    if(itemCode&&weeklyInjections.indexOf(itemCode)>-1) continue;
    var itemName=nmi>=0?_ezGet(tds[nmi]):'';
    if(!itemName) continue;
    if(isNonTabletItem(itemName)) continue;
    var noteText='';
    if(ni>=0){var inp=tds[ni].querySelector('input,textarea');noteText=inp?inp.value:tds[ni].textContent;}
    var pack=_extractPackFromName(itemName);
    console.log('PACK ROW '+i+': "'+itemName+'" pack='+pack);
    if(!pack) continue;
    if(pack===14||pack===42){
      var key14=(itemName.substring(0,40)).replace(/\s+/g,'_');
      var choice=window._ez14Choices[key14]||'?';
      var effDays14=choice==='2'?28:14;
      items14.push({name:itemName,packSize:pack,key:key14,choice:choice,effDays:effDays14,tpd:1});
      continue;
    }
    var tpd=_estimateTPD(noteText);
    var effDays=Math.floor(pack/tpd);
    items.push({name:itemName,packSize:pack,tpd:tpd,effDays:effDays});
  }
  var allItems=items.concat(items14);
  if(allItems.length===0) return {items:[],items14:[],warnings:[]};
  var warnings=[];
  var has28=false,has30=false;
  for(var j=0;j<allItems.length;j++){
    var ed=allItems[j].effDays;
    if(ed===28||ed===14) has28=true;
    if(ed===30||ed===60||ed===90) has30=true;
  }
  if(has28&&has30){
    warnings.push({icon:'⚖️',text:'يوجد أصناف 28 يوم مع أصناف 30 يوم — لازم التساوي على 28',level:'danger'});
    if(dialogT!==28) warnings.push({icon:'⚠️',text:'غيّر الأيام من '+dialogT+' إلى 28',level:'danger',fix:28});
  }
  else if(has28&&!has30&&dialogT!==28){
    warnings.push({icon:'📦',text:'كل الأصناف 28 يوم — لازم تختار 28 مش '+dialogT,level:'danger',fix:28});
  }
  else if(has30&&!has28&&dialogT!==30){
    warnings.push({icon:'📦',text:'كل الأصناف 30 يوم — لازم تختار 30 مش '+dialogT,level:'danger',fix:30});
  }
  return {items:items,items14:items14,warnings:warnings,has28:has28,has30:has30};
}

function _renderPackWarningBanner(){
  var el=document.getElementById('ez-pack-warning');
  if(!el){console.warn('PACK: ez-pack-warning not found');return;}
  var dlg=document.querySelector('.ez-dialog-v2');
  var _m=parseInt(dlg&&dlg.getAttribute('data-m'))||1;
  var _t=parseInt(dlg&&dlg.getAttribute('data-t'))||30;
  var scan=_scanPackSizeWarnings(_m,_t);
  console.log('PACK: items='+scan.items.length+' items14='+scan.items14.length+' warnings='+scan.warnings.length);
  if(scan.items.length>0)scan.items.forEach(function(it){console.log('PACK ITEM: '+it.name+' pack='+it.packSize+' eff='+it.effDays);});
  var has14=scan.items14&&scan.items14.length>0;
  var hasWarnings=scan.warnings.length>0;
  if(!hasWarnings&&!has14){el.style.display='none';el.innerHTML='';return;}
  el.style.display='block';
  var html='';

  /* === 14-PILL SECTION === */
  if(has14){
    var allAnswered=scan.items14.every(function(it){return it.choice!=='?';});
    html+='<div style="border:2px solid #f59e0b;border-radius:12px;padding:8px 10px;margin-bottom:8px;background:linear-gradient(135deg,#fffbeb,#fef3c7)">';
    html+='<div style="font-size:11px;font-weight:900;color:#92400e;margin-bottom:6px;display:flex;align-items:center;gap:5px">';
    html+='📋 تنبيه علبة 14 حبة';
    if(!allAnswered) html+='<span style="background:#f59e0b;color:#fff;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:900;margin-right:auto">يحتاج إجابة</span>';
    else html+='<span style="background:#10b981;color:#fff;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:900;margin-right:auto">✅ مكتمل</span>';
    html+='</div>';
    for(var i=0;i<scan.items14.length;i++){
      var it=scan.items14[i];
      var is2=(it.choice==='2');
      var is1=(it.choice==='1');
      var shortName=it.name.length>32?it.name.substring(0,32)+'...':it.name;
      html+='<div style="background:rgba(255,255,255,0.7);border-radius:9px;padding:6px 8px;margin-bottom:5px;direction:rtl">';
      html+='<div style="font-size:10px;font-weight:800;color:#78350f;margin-bottom:5px">💊 '+shortName+'</div>';
      html+='<div style="font-size:9px;color:#92400e;margin-bottom:5px">العبوة 14 حبة — كم علبة في الطلب؟</div>';
      html+='<div style="display:flex;gap:6px">';
      html+='<button onclick="window._ez14SetChoice(\''+it.key+'\',\'1\')" style="flex:1;padding:6px 4px;border:2px solid '+(is1?'#ef4444':'#d1d5db')+';background:'+(is1?'#fef2f2':'#fff')+';color:'+(is1?'#dc2626':'#6b7280')+';border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif">'+(is1?'✓ ':'')+'علبة واحدة<br><span style="font-size:8px;font-weight:700">= 14 يوم</span></button>';
      html+='<button onclick="window._ez14SetChoice(\''+it.key+'\',\'2\')" style="flex:1;padding:6px 4px;border:2px solid '+(is2?'#10b981':'#d1d5db')+';background:'+(is2?'#d1fae5':'#fff')+';color:'+(is2?'#065f46':'#6b7280')+';border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif">'+(is2?'✓ ':'')+'علبتين<br><span style="font-size:8px;font-weight:700">= 28 يوم</span></button>';
      html+='</div>';
      if(is2) html+='<div style="font-size:9px;color:#065f46;font-weight:800;margin-top:4px;text-align:center">✅ سيُعامَل كـ 28 يوم (علبتين × 14)</div>';
      html+='</div>';
    }
    html+='</div>';
  }

  /* === STANDARD WARNINGS === */
  if(hasWarnings){
    html+='<div style="font-size:11px;font-weight:900;color:#dc2626;margin-bottom:6px;display:flex;align-items:center;gap:6px"><span style="font-size:16px">🔴</span> تنبيه حجم العبوة</div>';
    for(var w=0;w<scan.warnings.length;w++){
      var ww=scan.warnings[w];
      html+='<div style="font-size:10px;font-weight:700;color:'+(ww.level==='danger'?'#b91c1c':'#92400e')+';padding:3px 0;direction:rtl">'+ww.icon+' '+ww.text+'</div>';
    }
  }

  /* Show item details — ONLY items causing mismatch (28/56 based) */
  var _mismatchItems=scan.items.filter(function(si){return si.effDays===28||si.effDays===14;});
  if(_mismatchItems.length>0){
    html+='<div style="margin-top:6px;padding:8px 10px;background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.2);border-radius:10px;direction:rtl">';
    for(var k=0;k<_mismatchItems.length;k++){
      var si=_mismatchItems[k];
      html+='<div style="font-size:12px;font-weight:800;color:#991b1b;padding:4px 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap">';
      html+='<span style="font-size:13px">💊</span>';
      html+='<span style="color:#1e1b4b">'+si.name.substring(0,40)+'</span>';
      html+='<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:900">'+si.packSize+' حبة = '+si.effDays+' يوم</span>';
      if(si.tpd>1) html+='<span style="background:#f59e0b;color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:800">×'+si.tpd+' يومياً</span>';
      html+='</div>';
    }
    html+='</div>';
  }

  var fixVal=null;
  for(var f=0;f<scan.warnings.length;f++){if(scan.warnings[f].fix){fixVal=scan.warnings[f].fix;break;}}
  if(fixVal){
    html+='<button onclick="window._ezFixPack('+fixVal+')" style="margin-top:6px;width:100%;padding:8px;border:2px solid #dc2626;background:#fef2f2;color:#dc2626;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif" onmouseover="this.style.background=\'#dc2626\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#fef2f2\';this.style.color=\'#dc2626\'">⚡ تصحيح إلى '+fixVal+' يوم</button>';
  }
  el.innerHTML=html;

}

window._ez14SetChoice=function(key,choice){
  if(!window._ez14Choices) window._ez14Choices={};
  window._ez14Choices[key]=choice;
  console.log('EZ14: key='+key+' choice='+choice);
  _renderPackWarningBanner();
};

window._ezFixPack=function(days){
  var dlg=document.querySelector('.ez-dialog-v2');
  if(!dlg) return;
  dlg.setAttribute('data-t',String(days));
  var segs=dlg.querySelectorAll('.ez-seg');
  segs.forEach(function(s){
    var oc=s.getAttribute('onclick')||'';
    if(oc.indexOf("'t'")>-1){
      s.classList.toggle('active',oc.indexOf(','+days+')')>-1);
    }
  });
  var m=parseInt(dlg.getAttribute('data-m'))||1;
  _renderPackWarningBanner();
  window.ezShowToast('✅ تم التصحيح إلى '+days+' يوم','success');
};
var warningQueue=[];
var _EZ_WARNING_CONFIG={
  ramadan_unclear:{enabled:true,label:'جرعة غير واضحة في رمضان'},
  dose2:{enabled:true,label:'جرعة مزدوجة (2) في الملاحظات'},
  duplicate:{enabled:true,label:'صنف مكرر في الطلب'},
  unrecognized_dose:{enabled:true,label:'الجرعة غير مفهومة'},
  days:{enabled:true,label:'عدد الأيام مختلف عن المحدد'},
  smallsplit:{enabled:true,label:'تقسيم صغير'}
};
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

/* HTML escape to prevent XSS from drug names */
function _ezEsc(str){
  var d=document.createElement('div');d.appendChild(document.createTextNode(str||''));return d.innerHTML;
}

function _ezNorm(txt){
  return(txt||'').toString().trim().replace(/\s+/g,' ');
}

function _ezNormL(txt){
  return _ezNorm(txt).toLowerCase()
    .replace(/[أإآ]/g,'ا')
    .replace(/ة/g,'ه')
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
  'time':['start time','time','وقت','الوقت','timing'],
  'dose':['dose','جرعة','الجرعة','dosage','dos'],
  'code':['code','كود','الكود','item code','barcode','رمز'],
  'start date':['start date','تاريخ البدء','بداية','from'],
  'end date':['end date','end','تاريخ الانتهاء','نهاية','to'],
  'expiry':['expiry','exp','صلاحية','انتهاء الصلاحية'],
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

/* Dark mode removed in v141 */

window.ezMinimize=function(){
  var d=document.getElementById('ez-dialog-box');
  if(d){
    var content=d.querySelector('.ez-content');
    var foot=d.querySelector('.ez-footer');
    var actions=d.querySelector('.ez-actions');
    var floatCard=d.querySelector('.ez-float-card');
    var minBtn=d.querySelector('.ez-btn-icon-min');
    if(content.style.display==='none'){
      content.style.display='';
      if(floatCard) floatCard.style.display='';
      if(actions) actions.style.display='';
      if(foot) foot.style.display='';
      minBtn.innerHTML='−';
    } else {
      content.style.display='none';
      if(floatCard) floatCard.style.display='none';
      if(actions) actions.style.display='none';
      if(foot) foot.style.display='none';
      minBtn.innerHTML='+';
    }
  }
};

/* ══════════════════════════════════════════
   DOWNLOAD INTERCEPTOR — تعديل external_id
   Override downloadObjectAsJson() مباشرة
   ══════════════════════════════════════════ */
window._ezInterceptDownload=false;
window._ezDownloadCounter=0;

window.ezToggleDownloadIntercept=function(){
  window._ezInterceptDownload=!window._ezInterceptDownload;
  window._ezDownloadCounter=0;
  var btn=document.getElementById('ez-dl-intercept-btn');
  if(btn){
    btn.style.background=window._ezInterceptDownload?'linear-gradient(145deg,#10b981,#059669)':'linear-gradient(145deg,#94a3b8,#64748b)';
    btn.textContent=window._ezInterceptDownload?'🔄 تعديل الفاتورة: مُفعّل ✅':'🔄 تعديل رقم الفاتورة عند التحميل';
  }
  window.ezShowToast(window._ezInterceptDownload?'✅ تعديل رقم الفاتورة مُفعّل — كل تحميل هينقّص رقم':'⏸️ تعديل رقم الفاتورة مُعطّل',window._ezInterceptDownload?'success':'info');
};

/* Override downloadObjectAsJson */

(function(){
  function _waitAndOverride(){
    if(typeof window.downloadObjectAsJson==='function'&&!window._ezOrigDownloadObj){
      window._ezOrigDownloadObj=window.downloadObjectAsJson;
      window.downloadObjectAsJson=function(exportObj,exportName){
        if(window._ezInterceptDownload&&exportObj){
          try{
            var modified=false;
            if(exportObj.patients){
              for(var p=0;p<exportObj.patients.length;p++){
                if(exportObj.patients[p].external_id){
                  var orig=exportObj.patients[p].external_id;
                  /* Replace first character with the counter number */
                  var newId=String(window._ezDownloadCounter)+orig.substring(1);
                  exportObj.patients[p].external_id=newId;
                  console.log('EZ_PILL: external_id: '+orig+' → '+newId);
                  modified=true;
                }
              }
            }
            if(window._ezDownloadCounter===0){
              window.ezShowToast('📥 التحميل الأول — رقم الفاتورة الأصلي','info');
            } else if(modified){
              window.ezShowToast('✅ تحميل #'+(window._ezDownloadCounter+1)+' — أول رقم بقى '+window._ezDownloadCounter,'success');
              ezBeep('success');
            }
            window._ezDownloadCounter++;
          }catch(e){console.error('EZ intercept error:',e);}
        }
        return window._ezOrigDownloadObj(exportObj,exportName);
      };
    } else {
      setTimeout(_waitAndOverride,500);
    }
  }
  _waitAndOverride();
})();

window.ezSelect=function(el,type,val){
  var p=el.parentNode;
  var segs=p.querySelectorAll('.ez-seg');
  for(var i=0;i<segs.length;i++) segs[i].classList.remove('active');
  el.classList.add('active');
  var d=document.getElementById('ez-dialog-box');
  if(type==='m') d.setAttribute('data-m',val);
  else d.setAttribute('data-t',val);
  /* Update total badge */
  var m2=parseInt(d.getAttribute('data-m'))||1;
  var t2=parseInt(d.getAttribute('data-t'))||30;
  if(badge) badge.textContent='إجمالي: '+(m2*t2)+' يوم ('+m2+' × '+t2+')';
  /* Update pack size warnings */
  try{_renderPackWarningBanner();}catch(e){console.error("PACK ERR:",e);}
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
    c=c.replace(/\d*\s*(Tablets?|Capsules?|undefined|Caps?|Tab)\s*every\s*\d+\s*Hrs?\s*(for\s*)?\d*\s*days?\d*/gi,'');
    c=c.replace(/\bfor\s*\d+\s*days?\d*/gi,'');
    c=c.replace(/\bevery\s*\d+\s*Hrs?\b/gi,'');
    c=c.replace(/لمد[ةه]?\s*\d+\s*([اأ]يام|يوم)\d*/g,'');
    c=c.replace(/\d+\s*([اأ]يام|يوم)\d*/g,'');
    c=c.replace(/كل\s*\d+\s*ساع[ةهات]*/g,'');
    c=c.replace(/^\s*[-–—]\s*/,'');
    if(/^\s*[\da-zA-Z]/.test(c)&&/[\u0600-\u06FF]/.test(c)){var idx=c.search(/[\u0600-\u06FF]/);if(idx>0) c=c.substring(idx);}
    /* Strip dose words */
    c=c.replace(/و(قرص|حبه|حبة|كبسوله|كبسولة)\b/g,'و ');
    c=c.replace(/(^|\s)(قرص|حبه|حبة|حيه|حيه|كبسوله|كبسولة|اقراص|حبوب|كبسولات)(\s|$)/gi,'$1$3');
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
      if(note){var nl=note.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();isDup=!!shouldDuplicateRow(nl);}
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
window.ezPreviewAlerts=function(){
  var existing=document.getElementById('ez-alerts-preview');
  if(existing){existing.remove();return;}
  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('لم يتم العثور على الجدول','error');return;}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ni=_ezIdx(hs,'note'),nmi=_ezIdx(hs,'name'),ci=_ezIdx(hs,'code');
  if(ni<0){window.ezShowToast('عمود الملاحظات غير موجود','error');return;}
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  var alerts=[];
  var _dlg=document.querySelector('.ez-dialog-v2');
  var _t=parseInt(_dlg&&_dlg.getAttribute('data-t'))||30;
  var _m=parseInt(_dlg&&_dlg.getAttribute('data-m'))||1;
  var seenCodes={};
  for(var i=0;i<rows.length;i++){
    var tds=rows[i].querySelectorAll('td');
    if(tds.length<=Math.max(ni,nmi||0)) continue;
    var inp=tds[ni].querySelector('input,textarea');
    var noteRaw=inp?inp.value:tds[ni].textContent;
    var noteClean=cleanNote(noteRaw);
    var itemName=nmi>=0?_ezGet(tds[nmi]):'صنف '+(i+1);
    var itemCode=ci>=0?(_ezGet(tds[ci]).match(/\d+/)||[''])[0]:'';
    if(itemCode){
      if(seenCodes[itemCode]){alerts.push({icon:'🔁',text:'صنف مكرر: '+itemName,detail:'موجود في أكتر من سطر',level:'danger'});
      }else seenCodes[itemCode]=true;
    }
    if(!noteClean||noteClean.length<2) continue;
    var doseRec=smartDoseRecognizer(noteClean);
    var timeResult=getTimeFromWords(noteClean);
    var dur=extractDuration(noteRaw);
    var _isFixedPrev=itemCode&&fixedSizeCodes&&fixedSizeCodes[itemCode];
    var _isWeeklyPrev=itemCode&&weeklyInjections.indexOf(itemCode)>-1;
    if(dur.hasDuration&&!_ezDurMatchesSelection(dur.days,_m,_t)&&!_isFixedPrev&&!_isWeeklyPrev){alerts.push({icon:'📅',text:itemName+': مكتوب '+dur.days+' يوم (الإجمالي '+(_m*_t)+')',detail:'اختلاف في مدة العلاج',level:'warning'});}
    var d2p=/^2\s*(tablet|pill|cap|capsule|undefined|tab|قرص|حبة|حبه|كبسول|كبسولة)/i;
    var d2p2=/\b2\s*(tablet|pill|cap|capsule|undefined|tab|قرص|حبة|حبه|كبسول|كبسولة)/gi;
    if(d2p.test(noteRaw.trim())||d2p2.test(noteRaw)){alerts.push({icon:'💊',text:itemName+': جرعة مزدوجة (2)',detail:'مكتوب حبتين في الجرعة',level:'warning'});}
    if(timeResult.isUnrecognized&&!_isFixedPrev&&!_isWeeklyPrev){alerts.push({icon:'❓',text:itemName+': جرعة غير مفهومة',detail:'النص: '+noteClean,level:'warning'});}
    var nl=noteClean.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
    if(shouldDuplicateRow(nl)){alerts.push({icon:'✂️',text:itemName+': سيتم تقسيم الجرعة',detail:'عدد الجرعات: '+doseRec.count,level:'info'});}
  }
  /* ── Pack Size Scan (Layer 2) ── */
  try{
    var packScan=_scanPackSizeWarnings(_m,_t);
    for(var ps=0;ps<packScan.warnings.length;ps++){
      var pw=packScan.warnings[ps];
      alerts.push({icon:pw.icon,text:pw.text,detail:'تحذير حجم العبوة',level:pw.level});
    }
    if(packScan.items.length>0){
      var packDetails=packScan.items.map(function(it){return it.name.substring(0,25)+' → '+it.packSize+' ('+it.effDays+' يوم)'}).join(' | ');
      alerts.push({icon:'📦',text:'أحجام العبوات المكتشفة: '+packScan.items.length,detail:packDetails,level:'info'});
    }
  }catch(e){console.warn('Pack scan in preview:',e);}
  /* ── Scan Prescription Notes field for rich info ── */
  var prescNote='';
  var pnField=document.getElementById('epresNotes');
  if(pnField) prescNote=(pnField.value||'').trim();
  if(prescNote){
    /* Show the raw prescription note */
    alerts.push({icon:'📝',text:'ملاحظات الروشتة',detail:prescNote,level:'info'});
    /* Extract structured info */
    var details=[];
    /* طلبين / عدد الطلبات */
    var ordersMatch=prescNote.match(/(\d+|طلبين|ثلاث|اربع)\s*(طلب|طلبات|طلبين)/i);
    if(ordersMatch){var oNum=ordersMatch[1]==='طلبين'?2:/ثلاث/i.test(ordersMatch[1])?3:/اربع/i.test(ordersMatch[1])?4:parseInt(ordersMatch[1]);details.push('📋 عدد الطلبات: '+oNum);}
    else if(/طلبين/i.test(prescNote)) details.push('📋 عدد الطلبات: 2');
    /* بوكسات */
    var boxMatch=prescNote.match(/(\d+)\s*(بوكس|بكس|box)/i);
    if(boxMatch) details.push('📦 عدد البوكسات: '+boxMatch[1]);
    /* أشهر */
    var monthMatch=prescNote.match(/(\d+)\s*(اشهر|شهور|شهر)/i);
    if(monthMatch) details.push('🗓️ عدد الأشهر: '+monthMatch[1]);
    /* اسم الضيف */
    var namePatterns=[
      /(?:تغيير\s*(?:ال)?اسم?\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?)?)\s*(?:الى|إلى|الي|إلي|ل)\s*[\:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i,
      /(?:باسم|اسم\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?))\s*[\:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i,
      /(?:الاسم\s*(?:يكون|هو)?)\s*[\:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i
    ];
    var extractedName=null;
    for(var np=0;np<namePatterns.length;np++){var nm=prescNote.match(namePatterns[np]);if(nm){extractedName=nm[1].replace(/\s*(وشكرا|شكرا|وتوصيل|والتوصيل|وايصال|برجاء|يرجى).*/i,'').trim();if(extractedName.length>=3)break;else extractedName=null;}}
    if(extractedName) details.push('👤 اسم الضيف: '+extractedName);
    /* صيدلية التوصيل */
    var pharmaMatch=prescNote.match(/(?:صيدلي[ةه]|لصيدلي[ةه]|فرع)\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,2})/i);
    if(pharmaMatch){var pName=pharmaMatch[1].replace(/\s*(وشكرا|شكرا|وتغيير|برجاء).*/i,'').trim();if(pName.length>=2) details.push('🏥 صيدلية التوصيل: '+pName);}
    /* توصيل */
    if(/توصيل|ايصال|إيصال|deliver/i.test(prescNote)&&!pharmaMatch) details.push('🚚 مطلوب توصيل');
    if(details.length>0){
      alerts.push({icon:'📌',text:'معلومات مستخلصة من الملاحظات',detail:details.join('\n'),level:'success'});
    }
  }
  /* Display */
  var html='<div style="width:460px;max-width:95vw;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.15);border:2px solid rgba(129,140,248,0.12);font-family:Cairo,sans-serif">';
  html+='<div style="padding:14px 18px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(129,140,248,0.08);background:linear-gradient(180deg,rgba(245,158,11,0.04) 0%,transparent 100%)">';
  html+='<div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(145deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:16px">⚠️</div>';
  html+='<div style="flex:1"><div style="font-size:15px;font-weight:900;color:#1e1b4b">معاينة التنبيهات</div><div style="font-size:10px;font-weight:700;color:#92400e">'+(alerts.length>0?alerts.length+' تنبيه':'لا توجد تنبيهات')+'</div></div>';
  html+='<button onclick="document.getElementById(\'ez-alerts-preview\').remove()" style="width:28px;height:28px;border:none;border-radius:8px;font-size:14px;cursor:pointer;color:#94a3b8;background:rgba(148,163,184,0.08)">✕</button>';
  html+='</div>';
  html+='<div style="padding:12px 16px;max-height:400px;overflow-y:auto">';
  if(alerts.length===0){
    html+='<div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px;font-weight:700">✅ لا توجد تنبيهات - كل شيء سليم</div>';
  } else {
    var colors={warning:{bg:'rgba(245,158,11,0.04)',bdr:'rgba(245,158,11,0.15)'},danger:{bg:'rgba(239,68,68,0.04)',bdr:'rgba(239,68,68,0.15)'},info:{bg:'rgba(99,102,241,0.04)',bdr:'rgba(99,102,241,0.12)'},success:{bg:'rgba(16,185,129,0.04)',bdr:'rgba(16,185,129,0.15)'}};
    for(var a=0;a<alerts.length;a++){
      var al=alerts[a];var cl=colors[al.level]||colors.info;
      html+='<div style="background:'+cl.bg+';border:1px solid '+cl.bdr+';border-radius:10px;padding:10px 12px;margin-bottom:6px;direction:rtl">';
      html+='<div style="font-size:12px;font-weight:800;color:#1e1b4b">'+al.icon+' '+al.text+'</div>';
      html+='<div style="font-size:10px;font-weight:700;color:#64748b;margin-top:2px;white-space:pre-line;line-height:1.8">'+al.detail+'</div>';
      html+='</div>';
    }
  }
  html+='</div></div>';
  var overlay=document.createElement('div');
  overlay.id='ez-alerts-preview';
  overlay.innerHTML=html;
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,15,35,0.4);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center';
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
};

/* ══════════════════════════════════════════
   SAVE / PASTE NOTES (Cross-tab note transfer)
   ══════════════════════════════════════════ */
window.ezSaveNotes=function(){
  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('لم يتم العثور على الجدول','error');return;}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ni=_ezIdx(hs,'note'),ci=_ezIdx(hs,'code'),nmi=_ezIdx(hs,'name');
  if(ni<0||ci<0){window.ezShowToast('أعمدة Note أو Code مش موجودة','error');return;}
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  var saved={};var count=0;
  for(var i=0;i<rows.length;i++){
    var tds=rows[i].querySelectorAll('td');
    if(tds.length<=Math.max(ni,ci)) continue;
    var code=(_ezGet(tds[ci]).match(/\d+/)||[''])[0];
    if(!code) continue;
    var inp=tds[ni].querySelector('input,textarea');
    var note=inp?inp.value:(tds[ni].innerText||tds[ni].textContent).trim();
    if(!note||note.length<2) continue;
    var name=nmi>=0?_ezGet(tds[nmi]):'';
    saved[code]={note:note,name:name};
    count++;
  }
  if(count===0){window.ezShowToast('مفيش نوتات لحفظها','info');return;}
  try{
    localStorage.setItem('ez_pill_saved_notes',JSON.stringify(saved));
    localStorage.setItem('ez_pill_saved_notes_time',new Date().toLocaleString('ar-EG'));
    window.ezShowToast('💾 تم حفظ '+count+' نوتة — جاهزة للصق في تاب جديد','success');
    ezBeep('success');
  }catch(e){window.ezShowToast('❌ خطأ في الحفظ: '+e.message,'error');}
};

window.ezPasteNotes=function(){
  var raw=localStorage.getItem('ez_pill_saved_notes');
  if(!raw){window.ezShowToast('مفيش نوتات محفوظة — احفظ الأول من التاب القديم 💾','info');return;}
  var saved;
  try{saved=JSON.parse(raw);}catch(e){window.ezShowToast('❌ بيانات محفوظة تالفة','error');return;}
  var savedTime=localStorage.getItem('ez_pill_saved_notes_time')||'';
  var savedCodes=Object.keys(saved);
  if(savedCodes.length===0){window.ezShowToast('مفيش نوتات محفوظة','info');return;}

  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('لم يتم العثور على الجدول','error');return;}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ni=_ezIdx(hs,'note'),ci=_ezIdx(hs,'code'),nmi=_ezIdx(hs,'name');
  if(ni<0||ci<0){window.ezShowToast('أعمدة Note أو Code مش موجودة','error');return;}
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);

  var matches=[];
  for(var i=0;i<rows.length;i++){
    var tds=rows[i].querySelectorAll('td');
    if(tds.length<=Math.max(ni,ci)) continue;
    var code=(_ezGet(tds[ci]).match(/\d+/)||[''])[0];
    if(!code) continue;
    var name=nmi>=0?_ezGet(tds[nmi]):'صنف '+(i+1);
    var curInp=tds[ni].querySelector('input,textarea');
    var curNote=curInp?curInp.value:(tds[ni].innerText||'').trim();
    if(saved[code]){
      matches.push({rowIdx:i,code:code,name:name,oldNote:curNote,newNote:saved[code].note,row:rows[i],tds:tds});
    }
  }

  if(matches.length===0){window.ezShowToast('لم يتم العثور على أكواد متطابقة','info');return;}

  var html='<div style="width:480px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(99,102,241,0.15);border:2px solid rgba(129,140,248,0.12);font-family:Cairo,sans-serif">';
  html+='<div style="height:3px;background:linear-gradient(90deg,#10b981,#06b6d4,#10b981);background-size:200% 100%;animation:barShift 4s ease infinite"></div>';
  html+='<div style="padding:14px 20px 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(129,140,248,0.08)">';
  html+='<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(145deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(16,185,129,0.25)">📥</div>';
  html+='<div><div style="font-size:15px;font-weight:900;color:#1e1b4b">لصق النوتات المحفوظة</div>';
  html+='<div style="font-size:10px;font-weight:700;color:#64748b">محفوظ: '+savedTime+' · '+savedCodes.length+' صنف → تطابق: <b style="color:#059669">'+matches.length+'</b></div></div></div>';
  html+='<div style="padding:10px 16px;max-height:350px;overflow-y:auto">';
  for(var m=0;m<matches.length;m++){
    var mt=matches[m];
    var shortName=mt.name.length>35?mt.name.substring(0,35)+'…':mt.name;
    var notePreview=mt.newNote.length>50?mt.newNote.substring(0,50)+'…':mt.newNote;
    html+='<div style="background:rgba(16,185,129,0.04);border:1px solid rgba(16,185,129,0.15);border-radius:10px;padding:8px 10px;margin-bottom:6px;direction:rtl">';
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
    html+='<input type="checkbox" id="ez-paste-chk-'+m+'" checked style="accent-color:#10b981;width:16px;height:16px" />';
    html+='<span style="font-size:12px;font-weight:800;color:#1e1b4b;flex:1">'+shortName+'</span>';
    html+='<span style="font-size:9px;font-weight:700;color:#64748b;background:rgba(0,0,0,0.04);padding:2px 6px;border-radius:4px">'+mt.code+'</span>';
    html+='</div>';
    html+='<div style="font-size:11px;font-weight:700;color:#059669;background:rgba(16,185,129,0.06);padding:4px 8px;border-radius:6px">📝 '+notePreview+'</div>';
    if(mt.oldNote&&mt.oldNote.length>1){html+='<div style="font-size:9px;font-weight:700;color:#94a3b8;margin-top:3px">الحالي: '+mt.oldNote.substring(0,40)+'</div>';}
    html+='</div>';
  }
  html+='</div>';
  html+='<div style="padding:10px 16px 14px;border-top:1px solid rgba(129,140,248,0.06);display:flex;gap:8px">';
  html+='<button onclick="window._ezDoPasteNotes()" style="flex:1;height:40px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.2);transition:all 0.3s">✅ لصق المحدد</button>';
  html+='<button onclick="document.getElementById(\'ez-paste-overlay\').remove()" style="height:40px;padding:0 16px;border:none;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#64748b;background:rgba(148,163,184,0.08);border:1px solid rgba(148,163,184,0.15);transition:all 0.3s">إلغاء</button>';
  html+='</div></div>';

  var overlay=document.createElement('div');
  overlay.id='ez-paste-overlay';
  overlay.innerHTML=html;
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,15,35,0.5);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center';
  document.body.appendChild(overlay);
  window._ezPasteMatches=matches;
};

window._ezDoPasteNotes=function(){
  var matches=window._ezPasteMatches;
  if(!matches){return;}
  var pasted=0;
  for(var m=0;m<matches.length;m++){
    var chk=document.getElementById('ez-paste-chk-'+m);
    if(chk&&!chk.checked) continue;
    var mt=matches[m];
    var tb2=mt.row.closest('table');
    var h2=tb2.querySelector('tr');var hs2=h2.querySelectorAll('th,td');
    var ni2=_ezIdx(hs2,'note');
    if(ni2<0) continue;
    var noteCell=mt.tds[ni2];
    if(!noteCell) continue;
    var noteInp=noteCell.querySelector('input,textarea');
    if(noteInp){noteInp.value=mt.newNote;_ezFire(noteInp);}
    else{noteCell.textContent=mt.newNote;}
    pasted++;
  }
  var overlay=document.getElementById('ez-paste-overlay');
  if(overlay) overlay.remove();
  window.ezShowToast('✅ تم لصق '+pasted+' نوتة بنجاح','success');
  ezBeep('success');
  try{_renderPackWarningBanner();}catch(e){}
};

window.showWarnings=function(warnings,callback){
  if(!warnings||warnings.length===0){callback();return;}
  var html='<div style="width:500px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(99,102,241,0.15),0 4px 16px rgba(0,0,0,0.06);border:2px solid rgba(129,140,248,0.12);font-family:Cairo,sans-serif;animation:dialogEnter 0.5s cubic-bezier(0.16,1,0.3,1)">';
  html+='<div style="position:relative;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b);background-size:200% 100%;animation:barShift 4s ease infinite"></div>';
  html+='<div style="padding:16px 22px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(129,140,248,0.08)">';
  html+='<div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 14px rgba(245,158,11,0.25),inset 0 1px 0 rgba(255,255,255,0.3)">⚠️</div>';
  html+='<div><div style="font-size:16px;font-weight:900;color:#1e1b4b">تحذيرات تحتاج مراجعة</div>';
  html+='<div style="font-size:11px;font-weight:700;color:#92400e;margin-top:1px">'+warnings.length+' تحذير · اختر لكل تحذير: تطبيق أو تجاهل</div></div></div>';
  var _hasDaysWarnings=false;
  for(var _dw=0;_dw<warnings.length;_dw++){if(warnings[_dw].type==='days')_hasDaysWarnings=true;}
  if(_hasDaysWarnings){
    html+='<div style="padding:10px 18px;background:rgba(99,102,241,0.04);border-bottom:1px solid rgba(129,140,248,0.08);direction:rtl">';
    html+='<div style="display:flex;gap:8px;align-items:center">';
    html+='<div style="flex:1;font-size:11px;font-weight:800;color:#3730a3">⚡ تطبيق الاقتراحات الذكية على كل الأصناف<br><span style="font-size:9px;font-weight:700;color:#6366f1">30→qty1 · 60→qty2 · 90→qty3 — كل صنف حسب عدده</span></div>';
    html+='<button onclick="window.ezApplyAllDays()" style="height:36px;padding:0 16px;border:none;border-radius:9px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5);box-shadow:0 3px 10px rgba(99,102,241,0.2);transition:all 0.3s;white-space:nowrap">⚡ تطبيق على الكل</button>';
    html+='</div></div>';
  }
  html+='<div style="padding:14px 18px;max-height:420px;overflow-y:auto">';

  /* ── Detect outlier days warnings: find the "odd one out" ── */
  var _daysCounts={};var _daysWarningIdxs=[];
  for(var _di=0;_di<warnings.length;_di++){
    if(warnings[_di].type==='days'&&warnings[_di]._extractedDays){
      var _ed=warnings[_di]._extractedDays;
      _daysCounts[_ed]=(_daysCounts[_ed]||0)+1;
      _daysWarningIdxs.push(_di);
    }
  }
  var _majorityDays=0;var _majorityCount=0;
  for(var _dk in _daysCounts){if(_daysCounts[_dk]>_majorityCount){_majorityCount=_daysCounts[_dk];_majorityDays=parseInt(_dk);}}
  var _outlierIdxs={};
  if(_daysWarningIdxs.length>1){
    for(var _oi=0;_oi<_daysWarningIdxs.length;_oi++){
      var _wi=_daysWarningIdxs[_oi];
      if(warnings[_wi]._extractedDays!==_majorityDays){_outlierIdxs[_wi]=true;}
    }
  }
  var _renderOrder=[];
  for(var _ro=0;_ro<warnings.length;_ro++){if(_outlierIdxs[_ro])_renderOrder.push(_ro);}
  for(var _ro2=0;_ro2<warnings.length;_ro2++){if(!_outlierIdxs[_ro2])_renderOrder.push(_ro2);}

  for(var _ri=0;_ri<_renderOrder.length;_ri++){
    var i=_renderOrder[_ri];
    var w=warnings[i];
    var _isOutlier=!!_outlierIdxs[i];
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
      var extractedDays=dayMatch?parseInt(dayMatch[1]):0;
      var selectedT=w._selectedT||30;
      reason='📅 اختلاف في مدة العلاج';
      var suggestedQty=1;var suggestedSize=selectedT;
      if(extractedDays===30||extractedDays===28){suggestedQty=1;suggestedSize=selectedT;}
      else if(extractedDays===60||extractedDays===56){suggestedQty=2;suggestedSize=selectedT;}
      else if(extractedDays===90||extractedDays===84){suggestedQty=3;suggestedSize=selectedT;}
      else{suggestedQty=Math.max(1,Math.round(extractedDays/selectedT));suggestedSize=selectedT;}
      var isKnown=(extractedDays===30||extractedDays===60||extractedDays===90||extractedDays===28||extractedDays===56||extractedDays===84);
      detail='المكتوب: <b>'+extractedDays+' يوم</b> — المختار: <b>'+selectedT+' يوم</b>';
      if(isKnown) detail+='<br>💡 اقتراح: Qty=<b>'+suggestedQty+'</b> و Size=<b>'+suggestedSize+'</b>';
      else detail+='<br>⚠️ عدد غير معتاد — عدّل يدوياً';
      actionLabel='تطبيق التعديل';
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
    } else if(w.type==='unrecognized_dose'){
      reason='❓ الجرعة المكتوبة غير مفهومة';
      detail='النص المكتوب: "'+w.currentNote+'" - لم يتم التعرف على الوقت أو التكرار. عدّل القيم أدناه ثم اضغط تطبيق.';
      actionLabel='تطبيق التعديلات';
    } else {
      reason='📌 يحتاج مراجعة';
      detail=msgText;
      actionLabel='تطبيق';
    }

    html+='<div id="warn-card-'+i+'" style="background:'+(_isOutlier?'rgba(239,68,68,0.06)':lc.bg)+';border:'+(_isOutlier?'2.5px solid #ef4444':'1.5px solid '+lc.bdr)+';border-radius:14px;padding:14px 16px;margin-bottom:10px;position:relative;transition:all 0.3s">';
    if(_isOutlier){html+='<div style="position:absolute;top:-8px;right:12px;background:#ef4444;color:#fff;font-size:9px;font-weight:900;padding:2px 10px;border-radius:10px;font-family:Cairo,sans-serif">⚠️ مختلف عن الباقي</div>';}
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
      } else if(w.type==='unrecognized_dose'){
        /* Smart UI for unrecognized_dose: size + every + time */
        html+='<div style="font-size:11px;font-weight:800;color:#92400e;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:8px;padding:8px 10px;margin-bottom:8px;direction:rtl">📝 الجرعة المكتوبة: <span style="color:#1e1b4b;font-size:12px">'+w.currentNote+'</span></div>';
        html+='<div style="display:flex;gap:8px;direction:rtl;margin-bottom:8px;flex-wrap:wrap">';
        html+='<div style="flex:1;min-width:100px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">الحجم (Size)</label>';
        html+='<input type="number" id="edit-size-'+i+'" value="'+w.currentSize+'" min="1" max="9999" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:13px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>';
        html+='<div style="flex:1;min-width:120px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">Every (كل كام ساعة)</label>';
        html+='<select id="edit-every-'+i+'" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:13px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;direction:rtl">';
        html+='<option value="24"'+(w.currentEvery===24?' selected':'')+'>كل 24 ساعة (مرة)</option>';
        html+='<option value="12"'+(w.currentEvery===12?' selected':'')+'>كل 12 ساعة (مرتين)</option>';
        html+='<option value="8"'+(w.currentEvery===8?' selected':'')+'>كل 8 ساعات (3 مرات)</option>';
        html+='<option value="6"'+(w.currentEvery===6?' selected':'')+'>كل 6 ساعات (4 مرات)</option>';
        html+='<option value="48"'+(w.currentEvery===48?' selected':'')+'>كل 48 ساعة (يوم بعد يوم)</option>';
        html+='<option value="168"'+(w.currentEvery===168?' selected':'')+'>كل 168 ساعة (أسبوعياً)</option>';
        html+='</select></div>';
        html+='<div style="width:140px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">وقت البدء (Start Time)</label>';
        html+='<input type="time" id="edit-time-'+i+'" value="'+w.currentTime+'" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:13px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>';
        html+='</div>';
      } else if(w.type==='days'){
        var _dayMatch2=w.message.match(/"(\d+)\s*يوم"/);
        var _extDays2=_dayMatch2?parseInt(_dayMatch2[1]):0;
        var _selT2=w._selectedT||30;
        var _sugQty2=1;var _sugSize2=_selT2;
        if(_extDays2===30||_extDays2===28){_sugQty2=1;_sugSize2=_selT2;}
        else if(_extDays2===60||_extDays2===56){_sugQty2=2;_sugSize2=_selT2;}
        else if(_extDays2===90||_extDays2===84){_sugQty2=3;_sugSize2=_selT2;}
        else{_sugQty2=Math.max(1,Math.round(_extDays2/_selT2));_sugSize2=_selT2;}
        html+='<div style="display:flex;gap:8px;direction:rtl;margin-bottom:8px;flex-wrap:wrap">';
        html+='<div style="flex:1;min-width:80px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">Qty (عدد العلب)</label>';
        html+='<input type="number" id="edit-qty-'+i+'" value="'+_sugQty2+'" min="1" max="12" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:14px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>';
        html+='<div style="flex:1;min-width:80px"><label style="display:block;font-size:10px;font-weight:800;color:'+lc.labelColor+';margin-bottom:3px">Size (أيام)</label>';
        html+='<input type="number" id="edit-size-'+i+'" value="'+_sugSize2+'" min="1" max="365" style="width:100%;padding:8px 10px;border:1.5px solid '+lc.bdr+';border-radius:8px;font-size:14px;font-weight:800;color:#1e1b4b;background:#fff;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>';
        html+='</div>';
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
  html+='<button onclick="window.ezApplyAllWarnings()" style="flex:1;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.2);transition:all 0.3s">✅ تطبيق التعديلات</button>';
  html+='<button onclick="window.skipAllWarnings()" style="height:42px;padding:0 16px;border:none;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#ef4444;background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.2);transition:all 0.3s">⏭️ تجاهل</button>';
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
    var qtyInput=document.getElementById('edit-qty-'+idx);
    var sizeInput=document.getElementById('edit-size-'+idx);
    if(qtyInput&&sizeInput){
      var newQty=parseInt(qtyInput.value)||1;
      var newSize=parseInt(sizeInput.value)||30;
      w.onEdit(newQty,newSize);
      window.ezShowToast('✅ تم: Qty='+newQty+' Size='+newSize,'success');
    } else {
      var editInput=document.getElementById('edit-'+idx);
      if(editInput){w.onEdit(1,parseInt(editInput.value));}
      window.ezShowToast('✅ تم تعديل عدد الأيام','success');
    }
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
  } else if(w.type==='unrecognized_dose'&&w.onEdit){
    var everySelUD=document.getElementById('edit-every-'+idx);
    var timeInpUD=document.getElementById('edit-time-'+idx);
    var sizeInpUD=document.getElementById('edit-size-'+idx);
    if(everySelUD&&timeInpUD){
      var newEvery2=parseInt(everySelUD.value);
      var newTime2=timeInpUD.value;
      var newSize2=sizeInpUD?parseInt(sizeInpUD.value):0;
      w.onEdit(newEvery2,newTime2,newSize2);
      window.ezShowToast('✅ تم تطبيق Every='+newEvery2+'h, Time='+newTime2+(newSize2>0?', Size='+newSize2:''),'success');
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
  var w=warningQueue[idx];
  var card=document.getElementById('warn-card-'+idx);
  if(w&&w.rowIndex!=null&&window._ezRows){
    var rd=window._ezRows[w.rowIndex];
    if(rd){
      if(w.type==='dose2') rd.forceDose2=false;
      if(w.type==='days'){rd.calculatedDays=window._ezLastTVal;rd.calculatedSize=window._ezLastTVal;rd.daysOverrideQty=null;rd.warningOverride=false;}
      if(w.type==='unrecognized_dose'){rd.unrecognizedEvery=null;rd.unrecognizedTime=null;rd.unrecognizedSize=null;rd.warningOverride=false;}
      if(w.type==='ramadan_unclear'){rd.ramadanOverrideEvery=null;rd.ramadanOverrideTime=null;}
    }
  }
  w._skipped=true;
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

window.skipAllWarnings=function(){
  for(var i=0;i<warningQueue.length;i++){
    var w=warningQueue[i];
    w._skipped=true;
    if(w&&w.rowIndex!=null&&window._ezRows){
      var rd=window._ezRows[w.rowIndex];
      if(rd){
        if(w.type==='dose2') rd.forceDose2=false;
        if(w.type==='days'){rd.calculatedDays=window._ezLastTVal;rd.calculatedSize=window._ezLastTVal;rd.daysOverrideQty=null;rd.warningOverride=false;}
        if(w.type==='unrecognized_dose'){rd.unrecognizedEvery=null;rd.unrecognizedTime=null;rd.unrecognizedSize=null;rd.warningOverride=false;}
        if(w.type==='ramadan_unclear'){rd.ramadanOverrideEvery=null;rd.ramadanOverrideTime=null;}
      }
    }
  }
  var overlay=document.getElementById('warning-overlay');
  if(overlay) overlay.remove();
  if(window.warningCallback) window.warningCallback();
};

window.ezApplyAllDays=function(){
  var appliedCount=0;
  var _selT=window._ezLastTVal||30;
  for(var i=0;i<warningQueue.length;i++){
    var w=warningQueue[i];
    if(w.type!=='days'||w._skipped) continue;
    var ext=w._extractedDays||0;
    var smartQty=1;var smartSize=_selT;
    if(ext===30||ext===28){smartQty=1;}
    else if(ext===60||ext===56){smartQty=2;}
    else if(ext===90||ext===84){smartQty=3;}
    else{smartQty=Math.max(1,Math.round(ext/_selT));}
    var qInp=document.getElementById('edit-qty-'+i);
    var sInp=document.getElementById('edit-size-'+i);
    if(qInp) qInp.value=smartQty;
    if(sInp) sInp.value=smartSize;
    if(w.onEdit) w.onEdit(smartQty,smartSize);
    var card=document.getElementById('warn-card-'+i);
    if(card){
      card.style.cssText='background:rgba(16,185,129,0.06)!important;border:1.5px solid rgba(16,185,129,0.25)!important;border-radius:14px;padding:14px 16px;margin-bottom:10px';
      var btns=card.querySelectorAll('button');
      for(var b=0;b<btns.length;b++) btns[b].remove();
      var badge=document.createElement('div');
      badge.style.cssText='text-align:center;font-size:13px;font-weight:800;color:#059669;padding:6px;background:rgba(16,185,129,0.06);border-radius:8px;margin-top:6px';
      badge.textContent='✅ تم (Qty='+smartQty+' Size='+smartSize+')';
      card.appendChild(badge);
    }
    appliedCount++;
  }
  window.ezShowToast('✅ تم تطبيق الاقتراحات الذكية على '+appliedCount+' صنف','success');
};

window.ezApplyAllWarnings=function(){
  for(var i=0;i<warningQueue.length;i++){
    var w=warningQueue[i];
    if(w._skipped) continue;
    if(w.type==='days'&&w.onEdit){
      var qInp=document.getElementById('edit-qty-'+i);
      var sInp=document.getElementById('edit-size-'+i);
      var newQ=qInp?parseInt(qInp.value)||1:1;
      var newS=sInp?parseInt(sInp.value)||30:30;
      w.onEdit(newQ,newS);
    } else if(w.type==='dose2'){
      var rd=window._ezRows?window._ezRows[w.rowIndex]:null;
      if(rd) rd.forceDose2=true;
    } else if(w.type==='ramadan_unclear'&&w.onEdit){
      var evSel=document.getElementById('edit-every-'+i);
      var tmInp=document.getElementById('edit-time-'+i);
      if(evSel&&tmInp) w.onEdit(parseInt(evSel.value),tmInp.value);
    } else if(w.type==='unrecognized_dose'&&w.onEdit){
      var evSel2=document.getElementById('edit-every-'+i);
      var tmInp2=document.getElementById('edit-time-'+i);
      var szInp2=document.getElementById('edit-size-'+i);
      if(evSel2&&tmInp2) w.onEdit(parseInt(evSel2.value),tmInp2.value,szInp2?parseInt(szInp2.value):0);
    }
  }
  var overlay=document.getElementById('warning-overlay');
  if(overlay) overlay.remove();
  if(window.warningCallback) window.warningCallback();
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
    /* Read and save ramadan days remaining */
    if(ramadanMode){
      var rmDaysInp=document.getElementById('ez-rm-days-left');
      var rmDaysVal=rmDaysInp?parseInt(rmDaysInp.value):0;
      if(!rmDaysVal||rmDaysVal<1){
        var _fsdSub=(document.querySelector('#fstartDate')||{}).value||'';
        rmDaysVal=_ezRamadanDaysLeft(_fsdSub);
        if(!rmDaysVal||rmDaysVal<1){window.ezShowToast('❌ ادخل عدد الأيام المتبقية في رمضان','error');return;}
      }
      if(rmDaysVal>30)rmDaysVal=30;
      window._rmDaysLeft=rmDaysVal;
      window._rmMVal=m; /* حفظ عدد الشهور للاستخدام عند إلغاء رمضان */
      window._rmTVal=t; /* حفظ أيام الشهر */
    } else {
      window._rmDaysLeft=null;
      window._rmMVal=null;
      window._rmTVal=null;
    }
    /* Save settings for next time */
    saveSettings({m:m,t:t,autoDuration:autoDuration,showWarnings:showWarningsFlag,ramadanMode:ramadanMode});

    /* ── 14-pill check: block if any unanswered ── */
    var _scan14=_scanPackSizeWarnings(m,t);
    if(_scan14.items14&&_scan14.items14.length>0){
      var _u14=_scan14.items14.filter(function(it){return it.choice==='?';});
      if(_u14.length>0){
        window.ezShowToast('⚠️ يوجد '+_u14.length+' صنف(أصناف) علبة 14 — اختر علبة واحدة أو علبتين أولاً','error');
        return;
      }
    }

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
/* ── RAMADAN SPLIT STATE ── */
window._ramadanSplitDone=false;
window._ramadanSplitData=null; /* {ramadanDays, remainDays, totalDays, endDate, startDate} */

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
      btn.innerHTML='📅 الشهر الثالث';
      btn.style.background=(monthCounter===1)?'linear-gradient(135deg, #818cf8, #6366f1)':'linear-gradient(135deg, #10b981, #059669)';
      btn.style.color='#fff';
      btn.setAttribute('data-step',String(monthCounter+1));
    }
  } else if(monthCounter>=3){
    /* الشهر الثالث وصلنا - نوقف الزر */
    btn.innerHTML='✅ تم عرض 3 شهور';
    btn.style.background='linear-gradient(135deg, #94a3b8, #64748b)';
    btn.style.color='#fff';
    btn.disabled=true;
  }
};

window.ezConsolidateForPrint=function(){
  var tb=_ezFindTable();if(!tb)return;
  var sDateElem=document.querySelector('#fstartDate');
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var qi=_ezIdx(hs,'qty'),si=_ezIdx(hs,'size');
  var overlay=document.createElement('div');overlay.id='ez-consolidate-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center';
  var html='<div style="width:320px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.2);border:2px solid rgba(129,140,248,0.12);font-family:Cairo,sans-serif">';
  html+='<div style="padding:18px 22px 14px;text-align:center;border-bottom:1px solid rgba(129,140,248,0.08)"><div style="font-size:24px;margin-bottom:4px">🖨️</div><div style="font-size:16px;font-weight:900;color:#1e1b4b">تجميع للطباعة</div><div style="font-size:11px;font-weight:700;color:#64748b">اختر عدد الشهور</div></div>';
  html+='<div style="padding:16px 22px;display:flex;flex-direction:column;gap:8px">';
  html+='<button onclick="window._doConsolidate(1)" style="height:44px;border:2px solid rgba(99,102,241,0.15);border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#3730a3;background:rgba(99,102,241,0.04)">📦 شهر واحد (Qty=1)</button>';
  html+='<button onclick="window._doConsolidate(2)" style="height:44px;border:2px solid rgba(99,102,241,0.15);border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#3730a3;background:rgba(99,102,241,0.04)">📦📦 شهرين (Qty=2)</button>';
  html+='<button onclick="window._doConsolidate(3)" style="height:44px;border:2px solid rgba(16,185,129,0.2);border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#065f46;background:rgba(16,185,129,0.06)">📦📦📦 ثلاثة شهور (Qty=3)</button>';
  html+='</div><div style="padding:8px 22px 16px"><button onclick="document.getElementById(\'ez-consolidate-overlay\').remove()" style="width:100%;height:36px;border:1px solid rgba(148,163,184,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;color:#64748b;background:rgba(148,163,184,0.05)">إلغاء</button></div></div>';
  overlay.innerHTML=html;overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
};

window._doConsolidate=function(months){
  var tb=_ezFindTable();if(!tb)return;
  var sDateElem=document.querySelector('#fstartDate');
  if(originalStartDate&&sDateElem){sDateElem.value=originalStartDate;_ezFire(sDateElem);}
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var qi=_ezIdx(hs,'qty'),si=_ezIdx(hs,'size');
  var rows=tb.querySelectorAll('tr');
  for(var i=1;i<rows.length;i++){var tds=rows[i].querySelectorAll('td');if(qi>=0&&tds.length>qi){var qInput=tds[qi].querySelector('input,textarea');if(qInput){qInput.value=String(months);_ezFire(qInput);}else tds[qi].textContent=String(months);}if(si>=0&&tds.length>si){var sInput=tds[si].querySelector('input,textarea');if(sInput) _ezFire(sInput);}}
  var overlay=document.getElementById('ez-consolidate-overlay');if(overlay)overlay.remove();
  var labels={1:'شهر واحد',2:'شهرين',3:'ثلاثة شهور'};
  window.ezShowToast('✅ تم التجميع: '+labels[months]+' (Qty='+months+')','success');ezBeep('success');
};

/* ══════════════════════════════════════════
   🌙 RAMADAN SPLIT - SHOW INPUT DIALOG
   ══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   🌙 CUSTOM RAMADAN CONFIRM DIALOG
   ══════════════════════════════════════════ */
function _ezRamadanConfirm(opts, onYes, onNo){
  /* opts = {ramLeft, normalDays, totalDays, t, m, rmDays, startDate, normalStart} */
  var existing=document.getElementById('ez-ramadan-confirm-overlay');
  if(existing) existing.remove();

  var overlay=document.createElement('div');
  overlay.id='ez-ramadan-confirm-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,10,40,0.75);backdrop-filter:blur(12px);z-index:9999999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.25s ease';

  var mLabel=opts.m>1?('<span style="color:#a5b4fc;font-size:11px;font-weight:600"> ('+opts.m+' × '+opts.t+' يوم)</span>'):'';

  overlay.innerHTML=`
  <div style="width:340px;border-radius:24px;background:linear-gradient(160deg,#1e1b4b 0%,#0f0a28 100%);border:1.5px solid rgba(129,140,248,0.25);box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04);overflow:hidden;font-family:Cairo,sans-serif;direction:rtl">
    <div style="height:3px;background:linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24);background-size:200% 100%;animation:barShift 3s ease infinite"></div>
    <div style="padding:22px 22px 10px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px;animation:pulse 2s infinite">🌙</div>
      <div style="font-size:17px;font-weight:900;color:#fbbf24;letter-spacing:-0.5px;margin-bottom:4px">تأكيد تقسيم رمضان</div>
      <div style="font-size:11px;color:#a5b4fc;font-weight:600;letter-spacing:0.5px">وضع رمضان مفعّل</div>
    </div>
    <div style="margin:6px 16px 16px;background:rgba(255,255,255,0.04);border-radius:14px;border:1px solid rgba(129,140,248,0.12);overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(129,140,248,0.08);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#94a3b8;font-weight:700">🌙 جرعات رمضان</span>
        <span style="font-size:15px;font-weight:900;color:#fbbf24">${opts.ramLeft} يوم</span>
      </div>
      <div style="padding:10px 14px;border-bottom:1px solid rgba(129,140,248,0.08);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#94a3b8;font-weight:700">✅ جرعات عادية بعده</span>
        <span style="font-size:15px;font-weight:900;color:#34d399">${opts.normalDays} يوم</span>
      </div>
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#94a3b8;font-weight:700">📦 الإجمالي</span>
        <span style="font-size:13px;font-weight:900;color:#c7d2fe">${opts.totalDays} يوم${mLabel?(' '+opts.m+'×'+opts.t):''}</span>
      </div>
    </div>
    <div style="padding:6px 16px 4px;font-size:10px;color:#64748b;text-align:center;font-weight:600">
      📅 رمضان: ${opts.startDate||'—'} &nbsp;→&nbsp; ✅ بعده: ${opts.normalStart||'—'}
    </div>
    <div style="padding:14px 16px 18px;display:flex;gap:10px">
      <button id="ez-ram-confirm-yes" style="flex:2;height:46px;border:none;border-radius:14px;font-size:14px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;color:#1e1b4b;background:linear-gradient(145deg,#fbbf24,#f59e0b);box-shadow:0 6px 20px rgba(245,158,11,0.35),inset 0 1px 0 rgba(255,255,255,0.4);transition:all 0.2s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
        ✅ تأكيد
      </button>
      <button id="ez-ram-confirm-no" style="flex:1;height:46px;border:1.5px solid rgba(129,140,248,0.2);border-radius:14px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#818cf8;background:rgba(129,140,248,0.06);transition:all 0.2s" onmouseover="this.style.background='rgba(129,140,248,0.12)'" onmouseout="this.style.background='rgba(129,140,248,0.06)'">
        إلغاء
      </button>
    </div>
  </div>`;

  document.body.appendChild(overlay);
  document.getElementById('ez-ram-confirm-yes').onclick=function(){overlay.remove();if(onYes)onYes();};
  document.getElementById('ez-ram-confirm-no').onclick=function(){overlay.remove();if(onNo)onNo();};
  overlay.onclick=function(e){if(e.target===overlay){overlay.remove();if(onNo)onNo();}};
}

window.ezRamadanSplit=function(){
  /* نستخدم القيمة المحفوظة من الدايلوج الرئيسي مباشرة */
  var daysLeft=window._rmDaysLeft||null;
  if(!daysLeft||daysLeft<1||daysLeft>30){
    /* Auto-detect from fstartDate */
    var _fsd2=(document.querySelector('#fstartDate')||{}).value||'';
    var autoD=_ezRamadanDaysLeft(_fsd2);
    if(autoD>0){daysLeft=autoD;window._rmDaysLeft=daysLeft;}
    else{var v=parseInt(prompt('🌙 باقي كام يوم في رمضان؟ (1-30)','15'));
    if(!v||v<1||v>30){window.ezShowToast('❌ رقم غير صحيح','error');return;}
    daysLeft=v;
    window._rmDaysLeft=daysLeft;}
  }
  window._ezApplyRamadanSplit(daysLeft);
};

/* ══════════════════════════════════════════
   🌙 APPLY RAMADAN SPLIT
   ══════════════════════════════════════════ */
window._ezApplyRamadanSplit=function(daysLeft){
  /* daysLeft = عدد الأيام الباقية في رمضان (ما أدخله المستخدم) */
  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('❌ لم يتم العثور على الجدول','error');return;}

  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var si=_ezIdx(hs,'size'),ei=_ezIdx(hs,'end date'),ti=_ezIdx(hs,'time');
  var evi=_ezIdx(hs,'every');if(evi<0)evi=_ezIdx(hs,'evry');
  var ni=_ezIdx(hs,'note'),qi=_ezIdx(hs,'qty');
  var sdi=_ezIdx(hs,'start date');
  var fire=_ezFire,get=_ezGet;

  /* حساب الأيام: daysLeft = الأيام الباقية في رمضان
     إجمالي الأيام = أيام الشهر × عدد الشهور (مش أيام الشهر بس) */
  var _t=window._rmTVal||window._ezLastTVal||30;
  var _m=window._rmMVal||window._ezLastMVal||1;
  var totalDays=_t*_m;
  var ramLeft=Math.min(daysLeft,totalDays);
  var normalDays=Math.max(0,totalDays-ramLeft);

  /* تاريخ البداية الحالي (من #fstartDate) */
  var sDateElem=document.querySelector('#fstartDate');
  var startDateStr=sDateElem?sDateElem.value:'';

  /* تاريخ نهاية رمضان = startDate + ramLeft - 1 */
  function addDays(dateStr,n){
    var d=new Date(dateStr);d.setDate(d.getDate()+n);
    var y=d.getFullYear(),m=('0'+(d.getMonth()+1)).slice(-2),dd=('0'+d.getDate()).slice(-2);
    return y+'-'+m+'-'+dd;
  }

  var ramEndDate=addDays(startDateStr,ramLeft-1);
  var normalStartDate=addDays(startDateStr,ramLeft);
  var normalEndDate=addDays(startDateStr,totalDays-1);

  /* حفظ البيانات للإلغاء لاحقاً */
  window._ramadanSplitData={
    ramadanDays:ramLeft,normalDays:normalDays,totalDays:totalDays,
    ramEndDate:ramEndDate,normalStartDate:normalStartDate,normalEndDate:normalEndDate,
    startDateStr:startDateStr
  };

  /* نحفظ snapshot من الجدول للإلغاء */
  window._ramadanSplitSnapshot=tb.innerHTML;

  if(normalDays<=0){
    /* المدة كلها رمضان - فقط نحدث الـ size بالأيام الصح */
    var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
    rows.forEach(function(r){
      var tds=r.querySelectorAll('td');
      if(tds.length>si){
        var sInp=tds[si].querySelector('input,textarea');
        if(sInp){sInp.value=ramLeft;fire(sInp);}
      }
      if(ei>=0&&tds.length>ei){
        var eInp=tds[ei].querySelector('input');
        if(eInp){eInp.value=ramEndDate;fire(eInp);}
      }
    });
    window.ezShowToast('🌙 المدة كلها رمضان ('+ramLeft+' يوم)','success');
    window._ramadanSplitDone=true;
    /* تحديث أزرار الـ dialog */
    window._refreshPostDialogBtns();
    return;
  }

  /* نقسم الجدول: صفوف رمضان + صفوف عادية */
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);

  /* نجمع الصفوف الأصلية مع بياناتها */
  var rowsData=[];
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');
    var timeVal=ti>=0&&tds[ti]?get(tds[ti]):'';
    var noteVal=ni>=0&&tds[ni]?get(tds[ni]):'';
    var evryVal=evi>=0&&tds[evi]?get(tds[evi]):'24';
    var sizeVal=si>=0&&tds[si]?get(tds[si]):'0';
    var qtyVal=qi>=0&&tds[qi]?get(tds[qi]):'1';
    /* هل صف رمضان؟ (فطار أو سحور) */
    var isRam=noteVal.indexOf('الفطار')>-1||noteVal.indexOf('السحور')>-1
              ||noteVal.indexOf('Iftar')>-1||noteVal.indexOf('Suhoor')>-1
              ||noteVal.indexOf('After Iftar')>-1||noteVal.indexOf('Before Suhoor')>-1
              ||noteVal.indexOf('التراويح')>-1||noteVal.indexOf('Tarawih')>-1;
    rowsData.push({row:r,timeVal:timeVal,noteVal:noteVal,evryVal:evryVal,
                   sizeVal:sizeVal,qtyVal:qtyVal,isRam:isRam});
  });

  /* لكل صف رمضان: نضبط الـ size = ramLeft والـ end date = ramEndDate */
  /* ونعمل نسخة جديدة "عادية" لباقي المدة */
  var lastRamRow=null;
  var normalRowsToInsert=[];

  rowsData.forEach(function(rd){
    var tds=rd.row.querySelectorAll('td');

    if(rd.isRam){
      /* end date رمضان */
      if(ei>=0&&tds[ei]){var eInp=tds[ei].querySelector('input');if(eInp){eInp.value=ramEndDate;fire(eInp);}}
      lastRamRow=rd.row;

      /* نعمل نسخة عادية لباقي المدة */
      var normalRow=rd.row.cloneNode(true);
      var ntds=normalRow.querySelectorAll('td');

      /* تحويل الجرعة: فطار → فطار عادي، سحور → عشاء عادي */
      var origNote=rd.noteVal;
      var newNote=origNote;
      var newTime=rd.timeVal;
      var newEvry='24';

      /* بعد الفطار → بعد الفطار عادي 09:00 */
      if(origNote.indexOf('بعد الفطار')>-1||origNote.indexOf('After Iftar')>-1){
        newNote=origNote.replace(/⚡\s*/g,'').replace('بعد الفطار','بعد الفطار').replace('After Iftar','After Breakfast');
        newTime=NORMAL_TIMES.afterBreakfast||'09:00';
      }
      /* قبل الفطار → قبل الفطار عادي */
      else if(origNote.indexOf('قبل الفطار')>-1||origNote.indexOf('Before Iftar')>-1){
        newNote=origNote.replace(/⚡\s*/g,'').replace('قبل الفطار','قبل الفطار').replace('Before Iftar','Before Breakfast');
        newTime=NORMAL_TIMES.beforeBreakfast||'08:00';
      }
      /* بعد السحور → بعد العشاء 21:00 */
      else if(origNote.indexOf('بعد السحور')>-1||origNote.indexOf('After Suhoor')>-1){
        newNote=origNote.replace(/⚡\s*/g,'').replace('بعد السحور','بعد العشاء').replace('After Suhoor','After Dinner');
        newTime=NORMAL_TIMES.afterDinner||'21:00';
      }
      /* قبل السحور → قبل العشاء 20:00 */
      else if(origNote.indexOf('قبل السحور')>-1||origNote.indexOf('Before Suhoor')>-1){
        newNote=origNote.replace(/⚡\s*/g,'').replace('قبل السحور','قبل العشاء').replace('Before Suhoor','Before Dinner');
        newTime=NORMAL_TIMES.beforeDinner||'20:00';
      }
      /* بعد التراويح → بعد الغداء 14:00 */
      else if(origNote.indexOf('بعد التراويح')>-1||origNote.indexOf('After Tarawih')>-1){
        newNote=origNote.replace(/⚡\s*/g,'').replace('بعد التراويح','بعد الغداء').replace('After Tarawih','After Lunch');
        newTime=NORMAL_TIMES.afterLunch||'14:00';
      }

      /* نضبط النسخة العادية */
      if(ni>=0&&ntds[ni]){var nInp=ntds[ni].querySelector('input,textarea');if(nInp){nInp.value=newNote;fire(nInp);}}
      if(ti>=0&&ntds[ti]){var tInp=ntds[ti].querySelector('input[type=\'time\']');if(tInp){tInp.value=newTime;fire(tInp);}}
      if(evi>=0&&ntds[evi]){var evInp=ntds[evi].querySelector('input,select');if(evInp){evInp.value=newEvry;fire(evInp);}}
      /* حساب الـ size الصح نسبياً */
      var _curSizeVal=parseInt(rd.sizeVal)||0;
      var _normalSizeVal,_ramSizeVal;
      if(_curSizeVal>0&&totalDays>0){
        if(_curSizeVal===totalDays){_normalSizeVal=normalDays;_ramSizeVal=ramLeft;}
        else{_normalSizeVal=Math.round(_curSizeVal*normalDays/totalDays);if(_normalSizeVal<1&&normalDays>0)_normalSizeVal=1;_ramSizeVal=_curSizeVal-_normalSizeVal;if(_ramSizeVal<1)_ramSizeVal=1;}
      } else {_normalSizeVal=normalDays;_ramSizeVal=ramLeft;}
      /* size صف رمضان */
      if(si>=0&&tds[si]){var sRamFix=tds[si].querySelector('input,textarea');if(sRamFix){sRamFix.value=_ramSizeVal;fire(sRamFix);}}
      /* size نسخة عادية */
      if(si>=0&&ntds[si]){var snInp=ntds[si].querySelector('input,textarea');if(snInp){snInp.value=_normalSizeVal;fire(snInp);}}
      /* start date = normalStartDate */
      if(sdi>=0&&ntds[sdi]){var sdInp=ntds[sdi].querySelector('input[type=\'date\']');if(sdInp){sdInp.value=normalStartDate;fire(sdInp);}}
      /* end date = normalEndDate */
      if(ei>=0&&ntds[ei]){var enInp=ntds[ei].querySelector('input');if(enInp){enInp.value=normalEndDate;fire(enInp);}}

      normalRowsToInsert.push({afterRow:rd.row,newRow:normalRow});
    } else {
      /* صف عادي (مش رمضان): نحدث فقط */
      if(si>=0&&tds[si]){var sInp2=tds[si].querySelector('input,textarea');if(sInp2){sInp2.value=totalDays;fire(sInp2);}}
    }
  });

  /* نضيف الصفوف العادية بعد كل صف رمضان مقابله */
  normalRowsToInsert.forEach(function(item){
    if(item.afterRow.parentNode){
      item.afterRow.parentNode.insertBefore(item.newRow,item.afterRow.nextSibling);
    }
  });

  window._ramadanSplitDone=true;
  window.ezShowToast('🌙 تم التقسيم: '+ramLeft+' يوم رمضان + '+normalDays+' يوم عادي ✅','success');
  ezBeep('success');
  window._refreshPostDialogBtns();
};

/* ══════════════════════════════════════════
   ↩️ CANCEL RAMADAN SPLIT
   ══════════════════════════════════════════ */
window.ezCancelRamadanSplit=function(){
  var tb=_ezFindTable();
  if(!tb||!window._ramadanSplitSnapshot){window.ezShowToast('❌ لا يوجد تقسيم للإلغاء','error');return;}
  if(!confirm('هل تريد إلغاء تقسيم رمضان والرجوع للجدول الأصلي؟')) return;
  tb.innerHTML=window._ramadanSplitSnapshot;
  var fire=_ezFire;
  tb.querySelectorAll('input,select,textarea').forEach(function(el){fire(el);});
  window._ramadanSplitDone=false;
  window._ramadanSplitSnapshot=null;
  window._ramadanSplitData=null;
  window.ezShowToast('↩️ تم إلغاء التقسيم - الجدول رجع زي ما كان','info');
  window._refreshPostDialogBtns();
};

/* ══════════════════════════════════════════
   🔄 SKIP RAMADAN - إلغاء جرعات رمضان وتكملة بجرعات عادية
   ══════════════════════════════════════════ */
window.ezRamadanToNormal=function(){
  var tb=_ezFindTable();
  if(!tb){window.ezShowToast('❌ لم يتم العثور على الجدول','error');return;}

  /* الأيام الباقية في رمضان */
  var daysLeft=window._rmDaysLeft||null;
  if(!daysLeft||daysLeft<1||daysLeft>30){
    var _fsd3=(document.querySelector('#fstartDate')||{}).value||'';
    var autoD2=_ezRamadanDaysLeft(_fsd3);
    if(autoD2>0){daysLeft=autoD2;window._rmDaysLeft=daysLeft;}
    else{var v=parseInt(prompt('🌙 باقي كام يوم في رمضان؟ (1-30)','15'));
    if(!v||v<1||v>30){window.ezShowToast('❌ رقم غير صحيح','error');return;}
    daysLeft=v; window._rmDaysLeft=daysLeft;}
  }

  /* إجمالي الأيام من الإعداد الأصلي */
  var _t=window._rmTVal||window._ezLastTVal||30;
  var _m=window._rmMVal||window._ezLastMVal||1;
  var totalDays=_t*_m;
  var ramLeft=Math.min(daysLeft,totalDays);
  var normalDays=Math.max(0,totalDays-ramLeft);

  if(normalDays<=0){
    window.ezShowToast('❌ لا يوجد أيام عادية بعد رمضان','error');return;
  }

  /* FIX: تعريف startDateStr و addDays قبل استخدامهم في الـ confirm */
  var sDateElem=document.querySelector('#fstartDate');
  var startDateStr=sDateElem?sDateElem.value:'';
  function addDays(dateStr,n){
    var d=new Date(dateStr);d.setDate(d.getDate()+n);
    var y=d.getFullYear(),mo=('0'+(d.getMonth()+1)).slice(-2),dd=('0'+d.getDate()).slice(-2);
    return y+'-'+mo+'-'+dd;
  }

  var _normalStart=addDays(startDateStr,ramLeft);
  _ezRamadanConfirm({ramLeft:ramLeft,normalDays:normalDays,totalDays:totalDays,t:_t,m:_m,startDate:startDateStr,normalStart:_normalStart},
  function(){
  /* بعد التأكيد: تطبيق الإلغاء */

  /* FIX: لا نرجع للـ snapshot - نشتغل على الجدول الحالي مباشرة
     لأن الـ snapshot قبل المعالجة خالص وفيه نوتات أصلية مش فيها "الفطار" أو "السحور"
     فالكود هيفشل في إيجاد صفوف رمضان لو رجعنا للـ snapshot */

  var fire=_ezFire,get=_ezGet;
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var si=_ezIdx(hs,'size'),ei=_ezIdx(hs,'end date'),ti=_ezIdx(hs,'time');
  var evi=_ezIdx(hs,'every');if(evi<0)evi=_ezIdx(hs,'evry');
  var ni=_ezIdx(hs,'note'),qi=_ezIdx(hs,'qty'),ci=_ezIdx(hs,'code');
  var sdi=_ezIdx(hs,'start date');

  /* تاريخ البداية - نستخدم startDateStr المعرفة في الخارج */
  var normalStartDate=addDays(startDateStr,ramLeft);
  var normalEndDate=addDays(startDateStr,totalDays-1);

  /* تحويل كل صف */
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');
    if(!tds.length) return;
    var noteVal=ni>=0&&tds[ni]?get(tds[ni]):'';
    var isRam=noteVal.indexOf('الفطار')>-1||noteVal.indexOf('السحور')>-1
             ||noteVal.indexOf('Iftar')>-1||noteVal.indexOf('Suhoor')>-1
             ||noteVal.indexOf('التراويح')>-1||noteVal.indexOf('Tarawih')>-1;

    /* ── تحويل النوت لجرعة عادية ── */
    var newNote=noteVal,newTime='09:00',newEvry='24';
    if(isRam){
      var n=noteVal.replace(/^⚡\s*/,'');
      if(n.indexOf('بعد الفطار')>-1||n.indexOf('After Iftar')>-1){
        newNote=n.replace('After Iftar','After Breakfast');newTime=NORMAL_TIMES.afterBreakfast||'09:00';
      } else if(n.indexOf('قبل الفطار')>-1||n.indexOf('Before Iftar')>-1){
        newNote=n.replace('Before Iftar','Before Breakfast');newTime=NORMAL_TIMES.beforeBreakfast||'08:00';
      } else if(n.indexOf('بعد السحور')>-1||n.indexOf('After Suhoor')>-1){
        newNote=n.replace('بعد السحور','بعد العشاء').replace('After Suhoor','After Dinner');newTime=NORMAL_TIMES.afterDinner||'21:00';
      } else if(n.indexOf('قبل السحور')>-1||n.indexOf('Before Suhoor')>-1){
        newNote=n.replace('قبل السحور','قبل العشاء').replace('Before Suhoor','Before Dinner');newTime=NORMAL_TIMES.beforeDinner||'20:00';
      } else if(n.indexOf('بعد التراويح')>-1||n.indexOf('After Tarawih')>-1){
        newNote=n.replace('بعد التراويح','بعد الغداء').replace('After Tarawih','After Lunch');newTime=NORMAL_TIMES.afterLunch||'14:00';
      } else {
        newNote=n;newTime='09:00';
      }
      if(ni>=0&&tds[ni]){var nInp=tds[ni].querySelector('input,textarea');if(nInp){nInp.value=newNote;fire(nInp);}}
      if(ti>=0&&tds[ti]){var tInp=tds[ti].querySelector("input[type='time']");if(tInp){tInp.value=newTime;fire(tInp);}}
      if(evi>=0&&tds[evi]){var evInp=tds[evi].querySelector('input,select');if(evInp){evInp.value=newEvry;fire(evInp);}}
    }

    /* ── size: الأكواد المخصصة (fixedSize) تأخذ fixedSize - ramLeft، الباقي يأخذ normalDays ── */
    var _revertSize=normalDays;
    if(ci>=0&&tds[ci]){
      var _rvCode=get(tds[ci]).trim().replace(/\D/g,'');
      if(_rvCode&&fixedSizeCodes&&fixedSizeCodes[_rvCode]){
        _revertSize=Math.max(0,fixedSizeCodes[_rvCode]-ramLeft);
      }
    }
    if(si>=0&&tds[si]){var sInp=tds[si].querySelector('input,textarea');if(sInp){sInp.value=_revertSize;fire(sInp);}}
    /* ── تواريخ ── */
    if(sdi>=0&&tds[sdi]){var sdInp=tds[sdi].querySelector("input[type='date']");if(sdInp){sdInp.value=normalStartDate;fire(sdInp);}}
    if(ei>=0&&tds[ei]){var eInp=tds[ei].querySelector('input');if(eInp){eInp.value=normalEndDate;fire(eInp);}}
  });

  /* ── دمج الدبليكات (الصفوف المقسمة لرمضان وتحولت لعادية) ── */
  if(ci>=0){
    var groups={};
    var allRows=Array.from(tb.querySelectorAll('tr')).slice(1);
    allRows.forEach(function(r){
      var tds2=r.querySelectorAll('td');
      if(!tds2.length) return;
      /* Skip unchecked rows (original duplicates) */
      var cb2=r.querySelector('input[type="checkbox"]');
      if(cb2&&!cb2.checked) return;
      var code=(ci>=0&&tds2[ci]?get(tds2[ci]):'').trim().replace(/\D/g,'');
      if(!code) return;
      if(!groups[code]) groups[code]=[];
      groups[code].push(r);
    });
    Object.keys(groups).forEach(function(code){
      var g=groups[code];
      if(g.length<2) return;

      /* FIX: رتّب الصفوف بالوقت المحوّل بحيث الفطار (09:00) يجي قبل العشاء (21:00)
         بعد التحويل، صف الفطار وقته 09:00 وصف العشاء وقته 21:00
         لو مش مرتبهم صح، master هيكون صف العشاء وهيكتب start_time=21:00 (غلط) */
      g.sort(function(ra,rb){
        var tdsa=ra.querySelectorAll('td');var tdsb=rb.querySelectorAll('td');
        var getT=function(tds2){
          if(ti>=0&&tds2[ti]){var inp=tds2[ti].querySelector("input[type='time']");if(inp&&inp.value)return inp.value;}
          return '99:99';
        };
        var ta=getT(tdsa),tb2=getT(tdsb);
        return ta<tb2?-1:ta>tb2?1:0;
      });

      var master=g[0],mtds=master.querySelectorAll('td');

      /* FIX: حساب totalSize = مجموع كل الـ sizes (كل صف = normalDays × جرعة) */
      var totalSize=0;
      g.forEach(function(r2){var tds3=r2.querySelectorAll('td');if(si>=0&&tds3[si])totalSize+=parseInt(get(tds3[si]))||0;});

      /* FIX: every بناءً على عدد الصفوف المدموجة */
      var mergedCount=g.length;
      var mergedEvery=mergedCount>=4?'6':mergedCount===3?'8':mergedCount===2?'12':'24';

      /* FIX: دمج النوتات - نجمع أوقات الجرعات العادية في نوت واحدة
         مثال: "بعد الفطار" + "بعد العشاء" → "بعد الفطار والعشاء"
         أو: "After Breakfast" + "After Dinner" → "After Breakfast & Dinner" */
      /* Smart dedup: decompose already-combined notes first */
      var notesList=[];
      function _addNoteUnique(nt){
        nt=(nt||'').replace(/^⚡\s*/,'').trim();
        if(!nt) return;
        /* Decompose combined Arabic notes: "بعد الفطار والعشا" → ["بعد الفطار","بعد العشا"] */
        var arParts=nt.match(/^(بعد|قبل)\s+(.+)$/);
        if(arParts){
          var prefix=arParts[1]; /* بعد or قبل */
          var meals=arParts[2].split(/\s*و/);
          if(meals.length>1){
            for(var mp=0;mp<meals.length;mp++){
              var meal=meals[mp].trim();
              if(!meal) continue;
              var full=prefix+' '+meal;
              if(notesList.indexOf(full)===-1) notesList.push(full);
            }
            return;
          }
        }
        /* Decompose combined English notes: "After Breakfast & Dinner" */
        var enParts=nt.match(/^(After|Before)\s+(.+)$/i);
        if(enParts){
          var enPrefix=enParts[1];
          var enMeals=enParts[2].split(/\s*&\s*/);
          if(enMeals.length>1){
            for(var ep=0;ep<enMeals.length;ep++){
              var enMeal=enMeals[ep].trim();
              if(!enMeal) continue;
              var enFull=enPrefix+' '+enMeal;
              if(notesList.indexOf(enFull)===-1) notesList.push(enFull);
            }
            return;
          }
        }
        if(notesList.indexOf(nt)===-1) notesList.push(nt);
      }
      g.forEach(function(r2){
        var tds3=r2.querySelectorAll('td');
        if(ni>=0&&tds3[ni]){
          _addNoteUnique(get(tds3[ni]));
        }
      });
      var isEnNotes=notesList.length>0&&/[a-zA-Z]/.test(notesList[0]);
      var combinedNote='';
      if(notesList.length===2){
        if(isEnNotes){
          /* Strip "Before/After " from 2nd part to avoid repetition */
          var p2=notesList[1].replace(/^(Before|After)\s+/i,'');
          combinedNote=notesList[0]+' & '+p2;
        } else {
          /* بالعربي: بعد الفطار والعشاء / قبل الفطار والعشاء */
          var p2Ar=notesList[1].replace(/^(بعد|قبل)\s+/,'');
          combinedNote=notesList[0]+' و'+p2Ar;
        }
      } else if(notesList.length>2){
        combinedNote=isEnNotes?notesList.join(' & '):notesList.join(' و');
      } else if(notesList.length===1){
        combinedNote=notesList[0];
      } else {
        combinedNote=(get(mtds[ni])||'').replace(/^⚡\s*/,'').trim();
      }

      /* تحديث master */
      if(si>=0&&mtds[si]){var sM=mtds[si].querySelector('input,textarea');if(sM){sM.value=totalSize;fire(sM);}}
      /* FIX: النوت المدمجة */
      if(ni>=0&&mtds[ni]){var nM=mtds[ni].querySelector('input,textarea');if(nM){nM.value=combinedNote;fire(nM);}}
      /* every → يتحدد بناءً على عدد الجرعات في اليوم */
      if(evi>=0&&mtds[evi]){var eM=mtds[evi].querySelector('input,select');if(eM){eM.value=mergedEvery;fire(eM);}}
      /* FIX: qty لا يتغير - يبقى 1 كما هو من وضع رمضان */
      /* حذف باقي الصفوف */
      for(var j=1;j<g.length;j++){if(g[j].parentNode)g[j].parentNode.removeChild(g[j]);}
    });
  }

  /* FIX: تحديث #fstartDate للتاريخ الجديد (أول يوم بعد رمضان) */
  var sDateTopElem=document.querySelector('#fstartDate');
  if(sDateTopElem){sDateTopElem.value=normalStartDate;fire(sDateTopElem);}

  /* ── إعادة ترتيب الصفوف بناءً على الوقت (بعد تحويل سحور → عشاء) ── */
  _ezSortTableByTime(tb);

  window._ramadanSplitDone=true;
  window._ramadanSplitSnapshot=null;
  window.ezShowToast('✅ إلغاء رمضان: '+normalDays+' يوم عادي من '+normalStartDate+' ('+ramLeft+' يوم رمضان)','success');
  ezBeep('success');
  window._refreshPostDialogBtns();
  }); // end confirm callback
};

/* تحديث أزرار الـ post dialog بعد التقسيم/الإلغاء */
window._refreshPostDialogBtns=function(){
  var body=document.querySelector('#ez-post-dialog .ez-post-body');
  if(!body) return;
  var toNormalBtn=document.getElementById('ez-ramadan-tonormal-btn');
  if(window._ramadanMode){
    if(!toNormalBtn){
      var tn=document.createElement('button');
      tn.id='ez-ramadan-tonormal-btn';
      tn.onclick=window.ezRamadanToNormal;
      tn.style.cssText='width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.2);transition:all 0.3s;margin:4px 0';
      tn.textContent='↩️ إلغاء جرعات رمضان';
      body.appendChild(tn);
    } else {
      toNormalBtn.style.display='';
    }
  } else {
    if(toNormalBtn) toNormalBtn.style.display='none';
  }
};

/* ══════════════════════════════════════════
   END DATE FIXING
   ══════════════════════════════════════════ */
window.fixEndDates=function(targetDate,ediIdx){
  var tb=_ezFindTable();
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

/* ══════════════════════════════════════════
   GLOBAL: Sort table rows by time column
   ══════════════════════════════════════════ */
function _ezSortTableByTime(tb){
  if(!tb)return;
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ti=_ezIdx(hs,'time'),ei=_ezIdx(hs,'every');if(ei<0)ei=_ezIdx(hs,'evry');
  if(ti<0)return;
  var rs=Array.from(tb.querySelectorAll('tr'));var he=rs.shift();
  var rwt=[],rwot=[];
  rs.forEach(function(r){var tds=r.querySelectorAll('td');if(tds.length<=ti){rwot.push(r);return;}var tv=_ezGet(tds[ti]);if(!tv||tv.trim()===''){rwot.push(r);return;}rwt.push({row:r,time:tv});});
  rwt.sort(function(a,b){
    var ta=a.time.split(':').map(Number),tb2=b.time.split(':').map(Number);
    var tA=ta[0]*60+(ta[1]||0),tB=tb2[0]*60+(tb2[1]||0);
    if(tA===tB&&ei>=0){var evA=parseInt(_ezGet(a.row.querySelectorAll('td')[ei]))||0;var evB=parseInt(_ezGet(b.row.querySelectorAll('td')[ei]))||0;return evB-evA;}
    return tA-tB;
  });
  tb.innerHTML='';tb.appendChild(he);rwt.forEach(function(i){tb.appendChild(i.row);});rwot.forEach(function(r){tb.appendChild(r);});
}

/* ══════════════════════════════════════════
   GLOBAL: Color duplicated rows' ⚡ by item
   ══════════════════════════════════════════ */
var _ezDupColors=['#6366f1','#ef4444','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#f97316','#14b8a6','#e11d48'];
function _ezColorDupRows(tb){
  if(!tb)return;
  /* Remove old indicators first */
  var old=tb.querySelectorAll('.ez-dup-dot');for(var o=0;o<old.length;o++)old[o].remove();
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
  var ni=_ezIdx(hs,'note'),ci=_ezIdx(hs,'code');
  if(ni<0||ci<0)return;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  /* Group rows by code, only keep groups with ⚡ rows */
  var groups={},order=[];
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');if(tds.length<=Math.max(ni,ci))return;
    var noteVal=_ezGet(tds[ni]);
    if(noteVal.indexOf('⚡')<0)return;
    var code=_ezGet(tds[ci]).trim().replace(/\D/g,'');
    if(!code)return;
    if(!groups[code]){groups[code]=[];order.push(code);}
    groups[code].push(r);
  });
  /* Only color if >1 different items are split */
  if(order.length<2)return;
  for(var g=0;g<order.length;g++){
    var color=_ezDupColors[g%_ezDupColors.length];
    var grpRows=groups[order[g]];
    for(var r=0;r<grpRows.length;r++){
      var tds=grpRows[r].querySelectorAll('td');
      if(tds.length>ni){
        /* Add colored dot indicator before the input */
        var dot=document.createElement('span');
        dot.className='ez-dup-dot';
        dot.style.cssText='display:inline-block;width:8px;height:8px;border-radius:50%;background:'+color+';flex-shrink:0;margin-left:4px;box-shadow:0 0 4px '+color+'40';
        var td=tds[ni];
        td.style.display='flex';td.style.alignItems='center';
        var inp=td.querySelector('input,textarea');
        if(inp){td.insertBefore(dot,inp);}else{td.insertBefore(dot,td.firstChild);}
      }
    }
  }
}

function cleanNote(txt){
  if(!txt) return '';
  var c=txt.toString().replace(/[،,.\-_\\]/g,' ');
  /* Step 1: Strip system pattern "1 Tablets every 24 Hrs for 30 days1" */
  c=c.replace(/\d*\s*(Tablets?|Capsules?|undefined|Caps?|Tab)\s*every\s*\d+\s*Hrs?\s*(for\s*)?\d*\s*days?\d*/gi,'');
  /* Step 2: Strip English duration fragments */
  c=c.replace(/\bfor\s*\d+\s*days?\d*/gi,'');
  c=c.replace(/\bevery\s*\d+\s*Hrs?\b/gi,'');
  /* Step 3: Strip Arabic duration */
  c=c.replace(/لمد[ةه]?\s*\d+\s*([اأ]يام|يوم)\d*/g,'');
  c=c.replace(/\d+\s*([اأ]يام|يوم)\d*/g,'');
  /* Step 4: Strip Arabic hourly */
  c=c.replace(/كل\s*\d+\s*ساع[ةهات]*/g,'');
  c=c.replace(/^\s*[-–—]\s*/,'');
  /* Step 5: If starts with English/digits and has Arabic text after, strip to first Arabic char */
  if(/^\s*[\da-zA-Z]/.test(c)&&/[\u0600-\u06FF]/.test(c)){
    var idx=c.search(/[\u0600-\u06FF]/);
    if(idx>0) c=c.substring(idx);
  }
  /* Step 6: Separate glued "و" connector first (وقرص→و  / وحبه→و ) */
  c=c.replace(/و(قرص|حبه|حبة|كبسوله|كبسولة)\b/g,'و ');
  /* Step 7: Strip ALL standalone dose unit words — keep حبتين/قرصين (dose=2) */
  c=c.replace(/(^|\s)(قرص|حبه|حبة|حيه|حيه|كبسوله|كبسولة|اقراص|حبوب|كبسولات)(\s|$)/gi,'$1$3');
  return c.replace(/\s+/g,' ').trim();
}

/* ══════════════════════════════════════════
   PILL COUNT EXTRACTION
   ══════════════════════════════════════════ */

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
  var s=note.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه')
    .replace(/٠/g,'0').replace(/١/g,'1').replace(/٢/g,'2').replace(/٣/g,'3').replace(/٤/g,'4')
    .replace(/٥/g,'5').replace(/٦/g,'6').replace(/٧/g,'7').replace(/٨/g,'8').replace(/٩/g,'9')
    .trim();
  var result={hasDuration:false,days:null,isPRN:false,isUntilFinish:false,original:note};
  if(/عند الحاجه|عند اللزوم|prn|as\s*needed|when\s*needed|sos|عند الضرورة|if\s*needed|p\.r\.n/i.test(s)){result.isPRN=true;return result;}
  if(/حتى (نفاد|انتهاء|انهاء|الشفاء)|until\s*(finish|complete|symptom|gone|resolved)|till\s*finish/i.test(s)){result.isUntilFinish=true;return result;}
  var dayPatterns=[{r:/لمده?\s*(\d+)\s*(يوم(?!ي)|ايام)/i,g:1},{r:/مده?\s*(\d+)\s*(يوم(?!ي)|ايام)/i,g:1},{r:/(\d+)\s*(يوم(?!ي)|ايام)\s*فقط/i,g:1},{r:/(\d+)\s*(يوم(?!ي)|ايام)/i,g:1},{r:/(\d+)\s*days?(?!\s*supply)/i,g:1},{r:/for\s*(\d+)\s*days?/i,g:1},{r:/x\s*(\d+)\s*days?/i,g:1},{r:/duration[:\s]*(\d+)\s*days?/i,g:1}];
  for(var i=0;i<dayPatterns.length;i++){var m=s.match(dayPatterns[i].r);if(m){var _dd=parseInt(m[dayPatterns[i].g]);if(_dd<=1)continue;result.hasDuration=true;result.days=_dd;return result;}}
  var weekPatterns=[{r:/اسبوع واحد|واحد اسبوع|1\s*اسبوع|one\s*week|1\s*week/i,d:7},{r:/اسبوعين|2\s*اسبوع|two\s*weeks?|2\s*weeks?/i,d:14},{r:/ثلاث(ه)?\s*اسابيع|3\s*اسابيع|three\s*weeks?|3\s*weeks?/i,d:21},{r:/اربع(ه)?\s*اسابيع|4\s*اسابيع|four\s*weeks?|4\s*weeks?/i,d:28},{r:/شهر واحد|واحد شهر|1\s*شهر|one\s*month|1\s*month/i,d:30},{r:/شهرين|2\s*شهر|two\s*months?|2\s*months?/i,d:60},{r:/ثلاث(ه)?\s*اشهر|3\s*اشهر|three\s*months?|3\s*months?/i,d:90}];
  for(var i=0;i<weekPatterns.length;i++){if(weekPatterns[i].r.test(s)){result.hasDuration=true;result.days=weekPatterns[i].d;return result;}}
  return result;
}

function extractHourlyInterval(note){
  var s=note.toLowerCase()
    .replace(/٠/g,'0').replace(/١/g,'1').replace(/٢/g,'2').replace(/٣/g,'3').replace(/٤/g,'4')
    .replace(/٥/g,'5').replace(/٦/g,'6').replace(/٧/g,'7').replace(/٨/g,'8').replace(/٩/g,'9')
    .trim();
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
  var tb=_ezFindTable();if(!tb)return;
  var ths=tb.querySelectorAll('th');var ediIdx=-1;var ciIdx=-1;
  for(var i=0;i<ths.length;i++){var ht=ths[i].textContent.toLowerCase();if(ht.includes('end')&&ht.includes('date'))ediIdx=i;if(ht.includes('code'))ciIdx=i;}
  if(ediIdx<0)return;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);var dates={};var mostCommonDate='';var maxCount=0;
  rows.forEach(function(r){var tds=r.querySelectorAll('td');if(tds.length>ediIdx){if(ciIdx>=0&&tds.length>ciIdx){var cInp=tds[ciIdx].querySelector('input');var cTxt=cInp?cInp.value:tds[ciIdx].textContent.trim();var cNum=(cTxt.match(/\d+/)||[''])[0];if(cNum&&(fixedSizeCodes[cNum]||weeklyInjections.indexOf(cNum)>-1))return;}var inp=tds[ediIdx].querySelector('input');var date=inp?inp.value:tds[ediIdx].textContent.trim();if(date&&/\d{4}-\d{2}-\d{2}/.test(date)){dates[date]=(dates[date]||0)+1;if(dates[date]>maxCount){maxCount=dates[date];mostCommonDate=date;}}}});
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
  dialog.innerHTML='<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#818cf8,#a78bfa,#818cf8);background-size:200% 100%;animation:barShift 4s ease infinite"></div><div class="ez-post-header" style="padding:14px 18px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(129,140,248,0.1);cursor:move;background:linear-gradient(180deg,rgba(129,140,248,0.03) 0%,transparent 100%)"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(145deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,0.25)">⚙️</div><div style="font-size:15px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif">خيارات إضافية</div></div><div style="display:flex;gap:4px"><button class="ez-post-min-btn" onclick="window.ezMinimizePost()" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.05);color:#818cf8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;transition:all 0.25s">−</button><button onclick="window.ezClosePost()" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.05);color:#818cf8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.25s">×</button></div></div><div class="ez-post-body" style="padding:14px 18px 16px;font-family:Cairo,sans-serif">'+dupInfo+'<button id="ez-undo-btn" onclick="window.ezUndoDuplicates()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#fbbf24,#f59e0b);box-shadow:0 4px 14px rgba(245,158,11,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.1);transition:all 0.3s;margin:4px 0" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'">🔄 إلغاء التقسيم</button><button id="ez-next-month-btn" onclick="window.ezNextMonth()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#22d3ee,#06b6d4);box-shadow:0 4px 14px rgba(6,182,212,0.2),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.1);transition:all 0.3s;margin:4px 0" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'">🗓️ الشهر التالي</button><button id="ez-consolidate-btn" onclick="window.ezConsolidateForPrint()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.2);transition:all 0.3s;margin:4px 0">🖨️ تجميع للطباعة</button><button id="ez-dl-intercept-btn" onclick="window.ezToggleDownloadIntercept()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#94a3b8,#64748b);box-shadow:0 4px 14px rgba(100,116,139,0.2);transition:all 0.3s;margin:4px 0" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'">🔄 تعديل رقم الفاتورة عند التحميل</button>'+(window._ramadanMode?'<button id="ez-ramadan-tonormal-btn" onclick="window.ezRamadanToNormal()" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.2);transition:all 0.3s;margin:4px 0">↩️ إلغاء جرعات رمضان</button>':'')+'</div><div class="ez-post-foot" style="padding:6px 18px;text-align:center;font-size:9px;color:#c7d2fe;font-weight:700;letter-spacing:1.5px;border-top:1px solid rgba(129,140,248,0.08);background:rgba(241,245,249,0.4)">EZ_PILL FARMADOSIS · V'+APP_VERSION+'</div>';
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
   DOSE RECOGNIZER - ENHANCED v2
   ══════════════════════════════════════════ */
function smartDoseRecognizer(note){
  var raw=note;
  /* Normalize: Arabic chars + Arabic numerals ٠١٢٣٤٥٦٧٨٩ → 0123456789 */
  var s=(note||'').toLowerCase()
    .replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ى/g,'ي')
    .replace(/٠/g,'0').replace(/١/g,'1').replace(/٢/g,'2').replace(/٣/g,'3').replace(/٤/g,'4')
    .replace(/٥/g,'5').replace(/٦/g,'6').replace(/٧/g,'7').replace(/٨/g,'8').replace(/٩/g,'9')
    .replace(/\s+/g,' ').trim();
  /* FIX v141: Strip duration phrases BEFORE frequency detection
     "3 شهور" / "3 اشهر" / "30 يوم" = duration, NOT frequency
     Without this, "بعد الاكل 3 شهور" gets detected as 3 times */
  s=s.replace(/\d+\s*(شهر|شهور|اشهر|شهرين|month|months)/gi,'')
    .replace(/\d+\s*(يوم|ايام|اسبوع|اسابيع|day|days|week|weeks)/gi,'')
    .replace(/لمد[ةه]?\s*\d+/gi,'')
    .replace(/و(قرص|حبه|حبة|كبسوله|كبسولة)/gi,' و ')
    .replace(/(^|\s)(قرص|حبه|حبة|كبسوله|كبسولة|اقراص|حبوب)(\s|$)/gi,'$1$3')
    .replace(/\s+/g,' ').trim();
  var res={count:1,hasB:false,hasL:false,hasD:false,isBefore:false,hasM:false,hasN:false,hasA:false,hasE:false,hasBed:false,hasEmpty:false,language:'arabic',confidence:'high',rawFrequency:null};
  res.language=detectLanguage(raw);

  /* ── Step 1: Detect meal/time keywords ── */
  /* In non-Ramadan mode: سحور = عشاء (dinner), فطار/افطار = فطار (breakfast) */
  res.hasB=/\b(bre|breakfast|fatur|ftor|iftar)\b|فطر|فطار|فطور|افطار|الافطار|الفطور|الفطار|مع\s*(ال)?(فطار|فطور|افطار)/i.test(s);
  res.hasL=/\b(lun|lunch|lau)\b|غدا|غداء|الغدا|الغداء|غذا|غذاء|الغذا|الغذاء|عداء|العداء|مع\s*(ال)?(غدا|غداء|غذا|غذاء|عداء)/i.test(s);
  res.hasD=/\b(din|dinner|sup|supper|asha|isha|suhoor|sahoor|sahor)\b|عشا|عشو|تعشى|عشاء|العشاء|العشا|العشى|سحور|السحور|سحر|مع\s*(ال)?(عشا|عشاء|سحور|سحر)/i.test(s);
  res.hasM=/\b(morning|am|morn|a\.m|mane)\b|صباح|الصباح|صبح/i.test(s);
  res.hasN=/\b(noon|midday)\b|ظهر|الظهر|ظهرا|ظهراً/i.test(s);
  res.hasA=/\b(asr|afternoon|pm|p\.m)\b|عصر|العصر/i.test(s);
  res.hasE=/\b(evening|eve|night)\b|مساء|مسا|مساءا|مساءً|مسائا|مسأ|المساء|المسا|ليل|الليل|ليلا|ليلاً/i.test(s);
  res.hasBed=/\b(bed|bedtime|sleep|sle|hs|h\.s|nocte)\b|نوم|النوم|قبل النوم|عند النوم|وقت النوم/i.test(s);
  res.hasEmpty=/\b(empty|fasting)\b|ريق|الريق|الريج|الريئ|على الريق|معده فارغه|empty\s*stomach/i.test(s);
  res.isBefore=/\b(before|bef|pre|ac|a\.c)\b|قبل/i.test(s);

  /* ── Step 2: Explicit frequency abbreviations (highest priority) ── */
  if(/\bqid\b|\bqds\b|q\.i\.d|اربع مرات|4\s*مرات|four\s*times?\s*(a\s*day|daily|يوميا)?|4\s*times?\s*(a\s*day|daily)?/i.test(s)){res.count=4;res.rawFrequency='QID';return res;}
  if(/\btid\b|\btds\b|t\.i\.d|ثلاث مرات|تلات مرات|3\s*مرات|three\s*times?\s*(a\s*day|daily|يوميا)?|3\s*times?\s*(a\s*day|daily)?|thrice\s*(daily)?/i.test(s)){res.count=3;res.rawFrequency='TID';return res;}
  if(/\bbid\b|\bbd\b|b\.i\.d|مرتين|مرتان|twice\s*(a\s*day|daily)?|2\s*times?\s*(a\s*day|daily|يوميا)?/i.test(s)){res.count=2;res.rawFrequency='BID';return res;}
  if(/\bod\b|o\.d|\bqd\b|q\.d|once\s*(a\s*day|daily)?|مره واحده يوميا|مره واحده|حبه يوميا|حبه واحده يوميا/i.test(s)){res.count=1;res.rawFrequency='OD';return res;}

  /* ── Step 3: Hourly intervals ── */
  if(/كل\s*4\s*ساع|every\s*4\s*h|q4h|q\s*4\s*h/i.test(s)){res.count=6;res.rawFrequency='Q4H';return res;}
  if(/كل\s*6\s*(?:ساع)?|every\s*6\s*h|q6h|q\s*6\s*h/i.test(s)){res.count=4;res.rawFrequency='Q6H';return res;}
  if(/كل\s*8\s*(?:ساع)?|every\s*8\s*h|q8h|q\s*8\s*h/i.test(s)){res.count=3;res.rawFrequency='Q8H';return res;}
  if(/كل\s*12\s*(?:ساع)?|every\s*12\s*h|q12h|q\s*12\s*h/i.test(s)){res.count=2;res.rawFrequency='Q12H';return res;}
  if(/كل\s*24\s*(?:ساع)?|every\s*24\s*h|q24h|q\s*24\s*h/i.test(s)){res.count=1;res.rawFrequency='Q24H';return res;}

  /* ── Step 4: Explicit meal-based counting ── */
  if(/قبل\s*(الوجبات|كل\s*(وجبه|وجبه))|قبل\s*(الاكل|الاكل)\s*(الثلاث|ال3|3)|before\s*(all\s*)?meals|ac\s*meals/i.test(s)){res.count=3;res.isBefore=true;return res;}
  if(/بعد\s*(الوجبات|كل\s*(وجبه|وجبه))|بعد\s*(الاكل|الاكل)\s*(الثلاث|ال3|3)|after\s*(all\s*)?meals|pc\s*meals/i.test(s)){res.count=3;return res;}
  if(/مع\s*(الوجبات|كل\s*(وجبه|وجبه))|مع\s*(الاكل|الاكل)\s*(الثلاث|ال3|3)|with\s*(all\s*)?meals/i.test(s)){res.count=3;return res;}

  if(/قبل\s*(الاكل|الاكل|الوجبات?)\s*مرتين|مرتين\s*قبل\s*(الاكل|الاكل)|before\s*meals?\s*twice/i.test(s)){res.count=2;res.isBefore=true;return res;}
  if(/بعد\s*(الاكل|الاكل|الوجبات?)\s*مرتين|مرتين\s*بعد\s*(الاكل|الاكل)|after\s*meals?\s*twice/i.test(s)){res.count=2;return res;}

  if(/(^|\s)(قبل\s*(الاكل|الاكل|الوجبه?)|before\s*(meal|food)\b|ac\b)(\s|$)/i.test(s)&&!/مرتين|مرات|twice|times|الثلاث/i.test(s)){res.count=1;res.isBefore=true;return res;}
  if(/(^|\s)(بعد\s*(الاكل|الاكل|الوجبه?)|after\s*(meal|food)\b|pc\b)(\s|$)/i.test(s)&&!/مرتين|مرات|twice|times|الثلاث/i.test(s)){res.count=1;return res;}
  if(/(^|\s)(مع\s*(الاكل|الاكل|الوجبه?)|with\s*(meal|food)\b)(\s|$)/i.test(s)&&!/مرتين|مرات|twice|times|الثلاث/i.test(s)){res.count=1;return res;}

  /* ── Step 5: Count from detected meal/time keywords ── */
  var mealCount=0;
  if(res.hasB||res.hasM) mealCount++;
  if(res.hasL||res.hasN) mealCount++;
  if(res.hasD||res.hasE) mealCount++;
  if(res.hasA&&mealCount<3) mealCount++;

  if(mealCount>=3){res.count=3;return res;}
  var pairDual=/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i;
  if(mealCount===2||pairDual.test(s)){res.count=2;return res;}
  if(res.hasEmpty&&res.hasBed){res.count=2;return res;}
  if(res.hasBed&&mealCount===0){res.count=1;return res;}
  if(res.hasEmpty&&mealCount===0){res.count=1;return res;}
  if(/\b(يوميا|daily)\b/i.test(s)&&!res.rawFrequency){res.count=1;return res;}
  return res;
}

function getTwoPillsPerDoseInfo(n){
  var s=(n||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
  /* No half/quarter pills - always whole pills */
  var twoP=['2 حبه','2 حبة','حبتين','حبتان','2 حبوب','2 قرص','قرصين','قرصان','2 كبسوله','كبسولتين','كبسولتان','2 pill','2 pills','two pill','two pills','2 tablet','2 tablets','two tablet','two tablets','2 tab','2 tabs','two tab','two tabs','2 cap','2 caps','two cap','two caps'];
  for(var i=0;i<twoP.length;i++){if(s.indexOf(twoP[i].toLowerCase())>-1){var is2=/مرتين|twice|2\s*times|bid|b\.i\.d/i.test(n);var is3=/ثلاث مرات|3\s*مرات|three\s*times|3\s*times|tid|t\.i\.d/i.test(n);var ml=1;if(is3)ml=6;else if(is2)ml=4;else ml=2;return{dose:2,multiplier:ml};}}
  var threeP=['3 حبه','3 حبات','3 حبوب','3 قرص','3 اقراص','3 كبسول','3 tab','3 tabs','3 pill','3 pills','three tab','three pill'];
  for(var i=0;i<threeP.length;i++){if(s.indexOf(threeP[i].toLowerCase())>-1)return{dose:3,multiplier:3};}
  return{dose:1,multiplier:1};
}

function getTimeFromWords(w){
  var s=(w||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')
    .replace(/٠/g,'0').replace(/١/g,'1').replace(/٢/g,'2').replace(/٣/g,'3').replace(/٤/g,'4')
    .replace(/٥/g,'5').replace(/٦/g,'6').replace(/٧/g,'7').replace(/٨/g,'8').replace(/٩/g,'9')
    .trim();
  var st=s.match(/(?:at|الساعه|الساعه)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|صباحا|مساء)?/i);
  if(st){var hr=parseInt(st[1]);var min=st[2]?parseInt(st[2]):0;var ap=st[3]||'';if(/pm|مساء/i.test(ap)&&hr<12)hr+=12;if(/am|صباحا/i.test(ap)&&hr===12)hr=0;return{time:('0'+hr).slice(-2)+':'+('0'+min).slice(-2)};}
  var NT=NORMAL_TIMES;
  
  /* CRITICAL FIX: "قبل الأكل مرتين" should be beforeMeal (8:00) not morning (9:30) */
  var beforeMealTwice=/قبل\s*(الاكل|الأكل)\s*مرتين|مرتين\s*قبل\s*(الاكل|الأكل)|before\s*(meal|food)\s*twice|twice\s*before\s*(meal|food)/;
  if(beforeMealTwice.test(s))return{time:NT.beforeMeal};
  /* بعد/مع الاكل المبهمة → بعد الفطار */
  if(/(?:[بي]عد|مع)\s*(الاكل|الأكل|الآكل|الوجبه?|الطعام)\b|after\s*(meal|food)\b|\bpc\b|\bp\.c\b/i.test(s))return{time:NT.afterBreakfast||'09:00'};
  /* قبل الاكل المبهمة → قبل الفطار */
  if(/قبل\s*(الاكل|الأكل|الآكل|الوجبه?|الطعام)\b|before\s*(meal|food)\b|\bac\b/i.test(s))return{time:NT.beforeMeal||'08:00'};
  var beforeMealTwice=/قبل\s*(الاكل|الأكل)\s*مرتين|مرتين\s*قبل\s*(الاكل|الأكل)|before\s*(meal|food)\s*twice|twice\s*before\s*(meal|food)/;
  if(beforeMealTwice.test(s))return{time:NT.beforeMeal};
  
  var rules=[{test:/مع\s*(ال)?(فطار|فطور|افطار)/,time:'09:00'},{test:/مع\s*(ال)?(غدا|غداء|غذا|غذاء|عداء)/,time:'14:00'},{test:/مع\s*(ال)?(عشا|عشاء|سحور|سحر)/,time:'21:00'},{test:/مع\s*(ال)?(اكل|أكل|وجب|طعام)/,time:'09:00'},{test:/empty|stomach|ريق|الريق|الريج|الريئ|على الريق|fasting/,time:'07:00'},{test:/قبل\s*(الاكل|الأكل|meal)|before\s*(meal|food)/,time:'08:00'},{test:/before.*bre|before.*fatur|before.*breakfast|before.*iftar|قبل.*فطر|قبل.*فطار|قبل.*فطور|قبل.*افطار/,time:'08:00'},{test:/after.*bre|after.*fatur|after.*breakfast|after.*iftar|[بي]عد.*فطر|[بي]عد.*فطار|[بي]عد.*فطور|[بي]عد.*افطار/,time:'09:00'},{test:/\b(morning|am|a\.m|mane)\b|صباح|الصباح|صبح/,time:'09:30'},{test:/\b(noon|midday)\b|ظهر|الظهر|ظهرا|ظهراً/,time:'12:00'},{test:/before.*lun|before.*lunch|قبل.*غدا|قبل.*غداء|قبل.*غذا|قبل.*غذاء|قبل.*عداء|قبل.*العداء/,time:'13:00'},{test:/after.*lun|after.*lunch|[بي]عد.*غدا|[بي]عد.*غداء|[بي]عد.*غذا|[بي]عد.*غذاء|[بي]عد.*عداء|[بي]عد.*العداء/,time:'14:00'},{test:/\b(asr|afternoon|pm|p\.m)\b|عصر|العصر|عصرا|عصراً/,time:'15:00'},{test:/maghrib|مغرب|المغرب/,time:'18:00'},{test:/before.*din|before.*sup|before.*dinner|before.*asha|before.*suhoor|before.*sahoor|قبل.*عشا|قبل.*عشو|قبل.*عشاء|قبل.*سحور|قبل.*سحر/,time:'20:00'},{test:/after.*din|after.*sup|after.*dinner|after.*asha|after.*suhoor|after.*sahoor|[بي]عد.*عشا|[بي]عد.*عشو|[بي]عد.*عشاء|بعد.*سحور|بعد.*سحر/,time:'21:00'},{test:/bed|sleep|sle|نوم|النوم|نووم|hs|h\.s|nocte/,time:'22:00'},{test:/مساء|مسا|مساءا|مساءً|مسائا|مسأ|evening|eve|night|nocte|ليل|الليل|ليلا|ليلاً/,time:'21:30'}];
  /* Custom time rules from settings (checked FIRST for priority) */
  if(customConfig.customTimeRules){for(var i=0;i<customConfig.customTimeRules.length;i++){var cr=customConfig.customTimeRules[i];try{var nPat=cr.pattern.replace(/[أإآ]/g,'ا').replace(/ة/g,'[ةه]').replace(/ى/g,'[يى]');var nPat2=nPat.replace(/^ال/,'(ال)?');if(new RegExp(nPat,'i').test(s)||new RegExp(nPat2,'i').test(s))return{time:cr.time};}catch(e){}}}
  for(var i=0;i<rules.length;i++){if(rules[i].test.test(s))return{time:rules[i].time};}
  /* يوميا/يومياً/daily = مرة واحدة يومياً — وقت افتراضي */
  if(/يوميا|يومياً|يوميه|daily/i.test(s))return{time:NT.morning||NT.defaultTime};
  /* اسبوعيا/أسبوعياً/weekly = مرة أسبوعياً — وقت افتراضي */
  if(/اسبوعيا|أسبوعياً|اسبوعيه|weekly/i.test(s))return{time:NT.morning||NT.defaultTime};
  /* كلمات تكرار بدون وقت محدد — وقت افتراضي (مش يروح لجيميناي) */
  if(/مرتين|مره|مرات|ثلاث|اربع|twice|once|thrice|bid|tid|qid|bd|tds|qds|od/i.test(s))return{time:NT.defaultTime};
  /* If note is empty or very short, return default time */
  if(!s||s.length<3)return{time:NT.defaultTime,isEmpty:true};
  /* Unrecognized pattern - return default but flag it */
  return{time:NT.defaultTime,isUnrecognized:true};
}

/* Code-aware time: override default time with code-specific start time ONLY if note is empty (no dose) */
function getCodeAwareTime(timeResult,itemCode){
  if(timeResult.isEmpty&&itemCode&&CODE_START_TIMES[itemCode]){
    var cst=CODE_START_TIMES[itemCode];
    return{time:cst.time,every:cst.every||24,isCodeTime:true};
  }
  return timeResult;
}

/* ── Helper: استخرج الأوقات الفعلية من الـ note بناءً على الكلمات ── */
function getMealTimesFromNote(note){
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
  var isBefore=/قبل/i.test(s);
  var hasB=/فطر|فطار|فطور|افطار|الفطار|breakfast|fatur|ftor/i.test(s);
  var hasL=/غدا|غداء|الغدا|الغداء|الغدى|غذا|غذاء|الغذا|الغذاء|عداء|العداء|lunch/i.test(s);
  var hasD=/عشا|عشو|عشاء|العشاء|العشا|سحور|dinner|asha/i.test(s);
  var hasNoon=/ظهر|الظهر|ظهرا|ظهراً|noon|midday/i.test(s);
  var hasBed=/نوم|النوم|bed|sleep|hs\b/i.test(s);
  var hasMorning=/صباح|الصباح|morning/i.test(s);
  var hasEvening=/مساء|مسا|مساءا|مساءً|المساء|evening|night|ليل|ليلا|ليلاً/i.test(s);
  var hasAfternoon=/عصر|العصر|afternoon|asr/i.test(s);
  var times=[];
  if(hasB) times.push(isBefore?8:9);
  if(hasMorning&&!hasB) times.push(9);
  if(hasNoon&&!hasL) times.push(12);
  if(hasL) times.push(isBefore?13:14);
  if(hasAfternoon&&!hasL) times.push(15);
  if(hasD) times.push(isBefore?20:21);
  if(hasEvening&&!hasD) times.push(21);
  if(hasBed) times.push(22);
  var unique={};var result=[];
  for(var i=0;i<times.length;i++){if(!unique[times[i]]){unique[times[i]]=true;result.push(times[i]);}}
  result.sort(function(a,b){return a-b;});
  return result;
}

/* ── المبدأ الجديد: هل الأوقات غير منتظمة؟ ──
   - مرتين: منتظم فقط لو الـ gap = 12h بالظبط (فطار+عشا=9,21 أو قبل فطار+عشا=8,20)
   - 3 مرات: منتظم فقط لو كل الفروق متساوية
   لو غير منتظم → لازم تكرار ──*/
function needsDuplicateByTime(times){
  if(times.length<2) return false;
  var gaps=[];
  for(var i=1;i<times.length;i++) gaps.push(times[i]-times[i-1]);
  if(times.length===2) return Math.abs(gaps[0]-12)>0.5;
  var minG=Math.min.apply(null,gaps);var maxG=Math.max.apply(null,gaps);
  return (maxG-minG)>0.5;
}

function shouldDuplicateRow(note){
  var d=smartDoseRecognizer(note);
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
  var isEvery8=/كل\s*8|every\s*8|q8h/i.test(s);
  if(isEvery8||d.count===3)return{type:'three',doseInfo:d,isBefore:d.isBefore};
  var isEvery6=/كل\s*6|every\s*6|q6h|q\s*6\s*h/i.test(s);
  if(isEvery6)return{type:'q6h',doseInfo:d,isBefore:d.isBefore};

  /* ── المبدأ الجديد: احسب الأوقات الفعلية وشوف لو منتظمة ── */
  var mealTimes=getMealTimesFromNote(note);
  if(mealTimes.length>=2&&needsDuplicateByTime(mealTimes)){
    var dupType=mealTimes.length>=3?'three':'two';
    return{type:dupType,doseInfo:d,isBefore:d.isBefore};
  }

  /* ── الحالات القديمة للكلمات غير الوجبات (صباح/ظهر/عصر/مساء) ── */
  var isMN=(d.hasM||d.hasB)&&(d.hasN||d.hasL);var isNE=(d.hasN||d.hasL)&&(d.hasE||d.hasD);var isMA=(d.hasM||d.hasB)&&d.hasA;var isAE=d.hasA&&(d.hasE||d.hasD);
  if(isMN||isNE||isMA||isAE)return{type:'two',doseInfo:d,isBefore:d.isBefore};
  /* Bed + any meal = two (non-regular timing) */
  if(d.hasBed&&(d.hasB||d.hasL||d.hasD||d.hasM||d.hasN||d.hasA||d.hasE))return{type:'two',doseInfo:d,isBefore:d.isBefore};
  if(d.hasEmpty&&d.hasBed)return{type:'two',doseInfo:d,isBefore:d.isBefore};
  /* count===2 فقط لو مفيش أوقات وجبات واضحة */
  var isRegularTwice=/12|twice|bid|b\s*i\s*d|مرتين/.test(s)||/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(s)||/قبل\s*(الاكل|الأكل)\s*مرتين/.test(s);
  if(d.count===2&&!isRegularTwice&&mealTimes.length===0)return{type:'two',doseInfo:d,isBefore:d.isBefore};
  return null;
}

function scanForDuplicateNotes(){
  var tb=_ezFindTable();
  if(!tb)return false;
  var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');var ni=_ezIdx(hs,'note');
  if(ni<0)return false;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  for(var i=0;i<rows.length;i++){var tds=rows[i].querySelectorAll('td');if(tds.length>ni){var inp=tds[ni].querySelector('input,textarea');var noteText=inp?inp.value:tds[ni].textContent;var cleaned=cleanNote(noteText);var nl=cleaned.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();if(nl&&shouldDuplicateRow(nl))return true;}}
  /* Also check prescription-level notes for بوكسات/boxes/ترتيب patterns */
  if(scanForBoxesRequest()) return true;
  return false;
}

/* Scan prescription notes for "ترتيب على X بوكسات" requests */
function scanForBoxesRequest(){
  /* فقط في ملاحظات الروشتة #epresNotes — مش نوتات الأدوية */
  var pn=document.getElementById('epresNotes');
  if(!pn) return false;
  var v=(pn.value||'').trim();
  if(v.length<10) return false;
  /* لازم كلمة تقسيم/ترتيب/توزيع + بوكس/صندوق */
  if(/بوكس|بكس|صندوق|صناديق|box/i.test(v)&&/ترتيب|تقسيم|توزيع|تجهيز|منفصل|كل شهر/i.test(v)) return true;
  /* أو: رقم شهور + رقم بوكسات في نفس الجملة */
  if(/\d+\s*(اشهر|شهور|شهر).*\d+\s*(بوكس|بكس|box|صندوق)/i.test(v)) return true;
  if(/\d+\s*(بوكس|بكس|box|صندوق).*\d+\s*(اشهر|شهور|شهر)/i.test(v)) return true;
  /* كل شهر في بوكس / كل شهر منفصل */
  if(/كل\s*شهر\s*(في|فى|ب)?\s*(بوكس|صندوق|منفصل)/i.test(v)) return true;
  return false;
}

/* ══════════════════════════════════════════
   ★ MAIN PROCESSING ENGINE ★
   ══════════════════════════════════════════ */
/* Smart duration check: does extracted match the selection? */
function _ezDurMatchesSelection(extracted,m,t){
  var total=m*t;
  if(Math.abs(extracted-total)<=5) return true;
  if(m>1){
    if(Math.abs(extracted-m*28)<=3) return true;
    if(Math.abs(extracted-m*30)<=3) return true;
  }
  if(Math.abs(extracted-t)<=3) return true;
  return false;
}

function processTable(m,t,autoDuration,enableWarnings,showPostDialog,ramadanMode){
  window._ezLastTVal=t; window._ezLastMVal=m; /* حفظ t و m للاستخدام في تقسيم رمضان */
  if(ramadanMode){ var _snapTb=_ezFindTable(); if(_snapTb) window._ramadanPreProcessSnapshot=_snapTb.innerHTML; }
  warningQueue=[];duplicatedRows=[];duplicatedCount=0;var detectedLanguagesPerRow=[];window._ezDose2Applied=null;window._ramadanMode=ramadanMode||false;window._ramadanSplitDone=false;window._ramadanSplitSnapshot=null;window._ramadanSplitData=null;
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

    /* Size = rmDaysLeft for ramadan rows (how many ramadan days remain) */
    var ns=(window._rmDaysLeft&&window._rmDaysLeft>0)?window._rmDaysLeft:t_val;
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
      /* ترتيب عادي بالوقت - الأصغر أولاً */
      /* في رمضان: السحور (1-5 صباحاً) يجي بعد الفطار (6 مساءً - 12 منتصف الليل) */
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
  tb_main.classList.add('ez-data-table');
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
  if(ti_main>=0&&ni_main>=0&&ti_main<ni_main){moveColumnAfter(tb_main,ni_main,ti_main);hs_main=h_main.querySelectorAll('th,td');ni_main=idx(hs_main,'note');di_main=idx(hs_main,'dose');ei_main=idx(hs_main,'every');if(ei_main<0)ei_main=idx(hs_main,'evry');sdi_main=idx(hs_main,'start date');edi_main=idx(hs_main,'end date');}
  if(sdi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[sdi_main].style.width='110px';hs_main[sdi_main].style.minWidth='110px';}
  if(edi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[edi_main].style.width='110px';hs_main[edi_main].style.minWidth='110px';}
  if(ni_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ni_main].style.width='180px';hs_main[ni_main].style.minWidth='180px';}
  if(ti_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ti_main].style.width='100px';hs_main[ti_main].style.minWidth='100px';}
  if(ei_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ei_main].style.width='90px';hs_main[ei_main].style.minWidth='90px';}
  if(nm_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[nm_main].style.minWidth='280px';}
  var exp_main=idx(hs_main,'expiry');if(exp_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[exp_main].style.minWidth='85px';}
  if(ci_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ci_main].style.width='90px';hs_main[ci_main].style.minWidth='90px';}

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
    if(sdi_main>=0){var sdInp=tds_nodes[sdi_main].querySelector('input');if(sdInp)sdInp.style.width='110px';}
    if(edi_main>=0){var edInp=tds_nodes[edi_main].querySelector('input');if(edInp)edInp.style.width='110px';}
    if(ti_main>=0){var tiInp=tds_nodes[ti_main].querySelector('input');if(tiInp)tiInp.style.width='100px';}
    if(ei_main>=0){var eiInp=tds_nodes[ei_main].querySelector('input,select');if(eiInp)eiInp.style.width='90px';}
    if(ni_main>=0){var nInp=tds_nodes[ni_main].querySelector('input,textarea');if(nInp){nInp.style.width='100%';nInp.style.minWidth='180px';}}
    var nc=tds_nodes[ni_main];var ni3=nc.querySelector('input,textarea');var nt_str=ni3?ni3.value:nc.textContent;var cn_str=cleanNote(nt_str);
    if(ni3){ni3.value=cn_str;fire(ni3);}else nc.textContent=cn_str;
    var itemCode=getCleanCode(tds_nodes[ci_main]);var itemName=nm_main>=0?get(tds_nodes[nm_main]):'';
    if(processedCodes[itemCode])processedCodes[itemCode].note=cn_str;
    var fn_str=cn_str;var original_note=nt_str;var rowLang=detectLanguage(fn_str);detectedLanguagesPerRow.push(rowLang);
    var nl_str=normL(fn_str);var dui_obj=shouldDuplicateRow(nl_str);var hasFixedSize=!!(itemCode&&fixedSizeCodes[itemCode]);
    var h_s=!!(itemCode&&weeklyInjections.indexOf(itemCode)>-1);
    /* FIX: detect weekly from note text too */
    if(!h_s&&/اسبوعيا|أسبوعياً|اسبوعيه|كل اسبوع|كل أسبوع|مره اسبوعيا|مره بالاسبوع|مرة بالأسبوع|مره كل اسبوع|weekly|once.*week|per.*week|every.*week|once.*weekly|q1w|qw/i.test(fn_str)){h_s=true;console.log('📅 Weekly detected from note: "'+fn_str+'"');}

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
          /* CRITICAL FIX: Check explicit Ramadan meal keywords BEFORE hour-based mapping.
             فطار = iftar (19:00) NOT breakfast→suhoor. سحور = suhoor (04:00) NOT dinner→iftar. */
          var _exFutur2=/فطار|فطور|افطار|iftar|breakfast/i.test(fn_str);
          var _exSuhoor2=/سحور|سحر|suhoor|sahoor/i.test(fn_str);
          var _exDinner2=/عشا|عشاء|dinner|asha/i.test(fn_str);
          if(_exSuhoor2){
            noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
          } else if(_exFutur2){
            noteMapR={meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
          } else if(_exDinner2){
            noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
          } else if(twResult && twResult.time!==NORMAL_TIMES.defaultTime){
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
          /* CRITICAL FIX: Check explicit Ramadan keywords before generic hasB/hasD mapping */
          var _hasExplicitFutur=/فطار|فطور|افطار|iftar|breakfast/i.test(fn_str);
          var _hasExplicitSuhoor=/سحور|سحر|suhoor|sahoor/i.test(fn_str);
          var _hasExplicitDinner=/عشا|عشاء|dinner|asha/i.test(fn_str);
          if(_hasExplicitSuhoor) noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
          else if(_hasExplicitFutur) noteMapR={meal:'afterIftar',label_ar:'بعد الفطار',label_en:'After Iftar',time:RAMADAN_TIMES.afterIftar};
          else if(_hasExplicitDinner) noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
          else if(doseRec.hasB||doseRec.hasM||doseRec.hasEmpty) noteMapR={meal:'afterSuhoor',label_ar:'بعد السحور',label_en:'After Suhoor',time:RAMADAN_TIMES.afterSuhoor};
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
          warningQueue.push({level:'warning',message:'🌙 جرعة غير واضحة في رمضان: "'+_ezEsc(itemName)+'"',detail:'الجرعة المكتوبة: '+fn_str+'\n\nلم يتم التعرف على وقت رمضان. سيتم تعيينها بعد الفطار '+RAMADAN_TIMES.afterIftar+' افتراضياً.',editable:true,editLabel:'Every (ساعات)',currentEvery:parseInt(evryVal2)||24,currentTime:timeVal2||'19:00',currentNote:fn_str,rowIndex:allRowsData.length,type:'ramadan_unclear',onEdit:(function(idx2,tdsRef,eiIdx,tiIdx){return function(newEvery,newTime){allRowsData[idx2].ramadanOverrideEvery=newEvery;allRowsData[idx2].ramadanOverrideTime=newTime;if(eiIdx>=0&&tdsRef[eiIdx]){var eInp=tdsRef[eiIdx].querySelector('input,select');if(eInp){eInp.value=newEvery;_ezFire(eInp);}}if(tiIdx>=0&&tdsRef[tiIdx]){var tInp=tdsRef[tiIdx].querySelector('input');if(tInp){tInp.value=newTime;_ezFire(tInp);}}};})(allRowsData.length,tds_nodes,ei_main,ti_main)});
        }
      }
    }
    var durationInfo=null;var hourlyInfo=null;var calculatedDays=t;var calculatedSize=t;
    if(autoDuration){durationInfo=extractDuration(fn_str);if(!durationInfo.hasDuration&&!durationInfo.isPRN&&!durationInfo.isUntilFinish){durationInfo=extractDuration(original_note);}if(durationInfo.hasDuration){if(!enableWarnings||_ezDurMatchesSelection(durationInfo.days,m,t)){calculatedDays=t;calculatedSize=t;}else{calculatedDays=durationInfo.days;calculatedSize=durationInfo.days;}}else if(durationInfo.isPRN){calculatedDays=t;calculatedSize=Math.ceil(t/2);}else if(durationInfo.isUntilFinish){calculatedDays=t;calculatedSize=t;}}
    hourlyInfo=extractHourlyInterval(fn_str);var timesPerDay=1;if(hourlyInfo.hasInterval)timesPerDay=hourlyInfo.timesPerDay;
    allRowsData.push({row:r_node,tds:tds_nodes,itemCode:itemCode,itemName:itemName,note:fn_str,dui:dui_obj,hasFixedSize:hasFixedSize,isWeekly:h_s,durationInfo:durationInfo,hourlyInfo:hourlyInfo,calculatedDays:calculatedDays,calculatedSize:calculatedSize,timesPerDay:timesPerDay,extractedPillCount:null,warningOverride:false,daysOverrideQty:null,ramadanInfo:ramadanInfo,ramadanOverrideEvery:null});
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

  /* 🤖 Mark unrecognized notes for Gemini — runs ALWAYS (not just when warnings enabled) */
  if(_ezGetGeminiKey()){
    for(var _gScan=0;_gScan<allRowsData.length;_gScan++){
      var _gRd=allRowsData[_gScan];
      if(_gRd.note&&_gRd.note.trim().length>=3&&!_gRd.hasFixedSize&&!_gRd.isWeekly){
        var _gTime=getTimeFromWords(_gRd.note);
        if(_gTime.isUnrecognized) _gRd._needsGemini=true;
      }
    }
  }

  if(enableWarnings){
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];
      
      /* Check for unrecognized time patterns - skip fixed/weekly (handled separately) */
      if(rd.note&&rd.note.trim().length>=3&&!rd.hasFixedSize&&!rd.isWeekly){
        var timeResult=getTimeFromWords(rd.note);
        if(timeResult.isUnrecognized){
          var curEvery=rd.hourlyInfo&&rd.hourlyInfo.hasInterval?rd.hourlyInfo.hours:24;
          var curSize=rd.calculatedSize||0;
          warningQueue.push({
            level:'warning',
            message:'\u26a0\ufe0f \u0627\u0644\u0635\u0646\u0641: '+_ezEsc(rd.itemName),
            currentNote:rd.note,
            currentEvery:curEvery,
            currentTime:timeResult.time,
            currentSize:curSize,
            editable:true,
            rowIndex:i,
            type:'unrecognized_dose',
            onEdit:(function(idx2){return function(newEvery,newTime,newSize){
              allRowsData[idx2].unrecognizedEvery=newEvery;
              allRowsData[idx2].unrecognizedTime=newTime;
              if(newSize&&newSize>0)allRowsData[idx2].unrecognizedSize=newSize;
              allRowsData[idx2].warningOverride=true;
            };})(i)
          });
        }
      }
      
      if(rd.durationInfo&&rd.durationInfo.hasDuration&&!rd.hasFixedSize&&!rd.isWeekly){
        var extracted=rd.durationInfo.days;
        if(!_ezDurMatchesSelection(extracted,m,t)){
          warningQueue.push({
            level:'warning',
            message:'📅 الصنف: '+rd.itemName+' - مكتوب "'+extracted+' يوم" لكن الإجمالي '+(m*t)+' يوم ('+m+'×'+t+')',
            editable:true,
            editLabel:'عدد الأيام',
            currentValue:extracted,
            minValue:1,
            maxValue:365,
            _selectedT:t,
            _extractedDays:extracted,
            rowIndex:i,
            type:'days',
            onEdit:(function(idx2){return function(newQty,newSize){allRowsData[idx2].daysOverrideQty=newQty;allRowsData[idx2].calculatedDays=newSize;allRowsData[idx2].calculatedSize=newSize;allRowsData[idx2].warningOverride=true;};})(i)
          });
        }
      }
      
      /* FIX v141: تحذير الجرعات المتناقضة */
      if(rd.note&&rd.note.trim().length>=3&&!rd.hasFixedSize&&!rd.isWeekly){
        var _doseRec2=smartDoseRecognizer(rd.note);
        var _hourly2=rd.hourlyInfo;
        /* تناقض: كل 12 ساعة (مرتين) + بعد الأكل المبهم (مرة واحدة) */
        if(_hourly2&&_hourly2.hasInterval&&_hourly2.timesPerDay===2&&_doseRec2.count===1&&!/مرتين|twice|bid/i.test(rd.note)){
          var _hasAmbigMeal=/(?:بعد|قبل|مع)\s*(الاكل|الأكل|الآكل|الوجبه?|الطعام)/i.test(rd.note);
          if(_hasAmbigMeal){
            warningQueue.push({level:'info',message:'ℹ️ الصنف: '+_ezEsc(rd.itemName)+' — كل '+_hourly2.hours+' ساعة + بعد الأكل',detail:'كل '+_hourly2.hours+' ساعة = '+_hourly2.timesPerDay+' مرات لكن بعد الأكل عادةً مرة واحدة. تحقق من الجرعة.',editable:false,rowIndex:i,type:'info'});
          }
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

  warningQueue=warningQueue.filter(function(w){return !w.type||!_EZ_WARNING_CONFIG[w.type]||_EZ_WARNING_CONFIG[w.type].enabled;});

  /* 🤖 Gemini AI: resolve unrecognized doses before showing warnings */
  var _geminiNotes=[];var _geminiIdxMap=[];
  for(var _gi=0;_gi<allRowsData.length;_gi++){
    if(allRowsData[_gi]._needsGemini&&allRowsData[_gi].note){
      _geminiNotes.push(allRowsData[_gi].note);
      _geminiIdxMap.push(_gi);
    }
  }
  console.log('🤖 Gemini check: '+allRowsData.length+' total rows');
  for(var _dbg=0;_dbg<allRowsData.length;_dbg++){if(allRowsData[_dbg]._needsGemini)console.log('🤖 Row '+_dbg+' needs Gemini: "'+allRowsData[_dbg].note+'"');}
  console.log('🤖 Gemini: '+_geminiNotes.length+' unrecognized notes, key='+(!!_ezGetGeminiKey()));
  if(_geminiNotes.length>0){console.log('🤖 Notes to send:',_geminiNotes);}
  if(_geminiNotes.length>0&&_ezGetGeminiKey()){
    console.log('🤖 CALLING Gemini with '+_geminiNotes.length+' notes...');
    window.ezShowToast('🤖 جاري تحليل '+_geminiNotes.length+' جرعة بالذكاء الاصطناعي...','info');
    _ezGeminiBatch(_geminiNotes).then(function(results){
      console.log('🤖 Gemini returned successfully');
      console.log('🤖 Gemini response:',results);
      if(results&&results.length>0){
        var resolved=0;
        for(var _r=0;_r<results.length&&_r<_geminiIdxMap.length;_r++){
          var ai=results[_r];var idx3=_geminiIdxMap[_r];
          if(ai&&ai.startTime&&ai.confidence==='high'){
            /* Map AI time to local NORMAL_TIMES using AI's Arabic description */
            var _aiH=parseInt(ai.startTime.split(':')[0]);
            var _aiDesc=(ai.readable_ar||'').toLowerCase();
            var _localTime=ai.startTime;
            /* Match by keyword in AI description first (most accurate) */
            if(/صباح|morning/i.test(_aiDesc)) _localTime=NORMAL_TIMES.morning||'09:00';
            else if(/ريق|empty|fasting/i.test(_aiDesc)) _localTime=NORMAL_TIMES.empty||'08:00';
            else if(/قبل.*فطار|before.*break/i.test(_aiDesc)) _localTime=NORMAL_TIMES.beforeBreakfast||'08:00';
            else if(/بعد.*فطار|after.*break/i.test(_aiDesc)) _localTime=NORMAL_TIMES.afterBreakfast||'09:00';
            else if(/ظهر|noon/i.test(_aiDesc)) _localTime=NORMAL_TIMES.noon||'12:00';
            else if(/قبل.*غدا|قبل.*غداء|before.*lunch/i.test(_aiDesc)) _localTime=NORMAL_TIMES.beforeLunch||'13:00';
            else if(/بعد.*غدا|بعد.*غداء|after.*lunch/i.test(_aiDesc)) _localTime=NORMAL_TIMES.afterLunch||'14:00';
            else if(/عصر|afternoon/i.test(_aiDesc)) _localTime=NORMAL_TIMES.afternoon||'15:00';
            else if(/مغرب/i.test(_aiDesc)) _localTime=NORMAL_TIMES.maghrib||'18:00';
            else if(/قبل.*عشا|before.*din/i.test(_aiDesc)) _localTime=NORMAL_TIMES.beforeDinner||'20:00';
            else if(/بعد.*عشا|after.*din/i.test(_aiDesc)) _localTime=NORMAL_TIMES.afterDinner||'21:00';
            else if(/مساء|evening|ليل|night/i.test(_aiDesc)) _localTime=NORMAL_TIMES.evening||'21:00';
            else if(/نوم|bed|sleep/i.test(_aiDesc)) _localTime=NORMAL_TIMES.bed||'22:00';
            /* Fallback by hour if no keyword matched */
            else if(_aiH>=5&&_aiH<=7) _localTime=NORMAL_TIMES.empty||'08:00';
            else if(_aiH>=8&&_aiH<10) _localTime=NORMAL_TIMES.morning||'09:00';
            else if(_aiH>=10&&_aiH<13) _localTime=NORMAL_TIMES.noon||'12:00';
            else if(_aiH>=13&&_aiH<16) _localTime=NORMAL_TIMES.afterLunch||'14:00';
            else if(_aiH>=16&&_aiH<19) _localTime=NORMAL_TIMES.maghrib||'18:00';
            else if(_aiH>=19&&_aiH<22) _localTime=NORMAL_TIMES.evening||'21:00';
            else _localTime=NORMAL_TIMES.bed||'22:00';
            console.log('🤖 Time map: AI='+ai.startTime+' → local='+_localTime);
            allRowsData[idx3].unrecognizedTime=_localTime;
            allRowsData[idx3].unrecognizedEvery=ai.every||24;
            allRowsData[idx3].warningOverride=true;
            allRowsData[idx3]._geminiResolved=true;
            /* Remove the warning for this item */
            warningQueue=warningQueue.filter(function(w){return !(w.type==='unrecognized_dose'&&w.rowIndex===idx3);});
            resolved++;
            console.log('🤖 AI resolved: "'+allRowsData[idx3].note+'" → '+ai.startTime+' every '+ai.every+'h ('+ai.readable_ar+')');
          }
        }
        if(resolved>0) window.ezShowToast('🤖 الذكاء الاصطناعي فهم '+resolved+' جرعة','success');
      }
      /* Now show remaining warnings */
      if(warningQueue.length>0&&enableWarnings){window.showWarnings(warningQueue,function(){continueProcessing();});}else{continueProcessing();}
    }).catch(function(err){
      console.error('🤖 Gemini ERROR:',err);
      window.ezShowToast('🤖 خطأ في جيميناي: '+(err.message||err),'error');
      if(warningQueue.length>0&&enableWarnings){window.showWarnings(warningQueue,function(){continueProcessing();});}else{continueProcessing();}
    });
  } else {
    if(warningQueue.length>0&&enableWarnings){window.showWarnings(warningQueue,function(){continueProcessing();});}else{continueProcessing();}
  }

  function continueProcessing(){
    var defaultStartDate=document.querySelector('#fstartDate')?document.querySelector('#fstartDate').value:null;

    /* ══ PACK SIZE AWARE PROCESSING ══
       1) 14-pill choice=1 → size=14 as-is
       2) 14-pill choice=2 → treat as 28
       3) Fixed code breaking: only if non-fixed item has 28 days (not less) */
    try{
      var _pkScan=_scanPackSizeWarnings(m,t);
      /* Collect effective days from non-fixed items (regular + 14-pill resolved) */
      var _nonFixedDays=[];
      for(var _pi=0;_pi<_pkScan.items.length;_pi++){
        _nonFixedDays.push(_pkScan.items[_pi].effDays);
      }
      for(var _pi2=0;_pi2<_pkScan.items14.length;_pi2++){
        var _it14=_pkScan.items14[_pi2];
        if(_it14.choice==='2') _nonFixedDays.push(28);
        /* choice=1 → 14, but 14 does NOT trigger fixed code breaking */
      }
      /* Check if any non-fixed item has exactly 28 days */
      var _has28NonFixed=false;
      for(var _pi3=0;_pi3<_nonFixedDays.length;_pi3++){
        if(_nonFixedDays[_pi3]===28||_nonFixedDays[_pi3]===14){_has28NonFixed=true;break;}
      }
      console.log('PACK PROCESS: nonFixedDays='+JSON.stringify(_nonFixedDays)+' has28NonFixed='+_has28NonFixed);

      /* Mark allRowsData items */
      for(var _ri=0;_ri<allRowsData.length;_ri++){
        var _rd=allRowsData[_ri];
        var _rdName=_rd.itemName||'';
        var _rdPack=_extractPackFromName(_rdName);

        /* 14-pill items: set pack14Choice */
        if(_rdPack===14||_rdPack===42){
          var _key14=(_rdName.substring(0,40)).replace(/\s+/g,'_');
          var _ch=window._ez14Choices[_key14]||'?';
          _rd.pack14Choice=_ch;
          if(_ch==='1'){
            _rd.calculatedDays=14;_rd.calculatedSize=14;
            console.log('PACK14 APPLY: "'+_rdName+'" → choice=1, size=14');
          } else if(_ch==='2'){
            _rd.calculatedDays=28;_rd.calculatedSize=28;
            console.log('PACK14 APPLY: "'+_rdName+'" → choice=2, size=28');
          }
        }

        /* Fixed code breaking: override to 28 if non-fixed items have 28 */
        if(_rd.hasFixedSize&&_has28NonFixed){
          var _fixedVal=fixedSizeCodes[_rd.itemCode];
          /* 56/60 = BID packs (28×2 or 30×2) → don't break to 28, choose correct BID size */
          if(_fixedVal===56||_fixedVal===60){
            _rd.fixedSizeBreak=_has28NonFixed?56:60;
            console.log('PACK BID: code '+_rd.itemCode+' fixed='+_fixedVal+' → BID size='+_rd.fixedSizeBreak);
          } else if(_fixedVal>28){
            _rd.fixedSizeBreak=28;
            console.log('PACK BREAK: code '+_rd.itemCode+' fixed='+_fixedVal+' → override to 28');
          }
        }
        /* 56/60 without 28 policy → use 60 (30×2) */
        if(_rd.hasFixedSize&&!_has28NonFixed){
          var _fixedVal2=fixedSizeCodes[_rd.itemCode];
          if(_fixedVal2===56||_fixedVal2===60){
            _rd.fixedSizeBreak=60;
          }
        }
      }
    }catch(_pe){console.warn('Pack process error:',_pe);}

    var ramadanRtd=[];/* Ramadan duplicate list */
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];var r_node=rd.row;var tds_nodes=rd.tds;

      /* ── RAMADAN MODE: Ramadan duplicate (فطار + سحور) ── */
      if(ramadanMode&&rd.dui&&rd.dui.type==='ramadan_two'){
        /* FIX: في وضع رمضان لا نضرب qty في m - يفضل 1 
           m محفوظ في _rmMVal لاستخدامه عند إلغاء رمضان لاحقاً */
        /* qty يبقى كما هو (1) */
        /* Non-tablet items: uncheck and move to skip list */
        if(rd.ramadanInfo&&rd.ramadanInfo.type==='nontablet_ramadan'){
          var ck=getCheckmarkCellIndex(r_node);
          resetCheckmark(r_node,ck);
        }
        var _rmCalcDays=window._rmDaysLeft&&window._rmDaysLeft>0?window._rmDaysLeft:rd.calculatedDays;
        ramadanRtd.push({row:r_node,info:rd.dui,calcDays:_rmCalcDays});
        continue;
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
        /* Single dose Ramadan: apply Ramadan time, size = rmDaysLeft (even for fixed codes) */
        var rmEvery=rd.ramadanOverrideEvery||24;
        var _rmDays=window._rmDaysLeft&&window._rmDaysLeft>0?window._rmDaysLeft:rd.calculatedSize;
        setEvry(tds_nodes[ei_main],String(rmEvery));
        setSize(tds_nodes[si_main],_rmDays);
        setTime(r_node,rd.ramadanInfo.time);
        if(di_main>=0){var tpi_once=getTwoPillsPerDoseInfo(rd.note);setDose(tds_nodes[di_main],tpi_once.dose);}
        /* FIX: في وضع رمضان qty يبقى كما هو (1) - لا نضرب في m */
        /* qty stays as 1 - m محفوظ في _rmMVal للاستخدام عند الإلغاء */
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
      if(rd.hasFixedSize&&!rd.warningOverride){var _fixSize=rd.fixedSizeBreak||fixedSizeCodes[rd.itemCode];setSize(tds_nodes[si_main],_fixSize);var tm_fix=getCodeAwareTime(getTimeFromWords(rd.note),rd.itemCode);setTime(r_node,tm_fix.time);var dose_fix=smartDoseRecognizer(rd.note);var isE12_fix=/12|twice|bid|b\.?i\.?d|مرتين/.test(rd.note)||(dose_fix.hasB&&dose_fix.hasD)||(dose_fix.hasM&&dose_fix.hasE)||/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(rd.note)||/قبل\s*(الاكل|الأكل)\s*مرتين/.test(rd.note);if(dose_fix.count>=4||rd.timesPerDay>=4){setEvry(tds_nodes[ei_main],'6');}else if(dose_fix.count===3||rd.timesPerDay===3){setEvry(tds_nodes[ei_main],'8');}else if(dose_fix.count===2||isE12_fix||rd.timesPerDay===2){setEvry(tds_nodes[ei_main],'12');}else{setEvry(tds_nodes[ei_main],'24');}if(tm_fix.isCodeTime&&tm_fix.every){setEvry(tds_nodes[ei_main],String(tm_fix.every));}/* 56/60 BID default: no clear dose → force every=12, start=09:00 */var _origFixedVal=fixedSizeCodes[rd.itemCode];if((_origFixedVal===56||_origFixedVal===60)&&dose_fix.count<=1&&!isE12_fix&&rd.timesPerDay<=1){setEvry(tds_nodes[ei_main],'12');setTime(r_node,'09:00');}if(di_main>=0){var tpi_fix=getTwoPillsPerDoseInfo(rd.note);setDose(tds_nodes[di_main],tpi_fix.dose===2?2:tpi_fix.dose);}if(rd.forceDose2&&di_main>=0){setDose(tds_nodes[di_main],2);var _tpi_fix=getTwoPillsPerDoseInfo(rd.note);if(_tpi_fix.dose<2){var fsCur=parseInt(get(tds_nodes[si_main]))||1;setSize(tds_nodes[si_main],fsCur*2);if(!window._ezDose2Applied) window._ezDose2Applied=[];window._ezDose2Applied.push({name:rd.itemName,newSize:fsCur*2,dose:2});}else{var fsCur=parseInt(get(tds_nodes[si_main]))||1;if(!window._ezDose2Applied) window._ezDose2Applied=[];window._ezDose2Applied.push({name:rd.itemName,newSize:fsCur,dose:2});}}if(qi_main>=0){var cur2=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur2*m);}continue;}
      if(rd.isWeekly){var bs_val=(rd.calculatedDays==28?4:5)+(m-1)*4;setSize(tds_nodes[si_main],bs_val);setEvry(tds_nodes[ei_main],'168');if(qi_main>=0){var cur3=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur3);}var tm_fix2=getCodeAwareTime(getTimeFromWords(rd.note),rd.itemCode);setTime(r_node,tm_fix2.time);var targetDay=extractDayOfWeek(rd.note);if(targetDay!==null&&defaultStartDate&&sdi_main>=0){var newSD=getNextDayOfWeek(defaultStartDate,targetDay);setStartDate(r_node,newSD);}continue;}
      if(qi_main>=0){var qc2=tds_nodes[qi_main];var cv2=parseInt(get(qc2))||1;if(rd.daysOverrideQty&&rd.daysOverrideQty>0){setSize(qc2,rd.daysOverrideQty);}else{setSize(qc2,cv2*m);}}
      var doseInfo=smartDoseRecognizer(rd.note);var tpi_obj=getTwoPillsPerDoseInfo(rd.note);var doseMultiplier=tpi_obj.dose;var tm2_obj=getCodeAwareTime(getTimeFromWords(rd.note),rd.itemCode);
      /* Apply unrecognized_dose warning overrides if user set them */
      if(rd.unrecognizedTime){tm2_obj={time:rd.unrecognizedTime,isUnrecognized:false};}
      if(rd.unrecognizedEvery){rd.hourlyInfo={hasInterval:true,hours:rd.unrecognizedEvery,timesPerDay:Math.floor(24/rd.unrecognizedEvery)};}
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
      /* Apply size override from unrecognized_dose warning */
      if(rd.unrecognizedSize&&rd.unrecognizedSize>0){setSize(tds_nodes[si_main],rd.unrecognizedSize);}
      if(di_main>=0)setDose(tds_nodes[di_main],doseMultiplier>=1?doseMultiplier:1);
      if(!isE12)setTime(r_node,tm2_obj.time);
      /* Code-aware every override: if note was empty/unrecognized and code has custom every */
      if(tm2_obj.isCodeTime&&tm2_obj.every){
        var codeEvry=tm2_obj.every;
        var codeTPD=Math.floor(24/codeEvry);if(codeTPD<1)codeTPD=1;
        setEvry(tds_nodes[ei_main],String(codeEvry));
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*codeTPD));
      }
      /* Apply forceDose2 override AFTER normal processing */
      if(rd.forceDose2){
        if(di_main>=0)setDose(tds_nodes[di_main],2);
        var _tpi_check=getTwoPillsPerDoseInfo(rd.note);
        if(_tpi_check.dose<2){
          if(si_main>=0){var curSz=parseInt(get(tds_nodes[si_main]))||1;setSize(tds_nodes[si_main],curSz*2);}
          if(!window._ezDose2Applied) window._ezDose2Applied=[];
          window._ezDose2Applied.push({name:rd.itemName,newSize:curSz*2,dose:2});
        } else {
          var curSz=parseInt(get(tds_nodes[si_main]))||1;
          if(!window._ezDose2Applied) window._ezDose2Applied=[];
          window._ezDose2Applied.push({name:rd.itemName,newSize:curSz,dose:2});
        }
      }
    }
    for(var i=0;i<rtd_list.length;i++){var it=rtd_list[i];createDuplicateRows(it.calcDays,it.row,it.info,it.calcDays,ni_main,si_main,ei_main,di_main,ti_main,sdi_main,edi_main,m,it.calcDays,ci_main,qi_main);}
    /* Ramadan duplicates */
    for(var i=0;i<ramadanRtd.length;i++){var it=ramadanRtd[i];createRamadanDuplicateRows(it.calcDays,it.row,it.info,it.calcDays,ni_main,si_main,ei_main,di_main,ti_main,sdi_main,edi_main,m,it.calcDays,ci_main,qi_main);}
    sortRowsByTime(tb_main,ti_main,ei_main);
    _ezColorDupRows(tb_main);
    for(var i=0;i<skp_list.length;i++){var r_node=skp_list[i];var tds_nodes=r_node.querySelectorAll('td');var u_code_skp=getCleanCode(tds_nodes[ci_main]);if(sdi_main>=0&&tds_nodes[sdi_main]){var sdInp2=tds_nodes[sdi_main].querySelector('input');if(sdInp2)sdInp2.style.width='110px';}if(edi_main>=0&&tds_nodes[edi_main]){var edInp2=tds_nodes[edi_main].querySelector('input');if(edInp2)edInp2.style.width='110px';}if(ti_main>=0&&tds_nodes[ti_main]){var tiInp2=tds_nodes[ti_main].querySelector('input');if(tiInp2)tiInp2.style.width='100px';}if(ei_main>=0&&tds_nodes[ei_main]){var eiInp2=tds_nodes[ei_main].querySelector('input,select');if(eiInp2)eiInp2.style.width='90px';}if(ni_main>=0&&tds_nodes[ni_main]){var nInp2=tds_nodes[ni_main].querySelector('input,textarea');var crn=get(tds_nodes[ni_main]);var ccn=cleanNote(crn);if(nInp2){nInp2.style.width='100%';nInp2.style.minWidth='180px';nInp2.value=ccn;fire(nInp2);}else{tds_nodes[ni_main].textContent=ccn;}}tb_main.appendChild(r_node);}
    var uc=showUniqueItemsCount(tb_main,ci_main);
    beautifyPage();
    var enC=detectedLanguagesPerRow.filter(function(l){return l==='english';}).length;var arC=detectedLanguagesPerRow.filter(function(l){return l==='arabic';}).length;
    if(enC>0&&enC>=arC){setPatientLanguage('english');}else if(arC>0){setPatientLanguage('arabic');}
    if(duplicatedCount>0)window.ezShowToast('تم تقسيم '+duplicatedCount+' صنف إلى صفوف متعددة ⚡'+(ramadanMode?' 🌙':''),'info');
    if(showPostDialog||ramadanMode)showPostProcessDialog();
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
          listHtml+='<span style="flex:1;font-size:12px;font-weight:800;color:#1e1b4b">'+_ezEsc(items[d2].name)+'</span>';
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
        /جعل\s*كل\s*شهر\s*(ب|في|فى)?\s*(صندوق|بوكس)/i,
        /* FIX: أنماط "N بوكسات" - ترتيب الأدوية على N بوكسات */
        /(\d+|ثلاث|ثلاثة|اربع|أربع|خمس|خمسة|ست|سته)\s*(بوكسات|صناديق|كراتين|بوكس)/i,
        /على\s*(\d+)\s*(بوكس|بوكسات|صندوق|صناديق)/i,
        /ترتيب.*على\s*(\d+)/i,
        /في\s*(\d+)\s*(بوكس|بوكسات|صناديق|كراتين)/i,
        /توزيع.*على\s*(\d+)\s*(بوكس|بوكسات)/i
      ];

      /* Extract month/box count */
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
      /* FIX: استخراج عدد البوكسات من "3 بوكسات" مباشرة */
      if(!monthCount){
        var boxMatch=s.match(/(\d+)\s*(بوكسات|بوكس|صناديق|كراتين)/i);
        if(boxMatch) monthCount=boxMatch[1];
        var boxMatchAr=s.match(/(ثلاث|ثلاثة|اربع|أربع|خمس|خمسة|ست|سته)\s*(بوكسات|صناديق|كراتين)/i);
        if(boxMatchAr){
          var arabicNums4={'ثلاث':'3','ثلاثة':'3','اربع':'4','أربع':'4','خمس':'5','خمسة':'5','ست':'6','سته':'6'};
          monthCount=arabicNums4[boxMatchAr[1]]||boxMatchAr[1];
        }
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
.ez-dialog-v2{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:440px;max-width:96vw;max-height:90vh;z-index:99999;border-radius:28px;background:#f0f4ff;box-shadow:0 24px 64px rgba(59,130,246,0.08),0 0 0 1px rgba(59,130,246,0.06);overflow:hidden;animation:dialogEnter 0.8s cubic-bezier(0.16,1,0.3,1) forwards;font-family:Cairo,sans-serif;display:flex;flex-direction:column}\
.ez-header{padding:20px 22px 16px;display:flex;justify-content:space-between;align-items:center;cursor:move;flex-shrink:0}\
.ez-logo-group{display:flex;align-items:center;gap:12px}\
.ez-logo{width:46px;height:46px;border-radius:23px;background:#fff;border:2px solid rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 12px rgba(59,130,246,0.1)}\
.ez-title-block{display:flex;flex-direction:column}\
.ez-title{font-size:18px;font-weight:900;color:#1e3a5f;line-height:1.2;display:flex;align-items:center;gap:4px}\
.ez-title .ez-brand{font-size:18px;font-weight:900;color:#3b82f6;-webkit-text-fill-color:#3b82f6}\
.ez-subtitle{font-size:10px;font-weight:600;color:#94a3b8;margin-top:0}\
.ez-header-actions{display:flex;align-items:center;gap:4px}\
.ez-version{display:none}\
.ez-btn-icon{width:34px;height:34px;border-radius:17px;border:none;background:rgba(255,255,255,0.8);color:#94a3b8;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:Cairo,sans-serif}\
.ez-btn-icon:hover{background:rgba(59,130,246,0.1);color:#3b82f6}\
.ez-content{padding:0 16px 6px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;flex:1;min-height:0}\
.ez-content::-webkit-scrollbar{width:5px}\
.ez-content::-webkit-scrollbar-track{background:transparent}\
.ez-content::-webkit-scrollbar-thumb{background:rgba(129,140,248,0.2);border-radius:10px}\
.ez-content::-webkit-scrollbar-thumb:hover{background:rgba(129,140,248,0.4)}\
.ez-float-card{background:#fff;border-radius:20px;padding:14px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.02);direction:rtl;flex-shrink:0;margin:0 16px;border-bottom:1px solid rgba(99,102,241,0.06)}\
.ez-dur-row{display:flex;gap:22px;align-items:flex-start}\
.ez-dur-col{flex:1}\
.ez-dur-col.wide{flex:1.2}\
.ez-dur-divider{width:1px;height:52px;background:#e2e8f0;align-self:center;flex-shrink:0}\
.ez-dur-label{font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:8px;letter-spacing:0.3px}\
.ez-seg-group{display:flex;gap:4px;background:#f0f4ff;border-radius:12px;padding:3px;border:1px solid rgba(59,130,246,0.06)}\
.ez-seg{flex:1;height:40px;border-radius:9px;border:none;cursor:pointer;font-family:Cairo,sans-serif;font-weight:900;font-size:17px;transition:all 0.2s;background:transparent;color:#64748b}\
.ez-seg.active{background:#3b82f6;color:#fff}\
.ez-tog-grid{background:#fff;border-radius:20px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.02);direction:rtl;display:grid;grid-template-columns:1fr 1fr;gap:8px}\
.ez-tog-btn{padding:12px 14px;border-radius:14px;border:none;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.2s;text-align:right;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.02);outline:2px solid transparent}\
.ez-tog-btn.on{border:2px solid rgba(99,102,241,0.45)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.1)!important;background:rgba(99,102,241,0.04)!important}\
.ez-tog-btn .ez-tog-icon{font-size:16px;flex-shrink:0}\
.ez-tog-btn .ez-tog-lbl{font-size:12px;font-weight:800;color:#94a3b8;flex:1;transition:color 0.2s}\
.ez-tog-btn.on .ez-tog-lbl{color:var(--tc,#3b82f6)}\
.ez-tog-btn .ez-tog-dot{width:9px;height:9px;border-radius:5px;flex-shrink:0;transition:all 0.2s;background:#d1d5db}\
.ez-tog-btn.on .ez-tog-dot{background:var(--tc,#3b82f6)}\
.auto-tag{font-size:9px;font-weight:800;color:var(--tc,#6366f1);background:rgba(99,102,241,0.08);padding:2px 6px;border-radius:5px;margin-right:4px}\
.ez-rm-card{border-radius:20px;padding:16px 18px;direction:rtl;transition:all 0.3s;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.02);border:1.5px solid transparent}\
.ez-rm-card.on{background:linear-gradient(135deg,#fffbeb,#fef3c7);box-shadow:0 2px 12px rgba(245,158,11,0.08);border-color:rgba(251,191,36,0.18)}\
.ez-rm-toggle{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;cursor:pointer;font-family:Cairo,sans-serif;padding:0}\
.ez-rm-toggle .rm-icon{font-size:22px}\
.ez-rm-toggle .rm-text{font-size:14px;font-weight:800;color:#64748b;flex:1;text-align:right;transition:color 0.3s}\
.ez-rm-card.on .rm-text{color:#92400e}\
.ez-rm-sw{width:40px;height:22px;border-radius:11px;position:relative;transition:all 0.3s;background:#cbd5e1;flex-shrink:0}\
.ez-rm-card.on .ez-rm-sw{background:#f59e0b}\
.ez-rm-sw .knob{width:18px;height:18px;border-radius:9px;background:#fff;position:absolute;top:2px;right:20px;transition:all 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.1)}\
.ez-rm-card.on .ez-rm-sw .knob{right:2px}\
.ez-rm-expand{margin-top:12px;display:flex;align-items:center;gap:10px}\
.ez-rm-expand .rm-lbl{font-size:12px;font-weight:700;color:#92400e;white-space:nowrap}\
.ez-rm-expand input{flex:1;padding:8px 10px;border:1.5px solid rgba(251,191,36,0.25);border-radius:10px;font-size:20px;font-weight:900;text-align:center;font-family:Cairo,sans-serif;outline:none;background:rgba(255,255,255,0.7);color:#92400e;box-sizing:border-box}\
.ez-actions{display:flex;gap:7px;margin-top:0;padding:8px 16px 10px;flex-shrink:0;border-top:1px solid rgba(99,102,241,0.06)}\
.ez-btn-primary{flex:1;height:50px;border:none;border-radius:16px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:#3b82f6;box-shadow:0 6px 20px rgba(59,130,246,0.25);transition:all 0.3s;position:relative;overflow:hidden}\
.ez-btn-primary::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 4s ease-in-out infinite}\
.ez-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(59,130,246,0.35)}\
.ez-btn-primary:active{transform:translateY(0)}\
.ez-btn-primary.ez-pulse{box-shadow:0 8px 28px rgba(59,130,246,0.4),0 0 0 3px rgba(59,130,246,0.1)}\
.ez-btn-doses{width:50px;height:50px;border-radius:16px;border:none;background:#fff;cursor:pointer;font-size:19px;display:flex;align-items:center;justify-content:center;transition:all 0.3s}\
.ez-btn-doses:hover{background:#3b82f6;color:#fff;box-shadow:0 6px 20px rgba(59,130,246,0.25)}\
.ez-btn-cancel{width:50px;height:50px;border-radius:16px;border:1.5px solid #fecaca;background:#fef2f2;color:#ef4444;cursor:pointer;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:Cairo,sans-serif}\
.ez-btn-cancel:hover{background:#fee2e2;border-color:#fca5a5}\
.ez-footer{padding:9px;text-align:center;font-size:9px;font-weight:700;letter-spacing:1.2px;flex-shrink:0}\
.ez-footer span{color:#94a3b8}\
.ez-content>*{animation:fadeSlideUp 0.4s ease backwards}\
.ez-content>*:nth-child(1){animation-delay:0.05s}.ez-content>*:nth-child(2){animation-delay:0.1s}.ez-content>*:nth-child(3){animation-delay:0.15s}.ez-content>*:nth-child(4){animation-delay:0.2s}.ez-content>*:nth-child(5){animation-delay:0.25s}\
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
.ez-toast{position:fixed;bottom:30px;right:30px;background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);padding:12px 16px;border-radius:14px;box-shadow:0 10px 35px rgba(45,43,58,0.12),0 2px 8px rgba(0,0,0,0.06);z-index:999999;display:flex;align-items:center;gap:10px;font-family:Cairo,sans-serif;transform:translateX(400px);opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);border:1px solid rgba(129,140,248,0.1)}\
.ez-toast.show{transform:translateX(0);opacity:1}\
.ez-toast-icon{font-size:18px}\
.ez-toast-msg{font-size:13px;font-weight:700;color:#1e1b4b}\
.ez-toast-success{border-right:4px solid #10b981}\
.ez-toast-error{border-right:4px solid #ef4444}\
.ez-toast-info{border-right:4px solid #818cf8}\
.ez-toast-warning{border-right:4px solid #f59e0b}\
.ez-loader-spinner{width:22px;height:22px;border:3px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite}\
.ez-loader-text{font-size:14px;font-weight:800;color:#1e1b4b;font-family:Cairo,sans-serif}';
/* Table borders - data table only */
s_style.textContent+='table.ez-data-table{border-collapse:collapse!important;border:1px solid #bbb!important}table.ez-data-table th,table.ez-data-table td{border:1px solid #bbb!important}';
document.head.appendChild(s_style);

/* ══════════════════════════════════════════
   PAGE BEAUTIFICATION
   ══════════════════════════════════════════ */
function beautifyPage(){
  try{
    var dataTable=null;var allTables=document.querySelectorAll('table');
    for(var i=0;i<allTables.length;i++){var txt=allTables[i].innerText.toLowerCase();if((txt.indexOf('qty')>-1||txt.indexOf('quantity')>-1)&&txt.indexOf('note')>-1){dataTable=allTables[i];break;}}
    if(dataTable){dataTable.classList.add('ez-data-table');}
  }catch(e){}
}

/* ══════════════════════════════════════════
   MAIN DIALOG - NEW PROFESSIONAL DESIGN
   ══════════════════════════════════════════ */

/* ── ADMIN SETTINGS PANEL ── */
window.ezOpenSettings=function(){
  if(document.getElementById('ez-settings-overlay')) return;
  _ezShowSettingsPanel();
};

function _ezShowSettingsPanel(){
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

  /* Build Users list */
  var usrRows='';var usrRows_count=0;

  /* Build Code Start Times list */
  var cstRows='';var cstKeys=Object.keys(CODE_START_TIMES);
  var _evryOptions=[{v:'24',l:'24 (مرة/يوم)'},{v:'12',l:'12 (مرتين)'},{v:'8',l:'8 (3 مرات)'},{v:'6',l:'6 (4 مرات)'},{v:'48',l:'48 (يوم ويوم)'},{v:'168',l:'168 (أسبوعي)'}];
  function _buildEvrySelect(cls,code,val){var h='<select class="'+cls+'" data-code="'+code+'" style="width:130px;padding:4px 6px;border:1.5px solid rgba(6,182,212,0.15);border-radius:8px;font-size:11px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;direction:rtl">';for(var j=0;j<_evryOptions.length;j++){h+='<option value="'+_evryOptions[j].v+'"'+(String(val)===_evryOptions[j].v?' selected':'')+'>كل '+_evryOptions[j].l+'</option>';}h+='</select>';return h;}
  for(var i=0;i<cstKeys.length;i++){
    var cstVal=CODE_START_TIMES[cstKeys[i]];
    cstRows+='<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:rgba(6,182,212,0.04);border-radius:8px;border:1px solid rgba(6,182,212,0.1);direction:ltr"><span style="min-width:90px;font-size:12px;font-weight:800;color:#1e1b4b">'+cstKeys[i]+'</span><input type="time" class="ez-cfg-cst-val" data-code="'+cstKeys[i]+'" value="'+cstVal.time+'" style="width:100px;padding:4px 8px;border:1.5px solid rgba(6,182,212,0.15);border-radius:8px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;text-align:center" />'+_buildEvrySelect('ez-cfg-cst-evry',cstKeys[i],cstVal.every||24)+'<button class="ez-cfg-del-cst" data-code="'+cstKeys[i]+'" style="width:24px;height:24px;border:none;border-radius:6px;background:rgba(239,68,68,0.06);color:#ef4444;cursor:pointer;font-size:10px;flex-shrink:0">✕</button></div>';
  }
  if(cstKeys.length===0) cstRows='<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;font-weight:700">لا توجد أوقات مخصصة للأكواد بعد</div>';
  function timeInput(id,label,value,icon){
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(241,245,249,0.5);border-radius:10px;border:1px solid rgba(129,140,248,0.06);margin-bottom:6px"><span style="font-size:14px;flex-shrink:0">'+icon+'</span><span style="flex:1;font-size:11px;font-weight:700;color:#64748b;direction:rtl">'+label+'</span><input type="time" id="'+id+'" value="'+value+'" style="width:110px;padding:4px 8px;border:1.5px solid rgba(129,140,248,0.12);border-radius:8px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;color:#1e1b4b;outline:none;text-align:center" /></div>';
  }

  overlay.innerHTML='<div style="background:#fff;border-radius:24px;width:580px;max-width:96vw;max-height:90vh;overflow:hidden;box-shadow:0 30px 80px rgba(99,102,241,0.2);border:2px solid rgba(129,140,248,0.12);animation:ezWnSlideUp 0.5s cubic-bezier(0.16,1,0.3,1);display:flex;flex-direction:column">\
    <div style="padding:18px 24px 14px;display:flex;align-items:center;gap:14px;border-bottom:2px solid rgba(129,140,248,0.08);background:linear-gradient(180deg,rgba(99,102,241,0.03),transparent);flex-shrink:0">\
      <div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 20px rgba(99,102,241,0.3)">⚙️</div>\
      <div style="flex:1"><div style="font-size:17px;font-weight:900;color:#1e1b4b">لوحة الإعدادات</div></div>\
      <button onclick="document.getElementById(\'ez-settings-overlay\').remove()" style="width:32px;height:32px;border-radius:10px;border:1px solid rgba(129,140,248,0.12);background:rgba(129,140,248,0.04);color:#94a3b8;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>\
    </div>\
    <div style="flex:1;overflow-y:auto;padding:16px 22px">\
      <div style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap" id="ez-cfg-tabs">\
        <button class="ez-cfg-tab active" data-tab="ramadan" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:linear-gradient(145deg,#6366f1,#4f46e5);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">🌙 أوقات رمضان</button>\
        <button class="ez-cfg-tab" data-tab="normal" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">⏰ الأوقات العادية</button>\
        <button class="ez-cfg-tab" data-tab="keywords" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">📝 كلمات مخصصة</button>\
        <button class="ez-cfg-tab" data-tab="codes" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">💊 أكواد الأصناف</button>\
        <button class="ez-cfg-tab" data-tab="weekly" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">🗓️ الجرعات الأسبوعية</button>\
        <button class="ez-cfg-tab" data-tab="codetimes" style="padding:6px 16px;border:1.5px solid rgba(129,140,248,0.12);border-radius:10px;background:#fff;color:#6366f1;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s">🕐 أوقات الأكواد</button>\
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
      <div id="ez-cfg-panel-codes" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">💊</span> أكواد الأصناف ذات الحجم الثابت <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+fscKeys.length+' كود</span></div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:ltr"><input type="text" id="ez-cfg-new-code" placeholder="كود الصنف" style="flex:1;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:ltr" /><input type="number" id="ez-cfg-new-count" placeholder="العدد" style="width:70px;padding:8px 10px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center" /><button id="ez-cfg-add-fsc" style="padding:0 16px;border:none;border-radius:10px;background:linear-gradient(145deg,#10b981,#059669);color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(16,185,129,0.2)">+ إضافة</button></div>\
        <div style="max-height:280px;overflow-y:auto;border:1px solid rgba(129,140,248,0.08);border-radius:12px"><table style="width:100%;border-collapse:collapse" id="ez-cfg-fsc-table"><thead><tr style="background:linear-gradient(145deg,#f8f7ff,#eef2ff)"><th style="padding:8px;font-size:10px;font-weight:800;color:#6366f1;text-align:right">الكود</th><th style="padding:8px;font-size:10px;font-weight:800;color:#6366f1;text-align:center">العدد</th><th style="padding:8px;width:40px"></th></tr></thead><tbody>'+fscRows+'</tbody></table></div>\
      </div>\
      <div id="ez-cfg-panel-weekly" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🗓️</span> أكواد الجرعات الأسبوعية <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+weeklyInjections.length+' كود</span></div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:ltr"><input type="text" id="ez-cfg-new-wi" placeholder="كود الجرعة الأسبوعية" style="flex:1;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.15);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:ltr" /><button id="ez-cfg-add-wi" style="padding:0 16px;border:none;border-radius:10px;background:linear-gradient(145deg,#06b6d4,#0891b2);color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(6,182,212,0.2)">+ إضافة</button></div>\
        <div id="ez-cfg-wi-list">'+wiRows+'</div>\
      </div>\
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
      <div id="ez-cfg-panel-codetimes" class="ez-cfg-panel" style="display:none">\
        <div style="font-size:13px;font-weight:900;color:#1e1b4b;margin-bottom:6px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🕐</span> أوقات بدء مخصصة للأكواد <span style="font-size:9px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.08);padding:2px 8px;border-radius:6px">'+cstKeys.length+' كود</span></div>\
        <div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:12px;direction:rtl;line-height:1.6;padding:8px 10px;background:rgba(6,182,212,0.03);border-radius:8px;border:1px solid rgba(6,182,212,0.08)">أضف كود صنف معين ووقت بدء + تكرار مخصص ليه.<br>لو النوت <b>فاضي تماماً</b> → هيستخدم الوقت والتكرار المخصص بدل الافتراضي.<br>لو النوت فيه جرعة <b>مش مفهومة</b> → هيظهر تحذير عادي ومش هيستخدم إعدادات الكود.<br>💡 الإعدادات هنا بتضاف فوق الافتراضيات المحفوظة في الكود.<br>⚠️ الأولوية: لو النوت فيه جرعة مفهومة → هيتجاهل إعدادات الكود.</div>\
        <div style="display:flex;gap:6px;margin-bottom:10px;direction:ltr;align-items:end">\
          <div style="flex:1"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">كود الصنف</label><input type="text" id="ez-cfg-new-cst-code" placeholder="مثال: 102785890" style="width:100%;padding:8px 12px;border:1.5px solid rgba(6,182,212,0.15);border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,sans-serif;outline:none;direction:ltr" /></div>\
          <div style="width:100px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">وقت البدء</label><input type="time" id="ez-cfg-new-cst-time" value="09:00" style="width:100%;padding:8px 6px;border:1.5px solid rgba(6,182,212,0.15);border-radius:10px;font-size:13px;font-weight:800;font-family:Cairo,sans-serif;outline:none;text-align:center" /></div>\
          <div style="width:130px"><label style="display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px;letter-spacing:0.5px">كل كام ساعة</label><select id="ez-cfg-new-cst-evry" style="width:100%;padding:8px 6px;border:1.5px solid rgba(6,182,212,0.15);border-radius:10px;font-size:11px;font-weight:800;font-family:Cairo,sans-serif;outline:none;direction:rtl"><option value="24">24 (مرة/يوم)</option><option value="12">12 (مرتين)</option><option value="8">8 (3 مرات)</option><option value="6">6 (4 مرات)</option><option value="48">48 (يوم ويوم)</option><option value="168">168 (أسبوعي)</option></select></div>\
          <button id="ez-cfg-add-cst" style="padding:8px 14px;border:none;border-radius:10px;background:linear-gradient(145deg,#06b6d4,#0891b2);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 3px 10px rgba(6,182,212,0.2);white-space:nowrap">+ إضافة</button>\
        </div>\
        <div id="ez-cfg-cst-list">'+cstRows+'</div>\
      </div>\
    </div>\
    <div style="padding:12px 22px 16px;border-top:2px solid rgba(129,140,248,0.06);display:flex;gap:8px;flex-shrink:0;background:rgba(241,245,249,0.4);flex-wrap:wrap">\
      <button id="ez-cfg-save" style="flex:1;height:46px;border:none;border-radius:14px;font-size:14px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(145deg,#10b981,#059669);box-shadow:0 4px 16px rgba(16,185,129,0.25);transition:all 0.3s">💾 حفظ التعديلات</button>\
      <button id="ez-cfg-reset" style="height:46px;padding:0 18px;border:1.5px solid rgba(239,68,68,0.15);border-radius:14px;background:rgba(239,68,68,0.03);color:#ef4444;cursor:pointer;font-size:12px;font-weight:800;font-family:Cairo,sans-serif;transition:all 0.3s">🗑️ استعادة</button>\
      <div style="width:100%;display:flex;gap:8px;margin-top:4px">\
        <button id="ez-cfg-export" style="flex:1;height:38px;border:1.5px solid rgba(99,102,241,0.15);border-radius:12px;background:linear-gradient(145deg,#eef2ff,#e0e7ff);color:#4f46e5;cursor:pointer;font-size:11px;font-weight:800;font-family:Cairo,sans-serif;transition:all 0.3s">📤 تصدير الإعدادات</button>\
        <button id="ez-cfg-import" style="flex:1;height:38px;border:1.5px solid rgba(99,102,241,0.15);border-radius:12px;background:linear-gradient(145deg,#eef2ff,#e0e7ff);color:#4f46e5;cursor:pointer;font-size:11px;font-weight:800;font-family:Cairo,sans-serif;transition:all 0.3s">📥 استيراد الإعدادات</button>\
        <input type="file" id="ez-cfg-import-file" accept=".json" style="display:none" />\
      </div>\
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

  /* Add Fixed Size Code */
  if(document.getElementById('ez-cfg-add-fsc')){
  document.getElementById('ez-cfg-add-fsc').onclick=function(){
    var code=document.getElementById('ez-cfg-new-code').value.trim();
    var count=parseInt(document.getElementById('ez-cfg-new-count').value);
    if(!code||!count||count<1){window.ezShowToast('أدخل الكود والعدد','warning');return;}
    var c2=loadCustomConfig();if(!c2.fixedSizeCodes)c2.fixedSizeCodes={};
    c2.fixedSizeCodes[code]=count;saveCustomConfig(c2);
    window.ezShowToast('✅ تم إضافة كود '+code+' = '+count,'success');
    overlay.remove();_ezShowSettingsPanel();
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
      overlay.remove();_ezShowSettingsPanel();
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
    overlay.remove();_ezShowSettingsPanel();
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
      overlay.remove();_ezShowSettingsPanel();
    };
  });

  }/* end codes+weekly block */

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
    overlay.remove();_ezShowSettingsPanel();
  };
  }

  /* Add Custom Keyword for RAMADAN times */
  var addRamadanBtn=document.getElementById('ez-cfg-add-kw-ramadan');
  if(addRamadanBtn){
    addRamadanBtn.onclick=function(){
      try{
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
        }
        
        if(!kw){window.ezShowToast('أدخل الكلمة أو العبارة','warning');ezBeep('warning');return;}
        if(!kwLabel){window.ezShowToast('أدخل اسم الجرعة أو الكلمة','warning');ezBeep('warning');return;}
        if(!kwTime){window.ezShowToast('أدخل الوقت','warning');ezBeep('warning');return;}
        
        /* Escape special regex chars but keep it as a simple text match */
        var pattern=kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        var c2=loadCustomConfig();
        if(!c2.customRamadanRules)c2.customRamadanRules=[];
        
        /* Check for duplicate in ramadan rules */
        for(var i=0;i<c2.customRamadanRules.length;i++){
          if(c2.customRamadanRules[i].pattern===pattern){
            window.ezShowToast('⚠️ الكلمة موجودة بالفعل في أوقات رمضان','warning');
            ezBeep('warning');
            return;
          }
        }
        /* Check for duplicate in normal rules too */
        if(c2.customTimeRules){
          for(var i=0;i<c2.customTimeRules.length;i++){
            if(c2.customTimeRules[i].pattern===pattern){
              window.ezShowToast('⚠️ الكلمة موجودة بالفعل في الأوقات العادية','warning');
              ezBeep('warning');
              return;
            }
          }
        }
        /* Save with custom label and time */
        var newRule={pattern:pattern,meal:'custom',time:kwTime,label:kwLabel,label_ar:kwLabel,label_en:kwLabel};
        c2.customRamadanRules.push(newRule);
        saveCustomConfig(c2);
        window.ezShowToast('✅ تم إضافة "'+kw+'" لرمضان → '+kwLabel+' ('+kwTime+')','success');
        ezBeep('success');
        overlay.remove();_ezShowSettingsPanel();
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
      overlay.remove();_ezShowSettingsPanel();
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
        overlay.remove();_ezShowSettingsPanel();
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
        overlay.remove();_ezShowSettingsPanel();
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

  /* Add Code Start Time */
  if(document.getElementById('ez-cfg-add-cst')){
    document.getElementById('ez-cfg-add-cst').onclick=function(){
      var code=document.getElementById('ez-cfg-new-cst-code').value.trim().replace(/\D/g,'');
      var time=document.getElementById('ez-cfg-new-cst-time').value;
      var evry=parseInt(document.getElementById('ez-cfg-new-cst-evry').value)||24;
      if(!code){window.ezShowToast('أدخل كود الصنف','warning');ezBeep('warning');return;}
      if(!time){window.ezShowToast('أدخل وقت البدء','warning');ezBeep('warning');return;}
      var c2=loadCustomConfig();if(!c2.codeStartTimes)c2.codeStartTimes={};
      c2.codeStartTimes[code]={time:time,every:evry};saveCustomConfig(c2);
      var evryLabel=evry===24?'مرة/يوم':evry===12?'مرتين':evry===8?'3 مرات':evry===6?'4 مرات':'كل '+evry+'س';
      window.ezShowToast('✅ تم إضافة الكود '+code+' → '+time+' ('+evryLabel+')','success');
      ezBeep('success');
      overlay.remove();_ezShowSettingsPanel();
    };
  }

  /* Delete Code Start Time */
  overlay.querySelectorAll('.ez-cfg-del-cst').forEach(function(btn){
    btn.onclick=function(){
      var code=this.getAttribute('data-code');
      var c2=loadCustomConfig();
      if(c2.codeStartTimes)delete c2.codeStartTimes[code];
      saveCustomConfig(c2);
      window.ezShowToast('🗑️ تم حذف وقت الكود '+code,'info');
      overlay.remove();_ezShowSettingsPanel();
    };
  });

  /* Update Code Start Time on change */
  overlay.querySelectorAll('.ez-cfg-cst-val').forEach(function(inp){
    inp.onchange=function(){
      var code=this.getAttribute('data-code');var val=this.value;
      if(!val)return;
      var c2=loadCustomConfig();if(!c2.codeStartTimes)c2.codeStartTimes={};
      var cur=c2.codeStartTimes[code];
      if(typeof cur==='string')cur={time:cur,every:24};
      else if(!cur)cur={time:val,every:24};
      cur.time=val;
      c2.codeStartTimes[code]=cur;saveCustomConfig(c2);
      this.style.borderColor='#10b981';var ref=this;setTimeout(function(){ref.style.borderColor='rgba(6,182,212,0.15)';},1000);
    };
  });

  /* Update Code Start Every on change */
  overlay.querySelectorAll('.ez-cfg-cst-evry').forEach(function(sel){
    sel.onchange=function(){
      var code=this.getAttribute('data-code');var val=parseInt(this.value)||24;
      var c2=loadCustomConfig();if(!c2.codeStartTimes)c2.codeStartTimes={};
      var cur=c2.codeStartTimes[code];
      if(typeof cur==='string')cur={time:cur,every:24};
      else if(!cur)cur={time:'09:00',every:val};
      cur.every=val;
      c2.codeStartTimes[code]=cur;saveCustomConfig(c2);
      this.style.borderColor='#10b981';var ref=this;setTimeout(function(){ref.style.borderColor='rgba(6,182,212,0.15)';},1000);
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
    /* Refresh CODE_START_TIMES in memory (merge defaults + config) */
    var _cstK;for(_cstK in _defaultCodeStartTimes){var dv2=_defaultCodeStartTimes[_cstK];if(typeof dv2==='string')CODE_START_TIMES[_cstK]={time:dv2,every:24};else CODE_START_TIMES[_cstK]=dv2;}
    if(c2.codeStartTimes){for(_cstK in c2.codeStartTimes){var v=c2.codeStartTimes[_cstK];if(typeof v==='string')CODE_START_TIMES[_cstK]={time:v,every:24};else CODE_START_TIMES[_cstK]=v;}}
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

  /* EXPORT SETTINGS */
  document.getElementById('ez-cfg-export').onclick=function(){
    try{
      var exportData={
        _export:'EZ_Pill_Farmadosis_Settings',
        _version:APP_VERSION,
        _date:new Date().toISOString(),
        custom:loadCustomConfig(),
        settings:loadSettings()
      };
      var blob=new Blob([JSON.stringify(exportData,null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;
      a.download='EZ_Pill_Settings_'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.ezShowToast('📤 تم تصدير الإعدادات بنجاح','success');
      ezBeep('success');
    }catch(e){
      window.ezShowToast('❌ خطأ في التصدير: '+e.message,'error');
      ezBeep('error');
    }
  };

  /* IMPORT SETTINGS */
  document.getElementById('ez-cfg-import').onclick=function(){
    document.getElementById('ez-cfg-import-file').click();
  };
  document.getElementById('ez-cfg-import-file').onchange=function(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);
        if(!data._export||data._export!=='EZ_Pill_Farmadosis_Settings'){
          window.ezShowToast('❌ الملف مش ملف إعدادات EZ_Pill','error');
          ezBeep('error');return;
        }
        var msg='هل تريد استيراد الإعدادات';
        if(data._version) msg+=' (v'+data._version+')';
        if(data._date) msg+=' من '+data._date.slice(0,10);
        msg+='?\n\nسيتم استبدال جميع الإعدادات الحالية.';
        if(!confirm(msg))return;
        if(data.custom) saveCustomConfig(data.custom);
        if(data.settings){for(var k in data.settings) saveSettings(data.settings);}
        /* Restore version to prevent What's New popup */
        _ezSetSeenVersion(APP_VERSION);
        overlay.remove();
        window.ezShowToast('📥 تم استيراد الإعدادات بنجاح - أعد تشغيل الأداة','success');
        ezBeep('success');
      }catch(ex){
        window.ezShowToast('❌ خطأ في قراءة الملف: '+ex.message,'error');
        ezBeep('error');
      }
    };
    reader.readAsText(file);
    e.target.value='';
  };
}
var hasDuplicateNotes=scanForDuplicateNotes();
if(!hasDuplicateNotes){var _pnFields=document.querySelectorAll('textarea,input[type="text"]');for(var _pf=0;_pf<_pnFields.length;_pf++){var _pfv=(_pnFields[_pf].value||'').trim();if(_pfv.length>10&&/تقسيم|تقسم|ثلاث.*اشهر|ثلاثه.*شهور|3.*اشهر|3.*شهور|ثلاث.*صناديق|3.*صناديق|ثلاث.*بوكس|3.*بوكس/i.test(_pfv)){hasDuplicateNotes=true;break;}}}
var _rm_setting=savedSettings.ramadanMode||false;
/* Ramadan mode: post dialog is shown ONLY after processing if actual duplicates were created */
/* We don't force hasDuplicateNotes=true here anymore */

var d_box=document.createElement('div');
d_box.id='ez-dialog-box';
d_box.className='ez-dialog-v2';
d_box.setAttribute('data-m',String(savedSettings.m||1));
d_box.setAttribute('data-t',String(savedSettings.t||30));
var _m=savedSettings.m||1,_t=savedSettings.t||30,_ad=savedSettings.autoDuration!==false,_sw=savedSettings.showWarnings!==false,_rm=savedSettings.ramadanMode||false;

/* 🌙 Calculate Ramadan info for display */
var _fsd=(document.querySelector('#fstartDate')||{}).value||'';
var _rmAutoLeft=_ezRamadanDaysLeft(_fsd);
var _rmToday=_ezRamadanToday();
var _rmDayNum=_rmToday.dayNum;
var _rmTodayLeft=_rmToday.daysLeft;
d_box.innerHTML='\
<div class="ez-header">\
  <div class="ez-logo-group">\
    <div class="ez-logo">💊</div>\
    <div class="ez-title-block">\
      <div class="ez-title">EZ_Pill <span class="ez-brand">Farmadosis</span></div>\
      <div class="ez-subtitle">معالج الجرعات الذكي · v'+APP_VERSION+'</div>\
    </div>\
  </div>\
  <div class="ez-header-actions">\
    <button class="ez-btn-icon" onclick="window.ezOpenSettings()" title="إعدادات متقدمة">⚙️</button>\
    <button class="ez-btn-icon" onclick="window.ezSetupGemini()" title="إعداد الذكاء الاصطناعي">🤖</button>\
    <button class="ez-btn-icon" onclick="window.ezShowDoses()" title="عرض الجرعات">📋</button>\
    <button class="ez-btn-icon" onclick="window.ezMinimize()">−</button>\
  </div>\
</div>\
<div class="ez-float-card">\
    <div class="ez-dur-row">\
      <div class="ez-dur-col wide">\
        <div class="ez-dur-label">الأشهر</div>\
        <div class="ez-seg-group">\
          <button class="ez-seg '+(_m===1?'active':'')+'" onclick="window.ezSelect(this,\'m\',1)">1</button>\
          <button class="ez-seg '+(_m===2?'active':'')+'" onclick="window.ezSelect(this,\'m\',2)">2</button>\
          <button class="ez-seg '+(_m===3?'active':'')+'" onclick="window.ezSelect(this,\'m\',3)">3</button>\
        </div>\
      </div>\
      <div class="ez-dur-divider"></div>\
      <div class="ez-dur-col">\
        <div class="ez-dur-label">الأيام</div>\
        <div class="ez-seg-group">\
          <button class="ez-seg '+(_t===28?'active':'')+'" onclick="window.ezSelect(this,\'t\',28)">28</button>\
          <button class="ez-seg '+(_t===30?'active':'')+'" onclick="window.ezSelect(this,\'t\',30)">30</button>\
        </div>\
      </div>\
    </div>\
  </div>\
<div class="ez-content">\
  <div class="ez-tog-grid">\
    <button class="ez-tog-btn '+(_ad?'on':'')+'" style="--tc:#3b82f6" onclick="var cb=document.getElementById(\'auto-duration\');cb.checked=!cb.checked;this.classList.toggle(\'on\',cb.checked)">\
      <input type="checkbox" id="auto-duration" '+(_ad?'checked':'')+' style="display:none">\
      <span class="ez-tog-icon">✨</span><span class="ez-tog-lbl">استخراج تلقائي</span><span class="ez-tog-dot"></span>\
    </button>\
    <button class="ez-tog-btn '+(_sw?'on':'')+'" style="--tc:#f59e0b" onclick="var cb=document.getElementById(\'show-warnings\');cb.checked=!cb.checked;this.classList.toggle(\'on\',cb.checked)">\
      <input type="checkbox" id="show-warnings" '+(_sw?'checked':'')+' style="display:none">\
      <span class="ez-tog-icon">⚠️</span><span class="ez-tog-lbl">تحذيرات</span><span class="ez-tog-dot"></span>\
    </button>\
    <button class="ez-tog-btn '+(_rm?'on':'')+'" style="--tc:#10b981" onclick="var cb=document.getElementById(\'ramadan-mode\');cb.checked=!cb.checked;this.classList.toggle(\'on\',cb.checked);var card=document.getElementById(\'ez-rm-card\');if(card)card.style.display=cb.checked?\'block\':\'none\'">\
      <input type="checkbox" id="ramadan-mode" '+(_rm?'checked':'')+' style="display:none">\
      <span class="ez-tog-icon">🌙</span><span class="ez-tog-lbl">رمضان</span><span class="ez-tog-dot"></span>\
    </button>\
    <button class="ez-tog-btn '+(hasDuplicateNotes?'on':'')+'" style="--tc:#6366f1" onclick="var cb=document.getElementById(\'show-post-dialog\');cb.checked=!cb.checked;this.classList.toggle(\'on\',cb.checked)">\
      <input type="checkbox" id="show-post-dialog" '+(hasDuplicateNotes?'checked':'')+' style="display:none">\
      <span class="ez-tog-icon">⚙️</span><span class="ez-tog-lbl">خيارات'+(hasDuplicateNotes?' <span class=\"auto-tag\">تقسيم</span>':'')+'</span><span class="ez-tog-dot"></span>\
    </button>\
  </div>\
  <div id="ez-rm-card" style="display:'+(_rm?'block':'none')+';background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:14px;padding:10px 14px;direction:rtl;border:1.5px solid rgba(251,191,36,0.18)">\
    <div style="display:flex;align-items:center;gap:6px;width:100%">\
      <span style="font-size:11px;font-weight:800;color:#92400e">باقي</span>\
      <input type="number" id="ez-rm-days-left" min="1" max="30" value="'+(_rmToday.inRamadan?(_rmAutoLeft||_rmTodayLeft):'')+'" placeholder="?" onclick="this.select()" style="flex:1;text-align:center;padding:6px;border:1.5px solid rgba(251,191,36,0.25);border-radius:10px;font-size:16px;font-weight:900;font-family:Cairo,sans-serif;color:#92400e;background:rgba(255,255,255,0.7)" />\
      <span style="font-size:11px;font-weight:800;color:#92400e">يوم</span>\
    </div>\
    '+(_rmToday.inRamadan?'<div id="ez-rm-info" onclick="var inp=document.getElementById(\'ez-rm-days-left\');inp.value='+(_rmAutoLeft||_rmTodayLeft)+';inp.dispatchEvent(new Event(\'input\'))" style="width:100%;margin-top:5px;padding:4px 8px;background:rgba(5,150,105,0.06);border:1px solid rgba(5,150,105,0.12);border-radius:8px;font-size:10px;font-weight:800;color:#059669;text-align:center;cursor:pointer;direction:rtl">📅 اليوم '+_rmDayNum+' رمضان — باقي <strong>'+(_rmAutoLeft||_rmTodayLeft)+'</strong> يوم 👆</div>':(!_rmToday.inRamadan?'<div style="width:100%;margin-top:5px;padding:4px 8px;background:rgba(107,114,128,0.06);border-radius:8px;font-size:9px;font-weight:700;color:#6b7280;text-align:center;direction:rtl">رمضان لم يبدأ بعد</div>':''))+'\
  </div>\
  <div id="ez-pack-warning" style="display:none;padding:10px 14px;background:linear-gradient(135deg,#fef2f2,#fff1f2);border:1.5px solid #fca5a5;border-radius:16px;direction:rtl;transition:all 0.3s"></div>\
</div>\
<div class="ez-actions">\
    <button class="ez-btn-primary" onclick="window.ezSubmit()">⚡ بدء المعالجة</button>\
    <button class="ez-btn-doses" onclick="window.ezPreviewAlerts()" title="التنبيهات">⚠️</button>\
    <button class="ez-btn-doses" onclick="window.ezSaveNotes()" title="حفظ النوتات">💾</button>\
    <button class="ez-btn-doses" onclick="window.ezPasteNotes()" title="لصق النوتات">📥</button>\
    <button class="ez-btn-cancel" onclick="window.ezCancel()">✕</button>\
  </div>\
<div class="ez-footer"><span>EZ_PILL FARMADOSIS · V'+APP_VERSION+' · علي الباز</span></div>';

document.body.appendChild(d_box);
/* Async: فحص الجدول بعد ظهور الدايلوج مباشرة */
setTimeout(function(){
  try{
    /* فحص التقسيم — scanForDuplicateNotes يفحص الصفوف + #epresNotes فقط */
    var _dupCheck=scanForDuplicateNotes();
    if(_dupCheck){
      var _togBtn=document.querySelector('.ez-tog-btn[style*="6366f1"]');
      var _togCb=document.getElementById('show-post-dialog');
      if(_togBtn&&_togCb&&!_togCb.checked){_togCb.checked=true;_togBtn.classList.add('on');}
    }
    /* تنبيهات حجم العبوة */
    _renderPackWarningBanner();
  }catch(e){console.warn('EZ scan:',e);}
},50);
/* Observer: راقب data-t و data-m وأعد رسم التنبيه تلقائياً */
(function(){var _dlgBox=document.getElementById('ez-dialog-box');if(!_dlgBox)return;var _packObs=new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){if(muts[i].attributeName==='data-t'||muts[i].attributeName==='data-m'){try{_renderPackWarningBanner();}catch(e){}break;}}});_packObs.observe(_dlgBox,{attributes:true,attributeFilter:['data-t','data-m']});})();
/* Pulse effect on primary button */
setInterval(function(){var btn=document.querySelector('.ez-btn-primary');if(btn){btn.classList.toggle('ez-pulse');}},2000);

document.addEventListener('keydown',function(e){
  if(e.key==='Enter'){var sub=document.querySelector('.ez-btn-primary');if(sub)sub.click();}
  else if(e.key==='Escape'){window.ezCancel();}
});

makeDraggable(d_box);
/* إضافة حدث input لحقل أيام رمضان */
(function(){
  var rmInp=document.getElementById('ez-rm-days-left');
  var rmPrev=document.getElementById('ez-rm-days-preview');
  if(rmInp&&rmPrev){
    rmInp.addEventListener('input',function(){
      var v=parseInt(this.value)||0;
      if(v>0&&v<=30)rmPrev.textContent='✅ '+(30-v)+' يوم فات + '+v+' يوم باقي = 30 يوم';
      else rmPrev.textContent='❌ أدخل رقم بين 1 و 30';
    });
  }
})();
setTimeout(function(){beautifyPage();showWhatsNew();},100);

/* ══════════════════════════════════════════
   NAME EXTRACTION FROM PRESCRIPTION NOTES
   ══════════════════════════════════════════ */
function extractAndConfirmName(){
  try{
    /* Find Prescription Notes field */
    function findNotesField(){
      /* حصراً: فقط #epresNotes — لا تبحث في أي حقل آخر */
      return document.getElementById('epresNotes')||null;
    }

    /* Extract name from text - v3 (radical fix: handles تغيير اسم الضيف الى + connector words) */
    function extractName(text){
      if(!text||text.length<5) return null;
      /* Normalize newlines to spaces */
      var s=text.trim().replace(/\r?\n/g,' ');
      /* Strip parentheses/brackets so names inside become visible to patterns */
      s=s.replace(/[()[\]{}«»]/g,' ').replace(/\s+/g,' ').trim();

      /* Generic title words - NOT actual names */
      var genericWords=['الضيف','الضيفه','الضيفة','ضيف','ضيفه','ضيفة',
        'المريض','المريضه','المريضة','مريض','مريضه','مريضة',
        'العميل','العميله','العميلة','عميل','عميله','عميلة',
        'الزوج','الزوجه','الزوجة','الام','الأم','الاب','الأب'];

      /* Connector words: these appear BETWEEN the keyword and the name - skip them, don't stop */
      var connectorWords=['الى','إلى','الي','إلي','لـ'];

      function normA(w){return w.replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();}
      function normG(w){return normA(w).replace(/ى/g,'ي');}
      function isGeneric(w){var n=normG(w);for(var g=0;g<genericWords.length;g++)if(n===normG(genericWords[g]))return true;return false;}
      function isConnector(w){var n=normA(w);for(var c=0;c<connectorWords.length;c++)if(n===normA(connectorWords[c]))return true;return false;}

      /* Stop words - على excluded: handled contextually. connector words (الى/الي) removed from here */
      var stopWords=['وتوصيل','والتوصيل','وشكر','وشكرا','للضيف','للضيفه','للمريض','للمريضه',
        'وجعل','والتغيير','بصندوق','بالحمدانيه','بالحمدانية','برجاء','الرجاء','صيدلية','صيدليه',
        'للضروره','للضرورة','طلبات','طلب','وكتابه','وكتابة',
        'عند','اليوم','شهر','لثلاث','لشهر','بوكس','دمج','دمجهم','توصيل','توصيلهم','في','واضافه','واضافة','واضاف','ويوجد','يوجد'];

      /* على as preposition: only when followed by known location/object word */
      var alaStopNext=['الصندوق','العنوان','الطلب','الباب','الرف','الجهه','الجهة',
        'الشمال','اليمين','توصيل','الطريق','المنزل','البيت','الحساب',
        'البوكس','العبوه','العبوة','العلبه','العلبة','الكرتون','الشنطه','الشنطة'];

      function isStopWord(word,nextWord){
        /* على: stop ONLY when followed by a known object/location (preposition context) */
        if(normA(word)==='على'){
          if(nextWord&&alaStopNext.some(function(x){return normA(nextWord)===normA(x);})) return true;
          return false; /* otherwise treat as part of name (على الباز، سارة على) */
        }
        var wn=normA(word);
        for(var st=0;st<stopWords.length;st++)if(wn===normA(stopWords[st]))return true;
        return false;
      }

      /* cleanName: skip leading connectors (الى/الي) and generic titles, stop at stopWords */
      var notNameWords=['اوردات','اوردر','اوردرات','طلبات','طلب','بوكسات','بوكس',
        'صناديق','صندوق','علب','علبه','علبة','حبوب','حبه','حبة','اصناف','صنف',
        'ادويه','ادوية','دواء','شهر','شهور','اشهر','يوم','ايام','اسبوع','اسابيع',
        'تقسيم','تقسم','تجميع','دمج','توصيل','ترتيب','تكرار','تعديل','تغيير',
        'اخرى','اخر','آخر','أخرى','اول','ثاني','ثالث','كامل','كامله','جميع',
        'جميعا','عليها','عليهم','جميعهم','واحد','واحده','اثنين','ثلاثه','ثلاثة',
        'اربعه','اربعة','خمسه','خمسة','سته','ستة','فقط','بس','كل','نفس',
        'مره','مرتين','مرات','يوميا','يومياً','صباحا','مساء','قبل','بعد',
        'الاكل','النوم','الفطار','السحور','الافطار','الغداء','العشاء',
        'موجود','موجوده','متوفر','متوفره','مطلوب','مطلوبه','اضافي','اضافيه','اضافية',
        'حسب','وصفه','وصفة','روشته','روشتة','روشتته','الوصفه','الروشته',
        'رقم','نمره','نمرة','تليفون','موبايل','عنوان','منطقه','منطقة'];
      function isNotName(w){var n2=normG(w);var n2bare=n2.replace(/^ال/,'');for(var nn=0;nn<notNameWords.length;nn++){var nw=normG(notNameWords[nn]);if(n2===nw||n2bare===nw)return true;}return false;}

      function cleanName(raw){
        var words=raw.trim().split(/\s+/);
        var cleaned=[];
        for(var w=0;w<words.length;w++){
          if(!words[w]) continue;
          if(cleaned.length===0&&isConnector(words[w])) continue;
          if(cleaned.length===0&&isGeneric(words[w])) continue;
          if(cleaned.length===0&&isNotName(words[w])) return '';
          if(isStopWord(words[w],words[w+1]||null)) break;
          if(cleaned.length>0&&isNotName(words[w])) break;
          if(words[w].length<=1&&cleaned.length>0) break;
          cleaned.push(words[w]);
        }
        return cleaned.join(' ');
      }

      /* PRIORITY 0: تغيير اسم / تغيير الاسم + connector + name (radical patterns) */
      var changePatterns=[
        /* تغيير اسم الضيف الى على الباز */
        /(?:تغيير\s*اسم\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?|عمي[لة]?))\s*(?:الى|إلى|الي|إلي|ل)?\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i,
        /* تغيير الاسم الى / تغيير الاسم ل */
        /(?:تغيير\s*الاسم)\s*(?:الى|إلى|الي|إلي|ل)?\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i,
        /* تغيير اسم (بدون تحديد ضيف/مريض) */
        /(?:تغيير\s*الاسم?\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?|عمي[لة]?)?)\s*(?:الى|إلى|الي|إلي|ل)\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i,
        /* الاسم يكون / الاسم هو */
        /(?:الاسم\s*(?:يكون|هو|هي|بيكون)?)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,4})/i
      ];
      for(var cp=0;cp<changePatterns.length;cp++){
        var cm=s.match(changePatterns[cp]);
        if(cm&&cm[1]){
          var cr=cleanName(cm[1].trim());
          if(cr.length>=2) return cr;
        }
      }

      /* PRIORITY 1: name in parentheses after keywords */
      var parenPatterns=[
        /(?:اسم|كتاب[ةه]\s*اسم|وكتاب[ةه]\s*اسم|باسم)\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?|عمي[لة]?)\s*\(([^)]+)\)/i,
        /(?:اسم|كتاب[ةه]\s*اسم|وكتاب[ةه]\s*اسم|باسم)\s*[:\-]?\s*\(([^)]+)\)/i
      ];
      for(var pp=0;pp<parenPatterns.length;pp++){
        var pm=s.match(parenPatterns[pp]);
        if(pm&&pm[1]&&pm[1].trim().length>=2) return pm[1].trim();
      }

      /* PRIORITY 2: English name directly after keyword (no parens) */
      var engM=s.match(/(?:باسم|الاسم|اسم\s*(?:ال)?(?:ضيف[ةه]?|مريض[ةه]?|عمي[لة]?))\s*[:\-]?\s*([A-Za-z][A-Za-z\s]{2,})/i);
      if(engM&&engM[1]&&engM[1].trim().length>=3) return engM[1].trim();

      /* PRIORITY 3: Arabic name patterns (with optional connector الى/الي before name) */
      var patterns=[
        /(?:اسم\s*(?:ال)?ضيف[ةه]?)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:اسم\s*(?:ال)?مريض[ةه]?)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:اسم\s*(?:ال)?عمي[لة]?)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:تغيير\s*الاسم\s*(?:ال[يى]|ل[ـ]?))\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:(?:يكتب|اكتب|اكتبي)\s*(?:عليه|عليها)?\s*اسم)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:كتاب[ةه]\s*اسم)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:وكتاب[ةه]\s*اسم)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:باسم)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:الاسم)\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:للضيف[ةه]?|للمريض[ةه]?)\s*[:\-]?\s*([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){0,3})/i,
        /(?:^|[،,\s])اسم\s*[:\-]?\s*(?:الى|إلى|الي|إلي|ل)?\s*([\u0600-\u06FF]{3,}(?:\s+[\u0600-\u06FF]+){0,3})/i
      ];

      for(var p=0;p<patterns.length;p++){
        var m=s.match(patterns[p]);
        if(m&&m[1]){
          var raw=m[1].trim();
          var firstWord=raw.split(/\s+/)[0];
          /* Skip leading connector (الى/الي) captured in group */
          if(isConnector(firstWord)){
            raw=raw.split(/\s+/).slice(1).join(' ').trim();
            if(!raw) continue;
            firstWord=raw.split(/\s+/)[0];
          }
          if(isGeneric(firstWord)){
            /* Check for name in parens right after */
            var afterIdx=s.indexOf(m[0])+m[0].length;
            var ep=s.substring(afterIdx).match(/^\s*\(([^)]+)\)/);
            if(ep&&ep[1]&&ep[1].trim().length>=2) return ep[1].trim();
            /* Try words after the generic title */
            var rest=raw.split(/\s+/).slice(1).join(' ').trim();
            if(rest.length>=2&&!isGeneric(rest.split(' ')[0])){var rc=cleanName(rest);if(rc.length>=2) return rc;}
            continue;
          }
          var result=cleanName(raw);
          if(result.length>=2) return result;
        }
      }

      /* LAST RESORT: any English name in parens */
      var anyParen=s.match(/\(([A-Za-z][A-Za-z\s]{2,})\)/);
      if(anyParen&&anyParen[1].trim().length>=3) return anyParen[1].trim();

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
    var nameField=findNameField();
    if(nameField){
      var _curName=(nameField.value||'').trim();
      if(_curName.length>0&&/عبو[ةه]|العبو[ةه]|عبوه|علبه|علبة|العلبه|العلبة|كتابة اسم المريض|عدم كتابة|لا تكتب|لاتكتب/i.test(_curName)){
        nameField.value='';_ezFire(nameField);
        window.ezShowToast('⚠️ الضيف يحتاج تغيير الاسم','warning');ezBeep('warning');
        return;
      }
    }
    var extractedName=extractName(notesText);
    if(!extractedName) return;
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

    /* Name banner stays visible until user acts */

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

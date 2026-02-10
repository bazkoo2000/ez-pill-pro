javascript:(function(){var APP_VERSION='130.0';var APP_NAME='EZ_Pill Pro AI';var fixedSizeCodes={'100015980':24,'100015955':24,'100015971':24,'102988654':48,'100013423':10,'100013562':20,'101826688':20,'101284170':30,'103243857':30,'101859640':20,'100726280':24,'100011436':20,'100030493':40,'100011743':30,'103169239':20,'100684294':30,'100009934':48,'100014565':6,'100017942':20,'100633972':20,'100634019':20,'100009926':24,'102371620':24,'100015947':24,'100010652':30,'103437918':30,'103683617':30,'100023592':30,'100023875':20,'100013431':15,'100027201':20,'100016106':10,'100010097':20,'100013167':20};var weeklyInjections=['102785890','101133232','101943745','101049031','101528656'];var warningQueue=[];var monthCounter=0;var originalStartDate='';var duplicatedRows=[];var duplicatedCount=0;

/* ======= SHARED UTILITY FUNCTIONS ======= */
function fire(el){if(!el)return;el.focus();el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));}
function fireEvent(el){fire(el);}
function normL(t){return(t||'').toString().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();}
function getCell(td){var i=td.querySelector('input,textarea,select');if(i){if(i.tagName==='SELECT'){var o=i.options[i.selectedIndex];return o?o.textContent:i.value;}return i.value;}return td.innerText||td.textContent;}
function setCell(td,v){var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{var s=td.querySelector('select');if(s){s.value=String(v);fire(s);}else{td.textContent=v;}}}
function findColIdx(ths,n){for(var j=0;j<ths.length;j++){if(normL(ths[j].textContent).indexOf(normL(n))>-1)return j;}return-1;}
function parseDate(ds){if(!ds)return null;var parts=ds.split(/[-\/]/);if(parts.length===3){return new Date(parts[0],parts[1]-1,parts[2]);}return null;}
function formatDate(d){if(!d)return'';var y=d.getFullYear();var m=String(d.getMonth()+1).padStart(2,'0');var day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;}
function addMonths(d,months){var nd=new Date(d);nd.setMonth(nd.getMonth()+months);return nd;}
function findTable(){var ts=document.querySelectorAll('table');for(var i=0;i<ts.length;i++){if(ts[i].querySelector('th')&&(ts[i].innerText.toLowerCase().includes('qty')||ts[i].innerText.toLowerCase().includes('quantity'))){return ts[i];}}return null;}

function detectLanguage(text){if(!text)return'arabic';var arabicCount=(text.match(/[\u0600-\u06FF]/g)||[]).length;var englishCount=(text.match(/[a-zA-Z]/g)||[]).length;if(englishCount>arabicCount&&englishCount>5){return'english';}return'arabic';}

function setPatientLanguage(language){var langSelect=document.querySelector('select[name*="language" i], select[id*="language" i], #flanguage');if(langSelect){var targetValue=language==='english'?'English':'Arabic';var options=langSelect.options;for(var i=0;i<options.length;i++){if(options[i].text===targetValue||options[i].value===targetValue||options[i].text.toLowerCase()===targetValue.toLowerCase()){langSelect.selectedIndex=i;fire(langSelect);return true;}}}}

/* ======= ADVANCED AI DOSE EXTRACTION ENGINE ======= */
function smartExtractDuration(noteText,defaultMonths,defaultDays){
var result={months:defaultMonths,days:defaultDays,confidence:'low',source:'default',frequency:null,dosePerTime:null,timesPerDay:null,totalDailyDose:null,patterns:[],extractionLog:[]};
if(!noteText||noteText.trim()===''){return result;}
var text=noteText.trim();
var textLower=text.toLowerCase();
var textNorm=text.replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
var textNormLower=textNorm.toLowerCase();

/* --- PHASE 1: Duration Extraction (months/days/weeks) --- */
var durationPatterns=[
{regex:/(\d+)\s*(شهر|شهور|أشهر|اشهر)/i,type:'months',priority:10,label:'arabic_months'},
{regex:/(\d+)\s*(month|months)/i,type:'months',priority:10,label:'english_months'},
{regex:/(\d+)\s*(يوم|ايام|أيام)/i,type:'days',priority:10,label:'arabic_days'},
{regex:/(\d+)\s*(day|days)/i,type:'days',priority:10,label:'english_days'},
{regex:/(\d+)\s*(اسبوع|أسبوع|اسابيع|أسابيع)/i,type:'weeks',priority:10,label:'arabic_weeks'},
{regex:/(\d+)\s*(week|weeks|wk|wks)/i,type:'weeks',priority:10,label:'english_weeks'},
{regex:/(?:مده|مدة|لمده|لمدة)\s*(\d+)\s*(شهر|شهور|أشهر|اشهر|يوم|ايام|أيام|اسبوع|أسبوع)?/i,type:'duration_ar',priority:9,label:'arabic_duration_prefix'},
{regex:/(?:for|duration|dur)\s*(\d+)\s*(month|months|day|days|week|weeks|wk|wks)?/i,type:'duration_en',priority:9,label:'english_duration_prefix'},
{regex:/[x×]\s*(\d+)\s*(شهر|شهور|month|months|m)?/i,type:'multiplier',priority:8,label:'multiplier_prefix'},
{regex:/(\d+)\s*[x×]\s*(شهر|شهور|month|months|m)?/i,type:'multiplier',priority:8,label:'multiplier_suffix'},
{regex:/(\d+)\s*م(?:\s|$|[^ر])/,type:'months',priority:5,label:'arabic_m_abbr'},
{regex:/(\d+)\s*ش(?:\s|$)/,type:'months',priority:5,label:'arabic_sh_abbr'}
];

var foundMonths=null;var foundDays=null;var highestPriority=0;

for(var i=0;i<durationPatterns.length;i++){
var p=durationPatterns[i];
var match=text.match(p.regex);
if(match&&match[1]){
var value=parseInt(match[1]);
if(value<=0||value>365)continue;

var resolvedType=p.type;
if(p.type==='duration_ar'||p.type==='duration_en'){
var unitStr=(match[2]||'').toLowerCase();
if(/يوم|ايام|أيام|day|days/.test(unitStr)){resolvedType='days';}
else if(/اسبوع|أسبوع|week|wk/.test(unitStr)){resolvedType='weeks';}
else{resolvedType='months';}
}
if(p.type==='multiplier'){
var unitStr2=(match[2]||'').toLowerCase();
if(!unitStr2||/شهر|شهور|month|months|m/.test(unitStr2)){resolvedType='months';}
}

if(resolvedType==='weeks'){
foundMonths=null;
foundDays=value*7;
result.patterns.push({type:'days',value:value*7,match:match[0],priority:p.priority,label:p.label});
result.extractionLog.push('Weeks->Days: '+value+'w = '+(value*7)+'d');
}else if(resolvedType==='months'&&p.priority>highestPriority){
foundMonths=value;
highestPriority=p.priority;
result.patterns.push({type:'months',value:value,match:match[0],priority:p.priority,label:p.label});
result.extractionLog.push('Months: '+value+' ('+p.label+')');
}else if(resolvedType==='days'){
foundDays=value;
result.patterns.push({type:'days',value:value,match:match[0],priority:p.priority,label:p.label});
result.extractionLog.push('Days: '+value+' ('+p.label+')');
}
}
}

if(foundMonths!==null){result.months=foundMonths;result.source='extracted';result.confidence=highestPriority>=8?'high':'medium';}
if(foundDays!==null){result.days=foundDays;result.source='extracted';result.confidence='high';}

/* --- PHASE 2: Frequency Extraction (times per day) --- */
var freqPatterns=[
{regex:/(\d+)\s*(?:مره|مرة|مرات)\s*(?:يوميا|يومي|باليوم|في اليوم|فى اليوم|كل يوم)/i,type:'timesPerDay',label:'arabic_times_daily'},
{regex:/(\d+)\s*(?:times?\s*(?:per\s*)?(?:daily|a\s*day|per\s*day))/i,type:'timesPerDay',label:'english_times_daily'},
{regex:/(?:مره|مرة|مرة واحدة|مره واحده)\s*(?:يوميا|يومي|باليوم|واحده|واحدة)/i,type:'fixed',value:1,label:'arabic_once_daily'},
{regex:/(?:مرتين|مرتان)\s*(?:يوميا|يومي|باليوم|في اليوم|فى اليوم)?/i,type:'fixed',value:2,label:'arabic_twice_daily'},
{regex:/ثلاث\s*(?:مرات)?\s*(?:يوميا|يومي|باليوم)?/i,type:'fixed',value:3,label:'arabic_thrice_daily'},
{regex:/اربع|أربع\s*(?:مرات)?\s*(?:يوميا|يومي|باليوم)?/i,type:'fixed',value:4,label:'arabic_four_daily'},
{regex:/(?:once|one\s*time)\s*(?:daily|a\s*day|per\s*day)/i,type:'fixed',value:1,label:'english_once_daily'},
{regex:/(?:twice|two\s*times?|2\s*times?)\s*(?:daily|a\s*day|per\s*day)/i,type:'fixed',value:2,label:'english_twice_daily'},
{regex:/(?:thrice|three\s*times?|3\s*times?)\s*(?:daily|a\s*day|per\s*day)/i,type:'fixed',value:3,label:'english_thrice_daily'},
{regex:/(?:four\s*times?|4\s*times?)\s*(?:daily|a\s*day|per\s*day)/i,type:'fixed',value:4,label:'english_four_daily'},
/* Medical abbreviations */
{regex:/\b(?:OD|QD|SID)\b/i,type:'fixed',value:1,label:'abbr_once_daily'},
{regex:/\b(?:BID|BD|B\.I\.D|B\.D)\b/i,type:'fixed',value:2,label:'abbr_twice_daily'},
{regex:/\b(?:TID|TDS|T\.I\.D|T\.D\.S)\b/i,type:'fixed',value:3,label:'abbr_thrice_daily'},
{regex:/\b(?:QID|QDS|Q\.I\.D|Q\.D\.S)\b/i,type:'fixed',value:4,label:'abbr_four_daily'},
/* Hourly intervals */
{regex:/(?:كل|every)\s*(\d+)\s*(?:ساعه|ساعة|ساعات|hours?|hrs?|h)\b/i,type:'hourly',label:'hourly_interval'},
{regex:/\bq\s*(\d+)\s*h?\b/i,type:'hourly',label:'q_hourly'},
/* Special frequencies */
{regex:/(?:صباحا?\s*(?:و|&)?\s*مساء|صباح\s*(?:و|&)?\s*مساء|morning\s*(?:and|&|,)\s*(?:evening|night))/i,type:'fixed',value:2,label:'morning_evening'},
{regex:/(?:صباح|صباحا|morning|AM)\s*(?:فقط|only)?(?:\s|$)/i,type:'fixed',value:1,label:'morning_only'},
{regex:/(?:مساء|مساءا|evening|PM|night|bedtime|قبل النوم|عند النوم)\s*(?:فقط|only)?(?:\s|$)/i,type:'fixed',value:1,label:'evening_only'},
{regex:/(?:بعد|قبل|مع)\s*(?:كل\s*)?(?:وجبه|وجبة|وجبات|الاكل|الأكل|meal)/i,type:'fixed',value:3,label:'with_meals'},
{regex:/\bprn\b|\bwhen\s*needed\b|(?:عند\s*(?:اللزوم|الحاجه|الحاجة|الضروره|الضرورة))/i,type:'prn',value:0,label:'as_needed'},
/* Weekly */
{regex:/(?:مره|مرة|مرة واحدة|مره واحده)\s*(?:اسبوعيا|أسبوعيا|في الاسبوع|فى الاسبوع|كل اسبوع)/i,type:'weekly',value:1,label:'arabic_once_weekly'},
{regex:/(?:once|one\s*time)\s*(?:weekly|a\s*week|per\s*week)/i,type:'weekly',value:1,label:'english_once_weekly'},
{regex:/(?:مرتين)\s*(?:اسبوعيا|أسبوعيا|في الاسبوع)/i,type:'weekly',value:2,label:'arabic_twice_weekly'},
{regex:/\bweekly\b|اسبوعيا|أسبوعيا/i,type:'weekly',value:1,label:'weekly_generic'},
{regex:/\bQ\s*week\b|\bQW\b/i,type:'weekly',value:1,label:'abbr_weekly'}
];

var timesPerDay=null;var freqType=null;

for(var f=0;f<freqPatterns.length;f++){
var fp=freqPatterns[f];
var fmatch=text.match(fp.regex);
if(fmatch){
if(fp.type==='timesPerDay'){
timesPerDay=parseInt(fmatch[1]);
freqType='daily';
}else if(fp.type==='fixed'){
timesPerDay=fp.value;
freqType='daily';
}else if(fp.type==='hourly'){
var hours=parseInt(fmatch[1]);
if(hours>0&&hours<=24){
timesPerDay=Math.round(24/hours);
freqType='daily';
}
}else if(fp.type==='weekly'){
timesPerDay=fp.value;
freqType='weekly';
}else if(fp.type==='prn'){
freqType='prn';
timesPerDay=null;
}
if(timesPerDay!==null||freqType==='prn'){
result.extractionLog.push('Frequency: '+fp.label+(timesPerDay?' = '+timesPerDay+'x/day':''));
result.patterns.push({type:'frequency',value:timesPerDay,freqType:freqType,match:fmatch[0],label:fp.label});
break;
}
}
}

if(timesPerDay!==null){result.frequency=freqType;result.timesPerDay=timesPerDay;}

/* --- PHASE 3: Dose Per Administration --- */
var dosePatterns=[
{regex:/(?:نص|نصف)\s*(?:قرص|حبه|حبة|كبسوله|كبسولة|tab|tablet|cap|capsule)?/i,value:0.5,label:'half_dose_ar'},
{regex:/(?:half|0\.5|½)\s*(?:tab|tablet|cap|capsule|قرص|حبه|حبة)?/i,value:0.5,label:'half_dose_en'},
{regex:/(?:ربع|رُبع)\s*(?:قرص|حبه|حبة|كبسوله|كبسولة)?/i,value:0.25,label:'quarter_dose_ar'},
{regex:/(?:quarter|0\.25|¼)\s*(?:tab|tablet|cap|capsule)?/i,value:0.25,label:'quarter_dose_en'},
{regex:/(\d+(?:\.\d+)?)\s*(?:قرص|حبه|حبة|كبسوله|كبسولة|اقراص|أقراص|حبوب|كبسولات)/i,value:null,capture:true,label:'arabic_dose_count'},
{regex:/(\d+(?:\.\d+)?)\s*(?:tab|tabs|tablet|tablets|cap|caps|capsule|capsules|pill|pills)\b/i,value:null,capture:true,label:'english_dose_count'},
{regex:/(?:قرص|حبه|حبة|كبسوله|كبسولة|tab|tablet|cap|capsule)\s*(\d+(?:\.\d+)?)/i,value:null,capture:true,captureIdx:1,label:'dose_after_unit'},
{regex:/(\d+(?:\.\d+)?)\s*(?:ملعقه|ملعقة|ملاعق|spoon|spoons|tsp|tbsp|ml|مل|سم)/i,value:null,capture:true,label:'liquid_dose'}
];

var dosePerTime=null;
for(var dp=0;dp<dosePatterns.length;dp++){
var dPat=dosePatterns[dp];
var dMatch=text.match(dPat.regex);
if(dMatch){
if(dPat.capture){
var idx=dPat.captureIdx||1;
dosePerTime=parseFloat(dMatch[idx]);
}else{
dosePerTime=dPat.value;
}
if(dosePerTime!==null&&dosePerTime>0){
result.dosePerTime=dosePerTime;
result.extractionLog.push('DosePerTime: '+dosePerTime+' ('+dPat.label+')');
result.patterns.push({type:'dose',value:dosePerTime,match:dMatch[0],label:dPat.label});
break;
}
}
}

/* --- PHASE 4: Calculate Total Daily Dose --- */
if(dosePerTime!==null&&timesPerDay!==null){
if(freqType==='daily'){
result.totalDailyDose=dosePerTime*timesPerDay;
}else if(freqType==='weekly'){
result.totalDailyDose=dosePerTime*timesPerDay/7;
}
result.extractionLog.push('TotalDailyDose: '+result.totalDailyDose);
}

/* --- PHASE 5: Confidence Scoring --- */
var contextKeywords=['استمر','continue','يومي','daily','كل','every','صباح','مساء','morning','evening','بعد الاكل','قبل الاكل','after meal','before meal','with food'];
var contextScore=0;
for(var j=0;j<contextKeywords.length;j++){
if(textNormLower.indexOf(contextKeywords[j].toLowerCase())>-1){contextScore++;}
}

var totalPatterns=result.patterns.length;
if(totalPatterns>=3){result.confidence='high';}
else if(totalPatterns===2){result.confidence=contextScore>=1?'high':'medium';}
else if(totalPatterns===1){result.confidence=contextScore>=2?'high':'medium';}
else if(contextScore>=2){result.confidence='medium';}

if(result.source==='extracted'&&result.confidence==='low'){result.confidence='medium';}
if(result.totalDailyDose!==null&&result.source==='extracted'){result.confidence='high';}

return result;
}

/* ======= SMART DOSE VALIDATION ======= */
function smartValidateDose(code,quantity,size,notes){
var warnings=[];var suggestions=[];var codeStr=String(code);
var isWeeklyInjection=weeklyInjections.indexOf(codeStr)>-1;
var expectedSize=fixedSizeCodes[codeStr];

if(expectedSize&&size!==expectedSize){
warnings.push({level:'warning',type:'size_mismatch',message:'⚠️ العبوة المتوقعة: '+expectedSize+' | الحالية: '+size,expected:expectedSize,actual:size,severity:Math.abs(expectedSize-size)>10?'high':'medium'});
}
if(isWeeklyInjection){
var weeklyPattern=/أسبوع|اسبوع|week|weekly/i;
var monthlyPattern=/شهر|month/i;
if(notes&&!weeklyPattern.test(notes)&&monthlyPattern.test(notes)){
warnings.push({level:'danger',type:'weekly_confusion',message:'🔴 تحذير: هذا الدواء حقنة أسبوعية وليست شهرية!',severity:'critical'});
}
if(quantity>8){
warnings.push({level:'warning',type:'weekly_quantity',message:'⚠️ الكمية كبيرة لحقنة أسبوعية ('+quantity+' عبوة)',severity:'medium'});
}
}
if(quantity>50){
warnings.push({level:'danger',type:'excessive_quantity',message:'🔴 الكمية مبالغ فيها جداً: '+quantity+' عبوة',severity:'critical'});
}else if(quantity>20){
warnings.push({level:'warning',type:'high_quantity',message:'⚠️ الكمية كبيرة: '+quantity+' عبوة',severity:'medium'});
}
if(notes){
var durationInfo=smartExtractDuration(notes,1,30);
if(durationInfo.confidence==='high'){
var msg='✨ AI: المدة '+durationInfo.months+' شهر';
if(durationInfo.timesPerDay){msg+=' | '+durationInfo.timesPerDay+' مرات/يوم';}
if(durationInfo.dosePerTime){msg+=' | '+durationInfo.dosePerTime+' لكل جرعة';}
if(durationInfo.totalDailyDose){msg+=' | إجمالي يومي: '+durationInfo.totalDailyDose;}
suggestions.push({type:'duration',message:msg,data:durationInfo});
}
}
return{warnings:warnings,suggestions:suggestions,isValid:warnings.length===0||warnings.every(function(w){return w.severity!=='critical';})};
}

/* ======= TOAST NOTIFICATION ======= */
window.ezShowToast=function(msg,type,duration){var t=document.createElement('div');t.className='ez-toast ez-toast-'+type;var icons={success:'<svg width="20" height="20" fill="currentColor"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"/></svg>',error:'<svg width="20" height="20" fill="currentColor"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg>',info:'<svg width="20" height="20" fill="currentColor"><circle cx="10" cy="10" r="9"/><path fill="#fff" d="M9 5h2v2H9zm0 4h2v6H9z"/></svg>',warning:'<svg width="20" height="20" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'};t.innerHTML='<div class="ez-toast-icon">'+icons[type]+'</div><div class="ez-toast-msg">'+msg+'</div><div class="ez-toast-progress"></div>';document.body.appendChild(t);setTimeout(function(){t.classList.add('show');},10);var timeout=duration||3000;setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},300);},timeout);};

/* ======= DIALOG CONTROLS ======= */
window.ezCancel=function(){var d=document.getElementById('ez-dialog-box');if(d){d.classList.add('closing');setTimeout(function(){d.remove();},200);}};
window.ezClosePost=function(){var d=document.getElementById('ez-post-dialog');if(d){d.classList.add('closing');setTimeout(function(){d.remove();},200);}};
window.ezMinimize=function(){var d=document.getElementById('ez-dialog-box');if(d){var content=d.querySelector('.ez-content');var minBtn=d.querySelector('.ez-minimize-btn');if(content.style.display==='none'){content.style.display='block';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg>';d.style.width='auto';}else{content.style.display='none';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M7 0v14M0 7h14"/></svg>';d.style.width='380px';}}};
window.ezMinimizePost=function(){var d=document.getElementById('ez-post-dialog');if(d){var content=d.querySelector('.post-content');var minBtn=d.querySelector('.post-minimize-btn');if(content.style.display==='none'){content.style.display='block';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg>';d.style.height='auto';}else{content.style.display='none';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M7 0v14M0 7h14"/></svg>';d.style.height='80px';}}};

window.ezSelect=function(el,type,val){var p=el.parentNode;var pills=p.querySelectorAll('.ez-pill');for(var i=0;i<pills.length;i++){pills[i].classList.remove('selected');}el.classList.add('selected');var d=document.getElementById('ez-dialog-box');if(type==='m'){d.setAttribute('data-m',val);}else{d.setAttribute('data-t',val);}};

/* ======= WARNING DISPLAY ======= */
window.showWarningDialog=function(warnings,callback){
if(!warnings||warnings.length===0){callback();return;}
var criticalCount=0;var warningCount=0;var infoCount=0;
for(var i=0;i<warnings.length;i++){if(warnings[i].level==='danger')criticalCount++;else if(warnings[i].level==='warning')warningCount++;else infoCount++;}
var html='<div class="warning-dialog"><div class="warning-header-modern"><div class="warning-pulse"></div><div class="warning-icon-modern">⚠️</div><div class="warning-title-modern">تحذيرات تحتاج انتباهك</div><div class="warning-stats"><span class="stat-critical">'+criticalCount+'</span><span class="stat-warning">'+warningCount+'</span><span class="stat-info">'+infoCount+'</span></div></div><div class="warning-list-modern">';
for(var j=0;j<warnings.length;j++){
var w=warnings[j];var severityBadge='';
if(w.severity==='critical')severityBadge='<span class="severity-badge critical">حرج</span>';
else if(w.severity==='high')severityBadge='<span class="severity-badge high">عالي</span>';
else if(w.severity==='medium')severityBadge='<span class="severity-badge medium">متوسط</span>';
html+='<div class="warning-item-modern warning-'+w.level+'"><div class="warning-indicator"></div><div class="warning-content"><div class="warning-text-modern">'+w.message+severityBadge+'</div>';
if(w.editable){html+='<div class="warning-edit-modern"><label>'+w.editLabel+':</label><div class="input-group"><input type="number" id="edit-'+j+'" value="'+w.currentValue+'" min="'+w.minValue+'" max="'+w.maxValue+'"><span class="input-unit">عبوة</span></div></div>';}
html+='</div></div>';}
html+='</div><div class="warning-actions-modern"><button class="warning-btn-modern warning-accept" onclick="window.acceptWarnings()"><svg width="18" height="18" fill="currentColor"><path d="M9 0C4.03 0 0 4.03 0 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM7 13L3 9l1.41-1.41L7 10.17l6.59-6.59L15 5l-8 8z"/></svg>تطبيق</button><button class="warning-btn-modern warning-cancel" onclick="window.cancelWarnings()"><svg width="18" height="18" fill="currentColor"><path d="M9 0C4.03 0 0 4.03 0 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm4.5 12.09l-1.41 1.41L9 10.41 5.91 13.5 4.5 12.09 7.59 9 4.5 5.91 5.91 4.5 9 7.59l3.09-3.09 1.41 1.41L10.41 9l3.09 3.09z"/></svg>إلغاء</button></div></div>';
var overlay=document.createElement('div');overlay.id='warning-overlay';overlay.innerHTML=html;
overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
document.body.appendChild(overlay);window.warningCallback=callback;
};

window.acceptWarnings=function(){var edits={};var inputs=document.querySelectorAll('[id^="edit-"]');for(var i=0;i<inputs.length;i++){var id=inputs[i].id.replace('edit-','');edits[id]=parseInt(inputs[i].value);}for(var key in edits){if(warningQueue[key]&&warningQueue[key].onEdit){warningQueue[key].onEdit(edits[key]);}}var overlay=document.getElementById('warning-overlay');if(overlay){overlay.classList.add('closing');setTimeout(function(){overlay.remove();},200);}if(window.warningCallback)window.warningCallback();};
window.cancelWarnings=function(){var overlay=document.getElementById('warning-overlay');if(overlay){overlay.classList.add('closing');setTimeout(function(){overlay.remove();},200);}};

/* ======= POST-PROCESS: MERGE DUPLICATES ======= */
window.ezMergeDuplicates=function(){
try{
var tb=findTable();if(!tb){ezShowToast('لم يتم العثور على جدول الأدوية','error');return;}
var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td'),ci=findColIdx(hs,'code'),qi=findColIdx(hs,'qty');
if(ci<0||qi<0){ezShowToast('لم يتم العثور على أعمدة الجدول المطلوبة','error');return;}
var rows=tb.querySelectorAll('tr');var codeMap={};var mergedCount=0;
for(var r=1;r<rows.length;r++){
var cells=rows[r].querySelectorAll('td');if(cells.length===0)continue;
var code=normL(getCell(cells[ci]));if(!code)continue;
if(codeMap[code]){
var existingRow=codeMap[code];var existingQty=parseInt(getCell(existingRow.cells[qi]))||0;var currentQty=parseInt(getCell(cells[qi]))||0;
setCell(existingRow.cells[qi],existingQty+currentQty);rows[r].remove();mergedCount++;
}else{codeMap[code]=rows[r];}
}
ezShowToast('تم دمج '+mergedCount+' صنف مكرر','success');ezClosePost();
}catch(e){ezShowToast('خطأ في الدمج: '+e.message,'error');}
};

/* ======= POST-PROCESS: NEXT MONTH ======= */
window.ezNextMonth=function(){
try{
var tb=findTable();if(!tb){ezShowToast('لم يتم العثور على جدول الأدوية','error');return;}
var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td'),sdi=findColIdx(hs,'startdate'),ei=findColIdx(hs,'enddate');
if(sdi<0||ei<0){ezShowToast('لم يتم العثور على أعمدة التاريخ','error');return;}
var rows=tb.querySelectorAll('tr');var updatedCount=0;
for(var r=1;r<rows.length;r++){
var cells=rows[r].querySelectorAll('td');if(cells.length===0)continue;
var startDate=getCell(cells[sdi]);var endDate=getCell(cells[ei]);
if(startDate){var sd=parseDate(startDate);if(sd){setCell(cells[sdi],formatDate(addMonths(sd,1)));updatedCount++;}}
if(endDate){var ed=parseDate(endDate);if(ed){setCell(cells[ei],formatDate(addMonths(ed,1)));}}
}
monthCounter++;
ezShowToast('تم الانتقال للشهر التالي ('+updatedCount+' صنف)','success');
var counterDisplay=document.getElementById('month-counter-display');
if(counterDisplay){counterDisplay.textContent=monthCounter;}
}catch(e){ezShowToast('خطأ: '+e.message,'error');}
};

/* ======= POST-PROCESS: RESET MONTH ======= */
window.ezResetMonth=function(){
try{
if(!originalStartDate){ezShowToast('لم يتم حفظ التاريخ الأصلي','warning');return;}
var tb=findTable();if(!tb){ezShowToast('لم يتم العثور على جدول الأدوية','error');return;}
var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td'),sdi=findColIdx(hs,'startdate');
if(sdi<0){ezShowToast('لم يتم العثور على عمود تاريخ البداية','error');return;}
var rows=tb.querySelectorAll('tr');var resetCount=0;
for(var r=1;r<rows.length;r++){
var cells=rows[r].querySelectorAll('td');if(cells.length>sdi){setCell(cells[sdi],originalStartDate);resetCount++;}
}
monthCounter=0;
var counterDisplay=document.getElementById('month-counter-display');
if(counterDisplay){counterDisplay.textContent='0';}
ezShowToast('تم إعادة تعيين التواريخ ('+resetCount+' صنف)','success');
}catch(e){ezShowToast('خطأ: '+e.message,'error');}
};

/* ======= MAIN SUBMIT & PROCESS ======= */
window.ezSubmit=function(){
try{
var d=document.getElementById('ez-dialog-box');if(!d)return;
var m=parseInt(d.getAttribute('data-m'))||1;
var t=parseInt(d.getAttribute('data-t'))||30;
var autoDuration=document.getElementById('auto-duration')?document.getElementById('auto-duration').checked:true;
var enableWarnings=document.getElementById('show-warnings')?document.getElementById('show-warnings').checked:true;
var showPostDialog=document.getElementById('show-post-dialog')?document.getElementById('show-post-dialog').checked:false;

d.classList.add('closing');setTimeout(function(){d.remove();},200);
var loader=document.createElement('div');loader.id='ez-loader';
loader.innerHTML='<div class="ez-loader-container"><div class="ez-loader-spinner"></div><div class="ez-loader-ring"></div></div><div class="ez-loader-text">جاري المعالجة بالذكاء الاصطناعي...</div><div class="ez-loader-subtext">تحليل الجرعات والكميات</div>';
loader.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:48px 72px;border-radius:24px;box-shadow:0 25px 70px rgba(0,0,0,0.4);z-index:99998;text-align:center;font-family:Cairo,sans-serif;color:#fff;';
document.body.appendChild(loader);
setTimeout(function(){if(loader)loader.remove();processTable(m,t,autoDuration,enableWarnings,showPostDialog);},800);
}catch(e){ezShowToast("خطأ: "+e.message,'error');}
};

window.processTable=function(months,daysInMonth,autoDuration,enableWarnings,showPostDialog){
try{
warningQueue=[];monthCounter=0;duplicatedRows=[];duplicatedCount=0;
var tb=findTable();
if(!tb){ezShowToast('لم يتم العثور على جدول الأدوية','error');return;}

var h=tb.querySelector('tr'),hs=h.querySelectorAll('th,td');
var ci=findColIdx(hs,'code'),si=findColIdx(hs,'size'),ni=findColIdx(hs,'note'),ei=findColIdx(hs,'enddate'),qi=findColIdx(hs,'qty'),sdi=findColIdx(hs,'startdate'),ii=findColIdx(hs,'item');
if(ci<0||ei<0||qi<0){ezShowToast('لم يتم العثور على الأعمدة المطلوبة في الجدول','error');return;}

var rows=tb.querySelectorAll('tr');
var firstDate=null;
for(var r=1;r<rows.length;r++){
var cs=rows[r].querySelectorAll('td');
if(cs.length>0&&sdi>=0&&cs[sdi]){var sd=getCell(cs[sdi]);if(sd){firstDate=parseDate(sd);if(firstDate){originalStartDate=formatDate(firstDate);break;}}}
}

var processedCodes={};var totalRows=0;
for(var k=1;k<rows.length;k++){
var row=rows[k];var cells=row.querySelectorAll('td');if(cells.length===0)continue;
totalRows++;
var code=normL(getCell(cells[ci]));
var itemName=ii>=0?normL(getCell(cells[ii])):'';
var quantity=parseInt(getCell(cells[qi]))||0;
var size=parseInt(getCell(cells[si]))||0;
var notes=ni>=0?getCell(cells[ni]):'';
var isWeekly=weeklyInjections.indexOf(code)>-1;
var usedMonths=months;var usedDays=daysInMonth;
var extracted=null;

if(autoDuration&&notes){
extracted=smartExtractDuration(notes,months,daysInMonth);
if(extracted.source==='extracted'){
usedMonths=extracted.months;
usedDays=extracted.days;
if(extracted.confidence==='high'&&ni>=0&&cells[ni]){
var badge=cells[ni].querySelector('.ai-badge');
if(!badge){
badge=document.createElement('span');badge.className='ai-badge';
var badgeText='AI';
if(extracted.timesPerDay){badgeText+=' '+extracted.timesPerDay+'x';}
if(extracted.dosePerTime){badgeText+=' '+extracted.dosePerTime+'dose';}
badge.title='تم استخراج: '+extracted.extractionLog.join(' | ');
badge.innerHTML='✨ '+badgeText;
cells[ni].appendChild(badge);
}
}
}
}

var validation=smartValidateDose(code,quantity,size,notes);
if(enableWarnings&&validation.warnings.length>0){
for(var v=0;v<validation.warnings.length;v++){warningQueue.push(validation.warnings[v]);}
}

var expectedSize=fixedSizeCodes[code];

/* Smart quantity calculation */
var calculatedQty=0;
if(isWeekly){
/* Weekly injection: weeks per duration */
if(extracted&&extracted.frequency==='weekly'&&extracted.timesPerDay){
calculatedQty=Math.ceil(usedMonths*4*extracted.timesPerDay);
}else{
calculatedQty=Math.ceil(usedMonths*4);
}
}else if(extracted&&extracted.totalDailyDose!==null&&extracted.totalDailyDose>0){
/* AI-calculated: totalDailyDose * days / packageSize */
var packageSize=expectedSize||size||1;
var totalUnits=extracted.totalDailyDose*usedMonths*usedDays;
calculatedQty=Math.ceil(totalUnits/packageSize);
if(calculatedQty<1)calculatedQty=1;
}else if(extracted&&extracted.timesPerDay&&extracted.dosePerTime){
var packageSize2=expectedSize||size||1;
var dailyUnits=extracted.timesPerDay*extracted.dosePerTime;
var totalUnits2=dailyUnits*usedMonths*usedDays;
calculatedQty=Math.ceil(totalUnits2/packageSize2);
if(calculatedQty<1)calculatedQty=1;
}else{
/* Fallback: basic calculation */
var effectiveSize=expectedSize||size||1;
calculatedQty=Math.ceil((usedMonths*usedDays)/effectiveSize);
if(calculatedQty<1)calculatedQty=1;
}

if(processedCodes[code]){processedCodes[code].count++;processedCodes[code].totalQty+=quantity;duplicatedRows.push(k);duplicatedCount++;}
else{processedCodes[code]={count:1,totalQty:quantity};}

setCell(cells[qi],calculatedQty);
if(ei>=0&&firstDate){var newEnd=addMonths(firstDate,usedMonths);setCell(cells[ei],formatDate(newEnd));}
}

var uniqueCount=Object.keys(processedCodes).length;
if(enableWarnings&&warningQueue.length>0){
showWarningDialog(warningQueue,function(){showPostProcessDialog(totalRows,uniqueCount,duplicatedCount,showPostDialog);});
}else{
showPostProcessDialog(totalRows,uniqueCount,duplicatedCount,showPostDialog);
}
}catch(e){ezShowToast('خطأ في المعالجة: '+e.message,'error');}
};

/* ======= POST-PROCESS DIALOG ======= */
function showPostProcessDialog(totalRows,uniqueItems,duplicates,show){
if(!show){ezShowToast('تمت المعالجة بنجاح: '+totalRows+' صف، '+uniqueItems+' صنف فريد','success',4000);return;}
var duplicateInfo=duplicates>0?'<div class="post-stat-item duplicate"><div class="post-stat-icon">⚡</div><div class="post-stat-value">'+duplicates+'</div><div class="post-stat-label">صنف مقسم</div></div>':'';
var html='<div class="post-dialog-header"><div class="post-dialog-title">خيارات ما بعد المعالجة</div><button class="post-minimize-btn" onclick="window.ezMinimizePost()"><svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg></button><button class="post-close-btn" onclick="window.ezClosePost()">✕</button></div><div class="post-content"><div class="post-stats-container"><div class="post-stat-item total"><div class="post-stat-icon">📋</div><div class="post-stat-value">'+totalRows+'</div><div class="post-stat-label">إجمالي الأصناف</div></div><div class="post-stat-item unique"><div class="post-stat-icon">✨</div><div class="post-stat-value">'+uniqueItems+'</div><div class="post-stat-label">أصناف فريدة</div></div>'+duplicateInfo+'</div><div class="post-actions-container">';
if(duplicates>0){html+='<button class="post-action-btn merge-btn" onclick="window.ezMergeDuplicates()"><svg width="20" height="20" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg><span>دمج المكررات</span></button>';}
html+='<button class="post-action-btn next-month-btn" onclick="window.ezNextMonth()"><svg width="20" height="20" fill="currentColor"><path d="M9 1v2h4.59L9 7.59 10.41 9 15 4.41V9h2V1H9zM5 7L0.41 11.59V7H2V15h8v-2H5.41L10 8.41 8.59 7 5 10.59z"/></svg><span>الشهر التالي</span><span id="month-counter-display" class="month-counter">0</span></button><button class="post-action-btn reset-btn" onclick="window.ezResetMonth()"><svg width="20" height="20" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg><span>إعادة التعيين</span></button></div></div>';
var dialog=document.createElement('div');dialog.id='ez-post-dialog';dialog.innerHTML=html;
dialog.style.cssText='position:fixed;top:80px;right:20px;background:linear-gradient(145deg,#fff 0%,#f8f9fa 100%);border-radius:20px;padding:0;box-shadow:0 20px 60px rgba(0,0,0,0.25);z-index:99997;font-family:Cairo,sans-serif;min-width:380px;max-width:420px;animation:slideUp 0.3s ease;';
document.body.appendChild(dialog);makeDraggable(dialog);
}

/* ======= MAKE DRAGGABLE ======= */
function makeDraggable(el){var pos1=0,pos2=0,pos3=0,pos4=0;var header=el.querySelector('.ez-header, .post-dialog-header');if(header){header.onmousedown=dragMouseDown;}function dragMouseDown(e){e=e||window.event;e.preventDefault();pos3=e.clientX;pos4=e.clientY;document.onmouseup=closeDragElement;document.onmousemove=elementDrag;}function elementDrag(e){e=e||window.event;e.preventDefault();pos1=pos3-e.clientX;pos2=pos4-e.clientY;pos3=e.clientX;pos4=e.clientY;el.style.top=(el.offsetTop-pos2)+'px';el.style.left=(el.offsetLeft-pos1)+'px';}function closeDragElement(){document.onmouseup=null;document.onmousemove=null;}}

/* ======= STYLES ======= */
var s_style=document.createElement('style');
s_style.innerHTML='@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap");@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}@keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.05);opacity:0.8;}}.ez-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fff 0%,#f8f9fa 100%);border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,0.25),0 0 1px rgba(0,0,0,0.3);z-index:99999;font-family:Cairo,sans-serif;min-width:420px;max-width:500px;animation:slideUp 0.3s ease;}.ez-dialog.closing{animation:slideUp 0.2s ease reverse;}.ez-header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:18px 22px;border-radius:24px 24px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:move;box-shadow:0 4px 12px rgba(102,126,234,0.3);}.ez-title{font-size:19px;font-weight:900;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2);}.ez-version{background:rgba(255,255,255,0.25);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-left:8px;}.ez-minimize-btn{background:rgba(255,255,255,0.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;}.ez-minimize-btn:hover{background:rgba(255,255,255,0.35);transform:scale(1.1);}.ez-content{padding:20px;}.mode-section{margin-bottom:16px;}.mode-title{font-size:15px;font-weight:800;color:#1e293b;padding:10px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:10px;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;gap:8px;}.options-section{display:block;}.months-section,.days-section{margin-bottom:14px;}.ez-section-title{font-size:12px;font-weight:700;color:#475569;margin-bottom:8px;text-align:center;}.ez-pill-container{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}.ez-pill{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border:2px solid #cbd5e1;padding:10px 22px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;color:#334155;transition:all 0.3s;text-align:center;min-width:55px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}.ez-pill:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15);border-color:#94a3b8;}.ez-pill.selected{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#fff;border-color:#1d4ed8;box-shadow:0 4px 16px rgba(59,130,246,0.4);}.ez-options-group{background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:12px;padding:12px;margin:14px 0;border:1.5px solid #86efac;}.ez-options-group .ez-options-title{font-size:12px;font-weight:800;color:#166534;margin-bottom:10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;}.ez-checkbox-line{display:flex;align-items:center;margin:6px 0;padding:8px 10px;background:#fff;border-radius:8px;cursor:pointer;transition:all 0.3s;border:1.5px solid #e5e7eb;position:relative;}.ez-checkbox-line:hover{background:#f0fdf4;border-color:#86efac;transform:translateX(-2px);}.ez-checkbox-line input[type="checkbox"]{position:absolute;opacity:0;width:0;height:0;}.ez-checkbox-custom{width:18px;height:18px;border:2px solid #cbd5e1;border-radius:5px;margin:0 8px 0 0;position:relative;transition:all 0.3s;background:#fff;flex-shrink:0;}.ez-checkbox-line input[type="checkbox"]:checked+.ez-checkbox-custom{background:linear-gradient(135deg,#10b981,#059669);border-color:#059669;box-shadow:0 0 0 2px rgba(16,185,129,0.2);}.ez-checkbox-custom::after{content:"✓";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);color:#fff;font-size:12px;font-weight:900;transition:all 0.2s;}.ez-checkbox-line input[type="checkbox"]:checked+.ez-checkbox-custom::after{transform:translate(-50%,-50%) scale(1);}.ez-checkbox-label{font-size:12px;color:#1e293b;font-weight:700;flex:1;}.ez-checkbox-icon{font-size:14px;margin-left:4px;opacity:0.8;}.ez-buttons-container{display:flex;gap:10px;margin-top:16px;}.ez-btn{flex:1;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.1);}.ez-submit-btn{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;}.ez-submit-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,0.4);}.ez-cancel-btn{background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);color:#64748b;}.ez-cancel-btn:hover{background:linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 100%);transform:translateY(-2px);}.ez-credit{font-size:10px;color:#94a3b8;margin-top:12px;padding-top:10px;border-top:2px solid #f1f5f9;font-weight:700;text-align:center;}.ai-badge{display:inline-block;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:800;margin-right:6px;vertical-align:middle;box-shadow:0 2px 6px rgba(168,85,247,0.3);animation:pulse 2s infinite;}.warning-dialog{background:#fff;border-radius:20px;padding:24px;max-width:560px;max-height:80vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.35);font-family:Cairo,sans-serif;animation:slideUp 0.3s ease;}.warning-header-modern{text-align:center;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #fee2e2;position:relative;}.warning-pulse{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:60px;height:60px;background:radial-gradient(circle,rgba(239,68,68,0.3),transparent);border-radius:50%;animation:pulse 2s infinite;}.warning-icon-modern{font-size:40px;margin-bottom:6px;animation:pulse 1.5s infinite;}.warning-title-modern{font-size:18px;font-weight:900;color:#dc2626;}.warning-stats{display:flex;gap:10px;justify-content:center;margin-top:10px;}.warning-stats span{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;}.stat-critical{background:#fecaca;color:#991b1b;}.stat-warning{background:#fed7aa;color:#9a3412;}.stat-info{background:#bfdbfe;color:#1e40af;}.warning-list-modern{margin:16px 0;max-height:350px;overflow-y:auto;}.warning-item-modern{background:#f8fafc;border-radius:10px;padding:14px;margin:10px 0;position:relative;padding-right:20px;transition:all 0.3s;}.warning-item-modern:hover{transform:translateX(-3px);box-shadow:0 4px 12px rgba(0,0,0,0.1);}.warning-item-modern.warning-danger{background:linear-gradient(135deg,#fef2f2,#fee2e2);border-right:4px solid #dc2626;}.warning-item-modern.warning-warning{background:linear-gradient(135deg,#fffbeb,#fef3c7);border-right:4px solid #f59e0b;}.warning-item-modern.warning-info{background:linear-gradient(135deg,#eff6ff,#dbeafe);border-right:4px solid #3b82f6;}.warning-indicator{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;animation:pulse 2s infinite;}.warning-danger .warning-indicator{background:#dc2626;}.warning-warning .warning-indicator{background:#f59e0b;}.warning-info .warning-indicator{background:#3b82f6;}.warning-content{padding-right:6px;}.warning-text-modern{font-size:12px;color:#1e293b;margin-bottom:8px;font-weight:700;line-height:1.5;}.severity-badge{display:inline-block;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:800;margin-right:6px;vertical-align:middle;}.severity-badge.critical{background:#dc2626;color:#fff;}.severity-badge.high{background:#f59e0b;color:#fff;}.severity-badge.medium{background:#3b82f6;color:#fff;}.warning-edit-modern{margin-top:10px;background:#fff;padding:10px;border-radius:6px;border:1.5px solid #e5e7eb;}.warning-edit-modern label{display:block;font-size:11px;color:#64748b;margin-bottom:6px;font-weight:700;}.input-group{display:flex;align-items:center;gap:6px;}.warning-edit-modern input{flex:1;padding:8px 10px;border:2px solid #cbd5e1;border-radius:6px;font-size:14px;font-weight:700;font-family:Cairo,sans-serif;}.warning-edit-modern input:focus{border-color:#3b82f6;outline:none;box-shadow:0 0 0 2px rgba(59,130,246,0.1);}.input-unit{font-size:11px;color:#64748b;font-weight:700;padding:8px;background:#f8fafc;border-radius:5px;}.warning-actions-modern{display:flex;gap:10px;margin-top:20px;}.warning-btn-modern{flex:1;padding:12px 16px;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:6px;}.warning-accept{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3);}.warning-accept:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,0.4);}.warning-cancel{background:linear-gradient(135deg,#f1f5f9,#e2e8f0);color:#64748b;}.warning-cancel:hover{background:linear-gradient(135deg,#e2e8f0,#cbd5e1);transform:translateY(-2px);}.ez-toast{position:fixed;bottom:30px;right:30px;background:#fff;padding:14px 20px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.25);z-index:999999;display:flex;align-items:center;gap:12px;font-family:Cairo,sans-serif;transform:translateX(500px);opacity:0;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);min-width:280px;}.ez-toast.show{transform:translateX(0);opacity:1;}.ez-toast.closing{transform:translateX(500px);opacity:0;}.ez-toast-icon{font-size:20px;display:flex;align-items:center;}.ez-toast-icon svg{width:24px;height:24px;}.ez-toast-msg{font-size:13px;font-weight:700;color:#1e293b;flex:1;}.ez-toast-progress{position:absolute;bottom:0;left:0;height:3px;background:currentColor;width:100%;animation:progress 3s linear;border-radius:0 0 14px 14px;}@keyframes progress{from{width:100%;}to{width:0%;}}.ez-toast-success{border-right:4px solid #10b981;}.ez-toast-success .ez-toast-icon{color:#10b981;}.ez-toast-error{border-right:4px solid #ef4444;}.ez-toast-error .ez-toast-icon{color:#ef4444;}.ez-toast-info{border-right:4px solid #3b82f6;}.ez-toast-info .ez-toast-icon{color:#3b82f6;}.ez-toast-warning{border-right:4px solid #f59e0b;}.ez-toast-warning .ez-toast-icon{color:#f59e0b;}.ez-loader{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:48px 72px;border-radius:24px;box-shadow:0 25px 70px rgba(102,126,234,0.5);z-index:99998;text-align:center;font-family:Cairo,sans-serif;color:#fff;}.ez-loader-container{position:relative;width:70px;height:70px;margin:0 auto 16px;}.ez-loader-spinner{width:70px;height:70px;border:5px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;}.ez-loader-ring{position:absolute;top:0;left:0;width:70px;height:70px;border:5px solid transparent;border-top-color:rgba(255,255,255,0.5);border-radius:50%;animation:spin 1.5s linear infinite reverse;}@keyframes spin{to{transform:rotate(360deg);}}.ez-loader-text{font-size:15px;font-weight:900;margin-bottom:6px;text-shadow:0 2px 4px rgba(0,0,0,0.2);}.ez-loader-subtext{font-size:11px;font-weight:600;opacity:0.9;}#ez-post-dialog{position:fixed;top:80px;right:20px;background:linear-gradient(145deg,#fff 0%,#f8f9fa 100%);border-radius:20px;padding:0;box-shadow:0 20px 60px rgba(0,0,0,0.25);z-index:99997;font-family:Cairo,sans-serif;min-width:360px;max-width:400px;animation:slideUp 0.3s ease;}#ez-post-dialog.closing{animation:slideUp 0.2s ease reverse;}.post-dialog-header{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:14px 18px;border-radius:20px 20px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:move;box-shadow:0 4px 12px rgba(16,185,129,0.3);}.post-dialog-title{font-size:15px;font-weight:900;}.post-minimize-btn,.post-close-btn{background:rgba(255,255,255,0.2);border:none;color:#fff;width:26px;height:26px;border-radius:6px;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;margin-left:6px;font-size:15px;font-weight:700;}.post-minimize-btn:hover,.post-close-btn:hover{background:rgba(255,255,255,0.35);transform:scale(1.1);}.post-content{padding:16px;}.post-stats-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:10px;margin-bottom:16px;}.post-stat-item{background:linear-gradient(135deg,#f8fafc,#e2e8f0);padding:12px;border-radius:10px;text-align:center;border:2px solid #cbd5e1;transition:all 0.3s;}.post-stat-item:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1);}.post-stat-item.total{background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-color:#3b82f6;}.post-stat-item.unique{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-color:#10b981;}.post-stat-item.duplicate{background:linear-gradient(135deg,#fed7aa,#fdba74);border-color:#f59e0b;}.post-stat-icon{font-size:20px;margin-bottom:4px;}.post-stat-value{font-size:24px;font-weight:900;color:#1e293b;margin-bottom:2px;}.post-stat-label{font-size:10px;font-weight:700;color:#64748b;}.post-actions-container{display:flex;flex-direction:column;gap:8px;}.post-action-btn{background:linear-gradient(135deg,#f8fafc,#e2e8f0);border:2px solid #cbd5e1;padding:10px 14px;border-radius:10px;font-size:12px;font-weight:700;color:#334155;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;display:flex;align-items:center;justify-content:space-between;gap:8px;}.post-action-btn:hover{transform:translateX(-3px);box-shadow:0 4px 12px rgba(0,0,0,0.1);}.post-action-btn svg{width:18px;height:18px;flex-shrink:0;}.post-action-btn span{flex:1;text-align:right;}.merge-btn:hover{background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-color:#3b82f6;color:#1e40af;}.next-month-btn:hover{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-color:#10b981;color:#065f46;}.reset-btn:hover{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#ef4444;color:#991b1b;}.month-counter{background:rgba(0,0,0,0.1);padding:3px 8px;border-radius:10px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:3px;margin-right:6px;}table td,table th{border:1px solid #bbb!important}';
document.head.appendChild(s_style);

/* ======= MAIN DIALOG HTML ======= */
var d_box=document.createElement('div');d_box.id='ez-dialog-box';d_box.className='ez-dialog';
d_box.setAttribute('data-m','1');d_box.setAttribute('data-t','30');d_box.setAttribute('data-extraction-mode','manual');
d_box.innerHTML='<div class="ez-header"><div class="ez-title">'+APP_NAME+'</div><div style="display:flex;align-items:center;gap:8px;"><button class="ez-minimize-btn" onclick="window.ezMinimize()"><svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg></button><div class="ez-version">v'+APP_VERSION+'</div></div></div><div class="ez-content"><div class="mode-section"><div class="mode-title">✨ وضع المعالجة الذكي</div></div><div class="options-section"><div class="months-section"><div class="ez-section-title">📅 عدد الأشهر</div><div class="ez-pill-container"><div class="ez-pill selected" onclick="window.ezSelect(this,\'m\',1)">1</div><div class="ez-pill" onclick="window.ezSelect(this,\'m\',2)">2</div><div class="ez-pill" onclick="window.ezSelect(this,\'m\',3)">3</div></div></div><div class="days-section"><div class="ez-section-title">📆 عدد الأيام في الشهر</div><div class="ez-pill-container"><div class="ez-pill" onclick="window.ezSelect(this,\'t\',28)">28</div><div class="ez-pill selected" onclick="window.ezSelect(this,\'t\',30)">30</div></div></div></div><div class="ez-options-group"><div class="ez-options-title">⚙️ خيارات ذكية</div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="auto-duration" checked><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">استخراج المدة والجرعات من الملاحظات</label><span class="ez-checkbox-icon">🤖</span></div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="show-warnings" checked><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">عرض تحذيرات التحقق الذكي</label><span class="ez-checkbox-icon">🛡️</span></div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="show-post-dialog"><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">خيارات ما بعد المعالجة (دمج - شهر تالي)</label><span class="ez-checkbox-icon">⚙️</span></div></div><div class="ez-buttons-container"><button class="ez-btn ez-submit-btn" onclick="window.ezSubmit()">⚡ بدء المعالجة الذكية</button><button class="ez-btn ez-cancel-btn" onclick="window.ezCancel()">✖ إلغاء</button></div></div><div class="ez-credit">مطور الكود علي الباز | v'+APP_VERSION+' Farmadosis AI Enhanced</div>';

document.body.appendChild(d_box);
document.addEventListener('keydown',function(e){if(e.key==='Enter'){var sub=document.querySelector('.ez-submit-btn');if(sub)sub.click();}else if(e.key==='Escape'){var can=document.querySelector('.ez-cancel-btn');if(can)can.click();}});
makeDraggable(d_box);
})();

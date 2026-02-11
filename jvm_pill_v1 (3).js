javascript:(function(){
var APP_VERSION='1.0';
var APP_NAME='JVM Pill Pro';

/* ══════════════════════════════════════════
   FIXED SIZE CODES DATABASE
   ══════════════════════════════════════════ */
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
   LANGUAGE DETECTION - IMPROVED
   ══════════════════════════════════════════ */
function detectLanguage(text){
  if(!text) return 'arabic';
  var arabicCount=(text.match(/[\u0600-\u06FF]/g)||[]).length;
  var englishCount=(text.match(/[a-zA-Z]/g)||[]).length;
  // Ignore common medical abbreviations that appear in Arabic notes
  var medAbbrev=(text.match(/\b(mg|mcg|ml|kg|gr|gm|iu|bid|tid|qid|prn|tab|cap|pcs?)\b/gi)||[]).length;
  var adjustedEnglish=englishCount-(medAbbrev*3);
  if(adjustedEnglish>arabicCount && adjustedEnglish>5) return 'english';
  return 'arabic';
}

function setPatientLanguage(language){
  var langSelect=document.querySelector('select[name*="language" i], select[id*="language" i], #flanguage');
  if(langSelect){
    var targetValue=language==='english'?'English':'Arabic';
    var options=langSelect.options;
    for(var i=0;i<options.length;i++){
      if(options[i].text===targetValue||options[i].value===targetValue||
         options[i].text.toLowerCase()===targetValue.toLowerCase()){
        langSelect.selectedIndex=i;
        fireEvent(langSelect);
        return true;
      }
    }
  }
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ══════════════════════════════════════════ */
window.ezShowToast=function(msg,type,duration){var t=document.createElement('div');t.className='ez-toast ez-toast-'+type;var icons={success:'<svg width="20" height="20" fill="currentColor"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"/></svg>',error:'<svg width="20" height="20" fill="currentColor"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg>',info:'<svg width="20" height="20" fill="currentColor"><circle cx="10" cy="10" r="9"/><path fill="#fff" d="M9 5h2v2H9zm0 4h2v6H9z"/></svg>',warning:'<svg width="20" height="20" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'};t.innerHTML='<div class="ez-toast-icon">'+icons[type]+'</div><div class="ez-toast-msg">'+msg+'</div><div class="ez-toast-progress"></div>';document.body.appendChild(t);setTimeout(function(){t.classList.add('show');},10);var timeout=duration||3000;setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},300);},timeout);};

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

window.ezMinimize=function(){var d=document.getElementById('ez-dialog-box');if(d){var content=d.querySelector('.ez-content');var minBtn=d.querySelector('.ez-minimize-btn');if(content.style.display==='none'){content.style.display='block';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg>';d.style.width='auto';}else{content.style.display='none';minBtn.innerHTML='<svg width="14" height="14" fill="currentColor"><path d="M7 0v14M0 7h14"/></svg>';d.style.width='380px';}}};

window.ezSelect=function(el,type,val){
  var p=el.parentNode;
  var pills=p.querySelectorAll('.ez-pill');
  for(var i=0;i<pills.length;i++) pills[i].classList.remove('selected');
  el.classList.add('selected');
  var d=document.getElementById('ez-dialog-box');
  if(type==='m') d.setAttribute('data-m',val);
  else d.setAttribute('data-t',val);
};

/* ══════════════════════════════════════════
   WARNING SYSTEM
   ══════════════════════════════════════════ */
window.showWarnings=function(warnings,callback){
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
    d.remove();
    var loader=document.createElement('div');
    loader.id='ez-loader';
    loader.innerHTML='<div class="ez-loader-spinner"></div><div class="ez-loader-text">جاري المعالجة...</div>';
    loader.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.98);padding:40px 60px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:99998;text-align:center;font-family:Cairo,sans-serif;';
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
   UNDO DUPLICATES
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
      var code=get(r.querySelectorAll('td')[ci]).trim();
      if(code){if(!groups[code])groups[code]=[];groups[code].push(r);}
    });

    var foundDuplicates=false;
    Object.keys(groups).forEach(function(code){
      var g=groups[code],n=g.length;
      if(n>1){
        foundDuplicates=true;
        var master=g[0],tds=master.querySelectorAll('td');
        var curS=parseInt(get(tds[si]))||0;
        var mult=n;
        var ev=(n===2?12:8);
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
    else window.ezShowToast('لا يوجد صفوف مكررة','info');
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
    var endDateStr='';
    for(var i=1;i<rows.length;i++){
      var tds=rows[i].querySelectorAll('td');
      if(tds.length>edi){
        var inp=tds[edi].querySelector('input');
        var ev=inp?inp.value:tds[edi].textContent.trim();
        if(ev&&ev.match(/\d{4}-\d{2}-\d{2}/)){endDateStr=ev;break;}
      }
    }
    if(endDateStr){
      var newStart=addDays(endDateStr,1);
      sDateElem.value=newStart;
      fireEv(sDateElem);
      rows.forEach(function(r,ix){
        if(ix===0)return;
        var sInput=r.querySelectorAll('td')[si]?r.querySelectorAll('td')[si].querySelector('input,textarea'):null;
        if(sInput) fireEv(sInput);
      });
      setTimeout(function(){
        for(var i=1;i<rows.length;i++){
          var tds=rows[i].querySelectorAll('td');
          if(tds.length>edi){
            var inp=tds[edi].querySelector('input');
            var edVal=inp?inp.value:tds[edi].textContent.trim();
            if(edVal&&/\d{4}-\d{2}-\d{2}/.test(edVal)){
              var newEdVal=addDays(edVal,-1);
              if(inp){inp.value=newEdVal;fireEv(inp);}
              else{tds[edi].textContent=newEdVal;}
            }
          }
        }
      },500);
      btn.innerHTML=(monthCounter===1)?'📅 الشهر الثالث':'🖨️ تجميع للطباعة';
      btn.style.background=(monthCounter===1)?'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)':'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
      btn.style.color=(monthCounter===1)?'#4a148c':'#bf360c';
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
    btn.style.background='linear-gradient(135deg, #2ecc71, #27ae60)';
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
    if(!el)return;
    el.focus();
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
  try{
    if(!el) return;
    el.focus();
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('blur',{bubbles:true}));
  } catch(e){}
}

function getValue(td){
  if(!td) return '';
  var inp=td.querySelector('input');
  var sel=td.querySelector('select');
  var txt=td.querySelector('textarea');
  if(inp&&inp.value) return inp.value.trim();
  if(sel&&sel.value) return sel.value.trim();
  if(txt&&txt.value) return txt.value.trim();
  return td.textContent.trim();
}

function addDays(dateStr,days){
  var d=new Date(dateStr);
  d.setDate(d.getDate()+days);
  var y=d.getFullYear();
  var m=('0'+(d.getMonth()+1)).slice(-2);
  var day=('0'+d.getDate()).slice(-2);
  return y+'-'+m+'-'+day;
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
    var pat=patterns[i];
    pat.r.lastIndex=0;
    var m;
    while((m=pat.r.exec(cleaned))!==null){
      var num=parseInt(m[1]);
      if(num>0&&num<=500) allMatches.push({val:num,pri:pat.p,pos:m.index,name:pat.n});
    }
  }
  if(allMatches.length===0) return null;
  allMatches.sort(function(a,b){
    if(a.pri!==b.pri) return a.pri-b.pri;
    return b.pos-a.pos;
  });
  return allMatches[0].val;
}

/* ══════════════════════════════════════════
   DAY OF WEEK EXTRACTION
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
  for(var i=0;i<days.length;i++){
    var d=days[i];
    for(var j=0;j<d.ar.length;j++){if(s.indexOf(d.ar[j])>-1) return d.day;}
    for(var j=0;j<d.en.length;j++){if(sl.indexOf(d.en[j])>-1) return d.day;}
  }
  return null;
}

/* ══════════════════════════════════════════
   DURATION EXTRACTION - ENHANCED
   ══════════════════════════════════════════ */
function extractDuration(note){
  var s=note.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').trim();
  var result={hasDuration:false,days:null,isPRN:false,isUntilFinish:false,original:note};

  // PRN / as needed detection
  if(/عند الحاجه|عند اللزوم|prn|as\s*needed|when\s*needed|sos|عند الضرورة|if\s*needed|p\.r\.n/i.test(s)){
    result.isPRN=true;
    return result;
  }

  // Until finish detection
  if(/حتى (نفاد|انتهاء|انهاء|الشفاء)|until\s*(finish|complete|symptom|gone|resolved)|till\s*finish/i.test(s)){
    result.isUntilFinish=true;
    return result;
  }

  // Day-based patterns
  var dayPatterns=[
    {r:/لمده?\s*(\d+)\s*(يوم|ايام)/i,g:1},
    {r:/مده?\s*(\d+)\s*(يوم|ايام)/i,g:1},
    {r:/(\d+)\s*(يوم|ايام)\s*فقط/i,g:1},
    {r:/(\d+)\s*(يوم|ايام)/i,g:1},
    {r:/(\d+)\s*days?/i,g:1},
    {r:/for\s*(\d+)\s*days?/i,g:1},
    {r:/x\s*(\d+)\s*days?/i,g:1},
    {r:/duration[:\s]*(\d+)\s*days?/i,g:1}
  ];
  for(var i=0;i<dayPatterns.length;i++){
    var m=s.match(dayPatterns[i].r);
    if(m){result.hasDuration=true;result.days=parseInt(m[dayPatterns[i].g]);return result;}
  }

  // Week-based patterns
  var weekPatterns=[
    {r:/اسبوع واحد|واحد اسبوع|1\s*اسبوع|one\s*week|1\s*week/i,d:7},
    {r:/اسبوعين|2\s*اسبوع|two\s*weeks?|2\s*weeks?/i,d:14},
    {r:/ثلاث(ه)?\s*اسابيع|3\s*اسابيع|three\s*weeks?|3\s*weeks?/i,d:21},
    {r:/اربع(ه)?\s*اسابيع|4\s*اسابيع|four\s*weeks?|4\s*weeks?/i,d:28},
    {r:/شهر واحد|واحد شهر|1\s*شهر|one\s*month|1\s*month/i,d:30},
    {r:/شهرين|2\s*شهر|two\s*months?|2\s*months?/i,d:60},
    {r:/ثلاث(ه)?\s*اشهر|3\s*اشهر|three\s*months?|3\s*months?/i,d:90}
  ];
  for(var i=0;i<weekPatterns.length;i++){
    if(weekPatterns[i].r.test(s)){result.hasDuration=true;result.days=weekPatterns[i].d;return result;}
  }

  return result;
}

/* ══════════════════════════════════════════
   HOURLY INTERVAL EXTRACTION - ENHANCED
   ══════════════════════════════════════════ */
function extractHourlyInterval(note){
  var s=note.toLowerCase().trim();
  var result={hasInterval:false,hours:null,timesPerDay:null};

  var patterns=[
    {r:/كل\s*(\d+)\s*ساع(ه|ات|ة|ه)/i,g:1},
    {r:/every\s*(\d+)\s*hours?/i,g:1},
    {r:/q\s*(\d+)\s*h/i,g:1},
    {r:/(\d+)\s*hourly/i,g:1},
    {r:/(\d+)\s*hrly/i,g:1}
  ];

  for(var i=0;i<patterns.length;i++){
    var m=s.match(patterns[i].r);
    if(m){
      result.hasInterval=true;
      result.hours=parseInt(m[patterns[i].g]);
      result.timesPerDay=Math.floor(24/result.hours);
      return result;
    }
  }

  // Named interval shortcuts
  if(/q4h/i.test(s)){result.hasInterval=true;result.hours=4;result.timesPerDay=6;return result;}
  if(/q6h/i.test(s)){result.hasInterval=true;result.hours=6;result.timesPerDay=4;return result;}
  if(/q8h/i.test(s)){result.hasInterval=true;result.hours=8;result.timesPerDay=3;return result;}
  if(/q12h/i.test(s)){result.hasInterval=true;result.hours=12;result.timesPerDay=2;return result;}
  if(/q24h/i.test(s)){result.hasInterval=true;result.hours=24;result.timesPerDay=1;return result;}

  return result;
}

/* ══════════════════════════════════════════
   COLUMN REORDER HELPER
   ══════════════════════════════════════════ */
function moveColumnAfter(table,colToMove,colAfter){
  var rows=table.querySelectorAll('tr');
  for(var r=0;r<rows.length;r++){
    var cells=rows[r].querySelectorAll('th,td');
    if(cells.length<=Math.max(colToMove,colAfter)) continue;
    var cellToMove=cells[colToMove];
    var cellAfter=cells[colAfter];
    if(cellToMove&&cellAfter&&cellToMove.parentNode===cellAfter.parentNode){
      cellAfter.parentNode.insertBefore(cellToMove,cellAfter.nextSibling);
    }
  }
}

/* ══════════════════════════════════════════
   END DATE CONSISTENCY CHECK
   ══════════════════════════════════════════ */
function checkEndDateConsistency(){
  var tb=document.querySelector('table');
  if(!tb) return;
  var ths=tb.querySelectorAll('th');
  var ediIdx=-1;
  for(var i=0;i<ths.length;i++){
    if(ths[i].textContent.toLowerCase().includes('end')&&ths[i].textContent.toLowerCase().includes('date')){ediIdx=i;break;}
  }
  if(ediIdx<0) return;
  var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
  var dates={};
  var mostCommonDate='';
  var maxCount=0;
  rows.forEach(function(r){
    var tds=r.querySelectorAll('td');
    if(tds.length>ediIdx){
      var inp=tds[ediIdx].querySelector('input');
      var date=inp?inp.value:tds[ediIdx].textContent.trim();
      if(date&&/\d{4}-\d{2}-\d{2}/.test(date)){
        dates[date]=(dates[date]||0)+1;
        if(dates[date]>maxCount){maxCount=dates[date];mostCommonDate=date;}
      }
    }
  });
  if(Object.keys(dates).length>1) showEndDateAlert(mostCommonDate,ediIdx);
}

function showEndDateAlert(commonDate,ediIdx){
  var html='<div class="end-date-alert">'+
    '<div class="alert-header">⚠️ تحذير: تواريخ انتهاء مختلفة</div>'+
    '<div class="alert-body">تم اكتشاف صفوف بتواريخ انتهاء مختلفة.<br>هل تريد توحيد جميع التواريخ إلى: <strong>'+commonDate+'</strong>؟</div>'+
    '<div class="alert-actions">'+
    '<button class="alert-btn alert-fix" onclick="window.fixEndDates(\''+commonDate+'\','+ediIdx+')">✅ تعديل التاريخ</button>'+
    '<button class="alert-btn alert-cancel" onclick="window.closeEndDateAlert()">❌ إلغاء</button></div></div>';
  var overlay=document.createElement('div');
  overlay.id='end-date-overlay';
  overlay.innerHTML=html;
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);backdrop-filter:blur(5px);z-index:999999;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);
}

/* ══════════════════════════════════════════
   POST PROCESS DIALOG
   ══════════════════════════════════════════ */
function showPostProcessDialog(){
  var sdInput=document.querySelector('#fstartDate');
  if(sdInput) originalStartDate=sdInput.value;
  monthCounter=0;
  var dupInfo=duplicatedCount>0?
    '<div style="background:#dbeafe;padding:8px 12px;border-radius:8px;margin:10px 0;text-align:center;">'+
    '<span style="font-size:20px;">⚡</span> <span style="font-weight:700;color:#1e40af;">'+duplicatedCount+' صنف مقسم</span></div>':'';
  var dialog=document.createElement('div');
  dialog.id='ez-post-dialog';
  dialog.className='ez-post-draggable';
  dialog.style.cssText='position:fixed;top:80px;right:20px;background:linear-gradient(145deg,#fff 0%,#f8f9fa 100%);padding:18px 22px;border-radius:16px;box-shadow:0 15px 50px rgba(0,0,0,0.3),0 0 0 1px rgba(59,130,246,0.1);z-index:99998;border:2px solid rgba(59,130,246,0.2);font-family:Cairo,sans-serif;min-width:280px;max-width:320px;';
  dialog.innerHTML='<div class="ez-post-header" style="text-align:center;margin-bottom:12px;cursor:move;padding:6px;">'+
    '<div style="font-size:16px;font-weight:800;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;">⚙️ خيارات إضافية</div>'+
    '<button onclick="window.ezClosePost()" style="position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:16px;line-height:1;transition:all 0.3s;box-shadow:0 3px 10px rgba(239,68,68,0.3);" onmouseover="this.style.transform=\'scale(1.1) rotate(90deg)\'" onmouseout="this.style.transform=\'scale(1) rotate(0deg)\'">×</button></div>'+
    dupInfo+
    '<button id="ez-undo-btn" onclick="window.ezUndoDuplicates()" style="width:100%;padding:10px;margin:6px 0;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;box-shadow:0 3px 10px rgba(245,158,11,0.3);" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 5px 15px rgba(245,158,11,0.4)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 3px 10px rgba(245,158,11,0.3)\'">🔄 إلغاء التقسيم</button>'+
    '<button id="ez-next-month-btn" onclick="window.ezNextMonth()" style="width:100%;padding:10px;margin:6px 0;background:linear-gradient(135deg,#00C9FF,#92FE9D);color:#004d40;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;box-shadow:0 3px 10px rgba(0,201,255,0.3);" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 5px 15px rgba(0,201,255,0.4)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 3px 10px rgba(0,201,255,0.3)\'">🗓️ الشهر التالي (2)</button>';
  document.body.appendChild(dialog);
  makeDraggable(dialog);
}

/* ══════════════════════════════════════════
   DRAGGABLE FUNCTIONALITY
   ══════════════════════════════════════════ */
function makeDraggable(el){
  var pos1=0,pos2=0,pos3=0,pos4=0;
  var header=el.querySelector('.ez-post-header')||el.querySelector('.ez-header')||el;
  header.style.cursor='move';
  header.onmousedown=dragMouseDown;
  function dragMouseDown(e){
    e=e||window.event;e.preventDefault();
    pos3=e.clientX;pos4=e.clientY;
    document.onmouseup=closeDragElement;
    document.onmousemove=elementDrag;
  }
  function elementDrag(e){
    e=e||window.event;e.preventDefault();
    pos1=pos3-e.clientX;pos2=pos4-e.clientY;
    pos3=e.clientX;pos4=e.clientY;
    el.style.top=(el.offsetTop-pos2)+'px';
    el.style.left=(el.offsetLeft-pos1)+'px';
    el.style.right='auto';el.style.transform='none';
  }
  function closeDragElement(){document.onmouseup=null;document.onmousemove=null;}
}

/* ══════════════════════════════════════════
   ★★★ ADVANCED DOSE RECOGNIZER ★★★
   Core AI-level dose extraction engine
   ══════════════════════════════════════════ */
function smartDoseRecognizer(note){
  var raw=note;
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();

  var res={
    count:1,
    hasB:false,  // breakfast
    hasL:false,  // lunch
    hasD:false,  // dinner
    isBefore:false,
    hasM:false,  // morning
    hasN:false,  // noon
    hasA:false,  // afternoon/asr
    hasE:false,  // evening
    hasBed:false, // bedtime
    hasEmpty:false, // empty stomach
    language:'arabic',
    confidence:'high',
    rawFrequency:null
  };

  res.language=detectLanguage(raw);

  /* ── STEP 1: Detect meal/time anchors ── */

  // Breakfast
  res.hasB=/\b(bre|breakfast|fatur|ftor)\b|فطر|فطار|فطور|افطار|إفطار|الافطار|الفطور|الفطار/i.test(s);

  // Lunch
  res.hasL=/\b(lun|lunch|lau)\b|غدا|غداء|الغدا|الغداء/i.test(s);

  // Dinner
  res.hasD=/\b(din|dinner|sup|supper|asha|isha)\b|عشا|عشو|تعشى|عشاء|العشاء|العشا/i.test(s);

  // Morning
  res.hasM=/\b(morning|am|morn|a\.m)\b|صباح|الصباح|صبح/i.test(s);

  // Noon
  res.hasN=/\b(noon|midday|ظهر|الظهر)\b/i.test(s);

  // Afternoon/Asr
  res.hasA=/\b(asr|afternoon|pm|p\.m|عصر|العصر)\b/i.test(s);

  // Evening
  res.hasE=/\b(evening|eve|مساء|مسا|المساء|المسا|ليل|الليل)\b/i.test(s);

  // Bedtime
  res.hasBed=/\b(bed|bedtime|sleep|sle|hs|h\.s|نوم|النوم|قبل النوم|عند النوم|before\s*bed|before\s*sleep|at\s*bed)\b/i.test(s);

  // Empty stomach
  res.hasEmpty=/\b(empty|fasting|ريق|الريق|على الريق|معدهـ فارغهـ|empty\s*stomach)\b/i.test(s);

  // Before meal detection
  res.isBefore=/\b(before|bef|pre|ac|a\.c|قبل|قبل الاكل|قبل الأكل|before\s*meal|before\s*food)\b/i.test(s);

  /* ── STEP 2: Detect explicit frequency codes ── */

  // QID / 4 times
  if(/\bqid\b|q\.i\.d|اربع مرات|4\s*مرات|four\s*times?\s*(a\s*day|daily|يوميا)?|4\s*times?\s*(a\s*day|daily)?/i.test(s)){
    res.count=4;res.rawFrequency='QID';return res;
  }

  // TID / 3 times
  if(/\btid\b|t\.i\.d|ثلاث مرات|3\s*مرات|three\s*times?\s*(a\s*day|daily|يوميا)?|3\s*times?\s*(a\s*day|daily)?|thrice\s*(daily)?/i.test(s)){
    res.count=3;res.rawFrequency='TID';return res;
  }

  // BID / 2 times
  if(/\bbid\b|b\.i\.d|مرتين|مرتان|مره مرتين|twice\s*(a\s*day|daily)?|2\s*times?\s*(a\s*day|daily|يوميا)?/i.test(s)){
    res.count=2;res.rawFrequency='BID';return res;
  }

  // OD / QD / once daily
  if(/\bod\b|o\.d|\bqd\b|q\.d|once\s*(a\s*day|daily)?|مره واحده يوميا|مرهـ واحدهـ/i.test(s)){
    res.count=1;res.rawFrequency='OD';return res;
  }

  /* ── STEP 3: Detect hourly intervals mapping to frequency ── */

  // every 6 hours = 4 times
  if(/كل\s*6|every\s*6\s*h|q6h|q\s*6\s*h/i.test(s)){
    res.count=4;res.rawFrequency='Q6H';return res;
  }
  // every 8 hours = 3 times
  if(/كل\s*8|every\s*8\s*h|q8h|q\s*8\s*h/i.test(s)){
    res.count=3;res.rawFrequency='Q8H';return res;
  }
  // every 12 hours = 2 times
  if(/كل\s*12|every\s*12\s*h|q12h|q\s*12\s*h/i.test(s)){
    res.count=2;res.rawFrequency='Q12H';return res;
  }
  // every 24 hours = 1 time
  if(/كل\s*24|every\s*24\s*h|q24h|q\s*24\s*h/i.test(s)){
    res.count=1;res.rawFrequency='Q24H';return res;
  }
  // every 4 hours = 6 times
  if(/كل\s*4\s*ساع|every\s*4\s*h|q4h|q\s*4\s*h/i.test(s)){
    res.count=6;res.rawFrequency='Q4H';return res;
  }

  /* ── STEP 4: Infer from meal/time combos ── */

  var mealCount=0;
  if(res.hasB||res.hasM) mealCount++;
  if(res.hasL||res.hasN) mealCount++;
  if(res.hasD||res.hasE) mealCount++;
  if(res.hasA && mealCount<3) mealCount++;

  // "before meals" pattern (generic, implies 3)
  if(/قبل\s*(الوجبات|الاكل|الأكل)\s*(الثلاث|3)?|before\s*(all\s*)?meals|ac\s*meals/i.test(s)){
    res.count=3;res.isBefore=true;return res;
  }
  // "after meals" pattern (generic, implies 3)
  if(/بعد\s*(الوجبات|الاكل|الأكل)\s*(الثلاث|3)?|after\s*(all\s*)?meals|pc\s*meals/i.test(s)){
    res.count=3;return res;
  }
  // "before meals twice" / "قبل الاكل مرتين"
  if(/قبل\s*(الاكل|الأكل|الوجبات)\s*مرتين|before\s*meals?\s*twice/i.test(s)){
    res.count=2;res.isBefore=true;return res;
  }

  // 3-meal combos
  if(mealCount>=3){
    res.count=3;return res;
  }

  // 2-meal combos - explicit pairs
  var pairDual=/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i;
  if(mealCount===2||pairDual.test(s)){
    res.count=2;return res;
  }

  // Single bedtime → 1 dose
  if(res.hasBed && mealCount===0){
    res.count=1;return res;
  }

  // Single empty stomach → 1 dose
  if(res.hasEmpty && mealCount===0){
    res.count=1;return res;
  }

  return res;
}

/* ══════════════════════════════════════════
   TWO-PILLS-PER-DOSE DETECTION - ENHANCED
   ══════════════════════════════════════════ */
function getTwoPillsPerDoseInfo(n){
  var s=(n||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();

  // Detect "half tablet" / "نص حبة"
  var halfPill=/نص حبه|نص قرص|نصف حبه|نصف قرص|half\s*(a\s*)?(tab|tablet|pill|cap|capsule)|0\.5\s*(tab|tablet|pill)/i;
  if(halfPill.test(n)){
    return {dose:0.5,multiplier:0.5};
  }

  // Detect "quarter tablet" / "ربع حبة"
  var quarterPill=/ربع حبه|ربع قرص|quarter\s*(a\s*)?(tab|tablet|pill)|0\.25\s*(tab|tablet|pill)/i;
  if(quarterPill.test(n)){
    return {dose:0.25,multiplier:0.25};
  }

  // Detect 2 pills per dose
  var twoPatterns=[
    '2 حبه','2 حبة','حبتين','حبتان','2 حبوب',
    '2 قرص','قرصين','قرصان',
    '2 كبسولة','كبسولتين','كبسولتان',
    '2 pill','2 pills','two pill','two pills',
    '2 tablet','2 tablets','two tablet','two tablets',
    '2 tab','2 tabs','two tab','two tabs',
    '2 cap','2 caps','two cap','two caps'
  ];
  for(var i=0;i<twoPatterns.length;i++){
    if(s.includes(twoPatterns[i].toLowerCase())){
      var is2=/مرتين|twice|2\s*times|bid|b\.i\.d/i.test(n);
      var is3=/ثلاث مرات|3\s*مرات|three\s*times|3\s*times|tid|t\.i\.d/i.test(n);
      var ml=1;
      if(is3) ml=6; else if(is2) ml=4; else ml=2;
      return {dose:2,multiplier:ml};
    }
  }

  // Detect 3 pills per dose
  var threePatterns=['3 حبه','3 حبات','3 حبوب','3 قرص','3 اقراص','3 كبسول','3 tab','3 tabs','3 pill','3 pills','three tab','three pill'];
  for(var i=0;i<threePatterns.length;i++){
    if(s.includes(threePatterns[i].toLowerCase())){
      return {dose:3,multiplier:3};
    }
  }

  return {dose:1,multiplier:1};
}

/* ══════════════════════════════════════════
   TIME FROM WORDS - ENHANCED
   ══════════════════════════════════════════ */
function getTimeFromWords(w){
  var s=(w||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();

  // Specific time extraction (e.g., "at 8 am", "الساعة 8")
  var specificTime=s.match(/(?:at|الساعهـ|الساعه)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|صباحا|مساء)?/i);
  if(specificTime){
    var hr=parseInt(specificTime[1]);
    var min=specificTime[2]?parseInt(specificTime[2]):0;
    var ampm=specificTime[3]||'';
    if(/pm|مساء/i.test(ampm)&&hr<12) hr+=12;
    if(/am|صباحا/i.test(ampm)&&hr===12) hr=0;
    return {time:('0'+hr).slice(-2)+':'+('0'+min).slice(-2)};
  }

  // Priority-ordered keyword matching - JVM times
  var rules=[
    {test:/empty|stomach|ريق|الريق|على الريق|fasting/,time:'08:00'},
    {test:/قبل\s*(الاكل|الأكل|meal)|before\s*(meal|food)/,time:'08:00'},
    {test:/before.*bre|before.*fatur|before.*breakfast|قبل.*فطر|قبل.*فطار|قبل.*فطور|قبل.*افطار/,time:'08:00'},
    {test:/after.*bre|after.*fatur|after.*breakfast|بعد.*فطر|بعد.*فطار|بعد.*فطور|بعد.*افطار/,time:'09:00'},
    {test:/\b(morning|am|a\.m)\b|صباح|الصباح|صبح/,time:'09:00'},
    {test:/\b(noon|midday)\b|ظهر|الظهر/,time:'12:00'},
    {test:/before.*lun|before.*lunch|قبل.*غدا|قبل.*غداء/,time:'13:00'},
    {test:/after.*lun|after.*lunch|بعد.*غدا|بعد.*غداء/,time:'14:00'},
    {test:/\b(asr|afternoon|pm|p\.m)\b|عصر|العصر/,time:'14:00'},
    {test:/maghrib|مغرب|المغرب/,time:'18:00'},
    {test:/before.*din|before.*sup|before.*dinner|before.*asha|قبل.*عشا|قبل.*عشو|قبل.*عشاء/,time:'20:00'},
    {test:/after.*din|after.*sup|after.*dinner|after.*asha|بعد.*عشا|بعد.*عشو|بعد.*عشاء/,time:'21:00'},
    {test:/مساء|مسا|evening|eve/,time:'21:00'},
    {test:/bed|sleep|sle|نوم|النوم|hs|h\.s/,time:'22:00'}
  ];

  for(var i=0;i<rules.length;i++){
    if(rules[i].test.test(s)) return {time:rules[i].time};
  }

  return {time:'09:00'};
}

/* ══════════════════════════════════════════
   SHOULD DUPLICATE ROW - ENHANCED
   ══════════════════════════════════════════ */
function shouldDuplicateRow(note){
  var d=smartDoseRecognizer(note);
  var s=(note||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ى/g,'ي').trim();

  // Every 8 hours or 3 times → three rows
  var isEvery8=/كل\s*8|every\s*8|q8h/i.test(s);
  if(isEvery8||d.count===3) return {type:'three',doseInfo:d,isBefore:d.isBefore};

  // Detect specific 2-meal pairs that need splitting
  var isMN=(d.hasM||d.hasB)&&(d.hasN||d.hasL);
  var isNE=(d.hasN||d.hasL)&&(d.hasE||d.hasD);
  var isMA=(d.hasM||d.hasB)&&d.hasA;
  var isAE=d.hasA&&(d.hasE||d.hasD);
  if(isMN||isNE||isMA||isAE) return {type:'two',doseInfo:d,isBefore:d.isBefore};

  // Regular twice daily (morning-evening, B&D, BID, etc.) stays as single row with every 12
  var isRegularTwice=((d.hasB||d.hasM)&&(d.hasD||d.hasE))||
    /12|twice|bid|b\s*i\s*d|مرتين/.test(s)||
    /(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(s)||
    /قبل\s*(الاكل|الأكل)\s*مرتين/.test(s);
  if(d.count===2&&!isRegularTwice) return {type:'two',doseInfo:d,isBefore:d.isBefore};

  return null;
}

/* ══════════════════════════════════════════
   ★ MAIN PROCESSING ENGINE ★
   ══════════════════════════════════════════ */
function processTable(m,t,autoDuration,enableWarnings,showPostDialog){
  warningQueue=[];
  duplicatedRows=[];
  duplicatedCount=0;
  var detectedLanguagesPerRow=[];

  function fire(el){
    try{if(!el)return;el.focus();
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('blur',{bubbles:true}));
    }catch(e){}
  }
  function norm(txt){return(txt||'').toString().trim().replace(/\s+/g,' ');}
  function normL(txt){
    var n=norm(txt).toLowerCase();
    return n.replace(/[أإآ]/g,'ا').replace(/ة/g,'هـ').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ى/g,'ي').trim();
  }
  function get(td){
    if(!td)return'';
    var i=td.querySelector('input,textarea,select');
    if(i){if(i.tagName==='SELECT'){var o=i.options[i.selectedIndex];return norm(o?o.textContent:i.value);}return norm(i.value);}
    return norm(td.innerText||td.textContent);
  }
  function getCleanCode(td){var text=get(td);var match=text.match(/\d+/);return match?match[0]:'';}
  function setSize(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setEvry(td,v){if(!td)return;var s=td.querySelector('select');if(s){s.value=String(v);fire(s);}else{td.textContent=String(v);}}
  function setDose(td,v){
    if(!td)return;
    var s=td.querySelector('select');
    if(s){s.value=String(v);fire(s);return;}
    var i=td.querySelector('input,textarea');
    if(i){i.value=String(v);fire(i);return;}
    td.textContent=String(v);
  }
  function setTime(r,tm){if(!r||!tm)return;var i=r.querySelector("input[type='time']");if(i){i.value=tm;fire(i);}}
  function setNote(td,v){if(!td)return;var i=td.querySelector('input,textarea');if(i){i.value=v;fire(i);}else{td.textContent=v;}}
  function setStartDate(r,dateStr){
    if(!r||!dateStr)return;
    var sdInput=r.querySelector('input[type="date"]');
    if(!sdInput){var inputs=r.querySelectorAll('input');for(var i=0;i<inputs.length;i++){if(inputs[i].value&&/\d{4}-\d{2}-\d{2}/.test(inputs[i].value)){sdInput=inputs[i];break;}}}
    if(sdInput){sdInput.value=dateStr;fire(sdInput);}
  }
  function cleanNote(txt){
    if(!txt) return '';
    var c=txt.toString().replace(/[،,.\-_\\]/g,' ');
    var a=/(.*?)أيام/;var e=/(.*?)days/i;
    if(a.test(c)) c=c.replace(a,'').replace(/^\s*-\s*/,'').trim();
    else if(e.test(c)) c=c.replace(e,'').replace(/^\s*-\s*/,'').trim();
    return c.replace(/\s+/g,' ').trim();
  }
  function idx(ths,n){
    n=normL(n);
    for(var i=0;i<ths.length;i++){var txt=normL(ths[i].textContent);if(txt===n||txt.indexOf(n)>-1) return i;}
    return -1;
  }
  function setTopStartDate(){
    var d=new Date();d.setDate(d.getDate()+1);
    var y=d.getFullYear(),m_s=('0'+(d.getMonth()+1)).slice(-2),da=('0'+d.getDate()).slice(-2);
    var t_s=y+'-'+m_s+'-'+da;
    var s=document.querySelector('#fstartDate');
    if(s){s.value=t_s;fire(s);return true;}
    return false;
  }
  function getNextDayOfWeek(baseDate,targetDay){
    var base=new Date(baseDate);var currentDay=base.getDay();
    var daysUntilTarget=(targetDay-currentDay+7)%7;
    if(daysUntilTarget===0) daysUntilTarget=7;
    var result=new Date(base);result.setDate(base.getDate()+daysUntilTarget);
    var y=result.getFullYear();var m=('0'+(result.getMonth()+1)).slice(-2);var d=('0'+result.getDate()).slice(-2);
    return y+'-'+m+'-'+d;
  }

  /* ── DUPLICATE ROW CREATOR ── */
  function createDuplicateRows(t_val,r,ni,bs,niIdx,si,ei,di,ti,sdi,edi,m_val,tc,ci,qi){
    var tds=r.querySelectorAll('td');
    var u_code=getCleanCode(tds[ci]);
    var ns=bs;
    if(fixedSizeCodes[u_code]){
      var div=(ni.type==='three')?3:2;
      ns=Math.floor(fixedSizeCodes[u_code]/div);
      var remainder=fixedSizeCodes[u_code]%div;
      if(remainder>0){
        var splits=[];
        for(var x=0;x<div;x++){
          if(x<remainder) splits.push(Math.ceil(fixedSizeCodes[u_code]/div));
          else splits.push(Math.floor(fixedSizeCodes[u_code]/div));
        }
        ni.customSplits=splits;
      }
    }
    var on=get(r.querySelectorAll('td')[niIdx]);
    var isEn=/[a-z]/i.test(on)||ni.doseInfo.language==='english';
    var p=ni.isBefore?(isEn?'Before ':'قبل '):(isEn?'After ':'بعد ');
    var bf=isEn?'Breakfast':'الفطار';
    var ln=isEn?'Lunch':'الغداء';
    var dn=isEn?'Dinner':'العشاء';
    var m_lbl=isEn?'Morning':'صباحا';
    var n_lbl=isEn?'Noon':'ظهرا';
    var a_lbl=isEn?'Afternoon':'عصرا';
    var e_lbl=isEn?'Evening':'مساءا';

    var calcQ=1;
    if(qi>=0){var cur=parseInt(get(tds[qi]))||1;calcQ=cur*m_val;}

    var dupRows=[];var meals=[];

    if(ni.type==='two'){
      var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);
      var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');
      var sz1=ni.customSplits?ni.customSplits[0]:ns;
      var sz2=ni.customSplits?ni.customSplits[1]:ns;
      setSize(nt1[si],sz1);setSize(nt2[si],sz2);
      setEvry(nt1[ei],'24');setEvry(nt2[ei],'24');
      if(di>=0){var tpi=getTwoPillsPerDoseInfo(get(r.querySelectorAll('td')[niIdx]));setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);}
      if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);}

      var n1='',t1='',n2='',t2='';
      if(ni.doseInfo.hasM&&ni.doseInfo.hasN){n1=m_lbl;t1='09:00';n2=n_lbl;t2='12:00';meals=['الصباح','الظهر'];}
      else if(ni.doseInfo.hasN&&ni.doseInfo.hasE){n1=n_lbl;t1='12:00';n2=e_lbl;t2='21:00';meals=['الظهر','المساء'];}
      else if(ni.doseInfo.hasM&&ni.doseInfo.hasA){n1=m_lbl;t1='09:00';n2=a_lbl;t2='14:00';meals=['الصباح','العصر'];}
      else if(ni.doseInfo.hasA&&ni.doseInfo.hasE){n1=a_lbl;t1='14:00';n2=e_lbl;t2='21:00';meals=['العصر','المساء'];}
      else if(ni.doseInfo.hasB&&ni.doseInfo.hasL){
        if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+ln;t2='13:00';}
        else{n1=p+bf;t1='09:00';n2=p+ln;t2='14:00';}
        meals=isEn?['Breakfast','Lunch']:['الفطار','الغداء'];
      } else if(ni.doseInfo.hasL&&ni.doseInfo.hasD){
        if(ni.isBefore){n1=p+ln;t1='13:00';n2=p+dn;t2='20:00';}
        else{n1=p+ln;t1='14:00';n2=p+dn;t2='21:00';}
        meals=isEn?['Lunch','Dinner']:['الغداء','العشاء'];
      } else {
        if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+dn;t2='20:00';}
        else{n1=p+bf;t1='09:00';n2=p+dn;t2='21:00';}
        meals=isEn?['Breakfast','Dinner']:['الفطار','العشاء'];
      }
      setNote(nt1[niIdx],'⚡ '+n1);setNote(nt2[niIdx],'⚡ '+n2);
      setTime(nr1,t1);setTime(nr2,t2);
      r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);
      dupRows=[nr1,nr2];

    } else if(ni.type==='three'){
      var nr1=r.cloneNode(true);var nr2=r.cloneNode(true);var nr3=r.cloneNode(true);
      var nt1=nr1.querySelectorAll('td');var nt2=nr2.querySelectorAll('td');var nt3=nr3.querySelectorAll('td');
      var sz1=ni.customSplits?ni.customSplits[0]:ns;
      var sz2=ni.customSplits?ni.customSplits[1]:ns;
      var sz3=ni.customSplits?ni.customSplits[2]:ns;
      setSize(nt1[si],sz1);setSize(nt2[si],sz2);setSize(nt3[si],sz3);
      setEvry(nt1[ei],'24');setEvry(nt2[ei],'24');setEvry(nt3[ei],'24');
      if(di>=0){var tpi=getTwoPillsPerDoseInfo(get(r.querySelectorAll('td')[niIdx]));setDose(nt1[di],tpi.dose);setDose(nt2[di],tpi.dose);setDose(nt3[di],tpi.dose);}
      if(qi>=0){setSize(nt1[qi],calcQ);setSize(nt2[qi],calcQ);setSize(nt3[qi],calcQ);}

      var n1='',t1='',n2='',t2='',n3='',t3='';
      if(ni.doseInfo.hasM&&ni.doseInfo.hasA&&ni.doseInfo.hasE){
        n1=m_lbl;t1='09:00';n2=a_lbl;t2='14:00';n3=e_lbl;t3='21:00';
        meals=isEn?['Morning','Afternoon','Evening']:['الصباح','العصر','المساء'];
      } else {
        if(ni.isBefore){n1=p+bf;t1='08:00';n2=p+ln;t2='13:00';n3=p+dn;t3='20:00';}
        else{n1=p+bf;t1='09:00';n2=p+ln;t2='14:00';n3=p+dn;t3='21:00';}
        meals=isEn?['Breakfast','Lunch','Dinner']:['الفطار','الغداء','العشاء'];
      }
      setNote(nt1[niIdx],'⚡ '+n1);setNote(nt2[niIdx],'⚡ '+n2);setNote(nt3[niIdx],'⚡ '+n3);
      setTime(nr1,t1);setTime(nr2,t2);setTime(nr3,t3);
      r.parentNode.insertBefore(nr1,r);r.parentNode.insertBefore(nr2,r);r.parentNode.insertBefore(nr3,r);
      dupRows=[nr1,nr2,nr3];
    }
    duplicatedRows.push({originalRow:r,duplicates:dupRows,type:ni.type,meals:meals});
    duplicatedCount++;
    if(r.parentNode) r.parentNode.removeChild(r);
  }

  /* ── SORT ROWS BY TIME ── */
  function sortRowsByTime(t_elem,ti_idx,ei_idx){
    if(ti_idx<0) return;
    var rs_elem=Array.from(t_elem.querySelectorAll('tr'));
    var h_elem=rs_elem.shift();
    var rwt_arr=[];var rwot_arr=[];
    rs_elem.forEach(function(r_elem){
      var tds_elem=r_elem.querySelectorAll('td');
      if(tds_elem.length<=ti_idx){rwot_arr.push(r_elem);return;}
      var tv_str=get(tds_elem[ti_idx]);
      if(!tv_str||tv_str.trim()===''){rwot_arr.push(r_elem);return;}
      rwt_arr.push({row:r_elem,time:tv_str});
    });
    rwt_arr.sort(function(a,b){
      var ta=a.time.split(':').map(Number);var tb=b.time.split(':').map(Number);
      var diff=(ta[0]*60+ta[1])-(tb[0]*60+tb[1]);
      if(diff===0&&ei_idx>=0){
        var evA=parseInt(get(a.row.querySelectorAll('td')[ei_idx]))||0;
        var evB=parseInt(get(b.row.querySelectorAll('td')[ei_idx]))||0;
        return evB-evA;
      }
      return diff;
    });
    t_elem.innerHTML='';t_elem.appendChild(h_elem);
    rwt_arr.forEach(function(i_obj){t_elem.appendChild(i_obj.row);});
    rwot_arr.forEach(function(r_elem){t_elem.appendChild(r_elem);});
  }

  function showUniqueItemsCount(t_elem,ci_idx){
    var s_set=new Set();
    t_elem.querySelectorAll('tr').forEach(function(r_elem,ri_idx){
      if(ri_idx===0)return;
      var tds_elem=r_elem.querySelectorAll('td');
      if(tds_elem.length<=ci_idx)return;
      var c_str=get(tds_elem[ci_idx]);
      if(c_str&&c_str.trim()!=='') s_set.add(c_str.trim());
    });
    return s_set.size;
  }

  function getCheckmarkCellIndex(r_elem){
    var tds_elem=r_elem.querySelectorAll('td');
    for(var i=0;i<tds_elem.length;i++){
      if(tds_elem[i].querySelector('input[type="checkbox"]')||tds_elem[i].querySelector('img[src*="check"]')) return i;
    }
    return -1;
  }

  function resetCheckmark(r_elem,checkmarkIdx){
    if(checkmarkIdx<0) return;
    var tds_elem=r_elem.querySelectorAll('td');
    if(tds_elem.length<=checkmarkIdx) return;
    var checkbox_elem=tds_elem[checkmarkIdx].querySelector('input[type="checkbox"]');
    if(checkbox_elem){checkbox_elem.checked=false;fire(checkbox_elem);}
  }

  /* ── BEGIN MAIN PROCESS ── */
  setTopStartDate();

  var ts_list=document.querySelectorAll('table');var tb_main=null;
  for(var i=0;i<ts_list.length;i++){
    if(ts_list[i].querySelector('th')&&(ts_list[i].innerText.toLowerCase().includes('qty')||ts_list[i].innerText.toLowerCase().includes('quantity'))){
      tb_main=ts_list[i];break;
    }
  }
  if(!tb_main){alert('❌ لم يتم العثور على الجدول');return;}

  var h_main=tb_main.querySelector('tr');var hs_main=h_main.querySelectorAll('th,td');
  var qi_main=idx(hs_main,'qty');
  var si_main=idx(hs_main,'size');
  var ni_main=idx(hs_main,'note');
  var ei_main=idx(hs_main,'every');
  if(ei_main<0) ei_main=idx(hs_main,'evry');
  var ti_main=idx(hs_main,'time');
  var di_main=idx(hs_main,'dose');
  var ci_main=idx(hs_main,'code');
  var sdi_main=idx(hs_main,'start date');
  var edi_main=idx(hs_main,'end date');
  var nm_main=idx(hs_main,'name');
  if(nm_main<0) nm_main=idx(hs_main,'item');

  if(qi_main<0||si_main<0||ni_main<0||ei_main<0){alert('❌ لم يتم العثور على الأعمدة المطلوبة');return;}

  // Reorder columns for better UX
  if(ti_main>=0&&ni_main>=0&&ti_main<ni_main){
    moveColumnAfter(tb_main,ni_main,ti_main);
    ni_main=ti_main+1;
    if(ti_main<di_main) di_main++;
    if(ti_main<ei_main) ei_main++;
    if(ti_main<sdi_main) sdi_main++;
    if(ti_main<edi_main) edi_main++;
  }

  // Set column widths
  if(sdi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[sdi_main].style.width='120px';hs_main[sdi_main].style.minWidth='120px';}
  if(edi_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[edi_main].style.width='120px';hs_main[edi_main].style.minWidth='120px';}
  if(ni_main>=0){hs_main=h_main.querySelectorAll('th,td');hs_main[ni_main].style.width='180px';hs_main[ni_main].style.minWidth='180px';}

  var rtd_list=[];var rtp_list=[];var skp_list=[];
  var processedCodes={};var allRowsData=[];

  /* ── PHASE 1: Categorize rows ── */
  tb_main.querySelectorAll('tr').forEach(function(r_node,ri_idx){
    if(ri_idx===0) return;
    var tds_nodes=r_node.querySelectorAll('td');

    // Skip non-pill items
    if(nm_main>=0&&tds_nodes.length>nm_main){
      var n_val=get(tds_nodes[nm_main]);
      if(/refrigerator|ثلاجه|ثلاجة|cream|syrup|كريم|مرهم|شراب|قطرة|drop|حقنة|injection|لبوس|suppository|غرغرة|mouthwash|بخاخ|spray|محلول|solution|أنف|nasal|عين|eye|أذن|ear|glucose|جلوكوز|strip|شريط|شرائط|lancet|لانسيت|شكاكة|alcohol|كحول|pads|باد|accu|chek|test|فحص|blood|دم|device|جهاز|disposable|one-touch|ون تاتش|وان تاش|نانو|نهدي|nahdi/i.test(n_val)){
        var ck_idx=getCheckmarkCellIndex(r_node);
        resetCheckmark(r_node,ck_idx);
        skp_list.push(r_node);
        return;
      }
    }

    // Skip unchecked rows
    var cb_node=r_node.querySelector('input[type="checkbox"]');
    if(cb_node&&!cb_node.checked){skp_list.push(r_node);return;}

    // Handle duplicate codes
    if(ci_main>=0&&tds_nodes.length>ci_main){
      var cd_str=getCleanCode(tds_nodes[ci_main]);
      if(cd_str){
        if(processedCodes[cd_str]){
          var ck_idx=getCheckmarkCellIndex(r_node);
          resetCheckmark(r_node,ck_idx);
          skp_list.push(r_node);
          return;
        } else {
          processedCodes[cd_str]={row:r_node,note:cleanNote(get(tds_nodes[ni_main]))};
          rtp_list.push(r_node);
          return;
        }
      }
    }
    rtp_list.push(r_node);
  });

  /* ── PHASE 2: Process each row ── */
  for(var i=0;i<rtp_list.length;i++){
    var r_node=rtp_list[i];
    var tds_nodes=r_node.querySelectorAll('td');
    if(tds_nodes.length<=Math.max(qi_main,si_main,ni_main,ei_main)) continue;

    // Set input widths
    if(sdi_main>=0){var sdInp=tds_nodes[sdi_main].querySelector('input');if(sdInp) sdInp.style.width='120px';}
    if(edi_main>=0){var edInp=tds_nodes[edi_main].querySelector('input');if(edInp) edInp.style.width='120px';}
    if(ni_main>=0){var nInp=tds_nodes[ni_main].querySelector('input,textarea');if(nInp){nInp.style.width='100%';nInp.style.minWidth='180px';}}

    // Clean note
    var nc_node=tds_nodes[ni_main];
    var ni3_node=nc_node.querySelector('input,textarea');
    var nt_str=ni3_node?ni3_node.value:nc_node.textContent;
    var cn_str=cleanNote(nt_str);
    if(ni3_node){ni3_node.value=cn_str;fire(ni3_node);}
    else nc_node.textContent=cn_str;

    var itemCode=getCleanCode(tds_nodes[ci_main]);
    var itemName=nm_main>=0?get(tds_nodes[nm_main]):'';
    if(processedCodes[itemCode]) processedCodes[itemCode].note=cn_str;

    var fn_str=cn_str;
    var original_note=nt_str;

    // Language detection per row
    var rowLang=detectLanguage(fn_str);
    detectedLanguagesPerRow.push(rowLang);

    // Warning for 2 tablets
    if(/2\s*(tablet|pill|cap|قرص|حبة|كبسولة)/gi.test(original_note)){
      warningQueue.push({level:'warning',message:'💊 تحذير: الصنف "'+itemName+'" - يحتوي على "2 tablets/pills" في الملاحظات. تأكد من الجرعة!',editable:false,rowIndex:allRowsData.length});
    }

    var nl_str=normL(fn_str);
    var dui_obj=shouldDuplicateRow(nl_str);
    var hasFixedSize=!!(itemCode&&fixedSizeCodes[itemCode]);
    var h_s=!!(itemCode&&weeklyInjections.indexOf(itemCode)>-1);

    var durationInfo=null;var hourlyInfo=null;
    var calculatedDays=t;var calculatedSize=t;

    if(autoDuration){
      durationInfo=extractDuration(fn_str);
      if(durationInfo.hasDuration){calculatedDays=durationInfo.days;calculatedSize=durationInfo.days;}
      else if(durationInfo.isPRN){calculatedDays=t;calculatedSize=Math.floor(t/2);}
      else if(durationInfo.isUntilFinish){calculatedDays=t;calculatedSize=t;}
    }

    hourlyInfo=extractHourlyInterval(fn_str);
    var timesPerDay=1;
    if(hourlyInfo.hasInterval) timesPerDay=hourlyInfo.timesPerDay;

    allRowsData.push({
      row:r_node,tds:tds_nodes,itemCode:itemCode,itemName:itemName,
      note:fn_str,dui:dui_obj,hasFixedSize:hasFixedSize,isWeekly:h_s,
      durationInfo:durationInfo,hourlyInfo:hourlyInfo,
      calculatedDays:calculatedDays,calculatedSize:calculatedSize,
      timesPerDay:timesPerDay,extractedPillCount:null,warningOverride:false
    });
  }

  /* ── PHASE 3: Warnings ── */
  if(enableWarnings){
    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];
      if(rd.durationInfo&&rd.durationInfo.hasDuration){
        var extracted=rd.durationInfo.days;
        if(extracted!==t){
          warningQueue.push({
            level:'warning',
            message:'📅 الصنف: '+rd.itemName+' - مكتوب "'+extracted+' يوم" لكن المحدد '+t+' يوم',
            editable:true,editLabel:'عدد الأيام',currentValue:extracted,minValue:1,maxValue:365,rowIndex:i,
            onEdit:(function(idx){return function(newVal){allRowsData[idx].calculatedDays=newVal;allRowsData[idx].calculatedSize=newVal;allRowsData[idx].warningOverride=true;};})(i)
          });
        }
      }
      if(rd.hasFixedSize&&rd.dui){
        var totalSize=fixedSizeCodes[rd.itemCode];
        var parts=rd.dui.type==='three'?3:2;
        var eachPart=Math.floor(totalSize/parts);
        if(eachPart<5){
          warningQueue.push({level:'info',message:'ℹ️ تقسيم صغير: '+rd.itemName+' سيصبح '+eachPart+' حبة لكل جرعة',editable:false,rowIndex:i});
        }
      }
    }
  }

  if(warningQueue.length>0&&enableWarnings){
    window.showWarnings(warningQueue,function(){continueProcessing();});
  } else {
    continueProcessing();
  }

  /* ── PHASE 4: Apply changes ── */
  function continueProcessing(){
    var defaultStartDate=document.querySelector('#fstartDate')?document.querySelector('#fstartDate').value:null;

    for(var i=0;i<allRowsData.length;i++){
      var rd=allRowsData[i];
      var r_node=rd.row;
      var tds_nodes=rd.tds;

      // Duplicate rows (split)
      if(rd.dui){
        if(qi_main>=0){var qc_node=tds_nodes[qi_main];var cur_val=parseInt(get(qc_node))||1;setSize(qc_node,cur_val*m);}
        rtd_list.push({row:r_node,info:rd.dui,calcDays:rd.calculatedDays});
        continue;
      }

      // Fixed size items
      if(rd.hasFixedSize&&!rd.warningOverride){
        setSize(tds_nodes[si_main],fixedSizeCodes[rd.itemCode]);
        var tm_fix=getTimeFromWords(rd.note);
        setTime(r_node,tm_fix.time);
        var dose_fix=smartDoseRecognizer(rd.note);
        var isE12_fix=/12|twice|bid|b\.?i\.?d|مرتين/.test(rd.note)||
          (dose_fix.hasB&&dose_fix.hasD)||(dose_fix.hasM&&dose_fix.hasE)||
          /(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(rd.note)||
          /قبل\s*(الاكل|الأكل)\s*مرتين/.test(rd.note);
        if(dose_fix.count>=4||rd.timesPerDay>=4){setEvry(tds_nodes[ei_main],'6');}
        else if(dose_fix.count===3||rd.timesPerDay===3){setEvry(tds_nodes[ei_main],'8');}
        else if(dose_fix.count===2||isE12_fix||rd.timesPerDay===2){setEvry(tds_nodes[ei_main],'12');}
        else{setEvry(tds_nodes[ei_main],'24');}
        if(di_main>=0){var tpi_fix=getTwoPillsPerDoseInfo(rd.note);setDose(tds_nodes[di_main],tpi_fix.dose===2?2:tpi_fix.dose);}
        if(qi_main>=0){var cur=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur*m);}
        continue;
      }

      // Weekly injections
      if(rd.isWeekly){
        var bs_val=(rd.calculatedDays==28?4:5)+(m-1)*4;
        setSize(tds_nodes[si_main],bs_val);
        setEvry(tds_nodes[ei_main],'168');
        if(qi_main>=0){var cur=parseInt(get(tds_nodes[qi_main]))||1;setSize(tds_nodes[qi_main],cur);}
        var tm_fix=getTimeFromWords(rd.note);
        setTime(r_node,tm_fix.time);
        var targetDay=extractDayOfWeek(rd.note);
        if(targetDay!==null&&defaultStartDate&&sdi_main>=0){
          var newStartDate=getNextDayOfWeek(defaultStartDate,targetDay);
          setStartDate(r_node,newStartDate);
        }
        continue;
      }

      // Regular items
      if(qi_main>=0){var qc_node=tds_nodes[qi_main];var cur_val=parseInt(get(qc_node))||1;setSize(qc_node,cur_val*m);}

      var doseInfo=smartDoseRecognizer(rd.note);
      var tpi_obj=getTwoPillsPerDoseInfo(rd.note);
      var itpp_bool=tpi_obj.dose===2;
      var doseMultiplier=tpi_obj.dose; // supports 0.5, 1, 2, 3
      var tm2_obj=getTimeFromWords(rd.note);

      // Every 48 hours (every other day)
      var is48h=/48|يوم بعد يوم|يوم ويوم|every\s*other\s*day|day\s*after\s*day|alternate\s*day|eod|e\.o\.d/i.test(rd.note);
      if(is48h){
        setEvry(tds_nodes[ei_main],'48');
        var mult=doseMultiplier;
        if(doseInfo.count>=2) setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*mult));
        else setSize(tds_nodes[si_main],Math.ceil((rd.calculatedSize*mult)/2));
        setTime(r_node,tm2_obj.time);
        continue;
      }

      // Calculate final frequency
      var finalTimesPerDay=rd.timesPerDay;
      if(rd.hourlyInfo.hasInterval) finalTimesPerDay=rd.hourlyInfo.timesPerDay;

      var isE12_bool=/كل\s*12|12|twice|bid|b\.?i\.?d|مرتين/.test(rd.note)||
        (doseInfo.hasB&&doseInfo.hasD)||(doseInfo.hasM&&doseInfo.hasE)||
        /(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(rd.note)||
        /قبل\s*(الاكل|الأكل)\s*مرتين/.test(rd.note);

      // Apply size & frequency
      if(finalTimesPerDay>=6){
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*6));
        setEvry(tds_nodes[ei_main],'4');
      } else if(finalTimesPerDay===4){
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*4));
        setEvry(tds_nodes[ei_main],'6');
      } else if(isE12_bool||finalTimesPerDay===2){
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*2));
        setEvry(tds_nodes[ei_main],'12');
        setTime(r_node,tm2_obj.time);
      } else if(doseInfo.count===3||finalTimesPerDay===3){
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*3));
        setEvry(tds_nodes[ei_main],'8');
      } else if(doseInfo.count===2){
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier*2));
        setEvry(tds_nodes[ei_main],'12');
        setTime(r_node,tm2_obj.time);
      } else {
        setSize(tds_nodes[si_main],Math.ceil(rd.calculatedSize*doseMultiplier));
        setEvry(tds_nodes[ei_main],'24');
      }

      if(di_main>=0) setDose(tds_nodes[di_main],doseMultiplier>=1?doseMultiplier:1);
      if(!isE12_bool) setTime(r_node,tm2_obj.time);
    }

    // Create duplicate rows
    for(var i=0;i<rtd_list.length;i++){
      var it_obj=rtd_list[i];
      createDuplicateRows(it_obj.calcDays,it_obj.row,it_obj.info,it_obj.calcDays,ni_main,si_main,ei_main,di_main,ti_main,sdi_main,edi_main,m,it_obj.calcDays,ci_main,qi_main);
    }

    // Sort
    sortRowsByTime(tb_main,ti_main,ei_main);

    /* ── JVM: Subtract 1 day from all End Dates ── */
    if(edi_main>=0){
      var allRows=tb_main.querySelectorAll('tr');
      for(var ed_i=1;ed_i<allRows.length;ed_i++){
        var ed_tds=allRows[ed_i].querySelectorAll('td');
        if(ed_tds.length>edi_main){
          var ed_inp=ed_tds[edi_main].querySelector('input');
          var ed_val=ed_inp?ed_inp.value:ed_tds[edi_main].textContent.trim();
          if(ed_val&&/\d{4}-\d{2}-\d{2}/.test(ed_val)){
            var newEdVal=addDays(ed_val,-1);
            if(ed_inp){ed_inp.value=newEdVal;fire(ed_inp);}
            else{ed_tds[edi_main].textContent=newEdVal;}
          }
        }
      }
    }

    // Handle skipped rows
    for(var i=0;i<skp_list.length;i++){
      var r_node=skp_list[i];
      var tds_nodes=r_node.querySelectorAll('td');
      var u_code_skp=getCleanCode(tds_nodes[ci_main]);
      if(sdi_main>=0&&tds_nodes[sdi_main]){var sdInp=tds_nodes[sdi_main].querySelector('input');if(sdInp) sdInp.style.width='120px';}
      if(edi_main>=0&&tds_nodes[edi_main]){var edInp=tds_nodes[edi_main].querySelector('input');if(edInp) edInp.style.width='120px';}
      if(ni_main>=0&&tds_nodes[ni_main]){
        var nInp=tds_nodes[ni_main].querySelector('input,textarea');
        var currentNoteRaw=get(tds_nodes[ni_main]);
        var currentCleanNote=cleanNote(currentNoteRaw);
        if(nInp){
          nInp.style.width='100%';nInp.style.minWidth='180px';
          nInp.value=currentCleanNote;fire(nInp);
          var firstOccur=processedCodes[u_code_skp];
          if(firstOccur&&currentCleanNote!==firstOccur.note){
            nInp.style.backgroundColor='#fff9c4';nInp.style.border='3px solid #ff9800';
            var firstInp=firstOccur.row.querySelectorAll('td')[ni_main].querySelector('input,textarea');
            if(firstInp){firstInp.style.backgroundColor='#fff9c4';firstInp.style.border='3px solid #ff9800';}
          }
        } else {
          tds_nodes[ni_main].textContent=currentCleanNote;
        }
      }
      tb_main.appendChild(r_node);
    }

    // Show unique items count
    var uc_val=showUniqueItemsCount(tb_main,ci_main);
    var genBtn_node=Array.from(document.querySelectorAll('button,input')).find(function(b_node){
      return(b_node.innerText||b_node.value||'').toLowerCase().includes('generate csv');
    });
    if(genBtn_node){
      var bdg_node=document.createElement('span');
      bdg_node.className='unique-count-badge';
      bdg_node.innerHTML='عدد الأصناف: '+uc_val;
      genBtn_node.parentNode.insertBefore(bdg_node,genBtn_node.nextSibling);
    }

    /* ── LANGUAGE AUTO-DETECT ── */
    var englishRowCount=detectedLanguagesPerRow.filter(function(l){return l==='english';}).length;
    var arabicRowCount=detectedLanguagesPerRow.filter(function(l){return l==='arabic';}).length;
    if(englishRowCount>0 && englishRowCount>=arabicRowCount){
      setPatientLanguage('english');
    } else if(arabicRowCount>0){
      setPatientLanguage('arabic');
    }

    if(duplicatedCount>0) window.ezShowToast('تم تقسيم '+duplicatedCount+' صنف إلى صفوف متعددة ⚡','info');
    if(showPostDialog) showPostProcessDialog();
    checkEndDateConsistency();
    window.ezShowToast('تمت المعالجة بنجاح ✅','success');
  }
}

/* ══════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════ */
var s_style=document.createElement('style');
s_style.innerHTML='@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap");@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}@keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.05);opacity:0.8;}}.ez-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fff 0%,#f8f9fa 100%);border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,0.25),0 0 1px rgba(0,0,0,0.3);z-index:99999;font-family:Cairo,sans-serif;min-width:420px;max-width:500px;max-height:95vh;animation:slideUp 0.3s ease;}.ez-dialog.closing{animation:slideUp 0.2s ease reverse;}.ez-header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:18px 22px;border-radius:24px 24px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:move;box-shadow:0 4px 12px rgba(102,126,234,0.3);}.ez-title{font-size:19px;font-weight:900;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2);}.ez-version{background:rgba(255,255,255,0.25);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-left:8px;}.ez-minimize-btn{background:rgba(255,255,255,0.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;}.ez-minimize-btn:hover{background:rgba(255,255,255,0.35);transform:scale(1.1);}.ez-content{padding:20px;overflow-y:auto;max-height:calc(95vh - 90px);}.mode-section{margin-bottom:16px;}.mode-title{font-size:15px;font-weight:800;color:#1e293b;padding:10px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:10px;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;gap:8px;}.options-section{display:block;}.months-section,.days-section{margin-bottom:14px;}.ez-section-title{font-size:12px;font-weight:700;color:#475569;margin-bottom:8px;text-align:center;}.ez-pill-container{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}.ez-pill{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border:2px solid #cbd5e1;padding:10px 22px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;color:#334155;transition:all 0.3s;text-align:center;min-width:55px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}.ez-pill:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15);border-color:#94a3b8;}.ez-pill.selected{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#fff;border-color:#1d4ed8;box-shadow:0 4px 16px rgba(59,130,246,0.4);}.ez-options-group{background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:12px;padding:12px;margin:14px 0;border:1.5px solid #86efac;}.ez-options-group .ez-options-title{font-size:12px;font-weight:800;color:#166534;margin-bottom:10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;}.ez-checkbox-line{display:flex;align-items:center;margin:6px 0;padding:8px 10px;background:#fff;border-radius:8px;cursor:pointer;transition:all 0.3s;border:1.5px solid #e5e7eb;position:relative;}.ez-checkbox-line:hover{background:#f0fdf4;border-color:#86efac;transform:translateX(-2px);}.ez-checkbox-line input[type="checkbox"]{position:absolute;opacity:0;width:0;height:0;}.ez-checkbox-custom{width:18px;height:18px;border:2px solid #cbd5e1;border-radius:5px;margin:0 8px 0 0;position:relative;transition:all 0.3s;background:#fff;flex-shrink:0;}.ez-checkbox-line input[type="checkbox"]:checked+.ez-checkbox-custom{background:linear-gradient(135deg,#10b981,#059669);border-color:#059669;box-shadow:0 0 0 2px rgba(16,185,129,0.2);}.ez-checkbox-custom::after{content:"✓";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);color:#fff;font-size:12px;font-weight:900;transition:all 0.2s;}.ez-checkbox-line input[type="checkbox"]:checked+.ez-checkbox-custom::after{transform:translate(-50%,-50%) scale(1);}.ez-checkbox-label{font-size:12px;color:#1e293b;font-weight:700;flex:1;}.ez-checkbox-icon{font-size:14px;margin-left:4px;opacity:0.8;}.ez-buttons-container{display:flex;gap:10px;margin-top:16px;}.ez-btn{flex:1;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.1);}.ez-submit-btn{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;}.ez-submit-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,0.4);}.ez-cancel-btn{background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);color:#64748b;}.ez-cancel-btn:hover{background:linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 100%);transform:translateY(-2px);}.ez-credit{font-size:10px;color:#94a3b8;margin-top:12px;padding-top:10px;border-top:2px solid #f1f5f9;font-weight:700;text-align:center;}.warning-dialog{background:#fff;border-radius:20px;padding:24px;max-width:560px;max-height:80vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.35);font-family:Cairo,sans-serif;animation:slideUp 0.3s ease;}.warning-header-modern{text-align:center;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #fee2e2;position:relative;}.warning-pulse{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:60px;height:60px;background:radial-gradient(circle,rgba(239,68,68,0.3),transparent);border-radius:50%;animation:pulse 2s infinite;}.warning-icon-modern{font-size:40px;margin-bottom:6px;animation:pulse 1.5s infinite;}.warning-title-modern{font-size:18px;font-weight:900;color:#dc2626;}.warning-stats{display:flex;gap:10px;justify-content:center;margin-top:10px;}.warning-stats span{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;}.stat-critical{background:#fecaca;color:#991b1b;}.stat-warning{background:#fed7aa;color:#9a3412;}.stat-info{background:#bfdbfe;color:#1e40af;}.warning-list-modern{margin:16px 0;max-height:350px;overflow-y:auto;}.warning-item-modern{background:#f8fafc;border-radius:10px;padding:14px;margin:10px 0;position:relative;padding-right:20px;transition:all 0.3s;}.warning-item-modern:hover{transform:translateX(-3px);box-shadow:0 4px 12px rgba(0,0,0,0.1);}.warning-item-modern.warning-danger{background:linear-gradient(135deg,#fef2f2,#fee2e2);border-right:4px solid #dc2626;}.warning-item-modern.warning-warning{background:linear-gradient(135deg,#fffbeb,#fef3c7);border-right:4px solid #f59e0b;}.warning-item-modern.warning-info{background:linear-gradient(135deg,#eff6ff,#dbeafe);border-right:4px solid #3b82f6;}.warning-indicator{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;animation:pulse 2s infinite;}.warning-danger .warning-indicator{background:#dc2626;}.warning-warning .warning-indicator{background:#f59e0b;}.warning-info .warning-indicator{background:#3b82f6;}.warning-content{padding-right:6px;}.warning-text-modern{font-size:12px;color:#1e293b;margin-bottom:8px;font-weight:700;line-height:1.5;}.severity-badge{display:inline-block;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:800;margin-right:6px;vertical-align:middle;}.severity-badge.critical{background:#dc2626;color:#fff;}.severity-badge.high{background:#f59e0b;color:#fff;}.severity-badge.medium{background:#3b82f6;color:#fff;}.warning-edit-modern{margin-top:10px;background:#fff;padding:10px;border-radius:6px;border:1.5px solid #e5e7eb;}.warning-edit-modern label{display:block;font-size:11px;color:#64748b;margin-bottom:6px;font-weight:700;}.input-group{display:flex;align-items:center;gap:6px;}.warning-edit-modern input{flex:1;padding:8px 10px;border:2px solid #cbd5e1;border-radius:6px;font-size:14px;font-weight:700;font-family:Cairo,sans-serif;}.warning-edit-modern input:focus{border-color:#3b82f6;outline:none;box-shadow:0 0 0 2px rgba(59,130,246,0.1);}.input-unit{font-size:11px;color:#64748b;font-weight:700;padding:8px;background:#f8fafc;border-radius:5px;}.warning-actions-modern{display:flex;gap:10px;margin-top:20px;}.warning-btn-modern{flex:1;padding:12px 16px;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:6px;}.warning-accept{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3);}.warning-accept:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,0.4);}.warning-cancel{background:linear-gradient(135deg,#f1f5f9,#e2e8f0);color:#64748b;}.warning-cancel:hover{background:linear-gradient(135deg,#e2e8f0,#cbd5e1);transform:translateY(-2px);}.ez-toast{position:fixed;bottom:30px;right:30px;background:#fff;padding:14px 20px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.25);z-index:999999;display:flex;align-items:center;gap:12px;font-family:Cairo,sans-serif;transform:translateX(500px);opacity:0;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);min-width:280px;}.ez-toast.show{transform:translateX(0);opacity:1;}.ez-toast.closing{transform:translateX(500px);opacity:0;}.ez-toast-icon{font-size:20px;display:flex;align-items:center;}.ez-toast-icon svg{width:24px;height:24px;}.ez-toast-msg{font-size:13px;font-weight:700;color:#1e293b;flex:1;}.ez-toast-progress{position:absolute;bottom:0;left:0;height:3px;background:currentColor;width:100%;animation:progress 3s linear;border-radius:0 0 14px 14px;}@keyframes progress{from{width:100%;}to{width:0%;}}.ez-toast-success{border-right:4px solid #10b981;}.ez-toast-success .ez-toast-icon{color:#10b981;}.ez-toast-error{border-right:4px solid #ef4444;}.ez-toast-error .ez-toast-icon{color:#ef4444;}.ez-toast-info{border-right:4px solid #3b82f6;}.ez-toast-info .ez-toast-icon{color:#3b82f6;}.ez-toast-warning{border-right:4px solid #f59e0b;}.ez-toast-warning .ez-toast-icon{color:#f59e0b;}.ez-loader-spinner{width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}@keyframes spin{to{transform:rotate(360deg)}}.ez-loader-text{font-size:13px;font-weight:700;color:#1e293b}.unique-count-badge{background:#2196f3;color:#fff;padding:0 12px;border-radius:5px;font-size:12px;font-weight:700;margin-left:10px;display:inline-flex;align-items:center;vertical-align:middle;height:28px}.end-date-alert{background:#fff;border-radius:12px;padding:24px;max-width:450px;box-shadow:0 16px 50px rgba(0,0,0,0.3);font-family:Cairo,sans-serif}.alert-header{font-size:17px;font-weight:800;color:#f59e0b;margin-bottom:16px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px}.alert-body{font-size:13px;color:#1e293b;margin-bottom:20px;text-align:center;line-height:1.5}.alert-actions{display:flex;gap:8px}.alert-btn{flex:1;padding:12px;border:none;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;transition:all 0.3s}.alert-fix{background:#10b981;color:#fff}.alert-fix:hover{background:#059669;transform:translateY(-1px)}.alert-cancel{background:#f1f5f9;color:#64748b}.alert-cancel:hover{background:#e2e8f0;transform:translateY(-1px)}table td,table th{border:1px solid #bbb!important}';
document.head.appendChild(s_style);

/* ══════════════════════════════════════════
   MAIN DIALOG - COMPACT & CLEAN
   ══════════════════════════════════════════ */
var d_box=document.createElement('div');
d_box.id='ez-dialog-box';
d_box.className='ez-dialog';
d_box.setAttribute('data-m','1');
d_box.setAttribute('data-t','30');
d_box.setAttribute('data-extraction-mode','manual');
d_box.innerHTML='<div class="ez-header"><div class="ez-title">'+APP_NAME+'</div><div style="display:flex;align-items:center;gap:8px;"><button class="ez-minimize-btn" onclick="window.ezMinimize()"><svg width="14" height="14" fill="currentColor"><path d="M0 7h14"/></svg></button><div class="ez-version">v'+APP_VERSION+'</div></div></div><div class="ez-content"><div class="mode-section"><div class="mode-title">✨ وضع المعالجة الذكي</div></div><div class="options-section"><div class="months-section"><div class="ez-section-title">📅 عدد الأشهر</div><div class="ez-pill-container"><div class="ez-pill selected" onclick="window.ezSelect(this,\'m\',1)">1</div><div class="ez-pill" onclick="window.ezSelect(this,\'m\',2)">2</div><div class="ez-pill" onclick="window.ezSelect(this,\'m\',3)">3</div></div></div><div class="days-section"><div class="ez-section-title">📆 عدد الأيام في الشهر</div><div class="ez-pill-container"><div class="ez-pill" onclick="window.ezSelect(this,\'t\',28)">28</div><div class="ez-pill selected" onclick="window.ezSelect(this,\'t\',30)">30</div></div></div></div><div class="ez-options-group"><div class="ez-options-title">⚙️ خيارات ذكية</div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="auto-duration" checked><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">استخراج المدة والجرعات من الملاحظات</label><span class="ez-checkbox-icon">🤖</span></div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="show-warnings" checked><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">عرض تحذيرات التحقق الذكي</label><span class="ez-checkbox-icon">🛡️</span></div><div class="ez-checkbox-line" onclick="var cb=this.querySelector(\'input\');cb.checked=!cb.checked;"><input type="checkbox" id="show-post-dialog"><span class="ez-checkbox-custom"></span><label class="ez-checkbox-label">خيارات ما بعد المعالجة (دمج - شهر تالي)</label><span class="ez-checkbox-icon">⚙️</span></div></div><div class="ez-buttons-container"><button class="ez-btn ez-submit-btn" onclick="window.ezSubmit()">⚡ بدء المعالجة الذكية</button><button class="ez-btn ez-cancel-btn" onclick="window.ezCancel()">✖ إلغاء</button></div></div><div class="ez-credit">JVM Edition | '+APP_NAME+' v'+APP_VERSION+'</div>';

document.body.appendChild(d_box);

// Keyboard shortcuts
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'){var sub=document.querySelector('.ez-submit-btn');if(sub) sub.click();}
  else if(e.key==='Escape'){var can=document.querySelector('.ez-cancel-btn');if(can) can.click();}
});

makeDraggable(d_box);
})();

javascript:(async function(){
'use strict';

var delay=function(ms){return new Promise(function(r){setTimeout(r,ms)})};

var simulateClick=function(el){
    if(!el)return;
    var r=el.getBoundingClientRect();
    var x=r.left+r.width/2,y=r.top+r.height/2;
    var o={bubbles:true,cancelable:true,view:window,clientX:x,clientY:y};
    ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ev){
        el.dispatchEvent(new(ev.includes('pointer')?PointerEvent:MouseEvent)(ev,o));
    });
};

var waitFor=function(selector,timeout,root){
    root=root||document;timeout=timeout||8000;
    return new Promise(function(res,rej){
        var el=root.querySelector(selector);
        if(el)return res(el);
        var ob=new MutationObserver(function(){var el2=root.querySelector(selector);if(el2){ob.disconnect();res(el2);}});
        ob.observe(document.body,{childList:true,subtree:true});
        setTimeout(function(){ob.disconnect();rej(new Error('Timeout:'+selector));},timeout);
    });
};

var waitForGone=function(selector,timeout){
    timeout=timeout||5000;
    return new Promise(function(res){
        if(!document.querySelector(selector))return res();
        var ob=new MutationObserver(function(){if(!document.querySelector(selector)){ob.disconnect();res();}});
        ob.observe(document.body,{childList:true,subtree:true});
        setTimeout(function(){ob.disconnect();res();},timeout);
    });
};

var findBtn=function(txt){
    var spans=document.querySelectorAll('span.v-btn__content');
    for(var i=0;i<spans.length;i++){if(spans[i].textContent.trim().toLowerCase()===txt.toLowerCase())return spans[i];}
    return null;
};

/* ── inject file via hidden input intercept ── */
var injectFile=function(file){
    return new Promise(function(res){
        /* نراقب أي input[type=file] يظهر في الـ DOM */
        var done=false;
        var ob=new MutationObserver(function(){
            var inputs=document.querySelectorAll('input[type="file"]');
            inputs.forEach(function(inp){
                if(done)return;
                /* override click لمنع فتح نافذة اختيار الملفات */
                if(!inp._ezhooked){
                    inp._ezhooked=true;
                    inp.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();},true);
                }
                /* حقن الملف */
                try{
                    var dt=new DataTransfer();
                    dt.items.add(file);
                    inp.files=dt.files;
                    inp.dispatchEvent(new Event('change',{bubbles:true}));
                    inp.dispatchEvent(new Event('input',{bubbles:true}));
                    done=true;
                    ob.disconnect();
                    res(inp);
                }catch(e){console.warn('inject err',e);}
            });
        });
        ob.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['type']});

        /* أيضاً جرب inject على أي input موجود حالياً */
        var existing=document.querySelector('input[type="file"]');
        if(existing&&!done){
            existing._ezhooked=true;
            existing.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();},true);
            try{
                var dt2=new DataTransfer();
                dt2.items.add(file);
                existing.files=dt2.files;
                existing.dispatchEvent(new Event('change',{bubbles:true}));
                existing.dispatchEvent(new Event('input',{bubbles:true}));
                done=true;ob.disconnect();res(existing);
            }catch(e){}
        }

        /* timeout بعد 8 ثانية */
        setTimeout(function(){ob.disconnect();if(!done)res(null);},8000);
    });
};

/* ── UI ── */
var old=document.getElementById('ez-uploader-panel');if(old)old.remove();
var panel=document.createElement('div');
panel.id='ez-uploader-panel';
panel.style.cssText='position:fixed;top:20px;right:20px;z-index:9999999;width:400px;max-width:95vw;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);font-family:Cairo,-apple-system,sans-serif;overflow:hidden;direction:rtl';

panel.innerHTML=
'<div style="padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;cursor:move" id="ez-up-header">'+
  '<div style="width:38px;height:38px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff">📤</div>'+
  '<div style="flex:1">'+
    '<div style="font-size:15px;font-weight:900;color:#1e1b4b">رفع ملفات JSON</div>'+
    '<div style="font-size:10px;font-weight:700;color:#94a3b8" id="ez-up-subtitle">اختر الملفات للبدء</div>'+
  '</div>'+
  '<button id="ez-up-close" style="width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:#f3f4f6;font-size:14px">✕</button>'+
'</div>'+
'<div style="padding:16px 22px">'+
  '<div id="ez-up-progress-wrap" style="display:none;margin-bottom:14px">'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'+
      '<span id="ez-up-progress-text" style="font-size:12px;font-weight:800;color:#1e1b4b">0/0</span>'+
      '<span id="ez-up-progress-pct" style="font-size:12px;font-weight:800;color:#6366f1">0%</span>'+
    '</div>'+
    '<div style="height:8px;background:#f1f5f9;border-radius:8px;overflow:hidden">'+
      '<div id="ez-up-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;transition:width 0.3s ease"></div>'+
    '</div>'+
  '</div>'+
  '<div id="ez-up-current" style="display:none;padding:10px 14px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.1);border-radius:12px;margin-bottom:12px">'+
    '<div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:2px">الملف الحالي:</div>'+
    '<div id="ez-up-filename" style="font-size:13px;font-weight:800;color:#1e1b4b;direction:ltr;text-align:left"></div>'+
    '<div id="ez-up-step" style="font-size:11px;font-weight:700;color:#6366f1;margin-top:4px"></div>'+
  '</div>'+
  '<div id="ez-up-log" style="max-height:200px;overflow-y:auto;margin-bottom:12px;font-size:12px"></div>'+
  '<button id="ez-up-start" style="width:100%;height:44px;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,0.25)">📂 اختيار الملفات والبدء</button>'+
  '<div style="display:flex;gap:8px;margin-top:8px">'+
    '<button id="ez-up-pause" style="display:none;flex:1;height:36px;border:1.5px solid rgba(245,158,11,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#f59e0b;background:rgba(245,158,11,0.04)">⏸️ إيقاف مؤقت</button>'+
    '<button id="ez-up-stop" style="display:none;flex:1;height:36px;border:1.5px solid rgba(239,68,68,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#dc2626;background:rgba(239,68,68,0.04)">⏹️ إيقاف</button>'+
  '</div>'+
'</div>';
document.body.appendChild(panel);

/* Drag */
var hdr=document.getElementById('ez-up-header'),pDrag=false,pSX=0,pSY=0,pRight=20,pTop=20;
hdr.addEventListener('mousedown',function(e){if(e.target.closest('button'))return;pDrag=true;pSX=e.clientX+pRight;pSY=e.clientY-pTop;e.preventDefault();});
document.addEventListener('mousemove',function(e){if(pDrag){pRight=Math.max(0,pSX-e.clientX);pTop=Math.max(0,e.clientY-pSY);panel.style.right=pRight+'px';panel.style.top=pTop+'px';}});
document.addEventListener('mouseup',function(){pDrag=false;});
document.getElementById('ez-up-close').onclick=function(){panel.remove();};

var paused=false,stopped=false;
var MAX_RETRIES=3; /* عدد إعادة المحاولات لكل ملف فاشل */

var els={
    subtitle:document.getElementById('ez-up-subtitle'),
    progressWrap:document.getElementById('ez-up-progress-wrap'),
    progressText:document.getElementById('ez-up-progress-text'),
    progressPct:document.getElementById('ez-up-progress-pct'),
    bar:document.getElementById('ez-up-bar'),
    current:document.getElementById('ez-up-current'),
    filename:document.getElementById('ez-up-filename'),
    step:document.getElementById('ez-up-step'),
    log:document.getElementById('ez-up-log'),
    startBtn:document.getElementById('ez-up-start'),
    pauseBtn:document.getElementById('ez-up-pause'),
    stopBtn:document.getElementById('ez-up-stop')
};

function updateProgress(i,total){
    var pct=Math.round((i/total)*100);
    els.progressText.textContent=i+'/'+total;
    els.progressPct.textContent=pct+'%';
    els.bar.style.width=pct+'%';
}
function setStep(txt){els.step.textContent=txt;}

function updateLog(name,ok,msg,retryNum){
    /* ابحث عن سطر موجود لنفس الملف وحدثه */
    var existing=els.log.querySelector('[data-file="'+CSS.escape(name)+'"]');
    if(!existing){
        existing=document.createElement('div');
        existing.setAttribute('data-file',name);
        existing.style.cssText='padding:8px 12px;border-radius:8px;margin-bottom:4px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;transition:all 0.3s';
        els.log.appendChild(existing);
    }
    existing.style.background=ok?'rgba(5,150,105,0.04)':'rgba(239,68,68,0.04)';
    existing.style.color=ok?'#059669':'#dc2626';
    var retryBadge=retryNum>0?'<span style="font-size:9px;background:rgba(245,158,11,0.15);color:#d97706;padding:1px 5px;border-radius:4px;margin-right:4px">محاولة '+(retryNum+1)+'</span>':'';
    existing.innerHTML='<span>'+(ok?'✅':'⏳')+'</span>'+retryBadge+'<span style="flex:1;direction:ltr;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</span><span style="font-size:10px;color:#94a3b8;white-space:nowrap">'+(msg||'')+'</span>';
    if(ok) existing.querySelector('span').textContent='✅';
    else if(msg==='فشل نهائي') existing.querySelector('span').textContent='❌';
    els.log.scrollTop=els.log.scrollHeight;
}

async function checkPause(){while(paused&&!stopped){await delay(200);}}

/* ══════════════════════════════════════
   SINGLE UPLOAD ATTEMPT
   ══════════════════════════════════════ */
async function attemptUpload(file){

    /* أغلق dialog مفتوح */
    if(document.querySelector('.v-dialog--active')){
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:true}));
        await waitForGone('.v-dialog--active',3000);
        await delay(300);
    }

    /* زر الرفع */
    setStep('🔍 البحث عن زر الرفع...');
    var uploadBtn=document.querySelector('.mdi-briefcase-upload');
    if(!uploadBtn) uploadBtn=document.querySelector('[title*="upload"],[title*="Upload"]');
    if(!uploadBtn) return {ok:false,reason:'زر الرفع غير موجود'};
    simulateClick(uploadBtn);

    /* انتظر dialog */
    setStep('⏳ انتظار Dialog...');
    var activeDialog;
    try{activeDialog=await waitFor('.v-dialog--active',7000);}
    catch(e){return{ok:false,reason:'Dialog لم يظهر'};}
    await checkPause(); if(stopped) return{ok:false,reason:'stopped'};

    /* اختر من القائمة */
    setStep('📋 اختيار النوع...');
    try{
        var selectEl=activeDialog.querySelector('.v-select__slot')||
                     activeDialog.querySelector('input[readonly]')||
                     activeDialog.querySelector('.v-select');
        if(selectEl){
            simulateClick(selectEl);
            var menu=await waitFor('.menuable__content__active',3000);
            var firstItem=menu.querySelector('.v-list-item');
            if(firstItem){simulateClick(firstItem);await waitForGone('.menuable__content__active',2000);}
            await delay(300);
        }
    }catch(e){}
    await checkPause(); if(stopped) return{ok:false,reason:'stopped'};

    /* 
     ✅ حقن الملف — بنراقب الـ DOM كله ونحقن في أول input[type=file] يظهر
     بدل البحث الآني الذي يفشل لأن Vuetify يعمل lazy rendering
    */
    setStep('📄 انتظار وحقن الملف...');
    
    /* ابدأ المراقبة قبل أي click */
    var injectPromise=injectFile(file);
    
    /* اضغط على زر اختيار الملف الخاص بـ Vuetify لو موجود */
    var fileBtn=activeDialog.querySelector('.v-file-input button')||
                activeDialog.querySelector('[class*="file"] button')||
                activeDialog.querySelector('button[type="button"]:not(.v-btn--icon)');
    if(fileBtn) simulateClick(fileBtn);
    
    var injected=await injectPromise;
    if(!injected){return{ok:false,reason:'حقل الملف غير موجود'};}
    
    await delay(300);
    await checkPause(); if(stopped) return{ok:false,reason:'stopped'};

    /* Import button */
    setStep('📥 انتظار زر Import...');
    var pressed=false;
    for(var j=0;j<30;j++){
        var importSpan=findBtn('Import');
        if(importSpan){
            var btn=importSpan.closest('button');
            if(btn&&!btn.disabled&&!btn.hasAttribute('disabled')){
                simulateClick(btn);pressed=true;break;
            }
        }
        await delay(200);
    }
    if(!pressed) return{ok:false,reason:'زر Import غير نشط'};
    await checkPause(); if(stopped) return{ok:false,reason:'stopped'};

    /* SweetAlert */
    setStep('⏳ انتظار التأكيد...');
    try{
        var swalOk=await waitFor('.swal2-confirm',12000);
        await delay(150);
        simulateClick(swalOk);
        await waitForGone('.swal2-popup',4000);
        await waitForGone('.v-dialog--active',3000);
        return{ok:true};
    }catch(e){
        return{ok:false,reason:'لم يظهر تأكيد'};
    }
}

/* ══════════════════════════════════════
   UPLOAD WITH AUTO-RETRY
   ══════════════════════════════════════ */
async function uploadWithRetry(file,index,total){
    els.filename.textContent=file.name;
    updateProgress(index,total);

    for(var attempt=0; attempt<=MAX_RETRIES; attempt++){
        if(stopped) return false;
        await checkPause(); if(stopped) return false;

        if(attempt>0){
            setStep('🔄 إعادة المحاولة '+(attempt)+'/'+MAX_RETRIES+'...');
            updateLog(file.name,false,'جاري إعادة المحاولة '+attempt+'...',attempt);
            /* انتظار أطول بين المحاولات */
            await delay(800 + attempt*400);
        }

        var result=await attemptUpload(file);

        if(result.ok){
            updateLog(file.name,true,'',attempt);
            return true;
        }

        if(result.reason==='stopped') return false;

        /* سجل الفشل المؤقت */
        if(attempt<MAX_RETRIES){
            updateLog(file.name,false,result.reason+'  ← سيعيد',attempt);
        } else {
            /* فشل نهائي بعد كل المحاولات */
            updateLog(file.name,false,'فشل نهائي: '+result.reason,attempt);
            return false;
        }
    }
    return false;
}

/* ── Start ── */
els.startBtn.onclick=async function(){
    var files=await new Promise(function(res){
        var inp=document.createElement('input');
        inp.type='file';inp.multiple=true;inp.accept='.json';
        inp.onchange=function(){res(inp.files);};
        inp.click();
    });
    if(!files||!files.length){els.subtitle.textContent='لم يتم اختيار ملفات';return;}

    var total=files.length;
    els.subtitle.textContent='جاري رفع '+total+' ملف...';
    els.progressWrap.style.display='block';
    els.current.style.display='block';
    els.startBtn.style.display='none';
    els.pauseBtn.style.display='block';
    els.stopBtn.style.display='block';
    paused=false;stopped=false;els.log.innerHTML='';

    window.focus();
    document.body.click();
    await delay(400);

    var success=0,fail=0;
    for(var i=0;i<total;i++){
        if(stopped) break;
        await checkPause(); if(stopped) break;
        var ok=await uploadWithRetry(files[i],i+1,total);
        if(ok) success++; else fail++;
        if(i<total-1) await delay(300);
    }

    updateProgress(total,total);
    els.current.style.display='none';
    els.pauseBtn.style.display='none';
    els.stopBtn.style.display='none';
    els.startBtn.style.display='block';
    els.startBtn.textContent='📂 رفع ملفات جديدة';
    els.subtitle.textContent=(stopped?'تم الإيقاف ':'اكتمل ')+success+' نجح'+(fail>0?' | '+fail+' فشل':'');
    els.bar.style.background=fail>0?'linear-gradient(90deg,#f59e0b,#ef4444)':'linear-gradient(90deg,#10b981,#059669)';
};

els.pauseBtn.onclick=function(){
    paused=!paused;
    this.textContent=paused?'▶️ استكمال':'⏸️ إيقاف مؤقت';
    this.style.color=paused?'#059669':'#f59e0b';
    els.subtitle.textContent=paused?'متوقف مؤقتاً...':'جاري الرفع...';
};
els.stopBtn.onclick=function(){stopped=true;els.subtitle.textContent='جاري الإيقاف...';};

})();

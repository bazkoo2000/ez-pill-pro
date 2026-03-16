javascript:(async function(){
'use strict';

/* ══════════════════════════════════════════
    📤 EZ JSON Uploader v2.0 (Optimized)
    رفع ملفات JSON تلقائي لفارمادوسيس
    واجهة مرئية + سرعة + ثبات
   ══════════════════════════════════════════ */

/* ── Helpers ── */
var delay=function(a,b){return new Promise(function(r){setTimeout(r,Math.floor(Math.random()*(b-a+1))+a)})};

var simulateClick=function(el){
    if(!el) return;
    var r=el.getBoundingClientRect();
    var x=r.left+r.width/2, y=r.top+r.height/2;
    var o={bubbles:true,cancelable:true,view:window,clientX:x,clientY:y};
    el.dispatchEvent(new PointerEvent('pointerdown',o));
    el.dispatchEvent(new MouseEvent('mousedown',o));
    el.dispatchEvent(new PointerEvent('pointerup',o));
    el.dispatchEvent(new MouseEvent('mouseup',o));
    el.dispatchEvent(new MouseEvent('click',o));
};

var waitFor=function(selector,timeout){
    timeout=timeout||8000;
    return new Promise(function(res,rej){
        var el=document.querySelector(selector);
        if(el) return res(el);
        var ob=new MutationObserver(function(){
            var el2=document.querySelector(selector);
            if(el2){ob.disconnect();res(el2);}
        });
        ob.observe(document.body,{childList:true,subtree:true});
        setTimeout(function(){ob.disconnect();rej(new Error('Timeout: '+selector))},timeout);
    });
};

var findBtn=function(txt){
    var spans=document.querySelectorAll('span.v-btn__content');
    for(var i=0;i<spans.length;i++){
        if(spans[i].textContent.trim().toLowerCase()===txt.toLowerCase()) return spans[i];
    }
    return null;
};

/* ── UI ── */
var old=document.getElementById('ez-uploader-panel');if(old)old.remove();
var panel=document.createElement('div');
panel.id='ez-uploader-panel';
panel.style.cssText='position:fixed;top:20px;left:20px;z-index:9999999;width:380px;max-width:95vw;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);font-family:Cairo,-apple-system,sans-serif;overflow:hidden;direction:rtl';

panel.innerHTML=
'<div style="padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;cursor:move" id="ez-up-header">'+
  '<div style="width:38px;height:38px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;box-shadow:0 4px 14px rgba(99,102,241,0.25)">📤</div>'+
  '<div style="flex:1"><div style="font-size:15px;font-weight:900;color:#1e1b4b">رفع ملفات JSON</div><div style="font-size:10px;font-weight:700;color:#94a3b8" id="ez-up-subtitle">اختر الملفات للبدء</div></div>'+
  '<button id="ez-up-close" style="width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:#f3f4f6;font-size:14px">✕</button>'+
'</div>'+
'<div style="padding:16px 22px">'+
  /* Progress */
  '<div id="ez-up-progress-wrap" style="display:none;margin-bottom:14px">'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'+
      '<span id="ez-up-progress-text" style="font-size:12px;font-weight:800;color:#1e1b4b">0/0</span>'+
      '<span id="ez-up-progress-pct" style="font-size:12px;font-weight:800;color:#6366f1">0%</span>'+
    '</div>'+
    '<div style="height:8px;background:#f1f5f9;border-radius:8px;overflow:hidden">'+
      '<div id="ez-up-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;transition:width 0.4s ease"></div>'+
    '</div>'+
  '</div>'+
  /* Current file */
  '<div id="ez-up-current" style="display:none;padding:10px 14px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.1);border-radius:12px;margin-bottom:12px">'+
    '<div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:2px">الملف الحالي:</div>'+
    '<div id="ez-up-filename" style="font-size:13px;font-weight:800;color:#1e1b4b;direction:ltr;text-align:left"></div>'+
    '<div id="ez-up-step" style="font-size:11px;font-weight:700;color:#6366f1;margin-top:4px"></div>'+
  '</div>'+
  /* Results log */
  '<div id="ez-up-log" style="max-height:180px;overflow-y:auto;margin-bottom:12px;font-size:12px"></div>'+
  /* Buttons */
  '<button id="ez-up-start" style="width:100%;height:44px;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,0.25);transition:all .2s">📂 اختيار الملفات والبدء</button>'+
  '<div style="display:flex;gap:8px;margin-top:8px">'+
    '<button id="ez-up-pause" style="display:none;flex:1;height:36px;border:1.5px solid rgba(245,158,11,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#f59e0b;background:rgba(245,158,11,0.04)">⏸️ إيقاف مؤقت</button>'+
    '<button id="ez-up-stop" style="display:none;flex:1;height:36px;border:1.5px solid rgba(239,68,68,0.2);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo;color:#dc2626;background:rgba(239,68,68,0.04)">⏹️ إيقاف</button>'+
  '</div>'+
'</div>';
document.body.appendChild(panel);

/* ── Panel drag ── */
var hdr=document.getElementById('ez-up-header'),pDrag=false,pSX=0,pSY=0,pX=0,pY=0;
var rr=panel.getBoundingClientRect();pX=rr.left;pY=rr.top;panel.style.left=pX+'px';panel.style.top=pY+'px';
hdr.addEventListener('mousedown',function(e){if(e.target.closest('button'))return;pDrag=true;pSX=e.clientX-pX;pSY=e.clientY-pY;e.preventDefault()});
document.addEventListener('mousemove',function(e){if(pDrag){pX=e.clientX-pSX;pY=e.clientY-pSY;panel.style.left=pX+'px';panel.style.top=pY+'px'}});
document.addEventListener('mouseup',function(){pDrag=false});
document.getElementById('ez-up-close').onclick=function(){panel.remove()};

/* ── State ── */
var paused=false,stopped=false;
var results=[];

/* ── UI Updates ── */
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

function addLog(name,ok,msg){
    var div=document.createElement('div');
    div.style.cssText='padding:8px 12px;border-radius:8px;margin-bottom:4px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;background:'+(ok?'rgba(5,150,105,0.04)':'rgba(239,68,68,0.04)')+';color:'+(ok?'#059669':'#dc2626');
    div.innerHTML='<span style="font-size:14px">'+(ok?'✅':'❌')+'</span><span style="flex:1;direction:ltr;text-align:left">'+name+'</span><span style="font-size:10px;color:#94a3b8">'+(msg||'')+'</span>';
    els.log.appendChild(div);
    els.log.scrollTop=els.log.scrollHeight;
    results.push({name:name,ok:ok,msg:msg});
}

/* ── Pause handler ── */
async function checkPause(){
    while(paused&&!stopped){await delay(200,300);}
}

/* ── Main upload logic ── */
async function uploadFile(file,index,total){
    els.filename.textContent=file.name;
    updateProgress(index,total);

    /* Step 1: Click upload button */
    setStep('🔍 البحث عن زر الرفع...');
    var uploadBtn=document.querySelector('.mdi-briefcase-upload');
    if(!uploadBtn){
        uploadBtn=document.querySelector('[title*="upload"],[title*="Upload"]');
    }
    if(uploadBtn){
        simulateClick(uploadBtn);
        /* زيادة وقت الانتظار لظهور الدايلوج أول مرة */
        await delay(600,900);
    } else {
        addLog(file.name,false,'زر الرفع غير موجود');
        return false;
    }

    await checkPause();if(stopped) return false;

    /* Step 2: Select from dropdown */
    setStep('📋 اختيار من القائمة...');
    try{
        /* انتظار الدايلوج ليكون نشطاً بالفعل */
        var activeDialog = await waitFor('.v-dialog--active', 5000);
        if(activeDialog){
            var selectInput=activeDialog.querySelector('input[readonly]')||
                             activeDialog.querySelector('.v-select')||
                             document.querySelector('#input-304');
            
            if(selectInput){
                simulateClick(selectInput);
                await delay(400,600);
                var menu=document.querySelector('.menuable__content__active');
                if(menu){
                    var firstItem=menu.querySelector('.v-list-item');
                    if(firstItem){simulateClick(firstItem);await delay(300,500);}
                }
            }
        }
    }catch(e){console.warn('Menu select warning:',e);}

    await checkPause();if(stopped) return false;

    /* Step 3: Inject file */
    setStep('📄 حقن الملف...');
    var fileInput=document.querySelector('.v-dialog--active input[type="file"]')||document.querySelector('input[type="file"]');
    if(!fileInput){
        addLog(file.name,false,'حقل الملف غير موجود');
        return false;
    }
    var dt=new DataTransfer();
    dt.items.add(file);
    fileInput.files=dt.files;
    fileInput.dispatchEvent(new Event('change',{bubbles:true}));
    await delay(1000,1500);

    await checkPause();if(stopped) return false;

    /* Step 4: Click Import */
    setStep('📥 استيراد...');
    var pressed=false;
    for(var j=0;j<15;j++){
        var importBtn=findBtn('Import');
        if(importBtn){
            var btn=importBtn.closest('button')||importBtn;
            if(!btn.disabled){simulateClick(btn);pressed=true;break;}
        }
        await delay(200,400);
    }
    if(!pressed){addLog(file.name,false,'زر Import غير موجود');return false;}

    await checkPause();if(stopped) return false;

    /* Step 5: Wait for SweetAlert confirmation */
    setStep('⏳ في انتظار التأكيد...');
    try{
        var swalOk=await waitFor('.swal2-confirm',10000);
        await delay(200,400);
        simulateClick(swalOk);
        await delay(400,600);
        addLog(file.name,true,'');
        return true;
    }catch(e){
        addLog(file.name,false,'لم يظهر تأكيد');
        return false;
    }
}

/* ── Start button ── */
els.startBtn.onclick=async function(){
    /* Pick files */
    var files=await new Promise(function(res){
        var inp=document.createElement('input');
        inp.type='file';inp.multiple=true;inp.accept='.json';
        inp.onchange=function(){res(inp.files)};
        inp.click();
    });

    if(!files||!files.length){els.subtitle.textContent='لم يتم اختيار ملفات';return;}

    /* Setup UI */
    var total=files.length;
    els.subtitle.textContent='جاري رفع '+total+' ملف...';
    els.progressWrap.style.display='block';
    els.current.style.display='block';
    els.startBtn.style.display='none';
    els.pauseBtn.style.display='block';
    els.stopBtn.style.display='block';
    paused=false;stopped=false;results=[];els.log.innerHTML='';

    /* تأخير بسيط جداً قبل معالجة أول ملف 
       للسماح للواجهة بالاستقرار بعد إغلاق نافذة اختيار الملفات
    */
    await delay(800, 1200);

    /* Process files */
    var success=0,fail=0;
    for(var i=0;i<total;i++){
        if(stopped) break;
        await checkPause();
        if(stopped) break;

        updateProgress(i+1,total);
        var ok=await uploadFile(files[i],i+1,total);
        if(ok) success++; else fail++;
        
        /* تأخير بين كل ملف وآخر لضمان إغلاق الدايلوجات تماماً */
        await delay(600,1000);
    }

    /* Done */
    updateProgress(total,total);
    els.current.style.display='none';
    els.pauseBtn.style.display='none';
    els.stopBtn.style.display='none';
    els.startBtn.style.display='block';
    els.startBtn.textContent='📂 رفع ملفات جديدة';

    var msg=stopped?'تم الإيقاف — ':'اكتمل — ';
    msg+=success+' نجح';
    if(fail>0) msg+=' | '+fail+' فشل';
    els.subtitle.textContent=msg;
    els.bar.style.background=fail>0?'linear-gradient(90deg,#f59e0b,#ef4444)':'linear-gradient(90deg,#10b981,#059669)';
};

/* ── Pause/Stop ── */
els.pauseBtn.onclick=function(){
    paused=!paused;
    this.textContent=paused?'▶️ استكمال':'⏸️ إيقاف مؤقت';
    this.style.color=paused?'#059669':'#f59e0b';
    this.style.borderColor=paused?'rgba(5,150,105,0.2)':'rgba(245,158,11,0.2)';
    els.subtitle.textContent=paused?'متوقف مؤقتاً...':'جاري الرفع...';
};
els.stopBtn.onclick=function(){stopped=true;els.subtitle.textContent='جاري الإيقاف...';};

})();

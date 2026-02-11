javascript:(function(){
var APP_VERSION='133.0';
var APP_NAME='EZ_Pill Pro Light';

/* 1. قاعدة البيانات */
var fixedSizeCodes={'100015980':24,'100015955':24,'100015971':24,'102988654':48,'100013423':10,'100013562':20,'101826688':20,'101284170':30,'103243857':30,'101859640':20,'100726280':24,'100011436':20,'100030493':40,'100011743':30,'103169239':20,'100684294':30,'100009934':48,'100014565':6,'100017942':20,'100633972':20,'100634019':20,'100009926':24,'102371620':24,'100015947':24,'100010652':30,'103437918':30,'103683617':30,'100023592':30,'100023875':20,'100013431':15,'100027201':20,'100016106':10,'100010097':20,'100013167':20};
var weeklyInjections=['102785890','101133232','101943745','101049031','101528656'];

/* 2. وظائف المساعدة */
function detectLanguage(t){ if(!t)return'arabic'; var ar=(t.match(/[\u0600-\u06FF]/g)||[]).length, en=(t.match(/[a-zA-Z]/g)||[]).length; return en>ar?'english':'arabic'; }
function fireEvent(el){ try{ if(el){ el.focus(); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); el.dispatchEvent(new Event('blur',{bubbles:true})); } }catch(e){} }

/* فحص الحاجة للتقسيم (تفعيل الخيار تلقائياً) */
function checkIfDuplicationNeeded(){
    var ts=document.querySelectorAll('table'), tb=null;
    for(var i=0;i<ts.length;i++){ if(ts[i].innerText.toLowerCase().includes('qty')){tb=ts[i];break;} }
    if(!tb) return false;
    var niIdx=-1, hs=tb.querySelector('tr').querySelectorAll('th,td');
    for(var j=0;j<hs.length;j++){ if(hs[j].textContent.toLowerCase().includes('note')){niIdx=j;break;} }
    if(niIdx<0) return false;
    var rows=Array.from(tb.querySelectorAll('tr')).slice(1);
    for(var k=0;k<rows.length;k++){
        var note=rows[k].querySelectorAll('td')[niIdx].innerText.toLowerCase();
        if(/فطر|فطور|غدا|غداء|عشا|عشاء|صباح|مساء|bid|tid|qid|3\s*مرات|2\s*مرات|مرتين|ثلاث|كل\s*8|كل\s*12/i.test(note)) return true;
    }
    return false;
}

/* 3. منطق المعالجة (تثبيت الـ Size) */
function processTable(m,t,autoD,warn,post){
    var ts=document.querySelectorAll('table'), tb=null;
    for(var i=0;i<ts.length;i++){ if(ts[i].innerText.toLowerCase().includes('qty')){tb=ts[i];break;} }
    if(!tb) return;
    var hs=tb.querySelector('tr').querySelectorAll('th,td'), qi=-1, si=-1, ni=-1, ei=-1, ti=-1, ci=-1, di=-1;
    for(var j=0;j<hs.length;j++){
        var txt=hs[j].textContent.toLowerCase();
        if(txt.includes('qty'))qi=j; if(txt.includes('size'))si=j; if(txt.includes('note'))ni=j;
        if(txt.includes('ev'))ei=j; if(txt.includes('time'))ti=j; if(txt.includes('code'))ci=j; if(txt.includes('dose'))di=j;
    }

    Array.from(tb.querySelectorAll('tr')).slice(1).forEach(function(row){
        var tds=row.querySelectorAll('td');
        var cb=row.querySelector('input[type="checkbox"]'); if(cb && !cb.checked) return;
        var note=tds[ni].innerText.toLowerCase(), code=(tds[ci].innerText.match(/\d+/)||[''])[0];
        
        /* فحص التقسيم */
        var is3 = /tid|3\s*مرات|كل\s*8|فطر.*غدا.*عشا/i.test(note);
        var is2 = /bid|مرتين|كل\s*12/i.test(note) || (/فطر|غدا/i.test(note) && /عشا|عشاء/i.test(note));

        if(is3 || is2){
            var ns=t; if(fixedSizeCodes[code]) ns=Math.floor(fixedSizeCodes[code]/(is3?3:2));
            var count=is3?3:2;
            for(var x=0;x<count;x++){
                var nr=row.cloneNode(true), nt=nr.querySelectorAll('td');
                if(si>=0) { var iS=nt[si].querySelector('input'); if(iS){iS.value=ns;fireEvent(iS);} else nt[si].innerText=ns; }
                if(ei>=0) { var iE=nt[ei].querySelector('select,input'); if(iE){iE.value='24';fireEvent(iE);} }
                if(qi>=0) { var iQ=nt[qi].querySelector('input'); if(iQ){iQ.value=(parseInt(tds[qi].innerText)||1)*m;fireEvent(iQ);} }
                var lbl=(x===0?'فطور':(x===1 && is3?'غداء':'عشاء'));
                if(ni>=0) { var iN=nt[ni].querySelector('input,textarea'); if(iN){iN.value='⚡ '+lbl;fireEvent(iN);} else nt[ni].innerText='⚡ '+lbl; }
                row.parentNode.insertBefore(nr,row);
            }
            row.remove();
        } else {
            if(qi>=0) { var iQ=tds[qi].querySelector('input'); if(iQ){iQ.value=(parseInt(tds[qi].innerText)||1)*m;fireEvent(iQ);} }
            if(si>=0) { var iS=tds[si].querySelector('input'); if(iS){iS.value=fixedSizeCodes[code]||t;fireEvent(iS);} }
        }
    });
    window.ezShowToast('تمت المعالجة ✅','success');
    if(post) showPostOptions();
}

/* 4. التصميم (Light & Minimalist) */
var style=document.createElement('style');
style.textContent='\
@import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap");\
.ez-mini{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;z-index:99999;border-radius:15px;background:#fff;border:1px solid #ddd;box-shadow:0 10px 25px rgba(0,0,0,0.1);font-family:"Tajawal",sans-serif;color:#333;}\
.ez-h{padding:10px 15px;background:#f8f9fa;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;border-radius:15px 15px 0 0;cursor:move;}\
.ez-h b{font-size:14px;color:#444;}\
.ez-b{padding:15px;}\
.ez-t{font-size:11px;font-weight:700;color:#888;margin-bottom:8px;display:block;}\
.ez-g{display:flex;gap:5px;margin-bottom:15px;}\
.ez-o{flex:1;height:32px;border:1px solid #ddd;background:#fff;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:0.2s;}\
.ez-o.on{background:#007bff;color:#fff;border-color:#007bff;}\
.ez-chk{display:flex;align-items:center;gap:10px;font-size:12px;margin-bottom:8px;cursor:pointer;}\
.ez-btn{width:100%;height:38px;border:none;border-radius:10px;background:#28a745;color:#fff;font-weight:900;font-size:14px;cursor:pointer;margin-top:10px;box-shadow:0 4px 10px rgba(40,167,69,0.2);}\
.ez-toast{position:fixed;bottom:20px;right:20px;background:#333;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;z-index:100000;transform:translateX(150%);transition:0.4s;}\
.ez-toast.show{transform:translateX(0);}';
document.head.appendChild(style);

window.ezShowToast=function(m){ var t=document.createElement('div'); t.className='ez-toast'; t.innerText=m; document.body.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400)},3000); };
window.sel=function(el,type,val){ el.parentNode.querySelectorAll('.ez-o').forEach(b=>b.classList.remove('on')); el.classList.add('on'); document.getElementById('ez-dlg').setAttribute('data-'+type,val); };

/* فحص تلقائي لتفعيل الخيار الإضافي */
var isDuplicationFound = checkIfDuplicationNeeded();

var dlg=document.createElement('div');
dlg.id='ez-dlg'; dlg.className='ez-mini'; dlg.setAttribute('data-m','1'); dlg.setAttribute('data-t','30');
dlg.innerHTML='\
<div class="ez-h"><b>💊 EZ Pill Pro Light</b><button style="border:none;background:none;font-size:18px;cursor:pointer;color:#aaa" onclick="this.closest(\'.ez-mini\').remove()">×</button></div>\
<div class="ez-b">\
  <span class="ez-t">الأشهر</span>\
  <div class="ez-g"><button class="ez-o on" onclick="window.sel(this,\'m\',1)">1</button><button class="ez-o" onclick="window.sel(this,\'m\',2)">2</button><button class="ez-o" onclick="window.sel(this,\'m\',3)">3</button></div>\
  <span class="ez-t">الأيام</span>\
  <div class="ez-g"><button class="ez-o" onclick="window.sel(this,\'t\',28)">28</button><button class="ez-o on" onclick="window.sel(this,\'t\',30)">30</button></div>\
  <label class="ez-chk"><input type="checkbox" id="ez-auto" checked> استخراج المدة تلقائياً</label>\
  <label class="ez-chk"><input type="checkbox" id="ez-warn" checked> عرض التحذيرات</label>\
  <label class="ez-chk"><input type="checkbox" id="ez-post" '+(isDuplicationFound?'checked':'')+'> خيارات إضافية (Undo)</label>\
  <button class="ez-btn" onclick="window.ezDo()">⚡ تنفيذ المعالجة</button>\
</div><div style="text-align:center;font-size:8px;color:#ccc;padding-bottom:10px">Ali Al-Baz Editor</div>';

window.ezDo=function(){
    var d=document.getElementById('ez-dlg'), m=parseInt(d.getAttribute('data-m')), t=parseInt(d.getAttribute('data-t')), 
    auto=document.getElementById('ez-auto').checked, warn=document.getElementById('ez-warn').checked, post=document.getElementById('ez-post').checked;
    d.remove(); processTable(m,t,auto,warn,post);
};

window.showPostOptions=function(){
    var p=document.createElement('div'); p.className='ez-mini'; p.style.top='50px'; p.style.left='auto'; p.style.right='20px'; p.style.transform='none';
    p.innerHTML='<div class="ez-h"><b>⚙️ خيارات</b></div><div class="ez-b"><button class="ez-btn" style="background:#ffc107;color:#333" onclick="window.ezUndoDuplicates()">🔄 إلغاء التقسيم</button></div>';
    document.body.appendChild(p);
};

document.body.appendChild(dlg);
/* سحب الدايلوج */
var p1=0,p2=0,p3=0,p4=0,h=dlg.querySelector('.ez-h');
h.onmousedown=function(e){ e=e||window.event; p3=e.clientX; p4=e.clientY; document.onmouseup=function(){document.onmouseup=null;document.onmousemove=null;}; document.onmousemove=function(e){e=e||window.event; p1=p3-e.clientX; p2=p4-e.clientY; p3=e.clientX; p4=e.clientY; dlg.style.top=(dlg.offsetTop-p2)+"px"; dlg.style.left=(dlg.offsetLeft-p1)+"px"; dlg.style.right="auto"; dlg.style.transform="none";};};
})();

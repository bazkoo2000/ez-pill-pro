javascript:(async function(){
'use strict';

/* ══════════════════════════════════════════
   🔌 EZ Device Filler v3
   ══════════════════════════════════════════ */

var API_URL='https://amcoplusapi.farmadosis.com/api/installations/22/cassettes/search?page=1&itemsPerPage=-1&sortDesc[]=false&mustSort=false&multiSort=false&is_active=true&query=&find_deactived_cassette_medicines=0';

var toast=function(msg,ok){
    var t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999999;font-family:Cairo,sans-serif;backdrop-filter:blur(20px);box-shadow:0 8px 30px rgba(0,0,0,0.12);color:'+(ok?'#059669':'#dc2626')+';background:#fff;border:1px solid '+(ok?'rgba(5,150,105,0.1)':'rgba(220,38,38,0.1)');
    t.textContent=msg;document.body.appendChild(t);
    setTimeout(function(){t.remove()},4000);
};

/* Loading */
var loadDiv=document.createElement('div');
loadDiv.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:20px;padding:30px 40px;box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:9999999;text-align:center;font-family:Cairo,sans-serif;direction:rtl';
loadDiv.innerHTML='<div style="font-size:30px;margin-bottom:10px">⏳</div><div style="font-size:15px;font-weight:800;color:#1e1b4b">جاري سحب بيانات الأجهزة...</div><div id="ez-dev-status" style="font-size:12px;color:#64748b;margin-top:6px">جاري الاتصال بالـ API</div>';
document.body.appendChild(loadDiv);
var statusEl=document.getElementById('ez-dev-status');

try{
    /* ── Step 1: Get auth token ── */
    statusEl.textContent='جاري البحث عن التوكن...';
    var authToken='';
    for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        var v=localStorage.getItem(k);
        if(v&&(k.toLowerCase().indexOf('token')>-1||k.toLowerCase().indexOf('auth')>-1)){
            var clean=v.replace(/^"|"$/g,'').trim();
            if(clean.length>20&&clean.length<200&&!clean.startsWith('{')&&!clean.startsWith('[')){authToken=clean;break;}
        }
    }
    /* Fallback: try cookie */
    if(!authToken){
        var cookies=document.cookie.split(';');
        for(var ci=0;ci<cookies.length;ci++){
            var ck=cookies[ci].trim();
            if(ck.indexOf('token=')>-1||ck.indexOf('auth=')>-1){authToken=ck.split('=').slice(1).join('=');break;}
        }
    }
    console.log('🔌 Token:',authToken?authToken.substring(0,15)+'...':'NOT FOUND');
    if(!authToken){loadDiv.remove();toast('لم يتم العثور على توكن — سجل دخول أولاً',false);return;}

    /* ── Step 2: Fetch cassettes ── */
    statusEl.textContent='جاري سحب الكاسيتات...';
    var resp=await fetch(API_URL,{
        credentials:'include',
        headers:{'Accept':'application/json','Content-Type':'application/json','Authorization':'Bearer '+authToken}
    });

    if(!resp.ok){
        console.error('🔌 API response:',resp.status);
        loadDiv.remove();toast('فشل الاتصال: '+resp.status,false);return;
    }

    var data=await resp.json();
    var items=Array.isArray(data)?data:(data.results||data.data||data.items||data.cassettes||[]);
    console.log('🔌 Raw response keys:',Object.keys(data));
    console.log('🔌 Items:',items.length);
    if(items.length) console.log('🔌 Sample item keys:',Object.keys(items[0]));
    if(items.length) console.log('🔌 Sample item:',items[0]);

    /* Build map: code → {base, num} */
    var cassetteMap={};
    for(var di=0;di<items.length;di++){
        var item=items[di];
        /* Try all possible key names */
        var code=String(item.code||item.Code||item.product_code||item.productCode||item.drug_code||item.medicine_code||'').trim();
        var base=String(item.base||item.Base||item.base_position||item.basePosition||item.location||'').trim();
        var num=String(item.num||item.Num||item.number||item.position||item.cassette_number||item.cassetteNumber||item.slot||'').trim();
        if(code) cassetteMap[code]={base:base,num:num};
    }

    var found=Object.keys(cassetteMap).length;
    statusEl.textContent='تم: '+found+' صنف — جاري ملء الجدول...';
    console.log('🔌 Cassette map size:',found);

    if(found===0){
        loadDiv.remove();
        toast('البيانات فاضية — افتح الكونسول',false);
        console.log('🔌 ❌ Items received but no codes parsed. Check sample item above.');
        return;
    }

    /* ── Step 3: Find checked rows only ── */
    var mainTable=document.querySelector('table');
    if(!mainTable){loadDiv.remove();toast('لم يتم العثور على جدول',false);return;}

    var mainRows=mainTable.querySelectorAll('tr');
    var mainThs=mainRows[0].querySelectorAll('th,td');
    var mColCode=-1,mColDevice=-1;
    for(var mi=0;mi<mainThs.length;mi++){
        var mt=(mainThs[mi].textContent||'').trim().toLowerCase();
        if(mt==='code') mColCode=mi;
        if(mt==='device'||mt.indexOf('device')>-1) mColDevice=mi;
    }

    if(mColCode<0||mColDevice<0){
        loadDiv.remove();
        toast('لم يتم العثور على عمود Code أو Device',false);
        console.log('🔌 Headers found:',Array.from(mainThs).map(function(th){return th.textContent.trim()}));
        return;
    }

    var filled=0,notFound=0,skipped=0;
    for(var mri=1;mri<mainRows.length;mri++){
        var row=mainRows[mri];
        var mtds=row.querySelectorAll('td');
        if(!mtds.length||mColCode>=mtds.length||mColDevice>=mtds.length) continue;

        /* Check if row is selected (has checked checkbox or selection ripple) */
        var isChecked=false;
        var checkbox=row.querySelector('input[type="checkbox"]');
        if(checkbox&&checkbox.checked) isChecked=true;
        /* Vuetify: check for v-data-table__selected or mdi-checkbox-marked */
        if(!isChecked&&row.classList.contains('v-data-table__selected')) isChecked=true;
        if(!isChecked&&row.querySelector('.mdi-checkbox-marked,.v-simple-checkbox .v-icon.mdi-checkbox-marked')) isChecked=true;
        /* Check for selection-controls__ripple with active state */
        if(!isChecked){
            var ripple=row.querySelector('.v-input--selection-controls__ripple');
            if(ripple){
                var parentInput=ripple.closest('.v-input');
                if(parentInput&&(parentInput.classList.contains('v-input--is-label-active')||parentInput.querySelector('.mdi-checkbox-marked'))) isChecked=true;
            }
        }
        /* Check aria-checked */
        if(!isChecked){
            var ariaCheck=row.querySelector('[aria-checked="true"]');
            if(ariaCheck) isChecked=true;
        }

        if(!isChecked){skipped++;continue;}

        var drugCode=(mtds[mColCode].textContent||'').trim();
        if(!drugCode) continue;

        var info=cassetteMap[drugCode];
        if(info){
            var deviceText=info.base||info.num||'—';
            var color=info.base?'#059669':'#f59e0b';
            var title=info.base?'Base: '+info.base:'Num: '+info.num;
            mtds[mColDevice].innerHTML='<span style="font-weight:800;color:'+color+';font-size:13px" title="'+title+'">'+deviceText+'</span>';
            filled++;
        } else {
            mtds[mColDevice].innerHTML='<span style="color:#dc2626;font-size:11px;font-weight:700">✗ غير موجود</span>';
            notFound++;
        }
    }

    loadDiv.remove();
    toast('تم: '+filled+' صنف ✅ | '+notFound+' غير موجود | '+skipped+' غير محدد',true);
    console.log('🔌 ✅ Filled:',filled,'Not found:',notFound,'Skipped:',skipped);

}catch(e){
    loadDiv.remove();
    toast('خطأ: '+e.message,false);
    console.error('🔌 Error:',e);
}
})();

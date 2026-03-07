javascript:(async function(){
'use strict';

/* ══════════════════════════════════════════
   🔌 EZ Device Filler
   يسحب بيانات الديفايس من صفحة الكاسيتات
   ويملأها في صفحة الطلب تلقائي
   ══════════════════════════════════════════ */

var CASSETTES_URL=location.origin+'/installations/22/cassettes/';
var toast=function(msg,ok){
    var t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999999;font-family:Cairo,sans-serif;backdrop-filter:blur(20px);box-shadow:0 8px 30px rgba(0,0,0,0.12);color:'+(ok?'#059669':'#dc2626')+';background:#fff;border:1px solid '+(ok?'rgba(5,150,105,0.1)':'rgba(220,38,38,0.1)');
    t.textContent=msg;document.body.appendChild(t);
    setTimeout(function(){t.remove()},3500);
};

/* ── Step 1: Show loading ── */
var loadDiv=document.createElement('div');
loadDiv.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:20px;padding:30px 40px;box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:9999999;text-align:center;font-family:Cairo,sans-serif;direction:rtl';
loadDiv.innerHTML='<div style="font-size:30px;margin-bottom:10px">⏳</div><div style="font-size:15px;font-weight:800;color:#1e1b4b">جاري سحب بيانات الأجهزة...</div><div id="ez-dev-status" style="font-size:12px;color:#64748b;margin-top:6px">يتم قراءة صفحة الكاسيتات</div>';
document.body.appendChild(loadDiv);
var statusEl=document.getElementById('ez-dev-status');

try{
    /* ── Step 2: Fetch cassettes page ── */
    statusEl.textContent='جاري فتح صفحة الكاسيتات...';
    var resp=await fetch(CASSETTES_URL,{credentials:'same-origin'});
    if(!resp.ok) throw new Error('فشل فتح الصفحة: '+resp.status);
    var html=await resp.text();

    /* ── Step 3: Parse cassettes table ── */
    statusEl.textContent='جاري تحليل البيانات...';
    var parser=new DOMParser();
    var doc=parser.parseFromString(html,'text/html');

    /* Try to find cassette data — could be in table or in JS/JSON */
    var cassetteMap={};  /* code → {base, num} */
    var found=0;

    /* Method 1: Parse HTML table */
    var tables=doc.querySelectorAll('table');
    for(var ti=0;ti<tables.length;ti++){
        var rows=tables[ti].querySelectorAll('tr');
        if(rows.length<2) continue;
        var ths=rows[0].querySelectorAll('th,td');
        var colCode=-1,colBase=-1,colNum=-1;
        for(var hi=0;hi<ths.length;hi++){
            var ht=(ths[hi].textContent||'').trim().toLowerCase();
            if(ht==='code'||ht.indexOf('code')>-1) colCode=hi;
            if(ht==='base') colBase=hi;
            if(ht==='num'||ht==='num.') colNum=hi;
        }
        if(colCode<0) continue;
        for(var ri=1;ri<rows.length;ri++){
            var tds=rows[ri].querySelectorAll('td');
            if(!tds.length) continue;
            var code=(tds[colCode]?tds[colCode].textContent:'').trim();
            var base=(colBase>=0&&tds[colBase])?tds[colBase].textContent.trim():'';
            var num=(colNum>=0&&tds[colNum])?tds[colNum].textContent.trim():'';
            if(code){
                cassetteMap[code]={base:base,num:num};
                found++;
            }
        }
    }

    /* Method 2: Try API endpoint if table parsing found nothing */
    if(found===0){
        statusEl.textContent='جاري البحث في الـ API...';
        /* Try common API patterns */
        var apiUrls=[
            location.origin+'/api/installations/22/cassettes/',
            location.origin+'/api/v1/installations/22/cassettes/',
            location.origin+'/installations/22/cassettes/?format=json',
            location.origin+'/installations/22/cassettes/list/',
        ];
        for(var ai=0;ai<apiUrls.length;ai++){
            try{
                var apiResp=await fetch(apiUrls[ai],{credentials:'same-origin',headers:{'Accept':'application/json','X-Requested-With':'XMLHttpRequest'}});
                if(apiResp.ok){
                    var contentType=apiResp.headers.get('content-type')||'';
                    if(contentType.indexOf('json')>-1){
                        var apiData=await apiResp.json();
                        var items=Array.isArray(apiData)?apiData:(apiData.results||apiData.data||apiData.items||[]);
                        for(var di=0;di<items.length;di++){
                            var item=items[di];
                            var c=String(item.code||item.Code||item.product_code||'').trim();
                            var b=String(item.base||item.Base||item.base_position||'').trim();
                            var nm=String(item.num||item.Num||item.number||item.position||'').trim();
                            if(c){cassetteMap[c]={base:b,num:nm};found++;}
                        }
                        if(found>0){statusEl.textContent='تم من الـ API: '+found+' صنف';break;}
                    }
                }
            }catch(e){/* try next */}
        }
    }

    /* Method 3: Search for JSON data embedded in page */
    if(found===0){
        var scripts=doc.querySelectorAll('script');
        for(var si=0;si<scripts.length;si++){
            var txt=scripts[si].textContent||'';
            /* Look for cassette data patterns */
            var jsonMatch=txt.match(/cassettes?\s*[:=]\s*(\[[\s\S]*?\])/i);
            if(jsonMatch){
                try{
                    var jd=JSON.parse(jsonMatch[1]);
                    for(var ji=0;ji<jd.length;ji++){
                        var jc=String(jd[ji].code||jd[ji].Code||'').trim();
                        var jb=String(jd[ji].base||jd[ji].Base||'').trim();
                        var jn=String(jd[ji].num||jd[ji].Num||'').trim();
                        if(jc){cassetteMap[jc]={base:jb,num:jn};found++;}
                    }
                }catch(e){}
            }
        }
    }

    statusEl.textContent='تم العثور على '+found+' صنف في الكاسيتات';
    console.log('🔌 Cassette map:',cassetteMap);
    console.log('🔌 Total found:',found);

    if(found===0){
        loadDiv.remove();
        toast('لم يتم العثور على بيانات — افتح الكونسول (F12)',false);

        /* Log the page source for debugging */
        console.log('🔌 === DEBUG: Cassettes page HTML (first 5000 chars) ===');
        console.log(html.substring(0,5000));
        console.log('🔌 === DEBUG: Tables found:',doc.querySelectorAll('table').length);
        console.log('🔌 === DEBUG: Full URL tried:',CASSETTES_URL);
        return;
    }

    /* ── Step 4: Fill Device column in Recharge report ── */
    statusEl.textContent='جاري ملء خانة الديفايس...';
    var mainTable=document.querySelector('table');
    if(!mainTable){loadDiv.remove();toast('لم يتم العثور على جدول الطلب',false);return;}

    var mainRows=mainTable.querySelectorAll('tr');
    var mainThs=mainRows[0].querySelectorAll('th,td');
    var mColCode=-1,mColDevice=-1;
    for(var mi=0;mi<mainThs.length;mi++){
        var mt=(mainThs[mi].textContent||'').trim().toLowerCase();
        if(mt==='code') mColCode=mi;
        if(mt==='device'||mt.indexOf('device')>-1) mColDevice=mi;
    }

    if(mColCode<0||mColDevice<0){loadDiv.remove();toast('لم يتم العثور على عمود Code أو Device',false);return;}

    var filled=0,notFound=0;
    for(var mri=1;mri<mainRows.length;mri++){
        var mtds=mainRows[mri].querySelectorAll('td');
        if(!mtds.length||mColCode>=mtds.length||mColDevice>=mtds.length) continue;
        var drugCode=(mtds[mColCode].textContent||'').trim();
        if(!drugCode) continue;

        var info=cassetteMap[drugCode];
        if(info){
            var deviceText=info.base||info.num||'—';
            /* Color code: green if has base (in machine), orange if only num */
            var color=info.base?'#059669':'#f59e0b';
            var label=info.base?'Base: '+info.base:'Num: '+info.num;
            mtds[mColDevice].innerHTML='<span style="font-weight:800;color:'+color+';font-size:13px" title="'+label+'">'+deviceText+'</span>';
            filled++;
        } else {
            mtds[mColDevice].innerHTML='<span style="color:#dc2626;font-size:12px;font-weight:700">غير موجود</span>';
            notFound++;
        }
    }

    loadDiv.remove();
    toast('تم ملء '+filled+' صنف — '+notFound+' غير موجود',true);
    console.log('🔌 Filled:',filled,'Not found:',notFound);

}catch(e){
    loadDiv.remove();
    toast('خطأ: '+e.message,false);
    console.error('🔌 Error:',e);
}
})();

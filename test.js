javascript:(async function(){
'use strict';

/* ══════════════════════════════════════════
   🔌 EZ Device Filler v4
   يفتح صفحة الكاسيتات ويسحب البيانات منها
   ══════════════════════════════════════════ */

var CASSETTES_PATH='/installations/22/cassettes/';

var toast=function(msg,ok){
    var t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999999;font-family:Cairo,sans-serif;backdrop-filter:blur(20px);box-shadow:0 8px 30px rgba(0,0,0,0.12);color:'+(ok?'#059669':'#dc2626')+';background:#fff;border:1px solid '+(ok?'rgba(5,150,105,0.1)':'rgba(220,38,38,0.1)');
    t.textContent=msg;document.body.appendChild(t);
    setTimeout(function(){t.remove()},4000);
};

/* Loading */
var loadDiv=document.createElement('div');
loadDiv.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:20px;padding:30px 40px;box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:9999999;text-align:center;font-family:Cairo,sans-serif;direction:rtl';
loadDiv.innerHTML='<div style="font-size:30px;margin-bottom:10px">⏳</div><div style="font-size:15px;font-weight:800;color:#1e1b4b">جاري سحب بيانات الأجهزة...</div><div id="ez-dev-status" style="font-size:12px;color:#64748b;margin-top:6px">جاري فتح صفحة الكاسيتات</div>';
document.body.appendChild(loadDiv);
var statusEl=document.getElementById('ez-dev-status');

try{
    /* ── Step 1: Try using the app's own axios instance ── */
    statusEl.textContent='جاري البحث عن الاتصال...';
    var cassetteMap={};
    var found=0;
    var gotData=false;

    /* Method 1: Use Nuxt/Vue $axios from the app itself */
    var nuxtRoot=document.getElementById('__nuxt');
    if(nuxtRoot&&nuxtRoot.__vue__){
        statusEl.textContent='جاري استخدام اتصال التطبيق...';
        try{
            var vm=nuxtRoot.__vue__;
            /* Walk up to find $axios */
            var ax=vm.$axios||vm.$root.$axios||(vm.$nuxt&&vm.$nuxt.$axios);
            if(ax){
                console.log('🔌 Found $axios, fetching cassettes...');
                var apiUrl='/api/installations/22/cassettes/search?page=1&itemsPerPage=-1&sortDesc[]=false&mustSort=false&multiSort=false&is_active=true&query=&find_deactived_cassette_medicines=0';
                var resp=await ax.get(apiUrl);
                var data=resp.data;
                console.log('🔌 Response keys:',Object.keys(data));
                var items=Array.isArray(data)?data:(data.results||data.data||data.items||data.rows||[]);
                console.log('🔌 Items:',items.length);
                if(items.length){
                    console.log('🔌 Sample keys:',Object.keys(items[0]));
                    console.log('🔌 Sample:',items[0]);
                }
                for(var di=0;di<items.length;di++){
                    var item=items[di];
                    var code=String(item.code||item.Code||item.product_code||item.productCode||item.drug_code||item.medicine_code||'').trim();
                    var base=String(item.base||item.Base||item.base_position||item.basePosition||item.location||'').trim();
                    var num=String(item.num||item.Num||item.number||item.position||item.cassette_number||item.cassetteNumber||item.slot||'').trim();
                    if(code){cassetteMap[code]={base:base,num:num};found++;}
                }
                if(found>0) gotData=true;
            } else {
                console.log('🔌 $axios not found on root, searching children...');
                /* Try to find axios in $nuxt context */
                if(vm.$nuxt){
                    var ctx=vm.$nuxt.$options.context;
                    if(ctx&&ctx.$axios){
                        ax=ctx.$axios;
                        var resp2=await ax.get('/api/installations/22/cassettes/search?page=1&itemsPerPage=-1&is_active=true');
                        var items2=Array.isArray(resp2.data)?resp2.data:(resp2.data.results||resp2.data.data||resp2.data.items||resp2.data.rows||[]);
                        console.log('🔌 Context axios items:',items2.length);
                        if(items2.length) console.log('🔌 Sample:',items2[0]);
                        for(var d2=0;d2<items2.length;d2++){
                            var i2=items2[d2];
                            var c2=String(i2.code||i2.Code||i2.product_code||'').trim();
                            var b2=String(i2.base||i2.Base||'').trim();
                            var n2=String(i2.num||i2.Num||i2.number||'').trim();
                            if(c2){cassetteMap[c2]={base:b2,num:n2};found++;}
                        }
                        if(found>0) gotData=true;
                    }
                }
            }
        }catch(e){console.warn('🔌 Axios method error:',e);}
    }

    /* Method 2: If axios failed, open popup and read from rendered page */
    if(!gotData){
        statusEl.textContent='جاري فتح صفحة الكاسيتات...';
        console.log('🔌 Axios not available, opening popup...');
        var popup=window.open(location.origin+CASSETTES_PATH,'_blank','width=1200,height=800');
        if(!popup){loadDiv.remove();toast('فعّل النوافذ المنبثقة (popups) وجرب تاني',false);return;}

        /* Wait for page to load and render */
        statusEl.textContent='جاري انتظار تحميل الصفحة...';
        await new Promise(function(resolve){setTimeout(resolve,3000)});

        /* Try to get axios from popup */
        var maxWait=30;
        var interval=setInterval(async function(){
            maxWait--;
            statusEl.textContent='جاري انتظار البيانات... ('+maxWait+')';
            try{
                var pNuxt=popup.document.getElementById('__nuxt');
                if(pNuxt&&pNuxt.__vue__){
                    var pvm=pNuxt.__vue__;
                    var pax=pvm.$axios||pvm.$root.$axios||(pvm.$nuxt&&pvm.$nuxt.$axios);
                    if(pax){
                        clearInterval(interval);
                        console.log('🔌 Got $axios from popup');
                        try{
                            var pr=await pax.get('/api/installations/22/cassettes/search?page=1&itemsPerPage=-1&is_active=true&query=&find_deactived_cassette_medicines=0');
                            var pd=pr.data;
                            var pi=Array.isArray(pd)?pd:(pd.results||pd.data||pd.items||pd.rows||[]);
                            console.log('🔌 Popup items:',pi.length);
                            if(pi.length) console.log('🔌 Sample:',pi[0]);
                            for(var pk=0;pk<pi.length;pk++){
                                var px=pi[pk];
                                var pc=String(px.code||px.Code||px.product_code||'').trim();
                                var pb=String(px.base||px.Base||'').trim();
                                var pn=String(px.num||px.Num||px.number||'').trim();
                                if(pc){cassetteMap[pc]={base:pb,num:pn};found++;}
                            }
                        }catch(e3){console.warn('🔌 Popup fetch error:',e3);}
                        popup.close();
                        gotData=found>0;
                        fillTable();
                    }
                }
                /* Also try reading table from popup DOM */
                if(!gotData){
                    var ptable=popup.document.querySelector('table');
                    if(ptable){
                        var prows=ptable.querySelectorAll('tr');
                        if(prows.length>5){ /* Data loaded */
                            clearInterval(interval);
                            console.log('🔌 Reading from popup table, rows:',prows.length);
                            var pths=prows[0].querySelectorAll('th,td');
                            var pcCode=-1,pcBase=-1,pcNum=-1;
                            for(var phi=0;phi<pths.length;phi++){
                                var pht=(pths[phi].textContent||'').trim().toLowerCase();
                                if(pht==='code') pcCode=phi;
                                if(pht==='base') pcBase=phi;
                                if(pht==='num'||pht==='num.') pcNum=phi;
                            }
                            console.log('🔌 Popup columns — Code:',pcCode,'Base:',pcBase,'Num:',pcNum);
                            if(pcCode>=0){
                                for(var pri=1;pri<prows.length;pri++){
                                    var ptds=prows[pri].querySelectorAll('td');
                                    if(!ptds.length) continue;
                                    var pcc=(ptds[pcCode]?ptds[pcCode].textContent:'').trim();
                                    var pbb=(pcBase>=0&&ptds[pcBase])?ptds[pcBase].textContent.trim():'';
                                    var pnn=(pcNum>=0&&ptds[pcNum])?ptds[pcNum].textContent.trim():'';
                                    if(pcc){cassetteMap[pcc]={base:pbb,num:pnn};found++;}
                                }
                            }
                            popup.close();
                            gotData=found>0;
                            fillTable();
                        }
                    }
                }
            }catch(e){/* cross-origin or not loaded yet */}
            if(maxWait<=0){
                clearInterval(interval);
                popup.close();
                loadDiv.remove();
                toast('انتهى الوقت — البيانات لم تتحمل',false);
            }
        },1000);
        return; /* fillTable will be called from interval */
    }

    if(gotData) fillTable();

    function fillTable(){
        console.log('🔌 Cassette map size:',found);
        if(found===0){loadDiv.remove();toast('لم يتم العثور على بيانات',false);return;}

        statusEl.textContent='تم: '+found+' — جاري ملء الجدول...';

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
            toast('عمود Code أو Device مش موجود',false);
            console.log('🔌 Headers:',Array.from(mainThs).map(function(th){return th.textContent.trim()}));
            return;
        }

        var filled=0,notFound=0,skipped=0;
        for(var mri=1;mri<mainRows.length;mri++){
            var row=mainRows[mri];
            var mtds=row.querySelectorAll('td');
            if(!mtds.length||mColCode>=mtds.length||mColDevice>=mtds.length) continue;

            /* Check if row is selected */
            var isChecked=false;
            var cb=row.querySelector('input[type="checkbox"]');
            if(cb&&cb.checked) isChecked=true;
            if(!isChecked&&row.classList.contains('v-data-table__selected')) isChecked=true;
            if(!isChecked&&row.querySelector('.mdi-checkbox-marked')) isChecked=true;
            if(!isChecked){
                var ripple=row.querySelector('.v-input--selection-controls__ripple');
                if(ripple){var pi2=ripple.closest('.v-input');if(pi2&&(pi2.classList.contains('v-input--is-label-active')||pi2.querySelector('.mdi-checkbox-marked')))isChecked=true;}
            }
            if(!isChecked){var ac=row.querySelector('[aria-checked="true"]');if(ac)isChecked=true;}

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
                mtds[mColDevice].innerHTML='<span style="color:#dc2626;font-size:11px;font-weight:700">✗</span>';
                notFound++;
            }
        }

        loadDiv.remove();
        toast('تم: '+filled+' ✅ | '+notFound+' غير موجود | '+skipped+' غير محدد',true);
        console.log('🔌 ✅ Filled:',filled,'Not found:',notFound,'Skipped:',skipped);
    }

}catch(e){
    loadDiv.remove();
    toast('خطأ: '+e.message,false);
    console.error('🔌 Error:',e);
}
})();

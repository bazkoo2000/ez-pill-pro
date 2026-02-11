(function(){
    var d=document,id='ali_sys_v22',vSet=new Set(),savedRows=[];
    if(d.getElementById(id))d.getElementById(id).remove();
    var pNodes=Array.from(d.querySelectorAll('.pagination a, .pagination li')).map(function(el){return parseInt(el.innerText.trim())}).filter(function(n){return !isNaN(n)}),pLim=pNodes.length>0?Math.max.apply(Math,pNodes):1;
    var s=d.createElement('style');
    s.innerHTML='#ali_sys_v22{position:fixed;top:5%;right:2%;background:rgba(252,252,252,0.98);backdrop-filter:blur(15px);border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,0.3);padding:25px;z-index:999999;width:320px;color:#333;direction:rtl;border:1.5px solid #1a73e8;transition:0.3s;font-family:"Segoe UI",sans-serif;text-align:center}.minimized{width:60px!important;height:60px!important;padding:0!important;border-radius:50%!important;cursor:pointer!important;display:flex!important;align-items:center;justify-content:center}.minimized::before{content:"⚙️";font-size:30px}#ali_h2{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;padding-bottom:10px;margin-bottom:10px}.s-in{width:100%;padding:12px;border:1px solid #ccc;border-radius:12px;font-size:14px;margin-bottom:10px;outline:none;box-sizing:border-box}.d-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:700;font-size:14px;margin-top:8px}.b-blue{background:#1a73e8;color:#fff}.b-green{background:#28a745!important;color:#fff}.ali-stats-wrapper{display:flex;justify-content:space-around;margin:10px 0;padding:12px;background:#f8f9fa;border-radius:12px;border:1px solid #eee}.ali-cnt-val{padding:4px 10px;border-radius:8px;color:#fff;font-weight:bold;font-size:16px;display:inline-block;min-width:45px}#p-bar{height:8px;background:#f0f0f0;margin-top:10px;border-radius:4px;overflow:hidden}#p-fill{height:100%;background:#1a73e8;width:0%;transition:0.6s}';
    d.head.appendChild(s);
    var v=d.createElement('div');
    v.id=id;
    v.innerHTML='<div id="ali_h2"><span id="ali_min" style="cursor:pointer;font-size:28px;color:#1a73e8;font-weight:bold">−</span><h3 style="margin:0;font-size:18px;color:#1a73e8;flex-grow:1;text-align:center">فحص وتحليل</h3><span id="ali_close" style="cursor:pointer;font-size:22px;color:#ccc;font-weight:bold">✖</span></div><div id="ali_stats" class="ali-stats-wrapper"><div style="text-align:center">الإجمالي<br><span id="stat_total" class="ali-cnt-val" style="background:#1a73e8">0</span></div><div style="text-align:center;border-right:1px solid #ddd">المطابق<br><span id="stat_rec" class="ali-cnt-val" style="background:#28a745">0</span></div></div><div id="ali_main_body"><div style="background:#fdfdfd;padding:15px;border-radius:12px;margin:10px 0;border:1px solid #f0f0f0">عدد الصفحات: <input type="number" id="p_lim" value="'+pLim+'" style="width:55px;text-align:center;border:1.5px solid #1a73e8;border-radius:5px;font-size:18px;font-weight:bold"></div><div id="p-bar"><div id="p-fill"></div></div><div id="status-msg" style="font-size:12px;margin-top:10px;color:#666">جاهز...</div><button class="d-btn b-blue" id="start">بدء تجميع الصفحات</button></div><div style="font-size:11px;margin-top:15px;color:#999;font-weight:600">المطور: علي الباز</div>';
    d.body.appendChild(v);
    v.onclick=function(e){if(this.classList.contains('minimized')){this.classList.remove('minimized');e.stopPropagation()}};
    d.getElementById('ali_close').onclick=function(e){e.stopPropagation();v.remove()};
    d.getElementById('ali_min').onclick=function(e){e.stopPropagation();v.classList.add('minimized')};
    var upC=function(mC){d.getElementById('stat_total').innerText=savedRows.length;d.getElementById('stat_rec').innerText=mC||0};
    var run=function(curr,lim){
        var pf=d.getElementById('p-fill');
        pf.style.width=(curr/lim*100)+'%';
        d.getElementById('status-msg').innerText='تحليل ص '+curr;
        d.querySelectorAll('table tr').forEach(function(r){
            var td=r.querySelectorAll('td');
            if(td.length>1){
                var k=td[0].innerText.trim();
                if(k.length>3&&!vSet.has(k)){
                    vSet.add(k);
                    var args=null;
                    var lb=r.querySelector('label[onclick^="getDetails"]');
                    if(lb){var m=lb.getAttribute('onclick').match(/\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'/);if(m)args=[m[1],m[2],m[3],m[4]]}
                    var cln=r.cloneNode(true);
                    savedRows.push({id:k,onl:td[1].innerText.trim(),node:cln,args:args})
                }
            }
        });
        upC(0);
        if(curr<lim){
            var nxt=Array.from(d.querySelectorAll('.pagination a, .pagination li')).find(function(el){return el.innerText.trim()==(curr+1)});
            if(nxt){nxt.click();setTimeout(function(){run(curr+1,lim)},11000)}else finish()
        }else finish()
    };
    var finish=function(){
        var ts=d.querySelectorAll('table'),tar=ts[0];
        ts.forEach(function(t){if(t.innerText.length>tar.innerText.length)tar=t});
        var mT=tar.querySelector('tbody')||tar;
        mT.innerHTML='';
        savedRows.forEach(function(o){mT.appendChild(o.node)});
        d.getElementById('ali_main_body').innerHTML='<input type="text" id="sI" class="s-in" value="0" placeholder="بالفاتورة.."><input type="text" id="sO" class="s-in" placeholder="بالطلب (ERX).."><button class="d-btn b-green" id="btn_main">فتح المطابق للبحث (0)</button><button class="d-btn b-blue" id="btn_refresh" style="background:#6c757d">🔄 تحديث</button>';
        var sI=d.getElementById('sI'),sO=d.getElementById('sO'),bM=d.getElementById('btn_main');
        var filterData=function(){
            if(!sI.value.startsWith('0'))sI.value='0'+sI.value.replace(/^0+/,'');
            var v1=sI.value.trim(),v2=sO.value.trim();
            mT.innerHTML='';
            var count=0;
            savedRows.forEach(function(o){
                var mI=(v1!=="0"&&v1!==""&&o.id.indexOf(v1)!==-1);
                var mO=(v2!==""&&o.onl.indexOf(v2)!==-1);
                if(mI||mO||(v1==="0"&&v2==="")){mT.appendChild(o.node);count++}
            });
            upC(count);
            bM.innerText="فتح المطابق للبحث ("+count+")";
        };
        sI.oninput=sO.oninput=filterData;
        document.getElementById('btn_refresh').onclick=function(){location.reload()};
        bM.onclick=function(){
            var v1=sI.value.trim(),v2=sO.value.trim();
            if(v1==="0"&&v2==="")return alert("ابحث الأول!");
            var list=savedRows.filter(function(o){
                return (v1!=="0"&&o.id.indexOf(v1)!==-1)||(v2!==""&&o.onl.indexOf(v2)!==-1);
            });
            if(!list.length)return alert("لا توجد نتائج!");
            this.disabled=true;
            list.forEach(function(o,i){
                setTimeout(function(){
                    if(o.args){
                        var u=window.location.origin+"/ez_pill_web/getEZPill_Details?onlineNumber="+o.args[0].replace("ERX","")+"&Invoice="+o.args[1]+"&typee="+o.args[2]+"&head_id="+o.args[3];
                        window.open(u,"_blank")
                    }
                    if(i===list.length-1)bM.disabled=false;
                },i*1200)
            })
        };
        filterData()
    };
    d.getElementById('start').onclick=function(){this.disabled=true;run(1,parseInt(d.getElementById('p_lim').value))};
})();

(function(){
    var d=document,id='ali_sys_v22',vSet=new Set(),savedRows=[];
    if(d.getElementById(id))d.getElementById(id).remove();
    var pNodes=Array.from(d.querySelectorAll('.pagination a, .pagination li')).map(function(el){return parseInt(el.innerText.trim())}).filter(function(n){return !isNaN(n)});
    var pLim=pNodes.length>0?Math.max.apply(Math,pNodes):1;
    var s=d.createElement('style');
    s.innerHTML='#ali_sys_v22{position:fixed;top:5%;right:2%;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);padding:24px;z-index:9999999;width:340px;color:#1e293b;direction:rtl;border:1px solid rgba(255,255,255,0.4);font-family:"Segoe UI",Roboto,sans-serif;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);cursor:default}.minimized{width:70px!important;height:70px!important;padding:0!important;border-radius:50%!important;cursor:pointer!important;display:flex!important;align-items:center;justify-content:center;overflow:hidden;border:3px solid #1a73e8}.minimized > *{display:none!important}.minimized::before{content:"⚙️";font-size:35px;display:block!important}.ali-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.ali-title{font-size:18px;font-weight:800;background:linear-gradient(135deg,#1a73e8,#0d47a1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.ali-btn-circle{width:32px;height:32px;border-radius:50%;border:none;background:#f1f5f9;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s}.ali-btn-circle:hover{background:#e2e8f0;color:#1e293b}.ali-card-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}.ali-stat-box{background:#fff;padding:12px;border-radius:16px;border:1px solid #f1f5f9;text-align:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)}.ali-stat-label{font-size:11px;color:#64748b;font-weight:600;display:block;margin-bottom:4px}.ali-stat-value{font-size:20px;font-weight:800;color:#1e293b}.s-group{position:relative;margin-bottom:12px}.s-in{width:100%;padding:14px 16px;border:2px solid #f1f5f9;border-radius:14px;font-size:14px;outline:none;transition:0.3s;box-sizing:border-box;background:#f8fafc;font-weight:600}.s-in:focus{border-color:#1a73e8;background:#fff;box-shadow:0 0 0 4px rgba(26,115,232,0.1)}.d-btn{width:100%;padding:16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:15px;transition:0.3s;display:flex;align-items:center;justify-content:center;gap:8px}.b-blue{background:#1a73e8;color:#fff;box-shadow:0 10px 15px -3px rgba(26,115,232,0.3)}.b-blue:hover{background:#1557b0;transform:translateY(-2px)}.b-green{background:#10b981!important;color:#fff;box-shadow:0 10px 15px -3px rgba(16,185,129,0.3)}.b-green:hover{background:#059669!important;transform:translateY(-2px)}.b-green:disabled{background:#94a3b8!important;transform:none;box-shadow:none}#p-bar{height:8px;background:#f1f5f9;border-radius:10px;margin:15px 0;overflow:hidden}#p-fill{height:100%;background:linear-gradient(90deg,#1a73e8,#60a5fa);width:0%;transition:0.4s}#p_lim{width:70px;height:40px;border:2px solid #e2e8f0;border-radius:10px;background:#fff;text-align:center;font-weight:800;color:#1a73e8;font-size:18px;outline:none}';
    d.head.appendChild(s);
    var v=d.createElement('div');
    v.id=id;
    v.innerHTML='<div class="ali-header"><button class="ali-btn-circle" id="ali_min">−</button><span class="ali-title">EZ-PILL PRO</span><button class="ali-btn-circle" id="ali_close">✕</button></div><div class="ali-card-stats"><div class="ali-stat-box"><span class="ali-stat-label">إجمالي الطلبات</span><span id="stat_total" class="ali-stat-value">0</span></div><div class="ali-stat-box" style="border-right:3px solid #10b981"><span class="ali-stat-label">مطابق للبحث</span><span id="stat_rec" class="ali-stat-value">0</span></div></div><div id="ali_main_body"><div style="background:#f8fafc;padding:12px;border-radius:12px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:14px;font-weight:700">عدد الصفحات:</span><input type="number" id="p_lim" value="'+pLim+'" min="1"></div><div id="p-bar"><div id="p-fill"></div></div><div id="status-msg" style="font-size:12px;color:#94a3b8;margin-bottom:10px;text-align:center;font-weight:600">جاهز لبدء العمليات...</div><button class="d-btn b-blue" id="start">🚀 بدء تجميع البيانات</button></div><div style="text-align:center;margin-top:20px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:1px">DEVELOPED BY ALI EL-BAZ</div>';
    d.body.appendChild(v);
    v.onclick=function(e){if(this.classList.contains('minimized')){this.classList.remove('minimized')}};
    d.getElementById('ali_close').onclick=function(e){e.stopPropagation();v.remove()};
    d.getElementById('ali_min').onclick=function(e){e.stopPropagation();v.classList.add('minimized')};
    var upC=function(mC){d.getElementById('stat_total').innerText=savedRows.length;d.getElementById('stat_rec').innerText=mC||0};
    var run=function(curr,lim){
        var pf=d.getElementById('p-fill');
        pf.style.width=(curr/lim*100)+'%';
        d.getElementById('status-msg').innerText='تحليل الصفحة '+curr+' جاري...';
        d.querySelectorAll('table tr').forEach(function(r){
            var td=r.querySelectorAll('td');
            if(td.length>1){
                var k=td[0].innerText.trim();
                if(k.length>3&&!vSet.has(k)){
                    vSet.add(k);
                    var args=null,lb=r.querySelector('label[onclick^="getDetails"]');
                    if(lb){var m=lb.getAttribute('onclick').match(/\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'/);if(m)args=[m[1],m[2],m[3],m[4]]}
                    savedRows.push({id:k,onl:td[1].innerText.trim(),node:r.cloneNode(true),args:args})
                }
            }
        });
        upC(0);
        if(curr<lim){
            var nxt=Array.from(d.querySelectorAll('.pagination a, .pagination li')).find(function(el){return el.innerText.trim()==(curr+1)});
            if(nxt){nxt.click();setTimeout(function(){run(curr+1,lim)},11000)}else{finish()}
        }else{finish()}
    };
    var finish=function(){
        var ts=d.querySelectorAll('table'),tar=ts[0];
        ts.forEach(function(t){if(t.innerText.length>tar.innerText.length)tar=t});
        var mT=tar.querySelector('tbody')||tar;
        mT.innerHTML='';
        savedRows.forEach(function(o){mT.appendChild(o.node)});
        d.getElementById('ali_main_body').innerHTML='<div class="s-group"><input type="text" id="sI" class="s-in" value="0" placeholder="رقم الفاتورة.."></div><div class="s-group"><input type="text" id="sO" class="s-in" placeholder="رقم الطلب (ERX).."></div><button class="d-btn b-green" id="btn_main">⚡ فتح المطابق (0)</button><button id="btn_ref" style="background:none;border:none;color:#94a3b8;font-size:11px;margin-top:10px;cursor:pointer;width:100%;font-weight:700">🔄 تحديث الصفحة</button>';
        var sI=d.getElementById('sI'),sO=d.getElementById('sO'),bM=d.getElementById('btn_main');
        var filter=function(){
            if(!sI.value.startsWith('0'))sI.value='0'+sI.value.replace(/^0+/,'');
            var v1=sI.value.trim(),v2=sO.value.trim(),count=0;
            mT.innerHTML='';
            savedRows.forEach(function(o){
                var mI=(v1!=="0"&&o.id.indexOf(v1)!==-1),mO=(v2!==""&&o.onl.indexOf(v2)!==-1);
                if(mI||mO||(v1==="0"&&v2==="")){mT.appendChild(o.node);count++}
            });
            upC(count);
            bM.innerText="⚡ فتح المطابق ("+count+")"
        };
        sI.oninput=sO.oninput=filter;
        d.getElementById('btn_ref').onclick=function(){location.reload()};
        bM.onclick=function(){
            var v1=sI.value.trim(),v2=sO.value.trim();
            var list=savedRows.filter(function(o){return (v1!=="0"&&o.id.indexOf(v1)!==-1)||(v2!==""&&o.onl.indexOf(v2)!==-1)});
            if(!list.length)return;
            bM.disabled=true;
            list.forEach(function(o,i){
                setTimeout(function(){
                    if(o.args){
                        var u=window.location.origin+"/ez_pill_web/getEZPill_Details?onlineNumber="+o.args[0].replace("ERX","")+"&Invoice="+o.args[1]+"&typee="+o.args[2]+"&head_id="+o.args[3];
                        window.open(u,"_blank")
                    }
                    if(i===list.length-1)bM.disabled=false
                },i*1200)
            })
        }
    };
    d.getElementById('start').onclick=function(){this.disabled=true;run(1,parseInt(d.getElementById('p_lim').value)||1)}
})();

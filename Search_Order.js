(function() {
    console.log("🚀 المحرك بدأ العمل الآن...");
    var d = document, id = 'ali_sys_v22';

    // حذف أي نسخة قديمة فوراً
    var old = d.getElementById(id);
    if (old) old.remove();

    // حساب الصفحات بأمان
    var pNodes = Array.from(d.querySelectorAll('.pagination a, .pagination li'))
        .map(el => parseInt(el.innerText.trim()))
        .filter(n => !isNaN(n));
    var pLim = pNodes.length > 0 ? Math.max(...pNodes) : 1;

    var vSet = new Set(), savedRows = [];

    // إنشاء التنسيقات
    var s = d.createElement('style');
    s.innerHTML = '#ali_sys_v22{position:fixed;top:5%;right:2%;background:rgba(252,252,252,0.98);backdrop-filter:blur(15px);border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,0.3);padding:25px;z-index:9999999;width:320px;color:#333;direction:rtl;border:1.5px solid #1a73e8;font-family:sans-serif;text-align:center}.minimized{width:60px!important;height:60px!important;padding:0!important;border-radius:50%!important;cursor:pointer!important;display:flex!important;align-items:center;justify-content:center}.minimized::before{content:"⚙️";font-size:30px}.s-in{width:100%;padding:12px;border:1px solid #ccc;border-radius:12px;margin-bottom:10px;outline:none;box-sizing:border-box}.d-btn{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-weight:700;margin-top:8px}.b-blue{background:#1a73e8;color:#fff}.b-green{background:#28a745!important;color:#fff}.ali-stats-wrapper{display:flex;justify-content:space-around;margin:10px 0;padding:12px;background:#f8f9fa;border-radius:12px;border:1px solid #eee}.ali-cnt-val{padding:4px 10px;border-radius:8px;color:#fff;font-weight:bold;min-width:45px}#p-bar{height:8px;background:#f0f0f0;margin-top:10px;border-radius:4px;overflow:hidden}#p-fill{height:100%;background:#1a73e8;width:0%;transition:0.6s}';
    d.head.appendChild(s);

    // بناء الواجهة
    var v = d.createElement('div');
    v.id = id;
    v.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span id="ali_min" style="cursor:pointer;font-size:25px;color:#1a73e8">−</span><h3 style="margin:0;font-size:16px;color:#1a73e8">محرك علي الباز</h3><span id="ali_close" style="cursor:pointer;font-size:20px;color:#ccc">✖</span></div><div class="ali-stats-wrapper"><div>الإجمالي<br><span id="stat_total" class="ali-cnt-val" style="background:#1a73e8">0</span></div><div style="border-right:1px solid #ddd">المطابق<br><span id="stat_rec" class="ali-cnt-val" style="background:#28a745">0</span></div></div><div id="ali_main_body"><div style="padding:10px;background:#fff;border-radius:10px;margin-bottom:10px">عدد الصفحات: <input type="number" id="p_lim" value="'+pLim+'" style="width:50px;font-weight:bold"></div><div id="p-bar"><div id="p-fill"></div></div><div id="status-msg" style="font-size:12px;color:#666;margin:5px 0">جاهز للعمل...</div><button class="d-btn b-blue" id="start">بدء التجميع</button></div>';
    d.body.appendChild(v);

    // الأزرار الأساسية
    d.getElementById('ali_close').onclick = () => v.remove();
    d.getElementById('ali_min').onclick = () => v.classList.toggle('minimized');
    
    var upC = (m) => {
        d.getElementById('stat_total').innerText = savedRows.length;
        d.getElementById('stat_rec').innerText = m || 0;
    };

    var run = (curr, lim) => {
        d.getElementById('p-fill').style.width = (curr / lim * 100) + '%';
        d.getElementById('status-msg').innerText = 'يتم فحص صفحة ' + curr;

        d.querySelectorAll('table tr').forEach(r => {
            var td = r.querySelectorAll('td');
            if (td.length > 1) {
                var k = td[0].innerText.trim();
                if (k.length > 3 && !vSet.has(k)) {
                    vSet.add(k);
                    var args = null;
                    var lb = r.querySelector('label[onclick^="getDetails"]');
                    if (lb) {
                        var m = lb.getAttribute('onclick').match(/\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'/);
                        if (m) args = [m[1], m[2], m[3], m[4]];
                    }
                    savedRows.push({ id: k, onl: td[1].innerText.trim(), node: r.cloneNode(true), args: args });
                }
            }
        });

        upC(0);
        if (curr < lim) {
            var nxt = Array.from(d.querySelectorAll('.pagination a, .pagination li')).find(el => el.innerText.trim() == (curr + 1));
            if (nxt) { nxt.click(); setTimeout(() => run(curr + 1, lim), 10000); } else { finish(); }
        } else { finish(); }
    };

    var finish = () => {
        var table = d.querySelector('table tbody') || d.querySelector('table');
        if (table) {
            table.innerHTML = '';
            savedRows.forEach(o => table.appendChild(o.node));
        }
        
        d.getElementById('ali_main_body').innerHTML = '<input type="text" id="sI" class="s-in" value="0" placeholder="بالفاتورة.."><input type="text" id="sO" class="s-in" placeholder="بالطلب (ERX).."><button class="d-btn b-green" id="btn_main">فتح المطابق (0)</button>';
        
        var sI = d.getElementById('sI'), sO = d.getElementById('sO'), bM = d.getElementById('btn_main');
        
        var filter = () => {
            if (!sI.value.startsWith('0')) sI.value = '0' + sI.value.replace(/^0+/, '');
            var v1 = sI.value.trim(), v2 = sO.value.trim(), count = 0;
            if (table) table.innerHTML = '';
            savedRows.forEach(o => {
                var matchI = (v1 !== "0" && o.id.indexOf(v1) !== -1);
                var matchO = (v2 !== "" && o.onl.indexOf(v2) !== -1);
                if (matchI || matchO || (v1 === "0" && v2 === "")) {
                    if (table) table.appendChild(o.node);
                    count++;
                }
            });
            upC(count);
            bM.innerText = "فتح المطابق (" + count + ")";
        };

        sI.oninput = sO.oninput = filter;
        bM.onclick = () => {
            var v1 = sI.value.trim(), v2 = sO.value.trim();
            var list = savedRows.filter(o => (v1 !== "0" && o.id.indexOf(v1) !== -1) || (v2 !== "" && o.onl.indexOf(v2) !== -1));
            bM.disabled = true;
            list.forEach((o, i) => {
                setTimeout(() => {
                    if (o.args) {
                        var u = window.location.origin + "/ez_pill_web/getEZPill_Details?onlineNumber=" + o.args[0].replace("ERX", "") + "&Invoice=" + o.args[1] + "&typee=" + o.args[2] + "&head_id=" + o.args[3];
                        window.open(u, "_blank");
                    }
                    if (i === list.length - 1) bM.disabled = false;
                }, i * 1200);
            });
        };
    };

    d.getElementById('start').onclick = function() {
        this.disabled = true;
        run(1, parseInt(d.getElementById('p_lim').value) || 1);
    };

    console.log("✅ الواجهة جاهزة!");
})();

(function(){
    'use strict';

    /* ══════════════════════════════════════════
       🔧 CONFIG
       ══════════════════════════════════════════ */
    var _EZ_REPO='bazkoo2000/ez-pill-pro';
    var _EZ_DRUGS_FILE='ez_drugs_enc.dat';
    var _EZ_RAW_URL='https://raw.githubusercontent.com/'+_EZ_REPO+'/main/'+_EZ_DRUGS_FILE;
    var _EZ_API_URL='https://api.github.com/repos/'+_EZ_REPO+'/contents/'+_EZ_DRUGS_FILE;
    var _EZ_ADMIN_PIN='101093';
    /* Encryption key — مخبي في الكود */
    var _EK=[69,90,80,73,76,76,50,48,50,54,83,69,67,82,69,84];

    /* ══════════════════════════════════════════
       🔐 ENCRYPTION / DECRYPTION (AES-CBC)
       ══════════════════════════════════════════ */
    async function _ezDeriveKey(){
        var raw=new Uint8Array(_EK);
        var keyMaterial=await crypto.subtle.importKey('raw',raw,{name:'PBKDF2'},false,['deriveKey']);
        return crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('ezpill_salt_2026'),iterations:100000,hash:'SHA-256'},keyMaterial,{name:'AES-CBC',length:256},false,['encrypt','decrypt']);
    }

    async function _ezEncrypt(text){
        var key=await _ezDeriveKey();
        var iv=crypto.getRandomValues(new Uint8Array(16));
        var encoded=new TextEncoder().encode(text);
        var encrypted=await crypto.subtle.encrypt({name:'AES-CBC',iv:iv},key,encoded);
        /* IV (16 bytes) + encrypted data → base64 */
        var combined=new Uint8Array(iv.length+encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted),iv.length);
        /* Chunked btoa to avoid stack overflow on large data */
        var chunks=[];for(var i=0;i<combined.length;i+=8192){var slice=combined.subarray(i,Math.min(i+8192,combined.length));var str='';for(var j=0;j<slice.length;j++)str+=String.fromCharCode(slice[j]);chunks.push(str);}
        return btoa(chunks.join(''));
    }

    async function _ezDecrypt(b64){
        var key=await _ezDeriveKey();
        var raw=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0)});
        var iv=raw.slice(0,16);
        var data=raw.slice(16);
        var decrypted=await crypto.subtle.decrypt({name:'AES-CBC',iv:iv},key,data);
        return new TextDecoder().decode(decrypted);
    }

    /* ══════════════════════════════════════════
       📦 GITHUB HELPERS
       ══════════════════════════════════════════ */
    function _ezGetGHToken(){try{return localStorage.getItem('ez_gh_token')||'';}catch(e){return '';}}

    async function _ezFetchDrugsFromGH(){
        try{
            var resp=await fetch(_EZ_RAW_URL+'?t='+Date.now());
            if(!resp.ok){console.warn('Drug file fetch:',resp.status);return null;}
            var b64=await resp.text();
            var json=await _ezDecrypt(b64.trim());
            var db=JSON.parse(json);
            /* Cache locally */
            try{localStorage.setItem('ez_drugs_cache',json);localStorage.setItem('ez_drugs_cache_time',Date.now().toString());}catch(e){}
            console.log('💊 Drugs loaded from GitHub:',db.length);
            return db;
        }catch(e){
            console.warn('💊 Fetch/decrypt error:',e);
            /* Fallback to cache */
            try{var c=localStorage.getItem('ez_drugs_cache');if(c)return JSON.parse(c);}catch(e2){}
            return null;
        }
    }

    async function _ezPushDrugsToGH(db){
        var token=_ezGetGHToken();
        if(!token){_ezToast('لا يوجد توكن جيتهاب','error');return false;}
        try{
            var json=JSON.stringify(db);
            console.log('💊 Encrypting '+db.length+' drugs ('+json.length+' bytes)...');
            var encrypted=await _ezEncrypt(json);
            console.log('💊 Encrypted length: '+encrypted.length);
            /* Get SHA */
            var sha='';
            try{
                var getResp=await fetch(_EZ_API_URL,{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});
                console.log('💊 SHA fetch status: '+getResp.status);
                if(getResp.ok){var gd=await getResp.json();sha=gd.sha;console.log('💊 SHA: '+sha);}
            }catch(e){console.warn('💊 SHA fetch error (ok if new file):',e)}
            /* GitHub API wants base64 of the file content — encrypted is already ASCII base64 so safe for btoa */
            var fileContent=encrypted;
            /* Chunk the btoa for safety */
            var b64Content='';
            try{
                b64Content=btoa(fileContent);
            }catch(e){
                /* Fallback: chunk it */
                console.log('💊 btoa failed, using chunked approach...');
                var enc=new TextEncoder().encode(fileContent);
                var chunks=[];
                for(var ci=0;ci<enc.length;ci+=8192){
                    var sl=enc.subarray(ci,Math.min(ci+8192,enc.length));
                    var s='';for(var cj=0;cj<sl.length;cj++)s+=String.fromCharCode(sl[cj]);
                    chunks.push(s);
                }
                b64Content=btoa(chunks.join(''));
            }
            console.log('💊 Base64 content length: '+b64Content.length);
            var body={message:'تحديث قاعدة الأدوية — '+new Date().toLocaleString('ar-EG'),content:b64Content,branch:'main'};
            if(sha)body.sha=sha;
            console.log('💊 Pushing to GitHub...');
            var resp=await fetch(_EZ_API_URL,{
                method:'PUT',
                headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'},
                body:JSON.stringify(body)
            });
            if(!resp.ok){var err=await resp.json();console.error('💊 Push failed:',resp.status,err);_ezToast('فشل الرفع ('+resp.status+'): '+(err.message||'خطأ غير معروف'),'error');return false;}
            console.log('💊 Drugs pushed to GitHub ✅');
            return true;
        }catch(e){
            console.error('💊 Push error:',e);
            _ezToast('خطأ: '+e.message,'error');
            return false;
        }
    }

    /* ══════════════════════════════════════════
       🛠️ HELPERS
       ══════════════════════════════════════════ */
    function n(t){return(t||'').toString().trim().replace(/\s+/g,' ')}
    function nl(t){return n(t).toLowerCase()}
    function fire(el){
        try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('blur',{bubbles:true}))}catch(e){}
    }
    function _ezToast(msg,type){
        if(window.ezShowToast){window.ezShowToast(msg,type);return;}
        var c=document.getElementById('ez-drug-toast');
        if(!c){c=document.createElement('div');c.id='ez-drug-toast';c.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999999';document.body.appendChild(c);}
        var t=document.createElement('div');
        t.style.cssText='padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;font-family:Cairo,Segoe UI,sans-serif;color:#fff;margin-bottom:8px;animation:fadeIn .3s;background:'+(type==='error'?'#dc2626':type==='success'?'#059669':'#6366f1');
        t.textContent=msg;c.appendChild(t);setTimeout(function(){t.remove()},3000);
    }
    function findT(){
        var ts=document.querySelectorAll('table.styled-table.table-bordered');
        for(var i=0;i<ts.length;i++){
            var ths=ts[i].querySelectorAll('tr th');
            for(var j=0;j<ths.length;j++){if(nl(ths[j].textContent)==='note')return ts[i]}
        }
        return document.querySelector('table.styled-table.table-bordered');
    }
    function idx(ths,name){
        name=nl(name);
        for(var i=0;i<ths.length;i++){
            var t=nl(ths[i].textContent);
            if(t===name||t.indexOf(name)>-1)return i;
        }
        return-1;
    }
    function getCellInput(td){if(!td)return null;return td.querySelector('input,textarea,select')}
    function setCell(td,val){
        if(!td)return;
        var inp=getCellInput(td);
        if(inp){inp.value=String(val);fire(inp);}else{td.textContent=String(val)}
    }
    function clearRow(row){
        if(!row)return;
        row.removeAttribute('style');
        if(row.dataset){delete row.dataset.spDupAuto;delete row.dataset.spAutoChild;delete row.dataset.spSkipDup;delete row.dataset.originalDuplicate;}
        var inputs=row.querySelectorAll('input,textarea,select');
        for(var i=0;i<inputs.length;i++){
            var x=inputs[i];
            if(x.type==='checkbox'){x.checked=false;fire(x)}
            else if(x.tagName==='SELECT'){x.selectedIndex=0;fire(x)}
            else{x.value='';fire(x)}
        }
    }

    /* ══════════════════════════════════════════
       📋 CSV/EXCEL PARSING
       ══════════════════════════════════════════ */
    function parseCSV(text){
        var lines=text.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(function(x){return x.length});
        if(!lines.length)return[];
        var sep=lines[0].indexOf('\t')>-1?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
        function splitLine(line){var out=[],cur='',q=false;for(var i=0;i<line.length;i++){var ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else{q=!q}}else if(ch===sep&&!q){out.push(cur);cur=''}else{cur+=ch}}out.push(cur);return out.map(function(s){return n(s.replace(/^"|"$/g,''))})}
        var head=splitLine(lines[0]).map(nl);
        var iName=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});
        var iCode=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});
        if(iName<0)iName=0;if(iCode<0)iCode=1;
        var db=[];
        for(var r=1;r<lines.length;r++){var cols=splitLine(lines[r]);var name=cols[iName]||'';var code=cols[iCode]||'';if(name||code)db.push({name:n(name),code:n(code)})}
        return db;
    }
    function ensureXLSX(cb){if(window.XLSX)return cb(true);var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=function(){cb(!!window.XLSX)};s.onerror=function(){cb(false)};document.head.appendChild(s)}
    function parseExcel(file,cb){
        var ext=(file.name||'').toLowerCase();
        if(ext.endsWith('.csv')){var fr=new FileReader();fr.onload=function(){cb(parseCSV(String(fr.result||'')))};fr.readAsText(file);return}
        ensureXLSX(function(ok){if(!ok){cb(null);return}var fr=new FileReader();fr.onload=function(e){try{var data=new Uint8Array(e.target.result);var wb=XLSX.read(data,{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false});if(!rows||!rows.length){cb([]);return}var head=(rows[0]||[]).map(function(x){return nl(String(x||''))});var iName=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});var iCode=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});if(iName<0)iName=0;if(iCode<0)iCode=1;var db=[];for(var i=1;i<rows.length;i++){var r=rows[i]||[];var name=n(r[iName]);var code=n(r[iCode]);if(name||code)db.push({name:name,code:code})}cb(db)}catch(err){cb(null)}};fr.readAsArrayBuffer(file)})
    }

    /* ══════════════════════════════════════════
       🔎 SEARCH & ADD
       ══════════════════════════════════════════ */
    function matchDrug(db,q){
        q=nl(q);if(!q)return null;
        var exact=db.find(function(x){return nl(x.code)===q||nl(x.name)===q});
        if(exact)return exact;
        var byCode=db.find(function(x){return nl(x.code).indexOf(q)>-1});
        if(byCode)return byCode;
        var byName=db.find(function(x){return nl(x.name).indexOf(q)>-1});
        return byName||null;
    }
    function addRowWith(name,code){
        var table=findT();if(!table)return false;
        var header=table.querySelector('tr');if(!header)return false;
        var hs=header.querySelectorAll('th,td');
        var iName=idx(hs,'name'),iCode=idx(hs,'code');
        if(iName<0||iCode<0)return false;
        var tbody=(table.tBodies&&table.tBodies.length)?table.tBodies[0]:table;
        var rows=[].slice.call(tbody.querySelectorAll('tr')).filter(function(r){return r.querySelectorAll('th').length===0});
        if(!rows.length)return false;
        var base=rows[rows.length-1];var newRow=base.cloneNode(true);
        clearRow(newRow);var tds=newRow.querySelectorAll('td');
        if(!tds.length||Math.max(iName,iCode)>=tds.length)return false;
        if(tds[0]&&tds[0].querySelector('input.checkk')){tds[0].querySelector('input.checkk').checked=true;fire(tds[0].querySelector('input.checkk'));}
        setCell(tds[iName],name||'');setCell(tds[iCode],code||'');
        setCell(tds[3],1);setCell(tds[5],1);
        tbody.appendChild(newRow);newRow.scrollIntoView({block:'center'});return true;
    }

    /* ══════════════════════════════════════════
       🖥️ UI
       ══════════════════════════════════════════ */
    function ensureUI(){
        var old=document.getElementById('ezpill_adddrug_panel');
        if(old)old.remove();
        var d=document.createElement('div');
        d.id='ezpill_adddrug_panel';
        d.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;border-radius:16px;padding:0;box-shadow:0 20px 40px rgba(0,0,0,0.15);font-family:Cairo,"Segoe UI",sans-serif;width:370px;max-width:95vw;overflow:hidden';
        d.innerHTML=
        '<div style="background:#fff;padding:20px;border-radius:16px 16px 0 0">'+
          /* Header */
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0f0f0">'+
            '<div style="display:flex;align-items:center;gap:10px">'+
              '<div style="width:38px;height:38px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px">💊</div>'+
              '<div><div style="font-weight:800;font-size:16px;color:#1e1b4b">إضافة صنف</div><div id="ez-drug-cloud-status" style="font-size:10px;font-weight:700;color:#94a3b8">جاري التحميل...</div></div>'+
            '</div>'+
            '<div style="display:flex;gap:4px">'+
              '<button id="ez-drug-admin-btn" title="إدارة" style="width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#667eea;cursor:pointer;font-size:14px">⚙️</button>'+
              '<button id="ez-drug-close" style="width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#94a3b8;cursor:pointer;font-size:16px">&times;</button>'+
            '</div>'+
          '</div>'+
          /* Search */
          '<div style="margin-bottom:12px;position:relative">'+
            '<input id="ezpill_adddrug_q" type="text" placeholder="ابحث بالاسم أو الكود..." style="width:100%;padding:12px 14px;border:1.5px solid rgba(129,140,248,0.2);border-radius:12px;font-size:14px;font-family:Cairo,sans-serif;box-sizing:border-box;outline:none;direction:ltr" />'+
            '<div id="search-suggestions" style="position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;max-height:220px;overflow-y:auto;display:none;z-index:1000000;box-shadow:0 8px 24px rgba(0,0,0,0.12);margin-top:4px"></div>'+
          '</div>'+
          /* Add button */
          '<button id="ezpill_adddrug_btn" style="width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;cursor:pointer;font-weight:800;font-size:14px;font-family:Cairo,sans-serif">➕ إضافة للجدول</button>'+
          /* Status */
          '<div id="ezpill_adddrug_status" style="margin-top:12px;padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;min-height:20px;font-weight:700"></div>'+
        '</div>'+
        /* Footer */
        '<div style="background:#f8fafc;padding:10px 20px;border-radius:0 0 16px 16px;border-top:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center">'+
          '<div style="font-size:10px;color:#94a3b8">v2.0 Cloud</div>'+
          '<div id="drug_count" style="font-size:11px;color:#667eea;font-weight:700">0 صنف</div>'+
        '</div>';
        document.body.appendChild(d);

        /* Close */
        document.getElementById('ez-drug-close').onclick=function(){d.remove()};

        /* Admin button */
        document.getElementById('ez-drug-admin-btn').onclick=function(){openAdminPanel()};

        return d;
    }

    /* ══════════════════════════════════════════
       👤 ADMIN PANEL — رفع ملف أدوية جديد
       ══════════════════════════════════════════ */
    function openAdminPanel(){
        var pin=prompt('الرقم السري للأدمن:');
        if(pin!==_EZ_ADMIN_PIN){if(pin!==null)_ezToast('الرقم السري غلط','error');return;}

        var overlay=document.createElement('div');
        overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif';

        var card=document.createElement('div');
        card.style.cssText='width:420px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.2)';

        card.innerHTML=
        '<div style="padding:18px 22px;border-bottom:1px solid rgba(129,140,248,0.08);display:flex;align-items:center;gap:10px">'+
          '<div style="font-size:22px">🔐</div>'+
          '<div style="flex:1"><div style="font-size:15px;font-weight:900;color:#1e1b4b">إدارة قاعدة الأدوية</div><div style="font-size:10px;font-weight:700;color:#64748b">رفع + تشفير + حفظ على جيتهاب</div></div>'+
          '<button id="ez-admin-close" style="width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:rgba(148,163,184,0.08);font-size:14px">✕</button>'+
        '</div>'+
        '<div style="padding:18px 22px;direction:rtl">'+
          /* Token */
          '<div style="font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px">توكن جيتهاب:</div>'+
          '<input id="ez-admin-token" type="password" placeholder="الصق التوكن" value="'+_ezGetGHToken()+'" style="width:100%;padding:8px 12px;border:1.5px solid rgba(129,140,248,0.2);border-radius:10px;font-size:12px;font-family:Cairo;direction:ltr;margin-bottom:12px;box-sizing:border-box;outline:none" />'+
          /* File upload */
          '<div style="font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px">ملف الأصناف الجديد:</div>'+
          '<input id="ez-admin-file" type="file" accept=".xlsx,.xls,.csv" style="width:100%;padding:10px;border:2px dashed rgba(129,140,248,0.2);border-radius:10px;background:rgba(99,102,241,0.03);font-size:12px;box-sizing:border-box;margin-bottom:12px" />'+
          '<div id="ez-admin-file-info" style="font-size:11px;color:#64748b;margin-bottom:12px"></div>'+
          /* Buttons */
          '<button id="ez-admin-encrypt-push" style="width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5);margin-bottom:8px">🔐 تشفير ورفع على جيتهاب</button>'+
          '<div id="ez-admin-status" style="padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;font-weight:700"></div>'+
        '</div>';

        overlay.appendChild(card);
        overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
        document.body.appendChild(overlay);

        document.getElementById('ez-admin-close').onclick=function(){overlay.remove()};

        var pendingDB=null;

        /* Parse uploaded file */
        document.getElementById('ez-admin-file').onchange=function(){
            var f=this.files&&this.files[0];if(!f)return;
            var info=document.getElementById('ez-admin-file-info');
            info.textContent='جاري القراءة...';
            parseExcel(f,function(db){
                if(!db||!db.length){info.textContent='❌ فشل قراءة الملف';return;}
                pendingDB=db;
                info.innerHTML='✅ تم قراءة <b>'+db.length+'</b> صنف — جاهز للتشفير والرفع';
            });
        };

        /* Encrypt and push */
        document.getElementById('ez-admin-encrypt-push').onclick=async function(){
            var token=document.getElementById('ez-admin-token').value.trim();
            if(!token){_ezToast('ادخل التوكن','error');return;}
            localStorage.setItem('ez_gh_token',token);
            if(!pendingDB||!pendingDB.length){_ezToast('ارفع الملف أولاً','error');return;}

            var btn=this;var st=document.getElementById('ez-admin-status');
            btn.textContent='⏳ جاري التشفير...';btn.disabled=true;
            st.textContent='';

            try{
                st.textContent='🔐 جاري تشفير '+pendingDB.length+' صنف...';
                /* Push encrypted */
                var ok=await _ezPushDrugsToGH(pendingDB);
                if(ok){
                    st.innerHTML='✅ تم التشفير والرفع بنجاح — <b>'+pendingDB.length+'</b> صنف';
                    /* Update local */
                    window.EZPillDrugDB=pendingDB;
                    var dc=document.getElementById('drug_count');
                    if(dc)dc.textContent=pendingDB.length+' صنف';
                    var cs=document.getElementById('ez-drug-cloud-status');
                    if(cs)cs.textContent='☁️ '+pendingDB.length+' صنف محمّل';
                    _ezToast('تم رفع '+pendingDB.length+' صنف مشفر','success');
                } else {
                    st.textContent='❌ فشل الرفع';
                }
            }catch(e){
                st.textContent='❌ خطأ: '+e.message;
            }
            btn.textContent='🔐 تشفير ورفع على جيتهاب';btn.disabled=false;
        };
    }

    /* ══════════════════════════════════════════
       🚀 INIT
       ══════════════════════════════════════════ */
    var ui=ensureUI();
    var status=document.getElementById('ezpill_adddrug_status');
    var drugCount=document.getElementById('drug_count');
    var cloudStatus=document.getElementById('ez-drug-cloud-status');

    if(!window.EZPillDrugDB)window.EZPillDrugDB=[];

    /* Auto-load from GitHub */
    (async function(){
        cloudStatus.textContent='☁️ جاري سحب الأصناف...';
        status.textContent='جاري التحميل من السحابة...';
        var db=await _ezFetchDrugsFromGH();
        if(db&&db.length){
            window.EZPillDrugDB=db;
            drugCount.textContent=db.length+' صنف';
            cloudStatus.textContent='☁️ '+db.length+' صنف محمّل';
            status.textContent='✅ تم تحميل '+db.length+' صنف من السحابة';
        } else {
            cloudStatus.textContent='⚠️ لا يوجد ملف أدوية';
            status.textContent='لم يتم العثور على أدوية — اضغط ⚙️ للرفع';
        }
    })();

    /* Search */
    function doAdd(){
        var q=document.getElementById('ezpill_adddrug_q').value||'';
        if(!window.EZPillDrugDB||!window.EZPillDrugDB.length){status.textContent='لا توجد أدوية — ارفع الملف من ⚙️';return}
        var item=matchDrug(window.EZPillDrugDB,q);
        if(!item){status.textContent='مش موجود: '+q;return}
        if(addRowWith(item.name,item.code)){
            status.textContent='✅ تمت الإضافة: '+item.name;
            document.getElementById('ezpill_adddrug_q').value='';
            document.getElementById('search-suggestions').style.display='none';
        }
    }
    document.getElementById('ezpill_adddrug_btn').onclick=doAdd;
    document.getElementById('ezpill_adddrug_q').onkeydown=function(e){if(e.key==='Enter')doAdd()};
    document.getElementById('ezpill_adddrug_q').oninput=function(){
        var q=this.value,sug=document.getElementById('search-suggestions');
        sug.innerHTML='';
        if(q.length>0&&window.EZPillDrugDB.length){
            var matches=window.EZPillDrugDB.filter(function(i){return nl(i.name).indexOf(nl(q))>-1||nl(i.code).indexOf(nl(q))>-1}).slice(0,10);
            if(matches.length){
                matches.forEach(function(item){
                    var div=document.createElement('div');
                    div.style.cssText='padding:10px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;transition:background .15s';
                    div.innerHTML='<div style="font-weight:700;font-size:13px;color:#1e1b4b">'+item.name+'</div><div style="font-size:11px;color:#94a3b8;direction:ltr">'+item.code+'</div>';
                    div.onmouseover=function(){this.style.background='rgba(99,102,241,0.04)'};
                    div.onmouseout=function(){this.style.background=''};
                    div.onclick=function(){document.getElementById('ezpill_adddrug_q').value=item.name;sug.style.display='none';document.getElementById('ezpill_adddrug_q').focus()};
                    sug.appendChild(div);
                });
                sug.style.display='block';
            }else{sug.style.display='none'}
        }else{sug.style.display='none'}
    };
})();

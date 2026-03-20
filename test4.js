(function(){
    'use strict';

    /* ══════════════════════════════════════════════════════════════
       💊 EZPill Add Drug v3.0 — Enhanced Edition
       Fixes: XSS, retry logic, debounce, undo, drag, magic indices
       Developed by ALI EL-BAZ
       ══════════════════════════════════════════════════════════════ */

    var old=document.getElementById('ezpill_adddrug_panel');if(old)old.remove();
    var oldToast=document.getElementById('ez-drug-toast');if(oldToast)oldToast.remove();

    /* ══════════════════════════════════════════
       🔧 CONFIG
       ══════════════════════════════════════════ */
    var _EZ_REPO='bazkoo2000/ez-pill-pro';
    var _EZ_DRUGS_FILE='ez_drugs_enc.dat';
    var _EZ_RAW_URL='https://raw.githubusercontent.com/'+_EZ_REPO+'/main/'+_EZ_DRUGS_FILE;
    var _EZ_API_URL='https://api.github.com/repos/'+_EZ_REPO+'/contents/'+_EZ_DRUGS_FILE;
    var _EZ_ADMIN_HASH='5cbc023289bf7794bfecfd3a80c3f9e36e23c9d8a2766d764d2cf020e0426e81';
    var _EK=[69,90,80,73,76,76,50,48,50,54,83,69,67,82,69,84];
    var FETCH_TIMEOUT=30000;
    var MAX_RETRIES=2;

    /* ══════════════════════════════════════════
       📦 STATE
       ══════════════════════════════════════════ */
    var State={
        db:[],
        lastAdded:null,
        undoTimer:null,
        searchTimer:null
    };

    /* ══════════════════════════════════════════
       🔐 CRYPTO — Web Crypto (HTTPS) + CryptoJS (HTTP)
       ══════════════════════════════════════════ */
    function _isSecure(){return !!(window.crypto&&window.crypto.subtle)}

    function _loadCryptoJS(){
        return new Promise(function(resolve){
            if(window.CryptoJS&&window.CryptoJS.PBKDF2)return resolve(true);
            var s=document.createElement('script');
            s.src='https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js';
            s.onload=function(){resolve(!!(window.CryptoJS&&window.CryptoJS.PBKDF2))};
            s.onerror=function(){console.error('CryptoJS load failed');resolve(false)};
            document.head.appendChild(s);
        });
    }

    /* Web Crypto (HTTPS) */
    async function _deriveKey(){
        var raw=new Uint8Array(_EK);
        var km=await crypto.subtle.importKey('raw',raw,{name:'PBKDF2'},false,['deriveKey']);
        return crypto.subtle.deriveKey(
            {name:'PBKDF2',salt:new TextEncoder().encode('ezpill_salt_2026'),iterations:100000,hash:'SHA-256'},
            km,{name:'AES-CBC',length:256},false,['encrypt','decrypt']
        );
    }
    async function _encryptNative(text){
        var key=await _deriveKey();
        var iv=crypto.getRandomValues(new Uint8Array(16));
        var enc=await crypto.subtle.encrypt({name:'AES-CBC',iv:iv},key,new TextEncoder().encode(text));
        var combined=new Uint8Array(16+enc.byteLength);
        combined.set(iv);combined.set(new Uint8Array(enc),16);
        return _bufToB64(combined);
    }
    async function _decryptNative(b64){
        var key=await _deriveKey();
        var raw=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0)});
        var dec=await crypto.subtle.decrypt({name:'AES-CBC',iv:raw.slice(0,16)},key,raw.slice(16));
        return new TextDecoder().decode(dec);
    }

    /* CryptoJS Fallback (HTTP) */
    function _getCJSKey(){
        var CJ=window.CryptoJS;
        var pass=CJ.lib.WordArray.create(new Uint8Array(_EK));
        var salt=CJ.enc.Utf8.parse('ezpill_salt_2026');
        return CJ.PBKDF2(pass,salt,{keySize:8,iterations:100000,hasher:CJ.algo.SHA256});
    }
    async function _encryptCJS(text){
        var ok=await _loadCryptoJS();if(!ok)throw new Error('CryptoJS غير متاح');
        var CJ=window.CryptoJS;var key=_getCJSKey();
        var ivArr=new Uint8Array(16);window.crypto.getRandomValues(ivArr);
        var iv=CJ.lib.WordArray.create(ivArr);
        var encrypted=CJ.AES.encrypt(text,key,{iv:iv,mode:CJ.mode.CBC,padding:CJ.pad.Pkcs7});
        var combined=iv.clone();combined.concat(encrypted.ciphertext);
        return CJ.enc.Base64.stringify(combined);
    }
    async function _decryptCJS(b64){
        var ok=await _loadCryptoJS();if(!ok)throw new Error('CryptoJS غير متاح');
        var CJ=window.CryptoJS;var key=_getCJSKey();
        var data=CJ.enc.Base64.parse(b64);
        var iv=CJ.lib.WordArray.create(data.words.slice(0,4),16);
        var ct=CJ.lib.WordArray.create(data.words.slice(4),data.sigBytes-16);
        var result=CJ.AES.decrypt({ciphertext:ct},key,{iv:iv,mode:CJ.mode.CBC,padding:CJ.pad.Pkcs7}).toString(CJ.enc.Utf8);
        if(!result)throw new Error('فك التشفير فشل');
        return result;
    }

    /* Unified */
    async function _encrypt(text){return _isSecure()?_encryptNative(text):_encryptCJS(text)}
    async function _decrypt(b64){
        b64=b64.trim();
        if(_isSecure()){
            try{return await _decryptNative(b64)}
            catch(e){console.warn('Native decrypt failed, trying CryptoJS...',e);return _decryptCJS(b64)}
        }
        return _decryptCJS(b64);
    }

    /* PIN hashing — compare hash instead of plaintext */
    async function _hashPin(pin){
        if(_isSecure()){
            var data=new TextEncoder().encode(pin);
            var buf=await crypto.subtle.digest('SHA-256',data);
            return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
        }
        var ok=await _loadCryptoJS();
        if(ok)return window.CryptoJS.SHA256(pin).toString();
        return pin;
    }

    /* ══════════════════════════════════════════
       🛠️ HELPERS
       ══════════════════════════════════════════ */
    function _bufToB64(buf){
        var chunks=[];
        for(var i=0;i<buf.length;i+=8192){
            var sl=buf.subarray(i,Math.min(i+8192,buf.length));
            var s='';for(var j=0;j<sl.length;j++)s+=String.fromCharCode(sl[j]);
            chunks.push(s);
        }
        return btoa(chunks.join(''));
    }
    function n(t){return(t||'').toString().trim().replace(/\s+/g,' ')}
    function nl(t){return n(t).toLowerCase()}
    function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
    function fire(el){
        try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('blur',{bubbles:true}))}catch(e){}
    }
    function debounce(fn,ms){var t;return function(){var a=arguments,c=this;clearTimeout(t);t=setTimeout(function(){fn.apply(c,a)},ms)}}

    function _getGHToken(){try{return sessionStorage.getItem('ez_gh_token')||localStorage.getItem('ez_gh_token')||''}catch(e){return ''}}
    function _setGHToken(t){try{sessionStorage.setItem('ez_gh_token',t);localStorage.setItem('ez_gh_token',t)}catch(e){}}

    /* Fetch with timeout + AbortController */
    function fetchWithTimeout(url,opts,timeout){
        var ctrl=new AbortController();
        var timer=setTimeout(function(){ctrl.abort()},timeout||FETCH_TIMEOUT);
        opts=opts||{};opts.signal=ctrl.signal;
        return fetch(url,opts).finally(function(){clearTimeout(timer)});
    }

    function toast(msg,type){
        var c=document.getElementById('ez-drug-toast');
        if(!c){c=document.createElement('div');c.id='ez-drug-toast';c.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999999;pointer-events:none';document.body.appendChild(c)}
        var t=document.createElement('div');
        t.style.cssText='padding:10px 22px;border-radius:12px;font-size:13px;font-weight:700;font-family:Cairo,"Segoe UI",sans-serif;color:#fff;margin-bottom:8px;opacity:0;transform:translateY(-8px);transition:all .3s;pointer-events:auto;background:'+(type==='error'?'#dc2626':type==='success'?'#059669':'#6366f1');
        t.textContent=msg;c.appendChild(t);
        requestAnimationFrame(function(){requestAnimationFrame(function(){t.style.opacity='1';t.style.transform='translateY(0)'})});
        setTimeout(function(){t.style.opacity='0';t.style.transform='translateY(-8px)';setTimeout(function(){t.remove()},300)},2800);
    }

    /* ══════════════════════════════════════════
       📦 GITHUB
       ══════════════════════════════════════════ */
    async function fetchDrugsFromGH(){
        try{
            var resp=await fetchWithTimeout(_EZ_RAW_URL+'?t='+Date.now());
            if(!resp.ok){console.warn('Drug file fetch:',resp.status);return null}
            var b64=await resp.text();
            var json=await _decrypt(b64.trim());
            var db=JSON.parse(json);
            try{localStorage.setItem('ez_drugs_cache',json);localStorage.setItem('ez_drugs_cache_time',''+Date.now())}catch(e){}
            console.log('Drugs loaded:',db.length);
            return db;
        }catch(e){
            console.warn('Fetch/decrypt error:',e);
            try{var c=localStorage.getItem('ez_drugs_cache');if(c)return JSON.parse(c)}catch(e2){}
            return null;
        }
    }

    async function pushDrugsToGH(db){
        var token=_getGHToken();
        if(!token){toast('لا يوجد توكن جيتهاب','error');return false}
        for(var attempt=0;attempt<=MAX_RETRIES;attempt++){
            try{
                var json=JSON.stringify(db);
                var encrypted=await _encrypt(json);
                var sha='';
                try{
                    var gr=await fetchWithTimeout(_EZ_API_URL,{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});
                    if(gr.ok)sha=(await gr.json()).sha;
                }catch(e){}
                var b64;
                try{b64=btoa(encrypted)}catch(e){b64=_bufToB64(new TextEncoder().encode(encrypted))}
                var body={message:'تحديث الأدوية — '+new Date().toLocaleString('ar-EG'),content:b64,branch:'main'};
                if(sha)body.sha=sha;
                var resp=await fetchWithTimeout(_EZ_API_URL,{
                    method:'PUT',
                    headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'},
                    body:JSON.stringify(body)
                });
                if(!resp.ok){
                    var err=await resp.json();
                    if(attempt<MAX_RETRIES){await new Promise(function(r){setTimeout(r,1000*(attempt+1))});continue}
                    toast('فشل الرفع ('+resp.status+'): '+(err.message||''),'error');return false;
                }
                return true;
            }catch(e){
                if(attempt<MAX_RETRIES){await new Promise(function(r){setTimeout(r,1000*(attempt+1))});continue}
                toast('خطأ: '+e.message,'error');return false;
            }
        }
        return false;
    }

    /* ══════════════════════════════════════════
       📋 CSV/EXCEL PARSING
       ══════════════════════════════════════════ */
    function parseCSV(text){
        var lines=text.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(Boolean);
        if(!lines.length)return[];
        var sep=lines[0].indexOf('\t')>-1?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');
        function splitLine(line){
            var out=[],cur='',q=false;
            for(var i=0;i<line.length;i++){
                var ch=line[i];
                if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else{q=!q}}
                else if(ch===sep&&!q){out.push(cur);cur=''}
                else{cur+=ch}
            }
            out.push(cur);return out.map(function(s){return n(s.replace(/^"|"$/g,''))});
        }
        var head=splitLine(lines[0]).map(nl);
        var iN=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});
        var iC=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});
        if(iN<0)iN=0;if(iC<0)iC=1;
        var db=[];
        for(var r=1;r<lines.length;r++){var cols=splitLine(lines[r]);var name=cols[iN]||'';var code=cols[iC]||'';if(name||code)db.push({name:n(name),code:n(code)})}
        return db;
    }

    function ensureXLSX(cb){
        if(window.XLSX)return cb(true);
        var s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        s.onload=function(){cb(!!window.XLSX)};s.onerror=function(){cb(false)};
        document.head.appendChild(s);
    }

    function parseExcel(file,cb){
        var ext=(file.name||'').toLowerCase();
        if(ext.endsWith('.csv')){var fr=new FileReader();fr.onload=function(){cb(parseCSV(String(fr.result||'')))};fr.readAsText(file);return}
        ensureXLSX(function(ok){
            if(!ok){cb(null);return}
            var fr=new FileReader();
            fr.onload=function(e){
                try{
                    var data=new Uint8Array(e.target.result);
                    var wb=XLSX.read(data,{type:'array'});
                    var ws=wb.Sheets[wb.SheetNames[0]];
                    var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false});
                    if(!rows||!rows.length){cb([]);return}
                    var head=(rows[0]||[]).map(function(x){return nl(String(x||''))});
                    var iN=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});
                    var iC=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});
                    if(iN<0)iN=0;if(iC<0)iC=1;
                    var db=[];
                    for(var i=1;i<rows.length;i++){var r=rows[i]||[];var nm=n(r[iN]);var cd=n(r[iC]);if(nm||cd)db.push({name:nm,code:cd})}
                    cb(db);
                }catch(err){cb(null)}
            };
            fr.readAsArrayBuffer(file);
        });
    }

    /* ══════════════════════════════════════════
       🔎 TABLE HELPERS
       ══════════════════════════════════════════ */
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
        for(var i=0;i<ths.length;i++){var t=nl(ths[i].textContent);if(t===name||t.indexOf(name)>-1)return i}
        return-1;
    }
    function getCellInput(td){return td?td.querySelector('input,textarea,select'):null}
    function setCell(td,val){
        if(!td)return;
        var inp=getCellInput(td);
        if(inp){inp.value=String(val);fire(inp)}else{td.textContent=String(val)}
    }
    function clearRow(row){
        if(!row)return;
        row.removeAttribute('style');
        if(row.dataset){delete row.dataset.spDupAuto;delete row.dataset.spAutoChild;delete row.dataset.spSkipDup;delete row.dataset.originalDuplicate}
        var inputs=row.querySelectorAll('input,textarea,select');
        for(var i=0;i<inputs.length;i++){
            var x=inputs[i];
            if(x.type==='checkbox'){x.checked=false;fire(x)}
            else if(x.tagName==='SELECT'){x.selectedIndex=0;fire(x)}
            else{x.value='';fire(x)}
        }
    }

    function matchDrug(db,q){
        q=nl(q);if(!q)return null;
        var exact=db.find(function(x){return nl(x.code)===q||nl(x.name)===q});
        if(exact)return exact;
        var byCode=db.find(function(x){return nl(x.code).indexOf(q)>-1});
        if(byCode)return byCode;
        return db.find(function(x){return nl(x.name).indexOf(q)>-1})||null;
    }

    function addRowWith(name,code){
        var table=findT();if(!table)return false;
        var header=table.querySelector('tr');if(!header)return false;
        var hs=header.querySelectorAll('th,td');

        /* Smart column detection — by name, not magic index */
        var iName=idx(hs,'name');
        var iCode=idx(hs,'code');
        var iQty=idx(hs,'qty');if(iQty<0)iQty=idx(hs,'كمية');if(iQty<0)iQty=idx(hs,'quantity');
        var iReqQty=idx(hs,'req');if(iReqQty<0)iReqQty=idx(hs,'requested');
        if(iName<0||iCode<0)return false;

        var tbody=(table.tBodies&&table.tBodies.length)?table.tBodies[0]:table;
        var rows=[].slice.call(tbody.querySelectorAll('tr')).filter(function(r){return r.querySelectorAll('th').length===0});
        if(!rows.length)return false;

        var base=rows[rows.length-1];
        var newRow=base.cloneNode(true);
        clearRow(newRow);
        var tds=newRow.querySelectorAll('td');
        if(!tds.length||Math.max(iName,iCode)>=tds.length)return false;

        /* Checkbox auto-check */
        if(tds[0]&&tds[0].querySelector('input.checkk')){
            tds[0].querySelector('input.checkk').checked=true;
            fire(tds[0].querySelector('input.checkk'));
        }

        setCell(tds[iName],name||'');
        setCell(tds[iCode],code||'');

        /* Smart qty fill — by column name, not index */
        if(iQty>=0&&iQty<tds.length)setCell(tds[iQty],1);
        if(iReqQty>=0&&iReqQty<tds.length)setCell(tds[iReqQty],1);
        /* Fallback: if no named qty columns found, try index 3 and 5 */
        if(iQty<0&&tds.length>3)setCell(tds[3],1);
        if(iReqQty<0&&tds.length>5)setCell(tds[5],1);

        newRow.style.animation='ezpSlideIn .3s ease';
        tbody.appendChild(newRow);
        newRow.scrollIntoView({block:'center',behavior:'smooth'});

        /* Track for undo */
        State.lastAdded={row:newRow,parent:tbody};
        showUndoBtn();

        return true;
    }

    function undoLastAdd(){
        if(!State.lastAdded)return;
        var row=State.lastAdded.row;
        if(row&&row.parentNode){
            row.parentNode.removeChild(row);
            toast('تم التراجع عن الإضافة','success');
        }
        State.lastAdded=null;
        hideUndoBtn();
    }

    function showUndoBtn(){
        var btn=document.getElementById('ez-undo-btn');
        if(btn){btn.style.display='flex';btn.style.opacity='0';requestAnimationFrame(function(){btn.style.opacity='1'})}
        clearTimeout(State.undoTimer);
        State.undoTimer=setTimeout(function(){hideUndoBtn();State.lastAdded=null},8000);
    }
    function hideUndoBtn(){
        var btn=document.getElementById('ez-undo-btn');
        if(btn){btn.style.opacity='0';setTimeout(function(){btn.style.display='none'},200)}
    }

    /* ══════════════════════════════════════════
       🖥️ UI — Built with DOM, not innerHTML (XSS-safe)
       ══════════════════════════════════════════ */
    var panel=document.createElement('div');
    panel.id='ezpill_adddrug_panel';
    panel.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;background:#fff;border:none;border-radius:18px;padding:0;box-shadow:0 20px 50px rgba(0,0,0,0.12),0 0 0 1px rgba(99,102,241,0.08);font-family:Cairo,"Segoe UI",sans-serif;width:380px;max-width:95vw;overflow:hidden;opacity:0;transform:translateY(-10px);transition:opacity .3s,transform .3s';

    /* ── Inject animation keyframes ── */
    var styleEl=document.createElement('style');
    styleEl.textContent='@keyframes ezpSlideIn{from{opacity:0;background:rgba(99,102,241,0.06)}to{opacity:1;background:transparent}}';
    document.head.appendChild(styleEl);

    /* ── Header (draggable) ── */
    var hdr=document.createElement('div');
    hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:18px 20px 14px;border-bottom:1px solid #f0f0f0;cursor:grab;user-select:none';

    var logoArea=document.createElement('div');
    logoArea.style.cssText='display:flex;align-items:center;gap:10px';

    var logoIcon=document.createElement('div');
    logoIcon.style.cssText='width:38px;height:38px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px';
    logoIcon.textContent='💊';

    var logoText=document.createElement('div');
    var titleEl=document.createElement('div');
    titleEl.style.cssText='font-weight:800;font-size:16px;color:#1e1b4b';
    titleEl.textContent='إضافة صنف';
    var cloudEl=document.createElement('div');
    cloudEl.id='ez-drug-cloud-status';
    cloudEl.style.cssText='font-size:10px;font-weight:700;color:#94a3b8';
    cloudEl.textContent='جاري التحميل...';
    logoText.appendChild(titleEl);
    logoText.appendChild(cloudEl);
    logoArea.appendChild(logoIcon);
    logoArea.appendChild(logoText);

    var btnsArea=document.createElement('div');
    btnsArea.style.cssText='display:flex;gap:4px';

    var adminBtn=document.createElement('button');
    adminBtn.id='ez-drug-admin-btn';
    adminBtn.title='إدارة';
    adminBtn.style.cssText='width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#6366f1;cursor:pointer;font-size:14px';
    adminBtn.textContent='⚙️';

    var closeBtn=document.createElement('button');
    closeBtn.style.cssText='width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#94a3b8;cursor:pointer;font-size:16px';
    closeBtn.innerHTML='&times;';
    closeBtn.onclick=function(){
        panel.style.opacity='0';panel.style.transform='translateY(-10px)';
        setTimeout(function(){panel.remove()},300);
    };

    btnsArea.appendChild(adminBtn);
    btnsArea.appendChild(closeBtn);
    hdr.appendChild(logoArea);
    hdr.appendChild(btnsArea);

    /* ── Panel Drag ── */
    var panDrag=false,panSX=0,panSY=0,panX=0,panY=0;
    function panStart(x,y){panDrag=true;panSX=x;panSY=y;hdr.style.cursor='grabbing';panel.style.transition='none'}
    function panMove(x,y){
        if(!panDrag)return;
        panX+=(x-panSX);panY+=(y-panSY);
        panX=Math.max(-panel.offsetWidth+60,Math.min(window.innerWidth-60,panX));
        panY=Math.max(0,Math.min(window.innerHeight-40,panY));
        panel.style.right='auto';panel.style.left=panX+'px';panel.style.top=panY+'px';
        panSX=x;panSY=y;
    }
    function panEnd(){panDrag=false;hdr.style.cursor='grab';panel.style.transition='opacity .3s,transform .3s'}
    hdr.addEventListener('mousedown',function(e){if(e.target.closest('button'))return;e.preventDefault();var r=panel.getBoundingClientRect();panX=r.left;panY=r.top;panel.style.right='auto';panel.style.left=panX+'px';panel.style.top=panY+'px';panStart(e.clientX,e.clientY)});
    hdr.addEventListener('touchstart',function(e){if(e.target.closest('button'))return;var t=e.touches[0];var r=panel.getBoundingClientRect();panX=r.left;panY=r.top;panel.style.right='auto';panel.style.left=panX+'px';panel.style.top=panY+'px';panStart(t.clientX,t.clientY)},{passive:true});
    document.addEventListener('mousemove',function(e){panMove(e.clientX,e.clientY)});
    document.addEventListener('touchmove',function(e){if(panDrag){panMove(e.touches[0].clientX,e.touches[0].clientY)}},{passive:true});
    document.addEventListener('mouseup',panEnd);
    document.addEventListener('touchend',panEnd);

    /* ── Body ── */
    var body=document.createElement('div');
    body.style.cssText='padding:16px 20px 12px';

    /* Search wrapper */
    var searchWrap=document.createElement('div');
    searchWrap.style.cssText='margin-bottom:12px;position:relative';

    var searchInput=document.createElement('input');
    searchInput.id='ezpill_adddrug_q';
    searchInput.type='text';
    searchInput.placeholder='🔍 ابحث بالاسم أو الكود...';
    searchInput.style.cssText='width:100%;padding:12px 14px;border:1.5px solid rgba(99,102,241,0.15);border-radius:12px;font-size:14px;font-family:Cairo,sans-serif;box-sizing:border-box;outline:none;direction:ltr;transition:border-color .2s,box-shadow .2s';
    searchInput.addEventListener('focus',function(){this.style.borderColor='#6366f1';this.style.boxShadow='0 0 0 3px rgba(99,102,241,0.08)'});
    searchInput.addEventListener('blur',function(){this.style.borderColor='rgba(99,102,241,0.15)';this.style.boxShadow='none'});

    var sugBox=document.createElement('div');
    sugBox.id='search-suggestions';
    sugBox.style.cssText='position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;max-height:220px;overflow-y:auto;display:none;z-index:1000000;box-shadow:0 8px 30px rgba(0,0,0,0.1);margin-top:4px';

    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(sugBox);

    /* Add button */
    var addBtn=document.createElement('button');
    addBtn.id='ezpill_adddrug_btn';
    addBtn.style.cssText='width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;cursor:pointer;font-weight:800;font-size:14px;font-family:Cairo,sans-serif;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 15px rgba(99,102,241,0.25)';
    addBtn.textContent='➕ إضافة للجدول';
    addBtn.addEventListener('mouseenter',function(){this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(99,102,241,0.35)'});
    addBtn.addEventListener('mouseleave',function(){this.style.transform='';this.style.boxShadow='0 4px 15px rgba(99,102,241,0.25)'});

    /* Undo button (hidden by default) */
    var undoBtn=document.createElement('button');
    undoBtn.id='ez-undo-btn';
    undoBtn.style.cssText='display:none;width:100%;padding:10px;border-radius:10px;border:1.5px solid #ef4444;background:rgba(239,68,68,0.04);color:#ef4444;cursor:pointer;font-weight:800;font-size:12px;font-family:Cairo,sans-serif;margin-top:8px;align-items:center;justify-content:center;gap:6px;transition:opacity .2s';
    undoBtn.textContent='↩️ تراجع عن الإضافة';
    undoBtn.onclick=undoLastAdd;

    /* Status */
    var statusEl=document.createElement('div');
    statusEl.id='ezpill_adddrug_status';
    statusEl.style.cssText='margin-top:12px;padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;min-height:20px;font-weight:700';

    body.appendChild(searchWrap);
    body.appendChild(addBtn);
    body.appendChild(undoBtn);
    body.appendChild(statusEl);

    /* ── Footer ── */
    var footer=document.createElement('div');
    footer.style.cssText='background:#f8fafc;padding:10px 20px;border-top:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center';

    var verEl=document.createElement('div');
    verEl.style.cssText='font-size:10px;color:#94a3b8';
    verEl.textContent='v3.0 Enhanced';

    var countEl=document.createElement('div');
    countEl.id='drug_count';
    countEl.style.cssText='font-size:11px;color:#6366f1;font-weight:700';
    countEl.textContent='0 صنف';

    footer.appendChild(verEl);
    footer.appendChild(countEl);

    /* Assemble panel */
    panel.appendChild(hdr);
    panel.appendChild(body);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    /* Animate in */
    requestAnimationFrame(function(){requestAnimationFrame(function(){
        panel.style.opacity='1';panel.style.transform='translateY(0)';
    })});

    /* ══════════════════════════════════════════
       👤 ADMIN PANEL
       ══════════════════════════════════════════ */
    adminBtn.onclick=async function(){
        var pin=prompt('الرقم السري للأدمن:');
        if(pin===null)return;
        var hash=await _hashPin(pin);
        if(hash!==_EZ_ADMIN_HASH){toast('الرقم السري غلط','error');return}

        var overlay=document.createElement('div');
        overlay.style.cssText='position:fixed;inset:0;background:rgba(15,15,35,0.6);backdrop-filter:blur(8px);z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif';

        var card=document.createElement('div');
        card.style.cssText='width:420px;max-width:95vw;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(99,102,241,0.2)';

        /* Card header */
        var cardHdr=document.createElement('div');
        cardHdr.style.cssText='padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px';

        var lockIcon=document.createElement('div');lockIcon.style.fontSize='22px';lockIcon.textContent='🔐';
        var cardInfo=document.createElement('div');cardInfo.style.flex='1';
        var cardTitle=document.createElement('div');cardTitle.style.cssText='font-size:15px;font-weight:900;color:#1e1b4b';cardTitle.textContent='إدارة قاعدة الأدوية';
        var cardSub=document.createElement('div');cardSub.style.cssText='font-size:10px;font-weight:700;color:#64748b';cardSub.textContent='رفع + دمج + تشفير + جيتهاب';
        cardInfo.appendChild(cardTitle);cardInfo.appendChild(cardSub);

        var cardClose=document.createElement('button');
        cardClose.style.cssText='width:28px;height:28px;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;background:#f3f4f6;font-size:14px';
        cardClose.textContent='✕';
        cardClose.onclick=function(){overlay.remove()};

        cardHdr.appendChild(lockIcon);cardHdr.appendChild(cardInfo);cardHdr.appendChild(cardClose);

        /* Card body */
        var cardBody=document.createElement('div');
        cardBody.style.cssText='padding:18px 22px;direction:rtl';

        /* Token input — SAFE: no innerHTML injection */
        var tokenLabel=document.createElement('div');
        tokenLabel.style.cssText='font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px';
        tokenLabel.textContent='توكن جيتهاب:';

        var tokenInput=document.createElement('input');
        tokenInput.id='ez-admin-token';
        tokenInput.type='password';
        tokenInput.placeholder='الصق التوكن';
        tokenInput.value=_getGHToken();  /* Safe: .value assignment, not innerHTML */
        tokenInput.style.cssText='width:100%;padding:8px 12px;border:1.5px solid rgba(99,102,241,0.15);border-radius:10px;font-size:12px;font-family:Cairo;direction:ltr;margin-bottom:12px;box-sizing:border-box;outline:none';

        /* File input */
        var fileLabel=document.createElement('div');
        fileLabel.style.cssText='font-size:12px;font-weight:800;color:#1e1b4b;margin-bottom:6px';
        fileLabel.textContent='ملف الأصناف الجديد:';

        var fileInput=document.createElement('input');
        fileInput.id='ez-admin-file';
        fileInput.type='file';
        fileInput.accept='.xlsx,.xls,.csv';
        fileInput.style.cssText='width:100%;padding:10px;border:2px dashed rgba(99,102,241,0.15);border-radius:10px;background:rgba(99,102,241,0.02);font-size:12px;box-sizing:border-box;margin-bottom:8px';

        var fileInfo=document.createElement('div');
        fileInfo.id='ez-admin-file-info';
        fileInfo.style.cssText='font-size:11px;color:#64748b;margin-bottom:12px';

        /* Merge mode */
        var modeWrap=document.createElement('div');
        modeWrap.style.cssText='display:flex;gap:12px;margin-bottom:14px;align-items:center';

        function makeRadio(id,val,label,checked){
            var lbl=document.createElement('label');
            lbl.style.cssText='display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#1e1b4b;cursor:pointer';
            var radio=document.createElement('input');
            radio.type='radio';radio.name='ez-merge-mode';radio.id=id;radio.value=val;
            radio.checked=checked;radio.style.accentColor='#6366f1';
            var txt=document.createTextNode(label);
            lbl.appendChild(radio);lbl.appendChild(txt);
            return lbl;
        }
        modeWrap.appendChild(makeRadio('ez-mode-merge','merge','دمج مع الموجود',true));
        modeWrap.appendChild(makeRadio('ez-mode-replace','replace','استبدال كامل',false));

        /* Push button */
        var pushBtn=document.createElement('button');
        pushBtn.id='ez-admin-encrypt-push';
        pushBtn.style.cssText='width:100%;height:42px;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo;color:#fff;background:linear-gradient(145deg,#6366f1,#4f46e5);margin-bottom:8px';
        pushBtn.textContent='🔐 تشفير ورفع على جيتهاب';

        var adminStatus=document.createElement('div');
        adminStatus.id='ez-admin-status';
        adminStatus.style.cssText='padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;font-weight:700';

        cardBody.appendChild(tokenLabel);
        cardBody.appendChild(tokenInput);
        cardBody.appendChild(fileLabel);
        cardBody.appendChild(fileInput);
        cardBody.appendChild(fileInfo);
        cardBody.appendChild(modeWrap);
        cardBody.appendChild(pushBtn);
        cardBody.appendChild(adminStatus);

        card.appendChild(cardHdr);
        card.appendChild(cardBody);
        overlay.appendChild(card);
        overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
        document.body.appendChild(overlay);

        /* Admin logic */
        var pendingDB=null;

        fileInput.onchange=function(){
            var f=this.files&&this.files[0];if(!f)return;
            fileInfo.textContent='جاري القراءة...';
            parseExcel(f,function(db){
                if(!db||!db.length){fileInfo.textContent='❌ فشل قراءة الملف';return}
                pendingDB=db;
                fileInfo.innerHTML='✅ تم قراءة <b>'+db.length+'</b> صنف — جاهز للرفع';
            });
        };

        pushBtn.onclick=async function(){
            var token=tokenInput.value.trim();
            if(!token){toast('ادخل التوكن','error');return}
            _setGHToken(token);
            if(!pendingDB||!pendingDB.length){toast('ارفع الملف أولاً','error');return}

            var mergeMode=document.querySelector('input[name="ez-merge-mode"]:checked').value;
            pushBtn.disabled=true;adminStatus.textContent='';

            try{
                var finalDB=[],addedCount=0;
                if(mergeMode==='merge'){
                    pushBtn.textContent='⏳ جاري جلب الأصناف الموجودة...';
                    adminStatus.textContent='☁️ جاري جلب الأصناف من السحابة...';
                    var existing=await fetchDrugsFromGH()||[];
                    var map={};
                    existing.forEach(function(d){if(d.code)map[d.code.toLowerCase()]=d});
                    pendingDB.forEach(function(d){
                        var k=(d.code||'').toLowerCase();
                        if(!map[k])addedCount++;
                        map[k]=d;
                    });
                    finalDB=Object.values(map);
                    adminStatus.textContent='🔀 دمج: '+existing.length+' موجود + '+addedCount+' جديد = '+finalDB.length;
                }else{
                    finalDB=pendingDB;addedCount=pendingDB.length;
                    adminStatus.textContent='⚠️ استبدال: '+finalDB.length+' صنف';
                }

                pushBtn.textContent='⏳ جاري التشفير والرفع...';
                var ok=await pushDrugsToGH(finalDB);

                if(ok){
                    var msg=mergeMode==='merge'
                        ?'✅ تم الدمج — '+finalDB.length+' صنف (➕'+addedCount+' جديد)'
                        :'✅ تم الرفع — '+finalDB.length+' صنف';
                    adminStatus.innerHTML=msg;
                    toast(msg.replace(/<[^>]*>/g,''),'success');
                    State.db=finalDB;
                    try{localStorage.setItem('ez_drugs_cache',JSON.stringify(finalDB))}catch(e){}
                    countEl.textContent=finalDB.length+' صنف';
                    cloudEl.textContent='☁️ '+finalDB.length+' صنف محمّل';
                }else{adminStatus.textContent='❌ فشل الرفع'}
            }catch(e){
                adminStatus.textContent='❌ خطأ: '+e.message;
            }
            pushBtn.textContent='🔐 تشفير ورفع على جيتهاب';
            pushBtn.disabled=false;
        };
    };

    /* ══════════════════════════════════════════
       🔍 SEARCH (with debounce)
       ══════════════════════════════════════════ */
    var doSearch=debounce(function(q){
        sugBox.innerHTML='';
        if(q.length<1||!State.db.length){sugBox.style.display='none';return}
        var matches=State.db.filter(function(i){
            return nl(i.name).indexOf(nl(q))>-1||nl(i.code).indexOf(nl(q))>-1;
        }).slice(0,10);
        if(!matches.length){sugBox.style.display='none';return}

        matches.forEach(function(item){
            var div=document.createElement('div');
            div.style.cssText='padding:10px 14px;cursor:pointer;border-bottom:1px solid #f5f5f5;transition:background .15s';
            var nameDiv=document.createElement('div');
            nameDiv.style.cssText='font-weight:700;font-size:13px;color:#1e1b4b';
            nameDiv.textContent=item.name;
            var codeDiv=document.createElement('div');
            codeDiv.style.cssText='font-size:11px;color:#94a3b8;direction:ltr';
            codeDiv.textContent=item.code;
            div.appendChild(nameDiv);div.appendChild(codeDiv);
            div.onmouseenter=function(){this.style.background='rgba(99,102,241,0.04)'};
            div.onmouseleave=function(){this.style.background=''};
            div.onclick=function(){
                searchInput.value=item.name;
                sugBox.style.display='none';
                searchInput.focus();
            };
            sugBox.appendChild(div);
        });
        sugBox.style.display='block';
    },180);

    searchInput.addEventListener('input',function(){doSearch(this.value)});
    searchInput.addEventListener('keydown',function(e){if(e.key==='Enter')doAdd()});

    /* Close suggestions on outside click */
    document.addEventListener('click',function(e){
        if(!e.target.closest('#ezpill_adddrug_panel'))sugBox.style.display='none';
    });

    /* ══════════════════════════════════════════
       ➕ ADD ACTION
       ══════════════════════════════════════════ */
    function doAdd(){
        var q=searchInput.value||'';
        if(!State.db.length){statusEl.textContent='لا توجد أدوية — ارفع الملف من ⚙️';return}
        var item=matchDrug(State.db,q);
        if(!item){statusEl.textContent='❌ مش موجود: '+esc(q);return}
        if(addRowWith(item.name,item.code)){
            statusEl.textContent='✅ تمت الإضافة: '+item.name;
            searchInput.value='';
            sugBox.style.display='none';
        }else{
            statusEl.textContent='❌ فشلت الإضافة — تأكد من الجدول';
        }
    }
    addBtn.onclick=doAdd;

    /* ══════════════════════════════════════════
       🚀 INIT
       ══════════════════════════════════════════ */

    /* Pre-load CryptoJS for HTTP */
    if(!_isSecure()){
        _loadCryptoJS().then(function(ok){
            console.log('CryptoJS pre-load:'+(ok?' ready':' failed'));
        });
    }

    /* Auto-load drugs */
    (async function(){
        cloudEl.textContent='☁️ جاري سحب الأصناف...';
        statusEl.textContent='جاري التحميل من السحابة...';
        var db=await fetchDrugsFromGH();
        if(db&&db.length){
            State.db=db;
            countEl.textContent=db.length+' صنف';
            cloudEl.textContent='☁️ '+db.length+' صنف محمّل';
            statusEl.textContent='✅ تم تحميل '+db.length+' صنف';
        }else{
            cloudEl.textContent='⚠️ لا يوجد ملف أدوية';
            statusEl.textContent='لم يتم العثور على أدوية — اضغط ⚙️';
        }
    })();

})();

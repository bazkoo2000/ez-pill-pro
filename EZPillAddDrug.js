(function(){
    'use strict';
    function n(t){return(t||'').toString().trim().replace(/\s+/g,' ')}
    function nl(t){return n(t).toLowerCase()}
    function fire(el){
        try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}
        try{el.dispatchEvent(new Event('blur',{bubbles:true}))}catch(e){}
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
        if(inp){
            inp.value=String(val);
            fire(inp);
        }else{td.textContent=String(val)}
    }
    function clearRow(row){
        if(!row)return;
        row.removeAttribute('style');
        if(row.dataset){
            delete row.dataset.spDupAuto; delete row.dataset.spAutoChild;
            delete row.dataset.spSkipDup; delete row.dataset.originalDuplicate;
        }
        var inputs=row.querySelectorAll('input,textarea,select');
        for(var i=0;i<inputs.length;i++){
            var x=inputs[i];
            if(x.type==='checkbox'){x.checked=false;fire(x)}
            else if(x.tagName==='SELECT'){x.selectedIndex=0;fire(x)}
            else{x.value='';fire(x)}
        }
    }
    function ensureUI(){
        var old=document.getElementById('ezpill_adddrug_panel');
        if(old)return old;
        var d=document.createElement('div');
        d.id='ezpill_adddrug_panel';
        d.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border:none;border-radius:16px;padding:0;box-shadow:0 20px 40px rgba(0,0,0,0.15);font-family:"Segoe UI",sans-serif;width:350px;max-width:350px;overflow:hidden;';
        d.innerHTML='<div style="background:white;padding:24px;border-radius:16px 16px 0 0;">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f0f0f0;">'+
        '<div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;">EZ</div>'+
        '<div style="font-weight:700;font-size:18px;color:#1a202c;">EZPill Add Drug</div></div>'+
        '<button id="ezpill_adddrug_close" style="width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:white;color:#4a5568;cursor:pointer;font-size:18px;">&times;</button></div>'+
        '<div style="margin-bottom:16px;"><div style="font-weight:600;color:#4a5568;margin-bottom:8px;font-size:14px;">Upload Excel/CSV File</div><input id="ezpill_adddrug_file" type="file" accept=".xlsx,.xls,.csv" style="width:100%;padding:10px;border:2px dashed #e2e8f0;border-radius:10px;background:#f8fafc;font-size:13px;box-sizing:border-box;"/></div>'+
        '<div style="margin-bottom:16px;position:relative;"><div style="font-weight:600;color:#4a5568;margin-bottom:8px;font-size:14px;">Search Drug</div><input id="ezpill_adddrug_q" type="text" placeholder="Search..." style="width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;box-sizing:border-box;"/><div id="search-suggestions" style="position:absolute;top:100%;left:0;right:0;background:white;border:1px solid #e2e8f0;border-radius:10px;max-height:200px;overflow-y:auto;display:none;z-index:1000000;box-shadow:0 4px 12px rgba(0,0,0,0.1);margin-top:4px;"></div></div>'+
        '<button id="ezpill_adddrug_btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;cursor:pointer;font-weight:600;font-size:15px;">➕ Add Drug to Table</button>'+
        '<div id="ezpill_adddrug_status" style="margin-top:16px;padding:10px;border-radius:10px;background:#f8fafc;font-size:12px;color:#4a5568;text-align:center;height:45px;overflow:hidden;word-break:break-word;display:flex;align-items:center;justify-content:center;box-sizing:border-box;"></div></div>'+
        '<div style="background:#f8fafc;padding:12px 24px;border-radius:0 0 16px 16px;border-top:1px solid #f0f0f0;"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:11px;color:#718096;">v1.2 GitHub Cloud</div><div id="drug_count" style="font-size:11px;color:#667eea;font-weight:600;">No drugs loaded</div></div></div>';
        document.body.appendChild(d);
        document.getElementById('ezpill_adddrug_close').onclick=function(){d.remove()};
        return d;
    }
    // ... (باقي دوال المعالجة parseCSV, parseExcel, addRowWith إلخ تبقى كما هي بالداخل)
    function parseCSV(text){var lines=text.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(function(x){return x.length});if(!lines.length)return[];var sep=lines[0].indexOf('\t')>-1?'\t':(lines[0].split(';').length>lines[0].split(',').length?';':',');function splitLine(line){var out=[],cur='',q=false;for(var i=0;i<line.length;i++){var ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else{q=!q}}else if(ch===sep&&!q){out.push(cur);cur=''}else{cur+=ch}}out.push(cur);return out.map(function(s){return n(s.replace(/^"|"$/g,''))})}var head=splitLine(lines[0]).map(nl);var iName=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});var iCode=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});if(iName<0)iName=0;if(iCode<0)iCode=1;var db=[];for(var r=1;r<lines.length;r++){var cols=splitLine(lines[r]);var name=cols[iName]||'';var code=cols[iCode]||'';if(name||code)db.push({name:n(name),code:n(code)})}return db}
    function ensureXLSX(cb){if(window.XLSX)return cb(true);var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=function(){cb(!!window.XLSX)};s.onerror=function(){cb(false)};document.head.appendChild(s)}
    function parseExcel(file,cb){var ext=(file.name||'').toLowerCase();if(ext.endsWith('.csv')){var fr=new FileReader();fr.onload=function(){cb(parseCSV(String(fr.result||'')))};fr.readAsText(file);return}ensureXLSX(function(ok){if(!ok){cb(null);return}var fr=new FileReader();fr.onload=function(e){try{var data=new Uint8Array(e.target.result);var wb=XLSX.read(data,{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false});if(!rows||!rows.length){cb([]);return}var head=(rows[0]||[]).map(function(x){return nl(String(x||''))});var iName=head.findIndex(function(h){return h==='name'||h.indexOf('name')>-1||h==='اسم'||h.indexOf('اسم')>-1});var iCode=head.findIndex(function(h){return h==='code'||h.indexOf('code')>-1||h==='كود'||h.indexOf('كود')>-1});if(iName<0)iName=0;if(iCode<0)iCode=1;var db=[];for(var i=1;i<rows.length;i++){var r=rows[i]||[];var name=n(r[iName]);var code=n(r[iCode]);if(name||code)db.push({name:name,code:code})}cb(db)}catch(err){cb(null)}};fr.readAsArrayBuffer(file)})}
    function matchDrug(db,q){q=nl(q);if(!q)return null;var exact=db.find(function(x){return nl(x.code)===q||nl(x.name)===q});if(exact)return exact;var byCode=db.find(function(x){return nl(x.code).indexOf(q)>-1});if(byCode)return byCode;var byName=db.find(function(x){return nl(x.name).indexOf(q)>-1});if(byName)return byName;return null}
    function addRowWith(name,code){
        var table=findT(); if(!table)return false;
        var header=table.querySelector('tr'); if(!header)return false;
        var hs=header.querySelectorAll('th,td');
        var iName=idx(hs,'name'), iCode=idx(hs,'code');
        if(iName<0||iCode<0)return false;
        var tbody=(table.tBodies&&table.tBodies.length)?table.tBodies[0]:table;
        var rows=[].slice.call(tbody.querySelectorAll('tr')).filter(function(r){return r.querySelectorAll('th').length===0});
        if(!rows.length)return false;
        var base=rows[rows.length-1]; var newRow=base.cloneNode(true);
        clearRow(newRow); var tds=newRow.querySelectorAll('td');
        if(!tds.length||Math.max(iName,iCode)>=tds.length)return false;
        if(tds[0] && tds[0].querySelector('input.checkk')){tds[0].querySelector('input.checkk').checked=true; fire(tds[0].querySelector('input.checkk'));}
        setCell(tds[iName],name||''); setCell(tds[iCode],code||'');
        setCell(tds[3],1); setCell(tds[5],1);
        tbody.appendChild(newRow); newRow.scrollIntoView({block:'center'}); return true;
    }

    var ui=ensureUI();
    var status=document.getElementById('ezpill_adddrug_status');
    var drugCount=document.getElementById('drug_count');
    if(!window.EZPillDrugDB)window.EZPillDrugDB=[];

    document.getElementById('ezpill_adddrug_file').onchange=function(){
        var f=this.files&&this.files[0]; if(!f)return;
        status.textContent='Loading...';
        parseExcel(f,function(db){
            if(db===null){status.textContent='Error reading file.';return}
            window.EZPillDrugDB=db||[];
            var count=window.EZPillDrugDB.length||0;
            status.textContent='Loaded ' + count + ' drugs.';
            drugCount.textContent=count + ' drugs loaded';
            document.getElementById('ezpill_adddrug_q').focus();
        });
    };

    function doAdd(){
        var q=document.getElementById('ezpill_adddrug_q').value||'';
        if(!window.EZPillDrugDB||!window.EZPillDrugDB.length){status.textContent='Upload file first';return}
        var item=matchDrug(window.EZPillDrugDB,q);
        if(!item){status.textContent='Not found: ' + q;return}
        if(addRowWith(item.name,item.code)){
            status.textContent='✓ Added: ' + item.name;
            document.getElementById('ezpill_adddrug_q').value='';
            document.getElementById('search-suggestions').style.display='none';
        }
    }
    document.getElementById('ezpill_adddrug_btn').onclick=doAdd;
    document.getElementById('ezpill_adddrug_q').onkeydown=function(e){if(e.key==='Enter')doAdd()};
    document.getElementById('ezpill_adddrug_q').oninput=function(){
        var q=this.value, sug=document.getElementById('search-suggestions');
        sug.innerHTML='';
        if(q.length>0 && window.EZPillDrugDB.length){
            var matches=window.EZPillDrugDB.filter(i=>nl(i.name).includes(nl(q))||nl(i.code).includes(nl(q))).slice(0,10);
            if(matches.length){
                matches.forEach(item=>{
                    var div=document.createElement('div');
                    div.style.cssText='padding:12px;cursor:pointer;border-bottom:1px solid #f0f0f0;';
                    div.innerHTML='<div style="font-weight:600;font-size:13px;">'+item.name+'</div><div style="font-size:11px;color:#718096;">Code: '+item.code+'</div>';
                    div.onclick=function(){document.getElementById('ezpill_adddrug_q').value=item.name; sug.style.display='none'; document.getElementById('ezpill_adddrug_q').focus();};
                    sug.appendChild(div);
                });
                sug.style.display='block';
            }else{sug.style.display='none'}
        }else{sug.style.display='none'}
    };
})();

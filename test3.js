(async function () {
  var oldPanel = document.getElementById("fd-bulk-panel");
  if (oldPanel) oldPanel.remove();
  var oldModal = document.getElementById("fd-intake-modal");
  if (oldModal) oldModal.remove();
  if (window._fd_origFetch) window.fetch = window._fd_origFetch;
  if (window._fd_origSetHeader) XMLHttpRequest.prototype.setRequestHeader = window._fd_origSetHeader;
  window._fd_treatments = [];
  window._fd_capturedToken = null;
  var INTAKES = [];

  var css = '#fd-bulk-panel{position:fixed;top:0;right:0;width:440px;height:100vh;background:#fff;border-left:3px solid #f57c00;z-index:999999;font-family:Arial,sans-serif;font-size:13px;overflow-y:auto;box-shadow:-4px 0 20px rgba(0,0,0,.3)}#fd-bulk-panel *{box-sizing:border-box}#fd-bulk-panel .fd-header{background:#f57c00;color:#fff;padding:12px 15px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center}#fd-bulk-panel .fd-close{cursor:pointer;font-size:22px;background:none;border:none;color:#fff;font-weight:bold}#fd-bulk-panel .fd-tabs{display:flex;background:#f5f5f5;border-bottom:2px solid #eee}#fd-bulk-panel .fd-tab{flex:1;padding:10px;text-align:center;cursor:pointer;font-weight:bold;color:#666;border:none;background:none;font-size:13px}#fd-bulk-panel .fd-tab.active{color:#f57c00;border-bottom:3px solid #f57c00;background:#fff}#fd-bulk-panel .fd-tab-content{display:none;padding:15px}#fd-bulk-panel .fd-tab-content.active{display:block}#fd-bulk-panel label{display:block;margin:8px 0 3px;font-weight:bold;color:#333;font-size:12px}#fd-bulk-panel input[type=date],#fd-bulk-panel input[type=number],#fd-bulk-panel input[type=text],#fd-bulk-panel select{width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:13px}#fd-bulk-panel .fd-row{display:flex;gap:8px;align-items:flex-end}#fd-bulk-panel .fd-row>div{flex:1}#fd-bulk-panel .fd-btn{width:100%;padding:10px;margin-top:10px;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;color:#fff}#fd-bulk-panel .fd-btn-blue{background:#1976d2}#fd-bulk-panel .fd-btn-orange{background:#f57c00}#fd-bulk-panel .fd-btn-green{background:#388e3c}#fd-bulk-panel .fd-btn:hover{opacity:.9}#fd-bulk-panel .fd-btn:disabled{background:#ccc;cursor:not-allowed}#fd-bulk-panel .fd-log{margin-top:10px;padding:8px;background:#f5f5f5;border-radius:4px;max-height:180px;overflow-y:auto;font-size:11px;line-height:1.5;direction:ltr;word-break:break-all}#fd-bulk-panel .fd-log .ok{color:green}#fd-bulk-panel .fd-log .err{color:red}#fd-bulk-panel .fd-log .info{color:#1976d2}#fd-bulk-panel .fd-treatments{margin-top:8px;max-height:220px;overflow-y:auto}#fd-bulk-panel .fd-treat-item{display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid #eee;gap:6px}#fd-bulk-panel .fd-treat-item:hover{background:#f9f9f9}#fd-bulk-panel .fd-treat-item input[type=checkbox]{width:16px;height:16px;flex-shrink:0}#fd-bulk-panel .fd-tid{color:#999;font-size:10px}#fd-bulk-panel .fd-dates{color:#1976d2;font-size:11px}#fd-bulk-panel .fd-filter{margin:8px 0;padding:6px;background:#e3f2fd;border-radius:4px;font-size:12px}#fd-bulk-panel .fd-filter label{display:inline;margin:0 8px 0 0;font-weight:normal}#fd-bulk-panel .fd-progress{background:#e0e0e0;border-radius:4px;height:5px;margin:6px 0}#fd-bulk-panel .fd-progress-bar{background:#f57c00;height:5px;border-radius:4px;transition:width .3s}#fd-bulk-panel .fd-calc-box{margin-top:8px;padding:10px;background:#fff3e0;border:1px solid #ffcc80;border-radius:6px}#fd-bulk-panel .fd-calc-box .fd-calc-title{font-weight:bold;color:#e65100;margin-bottom:6px;font-size:12px}#fd-bulk-panel .fd-calc-result{margin-top:6px;padding:6px;background:#fff;border-radius:4px;font-weight:bold;color:#2e7d32;text-align:center;font-size:13px;border:1px dashed #a5d6a7;display:none}#fd-bulk-panel .fd-or-divider{text-align:center;color:#999;margin:10px 0;font-size:11px;position:relative}#fd-bulk-panel .fd-or-divider::before,#fd-bulk-panel .fd-or-divider::after{content:"";position:absolute;top:50%;width:38%;height:1px;background:#ddd}#fd-bulk-panel .fd-or-divider::before{left:0}#fd-bulk-panel .fd-or-divider::after{right:0}#fd-bulk-panel .fd-search-results{max-height:150px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;margin-top:5px;display:none}#fd-bulk-panel .fd-search-item{padding:8px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:12px}#fd-bulk-panel .fd-search-item:hover{background:#e3f2fd}#fd-bulk-panel .fd-selected-med{margin-top:5px;padding:8px;background:#e8f5e9;border-radius:4px;font-size:12px;color:#2e7d32;display:none}#fd-bulk-panel .fd-token-box{margin:8px 0;padding:8px;background:#fff8e1;border:1px solid #ffd54f;border-radius:4px;font-size:11px}#fd-bulk-panel .fd-dose-btn{width:100%;padding:10px;margin-top:5px;border:1px solid #1976d2;border-radius:6px;background:#e3f2fd;color:#1976d2;font-size:13px;font-weight:bold;cursor:pointer;text-align:left}#fd-bulk-panel .fd-dose-btn:hover{background:#bbdefb}';

  var modalCss = '#fd-intake-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999999;font-family:Arial,sans-serif}#fd-intake-modal .fd-modal-content{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:10px;width:420px;max-height:80vh;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.3)}#fd-intake-modal .fd-modal-header{background:#1976d2;color:#fff;padding:15px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center}#fd-intake-modal .fd-modal-close{cursor:pointer;font-size:22px;background:none;border:none;color:#fff;font-weight:bold}#fd-intake-modal .fd-modal-body{padding:15px;max-height:60vh;overflow-y:auto}#fd-intake-modal .fd-modal-footer{padding:10px 15px;border-top:1px solid #eee;display:flex;gap:10px}#fd-intake-modal .fd-modal-footer button{flex:1;padding:10px;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;color:#fff}#fd-intake-modal .fd-intake-row{display:flex;align-items:center;padding:10px 8px;border-bottom:1px solid #f0f0f0;gap:10px;cursor:pointer;border-radius:4px}#fd-intake-modal .fd-intake-row:hover{background:#e3f2fd}#fd-intake-modal .fd-intake-row.selected{background:#e8f5e9;border:1px solid #a5d6a7}#fd-intake-modal .fd-intake-row input[type=radio]{width:18px;height:18px;flex-shrink:0}#fd-intake-modal .fd-itime{color:#1976d2;font-weight:bold;font-size:14px;min-width:50px}#fd-intake-modal .fd-iname{font-size:13px;flex:1}#fd-intake-modal .fd-idose-wrap{display:flex;align-items:center;gap:4px;font-size:12px}#fd-intake-modal .fd-idose{width:55px;padding:5px;border:1px solid #ccc;border-radius:4px;text-align:center;font-size:13px}';

  var panel = document.createElement("div");
  panel.id = "fd-bulk-panel";
  panel.innerHTML = '<style>' + css + '</style>\
    <div class="fd-header"><span>Farmadosis Tools</span><button class="fd-close" id="fd-close-btn">&times;</button></div>\
    <div class="fd-tabs"><button class="fd-tab active" data-tab="update">Update Dates</button><button class="fd-tab" data-tab="add">Add Treatment</button></div>\
    <div class="fd-tab-content active" id="fd-tab-update">\
      <button class="fd-btn fd-btn-blue" id="fd-load-btn">Load Treatments</button>\
      <div id="fd-filter-section" style="display:none;" class="fd-filter"><label><input type="checkbox" id="fd-filter-active" checked /> Active only</label></div>\
      <div id="fd-treat-list" class="fd-treatments"></div>\
      <div id="fd-date-section" style="display:none;">\
        <label>Start Date:</label><input type="date" id="fd-start-date" />\
        <div class="fd-calc-box"><div class="fd-calc-title">Auto-Calculate End Date (QTY &times; Size)</div>\
          <div class="fd-row"><div><label style="font-size:11px;margin:0 0 2px;">QTY</label><input type="number" id="fd-qty" value="1" min="1" /></div>\
          <div><label style="font-size:11px;margin:0 0 2px;">Size</label><input type="number" id="fd-size" value="30" min="1" /></div>\
          <div><label style="font-size:11px;margin:0 0 2px;">Days</label><input type="number" id="fd-total-days" readonly style="background:#eee;font-weight:bold;" /></div></div>\
          <div class="fd-calc-result" id="fd-calc-result"></div></div>\
        <div class="fd-or-divider">OR set manually</div>\
        <label>End Date:</label><input type="date" id="fd-end-date" />\
        <div id="fd-progress-wrap" style="display:none;"><div class="fd-progress"><div class="fd-progress-bar" id="fd-progress-bar" style="width:0%"></div></div></div>\
        <button class="fd-btn fd-btn-orange" id="fd-update-btn">Update Selected</button>\
        <button class="fd-btn fd-btn-green" id="fd-refresh-btn" style="display:none;">Reload</button>\
      </div>\
      <div class="fd-log" id="fd-log"></div>\
    </div>\
    <div class="fd-tab-content" id="fd-tab-add">\
      <div class="fd-token-box" id="fd-token-status">Token: checking...</div>\
      <label>Search Medicine (Code or Name):</label>\
      <input type="text" id="fd-med-search" placeholder="e.g. 100008851 or Methycobal" />\
      <div class="fd-search-results" id="fd-search-results"></div>\
      <div class="fd-selected-med" id="fd-selected-med"></div>\
      <label>Start Date:</label><input type="date" id="fd-add-start" />\
      <div class="fd-calc-box"><div class="fd-calc-title">Auto-Calculate End Date</div>\
        <div class="fd-row"><div><label style="font-size:11px;margin:0 0 2px;">QTY</label><input type="number" id="fd-add-qty" value="1" min="1" /></div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Size</label><input type="number" id="fd-add-size" value="30" min="1" /></div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Days</label><input type="number" id="fd-add-total" readonly style="background:#eee;font-weight:bold;" /></div></div>\
        <div class="fd-calc-result" id="fd-add-calc-result"></div></div>\
      <div class="fd-or-divider">OR set manually</div>\
      <label>End Date:</label><input type="date" id="fd-add-end" />\
      <label>Dose Timing:</label>\
      <button class="fd-dose-btn" id="fd-dose-btn">Click to select dose time...</button>\
      <div class="fd-row" style="margin-top:8px;">\
        <div><label style="font-size:11px;margin:0 0 2px;">Every</label>\
          <select id="fd-add-freq">\
            <option value="720">12 hours</option>\
            <option value="1440" selected>24 hours (daily)</option>\
            <option value="2880">48 hours</option>\
            <option value="4320">72 hours</option>\
            <option value="10080">Weekly</option>\
          </select></div>\
        <div><label style="font-size:11px;margin:0 0 2px;">Notes</label><input type="text" id="fd-add-notes" placeholder="Optional" /></div>\
      </div>\
      <button class="fd-btn fd-btn-green" id="fd-add-btn">Add Treatment</button>\
      <div class="fd-log" id="fd-add-log"></div>\
    </div>';

  document.body.appendChild(panel);

  // INTAKE MODAL
  var modal = document.createElement("div");
  modal.id = "fd-intake-modal";
  modal.innerHTML = '<style>' + modalCss + '</style>\
    <div class="fd-modal-content">\
      <div class="fd-modal-header"><span>Select Dose Time</span><button class="fd-modal-close" id="fd-modal-close">&times;</button></div>\
      <div class="fd-modal-body" id="fd-modal-body"></div>\
      <div class="fd-modal-footer">\
        <button style="background:#ccc;color:#333;" id="fd-modal-cancel">Cancel</button>\
        <button style="background:#1976d2;" id="fd-modal-ok">Confirm</button>\
      </div>\
    </div>';
  document.body.appendChild(modal);

  // Selected intake state
  var selectedIntake = null;
  var selectedDose = 1;

  // TABS
  panel.querySelectorAll(".fd-tab").forEach(function(tab){
    tab.onclick=function(){
      panel.querySelectorAll(".fd-tab").forEach(function(t){t.classList.remove("active");});
      panel.querySelectorAll(".fd-tab-content").forEach(function(c){c.classList.remove("active");});
      tab.classList.add("active");
      document.getElementById("fd-tab-"+tab.getAttribute("data-tab")).classList.add("active");
    };
  });

  document.getElementById("fd-close-btn").onclick=function(){
    document.getElementById("fd-bulk-panel").remove();
    document.getElementById("fd-intake-modal").remove();
    if(window._fd_origFetch){window.fetch=window._fd_origFetch;window._fd_origFetch=null;}
    if(window._fd_origSetHeader){XMLHttpRequest.prototype.setRequestHeader=window._fd_origSetHeader;window._fd_origSetHeader=null;}
  };

  // HELPERS
  function logTo(id,m,c){var e=document.getElementById(id);e.innerHTML+='<div class="'+(c||"info")+'">'+m+"</div>";e.scrollTop=e.scrollHeight;}
  function log(m,c){logTo("fd-log",m,c);}
  function addLog(m,c){logTo("fd-add-log",m,c);}
  function clearLog(id){document.getElementById(id||"fd-log").innerHTML="";}
  function setProgress(p){document.getElementById("fd-progress-bar").style.width=p+"%";}

  function getAuthToken(){
    if(window._fd_capturedToken) return window._fd_capturedToken;
    var storages=[localStorage,sessionStorage];
    for(var si=0;si<storages.length;si++){var store=storages[si];
      for(var j=0;j<store.length;j++){var key=store.key(j);var v=store.getItem(key);
        try{var p=JSON.parse(v);if(p&&typeof p==="object"){if(p.token)return p.token;if(p.access_token)return p.access_token;if(p.data&&p.data.token)return p.data.token;}}
        catch(e){if(v&&v.length>30&&v.length<1000&&/^[A-Za-z0-9._-]+$/.test(v))return v;}}}
    var cookies=document.cookie.split(";");
    for(var ci=0;ci<cookies.length;ci++){var c=cookies[ci].trim();if(c.indexOf("token=")===0||c.indexOf("access_token=")===0)return c.split("=").slice(1).join("=");}
    return null;
  }

  function getIdsFromUrl(){var m=window.location.href.match(/installations\/(\d+)\/centers\/(\d+)\/patients\/(\d+)/);return m?{installationId:m[1],centerId:m[2],patientId:m[3]}:null;}
  function extractDate(o){if(!o)return null;if(typeof o==="string"&&o.length>=10)return o.substring(0,10);if(o.date)return o.date.substring(0,10);return null;}
  function toUTCDate(d,isEnd){var p=d.split("-");var dt=new Date(Date.UTC(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2])));if(isEnd){dt.setUTCDate(dt.getUTCDate()-1);return{date:dt.getUTCFullYear()+"-"+String(dt.getUTCMonth()+1).padStart(2,"0")+"-"+String(dt.getUTCDate()).padStart(2,"0")+" 20:59:59.000000",timezone_type:3,timezone:"UTC"};}else{dt.setUTCDate(dt.getUTCDate()-1);return{date:dt.getUTCFullYear()+"-"+String(dt.getUTCMonth()+1).padStart(2,"0")+"-"+String(dt.getUTCDate()).padStart(2,"0")+" 21:00:00.000000",timezone_type:3,timezone:"UTC"};}}
  function addDays(d,days){var p=d.split("-");var dt=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));dt.setDate(dt.getDate()+days-1);return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");}
  function formatDateDisplay(s){if(!s)return"";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];}

  // INTERCEPT TOKEN
  if(!window._fd_origFetch){window._fd_origFetch=window.fetch;window.fetch=function(){var args=arguments;if(args[1]&&args[1].headers){var h=args[1].headers;var av=null;if(h instanceof Headers)av=h.get("Authorization");else if(typeof h==="object")av=h["Authorization"]||h["authorization"];if(av&&av.indexOf("Bearer")>-1)window._fd_capturedToken=av.replace("Bearer ","");}return window._fd_origFetch.apply(this,args);};}
  if(!window._fd_origSetHeader){window._fd_origSetHeader=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(n,v){if(n.toLowerCase()==="authorization"&&v.indexOf("Bearer")>-1)window._fd_capturedToken=v.replace("Bearer ","");return window._fd_origSetHeader.apply(this,arguments);};}

  var apiFetch=window._fd_origFetch||window.fetch;
  var ids=getIdsFromUrl();
  if(!ids){log("Navigate to patient Treatments page first!","err");return;}
  var API_BASE="https://amcoplusapi.farmadosis.com/api/installations/"+ids.installationId+"/centers/"+ids.centerId+"/patients/"+ids.patientId;
  var API_ROOT="https://amcoplusapi.farmadosis.com/api/installations/"+ids.installationId;
  log("Patient ID: "+ids.patientId,"info");

  function updateTokenStatus(){var token=getAuthToken();var el=document.getElementById("fd-token-status");if(token){el.innerHTML="Token: <span style='color:green'>Found</span> ("+token.substring(0,15)+"...)";el.style.borderColor="#4caf50";}else{el.innerHTML="Token: <span style='color:red'>Not found!</span> Click any link in the app.";el.style.borderColor="#f44336";}}
  setInterval(updateTokenStatus,2000);updateTokenStatus();

  // INTAKES
  async function loadIntakes(){
    var token=getAuthToken();if(!token)return;
    try{var resp=await apiFetch(API_ROOT+"/centers/"+ids.centerId+"/intakes-association",{headers:{Authorization:"Bearer "+token,Accept:"application/json, text/plain, */*"}});
      if(resp.ok){var data=await resp.json();INTAKES=(Array.isArray(data)?data:data.items||data.data||[]).filter(function(i){return i.is_active;}).sort(function(a,b){return(a.hour*60+a.minute)-(b.hour*60+b.minute);});addLog("Loaded "+INTAKES.length+" dose times","ok");}}
    catch(e){addLog("Intakes error: "+e.message,"err");}
  }

  // DOSE TIMING MODAL
  document.getElementById("fd-dose-btn").onclick = function(){
    var body = document.getElementById("fd-modal-body");
    var html = "";
    INTAKES.forEach(function(intake){
      var ts = String(intake.hour).padStart(2,"0")+":"+String(intake.minute).padStart(2,"0");
      var checked = (selectedIntake && selectedIntake.id === intake.id) ? "checked" : "";
      var selectedClass = checked ? " selected" : "";
      html += '<div class="fd-intake-row'+selectedClass+'" data-id="'+intake.id+'">' +
        '<input type="radio" name="fd-intake-radio" value="'+intake.id+'" '+checked+' data-hour="'+intake.hour+'" data-minute="'+intake.minute+'" data-name="'+intake.name+'" />' +
        '<span class="fd-itime">'+ts+'</span>' +
        '<span class="fd-iname">'+intake.name+'</span>' +
        '<div class="fd-idose-wrap">Dose: <input type="number" class="fd-idose" value="'+(selectedDose||1)+'" min="0.25" step="0.25" /></div>' +
        '</div>';
    });
    body.innerHTML = html;
    document.getElementById("fd-intake-modal").style.display = "block";

    // Click on row to select
    body.querySelectorAll(".fd-intake-row").forEach(function(row){
      row.onclick = function(e){
        if(e.target.type === "number") return; // don't trigger on dose input click
        body.querySelectorAll(".fd-intake-row").forEach(function(r){r.classList.remove("selected");});
        this.classList.add("selected");
        this.querySelector("input[type=radio]").checked = true;
      };
    });
  };

  document.getElementById("fd-modal-close").onclick = function(){document.getElementById("fd-intake-modal").style.display="none";};
  document.getElementById("fd-modal-cancel").onclick = function(){document.getElementById("fd-intake-modal").style.display="none";};

  document.getElementById("fd-modal-ok").onclick = function(){
    var selected = document.querySelector('#fd-modal-body input[type=radio]:checked');
    if(!selected){addLog("Select a dose time!","err");return;}
    var row = selected.closest(".fd-intake-row");
    var doseVal = parseFloat(row.querySelector(".fd-idose").value) || 1;
    selectedIntake = {
      id: parseInt(selected.value),
      hour: parseInt(selected.getAttribute("data-hour")),
      minute: parseInt(selected.getAttribute("data-minute")),
      name: selected.getAttribute("data-name")
    };
    selectedDose = doseVal;
    var ts = String(selectedIntake.hour).padStart(2,"0")+":"+String(selectedIntake.minute).padStart(2,"0");
    document.getElementById("fd-dose-btn").innerHTML = '<span style="color:#2e7d32;">&#10003;</span> ' + ts + ' — ' + selectedIntake.name + ' (Dose: ' + selectedDose + ')';
    document.getElementById("fd-intake-modal").style.display = "none";
  };

  // AUTO-CALC
  function recalcEndDate(){var s=document.getElementById("fd-start-date").value,q=parseInt(document.getElementById("fd-qty").value)||0,sz=parseInt(document.getElementById("fd-size").value)||0,t=q*sz;document.getElementById("fd-total-days").value=t>0?t:"";var r=document.getElementById("fd-calc-result");if(s&&t>0){var e=addDays(s,t);document.getElementById("fd-end-date").value=e;r.style.display="block";r.innerHTML="End: "+formatDateDisplay(e)+" ("+t+" days)";}else{r.style.display="none";}}
  function recalcAddEndDate(){var s=document.getElementById("fd-add-start").value,q=parseInt(document.getElementById("fd-add-qty").value)||0,sz=parseInt(document.getElementById("fd-add-size").value)||0,t=q*sz;document.getElementById("fd-add-total").value=t>0?t:"";var r=document.getElementById("fd-add-calc-result");if(s&&t>0){var e=addDays(s,t);document.getElementById("fd-add-end").value=e;r.style.display="block";r.innerHTML="End: "+formatDateDisplay(e)+" ("+t+" days)";}else{r.style.display="none";}}
  document.getElementById("fd-start-date").addEventListener("change",recalcEndDate);
  document.getElementById("fd-qty").addEventListener("input",recalcEndDate);
  document.getElementById("fd-size").addEventListener("input",recalcEndDate);
  document.getElementById("fd-add-start").addEventListener("change",recalcAddEndDate);
  document.getElementById("fd-add-qty").addEventListener("input",recalcAddEndDate);
  document.getElementById("fd-add-size").addEventListener("input",recalcAddEndDate);
  var today=new Date();document.getElementById("fd-add-start").value=today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");

  // MEDICINE SEARCH
  var searchTimeout=null;var selectedMedicine=null;
  document.getElementById("fd-med-search").addEventListener("input",function(){var q=this.value.trim();if(q.length<3){document.getElementById("fd-search-results").style.display="none";return;}clearTimeout(searchTimeout);searchTimeout=setTimeout(function(){searchMedicine(q);},500);});

  async function searchMedicine(query){
    var token=getAuthToken();if(!token){addLog("Token not found!","err");return;}
    clearLog("fd-add-log");addLog("Searching: "+query,"info");
    var url=API_ROOT+"/medicines/search?query="+encodeURIComponent(query)+"&with_count=false";
    try{
      var resp=await apiFetch(url,{method:"GET",headers:{"Authorization":"Bearer "+token,"Accept":"application/json, text/plain, */*"}});
      addLog("Status: "+resp.status,"info");
      if(resp.ok){
        var data=await resp.json();
        var results=Array.isArray(data)?data:(data.items||data.data||[]);
        addLog("Results: "+results.length,"info");
        var resultsEl=document.getElementById("fd-search-results");
        if(results.length===0){resultsEl.innerHTML='<div style="padding:10px;color:#999;text-align:center;">No results</div>';resultsEl.style.display="block";return;}
        var html="";
        results.slice(0,20).forEach(function(med){
          var medData={id:med.id,code:med.code,name:med.name,pills_per_pack:med.pills_per_pack||1,medicine_id:med.medicine_id||med.id,imported_medicine_id:med.id};
          if(med.medicine&&med.medicine.id){medData.medicine_id=med.medicine.id;medData.imported_medicine_id=med.id;}
          html+='<div class="fd-search-item" data-med=\''+JSON.stringify(medData).replace(/'/g,"&#39;")+'\'><strong>'+(med.code||"")+'</strong> - '+med.name+'</div>';
        });
        resultsEl.innerHTML=html;resultsEl.style.display="block";
        resultsEl.querySelectorAll(".fd-search-item").forEach(function(item){
          item.onclick=function(){
            selectedMedicine=JSON.parse(this.getAttribute("data-med"));
            document.getElementById("fd-selected-med").style.display="block";
            document.getElementById("fd-selected-med").innerHTML="Selected: <strong>"+selectedMedicine.code+"</strong> - "+selectedMedicine.name;
            document.getElementById("fd-search-results").style.display="none";
            document.getElementById("fd-med-search").value=selectedMedicine.code+" - "+selectedMedicine.name;
            if(selectedMedicine.pills_per_pack>1){document.getElementById("fd-add-size").value=selectedMedicine.pills_per_pack;recalcAddEndDate();}
            addLog("Selected: "+selectedMedicine.code+" (med:"+selectedMedicine.medicine_id+")","ok");
          };
        });
      }else{var errText=await resp.text();addLog("Error: "+resp.status+" "+errText.substring(0,200),"err");}
    }catch(err){addLog("Error: "+err.message,"err");}
  }

  // LOAD TREATMENTS
  async function loadTreatments(){clearLog("fd-log");log("Loading...","info");var token=getAuthToken();if(!token){log("Token not found.","err");return false;}
    try{var resp=await apiFetch(API_BASE+"/treatments",{headers:{Authorization:"Bearer "+token,Accept:"application/json, text/plain, */*"}});if(!resp.ok){log("Failed: "+resp.status,"err");return false;}
      var data=await resp.json();window._fd_allTreatments=Array.isArray(data)?data:(data.items||data.data||data.treatments||[]);log("Found "+window._fd_allTreatments.length,"ok");renderList();return true;
    }catch(err){log("Error: "+err.message,"err");return false;}}

  function renderList(){
    var ao=document.getElementById("fd-filter-active").checked;var list=window._fd_allTreatments||[];
    var filtered=list.filter(function(t){return ao?t.is_active!==false:true;});window._fd_treatments=filtered;
    var el=document.getElementById("fd-treat-list");el.innerHTML="";
    var html='<label><input type="checkbox" id="fd-select-all" checked /> <b>Select All ('+filtered.length+')</b></label>';
    filtered.forEach(function(t,i){var n=(t.medicine?t.medicine.name:t.medicine_code)||"?";var sd=extractDate(t.starts_at)||extractDate(t.starts_at_8601)||"-";var ed=extractDate(t.ends_at)||extractDate(t.ends_at_8601)||"-";
      html+='<div class="fd-treat-item"><input type="checkbox" class="fd-treat-cb" data-index="'+i+'" checked /><div><strong style="font-size:12px;">'+n+'</strong><br/><span class="fd-tid">ID:'+t.id+'</span><br/><span class="fd-dates">'+sd+' &rarr; '+ed+'</span></div></div>';});
    el.innerHTML=html;document.getElementById("fd-date-section").style.display="block";document.getElementById("fd-filter-section").style.display="block";document.getElementById("fd-refresh-btn").style.display="none";
    log("Showing "+filtered.length,"info");
    document.getElementById("fd-select-all").onchange=function(){var cbs=document.querySelectorAll(".fd-treat-cb");for(var c=0;c<cbs.length;c++)cbs[c].checked=this.checked;};
  }
  document.getElementById("fd-filter-active").onchange=function(){renderList();};
  document.getElementById("fd-load-btn").onclick=async function(){this.disabled=true;await loadTreatments();this.disabled=false;};
  document.getElementById("fd-refresh-btn").onclick=async function(){this.disabled=true;await loadTreatments();this.disabled=false;};

  // UPDATE
  document.getElementById("fd-update-btn").onclick=async function(){
    var ns=document.getElementById("fd-start-date").value,ne=document.getElementById("fd-end-date").value;
    if(!ns||!ne){log("Set both dates!","err");return;}var token=getAuthToken();if(!token){log("Token!","err");return;}
    var sel=document.querySelectorAll(".fd-treat-cb:checked");if(sel.length===0){log("None selected","err");return;}
    this.disabled=true;document.getElementById("fd-load-btn").disabled=true;document.getElementById("fd-progress-wrap").style.display="block";
    clearLog("fd-log");log("Updating "+sel.length+"...","info");var ok=0,fail=0,tot=sel.length;
    for(var s=0;s<sel.length;s++){
      var idx=parseInt(sel[s].getAttribute("data-index")),t=window._fd_treatments[idx],tn=(t.medicine?t.medicine.name:t.medicine_code)||"?";
      setProgress(Math.round(((s+1)/tot)*100));
      try{var gr=await apiFetch(API_BASE+"/treatments/"+t.id,{headers:{Authorization:"Bearer "+token,Accept:"application/json, text/plain, */*"}});
        if(!gr.ok){log("["+tn+"] Load fail","err");fail++;continue;}var fd=await gr.json();
        fd.starts_at=ns;fd.ends_at=ne;fd.starts_at_8601=toUTCDate(ns,false);fd.ends_at_8601=toUTCDate(ne,true);
        var sp=ns.split("-"),sdd=new Date(Date.UTC(parseInt(sp[0]),parseInt(sp[1])-1,parseInt(sp[2])));sdd.setUTCDate(sdd.getUTCDate()-1);sdd.setUTCHours(21,0,0,0);fd.startsAtLocal=sdd.toISOString();
        var pr=await apiFetch(API_BASE+"/treatments/"+t.id+"/update",{method:"PUT",headers:{Authorization:"Bearer "+token,Accept:"application/json, text/plain, */*","Content-Type":"application/json"},body:JSON.stringify(fd)});
        if(pr.ok){log("("+(s+1)+"/"+tot+") ["+tn+"] Done","ok");ok++;}else{log("["+tn+"] Error "+pr.status,"err");fail++;}
      }catch(e){log("["+tn+"] "+e.message,"err");fail++;}
      await new Promise(function(r){setTimeout(r,300);});
    }
    log("===== DONE: "+ok+" ok, "+fail+" failed =====",ok>0?"ok":"err");
    this.disabled=false;document.getElementById("fd-load-btn").disabled=false;document.getElementById("fd-progress-wrap").style.display="none";document.getElementById("fd-refresh-btn").style.display="block";
  };

  // ADD TREATMENT
  document.getElementById("fd-add-btn").onclick=async function(){
    clearLog("fd-add-log");
    if(!selectedMedicine){addLog("Select a medicine first!","err");return;}
    var startDate=document.getElementById("fd-add-start").value,endDate=document.getElementById("fd-add-end").value;
    if(!startDate||!endDate){addLog("Set both dates!","err");return;}
    var token=getAuthToken();if(!token){addLog("Token!","err");return;}
    if(!selectedIntake){addLog("Select a dose time!","err");return;}

    var freqMinutes=parseInt(document.getElementById("fd-add-freq").value)||1440;
    var notes=document.getElementById("fd-add-notes").value||"";
    var hour=selectedIntake.hour,minute=selectedIntake.minute;
    var firstTake=startDate+" "+String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0");

    var configs=[{first_take:firstTake,firstTake8601:"",dose:selectedDose,days_to_take:null,range_to_take:null,minutes_interval:freqMinutes,days_in_months:null,month_ids:[]}];
    var medId=selectedMedicine.medicine_id||selectedMedicine.id;
    var impId=selectedMedicine.imported_medicine_id||selectedMedicine.id;

    var td={medicine_code:selectedMedicine.code,medicine_id:medId,imported_medicine_id:impId,patient_id:parseInt(ids.patientId),treatment_plan_id:3,starts_at:startDate,ends_at:endDate,starts_at_8601:toUTCDate(startDate,false),ends_at_8601:toUTCDate(endDate,true),emblist_it:true,emblist_it_real:true,is_active:true,is_if_needed_treatment:false,is_replaceable:false,is_sintrom:false,emblist_in_unique_bag:false,force_medicine_code_in_production:false,notes:notes,doctor_id:null,administration_route_id:null,external_id:null,medicine_family_id:null,previous_treatment_id:null,configs:configs,treatment_configs:[{first_take_8601:{date:startDate+" "+String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0")+":00.000000",timezone_type:3,timezone:"UTC"},days_to_take:null,minutes_interval:freqMinutes,range_to_take:null,dose:selectedDose,days_in_months:null,month_ids:[],hour:hour,minute:minute,weekday:1}]};
    var sp2=startDate.split("-"),sd2=new Date(Date.UTC(parseInt(sp2[0]),parseInt(sp2[1])-1,parseInt(sp2[2])));sd2.setUTCDate(sd2.getUTCDate()-1);sd2.setUTCHours(21,0,0,0);td.startsAtLocal=sd2.toISOString();

    this.disabled=true;addLog("Creating...","info");
    try{
      var resp=await apiFetch(API_BASE+"/treatments/create",{method:"POST",headers:{Authorization:"Bearer "+token,Accept:"application/json, text/plain, */*","Content-Type":"application/json"},body:JSON.stringify(td)});
      var rt=await resp.text();
      if(resp.ok){
        addLog("Treatment created!","ok");
        try{var res=JSON.parse(rt);addLog("ID: "+(res.id||"OK"),"ok");}catch(e){}
        selectedMedicine=null;selectedIntake=null;selectedDose=1;
        document.getElementById("fd-selected-med").style.display="none";
        document.getElementById("fd-med-search").value="";
        document.getElementById("fd-dose-btn").innerHTML="Click to select dose time...";
      }else{addLog("Error "+resp.status+": "+rt.substring(0,300),"err");}
    }catch(err){addLog("Error: "+err.message,"err");}
    this.disabled=false;
  };

  // INIT
  loadIntakes();
  log("Ready!","ok");addLog("Search for a medicine.","info");
})();

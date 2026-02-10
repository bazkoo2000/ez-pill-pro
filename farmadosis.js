javascript
    (function(){
const VERSION='129.5',APP_NAME='⚡ EZ Pill Pro AI';
const FIXED_CODES={'100015980':24,'100015955':24,'100015971':24,'102988654':48,'100013423':10,'100013562':20,'101826688':20,'101284170':30,'103243857':30,'101859640':20,'100726280':24,'100011436':20,'100030493':40,'100011743':30,'103169239':20,'100684294':30,'100009934':48,'100014565':6,'100017942':20,'100633972':20,'100634019':20,'100009926':24,'102371620':24,'100015947':24,'100010652':30,'103437918':30,'103683617':30,'100023592':30,'100023875':20,'100013431':15,'100027201':20,'100016106':10,'100010097':20,'100013167':20};
const WEEKLY_INJECT=['102785890','101133232','101943745','101049031','101528656'];
const AI_MODEL={
    dosePatterns:[
        {regex:/صباح\s*و\s*مساء|morning\s*and\s*evening|صباحاً\s*و\s*مساءاً/i,freq:2,times:['09:30','21:30']},
        {regex:/قبل\s*الاكل\s*مرتين|before\s*meal\s*twice/i,freq:2,times:['08:00','20:00']},
        {regex:/بعد\s*الافطار\s*و\s*العشاء|after\s*breakfast\s*and\s*dinner/i,freq:2,times:['09:00','21:00']},
        {regex:/ثلاث\s*مرات|three\s*times|3\s*مرات/i,freq:3,times:['08:00','14:00','20:00']},
        {regex:/كل\s*8\s*ساعات|every\s*8\s*hours|q8h/i,freq:3,interval:8},
        {regex:/كل\s*6\s*ساعات|every\s*6\s*hours|q6h/i,freq:4,interval:6},
        {regex:/كل\s*12\s*ساعة|every\s*12\s*hours|q12h/i,freq:2,interval:12},
        {regex:/يوم\s*بعد\s*يوم|every\s*other\s*day/i,freq:0.5,special:'48h'}
    ],
    timeExtract(text){
        text=text.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه');
        const times=[
            {key:'فجر',time:'05:00'},{key:'空腹|ريق',time:'07:00'},
            {key:'قبل.*فطور|before.*breakfast',time:'08:00'},{key:'بعد.*فطور|after.*breakfast',time:'09:00'},
            {key:'صباح|morning',time:'09:30'},{key:'ظهر|noon',time:'12:00'},
            {key:'قبل.*غداء|before.*lunch',time:'13:00'},{key:'بعد.*غداء|after.*lunch',time:'14:00'},
            {key:'عصر|afternoon',time:'15:00'},{key:'مغرب|maghrib',time:'18:00'},
            {key:'قبل.*عشاء|before.*dinner',time:'20:00'},{key:'بعد.*عشاء|after.*dinner',time:'21:00'},
            {key:'مساء|evening',time:'21:30'},{key:'نوم|bed|sleep',time:'22:00'}
        ];
        for(let t of times){if(new RegExp(t.key).test(text))return t.time;}
        return'09:00';
    },
    durationExtract(text){
        text=text.toLowerCase();
        const patterns=[
            {regex:/لمدة?\s*(\d+)\s*يوم|for\s*(\d+)\s*days/,grp:1},
            {regex:/اسبوع\s*واحد|one\s*week/,days:7},
            {regex:/اسبوعين|two\s*weeks/,days:14},
            {regex:/شهر\s*واحد|one\s*month/,days:30},
            {regex:/شهرين|two\s*months/,days:60},
            {regex:/حتى\s*النهايه|until\s*finish/,special:'until'},
            {regex:/عند\s*الحاجه|prn|as\s*needed/,special:'prn'}
        ];
        for(let p of patterns){
            if(p.days)return{hasDuration:true,days:p.days};
            let m=text.match(p.regex);
            if(m&&m[p.grp])return{hasDuration:true,days:parseInt(m[p.grp])};
            if(p.special)return{p[p.special]:true};
        }
        return{hasDuration:false};
    },
    analyzeDose(note,itemName=''){
        note=(note||'').toLowerCase().replace(/[أإآ]/g,'ا');
        let result={count:1,times:[],intervals:[],isComplex:false,confidence:0.8};
        
        for(let pattern of this.dosePatterns){
            if(pattern.regex.test(note)){
                result.count=pattern.freq;
                if(pattern.times)result.times=pattern.times;
                if(pattern.interval)result.intervals=[pattern.interval];
                if(pattern.special)result.special=pattern.special;
                result.confidence=0.95;
                break;
            }
        }
        
        if(result.count===1){
            const keywords=[
                {keys:['صباح','morning'],time:'09:30'},
                {keys:['ظهر','noon'],time:'12:00'},
                {keys:['عصر','afternoon'],time:'15:00'},
                {keys:['مساء','evening'],time:'21:30'},
                {keys:['فطور','breakfast'],time:'09:00'},
                {keys:['غداء','lunch'],time:'14:00'},
                {keys:['عشاء','dinner'],time:'21:00'}
            ];
            let foundTimes=[];
            for(let k of keywords){
                for(let key of k.keys){if(note.includes(key)){foundTimes.push(k.time);break;}}
            }
            if(foundTimes.length>0){
                result.count=foundTimes.length;
                result.times=foundTimes;
                result.confidence=0.85;
            }
        }
        
        if(itemName&&/2\s*(قرص|حبة|tablet|pill)/i.test(itemName+' '+note)){
            result.doubleDose=true;
            result.confidence=Math.max(result.confidence,0.9);
        }
        
        return result;
    }
};
class SmartToast{
    static show(msg,type='info',duration=3000){
        const colors={
            success:'#10b981',error:'#ef4444',
            info:'#3b82f6',warning:'#f59e0b',
            ai:'#8b5cf6'
        };
        const icons={
            success:'✅',error:'❌',info:'ℹ️',
            warning:'⚠️',ai:'🤖'
        };
        const toast=document.createElement('div');
        toast.className='ez-smart-toast';
        toast.innerHTML=`
            <div class="toast-icon">${icons[type]||icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${type==='ai'?'ذكاء اصطناعي':type==='success'?'نجاح':type==='error'?'خطأ':type==='warning'?'تنبيه':'معلومة'}</div>
                <div class="toast-message">${msg}</div>
            </div>
            <div class="toast-progress"></div>
        `;
        toast.style.cssText=`
            position:fixed;bottom:30px;right:30px;background:#fff;
            border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);
            padding:16px;min-width:300px;max-width:400px;z-index:1000000;
            border-left:4px solid ${colors[type]||colors.info};
            transform:translateX(400px);opacity:0;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
            font-family:'Segoe UI','Cairo',sans-serif;
        `;
        document.body.appendChild(toast);
        setTimeout(()=>toast.style.transform='translateX(0)',10);
        setTimeout(()=>toast.style.opacity=1,50);
        const progress=toast.querySelector('.toast-progress');
        progress.style.cssText=`
            position:absolute;bottom:0;left:0;height:3px;
            background:${colors[type]||colors.info};width:100%;
            border-radius:0 0 12px 12px;transform:scaleX(1);
            transform-origin:left;transition:transform ${duration}ms linear;
        `;
        setTimeout(()=>progress.style.transform='scaleX(0)');
        setTimeout(()=>{
            toast.style.transform='translateX(400px)';
            toast.style.opacity='0';
            setTimeout(()=>toast.remove(),400);
        },duration);
    }
}
class AIDialog{
    constructor(){
        this.dialog=null;
        this.options={
            months:1,days:30,aiMode:true,autoDuration:true,
            showWarnings:true,advancedMode:false,
            theme:'light',language:'auto'
        };
        this.styles=`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            .ez-ai-dialog{
                position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:2px;
                border-radius:20px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);
                z-index:999999;font-family:'Inter','Segoe UI',sans-serif;
                min-width:420px;max-width:500px;
            }
            .ez-dialog-content{
                background:#fff;border-radius:18px;padding:0;overflow:hidden;
            }
            .dialog-header{
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                padding:24px 28px;color:white;position:relative;
            }
            .header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
            .app-title{font-size:24px;font-weight:700;display:flex;align-items:center;gap:10px;}
            .app-icon{font-size:28px;}
            .app-version{font-size:11px;background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:20px;}
            .header-subtitle{font-size:14px;opacity:0.9;margin-top:8px;}
            .dialog-body{padding:28px;}
            .section-title{font-size:13px;font-weight:600;color:#4b5563;margin-bottom:16px;
                text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px;}
            .pill-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;}
            .smart-pill{
                background:#f8fafc;border:2px solid #e5e7eb;border-radius:12px;
                padding:18px 10px;text-align:center;cursor:pointer;transition:all 0.3s;
                position:relative;overflow:hidden;
            }
            .smart-pill:hover{transform:translateY(-3px);border-color:#3b82f6;box-shadow:0 10px 20px rgba(59,130,246,0.1);}
            .smart-pill.selected{
                background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;
                border-color:#3b82f6;box-shadow:0 10px 20px rgba(59,130,246,0.2);
            }
            .pill-value{font-size:20px;font-weight:700;margin-bottom:4px;}
            .pill-label{font-size:11px;opacity:0.8;}
            .ai-badge{
                position:absolute;top:8px;right:8px;background:#8b5cf6;
                color:white;padding:2px 8px;border-radius:10px;font-size:10px;
                font-weight:600;
            }
            .options-grid{display:grid;gap:12px;margin:24px 0;}
            .smart-option{
                background:#f8fafc;border:2px solid #e5e7eb;border-radius:12px;
                padding:16px;cursor:pointer;transition:all 0.3s;display:flex;
                align-items:center;gap:12px;
            }
            .smart-option:hover{border-color:#3b82f6;background:#eff6ff;}
            .option-icon{font-size:20px;width:40px;height:40px;display:flex;
                align-items:center;justify-content:center;background:#e0e7ff;
                border-radius:10px;color:#3b82f6;}
            .option-content{flex:1;}
            .option-title{font-weight:600;margin-bottom:4px;}
            .option-desc{font-size:12px;color:#6b7280;}
            .option-toggle{position:relative;}
            .toggle-switch{width:44px;height:24px;background:#d1d5db;
                border-radius:12px;position:relative;transition:all 0.3s;}
            .toggle-switch::after{
                content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;
                background:white;border-radius:50%;transition:all 0.3s;
            }
            .smart-option.active .toggle-switch{background:#10b981;}
            .smart-option.active .toggle-switch::after{transform:translateX(20px);}
            .action-buttons{display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-top:28px;}
            .btn-primary,.btn-secondary{
                padding:16px 24px;border:none;border-radius:12px;font-weight:600;
                cursor:pointer;transition:all 0.3s;font-size:14px;display:flex;
                align-items:center;justify-content:center;gap:8px;
            }
            .btn-primary{
                background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;
                box-shadow:0 4px 12px rgba(59,130,246,0.3);
            }
            .btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(59,130,246,0.4);}
            .btn-secondary{
                background:#f3f4f6;color:#4b5563;border:2px solid #e5e7eb;
            }
            .btn-secondary:hover{background:#e5e7eb;}
            .dialog-footer{
                padding:20px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;
                text-align:center;font-size:11px;color:#6b7280;
            }
            .ez-ai-toast{position:fixed;bottom:30px;right:30px;background:#fff;
                border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);padding:16px;
                min-width:300px;max-width:400px;z-index:1000000;border-left:4px solid #8b5cf6;
                transform:translateX(400px);opacity:0;transition:all 0.4s;
                font-family:'Inter','Segoe UI',sans-serif;
            }
        `;
    }
    show(){
        if(document.getElementById('ez-ai-dialog'))return;
        this.loadStyles();
        this.createDialog();
        this.makeDraggable();
        this.setupEvents();
    }
    loadStyles(){
        const style=document.createElement('style');
        style.textContent=this.styles;
        document.head.appendChild(style);
    }
    createDialog(){
        this.dialog=document.createElement('div');
        this.dialog.id='ez-ai-dialog';
        this.dialog.className='ez-ai-dialog';
        this.dialog.innerHTML=this.getDialogHTML();
        document.body.appendChild(this.dialog);
    }
    getDialogHTML(){
        return`
        <div class="ez-dialog-content">
            <div class="dialog-header drag-handle">
                <div class="header-top">
                    <div class="app-title">
                        <span class="app-icon">⚡</span>
                        ${APP_NAME}
                    </div>
                    <div class="app-version">v${VERSION}</div>
                </div>
                <div class="header-subtitle">معالج وصفات طبية ذكي - نظام الذكاء الاصطناعي المتقدم</div>
            </div>
            <div class="dialog-body">
                <div class="section-title">
                    <span>📅</span>
                    فترة العلاج
                </div>
                <div class="pill-grid">
                    ${[1,2,3].map(m=>`
                        <div class="smart-pill ${m===this.options.months?'selected':''}" data-type="month" data-value="${m}">
                            ${m===3?`<span class="ai-badge">AI</span>`:''}
                            <div class="pill-value">${m}</div>
                            <div class="pill-label">${m===1?'شهر':m===2?'شهران':m===3?'ثلاثة أشهر':''}</div>
                        </div>
                    `).join('')}
                    ${[28,30].map(d=>`
                        <div class="smart-pill ${d===this.options.days?'selected':''}" data-type="day" data-value="${d}">
                            <div class="pill-value">${d}</div>
                            <div class="pill-label">يوم في الشهر</div>
                        </div>
                    `).join('')}
                </div>
                <div class="section-title">
                    <span>⚙️</span>
                    إعدادات ذكية
                </div>
                <div class="options-grid">
                    <div class="smart-option ${this.options.aiMode?'active':''}" data-option="aiMode">
                        <div class="option-icon">🤖</div>
                        <div class="option-content">
                            <div class="option-title">الذكاء الاصطناعي</div>
                            <div class="option-desc">تحليل ذكي للجرعات والتوقيتات</div>
                        </div>
                        <div class="option-toggle">
                            <div class="toggle-switch"></div>
                        </div>
                    </div>
                    <div class="smart-option ${this.options.autoDuration?'active':''}" data-option="autoDuration">
                        <div class="option-icon">⏱️</div>
                        <div class="option-content">
                            <div class="option-title">استخراج المدة</div>
                            <div class="option-desc">التعرف التلقائي على مدة العلاج</div>
                        </div>
                        <div class="option-toggle">
                            <div class="toggle-switch"></div>
                        </div>
                    </div>
                    <div class="smart-option ${this.options.showWarnings?'active':''}" data-option="showWarnings">
                        <div class="option-icon">⚠️</div>
                        <div class="option-content">
                            <div class="option-title">التحذيرات الذكية</div>
                            <div class="option-desc">تنبيهات ذكية للمخاطر المحتملة</div>
                        </div>
                        <div class="option-toggle">
                            <div class="toggle-switch"></div>
                        </div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn-primary" id="ai-process-btn">
                        <span>🚀</span>
                        بدء المعالجة الذكية
                    </button>
                    <button class="btn-secondary" id="close-dialog-btn">
                        <span>✕</span>
                        إغلاق
                    </button>
                </div>
            </div>
            <div class="dialog-footer">
                نظام معالجة الوصفات الطبية المتقدم | إصدار ${VERSION}
            </div>
        </div>
        `;
    }
    makeDraggable(){
        const header=this.dialog.querySelector('.drag-handle');
        let pos1=0,pos2=0,pos3=0,pos4=0;
        header.onmousedown=dragMouseDown;
        function dragMouseDown(e){
            e=e||window.event;
            e.preventDefault();
            pos3=e.clientX;
            pos4=e.clientY;
            document.onmouseup=closeDragElement;
            document.onmousemove=elementDrag;
        }
        function elementDrag(e){
            e=e||window.event;
            e.preventDefault();
            pos1=pos3-e.clientX;
            pos2=pos4-e.clientY;
            pos3=e.clientX;
            pos4=e.clientY;
            const dialog=document.getElementById('ez-ai-dialog');
            dialog.style.top=(dialog.offsetTop-pos2)+"px";
            dialog.style.left=(dialog.offsetLeft-pos1)+"px";
        }
        function closeDragElement(){
            document.onmouseup=null;
            document.onmousemove=null;
        }
    }
    setupEvents(){
        this.dialog.querySelectorAll('.smart-pill').forEach(pill=>{
            pill.addEventListener('click',(e)=>{
                const type=e.currentTarget.dataset.type;
                const value=parseInt(e.currentTarget.dataset.value);
                if(type==='month')this.options.months=value;
                if(type==='day')this.options.days=value;
                this.updateSelection();
            });
        });
        this.dialog.querySelectorAll('.smart-option').forEach(opt=>{
            opt.addEventListener('click',(e)=>{
                const option=e.currentTarget.dataset.option;
                this.options[option]=!this.options[option];
                e.currentTarget.classList.toggle('active');
                SmartToast.show(`تم ${this.options[option]?'تفعيل':'تعطيل'} ${option==='aiMode'?'الذكاء الاصطناعي':option==='autoDuration'?'استخراج المدة':'التحذيرات'}`,this.options[option]?'success':'info',2000);
            });
        });
        document.getElementById('ai-process-btn').addEventListener('click',()=>{
            this.dialog.style.transform='translate(-50%,-50%) scale(0.9)';
            this.dialog.style.opacity='0';
            setTimeout(()=>{
                this.dialog.remove();
                SmartToast.show('جاري تحليل الوصفات باستخدام الذكاء الاصطناعي...','ai',2000);
                setTimeout(()=>Processor.start(this.options),1000);
            },300);
        });
        document.getElementById('close-dialog-btn').addEventListener('click',()=>{
            this.dialog.style.transform='translate(-50%,-50%) scale(0.9)';
            this.dialog.style.opacity='0';
            setTimeout(()=>this.dialog.remove(),300);
        });
    }
    updateSelection(){
        this.dialog.querySelectorAll('.smart-pill').forEach(pill=>{
            const type=pill.dataset.type;
            const value=parseInt(pill.dataset.value);
            const isSelected=type==='month'?value===this.options.months:value===this.options.days;
            pill.classList.toggle('selected',isSelected);
        });
    }
}
class SmartWarnings{
    static show(warnings,callback){
        if(!warnings||warnings.length===0){if(callback)callback();return;}
        const overlay=document.createElement('div');
        overlay.id='smart-warnings-overlay';
        overlay.style.cssText=`
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:linear-gradient(135deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.9) 100%);
            backdrop-filter:blur(10px);z-index:1000000;
            display:flex;align-items:center;justify-content:center;
            padding:20px;
        `;
        let warningHTML='';
        warnings.forEach((w,i)=>{
            const icons={high:'🔴',medium:'🟡',low:'🟢',info:'ℹ️'};
            const colors={high:'#ef4444',medium:'#f59e0b',low:'#10b981',info:'#3b82f6'};
            warningHTML+=`
                <div class="smart-warning-item" style="
                    background:linear-gradient(135deg,#fff 0%,#f8fafc 100%);
                    border-radius:16px;padding:20px;margin-bottom:16px;
                    border-left:4px solid ${colors[w.level]||colors.info};
                    box-shadow:0 10px 25px rgba(0,0,0,0.1);
                    transform:translateX(${i%2===0?'-20':'20'}px);
                    opacity:0;animation:slideIn 0.4s forwards ${i*0.1}s;
                ">
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                        <div style="font-size:24px;">${icons[w.level]||icons.info}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700;color:#1f2937;margin-bottom:8px;">
                                ${w.title||'تحذير'}
                            </div>
                            <div style="color:#4b5563;font-size:14px;line-height:1.5;">
                                ${w.message}
                            </div>
                            ${w.suggestion?`
                                <div style="margin-top:12px;padding:12px;background:#f0f9ff;
                                    border-radius:8px;border:1px solid #bae6fd;">
                                    <div style="font-weight:600;color:#0369a1;margin-bottom:4px;">
                                        💡 اقتراح ذكي
                                    </div>
                                    <div style="color:#0c4a6e;font-size:13px;">
                                        ${w.suggestion}
                                    </div>
                                </div>
                            `:''}
                            ${w.editable?`
                                <div style="margin-top:16px;">
                                    <div style="font-weight:600;color:#374151;margin-bottom:8px;font-size:13px;">
                                        ${w.editLabel}:
                                    </div>
                                    <input type="number" id="smart-edit-${i}" 
                                        value="${w.currentValue}" min="${w.minValue}" max="${w.maxValue}"
                                        style="width:100%;padding:10px 14px;border:2px solid #e5e7eb;
                                        border-radius:8px;font-size:14px;font-weight:600;
                                        transition:all 0.3s;" 
                                        onfocus="this.style.borderColor='#3b82f6';this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'"
                                        onblur="this.style.borderColor='#e5e7eb';this.style.boxShadow='none'">
                                </div>
                            `:''}
                        </div>
                    </div>
                </div>
            `;
        });
        overlay.innerHTML=`
            <style>
                @keyframes slideIn{to{transform:translateX(0);opacity:1;}}
                @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
                .smart-warnings-container{
                    background:#fff;border-radius:20px;max-width:600px;
                    max-height:80vh;overflow-y:auto;padding:32px;
                    animation:fadeIn 0.3s;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .smart-warnings-header{
                    text-align:center;margin-bottom:32px;
                }
                .warnings-title{
                    font-size:28px;font-weight:800;color:#1f2937;
                    margin-bottom:12px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                }
                .warnings-subtitle{
                    color:#6b7280;font-size:14px;
                }
                .smart-warnings-actions{
                    display:grid;grid-template-columns:1fr 1fr;gap:12px;
                    margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;
                }
                .smart-warning-btn{
                    padding:14px 24px;border:none;border-radius:12px;
                    font-weight:600;cursor:pointer;transition:all 0.3s;
                    font-size:14px;display:flex;align-items:center;
                    justify-content:center;gap:8px;
                }
                .btn-accept{
                    background:linear-gradient(135deg,#10b981,#059669);
                    color:white;box-shadow:0 4px 12px rgba(16,185,129,0.3);
                }
                .btn-accept:hover{
                    transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,0.4);
                }
                .btn-cancel{
                    background:#f3f4f6;color:#4b5563;border:2px solid #e5e7eb;
                }
                .btn-cancel:hover{background:#e5e7eb;}
            </style>
            <div class="smart-warnings-container">
                <div class="smart-warnings-header">
                    <div class="warnings-title">🔍 التحليل الذكي</div>
                    <div class="warnings-subtitle">اكتشفنا ${warnings.length} حالة تحتاج لمراجعتك</div>
                </div>
                <div class="smart-warnings-list">
                    ${warningHTML}
                </div>
                <div class="smart-warnings-actions">
                    <button class="smart-warning-btn btn-accept" onclick="window.smartAcceptWarnings()">
                        <span>✅</span>
                        تطبيق الاقتراحات
                    </button>
                    <button class="smart-warning-btn btn-cancel" onclick="window.smartCancelWarnings()">
                        <span>✕</span>
                        تخطي
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        window.smartWarningCallback=callback;
        window.smartWarningQueue=warnings;
    }
}
window.smartAcceptWarnings=function(){
    const inputs=document.querySelectorAll('[id^="smart-edit-"]');
    inputs.forEach(input=>{
        const id=input.id.replace('smart-edit-','');
        const warning=window.smartWarningQueue[id];
        if(warning&&warning.onEdit){
            warning.onEdit(parseInt(input.value)||warning.currentValue);
        }
    });
    const overlay=document.getElementById('smart-warnings-overlay');
    if(overlay){
        overlay.style.opacity='0';
        overlay.style.transform='scale(0.95)';
        setTimeout(()=>overlay.remove(),300);
    }
    if(window.smartWarningCallback){
        window.smartWarningCallback();
        window.smartWarningCallback=null;
    }
    SmartToast.show('تم تطبيق التعديلات بنجاح','success',2000);
};
window.smartCancelWarnings=function(){
    const overlay=document.getElementById('smart-warnings-overlay');
    if(overlay){
        overlay.style.opacity='0';
        overlay.style.transform='scale(0.95)';
        setTimeout(()=>overlay.remove(),300);
    }
    if(window.smartWarningCallback){
        window.smartWarningCallback();
        window.smartWarningCallback=null;
    }
    SmartToast.show('تم تخطي التحذيرات','info',2000);
};
class Processor{
    static start(options){
        SmartToast.show('🚀 بدء التحليل الذكي للوصفات...','ai',1500);
        setTimeout(()=>{
            try{
                const table=document.querySelector('table');
                if(!table){SmartToast.show('❌ لم يتم العثور على جدول الوصفات','error');return;}
                const warnings=[];
                const processedItems=[];
                const aiAnalysis=this.analyzeTable(table,options);
                warnings.push(...aiAnalysis.warnings);
                processedItems.push(...aiAnalysis.items);
                if(warnings.length>0&&options.showWarnings){
                    SmartWarnings.show(warnings,()=>{
                        this.applyProcessing(table,processedItems,options);
                        this.showAdvancedOptions(processedItems);
                    });
                }else{
                    this.applyProcessing(table,processedItems,options);
                    this.showAdvancedOptions(processedItems);
                }
            }catch(e){
                SmartToast.show(`❌ خطأ: ${e.message}`,'error');
            }
        },800);
    }
    static analyzeTable(table,options){
        const warnings=[];
        const items=[];
        const rows=table.querySelectorAll('tr');
        if(rows.length<2){return{warnings,items};}
        const headers=Array.from(rows[0].querySelectorAll('th,td')).map(h=>h.textContent.toLowerCase());
        const getColIndex=(names)=>{
            for(let name of names){
                const idx=headers.findIndex(h=>h.includes(name));
                if(idx!==-1)return idx;
            }
            return-1;
        };
        const colNote=getColIndex(['note','ملاحظة','ملاحظات']);
        const colCode=getColIndex(['code','كود']);
        const colName=getColIndex(['name','اسم','الصنف','item']);
        const colSize=getColIndex(['size','حجم']);
        const colEvery=getColIndex(['every','evry','كل']);
        const colTime=getColIndex(['time','وقت']);
        for(let i=1;i<rows.length;i++){
            const cells=rows[i].querySelectorAll('td');
            if(cells.length===0)continue;
            const note=colNote!==-1?cells[colNote]?.textContent||'':'';
            const code=colCode!==-1?cells[colCode]?.textContent||'':'';
            const name=colName!==-1?cells[colName]?.textContent||'':'';
            if(!note&&!name)continue;
            const aiResult=AI_MODEL.analyzeDose(note,name);
            const duration=AI_MODEL.durationExtract(note);
            const time=AI_MODEL.timeExtract(note);
            const item={
                row:rows[i],cells:cells,note:note,code:code,
                name:name,aiResult:aiResult,duration:duration,
                time:time,fixedSize:FIXED_CODES[code]||null,
                isWeekly:WEEKLY_INJECT.includes(code),
                colNote:colNote,colSize:colSize,colEvery:colEvery,colTime:colTime
            };
            items.push(item);
            if(aiResult.confidence<0.7){
                warnings.push({
                    level:'medium',
                    title:'تحليل غير مؤكد',
                    message:`الصنف "${name}" - تحليل الجرعة غير واضح (ثقة: ${Math.round(aiResult.confidence*100)}%)`,
                    suggestion:'يرجى مراجعة الملاحظات يدوياً للتأكد من الجرعة',
                    editable:false
                });
            }
            if(aiResult.doubleDose){
                warnings.push({
                    level:'info',
                    title:'جرعة مزدوجة',
                    message:`الصنف "${name}" - يحتوي على "2 حبة/قرص"`,
                    suggestion:'تم ضبط الجرعة إلى 2 حبة لكل مرة تلقائياً',
                    editable:false
                });
            }
            if(duration.hasDuration&&options.days!==duration.days){
                warnings.push({
                    level:'low',
                    title:'تفاوت في المدة',
                    message:`المكتوب: ${duration.days} يوم | المحدد: ${options.days} يوم`,
                    editLabel:'تعديل الأيام',
                    currentValue:duration.days,
                    minValue:1,
                    maxValue:365,
                    onEdit:function(newVal){this.duration.days=newVal;}
                });
            }
        }
        return{warnings,items};
    }
    static applyProcessing(table,items,options){
        let processedCount=0;
        items.forEach(item=>{
            if(!item.row||!item.cells)return;
            if(item.colNote!==-1&&item.note){
                let newNote=item.note;
                if(item.aiResult.count>1){
                    newNote+=` [AI: ${item.aiResult.count} جرعات]`;
                }
                const noteCell=item.cells[item.colNote];
                if(noteCell.querySelector('input')){
                    noteCell.querySelector('input').value=newNote;
                }else if(noteCell.querySelector('textarea')){
                    noteCell.querySelector('textarea').value=newNote;
                }else{
                    noteCell.textContent=newNote;
                }
            }
            if(item.colSize!==-1&&item.aiResult.count>0){
                let size=options.days*item.aiResult.count;
                if(item.aiResult.doubleDose)size*=2;
                if(item.fixedSize){
                    size=Math.floor(item.fixedSize/item.aiResult.count);
                }
                const sizeCell=item.cells[item.colSize];
                if(sizeCell.querySelector('input')){
                    sizeCell.querySelector('input').value=size;
                }else{
                    sizeCell.textContent=size;
                }
            }
            if(item.colEvery!==-1){
                let everyValue='24';
                if(item.aiResult.count===2)everyValue='12';
                if(item.aiResult.count===3)everyValue='8';
                if(item.aiResult.special==='48h')everyValue='48';
                const everyCell=item.cells[item.colEvery];
                if(everyCell.querySelector('select')){
                    everyCell.querySelector('select').value=everyValue;
                }else if(everyCell.querySelector('input')){
                    everyCell.querySelector('input').value=everyValue;
                }else{
                    everyCell.textContent=everyValue;
                }
            }
            if(item.colTime!==-1&&item.time){
                const timeCell=item.cells[item.colTime];
                const timeInput=timeCell.querySelector('input[type="time"]');
                if(timeInput)timeInput.value=item.time;
            }
            processedCount++;
        });
        SmartToast.show(`✅ تم معالجة ${processedCount} صنف بنجاح باستخدام الذكاء الاصطناعي`,'success',3000);
    }
    static showAdvancedOptions(items){
        setTimeout(()=>{
            const container=document.createElement('div');
            container.id='ez-advanced-options';
            container.style.cssText=`
                position:fixed;bottom:20px;right:20px;background:#fff;
                border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.2);
                padding:20px;min-width:300px;z-index:99999;
                border:2px solid #e5e7eb;font-family:'Inter',sans-serif;
            `;
            const aiItems=items.filter(i=>i.aiResult.confidence>0.8).length;
            const complexItems=items.filter(i=>i.aiResult.isComplex).length;
            const fixedItems=items.filter(i=>i.fixedSize).length;
            container.innerHTML=`
                <div style="margin-bottom:20px;">
                    <div style="font-weight:700;font-size:18px;color:#1f2937;margin-bottom:8px;">
                        📊 ملخص التحليل
                    </div>
                    <div style="color:#6b7280;font-size:14px;">
                        تم تحليل ${items.length} صنف باستخدام الذكاء الاصطناعي
                    </div>
                </div>
                <div style="display:grid;gap:12px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;padding:12px;
                        background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;">
                        <span style="color:#0369a1;font-weight:600;">🧠 تحليل ذكي</span>
                        <span style="font-weight:700;">${aiItems}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:12px;
                        background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
                        <span style="color#059669;font-weight:600;">⚡ جرعات معقدة</span>
                        <span style="font-weight:700;">${complexItems}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:12px;
                        background:#fef3c7;border-radius:10px;border:1px solid #fde68a;">
                        <span style="color:#d97706;font-weight:600;">📦 أحجام ثابتة</span>
                        <span style="font-weight:700;">${fixedItems}</span>
                    </div>
                </div>
                <button onclick="document.getElementById('ez-advanced-options').remove();" 
                    style="width:100%;padding:12px;background:linear-gradient(135deg,#3b82f6,#2563eb);
                    color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;
                    transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                    ✅ تم
                </button>
            `;
            document.body.appendChild(container);
        },1000);
    }
}
function initEZPillAI(){
    if(document.getElementById('ez-ai-dialog'))return;
    const dialog=new AIDialog();
    dialog.show();
    document.addEventListener('keydown',(e)=>{
        if(e.key==='Escape'){
            const dialog=document.getElementById('ez-ai-dialog');
            if(dialog)dialog.remove();
        }
    });
}
initEZPillAI();
})();

javascript:void((async()=>{
    console.log("بداية تشغيل السكريبت...");
    
    const delay = (a,b)=>new Promise(r=>setTimeout(r,Math.floor(Math.random()*(b-a+1))+a));
    
    const pickFiles = () => new Promise(res => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.multiple = true; inp.accept = '.json';
        inp.onchange = () => { console.log("تم اختيار الملفات"); res(inp.files); };
        inp.click();
    });

    const files = await pickFiles();
    if (!files || !files.length) { console.log("لم يتم اختيار ملفات!"); return; }

    for (let i = 0; i < files.length; i++) {
        console.log(`جاري العمل على ملف: ${files[i].name}`);
        
        const uploadBtn = document.querySelector('.mdi-briefcase-upload');
        if (uploadBtn) {
            console.log("تم العثور على زر الرفع");
            uploadBtn.click(); // جرب click عادية أولاً
            await delay(500, 800);
        } else {
            console.error("لم يتم العثور على زر mdi-briefcase-upload");
        }
        
        // ... باقي الكود
    }
})())

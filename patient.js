(async () => {
    // 1. تعريف الدوال المساعدة (Helper Functions)
    const delay = (a, b) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (b - a + 1)) + a));

    const simulateClick = (e) => {
        const r = e.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const o = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };
        e.dispatchEvent(new PointerEvent('pointerdown', o));
        e.dispatchEvent(new MouseEvent('mousedown', o));
        e.dispatchEvent(new PointerEvent('pointerup', o));
        e.dispatchEvent(new MouseEvent('mouseup', o));
        e.dispatchEvent(new MouseEvent('click', o));
    };

    const waitForElement = (s, t = 6000) => new Promise((res, rej) => {
        const el = document.querySelector(s);
        if (el) return res(el);
        const ob = new MutationObserver(() => {
            const el = document.querySelector(s);
            if (el) { ob.disconnect(); res(el); }
        });
        ob.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { ob.disconnect(); rej(); }, t);
    });

    const findBtn = txt => [...document.querySelectorAll('span.v-btn__content')]
        .find(e => e.textContent.trim().toLowerCase() === txt.toLowerCase());

    // هذه هي الدالة التي كانت مفقودة وتسببت في الخطأ
    const pickFiles = () => new Promise(res => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.multiple = true;
        inp.accept = '.json';
        inp.onchange = () => res(inp.files);
        inp.click();
    });

    // 2. بداية تنفيذ العمليات (Main Logic)
    console.log("السكريبت بدأ العمل...");
    const files = await pickFiles();
    
    if (!files || !files.length) {
        console.log("لم يتم اختيار أي ملفات.");
        return;
    }

    for (let i = 0; i < files.length; i++) {
        console.log(`جاري معالجة الملف: ${files[i].name}`);
        
        const uploadBtn = document.querySelector('.mdi-briefcase-upload');
        if (uploadBtn) {
            simulateClick(uploadBtn);
            await delay(200, 400);
        }

        try {
            await delay(200, 400);
            const selectInput = document.querySelector('#input-304') || 
                               document.querySelector('.v-dialog--active input[readonly]');
            if (selectInput) {
                simulateClick(selectInput);
                await delay(200, 400);
            }

            const menu = document.querySelector('.menuable__content__active');
            if (menu) {
                const firstItem = menu.querySelector('.v-list-item');
                if (firstItem) {
                    simulateClick(firstItem);
                    await delay(200, 400);
                }
            }
        } catch (e) {
            console.warn("خطأ بسيط في اختيار القائمة، سأكمل المحاولة...");
        }

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            const dt = new DataTransfer();
            dt.items.add(files[i]);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            await delay(1000, 1500);
        }

        let pressed = false;
        for (let j = 0; j < 10; j++) {
            const importBtn = findBtn('Import');
            if (importBtn) {
                const btn = importBtn.closest('button') || importBtn;
                simulateClick(btn);
                pressed = true;
                break;
            }
            await delay(200, 400);
        }

        if (!pressed) await delay(800, 1200);

        try {
            const swalOk = await waitForElement('.swal2-confirm', 6000);
            await delay(100, 300);
            simulateClick(swalOk);
        } catch (e) {
            console.error("لم تظهر رسالة التأكيد.");
        }
        
        await delay(200, 400);
    }
    
    console.log("تم الانتهاء من كافة الملفات.");
})();

/**
 * Nahdi Automation Tool - Bulk JSON Importer
 * Author: Ali Al-Baz
 */

(async () => {
    // دالة للانتظار العشوائي لتجنب كشف الأتمتة
    const randomDelay = (min, max) => 
        new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

    // محاكاة النقرة الحقيقية بجميع أحداث الماوس
    const simulateClick = (element) => {
        const rect = element.getBoundingClientRect();
        const opts = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        };
        element.dispatchEvent(new PointerEvent('pointerdown', opts));
        element.dispatchEvent(new MouseEvent('mousedown', opts));
        element.dispatchEvent(new PointerEvent('pointerup', opts));
        element.dispatchEvent(new MouseEvent('mouseup', opts));
        element.dispatchEvent(new MouseEvent('click', opts));
    };

    // الانتظار حتى ظهور عنصر معين في الصفحة
    const waitForElement = (selector, timeout = 6000) => {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const target = document.querySelector(selector);
                if (target) {
                    observer.disconnect();
                    resolve(target);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for: ${selector}`));
            }, timeout);
        });
    };

    const findButtonByText = (text) => 
        [...document.querySelectorAll('span.v-btn__content')]
            .find(el => el.textContent.trim().toLowerCase() === text.toLowerCase());

    const pickFiles = () => {
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.json';
            input.onchange = () => resolve(input.files);
            input.click();
        });
    };

    // بداية التنفيذ
    const files = await pickFiles();
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        console.log(`جاري رفع الملف رقم ${i + 1}: ${files[i].name}`);

        const uploadBtn = document.querySelector('.mdi-briefcase-upload');
        if (uploadBtn) {
            simulateClick(uploadBtn);
            await randomDelay(200, 400);
        }

        try {
            await randomDelay(200, 400);
            const selectInput = document.querySelector('#input-304') || 
                               document.querySelector('.v-dialog--active input[readonly]');
            if (selectInput) {
                simulateClick(selectInput);
                await randomDelay(200, 400);
            }

            const menu = document.querySelector('.menuable__content__active');
            if (menu) {
                const firstItem = menu.querySelector('.v-list-item');
                if (firstItem) {
                    simulateClick(firstItem);
                    await randomDelay(200, 400);
                }
            }
        } catch (err) {
            console.warn("فشل في اختيار العنصر من القائمة، قد يكون مختاراً بالفعل.");
        }

        // التعامل مع مدخل الملفات المخفي
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[i]);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            await randomDelay(1000, 1500);
        }

        // الضغط على زر الاستيراد
        let importClicked = false;
        for (let j = 0; j < 10; j++) {
            const importBtnContent = findButtonByText('Import');
            if (importBtnContent) {
                const actualBtn = importBtnContent.closest('button') || importBtnContent;
                simulateClick(actualBtn);
                importClicked = true;
                break;
            }
            await randomDelay(200, 400);
        }

        if (!importClicked) await randomDelay(800, 1200);

        // تأكيد رسالة النجاح (SweetAlert2)
        try {
            const confirmBtn = await waitForElement('.swal2-confirm', 6000);
            await randomDelay(100, 300);
            simulateClick(confirmBtn);
        } catch (e) {
            console.error("لم تظهر رسالة التأكيد في الوقت المحدد.");
        }

        await randomDelay(200, 400);
    }
    
    alert("تم الانتهاء من رفع جميع الملفات بنجاح!");
})();

(async function () {
    'use strict';

    // دالة لمحاكاة نقرة ماوس حقيقية
    function simulateMouseClick(element) {
        if (!element) return false;
        const events = ['mouseover', 'mousemove', 'mousedown', 'mouseup', 'click'];
        events.forEach(type => {
            element.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
        return true;
    }

    // دالة انتظار ظهور عنصر
    async function waitForElement(selector, timeout = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el && el.offsetParent !== null) return el;
            await new Promise(r => setTimeout(r, 300));
        }
        return null;
    }

    // دالة التأكيد التلقائي لـ SweetAlert2
    async function autoConfirmSweetAlert() {
        const confirmBtn = await waitForElement('.swal2-confirm', 10000);
        if (confirmBtn) {
            simulateMouseClick(confirmBtn);
            await new Promise(r => setTimeout(r, 800));
            return true;
        }
        return false;
    }

    // ------------------ يرجى تعديل هذه الـ selectors حسب الموقع المستهدف ------------------
    const FILE_INPUT_SELECTOR      = 'input[type="file"]';
    const UPLOAD_BUTTON_SELECTOR   = '.v-btn:has(span:contains("رفع")), .v-btn:has(span:contains("Upload")), .v-btn--contained';
    const DIALOG_CLOSE_SELECTOR    = '.v-card__actions .v-btn:contains("إغلاق"), .v-btn--text';
    const SUCCESS_INDICATOR        = '.v-alert--success, .v-snackbar:contains("نجح")';
    // -----------------------------------------------------------------------------------

    // ------------------ إعدادات المقارنة (عدّل هنا حسب بياناتك) ------------------
    const INVOICE_FIELD_NAME = 'invoiceNumber'; // ← غيّر هذا إلى اسم الحقل الفعلي في JSON

    // دالة قراءة محتوى الملف كنص
    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // دالة استخراج "اليوم" من Date Modified للملف فقط
    function getDayFromFile(file) {
        return new Date(file.lastModified).toISOString().slice(0, 10); // YYYY-MM-DD
    }

    // دالة استخراج مفتاح البحث (أول 4 أرقام من رقم الفاتورة)
    function getSearchKey(file, json) {
        let invoiceNumber = json[INVOICE_FIELD_NAME];

        if (!invoiceNumber && typeof file.name === 'string') {
            const match = file.name.match(/\d{4,}/);
            invoiceNumber = match ? match[0] : null;
        }

        if (typeof invoiceNumber === 'string' || typeof invoiceNumber === 'number') {
            return String(invoiceNumber).substring(0, 4);
        }

        return null;
    }

    // إنشاء input مخفي لاختيار الملفات
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.multiple = true;
    hiddenInput.accept = '.json,application/json';
    hiddenInput.style.position = 'fixed';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.pointerEvents = 'none';
    document.body.appendChild(hiddenInput);

    hiddenInput.click();

    hiddenInput.addEventListener('change', async (e) => {
        let files = Array.from(e.target.files).filter(f => f.type === 'application/json' || f.name.endsWith('.json'));
        if (files.length === 0) {
            alert('لم يتم اختيار أي ملفات JSON صالحة.');
            return;
        }

        if (!confirm(`سيتم معالجة ${files.length} ملف JSON (مع تجاهل المكررات في نفس اليوم بناءً على أول 4 أرقام من الفاتورة).\nهل تريد المتابعة؟`)) return;

        // مرحلة 1: فحص المكررات
        const uniqueFiles = [];
        const seen = new Set();

        console.log('جاري فحص المكررات حسب اليوم وأول 4 أرقام من الفاتورة...');

        for (const file of files) {
            try {
                const content = await readFileContent(file);
                const json = JSON.parse(content);

                const day = getDayFromFile(file);
                const searchKey = getSearchKey(file, json);

                if (!searchKey) {
                    console.warn(`تحذير: لم يتم العثور على رقم فاتورة صالح في الملف ${file.name}. سيتم رفعه رغم ذلك.`);
                    uniqueFiles.push({ file });
                    continue;
                }

                const key = `${day}|${searchKey}`;

                if (seen.has(key)) {
                    console.log(`تم تجاهل مكرر في نفس اليوم (${day}) - أول 4 أرقام: ${searchKey} - الملف: ${file.name}`);
                } else {
                    seen.add(key);
                    uniqueFiles.push({ file });
                    console.log(`سيتم رفع: ${file.name} (يوم: ${day} | أول 4 أرقام: ${searchKey})`);
                }
            } catch (err) {
                console.warn(`ملف غير صالح: ${file.name} - سيتم تجاهله`);
            }
        }

        if (uniqueFiles.length === 0) {
            alert('لم يتبقَ أي ملفات فريدة للرفع بعد إزالة المكررات.');
            return;
        }

        alert(`سيتم رفع ${uniqueFiles.length} ملف فريد (تم تجاهل ${files.length - uniqueFiles.length} مكرر).`);

        // مرحلة 2: رفع الملفات الفريدة
        for (let i = 0; i < uniqueFiles.length; i++) {
            const { file } = uniqueFiles[i];
            console.log(`جاري رفع الملف ${i + 1}/${uniqueFiles.length}: ${file.name}`);

            const fileInput = await waitForElement(FILE_INPUT_SELECTOR);
            if (!fileInput) {
                alert('خطأ: لم يتم العثور على حقل رفع الملف. تحقق من الـ selector.');
                return;
            }

            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('input', { bubbles: true }));
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            await new Promise(r => setTimeout(r, 800));
            const uploadBtn = await waitForElement(UPLOAD_BUTTON_SELECTOR);
            if (!uploadBtn) {
                alert(`خطأ: لم يتم العثور على زر الرفع للملف ${file.name}`);
                continue;
            }
            simulateMouseClick(uploadBtn);

            await new Promise(r => setTimeout(r, 1000));
            await autoConfirmSweetAlert();

            const successEl = await waitForElement(SUCCESS_INDICATOR, 20000);
            if (!successEl) {
                console.warn(`تحذير: لم يتم اكتشاف نجاح الرفع للملف ${file.name}. سيتم المتابعة...`);
            }

            await new Promise(r => setTimeout(r, 1000));
            const closeBtn = await waitForElement(DIALOG_CLOSE_SELECTOR);
            if (closeBtn) simulateMouseClick(closeBtn);

            await new Promise(r => setTimeout(r, 1500));
        }

        alert('تم رفع جميع الملفات الفريدة بنجاح!');
        console.log('انتهت عملية الرفع الجماعي.');
    });
})();

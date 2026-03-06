javascript:(async function() {
    /* ═══════════════════════════════════════════════════════
       🏥 مستخرج بيانات فروع النهدي - جدة
       النسخة المحسّنة v2.0 - سريع + موثوق + منظّم
    ═══════════════════════════════════════════════════════ */

    // ⚙️ إعدادات قابلة للتعديل
    const CONFIG = {
        TARGET_CITY: "جدة",
        START_ID: 1000,
        END_ID: 2000,
        BASE_URL: "https://rtlapps.nahdi.sa/ssp/StoreDashboradOnline.asp?StoreCode=",
        WAIT_MS: 1200,          // وقت الانتظار الأساسي (أسرع من النسخة القديمة)
        RETRY_WAIT_MS: 2000,    // وقت الانتظار عند إعادة المحاولة
        MAX_RETRIES: 2,         // عدد إعادات المحاولة للفرع الواحد
        BATCH_SIZE: 5,          // كل كم فرع يحفظ نسخة احتياطية
    };

    let results = [];
    let skipped = [];
    let failed = [];
    let scanned = 0;
    const total = CONFIG.END_ID - CONFIG.START_ID + 1;

    // ═══ إنشاء شريط التقدم ═══
    const overlay = document.createElement('div');
    overlay.id = 'nahdi-extractor-overlay';
    overlay.innerHTML = `
        <div style="
            position:fixed; top:0; left:0; right:0; 
            background:linear-gradient(135deg,#004a99,#0066cc); 
            color:white; padding:15px 20px; z-index:999999; 
            font-family:'Segoe UI',Tahoma,sans-serif; direction:rtl;
            box-shadow:0 4px 20px rgba(0,0,0,0.3);
        ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:18px; font-weight:bold;">🏥 مستخرج فروع النهدي - جدة</span>
                <span id="nahdi-status" style="font-size:14px;">جاري التحضير...</span>
            </div>
            <div style="background:rgba(255,255,255,0.2); border-radius:10px; height:24px; overflow:hidden;">
                <div id="nahdi-progress" style="
                    height:100%; width:0%; border-radius:10px;
                    background:linear-gradient(90deg,#2ecc71,#27ae60);
                    transition:width 0.3s ease; 
                    display:flex; align-items:center; justify-content:center;
                    font-size:12px; font-weight:bold; color:white;
                ">0%</div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:13px;">
                <span>✅ تم العثور: <b id="nahdi-found">0</b></span>
                <span>📊 تم الفحص: <b id="nahdi-scanned">0</b> / ${total}</span>
                <span>⏭️ تم التجاهل: <b id="nahdi-skipped">0</b></span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    function updateUI(currentCode) {
        const pct = Math.round((scanned / total) * 100);
        document.getElementById('nahdi-progress').style.width = pct + '%';
        document.getElementById('nahdi-progress').textContent = pct + '%';
        document.getElementById('nahdi-found').textContent = results.length;
        document.getElementById('nahdi-scanned').textContent = scanned;
        document.getElementById('nahdi-skipped').textContent = skipped.length;
        document.getElementById('nahdi-status').textContent = `جاري فحص الكود: ${currentCode}`;
    }

    // ═══ فتح نافذة العمل ═══
    let workerWin = window.open("about:blank", "nahdiWorker", "width=1,height=1,left=9999,top=9999");
    if (!workerWin) {
        alert("⚠️ يرجى تفعيل النوافذ المنبثقة (Popups) ثم المحاولة مجدداً");
        overlay.remove();
        return;
    }

    // ═══ دالة استخراج البيانات من الصفحة ═══
    function extractData(doc, storeCode) {
        try {
            const cells = Array.from(doc.querySelectorAll('td'));
            let data = {
                storeCode: "",
                storeName: "",
                storeAddress: "",
                googleMapsURL: "",
                city: ""
            };

            for (let cell of cells) {
                let txt = cell.innerText.trim();
                if (txt.includes("Store Code :")) data.storeCode = txt.split("Store Code :")[1].trim();
                if (txt.includes("Store Name :")) data.storeName = txt.split("Store Name :")[1].trim();
                if (txt.includes("Store Address :")) data.storeAddress = txt.split("Store Address :")[1].trim();
                if (txt.includes("City :")) data.city = txt.split("City :")[1].trim();

                let link = cell.querySelector('a[href*="map"], a[href*="google"]');
                if (link) data.googleMapsURL = link.href;
            }

            return data;
        } catch (e) {
            return null;
        }
    }

    // ═══ دالة تحميل صفحة مع إعادة المحاولة ═══
    async function fetchStore(storeCode, attempt = 1) {
        return new Promise(async (resolve) => {
            try {
                workerWin.location.href = CONFIG.BASE_URL + storeCode;
                const waitTime = attempt === 1 ? CONFIG.WAIT_MS : CONFIG.RETRY_WAIT_MS;
                await new Promise(r => setTimeout(r, waitTime));

                // التحقق من تحميل الصفحة
                const doc = workerWin.document;
                if (!doc || !doc.body || doc.body.innerHTML.length < 50) {
                    if (attempt < CONFIG.MAX_RETRIES) {
                        console.log(`⏳ إعادة محاولة للكود ${storeCode} (المحاولة ${attempt + 1})`);
                        resolve(await fetchStore(storeCode, attempt + 1));
                        return;
                    }
                    resolve(null);
                    return;
                }

                const data = extractData(doc, storeCode);
                resolve(data);
            } catch (e) {
                if (attempt < CONFIG.MAX_RETRIES) {
                    resolve(await fetchStore(storeCode, attempt + 1));
                } else {
                    resolve(null);
                }
            }
        });
    }

    // ═══ دالة حفظ CSV ═══
    function downloadCSV(dataArray, filename) {
        if (dataArray.length === 0) return;

        let csvContent = "\uFEFF"; // BOM لدعم العربية في Excel
        csvContent += "رقم الصيدلية,اسم الصيدلية,العنوان,رابط جوجل ماب,المدينة\n";
        csvContent += "Store Code,Store Name,Address,Google Maps URL,City\n";
        csvContent += "─────────,──────────,───────,───────────────,──────\n";

        dataArray.forEach((d, idx) => {
            csvContent += `"${d.storeCode}","${d.storeName}","${d.storeAddress}","${d.googleMapsURL}","${d.city}"\n`;
        });

        // إضافة ملخص في نهاية الملف
        csvContent += `\n"","","","",""\n`;
        csvContent += `"إجمالي الفروع","${dataArray.length}","","",""\n`;
        csvContent += `"تاريخ الاستخراج","${new Date().toLocaleString('ar-SA')}","","",""\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ═══ حفظ احتياطي في localStorage ═══
    function backupToStorage() {
        try {
            localStorage.setItem('nahdi_backup', JSON.stringify({
                results: results,
                lastScanned: scanned,
                timestamp: new Date().toISOString()
            }));
        } catch (e) { /* تجاهل أخطاء التخزين */ }
    }

    // ═══ بدء الاستخراج ═══
    console.log(`%c 🚀 بدء استخراج فروع النهدي في ${CONFIG.TARGET_CITY}`, 
        "background:#004a99; color:white; padding:8px; font-size:14px; border-radius:5px;");
    console.log(`%c 📍 النطاق: ${CONFIG.START_ID} → ${CONFIG.END_ID} (${total} كود)`, 
        "color:#3498db; font-size:12px;");

    const startTime = Date.now();

    for (let i = CONFIG.START_ID; i <= CONFIG.END_ID; i++) {
        scanned++;
        updateUI(i);

        const data = await fetchStore(i);

        if (data && data.storeName) {
            if (data.city.includes(CONFIG.TARGET_CITY)) {
                results.push(data);
                console.log(`%c ✅ [${results.length}] ${data.storeName} | كود: ${data.storeCode} | ${data.city}`, 
                    "color:#2ecc71; font-weight:bold;");
            } else {
                skipped.push(data);
            }
        } else if (data === null) {
            failed.push(i);
        }

        // نسخة احتياطية كل BATCH_SIZE فرع
        if (results.length > 0 && results.length % CONFIG.BATCH_SIZE === 0) {
            backupToStorage();
        }
    }

    // ═══ إغلاق وتنظيف ═══
    workerWin.close();

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    // تحديث واجهة الانتهاء
    document.getElementById('nahdi-status').textContent = `✅ اكتملت العملية في ${minutes}د ${seconds}ث`;
    document.getElementById('nahdi-progress').style.width = '100%';
    document.getElementById('nahdi-progress').textContent = '100%';
    document.getElementById('nahdi-progress').style.background = 'linear-gradient(90deg,#f1c40f,#e67e22)';

    // ═══ تحميل CSV النهائي ═══
    if (results.length > 0) {
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadCSV(results, `Nahdi_Jeddah_${results.length}_Stores_${timestamp}.csv`);

        console.log(`%c ═══════════════════════════════════════`, "color:#f1c40f;");
        console.log(`%c 🎉 اكتملت العملية بنجاح!`, "color:#2ecc71; font-size:16px; font-weight:bold;");
        console.log(`%c ✅ فروع جدة: ${results.length}`, "color:#2ecc71; font-size:13px;");
        console.log(`%c ⏭️ مدن أخرى: ${skipped.length}`, "color:#e67e22; font-size:13px;");
        console.log(`%c ❌ فشل التحميل: ${failed.length}`, "color:#e74c3c; font-size:13px;");
        console.log(`%c ⏱️ الوقت: ${minutes} دقيقة و ${seconds} ثانية`, "color:#3498db; font-size:13px;");
        console.log(`%c ═══════════════════════════════════════`, "color:#f1c40f;");

        // إزالة شريط التقدم بعد 8 ثوانٍ
        setTimeout(() => overlay.remove(), 8000);

        alert(`🎉 تم بنجاح!\n\n` +
              `✅ فروع جدة: ${results.length} فرع\n` +
              `⏭️ مدن أخرى: ${skipped.length}\n` +
              `❌ فشل: ${failed.length}\n` +
              `⏱️ الوقت: ${minutes}د ${seconds}ث\n\n` +
              `📥 تم تحميل ملف CSV تلقائياً`);
    } else {
        overlay.remove();
        alert("❌ لم يتم العثور على فروع في جدة ضمن النطاق المحدد.\n" +
              `تم فحص ${total} كود.`);
    }

})();

javascript:(async function() {
    /* ═══════════════════════════════════════════════════════
       🏥 مستخرج فروع النهدي - جدة | v3.0 مُصلَّح
       ✅ حل مشكلة التكرار
       ✅ حل مشكلة رابط جوجل ماب
       ✅ نطاق مُحدّد 1000 → 1400
    ═══════════════════════════════════════════════════════ */

    const CONFIG = {
        TARGET_CITY: "جدة",
        START_ID: 1000,
        END_ID: 1400,
        BASE_URL: "https://rtlapps.nahdi.sa/ssp/StoreDashboradOnline.asp?StoreCode=",
        WAIT_MS: 1500,
        MAX_RETRIES: 2,
    };

    /* ══════════════════════════════════════
       🛡️ مصفوفة النتائج مع حماية من التكرار
    ══════════════════════════════════════ */
    const seenCodes = new Set();
    let results = [];
    let scanned = 0;
    let skippedCity = 0;
    let emptyPages = 0;
    const total = CONFIG.END_ID - CONFIG.START_ID + 1;

    /* ══════════════════════════════════════
       🖥️ شريط التقدم
    ══════════════════════════════════════ */
    const overlay = document.createElement('div');
    overlay.id = 'nahdi-ext';
    overlay.innerHTML = `
        <div style="position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#004a99,#0066cc);color:#fff;padding:15px 20px;z-index:999999;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;box-shadow:0 4px 20px rgba(0,0,0,.3)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <span style="font-size:18px;font-weight:bold">🏥 مستخرج فروع النهدي v3</span>
                <span id="nx-status" style="font-size:14px">جاري التحضير...</span>
            </div>
            <div style="background:rgba(255,255,255,.2);border-radius:10px;height:24px;overflow:hidden">
                <div id="nx-bar" style="height:100%;width:0%;border-radius:10px;background:linear-gradient(90deg,#2ecc71,#27ae60);transition:width .3s;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold">0%</div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px">
                <span>✅ جدة: <b id="nx-found">0</b></span>
                <span>📊 فحص: <b id="nx-scan">0</b>/${total}</span>
                <span>⏭️ مدن أخرى: <b id="nx-skip">0</b></span>
                <span>📭 فارغ: <b id="nx-empty">0</b></span>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    function updateUI(code) {
        const pct = Math.round((scanned / total) * 100);
        document.getElementById('nx-bar').style.width = pct + '%';
        document.getElementById('nx-bar').textContent = pct + '%';
        document.getElementById('nx-found').textContent = results.length;
        document.getElementById('nx-scan').textContent = scanned;
        document.getElementById('nx-skip').textContent = skippedCity;
        document.getElementById('nx-empty').textContent = emptyPages;
        document.getElementById('nx-status').textContent = 'كود: ' + code;
    }

    /* ══════════════════════════════════════
       🪟 فتح iframe بدل window.open (أكثر استقراراً)
    ══════════════════════════════════════ */
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1024px;height:768px;opacity:0;pointer-events:none;';
    iframe.name = 'nahdi_worker_frame';
    document.body.appendChild(iframe);

    /* ══════════════════════════════════════
       📄 تحميل صفحة داخل الـ iframe
    ══════════════════════════════════════ */
    function loadPage(url) {
        return new Promise((resolve) => {
            let resolved = false;

            function onLoad() {
                if (!resolved) {
                    resolved = true;
                    iframe.removeEventListener('load', onLoad);
                    /* انتظار إضافي لتأكيد اكتمال render */
                    setTimeout(resolve, 500);
                }
            }

            iframe.addEventListener('load', onLoad);
            iframe.src = url;

            /* timeout احتياطي */
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    iframe.removeEventListener('load', onLoad);
                    resolve();
                }
            }, CONFIG.WAIT_MS + 1000);
        });
    }

    /* ══════════════════════════════════════
       🔍 استخراج البيانات من الصفحة
       مع طرق متعددة لالتقاط الرابط
    ══════════════════════════════════════ */
    function extractData(doc) {
        try {
            const cells = Array.from(doc.querySelectorAll('td'));
            if (cells.length === 0) return null;

            let data = {
                storeCode: "",
                storeName: "",
                storeAddress: "",
                googleMapsURL: "",
                city: ""
            };

            for (let cell of cells) {
                let txt = cell.innerText.trim();

                if (txt.includes("Store Code")) {
                    let val = txt.split(":").slice(1).join(":").trim();
                    if (val) data.storeCode = val;
                }
                if (txt.includes("Store Name")) {
                    let val = txt.split(":").slice(1).join(":").trim();
                    if (val) data.storeName = val;
                }
                if (txt.includes("Store Address")) {
                    let val = txt.split(":").slice(1).join(":").trim();
                    if (val) data.storeAddress = val;
                }
                if (txt.includes("City")) {
                    let val = txt.split(":").slice(1).join(":").trim();
                    if (val) data.city = val;
                }
            }

            /* ═══ استخراج رابط جوجل ماب بكل الطرق الممكنة ═══ */
            // الطريقة 1: البحث في كل الروابط
            const allLinks = Array.from(doc.querySelectorAll('a'));
            for (let link of allLinks) {
                let href = link.href || link.getAttribute('href') || '';
                if (href.includes('google') && href.includes('map')) {
                    data.googleMapsURL = href;
                    break;
                }
                if (href.includes('goo.gl')) {
                    data.googleMapsURL = href;
                    break;
                }
                if (href.includes('maps.app')) {
                    data.googleMapsURL = href;
                    break;
                }
            }

            // الطريقة 2: البحث في onclick attributes
            if (!data.googleMapsURL) {
                const allElements = doc.querySelectorAll('[onclick]');
                for (let el of allElements) {
                    let onclick = el.getAttribute('onclick') || '';
                    let mapMatch = onclick.match(/https?:\/\/[^\s'"]+(?:google|goo\.gl|maps)[^\s'"]*/i);
                    if (mapMatch) {
                        data.googleMapsURL = mapMatch[0];
                        break;
                    }
                }
            }

            // الطريقة 3: البحث في HTML الخام عن أي رابط خرائط
            if (!data.googleMapsURL) {
                let html = doc.body.innerHTML;
                let patterns = [
                    /https?:\/\/(?:www\.)?google\.[a-z.]+\/maps[^\s"'<>]*/gi,
                    /https?:\/\/maps\.google\.[a-z.]+[^\s"'<>]*/gi,
                    /https?:\/\/goo\.gl\/maps\/[^\s"'<>]*/gi,
                    /https?:\/\/maps\.app\.goo\.gl\/[^\s"'<>]*/gi,
                ];
                for (let pattern of patterns) {
                    let match = html.match(pattern);
                    if (match) {
                        data.googleMapsURL = match[0];
                        break;
                    }
                }
            }

            return data;
        } catch (e) {
            console.warn("خطأ في الاستخراج:", e);
            return null;
        }
    }

    /* ══════════════════════════════════════
       🚀 حلقة الاستخراج الرئيسية
    ══════════════════════════════════════ */
    console.log(`%c🚀 بدء الاستخراج: ${CONFIG.START_ID} → ${CONFIG.END_ID}`,
        "background:#004a99;color:#fff;padding:8px;font-size:14px;border-radius:5px");

    const startTime = Date.now();
    let lastValidCode = "";

    for (let i = CONFIG.START_ID; i <= CONFIG.END_ID; i++) {
        scanned++;
        updateUI(i);

        await loadPage(CONFIG.BASE_URL + i);

        let doc;
        try {
            doc = iframe.contentDocument || iframe.contentWindow.document;
        } catch (e) {
            console.warn(`⚠️ كود ${i}: لا يمكن الوصول للمحتوى`);
            emptyPages++;
            continue;
        }

        const data = extractData(doc);

        /* ═══ 🛡️ فحوصات منع التكرار ═══ */

        // فحص 1: لا توجد بيانات أصلاً
        if (!data || !data.storeName) {
            emptyPages++;
            continue;
        }

        // فحص 2: الكود المستخرج لا يطابق الكود المطلوب
        // (هذا السبب الرئيسي للتكرار - الصفحة ترجع بيانات آخر فرع محمّل)
        let extractedCode = data.storeCode.trim();
        let requestedCode = String(i);

        if (extractedCode && extractedCode !== requestedCode) {
            // الصفحة أرجعت بيانات فرع مختلف = الكود المطلوب غير موجود
            emptyPages++;
            console.log(`%c📭 كود ${i}: الصفحة أرجعت كود ${extractedCode} بدلاً منه - تم التجاهل`,
                "color:#95a5a6;font-style:italic");
            continue;
        }

        // فحص 3: منع تكرار نفس الكود (حماية إضافية)
        if (seenCodes.has(extractedCode)) {
            console.log(`%c🔄 كود ${extractedCode}: مكرر - تم التجاهل`, "color:#e67e22");
            continue;
        }

        /* ═══ فلترة المدينة ═══ */
        if (data.city.includes(CONFIG.TARGET_CITY)) {
            seenCodes.add(extractedCode);
            data.storeCode = extractedCode || requestedCode;
            results.push(data);
            console.log(`%c✅ [${results.length}] كود:${data.storeCode} | ${data.storeName} | ${data.city} | URL: ${data.googleMapsURL ? '✅' : '❌'}`,
                "color:#2ecc71;font-weight:bold");
        } else {
            skippedCity++;
            seenCodes.add(extractedCode);
            console.log(`%c⏭️ كود ${extractedCode}: ${data.city}`, "color:#e67e22");
        }
    }

    /* ══════════════════════════════════════
       📊 النتائج والتصدير
    ══════════════════════════════════════ */
    iframe.remove();

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    // تحديث الواجهة
    document.getElementById('nx-status').textContent = `✅ اكتمل في ${minutes}د ${seconds}ث`;
    document.getElementById('nx-bar').style.width = '100%';
    document.getElementById('nx-bar').textContent = '100%';
    document.getElementById('nx-bar').style.background = 'linear-gradient(90deg,#f1c40f,#e67e22)';

    if (results.length > 0) {
        /* ═══ بناء CSV نظيف ═══ */
        let csv = "\uFEFF";
        csv += "رقم الصيدلية,اسم الصيدلية,العنوان,رابط جوجل ماب,المدينة\n";

        results.forEach(d => {
            // تنظيف القيم من فواصل وأسطر جديدة
            let code = (d.storeCode || "").replace(/"/g, '""');
            let name = (d.storeName || "").replace(/"/g, '""');
            let addr = (d.storeAddress || "").replace(/"/g, '""').replace(/\n/g, ' ');
            let url = (d.googleMapsURL || "").replace(/"/g, '""');
            let city = (d.city || "").replace(/"/g, '""');
            csv += `"${code}","${name}","${addr}","${url}","${city}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const ts = new Date().toISOString().slice(0, 10);
        link.href = URL.createObjectURL(blob);
        link.download = `Nahdi_Jeddah_${results.length}_Stores_${ts}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`%c═══════════════════════════════════`, "color:#f1c40f");
        console.log(`%c🎉 النتائج النهائية:`, "color:#2ecc71;font-size:16px;font-weight:bold");
        console.log(`%c   ✅ فروع جدة (فريدة): ${results.length}`, "color:#2ecc71");
        console.log(`%c   ⏭️ مدن أخرى: ${skippedCity}`, "color:#e67e22");
        console.log(`%c   📭 أكواد فارغة/غير موجودة: ${emptyPages}`, "color:#95a5a6");
        console.log(`%c   🔗 فروع بدون رابط ماب: ${results.filter(r => !r.googleMapsURL).length}`, "color:#e74c3c");
        console.log(`%c   ⏱️ ${minutes}د ${seconds}ث`, "color:#3498db");
        console.log(`%c═══════════════════════════════════`, "color:#f1c40f");

        alert(
            `🎉 اكتمل الاستخراج!\n\n` +
            `✅ فروع جدة (بدون تكرار): ${results.length}\n` +
            `⏭️ مدن أخرى: ${skippedCity}\n` +
            `📭 أكواد فارغة: ${emptyPages}\n` +
            `🔗 بدون رابط ماب: ${results.filter(r => !r.googleMapsURL).length}\n` +
            `⏱️ ${minutes}د ${seconds}ث\n\n` +
            `📥 تم تحميل CSV`
        );

        setTimeout(() => overlay.remove(), 8000);

    } else {
        overlay.remove();
        alert(`❌ لم يتم العثور على فروع في جدة\nتم فحص ${total} كود | فارغ: ${emptyPages} | مدن أخرى: ${skippedCity}`);
    }

})();

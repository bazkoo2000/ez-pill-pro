/**
 * EZPill Ready Checker & Automation Tool
 * Developer: Ali El-Baz
 * Description: Scrapes multiple pages, filters invoices, and opens details automatically.
 */

(function() {
    const UI_ID = 'ali_sys_v22';
    const savedRows = [];
    const seenIds = new Set();

    // 1. Initial Styles
    const addStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            #${UI_ID} {
                position: fixed; top: 5%; right: 2%; background: rgba(252,252,252,0.98);
                backdrop-filter: blur(15px); border-radius: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                padding: 25px; z-index: 999999; width: 320px; color: #333; direction: rtl;
                border: 1.5px solid #1a73e8; font-family: "Segoe UI", sans-serif; text-align: center;
            }
            .minimized { width: 60px!important; height: 60px!important; padding: 0!important; border-radius: 50%!important; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .minimized::before { content: "⚙️"; font-size: 30px; }
            .s-in { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 12px; font-size: 14px; margin-bottom: 10px; outline: none; box-sizing: border-box; }
            .d-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; margin-top: 8px; }
            .b-blue { background: #1a73e8; color: #fff; }
            .b-green { background: #28a745!important; color: #fff; }
            .ali-stats-wrapper { display: flex; justify-content: space-around; margin: 10px 0; padding: 12px; background: #f8f9fa; border-radius: 12px; border: 1px solid #eee; }
            .ali-cnt-val { padding: 4px 10px; border-radius: 8px; color: #fff; font-weight: bold; font-size: 16px; min-width: 45px; }
        `;
        document.head.appendChild(style);
    };

    // 2. Main Logic & Scraper
    const scrapePage = (current, limit) => {
        updateProgress(current, limit);
        
        document.querySelectorAll('table tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
                const invoiceId = cells[0].innerText.trim();
                if (invoiceId.length > 3 && !seenIds.has(invoiceId)) {
                    seenIds.add(invoiceId);
                    
                    let args = null;
                    const label = row.querySelector('label[onclick^="getDetails"]');
                    if (label) {
                        const match = label.getAttribute('onclick').match(/\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'/);
                        if (match) args = [match[1], match[2], match[3], match[4]];
                    }

                    savedRows.push({
                        id: invoiceId,
                        onlineOrder: cells[1].innerText.trim(),
                        node: row.cloneNode(true),
                        args: args
                    });
                }
            }
        });

        if (current < limit) {
            const nextBtn = Array.from(document.querySelectorAll('.pagination a, .pagination li'))
                                 .find(el => el.innerText.trim() == (current + 1));
            if (nextBtn) {
                nextBtn.click();
                setTimeout(() => scrapePage(current + 1, limit), 11000);
            } else {
                finalize();
            }
        } else {
            finalize();
        }
    };

    // 3. Finalize and Show Search UI
    const finalize = () => {
        const tableBody = document.querySelector('table tbody') || document.querySelector('table');
        tableBody.innerHTML = '';
        savedRows.forEach(row => tableBody.appendChild(row.node));

        const bodyContainer = document.getElementById('ali_main_body');
        bodyContainer.innerHTML = `
            <input type="text" id="sI" class="s-in" value="0" placeholder="بالفاتورة..">
            <input type="text" id="sO" class="s-in" placeholder="بالطلب (ERX)..">
            <button class="d-btn b-green" id="btn_main">فتح المطابق للبحث (0)</button>
            <button class="d-btn b-blue" id="btn_refresh" style="background:#6c757d">🔄 تحديث</button>
        `;

        const sI = document.getElementById('sI');
        const sO = document.getElementById('sO');
        const bM = document.getElementById('btn_main');

        const filterAction = () => {
            if (!sI.value.startsWith('0')) sI.value = '0' + sI.value.replace(/^0+/, '');
            const vI = sI.value.trim();
            const vO = sO.value.trim();
            
            tableBody.innerHTML = '';
            let count = 0;
            
            savedRows.forEach(row => {
                const matchI = (vI !== "0" && vI !== "" && row.id.indexOf(vI) !== -1);
                const matchO = (vO !== "" && row.onlineOrder.indexOf(vO) !== -1);
                
                if (matchI || matchO || (vI === "0" && vO === "")) {
                    tableBody.appendChild(row.node);
                    count++;
                }
            });
            
            document.getElementById('stat_rec').innerText = count;
            bM.innerText = `فتح المطابق للبحث (${count})`;
        };

        sI.oninput = sO.oninput = filterAction;
        bM.onclick = () => openMatchedTabs(sI.value.trim(), sO.value.trim(), bM);
        document.getElementById('btn_refresh').onclick = () => location.reload();
    };

    const openMatchedTabs = (vI, vO, btn) => {
        if (vI === "0" && vO === "") return alert("ابحث أولاً!");
        const list = savedRows.filter(row => (vI !== "0" && row.id.indexOf(vI) !== -1) || (vO !== "" && row.onlineOrder.indexOf(vO) !== -1));
        
        if (!list.length) return alert("لا توجد نتائج!");
        
        btn.disabled = true;
        list.forEach((row, i) => {
            setTimeout(() => {
                if (row.args) {
                    const url = `${window.location.origin}/ez_pill_web/getEZPill_Details?onlineNumber=${row.args[0].replace("ERX","")}&Invoice=${row.args[1]}&typee=${row.args[2]}&head_id=${row.args[3]}`;
                    window.open(url, "_blank");
                }
                if (i === list.length - 1) btn.disabled = false;
            }, i * 1200);
        });
    };

    // Helper functions (UI building, progress, etc.)
    // ... (rest of UI code)
})();

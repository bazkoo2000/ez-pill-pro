<button onclick="openModal()" style="margin: 20px; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">
    + إضافة صنف جديد
</button>

<div id="addItemModal" class="custom-modal-overlay">
    <div class="custom-modal-box">
        <div class="modal-header">
            <h3>إضافة صنف للجدول</h3>
            <span class="close-btn" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            <label>ابحث عن الصنف (بالكود أو الاسم)</label>
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="اكتب الكود أو اسم الدواء..." autocomplete="off" onkeyup="filterItems()">
                <div id="searchResults" class="results-list"></div>
            </div>
            <input type="hidden" id="selectedCode">
            <input type="hidden" id="selectedName">
        </div>
        <div class="modal-footer">
            <button onclick="closeModal()" class="btn-cancel">إلغاء</button>
            <button onclick="addRowToTable()" class="btn-add" id="btnAdd" disabled>إضافة للجدول</button>
        </div>
    </div>
</div>

<style>
    .custom-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(3px); z-index: 9999; justify-content: center; align-items: center; font-family: sans-serif; }
    .custom-modal-box { background: #fff; width: 500px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from {transform: translateY(-50px); opacity: 0;} to {transform: translateY(0); opacity: 1;} }
    .modal-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; color: #333; }
    .close-btn { cursor: pointer; font-size: 24px; color: #999; }
    .modal-body { padding: 20px; }
    .search-container { position: relative; }
    #searchInput { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
    #searchInput:focus { border-color: #007bff; outline: none; }
    .results-list { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #ddd; max-height: 200px; overflow-y: auto; z-index: 1000; display: none; }
    .result-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
    .result-item:hover { background-color: #f0f8ff; }
    .modal-footer { padding: 15px; background: #f8f9fa; text-align: right; border-top: 1px solid #ddd; }
    .btn-add, .btn-cancel { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-cancel { background: #ccc; margin-right: 10px; }
    .btn-add { background: #28a745; color: white; opacity: 0.5; cursor: not-allowed; }
    .btn-add:enabled { opacity: 1; cursor: pointer; }
</style>
<script>
    // ==========================================
    // بداية الجزء الثاني: قائمة الأصناف
    // ==========================================
    const itemsDB = [
    { "code": "100024042", "name": "Concor-Cor 2.5 mg Tablet 30pcs" },
    { "code": "100031023", "name": "Glucophage 1000 mg Tablet 30pcs" },
    { "code": "100615256", "name": "Lipanthyl 145 mg Tablet 30pcs" },
    { "code": "101068830", "name": "Forxiga Tablets 10 mg 28 Tablets" },
    { "code": "101075415", "name": "Jardiance Tablets 25 mg 30 Tab" },
    { "code": "100029855", "name": "Diamicron-Mr 30 mg Tablet 30pcs" },
    { "code": "100965871", "name": "Trajenta 5 mg 30 Tablets" },
    { "code": "100630632", "name": "Nebilet 5 mg Tablet 28pcs" },
    { "code": "100616451", "name": "Galvus Met 50/1000 mg Tabets 60" },
    { "code": "100032763", "name": "Actos 30 mg Tablet 30pcs" },
    { "code": "100632718", "name": "Co-Diovan 160/12.5 mg Tablet 28P" },
    { "code": "101255230", "name": "Synjardy 12.5/1000 Mg 60 Tablets" },
    { "code": "100031242", "name": "Ezetrol 10 mg Tablet 28pcs" },
    { "code": "100630042", "name": "Diovan 160 mg Tablet 28pcs" },
    { "code": "100633420", "name": "Coversyl 5 mg Tablet 30pcs" },
    { "code": "100630026", "name": "Diovan 80 mg Tablet 28pcs" },
    { "code": "101075407", "name": "Jardiance tablets 10 mg 30Tab" },
    { "code": "100648103", "name": "Exforge Hct 10mg/160mg/12.5mg Tablets 28" },
    { "code": "100621189", "name": "Janumet 50/850mg Tablets 56" },
    { "code": "100633622", "name": "Natrilix-Sr 1.5 mg Tablet 30pcs" },
    { "code": "100630683", "name": "Micardis 80 mg Tablet 28pcs" },
    { "code": "100633631", "name": "Aldactone 25 mg Tablet 20pcs" },
    { "code": "100023672", "name": "Coveram 5/5 mg Tablet 30pcs" },
    { "code": "100996976", "name": "Twynsta 80/5mg 28 Tablets" },
    { "code": "100029775", "name": "Trental 400 mg Tablet 20pcs" },
    { "code": "100629800", "name": "Atacand 16 mg Tablet 28pcs" },
    { "code": "100633286", "name": "Vastarel Mr 35 mg Tablet 60pcs" },
    { "code": "100629818", "name": "Atacand 8 mg Tablet 28pcs" },
    { "code": "100630131", "name": "Olmetec 20 mg Tablet 28pcs" },
    { "code": "100031251", "name": "Lipanthyl 200 mg Capsule" },
    { "code": "100026259", "name": "Inegy 20 mg/10 mg Tablet 28pcs" },
    { "code": "100632734", "name": "Micardis-Plus 80/12.5 mg Tablet 28pcs" },
    { "code": "101281219", "name": "Atozet 10 mg/20 mg 30 tablet" },
    { "code": "101318181", "name": "Xigduo XR 5/1000 mg 56 tablet" },
    { "code": "100023701", "name": "Coveram 10/10 mg Tablet 30pcs" },
    { "code": "101285228", "name": "Xigduo XR 10/1000 mg 28 tablet" },
    { "code": "100862311", "name": "Sevikar 20/5 mg Tablet 28 Piece" },
    { "code": "100630122", "name": "Micardis 40 mg Tablet 28pcs" },
    { "code": "100033635", "name": "Bi-Preterax 5 mg/1.25 mg Tablet 30pcs" },
    { "code": "100025521", "name": "Inderal 40 mg Tablet" },
    { "code": "100887593", "name": "Brilinta 90mg 56tablets" },
    { "code": "101023957", "name": "Entresto 50mg 28 Tablets" },
    { "code": "100630051", "name": "Olmetec 40 mg Tablet 28pcs" },
    { "code": "100025539", "name": "Inderal 10 mg Tablet" },
    { "code": "100023699", "name": "Coveram 10mg/5mg Tablet 30pcs" },
    { "code": "100862302", "name": "Sevikar 40/5 mg Tablet 28 piece" },
    { "code": "100601663", "name": "Pradaxa 110 mg Capsule 30pcs" },
    { "code": "100630392", "name": "Olmetec 20/12.5 mg Tablet 28pcs" },
    { "code": "101594910", "name": "Arena Plus 300/25 mg 30 Tablet" },
    { "code": "100907793", "name": "Kombiglyze-XR Tablets 2.5/1000mg 60 Pcs" },
    { "code": "100983657", "name": "Eliquis 5mg 60 Tablets" },
    { "code": "101255256", "name": "Synjardy 5/1000 Mg 60 Tablets" },
    { "code": "100630608", "name": "Riacavilol 25 mg Tablet 30pcs" },
    { "code": "100630405", "name": "Olmetec 40/12.5 mg Tablet 28pcs" },
    { "code": "100983649", "name": "Eliquis 2.5mg 60 Tablets" },
    { "code": "100648082", "name": "Exforge Hct 10mg/160mg/25mg Tablets 28" },
    { "code": "100604821", "name": "Co-Diovan 320/12.5 mg Tablet 28pcs" },
    { "code": "100996968", "name": "Twynsta 80/10mg 28 Tablets" },
    { "code": "100862329", "name": "Sevikar 40/10 mg Tablet 28 piece" },
    { "code": "101255248", "name": "Synjardy 12.5/850 Mg 60 Tablets" },
    { "code": "100864316", "name": "Gliptamet 50/1000 mg Tablet 56 piece" },
    { "code": "101059167", "name": "Glados 30 mg 30 Tablet" },
    { "code": "100640208", "name": "Co-Tabuvan 160/12.5 mg Tablets 30" },
    { "code": "100697280", "name": "Cardex 2.5 mg Tablet 30" },
    { "code": "100606317", "name": "Selecta 2.5 mg Tablet 30pcs" },
    { "code": "101325218", "name": "Ezechol 10 mg 30 Tablets" },
    { "code": "100641171", "name": "Tabuvan 160mg Tablets 30" },
    { "code": "100641163", "name": "Tabuvan 80mg Tablets 30" },
    { "code": "100864341", "name": "Gliptamet 50/850 mg Tablet 56 Piece" },
    { "code": "101146201", "name": "Claz MR 30 mg 30 Tablets" },
    { "code": "101641667", "name": "Divinus 10 mg 30 Tablet" },
    { "code": "100606341", "name": "Selecta Plus 5mg/12.5 mg Tablet 20pcs" },
    { "code": "100025555", "name": "Lopresor 50 mg Tablet 40pcs" },
    { "code": "100032296", "name": "Glim 4 mg Tablet 30pcs" },
    { "code": "100032368", "name": "Physiotens 0.4 mg Tablet 28pcs" },
    { "code": "100629973", "name": "Nootropil 800 mg Tab 30pcs" },
    { "code": "100630595", "name": "Riacavilol 12.5 mg Tablet 30pcs" },
    { "code": "100629842", "name": "Blopress 8 mg Tablet 28pcs" },
    { "code": "100632751", "name": "Sortiva-H 50/12.5 mg Tablet 30pcs" },
    { "code": "101163968", "name": "Tenoryl 5 mg 30 Tablets" },
    { "code": "100629851", "name": "Blopress 16 mg Tablet 28pcs" },
    { "code": "101066105", "name": "Jalra M tablet 50/1000 mg 60 tablets" },
    { "code": "101204053", "name": "Actosmet 15 mg/850 mg 56 Tablets" },
    { "code": "100630587", "name": "Riacavilol 6.25 mg Tablet 30pcs" },
    { "code": "100033627", "name": "Preterax 2.5/0.625 mg Tablet 30pcs" },
    { "code": "100632638", "name": "Esidrex 25 mg Tablet 20pcs" },
    { "code": "100632742", "name": "Teveten-Plus 600/12.5 mg Tablet 28pcs" },
    { "code": "100025547", "name": "Lopresor 100 mg Tablet 20pcs" },
    { "code": "100024755", "name": "Lescol-XL 80 mg Tablet 28pcs" },
    { "code": "100023066", "name": "Lorvast 10 mg Tablet 30pcs" },
    { "code": "100027083", "name": "Astatin 10 mg Tablet 30pcs" },
    { "code": "100023031", "name": "Tovast 10 mg Tablet 30pcs" },
    { "code": "101059175", "name": "Atorlip 10 mg 30 Tablet" },
    { "code": "101225903", "name": "Lipicure 10 mg 30 Tablet" },
    { "code": "100027391", "name": "Atorva 10 mg Tablet 30pcs" },
    { "code": "100632620", "name": "Lasix 40 mg Tablet 20pcs" },
    { "code": "100022733", "name": "Crestor 10 mg Tablet 28pcs" },
    { "code": "100823750", "name": "Ivarin 10 mg Tablet 30" },
    { "code": "101256232", "name": "Rozavi 10 Mg 28 Tablets" },
    { "code": "101043931", "name": "Diamicron-Mr 60 mg 30 Tablet" },
    { "code": "100633438", "name": "Coversyl 10 mg Tablet 30pcs" },
    { "code": "100619409", "name": "Glucophage XR 750mg Tablets 30" },
    { "code": "101225891", "name": "Formit Xr 750 mg 30 Tablets" },
    { "code": "101225882", "name": "Formit Xr 750 mg 60 Tablets" },
    { "code": "100887278", "name": "Xarelto Tablets 10 mg 10 Pcs" },
    { "code": "100031306", "name": "Glucophage 850 mg Tablet 30pcs" },
    { "code": "100633462", "name": "Amlor 10 mg Capsule 30pcs" },
    { "code": "100633139", "name": "Amvasc 10 mg Capsule 30pcs" },
    { "code": "100957555", "name": "Amlopine 10 mg 30 Caps" },
    { "code": "100632793", "name": "Exforge 5/160 mg Tablet 28pcs" },
    { "code": "100697301", "name": "Lotevan 5/ 160 mg Tablet 30" },
    { "code": "100022709", "name": "Crestor 20 mg Tablet 28pcs" },
    { "code": "100823741", "name": "Ivarin 20 mg Tablet 30" },
    { "code": "100022881", "name": "Concor 5 mg Tablet 30pcs" },
    { "code": "100606325", "name": "Selecta 5 mg Tablet 30pcs" },
    { "code": "100632726", "name": "Co-Diovan 160/25 mg Tablet 28pcs" },
    { "code": "100629834", "name": "Cozaar 50 mg Tablet 28pcs" },
    { "code": "100630114", "name": "Sortiva 50 mg Tablet 30pcs" },
    { "code": "100031365", "name": "Glucovance 500/2.5 mg Tablet 30pcs" },
    { "code": "100023357", "name": "Lorvast 20 mg Tablet 30pcs" },
    { "code": "100023040", "name": "Tovast 20 mg Tablet 30pcs" },
    { "code": "100027091", "name": "Astatin 20 mg Tablet 30pcs" },
    { "code": "100027403", "name": "Atorva 20 mg Tablet 30pcs" },
    { "code": "101225911", "name": "Lipicure 20 mg 30 Tablets" },
    { "code": "100031955", "name": "Januvia 100 mg Tablet 28pcs" },
    { "code": "100031314", "name": "Glucophage 500 mg Tablet 50pcs" },
    { "code": "100616443", "name": "Galvus Met 50/850 mg Tablets 60" },
    { "code": "100032536", "name": "Amaryl 3 mg Tablet 30pcs" },
    { "code": "100630384", "name": "Diovan 40 mg Tablet 28pcs" },
    { "code": "100648091", "name": "Exforge Hct 5mg/160mg/12.5mg Tablets 28" },
    { "code": "100632806", "name": "Exforge 10/160 mg Tablet 28pcs" },
    { "code": "100633171", "name": "Amlor 5 mg Capsule 30pcs" },
    { "code": "100633500", "name": "Amlopine 5 mg Capsule 30pcs" },
    { "code": "100633155", "name": "Amvasc 5 mg Capsule 30pcs" },
    { "code": "100627396", "name": "Amlocard 5mg Tablets 30" },
    { "code": "100029880", "name": "Glucovance 500/5 mg Tablet 30pcs" },
    { "code": "100630296", "name": "Plavix 75 mg Tablet 28pcs" },
    { "code": "100632961", "name": "Lorvast 40 mg Tablet 30pcs" },
    { "code": "100027104", "name": "Astatin 40 mg Tablet 30pcs" },
    { "code": "100023058", "name": "Tovast 40 mg Tablet 30pcs" },
    { "code": "100633121", "name": "Amvasc 2.5 mg Capsule 30pcs" },
    { "code": "100032501", "name": "Amaryl 2 mg Tablet 30pcs" },
    { "code": "100031357", "name": "Amaryl 1 mg Tablet 30pcs" },
    { "code": "100632451", "name": "Co-Diovan 80/12.5 mg Tablet 28pcs" },
    { "code": "100887260", "name": "Xarelto 20mg 28tablet" },
    { "code": "100029337", "name": "Actos 15 mg Tablet 30pcs" },
    { "code": "100632435", "name": "Atacand-Plus 16/12.5 mg Tablet 28pcs" },
    { "code": "100629826", "name": "Cozaar 100 mg Tablet 28pcs" },
    { "code": "100031293", "name": "Zocor 20 mg Tablet 28pcs" },
    { "code": "100005950", "name": "Omacor 1000 mg Capsule 28P" },
    { "code": "100632259", "name": "Diflucan 150 mg Capsule 1P" },
    { "code": "100022611", "name": "Caduet 5/10 mg Tablet 30pcs" },
    { "code": "101302171", "name": "Neurobion 30 Coated Tablets" },
    { "code": "100025053", "name": "Nexium 40 mg Tablet 28P" },
    { "code": "101281227", "name": "????? 10 ????/10 ???? 30 ???" },
    { "code": "100030821", "name": "Glim 3 mg Tablet 30P" },
    { "code": "101225356", "name": "Duetact 30/2 mg 30 Tablets" },
    { "code": "100655805", "name": "Ramipril Sandoz 5mg Tablet 20" },
    { "code": "100648074", "name": "Exforge Hct 5Mg/160Mg/25Mg Tablets 28" },
    { "code": "100630691", "name": "Adalat-La 30 Mg 30 Tablets" },
    { "code": "101177956", "name": "??????? ??????? 100 ???? 60 ???" },
    { "code": "100660145", "name": "ARENA 150MG TABLET 30" },
    { "code": "100651046", "name": "VEXAL XR 37.5MG CAPSULES 14" },
    { "code": "100008211", "name": "Euthyrox 25 mcg Tablet 100pcs" },
    { "code": "100008851", "name": "Methycobal 500 Mcg 30 Tab" },
    { "code": "100009011", "name": "Euthyrox 100mcg Tablet 100pcs" },
    { "code": "100004893", "name": "One-Alpha 1 Mcg Capsule 100pcs" },
    { "code": "100004906", "name": "One-Alpha 0.25 Mcg Capsule 30pcs" },
    { "code": "100004957", "name": "Pyridoxin 40 mg 20 Tablets" },
    { "code": "100004973", "name": "Wheat-Germ-Oil 300 mg Capsule 30pcs" },
    { "code": "100005044", "name": "Kalsis 500 mg Capsule 30pcs" },
    { "code": "100005052", "name": "Osteocare Tablet 30 Tab" },
    { "code": "100005108", "name": "Gloclav 625 mg Tablet 20pcs" },
    { "code": "100005191", "name": "One-Alpha 0.25 Mcg Capsule 100pcs" },
    { "code": "100005319", "name": "Gentaplex Capsule 36pcs" },
    { "code": "100005343", "name": "Ok4 Capsule 30pcs" },
    { "code": "100005351", "name": "Aphrofem Capsule 40pcs" },
    { "code": "100005589", "name": "Feromin 190 mg 30 Tab" },
    { "code": "100005685", "name": "Gloclav 1 gm Tablet 14pcs" },
    { "code": "100005731", "name": "Itrazol 100 mg Capsule 15pcs" },
    { "code": "100005749", "name": "Tracon 100 mg Capsule 4pcs" },
    { "code": "100005757", "name": "Tracon 100 mg Capsule 15pcs" },
    { "code": "100005781", "name": "Fungimid 150 mg Capsule 1pc" },
    { "code": "100005802", "name": "Lamisil 250 mg Tablet 28pcs" },
    { "code": "100005829", "name": "Ciprocin 500 mg Tablet 10pcs" },
    { "code": "100005861", "name": "Ciproflacin 500 mg Tablet 10pcs" },
    { "code": "100005917", "name": "Cipromid 500 mg Tablet 10pcs" },
    { "code": "100005941", "name": "Maxepa-Forte 640 mg Capsule 30pcs" },
    { "code": "100005976", "name": "Ferose-F 30 Tab" },
    { "code": "100005984", "name": "Ferose 100 mg 30 Tab" },
    { "code": "100006055", "name": "Zamur 500 mg Tablet 10pcs" },
    { "code": "100006071", "name": "U-Cef 500 mg Tablet 10pcs" },
    { "code": "100006119", "name": "Ciprobay 500 mg Tablet 10pcs" },
    { "code": "100006135", "name": "Ciprocin 250 mg Tablet 10pcs" },
    { "code": "100006143", "name": "Ciproxen 500 mg Tablet 10pcs" },
    { "code": "100006151", "name": "Sarf 750 mg Tablet 10pcs" },
    { "code": "100006207", "name": "Ciproquin 500 mg Tablet 10pcs" },
    { "code": "100006231", "name": "Amoclan-Fort 625 mg Tablet 15pcs" },
    { "code": "100006258", "name": "Gloclav 375 mg Tablet 20pcs" },
    { "code": "100006266", "name": "Julmentin 375 mg Tablet 20pcs" },
    { "code": "100006274", "name": "Amoclan 375 mg Tablet 20pcs" },
    { "code": "100006338", "name": "Sevenseas-Oad Capsule 60pcs" },
    { "code": "100006354", "name": "Stresstabs-Zinc 30 Tab" },
    { "code": "100006434", "name": "Medrol 4 mg Tablet 30pcs" },
    { "code": "100006451", "name": "Prednisolon 5 mg Tablet 30pcs" },
    { "code": "100006557", "name": "Augmentin 625 mg Tablet 20pcs" },
    { "code": "100006581", "name": "Zinnat 500 mg Tablet 10pcs" },
    { "code": "100006590", "name": "Cefutil 250 mg Tablet 10pcs" },
    { "code": "100006629", "name": "Zinnat 250 mg 14 Tablet" },
    { "code": "100006645", "name": "Cefuzime 250 mg Tablet 10pcs" },
    { "code": "100006901", "name": "Lamisil 250 mg Tablet 14pcs" },
    { "code": "100006910", "name": "Lamifen 250 mg Tablet 7pcs" },
    { "code": "100007031", "name": "Sevenseas-Vitrite-Iron Capsule 60pcs" },
    { "code": "100007082", "name": "Vitamin-B-Complex 40 Tab" },
    { "code": "100007120", "name": "Cloracef-Forte 500 mg Capsule 16pcs" },
    { "code": "100007138", "name": "Cloracef 250 mg Capsule 16pcs" },
    { "code": "100007146", "name": "Cephadar-Forte 500 mg Capsule 20pcs" },
    { "code": "100007162", "name": "Omnicef 300 mg Capsule 10pcs" },
    { "code": "100007197", "name": "Lamifen 250 mg Tablet 14pcs" },
    { "code": "100007226", "name": "Vibramycin 100 mg Tablet 10pcs" },
    { "code": "100007269", "name": "Ciproxen 250 mg Tablet 10pcs" },
    { "code": "100007277", "name": "Cipropharm 500 mg Tablet 10pcs" },
    { "code": "100007285", "name": "Minirin-Melt 60 Mcg Tablet 30pcs" },
    { "code": "100007293", "name": "Factive 320 mg Tablet 5pcs" },
    { "code": "100007306", "name": "Factive 320 mg Tablet 7pcs" },
    { "code": "100007314", "name": "Emicipro 500 mg Tablet 10pcs" },
    { "code": "100007365", "name": "Azi-Once 250 mg Capsule 6pcs" },
    { "code": "100007373", "name": "Pollen-B Tablet 30pcs" },
    { "code": "100007429", "name": "Pharmaton Capsule 30pcs" },
    { "code": "100007437", "name": "V2-Plus 24 Capsules" },
    { "code": "100007605", "name": "Sarf 500 mg Tablet 10pcs" },
    { "code": "100007613", "name": "Ciflox 500 mg Tablet 10pcs" },
    { "code": "100007621", "name": "Ciprodar 500 mg Tablet 10pcs" },
    { "code": "100007664", "name": "Azomycin 250 mg Capsule 6pcs" },
    { "code": "100007672", "name": "Amoclan 1 gm Tablet 14pcs" },
    { "code": "100007681", "name": "Julmentin-Forte 625 mg Tablet 20pcs" },
    { "code": "100007699", "name": "Augmentin 1 gm Tablet 14pcs" },
    { "code": "100007701", "name": "Augmentin 375 mg Tablet 20pcs" },
    { "code": "100007710", "name": "Megamox 1 gm Tablet 14pcs" },
    { "code": "100007728", "name": "Megamox 375 mg Tablet 20pcs" },
    { "code": "100007736", "name": "Curam 625 mg Tablet 20pcs" },
    { "code": "100007744", "name": "Ospamox 500 mg Tablet 20pcs" },
    { "code": "100007752", "name": "Klavox 1 gm Tablet 14pcs" },
    { "code": "100007816", "name": "Neurorubine-Forte 20 Tab" }
    ];
// دوال فتح وإغلاق الدايلوج
    function openModal() {
        document.getElementById('addItemModal').style.display = 'flex';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchInput').focus();
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('btnAdd').disabled = true;
    }

    function closeModal() {
        document.getElementById('addItemModal').style.display = 'none';
    }

    // دالة البحث
    function filterItems() {
        const input = document.getElementById('searchInput').value.toLowerCase();
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = ''; 

        if (input.length < 1) { resultsDiv.style.display = 'none'; return; }

        const filtered = itemsDB.filter(item => 
            (item.code && item.code.toString().toLowerCase().includes(input)) || 
            (item.name && item.name.toLowerCase().includes(input))
        );

        if (filtered.length > 0) {
            resultsDiv.style.display = 'block';
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.innerHTML = `<strong>${item.code}</strong> - ${item.name}`;
                div.onclick = function() { selectItem(item); };
                resultsDiv.appendChild(div);
            });
        } else {
            resultsDiv.style.display = 'none';
        }
    }

    // دالة اختيار الصنف
    function selectItem(item) {
        document.getElementById('searchInput').value = item.name;
        document.getElementById('selectedCode').value = item.code;
        document.getElementById('selectedName').value = item.name;
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('btnAdd').disabled = false;
        document.getElementById('btnAdd').focus();
    }

    // دالة إضافة الصف للجدول
    function addRowToTable() {
        const code = document.getElementById('selectedCode').value;
        const name = document.getElementById('selectedName').value;
        const tbody = document.getElementById('itemsBody');

        const newRowHTML = `
            <tr style="background-color:#fff" title="New Item">
                <td align="center" style="font-weight:bold"><input type="checkbox" class="checkk" checked onchange="notMatched(this);"></td>
                <td class="itemCode" align="center" style="font-weight:bold">${code}</td>
                <td class="itemName" align="center" style="font-weight:bold">${name}</td>
                <td align="center" style="font-weight:bold"><input type="text" class="qty num" style="width:60px;text-align:center" onblur="calcEnddate(this);remainingCalc(this);" value=""></td>
                <td align="center" style="font-weight:bold"><input type="text" class="boxsize num" style="width:60px;text-align:center" onblur="calcEnddate(this);remainingCalc(this);" value=""></td>
                <td align="center" style="font-weight:bold"><input type="text" class="dose num" style="width:60px;text-align:center" onblur="calcEnddate(this);remainingCalc(this);" value=""></td>
                <td align="center" style="font-weight:bold">
                    <select class="every" onblur="calcEnddate(this);remainingCalc(this);">
                        <option value="">Select Freq.</option><option value="6">6 H</option><option value="8">8 H</option><option value="12">12 H</option><option value="24">24 H</option><option value="48">48 H</option>
                    </select>
                </td>
                <td align="center" style="font-weight:bold"><input type="time" class="starttime" style="width:100px" value=""></td>
                <td align="center" class="startDates" style="font-weight:bold"><input type="date" class="startdate" style="width:150px" value="" onchange="remainingCalc(this);"></td>
                <td align="center" style="font-weight:bold"><input type="date" class="enddate" style="width:150px" onchange="notMatched();remainingCalc(this);" value=""></td>
                <td align="center" style="font-weight:bold"><input type="text" class="notes" style="width:100px" value=""></td>
                <td class="expiry_date" align="center" style="font-weight:bold"></td>
                <td class="remain" align="center" style="font-weight:bold">NA</td>
                <td class="InvoiceNumber" align="center" style="font-weight:bold;display:none"></td>
                <td class="criticals" align="center" style="font-weight:bold">Normal</td>
                <td align="center" style="font-weight:bold">
                    <button class="btn btn-danger" onclick="duplicate(this)">Duplicate</button>
                    <button class="btn btn-danger" style="background:red" onclick="this.closest('tr').remove()">Delete</button>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', newRowHTML);
        closeModal();
    }
</script>

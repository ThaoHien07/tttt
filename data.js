// Data definition for Phuc An Retail (18 Stores, 60,000 Transactions Model)
const PHUC_AN_DATA = {
  company: {
    name: "CĂ´ng ty BĂ¡n láº» PhĂºc An (Phuc An Retail JSC)",
    storesCount: 18,
    monthlyTransactions: 60000,
    sampleTransactionsCount: 1006,
    fieldsCount: 15,
    fieldsList: [
      "Ma_Giao_Dich", "Ngay_Gio_Giao_Dich", "Ma_Cua_Hang", "Ten_Cua_Hang", "Khu_Vuc",
      "Ma_San_Pham", "Ten_San_Pham", "Nganh_Hang", "So_Luong", "Don_Gia",
      "Thanh_Tien", "Gia_Von_COGS", "Trang_Thai_Don", "Ma_Giao_Dich_Goc", "Tien_Hoan_Tra"
    ],
    currentPeriod: { code: "2026-10", name: "ThĂ¡ng 10/2026", days: 31 },
    comparisonPeriod: { code: "2026-09", name: "ThĂ¡ng 09/2026", days: 30 }
  },

  categories: [
    { id: "CAT01", name: "Äiá»‡n gia dá»¥ng", defaultMargin: 0.32, targetShare: 0.35 },
    { id: "CAT02", name: "Thiáº¿t bá»‹ sá»‘ & Phá»¥ kiá»‡n", defaultMargin: 0.22, targetShare: 0.30 },
    { id: "CAT03", name: "ChÄƒm sĂ³c sá»©c khá»e & LĂ m Ä‘áº¹p", defaultMargin: 0.45, targetShare: 0.20 },
    { id: "CAT04", name: "Gia dá»¥ng tiá»‡n Ă­ch thĂ´ng minh", defaultMargin: 0.38, targetShare: 0.15 }
  ],

  // Stores are dynamically aggregated from the uploaded/active dataset (no hardcoded stores)
  stores: [],

  // Defect metrics in raw sheets (1.006 dĂ²ng máº«u chuáº©n & 60.000 dĂ²ng thá»±c táº¿)
  rawMetrics: {
    totalRows: 1006,
    totalFields: 15,
    duplicateRows: 34,
    cancelledRows: 42,
    inconsistentReturnsRows: 58,
    cleanRows: 930,
    monthlyTotalRows: 60000,
    monthlyDuplicateRows: 1842,
    monthlyCancelledRows: 2150,
    monthlyInconsistentReturnsRows: 3420,
    monthlyCleanRows: 56008,
    rawTotalRevenue: 53130000000, // 53.13 tá»·
    cleanTotalRevenue: 49470000000, // 49.47 tá»·
    cleanTotalCOGS: 33930000000,
    cleanTotalGrossProfit: 15540000000,
    targetTotalRevenue: 51000000000,
    targetTotalGrossProfit: 16320000000
  },

  // 9-Step Pipeline Definitions matching User's Flowchart
  pipelineSteps: [
    { step: 1, title: "1. Dá»® LIá»†U Äáº¦U VĂ€O", desc: "File Excel bĂ¡n hĂ ng thĂ´: 1.006 dĂ²ng â€¢ 15 trÆ°á»ng", status: "completed" },
    { step: 2, title: "2. KIá»‚M TRA Cáº¤U TRĂC", desc: "TĂªn cá»™t â€¢ kiá»ƒu dá»¯ liá»‡u â€¢ Ä‘á»‹nh dáº¡ng ngĂ y â€¢ trÆ°á»ng báº¯t buá»™c", status: "pending" },
    { step: 3, title: "3. LĂ€M Sáº CH Dá»® LIá»†U", desc: "Chuáº©n hĂ³a khoáº£ng tráº¯ng & ngĂ y thĂ¡ng â€¢ Ă´ trá»‘ng Ä‘á»•i tráº£", status: "pending" },
    { step: 4, title: "4. KIá»‚M TRA CHáº¤T LÆ¯á»¢NG", desc: "MĂ£ giao dá»‹ch â€¢ sá»‘ lÆ°á»£ng â€¢ Ä‘Æ¡n giĂ¡ â€¢ thĂ nh tiá»n â€¢ mĂ£ gá»‘c", status: "pending" },
    { step: 5, title: "5. GHI NHáº¬N NGOáº I Lá»†", desc: "RĂ  soĂ¡t mĂ£ láº·p / mĂ£ gá»‘c khĂ´ng khá»›p â€¢ vĂ²ng láº·p Ä‘iá»u chá»‰nh", status: "pending" },
    { step: 6, title: "6. Xá»¬ LĂ & Tá»”NG Há»¢P", desc: "Doanh thu â€¢ 18 cá»­a hĂ ng â€¢ SP â€¢ phĂ¢n loáº¡i hoĂ n táº¥t / há»§y / tráº£", status: "pending" },
    { step: 7, title: "7. XĂC MINH Káº¾T QUáº¢", desc: "Äá»‘i chiáº¿u: ThĂ nh tiá»n = SL Ă— ÄÆ¡n giĂ¡; Tiá»n hoĂ n khá»›p 100%", status: "pending" },
    { step: 8, title: "8. BĂO CĂO / DASHBOARD", desc: "Bá»™ dá»¯ liá»‡u sáº¡ch + KPI 18 CH + Biá»ƒu Ä‘á»“ + Xáº¿p háº¡ng Æ°u tiĂªn", status: "pending" },
    { step: 9, title: "9. PHáº¢N Há»’I & Cáº¢I TIáº¾N", desc: "Ghi nháº­n lá»—i nguá»“n â€¢ cáº­p nháº­t quy táº¯c â€¢ láº·p láº¡i bÆ°á»›c 2", status: "pending" }
  ],

  // Knowledge base for AI chat queries
  aiKnowledge: {
    systemOverview: "Há»‡ thá»‘ng AI Agent BĂ¡n láº» PhĂºc An váº­n hĂ nh theo chuáº©n BPMN 3 giai Ä‘oáº¡n: Chuáº©n bá»‹ & LĂ m sáº¡ch dá»¯ liá»‡u -> Táº¡o BĂ¡o cĂ¡o Quáº£n trá»‹ -> Äá»‘i chiáº¿u & Ra quyáº¿t Ä‘á»‹nh.",
    ch03Analysis: "Cá»­a hĂ ng PhĂºc An Hai BĂ  TrÆ°ng (CH03) lĂ  trÆ°á»ng há»£p kinh Ä‘iá»ƒn cá»§a 'Báº«y Doanh thu'. Doanh thu danh nghÄ©a tÄƒng +15.5% (tá»« 2.9 tá»· lĂªn 3.35 tá»·) nhÆ°ng Lá»£i nhuáº­n gá»™p giáº£m sá»‘c -24.3% (tá»« 960 triá»‡u xuá»‘ng 727 triá»‡u). NguyĂªn nhĂ¢n: Cá»­a hĂ ng Ä‘Ă£ xáº£ máº¡nh cĂ¡c sáº£n pháº©m Thiáº¿t bá»‹ sá»‘ (CAT02) giáº£m giĂ¡ sá»‘c vá»›i biĂªn lá»£i nhuáº­n chá»‰ 12-14%, trong khi ngĂ nh hĂ ng biĂªn cao (CAT03) bá»‹ sá»¥t giáº£m tá»· trá»ng nghiĂªm trá»ng.",
    ch15Analysis: "Cá»­a hĂ ng PhĂºc An BĂ¬nh Tháº¡nh (CH15) cĂ³ tá»· lá»‡ Ä‘á»•i tráº£ lĂªn tá»›i 14.8% (má»©c cáº£nh bĂ¡o Ä‘á» lĂ  >5%). 74% lĂ½ do Ä‘á»•i tráº£ Ä‘Æ°á»£c ghi nháº­n lĂ  'KhĂ¡ch khĂ´ng biáº¿t cĂ¡ch sá»­ dá»¥ng' hoáº·c 'Sáº£n pháº©m khĂ´ng Ä‘Ăºng quáº£ng cĂ¡o'. Äiá»u nĂ y cho tháº¥y nhĂ¢n viĂªn tÆ° váº¥n bá»‹ Ă¡p lá»±c doanh sá»‘ Ä‘Ă£ tÆ° váº¥n phĂ³ng Ä‘áº¡i tĂ­nh nÄƒng dĂ²ng mĂ¡y lĂ m Ä‘áº¹p Ä‘áº¯t tiá»n CAT03. Äá»•i tráº£ Ä‘Ă£ bĂ o mĂ²n hÆ¡n 180 triá»‡u Ä‘á»“ng lá»£i nhuáº­n vĂ  chi phĂ­ xá»­ lĂ½ hĂ ng hoĂ n.",
    ch04Analysis: "Cá»­a hĂ ng PhĂºc An HoĂ n Kiáº¿m (CH04) trÆ°á»›c Ä‘Ă¢y Ä‘Æ°á»£c nhĂ¢n viĂªn bĂ¡o cĂ¡o tÄƒng trÆ°á»Ÿng tá»‘t do ghĂ©p sai khoáº£ng thá»i gian: láº¥y 45 ngĂ y ká»³ trÆ°á»›c (bao gá»“m cáº£ Ä‘á»£t lá»… 2/9) Ä‘á»ƒ so vá»›i 30 ngĂ y ká»³ nĂ y. Sau khi Agent Ä‘á»“ng bá»™ Ä‘Ăºng ká»³ Ä‘á»‘i chiáº¿u theo sá»‘ ngĂ y chuáº©n hĂ³a, doanh thu bĂ¬nh quĂ¢n má»—i ngĂ y thá»±c táº¿ giáº£m -7.2%!",
    ch08Analysis: "Cá»­a hĂ ng PhĂºc An Quáº£ng Ninh (CH08) chá»‰ Ä‘áº¡t 68.5% má»¥c tiĂªu doanh thu, Ä‘Æ¡n há»§y chiáº¿m 8.2%. Tá»“n kho trĂªn há»‡ thá»‘ng bĂ¡o cĂ³ hĂ ng nhÆ°ng thá»±c táº¿ kho váº­t lĂ½ Ä‘Ă£ háº¿t, dáº«n tá»›i tá»· lá»‡ há»§y Ä‘Æ¡n cao khi khĂ¡ch Ä‘áº·t cá»c."
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PHUC_AN_DATA;
}


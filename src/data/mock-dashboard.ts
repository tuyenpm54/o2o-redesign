export const MOCK_LIVE_PULSE = {
  success: true,
  data: {
    kitchenLagCount: 3,
    neglectedTablesCount: 2,
    stockoutCount: 5,
    activeTablesCount: 15,
    timestamp: Date.now(),
    liveRevenue: 4500000,
    todayRevenue: 28500000,
    queueVolumes: {
      pending_to_confirmed: 12,
      confirmed_to_cooking: 45,
      cooking_to_ready: 18,
      ready_to_served: 5
    },
    hotItems: [
      { name: "Cơm chiên hải sản", qty: 15 },
      { name: "Lẩu Thái Tomyum", qty: 8 },
      { name: "Bò lúc lắc", qty: 6 }
    ],
    urgentFeed: [
      { id: "1", type: "review", tableid: "A-12", content: "Đánh giá 1 sao: Lên món quá chậm, đồ ăn thì nguội.", timestamp: Date.now() - 5 * 60000, label: "5 phút trước" },
      { id: "2", type: "request", tableid: "T-05", content: "Khách hối xuất món (Quá 25 phút chưa lên thức ăn).", timestamp: Date.now() - 12 * 60000, label: "12 phút trước" },
      { id: "3", type: "request", tableid: "VIP-2", content: "Yêu cầu dọn dẹp bàn do đổ nước.", timestamp: Date.now() - 25 * 60000, label: "25 phút trước" }
    ]
  }
};

export const MOCK_SLA_TRACKER = {
  success: true,
  data: {
    violations: {
      pending_to_confirmed: { count: 2, total: 35, avg_time: 1.5 },
      confirmed_to_cooking: { count: 3, total: 33, avg_time: 4.0 },
      cooking_to_ready: { count: 5, total: 30, avg_time: 16.5 },
      ready_to_served: { count: 1, total: 25, avg_time: 2.2 }
    },
    endToEnd: { avg: 22.5, worst: 45, isWithinSla: false, target: 20 },
    slaConfig: {
      pending_to_confirmed: { target: 1 },
      confirmed_to_cooking: { target: 3 },
      cooking_to_ready: { target: 15 },
      ready_to_served: { target: 2 }
    },
    totalOrdersToday: 410,
    servedToday: 405
  }
};

export const MOCK_TABLE_OCCUPANCY = {
  success: true,
  data: {
    active: 18,
    total: 25,
    occupancyRate: 72,
    guestCount: 65,
    avgGuestsPerTable: 3.6,
    avgSessionMinutes: 45,
    activeTablesList: [
      { id: 'T1', areaName: 'Tầng 1', guestCount: 4, status: 'WAITING', idleMinutes: 2, sessionStartMinutes: 5 },
      { id: 'T2', areaName: 'Tầng 1', guestCount: 2, status: 'WAITING', idleMinutes: 8, sessionStartMinutes: 8 },
      { id: 'T3', areaName: 'Tầng 1', guestCount: 3, status: 'SERVING', idleMinutes: 12, sessionStartMinutes: 25 },
      { id: 'T4', areaName: 'Tầng 1', guestCount: 5, status: 'SERVING', idleMinutes: 5, sessionStartMinutes: 18 },
      { id: 'T5', areaName: 'Tầng 1', guestCount: 0, status: 'EMPTY', idleMinutes: 0, sessionStartMinutes: 0 },
      { id: 'V1', areaName: 'Phòng VIP', guestCount: 4, status: 'DONE', idleMinutes: 22, sessionStartMinutes: 65 },
      { id: 'V2', areaName: 'Phòng VIP', guestCount: 2, status: 'DONE', idleMinutes: 35, sessionStartMinutes: 70 },
      { id: 'V3', areaName: 'Phòng VIP', guestCount: 0, status: 'EMPTY', idleMinutes: 0, sessionStartMinutes: 0 },
      { id: 'OUT-1', areaName: 'Sân Vườn', guestCount: 4, status: 'DONE', idleMinutes: 18, sessionStartMinutes: 55 },
      { id: 'OUT-2', areaName: 'Sân Vườn', guestCount: 0, status: 'EMPTY', idleMinutes: 0, sessionStartMinutes: 0 }
    ]
  }
};

export const MOCK_MENU_EFFICIENCY = {
  success: true,
  data: {
    // Hero metrics (average seconds)
    avgBrowse: 165,       // 2:45 — QR scan → first cart add
    avgDecide: 62,        // 1:02 — first cart add → submit order
    avgTotal: 252,         // 4:12 — QR scan → submit order
    dropOffRate: 4.2,     // % scanned but never ordered
    // Comparison vs previous period
    browseDelta: -12,     // % change vs last period (negative = improved)
    decideDelta: 3,
    totalDelta: -8,
    dropOffDelta: -1.1,
    // Daily trend (seconds)
    trend: [
      { date: '15/04', browse: 195, decide: 72, total: 290 },
      { date: '16/04', browse: 180, decide: 65, total: 268 },
      { date: '17/04', browse: 172, decide: 68, total: 260 },
      { date: '18/04', browse: 160, decide: 58, total: 235 },
      { date: '19/04', browse: 155, decide: 60, total: 238 },
      { date: '20/04', browse: 148, decide: 55, total: 220 },
      { date: '21/04', browse: 142, decide: 50, total: 210 },
    ],
    // Funnel (absolute numbers)
    funnel: [
      { step: 'Quét QR', count: 680, rate: 100 },
      { step: 'Mở menu', count: 665, rate: 97.8 },
      { step: 'Xem chi tiết món', count: 580, rate: 85.3 },
      { step: 'Thêm vào giỏ', count: 572, rate: 84.1 },
      { step: 'Gửi đơn hàng', count: 548, rate: 80.6 },
    ],
    // Nguồn gốc món đầu tiên được thêm vào giỏ hàng — map 1:1 với module/source thật trong hệ thống
    // Tracking: cart_items.source hoặc order_items.suggestion_source khi thêm vào giỏ
    firstItemSource: [
      { source: 'menu_grid',       label: 'Menu chính (lướt)',           count: 285, percent: 42, color: '#0f172a' },
      { source: 'onboarding',      label: 'Onboarding Wizard',           count: 137, percent: 20, color: '#6366f1' },
      { source: 'best_seller',     label: 'Siêu phẩm bán chạy',         count: 89,  percent: 13, color: '#ef4444' },
      { source: 'search',          label: 'Ô tìm kiếm',                  count: 75,  percent: 11, color: '#f59e0b' },
      { source: 'history',         label: 'Món bạn từng chọn',           count: 48,  percent: 7,  color: '#10b981' },
      { source: 'combo',           label: 'Combo tiết kiệm',             count: 27,  percent: 4,  color: '#8b5cf6' },
      { source: 'cart_recommend',  label: 'Gợi ý khi thanh toán',        count: 14,  percent: 2,  color: '#06b6d4' },
      { source: 'flash_sale',      label: 'Flash Sale / Banner',          count: 5,   percent: 1,  color: '#ec4899' },
    ],
    // Hành vi đặt món — các con số này đo được từ dữ liệu order_items + cart_items thực tế
    // Không cần client tracking event, chỉ cần query database
    orderingBehavior: {
      // Trung bình số món trong giỏ khi bấm gọi lần 1 (= AVG count cart_items khi round_number=1)
      avgItemsFirstOrder: 3.4,
      // Trung bình số lượt gọi món trên 1 bàn (= AVG count order_rounds per table_session)
      avgRoundsPerTable: 2.1,
      // Tỉ lệ khách chỉ gọi đúng 1 lượt rồi thanh toán (= % table_sessions có 1 round)
      singleRoundRate: 38,
      // Tỉ lệ khách gọi ≥3 lượt (= % table_sessions có ≥3 rounds — nghĩa là menu hấp dẫn)
      multiRoundRate: 25,
    },
    // So sánh trước/sau khi đổi menu — null nếu chưa có lần đổi menu nào được ghi nhận
    // Chủ quán đánh dấu "Tôi đã đổi menu" trên trang Admin → hệ thống tự snapshot metrics tại ngày đó
    menuChange: {
      changeDate: '18/04/2026',
      changeLabel: 'Tái cấu trúc Category + Thêm ảnh lớn',
      before: { avgBrowse: 185, avgTotal: 278, dropOff: 5.1 },
      after:  { avgBrowse: 148, avgTotal: 220, dropOff: 3.8 },
    }
    // Set menuChange = null to simulate "chưa đổi menu lần nào"
  }
};

// ── MODEL C: Counter Dispatch Center ──
export const MOCK_ORDER_QUEUE = {
  success: true,
  data: {
    // Aggregated metrics
    activeOrderCount: 12,
    totalCustomersToday: 87,
    avgFulfillmentMinutes: 8.5,
    liveRevenue: 3200000,
    avgBillAmount: 85000,
    // Ready Board: orders cooked, waiting for pickup
    readyOrders: [
      { orderId: '#C-041', customerName: 'Minh Anh', itemCount: 3, readyAt: Date.now() - 2 * 60000, waitingMinutes: 2 },
      { orderId: '#C-038', customerName: 'Khách lẻ', itemCount: 1, readyAt: Date.now() - 7 * 60000, waitingMinutes: 7 },
      { orderId: '#C-035', customerName: 'Thanh Hà', itemCount: 4, readyAt: Date.now() - 13 * 60000, waitingMinutes: 13 },
    ],
    // Active Queue: orders currently being processed
    activeOrders: [
      { orderId: '#C-045', customerName: 'Khách lẻ', itemCount: 2, status: 'pending', createdAt: Date.now() - 1 * 60000, waitingMinutes: 1 },
      { orderId: '#C-044', customerName: 'Đức Trí', itemCount: 3, status: 'pending', createdAt: Date.now() - 3 * 60000, waitingMinutes: 3 },
      { orderId: '#C-043', customerName: 'Khách lẻ', itemCount: 1, status: 'cooking', createdAt: Date.now() - 5 * 60000, waitingMinutes: 5 },
      { orderId: '#C-042', customerName: 'Quỳnh Như', itemCount: 5, status: 'cooking', createdAt: Date.now() - 8 * 60000, waitingMinutes: 8 },
      { orderId: '#C-040', customerName: 'Phúc An', itemCount: 2, status: 'cooking', createdAt: Date.now() - 11 * 60000, waitingMinutes: 11 },
      { orderId: '#C-039', customerName: 'Khách lẻ', itemCount: 4, status: 'cooking', createdAt: Date.now() - 14 * 60000, waitingMinutes: 14 },
    ]
  }
};

export const MOCK_ANALYTICS = {
  success: true,
  data: {
    trend: [
      { date: '01/04', doanhThu: 15000000, soDon: 45, soKhach: 60, soLuotGoiMon: 110, tyleO2O: 85 },
      { date: '02/04', doanhThu: 18500000, soDon: 52, soKhach: 71, soLuotGoiMon: 140, tyleO2O: 88 },
      { date: '03/04', doanhThu: 14200000, soDon: 41, soKhach: 55, soLuotGoiMon: 95, tyleO2O: 82 },
      { date: '04/04', doanhThu: 22000000, soDon: 65, soKhach: 85, soLuotGoiMon: 175, tyleO2O: 90 },
      { date: '05/04', doanhThu: 25500000, soDon: 72, soKhach: 95, soLuotGoiMon: 210, tyleO2O: 92 },
      { date: '06/04', doanhThu: 19800000, soDon: 55, soKhach: 75, soLuotGoiMon: 150, tyleO2O: 86 },
      { date: '07/04', doanhThu: 28000000, soDon: 80, soKhach: 110, soLuotGoiMon: 245, tyleO2O: 94 }
    ],
    peakHours: [
      { gio: '10h', doanhThu: 1500000, soDon: 10 },
      { gio: '11h', doanhThu: 4500000, soDon: 25 },
      { gio: '12h', doanhThu: 8500000, soDon: 45 },
      { gio: '13h', doanhThu: 6500000, soDon: 35 },
      { gio: '14h', doanhThu: 2500000, soDon: 15 },
      { gio: '17h', doanhThu: 3000000, soDon: 18 },
      { gio: '18h', doanhThu: 7500000, soDon: 40 },
      { gio: '19h', doanhThu: 12500000, soDon: 65 },
      { gio: '20h', doanhThu: 9000000, soDon: 48 },
      { gio: '21h', doanhThu: 4000000, soDon: 20 }
    ],
    peakDays: [
      { ngay: 'Thứ 2', doanhThu: 14200000, soDon: 41 },
      { ngay: 'Thứ 3', doanhThu: 15000000, soDon: 45 },
      { ngay: 'Thứ 4', doanhThu: 18500000, soDon: 52 },
      { ngay: 'Thứ 5', doanhThu: 19800000, soDon: 55 },
      { ngay: 'Thứ 6', doanhThu: 22000000, soDon: 65 },
      { ngay: 'Thứ 7', doanhThu: 28000000, soDon: 80 },
      { ngay: 'Chủ Nhật', doanhThu: 25500000, soDon: 72 }
    ],
    suggestedItems: [
      { id: '1', name: 'Sushi Cá Hồi', img: '', source: 'best_seller', qty: 24, revenue: 1200000 },
      { id: '2', name: 'Súp Miso Hảo Hạng', img: '', source: 'onboarding', qty: 15, revenue: 450000 },
      { id: '3', name: 'Trà Sữa Olong Nướng', img: '', source: 'combo', qty: 32, revenue: 1600000 },
      { id: '4', name: 'Sashimi Tổng Hợp', img: '', source: 'history', qty: 8, revenue: 2400000 },
      { id: '5', name: 'Salad Rong Biển', img: '', source: 'cart_recommend', qty: 12, revenue: 360000 },
      { id: '6', name: 'Lẩu Thái Tomyum', img: '', source: 'menu_grid', qty: 85, revenue: 25500000 },
      { id: '7', name: 'Cơm Chiên Hải Sản', img: '', source: 'search', qty: 42, revenue: 4200000 },
      { id: '8', name: 'Trà Đào Cam Sả', img: '', source: 'flash_sale', qty: 54, revenue: 1620000 }
    ],
    summary: {
      doanhThu: 143000000,
      soDon: 410,
      soKhach: 650,
      soLuotGoiMon: 1250,
      doanhThuGoiY: 6010000,
      aov: 348780,
      aovTable: 348780,
      cancellationRate: 2.5,
      cancellationsCount: 10,
      days: 7
    }
  }
};

// ────────── NEW PRO MAX DASHBOARD DATA ──────────

export const MOCK_TRAFFIC_HEATMAP = {
  success: true,
  data: {
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    hours: ['10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h'],
    // 7 rows (days) x 13 columns (hours), value is volume
    matrix: [
      [10, 25, 45, 30, 10,  5,  5, 15, 35, 40, 25, 10,  5], // T2
      [12, 28, 50, 25,  8,  5,  8, 20, 38, 45, 30, 15,  5], // T3
      [15, 30, 48, 28, 12,  5, 10, 18, 40, 50, 35, 20,  8], // T4
      [10, 25, 40, 30, 15, 10,  8, 25, 45, 55, 40, 25, 10], // T5
      [20, 35, 55, 35, 15, 10, 15, 40, 75, 110, 85, 45, 20], // T6
      [25, 45, 80, 50, 25, 15, 25, 55, 90, 140, 110, 60, 30], // T7
      [30, 50, 85, 60, 30, 20, 20, 45, 85, 120, 90, 50, 20]  // CN
    ]
  }
};

export const MOCK_SLA_TREND_7D = {
  success: true,
  data: [
    { date: '15/04', tiepNhan: 1, chuanBi: 4, cheBien: 15, phucVu: 2 },
    { date: '16/04', tiepNhan: 1, chuanBi: 5, cheBien: 16, phucVu: 2 },
    { date: '17/04', tiepNhan: 2, chuanBi: 4, cheBien: 22, phucVu: 3 }, // Bottleneck
    { date: '18/04', tiepNhan: 1, chuanBi: 5, cheBien: 28, phucVu: 3 }, // Bottleneck peak
    { date: '19/04', tiepNhan: 1, chuanBi: 3, cheBien: 14, phucVu: 2 }, // Fixed
    { date: '20/04', tiepNhan: 1, chuanBi: 4, cheBien: 15, phucVu: 2 },
    { date: '21/04', tiepNhan: 1, chuanBi: 4, cheBien: 18, phucVu: 2 }
  ]
};

export const MOCK_O2O_ROI_7D = {
  success: true,
  data: [
    { date: '15/04', o2oRate: 65, multiRoundRate: 15, orders: 45, customers: 112, revenue: 11025000 },
    { date: '16/04', o2oRate: 68, multiRoundRate: 18, orders: 48, customers: 120, revenue: 12480000 },
    { date: '17/04', o2oRate: 75, multiRoundRate: 25, orders: 55, customers: 140, revenue: 17050000 },
    { date: '18/04', o2oRate: 72, multiRoundRate: 22, orders: 50, customers: 130, revenue: 14750000 },
    { date: '19/04', o2oRate: 85, multiRoundRate: 38, orders: 68, customers: 175, revenue: 24480000 }, // O2O Peak
    { date: '20/04', o2oRate: 82, multiRoundRate: 35, orders: 62, customers: 160, revenue: 21390000 },
    { date: '21/04', o2oRate: 88, multiRoundRate: 42, orders: 75, customers: 190, revenue: 28500000 }
  ]
};

export const MOCK_CSAT_SCATTER = {
  success: true,
  data: Array.from({length: 80}).map((_, i) => {
    // Generate scattered points: Wait Time vs Stars
    let wait = Math.floor(Math.random() * 45) + 5; // 5 to 50 mins
    let stars;
    if (wait < 15) stars = Math.random() > 0.2 ? 5 : 4;
    else if (wait < 22) stars = Math.random() > 0.4 ? 4 : 3;
    else if (wait < 30) stars = Math.random() > 0.6 ? 3 : 2;
    else stars = Math.random() > 0.8 ? 2 : 1;
    return { name: `Order ${i}`, x: wait, y: stars, type: wait > 25 && stars < 3 ? 'critical' : 'normal' };
  }),
  summary: { dropOffRate: 4.8, cancelRate: 6.2, avgGuestDuration: 55 }
};

export const MOCK_FUNNEL_UPSALE = {
  success: true,
  data: {
    totalOrders: 450,
    totalCustomers: 1240,
    o2oRate: 88,
    upsellRevenue: 8500000,
    upsellSources: [
      { id: '1', label: 'Gợi ý giỏ hàng (Cart Suggest)', revenue: 4200000, percent: 49, color: 'from-indigo-500 to-indigo-400' },
      { id: '2', label: 'Nhóm Món Đặc Trưng (Signatures)', revenue: 2100000, percent: 25, color: 'from-rose-500 to-rose-400' },
      { id: '3', label: 'Nhóm Topping / Extra', revenue: 1350000, percent: 16, color: 'from-amber-500 to-amber-400' },
      { id: '4', label: 'Flash Sale (Banner Giờ Vàng)', revenue: 850000, percent: 10, color: 'from-emerald-500 to-emerald-400' }
    ]
  }
};

export const MOCK_CSAT_TREND_7D = {
  success: true,
  data: [
    { date: '15/04', positive: 88, negative: 12, slowService: 5, badFood: 3, badAttitude: 2, noisy: 2 },
    { date: '16/04', positive: 85, negative: 15, slowService: 7, badFood: 4, badAttitude: 2, noisy: 2 },
    { date: '17/04', positive: 75, negative: 25, slowService: 15, badFood: 5, badAttitude: 3, noisy: 2 }, // Spike in complaints due to SLA bottleneck
    { date: '18/04', positive: 72, negative: 28, slowService: 18, badFood: 5, badAttitude: 4, noisy: 1 },
    { date: '19/04', positive: 85, negative: 15, slowService: 6, badFood: 5, badAttitude: 2, noisy: 2 },
    { date: '20/04', positive: 89, negative: 11, slowService: 4, badFood: 4, badAttitude: 2, noisy: 1 },
    { date: '21/04', positive: 91, negative: 9,  slowService: 3, badFood: 3, badAttitude: 2, noisy: 1 }
  ]
};

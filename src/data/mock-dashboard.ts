export const MOCK_LIVE_PULSE = {
  success: true,
  data: {
    kitchenLagCount: 3,
    neglectedTablesCount: 2,
    stockoutCount: 5,
    activeTablesCount: 15,
    timestamp: Date.now()
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
    }
  }
};

export const MOCK_TABLE_OCCUPANCY = {
  success: true,
  data: {
    occupied: 18,
    total: 25,
    rate: 72,
    soonEmpty: 3
  }
};

export const MOCK_ANALYTICS = {
  success: true,
  data: {
    trend: [
      { date: '01/04', doanhThu: 15000000, soDon: 45, tyleO2O: 85 },
      { date: '02/04', doanhThu: 18500000, soDon: 52, tyleO2O: 88 },
      { date: '03/04', doanhThu: 14200000, soDon: 41, tyleO2O: 82 },
      { date: '04/04', doanhThu: 22000000, soDon: 65, tyleO2O: 90 },
      { date: '05/04', doanhThu: 25500000, soDon: 72, tyleO2O: 92 },
      { date: '06/04', doanhThu: 19800000, soDon: 55, tyleO2O: 86 },
      { date: '07/04', doanhThu: 28000000, soDon: 80, tyleO2O: 94 }
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
    suggestedItems: [
      { id: '1', name: 'Sushi Cá Hồi', img: '', source: 'best_seller', qty: 24, revenue: 1200000 },
      { id: '2', name: 'Súp Miso Hảo Hạng', img: '', source: 'onboarding', qty: 15, revenue: 450000 },
      { id: '3', name: 'Trà Sữa Olong Nướng', img: '', source: 'combo', qty: 32, revenue: 1600000 },
      { id: '4', name: 'Sashimi Tổng Hợp', img: '', source: 'history', qty: 8, revenue: 2400000 },
      { id: '5', name: 'Salad Rong Biển', img: '', source: 'cart_recommend', qty: 12, revenue: 360000 }
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

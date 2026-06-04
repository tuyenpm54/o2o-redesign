/**
 * CLAUDE ARTIFACT — Dashboard Analytics (ProMaxAnalytics)
 *
 * HOW TO USE:
 * 1. Copy toàn bộ file này
 * 2. Vào claude.ai → New chat
 * 3. Paste vào chat, gõ thêm: "Render this as an artifact"
 * 4. Claude sẽ hiển thị UI ngay lập tức — có thể chỉnh sửa tại đó
 *
 * DEPENDENCIES (đều được hỗ trợ trong Claude Artifacts):
 * - react (hooks)
 * - lucide-react
 * - recharts
 * - Tailwind CSS (via CDN)
 */

import React, { useMemo, useState } from 'react';
import {
  Activity, Clock, ThermometerSun, TrendingUp, Star, AlertCircle, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Megaphone, Smile, Frown, Users, Inbox,
  Flame, BellRing, Utensils, XCircle, Timer, MousePointerClick,
  Banknote, MessageSquare, BookOpen
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Bar, Line, Area, AreaChart, ReferenceLine
} from 'recharts';

// ─────────────────────────────────────────────────────────
// MOCK DATA (inlined từ @/data/mock-dashboard)
// ─────────────────────────────────────────────────────────
const MOCK_SLA_TREND_7D = {
  data: [
    { date: '15/04', tiepNhan: 1, chuanBi: 4, cheBien: 15, phucVu: 2 },
    { date: '16/04', tiepNhan: 1, chuanBi: 5, cheBien: 16, phucVu: 2 },
    { date: '17/04', tiepNhan: 2, chuanBi: 4, cheBien: 22, phucVu: 3 },
    { date: '18/04', tiepNhan: 1, chuanBi: 5, cheBien: 28, phucVu: 3 },
    { date: '19/04', tiepNhan: 1, chuanBi: 3, cheBien: 14, phucVu: 2 },
    { date: '20/04', tiepNhan: 1, chuanBi: 4, cheBien: 15, phucVu: 2 },
    { date: '21/04', tiepNhan: 1, chuanBi: 4, cheBien: 18, phucVu: 2 },
  ]
};

const MOCK_O2O_ROI_7D = {
  data: [
    { date: '15/04', o2oRate: 65, multiRoundRate: 15, orders: 45, customers: 112, revenue: 11025000 },
    { date: '16/04', o2oRate: 68, multiRoundRate: 18, orders: 48, customers: 120, revenue: 12480000 },
    { date: '17/04', o2oRate: 75, multiRoundRate: 25, orders: 55, customers: 140, revenue: 17050000 },
    { date: '18/04', o2oRate: 72, multiRoundRate: 22, orders: 50, customers: 130, revenue: 14750000 },
    { date: '19/04', o2oRate: 85, multiRoundRate: 38, orders: 68, customers: 175, revenue: 24480000 },
    { date: '20/04', o2oRate: 82, multiRoundRate: 35, orders: 62, customers: 160, revenue: 21390000 },
    { date: '21/04', o2oRate: 88, multiRoundRate: 42, orders: 75, customers: 190, revenue: 28500000 },
  ]
};

const MOCK_FUNNEL_UPSALE = {
  data: {
    upsellSources: [
      { id: '1', label: 'Gợi ý giỏ hàng (Cart Suggest)', revenue: 4200000, percent: 49, color: 'from-indigo-500 to-indigo-400' },
      { id: '2', label: 'Nhóm Món Đặc Trưng (Signatures)', revenue: 2100000, percent: 25, color: 'from-rose-500 to-rose-400' },
      { id: '3', label: 'Nhóm Topping / Extra', revenue: 1350000, percent: 16, color: 'from-amber-500 to-amber-400' },
      { id: '4', label: 'Flash Sale (Banner Giờ Vàng)', revenue: 850000, percent: 10, color: 'from-emerald-500 to-emerald-400' },
    ]
  }
};

const MOCK_CSAT_TREND_7D = {
  data: [
    { date: '15/04', positive: 88, negative: 12, slowService: 5, badFood: 3, badAttitude: 2, noisy: 2 },
    { date: '16/04', positive: 85, negative: 15, slowService: 7, badFood: 4, badAttitude: 2, noisy: 2 },
    { date: '17/04', positive: 75, negative: 25, slowService: 15, badFood: 5, badAttitude: 3, noisy: 2 },
    { date: '18/04', positive: 72, negative: 28, slowService: 18, badFood: 5, badAttitude: 4, noisy: 1 },
    { date: '19/04', positive: 85, negative: 15, slowService: 6, badFood: 5, badAttitude: 2, noisy: 2 },
    { date: '20/04', positive: 89, negative: 11, slowService: 4, badFood: 4, badAttitude: 2, noisy: 1 },
    { date: '21/04', positive: 91, negative: 9, slowService: 3, badFood: 3, badAttitude: 2, noisy: 1 },
  ]
};

const MOCK_MENU_EFFICIENCY = {
  data: {
    avgBrowse: 165,
    avgDecide: 62,
    avgTotal: 252,
    dropOffRate: 4.2,
    browseDelta: -12,
    decideDelta: 3,
    totalDelta: -8,
    dropOffDelta: -1.1,
    trend: [
      { date: '15/04', browse: 195, decide: 72, total: 290 },
      { date: '16/04', browse: 180, decide: 65, total: 268 },
      { date: '17/04', browse: 172, decide: 68, total: 260 },
      { date: '18/04', browse: 160, decide: 58, total: 235 },
      { date: '19/04', browse: 155, decide: 60, total: 238 },
      { date: '20/04', browse: 148, decide: 55, total: 220 },
      { date: '21/04', browse: 142, decide: 50, total: 210 },
    ],
    funnel: [
      { step: 'Quét QR', count: 680, rate: 100 },
      { step: 'Mở menu', count: 665, rate: 97.8 },
      { step: 'Xem chi tiết món', count: 580, rate: 85.3 },
      { step: 'Thêm vào giỏ', count: 572, rate: 84.1 },
      { step: 'Gửi đơn hàng', count: 548, rate: 80.6 },
    ],
    firstItemSource: [
      { source: 'menu_grid',      label: 'Menu chính (lướt)',         count: 285, percent: 42, color: '#0f172a' },
      { source: 'onboarding',     label: 'Onboarding Wizard',         count: 137, percent: 20, color: '#6366f1' },
      { source: 'best_seller',    label: 'Siêu phẩm bán chạy',       count: 89,  percent: 13, color: '#ef4444' },
      { source: 'search',         label: 'Ô tìm kiếm',               count: 75,  percent: 11, color: '#f59e0b' },
      { source: 'history',        label: 'Món bạn từng chọn',        count: 48,  percent: 7,  color: '#10b981' },
      { source: 'combo',          label: 'Combo tiết kiệm',          count: 27,  percent: 4,  color: '#8b5cf6' },
      { source: 'cart_recommend', label: 'Gợi ý khi thanh toán',     count: 14,  percent: 2,  color: '#06b6d4' },
      { source: 'flash_sale',     label: 'Flash Sale / Banner',      count: 5,   percent: 1,  color: '#ec4899' },
    ],
    orderingBehavior: {
      avgItemsFirstOrder: 3.4,
      avgRoundsPerTable: 2.1,
      singleRoundRate: 38,
      multiRoundRate: 25,
    },
  }
};

const MOCK_ANALYTICS = {
  data: {
    suggestedItems: [
      { id: '1', name: 'Sushi Cá Hồi',          source: 'best_seller',    qty: 24, revenue: 1200000 },
      { id: '2', name: 'Súp Miso Hảo Hạng',     source: 'onboarding',     qty: 15, revenue: 450000 },
      { id: '3', name: 'Trà Sữa Olong Nướng',   source: 'combo',          qty: 32, revenue: 1600000 },
      { id: '4', name: 'Sashimi Tổng Hợp',       source: 'history',        qty: 8,  revenue: 2400000 },
      { id: '5', name: 'Salad Rong Biển',        source: 'cart_recommend', qty: 12, revenue: 360000 },
      { id: '6', name: 'Lẩu Thái Tomyum',        source: 'menu_grid',      qty: 85, revenue: 25500000 },
      { id: '7', name: 'Cơm Chiên Hải Sản',      source: 'search',         qty: 42, revenue: 4200000 },
      { id: '8', name: 'Trà Đào Cam Sả',         source: 'flash_sale',     qty: 54, revenue: 1620000 },
    ],
  }
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const CHART_COLORS = {
  revenue: '#8b5cf6',
  orders: '#3b82f6',
  customers: '#06b6d4',
  success: '#10b981',
  critical: '#f43f5e',
  warning: '#f97316',
  notice: '#f59e0b',
  neutral: '#94a3b8',
  baseItem: '#cbd5e1',
};

const formatVND = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const DeltaBadge = ({
  value, suffix = '%', inverse = false, hideArrow = false
}: { value: number; suffix?: string; inverse?: boolean; hideArrow?: boolean }) => {
  const isGood = inverse ? value <= 0 : value >= 0;
  const isUp = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
      isGood
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-rose-50 text-rose-600'
    }`}>
      {!hideArrow && (isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
      {value > 0 ? '+' : ''}{Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function DashboardAnalytics() {
  const slaTrend = MOCK_SLA_TREND_7D.data;
  const o2oRoi = MOCK_O2O_ROI_7D.data;
  const csatTrendData = MOCK_CSAT_TREND_7D.data;
  const upsaleData = MOCK_FUNNEL_UPSALE.data;
  const menuEff = MOCK_MENU_EFFICIENCY.data;
  const { suggestedItems } = MOCK_ANALYTICS.data;

  const [sortSuggestedBy, setSortSuggestedBy] = useState<'qty' | 'revenue'>('qty');

  const sortedSuggestedItems = useMemo(() => {
    return [...suggestedItems].sort((a, b) =>
      sortSuggestedBy === 'qty' ? b.qty - a.qty : b.revenue - a.revenue
    );
  }, [suggestedItems, sortSuggestedBy]);

  const lastDayO2O = o2oRoi[o2oRoi.length - 1];
  const { orderingBehavior, firstItemSource } = menuEff;

  const fmtTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const customerTimingMetrics = [
    { title: 'Tìm món đầu tiên', value: fmtTime(menuEff.avgBrowse), icon: <BookOpen size={16} />, delta: menuEff.browseDelta, highlight: true, hint: 'Tìm món' },
    { title: 'Giữ giỏ trước khi gửi', value: fmtTime(menuEff.avgDecide), icon: <ShoppingCart size={16} />, delta: menuEff.decideDelta, hint: 'Cân nhắc' },
    { title: 'Tổng thời gian tự gọi', value: fmtTime(menuEff.avgTotal), icon: <Timer size={16} />, delta: menuEff.totalDelta, hint: 'Hoàn tất' },
    { title: 'Rời menu không gọi', value: `${menuEff.dropOffRate}%`, icon: <XCircle size={16} />, delta: menuEff.dropOffDelta, hint: 'Không gọi', inverse: true },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-16 bg-slate-50 min-h-screen">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Báo Cáo Tăng Trưởng</h1>
          <p className="text-slate-500 mt-0.5 font-medium text-[12px]">Phân tích dữ liệu vận hành từ quá khứ</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PILLAR 1: O2O ROI & DOANH THU UP-SALE
          ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
            <ShoppingCart size={22} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">Đòn Bẩy O2O & Doanh Thu Up-Sale</h2>
            <p className="text-slate-500 mt-1 font-medium text-[14px]">Phễu đóng góp doanh thu và Tương quan O2O với Tổng Giao dịch.</p>
          </div>
        </div>

        {/* Hero Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { title: 'Tổng Đơn O2O',       desc: 'Số đơn khách tự đặt',   value: lastDayO2O.orders,            icon: <ShoppingCart size={20} />, delta: 12.5, star: true },
            { title: 'Tỉ lệ sử dụng O2O',  desc: 'Độ phủ phương thức',     value: `${lastDayO2O.o2oRate}%`,     icon: <Activity size={20} />,     delta: 4.5,  star: false },
            { title: 'Khách Tương Tác',     desc: 'Tổng lượt quét QR',      value: lastDayO2O.customers,         icon: <Users size={20} />,        delta: 8.2,  star: false },
            { title: 'Doanh thu Up-Sale',   desc: 'Từ AI gợi ý',             value: '12.5Tr',                     icon: <Banknote size={20} />,     delta: 15.3, star: false },
          ].map(card => (
            <div key={card.title} className={`rounded-[24px] p-6 relative overflow-hidden bg-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] cursor-pointer ${card.star ? 'ring-2 ring-indigo-500/20' : ''}`}>
              {card.star && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-xl ${card.star ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                  {card.icon}
                </div>
                <DeltaBadge value={card.delta} />
              </div>
              <p className="text-[13px] font-medium mb-0.5 text-slate-500">{card.title}</p>
              <p className="text-[11px] font-medium mb-2 text-slate-400">{card.desc}</p>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Upsale Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col min-h-[400px]">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Tương Quan O2O vs Giao Dịch</h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Mật độ O2O, Quy mô Đơn hàng, Lượt Khách và Tổng Doanh Thu.</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={o2oRoi} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} tickFormatter={(val) => (val / 1000000) + 'Tr'} />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (String(name).includes('Doanh thu')) return formatVND(Number(value));
                      if (String(name).includes('O2O')) return value + '%';
                      return value;
                    }}
                    contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                  <Bar yAxisId="left" dataKey="o2oRate" name="Tỉ lệ dùng O2O (%)" fill={CHART_COLORS.baseItem} radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Line yAxisId="left" type="monotone" dataKey="customers" name="Lượt Khách" stroke={CHART_COLORS.customers} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.customers, strokeWidth: 2, stroke: '#fff' }} />
                  <Line yAxisId="left" type="monotone" dataKey="orders" name="Số Đơn Hàng" stroke={CHART_COLORS.orders} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.orders, strokeWidth: 2, stroke: '#fff' }} />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" name="Tổng Doanh thu" stroke={CHART_COLORS.revenue} strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col cursor-pointer">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Megaphone size={18} className="text-indigo-500" /> Phễu Nguồn Up-Sale
              </h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Tỷ trọng doanh thu từ hệ thống gợi ý O2O.</p>
            </div>
            <div className="space-y-6 flex-1">
              {upsaleData.upsellSources.map((source, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[13px] font-bold text-slate-900">{source.label}</span>
                    <span className="text-[14px] font-bold text-slate-900">{formatVND(source.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${source.color}`} style={{ width: `${source.percent}%` }} />
                    </div>
                    <span className="text-[11px] font-bold w-9 text-right text-slate-500">{source.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-indigo-50 border border-indigo-100 p-3 px-4 rounded-xl flex gap-3 items-start">
              <span className="text-indigo-500 text-lg">✨</span>
              <p className="text-[12px] font-medium text-indigo-800 leading-relaxed">
                <strong>Ghi nhận:</strong> Gợi ý món chính và combo chéo đang chiếm ưu thế. Lên kế hoạch cấu hình thêm Flash Sale giờ vàng để cân bằng phễu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PILLAR 2: SỨC KHỎE VẬN HÀNH BẾP
          ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
            <Activity size={22} className="text-rose-600" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">Báo Cáo Vận Hành Bếp</h2>
            <p className="text-slate-500 mt-1 font-medium text-[14px]">Phân tích điểm nghẽn và năng lực chịu tải của hệ thống.</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.03)] mb-6 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Hiệu suất Bếp & Phục vụ</h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Thời gian lưu lại trung bình tại từng trạm.</p>
            </div>
            <DeltaBadge value={-1.5} inverse hideArrow />
          </div>

          <div className="bg-white mx-4 mt-4 lg:mx-6 lg:mt-6 p-4 rounded-xl flex items-center justify-between text-[13px] relative overflow-hidden shadow-sm border border-slate-100">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
            <div className="flex items-center gap-2 pl-2">
              <Clock size={16} className="text-rose-500" />
              <span className="font-medium text-slate-700">
                Hoàn thành 1 order trung bình: <strong className="text-slate-900 font-bold ml-1 border-r border-slate-300 pr-3 mr-2 text-[14px]">22.5 phút</strong> Mục tiêu: 20 phút
              </span>
            </div>
            <div className="font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">Đơn trễ nhất: 45 ph</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-6 gap-x-8 gap-y-6">
            {[
              { title: 'Tiếp nhận', sla: 1,  value: 0.8,  icon: <Inbox size={16} /> },
              { title: 'Chuẩn bị',  sla: 3,  value: 2.5,  icon: <Flame size={16} /> },
              { title: 'Chế biến',  sla: 15, value: 16.5, icon: <BellRing size={16} /> },
              { title: 'Phục vụ',   sla: 2,  value: 2.7,  icon: <Utensils size={16} /> },
            ].map((card, idx) => {
              const isOver = card.value > card.sla;
              return (
                <div key={card.title} className={`flex flex-col relative cursor-pointer ${idx !== 3 ? 'lg:border-r border-slate-100 lg:pr-8' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                      <span className={isOver ? 'text-rose-500' : 'text-emerald-500'}>{card.icon}</span>
                      {card.title}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">SLA {card.sla}p</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={`text-3xl font-bold tracking-tight ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>{card.value}</span>
                    <span className="text-[12px] font-medium text-slate-500">phút</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-rose-500" /> Bảng Xu Hướng Thời Gian Các Trạm
              </h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Biến động so với đường cơ sở SLA (phút) qua 7 ngày.</p>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={slaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13 }}
                  formatter={(val: any, name: any) => [`${val} phút`, name]}
                />
                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 20 }} />
                <ReferenceLine y={10} stroke={CHART_COLORS.critical} strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Chế biến (10p)', fill: CHART_COLORS.critical, fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={5} stroke={CHART_COLORS.warning} strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Chuẩn bị (5p)', fill: CHART_COLORS.warning, fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={3} stroke={CHART_COLORS.notice} strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Phục vụ (3p)', fill: CHART_COLORS.notice, fontSize: 11, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="cheBien" name="Biến động Chế biến" stroke={CHART_COLORS.critical} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.critical }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="chuanBi" name="Biến động Chuẩn bị" stroke={CHART_COLORS.warning} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.warning }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="phucVu" name="Biến động Phục vụ" stroke={CHART_COLORS.notice} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.notice }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 bg-rose-50 border border-rose-100 p-3 px-4 rounded-xl flex gap-3 items-start">
            <span className="text-rose-500 text-lg">💡</span>
            <p className="text-[12px] font-medium text-rose-800 leading-relaxed">
              <strong>Ghi nhận AI:</strong> Trạm <strong>Chế biến</strong> liên tục xé rào SLA (đỉnh điểm vượt mốc 20p). Đề xuất: Rà soát loại bỏ bớt món phức tạp trong thực đơn giờ cao điểm.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PILLAR 3: TRẢI NGHIỆM VÀ CSAT
          ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
            <Star size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">Trải Nghiệm & Phễu Chăm Sóc</h2>
            <p className="text-slate-500 mt-1 font-medium text-[14px]">Mật độ phản hồi, bóc tách nguyên nhân phàn nàn và biến động hài lòng.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Smile/Frown Summary */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between cursor-pointer">
            <div className="grid grid-cols-2 divide-x divide-slate-100 pt-2">
              <div className="flex flex-col items-center px-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                    <Smile className="text-emerald-500" size={32} />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white">92%</div>
                </div>
                <span className="font-bold text-[14px] text-slate-900 mt-4">Hài lòng</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-500 font-medium">314 phiếu</span>
                  <DeltaBadge value={2.5} />
                </div>
              </div>
              <div className="flex flex-col items-center px-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 shadow-sm">
                    <Frown className="text-rose-500" size={32} />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white">8%</div>
                </div>
                <span className="font-bold text-[14px] text-slate-900 mt-4">Phàn nàn</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-500 font-medium">28 phiếu</span>
                  <DeltaBadge value={-2.1} inverse={true} />
                </div>
              </div>
            </div>
            <div className="mt-8 bg-slate-50 rounded-xl p-3 px-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-400" />
                <span className="text-[13px] font-medium text-slate-600">Tổng khảo sát</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900">342</span>
                <DeltaBadge value={18.5} />
              </div>
            </div>
          </div>

          {/* Bad Review Analysis */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col cursor-pointer">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-500" /> Phân tích nguyên nhân phàn nàn
                </h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Tỉ lệ và xu hướng các lý do đánh giá xấu.</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { label: 'Vấn đề làm đồ lâu',           count: 12, ratio: 43, color: CHART_COLORS.critical, delta: 5.4 },
                { label: 'Vấn đề về nhân viên',          count: 7,  ratio: 25, color: CHART_COLORS.warning,  delta: -1.2 },
                { label: 'Vấn đề về vệ sinh/chất lượng', count: 5,  ratio: 18, color: CHART_COLORS.notice,   delta: -2.5 },
                { label: 'Vấn đề khác',                  count: 4,  ratio: 14, color: CHART_COLORS.neutral,  delta: 0.5 },
              ].map(reason => (
                <div key={reason.label}>
                  <div className="flex justify-between items-center mb-1.5 gap-4">
                    <span className="text-[13px] font-semibold text-slate-700">{reason.label}</span>
                    <div className="flex items-center gap-3">
                      <DeltaBadge value={reason.delta} inverse={true} />
                      <span className="text-[13px] font-bold text-slate-900 min-w-[70px] text-right">{reason.ratio}% <span className="text-slate-400 font-medium text-[11px]">({reason.count} lượt)</span></span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${reason.ratio}%`, backgroundColor: reason.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto bg-emerald-50 border border-emerald-100 p-3 px-4 rounded-xl flex gap-3 items-start">
              <span className="text-emerald-500 text-lg">💡</span>
              <p className="text-[12px] font-medium text-emerald-800 leading-relaxed">
                <strong>Ghi nhận AI:</strong> Phần lớn phàn nàn liên quan đến <strong>thời gian chờ (43%)</strong>. Kiểm tra báo cáo SLA Bếp (khung giờ vàng) để xử lý thắt cổ chai.
              </p>
            </div>
          </div>
        </div>

        {/* CSAT Trend Chart & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Xu Hướng Trải Nghiệm Khách Hàng</h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Biến động tỷ lệ Đánh giá Tốt và chi tiết Phàn nàn.</p>
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={csatTrendData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} domain={[0, 100]} tickFormatter={(val) => val + '%'} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                  <Bar yAxisId="left" stackId="negative" dataKey="slowService" name="Vấn đề làm đồ lâu" fill={CHART_COLORS.critical} radius={[0, 0, 4, 4]} maxBarSize={32} />
                  <Bar yAxisId="left" stackId="negative" dataKey="badAttitude" name="Vấn đề về nhân viên" fill={CHART_COLORS.warning} maxBarSize={32} />
                  <Bar yAxisId="left" stackId="negative" dataKey="badFood" name="Vấn đề về vệ sinh" fill={CHART_COLORS.notice} maxBarSize={32} />
                  <Bar yAxisId="left" stackId="negative" dataKey="noisy" name="Vấn đề khác" fill={CHART_COLORS.neutral} radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Line yAxisId="right" type="monotone" dataKey="positive" name="Tỷ lệ Hài lòng (%)" stroke={CHART_COLORS.success} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.success, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col cursor-pointer">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ThermometerSun size={18} className="text-orange-500" /> Bản Đồ Nhiệt Phàn Nàn
              </h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Phân bổ Mếu theo khung giờ.</p>
            </div>
            <div className="space-y-6 flex-1">
              {[
                { label: 'Khung 11h - 13h (Trưa)', count: 45, color: CHART_COLORS.critical, percent: 55 },
                { label: 'Khung 19h - 21h (Tối)',  count: 28, color: CHART_COLORS.warning,  percent: 35 },
                { label: 'Các khung giờ khác',     count: 8,  color: CHART_COLORS.notice,   percent: 10 },
              ].map((issue, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[13px] font-bold text-slate-900">{issue.label}</span>
                    <span className="text-[14px] font-bold text-slate-900">{issue.count} phiếu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${issue.percent}%`, backgroundColor: issue.color }} />
                    </div>
                    <span className="text-[11px] font-bold w-9 text-right text-slate-500">{issue.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-orange-50 border border-orange-100 p-3 px-4 rounded-xl flex gap-3 items-start">
              <span className="text-orange-500 text-lg">💡</span>
              <p className="text-[12px] font-medium text-orange-800 leading-relaxed">
                <strong>Insights:</strong> Khung giờ trưa gặp áp lực lớn, gây ra 55% sự cố bực bội.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PILLAR 4: HÀNH VI KHÁCH HÀNG
          ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-cyan-50 flex items-center justify-center shrink-0 border border-cyan-100 shadow-sm">
            <Users size={22} className="text-cyan-600" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">Hành Vi Tự Gọi Món Tại Bàn</h2>
            <p className="text-slate-500 mt-1 font-medium text-[14px]">Theo dõi khách từ quét QR, chọn món, giữ giỏ đến gửi đơn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Ordering Behavior */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] cursor-pointer">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">Mức Độ Khách Tự Gọi Thêm</h3>
              <p className="text-[13px] font-medium text-slate-500 mb-5">QR đang được dùng như kênh gọi thật sự hay chỉ gọi một lần?</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 p-4 text-center bg-slate-50/50">
                  <p className="text-[12px] font-medium text-slate-500 mb-1">Số món đơn đầu / Bàn</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{orderingBehavior.avgItemsFirstOrder}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4 text-center bg-slate-50/50">
                  <p className="text-[12px] font-medium text-slate-500 mb-1">Số vòng gọi / Bàn</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{orderingBehavior.avgRoundsPerTable}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="rounded-xl border border-slate-100 p-4 text-center bg-amber-50/30">
                  <p className="text-[18px] font-bold tracking-tight text-amber-600">{orderingBehavior.singleRoundRate}%</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-1">Chỉ gọi đúng 1 lần</p>
                </div>
                <div className="rounded-xl border border-cyan-100 p-4 text-center relative overflow-hidden bg-cyan-50/30">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                  <p className="text-[18px] font-bold tracking-tight text-cyan-600">{orderingBehavior.multiRoundRate}%</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-1">Tiếp tục gọi vòng 3+</p>
                </div>
              </div>
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed px-2 mt-4 text-center">
                <strong className="text-cyan-700">Ý nghĩa vận hành:</strong> {orderingBehavior.multiRoundRate}% bàn gọi từ vòng 3 trở lên. Chỉ số tăng → QR đang giảm tải cho phục vụ.
              </p>
            </div>
          </div>

          {/* Customer Timing Metrics */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] cursor-pointer">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">Thời Gian Theo Hành Trình Gọi Món</h3>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-500">Điểm nghẽn từ mở menu đến gửi đơn.</p>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  Giữ giỏ +{menuEff.decideDelta.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customerTimingMetrics.map(card => (
                <div key={card.title} className={`rounded-xl border ${card.highlight ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'} p-4 relative overflow-hidden min-h-[92px]`}>
                  {card.highlight && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />}
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-1.5 rounded-lg ${card.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'}`}>
                      {card.icon}
                    </div>
                    <DeltaBadge value={card.delta} hideArrow={true} inverse />
                  </div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">{card.title}</p>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">{card.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funnel + Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          <div className="lg:col-span-1 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] cursor-pointer">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">Phễu Gọi Món Tại Bàn</h3>
            <p className="text-[13px] font-medium text-slate-500 mb-6">Tỉ lệ từ quét QR đến gửi đơn.</p>
            <div className="space-y-3">
              {menuEff.funnel.map((step: any, idx: number) => {
                const prevRate = idx > 0 ? menuEff.funnel[idx - 1].rate : 100;
                const dropRate = prevRate - step.rate;
                const isLast = idx === menuEff.funnel.length - 1;
                return (
                  <div key={step.step}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-semibold text-slate-700">{step.step}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">{step.rate}%</span>
                        <span className="text-[10px] font-medium text-slate-400">({step.count})</span>
                      </div>
                    </div>
                    <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex group">
                      <div className="h-full bg-slate-800 transition-all duration-700" style={{ width: `${step.rate}%` }} />
                      {!isLast && dropRate > 0 && (
                        <div className="h-full bg-rose-400 flex items-center justify-center opacity-80" style={{ width: `${dropRate}%` }}>
                          <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1">-{dropRate.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] lg:col-span-2 flex flex-col min-h-[350px] cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Xu Hướng Tốc Độ Tự Gọi Món</h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Thời gian tìm món và giữ giỏ theo ngày.</p>
              </div>
            </div>
            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={menuEff.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBrowse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.orders} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.orders} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDecide" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.customers} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.customers} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} tickFormatter={v => `${Math.floor(Number(v) / 60)}:${(Number(v) % 60).toString().padStart(2, '0')}`} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13 }}
                    formatter={(val: any, name: any) => [`${Math.floor(Number(val) / 60)}:${(Number(val) % 60).toString().padStart(2, '0')}`, name]}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 20 }} />
                  <Area type="monotone" dataKey="browse" name="Tìm món đầu tiên" stroke={CHART_COLORS.orders} strokeWidth={2.5} fill="url(#gradBrowse)" dot={{ r: 4, fill: '#fff', stroke: CHART_COLORS.orders, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="decide" name="Giữ giỏ trước khi gửi" stroke={CHART_COLORS.customers} strokeWidth={2.5} fill="url(#gradDecide)" dot={{ r: 4, fill: '#fff', stroke: CHART_COLORS.customers, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Discovery Funnel + Suggested Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
          <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col cursor-pointer">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MousePointerClick size={18} className="text-cyan-500" /> Phễu Khám Phá Đầu Tiên
              </h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Kênh dẫn dắt khách nhặt món đầu tiên.</p>
            </div>
            <div className="space-y-5 flex-1">
              {firstItemSource.map((ch: any) => (
                <div key={ch.source} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      <span className="text-[13px] font-bold text-slate-900">{ch.label}</span>
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">{ch.count}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ch.percent}%`, backgroundColor: ch.color }} />
                    </div>
                    <span className="text-[11px] font-bold w-9 text-right" style={{ color: ch.color }}>{ch.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col cursor-pointer">
            <div className="mb-6">
              <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" /> Bảng Xếp Hạng Gợi Ý
                  </h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-1">Sản phẩm đóng góp nhiều nhất qua AI Suggester.</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setSortSuggestedBy('qty')}
                    className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${sortSuggestedBy === 'qty' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Theo lượt bán
                  </button>
                  <button
                    onClick={() => setSortSuggestedBy('revenue')}
                    className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${sortSuggestedBy === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Theo doanh thu
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Sản phẩm</th>
                    <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[25%]">Kênh Chốt Sale</th>
                    <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[15%] text-right">Đã bán</th>
                    <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[20%] text-right">Thực thu</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSuggestedItems.slice(0, 8).map((item: any, idx: number) => {
                    const sourceMatch = firstItemSource.find((s: any) => s.source === item.source);
                    const sLabel = sourceMatch ? sourceMatch.label : item.source;
                    const sColor = sourceMatch ? sourceMatch.color : '#94a3b8';
                    return (
                      <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[8px] bg-slate-100 flex items-center justify-center border border-slate-200">
                              <Utensils size={14} className="text-slate-400" />
                            </div>
                            <span className="font-bold text-[13px] text-slate-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sColor }} />
                            <span className="text-[11px] font-semibold text-slate-700">{sLabel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right font-bold text-[13px] text-slate-900">{item.qty}</td>
                        <td className="py-3.5 px-2 text-right font-bold text-[14px] text-emerald-600">{formatVND(item.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

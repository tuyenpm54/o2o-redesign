"use client";

import React, { useMemo } from 'react';
import {
  Activity, Clock, ThermometerSun, TrendingUp, Star, AlertCircle, ShoppingCart, ShieldAlert,
  ArrowUpRight, ArrowDownRight, SplitSquareHorizontal, Megaphone, Smile, Frown, Users, Inbox, Flame, BellRing, Utensils, XCircle, Timer, MousePointerClick, LayoutDashboard, Banknote, MessageSquare, BookOpen
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Bar, Line, Cell, Area, AreaChart, ScatterChart, Scatter, ReferenceLine
} from 'recharts';

import {
  MOCK_TRAFFIC_HEATMAP,
  MOCK_SLA_TREND_7D,
  MOCK_O2O_ROI_7D,
  MOCK_CSAT_SCATTER,
  MOCK_FUNNEL_UPSALE,
  MOCK_MENU_EFFICIENCY,
  MOCK_ANALYTICS,
  MOCK_SLA_TRACKER,
  MOCK_ORDER_QUEUE,
  MOCK_CSAT_TREND_7D
} from '@/data/mock-dashboard';

const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const DeltaBadge = ({ value, suffix = '%', inverse = false, hideArrow = false }: { value: number; suffix?: string; inverse?: boolean; hideArrow?: boolean }) => {
    const isGood = inverse ? value <= 0 : value >= 0;
    const isUp = value > 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
            {!hideArrow && (isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
            {value > 0 ? '+' : ''}{Math.abs(value).toFixed(1)}{suffix}
        </span>
    );
};

export default function ProMaxAnalytics() {
  const trafficData = MOCK_TRAFFIC_HEATMAP.data;
  const slaTrend = MOCK_SLA_TREND_7D.data;
  const o2oRoi = MOCK_O2O_ROI_7D.data;
  const csatData = MOCK_CSAT_SCATTER.data;
  const csatTrendData = MOCK_CSAT_TREND_7D.data;
  
  const upsaleData = MOCK_FUNNEL_UPSALE.data;
  const menuEff = MOCK_MENU_EFFICIENCY.data;
  const orderingBehavior = menuEff.orderingBehavior;
  const suggestedItems = MOCK_ANALYTICS.data.suggestedItems;
  const firstItemSource = menuEff.firstItemSource;
  
  const lastDayO2O = o2oRoi[o2oRoi.length - 1];

  const fmtTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Visual Helper 
  const getTrafficColor = (val: number) => {
    if (val === 0) return 'bg-slate-50 dark:bg-white/5 text-transparent';
    if (val < 15) return 'bg-amber-50 dark:bg-amber-500/10 text-transparent';
    if (val < 30) return 'bg-orange-200 dark:bg-orange-500/30 text-transparent';
    if (val < 60) return 'bg-orange-400 dark:bg-orange-600/70 text-white font-bold';
    if (val < 100) return 'bg-rose-500 dark:bg-rose-600 text-white font-bold';
    return 'bg-rose-700 dark:bg-rose-800 text-white font-bold';
  };

  const slaSteps = [
    { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox, time: 1.5, target: 2, isCritical: false },
    { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame, time: 4.2, target: 5, isCritical: false },
    { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing, time: 12.8, target: 10, isCritical: true },
    { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils, time: 3.5, target: 4, isCritical: false },
  ];

  return (
    <div className="space-y-16 py-4">
      
      {/* ─────────────────────────────────────────────────────────
          PILLAR 1: O2O ROI & DOANH THU UP-SALE (Formerly Pillar 2)
          ───────────────────────────────────────────────────────── */}
      <section className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none rounded-3xl opacity-50 dark:opacity-100" />
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-3 backdrop-blur-md">
            <ShoppingCart size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Trụ Cột 1</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Đòn Bẩy O2O & Doanh Thu Up-Sale</h2>
          <p className="text-slate-500 mt-2 font-medium text-[15px]">Phễu đóng góp doanh thu và Tương quan O2O với Tổng Giao dịch.</p>
        </div>

        {/* Hero Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
                { title: 'Tổng Đơn O2O', desc: 'Số đơn khách tự đặt', value: lastDayO2O.orders, icon: <ShoppingCart size={20} />, delta: 12.5, star: true },
                { title: 'Tỉ lệ sử dụng O2O', desc: 'Độ phủ phương thức', value: `${lastDayO2O.o2oRate}%`, icon: <Activity size={20} />, delta: 4.5, star: false },
                { title: 'Khách Tương Tác', desc: 'Tổng lượt quét QR', value: lastDayO2O.customers, icon: <Users size={20} />, delta: 8.2, star: false },
                { title: 'Doanh thu Up-Sale', desc: 'Từ AI gợi ý', value: "12.5Tr", icon: <Banknote size={20} />, delta: 15.3, star: false },
            ].map(card => (
                <div key={card.title} className={`rounded-[24px] p-6 relative overflow-hidden bg-white dark:bg-[#0c0c0e] shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 transition-transform active:scale-[0.98] cursor-pointer ${card.star ? 'ring-2 ring-indigo-500/20' : ''}`}>
                    {card.star && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />}
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-2 rounded-xl ${card.star ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                            {card.icon}
                        </div>
                        <DeltaBadge value={card.delta} />
                    </div>
                    <p className="text-[13px] font-medium mb-0.5 text-slate-500">{card.title}</p>
                    <p className="text-[11px] font-medium mb-2 text-slate-400">{card.desc}</p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                </div>
            ))}
        </div>

        {/* Macro Analysis Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Chart taking 2/3 */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col h-full min-h-[400px] transition-transform active:scale-[0.99]">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Tương Quan O2O vs Giao Dịch</h3>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Biểu đồ đối chiếu Mật độ O2O, Quy mô Đơn hàng, Lượt Khách và Tổng Doanh Thu.</p>
                </div>
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <ComposedChart data={o2oRoi} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} tickFormatter={(val) => (val/1000000) + 'Tr'} />
                      <Tooltip 
                        formatter={(value: any, name: any) => {
                          if (String(name).includes('Doanh thu')) return formatVND(Number(value));
                          if (String(name).includes('O2O')) return value + '%';
                          return value;
                        }}
                        contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                      <Bar yAxisId="left" dataKey="o2oRate" name="Tỉ lệ dùng O2O (%)" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Line yAxisId="left" type="monotone" dataKey="customers" name="Lượt Khách" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
                      <Line yAxisId="left" type="monotone" dataKey="orders" name="Số Đơn Hàng" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} />
                      <Area yAxisId="right" type="monotone" dataKey="revenue" name="Tổng Doanh thu" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* UP-Sale Sources taking 1/3 */}
            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Megaphone size={18} className="text-indigo-500" /> Phễu Nguồn Up-Sale
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Tỷ trọng doanh thu sinh ra từ hệ thống gợi ý O2O.</p>
                </div>
                <div className="space-y-6 flex-1">
                    {upsaleData.upsellSources.map((source, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{source.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold text-slate-900 dark:text-white">{formatVND(source.revenue)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${source.color} transition-all`} style={{ width: `${source.percent}%` }} />
                                </div>
                                <span className="text-[11px] font-bold w-9 text-right text-slate-500">{source.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-3 px-4 rounded-xl flex gap-3 items-start">
                    <span className="text-indigo-500 text-lg">✨</span>
                    <p className="text-[12px] font-medium text-indigo-800 dark:text-indigo-300 leading-relaxed">
                        <strong className="text-indigo-900 dark:text-indigo-200">Ghi nhận:</strong> Gợi ý món chính và combo chéo đang chiếm ưu thế tuyệt đối. Lên kế hoạch cấu hình thêm Flash Sale giờ vàng để cân bằng phễu.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PILLAR 2: SỨC KHỎE VẬN HÀNH BẾP (Formerly Pillar 1)
          ───────────────────────────────────────────────────────── */}
      <section className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none rounded-3xl opacity-50 dark:opacity-100" />
        
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-3 backdrop-blur-md">
              <Activity size={14} className="text-rose-600 dark:text-rose-400" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Trụ Cột 2</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Báo Cáo Vận Hành Bếp</h2>
            <p className="text-slate-500 mt-2 font-medium text-[15px]">Phân tích điểm nghẽn (Bottlenecks) và năng lực chịu tải của hệ thống qua các khung giờ.</p>
          </div>
        </div>

        {/* Consolidated Hero Metrics Card */}
        <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 mb-6 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Hiệu suất Bếp & Phục vụ</h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-1">Phân tích thời gian lưu lại trung bình tại từng trạm.</p>
                </div>
                <DeltaBadge value={-1.5} inverse hideArrow />
            </div>
            
            <div className="bg-white dark:bg-white/[0.02] mx-4 mt-4 lg:mx-6 lg:mt-6 p-4 rounded-xl flex items-center justify-between text-[13px] relative overflow-hidden transition-transform active:scale-[0.99] cursor-pointer shadow-sm dark:shadow-none border border-slate-100 dark:border-transparent">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                <div className="flex items-center gap-2 pl-2">
                    <Clock size={16} className="text-rose-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        Hoàn thành 1 order trung bình: <strong className="text-slate-900 dark:text-white font-bold ml-1 border-r border-slate-300 dark:border-slate-700 pr-3 mr-2 text-[14px]">22.5 phút</strong> Mục tiêu: 20 phút
                    </span>
                </div>
                <div className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-lg">Đơn trễ nhất: 45 ph</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-6 gap-x-8 gap-y-6">
                {[
                    { title: 'Tiếp nhận', sla: 1, value: 0.8, icon: <Inbox size={16} /> },
                    { title: 'Chuẩn bị', sla: 3, value: 2.5, icon: <Flame size={16} /> },
                    { title: 'Chế biến', sla: 15, value: 16.5, icon: <BellRing size={16} /> },
                    { title: 'Phục vụ', sla: 2, value: 2.7, icon: <Utensils size={16} /> },
                ].map((card, idx) => {
                    const isOver = card.value > card.sla;
                    return (
                    <div key={card.title} className={`flex flex-col relative transition-transform active:scale-[0.98] cursor-pointer ${idx !== 3 ? 'lg:border-r border-slate-100 dark:border-white/5 lg:pr-8' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                <span className={isOver ? 'text-rose-500' : 'text-emerald-500'}>{card.icon}</span>
                                {card.title}
                            </span>
                            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">SLA {card.sla}p</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className={`text-3xl font-bold tracking-tight ${isOver ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{card.value}</span>
                            <span className="text-[12px] font-medium text-slate-500">phút</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    </div>
                )})}
            </div>
        </div>

        {/* Trend Chart Full Width */}
        <div className="mb-6 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col h-full min-h-[400px] transition-transform active:scale-[0.99] cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <TrendingUp size={18} className="text-rose-500" /> Bảng Xu Hướng Thời Gian Các Trạm
                </h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Theo dõi biến động và so sánh với đường cơ sở SLA định mức (phút) qua 7 ngày.</p>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <ComposedChart data={MOCK_SLA_TREND_7D.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                        <Tooltip
                            contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                            formatter={(val: any, name: any) => [`${val} phút`, name]}
                        />
                        <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 20 }} />
                        
                        <ReferenceLine y={10} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Chế biến (10p)', fill: '#f43f5e', fontSize: 11, fontWeight: 'bold' }} />
                        <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Chuẩn bị (5p)', fill: '#f59e0b', fontSize: 11, fontWeight: 'bold' }} />
                        <ReferenceLine y={3} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'SLA Phục vụ (3p)', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold' }} />

                        <Line type="monotone" dataKey="cheBien" name="Biến động Chế biến" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="chuanBi" name="Biến động Chuẩn bị" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="phucVu" name="Biến động Phục vụ" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 px-4 rounded-xl flex gap-3 items-start">
                <span className="text-rose-500 text-lg">💡</span>
                <p className="text-[12px] font-medium text-rose-800 dark:text-rose-300 leading-relaxed">
                    <strong className="text-rose-900 dark:text-rose-200">Ghi nhận AI:</strong> Trạm <strong className="text-rose-900 dark:text-rose-200">Chế biến</strong> liên tục xé rào SLA (đỉnh điểm vượt mốc 20p). Áp lực bếp đang làm thắt cổ chai toàn bộ flow O2O. Đề xuất: Rà soát loại bỏ bớt món phức tạp trong thực đơn giờ cao điểm.
                </p>
            </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PILLAR 3: TRẢI NGHIỆM VÀ CSAT
          ───────────────────────────────────────────────────────── */}
      <section className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none rounded-3xl opacity-50 dark:opacity-100" />
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-3 backdrop-blur-md">
            <Star size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Trụ Cột 3</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Trải Nghiệm & Phễu Chăm Sóc</h2>
          <p className="text-slate-500 mt-2 font-medium text-[15px]">Mật độ phản hồi, bóc tách nguyên nhân tỷ lệ phàn nàn và biến động hài lòng.</p>
        </div>

        {/* ROW 1: Hero CSAT Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Left: Smile/Frown Summary */}
            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col justify-between transition-transform active:scale-[0.98] cursor-pointer">
                <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-white/10 pt-2">
                    {/* Hài Lòng */}
                    <div className="flex flex-col items-center px-2">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center shadow-sm dark:shadow-none">
                                <Smile className="text-emerald-500" size={32} />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0c0c0e]">
                                92%
                            </div>
                        </div>
                        <span className="font-bold text-[14px] text-slate-900 dark:text-white mt-4">Hài lòng</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-slate-500 font-medium">314 phiếu</span>
                            <DeltaBadge value={2.5} />
                        </div>
                    </div>

                    {/* Phàn Nàn */}
                    <div className="flex flex-col items-center px-2">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 shadow-sm dark:shadow-none">
                                <Frown className="text-rose-500" size={32} />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0c0c0e]">
                                8%
                            </div>
                        </div>
                        <span className="font-bold text-[14px] text-slate-900 dark:text-white mt-4">Phàn nàn</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-slate-500 font-medium">28 phiếu</span>
                            <DeltaBadge value={-2.1} inverse={true} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-slate-50 dark:bg-white/5 rounded-xl p-3 px-4 flex items-center justify-between border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-slate-400" />
                        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">Tổng khảo sát</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900 dark:text-white">342</span>
                        <DeltaBadge value={18.5} />
                    </div>
                </div>
            </div>

            {/* Right: Bad Review Analysis */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <AlertCircle size={18} className="text-rose-500" /> Phân tích nguyên nhân phàn nàn
                        </h3>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">Tỉ lệ và xu hướng các lý do khiến khách hàng để lại đánh giá xấu (Tệ & Rất Tệ).</p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    {[
                        { label: 'Thời gian chờ phục vụ lâu', count: 12, ratio: 43, color: 'bg-rose-500', delta: 5.4 },
                        { label: 'Nhân viên chậm, thái độ chưa tốt', count: 7, ratio: 25, color: 'bg-orange-500', delta: -1.2 },
                        { label: 'Món ăn không ngon / dở / nguội', count: 5, ratio: 18, color: 'bg-amber-500', delta: -2.5 },
                        { label: 'Vệ sinh kém', count: 4, ratio: 14, color: 'bg-slate-400 dark:bg-slate-500', delta: 0.5 }
                    ].map(reason => (
                        <div key={reason.label}>
                            <div className="flex justify-between items-center mb-1.5 gap-4">
                                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{reason.label}</span>
                                <div className="flex items-center gap-3">
                                    <DeltaBadge value={reason.delta} inverse={true} />
                                    <span className="text-[13px] font-bold text-slate-900 dark:text-white min-w-[70px] text-right">{reason.ratio}% <span className="text-slate-400 font-medium text-[11px]">({reason.count} lượt)</span></span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${reason.color}`} style={{ width: `${reason.ratio}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 px-4 rounded-xl flex gap-3 items-start">
                    <span className="text-emerald-500 text-lg">💡</span>
                    <p className="text-[12px] font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        <strong className="text-emerald-900 dark:text-emerald-200">Ghi nhận AI:</strong> Phần lớn phàn nàn liên quan đến <strong className="text-emerald-900 dark:text-emerald-200">thời gian chờ (43%)</strong>. Hãy kiểm tra báo cáo SLA Bếp (khung giờ vàng) để xử lý thắt cổ chai điều phối.
                    </p>
                </div>
            </div>
        </div>

        {/* CSAT Trend Chart & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col h-full min-h-[400px] transition-transform active:scale-[0.99] cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Xu Hướng Trải Nghiệm Khách Hàng</h3>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">Biến động tỷ lệ Đánh giá Tốt (Mặt Cười) và chi tiết các loại Phàn nàn.</p>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <ComposedChart data={csatTrendData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dx={0} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} domain={[0, 100]} tickFormatter={(val) => val + '%'} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                                itemStyle={{ fontWeight: 600 }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                            <Bar yAxisId="left" stackId="negative" dataKey="slowService" name="Phục vụ rùa bò" fill="#ef4444" radius={[0, 0, 4, 4]} maxBarSize={32} />
                            <Bar yAxisId="left" stackId="negative" dataKey="badFood" name="Thức ăn tệ" fill="#f97316" maxBarSize={32} />
                            <Bar yAxisId="left" stackId="negative" dataKey="badAttitude" name="Thái độ lồi lõm" fill="#f59e0b" maxBarSize={32} />
                            <Bar yAxisId="left" stackId="negative" dataKey="noisy" name="Tiếng ồn/Môi trường" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Line yAxisId="right" type="monotone" dataKey="positive" name="Tỷ lệ Hài lòng (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <ThermometerSun size={18} className="text-orange-500" /> Bản Đồ Nhiệt Phàn Nàn
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Phân bổ Mếu theo khung giờ dồn nén.</p>
                </div>
                <div className="space-y-6 flex-1">
                    {[
                        { label: 'Khung 11h - 13h (Trưa)', count: 45, color: '#f97316', percent: 55 },
                        { label: 'Khung 19h - 21h (Tối)', count: 28, color: '#f59e0b', percent: 35 },
                        { label: 'Các khung giờ khác', count: 8, color: '#fbbf24', percent: 10 },
                    ].map((issue, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{issue.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold text-slate-900 dark:text-white">{issue.count} phiếu</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${issue.percent}%`, backgroundColor: issue.color }} />
                                </div>
                                <span className="text-[11px] font-bold w-9 text-right text-slate-500">{issue.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-3 px-4 rounded-xl flex gap-3 items-start">
                    <span className="text-orange-500 text-lg">💡</span>
                    <p className="text-[12px] font-medium text-orange-800 dark:text-orange-300 leading-relaxed">
                        <strong className="text-orange-900 dark:text-orange-200">Insights:</strong> Khung giờ trưa gặp áp lực lớn, gây ra 55% sự cố bực bội.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PILLAR 4: HÀNH VI KHÁCH HÀNG (Extracted from old Pillar 2)
          ───────────────────────────────────────────────────────── */}
      <section className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none rounded-3xl opacity-50 dark:opacity-100" />
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-3 backdrop-blur-md">
            <Users size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Trụ Cột 4</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hành Vi Gọi Món Của Khách</h2>
          <p className="text-slate-500 mt-2 font-medium text-[15px]">Phân tích thói quen gọi món theo vòng và độ phụ thuộc vào tính năng tiện lợi.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Mật Độ Chọn Món Tự Động O2O</h3>
                    <p className="text-[13px] font-medium text-slate-500 mb-5">Cách khách hàng thêm thức ăn và gọi lại nhiều lần không cần phục vụ.</p>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-100 dark:border-white/5 p-4 text-center bg-slate-50/50 dark:bg-white/[0.02]">
                            <p className="text-[12px] font-medium text-slate-500 mb-1">Quy mô món lần đầu / Bàn</p>
                            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{orderingBehavior.avgItemsFirstOrder}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 dark:border-white/5 p-4 text-center bg-slate-50/50 dark:bg-white/[0.02]">
                            <p className="text-[12px] font-medium text-slate-500 mb-1">Tần suất gọi thêm trung bình</p>
                            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{orderingBehavior.avgRoundsPerTable}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="rounded-xl border border-slate-100 dark:border-white/5 p-4 text-center bg-amber-50/30 dark:bg-amber-500/5">
                            <p className="text-[18px] font-bold tracking-tight text-amber-600 dark:text-amber-400">{orderingBehavior.singleRoundRate}%</p>
                            <p className="text-[12px] font-medium text-slate-500 mt-1">Chỉ gọi đúng 1 lần</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 dark:border-white/5 p-4 text-center relative overflow-hidden bg-cyan-50/30 dark:bg-cyan-500/5 border-cyan-100 dark:border-cyan-500/20">
                            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                            <p className="text-[18px] font-bold tracking-tight text-cyan-600 dark:text-cyan-400">{orderingBehavior.multiRoundRate}%</p>
                            <p className="text-[12px] font-medium text-slate-500 mt-1">Tiếp tục gọi vòng 3+</p>
                        </div>
                    </div>
                    <p className="text-[13px] font-medium text-slate-500 leading-relaxed px-2 mt-4 text-center">
                        <strong className="text-cyan-700 dark:text-cyan-400">Đánh giá hành vi:</strong> Khách tự gọi vòng 3+ chiếm `{orderingBehavior.multiRoundRate}%`, minh chứng độ rào cản thấp của hệ thống Menu điện tử.
                    </p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Thời Gian Thao Tác (Giây)</h3>
                    <p className="text-[13px] font-medium text-slate-500 mb-5">Đo lường thời lượng khách hàng dừng lại cân nhắc tại từng giai đoạn.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { title: 'Duyệt Menu', value: fmtTime(menuEff.avgBrowse), icon: <BookOpen size={16} />, delta: menuEff.browseDelta, highlight: true },
                        { title: 'Chốt Món', value: fmtTime(menuEff.avgDecide), icon: <MousePointerClick size={16} />, delta: menuEff.decideDelta },
                        { title: 'Lưu Giữ Thẻ', value: fmtTime(menuEff.avgTotal), icon: <Timer size={16} />, delta: menuEff.totalDelta },
                        { title: 'Thoát (Ko Gọi)', value: `${menuEff.dropOffRate}%`, icon: <XCircle size={16} />, delta: menuEff.dropOffDelta }
                    ].map(card => (
                        <div key={card.title} className={`rounded-xl border ${card.highlight ? 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]'} p-4 relative overflow-hidden group`}>
                            {card.highlight && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />}
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-1.5 rounded-lg ${card.highlight ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-white/10 text-slate-400'}`}>
                                    {card.icon}
                                </div>
                                <DeltaBadge value={card.delta} hideArrow={true}/>
                            </div>
                            <p className="text-[12px] font-medium text-slate-500 mb-0.5">{card.title}</p>
                            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ── BỔ SUNG YÊU CẦU: ROW 2 - Hành Trình Gọi Món & Biểu Đồ Thời Gian ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
            <div className="flex flex-col gap-6 lg:col-span-1">
                <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex-1 transition-transform active:scale-[0.99] cursor-pointer">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Hành Trình Gọi Món</h3>
                    <p className="text-[13px] font-medium text-slate-500 mb-6">Tỉ lệ khách hàng đi từ bước quét mã đến lúc thanh toán.</p>
                    <div className="space-y-3">
                        {menuEff.funnel.map((step: any, idx: number) => {
                            const isLast = idx === menuEff.funnel.length - 1;
                            const prevRate = idx > 0 ? menuEff.funnel[idx - 1].rate : 100;
                            const dropRate = prevRate - step.rate;
                            return (
                                <div key={step.step}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{step.step}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{step.rate}%</span>
                                            <span className="text-[10px] font-medium text-slate-400">({step.count})</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-8 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden relative group flex">
                                        <div className="h-full bg-slate-800 dark:bg-slate-200 transition-all duration-700" style={{ width: `${step.rate}%` }} />
                                        {!isLast && dropRate > 0 && (
                                            <div className="h-full bg-rose-400 dark:bg-rose-500/80 transition-all duration-700 flex items-center justify-center opacity-80" style={{ width: `${dropRate}%` }}>
                                                <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1">-{dropRate.toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 lg:col-span-2 flex flex-col min-h-[350px] transition-transform active:scale-[0.99] cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Biểu Đồ Thời Gian Khách Hàng Gọi Món</h3>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">Phân bố thời gian quyết định thêm món của khách tại bàn (Đơn vị: Giây).</p>
                    </div>
                </div>
                <div className="flex-1 w-full relative mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={menuEff.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradBrowse" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradDecide" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                            <Area type="monotone" dataKey="browse" name="Duyệt menu" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradBrowse)" dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Area type="monotone" dataKey="decide" name="Quyết định" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradDecide)" dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* ── BỔ SUNG YÊU CẦU: ROW 3 - Phễu Khám Phá & Xếp Hạng ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
            <div className="xl:col-span-12 2xl:col-span-5 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
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
                                    <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{ch.label}</span>
                                </div>
                                <span className="text-[14px] font-bold text-slate-900 dark:text-white">{ch.count}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${ch.percent}%`, backgroundColor: ch.color }} />
                                </div>
                                <span className="text-[11px] font-bold w-9 text-right" style={{ color: ch.color }}>{ch.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="xl:col-span-12 2xl:col-span-7 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col transition-transform active:scale-[0.99] cursor-pointer">
                <div className="mb-6">
                    <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> Bảng Xếp Hạng Gợi Ý
                            </h3>
                            <p className="text-[13px] font-medium text-slate-500 mt-1">Các sản phẩm đóng góp nhiều nhất qua AI Suggester.</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5">
                                <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Sản phẩm</th>
                                <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[25%] text-left">Kênh Chốt Sale</th>
                                <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[15%] text-right">Đã bán</th>
                                <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[20%] text-right">Thực thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestedItems?.slice(0, 8).map((item: any, idx: number) => {
                                const sourceMatch = firstItemSource.find((s:any) => s.source === item.source);
                                let sLabel = sourceMatch ? sourceMatch.label : item.source;
                                let sColor = sourceMatch ? sourceMatch.color : '#94a3b8';
                                return (
                                    <tr key={idx} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                        <td className="py-3.5 px-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-[8px] bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                                                    <Utensils size={14} className="text-slate-400" />
                                                </div>
                                                <span className="font-bold text-[13px] text-slate-900 dark:text-white">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-2">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sColor }} />
                                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{sLabel}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-2 text-right font-bold text-[13px] text-slate-900 dark:text-white">{item.qty}</td>
                                        <td className="py-3.5 px-2 text-right font-bold text-[14px] text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}</td>
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

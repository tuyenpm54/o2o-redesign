"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock, AlertTriangle, XCircle, ChevronDown, TrendingUp, Users,
    BarChart3, Calendar, Banknote, ShoppingBag, Table2, ShieldCheck,
    Flame, BellRing, Utensils, Inbox, Siren, CheckCircle2,
    ArrowRight, Wifi, MessageSquare, AlertCircle, QrCode,
    Timer, Search, MousePointerClick, BookOpen, ArrowDownRight, ArrowUpRight, ShoppingCart, LayoutDashboard
} from 'lucide-react';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Legend, ComposedChart, Bar, Line, Cell, BarChart, AreaChart, Area
} from 'recharts';
import { MOCK_MENU_EFFICIENCY } from '@/data/mock-dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { IconSmile2D, IconFrown2D } from '@/components/RatingIcons';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface SlaViolation {
    count: number;
    total: number;
    rate: number;
    avg_time: number;
}

interface SlaData {
    model: string;
    violations: Record<string, SlaViolation>;
    endToEnd: { avg: number; target: number; worst: number; isWithinSla: boolean };
    slaConfig: Record<string, { target: number; unit: string }>;
    totalOrdersToday: number;
    servedToday: number;
}

interface OccupancyData {
    active: number;
    total: number;
    occupancyRate: number;
    guestCount: number;
    avgGuestsPerTable: number;
    avgSessionMinutes: number;
}

interface LivePulse {
    kitchenLagCount: number;
    neglectedTablesCount: number;
    stockoutCount: number;
    activeTablesCount: number;
    timestamp: number;
}

const SLA_STEPS = [
    { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox },
    { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame },
    { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing },
    { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils },
] as const;

// ────────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const resId = user?.restaurant_id || 'all';

    const [livePulse, setLivePulse] = useState<LivePulse>({
        kitchenLagCount: 0, neglectedTablesCount: 0,
        stockoutCount: 0, activeTablesCount: 0, timestamp: Date.now()
    });
    const [slaData, setSlaData] = useState<SlaData | null>(null);
    const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);

    const [analyticRange, setAnalyticRange] = useState<'7d' | '30d'>('7d');
    const [analytics, setAnalytics] = useState<{
        trend: any[]; peakHours: any[]; peakDays: any[];
        suggestedItems: {id: string, name: string, img: string, source: string, qty: number, revenue: number}[];
        summary: { doanhThu: number; soDon: number; soKhach: number; soLuotGoiMon: number; doanhThuGoiY: number; o2oRate: number; aov: number; aovTable: number; cancellationRate: number; days: number; };
    }>({
        trend: [], peakHours: [], peakDays: [], suggestedItems: [],
        summary: { doanhThu: 0, soDon: 0, soKhach: 0, soLuotGoiMon: 0, doanhThuGoiY: 0, o2oRate: 0, aov: 0, aovTable: 0, cancellationRate: 0, days: 7 }
    });

    const [peakTab, setPeakTab] = useState<'hours' | 'days'>('hours');

    const fetchRealtime = useCallback(async () => {
        try {
            const [pulseRes, slaRes, occRes] = await Promise.all([
                fetch(`/api/admin/dashboard/live-pulse?resid=${resId}`),
                fetch(`/api/admin/dashboard/sla-metrics?resid=${resId}`),
                fetch(`/api/admin/dashboard/table-occupancy?resid=${resId}`),
            ]);
            const [pulse, sla, occ] = await Promise.all([pulseRes.json(), slaRes.json(), occRes.json()]);
            if (pulse.success) setLivePulse(pulse.data);
            if (sla.success) setSlaData(sla.data);
            if (occ.success) setOccupancy(occ.data);
        } catch (e) { console.error(e); }
    }, [resId]);

    useEffect(() => {
        fetchRealtime();
        const iv = setInterval(fetchRealtime, 15000);
        return () => clearInterval(iv);
    }, [fetchRealtime]);

    useEffect(() => {
        fetch(`/api/admin/dashboard/analytics?resid=${resId}&range=${analyticRange}`)
            .then(r => r.json()).then(d => { if (d.success) setAnalytics(d.data); }).catch(console.error);
    }, [resId, analyticRange]);

    const formatVND = (v: number) => {
        if (!v || isNaN(v)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
    };

    const totalViolations = slaData
        ? Object.values(slaData.violations).reduce((s, v) => s + v.count, 0)
        : 0;

    const violatingSteps = slaData
        ? SLA_STEPS.filter(step => {
            const v = slaData.violations[step.key];
            const cfg = slaData.slaConfig[step.key];
            return v && cfg && v.avg_time > cfg.target;
        })
        : [];

    type SlaStatus = 'ok' | 'warning' | 'critical';
    const slaStatus: SlaStatus = totalViolations === 0 ? 'ok' : totalViolations < 5 ? 'warning' : 'critical';

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-black min-h-screen">
            {/* ── HEADER ── */}
            <div className="pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 text-white flex items-center justify-center shadow-sm shrink-0">
                        <BarChart3 size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Báo Cáo Tăng Trưởng & Vận Hành
                        </h1>
                        <p className="text-slate-500 mt-0.5 font-medium text-sm">
                            Phân tích dữ liệu vận hành từ quá khứ
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ═══════════════════════════════════════
                    SECTION 2: ANALYTICS
                    ═══════════════════════════════════════ */}
                <div className="space-y-6">

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Tổng quan Hiệu suất</h2>
                            <p className="text-[13px] font-medium text-slate-500 mt-0.5">Dữ liệu tổng hợp từ các đơn hàng đã thanh toán.</p>
                        </div>
                        <div className="relative inline-block shrink-0">
                            <select value={analyticRange} onChange={e => setAnalyticRange(e.target.value as '7d' | '30d')}
                                className="appearance-none bg-white dark:bg-[#13141A] border-none shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-none dark:border dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-[13px] font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer">
                                <option value="7d">7 Ngày gần nhất</option>
                                <option value="30d">30 Ngày qua</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Doanh thu tổng', value: formatVND(analytics.summary.doanhThu), icon: <Banknote size={20} />, trend: '+12%', positive: true, primary: false },
                            { title: 'Số lượt khách', value: analytics.summary.soKhach.toString(), icon: <Users size={20} />, trend: '+5%', positive: true, primary: false },
                            { title: 'Số lượt gọi món', value: analytics.summary.soLuotGoiMon.toString(), icon: <Utensils size={20} />, trend: '+2%', positive: true, primary: false },
                            { title: 'Tỉ lệ sử dụng O2O', value: `${analytics.summary.o2oRate ? analytics.summary.o2oRate.toFixed(1) : 0}%`, icon: <QrCode size={20} />, trend: '+3%', positive: true, primary: false },
                        ].map(card => (
                            <div key={card.title} className={`rounded-[20px] p-5 relative overflow-hidden bg-white dark:bg-[#0c0c0e] shadow-[0_2px_14px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500`}>
                                        {card.icon}
                                    </div>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.positive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                        {card.trend}
                                    </span>
                                </div>
                                <p className="text-[13px] font-medium mb-1.5 text-slate-500">{card.title}</p>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* SLA Pipeline Breakdown */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 lg:p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Hiệu suất Bếp & Phục vụ</h3>
                                <p className="text-[13px] font-medium text-slate-500 mt-0.5">Phân tích thời gian lưu lại trung bình tại từng trạm.</p>
                            </div>
                        </div>
                        <SlaStatsPipeline analyticRange={analyticRange} resId={resId} />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Peak Hours & Days */}
                        <div className="lg:col-span-1 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Cực đại Vận hành</h3>
                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setPeakTab('hours')}
                                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${peakTab === 'hours' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Giờ
                                    </button>
                                    <button 
                                        onClick={() => setPeakTab('days')}
                                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${peakTab === 'days' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Ngày
                                    </button>
                                </div>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">
                                {peakTab === 'hours' ? 'Khung giờ đông khách nhất.' : 'Các ngày cao điểm trong tuần.'}
                            </p>
                            <div className="flex-1 min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakTab === 'hours' ? analytics.peakHours : analytics.peakDays} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#333" opacity={0.05} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey={peakTab === 'hours' ? "gio" : "ngay"} type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} width={80} />
                                        <Tooltip 
                                            formatter={(value: any) => (peakTab === 'hours' || peakTab === 'days') ? formatVND(Number(value)) : value}
                                            contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} 
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                                        />
                                        <Bar dataKey="doanhThu" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                            {(peakTab === 'hours' ? analytics.peakHours : analytics.peakDays).map((entry, i) => (
                                                <Cell key={i} fill={entry.doanhThu > (analytics.summary.doanhThu / Math.max((peakTab === 'hours' ? analytics.peakHours.length : analytics.peakDays.length), 1)) ? '#0f172a' : '#e2e8f0'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Growth Report */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Báo cáo Tăng trưởng</h3>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">Theo dõi doanh thu, lượt khách, lượt gọi & tỉ lệ sử dụng O2O theo ngày.</p>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analytics.trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                                        
                                        {/* Trục chính (bên trái) cho Doanh thu */}
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                                        
                                        {/* Trục phụ (bên phải) cho Tỉ lệ O2O */}
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fontWeight: 700, fill: '#f59e0b' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} domain={[0, 100]} />
                                        
                                        {/* Trục ẩn đằng sau cho Số lượng (Lượt khách, Số lượt gọi món) */}
                                        <YAxis yAxisId="count" orientation="right" hide />

                                        <Tooltip 
                                            contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                                            formatter={(value: any, name: any) => {
                                                if (name === 'Doanh thu') return [formatVND(value), name];
                                                if (name === 'Tỉ lệ O2O') return [`${value}%`, name];
                                                return [value, name];
                                            }}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingBottom: 25 }} />
                                        
                                        {/* Lượt khách: Biểu đồ cột */}
                                        <Bar yAxisId="count" dataKey="soKhach" name="Lượt khách" fill="#10b981" fillOpacity={0.3} radius={[6, 6, 0, 0]} maxBarSize={40} />
                                        
                                        {/* Doanh thu (Trục trái) */}
                                        <Line yAxisId="left" type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#0f172a" strokeWidth={3.5} dot={{ r: 5, fill: '#fff', stroke: '#0f172a', strokeWidth: 2.5 }} activeDot={{ r: 7, strokeWidth: 0 }} />
                                        
                                        {/* Lượt gọi món (Trục ẩn) */}
                                        <Line yAxisId="count" type="monotone" dataKey="soLuotGoiMon" name="Lượt gọi" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                                        
                                        {/* Tỉ lệ O2O (Trục phải) */}
                                        <Line yAxisId="right" type="monotone" dataKey="tyleO2O" name="Tỉ lệ O2O" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8" />

                {/* ═══════════════════════════════════════
                    SECTION 3: CX (CUSTOMER EXPERIENCE)
                    ═══════════════════════════════════════ */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Trải nghiệm Khách hàng (CX)</h2>
                            <p className="text-[13px] font-medium text-slate-500 mt-0.5">Phân tích đánh giá và gốc rễ các trải nghiệm chưa tốt.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CX Summary */}
                        <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 lg:p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col justify-center items-center text-center gap-6">
                            <div className="flex items-start justify-center gap-8 w-full mt-2">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        <IconSmile2D className="w-16 h-16" />
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0c0c0e]">92%</div>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-900 dark:text-white mt-2">Hài lòng</span>
                                    <span className="text-[11px] font-medium text-slate-500">314 đánh giá</span>
                                </div>
                                
                                <div className="w-px h-16 bg-slate-100 dark:bg-white/10" />

                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        <IconFrown2D className="w-16 h-16 grayscale opacity-80" />
                                        <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0c0c0e]">8%</div>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-900 dark:text-white mt-2">Phàn nàn</span>
                                    <span className="text-[11px] font-medium text-slate-500">28 đánh giá</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between mt-2 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-slate-400" />
                                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">Tổng khảo sát</span>
                                </div>
                                <span className="text-[14px] font-bold text-slate-900 dark:text-white">342</span>
                            </div>
                        </div>

                        {/* RCA (Root Cause Analysis - Trải nghiệm xấu) */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 lg:p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
                                <AlertCircle size={18} className="text-rose-500" /> Phân tích nguyên nhân phàn nàn
                            </h3>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">Tỉ lệ các lý do khiến khách hàng để lại đánh giá xấu (Tệ & Rất Tệ).</p>
                            
                            <div className="space-y-5">
                                {[
                                    { label: 'Thời gian chờ phục vụ lâu', count: 12, max: 28, color: 'bg-rose-500' },
                                    { label: 'Nhân viên chậm, thái độ chưa tốt', count: 7, max: 28, color: 'bg-orange-500' },
                                    { label: 'Món ăn không ngon / dở / nguội', count: 5, max: 28, color: 'bg-amber-500' },
                                    { label: 'Vệ sinh kém', count: 4, max: 28, color: 'bg-slate-500' }
                                ].map((reason, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{reason.label}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.round((reason.count / reason.max) * 100)}%</span>
                                                <span className="text-[10px] font-medium text-slate-400">({reason.count} lượt)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${reason.color} shadow-sm group-hover:brightness-110 transition-all duration-500 ease-out`} style={{ width: `${(reason.count / reason.max) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex gap-3 items-start">
                                <div className="mt-0.5 text-lg leading-none">💡</div>
                                <p className="text-[12px] font-medium text-rose-800 dark:text-rose-300 leading-relaxed">
                                    <strong className="font-bold text-rose-900 dark:text-rose-400">Ghi nhận AI:</strong> Phần lớn phàn nàn liên quan đến <strong className="font-bold text-rose-900 dark:text-rose-400">thời gian chờ (43%)</strong>. Hãy kiểm tra báo cáo SLA Bếp (khung giờ vàng) để xử lý thắt cổ chai điều phối.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8" />

                {/* ═══════════════════════════════════════
                    DECK 5: MENU EFFICIENCY
                    ═══════════════════════════════════════ */}
                <MenuEfficiencyDeck analytics={analytics} />

            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// SLA Stats Pipeline
// ────────────────────────────────────────────────────────────
function SlaStatsPipeline({ analyticRange, resId }: { analyticRange: string; resId: string }) {
    const [data, setData] = useState<SlaData | null>(null);

    useEffect(() => {
        fetch(`/api/admin/dashboard/sla-metrics?resid=${resId}`)
            .then(r => r.json()).then(d => { if (d.success) setData(d.data); }).catch(console.error);
    }, [resId, analyticRange]);

    if (!data) return (
        <div className="flex items-center justify-center h-20 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
    );

    const steps = [
        { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox },
        { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame },
        { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing },
        { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils },
    ];

    return (
        <div className="space-y-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-slate-50 dark:bg-white/5 text-[13px] font-medium
                ${data.endToEnd.isWithinSla ? 'border-slate-800 dark:border-slate-300 text-slate-700 dark:text-slate-300' : 'border-rose-500 text-slate-900 dark:text-white'}`}>
                <Clock size={16} className={data.endToEnd.isWithinSla ? 'text-slate-500' : 'text-rose-500'} />
                <span>Hoàn thành 1 order trung bình: <strong className="font-bold">{data.endToEnd.avg} phút</strong></span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500">Mục tiêu: {data.endToEnd.target} phút</span>
                {data.endToEnd.worst > 0 && <span className="ml-auto text-rose-500 font-bold">Worst: {data.endToEnd.worst} ph</span>}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
                {steps.map(step => {
                    const v = data.violations[step.key];
                    const cfg = data.slaConfig[step.key];
                    if (!v) return null;
                    const avgTime = v.avg_time || 0;
                    const isCritical = avgTime > cfg.target;
                    const ratio = Math.min((avgTime / cfg.target) * 100, 100);
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="bg-white dark:bg-[#0c0c0e] p-5 relative">
                            {isCritical && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Icon size={16} className={isCritical ? 'text-rose-500' : 'text-slate-400'} />
                                    <span className={`text-[13px] font-semibold ${isCritical ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{step.label}</span>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 bg-slate-50 dark:bg-white/5 rounded px-1.5 py-0.5">SLA {cfg.target}p</span>
                            </div>
                            
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className={`text-2xl font-bold tracking-tight ${isCritical ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{avgTime.toFixed(1)}</span>
                                <span className="text-xs font-medium text-slate-500">phút</span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-rose-500' : 'bg-slate-800 dark:bg-slate-400'}`} style={{ width: `${ratio}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Realtime Alert Card Component
// ────────────────────────────────────────────────────────────
function RealtimeAlertCard({ icon, label, count, desc, isDanger }: {
    icon: React.ReactNode; label: string; count: number; desc: string; isDanger: boolean;
}) {
    return (
        <div className={`rounded-3xl p-5 transition-all duration-300 flex items-center justify-between relative overflow-hidden flex-1 ${isDanger
            ? 'bg-rose-500'
            : 'bg-white dark:bg-[#0c0c0e] shadow-[0_2px_14px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5'}`}>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                    {icon}
                </div>
                <div>
                    <h4 className={`text-[13px] font-bold ${isDanger ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{label}</h4>
                    <p className={`text-[12px] font-medium mt-0.5 ${isDanger ? 'text-rose-100' : 'text-slate-500'}`}>{desc}</p>
                </div>
            </div>
            
            <div className="flex flex-col items-end relative z-10 shrink-0">
                <span className={`text-4xl font-bold tracking-tight leading-none ${isDanger ? 'text-white' : 'text-slate-400'}`}>{count}</span>
                {isDanger && (
                    <span className="flex h-2.5 w-2.5 relative mt-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                )}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// DECK 5: Menu Efficiency
// ────────────────────────────────────────────────────────────
function MenuEfficiencyDeck({ analytics }: { analytics?: any }) {
    const d = MOCK_MENU_EFFICIENCY.data;

    const fmtTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatVND = (v: number) => {
        if (!v || isNaN(v)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
    };

    const DeltaBadge = ({ value, suffix = '%', hideArrow = false }: { value: number; suffix?: string; hideArrow?: boolean }) => {
        const isGood = value < 0;
        return (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                {!hideArrow && (isGood ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />)}
                {value > 0 ? '+' : ''}{value.toFixed(0)}{suffix}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Hành Vi Gọi Món Của Khách Hàng</h2>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">Thời gian khách phân vân, tỉ lệ chốt đơn và sự hiệu quả của các danh mục món ăn.</p>
                </div>
            </div>

            {/* ROW 1: Hero Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Thời gian chọn món', desc: 'Từ lúc quét QR đến lúc rớt món vào giỏ', value: fmtTime(d.avgBrowse), icon: <BookOpen size={20} />, delta: d.browseDelta, star: true },
                    { title: 'Thời gian chốt món', desc: 'Từ lúc có món trong giỏ đến khi Bấm gọi', value: fmtTime(d.avgDecide), icon: <MousePointerClick size={20} />, delta: d.decideDelta, star: false },
                    { title: 'Tổng thời gian gọi', desc: 'Từ lúc quét QR đến lúc chốt đơn', value: fmtTime(d.avgTotal), icon: <Timer size={20} />, delta: d.totalDelta, star: false },
                    { title: 'Khách thoát thẻ (Ko gọi)', desc: 'Quét mã mở Menu nhưng không gọi gì', value: `${d.dropOffRate}%`, icon: <XCircle size={20} />, delta: d.dropOffDelta, star: false },
                ].map(card => (
                    <div key={card.title} className={`rounded-[20px] p-5 relative overflow-hidden bg-white dark:bg-[#0c0c0e] shadow-[0_2px_14px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 ${card.star ? 'ring-2 ring-indigo-500/20' : ''}`}>
                        {card.star && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />}
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-2 rounded-xl ${card.star ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                                {card.icon}
                            </div>
                            <DeltaBadge value={card.delta} />
                        </div>
                        <p className="text-[13px] font-medium mb-0.5 text-slate-500">{card.title}</p>
                        <p className="text-[11px] font-medium mb-2 text-slate-400">{card.desc}</p>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* ROW 2: Macro Analysis (Split 40/60) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 40vw Left Col: Funnel + Ordering Behavior */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    
                    {/* Funnel */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Hành Trình Gọi Món</h3>
                        <p className="text-[13px] font-medium text-slate-500 mb-6">Tỉ lệ khách hàng đi từ bước quét mã đến lúc thanh toán.</p>
                        <div className="space-y-3">
                            {d.funnel.map((step, idx) => {
                                const isLast = idx === d.funnel.length - 1;
                                const prevRate = idx > 0 ? d.funnel[idx - 1].rate : 100;
                                const dropRate = prevRate - step.rate;
                                return (
                                    <div key={step.step}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{step.step}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white">{step.count}</span>
                                                <span className="text-[11px] font-medium text-slate-400">{step.rate}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${step.rate > 90 ? 'bg-slate-800 dark:bg-slate-300' : step.rate > 80 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                                style={{ width: `${step.rate}%` }}
                                            />
                                        </div>
                                        {dropRate > 0 && !isLast && (
                                            <p className="text-[10px] font-medium text-rose-500 mt-1 text-right">−{dropRate.toFixed(1)}% khách thoát</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ordering Behavior */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Hành vi Chọn Món Của Khách</h3>
                        <p className="text-[13px] font-medium text-slate-500 mb-5">Thống kê cách khách hàng thêm món và gọi thêm khi đang ăn.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-100 dark:border-white/5 p-3.5 text-center">
                                    <p className="text-[11px] font-medium text-slate-500 mb-1">Số món khi gọi lần đầu</p>
                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{d.orderingBehavior.avgItemsFirstOrder}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 dark:border-white/5 p-3.5 text-center">
                                    <p className="text-[11px] font-medium text-slate-500 mb-1">Số lần gọi thêm (Tb/bàn)</p>
                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{d.orderingBehavior.avgRoundsPerTable}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-100 dark:border-white/5 p-3 text-center">
                                    <p className="text-[14px] font-bold tracking-tight text-amber-600">{d.orderingBehavior.singleRoundRate}%</p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Chỉ gọi đúng 1 lần</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 dark:border-white/5 p-3 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500" />
                                    <p className="text-[14px] font-bold tracking-tight text-emerald-600">{d.orderingBehavior.multiRoundRate}%</p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Gọi thêm đồ (≥ 3 lần)</p>
                                </div>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed px-1">
                                {d.orderingBehavior.singleRoundRate > 40
                                    ? '💡 Nhiều khách chỉ gọi 1 lần rồi thôi: Thực đơn hiện tại chưa đủ kích thích khách gọi thêm đồ ăn vặt/nước uống khi đang dùng bữa.'
                                    : '✓ Khách hàng chủ động gọi thêm món rất nhiều: Thực đơn đang làm tốt vai trò bán chéo.'}
                            </p>
                        </div>
                    </div>

                </div>

                {/* 60vw Right Col: Trend Area Chart */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex-1 flex flex-col h-full min-h-[500px]">
                        
                        <div className="flex items-center justify-between xl:items-end flex-col xl:flex-row gap-3 mb-1">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Biểu Đồ Thời Gian Khách Hàng Gọi Món</h3>
                                <p className="text-[13px] font-medium text-slate-500 mt-1">Theo dõi thời gian khách phân vân và chốt đơn qua từng ngày. Mũi tên đi xuống (nhanh hơn) là tốt.</p>
                            </div>
                            {d.menuChange && (
                                <div className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1.5 flex items-center gap-2 shrink-0 self-start xl:self-auto">
                                    <span className="flex h-1.5 w-1.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                                    </span>
                                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                        Đã đổi Thực đơn ngày: {d.menuChange.changeDate}
                                    </span>
                                </div>
                            )}
                        </div>

                        {d.menuChange && (
                            <div className="mt-5 mb-2 rounded-[16px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{d.menuChange.changeLabel}</p>
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">So sánh sự thay đổi của khách hàng trước/sau sự kiện này</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex-1 sm:flex-none flex flex-col gap-1 items-end bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Thời Gian Đắn Đo</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-slate-400 line-through">{fmtTime(d.menuChange.before.avgBrowse)}</span>
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white">{fmtTime(d.menuChange.after.avgBrowse)}</span>
                                            <DeltaBadge value={((d.menuChange.after.avgBrowse - d.menuChange.before.avgBrowse) / d.menuChange.before.avgBrowse) * 100} hideArrow={true} />
                                        </div>
                                    </div>
                                    <div className="flex-1 sm:flex-none flex flex-col gap-1 items-end bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Khách Bỏ Menu Trống</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-slate-400 line-through">{d.menuChange.before.dropOff}%</span>
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white">{d.menuChange.after.dropOff}%</span>
                                            <DeltaBadge value={((d.menuChange.after.dropOff - d.menuChange.before.dropOff) / d.menuChange.before.dropOff) * 100} hideArrow={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 mt-6 h-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} tickFormatter={v => `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, '0')}`} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                                        formatter={(val: any, name: any) => [`${Math.floor(Number(val) / 60)}:${(Number(val) % 60).toString().padStart(2, '0')}`, name]}
                                    />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingBottom: 20 }} />
                                    <Area type="monotone" dataKey="browse" name="Duyệt menu" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradBrowse)" dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Area type="monotone" dataKey="decide" name="Quyết định" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradDecide)" dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>
            </div>

            {/* ROW 3: Micro Analysis (Split Layout) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
                
                {/* ── Left col: Phễu Nhặt Món Đầu Tiên ── */}
                <div className="xl:col-span-12 2xl:col-span-5 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <MousePointerClick size={18} className="text-indigo-500" />
                            Phễu Khám Phá Đầu Tiên
                        </h3>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">
                            Kênh dẫn dắt khách nhặt món đầu tiên.
                        </p>
                    </div>

                    <div className="space-y-5 flex-1">
                        {d.firstItemSource.map((ch: any) => (
                            <div key={ch.source} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{ch.label}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">Key: {ch.source}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">{ch.count}</span>
                                        <span className="text-[11px] font-medium text-slate-400">lượt</span>
                                    </div>
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

                {/* ── Right col: Bảng Xếp Hạng Món Gợi Ý O2O ── */}
                <div className="xl:col-span-12 2xl:col-span-7 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-500" />
                                    Bảng Xếp Hạng Gợi Ý & Khám Phá
                                </h3>
                                <p className="text-[13px] font-medium text-slate-500 mt-1">
                                    Top món ăn bán chạy nhất, đối chiếu theo Kênh chốt sale tương ứng.
                                </p>
                            </div>
                            <div className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[12px] font-bold flex items-center gap-1.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Top Doanh Thu
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        {!analytics?.suggestedItems || analytics.suggestedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                <LayoutDashboard size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Chưa đủ dữ liệu ghi nhận</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
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
                                        {analytics.suggestedItems.slice(0, 8).map((item: any, idx: number) => {
                                            const sourceMatch = d.firstItemSource.find((s:any) => s.source === item.source);
                                            const sourceLabel = sourceMatch ? sourceMatch.label : item.source;
                                            const sourceColor = sourceMatch ? sourceMatch.color : '#94a3b8';

                                            return (
                                                <tr key={idx} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3.5 px-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-[8px] overflow-hidden shrink-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center p-[1px] border border-slate-200 dark:border-white/10">
                                                                {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-[6px]" /> : <Utensils size={14} className="text-slate-400" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[13px] text-slate-900 dark:text-white line-clamp-1">{item.name}</span>
                                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">ID: {item.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-2">
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                            <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: sourceColor }} />
                                                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 truncate">{sourceLabel}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-2 text-right">
                                                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{item.qty}</span>
                                                    </td>
                                                    <td className="py-3.5 px-2 text-right">
                                                        <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{formatVND(item.revenue)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

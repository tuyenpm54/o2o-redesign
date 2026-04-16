"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock, AlertTriangle, XCircle, ChevronDown, TrendingUp, Users,
    BarChart3, Calendar, Banknote, ShoppingBag, Table2, ShieldCheck,
    Flame, BellRing, Utensils, Inbox, Siren, CheckCircle2,
    ArrowRight, Wifi
} from 'lucide-react';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Legend, ComposedChart, Bar, Line, Cell, BarChart
} from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { QrCode } from 'lucide-react';

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
        trend: any[]; peakHours: any[];
        suggestedItems: {id: string, name: string, img: string, source: string, qty: number, revenue: number}[];
        summary: { doanhThu: number; soDon: number; soKhach: number; soLuotGoiMon: number; doanhThuGoiY: number; o2oRate: number; aov: number; aovTable: number; cancellationRate: number; days: number; };
    }>({
        trend: [], peakHours: [], suggestedItems: [],
        summary: { doanhThu: 0, soDon: 0, soKhach: 0, soLuotGoiMon: 0, doanhThuGoiY: 0, o2oRate: 0, aov: 0, aovTable: 0, cancellationRate: 0, days: 7 }
    });

    const fetchRealtime = useCallback(async () => {
        try {
            const [pulseRes, slaRes, occRes] = await Promise.all([
                fetch(`/api/admin/dashboard/live-pulse?resid=${resId}`),
                fetch(`/api/admin/dashboard/sla-tracker?resid=${resId}`),
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
            <div className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        <Wifi size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Tổng quan Thực chiến
                        </h1>
                        <p className="text-slate-500 mt-0.5 font-medium text-sm">
                            Giám sát sự cố tức thì & Phân tích hiệu suất vận hành toàn diện
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ═══════════════════════════════════════
                    SECTION 1: REALTIME 
                    ═══════════════════════════════════════ */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* ── Left: Priority Action Alerts ── */}
                        <div className="lg:col-span-3 flex flex-col justify-between gap-4">
                            <RealtimeAlertCard
                                icon={<Siren size={20} strokeWidth={2}/>}
                                label="Bếp Tồn Đơn"
                                count={livePulse.kitchenLagCount}
                                desc="Quá 15p chưa ra món"
                                isDanger={livePulse.kitchenLagCount > 0}
                            />
                            <RealtimeAlertCard
                                icon={<AlertTriangle size={20} strokeWidth={2}/>}
                                label="Bàn Bị Bỏ Quên"
                                count={livePulse.neglectedTablesCount}
                                desc="Khách đợi mòn râu"
                                isDanger={livePulse.neglectedTablesCount > 0}
                            />
                            <RealtimeAlertCard
                                icon={<XCircle size={20} strokeWidth={2}/>}
                                label="Đồ Hết / Hủy"
                                count={livePulse.stockoutCount}
                                desc="Ghi nhận trong ngày"
                                isDanger={false}
                            />
                        </div>

                        {/* ── Center: Table Occupancy ── */}
                        <div className="lg:col-span-6 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 lg:p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                        <Table2 size={20} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sức chứa Hiện tại</h3>
                                        <p className="text-[13px] font-medium text-slate-500 mt-0.5">Theo dõi mật độ khách tức thì</p>
                                    </div>
                                </div>
                                {occupancy && (
                                    <div className="text-right flex items-baseline gap-1">
                                        <p className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{occupancy.occupancyRate}</p>
                                        <span className="text-lg font-medium text-slate-400">%</span>
                                    </div>
                                )}
                            </div>

                            {occupancy ? (
                                <div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-8">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${occupancy.occupancyRate > 80 ? 'bg-rose-500' : occupancy.occupancyRate > 50 ? 'bg-amber-500' : 'bg-slate-800 dark:bg-slate-200'}`}
                                            style={{ width: `${occupancy.occupancyRate}%` }}>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <p className="text-[13px] font-medium text-slate-500">Bàn Đang Mở</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{occupancy.active} <span className="text-sm font-medium text-slate-400">/ {occupancy.total}</span></p>
                                        </div>
                                        <div className="flex flex-col gap-1 px-4 border-l border-slate-100 dark:border-white/5">
                                            <p className="text-[13px] font-medium text-slate-500">Khách Ước Tính</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{occupancy.guestCount}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 pl-4 border-l border-slate-100 dark:border-white/5">
                                            <p className="text-[13px] font-medium text-slate-500">TG Lưu Trú</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{occupancy.avgSessionMinutes} <span className="text-sm font-medium text-slate-400">ph</span></p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center flex-1 min-h-[140px]">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* ── Right: SLA Overview ── */}
                        <div className="lg:col-span-3 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 
                                        ${slaStatus === 'ok' ? 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-white/5' 
                                        : slaStatus === 'warning' ? 'text-amber-700 bg-amber-50' 
                                        : 'text-rose-700 bg-rose-50'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${slaStatus === 'ok' ? 'bg-slate-400' : slaStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        {slaStatus === 'ok' ? 'Ổn Định' : slaStatus === 'warning' ? 'Chú Ý Nhẹ' : 'Có Biến'}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-[13px] font-medium text-slate-500 mb-1">Báo cáo Nóng</p>
                                    <h3 className={`text-lg font-bold tracking-tight leading-snug ${slaStatus === 'ok' ? 'text-slate-900 dark:text-white' : slaStatus === 'warning' ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {slaStatus === 'ok' ? 'Luồng phục vụ nhà bếp đang trơn tru.' : `Cảnh báo! Có ${totalViolations} tác vụ vượt ngưỡng.`}
                                    </h3>
                                </div>

                                {violatingSteps.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {violatingSteps.slice(0,2).map(step => (
                                            <div key={step.key} className="flex justify-between items-center text-[13px] px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 font-medium">
                                                <span>{step.label}</span>
                                                <span className="font-bold">{slaData!.violations[step.key].avg_time.toFixed(1)}p</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                                        <CheckCircle2 size={18} className="text-slate-400 mt-0.5 shrink-0" />
                                        <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Không ghi nhận điểm thắt cổ chai nào trong ca này.</p>
                                    </div>
                                )}
                            </div>

                            {slaData && (
                                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-end justify-between">
                                        <span className="text-[13px] font-medium text-slate-500">Đơn Hoàn Thành</span>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                            {slaData.servedToday} <span className="text-sm text-slate-400 font-medium">/ {slaData.totalOrdersToday}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8" />

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
                        {/* Peak Hours */}
                        <div className="lg:col-span-1 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Giờ Vàng Doanh thu</h3>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">Khung giờ có lượng khách đông nhất.</p>
                            <div className="flex-1 min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.peakHours} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#333" opacity={0.05} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="gio" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} width={50} />
                                        <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                        <Bar dataKey="doanhThu" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                            {analytics.peakHours.map((entry, i) => (
                                                <Cell key={i} fill={entry.doanhThu > (analytics.summary.doanhThu / Math.max(analytics.peakHours.length, 1)) ? '#0f172a' : '#e2e8f0'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue + Orders trend */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Lưu lượng Giao dịch</h3>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">Diễn biến doanh thu & số đơn qua các ngày.</p>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analytics.trend} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#333" opacity={0.05} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" hide />
                                        <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12, border: 'none', color: '#fff', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
                                        <Bar yAxisId="right" dataKey="soDon" name="Số đơn" fill="#f1f5f9" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                        <Line yAxisId="left" type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Items Revenue Table */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Bảng xếp hạng Gợi ý O2O
                            </h3>
                            <p className="text-[13px] font-medium text-slate-500 mt-1">
                                Các món đem lại doanh thu cao nhất nhờ chiến lược Cross-sell & Up-sell tự động.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/5">
                                        <th className="pb-3 px-2 text-[12px] font-semibold text-slate-500 w-1/2">Sản phẩm</th>
                                        <th className="pb-3 px-2 text-[12px] font-semibold text-slate-500">Phễu tiếp cận</th>
                                        <th className="pb-3 px-2 text-right text-[12px] font-semibold text-slate-500">Đã bán</th>
                                        <th className="pb-3 px-2 text-right text-[12px] font-semibold text-slate-500">Thực thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.suggestedItems.length > 0 ? analytics.suggestedItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                        {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" /> : <Utensils size={16} className="text-slate-400" />}
                                                    </div>
                                                    <span className="font-semibold text-[13px] text-slate-900 dark:text-slate-200 line-clamp-1">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium">
                                                    {item.source === 'best_seller' ? 'Top Bán chạy' : 
                                                     item.source === 'history' ? 'Lịch sử ăn uống' : 
                                                     item.source === 'combo' ? 'Combo thông minh' : 
                                                     item.source === 'onboarding' ? 'Màn hình Onboard' : 
                                                     item.source === 'cart_recommend' ? 'Gợi ý thanh toán' : 
                                                     item.source}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right font-medium text-[13px] text-slate-600 dark:text-slate-400">{item.qty} <span className="text-xs text-slate-400">phần</span></td>
                                            <td className="py-3 px-2 text-right">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="font-bold text-[13px] text-slate-900 dark:text-white">{formatVND(item.revenue)}</span>
                                                    <div className="w-20 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-800 dark:bg-slate-400" style={{ width: `${Math.min((item.revenue / (analytics.summary.doanhThuGoiY || 1)) * 100 * 3, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-[13px] text-slate-400 font-medium">Chưa có dữ liệu giao dịch từ AI/Gợi ý.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
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
        fetch(`/api/admin/dashboard/sla-tracker?resid=${resId}`)
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

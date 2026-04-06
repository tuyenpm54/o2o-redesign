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

// ────────────────────────────────────────────────────────────
// SLA Step Config (shared between realtime summary + analytics)
// ────────────────────────────────────────────────────────────
const SLA_STEPS = [
    { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox, color: 'slate' },
    { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame, color: 'orange' },
    { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing, color: 'amber' },
    { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils, color: 'emerald' },
] as const;

// ────────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'realtime' | 'analytics'>('realtime');

    // Restaurant Manager: dùng restaurant được assign cho user, không có option chọn
    const resId = user?.restaurant_id || 'all';

    const [livePulse, setLivePulse] = useState<LivePulse>({
        kitchenLagCount: 0, neglectedTablesCount: 0,
        stockoutCount: 0, activeTablesCount: 0, timestamp: Date.now()
    });
    const [slaData, setSlaData] = useState<SlaData | null>(null);
    const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);

    // Analytics tab
    const [analyticRange, setAnalyticRange] = useState<'7d' | '30d'>('7d');
    const [analytics, setAnalytics] = useState<{
        trend: any[]; peakHours: any[];
        suggestedItems: {id: string, name: string, img: string, source: string, qty: number, revenue: number}[];
        summary: { doanhThu: number; soDon: number; soKhach: number; soLuotGoiMon: number; doanhThuGoiY: number; aov: number; aovTable: number; cancellationRate: number; days: number; };
    }>({
        trend: [], peakHours: [], suggestedItems: [],
        summary: { doanhThu: 0, soDon: 0, soKhach: 0, soLuotGoiMon: 0, doanhThuGoiY: 0, aov: 0, aovTable: 0, cancellationRate: 0, days: 7 }
    });



    const fetchRealtime = useCallback(async () => {
        if (activeTab !== 'realtime') return;
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
    }, [resId, activeTab]);

    useEffect(() => {
        if (activeTab !== 'realtime') return;
        fetchRealtime();
        const iv = setInterval(fetchRealtime, 15000);
        return () => clearInterval(iv);
    }, [activeTab, fetchRealtime]);

    useEffect(() => {
        if (activeTab !== 'analytics') return;
        fetch(`/api/admin/dashboard/analytics?resid=${resId}&range=${analyticRange}`)
            .then(r => r.json()).then(d => { if (d.success) setAnalytics(d.data); }).catch(console.error);
    }, [activeTab, resId, analyticRange]);

    const formatVND = (v: number) => {
        if (!v || isNaN(v)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
    };

    // ── Compute SLA status for realtime card ──
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                        {activeTab === 'realtime' ? <Wifi size={22} strokeWidth={2.5} /> : <BarChart3 size={22} strokeWidth={2.5} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {activeTab === 'realtime' ? 'Giám sát Thời gian thực' : 'Báo cáo Thống kê'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-medium text-sm">
                            {activeTab === 'realtime' ? 'Phát hiện sự cố & cảnh báo vượt SLA tức thì' : 'Phân tích hiệu suất vận hành theo khoảng thời gian'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex bg-slate-200/60 dark:bg-[#1A1D27] p-1 rounded-2xl border border-slate-300/50 dark:border-white/10">
                        {(['realtime', 'analytics'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab ? 'bg-white dark:bg-[#2A2E3B] shadow text-[#DF1B41]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                                {tab === 'realtime' ? <><Wifi size={16} /> Thời gian thực</> : <><BarChart3 size={16} /> Báo cáo</>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════
                TAB 1: REALTIME — Giám sát tức thì
                Chỉ hiển thị: SLA Status + Công suất bàn + Alerts
                ═══════════════════════════════════════ */}
            {activeTab === 'realtime' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">

                    {/* ROW 1: SLA Status (hero card) + Table Occupancy */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* SLA Status Card — simple & decisive */}
                        <div className={`lg:col-span-1 rounded-3xl p-6 border shadow-sm relative overflow-hidden flex flex-col gap-5 transition-colors duration-500
                            ${slaStatus === 'ok'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20'
                                : slaStatus === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/20'
                                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/20'}`}>

                            <div className={`absolute top-0 left-0 w-full h-1 ${slaStatus === 'ok' ? 'bg-emerald-400' : slaStatus === 'warning' ? 'bg-amber-400' : 'bg-rose-500'}`} />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className={slaStatus === 'ok' ? 'text-emerald-600' : slaStatus === 'warning' ? 'text-amber-600' : 'text-rose-600'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái SLA</span>
                                </div>
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full
                                    ${slaStatus === 'ok' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                    : slaStatus === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${slaStatus === 'ok' ? 'bg-emerald-500 animate-pulse' : slaStatus === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                                    {slaStatus === 'ok' ? 'Ổn định' : slaStatus === 'warning' ? 'Chú ý' : 'Cảnh báo'}
                                </div>
                            </div>

                            {/* Big status message */}
                            <div>
                                {slaStatus === 'ok' ? (
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />
                                            <p className="text-xl font-black text-emerald-800 dark:text-emerald-300 leading-tight">Vận hành ổn định</p>
                                        </div>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                                            Không có đơn nào vượt SLA trong phiên hiện tại.
                                        </p>
                                    </div>
                                ) : slaStatus === 'warning' ? (
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertTriangle size={28} className="text-amber-500 shrink-0" />
                                            <p className="text-xl font-black text-amber-800 dark:text-amber-300 leading-tight">Có {totalViolations} vi phạm nhỏ</p>
                                        </div>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Cần theo dõi thêm nhưng chưa cần can thiệp.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Siren size={28} className="text-rose-500 shrink-0" />
                                            <p className="text-xl font-black text-rose-800 dark:text-rose-300 leading-tight">{totalViolations} đơn vượt SLA</p>
                                        </div>
                                        <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Cần can thiệp ngay vào các bước bên dưới.</p>
                                    </div>
                                )}
                            </div>

                            {/* Violating steps — only show if there are issues */}
                            {violatingSteps.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bước đang chậm</p>
                                    {violatingSteps.map(step => {
                                        const v = slaData!.violations[step.key];
                                        const cfg = slaData!.slaConfig[step.key];
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className="flex items-center justify-between bg-white/60 dark:bg-black/20 rounded-2xl px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={13} className="text-rose-500" />
                                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{step.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500">{v.avg_time.toFixed(1)}ph</span>
                                                    <ArrowRight size={10} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-rose-500 bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">SLA {cfg.target}ph</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Footer: total orders today */}
                            {slaData && (
                                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hôm nay</span>
                                    <span className="text-[10px] font-black text-slate-500">{slaData.servedToday}/{slaData.totalOrdersToday} đơn hoàn thành</span>
                                </div>
                            )}
                        </div>

                        {/* Table Occupancy */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl"><Table2 size={17} /></div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Công suất bàn</h3>
                                </div>
                                {occupancy && (
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                                        {occupancy.occupancyRate}% <span className="text-xs font-bold text-slate-400">lấp đầy</span>
                                    </p>
                                )}
                            </div>

                            {occupancy ? (
                                <>
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${occupancy.occupancyRate > 80 ? 'bg-rose-500' : occupancy.occupancyRate > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: `${occupancy.occupancyRate}%` }} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Bàn đang có khách', value: `${occupancy.active} / ${occupancy.total}`, sub: 'bàn' },
                                            { label: 'Khách đang ở quán', value: occupancy.guestCount, sub: 'người' },
                                            { label: 'Thời gian phiên TB', value: occupancy.avgSessionMinutes, sub: 'phút' },
                                        ].map(item => (
                                            <div key={item.label} className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-28">
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ROW 2: Alert Counters — compact horizontal */}
                    <div className="bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sự cố tức thì</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-[9px] font-bold text-slate-400">Cập nhật mỗi 15 giây</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <RealtimeAlertCard
                                icon={<Siren size={18} />}
                                label="Bếp đang tồn đơn"
                                count={livePulse.kitchenLagCount}
                                desc="Đơn chờ quá 15 phút chưa ra món"
                                isDanger={livePulse.kitchenLagCount > 0}
                            />
                            <RealtimeAlertCard
                                icon={<AlertTriangle size={18} />}
                                label="Khách chờ lâu"
                                count={livePulse.neglectedTablesCount}
                                desc="Yêu cầu chưa được phản hồi"
                                isDanger={livePulse.neglectedTablesCount > 0}
                            />
                            <RealtimeAlertCard
                                icon={<XCircle size={18} />}
                                label="Món hết / bị hủy"
                                count={livePulse.stockoutCount}
                                desc="Tổng từ đầu phiên hôm nay"
                                isDanger={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                TAB 2: ANALYTICS — Báo cáo thống kê
                SLA pipeline breakdown + revenue + O2O
                ═══════════════════════════════════════ */}
            {activeTab === 'analytics' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">

                    {/* Range Selector */}
                    <div className="flex items-center justify-between bg-white dark:bg-[#13141A] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center rounded-xl"><Calendar size={18} /></div>
                            <div>
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">Báo cáo theo kỳ</h2>
                                <p className="text-[10px] font-semibold text-slate-400">Tổng hợp từ dữ liệu Hoá đơn thực tế</p>
                            </div>
                        </div>
                        <div className="relative">
                            <select value={analyticRange} onChange={e => setAnalyticRange(e.target.value as '7d' | '30d')}
                                className="appearance-none bg-slate-100 dark:bg-[#2A2E3B] rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#DF1B41] cursor-pointer outline-none">
                                <option value="7d">7 Ngày (1 Tuần)</option>
                                <option value="30d">30 Ngày (1 Tháng)</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Doanh thu', value: formatVND(analytics.summary.doanhThu), icon: <Banknote size={18} />, trend: '+12%', positive: true },
                            { title: 'Số lượt khách', value: analytics.summary.soKhach.toString(), icon: <Users size={18} />, trend: '+5%', positive: true },
                            { title: 'Số lượt gọi món', value: analytics.summary.soLuotGoiMon.toString(), icon: <Utensils size={18} />, trend: '+2%', positive: true },
                            { title: 'Doanh thu tới từ gợi ý', value: formatVND(analytics.summary.doanhThuGoiY), icon: <Flame size={18} />, trend: '+8%', positive: true },
                        ].map(card => (
                            <div key={card.title} className="bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl">{card.icon}</div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${card.positive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>{card.trend}</span>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                                <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* SLA Pipeline Breakdown — statistical, not realtime */}
                    <div className="bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">Phân tích Hành trình Món ăn</h3>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                                Thống kê thời gian trung bình mỗi bước trong kỳ báo cáo. Bước nào vượt SLA nhiều → đó là điểm nghẽn cần cải thiện.
                            </p>
                        </div>
                        <SlaStatsPipeline analyticRange={analyticRange} resId={resId} />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Peak Hours */}
                        <div className="lg:col-span-1 bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">Giờ Vàng Doanh thu</h3>
                            <p className="text-[10px] font-semibold text-slate-400 mb-5">Khung giờ có doanh thu trên mức trung bình.</p>
                            <div className="flex-1 min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.peakHours} layout="vertical" margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#333" opacity={0.08} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="gio" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} width={50} />
                                        <Tooltip contentStyle={{ background: '#1A1D27', borderRadius: 12, border: 'none', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                        <Bar dataKey="doanhThu" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                            {analytics.peakHours.map((entry, i) => (
                                                <Cell key={i} fill={entry.doanhThu > (analytics.summary.doanhThu / Math.max(analytics.peakHours.length, 1)) ? '#F9B208' : '#334155'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue + Orders trend */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">Doanh thu & Số đơn theo ngày</h3>
                            <p className="text-[10px] font-semibold text-slate-400 mb-5">Tương quan giữa dòng tiền và tần suất gọi món.</p>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analytics.trend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#333" opacity={0.12} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" hide />
                                        <Tooltip contentStyle={{ background: '#1A1D27', borderRadius: 12, border: 'none', color: '#fff', fontSize: 12 }} />
                                        <Legend verticalAlign="top" height={36} formatter={v => <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{v === 'doanhThu' ? 'Doanh thu' : 'Số đơn'}</span>} />
                                        <Bar yAxisId="right" dataKey="soDon" name="soDon" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                        <Line yAxisId="left" type="monotone" dataKey="doanhThu" name="doanhThu" stroke="#DF1B41" strokeWidth={3} dot={{ r: 3, fill: '#fff', stroke: '#DF1B41', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Items Revenue Table */}
                    <div className="bg-white dark:bg-[#13141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Flame size={18} className="text-orange-500" /> Doanh thu từ gợi ý chọn món
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                                Hiệu quả chuyển đổi của các chiến dịch gợi ý món bán chạy, món xem gần đây, combo, hoặc từ màn hình onboarding.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="py-3 px-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-1/2">Món ăn</th>
                                        <th className="py-3 px-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Nguồn gợi ý</th>
                                        <th className="py-3 px-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Số lượng</th>
                                        <th className="py-3 px-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.suggestedItems.length > 0 ? analytics.suggestedItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                                        {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" /> : <Utensils size={18} className="text-slate-300" />}
                                                    </div>
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-200/50 dark:border-amber-500/20">
                                                    {item.source === 'best_seller' ? 'Món bán chạy' : 
                                                     item.source === 'history' ? 'Món từng gọi' : 
                                                     item.source === 'combo' ? 'Combo tiết kiệm' : 
                                                     item.source === 'onboarding' ? 'Gợi ý Onboarding' : 
                                                     item.source === 'cart_recommend' ? 'Gợi ý lúc thanh toán' : 
                                                     item.source}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">{item.qty}</td>
                                            <td className="py-3 px-4 text-right font-black text-[#DF1B41]">{formatVND(item.revenue)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-slate-400 font-medium">Chưa có dữ liệu gọi món từ gợi ý trong kỳ.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// SLA Stats Pipeline — fetches its own data for the analytics tab
// ────────────────────────────────────────────────────────────
function SlaStatsPipeline({ analyticRange, resId }: { analyticRange: string; resId: string }) {
    const [data, setData] = useState<SlaData | null>(null);

    useEffect(() => {
        fetch(`/api/admin/dashboard/sla-tracker?resid=${resId}`)
            .then(r => r.json()).then(d => { if (d.success) setData(d.data); }).catch(console.error);
    }, [resId, analyticRange]);

    if (!data) return (
        <div className="flex items-center justify-center h-20 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const steps = [
        { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox, desc: 'Từ lúc khách đặt đến khi nhà bếp xác nhận' },
        { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame, desc: 'Từ xác nhận đến khi bắt đầu chế biến' },
        { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing, desc: 'Thời gian thực tế nấu món' },
        { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils, desc: 'Từ khi món sẵn đến khi lên bàn' },
    ];

    return (
        <div className="space-y-4">
            {/* E2E summary */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold ${data.endToEnd.isWithinSla ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                <Clock size={16} />
                <span>Tổng thời gian phục vụ trung bình: <strong>{data.endToEnd.avg} phút</strong></span>
                <span className="text-slate-400 font-normal">/ Mục tiêu: {data.endToEnd.target} phút</span>
                {data.endToEnd.worst > 0 && <span className="ml-auto text-[10px] uppercase tracking-wide">Lâu nhất: {data.endToEnd.worst} ph</span>}
            </div>

            {/* Step breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {steps.map(step => {
                    const v = data.violations[step.key];
                    const cfg = data.slaConfig[step.key];
                    if (!v) return null;
                    const avgTime = v.avg_time || 0;
                    const isCritical = avgTime > cfg.target;
                    const ratio = Math.min((avgTime / cfg.target) * 100, 100);
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className={`p-4 rounded-2xl border transition-colors ${isCritical ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                                    <Icon size={13} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{step.label}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium mb-3 leading-relaxed">{step.desc}</p>
                            <div className="flex items-baseline justify-between mb-1.5">
                                <span className={`text-2xl font-black tracking-tight ${isCritical ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{avgTime.toFixed(1)}</span>
                                <span className="text-[9px] font-bold text-slate-400">/ {cfg.target} ph</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${ratio}%` }} />
                            </div>
                            {v.count > 0 && (
                                <p className="mt-2 text-[9px] font-black text-rose-500">{v.count}/{v.total} đơn vượt SLA</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Realtime Alert Card
// ────────────────────────────────────────────────────────────
function RealtimeAlertCard({ icon, label, count, desc, isDanger }: {
    icon: React.ReactNode; label: string; count: number; desc: string; isDanger: boolean;
}) {
    return (
        <div className={`rounded-2xl p-4 border transition-all duration-300 ${isDanger
            ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${isDanger ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                    {icon}
                </div>
                <span className={`text-3xl font-black tracking-tight ${isDanger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}>{count}</span>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDanger ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{label}</p>
            <p className="text-[9px] font-medium text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}

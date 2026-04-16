"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    PieChart as PieIcon, LineChart as LineIcon, TrendingUp, DollarSign, 
    Users, Building2, ShoppingBag, ArrowUpRight, ArrowDownRight, 
    MoreHorizontal, ChevronDown, Calendar, BarChart2, Star, MessageSquare, 
    AlertCircle, Clock, ChevronRight, Zap, GraduationCap, Utensils,
    Settings, TrendingDown, Minus, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { IconSmile2D, IconFrown2D } from '@/components/RatingIcons';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    AreaChart, Area, Cell, BarChart, Bar
} from 'recharts';

// ────────────────────────────────────────────────────────────
// Demo Data
// ────────────────────────────────────────────────────────────
const GROWTH_DATA = [
    { day: '01/04', khach: 7200, orders: 2400 },
    { day: '02/04', khach: 8100, orders: 2800 },
    { day: '03/04', khach: 7800, orders: 2650 },
    { day: '04/04', khach: 8900, orders: 3240 },
    { day: '05/04', khach: 9400, orders: 3500 },
    { day: '06/04', khach: 8942, orders: 3248 },
];

const RANKING_METRICS = [
    { id: 'khach', label: 'Lượt khách', unit: 'PAX', field: 'khach', icon: Users },
    { id: 'orders', label: 'Lượt gọi', unit: 'TXN', field: 'orders', icon: ShoppingBag },
    { id: 'rev', label: 'Doanh thu', unit: 'M', field: 'rev', icon: DollarSign },
    { id: 'rate', label: 'Tỉ lệ O2O', unit: '%', field: 'rate', icon: BarChart2 },
];

const TOP_STORES_DATA = [
    { name: "Phở 24 Q1", khach: 1452, orders: 512, rev: 145.2, rate: 99.1, goodCount: 450, badCount: 3, trend: "+12%" },
    { name: "Highlands Q3", khach: 1248, orders: 448, rev: 124.8, rate: 74.2, goodCount: 120, badCount: 42, trend: "+8%" },
    { name: "KFC Q10", khach: 1102, orders: 392, rev: 110.2, rate: 100, goodCount: 680, badCount: 0, trend: "-2%" },
    { name: "Texas TĐ", khach: 984, orders: 348, rev: 98.4, rate: 96.0, goodCount: 512, badCount: 24, trend: "+15%" },
    { name: "Phúc Long Q7", khach: 852, orders: 302, rev: 85.2, rate: 58.0, goodCount: 210, badCount: 152, trend: "+5%" },
    { name: "Gong Cha Q3", khach: 750, orders: 280, rev: 75.0, rate: 35.5, goodCount: 94, badCount: 172, trend: "+3%" },
    { name: "Kichi Kichi Q1", khach: 620, orders: 210, rev: 62.0, rate: 48.2, goodCount: 102, badCount: 110, trend: "-5%" },
];

const REVIEWS_SUMMARY = { total: 1245, goodRate: 88, badRate: 12 };

// ── Decision Engine: Failure Patterns ──
const FAILURE_PATTERNS = [
    {
        id: 'capacity',
        label: 'Quá tải công suất',
        icon: Zap,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        borderColor: 'border-amber-200 dark:border-amber-500/20',
        percentage: 62,
        count: 69,
        reasons: ['Thời gian chờ lâu', 'Sai món / Thiếu món'],
        topStores: ['KFC Q10', 'Texas TĐ'],
        insight: 'Tập trung 80% vào giờ trưa (11–13h) ngày thường. Đề xuất: Tăng 1–2 nhân sự bếp giờ cao điểm.',
        trend: 'worsening' as const,
    },
    {
        id: 'training',
        label: 'Lỗ hổng đào tạo',
        icon: GraduationCap,
        color: 'text-violet-500',
        bgColor: 'bg-violet-50 dark:bg-violet-500/10',
        borderColor: 'border-violet-200 dark:border-violet-500/20',
        percentage: 28,
        count: 50,
        reasons: ['Nhân viên chưa nhiệt tình', 'Vệ sinh chưa tốt'],
        topStores: ['Phúc Long Q7', 'Highlands Q3'],
        insight: 'Nhân viên mới chiếm 60% lượt chê. Đề xuất: Tái đào tạo quy trình phục vụ & vệ sinh.',
        trend: 'improving' as const,
    },
    {
        id: 'product',
        label: 'Kỳ vọng sản phẩm',
        icon: Utensils,
        color: 'text-slate-500',
        bgColor: 'bg-slate-50 dark:bg-slate-500/10',
        borderColor: 'border-slate-200 dark:border-slate-500/20',
        percentage: 10,
        count: 31,
        reasons: ['Món không đúng kỳ vọng'],
        topStores: ['Phở 24 Q1'],
        insight: 'Mô tả menu chưa sát thực tế. Rủi ro thấp — theo dõi.',
        trend: 'stable' as const,
    },
];

// ── Decision Engine: Branch Health with Sparkline ──
const BRANCH_HEALTH = [
    {
        name: 'KFC Q10',
        satisfactionRate: 52,
        sparkline: [68, 66, 63, 60, 58, 55, 52],
        prevRate: 68,
        daysSinceDetected: 7,
        primaryPattern: 'capacity',
        status: 'critical' as const,
        insight: 'Giảm 16 điểm trong 7 ngày. Chưa có dấu hiệu cải thiện.',
    },
    {
        name: 'Phúc Long Q7',
        satisfactionRate: 58,
        sparkline: [55, 54, 55, 56, 57, 58, 58],
        prevRate: 55,
        daysSinceDetected: 14,
        primaryPattern: 'training',
        status: 'warning' as const,
        insight: 'Ổn định quanh 55–58%. Chưa có đột phá cải thiện.',
    },
    {
        name: 'Highlands Q3',
        satisfactionRate: 72,
        sparkline: [48, 52, 56, 60, 64, 68, 72],
        prevRate: 48,
        daysSinceDetected: 21,
        primaryPattern: 'training',
        status: 'improving' as const,
        insight: 'Tăng 24 điểm sau khi quản lý tái đào tạo nhân sự tuần 2.',
    },
];

// ── Decision Engine: Peak-Hour Heatmap (worst outlet) ──
const HEATMAP_DATA = [
    { hour: '11–13h', values: [8, 7, 4, 9, 8, 2, 1] },
    { hour: '13–15h', values: [1, 2, 1, 1, 3, 1, 0] },
    { hour: '17–19h', values: [3, 1, 2, 3, 6, 7, 8] },
    { hour: '19–21h', values: [1, 0, 1, 2, 5, 6, 7] },
];
const HEATMAP_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ── Config defaults ──
const DEFAULT_OPS_CONFIG = {
    criticalThreshold: 60,
    warningThreshold: 75,
    trendWindow: 7,
};

const RANGES = [
    { id: 'hôm nay', label: 'Hôm nay', compare: 'hôm qua' },
    { id: 'tuần này', label: 'Tuần này', compare: 'tuần trước' },
    { id: 'tháng này', label: 'Tháng này', compare: 'tháng trước' },
    { id: 'tùy chỉnh', label: 'Tùy chỉnh', compare: 'tuần trước' }, // Default comparison for custom
];

export default function HQDashboardPage() {
    const [timeRange, setTimeRange] = useState('hôm nay');
    const [compareRange, setCompareRange] = useState('hôm qua');
    const [rankingMetric, setRankingMetric] = useState(RANKING_METRICS[0]);
    const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
    const [opsConfig, setOpsConfig] = useState(DEFAULT_OPS_CONFIG);

    // Derived top 5 based on selected metric
    const sortedStores = [...TOP_STORES_DATA]
        .sort((a, b) => (b[rankingMetric.field as keyof typeof b] as number) - (a[rankingMetric.field as keyof typeof a] as number))
        .slice(0, 5);

    // Smart comparison auto-update
    const handleRangeChange = (rangeId: string) => {
        setTimeRange(rangeId);
        const rangeObj = RANGES.find(r => r.id === rangeId);
        if (rangeObj) {
            setCompareRange(rangeObj.compare);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 space-y-8 bg-slate-50 dark:bg-[#050510] min-h-screen">
            
            {/* ── HEADER ── */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                        <PieIcon aria-hidden="true" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Tổng quan Hệ thống
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold tracking-widest uppercase text-[10px] opacity-70 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                            Báo cáo vận hành toàn chuỗi O2O
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* SMART SEGMENTED SELECTOR */}
                    <div className="flex items-center p-1.5 bg-slate-200/50 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner relative overflow-hidden">
                        {RANGES.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => handleRangeChange(range.id)}
                                className={`relative px-4 py-2 rounded-xl text-xs font-black transition duration-300 flex items-center gap-2 whitespace-nowrap z-10 ${
                                    timeRange === range.id 
                                    ? 'text-indigo-600 dark:text-indigo-400' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                {timeRange === range.id && (
                                    <div className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-lg ring-1 ring-black/5 transition-all duration-300 -z-10" />
                                )}
                                <span className="flex items-center gap-1.5">
                                    {range.id === 'hôm nay' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                    {range.id === 'tùy chỉnh' && (
                                        <Calendar size={12} className={timeRange === range.id ? 'text-indigo-500' : 'text-slate-400'} />
                                    )}
                                    {range.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* GHOST COMPARISON SELECTOR */}
                    <div className="relative group flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-white/10">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter opacity-60 italic">So với</span>
                        <div className="relative">
                            <select 
                                aria-label="Chọn kỳ so sánh"
                                value={compareRange} 
                                onChange={(e) => setCompareRange(e.target.value)}
                                className="appearance-none bg-transparent text-slate-800 dark:text-slate-200 pr-8 text-sm font-black transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg border-0 hover:text-indigo-500 dark:hover:text-indigo-400"
                            >
                                <option value="hôm qua">Hôm qua</option>
                                <option value="tuần trước">Tuần trước</option>
                                <option value="tháng trước">Tháng trước</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        title: "Thực khách check-in", 
                        value: "8,942", 
                        sub: `khách/${timeRange}`,
                        trend: "+18%", 
                        status: "Tăng trưởng tốt",
                        isPositive: true,
                        icon: Users,
                        isPrimary: true
                    },
                    { 
                        title: "Lượt gọi món", 
                        value: "3,248", 
                        sub: `đơn/${timeRange}`,
                        trend: "+5.2%", 
                        status: "Ổn định",
                        isPositive: true,
                        icon: ShoppingBag,
                        isPrimary: true
                    },
                    { 
                        title: "Doanh thu (Ngày)", 
                        value: "148.5tr", 
                        sub: "VND dự kiến",
                        trend: "+12.5%", 
                        status: "Đạt đỉnh",
                        isPositive: true,
                        icon: DollarSign,
                        isPrimary: false
                    },
                    { 
                        title: "Tỉ lệ sử dụng O2O", 
                        value: "52.4%", 
                        sub: "tb. / 4 cửa hàng",
                        trend: "-1.1%",
                        status: "Cần chú ý",
                        isPositive: false,
                        icon: BarChart2,
                        isPrimary: false
                    }
                ].map((kpi, idx) => (
                    <div key={idx} className={`relative bg-white dark:bg-[#11111a] border rounded-[28px] p-6 shadow-sm overflow-hidden transition group hover:shadow-xl hover:-translate-y-1 duration-300 ${kpi.isPrimary ? 'border-indigo-500/20 dark:border-indigo-500/30' : 'border-slate-200 dark:border-white/5'}`}>
                        {kpi.isPrimary && (
                            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500" />
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${kpi.isPrimary ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'} group-hover:scale-110 transition-transform duration-300`}>
                                <kpi.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'}`}>
                                    {kpi.status}
                                </span>
                            </div>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-1">{kpi.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-3xl font-black ${kpi.isPrimary ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'} tracking-tight`}>{kpi.value}</p>
                            <span className="text-[10px] font-bold text-slate-400 truncate opacity-80">{kpi.sub}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                             <div className={`flex items-center gap-0.5 text-[10px] font-black ${kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {kpi.trend}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 opacity-60">so với {compareRange}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN CHARTS & LISTS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 shadow-sm flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                    <LineIcon size={20} className="text-indigo-500" />
                                </div>
                                Tăng trưởng lưu lượng
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1 border-l-2 border-indigo-500/30">
                                {timeRange} <span className="opacity-40 font-medium lowercase">so với</span> {compareRange}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-indigo-500/20 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Khách check-in</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-emerald-500/20 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Lượt gọi món</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorKhach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.03} />
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1A1D27', 
                                        borderRadius: '20px', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        color: '#fff', 
                                        fontSize: '11px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }} 
                                    itemStyle={{ color: '#fff', fontWeight: 900 }}
                                />
                                <Area type="monotone" dataKey="khach" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorKhach)" />
                                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Stores */}
                <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col h-auto">
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                                <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                    <TrendingUp size={18} className="text-orange-500" />
                                </div>
                                Xếp hạng cơ sở
                            </h3>
                            <MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
                        </div>

                        {/* Ranking Criterion Dropdown Selector — Pro Max Style (Tight) */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsMetricDropdownOpen(!isMetricDropdownOpen)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 text-indigo-500 shadow-sm border border-slate-100 dark:border-white/5">
                                        <rankingMetric.icon size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tiêu chí xếp hạng</span>
                                        <span className="text-[12px] font-black text-slate-900 dark:text-white italic leading-none">{rankingMetric.label}</span>
                                    </div>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isMetricDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                            </button>

                            {isMetricDropdownOpen && (
                                <>
                                    <button aria-label="Đóng menu" tabIndex={-1} className="fixed inset-0 w-full h-full cursor-default border-0 bg-transparent z-40" onClick={() => setIsMetricDropdownOpen(false)}></button>
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 overscroll-contain">
                                        {RANKING_METRICS.map((metric) => (
                                            <button
                                                key={metric.id}
                                                onClick={() => { setRankingMetric(metric); setIsMetricDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-1 ${
                                                    rankingMetric.id === metric.id 
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-white' 
                                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${rankingMetric.id === metric.id ? 'bg-white dark:bg-indigo-500/20 shadow-sm' : 'bg-slate-100 dark:bg-white/5'}`}>
                                                    <metric.icon size={13} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span className="text-[11px] font-black">{metric.label}</span>
                                                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">Đơn vị: {metric.unit}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                        {sortedStores.map((store, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-transparent hover:border-indigo-500/20 hover:bg-white dark:hover:bg-indigo-500/5 transition-all duration-300 group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm transform group-hover:rotate-12 transition-transform duration-300 ${i === 0 ? 'bg-indigo-600 text-white shadow-indigo-500/20 ring-2 ring-indigo-500/5' : 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                                        #{i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-[13px] text-slate-800 dark:text-slate-100 tracking-tight leading-none truncate max-w-[120px]">{store.name}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-50">Cơ sở {store.name.split(' ').pop()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end leading-none">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`font-black text-[15px] tracking-tighter ${rankingMetric.id === 'rate' ? (Number(store.rate) > 80 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-900 dark:text-white'}`}>
                                                {typeof store[rankingMetric.field as keyof typeof store] === 'number' 
                                                    ? new Intl.NumberFormat('vi-VN').format(store[rankingMetric.field as keyof typeof store] as number) 
                                                    : store[rankingMetric.field as keyof typeof store]}
                                                {rankingMetric.id === 'rate' ? '% Tốt' : ''}
                                            </span>
                                            {rankingMetric.id !== 'rate' && (
                                                <span className="font-bold text-[9px] text-slate-400 dark:text-slate-500 uppercase">{rankingMetric.unit}</span>
                                            )}
                                        </div>
                                        
                                        {rankingMetric.id === 'rate' && (
                                            <div className="flex items-center gap-2 mt-1 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/5">
                                                <div className="flex items-center gap-1 opacity-80">
                                                    <IconSmile2D className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{(store as any).goodCount}</span>
                                                </div>
                                                <div className="w-px h-2.5 bg-slate-300 dark:bg-white/10" />
                                                <div className="flex items-center gap-1 opacity-80">
                                                    <IconFrown2D className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black text-rose-500">{(store as any).badCount}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {rankingMetric.id !== 'rate' && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-[10px] font-black ${store.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {store.trend}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase opacity-40 italic tracking-tighter shrink-0">vs {compareRange}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* 3. OPERATIONAL INTELLIGENCE MODULE (Decision Engine)      */}
                {/* ══════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-3 bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col gap-8">

                    {/* ── Header + KPI Summary ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 dark:border-rose-500/10">
                                <AlertTriangle size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    Trung tâm Vận hành
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Phân tích gốc rễ vấn đề &amp; Xu hướng cải thiện</p>
                            </div>
                        </div>
                        <Link href="/hq/reviews" className="flex items-center gap-5 group/kpi cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-5 py-3 rounded-2xl transition border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                            <div className="flex items-center gap-3">
                                <IconSmile2D aria-hidden="true" className="w-8 h-8" />
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-emerald-500 tracking-tighter">{REVIEWS_SUMMARY.goodRate}%</span>
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Tốt</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
                            <div className="flex items-center gap-2">
                                <IconFrown2D aria-hidden="true" className="w-5 h-5" />
                                <span className="text-sm font-black text-rose-500">{REVIEWS_SUMMARY.badRate}%</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{new Intl.NumberFormat('vi-VN').format(REVIEWS_SUMMARY.total)} đánh giá</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover/kpi:text-indigo-500 transition-colors" />
                        </Link>
                    </div>

                    {/* ── Row 1: Failure Patterns + Branch Health ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* LEFT: Operational Failure Patterns */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <AlertCircle size={12} className="text-slate-400" />
                                Mẫu lỗi vận hành
                            </h4>
                            <div className="flex flex-col gap-3">
                                {FAILURE_PATTERNS.map((pattern) => {
                                    const TrendIcon = pattern.trend === 'worsening' ? TrendingDown : pattern.trend === 'improving' ? TrendingUp : Minus;
                                    const trendColor = pattern.trend === 'worsening' ? 'text-rose-500' : pattern.trend === 'improving' ? 'text-emerald-500' : 'text-slate-400';
                                    const accentColor = pattern.id === 'capacity' ? 'bg-amber-500' : pattern.id === 'training' ? 'bg-violet-500' : 'bg-slate-400';
                                    
                                    return (
                                        <div key={pattern.id} className="relative p-4 rounded-2xl bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group overflow-hidden">
                                            {/* Accent Strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                            
                                            <div className="flex items-center justify-between mb-3 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5`}>
                                                        <pattern.icon size={14} className={pattern.color} strokeWidth={2.5} />
                                                    </div>
                                                    <span className="text-[13px] font-extrabold text-slate-900 dark:text-white tracking-tight">{pattern.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{pattern.percentage}%</span>
                                                    <div className={`flex items-center gap-0.5 ${trendColor}`}>
                                                        <TrendIcon size={12} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pl-2">
                                                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                    {pattern.reasons.map((r, j) => (
                                                        <span key={j} className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{r}</span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1 mb-3">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tập trung:</span>
                                                    {pattern.topStores.map((s, j) => (
                                                        <span key={j} className="text-[10px] font-black text-slate-700 dark:text-slate-300 ml-1">{s}</span>
                                                    ))}
                                                </div>
                                                {/* Smart Insight (Clean) */}
                                                <div className="flex items-start gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                                                    <div className="mt-0.5">💡</div>
                                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{pattern.insight}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Branch Health with Sparklines */}
                        <div className="lg:col-span-3 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={12} className="text-slate-400" />
                                    Sức khỏe chi nhánh
                                </h4>
                                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Nguy hiểm</span>
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Cảnh báo</span>
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Cải thiện</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {BRANCH_HEALTH.map((branch, i) => {
                                    const isCritical = branch.satisfactionRate < opsConfig.criticalThreshold;
                                    const isWarning = branch.satisfactionRate < opsConfig.warningThreshold && !isCritical;
                                    const statusLabel = isCritical ? 'Nguy hiểm' : isWarning ? 'Cảnh báo' : 'Cải thiện';
                                    const statusBadge = isCritical ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : isWarning ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
                                    const StatusIcon = isCritical ? AlertTriangle : isWarning ? Clock : CheckCircle2;
                                    const delta = branch.satisfactionRate - branch.prevRate;
                                    
                                    // SVG sparkline
                                    const sparkMax = Math.max(...branch.sparkline);
                                    const sparkMin = Math.min(...branch.sparkline);
                                    const sparkRange = sparkMax - sparkMin || 1;
                                    const sparkW = 90;
                                    const sparkH = 30;
                                    const sparkPoints = branch.sparkline.map((v, idx) => {
                                        const x = (idx / (branch.sparkline.length - 1)) * sparkW;
                                        const y = sparkH - ((v - sparkMin) / sparkRange) * (sparkH - 6) - 3;
                                        return `${x},${y}`;
                                    }).join(' ');
                                    const sparkColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';

                                    return (
                                        <div key={i} className="group p-4 lg:p-5 rounded-2xl bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 group-hover:scale-105 transition-transform`}>
                                                    <StatusIcon size={18} strokeWidth={2.5} className={isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'} />
                                                </div>
                                                <div className="flex flex-col gap-1.5 flex-1 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-[15px] text-slate-900 dark:text-white tracking-tight">{branch.name}</span>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${statusBadge}`}>{statusLabel}</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">{branch.insight}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 shrink-0 pl-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 pt-4 lg:pt-0">
                                                {/* Sparkline Clean */}
                                                <div className="flex flex-col items-end gap-1">
                                                    <svg width={sparkW} height={sparkH} className="overflow-visible">
                                                        <polyline fill="none" stroke={sparkColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={sparkPoints} />
                                                        <circle cx={sparkW} cy={parseFloat(sparkPoints.split(' ').pop()?.split(',')[1] || '0')} r="3.5" fill={sparkColor} stroke="white" strokeWidth="1.5" />
                                                    </svg>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-70">7 Ngày</span>
                                                </div>
                                                {/* Rate */}
                                                <div className="flex flex-col items-end w-16">
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{branch.satisfactionRate}%</span>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {delta >= 0 ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
                                                        <span className={`text-[11px] font-black ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{delta >= 0 ? '+' : ''}{delta}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Row 2: Peak-Hour Heatmap (worst outlet) ── */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 shadow-sm mt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                    <Clock size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        Mật độ khiếu nại theo khung giờ
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest">
                                        Tiêu điểm: <span className="text-rose-500 font-black">KFC Q10</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full text-center border-separate border-spacing-1">
                                <thead>
                                    <tr>
                                        <th className="text-[10px] font-black text-slate-400 uppercase pb-3 text-left w-20 tracking-widest pl-2">Giờ</th>
                                        {HEATMAP_DAYS.map((d) => (
                                            <th key={d} className="text-[10px] font-black text-slate-400 uppercase pb-3 w-14 tracking-widest">{d}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {HEATMAP_DATA.map((row) => (
                                        <tr key={row.hour}>
                                            <td className="text-[11px] font-black text-slate-700 dark:text-slate-300 text-left py-1.5 pl-2">{row.hour}</td>
                                            {row.values.map((val, j) => {
                                                const intensity = val === 0 ? 'bg-slate-50 dark:bg-white-[0.02] text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-white/5'
                                                    : val <= 2 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/10'
                                                    : val <= 4 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/10'
                                                    : val <= 6 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 border border-orange-200 dark:border-orange-500/20'
                                                    : 'bg-rose-500 dark:bg-rose-600 text-white font-black shadow-sm shadow-rose-500/30';
                                                
                                                return (
                                                    <td key={j} className="p-0.5">
                                                        <div className={`w-12 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold mx-auto transition-transform hover:scale-110 cursor-default ${intensity}`}>
                                                            {val > 0 ? val : '-'}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex items-start gap-3 mt-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                            <div className="p-1 bg-white dark:bg-white/5 rounded shadow-sm">💡</div>
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                                <strong className="text-slate-900 dark:text-white">80% khiếu nại</strong> về thời gian chờ tập trung vào <strong className="text-slate-900 dark:text-white">giờ trưa (11–13h) ngày thường</strong>.
                                Cuối tuần chuyển sang <strong className="text-slate-900 dark:text-white">giờ tối (17–21h)</strong>. Đề xuất phân bổ lại ca trực theo biểu đồ nhiệt này (đặc biệt các ô đỏ).
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

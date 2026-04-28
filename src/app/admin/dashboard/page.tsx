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
import ProMaxAnalytics from './components/ProMaxAnalytics';

// ────────────────────────────────────────────────────────────
// Config & Range Map
// ────────────────────────────────────────────────────────────
const RANGE_MAP: Record<string, { label: string, comparison: string }> = {
    'today': { label: 'Hôm nay', comparison: 'So với hôm qua' },
    'yesterday': { label: 'Hôm qua', comparison: 'So với ngày trước đó' },
    'this_week': { label: 'Tuần này', comparison: 'So với tuần trước' },
    'this_month': { label: 'Tháng này', comparison: 'So với tháng trước' },
    'last_7d': { label: '7 ngày gần nhất', comparison: 'So với 7 ngày trước đó' },
    'last_30d': { label: '30 ngày gần nhất', comparison: 'So với 30 ngày trước đó' },
    'custom': { label: 'Tuỳ chỉnh nâng cao...', comparison: 'Đối chiếu nền tảng' },
};

// ────────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const resId = user?.restaurant_id || 'all';

    const [analyticRange, setAnalyticRange] = useState<string>('last_7d');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const [analytics, setAnalytics] = useState<{
        trend: any[]; peakHours: any[]; peakDays: any[];
        suggestedItems: {id: string, name: string, img: string, source: string, qty: number, revenue: number}[];
        summary: { doanhThu: number; soDon: number; soKhach: number; soLuotGoiMon: number; doanhThuGoiY: number; o2oRate: number; aov: number; aovTable: number; cancellationRate: number; days: number; };
    }>({
        trend: [], peakHours: [], peakDays: [], suggestedItems: [],
        summary: { doanhThu: 0, soDon: 0, soKhach: 0, soLuotGoiMon: 0, doanhThuGoiY: 0, o2oRate: 0, aov: 0, aovTable: 0, cancellationRate: 0, days: 7 }
    });

    useEffect(() => {
        fetch(`/api/admin/dashboard/analytics?resid=${resId}&range=${analyticRange}`)
            .then(r => r.json()).then(d => { if (d.success) setAnalytics(d.data); }).catch(console.error);
    }, [resId, analyticRange]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-black min-h-screen relative">
            {/* ── STICKY HEADER ── */}
            <div className="sticky top-0 z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 text-white flex items-center justify-center shadow-sm shrink-0">
                        <BarChart3 size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Báo Cáo Tăng Trưởng
                        </h1>
                        <p className="text-slate-500 mt-0.5 font-medium text-[12px] leading-tight">
                            Phân tích dữ liệu vận hành từ quá khứ
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:items-end relative">
                    <button 
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                    >
                        <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                            {RANGE_MAP[analyticRange]?.label || 'Tuỳ chỉnh'}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {!customStart && analyticRange !== 'custom' && (
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 sm:mr-1">
                            {RANGE_MAP[analyticRange]?.comparison}
                        </div>
                    )}
                    {analyticRange === 'custom' && customStart && (
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 sm:mr-1">
                            {customStart} đến {customEnd || '...'}
                        </div>
                    )}

                    {/* Dropdown Menu */}
                    {isPickerOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1a1b1e] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 z-40 overflow-hidden flex flex-col origin-top-right animate-in fade-in zoom-in-95 duration-150">
                                <div className="p-2 flex flex-col gap-1">
                                    {Object.entries(RANGE_MAP).map(([key, item]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setAnalyticRange(key);
                                                if (key !== 'custom') setIsPickerOpen(false);
                                            }}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${analyticRange === key ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-[13px] font-semibold ${analyticRange === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {item.label}
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                    {item.comparison}
                                                </span>
                                            </div>
                                            {analyticRange === key && <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                                
                                {analyticRange === 'custom' && (
                                    <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Chọn Khoảng (Tối đa 3 tháng)</p>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Từ ngày</label>
                                                <input 
                                                    type="date" 
                                                    value={customStart}
                                                    onChange={e => setCustomStart(e.target.value)}
                                                    className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Đến ngày</label>
                                                <input 
                                                    type="date" 
                                                    value={customEnd}
                                                    onChange={e => setCustomEnd(e.target.value)}
                                                    className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => setIsPickerOpen(false)}
                                                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* PRO MAX ANALYTICS: Cấu trúc mật độ cao */}
                <ProMaxAnalytics />

                <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8" />

                {/* MenuEfficiencyDeck logic was relocated inside ProMaxAnalytics as Pillar 4 */}

            </div>
        </div>
    );
}



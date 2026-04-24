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
// Main Page Component
// ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const resId = user?.restaurant_id || 'all';

    const [analyticRange, setAnalyticRange] = useState<'7d' | '30d'>('7d');
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
                
                {/* PRO MAX ANALYTICS: Cấu trúc mật độ cao */}
                <ProMaxAnalytics />

                <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8" />

                {/* MenuEfficiencyDeck logic was relocated inside ProMaxAnalytics as Pillar 4 */}

            </div>
        </div>
    );
}



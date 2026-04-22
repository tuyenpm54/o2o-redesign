"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    AlertTriangle, XCircle, Table2, ShieldCheck,
    Flame, BellRing, Utensils, Inbox, Siren, CheckCircle2,
    Wifi, Users, ClipboardList, Timer, PackageCheck, Clock,
    ArrowLeftRight, Store
} from 'lucide-react';
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
    activeTablesList?: {
        id: string;
        areaName?: string;
        guestCount: number;
        status: 'WAITING' | 'SERVING' | 'DONE' | 'EMPTY';
        idleMinutes: number;
        sessionStartMinutes: number;
    }[];
}

interface LivePulse {
    kitchenLagCount: number;
    neglectedTablesCount: number;
    stockoutCount: number;
    activeTablesCount: number;
    timestamp: number;
    liveRevenue: number;
    todayRevenue: number;
    queueVolumes: {
        pending_to_confirmed: number;
        confirmed_to_cooking: number;
        cooking_to_ready: number;
        ready_to_served: number;
    };
    hotItems: { name: string; qty: number; }[];
    urgentFeed: { id: string; type: string; tableid: string; content: string; timestamp: number; label: string; }[];
}

// ── Model C: Counter Dispatch Center types ──
interface OrderQueueItem {
    orderId: string;
    customerName: string;
    itemCount: number;
    status?: string;
    createdAt?: number;
    readyAt?: number;
    waitingMinutes: number;
}

interface OrderQueueData {
    activeOrderCount: number;
    totalCustomersToday: number;
    avgFulfillmentMinutes: number;
    liveRevenue: number;
    avgBillAmount: number;
    readyOrders: OrderQueueItem[];
    activeOrders: OrderQueueItem[];
}

const ALL_SLA_STEPS = [
    { key: 'pending_to_confirmed', label: 'Tiếp nhận', icon: Inbox },
    { key: 'confirmed_to_cooking', label: 'Chuẩn bị', icon: Flame },
    { key: 'cooking_to_ready',    label: 'Chế biến',  icon: BellRing },
    { key: 'ready_to_served',     label: 'Phục vụ',   icon: Utensils },
] as const;

export default function LiveOperationsPage() {
    const [viewMode, setViewMode] = useState<'floor' | 'counter'>('floor');
    const isCounterModel = viewMode === 'counter';
    const [counterTab, setCounterTab] = useState<'pending' | 'cooking' | 'ready'>('ready');
    const { user } = useAuth();
    const resId = user?.restaurant_id || 'all';

    const [livePulse, setLivePulse] = useState<LivePulse>({
        kitchenLagCount: 0, neglectedTablesCount: 0,
        stockoutCount: 0, activeTablesCount: 0, timestamp: Date.now(),
        liveRevenue: 0, todayRevenue: 0,
        queueVolumes: { pending_to_confirmed: 0, confirmed_to_cooking: 0, cooking_to_ready: 0, ready_to_served: 0 },
        hotItems: [],
        urgentFeed: []
    });
    const [slaData, setSlaData] = useState<SlaData | null>(null);
    const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
    const [orderQueue, setOrderQueue] = useState<OrderQueueData | null>(null);

    const fetchRealtime = useCallback(async () => {
        try {
            // Fetch ALL data sources so switching is instant
            const [pulseRes, slaRes, occRes, queueRes] = await Promise.all([
                fetch(`/api/admin/dashboard/live-pulse?resid=${resId}`),
                fetch(`/api/admin/dashboard/sla-metrics?resid=${resId}`),
                fetch(`/api/admin/dashboard/table-occupancy?resid=${resId}`),
                fetch(`/api/admin/dashboard/order-queue?resid=${resId}`),
            ]);
            const [pulse, sla, occ, queue] = await Promise.all(
                [pulseRes, slaRes, occRes, queueRes].map(r => r.json())
            );
            if (pulse.success) setLivePulse(pulse.data);
            if (sla.success) setSlaData(sla.data);
            if (occ.success) setOccupancy(occ.data);
            if (queue.success) setOrderQueue(queue.data);
        } catch (e) {
            console.error(e);
        }
    }, [resId]);

    useEffect(() => {
        fetchRealtime();
        const iv = setInterval(fetchRealtime, 15000);
        return () => clearInterval(iv);
    }, [fetchRealtime]);

    const [selectedArea, setSelectedArea] = useState<string>('ALL');

    const activeAreas = useMemo(() => {
        if (!occupancy?.activeTablesList) return ['ALL'];
        const areas = new Set<string>();
        occupancy.activeTablesList.forEach(t => {
            if (t.areaName) areas.add(t.areaName);
            else areas.add('Khu Chung');
        });
        return ['ALL', ...Array.from(areas)];
    }, [occupancy]);

    const filteredTables = useMemo(() => {
        if (!occupancy?.activeTablesList) return [];
        if (selectedArea === 'ALL') return occupancy.activeTablesList;
        return occupancy.activeTablesList.filter(t => (t.areaName || 'Khu Chung') === selectedArea);
    }, [occupancy, selectedArea]);

    const statusCounts = useMemo(() => {
        if (!occupancy?.activeTablesList) return { waiting: 0, serving: 0, done: 0, empty: 0 };
        return occupancy.activeTablesList.reduce((acc, t) => {
            if (t.status === 'WAITING') acc.waiting++;
            else if (t.status === 'SERVING') acc.serving++;
            else if (t.status === 'DONE') acc.done++;
            else if (t.status === 'EMPTY') acc.empty++;
            return acc;
        }, { waiting: 0, serving: 0, done: 0, empty: 0 });
    }, [occupancy]);

    // Filter SLA steps: Model C drops 'ready_to_served'
    const SLA_STEPS = isCounterModel
        ? ALL_SLA_STEPS.filter(s => s.key !== 'ready_to_served')
        : ALL_SLA_STEPS;

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

    const formatVND = (v: number) => {
        if (!v || isNaN(v)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
    };

    return (
        <div className="flex flex-col p-4 md:p-6 w-full h-screen bg-slate-50 dark:bg-black overflow-hidden gap-6">
            {/* ── HEADER ── */}
            <div className="pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-500 dark:to-rose-700 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Wifi size={24} strokeWidth={2} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {isCounterModel ? 'Quản Lý Đơn Quầy' : 'Giám Sát Tầng'}
                            </h1>
                            <p className="text-slate-500 mt-0.5 font-medium text-sm">
                                {isCounterModel ? 'Theo dõi đơn hàng theo thời gian thực' : 'Theo dõi mặt bằng theo thời gian thực'} • Tự động cập nhật sau 15s
                            </p>
                        </div>
                    </div>
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('floor')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                                viewMode === 'floor'
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Table2 size={14} /> Trả sau tại bàn
                        </button>
                        <button
                            onClick={() => setViewMode('counter')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                                viewMode === 'counter'
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Store size={14} /> Trả trước tại quầy
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* ── COL 1: Conditional on Model ── */}
                <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 pb-4 scrollbar-hide">

                {isCounterModel ? (
                    /* ══════════════════════════════════════════ */
                    /* COUNTER MODE: Single unified card        */
                    /* ══════════════════════════════════════════ */
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-5 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col flex-1 min-h-0">
                        {orderQueue ? (<>
                        {/* ── Compact Metrics Strip ── */}
                        <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-100 dark:border-emerald-500/20">
                                <span className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80">₫</span>
                                <span className="text-[14px] font-black text-emerald-700 dark:text-emerald-400 tracking-tight">{formatVND(orderQueue.liveRevenue)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <ClipboardList size={12} className="text-slate-500" />
                                <span className="text-[12px] font-black text-slate-800 dark:text-white">{orderQueue.activeOrderCount}</span>
                                <span className="text-[10px] text-slate-400 font-bold">đơn</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <Users size={12} className="text-slate-500" />
                                <span className="text-[12px] font-black text-slate-800 dark:text-white">{orderQueue.totalCustomersToday}</span>
                                <span className="text-[10px] text-slate-400 font-bold">khách</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <Timer size={12} className="text-slate-500" />
                                <span className="text-[12px] font-black text-slate-800 dark:text-white">{orderQueue.avgFulfillmentMinutes}p</span>
                                <span className="text-[10px] text-slate-400 font-bold">TB</span>
                            </div>
                        </div>

                        {/* ── Tab bar + Single order list ── */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 mb-3 shrink-0 bg-slate-100/60 dark:bg-white/5 rounded-xl p-1">
                                {([
                                    { key: 'pending' as const, label: 'Chờ Xác Nhận', count: orderQueue.activeOrders.filter(o => o.status !== 'cooking').length, color: 'blue' },
                                    { key: 'cooking' as const, label: 'Đang Chế Biến', count: orderQueue.activeOrders.filter(o => o.status === 'cooking').length, color: 'orange' },
                                    { key: 'ready' as const, label: 'Chờ Tới Lấy', count: orderQueue.readyOrders.length, color: 'emerald' },
                                ]).map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setCounterTab(tab.key)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                            counterTab === tab.key
                                                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                                                counterTab === tab.key
                                                    ? tab.color === 'blue' ? 'bg-blue-500 text-white' : tab.color === 'orange' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                                                    : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                            }`}>{tab.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Order List */}
                            <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
                                {(() => {
                                    const filteredOrders = counterTab === 'ready'
                                        ? orderQueue.readyOrders
                                        : counterTab === 'cooking'
                                            ? orderQueue.activeOrders.filter(o => o.status === 'cooking')
                                            : orderQueue.activeOrders.filter(o => o.status !== 'cooking');

                                    if (filteredOrders.length === 0) {
                                        return (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-10">
                                                {counterTab === 'ready' ? <PackageCheck size={28} strokeWidth={1} className="text-slate-400 mb-2" /> : <Timer size={28} strokeWidth={1} className="text-slate-400 mb-2" />}
                                                <span className="text-[11px] font-medium text-slate-400">Không có đơn nào</span>
                                            </div>
                                        );
                                    }

                                    return filteredOrders.map((order) => {
                                        const isUrgent = order.waitingMinutes > 10;
                                        const isWarning = order.waitingMinutes >= 5 && order.waitingMinutes <= 10;
                                        
                                        // Color scheme based on tab
                                        const rowBg = counterTab === 'ready'
                                            ? isUrgent ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'
                                              : isWarning ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                                              : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/15'
                                            : counterTab === 'cooking'
                                                ? 'bg-orange-50/40 border-orange-100 dark:bg-orange-500/5 dark:border-orange-500/15'
                                                : 'bg-blue-50/40 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/15';

                                        const idColor = counterTab === 'ready'
                                            ? isUrgent ? 'text-rose-700 dark:text-rose-400' : isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                                            : counterTab === 'cooking' ? 'text-orange-700 dark:text-orange-400' : 'text-blue-700 dark:text-blue-400';

                                        return (
                                            <div key={order.orderId} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${rowBg}`}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={`text-[15px] font-black leading-none shrink-0 ${idColor}`}>{order.orderId}</span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 leading-tight truncate">{order.customerName}</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{order.itemCount} món</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                                                        isUrgent ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                        isWarning ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                                    }`}>
                                                        <Clock size={10} />
                                                        {order.waitingMinutes}p
                                                    </div>
                                                    {counterTab === 'pending' && (
                                                        <button className="text-[10px] font-bold text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">Xác nhận</button>
                                                    )}
                                                    {counterTab === 'ready' && (
                                                        <button className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                                            isUrgent ? 'text-white bg-rose-500 hover:bg-rose-600' : 'text-white bg-emerald-500 hover:bg-emerald-600'
                                                        }`}>Đã lấy ✓</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                        </>) : (
                            <div className="flex-1 flex items-center justify-center opacity-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-800" />
                            </div>
                        )}
                    </div>
                ) : (
                    /* ══════════════════════════════════════════ */
                    /* MODEL A/B: Spatial Floor Map (Original)   */
                    /* ══════════════════════════════════════════ */
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 flex flex-col">
                        <div className="flex items-start justify-between mb-8 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                    <Table2 size={20} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sơ Đồ Mặt Bằng</h3>
                                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">Tình trạng bàn đang hoạt động</p>
                                </div>
                            </div>
                            {occupancy && (
                                <div className="text-right flex items-baseline gap-1">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{occupancy.occupancyRate}</p>
                                    <span className="text-sm font-bold text-slate-400">%</span>
                                </div>
                            )}
                        </div>

                        {occupancy ? (
                            <div className="flex flex-col gap-6">
                                {/* LIVE REVENUE STRIP */}
                                <div className="flex flex-col xl:flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 gap-4 border border-emerald-100 dark:border-emerald-500/20 w-full shrink-0">
                                    <div className="flex items-center gap-3 w-full xl:w-auto">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <span className="font-extrabold pb-0.5">₫</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 tracking-wide uppercase mb-0.5">Doanh Thu Tạm Tính</p>
                                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight leading-none">{formatVND(livePulse.liveRevenue)}</p>
                                        </div>
                                    </div>
                                    <div className="border-t xl:border-t-0 xl:border-l border-emerald-200 dark:border-emerald-500/20 pt-4 xl:pt-0 xl:pl-5 w-full xl:w-auto xl:text-right">
                                        <p className="text-[11px] font-bold text-slate-500/80 dark:text-slate-400/80 tracking-wide uppercase mb-0.5">Bình quân Bill</p>
                                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-none">
                                            {occupancy.active > 0 ? formatVND(livePulse.liveRevenue / occupancy.active) : '0 ₫'}
                                        </p>
                                    </div>
                                </div>

                                {/* Metric row */}
                                <div className="grid grid-cols-3 gap-3 shrink-0">
                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 text-center">
                                        <p className="text-[12px] font-medium text-slate-500">Bàn Đang Mở</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{occupancy.active} <span className="text-xs font-bold text-slate-400">/ {occupancy.total}</span></p>
                                    </div>
                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 text-center">
                                        <p className="text-[12px] font-medium text-slate-500">Khách Ước Tính</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{occupancy.guestCount}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 text-center">
                                        <p className="text-[12px] font-medium text-slate-500">Thời Gian TB</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{occupancy.avgSessionMinutes} <span className="text-xs font-bold text-slate-400">ph</span></p>
                                    </div>
                                </div>

                                {/* Visual Table Map - Dynamic Status Grid */}
                                <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 p-4 flex flex-col min-h-[220px] overflow-hidden">
                                    <div className="flex flex-col gap-3 mb-3 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 px-1">
                                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chờ Món ({statusCounts.waiting})</span></div>
                                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đang Ăn ({statusCounts.serving})</span></div>
                                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sắp Trống ({statusCounts.done})</span></div>
                                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trống ({statusCounts.empty})</span></div>
                                            </div>
                                        </div>
                                        
                                        {/* Area Filter */}
                                        {activeAreas.length > 2 && (
                                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
                                                {activeAreas.map(area => (
                                                    <button
                                                        key={area}
                                                        onClick={() => setSelectedArea(area)}
                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                                                            selectedArea === area 
                                                                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border border-transparent' 
                                                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {area === 'ALL' ? 'Tất cả khu vực' : area}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {filteredTables.length > 0 ? filteredTables.map((t, i) => (
                                                <div key={i} className={`p-3 rounded-[16px] border transition-all flex flex-col justify-between min-h-[90px] shadow-sm
                                                    ${ t.status === 'WAITING' ? 'bg-blue-50/80 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' : 
                                                       t.status === 'SERVING' ? 'bg-amber-50/80 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' : 
                                                       t.status === 'DONE' ? 'bg-emerald-50/80 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                                                             'bg-slate-50/60 border-slate-200/60 dark:bg-white/[0.02] dark:border-white/5 opacity-80' }`}>
                                                    
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[13px] font-black leading-none ${
                                                            t.status === 'WAITING' ? 'text-blue-700 dark:text-blue-400' :
                                                            t.status === 'SERVING' ? 'text-amber-700 dark:text-amber-400' :
                                                            t.status === 'DONE' ? 'text-emerald-700 dark:text-emerald-400' :
                                                                                  'text-slate-500 dark:text-slate-400'
                                                        }`}>{t.id}</span>
                                                        <div className={`flex items-center gap-1 ${
                                                            t.status === 'WAITING' ? 'text-blue-600/70 dark:text-blue-400/70' :
                                                            t.status === 'SERVING' ? 'text-amber-600/70 dark:text-amber-400/70' :
                                                            t.status === 'DONE' ? 'text-emerald-600/70 dark:text-emerald-400/70' :
                                                                                  'text-slate-400/70 dark:text-slate-500/70'
                                                        }`}>
                                                            {t.status !== 'EMPTY' && <span className="text-[10px] font-bold">{t.guestCount}</span>}
                                                            <Users size={10} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                                            t.status === 'WAITING' ? 'text-blue-600 dark:text-blue-400' :
                                                            t.status === 'SERVING' ? 'text-amber-600 dark:text-amber-400' :
                                                            t.status === 'DONE' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                                  'text-slate-400 dark:text-slate-500'
                                                        }`}>
                                                            {t.status === 'WAITING' ? 'Chờ lên món' : t.status === 'SERVING' ? 'Đang dùng bữa' : t.status === 'DONE' ? 'Đã ăn xong' : 'Bàn trống'}
                                                        </span>
                                                        
                                                        {t.status === 'DONE' && (
                                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded w-fit leading-none">
                                                                Nhàn rỗi {t.idleMinutes}p
                                                            </span>
                                                        )}
                                                        {t.status === 'WAITING' && t.idleMinutes > 15 && (
                                                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded w-fit leading-none animate-pulse">
                                                                Chờ {t.idleMinutes}p!
                                                            </span>
                                                        )}
                                                        {t.status === 'SERVING' && (
                                                            <span className="text-[10px] font-medium text-amber-700/70 dark:text-amber-400/70 leading-none">
                                                                Ngồi được {t.sessionStartMinutes}p
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-4 flex justify-center py-10 opacity-50">
                                                    <span className="text-xs font-medium text-slate-500">Chưa có bàn nào đang hoạt động</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center py-20 opacity-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-800" />
                            </div>
                        )}
                    </div>
                )}
                </div>
                                      {/* ── COL 2: OPERATIONS FLOW (4 columns) ── */}
                <div className="lg:col-span-4 flex flex-col gap-5 overflow-y-auto pr-2 pb-4 scrollbar-hide">
                    
                    {/* CRITICAL ALERTS: DUAL STRIP */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        <div className={`p-3.5 rounded-[16px] flex items-center justify-between border ${livePulse.kitchenLagCount > 0 ? 'bg-rose-500 border-rose-600 text-white shadow-sm' : 'bg-white dark:bg-[#0c0c0e] border-slate-100 dark:border-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${livePulse.kitchenLagCount > 0 ? 'bg-white/20' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                                    <Siren size={16} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className={`text-[11px] font-bold leading-tight ${livePulse.kitchenLagCount > 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Đơn Trễ<br/>(&gt;15p)</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 align-bottom">
                                {livePulse.kitchenLagCount > 0 && (
                                    <span className="flex h-1.5 w-1.5 relative mb-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                    </span>
                                )}
                                <span className={`text-xl font-black tracking-tight leading-none ${livePulse.kitchenLagCount > 0 ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{livePulse.kitchenLagCount}</span>
                            </div>
                        </div>

                        <div className={`p-3.5 rounded-[16px] flex items-center justify-between border ${livePulse.stockoutCount > 0 ? 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 shadow-sm' : 'bg-white dark:bg-[#0c0c0e] border-slate-100 dark:border-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${livePulse.stockoutCount > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                                    <XCircle size={16} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className={`text-[11px] font-bold leading-tight ${livePulse.stockoutCount > 0 ? 'text-orange-900 dark:text-orange-100' : 'text-slate-900 dark:text-white'}`}>Hết Món<br/>Hủy</h4>
                                </div>
                            </div>
                            <span className={`text-xl font-black tracking-tight leading-none ${livePulse.stockoutCount > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>{livePulse.stockoutCount}</span>
                        </div>
                    </div>

                    {/* SLA OVERVIEW (Compact Grid) */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-5 shadow-[0_2px_14px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-slate-600 dark:text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-900 dark:text-white">Hiệu Suất Bếp</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider
                                ${slaStatus === 'ok' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' 
                                : slaStatus === 'warning' ? 'text-amber-700 bg-amber-50 dark:bg-amber-500/10' 
                                : 'text-rose-700 bg-rose-50 dark:bg-rose-500/10'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${slaStatus === 'ok' ? 'bg-emerald-500' : slaStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                {slaStatus === 'ok' ? 'Tốt' : slaStatus === 'warning' ? 'Chú Ý' : 'Quá Tải'}
                            </div>
                        </div>

                        {slaData ? (
                            <div className="grid grid-cols-2 gap-2">
                                {SLA_STEPS.map((step, idx) => {
                                    const v = slaData.violations[step.key];
                                    const cfg = slaData.slaConfig[step.key];
                                    const isViolating = v && v.avg_time > cfg.target;
                                    const avgTime = v ? v.avg_time.toFixed(1) : '0';
                                    const queueCount = livePulse.queueVolumes[step.key as keyof typeof livePulse.queueVolumes] || 0;
                                    
                                    return (
                                        <div key={step.key} className={`relative flex flex-col p-3 rounded-[14px] border ${isViolating ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20' : 'bg-slate-50/60 border-slate-100 dark:bg-white/[0.02] dark:border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center ${isViolating ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-white text-slate-500 dark:bg-white/5 shadow-sm'}`}>
                                                    <step.icon size={12} strokeWidth={isViolating ? 2.5 : 2} />
                                                </div>
                                                {queueCount > 0 && (
                                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none ${queueCount > 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                                                        {queueCount} <span className="text-[8px] opacity-70">đơn</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className={`text-[11px] font-bold leading-tight mb-0.5 ${isViolating ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>{step.label}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-black tracking-tight leading-none ${isViolating ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{avgTime}</span>
                                                    <span className="text-[9px] font-bold text-slate-400">/{cfg?.target || '-'}p</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8 opacity-50">
                                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* HOT ITEMS WIDGET (Pill Clouds) */}
                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-5 shadow-[0_2px_14px_rgb(0,0,0,0.03)] dark:shadow-none dark:border dark:border-white/5 flex flex-col shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={16} className="text-rose-500" />
                            <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Món Đang Chạy Nhiều</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {livePulse.hotItems.length > 0 ? (
                                livePulse.hotItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100/50 dark:border-orange-500/20">
                                        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{item.name}</span>
                                        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">x{item.qty}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center py-2 opacity-50">
                                    <span className="text-[11px] font-medium text-slate-400">Bếp đang ổn định</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ── COL 3: URGENT INBOX (3 columns) ── */}
                <div className="lg:col-span-3 flex flex-col overflow-hidden bg-white dark:bg-[#0c0c0e] rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                    <div className="p-5 px-6 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <BellRing size={16} className="animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Cần Xử Lý Ngay</h3>
                        </div>
                        {livePulse.urgentFeed.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                                {livePulse.urgentFeed.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                        {livePulse.urgentFeed.length > 0 ? (
                            livePulse.urgentFeed.map(feed => (
                                <div key={feed.id} className="bg-slate-50 dark:bg-[#13141A] rounded-[16px] p-3.5 border border-slate-100 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/40 transition-colors group cursor-pointer">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-black text-white bg-slate-800 dark:bg-white/20 px-1.5 py-0.5 rounded uppercase leading-none">{feed.tableid}</span>
                                            <span className="text-[10px] font-semibold text-slate-400 leading-none whitespace-nowrap">{feed.label}</span>
                                        </div>
                                        <div className={`p-1 rounded flex shrink-0 ${feed.type === 'review' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                            {feed.type === 'review' ? <XCircle size={12} strokeWidth={3} /> : <AlertTriangle size={12} strokeWidth={3} />}
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3 line-clamp-3">{feed.content}</p>
                                    <div className="flex justify-end">
                                        <button className="text-[10px] font-bold text-rose-600 dark:text-rose-400 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/20">
                                            Tiếp nhận xử lý <span className="text-[14px] leading-none mb-0.5">→</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center opacity-40">
                                <ShieldCheck size={36} strokeWidth={1} className="text-slate-500 mb-3" />
                                <p className="text-[13px] font-bold text-slate-600 dark:text-slate-400">Không có vấn đề!</p>
                                <p className="text-[11px] font-medium text-slate-500 mt-1">Mọi thứ đang hoạt động tốt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar,
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar, .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
}

function RealtimeAlertCard({ icon, label, count, isDanger }: {
    icon: React.ReactNode; label: string; count: number; isDanger: boolean;
}) {
    return (
        <div className={`rounded-2xl p-4 transition-all duration-300 flex items-center justify-between shadow-sm relative overflow-hidden shrink-0 border ${isDanger
            ? 'bg-rose-500 border-rose-600'
            : 'bg-white dark:bg-[#0c0c0e] border-slate-100 dark:border-white/5'}`}>
            
            <div className="flex items-center gap-3 relative z-10 w-full">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${isDanger ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                    {icon}
                </div>
                <div className="flex-1 pr-2">
                    <h4 className={`text-[12px] font-bold mb-0.5 ${isDanger ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{label}</h4>
                    <div className="flex items-end justify-between">
                        <span className={`text-[11px] font-medium ${isDanger ? 'text-rose-100' : 'text-slate-500'}`}>Tức thời</span>
                        <div className="flex items-center gap-1.5 align-bottom h-[20px]">
                            {isDanger && (
                                <span className="flex h-2 w-2 relative mb-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                            )}
                            <span className={`text-2xl font-black tracking-tight leading-none ${isDanger ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

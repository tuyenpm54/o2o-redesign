"use client";

import { useState, useRef, useCallback } from 'react';
import { Building2, Search, Filter, MoreVertical, AlertTriangle, CheckCircle2, Info, Users, Calendar, ChevronDown, BarChart2, DollarSign, Clock } from 'lucide-react';
import { IconSmile2D, IconFrown2D } from '@/components/RatingIcons';

type SlaDetail = { phase: string; status: 'pass' | 'fail'; time: string; limit: string };
type Restaurant = {
    id: string; name: string; status: string; mgr: string;
    rev: string; revGrowth: number;
    users: string; usersGrowth: number;
    orders: string; ordersGrowth: number;
    tableCoverage: number;
    slaStatus: string;
    slaDetails: SlaDetail[];
    plan: string; usage: number; usageGrowth: number; limit: number;
    o2oRate: number;
    o2oRateGrowth: number;
    // Peak traffic: 24 bars for 24 hours
    peakTraffic: number[];
    // Weekly traffic: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] — orders per day
    peakTrafficDays: number[];
    weeklyTraffic: number[];
    // Realtime metrics
    activeUsers: number;
    occupiedTables: number;
    totalTables: number;
    // Feedback metrics (Binary: Tốt/Tệ)
    goodReviews: number;
    badReviews: number;
    recentBadReviews: number; // Last 2 hours
    badReasons: { [key: string]: number }; // e.g. { "Chờ lâu": 12, "Vệ sinh": 3 }
};

const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: "RES-01", name: "Highlands Coffee Landmark", status: "online", mgr: "Nguyễn Văn A",
        rev: "145M", revGrowth: 15.2,
        users: "12,450", usersGrowth: 8.4,
        orders: "4,520", ordersGrowth: 12.5,
        tableCoverage: 85,
        slaStatus: 'tốt',
        slaDetails: [
            { phase: "Nhận đơn", status: "pass", time: "1p", limit: "2p" },
            { phase: "Chế biến", status: "pass", time: "8p", limit: "15p" },
            { phase: "Lên món", status: "pass", time: "2p", limit: "5p" }
        ],
        plan: 'Premium', usage: 4520, usageGrowth: 12.5, limit: -1,
        o2oRate: 78.4, o2oRateGrowth: 3.2,
        peakTraffic: [2,1,0,0,0,0,3,15,45,38,42,78,65,48,32,38,55,72,91,84,55,30,15,8],
        peakTrafficDays: [],
        weeklyTraffic: [450, 480, 520, 490, 610, 850, 780],
        activeUsers: 42, occupiedTables: 17, totalTables: 20,
        goodReviews: 450, badReviews: 3, recentBadReviews: 1, badReasons: { "Món ra chậm": 2, "Vệ sinh": 1 }
    },
    {
        id: "RES-02", name: "Phở 24 Hai Bà Trưng", status: "online", mgr: "Trần Thị B",
        rev: "89M", revGrowth: -4.5,
        users: "8,120", usersGrowth: -2.1,
        orders: "2,840", ordersGrowth: -1.5,
        tableCoverage: 65,
        slaStatus: 'xấu',
        slaDetails: [
            { phase: "Nhận đơn", status: "pass", time: "1.5p", limit: "2p" },
            { phase: "Chế biến", status: "fail", time: "18p", limit: "12p" },
            { phase: "Lên món", status: "fail", time: "Tắc nghẽn", limit: "5p" }
        ],
        plan: 'Pro', usage: 842, usageGrowth: -1.2, limit: 1000,
        o2oRate: 43.1, o2oRateGrowth: -5.8,
        peakTraffic: [1,0,0,0,0,1,5,10,25,30,28,61,54,35,22,25,40,55,45,39,18,10,5,2],
        peakTrafficDays: [],
        weeklyTraffic: [310, 340, 320, 305, 380, 520, 490],
        activeUsers: 18, occupiedTables: 8, totalTables: 15,
        goodReviews: 120, badReviews: 42, recentBadReviews: 5, badReasons: { "Đồ ăn mặn": 15, "Chờ rước lâu": 14, "Nhân viên": 13 }
    },
    {
        id: "RES-03", name: "KFC Vincom Đồng Khởi", status: "offline", mgr: "Lê Văn C",
        rev: "12M", revGrowth: -45.8,
        users: "1,204", usersGrowth: -30.5,
        orders: "450", ordersGrowth: -28.2,
        tableCoverage: 15,
        slaStatus: 'tốt',
        slaDetails: [
            { phase: "Nhận đơn", status: "pass", time: "30s", limit: "2p" },
            { phase: "Chế biến", status: "pass", time: "5p", limit: "10p" },
            { phase: "Lên món", status: "pass", time: "1p", limit: "5p" }
        ],
        plan: 'Cơ bản', usage: 98, usageGrowth: -25.4, limit: 100,
        o2oRate: 22.7, o2oRateGrowth: -11.0,
        peakTraffic: [0,0,0,0,0,0,1,3,6,8,5,9,7,5,3,4,8,12,10,6,4,2,1,0],
        peakTrafficDays: [],
        weeklyTraffic: [120, 135, 140, 115, 160, 210, 195],
        activeUsers: 0, occupiedTables: 0, totalTables: 25,
        goodReviews: 680, badReviews: 0, recentBadReviews: 0, badReasons: {}
    },
    {
        id: "RES-04", name: "Phúc Long Lê Lợi", status: "online", mgr: "Phạm D",
        rev: "115M", revGrowth: 2.1,
        users: "10,500", usersGrowth: 5.0,
        orders: "3,920", ordersGrowth: 4.2,
        tableCoverage: 78,
        slaStatus: 'xấu',
        slaDetails: [
            { phase: "Nhận đơn", status: "fail", time: "5p", limit: "2p" },
            { phase: "Chế biến", status: "pass", time: "8p", limit: "10p" },
            { phase: "Lên món", status: "pass", time: "2p", limit: "5p" }
        ],
        plan: 'Pro', usage: 1120, usageGrowth: 8.2, limit: 1000,
        o2oRate: 61.5, o2oRateGrowth: 7.1,
        peakTraffic: [1,0,0,0,0,1,8,20,35,42,35,72,68,45,31,35,62,80,88,76,49,25,12,5],
        peakTrafficDays: [],
        weeklyTraffic: [380, 410, 440, 425, 510, 720, 680],
        activeUsers: 56, occupiedTables: 14, totalTables: 18,
        goodReviews: 512, badReviews: 24, recentBadReviews: 3, badReasons: { "Phục vụ chậm": 12, "Hết bàn": 8, "Vệ sinh": 4 }
    },
];

export default function HQRestaurantsPage() {
    const timeRanges = [
        { id: 'today', label: 'Hôm nay', dates: '06/04/2026', realtime: true },
        { id: '7d', label: '7 ngày trước', dates: '31/03 - 06/04/2026', realtime: false },
        { id: 'this_week', label: 'Tuần này', dates: '06/04 - 12/04/2026', realtime: false },
        { id: '30d', label: '30 ngày qua', dates: '08/03 - 06/04/2026', realtime: false },
        { id: 'this_month', label: 'Tháng này', dates: '01/04 - 30/04/2026', realtime: false },
        { id: 'custom', label: 'Tùy chỉnh…', dates: 'Chọn khoảng thời gian', realtime: false },
    ];
    const compareRanges = [
        { id: 'yesterday', label: 'Hôm qua', dates: '05/04/2026 (cùng khung giờ)' },
        { id: 'prev_period', label: 'Kỳ trước', dates: 'Kỳ trước liền kề' },
        { id: 'prev_year', label: 'Năm trước', dates: 'Cùng ngày/kỳ năm ngoái' },
        { id: 'custom_compare', label: 'Tùy chỉnh…', dates: 'Chọn kỳ so sánh' },
    ];
    const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0]);
    const [selectedCompare, setSelectedCompare] = useState(compareRanges[0]);
    const [dashboardTab, setDashboardTab] = useState<'ops' | 'revenue'>('ops');
    const isRealtime = selectedTimeRange.realtime;

    // Fixed-position SLA tooltip (escapes overflow:hidden)
    const [slaTooltip, setSlaTooltip] = useState<{ res: Restaurant; x: number; y: number } | null>(null);
    const [feedbackTooltip, setFeedbackTooltip] = useState<{ res: Restaurant; x: number; y: number } | null>(null);
    const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showSlaTooltip = useCallback((e: React.MouseEvent, res: Restaurant) => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSlaTooltip({ res, x: rect.right, y: rect.top + rect.height / 2 });
    }, []);

    const showFeedbackTooltip = useCallback((e: React.MouseEvent, res: Restaurant) => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setFeedbackTooltip({ res, x: rect.left, y: rect.top + rect.height / 2 });
    }, []);

    const hideAllTooltips = useCallback(() => {
        tooltipTimeout.current = setTimeout(() => {
            setSlaTooltip(null);
            setFeedbackTooltip(null);
        }, 120);
    }, []);

    // Fixed-position O2O header tooltip
    const [o2oTooltip, setO2oTooltip] = useState<{ x: number; y: number } | null>(null);
    const o2oTooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showO2oTooltip = useCallback((e: React.MouseEvent) => {
        if (o2oTooltipTimeout.current) clearTimeout(o2oTooltipTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setO2oTooltip({ x: rect.left + rect.width / 2, y: rect.bottom });
    }, []);
    const hideO2oTooltip = useCallback(() => {
        o2oTooltipTimeout.current = setTimeout(() => setO2oTooltip(null), 150);
    }, []);

    const mockRestaurants = MOCK_RESTAURANTS;

    return (
        <div className="p-6 max-w-[1400px] mx-auto pb-24 relative">

            <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl shadow-sm overflow-hidden">
                {/* Header Toolbar — Pro Max Dynamic Version */}
                <div className="px-6 py-5 border-b border-slate-200/50 dark:border-white/[0.05] flex items-center justify-between bg-slate-50/40 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                <Building2 size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight leading-none italic">Hệ thống QUẢN TRỊ</h1>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{mockRestaurants.length} CỬA HÀNG ĐANG GIÁM SÁT</span>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />

                        {/* HIGH PROMINENCE TABS */}
                        <div className="p-1.5 bg-slate-200/50 dark:bg-white/5 rounded-[18px] flex items-center gap-1.5 border border-slate-200/40 dark:border-white/5">
                            <button 
                                onClick={() => setDashboardTab('ops')}
                                className={`px-6 py-2.5 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${dashboardTab === 'ops' ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                <CheckCircle2 size={14} strokeWidth={3} />
                                Vận hành Live
                            </button>
                            <button 
                                onClick={() => setDashboardTab('revenue')}
                                className={`px-6 py-2.5 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${dashboardTab === 'revenue' ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                <BarChart2 size={14} strokeWidth={3} />
                                Phân tích
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {dashboardTab === 'ops' ? (
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">HỆ THỐNG REALTIME LIVE</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 dark:text-slate-500">
                                        <Clock size={11} strokeWidth={2.5} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Cập nhật lúc 09:20:15</span>
                                    </div>
                                </div>
                                
                                <div className="relative w-[300px] group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm cơ sở, ID..." 
                                        className="w-full bg-slate-100 dark:bg-black/40 border border-transparent focus:border-indigo-500/30 rounded-2xl pl-11 pr-5 py-3 outline-none focus:ring-4 focus:ring-indigo-500/5 text-[13px] transition-all placeholder:text-slate-400 font-medium" 
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <button onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                                        className="px-5 py-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-[13px] font-bold flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Calendar size={16} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col items-start leading-none gap-1.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kỳ phân tích báo cáo</span>
                                            <span className="text-slate-900 dark:text-slate-100 italic">{selectedTimeRange.label}: {selectedTimeRange.dates}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isTimeFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsTimeFilterOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#0a0a12] border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-50 py-4 ring-1 ring-black/5">
                                                <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Chọn kỳ báo cáo</div>
                                                <div className="max-h-[280px] overflow-y-auto px-2">
                                                    {timeRanges.map(range => (
                                                        <button key={range.id} onClick={() => { setSelectedTimeRange(range); setIsTimeFilterOpen(false); }}
                                                            className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all mb-1 ${selectedTimeRange.id === range.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className={`text-[13px] font-bold ${selectedTimeRange.id === range.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{range.label}</span>
                                                                {range.realtime && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> live</span>}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{range.dates}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="border-b border-slate-200/60 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[7%]">ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[20%]">CỬA HÀNG</th>
                                
                                    {dashboardTab === 'ops' ? (
                                        <>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[12%] text-center">TRẠNG THÁI SLA</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[12%] text-center">ĐÁNH GIÁ XẤU</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[13%] text-right">LẤP ĐẦY BÀN</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[13%] text-right">KHÁCH ĐANG LIVE</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[12%]">DOANH THU O2O</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[10%]">LƯỢT KHÁCH</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[10%]">LƯỢT GỌI</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-center w-[12%]">PHẢN HỒI</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[10%]">TỈ LỆ O2O</th>
                                            <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-center flex-1">XU HƯỚNG LƯU LƯỢNG</th>
                                        </>
                                    )}
                                <th className="px-4 py-4 w-[8%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
                            {mockRestaurants.map((res, i) => {
                                const isGood = res.slaStatus === 'tốt';
                                return (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group/row text-sm">
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs align-top whitespace-nowrap">{res.id}</td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{res.name}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                                                <Users size={11} className="opacity-60" /> Quản lý: {res.mgr}
                                            </span>
                                        </div>
                                    </td>
                                    {dashboardTab === 'ops' ? (
                                        <>
                                            <td className="px-6 py-4 text-center align-top">
                                                <div
                                                    onMouseEnter={(e) => showSlaTooltip(e, res)}
                                                    onMouseLeave={hideAllTooltips}
                                                    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-help transition-all shadow-sm ${
                                                        isGood 
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
                                                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                                                    }`}
                                                >
                                                    {isGood ? <CheckCircle2 size={12} strokeWidth={3} /> : <AlertTriangle size={12} strokeWidth={2.5} />}
                                                    {isGood ? 'Tốt' : 'Xấu'}
                                                    <div className={`ml-0.5 p-0.5 rounded-full ${isGood ? 'bg-emerald-200 dark:bg-emerald-500/30' : 'bg-red-200 dark:bg-red-500/30'}`}>
                                                        <Info size={10} strokeWidth={4} />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center align-top">
                                                <div 
                                                    onMouseEnter={(e) => showFeedbackTooltip(e, res)}
                                                    onMouseLeave={hideAllTooltips}
                                                    className="flex flex-col items-center gap-1 cursor-help group/fb"
                                                >
                                                    <span className={`text-base font-black transition-colors ${res.recentBadReviews > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-white/10'}`}>
                                                        {res.recentBadReviews}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-white">{res.occupiedTables}/{res.totalTables}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium">bàn</span>
                                                    </div>
                                                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all ${res.occupiedTables / res.totalTables > 0.8 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                            style={{ width: `${(res.occupiedTables / res.totalTables) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-900 dark:text-white text-base leading-none">{res.activeUsers}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    </div>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{res.rev}</span>
                                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.revGrowth > 0 ? 'text-emerald-500' : res.revGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {res.revGrowth > 0 ? '↑' : res.revGrowth < 0 ? '↓' : ''} {Math.abs(res.revGrowth).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{res.users}</span>
                                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.usersGrowth > 0 ? 'text-emerald-500' : res.usersGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {res.usersGrowth > 0 ? '↑' : res.usersGrowth < 0 ? '↓' : ''} {Math.abs(res.usersGrowth).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{res.orders}</span>
                                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.ordersGrowth > 0 ? 'text-emerald-500' : res.ordersGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {res.ordersGrowth > 0 ? '↑' : res.ordersGrowth < 0 ? '↓' : ''} {Math.abs(res.ordersGrowth).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-center align-top">
                                                {(() => {
                                                    const total = res.goodReviews + res.badReviews;
                                                    const goodRate = total > 0 ? (res.goodReviews / total) * 100 : 100;
                                                    const badRate = total > 0 ? (res.badReviews / total) * 100 : 0;
                                                    return (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className={`text-[13px] font-black tracking-tight ${badRate > 20 ? 'text-red-500' : badRate > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                                {goodRate.toFixed(0)}% Tốt
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter">
                                                                <div className="flex items-center gap-1">
                                                                    <IconSmile2D className="w-3.5 h-3.5" />
                                                                    <span>{res.goodReviews}</span>
                                                                </div>
                                                                <span className="opacity-30 mx-0.5">|</span>
                                                                <div className={`flex items-center gap-1 ${res.badReviews > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                    <IconFrown2D className="w-3.5 h-3.5" />
                                                                    <span>{res.badReviews}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>

                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`font-semibold ${res.o2oRate >= 60 ? 'text-emerald-600 dark:text-emerald-400' : res.o2oRate >= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{res.o2oRate.toFixed(1)}%</span>
                                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.o2oRateGrowth > 0 ? 'text-emerald-500' : res.o2oRateGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {res.o2oRateGrowth > 0 ? '↑' : res.o2oRateGrowth < 0 ? '↓' : ''} {Math.abs(res.o2oRateGrowth).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center justify-center gap-8">
                                                    {/* Hourly Peak - 24 bars */}
                                                    {(() => {
                                                        const max = Math.max(...res.peakTraffic, 1);
                                                        const peakHour = res.peakTraffic.indexOf(max);
                                                        return (
                                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                                <div className="flex items-end gap-[1px] h-8 relative pt-3">
                                                                    {res.peakTraffic.map((val, idx) => {
                                                                        const isPeak = idx === peakHour && val > 0;
                                                                        return (
                                                                            <div key={idx} className="relative flex flex-col items-center">
                                                                                {isPeak && (
                                                                                    <span className="absolute -top-3.5 text-[7px] font-black text-indigo-500 whitespace-nowrap">{idx}h</span>
                                                                                )}
                                                                                <div 
                                                                                    style={{ height: `${Math.round((val/max) * 20)}px` }}
                                                                                    title={`${idx}h: ${val} đơn`}
                                                                                    className={`w-[4px] rounded-t-[1px] transition-all ${isPeak ? 'bg-indigo-500' : val > 0 ? 'bg-indigo-200 dark:bg-indigo-500/30' : 'bg-slate-100 dark:bg-white/[0.03]'}`}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <span className="text-[8px] font-bold text-slate-400/60 uppercase mt-1 tracking-tighter">24h Curve</span>
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="w-px h-6 bg-slate-100 dark:bg-white/[0.05]" />

                                                    {/* Weekly Peak - 7 bars */}
                                                    {(() => {
                                                        const DAY_LABELS = ['T2','T3','T4','T5','T6','T7','CN'];
                                                        const max = Math.max(...res.weeklyTraffic, 1);
                                                        const peakDayIdx = res.weeklyTraffic.indexOf(max);
                                                        return (
                                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                                <div className="flex items-end gap-[4px] h-8 relative pt-3">
                                                                    {res.weeklyTraffic.map((val, idx) => {
                                                                        const isPeak = idx === peakDayIdx;
                                                                        return (
                                                                            <div key={idx} className="relative flex flex-col items-center">
                                                                                {isPeak && (
                                                                                    <span className="absolute -top-3.5 text-[7px] font-black text-amber-500 whitespace-nowrap">{DAY_LABELS[idx]}</span>
                                                                                )}
                                                                                <div 
                                                                                    style={{ height: `${Math.round((val/max) * 20)}px` }}
                                                                                    title={`${DAY_LABELS[idx]}: ${val} đơn`}
                                                                                    className={`w-[6px] rounded-t-[1px] transition-all ${isPeak ? 'bg-amber-500' : 'bg-amber-200 dark:bg-amber-500/20'}`}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <span className="text-[8px] font-bold text-slate-400/60 uppercase mt-1 tracking-tighter">Weekly</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-4 text-right align-top">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors opacity-0 group-hover/row:opacity-100 focus:opacity-100">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Fixed-position O2O header tooltip ── */}
            {o2oTooltip && (
                <div
                    onMouseEnter={() => { if (o2oTooltipTimeout.current) clearTimeout(o2oTooltipTimeout.current); }}
                    onMouseLeave={hideO2oTooltip}
                    style={{ position: 'fixed', left: o2oTooltip.x, top: o2oTooltip.y + 8, transform: 'translateX(-100%)', zIndex: 9999 }}
                    className="w-72 pointer-events-auto"
                >
                    <div className="bg-white dark:bg-[#12121e] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                                <BarChart2 size={14} className="text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-bold text-[12px] text-slate-900 dark:text-white leading-tight">Tỉ lệ sử dụng O2O</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">Digital adoption per outlet</p>
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Số hóa đơn qua <span className="font-semibold text-slate-700 dark:text-slate-200">O2O (QR scan)</span> chia cho tổng hóa đơn POS — kể cả POS thủ công. Phản ánh mức độ chuyển đổi số từng cơ sở.
                            </p>
                            <div className="mt-3 space-y-1.5">
                                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">≥ 60%</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">— Cao, hoạt động tốt</span>
                                </div>
                                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">30–59%</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">— Trung bình</span>
                                </div>
                                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span className="text-[11px] font-semibold text-red-700 dark:text-red-400">&lt; 30%</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">— Thấp, cần hỗ trợ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fixed-position SLA Tooltip (escapes overflow:hidden) ── */}
                                            {slaTooltip && (() => {
                                                const { res: r, x, y } = slaTooltip;
                                                const isGood = r.slaStatus === 'tốt';
                                                return (
                                                    <div
                                                        onMouseEnter={() => { if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current); }}
                                                        onMouseLeave={hideAllTooltips}
                                                        style={{ position: 'fixed', left: x + 10, top: y, transform: 'translateY(-50%)', zIndex: 9999 }}
                                                        className="w-64 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <div className={`rounded-2xl border shadow-2xl p-4 relative bg-white dark:bg-[#11111a] ${
                                                            isGood ? 'border-emerald-100 dark:border-emerald-500/20' : 'border-red-100 dark:border-red-500/30'
                                                        }`}>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                Chi tiết SLA {isGood ? 'đạt chuẩn' : 'vượt ngưỡng'}
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {r.slaDetails.map((v, idx) => (
                                                                    <div key={idx} className={`p-2.5 rounded-xl border ${
                                                                        v.status === 'pass'
                                                                            ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                            : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                                                    }`}>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="font-bold text-xs">{v.phase}</span>
                                                                            {v.status === 'fail' && <AlertTriangle size={10} />}
                                                                        </div>
                                                                        <div className="text-xs flex justify-between opacity-80 font-medium">
                                                                            <span>TT: {v.time}</span>
                                                                            <span className="opacity-60">Chuẩn: {v.limit}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/* Arrow pointing LEFT toward the badge */}
                                                            <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#11111a] border-l border-b border-slate-200 dark:border-white/10" />
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* ── Fixed-position Feedback Tooltip (escapes overflow:hidden) ── */}
                                            {feedbackTooltip && (() => {
                                                const { res: r, x, y } = feedbackTooltip;
                                                const reasons = Object.entries(r.badReasons);
                                                return (
                                                    <div
                                                        onMouseEnter={() => { if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current); }}
                                                        onMouseLeave={hideAllTooltips}
                                                        style={{ position: 'fixed', left: x - 10, top: y, transform: 'translate(-100%, -50%)', zIndex: 9999 }}
                                                        className="w-64 pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-200"
                                                    >
                                                        <div className="rounded-2xl border border-rose-100 dark:border-rose-500/20 shadow-2xl p-4 relative bg-white dark:bg-[#11111a]">
                                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                                                                <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                    Feedback Tiêu cực (2h)
                                                                </h4>
                                                                <span className="text-[13px] font-black text-rose-500">{r.recentBadReviews}</span>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                {reasons.length > 0 ? reasons.map(([reason, count], idx) => (
                                                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10">
                                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{reason}</span>
                                                                        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">{count}</span>
                                                                    </div>
                                                                )) : (
                                                                    <div className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase italic">Không có dữ liệu chi tiết</div>
                                                                )}
                                                            </div>

                                                            <p className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                                Monitor real-time workflow
                                                            </p>

                                                            {/* Arrow pointing RIGHT toward the cell */}
                                                            <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#11111a] border-r border-t border-slate-200 dark:border-white/10" />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
        </div>
    );
}

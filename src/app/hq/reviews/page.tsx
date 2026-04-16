"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
    Search, MessageSquare, Building2, CheckCircle2, 
    Clock, ArrowLeft, Calendar, AlertCircle, TrendingUp
} from 'lucide-react';
import { IconSmile2D, IconFrown2D } from '@/components/RatingIcons';

// ────────────────────────────────────────────────────────────
// types & mock
// ────────────────────────────────────────────────────────────
type ReviewType = 'good' | 'bad';

interface Review {
    id: string;
    store: string;
    type: ReviewType;
    reasons: string[];
    comment: string;
    time: string;
    timestamp: string; // ISO string for filtering
    user: { name: string; phone: string };
}

const MOCK_REVIEWS: Review[] = [
    {
        id: "REV-1001",
        store: "Phở 24 Hai Bà Trưng",
        type: 'bad',
        reasons: ["Đồ ăn mặn", "Chờ rước lâu", "Khác"],
        comment: "Nước dùng hôm nay quá mặn, mình đã đợi 20p mới có món.",
        time: "45p trước",
        timestamp: "2026-04-08T13:45:00Z",
        user: { name: "Nguyễn Minh T.", phone: "090****123" }
    },
    {
        id: "REV-1002",
        store: "Highlands Coffee Landmark",
        type: 'good',
        reasons: ["Phục vụ tốt", "Không gian sạch"],
        comment: "Nhân viên nhiệt tình, không gian sạch sẽ.",
        time: "1h trước",
        timestamp: "2026-04-08T13:20:00Z",
        user: { name: "Trần Anh D.", phone: "091****456" }
    },
    {
        id: "REV-1003",
        store: "KFC Vincom Đồng Khởi",
        type: 'good',
        reasons: ["Món ăn ngon"],
        comment: "Gà nóng hổi, giòn rụm.",
        time: "2h trước",
        timestamp: "2026-04-08T12:15:00Z",
        user: { name: "Lê Thị B.", phone: "098****789" }
    },
    {
        id: "REV-1004",
        store: "Phúc Long Lê Lợi",
        type: 'bad',
        reasons: ["Vệ sinh", "Khác"],
        comment: "Bàn còn nhiều rác chưa dọn, order nước lâu quá.",
        time: "3h trước",
        timestamp: "2026-04-08T11:30:00Z",
        user: { name: "Phạm Văn K.", phone: "097****222" }
    },
    {
        id: "REV-1005",
        store: "Highlands Coffee Landmark",
        type: 'bad',
        reasons: ["Món ra chậm"],
        comment: "",
        time: "4h trước",
        timestamp: "2026-04-08T10:45:00Z",
        user: { name: "Hoàng M.", phone: "093****555" }
    },
    {
        id: "REV-1006",
        store: "Phở 24 Hai Bà Trưng",
        type: 'bad',
        reasons: ["Nhân viên", "Khác"],
        comment: "Nhân viên không nhiệt tình khi mình hỏi về món phở mới.",
        time: "1 ngày trước",
        timestamp: "2026-04-07T15:00:00Z",
        user: { name: "Vũ Q.", phone: "090****888" }
    },
];

const STORES = [
    "Highlands Coffee Landmark", "Phở 24 Hai Bà Trưng", "KFC Vincom Đồng Khởi", "Phúc Long Lê Lợi"
];

export default function HQReviewsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('all');
    const [selectedType, setSelectedType] = useState<'all' | 'good' | 'bad'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const filteredReviews = useMemo(() => {
        return MOCK_REVIEWS.filter(rev => {
            const matchesStore = selectedStore === 'all' || rev.store === selectedStore;
            const matchesType = selectedType === 'all' || rev.type === selectedType;
            const matchesSearch = rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 rev.user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = (!startDate || rev.timestamp >= startDate) && 
                                (!endDate || rev.timestamp <= endDate);
            return matchesStore && matchesType && matchesSearch && matchesDate;
        });
    }, [searchTerm, selectedStore, selectedType, startDate, endDate]);

    const stats = useMemo(() => {
        const total = filteredReviews.length;
        const good = filteredReviews.filter(r => r.type === 'good').length;
        const bad = filteredReviews.filter(r => r.type === 'bad').length;
        return { total, good, bad, goodRate: total > 0 ? Math.round((good / total) * 100) : 0 };
    }, [filteredReviews]);

    const reasonDistribution = useMemo(() => {
        const dist: Record<string, number> = {};
        filteredReviews.filter(r => r.type === 'bad').forEach(r => {
            r.reasons.forEach(reason => {
                if (reason !== 'Khác') {
                    dist[reason] = (dist[reason] || 0) + 1;
                }
            });
        });
        return Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [filteredReviews]);

    return (
        <div className="p-4 md:p-6 max-w-[1800px] mx-auto pb-24 space-y-6">
            {/* 1. Header & Stats Section */}
            <div className="flex items-center justify-between bg-white dark:bg-[#11111a] p-5 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-5">
                    <Link href="/hq/dashboard" className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Quản lý Đánh giá</h1>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Chain Monitoring Mode</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 border-r border-slate-200 dark:border-white/10 pr-8">
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-emerald-500 tracking-tighter leading-none">{stats.goodRate}%</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Hài lòng ({stats.good})</span>
                        </div>
                        <IconSmile2D className="w-10 h-10" />
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black text-rose-500 leading-none">{stats.bad}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase mt-1.5">Đánh giá xấu</span>
                        </div>
                        <IconFrown2D className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* 2. Main Area (70%) */}
                <div className="flex-1 space-y-4">
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#11111a] p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex-1 min-w-[300px] relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm nội dung..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-2 outline-none text-xs font-bold"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 px-2">
                                <Calendar size={14} className="text-slate-400 mx-1" />
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-400 p-2 outline-none"
                                />
                                <span className="text-slate-300 mx-1">/</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-400 p-2 outline-none"
                                />
                            </div>

                            <select 
                                value={selectedStore} 
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-black text-slate-600 dark:text-slate-400 p-2.5 rounded-xl outline-none hover:border-slate-300 transition-colors"
                            >
                                <option value="all">CỬA HÀNG</option>
                                {STORES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Pro Data Table */}
                    <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/5 rounded-[24px] overflow-hidden shadow-sm text-xs">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap w-[20%]">Mô hình & Thời gian</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap w-[15%]">Khách hàng</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nội dung Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((rev) => (
                                        <tr key={rev.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex items-center gap-4">
                                                    {rev.type === 'good' ? <IconSmile2D className="w-6 h-6 shrink-0" /> : <IconFrown2D className="w-6 h-6 shrink-0" />}
                                                    <div>
                                                        <div className={`text-[11px] font-black uppercase tracking-tighter ${rev.type === 'good' ? 'text-emerald-600' : 'text-rose-600'}`}>{rev.store}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase leading-none">{rev.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="font-bold text-slate-700 dark:text-slate-300">{rev.user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{rev.user.phone}</div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Lý do:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {rev.reasons.map(r => (
                                                                <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${rev.type === 'good' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>{r}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {rev.comment && (
                                                        <div className="relative pl-4 border-l-2 border-slate-100 dark:border-white/5 py-1">
                                                            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                                                "{rev.comment}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-24 text-center">
                                            <MessageSquare size={48} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Không có dữ liệu phù hợp</h4>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Breakdown Sidebar (30%) */}
                <div className="w-full lg:w-[350px] shrink-0 space-y-6">
                    <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/5 p-6 rounded-[32px] shadow-sm sticky top-6">
                        <div className="flex items-center gap-3 text-rose-500 mb-6 font-black uppercase">
                            <IconFrown2D className="w-6 h-6" />
                            <h3 className="text-[10px] tracking-[0.2em]">Phân bổ lý do đánh giá tệ</h3>
                        </div>

                        <div className="space-y-5">
                            {reasonDistribution.length > 0 ? (
                                reasonDistribution.map(([reason, count]) => (
                                    <div key={reason} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{reason}</span>
                                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${stats.bad > 0 ? (count / stats.bad) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Chưa có dữ liệu tệ</span>
                                </div>
                            )}

                            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 font-bold leading-relaxed italic">
                                * Thống kê dựa trên danh sách đánh giá đã lọc. Hãy chú ý các lý do có mật độ cao để cải thiện vận hành.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend & Info Footer */}
            <div className="flex items-center justify-center gap-10 py-6 opacity-30">
                {[
                    { icon: <IconSmile2D className="w-4 h-4" />, label: 'Dịch vụ tốt (4-5★)' },
                    { icon: <IconFrown2D className="w-4 h-4" />, label: 'Cần cải thiện (1-3★)' },
                    { color: 'bg-amber-500', label: 'Tỉ lệ vận hành bình thường' },
                ].map((l, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        {l.icon || <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />}
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

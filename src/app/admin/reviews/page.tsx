"use client";

import { useState, useMemo } from 'react';
import { 
    Search, MessageSquare, Building2, CheckCircle2, 
    Clock, Calendar, AlertCircle, TrendingUp, Filter,
    ChevronRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { IconSmile2D, IconFrown2D } from '@/components/RatingIcons';

// ────────────────────────────────────────────────────────────
// types & mock (Store Manager Perspective)
// ────────────────────────────────────────────────────────────
type ReviewType = 'good' | 'bad';
type HandlingStatus = 'pending' | 'handled';

interface Review {
    id: string;
    type: ReviewType;
    reasons: string[];
    comment: string;
    time: string;
    timestamp: string;
    user: { name: string; phone: string };
    status: HandlingStatus;
    handlingNote?: string;
}

const MOCK_REVIEWS: Review[] = [
    {
        id: "REV-1001",
        type: 'bad',
        reasons: ["Đồ ăn mặn", "Chờ rước lâu"],
        comment: "Nước dùng hôm nay quá mặn, mình đã đợi 20p mới có món.",
        time: "45p trước",
        timestamp: "2026-04-08T13:45:00Z",
        user: { name: "Nguyễn Minh T.", phone: "090****123" },
        status: 'pending'
    },
    {
        id: "REV-1004",
        type: 'bad',
        reasons: ["Vệ sinh", "Món ra chậm"],
        comment: "Bàn còn nhiều rác chưa dọn, order nước lâu quá.",
        time: "3h trước",
        timestamp: "2026-04-08T11:30:00Z",
        user: { name: "Phạm Văn K.", phone: "097****222" },
        status: 'pending'
    },
    {
        id: "REV-1002",
        type: 'good',
        reasons: ["Phục vụ tốt", "Không gian sạch"],
        comment: "Nhân viên nhiệt tình, không gian sạch sẽ.",
        time: "1h trước",
        timestamp: "2026-04-08T13:20:00Z",
        user: { name: "Trần Anh D.", phone: "091****456" },
        status: 'handled',
        handlingNote: "Đã gọi điện xin lỗi khách và tặng voucher 20% cho lần sau."
    },
];

export default function StoreReviewsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | HandlingStatus>('pending');

    const filteredReviews = useMemo(() => {
        return MOCK_REVIEWS.filter(rev => {
            const matchesStatus = selectedStatus === 'all' || rev.status === selectedStatus;
            const matchesSearch = rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 rev.user.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [searchTerm, selectedStatus]);

    const stats = useMemo(() => {
        const pending = MOCK_REVIEWS.filter(r => r.status === 'pending').length;
        const total = MOCK_REVIEWS.length;
        return { pending, total };
    }, []);

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-[1400px] mx-auto pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">Chăm sóc Khách hàng</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                             Trung tâm phản hồi & Xử lý SLA cửa hàng
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-[#11111a] p-1 rounded-xl border border-slate-200 dark:border-white/5 flex gap-1 shadow-sm font-black text-[10px] uppercase">
                        <button 
                            onClick={() => setSelectedStatus('pending')}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedStatus === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Cần xử lý ({stats.pending})
                        </button>
                        <button 
                            onClick={() => setSelectedStatus('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Tất cả ({stats.total})
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Review List Console (Left) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Tìm tên khách hàng hoặc nội dung phản ánh..."
                            className="w-full h-14 bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/5 rounded-2xl pl-12 pr-4 outline-none text-sm font-bold shadow-sm focus:ring-2 ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((rev) => (
                                <div key={rev.id} className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {rev.type === 'good' ? <IconSmile2D className="w-10 h-10" /> : <IconFrown2D className="w-10 h-10" />}
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#11111a] flex items-center justify-center ${rev.status === 'handled' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                    {rev.status === 'handled' ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white leading-none capitalize">{rev.user.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase leading-none tracking-tighter">{rev.user.phone} • {rev.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">
                                            {rev.reasons.map(r => (
                                                <span key={r} className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-white/5 text-slate-500">{r}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl mb-4 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/5 transition-all">
                                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                                    </div>

                                    {rev.status === 'pending' ? (
                                        <div className="flex items-center gap-3">
                                            <button className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                                                <MessageSquare size={14} /> Phản hồi khách hàng
                                            </button>
                                            <button className="px-6 h-11 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                                Lưu ghi chú
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                                <span className="opacity-60 uppercase tracking-widest mr-2 underline">Đã xử lý:</span>
                                                {rev.handlingNote}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-24 bg-white dark:bg-[#11111a] rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5 text-center">
                                <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Tuyệt vời! Bạn không còn phản hồi nào chờ xử lý.</h4>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="lg:col-span-4 space-y-6 sticky top-6">
                    {/* SLA Monitor */}
                    <div className="bg-gradient-to-br from-indigo-700 to-violet-800 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        
                        <TrendingUp className="mb-6 opacity-40" size={32} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Mục tiêu xử lý SLA</h4>
                        <div className="text-4xl font-black tracking-tighter mt-2 mb-4">120 <span className="text-lg opacity-60">Phút</span></div>
                        <p className="text-xs opacity-70 leading-relaxed font-bold">
                            95% phản hồi cần được trả lời trong khung giờ vàng để đảm bảo tính hài lòng. Nhà hàng hiện đang có <span className="text-amber-400 underline">{stats.pending} khách</span> chưa được phục vụ phản hồi.
                        </p>
                        
                        <div className="mt-8 space-y-4">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Hiệu suất tháng này</span>
                                <span>85% / 95%</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">Xem chi tiết SLA →</button>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-6 bg-slate-900 rounded-[32px] text-slate-400 border border-white/5 shadow-xl">
                        <AlertCircle className="mb-4 text-indigo-400" size={24} />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white">Chăm sóc Khách hàng tip:</h5>
                        <ul className="space-y-4 text-[11px] font-medium leading-relaxed italic">
                            <li>• Luôn bắt đầu bằng việc xin lỗi về sự bất tiện.</li>
                            <li>• Đề cập trực tiếp vào vấn đề khách hàng nêu ra.</li>
                            <li>• Cung cấp giải pháp cụ thể giúp khách hàng cảm thấy được trân trọng.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

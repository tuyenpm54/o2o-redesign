import React from 'react';
import { Download, CalendarDays, CheckSquare, Star, User } from 'lucide-react';

const mockReviews = [
    { id: 1, name: 'Nguyễn Văn A', rating: 5, date: '23/02/2026', content: 'Đồ ăn rất ngon, nhân viên phục vụ chu đáo. Gợi ý món chính xác!' },
    { id: 2, name: 'Trần Thị B', rating: 4, date: '22/02/2026', content: 'Không gian đẹp, tuy nhiên món lên hơi chậm lúc quán đông khách.' },
    { id: 3, name: 'Lê Văn C', rating: 5, date: '21/02/2026', content: 'Rất ấn tượng với tính năng gọi món tự động, gợi ý món ăn rất hợp khẩu vị của mình luôn.' },
    { id: 4, name: 'Phạm Thị D', rating: 3, date: '20/02/2026', content: 'Món ăn tạm được, giá hơi cao so với mặt bằng chung. Cần cải thiện thêm quy trình phục vụ.' },
];

export function CustomerReviewsSummary() {
    return (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col transition-all duration-300 w-full mb-6 relative overflow-hidden">

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60 dark:border-white/10 relative z-10">
                <button className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer">
                    <Download size={16} /> Xuất Báo Cáo
                </button>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 px-4 py-2.5 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-colors duration-200">
                    <CalendarDays size={16} className="text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">09/02/2026 - 23/02/2026</span>
                </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-8 mb-6 relative overflow-hidden shadow-sm group-hover:border-orange-300 dark:group-hover:border-orange-500/40 transition-colors duration-500 z-10">

                <div className="flex items-baseline gap-1 relative z-10 shrink-0">
                    <span className="text-6xl font-black text-orange-600 dark:text-orange-500 tracking-tighter">0.0</span>
                    <span className="text-sm font-bold text-orange-600/70 dark:text-orange-500/70 uppercase tracking-widest">/ 5</span>
                </div>

                <div className="flex flex-col gap-5 relative z-10 flex-1">
                    <div className="flex flex-wrap gap-3">
                        {['5 Sao (0)', '4 Sao (0)', '3 Sao (0)', '2 Sao (0)', '1 Sao (0)'].map(star => (
                            <button key={star} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer">
                                {star.split(' ')[0]} <span className="text-amber-400">★</span> <span className="opacity-50 ml-1 block mt-0.5">({star.split('(')[1]}</span>
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group/toggle w-fit mt-2">
                        <div className="w-5 h-5 rounded-[4px] bg-orange-500 flex items-center justify-center shadow-inner group-hover/toggle:bg-orange-600 transition-colors">
                            <CheckSquare size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/toggle:text-slate-900 dark:group-hover/toggle:text-white transition-colors duration-200">Chỉ hiển thị đánh giá có phản hồi</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4 relative z-10 mt-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Đánh giá gần đây</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockReviews.map(review => (
                        <div key={review.id} className="bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h5>
                                        <span className="text-xs font-medium text-slate-500">{review.date}</span>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 shrink-0 pt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                                "{review.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

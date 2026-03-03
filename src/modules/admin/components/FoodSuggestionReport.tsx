import React from 'react';
import { ThumbsUp, ThumbsDown, Star, PieChart as PieChartIcon, Search } from 'lucide-react';

export function FoodSuggestionReport() {
    const listItems = [
        { name: 'Bò hầm ngũ quả', count: 10, likes: 10, dislikes: 2, rating: 4.5 },
        { name: 'Gà nướng lu trung hoa', count: 10, likes: 10, dislikes: 2, rating: 4.5 },
        { name: 'Cá lăng nấu canh chua', count: 10, likes: 10, dislikes: 2, rating: 4.5 },
        { name: 'Heo quay lạng sơn', count: 10, likes: 10, dislikes: 2, rating: 4.5 },
        { name: 'Bò hầm ngũ quả', count: 10, likes: 10, dislikes: 2, rating: 4.5 },
    ];

    const generateList = (title: string, badgeIcon?: React.ReactNode, badgeColor?: string, desc?: string, rightImage?: string) => (
        <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-6 border border-slate-200/50 dark:border-white/[0.05] relative overflow-hidden group hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-default">

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                        {badgeIcon && <span className={`text-${badgeColor}-500 bg-${badgeColor}-100 dark:bg-${badgeColor}-500/20 p-1.5 rounded-full`}>{badgeIcon}</span>}
                        {title}
                    </h4>
                    {desc && <p className="text-sm font-medium text-slate-500 max-w-lg">{desc}</p>}
                </div>
                {rightImage && (
                    <div className="w-24 h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl absolute -right-6 -top-4 shadow-xl border-4 border-white dark:border-slate-800 flex flex-col items-center pt-4 transform rotate-12 group-hover:rotate-6 transition-transform opacity-30 group-hover:opacity-100">
                        <div className="w-16 h-2 bg-slate-300 dark:bg-slate-700 rounded-full mb-2"></div>
                        <div className="w-20 h-2 bg-slate-300 dark:bg-slate-700 rounded-full mb-1"></div>
                        <div className="w-12 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    </div>
                )}
            </div>

            <div className="relative z-10 bg-white dark:bg-[#121212]/80 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-200/60 dark:border-white/10 overflow-hidden transform transition-transform duration-300">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 font-bold uppercase text-xs border-b border-slate-100 dark:border-white/10">
                        <tr>
                            <th className="px-5 py-4">Món gọi theo gợi ý</th>
                            <th className="px-5 py-4 text-center">Số lượt chọn</th>
                            <th className="px-5 py-4 text-center">Đánh giá món gợi ý</th>
                            <th className="px-5 py-4 text-center">Đánh giá bữa ăn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.05]">
                        {listItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-150">
                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                                <td className="px-5 py-3.5 text-center font-black text-slate-900 dark:text-white">{item.count}</td>
                                <td className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold"><ThumbsUp size={16} className="fill-blue-600 dark:fill-blue-400 opacity-20" /> {item.likes}</span>
                                        <span className="flex items-center gap-1.5 text-red-500 font-bold"><ThumbsDown size={16} className="fill-red-500 opacity-20" /> {item.dislikes}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <span className="flex items-center justify-center gap-1.5 font-bold text-amber-500">
                                        {item.rating} <Star size={16} className="fill-amber-500 opacity-20" />
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col transition-all duration-300 w-full mb-6 relative overflow-hidden">

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-white/10 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    Báo cáo đề xuất / gợi ý món ăn
                </h3>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Số lượt gọi có món gợi ý</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">1,200</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase">+18%</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Tỷ lệ trên tổng lượt gọi</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">15<span className="text-2xl opacity-50">%</span></span>
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-md text-[10px] font-black uppercase">-1.2%</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Số lượng món gợi ý</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">1,200</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase">+18%</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Doanh thu đem lại</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">250.8<span className="text-xl opacity-50">M</span></span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase">+18%</span>
                    </div>
                </div>
            </div>

            {/* Pie Charts Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-slate-50 dark:bg-[#111827] p-8 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm relative z-10">
                <div className="flex flex-col items-center group/pie">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-8 uppercase tracking-wider text-sm">Tỷ lệ gọi món theo gợi ý</h5>
                    <div className="w-48 h-48 rounded-full border-[1rem] border-blue-500 relative overflow-hidden shadow-inner transition-transform duration-500 group-hover/pie:scale-105" style={{ borderTopColor: '#10b981', borderRightColor: '#f97316', borderBottomColor: '#facc15' }}>
                        <div className="absolute inset-0 bg-slate-50 dark:bg-[#111827] rounded-full m-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center">
                            <PieChartIcon size={32} className="text-slate-400 dark:text-slate-600" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-8 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-blue-500 rounded-md shadow-sm"></div> Món mới</span>
                        <span className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-emerald-500 rounded-md shadow-sm"></div> Bán chạy</span>
                        <span className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-orange-500 rounded-md shadow-sm"></div> Vừa gọi</span>
                        <span className="flex items-center gap-2 hover:text-amber-500 dark:hover:text-amber-500 transition-colors cursor-pointer"><div className="w-4 h-4 bg-yellow-400 rounded-md shadow-sm"></div> Ăn kèm</span>
                    </div>
                </div>
                <div className="flex flex-col items-center group/pie">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-8 uppercase tracking-wider text-sm">Doanh thu theo loại gợi ý</h5>
                    <div className="w-48 h-48 rounded-full border-[1rem] border-indigo-500 relative overflow-hidden shadow-inner transition-transform duration-500 group-hover/pie:scale-105" style={{ borderTopColor: '#ec4899', borderRightColor: '#8b5cf6', borderBottomColor: '#06b6d4' }}>
                        <div className="absolute inset-0 bg-slate-50 dark:bg-[#111827] rounded-full m-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center">
                            <PieChartIcon size={32} className="text-slate-400 dark:text-slate-600" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-8 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-indigo-500 rounded-md shadow-sm"></div> Món mới</span>
                        <span className="flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-pink-500 rounded-md shadow-sm"></div> Bán chạy</span>
                        <span className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-purple-500 rounded-md shadow-sm"></div> Vừa gọi</span>
                        <span className="flex items-center gap-2 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"><div className="w-4 h-4 bg-cyan-500 rounded-md shadow-sm"></div> Ăn kèm</span>
                    </div>
                </div>
            </div>

            {/* List Sections */}
            <div className="space-y-6">
                {generateList('Thống kê lượt chọn "Món mới phải thử"', <span className="font-black text-rose-600">NEW</span>, 'rose', 'Số lượt chọn món mới tinh đã có trên hệ thống hoặc món bạn cài đặt chỉ dẫn thiết lập "Món mới phải thử"', "mockup-img")}
                {generateList('Thống kê lượt chọn "Top bán chạy"', <Star size={16} className="fill-amber-500 text-amber-500" />, 'amber', 'Số lượng món khách hàng đã nhấn chọn đặt trên hiển thị "Top phân mềm / Món bán chạy"', "mockup-img")}
                {generateList('Thống kê lượt chọn theo "Gợi ý dựa trên món khách vừa gọi"', <Search size={16} className="text-emerald-500" />, 'emerald', 'Số lượng món khách hàng đã nhấn chọn đặt trên màn hình Popup Gợi Ý khi khách vừa thêm Món vào giỏ')}
                {generateList('Thống kê lượt chọn "Gợi ý các món ăn kèm"', <Search size={16} className="text-blue-500" />, 'blue', 'Số lượng món khách hàng đã nhấn chọn đặt dựa trên gợi ý các món ăn kèm')}
            </div>

        </div>
    );
}

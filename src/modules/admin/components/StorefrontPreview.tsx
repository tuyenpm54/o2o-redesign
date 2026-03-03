import React from 'react';
import { Search, ChevronRight, X, User, ShoppingBag, Star, Zap, Check } from 'lucide-react';

interface StorefrontPreviewProps {
    blocks: any[];
}

export function StorefrontPreview({ blocks }: StorefrontPreviewProps) {
    return (
        <div className="w-full relative bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 mt-8">

            {/* Header Mẫu */}
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 sticky top-0 z-40 border-b border-slate-100 dark:border-white/5 flex gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/5" />
                <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đặt Món</p>
                    <h3 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">Bàn 12 - Tầng 2</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Search size={16} />
                </div>
            </div>

            <div className="flex flex-col gap-6 pt-4 pb-20">
                {blocks.map((block) => (
                    <div key={block.id + '_preview'} className="w-full">
                        {renderBlockPreview(block)}
                    </div>
                ))}
            </div>

        </div>
    );
}

function renderBlockPreview(block: any) {
    switch (block.type) {
        case 'hero-banner':
            return (
                <div className="px-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-black text-lg text-slate-900 dark:text-white">{block.title || 'Khuyến Mãi'}</h2>
                    </div>
                    <div className="w-full h-36 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-sm text-white flex p-4 items-end relative overflow-hidden">
                        <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-white/10 rotate-45" />
                        <div className="font-bold text-lg leading-tight relative z-10 w-2/3">Khai Trương Rộn Ràng, Nhận Vàng Ưu Đãi!</div>
                    </div>
                </div>
            );
        case 'value-combos':
            return (
                <div className="px-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-black text-lg text-slate-900 dark:text-white">{block.title || 'Combo Đặc Trưng'}</h2>
                        <span className="text-xs font-bold text-orange-500">Xem thêm</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="w-48 shrink-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                                <div className="h-28 bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center relative">
                                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SALE !</span>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm mb-1 leading-tight">Combo Gia Đình {i}</h3>
                                    <div className="flex items-end gap-2 mb-2">
                                        <div className="text-orange-600 font-bold text-[15px]">399k</div>
                                        <div className="text-slate-400 line-through text-xs font-medium">500k</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'guided-discovery':
            return (
                <div className="px-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex items-center gap-4">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shrink-0">
                            <Zap size={20} className="text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="font-black text-[15px] mb-0.5">{block.title || 'Bạn chưa biết ăn gì?'}</h3>
                            <p className="text-xs text-white/80 line-clamp-2">Trả lời 3 câu hỏi để chúng tôi gợi ý món ngon chuẩn vị ngay nhé.</p>
                            <button className="mt-2 bg-white text-blue-600 text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider hover:bg-slate-50 transition-colors">Bắt đầu ngay</button>
                        </div>
                    </div>
                </div>
            );
        case 'highlight-categories':
            return (
                <div className="px-4">
                    <h2 className="font-black text-lg mb-3 tracking-tight text-slate-900 dark:text-white">{block.title || 'Món Mới Phải Thử'}</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-32 shrink-0">
                                <div className="w-32 h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-white/5" />
                                <div className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">Món {i} ngon</div>
                                <div className="text-sm font-bold text-orange-600">80.000đ</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'group-ordering':
            return (
                <div className="mx-4 bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-zinc-900 relative z-30" />
                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-zinc-900 relative z-20" />
                            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-900 relative z-10 flex items-center justify-center text-white text-xs font-bold">+3</div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-orange-200">{block.title || 'Gọi món cùng nhóm'}</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-orange-400">Gửi link để bạn bè cùng order</p>
                        </div>
                    </div>
                </div>
            );
        case 'menu-grid':
            // Render basic menu list to show it works
            return (
                <div className="px-4 mt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-black text-xl text-slate-900 dark:text-white border-l-4 border-orange-500 pl-3">{block.title || 'Món Chính'}</h2>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 items-start bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                                <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                                <div className="flex-1 py-1">
                                    <h3 className="font-bold text-[15px] leading-tight mb-1">Món chính siêu hấp dẫn {i}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">Thịt bò, hành tây, phô mai, sốt ngũ vị hương ngấm đều...</p>
                                    <div className="flex justify-between items-center">
                                        <div className="font-black text-orange-600 text-sm">120.000đ</div>
                                        <button className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center font-bold text-lg">+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        default:
            return <div className="mx-4 p-4 text-center rounded-xl font-medium text-slate-400 border border-dashed border-slate-300 bg-slate-100">{block.name} Layout Missing</div>;
    }
}

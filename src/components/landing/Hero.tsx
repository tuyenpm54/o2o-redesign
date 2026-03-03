import Link from 'next/link';
import { Box, ShieldCheck, Zap, Bot, MessageSquare, Flame } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden transition-colors duration-300">
            <div className="container mx-auto relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-blue-600 dark:text-blue-300 text-[11px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md transition-colors">
                        <Bot size={14} className="fill-blue-600 dark:fill-blue-400" />
                        The New O2O Assistant
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.95] transition-colors">
                        Giải pháp thay thế <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">Nhân viên gọi đồ tại bàn</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium transition-colors">
                        Không còn chỉ là giải pháp thực đơn điện tử vô tri. O2O giờ đây là một nhân viên tận tuỵ hỗ trợ tư vấn, hướng dẫn gọi đồ và gợi ý các món ăn phù hợp nhất với thói quen của thực khách.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                        <Link
                            href="/admin/dashboard"
                            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-500 active:scale-95 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.2)] dark:shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
                        >
                            <Zap size={20} className="fill-white" />
                            Dùng thử ngay 0đ
                        </Link>
                        <Link
                            href="#pricing"
                            className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 backdrop-blur-md transition-all shadow-sm"
                        >
                            Khám phá bảng giá
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-20 pt-8 border-t border-slate-200 dark:border-white/5 w-full transition-colors">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-8">Được tin dùng bởi hơn 500+ nhà hàng</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 font-black text-xl text-slate-800 dark:text-white"><Box size={24} /> BURGER KING</div>
                            <div className="flex items-center gap-2 font-black text-xl text-slate-800 dark:text-white"><ShieldCheck size={24} /> HIGHLANDS</div>
                            <div className="flex items-center gap-2 font-black text-xl text-slate-800 dark:text-white"><Flame size={24} /> THE COFFEE HOUSE</div>
                            <div className="flex items-center gap-2 font-black text-xl text-slate-800 dark:text-white"><Box size={24} /> KFC VIETNAM</div>
                        </div>
                    </div>
                </div>

                {/* Smart Chat/Menu Mockup - Glassmorphism */}
                <div className="mt-24 relative max-w-5xl mx-auto p-3 rounded-[2rem] bg-white/40 dark:bg-white/[0.03] border border-white/60 dark:border-white/[0.08] backdrop-blur-3xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/50 transition-colors">
                    <div className="aspect-[16/9] bg-slate-50 dark:bg-[#050510]/80 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-white/5 relative p-6 flex flex-col gap-6 shadow-inner transition-colors">

                        {/* Header Mockup */}
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4 transition-colors relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-[3px] border-white dark:border-slate-800 flex items-center justify-center transition-colors shadow-md">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Bot Gọi Món O2O</h3>
                                    <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang sẵn sàng phục vụ
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 bg-white dark:bg-slate-800/50">
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Bàn 12</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Menu Content Mockup */}
                        <div className="grid grid-cols-3 gap-6 flex-1 relative z-10">
                            {/* Chat interaction column */}
                            <div className="col-span-1 space-y-4 flex flex-col">
                                <div className="bg-white dark:bg-slate-800/60 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 dark:border-white/5 self-start max-w-[90%]">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Xin chào! Hôm nay bạn muốn dùng chút khai vị hay đi thẳng vào món chính ạ?</p>
                                </div>
                                <div className="bg-blue-600 dark:bg-blue-600 rounded-2xl rounded-tr-sm p-4 shadow-sm self-end max-w-[90%] text-white">
                                    <p className="text-sm font-medium">Cho mình xem vài món khai vị nhé. Mình thích đồ chiên giòn.</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800/60 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 dark:border-white/5 self-start max-w-[90%] flex flex-col gap-3">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dưới đây là vài gợi ý cho bạn nhé, Khoai tây chiên giòn và Cánh gà chiên bơ tỏi đang bán rất chạy!</p>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-500/20 cursor-pointer">Cánh gà chiên</div>
                                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-white/10 cursor-pointer">Khoai tây</div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Suggestion Grid */}
                            <div className="col-span-2 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-white/[0.04] p-5 flex flex-col relative overflow-hidden transition-colors shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                                        <Flame size={18} className="text-orange-500" /> Được gợi ý cho bạn
                                    </h4>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">Combo siêu tiết kiệm</span>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    {/* Mock Card 1 */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-white/5 flex flex-col group cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                        <div className="h-28 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Giảm 20%</div>
                                        </div>
                                        <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 group-hover:text-blue-600 transition-colors">Gà chiên giòn rụm + Coca</h5>
                                        <div className="flex justify-between items-end mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 line-through">120.000đ</span>
                                                <span className="font-black text-blue-600 dark:text-blue-400">96.000đ</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold pb-0.5">+</div>
                                        </div>
                                    </div>

                                    {/* Mock Card 2 */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-white/5 flex flex-col group cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                        <div className="h-28 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mb-3"></div>
                                        <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 group-hover:text-blue-600 transition-colors">Khoai tây chiên phô mai</h5>
                                        <div className="flex justify-between items-end mt-auto">
                                            <span className="font-black text-slate-900 dark:text-white">45.000đ</span>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold pb-0.5">+</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

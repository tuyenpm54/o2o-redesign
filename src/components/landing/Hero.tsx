import Link from 'next/link';
import { Box, ShieldCheck, Zap, Flame, ShoppingBag, ChefHat, Sparkles, TrendingUp } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative pt-32 pb-24 px-6 transition-colors duration-300 overflow-hidden flex flex-col items-center">
            {/* Cinematic Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-gradient-to-b from-[#DF1B41]/10 via-[#F56B0F]/5 to-transparent dark:from-[#DF1B41]/20 dark:via-[#F56B0F]/10 blur-[120px] rounded-[100%] pointer-events-none z-0 mix-blend-normal dark:mix-blend-screen opacity-80" />

            <div className="container mx-auto relative z-10 w-full max-w-7xl flex flex-col items-center">
                
                {/* Hero Content - Refined Typography */}
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-md text-slate-600 dark:text-slate-300 text-[12px] font-bold uppercase tracking-[0.2em] mb-10 shadow-sm">
                        <Sparkles size={14} className="text-[#F56B0F]" />
                        Giải pháp O2O thông minh
                    </div>
                    
                    <h1 className="text-[44px] md:text-[64px] lg:text-[76px] font-extrabold tracking-tighter text-slate-900 dark:text-white mb-8 leading-[1.05] w-full max-w-4xl mx-auto text-balance">
                        Khách không phải đợi.<br className="hidden md:block"/>
                        <span className="relative inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-br from-[#DF1B41] via-[#F56B0F] to-amber-500 pb-2">
                            Quán không lo vỡ trận.
                            {/* Subtle text glow behind */}
                            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-[#DF1B41] via-[#F56B0F] to-amber-500 blur-2xl opacity-30 select-none">Quán không lo vỡ trận.</span>
                        </span>
                    </h1>
                    
                    <p className="text-[18px] md:text-[22px] text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium text-balance">
                        Hệ thống tự động hóa gọi món tại bàn. Giúp Bếp làm cực nhanh, nhân viên cực nhàn và tự động mời gọi thêm món để tăng vọt doanh thu.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                        <Link href="/admin/dashboard" className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-[16px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(255,255,255,0.15)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Zap size={18} className="relative z-10 group-hover:text-white transition-colors" /> 
                            <span className="relative z-10 group-hover:text-white transition-colors">Dùng thử Miễn phí</span>
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-[16px] transition-colors flex items-center justify-center">
                            Xem cách hoạt động &rarr;
                        </Link>
                    </div>
                </div>

                {/* Spatial Abstract Layout - Antigravity Style */}
                <div className="relative mt-24 w-full max-w-5xl mx-auto h-[480px] flex items-center justify-center perspective-[2000px]">
                    
                    {/* Core System Sphere */}
                    <div className="absolute z-20 w-32 h-32 rounded-full bg-white/90 dark:bg-[#111115]/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#DF1B41]/20 to-[#F56B0F]/20 rounded-full blur-xl" />
                        <Zap size={40} className="text-[#DF1B41] relative z-10" />
                    </div>

                    {/* Floating Card 1: Kitchen (Left) */}
                    <div className="absolute z-30 left-0 md:left-[2%] top-[10%] w-[280px] bg-white/70 dark:bg-[#15151A]/70 backdrop-blur-3xl border border-white/50 dark:border-white/5 rounded-[32px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.05)] transform -translate-y-4 hover:-translate-y-8 transition-all duration-500 hover:rotate-0 -rotate-3 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] group">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><ChefHat size={20} className="text-orange-500"/></div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">Sườn Nướng Tảng</div>
                                <div className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Bàn 12</div>
                            </div>
                        </div>
                        <div className="inline-flex bg-orange-50 dark:bg-orange-500/10 px-4 py-3 rounded-2xl text-[13px] text-orange-600 dark:text-orange-400 font-bold items-center gap-2.5 w-full justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(249,115,22,0.5)]"/>
                            Bếp Đang Nấu
                        </div>
                    </div>

                    {/* Floating Card 2: Upsell Autonomy (Bottom Center) */}
                    <div className="absolute z-40 bottom-0 md:bottom-[0%] left-1/2 -translate-x-1/2 w-[340px] bg-white/90 dark:bg-[#111115]/90 backdrop-blur-3xl border border-white/80 dark:border-white/10 rounded-[32px] p-5 shadow-[0_40px_100px_rgba(223,27,65,0.15)] transform hover:scale-105 transition-all duration-500 translate-y-8 hover:translate-y-4 group">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DF1B41] to-[#F56B0F] text-white flex items-center justify-center shadow-[0_10px_20px_rgba(223,27,65,0.3)] group-hover:rotate-12 transition-transform"><ShoppingBag size={24}/></div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Máy Mời Khách</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight">Thêm Trứng Chần?</span>
                                </div>
                            </div>
                            <div className="text-[13px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-2xl">
                                + 15K
                            </div>
                        </div>
                    </div>

                    {/* Floating Card 3: Operations (Right - Dashboard Live) */}
                    <div className="absolute z-10 right-0 md:right-[2%] top-[20%] w-[280px] bg-white/70 dark:bg-[#1A1A1F]/70 backdrop-blur-3xl border border-white/50 dark:border-white/5 rounded-[32px] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.05)] transform translate-y-4 hover:translate-y-0 transition-all duration-500 rotate-3 hover:rotate-0 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Doanh Thu Tăng</div>
                                <div className="text-[36px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none">24<span className="text-[20px] text-slate-400">%</span></div>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                                <TrendingUp size={18} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                <span>Tỷ lệ lật bàn</span>
                                <span className="text-emerald-500">Nhanh hơn</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-[80%] rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Orbital Rings - Deep Space feel */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-[100%] border-[2px] border-slate-200/30 dark:border-white/[0.03] pointer-events-none z-0 transform -rotate-[15deg]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-[100%] border border-slate-200/20 dark:border-white/[0.02] pointer-events-none z-0 transform rotate-[15deg]" />
                </div>

                {/* Trust Section */}
                <div className="mt-32 border-t border-black/[0.04] dark:border-white/[0.04] pt-14 text-center w-full">
                    <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">Tương thích hoàn hảo với mọi mô hình</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 dark:opacity-40">
                        <div className="flex items-center gap-3 font-bold text-[22px] text-slate-900 dark:text-white tracking-tight"><Box size={24} className="text-[#DF1B41]" /> QUÁN LẨU NƯỚNG</div>
                        <div className="flex items-center gap-3 font-bold text-[22px] text-slate-900 dark:text-white tracking-tight"><ShieldCheck size={24} className="text-emerald-500" /> CAFE & TRÀ SỮA</div>
                        <div className="flex items-center gap-3 font-bold text-[22px] text-slate-900 dark:text-white tracking-tight"><Flame size={24} className="text-orange-500" /> FOOD COURT</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

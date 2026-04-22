import Link from 'next/link';
import { Box, ShieldCheck, Zap, Flame, ShoppingBag, ChefHat } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-6 transition-colors duration-300 overflow-hidden flex flex-col items-center">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-[#DF1B41]/10 to-[#F56B0F]/10 dark:from-[#DF1B41]/20 dark:to-[#F56B0F]/20 blur-[120px] rounded-[100%] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen opacity-70" />

            <div className="container mx-auto relative z-10 w-full max-w-7xl flex flex-col items-center">
                
                {/* Hero Content */}
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-8">
                        <Zap size={14} className="fill-red-500" />
                        Nền tảng Quản trị F&B O2O
                    </div>
                    <h1 className="text-[24px] md:text-[38px] lg:text-[48px] font-medium tracking-tight text-slate-900 dark:text-white mb-6 leading-tight w-full max-w-5xl mx-auto text-balance">
                        <span className="block mb-1">Giải pháp thay thế nhân viên phục vụ.</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] font-bold">
                            Hệ thống vạch trần điểm mù vận hành.
                        </span>
                    </h1>
                    <p className="text-[17px] md:text-[20px] text-slate-500 dark:text-slate-400 mb-10 max-w-4xl mx-auto leading-relaxed font-medium text-balance">
                        Hệ thống thực đơn thông minh, cập nhật trạng thái món thời gian thực cùng báo cáo chi tiết mọi chỉ số vận hành.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link href="/admin/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white rounded-full font-bold text-[15px] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(223,27,65,0.3)]">
                            <Zap size={18} className="fill-white" /> Trợ lý Vận Hành HQ
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto px-8 py-3.5 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full font-semibold text-[15px] transition-colors">
                            Khám phá Tính năng
                        </Link>
                    </div>
                </div>

                {/* Spatial Abstract Layout (Replacing the Literal Phone Mockup) */}
                <div className="relative mt-20 w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center perspective-[2000px]">
                    {/* Core System Sphere */}
                    <div className="absolute z-20 w-32 h-32 rounded-full bg-gradient-to-br from-white to-slate-50 dark:from-[#1A1A1F] dark:to-[#0B0B0F] border border-white/60 dark:border-white/10 shadow-[0_20px_50px_rgba(223,27,65,0.15)] flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite] group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#DF1B41]/20 to-[#F56B0F]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <Zap size={40} className="text-[#DF1B41] relative z-10" />
                    </div>

                    {/* Floating Card 1: Experience (Left - Kitchen Timeline) */}
                    <div className="absolute z-30 left-0 md:left-[5%] top-[15%] w-[260px] bg-white/80 dark:bg-[#15151A]/80 backdrop-blur-2xl border border-white dark:border-white/5 rounded-[24px] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.08)] transform -translate-y-4 hover:-translate-y-6 transition-transform -rotate-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center"><ChefHat size={18} className="text-orange-500"/></div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-[13px]">Set Nướng Premium</div>
                                <div className="text-[11px] font-bold text-emerald-500">Bàn A-12</div>
                            </div>
                        </div>
                        <div className="inline-flex bg-orange-50 dark:bg-orange-500/10 px-3 py-2.5 rounded-xl text-[12px] text-orange-600 dark:text-orange-400 font-bold items-center gap-2 w-full justify-center shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]"/>
                            Bếp Đang Lên Đồ
                        </div>
                    </div>

                    {/* Floating Card 2: Autonomy (Bottom Center - Checkout/VAT) */}
                    <div className="absolute z-40 bottom-0 md:bottom-[5%] left-1/2 -translate-x-1/2 w-[300px] bg-white/95 dark:bg-[#111115]/95 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[28px] p-4 shadow-[0_40px_80px_rgba(223,27,65,0.15)] transform hover:scale-105 transition-transform translate-y-8">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[14px] bg-[#DF1B41] text-white flex items-center justify-center shadow-[0_10px_20px_rgba(223,27,65,0.3)]"><ShoppingBag size={20}/></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Thanh toán</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-[15px]">1 Giạm Tự Động</span>
                                </div>
                            </div>
                            <div className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-3 py-2 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors">
                                + Thuế VAT
                            </div>
                        </div>
                    </div>

                    {/* Floating Card 3: Operations (Right - Dashboard Live) */}
                    <div className="absolute z-10 right-0 md:right-[5%] top-[25%] w-[260px] bg-white/80 dark:bg-[#1A1A1F]/80 backdrop-blur-xl border border-white dark:border-white/5 rounded-[28px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.1)] transform translate-y-4 hover:translate-y-2 transition-transform rotate-3">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Doanh thu Live</div>
                                <div className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none font-mono">24.5M</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between text-[12px] font-bold text-slate-600 dark:text-slate-300">
                                <span>Tỉ lệ khách dùng O2O</span>
                                <span className="text-[#DF1B41]">68%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#DF1B41] w-[68%] rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Connecting orbital lines (Decorative behind) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[240px] rounded-[100%] border border-slate-200/50 dark:border-white/5 pointer-events-none z-0 transform -rotate-12" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-[100%] border border-slate-200/30 dark:border-white/[0.02] pointer-events-none z-0 transform rotate-12" />
                </div>

                <div className="mt-32 border-t border-black/[0.04] dark:border-white/[0.04] pt-12 text-center w-full">
                    <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-8">Kiến trúc linh hoạt tại các mô hình</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-40 dark:opacity-30">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white"><Box size={22} /> DINE-IN</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white"><ShieldCheck size={22} /> FOOD COURT</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white"><Flame size={22} /> FAST FOOD</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

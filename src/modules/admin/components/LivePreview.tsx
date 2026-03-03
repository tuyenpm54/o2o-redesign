import { StyleConfig } from './StyleConfigurator';
import { Search } from 'lucide-react';

export function LivePreview({ config }: { config: StyleConfig }) {
    return (
        <div className="bg-white/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.08] backdrop-blur-3xl rounded-[1.5rem] p-6 shadow-sm min-h-[500px] flex flex-col h-full transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                Trình Xem Trước (Khách Đặt Món)
            </h3>

            <div className="flex-1 bg-slate-100/50 dark:bg-black/20 rounded-[1.5rem] p-8 flex flex-col items-center overflow-hidden relative border border-slate-200/50 dark:border-white/5 transition-colors duration-300 shadow-inner">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-6 relative z-10 bg-white/50 dark:bg-[#050510]/50 px-4 py-1.5 rounded-full backdrop-blur-md">Giao diện điện thoại</p>

                {/* iPhone Mockup Frame */}
                <div
                    className="w-[320px] bg-white dark:bg-[#0f0f13] shadow-2xl flex flex-col h-[580px] overflow-auto transition-all duration-300 border-8 border-slate-300 dark:border-zinc-800 relative"
                    style={{
                        borderRadius: '3rem', // Always rounded on the phone case
                        fontFamily: config.fontFamily
                    }}
                >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-300 dark:bg-zinc-800 rounded-b-2xl z-20" />

                    {/* Mock Header */}
                    <div className="h-40 relative transition-colors duration-300 shrink-0" style={{ backgroundColor: config.primaryColor }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-5 text-white">
                            <h2 className="text-xl font-bold tracking-tight">Cơm Thố Xưa</h2>
                            <p className="text-xs font-medium opacity-90 mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Bàn 12 • 4 Khách
                            </p>
                        </div>

                        <div className="absolute top-8 right-4 flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm">
                                <Search size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Mock Menu Body */}
                    <div className="bg-slate-50 dark:bg-[#0f0f13] flex-1 pb-20">
                        {/* Section Header */}
                        <div className="px-5 pt-6 pb-2">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Món Vừa Chọn</h3>
                        </div>

                        <div className="px-4 space-y-3">
                            <div
                                className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 relative overflow-hidden group"
                                style={{ borderRadius: config.borderRadius }}
                            >
                                <div
                                    className="w-16 h-16 bg-slate-200 dark:bg-white/5 transition-all duration-300 relative"
                                    style={{ borderRadius: parseInt(config.borderRadius) > 0 ? `${parseInt(config.borderRadius) - 6}px` : '0px' }}
                                >
                                    <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-20"><div className="w-full h-full bg-slate-400 rounded-sm" /></div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Cơm Thố Bò Nướng</h4>
                                    <p className="text-[13px] text-slate-500 font-medium mt-1">65.000đ</p>
                                </div>
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-white font-bold transition-all duration-300 shadow-sm"
                                    style={{ backgroundColor: config.primaryColor, borderRadius: parseInt(config.borderRadius) > 0 ? `${parseInt(config.borderRadius) - 8}px` : '4px' }}
                                >
                                    +
                                </div>
                            </div>

                            <div
                                className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300"
                                style={{ borderRadius: config.borderRadius }}
                            >
                                <div
                                    className="w-16 h-16 bg-slate-200 dark:bg-white/5 transition-all duration-300"
                                    style={{ borderRadius: parseInt(config.borderRadius) > 0 ? `${parseInt(config.borderRadius) - 6}px` : '0px' }}
                                ></div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Trà Đào Cam Sả</h4>
                                    <p className="text-[13px] text-slate-500 font-medium mt-1">25.000đ</p>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-md">
                                    x2
                                </div>
                            </div>
                        </div>

                        {/* Smart Suggestion Mock */}
                        <div className="mt-8 px-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><span className="text-orange-500 text-lg">✨</span> Gợi ý mua kèm</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x hide-scrollbar">
                                {[1, 2].map((i) => (
                                    <div key={i} className="min-w-[130px] p-2 bg-white dark:bg-[#1a1a24] shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 snap-start" style={{ borderRadius: config.borderRadius }}>
                                        <div className="w-full h-24 bg-slate-100 dark:bg-white/5 mb-3 transition-all duration-300" style={{ borderRadius: parseInt(config.borderRadius) > 0 ? `${parseInt(config.borderRadius) - 6}px` : '0px' }} />
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Topping Thêm {i}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs font-semibold text-slate-500">10.000đ</p>
                                            <div className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full text-white bg-slate-800 dark:bg-white/20">+</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 pt-3 pb-8">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tổng cộng (3 món)</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white" style={{ color: config.primaryColor }}>115.000đ</span>
                        </div>
                        <button
                            className="w-full py-3.5 text-white font-bold shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: config.primaryColor, borderRadius: config.borderRadius }}
                        >
                            Gửi Bếp (Đặt Món)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { ChefHat, TrendingUp, CheckCircle2, ListFilter, Search, Heart, Clock, DollarSign, Info } from 'lucide-react';

export function Features() {
    return (
        <section id="features" className="py-32 bg-white dark:bg-[#08080A] relative z-10 transition-colors duration-300">
            <div className="container mx-auto px-6">
                
                <div className="max-w-4xl mb-32 text-center mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[12px] font-bold uppercase tracking-[0.2em] mb-8">
                        Thiết kế thực chiến
                    </div>
                    <h3 className="text-[44px] md:text-[64px] font-extrabold text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.05] transition-colors text-balance">
                        Giải quyết triệt để <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DF1B41] via-[#F56B0F] to-amber-500">
                            nỗi khổ vận hành F&B.
                        </span>
                    </h3>
                    <p className="text-[18px] md:text-[22px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto transition-colors text-balance">
                        Mỗi tính năng được làm ra không phải để khoe công nghệ, mà để quán của bạn vận hành trơn tru hơn và kiếm được nhiều tiền hơn.
                    </p>
                </div>

                <div className="flex flex-col gap-40">
                    
                    {/* Feature 1: Chống vỡ trận */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[20px] flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.3)] transform -rotate-6">
                                <ListFilter size={32} className="text-white" />
                            </div>
                            <h4 className="text-[36px] md:text-[52px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] text-balance">
                                Chống quá tải. <br/> Khách chọn món siêu tốc.
                            </h4>
                            <p className="text-[18px] md:text-[20px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Xóa sổ cảnh nhân viên cầm bút đứng chờ khách do dự. Khách quét mã QR tự động lên đơn thẳng vào bếp, chính xác tuyệt đối, không bao giờ nhầm lẫn "ít đá, nhiều đường".
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center perspective-[2000px]">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none opacity-50" />
                            
                            <div className="relative z-10 flex gap-6 items-center transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-700">
                                {/* Miniature Phone */}
                                <div className="w-[280px] h-[520px] bg-slate-50 dark:bg-[#0B0B0F] rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border-[12px] border-slate-900 shrink-0 relative overflow-hidden flex flex-col">
                                    <div className="px-5 pt-8 shrink-0">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <h2 className="font-bold text-[14px] text-slate-900 dark:text-white flex items-center gap-1">
                                                    Nhà Hàng A <Info size={12} className="text-slate-400" />
                                                </h2>
                                                <span className="font-bold text-[#DF1B41] text-[11px] uppercase tracking-wider">Bàn 12</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-white dark:bg-[#1A1A1F] rounded-[16px] px-4 py-3 shadow-sm border border-slate-200 dark:border-white/5">
                                           <div className="flex items-center gap-2"><Search size={14} className="text-[#DF1B41]"/><span className="text-[12px] text-slate-400 font-medium">Tìm món...</span></div>
                                        </div>
                                    </div>
                                    <div className="px-5 mt-4 font-bold text-[13px] flex items-center gap-1.5 text-slate-900 dark:text-white mb-3">
                                        <Heart size={14} fill="#DF1B41" className="text-[#DF1B41]"/> Món quen của bạn
                                    </div>
                                    <div className="pl-5 flex overflow-hidden gap-4">
                                        <div className="w-[160px] bg-white dark:bg-[#15151A] rounded-[20px] flex flex-col overflow-hidden shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/10">
                                            <div className="h-[100px] relative">
                                                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80" className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="p-3.5">
                                                <div className="font-bold text-[12px] text-slate-900 dark:text-white leading-tight mb-2">Gỏi Xoài Xanh</div>
                                                <div className="font-extrabold text-[14px] text-[#DF1B41]">125.000đ</div>
                                            </div>
                                        </div>
                                         <div className="w-[160px] bg-white dark:bg-[#15151A] rounded-[20px] flex flex-col overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-white/10 opacity-50">
                                            <div className="h-[100px] bg-slate-200 dark:bg-white/5" />
                                            <div className="p-3.5"><div className="h-4 w-full bg-slate-800 dark:bg-white/80 rounded mb-2"></div></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#111115]/95 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 rounded-t-[24px] px-4 py-5 z-20">
                                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[16px] px-4 py-3.5 flex justify-center tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                                            <div className="font-bold text-[14px] flex gap-2 items-center">Gửi Đơn Vào Bếp &rarr;</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Màn hình Bếp */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-[#F56B0F] rounded-[20px] flex items-center justify-center shadow-[0_10px_30px_rgba(245,107,15,0.3)] transform rotate-6">
                                <ChefHat size={32} className="text-white" />
                            </div>
                            <h4 className="text-[36px] md:text-[52px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] text-balance">
                                Màn hình bếp. <br/> Không bao giờ sót đơn.
                            </h4>
                            <p className="text-[18px] md:text-[20px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Đơn order bắn thẳng vào màn hình bếp "tít tít". Đầu bếp nhìn vào là biết chính xác ưu tiên làm món nào. Khách cũng có thể xem trực tiếp tiến độ bếp trên điện thoại, xóa tan cảm giác sốt ruột.
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full flex items-center justify-center perspective-[2000px]">
                            <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none opacity-50" />
                            <div className="relative z-10 w-full max-w-[460px] transform rotate-y-[10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-700">
                                <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 p-10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] space-y-8">
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
                                        <div className="font-extrabold text-slate-900 dark:text-white text-[18px] tracking-tight">Trạm Bếp 01</div>
                                        <div className="text-[14px] font-bold px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-800 dark:text-slate-200">Bàn 12</div>
                                    </div>
                                    
                                    <div className="flex gap-5 items-start pb-4 opacity-40">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mt-1"><CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" /></div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[16px] text-slate-900 dark:text-white line-through decoration-slate-400">Cơm Gà Hải Nam</div>
                                            <div className="text-[14px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Đã lên đồ</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-5 items-start relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mt-4 ring-[8px] ring-white dark:ring-[#111115]"><ChefHat size={16} className="text-orange-500" /></div>
                                        <div className="bg-slate-50 dark:bg-[#1A1A1F] border border-orange-200 dark:border-orange-500/30 p-6 rounded-[24px] w-full shadow-[0_20px_40px_rgba(245,107,15,0.1)] transform hover:scale-[1.03] transition-transform">
                                            <div className="font-bold text-[18px] text-slate-900 dark:text-white mb-3">Combo Sườn Phô Mai (x2)</div>
                                            <div className="inline-flex bg-orange-100 dark:bg-orange-500/10 px-4 py-2.5 rounded-xl text-[13px] text-orange-700 dark:text-orange-400 font-bold items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]"/>
                                                Đang chế biến...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Upsell & Dashboard */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[20px] flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] transform -rotate-6">
                                <DollarSign size={32} className="text-white" />
                            </div>
                            <h4 className="text-[36px] md:text-[52px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] text-balance">
                                Trợ lý mời đồ. <br/> Bán được nhiều tiền hơn.
                            </h4>
                            <p className="text-[18px] md:text-[20px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Nhân viên thường e ngại khi mời khách gọi thêm. Với O2O, khi khách chọn bít tết, máy tự động hỏi khéo: "Thêm rượu vang nhé?". Cùng với Dashboard đo lường doanh thu giúp bạn thấu hiểu từng chi tiết hiệu quả của quán.
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full flex items-center justify-center perspective-[2000px]">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none opacity-50" />
                            <div className="relative z-10 w-full max-w-[500px] transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-700">
                                <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 p-10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Báo Cáo Tăng Trưởng</p>
                                            <p className="text-[36px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none mb-1">Đơn có Upsell: <span className="text-emerald-500">42%</span></p>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="p-6 bg-slate-50 dark:bg-[#1A1A1F] border border-slate-100 dark:border-white/5 rounded-[24px]">
                                            <div className="flex justify-between text-[15px] font-bold mb-4">
                                                <span className="text-slate-600 dark:text-slate-300">Tốc độ lật bàn</span>
                                                <span className="text-emerald-600 font-extrabold">Rất nhanh</span>
                                            </div>
                                            <div className="flex gap-2 h-2.5">
                                                {Array.from({length: 10}).map((_, i) => (
                                                    <div key={i} className={`flex-1 rounded-full ${i < 8 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[13px] text-slate-500 mt-4 font-medium leading-relaxed">Bàn ăn hoàn tất trung bình 45 phút, nhanh hơn 24% so với trước khi dùng O2O.</p>
                                        </div>

                                        <div className="p-6 bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[24px]">
                                            <div className="flex justify-between text-[15px] font-bold mb-3">
                                                <span className="text-orange-800 dark:text-orange-400 flex items-center gap-2"><ChefHat size={18}/> Điểm nghẽn khu Bếp</span>
                                                <span className="text-orange-600 font-extrabold">Cần lưu ý</span>
                                            </div>
                                            <p className="text-[13px] text-orange-700/70 dark:text-orange-400/80 font-medium leading-relaxed">Món "Thịt nướng" đang làm chậm hơn tiêu chuẩn 5 phút. Quán cần bổ sung nhân sự lò nướng.</p>
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

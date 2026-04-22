import { ChefHat, TrendingUp, CheckCircle2, ListFilter, GripVertical, Settings2, Heart, Search, Globe, ChevronDown, Tag, Plus, ShoppingBag, Info, Clock } from 'lucide-react';

export function Features() {
    return (
        <section id="features" className="py-24 md:py-32 bg-slate-50 dark:bg-[#0c0c0e] relative z-10 transition-colors duration-300">
            <div className="container mx-auto px-6">
                
                <div className="max-w-3xl mb-32 text-center mx-auto">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DF1B41] mb-4">
                        Thiết kế dành cho 2 điểm chạm
                    </h2>
                    <h3 className="text-[36px] md:text-[44px] font-medium text-slate-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors">
                        Sự phục vụ im lặng nhưng hoàn hảo
                    </h3>
                    <p className="text-[17px] md:text-[19px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto transition-colors">
                        Ứng dụng triết lý B2B2C: Đủ tinh tế để khách hàng chủ động sử dụng, đủ sâu sắc để ban quản lý đo lường hiệu quả.
                    </p>
                </div>

                <div className="flex flex-col gap-32">
                    
                    {/* KEY 1.1: Trải nghiệm User - Sự Tự chủ */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                <ListFilter size={24} />
                            </div>
                            <h4 className="text-[32px] md:text-[40px] font-medium text-slate-900 dark:text-white tracking-tight leading-tight">
                                Bỏ qua chờ đợi. Trải nghiệm chạm là có.
                            </h4>
                            <p className="text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Thay thế nhân viên tại bàn bằng Quyền tự phục vụ cá nhân. Từ việc nhập mã Voucher, tích điểm Loyalty đến tự điền biểu mẫu xuất hóa đơn điện tử (VAT), mọi thứ diễn ra riêng tư và chính xác tuyệt đối mà không cần trao đổi dư thừa với thu ngân.
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                            
                            <div className="relative z-10 flex gap-6 items-center">
                                {/* Miniature correct Phone scale for features */}
                                <div className="w-[260px] h-[480px] bg-[#F8FAFC] dark:bg-[#0B0B0F] rounded-[40px] shadow-2xl border-[10px] border-slate-900 shrink-0 relative overflow-hidden flex flex-col xl:scale-[1.1]">
                                    <div className="px-4 pt-6 shrink-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <h2 className="font-bold text-[12px] text-slate-900 dark:text-white flex items-center gap-1">
                                                    O2O Demo <Info size={10} className="text-slate-400" />
                                                </h2>
                                                <span className="font-bold text-[#DF1B41] text-[10px]">Bàn A-12</span>
                                            </div>
                                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-end justify-center shadow-sm overflow-hidden border border-amber-50">
                                                <div className="w-4 h-4 bg-[#D4A373] rounded-t-[6px] mb-[-2px]" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-white dark:bg-[#1A1A1F] rounded-[12px] px-3 py-2 shadow-sm border border-slate-100 dark:border-white/5">
                                           <div className="flex items-center gap-2"><Search size={12} className="text-[#DF1B41]"/><span className="text-[10px] text-slate-400">Tôi muốn dùng Voucher</span></div>
                                        </div>
                                    </div>
                                    <div className="px-4 mt-3 font-bold text-[12px] flex items-center gap-1 text-slate-900 dark:text-white mb-2">
                                        <Heart size={12} fill="#DF1B41" className="text-[#DF1B41]"/> Món bạn từng gọi
                                    </div>
                                    <div className="pl-4 flex overflow-hidden gap-3">
                                        <div className="w-[140px] bg-white dark:bg-[#15151A] rounded-[16px] flex flex-col overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-white/10">
                                            <div className="h-[80px] relative">
                                                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80" className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="p-2.5">
                                                <div className="text-[8px] font-bold text-[#DF1B41] flex items-center gap-1 mb-1"><Clock size={8}/> Đã gọi 6 lần</div>
                                                <div className="font-bold text-[10px] text-slate-900 dark:text-white leading-tight mb-2 truncate">Gỏi Xoài Xanh</div>
                                                <div className="font-bold text-[11px] text-[#DF1B41]">125,000đ</div>
                                            </div>
                                        </div>
                                         <div className="w-[140px] bg-white dark:bg-[#15151A] rounded-[16px] flex flex-col overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-white/10 pointer-events-none opacity-50">
                                            <div className="h-[80px] bg-slate-200 dark:bg-white/5" />
                                            <div className="p-2.5"><div className="h-3 w-full bg-slate-800 dark:bg-white/80 rounded mb-2"></div></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#111115]/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 rounded-t-[20px] px-3 py-4 z-20">
                                        <div className="bg-[#DF1B41] text-white rounded-[12px] px-3 py-2 flex justify-between tracking-wide shadow-[0_5px_15px_rgba(223,27,65,0.4)] whitespace-nowrap items-center">
                                            <div className="font-bold text-[10px] flex gap-1 items-center"><ShoppingBag size={12}/> Tự Xuất Hóa Đơn VAT</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Abstract Admin Config Block to signify dynamic linkage */}
                                <div className="absolute right-0 bottom-16 bg-white dark:bg-[#111115] border border-slate-200 dark:border-slate-800 rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[260px] transform md:translate-x-12 z-30">
                                    <h5 className="font-bold text-[14px] text-slate-900 dark:text-white mb-4">Đồng bộ HQ Module</h5>
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-[#1A1A1F] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transform transition-transform hover:scale-[1.02] border-l-4 border-l-emerald-500">
                                            <div className="flex items-center gap-3">
                                                <div className="text-slate-300"><GripVertical size={16} /></div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-[13px] text-slate-900 dark:text-white">Form Thu Thập VAT</h5>
                                                </div>
                                                <div className="w-8 h-8 rounded-[10px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300"><Settings2 size={14} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KEY 1.2: Kitchen Status - Xoá bỏ chờ đợi */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
                                <ChefHat size={24} />
                            </div>
                            <h4 className="text-[32px] md:text-[40px] font-medium text-slate-900 dark:text-white tracking-tight leading-tight">
                                Minh bạch quy trình. Xóa nhòa sốt ruột.
                            </h4>
                            <p className="text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Nổi bật trải nghiệm "Hố đen thời gian" bằng chức năng cập nhật tiến độ Live. Khách hàng nhìn thấy rõ nhịp đập của nhà bếp (Đang nấu - Đã lên đồ) giải tỏa hoàn toàn cảm giác chờ đợi mà không cần vẫy tay "Em ơi!".
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="relative z-10 w-full max-w-[420px]">
                                <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 p-8 rounded-[32px] shadow-2xl space-y-6">
                                    <div className="flex justify-between items-center border-b border-black/[0.04] dark:border-white/5 pb-5">
                                        <div className="font-bold text-slate-900 dark:text-white text-[16px]">Mạch đập Đơn Món</div>
                                        <div className="text-[13px] font-bold px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-slate-800 dark:text-slate-200">Bàn 12</div>
                                    </div>
                                    
                                    <div className="flex gap-4 items-start pb-4 opacity-50 relative pointer-events-none">
                                        <div className="absolute left-[13px] top-8 w-0.5 h-12 bg-emerald-200 dark:bg-emerald-800" />
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mt-1 z-10"><CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" /></div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[15px] text-slate-900 dark:text-white">Cơm Gà Hải Nam</div>
                                            <div className="text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">Đã phục vụ xong • 19:20</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 items-start relative z-10 -mt-2">
                                        <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mt-3 z-10 ring-[8px] ring-white dark:ring-[#111115] shadow-lg shadow-orange-500/20"><ChefHat size={14} className="text-orange-500" /></div>
                                        <div className="bg-white dark:bg-[#1A1A1F] border border-orange-100 dark:border-orange-500/30 p-5 rounded-[20px] w-full shadow-[0_10px_30px_rgba(245,107,15,0.08)] dark:shadow-[0_10px_30px_rgba(245,107,15,0.03)] transform hover:scale-[1.02] transition-transform">
                                            <div className="font-bold text-[16px] text-slate-900 dark:text-white mb-2">Combo Sườn Phô Mai (x2)</div>
                                            <div className="inline-flex bg-orange-50 dark:bg-orange-500/10 pl-3 pr-4 py-2 rounded-xl text-[13px] text-orange-600 dark:text-orange-400 font-bold items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]"/>
                                                Bếp đang chế biến... (~12 phút)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KEY 2: Vận Hành - Vạch Trần Chỉ Số */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <h4 className="text-[32px] md:text-[40px] font-medium text-slate-900 dark:text-white tracking-tight leading-tight">
                                Nhìn thấu điểm mù. Khai phóng biên độ.
                            </h4>
                            <p className="text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Trả lời câu hỏi trọng tâm: "Đầu tư vào hệ thống tạo ra ROI ở đâu?". Làm nổi bật các vấn đề vận hành bằng việc chứng minh sự tương quan trực quan giữa Tỷ lệ O2O (Khách tự phục vụ) với Tốc độ lật bàn, giúp dễ dàng nhận diện mọi điểm nghẽn hệ thống.
                            </p>
                        </div>
                        
                        <div className="flex-1 relative w-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="relative z-10 w-full max-w-[480px]">
                                <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 p-8 rounded-[36px] shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-none">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Chỉ số Hiệu suất</p>
                                            <p className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">Tỉ lệ phủ O2O: <span className="text-[#DF1B41]">68%</span></p>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[12px] font-bold flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shrink-0">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" /> Live
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-5 bg-slate-50 dark:bg-[#1A1A1F] border border-slate-100 dark:border-white/5 rounded-[20px]">
                                            <div className="flex justify-between text-[14px] font-bold mb-3">
                                                <span className="text-slate-600 dark:text-slate-300">Tốc độ xoay vòng bàn (Lật bàn)</span>
                                                <span className="text-emerald-600 font-bold">-14 mins</span>
                                            </div>
                                            <div className="flex gap-1.5 h-2">
                                                {Array.from({length: 12}).map((_, i) => (
                                                    <div key={i} className={`flex-1 rounded-full ${i < 9 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-3 font-medium">Bàn trống mở nhanh hơn 24% so với tuần trước nhờ giảm tải nhân sự ghi order.</p>
                                        </div>

                                        <div className="p-5 bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[20px]">
                                            <div className="flex justify-between text-[14px] font-bold mb-2">
                                                <span className="text-orange-800 dark:text-orange-400 flex items-center gap-2"><ChefHat size={16}/> Nút Thắt Bếp (Bottleneck)</span>
                                                <span className="text-orange-600">Đang nghẽn</span>
                                            </div>
                                            <p className="text-[12px] text-orange-700/70 dark:text-orange-400/70 font-medium">12 Đơn "Burger" bị giữ ở trạng thái nấu trên 15 phút. Cần điều phối thêm nhân sự khu bếp Âu.</p>
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

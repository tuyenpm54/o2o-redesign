"use client";

import { useState } from 'react';
import { Save, Building2, MapPin, Wifi } from 'lucide-react';

export default function RestaurantSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="p-4 sm:p-8 max-w-3xl mx-auto pb-24">
            <header className="mb-10 px-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="w-12 h-12 rounded-[18px] bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <Building2 size={24} className="stroke-[2.5]" />
                    </div>
                    Thông tin Cơ sở
                </h1>
                <p className="text-slate-500 font-medium mt-3 ml-1 text-sm">Quản lý và cập nhật hồ sơ hiển thị công khai của nhà hàng.</p>
            </header>

            <div className="space-y-8 px-2">
                
                {/* SECTION 1: CƠ BẢN */}
                <div>
                    <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-4 mb-3">
                        Cơ bản
                    </h2>
                    <div className="bg-white dark:bg-[#11111a] border border-slate-200/60 dark:border-white/5 rounded-[24px] overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Tên cửa hàng</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="Chi nhánh Quận 1" />
                        </div>
                        <div className="ml-4 border-t border-slate-200/50 dark:border-white/[0.06]"></div>
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Điện thoại</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="0988071291" />
                        </div>
                        <div className="ml-4 border-t border-slate-200/50 dark:border-white/[0.06]"></div>
                        <div className="flex items-start py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 pt-0.5 text-[15px] font-medium text-slate-900 dark:text-slate-100">Mô tả ngắn</label>
                            <textarea className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 h-16 resize-none leading-relaxed" defaultValue="Cửa hàng nhượng quyền chính hãng"></textarea>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: VỊ TRÍ */}
                <div>
                    <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-4 mb-3">
                        Vị trí toạ độ
                    </h2>
                    <div className="bg-white dark:bg-[#11111a] border border-slate-200/60 dark:border-white/5 rounded-[24px] overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Địa chỉ chi tiết</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="123 Nguyễn Thị Minh Khai, Q1, TP.HCM" />
                        </div>
                        <div className="ml-4 border-t border-slate-200/50 dark:border-white/[0.06]"></div>
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Vĩ độ (Lat)</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="10.7769" />
                        </div>
                        <div className="ml-4 border-t border-slate-200/50 dark:border-white/[0.06]"></div>
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Kinh độ (Lng)</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="106.7009" />
                        </div>
                    </div>
                </div>
                
                {/* SECTION 3: WI-FI */}
                <div>
                    <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-4 mb-3">
                        Kết nối
                    </h2>
                    <div className="bg-white dark:bg-[#11111a] border border-slate-200/60 dark:border-white/5 rounded-[24px] overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">SSID Không dây</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="Khach_VIP" />
                        </div>
                        <div className="ml-4 border-t border-slate-200/50 dark:border-white/[0.06]"></div>
                        <div className="flex items-center py-4 px-4 pr-5 bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <label className="w-[140px] shrink-0 text-[15px] font-medium text-slate-900 dark:text-slate-100">Mật khẩu WiFi</label>
                            <input type="text" className="flex-1 min-w-0 bg-transparent text-right text-[15px] text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" defaultValue="12345678" />
                        </div>
                    </div>
                </div>

                {/* ACTION ROW */}
                <div className="flex justify-end pt-8">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-[18px] font-bold text-[15px] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 hover:bg-black dark:hover:bg-slate-100 active:shadow-sm"
                    >
                        {isSaving ? "Đang lưu..." : <><Save size={18} strokeWidth={2.5} /> Lưu thay đổi</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

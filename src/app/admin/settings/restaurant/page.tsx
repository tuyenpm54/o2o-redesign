"use client";

import { useState } from 'react';
import { Save, Building2, MapPin, Wifi, Image as ImageIcon } from 'lucide-react';

export default function RestaurantSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Building2 className="text-blue-500" />
                    Thông tin Cơ sở
                </h1>
                <p className="text-slate-500 mt-2">Cập nhật thông tin chi tiết của nhà hàng để hiển thị cho khách hàng</p>
            </header>

            <div className="space-y-6">
                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Building2 size={20}/> Cơ bản</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tên cửa hàng</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="Chi nhánh Quận 1" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại liên hệ</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="0988071291" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả ngắn</label>
                            <textarea className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 h-24" defaultValue="Cửa hàng nhượng quyền chính hãng"></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin size={20}/> Vị trí</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ chi tiết</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="123 Nguyễn Thị Minh Khai, Q1, TP.HCM" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vĩ độ (Lat)</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="10.7769" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Kinh độ (Lng)</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="106.7009" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Wifi size={20}/> Wi-Fi Cửa hàng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tên Wi-Fi (SSID)</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="Khach_VIP" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" defaultValue="12345678" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        {isSaving ? "Đang lưu..." : <><Save size={20} /> Lưu thông tin</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

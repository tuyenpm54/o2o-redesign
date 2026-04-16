'use client';

import { useState } from 'react';
import { StyleConfigurator, StyleConfig } from '@/modules/admin/components/StyleConfigurator';
import { LivePreview } from '@/modules/admin/components/LivePreview';
import { Save, PaintRoller, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AppearancePage() {
    const { user } = useAuth();
    const isLocked = user?.tier === 'FREE';

    const [config, setConfig] = useState<StyleConfig>({
        primaryColor: '#ef4444', 
        borderRadius: '16px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    });

    const handleSave = () => {
        alert('Cấu hình giao diện đã được thay đổi và lưu thành công!');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10 min-h-full transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/10 backdrop-blur-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <PaintRoller size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Giao Diện Khách</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Cá nhân hóa trải nghiệm web order theo thương hiệu của bạn</p>
                    </div>
                </div>
                <button
                    onClick={isLocked ? undefined : handleSave}
                    disabled={isLocked}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                        isLocked 
                            ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                    }`}
                >
                    <Save size={18} />
                    <span>Lưu Thay Đổi</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-4">
                <div className="w-full lg:w-1/3 flex flex-col relative">
                    <StyleConfigurator config={config} setConfig={setConfig} isLocked={isLocked} />
                    
                    {isLocked && (
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[1.5rem] border border-slate-200/50 dark:border-white/10 shadow-xl overflow-hidden p-6">
                            <div className="bg-white dark:bg-[#1C1F2B] p-6 rounded-2xl border border-slate-200 dark:border-blue-500/30 text-center shadow-2xl max-w-[280px] animate-in zoom-in-95 duration-200">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                                    <Zap size={24} className="fill-blue-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Tính Năng Giới Hạn</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Nâng cấp lên gói <span className="font-bold text-blue-600 dark:text-blue-400 italic">Pro</span> để tự do tùy chỉnh màu sắc và phông chữ theo thương hiệu của bạn.</p>
                                <Link 
                                    href="/admin/settings/billing"
                                    className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-center"
                                >
                                    Nâng Cấp Ngay
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-full lg:w-2/3 flex flex-col">
                    <LivePreview config={config} />
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { StyleConfigurator, StyleConfig } from '@/modules/admin/components/StyleConfigurator';
import { LivePreview } from '@/modules/admin/components/LivePreview';
import { Save, PaintRoller } from 'lucide-react';

export default function AppearancePage() {
    const [config, setConfig] = useState<StyleConfig>({
        primaryColor: '#ef4444', // Default to Red for preview, but we can have some presets
        borderRadius: '16px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    });

    const handleSave = () => {
        // In a real app this would call an API
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
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Save size={18} />
                    <span>Lưu Thay Đổi</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-4">
                <div className="w-full lg:w-1/3 flex flex-col">
                    <StyleConfigurator config={config} setConfig={setConfig} />
                </div>
                <div className="w-full lg:w-2/3 flex flex-col">
                    <LivePreview config={config} />
                </div>
            </div>
        </div>
    );
}

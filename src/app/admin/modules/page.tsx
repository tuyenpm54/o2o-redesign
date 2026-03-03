'use client';

import { useState } from 'react';
import { ModuleToggle } from '@/modules/admin/components/ModuleToggle';
import { ModuleConfigPanel } from '@/modules/admin/components/ModuleConfigPanel';
import { Sparkles, UsersRound, Zap, Flame, Save, Blocks, Tag, LayoutList } from 'lucide-react';

export default function ModulesPage() {
    const [activeConfigModuleId, setActiveConfigModuleId] = useState<string | null>(null);
    const [modules, setModules] = useState([
        {
            id: 'smart-suggestions',
            name: 'Gợi Ý Thông Minh & Bán Chéo',
            description: 'Thiết lập quy tắc gợi ý mua kèm (Cross-sell) dựa trên món khách vừa chọn và giỏ hàng.',
            enabled: true,
            icon: <Sparkles size={24} />
        },
        {
            id: 'guided-discovery',
            name: 'Trợ Lý Ảo Đặt Món (AI)',
            description: 'Hỏi đáp nhu cầu và giới thiệu món ăn theo phong cách hội thoại tự nhiên.',
            enabled: true,
            icon: <Tag size={24} />
        },
        {
            id: 'highlight-categories',
            name: 'Danh Mục Nổi Bật',
            description: 'Cấu hình hiển thị "Món mới phải thử" và "Top Bán Chạy" trên App.',
            enabled: true,
            icon: <LayoutList size={24} />
        },
        {
            id: 'group-ordering',
            name: 'Gọi Món Đa Thiết Bị',
            description: 'Chức năng quét mã QR nhóm, cho phép nhiều khách trong bàn cùng xem và thêm món vào chung một hóa đơn theo thời gian thực.',
            enabled: true,
            icon: <UsersRound size={24} />
        },
        {
            id: 'flash-sales',
            name: 'Flash Sale (Giờ Vàng)',
            description: 'Tạo các chiến dịch giảm giá chớp nhoáng với đồng hồ đếm ngược sinh động để kích thích ra quyết định nhanh.',
            enabled: false,
            icon: <Zap size={24} />
        },
        {
            id: 'value-combos',
            name: 'Combo "Deal Hời"',
            description: 'Gợi ý các set ăn nhóm, mix các món ít bán với món best-seller để tối ưu giá trị trung bình mỗi đơn (AOV).',
            enabled: true,
            icon: <Flame size={24} />
        }
    ]);

    const handleToggle = (id: string, enabled: boolean) => {
        setModules(modules.map(m => m.id === id ? { ...m, enabled } : m));
    };

    const handleSave = () => {
        alert('Cấu hình module đã được cập nhật thành công!');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 relative z-10 transition-colors duration-300 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/10 backdrop-blur-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <Blocks size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Quản Lý Modules</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Bật/tắt các tính năng kinh doanh trên Web-App của khách hàng</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Save size={18} />
                    <span>Lưu Trạng Thái</span>
                </button>
            </div>

            <div className="space-y-5 pt-6">
                {modules.map(module => (
                    <ModuleToggle
                        key={module.id}
                        {...module}
                        onToggle={handleToggle}
                        onConfigure={setActiveConfigModuleId}
                    />
                ))}
            </div>

            <ModuleConfigPanel
                moduleId={activeConfigModuleId}
                onClose={() => setActiveConfigModuleId(null)}
            />

            <div className="mt-12 p-6 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl backdrop-blur-md">
                <h4 className="font-bold text-slate-800 dark:text-blue-100 flex items-center gap-2 mb-2"><Sparkles size={18} className="text-blue-500" /> Modules Pro sắp ra mắt</h4>
                <p className="text-slate-600 dark:text-blue-200/70 text-sm font-medium">Chúng tôi đang phát triển các Module: Khách hàng thân thiết (Tích điểm), Mini Game vòng quay may mắn...</p>
            </div>
        </div>
    );
}

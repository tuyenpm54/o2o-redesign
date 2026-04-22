'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutTemplate, Plus, Save, ChevronUp, ChevronDown, Trash2, Settings2, Eye, X, ExternalLink, CheckCircle2, AlertTriangle, Lock, Zap, Palette, GripVertical, MonitorSmartphone, RefreshCcw, ArrowLeft, Utensils, QrCode, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { SurveyEditorInline, DEFAULT_SURVEY_CONFIG } from './SurveyEditorModal';
import { IconDictionary } from '@/lib/icons';

type ModuleType = 'menu-grid' | 'for-you' | 'best-sale' | 'combo' | 'onboarding-wizard' | 'support-options' | 'checkout-auth' | 'custom';

interface StorefrontBlock {
    id: string;
    type: ModuleType;
    title: string;
    config: any;
}

interface StorefrontTemplate {
    id: string;
    name: string;
    isSystem?: boolean;
    blocks: StorefrontBlock[];
}

const MODULE_DEFINITIONS: Record<ModuleType, { name: string; description: string; category: 'layout' | 'action'; minTier?: 'FREE' | 'PRO' | 'PREMIUM' }> = {
    'for-you': { name: 'Món Bạn Từng Gọi', description: 'Hiển thị tối đa 5 món khách đã từng gọi nhiều nhất (Chỉ On/Off)', category: 'layout', minTier: 'FREE' },
    'combo': { name: 'Combo Tiết Kiệm', description: 'Hiển thị các gói combo giá tốt', category: 'layout', minTier: 'PRO' },
    'best-sale': { name: 'Siêu Phẩm Bán Chạy', description: 'Danh sách món bán chạy nhất', category: 'layout', minTier: 'PRO' },
    'custom': { name: 'Danh Mục Tuỳ Chỉnh', description: 'Tự cấu hình danh mục riêng', category: 'layout', minTier: 'PRO' },
    'menu-grid': { name: 'Thực Đơn Của Quán', description: 'Hiển thị mục thực đơn cốt lõi (Ghim dưới đáy menu)', category: 'layout', minTier: 'FREE' },
    'onboarding-wizard': { name: 'Khám Phá Menu (Giới thiệu)', description: 'Bật/Tắt và thiết lập Khảo sát đầu vào (V2)', category: 'action', minTier: 'PREMIUM' },
    'support-options': { name: 'Tùy Chỉnh Yêu Cầu Hỗ Trợ', description: 'Cấu hình các nút chức năng trong modal Yêu Cầu Hỗ Trợ', category: 'action', minTier: 'PRO' },
    'checkout-auth': { name: 'Đăng Nhập Khi Trả Trước', description: 'Bật/Tắt nút Bỏ qua đăng nhập ở màn thanh toán trả trước', category: 'action', minTier: 'FREE' },
};

const SYSTEM_TEMPLATES: StorefrontTemplate[] = [
    {
        id: 'sys-dining',
        name: 'Mẫu Ăn Tại Bàn (Dining)',
        isSystem: true,
        blocks: [
            { id: 'b1', type: 'for-you', title: 'Món Bạn Từng Gọi', config: { isEnabled: true } },
            { id: 'b2', type: 'combo', title: 'Combo Tiết Kiệm', config: { isEnabled: true, limit: 10, itemIds: [701, 702, 703, 704, 705, 706] } },
            { id: 'b3', type: 'best-sale', title: 'Siêu Phẩm Bán Chạy', config: { isEnabled: true } },
            { id: 'b4', type: 'custom', title: 'Danh Mục Tuỳ Chỉnh', config: { isEnabled: true, groupName: '' } },
            { id: 'b5', type: 'menu-grid', title: 'Thực Đơn Mặc Định', config: {} }
        ]
    }
];

const isBlockValid = (block: StorefrontBlock): boolean => {
    const { type, config } = block;
    if (type === 'custom') {
        return !!config.groupName && config.groupName.trim() !== '';
    }
    return true;
};

function ModuleConfigForm({ block, onChange, allMenuItems = [] }: { block: StorefrontBlock, onChange: (newConfig: any) => void, allMenuItems?: any[] }) {
    const { type, config } = block;
    const [previewStyle, setPreviewStyle] = useState<'v1' | 'v2' | null>(null);
    const [iconPickerOpenForId, setIconPickerOpenForId] = useState<string | null>(null);

    if (type === 'for-you') {
        return (
            <div className="space-y-4">
                <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><Settings2 size={16} /></div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Module Tự Động (Lịch Sử Gọi Món)</p>
                        Khối nội dung này được hệ thống tự động lọc các món khách đã từng gọi trong quá khứ, sắp xếp theo số lượng gọi nhiều nhất. Khối sẽ tự ẩn nếu khách chưa có lịch sử.
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'best-sale' || type === 'combo') {
        const itemIds = config.itemIds || [];
        const limit = config.limit || 10;
        const selectedItems = allMenuItems.filter(item => itemIds.includes(item.id));
        const colorClass = type === 'best-sale' ? 'amber' : 'blue';

        return (
            <div className="space-y-6">
                <div className={`text-sm text-slate-500 p-4 bg-${colorClass}-50/50 dark:bg-${colorClass}-500/5 rounded-xl border border-${colorClass}-100 dark:border-${colorClass}-500/20 flex items-start gap-3`}>
                    <div className={`mt-0.5 text-${colorClass}-500`}><Settings2 size={16} /></div>
                    <div>
                        <p className={`font-semibold text-${colorClass}-900 dark:text-${colorClass}-300 mb-1`}>Thiết lập {type === 'best-sale' ? 'Món Bán Chạy' : 'Combo'} thủ công</p>
                        Chọn tối đa {limit} món từ thực đơn để hiển thị nổi bật.
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số lượng tối đa ({limit})</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold opacity-50"
                            value={limit}
                            disabled
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chọn món ({itemIds.length}/{limit})</label>
                    <div className="flex gap-2 mb-4">
                        <select 
                            className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                            onChange={(e) => {
                                const id = parseInt(e.target.value);
                                if (id && !itemIds.includes(id) && itemIds.length < limit) {
                                    onChange({ ...config, itemIds: [...itemIds, id] });
                                }
                                e.target.value = "";
                            }}
                            disabled={itemIds.length >= limit}
                        >
                            <option value="">{itemIds.length >= limit ? "-- Đã đạt giới hạn --" : "-- Tìm món trong thực đơn --"}</option>
                            {allMenuItems
                                .filter(item => !itemIds.includes(item.id))
                                .map(item => (
                                    <option key={item.id} value={item.id}>{item.name} - {item.price.toLocaleString()}đ</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-black/20">
                        {selectedItems.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {selectedItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0 border border-slate-200 dark:border-white/5">
                                                <img src={item.img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                                                <div className={`text-xs text-${colorClass}-600 dark:text-${colorClass}-400 font-bold`}>{item.price.toLocaleString()}đ</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onChange({ ...config, itemIds: itemIds.filter((id: number) => id !== item.id) })}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 italic text-sm">Chưa có món nào được chọn.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'custom') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên Danh Mục Tuỳ Chỉnh</label>
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" 
                        placeholder="VD: Món Tráng Miệng Mới" 
                        value={config.groupName || ''} 
                        onChange={(e) => onChange({ groupName: e.target.value })} 
                    />
                    <p className="text-xs text-slate-500 mt-2">Hệ thống sẽ lấy danh sách các món ăn thuộc danh mục này từ Menu Gốc để ghim lên đầu trang.</p>
                </div>
            </div>
        );
    }

    if (type === 'onboarding-wizard') {
        const wizardStyle = config.wizardStyle || 'v2';
        return (
            <div className="space-y-4">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Giao diện Hiển thị Khảo sát</h5>
                <div className="grid grid-cols-2 gap-4">
                    <div 
                        onClick={() => onChange({ ...config, wizardStyle: 'v1' })}
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-3 transition-all ${wizardStyle === 'v1' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-white/10 opacity-70'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-lg">📋</div>
                            <div className="font-bold text-sm">Dạng Danh Sách (V1)</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setPreviewStyle('v1'); }} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider"><Eye size={12} /> Xem thử</button>
                    </div>
                    <div 
                        onClick={() => onChange({ ...config, wizardStyle: 'v2' })}
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-3 transition-all ${wizardStyle === 'v2' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-white/10 opacity-70'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-lg">✨</div>
                            <div className="font-bold text-sm">Dạng Lookbook (V2)</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setPreviewStyle('v2'); }} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider"><Eye size={12} /> Xem thử</button>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 mt-4">
                    <p className="text-sm font-medium mb-1">Dữ liệu Khảo sát</p>
                    <p className="text-xs text-slate-500 mb-2">Chỉnh sửa trực tiếp bộ câu hỏi để AI phân tích và gợi ý món.</p>
                    <SurveyEditorInline 
                        data={config.survey || DEFAULT_SURVEY_CONFIG} 
                        onChange={(surveyData) => onChange({ ...config, survey: surveyData })}
                    />
                </div>

                {previewStyle && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewStyle(null)}>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-[0_0_80px_rgba(0,0,0,0.3)] p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold">Bản xem trước {previewStyle.toUpperCase()}</h3>
                                <button onClick={() => setPreviewStyle(null)}><X size={20}/></button>
                            </div>
                            <div className="aspect-[9/16] bg-slate-100 rounded-3xl border-8 border-slate-800 relative overflow-hidden shadow-inner">
                                {previewStyle === 'v1' ? (
                                    <div className="p-4 space-y-4">
                                        <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-lg border"></div>)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full bg-black flex flex-col justify-end p-6">
                                        <div className="h-10 w-full bg-white/20 rounded-xl"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    if (type === 'support-options') {
        const options = config.options || [
            { id: 'cutlery', label: 'Thêm bát đũa', icon: 'Utensils', isOther: false },
            { id: 'napkin', label: 'Khăn giấy', icon: 'Sparkles', isOther: false },
            { id: 'clean', label: 'Dọn bàn', icon: 'CheckCircle2', isOther: false },
            { id: 'bill', label: 'Thanh toán', icon: 'Wallet', isOther: false },
            { id: 'other', label: 'Yêu cầu khác', icon: 'MoreHorizontal', isOther: true },
        ];

        const handleOptionChange = (id: string, field: string, value: any) => {
            const newOptions = options.map((opt: any) => opt.id === id ? { ...opt, [field]: value } : opt);
            onChange({ ...config, options: newOptions });
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm">Cấu hình các yêu cầu hỗ trợ</h5>
                    <button 
                        onClick={() => onChange({ ...config, options: [...options, { id: 'opt_' + Date.now(), label: 'Tùy chọn mới', icon: 'Star', isOther: false }] })}
                        disabled={options.length >= 6}
                        className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg disabled:opacity-50"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2">
                    {options.map((opt: any) => {
                        const IconComp = IconDictionary[opt.icon] || IconDictionary['HelpCircle'];
                        return (
                            <div key={opt.id} className="flex items-center gap-3 p-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl relative">
                                <button onClick={() => setIconPickerOpenForId(iconPickerOpenForId === opt.id ? null : opt.id)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <IconComp size={16} />
                                </button>
                                {iconPickerOpenForId === opt.id && (
                                    <div className="absolute top-10 left-0 w-64 p-3 bg-white dark:bg-zinc-800 border rounded-xl shadow-xl z-50 grid grid-cols-6 gap-1">
                                        {Object.keys(IconDictionary).slice(0, 30).map(k => (
                                            <button key={k} onClick={() => { handleOptionChange(opt.id, 'icon', k); setIconPickerOpenForId(null); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded">
                                                {React.createElement(IconDictionary[k], { size: 14 })}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <input 
                                    type="text" 
                                    value={opt.label} 
                                    onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)} 
                                    className="flex-1 bg-transparent text-sm font-medium outline-none" 
                                />
                                <button onClick={() => onChange({ ...config, options: options.filter((o: any) => o.id !== opt.id) })} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (type === 'checkout-auth') {
        const allowSkip = config.allowSkip !== false; // defaults to true
        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 gap-4">
                    <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Cho phép bỏ qua đăng nhập</h5>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Bật tùy chọn này để hiển thị nút "Bỏ qua" ở form nhập OTP lúc khách hàng checkout. <br/>
                            Nếu tắt, khách hàng bắt buộc phải xác thực SĐT trước khi thanh toán.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" checked={allowSkip} onChange={(e) => onChange({ ...config, allowSkip: e.target.checked })} className="sr-only peer" />
                        <div className="w-10 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner"></div>
                    </label>
                </div>
            </div>
        );
    }

    if (type === 'menu-grid') {
        return (
            <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border flex items-start gap-3">
                <div className="mt-0.5 text-blue-500"><AlertTriangle size={16} /></div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Danh Mục Cố Định</p>
                    Luôn được ghim cố định ở đáy trang. Bạn không thể tắt block này.
                </div>
            </div>
        );
    }

    return null;
}

export default function DisplayConfigPage() {
    const { user } = useAuth();
    const currentTier = user?.tier || 'FREE';

    const getTierRank = (tier: string) => {
        if (!tier) return 1;
        const up = tier.toUpperCase();
        if (up.includes('ENTERPRISE') || up.includes('MAX') || up.includes('PREMIUM') || up.includes('VIP')) return 3;
        if (up.includes('PRO') || up.includes('CHUẨN')) return 2;
        return 1;
    };

    const isModuleLocked = (type: ModuleType) => {
        return false; // Removed lock logic
    };

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [savedTemplates, setSavedTemplates] = useState<StorefrontTemplate[]>(SYSTEM_TEMPLATES);
    const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [showSimulator, setShowSimulator] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<{id: string, name: string, icon: any, desc: string} | null>(null);

    const OPERATING_MODELS = [
        { id: 'post-pay', name: 'Mô hình Trả sau', icon: Utensils, desc: 'Khách hàng gọi món tại bàn, nhân viên phục vụ, dùng bữa xong mới thanh toán (Dine-in truyền thống).' },
        { id: 'pre-pay-table', name: 'Trả trước tại bàn', icon: QrCode, desc: 'Khách hàng quét QR tại bàn, lên order và thanh toán trực tiếp qua điện thoại. Nhân viên mang đồ ra.' },
        { id: 'pre-pay-counter', name: 'Trả trước tại quầy', icon: Store, desc: 'Khách hàng order trên điện thoại, sau đó ra quầy thu ngân để thanh toán rồi lấy đồ (Foodcourt/Takeaway).' }
    ];
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'action'>('layout');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishScope, setPublishScope] = useState<'brand' | 'specific'>('brand');
    const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
    const [allMenuItems, setAllMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchDisplay = async () => {
            try {
                const res = await fetch('/api/admin/display?resid=100');
                const data = await res.json();
                if (data.success && data.data.draft && data.data.draft.length > 0) {
                    setBlocks(data.data.draft);
                    setActiveTemplateId('custom-db');
                } else {
                    setBlocks(SYSTEM_TEMPLATES[0].blocks);
                    setActiveTemplateId(SYSTEM_TEMPLATES[0].id);
                }
                const resMenu = await fetch('/api/restaurants/100');
                const menuData = await resMenu.json();
                if (menuData?.menu?.items) setAllMenuItems(menuData.menu.items);
                const resRest = await fetch('/api/restaurants');
                const restData = await resRest.json();
                if (Array.isArray(restData)) setAvailableRestaurants(restData);
            } catch (error) { console.error(error); }
        };
        fetchDisplay();
    }, []);

    const executePublish = async () => {
        setIsSaving(true);
        try {
            const targetIds = publishScope === 'brand' ? availableRestaurants.map(r => r.id) : selectedRestaurants;
            await fetch('/api/admin/display', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds, blocks })
            });
            const res = await fetch('/api/admin/display', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds })
            });
            if (res.ok) { alert('Thành công!'); setIsPublishModalOpen(false); }
        } catch (e) { alert('Thất bại'); }
        finally { setIsSaving(false); }
    };

    const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        if (newBlocks[targetIndex].type === 'menu-grid') return;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleAddBlock = (type: ModuleType) => {
        const newBlock = { id: 'block-' + Date.now(), type, title: MODULE_DEFINITIONS[type].name, config: {} };
        const menuIdx = blocks.findIndex(b => b.type === 'menu-grid');
        const newBlocks = [...blocks];
        if (menuIdx !== -1) newBlocks.splice(menuIdx, 0, newBlock); else newBlocks.push(newBlock);
        setBlocks(newBlocks);
        setIsAddBlockModalOpen(false);
        setEditingBlockId(newBlock.id);
    };

    if (!selectedModel) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#050510] justify-center items-center p-4 sm:p-8 text-slate-800 dark:text-slate-200" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                <div className="w-full max-w-5xl">
                    <div className="text-center mb-12 animation-slide-up" style={{ animationDuration: '0.4s' }}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-6 shadow-inner ring-1 ring-indigo-100 dark:ring-indigo-500/20">
                            <LayoutTemplate size={32} className="stroke-[2.5]" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Cấu hình hiển thị</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto border-b border-transparent">Chọn mô hình vận hành bạn muốn thiết lập. Mỗi thiết lập được lưu trữ và tối ưu riêng biệt cho kịch bản phục vụ tương ứng.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {OPERATING_MODELS.map((model, idx) => {
                            const IconCmp = model.icon;
                            return (
                                <button 
                                    key={model.id}
                                    onClick={() => setSelectedModel(model)}
                                    className="bg-white dark:bg-[#13141A] p-8 text-left rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 dark:hover:border-indigo-500 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full animation-slide-up"
                                    style={{ animationDuration: `${0.4 + idx * 0.1}s` }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 dark:bg-indigo-500/10 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-[1.5]"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 ring-1 ring-indigo-100 dark:ring-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <IconCmp size={28} className="stroke-[2]" />
                                    </div>
                                    <h3 className="text-xl font-black mb-3 text-slate-800 dark:text-slate-100">{model.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium flex-1">{model.desc}</p>
                                    
                                    <div className="mt-8 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                                        Cấu hình ngay <ArrowLeft className="ml-2 rotate-180" size={16} strokeWidth={3} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#050510] relative text-slate-800 dark:text-slate-200 justify-center p-2 sm:p-4">
            
            {/* MAIN PANE: BUILDER PANEL */}
            <div className="w-full max-w-[75rem] flex-1 flex bg-white dark:bg-[#13141A] shadow-2xl rounded-[32px] overflow-hidden border border-slate-200/60 dark:border-white/5 relative z-20 animation-slide-up transition-all duration-500">
                
                {/* LEFT COLUMN: List & Global Actions */}
                <div className="flex flex-col h-full shrink-0 w-[360px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-black/10 relative z-20">
                    
                    {/* Header */}
                <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/90 dark:bg-[#13141A]/90 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSelectedModel(null)} 
                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
                            title="Quay lại"
                        >
                            <ArrowLeft size={16} className="stroke-[2.5]" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                            {React.createElement(selectedModel.icon, { size: 14, className: "stroke-[2.5]" })}
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{selectedModel.name}</h1>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{savedTemplates.find(t => t.id === activeTemplateId)?.name || 'Cấu hình tùy chỉnh'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setShowSimulator(true)} className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center" title="Xem trước">
                            <Eye size={16} className="stroke-[2]" />
                        </button>
                        <button onClick={() => setIsTemplateModalOpen(true)} className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center" title="Chọn mẫu">
                            <Palette size={16} className="stroke-[2]" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto hidden-scroll flex flex-col bg-slate-50/50 dark:bg-transparent">
                    {/* Segmented Control Tabs */}
                    <div className="flex justify-center p-4 bg-slate-50/90 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 dark:border-white/5">
                        <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-[14px] w-full max-w-sm shrink-0">
                            <button onClick={() => setActiveTab('layout')} className={`flex-1 py-2 rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'layout' ? 'bg-white dark:bg-[#2A2E3D] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <LayoutTemplate size={14} className={activeTab === 'layout' ? 'stroke-[2.5] text-indigo-600 dark:text-indigo-400' : ''} /> Bố cục hiển thị
                            </button>
                            <button onClick={() => setActiveTab('action')} className={`flex-1 py-2 rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'action' ? 'bg-white dark:bg-[#2A2E3D] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <Settings2 size={14} className={activeTab === 'action' ? 'stroke-[2.5] text-indigo-600 dark:text-indigo-400' : ''} /> Tính năng phụ
                            </button>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 mx-auto w-full">
                        {/* LAYOUT TAB */}
                        {activeTab === 'layout' && (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    {blocks.filter(b => MODULE_DEFINITIONS[b.type]?.category === 'layout').map((block, idx) => {
                                        const def = MODULE_DEFINITIONS[block.type];
                                        const isLocked = isModuleLocked(block.type);
                                        const isSystem = block.type !== 'custom';
                                        const isCore = block.type === 'menu-grid';
                                        const isEnabled = block.config?.isEnabled !== false; // default true
                                        
                                        return (
                                            <div key={block.id} className={`group relative transition-all rounded-xl ${isLocked ? 'opacity-80' : ''} ${!isEnabled && !isCore ? 'opacity-50 grayscale-[30%]' : ''} ${isSystem ? 'bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10' : 'bg-slate-50/50 dark:bg-black/20 border border-dashed border-slate-300 dark:border-white/20'} ${editingBlockId === block.id ? 'ring-1 ring-slate-300 dark:ring-white/20 shadow-md' : 'hover:shadow-sm'}`}>
                                                <div className="relative z-10 flex items-center p-3 gap-3 cursor-pointer" onClick={() => !isLocked && setEditingBlockId(editingBlockId === block.id ? null : block.id)}>
                                                    
                                                    {/* Reorder Grip Custom iOS */}
                                                    <div className="flex flex-col items-center justify-center w-6 shrink-0 text-slate-300 dark:text-slate-600 transition-all">
                                                        <div className={`w-5 h-5 rounded-md ${isSystem ? 'bg-slate-100' : 'bg-white'} dark:bg-black/20 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-white/5`}>{idx + 1}</div>
                                                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={(e) => { e.stopPropagation(); !isLocked && handleMoveBlock(block.id, 'up') }} disabled={idx === 0 || isLocked} className="hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-0"><ChevronUp size={12} strokeWidth={3} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); !isLocked && handleMoveBlock(block.id, 'down') }} disabled={isCore || isLocked} className="hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-0"><ChevronDown size={12} strokeWidth={3} /></button>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center flex-wrap gap-1.5 mb-0.5">
                                                            {def.name} 
                                                            {isLocked && <Lock size={10} className="text-amber-500" />}
                                                            {!isSystem && <span className="lowercase bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-slate-200 dark:border-white/10 tracking-normal">Tuỳ chỉnh</span>}
                                                            {isSystem && !isCore && <span className="lowercase bg-transparent text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-slate-200 dark:border-white/10 tracking-normal">Có sẵn</span>}
                                                        </div>
                                                        <div className={`font-semibold text-sm break-words leading-tight ${editingBlockId === block.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{block.title || def.name}</div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0 pr-2">
                                                        {isLocked ? (
                                                            <Link href="/admin/settings/billing" className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-200/50" onClick={e => e.stopPropagation()}>Mở Khóa</Link>
                                                        ) : (
                                                            <>
                                                                {isCore ? (
                                                                    <div className="w-8 h-8 flex items-center justify-center text-slate-300" title="Ghim cố định"><AlertTriangle size={14} /></div>
                                                                ) : isSystem ? (
                                                                    <label className="relative inline-flex items-center cursor-pointer scale-[0.8] origin-right" onClick={(e) => e.stopPropagation()}>
                                                                        <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={(e) => {
                                                                            setBlocks(blocks.map(b => b.id === block.id ? { ...b, config: { ...b.config, isEnabled: e.target.checked } } : b));
                                                                        }} />
                                                                        <div className="w-11 h-6 bg-slate-200 dark:bg-white/20 rounded-full peer peer-checked:bg-slate-900 dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-300 dark:after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full"></div>
                                                                    </label>
                                                                ) : (
                                                                    <button onClick={(e) => { e.stopPropagation(); setBlocks(blocks.filter(b => b.id !== block.id)) }} className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-500 transition-all duration-200 flex items-center justify-center bg-slate-100 dark:bg-white/5 opacity-0 group-hover:opacity-100" title="Xóa danh mục tùy chỉnh">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={() => setIsAddBlockModalOpen(true)} className="mt-4 w-full py-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 hover:shadow-sm transition-all group font-semibold text-sm">
                                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                    Thêm hiển thị
                                </button>
                            </div>
                        )}

                        {/* ACTION TAB */}
                        {activeTab === 'action' && (
                            <div className="space-y-1">
                                {(Object.keys(MODULE_DEFINITIONS) as ModuleType[]).filter(k => MODULE_DEFINITIONS[k].category === 'action').map((type, idx) => {
                                    const def = MODULE_DEFINITIONS[type];
                                    const activeBlock = blocks.find(b => b.type === type);
                                    const isLocked = isModuleLocked(type);
                                    const isEnabled = activeBlock?.config?.isEnabled || false;
                                    
                                    return (
                                        <div key={type} className={`transition-colors flex flex-col relative group rounded-xl ${isLocked ? 'opacity-80' : 'hover:bg-slate-100 dark:hover:bg-white/5'} ${editingBlockId === type ? 'bg-slate-100 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/10' : ''}`}>
                                            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => !isLocked && setEditingBlockId(editingBlockId === type ? null : type)}>
                                                <div className="flex-1 pr-4 relative z-10 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 ${editingBlockId === type ? 'text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 group-hover:text-slate-800 group-hover:shadow-sm'}`}><Settings2 size={16} /></div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className={`font-semibold text-sm break-words leading-tight flex items-center flex-wrap gap-2 ${editingBlockId === type ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                                                {def.name}
                                                                {isLocked && <div className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full"><Lock size={10} /> {def.minTier}</div>}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed pr-1">{def.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="shrink-0 flex items-center pl-2">
                                                    {isLocked ? (
                                                        <Link href="/admin/settings/billing" className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-200/50" onClick={e => e.stopPropagation()}>Mở Khóa</Link>
                                                    ) : (
                                                        <label className="relative inline-flex items-center cursor-pointer scale-[0.8] origin-right ml-1">
                                                            <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={(e) => {
                                                                e.stopPropagation();
                                                                const newConf = { ...(activeBlock?.config || {}), isEnabled: e.target.checked };
                                                                if (!activeBlock) setBlocks([...blocks, { id: 'act-' + type, type, title: def.name, config: newConf }]);
                                                                else setBlocks(blocks.map(b => b.type === type ? { ...b, config: newConf } : b));
                                                            }} />
                                                            <div className="w-11 h-6 bg-slate-200 dark:bg-white/20 rounded-full peer peer-checked:bg-slate-900 dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-300 dark:after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full"></div>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Save Area */}
                <div className="p-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-3 bg-white/90 dark:bg-[#13141A]/90 backdrop-blur-xl shrink-0 sticky bottom-0 z-20 px-6">
                    <span className="text-xs text-slate-500">Cho: <strong className="text-slate-800 dark:text-slate-200">{selectedModel.name}</strong></span>
                    <div className="flex gap-2 w-full">
                        <button onClick={() => alert('Đã lưu nháp')} className="flex-1 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent shadow-sm">Lưu Nháp</button>
                        <button onClick={() => setIsPublishModalOpen(true)} className="flex-[2] py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-200 transition-all shadow-md"><CheckCircle2 size={16} /> Phát Hành</button>
                    </div>
                </div>
                </div> {/* End Left Column */}

                {/* RIGHT COLUMN: Config Editor Pane */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#13141A] min-w-0 h-full relative z-10">
                    {editingBlockId ? (
                        (() => {
                           let activeEditorBlock = blocks.find(b => b.id === editingBlockId);
                           if (!activeEditorBlock) {
                               const type = editingBlockId as ModuleType;
                               activeEditorBlock = blocks.find(b => b.type === type) || { id: 'act-' + type, type, title: MODULE_DEFINITIONS[type]?.name, config: {} } as StorefrontBlock;
                           }
                           const def = MODULE_DEFINITIONS[activeEditorBlock.type];
                           
                           return (
                               <div className="flex flex-col h-full animation-slide-left">
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/90 dark:bg-[#13141A]/90 backdrop-blur-xl sticky top-0 z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10"><Settings2 size={20} /></div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{def?.name || activeEditorBlock.title}</h2>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Cấu hình chi tiết thông số hiển thị</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setEditingBlockId(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 hidden-scroll">
                                    <div className="max-w-2xl mx-auto pb-24">
                                        <ModuleConfigForm block={activeEditorBlock} allMenuItems={allMenuItems} onChange={(conf) => setBlocks(blocks.map(b => b.id === activeEditorBlock!.id || b.type === activeEditorBlock!.type ? { ...b, config: { ...b.config, ...conf } } : b))} />
                                    </div>
                                </div>
                               </div>
                           );
                        })()
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                            <div className="w-16 h-16 mb-4 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center">
                                <Settings2 size={24} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">Chưa chọn tính năng</h3>
                            <p className="text-sm font-medium text-slate-500 text-center max-w-sm">Chọn một module bên trái để cấu hình.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isAddBlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddBlockModalOpen(false)}>
                    <div className="bg-white dark:bg-[#13141A] rounded-3xl w-full max-w-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">Thêm Khối Hiển Thị Mới</h3>
                            <button onClick={() => setIsAddBlockModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(MODULE_DEFINITIONS) as ModuleType[]).filter(k => MODULE_DEFINITIONS[k].category === 'layout' && k !== 'menu-grid').filter(k => k === 'custom' || !blocks.some(b => b.type === k)).map(type => {
                                const def = MODULE_DEFINITIONS[type];
                                const isLocked = isModuleLocked(type);
                                return (
                                    <div key={type} onClick={() => isLocked ? window.location.href='/admin/settings/billing' : handleAddBlock(type)} className={`p-5 rounded-2xl cursor-pointer transition-all border ${isLocked ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-70' : 'bg-white dark:bg-[#1A1D27] border-slate-200 dark:border-white/10 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/10'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center"><LayoutTemplate size={14} /></div>
                                            {isLocked ? <Lock size={14} className="text-amber-500" /> : <Plus size={16} className="text-rose-500 stroke-[2.5]" />}
                                        </div>
                                        <div className="font-bold text-sm mb-1">{def.name}</div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">{def.description}</p>
                                        {isLocked && <div className="mt-3 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 inline-block px-2 py-1 rounded-md">{def.minTier} Only</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)}>
                    <div className="bg-white dark:bg-[#13141A] rounded-3xl w-full max-w-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg">Thư viện giao diện</h3>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {SYSTEM_TEMPLATES.map(tpl => (
                                <div key={tpl.id} onClick={() => { setBlocks(tpl.blocks); setActiveTemplateId(tpl.id); setIsTemplateModalOpen(false); }} className="p-5 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/10 transition-all bg-white dark:bg-[#1A1D27] group">
                                    <div className="font-bold mb-3 group-hover:text-rose-500 transition-colors">{tpl.name}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tpl.blocks.map(b => <span key={b.type} className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-md uppercase font-black tracking-widest">{MODULE_DEFINITIONS[b.type]?.name || b.type}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isPublishModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPublishModalOpen(false)}>
                    <div className="bg-white dark:bg-[#13141A] rounded-3xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-xl mb-6">Xác nhận Phát Hành</h3>
                        <div className="space-y-4 mb-8">
                            <label className={`flex p-4 border rounded-2xl cursor-pointer transition-colors ${publishScope === 'brand' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/5' : 'border-slate-200 dark:border-white/10'}`}>
                                <input type="radio" checked={publishScope === 'brand'} onChange={() => setPublishScope('brand')} className="mr-4 mt-1 accent-rose-500" />
                                <div><div className="font-bold text-sm">Hệ Thống Tiêu Chuẩn</div><div className="text-xs text-slate-500 mt-1">Áp dụng đồng loạt cho mọi cửa hàng trong chuỗi</div></div>
                            </label>
                            <label className={`flex p-4 border rounded-2xl cursor-pointer transition-colors ${publishScope === 'specific' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/5' : 'border-slate-200 dark:border-white/10'}`}>
                                <input type="radio" checked={publishScope === 'specific'} onChange={() => setPublishScope('specific')} className="mr-4 mt-1 accent-rose-500" />
                                <div><div className="font-bold text-sm">Tùy Chấm Cơ Sở</div><div className="text-xs text-slate-500 mt-1">Chỉ áp dụng cho các nhà hàng được chọn</div></div>
                            </label>
                            {publishScope === 'specific' && (
                                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl p-2 space-y-1 bg-slate-50/50 dark:bg-black/20">
                                    {availableRestaurants.map(r => (
                                        <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                            <input type="checkbox" className="accent-rose-500" checked={selectedRestaurants.includes(r.id)} onChange={e => e.target.checked ? setSelectedRestaurants([...selectedRestaurants, r.id]) : setSelectedRestaurants(selectedRestaurants.filter(id => id !== r.id))} />
                                            <span className="text-xs font-bold">{r.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsPublishModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 rounded-xl font-bold text-sm">Hủy</button>
                            <button onClick={executePublish} disabled={isSaving || (publishScope === 'specific' && selectedRestaurants.length === 0)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-sm shadow-lg shadow-rose-500/20 disabled:opacity-50">{isSaving ? 'Đang xử lý...' : 'Đồng ý'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIVE PREVIEW MODAL */}
            {showSimulator && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowSimulator(false)}>
                    <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center w-full max-w-[375px] mb-4">
                            <h3 className="text-white font-black text-lg">Bản xem trước</h3>
                            <button onClick={() => setShowSimulator(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
                        </div>
                        <div className="relative w-[375px] h-[750px] bg-black rounded-[45px] border-[12px] border-black shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 ring-1 ring-white/10">
                            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-[100] pointer-events-none">
                                <div className="w-32 h-5 bg-black rounded-b-2xl"></div>
                            </div>
                            <iframe 
                                ref={iframeRef} 
                                src="/menu?preview=1" 
                                className="w-full h-full border-none bg-white relative z-0" 
                                onLoad={() => iframeRef.current?.contentWindow?.postMessage({ type: 'STOREFRONT_CONFIG_UPDATE', config: blocks }, '*')} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}


'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Save, ChevronUp, ChevronDown, Trash2, Settings2, Eye, X, Copy, Palette, ExternalLink, CheckCircle2, AlertTriangle, Clock, UsersRound } from 'lucide-react';
import { SurveyEditorModal, DEFAULT_SURVEY_CONFIG } from './SurveyEditorModal';
import { IconDictionary } from '@/lib/icons';

type ModuleType = 'menu-grid' | 'for-you' | 'best-sale' | 'combo' | 'onboarding-wizard' | 'support-options' | 'custom';

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

const MODULE_DEFINITIONS: Record<ModuleType, { name: string; description: string; category: 'layout' | 'action' }> = {
    'for-you': { name: 'Món Bạn Từng Gọi', description: 'Hiển thị tối đa 5 món khách đã từng gọi nhiều nhất (Chỉ On/Off)', category: 'layout' },
    'combo': { name: 'Combo Tiết Kiệm', description: 'Hiển thị các gói combo giá tốt', category: 'layout' },
    'best-sale': { name: 'Siêu Phẩm Bán Chạy', description: 'Danh sách món bán chạy nhất', category: 'layout' },
    'custom': { name: 'Danh Mục Tuỳ Chỉnh', description: 'Tự cấu hình danh mục riêng', category: 'layout' },
    'menu-grid': { name: 'Thực Đơn Của Quán', description: 'Hiển thị mục thực đơn cốt lõi (Ghim dưới đáy menu)', category: 'layout' },
    'onboarding-wizard': { name: 'Khám Phá Menu (Giới thiệu)', description: 'Bật/Tắt và thiết lập Khảo sát đầu vào (V2)', category: 'action' },
    'support-options': { name: 'Tùy Chỉnh Yêu Cầu Hỗ Trợ', description: 'Cấu hình các nút chức năng trong modal Yêu Cầu Hỗ Trợ', category: 'action' },
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

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function ModuleConfigForm({ block, onChange, allMenuItems = [] }: { block: StorefrontBlock, onChange: (newConfig: any) => void, allMenuItems?: any[] }) {
    const { type, config } = block;
    const isValid = isBlockValid(block);
    const [previewStyle, setPreviewStyle] = useState<'v1' | 'v2' | null>(null);
    const [isEditSurveyOpen, setIsEditSurveyOpen] = useState(false);
    
    // Icon picker state
    const [iconPickerOpenForId, setIconPickerOpenForId] = useState<string | null>(null);

    if (type === 'for-you') {
        return (
            <div className="space-y-4">
                <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><Settings2 size={16} /></div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Module Tự Động (Lịch Sử Gọi Món)</p>
                        Khối nội dung này được hệ thống tự động lọc các món khách đã từng gọi trong quá khứ, sắp xếp theo số lượng gọi nhiều nhất (nhằm giúp khách tiếp tục "gọi như cũ" một cách nhanh chóng). Khối sẽ tự ẩn nếu khách chưa có lịch sử. Bạn chỉ cần điều khiển Bật/Tắt hiển thị.
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'best-sale') {
        const itemIds = config.itemIds || [];
        const limit = config.limit || 10;
        const selectedItems = allMenuItems.filter(item => itemIds.includes(item.id));

        return (
            <div className="space-y-6">
                <div className="text-sm text-slate-500 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/20 flex items-start gap-3">
                    <div className="mt-0.5 text-amber-500"><Settings2 size={16} /></div>
                    <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Thiết lập Món Bán Chạy thủ công</p>
                        Chọn tối đa {limit} món bán chạy nhất từ thực đơn của bạn để hiển thị nổi bật trên trang chủ.
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số lượng tối đa ({limit})</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold opacity-50"
                            value={limit}
                            min={1}
                            max={10}
                            disabled
                            title="Giới hạn tối đa 10 món theo yêu cầu"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chọn món bán chạy ({itemIds.length}/10)</label>
                    <div className="flex gap-2 mb-4">
                        <select 
                            className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                            onChange={(e) => {
                                const id = parseInt(e.target.value);
                                if (id && !itemIds.includes(id) && itemIds.length < 10) {
                                    onChange({ ...config, itemIds: [...itemIds, id] });
                                }
                                e.target.value = "";
                            }}
                            disabled={itemIds.length >= 10}
                        >
                            <option value="">{itemIds.length >= 10 ? "-- Đã đạt giới hạn 10 món --" : "-- Tìm món trong thực đơn --"}</option>
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
                                                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">{item.price.toLocaleString()}đ</div>
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
                            <div className="p-8 text-center text-slate-400 italic text-sm">
                                Chưa có món bán chạy nào được chọn.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'combo') {
        const itemIds = config.itemIds || [];
        const limit = config.limit || 10;
        const selectedItems = allMenuItems.filter(item => itemIds.includes(item.id));

        return (
            <div className="space-y-6">
                <div className="text-sm text-slate-500 p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><Settings2 size={16} /></div>
                    <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Thiết lập Combo thủ công</p>
                        Chọn tối đa {limit} món combo từ thực đơn của bạn để hiển thị nổi bật trên trang chủ.
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số lượng tối đa ({limit})</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold opacity-50"
                            value={limit}
                            min={1}
                            max={10}
                            disabled
                            title="Giới hạn tối đa 10 món theo yêu cầu"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chọn món combo ({itemIds.length}/10)</label>
                    <div className="flex gap-2 mb-4">
                        <select 
                            className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                            onChange={(e) => {
                                const id = parseInt(e.target.value);
                                if (id && !itemIds.includes(id) && itemIds.length < 10) {
                                    onChange({ ...config, itemIds: [...itemIds, id] });
                                }
                                e.target.value = "";
                            }}
                            disabled={itemIds.length >= 10}
                        >
                            <option value="">{itemIds.length >= 10 ? "-- Đã đạt giới hạn 10 món --" : "-- Tìm món trong thực đơn --"}</option>
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
                                                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">{item.price.toLocaleString()}đ</div>
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
                            <div className="p-8 text-center text-slate-400 italic text-sm">
                                Chưa có món combo nào được chọn.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'custom') {
        return (
            <div className="space-y-4">
                {!isValid && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                        <AlertTriangle size={14} />
                        Vui lòng nhập Tên Danh Mục để hệ thống nhận diện trên Menu.
                    </div>
                )}
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
        const wizardStyle = config.wizardStyle || 'v2'; // 'v1' or 'v2'

        return (
            <div className="space-y-4">
                <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Giao diện Hiển thị Khảo sát</h5>
                    <div className="flex flex-col gap-3">
                        {/* V1 Card */}
                        <div 
                            onClick={() => onChange({ ...config, wizardStyle: 'v1' })}
                            className={`cursor-pointer rounded-xl border flex items-center p-3 gap-4 transition-all ${wizardStyle === 'v1' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-xl shadow-sm shrink-0">📋</div>
                            <div className="flex-1 text-left">
                                <h6 className={`font-bold text-sm leading-tight mb-0.5 ${wizardStyle === 'v1' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>Dạng Danh Sách (V1)</h6>
                                <p className="text-[11px] text-slate-500 leading-tight">Khảo sát cuộn dọc cơ bản</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewStyle('v1'); }}
                                className="px-3 py-1.5 rounded-md text-[10px] font-bold bg-white dark:bg-white/10 text-blue-600 border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 flex items-center gap-1 uppercase tracking-wider shrink-0"
                            >
                                <Eye size={12} /> Xem
                            </button>
                        </div>

                        {/* V2 Card */}
                        <div 
                            onClick={() => onChange({ ...config, wizardStyle: 'v2' })}
                            className={`cursor-pointer rounded-xl border flex items-center p-3 gap-4 transition-all ${wizardStyle === 'v2' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-xl shadow-sm shrink-0">✨</div>
                            <div className="flex-1 text-left">
                                <h6 className={`font-bold text-sm leading-tight mb-0.5 ${wizardStyle === 'v2' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>Dạng Lookbook (V2)</h6>
                                <p className="text-[11px] text-slate-500 leading-tight">Vuốt ngang cao cấp (Concierge UI)</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewStyle('v2'); }}
                                className="px-3 py-1.5 rounded-md text-[10px] font-bold bg-white dark:bg-white/10 text-blue-600 border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 flex items-center gap-1 uppercase tracking-wider shrink-0"
                            >
                                <Eye size={12} /> Xem
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 flex flex-col items-start">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dữ liệu Khảo sát</p>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-[400px]">Cấu hình các bộ câu hỏi "Đi cùng ai", "Hôm nay thèm gì" và liên kết chúng với các món ăn trong Storefront.</p>
                    <button 
                        onClick={() => setIsEditSurveyOpen(true)} 
                        className="px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-black hover:bg-slate-700 dark:hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                        Chỉnh sửa bộ câu hỏi
                    </button>
                    <SurveyEditorModal 
                        isOpen={isEditSurveyOpen} 
                        onClose={() => setIsEditSurveyOpen(false)} 
                        initialData={config.survey || DEFAULT_SURVEY_CONFIG} 
                        onSave={(surveyData) => onChange({ ...config, survey: surveyData })}
                    />
                </div>

                {/* Preview Modal - Skeletons for V1 vs V2 */}
                {previewStyle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewStyle(null)}>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                        <Eye size={18} className="text-blue-500" /> Bản xem trước: {previewStyle === 'v1' ? 'Dạng Danh Sách (V1)' : 'Dạng Lookbook (V2)'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Sơ đồ Mô phỏng: Màn hình Khảo sát \u2192 Màn hình Thực đơn.</p>
                                </div>
                                <button onClick={() => setPreviewStyle(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                            </div>
                            <div className="p-8 bg-slate-100/50 dark:bg-black/20 flex gap-8 overflow-x-auto justify-center">
                                
                                {/* Screen 1: KHẢO SÁT */}
                                <div className="min-w-[280px] w-full max-w-[320px] bg-slate-50 dark:bg-zinc-950 rounded-[2.5rem] border-[8px] border-slate-800 dark:border-slate-700 h-[600px] shadow-2xl overflow-hidden flex flex-col relative shrink-0 ring-1 ring-white/10">
                                    <div className="absolute top-0 w-full h-6 flex justify-center pt-2 z-20"><div className="w-16 h-1.5 bg-slate-800 dark:bg-slate-700 rounded-full"></div></div>
                                    
                                    {previewStyle === 'v1' ? (
                                        // V1 Survey
                                        <div className="flex-1 p-5 pt-12 flex flex-col gap-5 bg-white dark:bg-black">
                                            <div className="space-y-2 mb-2">
                                                <div className="w-1/2 h-6 bg-slate-200 dark:bg-white/10 rounded animate-pulse"></div>
                                                <div className="w-3/4 h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse"></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl border-2 border-slate-100 dark:border-white/10 flex flex-col items-center justify-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10"></div><div className="w-12 h-2 bg-slate-200 dark:bg-white/20 rounded"></div></div>)}
                                            </div>
                                            <div className="mt-4">
                                                <div className="w-1/3 h-5 bg-slate-200 dark:bg-white/10 rounded animate-pulse mb-3"></div>
                                                <div className="flex flex-wrap gap-2">
                                                    {[1,2,3,4,5].map(i => <div key={i} className="w-20 h-8 rounded-full bg-slate-100 dark:bg-white/10"></div>)}
                                                </div>
                                            </div>
                                            <div className="mt-auto h-12 rounded-xl bg-orange-500 w-full mb-4"></div>
                                        </div>
                                    ) : (
                                        // V2 Lookbook Survey
                                        <div className="flex-1 flex flex-col relative bg-black">
                                            <div className="h-[55%] w-full bg-slate-800 relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                                <div className="absolute bottom-6 left-5 right-5">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl mb-4"></div>
                                                    <div className="w-2/3 h-8 bg-white/90 rounded mb-2"></div>
                                                    <div className="w-full h-4 bg-white/60 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-black p-5 flex flex-col justify-end pb-8 relative z-10">
                                                <div className="w-1/2 h-5 bg-white/20 rounded mb-4"></div>
                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {[1,2,3,4].map(i => <div key={i} className="w-24 h-10 rounded-[1.5rem] bg-white/10 border border-white/20 backdrop-blur-md"></div>)}
                                                </div>
                                                <div className="h-14 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] w-full relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-white/20 blur-xl translate-x-12"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Screen 2: MENU DISPLAY */}
                                <div className="min-w-[280px] w-full max-w-[320px] bg-slate-50 dark:bg-zinc-950 rounded-[2.5rem] border-[8px] border-slate-800 dark:border-slate-700 h-[600px] shadow-2xl overflow-hidden flex flex-col relative shrink-0 ring-1 ring-white/10">
                                    <div className="absolute top-0 w-full h-6 flex justify-center pt-2 z-20"><div className="w-16 h-1.5 bg-slate-800 dark:bg-slate-700 rounded-full"></div></div>
                                    
                                    {previewStyle === 'v1' ? (
                                        // V1 Menu Wait
                                        <div className="flex-1 pt-10 flex flex-col bg-slate-50 dark:bg-black">
                                            <div className="px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex gap-3 overflow-hidden">
                                                {[1,2,3].map(i => <div key={i} className={`h-8 rounded-full ${i===1?'w-16 bg-blue-100 dark:bg-blue-900':'w-20 bg-slate-100 dark:bg-white/10'}`}></div>)}
                                            </div>
                                            <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-hidden">
                                                {[1,2,3,4,5,6].map(i => (
                                                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm h-48 border border-slate-100 dark:border-white/5 flex flex-col">
                                                        <div className="h-24 bg-slate-200 dark:bg-white/10"></div>
                                                        <div className="p-2 flex-1 flex flex-col justify-between">
                                                            <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                            <div className="w-3/4 h-3 bg-slate-100 dark:bg-white/5 rounded"></div>
                                                            <div className="w-1/2 h-4 bg-orange-100 dark:bg-orange-500/20 rounded mt-auto"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // V2 Lookbook Menu
                                        <div className="flex-1 flex flex-col bg-[#050510] relative overflow-hidden pt-10">
                                            <div className="px-5 mb-4 mt-2">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px] font-bold">1</div>
                                                    <div className="w-24 h-5 bg-white/20 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="px-5 mb-6">
                                                <div className="w-full h-72 bg-slate-800 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                    <div className="absolute top-4 left-4 w-16 h-6 bg-red-500 rounded-full font-bold text-[8px] text-white flex items-center justify-center">BEST SELLER</div>
                                                    <div className="absolute bottom-5 left-5 right-5">
                                                        <div className="w-3/4 h-6 bg-white/90 rounded mb-2"></div>
                                                        <div className="w-1/2 h-5 bg-orange-400/90 rounded mb-3"></div>
                                                        <div className="w-full h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-5 flex gap-3 overflow-hidden">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="w-28 h-32 rounded-2xl bg-white/5 border border-white/10 shrink-0 p-2 flex flex-col justify-end">
                                                        <div className="w-full h-3 bg-white/20 rounded mb-1.5"></div>
                                                        <div className="w-1/2 h-2 bg-white/10 rounded"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
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

        const handleAddOption = () => {
            const newId = 'opt_' + Date.now();
            onChange({ ...config, options: [...options, { id: newId, label: 'Tùy chọn mới', icon: 'Star', isOther: false }] });
        };

        const handleRemoveOption = (id: string) => {
            onChange({ ...config, options: options.filter((opt: any) => opt.id !== id) });
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-bold text-slate-800 dark:text-slate-100">Cấu hình các yêu cầu</h5>
                        <p className="text-xs text-slate-500 mt-1">Sắp xếp, chỉnh sửa hoặc thêm các lựa chọn mà khách có thể yêu cầu.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {options.map((opt: any, index: number) => {
                        const IconComponent = IconDictionary[opt.icon] || IconDictionary['HelpCircle'];

                        return (
                            <div key={opt.id} className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl relative">
                                {/* Icon Picker Trigger */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIconPickerOpenForId(iconPickerOpenForId === opt.id ? null : opt.id)}
                                        className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <IconComponent size={20} />
                                    </button>
                                    
                                    {/* Icon Picker Popover */}
                                    {iconPickerOpenForId === opt.id && (
                                        <div className="absolute top-12 left-0 w-64 p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 grid grid-cols-6 gap-2">
                                            {Object.keys(IconDictionary).map((iconKey) => {
                                                const DynIcon = IconDictionary[iconKey];
                                                return (
                                                    <button
                                                        key={iconKey}
                                                        onClick={() => {
                                                            handleOptionChange(opt.id, 'icon', iconKey);
                                                            setIconPickerOpenForId(null);
                                                        }}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${opt.icon === iconKey ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}`}
                                                    >
                                                        <DynIcon size={16} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col gap-1.5">
                                    <input 
                                        type="text" 
                                        value={opt.label}
                                        onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)}
                                        className="w-full bg-transparent outline-none font-semibold text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 pb-0.5 transition-colors"
                                        placeholder="Nhập tên chức năng"
                                    />
                                    
                                    <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer w-max">
                                        <input 
                                            type="checkbox"
                                            checked={opt.isOther}
                                            onChange={(e) => handleOptionChange(opt.id, 'isOther', e.target.checked)}
                                            className="rounded text-blue-500 focus:ring-blue-500"
                                        />
                                        Là mục "Yêu cầu khác" (cho phép gõ thêm)
                                    </label>
                                </div>
                                
                                <button 
                                    onClick={() => handleRemoveOption(opt.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )
                    })}
                </div>
                
                {options.length < 6 ? (
                    <button 
                        onClick={handleAddOption}
                        className="w-full py-2.5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-sm font-semibold"
                    >
                        <Plus size={16} /> Thêm chức năng
                    </button>
                ) : (
                    <div className="text-center text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/10 py-2 rounded-lg border border-orange-200 dark:border-orange-500/20">
                        Đã đạt giới hạn tối đa 6 tùy chọn để đảm bảo giao diện hiển thị tốt nhất trên thiết bị di động.
                    </div>
                )}
            </div>
        );
    }

    if (type === 'menu-grid') {
        return (
            <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-start gap-3">
                <div className="mt-0.5 text-blue-500"><AlertTriangle size={16} /></div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Danh Mục Cố Định</p>
                    Thực đơn này là trái tim của hệ thống. Luôn được ghim cố định ở đáy trang và hiển thị tất cả món ăn của quán. Bạn không thể tắt block này.
                </div>
            </div>
        );
    }

    return null;
}

export default function DisplayConfigPage() {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [savedTemplates, setSavedTemplates] = useState<StorefrontTemplate[]>(SYSTEM_TEMPLATES);
    const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'action'>('layout');

    // Mới thêm: State cho Publish Target Modal
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishScope, setPublishScope] = useState<'brand' | 'specific'>('brand');
    const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
    const [allMenuItems, setAllMenuItems] = useState<any[]>([]);

    // Load available restaurants list for Target Modal
    useEffect(() => {
        fetch('/api/restaurants')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAvailableRestaurants(data);
                }
            })
            .catch(err => console.error("Failed to fetch restaurants:", err));
    }, []);

    // Unified Fetch for Config & Scenarios
    useEffect(() => {
        const fetchAllConfig = async () => {
            try {
                const resDisplay = await fetch('/api/admin/display?resid=100');
                const dataDisplay = await resDisplay.json();
                if (dataDisplay.success) {
                    const draftBlocks = dataDisplay.data.draft;
                    const validBlocks = (draftBlocks || []).filter((b: any) => MODULE_DEFINITIONS[b.type as ModuleType]);
                    // Tự động chuyển đổi tên cũ sang tên mới để đồng bộ
                    validBlocks.forEach((b: any) => {
                        if (b.type === 'for-you' && (b.title === 'Dành Cho Bạn' || b.title === 'Dành riêng cho bạn')) {
                            b.title = 'Món Bạn Từng Gọi';
                        }
                    });

                    // Require the presence of 'for-you' or at least 5 blocks to consider it a valid new layout.
                    // Otherwise it's a legacy layout that just happened to have 'menu-grid'.
                    if (!validBlocks || validBlocks.length === 0 || !validBlocks.some((b: any) => b.type === 'for-you')) {
                        // Áp dụng giao diện Default Fallback nếu DB rỗng hoặc toàn bộ block cũ đã bị deprecate
                        setBlocks(SYSTEM_TEMPLATES[0].blocks);
                        setActiveTemplateId(SYSTEM_TEMPLATES[0].id);
                    } else {
                        setBlocks(validBlocks);
                        setActiveTemplateId('custom-db'); // Đánh dấu là đã lấy từ DB
                    }

                    // Fetch menu items for restaurant 100 (default)
                    const resMenu = await fetch('/api/restaurants/100');
                    const menuData = await resMenu.json();
                    if (menuData && menuData.menu && menuData.menu.items) {
                        setAllMenuItems(menuData.menu.items);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch configurations:', error);
            }
        };
        fetchAllConfig();
    }, []);


    // Chỉ mở Modal khi click
    const handleSaveAndPublishClick = () => {
        setIsPublishModalOpen(true);
    };

    // Thực thi khi người dùng Submit trong Modal
    const executePublish = async () => {
        if (publishScope === 'specific' && selectedRestaurants.length === 0) {
            alert('Vui lòng chọn ít nhất 1 cửa hàng để áp dụng.');
            return;
        }

        setIsSaving(true);
        try {
            const targetIds = publishScope === 'brand' 
                ? availableRestaurants.map(r => r.id) 
                : selectedRestaurants;

            // Bước 1: Lưu cấu hình hiện tại vào nháp
            const postRes = await fetch('/api/admin/display', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds, blocks })
            });
            
            if (!postRes.ok) throw new Error('Lỗi khi lưu thiết kế');

            // Bước 2: Công bố thẳng ra khách hàng
            const res = await fetch('/api/admin/display', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds })
            });
            if (res.ok) {
                alert('Đã lưu và áp dụng thành công!');
                setIsPublishModalOpen(false);
            } else {
                alert('Lỗi khi áp dụng thiết kế');
            }
        } catch (error) {
            alert('Lỗi khi lưu và áp dụng thiết kế');
        } finally {
            setIsSaving(false);
        }
    };

    // Sync blocks to localStorage for Live Preview
    useEffect(() => {
        localStorage.setItem('preview_storefront_config', JSON.stringify(blocks));

        // Notify iframe if it exists
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'STOREFRONT_CONFIG_UPDATE',
                config: blocks
            }, '*');
        }
    }, [blocks]);

    const loadTemplate = (templateId: string) => {
        const tpl = savedTemplates.find(t => t.id === templateId);
        if (tpl) {
            setBlocks(JSON.parse(JSON.stringify(tpl.blocks))); // deep clone
            setActiveTemplateId(tpl.id);
        }
        setIsTemplateModalOpen(false);
        setEditingBlockId(null);
    };

    const handleCreateCustom = () => {
        setBlocks([{ id: 'core-menu-' + Date.now(), type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: {} }]);
        setActiveTemplateId('custom-new');
        setIsTemplateModalOpen(false);
        setEditingBlockId(null);
    };

    const handleSaveAsTemplate = () => {
        const name = prompt("Nhập tên Mẫu Giao Diện mới:");
        if (name) {
            const newTpl: StorefrontTemplate = {
                id: 'custom-' + Date.now(),
                name,
                blocks: JSON.parse(JSON.stringify(blocks))
            };
            setSavedTemplates([...savedTemplates, newTpl]);
            alert('Đã lưu mẫu giao diện: ' + name);
        }
    };

    const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;

        const newBlocks = [...blocks];
        const blockToMove = newBlocks[index];

        // Rule: Menu grid must be at the bottom, Cannot be moved
        if (blockToMove.type === 'menu-grid') return;

        if (direction === 'up') {
            // Find previous block of SAME category (layout)
            let prevIndex = -1;
            for (let i = index - 1; i >= 0; i--) {
                if (MODULE_DEFINITIONS[newBlocks[i].type].category === 'layout' && newBlocks[i].type !== 'menu-grid') {
                    prevIndex = i;
                    break;
                }
            }
            if (prevIndex !== -1) {
                [newBlocks[prevIndex], newBlocks[index]] = [newBlocks[index], newBlocks[prevIndex]];
            }
        } else if (direction === 'down') {
            // Find next block of SAME category (layout)
            let nextIndex = -1;
            for (let i = index + 1; i < newBlocks.length; i++) {
                if (MODULE_DEFINITIONS[newBlocks[i].type].category === 'layout' && newBlocks[i].type !== 'menu-grid') {
                    nextIndex = i;
                    break;
                }
            }
            if (nextIndex !== -1) {
                [newBlocks[nextIndex], newBlocks[index]] = [newBlocks[index], newBlocks[nextIndex]];
            }
        }
        setBlocks(newBlocks);
    };

    const handleDeleteBlock = (id: string) => {
        const blockToDelete = blocks.find(b => b.id === id);
        if (blockToDelete?.type === 'menu-grid') {
            alert('Không thể xóa khối Thực Đơn cốt lõi trực tiếp. Vui lòng thiết lập cấu hình hoặc ẩn danh mục bên trong.');
            return;
        }
        setBlocks(blocks.filter(b => b.id !== id));
        if (editingBlockId === id) setEditingBlockId(null);
    };

    const handleUpdateBlockConfig = (id: string, newConfig: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, config: { ...b.config, ...newConfig } } : b));
    };

    const handleAddBlock = (type: ModuleType) => {
        const def = MODULE_DEFINITIONS[type];
        const newBlock: StorefrontBlock = {
            id: 'block-' + Date.now(),
            type,
            title: def.name,
            config: {}
        };

        // Rule: Always insert ABOVE menu-grid
        const menuGridIndex = blocks.findIndex(b => b.type === 'menu-grid');
        let newBlocks = [...blocks];
        if (menuGridIndex !== -1) {
            newBlocks.splice(menuGridIndex, 0, newBlock);
        } else {
            newBlocks = [...newBlocks, newBlock];
        }

        setBlocks(newBlocks);
        setEditingBlockId(newBlock.id); // Auto open for editing
        setIsAddBlockModalOpen(false); // Close modal
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f0f13] font-sans relative">
            {/* Main Full-Width Layout Builder */}
            <div className="w-full flex flex-col bg-white dark:bg-[#1a1a24] relative z-10 transition-transform duration-500">

                {/* Header Toolbar */}
                <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                            <LayoutTemplate size={16} />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                                {activeTemplateId ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Đang dùng: <span className="text-blue-600 dark:text-blue-400">{savedTemplates.find(t => t.id === activeTemplateId)?.name || 'Giao diện tùy chỉnh'}</span>
                                    </span>
                                ) : 'Chưa chọn giao diện'}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Kéo thả để thiết kế màn hình chọn món</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsTemplateModalOpen(true)} className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                            <Palette size={18} /> {activeTemplateId ? 'Đổi giao diện' : 'Chọn giao diện'}
                        </button>
                        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                        <button onClick={() => setIsPreviewOpen(true)} className="px-5 py-2 rounded-lg text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95">
                            <Eye size={18} /> Xem Live Preview
                        </button>
                    </div>
                </div>

                {/* Canvas Area (Central container) */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                    {!activeTemplateId ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20 shadow-xl shadow-blue-500/5">
                                <LayoutTemplate size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Bắt đầu thiết kế cửa hàng của bạn</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Bạn chưa chọn mẫu giao diện nào cho cửa hàng. Hãy bắt đầu bằng việc chọn một mẫu có sẵn hoặc tự tay thiết kế từ đầu.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-3 active:scale-95"
                                >
                                    <Palette size={20} /> Khám phá thư viện mẫu
                                </button>
                                <button
                                    onClick={handleCreateCustom}
                                    className="px-8 py-3 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    <Plus size={20} /> Tự thiết kế (Custom)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {/* Tabs Navigation */}
                            <div className="flex bg-slate-100 dark:bg-black/40 p-1.5 rounded-xl mb-8 w-max mx-auto border border-slate-200 dark:border-white/5">
                                <button 
                                    onClick={() => setActiveTab('layout')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'layout' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                >
                                    <LayoutTemplate size={16} /> Thứ Tự Menu
                                </button>
                                <button 
                                    onClick={() => setActiveTab('action')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'action' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                >
                                    <Settings2 size={16} /> Tính Năng Nền & Tương Tác
                                </button>
                            </div>

                            {activeTab === 'layout' && (
                                <>
                                    <div className="flex items-end justify-between mb-8">
                                        <div>
                                            <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">Cấu trúc hiển thị</h2>
                                            <p className="text-sm text-slate-500 mt-1">Thêm, xóa và sắp xếp thứ tự các khối chức năng sẽ xuất hiện trên Ứng dụng khách.</p>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-100/50">{blocks.filter(b => MODULE_DEFINITIONS[b.type].category === 'layout').length} khối đang bật</span>
                                    </div>

                                    <div className="space-y-5">
                                {blocks.map((block, index) => {
                                    const def = MODULE_DEFINITIONS[block.type];
                                    if (def.category !== 'layout' || block.type === 'menu-grid') return null;

                                    const layoutBlocks = blocks.filter(b => MODULE_DEFINITIONS[b.type].category === 'layout' && b.type !== 'menu-grid');
                                    const displayIndex = layoutBlocks.findIndex(b => b.id === block.id) + 1;
                                    const isFirst = block.id === layoutBlocks[0]?.id;
                                    const isLast = block.id === layoutBlocks[layoutBlocks.length - 1]?.id;
                                    const isValid = isBlockValid(block);

                                    return (
                                        <div key={block.id} className={`bg-white dark:bg-black/20 border rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col overflow-hidden ${!isValid ? 'border-red-500 dark:border-red-500/50 bg-red-50/10' : 'border-slate-200 dark:border-white/10'}`}>
                                            <div className="flex items-center p-4 gap-5">
                                                {/* Reorder controls */}
                                                <div className={`flex flex-col gap-1 items-center p-1 rounded-xl text-slate-400 border ${!isValid ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200' : 'bg-slate-50 dark:bg-white/5 border-slate-200/50 dark:border-white/5'}`}>
                                                    <button onClick={() => handleMoveBlock(block.id, 'up')} disabled={isFirst} className="hover:text-blue-500 disabled:opacity-20 disabled:hover:text-slate-400"><ChevronUp size={18} /></button>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${!isValid ? 'bg-red-500 text-white' : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300'}`}>{displayIndex}</div>
                                                    <button onClick={() => handleMoveBlock(block.id, 'down')} disabled={isLast} className="hover:text-blue-500 disabled:opacity-20 disabled:hover:text-slate-400"><ChevronDown size={18} /></button>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="text-[11px] font-bold text-blue-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${!isValid ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                                        {def.name}
                                                        {!isValid && <span className="flex items-center gap-1 text-red-500 ml-2 normal-case"><AlertTriangle size={12} /> Cần thiết lập thông tin</span>}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={block.title}
                                                        onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))}
                                                        className="bg-transparent border-none outline-none font-semibold text-lg text-slate-900 dark:text-white w-full placeholder-slate-300 dark:placeholder-slate-700"
                                                        placeholder="Nhập tiêu đề khối (Vd: Món Ăn Bán Chạy)"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">{def.description}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${editingBlockId === block.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'}`}>
                                                        <Settings2 size={16} /> {editingBlockId === block.id ? 'Đóng khối' : 'Cấu hình'}
                                                    </button>
                                                    <button onClick={() => handleDeleteBlock(block.id)} className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-transparent">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Edit Panel (Extends visually downwards) */}
                                            {editingBlockId === block.id && (
                                                <div className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5 p-6 shadow-inner">
                                                    <div className="max-w-3xl mx-auto space-y-4">
                                                        <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 mb-4">Thiết lập chi tiết block: {def.name}</h4>
                                                        <ModuleConfigForm
                                                            block={block}
                                                            onChange={(newConfig: any) => handleUpdateBlockConfig(block.id, newConfig)}
                                                            allMenuItems={allMenuItems}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <button onClick={() => setIsAddBlockModalOpen(true)} className="w-full py-4 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group my-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                                <span className="font-medium text-sm">Chèn khối bổ sung mới</span>
                            </button>
                            {(() => {
                                const menuBlock = blocks.find(b => b.type === 'menu-grid') || { id: 'core-menu', type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: {} };
                                const def = MODULE_DEFINITIONS['menu-grid'];
                                return (
                                    <div className="bg-white dark:bg-black/20 border-2 border-slate-200 dark:border-white/20 rounded-2xl shadow-sm flex flex-col overflow-hidden opacity-90 relative mb-12">
                                        <div className="absolute top-0 right-0 py-1.5 px-3 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} /> Vị trí cố định</div>
                                        <div className="flex items-center p-4 gap-5">
                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {def.name}
                                                </div>
                                                <input type="text" value={menuBlock.title} onChange={() => { }} className="bg-transparent border-none outline-none font-semibold text-lg text-slate-900 dark:text-white w-full placeholder-slate-300 dark:placeholder-slate-700" placeholder="Danh mục món cố định" disabled />
                                                <p className="text-xs text-slate-500 mt-1">Khối bắt buộc, luôn hiển thị ở cuối màn hình để đảm bảo trải nghiệm khách hàng.</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingBlockId(editingBlockId === menuBlock.id ? null : menuBlock.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${editingBlockId === menuBlock.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'}`}>
                                                    <Settings2 size={16} /> {editingBlockId === menuBlock.id ? 'Đóng khối' : 'Cấu hình'}
                                                </button>
                                            </div>
                                        </div>

                                        {editingBlockId === menuBlock.id && (
                                            <div className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5 p-6 shadow-inner">
                                                <div className="max-w-3xl mx-auto space-y-4">
                                                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 mb-4">Thiết lập chi tiết block: {def.name}</h4>
                                                    <ModuleConfigForm
                                                        block={menuBlock as StorefrontBlock}
                                                        onChange={(newConfig: any) => handleUpdateBlockConfig(menuBlock.id, newConfig)}
                                                        allMenuItems={allMenuItems}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                            </>
                            )}

                            {/* Action-based Features Section */}
                            {activeTab === 'action' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Cấu hình chức năng</h3>
                                    <p className="text-sm text-slate-500 font-medium">Bật/Tắt các chức năng chạy ngầm hoặc trải nghiệm phụ trợ trên toàn ứng dụng.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(Object.keys(MODULE_DEFINITIONS) as ModuleType[])
                                        .filter(type => MODULE_DEFINITIONS[type].category === 'action')
                                        .map((type) => {
                                            const def = MODULE_DEFINITIONS[type];
                                            const activeBlock = blocks.find(b => b.type === type);
                                            const blockId = activeBlock?.id || `bg-${type}`;
                                            const isEnabled = activeBlock?.config?.isEnabled !== false;
                                            const isValid = activeBlock ? isBlockValid(activeBlock) : true;

                                            return (
                                                <div key={type} className={`bg-white dark:bg-black/20 border rounded-2xl p-5 transition-all ${isEnabled ? (isValid ? 'border-blue-500/30' : 'border-red-500/50 bg-red-50/5') : 'border-slate-200 dark:border-white/10 opacity-75'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? (isValid ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600') : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                                {isValid ? <Settings2 size={20} /> : <AlertTriangle size={20} />}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-bold text-sm ${!isValid && isEnabled ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{def.name}</h4>
                                                                <p className="text-[10px] text-slate-500 leading-tight pr-4">{isValid ? def.description : 'Cần bổ sung cấu hình để hoạt động'}</p>
                                                            </div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-75">
                                                            <input
                                                                type="checkbox"
                                                                checked={isEnabled}
                                                                onChange={(e) => {
                                                                    const updatedConfig = { ...activeBlock?.config, isEnabled: e.target.checked };
                                                                    if (!activeBlock) {
                                                                        setBlocks([...blocks, { id: blockId, type, title: def.name, config: updatedConfig }]);
                                                                    } else {
                                                                        handleUpdateBlockConfig(blockId, updatedConfig);
                                                                    }
                                                                }}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>

                                                    <button
                                                        onClick={() => setEditingBlockId(editingBlockId === blockId ? null : blockId)}
                                                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${editingBlockId === blockId ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50'}`}
                                                    >
                                                        <Settings2 size={14} /> {editingBlockId === blockId ? 'Đóng thiết lập' : 'Cấu hình chi tiết'}
                                                    </button>

                                                    {editingBlockId === blockId && (
                                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                            <ModuleConfigForm
                                                                block={(activeBlock || { id: blockId, type, title: def.name, config: { isEnabled: true } }) as StorefrontBlock}
                                                                allMenuItems={allMenuItems}
                                                                onChange={(newConfig: any) => {
                                                                    if (!activeBlock) {
                                                                        setBlocks([...blocks, { id: blockId, type, title: def.name, config: { ...newConfig, isEnabled: true } }]);
                                                                    } else {
                                                                        handleUpdateBlockConfig(blockId, newConfig);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                </div>
                            </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md z-10 shrink-0 flex justify-center sticky bottom-0">
                    <div className="w-full max-w-4xl flex gap-3">
                        <button onClick={handleSaveAsTemplate} className="flex-1 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2">
                            <Save size={16} /> Lưu thiết kế làm mẫu
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={handleSaveAndPublishClick}
                            className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Lưu cấu hình & Áp dụng ngay</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-over Preview Modal */}
            <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isPreviewOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />

                {/* Slide Panel */}
                <div className={`relative w-full max-w-md bg-slate-100 dark:bg-zinc-950 h-full shadow-2xl flex flex-col transition-transform duration-500 ease-out border-l border-slate-200 dark:border-white/10 ${isPreviewOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Panel Header */}
                    <div className="h-14 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <Eye size={18} className="text-orange-500" />
                            <h3 className="font-bold text-base">Live Preview (Mobile)</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.open('/storefront-preview', '_blank')} className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all" title="Mở tab mới">
                                <ExternalLink size={16} />
                            </button>
                            <button onClick={() => setIsPreviewOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-500 dark:text-slate-400">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Phone Mockup Area */}
                    <div className="flex-1 overflow-y-auto w-full flex justify-center py-8">
                        <div className="relative" style={{ width: '375px', height: '750px' }}>
                            <div className="absolute inset-0 bg-white dark:bg-[#111] rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_0_0_12px_#222] overflow-hidden flex flex-col">
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#222] rounded-b-2xl z-50"></div>
                                <div className="flex-1 overflow-hidden relative w-full h-full">
                                    <iframe
                                        ref={iframeRef}
                                        src="/storefront-preview"
                                        className="w-full h-full border-none"
                                        title="Live Preview"
                                        onLoad={() => {
                                            if (iframeRef.current && iframeRef.current.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({
                                                    type: 'STOREFRONT_CONFIG_UPDATE',
                                                    config: blocks
                                                }, '*');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Manager Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 p-4 ${isTemplateModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)} />
                <div className={`relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transition-transform duration-500 ease-out overflow-hidden flex flex-col max-h-[80vh] ${isTemplateModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thư viện giao diện mẫu</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Chọn một mẫu có sẵn để bắt đầu hoặc áp dụng ngay</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCreateCustom} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2">
                                <Plus size={14} /> Tự thiết kế (Custom)
                            </button>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-black/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedTemplates.map(tpl => (
                                <div key={tpl.id} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight pr-2">{tpl.name}</h4>
                                            {tpl.isSystem ?
                                                <span className="shrink-0 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wide">Mặc định</span> :
                                                <span className="shrink-0 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-md uppercase tracking-wide">Tự tạo</span>
                                            }
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {tpl.blocks.map((b, i) => (
                                                <span key={i} className="text-[11px] font-medium text-slate-600 top-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-full">{MODULE_DEFINITIONS[b.type].name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => loadTemplate(tpl.id)} className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all">Sử dụng mẫu này</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Block Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 p-4 ${isAddBlockModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsAddBlockModalOpen(false)} />
                <div className={`relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transition-transform duration-500 ease-out overflow-hidden flex flex-col max-h-[80vh] ${isAddBlockModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Khối Chức Năng (Module)</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Chọn một block để gắp thả vào trang cửa hàng của bạn</p>
                        </div>
                        <button onClick={() => setIsAddBlockModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-black/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(Object.keys(MODULE_DEFINITIONS) as ModuleType[]).map((type) => {
                                const def = MODULE_DEFINITIONS[type];
                                if (def.category !== 'layout' || type === 'menu-grid') return null; // Only show layout blocks that aren't core
                                return (
                                    <div key={type} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer" onClick={() => handleAddBlock(type)}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight pr-2">{def.name}</h4>
                                                <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center"><Plus size={14} /></div>
                                            </div>
                                            <p className="text-xs text-slate-500">{def.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Publish Target Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 p-4 ${isPublishModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsPublishModalOpen(false)} />
                <div className={`relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transition-transform duration-500 ease-out flex flex-col max-h-[90vh] ${isPublishModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-6 border-b border-slate-100 dark:border-white/10 shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Áp dụng giao diện</h3>
                                <p className="text-sm text-slate-500 mt-1">Chọn phạm vi cửa hàng bạn muốn cập nhật thiết kế này.</p>
                            </div>
                            <button onClick={() => setIsPublishModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-black/20 space-y-6">
                        <div className="space-y-3">
                            {/* Option: Toàn bộ thương hiệu */}
                            <label className={`flex gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${publishScope === 'brand' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 opacity-80 hover:opacity-100 hover:border-blue-300'}`}>
                                <div className="pt-0.5">
                                    <input 
                                        type="radio" 
                                        name="publishScope" 
                                        value="brand"
                                        checked={publishScope === 'brand'}
                                        onChange={() => setPublishScope('brand')}
                                        className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-base ${publishScope === 'brand' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>Cả Thương Hiệu</h4>
                                    <p className="text-sm text-slate-500 mt-1">Ghi đè cấu hình hiển thị lên TẤT CẢ các cửa hàng hiện có trong hệ thống.</p>
                                </div>
                            </label>

                            {/* Option: Một số nhà hàng cụ thể */}
                            <label className={`flex gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${publishScope === 'specific' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 opacity-80 hover:opacity-100 hover:border-blue-300'}`}>
                                <div className="pt-0.5">
                                    <input 
                                        type="radio" 
                                        name="publishScope" 
                                        value="specific"
                                        checked={publishScope === 'specific'}
                                        onChange={() => setPublishScope('specific')}
                                        className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-base ${publishScope === 'specific' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>Cửa Hàng Cụ Thể</h4>
                                    <p className="text-sm text-slate-500 mt-1">Chỉ định cấu hình này cho một số cửa hàng được chọn.</p>
                                </div>
                            </label>
                        </div>

                        {/* List of specific restaurants if selected */}
                        {publishScope === 'specific' && (
                            <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-white/10 pb-2">Danh sách Cửa hàng</h5>
                                {availableRestaurants.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">Chưa đọc được danh sách nhà hàng. Đang tải...</p>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {availableRestaurants.map(r => (
                                            <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedRestaurants.includes(r.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedRestaurants([...selectedRestaurants, r.id]);
                                                        else setSelectedRestaurants(selectedRestaurants.filter(id => id !== r.id));
                                                    }}
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{r.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{r.address}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-900 shrink-0 flex gap-3 justify-end rounded-b-3xl">
                        <button 
                            disabled={isSaving}
                            onClick={() => setIsPublishModalOpen(false)} 
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button 
                            disabled={isSaving || (publishScope === 'specific' && selectedRestaurants.length === 0)}
                            onClick={executePublish} 
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? 'Đang lưu...' : 'Xác nhận Khởi tạo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


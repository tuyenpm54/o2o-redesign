"use client";

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle, GripVertical } from 'lucide-react';

export interface SurveyConfig {
    groupTitle: string;
    groupDesc: string;
    groups: Array<{ id: string; label: string; sub: string }>;
    cravingTitle: string;
    cravings: Array<{ id: string; label: string; tags: string }>;
}

export const DEFAULT_SURVEY_CONFIG: SurveyConfig = {
    groupTitle: "Hôm nay bạn đến để dịp gì?",
    groupDesc: "Chúng tôi sẽ gợi ý món phù hợp nhất cho bạn",
    groups: [
        { id: "Nhóm 2", label: "Hẹn hò", sub: "1-2 người" },
        { id: "Nhóm 4-6", label: "Gia đình", sub: "Có trẻ em" },
        { id: "Nhóm bạn", label: "Bạn bè", sub: "3-6 người" },
        { id: "Nhóm 8-10", label: "Tiệc lớn", sub: "7+ người" },
    ],
    cravingTitle: "Hôm nay bạn thèm gì?",
    cravings: [
        { id: 'craving_grill', label: 'Nướng / BBQ', tags: 'Đậm đà, Signature, Best Seller, Nhóm 2' },
        { id: 'craving_hotpot', label: 'Lẩu / Canh nóng', tags: 'Hải sản, Nhóm 4-6, Nhóm 8-10, Bán chạy' },
        { id: 'craving_light', label: 'Thanh đạm', tags: 'Thanh đạm, Healthy, Ít cay' },
    ]
};

export function SurveyEditorModal({
    isOpen,
    onClose,
    initialData,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    initialData?: SurveyConfig;
    onSave: (data: SurveyConfig) => void;
}) {
    const [data, setData] = useState<SurveyConfig>(initialData || DEFAULT_SURVEY_CONFIG);

    if (!isOpen) return null;

    const updateGroup = (index: number, field: keyof SurveyConfig['groups'][0], value: string) => {
        const newGroups = [...data.groups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        // auto-generate ID if it's the label
        if (field === 'label' && !newGroups[index].id) newGroups[index].id = `group_${Date.now()}`;
        setData({ ...data, groups: newGroups });
    };

    const updateCraving = (index: number, field: keyof SurveyConfig['cravings'][0], value: string) => {
        const newCravings = [...data.cravings];
        newCravings[index] = { ...newCravings[index], [field]: value };
        if (field === 'label' && !newCravings[index].id) newCravings[index].id = `craving_${Date.now()}`;
        setData({ ...data, cravings: newCravings });
    };

    const addGroup = () => setData({ ...data, groups: [...data.groups, { id: `group_${Date.now()}`, label: '', sub: '' }] });
    const removeGroup = (idx: number) => setData({ ...data, groups: data.groups.filter((_, i) => i !== idx) });

    const addCraving = () => setData({ ...data, cravings: [...data.cravings, { id: `crav_${Date.now()}`, label: '', tags: '' }] });
    const removeCraving = (idx: number) => setData({ ...data, cravings: data.cravings.filter((_, i) => i !== idx) });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-full flex flex-col shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5 rounded-t-2xl">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Cấu hình Câu hỏi Khảo sát</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tuỳ chỉnh các danh mục để AI phân tích và gợi ý món.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Câu hỏi 1 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                                Nhóm Đi Cùng Ai
                            </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tiêu đề câu hỏi</label>
                                <input value={data.groupTitle} onChange={e => setData({...data, groupTitle: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mô tả phụ</label>
                                <input value={data.groupDesc} onChange={e => setData({...data, groupDesc: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Các Lựa Chọn Nhóm</label>
                            {data.groups.map((g, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="text-slate-400 cursor-grab"><GripVertical size={16}/></div>
                                    <input value={g.label} onChange={e => updateGroup(idx, 'label', e.target.value)} placeholder="Tên nhóm (VD: Hẹn hò)" className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg font-medium" />
                                    <input value={g.sub} onChange={e => updateGroup(idx, 'sub', e.target.value)} placeholder="Mô tả (VD: 1-2 người)" className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg text-slate-500" />
                                    <button onClick={() => removeGroup(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button onClick={addGroup} className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus size={14}/> Thêm lựa chọn</button>
                        </div>
                    </div>

                    {/* Câu hỏi 2 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                                Sở Thích & Cảm Xúc
                            </h4>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg text-sm text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-500/20">
                            <strong>Khảo sát Tự động:</strong> Ở câu hỏi số 2, hệ thống O2O sẽ tự động lấy danh sách Tag món ăn (Không hành, Ít cay, Thanh đạm...) của Nhà Hàng để sinh ra các lựa chọn mà không cần Admin phải điền tay.
                        </div>
                    </div>

                    {/* Câu hỏi 3 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
                                Nhóm Món Thèm Muốn
                            </h4>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tiêu đề câu hỏi</label>
                            <input value={data.cravingTitle} onChange={e => setData({...data, cravingTitle: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg" />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Các Lựa Chọn (Và Tag liên kết Hệ thống)</label>
                            {data.cravings.map((c, idx) => (
                                <div key={idx} className="flex gap-2 items-start bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="flex-1 space-y-2">
                                        <input value={c.label} onChange={e => updateCraving(idx, 'label', e.target.value)} placeholder="Tên Lựa chọn (VD: Nướng BBQ)" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg font-medium" />
                                        <input value={c.tags} onChange={e => updateCraving(idx, 'tags', e.target.value)} placeholder="Tags liên kết (cách bằng dấu phẩy) VD: Đậm đà, Signature" className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-black rounded-lg text-slate-500" />
                                    </div>
                                    <button onClick={() => removeCraving(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg translate-y-2"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button onClick={addCraving} className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus size={14}/> Thêm món thèm</button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-slate-50 dark:bg-white/5 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10 rounded-xl transition-colors">Hủy</button>
                    <button onClick={() => { onSave(data); onClose(); }} className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2">
                        <CheckCircle size={16}/> Lưu Dữ Liệu
                    </button>
                </div>
            </div>
        </div>
    );
}

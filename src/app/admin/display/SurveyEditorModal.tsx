"use client";

import React from 'react';
import { Plus, Trash2, GripVertical, Zap } from 'lucide-react';

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

export function SurveyEditorInline({
    data,
    onChange
}: {
    data: SurveyConfig;
    onChange: (data: SurveyConfig) => void;
}) {
    const updateGroup = (index: number, field: keyof SurveyConfig['groups'][0], value: string) => {
        const newGroups = [...data.groups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        if (field === 'label' && !newGroups[index].id) newGroups[index].id = `group_${Date.now()}`;
        onChange({ ...data, groups: newGroups });
    };

    const updateCraving = (index: number, field: keyof SurveyConfig['cravings'][0], value: string) => {
        const newCravings = [...data.cravings];
        newCravings[index] = { ...newCravings[index], [field]: value };
        if (field === 'label' && !newCravings[index].id) newCravings[index].id = `craving_${Date.now()}`;
        onChange({ ...data, cravings: newCravings });
    };

    const addGroup = () => onChange({ ...data, groups: [...data.groups, { id: `group_${Date.now()}`, label: '', sub: '' }] });
    const removeGroup = (idx: number) => onChange({ ...data, groups: data.groups.filter((_, i) => i !== idx) });

    const addCraving = () => onChange({ ...data, cravings: [...data.cravings, { id: `crav_${Date.now()}`, label: '', tags: '' }] });
    const removeCraving = (idx: number) => onChange({ ...data, cravings: data.cravings.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-8 mt-6">
            
            {/* --- Bước 1 --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">1</span>
                    <h4 className="font-semibold text-[13px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Nhóm Đi Cùng</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">Tiêu đề</label>
                        <input value={data.groupTitle} onChange={e => onChange({...data, groupTitle: e.target.value})} className="w-full px-3 py-2 text-[13px] font-semibold bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">Mô tả phụ</label>
                        <input value={data.groupDesc} onChange={e => onChange({...data, groupDesc: e.target.value})} className="w-full px-3 py-2 text-[13px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="space-y-2">
                    {data.groups.map((g, idx) => (
                        <div key={idx} className="flex gap-2 items-center group bg-white dark:bg-zinc-800/50 p-2 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="pl-2 text-slate-300 dark:text-slate-600 cursor-grab hover:text-slate-500"><GripVertical size={14}/></div>
                            <input value={g.label} onChange={e => updateGroup(idx, 'label', e.target.value)} placeholder="Nhóm (VD: Hẹn hò)" className="flex-1 px-3 py-1.5 text-[13px] font-semibold bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal" />
                            <div className="h-4 w-px bg-slate-200 dark:bg-white/10"></div>
                            <input value={g.sub} onChange={e => updateGroup(idx, 'sub', e.target.value)} placeholder="Mô tả (VD: 1-2 người)" className="flex-1 px-3 py-1.5 text-[12px] text-slate-500 bg-transparent outline-none" />
                            <button onClick={() => removeGroup(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    <button onClick={addGroup} className="mt-1 w-full py-2.5 text-[12px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-400 transition-colors">
                        <Plus size={14}/> Thêm lựa chọn nhóm
                    </button>
                </div>
            </div>

            {/* --- Bước 2 --- */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">2</span>
                    <h4 className="font-semibold text-[13px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Sở Thích & Cảm Xúc</h4>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-500/10 shadow-sm flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5"><Zap size={16}/></div>
                    <p className="text-[12px] leading-relaxed text-blue-800 dark:text-blue-200">
                        <strong className="font-semibold text-blue-900 dark:text-blue-400">Tự động hoá AI:</strong> Hệ thống O2O sẽ tự động phân tích <span className="underline decoration-blue-200 dark:decoration-blue-700 underline-offset-2">toàn bộ menu nhà hàng</span> và sinh ra các lựa chọn sở thích mà không cần cấu hình bằng tay.
                    </p>
                </div>
            </div>

            {/* --- Bước 3 --- */}
            <div className="space-y-4 pt-2 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">3</span>
                    <h4 className="font-semibold text-[13px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Món Thèm Muốn</h4>
                </div>
                
                <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                    <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">Tiêu đề chốt sale</label>
                    <input value={data.cravingTitle} onChange={e => onChange({...data, cravingTitle: e.target.value})} className="w-full px-3 py-2 text-[13px] font-semibold bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                    {data.cravings.map((c, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-white dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex-1 space-y-2 pt-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    <input value={c.label} onChange={e => updateCraving(idx, 'label', e.target.value)} placeholder="VD: Nướng BBQ" className="w-full text-[13px] font-bold bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal" />
                                </div>
                                <div className="pl-3.5 flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">Tags</span>
                                    <input value={c.tags} onChange={e => updateCraving(idx, 'tags', e.target.value)} placeholder="Đậm đà, Signature" className="w-full text-[12px] text-blue-600 dark:text-blue-400 bg-transparent outline-none placeholder:text-slate-300" />
                                </div>
                            </div>
                            <button onClick={() => removeCraving(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    <button onClick={addCraving} className="mt-1 w-full py-2.5 text-[12px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-400 transition-colors">
                        <Plus size={14}/> Thêm nhóm món thèm
                    </button>
                </div>
            </div>
        </div>
    );
}

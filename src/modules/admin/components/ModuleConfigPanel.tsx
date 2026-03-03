import React, { useState } from 'react';
import { X, ChevronRight, Search, Plus, Trash2, Smartphone, Check, Star, Zap, ShoppingBag, Tag, Sparkles, Layers } from 'lucide-react';

interface ModuleConfigPanelProps {
    moduleId: string | null;
    onClose: () => void;
}

const MENU_ITEMS = [
    { id: 1, name: 'Bò hầm ngũ quả', price: 60000, img: '/food/sup-bi-do.jpg' },
    { id: 2, name: 'Bít tết vai bò Mỹ', price: 150000, img: '/food/beefsteak.jpg' },
    { id: 3, name: 'Trà chanh olong', price: 35000, img: '/food/tra-dao.jpg' },
    { id: 4, name: 'Viên cừu nướng', price: 60000, img: '/food/suon-nuong.jpg' },
    { id: 5, name: 'Thịt bò kope', price: 150000, img: '/food/ba-chi-bo.jpg' },
    { id: 6, name: 'Nước ép táo ta', price: 50000, img: '/food/sinh-to-bo.jpg' },
    { id: 7, name: 'Bia Sài Gòn', price: 20000, img: '/food/coca.jpg' },
    { id: 8, name: 'Set cuốn gà', price: 120000, img: '/food/goi-cuon.jpg' },
];

export function ModuleConfigPanel({ moduleId, onClose }: ModuleConfigPanelProps) {
    // ---- Highlights State ----
    const [newItemsEnabled, setNewItemsEnabled] = useState(true);
    const [topItemsEnabled, setTopItemsEnabled] = useState(true);
    const [newItems, setNewItems] = useState([1, 2, 4]); // IDs
    const [topItems, setTopItems] = useState([1, 2, 4]);

    // ---- Suggestions State ----
    const [crossSellEnabled, setCrossSellEnabled] = useState(true);
    const [upsellEnabled, setUpsellEnabled] = useState(true);

    // Cross-sell Map: Trigger Item -> Array of Suggested Items
    const [crossSellRules, setCrossSellRules] = useState<Record<number, number[]>>({
        1: [2, 3, 4]
    });
    // Temporary state for adding a new cross-sell rule
    const [selectedTrigger, setSelectedTrigger] = useState<number | ''>('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<number | ''>('');

    const [upsellItems, setUpsellItems] = useState([5, 6]);

    // ---- Guided Discovery State ----
    const [questions, setQuestions] = useState([
        {
            id: 'q1',
            text: 'Hôm nay nhóm mình đi mấy người?',
            options: [
                { id: 'o1', text: 'Đi 1 mình', tags: ['single'] },
                { id: 'o2', text: '2 người (Hẹn hò)', tags: ['couple', 'romantic'] },
                { id: 'o3', text: 'Nhóm 3-5 người', tags: ['group_small'] },
                { id: 'o4', text: 'Nhóm đông (6+)', tags: ['group_large', 'party'] },
            ]
        },
        {
            id: 'q2',
            text: 'Bạn có lưu ý gì về khẩu vị không?',
            options: [
                { id: 'o5', text: 'Ăn cay', tags: ['spicy'] },
                { id: 'o6', text: 'Không cay', tags: ['non_spicy', 'kids'] },
                { id: 'o7', text: 'Ăn thanh đạm', tags: ['healthy', 'less_oil'] },
                { id: 'o8', text: 'Không hành', tags: ['no_onion'] },
            ]
        }
    ]);

    // ---- Combo Builder State ----
    const [comboSlots, setComboSlots] = useState([
        { id: 's1', name: 'Món Chính', count: 1, items: [1, 2, 4, 5] },
        { id: 's2', name: 'Đồ Uống', count: 2, items: [3, 6, 7] },
    ]);
    const [comboPrice, setComboPrice] = useState('199.000');

    if (!moduleId) return null;

    // ---- HIGHLIGHTS RENDERERS ----
    const renderHighlightsForm = () => (
        <div className="space-y-8">
            {/* New Items Section */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center font-bold italic tracking-tighter">NEW</div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Gợi ý "Món mới phải thử"</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị các món mới ra của nhà hàng</p>
                        </div>
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setNewItemsEnabled(!newItemsEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${newItemsEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-[#1a1a24]'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${newItemsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div className={`transition-opacity ${newItemsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thêm món vào danh sách (Tối đa 4 lựa chọn)</label>
                    <div className="flex gap-2 mb-4">
                        <select className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="">-- Chọn món --</option>
                            {MENU_ITEMS.filter(m => !newItems.includes(m.id)).map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <button className="px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Thêm</button>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đã chọn {newItems.length}/4</span>
                            <button className="text-sm text-slate-500 hover:text-red-500 transition-colors">Xóa tất cả</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                            {newItems.map(id => {
                                const item = MENU_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center px-4 py-3">
                                        <span className="text-slate-800 dark:text-slate-200 font-medium">{item.name}</span>
                                        <button className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Items Section */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center"><Star size={20} fill="currentColor" /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Gợi ý "Top bán chạy"</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Khách hàng đi ăn thường hay hỏi về các món này</p>
                        </div>
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setTopItemsEnabled(!topItemsEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${topItemsEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-[#1a1a24]'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${topItemsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div className={`transition-opacity ${topItemsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thêm món vào danh sách (Tối đa 4 lựa chọn)</label>
                    <div className="flex gap-2 mb-4">
                        <select className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="">-- Chọn món --</option>
                            {MENU_ITEMS.filter(m => !topItems.includes(m.id)).map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <button className="px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Thêm</button>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đã chọn {topItems.length}/4</span>
                            <button className="text-sm text-slate-500 hover:text-red-500 transition-colors">Xóa tất cả</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                            {topItems.map(id => {
                                const item = MENU_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center px-4 py-3">
                                        <span className="text-slate-800 dark:text-slate-200 font-medium">{item.name}</span>
                                        <button className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHighlightsPreview = () => (
        <div className="w-full h-full bg-white dark:bg-[#0f0f13] overflow-y-auto no-scrollbar relative font-sans text-slate-900 dark:text-white">
            {/* Header Mock */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0f0f13] sticky top-0 z-10 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-lg">Biển Đông</div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="flex gap-4 overflow-x-hidden text-sm font-medium border-b border-slate-100 dark:border-white/10 pb-2">
                    <span className="text-orange-500 border-b-2 border-orange-500 pb-2">Món mới</span>
                    <span className="text-slate-500">Top bán chạy</span>
                    <span className="text-slate-500">Đồ uống</span>
                </div>
            </div>

            {/* Món Mới Mock */}
            {newItemsEnabled && (
                <div className="p-4">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Món mới phải thử
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full italic tracking-tighter">NEW</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {newItems.map(id => {
                            const item = MENU_ITEMS.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div key={id} className="bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                                    <div className="w-full h-24 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-400">Hình {item.name}</div>
                                    <div className="p-2.5">
                                        <div className="font-semibold text-[13px] leading-tight mb-1 truncate">{item.name}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-orange-500 font-bold text-xs">{item.price.toLocaleString('vi-VN')}</span>
                                            <button className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Top Bán Chạy Mock */}
            {topItemsEnabled && (
                <div className="p-4 pt-2">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Top bán chạy
                        <span className="text-orange-500"><Star size={18} fill="currentColor" /></span>
                    </h4>
                    <div className="flex flex-col gap-3">
                        {topItems.map(id => {
                            const item = MENU_ITEMS.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div key={id} className="bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-xl flex overflow-hidden shadow-sm p-2 gap-3">
                                    <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-zinc-800 flex shrink-0 items-center justify-center text-xs text-slate-400">Hình {item.name}</div>
                                    <div className="flex-1 py-1 flex flex-col justify-between">
                                        <div>
                                            <div className="font-semibold text-sm leading-tight">{item.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">Món ăn thơm ngon, bổ dưỡng...</div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-orange-500 font-bold text-sm">{item.price.toLocaleString('vi-VN')}</span>
                                            <button className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    // ---- SUGGESTIONS RENDERERS ----
    const renderSuggestionsForm = () => (
        <div className="space-y-8">
            {/* Cross-Sell Section */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 flex items-center justify-center"><Zap size={20} fill="currentColor" /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Gợi ý dựa trên món khách vừa gọi</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị popup nhắc mua thêm món hợp vị</p>
                        </div>
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setCrossSellEnabled(!crossSellEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${crossSellEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-[#1a1a24]'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${crossSellEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div className={`transition-opacity ${crossSellEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-6 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Món khách chọn</label>
                            <select
                                value={selectedTrigger}
                                onChange={(e) => setSelectedTrigger(Number(e.target.value))}
                                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">--- Chọn món ---</option>
                                {MENU_ITEMS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="shrink-0 flex items-center justify-center pb-2 hidden sm:flex">
                            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                Gợi ý <ChevronRight size={14} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Món gợi ý ăn cùng</label>
                            <select
                                value={selectedSuggestion}
                                onChange={(e) => setSelectedSuggestion(Number(e.target.value))}
                                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">--- Chọn món ---</option>
                                {MENU_ITEMS.filter(m => m.id !== selectedTrigger).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 h-[38px] sm:self-end mt-2 sm:mt-0"
                            disabled={!selectedTrigger || !selectedSuggestion}
                            onClick={() => {
                                if (selectedTrigger && selectedSuggestion) {
                                    setCrossSellRules(prev => {
                                        const current = prev[Number(selectedTrigger)] || [];
                                        if (!current.includes(Number(selectedSuggestion))) {
                                            return { ...prev, [Number(selectedTrigger)]: [...current, Number(selectedSuggestion)] };
                                        }
                                        return prev;
                                    })
                                }
                            }}
                        >
                            Thêm
                        </button>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Danh sách các quy tắc</span>
                            <button className="text-sm text-slate-500 hover:text-red-500 transition-colors">Xóa tất cả</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                            {Object.entries(crossSellRules).map(([triggerId, suggestions]) => {
                                const triggerItem = MENU_ITEMS.find(i => i.id === Number(triggerId));
                                if (!triggerItem) return null;
                                return (
                                    <div key={triggerId} className="px-4 py-4 flex gap-4 items-start">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase text-sm tracking-tight">{triggerItem.name}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map(sId => {
                                                    const sItem = MENU_ITEMS.find(i => i.id === sId);
                                                    return (
                                                        <div key={sId} className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-none flex items-center gap-1.5">
                                                            {sItem?.name}
                                                            <button
                                                                className="text-slate-400 hover:text-red-500"
                                                                onClick={() => {
                                                                    setCrossSellRules(prev => {
                                                                        const filtered = prev[Number(triggerId)].filter(id => id !== sId);
                                                                        if (filtered.length === 0) {
                                                                            const copy = { ...prev };
                                                                            delete copy[Number(triggerId)];
                                                                            return copy;
                                                                        }
                                                                        return { ...prev, [Number(triggerId)]: filtered };
                                                                    })
                                                                }}
                                                            ><X size={12} /></button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <button
                                            className="text-slate-400 hover:text-red-500 p-2"
                                            onClick={() => {
                                                setCrossSellRules(prev => {
                                                    const copy = { ...prev };
                                                    delete copy[Number(triggerId)];
                                                    return copy;
                                                })
                                            }}
                                        ><Trash2 size={16} /></button>
                                    </div>
                                )
                            })}
                            {Object.keys(crossSellRules).length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">Chưa có quy tắc nào</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* UPSELL Section */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center"><ShoppingBag size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Gợi ý các món ăn thêm</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị các món gợi ý dưới đáy màn hình giỏ hàng</p>
                        </div>
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setUpsellEnabled(!upsellEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${upsellEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-[#1a1a24]'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${upsellEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div className={`transition-opacity ${upsellEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thêm món vào danh mục (Gợi ý đồ uống, tráng miệng...)</label>
                    <div className="flex gap-2 mb-4">
                        <select className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="">-- Chọn món --</option>
                            {MENU_ITEMS.filter(m => !upsellItems.includes(m.id)).map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <button className="px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Thêm</button>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đã chọn {upsellItems.length}/4</span>
                            <button className="text-sm text-slate-500 hover:text-red-500 transition-colors">Xóa tất cả</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent flex flex-wrap p-4 gap-2">
                            {upsellItems.map(id => {
                                const item = MENU_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 flex items-center gap-2 text-sm">
                                        <span>{item.name}</span>
                                        <button className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSuggestionsPreview = () => (
        <div className="w-full h-full bg-slate-50 dark:bg-[#0f0f13] overflow-y-auto no-scrollbar relative font-sans text-slate-900 dark:text-white">
            {crossSellEnabled && (
                <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1a1a24] rounded-2xl w-full max-w-[280px] overflow-hidden shadow-2xl scale-100 opacity-100">
                        <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-white/10">
                            <h4 className="font-bold text-[15px] leading-tight text-slate-900 dark:text-white">
                                Gợi ý món hay được ăn cùng <br /><span className="text-blue-600 dark:text-blue-400">"Bò hầm ngũ quả"</span>
                            </h4>
                            <button className="text-slate-400 self-start"><X size={16} /></button>
                        </div>
                        <div className="p-3 bg-slate-50/50 dark:bg-black/20 text-[11px] text-slate-500 text-center font-medium border-b border-slate-100 dark:border-white/5">
                            Đa số khách hàng yêu thích ăn cùng những món này
                        </div>
                        <div className="p-3 flex flex-col gap-3">
                            {[2, 3, 4].map(id => {
                                const item = MENU_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 flex shrink-0 items-center justify-center text-[10px] text-slate-400">Hình</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-[13px]">{item.name}</div>
                                            <div className="text-orange-500 font-bold text-xs mt-0.5">{item.price.toLocaleString('vi-VN')}</div>
                                        </div>
                                        <button className="px-3 py-1.5 bg-orange-100 text-orange-600 dark:bg-orange-500/20 rounded-lg text-xs font-bold leading-none">
                                            Chọn món
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {upsellEnabled && !crossSellEnabled && (
                <div className="flex flex-col h-full bg-slate-100 dark:bg-black/50">
                    <div className="p-4 pt-12 text-center text-slate-500 font-medium">-- Màn hình Giỏ Hàng --</div>
                    <div className="flex-1" />
                    <div className="bg-white dark:bg-[#1a1a24] rounded-t-[24px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 p-3 flex justify-between items-center">
                            <span className="text-green-800 dark:text-green-400 font-bold text-sm tracking-tight text-center w-full">Thêm món này để bữa ăn hoàn hảo hơn</span>
                        </div>
                        <div className="p-3 flex gap-3 overflow-x-auto no-scrollbar">
                            {upsellItems.map(id => {
                                const item = MENU_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="w-[120px] shrink-0 border border-slate-100 dark:border-white/10 rounded-xl p-2 bg-white dark:bg-[#0f0f13]">
                                        <div className="w-full h-[70px] rounded-lg bg-slate-100 dark:bg-zinc-800 mb-2 flex items-center justify-center text-[10px] text-slate-400">Hình</div>
                                        <div className="font-semibold text-xs leading-tight line-clamp-2 min-h-[30px]">{item.name}</div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-orange-500 font-bold text-xs">{item.price.toLocaleString('vi-VN')}</span>
                                            <button className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ---- GUIDED DISCOVERY RENDERERS ----
    const renderGuidedDiscoveryForm = () => (
        <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center"><Tag size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cấu hình Câu hỏi & Tag Mapper</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Thiết lập luồng hỏi đáp và gắn thẻ (tag) để AI lọc món</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold rounded-xl text-sm hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors">
                        <Plus size={16} /> Thêm Câu Hỏi
                    </button>
                </div>

                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-transparent">
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">Câu {qIndex + 1}: {q.text}</span>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-blue-500 bg-white dark:bg-black/20 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5"><Search size={14} /></button>
                                    <button className="text-slate-400 hover:text-red-500 bg-white dark:bg-black/20 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {q.options.map((opt) => (
                                    <div key={opt.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="w-full sm:w-1/3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Đáp án: <span className="text-slate-900 dark:text-white ml-1">{opt.text}</span>
                                        </div>
                                        <div className="flex-1 flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold shrink-0">Tags:</span>
                                            {opt.tags.map(tag => (
                                                <span key={tag} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
                                                    {tag}
                                                    <X size={10} className="cursor-pointer hover:text-red-500" />
                                                </span>
                                            ))}
                                            <button className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-500 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 mt-4">
                                    <Plus size={16} /> Thêm Đáp Án
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl shrink-0"><Sparkles size={24} className="text-white" /></div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">Cấu hình hệ thống AI</h4>
                        <p className="text-white/80 text-sm leading-relaxed mb-4">Điều chỉnh **System Prompt** để quy định cách xưng hô (VD: "dạ/vâng", "em/anh chị") và phong thái (chuyên nghiệp / gần gũi) của trợ lý.</p>
                        <button className="px-5 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm active:scale-95">
                            Chỉnh sửa System Prompt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGuidedDiscoveryPreview = () => (
        <div className="w-full h-full bg-[#f8f9fa] dark:bg-[#0f0f13] overflow-y-auto no-scrollbar relative font-sans text-slate-900 dark:text-white flex flex-col">
            {/* Header Mock */}
            <div className="p-4 pt-12 pb-6 bg-white dark:bg-[#1a1a24] shrink-0 shadow-sm z-10 rounded-b-3xl">
                <div className="flex justify-between items-center mb-6">
                    <button className="text-slate-400 bg-slate-100 dark:bg-white/5 p-2 rounded-full"><X size={18} /></button>
                    <div className="flex gap-1.5">
                        <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        <div className="w-10 h-1.5 rounded-full bg-blue-500" />
                        <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    </div>
                    <div className="w-9" /> {/* Spacer */}
                </div>

                <div className="flex items-start gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl rounded-tl-none p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                            Tuyệt vời! Bạn có lưu ý gì về <span className="font-bold text-blue-600 dark:text-blue-400">khẩu vị</span> không? Trợ lý sẽ lọc ra các món phù hợp nhất.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-end gap-3 pb-8">
                {questions[1].options.map((opt, i) => (
                    <div key={opt.id} className={`p-4 rounded-2xl shadow-sm border font-semibold text-[15px] flex items-center justify-between transition-all ${i === 1 ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-[#1a1a24] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-blue-300 cursor-pointer'}`}>
                        <span>{opt.text}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${i === 1 ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-zinc-600'}`}>
                            {i === 1 && <Check size={12} strokeWidth={3} />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-5 pb-8 pt-2 bg-[#f8f9fa] dark:bg-[#0f0f13] shrink-0">
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                    Tiếp tục <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    // ---- COMBO BUILDER RENDERERS ----
    const renderComboBuilderForm = () => (
        <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center"><Layers size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cấu hình hệ thống Combo</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Thiết lập các nhóm tùy chọn (slots) để khách tự chọn món</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold rounded-xl text-sm hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors">
                        <Plus size={16} /> Thêm Nhóm Chọn
                    </button>
                </div>

                <div className="space-y-6">
                    {comboSlots.map((slot, index) => (
                        <div key={slot.id} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-transparent">
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">Nhóm {index + 1}: {slot.name}</div>
                                    <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Khách chọn {slot.count} món</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-red-500 bg-white dark:bg-black/20 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex gap-2">
                                    <select className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                                        <option value="">-- Chọn món để thêm --</option>
                                        {MENU_ITEMS.filter(m => !slot.items.includes(m.id)).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    <button className="px-5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Thêm</button>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    {slot.items.map(itemId => {
                                        const item = MENU_ITEMS.find(m => m.id === itemId);
                                        if (!item) return null;
                                        return (
                                            <div key={itemId} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2">
                                                {item.name}
                                                <button className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                        )
                                    })}
                                    {slot.items.length === 0 && <span className="text-sm text-slate-400 italic">Chưa có món nào trong nhóm này</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cấu hình Giá Combo</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Giá bán trọn bộ</label>
                        <div className="relative">
                            <input type="text" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-lg" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</span>
                        </div>
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Giá gốc tham khảo</label>
                        <div className="relative">
                            <input type="text" disabled value="250.000" className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 text-slate-400 dark:text-slate-500 outline-none font-bold text-lg line-through" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderComboBuilderPreview = () => (
        <div className="w-full h-full bg-slate-50 dark:bg-[#0f0f13] overflow-y-auto no-scrollbar relative font-sans text-slate-900 dark:text-white flex flex-col pt-12">
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-b-[40px] shadow-lg" />

            <div className="relative z-10 px-4 flex justify-between items-center mb-6 text-white">
                <button className="bg-black/20 backdrop-blur-md p-2 rounded-full"><X size={20} /></button>
                <div className="font-bold text-lg tracking-tight shadow-black/10 drop-shadow-md">Thiết lập Combo</div>
                <div className="w-10"></div>
            </div>

            <div className="relative z-10 flex-1 px-4 flex flex-col gap-6 pb-24">
                <div className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5 backdrop-blur-xl">
                    <div className="h-32 bg-orange-100 flex items-center justify-center text-orange-900/50 text-sm font-bold tracking-widest uppercase">
                        Ảnh / Banner Combo
                    </div>
                    <div className="p-4">
                        <div className="flex gap-2 items-center mb-1">
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Combo Tiết Kiệm</span>
                            <span className="text-xs text-slate-500 font-medium">Đủ cho 2 người</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">Combo Hẹn Hò Siêu Đỉnh</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-orange-600">{comboPrice}đ</span>
                            <span className="text-sm text-slate-400 line-through font-semibold">250.000đ</span>
                        </div>
                    </div>
                </div>

                {comboSlots.map((slot, sIdx) => (
                    <div key={slot.id} className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-white/5 px-4 py-3 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{sIdx + 1}. {slot.name}</h4>
                                <p className="text-[11px] text-slate-500">Vui lòng chọn {slot.count} món</p>
                            </div>
                            <span className="bg-slate-200 dark:bg-black/40 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-lg">Bắt buộc</span>
                        </div>
                        <div className="p-3 flex flex-col gap-3">
                            {slot.items.slice(0, 3).map((itemId, i) => {
                                const item = MENU_ITEMS.find(m => m.id === itemId);
                                if (!item) return null;
                                return (
                                    <div key={itemId} className={`flex gap-3 items-center p-2 rounded-xl border-2 transition-all ${i === 0 ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-bold text-[14px] leading-tight text-slate-900 dark:text-white">{item.name}</div>
                                            {i === 1 && <div className="text-orange-500 font-bold text-xs mt-0.5">+ 20.000đ</div>}
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${i === 0 ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-zinc-600'}`}>
                                            {i === 0 && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 bg-white/80 dark:bg-[#1a1a24]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10 z-20">
                <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[16px] shadow-lg shadow-orange-500/30 flex items-center justify-between px-6">
                    <span>Thêm vào giỏ hàng</span>
                    <span>{comboPrice}đ</span>
                </button>
            </div>
        </div>
    );

    const renderConfigForm = () => {
        switch (moduleId) {
            case 'smart-suggestions':
                return renderSuggestionsForm();
            case 'highlight-categories':
                return renderHighlightsForm();
            case 'guided-discovery':
                return renderGuidedDiscoveryForm();
            case 'value-combos':
                return renderComboBuilderForm();
            // ... (other cases)
            default:
                return <div className="text-slate-500">Đang triển khai cấu hình cho {moduleId}...</div>;
        }
    };

    const renderPreview = () => {
        let content;
        switch (moduleId) {
            case 'smart-suggestions':
                content = renderSuggestionsPreview();
                break;
            case 'highlight-categories':
                content = renderHighlightsPreview();
                break;
            case 'guided-discovery':
                content = renderGuidedDiscoveryPreview();
                break;
            case 'value-combos':
                content = renderComboBuilderPreview();
                break;
            // ... (other cases)
            default:
                content = <div className="text-slate-400">Preview cho {moduleId}</div>;
        }

        return (
            <div className="bg-slate-100/50 dark:bg-[#0a0a0f] rounded-[2rem] p-8 flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-inner h-[600px] relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 relative z-10 bg-white dark:bg-[#1a1a24] px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-slate-200/50 dark:border-white/5">
                    <Smartphone size={14} className="text-blue-500" /> Bản xem trước (Live Preview)
                </p>
                {/* iPhone Mockup Frame */}
                <div className="w-[300px] bg-white dark:bg-[#0f0f13] shadow-2xl flex flex-col h-[550px] overflow-hidden transition-all duration-300 border-[10px] border-slate-300 dark:border-zinc-800 relative rounded-[3rem]">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-300 dark:bg-zinc-800 rounded-b-2xl z-50 shadow-sm" />
                    {/* Screen Content */}
                    <div className="flex-1 w-full relative z-0">
                        {content}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity ${moduleId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[85vw] lg:w-[75vw] xl:w-[1200px] bg-slate-50 dark:bg-[#050510] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-white/10 ${moduleId ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#050510]/80 backdrop-blur-xl shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Cấu Hình Chuyên Sâu
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                            Module ID: {moduleId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - 2 Columns */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Column 1: Config Form */}
                    <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-8 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                        {renderConfigForm()}
                    </div>

                    {/* Column 2: Live Preview */}
                    <div className="w-full lg:w-[45%] xl:w-1/2 p-4 sm:p-8 overflow-y-auto bg-white dark:bg-[#050510] border-l border-slate-100 dark:border-white/5">
                        {renderPreview()}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050510] shrink-0 flex justify-end gap-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={() => {
                            alert('Đã lưu cấu hình!');
                            onClose();
                        }}
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                        <Check size={18} />
                        Lưu Thay Đổi
                    </button>
                </div>
            </div>
        </>
    );
}

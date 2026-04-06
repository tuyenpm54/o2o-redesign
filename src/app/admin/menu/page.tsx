'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    UtensilsCrossed, Search, ChevronDown, ChevronRight, Lock, Wifi,
    WifiOff, RefreshCw, Save, CheckCircle2, AlertTriangle, Clock,
    AlertCircle, Settings2, LayoutList, XCircle, X, Tags, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ALL_SYNC_FIELDS: Array<{ key: string; label: string; description: string }> = [
    { key: 'price', label: 'Giá bán', description: 'Đồng bộ giá từ POS, field sẽ bị khoá trên O2O' },
    { key: 'img', label: 'Ảnh món', description: 'URL ảnh sẽ được cập nhật từ POS' },
    { key: 'desc', label: 'Mô tả', description: 'Nội dung mô tả món từ POS' },
    { key: 'status', label: 'Trạng thái', description: 'Best Seller, Trending, v.v.' },
    { key: 'tags', label: 'Tags phân loại', description: 'Đậm đà, Hải sản, Healthy...' },
    { key: 'kidsFriendly', label: 'Phù hợp trẻ em', description: 'Boolean từ POS' },
    { key: 'seafood', label: 'Có hải sản', description: 'Boolean từ POS' },
    { key: 'onionFree', label: 'Không hành/tỏi', description: 'Boolean từ POS' },
];

function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        'Best Seller': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
        'Trending': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
        'Chef Pick': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        'New Arrival': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        'Healthy': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        'Vegan': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    };
    const cls = colorMap[status] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{status}</span>;
}

// Fix 4: Single consolidated lock badge per row
function LockedFieldsBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold shrink-0">
            <Lock size={9} /> {count} POS
        </span>
    );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); !disabled && onChange(!checked); }}
            disabled={disabled}
            className={`relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </button>
    );
}

interface MenuItem {
    id: number;
    name: string;
    price: number;
    img: string;
    desc: string;
    tags: string[];
    status: string;
    category: string;
    isActive: boolean;
    lockedFields: string[];
}

// Fix 5: Proper skeleton matching real layout
function MenuSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
                    {/* Category header skeleton */}
                    <div className="flex items-center gap-3 px-5 py-3">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-white/10 animate-pulse rounded" />
                        <div className="h-4 w-12 bg-slate-50 dark:bg-white/5 animate-pulse rounded-full" />
                    </div>
                    {/* Item rows skeleton */}
                    <div className="border-t border-slate-100 dark:border-white/5">
                        {[1, 2, 3, 4].map(j => (
                            <div key={j} className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-50 dark:border-white/[0.03] first:border-0">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-100 dark:bg-white/5 animate-pulse rounded w-2/5" />
                                    <div className="h-2.5 bg-slate-50 dark:bg-white/[0.03] animate-pulse rounded w-3/5" />
                                    <div className="flex gap-1">
                                        <div className="h-4 w-14 bg-slate-50 dark:bg-white/[0.03] animate-pulse rounded-full" />
                                        <div className="h-4 w-12 bg-slate-50 dark:bg-white/[0.03] animate-pulse rounded-full" />
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-slate-100 dark:bg-white/5 animate-pulse rounded-full shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminMenuPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [savingItemId, setSavingItemId] = useState<number | null>(null);

    // Fix 9: POS Sync is now a settings panel, not a peer tab
    const [showPosPanel, setShowPosPanel] = useState(false);

    // POS Config state
    const [posConfig, setPosConfig] = useState({ enabled: false, syncFields: [] as string[], lastSync: null as string | null });
    const [isSavingPOS, setIsSavingPOS] = useState(false);
    const [posSaveMsg, setPosSaveMsg] = useState('');
    // Fix 6: POS error state
    const [posError, setPosError] = useState(false);
    const [menuError, setMenuError] = useState(false);

    // Filter state
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [tagSearchQuery, setTagSearchQuery] = useState('');

    // Edit Item Modal State
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setMenuError(false);
        setPosError(false);
        try {
            const currentResId = user?.restaurant_id || '100'; // Fallback to 100 for safety if not linked
            const [menuRes, posRes] = await Promise.all([
                fetch(`/api/admin/menu?resid=${currentResId}`),
                fetch(`/api/admin/menu/pos-sync?resid=${currentResId}`),
            ]);
            const menuData = await menuRes.json();

            if (menuData.success) {
                const fetchedItems = menuData.data.items || [];
                setItems(fetchedItems);
                setCategories(menuData.data.categories || []);
                setExpandedCategories(new Set(menuData.data.categories || []));

                // Extract unique tags
                const tagsSet = new Set<string>();
                fetchedItems.forEach((it: MenuItem) => (it.tags || []).forEach(t => tagsSet.add(t)));
                setAvailableTags(Array.from(tagsSet).sort());
            } else {
                setMenuError(true);
            }

            // Handle POS separately — failure shouldn't break menu list
            try {
                const posData = await posRes.json();
                if (posData.success) {
                    setPosConfig({
                        enabled: posData.data?.enabled ?? false,
                        syncFields: posData.data?.syncFields ?? [],
                        lastSync: posData.data?.lastSync ?? null,
                    });
                } else {
                    setPosError(true);
                }
            } catch {
                setPosError(true);
            }
        } catch (e) {
            console.error('Fetch failed', e);
            setMenuError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleItem = async (itemId: number, isActive: boolean) => {
        setSavingItemId(itemId);
        setItems(prev => prev.map(it => it.id === itemId ? { ...it, isActive } : it));
        try {
            const currentResId = user?.restaurant_id || '100';
            await fetch('/api/admin/menu', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resid: currentResId, itemId, isActive }),
            });
        } catch {}
        setSavingItemId(null);
    };

    const handleUpdateItem = async (updatedFields: Partial<MenuItem>) => {
        if (!editingItem) return;
        setIsUpdating(true);
        try {
            const currentResId = user?.restaurant_id || '100';
            const res = await fetch('/api/admin/menu', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resid: currentResId, itemId: editingItem.id, ...updatedFields }),
            });
            if (res.ok) {
                setItems(prev => prev.map(it => it.id === editingItem.id ? { ...it, ...updatedFields } : it));
                setEditingItem(null);
            }
        } catch (e) {
            console.error('Update failed', e);
        } finally {
            setIsUpdating(false);
        }
    };

    const savePosConfig = async () => {
        setIsSavingPOS(true);
        try {
            const currentResId = user?.restaurant_id || '100';
            await fetch('/api/admin/menu/pos-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resid: currentResId, ...posConfig }),
            });
            setPosSaveMsg('Đã lưu cấu hình POS!');
            setTimeout(() => setPosSaveMsg(''), 3000);
        } catch {}
        setIsSavingPOS(false);
    };

    const filteredItems = items.filter(item => {
        const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? item.isActive : !item.isActive);
        const matchTags = selectedTags.length === 0 || selectedTags.every(t => item.tags?.includes(t));
        return matchSearch && matchStatus && matchTags;
    });

    const groupedItems = categories.reduce((acc, cat) => {
        acc[cat] = filteredItems.filter(i => i.category === cat);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const activeCount = items.filter(i => i.isActive).length;

    // Fix 3: Check global empty state
    const hasAnyResults = filteredItems.length > 0;

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#050510]">
            {/* Header */}
            <div className="p-6 pb-0 border-b border-slate-200/60 dark:border-white/[0.05] bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <UtensilsCrossed size={26} className="text-blue-600" />
                                Thực đơn Nhà hàng
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {activeCount}/{items.length} món đang bán trên kênh O2O
                                {posConfig.enabled && (
                                    <span className="ml-3 inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                                        <Wifi size={13} /> POS Sync Đang Bật
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Fix 9: POS Sync as settings button */}
                            <button
                                onClick={() => setShowPosPanel(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <Settings2 size={15} />
                                POS Sync
                                {posConfig.enabled && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                            </button>
                            <button onClick={fetchData} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors cursor-pointer">
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Single tab bar (no POS tab) */}
                    <div className="flex gap-1">
                        <div className="px-5 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-[#050510] border-b-2 border-blue-600">
                            Danh sách Thực đơn
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 space-y-5">

                    {/* Fix 2: Filter bar with Lucide icons, no emoji */}
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm theo tên món..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                            {(['all', 'active', 'inactive'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                                >
                                    {s === 'all'
                                        ? <><LayoutList size={12} /> Tất cả</>
                                        : s === 'active'
                                            ? <><CheckCircle2 size={12} className={filterStatus === 'active' ? 'text-white' : 'text-green-500'} /> Đang bán</>
                                            : <><XCircle size={12} className={filterStatus === 'inactive' ? 'text-white' : 'text-red-400'} /> Tắt</>
                                    }
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tag Filter Bar - Proposal B: Searchable Dropdown */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowTagDropdown(!showTagDropdown)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer shadow-sm
                                    ${selectedTags.length > 0 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' 
                                        : 'bg-white border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                            >
                                <Tags size={16} />
                                Lọc theo Tag
                                {selectedTags.length > 0 && <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">{selectedTags.length}</span>}
                                <ChevronDown size={14} className={`transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Tag Dropdown Popover */}
                            {showTagDropdown && (
                                <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowTagDropdown(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0c0c1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    autoFocus
                                                    value={tagSearchQuery}
                                                    onChange={e => setTagSearchQuery(e.target.value)}
                                                    placeholder="Tìm tag..."
                                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
                                            {availableTags
                                                .filter(t => !tagSearchQuery || t.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                                                .map(tag => {
                                                    const isSelected = selectedTags.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => setSelectedTags(prev => isSelected ? prev.filter(t => t !== tag) : [...prev, tag])}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                                                ${isSelected 
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            {tag}
                                                            {isSelected && <Check size={14} className="text-blue-600" />}
                                                        </button>
                                                    );
                                                })}
                                        </div>

                                        <div className="p-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                            <button
                                                onClick={() => { setSelectedTags([]); setShowTagDropdown(false); }}
                                                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                Xóa tất cả bộ lọc
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Active Tag Chips (Secondary visibility) */}
                        <div className="flex flex-wrap gap-1.5 ml-1">
                            {selectedTags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/5 group">
                                    {tag}
                                    <button 
                                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} 
                                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Menu error state */}
                    {menuError && !isLoading && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            Không thể tải thực đơn. Kiểm tra kết nối mạng.
                            <button onClick={fetchData} className="ml-auto font-semibold underline cursor-pointer">Thử lại</button>
                        </div>
                    )}

                    {/* Fix 5: Proper skeleton */}
                    {isLoading ? (
                        <MenuSkeleton />
                    ) : (
                        <>
                            {/* Fix 3: Global empty state */}
                            {!hasAnyResults && searchQuery && (
                                <div className="flex flex-col items-center gap-3 py-16 text-center">
                                    <Search size={36} className="text-slate-200 dark:text-white/10" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Không tìm thấy <strong className="text-slate-700 dark:text-slate-200">"{searchQuery}"</strong>
                                    </p>
                                    <p className="text-sm text-slate-400">Thử tìm tên khác hoặc xóa bộ lọc</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                                        className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                                    >
                                        Xóa tìm kiếm
                                    </button>
                                </div>
                            )}

                            {!hasAnyResults && !searchQuery && filterStatus !== 'all' && (
                                <div className="flex flex-col items-center gap-3 py-16 text-center">
                                    <XCircle size={36} className="text-slate-200 dark:text-white/10" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Không có món nào {filterStatus === 'inactive' ? 'đang tắt' : 'đang bán'}
                                    </p>
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                            )}

                            {hasAnyResults && (
                                <div className="space-y-4">
                                    {categories.map(cat => {
                                        const catItems = groupedItems[cat] || [];
                                        if (catItems.length === 0) return null;
                                        const isExpanded = expandedCategories.has(cat);
                                        const activeCatCount = catItems.filter(i => i.isActive).length;

                                        return (
                                            <div key={cat} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm">
                                                {/* Category Header - Fix 8: compact py-3 */}
                                                <button
                                                    onClick={() => setExpandedCategories(prev => {
                                                        const next = new Set(prev);
                                                        isExpanded ? next.delete(cat) : next.add(cat);
                                                        return next;
                                                    })}
                                                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isExpanded
                                                            ? <ChevronDown size={17} className="text-blue-600" />
                                                            : <ChevronRight size={17} className="text-slate-400" />
                                                        }
                                                        <span className="font-bold text-slate-800 dark:text-slate-100">{cat}</span>
                                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-full text-xs font-semibold">
                                                            {catItems.length} món
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            ({activeCatCount} đang bán)
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Items */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 dark:border-white/5">
                                                        {catItems.map((item, idx) => (
                                                            // Fix 1: Entire row is clickable + hover state
                                                            <div
                                                                key={item.id}
                                                                onClick={() => setEditingItem(item)}
                                                                className={`flex items-center gap-4 px-5 py-2.5 transition-colors cursor-pointer group
                                                                    hover:bg-blue-50/50 dark:hover:bg-blue-500/[0.04]
                                                                    ${idx !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}
                                                                    ${!item.isActive ? 'opacity-50' : ''}`}
                                                            >
                                                                {/* Image - Fix 8: compact w-11 h-11 */}
                                                                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/10">
                                                                    {item.img ? (
                                                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                            <UtensilsCrossed size={20} />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                                                                            {item.name}
                                                                        </h3>
                                                                        <StatusBadge status={item.status} />
                                                                        {/* Fix 4: Single consolidated lock badge */}
                                                                        <LockedFieldsBadge count={item.lockedFields?.length ?? 0} />
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-0.5">
                                                                        <span className="text-sm font-bold text-orange-600">
                                                                            {item.price.toLocaleString('vi-VN')}đ
                                                                        </span>
                                                                        <span className="text-xs text-slate-400 truncate max-w-[260px]">{item.desc}</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {item.tags?.slice(0, 3).map((tag: string) => (
                                                                            <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-full text-[10px]">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Fix 7: Toggle with inline label */}
                                                                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                                    {savingItemId === item.id && (
                                                                        <RefreshCw size={13} className="animate-spin text-blue-500" />
                                                                    )}
                                                                    <span className="text-xs font-medium w-14 text-right text-slate-400">
                                                                        {item.isActive ? 'Đang bán' : 'Tắt'}
                                                                    </span>
                                                                    <Toggle
                                                                        checked={item.isActive}
                                                                        onChange={(v) => toggleItem(item.id, v)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Fix 9: POS Settings Slide-over Panel */}
            {showPosPanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setShowPosPanel(false)}
                    />
                    {/* Panel */}
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0c0c1a] border-l border-slate-200 dark:border-white/10 z-50 flex flex-col shadow-2xl">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/[0.06]">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                                    <Settings2 size={18} className="text-blue-600" />
                                    Cấu hình POS Sync
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">Đồng bộ dữ liệu từ hệ thống POS</p>
                            </div>
                            <button
                                onClick={() => setShowPosPanel(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Fix 6: POS Error state */}
                            {posError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                                    <AlertCircle size={16} className="shrink-0" />
                                    Không thể tải cấu hình POS.
                                    <button onClick={fetchData} className="ml-auto font-semibold underline cursor-pointer">Thử lại</button>
                                </div>
                            )}

                            {/* Master Toggle */}
                            <div className={`rounded-2xl border p-5 flex items-start justify-between gap-6 transition-all ${posConfig.enabled ? 'border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {posConfig.enabled ? <Wifi size={18} className="text-green-600" /> : <WifiOff size={18} className="text-slate-400" />}
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Tích hợp POS</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {posConfig.enabled
                                            ? 'POS đang được kết nối. Các field được chọn sẽ bị khoá trên Admin UI và chỉ cập nhật qua POS.'
                                            : 'Bật để nhận đồng bộ tự động từ hệ thống POS của nhà hàng.'}
                                    </p>
                                    {posConfig.lastSync && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                                            <Clock size={12} />
                                            Lần sync cuối: {new Date(posConfig.lastSync).toLocaleString('vi-VN')}
                                        </div>
                                    )}
                                </div>
                                <Toggle
                                    checked={posConfig.enabled}
                                    onChange={v => setPosConfig(p => ({ ...p, enabled: v }))}
                                />
                            </div>

                            {/* Webhook URL */}
                            {posConfig.enabled && (
                                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Webhook URL</h4>
                                    <p className="text-xs text-slate-500 mb-3">Cung cấp URL này cho nhà cung cấp POS để họ push dữ liệu vào O2O.</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-black/30 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-mono select-all overflow-x-auto">
                                            {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/admin/menu/pos-sync/push
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/admin/menu/pos-sync/push`)}
                                            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Sync Fields */}
                            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-white/5">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">Field đồng bộ từ POS</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Field được chọn sẽ <strong className="text-amber-600 dark:text-amber-400">khoá vĩnh viễn</strong> trên Admin — chỉ POS mới được cập nhật.
                                    </p>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {ALL_SYNC_FIELDS.map(field => {
                                        const isChecked = (posConfig.syncFields ?? []).includes(field.key);
                                        return (
                                            <label key={field.key} className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${isChecked ? 'bg-amber-50/60 dark:bg-amber-500/5' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    {isChecked
                                                        ? <Lock size={14} className="text-amber-500 shrink-0" />
                                                        : <div className="w-[14px]" />
                                                    }
                                                    <div>
                                                        <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{field.label}</span>
                                                        <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={e => {
                                                        const fields = e.target.checked
                                                            ? [...posConfig.syncFields, field.key]
                                                            : posConfig.syncFields.filter(f => f !== field.key);
                                                        setPosConfig(p => ({ ...p, syncFields: fields }));
                                                    }}
                                                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Warning */}
                            {posConfig.syncFields.length > 0 && (
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-200">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <span>Các field: <strong>{posConfig.syncFields.map(f => ALL_SYNC_FIELDS.find(a => a.key === f)?.label).join(', ')}</strong> sẽ bị khoá trên giao diện Admin và chỉ cập nhật khi POS đẩy về.</span>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-4">
                            <button
                                onClick={savePosConfig}
                                disabled={isSavingPOS}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <Save size={16} />
                                {isSavingPOS ? 'Đang lưu...' : 'Lưu cấu hình'}
                            </button>
                            {posSaveMsg && (
                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm">
                                    <CheckCircle2 size={16} /> {posSaveMsg}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <EditModal
                    item={editingItem}
                    availableTags={availableTags}
                    onClose={() => setEditingItem(null)}
                    onSave={handleUpdateItem}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}

function EditModal({ item, availableTags, onClose, onSave, isUpdating }: { item: MenuItem; availableTags: string[]; onClose: () => void; onSave: (fields: Partial<MenuItem>) => void; isUpdating: boolean }) {
    const [form, setForm] = useState({
        name: item.name,
        price: item.price,
        desc: item.desc,
        status: item.status,
    });
    const [selectedTags, setSelectedTags] = useState<string[]>(item.tags || []);
    const [newTagInput, setNewTagInput] = useState('');

    const isLocked = (field: string) => item.lockedFields?.includes(field);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...form,
            price: Number(form.price),
            tags: selectedTags
        });
    };

    const addTag = (tag: string) => {
        const t = tag.trim();
        if (t && !selectedTags.includes(t)) {
            setSelectedTags(prev => [...prev, t]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0c0c1a] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Settings2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết món ăn</h2>
                                <p className="text-xs text-slate-400">ID: #{item.id}</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    Tên món {isLocked('name') && <Lock size={10} className="text-amber-500" />}
                                </label>
                                <input
                                    value={form.name}
                                    disabled={isLocked('name')}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-60 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    Giá bán {isLocked('price') && <Lock size={10} className="text-amber-500" />}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.price}
                                        disabled={isLocked('price')}
                                        onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold disabled:opacity-60 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">đ</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    Nhãn trạng thái {isLocked('status') && <Lock size={10} className="text-amber-500" />}
                                </label>
                                <select
                                    value={form.status}
                                    disabled={isLocked('status')}
                                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-60 appearance-none outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Không có</option>
                                    <option value="Best Seller">Best Seller</option>
                                    <option value="Trending">Trending</option>
                                    <option value="Chef Pick">Chef Pick</option>
                                    <option value="Healthy">Healthy</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="New Arrival">New Arrival</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                Mô tả ngắn {isLocked('desc') && <Lock size={10} className="text-amber-500" />}
                            </label>
                            <textarea
                                rows={2}
                                value={form.desc}
                                disabled={isLocked('desc')}
                                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-60 resize-none outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                Tags phân loại {isLocked('tags') && <Lock size={10} className="text-amber-500" />}
                            </label>
                            <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
                                {/* Selected Pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedTags.length === 0 ? (
                                        <span className="text-xs text-slate-400 italic">Chưa chọn tag nào...</span>
                                    ) : (
                                        selectedTags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg text-xs font-bold ring-1 ring-blue-500/20 border border-blue-200/50 dark:border-blue-500/30">
                                                {tag}
                                                {!isLocked('tags') && (
                                                    <button type="button" onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-500 transition-colors cursor-pointer">
                                                        <X size={10} />
                                                    </button>
                                                )}
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* Suggestion List */}
                                {!isLocked('tags') && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {availableTags
                                                .filter(t => !selectedTags.includes(t))
                                                .slice(0, 10)
                                                .map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => addTag(tag)}
                                                        className="px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                        </div>

                                        {/* Create New Tag */}
                                        <div className="flex gap-2">
                                            <input
                                                value={newTagInput}
                                                onChange={e => setNewTagInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag(newTagInput);
                                                        setNewTagInput('');
                                                    }
                                                }}
                                                placeholder="Thêm tag mới..."
                                                className="flex-1 px-3 py-1.5 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { addTag(newTagInput); setNewTagInput(''); }}
                                                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-bold hover:opacity-80 transition-opacity cursor-pointer"
                                            >
                                                Thêm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Save size={16} />
                            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

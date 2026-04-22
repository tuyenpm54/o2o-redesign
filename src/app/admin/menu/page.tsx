'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    UtensilsCrossed, Search, ChevronDown, ChevronRight, Lock, Wifi,
    WifiOff, RefreshCw, Save, CheckCircle2, AlertTriangle, Clock,
    AlertCircle, Settings2, LayoutList, XCircle, X, Tags, Check,
    GripVertical, ArrowUp, ArrowDown, Pencil, Package, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Constants ───────────────────────────────────────────────

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

const STATUS_OPTIONS = [
    { value: '', label: 'Không có' },
    { value: 'Best Seller', label: 'Best Seller' },
    { value: 'Trending', label: 'Trending' },
    { value: 'Chef Pick', label: 'Chef Pick' },
    { value: 'New Arrival', label: 'New Arrival' },
    { value: 'Healthy', label: 'Healthy' },
    { value: 'Vegan', label: 'Vegan' },
];

// ─── Types ───────────────────────────────────────────────────

interface MenuItem {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    img: string;
    desc: string;
    tags: string[];
    status: string;
    category: string;
    isActive: boolean;
    lockedFields: string[];
}

type TabId = 'menu' | 'categories' | 'combos';

// ─── Small Components ────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        'Best Seller': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
        'Trending': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
        'Chef Pick': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        'New Arrival': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        'Healthy': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        'Vegan': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    };
    if (!status) return null;
    const cls = colorMap[status] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{status}</span>;
}

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
            className={`relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </button>
    );
}

function TabButton({ active, onClick, icon, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; text: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-[#050510]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-b-2 border-transparent'
            }`}
        >
            {icon}
            {text}
        </button>
    );
}

// ─── Skeleton ────────────────────────────────────────────────

function MenuSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-white/10 animate-pulse rounded" />
                        <div className="h-4 w-12 bg-slate-50 dark:bg-white/5 animate-pulse rounded-full" />
                    </div>
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

// ─── Main Component ──────────────────────────────────────────

export default function AdminMenuPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('menu');

    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [savingItemId, setSavingItemId] = useState<number | null>(null);

    const [showPosPanel, setShowPosPanel] = useState(false);
    const [posConfig, setPosConfig] = useState({ enabled: false, syncFields: [] as string[], lastSync: null as string | null });
    const [isSavingPOS, setIsSavingPOS] = useState(false);
    const [posSaveMsg, setPosSaveMsg] = useState('');
    const [posError, setPosError] = useState(false);
    const [menuError, setMenuError] = useState(false);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [tagSearchQuery, setTagSearchQuery] = useState('');

    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Category management state
    const [categoryOrderDirty, setCategoryOrderDirty] = useState(false);
    const [savingCatOrder, setSavingCatOrder] = useState(false);
    const [catOrderSaveMsg, setCatOrderSaveMsg] = useState('');

    const currentResId = user?.restaurant_id || '100';

    // ─── Data Fetching (preserved 1:1) ───────────────────────

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setMenuError(false);
        setPosError(false);
        try {
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

                const tagsSet = new Set<string>();
                fetchedItems.forEach((it: MenuItem) => (it.tags || []).forEach(t => tagsSet.add(t)));
                setAvailableTags(Array.from(tagsSet).sort());
            } else {
                setMenuError(true);
            }

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

    // ─── Item Actions (preserved 1:1) ────────────────────────

    const toggleItem = async (itemId: number, isActive: boolean) => {
        setSavingItemId(itemId);
        setItems(prev => prev.map(it => it.id === itemId ? { ...it, isActive } : it));
        try {
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

    // ─── Category Reorder (NEW) ──────────────────────────────

    const moveCategory = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCategories.length) return;
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
        setCategories(newCategories);
        setCategoryOrderDirty(true);
    };

    const saveCategoryOrder = async () => {
        setSavingCatOrder(true);
        try {
            await fetch('/api/admin/menu', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resid: currentResId, action: 'reorder-categories', categories }),
            });
            setCategoryOrderDirty(false);
            setCatOrderSaveMsg('Đã lưu thứ tự!');
            setTimeout(() => setCatOrderSaveMsg(''), 3000);
        } catch {}
        setSavingCatOrder(false);
    };

    // ─── Derived Data ────────────────────────────────────────

    const menuItems = items.filter(i => i.category !== 'Combo');
    const comboItems = items.filter(i => i.category === 'Combo');
    const menuCategories = categories.filter(c => c !== 'Combo');

    const filteredMenuItems = menuItems.filter(item => {
        const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? item.isActive : !item.isActive);
        const matchTags = selectedTags.length === 0 || selectedTags.every(t => item.tags?.includes(t));
        return matchSearch && matchStatus && matchTags;
    });

    const groupedItems = menuCategories.reduce((acc, cat) => {
        acc[cat] = filteredMenuItems.filter(i => i.category === cat);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const activeMenuCount = menuItems.filter(i => i.isActive).length;
    const activeComboCount = comboItems.filter(i => i.isActive).length;
    const hasAnyResults = filteredMenuItems.length > 0;

    // ─── Render ──────────────────────────────────────────────

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#050510]">
            {/* ═══ Header ═══ */}
            <div className="p-6 pb-0 border-b border-slate-200/60 dark:border-white/[0.05] bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <UtensilsCrossed size={26} className="text-blue-600" />
                                Thực đơn Nhà hàng
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {items.length} món • {categories.length} nhóm • {comboItems.length} combo
                                {posConfig.enabled && (
                                    <span className="ml-3 inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                                        <Wifi size={13} /> POS Sync Đang Bật
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPosPanel(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <Settings2 size={15} />
                                POS Sync
                                {posConfig.enabled && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                            </button>
                            <button onClick={fetchData} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* ═══ Tab Bar (3 real tabs) ═══ */}
                    <div className="flex gap-1">
                        <TabButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} icon={<UtensilsCrossed size={14} />} text={`Thực đơn (${activeMenuCount}/${menuItems.length})`} />
                        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Layers size={14} />} text={`Nhóm món (${categories.length})`} />
                        <TabButton active={activeTab === 'combos'} onClick={() => setActiveTab('combos')} icon={<Package size={14} />} text={`Combo (${activeComboCount}/${comboItems.length})`} />
                    </div>
                </div>
            </div>

            {/* ═══ Body ═══ */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 space-y-5">

                    {/* ─── TAB 1: Thực đơn ─── */}
                    {activeTab === 'menu' && (
                        <>
                            {/* Consolidated filter toolbar (1 line) */}
                            <div className="flex gap-3 items-center flex-wrap">
                                <div className="relative flex-1 min-w-[200px]">
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

                                {/* Status filter */}
                                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                    {(['all', 'active', 'inactive'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterStatus(s)}
                                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
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

                                {/* Tag filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTagDropdown(!showTagDropdown)}
                                        className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                            ${selectedTags.length > 0
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                                                : 'bg-white border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                                    >
                                        <Tags size={14} />
                                        Tag
                                        {selectedTags.length > 0 && <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{selectedTags.length}</span>}
                                        <ChevronDown size={12} className={`transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showTagDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setShowTagDropdown(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0c0c1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden">
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

                                {/* Active tag chips */}
                                {selectedTags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/5">
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

                            {/* Menu error state */}
                            {menuError && !isLoading && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                                    <AlertCircle size={16} className="shrink-0" />
                                    Không thể tải thực đơn. Kiểm tra kết nối mạng.
                                    <button onClick={fetchData} className="ml-auto font-semibold underline cursor-pointer">Thử lại</button>
                                </div>
                            )}

                            {isLoading ? (
                                <MenuSkeleton />
                            ) : (
                                <>
                                    {/* Empty states */}
                                    {!hasAnyResults && searchQuery && (
                                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                                            <Search size={36} className="text-slate-200 dark:text-white/10" />
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Không tìm thấy <strong className="text-slate-700 dark:text-slate-200">&quot;{searchQuery}&quot;</strong>
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
                                            {menuCategories.map(cat => {
                                                const catItems = groupedItems[cat] || [];
                                                if (catItems.length === 0) return null;
                                                const isExpanded = expandedCategories.has(cat);
                                                const activeCatCount = catItems.filter(i => i.isActive).length;

                                                return (
                                                    <div key={cat} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm">
                                                        <button
                                                            onClick={() => setExpandedCategories(prev => {
                                                                const next = new Set(prev);
                                                                isExpanded ? next.delete(cat) : next.add(cat);
                                                                return next;
                                                            })}
                                                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
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

                                                        {isExpanded && (
                                                            <div className="border-t border-slate-100 dark:border-white/5">
                                                                {catItems.map((item, idx) => (
                                                                    <div
                                                                        key={item.id}
                                                                        onClick={() => setEditingItem(item)}
                                                                        className={`flex items-center gap-4 px-5 py-2.5 transition-colors cursor-pointer group
                                                                            hover:bg-blue-50/50 dark:hover:bg-blue-500/[0.04]
                                                                            active:bg-blue-100/50 dark:active:bg-blue-500/[0.08]
                                                                            ${idx !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}
                                                                            ${!item.isActive ? 'opacity-50' : ''}`}
                                                                    >
                                                                        {/* Image */}
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

                                                                        {/* Hover edit indicator */}
                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                            <Pencil size={14} className="text-slate-400" />
                                                                        </div>

                                                                        {/* Toggle */}
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
                        </>
                    )}

                    {/* ─── TAB 2: Nhóm món (Categories) ─── */}
                    {activeTab === 'categories' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quản lý nhóm món</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">Sắp xếp thứ tự hiển thị nhóm món trên menu khách hàng. Kéo lên/xuống để thay đổi.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {catOrderSaveMsg && (
                                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm animate-in fade-in">
                                            <CheckCircle2 size={16} /> {catOrderSaveMsg}
                                        </span>
                                    )}
                                    {categoryOrderDirty && (
                                        <button
                                            onClick={saveCategoryOrder}
                                            disabled={savingCatOrder}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            <Save size={15} />
                                            {savingCatOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-16 bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm">
                                    {categories.map((cat, index) => {
                                        const catItems = items.filter(i => i.category === cat);
                                        const activeInCat = catItems.filter(i => i.isActive).length;
                                        const isFirst = index === 0;
                                        const isLast = index === categories.length - 1;

                                        return (
                                            <div
                                                key={cat}
                                                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] ${index !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}`}
                                            >
                                                {/* Drag handle visual */}
                                                <GripVertical size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />

                                                {/* Order number */}
                                                <span className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                                    {index + 1}
                                                </span>

                                                {/* Category info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{cat}</h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {catItems.length} món • {activeInCat} đang bán
                                                    </p>
                                                </div>

                                                {/* Move buttons */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => moveCategory(index, 'up')}
                                                        disabled={isFirst}
                                                        className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFirst ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white cursor-pointer active:bg-slate-200 dark:active:bg-white/20'}`}
                                                        aria-label={`Di chuyển ${cat} lên`}
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveCategory(index, 'down')}
                                                        disabled={isLast}
                                                        className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isLast ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white cursor-pointer active:bg-slate-200 dark:active:bg-white/20'}`}
                                                        aria-label={`Di chuyển ${cat} xuống`}
                                                    >
                                                        <ArrowDown size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-xs text-slate-400 text-center mt-2">
                                Thứ tự ở đây quyết định thứ tự hiển thị trên menu khách hàng scan QR
                            </p>
                        </>
                    )}

                    {/* ─── TAB 3: Combo ─── */}
                    {activeTab === 'combos' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quản lý Combo</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {activeComboCount}/{comboItems.length} combo đang bán trên kênh O2O
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-64 bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] animate-pulse" />
                                    ))}
                                </div>
                            ) : comboItems.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-16 text-center">
                                    <Package size={48} className="text-slate-200 dark:text-white/10" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có combo nào</p>
                                    <p className="text-sm text-slate-400">Combo được tạo từ hệ thống POS hoặc seed data</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {comboItems.map(combo => {
                                        const saving = combo.originalPrice
                                            ? Math.round((1 - combo.price / combo.originalPrice) * 100)
                                            : 0;

                                        return (
                                            <div
                                                key={combo.id}
                                                onClick={() => setEditingItem(combo)}
                                                className={`bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-200 dark:hover:border-blue-500/20 ${!combo.isActive ? 'opacity-60' : ''}`}
                                            >
                                                {/* Combo image */}
                                                <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/[0.02] overflow-hidden">
                                                    {combo.img ? (
                                                        <img
                                                            src={combo.img}
                                                            alt={combo.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : null}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                                    {/* Saving badge */}
                                                    {saving > 0 && (
                                                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                                            -{saving}%
                                                        </div>
                                                    )}

                                                    {/* Status badge */}
                                                    {combo.status && (
                                                        <div className="absolute top-3 left-3">
                                                            <StatusBadge status={combo.status} />
                                                        </div>
                                                    )}

                                                    {/* Edit icon on hover */}
                                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-8 h-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
                                                            <Pencil size={14} className="text-slate-600 dark:text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Combo info */}
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{combo.name}</h3>
                                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{combo.desc}</p>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center gap-2.5 mt-3">
                                                        <span className="text-lg font-bold text-orange-600">
                                                            {combo.price.toLocaleString('vi-VN')}đ
                                                        </span>
                                                        {combo.originalPrice && combo.originalPrice > combo.price && (
                                                            <span className="text-sm text-slate-400 line-through">
                                                                {combo.originalPrice.toLocaleString('vi-VN')}đ
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tags + Toggle */}
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {combo.tags?.slice(0, 2).map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-medium">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                            {savingItemId === combo.id && (
                                                                <RefreshCw size={12} className="animate-spin text-blue-500" />
                                                            )}
                                                            <Toggle
                                                                checked={combo.isActive}
                                                                onChange={(v) => toggleItem(combo.id, v)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* ═══ POS Settings Slide-over Panel ═══ */}
            {showPosPanel && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setShowPosPanel(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0c0c1a] border-l border-slate-200 dark:border-white/10 z-50 flex flex-col shadow-2xl">
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
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

            {/* ═══ Edit Item Modal ═══ */}
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

// ─── Edit Modal (with native <select> replaced by pill selector) ─────

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0c0c1a] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
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
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
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
                                {/* Fix: Replace native <select> with pill selector (ANTI-PATTERNS compliance) */}
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    Nhãn trạng thái {isLocked('status') && <Lock size={10} className="text-amber-500" />}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            disabled={isLocked('status')}
                                            onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                                ${form.status === opt.value
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40'
                                                }
                                                ${isLocked('status') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
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
                            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

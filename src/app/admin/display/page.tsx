'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutTemplate, Plus, Save, ChevronUp, ChevronDown, Trash2, Settings2, Eye, X, ExternalLink, CheckCircle2, AlertTriangle, Lock, Palette, GripVertical, MonitorSmartphone, RefreshCcw, ArrowLeft, Utensils, QrCode, Store, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { SurveyEditorInline, DEFAULT_SURVEY_CONFIG } from './SurveyEditorModal';
import { IconDictionary } from '@/lib/icons';

type OperatingModel = 'post-pay' | 'pre-pay-table' | 'pre-pay-counter';
type ModuleType = 'menu-grid' | 'flash-sale' | 'for-you' | 'best-sale' | 'combo' | 'onboarding-wizard' | 'support-options' | 'checkout-auth' | 'custom' | 'bad-review-reasons' | 'payment-methods';

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

const MODULE_DEFINITIONS: Record<ModuleType, { name: string; description: string; category: 'layout' | 'action'; minTier?: 'FREE' | 'PRO' | 'PREMIUM'; supportedModels?: OperatingModel[] }> = {
    'flash-sale': { name: 'Flash Sale / Ưu Đãi Giới Hạn', description: 'Đẩy món cần bán nhanh lên đầu menu trong một khung giờ nhất định', category: 'layout', minTier: 'PRO' },
    'for-you': { name: 'Món Bạn Từng Gọi', description: 'Hiển thị tối đa 5 món khách đã từng gọi nhiều nhất (Chỉ On/Off)', category: 'layout', minTier: 'FREE' },
    'combo': { name: 'Combo Tiết Kiệm', description: 'Hiển thị các gói combo giá tốt', category: 'layout', minTier: 'PRO' },
    'best-sale': { name: 'Siêu Phẩm Bán Chạy', description: 'Danh sách món bán chạy nhất', category: 'layout', minTier: 'PRO' },
    'custom': { name: 'Danh Mục Tuỳ Chỉnh', description: 'Tự cấu hình danh mục riêng', category: 'layout', minTier: 'PRO' },
    'menu-grid': { name: 'Thực Đơn Của Quán', description: 'Hiển thị mục thực đơn cốt lõi (Ghim dưới đáy menu)', category: 'layout', minTier: 'FREE' },
    'onboarding-wizard': { name: 'Khám Phá Menu (Giới thiệu)', description: 'Bật/Tắt và thiết lập Khảo sát đầu vào (V2)', category: 'action', minTier: 'PREMIUM' },
    'support-options': { name: 'Tùy Chỉnh Yêu Cầu Hỗ Trợ', description: 'Cấu hình các nút chức năng trong modal Yêu Cầu Hỗ Trợ', category: 'action', minTier: 'PRO', supportedModels: ['post-pay', 'pre-pay-table'] },
    'checkout-auth': { name: 'Đăng Nhập Khi Trả Trước', description: 'Bật/Tắt nút Bỏ qua đăng nhập ở màn thanh toán trả trước', category: 'action', minTier: 'FREE', supportedModels: ['pre-pay-table', 'pre-pay-counter'] },
    'bad-review-reasons': { name: 'Lý Do Đánh Giá Xấu', description: 'Cấu hình các lựa chọn tag khi khách hàng chọn sao thấp, phục vụ báo cáo nội bộ', category: 'action', minTier: 'PRO' },
    'payment-methods': { name: 'Phương Thức Thanh Toán', description: 'Bật/Tắt các cổng thanh toán cho phép khách trả trước khi gọi món', category: 'action', minTier: 'FREE', supportedModels: ['pre-pay-table', 'pre-pay-counter'] }
};

const createDefaultFlashSaleBlock = (): StorefrontBlock => ({
    id: 'b0',
    type: 'flash-sale',
    title: 'Ưu Đãi Giới Hạn',
    config: {
        isEnabled: true,
        displayTitle: 'Ưu đãi giới hạn',
        subtitle: 'Món ngon giá tốt theo từng khung giờ',
        showCountdown: true,
        showRemainingQuantity: true,
        campaigns: [createDefaultFlashSaleCampaign(1)]
    }
});

const createDefaultFlashSaleCampaign = (index = 1) => ({
    id: `campaign_${index}`,
    name: index === 1 ? 'Sáng - Ưu đãi món nhanh' : `Chương trình ${index}`,
    isEnabled: true,
    objective: 'clear_today',
    runMode: 'daily',
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    quickDurationMinutes: 120,
    startedAt: '',
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '14:00',
    endTime: '17:00',
    autoHideWhenEnded: true,
    autoHideWhenSoldOut: true,
    resetQuantityDaily: true,
    items: []
});

const normalizeRunMode = (runMode?: string) => runMode === 'weekly' ? 'weekly' : runMode === 'once' ? 'once' : 'daily';

const ensureFlashSaleBlock = (incomingBlocks: StorefrontBlock[]) => {
    if (incomingBlocks.some(block => block.type === 'flash-sale')) return incomingBlocks;
    return [createDefaultFlashSaleBlock(), ...incomingBlocks];
};

const normalizeFlashSaleConfig = (config: any = {}) => {
    const legacyRunMode = config.runMode || (config.repeatMode === 'daily' ? 'daily' : 'once');
    const legacyCampaign = {
        id: 'campaign_1',
        name: config.displayTitle || 'Ưu đãi giới hạn',
        isEnabled: config.isEnabled !== false,
        objective: config.objective || 'clear_today',
        runMode: normalizeRunMode(legacyRunMode),
        weekdays: config.weekdays || [1, 2, 3, 4, 5, 6, 0],
        quickDurationMinutes: Number(config.quickDurationMinutes || 120),
        startedAt: config.startedAt || '',
        startDate: config.startDate || new Date().toISOString().slice(0, 10),
        startTime: config.startTime || '14:00',
        endTime: config.endTime || '17:00',
        autoHideWhenEnded: config.autoHideWhenEnded !== false,
        autoHideWhenSoldOut: config.autoHideWhenSoldOut !== false,
        resetQuantityDaily: config.resetQuantityDaily !== false,
        items: config.items || []
    };
    const campaigns = Array.isArray(config.campaigns) && config.campaigns.length > 0 ? config.campaigns : [legacyCampaign];
    return {
        ...config,
        showCountdown: config.showCountdown !== false,
        showRemainingQuantity: config.showRemainingQuantity !== false,
        campaigns: campaigns.map((campaign: any, idx: number) => ({
            ...createDefaultFlashSaleCampaign(idx + 1),
            ...campaign,
            id: campaign.id || `campaign_${idx + 1}`,
            name: campaign.name || `Chương trình ${idx + 1}`,
            isEnabled: campaign.isEnabled !== false,
            runMode: normalizeRunMode(campaign.runMode),
            weekdays: campaign.weekdays || [1, 2, 3, 4, 5, 6, 0],
            quickDurationMinutes: Number(campaign.quickDurationMinutes || 120),
            autoHideWhenEnded: campaign.autoHideWhenEnded !== false,
            autoHideWhenSoldOut: campaign.autoHideWhenSoldOut !== false,
            resetQuantityDaily: campaign.resetQuantityDaily !== false,
            items: campaign.items || []
        }))
    };
};

const createDefaultScheduleGroup = (type: ModuleType, index = 1) => ({
    id: `group_${index}`,
    name: index === 1
        ? (type === 'combo' ? 'Khung giờ combo' : 'Khung giờ món bán chạy')
        : `Khung giờ ${index}`,
    isEnabled: true,
    runMode: 'daily',
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '17:00',
    specialDatesText: '',
    itemIds: [] as number[]
});

const normalizeScheduledGroupConfig = (config: any = {}, type: ModuleType) => {
    const legacyIds = config.itemIds || [];
    const groups = Array.isArray(config.scheduleGroups) && config.scheduleGroups.length > 0
        ? config.scheduleGroups
        : [{ ...createDefaultScheduleGroup(type, 1), itemIds: legacyIds }];
    return {
        ...config,
        scheduleGroups: groups.map((group: any, idx: number) => ({
            ...createDefaultScheduleGroup(type, idx + 1),
            ...group,
            id: group.id || `group_${idx + 1}`,
            name: group.name || `Khung giờ ${idx + 1}`,
            isEnabled: group.isEnabled !== false,
            runMode: normalizeRunMode(group.runMode),
            weekdays: group.weekdays || [1, 2, 3, 4, 5, 6, 0],
            itemIds: group.itemIds || []
        }))
    };
};

const WEEKDAY_LABELS = [
    { id: 1, label: 'T2' },
    { id: 2, label: 'T3' },
    { id: 3, label: 'T4' },
    { id: 4, label: 'T5' },
    { id: 5, label: 'T6' },
    { id: 6, label: 'T7' },
    { id: 0, label: 'CN' }
];

const ALL_WEEKDAYS = WEEKDAY_LABELS.map(day => day.id);

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getTimeMs = (value?: string) => {
    if (!value) return null;
    const [hour, minute] = String(value).split(':').map(Number);
    const date = new Date();
    date.setHours(hour || 0, minute || 0, 0, 0);
    return date.getTime();
};

const describeSchedule = (group: any) => {
    if (group.runMode === 'once') return `${group.startDate || 'Chưa chọn ngày'} · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
    if (group.runMode === 'daily') return `Hằng ngày · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
    const days = (group.weekdays || []).map((day: number) => WEEKDAY_LABELS.find(w => w.id === day)?.label).filter(Boolean).join(', ') || 'Chưa chọn thứ';
    return `${days} · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
};

const getScheduleIssues = (group: any, variant: 'flash-sale' | 'combo' | 'best-sale') => {
    const issues: string[] = [];
    if (!group.name?.trim()) issues.push('Thiếu tên');
    if (group.runMode === 'once' && !group.startDate) issues.push('Thiếu ngày');
    if (group.runMode === 'weekly' && (!Array.isArray(group.weekdays) || group.weekdays.length === 0)) issues.push('Chưa chọn thứ');
    if (!group.startTime || !group.endTime || group.endTime <= group.startTime) issues.push('Sai giờ');
    if (variant === 'flash-sale') {
        const items = group.items || [];
        if (items.length === 0) issues.push('Thiếu món');
        if (items.some((item: any) => Number(item.salePrice || 0) <= 0 || Number(item.originalPrice || 0) <= Number(item.salePrice || 0))) issues.push('Sai giá');
    } else if ((group.itemIds || []).length === 0) {
        issues.push('Thiếu món');
    }
    return issues;
};

const getScheduleStatus = (group: any, variant: 'flash-sale' | 'combo' | 'best-sale') => {
    if (group.isEnabled === false) return { label: 'Tạm tắt', tone: 'slate' };
    const issues = getScheduleIssues(group, variant);
    if (issues.length > 0) return { label: 'Cần cấu hình', tone: 'red', detail: issues[0] };
    const now = Date.now();
    if (group.runMode === 'once' && group.startDate !== getTodayKey()) return { label: 'Sắp chạy', tone: 'amber' };
    if (group.runMode === 'weekly' && !(group.weekdays || []).includes(new Date().getDay())) return { label: 'Sắp chạy', tone: 'amber' };
    const start = getTimeMs(group.startTime);
    const end = getTimeMs(group.endTime);
    if (start && end && now >= start && now <= end) return { label: 'Đang chạy', tone: 'green' };
    return { label: 'Sắp chạy', tone: 'amber' };
};

const statusClass = (tone: string) => {
    if (tone === 'green') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
    if (tone === 'red') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20';
    if (tone === 'amber') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10';
};

const getScheduleItemCount = (group: any, variant: 'flash-sale' | 'combo' | 'best-sale') => {
    return variant === 'flash-sale' ? (group.items || []).length : (group.itemIds || []).length;
};

const getSchedulePreviewItems = (group: any, variant: 'flash-sale' | 'combo' | 'best-sale', allMenuItems: any[]) => {
    const flashItems = group.items || [];
    const itemIds = variant === 'flash-sale' ? flashItems.map((item: any) => item.itemId) : (group.itemIds || []);
    return itemIds.map((id: number | string) => {
        const menuItem = allMenuItems.find(item => String(item.id) === String(id));
        const saleItem = flashItems.find((item: any) => String(item.itemId) === String(id));
        return {
            id,
            name: menuItem?.name || saleItem?.name || `Món #${id}`,
            img: menuItem?.img || menuItem?.image || menuItem?.imageUrl || ''
        };
    });
};

const statusDotClass = (tone: string) => {
    if (tone === 'green') return 'bg-emerald-500';
    if (tone === 'red') return 'bg-rose-500';
    if (tone === 'amber') return 'bg-amber-500';
    return 'bg-slate-300';
};

function SchedulePreviewItem({ item }: { item: any }) {
    const [hasImage, setHasImage] = useState(Boolean(item.img));

    return (
        <div className="group/item w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-white/20">
            <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-100 dark:bg-white/10">
                {hasImage ? (
                    <img
                        src={item.img}
                        alt={item.name}
                        loading="lazy"
                        onError={() => setHasImage(false)}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover/item:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300 dark:text-slate-600">
                        <Utensils size={22} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Chưa có ảnh</span>
                    </div>
                )}
            </div>
            <div className="p-2.5">
                <p className="line-clamp-2 min-h-[36px] text-[12px] font-bold leading-snug text-slate-800 dark:text-slate-100">{item.name}</p>
            </div>
        </div>
    );
}

const SYSTEM_TEMPLATES: StorefrontTemplate[] = [
    {
        id: 'sys-dining',
        name: 'Mẫu Ăn Tại Bàn (Dining)',
        isSystem: true,
        blocks: [
            createDefaultFlashSaleBlock(),
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
    if (type === 'flash-sale') {
        const flashConfig = normalizeFlashSaleConfig(config);
        const enabledCampaigns = (flashConfig.campaigns || []).filter((campaign: any) => campaign.isEnabled !== false);
        if (enabledCampaigns.length === 0) return false;
        return enabledCampaigns.every((campaign: any) => getScheduleIssues(campaign, 'flash-sale').length === 0);
    }
    if (type === 'combo' || type === 'best-sale') {
        const scheduledConfig = normalizeScheduledGroupConfig(config, type);
        const enabledGroups = (scheduledConfig.scheduleGroups || []).filter((group: any) => group.isEnabled !== false);
        if (enabledGroups.length === 0) return false;
        return enabledGroups.every((group: any) => getScheduleIssues(group, type).length === 0);
    }
    return true;
};

function ScheduleGroupList({
    title,
    subtitle,
    variant,
    groups,
    allMenuItems,
    onCreate,
    onEdit,
    onToggle,
    onDelete
}: {
    title: string;
    subtitle: string;
    variant: 'flash-sale' | 'combo' | 'best-sale';
    groups: any[];
    allMenuItems: any[];
    onCreate: () => void;
    onEdit: (group: any) => void;
    onToggle: (groupId: string, enabled: boolean) => void;
    onDelete: (groupId: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-white/10">
                <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                </div>
                <button
                    onClick={onCreate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#DF1B41] text-white hover:bg-[#c81739] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                    <Plus size={14} /> Tạo khung giờ
                </button>
            </div>

            <div className="space-y-4 bg-slate-50/80 dark:bg-white/[0.02] p-4">
                {groups.map((group: any) => {
                    const status = getScheduleStatus(group, variant);
                    const itemCount = getScheduleItemCount(group, variant);
                    const previewItems = getSchedulePreviewItems(group, variant, allMenuItems);
                    const visibleItems = previewItems.slice(0, 10);
                    const hiddenCount = Math.max(previewItems.length - visibleItems.length, 0);
                    return (
                        <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(status.tone)}`} />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-black text-slate-950 dark:text-white">{group.name || 'Chưa đặt tên'}</p>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{group.isEnabled === false ? 'Tắt' : 'Bật'}</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{describeSchedule(group)}</span>
                                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{itemCount} món</span>
                                            <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${statusClass(status.tone)}`}>{status.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-600 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={group.isEnabled !== false}
                                            onChange={(e) => onToggle(group.id, e.target.checked)}
                                            className="h-4 w-4 shrink-0 accent-[#DF1B41] cursor-pointer"
                                            title="Bật/tắt khung giờ"
                                        />
                                        Bật
                                    </label>
                                    <button onClick={() => onEdit(group)} className="h-9 rounded-lg px-3 text-xs font-black text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#DF1B41] dark:text-slate-300 dark:hover:bg-rose-500/10 cursor-pointer">
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => onDelete(group.id)}
                                        disabled={groups.length <= 1}
                                        aria-label="Xóa khung giờ"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={groups.length <= 1 ? 'Cần giữ ít nhất 1 khung giờ' : 'Xóa khung giờ'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Món trong khung giờ</p>
                                    {visibleItems.length > 4 && <p className="text-[11px] font-semibold text-slate-400">Kéo ngang để xem thêm</p>}
                                </div>
                                <div className="flex snap-x gap-3 overflow-x-auto pb-1 hidden-scroll">
                                {visibleItems.length > 0 ? visibleItems.map((item: any) => (
                                    <SchedulePreviewItem key={String(item.id)} item={item} />
                                )) : (
                                    <div className="flex min-h-[142px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-400 dark:border-white/10 dark:bg-black/20">
                                        Chưa chọn món
                                    </div>
                                )}
                                {hiddenCount > 0 && (
                                    <button onClick={() => onEdit(group)} className="flex min-h-[142px] w-[148px] shrink-0 snap-start flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:text-[#DF1B41] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-rose-500/30 cursor-pointer">
                                        <span className="text-xl font-black">+{hiddenCount}</span>
                                        <span>món khác</span>
                                    </button>
                                )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {groups.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-400 border border-dashed border-slate-200 dark:border-white/10 m-4 rounded-xl">
                        Chưa có khung giờ. Tạo khung giờ đầu tiên để hiển thị nhóm này.
                    </div>
                )}
            </div>
        </div>
    );
}

function ScheduleGroupDrawer({
    open,
    variant,
    title,
    draft,
    setDraft,
    allMenuItems,
    onClose,
    onSave,
    onDelete,
    canDelete
}: {
    open: boolean;
    variant: 'flash-sale' | 'combo' | 'best-sale';
    title: string;
    draft: any;
    setDraft: (draft: any) => void;
    allMenuItems: any[];
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
}) {
    if (!open || !draft || typeof document === 'undefined') return null;

    const reasonLabels: Record<string, string> = {
        made_today: 'Sản xuất trong ngày',
        near_expiry: 'Sắp hết hạn',
        slow_hour: 'Kích cầu giờ thấp điểm',
        clear_stock: 'Xả tồn',
        new_item: 'Đẩy món mới'
    };
    const isRepeating = draft.runMode === 'daily' || draft.runMode === 'weekly';
    const issues = getScheduleIssues(draft, variant);
    const selectedIds = variant === 'flash-sale'
        ? (draft.items || []).map((item: any) => String(item.itemId))
        : (draft.itemIds || []).map(String);
    const itemCount = getScheduleItemCount(draft, variant);

    const updateDraft = (patch: any) => setDraft({ ...draft, ...patch });
    const setRepeating = (checked: boolean) => {
        updateDraft(checked
            ? { runMode: 'weekly', weekdays: draft.weekdays || ALL_WEEKDAYS }
            : { runMode: 'once', startDate: draft.startDate || getTodayKey() });
    };

    const addMenuItem = (rawId: string) => {
        const selected = allMenuItems.find(item => String(item.id) === rawId);
        if (!selected) return;
        if (variant === 'flash-sale') {
            const originalPrice = Number(selected.originalPrice || selected.price || 0);
            updateDraft({
                items: [
                    ...(draft.items || []),
                    {
                        id: `sale_${selected.id}_${Date.now()}`,
                        itemId: selected.id,
                        originalPrice,
                        salePrice: Math.max(1000, Math.round(originalPrice * 0.8)),
                        quantityLimit: 20,
                        soldCount: 0,
                        reason: draft.objective === 'clear_stock' ? 'near_expiry' : 'made_today',
                        visibility: { mode: 'inherit' }
                    }
                ]
            });
            return;
        }
        updateDraft({ itemIds: [...(draft.itemIds || []), selected.id] });
    };

    const removeMenuItem = (rowId: string | number) => {
        if (variant === 'flash-sale') {
            updateDraft({ items: (draft.items || []).filter((item: any) => item.id !== rowId) });
            return;
        }
        updateDraft({ itemIds: (draft.itemIds || []).filter((id: number) => String(id) !== String(rowId)) });
    };

    const drawer = (
        <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/40 backdrop-blur-sm" onClick={onClose}>
            <div className="h-full w-full sm:max-w-[620px] bg-white dark:bg-[#11131A] shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">Chỉnh khung giờ</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {issues.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 px-3 py-2 text-xs font-bold">
                            Cần cấu hình: {issues.join(', ')}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tên khung giờ</label>
                        <input
                            type="text"
                            value={draft.name || ''}
                            onChange={(e) => updateDraft({ name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold"
                            placeholder="VD: Combo chiều T2/T4/T6"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 space-y-3">
                        <label className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer">
                            <div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Có lặp lại</span>
                                <p className="text-xs text-slate-500 mt-0.5">Bật để chọn thứ trong tuần.</p>
                            </div>
                            <input type="checkbox" checked={isRepeating} onChange={(e) => setRepeating(e.target.checked)} className="w-4 h-4 accent-[#DF1B41]" />
                        </label>

                        {isRepeating ? (
                            <div className="space-y-3">
                                <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-1">
                                    <button onClick={() => updateDraft({ runMode: 'daily', weekdays: ALL_WEEKDAYS })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${draft.runMode === 'daily' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Hằng ngày</button>
                                    <button onClick={() => updateDraft({ runMode: 'weekly' })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${draft.runMode === 'weekly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Chọn thứ</button>
                                </div>
                                {draft.runMode === 'weekly' && (
                                    <div className="flex flex-wrap gap-2">
                                        {WEEKDAY_LABELS.map(day => {
                                            const selected = (draft.weekdays || []).includes(day.id);
                                            return (
                                                <button
                                                    key={day.id}
                                                    onClick={() => {
                                                        const current = draft.weekdays || [];
                                                        const weekdays = selected ? current.filter((id: number) => id !== day.id) : [...current, day.id];
                                                        updateDraft({ weekdays });
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selected ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ngày chạy</label>
                                <input type="date" value={draft.startDate || ''} onChange={(e) => updateDraft({ startDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bắt đầu</label>
                                <input type="time" value={draft.startTime || ''} onChange={(e) => updateDraft({ startTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kết thúc</label>
                                <input type="time" value={draft.endTime || ''} onChange={(e) => updateDraft({ endTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                            </div>
                        </div>

                        <details>
                            <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Ngày đặc biệt</summary>
                            <textarea
                                value={draft.specialDatesText || ''}
                                onChange={(e) => updateDraft({ specialDatesText: e.target.value })}
                                rows={2}
                                className="mt-2 w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm resize-none"
                                placeholder="VD: 2026-09-02: dùng danh sách món riêng cho ngày lễ"
                            />
                        </details>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Món hiển thị ({itemCount})</label>
                        </div>
                        <select
                            className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                            onChange={(e) => {
                                addMenuItem(e.target.value);
                                e.target.value = '';
                            }}
                        >
                            <option value="">-- Tìm món trong thực đơn --</option>
                            {allMenuItems.filter(item => !selectedIds.includes(String(item.id))).map(item => (
                                <option key={item.id} value={item.id}>{item.name} - {Number(item.price || 0).toLocaleString('vi-VN')}đ</option>
                            ))}
                        </select>

                        <div className="mt-3 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-black/20">
                            {variant === 'flash-sale' ? (
                                (draft.items || []).length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {(draft.items || []).map((sale: any) => {
                                            const menuItem = allMenuItems.find(item => String(item.id) === String(sale.itemId));
                                            const discount = Number(sale.originalPrice) > Number(sale.salePrice) ? Math.round((1 - Number(sale.salePrice) / Number(sale.originalPrice)) * 100) : 0;
                                            return (
                                                <div key={sale.id} className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                            {menuItem?.img ? <img src={menuItem.img} alt="" className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{menuItem?.name || `Món #${sale.itemId}`}</p>
                                                                    <p className={`text-xs font-bold mt-0.5 ${discount > 0 ? 'text-rose-500' : 'text-amber-600'}`}>{discount > 0 ? `Giảm ${discount}%` : 'Cần sửa giá sale'}</p>
                                                                </div>
                                                                <button onClick={() => removeMenuItem(sale.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                <input type="number" value={sale.originalPrice || ''} onChange={(e) => updateDraft({ items: (draft.items || []).map((item: any) => item.id === sale.id ? { ...item, originalPrice: Number(e.target.value) } : item) })} className="min-w-0 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold" placeholder="Giá gốc" />
                                                                <input type="number" value={sale.salePrice || ''} onChange={(e) => updateDraft({ items: (draft.items || []).map((item: any) => item.id === sale.id ? { ...item, salePrice: Number(e.target.value) } : item) })} className="min-w-0 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-rose-600" placeholder="Giá sale" />
                                                                <input type="number" value={sale.quantityLimit || ''} onChange={(e) => updateDraft({ items: (draft.items || []).map((item: any) => item.id === sale.id ? { ...item, quantityLimit: Number(e.target.value) } : item) })} className="min-w-0 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold" placeholder="Số suất" />
                                                                <select value={sale.reason || 'made_today'} onChange={(e) => updateDraft({ items: (draft.items || []).map((item: any) => item.id === sale.id ? { ...item, reason: e.target.value } : item) })} className="min-w-0 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold">
                                                                    {Object.entries(reasonLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">Chưa có món trong khung giờ này.</div>
                                )
                            ) : (
                                (draft.itemIds || []).length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {(draft.itemIds || []).map((id: number) => {
                                            const item = allMenuItems.find(menuItem => String(menuItem.id) === String(id));
                                            return (
                                                <div key={id} className="flex items-center justify-between p-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                            {item?.img ? <img src={item.img} alt="" className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item?.name || `Món #${id}`}</p>
                                                            <p className="text-xs text-slate-500 font-bold">{Number(item?.price || 0).toLocaleString('vi-VN')}đ</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeMenuItem(id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">Chưa có món trong khung giờ này.</div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 bg-white/95 dark:bg-[#11131A]/95">
                    {canDelete && onDelete ? (
                        <button onClick={onDelete} className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer">Xóa khung giờ</button>
                    ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Cần giữ ít nhất 1 khung giờ.</span>
                    )}
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">Huỷ</button>
                        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-[#DF1B41] text-white text-sm font-bold hover:bg-[#c81739] cursor-pointer">Lưu khung giờ</button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(drawer, document.body);
}

function ModuleConfigForm({ block, onChange, allMenuItems = [], restaurantInfo, showToast }: { block: StorefrontBlock, onChange: (newConfig: any) => void, allMenuItems?: any[], restaurantInfo?: any, showToast?: (msg: string, type: 'success'|'error'|'info') => void }) {
    const { type, config } = block;
    const [previewStyle, setPreviewStyle] = useState<'v1' | 'v2' | null>(null);
    const [iconPickerOpenForId, setIconPickerOpenForId] = useState<string | null>(null);
    const [selectedFlashCampaignId, setSelectedFlashCampaignId] = useState<string | null>(null);
    const [selectedScheduleGroupId, setSelectedScheduleGroupId] = useState<string | null>(null);
    const [scheduleDrawer, setScheduleDrawer] = useState<{ variant: 'flash-sale' | 'combo' | 'best-sale'; mode: 'create' | 'edit'; draft: any } | null>(null);

    if (type === 'flash-sale') {
        {
            const flashConfig = normalizeFlashSaleConfig(config);
            const campaigns = flashConfig.campaigns || [];
            const enabledCount = campaigns.filter((campaign: any) => campaign.isEnabled !== false).length;
            const invalidCount = campaigns.filter((campaign: any) => campaign.isEnabled !== false && getScheduleIssues(campaign, 'flash-sale').length > 0).length;
            const runningCount = campaigns.filter((campaign: any) => getScheduleStatus(campaign, 'flash-sale').label === 'Đang chạy').length;
            const updateCampaigns = (nextCampaigns: any[]) => onChange({ ...flashConfig, campaigns: nextCampaigns });
            const getNextCampaignId = () => {
                let next = campaigns.length + 1;
                while (campaigns.some((campaign: any) => campaign.id === `campaign_${next}`)) next += 1;
                return `campaign_${next}`;
            };
            const openCreate = () => {
                const id = getNextCampaignId();
                setScheduleDrawer({
                    variant: 'flash-sale',
                    mode: 'create',
                    draft: { ...createDefaultFlashSaleCampaign(campaigns.length + 1), id, name: `Chương trình ${campaigns.length + 1}` }
                });
            };
            const openEdit = (campaign: any) => setScheduleDrawer({ variant: 'flash-sale', mode: 'edit', draft: JSON.parse(JSON.stringify(campaign)) });
            const closeDrawer = () => setScheduleDrawer(null);
            const saveDrawer = () => {
                if (!scheduleDrawer) return;
                const draft = scheduleDrawer.draft;
                updateCampaigns(scheduleDrawer.mode === 'create'
                    ? [...campaigns, draft]
                    : campaigns.map((campaign: any) => campaign.id === draft.id ? draft : campaign));
                closeDrawer();
            };
            const deleteCampaign = (campaignId: string) => {
                if (campaigns.length <= 1) return;
                updateCampaigns(campaigns.filter((campaign: any) => campaign.id !== campaignId));
                if (scheduleDrawer?.draft?.id === campaignId) closeDrawer();
            };

            return (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            ['Đang chạy', runningCount, 'green'],
                            ['Đang bật', enabledCount, 'blue'],
                            ['Cần xử lý', invalidCount, invalidCount ? 'red' : 'slate']
                        ].map(([label, value, tone]) => (
                            <div key={String(label)} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                                <p className={`mt-1 text-2xl font-black ${tone === 'red' ? 'text-rose-600' : tone === 'green' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{String(value)}</p>
                            </div>
                        ))}
                    </div>
                    <ScheduleGroupList
                        title="Chương trình Flash Sale"
                        subtitle="Quản lý các khung giờ ưu đãi. Bấm Sửa để cấu hình lịch và món."
                        variant="flash-sale"
                        groups={campaigns}
                        allMenuItems={allMenuItems}
                        onCreate={openCreate}
                        onEdit={openEdit}
                        onToggle={(campaignId, enabled) => updateCampaigns(campaigns.map((campaign: any) => campaign.id === campaignId ? { ...campaign, isEnabled: enabled } : campaign))}
                        onDelete={deleteCampaign}
                    />
                    <ScheduleGroupDrawer
                        open={scheduleDrawer?.variant === 'flash-sale'}
                        variant="flash-sale"
                        title="Flash Sale"
                        draft={scheduleDrawer?.draft}
                        setDraft={(draft) => setScheduleDrawer(prev => prev ? { ...prev, draft } : prev)}
                        allMenuItems={allMenuItems}
                        onClose={closeDrawer}
                        onSave={saveDrawer}
                        onDelete={scheduleDrawer?.draft ? () => deleteCampaign(scheduleDrawer.draft.id) : undefined}
                        canDelete={campaigns.length > 1}
                    />
                </div>
            );
        }
        const flashConfig = normalizeFlashSaleConfig(config);
        const reasonLabels: Record<string, string> = {
            made_today: 'Sản xuất trong ngày',
            near_expiry: 'Sắp hết hạn',
            slow_hour: 'Kích cầu giờ thấp điểm',
            clear_stock: 'Xả tồn',
            new_item: 'Đẩy món mới'
        };
        const campaigns = flashConfig.campaigns || [];
        const activeCampaign = campaigns.find((campaign: any) => campaign.id === selectedFlashCampaignId) || campaigns[0] || createDefaultFlashSaleCampaign(1);
        const activeItems = activeCampaign.items || [];
        const activeItemIds = activeItems.map((item: any) => String(item.itemId));
        const activeTotalLimit = activeItems.reduce((sum: number, item: any) => sum + Number(item.quantityLimit || 0), 0);
        const activeAvgDiscount = activeItems.length
            ? Math.round(activeItems.reduce((sum: number, item: any) => {
                const original = Number(item.originalPrice || 0);
                const sale = Number(item.salePrice || 0);
                if (!original || !sale || sale >= original) return sum;
                return sum + ((original - sale) / original * 100);
            }, 0) / activeItems.length)
            : 0;
        const weekdayLabels = [
            { id: 1, label: 'T2' },
            { id: 2, label: 'T3' },
            { id: 3, label: 'T4' },
            { id: 4, label: 'T5' },
            { id: 5, label: 'T6' },
            { id: 6, label: 'T7' },
            { id: 0, label: 'CN' }
        ];
        const allWeekdays = weekdayLabels.map(day => day.id);

        const updateCampaign = (campaignId: string, patch: any) => {
            onChange({
                ...flashConfig,
                campaigns: campaigns.map((campaign: any) => campaign.id === campaignId ? { ...campaign, ...patch } : campaign)
            });
        };
        const updateActiveItem = (rowId: string, field: string, value: any) => {
            updateCampaign(activeCampaign.id, {
                items: activeItems.map((item: any) => item.id === rowId ? { ...item, [field]: value } : item)
            });
        };
        const getNextCampaignId = () => {
            let next = campaigns.length + 1;
            while (campaigns.some((campaign: any) => campaign.id === `campaign_${next}`)) next += 1;
            return `campaign_${next}`;
        };

        const getCampaignIssues = (campaign: any) => {
            const items = campaign.items || [];
            const issues: string[] = [];
            if (items.length === 0) issues.push('Thiếu món');
            if (items.some((item: any) => Number(item.salePrice || 0) <= 0 || Number(item.originalPrice || 0) <= Number(item.salePrice || 0))) issues.push('Sai giá');
            if (campaign.runMode === 'once' && (!campaign.startDate || !campaign.startTime || !campaign.endTime || campaign.endTime <= campaign.startTime)) issues.push('Sai lịch');
            if ((campaign.runMode === 'daily' || campaign.runMode === 'weekly') && (!campaign.startTime || !campaign.endTime || campaign.endTime <= campaign.startTime)) issues.push('Sai giờ');
            if (campaign.runMode === 'weekly' && (!Array.isArray(campaign.weekdays) || campaign.weekdays.length === 0)) issues.push('Chưa chọn thứ');
            return issues;
        };

        const getTodayKey = () => new Date().toISOString().slice(0, 10);
        const getTimeMs = (value?: string) => {
            if (!value) return null;
            const [hour, minute] = String(value).split(':').map(Number);
            const date = new Date();
            date.setHours(hour || 0, minute || 0, 0, 0);
            return date.getTime();
        };

        const getCampaignStatus = (campaign: any) => {
            if (campaign.isEnabled === false) return { label: 'Tạm tắt', tone: 'slate' };
            const issues = getCampaignIssues(campaign);
            if (issues.length > 0) return { label: issues[0], tone: 'red' };
            const now = Date.now();
            if (campaign.runMode === 'once' && campaign.startDate !== getTodayKey()) return { label: 'Sắp chạy', tone: 'amber' };
            if (campaign.runMode === 'weekly' && !(campaign.weekdays || []).includes(new Date().getDay())) return { label: 'Sắp chạy', tone: 'amber' };
            if (campaign.runMode === 'daily' || campaign.runMode === 'weekly' || campaign.runMode === 'once') {
                const start = getTimeMs(campaign.startTime);
                const end = getTimeMs(campaign.endTime);
                if (start && end && now >= start && now <= end) return { label: 'Đang chạy', tone: 'green' };
                return { label: 'Sắp chạy', tone: 'amber' };
            }
            return { label: 'Sắp chạy', tone: 'amber' };
        };

        const statusClass = (tone: string) => {
            if (tone === 'green') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
            if (tone === 'red') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20';
            if (tone === 'amber') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
            if (tone === 'blue') return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20';
            return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10';
        };

        const describeCampaignSchedule = (campaign: any) => {
            if (campaign.runMode === 'once') return `${campaign.startDate || 'Chưa chọn ngày'} · ${campaign.startTime || '--:--'}-${campaign.endTime || '--:--'}`;
            if (campaign.runMode === 'daily') return `Hằng ngày · ${campaign.startTime || '--:--'}-${campaign.endTime || '--:--'}`;
            if (campaign.runMode === 'weekly') {
                const days = (campaign.weekdays || []).map((day: number) => weekdayLabels.find(w => w.id === day)?.label).filter(Boolean).join(', ') || 'Chưa chọn thứ';
                return `${days} · ${campaign.startTime || '--:--'}-${campaign.endTime || '--:--'}`;
            }
            return `${campaign.startTime || '--:--'}-${campaign.endTime || '--:--'}`;
        };
        const isRepeating = activeCampaign.runMode === 'daily' || activeCampaign.runMode === 'weekly';
        const activeStatus = getCampaignStatus(activeCampaign);
        const enabledCount = campaigns.filter((campaign: any) => campaign.isEnabled !== false).length;
        const invalidCount = campaigns.filter((campaign: any) => campaign.isEnabled !== false && getCampaignIssues(campaign).length > 0).length;
        const runningCount = campaigns.filter((campaign: any) => getCampaignStatus(campaign).label === 'Đang chạy').length;

        const setRepeating = (checked: boolean) => {
            if (checked) {
                updateCampaign(activeCampaign.id, { runMode: 'weekly', weekdays: activeCampaign.weekdays || allWeekdays });
                return;
            }
            updateCampaign(activeCampaign.id, { runMode: 'once', startDate: activeCampaign.startDate || getTodayKey() });
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        ['Đang chạy', runningCount, 'green'],
                        ['Đang bật', enabledCount, 'blue'],
                        ['Cần xử lý', invalidCount, invalidCount ? 'red' : 'slate']
                    ].map(([label, value, tone]) => (
                        <div key={String(label)} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className={`mt-1 text-2xl font-black ${tone === 'red' ? 'text-rose-600' : tone === 'green' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{String(value)}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 space-y-3 xl:sticky xl:top-4">
                        <div className="flex items-center justify-between gap-3 px-1">
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Chương trình</h5>
                                <p className="text-xs text-slate-500">{campaigns.length} lịch Flash Sale</p>
                            </div>
                            <button
                                onClick={() => {
                                    const id = getNextCampaignId();
                                    const nextCampaign = { ...createDefaultFlashSaleCampaign(campaigns.length + 1), id, name: `Chương trình ${campaigns.length + 1}` };
                                    onChange({ ...flashConfig, campaigns: [...campaigns, nextCampaign] });
                                    setSelectedFlashCampaignId(id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#DF1B41] text-white hover:bg-[#c81739] rounded-lg text-xs font-bold transition-colors"
                            >
                                <Plus size={14} /> Tạo
                            </button>
                        </div>

                        <div className="space-y-2">
                            {campaigns.map((campaign: any) => {
                                const selected = activeCampaign.id === campaign.id;
                                const status = getCampaignStatus(campaign);
                                const itemCount = (campaign.items || []).length;
                                return (
                                    <button
                                        key={campaign.id}
                                        onClick={() => setSelectedFlashCampaignId(campaign.id)}
                                        className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${selected ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30 shadow-sm' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{campaign.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-1 truncate">{describeCampaignSchedule(campaign)}</p>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 rounded-full border text-[10px] font-bold ${statusClass(status.tone)}`}>{status.label}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                                <span className="text-[11px] font-semibold text-slate-500">{itemCount} món · {campaign.isEnabled === false ? 'Off' : 'On'}</span>
                                            <input
                                                type="checkbox"
                                                checked={campaign.isEnabled !== false}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => updateCampaign(campaign.id, { isEnabled: e.target.checked })}
                                                className="w-4 h-4 accent-[#DF1B41]"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full border text-[10px] font-bold ${statusClass(activeStatus.tone)}`}>{activeStatus.label}</span>
                                    <span className="text-xs font-semibold text-slate-500">{describeCampaignSchedule(activeCampaign)}</span>
                                </div>
                                <input
                                    type="text"
                                    value={activeCampaign.name || ''}
                                    onChange={(e) => updateCampaign(activeCampaign.id, { name: e.target.value })}
                                    className="w-full max-w-xl px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold"
                                    placeholder="Tên chương trình, VD: Sáng T2/T4/T6"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                    <input type="checkbox" checked={activeCampaign.isEnabled !== false} onChange={(e) => updateCampaign(activeCampaign.id, { isEnabled: e.target.checked })} className="w-4 h-4 accent-[#DF1B41]" />
                                    {activeCampaign.isEnabled === false ? 'Đang tắt' : 'Đang bật'}
                                </label>
                                {campaigns.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const remaining = campaigns.filter((campaign: any) => campaign.id !== activeCampaign.id);
                                            onChange({ ...flashConfig, campaigns: remaining });
                                            setSelectedFlashCampaignId(remaining[0]?.id || null);
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                        title="Xoá chương trình"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">Lịch chạy chương trình</h5>
                                    <p className="text-xs text-slate-500 mt-0.5">Tất cả món trong chương trình dùng lịch này.</p>
                                </div>
                                <span className="rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 px-2 py-1 text-[11px] font-bold text-slate-500">{activeItems.length} món</span>
                            </div>
                            <label className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer">
                                <div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Có lặp lại</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Bật để chọn các thứ trong tuần như lịch hẹn giờ.</p>
                                </div>
                                <input type="checkbox" checked={isRepeating} onChange={(e) => setRepeating(e.target.checked)} className="w-4 h-4 accent-[#DF1B41]" />
                            </label>

                            {isRepeating && (
                                <div className="space-y-3">
                                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-1">
                                        <button onClick={() => updateCampaign(activeCampaign.id, { runMode: 'daily', weekdays: allWeekdays })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${activeCampaign.runMode === 'daily' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Hằng ngày</button>
                                        <button onClick={() => updateCampaign(activeCampaign.id, { runMode: 'weekly' })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${activeCampaign.runMode === 'weekly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Chọn thứ</button>
                                    </div>
                                    {activeCampaign.runMode === 'weekly' && (
                                        <div className="flex flex-wrap gap-2">
                                            {weekdayLabels.map(day => {
                                                const selected = (activeCampaign.weekdays || []).includes(day.id);
                                                return (
                                                    <button
                                                        key={day.id}
                                                        onClick={() => {
                                                            const current = activeCampaign.weekdays || [];
                                                            const weekdays = selected ? current.filter((id: number) => id !== day.id) : [...current, day.id];
                                                            updateCampaign(activeCampaign.id, { weekdays });
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selected ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isRepeating && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ngày chạy</label>
                                    <input type="date" value={activeCampaign.startDate || ''} onChange={(e) => updateCampaign(activeCampaign.id, { startDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bắt đầu</label>
                                    <input type="time" value={activeCampaign.startTime || ''} onChange={(e) => updateCampaign(activeCampaign.id, { startTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kết thúc</label>
                                    <input type="time" value={activeCampaign.endTime || ''} onChange={(e) => updateCampaign(activeCampaign.id, { endTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                            </div>

                            <details>
                                <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Ngày đặc biệt</summary>
                                <textarea
                                    value={activeCampaign.specialDatesText || ''}
                                    onChange={(e) => updateCampaign(activeCampaign.id, { specialDatesText: e.target.value })}
                                    rows={2}
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm resize-none"
                                    placeholder="VD: 2026-09-02: chỉ hiện Combo Quốc khánh"
                                />
                            </details>
                        </div>

                        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Món trong nhóm</h5>
                                <p className="text-xs text-slate-500">Các món này chỉ hiện khi chương trình đang chạy.</p>
                            </div>
                                <div className="flex gap-2 text-[11px] font-bold text-slate-500">
                                    <span className="rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 px-2 py-1">Giảm TB {activeAvgDiscount}%</span>
                                    <span className="rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 px-2 py-1">{activeTotalLimit} suất</span>
                                </div>
                            </div>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                                onChange={(e) => {
                                    const selected = allMenuItems.find(item => String(item.id) === e.target.value);
                                    if (!selected) return;
                                    const originalPrice = Number(selected.originalPrice || selected.price || 0);
                                    updateCampaign(activeCampaign.id, {
                                        items: [
                                            ...activeItems,
                                            {
                                                id: `sale_${selected.id}_${activeItems.length + 1}`,
                                                itemId: selected.id,
                                                originalPrice,
                                                salePrice: Math.max(1000, Math.round(originalPrice * 0.8)),
                                                quantityLimit: 20,
                                                soldCount: 0,
                                                reason: activeCampaign.objective === 'clear_stock' ? 'near_expiry' : 'made_today',
                                                visibility: { mode: 'inherit' }
                                            }
                                        ]
                                    });
                                    e.target.value = '';
                                }}
                            >
                                <option value="">-- Thêm món vào chương trình --</option>
                                {allMenuItems.filter(item => !activeItemIds.includes(String(item.id))).map(item => (
                                    <option key={item.id} value={item.id}>{item.name} - {Number(item.price || 0).toLocaleString('vi-VN')}đ</option>
                                ))}
                            </select>

                            <div className="space-y-3">
                            {activeItems.length > 0 ? activeItems.map((sale: any) => {
                                const menuItem = allMenuItems.find(item => String(item.id) === String(sale.itemId));
                                const discount = Number(sale.originalPrice) > Number(sale.salePrice)
                                    ? Math.round((1 - Number(sale.salePrice) / Number(sale.originalPrice)) * 100)
                                    : 0;
                                return (
                                    <div key={sale.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                {menuItem?.img ? <img src={menuItem.img} alt="" className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{menuItem?.name || `Món #${sale.itemId}`}</p>
                                                        <p className={`text-xs font-bold mt-0.5 ${discount > 0 ? 'text-rose-500' : 'text-amber-600'}`}>{discount > 0 ? `Giảm ${discount}%` : 'Cần sửa giá sale'} · Theo lịch chương trình</p>
                                                    </div>
                                                    <button onClick={() => updateCampaign(activeCampaign.id, { items: activeItems.filter((item: any) => item.id !== sale.id) })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <input type="number" value={sale.originalPrice || ''} onChange={(e) => updateActiveItem(sale.id, 'originalPrice', Number(e.target.value))} className="min-w-0 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold" placeholder="Giá gốc" />
                                                    <input type="number" value={sale.salePrice || ''} onChange={(e) => updateActiveItem(sale.id, 'salePrice', Number(e.target.value))} className="min-w-0 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-rose-600" placeholder="Giá sale" />
                                                    <input type="number" value={sale.quantityLimit || ''} onChange={(e) => updateActiveItem(sale.id, 'quantityLimit', Number(e.target.value))} className="min-w-0 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold" placeholder="Số suất" />
                                                    <select value={sale.reason || 'made_today'} onChange={(e) => updateActiveItem(sale.id, 'reason', e.target.value)} className="min-w-0 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold">
                                                        {Object.entries(reasonLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                    Chưa có món sale. Chọn ít nhất 1 món để chương trình có thể chạy.
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
        {
            const scheduledConfig = normalizeScheduledGroupConfig(config, type);
            const groups = scheduledConfig.scheduleGroups || [];
            const title = type === 'combo' ? 'Combo Tiết Kiệm' : 'Món Bán Chạy';
            const updateGroups = (nextGroups: any[]) => onChange({ ...scheduledConfig, scheduleGroups: nextGroups, itemIds: nextGroups[0]?.itemIds || [] });
            const getNextGroupId = () => {
                let next = groups.length + 1;
                while (groups.some((group: any) => group.id === `group_${next}`)) next += 1;
                return `group_${next}`;
            };
            const openCreate = () => {
                const id = getNextGroupId();
                setScheduleDrawer({
                    variant: type,
                    mode: 'create',
                    draft: { ...createDefaultScheduleGroup(type, groups.length + 1), id, name: `Khung giờ ${groups.length + 1}` }
                });
            };
            const openEdit = (group: any) => setScheduleDrawer({ variant: type, mode: 'edit', draft: JSON.parse(JSON.stringify(group)) });
            const closeDrawer = () => setScheduleDrawer(null);
            const saveDrawer = () => {
                if (!scheduleDrawer) return;
                const draft = scheduleDrawer.draft;
                updateGroups(scheduleDrawer.mode === 'create'
                    ? [...groups, draft]
                    : groups.map((group: any) => group.id === draft.id ? draft : group));
                closeDrawer();
            };
            const deleteGroup = (groupId: string) => {
                if (groups.length <= 1) return;
                updateGroups(groups.filter((group: any) => group.id !== groupId));
                if (scheduleDrawer?.draft?.id === groupId) closeDrawer();
            };

            return (
                <div className="space-y-5">
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-start gap-3">
                        <div className="mt-0.5 text-blue-500"><Settings2 size={16} /></div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Thiết lập {title} theo khung giờ</p>
                            Trang chính chỉ hiển thị danh sách để quản lý nhanh. Bấm Sửa để mở drawer cấu hình chi tiết.
                        </div>
                    </div>
                    <ScheduleGroupList
                        title="Khung giờ hiển thị"
                        subtitle={`${groups.length} khung giờ cho ${title.toLowerCase()}`}
                        variant={type}
                        groups={groups}
                        allMenuItems={allMenuItems}
                        onCreate={openCreate}
                        onEdit={openEdit}
                        onToggle={(groupId, enabled) => updateGroups(groups.map((group: any) => group.id === groupId ? { ...group, isEnabled: enabled } : group))}
                        onDelete={deleteGroup}
                    />
                    <ScheduleGroupDrawer
                        open={scheduleDrawer?.variant === type}
                        variant={type}
                        title={title}
                        draft={scheduleDrawer?.draft}
                        setDraft={(draft) => setScheduleDrawer(prev => prev ? { ...prev, draft } : prev)}
                        allMenuItems={allMenuItems}
                        onClose={closeDrawer}
                        onSave={saveDrawer}
                        onDelete={scheduleDrawer?.draft ? () => deleteGroup(scheduleDrawer.draft.id) : undefined}
                        canDelete={groups.length > 1}
                    />
                </div>
            );
        }
        const scheduledConfig = normalizeScheduledGroupConfig(config, type);
        const groups = scheduledConfig.scheduleGroups || [];
        const activeGroup = groups.find((group: any) => group.id === selectedScheduleGroupId) || groups[0] || createDefaultScheduleGroup(type, 1);
        const itemIds = activeGroup.itemIds || [];
        const limit = config.limit || 10;
        const selectedItems = allMenuItems.filter(item => itemIds.includes(item.id));
        const colorClass = type === 'best-sale' ? 'amber' : 'blue';
        const weekdayLabels = [
            { id: 1, label: 'T2' },
            { id: 2, label: 'T3' },
            { id: 3, label: 'T4' },
            { id: 4, label: 'T5' },
            { id: 5, label: 'T6' },
            { id: 6, label: 'T7' },
            { id: 0, label: 'CN' }
        ];
        const allWeekdays = weekdayLabels.map(day => day.id);
        const isRepeating = activeGroup.runMode === 'daily' || activeGroup.runMode === 'weekly';

        const describeGroupSchedule = (group: any) => {
            if (group.runMode === 'once') return `${group.startDate || 'Chưa chọn ngày'} · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
            if (group.runMode === 'daily') return `Hằng ngày · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
            const days = (group.weekdays || []).map((day: number) => weekdayLabels.find(w => w.id === day)?.label).filter(Boolean).join(', ') || 'Chưa chọn thứ';
            return `${days} · ${group.startTime || '--:--'}-${group.endTime || '--:--'}`;
        };

        const updateGroups = (nextGroups: any[]) => {
            onChange({ ...scheduledConfig, scheduleGroups: nextGroups, itemIds: nextGroups[0]?.itemIds || [] });
        };
        const updateGroup = (groupId: string, patch: any) => {
            updateGroups(groups.map((group: any) => group.id === groupId ? { ...group, ...patch } : group));
        };
        const setGroupRepeating = (checked: boolean) => {
            if (checked) {
                updateGroup(activeGroup.id, { runMode: 'weekly', weekdays: activeGroup.weekdays || allWeekdays });
                return;
            }
            updateGroup(activeGroup.id, { runMode: 'once', startDate: activeGroup.startDate || new Date().toISOString().slice(0, 10) });
        };
        const getNextGroupId = () => {
            let next = groups.length + 1;
            while (groups.some((group: any) => group.id === `group_${next}`)) next += 1;
            return `group_${next}`;
        };

        return (
            <div className="space-y-6">
                <div className={`text-sm text-slate-500 p-4 bg-${colorClass}-50/50 dark:bg-${colorClass}-500/5 rounded-xl border border-${colorClass}-100 dark:border-${colorClass}-500/20 flex items-start gap-3`}>
                    <div className={`mt-0.5 text-${colorClass}-500`}><Settings2 size={16} /></div>
                    <div>
                        <p className={`font-semibold text-${colorClass}-900 dark:text-${colorClass}-300 mb-1`}>Thiết lập {type === 'best-sale' ? 'Món bán chạy' : 'Combo tiết kiệm'} theo khung giờ</p>
                        Tạo nhiều khung giờ, chọn món cho từng khung và bật lặp lại nếu cần.
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3 px-1">
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Khung giờ</h5>
                                <p className="text-xs text-slate-500">{groups.length} lịch hiển thị</p>
                            </div>
                            <button
                                onClick={() => {
                                    const id = getNextGroupId();
                                    const nextGroup = { ...createDefaultScheduleGroup(type, groups.length + 1), id };
                                    updateGroups([...groups, nextGroup]);
                                    setSelectedScheduleGroupId(id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#DF1B41] text-white hover:bg-[#c81739] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                                <Plus size={14} /> Tạo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {groups.map((group: any) => {
                                const selected = activeGroup.id === group.id;
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedScheduleGroupId(group.id)}
                                        className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${selected ? `border-${colorClass}-300 bg-${colorClass}-50 dark:bg-${colorClass}-500/10 dark:border-${colorClass}-500/30 shadow-sm` : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{group.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-1 truncate">{describeGroupSchedule(group)}</p>
                                            </div>
                                            <input type="checkbox" checked={group.isEnabled !== false} onClick={(e) => e.stopPropagation()} onChange={(e) => updateGroup(group.id, { isEnabled: e.target.checked })} className="w-4 h-4 accent-[#DF1B41]" />
                                        </div>
                                        <p className="mt-3 text-[11px] font-semibold text-slate-500">{(group.itemIds || []).length} món</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <input
                                type="text"
                                value={activeGroup.name || ''}
                                onChange={(e) => updateGroup(activeGroup.id, { name: e.target.value })}
                                className="w-full max-w-xl px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold"
                            />
                            {groups.length > 1 && (
                                <button
                                    onClick={() => {
                                        const remaining = groups.filter((group: any) => group.id !== activeGroup.id);
                                        updateGroups(remaining);
                                        setSelectedScheduleGroupId(remaining[0]?.id || null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 space-y-3">
                            <label className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer">
                                <div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Có lặp lại</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Bật để chọn thứ trong tuần.</p>
                                </div>
                                <input type="checkbox" checked={isRepeating} onChange={(e) => setGroupRepeating(e.target.checked)} className="w-4 h-4 accent-[#DF1B41]" />
                            </label>
                            {isRepeating ? (
                                <div className="space-y-3">
                                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-1">
                                        <button onClick={() => updateGroup(activeGroup.id, { runMode: 'daily', weekdays: allWeekdays })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${activeGroup.runMode === 'daily' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Hằng ngày</button>
                                        <button onClick={() => updateGroup(activeGroup.id, { runMode: 'weekly' })} className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${activeGroup.runMode === 'weekly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'}`}>Chọn thứ</button>
                                    </div>
                                    {activeGroup.runMode === 'weekly' && (
                                        <div className="flex flex-wrap gap-2">
                                            {weekdayLabels.map(day => {
                                                const selected = (activeGroup.weekdays || []).includes(day.id);
                                                return (
                                                    <button
                                                        key={day.id}
                                                        onClick={() => {
                                                            const current = activeGroup.weekdays || [];
                                                            const weekdays = selected ? current.filter((id: number) => id !== day.id) : [...current, day.id];
                                                            updateGroup(activeGroup.id, { weekdays });
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selected ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ngày chạy</label>
                                    <input type="date" value={activeGroup.startDate || ''} onChange={(e) => updateGroup(activeGroup.id, { startDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bắt đầu</label>
                                    <input type="time" value={activeGroup.startTime || ''} onChange={(e) => updateGroup(activeGroup.id, { startTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kết thúc</label>
                                    <input type="time" value={activeGroup.endTime || ''} onChange={(e) => updateGroup(activeGroup.id, { endTime: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                                </div>
                            </div>
                            <details>
                                <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Ngày đặc biệt</summary>
                                <textarea
                                    value={activeGroup.specialDatesText || ''}
                                    onChange={(e) => updateGroup(activeGroup.id, { specialDatesText: e.target.value })}
                                    rows={2}
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm resize-none"
                                    placeholder="VD: 2026-09-02: dùng danh sách món riêng cho ngày lễ"
                                />
                            </details>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chọn món ({itemIds.length}/{limit})</label>
                            <div className="flex gap-2 mb-4">
                                <select
                                    className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                                    onChange={(e) => {
                                        const id = parseInt(e.target.value);
                                        if (id && !itemIds.includes(id) && itemIds.length < limit) {
                                            updateGroup(activeGroup.id, { itemIds: [...itemIds, id] });
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
                                                    onClick={() => updateGroup(activeGroup.id, { itemIds: itemIds.filter((id: number) => id !== item.id) })}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">Chưa có món nào trong khung giờ này.</div>
                                )}
                            </div>
                        </div>
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
            { id: 'cutlery', label: 'Thêm bát đũa', icon: 'Utensils', isOther: false, actionType: 'normal' },
            { id: 'napkin', label: 'Khăn giấy', icon: 'Sparkles', isOther: false, actionType: 'normal' },
            { id: 'clean', label: 'Dọn bàn', icon: 'CheckCircle2', isOther: false, actionType: 'normal' },
            { id: 'bill', label: 'Thanh toán', icon: 'Wallet', isOther: false, actionType: 'normal' },
            { id: 'other', label: 'Yêu cầu khác', icon: 'MoreHorizontal', isOther: true, actionType: 'normal' },
        ];

        const handleOptionChange = (id: string, field: string, value: any) => {
            if (field === 'actionType' && value === 'wifi') {
                if (!restaurantInfo?.wifi_ssid && !restaurantInfo?.wifi_password) {
                    if (showToast) showToast('Cửa hàng chưa có tên Wifi, vui lòng cài đặt thông tin cửa hàng.', 'error');
                    return;
                }
            }
            const newOptions = options.map((opt: any) => opt.id === id ? { ...opt, [field]: value } : opt);
            onChange({ ...config, options: newOptions });
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Cấu hình các yêu cầu hỗ trợ</h5>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${options.length >= 12 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                            {options.length}/12
                        </span>
                    </div>
                    {options.length < 12 ? (
                        <button 
                            onClick={() => onChange({ ...config, options: [...options, { id: 'opt_' + Date.now(), label: 'Tùy chọn mới', icon: 'Star', isOther: false, actionType: 'normal' }] })}
                            className="p-1.5 bg-[#DF1B41]/10 text-[#DF1B41] hover:bg-[#DF1B41]/20 rounded-lg transition-colors"
                            title="Thêm yêu cầu"
                        >
                            <Plus size={16} className="stroke-[2.5]" />
                        </button>
                    ) : (
                        <div className="text-[11px] text-amber-500 font-medium">Đã đạt giới hạn tối đa</div>
                    )}
                </div>
                <div className="space-y-3">
                    {options.map((opt: any) => {
                        const IconComp = IconDictionary[opt.icon] || IconDictionary['HelpCircle'];
                        return (
                            <div key={opt.id} className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl relative hover:border-slate-300 transition-all group shadow-sm hover:shadow-md">
                                <button onClick={() => setIconPickerOpenForId(iconPickerOpenForId === opt.id ? null : opt.id)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-colors text-slate-600 dark:text-slate-400">
                                    <IconComp size={18} />
                                </button>
                                {iconPickerOpenForId === opt.id && (
                                    <div className="absolute top-14 left-0 w-64 p-3 bg-white dark:bg-[#1A1D27] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 grid grid-cols-6 gap-1">
                                        {Object.keys(IconDictionary).slice(0, 30).map(k => (
                                            <button key={k} onClick={() => { handleOptionChange(opt.id, 'icon', k); setIconPickerOpenForId(null); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                                                {React.createElement(IconDictionary[k], { size: 14 })}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex-1 flex flex-col gap-2 min-w-0">
                                    <input 
                                        type="text" 
                                        value={opt.label} 
                                        onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)} 
                                        placeholder="Tên yêu cầu..."
                                        className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400" 
                                    />
                                    <select 
                                        value={opt.actionType || 'normal'}
                                        onChange={(e) => handleOptionChange(opt.id, 'actionType', e.target.value)}
                                        className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-600 outline-none w-fit font-medium hover:border-slate-300 cursor-pointer dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
                                    >
                                        <option value="normal">Action: Gửi lên quán</option>
                                        <option value="wifi">Action: Lấy mã Wifi</option>
                                    </select>
                                </div>
                                <button onClick={() => onChange({ ...config, options: options.filter((o: any) => o.id !== opt.id) })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
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
                <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Cho phép bỏ qua đăng nhập</h5>
                </div>
                <div className="flex items-start justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm gap-4 transition-all hover:border-slate-300">
                    <div>
                        <h6 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Hiển thị nút "Bỏ qua"</h6>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Cho phép khách hàng tạm bỏ qua bước nhập mã OTP trong lúc gọi món, giúp tăng tỷ lệ chốt đơn.
                            <br/>Nếu tắt, khách hàng sẽ bị ép buộc xác thực SĐT trước khi thanh toán.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 scale-[0.85] origin-right">
                        <input type="checkbox" checked={allowSkip} onChange={(e) => onChange({ ...config, allowSkip: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:bg-[#DF1B41] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full peer-checked:after:border-transparent"></div>
                    </label>
                </div>
            </div>
        );
    }

    if (type === 'bad-review-reasons') {
        const TAG_OPTIONS = [
            { id: 'service', name: 'Dịch vụ' },
            { id: 'food', name: 'Món ăn' },
            { id: 'price', name: 'Giá cả' },
            { id: 'env', name: 'Không gian' },
            { id: 'other', name: 'Khác' }
        ];

        const defaultReasons = [
            { id: 'r1', label: 'Phục vụ chậm', tags: ['service'] },
            { id: 'r2', label: 'Món ăn nguội', tags: ['food'] },
            { id: 'r3', label: 'Thái độ nhân viên', tags: ['service'] },
            { id: 'r4', label: 'Giá quá cao', tags: ['price'] },
            { id: 'r5', label: 'Khác', tags: ['other'] }
        ];

        // Migrate string array -> object array and adapt from 'tag' to 'tags'
        const reasons = (config.reasons || defaultReasons).map((r: any, idx: number) => {
            if (typeof r === 'string') return { id: `mig_${idx}_${Date.now()}`, label: r, tags: ['other'] };
            if (r.tag && !r.tags) {
                return { ...r, tags: [r.tag] };
            }
            return { ...r, tags: r.tags || ['other'] };
        });

        const handleReasonChange = (index: number, field: string, val: any) => {
            const newReasons = [...reasons];
            newReasons[index] = { ...newReasons[index], [field]: val };
            onChange({ ...config, reasons: newReasons });
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Các lựa chọn đánh giá xấu</h5>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reasons.length >= 12 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                            {reasons.length}/12
                        </span>
                    </div>
                    {reasons.length < 12 ? (
                        <button 
                            onClick={() => onChange({ ...config, reasons: [...reasons, { id: 'opt_' + Date.now(), label: 'Tuỳ chọn mới', tags: ['other'] }] })} 
                            className="p-1.5 bg-[#DF1B41]/10 text-[#DF1B41] hover:bg-[#DF1B41]/20 rounded-lg transition-colors"
                            title="Thêm lý do"
                        >
                            <Plus size={16} className="stroke-[2.5]" />
                        </button>
                    ) : (
                        <div className="text-[11px] text-amber-500 font-medium">Đã đạt giới hạn tối đa</div>
                    )}
                </div>
                <div className="space-y-3">
                    {reasons.map((r: any, idx: number) => (
                        <div key={r.id || idx} className="flex flex-col gap-3 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-slate-300 transition-colors shadow-sm group">
                            <div className="flex gap-2 items-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                                    <AlertTriangle size={18} />
                                </div>
                                <input 
                                    value={r.label} 
                                    onChange={e => handleReasonChange(idx, 'label', e.target.value)} 
                                    className="flex-1 bg-transparent px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 placeholder:font-normal" 
                                    placeholder="Nhập lý do (VD: Phục vụ chậm)..." 
                                />
                                <button 
                                    onClick={() => onChange({ ...config, reasons: reasons.filter((_: any, i: number) => i !== idx) })} 
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                    title="Xóa"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-[3.25rem] pb-1">
                                {TAG_OPTIONS.map(tag => {
                                    const isActive = (r.tags || []).includes(tag.id);
                                    return (
                                        <button 
                                            key={tag.id}
                                            onClick={() => {
                                                const currentTags = r.tags || [];
                                                const newTags = isActive ? currentTags.filter((t: string) => t !== tag.id) : [...currentTags, tag.id];
                                                handleReasonChange(idx, 'tags', newTags);
                                            }}
                                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold rounded-[8px] transition-all border ${isActive ? 'bg-[#DF1B41] text-white border-[#DF1B41] shadow-sm scale-[1.02]' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            {tag.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 tracking-wide leading-relaxed">
                    Mỗi lý do có thể gắn nhiều Tag cùng lúc. Điều này giúp hệ thống nội bộ Report Dashboard có thể giao thoa phân tích được diện rộng các vấn đề.
                </p>
            </div>
        );
    }

    if (type === 'payment-methods') {
        const methods = config.methods || { cash: true, transfer: true, ewallet: false };
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Hiển thị Phương Thức Thanh Toán</h5>
                </div>
                <div className="space-y-3">
                    {Object.entries({ cash: 'Tiền mặt', transfer: 'Chuyển khoản (QR)', ewallet: 'Ví điện tử (MoMo, ZaloPay)' }).map(([k, label]) => (
                        <div key={k} className="flex justify-between items-center p-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-black/20 hover:border-slate-300 transition-all shadow-sm">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                            <label className="relative inline-flex items-center cursor-pointer scale-[0.85] origin-right">
                                <input type="checkbox" checked={methods[k]} onChange={(e) => onChange({...config, methods: {...methods, [k]: e.target.checked}})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:bg-[#DF1B41] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full peer-checked:after:border-transparent"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'menu-grid') {
        return (
            <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <div className="mt-0.5 text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-xl"><AlertTriangle size={18} /></div>
                <div>
                    <h6 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Danh Mục Cố Định</h6>
                    <p className="text-xs leading-relaxed opacity-90">Block Menu Grid luôn được ghim cố định ở đáy trang đối với mọi sơ đồ hiển thị. Bạn không thể thay đổi hay tắt block này để đảm bảo trải nghiệm khách hàng.</p>
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
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [isConfirmSwitchModalOpen, setIsConfirmSwitchModalOpen] = useState(false);

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const OPERATING_MODELS = [
        { id: 'post-pay', name: 'Mô hình Trả sau', icon: Utensils, desc: 'Khách hàng gọi món tại bàn, nhân viên phục vụ, dùng bữa xong mới thanh toán (Dine-in truyền thống).' },
        { id: 'pre-pay-table', name: 'Trả trước tại bàn', icon: QrCode, desc: 'Khách hàng quét QR tại bàn, lên order và thanh toán trực tiếp qua điện thoại. Nhân viên mang đồ ra.' },
        { id: 'pre-pay-counter', name: 'Trả trước tại quầy', icon: Store, desc: 'Khách hàng order trên điện thoại, sau đó ra quầy thu ngân để thanh toán rồi lấy đồ (Foodcourt/Takeaway).' }
    ];
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'action'>('layout');
    const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
    const [restaurantInfo, setRestaurantInfo] = useState<any>(null);

    useEffect(() => {
        const fetchDisplay = async () => {
            try {
                const res = await fetch('/api/admin/display?resid=100');
                const data = await res.json();
                if (data.success) {
                    if (data.data.operating_model) {
                         const model = OPERATING_MODELS.find(m => m.id === data.data.operating_model);
                         if (model) {
                             setSelectedModel(model);
                         }
                    }
                    if (data.data.draft && data.data.draft.length > 0) {
                        setBlocks(ensureFlashSaleBlock(data.data.draft));
                        setActiveTemplateId('custom-db');
                    } else {
                        setBlocks(ensureFlashSaleBlock(SYSTEM_TEMPLATES[0].blocks));
                        setActiveTemplateId(SYSTEM_TEMPLATES[0].id);
                    }
                }
                const resMenu = await fetch('/api/restaurants/100');
                const menuData = await resMenu.json();
                if (menuData?.menu?.items) setAllMenuItems(menuData.menu.items);
                setRestaurantInfo(menuData);
            } catch (error) { 
                console.error(error); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchDisplay();
    }, []);

    const executePublish = async () => {
        setIsSaving(true);
        try {
            const targetIds = ['100']; // Single restaurant context
            await fetch('/api/admin/display', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds, blocks, operating_model: selectedModel?.id })
            });
            const res = await fetch('/api/admin/display', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_ids: targetIds })
            });
            if (res.ok) { showToast('Phát hành thành công!', 'success'); }
        } catch (e) { showToast('Phát hành thất bại, vui lòng thử lại', 'error'); }
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
        const newBlock = type === 'flash-sale'
            ? { ...createDefaultFlashSaleBlock(), id: 'block-' + Date.now() }
            : { id: 'block-' + Date.now(), type, title: MODULE_DEFINITIONS[type].name, config: {} };
        const menuIdx = blocks.findIndex(b => b.type === 'menu-grid');
        const newBlocks = [...blocks];
        if (menuIdx !== -1) newBlocks.splice(menuIdx, 0, newBlock); else newBlocks.push(newBlock);
        setBlocks(newBlocks);
        setIsAddBlockModalOpen(false);
        setEditingBlockId(newBlock.id);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#050510] justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#DF1B41] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Đang tải cấu hình...</p>
                </div>
            </div>
        );
    }

    if (!selectedModel) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#050510] justify-center items-center p-4">
                <div className="w-full max-w-lg bg-white dark:bg-[#13141A] rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 p-8 relative overflow-hidden">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DF1B41]/10 text-[#DF1B41] mb-4">
                            <LayoutTemplate size={24} className="stroke-[2.5]" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Khởi tạo Màn hình</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Chọn một mô hình vận hành cố định cho nhà hàng của bạn.</p>
                    </div>

                    <div className="space-y-4">
                        {OPERATING_MODELS.map((model) => {
                            const IconCmp = model.icon;
                            return (
                                <button 
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model);
                                        fetch('/api/admin/display', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ res_ids: ['100'], blocks, operating_model: model.id }) });
                                    }}
                                    className="w-full flex items-center p-4 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-[#DF1B41] hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group box-border active:scale-[0.98]"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-black/20 group-hover:bg-[#DF1B41] group-hover:text-white text-slate-500 flex items-center justify-center shrink-0 transition-colors">
                                        <IconCmp size={20} className="stroke-[2.5]" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{model.name}</h3>
                                        <p className="text-[11px] text-slate-500 leading-snug mt-1 font-medium">{model.desc}</p>
                                    </div>
                                    <ArrowLeft size={16} className="ml-2 text-slate-300 group-hover:text-[#DF1B41] rotate-180 transition-colors shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#050510] relative text-slate-800 dark:text-slate-200 font-sans">
            <div className="flex-1 flex overflow-hidden w-full">
                
                {/* LEFT COLUMN: Outline (320px) */}
                <div className="flex flex-col h-full shrink-0 w-[320px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#13141A] relative z-20">
                    
                    {/* Header */}
                    <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/90 dark:bg-[#13141A]/90 backdrop-blur-xl sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#DF1B41]/10 text-[#DF1B41] flex items-center justify-center flex-shrink-0">
                                {React.createElement(selectedModel.icon, { size: 20, className: "stroke-[2.5]" })}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{selectedModel.name}</h1>
                                    <button 
                                        onClick={() => setIsConfirmSwitchModalOpen(true)} 
                                        className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 uppercase tracking-wider active:scale-95"
                                    >
                                        <RefreshCcw size={10} strokeWidth={3} /> Đổi
                                    </button>
                                </div>
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
                                <LayoutTemplate size={14} className={activeTab === 'layout' ? 'stroke-[2.5] text-[#DF1B41]' : ''} /> Bố cục hiển thị
                            </button>
                            <button onClick={() => setActiveTab('action')} className={`flex-1 py-2 rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'action' ? 'bg-white dark:bg-[#2A2E3D] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <Settings2 size={14} className={activeTab === 'action' ? 'stroke-[2.5] text-[#DF1B41]' : ''} /> Tính năng phụ
                            </button>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 mx-auto w-full">
                        {/* LAYOUT TAB */}
                        {activeTab === 'layout' && (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    {blocks.filter(b => {
                                        const def = MODULE_DEFINITIONS[b.type];
                                        if (!def || def.category !== 'layout') return false;
                                        if (def.supportedModels && !def.supportedModels.includes(selectedModel?.id as OperatingModel)) return false;
                                        return true;
                                    }).map((block, idx) => {
                                        const def = MODULE_DEFINITIONS[block.type];
                                        const isLocked = isModuleLocked(block.type);
                                        const isSystem = block.type !== 'custom';
                                        const isCore = block.type === 'menu-grid';
                                        const isEnabled = block.config?.isEnabled !== false; // default true
                                        const needsConfig = isEnabled && !isBlockValid(block);
                                        
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
                                                            {needsConfig && <span className="lowercase bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-amber-200 dark:border-amber-500/20 tracking-normal">Cần cấu hình</span>}
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
                                {(Object.keys(MODULE_DEFINITIONS) as ModuleType[]).filter(k => {
                                    const def = MODULE_DEFINITIONS[k];
                                    if (def.category !== 'action') return false;
                                    if (def.supportedModels && !def.supportedModels.includes(selectedModel?.id as OperatingModel)) return false;
                                    return true;
                                }).map((type, idx) => {
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

                </div> {/* End Left Column */}

                {/* CENTER COLUMN: Workspace / Inspector Pane */}
                <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#0a0a0f] min-w-0 h-full relative z-10">
                    {editingBlockId ? (
                        (() => {
                           const type = editingBlockId as ModuleType;
                           let activeEditorBlock = blocks.find(b => b.id === editingBlockId || b.type === type);
                           let isCurrentlyEnabled = true;
                           
                           if (!activeEditorBlock) {
                               activeEditorBlock = { id: 'act-' + type, type, title: MODULE_DEFINITIONS[type]?.name, config: {} } as StorefrontBlock;
                               if (MODULE_DEFINITIONS[type]?.category === 'action') {
                                   isCurrentlyEnabled = false;
                               }
                           } else if (MODULE_DEFINITIONS[activeEditorBlock.type]?.category === 'action') {
                               isCurrentlyEnabled = activeEditorBlock.config?.isEnabled !== false;
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
                                 <div className="flex-1 overflow-y-auto p-6 xl:p-8 hidden-scroll relative">
                                    {isCurrentlyEnabled ? (
                                        <div className={`${['flash-sale', 'combo', 'best-sale'].includes(activeEditorBlock.type) ? 'max-w-none' : 'max-w-2xl mx-auto'} pb-24 animation-fade-in`}>
                                            <ModuleConfigForm 
                                                block={activeEditorBlock} 
                                                allMenuItems={allMenuItems} 
                                                restaurantInfo={restaurantInfo} 
                                                showToast={showToast} 
                                                onChange={(conf) => {
                                                    setBlocks(prev => {
                                                        const existingIdx = prev.findIndex(b => b.id === activeEditorBlock!.id || b.type === activeEditorBlock!.type);
                                                        if (existingIdx > -1) {
                                                            return prev.map((b, i) => i === existingIdx ? { ...b, config: { ...b.config, ...conf } } : b);
                                                        }
                                                        // Auto-enable block if it wasn't enabled but user is trying to configure it
                                                        return [...prev, { ...activeEditorBlock!, config: { ...activeEditorBlock!.config, ...conf, isEnabled: true } }];
                                                    });
                                                }} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="max-w-md mx-auto mt-24 text-center animation-fade-in">
                                            <div className="w-20 h-20 mx-auto rounded-[2rem] bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-sm">
                                                <Settings2 size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Tính năng đang Tắt</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-8">Bạn cần kích hoạt tính năng <strong className="text-slate-700 dark:text-slate-300">{def?.name}</strong> này để có thể bắt đầu cài đặt và cấu hình các thông số hiển thị.</p>
                                            
                                            <button 
                                                onClick={() => {
                                                    const type = activeEditorBlock!.type;
                                                    const newConf = { ...(activeEditorBlock!.config || {}), isEnabled: true };
                                                    setBlocks(prev => {
                                                        const existingIdx = prev.findIndex(b => b.type === type);
                                                        if (existingIdx > -1) {
                                                            return prev.map((b, i) => i === existingIdx ? { ...b, config: newConf } : b);
                                                        }
                                                        return [...prev, { ...activeEditorBlock!, config: newConf }];
                                                    });
                                                }}
                                                className="px-8 py-3 bg-[#DF1B41] hover:bg-[#c9183a] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(223,27,65,0.25)] hover:shadow-[0_12px_25px_rgba(223,27,65,0.35)] transition-all hover:-translate-y-1"
                                            >
                                                Bật tính năng này
                                            </button>
                                        </div>
                                    )}
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
                </div> {/* End Center Column */}
                
            </div> {/* END OF MAIN FLEX */}

            {/* FLOATING ACTION DOCK */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-700 dark:border-white/20 animation-slide-up">
                <span className="text-xs text-slate-400 dark:text-slate-500 px-3 font-semibold hidden md:block">Cho: {selectedModel.name}</span>
                <div className="w-px h-6 bg-slate-700 dark:bg-slate-300 mx-1 hidden md:block"></div>
                
                <button onClick={() => showToast('Đã lưu bản nháp an toàn', 'success')} className="px-5 py-2.5 text-slate-300 dark:text-slate-600 font-bold text-sm hover:text-white dark:hover:text-black transition-colors active:scale-95 flex items-center gap-2 relative group">
                    <Save size={16} /> Nháp
                </button>
                <div className="w-px h-6 bg-slate-700 dark:bg-slate-300 mx-1"></div>
                <button onClick={executePublish} disabled={isSaving} className="px-6 py-2.5 bg-[#DF1B41] text-white rounded-xl font-bold text-sm hover:bg-[#c41535] transition-all shadow-[0_0_15px_rgba(223,27,65,0.4)] disabled:opacity-50 active:scale-95 flex items-center gap-2">
                    <CheckCircle2 size={16} /> {isSaving ? 'Đang xuất bản...' : 'Phát Hành Lên Quán'}
                </button>
            </div>

            {/* Modals */}


            {/* LIVE PREVIEW MODAL */}
            {showSimulator && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animation-fade-in" onClick={() => setShowSimulator(false)}>
                    <div className="relative flex flex-col items-center animation-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center w-full max-w-[375px] mb-4">
                            <h3 className="text-white font-black text-lg">Bản xem trước</h3>
                            <button onClick={() => setShowSimulator(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
                        </div>
                        <div className="relative w-[375px] h-[750px] bg-black rounded-[45px] border-[12px] border-black shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 ring-1 ring-white/10">
                            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-[100] pointer-events-none">
                                <div className="w-32 h-5 bg-black rounded-b-2xl"></div>
                            </div>
                            <iframe 
                                title="Simulator"
                                src="/menu?preview=1" 
                                className="w-full h-full border-none bg-white relative z-0" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM SWITCH MODEL MODAL */}
            {isConfirmSwitchModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animation-fade-in" onClick={() => setIsConfirmSwitchModalOpen(false)}>
                    <div className="bg-white dark:bg-[#13141A] rounded-3xl w-full max-w-sm shadow-[0_16px_64px_rgba(0,0,0,0.2)] p-6 text-center animation-slide-up relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="stroke-[2]" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Chuyển đổi Mô hình?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            Việc thay đổi mô hình sẽ tải lại một môi trường cấu hình hoàn toàn mới. Các thiết lập cấu hình đặc thù dành cho mô hình hiện tại có thể bị ẩn đi.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsConfirmSwitchModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm">Quay lại</button>
                            <button 
                                onClick={() => {
                                    setIsConfirmSwitchModalOpen(false);
                                    setSelectedModel(null);
                                }} 
                                className="flex-1 py-3 bg-[#DF1B41] hover:bg-[#c41535] transition-colors text-white rounded-xl font-bold text-sm shadow-md"
                            >
                                Đồng ý Đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animation-slide-up">
                    <div className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md border ${toastMessage.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500/30 dark:text-emerald-300' : toastMessage.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-500/30 dark:text-rose-300' : 'bg-slate-900/90 border-slate-700 text-white'}`}>
                        {toastMessage.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
                        {toastMessage.type === 'error' && <AlertTriangle size={18} className="shrink-0" />}
                        {toastMessage.type === 'info' && <Settings2 size={18} className="shrink-0" />}
                        <span className="font-bold text-sm tracking-wide">{toastMessage.text}</span>
                    </div>
                </div>
            )}
        </div>

    );
}

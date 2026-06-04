import React, { Suspense } from 'react';
import ClientWrapper from './ClientWrapper';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const normalizeRunMode = (runMode?: string) => runMode === 'weekly' ? 'weekly' : runMode === 'once' ? 'once' : 'daily';

const createDisplaySlot = (id: string, name: string, itemIds: Array<string | number>, overrides: any = {}) => ({
    id,
    name,
    isEnabled: overrides.isEnabled !== false,
    repeatMode: normalizeRunMode(overrides.repeatMode || overrides.runMode),
    weekdays: overrides.weekdays || [1, 2, 3, 4, 5, 6, 0],
    startDate: overrides.startDate,
    startTime: overrides.startTime || '00:00',
    endTime: overrides.endTime || '23:59',
    specialDatesText: overrides.specialDatesText || '',
    itemIds
});

const createNativeGroup = (category: string, order: number, menuItems: any[]) => ({
    id: `native_${String(category).toLowerCase().replace(/\s+/g, '_')}`,
    name: category,
    order,
    isEnabled: true,
    sourceType: 'native',
    sourceCategory: category,
    isSpecial: false,
    isHighlight: false,
    backgroundImg: '',
    isCountdown: false,
    countdownLabel: 'Kết thúc sau',
    scheduleSlots: [createDisplaySlot(`slot_${String(category).toLowerCase().replace(/\s+/g, '_')}`, 'Cả ngày', menuItems.filter(item => item.category === category).map(item => item.id))]
});

const normalizeMenuGroupsForStorefront = (config: any = {}, menuItems: any[] = []) => {
    const nativeCategories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));
    const existingGroups = Array.isArray(config.groups) ? config.groups : [];
    const normalizedGroups = existingGroups.map((group: any, index: number) => ({
        id: group.id || `group_${index + 1}`,
        name: group.name || `Nhóm ${index + 1}`,
        order: Number.isFinite(Number(group.order)) ? Number(group.order) : index + 1,
        isEnabled: group.isEnabled !== false,
        sourceType: group.sourceType || 'custom',
        sourceCategory: group.sourceCategory,
        isSpecial: group.isSpecial === true,
        isHighlight: group.isHighlight ?? group.isSpecial === true,
        backgroundImg: group.backgroundImg || '',
        isCountdown: group.isCountdown === true,
        countdownLabel: group.countdownLabel || 'Kết thúc sau',
        scheduleSlots: (Array.isArray(group.scheduleSlots) && group.scheduleSlots.length > 0 ? group.scheduleSlots : [])
            .map((slot: any, slotIndex: number) => createDisplaySlot(slot.id || `slot_${slotIndex + 1}`, slot.name || `Khung giờ ${slotIndex + 1}`, slot.itemIds || [], slot))
    }));
    const existingNative = new Set(normalizedGroups.filter((group: any) => group.sourceType === 'native').map((group: any) => group.sourceCategory || group.name));
    const missingNative = nativeCategories
        .filter(category => !existingNative.has(category))
        .map((category, index) => createNativeGroup(category, normalizedGroups.length + index + 1, menuItems));

    return {
        ...config,
        isEnabled: config.isEnabled !== false,
        groups: [...normalizedGroups, ...missingNative].sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
    };
};

const migrateDisplayConfigForStorefront = (blocks: any[], menuItems: any[] = []) => {
    const deprecatedTypes = new Set(['flash-sale', 'combo', 'best-sale', 'custom', 'menu-grid']);
    const existingMenuGroups = blocks.find(block => block.type === 'menu-groups');
    if (existingMenuGroups) {
        return [
            { ...existingMenuGroups, config: normalizeMenuGroupsForStorefront(existingMenuGroups.config, menuItems) },
            ...blocks.filter(block => block.type !== 'menu-groups' && !deprecatedTypes.has(block.type))
        ];
    }

    const groups: any[] = [];
    const categories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));
    categories.forEach((category, index) => groups.push(createNativeGroup(category, index + 1, menuItems)));

    const flashBlock = blocks.find(block => block.type === 'flash-sale');
    if (flashBlock) {
        const campaigns = Array.isArray(flashBlock.config?.campaigns) ? flashBlock.config.campaigns : [];
        const scheduleSlots = campaigns.map((campaign: any, index: number) => createDisplaySlot(
            campaign.id || `flash_slot_${index + 1}`,
            campaign.name || `Khung giờ ${index + 1}`,
            (campaign.items || []).map((item: any) => item.itemId),
            campaign
        ));
        if (scheduleSlots.some((slot: any) => (slot.itemIds || []).length > 0)) {
            groups.unshift({
                id: 'legacy_flash_sale',
                name: flashBlock.title || flashBlock.config?.displayTitle || 'Ưu đãi giới hạn',
                order: 0,
                isEnabled: flashBlock.config?.isEnabled !== false,
                sourceType: 'custom',
                isSpecial: true,
                isHighlight: true,
                backgroundImg: '',
                isCountdown: flashBlock.config?.showCountdown !== false,
                countdownLabel: 'Kết thúc sau',
                scheduleSlots
            });
        }
    }

    (['combo', 'best-sale'] as const).forEach(type => {
        const block = blocks.find(candidate => candidate.type === type);
        if (!block) return;
        const scheduleGroups = Array.isArray(block.config?.scheduleGroups) && block.config.scheduleGroups.length > 0
            ? block.config.scheduleGroups
            : [{ id: `legacy_${type}_slot`, name: block.title || 'Khung giờ mặc định', itemIds: block.config?.itemIds || [], runMode: 'daily', startTime: '00:00', endTime: '23:59' }];
        const scheduleSlots = scheduleGroups.map((group: any, index: number) => createDisplaySlot(group.id || `slot_${index + 1}`, group.name || `Khung giờ ${index + 1}`, group.itemIds || [], group));
        if (!scheduleSlots.some((slot: any) => (slot.itemIds || []).length > 0)) return;
        groups.push({
            id: `legacy_${type}`,
            name: block.title || (type === 'combo' ? 'Combo Tiết Kiệm' : 'Món Bán Chạy'),
            order: groups.length + 1,
            isEnabled: block.config?.isEnabled !== false,
            sourceType: 'custom',
            isSpecial: true,
            isHighlight: true,
            backgroundImg: '',
            isCountdown: false,
            countdownLabel: 'Kết thúc sau',
            scheduleSlots
        });
    });

    blocks.filter(block => block.type === 'custom').forEach((block, index) => {
        const itemIds = menuItems.filter(item => item.category === block.config?.groupName).map(item => item.id);
        if (itemIds.length === 0) return;
        groups.push({
            id: block.id || `legacy_custom_${index + 1}`,
            name: block.config?.groupName || block.title || `Nhóm tuỳ chỉnh ${index + 1}`,
            order: groups.length + 1,
            isEnabled: block.config?.isEnabled !== false,
            sourceType: 'custom',
            isSpecial: true,
            isHighlight: false,
            backgroundImg: '',
            isCountdown: false,
            countdownLabel: 'Kết thúc sau',
            scheduleSlots: [createDisplaySlot(`slot_${block.id || index + 1}`, 'Cả ngày', itemIds)]
        });
    });

    return [
        {
            id: 'menu-groups',
            type: 'menu-groups',
            title: 'Nhóm Hiển Thị Menu',
            config: normalizeMenuGroupsForStorefront({ isEnabled: true, groups }, menuItems)
        },
        ...blocks.filter(block => !deprecatedTypes.has(block.type))
    ];
};

const loadMenuItemsForRestaurant = async (resid: string, db: any) => {
    const menuRow = await db.get('SELECT menu_data FROM restaurant_menus WHERE resid = ?', [resid]);
    if (menuRow?.menu_data) {
        return JSON.parse(menuRow.menu_data)?.items || [];
    }
    const menusPath = path.join(process.cwd(), 'src/data/menus.json');
    const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));
    return menus[resid]?.items || [];
};

export default async function MenuPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const style = (searchParams.style as string) || 'menu';
    const paytype = (searchParams.paytype as string);
    const rawTableId = searchParams.tableid || searchParams.tableId;
    const isPreview = searchParams.preview === '1';
    
    let tableid = rawTableId as string;
    
    // Strict Domain Logic
    if (paytype === 'PREPAID' || isPreview) {
        tableid = rawTableId ? (rawTableId as string) : (isPreview ? 'PREVIEW_TABLE' : 'COUNTER');
    } else {
        if (!rawTableId) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Lỗi truy cập</h1>
                    <p style={{ marginBottom: '24px', color: '#64748b' }}>Bạn chưa định danh Bàn.<br />Vui lòng quét chuẩn mã QR tại bàn để hệ thống phục vụ.</p>
                </div>
            );
        }
    }

    const resid = (searchParams.resid || searchParams.resId || '100') as string;

    const db = await getDb();
    let table = null;
    const menuItemsForDisplay = isPreview ? [] : await loadMenuItemsForRestaurant(resid, db);
    
    if (isPreview) {
        table = { id: 'PREVIEW_TABLE' };
    } else {
        table = tableid === 'COUNTER' 
            ? { id: 'COUNTER' } 
            : await db.get('SELECT id FROM tables WHERE id = ?', [tableid]);
    }

    if (!table) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Rất tiếc!</h1>
                <p style={{ marginBottom: '24px', color: '#64748b' }}>Bàn "{tableid}" không tồn tại trên hệ thống.<br />Vui lòng quét đúng mã QR tại bàn để gọi món.</p>
            </div>
        );
    }

    let configData = null;
    if (isPreview) {
        // Provide a stub config for preview mode, actual config will be fed via postMessage in ClientWrapper
        configData = [];
    } else {
        const restoRow = await db.get('SELECT operating_model FROM restaurants WHERE id = ?', [resid]);
        const operatingModel = restoRow?.operating_model;

        const configRow = await db.get('SELECT published_blocks FROM restaurant_display_configs WHERE res_id = ?', [resid]);
        if (configRow && configRow.published_blocks && configRow.published_blocks !== '[]') {
            const parsed = JSON.parse(configRow.published_blocks);
            const validTypes = ['menu-groups', 'flash-sale', 'for-you', 'combo', 'best-sale', 'custom', 'menu-grid', 'onboarding-wizard', 'support-options', 'checkout-auth', 'bad-review-reasons', 'payment-methods'];
            
            const MODULE_SUPPORT_MAP: Record<string, string[]> = {
                 'support-options': ['post-pay', 'pre-pay-table'],
                 'checkout-auth': ['pre-pay-table', 'pre-pay-counter'],
                 'payment-methods': ['pre-pay-table', 'pre-pay-counter']
            };

            const validBlocks = parsed.filter((b: any) => {
                 if (!validTypes.includes(b.type)) return false;
                 
                 // Apply visibility filtering based on selected operating model
                 if (operatingModel && MODULE_SUPPORT_MAP[b.type] && !MODULE_SUPPORT_MAP[b.type].includes(operatingModel)) {
                      return false;
                 }
                 return true;
            });

            const migratedBlocks = migrateDisplayConfigForStorefront(validBlocks, menuItemsForDisplay);

            if (migratedBlocks.length > 0 && migratedBlocks.some((b: any) => b.type === 'menu-groups' || b.type === 'for-you')) {
                configData = migratedBlocks;
            } else {
                // Rỗng do toàn bộ block cũ bị deprecated
                configData = null; 
            }
        } 
    }
    
    if (!configData && !isPreview) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ width: '80px', height: '80px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚙️</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Chưa có cấu hình hiển thị</h1>
                <p style={{ marginBottom: '24px', color: '#64748b' }}>Nhà hàng chưa xuất bản giao diện thực đơn.<br />Vui lòng liên hệ quản lý để tiến hành cài đặt Cấu hình hiển thị.</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div>Đang tải giao diện...</div>}>
            <ClientWrapper style={style} tableid={tableid} resid={resid} displayConfig={configData || []} isPreview={isPreview} />
        </Suspense>
    );
}

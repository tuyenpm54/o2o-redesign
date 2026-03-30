import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

async function getMenuWithOverrides(resid: string) {
    const db = await getDb();

    const row = await db.get(
        'SELECT menu_data, item_overrides, pos_sync_config FROM restaurant_menus WHERE resid = ?',
        [resid]
    );

    let menu = { categories: [] as string[], items: [] as any[], preferences: [] as any[] };
    let itemOverrides: Record<string, { isActive: boolean }> = {};
    let posSyncConfig = { enabled: false, syncFields: [] as string[], lastSync: null as string | null };

    if (row?.menu_data) {
        try { menu = JSON.parse(row.menu_data); } catch {}
    } else {
        // Fallback to static JSON when DB has no menu for this restaurant
        try {
            const menusPath = path.join(process.cwd(), 'src/data/menus.json');
            const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));
            menu = menus[resid] || menu;
        } catch {}
    }

    if (row?.item_overrides) {
        try { itemOverrides = JSON.parse(row.item_overrides); } catch {}
    }
    if (row?.pos_sync_config) {
        try { posSyncConfig = JSON.parse(row.pos_sync_config); } catch {}
    }

    const lockedFields = posSyncConfig.enabled ? posSyncConfig.syncFields : [];
    const enrichedItems = menu.items.map((item: any) => ({
        ...item,
        isActive: itemOverrides[String(item.id)]?.isActive ?? true,
        lockedFields,
    }));

    return { categories: menu.categories, items: enrichedItems, preferences: menu.preferences, posSyncConfig };
}

export async function GET(request: NextRequest) {
    const resid = request.nextUrl.searchParams.get('resid');
    if (!resid) return NextResponse.json({ error: 'resid required' }, { status: 400 });
    try {
        const data = await getMenuWithOverrides(resid);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Admin menu GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { resid, itemId, ...updates } = body;
        if (!resid || itemId === undefined) {
            return NextResponse.json({ error: 'resid and itemId required' }, { status: 400 });
        }

        const db = await getDb();
        const existing = await db.get(
            'SELECT item_overrides, pos_sync_config FROM restaurant_menus WHERE resid = ?',
            [resid]
        );

        let itemOverrides: Record<string, any> = {};
        if (existing?.item_overrides) {
            try { itemOverrides = JSON.parse(existing.item_overrides); } catch {}
        }

        // Merge updates into the specific itemId override object
        itemOverrides[String(itemId)] = { 
            ...(itemOverrides[String(itemId)] || {}),
            ...updates 
        };

        if (existing) {
            await db.run(
                'UPDATE restaurant_menus SET item_overrides = ? WHERE resid = ?',
                [JSON.stringify(itemOverrides), resid]
            );
        } else {
            await db.run(
                'INSERT INTO restaurant_menus (resid, item_overrides) VALUES (?, ?)',
                [resid, JSON.stringify(itemOverrides)]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin menu PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

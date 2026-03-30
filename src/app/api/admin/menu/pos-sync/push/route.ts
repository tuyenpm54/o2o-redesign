import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resid, secret, items } = body;

        if (!resid || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const db = await getDb();
        const row = await db.get(
            'SELECT pos_sync_config, menu_data FROM restaurant_menus WHERE resid = ?',
            [resid]
        );

        if (!row) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const posSyncConfig = row.pos_sync_config ? JSON.parse(row.pos_sync_config) : null;

        if (!posSyncConfig?.enabled) {
            return NextResponse.json({ error: 'POS sync is not enabled' }, { status: 403 });
        }

        if (posSyncConfig.webhookSecret && posSyncConfig.webhookSecret !== secret) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }

        const syncFields: string[] = posSyncConfig.syncFields || [];
        const currentMenu = row.menu_data
            ? JSON.parse(row.menu_data)
            : { categories: [], items: [], preferences: [] };

        let updatedCount = 0;
        currentMenu.items = currentMenu.items.map((item: any) => {
            const posItem = items.find((p: any) => String(p.id) === String(item.id));
            if (!posItem) return item;
            const updated = { ...item };
            for (const field of syncFields) {
                if (posItem[field] !== undefined) updated[field] = posItem[field];
            }
            updatedCount++;
            return updated;
        });

        const updatedConfig = {
            ...posSyncConfig,
            lastSync: new Date().toISOString(),
            lastSyncCount: updatedCount,
        };

        await db.run(
            'UPDATE restaurant_menus SET menu_data = ?, pos_sync_config = ? WHERE resid = ?',
            [JSON.stringify(currentMenu), JSON.stringify(updatedConfig), resid]
        );

        return NextResponse.json({ success: true, updatedCount, lastSync: updatedConfig.lastSync });
    } catch (error) {
        console.error('POS sync push error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}

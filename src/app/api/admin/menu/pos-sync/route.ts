import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
    const resid = request.nextUrl.searchParams.get('resid');
    if (!resid) return NextResponse.json({ error: 'resid required' }, { status: 400 });
    try {
        const db = await getDb();
        const row = await db.get(
            'SELECT pos_sync_config FROM restaurant_menus WHERE resid = ?',
            [resid]
        );
        let config = { enabled: false, syncFields: [] as string[], lastSync: null as string | null };
        if (row?.pos_sync_config) {
            try { config = JSON.parse(row.pos_sync_config); } catch {}
        }
        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        console.error('POS sync GET error:', error);
        return NextResponse.json({ error: 'Failed to get POS config' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resid, enabled, syncFields } = body;
        if (!resid) return NextResponse.json({ error: 'resid required' }, { status: 400 });

        const db = await getDb();
        const existing = await db.get(
            'SELECT pos_sync_config FROM restaurant_menus WHERE resid = ?',
            [resid]
        );

        let existingConfig: any = {};
        if (existing?.pos_sync_config) {
            try { existingConfig = JSON.parse(existing.pos_sync_config); } catch {}
        }

        const newConfig = {
            ...existingConfig,
            enabled: enabled ?? existingConfig.enabled ?? false,
            syncFields: syncFields ?? existingConfig.syncFields ?? [],
        };

        if (existing) {
            await db.run(
                'UPDATE restaurant_menus SET pos_sync_config = ? WHERE resid = ?',
                [JSON.stringify(newConfig), resid]
            );
        } else {
            await db.run(
                'INSERT INTO restaurant_menus (resid, pos_sync_config) VALUES (?, ?)',
                [resid, JSON.stringify(newConfig)]
            );
        }

        return NextResponse.json({ success: true, data: newConfig });
    } catch (error) {
        console.error('POS sync POST error:', error);
        return NextResponse.json({ error: 'Failed to save POS config' }, { status: 500 });
    }
}

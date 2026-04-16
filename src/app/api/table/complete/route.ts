import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { resid, tableid } = await request.json();

        if (!resid || !tableid) {
            return NextResponse.json({ error: 'Missing resid or tableid' }, { status: 400 });
        }

        const db = await getDb();
        
        // Mark the active session as PAID to "reset" the table from the EU's perspective
        // especially useful for COUNTER where the flow is completely finished.
        await db.run(
            `UPDATE table_sessions SET status = 'PAID' WHERE resid = ? AND UPPER(tableid) = UPPER(?) AND status = 'ACTIVE'`,
            [resid, tableid]
        );

        // Bump table version to notify sync polling clients that the table was cleared
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resid}_${tableid}`, Date.now().toString()]
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to complete table session:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

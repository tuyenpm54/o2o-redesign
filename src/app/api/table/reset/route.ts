import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { resid, tableid } = await request.json();

        if (!resid || !tableid) {
            return NextResponse.json({ error: 'Missing resid or tableid' }, { status: 400 });
        }

        const db = await getDb();

        // Clear the payment completed flag and ANY leftover checkout requested flag
        await db.run('DELETE FROM kv_store WHERE key = ?', [`payment_completed_${resid}_${tableid}`]);
        await db.run('DELETE FROM kv_store WHERE key = ?', [`checkout_requested_${resid}_${tableid}`]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to reset table flag:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

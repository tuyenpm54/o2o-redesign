import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiError, ApiSuccess } from '@/lib/api-response';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { resid, tableid } = await request.json();

        if (!resid || !tableid) {
            return ApiError('Missing resid or tableid', 400);
        }

        const db = await getDb();

        const activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resid, tableid]
        );

        if (!activeSession) {
             return ApiSuccess({ message: 'Session already closed or not found' });
        }

        const now = Date.now();

        // Mark session as SOLD OUT/PAID (Completed) without creating another invoice
        await db.run(
            `UPDATE table_sessions SET status = 'PAID', ended_at = ? WHERE id = ?`,
            [now, activeSession.id]
        );

        // Clear transient draft items from this table
        await db.run('DELETE FROM cart_items WHERE resid = ? AND tableid = ?', [resid, tableid]);
        
        // Remove active users from the presence map
        await db.run('DELETE FROM session_presences WHERE resid = ? AND tableid = ?', [resid, tableid]);
        
        // Let chat messages remain or delete them
        await db.run("DELETE FROM chat_messages WHERE resid = ? AND tableid = ? AND type != 'SUPPORT'", [resid, tableid]);

        // Push Table closed event to KV store
        const key = `table_status_${resid}_${tableid}`;
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [key, Date.now().toString()]
        );

        return ApiSuccess({ message: `Table ${tableid} prepaid session completed successfully.` });
    } catch (e) {
        console.error("[API session complete] Failed:", e);
        return ApiError('Internal Server Error', 500);
    }
}

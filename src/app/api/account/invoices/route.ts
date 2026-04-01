import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return ApiError('Not authenticated', 401);
        }

        const db = await getDb();

        // Validate session
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session || session.expires < Date.now()) {
            return ApiError('Session expired', 401);
        }

        const userId = session.user_id;

        // Simplify query for PostgreSQL - find sessions first, then map them
        const invoices = await db.all(`
            SELECT 
                ts.id,
                ts.resid,
                ts.tableid,
                ts.status,
                ts.started_at,
                ts.ended_at,
                ts.total as stored_total,
                (SELECT COUNT(*) FROM order_items WHERE table_session_id = ts.id AND user_id = ?) as item_count,
                (SELECT SUM(price * qty) FROM order_items WHERE table_session_id = ts.id AND user_id = ?) as computed_total
            FROM table_sessions ts
            WHERE ts.id IN (
                SELECT DISTINCT table_session_id FROM order_items WHERE user_id = ?
            )
            AND ts.status = 'PAID'
            ORDER BY ended_at DESC
            LIMIT 50
        `, [userId, userId, userId]);

        // Use stored_total if available, otherwise computed_total
        const formattedInvoices = invoices.map((inv: any) => ({
            id: inv.id,
            resid: inv.resid,
            tableid: inv.tableid,
            startedAt: Number(inv.started_at) || 0,
            endedAt: Number(inv.ended_at) || 0,
            total: inv.stored_total || inv.computed_total || 0,
            itemCount: inv.item_count || 0,
        }));

        return ApiSuccess({ invoices: formattedInvoices });
    } catch (error) {
        console.error('Account invoices error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

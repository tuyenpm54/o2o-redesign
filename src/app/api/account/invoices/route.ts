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

        // Get all PAID table_sessions where this user has order_items
        const invoices = await db.all(`
            SELECT 
                COALESCE(i.id, ts.id) as id,
                ts.resid,
                ts.tableid,
                COALESCE(i.status, ts.status) as status,
                ts.started_at,
                COALESCE(i.created_at, ts.ended_at) as ended_at,
                COALESCE(i.total, ts.total) as stored_total,
                COUNT(DISTINCT o.id) as item_count,
                SUM(o.price * o.qty) as computed_total
            FROM table_sessions ts
            LEFT JOIN invoices i ON i.table_session_id = ts.id
            INNER JOIN order_items o 
              ON o.resid = ts.resid 
             AND o.tableid = ts.tableid 
             AND o.timestamp >= ts.started_at
             AND (ts.ended_at IS NULL OR o.timestamp <= ts.ended_at)
            WHERE o.user_id = ?
              AND ts.status = 'PAID'
            GROUP BY i.id, ts.id, ts.resid, ts.tableid, i.status, ts.status, ts.started_at, i.created_at, ts.ended_at, i.total, ts.total
            ORDER BY ended_at DESC
            LIMIT 50
        `, [userId]);

        // Use stored_total if available, otherwise computed_total
        const formattedInvoices = invoices.map((inv: any) => ({
            id: inv.id,
            resid: inv.resid,
            tableid: inv.tableid,
            startedAt: inv.started_at,
            endedAt: inv.ended_at,
            total: inv.stored_total || inv.computed_total || 0,
            itemCount: inv.item_count || 0,
        }));

        return ApiSuccess({ invoices: formattedInvoices });
    } catch (error) {
        console.error('Account invoices error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

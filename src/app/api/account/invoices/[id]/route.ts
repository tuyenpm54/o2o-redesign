import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return ApiError('Not authenticated', 401);
        }

        const db = await getDb();

        // 1. Validate session
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session || session.expires < Date.now()) {
            return ApiError('Session expired', 401);
        }

        const userId = session.user_id;

        // 2. Fetch table_session (The invoice source)
        // We ensure the user belongs to this table session by checking order_items
        const invoice = await db.get(`
            SELECT ts.* 
            FROM table_sessions ts
            WHERE ts.id = ? 
            AND ts.id IN (SELECT DISTINCT table_session_id FROM order_items WHERE user_id = ?)
        `, [id, userId]);

        if (!invoice) {
            return ApiError('Invoice not found or Access denied', 404);
        }

        // 3. Fetch all order items for this specific user in this session
        // Actually, user wants a FULL invoice. Does it mean only their items or the WHOLE table?
        // Standard payment invoice usually shows what was ordered at the table.
        // But for per-user history, we show what they ordered.
        // Let's fetch the items that BELONG TO THIS USER at this table session.
        const items = await db.all(`
            SELECT * FROM order_items 
            WHERE table_session_id = ? AND user_id = ?
            ORDER BY timestamp ASC
        `, [id, userId]);

        // 4. Fetch Restaurant Info (from metadata)
        const restaurantsPath = path.join(process.cwd(), 'src/data/restaurants.json');
        const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
        const restaurant = restaurants.find((r: any) => String(r.id) === String(invoice.resid)) || {
            name: "O2O Restaurant",
            address: "123 Lê Lợi, Quận 1, TP. HCM",
            phone: "0900.000.000"
        };

        // 5. Fetch User Info (for the bill)
        const user = await db.get('SELECT name, phone FROM users WHERE id = ?', [userId]);

        // 6. Fetch VAT info (if exists)
        const vat = await db.get('SELECT * FROM invoice_vats WHERE invoice_id = ? AND user_id = ?', [id, userId]);

        return ApiSuccess({
            invoice: {
                id: invoice.id,
                resid: invoice.resid,
                tableid: invoice.tableid,
                startedAt: Number(invoice.started_at),
                endedAt: Number(invoice.ended_at),
                total: invoice.total || items.reduce((acc, it) => acc + (it.price * it.qty), 0),
                subtotal: items.reduce((acc, it) => acc + (it.price * it.qty), 0),
                vatAmount: 0 // Mocked for now
            },
            restaurant,
            user,
            items: items.map(it => ({
                ...it,
                selections: it.selections ? JSON.parse(it.selections) : []
            })),
            vat
        });
    } catch (error) {
        console.error('Invoice detail error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { id: session.user_id, tableid: session.tableid };
}

export async function GET(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user) return ApiSuccess({ items: [], total: 0 });
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const resId = searchParams.get('resId');
    const tableid = searchParams.get('tableid');
    if (!resId) return ApiError('Missing resId', 400);

    try {
        const db = await getDb();
        // Get active session
        let activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resId, tableid || 'fallback']
        );

        if (!activeSession) {
            return ApiSuccess({ items: [], total: 0 });
        }

        // ISOLATION: Filter by user and table_session_id
        let query = 'SELECT * FROM cart_items WHERE user_id = ? AND table_session_id = ?';
        let params = [userId, activeSession.id];

        const cartItems = await db.all(query + ' ORDER BY added_at ASC', params);

        const formattedItems = cartItems.map(row => ({
            id: row.id,
            item: { id: row.item_id, name: row.name, price: row.price, img: row.img },
            quantity: row.qty,
            selections: row.selections ? JSON.parse(row.selections) : null
        }));

        const total = formattedItems.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0);

        return ApiSuccess({ items: formattedItems, total });
    } catch (e) {
        return ApiError('Failed', 500);
    }
}

export async function POST(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user) return ApiError('Unauthorized', 401);
    const userId = user.id;

    const { resId, item, quantity, selections, tableid, suggestion_source } = await request.json();
    const selectionsStr = selections ? JSON.stringify(selections) : null;
    const source = suggestion_source || 'organic';

    try {
        const db = await getDb();

        // Check if table is locked for checkout — use provided tableid first, fallback to session
        const activeTableId = tableid || user.tableid;
        if (quantity > 0 && activeTableId) {
            const checkoutStatus = await db.get('SELECT value FROM kv_store WHERE key = ?', [`checkout_requested_${resId}_${activeTableId}`]);
            if (checkoutStatus && checkoutStatus.value === 'true') {
                return ApiError('Bàn đang yêu cầu thanh toán, không thể gọi thêm món.', 403);
            }
        }

        // Get or Create active table session
        let activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resId, activeTableId]
        );
        if (!activeSession) {
            const newSessionId = crypto.randomUUID();
            try {
                await db.run(
                    `INSERT INTO table_sessions (id, resid, tableid, status, started_at) VALUES (?, ?, ?, 'ACTIVE', ?)`,
                    [newSessionId, resId, activeTableId, Date.now()]
                );
                activeSession = { id: newSessionId };
            } catch (e: any) {
                activeSession = await db.get(
                    `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
                    [resId, activeTableId]
                );
                if (!activeSession) throw e;
            }
        }
        const activeTableSessionId = activeSession.id;

        // Check if item with SAME selections AND table_session_id exists
        const existingItem = await db.get(
            'SELECT id, qty FROM cart_items WHERE user_id = ? AND item_id = ? AND table_session_id = ? AND (selections = ? OR (selections IS NULL AND CAST(? AS TEXT) IS NULL))',
            [userId, item.id, activeTableSessionId, selectionsStr, selectionsStr]
        );

        if (existingItem) {
            const newQty = existingItem.qty + quantity;
            if (newQty <= 0) {
                await db.run('DELETE FROM cart_items WHERE id = ?', [existingItem.id]);
            } else {
                await db.run('UPDATE cart_items SET qty = ?, added_at = CURRENT_TIMESTAMP WHERE id = ?', [newQty, existingItem.id]);
            }
        } else if (quantity > 0) {
            await db.run(
                'INSERT INTO cart_items (user_id, resid, tableid, item_id, name, price, qty, selections, img, table_session_id, suggestion_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, resId, activeTableId, item.id, item.name, item.price, quantity, selectionsStr, item.img || null, activeTableSessionId, source]
            );
        }

        const cartItems = await db.all(
            'SELECT * FROM cart_items WHERE user_id = ? AND table_session_id = ? ORDER BY added_at ASC',
            [userId, activeTableSessionId]
        );

        const formattedItems = cartItems.map(row => ({
            id: row.id,
            item: { id: row.item_id, name: row.name, price: row.price, img: row.img },
            quantity: row.qty,
            selections: row.selections ? JSON.parse(row.selections) : null
        }));

        const total = formattedItems.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0);

        // Bump table version to notify sync polling
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resId}_${activeTableId}`, Date.now().toString()]
        );

        return ApiSuccess({ items: formattedItems, total });
    } catch (e) {
        console.error("Cart POST Error:", e);
        return ApiError('Failed', 500);
    }
}

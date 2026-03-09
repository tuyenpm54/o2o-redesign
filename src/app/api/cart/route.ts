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
    if (!resId) return ApiError('Missing resId', 400);

    try {
        const db = await getDb();
        const cartItems = await db.all(
            'SELECT * FROM cart_items WHERE user_id = ? AND resid = ? ORDER BY added_at ASC',
            [userId, resId]
        );

        const formattedItems = cartItems.map(row => ({
            id: row.id, // Database row ID
            item: { id: row.item_id, name: row.name, price: row.price },
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

    const { resId, item, quantity, selections } = await request.json();
    const selectionsStr = selections ? JSON.stringify(selections) : null;

    try {
        const db = await getDb();

        // Check if table is locked for checkout
        if (quantity > 0 && user.tableid) {
            const checkoutStatus = await db.get('SELECT value FROM kv_store WHERE key = ?', [`checkout_requested_${resId}_${user.tableid}`]);
            if (checkoutStatus && checkoutStatus.value === 'true') {
                return ApiError('Bàn đang yêu cầu thanh toán, không thể gọi thêm món.', 403);
            }
        }

        // Check if item with SAME selections exists
        const existingItem = await db.get(
            'SELECT id, qty FROM cart_items WHERE user_id = ? AND resid = ? AND item_id = ? AND (selections = ? OR (selections IS NULL AND CAST(? AS TEXT) IS NULL))',
            [userId, resId, item.id, selectionsStr, selectionsStr]
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
                'INSERT INTO cart_items (user_id, resid, item_id, name, price, qty, selections) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, resId, item.id, item.name, item.price, quantity, selectionsStr]
            );
        }

        const cartItems = await db.all(
            'SELECT * FROM cart_items WHERE user_id = ? AND resid = ? ORDER BY added_at ASC',
            [userId, resId]
        );

        const formattedItems = cartItems.map(row => ({
            id: row.id,
            item: { id: row.item_id, name: row.name, price: row.price },
            quantity: row.qty,
            selections: row.selections ? JSON.parse(row.selections) : null
        }));

        const total = formattedItems.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0);

        return ApiSuccess({ items: formattedItems, total });
    } catch (e) {
        console.error("Cart POST Error:", e);
        return ApiError('Failed', 500);
    }
}

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

    return { userId: session.user_id, tableid: session.tableid };
}

export async function GET(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return ApiError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid');
    const tableid = searchParams.get('tableid') || auth.tableid;

    if (!resid) return ApiError('Missing resid', 400);

    try {
        const db = await getDb();
        // Get active session
        const activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND tableid = ? AND status = 'ACTIVE'`,
            [resid, tableid]
        );

        if (!activeSession) return ApiSuccess([]);

        // Fetch orders for this table session (invoice)
        const orders = await db.all(
            `SELECT id, user_id, resid, tableid, item_id, name, price, qty, status, selections, timestamp 
             FROM order_items 
             WHERE table_session_id = ? 
             ORDER BY timestamp DESC`,
            [activeSession.id]
        );

        return ApiSuccess(orders);
    } catch (e) {
        console.error("Fetch orders failed:", e);
        return ApiError('Failed to fetch orders', 500);
    }
}

async function addChatMessage(userId: string, resid: string, tableid: string, content: string, type: string = 'Gọi món') {
    try {
        const db = await getDb();
        const timeHeader = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [msgId, userId, resid, tableid || 'A-12', 'restaurant', type, content, timeHeader, Date.now()]
        );
    } catch (e) {
        console.error("[Order API] Failed to add chat message:", e);
    }
}

export async function POST(request: Request) {
    const session = await getAuthenticatedUser();
    if (!session) return ApiError('Unauthorized', 401);
    const { userId, tableid: sessionTableId } = session;
    const { resId, items: directItems, tableid: bodyTableId } = await request.json();
    if (!resId) return ApiError('Missing resId', 400);

    const activeTableId = bodyTableId || sessionTableId;

    try {
        const db = await getDb();

        // Get or Create active table session (Invoice) — unique index guarantees no duplicates
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
                // Unique constraint conflict — session was created concurrently, fetch it
                activeSession = await db.get(
                    `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
                    [resId, activeTableId]
                );
                if (!activeSession) throw e;
            }
        }
        const activeTableSessionId = activeSession.id;

        let itemsToOrder = [];

        if (directItems && directItems.length > 0) {
            itemsToOrder = directItems;
        } else {
            const cartItems = await db.all(
                'SELECT * FROM cart_items WHERE user_id = ? AND table_session_id = ?',
                [userId, activeTableSessionId]
            );

            if (cartItems.length === 0) {
                return ApiError('Cart is empty', 400);
            }

            itemsToOrder = cartItems.map(item => ({
                id: item.item_id,
                name: item.name,
                price: item.price,
                quantity: item.qty,
                selections: item.selections,
                img: item.img
            }));

            await db.run('DELETE FROM cart_items WHERE user_id = ? AND table_session_id = ?', [userId, activeTableSessionId]);
        }

        const newOrders = [];
        const timestamp = Date.now();

        if (itemsToOrder.length > 0) {
            // ✅ Create Order Round (1 round per submission)
            const roundId = `round_${timestamp}_${Math.random().toString(36).substr(2, 5)}`;
            await db.run(
                `INSERT INTO order_rounds (id, table_session_id, user_id, resid, tableid, status, created_at) VALUES (?, ?, ?, ?, ?, 'Chờ xác nhận', ?)`,
                [roundId, activeTableSessionId, userId, resId, activeTableId, timestamp]
            );

            // ✅ Create Order Items linked to this round
            const valuesPlaceholder: string[] = [];
            const flatValues: any[] = [];

            for (const item of itemsToOrder) {
                const orderId = `o_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                valuesPlaceholder.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                flatValues.push(
                    orderId, userId, resId, activeTableId, item.id || 0,
                    item.name, item.price, item.quantity, 'Chờ xác nhận',
                    item.selections, item.img, timestamp, timestamp, activeTableSessionId, roundId
                );
                newOrders.push({
                    id: orderId,
                    name: item.name,
                    price: item.price,
                    qty: item.quantity,
                    status: 'Chờ xác nhận',
                    timestamp,
                    status_updated_at: timestamp,
                    order_round_id: roundId
                });
            }

            await db.run(
                `INSERT INTO order_items (id, user_id, resid, tableid, item_id, name, price, qty, status, selections, img, timestamp, status_updated_at, table_session_id, order_round_id) VALUES ${valuesPlaceholder.join(', ')}`,
                flatValues
            );
        }

        await addChatMessage(userId, resId, activeTableId, "Yêu cầu gọi món đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận.");

        // Bump table version to notify sync polling
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resId}_${activeTableId}`, Date.now().toString()]
        );

        return ApiSuccess({ orders: newOrders });
    } catch (e) {
        console.error("Order placement failed:", e);
        return ApiError('Failed to place order', 500);
    }
}

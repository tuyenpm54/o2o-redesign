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
    const userId = session.userId;
    const tableid = session.tableid;

    const { resId, items: directItems } = await request.json();
    if (!resId) return ApiError('Missing resId', 400);

    try {
        const db = await getDb();
        let itemsToOrder = [];

        if (directItems && directItems.length > 0) {
            itemsToOrder = directItems;
        } else {
            const cartItems = await db.all(
                'SELECT * FROM cart_items WHERE user_id = ? AND resid = ?',
                [userId, resId]
            );

            if (cartItems.length === 0) {
                return ApiError('Cart is empty', 400);
            }

            itemsToOrder = cartItems.map(item => ({
                id: item.item_id,
                name: item.name,
                price: item.price,
                quantity: item.qty,
                selections: item.selections // This is already a string from DB
            }));

            await db.run('DELETE FROM cart_items WHERE user_id = ? AND resid = ?', [userId, resId]);
        }

        const newOrders = [];
        const timestamp = Date.now();

        for (const item of itemsToOrder) {
            const orderId = `o_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.run(
                'INSERT INTO order_items (id, user_id, resid, tableid, item_id, name, price, qty, status, selections, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [orderId, userId, resId, tableid, item.id || 0, item.name, item.price, item.quantity, 'Chờ xác nhận', item.selections, timestamp]
            );
            newOrders.push({
                id: orderId,
                name: item.name,
                price: item.price,
                qty: item.quantity,
                status: 'Chờ xác nhận',
                timestamp
            });
        }

        await addChatMessage(userId, resId, tableid, "Yêu cầu gọi món đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận.");

        return ApiSuccess({ orders: newOrders });
    } catch (e) {
        console.error("Order placement failed:", e);
        return ApiError('Failed to place order', 500);
    }
}

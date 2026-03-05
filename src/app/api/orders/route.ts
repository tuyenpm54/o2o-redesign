import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

import { getDb } from '@/lib/db';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { userId: session.user_id, tableid: session.tableid };
}

function addChatMessage(userId: string, resid: string, tableid: string, content: string, type: string = 'Gọi món') {
    try {
        const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
        const timeHeader = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        messages.push({
            id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId,
            resid,
            tableid: tableid || 'A-12',
            sender: 'restaurant',
            time: timeHeader,
            timestamp: Date.now(),
            type,
            content
        });
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
    } catch (e) {
        console.error("[Order API] Failed to add chat message:", e);
    }
}

export async function POST(request: Request) {
    const session = await getAuthenticatedUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.userId;
    const tableid = session.tableid;

    const { resId } = await request.json();
    if (!resId) return NextResponse.json({ error: 'Missing resId' }, { status: 400 });

    try {
        const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
        const ordersPath = path.join(process.cwd(), 'src/data/orders.json');

        const carts = fs.existsSync(cartsPath) ? JSON.parse(fs.readFileSync(cartsPath, 'utf8')) : {};
        const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : {};

        const cartKey = `${userId}_${resId}`;
        const userCart = carts[cartKey];

        if (!userCart || userCart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Move to orders
        let userOrders = orders[cartKey] || { items: [] };

        const newOrders = userCart.items.map((cartItem: any) => ({
            id: `o_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: cartItem.item.name,
            price: cartItem.item.price,
            qty: cartItem.quantity,
            status: 'Chờ xác nhận', // Initial status
            timestamp: Date.now()
        }));

        userOrders.items = [...userOrders.items, ...newOrders];
        orders[cartKey] = userOrders;

        // Clear cart
        delete carts[cartKey];

        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
        fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

        // Initial acknowledgement in chat
        addChatMessage(userId, resId, tableid, "Yêu cầu gọi món đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận.");

        // --- SIMULATED STATUS PROGRESSION FOR THE ROUND ---
        const orderRoundIds = newOrders.map((o: any) => o.id);
        const firstItemName = newOrders[0].name;

        // Helper to update status in file and add chat message
        const updateRound = (statusForData: string, messageContent: string, delay: number) => {
            setTimeout(() => {
                try {
                    if (!fs.existsSync(ordersPath)) return;
                    const currentOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
                    if (currentOrders[cartKey]) {
                        // Check if items still exist (not cleared by payment)
                        const items = currentOrders[cartKey].items;
                        const roundExists = items.some((o: any) => orderRoundIds.includes(o.id));
                        if (!roundExists) return;

                        items.forEach((o: any) => {
                            if (orderRoundIds.includes(o.id)) o.status = statusForData;
                        });
                        fs.writeFileSync(ordersPath, JSON.stringify(currentOrders, null, 2));
                        addChatMessage(userId, resId, tableid, messageContent);
                    }
                } catch (e) { }
            }, delay);
        };

        // Step 1: CONFIRMED
        updateRound("Đã xác nhận", `Các món bạn gọi đã được xác nhận.`, 6000);

        // Step 2: COOKING
        updateRound("Đang chế biến", `Các món bạn gọi đang được bếp chuẩn bị.`, 13000);

        // Step 3: READY
        updateRound("Chờ phục vụ", `Các món bạn gọi đã làm xong, đang chờ nhân viên mang ra.`, 20000);

        // Step 4: SERVED
        updateRound("Đã phục vụ", `Các món bạn gọi đã được phục vụ hoàn tất. Chúc bạn ngon miệng! 🎉`, 27000);

        return NextResponse.json({ success: true, orders: userOrders.items });
    } catch (e) {
        console.error("Order placement failed:", e);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

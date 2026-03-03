import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    const session = sessions[sessionId];
    if (!session || session.expires < Date.now()) return null;

    return sessions[sessionId];
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

        // Add to messages log
        const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
        const timeHeader = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        messages.push({
            id: `msg-${Date.now()}-ord`,
            userId,
            resid: resId,
            tableid: tableid || 'A-12',
            sender: 'restaurant',
            time: timeHeader,
            timestamp: Date.now(),
            type: 'Gọi món',
            content: `Các món bạn gọi vừa được gửi đi. Nhân viên sẽ xác nhận sau vài giây.`
        });
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

        return NextResponse.json({ success: true, orders: userOrders.items });
    } catch (e) {
        console.error("Order placement failed:", e);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

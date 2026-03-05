import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/db';

const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
const ordersPath = path.join(process.cwd(), 'src/data/orders.json');

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { sessionId, userId: session.user_id, tableid: session.tableid, resid: session.resid };
}

export async function POST(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { lang } = await request.json() || { lang: 'vi' };
        const isEn = lang === 'en';

        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const now = Date.now();

        // 1. Create user chat message (like "Gọi thanh toán")
        messages.push({
            id: `msg-${now}-payment-req`,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'user',
            time: timeStr,
            timestamp: now,
            type: 'PAYMENT', // Tech ID
            content: isEn ? 'Payment request' : 'Yêu cầu thanh toán'
        });

        // 2. Restaurant auto-confirm after a short delay (simulated inline)
        const confirmTime = new Date(now + 5000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        messages.push({
            id: `msg-${now}-payment-confirm`,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'restaurant',
            time: confirmTime,
            timestamp: now + 5000,
            type: 'PAYMENT', // Tech ID
            content: isEn
                ? 'Staff have confirmed your payment request and are on their way. Please wait at the table!'
                : 'Nhân viên đã xác nhận yêu cầu thanh toán và đang ra hỗ trợ bạn. Vui lòng chờ tại bàn nhé!'
        });

        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

        // 3. Schedule table close & data clear after 30s
        setTimeout(() => {
            try {
                // Clear cart for this user
                const carts = fs.existsSync(cartsPath) ? JSON.parse(fs.readFileSync(cartsPath, 'utf8')) : {};
                const cartKey = `${auth.userId}_${auth.resid}`;
                if (carts[cartKey]) {
                    delete carts[cartKey];
                    fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
                }

                // Clear orders for this user
                const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : {};
                if (orders[cartKey]) {
                    delete orders[cartKey];
                    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
                }

                const msgs = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
                const closeTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                msgs.push({
                    id: `msg-${Date.now()}-table-closed`,
                    userId: auth.userId,
                    resid: auth.resid,
                    tableid: auth.tableid,
                    sender: 'restaurant',
                    time: closeTime,
                    timestamp: Date.now(),
                    type: 'SYSTEM', // Tech ID
                    content: isEn
                        ? 'Dining session has ended. Thank you for using our service! Have a great day. 🎉'
                        : 'Phiên ăn uống đã kết thúc. Cảm ơn bạn đã sử dụng dịch vụ! Chúc bạn một ngày tốt lành. 🎉'
                });
                fs.writeFileSync(messagesPath, JSON.stringify(msgs, null, 2));
            } catch (e) {
                console.error('[Payment] Failed to close table:', e);
            }
        }, 30000);

        return NextResponse.json({
            success: true,
            message: isEn ? 'Payment request sent' : 'Yêu cầu thanh toán đã được gửi'
        });
    } catch (e) {
        console.error('Payment request failed:', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

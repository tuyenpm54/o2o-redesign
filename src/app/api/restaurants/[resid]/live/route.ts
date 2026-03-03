import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const p = await params;
    const resid = p.resid || p.resId;

    const searchParams = new URL(request.url).searchParams;
    const tableid = searchParams.get('tableid');

    if (!resid || !tableid) {
        return NextResponse.json({ error: 'resid and tableid are required' }, { status: 400 });
    }

    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');
        const usersPath = path.join(process.cwd(), 'src/data/users.json');
        const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
        const ordersPath = path.join(process.cwd(), 'src/data/orders.json');

        const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const carts = fs.existsSync(cartsPath) ? JSON.parse(fs.readFileSync(cartsPath, 'utf8')) : {};
        const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : {};

        // Update current session's location if it exists
        if (sessionId && sessions[sessionId]) {
            sessions[sessionId].resid = resid;
            sessions[sessionId].tableid = tableid;
            sessions[sessionId].lastActive = Date.now();
            fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
        }

        // --- SIMULATION LOGIC START ---
        let ordersChanged = false;
        const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
        let messagesChanged = false;

        Object.keys(orders).forEach(userResKey => {
            const userOrders = orders[userResKey];
            if (!userOrders.items) return;

            const [itUserId, itResId] = userResKey.split('_');
            if (itResId !== resid) return;

            // Find current table for this user from sessions
            const userSession = Object.values(sessions).find((s: any) => s.userId === itUserId && s.resid === resid) as any;
            const userTableId = userSession?.tableid || tableid;

            userOrders.items.forEach((item: any) => {
                if (item.status === 'Đã phục vụ') return;

                const now = Date.now();
                const lastUpdate = item.lastUpdate || item.timestamp || now;
                const elapsed = now - lastUpdate;

                // Deterministic check for simulation: if it's been > 8-12s, move to next status
                const delay = 8000 + (Math.abs(item.id.length + item.name.length) % 5) * 1000;

                if (elapsed > delay) {
                    let nextStatus = '';
                    let message = '';

                    switch (item.status) {
                        case 'Chờ xác nhận':
                            nextStatus = 'Chờ chế biến';
                            message = `Món "${item.name}" đã được nhà hàng xác nhận và đang chờ nấu.`;
                            break;
                        case 'Chờ chế biến':
                            nextStatus = 'Đang chế biến';
                            message = `Món "${item.name}" đang được chuẩn bị trong bếp.`;
                            break;
                        case 'Đang chế biến':
                            nextStatus = 'Chờ phục vụ';
                            message = `Món "${item.name}" đã làm xong và đang chờ mang ra.`;
                            break;
                        case 'Chờ phục vụ':
                            nextStatus = 'Đang mang ra';
                            message = `Nhân viên đang mang món "${item.name}" đến bàn của bạn.`;
                            break;
                        case 'Đang mang ra':
                            nextStatus = 'Đã phục vụ';
                            message = `Món "${item.name}" đã được phục vụ. Chúc bạn ngon miệng!`;
                            break;
                        // Support legacy status strings for transition
                        case 'COOKING': nextStatus = 'Chờ phục vụ'; break;
                        case 'READY': nextStatus = 'Đang mang ra'; break;
                        case 'SERVED': nextStatus = 'Đã phục vụ'; break;
                    }

                    if (nextStatus) {
                        item.status = nextStatus;
                        item.lastUpdate = now;
                        ordersChanged = true;
                        messages.push({
                            id: `notif-${now}-${item.id}`,
                            userId: itUserId, resid: itResId, tableid: userTableId,
                            sender: 'restaurant',
                            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            timestamp: now,
                            type: 'Thông báo',
                            content: message || `Món "${item.name}" đã chuyển sang trạng thái "${nextStatus}"`
                        });
                        messagesChanged = true;
                    }
                }
            });
        });

        if (ordersChanged) fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
        if (messagesChanged) {
            // Keep last 100 messages to prevent bloat
            if (messages.length > 100) messages.splice(0, messages.length - 100);
            fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
        }
        // --- SIMULATION LOGIC END ---

        const activeMembers = Object.values(sessions)
            .filter((s: any) =>
                s.expires > Date.now() &&
                s.resid === resid &&
                s.tableid === tableid &&
                (Date.now() - (s.lastActive || 0)) < 60000 // consider active if pinged in last 60s
            )
            .map((s: any) => {
                const user = users.find((u: any) => u.id === s.userId);
                if (!user) return null;

                const cartKey = `${s.userId}_${resid}`;
                const userCart = carts[cartKey] || { items: [], total: 0 };
                const userOrders = orders[cartKey] || { items: [] };

                return {
                    ...user,
                    draftItems: userCart.items,
                    confirmedOrders: userOrders.items,
                    status: userCart.items.length > 0 ? 'ordering' : 'done'
                };
            })
            .filter(Boolean);

        return NextResponse.json({
            count: activeMembers.length,
            members: activeMembers,
            notifications: messages.filter((m: any) =>
                m.tableid === tableid &&
                m.resid === resid &&
                (Date.now() - new Date(m.timestamp || Date.now()).getTime()) < 30000 &&
                m.sender === 'restaurant'
            ).slice(-3),
            debug: { resid, tableid }
        });
    } catch (error) {
        console.error('Live API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function addChatMessage(userId: string, resid: string, tableid: string, content: string, type: string = 'System') {
    try {
        const db = await getDb();
        const timeHeader = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const msgId = `sys-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [msgId, userId, resid, tableid, 'restaurant', type, content, timeHeader, Date.now()]
        );
    } catch (e) {
        console.error("[Admin Orders API] Failed to add chat msg:", e);
    }
}

export async function POST(request: Request) {
    try {
        const { userId, resid, tableid, orderId, orderIds, newStatus, message } = await request.json();

        const targets = orderIds || (orderId ? [orderId] : []);

        if (!userId || !resid || !tableid || targets.length === 0 || !newStatus) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();

        // Get active session for this table
        const activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resid, tableid]
        );
        if (!activeSession) {
            return NextResponse.json({ error: 'No active session' }, { status: 404 });
        }

        const placeholders = targets.map(() => '?').join(',');
        const query = `
            SELECT id, name FROM order_items 
            WHERE table_session_id = ? AND id IN (${placeholders})
        `;
        const itemsToUpdate = await db.all(query, [activeSession.id, ...targets]);

        if (!itemsToUpdate || itemsToUpdate.length === 0) {
            return NextResponse.json({ error: 'Order items not found' }, { status: 404 });
        }

        const updateQuery = `
            UPDATE order_items 
            SET status = ?, status_updated_at = ?
            WHERE table_session_id = ? AND id IN (${placeholders})
        `;
        await db.run(updateQuery, [newStatus, Date.now(), activeSession.id, ...targets]);
        
        // --- 🆕 Sync Version Bump: Critical fix for delayed UI updates ---
        // Increment the sync version so that the client's sync API (which runs <5ms) 
        // detects a change and triggers the heavy fetch for the new order statuses.
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resid}_${tableid}`, Date.now().toString()]
        );

        const itemNames = itemsToUpdate.map((i: any) => i.name);

        // Send chat generic message to users table to inform them of progression
        if (message) {
            await addChatMessage(userId, resid, tableid, message);
        } else {
            let statusText = `Các món sau đã chuyển sang trạng thái: ${newStatus}`;
            if (newStatus === 'Đã xác nhận') {
                statusText = 'Dạ nhà hàng đã nhận order và đang chuẩn bị làm món cho mình rồi ạ:';
            } else if (newStatus === 'Đang chế biến') {
                statusText = 'Dạ món của mình đang được bếp chế biến rồi ạ, quý khách đợi thêm một chút nhé:';
            } else if (newStatus === 'Chờ phục vụ') {
                statusText = 'Dạ món của mình đã làm xong, nhân viên đang chờ bưng ra bàn cho quý khách ạ:';
            } else if (newStatus === 'Đã phục vụ') {
                statusText = 'Dạ món đã được phục vụ lên bàn. Chúc quý khách ngon miệng, nếu cần thêm gì cứ gọi em nhé:';
            }

            const itemsList = itemNames.map((name: string) => `• ${name}`).join('\n');
            await addChatMessage(userId, resid, tableid, `${statusText}\n${itemsList}`);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[Admin Orders Update] Failed:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const p = await params;
    const resid = String(p.resid || p.resId);

    const searchParams = new URL(request.url).searchParams;
    const tableid = String(searchParams.get('tbl') || searchParams.get('tableid') || '');

    if (!resid || !tableid) {
        return NextResponse.json({ error: 'Mã nhà hàng và bàn là bắt buộc', d: { resid, tableid } }, { status: 400 });
    }

    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        const db = await getDb();

        // Update current session's location if it exists
        if (sessionId) {
            await db.run(
                'UPDATE sessions SET resid = ?, tableid = ?, lastActive = ? WHERE id = ?',
                [resid, tableid, Date.now(), sessionId]
            );
        }

        // Clean up sessions that have been inactive for more than 10 minutes
        // (users who closed their browser without logging out)
        await db.run(
            'DELETE FROM sessions WHERE lastActive IS NOT NULL AND lastActive < ?',
            [Date.now() - 600000]
        );

        const dbSessions = await db.all(
            `SELECT s.id as session_id, s.user_id, s.resid, s.tableid, s.lastActive, 
                    u.name, u.avatar, u.phone, u.tier, u.preferences, u.isGuest 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.expires > ?`,
            [Date.now()]
        );

        // Fetch carts and orders directly from table using JOIN could be better
        // For now let's just fetch all carts/orders. Wait, we ONLY need those at the same table!
        const tableMembers = dbSessions.filter((s: any) => {
            const sRes = String(s.resid || '');
            const sTab = String(s.tableid || '');
            const isSelf = sessionId && (s.session_id === sessionId);
            const isAtTable = sRes === resid && sTab === tableid;
            const now = Date.now();
            const isActive = (now - (s.lastActive || 0)) < 300000; // 5 minutes

            return isSelf || (isAtTable && isActive);
        });

        const activeMembers = [];
        for (const s of tableMembers) {
            const userIds = [s.user_id];

            const userCartItems = await db.all(
                'SELECT item_id as id, name, price, qty as quantity FROM cart_items WHERE user_id = ? AND resid = ?',
                [s.user_id, resid]
            );

            const userOrderItems = await db.all(
                'SELECT id, name, price, qty, status, timestamp FROM order_items WHERE user_id = ? AND resid = ?',
                [s.user_id, resid]
            );

            // group userCartItems like { item: { id, name, price }, quantity } for frontend compatibility
            const draftItems = userCartItems.map(item => ({
                item: { id: item.id, name: item.name, price: item.price },
                quantity: item.quantity
            }));

            activeMembers.push({
                id: s.user_id,
                name: s.name,
                avatar: s.avatar,
                phone: s.phone,
                tier: s.tier,
                preferences: JSON.parse(s.preferences || '[]'),
                isGuest: !!s.isGuest,
                draftItems: draftItems,
                confirmedOrders: userOrderItems,
                status: userCartItems.length > 0 ? 'ordering' : 'done'
            });
        }

        // Limit retrieving messages to last 30s for this table
        const messages = await db.all(
            `SELECT * FROM chat_messages 
             WHERE tableid = ? AND resid = ? AND sender = 'restaurant' AND timestamp > ?
             ORDER BY timestamp ASC LIMIT 3`,
            [tableid, resid, Date.now() - 30000]
        );

        // Fetch checkout requested status
        const checkoutStatus = await db.get('SELECT value FROM kv_store WHERE key = ?', [`checkout_requested_${resid}_${tableid}`]);

        return NextResponse.json({
            count: activeMembers.length,
            members: activeMembers,
            isCheckoutRequested: checkoutStatus?.value === 'true',
            notifications: messages.map(m => ({
                id: m.id,
                userId: m.user_id,
                resid: m.resid,
                tableid: m.tableid,
                sender: m.sender,
                time: m.time,
                timestamp: m.timestamp,
                type: m.type,
                typeId: m.typeId,
                content: m.content
            })),
            debug_v3: { resid, tableid, sessionId, member_count: activeMembers.length }
        });
    } catch (error) {
        console.error('Live API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

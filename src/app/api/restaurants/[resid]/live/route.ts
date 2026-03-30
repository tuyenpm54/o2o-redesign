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
        const now = Date.now();

        // 1. Background Garbage Collection (Fire-and-forget, no await)
        db.run('DELETE FROM session_presences WHERE last_active < ?', [now - 600000]).catch(console.error);

        // 2. Parallelize Table Session Lookup and Presence Updates
        const activeSessionPromise = db.get(
            `SELECT id, started_at FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resid, tableid]
        );

        const presencePromise = sessionId ? (async () => {
            await Promise.all([
                db.run(
                    `INSERT INTO session_presences (session_id, resid, tableid, last_active) VALUES (?, ?, ?, ?) ON CONFLICT (session_id, resid, tableid) DO UPDATE SET last_active = EXCLUDED.last_active`,
                    [sessionId, resid, tableid, now]
                ),
                db.run('UPDATE sessions SET lastActive = ? WHERE id = ?', [now, sessionId])
            ]);
        })() : Promise.resolve();

        const [activeSessionResult] = await Promise.all([activeSessionPromise, presencePromise]);
        let activeSession = activeSessionResult;

        if (!activeSession) {
            const newSessionId = crypto.randomUUID();
            try {
                await db.run(
                    `INSERT INTO table_sessions (id, resid, tableid, status, started_at) VALUES (?, ?, ?, 'ACTIVE', ?)`,
                    [newSessionId, resid, tableid, now]
                );
                activeSession = { id: newSessionId, started_at: now };
            } catch (e: any) {
                activeSession = await db.get(
                    `SELECT id, started_at FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
                    [resid, tableid]
                );
                if (!activeSession) throw e;
            }
        }
        const activeTableSessionId = activeSession?.id || 'default';

        // 3. One massive parallel fetch for EVERYTHING else
        const [
            dbPresences,
            tableOrderItems,
            rounds,
            messages,
            supportRequests,
            checkoutStatus,
            paymentStatus,
            tableStatus,
            allCartItems
        ] = await Promise.all([
            db.all(
                `SELECT u.id as user_id, u.name, u.avatar, u.phone, u.tier, u.preferences, u.isGuest,
                        MAX(p.last_active) as last_active
                 FROM users u
                 LEFT JOIN sessions s ON s.user_id = u.id AND s.expires > ?
                 LEFT JOIN session_presences p ON p.session_id = s.id AND p.resid = ? AND p.tableid = ?
                 WHERE 
                    p.session_id IS NOT NULL 
                    OR EXISTS (SELECT 1 FROM order_items o WHERE o.user_id = u.id AND o.table_session_id = ?)
                    OR EXISTS (SELECT 1 FROM cart_items c WHERE c.user_id = u.id AND c.table_session_id = ?)
                 GROUP BY u.id, u.name, u.avatar, u.phone, u.tier, u.preferences, u.isGuest`,
                [now, resid, tableid, activeTableSessionId, activeTableSessionId]
            ),
            db.all(
                'SELECT id, name, price, qty, status, img, selections, timestamp, status_updated_at, order_round_id, user_id FROM order_items WHERE table_session_id = ? ORDER BY timestamp ASC',
                [activeTableSessionId]
            ),
            db.all(
                'SELECT r.id, r.user_id, r.status, r.created_at, r.confirmed_at, u.name as user_name FROM order_rounds r LEFT JOIN users u ON r.user_id = u.id WHERE r.table_session_id = ? ORDER BY r.created_at ASC',
                [activeTableSessionId]
            ),
            db.all(
                `SELECT * FROM chat_messages WHERE tableid = ? AND resid = ? AND sender = 'restaurant' AND (type != 'SUPPORT' OR type IS NULL) AND timestamp > ? ORDER BY timestamp ASC LIMIT 3`,
                [tableid, resid, now - 30000]
            ),
            db.all(
                `SELECT id, content as text, time, timestamp, status, status_updated_at FROM chat_messages WHERE tableid = ? AND resid = ? AND type = 'SUPPORT' ORDER BY timestamp DESC`,
                [tableid, resid]
            ),
            db.get('SELECT value FROM kv_store WHERE key = ?', [`checkout_requested_${resid}_${tableid}`]),
            db.get('SELECT value FROM kv_store WHERE key = ?', [`payment_completed_${resid}_${tableid}`]),
            db.get('SELECT value FROM kv_store WHERE key = ?', [`table_status_${resid}_${tableid}`]),
            db.all(
                'SELECT item_id as id, name, price, qty as quantity, img, selections, user_id FROM cart_items WHERE table_session_id = ?',
                [activeTableSessionId]
            )
        ]);

        const activeMembers = dbPresences.map(p => {
            const userCartItems = allCartItems.filter(item => item.user_id === p.user_id);
            const userOrderItems = tableOrderItems.filter(item => item.user_id === p.user_id);

            const draftItems = userCartItems.map(item => ({
                item: { id: item.id, name: item.name, price: item.price, img: item.img },
                quantity: item.quantity,
                selections: item.selections ? JSON.parse(item.selections) : null
            }));

            return {
                id: p.user_id,
                name: p.name,
                avatar: p.avatar,
                phone: p.phone,
                tier: p.tier,
                preferences: JSON.parse(p.preferences || '[]'),
                isGuest: !!p.isGuest,
                last_active: p.last_active,
                is_online: !!p.last_active && (now - p.last_active < 600000),
                draftItems: draftItems,
                confirmedOrders: userOrderItems,
                status: userCartItems.length > 0 ? 'ordering' : 'done'
            };
        });

        // Group items by round
        const tableOrders = rounds.map((round: any, index: number) => ({
            roundId: round.id,
            roundNumber: index + 1,
            userId: round.user_id,
            userName: round.user_name || 'Khách',
            status: round.status,
            createdAt: round.created_at,
            confirmedAt: round.confirmed_at,
            items: tableOrderItems.filter((item: any) => item.order_round_id === round.id)
        }));

        // Also include orphaned items (no round) as a virtual round
        const orphanItems = tableOrderItems.filter((item: any) => !item.order_round_id);
        if (orphanItems.length > 0) {
            tableOrders.unshift({
                roundId: 'legacy',
                roundNumber: 0,
                userId: orphanItems[0]?.user_id || '',
                userName: 'Lượt cũ',
                status: orphanItems[0]?.status || 'Đã xác nhận',
                createdAt: orphanItems[0]?.timestamp || 0,
                confirmedAt: null,
                items: orphanItems
            });
        }

        const sittingSince = dbPresences.length > 0
            ? dbPresences.reduce((min, p) => {
                return p.last_active < min ? p.last_active : min;
            }, now)
            : null;

        let tableClosedTimestamp = 0;
        if (tableStatus?.value && Number(tableStatus.value) > 0) {
            tableClosedTimestamp = Number(tableStatus.value);
        }

        return NextResponse.json({
            count: activeMembers.length,
            members: activeMembers,
            tableOrders,
            messages,
            supportRequests,
            sittingSince,
            isPaid: paymentStatus?.value === 'true',
            isCheckoutRequested: checkoutStatus?.value === 'true',
            tableClosedTimestamp,
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
            }))
        });
    } catch (error) {
        console.error('Live API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
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
        const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
        const ordersPath = path.join(process.cwd(), 'src/data/orders.json');

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

        const carts = fs.existsSync(cartsPath) ? JSON.parse(fs.readFileSync(cartsPath, 'utf8')) : {};
        const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : {};

        const activeMembers = dbSessions
            .filter((s: any) => {
                const sRes = String(s.resid || '');
                const sTab = String(s.tableid || '');

                // Current user is always counted at the table they're requesting
                const isSelf = sessionId && (s.session_id === sessionId);

                // Other members: must be at the same table AND been active in last 5 minutes.
                // 5 min window is safe: frontend polls every 5s so any open browser stays fresh.
                // Stale sessions (closed browsers, left the app) expire after 5 min of inactivity.
                const isAtTable = sRes === resid && sTab === tableid;
                const now = Date.now();
                const isActive = (now - (s.lastActive || 0)) < 300000; // 5 minutes

                return isSelf || (isAtTable && isActive);
            })
            .map((s: any) => {
                const cartKey = `${s.user_id}_${resid}`;
                const userCart = carts[cartKey] || { items: [], total: 0 };
                const userOrders = orders[cartKey] || { items: [] };

                return {
                    id: s.user_id,
                    name: s.name,
                    avatar: s.avatar,
                    phone: s.phone,
                    tier: s.tier,
                    preferences: JSON.parse(s.preferences || '[]'),
                    isGuest: !!s.isGuest,
                    draftItems: userCart.items,
                    confirmedOrders: userOrders.items,
                    status: userCart.items.length > 0 ? 'ordering' : 'done'
                };
            });

        const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];

        return NextResponse.json({
            count: activeMembers.length,
            members: activeMembers,
            notifications: messages.filter((m: any) =>
                m.tableid === tableid &&
                m.resid === resid &&
                (Date.now() - new Date(m.timestamp || Date.now()).getTime()) < 30000 &&
                m.sender === 'restaurant'
            ).slice(-3),
            debug_v3: { resid, tableid, sessionId, member_count: activeMembers.length }
        });
    } catch (error) {
        console.error('Live API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

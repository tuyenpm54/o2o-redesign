import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

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

        const db = await getDb();
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const now = Date.now();

        // 1. Create user chat message
        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [`msg-${now}-payment-req`, auth.userId, auth.resid, auth.tableid, 'user', 'PAYMENT', isEn ? 'Payment request' : 'Yêu cầu thanh toán', timeStr, now]
        );

        // Set table as checking out to prevent new orders
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`checkout_requested_${auth.resid}_${auth.tableid}`, 'true']
        );

        // 2. Restaurant auto-confirm after a short delay (simulated inline)
        const confirmTime = new Date(now + 5000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const confirmContent = isEn
            ? 'Staff have confirmed your payment request and are on their way. Please wait at the table!'
            : 'Nhân viên đã xác nhận yêu cầu thanh toán và đang ra hỗ trợ bạn. Vui lòng chờ tại bàn nhé!';

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [`msg-${now}-payment-confirm`, auth.userId, auth.resid, auth.tableid, 'restaurant', 'PAYMENT', confirmContent, confirmTime, now + 5000]
        );

        return NextResponse.json({
            success: true,
            message: isEn ? 'Payment request sent' : 'Yêu cầu thanh toán đã được gửi'
        });
    } catch (e) {
        console.error('Payment request failed:', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

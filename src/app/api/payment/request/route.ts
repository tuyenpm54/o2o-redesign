import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiError } from '@/lib/api-response';

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
        const db = await getDb();
        const bodyContent = await request.json(); 
        const lang = bodyContent.lang || 'vi'; 
        const vatInfo = bodyContent.vatInfo; 
        const isEn = lang === 'en';

        // Check if checkout is already requested by someone else
        const existingCheckout = await db.get('SELECT value FROM kv_store WHERE key = ?', [`checkout_requested_${auth.resid}_${auth.tableid}`]);
        if (existingCheckout && existingCheckout.value !== auth.userId && existingCheckout.value !== 'true') {
            return ApiError('Bàn này đang được người khác yêu cầu thanh toán rồi.', 400);
        }

        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const now = Date.now(); 

        // 1. Create user chat message
        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [`msg-${now}-payment-req`, auth.userId, auth.resid, auth.tableid, 'user', 'PAYMENT', isEn ? 'Payment request' : 'Yêu cầu thanh toán', timeStr, now]
        );

        // Set table as checking out to prevent new orders and lock rights to the requester
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`checkout_requested_${auth.resid}_${auth.tableid}`, auth.userId]
        );

        // Save VAT info if provided
        if (vatInfo) {
            await db.run(
                'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                [`vat_request_${auth.resid}_${auth.tableid}`, JSON.stringify({ userId: auth.userId, ...vatInfo })]
            );
        }

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

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { id: session.user_id, tableid: session.tableid };
}

export async function POST(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user) return ApiError('Unauthorized', 401);

    const { orderId, resid } = await request.json();

    if (!orderId || !resid) {
        return ApiError('Missing data', 400);
    }

    try {
        const db = await getDb();

        const order = await db.get(
            'SELECT * FROM order_items WHERE id = ? AND resid = ?',
            [orderId, resid]
        );

        if (!order) {
            return ApiError('Không tìm thấy món', 404);
        }

        if (order.status !== 'Chờ xác nhận') {
            return ApiError('Món đã được xác nhận hoặc nhậm bởi bếp, không thể huỷ', 400);
        }

        // Anyone at the exact table can cancel
        if (order.tableid !== user.tableid) {
            return ApiError('Bạn không có quyền huỷ món này', 403);
        }

        await db.run('DELETE FROM order_items WHERE id = ?', [orderId]);

        return ApiSuccess({ message: 'Huỷ món thành công' });
    } catch (e) {
        console.error("Order Cancel Error:", e);
        return ApiError('Failed', 500);
    }
}

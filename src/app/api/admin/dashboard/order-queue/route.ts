import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import { MOCK_ORDER_QUEUE } from '@/data/mock-dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dashboard/order-queue?resid=...
 * 
 * Model C (Counter) specific API.
 * Returns the live order queue: ready-for-pickup orders and active (cooking/pending) orders.
 * Used by the "Counter Dispatch Center" variant of the Sảnh Trực Chiến page.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    // Return mock data for demo
    if (resid === 'demo-mock' || resid === 'all' || resid === '100') {
        return NextResponse.json(MOCK_ORDER_QUEUE);
    }

    try {
        const db = await getDb();
        const nowMs = Date.now();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayMs = startOfToday.getTime();

        const resFilter = resid !== 'all' ? ' AND oi.resid = ?' : '';
        const resParams = resid !== 'all' ? [resid] : [];

        // 1. Ready orders (waiting for customer pickup)
        const readyOrdersQuery = `
            SELECT 
                or2.id as round_id,
                or2.user_id,
                u.phone as customer_phone,
                COUNT(oi.id) as item_count,
                MIN(oi.status_updated_at) as ready_at
            FROM order_rounds or2
            JOIN order_items oi ON oi.round_id = or2.id
            LEFT JOIN users u ON u.id = or2.user_id
            WHERE oi.status IN ('Sẵn sàng', 'ready', 'Ready')
            AND oi.timestamp > ?${resFilter}
            GROUP BY or2.id, or2.user_id, u.phone
            ORDER BY ready_at ASC
        `;
        const readyRows = await db.all(readyOrdersQuery, [todayMs, ...resParams]);

        const readyOrders = readyRows.map((r: any, idx: number) => {
            const readyAt = Number(r.ready_at) || nowMs;
            const waitingMinutes = Math.floor((nowMs - readyAt) / 60000);
            return {
                orderId: `#${String(r.round_id).slice(-4).padStart(4, '0')}`,
                customerName: r.customer_phone || 'Khách lẻ',
                itemCount: Number(r.item_count),
                readyAt,
                waitingMinutes,
            };
        });

        // 2. Active orders (pending / cooking)
        const activeOrdersQuery = `
            SELECT 
                or2.id as round_id,
                or2.user_id,
                u.phone as customer_phone,
                COUNT(oi.id) as item_count,
                MIN(oi.timestamp) as created_at,
                MAX(CASE WHEN oi.status IN ('Đang nấu', 'cooking', 'Cooking') THEN 1 ELSE 0 END) as has_cooking
            FROM order_rounds or2
            JOIN order_items oi ON oi.round_id = or2.id
            LEFT JOIN users u ON u.id = or2.user_id
            WHERE oi.status IN ('Chờ xác nhận', 'pending', 'Pending', 'Đã xác nhận', 'confirmed', 'Confirmed', 'Đang chuẩn bị', 'Đang nấu', 'cooking', 'Cooking')
            AND oi.timestamp > ?${resFilter}
            GROUP BY or2.id, or2.user_id, u.phone
            ORDER BY created_at ASC
        `;
        const activeRows = await db.all(activeOrdersQuery, [todayMs, ...resParams]);

        const activeOrders = activeRows.map((r: any) => {
            const createdAt = Number(r.created_at) || nowMs;
            const waitingMinutes = Math.floor((nowMs - createdAt) / 60000);
            return {
                orderId: `#${String(r.round_id).slice(-4).padStart(4, '0')}`,
                customerName: r.customer_phone || 'Khách lẻ',
                itemCount: Number(r.item_count),
                status: Number(r.has_cooking) ? 'cooking' : 'pending',
                createdAt,
                waitingMinutes,
            };
        });

        // 3. Aggregated metrics
        const totalCustomersRes = await db.all(
            `SELECT COUNT(DISTINCT user_id) as cnt FROM order_rounds WHERE timestamp > ?${resFilter.replace('oi.', '')}`,
            [todayMs, ...resParams]
        );

        // Average fulfillment time (order placed → ready)
        const avgFulfillRes = await db.all(`
            SELECT AVG(oi.status_updated_at - oi.timestamp) as avg_ms
            FROM order_items oi
            WHERE oi.status IN ('Sẵn sàng', 'ready', 'Ready', 'Đã phục vụ', 'served', 'Served')
            AND oi.timestamp > ?${resFilter}
        `, [todayMs, ...resParams]);

        const avgFulfillMs = Number(avgFulfillRes[0]?.avg_ms) || 0;
        const avgFulfillmentMinutes = avgFulfillMs > 0 ? Math.round((avgFulfillMs / 60000) * 10) / 10 : 0;

        // Live revenue (active + served today)
        const revenueRes = await db.all(`
            SELECT SUM(oi.price * oi.quantity) as total
            FROM order_items oi
            WHERE oi.status NOT IN ('Hủy món', 'Hết món', 'Sold out')
            AND oi.timestamp > ?${resFilter}
        `, [todayMs, ...resParams]);

        const liveRevenue = Number(revenueRes[0]?.total) || 0;
        const totalCustomersToday = Number(totalCustomersRes[0]?.cnt) || 0;

        return ApiSuccess({
            activeOrderCount: activeOrders.length + readyOrders.length,
            totalCustomersToday,
            avgFulfillmentMinutes,
            liveRevenue,
            avgBillAmount: totalCustomersToday > 0 ? Math.round(liveRevenue / totalCustomersToday) : 0,
            readyOrders,
            activeOrders,
        });
    } catch (error) {
        console.error('[Order Queue] Error:', error);
        return ApiError('Failed to fetch order queue', 500);
    }
}

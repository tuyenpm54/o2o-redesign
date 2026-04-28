import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

import { MOCK_LIVE_PULSE } from '@/data/mock-dashboard';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    if (resid === 'demo-mock' || resid === 'all' || resid === '100') {
        return NextResponse.json(MOCK_LIVE_PULSE);
    }
    try {
        const db = await getDb();
        const nowMs = Date.now();
        
        let condition = resid === 'all' ? '1=1' : 'resid = ?';
        let params: any[] = resid === 'all' ? [] : [resid];

        // 1. KITCHEN LAG: Orders pending/cooking for > 15 minutes (900,000 ms)
        const kitchenLagQuery = `
            SELECT COUNT(id) as count 
            FROM order_items 
            WHERE status IN ('Chờ xác nhận', 'Đang chuẩn bị', 'Đang nấu', 'pending', 'cooking') 
            AND (${nowMs} - timestamp) > 900000 AND timestamp > 0 
            AND ${condition}
        `;
        const kitchenLagRes = await db.all(kitchenLagQuery, params);
        const kitchenLagCount = Number(kitchenLagRes[0]?.count) || 0;

        // 2. FORGOTTEN REQUESTS: Service requests unhandled for > 5 mins (300,000 ms)
        const neglectedTablesQuery = `
            SELECT COUNT(id) as count 
            FROM chat_messages 
            WHERE type = 'support' 
            AND status NOT IN ('Đã xong', 'done', 'canceled') 
            AND (${nowMs} - timestamp) > 300000 AND timestamp > 0
            AND ${condition}
        `;
        const neglectedTablesRes = await db.all(neglectedTablesQuery, params);
        const neglectedTablesCount = Number(neglectedTablesRes[0]?.count) || 0;

        // 3. STOCKOUT / CANCELLED: Items cancelled today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const stockoutQuery = `
            SELECT COUNT(id) as count 
            FROM order_items 
            WHERE status IN ('Hủy món', 'Hết món', 'Sold out') 
            AND timestamp > ${startOfToday.getTime()}
            AND ${condition}
        `;
        const stockoutRes = await db.all(stockoutQuery, params);
        const stockoutCount = Number(stockoutRes[0]?.count) || 0;

        // 4. ACTIVE TABLES
        const activeTablesQuery = `
            SELECT COUNT(id) as count 
            FROM table_sessions 
            WHERE status = 'ACTIVE' 
            AND ${condition}
        `;
        const activeTablesRes = await db.all(activeTablesQuery, params);
        const activeTablesCount = Number(activeTablesRes[0]?.count) || 0;

        // 5. LIVE QUEUE VOLUME (Number of items in different Pipeline Stages)
        const qPending = await db.all(`SELECT COUNT(id) as count FROM order_items WHERE status IN ('Chờ xác nhận', 'pending') AND ${condition}`, params);
        const qCooking = await db.all(`SELECT COUNT(id) as count FROM order_items WHERE status IN ('Đã xác nhận', 'Đang chuẩn bị', 'Đang nấu', 'confirmed', 'cooking') AND ${condition}`, params);
        const qReady = await db.all(`SELECT COUNT(id) as count FROM order_items WHERE status IN ('Sẵn sàng', 'ready') AND ${condition}`, params);
        
        // 6. LIVE REVENUE (Today's Paid Invoices + Unpaid Tables)
        const todayRevenueRes = await db.all(`SELECT SUM(total_amount) as total FROM invoices WHERE updated_at > ${startOfToday.getTime()} AND ${condition}`, params);
        
        // For Active Table Revenue (Unpaid), we join table_sessions and order_items
        // For simplicity (SQLite support), we will fetch active table IDs first
        const activeIds = await db.all(`SELECT id FROM table_sessions WHERE status = 'ACTIVE' AND ${condition}`, params);
        const sessionIds = activeIds.map((r: any) => `'${r.id}'`).join(',');
        let liveRevenue = 0;
        if (sessionIds) {
            const unpaidRes = await db.all(`SELECT SUM(price * quantity) as total FROM order_items WHERE table_session_id IN (${sessionIds}) AND status NOT IN ('Hủy món', 'Hết món', 'Sold out')`);
            liveRevenue = Number(unpaidRes[0]?.total) || 0;
        }

        // 7. HOT ITEMS (Top 3 items currently cooking/pending)
        let hotItems: any[] = [];
        if (sessionIds) {
            hotItems = await db.all(`
                SELECT item_name as name, SUM(quantity) as qty 
                FROM order_items 
                WHERE table_session_id IN (${sessionIds}) AND status IN ('Chờ xác nhận', 'Đang nấu', 'pending', 'cooking')
                GROUP BY item_name
                ORDER BY qty DESC
                LIMIT 3
            `);
        }

        // 8. URGENT FEED (Bad Reviews < 30 mins OR Pending Support requests)
        let urgentFeed: any[] = [];
        
        // Negative reviews in last 30 mins (rating <= 3)
        // using Date.now() logic equivalent in PG via created_at
        const thirtyMinsAgoUtc = new Date(nowMs - 30 * 60 * 1000).toISOString();
        const badReviewsQuery = `
            SELECT r.id, 'review' as type, i.tableid, r.comment as content, r.created_at as timestamp_raw
            FROM reviews r
            JOIN invoices i ON r.invoice_id = i.id
            WHERE r.rating <= 3 AND r.created_at > '${thirtyMinsAgoUtc}' AND i.resid ${resid === 'all' ? 'IS NOT NULL' : `= '${resid}'`}
        `;
        
        // Neglected requests (type='support', status != 'Đã xong', older than 5 mins, but younger than 24h to avoid old garbage)
        const fiveMinsAgoMs = nowMs - 5 * 60 * 1000;
        const oneDayAgoMs = nowMs - 24 * 60 * 60 * 1000;
        const reqQuery = `
            SELECT id, 'request' as type, tableid, content, timestamp as timestamp_raw
            FROM chat_messages
            WHERE type = 'support' AND status NOT IN ('Đã xong', 'done', 'canceled')
            AND timestamp < ${fiveMinsAgoMs} AND timestamp > ${oneDayAgoMs} 
            AND ${condition}
        `;

        // Late Orders (items pending/cooking > 15 mins)
        // Group by table_session to consolidate if multiple items are late
        const lateOrdersQuery = `
            SELECT o.table_session_id as id, 'late_order' as type, t.id as tableid, 
                   GROUP_CONCAT(o.item_name, ', ') as content,
                   MIN(o.timestamp) as timestamp_raw
            FROM order_items o
            LEFT JOIN table_sessions t ON o.table_session_id = t.id
            WHERE o.status IN ('Chờ xác nhận', 'Đang chuẩn bị', 'Đang nấu', 'pending', 'cooking') 
            AND (${nowMs} - o.timestamp) > 900000 AND o.timestamp > 0 
            AND o.${condition.replace('resid', 'o.resid')}
            GROUP BY o.table_session_id
        `;

        try {
            const [revs, reqs, late] = await Promise.all([
                db.all(badReviewsQuery),
                db.all(reqQuery, params),
                db.all(lateOrdersQuery, params)
            ]);
            
            const rawFeed = [
                ...revs.map((r: any) => ({
                    id: r.id, 
                    type: r.type, 
                    tableid: r.tableid || '?', 
                    content: `Đánh giá xấu: ${r.content || 'Không để lại lời bình'}`, 
                    timestamp: new Date(r.timestamp_raw).getTime()
                })),
                ...reqs.map((r: any) => ({
                    id: r.id, 
                    type: r.type, 
                    tableid: r.tableid || '?', 
                    content: `Cần xử lý: ${r.content || 'Yêu cầu phục vụ'}`, 
                    timestamp: Number(r.timestamp_raw)
                })),
                ...late.map((r: any) => ({
                    id: r.id,
                    type: r.type,
                    tableid: r.tableid || '?',
                    content: `Đơn trễ: ${r.content}`,
                    timestamp: Number(r.timestamp_raw)
                }))
            ].sort((a, b) => b.timestamp - a.timestamp); // latest first
            
            urgentFeed = rawFeed.map(f => {
                const diffMs = nowMs - f.timestamp;
                const diffMins = Math.floor(diffMs / 60000);
                
                // Categorize severity
                let severity: 'critical' | 'warning' | 'info' = 'info';
                if (f.type === 'late_order') severity = 'critical';
                else if (f.type === 'review') severity = 'warning';
                else if (f.type === 'request') {
                    if (diffMins > 10) severity = 'warning';
                    else severity = 'info';
                }

                return { 
                    ...f, 
                    severity,
                    label: diffMins < 1 ? 'Vừa xong' : `${diffMins} phút trước` 
                };
            });
        } catch (e) {
            console.error("Failed to fetch urgent feed:", e);
        }

        return ApiSuccess({
            kitchenLagCount,
            neglectedTablesCount,
            stockoutCount,
            activeTablesCount,
            timestamp: nowMs,
            liveRevenue,
            todayRevenue: Number(todayRevenueRes[0]?.total) || 0,
            queueVolumes: {
                pending_to_confirmed: Number(qPending[0]?.count) || 0,
                confirmed_to_cooking: Number(qCooking[0]?.count) || 0,
                cooking_to_ready: 0,
                ready_to_served: Number(qReady[0]?.count) || 0
            },
            hotItems,
            urgentFeed
        });
    } catch (error) {
        console.error('Fetch live-pulse error:', error);
        return ApiError('Failed to fetch live pulse data', 500);
    }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

import { MOCK_LIVE_PULSE } from '@/data/mock-dashboard';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    if (resid === 'demo-mock') {
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

        return ApiSuccess({
            kitchenLagCount,
            neglectedTablesCount,
            stockoutCount,
            activeTablesCount,
            timestamp: nowMs
        });
    } catch (error) {
        console.error('Fetch live-pulse error:', error);
        return ApiError('Failed to fetch live pulse data', 500);
    }
}

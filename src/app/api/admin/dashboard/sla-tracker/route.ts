import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import { MOCK_SLA_TRACKER } from '@/data/mock-dashboard';

/**
 * GET /api/admin/dashboard/sla-tracker?resid=...
 * 
 * Returns SLA violation counts per status transition for today.
 * Status transitions tracked:
 *   1. Chờ xác nhận → Đã xác nhận (pending_to_confirmed)
 *   2. Đã xác nhận → Đang nấu (confirmed_to_cooking)
 *   3. Đang nấu → Sẵn sàng (cooking_to_ready)
 *   4. Sẵn sàng → Đã phục vụ (ready_to_served)
 */

const SLA_DEFAULTS: Record<string, Record<string, number>> = {
    A: { pending_to_confirmed: 2, confirmed_to_cooking: 5, cooking_to_ready: 15, ready_to_served: 3, e2e: 25 },
    B: { pending_to_confirmed: 1, confirmed_to_cooking: 3, cooking_to_ready: 12, ready_to_served: 5, e2e: 21 },
    C: { pending_to_confirmed: 1, confirmed_to_cooking: 3, cooking_to_ready: 10, ready_to_served: 0, e2e: 14 },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    if (resid === 'demo-mock') {
        return NextResponse.json(MOCK_SLA_TRACKER);
    }

    try {
        const db = await getDb();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();

        const model = 'A';
        const sla = SLA_DEFAULTS[model];

        const resFilter = resid !== 'all' ? ' AND resid = ?' : '';
        const resParams = resid !== 'all' ? [resid] : [];

        // Fetch all order items today with timestamps
        const allOrders = await db.all(
            `SELECT id, timestamp, status_updated_at, status, confirmed_at, cooking_at, ready_at, served_at 
             FROM order_items 
             WHERE timestamp > ?${resFilter} 
             ORDER BY timestamp ASC`,
            [todayMs, ...resParams]
        );

        // Since we only track E2E time (timestamp → status_updated_at), 
        // we compute overall violation rate and breakdown by status categories
        const statusCounts: Record<string, { total: number; violated: number; total_mins: number }> = {
            pending_to_confirmed: { total: 0, violated: 0, total_mins: 0 },
            confirmed_to_cooking: { total: 0, violated: 0, total_mins: 0 },
            cooking_to_ready: { total: 0, violated: 0, total_mins: 0 },
            ready_to_served: { total: 0, violated: 0, total_mins: 0 },
        };

        // Find served orders and compute E2E
        const servedOrders = allOrders.filter(o => 
            ['Đã phục vụ', 'Ready', 'Served', 'Sẵn sàng'].includes(o.status)
        );
        const totalOrders = allOrders.length;
        
        let totalE2eMins = 0;
        let worstE2eMins = 0;
        let e2eCount = 0;

        for (const order of allOrders) {
            const isServed = ['Đã phục vụ', 'Ready', 'Served', 'Sẵn sàng'].includes(order.status);
            
            if (order.timestamp) {
                // Determine timestamps for calculation
                const t0 = Number(order.timestamp);
                const t1 = Number(order.confirmed_at) || t0;
                const t2 = Number(order.cooking_at) || t1;
                const t3 = Number(order.ready_at) || t2;
                const t4 = Number(order.served_at) || (isServed ? Number(order.status_updated_at) : Date.now());

                const stageTimes = {
                    pending_to_confirmed: (t1 - t0) / 60000,
                    confirmed_to_cooking: (t2 - t1) / 60000,
                    cooking_to_ready: (t3 - t2) / 60000,
                    ready_to_served: (t4 - t3) / 60000
                };

                for (const t of Object.keys(stageTimes) as Array<keyof typeof stageTimes>) {
                    const elapsed = stageTimes[t];
                    const target = sla[t];
                    
                    // Stats for Today (completed stages or ongoing)
                    statusCounts[t].total++;
                    statusCounts[t].total_mins += elapsed;
                    if (elapsed > target) {
                        statusCounts[t].violated++;
                    }
                }

                if (isServed) {
                    const e2eMins = (t4 - t0) / 60000;
                    totalE2eMins += e2eMins;
                    e2eCount++;
                    if (e2eMins > worstE2eMins) worstE2eMins = e2eMins;
                }
            }
        }

        const avgE2e = e2eCount > 0 ? Math.round((totalE2eMins / e2eCount) * 10) / 10 : 0;

        const violations: Record<string, { count: number; total: number; rate: number; avg_time: number }> = {};
        for (const [key, data] of Object.entries(statusCounts)) {
            violations[key] = {
                count: data.violated,
                total: data.total,
                rate: data.total > 0 ? Math.round((data.violated / data.total) * 1000) / 10 : 0,
                avg_time: data.total > 0 ? Math.round((data.total_mins / data.total) * 10) / 10 : 0
            };
        }

        return ApiSuccess({
            model,
            slaConfig: {
                pending_to_confirmed: { target: sla.pending_to_confirmed, unit: 'min' },
                confirmed_to_cooking: { target: sla.confirmed_to_cooking, unit: 'min' },
                cooking_to_ready: { target: sla.cooking_to_ready, unit: 'min' },
                ready_to_served: { target: sla.ready_to_served, unit: 'min' },
            },
            violations,
            endToEnd: {
                avg: avgE2e,
                target: sla.e2e,
                worst: Math.round(worstE2eMins * 10) / 10,
                isWithinSla: avgE2e <= sla.e2e,
            },
            totalOrdersToday: totalOrders,
            servedToday: e2eCount
        });
    } catch (e) {
        console.error('[SLA Tracker] Error:', e);
        return ApiError('Failed to compute SLA data', 500);
    }
}

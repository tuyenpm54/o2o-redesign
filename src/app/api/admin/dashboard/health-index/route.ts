import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

/**
 * GET /api/admin/dashboard/health-index?resid=...
 * 
 * Computes a composite Health Score (0-100) from 5 weighted factors:
 * 1. SLA Compliance (30%) — % orders within SLA time limits
 * 2. Customer Feedback (25%) — ratio of positive feedback in last 2 hours
 * 3. Service Speed (20%) — avg E2E time vs target
 * 4. Cancellation Rate (15%) — % of cancelled/returned items today
 * 5. Kitchen Backlog (10%) — pending items vs capacity threshold
 */

// SLA defaults per shop model (in minutes)
const SLA_DEFAULTS: Record<string, Record<string, number>> = {
    A: { pending_to_confirmed: 2, confirmed_to_cooking: 5, cooking_to_ready: 15, ready_to_served: 3, e2e: 25 },
    B: { pending_to_confirmed: 1, confirmed_to_cooking: 3, cooking_to_ready: 12, ready_to_served: 5, e2e: 21 },
    C: { pending_to_confirmed: 1, confirmed_to_cooking: 3, cooking_to_ready: 10, ready_to_served: 0, e2e: 14 },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    try {
        const db = await getDb();
        const now = Date.now();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);

        // Determine shop model (default to A)
        const model = 'A';
        const sla = SLA_DEFAULTS[model];
        const slaE2eMs = sla.e2e * 60 * 1000;

        const resFilter = resid !== 'all' ? ' AND resid = ?' : '';
        const resParams = resid !== 'all' ? [resid] : [];

        // ── Factor 1: SLA Compliance (30%) ──
        // Count orders today that violated E2E SLA
        const todayOrders = await db.all(
            `SELECT timestamp, status_updated_at, status FROM order_items 
             WHERE timestamp > ?${resFilter} AND status IN ('Đã phục vụ', 'Ready', 'Served')`,
            [todayMs, ...resParams]
        );

        const totalServed = todayOrders.length;
        let slaViolations = 0;
        let totalE2eMs = 0;

        for (const order of todayOrders) {
            const e2e = (order.status_updated_at || order.timestamp) - order.timestamp;
            totalE2eMs += e2e;
            if (e2e > slaE2eMs) slaViolations++;
        }

        const slaComplianceRate = totalServed > 0 ? ((totalServed - slaViolations) / totalServed) * 100 : 100;
        const slaScore = Math.min(100, slaComplianceRate);

        // ── Factor 2: Customer Feedback (25%) ──
        // Positive feedback in last 2 hours
        const recentFeedback = await db.all(
            `SELECT rating FROM feedback 
             WHERE created_at > to_timestamp(? / 1000.0)${resid !== 'all' ? ' AND resid = ?' : ''}`,
            [twoHoursAgo, ...resParams]
        );

        let positiveFeedback = 0;
        let totalFeedback = recentFeedback.length;
        for (const fb of recentFeedback) {
            if (fb.rating === 'smile' || fb.rating === 'positive' || (typeof fb.rating === 'number' && fb.rating >= 4)) {
                positiveFeedback++;
            }
        }
        const feedbackScore = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 80; // Default 80 if no feedback yet

        // ── Factor 3: Service Speed (20%) ──
        const avgE2eMs = totalServed > 0 ? totalE2eMs / totalServed : 0;
        const avgE2eMins = avgE2eMs / 60000;
        // Score: 100 if avg <= 60% of SLA, 0 if >= 150% of SLA
        const speedRatio = avgE2eMins / sla.e2e;
        const speedScore = totalServed > 0
            ? Math.max(0, Math.min(100, (1.5 - speedRatio) / 0.9 * 100))
            : 80; // Default if no orders yet

        // ── Factor 4: Cancellation Rate (15%) ──
        const totalOrdersToday = await db.get(
            `SELECT COUNT(*) as total FROM order_items WHERE timestamp > ?${resFilter}`,
            [todayMs, ...resParams]
        );
        const cancelledToday = await db.get(
            `SELECT COUNT(*) as total FROM order_items WHERE timestamp > ?${resFilter} AND status IN ('Đã hủy', 'Cancelled', 'Returned', 'Trả món')`,
            [todayMs, ...resParams]
        );
        const cancelRate = totalOrdersToday.total > 0 ? (cancelledToday.total / totalOrdersToday.total) * 100 : 0;
        // Score: 100 if 0%, 0 if >= 20%
        const cancellationScore = Math.max(0, Math.min(100, (20 - cancelRate) / 20 * 100));

        // ── Factor 5: Kitchen Backlog (10%) ──
        const pendingItems = await db.get(
            `SELECT COUNT(*) as total FROM order_items 
             WHERE status IN ('Chờ xác nhận', 'Đã xác nhận', 'Đang nấu', 'Pending', 'Confirmed', 'Cooking')
             ${resFilter}`,
            [...resParams]
        );
        const backlogCount = pendingItems.total || 0;
        // Score: 100 if ≤ 10 items, decreases linearly, 0 if ≥ 50 items
        const backlogScore = Math.max(0, Math.min(100, (50 - backlogCount) / 40 * 100));

        // ── Composite Score ──
        const compositeScore = Math.round(
            slaScore * 0.30 +
            feedbackScore * 0.25 +
            speedScore * 0.20 +
            cancellationScore * 0.15 +
            backlogScore * 0.10
        );

        // Determine level
        let level: string;
        if (compositeScore >= 80) level = 'excellent';
        else if (compositeScore >= 60) level = 'good';
        else if (compositeScore >= 40) level = 'warning';
        else level = 'critical';

        return ApiSuccess({
            score: compositeScore,
            level,
            breakdown: {
                sla: {
                    score: Math.round(slaScore),
                    weight: 30,
                    violations: slaViolations,
                    total: totalServed,
                    complianceRate: totalServed > 0 ? Math.round(slaComplianceRate * 10) / 10 : 100
                },
                feedback: {
                    score: Math.round(feedbackScore),
                    weight: 25,
                    positive: positiveFeedback,
                    total: totalFeedback,
                    note: totalFeedback === 0 ? 'Chưa có feedback trong 2h qua' : null
                },
                speed: {
                    score: Math.round(speedScore),
                    weight: 20,
                    avgMinutes: Math.round(avgE2eMins * 10) / 10,
                    slaMinutes: sla.e2e
                },
                cancellation: {
                    score: Math.round(cancellationScore),
                    weight: 15,
                    rate: Math.round(cancelRate * 10) / 10,
                    cancelled: cancelledToday.total,
                    total: totalOrdersToday.total
                },
                backlog: {
                    score: Math.round(backlogScore),
                    weight: 10,
                    pendingItems: backlogCount
                }
            }
        });
    } catch (e) {
        console.error('[Health Index] Error:', e);
        return ApiError('Failed to compute health index', 500);
    }
}

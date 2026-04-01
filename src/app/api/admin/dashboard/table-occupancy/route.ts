import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

/**
 * GET /api/admin/dashboard/table-occupancy?resid=...
 * 
 * Returns real-time table occupancy metrics:
 * - Active tables vs total tables
 * - Guest count from active session presences
 * - Average session duration
 * - Hourly occupancy heatmap (today)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    try {
        const db = await getDb();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();
        const now = Date.now();

        const resFilter = resid !== 'all' ? ' AND resid = ?' : '';
        const resParams = resid !== 'all' ? [resid] : [];

        // Total tables (should ideally be filtered by resid, but schema lacks it for now)
        const totalTablesRow = await db.get('SELECT COUNT(*) as total FROM tables');
        const totalTables = Number(totalTablesRow?.total) || 0;

        // Active table sessions
        const activeSessionsRow = await db.get(
            `SELECT COUNT(*) as total FROM table_sessions WHERE status = 'ACTIVE'${resFilter}`,
            [...resParams]
        );
        const activeTables = activeSessionsRow?.total || 0;
        
        // Logical safety: total tables should at least match active tables in dashboard display
        const displayTotalTables = Math.max(totalTables, activeTables);
        const occupancyRate = displayTotalTables > 0 ? Math.round((activeTables / displayTotalTables) * 100) : 0;

        // Guest count (distinct users with active presences)
        let guestCount = 0;
        if (activeTables > 0) {
            const guestRow = await db.get(
                `SELECT COUNT(DISTINCT sp.session_id) as total 
                 FROM session_presences sp 
                 JOIN table_sessions ts ON sp.resid = ts.resid AND LOWER(sp.tableid) = LOWER(ts.tableid) 
                 WHERE ts.status = 'ACTIVE'${resid !== 'all' ? ' AND ts.resid = ?' : ''}`,
                [...resParams]
            );
            guestCount = guestRow?.total || activeTables; // Fallback to 1 per table
        }

        const avgGuestsPerTable = activeTables > 0 ? Math.round((guestCount / activeTables) * 10) / 10 : 0;

        // Average session duration (from completed sessions today)
        const avgSessionRow = await db.get(
            `SELECT AVG(ended_at - started_at) as avg_duration 
             FROM table_sessions 
             WHERE status = 'PAID' AND started_at > ?${resFilter}`,
            [todayMs, ...resParams]
        );
        const avgSessionMs = avgSessionRow?.avg_duration || 0;
        const avgSessionMinutes = Math.round(Number(avgSessionMs) / 60000);

        // Hourly occupancy heatmap (count PAID sessions that started in each hour today)
        const hourlyData: Array<{ hour: string; sessions: number; revenue: number }> = [];
        for (let h = 6; h <= 23; h++) {
            const hourStart = todayMs + (h * 60 * 60 * 1000) - (7 * 60 * 60 * 1000); // Adjust for UTC+7
            const hourEnd = hourStart + (60 * 60 * 1000);

            const hourRow = await db.get(
                `SELECT COUNT(*) as sessions, COALESCE(SUM(total), 0) as revenue 
                 FROM table_sessions 
                 WHERE started_at >= ? AND started_at < ?${resFilter}`,
                [hourStart, hourEnd, ...resParams]
            );

            hourlyData.push({
                hour: `${h.toString().padStart(2, '0')}:00`,
                sessions: hourRow?.sessions || 0,
                revenue: hourRow?.revenue || 0
            });
        }

        // Find peak hour
        const peakHour = hourlyData.reduce((max, h) => h.sessions > max.sessions ? h : max, hourlyData[0]);

        return ApiSuccess({
            active: activeTables,
            total: displayTotalTables,
            occupancyRate,
            guestCount,
            avgGuestsPerTable,
            avgSessionMinutes,
            hourlyHeatmap: hourlyData,
            peakHour: peakHour?.hour || 'N/A',
            peakSessions: peakHour?.sessions || 0
        });
    } catch (e) {
        console.error('[Table Occupancy] Error:', e);
        return ApiError('Failed to compute table occupancy', 500);
    }
}

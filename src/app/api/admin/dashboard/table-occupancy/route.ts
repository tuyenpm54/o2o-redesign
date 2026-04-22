import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import { MOCK_TABLE_OCCUPANCY } from '@/data/mock-dashboard';

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

    if (resid === 'demo-mock' || resid === 'all' || resid === '100') {
        return NextResponse.json(MOCK_TABLE_OCCUPANCY);
    }

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

        // Detailed tables list taking all generated QR codes as truth
        const allTablesQuery = `
            SELECT q.tableid, q.area_name,
                ts.id as session_id, ts.started_at, ts.status as session_status,
                (SELECT COUNT(DISTINCT sp.session_id) FROM session_presences sp WHERE sp.tableid = q.tableid AND sp.resid = q.resid AND ts.status = 'ACTIVE') as guest_count,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status != 'Served') as pending_count,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status = 'Served') as served_count,
                (SELECT MAX(oi.served_at) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status = 'Served') as last_served_at
            FROM qr_codes q
            LEFT JOIN table_sessions ts ON ts.tableid = q.tableid AND ts.resid = q.resid AND ts.status = 'ACTIVE'
            WHERE q.resid = ? ${resid === 'all' ? 'OR 1=1' : ''}
        `;
        const qrTables = await db.all(allTablesQuery, [...resParams]);

        // Fallback: Also select ANY active session that isn't in qr_codes for backward compatibility / orphaned tables
        const orphanedActiveQuery = `
            SELECT ts.id as session_id, ts.tableid, ts.started_at, 'Khu Khác' as area_name,
                (SELECT COUNT(DISTINCT sp.session_id) FROM session_presences sp WHERE sp.tableid = ts.tableid AND sp.resid = ts.resid) as guest_count,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status != 'Served') as pending_count,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status = 'Served') as served_count,
                (SELECT MAX(oi.served_at) FROM order_items oi WHERE oi.table_session_id = ts.id AND oi.status = 'Served') as last_served_at
            FROM table_sessions ts
            WHERE ts.status = 'ACTIVE' AND ts.tableid NOT IN (SELECT tableid FROM qr_codes WHERE resid = ts.resid)
            ${resFilter}
        `;
        const orphanedTables = await db.all(orphanedActiveQuery, [...resParams]);

        const allTables = [...qrTables, ...orphanedTables];

        let guestCount = 0;
        let actualActiveCount = 0;
        const activeTablesList = allTables.map((t: any) => {
            const isActive = !!t.session_id;
            let status = 'EMPTY';
            let tableGuestCount = 0;
            let idleMinutes = 0;
            let startMinutes = 0;

            if (isActive) {
                actualActiveCount++;
                tableGuestCount = Number(t.guest_count) || 1;
                guestCount += tableGuestCount;

                const pending = Number(t.pending_count);
                const served = Number(t.served_count);
                
                status = 'WAITING';
                if (pending > 0 && served > 0) status = 'SERVING';
                if (pending === 0 && served > 0) status = 'DONE';

                startMinutes = Math.floor((now - Number(t.started_at)) / 60000);
                idleMinutes = t.last_served_at ? Math.floor((now - Number(t.last_served_at)) / 60000) : startMinutes;
            }

            return {
                id: t.tableid,
                areaName: t.area_name || 'Khu Khác',
                guestCount: tableGuestCount,
                status,
                idleMinutes,
                sessionStartMinutes: startMinutes
            };
        });

        // Sort active tables: WAITING -> SERVING -> DONE -> EMPTY
        const statusWeight = { 'WAITING': 1, 'SERVING': 2, 'DONE': 3, 'EMPTY': 4 };
        activeTablesList.sort((a: any, b: any) => statusWeight[a.status as keyof typeof statusWeight] - statusWeight[b.status as keyof typeof statusWeight]);

        const avgGuestsPerTable = actualActiveCount > 0 ? Math.round((guestCount / actualActiveCount) * 10) / 10 : 0;

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
            activeTablesList,
            hourlyHeatmap: hourlyData,
            peakHour: peakHour?.hour || 'N/A',
            peakSessions: peakHour?.sessions || 0
        });
    } catch (e) {
        console.error('[Table Occupancy] Error:', e);
        return ApiError('Failed to compute table occupancy', 500);
    }
}

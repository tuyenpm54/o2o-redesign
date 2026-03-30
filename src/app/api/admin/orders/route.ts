import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();

        // ✅ Only fetch order items from ACTIVE table sessions (current invoices)
        // ✅ Only fetch items that have been CONFIRMED (not 'Chờ xác nhận') — KDS only sees confirmed items
        const allOrderItems = await db.all(`
            SELECT oi.*, u.name as user_name
            FROM order_items oi
            JOIN table_sessions ts ON oi.table_session_id = ts.id AND ts.status = 'ACTIVE'
            LEFT JOIN users u ON oi.user_id = u.id
            WHERE oi.status != 'Chờ xác nhận'
            ORDER BY oi.timestamp ASC
        `);

        if (!allOrderItems || allOrderItems.length === 0) {
            return NextResponse.json({ tables: [] });
        }

        // Fetch rounds for context
        const activeRounds = await db.all(`
            SELECT r.*, u.name as user_name
            FROM order_rounds r
            JOIN table_sessions ts ON r.table_session_id = ts.id AND ts.status = 'ACTIVE'
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.status = 'Đã xác nhận'
            ORDER BY r.created_at ASC
        `);

        // Add table info
        const dbTables = await db.all('SELECT id, name FROM tables');
        const tableIdToName = new Map();
        dbTables.forEach((t: any) => {
            tableIdToName.set(t.id, t.name);
        });

        // Group by table, then by round
        const tableMap = new Map();

        for (const item of allOrderItems) {
            const tableIdRaw = item.tableid || 'Unknown';
            const tableid = String(tableIdRaw);

            if (!tableMap.has(tableid)) {
                tableMap.set(tableid, {
                    id: tableid,
                    name: tableIdToName.get(tableid) || `Bàn ${tableid}`,
                    rounds: new Map(),
                    users: [] // kept for backward compatibility
                });
            }

            const table = tableMap.get(tableid);
            const roundId = item.order_round_id || 'legacy';

            if (!table.rounds.has(roundId)) {
                const roundMeta = activeRounds.find((r: any) => r.id === roundId);
                table.rounds.set(roundId, {
                    roundId,
                    userName: roundMeta?.user_name || item.user_name || 'Khách',
                    createdAt: roundMeta?.created_at || item.timestamp,
                    items: []
                });
            }

            table.rounds.get(roundId).items.push(item);
        }

        // Convert rounds Map to array and build backward-compatible users array
        const tables = Array.from(tableMap.values()).map(table => {
            const roundsArray = Array.from(table.rounds.values());

            // Backward compatible: group by user for legacy KDS UI
            const userMap = new Map();
            for (const item of allOrderItems.filter((i: any) => String(i.tableid) === table.id)) {
                if (!userMap.has(item.user_id)) {
                    userMap.set(item.user_id, {
                        userId: item.user_id,
                        userName: item.user_name || 'Anonymous',
                        orders: []
                    });
                }
                userMap.get(item.user_id).orders.push(item);
            }

            return {
                ...table,
                rounds: roundsArray,
                users: Array.from(userMap.values())
            };
        });

        return NextResponse.json({ tables });
    } catch (e) {
        console.error("[Admin Orders API] Failed to fetch orders:", e);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

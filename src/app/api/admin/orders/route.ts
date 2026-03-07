import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();

        const allOrderItems = await db.all('SELECT * FROM order_items');
        if (!allOrderItems || allOrderItems.length === 0) {
            return NextResponse.json({ tables: [] });
        }

        // Add users mock info to get names
        const users = await db.all('SELECT id, name FROM users');
        const userToName = new Map();
        users.forEach((u: any) => {
            userToName.set(u.id, u.name);
        });

        // Add table info
        const dbTables = await db.all('SELECT id, name FROM tables');
        const tableIdToName = new Map();
        dbTables.forEach((t: any) => {
            tableIdToName.set(t.id, t.name);
        });

        const activeSessions = await db.all('SELECT user_id, tableid FROM sessions');
        const userToTable = new Map();
        activeSessions.forEach((s: any) => {
            if (s.user_id) userToTable.set(s.user_id, s.tableid);
        });

        const tableMap = new Map();

        // Group order items by user
        const userOrdersMap = new Map();
        for (const item of allOrderItems) {
            if (!userOrdersMap.has(item.user_id)) {
                userOrdersMap.set(item.user_id, []);
            }
            userOrdersMap.get(item.user_id).push(item);
        }

        for (const [userId, userOrders] of userOrdersMap.entries()) {
            const tableid = userOrders[0].tableid || userToTable.get(userId) || 'Unknown Table';
            const userName = userToName.get(userId) || 'Anonymous';

            let tableName = tableIdToName.get(tableid) || `Bàn ${tableid}`;
            if (tableid === 'Unknown Table') {
                tableName = 'Bàn Trống/Chưa Rõ';
            }

            if (!tableMap.has(tableid)) {
                tableMap.set(tableid, {
                    id: tableid,
                    name: tableName,
                    users: []
                });
            }

            const table = tableMap.get(tableid);
            table.users.push({
                userId,
                userName,
                orders: userOrders
            });
        }

        const tables = Array.from(tableMap.values());

        return NextResponse.json({ tables });
    } catch (e) {
        console.error("[Admin Orders API] Failed to fetch orders:", e);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

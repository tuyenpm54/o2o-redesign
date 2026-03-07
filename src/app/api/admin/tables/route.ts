import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const tables = await db.all('SELECT * FROM tables ORDER BY id ASC');
        const activeSessions = await db.all('SELECT user_id, tableid FROM sessions WHERE expires > ?', [Date.now()]);

        const allOrderItems = await db.all('SELECT * FROM order_items');

        const enrichedTables = tables.map(table => {
            const tableSessions = activeSessions.filter(s => s.tableid === table.id);
            const peopleCount = tableSessions.length;

            let status = 'Rảnh';
            let activeOrderCount = 0;
            let items: any[] = [];

            if (peopleCount > 0) {
                status = 'Đang xem menu';

                let hasActiveGlobal = false;

                tableSessions.forEach(session => {
                    const userOrderItems = allOrderItems.filter((i: any) => i.user_id === session.user_id && i.resid === '100'); // Hardcoded resid '100' for demo

                    if (userOrderItems.length > 0) {
                        items = [...items, ...userOrderItems];
                        const hasActive = userOrderItems.some((item: any) => item.status !== 'Đã phục vụ');
                        if (hasActive) {
                            hasActiveGlobal = true;
                            activeOrderCount += userOrderItems.filter((item: any) => item.status !== 'Đã phục vụ').length;
                        }
                    }
                });

                if (items.length > 0) {
                    status = hasActiveGlobal ? 'Đang phục vụ' : 'Chờ thanh toán';
                }
            }

            return {
                ...table,
                peopleCount,
                status,
                activeOrderCount,
                items
            };
        });

        return NextResponse.json({ tables: enrichedTables });
    } catch (e) {
        console.error("[Admin Tables API] Failed to fetch tables:", e);
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { id, name } = await request.json();

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields: id, name' }, { status: 400 });
        }

        const db = await getDb();

        const existing = await db.get('SELECT id FROM tables WHERE id = ?', [id]);
        if (existing) {
            return NextResponse.json({ error: 'Table ID already exists' }, { status: 409 });
        }

        await db.run('INSERT INTO tables (id, name) VALUES (?, ?)', [id, name]);

        const newTable = await db.get('SELECT * FROM tables WHERE id = ?', [id]);

        return NextResponse.json({ success: true, table: newTable });
    } catch (e) {
        console.error("[Admin Tables API] Failed to add table:", e);
        return NextResponse.json({ error: 'Failed to add table' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
        }

        const db = await getDb();

        await db.run('DELETE FROM tables WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[Admin Tables API] Failed to delete table:", e);
        return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const { action } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const tableSessions = await db.all('SELECT user_id, resid FROM sessions WHERE tableid = ?', [id]);

        if (action === 'confirm_all') {
            for (const session of tableSessions) {
                await db.run(
                    'UPDATE order_items SET status = ? WHERE user_id = ? AND resid = ? AND status = ?',
                    ['Đã xác nhận', session.user_id, session.resid || '100', 'Chờ xác nhận']
                );
            }
            return NextResponse.json({ success: true });

        } else if (action === 'payment') {
            for (const session of tableSessions) {
                await db.run('DELETE FROM cart_items WHERE user_id = ? AND resid = ?', [session.user_id, session.resid || '100']);
                await db.run('DELETE FROM order_items WHERE user_id = ? AND resid = ?', [session.user_id, session.resid || '100']);
            }

            await db.run('DELETE FROM sessions WHERE tableid = ?', [id]);

            return NextResponse.json({ success: true, message: 'Cleaned table' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        console.error("[Admin Tables API] Action failed:", e);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}

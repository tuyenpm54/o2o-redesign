import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return session.user_id;
}

export async function GET(request: Request) {
    const userId = await getAuthenticatedUser();
    if (!userId) return NextResponse.json({ items: [], total: 0 });

    const { searchParams } = new URL(request.url);
    const resId = searchParams.get('resId');
    if (!resId) return NextResponse.json({ error: 'Missing resId' }, { status: 400 });

    try {
        const db = await getDb();
        const cartItems = await db.all(
            'SELECT * FROM cart_items WHERE user_id = ? AND resid = ? ORDER BY added_at ASC',
            [userId, resId]
        );

        const formattedItems = cartItems.map(row => ({
            item: { id: row.item_id, name: row.name, price: row.price },
            quantity: row.qty
        }));

        const total = formattedItems.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0);

        return NextResponse.json({ items: formattedItems, total });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getAuthenticatedUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resId, item, quantity } = await request.json();

    try {
        const db = await getDb();

        const existingItem = await db.get(
            'SELECT id, qty FROM cart_items WHERE user_id = ? AND resid = ? AND item_id = ?',
            [userId, resId, item.id]
        );

        if (existingItem) {
            const newQty = existingItem.qty + quantity;
            if (newQty <= 0) {
                await db.run('DELETE FROM cart_items WHERE id = ?', [existingItem.id]);
            } else {
                await db.run('UPDATE cart_items SET qty = ? WHERE id = ?', [newQty, existingItem.id]);
            }
        } else if (quantity > 0) {
            await db.run(
                'INSERT INTO cart_items (user_id, resid, item_id, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, resId, item.id, item.name, item.price, quantity]
            );
        }

        const cartItems = await db.all(
            'SELECT * FROM cart_items WHERE user_id = ? AND resid = ? ORDER BY added_at ASC',
            [userId, resId]
        );

        const formattedItems = cartItems.map(row => ({
            item: { id: row.item_id, name: row.name, price: row.price },
            quantity: row.qty
        }));

        const total = formattedItems.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0);

        return NextResponse.json({ items: formattedItems, total });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

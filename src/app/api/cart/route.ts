import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    const session = sessions[sessionId];
    if (!session || session.expires < Date.now()) return null;

    return session.userId;
}

export async function GET(request: Request) {
    const userId = await getAuthenticatedUser();
    if (!userId) return NextResponse.json({ items: [], total: 0 });

    const { searchParams } = new URL(request.url);
    const resId = searchParams.get('resId');
    if (!resId) return NextResponse.json({ error: 'Missing resId' }, { status: 400 });

    try {
        const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf8'));

        const userCart = carts[`${userId}_${resId}`] || { items: [], total: 0 };
        return NextResponse.json(userCart);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getAuthenticatedUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resId, item, quantity } = await request.json();

    try {
        const cartsPath = path.join(process.cwd(), 'src/data/carts.json');
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
        const cartKey = `${userId}_${resId}`;

        let cart = carts[cartKey] || { items: [], total: 0 };

        const existingIdx = cart.items.findIndex((i: any) => i.item.id === item.id);
        if (existingIdx > -1) {
            cart.items[existingIdx].quantity += quantity;
        } else {
            cart.items.push({ item, quantity });
        }

        cart.total = cart.items.reduce((acc: number, cur: any) => acc + (cur.item.price * cur.quantity), 0);

        carts[cartKey] = cart;
        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));

        return NextResponse.json(cart);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

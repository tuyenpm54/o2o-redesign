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

    return { sessionId, userId: session.user_id, tableid: session.tableid, resid: session.resid };
}

export async function GET(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || auth.userId;

        const db = await getDb();
        const vouchers = await db.all(
            `SELECT * FROM vouchers WHERE user_id = ? AND status = 'active' ORDER BY discount_value DESC`,
            [userId]
        );

        return NextResponse.json({ success: true, vouchers });
    } catch (error) {
        console.error('Vouchers GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

    return { sessionId, userId: session.user_id };
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const db = await getDb();

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ? AND user_id = ?', [id, auth.userId]);
        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        if (voucher.status !== 'active') {
            return NextResponse.json({ error: 'Voucher already used or expired' }, { status: 400 });
        }

        await db.run('UPDATE vouchers SET status = ? WHERE id = ?', ['used', id]);

        return NextResponse.json({
            success: true,
            voucher: { ...voucher, status: 'used' }
        });
    } catch (error) {
        console.error('Voucher use error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

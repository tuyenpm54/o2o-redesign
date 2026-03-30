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

export async function POST(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { rating, tags, resid, tableid, table_session_id } = body;

        if (!rating || !resid || !tableid) {
            return NextResponse.json({ error: 'Missing required feedback fields' }, { status: 400 });
        }

        if (!['positive', 'negative'].includes(rating)) {
            return NextResponse.json({ error: 'Invalid rating value' }, { status: 400 });
        }

        const db = await getDb();
        const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // Find active table session if not provided
        let sessionId = table_session_id;
        if (!sessionId) {
            const activeSession = await db.get(
                `SELECT id FROM table_sessions WHERE resid = ? AND tableid = ? AND status = 'ACTIVE' LIMIT 1`,
                [resid, tableid]
            );
            sessionId = activeSession?.id || null;
        }

        await db.run(
            `INSERT INTO feedback (id, table_session_id, user_id, resid, tableid, rating, tags) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, sessionId, auth.userId, resid, tableid, rating, JSON.stringify(tags || [])]
        );

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Feedback API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

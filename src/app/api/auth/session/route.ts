import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return ApiError('Not authenticated', 401);
        }

        const { resid, tableid } = await request.json();
        if (!resid || !tableid) {
            return ApiError('Missing resid or tableid', 400);
        }

        const db = await getDb();

        // Update session with resid and tableid
        await db.run(
            'UPDATE sessions SET resid = ?, tableid = ?, lastActive = ? WHERE id = ?',
            [resid, tableid, Date.now(), sessionId]
        );

        return ApiSuccess({ success: true, message: 'Session bound to table' });
    } catch (error) {
        console.error('Session binding error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

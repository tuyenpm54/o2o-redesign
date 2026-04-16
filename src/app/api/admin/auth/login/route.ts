import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const identifier = body.identifier || body.phone;

        if (!identifier) {
            return NextResponse.json({ error: 'Account is required' }, { status: 400 });
        }

        const db = await getDb();
        const cookieStore = await cookies();
        const existingSessionId = cookieStore.get('admin_session_id')?.value;

        // Find system user
        let user = await db.get('SELECT * FROM system_users WHERE phone = ? OR email = ?', [identifier, identifier]);
        
        if (!user) {
             return NextResponse.json({ error: 'Account not found or not a system user' }, { status: 404 });
        }
        
        const userId = user.id;
        const expires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
        let sessionId = existingSessionId;

        // Check if session exists in DB
        if (existingSessionId) {
            const currentSession = await db.get('SELECT * FROM system_sessions WHERE id = ?', [existingSessionId]);
            if (currentSession) {
                await db.run('UPDATE system_sessions SET system_user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                    [userId, expires, Date.now(), existingSessionId]);
            } else {
                sessionId = undefined;
            }
        }
        
        // Create new session if none exists or invalid
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            await db.run('INSERT INTO system_sessions (id, system_user_id, expires, lastActive, created_at) VALUES (?, ?, ?, ?, ?)',
                [sessionId, userId, expires, Date.now(), Date.now()]);
            
            cookieStore.set('admin_session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60,
                path: '/',
            });
        }

        return NextResponse.json({ user, success: true });
    } catch (error) {
        console.error('Admin Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

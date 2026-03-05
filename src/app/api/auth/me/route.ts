import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const db = await getDb();

        // Check session in SQLite
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);

        if (!session || session.expires < Date.now()) {
            return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
        }

        // Get user from SQLite
        const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Parse preferences
        user.preferences = JSON.parse(user.preferences || '[]');
        user.isGuest = !!user.isGuest;

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

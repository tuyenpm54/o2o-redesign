import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const db = await getDb();
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);

        if (!session || session.expires < Date.now()) {
            return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
        }

        const body = await request.json();
        const updates: string[] = [];
        const params: any[] = [];

        if (body.name !== undefined) {
            updates.push('name = ?');
            params.push(body.name);
        }
        // In the future, we could also update email, dob, gender if those existed in the DB
        if (body.phone !== undefined) {
            updates.push('phone = ?');
            params.push(body.phone);
        }

        if (updates.length > 0) {
            params.push(session.user_id);
            await db.run(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);
        user.preferences = JSON.parse(user.preferences || '[]');
        user.isGuest = !!user.isGuest;

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

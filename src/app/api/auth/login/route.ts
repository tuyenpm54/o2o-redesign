import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { phone, name } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const db = await getDb();
        const cookieStore = await cookies();
        const existingSessionId = cookieStore.get('session_id')?.value;

        let user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
        let userId: string;

        if (user) {
            userId = user.id;
            // Optionally update name if provided
            if (name && name !== 'Khách hàng mới') {
                await db.run('UPDATE users SET name = ?, isGuest = 0 WHERE id = ?', [name, userId]);
                user.name = name;
                user.isGuest = 0;
            }
        } else {
            // Check if current session is a guest session that we can upgrade
            let guestUser = null;
            if (existingSessionId) {
                const session = await db.get('SELECT * FROM sessions WHERE id = ?', [existingSessionId]);
                if (session) {
                    guestUser = await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [session.user_id]);
                }
            }

            if (guestUser) {
                userId = guestUser.id;
                await db.run(
                    'UPDATE users SET phone = ?, name = ?, isGuest = 0, tier = ? WHERE id = ?',
                    [phone, name || 'Khách hàng mới', 'Thành viên', userId]
                );
                user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            } else {
                userId = `u${Date.now()}`;
                await db.run(
                    'INSERT INTO users (id, phone, name, tier, avatar, isGuest) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        userId,
                        phone,
                        name || 'Khách hàng mới',
                        'Thành viên',
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
                        0
                    ]
                );
                user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            }
        }

        const sessionId = crypto.randomUUID();
        const expires = Date.now() + (7 * 24 * 60 * 60 * 1000);

        await db.run(
            'INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)',
            [sessionId, userId, expires]
        );

        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        // Parse preferences for response
        if (user) {
            user.preferences = JSON.parse(user.preferences || '[]');
            user.isGuest = !!user.isGuest;
        }

        return NextResponse.json({ user, success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

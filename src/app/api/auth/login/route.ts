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

        // Find or create the real user account
        let user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
        let userId: string;

        if (user) {
            userId = user.id;
            if (name && name !== 'Khách hàng mới') {
                await db.run('UPDATE users SET name = ?, isGuest = 0 WHERE id = ?', [name, userId]);
                user.name = name;
                user.isGuest = 0;
            } else {
                await db.run('UPDATE users SET isGuest = 0 WHERE id = ?', [userId]);
            }
        } else {
            // New user: create account (reuse guest user id so cart data is preserved)
            const existingSession = existingSessionId
                ? await db.get('SELECT * FROM sessions WHERE id = ?', [existingSessionId])
                : null;
            const existingGuestUser = existingSession
                ? await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [existingSession.user_id])
                : null;

            if (existingGuestUser) {
                // Upgrade guest user in-place — same user_id, cart data preserved
                userId = existingGuestUser.id;
                await db.run(
                    'UPDATE users SET phone = ?, name = ?, isGuest = 0, tier = ?, avatar = ? WHERE id = ?',
                    [
                        phone,
                        name || 'Khách hàng mới',
                        'Thành viên',
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
                        userId
                    ]
                );
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
            }
        }

        user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        const expires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

        if (existingSessionId) {
            // ✅ Keep same session — just update user_id and extend expiry
            await db.run(
                'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                [userId, expires, Date.now(), existingSessionId]
            );
        } else {
            // No existing session — create a new one
            const sessionId = crypto.randomUUID();
            await db.run(
                'INSERT INTO sessions (id, user_id, expires, lastActive) VALUES (?, ?, ?, ?)',
                [sessionId, userId, expires, Date.now()]
            );
            cookieStore.set('session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60,
                path: '/',
            });
        }

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

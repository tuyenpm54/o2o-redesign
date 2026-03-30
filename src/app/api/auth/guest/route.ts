import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];
const GUEST_AVATARS = [
    '/avatars/guest/pho.png',
    '/avatars/guest/banh-mi.png',
    '/avatars/guest/tra-da.png',
    '/avatars/guest/rice-ball.png',
    '/avatars/guest/dumpling.png',
    '/avatars/guest/matcha.png',
];

export async function POST() {
    try {
        const db = await getDb();
        const cookieStore = await cookies();
        const existingSessionId = cookieStore.get('session_id')?.value;

        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const randomAvatar = GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)];
        const guestId = `g_${Date.now()}`;

        const guestUser = {
            id: guestId,
            phone: 'Guest',
            name: `${randomColor} Guest`,
            points: 0,
            tier: 'Guest',
            avatar: randomAvatar,
            preferences: '[]',
            isGuest: 1
        };

        await db.run(
            'INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isguest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [guestUser.id, guestUser.phone, guestUser.name, guestUser.points, guestUser.tier, guestUser.avatar, guestUser.preferences, guestUser.isGuest]
        );

        const guestExpires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

        if (existingSessionId) {
            // ✅ Keep the same session — just switch user_id to the new guest
            const existingSession = await db.get('SELECT * FROM sessions WHERE id = ?', [existingSessionId]);
            if (existingSession) {
                await db.run(
                    'UPDATE sessions SET user_id = ?, expires = ?, lastactive = ? WHERE id = ?',
                    [guestId, guestExpires, Date.now(), existingSessionId]
                );

                const responseUser = {
                    ...guestUser,
                    preferences: [],
                    isGuest: true
                };
                return ApiSuccess({ user: responseUser });
            }
        }

        // No existing session — create a fresh one
        const sessionId = crypto.randomUUID();
        await db.run(
            'INSERT INTO sessions (id, user_id, expires, lastactive, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [sessionId, guestUser.id, guestExpires, Date.now()]
        );

        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60,
            path: '/',
        });

        const responseUser = {
            ...guestUser,
            preferences: [],
            isGuest: true
        };

        return ApiSuccess({ user: responseUser });
    } catch (error) {
        console.error('Guest login error:', error);
        return ApiError((error as any).message || 'Internal Server Error', 500);
    }
}

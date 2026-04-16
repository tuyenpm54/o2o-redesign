import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];

export async function POST() {
    try {
        const db = await getDb();
        const cookieStore = await cookies();
        const deviceId = cookieStore.get('device_id')?.value;
        let guestUser = null;

        // Try to recover guest from device_id
        if (deviceId) {
            const rawUser = await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [deviceId]);
            if (rawUser) {
                guestUser = rawUser;
                // Since this guest is still unverified, we can use it
            }
        }

        if (!guestUser) {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            const guestId = `g_${Date.now()}`;
            const randomAvatar = `https://api.dicebear.com/7.x/miniavs/svg?seed=${guestId}`;

            guestUser = {
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
                'INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [guestUser.id, guestUser.phone, guestUser.name, guestUser.points, guestUser.tier, guestUser.avatar, guestUser.preferences, 1]
            );

            // Plant new device_id cookie (3 years)
            cookieStore.set('device_id', guestId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3 * 365 * 24 * 60 * 60,
                path: '/',
            });
        }

        const guestExpires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
        let sessionId = cookieStore.get('session_id')?.value;

        if (sessionId) {
            // ✅ Fix existing session to point to this guest
            const existingSession = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
            if (existingSession) {
                await db.run(
                    'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                    [guestUser.id, guestExpires, Date.now(), sessionId]
                );
            } else {
                sessionId = undefined;
            }
        }

        if (!sessionId) {
            // No existing session — create a fresh one
            sessionId = crypto.randomUUID();
            await db.run(
                'INSERT INTO sessions (id, user_id, expires, lastActive, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [sessionId, guestUser.id, guestExpires, Date.now()]
            );
        }

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

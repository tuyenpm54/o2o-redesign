import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];

export async function POST() {
    try {
        const db = await getDb();
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const guestId = `g_${Date.now()}`;

        const guestUser = {
            id: guestId,
            phone: 'Guest',
            name: `${randomColor} Guest`,
            points: 0,
            tier: 'Guest',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
            preferences: '[]',
            isGuest: 1
        };

        await db.run(
            'INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [guestUser.id, guestUser.phone, guestUser.name, guestUser.points, guestUser.tier, guestUser.avatar, guestUser.preferences, guestUser.isGuest]
        );

        const sessionId = crypto.randomUUID();
        const expires = Date.now() + (24 * 60 * 60 * 1000); // 1 day for guests

        await db.run(
            'INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)',
            [sessionId, guestUser.id, expires]
        );

        const cookieStore = await cookies();
        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
            path: '/',
        });

        // Convert back to frontend format
        const responseUser = {
            ...guestUser,
            preferences: [],
            isGuest: true
        };

        return NextResponse.json({ user: responseUser, success: true });
    } catch (error) {
        console.error('Guest login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

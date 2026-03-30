import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ success: true });
        }

        const db = await getDb();
        const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];
        const GUEST_AVATARS = [
            '/avatars/guest/pho.png',
            '/avatars/guest/banh-mi.png',
            '/avatars/guest/tra-da.png',
            '/avatars/guest/rice-ball.png',
            '/avatars/guest/dumpling.png',
            '/avatars/guest/matcha.png',
        ];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const randomAvatar = GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)];
        const guestId = `g_${Date.now()}`;

        // Create a new guest user
        await db.run(
            'INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [guestId, 'Guest', `${randomColor} Guest`, 0, 'Guest', randomAvatar, '[]', 1]
        );

        // ✅ Keep same session — just switch the user_id to the new guest and reset created_at
        await db.run(
            'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ?, created_at = ? WHERE id = ?',
            [guestId, Date.now() + (24 * 60 * 60 * 1000), Date.now(), Date.now(), sessionId]
        );

        const responseUser = {
            id: guestId,
            name: `${randomColor} Guest`,
            phone: 'Guest',
            points: 0,
            tier: 'Guest',
            avatar: randomAvatar,
            preferences: [],
            isGuest: true
        };

        return NextResponse.json({ user: responseUser, success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

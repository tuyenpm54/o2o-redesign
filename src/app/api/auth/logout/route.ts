import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        const deviceId = cookieStore.get('device_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ success: true });
        }

        const db = await getDb();
        
        let guestUserToRestore = null;

        // Check if current device_id is still a valid Guest
        if (deviceId) {
            const rawUser = await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [deviceId]);
            if (rawUser) {
                guestUserToRestore = rawUser;
            }
        }

        const guestExpires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

        if (guestUserToRestore) {
            // SCENARIO C Logout: Restore existing Guest Identity
            await db.run(
                'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                [guestUserToRestore.id, guestExpires, Date.now(), sessionId]
            );
        } else {
            // SCENARIO B Logout: The original guest was upgraded, or there was no device_id.
            // Create a brand new Guest
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            const newGuestId = `g_${Date.now()}`;
            const randomAvatar = `https://api.dicebear.com/7.x/miniavs/svg?seed=${newGuestId}`;

            const newGuest = {
                id: newGuestId,
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
                [newGuest.id, newGuest.phone, newGuest.name, newGuest.points, newGuest.tier, newGuest.avatar, newGuest.preferences, 1]
            );

            // Plant new device_id cookie
            cookieStore.set('device_id', newGuestId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3 * 365 * 24 * 60 * 60,
                path: '/',
            });

            // Point existing session to this new guest
            await db.run(
                'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                [newGuestId, guestExpires, Date.now(), sessionId]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

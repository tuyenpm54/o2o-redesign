import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const COLORS = ['Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];

export async function POST(request: Request) {
    try {
        const usersPath = path.join(process.cwd(), 'src/data/users.json');
        const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');

        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        let sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const guestId = `g_${Date.now()}`;

        const guestUser = {
            id: guestId,
            phone: 'Guest',
            name: `${randomColor} Guest`,
            points: 0,
            tier: 'Guest',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
            preferences: [],
            isGuest: true
        };

        users.push(guestUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        const sessionId = crypto.randomUUID();
        sessions[sessionId] = {
            userId: guestUser.id,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 1 day for guests
        };
        fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));

        const cookieStore = await cookies();
        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
            path: '/',
        });

        return NextResponse.json({ user: guestUser, success: true });
    } catch (error) {
        console.error('Guest login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

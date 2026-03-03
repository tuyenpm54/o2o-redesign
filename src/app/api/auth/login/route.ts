import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const usersPath = path.join(process.cwd(), 'src/data/users.json');
        const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');

        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        let sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

        let user = users.find((u: any) => u.phone === phone);

        if (!user) {
            // Create a new mock user if they don't exist
            user = {
                id: `u${Date.now()}`,
                phone,
                name: 'Khách hàng mới',
                points: 0,
                tier: 'Thành viên',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
                preferences: []
            };
            users.push(user);
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }

        const sessionId = crypto.randomUUID();
        sessions[sessionId] = {
            userId: user.id,
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));

        const cookieStore = await cookies();
        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return NextResponse.json({ user, success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const usersPath = path.join(process.cwd(), 'src/data/users.json');
        const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');

        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

        const session = sessions[sessionId];

        if (!session || session.expires < Date.now()) {
            return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
        }

        const user = users.find((u: any) => u.id === session.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

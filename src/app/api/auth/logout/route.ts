import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (sessionId) {
            const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');
            const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

            delete sessions[sessionId];
            fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));

            cookieStore.delete('session_id');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

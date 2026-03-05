import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, preferences } = await req.json();
        if (!userId || !preferences) {
            return NextResponse.json({ error: 'Missing userId or preferences' }, { status: 400 });
        }

        const db = await getDb();

        // Update preferences in SQLite
        const result = await db.run(
            'UPDATE users SET preferences = ? WHERE id = ?',
            [JSON.stringify(preferences), userId]
        );

        if (result.changes && result.changes > 0) {
            return NextResponse.json({ success: true, message: 'Preferences updated' });
        } else {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
    } catch (err) {
        console.error('Failed to update preferences:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

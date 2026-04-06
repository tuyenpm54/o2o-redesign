import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
    const db = await getDb();
    const rows = await db.all("SELECT id, name, phone, preferences_history FROM users WHERE name LIKE '%Tuyến Phạm%' OR phone = '0988071291'");
    return NextResponse.json({ rows });
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = await getDb();
    const row = await db.get('SELECT published_blocks FROM restaurant_display_configs WHERE res_id = ?', ['100']);
    return NextResponse.json({ config: row?.published_blocks });
}

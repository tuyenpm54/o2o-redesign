import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const tableid = url.searchParams.get('tableid');

        if (!tableid) {
            return NextResponse.json({ valid: false, error: 'Thiếu mã bàn' }, { status: 400 });
        }

        const db = await getDb();
        const table = await db.get('SELECT id FROM tables WHERE id = ?', [tableid]);

        if (table) {
            return NextResponse.json({ valid: true });
        } else {
            return NextResponse.json({ valid: false, error: 'Bàn không tồn tại trên hệ thống' }, { status: 404 });
        }
    } catch (e) {
        console.error("[Table Validation] Error:", e);
        return NextResponse.json({ valid: false, error: 'Lỗi hệ thống' }, { status: 500 });
    }
}

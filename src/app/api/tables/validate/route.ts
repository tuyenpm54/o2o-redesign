import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const tableid = url.searchParams.get('tableid');

        if (!tableid) {
            return NextResponse.json({ valid: false, error: 'Thiếu mã bàn' }, { status: 400 });
        }

        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ valid: false, error: 'Cấu hình cơ sở dữ liệu (DATABASE_URL) bị thiếu. Vui lòng kiểm tra môi trường deploy.' }, { status: 500 });
        }

        const db = await getDb();
        const table = await db.get('SELECT id FROM tables WHERE id = ?', [tableid]);

        if (table) {
            return NextResponse.json({ valid: true });
        } else {
            return NextResponse.json({ valid: false, error: `Bàn "${tableid}" không tồn tại trên hệ thống` }, { status: 404 });
        }
    } catch (e: any) {
        console.error("[Table Validation] Error:", e);
        return NextResponse.json({
            valid: false,
            error: 'Lỗi hệ thống khi kết nối cơ sở dữ liệu',
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        }, { status: 500 });
    }
}

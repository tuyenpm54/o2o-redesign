import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const p = await params;
    const resid = String(p.resid || p.resId);

    const searchParams = new URL(request.url).searchParams;
    const tableid = String(searchParams.get('tbl') || searchParams.get('tableid') || '');

    if (!resid || !tableid) {
        return NextResponse.json({ error: 'Mã nhà hàng và bàn là bắt buộc' }, { status: 400 });
    }

    try {
        const db = await getDb();
        
        // Fast KV lookup taking < 5ms
        const versionRow = await db.get(
            `SELECT value FROM kv_store WHERE key = ?`,
            [`table_version_${resid}_${tableid}`]
        );

        const version = versionRow ? Number(versionRow.value) : 0;

        return NextResponse.json({ version });
    } catch (error) {
        console.error('Sync API error:', error);
        return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
    }
}

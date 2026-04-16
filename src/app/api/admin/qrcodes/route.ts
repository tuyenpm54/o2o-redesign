import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || 'all';

    try {
        const db = await getDb();
        
        // Fetch QR codes and Left Join with tables to get the table name
        const query = `
            SELECT q.*, t.name as table_name
            FROM qr_codes q
            LEFT JOIN tables t ON q.tableid = t.id
            WHERE q.resid = ?
            ORDER BY q.created_at DESC
        `;
        const qrcodes = await db.all(query, [resid]);

        return ApiSuccess(qrcodes);
    } catch (error) {
        console.error('Error fetching OR codes:', error);
        return ApiError('Failed to fetch QR codes', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { resid, payment_model, tableid } = await request.json();
        
        if (!resid) {
            return ApiError('Missing restaurant ID', 400);
        }

        const id = 'qr_' + Math.random().toString(36).substr(2, 9);
        const db = await getDb();
        
        await db.run(
            `INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES (?, ?, ?, ?)`,
            [id, resid, tableid || null, payment_model || 'POST_PAY_TABLE']
        );

        return ApiSuccess({ id, resid, tableid, payment_model });
    } catch (error) {
        console.error('Error creating QR code:', error);
        return ApiError('Failed to create QR code', 500);
    }
}

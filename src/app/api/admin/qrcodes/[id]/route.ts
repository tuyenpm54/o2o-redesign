import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const { tableid, payment_model } = await request.json();
        
        const db = await getDb();
        
        // Update either tableid or payment_model
        await db.run(
            `UPDATE qr_codes SET tableid = ?, payment_model = ? WHERE id = ?`,
            [tableid || null, payment_model, id]
        );

        return ApiSuccess({ id, tableid, payment_model });
    } catch (error) {
        console.error('Error updating QR code:', error);
        return ApiError('Failed to update QR code', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const db = await getDb();
        
        await db.run(`DELETE FROM qr_codes WHERE id = ?`, [id]);

        return ApiSuccess({ deleted: true });
    } catch (error) {
        console.error('Error deleting QR code:', error);
        return ApiError('Failed to delete QR code', 500);
    }
}

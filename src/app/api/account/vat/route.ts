import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return ApiError('Not authenticated', 401);
        }

        const db = await getDb();

        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session || session.expires < Date.now()) {
            return ApiError('Session expired', 401);
        }

        const userId = session.user_id;

        const profiles = await db.all(`
            SELECT id, company_name as "companyName", tax_code as "taxCode", address, email, is_default as "isDefault"
            FROM user_vat_profiles
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        const mappedProfiles = profiles.map((p: any) => ({
            ...p,
            isDefault: p.isDefault === 1
        }));

        return ApiSuccess({ profiles: mappedProfiles });
    } catch (error) {
        console.error('Account VAT error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return ApiError('Not authenticated', 401);
        }

        const db = await getDb();
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session || session.expires < Date.now()) {
            return ApiError('Session expired', 401);
        }

        const userId = session.user_id;
        const body = await request.json();
        const { companyName, taxCode, address, email, isDefault } = body;

        if (!companyName || !taxCode || !address) {
            return ApiError('Missing required fields', 400);
        }

        if (isDefault) {
             // Reset all other profiles to not-default
             await db.run('UPDATE user_vat_profiles SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        const newId = `vat-${Date.now()}`;

        await db.run(`
            INSERT INTO user_vat_profiles (id, user_id, company_name, tax_code, address, email, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            newId,
            userId,
            companyName,
            taxCode,
            address,
            email || null,
            isDefault ? 1 : 0
        ]);

        return ApiSuccess({ profile: { id: newId, companyName, taxCode, address, email, isDefault } });
    } catch (error) {
        console.error('Account VAT POST error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

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

        // Check session in SQLite
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);

        if (!session || session.expires < Date.now()) {
            return ApiError('Session expired or invalid', 401);
        }

        // Get user from SQLite
        const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);

        if (!user) {
            return ApiError('User not found', 404);
        }

        // Parse preferences
        user.preferences = JSON.parse(user.preferences || '[]');
        user.isGuest = !!user.isGuest;

        return ApiSuccess({ user });
    } catch (error) {
        console.error('Me error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

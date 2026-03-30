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

        if (!session) {
            return ApiError('Session not found', 401);
        }

        // Auto-renew expired sessions — prevent losing table/order context
        if (session.expires < Date.now()) {
            const newExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
            await db.run('UPDATE sessions SET expires = ?, lastactive = ? WHERE id = ?', [newExpiry, Date.now(), sessionId]);
        }

        // ✅ Update lastActive to keep the session alive even on static pages
        await db.run('UPDATE sessions SET lastActive = ? WHERE id = ?', [Date.now(), sessionId]);

        // Get user from SQLite
        const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);

        if (!user) {
            return ApiError('User not found', 404);
        }

        // Update last_visit_at if last visit was > 4 hours ago (for tracking active users, but NOT incrementing visit_count which is strictly invoice-based)
        const lastVisitAt = user.last_visit_at ? new Date(user.last_visit_at).getTime() : 0;
        const now = Date.now();
        if (now - lastVisitAt > 4 * 60 * 60 * 1000) {
            await db.run(
                'UPDATE users SET last_visit_at = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id]
            );
        }

        // Parse preferences
        user.preferences = JSON.parse(user.preferences || '[]');
        user.isGuest = !!user.isGuest;
        user.visitCount = user.visit_count || 1;
        user.lastVisitAt = user.last_visit_at;

        return ApiSuccess({ user });
    } catch (error) {
        console.error('Me error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

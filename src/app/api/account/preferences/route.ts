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

        // 1. Get onboarding preferences from user profile
        const user = await db.get('SELECT preferences FROM users WHERE id = ?', [userId]);
        const onboardingPrefs: string[] = JSON.parse(user?.preferences || '[]');

        // 2. Get tags from historically ordered items
        // We look at the selections/name fields of order_items to extract patterns
        const orderedItems = await db.all(`
            SELECT name, img, selections, timestamp
            FROM order_items
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        `, [userId]);

        // Build frequency map from item names (tags are embedded in menu item metadata)
        // Since we don't store tags directly in order_items, we derive common patterns
        const frequentItems: Record<string, { count: number, img: string }> = {};
        for (const item of orderedItems) {
            const name = (item as any).name;
            const img = (item as any).img;
            if (name) {
                if (!frequentItems[name]) {
                    frequentItems[name] = { count: 1, img };
                } else {
                    frequentItems[name].count += 1;
                }
            }
        }

        // Sort by frequency and take top items
        const topItems = Object.entries(frequentItems)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)
            .map(([name, data]) => ({ name, count: data.count, img: data.img }));

        return ApiSuccess({
            onboardingPreferences: onboardingPrefs,
            frequentItems: topItems,
            totalOrderedItems: orderedItems.length,
        });
    } catch (error) {
        console.error('Account preferences error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

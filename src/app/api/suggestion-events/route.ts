import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { userId: session.user_id, resid: session.resid, tableid: session.tableid };
}

/**
 * POST /api/suggestion-events
 * Batch-insert suggestion funnel events (impression, click, add_to_cart, ordered)
 * 
 * Body: {
 *   resid: string,
 *   events: Array<{
 *     suggestion_type: 'onboarding' | 'personalized' | 'combo' | 'custom_bestsale' | 'custom_new' | 'flash_sale',
 *     item_id?: number,
 *     item_name?: string,
 *     event_type: 'impression' | 'click' | 'add_to_cart' | 'ordered'
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser();
    const userId = user?.userId || null;

    try {
        const { resid, events } = await request.json();
        if (!resid || !events || !Array.isArray(events) || events.length === 0) {
            return ApiError('Missing resid or events', 400);
        }

        const db = await getDb();

        // Get active table session for context
        let tableSessionId: string | null = null;
        if (user?.tableid) {
            const activeSession = await db.get(
                `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
                [resid, user.tableid]
            );
            tableSessionId = activeSession?.id || null;
        }

        // Batch insert all events
        const validTypes = ['onboarding', 'personalized', 'combo', 'custom_bestsale', 'custom_new', 'flash_sale'];
        const validEventTypes = ['impression', 'click', 'add_to_cart', 'ordered'];

        const valuesPlaceholder: string[] = [];
        const flatValues: any[] = [];

        for (const evt of events) {
            if (!validTypes.includes(evt.suggestion_type) || !validEventTypes.includes(evt.event_type)) {
                continue; // Skip invalid events
            }
            const id = `se_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            valuesPlaceholder.push('(?, ?, ?, ?, ?, ?, ?, ?)');
            flatValues.push(
                id, resid, userId, tableSessionId,
                evt.suggestion_type, evt.item_id || null, evt.item_name || null, evt.event_type
            );
        }

        if (valuesPlaceholder.length > 0) {
            await db.run(
                `INSERT INTO suggestion_events (id, resid, user_id, table_session_id, suggestion_type, item_id, item_name, event_type) VALUES ${valuesPlaceholder.join(', ')}`,
                flatValues
            );
        }

        return ApiSuccess({ inserted: valuesPlaceholder.length });
    } catch (e) {
        console.error('[Suggestion Events] Error:', e);
        return ApiError('Failed to record events', 500);
    }
}

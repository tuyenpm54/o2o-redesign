import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reside = searchParams.get('resid') || '100';

    try {
        const db = await getDb();
        const scenarios = await db.all('SELECT * FROM restaurant_scenarios WHERE res_id = ? ORDER BY time_threshold ASC', [reside]);

        // Ensure DETAILED_ORDER_AVATAR_LIST exists
        const hasAvatarConfig = scenarios.some(s => s.scenario_key === 'DETAILED_ORDER_AVATAR_LIST');
        if (!hasAvatarConfig) {
            await db.run(
                'INSERT INTO restaurant_scenarios (id, res_id, scenario_key, is_enabled, time_threshold) VALUES (?, ?, ?, ?, ?)',
                [crypto.randomUUID(), reside, 'DETAILED_ORDER_AVATAR_LIST', 1, 0]
            );
            // Re-fetch
            return GET(request);
        }

        // Map is_enabled back to boolean
        const formattedScenarios = scenarios.map((s: any) => ({
            ...s,
            is_enabled: !!s.is_enabled
        }));

        return ApiSuccess(formattedScenarios);
    } catch (error) {
        console.error('Fetch scenarios error:', error);
        return ApiError('Failed to fetch scenarios', 500);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, is_enabled, time_threshold } = body;

        if (!id) return ApiError('Missing scenario ID');

        const db = await getDb();
        await db.run(
            'UPDATE restaurant_scenarios SET is_enabled = ?, time_threshold = ? WHERE id = ?',
            [is_enabled ? 1 : 0, time_threshold, id]
        );

        return ApiSuccess({ id, is_enabled, time_threshold }, 'Scenario updated successfully');
    } catch (error) {
        console.error('Update scenario error:', error);
        return ApiError('Failed to update scenario', 500);
    }
}

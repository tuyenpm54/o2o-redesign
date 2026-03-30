import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reside = searchParams.get('resid') || '100';

    try {
        const db = await getDb();
        let config = await db.get('SELECT * FROM restaurant_display_configs WHERE res_id = ?', [reside]);

        if (!config) {
            // Initial default config if not exists
            const initialBlocks = [
                { id: 'b1', type: 'hero-banner', title: 'Banner Khuyến Mãi', config: {} },
                { id: 'b4', type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: { viewType: 'list' } }
            ];
            const id = crypto.randomUUID();
            await db.run(
                'INSERT INTO restaurant_display_configs (id, res_id, draft_blocks, published_blocks) VALUES (?, ?, ?, ?)',
                [id, reside, JSON.stringify(initialBlocks), JSON.stringify(initialBlocks)]
            );
            config = { id, res_id: reside, draft_blocks: JSON.stringify(initialBlocks), published_blocks: JSON.stringify(initialBlocks) };
        }

        return ApiSuccess({
            draft: JSON.parse(config.draft_blocks || '[]'),
            published: JSON.parse(config.published_blocks || '[]')
        });
    } catch (error) {
        console.error('Fetch display config error:', error);
        return ApiError('Failed to fetch display configuration', 500);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { res_id, blocks } = body;

        if (!res_id) return ApiError('Missing restaurant ID');
        if (!blocks) return ApiError('Missing blocks data');

        const db = await getDb();
        await db.run(
            'INSERT INTO restaurant_display_configs (id, res_id, draft_blocks) VALUES (?, ?, ?) ON CONFLICT (res_id) DO UPDATE SET draft_blocks = EXCLUDED.draft_blocks, updated_at = CURRENT_TIMESTAMP',
            [crypto.randomUUID(), res_id, JSON.stringify(blocks)]
        );

        return ApiSuccess({ res_id, blocks }, 'Draft configuration saved successfully');
    } catch (error) {
        console.error('Save display config error:', error);
        return ApiError('Failed to save display configuration', 500);
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { res_id } = body;

        if (!res_id) return ApiError('Missing restaurant ID');

        const db = await getDb();
        const config = await db.get('SELECT draft_blocks FROM restaurant_display_configs WHERE res_id = ?', [res_id]);
        
        if (!config) return ApiError('Configuration not found');

        await db.run(
            'UPDATE restaurant_display_configs SET published_blocks = draft_blocks, updated_at = CURRENT_TIMESTAMP WHERE res_id = ?',
            [res_id]
        );

        return ApiSuccess(null, 'Configuration published successfully');
    } catch (error) {
        console.error('Publish display config error:', error);
        return ApiError('Failed to publish configuration', 500);
    }
}

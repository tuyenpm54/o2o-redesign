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
                { id: 'b1', type: 'for-you', title: 'Món Bạn Từng Gọi', config: { isEnabled: true } },
                { id: 'b2', type: 'combo', title: 'Combo Tiết Kiệm', config: { isEnabled: true, limit: 10, itemIds: [701, 702, 703, 704, 705, 706] } },
                { id: 'b3', type: 'best-sale', title: 'Siêu Phẩm Bán Chạy', config: { isEnabled: true } },
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
        const { res_ids, blocks } = body;

        // Fallback backward compatibility for older payload style
        const targetIds = res_ids || (body.res_id ? [body.res_id] : []);

        if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) return ApiError('Missing restaurant IDs');
        if (!blocks) return ApiError('Missing blocks data');

        const db = await getDb();
        const promises = targetIds.map(resid => 
            db.run(
                'INSERT INTO restaurant_display_configs (id, res_id, draft_blocks) VALUES (?, ?, ?) ON CONFLICT (res_id) DO UPDATE SET draft_blocks = EXCLUDED.draft_blocks, updated_at = CURRENT_TIMESTAMP',
                [crypto.randomUUID(), resid, JSON.stringify(blocks)]
            )
        );
        await Promise.all(promises);

        return ApiSuccess({ res_ids: targetIds, blocks }, 'Draft configurations saved successfully');
    } catch (error) {
        console.error('Save display config error:', error);
        return ApiError('Failed to save display configuration', 500);
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { res_ids } = body;

        const targetIds = res_ids || (body.res_id ? [body.res_id] : []);
        if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) return ApiError('Missing restaurant IDs');

        const db = await getDb();
        
        const promises = targetIds.map(resid => 
            db.run(
                'UPDATE restaurant_display_configs SET published_blocks = draft_blocks, updated_at = CURRENT_TIMESTAMP WHERE res_id = ?',
                [resid]
            )
        );
        await Promise.all(promises);

        return ApiSuccess(null, 'Configurations published successfully');
    } catch (error) {
        console.error('Publish display config error:', error);
        return ApiError('Failed to publish configuration', 500);
    }
}

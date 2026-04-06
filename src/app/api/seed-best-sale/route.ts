import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const menuRes = await db.get("SELECT menu_data FROM restaurant_menus WHERE resid='100'");
        let menuData = menuRes.menu_data;
        if (typeof menuData === 'string') menuData = JSON.parse(menuData);
        
        const topItems = menuData.items.filter((item: any) => item.status === 'Best Seller' || (item.tags && item.tags.includes('Bán chạy'))).slice(0, 5);
        const itemIds = topItems.map((i: any) => i.id);

        const configRes = await db.get("SELECT draft_blocks, published_blocks FROM restaurant_display_configs WHERE res_id='100'");
        let draft = configRes?.draft_blocks; 
        let pub = configRes?.published_blocks;
        if (typeof draft === 'string') draft = JSON.parse(draft);
        if (typeof pub === 'string') pub = JSON.parse(pub);
        
        let updated = false;
        [draft, pub].forEach((blocks: any) => {
            if (blocks && Array.isArray(blocks)) {
                const b = blocks.find((x: any) => x.type === 'best-sale');
                if (b) {
                    if (!b.config) b.config = {};
                    b.config.itemIds = itemIds;
                    updated = true;
                }
            }
        });
        
        if (updated) {
            await db.run("UPDATE restaurant_display_configs SET draft_blocks = $1, published_blocks = $2 WHERE res_id='100'", [JSON.stringify(draft), JSON.stringify(pub)]);
            return NextResponse.json({ success: true, itemIds });
        } else {
            return NextResponse.json({ success: false, error: 'No best-sale block found' });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

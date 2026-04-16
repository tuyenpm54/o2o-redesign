import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_8KvaCS9bYsMF@ep-blue-recipe-a1i602ue-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let connectionString = DATABASE_URL;
if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
    connectionString += '&uselibpqcompat=true';
}

console.log('Using DB:', connectionString?.split('@')[1] || 'None');

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
});

async function seedComboData() {
    try {
        const resid = '100';
        console.log(`[Seed] Fetching existing configurations for restaurant ${resid}...`);
        
        const res = await pool.query('SELECT id, res_id, draft_blocks, published_blocks FROM restaurant_display_configs WHERE res_id = $1', [resid]);
        let draftBlocks = [];
        let publishedBlocks = [];
        
        if (res.rows.length > 0) {
            draftBlocks = JSON.parse(res.rows[0].draft_blocks || '[]');
            publishedBlocks = JSON.parse(res.rows[0].published_blocks || '[]');
            console.log(`[Seed] Found existing config with ${draftBlocks.length} draft blocks.`);
        } else {
            console.log(`[Seed] No existing config found, will create a new one.`);
        }

        // The exact combo item IDs matching your currently visible ones
        const comboItemIds = [701, 702, 703, 704, 705, 706];
        const comboConfig = { isEnabled: true, limit: 10, itemIds: comboItemIds };
        const comboBlock = { id: 'b2', type: 'combo', title: 'Combo Tiết Kiệm', config: comboConfig };

        function injectOrUpdateCombo(blocksList) {
            const index = blocksList.findIndex(b => b.type === 'combo');
            if (index === -1) {
                // Not found, insert before the menu-grid or at end
                blocksList.splice(1, 0, comboBlock); // Push to pos 1 safely
            } else {
                // Found, overwrite config
                blocksList[index].config = { ...blocksList[index].config, ...comboConfig };
            }
        }

        injectOrUpdateCombo(draftBlocks);
        injectOrUpdateCombo(publishedBlocks);

        if (res.rows.length === 0) {
            // Insert
            const uuid = require('crypto').randomUUID();
            await pool.query(
                'INSERT INTO restaurant_display_configs (id, res_id, draft_blocks, published_blocks) VALUES ($1, $2, $3, $4)',
                [uuid, resid, JSON.stringify(draftBlocks), JSON.stringify(publishedBlocks)]
            );
        } else {
            // Update
            await pool.query(
                'UPDATE restaurant_display_configs SET draft_blocks = $1, published_blocks = $2, updated_at = CURRENT_TIMESTAMP WHERE res_id = $3',
                [JSON.stringify(draftBlocks), JSON.stringify(publishedBlocks), resid]
            );
        }

        console.log(`[Seed] Successfully injected ${comboItemIds.length} combo items into the configuration for restaurant ${resid}.`);
        console.log(`[Seed] Admin panel and EU view will now dynamically load this data!`);
    } catch (e) {
        console.error('[Seed] Error:', e);
    } finally {
        await pool.end();
    }
}

seedComboData();

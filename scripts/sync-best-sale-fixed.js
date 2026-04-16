const fs = require('fs');
const pg = require('pg');
const { Pool } = pg;

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
let connectionString = dbUrlMatch ? dbUrlMatch[1].trim() : 'postgresql://neondb_owner:npg_8KvaCS9bYsMF@ep-blue-recipe-a1i602ue-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// strip quotes if any
connectionString = connectionString.replace(/^["'](.+(?=["']$))["']$/, '$1');

if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
    connectionString += '&uselibpqcompat=true';
}

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
});

async function run() {
    try {
        const menuRes = await pool.query("SELECT menu_data FROM restaurant_menus WHERE resid='100'");
        let menuData = menuRes.rows[0].menu_data;
        if (typeof menuData === 'string') menuData = JSON.parse(menuData);
        
        const topItems = menuData.items.filter(item => item.status === 'Best Seller' || (item.tags && item.tags.includes('Bán chạy'))).slice(0, 5);
        const itemIds = topItems.map(i => i.id);

        const configRes = await pool.query("SELECT draft_blocks, published_blocks FROM restaurant_display_configs WHERE res_id='100'");
        if (configRes.rows.length === 0) {
            console.log('No display configuration found for res_id=100');
            return;
        }

        let draft = configRes.rows[0].draft_blocks; 
        let pub = configRes.rows[0].published_blocks;
        if (typeof draft === 'string') draft = JSON.parse(draft);
        if (typeof pub === 'string') pub = JSON.parse(pub);
        
        let updated = false;
        [draft, pub].forEach(blocks => {
            if (blocks && Array.isArray(blocks)) {
                const b = blocks.find(x => x.type === 'best-sale');
                if (b) {
                    if (!b.config) b.config = {};
                    b.config.itemIds = itemIds;
                    updated = true;
                }
            }
        });
        
        if (updated) {
            await pool.query("UPDATE restaurant_display_configs SET draft_blocks = $1, published_blocks = $2 WHERE res_id='100'", [JSON.stringify(draft), JSON.stringify(pub)]);
            console.log('Seeded best-sale itemIds:', itemIds);
        } else {
            console.log('No best-sale block to seed');
        }
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();

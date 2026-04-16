import pg from 'pg';
const { Pool } = pg;
import path from 'path';
import fs from 'fs';

let connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_8KvaCS9bYsMF@ep-blue-recipe-a1i602ue-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
    connectionString += '&uselibpqcompat=true';
}

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
});

async function run() {
    try {
        const resid = '100';
        
        // Load local menus.json
        const menusPath = path.join(process.cwd(), 'src/data/menus.json');
        const localMenus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));
        const menu100 = localMenus[resid];
        
        if (!menu100) {
            console.error('Menu for 100 not found in local JSON');
            return;
        }

        // Check if row exists
        const res = await pool.query('SELECT resid FROM restaurant_menus WHERE resid = $1', [resid]);
        
        if (res.rows.length === 0) {
            await pool.query(
                'INSERT INTO restaurant_menus (resid, menu_data) VALUES ($1, $2)',
                [resid, JSON.stringify(menu100)]
            );
        } else {
            await pool.query(
                'UPDATE restaurant_menus SET menu_data = $1 WHERE resid = $2',
                [JSON.stringify(menu100), resid]
            );
        }
        
        console.log(`[Sync] Successfully synced menus.json (with ${menu100.items.length} items, including the combo items) to PostgreSQL restaurant_menus for restaurant 100!`);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

run();

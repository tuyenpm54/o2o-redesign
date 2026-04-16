import { getDb } from './src/lib/db';

async function run() {
    const db = await getDb();
    const row = await db.get('SELECT published_blocks FROM restaurant_display_configs WHERE res_id = ?', ['100']);
    console.log(row?.published_blocks || 'NO CONFIG');
    process.exit(0);
}
run();

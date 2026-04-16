import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { getDb } from '../src/lib/db';

async function run() {
    try {
        const db = await getDb();
        console.log('Seeding HQ and Admin demo accounts...');

        await db.run(`
            INSERT INTO users (id, phone, email, name, role, tier, isGuest)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, role=EXCLUDED.role, tier=EXCLUDED.tier
        `, ['u_hq_demo', '0988071291', 'hq@o2o.vn', 'Quản lý Chuỗi', 'CHAIN_MANAGER', 'ENTERPRISE', 0]);

        await db.run(`
            INSERT INTO users (id, phone, email, name, role, tier, isGuest)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, role=EXCLUDED.role, tier=EXCLUDED.tier
        `, ['u_admin_demo', '0981112222', 'admin@o2o.vn', 'Quản lý Nhà hàng', 'RESTAURANT_MANAGER', 'PRO_99', 0]);

        // Map Admin to resid=100
        await db.run(`
            INSERT INTO restaurants (id, name, chain_id)
            VALUES ('100', 'O2O Demo Restaurant', 'chain_1')
            ON CONFLICT(id) DO NOTHING
        `);

        await db.run(`
            INSERT INTO user_restaurants (id, user_id, restaurant_id)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO NOTHING
        `, ['map_100_admin', 'u_admin_demo', '100']);

        // Manage chain string
        await db.run(`
            UPDATE users SET managed_chain_id = 'chain_1' WHERE id = 'u_hq_demo'
        `);

        console.log('Done!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();

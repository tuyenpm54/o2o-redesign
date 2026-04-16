import { Pool } from 'pg';
import fs from 'fs';

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    try {
        const envText = fs.readFileSync('.env.local', 'utf-8');
        const envLine = envText.split('\n').find((l: string) => l.startsWith('DATABASE_URL='));
        if (envLine) {
            connectionString = envLine.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        }
    } catch(e) {}
}

async function seedAdminAccounts() {
    const pool = new Pool({ connectionString });

    try {
        console.log('Seeding admin test accounts...');

        await pool.query(`
            INSERT INTO users (id, phone, name, role, tier, "isGuest", avatar)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT(id) DO UPDATE SET
                phone = EXCLUDED.phone,
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                tier = EXCLUDED.tier
        `, [
            'u_admin_test',
            '0981112222',
            'Khoa Quản Lý',
            'RESTAURANT_MANAGER',
            'PRO_99',
            0,
            'https://api.dicebear.com/7.x/avataaars/svg?seed=0981112222'
        ]);

        await pool.query(`
            INSERT INTO users (id, phone, name, role, tier, "isGuest", avatar)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT(id) DO UPDATE SET
                phone = EXCLUDED.phone,
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                tier = EXCLUDED.tier
        `, [
            'u_hq_test',
            '0988889999',
            'Lê Giám Đốc (HQ)',
            'CHAIN_MANAGER',
            'ENTERPRISE',
            0,
            'https://api.dicebear.com/7.x/avataaars/svg?seed=0988889999'
        ]);

        console.log('Successfully seeded admin accounts:');
        console.log('- Quản lý cửa hàng (SĐT: 0981112222)');
        console.log('- Quản lý chuỗi (SĐT: 0988889999)');

    } catch (e) {
        console.error('Error seeding admin accounts:', e);
    } finally {
        await pool.end();
    }
}

seedAdminAccounts();

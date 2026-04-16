import { getDb } from '../src/lib/db';

async function seedAdminAccounts() {
    try {
        const db = await getDb();
        console.log('Seeding admin test accounts...');

        await db.run(`
            INSERT INTO users (id, phone, name, role, tier, isGuest, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?)
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

        await db.run(`
            INSERT INTO users (id, phone, name, role, tier, isGuest, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?)
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
        process.exit(0);
    }
}

seedAdminAccounts();

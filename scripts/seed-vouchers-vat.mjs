// Seed script: insert 2 VAT profiles + 5 vouchers for phone 0988071291
import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_8KvaCS9bYsMF@ep-blue-recipe-a1i602ue-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function run() {
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        // 1. Find user by phone
        const userRes = await pool.query('SELECT id FROM users WHERE phone = $1', ['0988071291']);
        if (userRes.rows.length === 0) {
            console.error('❌ Không tìm thấy user với SĐT 0988071291. Hãy đăng nhập trước!');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log(`✅ Found user: ${userId}`);

        // 2. Insert 2 VAT Profiles
        const vatProfiles = [
            {
                id: uid('vat'),
                user_id: userId,
                company_name: 'CÔNG TY TNHH CÔNG NGHỆ O2O VIỆT NAM',
                tax_code: '0101234567',
                address: 'Số 1 Đào Duy Anh, Phương Mai, Đống Đa, Hà Nội',
                email: 'accounting@o2o.vn',
                is_default: 1
            },
            {
                id: uid('vat'),
                user_id: userId,
                company_name: 'CÔNG TY CP ĐẦU TƯ LIÊN MINH THƯƠNG MẠI',
                tax_code: '0316543210',
                address: '123 Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM',
                email: 'invoice@lienminh.com.vn',
                is_default: 0
            }
        ];

        for (const v of vatProfiles) {
            await pool.query(`
                INSERT INTO user_vat_profiles (id, user_id, company_name, tax_code, address, email, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
            `, [v.id, v.user_id, v.company_name, v.tax_code, v.address, v.email, v.is_default]);
            console.log(`  ✅ VAT: ${v.company_name}`);
        }

        // 3. Insert 5 Vouchers with all statuses
        const vouchers = [
            {
                id: uid('vchr'),
                user_id: userId,
                code: 'O2OFRESH50K',
                title: 'Giảm 50.000đ cho đơn từ 200k',
                discount_type: 'fixed',
                discount_value: 50000,
                min_order: 200000,
                expiry: '2026-12-31',
                status: 'active',
                qr_value: 'O2OFRESH50K'
            },
            {
                id: uid('vchr'),
                user_id: userId,
                code: 'SALE20PCT',
                title: 'Giảm 20% tối đa 100k',
                discount_type: 'percent',
                discount_value: 20,
                min_order: 150000,
                expiry: '2026-08-30',
                status: 'active',
                qr_value: 'SALE20PCT'
            },
            {
                id: uid('vchr'),
                user_id: userId,
                code: 'BOGOFRY2026',
                title: 'Mua 1 tặng 1 Khoai tây chiên',
                discount_type: 'bogo',
                discount_value: 1,
                min_order: 50000,
                expiry: '2026-07-01',
                status: 'upcoming',
                qr_value: 'BOGOFRY2026'
            },
            {
                id: uid('vchr'),
                user_id: userId,
                code: 'XMAS10K',
                title: 'Giảm 10k tri ân Giáng Sinh',
                discount_type: 'fixed',
                discount_value: 10000,
                min_order: 0,
                expiry: '2024-12-31',
                status: 'expired',
                qr_value: 'XMAS10K'
            },
            {
                id: uid('vchr'),
                user_id: userId,
                code: 'BUFFET50PCT',
                title: 'Giảm 50% Buffet Sáng Cuối Tuần',
                discount_type: 'percent',
                discount_value: 50,
                min_order: 300000,
                expiry: '2026-01-31',
                status: 'used',
                qr_value: 'BUFFET50PCT'
            }
        ];

        for (const v of vouchers) {
            await pool.query(`
                INSERT INTO vouchers (id, user_id, code, title, discount_type, discount_value, min_order, expiry, status, qr_value)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING
            `, [v.id, v.user_id, v.code, v.title, v.discount_type, v.discount_value, v.min_order, v.expiry, v.status, v.qr_value]);
            console.log(`  ✅ Voucher [${v.status}]: ${v.title}`);
        }

        console.log('\n🎉 Seed complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();

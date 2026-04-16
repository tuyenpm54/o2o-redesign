/**
 * One-time seed: link system admin user to a restaurant
 * GET /api/admin/seed-admin-restaurant
 */
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();

        // Ensure restaurant 100 exists
        await db.run(
            `INSERT INTO restaurants (id, name, address)
             VALUES ('100', 'Nhà hàng O2O Demo', '123 Nguyễn Trãi, Q.1, TP.HCM')
             ON CONFLICT (id) DO NOTHING`
        );

        // Link SU1 (admin@o2o.vn) to restaurant 100 using user_id column
        await db.run(
            `INSERT INTO user_restaurants (id, user_id, restaurant_id)
             VALUES ('ur_SU1_100', 'SU1', '100')
             ON CONFLICT DO NOTHING`
        );

        // Also seed QR codes if missing
        await db.run(`INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES ('qr_a12', '100', 'A-12', 'POST_PAY_TABLE') ON CONFLICT (id) DO NOTHING`);
        await db.run(`INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES ('qr_t1', '100', 'T-1', 'POST_PAY_TABLE') ON CONFLICT (id) DO NOTHING`);
        await db.run(`INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES ('qr_counter', '100', 'COUNTER', 'PRE_PAY_COUNTER') ON CONFLICT (id) DO NOTHING`);
        await db.run(`INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES ('qr_vacant_1', '100', NULL, 'POST_PAY_TABLE') ON CONFLICT (id) DO NOTHING`);
        await db.run(`INSERT INTO qr_codes (id, resid, tableid, payment_model) VALUES ('qr_vacant_2', '100', NULL, 'PRE_PAY_TABLE') ON CONFLICT (id) DO NOTHING`);

        // Verify
        const restaurant = await db.get(`SELECT id, name FROM restaurants WHERE id = '100'`);
        const assignment = await db.get(`SELECT * FROM user_restaurants WHERE user_id = 'SU1'`);
        const qrCount = await db.get(`SELECT COUNT(*) as total FROM qr_codes WHERE resid = '100'`);

        return NextResponse.json({
            success: true,
            restaurant,
            assignment,
            qr_count: qrCount?.total || 0,
            message: 'Seed hoàn tất. admin@o2o.vn đã được liên kết với Nhà hàng O2O Demo (id=100).'
        });
    } catch (error: any) {
        console.error('Seed admin restaurant error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

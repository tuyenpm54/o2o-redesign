import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        
        // 1. Create or upsert mock restaurant
        const restaurantId = 'demo-mock';
        const restaurantName = 'O2O Thống Kê Mẫu';
        await db.run(
            `INSERT INTO restaurants (id, name, address) VALUES (?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
            [restaurantId, restaurantName, 'Dữ liệu ảo để trải nghiệm']
        );

        // 2. Create or upsert mock manager user
        const userId = 'u-mock-manager';
        const userPhone = '0989999999';
        await db.run(
            `INSERT INTO users (id, phone, name, role) VALUES (?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
            [userId, userPhone, 'Demo Manager Thống Kê', 'RESTAURANT_MANAGER']
        );

        // 3. Assign user to restaurant
        const assignId = `ur_${userId}_${restaurantId}`;
        await db.run(
            `INSERT INTO user_restaurants (id, user_id, restaurant_id) VALUES (?, ?, ?)
             ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
            [assignId, userId, restaurantId]
        );

        return ApiSuccess({
            message: `Tạo tài khoản Demo Manager thành công. Số điện thoại đăng nhập: ${userPhone}`,
            userPhone,
            restaurant: restaurantName
        });
    } catch (error: any) {
        console.error('Setup mock demo error:', error);
        return ApiError('Internal Server Error: ' + error.message, 500);
    }
}

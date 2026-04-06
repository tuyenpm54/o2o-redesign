/**
 * API: Seed restaurant assignments for admin users
 * POST /api/admin/seed-restaurant-assignment
 * Body: { phone: string, restaurantId: string }
 * 
 * Dùng để liên kết user (quản lý nhà hàng) với restaurant cụ thể.
 * Chỉ dành cho môi trường dev / setup ban đầu.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiSuccess, ApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { phone, restaurantId } = await request.json();

        if (!phone || !restaurantId) {
            return ApiError('phone and restaurantId are required', 400);
        }

        const db = await getDb();

        // Find user by phone
        const user = await db.get('SELECT id, name, phone FROM users WHERE phone = ?', [phone]);
        if (!user) {
            return ApiError(`User with phone ${phone} not found`, 404);
        }

        // Find restaurant
        const restaurant = await db.get('SELECT id, name FROM restaurants WHERE id = ?', [restaurantId]);
        if (!restaurant) {
            return ApiError(`Restaurant ${restaurantId} not found`, 404);
        }

        // Upsert the assignment
        const assignId = `ur_${user.id}_${restaurantId}`;
        await db.run(
            `INSERT INTO user_restaurants (id, user_id, restaurant_id) VALUES (?, ?, ?)
             ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
            [assignId, user.id, restaurantId]
        );

        return ApiSuccess({
            message: `Đã liên kết ${user.name} (${user.phone}) với nhà hàng "${restaurant.name}"`,
            user: { id: user.id, name: user.name, phone: user.phone },
            restaurant: { id: restaurant.id, name: restaurant.name },
        });
    } catch (error) {
        console.error('Seed restaurant assignment error:', error);
        return ApiError('Internal Server Error', 500);
    }
}

export async function GET() {
    try {
        const db = await getDb();
        const assignments = await db.all(
            `SELECT ur.id, u.name as user_name, u.phone, r.name as restaurant_name, r.id as restaurant_id, ur.assigned_at
             FROM user_restaurants ur
             JOIN users u ON u.id = ur.user_id
             JOIN restaurants r ON r.id = ur.restaurant_id
             ORDER BY ur.assigned_at DESC`
        );
        return ApiSuccess({ assignments });
    } catch (error) {
        return ApiError('Internal Server Error', 500);
    }
}

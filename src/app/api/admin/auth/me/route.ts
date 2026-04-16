import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('admin_session_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'No admin session' }, { status: 401 });
        }

        const db = await getDb();
        
        // Find session
        const sessionRow = await db.get('SELECT * FROM system_sessions WHERE id = ?', [sessionId]);

        if (!sessionRow || sessionRow.expires < Date.now()) {
            // Clear invalid session
            if (sessionRow) {
                await db.run('DELETE FROM system_sessions WHERE id = ?', [sessionId]);
            }
            cookieStore.delete('admin_session_id');
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        // Return user details
        const user = await db.get('SELECT * FROM system_users WHERE id = ?', [sessionRow.system_user_id]);

        if (!user) {
            cookieStore.delete('admin_session_id');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch assigned restaurant (via user_restaurants using system_user_id for admin)
        const assignedRestaurant = await db.get(
            `SELECT r.id as restaurant_id, r.name as restaurant_name
             FROM user_restaurants ur
             JOIN restaurants r ON r.id = ur.restaurant_id
             WHERE ur.system_user_id = ?
             LIMIT 1`,
            [user.id]
        );
        if (assignedRestaurant) {
            user.restaurant_id = assignedRestaurant.restaurant_id;
            user.restaurant_name = assignedRestaurant.restaurant_name;
        } else if (user.email === 'admin@o2o.vn') {
            // Auto-heal demo account: link to restaurant 100 if missing
            await db.run(
                `INSERT INTO user_restaurants (id, system_user_id, restaurant_id)
                 VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
                ['ur_SU1_100', user.id, '100']
            ).catch(console.error);
            user.restaurant_id = '100';
            user.restaurant_name = 'Nhà hàng O2O Demo';
        }

        // Update lastActive asynchronously
        db.run('UPDATE system_sessions SET lastActive = ? WHERE id = ?', [Date.now(), sessionId]).catch(console.error);

        return NextResponse.json({ user, success: true });
    } catch (error) {
        console.error('Admin Auth Check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

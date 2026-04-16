import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const identifier = body.identifier || body.phone;
        const name = body.name;

        if (!identifier) {
            return NextResponse.json({ error: 'Phone or Email is required' }, { status: 400 });
        }

        const db = await getDb();
        const cookieStore = await cookies();
        let existingSessionId = cookieStore.get('session_id')?.value;
        const deviceId = cookieStore.get('device_id')?.value;

        // Find existing verified user
        let user = await db.get('SELECT * FROM users WHERE phone = ? OR email = ?', [identifier, identifier]);
        const isEmail = identifier.includes('@');
        let userId: string;

        if (user) {
            // Scenario B: User exists -> Switch session to this user.
            userId = user.id;
            const updateProps = [name || user.name];
            let sql = 'UPDATE users SET name = COALESCE(NULLIF(?, \'\'), name), isGuest = 0';
            if (isEmail) {
                sql += ', email = ?';
                updateProps.push(identifier);
            } else {
                sql += ', phone = COALESCE(phone, ?)';
                updateProps.push(identifier);
            }
            sql += ' WHERE id = ?';
            updateProps.push(userId);
            await db.run(sql, updateProps);

        } else {
            // Scenario A: User is New -> Upgrade current device identity OR create new.
            let guestFound = false;
            
            if (deviceId) {
                const guestUser = await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [deviceId]);
                if (guestUser) {
                    // Upgrade guest in-place (keeps device_id the same)
                    userId = guestUser.id;
                    await db.run(
                        'UPDATE users SET phone = ?, email = ?, name = ?, tier = ?, isGuest = 0, avatar = ? WHERE id = ?',
                        [
                            isEmail ? null : identifier,
                            isEmail ? identifier : null,
                            name || 'Khách hàng mới',
                            'Thành viên',
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
                            userId
                        ]
                    );
                    guestFound = true;
                }
            }

            if (!guestFound) {
                // Failsafe: create new user
                userId = `u${Date.now()}`;
                await db.run(
                    'INSERT INTO users (id, phone, email, name, tier, role, avatar, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        userId,
                        isEmail ? null : identifier,
                        isEmail ? identifier : null,
                        name || 'Khách hàng mới',
                        'Thành viên',
                        'CUSTOMER',
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
                        0
                    ]
                );
            }
        }

        user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        const expires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

        if (existingSessionId) {
            // Switch current session to point to the authorized user
            await db.run(
                'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                [userId, expires, Date.now(), existingSessionId]
            );
        } else {
            // No existing session — create a new one
            existingSessionId = crypto.randomUUID();
            await db.run(
                'INSERT INTO sessions (id, user_id, expires, lastActive, created_at) VALUES (?, ?, ?, ?, ?)',
                [existingSessionId, userId, expires, Date.now(), Date.now()]
            );
            cookieStore.set('session_id', existingSessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60,
                path: '/',
            });
        }

        // Parse preferences for response
        if (user) {
            user.preferences = JSON.parse(user.preferences || '[]');
            user.isGuest = !!user.isGuest;
        }

        return NextResponse.json({ user, success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

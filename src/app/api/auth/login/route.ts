import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Allow passing 'identifier' or 'phone' for backward compatibility
        const body = await request.json();
        const identifier = body.identifier || body.phone;
        const name = body.name;

        if (!identifier) {
            return NextResponse.json({ error: 'Phone or Email is required' }, { status: 400 });
        }

        const db = await getDb();
        const cookieStore = await cookies();
        const existingSessionId = cookieStore.get('session_id')?.value;

        // Find or create the real user account by checking either phone or email
        let user = await db.get('SELECT * FROM users WHERE phone = ? OR email = ?', [identifier, identifier]);
        let userId: string;

        const isEmail = identifier.includes('@');
        
        if (user) {
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
            // New user: create account (reuse guest user id so cart data is preserved)
            const existingSession = existingSessionId
                ? await db.get('SELECT * FROM sessions WHERE id = ?', [existingSessionId])
                : null;
            const existingGuestUser = existingSession
                ? await db.get('SELECT * FROM users WHERE id = ? AND isGuest = 1', [existingSession.user_id])
                : null;

            if (existingGuestUser) {
                // Upgrade guest user in-place
                userId = existingGuestUser.id;
                await db.run(
                    'UPDATE users SET phone = COALESCE(phone, ?), email = COALESCE(email, ?), name = ?, isGuest = 0, avatar = ? WHERE id = ?',
                    [
                        isEmail ? null : identifier,
                        isEmail ? identifier : null,
                        name || 'Khách hàng mới',
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
                        userId
                    ]
                );
            } else {
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

        // ── Data Stitching: Migrate guest data to the real user ──
        // When the session was pointing to a different guest_id, all orders/cart/chat
        // placed by that guest must be transferred to the real userId.
        if (existingSessionId) {
            const currentSession = await db.get('SELECT user_id FROM sessions WHERE id = ?', [existingSessionId]);
            const oldGuestId = currentSession?.user_id;

            if (oldGuestId && oldGuestId !== userId) {
                console.log(`[Login] Data Stitching: migrating data from ${oldGuestId} → ${userId}`);
                await Promise.all([
                    db.run('UPDATE order_items SET user_id = ? WHERE user_id = ?', [userId, oldGuestId]),
                    db.run('UPDATE order_rounds SET user_id = ? WHERE user_id = ?', [userId, oldGuestId]),
                    db.run('UPDATE cart_items SET user_id = ? WHERE user_id = ?', [userId, oldGuestId]),
                    db.run("UPDATE chat_messages SET user_id = ? WHERE user_id = ? AND sender = 'user'", [userId, oldGuestId]),
                ]);
            }
        }

        user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        const expires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

        if (existingSessionId) {
            // ✅ Keep same session — just update user_id and extend expiry
            await db.run(
                'UPDATE sessions SET user_id = ?, expires = ?, lastActive = ? WHERE id = ?',
                [userId, expires, Date.now(), existingSessionId]
            );
        } else {
            // No existing session — create a new one
            const sessionId = crypto.randomUUID();
            await db.run(
                'INSERT INTO sessions (id, user_id, expires, lastActive) VALUES (?, ?, ?, ?)',
                [sessionId, userId, expires, Date.now()]
            );
            cookieStore.set('session_id', sessionId, {
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

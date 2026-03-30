import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const db = await getDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || session.expires < Date.now()) return null;

    return { userId: session.user_id, tableid: session.tableid, resid: session.resid };
}

export async function GET(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const resid = searchParams.get('resid') || auth.resid;
    const tableid = searchParams.get('tableid') || auth.tableid;

    try {
        const db = await getDb();
        const messages = await db.all(
            'SELECT * FROM chat_messages WHERE resid = ? AND tableid = ? ORDER BY timestamp DESC LIMIT 5',
            [resid, tableid]
        );

        return NextResponse.json(messages.reverse().map(m => ({
            id: m.id,
            userId: m.user_id,
            resid: m.resid,
            tableid: m.tableid,
            sender: m.sender,
            time: m.time,
            timestamp: m.timestamp,
            type: m.type,
            typeId: m.typeId,
            content: m.content
        })));
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}


async function addMessageToFile(userId: string, resid: string, tableid: string, msg: any) {
    try {
        const db = await getDb();
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, typeId, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [msgId, userId, resid, tableid, 'restaurant', msg.type, msg.typeId || null, msg.content, timeStr, Date.now()]
        );

        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resid}_${tableid}`, Date.now().toString()]
        );
    } catch (e) {
        console.error('[Chat] Failed to add message:', e);
    }
}

function scheduleStaffResponse(userId: string, resid: string, tableid: string, content: string, lang: string = 'vi', typeId?: string) {
    const isEn = lang === 'en';

    const sentText = isEn
        ? "Your request has been sent to the staff, please wait for confirmation."
        : "Yêu cầu của bạn đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận";

    setTimeout(() => {
        addMessageToFile(userId, resid, tableid, {
            type: 'WAITING',
            content: sentText
        });
    }, 1500);

    const receivedText = isEn
        ? "Staff have received your request and are processing it."
        : "Nhân viên đã nhận được yêu cầu của bạn và đang xử lý";

    const confirmDelay = 6000 + Math.floor(Math.random() * 3000);
    setTimeout(() => {
        addMessageToFile(userId, resid, tableid, {
            type: 'CONFIRMATION',
            content: receivedText
        });
    }, confirmDelay);
}


export async function POST(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { content, categoryId, typeId, type, lang, resid: bodyResid, tableid: bodyTableid } = await request.json();
        const resid = bodyResid || auth.resid;
        const tableid = bodyTableid || auth.tableid;

        const db = await getDb();
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const timestamp = Date.now();
        const msgId = `msg-${timestamp}`;
        const msgType = type || categoryId || 'OTHER';

        const newMsg = {
            id: msgId,
            userId: auth.userId,
            resid,
            tableid,
            sender: 'user',
            time: timeStr,
            timestamp: timestamp,
            type: msgType, // Tech ID for category
            typeId,
            content
        };

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, typeId, content, time, timestamp, status, status_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newMsg.id, newMsg.userId, newMsg.resid, newMsg.tableid, newMsg.sender, newMsg.type, newMsg.typeId, newMsg.content, newMsg.time, newMsg.timestamp, 'Đã gửi', timestamp]
        );

        if (msgType === 'SUPPORT' || msgType === 'OTHER') {
            // Disabled automatic mock staffing responses temporarily to allow true history tracking
            // scheduleStaffResponse(auth.userId, resid, tableid, content, lang || 'vi', typeId);
        }

        // Bump table sync version
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [`table_version_${resid}_${tableid}`, timestamp.toString()]
        );

        return NextResponse.json(newMsg);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

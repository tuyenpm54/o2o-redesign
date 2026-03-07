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

export async function GET() {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const messages = await db.all(
            'SELECT * FROM chat_messages WHERE resid = ? AND tableid = ? ORDER BY timestamp DESC LIMIT 5',
            [auth.resid, auth.tableid]
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


async function addMessageToFile(auth: { userId: string; tableid: string; resid: string }, msg: any) {
    try {
        const db = await getDb();
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, typeId, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [msgId, auth.userId, auth.resid, auth.tableid, 'restaurant', msg.type, msg.typeId || null, msg.content, timeStr, Date.now()]
        );
    } catch (e) {
        console.error('[Chat] Failed to add message:', e);
    }
}

function scheduleStaffResponse(auth: { userId: string; tableid: string; resid: string }, content: string, lang: string = 'vi', typeId?: string) {
    const isEn = lang === 'en';

    const sentText = isEn
        ? "Your request has been sent to the staff, please wait for confirmation."
        : "Yêu cầu của bạn đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận";

    setTimeout(() => {
        addMessageToFile(auth, {
            type: 'WAITING',
            content: sentText
        });
    }, 1500);

    const receivedText = isEn
        ? "Staff have received your request and are processing it."
        : "Nhân viên đã nhận được yêu cầu của bạn và đang xử lý";

    const confirmDelay = 6000 + Math.floor(Math.random() * 3000);
    setTimeout(() => {
        addMessageToFile(auth, {
            type: 'CONFIRMATION',
            content: receivedText
        });
    }, confirmDelay);
}


export async function POST(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { content, categoryId, typeId, lang } = await request.json();

        const db = await getDb();
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const timestamp = Date.now();
        const msgId = `msg-${timestamp}`;

        const newMsg = {
            id: msgId,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'user',
            time: timeStr,
            timestamp: timestamp,
            type: categoryId || 'OTHER', // Tech ID for category
            typeId,
            content
        };

        await db.run(
            'INSERT INTO chat_messages (id, user_id, resid, tableid, sender, type, typeId, content, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newMsg.id, newMsg.userId, newMsg.resid, newMsg.tableid, newMsg.sender, newMsg.type, newMsg.typeId, newMsg.content, newMsg.time, newMsg.timestamp]
        );

        if (categoryId === 'SUPPORT' || categoryId === 'OTHER') {
            scheduleStaffResponse(auth, content, lang || 'vi', typeId);
        }

        return NextResponse.json(newMsg);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

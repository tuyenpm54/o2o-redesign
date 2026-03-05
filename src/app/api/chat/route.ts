import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/db';

const messagesPath = path.join(process.cwd(), 'src/data/messages.json');

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
        if (!fs.existsSync(messagesPath)) return NextResponse.json([]);
        const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

        // Filter messages for this table and user
        const filtered = messages.filter((m: any) =>
            m.resid === auth.resid &&
            m.tableid === auth.tableid
        );

        // Limit to 5 most recent messages
        return NextResponse.json(filtered.slice(-5));
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}


function addMessageToFile(auth: { userId: string; tableid: string; resid: string }, msg: any) {
    try {
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        messages.push({
            id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'restaurant',
            time: timeStr,
            timestamp: Date.now(),
            ...msg
        });

        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
    } catch (e) {
        console.error('[Chat] Failed to add message:', e);
    }
}

function scheduleStaffResponse(auth: { userId: string; tableid: string; resid: string }, content: string, lang: string = 'vi', typeId?: string) {
    const isEn = lang === 'en';

    // 1. Message: Request sent to staff (1.5s delay)
    const sentText = isEn
        ? "Your request has been sent to the staff, please wait for confirmation."
        : "Yêu cầu của bạn đã được gửi tới nhân viên, vui lòng đợi nhân viên xác nhận";

    setTimeout(() => {
        addMessageToFile(auth, {
            type: 'WAITING',
            content: sentText
        });
    }, 1500);

    // 2. Message: Staff received/processing (5-8s delay)
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
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];

        const newMsg = {
            id: `msg-${Date.now()}`,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'user',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            type: categoryId || 'OTHER', // Tech ID for category
            typeId,
            content
        };

        messages.push(newMsg);
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

        // Schedule staff auto-response for support requests
        if (categoryId === 'SUPPORT' || categoryId === 'OTHER') {
            scheduleStaffResponse(auth, content, lang || 'vi', typeId);
        }

        return NextResponse.json(newMsg);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

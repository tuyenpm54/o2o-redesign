import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const messagesPath = path.join(process.cwd(), 'src/data/messages.json');
const sessionsPath = path.join(process.cwd(), 'src/data/sessions.json');

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    if (!fs.existsSync(sessionsPath)) return null;
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    const session = sessions[sessionId];
    if (!session || session.expires < Date.now()) return null;

    return { userId: session.userId, tableid: session.tableid, resid: session.resid };
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

        return NextResponse.json(filtered);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// Staff auto-response mappings for different request types
const STAFF_RESPONSES: Record<string, string> = {
    'Lấy thêm bát đũa': 'Nhân viên đã nhận yêu cầu lấy thêm bát đũa và đang chuẩn bị mang ra bàn bạn.',
    'Mang khăn giấy': 'Nhân viên đã nhận yêu cầu và đang mang khăn giấy ra bàn bạn.',
    'Dọn bàn': 'Nhân viên đã nhận yêu cầu dọn bàn và sẽ ra hỗ trợ ngay.',
    'Gọi thanh toán': 'Nhân viên đã xác nhận yêu cầu thanh toán và đang ra hỗ trợ bạn. Vui lòng chờ tại bàn nhé!',
};

function scheduleStaffResponse(auth: { userId: string; tableid: string; resid: string }, content: string) {
    const confirmText = STAFF_RESPONSES[content]
        || `Nhân viên đã nhận yêu cầu "${content}" và sẽ hỗ trợ bạn trong giây lát.`;

    // Schedule confirm response after 5-8 seconds
    const confirmDelay = 5000 + Math.floor(Math.random() * 3000);
    setTimeout(() => {
        try {
            const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];
            const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            messages.push({
                id: `msg-${Date.now()}-staff-confirm`,
                userId: auth.userId,
                resid: auth.resid,
                tableid: auth.tableid,
                sender: 'restaurant',
                time: timeStr,
                timestamp: Date.now(),
                type: 'Xác nhận hỗ trợ',
                content: confirmText
            });

            fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
            console.log(`[Chat] Staff confirmed: "${content}" for table ${auth.tableid}`);
        } catch (e) {
            console.error('[Chat] Failed to write staff confirm:', e);
        }
    }, confirmDelay);
}


export async function POST(request: Request) {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { content, type } = await request.json();
        const messages = fs.existsSync(messagesPath) ? JSON.parse(fs.readFileSync(messagesPath, 'utf8')) : [];

        const newMsg = {
            id: `msg-${Date.now()}`,
            userId: auth.userId,
            resid: auth.resid,
            tableid: auth.tableid,
            sender: 'user',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            type: type || 'Tin nhắn',
            content
        };

        messages.push(newMsg);
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

        // Schedule staff auto-response for support requests
        if (type === 'Yêu cầu hỗ trợ' || type === 'Yêu cầu khác') {
            scheduleStaffResponse(auth, content);
        }

        return NextResponse.json(newMsg);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}


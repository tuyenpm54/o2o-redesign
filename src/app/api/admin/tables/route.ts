import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const now = Date.now();
        
        // Fetch all independent data in parallel to reduce sequential query latency
        const [
            tables,
            activePresences,
            allOrderItems,
            allCartItems,
            allSupportRequests
        ] = await Promise.all([
            db.all('SELECT * FROM "tables" ORDER BY id ASC'),
            db.all(
                `SELECT p.tableid, s.user_id 
                 FROM session_presences p
                 JOIN sessions s ON p.session_id = s.id
                 WHERE s.expires > ? AND p.last_active > ?`,
                 [now, now - 600000] // 10 minutes presence window
            ),
            db.all(`
                SELECT o.* 
                FROM order_items o
                JOIN table_sessions t ON o.table_session_id = t.id
                WHERE t.status = 'ACTIVE'
            `),
            db.all('SELECT * FROM cart_items'),
            db.all("SELECT * FROM chat_messages WHERE type = 'SUPPORT' AND status != 'Xong' AND status != 'Hoàn thành'")
        ]);

        const enrichedTables = tables.map(table => {
            const tableIdLower = String(table.id).toLowerCase();
            
            // 1. Calculate people count based on unique users present
            const tablePresences = activePresences.filter((p: any) => String(p.tableid).toLowerCase() === tableIdLower);
            const uniqueUsers = new Set(tablePresences.map((p: any) => p.user_id));
            const peopleCount = uniqueUsers.size;

            // 2. Get all order items for this table, regardless of session presence
            const items = allOrderItems.filter((i: any) => String(i.tableid).toLowerCase() === tableIdLower);
            
            let status = 'Rảnh';
            let activeOrderCount = 0;

            if (peopleCount > 0) {
                status = 'Đang xem menu';
            }

            if (items.length > 0) {
                const hasActive = items.some((item: any) => item.status !== 'Đã phục vụ');
                if (hasActive) {
                    status = 'Đang phục vụ';
                    activeOrderCount = items.filter((item: any) => item.status !== 'Đã phục vụ').length;
                } else {
                    status = 'Chờ thanh toán'; // All items served
                }
            } else {
               // Fallback: Check if there's merely an unsubmitted cart
               const tableCarts = allCartItems.filter((i: any) => String(i.tableid).toLowerCase() === tableIdLower);
               if (tableCarts.length > 0) {
                   status = 'Đang xem menu';
               } else if (peopleCount === 0) {
                   status = 'Rảnh';
               }
            }

            const tableSupportRequests = allSupportRequests.filter((r: any) => String(r.tableid).toLowerCase() === tableIdLower);

            return {
                ...table,
                peopleCount,
                status,
                activeOrderCount,
                items,
                supportRequests: tableSupportRequests
            };
        });

        return NextResponse.json({ tables: enrichedTables });
    } catch (e) {
        console.error("[Admin Tables API] Failed to fetch tables:", e);
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { id, name } = await request.json();

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields: id, name' }, { status: 400 });
        }

        const db = await getDb();

        console.log(`[Admin Tables API] Checking existing table: ${id}`);
        const existing = await db.get('SELECT id FROM "tables" WHERE id = ?', [id]);
        if (existing) {
            return NextResponse.json({ error: 'Table ID already exists' }, { status: 409 });
        }

        console.log(`[Admin Tables API] Inserting table: ${id}, ${name}`);
        await db.run('INSERT INTO "tables" (id, name) VALUES (?, ?)', [id, name]);

        const newTable = await db.get('SELECT * FROM "tables" WHERE id = ?', [id]);

        return NextResponse.json({ success: true, table: newTable });
    } catch (e) {
        console.error("[Admin Tables API] Failed to add table:", e);
        return NextResponse.json({ error: 'Failed to add table' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
        }

        const db = await getDb();

        console.log(`[Admin Tables API] Deleting table: ${id}`);
        await db.run('DELETE FROM "tables" WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[Admin Tables API] Failed to delete table:", e);
        return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id') || '';
        const body = await request.json();
        const { action, messageId } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const tableSessions = await db.all('SELECT user_id, resid FROM sessions WHERE LOWER(tableid) = LOWER(?)', [id]);

        if (action === 'confirm_all') {
            // Find active session for this table
            const activeSession = await db.get(
                `SELECT id, resid FROM table_sessions WHERE LOWER(tableid) = LOWER(?) AND status = 'ACTIVE' ORDER BY started_at DESC LIMIT 1`,
                [id]
            );
            if (!activeSession) {
                return NextResponse.json({ error: 'No active session for this table' }, { status: 404 });
            }

            // Update order items: Chờ xác nhận → Đã xác nhận (scoped to session)
            await db.run(
                'UPDATE order_items SET status = ?, status_updated_at = ? WHERE status = ? AND table_session_id = ?',
                ['Đã xác nhận', Date.now(), 'Chờ xác nhận', activeSession.id]
            );

            // Update order rounds: Chờ xác nhận → Đã xác nhận (scoped to session)
            await db.run(
                `UPDATE order_rounds SET status = 'Đã xác nhận', confirmed_at = ? WHERE status = 'Chờ xác nhận' AND table_session_id = ?`,
                [Date.now(), activeSession.id]
            );

            // Bump table version
            await db.run(
                'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                [`table_version_${activeSession.resid}_${id}`, Date.now().toString()]
            );

            return NextResponse.json({ success: true });
        } else if (action === 'support_receive' || action === 'support_complete') {
            const statusTarget = action === 'support_receive' ? 'Đã nhận' : 'Hoàn thành';
            await db.run(
                "UPDATE chat_messages SET status = ?, status_updated_at = ? WHERE id = ?",
                [statusTarget, Date.now(), messageId]
            );

            // Get message info to bump version
            const msg = await db.get('SELECT resid, tableid FROM chat_messages WHERE id = ?', [messageId]);
            if (msg) {
                await db.run(
                    'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                    [`table_version_${msg.resid}_${msg.tableid}`, Date.now().toString()]
                );
            }

            return NextResponse.json({ success: true });
        } else if (action === 'payment') {
            const resids = Array.from(new Set(tableSessions.map(s => s.resid).filter(Boolean)));
            if (!resids.includes('100')) resids.push('100'); // Always ensure default resid is cleared

            for (const resid of resids) {
                // Change to non-destructive Invoice Completion
                const activeSession = await db.get(
                    `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
                    [resid, id]
                );

                if (activeSession) {
                    const invoiceId = `inv_${crypto.randomUUID()}`;
                    
                    // Sum up subtotal from order_items matching the session
                    const items = await db.all('SELECT price, qty FROM order_items WHERE table_session_id = ? AND status != ? AND status != ?', [activeSession.id, 'Huỷ', 'Hủy']);
                    const subtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.qty || 1)), 0);
                    const vat_amount = Math.round(subtotal * 0.08); // 8% Default VAT for Vietnam F&B
                    const final_total = subtotal + vat_amount;

                    // Generate Financial Invoice Document
                    await db.run(
                        `INSERT INTO invoices (id, table_session_id, resid, tableid, subtotal, vat_amount, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PAID')`,
                        [invoiceId, activeSession.id, resid, id, subtotal, vat_amount, final_total]
                    );

                    // Map all order_items under this session to the new invoice
                    await db.run(
                        'UPDATE order_items SET invoice_id = ? WHERE table_session_id = ?',
                        [invoiceId, activeSession.id]
                    );

                    // Mark session as PAID
                    await db.run(
                        `UPDATE table_sessions SET status = 'PAID', ended_at = ? WHERE id = ?`,
                        [Date.now(), activeSession.id]
                    );

                    // Grab VAT Request if any
                    const vatReq = await db.get('SELECT value FROM kv_store WHERE key = ?', [`vat_request_${resid}_${id}`]);
                    if (vatReq && vatReq.value) {
                        try {
                            const vatData = JSON.parse(vatReq.value);
                            const vatId = `vat_${crypto.randomUUID()}`;
                            await db.run(
                                `INSERT INTO invoice_vats (id, invoice_id, user_id, company_name, tax_code, company_address, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [vatId, invoiceId, vatData.userId, vatData.companyName, vatData.taxCode, vatData.address || vatData.companyAddress, vatData.email || null]
                            );
                            await db.run('DELETE FROM kv_store WHERE key = ?', [`vat_request_${resid}_${id}`]);
                        } catch (e) {
                            console.error("Failed to parse/insert VAT info", e);
                        }
                    }

                    // Grab Feedback Reviews if any
                    const reviews = await db.all(`SELECT key, value FROM kv_store WHERE key LIKE ?`, [`feedback_${resid}_${id}_%`]);
                    for (const rv of reviews) {
                        try {
                            const [,, , userId] = rv.key.split('_'); // feedback_resid_tableid_userid
                            const rvData = JSON.parse(rv.value);
                            const reviewId = `rev_${crypto.randomUUID()}`;
                            const commentText = `${rvData.comment || ''} ${rvData.tags ? '[' + rvData.tags.join(', ') + ']' : ''}`.trim();
                            
                            await db.run(
                                `INSERT INTO reviews (id, invoice_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
                                [reviewId, invoiceId, userId, rvData.rating, commentText]
                            );
                            await db.run('DELETE FROM kv_store WHERE key = ?', [rv.key]);
                        } catch (e) {
                            console.error("Failed to insert review", e);
                        }
                    }

                    // --- Background Worker: Update User Analytics ---
                    // Fire-and-forget logic to update user records based on the completed invoice
                    fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/worker/user-analytics`, {
                        method: 'POST',
                        body: JSON.stringify({ invoiceId: invoiceId })
                    }).catch(err => console.error("Worker failed", err));
                }

                // Clear any lingering cart items 
                await db.run('DELETE FROM cart_items WHERE resid = ? AND LOWER(tableid) = LOWER(?)', [resid, id]);
                await db.run('DELETE FROM session_presences WHERE resid = ? AND LOWER(tableid) = LOWER(?)', [resid, id]);

                // Clear checkout request and Set payment completed flag
                await db.run('DELETE FROM kv_store WHERE key = ?', [`checkout_requested_${resid}_${id}`]);
                // Case-insensitive deletion just in case
                await db.run('DELETE FROM kv_store WHERE LOWER(key) = LOWER(?)', [`checkout_requested_${resid}_${id}`]);

                await db.run('INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                    [`payment_completed_${resid}_${id}`, 'true']);
                    
                // Bump sync version
                await db.run(
                    'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                    [`table_version_${resid}_${id}`, Date.now().toString()]
                );
            }

            // Finally clear sessions for this table
            await db.run('DELETE FROM sessions WHERE LOWER(tableid) = LOWER(?)', [id]);

            return NextResponse.json({ success: true, message: 'Cleaned table and cleared flags' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        console.error("[Admin Tables API] Action failed:", e);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}

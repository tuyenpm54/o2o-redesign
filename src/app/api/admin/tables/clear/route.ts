import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ApiError, ApiSuccess } from '@/lib/api-response';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { resid, tableid } = await request.json();

        if (!resid || !tableid) {
            return ApiError('Missing resid or tableid', 400);
        }

        const db = await getDb();

        const activeSession = await db.get(
            `SELECT id FROM table_sessions WHERE resid = ? AND LOWER(tableid) = LOWER(?) AND status = 'ACTIVE'`,
            [resid, tableid]
        );

        const now = Date.now();

        if (activeSession) {
            // Filter UNPAID items only (no invoice_id yet)
            const unpaidItems = await db.all(
                'SELECT id, price, qty FROM order_items WHERE table_session_id = ? AND invoice_id IS NULL AND status != ? AND status != ?', 
                [activeSession.id, 'Huỷ', 'Hủy']
            );

            let targetInvoiceId = null;

            if (unpaidItems.length > 0) {
                const invoiceId = `inv_${crypto.randomUUID()}`;
                targetInvoiceId = invoiceId;
                
                // Sum up subtotal from unpaid order_items matching the session
                const subtotal = unpaidItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.qty || 1)), 0);
                const vat_amount = Math.round(subtotal * 0.08); // 8% Default VAT for Vietnam F&B
                const final_total = subtotal + vat_amount;

                // Generate Financial Invoice Document for remainder
                await db.run(
                    `INSERT INTO invoices (id, table_session_id, resid, tableid, subtotal, vat_amount, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PAID')`,
                    [invoiceId, activeSession.id, resid, tableid, subtotal, vat_amount, final_total]
                );

                // Map unpaid order_items under this session to the new invoice
                await db.run(
                    'UPDATE order_items SET invoice_id = ? WHERE table_session_id = ? AND invoice_id IS NULL',
                    [invoiceId, activeSession.id]
                );
            } else {
                // All items were prepaid. Try to find the latest invoice created for VAT/Reviews
                const lastInvoice = await db.get('SELECT id FROM invoices WHERE table_session_id = ? ORDER BY id DESC LIMIT 1', [activeSession.id]);
                targetInvoiceId = lastInvoice ? lastInvoice.id : `inv_dummy_${crypto.randomUUID()}`;
            }

            // Mark session as PAID (Completed)
            await db.run(
                `UPDATE table_sessions SET status = 'PAID', ended_at = ? WHERE id = ?`,
                [now, activeSession.id]
            );

            // Grab VAT Request if any
            const vatReq = await db.get('SELECT value FROM kv_store WHERE key = ?', [`vat_request_${resid}_${tableid}`]);
            if (vatReq && vatReq.value) {
                try {
                    const vatData = JSON.parse(vatReq.value);
                    const vatId = `vat_${crypto.randomUUID()}`;
                    await db.run(
                        `INSERT INTO invoice_vats (id, invoice_id, user_id, company_name, tax_code, company_address, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [vatId, targetInvoiceId, vatData.userId, vatData.companyName, vatData.taxCode, vatData.address || vatData.companyAddress, vatData.email || null]
                    );
                    await db.run('DELETE FROM kv_store WHERE key = ?', [`vat_request_${resid}_${tableid}`]);
                } catch (e) {
                    console.error("Failed to parse/insert VAT info", e);
                }
            }

            // Grab Feedback Reviews if any
            const reviews = await db.all(`SELECT key, value FROM kv_store WHERE key LIKE ?`, [`feedback_${resid}_${tableid}_%`]);
            for (const rv of reviews) {
                try {
                    const [,, , userId] = rv.key.split('_'); // feedback_resid_tableid_userid
                    const rvData = JSON.parse(rv.value);
                    const reviewId = `rev_${crypto.randomUUID()}`;
                    const commentText = `${rvData.comment || ''} ${rvData.tags ? '[' + rvData.tags.join(', ') + ']' : ''}`.trim();
                    
                    await db.run(
                        `INSERT INTO reviews (id, invoice_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
                        [reviewId, targetInvoiceId, userId, rvData.rating, commentText]
                    );
                    await db.run('DELETE FROM kv_store WHERE key = ?', [rv.key]);
                } catch (e) {
                    console.error("Failed to insert review", e);
                }
            }

            // --- Background Worker: Update User Analytics ---
            if (targetInvoiceId && !targetInvoiceId.startsWith('inv_dummy_')) {
                fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/worker/user-analytics`, {
                    method: 'POST',
                    body: JSON.stringify({ invoiceId: targetInvoiceId })
                }).catch(err => console.error("Worker failed", err));
            }
        }
        
        // 2. Clear transient draft items from this table
        await db.run('DELETE FROM cart_items WHERE resid = ? AND tableid = ?', [resid, tableid]);
        // DO NOT delete chat_messages here to preserve session support history, or delete if desired. Let's delete chat so UI is fresh.
        await db.run("DELETE FROM chat_messages WHERE resid = ? AND tableid = ? AND type != 'SUPPORT'", [resid, tableid]);
        
        // 3. Xóa các user đang active ở bàn này
        await db.run('DELETE FROM session_presences WHERE resid = ? AND tableid = ?', [resid, tableid]);

        // Đánh dấu cờ Bàn Đã Đóng vào trong KV Store
        const key = `table_status_${resid}_${tableid}`;
        await db.run(
            'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [key, Date.now().toString()]
        );

        return ApiSuccess({ message: `Table ${tableid} cleared completely and marked as closed.` });
    } catch (e) {
        console.error("[API clear-table] Failed to clear table data:", e);
        return ApiError('Internal Server Error', 500);
    }
}

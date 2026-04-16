import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
    });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log("Seeding mock data for Real-time Dashboard...");

  const now = Date.now();
  const resId = '1';

  // Helper functions
  const genId = (prefix: string) => `${prefix}_${now}_${Math.random().toString(36).substr(2, 5)}`;
  const minutesAgo = (min: number) => now - (min * 60 * 1000);

  try {
    // 1. CLEAR EXISTING TODAY'S DATA for clean slate
    console.log("Cleaning up old mock data...");
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    // Clean up our specific mock data from today
    await pool.query(`DELETE FROM suggestion_events WHERE resid = $1 AND created_at >= to_timestamp($2 / 1000.0)`, [resId, todayMs]);
    await pool.query(`DELETE FROM feedback WHERE resid = $1 AND created_at >= to_timestamp($2 / 1000.0)`, [resId, todayMs]);
    await pool.query(`DELETE FROM order_items WHERE resid = $1 AND timestamp >= $2`, [resId, todayMs]);
    await pool.query(`DELETE FROM order_rounds WHERE resid = $1 AND created_at >= $2`, [resId, todayMs]);
    
    // Warning: this removes ALL invoices and sessions for this restaurant today
    await pool.query(`DELETE FROM invoices WHERE resid = $1 AND created_at >= to_timestamp($2 / 1000.0)`, [resId, todayMs]);
    await pool.query(`DELETE FROM session_presences WHERE resid = $1 AND last_active >= $2`, [resId, todayMs]);
    await pool.query(`DELETE FROM table_sessions WHERE resid = $1 AND started_at >= $2`, [resId, todayMs]);

    // 2. ENSURE PHYSICAL TABLES EXIST (to prevent 300% occupancy bugs)
    console.log("Ensuring physical tables exist...");
    const activeTables = ['T-1', 'T-2', 'T-3', 'A-1', 'A-2', 'B-1', 'B-2', 'V-VIP'];
    for (const tid of activeTables) {
        await pool.query(`
            INSERT INTO tables (id, name) VALUES ($1, $2)
            ON CONFLICT (id) DO NOTHING
        `, [tid, tid]);
    }

    // 3. CREATE TABLE SESSIONS (Active Occupancy & History for AOV)
    console.log("Seeding table sessions...");
    const activeSessionIds: string[] = [];

    for (let i = 0; i < activeTables.length; i++) {
        const sessionId = genId('ts');
        
        // Some started 1 hour ago, some 15 mins ago
        const startedAt = minutesAgo(Math.floor(Math.random() * 60) + 10);
        
        const insertRes = await pool.query(`
            INSERT INTO table_sessions (id, resid, tableid, status, started_at) 
            VALUES ($1, $2, $3, 'ACTIVE', $4)
            RETURNING id
        `, [sessionId, resId, activeTables[i], startedAt]);
        
        const actualSessionId = insertRes.rows[0].id;
        activeSessionIds.push(actualSessionId);

        // Insert some presences (guest count)
        const guestCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 guests
        for (let j = 0; j < guestCount; j++) {
            const browserSessionId = genId('browser_sess');
            
            // 1. Create a base browser session
            await pool.query(`
                INSERT INTO sessions (id, resid, tableid) 
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING
            `, [browserSessionId, resId, activeTables[i]]);

            // 2. Add presence
            await pool.query(`
                INSERT INTO session_presences (session_id, resid, tableid, last_active)
                VALUES ($1, $2, $3, $4)
            `, [browserSessionId, resId, activeTables[i], now]);
        }
    }

    // CREATE SOME PAID SESSIONS FOR AOV & TURN-AROUND TIME
    console.log("Seeding paid invoices for AOV...");
    for (let i = 0; i < 15; i++) {
        const paidSessionId = genId('ts_paid');
        const startedAt = minutesAgo(Math.floor(Math.random() * 300) + 60); // 1-6 hours ago
        const endedAt = startedAt + (Math.floor(Math.random() * 45 + 30) * 60 * 1000); // lasted 30-75 mins
        const totalAmount = Math.floor(Math.random() * 500000) + 100000; // 100k - 600k
        
        // Table Session
        await pool.query(`
            INSERT INTO table_sessions (id, resid, tableid, status, started_at, ended_at, total) 
            VALUES ($1, $2, $3, 'PAID', $4, $5, $6)
        `, [paidSessionId, resId, 'T-' + (i%5), startedAt, endedAt, totalAmount]);

        // Invoice
        await pool.query(`
            INSERT INTO invoices (id, table_session_id, resid, tableid, status, total, created_at)
            VALUES ($1, $2, $3, 'T_mock', 'PAID', $4, to_timestamp($5 / 1000.0))
        `, [genId('inv'), paidSessionId, resId, totalAmount, endedAt]);
    }

    // 3. CREATE ORDER ITEMS (For SLA & E2E calculation)
    console.log("Seeding order items...");
    
    const items = [
        { id: 1, name: 'Phở Bò', price: 55000 },
        { id: 2, name: 'Bún Chả', price: 60000 },
        { id: 3, name: 'Cơm Tấm', price: 65000 },
        { id: 4, name: 'Cà phê đá', price: 25000 },
        { id: 5, name: 'Trà đá', price: 5000 },
    ];

    const suggestionSources = ['organic', 'onboarding', 'personalized', 'combo', 'custom_bestsale', 'flash_sale', 'organic'];

    for (const sessionId of activeSessionIds) {
        // Create 2-3 rounds per session
        const roundsCount = Math.floor(Math.random() * 2) + 1;
        
        for (let r = 0; r < roundsCount; r++) {
            const roundId = genId('round');
            const roundStartedAt = minutesAgo(30 - (r * 10)); // e.g. 30 mins ago, 20 mins ago
            
            await pool.query(`
                INSERT INTO order_rounds (id, table_session_id, user_id, resid, tableid, status, created_at)
                VALUES ($1, $2, 'mock_user', $3, 'mock_table', 'Chờ xác nhận', $4)
            `, [roundId, sessionId, resId, roundStartedAt]);

            // Add 2-5 items per round
            const itemCount = Math.floor(Math.random() * 4) + 2;
            for (let i = 0; i < itemCount; i++) {
                const itemDef = items[Math.floor(Math.random() * items.length)];
                const orderId = genId('o');
                const source = suggestionSources[Math.floor(Math.random() * suggestionSources.length)];
                const timestamp = roundStartedAt;
                
                await pool.query(`
                    INSERT INTO order_items (id, user_id, resid, tableid, item_id, name, price, qty, status, timestamp, status_updated_at, table_session_id, order_round_id, suggestion_source, confirmed_at, cooking_at, ready_at, served_at)
                    VALUES ($1, 'mock_user', $2, 'mock_table', $3, $4, $5, 1, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [orderId, resId, itemDef.id, itemDef.name, itemDef.price, 'Chờ xác nhận', timestamp, timestamp, sessionId, roundId, source, timestamp, timestamp, timestamp, timestamp]);
                
                // 30% might have a lag time -> violation, rest normal
                const isViolation = Math.random() < 0.3;
                if (!isViolation) {
                    // Update through all stages quickly
                    await pool.query(`
                        UPDATE order_items 
                        SET status = 'Đã phục vụ',
                            status_updated_at = $1,
                            confirmed_at = $2,
                            cooking_at = $3,
                            ready_at = $4,
                            served_at = $5
                        WHERE id = $6
                    `, [timestamp + 600000, timestamp + 60000, timestamp + 120000, timestamp + 500000, timestamp + 600000, orderId]);
                } else {
                    // It stays pending, confirmed, or cooking for a very long time
                    const stopStage = Math.floor(Math.random() * 3);
                    if (stopStage === 0) {
                        // Just Pending
                        await pool.query(`UPDATE order_items SET status = 'Chờ xác nhận' WHERE id = $1`, [orderId]);
                    } else if (stopStage === 1) {
                        // Stuck at cooking
                        await pool.query(`
                            UPDATE order_items 
                            SET status = 'Đang chế biến',
                                status_updated_at = $1,
                                confirmed_at = $2,
                                cooking_at = $3
                            WHERE id = $4
                        `, [timestamp + 20000, timestamp + 5000, timestamp + 20000, orderId]);
                    }
                }
            }
        }
    }

    // Create a very bad SLA order to trigger the worst case (e.g. 😡 45 mins)
    await pool.query(`
        INSERT INTO order_items (id, user_id, resid, tableid, item_id, name, price, qty, status, timestamp, status_updated_at, table_session_id, order_round_id)
        VALUES ($1, 'mock_user', $2, 'mock_table', 99, 'Món lâu năm', 100000, 1, 'Đã phục vụ', $3, $4, $5, 'mock_round')
    `, [genId('o_worst'), resId, minutesAgo(50), minutesAgo(5), activeSessionIds[0]]);


    // 4. CREATE FEEDBACK (For 2-hour rating calculation)
    console.log("Seeding feedback...");
    
    // 8 smiles, 2 frowns
    for (let i = 0; i < 8; i++) {
        const timestamp = minutesAgo(Math.floor(Math.random() * 120));
        const rating = Math.random() > 0.3 ? 'smile' : 'frown';
        const tags = rating === 'smile' ? '["Món ăn ngon", "Phục vụ nhanh"]' : '["Món ra chậm"]';
        
        await pool.query(`
            INSERT INTO feedback (id, invoice_id, table_session_id, user_id, resid, tableid, rating, tags, created_at)
            VALUES ($1, 'mock_inv', $2, 'mock_user', $3, 'mock_table', $4, $5, to_timestamp($6 / 1000.0))
        `, [genId('fb'), activeSessionIds[0], resId, rating, tags, timestamp]);
    }

    // 5. SEED SUGGESTION EVENTS (For Funnel Report)
    console.log("Seeding suggestion events funnel...");
    const funnelTypes = ['onboarding', 'personalized', 'combo', 'custom_bestsale', 'flash_sale'];
    
    for (const type of funnelTypes) {
        // Base impressions: 1000 - 3000
        const impressions = Math.floor(Math.random() * 2000) + 1000;
        const clicks = Math.floor(impressions * (Math.random() * 0.2 + 0.1)); // 10-30% click
        const carts = Math.floor(clicks * (Math.random() * 0.4 + 0.2)); // 20-60% add to cart
        const orders = Math.floor(carts * (Math.random() * 0.7 + 0.3)); // 30-100% ordered

        const insertEvents = async (evtType: string, count: number) => {
            const values = [];
            for (let i = 0; i < count; i++) {
                // Batch insert 100 at a time
                if (values.length >= 100) {
                    await pool.query(`
                        INSERT INTO suggestion_events (id, resid, suggestion_type, event_type, created_at)
                        VALUES ${values.map((_, i) => `($${i*5 + 1}, $${i*5 + 2}, $${i*5 + 3}, $${i*5 + 4}, to_timestamp($${i*5 + 5} / 1000.0))`).join(', ')}
                    `, values.flatMap(v => v));
                    values.length = 0;
                }
                values.push([genId('se'), resId, type, evtType, minutesAgo(Math.floor(Math.random() * 60 * 24))]);
            }
            if (values.length > 0) {
                 await pool.query(`
                        INSERT INTO suggestion_events (id, resid, suggestion_type, event_type, created_at)
                        VALUES ${values.map((_, i) => `($${i*5 + 1}, $${i*5 + 2}, $${i*5 + 3}, $${i*5 + 4}, to_timestamp($${i*5 + 5} / 1000.0))`).join(', ')}
                    `, values.flatMap(v => v));
            }
        };

        // For speed, just insert representative counts maybe? 
        // Or actually insert all of them so SQL COUNT() works perfectly.
        // It might take a few seconds, let's divide counts by 10 to speed up but keep ratios.
        await insertEvents('impression', Math.floor(impressions/10));
        await insertEvents('click', Math.floor(clicks/10));
        await insertEvents('add_to_cart', Math.floor(carts/10));
        await insertEvents('ordered', Math.floor(orders/10));
    }

    console.log("Mock data seeding complete!");

  } catch (error) {
    console.error("Error seeding mock data:", error);
  } finally {
    await pool.end();
  }
}

main();

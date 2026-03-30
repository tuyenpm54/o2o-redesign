import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { invoiceId } = await request.json();
        if (!invoiceId) {
            return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
        }

        const db = await getDb();

        // Ensure invoice exists
        const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Get all items in this invoice
        const items = await db.all('SELECT user_id, name, price, qty, selections FROM order_items WHERE invoice_id = ? AND status != ? AND status != ?', [invoiceId, 'Hủy', 'Huỷ']);
        
        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No valid items found to process analytics' });
        }

        // Group items by user
        const userStats: Record<string, { totalSpent: number, tags: string[] }> = {};
        
        items.forEach((item: any) => {
            if (!item.user_id) return;
            
            if (!userStats[item.user_id]) {
                userStats[item.user_id] = { totalSpent: 0, tags: [] };
            }

            const cost = (item.price || 0) * (item.qty || 1);
            userStats[item.user_id].totalSpent += cost;

            // Simple Tag extraction representing user preferences
            const lowerName = (item.name || '').toLowerCase();
            const lowerSelections = (item.selections || '').toLowerCase();
            const combinedText = lowerName + ' ' + lowerSelections;

            if (combinedText.includes('cay')) userStats[item.user_id].tags.push('Cay');
            if (combinedText.includes('không cay')) userStats[item.user_id].tags.push('Không cay');
            if (combinedText.includes('ngọt')) userStats[item.user_id].tags.push('Ngọt');
            if (combinedText.includes('ít đá') || combinedText.includes('không đá')) userStats[item.user_id].tags.push('Ít đá');
            if (combinedText.includes('lẩu')) userStats[item.user_id].tags.push('Lẩu');
            if (combinedText.includes('nướng')) userStats[item.user_id].tags.push('Nướng');
            if (combinedText.includes('trà')) userStats[item.user_id].tags.push('Trà');
            
            // Push the main word of the item as a preference if they ordered it
            if (item.name) {
                const words = item.name.split(' ').slice(0, 2).join(' '); // first two words e.g. "Combo Lẩu" or "Trà Đào"
                userStats[item.user_id].tags.push(words);
            }
        });

        // Loop over each involved user and update their stats
        for (const [userId, stats] of Object.entries(userStats)) {
            const user = await db.get('SELECT points, visit_count, preferences FROM users WHERE id = ?', [userId]);
            if (user) {
                // Visit count increments by 1 per invoice (since they shared the meal)
                const newVisitCount = (user.visit_count || 1) + 1;
                
                // 1 Point = every 10,000 VND spent by this specific user
                const pointsEarned = Math.floor(stats.totalSpent / 10000);
                const newPoints = (user.points || 0) + pointsEarned;
                
                // Merge preferences 
                let existingPrefs: string[] = [];
                try { existingPrefs = JSON.parse(user.preferences || '[]'); } catch (e) {}
                
                // Add new tags, ensuring unique elements
                const newPrefs = Array.from(new Set([...existingPrefs, ...stats.tags])).slice(0, 20); // keep a max of 20 top tags

                await db.run(
                    'UPDATE users SET visit_count = ?, points = ?, preferences = ? WHERE id = ?',
                    [newVisitCount, newPoints, JSON.stringify(newPrefs), userId]
                );
            }
        }

        return NextResponse.json({ success: true, processedUsers: Object.keys(userStats).length });

    } catch (e) {
        console.error('[Worker UserAnalytics] Failed:', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const p = await params;
    const resid = p.resid || p.resId;

    try {
        const restaurantsPath = path.join(process.cwd(), 'src/data/restaurants.json');
        const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
        const restaurant = restaurants.find((r: any) => String(r.id) === String(resid));

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found', debug: { resid, p } }, { status: 404 });
        }

        // Fetch menu from DB
        const { getDb } = await import('@/lib/db');
        const db = await getDb();
        const menuRow = await db.get('SELECT menu_data FROM restaurant_menus WHERE resid = ?', [resid]);

        let menu = { categories: [], items: [], preferences: [] };
        if (menuRow && menuRow.menu_data) {
            menu = JSON.parse(menuRow.menu_data);
        } else {
            // Fallback to local menus.json if DB is empty
            const menusPath = path.join(process.cwd(), 'src/data/menus.json');
            const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));
            menu = menus[resid] || menu;
        }

        return NextResponse.json({
            ...restaurant,
            menu
        });
    } catch (error) {
        console.error("Fetch restaurant error:", error);
        return NextResponse.json({ error: 'Failed to fetch restaurant data' }, { status: 500 });
    }
}

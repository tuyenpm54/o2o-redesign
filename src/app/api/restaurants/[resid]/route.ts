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
        const menusPath = path.join(process.cwd(), 'src/data/menus.json');

        const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
        const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));

        const restaurant = restaurants.find((r: any) => String(r.id) === String(resid));
        const menu = menus[resid];

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found', debug: { resid, p } }, { status: 404 });
        }

        return NextResponse.json({
            ...restaurant,
            menu: menu || { categories: [], items: [], preferences: [] }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch restaurant data' }, { status: 500 });
    }
}

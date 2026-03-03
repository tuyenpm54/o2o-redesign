import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const restaurantsPath = path.join(process.cwd(), 'src/data/restaurants.json');
        const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
        return NextResponse.json(restaurants);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

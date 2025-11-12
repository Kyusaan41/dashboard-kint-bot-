// src/app/api/success/all/route.ts

import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        const res = await fetch(`${BOT_API_URL}/success/all`, { cache: 'no-store' }); 
        if (!res.ok) {
            return NextResponse.json({}, { status: 200 });
        }
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Erreur API /api/success/all:", error);
        return NextResponse.json({}, { status: 200 });
    }
}

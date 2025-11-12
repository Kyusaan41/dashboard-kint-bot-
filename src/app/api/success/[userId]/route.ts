import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }
        
        const res = await fetch(`${BOT_API_URL}/success/${userId}`, { cache: 'no-store' });
        if (!res.ok) {
            return NextResponse.json({ succes: [] }, { status: 200 });
        }
        
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ succes: [] }, { status: 200 });
    }
}
import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        const res = await fetch(`${BOT_API_URL}/success/${userId}`);
        if (!res.ok) {
            throw new Error(`Erreur du bot API: ${res.statusText}`);
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/success/[userId]:", error);
        return NextResponse.json({ succes: [] }, { status: 500 });
    }
}
import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }
        
        const res = await fetch(`${BOT_API_URL}/success/${userId}`);
        if (!res.ok) throw new Error('Erreur API Bot');
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ succes: [] }, { status: 500 });
    }
}
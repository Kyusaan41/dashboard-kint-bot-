import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        const res = await fetch(`${BOT_API_URL}/messages/${userId}`);
        if (!res.ok) throw new Error('Erreur API Bot');

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ messagesLast7Days: [] }, { status: 500 });
    }
}
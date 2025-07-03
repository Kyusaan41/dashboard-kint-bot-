import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    const { userId } = params;

    if (!userId) {
        return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/shop/kshield-status/${userId}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Erreur inconnue du bot' }));
            console.error(`Erreur de l'API du bot pour kshield-status :`, errorData);
            return NextResponse.json({ error: "Impossible de récupérer le statut du KShield depuis le bot." }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/kshield-status/[userId]:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On utilise la signature simplifiée avec 'any' qui est la seule qui passe le build
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        // On appelle la route du bot correspondante
        const res = await fetch(`${BOT_API_URL}/shop/kshield-status/${userId}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error || "Impossible de récupérer le statut du KShield." }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/kshield-status/[userId]:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
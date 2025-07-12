import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // ▼▼▼ MODIFICATION ICI ▼▼▼
        // On récupère le corps de la requête pour obtenir le type
        const { type } = await request.json();

        const res = await fetch(`${BOT_API_URL}/currency/claim/${session.user.id}`, {
            method: 'POST',
            // On envoie le type au bot pour qu'il sache quel minuteur utiliser
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: type }),
        });

        const data = await res.json();

        // On transmet la réponse du bot (succès ou erreur) au client
        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("Erreur API /api/claim-reward:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
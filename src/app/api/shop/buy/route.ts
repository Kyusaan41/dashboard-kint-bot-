import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { items } = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Le panier est vide ou invalide." }, { status: 400 });
        }

        const bodyToSend = {
            userId: session.user.id,
            items: items
        };

        const res = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend),
        });

        // On essaie de lire la réponse du bot, qu'elle soit une erreur ou un succès
        const data = await res.json();

        if (!res.ok) {
            // Si le bot a renvoyé une erreur (ex: fonds insuffisants), on la transmet.
            // La clé est 'error' dans votre API de bot.
            return NextResponse.json({ error: data.error || "Une erreur est survenue côté bot." }, { status: res.status });
        }
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
// src/app/api/interaction-response/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// L'URL de base de l'API de votre bot Discord
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    // 1. On vérifie que l'utilisateur est bien connecté
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // 2. On récupère les données envoyées par le front-end
        const body = await request.json();
        const { interactionId, accepted } = body;

        if (!interactionId) {
            return NextResponse.json({ error: 'ID de l\'interaction manquant.' }, { status: 400 });
        }

        console.log(`[API Response] Envoi de la réponse pour l'interaction ${interactionId}: ${accepted}`);

        // 3. On envoie ces informations au bot via une requête POST
        //    (Il faudra créer cet endpoint sur le bot à l'étape suivante)
        const botResponse = await fetch(`${BOT_API_URL}/interaction-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interactionId,
                accepted,
                respondingUserId: session.user.id // On envoie l'ID de l'utilisateur qui répond
            }),
        });

        // 4. On gère la réponse du bot
        if (!botResponse.ok) {
            const errorData = await botResponse.json();
            console.error("[API Response] Erreur renvoyée par le bot:", errorData);
            return NextResponse.json({ error: errorData.message || "Le bot a refusé la réponse." }, { status: botResponse.status });
        }

        const data = await botResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/interaction-response:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
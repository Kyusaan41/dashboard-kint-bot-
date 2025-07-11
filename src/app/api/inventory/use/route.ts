// src/app/api/inventory/use/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// L'URL de base de l'API de votre bot Discord
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        // --- CORRECTION ICI ---
        // On récupère à la fois 'itemId' ET 'extraData' du corps de la requête
        const { itemId, extraData } = await request.json();

        if (!itemId) {
            return NextResponse.json({ message: 'ID de l\'objet manquant.' }, { status: 400 });
        }

        // On appelle le bot en incluant TOUTES les données
        const botResponse = await fetch(`${BOT_API_URL}/inventaire/use`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                itemId: itemId,
                extraData: extraData // On transmet les données supplémentaires
            }),
        });

        // Si la réponse du bot n'est pas OK, on propage l'erreur
        if (!botResponse.ok) {
            const errorData = await botResponse.json().catch(() => ({ message: "Le bot a renvoyé une erreur non-JSON." }));
            return NextResponse.json({ message: errorData.message || "Erreur renvoyée par le bot." }, { status: botResponse.status });
        }

        const data = await botResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans l'API /api/inventory/use:", error);
        return NextResponse.json({ message: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
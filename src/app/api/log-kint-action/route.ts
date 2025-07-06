// src/app/api/log-kint-action/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// URL de votre bot Discord. Assurez-vous que cette URL est correcte.
// C'est l'URL de votre bot API hébergé, par exemple sur Katabump.
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est authentifié. Si besoin, vous pouvez aussi vérifier le rôle admin ici.
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { userId, username, avatar, actionType, points, currentBalance, effect } = await request.json();

        // --- CÔTÉ BOT : IMPLÉMENTER CETTE ROUTE SUR VOTRE BOT DISCORD ---
        // Votre bot Discord devra avoir une route POST similaire à celle-ci,
        // qui recevra ces données et enverra l'embed Discord.
        // Exemple de ce que le bot devrait faire :
        // app.post('/api/log-kint-action', (req, res) => {
        //   const { userId, username, actionType, points, currentBalance, effect } = req.body;
        //   // Logique pour construire l'embed Discord et l'envoyer au canal de logs
        //   // Assurez-vous que le bot a accès aux infos nécessaires (canal, etc.)
        // });
        // Cette route bot est CRUCIALE pour que le log arrive sur Discord.
        const botLogResponse = await fetch(`${BOT_API_URL}/log-kint-action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId, 
                username, 
                avatar, 
                actionType, 
                points, 
                currentBalance,
                effect: effect || "Aucun effet" // Assurez une valeur par défaut
            }),
        });

        if (!botLogResponse.ok) {
            const errorData = await botLogResponse.json().catch(() => ({}));
            console.error("Erreur du bot lors de l'envoi du log Kint:", errorData.error || botLogResponse.statusText);
            // On ne bloque pas la requête du dashboard si le log du bot échoue, mais on l'enregistre.
            // Vous pouvez choisir de renvoyer une erreur ici si la livraison du log est critique.
        }

        return NextResponse.json({ success: true, message: 'Log envoyé au bot.' });

    } catch (error) {
        console.error("Erreur dans /api/log-kint-action:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
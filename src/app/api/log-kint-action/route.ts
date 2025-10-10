// src/app/api/log-kint-action/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// URL de votre bot Discord. Assurez-vous que cette URL est correcte et accessible publiquement.
const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.error("AccÃ¨s non autorisÃ© Ã  /api/log-kint-action: Pas de session utilisateur.");
        return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 });
    }

    // --- Log pour vÃ©rifier ce que le dashboard reÃ§oit du frontend ---
    const requestBody = await request.json().catch(e => {
        console.error("Erreur de parsing JSON dans /api/log-kint-action:", e);
        return null; // Retourne null si le corps n'est pas un JSON valide
    });

    if (requestBody === null) {
        return NextResponse.json({ error: 'Corps de requÃªte JSON invalide.' }, { status: 400 });
    }
    console.log('--- DIAGNOSTIC DASHBOARD API ---');
    console.log('ReÃ§u du frontend (Dashboard):', requestBody);
    console.log('--- FIN DIAGNOSTIC ---');
    // --- Fin du log de diagnostic ---


    try {
        const { userId, username, avatar, actionType, points, currentBalance, effect, reason } = requestBody;

        if (!userId || !username || !actionType || points === undefined || currentBalance === undefined || !reason) {
            console.error('DonnÃ©es de log Kint manquantes ou invalides dans la requÃªte (aprÃ¨s parsing):', requestBody);
            return NextResponse.json({ error: 'DonnÃ©es de log Kint manquantes ou invalides.' }, { status: 400 });
        }

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
                effect: effect || "Aucun effet",
                reason // La raison est maintenant passÃ©e
            }),
        });

        if (!botLogResponse.ok) {
            const errorText = await botLogResponse.text().catch(() => "Pas de rÃ©ponse textuelle.");
            console.error(`Erreur lors de l'envoi du log Kint au bot: ${botLogResponse.status} ${botLogResponse.statusText}. RÃ©ponse: ${errorText}`);
            return NextResponse.json({ error: `Erreur du bot: ${errorText}` }, { status: botLogResponse.status });
        }

        const data = await botLogResponse.json(); // Tente de parser la rÃ©ponse JSON du bot
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur critique dans /api/log-kint-action (Dashboard API):", error);
        // VÃ©rifiez ici si l'erreur est liÃ©e au rÃ©seau (ex: ECONNREFUSED, ENOTFOUND)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             console.error("Erreur rÃ©seau probable lors de la connexion au bot API. VÃ©rifiez l'URL et l'accessibilitÃ© du bot.");
        }
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}

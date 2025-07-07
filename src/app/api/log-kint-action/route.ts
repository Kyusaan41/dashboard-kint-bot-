// src/app/api/log-kint-action/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// URL de votre bot Discord. Assurez-vous que cette URL est correcte et accessible publiquement.
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.error("Accès non autorisé à /api/log-kint-action: Pas de session utilisateur.");
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // --- Log pour vérifier ce que le dashboard reçoit du frontend ---
    const requestBody = await request.json().catch(e => {
        console.error("Erreur de parsing JSON dans /api/log-kint-action:", e);
        return null; // Retourne null si le corps n'est pas un JSON valide
    });

    if (requestBody === null) {
        return NextResponse.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 });
    }
    console.log('--- DIAGNOSTIC DASHBOARD API ---');
    console.log('Reçu du frontend (Dashboard):', requestBody);
    console.log('--- FIN DIAGNOSTIC ---');
    // --- Fin du log de diagnostic ---


    try {
        const { userId, username, avatar, actionType, points, currentBalance, effect, reason } = requestBody;

        if (!userId || !username || !actionType || points === undefined || currentBalance === undefined || !reason) {
            console.error('Données de log Kint manquantes ou invalides dans la requête (après parsing):', requestBody);
            return NextResponse.json({ error: 'Données de log Kint manquantes ou invalides.' }, { status: 400 });
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
                reason // La raison est maintenant passée
            }),
        });

        if (!botLogResponse.ok) {
            const errorText = await botLogResponse.text().catch(() => "Pas de réponse textuelle.");
            console.error(`Erreur lors de l'envoi du log Kint au bot: ${botLogResponse.status} ${botLogResponse.statusText}. Réponse: ${errorText}`);
            return NextResponse.json({ error: `Erreur du bot: ${errorText}` }, { status: botLogResponse.status });
        }

        const data = await botLogResponse.json(); // Tente de parser la réponse JSON du bot
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur critique dans /api/log-kint-action (Dashboard API):", error);
        // Vérifiez ici si l'erreur est liée au réseau (ex: ECONNREFUSED, ENOTFOUND)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             console.error("Erreur réseau probable lors de la connexion au bot API. Vérifiez l'URL et l'accessibilité du bot.");
        }
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
// src/app/api/kint-detailed-logs/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, context: any) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.error("Accès non autorisé à /api/kint-detailed-logs: Pas de session utilisateur.");
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get('userId'); 

    // --- NOUVELLE LIGNE DE DIAGNOSTIC ---
    console.log('--- DIAGNOSTIC DASHBOARD PROXY API ---');
    console.log('UserId reçu par le proxy (dashboard) de la query string:', userIdFromQuery);
    console.log('--- FIN DIAGNOSTIC PROXY ---');
    // --- Fin du log de diagnostic ---

    try {
        const botApiUrl = userIdFromQuery 
            ? `${BOT_API_URL}/kint-detailed-logs?userId=${userIdFromQuery}` 
            : `${BOT_API_URL}/kint-detailed-logs`;
        
        console.log('Requête envoyée au bot API:', botApiUrl);

        const botResponse = await fetch(botApiUrl);

        if (!botResponse.ok) {
            const errorText = await botResponse.text().catch(() => "Pas de réponse textuelle.");
            console.error(`Erreur lors de la récupération des logs Kint détaillés par le bot: ${botResponse.status} ${botResponse.statusText}. Réponse: ${errorText}`);
            return NextResponse.json({ error: `Erreur du bot: ${errorText}` }, { status: botResponse.status });
        }

        const data = await botResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur critique dans /api/kint-detailed-logs (Dashboard API):", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             console.error("Erreur réseau probable lors de la connexion au bot API. Vérifiez l'URL et l'accessibilité du bot.");
        }
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
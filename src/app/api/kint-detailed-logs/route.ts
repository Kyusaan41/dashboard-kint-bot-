// src/app/api/kint-detailed-logs/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// URL de votre bot Discord. Assurez-vous que cette URL est correcte et accessible publiquement.
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // Si vous voulez restreindre l'accès à ces logs aux utilisateurs connectés ou admins
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // --- CÔTÉ BOT : CETTE ROUTE DOIT ÊTRE IMPLÉMENTÉE SUR VOTRE BOT DISCORD ---
        // Votre bot Discord devra avoir une route GET à cette adresse (ex: /api/kint-detailed-logs)
        // qui lira et renverra le contenu de votre fichier kint_detailed_logs.json.
        // Exemple : router.get('/kint-detailed-logs', (req, res) => { /* lire le fichier et l'envoyer */ });
        const botResponse = await fetch(`${BOT_API_URL}/kint-detailed-logs`);

        if (!botResponse.ok) {
            const errorData = await botResponse.json().catch(() => ({}));
            console.error("Erreur du bot lors de la récupération des logs Kint détaillés:", errorData.error || botResponse.statusText);
            return NextResponse.json({ error: 'Impossible de récupérer les logs détaillés du bot.' }, { status: botResponse.status });
        }

        const data = await botResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/kint-detailed-logs (Dashboard API):", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
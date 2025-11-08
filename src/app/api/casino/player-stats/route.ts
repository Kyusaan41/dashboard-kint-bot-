import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NYXNODE_API_URL } from '@/config/api';

/**
 * Récupère le solde et les statistiques de niveau/XP d'un joueur
 * en appelant l'API du bot.
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const username = session.user.name || 'JoueurInconnu';

    try {
        // Récupérer le solde
        const currencyRes = await fetch(`${NYXNODE_API_URL}/api/currency/${userId}`);
        const currencyData = currencyRes.ok ? await currencyRes.json() : { balance: 0 };

        // Récupérer les stats du casino (niveau, xp, etc.)
        const statsRes = await fetch(`${NYXNODE_API_URL}/api/casino/stats`);
        const allStatsData = statsRes.ok ? await statsRes.json() : { players: [] };
        
        let playerStats = allStatsData.players.find((p: any) => p.username === username);

        if (!playerStats) {
            playerStats = { level: 1, xp: 0 };
        }

        const xpForNextLevel = Math.floor(1000 * Math.pow(playerStats.level, 1.5));

        const responseData = {
            balance: currencyData.balance,
            level: playerStats.level,
            xp: playerStats.xp,
            xpForNextLevel,
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Erreur dans GET /api/casino/player-stats:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur lors de la récupération des stats du joueur' }, { status: 500 });
    }
}
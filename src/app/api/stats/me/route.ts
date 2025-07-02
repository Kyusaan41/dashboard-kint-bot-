import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

const findUserRank = (leaderboard: any[], userId: string, key: string): number | null => {
    if (!Array.isArray(leaderboard)) return null;
    const rank = leaderboard.findIndex(u => u.userId === userId) + 1;
    return rank > 0 ? rank : null;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const results = await Promise.allSettled([
            fetch(`${BOT_API_URL}/currency/${userId}`),
            fetch(`${BOT_API_URL}/points/${userId}`),
            fetch(`${BOT_API_URL}/xp/${userId}`),
            fetch(`${BOT_API_URL}/currency`),
            fetch(`${BOT_API_URL}/points`),
            fetch(`${BOT_API_URL}/xp`),
            fetch(`${BOT_API_URL}/titres/${userId}`),
        ]);

        // --- CORRECTION ICI : On traite les promesses résolues de manière plus sûre ---
        const [
            currencyRes, pointsRes, xpRes,
            currencyBoardRes, pointsBoardRes, xpBoardRes,
            titlesRes
        ] = await Promise.all(results.map(async (result) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                return result.value.json();
            }
            return null; // Retourne null si la promesse a été rejetée ou si la réponse n'est pas OK
        }));
        
        const combinedStats = {
            currency: currencyRes?.balance || 0,
            currencyRank: currencyBoardRes ? findUserRank(currencyBoardRes, userId, 'balance') : null,
            points: pointsRes?.points || 0,
            pointsRank: pointsBoardRes ? findUserRank(pointsBoardRes, userId, 'points') : null,
            xp: xpRes?.xp || 0,
            xpRank: xpBoardRes ? findUserRank(xpBoardRes, userId, 'xp') : null,
            equippedTitle: titlesRes?.titreActuel || 'Aucun',
        };

        return NextResponse.json(combinedStats);
    } catch (error) {
        console.error("Erreur API /api/stats/me:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des statistiques." }, { status: 500 });
    }
}
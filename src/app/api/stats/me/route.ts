import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

const findUserRank = (leaderboard: any[], userId: string, key: string): number | null => {
    if (!Array.isArray(leaderboard)) return null;
    const rank = leaderboard.findIndex(u => u.userId === userId) + 1;
    return rank > 0 ? rank : null;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const results = await Promise.allSettled([
            fetch(`${BOT_API_URL}/currency/${userId}`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/points/${userId}`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/xp/${userId}`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/currency`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/points`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/xp`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/titres/${userId}`, { cache: 'no-store' }),
        ]);

        // --- CORRECTION ICI : On traite les promesses rÃ©solues de maniÃ¨re plus sÃ»re ---
        const [
            currencyRes, pointsRes, xpRes,
            currencyBoardRes, pointsBoardRes, xpBoardRes,
            titlesRes
        ] = await Promise.all(results.map(async (result) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                return result.value.json();
            }
            return null; // Retourne null si la promesse a Ã©tÃ© rejetÃ©e ou si la rÃ©ponse n'est pas OK
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

        return NextResponse.json(combinedStats, { status: 200 });
    } catch (error) {
        console.error("Erreur API /api/stats/me:", error);
        // Fallback sÃ»r pour ne pas casser le dashboard
        return NextResponse.json({
            currency: 0,
            currencyRank: null,
            points: 0,
            pointsRank: null,
            xp: 0,
            xpRank: null,
            equippedTitle: 'Aucun',
        }, { status: 200 });
    }
}

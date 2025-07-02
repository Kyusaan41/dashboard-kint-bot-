import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// L'URL de l'API de votre bot
const BOT_API_URL = 'http://51.83.103.24:20077/api';

// Petite fonction pour trouver le rang d'un utilisateur dans un classement
const findUserRank = (leaderboard: any[], userId: string, key: string): number | null => {
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
        // On lance tous les appels en parallèle
        const [
            currencyRes, pointsRes, xpRes,
            currencyBoardRes, pointsBoardRes, xpBoardRes,
            titlesRes
        ] = await Promise.all([
            fetch(`${BOT_API_URL}/currency/${userId}`),
            fetch(`${BOT_API_URL}/points/${userId}`),
            fetch(`${BOT_API_URL}/xp/${userId}`),
            fetch(`${BOT_API_URL}/currency`),
            fetch(`${BOT_API_URL}/points`),
            fetch(`${BOT_API_URL}/xp`),
            fetch(`${BOT_API_URL}/titres/${userId}`),
        ]);

        // On traite les données de chaque réponse
        const currencyData = await currencyRes.json();
        const pointsData = await pointsRes.json();
        const xpData = await xpRes.json();
        const currencyBoard = await currencyBoardRes.json();
        const pointsBoard = await pointsBoardRes.json();
        const xpBoard = await xpBoardRes.json();
        const titlesData = await titlesRes.json();

        // On combine tout en un seul objet
        const combinedStats = {
            currency: currencyData.balance || 0,
            currencyRank: findUserRank(currencyBoard, userId, 'balance'),
            points: pointsData.points || 0,
            pointsRank: findUserRank(pointsBoard, userId, 'points'),
            xp: xpData.xp || 0,
            xpRank: findUserRank(xpBoard, userId, 'xp'),
            equippedTitle: titlesData.titreActuel || 'Aucun',
        };

        return NextResponse.json(combinedStats);
    } catch (error) {
        console.error("Erreur API /api/stats/me:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des statistiques." }, { status: 500 });
    }
}
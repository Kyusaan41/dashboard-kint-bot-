import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        const [kintRes, pointsRes] = await Promise.all([
            fetch(`${BOT_API_URL}/kint-stats-all`),
            fetch(`${BOT_API_URL}/points/history/all`)
        ]);

        if (!kintRes.ok || !pointsRes.ok) {
            console.error('Erreur lors de la récupération des données depuis le bot:', kintRes.status, pointsRes.status);
            throw new Error('Impossible de récupérer les données nécessaires depuis le bot.');
        }

        const kintData = await kintRes.json();
        const pointsData = await pointsRes.json();

        // Joueurs actifs = nombre d'entrées dans kint-stats-all
        const activePlayers = Object.keys(kintData || {}).length;

        // Parties jouées = somme du champ `total` pour chaque utilisateur (nombre de kints joués)
        const gamesPlayed = Object.values(kintData || {}).reduce((acc: number, user: any) => {
            return acc + (Number(user?.total) || 0);
        }, 0);

        // Points distribués = somme des points positifs dans l'historique (points ajoutés)
        let pointsDistributed = 0;
        for (const userId in (pointsData || {})) {
            const logs = pointsData[userId] || [];
            for (const log of logs) {
                const pts = Number(log?.points) || 0;
                if (pts > 0) pointsDistributed += pts;
            }
        }

        return NextResponse.json({ activePlayers, gamesPlayed, pointsDistributed });
    } catch (error) {
        console.error('Erreur dans /api/mini-jeu/stats :', error);
        return NextResponse.json({ activePlayers: 0, gamesPlayed: 0, pointsDistributed: 0 }, { status: 500 });
    }
}

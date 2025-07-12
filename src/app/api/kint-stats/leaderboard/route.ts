// src/app/api/kint-stats/leaderboard/route.ts
import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    try {
        const [statsRes, serverInfoRes] = await Promise.all([
            fetch(`${BOT_API_URL}/kint-stats-all`),
            fetch(`${BOT_API_URL}/serverinfo`)
        ]);

        if (!statsRes.ok || !serverInfoRes.ok) {
            throw new Error("Impossible de récupérer les données nécessaires depuis le bot.");
        }

        const statsData = await statsRes.json();
        const serverInfo = await serverInfoRes.json();
        const members = serverInfo.members || [];

        const allUsers = Object.entries(statsData).map(([userId, stats]: [string, any]) => {
            const memberInfo = members.find((m: any) => m.id === userId);
            return {
                userId,
                username: memberInfo?.username || 'Utilisateur Inconnu',
                avatar: memberInfo?.avatar || '/default-avatar.png',
                ...stats,
                // Le "taux d'int" est le ratio de défaites ('oui') sur le total des parties.
                lossRate: stats.total > 0 ? (stats.oui / stats.total) * 100 : 0
            };
        });

        // S'il n'y a aucun joueur, on ne fait rien.
        if (allUsers.length === 0) {
            return NextResponse.json({ leaderboard: [], mostGuez: null });
        }
        
        // On trie le classement principal par nombre total de parties jouées.
        const leaderboard = allUsers.sort((a, b) => b.total - a.total).slice(0, 10);

        // ▼▼▼ LOGIQUE SIMPLIFIÉE (IDENTIQUE AU BOT) ▼▼▼

        let mostGuez = null;

        // On filtre pour ne garder que les joueurs qui ont joué au moins une partie
        const playersWithGames = allUsers.filter(user => user.total > 0);

        // S'il y a des joueurs avec au moins une partie...
        if (playersWithGames.length > 0) {
            // On cherche celui avec le plus haut "lossRate" (taux d'int)
            mostGuez = playersWithGames.reduce((max, user) => {
                if (user.lossRate > max.lossRate) {
                    return user;
                }
                // En cas d'égalité, on prend celui qui a le plus de défaites
                if (user.lossRate === max.lossRate && user.oui > max.oui) {
                    return user;
                }
                return max;
            }, playersWithGames[0]);
        }
        
        return NextResponse.json({ leaderboard, mostGuez });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}
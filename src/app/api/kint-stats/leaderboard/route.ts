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

        if (allUsers.length === 0) {
            return NextResponse.json({ leaderboard: [], mostGuez: null });
        }
        
        // On trie le classement principal par nombre total de parties jouées.
        const leaderboard = allUsers.sort((a, b) => b.total - a.total).slice(0, 10);

        // ▼▼▼ NOUVELLE LOGIQUE AMÉLIORÉE ▼▼▼

        // 1. On définit le seuil minimum de parties pour être "éligible" au titre de plus guez.
        const MIN_GAMES_FOR_GUEZ = 7; // Vous pouvez ajuster ce nombre.

        // 2. On filtre les joueurs pour ne garder que les candidats valides.
        const candidatesForGuez = allUsers.filter(user => user.total >= MIN_GAMES_FOR_GUEZ);
        
        let mostGuez = null;

        // 3. On ne cherche le "plus guez" que s'il y a des candidats éligibles.
        if (candidatesForGuez.length > 0) {
            // On cherche le joueur avec le plus haut taux de défaite parmi les candidats.
            mostGuez = candidatesForGuez.reduce((max, user) => {
                if (user.lossRate > max.lossRate) {
                    return user;
                }
                // En cas d'égalité, on peut prendre celui qui a joué le plus de parties.
                if (user.lossRate === max.lossRate && user.total > max.total) {
                    return user;
                }
                return max;
            }, candidatesForGuez[0]);
        }
        
        // S'il n'y a aucun candidat, `mostGuez` restera `null` et rien ne s'affichera.
        
        return NextResponse.json({ leaderboard, mostGuez });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}
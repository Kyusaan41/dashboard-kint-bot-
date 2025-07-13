// src/app/api/kint-stats/leaderboard/route.ts
import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On définit le "type" pour un utilisateur et ses statistiques Kint
type KintUserStats = {
    userId: string;
    username: string;
    avatar: string;
    total: number;
    oui: number;
    non: number;
    lossRate: number;
};

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

        // On utilise 'any' car les stats du bot n'ont pas de type défini à la source
        const allUsers: any[] = Object.entries(statsData).map(([userId, stats]: [string, any]) => {
            const memberInfo = members.find((m: any) => m.id === userId);
            return {
                userId,
                username: memberInfo?.username || 'Utilisateur Inconnu',
                avatar: memberInfo?.avatar || '/default-avatar.png',
                ...stats,
            };
        });

        if (allUsers.length === 0) {
            return NextResponse.json({ leaderboard: [], mostGuez: null });
        }
        
        const leaderboard = [...allUsers] // On crée une copie pour le tri
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // ▼▼▼ NOUVELLE LOGIQUE DU "PLUS GUEZ" SYNCHRONISÉE ▼▼▼
        const MIN_GAMES = 10;
        
        // 1. Filtrer les joueurs éligibles
        let candidates = allUsers.filter(user => user.total >= MIN_GAMES);

        // 2. Si personne n'atteint le minimum, on se rabat sur le leaderboard
        if (candidates.length === 0) {
            candidates = leaderboard;
        }

        let topUser = null;

        if (candidates.length > 0) {
            // 3. Trier les candidats pour trouver le pire
            //    - Critère 1: Taux de défaite (oui/total) le plus ÉLEVÉ
            //    - Critère 2 (en cas d'égalité): Nombre total de parties le plus ÉLEVÉ
            const sortedCandidates = [...candidates].sort((a, b) => {
                const ratioA = a.total > 0 ? a.oui / a.total : 0;
                const ratioB = b.total > 0 ? b.oui / b.total : 0;

                // Si les ratios sont différents, on trie par ratio (décroissant)
                if (ratioB !== ratioA) {
                    return ratioB - ratioA;
                }
                
                // Si les ratios sont égaux, on trie par total de parties (décroissant)
                return b.total - a.total;
            });
            
            // 4. Le "plus guez" est le premier de la liste triée
            topUser = sortedCandidates[0];
        }
        // ▲▲▲ FIN DE LA NOUVELLE LOGIQUE ▲▲▲
        
        // On enrichit les données finales avec le taux de défaite en pourcentage
        const enrichedTopUser = topUser ? {
            ...topUser,
            lossRate: topUser.total > 0 ? (topUser.oui / topUser.total) * 100 : 0
        } : null;

        const enrichedLeaderboard = leaderboard.map((user) => ({
            ...user,
            lossRate: user.total > 0 ? (user.oui / user.total) * 100 : 0
        }));

        return NextResponse.json({ leaderboard: enrichedLeaderboard, mostGuez: enrichedTopUser });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        // On retourne un objet vide en cas d'erreur pour que le front-end ne crashe pas
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}
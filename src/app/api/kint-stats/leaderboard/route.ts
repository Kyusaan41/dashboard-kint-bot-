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

        const allUsers = Object.entries(statsData).map(([userId, stats]: [string, any]) => {
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
        
        const leaderboard = allUsers
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // ▼▼▼ LOGIQUE DU "PLUS GUEZ" SYNCHRONISÉE ▼▼▼
        const MIN_GAMES = 10;
        // On indique ici que 'user' est de type 'any' pour le moment car il vient d'un JSON non typé.
        const candidates = allUsers.filter((user: any) => user.total >= MIN_GAMES);

        let topUser = null;

        const calculateLossRatio = (user: any) => {
            if (user.total === 0) return 0;
            return user.oui / user.total;
        };
        
        if (candidates.length > 0) {
            topUser = candidates.reduce((max: any, user: any) => {
                return calculateLossRatio(user) > calculateLossRatio(max) ? user : max;
            });
        } else if (leaderboard.length > 0) {
            const fallbackCandidates = leaderboard.filter((user: any) => user.total > 0);
            if (fallbackCandidates.length > 0) {
                topUser = fallbackCandidates.reduce((max: any, user: any) => {
                    return calculateLossRatio(user) > calculateLossRatio(max) ? user : max;
                }, fallbackCandidates[0]);
            }
        }
        
        // On enrichit les données finales avec le taux de défaite en pourcentage
        const enrichedTopUser = topUser ? {
            ...topUser,
            lossRate: topUser.total > 0 ? (topUser.oui / topUser.total) * 100 : 0
        } : null;

        // On type ici aussi pour la bonne pratique
        const enrichedLeaderboard = leaderboard.map((user: any) => ({
            ...user,
            lossRate: user.total > 0 ? (user.oui / user.total) * 100 : 0
        }));

        return NextResponse.json({ leaderboard: enrichedLeaderboard, mostGuez: enrichedTopUser });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}
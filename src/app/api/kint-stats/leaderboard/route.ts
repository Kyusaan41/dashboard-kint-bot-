// src/app/api/kint-stats/leaderboard/route.ts
import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

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
            throw new Error("Impossible de rÃ©cupÃ©rer les donnÃ©es nÃ©cessaires depuis le bot.");
        }

        const statsData = await statsRes.json();
        const serverInfo = await serverInfoRes.json();
        const members = serverInfo.members || [];

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

        const leaderboard = [...allUsers]
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const MIN_GAMES = 20;

        // â— Ã‰tape 1 : filtrer les vrais candidats Ã  lâ€™humiliation
        let candidates = allUsers.filter(user => user.total >= MIN_GAMES && user.oui > 0);

        // Si aucun candidat sÃ©rieux, on ne dÃ©signe personne
        let topUser = null;

        if (candidates.length > 0) {
            const sortedCandidates = [...candidates].sort((a, b) => {
                const ratioA = a.oui / a.total;
                const ratioB = b.oui / b.total;

                if (ratioB !== ratioA) {
                    return ratioB - ratioA;
                }
                return b.total - a.total;
            });

            topUser = sortedCandidates[0];
        }

        const enrichedTopUser = topUser ? {
            ...topUser,
            lossRate: (topUser.oui / topUser.total) * 100
        } : null;

        const enrichedLeaderboard = leaderboard.map(user => ({
            ...user,
            lossRate: user.total > 0 ? (user.oui / user.total) * 100 : 0
        }));

        return NextResponse.json({
            leaderboard: enrichedLeaderboard,
            mostGuez: enrichedTopUser
        });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}


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
                lossRate: stats.total > 0 ? (stats.oui / stats.total) * 100 : 0
            };
        });

        if (allUsers.length === 0) {
            return NextResponse.json({ leaderboard: [], mostGuez: null });
        }
        
        const leaderboard = allUsers.sort((a, b) => b.total - a.total).slice(0, 10);

        const MIN_GAMES = 20;
        const candidates = allUsers.filter(user => user.total >= MIN_GAMES);
        let mostGuez = null;

        if (candidates.length > 0) {
            mostGuez = candidates.reduce((max, user) => user.lossRate > max.lossRate ? user : max, candidates[0]);
        } else if (leaderboard.length > 0) {
            mostGuez = leaderboard.reduce((max, user) => user.lossRate > max.lossRate ? user : max, leaderboard[0]);
        }
        
        return NextResponse.json({ leaderboard, mostGuez });

    } catch (error) {
        console.error("Erreur dans /api/kint-stats/leaderboard:", error);
        return NextResponse.json({ leaderboard: [], mostGuez: null }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        const [leaderboardRes, serverInfoRes] = await Promise.allSettled([
            fetch(`${BOT_API_URL}/points`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/serverinfo`, { cache: 'no-store' })
        ]);

        if (leaderboardRes.status !== 'fulfilled' || !leaderboardRes.value.ok) {
            return NextResponse.json([], { status: 200 });
        }

        const leaderboard = await leaderboardRes.value.json();

        if (serverInfoRes.status === 'fulfilled' && serverInfoRes.value.ok) {
            const serverInfo = await serverInfoRes.value.json();
            const members = serverInfo.members || [];
            const enrichedLeaderboard = Array.isArray(leaderboard) ? leaderboard.map((player: { userId: string, points: number }) => {
                const memberInfo = members.find((m: any) => m.id === player.userId);
                return {
                    ...player,
                    username: memberInfo?.username || 'Utilisateur Inconnu',
                    avatar: memberInfo?.avatar || '/default-avatar.png'
                };
            }) : [];
            return NextResponse.json(enrichedLeaderboard, { status: 200 });
        }

        return NextResponse.json(Array.isArray(leaderboard) ? leaderboard : [], { status: 200 });

    } catch (error) {
        console.error("Erreur dans /api/points:", error);
        return NextResponse.json([], { status: 200 });
    }
}

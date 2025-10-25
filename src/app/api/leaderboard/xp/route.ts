import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        // On lance les deux appels en parallÃ¨le pour plus d'efficacitÃ©
        const [leaderboardRes, serverInfoRes] = await Promise.all([
            fetch(`${BOT_API_URL}/xp`),       // RÃ©cupÃ¨re le classement { userId, xp }
            fetch(`${BOT_API_URL}/serverinfo`) // RÃ©cupÃ¨re les infos des membres
        ]);

        if (!leaderboardRes.ok || !serverInfoRes.ok) {
            throw new Error("Impossible de rÃ©cupÃ©rer toutes les donnÃ©es nÃ©cessaires depuis le bot.");
        }

        const leaderboard = await leaderboardRes.json();
        const serverInfo = await serverInfoRes.json();
        const members = serverInfo.members || [];

        // On "enrichit" le classement XP avec les donnÃ©es des membres
        const enrichedLeaderboard = leaderboard.map((player: { userId: string, xp: number }) => {
            const memberInfo = members.find((m: any) => m.id === player.userId);
            return {
                ...player,
                username: memberInfo?.username || 'Utilisateur inconnu',
                avatar: memberInfo?.avatar || '/default-avatar.png'
            };
        });

        return NextResponse.json(enrichedLeaderboard);

    } catch (error) {
        console.error("Erreur dans /api/leaderboard/xp:", error);
        return NextResponse.json([], { status: 500 });
    }
}

import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    try {
        // On lance les deux appels en parallèle pour gagner du temps
        const [leaderboardRes, serverInfoRes] = await Promise.all([
            fetch(`${BOT_API_URL}/points`), // Récupère le classement { userId, points }
            fetch(`${BOT_API_URL}/serverinfo`) // Récupère la liste des membres { id, username, avatar }
        ]);

        if (!leaderboardRes.ok || !serverInfoRes.ok) {
            throw new Error("Impossible de récupérer toutes les données nécessaires depuis le bot.");
        }

        const leaderboard = await leaderboardRes.json();
        const serverInfo = await serverInfoRes.json();
        const members = serverInfo.members || [];

        // On "enrichit" le classement avec les données des membres
        const enrichedLeaderboard = leaderboard.map((player: { userId: string, points: number }) => {
            const memberInfo = members.find((m: any) => m.id === player.userId);
            return {
                ...player,
                username: memberInfo?.username || 'Utilisateur Inconnu',
                avatar: memberInfo?.avatar || '/default-avatar.png'
            };
        });

        return NextResponse.json(enrichedLeaderboard);

    } catch (error) {
        console.error("Erreur dans /api/points:", error);
        return NextResponse.json([], { status: 500 }); // Renvoyer un tableau vide en cas d'erreur
    }
}
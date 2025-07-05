import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On définit un type pour les membres pour aider TypeScript
type MemberInfo = {
    id: string;
    username: string;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    try {
        const [logsRes, usersRes] = await Promise.all([
            fetch(`${BOT_API_URL}/points/history/all`),
            fetch(`${BOT_API_URL}/serverinfo`)
        ]);

        if (!logsRes.ok || !usersRes.ok) {
            throw new Error("Impossible de récupérer les données nécessaires depuis le bot.");
        }

        const allLogs = await logsRes.json();
        const serverInfo = await usersRes.json();
        const members: MemberInfo[] = serverInfo.members || []; // On applique le type ici

        const formattedLogs = [];
        for (const userId in allLogs) {
            // TypeScript sait maintenant que 'm' est de type MemberInfo
            const memberInfo = members.find((m: MemberInfo) => m.id === userId);
            const username = memberInfo?.username || `ID: ${userId}`;

            for (const log of allLogs[userId]) {
                formattedLogs.push({
                    userId,
                    username,
                    ...log
                });
            }
        }

        formattedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(formattedLogs);

    } catch (error) {
        console.error("Erreur API /api/admin/kint-logs:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
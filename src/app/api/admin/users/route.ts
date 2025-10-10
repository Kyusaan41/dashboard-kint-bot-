import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    const session = await getServerSession(authOptions);
    // On vÃ©rifie que l'utilisateur est bien admin
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ message: 'AccÃ¨s interdit' }, { status: 403 });
    }

    try {
        // On appelle la route /serverinfo du bot
        const response = await fetch(`${BOT_API_URL}/serverinfo`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur de l'API du bot [${response.status}]: ${errorText}`);
            return NextResponse.json({ message: "Impossible de rÃ©cupÃ©rer les infos du serveur depuis le bot" }, { status: response.status });
        }
        
        const serverInfo = await response.json();
        
        // On renvoie uniquement la liste des membres, comme attendu par le frontend
        return NextResponse.json(serverInfo.members || []);
    } catch (error) {
        console.error("Erreur API /api/admin/users:", error);
        return NextResponse.json({ message: 'Serveur du bot injoignable.' }, { status: 500 });
    }
}

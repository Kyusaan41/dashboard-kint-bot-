import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// On importe la configuration depuis notre nouveau fichier
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    // On utilise bien la config importée ici
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const [xpRes, currencyRes, pointsRes] = await Promise.all([
            fetch(`${BOT_API_URL}/xp/${userId}`),
            fetch(`${BOT_API_URL}/currency/${userId}`),
            fetch(`${BOT_API_URL}/points/${userId}`),
        ]);

        if (!xpRes.ok || !currencyRes.ok || !pointsRes.ok) {
            return NextResponse.json({ message: 'Impossible de récupérer toutes les statistiques utilisateur.' }, { status: 502 });
        }

        const xpData = await xpRes.json();
        const currencyData = await currencyRes.json();
        const pointsData = await pointsRes.json();
        
        const userStats = {
            xp: xpData.xp ?? 0,
            coins: currencyData.balance ?? 0,
            points: pointsData.points ?? 0,
        };

        return NextResponse.json(userStats);

    } catch (error) {
        return NextResponse.json({ message: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
// Fichier : src/app/api/gazette/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// GET : Récupère la liste de tous les articles de la gazette
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/gazette`);
        if (!res.ok) {
            console.error("Erreur de l'API du bot lors de la récupération de la gazette");
            return NextResponse.json({ error: "Impossible de récupérer la gazette depuis le bot." }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/gazette:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
// Fichier : src/app/api/gazette/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET : RÃ©cupÃ¨re la liste de tous les articles de la gazette
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/gazette`, { cache: 'no-store' });
        if (!res.ok) {
            console.error("Erreur de l'API du bot lors de la rÃ©cupÃ©ration de la gazette");
            return NextResponse.json([], { status: 200 });
        }
        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
    } catch (error) {
        console.error("Erreur dans /api/gazette:", error);
        return NextResponse.json([], { status: 200 });
    }
}

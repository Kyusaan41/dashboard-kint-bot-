// src/app/api/kint/use-shield/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/kint/use-shield`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
        });

        const data = await res.json();
        return res.ok 
            ? NextResponse.json(data)
            : NextResponse.json({ error: data.error || "Erreur du bot." }, { status: res.status });

    } catch (error) {
        console.error("Erreur API /api/kint/use-shield:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
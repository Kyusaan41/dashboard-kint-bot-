// src/app/api/interaction-response/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { interactionId, accepted } = body;

        if (!interactionId) {
            return NextResponse.json({ error: 'ID de l\'interaction manquant.' }, { status: 400 });
        }

        const botResponse = await fetch(`${BOT_API_URL}/interaction-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interactionId,
                accepted,
                respondingUserId: session.user.id
            }),
        });

        if (!botResponse.ok) {
            const errorData = await botResponse.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Le bot a renvoyÃ© une erreur." }, { status: botResponse.status });
        }

        return NextResponse.json(await botResponse.json());

    } catch (error) {
        console.error("Erreur dans /api/interaction-response:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}

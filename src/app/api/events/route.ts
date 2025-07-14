// Fichier : src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// GET : Récupère la liste de tous les événements à venir
export async function GET() {
    // On vérifie la session pour s'assurer que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/events`);
        if (!res.ok) {
            console.error("Erreur de l'API du bot lors de la récupération des événements");
            return NextResponse.json({ error: "Impossible de récupérer les événements depuis le bot." }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/events:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

// POST : Permet de créer un nouvel événement (sera utilisé par le panneau admin)
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    // On s'assure que seul un admin peut créer un événement
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const res = await fetch(`${BOT_API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json({ error: errorData.error }, { status: res.status });
        }
        
        const newEvent = await res.json();
        return NextResponse.json(newEvent, { status: 201 });

    } catch (error) {
        console.error("Erreur dans POST /api/events:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
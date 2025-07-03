import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { items } = await request.json(); // Récupère le tableau d'items envoyé par le client

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Le corps de la requête doit contenir un tableau d'items." }, { status: 400 });
        }

        // --- CORRECTION ICI ---
        // On crée un nouvel objet qui inclut l'ID de l'utilisateur ET le tableau d'items,
        // exactement comme l'API du bot s'y attend.
        const bodyToSend = {
            userId: session.user.id,
            items: items
        };
        // --------------------

        const res = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend), // On envoie le corps de la requête corrigé
        });

        const data = await res.json();

        if (!res.ok) {
            // Si le bot renvoie une erreur (ex: fonds insuffisants), on la transmet.
            return NextResponse.json({ error: data.error || "Une erreur est survenue lors de l'achat." }, { status: res.status });
        }
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
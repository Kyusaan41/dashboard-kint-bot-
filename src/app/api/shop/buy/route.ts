import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// L'URL de l'API de votre bot
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // Vérifie si l'utilisateur est connecté
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // Récupère le tableau d'items envoyé par le client
        const { items } = await request.json(); 

        // Valide que le panier n'est pas vide
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Le corps de la requête doit contenir un tableau d'items non vide." }, { status: 400 });
        }

        // Prépare le corps de la requête exactement comme l'API du bot s'y attend
        const bodyToSend = {
            userId: session.user.id,
            items: items // 'items' est le tableau d'IDs
        };
        
        // Appelle la route /shop/buy de votre bot externe
        const res = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend),
        });

        // Gestion améliorée des erreurs : on transmet le message d'erreur du bot au client
        if (!res.ok) {
            const data = await res.json();
            return NextResponse.json({ error: data.error || "Une erreur est survenue lors de l'achat." }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
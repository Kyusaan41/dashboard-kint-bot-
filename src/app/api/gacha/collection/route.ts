import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ANIME_CARDS, getCardById } from '@/app/dashboard/mini-jeu/gacha/cards';

const BOT_API_URL = process.env.NYXNODE_API_URL || 'http://193.70.34.25:20007';

/**
 * GET /api/gacha/collection
 * Récupère la collection de l'utilisateur connecté et l'enrichit avec les détails des cartes.
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // 1. Appeler l'API du bot pour obtenir la collection brute
        const response = await fetch(`${BOT_API_URL}/api/gacha/collection/${session.user.id}`);

        if (!response.ok) {
            // Si l'utilisateur n'a pas de collection, le bot peut renvoyer 404. On retourne une collection vide.
            if (response.status === 404) {
                return NextResponse.json({
                    success: true,
                    data: { userId: session.user.id, username: session.user.name, collections: [], totalCards: 0, uniqueCards: 0 }
                });
            }
            throw new Error(`Erreur de l'API du bot: ${response.statusText}`);
        }

        const collectionData = await response.json();

        // 2. Enrichir les données avec les informations complètes des cartes
        collectionData.data.collections.forEach((animeCollection: any) => {
            animeCollection.cards.forEach((card: any) => {
                card.cardInfo = getCardById(card.cardId) || null;
            });
        });

        return NextResponse.json(collectionData);

    } catch (error) {
        console.error("[API_GACHA_COLLECTION] Erreur:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
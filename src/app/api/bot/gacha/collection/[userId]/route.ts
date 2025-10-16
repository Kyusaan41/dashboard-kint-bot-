import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserCollection } from '@/types/collection';
import { ANIME_CARDS } from '@/app/dashboard/mini-jeu/gacha/cards';

const COLLECTIONS_FILE = path.join(process.cwd(), 'data', 'gacha-collections.json');

// Fonction pour lire les collections
function readCollections(): { collections: UserCollection[] } {
    try {
        if (!fs.existsSync(COLLECTIONS_FILE)) {
            return { collections: [] };
        }
        const data = fs.readFileSync(COLLECTIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors de la lecture des collections:', error);
        return { collections: [] };
    }
}

// GET - Récupérer la collection d'un utilisateur (pour le bot Discord)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId requis' },
                { status: 400 }
            );
        }

        const data = readCollections();
        const userCollection = data.collections.find(c => c.userId === userId);

        if (!userCollection) {
            return NextResponse.json({
                success: true,
                data: {
                    userId,
                    username: 'Unknown',
                    collections: [],
                    totalCards: 0,
                    uniqueCards: 0,
                    lastUpdated: new Date().toISOString()
                }
            });
        }

        // Enrichir les données avec les informations des cartes
        const enrichedCollections = userCollection.collections.map(animeCollection => ({
            ...animeCollection,
            cards: animeCollection.cards.map(cardInCollection => {
                const card = ANIME_CARDS.find(c => c.id === cardInCollection.cardId);
                return {
                    ...cardInCollection,
                    cardInfo: card ? {
                        name: card.name,
                        rarity: card.rarity,
                        power: card.power,
                        description: card.description,
                        malId: card.malId
                    } : null
                };
            })
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...userCollection,
                collections: enrichedCollections
            }
        });
    } catch (error) {
        console.error('Erreur GET collection:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
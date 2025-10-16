import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserCollection, AnimeCollection, CardInCollection } from '@/types/collection';

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

// Fonction pour écrire les collections
function writeCollections(data: { collections: UserCollection[] }): void {
    try {
        const dir = path.dirname(COLLECTIONS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Erreur lors de l\'écriture des collections:', error);
        throw error;
    }
}

// GET - Récupérer la collection d'un utilisateur
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId requis' },
                { status: 400 }
            );
        }

        const data = readCollections();
        const userCollection = data.collections.find(c => c.userId === userId);

        if (!userCollection) {
            // Créer une collection vide pour l'utilisateur
            const newCollection: UserCollection = {
                userId,
                username: 'Unknown',
                collections: [],
                totalCards: 0,
                uniqueCards: 0,
                lastUpdated: new Date().toISOString()
            };
            return NextResponse.json({ success: true, data: newCollection });
        }

        return NextResponse.json({ success: true, data: userCollection });
    } catch (error) {
        console.error('Erreur GET collection:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST - Ajouter une carte à la collection
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, username, cardId, anime } = body;

        if (!userId || !cardId || !anime) {
            return NextResponse.json(
                { success: false, error: 'userId, cardId et anime requis' },
                { status: 400 }
            );
        }

        const data = readCollections();
        let userCollection = data.collections.find(c => c.userId === userId);

        // Si l'utilisateur n'a pas de collection, en créer une
        if (!userCollection) {
            userCollection = {
                userId,
                username: username || 'Unknown',
                collections: [],
                totalCards: 0,
                uniqueCards: 0,
                lastUpdated: new Date().toISOString()
            };
            data.collections.push(userCollection);
        }

        // Trouver ou créer la collection pour cet anime
        let animeCollection = userCollection.collections.find(c => c.anime === anime);
        if (!animeCollection) {
            animeCollection = {
                anime,
                cards: []
            };
            userCollection.collections.push(animeCollection);
        }

        // Trouver ou créer la carte dans la collection
        let cardInCollection = animeCollection.cards.find(c => c.cardId === cardId);
        if (cardInCollection) {
            // Carte déjà possédée, incrémenter le compteur
            cardInCollection.count++;
        } else {
            // Nouvelle carte
            cardInCollection = {
                cardId,
                count: 1,
                obtainedAt: new Date().toISOString()
            };
            animeCollection.cards.push(cardInCollection);
            userCollection.uniqueCards++;
        }

        // Mettre à jour les statistiques
        userCollection.totalCards++;
        userCollection.lastUpdated = new Date().toISOString();

        // Sauvegarder
        writeCollections(data);

        return NextResponse.json({ success: true, data: userCollection });
    } catch (error) {
        console.error('Erreur POST collection:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer une carte de la collection (pour les trades)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const cardId = searchParams.get('cardId');

        if (!userId || !cardId) {
            return NextResponse.json(
                { success: false, error: 'userId et cardId requis' },
                { status: 400 }
            );
        }

        const data = readCollections();
        const userCollection = data.collections.find(c => c.userId === userId);

        if (!userCollection) {
            return NextResponse.json(
                { success: false, error: 'Collection non trouvée' },
                { status: 404 }
            );
        }

        // Trouver la carte dans toutes les collections d'anime
        let cardFound = false;
        for (const animeCollection of userCollection.collections) {
            const cardIndex = animeCollection.cards.findIndex(c => c.cardId === cardId);
            if (cardIndex !== -1) {
                const card = animeCollection.cards[cardIndex];
                if (card.count > 1) {
                    // Décrémenter le compteur
                    card.count--;
                } else {
                    // Supprimer la carte
                    animeCollection.cards.splice(cardIndex, 1);
                    userCollection.uniqueCards--;
                }
                userCollection.totalCards--;
                cardFound = true;
                break;
            }
        }

        if (!cardFound) {
            return NextResponse.json(
                { success: false, error: 'Carte non trouvée dans la collection' },
                { status: 404 }
            );
        }

        userCollection.lastUpdated = new Date().toISOString();
        writeCollections(data);

        return NextResponse.json({ success: true, data: userCollection });
    } catch (error) {
        console.error('Erreur DELETE collection:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
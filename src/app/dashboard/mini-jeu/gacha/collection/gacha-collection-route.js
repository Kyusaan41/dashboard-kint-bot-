const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { ANIME_CARDS } = require('../data/cards');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'data', 'gacha-collections.json'); // Ce chemin est correct

/**
 * Lit la base de données des collections depuis le fichier JSON.
 * @returns {Promise<object>} Les données de la collection.
 */
async function readCollectionDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si le fichier n'existe pas, on en crée un nouveau avec une structure de base.
        if (error.code === 'ENOENT') {
            console.log('[Gacha Collection] Fichier de collection non trouvé, création d\'un nouveau.');
            const initialData = { collections: [] };
            await writeCollectionDB(initialData);
            return initialData;
        }
        console.error('[Gacha Collection] Erreur de lecture du fichier de collection:', error);
        throw new Error('Impossible de lire la base de données des collections.');
    }
}

/**
 * Écrit les données de collection dans le fichier JSON.
 * @param {object} data - Les données à sauvegarder.
 */
async function writeCollectionDB(data) {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('[Gacha Collection] Erreur d\'écriture dans le fichier de collection:', error);
        throw new Error('Impossible de sauvegarder la base de données des collections.');
    }
}

// Exporter les fonctions pour qu'elles soient utilisables par d'autres modules (comme les commandes)
module.exports.readCollectionDB = readCollectionDB;
module.exports.writeCollectionDB = writeCollectionDB;


// GET /api/gacha/collection/:userId - Récupère la collection d'un utilisateur
router.get('/collection/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID manquant.' });
    }

    try {
        const db = await readCollectionDB();
        const userEntry = db.collections.find(u => u.userId === userId);

        if (!userEntry) {
            return res.status(404).json({ success: false, error: 'Collection non trouvée pour cet utilisateur.' });
        }

        // ✨ Enrichir les données avec les informations complètes des cartes
        const enrichedCollections = userEntry.collections.map(animeCollection => {
            const enrichedCards = animeCollection.cards.map(card => {
                const cardInfo = ANIME_CARDS.find(c => c.id === card.cardId);
                return {
                    ...card,
                    cardInfo: cardInfo || null // Ajoute les détails de la carte
                };
            }).filter(c => c.cardInfo); // Filtrer les cartes qui n'existent plus
            return { ...animeCollection, cards: enrichedCards };
        });

        const enrichedUserEntry = { ...userEntry, collections: enrichedCollections };

        res.status(200).json({ success: true, data: enrichedUserEntry });

    } catch (error) {
        console.error(`[Gacha Collection] Erreur serveur lors de la récupération de la collection pour ${userId}:`, error);
        res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
    }
});

// POST /api/gacha/collection - Ajoute une carte à la collection d'un utilisateur
router.post('/collection', async (req, res) => {
    const { userId, username, cardId, anime } = req.body;

    if (!userId || !username || !cardId || !anime) {
        return res.status(400).json({ success: false, error: 'Données manquantes (userId, username, cardId, anime).' });
    }

    try {
        const db = await readCollectionDB();

        // 1. Trouver ou créer l'utilisateur
        let userEntry = db.collections.find(u => u.userId === userId);
        if (!userEntry) {
            userEntry = {
                userId,
                username,
                collections: [],
                totalCards: 0,
                uniqueCards: 0,
                lastUpdated: new Date().toISOString()
            };
            db.collections.push(userEntry);
        }
        userEntry.username = username; // Mettre à jour le pseudo au cas où il aurait changé

        // 2. Trouver ou créer la collection pour l'anime
        let animeCollection = userEntry.collections.find(c => c.anime === anime);
        if (!animeCollection) {
            animeCollection = { anime, cards: [] };
            userEntry.collections.push(animeCollection);
        }

        // 3. Trouver ou créer la carte et gérer les doublons
        let cardEntry = animeCollection.cards.find(c => c.cardId === cardId);
        if (cardEntry) {
            // C'est un doublon, on incrémente le compteur
            cardEntry.count += 1;
            cardEntry.obtainedAt = new Date().toISOString();
            console.log(`[Gacha Collection] Doublon ajouté pour ${username}: ${cardId} (x${cardEntry.count})`);
        } else {
            // C'est une nouvelle carte unique
            cardEntry = {
                cardId,
                count: 1,
                obtainedAt: new Date().toISOString()
            };
            animeCollection.cards.push(cardEntry);
            userEntry.uniqueCards += 1; // Incrémenter les cartes uniques
            console.log(`[Gacha Collection] Nouvelle carte ajoutée pour ${username}: ${cardId}`);
        }

        // 4. Mettre à jour les statistiques globales de l'utilisateur
        userEntry.totalCards += 1;
        userEntry.lastUpdated = new Date().toISOString();

        // 5. Sauvegarder les modifications
        await writeCollectionDB(db);

        res.status(200).json({ success: true, message: 'Collection mise à jour avec succès.', data: userEntry });

    } catch (error) {
        console.error('[Gacha Collection] Erreur serveur lors de l\'ajout de la carte:', error);
        res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
    }
});

// POST /api/gacha/trade - Gère un échange de cartes entre deux utilisateurs
router.post('/trade', async (req, res) => {
    const { fromUserId, toUserId, fromCardId, toCardId } = req.body;

    if (!fromUserId || !toUserId || !fromCardId || !toCardId) {
        return res.status(400).json({ success: false, error: 'Données de trade manquantes.' });
    }

    try {
        const db = await readCollectionDB();

        const fromUserEntry = db.collections.find(u => u.userId === fromUserId);
        const toUserEntry = db.collections.find(u => u.userId === toUserId);

        if (!fromUserEntry || !toUserEntry) {
            return res.status(404).json({ success: false, error: 'Un des utilisateurs n\'a pas de collection.' });
        }

        // Helper pour trouver et décrémenter une carte
        const findAndDecrementCard = (userEntry, cardId) => {
            for (const animeCollection of userEntry.collections) {
                const cardEntry = animeCollection.cards.find(c => c.cardId === cardId);
                if (cardEntry) {
                    if (cardEntry.count > 0) {
                        cardEntry.count -= 1;
                        userEntry.totalCards -= 1;
                        if (cardEntry.count === 0) {
                            userEntry.uniqueCards -= 1;
                            // Supprimer la carte si le compteur est à 0
                            animeCollection.cards = animeCollection.cards.filter(c => c.cardId !== cardId);
                        }
                        return true;
                    }
                }
            }
            return false;
        };

        // Helper pour trouver et incrémenter une carte
        const findAndIncrementCard = (userEntry, cardId, cardAnime) => {
            let animeCollection = userEntry.collections.find(c => c.anime === cardAnime);
            if (!animeCollection) {
                animeCollection = { anime: cardAnime, cards: [] };
                userEntry.collections.push(animeCollection);
            }

            let cardEntry = animeCollection.cards.find(c => c.cardId === cardId);
            if (cardEntry) {
                cardEntry.count += 1;
            } else {
                animeCollection.cards.push({ cardId, count: 1, obtainedAt: new Date().toISOString() });
                userEntry.uniqueCards += 1;
            }
            userEntry.totalCards += 1;
        };

        // Vérifier que les deux utilisateurs ont les cartes
        const fromUserHasCard = fromUserEntry.collections.flatMap(c => c.cards).some(c => c.cardId === fromCardId && c.count > 0);
        const toUserHasCard = toUserEntry.collections.flatMap(c => c.cards).some(c => c.cardId === toCardId && c.count > 0);

        if (!fromUserHasCard || !toUserHasCard) {
            return res.status(400).json({ success: false, error: 'Un des utilisateurs ne possède plus la carte pour l\'échange.' });
        }

        // Retirer les cartes
        findAndDecrementCard(fromUserEntry, fromCardId);
        findAndDecrementCard(toUserEntry, toCardId);

        // Ajouter les cartes
        const fromCardInfo = ANIME_CARDS.find(c => c.id === fromCardId); // Utilise la liste locale
        const toCardInfo = ANIME_CARDS.find(c => c.id === toCardId); // Utilise la liste locale

        findAndIncrementCard(fromUserEntry, toCardId, toCardInfo.anime);
        findAndIncrementCard(toUserEntry, fromCardId, fromCardInfo.anime);

        // Mettre à jour les timestamps
        fromUserEntry.lastUpdated = new Date().toISOString();
        toUserEntry.lastUpdated = new Date().toISOString();

        await writeCollectionDB(db);

        res.status(200).json({ success: true, message: 'Échange effectué avec succès.' });

    } catch (error) {
        console.error('[Gacha Trade] Erreur serveur lors de l\'échange:', error);
        res.status(500).json({ success: false, error: 'Erreur interne du serveur lors de l\'échange.' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch'); // Assurez-vous que node-fetch est installé

// URL de l'API de monnaie de votre bot
const CURRENCY_API_URL = 'http://localhost:20007/api/currency';

const STATS_FILE = path.join(__dirname, '../casino_stats.json');

/**
 * Lit les données des statistiques depuis le fichier.
 * @returns {Promise<Object>} Les données des statistiques.
 */
async function readStatsData() {
    try {
        const data = await fs.readFile(STATS_FILE, 'utf8');
        const stats = JSON.parse(data);
        // Assurer que les joueurs ont des valeurs par défaut pour level/xp
        stats.players = stats.players.map(p => ({
            ...p,
            level: p.level || 1,
            xp: p.xp || 0,
            // ✨ NOUVEAU: Garder une trace des récompenses réclamées
            claimedRewards: p.claimedRewards || [],
        }));
        return stats;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si le fichier n'existe pas, créer avec valeur par défaut
            const defaultData = { players: [] };
            await writeStatsData(defaultData);
            return defaultData;
        }
        throw error;
    }
}

/**
 * Écrit les données des statistiques dans le fichier.
 * @param {Object} data - Les données à écrire.
 */
async function writeStatsData(data) {
    await fs.writeFile(STATS_FILE, JSON.stringify(data, null, 2));
}

// GET - Récupérer les statistiques (avec type optionnel)
router.get('/stats', async (req, res) => {
    try {
        const { type } = req.query;
        const statsData = await readStatsData();
        
        if (!type) {
            // Retourner toutes les données
            return res.json(statsData);
        }

        // Filtrer et trier selon le type demandé
        let sortedPlayers = [...statsData.players];
        
        switch (type) {
            case 'biggestWin':
                sortedPlayers = sortedPlayers
                    .filter(p => p.biggestWin > 0)
                    .sort((a, b) => b.biggestWin - a.biggestWin)
                    .slice(0, 10);
                break;
            case 'level':
                sortedPlayers = sortedPlayers
                    .filter(p => p.level > 1 || p.xp > 0)
                    .sort((a, b) => b.level - a.level || b.xp - a.xp)
                    .slice(0, 10);
                break;
            
            case 'winCount':
                sortedPlayers = sortedPlayers
                    .filter(p => p.winCount > 0)
                    .sort((a, b) => b.winCount - a.winCount)
                    .slice(0, 10);
                break;
            
            case 'totalWins':
                sortedPlayers = sortedPlayers
                    .filter(p => p.totalWins > 0)
                    .sort((a, b) => b.totalWins - a.totalWins)
                    .slice(0, 10);
                break;
            
            default:
                return res.status(400).json({ error: 'Type invalide. Utilisez: biggestWin, winCount, totalWins, ou level' });
        }
        
        res.json({ players: sortedPlayers });
    } catch (error) {
        console.error('Erreur GET stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// ✨ NOUVEAU: POST - Ajouter de l'XP et gérer les niveaux
router.post('/xp', async (req, res) => {
    try {
        const { username, xpToAdd } = req.body;

        if (!username || typeof xpToAdd !== 'number' || xpToAdd <= 0) {
            return res.status(400).json({ error: 'Données invalides pour l\'ajout d\'XP' });
        }

        const statsData = await readStatsData();
        const playerIndex = statsData.players.findIndex(p => p.username === username);

        let player;
        if (playerIndex !== -1) {
            player = statsData.players[playerIndex];
        } else {
            // Créer un nouveau joueur s'il n'existe pas
            player = {
                username,
                biggestWin: 0,
                winCount: 0,
                totalWins: 0,
                jackpotCount: 0,
                level: 1,
                xp: 0,
                // ✨ NOUVEAU
                claimedRewards: [],
                lastWinDate: new Date().toISOString()
            };
            statsData.players.push(player);
        }

        player.xp += xpToAdd;

        let leveledUp = false;
        let xpForNextLevel = Math.floor(1000 * Math.pow(player.level, 1.5));

        // Boucle pour gérer les montées de plusieurs niveaux d'un coup
        while (player.xp >= xpForNextLevel) {
            player.xp -= xpForNextLevel;
            player.level += 1;
            leveledUp = true;
            xpForNextLevel = Math.floor(1000 * Math.pow(player.level, 1.5));
            console.log(`[CASINO LEVEL UP] ${username} a atteint le niveau ${player.level}!`);
        }

        await writeStatsData(statsData);

        res.json({
            success: true,
            username,
            level: player.level,
            xp: player.xp,
            xpForNextLevel,
            leveledUp,
        });

    } catch (error) {
        console.error('Erreur POST /xp:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout d\'XP' });
    }
});

// ✨ NOUVEAU: Route pour réclamer les récompenses de niveau
router.post('/claim-reward', async (req, res) => {
    try {
        const { username, level } = req.body;

        if (!username || typeof level !== 'number' || level <= 1) {
            return res.status(400).json({ error: 'Données invalides pour la réclamation.' });
        }

        const statsData = await readStatsData();
        const player = statsData.players.find(p => p.username === username);

        if (!player) {
            return res.status(404).json({ error: 'Joueur non trouvé.' });
        }

        // Vérifier si le joueur a le niveau requis
        if (player.level < level) {
            return res.status(403).json({ error: 'Niveau insuffisant pour réclamer cette récompense.' });
        }

        // Vérifier si la récompense a déjà été réclamée
        if (player.claimedRewards.includes(level)) {
            return res.status(409).json({ error: 'Cette récompense a déjà été réclamée.' });
        }

        // Définir les récompenses ici
        const rewards = {
            2: { type: 'currency', amount: 500 },
            3: { type: 'currency', amount: 1000 },
            4: { type: 'currency', amount: 1500 },
            5: { type: 'currency', amount: 3000 }, // + Free spins (à gérer côté client/bot)
            10: { type: 'currency', amount: 5000 },
            15: { type: 'currency', amount: 10000 },
            20: { type: 'currency', amount: 15000 },
            25: { type: 'currency', amount: 25000 },
        };

        const reward = rewards[level];

        if (!reward) {
            return res.status(404).json({ error: 'Aucune récompense pour ce niveau.' });
        }

        // Donner la récompense (ici, de la monnaie)
        if (reward.type === 'currency') {
            // Il faut l'ID discord de l'utilisateur pour créditer la monnaie
            // Pour l'instant, on simule. Il faudra une table de correspondance username -> userId
            // const userId = getUserIdFromUsername(username);
            // await fetch(`${CURRENCY_API_URL}/${userId}`, { method: 'POST', ... });
            console.log(`[REWARD] ${username} a réclamé ${reward.amount} pièces pour le niveau ${level}. (Simulation)`);
        }

        // Marquer comme réclamée
        player.claimedRewards.push(level);
        await writeStatsData(statsData);

        res.json({
            success: true,
            message: `Récompense pour le niveau ${level} réclamée avec succès !`,
        });

    } catch (error) {
        console.error('Erreur POST /claim-reward:', error);
        res.status(500).json({ error: 'Erreur lors de la réclamation de la récompense.' });
    }
});

// POST - Enregistrer un gain
router.post('/stats', async (req, res) => {
    try {
        const { username, amount, isJackpot } = req.body;

        if (!username || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Données invalides' });
        }

        const statsData = await readStatsData();
        
        // Chercher si le joueur existe déjà
        const playerIndex = statsData.players.findIndex(p => p.username === username);
        
        if (playerIndex !== -1) {
            // Le joueur existe, mettre à jour ses stats
            const player = statsData.players[playerIndex];
            
            // Mettre à jour le plus gros gain si nécessaire
            if (amount > player.biggestWin) {
                player.biggestWin = amount;
            }
            
            // Incrémenter le nombre de victoires
            player.winCount = (player.winCount || 0) + 1;
            
            // Ajouter au total des gains
            player.totalWins = (player.totalWins || 0) + amount;
            
            // Incrémenter le nombre de jackpots si c'est un jackpot
            if (isJackpot) {
                player.jackpotCount = (player.jackpotCount || 0) + 1;
            }
            
            // Mettre à jour la date
            player.lastWinDate = new Date().toISOString();
            
            console.log(`[CASINO STATS] Stats mises à jour pour ${username}: +${amount} (Total: ${player.totalWins}, Victoires: ${player.winCount}, Jackpots: ${player.jackpotCount || 0})`);
        } else {
            // Nouveau joueur
            const newPlayer = {
                username,
                biggestWin: amount,
                winCount: 1,
                level: 1,
                xp: 0,
                totalWins: amount,
                jackpotCount: isJackpot ? 1 : 0,
                lastWinDate: new Date().toISOString()
                // claimedRewards est déjà initialisé par readStatsData
            };
            
            statsData.players.push(newPlayer);
            console.log(`[CASINO STATS] Nouveau joueur ajouté: ${username} avec ${amount} (Jackpot: ${isJackpot})`);
        }
        
        await writeStatsData(statsData);

        res.json({ 
            success: true,
            username,
            amount
        });
    } catch (error) {
        console.error('Erreur POST stats:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement du gain' });
    }
});

// DELETE - Réinitialiser les statistiques (optionnel, pour admin)
router.delete('/stats', async (req, res) => {
    try {
        const defaultData = { players: [] };
        await writeStatsData(defaultData);
        
        console.log('[CASINO STATS] Statistiques réinitialisées');
        res.json({ success: true, message: 'Statistiques réinitialisées' });
    } catch (error) {
        console.error('Erreur DELETE stats:', error);
        res.status(500).json({ error: 'Erreur lors de la réinitialisation des statistiques' });
    }
});

module.exports = router;
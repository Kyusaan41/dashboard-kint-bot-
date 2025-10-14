const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const STATS_FILE = path.join(__dirname, '../casino_stats.json');

/**
 * Lit les données des statistiques depuis le fichier.
 * @returns {Promise<Object>} Les données des statistiques.
 */
async function readStatsData() {
    try {
        const data = await fs.readFile(STATS_FILE, 'utf8');
        return JSON.parse(data);
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
                return res.status(400).json({ error: 'Type invalide. Utilisez: biggestWin, winCount, ou totalWins' });
        }
        
        res.json({ players: sortedPlayers });
    } catch (error) {
        console.error('Erreur GET stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
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
                totalWins: amount,
                jackpotCount: isJackpot ? 1 : 0,
                lastWinDate: new Date().toISOString()
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
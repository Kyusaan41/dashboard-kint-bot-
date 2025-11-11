const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const JACKPOT_TOKENS_FILE = path.join(__dirname, '../casino_jackpot.json');
const DEFAULT_JACKPOT_TOKENS = 10000;

/**
 * Lit les données du jackpot depuis le fichier.
 * @returns {Promise<Object>} Les données du jackpot.
 */
async function readJackpotData() {
    try {
        const data = await fs.readFile(JACKPOT_TOKENS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si le fichier n'existe pas, créer avec valeur par défaut
            const defaultData = { 
                amount: DEFAULT_JACKPOT_TOKENS,
                totalWins: 0
            };
            await writeJackpotData(defaultData);
            return defaultData;
        }
        throw error;
    }
}

/**
 * Écrit les données du jackpot dans le fichier.
 * @param {Object} data - Les données à écrire.
 */
async function writeJackpotData(data) {
    await fs.writeFile(JACKPOT_TOKENS_FILE, JSON.stringify(data, null, 2));
}

// GET - Récupérer le jackpot actuel
router.get('/jackpot', async (req, res) => {
    try {
        const jackpotData = await readJackpotData();
        res.json(jackpotData);
    } catch (error) {
        console.error('Erreur GET jackpot:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du jackpot' });
    }
});

// POST - Augmenter le jackpot (quand un joueur perd)
router.post('/jackpot/increase', async (req, res) => {
    try {
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Montant invalide' });
        }

        const jackpotData = await readJackpotData();
        jackpotData.amount += amount;
        await writeJackpotData(jackpotData);

        res.json({ 
            success: true, 
            newAmount: jackpotData.amount 
        });
    } catch (error) {
        console.error('Erreur POST jackpot:', error);
        res.status(500).json({ error: 'Erreur lors de l\'augmentation du jackpot' });
    }
});

// POST - Réinitialiser le jackpot (quand quelqu'un gagne)
router.post('/jackpot/reset', async (req, res) => {
    try {
        const { winner, winAmount } = req.body;

        const jackpotData = await readJackpotData();
        const oldAmount = jackpotData.amount;

        // Réinitialiser le jackpot
        jackpotData.amount = DEFAULT_JACKPOT_TOKENS;
        jackpotData.lastWinner = winner;
        jackpotData.lastWinDate = new Date().toISOString();
        jackpotData.totalWins = (jackpotData.totalWins || 0) + 1;

        await writeJackpotData(jackpotData);

        res.json({ 
            success: true, 
            oldAmount,
            newAmount: jackpotData.amount,
            winner,
            totalWins: jackpotData.totalWins
        });
    } catch (error) {
        console.error('Erreur POST jackpot reset:', error);
        res.status(500).json({ error: 'Erreur lors de la réinitialisation du jackpot' });
    }
});

module.exports = router;

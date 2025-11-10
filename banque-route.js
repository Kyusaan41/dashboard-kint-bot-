
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Chemin vers le fichier de la banque
const BANQUE_FILE = path.join(__dirname, '..', 'banque.json');

// Système de verrouillage simple pour éviter la corruption du JSON
let isWriting = false;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function waitForLock() {
    while (isWriting) await delay(50);
}

/**
 * Lit le solde de la banque depuis le fichier.
 * @returns {Promise<number>} Le solde de la banque.
 */
async function readBanqueBalance() {
    try {
        const data = await fs.readFile(BANQUE_FILE, 'utf8');
        // Si le fichier est vide, on initialise
        if (data.trim() === '') {
            await writeBanqueBalance(0);
            return 0;
        }
        const banque = JSON.parse(data);
        return banque.balance || 0;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si le fichier n'existe pas, on le crée avec un solde de 0
            await writeBanqueBalance(0);
            return 0;
        }
        // Gérer les erreurs de parsing JSON pour les fichiers corrompus
        if (error instanceof SyntaxError) {
            console.error('[BANQUE] Fichier JSON corrompu. Réinitialisation du solde à 0.', error);
            await writeBanqueBalance(0);
            return 0;
        }
        console.error('[BANQUE] Erreur lecture:', error);
        throw error;
    }
}

/**
 * Écrit le solde de la banque dans le fichier.
 * @param {number} balance - Le nouveau solde à écrire.
 */
async function writeBanqueBalance(balance) {
    await waitForLock();
    isWriting = true;
    try {
        const data = { balance: balance, lastUpdate: new Date().toISOString() };
        await fs.writeFile(BANQUE_FILE, JSON.stringify(data, null, 2));
    } finally {
        isWriting = false;
    }
}

/**
 * @api {post} /api/banque/add Ajouter de l'argent à la banque
 * @apiName AddToBanque
 * @apiGroup Banque
 *
 * @apiBody {Number} amount Montant à ajouter.
 *
 * @apiSuccess {Boolean} success Opération réussie.
 * @apiSuccess {Number} newBalance Nouveau solde de la banque.
 */
router.post('/add', async (req, res) => {
    try {
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Montant invalide.' });
        }

        const currentBalance = await readBanqueBalance();
        const newBalance = currentBalance + amount;
        await writeBanqueBalance(newBalance);

        console.log(`[BANQUE] ${amount} pièces ajoutées. Nouveau solde: ${newBalance}`);

        res.json({ success: true, newBalance: newBalance });

    } catch (error) {
        console.error('Erreur POST /banque/add:', error);
        res.status(500).json({ error: 'Erreur interne lors de la mise à jour de la banque.' });
    }
});

/**
 * @api {get} /api/banque/balance Récupérer le solde de la banque
 * @apiName GetBanqueBalance
 * @apiGroup Banque
 *
 * @apiSuccess {Number} balance Solde actuel de la banque.
 */
router.get('/balance', async (req, res) => {
    try {
        const balance = await readBanqueBalance();
        res.json({ balance: balance });
    } catch (error) {
        console.error('Erreur GET /banque/balance:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du solde de la banque.' });
    }
});

module.exports = router;

// Route pour le calendrier de l'Avent côté bot
// À placer dans le dossier routes de votre bot

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Configuration des récompenses du calendrier de l'Avent
const ADVENT_REWARDS = [
  { day: 1, type: 'currency', amount: 100, name: 'Pièces d\'or', description: '100 pièces scintillantes' },
  { day: 2, type: 'tokens', amount: 50, name: 'Jetons magiques', description: '50 jetons pour le casino' },
  { day: 3, type: 'orbs', amount: 5, name: 'Orbes mystiques', description: '5 orbes pour les gachas' },
  { day: 4, type: 'currency', amount: 150, name: 'Pièces d\'or', description: '150 pièces scintillantes' },
  { day: 5, type: 'tokens', amount: 75, name: 'Jetons magiques', description: '75 jetons pour le casino' },
  { day: 6, type: 'orbs', amount: 7, name: 'Orbes mystiques', description: '7 orbes pour les gachas' },
  { day: 7, type: 'currency', amount: 200, name: 'Pièces d\'or', description: '200 pièces scintillantes' },
  { day: 8, type: 'tokens', amount: 100, name: 'Jetons magiques', description: '100 jetons pour le casino' },
  { day: 9, type: 'orbs', amount: 10, name: 'Orbes mystiques', description: '10 orbes pour les gachas' },
  { day: 10, type: 'currency', amount: 250, name: 'Pièces d\'or', description: '250 pièces scintillantes' },
  { day: 11, type: 'tokens', amount: 125, name: 'Jetons magiques', description: '125 jetons pour le casino' },
  { day: 12, type: 'orbs', amount: 12, name: 'Orbes mystiques', description: '12 orbes pour les gachas' },
  { day: 13, type: 'currency', amount: 300, name: 'Pièces d\'or', description: '300 pièces scintillantes' },
  { day: 14, type: 'tokens', amount: 150, name: 'Jetons magiques', description: '150 jetons pour le casino' },
  { day: 15, type: 'orbs', amount: 15, name: 'Orbes mystiques', description: '15 orbes pour les gachas' },
  { day: 16, type: 'currency', amount: 350, name: 'Pièces d\'or', description: '350 pièces scintillantes' },
  { day: 17, type: 'tokens', amount: 175, name: 'Jetons magiques', description: '175 jetons pour le casino' },
  { day: 18, type: 'orbs', amount: 18, name: 'Orbes mystiques', description: '18 orbes pour les gachas' },
  { day: 19, type: 'currency', amount: 400, name: 'Pièces d\'or', description: '400 pièces scintillantes' },
  { day: 20, type: 'tokens', amount: 200, name: 'Jetons magiques', description: '200 jetons pour le casino' },
  { day: 21, type: 'orbs', amount: 20, name: 'Orbes mystiques', description: '20 orbes pour les gachas' },
  { day: 22, type: 'currency', amount: 500, name: 'Pièces d\'or', description: '500 pièces scintillantes' },
  { day: 23, type: 'tokens', amount: 250, name: 'Jetons magiques', description: '250 jetons pour le casino' },
  { day: 24, type: 'orbs', amount: 25, name: 'Orbes mystiques', description: '25 orbes pour les gachas + bonus spécial' },
];

const ADVENT_DATA_FILE = path.join(__dirname, '..', 'data', 'advent-calendar-bot.json');
const USER_TOKENS_FILE = path.join(__dirname, '..', 'data', 'user-tokens.json');
const USER_JETONS_FILE = path.join(__dirname, '..', 'data', 'user-jetons.json');

function isChristmasPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  return now >= new Date(year, 11, 1) && now <= new Date(year, 11, 24, 23, 59, 59);
}

function getCurrentDay() {
  return Math.min(24, Math.max(1, new Date().getDate()));
}

function readFileOrInit(file, defaultValue) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return defaultValue;
  }
}

const readAdventData = () => readFileOrInit(ADVENT_DATA_FILE, {});
const writeAdventData = data => fs.writeFileSync(ADVENT_DATA_FILE, JSON.stringify(data, null, 2));

const readUserTokensData = () => readFileOrInit(USER_TOKENS_FILE, { users: {} });
const writeUserTokensData = data => fs.writeFileSync(USER_TOKENS_FILE, JSON.stringify(data, null, 2));

const readUserJetonsData = () => readFileOrInit(USER_JETONS_FILE, {});
const writeUserJetonsData = data => fs.writeFileSync(USER_JETONS_FILE, JSON.stringify(data, null, 2));

// --- ROUTES ---

router.get('/advent-calendar/status', (req, res) => {
  if (!isChristmasPeriod()) {
    return res.json({ active: false, message: 'Le calendrier de l\'Avent n\'est disponible que du 1er au 24 décembre' });
  }
  const currentDay = getCurrentDay();
  res.json({
    active: true,
    currentDay,
    calendar: ADVENT_REWARDS.map(r => ({ ...r, unlocked: r.day <= currentDay, claimed: false }))
  });
});

router.get('/advent-calendar/:userId/claimed', (req, res) => {
  const { userId } = req.params;
  const data = readAdventData();
  res.json({ claimed: data[userId] || [] });
});

router.post('/advent-calendar/:userId/claim', async (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.body;

    if (!day || day < 1 || day > 24) {
      return res.status(400).json({ error: 'Jour invalide' });
    }

    if (!isChristmasPeriod()) {
      return res.status(400).json({ error: 'Calendrier non disponible' });
    }

    const currentDay = getCurrentDay();
    if (day > currentDay) {
      return res.status(400).json({ error: 'Ce jour n\'est pas encore débloqué' });
    }

    const data = readAdventData();
    if (data[userId]?.includes(day)) {
      return res.status(400).json({ error: 'Récompense déjà réclamée' });
    }

    const reward = ADVENT_REWARDS.find(r => r.day === day);
    if (!reward) return res.status(404).json({ error: 'Récompense introuvable' });

    let success = false;

    // --- APPLY REWARD ---
    if (reward.type === 'currency') {
      const jetons = readUserJetonsData();

      // Correction: les pièces sont stockées directement comme nombre, pas dans un objet balance
      jetons[userId] = (jetons[userId] || 0) + reward.amount;

      writeUserJetonsData(jetons);
      console.log(`[ADVENT-CALENDAR-BOT] Successfully added ${reward.amount} coins to user ${userId}. New balance: ${jetons[userId]}`);
      success = true;
    }

    if (reward.type === 'tokens') {
      const tokens = readUserTokensData();

      if (!tokens.users[userId]) tokens.users[userId] = 0;
      tokens.users[userId] += reward.amount;

      writeUserTokensData(tokens);
      console.log(`[ADVENT-CALENDAR-BOT] Successfully added ${reward.amount} tokens to user ${userId}. New balance: ${tokens.users[userId]}`);
      success = true;
    }

    if (reward.type === 'orbs') {
      try {
        const response = await fetch('http://193.70.34.25:20007/api/gacha/wishes/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, amount: reward.amount })
        });

        if (response.ok) {
          console.log(`[ADVENT-CALENDAR-BOT] Successfully added ${reward.amount} orbs to user ${userId}`);
          success = true;
        } else {
          console.error(`[ADVENT-CALENDAR-BOT] Failed to add orbs via gacha API:`, response.status);
          success = false;
        }
      } catch (error) {
        console.error('[ADVENT-CALENDAR-BOT] Error adding orbs via gacha API:', error);
        success = false;
      }
    }

    if (!success) {
      return res.status(500).json({ error: 'Erreur lors de la distribution de la récompense' });
    }

    if (!data[userId]) data[userId] = [];
    data[userId].push(day);
    writeAdventData(data);

    console.log(`[ADVENT-CALENDAR-BOT] Successfully claimed reward for day ${day} by user ${userId}`);

    res.json({
      success: true,
      message: `Récompense du jour ${day} réclamée avec succès !`,
      reward
    });

  } catch (error) {
    console.error('[ADVENT-CALENDAR-BOT] Claim error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour obtenir le solde de pièces d'un utilisateur
router.get('/currency/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const jetons = readUserJetonsData();
    const balance = jetons[userId] || 0;

    res.json({
      balance: balance,
      lastBonus: null // Peut être ajouté plus tard si nécessaire
    });
  } catch (error) {
    console.error('[CURRENCY-API] Error getting user balance:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour mettre à jour le solde de pièces d'un utilisateur
router.post('/currency/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { coins } = req.body;

    if (typeof coins !== 'number') {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const jetons = readUserJetonsData();
    jetons[userId] = coins; // Définit le solde exact
    writeUserJetonsData(jetons);

    console.log(`[CURRENCY-API] Updated balance for user ${userId} to ${coins}`);

    res.json({
      balance: coins,
      lastBonus: null
    });
  } catch (error) {
    console.error('[CURRENCY-API] Error updating user balance:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
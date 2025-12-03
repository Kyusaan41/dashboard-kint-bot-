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

// Fichier de stockage des récompenses réclamées
const ADVENT_DATA_FILE = path.join(__dirname, '..', 'data', 'advent-calendar-bot.json');

// Fonction pour vérifier si c'est la période de Noël
function isChristmasPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 11, 1); // 1er décembre
  const end = new Date(year, 11, 24, 23, 59, 59); // 24 décembre 23h59

  return now >= start && now <= end;
}

// Fonction pour obtenir le jour actuel de décembre (1-24)
function getCurrentDay() {
  const now = new Date();
  return Math.min(24, Math.max(1, now.getDate()));
}

// Fonction pour lire les données du calendrier
function readAdventData() {
  try {
    if (!fs.existsSync(ADVENT_DATA_FILE)) {
      // Créer le fichier s'il n'existe pas
      const dataDir = path.dirname(ADVENT_DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(ADVENT_DATA_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    const data = fs.readFileSync(ADVENT_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[ADVENT-CALENDAR-BOT] Error reading advent data:', error);
    return {};
  }
}

// Fonction pour écrire les données du calendrier
function writeAdventData(data) {
  try {
    fs.writeFileSync(ADVENT_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[ADVENT-CALENDAR-BOT] Error writing advent data:', error);
  }
}

// Route pour obtenir le statut du calendrier
router.get('/advent-calendar/status', (req, res) => {
  try {
    if (!isChristmasPeriod()) {
      return res.json({
        active: false,
        message: 'Le calendrier de l\'Avent n\'est disponible que du 1er au 24 décembre'
      });
    }

    const currentDay = getCurrentDay();
    const data = readAdventData();

    // Préparer les données du calendrier
    const calendarData = ADVENT_REWARDS.map(reward => ({
      ...reward,
      unlocked: reward.day <= currentDay,
      claimed: false // Sera défini par utilisateur
    }));

    res.json({
      active: true,
      currentDay,
      calendar: calendarData
    });
  } catch (error) {
    console.error('[ADVENT-CALENDAR-BOT] Status error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour obtenir les récompenses réclamées d'un utilisateur
router.get('/advent-calendar/:userId/claimed', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readAdventData();

    res.json({
      claimed: data[userId] || []
    });
  } catch (error) {
    console.error('[ADVENT-CALENDAR-BOT] Get claimed error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour réclamer une récompense
router.post('/advent-calendar/:userId/claim', (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.body;

    if (!day || typeof day !== 'number' || day < 1 || day > 24) {
      return res.status(400).json({ error: 'Jour invalide' });
    }

    // Vérifier si c'est la période de Noël
    if (!isChristmasPeriod()) {
      return res.status(400).json({ error: 'Calendrier non disponible' });
    }

    const currentDay = getCurrentDay();

    // Vérifier si le jour est débloqué
    if (day > currentDay) {
      return res.status(400).json({ error: 'Ce jour n\'est pas encore débloqué' });
    }

    const data = readAdventData();

    // Vérifier si déjà réclamé
    if (data[userId] && data[userId].includes(day)) {
      return res.status(400).json({ error: 'Récompense déjà réclamée' });
    }

    // Trouver la récompense
    const reward = ADVENT_REWARDS.find(r => r.day === day);
    if (!reward) {
      return res.status(404).json({ error: 'Récompense introuvable' });
    }

    // Distribuer la récompense selon son type
    let success = false;

    switch (reward.type) {
      case 'currency':
        // Ajouter des pièces (logique à adapter selon votre système)
        console.log(`[ADVENT-CALENDAR-BOT] Adding ${reward.amount} coins to user ${userId}`);
        success = true; // À remplacer par votre logique réelle
        break;

      case 'tokens':
        // Ajouter des jetons (logique à adapter selon votre système)
        console.log(`[ADVENT-CALENDAR-BOT] Adding ${reward.amount} tokens to user ${userId}`);
        success = true; // À remplacer par votre logique réelle
        break;

      case 'orbs':
        // Ajouter des orbes via l'API gacha wishes
        console.log(`[ADVENT-CALENDAR-BOT] Adding ${reward.amount} orbs to user ${userId}`);
        try {
          const gachaResponse = await fetch('http://localhost:20007/api/gacha/wishes/buy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              amount: reward.amount
            }),
          });

          if (gachaResponse.ok) {
            const gachaData = await gachaResponse.json();
            console.log(`[ADVENT-CALENDAR-BOT] Successfully added orbs:`, gachaData);
            success = true;
          } else {
            console.error(`[ADVENT-CALENDAR-BOT] Failed to add orbs via gacha API:`, gachaResponse.status);
            success = false;
          }
        } catch (gachaError) {
          console.error('[ADVENT-CALENDAR-BOT] Error adding orbs via gacha API:', gachaError);
          success = false;
        }
        break;

      default:
        console.warn(`[ADVENT-CALENDAR-BOT] Unknown reward type: ${reward.type}`);
        return res.status(400).json({ error: 'Type de récompense inconnu' });
    }

    if (!success) {
      return res.status(500).json({ error: 'Erreur lors de la distribution de la récompense' });
    }

    // Marquer la récompense comme réclamée
    if (!data[userId]) {
      data[userId] = [];
    }
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

module.exports = router;
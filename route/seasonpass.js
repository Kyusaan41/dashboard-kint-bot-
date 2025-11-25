const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Fichier de données centralisé
const XP_DASHBOARD_FILE = path.join(__dirname, '../xp-dashboard.json');

// Structure des données par défaut
const DEFAULT_XP_DASHBOARD_DATA = {
  // Points XP de chaque utilisateur
  points: {}, // userId: points

  // Progression Season Pass
  seasonPass: {
    seasons: {
      // Structure: seasonKey: { userId: { claimedTiers: [], vipClaimedTiers: [] } }
    },
    currentSeason: null,
    lastReset: null
  },

  // Orbes de chaque utilisateur
  orbs: {}, // userId: orbsCount

  // Statistiques globales
  stats: {
    totalUsers: 0,
    totalPointsDistributed: 0,
    totalOrbsDistributed: 0,
    lastUpdate: null
  }
};

/**
 * Lit les données du dashboard XP depuis le fichier.
 */
async function readXpDashboardData() {
    try {
        const data = await fs.readFile(XP_DASHBOARD_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeXpDashboardData(DEFAULT_XP_DASHBOARD_DATA);
            return DEFAULT_XP_DASHBOARD_DATA;
        }
        throw error;
    }
}

/**
 * Écrit les données du dashboard XP dans le fichier.
 */
async function writeXpDashboardData(data) {
    data.stats.lastUpdate = new Date().toISOString();
    await fs.writeFile(XP_DASHBOARD_FILE, JSON.stringify(data, null, 2));
}

/**
 * Met à jour les points d'un utilisateur.
 */
async function updateUserPoints(userId, pointsToAdd) {
    const data = await readXpDashboardData();
    data.points[userId] = (data.points[userId] || 0) + pointsToAdd;
    data.stats.totalPointsDistributed += pointsToAdd;
    await writeXpDashboardData(data);
    return data.points[userId];
}

/**
 * Obtient la saison actuelle basée sur la date.
 */
function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  let seasonName = '';
  let startMonth = 0;
  let endMonth = 0;

  if (month >= 12 || month <= 2) {
    seasonName = 'hiver';
    startMonth = month >= 12 ? 12 : 12;
    endMonth = month <= 2 ? 2 : 2;
  } else if (month >= 3 && month <= 5) {
    seasonName = 'printemps';
    startMonth = 3;
    endMonth = 5;
  } else if (month >= 6 && month <= 8) {
    seasonName = 'ete';
    startMonth = 6;
    endMonth = 8;
  } else {
    seasonName = 'automne';
    startMonth = 9;
    endMonth = 11;
  }

  const seasonStart = new Date(year, startMonth - 1, 1);
  const seasonEnd = new Date(year, endMonth, new Date(year, endMonth + 1, 0).getDate(), 23, 59, 59);

  return {
    name: seasonName,
    year: year,
    seasonKey: `${seasonName}_${year}`,
    startDate: seasonStart.toISOString(),
    endDate: seasonEnd.toISOString()
  };
}

/**
 * Vérifie si on doit reset la saison.
 */
function shouldResetSeason() {
  const currentSeason = getCurrentSeason();
  const now = new Date();
  const seasonEnd = new Date(currentSeason.endDate);

  return now > seasonEnd;
}

// GET /api/season-pass/current-season
router.get('/current-season', async (req, res) => {
    try {
        const currentSeason = getCurrentSeason();
        const needsReset = shouldResetSeason();

        res.json({
            ...currentSeason,
            needsReset
        });
    } catch (error) {
        console.error('Erreur GET current-season:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la saison actuelle' });
    }
});

// GET /api/season-pass/:userId/progress
router.get('/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await readXpDashboardData();
        const currentSeason = getCurrentSeason();

        // Récupérer la progression de l'utilisateur pour la saison actuelle
        const userProgress = data.seasonPass.seasons[currentSeason.seasonKey]?.[userId] || {
            claimedTiers: [],
            vipClaimedTiers: []
        };

        // Inclure les points actuels
        const currentPoints = data.points[userId] || 0;

        res.json({
            seasonId: currentSeason.seasonKey,
            currentPoints,
            ...userProgress
        });
    } catch (error) {
        console.error('Erreur GET progress:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la progression' });
    }
});

// POST /api/season-pass/:userId/claim
router.post('/:userId/claim', async (req, res) => {
    try {
        const { userId } = req.params;
        const { tierId, isVipReward } = req.body;

        if (!tierId) {
            return res.status(400).json({ error: 'tierId requis' });
        }

        const data = await readXpDashboardData();
        const currentSeason = getCurrentSeason();
        const seasonKey = currentSeason.seasonKey;

        // Initialiser la saison si elle n'existe pas
        if (!data.seasonPass.seasons[seasonKey]) {
            data.seasonPass.seasons[seasonKey] = {};
        }

        // Initialiser l'utilisateur si il n'existe pas
        if (!data.seasonPass.seasons[seasonKey][userId]) {
            data.seasonPass.seasons[seasonKey][userId] = {
                claimedTiers: [],
                vipClaimedTiers: []
            };
        }

        const userProgress = data.seasonPass.seasons[seasonKey][userId];

        // Vérifier si déjà réclamé
        if (isVipReward && userProgress.vipClaimedTiers.includes(tierId)) {
            return res.status(400).json({ error: 'Récompense VIP déjà réclamée' });
        }
        if (!isVipReward && userProgress.claimedTiers.includes(tierId)) {
            return res.status(400).json({ error: 'Récompense déjà réclamée' });
        }

        // Ajouter à la liste des réclamés
        if (isVipReward) {
            userProgress.vipClaimedTiers.push(tierId);
        } else {
            userProgress.claimedTiers.push(tierId);
        }

        // Sauvegarder
        await writeXpDashboardData(data);

        console.log(`[SEASON-PASS] ${userId} a réclamé ${isVipReward ? 'VIP' : 'normal'} pour ${tierId}`);

        res.json({
            success: true,
            message: 'Récompense réclamée avec succès',
            claimedTiers: userProgress.claimedTiers,
            vipClaimedTiers: userProgress.vipClaimedTiers
        });

    } catch (error) {
        console.error('Erreur POST claim:', error);
        res.status(500).json({ error: 'Erreur lors de la réclamation de la récompense' });
    }
});

// POST /api/season-pass/:userId/reward
router.post('/:userId/reward', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, amount, itemId } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Type de récompense requis' });
        }

        const data = await readXpDashboardData();
        console.log(`[SEASON-PASS] Distribution de récompense ${type} pour ${userId}:`, { amount, itemId });

        switch (type) {
            case 'orbs':
                if (typeof amount !== 'number' || amount <= 0) {
                    return res.status(400).json({ error: 'Montant d\'orbes invalide' });
                }

                data.orbs[userId] = (data.orbs[userId] || 0) + amount;
                data.stats.totalOrbsDistributed += amount;

                console.log(`[SEASON-PASS] ${userId} reçoit ${amount} orbes (total: ${data.orbs[userId]})`);

                await writeXpDashboardData(data);

                return res.json({
                    success: true,
                    type: 'orbs',
                    amount,
                    newTotal: data.orbs[userId]
                });

            case 'item':
                if (!itemId) {
                    return res.status(400).json({ error: 'itemId requis pour les items' });
                }

                // Ici vous devriez ajouter l'item à l'inventaire de l'utilisateur
                // Pour l'instant, on simule
                console.log(`[SEASON-PASS] ${userId} reçoit l'item ${itemId}`);

                await writeXpDashboardData(data);

                return res.json({
                    success: true,
                    type: 'item',
                    itemId
                });

            default:
                return res.status(400).json({ error: 'Type de récompense non supporté' });
        }

    } catch (error) {
        console.error('Erreur POST reward:', error);
        res.status(500).json({ error: 'Erreur lors de la distribution de la récompense' });
    }
});

// GET /api/season-pass/:userId/orbs
router.get('/:userId/orbs', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await readXpDashboardData();

        res.json({
            userId,
            orbs: data.orbs[userId] || 0
        });
    } catch (error) {
        console.error('Erreur GET orbs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des orbes' });
    }
});

// POST /api/season-pass/reset-season
router.post('/reset-season', async (req, res) => {
    try {
        // Cette route devrait être appelée automatiquement ou par un admin
        // Elle reset les progressions pour la nouvelle saison

        const data = await readXpDashboardData();
        const newSeason = getCurrentSeason();

        // Sauvegarder l'ancienne saison (optionnel)
        if (data.seasonPass.currentSeason && data.seasonPass.currentSeason !== newSeason.seasonKey) {
            console.log(`[SEASON-PASS] Reset de saison: ${data.seasonPass.currentSeason} -> ${newSeason.seasonKey}`);
        }

        // Reset pour la nouvelle saison
        data.seasonPass.seasons[newSeason.seasonKey] = {};
        data.seasonPass.currentSeason = newSeason.seasonKey;
        data.seasonPass.lastReset = new Date().toISOString();

        await writeXpDashboardData(data);

        res.json({
            success: true,
            message: 'Saison reset avec succès',
            newSeason: newSeason.seasonKey,
            resetDate: data.seasonPass.lastReset
        });

    } catch (error) {
        console.error('Erreur POST reset-season:', error);
        res.status(500).json({ error: 'Erreur lors du reset de saison' });
    }
});

// GET /api/season-pass/stats
router.get('/stats', async (req, res) => {
    try {
        const data = await readXpDashboardData();
        const currentSeason = getCurrentSeason();

        // Calculer quelques stats
        const currentSeasonData = data.seasonPass.seasons[currentSeason.seasonKey] || {};
        const totalUsers = Object.keys(currentSeasonData).length;
        const totalClaims = Object.values(currentSeasonData).reduce((sum, user) => {
            return sum + user.claimedTiers.length + user.vipClaimedTiers.length;
        }, 0);

        res.json({
            currentSeason: currentSeason.seasonKey,
            totalUsers,
            totalClaims,
            totalOrbsDistributed: data.stats.totalOrbsDistributed,
            totalPointsDistributed: data.stats.totalPointsDistributed,
            lastReset: data.seasonPass.lastReset,
            lastUpdate: data.stats.lastUpdate
        });

    } catch (error) {
        console.error('Erreur GET stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// ===== NOUVELLES ROUTES POUR GESTION CENTRALISÉE DES POINTS =====

// GET /api/season-pass/points/:userId - Récupérer les points d'un utilisateur
router.get('/points/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await readXpDashboardData();

        res.json({
            userId,
            points: data.points[userId] || 0
        });
    } catch (error) {
        console.error('Erreur GET points:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des points' });
    }
});

// POST /api/season-pass/points/:userId - Ajouter/retirer des points (pour casino, etc.)
router.post('/points/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, source = 'unknown' } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ error: 'Montant invalide' });
        }

        const newPoints = await updateUserPoints(userId, amount);

        console.log(`[XP-DASHBOARD] ${userId} ${amount > 0 ? 'gagne' : 'perd'} ${Math.abs(amount)} points (${source}) - Total: ${newPoints}`);

        res.json({
            success: true,
            userId,
            pointsAdded: amount,
            newTotal: newPoints,
            source
        });

    } catch (error) {
        console.error('Erreur POST points:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des points' });
    }
});

// GET /api/season-pass/leaderboard - Classement par points
router.get('/leaderboard', async (req, res) => {
    try {
        const data = await readXpDashboardData();

        // Trier les utilisateurs par points décroissants
        const leaderboard = Object.entries(data.points)
            .map(([userId, points]) => ({ userId, points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 50); // Top 50

        res.json({
            leaderboard,
            totalUsers: Object.keys(data.points).length,
            lastUpdate: data.stats.lastUpdate
        });

    } catch (error) {
        console.error('Erreur GET leaderboard:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du classement' });
    }
});

// GET /api/season-pass/dashboard/:userId - Récupérer toutes les données dashboard d'un utilisateur
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await readXpDashboardData();
        const currentSeason = getCurrentSeason();

        // Récupérer toutes les données pertinentes
        const userData = {
            userId,
            points: data.points[userId] || 0,
            orbs: data.orbs[userId] || 0,
            seasonProgress: data.seasonPass.seasons[currentSeason.seasonKey]?.[userId] || {
                claimedTiers: [],
                vipClaimedTiers: []
            },
            currentSeason: currentSeason.seasonKey
        };

        res.json(userData);

    } catch (error) {
        console.error('Erreur GET dashboard:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données dashboard' });
    }
});

// ===== EXEMPLE D'UTILISATION POUR LES AUTRES ROUTES =====
// Voici comment intégrer les points XP dans d'autres systèmes :

/*
// Dans casinoRoute.js, remplacez les appels à l'ancien système par :

// Au lieu de :
// await updateUserXP(userId, xpGained)

// Utilisez :
const casinoResponse = await fetch(`${BOT_API_URL}/season-pass/points/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: xpGained,
    source: 'casino_spin'
  })
});

if (casinoResponse.ok) {
  const data = await casinoResponse.json();
  console.log(`[CASINO] ${userId} gagne ${xpGained} XP - Total: ${data.newTotal}`);
}
*/

module.exports = router;
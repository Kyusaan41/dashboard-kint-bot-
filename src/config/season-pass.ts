import { SeasonPass, SeasonPassTier, SeasonPassReward } from '@/types/season-pass'

// Fonction pour générer un nombre aléatoire déterministe basé sur une graine
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// Fonction pour générer les récompenses progressives avec plus de variété
function generateProgressiveRewards(): { normal: SeasonPassReward[], vip: SeasonPassReward[] } {
  const normalRewards: SeasonPassReward[] = []
  const vipRewards: SeasonPassReward[] = []

  // Patterns de récompenses avec min/max fixes
  const rewardPatterns = [
    // Jetons avec montants aléatoires
    { type: 'tokens', min: 100, max: 110 },
    // Pièces avec montants aléatoires
    { type: 'currency', min: 100, max: 110 },
    // Orbes avec montants aléatoires
    { type: 'orbs', min: 1, max: 10 }
  ]

  // Fonction pour créer une récompense avec un montant spécifique
  const createReward = (type: string, amount: number, isVip: boolean = false): SeasonPassReward => {
    const suffix = isVip ? ' VIP' : ''

    switch (type) {
      case 'tokens':
        // Utiliser des montants aléatoires exponentiels
        return {
          id: `${isVip ? 'vip' : 'normal'}_tokens_${amount}`,
          type: 'tokens',
          amount: amount,
          name: `${amount} Jetons${suffix}`,
          description: `${amount} jetons de casino${suffix ? ` (${suffix.trim()})` : ''}`
        }
      case 'currency':
        // Utiliser des montants aléatoires exponentiels
        return {
          id: `${isVip ? 'vip' : 'normal'}_currency_${amount}`,
          type: 'currency',
          amount: amount,
          name: `${amount} Pièces${suffix}`,
          description: `${amount} pièces d'or${suffix ? ` (${suffix.trim()})` : ''}`
        }
      case 'orbs':
        return {
          id: `${isVip ? 'vip' : 'normal'}_orbs_${amount}`,
          type: 'orbs',
          amount: Math.min(amount, isVip ? 20 : 10),
          name: `${Math.min(amount, isVip ? 20 : 10)} Orbes${suffix}`,
          description: `${Math.min(amount, isVip ? 20 : 10)} orbes mystiques${suffix ? ` (${suffix.trim()})` : ''}`
        }
      default:
        return {
          id: `${isVip ? 'vip' : 'normal'}_default_${amount}`,
          type: 'tokens',
          amount: amount,
          name: `${amount} Jetons${suffix}`,
          description: `${amount} jetons de casino${suffix ? ` (${suffix.trim()})` : ''}`
        }
    }
  }

  // Calculer l'index maximum pour la progression exponentielle
  const maxAmountIndex = 22 // Calculé d'après la logique des paliers

  // Générer les récompenses normales avec variété
  for (let i = 1; i <= 100; i++) {
    // Paliers multiples de 10 = 5 orbes
    if (i % 10 === 0) {
      normalRewards.push({
        id: `normal_wishes_5`,
        type: 'orbs',
        amount: 5,
        name: '5 Orbes',
        description: '5 Orbes pour le Gacha'
      })
      continue
    }

    // Choisir un type de récompense basé sur le niveau (sans XP)
    let rewardType: string
    let amountIndex: number

    if (i <= 25) {
      // Niveaux 1-25 : Principalement jetons et pièces
      const types = ['tokens', 'currency', 'tokens', 'currency']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length)
    } else if (i <= 50) {
      // Niveaux 26-50 : Mélange équilibré
      const types = ['tokens', 'currency', 'orbs', 'tokens', 'currency']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 2
    } else if (i <= 75) {
      // Niveaux 51-75 : Plus de variété
      const types = ['currency', 'orbs', 'tokens', 'currency', 'orbs']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 4
    } else {
      // Niveaux 76-100 : Récompenses finales riches
      const types = ['tokens', 'currency', 'orbs', 'tokens', 'currency', 'orbs']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 6
    }

    // Calculer les montants aléatoires avec progression exponentielle
    const pattern = rewardPatterns.find(p => p.type === rewardType)
    if (pattern) {
      let min = pattern.min
      let max = pattern.max

      // Appliquer la progression exponentielle pour jetons et pièces
      if (rewardType !== 'orbs') {
        const multiplier = Math.pow(10, amountIndex / maxAmountIndex)
        min *= multiplier
        max *= multiplier
        // Respecter les limites
        min = Math.max(min, 100)
        max = Math.min(max, 1000)
      }

      // Générer montant aléatoire déterministe
      const typeCode = rewardType === 'tokens' ? 1 : rewardType === 'currency' ? 2 : 3
      const seed = i * 100 + typeCode
      const randomValue = seededRandom(seed)
      let amount = Math.floor(min + (max - min + 1) * randomValue)

      normalRewards.push(createReward(rewardType, amount, false))
    } else {
      normalRewards.push(createReward('tokens', 50, false))
    }
  }

  // Générer les récompenses VIP avec beaucoup plus de générosité
  for (let i = 1; i <= 100; i++) {
    // Paliers multiples de 10 = 10 wishes
    if (i % 10 === 0) {
      vipRewards.push({
        id: `vip_wishes_10`,
        type: 'orbs',
        amount: 10,
        name: '10 Orbes (VIP)',
        description: '10 orbes pour le Gacha (VIP)'
      })
      continue
    }

    let rewardType: string
    let amountIndex: number

    if (i <= 30) {
      // Niveaux 1-30 : Jetons et pièces généreux
      const types = ['tokens', 'currency', 'tokens', 'currency', 'tokens']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 2
    } else if (i <= 60) {
      // Niveaux 31-60 : Mélange très généreux
      const types = ['tokens', 'currency', 'orbs', 'tokens', 'currency']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 4
    } else if (i <= 85) {
      // Niveaux 61-85 : Récompenses élevées
      const types = ['currency', 'orbs', 'tokens', 'currency', 'orbs', 'tokens']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 6
    } else {
      // Niveaux 86-100 : Récompenses maximales
      const types = ['tokens', 'currency', 'orbs', 'tokens', 'currency', 'orbs']
      rewardType = types[(i - 1) % types.length]
      amountIndex = Math.floor((i - 1) / types.length) + 8
    }

    // Calculer les montants aléatoires avec progression exponentielle
    const pattern = rewardPatterns.find(p => p.type === rewardType)
    if (pattern) {
      let min = pattern.min
      let max = pattern.max

      // Ajuster pour VIP
      if (rewardType === 'orbs') {
        max = 20
      } else {
        min *= 10
        max *= 10
        // Appliquer la progression exponentielle
        const multiplier = Math.pow(10, amountIndex / maxAmountIndex)
        min *= multiplier
        max *= multiplier
        // Respecter les limites
        min = Math.max(min, 1000)
        max = Math.min(max, 10000)
      }

      // Générer montant aléatoire déterministe
      const typeCode = rewardType === 'tokens' ? 1 : rewardType === 'currency' ? 2 : 3
      const seed = (i + 100) * 100 + typeCode
      const randomValue = seededRandom(seed)
      let amount = Math.floor(min + (max - min + 1) * randomValue)

      vipRewards.push(createReward(rewardType, amount, true))
    } else {
      vipRewards.push(createReward('tokens', 500, true))
    }
  }

  return { normal: normalRewards, vip: vipRewards }
}

// Générer les récompenses
const { normal: normalRewards, vip: vipRewards } = generateProgressiveRewards()

// Fonction pour obtenir la saison actuelle
function getCurrentSeason() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // getMonth() returns 0-11

  // Saisons : Hiver (12-2), Printemps (3-5), Été (6-8), Automne (9-11)
  let seasonName = ''
  let startMonth = 0
  let endMonth = 0

  if (month >= 12 || month <= 2) {
    seasonName = 'Hiver'
    startMonth = month >= 12 ? 12 : 12
    endMonth = month <= 2 ? 2 : 2
  } else if (month >= 3 && month <= 5) {
    seasonName = 'Printemps'
    startMonth = 3
    endMonth = 5
  } else if (month >= 6 && month <= 8) {
    seasonName = 'Été'
    startMonth = 6
    endMonth = 8
  } else {
    seasonName = 'Automne'
    startMonth = 9
    endMonth = 11
  }

  const seasonStart = new Date(year, startMonth - 1, 1)
  const seasonEnd = new Date(year, endMonth, new Date(year, endMonth + 1, 0).getDate(), 23, 59, 59)

  return {
    name: `${seasonName} ${year}`,
    startDate: seasonStart.toISOString(),
    endDate: seasonEnd.toISOString(),
    seasonKey: `${seasonName.toLowerCase()}_${year}`
  }
}

// Générer les 100 paliers
function generateTiers(): SeasonPassTier[] {
  const tiers: SeasonPassTier[] = []
  const currentSeason = getCurrentSeason()

  // Points requis linéaires : palier n nécessite n * 800 XP
  for (let i = 1; i <= 100; i++) {
    const requiredPoints = i * 800

    tiers.push({
      id: `tier_${i}`,
      level: i,
      requiredPoints,
      normalReward: normalRewards[i - 1],
      vipReward: vipRewards[i - 1],
      claimed: false,
      vipClaimed: false
    })
  }

  return tiers
}

// Season pass actuel
const currentSeason = getCurrentSeason()
export const currentSeasonPass: SeasonPass = {
  id: `season_${currentSeason.seasonKey}`,
  name: `Saison ${currentSeason.name}`,
  description: `Découvrez les récompenses exclusives de la saison ${currentSeason.name.toLowerCase()} !`,
  startDate: currentSeason.startDate,
  endDate: currentSeason.endDate,
  tiers: generateTiers(),
  userProgress: {
    currentPoints: 0,
    claimedTiers: [],
    vipClaimedTiers: []
  }
}

// Fonction pour obtenir le season pass avec la progression utilisateur
export async function getSeasonPassForUser(userId: string, userPoints: number, isVip: boolean): Promise<SeasonPass> {
  const seasonPass = { ...currentSeasonPass }
  seasonPass.userProgress.currentPoints = userPoints

  // Charger la progression depuis l'API seasonpass du bot
  try {
    const BOT_API_URL = 'http://193.70.34.25:20007/api'
    const response = await fetch(`${BOT_API_URL}/season-pass/${userId}/progress`)

    if (response.ok) {
      const progressData = await response.json()
      seasonPass.userProgress.claimedTiers = progressData.claimedTiers || []
      seasonPass.userProgress.vipClaimedTiers = progressData.vipClaimedTiers || []
    } else {
      console.warn('[SEASON-PASS] Could not fetch progress from bot, using empty arrays')
      seasonPass.userProgress.claimedTiers = []
      seasonPass.userProgress.vipClaimedTiers = []
    }
  } catch (error) {
    console.warn('[SEASON-PASS] Error fetching progress from bot:', error)
    seasonPass.userProgress.claimedTiers = []
    seasonPass.userProgress.vipClaimedTiers = []
  }

  // Marquer les paliers réclamés
  seasonPass.tiers = seasonPass.tiers.map(tier => ({
    ...tier,
    claimed: seasonPass.userProgress.claimedTiers.includes(tier.id),
    vipClaimed: isVip ? seasonPass.userProgress.vipClaimedTiers.includes(tier.id) : undefined
  }))

  return seasonPass
}

// Fonction pour vérifier si on doit reset la saison
export function shouldResetSeason(): boolean {
  const currentSeason = getCurrentSeason()
  const now = new Date()
  const seasonEnd = new Date(currentSeason.endDate)

  // Reset si la saison est terminée
  return now > seasonEnd
}
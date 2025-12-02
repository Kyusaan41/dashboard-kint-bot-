import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const BOT_API_URL = 'http://193.70.34.25:20007/api'
const ADVENT_DATA_FILE = path.join(process.cwd(), 'data', 'advent-calendar.json')

// Configuration des récompenses du calendrier de l'Avent
const ADVENT_REWARDS = [
  { day: 1, type: 'currency', amount: 200, name: 'Pièces d\'or', description: '200 pièces scintillantes' },
  { day: 2, type: 'tokens', amount: 150, name: 'Jetons magiques', description: '150 jetons pour le casino' },
  { day: 3, type: 'orbs', amount: 5, name: 'Orbes mystiques', description: '5 orbes pour les gachas' },
  { day: 4, type: 'currency', amount: 350, name: 'Pièces d\'or', description: '350 pièces scintillantes' },
  { day: 5, type: 'tokens', amount: 750, name: 'Jetons magiques', description: '750 jetons pour le casino' },
  { day: 6, type: 'orbs', amount: 7, name: 'Orbes mystiques', description: '7 orbes pour les gachas' },
  { day: 7, type: 'currency', amount: 200, name: 'Pièces d\'or', description: '200 pièces scintillantes' },
  { day: 8, type: 'tokens', amount: 300, name: 'Jetons magiques', description: '300 jetons pour le casino' },
  { day: 9, type: 'orbs', amount: 2, name: 'Orbes mystiques', description: '2 orbes pour les gachas' },
  { day: 10, type: 'currency', amount: 250, name: 'Pièces d\'or', description: '250 pièces scintillantes' },
  { day: 11, type: 'tokens', amount: 125, name: 'Jetons magiques', description: '125 jetons pour le casino' },
  { day: 12, type: 'orbs', amount: 5, name: 'Orbes mystiques', description: '5 orbes pour les gachas' },
  { day: 13, type: 'currency', amount: 300, name: 'Pièces d\'or', description: '300 pièces scintillantes' },
  { day: 14, type: 'tokens', amount: 150, name: 'Jetons magiques', description: '150 jetons pour le casino' },
  { day: 15, type: 'orbs', amount: 10, name: 'Orbes mystiques', description: '10 orbes pour les gachas' },
  { day: 16, type: 'currency', amount: 350, name: 'Pièces d\'or', description: '350 pièces scintillantes' },
  { day: 17, type: 'tokens', amount: 175, name: 'Jetons magiques', description: '175 jetons pour le casino' },
  { day: 18, type: 'orbs', amount: 10, name: 'Orbes mystiques', description: '10 orbes pour les gachas' },
  { day: 19, type: 'currency', amount: 400, name: 'Pièces d\'or', description: '400 pièces scintillantes' },
  { day: 20, type: 'tokens', amount: 200, name: 'Jetons magiques', description: '200 jetons pour le casino' },
  { day: 21, type: 'orbs', amount: 20, name: 'Orbes mystiques', description: '20 orbes pour les gachas' },
  { day: 22, type: 'currency', amount: 1500, name: 'Pièces d\'or', description: '1500 pièces scintillantes' },
  { day: 23, type: 'tokens', amount: 1250, name: 'Jetons magiques', description: '1250 jetons pour le casino' },
  { day: 24, type: 'orbs', amount: 90, name: 'Orbes mystiques', description: '90 orbes pour les gachas + bonus spécial' },
]

// Fonction pour vérifier si c'est la période de Noël
function isChristmasPeriod(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const start = new Date(year, 11, 1) // 1er décembre
  const end = new Date(year, 11, 24, 23, 59, 59) // 24 décembre 23h59

  return now >= start && now <= end
}

// Fonction pour obtenir le jour actuel de décembre (1-24)
function getCurrentDay(): number {
  const now = new Date()
  return Math.min(24, Math.max(1, now.getDate()))
}

// Fonction pour lire les données du calendrier depuis le fichier
async function readAdventData(): Promise<{ [userId: string]: number[] }> {
  try {
    if (!fs.existsSync(ADVENT_DATA_FILE)) {
      // Créer le fichier s'il n'existe pas
      await fs.promises.writeFile(ADVENT_DATA_FILE, JSON.stringify({}, null, 2))
      return {}
    }
    const data = await fs.promises.readFile(ADVENT_DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[ADVENT-CALENDAR] Error reading advent data:', error)
    return {}
  }
}

// Fonction pour écrire les données du calendrier dans le fichier
async function writeAdventData(data: { [userId: string]: number[] }): Promise<void> {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(ADVENT_DATA_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    await fs.promises.writeFile(ADVENT_DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('[ADVENT-CALENDAR] Error writing advent data:', error)
  }
}

// Fonction pour obtenir les récompenses réclamées
async function getClaimedRewards(userId: string): Promise<number[]> {
  const data = await readAdventData()
  return data[userId] || []
}

// Fonction pour marquer une récompense comme réclamée
async function markRewardAsClaimed(userId: string, day: number): Promise<void> {
  const data = await readAdventData()
  if (!data[userId]) {
    data[userId] = []
  }
  if (!data[userId].includes(day)) {
    data[userId].push(day)
    await writeAdventData(data)
  }
}

// Fonction pour marquer une récompense comme réclamée
async function claimReward(userId: string, day: number, reward: any): Promise<boolean> {
  try {
    console.log(`[ADVENT-CALENDAR] Claiming reward for day ${day}:`, reward)

    // Distribuer la récompense selon son type
    switch (reward.type) {
      case 'currency':
        if (reward.amount) {
          const currentResponse = await fetch(`${BOT_API_URL}/currency/${userId}`)
          let currentCoins = 0
          if (currentResponse.ok) {
            const currentData = await currentResponse.json()
            currentCoins = currentData.balance || currentData.coins || 0
          }

          const newTotal = currentCoins + reward.amount
          const response = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: newTotal, balance: newTotal })
          })
          if (!response.ok) {
            console.error('[ADVENT-CALENDAR] Failed to add currency:', response.status)
            return false
          }
        }
        break

      case 'tokens':
        if (reward.amount) {
          const currentResponse = await fetch(`${BOT_API_URL}/currency/${userId}`)
          let currentTokens = 0
          if (currentResponse.ok) {
            const currentData = await currentResponse.json()
            currentTokens = currentData.tokens || currentData.tokkens || 0
          }

          const newTotal = currentTokens + reward.amount
          const response = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokens: newTotal, tokkens: newTotal })
          })
          if (!response.ok) {
            console.error('[ADVENT-CALENDAR] Failed to add tokens:', response.status)
            return false
          }
        }
        break

      case 'orbs':
        if (reward.amount) {
          const response = await fetch(`${BOT_API_URL}/gacha/wishes/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              amount: reward.amount
            })
          })
          if (!response.ok) {
            console.error('[ADVENT-CALENDAR] Failed to add wishes:', response.status)
            return false
          }
        }
        break

      default:
        console.warn(`[ADVENT-CALENDAR] Unknown reward type: ${reward.type}`)
        return false
    }

    console.log(`[ADVENT-CALENDAR] Successfully claimed reward for day ${day}`)
    return true
  } catch (error) {
    console.error('[ADVENT-CALENDAR] Error claiming reward:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Vérifier si c'est la période de Noël
    if (!isChristmasPeriod()) {
      return NextResponse.json({
        active: false,
        message: 'Le calendrier de l\'Avent n\'est disponible que du 1er au 24 décembre'
      })
    }

    const currentDay = getCurrentDay()
    const claimedRewards = await getClaimedRewards(userId)

    // Préparer les données du calendrier
    const calendarData = ADVENT_REWARDS.map(reward => ({
      ...reward,
      unlocked: reward.day <= currentDay,
      claimed: claimedRewards.includes(reward.day)
    }))

    return NextResponse.json({
      active: true,
      currentDay,
      calendar: calendarData
    })
  } catch (error) {
    console.error('[ADVENT-CALENDAR] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { day } = body

    if (!day || typeof day !== 'number' || day < 1 || day > 24) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 })
    }

    // Vérifier si c'est la période de Noël
    if (!isChristmasPeriod()) {
      return NextResponse.json({ error: 'Calendrier non disponible' }, { status: 400 })
    }

    const currentDay = getCurrentDay()

    // Vérifier si le jour est débloqué
    if (day > currentDay) {
      return NextResponse.json({ error: 'Ce jour n\'est pas encore débloqué' }, { status: 400 })
    }

    const claimedRewards = await getClaimedRewards(userId)

    // Vérifier si déjà réclamé
    if (claimedRewards.includes(day)) {
      return NextResponse.json({ error: 'Récompense déjà réclamée' }, { status: 400 })
    }

    // Trouver la récompense
    const reward = ADVENT_REWARDS.find(r => r.day === day)
    if (!reward) {
      return NextResponse.json({ error: 'Récompense introuvable' }, { status: 404 })
    }

    // Réclamer la récompense
    const success = await claimReward(userId, day, reward)

    if (!success) {
      return NextResponse.json({ error: 'Erreur lors de la réclamation' }, { status: 500 })
    }

    // Marquer la récompense comme réclamée
    await markRewardAsClaimed(userId, day)

    return NextResponse.json({
      success: true,
      message: `Récompense du jour ${day} réclamée avec succès !`,
      reward
    })
  } catch (error) {
    console.error('[ADVENT-CALENDAR] Error claiming reward:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
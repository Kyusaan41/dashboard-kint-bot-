import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'
import { loadSanctionsFromDisk } from '@/lib/persistence'

const BOT_API_URL = 'http://193.70.34.25:20007/api'

let sanctionsLoaded = false
async function ensureSanctionsLoaded() {
  if (!sanctionsLoaded) {
    await loadSanctionsFromDisk()
    sanctionsLoaded = true
  }
}

// Fonction pour obtenir les points du season pass pour un utilisateur
async function getUserSeasonPassPoints(userId: string): Promise<number> {
  try {
    const response = await fetch(`${BOT_API_URL}/season-pass/points/${userId}`)
    if (response.ok) {
      const data = await response.json()
      return data.points || 0
    }
  } catch (error) {
    console.warn(`[LEADERBOARD] Error fetching points for user ${userId}:`, error)
  }
  return 0
}

export async function GET(request: NextRequest) {
  try {
    await ensureSanctionsLoaded()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer les utilisateurs depuis l'API bot
    try {
      const response = await fetch(`${BOT_API_URL}/serverinfo`)

      if (response.ok) {
        const serverInfo = await response.json()
        const users = serverInfo.members || []

        // Filtrer les utilisateurs bannis
        const now = Date.now()
        const filteredUsers = (Array.isArray(users) ? users : []).filter((user: any) => {
          const activeBan = store.sanctions.find(s => {
            if (!s.active) return false
            if (s.userId !== user.id) return false
            if (s.type !== 'ban') return false
            if (s.expiresAt && new Date(s.expiresAt).getTime() <= now) return false
            return true
          })
          return !activeBan
        })

        // Récupérer les points Season Pass pour chaque utilisateur
        const leaderboardData = await Promise.all(
          filteredUsers.map(async (user: any) => {
            const points = await getUserSeasonPassPoints(user.id)
            return {
              id: user.id,
              username: user.username,
              avatar: user.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id.slice(-1)) % 5}.png`,
              points: points,
              level: Math.floor(points / 100) + 1, // Calcul approximatif du niveau
            }
          })
        )

        // Trier par points décroissants
        leaderboardData.sort((a, b) => b.points - a.points)

        // Prendre seulement les 10 premiers
        const topUsers = leaderboardData.slice(0, 10)

        return NextResponse.json({ leaderboard: topUsers })
      } else {
        console.warn(`[LEADERBOARD] Bot API returned error: ${response.status}`)
        throw new Error(`Bot API /serverinfo returned ${response.status}`)
      }
    } catch (fetchError) {
      console.warn('[LEADERBOARD] Error fetching from bot API, using mock data:', fetchError)

      // Données mock pour le développement
      const mockLeaderboard = [
        {
          id: '1206053705149841428',
          username: 'Admin User',
          avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
          points: 5000,
          level: 51,
        },
        {
          id: '5180198075891712',
          username: 'Test User 1',
          avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
          points: 2500,
          level: 26,
        },
        {
          id: '999999999999999999',
          username: 'Test User 2',
          avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
          points: 1000,
          level: 11,
        },
      ]

      return NextResponse.json({ leaderboard: mockLeaderboard })
    }
  } catch (error) {
    console.error('[LEADERBOARD] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
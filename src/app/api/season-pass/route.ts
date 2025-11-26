import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSeasonPassForUser } from '@/config/season-pass'
import { SeasonPassData, SeasonPassReward } from '@/types/season-pass'

const BOT_API_URL = 'http://193.70.34.25:20007/api'

// Fonction pour vérifier si l'utilisateur est VIP (possède vip_access)
async function checkUserIsVip(userId: string): Promise<boolean> {
  try {
    // Essayer plusieurs endpoints possibles pour l'inventaire
    const endpoints = [
      `${BOT_API_URL}/user/${userId}/inventory`,
      `${BOT_API_URL}/inventaire/${userId}`
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`[SEASON-PASS] Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint)
        console.log(`[SEASON-PASS] Response status: ${response.status}`)

        if (response.ok) {
          const inventory = await response.json()
          console.log(`[SEASON-PASS] Inventory response:`, inventory)

          // Vérifier différents formats possibles
          let hasVip = false

          if (Array.isArray(inventory)) {
            // Format array: ["vip_access"]
            hasVip = inventory.includes('vip_access')
            console.log(`[SEASON-PASS] Array format, has VIP: ${hasVip}`)
          } else if (typeof inventory === 'object' && inventory !== null) {
            // Format object: {"vip_access": {quantity: 1}}
            hasVip = 'vip_access' in inventory
            console.log(`[SEASON-PASS] Object format, has VIP: ${hasVip}`)
          }

          if (hasVip) {
            console.log(`[SEASON-PASS] Found VIP access via ${endpoint}`)
            return true
          }
        }
      } catch (error) {
        console.warn(`[SEASON-PASS] Error with endpoint ${endpoint}:`, error)
      }
    }

    console.log(`[SEASON-PASS] No VIP access found in any endpoint`)
  } catch (error) {
    console.warn('[SEASON-PASS] Error checking VIP status:', error)
  }

  return false
}

// Fonction pour obtenir les points du season pass (depuis le bot)
async function getUserPoints(userId: string): Promise<number> {
  try {
    console.log(`[SEASON-PASS] Fetching points for user ${userId} from ${BOT_API_URL}/season-pass/points/${userId}`)
    const response = await fetch(`${BOT_API_URL}/season-pass/points/${userId}`)
    console.log(`[SEASON-PASS] Response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`[SEASON-PASS] Points for user ${userId}: ${data.points}`)
      return data.points || 0
    } else {
      console.error(`[SEASON-PASS] Bot API returned error: ${response.status}`)
      const errorText = await response.text()
      console.error(`[SEASON-PASS] Error response: ${errorText}`)
    }
  } catch (error) {
    console.error('[SEASON-PASS] Error fetching points from bot:', error)
  }

  console.log(`[SEASON-PASS] Using fallback: 0 points for user ${userId}`)
  return 0
}

// Fonction pour réclamer une récompense
async function claimReward(userId: string, tierId: string, reward: SeasonPassReward, isVip: boolean): Promise<boolean> {
  try {
    console.log(`[SEASON-PASS] Claiming ${isVip ? 'VIP' : 'normal'} reward for user ${userId}, tier ${tierId}:`, reward)

    // D'abord, vérifier et marquer comme claimed via l'API seasonpass du bot
    const claimResponse = await fetch(`${BOT_API_URL}/season-pass/${userId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tierId: tierId,
        isVipReward: isVip
      })
    })

    if (!claimResponse.ok) {
      const errorData = await claimResponse.json()
      console.error('[SEASON-PASS] Failed to mark as claimed:', errorData)
      return false
    }

    // Maintenant distribuer la récompense selon son type
    switch (reward.type) {
      case 'currency':
        // Ajouter des pièces via l'API currency du bot (ajouter au total existant)
        if (reward.amount) {
          // D'abord récupérer le total actuel
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
            body: JSON.stringify({
              coins: newTotal,
              balance: newTotal
            })
          })
          if (!response.ok) {
            console.error('[SEASON-PASS] Failed to add currency:', response.status)
            return false
          }
        }
        break

      case 'tokens':
        // Ajouter des jetons via l'API currency du bot (ajouter au total existant)
        if (reward.amount) {
          // D'abord récupérer le total actuel
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
            body: JSON.stringify({
              tokens: newTotal,
              tokkens: newTotal
            })
          })
          if (!response.ok) {
            console.error('[SEASON-PASS] Failed to add tokens:', response.status)
            return false
          }
        }
        break


      case 'orbs':
        // Distribuer des wishes (tickets gacha) via l'API gacha du bot
        if (reward.amount) {
          console.log(`[SEASON-PASS] Sending wishes reward to bot:`, {
            url: `${BOT_API_URL}/gacha/wishes/${userId}`,
            body: { amount: reward.amount }
          })

          const response = await fetch(`${BOT_API_URL}/gacha/wishes/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              amount: reward.amount
            })
          })

          console.log(`[SEASON-PASS] Bot response status for wishes:`, response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('[SEASON-PASS] Failed to add wishes:', response.status, errorText)
            return false
          }

          const responseData = await response.json()
          console.log(`[SEASON-PASS] Wishes reward response:`, responseData)
        }
        break

      case 'item':
        // Ajouter un item à l'inventaire - pour l'instant juste un log
        if (reward.itemId) {
          console.log(`[SEASON-PASS] Would add item ${reward.itemId} to user ${userId} inventory`)
          // TODO: Implémenter l'ajout d'item à l'inventaire quand l'API sera disponible
        }
        break

      case 'card':
        // Ajouter une carte à la collection - pour l'instant juste un log
        if (reward.cardId) {
          console.log(`[SEASON-PASS] Would add card ${reward.cardId} to user ${userId} collection`)
          // TODO: Implémenter l'ajout de carte quand l'API sera disponible
        }
        break

      default:
        console.warn(`[SEASON-PASS] Unknown reward type: ${reward.type}`)
        return false
    }

    console.log(`[SEASON-PASS] Successfully claimed ${isVip ? 'VIP' : 'normal'} reward for tier ${tierId}`)
    return true
  } catch (error) {
    console.error('[SEASON-PASS] Error claiming reward:', error)
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

    // Vérifier si l'utilisateur est VIP
    const isVip = await checkUserIsVip(userId)

    // Obtenir les points de l'utilisateur
    const userPoints = await getUserPoints(userId)

    // Obtenir le season pass avec la progression
    const seasonPass = await getSeasonPassForUser(userId, userPoints, isVip)

    const data: SeasonPassData = {
      seasonPass,
      isVip
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[SEASON-PASS] Error:', error)
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
    const { action, tierId, isVipReward, amount, source } = body

    // Gestion des points (appels depuis le casino)
    if (action === 'add_points') {
      if (!amount || typeof amount !== 'number') {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }

      try {
        // Utiliser l'API bot pour ajouter des points XP dashboard
        const response = await fetch(`${BOT_API_URL}/season-pass/points/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            source: source || 'season_pass'
          })
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            newTotal: data.newTotal,
            message: `Added ${amount} season pass points`
          })
        } else {
          console.error('[SEASON-PASS] Bot seasonpass API error:', response.status)
          return NextResponse.json({ error: 'Failed to add season pass points' }, { status: 500 })
        }
      } catch (error) {
        console.error('[SEASON-PASS] Error adding season pass points:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }

    // Gestion des réclamations de récompenses (logique existante)

    if (!tierId) {
      return NextResponse.json({ error: 'tierId is required' }, { status: 400 })
    }

    // Vérifier si l'utilisateur est VIP
    const isVip = await checkUserIsVip(userId)

    if (isVipReward && !isVip) {
      return NextResponse.json({ error: 'VIP access required for VIP rewards' }, { status: 403 })
    }

    // Obtenir les points de l'utilisateur
    const userPoints = await getUserPoints(userId)

    // Obtenir le season pass
    const seasonPass = await getSeasonPassForUser(userId, userPoints, isVip)

    // Trouver le palier
    const tier = seasonPass.tiers.find(t => t.id === tierId)
    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    // Vérifier si le palier est accessible
    if (userPoints < tier.requiredPoints) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Sélectionner la récompense appropriée
    const reward = isVipReward ? tier.vipReward : tier.normalReward
    if (!reward) {
      return NextResponse.json({ error: 'Reward not available' }, { status: 404 })
    }

    // Vérifier si déjà réclamé
    if (isVipReward && tier.vipClaimed) {
      return NextResponse.json({ error: 'VIP reward already claimed' }, { status: 400 })
    }
    if (!isVipReward && tier.claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Réclamer la récompense
    const success = await claimReward(userId, tierId, reward, isVipReward || false)

    if (!success) {
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Reward claimed successfully' })
  } catch (error) {
    console.error('[SEASON-PASS] Error claiming reward:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
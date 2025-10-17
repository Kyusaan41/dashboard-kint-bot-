import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())
const BOT_API_URL = 'http://193.70.34.25:20007/api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication and super-admin role
    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 🔄 Récupérer les vraies données directement depuis le bot API
    try {
      console.log(`[SUPER-ADMIN] Fetching from: ${BOT_API_URL}/serverinfo`)
      
      try {
        const response = await fetch(`${BOT_API_URL}/serverinfo`)

        console.log(`[SUPER-ADMIN] Response status: ${response.status}`)

        if (response.ok) {
          const serverInfo = await response.json()
          const users = serverInfo.members || []
          console.log(`[SUPER-ADMIN] Successfully fetched ${users.length} users from bot API`)
          
          const transformedUsers = (Array.isArray(users) ? users : []).map((user: any) => ({
            id: user.id,
            username: user.username,
            avatar: user.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id.slice(-1)) % 5}.png`,
            siteRole: user.siteRole || 'user',
            joinedAt: user.joinedAt || new Date().toISOString(),
            lastActive: user.lastActive || new Date().toISOString(),
            points: user.points || 0,
            currency: user.currency || 0,
          }))
          return NextResponse.json({ users: transformedUsers })
        } else {
          const errorText = await response.text()
          console.warn(`[SUPER-ADMIN] Bot API returned error: ${response.status} - ${errorText}`)
          console.warn(`[SUPER-ADMIN] Falling back to mock data for testing`)
          throw new Error(`Bot API /serverinfo returned ${response.status}`)
        }
      } catch (fetchError) {
        console.warn('[SUPER-ADMIN] Error fetching from bot API, using mock data:', fetchError)
        
        // 🧪 MOCK DATA - Pour tester le frontend en attendant que le bot API soit prêt
        const mockUsers = [
          {
            id: '1206053705149841428',
            username: 'Admin User',
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            siteRole: 'super_admin',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date().toISOString(),
            points: 5000,
            currency: 1000,
          },
          {
            id: '5180198075891712',
            username: 'Test User 1',
            avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
            siteRole: 'admin',
            joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            points: 2500,
            currency: 500,
          },
          {
            id: '999999999999999999',
            username: 'Test User 2',
            avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
            siteRole: 'user',
            joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            points: 1000,
            currency: 200,
          },
        ]
        
        console.log(`[SUPER-ADMIN] Returning ${mockUsers.length} mock users for testing`)
        return NextResponse.json({ users: mockUsers })
      }
    } catch (error) {
      console.error('[SUPER-ADMIN] Unexpected error:', error)
      return NextResponse.json(
        { error: 'Unable to fetch users from bot API', details: String(error) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[SUPER-ADMIN] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
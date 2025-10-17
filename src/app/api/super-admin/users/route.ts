import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication and super-admin role
    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 🔄 Récupérer les vraies données depuis l'API admin/users
    try {
      const baseUrl = process.env.BOT_API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (response.ok) {
        const users = await response.json()
        const transformedUsers = users.map((user: any) => ({
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
        throw new Error(`API admin/users returned ${response.status}`)
      }
    } catch (error) {
      console.error('⚠️ Erreur récupération données admin/users:', error)
      return NextResponse.json(
        { error: 'Unable to fetch users from bot API' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
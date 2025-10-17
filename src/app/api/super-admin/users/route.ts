import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check authentication and super-admin role
    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch users from your database/API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${process.env.BOT_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    const users = await response.json()

    // Transform users to include site roles (you can add this to your database)
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
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Permission definitions for different roles
const ROLE_PERMISSIONS = {
  super_admin: ['manage_users', 'manage_roles', 'view_logs', 'send_broadcast', 'apply_sanctions', 'manage_pages', 'manage_permissions'],
  administrator: ['manage_users', 'view_logs', 'send_broadcast', 'apply_sanctions', 'manage_pages'],
  moderator: ['view_logs', 'apply_sanctions'],
  user: [],
}

// In-memory storage for custom permissions
let customPermissions: Array<{
  id: string
  userId: string
  username: string
  permissions: string[]
  grantedBy: string
  grantedAt: string
}> = [
  {
    id: '1',
    userId: '5180198075891712',
    username: 'Kuromyi',
    permissions: ['manage_users', 'view_logs', 'send_broadcast'],
    grantedBy: 'SuperAdmin',
    grantedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const custom = customPermissions.find(p => p.userId === userId)
      return NextResponse.json({ custom, rolePermissions: ROLE_PERMISSIONS })
    }

    return NextResponse.json({
      custom: customPermissions,
      rolePermissions: ROLE_PERMISSIONS,
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, username, permissions } = body

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already exists
    const existing = customPermissions.find(p => p.userId === userId)
    if (existing) {
      existing.permissions = permissions
      existing.grantedAt = new Date().toISOString()
      return NextResponse.json({ success: true, permission: existing })
    }

    const permission = {
      id: Date.now().toString(),
      userId,
      username: username || 'Unknown',
      permissions,
      grantedBy: session.user.name || 'Unknown',
      grantedAt: new Date().toISOString(),
    }

    customPermissions.push(permission)

    return NextResponse.json({ success: true, permission })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    const index = customPermissions.findIndex(p => p.userId === userId)
    if (index === -1) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    customPermissions.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
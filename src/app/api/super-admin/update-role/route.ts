import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())
const PROTECTED_USER_ID = process.env.NEXT_PUBLIC_PROTECTED_SUPER_ADMIN_ID ?? SUPER_ADMIN_IDS[0]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    // Protect the main super-admin account
    if (userId === PROTECTED_USER_ID) {
      return NextResponse.json(
        { error: 'Cannot modify protected account' },
        { status: 403 }
      )
    }

    // Validate role
    const validRoles = ['user', 'moderator', 'administrator', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update user role in database/API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-user-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BOT_API_TOKEN}`,
      },
      body: JSON.stringify({
        userId,
        role,
        updatedBy: session.user.id,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update user role')
    }

    const updatedUser = await response.json()

    return NextResponse.json({
      ...updatedUser,
      siteRole: role,
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
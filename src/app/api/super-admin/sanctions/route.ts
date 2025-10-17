import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// In-memory storage for sanctions
let sanctions: Array<{
  id: string
  userId: string
  username: string
  type: 'ban' | 'mute' | 'warn'
  reason: string
  duration?: number // in minutes, null = permanent
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
}> = [
  {
    id: '1',
    userId: '123456789',
    username: 'Spammer123',
    type: 'mute',
    reason: 'Spam excessif',
    duration: 1440,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    createdBy: 'SuperAdmin',
    active: true,
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
    const active = searchParams.get('active') === 'true'

    let filtered = sanctions

    if (userId) {
      filtered = filtered.filter(s => s.userId === userId)
    }

    if (active) {
      filtered = filtered.filter(s => {
        if (!s.active) return false
        if (s.expiresAt) {
          return new Date(s.expiresAt) > new Date()
        }
        return true
      })
    }

    return NextResponse.json({ sanctions: filtered })
  } catch (error) {
    console.error('Error fetching sanctions:', error)
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
    const { userId, username, type, reason, duration } = body

    if (!userId || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sanction = {
      id: Date.now().toString(),
      userId,
      username: username || 'Unknown',
      type,
      reason,
      duration,
      createdAt: new Date().toISOString(),
      expiresAt: duration
        ? new Date(Date.now() + duration * 60 * 1000).toISOString()
        : undefined,
      createdBy: session.user.name || 'Unknown',
      active: true,
    }

    sanctions.push(sanction)

    return NextResponse.json({ success: true, sanction })
  } catch (error) {
    console.error('Error creating sanction:', error)
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
    const sanctionId = searchParams.get('id')

    if (!sanctionId) {
      return NextResponse.json({ error: 'Missing sanction ID' }, { status: 400 })
    }

    const index = sanctions.findIndex(s => s.id === sanctionId)
    if (index === -1) {
      return NextResponse.json({ error: 'Sanction not found' }, { status: 404 })
    }

    sanctions[index].active = false
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sanction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
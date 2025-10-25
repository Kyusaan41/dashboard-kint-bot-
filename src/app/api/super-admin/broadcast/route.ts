import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// In-memory storage for broadcasts
let broadcasts: Array<{
  id: string
  title: string
  message: string
  type: 'announcement' | 'warning' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
  views?: number
}> = [
  {
    id: '1',
    title: 'Bienvenue!',
    message: 'Bienvenue sur le nouveau dashboard super-admin!',
    type: 'announcement',
    priority: 'high',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdBy: 'SuperAdmin',
    active: true,
    views: 42,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') !== 'false'

    let filtered = broadcasts

    if (active) {
      filtered = filtered.filter(b => {
        if (!b.active) return false
        if (b.expiresAt) {
          return new Date(b.expiresAt) > new Date()
        }
        return true
      })
    }

    return NextResponse.json({ broadcasts: filtered })
  } catch (error) {
    console.error('Error fetching broadcasts:', error)
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
    const { title, message, type = 'announcement', priority = 'medium', durationHours } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const broadcast = {
      id: Date.now().toString(),
      title,
      message,
      type,
      priority,
      createdAt: new Date().toISOString(),
      expiresAt: durationHours
        ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
        : undefined,
      createdBy: session.user.name || 'Unknown',
      active: true,
      views: 0,
    }

    broadcasts.push(broadcast)

    return NextResponse.json({ success: true, broadcast })
  } catch (error) {
    console.error('Error creating broadcast:', error)
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
    const broadcastId = searchParams.get('id')

    if (!broadcastId) {
      return NextResponse.json({ error: 'Missing broadcast ID' }, { status: 400 })
    }

    const index = broadcasts.findIndex(b => b.id === broadcastId)
    if (index === -1) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
    }

    broadcasts[index].active = false
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting broadcast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
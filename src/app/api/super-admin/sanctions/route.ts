import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store, Sanction } from '@/lib/dataStore'
import { loadSanctionsFromDisk, saveSanctionsToDisk } from '@/lib/persistence'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

let sanctionsLoaded = false
async function ensureSanctionsLoaded() {
  if (!sanctionsLoaded) {
    await loadSanctionsFromDisk()
    sanctionsLoaded = true
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSanctionsLoaded()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const active = searchParams.get('active') === 'true'

    let filtered = store.sanctions

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
    await ensureSanctionsLoaded()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, username, type, reason } = body
    // Sanitize duration: ensure positive number (minutes); otherwise treat as permanent
    const rawDuration = Number(body?.duration)
    const minutes = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.floor(rawDuration) : undefined

    if (!userId || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sanction: Sanction = {
      id: Date.now().toString(),
      userId,
      username: username || 'Unknown',
      type,
      reason,
      duration: minutes,
      createdAt: new Date().toISOString(),
      expiresAt: minutes !== undefined
        ? new Date(Date.now() + minutes * 60 * 1000).toISOString()
        : undefined,
      createdBy: session.user.name || 'Unknown',
      active: true,
    }

    store.sanctions.push(sanction)
    await saveSanctionsToDisk()

    return NextResponse.json({ success: true, sanction })
  } catch (error) {
    console.error('Error creating sanction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureSanctionsLoaded()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sanctionId = searchParams.get('id')

    if (!sanctionId) {
      return NextResponse.json({ error: 'Missing sanction ID' }, { status: 400 })
    }

    const index = store.sanctions.findIndex(s => s.id === sanctionId)
    if (index === -1) {
      return NextResponse.json({ error: 'Sanction not found' }, { status: 404 })
    }

    store.sanctions[index].active = false
    await saveSanctionsToDisk()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sanction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
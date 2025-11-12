import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { pageId, status, reason, estimatedTime } = await request.json()

    // Validate inputs
    if (!pageId || !status || !['online', 'maintenance'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Update maintenance status in centralized store
    const idx = store.pages.findIndex(p => p.id === pageId)
    if (idx === -1) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    store.pages[idx].status = status
    store.pages[idx].lastChecked = new Date().toISOString()

    return NextResponse.json({
      success: true,
      pageId,
      status,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating page maintenance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ pages: store.pages })
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
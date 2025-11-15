import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'
import { setPageMaintenance, clearPageMaintenance, MaintenanceStatus } from '@/lib/maintenanceStore'

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

    // Update maintenance status in centralized store (utilisé par le panneau super-admin)
    const idx = store.pages.findIndex(p => p.id === pageId)
    if (idx === -1) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    store.pages[idx].status = status
    store.pages[idx].lastChecked = now

    // Synchroniser avec le système de maintenance réel (Redis / maintenanceStore)
    // afin que le wrapper WithMaintenanceCheck prenne en compte ces changements.
    if (status === 'online') {
      await clearPageMaintenance(pageId)
    } else {
      const maintenanceStatus: MaintenanceStatus = {
        status: 'maintenance',
        message: 'En cours de maintenance',
        reason: reason || 'Cette page est en maintenance',
        // estimatedTime côté API / super-admin est en minutes, on stocke en millisecondes dans Redis
        estimatedTime: typeof estimatedTime === 'number' ? estimatedTime * 60 * 1000 : undefined,
        lastUpdated: now,
        updatedBy: session.user.name || 'Super Admin',
      }

      await setPageMaintenance(pageId, maintenanceStatus)
    }

    return NextResponse.json({
      success: true,
      pageId,
      status,
      lastUpdated: now,
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { setPageMaintenance, getAllMaintenanceStatus, clearPageMaintenance } from '@/lib/maintenanceStore'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { pageId, status, reason } = await request.json()

    // Validate inputs
    if (!pageId || !status || !['online', 'maintenance'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Update maintenance status in centralized store
    if (status === 'online') {
      // Clear maintenance status when bringing page back online
      clearPageMaintenance(pageId)
      console.log(`Page ${pageId} brought back online by ${session.user.name}`)
    } else {
      // Set maintenance status
      setPageMaintenance(pageId, {
        status,
        reason: reason || undefined,
        updatedBy: session.user.id,
        message: 'En cours de maintenance'
      })
      console.log(`Page ${pageId} set to maintenance by ${session.user.name}`)
    }

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

    const status = getAllMaintenanceStatus()
    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
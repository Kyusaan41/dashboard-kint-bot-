import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// In-memory storage for page maintenance status
let maintenanceStatus: Map<string, { status: 'online' | 'maintenance', lastUpdated: string, updatedBy: string, reason?: string }> = new Map()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

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

    // Update maintenance status
    maintenanceStatus.set(pageId, {
      status,
      lastUpdated: new Date().toISOString(),
      updatedBy: session.user.id,
      reason: reason || undefined,
    })

    // Emit event to all connected clients (you could use Socket.io or WebSocket)
    // For now, we'll just log it
    console.log(`Page ${pageId} set to ${status} by ${session.user.name}`)

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
    const session = await getServerSession()

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const status = Object.fromEntries(maintenanceStatus)
    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
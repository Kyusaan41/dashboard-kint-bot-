import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for page maintenance status
let pageMaintenanceStatus: Map<string, { 
  message?: string; 
  reason?: string; 
  estimatedTime?: string; 
  lastUpdated: string; 
  updatedBy?: string 
}> = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    // Check global maintenance mode (from env)
    const maintenanceMode = process.env.BOT_MAINTENANCE_MODE === 'true'
    const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

    if (maintenanceMode) {
      return NextResponse.json({
        maintenance: true,
        global: true,
        message: 'En cours de maintenance',
        reason: maintenanceMessage || 'Le service est temporairement indisponible',
        estimatedTime: 'Environ 30 minutes',
        lastUpdated: new Date().toISOString()
      })
    }

    // Check page-specific maintenance
    if (pageId && pageMaintenanceStatus.has(pageId)) {
      const pageStatus = pageMaintenanceStatus.get(pageId)
      return NextResponse.json({
        maintenance: true,
        pageId,
        ...pageStatus
      })
    }

    // All clear
    return NextResponse.json({
      maintenance: false
    })
  } catch (error) {
    console.error('Error checking maintenance status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pageId, message, reason, estimatedTime } = await request.json()

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      )
    }

    // Store page maintenance status
    pageMaintenanceStatus.set(pageId, {
      message,
      reason,
      estimatedTime,
      lastUpdated: new Date().toISOString()
    })

    console.log(`Page ${pageId} set to maintenance`)

    return NextResponse.json({
      success: true,
      pageId,
      message
    })
  } catch (error) {
    console.error('Error updating maintenance status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
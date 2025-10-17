import { NextRequest, NextResponse } from 'next/server'
import { getPageMaintenance } from '@/lib/maintenanceStore'

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
    if (pageId) {
      const pageStatus = getPageMaintenance(pageId)
      if (pageStatus && pageStatus.status === 'maintenance') {
        return NextResponse.json({
          maintenance: true,
          pageId,
          message: pageStatus.message || 'En cours de maintenance',
          reason: pageStatus.reason || 'Cette page est en maintenance',
          estimatedTime: pageStatus.estimatedTime || 'Environ 30 minutes',
          lastUpdated: pageStatus.lastUpdated
        })
      }
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


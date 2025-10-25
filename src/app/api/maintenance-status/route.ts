import { NextRequest, NextResponse } from 'next/server'
import { getPageMaintenance } from '@/lib/maintenanceStore'

// Helper function to format milliseconds to readable time
function formatEstimatedTime(ms?: number): string {
  if (!ms) return 'Environ 30 minutes'
  
  const minutes = Math.ceil(ms / (60 * 1000))
  
  if (minutes < 60) {
    return `Environ ${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `Environ ${hours} heure${hours > 1 ? 's' : ''}`
  }
  
  return `Environ ${hours}h ${mins}m`
}

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
      const pageStatus = await getPageMaintenance(pageId)
      if (pageStatus && pageStatus.status === 'maintenance') {
        return NextResponse.json({
          maintenance: true,
          pageId,
          message: pageStatus.message || 'En cours de maintenance',
          reason: pageStatus.reason || 'Cette page est en maintenance',
          estimatedTime: formatEstimatedTime(pageStatus.estimatedTime),
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
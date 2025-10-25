import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Generate mock analytics data
function generateAnalyticsData() {
  const now = Date.now()
  const hourData = []
  const dayData = []

  // Generate 24 hours of data
  for (let i = 23; i >= 0; i--) {
    const time = now - i * 60 * 60 * 1000
    hourData.push({
      timestamp: new Date(time).toISOString(),
      activeUsers: Math.floor(Math.random() * 150) + 50,
      newUsers: Math.floor(Math.random() * 20) + 5,
      pageViews: Math.floor(Math.random() * 500) + 100,
    })
  }

  // Generate 7 days of data
  for (let i = 6; i >= 0; i--) {
    const time = now - i * 24 * 60 * 60 * 1000
    dayData.push({
      date: new Date(time).toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 2000) + 500,
      newUsers: Math.floor(Math.random() * 300) + 50,
      totalSessions: Math.floor(Math.random() * 5000) + 1000,
      avgSessionTime: Math.floor(Math.random() * 45) + 15, // minutes
    })
  }

  return { hourData, dayData }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

    const analytics = generateAnalyticsData()

    const stats = {
      overview: {
        totalUsers: 15420,
        activeToday: 1240,
        newToday: 145,
        totalPages: 10,
        onlinePages: 9,
        averageSessionTime: 28, // minutes
        bounceRate: 32.5, // percent
        conversionRate: 4.2, // percent
      },
      topPages: [
        { name: 'Dashboard', views: 4521, uniqueVisitors: 2340, avgTime: 6.5 },
        { name: 'Mini-Jeux', views: 3890, uniqueVisitors: 2100, avgTime: 12.3 },
        { name: 'Boutique', views: 2145, uniqueVisitors: 1200, avgTime: 4.2 },
        { name: 'Classements', views: 1890, uniqueVisitors: 950, avgTime: 3.8 },
        { name: 'Inventaire', views: 1560, uniqueVisitors: 800, avgTime: 5.1 },
      ],
      userActivity: {
        hourly: analytics.hourData,
        daily: analytics.dayData,
      },
      systemHealth: {
        uptime: 99.98,
        responseTime: 145, // ms
        errorRate: 0.02, // percent
        dbLatency: 12, // ms
        cacheHitRate: 87.3, // percent
      },
      topUsers: [
        { id: '1', username: 'SuperPlayer', score: 45600, level: 42 },
        { id: '2', username: 'GamerKing', score: 42100, level: 40 },
        { id: '3', username: 'Lucky7', score: 38900, level: 38 },
        { id: '4', username: 'NoobMaster', score: 35200, level: 35 },
        { id: '5', username: 'CasinoLover', score: 32800, level: 32 },
      ],
    }

    return NextResponse.json({ stats, range })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
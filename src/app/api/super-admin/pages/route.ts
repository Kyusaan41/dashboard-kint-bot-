import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPageMaintenance, getAllMaintenanceStatus } from '@/lib/maintenanceStore'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Define available pages on the site (with all mini-games)
const AVAILABLE_PAGES = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', status: 'online' as const },
  { id: 'events', name: 'Événements', path: '/dashboard/events', status: 'online' as const },
  
  // Mini-Jeux Section
  { id: 'mini-jeu', name: 'Mini-Jeux', path: '/dashboard/mini-jeu', status: 'online' as const },
  { id: 'mini-jeu-casino', name: '  → Casino', path: '/dashboard/mini-jeu/casino', status: 'online' as const },
  { id: 'mini-jeu-casino-vip', name: '  → Casino VIP', path: '/dashboard/mini-jeu/casino-vip', status: 'online' as const },
  { id: 'mini-jeu-crash', name: '  → Crash', path: '/dashboard/mini-jeu/crash', status: 'online' as const },
  { id: 'mini-jeu-gacha', name: '  → Gacha', path: '/dashboard/mini-jeu/gacha', status: 'online' as const },
  { id: 'mini-jeu-kint', name: '  → Kint', path: '/dashboard/mini-jeu/kint', status: 'online' as const },
  { id: 'mini-jeu-1v1', name: '  → 1v1', path: '/dashboard/mini-jeu/1v1', status: 'online' as const },
  { id: 'mini-jeu-rainbow-cascade', name: '  → Rainbow Cascade', path: '/dashboard/mini-jeu/rainbow-cascade', status: 'online' as const },
  
  // Other Pages
  { id: 'classement', name: 'Classements', path: '/dashboard/classement', status: 'online' as const },
  { id: 'boutique', name: 'Boutique', path: '/dashboard/boutique', status: 'online' as const },
  { id: 'members', name: 'Profil', path: '/dashboard/membres', status: 'online' as const },
  { id: 'inventory', name: 'Inventaire', path: '/dashboard/inventory', status: 'online' as const },
  { id: 'admin', name: 'Administration', path: '/dashboard/admin', status: 'online' as const },
  { id: 'stats', name: 'Statistiques', path: '/dashboard/stats', status: 'online' as const },
  { id: 'settings', name: 'Paramètres', path: '/dashboard/settings', status: 'online' as const },
  { id: 'super-admin', name: 'Super Admin', path: '/dashboard/super-admin', status: 'online' as const },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Load maintenance statuses from maintenanceStore
    const maintenanceStatuses = await getAllMaintenanceStatus()

    const pages = AVAILABLE_PAGES.map(page => {
      // Check if page has maintenance status
      const maintenanceRecord = maintenanceStatuses[page.id]
      const pageStatus = maintenanceRecord?.status || 'online'
      
      return {
        id: page.id,
        name: page.name,
        path: page.path,
        status: pageStatus,
        lastChecked: maintenanceRecord?.lastUpdated || new Date().toISOString(),
        responseTime: undefined,
      }
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
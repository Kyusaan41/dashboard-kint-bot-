import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Define available pages on the site
const AVAILABLE_PAGES = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', status: 'online' as const },
  { id: 'events', name: 'Événements', path: '/dashboard/events', status: 'online' as const },
  { id: 'mini-jeu', name: 'Mini-Jeux', path: '/dashboard/mini-jeu', status: 'online' as const },
  { id: 'classement', name: 'Classements', path: '/dashboard/classement', status: 'online' as const },
  { id: 'boutique', name: 'Boutique', path: '/dashboard/boutique', status: 'online' as const },
  { id: 'members', name: 'Profil', path: '/dashboard/membres', status: 'online' as const },
  { id: 'inventory', name: 'Inventaire', path: '/dashboard/inventory', status: 'online' as const },
  { id: 'admin', name: 'Administration', path: '/dashboard/admin', status: 'online' as const },
  { id: 'stats', name: 'Statistiques', path: '/dashboard/stats', status: 'online' as const },
  { id: 'settings', name: 'Paramètres', path: '/dashboard/settings', status: 'online' as const },
]

// In-memory storage for page statuses (you should use a database)
let pageStatuses: Map<string, { status: 'online' | 'maintenance', lastChecked: string, responseTime?: number }> = new Map()

// Initialize with default statuses
AVAILABLE_PAGES.forEach(page => {
  pageStatuses.set(page.id, { status: 'online', lastChecked: new Date().toISOString() })
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const pages = AVAILABLE_PAGES.map(page => {
      const status = pageStatuses.get(page.id) || { status: 'online', lastChecked: new Date().toISOString() }
      return {
        id: page.id,
        name: page.name,
        path: page.path,
        ...status,
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
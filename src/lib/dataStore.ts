// Centralized in-memory store for super-admin features
// Note: This is ephemeral and resets on server restart. Replace with DB when available.

export type SanctionType = 'ban' | 'mute' | 'warn'

export interface Sanction {
  id: string
  userId: string
  username: string
  type: SanctionType
  reason: string
  duration?: number
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
}

export interface Broadcast {
  id: string
  title: string
  message: string
  type: 'announcement' | 'warning' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
  views?: number
}

export interface PageStatus {
  id: string
  name: string
  path: string
  status: 'online' | 'maintenance'
  lastChecked: string
  responseTime?: number
}

export interface AuditLog {
  id: string
  timestamp: string
  adminId: string
  adminName: string
  action: string
  targetId?: string
  targetName?: string
  details: string
  status: 'success' | 'failed'
}

export interface JackpotForce {
  id: string
  userId: string
  username: string
  markedAt: string
  markedBy: string
  active: boolean
  type: 'jackpot' | 'test' // jackpot = 7️⃣, test = 🍀
}

export const store = {
  sanctions: [] as Sanction[],

  broadcasts: [] as Broadcast[],

  jackpotForces: [] as JackpotForce[],

  pages: [
    // Pages globales
    { id: 'home', name: 'Accueil', path: '/', status: 'online', lastChecked: new Date().toISOString() },

    // Dashboard principal
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', status: 'online', lastChecked: new Date().toISOString() },

    // Sous-pages du dashboard protégées par le wrapper de maintenance
    { id: 'inventory', name: 'Inventaire', path: '/dashboard/inventory', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'admin', name: 'Admin Panel', path: '/dashboard/admin', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'boutique', name: 'Boutique', path: '/dashboard/boutique', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'classement', name: 'Classement', path: '/dashboard/classement', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'events', name: 'Événements', path: '/dashboard/events', status: 'online', lastChecked: new Date().toISOString() },

    // Mini-jeux
    { id: 'mini-jeu', name: 'Mini-jeux', path: '/dashboard/mini-jeu', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'casino', name: 'Casino VIP', path: '/dashboard/mini-jeu/casino', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'gacha', name: 'Anime Gacha', path: '/dashboard/mini-jeu/gacha', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'blackjack', name: 'Blackjack', path: '/dashboard/mini-jeu/blackjack', status: 'online', lastChecked: new Date().toISOString() },

    // Anciennes pages encore utiles
    { id: 'profile', name: 'Profil', path: '/dashboard/profile', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'guild', name: 'Guildes', path: '/dashboard/guild', status: 'online', lastChecked: new Date().toISOString() },
  ] as PageStatus[],

  auditLogs: [] as AuditLog[],
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  store.auditLogs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...log,
  })
}

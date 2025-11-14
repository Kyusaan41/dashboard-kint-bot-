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

export const store = {
  sanctions: [] as Sanction[],

  broadcasts: [] as Broadcast[],

  pages: [
    { id: 'home', name: 'Accueil', path: '/', status: 'online', lastChecked: new Date().toISOString() },
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', status: 'online', lastChecked: new Date().toISOString() },
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

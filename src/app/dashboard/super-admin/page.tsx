'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Crown, Users, Shield, FileText, Zap, Settings, Loader2, CheckCircle,
  AlertTriangle, Database, TrendingUp, Activity, Ban, Megaphone,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserManagement } from './components/UserManagement'
import { PageManagement } from './components/PageManagement'
import { GlobalStats } from './components/GlobalStats'
import { AuditLogs } from './components/AuditLogs'
import { SanctionManager } from './components/SanctionManager'
import { BroadcastManager } from './components/BroadcastManager'
import { PermissionManager } from './components/PermissionManager'
import { AdvancedAnalytics } from './components/AdvancedAnalytics'

type UserRole = 'user' | 'moderator' | 'administrator' | 'super_admin'
type Tab = 'overview' | 'users' | 'pages' | 'advanced'
type AdvancedTab = 'logs' | 'sanctions' | 'broadcast' | 'permissions' | 'analytics'

interface UserWithRole {
  id: string
  username: string
  avatar: string
  siteRole: UserRole
  joinedAt: string
  lastActive: string
  points: number
  currency: number
}

interface PageStatus {
  id: string
  name: string
  path: string
  status: 'online' | 'maintenance'
  lastChecked: string
  responseTime?: number
}

interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())
const PROTECTED_USER_ID = process.env.NEXT_PUBLIC_PROTECTED_SUPER_ADMIN_ID ?? SUPER_ADMIN_IDS[0]

export default function SuperAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<UserWithRole[]>([])
  const [pages, setPages] = useState<PageStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' })
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>('logs')

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000)
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      if (!SUPER_ADMIN_IDS.includes(session.user.id)) {
        router.push('/dashboard')
      } else {
        loadData()
      }
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, session, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, pagesRes] = await Promise.all([
        fetch('/api/super-admin/users'),
        fetch('/api/super-admin/pages')
      ])

      if (!usersRes.ok || !pagesRes.ok) throw new Error('Failed to load data')

      const usersData = await usersRes.json()
      const pagesData = await pagesRes.json()

      setUsers(usersData.users || [])
      setPages(pagesData.pages || [])
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === PROTECTED_USER_ID) {
      showNotification('Impossible de modifier ce compte super-admin', 'error')
      return
    }

    try {
      const res = await fetch('/api/super-admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (!res.ok) throw new Error('Failed to update role')

      const updatedUser = await res.json()
      setUsers(users.map(u => u.id === userId ? { ...u, siteRole: newRole } : u))
      showNotification(`Rôle de ${updatedUser.username} mis à jour!`, 'success')
    } catch (error) {
      showNotification('Erreur lors de la modification du rôle', 'error')
    }
  }

  const handlePageMaintenance = async (pageId: string, newStatus: 'online' | 'maintenance', estimatedTime?: number) => {
    try {
      const res = await fetch('/api/super-admin/page-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, status: newStatus, estimatedTime })
      })

      if (!res.ok) throw new Error('Failed to update page status')

      setPages(pages.map(p => p.id === pageId ? { ...p, status: newStatus, lastChecked: new Date().toISOString() } : p))
      showNotification(`Page ${newStatus === 'maintenance' ? 'en maintenance' : 'en ligne'}`, 'success')
    } catch (error) {
      showNotification('Erreur lors de la mise à jour du statut', 'error')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
          <p className="text-gray-300 font-medium">Chargement du panneau super-admin...</p>
        </motion.div>
      </div>
    )
  }

  if (!SUPER_ADMIN_IDS.includes(session?.user?.id || '')) {
    return null
  }

  const onlinePages = pages.filter(p => p.status === 'online').length
  const adminCount = users.filter(u => u.siteRole === 'administrator').length
  const moderatorCount = users.filter(u => u.siteRole === 'moderator').length
  const superAdminCount = users.filter(u => u.siteRole === 'super_admin').length

  const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Aperçu', icon: Activity },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'advanced', label: 'Avancé', icon: Zap },
  ]

  return (
      <div className="min-h-screen bg-transparent text-white">
        <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.5 }}
            className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-50 text-white backdrop-blur-sm border ${
              notification.type === 'success'
                ? 'bg-green-600/90 border-green-500/50'
                : notification.type === 'error'
                ? 'bg-red-600/90 border-red-500/50'
                : 'bg-blue-600/90 border-blue-500/50'
            }`}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-400 rounded-xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
                Centre d'Administration Suprême
              </h1>
              <p className="text-gray-400 text-sm mt-1">Accès super-admin - Gestion complète du système</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <GlobalStats
                totalUsers={users.length}
                onlinePages={onlinePages}
                totalPages={pages.length}
                adminCount={adminCount}
                moderatorCount={moderatorCount}
                superAdminCount={superAdminCount}
              />

              <motion.div
                className="nyx-card p-8 rounded-2xl border border-purple-primary/20"
              >
                <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-400/10 border border-purple-500/30 rounded-xl hover:border-purple-500/60 transition-colors text-left"
                  >
                    <Database className="h-6 w-6 text-purple-400 mb-2" />
                    <h4 className="font-bold text-white">Sauvegarde</h4>
                    <p className="text-xs text-gray-400 mt-1">Sauvegarder les données</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-xl hover:border-blue-500/60 transition-colors text-left"
                  >
                    <TrendingUp className="h-6 w-6 text-blue-400 mb-2" />
                    <h4 className="font-bold text-white">Statistiques</h4>
                    <p className="text-xs text-gray-400 mt-1">Voir les stats globales</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-green-600/20 to-green-400/10 border border-green-500/30 rounded-xl hover:border-green-500/60 transition-colors text-left"
                  >
                    <Activity className="h-6 w-6 text-green-400 mb-2" />
                    <h4 className="font-bold text-white">Logs Système</h4>
                    <p className="text-xs text-gray-400 mt-1">Consulter les logs</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-red-600/20 to-red-400/10 border border-red-500/30 rounded-xl hover:border-red-500/60 transition-colors text-left"
                  >
                    <AlertTriangle className="h-6 w-6 text-red-400 mb-2" />
                    <h4 className="font-bold text-white">Alertes</h4>
                    <p className="text-xs text-gray-400 mt-1">Gérer les alertes</p>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="nyx-card p-8 rounded-2xl border border-purple-primary/20"
            >
              <UserManagement
                users={users}
                onRoleChange={handleRoleChange}
                protectedUserId={PROTECTED_USER_ID}
              />
            </motion.div>
          )}

          {activeTab === 'pages' && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="nyx-card p-8 rounded-2xl border border-purple-primary/20"
            >
              <PageManagement
                pages={pages}
                onMaintenanceToggle={handlePageMaintenance}
              />
            </motion.div>
          )}

          {activeTab === 'advanced' && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="nyx-card p-8 rounded-2xl border border-purple-primary/20 space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold mb-6">Fonctionnalités Avancées</h3>
                
                {/* Sub-tabs for Advanced */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-purple-primary/20">
                  {[
                    { id: 'logs', label: 'Audit Logs', icon: FileText },
                    { id: 'sanctions', label: 'Sanctions', icon: Ban },
                    { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
                    { id: 'permissions', label: 'Permissions', icon: Shield },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  ].map((tab) => {
                    const Icon = tab.icon as any
                    const TabIcon = tab.id === 'logs' ? FileText : 
                                   tab.id === 'sanctions' ? AlertTriangle :
                                   tab.id === 'broadcast' ? Database :
                                   tab.id === 'permissions' ? Shield :
                                   TrendingUp
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setAdvancedTab(tab.id as AdvancedTab)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                          advancedTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                      >
                        <TabIcon className="h-4 w-4" />
                        {tab.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {advancedTab === 'logs' && (
                  <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AuditLogs />
                  </motion.div>
                )}
                {advancedTab === 'sanctions' && (
                  <motion.div key="sanctions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SanctionManager />
                  </motion.div>
                )}
                {advancedTab === 'broadcast' && (
                  <motion.div key="broadcast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <BroadcastManager />
                  </motion.div>
                )}
                {advancedTab === 'permissions' && (
                  <motion.div key="permissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PermissionManager />
                  </motion.div>
                )}
                {advancedTab === 'analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AdvancedAnalytics />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
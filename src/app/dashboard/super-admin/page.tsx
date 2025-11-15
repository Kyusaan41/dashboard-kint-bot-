'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Crown, Users, Shield, FileText, Loader2, CheckCircle,
  AlertTriangle, Activity, Ban, Megaphone, TrendingUp,
  Settings, Zap, Database, Eye, BarChart3, UserCheck,
  Globe, Monitor, Palette, Sparkles, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserManagement } from './components/UserManagement'
import { PageManagement } from './components/PageManagement'
import { GlobalStats } from './components/GlobalStats'
import { AuditLogs } from './components/AuditLogs'
import { SanctionManager } from './components/SanctionManager'
import { BroadcastManager } from './components/BroadcastManager'
import { PermissionManager } from './components/PermissionManager'
import { ThemeTester } from './components/ThemeTester'
import { JackpotForcer } from './components/JackpotForcer'

type UserRole = 'user' | 'moderator' | 'administrator' | 'super_admin'
type Tab = 'overview' | 'management' | 'system' | 'tools'
type ManagementTab = 'users' | 'pages'
type SystemTab = 'logs' | 'sanctions' | 'broadcast' | 'permissions'

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
  const [managementTab, setManagementTab] = useState<ManagementTab>('users')
  const [systemTab, setSystemTab] = useState<SystemTab>('logs')

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


  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
          <p className="text-gray-300 font-medium">Chargement de la session...</p>
        </motion.div>
      </div>
    )
  }

  if (!SUPER_ADMIN_IDS.includes(session?.user?.id || '')) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-6">
        <div className="nyx-card p-8 rounded-2xl border border-red-500/30 text-center">
          <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
          <p className="text-gray-400">Votre compte n'est pas autorisé à accéder au panneau super-admin.</p>
        </div>
      </div>
    )
  }

  const onlinePages = pages.filter(p => p.status === 'online').length
  const adminCount = users.filter(u => u.siteRole === 'administrator').length
  const moderatorCount = users.filter(u => u.siteRole === 'moderator').length
  const superAdminCount = users.filter(u => u.siteRole === 'super_admin').length

  const tabs: { id: Tab; label: string; icon: React.ComponentType<any>; description: string }[] = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: Activity,
      description: 'Tableau de bord et statistiques générales'
    },
    {
      id: 'management',
      label: 'Gestion',
      icon: UserCheck,
      description: 'Utilisateurs et pages du système'
    },
    {
      id: 'system',
      label: 'Système',
      icon: Shield,
      description: 'Outils système avancés'
    },
    {
      id: 'tools',
      label: 'Outils',
      icon: Settings,
      description: 'Outils de développement et test'
    },
  ]

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden">

      {/* Enhanced Notifications */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.5 }}
            className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-50 text-white backdrop-blur-md border ${
              notification.type === 'success'
                ? 'bg-emerald-600/95 border-emerald-400/50 shadow-emerald-900/50'
                : notification.type === 'error'
                ? 'bg-red-600/95 border-red-400/50 shadow-red-900/50'
                : 'bg-blue-600/95 border-blue-400/50 shadow-blue-900/50'
            }`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            </motion.div>
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Header principal modernisé */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="relative bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-900/10">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 rounded-3xl" />
              <div className="absolute -top-1 -left-1 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl" />
              <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-xl" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-400/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Crown className="h-8 w-8 text-purple-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                      Centre Super Admin
                    </h1>
                    <p className="text-base text-gray-300 mt-2 max-w-md">
                      Gestion centralisée des utilisateurs, pages et outils système avancés.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-medium">Système opérationnel</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Clock className="h-3 w-3" />
                        <span>{new Date().toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicateurs principaux modernisés */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center backdrop-blur-sm">
                      <div className="text-xs text-gray-400 font-medium mb-1">Utilisateurs</div>
                      <div className="text-2xl font-bold text-white">{users.length}</div>
                      <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{width: '100%'}} />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center backdrop-blur-sm">
                      <div className="text-xs text-gray-400 font-medium mb-1">Pages en ligne</div>
                      <div className="text-2xl font-bold text-emerald-400">{onlinePages}</div>
                      <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{width: `${(onlinePages / pages.length) * 100}%`}} />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center backdrop-blur-sm">
                      <div className="text-xs text-gray-400 font-medium mb-1">Staff</div>
                      <div className="text-2xl font-bold text-blue-400">{adminCount + moderatorCount + superAdminCount}</div>
                      <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width: '100%'}} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation par onglets modernisée */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left group backdrop-blur-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-purple-600/20 border-purple-400/50 shadow-xl shadow-purple-900/30'
                      : 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-900/20'
                  }`}
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl mb-3 transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                        : 'bg-gray-700/50 text-gray-400 group-hover:text-gray-200 group-hover:bg-gray-600/50'
                    }`}>
                      <tab.icon className="h-6 w-6" />
                    </div>
                    <h3 className={`font-bold mb-2 transition-colors text-lg ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {tab.label}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors ${
                      activeTab === tab.id ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-300'
                    }`}>
                      {tab.description}
                    </p>
                  </div>

                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 rounded-full shadow-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
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
              {loading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Chargement des données...
                </div>
              )}


              {/* Stats Grid */}
              <GlobalStats
                totalUsers={users.length}
                onlinePages={onlinePages}
                totalPages={pages.length}
                adminCount={adminCount}
                moderatorCount={moderatorCount}
                superAdminCount={superAdminCount}
              />

              {/* Quick Actions Grid modernisée */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Users,
                    title: 'Gestion Utilisateurs',
                    description: 'Gérer les rôles et permissions des membres',
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-500/10 to-blue-600/10',
                    action: () => setActiveTab('management'),
                    stats: `${users.length} utilisateurs`
                  },
                  {
                    icon: Monitor,
                    title: 'État des Pages',
                    description: 'Maintenance et monitoring système',
                    color: 'from-emerald-500 to-emerald-600',
                    bgColor: 'from-emerald-500/10 to-emerald-600/10',
                    action: () => setActiveTab('management'),
                    stats: `${onlinePages}/${pages.length} en ligne`
                  },
                  {
                    icon: Shield,
                    title: 'Sécurité',
                    description: 'Logs d\'audit et sanctions actives',
                    color: 'from-red-500 to-red-600',
                    bgColor: 'from-red-500/10 to-red-600/10',
                    action: () => setActiveTab('system'),
                    stats: 'Système protégé'
                  },
                  {
                    icon: Palette,
                    title: 'Personnalisation',
                    description: 'Thèmes et apparence de l\'interface',
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-purple-500/10 to-purple-600/10',
                    action: () => setActiveTab('tools'),
                    stats: 'Interface moderne'
                  }
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    onClick={action.action}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 hover:border-gray-600/70 transition-all duration-500 text-left shadow-lg hover:shadow-2xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative">
                      <div className={`inline-flex p-4 rounded-2xl mb-4 transition-all duration-500 ${
                        `bg-gradient-to-br ${action.color} shadow-lg`
                      }`}>
                        <action.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">{action.title}</h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-3 leading-relaxed">{action.description}</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${action.color} text-white shadow-sm`}>
                        <span className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                        {action.stats}
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'management' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Management Sub-tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'users', label: 'Utilisateurs', icon: Users },
                  { id: 'pages', label: 'Pages', icon: FileText },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setManagementTab(tab.id as ManagementTab)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                      managementTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/30'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Management Content */}
              <AnimatePresence mode="wait">
                {managementTab === 'users' && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="nyx-card p-8 rounded-2xl border border-blue-500/20"
                  >
                    {loading && (
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Chargement des utilisateurs...
                      </div>
                    )}
                    <UserManagement
                      users={users}
                      onRoleChange={handleRoleChange}
                      protectedUserId={PROTECTED_USER_ID}
                    />
                  </motion.div>
                )}

                {managementTab === 'pages' && (
                  <motion.div
                    key="pages"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="nyx-card p-8 rounded-2xl border border-green-500/20"
                  >
                    {loading && (
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Chargement des pages...
                      </div>
                    )}
                    <PageManagement
                      pages={pages}
                      onMaintenanceToggle={handlePageMaintenance}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="nyx-card p-8 rounded-2xl border border-purple-primary/20 space-y-6"
            >
              {loading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Chargement des données...
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold mb-6">Outils Système</h3>

                {/* Sub-tabs for System */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-purple-primary/20">
                  {[
                    { id: 'logs', label: 'Logs d\'Audit', icon: FileText },
                    { id: 'sanctions', label: 'Sanctions', icon: Ban },
                    { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
                    { id: 'permissions', label: 'Permissions', icon: Shield },
                  ].map((tab) => {
                    const TabIcon = tab.id === 'logs' ? FileText :
                                    tab.id === 'sanctions' ? Ban :
                                    tab.id === 'broadcast' ? Megaphone :
                                    Shield
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setSystemTab(tab.id as SystemTab)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                          systemTab === tab.id
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
                {systemTab === 'logs' && (
                  <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AuditLogs />
                  </motion.div>
                )}
                {systemTab === 'sanctions' && (
                  <motion.div key="sanctions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SanctionManager />
                  </motion.div>
                )}
                {systemTab === 'broadcast' && (
                  <motion.div key="broadcast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <BroadcastManager />
                  </motion.div>
                )}
                {systemTab === 'permissions' && (
                  <motion.div key="permissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PermissionManager />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Tools Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Outils de Développement</h2>
                <p className="text-gray-400 text-lg">Outils avancés pour tester et personnaliser l'application</p>
              </motion.div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Theme Tester */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Palette className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Testeur de Thèmes</h3>
                      <p className="text-sm text-gray-400">Prévisualisez et testez tous les thèmes disponibles</p>
                    </div>
                  </div>
                  <ThemeTester />
                </motion.div>

                {/* Jackpot Forcer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Contrôle du Jackpot</h3>
                      <p className="text-sm text-gray-400">Marquer des utilisateurs pour gagner le jackpot</p>
                    </div>
                  </div>
                  <JackpotForcer
                    users={users}
                    onNotification={showNotification}
                  />
                </motion.div>

                {/* Development Tools */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Outils Développeur</h3>
                      <p className="text-sm text-gray-400">Fonctionnalités avancées pour les développeurs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        icon: Database,
                        title: 'Base de Données',
                        description: 'Outils de gestion et sauvegarde',
                        color: 'from-orange-500 to-red-500',
                        status: 'Bientôt disponible'
                      },
                      {
                        icon: Eye,
                        title: 'Monitoring',
                        description: 'Surveillance en temps réel',
                        color: 'from-green-500 to-emerald-500',
                        status: 'En développement'
                      },
                      {
                        icon: BarChart3,
                        title: 'Rapports',
                        description: 'Génération de rapports détaillés',
                        color: 'from-cyan-500 to-blue-500',
                        status: 'Planifié'
                      },
                      {
                        icon: Globe,
                        title: 'API Explorer',
                        description: 'Test des endpoints API',
                        color: 'from-purple-500 to-indigo-500',
                        status: 'À venir'
                      }
                    ].map((tool, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/70 transition-all duration-300"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
                        <div className="relative flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} opacity-20`}>
                            <tool.icon className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{tool.title}</h4>
                            <p className="text-sm text-gray-400 mb-2">{tool.description}</p>
                            <span className="inline-block px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full">
                              {tool.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
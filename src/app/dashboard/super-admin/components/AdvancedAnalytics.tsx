'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, Server, AlertCircle, Loader2 } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeToday: number
    newToday: number
    totalPages: number
    onlinePages: number
    averageSessionTime: number
    bounceRate: number
    conversionRate: number
  }
  topPages: Array<{
    name: string
    views: number
    uniqueVisitors: number
    avgTime: number
  }>
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    dbLatency: number
    cacheHitRate: number
  }
  topUsers: Array<{
    id: string
    username: string
    score: number
    level: number
  }>
}

export function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/super-admin/analytics')
      const data = await res.json()
      setAnalytics(data.stats)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    )
  }

  if (!analytics) return null

  const cards = [
    { label: 'Utilisateurs Total', value: analytics.overview.totalUsers, icon: Activity, color: 'blue' },
    { label: 'Actifs Aujourd\'hui', value: analytics.overview.activeToday, icon: TrendingUp, color: 'green' },
    { label: 'Nouveaux Utilisateurs', value: analytics.overview.newToday, icon: Activity, color: 'purple' },
    { label: 'Pages En Ligne', value: `${analytics.overview.onlinePages}/${analytics.overview.totalPages}`, icon: Server, color: 'yellow' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-cyan-400" />
        <h3 className="text-2xl font-bold">Analytics Avancés</h3>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          const colorMap = {
            blue: 'from-blue-600/20 to-blue-400/10 border-blue-500/30 text-blue-400',
            green: 'from-green-600/20 to-green-400/10 border-green-500/30 text-green-400',
            purple: 'from-purple-600/20 to-purple-400/10 border-purple-500/30 text-purple-400',
            yellow: 'from-yellow-600/20 to-yellow-400/10 border-yellow-500/30 text-yellow-400',
          }

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 bg-gradient-to-br ${colorMap[card.color as keyof typeof colorMap]} border rounded-xl`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
                <Icon className="h-8 w-8 opacity-50" />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gray-800/40 border border-gray-700/30 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Pages les Plus Visitées</h4>
          <div className="space-y-3">
            {analytics.topPages.map((page, i) => (
              <div key={i} className="p-3 bg-gray-700/20 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-white text-sm">{page.name}</p>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {page.views} vues
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <span>Visiteurs: {page.uniqueVisitors}</span>
                  <span>Temps moy: {page.avgTime}m</span>
                </div>
                <div className="mt-2 bg-gray-600/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300"
                    style={{ width: `${(page.views / Math.max(...analytics.topPages.map(p => p.views))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gray-800/40 border border-gray-700/30 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" />
            Santé du Système
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Uptime', value: `${analytics.systemHealth.uptime}%`, color: 'green' },
              { label: 'Temps de réponse', value: `${analytics.systemHealth.responseTime}ms`, color: 'blue' },
              { label: 'Taux d\'erreur', value: `${analytics.systemHealth.errorRate}%`, color: analytics.systemHealth.errorRate > 1 ? 'red' : 'green' },
              { label: 'Latence DB', value: `${analytics.systemHealth.dbLatency}ms`, color: 'blue' },
              { label: 'Cache Hit Rate', value: `${analytics.systemHealth.cacheHitRate}%`, color: 'green' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{stat.label}</span>
                <span className={`text-sm font-semibold ${
                  stat.color === 'green' ? 'text-green-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gray-800/40 border border-gray-700/30 rounded-xl lg:col-span-2"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Meilleurs Utilisateurs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.topUsers.map((user, i) => (
              <div key={i} className="p-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg text-center">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                  #{i + 1}
                </div>
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <div className="mt-2 text-xs text-gray-300">
                  <div>Score: {user.score}</div>
                  <div>Lvl: {user.level}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
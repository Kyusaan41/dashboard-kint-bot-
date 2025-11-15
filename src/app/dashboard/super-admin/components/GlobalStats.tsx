'use client'

import { motion } from 'framer-motion'
import { Users, Activity, Shield, TrendingUp, Database, Clock } from 'lucide-react'

interface StatsProps {
  totalUsers: number
  onlinePages: number
  totalPages: number
  adminCount: number
  moderatorCount: number
  superAdminCount: number
}

export function GlobalStats({
  totalUsers,
  onlinePages,
  totalPages,
  adminCount,
  moderatorCount,
  superAdminCount,
}: StatsProps) {
  const stats = [
    {
      icon: Users,
      label: 'Utilisateurs Total',
      value: totalUsers,
      color: 'from-purple-500 to-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Activity,
      label: 'Pages en Ligne',
      value: `${onlinePages}/${totalPages}`,
      color: 'from-green-500 to-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Shield,
      label: 'Administrateurs',
      value: adminCount,
      color: 'from-yellow-500 to-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Modérateurs',
      value: moderatorCount,
      color: 'from-blue-500 to-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Database,
      label: 'Super Admins',
      value: superAdminCount,
      color: 'from-red-500 to-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Clock,
      label: 'Dernière Mise à Jour',
      value: new Date().toLocaleTimeString('fr-FR'),
      color: 'from-indigo-500 to-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative group overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md p-6 rounded-3xl border border-gray-700/50 hover:border-gray-600/70 transition-all duration-500 shadow-lg hover:shadow-2xl"
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2 group-hover:text-gray-300 transition-colors">{stat.label}</p>
              <h3 className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </h3>
              {/* Progress bar for visual interest */}
              <div className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                />
              </div>
            </div>
            <div className="relative">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-500`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            </div>
          </div>

          {/* Hover ring effect */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
        </motion.div>
      ))}
    </div>
  )
}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${stat.bgColor} p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/80 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <h3 className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} opacity-20`}>
              <stat.icon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
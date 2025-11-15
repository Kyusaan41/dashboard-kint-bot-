'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, AlertTriangle, ToggleRight, Clock, X } from 'lucide-react'

interface PageStatus {
  id: string
  name: string
  path: string
  status: 'online' | 'maintenance'
  lastChecked: string
  responseTime?: number
}

interface Props {
  pages: PageStatus[]
  onMaintenanceToggle: (pageId: string, status: 'online' | 'maintenance', estimatedTime?: number) => Promise<void>
}

export function PageManagement({ pages, onMaintenanceToggle }: Props) {
  const [pageMaintenanceEdit, setPageMaintenanceEdit] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [maintenanceTime, setMaintenanceTime] = useState<number>(30)

  const handleToggle = async (pageId: string, newStatus: 'online' | 'maintenance') => {
    setLoading(pageId)
    try {
      await onMaintenanceToggle(pageId, newStatus, newStatus === 'maintenance' ? maintenanceTime : undefined)
    } finally {
      setLoading(null)
      setPageMaintenanceEdit(null)
      setMaintenanceTime(30)
    }
  }

  return (
    <div className="space-y-4 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {pages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Aucune page à afficher</p>
          <p className="text-gray-500 text-sm mt-1">Les pages apparaîtront ici une fois configurées</p>
        </motion.div>
      ) : (
        pages.map((page, index) => (
          <motion.div
            key={page.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl hover:border-blue-500/30 transition-all duration-500 shadow-lg hover:shadow-2xl p-6"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">{page.name}</h3>
                <p className="text-sm text-gray-400 font-mono bg-gray-900/30 border border-gray-700/30 rounded-lg px-3 py-1 inline-block">
                  {page.path}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border ${
                page.status === 'online'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${page.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                {page.status === 'online' ? '🟢 En Ligne' : '🔴 Maintenance'}
              </div>
            </div>

            {pageMaintenanceEdit === page.id ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-gray-700/30 space-y-4"
              >
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 space-y-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-300 block mb-2">Temps estimé (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={maintenanceTime}
                        onChange={(e) => setMaintenanceTime(Math.max(1, parseInt(e.target.value) || 30))}
                        disabled={loading === page.id}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/25 text-sm transition-all duration-300 disabled:opacity-50"
                        placeholder="30"
                      />
                    </div>
                    <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl min-w-fit">
                      <span className="text-sm text-blue-300 font-medium">
                        {Math.floor(maintenanceTime / 60)}h {maintenanceTime % 60}m
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggle(page.id, 'online')}
                      disabled={loading === page.id}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <ToggleRight className="h-5 w-5" />
                      Mettre En Ligne
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggle(page.id, 'maintenance')}
                      disabled={loading === page.id}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Maintenance
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPageMaintenanceEdit(null)}
                      disabled={loading === page.id}
                      className="p-3 bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50 disabled:opacity-50 rounded-xl transition-all duration-300"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(page.lastChecked).toLocaleTimeString('fr-FR')}
                  </div>
                  {page.responseTime && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                      <span>Temps: {page.responseTime}ms</span>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPageMaintenanceEdit(page.id)}
                  className="p-3 hover:bg-blue-500/20 rounded-xl transition-colors group/btn"
                >
                  <Settings className="h-5 w-5 text-blue-400 group-hover/btn:text-blue-300" />
                </motion.button>
              </div>
            )}

            {/* Hover ring effect */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
          </motion.div>
        ))
      )}
    </div>
  )
}
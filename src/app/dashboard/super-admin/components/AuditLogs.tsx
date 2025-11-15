'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface AuditLog {
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

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/super-admin/audit-logs?limit=50')
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.adminName.toLowerCase().includes(search.toLowerCase()) ||
    log.targetName?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header modernisé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Logs d'Audit
              </h3>
              <p className="text-gray-300 text-sm">Historique des actions administratives</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadLogs}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl text-sm font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>Rafraîchir</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Search modernisé */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les logs d'audit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-base"
            />
          </div>
        </div>
      </motion.div>

      {/* Logs list modernisée */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {filteredLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative group overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl hover:border-gray-600/70 transition-all duration-500 shadow-lg hover:shadow-2xl p-6"
          >
            {/* Background effects */}
            <div className={`absolute inset-0 bg-gradient-to-r ${
              log.status === 'success' ? 'from-emerald-600/5' : 'from-red-600/5'
            } via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  log.status === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="font-bold text-white text-lg">{log.action}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      log.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {log.status === 'success' ? '✅ Succès' : '❌ Échec'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    <span className="text-purple-400 font-medium">{log.adminName}</span>
                    {log.targetName && (
                      <>
                        <span className="text-gray-500 mx-2">→</span>
                        <span className="text-blue-400 font-medium">{log.targetName}</span>
                      </>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm bg-gray-900/30 border border-gray-700/30 rounded-lg p-3 leading-relaxed">
                    {log.details}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-xs text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Hover ring effect */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
          </motion.div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Aucun log trouvé</p>
          <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
        </motion.div>
      )}
    </div>
  )
}
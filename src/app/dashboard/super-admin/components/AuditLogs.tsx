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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-400" />
          Audit Logs
        </h3>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:border-blue-500/60 transition-all text-sm font-medium text-blue-300"
        >
          Rafraîchir
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher dans les logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="text-xs text-gray-400 bg-gray-700/40 px-2 py-1 rounded">
                    {log.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  <span className="text-purple-400">{log.adminName}</span>
                  {log.targetName && (
                    <>
                      {' → '}
                      <span className="text-blue-400">{log.targetName}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{log.details}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucun log trouvé
        </div>
      )}
    </div>
  )
}
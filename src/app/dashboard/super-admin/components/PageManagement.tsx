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
    <div className="space-y-3 max-h-[800px] overflow-y-auto">
      {pages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aucune page à afficher
        </div>
      ) : (
        pages.map((page) => (
          <motion.div
            key={page.id}
            layout
            className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-blue-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{page.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{page.path}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                page.status === 'online'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${page.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {page.status === 'online' ? 'En Ligne' : 'Maintenance'}
              </div>
            </div>

            {pageMaintenanceEdit === page.id ? (
              <div className="pt-3 border-t border-gray-700/30 space-y-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">Temps estimé (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={maintenanceTime}
                      onChange={(e) => setMaintenanceTime(Math.max(1, parseInt(e.target.value) || 30))}
                      disabled={loading === page.id}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm disabled:opacity-50"
                      placeholder="30"
                    />
                  </div>
                  <span className="text-xs text-gray-400 px-2 py-2 bg-gray-800 rounded-lg min-w-fit">
                    {Math.floor(maintenanceTime / 60)}h {maintenanceTime % 60}m
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleToggle(page.id, 'online')}
                    disabled={loading === page.id}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ToggleRight className="h-4 w-4" />
                    En Ligne
                  </button>
                  <button
                    onClick={() => handleToggle(page.id, 'maintenance')}
                    disabled={loading === page.id}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Maintenance
                  </button>
                  <button
                    onClick={() => setPageMaintenanceEdit(null)}
                    disabled={loading === page.id}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
                <div className="text-xs text-gray-400">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {new Date(page.lastChecked).toLocaleTimeString('fr-FR')}
                </div>
                <button
                  onClick={() => setPageMaintenanceEdit(page.id)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 text-blue-400" />
                </button>
              </div>
            )}

            {page.responseTime && (
              <div className="mt-2 text-xs text-gray-400">
                Temps réponse: <span className="text-blue-400">{page.responseTime}ms</span>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  )
}
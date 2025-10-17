'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ban, AlertCircle, Volume2, Clock, X, Plus, Loader2 } from 'lucide-react'

interface Sanction {
  id: string
  userId: string
  username: string
  type: 'ban' | 'mute' | 'warn'
  reason: string
  duration?: number
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
}

export function SanctionManager() {
  const [sanctions, setSanctions] = useState<Sanction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newSanction, setNewSanction] = useState({
    userId: '',
    username: '',
    type: 'mute' as const,
    reason: '',
    duration: 60,
  })

  useEffect(() => {
    loadSanctions()
  }, [])

  const loadSanctions = async () => {
    try {
      const res = await fetch('/api/super-admin/sanctions?active=true')
      const data = await res.json()
      setSanctions(data.sanctions || [])
    } catch (error) {
      console.error('Error loading sanctions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSanction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSanction.userId || !newSanction.reason) return

    try {
      const res = await fetch('/api/super-admin/sanctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSanction),
      })

      if (res.ok) {
        const data = await res.json()
        setSanctions([data.sanction, ...sanctions])
        setNewSanction({ userId: '', username: '', type: 'mute', reason: '', duration: 60 })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding sanction:', error)
    }
  }

  const handleRemoveSanction = async (sanctionId: string) => {
    try {
      await fetch(`/api/super-admin/sanctions?id=${sanctionId}`, {
        method: 'DELETE',
      })
      setSanctions(sanctions.filter(s => s.id !== sanctionId))
    } catch (error) {
      console.error('Error removing sanction:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ban':
        return <Ban className="h-5 w-5 text-red-500" />
      case 'mute':
        return <Volume2 className="h-5 w-5 text-yellow-500" />
      case 'warn':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return null
    }
  }

  const getDurationText = (duration?: number, expiresAt?: string) => {
    if (!duration && !expiresAt) return 'Permanent'
    if (expiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000 / 60))
      if (remaining === 0) return 'Expiré'
      if (remaining < 60) return `${remaining}m`
      if (remaining < 1440) return `${Math.floor(remaining / 60)}h`
      return `${Math.floor(remaining / 1440)}j`
    }
    return `${duration}m`
  }

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
          <Ban className="h-6 w-6 text-red-400" />
          Gestion des Sanctions
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:border-red-500/60 transition-all text-sm font-medium text-red-300 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Sanction
        </motion.button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddSanction}
          className="p-4 bg-gray-800/40 border border-red-500/30 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ID Utilisateur"
              value={newSanction.userId}
              onChange={(e) => setNewSanction({ ...newSanction, userId: e.target.value })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
            />
            <input
              type="text"
              placeholder="Nom Utilisateur"
              value={newSanction.username}
              onChange={(e) => setNewSanction({ ...newSanction, username: e.target.value })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={newSanction.type}
              onChange={(e) => setNewSanction({ ...newSanction, type: e.target.value as any })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 focus:outline-none focus:border-red-500/50 text-sm"
            >
              <option value="mute">Mute</option>
              <option value="ban">Ban</option>
              <option value="warn">Warn</option>
            </select>
            <input
              type="number"
              placeholder="Durée (minutes)"
              value={newSanction.duration}
              onChange={(e) => setNewSanction({ ...newSanction, duration: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
            />
          </div>

          <textarea
            placeholder="Raison de la sanction"
            value={newSanction.reason}
            onChange={(e) => setNewSanction({ ...newSanction, reason: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
            rows={2}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600/30 border border-red-500/50 rounded-lg hover:bg-red-600/40 transition-all text-sm font-medium text-red-300"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg hover:bg-gray-700/40 transition-all text-sm font-medium text-gray-300"
            >
              Annuler
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sanctions.map((sanction, i) => (
          <motion.div
            key={sanction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getTypeIcon(sanction.type)}
                <div>
                  <p className="font-semibold text-white">{sanction.username}</p>
                  <p className="text-sm text-gray-400">{sanction.reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Par: {sanction.createdBy}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDurationText(sanction.duration, sanction.expiresAt)}
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveSanction(sanction.id)}
                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-500"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {sanctions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucune sanction active
        </div>
      )}
    </div>
  )
}
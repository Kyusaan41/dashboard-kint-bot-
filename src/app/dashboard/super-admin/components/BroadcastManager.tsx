'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, AlertTriangle, Eye, X, Plus, Clock, Loader2 } from 'lucide-react'

interface Broadcast {
  id: string
  title: string
  message: string
  type: 'announcement' | 'warning' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  expiresAt?: string
  createdBy: string
  active: boolean
  views?: number
}

export function BroadcastManager() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    type: 'announcement' as const,
    priority: 'medium' as const,
    durationHours: 24,
  })

  useEffect(() => {
    loadBroadcasts()
  }, [])

  const loadBroadcasts = async () => {
    try {
      const res = await fetch('/api/super-admin/broadcast')
      const data = await res.json()
      setBroadcasts(data.broadcasts || [])
    } catch (error) {
      console.error('Error loading broadcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcast.title || !newBroadcast.message) return

    try {
      const res = await fetch('/api/super-admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBroadcast),
      })

      if (res.ok) {
        const data = await res.json()
        setBroadcasts([data.broadcast, ...broadcasts])
        setNewBroadcast({
          title: '',
          message: '',
          type: 'announcement',
          priority: 'medium',
          durationHours: 24,
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding broadcast:', error)
    }
  }

  const handleRemoveBroadcast = async (broadcastId: string) => {
    try {
      await fetch(`/api/super-admin/broadcast?id=${broadcastId}`, {
        method: 'DELETE',
      })
      setBroadcasts(broadcasts.filter(b => b.id !== broadcastId))
    } catch (error) {
      console.error('Error removing broadcast:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600/20 border-red-500/30 text-red-300'
      case 'medium':
        return 'bg-yellow-600/20 border-yellow-500/30 text-yellow-300'
      case 'low':
        return 'bg-blue-600/20 border-blue-500/30 text-blue-300'
      default:
        return 'bg-gray-600/20 border-gray-500/30 text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'maintenance':
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <Megaphone className="h-5 w-5 text-blue-500" />
    }
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
          <Megaphone className="h-6 w-6 text-green-400" />
          Broadcasts Système
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg hover:border-green-500/60 transition-all text-sm font-medium text-green-300 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Message
        </motion.button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddBroadcast}
          className="p-4 bg-gray-800/40 border border-green-500/30 rounded-lg space-y-4"
        >
          <input
            type="text"
            placeholder="Titre du message"
            value={newBroadcast.title}
            onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50 text-sm"
          />

          <textarea
            placeholder="Message à envoyer"
            value={newBroadcast.message}
            onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50 text-sm"
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <select
              value={newBroadcast.type}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, type: e.target.value as any })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 focus:outline-none focus:border-green-500/50 text-sm"
            >
              <option value="announcement">Annonce</option>
              <option value="warning">Avertissement</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={newBroadcast.priority}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, priority: e.target.value as any })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 focus:outline-none focus:border-green-500/50 text-sm"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>

            <input
              type="number"
              placeholder="Durée (heures)"
              value={newBroadcast.durationHours}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, durationHours: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600/30 border border-green-500/50 rounded-lg hover:bg-green-600/40 transition-all text-sm font-medium text-green-300"
            >
              Envoyer
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
        {broadcasts.map((broadcast, i) => (
          <motion.div
            key={broadcast.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 border rounded-lg hover:border-opacity-60 transition-all ${getPriorityColor(broadcast.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getTypeIcon(broadcast.type)}
                <div>
                  <p className="font-semibold text-white">{broadcast.title}</p>
                  <p className="text-sm text-gray-300 mt-1">{broadcast.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Par: {broadcast.createdBy}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {broadcast.views || 0} vues
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveBroadcast(broadcast.id)}
                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-500"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {broadcasts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucun broadcast actif
        </div>
      )}
    </div>
  )
}
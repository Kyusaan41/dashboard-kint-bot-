'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Ban, AlertCircle, Volume2, Clock, X, Plus, Loader2, Search, User } from 'lucide-react'
import Image from 'next/image'

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

interface UserSuggestion {
  id: string
  username: string
  avatar: string
  siteRole: string
  points: number
  currency: number
}

export function SanctionManager() {
  const [sanctions, setSanctions] = useState<Sanction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentTab, setCurrentTab] = useState<'all' | 'bans'>('bans')
  const [newSanction, setNewSanction] = useState({
    userId: '',
    username: '',
    type: 'ban' as const,
    reason: '',
    duration: 60,
  })

  // États pour l'auto-complète
  const [userSearch, setUserSearch] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSanctions()

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
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

  // Fonction de recherche d'utilisateurs avec debounce
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUserSuggestions([])
      setShowSuggestions(false)
      return
    }

    setSearchingUsers(true)
    try {
      const res = await fetch('/api/super-admin/users')
      const data = await res.json()

      if (res.ok && data.users) {
        const filteredUsers = data.users.filter((user: UserSuggestion) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.id.includes(query)
        ).slice(0, 5) // Limiter à 5 résultats

        setUserSuggestions(filteredUsers)
        setShowSuggestions(filteredUsers.length > 0)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setUserSuggestions([])
    } finally {
      setSearchingUsers(false)
    }
  }

  // Gestionnaire de changement pour le champ de recherche utilisateur
  const handleUserSearchChange = (value: string) => {
    setUserSearch(value)
    setNewSanction(prev => ({ ...prev, username: value }))

    // Annuler le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Déclencher la recherche avec debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(value)
    }, 300)
  }

  // Sélection d'un utilisateur depuis les suggestions
  const selectUser = (user: UserSuggestion) => {
    setNewSanction(prev => ({
      ...prev,
      userId: user.id,
      username: user.username
    }))
    setUserSearch(user.username)
    setShowSuggestions(false)
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
        setNewSanction({ userId: '', username: '', type: 'ban', reason: '', duration: 60 })
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

  const filteredSanctions = currentTab === 'all' ? sanctions : sanctions.filter(s => s.type === 'ban')

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

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'all'
              ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
              : 'bg-gray-700/20 border border-gray-600/30 text-gray-400 hover:bg-gray-700/30'
          }`}
        >
          Toutes les sanctions
        </button>
        <button
          onClick={() => setCurrentTab('bans')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'bans'
              ? 'bg-red-600/20 border border-red-500/30 text-red-300'
              : 'bg-gray-700/20 border border-gray-600/30 text-gray-400 hover:bg-gray-700/30'
          }`}
        >
          Bans actifs
        </button>
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
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={userSearch}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  onFocus={() => userSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>

              {/* Dropdown des suggestions */}
              {showSuggestions && userSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                >
                  {userSuggestions.map((user) => (
                    <motion.button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
                      whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      className="w-full px-3 py-2 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3"
                    >
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{user.points} pts</p>
                        <p className="text-xs text-gray-400">{user.currency} 💰</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
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
        {filteredSanctions.map((sanction, i) => (
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
                className={`p-2 rounded-lg transition-colors ${
                  sanction.type === 'ban'
                    ? 'hover:bg-green-600/20 text-green-500'
                    : 'hover:bg-red-600/20 text-red-500'
                }`}
              >
                {sanction.type === 'ban' ? (
                  <span className="text-sm font-medium">Unban</span>
                ) : (
                  <X className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSanctions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          {currentTab === 'all' ? 'Aucune sanction active' : 'Aucun ban actif'}
        </div>
      )}
    </div>
  )
}
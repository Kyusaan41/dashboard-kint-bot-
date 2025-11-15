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
  // Only handling bans now
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
    loadBans()

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const loadBans = async () => {
    try {
      const res = await fetch('/api/admin/bans')
      const data = await res.json()
      setSanctions(data.bans || [])
    } catch (error) {
      console.error('Error loading bans:', error)
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

  const handleAddBan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSanction.userId || !newSanction.reason) return

    try {
      const res = await fetch('/api/admin/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newSanction.userId,
          reason: newSanction.reason,
          duration: newSanction.duration || null
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSanctions([data.ban, ...sanctions])
        setNewSanction({ userId: '', username: '', type: 'ban', reason: '', duration: 60 })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding ban:', error)
    }
  }

  const handleRemoveBan = async (userId: string) => {
    try {
      await fetch(`/api/admin/bans?userId=${userId}`, {
        method: 'DELETE',
      })
      setSanctions(sanctions.filter(s => s.userId !== userId))
    } catch (error) {
      console.error('Error removing ban:', error)
    }
  }

  const handleHardReset = async () => {
    if (!confirm('ATTENTION: Cette action va supprimer TOUS les bans de façon permanente. Êtes-vous sûr ?')) {
      return
    }

    try {
      const res = await fetch('/api/admin/bans/reset', {
        method: 'POST',
      })

      if (res.ok) {
        setSanctions([])
        alert('Tous les bans ont été supprimés.')
      } else {
        alert('Erreur lors de la réinitialisation.')
      }
    } catch (error) {
      console.error('Error resetting bans:', error)
      alert('Erreur lors de la réinitialisation.')
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

  const filteredBans = sanctions

  return (
    <div className="space-y-8">
      {/* Header modernisé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-red-500/20 to-transparent rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Ban className="h-8 w-8 text-red-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                Gestion des Sanctions
              </h3>
              <p className="text-gray-300 text-base mt-1">
                Bans actifs sur le système • API admin sécurisée
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-300 font-medium">
                  {sanctions.length} sanctions actives
                </div>
                <div className="px-3 py-1 bg-gray-500/10 border border-gray-500/20 rounded-full text-sm text-gray-300 font-medium">
                  Système protégé
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHardReset}
              className="px-6 py-3 rounded-2xl border border-gray-600/60 bg-gray-800/60 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-400/70 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm shadow-lg hover:shadow-xl"
            >
              <X className="h-5 w-5" />
              Réinitialiser tous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-medium text-white hover:from-red-500 hover:to-red-400 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Nouveau ban
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Formulaire de création modernisé */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0, y: 20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          onSubmit={handleAddBan}
          className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-xl" />

          <div className="relative space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-white mb-2">Nouvelle Sanction</h4>
              <p className="text-gray-400 text-sm">Remplissez les informations pour appliquer une sanction</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">ID Utilisateur</label>
                <input
                  type="text"
                  placeholder="Entrez l'ID de l'utilisateur"
                  value={newSanction.userId}
                  onChange={(e) => setNewSanction({ ...newSanction, userId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/25 text-sm transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Rechercher Utilisateur</label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl blur-sm" />
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Nom d'utilisateur ou ID..."
                      value={userSearch}
                      onChange={(e) => handleUserSearchChange(e.target.value)}
                      onFocus={() => userSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/25 text-sm transition-all duration-300"
                    />
                    {searchingUsers && (
                      <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-red-400" />
                    )}
                  </div>

                  {/* Dropdown des suggestions modernisé */}
                  {showSuggestions && userSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                    >
                      {userSuggestions.map((user) => (
                        <motion.button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          whileHover={{ scale: 1.02, x: 2 }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800/80 transition-all duration-300 flex items-center gap-4 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <Image
                            src={user.avatar}
                            alt={user.username}
                            width={40}
                            height={40}
                            className="rounded-xl border border-gray-600/50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-green-400 font-medium">{user.points} pts</p>
                            <p className="text-xs text-yellow-400 font-medium">{user.currency} $</p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Type de Sanction</label>
                <select
                  value={newSanction.type}
                  onChange={(e) => setNewSanction({ ...newSanction, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/25 text-sm transition-all duration-300"
                >
                  <option value="ban">🚫 Ban</option>
                  <option value="mute">🔇 Mute</option>
                  <option value="warn">⚠️ Avertissement</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Durée (minutes)</label>
                <input
                  type="number"
                  placeholder="0 = permanent"
                  value={newSanction.duration}
                  onChange={(e) => setNewSanction({ ...newSanction, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/25 text-sm transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Raison de la Sanction</label>
              <textarea
                placeholder="Décrivez la raison de cette sanction..."
                value={newSanction.reason}
                onChange={(e) => setNewSanction({ ...newSanction, reason: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/25 text-sm transition-all duration-300 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 text-sm font-semibold text-white rounded-xl hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Appliquer la Sanction
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 text-sm font-medium text-gray-200 backdrop-blur-sm"
              >
                Annuler
              </motion.button>
            </div>
          </div>
        </motion.form>
      )}

      {/* Liste des sanctions modernisée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl shadow-2xl max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        {filteredBans.length > 0 ? (
          <div className="relative divide-y divide-gray-700/50">
            {filteredBans.map((ban, i) => (
              <motion.div
                key={ban.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group p-6 hover:bg-gray-800/40 transition-all duration-300"
              >
                {/* Hover effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        {getTypeIcon(ban.type)}
                      </div>
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-white text-lg">{ban.username || 'Utilisateur inconnu'}</span>
                        <span className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-xs text-gray-300 font-medium">
                          ID: {ban.userId.slice(0, 8)}...
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          ban.type === 'ban' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          ban.type === 'mute' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        }`}>
                          {ban.type === 'ban' ? '🚫 Ban' : ban.type === 'mute' ? '🔇 Mute' : '⚠️ Avertissement'}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed bg-gray-900/30 border border-gray-700/30 rounded-lg p-3">
                        {ban.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full">
                          <User className="h-3 w-3" />
                          <span>Par: {(ban as any).bannedBy || ban.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full">
                          <Clock className="h-3 w-3" />
                          <span>{getDurationText(ban.duration, ban.expiresAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full">
                          <span>Créé le {new Date(ban.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveBan(ban.userId)}
                    className="flex-shrink-0 ml-6 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>Unban</span>
                  </motion.button>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Ban className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg font-medium mb-2">Aucune sanction active</p>
            <p className="text-gray-500 text-sm">Le système est propre pour le moment</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
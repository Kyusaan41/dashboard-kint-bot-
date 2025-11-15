'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Crown, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface JackpotForce {
  id: string
  userId: string
  username: string
  markedAt: string
  markedBy: string
  active: boolean
  type: 'jackpot' | 'test'
}

interface User {
  id: string
  username: string
  avatar: string
  siteRole: string
  joinedAt: string
  lastActive: string
  points: number
  currency: number
}

interface Props {
  users: User[]
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export function JackpotForcer({ users, onNotification }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [jackpotForces, setJackpotForces] = useState<JackpotForce[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadJackpotForces = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/super-admin/jackpot-force')
      if (!res.ok) throw new Error('Failed to load jackpot forces')
      const data = await res.json()
      setJackpotForces(data.forces || [])
    } catch (error) {
      console.error('Error loading jackpot forces:', error)
      onNotification('Erreur lors du chargement des marquages jackpot', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJackpotForces()
  }, [])

  const handleMarkUser = async (user: User, type: 'jackpot' | 'test' = 'jackpot') => {
    setActionLoading(user.id)
    try {
      const res = await fetch('/api/super-admin/jackpot-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          action: 'mark'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du marquage')
      }

      onNotification(data.message, 'success')
      await loadJackpotForces()
      setSelectedUser(null)
      setSearchQuery('')
    } catch (error: any) {
      onNotification(error.message || 'Erreur lors du marquage', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnmarkUser = async (force: JackpotForce) => {
    setActionLoading(force.id)
    try {
      const res = await fetch('/api/super-admin/jackpot-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: force.userId,
          username: force.username,
          action: 'unmark'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du démarquage')
      }

      onNotification(data.message, 'success')
      await loadJackpotForces()
    } catch (error: any) {
      onNotification(error.message || 'Erreur lors du démarquage', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const activeForces = jackpotForces.filter(f => f.active)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Contrôle du Jackpot</h2>
        <p className="text-gray-400 text-lg">Marquer des utilisateurs pour gagner le prochain jackpot</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mark User Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Marquer un Utilisateur</h3>
              <p className="text-sm text-gray-400">Sélectionnez un utilisateur à marquer pour le jackpot</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-base"
                />
              </div>
            </div>
          </div>

          {/* User Selection */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isMarked = activeForces.some(f => f.userId === user.id)
                return (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedUser?.id === user.id
                        ? 'bg-purple-500/20 border-purple-400/50'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/70'
                    } ${isMarked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isMarked && setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        {isMarked && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user.username}</p>
                        <p className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                      {isMarked && (
                        <div className="text-yellow-400 text-sm font-medium">
                          Déjà marqué
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Action Buttons */}
          {selectedUser && (
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMarkUser(selectedUser, 'jackpot')}
                disabled={actionLoading === selectedUser.id}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedUser.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Marquage...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5" />
                    Marquer {selectedUser.username} pour le Jackpot
                  </div>
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMarkUser(selectedUser, 'test')}
                disabled={actionLoading === selectedUser.id}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedUser.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Test...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    🍀
                    Tester avec 3 Trèfles pour {selectedUser.username}
                  </div>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Active Forces Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Utilisateurs Marqués</h3>
              <p className="text-sm text-gray-400">Liste des utilisateurs marqués pour gagner le jackpot</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
            </div>
          ) : activeForces.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Aucun utilisateur marqué</p>
              <p className="text-gray-500 text-sm mt-1">Les utilisateurs marqués apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeForces.map((force) => (
                <motion.div
                  key={force.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 via-transparent to-orange-600/5 opacity-50" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          force.type === 'jackpot'
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {force.type === 'jackpot' ? (
                            <Crown className="h-6 w-6 text-white" />
                          ) : (
                            <span className="text-2xl">🍀</span>
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{force.username}</p>
                        <p className="text-sm text-gray-400">
                          Marqué le {new Date(force.markedAt).toLocaleDateString('fr-FR')} • {force.type === 'jackpot' ? 'Jackpot' : 'Test 3 Trèfles'}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUnmarkUser(force)}
                      disabled={actionLoading === force.id}
                      className="p-3 hover:bg-red-500/20 rounded-xl transition-colors group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === force.id ? (
                        <Loader2 className="animate-spin h-5 w-5 text-red-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 group-hover/btn:text-red-300" />
                      )}
                    </motion.button>
                  </div>

                  {/* Warning */}
                  <div className={`relative mt-4 p-3 border rounded-lg ${
                    force.type === 'jackpot'
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}>
                    <div className={`flex items-center gap-2 text-sm ${
                      force.type === 'jackpot'
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}>
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {force.type === 'jackpot'
                          ? 'Cet utilisateur gagnera automatiquement le prochain jackpot'
                          : 'Cet utilisateur gagnera automatiquement 3 trèfles (test)'
                        }
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
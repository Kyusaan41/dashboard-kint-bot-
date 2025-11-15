'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Edit2, Save, X, Lock } from 'lucide-react'
import Image from 'next/image'

type UserRole = 'user' | 'moderator' | 'administrator' | 'super_admin'

interface UserWithRole {
  id: string
  username: string
  avatar: string
  siteRole: UserRole
  joinedAt: string
  lastActive: string
  points: number
  currency: number
}

interface Props {
  users: UserWithRole[]
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>
  protectedUserId: string
}

export function UserManagement({ users, onRoleChange, protectedUserId }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('user')

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'administrator':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'moderator':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-700/50 text-gray-300 border-gray-600/50'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '👑 Super Admin'
      case 'administrator':
        return '🛡️ Administrateur'
      case 'moderator':
        return '⚡ Modérateur'
      default:
        return '👤 Utilisateur'
    }
  }

  return (
    <div className="space-y-8">
      {/* Search modernisée */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur par nom ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-base"
            />
          </div>
        </div>
      </motion.div>

      {/* Users List modernisée */}
      <div className="space-y-4 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg font-medium">Aucun utilisateur trouvé</p>
            <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </motion.div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl hover:border-purple-500/30 transition-all duration-500 shadow-lg hover:shadow-2xl"
            >
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-[3px]">
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={52}
                          height={52}
                          className="rounded-xl w-full h-full object-cover"
                        />
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-lg truncate">{user.username}</p>
                      <p className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rejoint le {new Date(user.joinedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {user.id === protectedUserId && (
                    <div className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 rounded-2xl flex-shrink-0">
                      <span className="text-sm font-bold text-red-400 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Protégé
                      </span>
                    </div>
                  )}
                </div>

                {editingUser === user.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 items-center p-4 bg-gray-900/50 rounded-2xl border border-purple-500/30"
                  >
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="user">👤 Utilisateur</option>
                      <option value="moderator">⚡ Modérateur</option>
                      <option value="administrator">🛡️ Administrateur</option>
                      {user.id !== protectedUserId && (
                        <option value="super_admin">👑 Super Admin</option>
                      )}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRoleChange(user.id, selectedRole)}
                      className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg"
                    >
                      <Save className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingUser(null)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${getRoleColor(user.siteRole)}`}>
                        {getRoleLabel(user.siteRole)}
                      </span>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <span className="text-green-400 font-bold">{user.points}</span>
                          <span className="text-green-400/70">pts</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <span className="text-yellow-400 font-bold">{user.currency}</span>
                          <span className="text-yellow-400/70">$</span>
                        </div>
                      </div>
                    </div>
                    {user.id !== protectedUserId && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingUser(user.id)
                          setSelectedRole(user.siteRole)
                        }}
                        className="p-3 hover:bg-purple-500/20 rounded-xl transition-colors group/btn"
                      >
                        <Edit2 className="h-5 w-5 text-purple-400 group-hover/btn:text-purple-300" />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Hover ring effect */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
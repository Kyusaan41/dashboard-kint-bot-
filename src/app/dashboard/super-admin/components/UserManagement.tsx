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
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-purple-primary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-primary/50"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun utilisateur trouvé
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              layout
              className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-purple-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 p-[2px] flex-shrink-0">
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={36}
                      height={36}
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
                {user.id === protectedUserId && (
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex-shrink-0">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Protégé
                    </span>
                  </div>
                )}
              </div>

              {editingUser === user.id ? (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="flex-1 px-3 py-2 bg-gray-900/50 border border-purple-primary/30 rounded-lg text-white text-sm focus:outline-none"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="moderator">Modérateur</option>
                    <option value="administrator">Administrateur</option>
                    {user.id !== protectedUserId && (
                      <option value="super_admin">Super Admin</option>
                    )}
                  </select>
                  <button
                    onClick={() => onRoleChange(user.id, selectedRole)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(user.siteRole)}`}>
                    {getRoleLabel(user.siteRole)}
                  </span>
                  {user.id !== protectedUserId && (
                    <button
                      onClick={() => {
                        setEditingUser(user.id)
                        setSelectedRole(user.siteRole)
                      }}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-purple-400" />
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
                <div>Pts: <span className="text-green-400 font-bold">{user.points}</span></div>
                <div>$ : <span className="text-yellow-400 font-bold">{user.currency}</span></div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
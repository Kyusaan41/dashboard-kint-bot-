'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Check, X, Loader2 } from 'lucide-react'

interface Permission {
  id: string
  userId: string
  username: string
  permissions: string[]
  grantedBy: string
  grantedAt: string
}

interface RolePermissions {
  super_admin: string[]
  administrator: string[]
  moderator: string[]
  user: string[]
}

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Gérer les utilisateurs' },
  { id: 'manage_roles', label: 'Gérer les rôles' },
  { id: 'view_logs', label: 'Voir les logs' },
  { id: 'send_broadcast', label: 'Envoyer des broadcasts' },
  { id: 'apply_sanctions', label: 'Appliquer des sanctions' },
  { id: 'manage_pages', label: 'Gérer les pages' },
  { id: 'manage_permissions', label: 'Gérer les permissions' },
]

export function PermissionManager() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const res = await fetch('/api/super-admin/permissions')
      const data = await res.json()
      setPermissions(data.custom || [])
      setRolePermissions(data.rolePermissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId)
    const existing = permissions.find(p => p.userId === userId)
    setUserPermissions(existing?.permissions || [])
  }

  const handleTogglePermission = (permissionId: string) => {
    setUserPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch('/api/super-admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          permissions: userPermissions,
        }),
      })

      if (res.ok) {
        loadPermissions()
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
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
      <div className="flex items-center gap-2">
        <Lock className="h-6 w-6 text-yellow-400" />
        <h3 className="text-2xl font-bold">Gestion des Permissions</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions par rôle */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Permissions par Rôle</h4>
          {rolePermissions &&
            Object.entries(rolePermissions).map(([role, perms]: [string, any]) => (
              <div key={role} className="p-4 bg-gray-800/40 border border-gray-700/30 rounded-lg">
                <p className="font-semibold text-purple-300 mb-3 capitalize">{role}</p>
                <div className="space-y-2">
                  {perms.map((perm: string) => (
                    <div key={perm} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-green-500" />
                      {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Permissions personnalisées */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Permissions Personnalisées</h4>
          <div className="p-4 bg-gray-800/40 border border-gray-700/30 rounded-lg max-h-96 overflow-y-auto space-y-2">
            {permissions.map(perm => (
              <motion.button
                key={perm.id}
                whileHover={{ x: 4 }}
                onClick={() => handleSelectUser(perm.userId)}
                className={`w-full p-3 text-left rounded-lg transition-all border ${
                  selectedUser === perm.userId
                    ? 'bg-blue-600/30 border-blue-500/50'
                    : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-600/50'
                }`}
              >
                <p className="font-semibold text-white text-sm">{perm.username}</p>
                <p className="text-xs text-gray-400 mt-1">{perm.permissions.length} permission(s)</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit permissions */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-gray-800/40 border border-yellow-500/30 rounded-lg space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Modification des permissions
            </h4>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 hover:bg-red-600/20 rounded transition-colors"
            >
              <X className="h-5 w-5 text-red-500" />
            </button>
          </div>

          <div className="space-y-3">
            {AVAILABLE_PERMISSIONS.map(perm => (
              <motion.label
                key={perm.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg cursor-pointer hover:border-gray-600/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={userPermissions.includes(perm.id)}
                  onChange={() => handleTogglePermission(perm.id)}
                  className="w-4 h-4 rounded bg-gray-600 border-gray-500 cursor-pointer"
                />
                <span className="text-sm text-gray-200">{perm.label}</span>
              </motion.label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSavePermissions}
              className="flex-1 px-4 py-2 bg-green-600/30 border border-green-500/50 rounded-lg hover:bg-green-600/40 transition-all text-sm font-medium text-green-300"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setSelectedUser(null)}
              className="flex-1 px-4 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg hover:bg-gray-700/40 transition-all text-sm font-medium text-gray-300"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
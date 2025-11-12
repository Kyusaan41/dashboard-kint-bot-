"use client"

import { useEffect, useState } from "react"
import { Ban, Clock } from "lucide-react"

export default function BannedPage() {
  const [info, setInfo] = useState<{ reason?: string; expiresAt?: string | null } | null>(null)

  useEffect(() => {
    // Try to fetch current user's ban info via cookie session in middleware; fallback shows generic message
    const fetchBan = async () => {
      try {
        // We don't have the user id here; the middleware already redirected us because we're banned
        // Show a minimal page; optionally could call an endpoint that returns current session ban
        setInfo(null)
      } catch {}
    }
    fetchBan()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
      <div className="max-w-md w-full bg-gray-800/50 border border-red-500/30 rounded-2xl p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
          <Ban className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Accès restreint</h1>
        <p className="text-gray-300 mb-4">Votre compte a été banni de ce site.</p>
        {info?.reason && (
          <p className="text-sm text-gray-400 mb-2">Raison: {info.reason}</p>
        )}
        {info?.expiresAt ? (
          <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Expire le {new Date(info.expiresAt).toLocaleString("fr-FR")}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Ban permanent</div>
        )}
        <p className="text-xs text-gray-500 mt-6">Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.</p>
      </div>
    </div>
  )
}

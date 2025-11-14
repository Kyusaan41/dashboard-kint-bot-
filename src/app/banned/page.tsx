"use client"

import { useEffect, useState } from "react"
import { Ban, Clock, AlertTriangle, Mail } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-nyx flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-purple"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="nyx-card-glass p-8 text-center animate-slide-up">
          {/* Animated ban icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mb-6 animate-pulse-purple relative">
            <Ban className="h-10 w-10 text-red-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping"></div>
          </div>

          <h1 className="text-3xl font-bold text-gradient-purple mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Accès Restreint
          </h1>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-lg">Votre compte a été banni de ce site.</p>
            </div>

            {info?.reason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-200 font-medium mb-1">Raison du ban :</p>
                <p className="text-gray-300">{info.reason}</p>
              </div>
            )}

            {info?.expiresAt ? (
              <div className="flex items-center justify-center gap-2 text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Expiration :</p>
                  <p className="text-lg">{new Date(info.expiresAt).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                <p className="text-red-300 font-medium">Ban permanent</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-600/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Besoin d'aide ?</span>
            </div>
            <p className="text-xs text-gray-500">
              Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur via Discord ou le support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

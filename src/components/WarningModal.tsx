"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AlertTriangle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Warning {
  id: string
  reason: string
  createdAt: string
  expiresAt?: string | null
}

export default function WarningModal() {
  const { data: session } = useSession()
  const [warning, setWarning] = useState<Warning | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    const checkWarning = async () => {
      try {
        const res = await fetch(`/api/warning-check?userId=${encodeURIComponent(session.user.id)}`)
        const data = await res.json()
        if (data.warning) {
          setWarning(data.warning)
          setIsVisible(true)
        } else if (!isVisible) {
          // Only hide if not currently visible (user hasn't acknowledged yet)
          setWarning(null)
          setIsVisible(false)
        }
        // If isVisible is true, keep the warning displayed until user acknowledges
      } catch (error) {
        console.error('Error checking warning:', error)
      }
    }

    // Initial check
    checkWarning()

    // Check every 3 seconds like bans
    const interval = setInterval(checkWarning, 3000)

    return () => clearInterval(interval)
  }, [session])

  const handleAcknowledge = async () => {
    if (!warning) return

    try {
      const res = await fetch('/api/warning-acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warningId: warning.id }),
      })

      if (res.ok) {
        setIsVisible(false)
        setWarning(null)
      }
    } catch (error) {
      console.error('Error acknowledging warning:', error)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="nyx-card-glass p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-gradient-purple">Avertissement</h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">{warning.reason}</p>
            </div>

            {warning.expiresAt && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-200">
                  Expire le {new Date(warning.expiresAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <motion.button
                onClick={handleAcknowledge}
                className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-yellow-600 transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Je comprends
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
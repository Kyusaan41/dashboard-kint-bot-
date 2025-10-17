'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, AlertCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MaintenanceModeProps {
  message?: string
  reason?: string
  estimatedTime?: string
}

export function MaintenanceMode({ 
  message = 'En cours de maintenance', 
  reason = 'Nous améliorons NyxBot pour vous offrir une meilleure expérience',
  estimatedTime = 'Environ 30 minutes'
}: MaintenanceModeProps) {
  const [time, setTime] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto px-6"
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-8 shadow-2xl shadow-purple-500/50"
          >
            <Wrench className="w-12 h-12 text-white" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight"
          >
            En cours de
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Maintenance
            </span>
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 leading-relaxed"
          >
            {reason}
          </motion.p>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          >
            {/* Estimated Time Card */}
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-300">Temps estimé</h3>
              </div>
              <p className="text-2xl font-bold text-white">{estimatedTime}</p>
            </div>

            {/* Current Time Card */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-300">Heure actuelle</h3>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{time}</p>
            </div>
          </motion.div>

          {/* Status Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/50">
              <motion.div
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
              />
            </div>
          </motion.div>

          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-gray-400 text-sm"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Nous travaillons pour vous</span>
          </motion.div>

          {/* Refresh Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-gray-500 text-xs mt-8"
          >
            Cette page se rechargera automatiquement quand nous serons prêts
          </motion.p>

          {/* Auto Refresh Script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  let checkInterval = setInterval(async () => {
                    try {
                      const response = await fetch('/api/maintenance-status');
                      if (response.ok) {
                        const data = await response.json();
                        if (!data.maintenance) {
                          clearInterval(checkInterval);
                          window.location.reload();
                        }
                      }
                    } catch (e) {
                      console.log('Check maintenance status...');
                    }
                  }, 5000);
                })();
              `
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, Coins, Star, Snowflake, TreePine, CandyCane, CheckCircle, Heart, Zap, Crown } from 'lucide-react'

interface AdventDay {
  day: number
  type: string
  amount: number
  name: string
  description: string
  unlocked: boolean
  claimed: boolean
}

interface AdventCalendarData {
  active: boolean
  currentDay: number
  calendar: AdventDay[]
}

export default function AdventCalendar() {
  const [data, setData] = useState<AdventCalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<AdventDay | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [showReward, setShowReward] = useState<AdventDay | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      const response = await fetch('/api/advent-calendar')
      if (response.ok) {
        const calendarData = await response.json()
        setData(calendarData)
      }
    } catch (error) {
      console.error('Error fetching advent calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const openGift = (day: AdventDay) => {
    if (!day.unlocked) return
    setSelectedDay(day)
    setIsOpening(true)

    // Animation d'ouverture
    setTimeout(() => {
      setIsOpening(false)
      setShowReward(day)
    }, 1500)
  }

  const claimReward = async () => {
    if (!showReward || claiming) return

    setClaiming(true)
    try {
      const response = await fetch('/api/advent-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: showReward.day,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        await fetchCalendarData() // Refresh data
        setShowReward(null)
        setSelectedDay(null)
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Erreur lors de la réclamation de la récompense')
    } finally {
      setClaiming(false)
    }
  }

  const getRewardIcon = (type: string, size = 'w-6 h-6') => {
    switch (type) {
      case 'currency': return <Coins className={`${size} text-yellow-400`} />
      case 'tokens': return <Sparkles className={`${size} text-purple-400`} />
      case 'orbs': return <Star className={`${size} text-blue-400`} />
      default: return <Gift className={`${size} text-gray-400`} />
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-red-400/30 border-t-red-400 rounded-full mb-4"
          />
          <p className="text-white/80 text-lg">Chargement du calendrier...</p>
        </div>
      </motion.div>
    )
  }

  if (!data?.active) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-900 to-green-900 rounded-2xl p-4 shadow-2xl overflow-hidden border border-green-600/30"
    >
      {/* Effets de fond subtils */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fondmasquant les bords */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
          }}
        />
        
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img 
            src="/images/AdventCalendar.png"
            alt="Advent Calendar Background"
            className="w-full h-full object-cover opacity-15"
            style={{
              objectPosition: 'center 20%',
            }}
          />
        </div>
        
        {/* Arrière-plan avec couleurs changeantes */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/8 via-red-500/8 via-green-500/8 via-blue-500/8 to-orange-500/8 animate-gradient-shift" />
        
        {/* Deuxième couche avec décalage pour effet plus fluide */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/6 via-orange-500/6 via-red-500/6 via-green-500/6 to-blue-500/6 animate-gradient-shift-delayed" />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
        
        {/* Quelques flocons discrets */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            className="absolute text-white/20 text-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          >
            ❄️
          </motion.div>
        ))}
      </div>

      {/* Header épuré */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <motion.span
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl"
          >
            🎄
          </motion.span>
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black text-transparent bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text"
          >
            Calendrier de l'Avent
          </motion.h2>
          <motion.span
            animate={{ 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl"
          >
            🎅
          </motion.span>
        </div>
        <p className="text-gray-300 mb-4">Cliquez sur les portes pour découvrir vos surprises</p>
        
        <div className="bg-green-800/40 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-3 border border-green-600/50">
          <span className="text-white font-medium">Jour {data.currentDay}</span>
          <span className="text-green-400">•</span>
          <span className="text-gray-300">
            {data.calendar.filter(d => d.unlocked && !d.claimed).length} disponibles
          </span>
        </div>
      </div>

      {/* Grille de portes */}
      <div className="relative z-10 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {data.calendar.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="relative"
          >
            <motion.button
              onClick={() => openGift(day)}
              disabled={!day.unlocked}
              className={`w-full aspect-square rounded-xl transition-all duration-300 relative overflow-hidden border-2 ${
                day.claimed
                  ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-400 shadow-lg'
                  : day.unlocked
                  ? 'bg-gradient-to-br from-red-700 to-red-800 border-red-400 hover:border-yellow-400 shadow-lg'
                  : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
              }`}
              whileHover={day.unlocked ? { scale: 1.05 } : {}}
              whileTap={day.unlocked ? { scale: 0.95 } : {}}
            >
              {/* Numéro de la porte */}
              <div className="absolute top-2 left-2 text-white font-bold text-sm z-10">
                {day.day}
              </div>

              {/* Contenu de la porte */}
              <div className="flex items-center justify-center h-full">
                {day.claimed ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-300 mb-1" />
                    <span className="text-xs text-green-200 font-medium">Obt.</span>
                  </div>
                ) : day.unlocked ? (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                  >
                    <Gift className="w-6 h-6 text-white drop-shadow-lg" />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Gift className="w-6 h-6 text-gray-500" />
                    </motion.div>
                    <span className="text-xs text-gray-500 mt-1">🔒</span>
                  </div>
                )}
              </div>

              {/* Effet de lueur subtil */}
              {day.unlocked && !day.claimed && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-yellow-400/10 to-green-400/10 rounded-xl"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Animation d'ouverture simple */}
      <AnimatePresence>
        {isOpening && selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity 
                }}
                className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-white mb-4"
              >
                Ouverture du jour {selectedDay.day}...
              </motion.h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de récompense épurée */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20"
            >
              {/* Icône de récompense */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                {getRewardIcon(showReward.type, 'w-8 h-8')}
              </motion.div>

              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-white mb-4"
              >
                {showReward.name}
              </motion.h3>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-300 mb-6"
              >
                {showReward.description}
              </motion.p>

              {showReward.claimed ? (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowReward(null)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <CheckCircle className="w-5 h-5" />
                  Déjà obtenu
                </motion.button>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 justify-center"
                >
                  <button
                    onClick={() => setShowReward(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Plus tard
                  </button>
                  
                  <motion.button
                    onClick={claimReward}
                    disabled={claiming}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {claiming ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Récupération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Récupérer
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles CSS pour les animations de couleurs */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background: linear-gradient(90deg, 
              rgba(251, 146, 60, 0.03) 0%,     /* Orange */
              rgba(239, 68, 68, 0.03) 25%,      /* Rouge */
              rgba(34, 197, 94, 0.03) 50%,      /* Vert */
              rgba(59, 130, 246, 0.03) 75%,     /* Bleu */
              rgba(251, 146, 60, 0.03) 100%     /* Orange */
            );
          }
          25% {
            background: linear-gradient(90deg, 
              rgba(239, 68, 68, 0.03) 0%,       /* Rouge */
              rgba(34, 197, 94, 0.03) 25%,      /* Vert */
              rgba(59, 130, 246, 0.03) 50%,     /* Bleu */
              rgba(251, 146, 60, 0.03) 75%,     /* Orange */
              rgba(239, 68, 68, 0.03) 100%      /* Rouge */
            );
          }
          50% {
            background: linear-gradient(90deg, 
              rgba(34, 197, 94, 0.03) 0%,       /* Vert */
              rgba(59, 130, 246, 0.03) 25%,     /* Bleu */
              rgba(251, 146, 60, 0.03) 50%,     /* Orange */
              rgba(239, 68, 68, 0.03) 75%,      /* Rouge */
              rgba(34, 197, 94, 0.03) 100%      /* Vert */
            );
          }
          75% {
            background: linear-gradient(90deg, 
              rgba(59, 130, 246, 0.03) 0%,      /* Bleu */
              rgba(251, 146, 60, 0.03) 25%,     /* Orange */
              rgba(239, 68, 68, 0.03) 50%,      /* Rouge */
              rgba(34, 197, 94, 0.03) 75%,      /* Vert */
              rgba(59, 130, 246, 0.03) 100%     /* Bleu */
            );
          }
          100% {
            background: linear-gradient(90deg, 
              rgba(251, 146, 60, 0.03) 0%,     /* Orange */
              rgba(239, 68, 68, 0.03) 25%,      /* Rouge */
              rgba(34, 197, 94, 0.03) 50%,      /* Vert */
              rgba(59, 130, 246, 0.03) 75%,     /* Bleu */
              rgba(251, 146, 60, 0.03) 100%     /* Orange */
            );
          }
        }

        @keyframes gradient-shift-delayed {
          0% {
            background: linear-gradient(90deg, 
              rgba(59, 130, 246, 0.02) 0%,      /* Bleu */
              rgba(251, 146, 60, 0.02) 25%,     /* Orange */
              rgba(239, 68, 68, 0.02) 50%,      /* Rouge */
              rgba(34, 197, 94, 0.02) 75%,      /* Vert */
              rgba(59, 130, 246, 0.02) 100%     /* Bleu */
            );
          }
          25% {
            background: linear-gradient(90deg, 
              rgba(251, 146, 60, 0.02) 0%,     /* Orange */
              rgba(239, 68, 68, 0.02) 25%,      /* Rouge */
              rgba(34, 197, 94, 0.02) 50%,      /* Vert */
              rgba(59, 130, 246, 0.02) 75%,     /* Bleu */
              rgba(251, 146, 60, 0.02) 100%     /* Orange */
            );
          }
          50% {
            background: linear-gradient(90deg, 
              rgba(239, 68, 68, 0.02) 0%,      /* Rouge */
              rgba(34, 197, 94, 0.02) 25%,      /* Vert */
              rgba(59, 130, 246, 0.02) 50%,     /* Bleu */
              rgba(251, 146, 60, 0.02) 75%,     /* Orange */
              rgba(239, 68, 68, 0.02) 100%      /* Rouge */
            );
          }
          75% {
            background: linear-gradient(90deg, 
              rgba(34, 197, 94, 0.02) 0%,      /* Vert */
              rgba(59, 130, 246, 0.02) 25%,     /* Bleu */
              rgba(251, 146, 60, 0.02) 50%,     /* Orange */
              rgba(239, 68, 68, 0.02) 75%,      /* Rouge */
              rgba(34, 197, 94, 0.02) 100%      /* Vert */
            );
          }
          100% {
            background: linear-gradient(90deg, 
              rgba(59, 130, 246, 0.02) 0%,      /* Bleu */
              rgba(251, 146, 60, 0.02) 25%,     /* Orange */
              rgba(239, 68, 68, 0.02) 50%,      /* Rouge */
              rgba(34, 197, 94, 0.02) 75%,      /* Vert */
              rgba(59, 130, 246, 0.02) 100%     /* Bleu */
            );
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 30s ease-in-out infinite;
        }

        .animate-gradient-shift-delayed {
          animation: gradient-shift-delayed 30s ease-in-out infinite;
          animation-delay: -15s;
        }
      `}</style>
    </motion.div>
  )
}
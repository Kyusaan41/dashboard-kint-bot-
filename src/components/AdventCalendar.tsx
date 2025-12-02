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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-red-900/30 via-green-900/25 to-blue-900/30 backdrop-blur-xl border border-red-400/40 rounded-3xl p-8 mb-8 overflow-hidden"
      >
        {/* Fond subtil avec quelques éléments */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Quelques flocons discrets */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`snowflake-${i}`}
              className="absolute text-blue-200/40"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${10 + Math.random() * 4}px`,
              }}
              animate={{
                y: [0, 50, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              ❄️
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center gap-6 mb-8">
          <Snowflake className="w-10 h-10 text-blue-400" />

          <div className="text-center">
            <motion.h2
              className="text-3xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-3"
              animate={{
                textShadow: [
                  '0 0 10px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 10px rgba(239, 68, 68, 0.5)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎄 CALENDRIER DE L'AVENT 🎄
            </motion.h2>
            <p className="text-gray-300 text-lg">
              Préparation des surprises magiques...
            </p>
          </div>

          <CandyCane className="w-10 h-10 text-red-400" />
        </div>

        <div className="relative z-10 flex justify-center">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Guirlande décorative */}
        <motion.div
          className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full opacity-60"
          animate={{
            boxShadow: [
              '0 0 10px rgba(239, 68, 68, 0.5)',
              '0 0 10px rgba(251, 191, 36, 0.5)',
              '0 0 10px rgba(34, 197, 94, 0.5)',
              '0 0 10px rgba(59, 130, 246, 0.5)',
              '0 0 10px rgba(147, 51, 234, 0.5)',
              '0 0 10px rgba(239, 68, 68, 0.5)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </motion.div>
    )
  }

  if (!data?.active) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 mb-8 text-center"
      >
        <TreePine className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">Calendrier de l'Avent</h3>
        <p className="text-gray-400">Le calendrier sera disponible du 1er au 24 décembre !</p>
        <div className="mt-4 text-sm text-gray-500">🎅 Restez connectés pour les surprises !</div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-red-900/30 via-green-900/25 to-blue-900/30 backdrop-blur-xl border border-red-400/40 rounded-3xl p-8 mb-8 overflow-hidden"
      >
        {/* Fond magique avec effets spéciaux */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Aurore boréale subtile */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-green-500/5 rounded-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              background: [
                'linear-gradient(45deg, rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.05), rgba(34, 197, 94, 0.05))',
                'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(251, 191, 36, 0.05), rgba(147, 51, 234, 0.05))',
                'linear-gradient(45deg, rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.05), rgba(34, 197, 94, 0.05))',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Particules magiques flottantes */}
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={`magic-particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}

          {/* Guirlandes lumineuses */}
          <div className="absolute top-4 left-4 right-4 h-1 flex justify-between">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`light-${i}`}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-400"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.2, 0.5],
                  boxShadow: [
                    '0 0 5px rgba(251, 191, 36, 0.5)',
                    '0 0 15px rgba(239, 68, 68, 0.8)',
                    '0 0 5px rgba(251, 191, 36, 0.5)',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Header festif simplifié */}
        <div className="relative z-10 text-center mb-10">
          <div className="flex items-center justify-center gap-6 mb-6">
            <Snowflake className="w-12 h-12 text-blue-300 drop-shadow-lg" />

            <div className="relative">
              <motion.h2
                className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.8)',
                    '0 0 30px rgba(34, 197, 94, 0.8)',
                    '0 0 20px rgba(239, 68, 68, 0.8)',
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                🎄 CALENDRIER DE L'AVENT 🎄
              </motion.h2>
            </div>

            <CandyCane className="w-12 h-12 text-red-400 drop-shadow-lg" />
          </div>

          <p className="text-gray-200 text-xl mb-6 font-medium">
            Cliquez sur les cadeaux pour découvrir vos surprises !
          </p>

          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-500/30 via-green-500/30 to-blue-500/30 backdrop-blur-sm border-2 border-red-400/50 rounded-full px-8 py-4 shadow-2xl">
            <Gift className="w-6 h-6 text-red-400" />
            <span className="text-white font-bold text-lg">
              Jour {data.currentDay} • {data.calendar.filter(d => d.unlocked && !d.claimed).length} surprises disponibles
            </span>
            <TreePine className="w-6 h-6 text-green-400" />
          </div>
        </div>

        {/* Grille des cadeaux magiques */}
        <div className="relative z-10 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
          {data.calendar.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
              className="relative group"
            >
              <motion.button
                onClick={() => openGift(day)}
                disabled={!day.unlocked}
                className={`w-full aspect-square rounded-2xl border-3 transition-all duration-500 relative overflow-hidden ${
                  day.claimed
                    ? 'bg-gradient-to-br from-green-500/40 via-emerald-500/30 to-green-600/40 border-green-400/70 shadow-2xl'
                    : day.unlocked
                    ? 'bg-gradient-to-br from-red-500/40 via-yellow-500/35 via-green-500/30 to-blue-500/40 border-red-400/60 hover:border-yellow-400/80 shadow-2xl'
                    : 'bg-gradient-to-br from-gray-600/30 to-gray-700/40 border-gray-500/40'
                }`}
                whileHover={day.unlocked ? {
                  scale: 1.15,
                  rotate: [0, -2, 2, 0],
                  boxShadow: day.claimed
                    ? '0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.4)'
                    : '0 0 40px rgba(239, 68, 68, 0.8), 0 0 80px rgba(251, 191, 36, 0.4), 0 0 120px rgba(34, 197, 94, 0.2)'
                } : {}}
                whileTap={day.unlocked ? { scale: 0.9 } : {}}
              >
                {/* Halo lumineux pour les cadeaux disponibles */}
                {day.unlocked && !day.claimed && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-yellow-400/20 to-green-400/20 rounded-2xl blur-xl"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                {/* Numéro du jour avec effet magique */}
                <motion.div
                  className="absolute top-2 left-2 text-sm font-black text-white z-20 drop-shadow-lg"
                  animate={day.unlocked && !day.claimed ? {
                    textShadow: [
                      '0 0 5px rgba(255,255,255,0.8)',
                      '0 0 10px rgba(255,255,255,1)',
                      '0 0 5px rgba(255,255,255,0.8)',
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {day.day}
                </motion.div>

                {/* Contenu selon l'état */}
                {day.claimed ? (
                  <div className="flex flex-col items-center justify-center h-full relative z-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-300 mb-2 drop-shadow-lg" />
                    </motion.div>
                    <div className="text-xs text-green-200 font-bold drop-shadow">MAGIE OBTENUE</div>

                    {/* Particules de succès */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={`success-${i}`}
                          className="absolute w-1.5 h-1.5 bg-green-400 rounded-full"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                          }}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.6, 1, 0.6],
                            scale: [0.5, 1.5, 0.5],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : day.unlocked ? (
                  <div className="flex flex-col items-center justify-center h-full relative z-10">
                    {/* Cadeau simple avec quelques effets */}
                    <motion.div
                      className="relative mb-2"
                      animate={{
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {/* Boîte du cadeau */}
                      <div className="relative w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg border-2 border-red-300 shadow-lg">
                        {/* Rubans simples */}
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1.5 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full shadow-md" />
                        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-md" />

                        {/* Nœud simple */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg" />
                      </div>
                    </motion.div>

                    <div className="text-xs text-yellow-200 font-bold drop-shadow">MAGIE</div>

                    {/* Quelques particules discrètes */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={`magic-${i}`}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${25 + Math.random() * 50}%`,
                            top: `${25 + Math.random() * 50}%`,
                          }}
                          animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full relative z-10">
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Gift className="w-7 h-7 text-gray-500 mb-2 drop-shadow" />
                    </motion.div>
                    <div className="text-xs text-gray-400 font-medium drop-shadow">🔒 MYSTÈRE</div>
                  </div>
                )}

                {/* Bordure animée pour les cadeaux disponibles */}
                {day.unlocked && !day.claimed && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent"
                    animate={{
                      borderColor: [
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(251, 191, 36, 0.6)',
                        'rgba(34, 197, 94, 0.6)',
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animation d'ouverture magique du cadeau */}
      <AnimatePresence>
        {isOpening && selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -45, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.3, rotate: 45, y: 100 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="text-center relative"
            >
              {/* Aura magique de fond */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Cadeau qui s'ouvre simplement */}
              <motion.div
                className="relative mb-10"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl border-4 border-yellow-400 shadow-2xl flex items-center justify-center">
                  <Gift className="w-16 h-16 text-white drop-shadow-2xl" />
                </div>

                {/* Quelques particules simples */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`magic-explosion-${i}`}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: Math.cos(i * 45 * Math.PI / 180) * 60,
                      y: Math.sin(i * 45 * Math.PI / 180) * 60,
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>

              <motion.h3
                className="text-3xl font-bold text-white mb-6 relative z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.8)',
                    '0 0 20px rgba(255,255,255,1)',
                    '0 0 10px rgba(255,255,255,0.8)',
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨ MAGIE EN COURS... ✨
              </motion.h3>

              <motion.div
                className="text-gray-200 text-xl font-medium relative z-10"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Découvrez la surprise enchantée du jour {selectedDay.day} !
              </motion.div>

              {/* Indicateur de chargement magique */}
              <motion.div
                className="mt-8 flex justify-center space-x-2 relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={`loading-${i}`}
                    className="w-3 h-3 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full"
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de récompense magique */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-red-900/85 to-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, rotate: 15, y: 100 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20
              }}
              className="relative bg-gradient-to-br from-red-900/98 via-yellow-900/95 via-green-900/98 to-blue-900/98 backdrop-blur-2xl border-3 border-yellow-400/70 rounded-3xl p-10 max-w-2xl w-full text-center shadow-2xl overflow-hidden"
            >
              {/* Fond magique avec effets spéciaux */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Aurore boréale animée */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 via-green-500/10 to-blue-500/10 rounded-3xl"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    background: [
                      'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(251, 191, 36, 0.1), rgba(34, 197, 94, 0.1))',
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(239, 68, 68, 0.1))',
                      'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(251, 191, 36, 0.1), rgba(34, 197, 94, 0.1))',
                    ]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                />

                {/* Particules magiques volantes */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={`modal-magic-${i}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `hsl(${Math.random() * 60 + 15}, 100%, 70%)`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.random() * 30 - 15, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                    }}
                  />
                ))}

                {/* Cercles d'énergie concentriques */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`energy-ring-${i}`}
                    className="absolute inset-4 border-2 border-yellow-400/30 rounded-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                {/* Icône de récompense simple */}
                <div className="relative mb-8">
                  <div className="w-28 h-28 bg-gradient-to-r from-yellow-400 via-red-400 to-green-400 rounded-full flex items-center justify-center mx-auto shadow-2xl border-6 border-white/30">
                    {getRewardIcon(showReward.type, 'w-14 h-14')}
                  </div>
                </div>

                <motion.h3
                  className="text-4xl font-black text-white mb-6"
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      '0 0 15px rgba(255,255,255,0.8)',
                      '0 0 25px rgba(255,255,255,1)',
                      '0 0 35px rgba(251, 191, 36, 0.8)',
                      '0 0 15px rgba(255,255,255,0.8)',
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {showReward.claimed ? '🎄 MAGIE DÉJÀ LIBÉRÉE ! 🎄' : '✨ MAGIE DÉCOUVERTE ! ✨'}
                </motion.h3>

                <p className="text-gray-200 mb-8 text-xl font-medium">
                  {showReward.claimed
                    ? `Vous avez déjà libéré la magie du jour ${showReward.day} !`
                    : `Vous venez de découvrir la magie du jour ${showReward.day} !`
                  }
                </p>

                {/* Carte de récompense simple */}
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 mb-10 border-2 border-white/30 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-center gap-6 mb-4 relative z-10">
                    {getRewardIcon(showReward.type, 'w-12 h-12')}
                    <div className="text-left">
                      <div className="text-3xl font-black text-white mb-1">
                        {showReward.name}
                      </div>
                      <div className="text-2xl text-yellow-300 font-bold">{showReward.amount} unités</div>
                    </div>
                  </div>
                  <p className="text-gray-200 text-lg relative z-10">
                    {showReward.description}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  {showReward.claimed ? (
                    <motion.button
                      onClick={() => setShowReward(null)}
                      className="px-10 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-2xl font-black text-xl shadow-2xl border-2 border-green-400/50"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 30px rgba(34, 197, 94, 0.8)'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        MAGIE OBTENUE
                      </span>
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => setShowReward(null)}
                        className="px-8 py-4 bg-gray-600/60 hover:bg-gray-600/80 text-white rounded-2xl font-bold text-lg transition-all duration-300 border border-gray-500/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Plus tard
                      </motion.button>

                      <motion.button
                        onClick={claimReward}
                        disabled={claiming}
                        className="px-10 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white rounded-2xl font-black text-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400/50"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(251, 191, 36, 0.8)'
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {claiming ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            LIBÉRATION...
                          </div>
                        ) : (
                          <span className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6" />
                            LIBÉRER LA MAGIE !
                          </span>
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
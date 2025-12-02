'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, Coins, Star, Snowflake, TreePine, CandyCane, CheckCircle } from 'lucide-react'

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
        className="bg-gradient-to-br from-red-900/20 via-green-900/20 to-blue-900/20 backdrop-blur-xl border border-red-400/30 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Snowflake className="w-8 h-8 text-blue-400 animate-spin" />
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              🎄 Calendrier de l'Avent 🎄
            </h2>
            <p className="text-gray-300">Préparation des surprises...</p>
          </div>
          <CandyCane className="w-8 h-8 text-red-400 animate-bounce" />
        </div>
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
        </div>
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
        className="bg-gradient-to-br from-red-900/20 via-green-900/20 to-blue-900/20 backdrop-blur-xl border border-red-400/30 rounded-3xl p-8 mb-8"
      >
        {/* Header festif */}
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center gap-4 mb-4"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Snowflake className="w-8 h-8 text-blue-400 animate-spin" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
              🎄 CALENDRIER DE L'AVENT 🎄
            </h2>
            <CandyCane className="w-8 h-8 text-red-400 animate-bounce" />
          </motion.div>

          <p className="text-gray-300 text-lg mb-4">
            Cliquez sur les cadeaux pour découvrir vos surprises !
          </p>

          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-green-500/20 border border-red-400/30 rounded-full px-6 py-3">
            <Gift className="w-5 h-5 text-red-400" />
            <span className="text-white font-medium">Jour {data.currentDay} • {data.calendar.filter(d => d.unlocked && !d.claimed).length} cadeaux disponibles</span>
            <TreePine className="w-5 h-5 text-green-400" />
          </div>
        </div>

        {/* Grille des cadeaux */}
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {data.calendar.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative"
            >
              <motion.button
                onClick={() => openGift(day)}
                disabled={!day.unlocked}
                className={`w-full aspect-square rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                  day.claimed
                    ? 'bg-green-500/20 border-green-400/50 cursor-pointer hover:bg-green-500/30'
                    : day.unlocked
                    ? 'bg-gradient-to-br from-red-500/30 via-gold-500/25 to-green-500/30 border-red-400/50 hover:border-red-300/70 cursor-pointer'
                    : 'bg-gray-600/20 border-gray-500/30 cursor-not-allowed'
                }`}
                whileHover={day.unlocked ? {
                  scale: 1.1,
                  boxShadow: day.claimed
                    ? '0 0 25px rgba(34, 197, 94, 0.5)'
                    : '0 0 25px rgba(239, 68, 68, 0.5)'
                } : {}}
                whileTap={day.unlocked ? { scale: 0.95 } : {}}
              >
                {/* Numéro du jour */}
                <div className="absolute top-1 left-1 text-xs font-bold text-white bg-black/60 rounded px-1 z-10">
                  {day.day}
                </div>

                {/* Contenu selon l'état */}
                {day.claimed ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <CheckCircle className="w-6 h-6 text-green-400 mb-1" />
                    <div className="text-xs text-green-300 font-medium">Obtenu</div>
                  </div>
                ) : day.unlocked ? (
                  <div className="flex flex-col items-center justify-center h-full relative">
                    {/* Cadeau fermé avec ruban */}
                    <motion.div
                      className="relative"
                      animate={{
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Gift className="w-8 h-8 text-red-400 mb-1" />
                      {/* Ruban */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full"></div>
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-full"></div>
                    </motion.div>

                    {/* Particules scintillantes */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={`gift-sparkle-${i}`}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${25 + Math.random() * 50}%`,
                            top: `${25 + Math.random() * 50}%`,
                          }}
                          animate={{
                            opacity: [0.4, 1, 0.4],
                            scale: [0.5, 1.2, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: Math.random() * 1.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Gift className="w-6 h-6 text-gray-500 mb-1" />
                    <div className="text-xs text-gray-500">🔒</div>
                  </div>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animation d'ouverture du cadeau */}
      <AnimatePresence>
        {isOpening && selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 180 }}
              className="text-center"
            >
              {/* Cadeau qui s'ouvre */}
              <motion.div
                className="relative mb-8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-green-500 rounded-2xl flex items-center justify-center border-4 border-yellow-400 shadow-2xl">
                  <Gift className="w-12 h-12 text-white" />
                </div>

                {/* Particules d'ouverture */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={`open-particle-${i}`}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: Math.cos(i * 30 * Math.PI / 180) * 80,
                      y: Math.sin(i * 30 * Math.PI / 180) * 80,
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                    }}
                  />
                ))}
              </motion.div>

              <motion.h3
                className="text-2xl font-bold text-white mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎁 Ouverture du cadeau...
              </motion.h3>

              <div className="text-gray-300">Découvrez votre surprise du jour {selectedDay.day} !</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de récompense */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-red-900/95 via-green-900/95 to-blue-900/95 backdrop-blur-xl border-2 border-red-400/60 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl"
            >
              {/* Étoiles et particules de fond */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`reward-star-${i}`}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.5, 1.5, 0.5],
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-red-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white/20">
                  {getRewardIcon(showReward.type, 'w-10 h-10')}
                </div>

                <motion.h3
                  className="text-3xl font-bold text-white mb-4"
                  animate={{ textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 10px rgba(255,255,255,0.5)',
                  ]}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {showReward.claimed ? '🎄 Cadeau déjà ouvert ! 🎄' : '🎉 Surprise ! 🎉'}
                </motion.h3>

                <p className="text-gray-300 mb-6 text-lg">
                  {showReward.claimed
                    ? `Vous avez déjà ouvert le cadeau du jour ${showReward.day} !`
                    : `Vous avez découvert le cadeau du jour ${showReward.day} !`
                  }
                </p>

                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-center gap-4 mb-3">
                    {getRewardIcon(showReward.type, 'w-8 h-8')}
                    <div>
                      <div className="text-2xl font-bold text-white">{showReward.name}</div>
                      <div className="text-lg text-yellow-300 font-semibold">{showReward.amount} unités</div>
                    </div>
                  </div>
                  <p className="text-gray-300">{showReward.description}</p>
                </motion.div>

                <div className="flex gap-3 justify-center">
                  {showReward.claimed ? (
                    <motion.button
                      onClick={() => setShowReward(null)}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✅ DÉJÀ RÉCLAMÉ
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => setShowReward(null)}
                        className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-xl font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Plus tard
                      </motion.button>

                      <motion.button
                        onClick={claimReward}
                        disabled={claiming}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {claiming ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Récupération...
                          </div>
                        ) : (
                          '🎁 RÉCLAMER !'
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
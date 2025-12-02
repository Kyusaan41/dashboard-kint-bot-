'use client'

import { useState, useEffect, useMemo } from 'react'
import { SeasonPassData, SeasonPassTier } from '@/types/season-pass'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Star, ChevronLeft, ChevronRight, Sparkles, Coins, Gem, Zap, Award, Target, Flame, Diamond, Heart, Shield, Medal, TrendingUp } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

// Composant de décorations saisonnières simplifiées pour le Season Pass
const SeasonPassDecorations = () => {
  const { currentTheme } = useTheme()

  // Décorations simples pour Noël
  if (currentTheme === 'christmas') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute text-green-600 opacity-10" style={{ left: '10%', top: '80%', fontSize: '24px' }}>🎄</div>
        <div className="absolute text-yellow-400 opacity-15" style={{ left: '80%', top: '20%', fontSize: '16px' }}>⭐</div>
      </div>
    )
  }

  // Décorations simples pour Halloween
  if (currentTheme === 'halloween') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute text-orange-500 opacity-15" style={{ left: '15%', top: '75%', fontSize: '20px' }}>🎃</div>
        <div className="absolute text-gray-700 opacity-10" style={{ left: '75%', top: '25%', fontSize: '16px' }}>🦇</div>
      </div>
    )
  }

  // Décorations simples pour le Nouvel An Chinois
  if (currentTheme === 'chinese-new-year') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute text-red-600 opacity-15" style={{ left: '20%', top: '30%', fontSize: '18px' }}>🏮</div>
        <div className="absolute opacity-10" style={{ left: '70%', top: '70%', fontSize: '14px' }}>🎆</div>
      </div>
    )
  }

  // Décorations simples pour l'automne
  if (currentTheme === 'autumn') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute opacity-10" style={{ left: '25%', top: '80%', fontSize: '16px', color: '#ea580c' }}>🍂</div>
        <div className="absolute opacity-10" style={{ left: '65%', top: '60%', fontSize: '14px', color: '#dc2626' }}>🍂</div>
      </div>
    )
  }

  // Décorations simples pour l'hiver
  if (currentTheme === 'winter') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute text-blue-200 opacity-10" style={{ left: '30%', top: '85%', fontSize: '12px' }}>❄️</div>
        <div className="absolute text-blue-300 opacity-8" style={{ left: '80%', top: '75%', fontSize: '16px' }}>⛄</div>
      </div>
    )
  }

  // Décorations simples pour le printemps
  if (currentTheme === 'spring') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute opacity-12" style={{ left: '35%', top: '70%', fontSize: '16px', color: '#16a34a' }}>🌸</div>
        <div className="absolute text-purple-400 opacity-8" style={{ left: '60%', top: '40%', fontSize: '14px' }}>🦋</div>
      </div>
    )
  }

  // Décorations simples pour l'été
  if (currentTheme === 'summer') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute text-yellow-400 opacity-12" style={{ left: '85%', top: '15%', fontSize: '20px' }}>☀️</div>
        <div className="absolute text-blue-400 opacity-10" style={{ left: '40%', top: '80%', fontSize: '16px' }}>🌊</div>
      </div>
    )
  }

  return null
}

// Composant Leaderboard compact pour afficher les meilleurs joueurs du Season Pass
const SeasonPassLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/season-pass/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />
      case 2: return <Medal className="w-4 h-4 text-gray-400" />
      case 3: return <Award className="w-4 h-4 text-amber-600" />
      default: return <span className="text-xs font-bold text-gray-400">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-lg p-3 mb-6"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400">Chargement...</span>
        </div>
      </motion.div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const others = leaderboard.slice(3, 5) // Montrer seulement 2 autres

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-lg p-3 mb-6"
    >
      {/* Header compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-gray-700/20 rounded-md p-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Top joueurs</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Top 3 toujours visible */}
      <div className="mt-2 space-y-2">
        {top3.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-md bg-gray-700/20 hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600/50">
              {getRankIcon(index + 1)}
            </div>
            <img
              src={entry.avatar}
              alt={entry.username}
              className="w-8 h-8 rounded-full border border-purple-400/30"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{entry.username}</div>
              <div className="text-xs text-gray-400">Niv. {entry.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-300">{entry.points.toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section extensible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-600/20 space-y-2">
              {others.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 3) * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-md bg-gray-700/10 hover:bg-gray-700/20 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600/30">
                    {getRankIcon(index + 4)}
                  </div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-7 h-7 rounded-full border border-gray-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300 truncate">{entry.username}</div>
                    <div className="text-xs text-gray-500">Niv. {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-400">{entry.points.toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucun joueur
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface LeaderboardEntry {
  id: string
  username: string
  avatar: string
  points: number
  level: number
}

interface SeasonPassProps {
  className?: string
}

export default function SeasonPass({ className }: SeasonPassProps) {
  const { themeConfig } = useTheme()
  const [data, setData] = useState<SeasonPassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<SeasonPassTier | null>(null)
  const [showPointsTooltip, setShowPointsTooltip] = useState(false)

  const tiersPerPage = 5
  const totalPages = data ? Math.ceil(data.seasonPass.tiers.length / tiersPerPage) : 0

  // Calculate current tier and initial page
  const currentTierLevel = data ? Math.max(0, ...data.seasonPass.tiers
    .filter(tier => tier.claimed || (data.isVip && tier.vipClaimed))
    .map(tier => tier.level)) : 0

  const initialPage = data ? Math.floor((currentTierLevel - 1) / tiersPerPage) : 0
  const [currentPage, setCurrentPage] = useState(initialPage)

  useEffect(() => {
    fetchSeasonPassData()
  }, [])

  // Fermer la tooltip des points quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-tooltip-points]')) {
        setShowPointsTooltip(false)
      }
    }

    if (showPointsTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPointsTooltip])

  const fetchSeasonPassData = async () => {
    try {
      const response = await fetch('/api/season-pass')
      if (response.ok) {
        const seasonData = await response.json()
        setData(seasonData)
      }
    } catch (error) {
      console.error('Error fetching season pass data:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (tier: SeasonPassTier, isVip: boolean, uniqueId: string) => {
    if (!data) return

    setClaiming(uniqueId)
    try {
      const response = await fetch('/api/season-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: tier.id,
          isVipReward: isVip,
        }),
      })

      if (response.ok) {
        await fetchSeasonPassData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Erreur lors de la réclamation de la récompense')
    } finally {
      setClaiming(null)
    }
  }

  const currentTiers = useMemo(() => {
    if (!data) return []
    const start = currentPage * tiersPerPage
    return data.seasonPass.tiers.slice(start, start + tiersPerPage)
  }, [data, currentPage])

  const progressPercentage = data ? Math.min((currentTierLevel / 100) * 100, 100) : 0

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <p className="text-gray-300 text-lg">Chargement du Season Pass...</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`text-center p-8 min-h-[60vh] flex items-center justify-center ${className}`}>
        <div className="text-red-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">Erreur lors du chargement du season pass</p>
        </div>
      </div>
    )
  }

  const { seasonPass, isVip, seasonNeedsReset } = data

  return (
    <div className={`min-h-screen relative ${className}`}>

      {/* Header principal simplifié */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden"
      >
        <div
          className="relative backdrop-blur-2xl rounded-3xl p-8 m-2 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.9), ${themeConfig.colors.surface}40, ${themeConfig.colors.primary}25)`,
            border: `2px solid ${themeConfig.colors.primary}40`,
            boxShadow: `0 0 50px ${themeConfig.colors.primary}20, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
          }}
        >
          {/* Décorations saisonnières réduites */}
          <SeasonPassDecorations />

          <div className="text-center">
            {/* Titre principal simplifié */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                    SEASON PASS
                  </h1>
                  <div className="text-lg md:text-xl font-semibold text-purple-200">
                    {seasonPass.name}
                  </div>
                </div>
                <Crown className="w-12 h-12 text-yellow-400" />
              </div>
            </div>

            {/* Description simplifiée */}
            <div className="max-w-3xl mx-auto mb-6">
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4">
                {seasonPass.description}
              </p>

              {/* Badge saison simple */}
              <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-400/30 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 font-medium">Saison Active</span>
                <Target className="w-4 h-4 text-blue-300" />
              </div>
            </div>

            {/* Notification de reset de saison simplifiée */}
            {seasonNeedsReset && (
              <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <div>
                    <div className="text-orange-300 font-semibold text-base mb-1">🔥 NOUVELLE SAISON BIENTÔT !</div>
                    <div className="text-orange-200 text-sm">La saison actuelle se termine bientôt. Préparez-vous pour de nouvelles récompenses épiques !</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats principales simplifiées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
              {/* Points actuels avec style gaming */}
              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-400/50 rounded-2xl p-5 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="text-sm text-purple-200 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Points Actuels
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <motion.button
                      onClick={() => setShowPointsTooltip(!showPointsTooltip)}
                      className="w-6 h-6 rounded-full bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/40 flex items-center justify-center text-purple-200 text-xs font-bold transition-all duration-200 hover:scale-110"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      ?
                    </motion.button>
                  </div>
                  <motion.div
                    className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text mb-2"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {seasonPass.userProgress.currentPoints.toFixed(1)}
                  </motion.div>
                  <div className="text-xs text-purple-300 font-semibold uppercase tracking-wide">XP Accumulé</div>
                </div>
              </motion.div>

              {/* Prochain palier avec style gaming */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl border border-blue-400/50 rounded-2xl p-5 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center">
                  <div className="text-sm text-blue-200 font-bold mb-3 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" />
                    Prochain Palier
                    <Target className="w-3 h-3" />
                  </div>
                  <motion.div
                    className="text-3xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text mb-2"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(59, 130, 246, 0.5)',
                        '0 0 20px rgba(6, 182, 212, 0.5)',
                        '0 0 10px rgba(59, 130, 246, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentTiers.length > 0 ? currentTiers[0].requiredPoints.toLocaleString() : 'N/A'}
                  </motion.div>
                  <div className="text-xs text-blue-300 font-semibold uppercase tracking-wide">Points Requis</div>
                </div>
              </motion.div>

              {/* Statut VIP avec luxe */}
              <motion.div
                className={`backdrop-blur-xl border rounded-2xl p-5 shadow-xl ${
                  isVip
                    ? 'bg-gradient-to-br from-yellow-900/40 via-orange-900/35 to-red-900/40 border-yellow-400/50'
                    : 'bg-gradient-to-br from-gray-800/40 to-gray-900/45 border-gray-500/50'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                animate={isVip ? {
                  boxShadow: [
                    '0 0 20px rgba(251, 191, 36, 0.3)',
                    '0 0 35px rgba(249, 115, 22, 0.4)',
                  ]
                } : {}}
              >
                <div className="text-center">
                  <div className={`text-sm font-bold mb-3 uppercase tracking-wider flex items-center justify-center gap-1 ${
                    isVip ? 'text-yellow-200' : 'text-gray-300'
                  }`}>
                    {isVip ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    Statut
                    {isVip ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  </div>
                  <motion.div
                    className={`text-2xl font-black mb-2 ${
                      isVip ? 'text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text' : 'text-gray-200'
                    }`}
                    animate={isVip ? {
                      textShadow: [
                        '0 0 15px rgba(251, 191, 36, 0.6)',
                        '0 0 25px rgba(249, 115, 22, 0.6)',
                        '0 0 15px rgba(251, 191, 36, 0.6)',
                      ]
                    } : {}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {isVip ? 'VIP' : 'Standard'}
                  </motion.div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${
                    isVip ? 'text-yellow-300' : 'text-gray-400'
                  }`}>
                    {isVip ? 'Avantages Exclusifs' : 'Passez VIP'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Barre de progression simplifiée */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                <span className="flex items-center gap-2">
                  <Diamond className="w-4 h-4 text-purple-400" />
                  Progression Globale
                </span>
                <span className="flex items-center gap-2">
                  {Math.round(progressPercentage)}%
                  <Heart className="w-4 h-4 text-red-400" />
                </span>
              </div>

              <div className="relative">
                {/* Fond de la barre avec effets gaming */}
                <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full h-5 overflow-hidden border-2 border-purple-500/30 shadow-inner">
                  {/* Barre de progression avec effets lumineux */}
                  <motion.div
                    className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500 h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    {/* Effets de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-300/30 to-blue-300/30"></div>
                  </motion.div>

                  {/* Particules de progression */}
                  {progressPercentage > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: Math.floor(progressPercentage / 10) }).map((_, i) => (
                        <motion.div
                          key={`progress-spark-${i}`}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${(i * 10) + 5}%`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                          animate={{
                            opacity: [0.6, 1, 0.6],
                            scale: [0.5, 1.5, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Indicateur de niveau gaming */}
                <div className="flex justify-center mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-purple-400/50"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      NIVEAU {Math.floor(progressPercentage / (100 / 100))} / 100
                      <Target className="w-4 h-4" />
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <SeasonPassLeaderboard />

      {/* Navigation par pages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-4 py-2 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded-xl transition-colors"
          style={{
            backgroundColor: `${themeConfig.colors.primary}20`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}20`;
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentPage
                  ? 'bg-purple-400 scale-125'
                  : 'bg-purple-400/30 hover:bg-purple-400/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2 px-4 py-2 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded-xl transition-colors"
          style={{
            backgroundColor: `${themeConfig.colors.primary}20`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}20`;
          }}
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Section Récompenses Standard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400/50"
            animate={{
              boxShadow: [
                '0 0 15px rgba(147, 51, 234, 0.5)',
                '0 0 25px rgba(59, 130, 246, 0.5)',
                '0 0 15px rgba(147, 51, 234, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-5 h-5 text-white" />
          </motion.div>
          <motion.h2
            className="text-3xl font-black bg-gradient-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent uppercase tracking-wider"
            animate={{
              textShadow: [
                '0 0 10px rgba(147, 51, 234, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 10px rgba(147, 51, 234, 0.5)',
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            RÉCOMPENSES STANDARD
          </motion.h2>
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400/50"
            animate={{
              boxShadow: [
                '0 0 15px rgba(147, 51, 234, 0.5)',
                '0 0 25px rgba(59, 130, 246, 0.5)',
                '0 0 15px rgba(147, 51, 234, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`standard-${currentPage}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {currentTiers.map((tier, index) => (
              <RewardCard
                key={`standard-${tier.id}`}
                tier={tier}
                reward={tier.normalReward}
                isVip={false}
                currentPoints={seasonPass.userProgress.currentPoints}
                isVipUser={isVip}
                onClaim={() => claimReward(tier, false, `standard-${tier.id}`)}
                claiming={claiming === `standard-${tier.id}`}
                onSelect={() => setSelectedTier(tier)}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Section Récompenses VIP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-yellow-400/60"
            animate={{
              boxShadow: [
                '0 0 20px rgba(251, 191, 36, 0.8)',
                '0 0 35px rgba(249, 115, 22, 0.8)',
                '0 0 20px rgba(251, 191, 36, 0.8)',
              ],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-white filter drop-shadow-lg" />
          </motion.div>
          <motion.div className="text-center">
            <motion.h2
              className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent uppercase tracking-wider mb-1"
              animate={{
                textShadow: [
                  '0 0 15px rgba(251, 191, 36, 0.8)',
                  '0 0 30px rgba(249, 115, 22, 0.8)',
                  '0 0 15px rgba(251, 191, 36, 0.8)',
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              RÉCOMPENSES VIP
            </motion.h2>
            <motion.div
              className="text-sm text-yellow-200 font-semibold uppercase tracking-widest"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ LUXE & EXCLUSIVITÉ ✨
            </motion.div>
          </motion.div>
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-yellow-400/60"
            animate={{
              boxShadow: [
                '0 0 20px rgba(251, 191, 36, 0.8)',
                '0 0 35px rgba(249, 115, 22, 0.8)',
                '0 0 20px rgba(251, 191, 36, 0.8)',
              ],
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-white filter drop-shadow-lg" />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`vip-${currentPage}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {currentTiers.filter(tier => tier.vipReward).map((tier, index) => (
              <RewardCard
                key={`vip-${tier.id}`}
                tier={tier}
                reward={tier.vipReward!}
                isVip={true}
                currentPoints={seasonPass.userProgress.currentPoints}
                isVipUser={isVip}
                onClaim={() => claimReward(tier, true, `vip-${tier.id}`)}
                claiming={claiming === `vip-${tier.id}`}
                onSelect={() => setSelectedTier(tier)}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Modal de détail du palier */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTier(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="backdrop-blur-xl rounded-3xl p-8 max-w-md w-full"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.surface}90, ${themeConfig.colors.primary}80)`,
                border: `1px solid ${themeConfig.colors.primary}30`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Palier {selectedTier.level}</h3>
                <p className="text-gray-300">{selectedTier.requiredPoints.toLocaleString()} points requis</p>
              </div>

              <div className="space-y-4">
                {/* Récompense normale */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">RÉCOMPENSE NORMALE</span>
                  </div>
                  <div className="font-bold text-white text-lg">{selectedTier.normalReward.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{selectedTier.normalReward.description}</div>
                </div>

                {/* Récompense VIP */}
                {selectedTier.vipReward && (
                  <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">RÉCOMPENSE VIP</span>
                    </div>
                    <div className="font-bold text-yellow-300 text-lg">{selectedTier.vipReward.name}</div>
                    <div className="text-sm text-yellow-200 mt-1">{selectedTier.vipReward.description}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTier(null)}
                className="w-full mt-6 py-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: `${themeConfig.colors.primary}20`,
                  border: `1px solid ${themeConfig.colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}20`;
                }}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal explicative des points */}
      <AnimatePresence>
        {showPointsTooltip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPointsTooltip(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="backdrop-blur-xl rounded-3xl p-8 max-w-md w-full relative"
              style={{
                background: `linear-gradient(135deg, rgba(0, 0, 0, 0.9), ${themeConfig.colors.surface}80, ${themeConfig.colors.primary}20)`,
                border: `1px solid ${themeConfig.colors.primary}30`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPointsTooltip(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Comment gagner des points ?</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-gray-300">
                      <span className="text-white font-semibold">Quêtes journalières :</span> Utilisez la commande <code className="bg-gray-700 px-2 py-1 rounded text-purple-300 font-mono">/jobs</code> sur le bot pour valider vos quêtes.
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-gray-300">
                      <span className="text-white font-semibold">Gagner des KINTS :</span> Accumulez des KINTS pour progresser dans le Season Pass.
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-gray-300">
                      <span className="text-white font-semibold">Mini-jeux Dashboard :</span> Jouez aux jeux comme le casino, blackjack et autres pour gagner des points.
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPointsTooltip(false)}
                className="w-full mt-6 py-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: `${themeConfig.colors.primary}20`,
                  border: `1px solid ${themeConfig.colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary}20`;
                }}
              >
                Compris !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface RewardCardProps {
  tier: SeasonPassTier
  reward: { type: string, name: string, description: string }
  isVip: boolean
  currentPoints: number
  isVipUser: boolean
  onClaim: () => void
  claiming: boolean
  onSelect: () => void
  delay: number
}

function RewardCard({ tier, reward, isVip, currentPoints, isVipUser, onClaim, claiming, onSelect, delay }: RewardCardProps) {
  const { themeConfig } = useTheme()
  const canClaim = currentPoints >= tier.requiredPoints && (isVip ? !tier.vipClaimed && isVipUser : !tier.claimed)
  const isClaimed = isVip ? tier.vipClaimed : tier.claimed

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'tokens': return <Coins className="w-6 h-6 text-yellow-400" />
      case 'currency': return <Gem className="w-6 h-6 text-green-400" />
      case 'xp': return <Zap className="w-6 h-6 text-blue-400" />
      case 'orbs': return <Sparkles className="w-6 h-6 text-purple-400" />
      default: return <Star className="w-6 h-6 text-gray-400" />
    }
  }

  const colors = isVip ? (
    isVipUser ? {
      bg: 'from-yellow-500/30 via-orange-500/25 to-red-500/30',
      border: 'border-yellow-400/50 shadow-yellow-400/20',
      text: 'text-yellow-100',
      claimedBg: 'bg-emerald-500/30',
      claimedText: 'text-emerald-200',
      claimedBorder: 'border-emerald-400/60 shadow-emerald-400/30',
      iconBg: 'from-yellow-300 via-orange-400 to-red-400',
      glow: 'shadow-2xl shadow-yellow-400/40'
    } : {
      bg: 'from-gray-600/20 to-gray-700/25',
      border: 'border-gray-500/40',
      text: 'text-gray-300',
      claimedBg: 'bg-emerald-500/30',
      claimedText: 'text-emerald-200',
      claimedBorder: 'border-emerald-400/60',
      iconBg: 'from-gray-500 to-gray-600',
      glow: 'shadow-lg'
    }
  ) : {
    bg: 'from-purple-500/25 via-blue-500/20 to-indigo-500/25',
    border: 'border-purple-400/40 shadow-purple-400/20',
    text: 'text-purple-100',
    claimedBg: 'bg-emerald-500/30',
    claimedText: 'text-emerald-200',
    claimedBorder: 'border-emerald-400/60 shadow-emerald-400/30',
    iconBg: 'from-purple-400 via-blue-400 to-indigo-400',
    glow: 'shadow-xl shadow-purple-400/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="cursor-pointer"
      onClick={onSelect}
    >
      <div className={`relative bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-2xl p-5 transition-all duration-500 hover:scale-105 ${colors.glow} overflow-hidden group`}>

        {/* Effets de particules luxueuses pour VIP */}
        {isVip && !isClaimed && isVipUser && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Particules dorées principales */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`vip-particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 rounded-full shadow-lg"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, Math.random() * 25 - 12.5, 0],
                  opacity: [0.8, 1, 0.8],
                  scale: [0.5, 2, 0.5],
                  rotate: [0, 180, 360],
                  boxShadow: [
                    '0 0 10px rgba(251, 191, 36, 0.8)',
                    '0 0 20px rgba(249, 115, 22, 1)',
                    '0 0 10px rgba(251, 191, 36, 0.8)',
                  ],
                }}
                transition={{
                  duration: 4 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Particules de luxe supplémentaires */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`luxury-particle-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -25, 0],
                  opacity: [0.6, 1, 0.6],
                  scale: [0.3, 1.5, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.7,
                }}
              />
            ))}
          </div>
        )}

        {/* Halo lumineux luxueux pour VIP */}
        {isVip && !isClaimed && isVipUser && (
          <>
            <motion.div
              className="absolute -inset-3 bg-gradient-to-r from-yellow-400/40 via-orange-500/35 to-red-500/40 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-amber-300/20 via-yellow-400/25 to-orange-400/20 rounded-2xl blur-2xl"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1.05, 1.15, 1.05],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* Badge niveau */}
        <div className="absolute -top-2 -left-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {tier.level}
        </div>

        {/* Icône récompense avec effets luxueux pour VIP */}
        <div className="flex justify-center mb-4 relative">
          <motion.div
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-2xl relative z-10 border-2 border-white/20`}
            animate={isVip && !isClaimed && isVipUser ? {
              boxShadow: [
                '0 0 20px rgba(251, 191, 36, 0.8)',
                '0 0 35px rgba(249, 115, 22, 1)',
                '0 0 20px rgba(251, 191, 36, 0.8)',
              ],
              scale: [1, 1.1, 1],
            } : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            whileHover={{ scale: 1.15 }}
          >
            {getRewardIcon(reward.type)}
          </motion.div>

          {/* Couronne flottante pour VIP */}
          {isVip && !isClaimed && isVipUser && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400"
              animate={{
                y: [0, -3, 0],
                rotate: [-10, 10, -10],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Nom récompense avec effets lumineux pour VIP */}
        <motion.div
          className={`text-center font-semibold mb-2 ${colors.text} relative z-10`}
          animate={isVip && !isClaimed && isVipUser ? {
            textShadow: [
              '0 0 8px rgba(251, 191, 36, 0.5)',
              '0 0 15px rgba(249, 115, 22, 0.7)',
              '0 0 8px rgba(251, 191, 36, 0.5)',
            ]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {reward.name}
        </motion.div>

        {/* Description */}
        <div className="text-center text-sm text-gray-300 mb-3 relative z-10">
          {reward.description}
        </div>

        {/* Points requis */}
        <div className="text-center text-xs text-gray-400 mb-3 relative z-10">
          {tier.requiredPoints.toLocaleString()} XP requis
        </div>

        {/* Bouton réclamer avec effets luxueux pour VIP */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onClaim(); }}
          disabled={!canClaim || claiming}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 overflow-hidden ${
            isClaimed
              ? `${colors.claimedBg} ${colors.claimedText} ${colors.claimedBorder} cursor-default`
              : canClaim
              ? isVip && isVipUser
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 shadow-lg'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
              : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
          } ${claiming ? 'opacity-75 cursor-wait' : ''}`}
          animate={isVip && canClaim && isVipUser ? {
            boxShadow: [
              '0 0 15px rgba(251, 191, 36, 0.6)',
              '0 0 30px rgba(249, 115, 22, 1)',
              '0 0 15px rgba(251, 191, 36, 0.6)',
            ]
          } : canClaim ? {
            boxShadow: [
              '0 0 10px rgba(34, 197, 94, 0.5)',
              '0 0 20px rgba(34, 197, 94, 0.8)',
              '0 0 10px rgba(34, 197, 94, 0.5)',
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={canClaim ? { scale: 1.02 } : {}}
          whileTap={canClaim ? { scale: 0.98 } : {}}
        >
          {/* Effets de particules dans le bouton pour VIP */}
          {isVip && canClaim && isVipUser && !claiming && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`button-sparkle-${i}`}
                  className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                  style={{
                    left: `${20 + i * 25}%`,
                    top: '50%',
                  }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.8, 1, 0.8],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          )}

          <span className="relative z-10 flex items-center justify-center gap-2">
            {isClaimed ? (
              <>
                <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                ✅ OBTENUE
              </>
            ) : claiming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ⏳ RÉCLAMATION...
              </>
            ) : isVip && !isVipUser ? (
              <>
                <Shield className="w-4 h-4" />
                🔒 VIP REQUIS
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {isVip && isVipUser ? '👑 RÉCLAMER VIP' : '🎁 RÉCLAMER'}
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}

interface TierCardProps {
  tier: SeasonPassTier
  currentPoints: number
  isVip: boolean
  onClaim: (isVip: boolean) => void
  claiming: boolean
  onSelect: () => void
  delay: number
}

function TierCard({ tier, currentPoints, isVip, onClaim, claiming, onSelect, delay }: TierCardProps) {
  const { themeConfig } = useTheme()
  const canClaimNormal = currentPoints >= tier.requiredPoints && !tier.claimed
  const canClaimVip = isVip && currentPoints >= tier.requiredPoints && !tier.vipClaimed
  const isAccessible = currentPoints >= tier.requiredPoints

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'tokens': return <Coins className="w-5 h-5 text-yellow-400" />
      case 'currency': return <Gem className="w-5 h-5 text-green-400" />
      case 'xp': return <Zap className="w-5 h-5 text-blue-400" />
      case 'orbs': return <Sparkles className="w-5 h-5 text-purple-400" />
      default: return <Star className="w-5 h-5 text-gray-400" />
    }
  }

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'tokens': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
      case 'currency': return 'from-green-500/20 to-emerald-500/20 border-green-400/30'
      case 'xp': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
      case 'orbs': return 'from-purple-500/20 to-pink-500/20 border-purple-400/30'
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-400/30'
    }
  }

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 hover:scale-105`}
      onClick={onSelect}
    >
      {/* Badge spécial pour paliers importants */}
      {(tier.level % 10 === 0 || tier.level === 50 || tier.level === 100) && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold z-20">
          ⭐ ÉPIQUE
        </div>
      )}

      <div className={`relative ${
        isAccessible
          ? 'bg-purple-900/80 border-2 border-purple-400/50'
          : 'bg-gray-800/60 border-2 border-gray-600/30'
      } backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 shadow-lg`}>

        <div className="relative z-10">
          {/* Header du palier simplifié */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                  isAccessible
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {tier.level}
              </div>
              <div>
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  isAccessible ? 'text-purple-300' : 'text-gray-400'
                }`}>
                  Palier
                </div>
                <div className={`text-sm font-semibold ${
                  isAccessible ? 'text-white' : 'text-gray-300'
                }`}>
                  Niveau {tier.level}
                </div>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-lg font-medium text-sm border ${
                isAccessible
                  ? 'bg-green-500/20 text-green-300 border-green-400/50'
                  : 'bg-gray-600/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {tier.requiredPoints.toLocaleString()} XP
            </div>
          </div>

          {/* Cristal magique normal - design révolutionnaire */}
          <div className="mb-6 flex justify-center">
            <div className="relative group perspective-1000">
              {/* Base cristalline 3D */}
              <motion.div
                className="relative transform-gpu"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{ rotateY: 15, rotateX: 10 }}
                animate={{
                  rotateY: [0, 5, -5, 0],
                  rotateX: [0, 2, -2, 0],
                }}
                transition={{
                  rotateY: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  rotateX: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }
                }}
              >
                {/* Faces du cristal */}
                <div className="relative w-20 h-24">
                  {/* Face avant principale */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      tier.claimed
                        ? 'from-green-400/60 via-emerald-500/60 to-green-600/60'
                        : isAccessible
                        ? 'from-purple-400/50 via-blue-500/50 to-indigo-600/50'
                        : 'from-gray-500/40 via-gray-600/40 to-gray-700/40'
                    } border border-white/20 shadow-2xl`}
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}
                    animate={tier.claimed ? {
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.8)',
                        '0 0 30px rgba(34, 197, 94, 1)',
                      ]
                    } : isAccessible ? {
                      boxShadow: [
                        '0 0 15px rgba(147, 51, 234, 0.6)',
                        '0 0 25px rgba(59, 130, 246, 0.6)',
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Face droite */}
                  <motion.div
                    className={`absolute right-0 top-2 w-6 h-20 bg-gradient-to-br ${
                      tier.claimed
                        ? 'from-green-500/40 to-green-700/40'
                        : isAccessible
                        ? 'from-purple-500/40 to-indigo-700/40'
                        : 'from-gray-600/30 to-gray-800/30'
                    } transform rotate-y-45 border-r border-white/10`}
                    style={{
                      transform: 'rotateY(45deg) translateZ(10px)',
                      clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0 100%)'
                    }}
                  />

                  {/* Face gauche */}
                  <motion.div
                    className={`absolute left-0 top-2 w-6 h-20 bg-gradient-to-br ${
                      tier.claimed
                        ? 'from-green-300/40 to-green-600/40'
                        : isAccessible
                        ? 'from-blue-400/40 to-purple-600/40'
                        : 'from-gray-400/30 to-gray-700/30'
                    } transform -rotate-y-45 border-l border-white/10`}
                    style={{
                      transform: 'rotateY(-45deg) translateZ(10px)',
                      clipPath: 'polygon(0 0%, 100% 20%, 100% 100%, 0 80%)'
                    }}
                  />

                  {/* Face supérieure */}
                  <motion.div
                    className={`absolute top-0 left-2 right-2 h-4 bg-gradient-to-r ${
                      tier.claimed
                        ? 'from-green-200/60 to-green-400/60'
                        : isAccessible
                        ? 'from-purple-300/50 to-blue-400/50'
                        : 'from-gray-300/40 to-gray-500/40'
                    } transform -rotate-x-45 border-t border-white/20`}
                    style={{
                      transform: 'rotateX(-45deg) translateZ(15px)',
                      clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                    }}
                  />

                  {/* Icône cristallisée au centre */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-2xl"
                    animate={tier.claimed ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 360],
                    } : isAccessible ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={tier.claimed ? { duration: 1 } : { duration: 4, repeat: Infinity }}
                  >
                    {getRewardIcon(tier.normalReward.type)}
                  </motion.div>
                </div>
              </motion.div>

              {/* Particules cristallines flottantes */}
              {isAccessible && !tier.claimed && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`crystal-${i}`}
                      className="absolute w-1 h-1 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -40, 0],
                        x: [0, Math.random() * 30 - 15, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [0.5, 1.5, 0.5],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Halo cristallin */}
              {isAccessible && !tier.claimed && (
                <motion.div
                  className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-full blur-xl"
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}

              {/* Indicateur de cristal obtenu */}
              {tier.claimed && (
                <motion.div
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
                >
                  <motion.div
                    className="text-white text-sm font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}

              {/* Nom du cristal */}
              <motion.div
                className={`mt-4 text-center text-sm font-semibold ${
                  tier.claimed ? 'text-green-300' : isAccessible ? 'text-purple-200' : 'text-gray-400'
                }`}
                animate={tier.claimed ? {
                  textShadow: [
                    '0 0 8px rgba(34, 197, 94, 0.6)',
                    '0 0 15px rgba(34, 197, 94, 0.9)',
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {tier.normalReward.name}
              </motion.div>
            </div>
          </div>

          {/* Cristal VIP légendaire - design révolutionnaire ultime */}
          {tier.vipReward && (
            <div className="mb-8 flex justify-center">
              <div className="relative group perspective-1000">
                {/* Aura cristalline royale 3D */}
                <motion.div
                  className="absolute -inset-8 bg-gradient-to-r from-yellow-400/50 via-orange-500/50 to-red-500/50 rounded-full blur-3xl"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.4, 1],
                    rotate: [0, 120, 240, 360],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Cristal VIP principal 3D */}
                <motion.div
                  className="relative transform-gpu"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  whileHover={{ rotateY: 25, rotateX: 15, scale: 1.05 }}
                  animate={{
                    rotateY: [0, 8, -8, 0],
                    rotateX: [0, 3, -3, 0],
                  }}
                  transition={{
                    rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                    rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }
                  }}
                >
                  <div className="relative w-24 h-28">
                    {/* Face avant cristalline principale */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        tier.vipClaimed
                          ? 'from-green-400/70 via-emerald-500/70 to-green-600/70'
                          : 'from-yellow-400/60 via-orange-500/60 to-red-500/60'
                      } border-2 border-white/30 shadow-2xl`}
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }}
                      animate={tier.vipClaimed ? {
                        boxShadow: [
                          '0 0 25px rgba(34, 197, 94, 1)',
                          '0 0 35px rgba(34, 197, 94, 1.2)',
                        ]
                      } : {
                        boxShadow: [
                          '0 0 20px rgba(251, 191, 36, 0.8)',
                          '0 0 30px rgba(249, 115, 22, 0.8)',
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />

                    {/* Faces latérales du cristal VIP */}
                    <motion.div
                      className={`absolute right-0 top-3 w-8 h-24 bg-gradient-to-br ${
                        tier.vipClaimed
                          ? 'from-green-500/50 to-green-700/50'
                          : 'from-orange-500/50 to-red-700/50'
                      } transform rotate-y-45 border-r-2 border-white/20`}
                      style={{
                        transform: 'rotateY(45deg) translateZ(15px)',
                        clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0 100%)'
                      }}
                    />

                    <motion.div
                      className={`absolute left-0 top-3 w-8 h-24 bg-gradient-to-br ${
                        tier.vipClaimed
                          ? 'from-green-300/50 to-green-600/50'
                          : 'from-yellow-400/50 to-orange-600/50'
                      } transform -rotate-y-45 border-l-2 border-white/20`}
                      style={{
                        transform: 'rotateY(-45deg) translateZ(15px)',
                        clipPath: 'polygon(0 0%, 100% 20%, 100% 100%, 0% 80%)'
                      }}
                    />

                    {/* Face supérieure cristalline */}
                    <motion.div
                      className={`absolute top-0 left-3 right-3 h-5 bg-gradient-to-r ${
                        tier.vipClaimed
                          ? 'from-green-200/70 to-green-400/70'
                          : 'from-yellow-300/60 to-orange-400/60'
                      } transform -rotate-x-45 border-t-2 border-white/25`}
                      style={{
                        transform: 'rotateX(-45deg) translateZ(20px)',
                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                      }}
                    />

                    {/* Couronne cristallisée au centre */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-4xl"
                      animate={tier.vipClaimed ? {
                        scale: [1, 1.4, 1],
                        rotate: [0, 360],
                      } : {
                        scale: [1, 1.3, 1],
                        rotate: [0, -20, 20, 0],
                      }}
                      transition={tier.vipClaimed ? { duration: 1.2 } : { duration: 5, repeat: Infinity }}
                    >
                      <Crown className="filter drop-shadow-2xl" />
                    </motion.div>

                    {/* Gemmes internes scintillantes */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={`gem-${i}`}
                        className="absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full"
                        style={{
                          left: `${25 + i * 15}%`,
                          top: `${30 + Math.random() * 40}%`,
                        }}
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          scale: [0.5, 1.2, 0.5],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Particules cristallines VIP légendaires */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={`legendary-${i}`}
                      className="absolute w-2.5 h-2.5 bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 rounded-full shadow-xl"
                      style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`,
                      }}
                      animate={{
                        y: [0, -50, 0],
                        x: [0, Math.random() * 40 - 20, 0],
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 2.5, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 4 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                </div>

                {/* Couronne royale flottante géante */}
                <motion.div
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl filter drop-shadow-2xl"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-8, 8, -8],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  👑
                </motion.div>

                {/* Indicateur VIP légendaire */}
                {tier.vipClaimed ? (
                  <motion.div
                    className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.4 }}
                  >
                    <motion.div
                      className="text-white text-lg font-black"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      ✓
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 7, repeat: Infinity }}
                  >
                    <Crown className="w-5 h-5 text-white filter drop-shadow-lg" />
                  </motion.div>
                )}

                {/* Nom du cristal VIP légendaire */}
                <motion.div
                  className={`mt-6 text-center text-lg font-black ${
                    tier.vipClaimed ? 'text-green-300' : 'text-yellow-200'
                  }`}
                  animate={tier.vipClaimed ? {
                    textShadow: [
                      '0 0 20px rgba(34, 197, 94, 1)',
                      '0 0 30px rgba(34, 197, 94, 1.2)',
                    ]
                  } : {
                    textShadow: [
                      '0 0 15px rgba(251, 191, 36, 0.8)',
                      '0 0 25px rgba(249, 115, 22, 0.8)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {tier.vipReward.name}
                </motion.div>

                {/* Badge VIP LÉGENDAIRE */}
                {!tier.vipClaimed && (
                  <motion.div
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/60 rounded-full shadow-xl"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(251, 191, 36, 0.5)',
                        '0 0 25px rgba(249, 115, 22, 0.7)',
                        '0 0 15px rgba(251, 191, 36, 0.5)',
                      ]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                  >
                    <span className="text-yellow-300 text-sm font-black tracking-wider">VIP LÉGENDAIRE</span>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Boutons d'action simplifiés */}
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClaim(false)
              }}
              disabled={!canClaimNormal || claiming}
              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                canClaimNormal
                  ? `text-white`
                  : tier.claimed
                  ? 'bg-green-500/20 text-green-300 border border-green-400/50 cursor-default'
                  : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
              } ${claiming ? 'opacity-75 cursor-wait' : ''}`}
              style={canClaimNormal ? {
                background: `linear-gradient(90deg, ${themeConfig.colors.primary}, ${themeConfig.colors.accent})`
              } : {}}
            >
              <span className="flex items-center justify-center gap-2">
                {tier.claimed ? (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    ✅ RÉCOMPENSE OBTENUE
                  </>
                ) : claiming ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ⏳ RÉCLAMATION...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    🎁 RÉCLAMER
                  </>
                )}
              </span>
            </button>

            {tier.vipReward && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClaim(true)
                }}
                disabled={!canClaimVip || claiming}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  canClaimVip
                    ? `text-white`
                    : tier.vipClaimed
                    ? 'bg-green-500/20 text-green-300 border border-green-400/50 cursor-default'
                    : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                } ${claiming ? 'opacity-75 cursor-wait' : ''}`}
                style={canClaimVip ? {
                  background: 'linear-gradient(90deg, #f59e0b, #ea580c)'
                } : {}}
              >
                <span className="flex items-center justify-center gap-2">
                  {tier.vipClaimed ? (
                    <>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      ✅ VIP OBTENUE
                    </>
                  ) : claiming ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ⏳ RÉCLAMATION...
                    </>
                  ) : isVip ? (
                    <>
                      <Crown className="w-3 h-3" />
                      👑 RÉCLAMER VIP
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" />
                      🔒 VIP REQUIS
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
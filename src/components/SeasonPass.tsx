'use client'

import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { SeasonPassData, SeasonPassTier } from '@/types/season-pass'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Star, ChevronLeft, ChevronRight, Sparkles, Coins, Gem, Zap, Award, Target, Flame, Diamond, Heart, Shield, Medal } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface LeaderboardEntry {
  id: string
  username: string
  avatar: string
  points: number
  level: number
  isVip: boolean
}

// Composant Leaderboard
const SeasonPassLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

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
  const others = leaderboard.slice(3, 5)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-lg p-3 mb-6"
    >
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between text-left hover:bg-gray-700/20 rounded-md p-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Top joueurs</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{entry.username}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded text-center font-medium ${
                  entry.isVip
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/30'
                }`}>
                  {entry.isVip ? 'VIP' : 'STD'}
                </span>
              </div>
              <div className="text-xs text-gray-400">Niv. {entry.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-300">{entry.points.toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>

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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 truncate">{entry.username}</span>
                      <span className={`text-xs px-1 py-0.5 rounded text-center font-medium ${
                        entry.isVip
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-gray-600/30 text-gray-400 border border-gray-500/30'
                      }`}>
                        {entry.isVip ? 'VIP' : 'STD'}
                      </span>
                    </div>
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
  const tiersContainerRef = useRef<HTMLDivElement>(null)

  const tiersPerPage = 5
  const totalPages = data ? Math.ceil(data.seasonPass.tiers.length / tiersPerPage) : 0

  // Calculate current tier - show the next tier to claim
  const currentTierLevel = useMemo(() => {
    if (!data) return 0
    const currentPoints = data.seasonPass.userProgress.currentPoints
    const tiers = data.seasonPass.tiers
    
    const nextAccessibleTier = tiers.find(tier => 
      !tier.claimed && currentPoints >= tier.requiredPoints
    )
    
    if (nextAccessibleTier) {
      return nextAccessibleTier.level
    }
    
    const claimedTier = tiers
      .filter(tier => tier.claimed || (data.isVip && tier.vipClaimed))
      .sort((a, b) => b.level - a.level)[0]
    
    return claimedTier ? claimedTier.level : 0
  }, [data])

  const initialPage = data ? Math.max(0, Math.floor((currentTierLevel - 1) / tiersPerPage)) : 0
  const [currentPage, setCurrentPage] = useState(initialPage)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  useEffect(() => {
    if (data) {
      const newPage = Math.max(0, Math.floor((currentTierLevel - 1) / tiersPerPage))
      setCurrentPage(newPage)
      
      const timer = setTimeout(() => {
        if (tiersContainerRef.current) {
          tiersContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [data, currentTierLevel])

  useEffect(() => {
    fetchSeasonPassData()
  }, [])

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

  const claimAllRewards = useCallback(async () => {
    if (!data) return

    setClaiming('all')
    try {
      const response = await fetch('/api/season-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'claim_all',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ Récompenses réclamées !\n${result.claimedNormal} récompense(s) normale(s)\n${result.claimedVip} récompense(s) VIP`)
        await fetchSeasonPassData()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error claiming all rewards:', error)
      alert('Erreur lors de la réclamation des récompenses')
    } finally {
      setClaiming(null)
    }
  }, [data])

  const claimableTiersCount = useMemo(() => {
    if (!data) return 0
    const currentPoints = data.seasonPass.userProgress.currentPoints
    return data.seasonPass.tiers.filter(tier => {
      const hasEnoughPoints = currentPoints >= tier.requiredPoints
      const normalUnclaimed = !tier.claimed
      const vipUnclaimed = data.isVip && tier.vipReward && !tier.vipClaimed
      return hasEnoughPoints && (normalUnclaimed || vipUnclaimed)
    }).length
  }, [data])

  const claimReward = useCallback(async (tier: SeasonPassTier, isVip: boolean, uniqueId: string) => {
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
  }, [data])

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
          <p className="text-gray-300 text-lg">Chargement du Season Pass..</p>
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

      {/* Header principal */}
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
          <div className="text-center">
            {/* Titre principal */}
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

            {/* Description */}
            <div className="max-w-3xl mx-auto mb-6">
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4">
                {seasonPass.description}
              </p>
              <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-400/30 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 font-medium">Saison Active</span>
                <Target className="w-4 h-4 text-blue-300" />
              </div>
            </div>

            {/* Notification de reset */}
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

            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
              {/* Points actuels */}
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

              {/* Prochain palier */}
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

              {/* Statut VIP */}
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

            {/* Barre de progression */}
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
                <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full h-5 overflow-hidden border-2 border-purple-500/30 shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500 h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </motion.div>
                </div>

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
        className="flex items-center justify-between mb-4 mt-6 px-2"
      >
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-4 py-2 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded-xl transition-colors"
          style={{
            backgroundColor: `${themeConfig.colors.primary}20`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>

        {claimableTiersCount > 0 && (
          <button
            onClick={claimAllRewards}
            disabled={claiming === 'all'}
            className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-gray-200 text-sm rounded-lg border border-gray-500/30 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {claiming === 'all' ? '...' : `Tout réclammer (${claimableTiersCount})`}
          </button>
        )}

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
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Section Récompenses Standard */}
      <motion.div
        ref={tiersContainerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Award className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">RÉCOMPENSES STANDARD</h2>
          <Award className="w-8 h-8 text-purple-400" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`standard-${currentPage}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 px-2"
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
        <div className="flex items-center justify-center gap-4 mb-6">
          <Crown className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-yellow-300">RÉCOMPENSES VIP</h2>
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`vip-${currentPage}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 px-2"
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
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">RÉCOMPENSE NORMALE</span>
                  </div>
                  <div className="font-bold text-white text-lg">{selectedTier.normalReward.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{selectedTier.normalReward.description}</div>
                </div>

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
              >
                Fermer
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

// Composant de carte de récompense optimisé avec React.memo
const RewardCard = memo(function RewardCard({ tier, reward, isVip, currentPoints, isVipUser, onClaim, claiming, onSelect, delay }: RewardCardProps) {
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
        {/* Badge niveau */}
        <div className="absolute -top-2 -left-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {tier.level}
        </div>

        {/* Icône récompense */}
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

        {/* Nom récompense */}
        <motion.div
          className={`text-center font-semibold mb-2 ${colors.text} relative z-10`}
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

        {/* Bouton réclamer */}
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
        >
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
})

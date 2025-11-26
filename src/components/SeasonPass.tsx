'use client'

import { useState, useEffect, useMemo } from 'react'
import { SeasonPassData, SeasonPassTier } from '@/types/season-pass'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Star, ChevronLeft, ChevronRight, Sparkles, Coins, Gem, Zap, Award, Target, Flame, Diamond, Heart, Shield } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

// Composant de décorations saisonnières pour le Season Pass
const SeasonPassDecorations = () => {
  const { currentTheme, themeConfig } = useTheme()

  // Décorations pour Noël
  if (currentTheme === 'christmas') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sapins décoratifs */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`christmas-tree-${i}`}
            className="absolute text-green-600 opacity-20"
            style={{
              left: `${15 + i * 25}%`,
              top: `${70 + Math.random() * 20}%`,
              fontSize: `${20 + Math.random() * 15}px`,
            }}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
          >
            🎄
          </motion.div>
        ))}
        {/* Étoiles scintillantes */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`christmas-star-${i}`}
            className="absolute text-yellow-400 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${10 + Math.random() * 30}%`,
              fontSize: `${12 + Math.random() * 8}px`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour Halloween
  if (currentTheme === 'halloween') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Citrouilles décoratives */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={`halloween-pumpkin-${i}`}
            className="absolute text-orange-500 opacity-25"
            style={{
              left: `${20 + i * 35}%`,
              top: `${75 + Math.random() * 15}%`,
              fontSize: `${18 + Math.random() * 12}px`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              filter: [
                'drop-shadow(0 0 3px rgba(255, 140, 0, 0.3))',
                'drop-shadow(0 0 8px rgba(255, 140, 0, 0.6))',
                'drop-shadow(0 0 3px rgba(255, 140, 0, 0.3))',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.2,
            }}
          >
            🎃
          </motion.div>
        ))}
        {/* Chauves-souris */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`halloween-bat-${i}`}
            className="absolute text-gray-700 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${5 + Math.random() * 25}%`,
              fontSize: `${14 + Math.random() * 8}px`,
            }}
            animate={{
              x: [0, 60, 0],
              y: [0, -15, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          >
            🦇
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour le Nouvel An Chinois
  if (currentTheme === 'chinese-new-year') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Lanternes décoratives */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={`cny-lantern-${i}`}
            className="absolute text-red-600 opacity-25"
            style={{
              left: `${25 + i * 30}%`,
              top: `${20 + Math.random() * 30}%`,
              fontSize: `${16 + Math.random() * 10}px`,
            }}
            animate={{
              y: [0, -3, 0],
              rotate: [-1, 1, -1],
              filter: [
                'drop-shadow(0 0 3px rgba(255, 0, 0, 0.3))',
                'drop-shadow(0 0 8px rgba(255, 0, 0, 0.6))',
                'drop-shadow(0 0 3px rgba(255, 0, 0, 0.3))',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.8,
            }}
          >
            🏮
          </motion.div>
        ))}
        {/* Feux d'artifice miniatures */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={`cny-firework-${i}`}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${65 + Math.random() * 25}%`,
              fontSize: `${12 + Math.random() * 6}px`,
            }}
            animate={{
              scale: [0, 1.3, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 2 + Math.random() * 4,
            }}
          >
            🎆
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour l'automne
  if (currentTheme === 'autumn') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Feuilles d'automne */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`autumn-leaf-${i}`}
            className="absolute opacity-15"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${10 + Math.random() * 8}px`,
              color: ['#ea580c', '#dc2626', '#d97706'][Math.floor(Math.random() * 3)],
            }}
            animate={{
              y: [0, 20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              rotate: [0, 90, 180, 270, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          >
            🍂
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour l'hiver
  if (currentTheme === 'winter') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Flocons de neige */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`winter-snow-${i}`}
            className="absolute text-blue-200 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${6 + Math.random() * 6}px`,
            }}
            animate={{
              y: [0, 30, 0],
              x: [0, Math.random() * 10 - 5, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 4,
            }}
          >
            ❄️
          </motion.div>
        ))}
        {/* Bonhommes de neige miniatures */}
        {Array.from({ length: 1 }).map((_, i) => (
          <motion.div
            key={`winter-snowman-${i}`}
            className="absolute text-blue-300 opacity-15"
            style={{
              left: `${80 + Math.random() * 15}%`,
              top: `${75 + Math.random() * 15}%`,
              fontSize: `${14 + Math.random() * 6}px`,
            }}
            animate={{
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          >
            ⛄
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour le printemps
  if (currentTheme === 'spring') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Fleurs printanières */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`spring-flower-${i}`}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 35}%`,
              fontSize: `${12 + Math.random() * 8}px`,
              color: ['#16a34a', '#84cc16', '#eab308'][Math.floor(Math.random() * 3)],
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            🌸
          </motion.div>
        ))}
        {/* Papillons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`spring-butterfly-${i}`}
            className="absolute text-purple-400 opacity-15"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 40}%`,
              fontSize: `${10 + Math.random() * 6}px`,
            }}
            animate={{
              x: [0, 40, 0],
              y: [0, -20, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 4,
            }}
          >
            🦋
          </motion.div>
        ))}
      </div>
    )
  }

  // Décorations pour l'été
  if (currentTheme === 'summer') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soleil décoratif */}
        <motion.div
          className="absolute text-yellow-400 opacity-20"
          style={{
            left: '85%',
            top: '10%',
            fontSize: '24px',
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          ☀️
        </motion.div>
        {/* Vagues/océan */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`summer-wave-${i}`}
            className="absolute text-blue-400 opacity-15"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${80 + Math.random() * 15}%`,
              fontSize: `${14 + Math.random() * 8}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          >
            🌊
          </motion.div>
        ))}
        {/* Pastèques */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={`summer-watermelon-${i}`}
            className="absolute text-green-600 opacity-20"
            style={{
              left: `${10 + i * 40}%`,
              top: `${70 + Math.random() * 20}%`,
              fontSize: `${16 + Math.random() * 8}px`,
            }}
            animate={{
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
          >
            🍉
          </motion.div>
        ))}
      </div>
    )
  }

  return null
}

interface SeasonPassProps {
  className?: string
}

export default function SeasonPass({ className }: SeasonPassProps) {
  const { themeConfig } = useTheme()
  const [data, setData] = useState<SeasonPassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedTier, setSelectedTier] = useState<SeasonPassTier | null>(null)
  const [showPointsTooltip, setShowPointsTooltip] = useState(false)

  const tiersPerPage = 5
  const totalPages = data ? Math.ceil(data.seasonPass.tiers.length / tiersPerPage) : 0

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

  const claimReward = async (tier: SeasonPassTier, isVip: boolean) => {
    if (!data) return

    setClaiming(tier.id)
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

  const progressPercentage = data ? Math.min(
    (data.seasonPass.userProgress.currentPoints / Math.max(...data.seasonPass.tiers.map(t => t.requiredPoints))) * 100,
    100
  ) : 0

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

      {/* Header principal avec design époustouflant */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden"
      >
        {/* Bordure lumineuse animée */}
        <div className="absolute inset-0 rounded-3xl">
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20"
            animate={{
              background: [
                'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))',
                'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))',
                'linear-gradient(225deg, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))',
                'linear-gradient(315deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div
          className="relative backdrop-blur-2xl rounded-3xl p-8 m-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), ${themeConfig.colors.surface}30, ${themeConfig.colors.primary}20)`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
        >
          {/* Décorations saisonnières spécifiques au Season Pass */}
          <SeasonPassDecorations />
          {/* Étoiles décoratives */}
          <div className="absolute top-4 left-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>

          <div className="text-center relative z-10">
            {/* Titre principal avec effets spéciaux */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="relative mb-6"
            >
              {/* Glow derrière le titre */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-blue-400/20 blur-3xl scale-150 rounded-full"></div>

              <div className="relative flex items-center justify-center gap-6">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
                </motion.div>

                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
                    SEASON PASS
                  </h1>
                  <motion.div
                    className="text-xl md:text-2xl font-bold text-purple-200"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {seasonPass.name}
                  </motion.div>
                </div>

                <motion.div
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                >
                  <Crown className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
                </motion.div>
              </div>
            </motion.div>

            {/* Description avec style amélioré */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-4">
                {seasonPass.description}
              </p>

              {/* Badge saison avec animation */}
              <motion.div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(147, 51, 234, 0.3)',
                    '0 0 30px rgba(59, 130, 246, 0.3)',
                    '0 0 20px rgba(147, 51, 234, 0.3)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 font-semibold">Saison Active</span>
                <Target className="w-4 h-4 text-blue-300" />
              </motion.div>
            </motion.div>

            {/* Notification de reset de saison améliorée */}
            {seasonNeedsReset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-orange-500/40 rounded-2xl p-6 mb-8 max-w-2xl mx-auto relative overflow-hidden"
              >
                {/* Effets de feu animés */}
                <div className="absolute inset-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-8 bg-gradient-to-t from-orange-500/50 to-transparent"
                      style={{
                        left: `${10 + i * 10}%`,
                        bottom: 0,
                      }}
                      animate={{
                        height: [8, 16, 8],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-400/30"
                  >
                    <Flame className="w-6 h-6 text-orange-400" />
                  </motion.div>
                  <div>
                    <div className="text-orange-300 font-bold text-lg mb-1">🔥 NOUVELLE SAISON BIENTÔT !</div>
                    <div className="text-orange-200 text-sm">La saison actuelle se termine bientôt. Préparez-vous pour de nouvelles récompenses épiques !</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats principales avec design amélioré */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto"
            >
              {/* Points actuels */}
              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(147, 51, 234, 0.2)',
                    '0 0 30px rgba(147, 51, 234, 0.4)',
                    '0 0 20px rgba(147, 51, 234, 0.2)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                </div>
                <div className="text-center relative">
                   <div className="flex items-center justify-center gap-2 mb-2">
                     <div className="text-sm text-purple-300 font-semibold uppercase tracking-wide">Points Actuels</div>
                     <button
                       onClick={() => setShowPointsTooltip(!showPointsTooltip)}
                       className="w-5 h-5 rounded-full bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/30 flex items-center justify-center text-purple-300 text-xs font-bold transition-colors"
                     >
                       ?
                     </button>
                   </div>
                   <div className="text-3xl font-black text-purple-200 mb-1">{seasonPass.userProgress.currentPoints.toFixed(1)}</div>
                   <div className="text-xs text-purple-400">XP accumulé</div>
                 </div>
              </motion.div>

              {/* Prochain palier */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.2)',
                    '0 0 30px rgba(59, 130, 246, 0.4)',
                    '0 0 20px rgba(59, 130, 246, 0.2)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <div className="absolute top-2 right-2">
                  <Target className="w-4 h-4 text-blue-300 animate-bounce" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-300 font-semibold mb-2 uppercase tracking-wide">Prochain Palier</div>
                  <div className="text-3xl font-black text-blue-200 mb-1">
                    {currentTiers.length > 0 ? currentTiers[0].requiredPoints.toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-xs text-blue-400">Points requis</div>
                </div>
              </motion.div>

              {/* Statut VIP */}
              <motion.div
                className={`backdrop-blur-xl border rounded-2xl p-6 relative overflow-hidden ${
                  isVip
                    ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/30'
                    : 'bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-400/30'
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                animate={isVip ? {
                  boxShadow: [
                    '0 0 20px rgba(234, 179, 8, 0.2)',
                    '0 0 30px rgba(234, 179, 8, 0.4)',
                    '0 0 20px rgba(234, 179, 8, 0.2)',
                  ]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              >
                <div className="absolute top-2 right-2">
                  {isVip ? (
                    <Crown className="w-4 h-4 text-yellow-300 animate-pulse" />
                  ) : (
                    <Shield className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
                    isVip ? 'text-yellow-300' : 'text-gray-400'
                  }`}>
                    Statut
                  </div>
                  <div className={`text-2xl font-black mb-1 ${
                    isVip ? 'text-yellow-200' : 'text-gray-300'
                  }`}>
                    {isVip ? 'VIP' : 'Standard'}
                  </div>
                  <div className={`text-xs ${
                    isVip ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {isVip ? 'Avantages exclusifs' : 'Passez VIP'}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Barre de progression globale ultra-stylisée */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
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
                {/* Fond de la barre */}
                <div className="w-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-full h-6 overflow-hidden border border-purple-500/20">
                  {/* Effets lumineux sur la barre vide */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"></div>

                  {/* Barre de progression */}
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    {/* Effets sur la barre remplie */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>

                    {/* Particules sur la barre */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-yellow-300 rounded-full mx-1"
                          animate={{
                            scale: [0.5, 1.5, 0.5],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Indicateur de niveau */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                    animate={{
                      y: [0, -5, 0],
                      boxShadow: [
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                        '0 0 20px rgba(147, 51, 234, 0.8)',
                        '0 0 10px rgba(147, 51, 234, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Niveau {Math.floor(progressPercentage / (100 / 100))} / 100
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

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

      {/* Grille des paliers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {currentTiers.map((tier, index) => (
            <TierCard
              key={tier.id}
              tier={tier}
              currentPoints={seasonPass.userProgress.currentPoints}
              isVip={isVip}
              onClaim={(isVipReward) => claimReward(tier, isVipReward)}
              claiming={claiming === tier.id}
              onSelect={() => setSelectedTier(tier)}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </AnimatePresence>

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
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 15 }}
      className={`relative group cursor-pointer transition-all duration-500`}
      onClick={onSelect}
    >
      {/* Glow effect dynamique pour les paliers accessibles */}
      {isAccessible && (
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-indigo-500/30 rounded-3xl blur-2xl"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Bordure animée pour les paliers spéciaux */}
      {(tier.level % 10 === 0 || tier.level === 50 || tier.level === 100) && (
        <motion.div
          className="absolute -inset-1 rounded-3xl border-2 border-yellow-400/50"
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 179, 8, 0.5)',
              '0 0 30px rgba(249, 115, 22, 0.7)',
              '0 0 20px rgba(234, 179, 8, 0.5)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className={`relative ${
        isAccessible
          ? 'bg-gradient-to-br from-purple-900/90 via-blue-900/80 to-indigo-900/90 border-2 border-purple-400/50'
          : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-600/30'
      } backdrop-blur-2xl rounded-3xl p-6 transition-all duration-500 overflow-hidden shadow-2xl`}>

        {/* Particules animées pour les paliers accessibles */}
        {isAccessible && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.4, 1, 0.4],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Badge spécial pour paliers importants */}
        {(tier.level % 10 === 0 || tier.level === 50 || tier.level === 100) && (
          <motion.div
            className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-black shadow-lg z-20"
            animate={{
              rotate: [0, -5, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐ ÉPIQUE
          </motion.div>
        )}

        <div className="relative z-10">
          {/* Header du palier avec design amélioré */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
                  isAccessible
                    ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-purple-500/50'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 shadow-gray-500/30'
                }`}
                animate={isAccessible ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {tier.level}
              </motion.div>
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  isAccessible ? 'text-purple-300' : 'text-gray-400'
                }`}>
                  Palier
                </div>
                <div className={`text-sm font-black ${
                  isAccessible ? 'text-white' : 'text-gray-300'
                }`}>
                  Niveau {tier.level}
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`px-4 py-2 rounded-2xl font-bold text-sm border-2 ${
                isAccessible
                  ? 'bg-green-500/20 text-green-300 border-green-400/50 shadow-lg shadow-green-500/20'
                  : 'bg-gray-600/20 text-gray-400 border-gray-500/30'
              }`}
              animate={isAccessible ? {
                boxShadow: [
                  '0 0 10px rgba(34, 197, 94, 0.3)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 10px rgba(34, 197, 94, 0.3)',
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {tier.requiredPoints.toLocaleString()} XP
            </motion.div>
          </div>

          {/* Récompense normale avec design amélioré */}
          <motion.div
            className={`mb-5 p-4 rounded-2xl border-2 bg-gradient-to-r ${getRewardColor(tier.normalReward.type)} backdrop-blur-sm`}
            whileHover={{ scale: 1.02 }}
            animate={tier.claimed ? {
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
            } : {}}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center border border-white/20"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {getRewardIcon(tier.normalReward.type)}
              </motion.div>
              <div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">RÉCOMPENSE</div>
                <div className="text-sm font-semibold text-white">Standard</div>
              </div>
            </div>

            <div className={`text-lg font-black mb-2 ${
              tier.claimed ? 'text-green-400' : 'text-white'
            }`}>
              {tier.normalReward.name}
            </div>
            <div className="text-sm text-gray-300 leading-tight">
              {tier.normalReward.description}
            </div>

            {tier.claimed && (
              <motion.div
                className="mt-3 flex items-center gap-2 text-green-400 text-sm font-bold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                RÉCOMPENSE OBTENUE
              </motion.div>
            )}
          </motion.div>

          {/* Récompense VIP avec design premium */}
          {tier.vipReward && (
            <motion.div
              className="mb-5 p-4 rounded-2xl border-2 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-sm border-yellow-400/50"
              whileHover={{ scale: 1.02 }}
              animate={tier.vipClaimed ? {
                boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)',
              } : {
                boxShadow: [
                  '0 0 15px rgba(234, 179, 8, 0.2)',
                  '0 0 25px rgba(234, 179, 8, 0.4)',
                  '0 0 15px rgba(234, 179, 8, 0.2)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-400/30"
                  animate={{
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div>
                  <div className="text-xs font-bold text-yellow-300 uppercase tracking-wide">RÉCOMPENSE</div>
                  <div className="text-sm font-semibold text-yellow-200">VIP Exclusive</div>
                </div>
              </div>

              <div className={`text-lg font-black mb-2 ${
                tier.vipClaimed ? 'text-green-400' : 'text-yellow-200'
              }`}>
                {tier.vipReward.name}
              </div>
              <div className="text-sm text-yellow-200/80 leading-tight">
                {tier.vipReward.description}
              </div>

              {tier.vipClaimed && (
                <motion.div
                  className="mt-3 flex items-center gap-2 text-green-400 text-sm font-bold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  RÉCOMPENSE VIP OBTENUE
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Boutons d'action avec design amélioré */}
          <div className="space-y-3">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onClaim(false)
              }}
              disabled={!canClaimNormal || claiming}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                canClaimNormal
                  ? `text-white shadow-xl`
                  : tier.claimed
                  ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-2 border-green-400/50 cursor-default'
                  : 'bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-400 border-2 border-gray-500/30 cursor-not-allowed'
              } ${claiming ? 'opacity-75 cursor-wait' : ''}`}
              style={canClaimNormal ? {
                background: `linear-gradient(90deg, ${themeConfig.colors.primary}, ${themeConfig.colors.accent}, ${themeConfig.colors.primary})`,
                boxShadow: `0 10px 25px ${themeConfig.colors.primary}30`
              } : canClaimVip ? {
                background: `linear-gradient(90deg, #f59e0b, #ea580c, #f59e0b)`,
                boxShadow: `0 10px 25px rgba(245, 158, 11, 0.3)`
              } : {}}
              whileHover={canClaimNormal ? { scale: 1.02 } : {}}
              whileTap={canClaimNormal ? { scale: 0.98 } : {}}
            >
              {/* Effets lumineux sur le bouton */}
              {canClaimNormal && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                {tier.claimed ? (
                  <>
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    ✅ RÉCOMPENSE OBTENUE
                  </>
                ) : claiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ⏳ RÉCLAMATION...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    🎁 RÉCLAMER
                  </>
                )}
              </span>
            </motion.button>

            {tier.vipReward && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onClaim(true)
                }}
                disabled={!canClaimVip || claiming}
                className={`w-full py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                  canClaimVip
                    ? `text-white shadow-xl`
                    : tier.vipClaimed
                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-2 border-green-400/50 cursor-default'
                    : 'bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-400 border-2 border-gray-500/30 cursor-not-allowed'
                } ${claiming ? 'opacity-75 cursor-wait' : ''}`}
                whileHover={canClaimVip ? { scale: 1.02 } : {}}
                whileTap={canClaimVip ? { scale: 0.98 } : {}}
              >
                {/* Effets lumineux sur le bouton VIP */}
                {canClaimVip && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                )}

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tier.vipClaimed ? (
                    <>
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                      ✅ VIP OBTENUE
                    </>
                  ) : claiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ⏳ RÉCLAMATION...
                    </>
                  ) : isVip ? (
                    <>
                      <Crown className="w-4 h-4" />
                      👑 RÉCLAMER VIP
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      🔒 VIP REQUIS
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getPointsLeaderboard, fetchPoints, updatePoints } from '@/utils/api'
import { motion } from 'framer-motion'

type LeaderboardEntry = {
  userId: string
  points: number
  name: string
  avatar: string
}

type MemberInfo = {
  id: string
  username: string
  avatar: string
}

export default function KintLeaderboardPage() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [adjustValue, setAdjustValue] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      loadServerMembersAndLeaderboard()
      loadUserPoints(session.user.id)
    }
  }, [session])

  const loadServerMembersAndLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://51.83.103.24:20077/api/serverinfo')
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      const allMembers: MemberInfo[] = data.members || []

      const leaderboardPoints = await getPointsLeaderboard()
      const top10 = leaderboardPoints.slice(0, 10)

      const enriched: LeaderboardEntry[] = top10.map((entry) => {
        const user = allMembers.find((m) => m.id === entry.userId)
        return {
          userId: entry.userId,
          points: entry.points,
          name: user ? user.username : entry.userId,
          avatar: user ? user.avatar : '/default-avatar.png',
        }
      })

      setLeaderboard(enriched)
    } catch (err) {
      console.error('Erreur chargement leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadUserPoints = async (userId: string) => {
    try {
      const res = await fetchPoints(userId)
      setUserPoints(res.points)
    } catch {
      setUserPoints(null)
    }
  }

  const handleKintChange = async (action: 'gain' | 'perdu') => {
    if (!session?.user?.id || isNaN(adjustValue) || adjustValue <= 0) return
    const current = userPoints ?? 0
    const newPoints = action === 'gain' ? current + adjustValue : Math.max(0, current - adjustValue)

    try {
      await updatePoints(session.user.id, newPoints)
      setUserPoints(newPoints)
      setFeedback(`✅ ${action === 'gain' ? `+${adjustValue}` : `-${adjustValue}`} points appliqués.`)
      loadServerMembersAndLeaderboard()
      setTimeout(() => setFeedback(''), 3000)
    } catch {
      setFeedback('❌ Erreur lors de la mise à jour.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

        body, html, #__next {
          margin: 0; padding: 0; height: 100%;
          background: #12161b;
          font-family: 'Roboto Mono', monospace;
          color: #c8d0e7;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(100, 120, 160, 0.3);
          border-radius: 4px;
        }
      `}</style>

      <main className="flex flex-col items-center min-h-screen p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-14 select-none tracking-wide text-cyan-400">
          🎮 Mini-Jeux – Classement KINT
        </h1>

        <div className="flex flex-col md:flex-row gap-12 w-full">
          {/* User Control Panel */}
          <section
            aria-label="Contrôle utilisateur"
            className="flex flex-col items-center bg-[#1e2530] rounded-xl border border-[#324155] p-8 w-full md:w-1/3 shadow-lg"
          >
            <p className="text-sm mb-6 opacity-70 select-none text-cyan-300">
              Connecté en tant que{' '}
              <span className="font-semibold">{session?.user?.name}</span>
            </p>

            <div className="text-7xl font-bold mb-8 select-none tracking-tight text-cyan-400">
              {userPoints !== null ? userPoints : '—'} <span className="text-xl opacity-60">pts</span>
            </div>

            <input
              type="number"
              min={0}
              value={adjustValue}
              onChange={(e) => setAdjustValue(Number(e.target.value))}
              placeholder="Points"
              className="w-24 text-center rounded border border-[#324155] bg-[#12161b] py-2 text-xl text-cyan-200 placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />

            <div className="flex gap-6 mt-6 w-full justify-center">
              <button
                onClick={() => handleKintChange('gain')}
                className="bg-cyan-600 hover:bg-cyan-700 transition rounded px-8 py-2 font-semibold text-[#e0e6f6] shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Gagner des points"
              >
                 Gagné
              </button>
              <button
                onClick={() => handleKintChange('perdu')}
                className="bg-[#4e2e3e] hover:bg-[#5a3850] transition rounded px-8 py-2 font-semibold text-[#e0e6f6] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                aria-label="Perdre des points"
              >
                Perdu
              </button>
            </div>

            {feedback && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-6 text-center font-semibold ${
                  feedback.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {feedback}
              </motion.p>
            )}
          </section>

          {/* Leaderboard */}
          <section
            aria-label="Classement des points"
            className="bg-[#1e2530] rounded-xl border border-[#324155] p-6 w-full md:w-2/3 shadow-lg max-h-[600px] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide text-cyan-400 select-none">
              🏆 Classement des points KIP
            </h2>

            {loading ? (
              <p className="text-center italic opacity-60 select-none text-cyan-300">Chargement du classement...</p>
            ) : (
              <ul className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = session?.user?.id === entry.userId
                  return (
                    <motion.li
                      key={entry.userId}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, type: 'spring', stiffness: 110 }}
                      className={`flex items-center gap-4 px-6 py-3 rounded-md cursor-default select-none transition-colors ${
                        isCurrentUser
                          ? 'bg-cyan-700 text-white shadow-lg border border-cyan-400'
                          : 'bg-[#272e3b] text-cyan-200 hover:bg-[#334058]'
                      }`}
                    >
                      <span className="font-mono w-6 text-center opacity-60">{index + 1}</span>

                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src = '/default-avatar.png'
                        }}
                        className="w-10 h-10 rounded-full object-cover border border-transparent transition-colors"
                      />

                      <span className="flex-1 truncate font-medium">{entry.name}</span>

                      <span className="font-mono font-semibold">{entry.points} pts</span>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swords, Users } from 'lucide-react'

const GameCard = ({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) => (
    <Link href={href}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="futuristic-card p-8 text-center flex flex-col items-center group h-full"
        >
            <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 flex items-center justify-center rounded-full bg-cyan-500/10 border-2 border-cyan-500/50 text-cyan-400 mb-6"
            >
                {icon}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 flex-grow">{description}</p>
            <div className="mt-6 text-sm font-semibold text-cyan-300 group-hover:underline">
                Entrer dans l'arène
            </div>
        </motion.div>
    </Link>
);


export default function MiniJeuHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-extrabold mb-16 tracking-wide text-cyan-400"
      >
        Arène des Mini-Jeux
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <GameCard 
            href="/dashboard/mini-jeu/kint"
            icon={<Swords size={48} />}
            title="KINT"
            description="Affrontez vos amis, déclarez vos victoires et défaites, et grimpez dans le classement de l'arène."
        />
        <GameCard 
            href="/dashboard/mini-jeu/1v1"
            icon={<Users size={48} />}
            title="Mode 1v1"
            description="Bientôt disponible. Préparez-vous pour des duels intenses et des récompenses exclusives."
        />
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
    Coins, Crown, Dices, Sparkles, Star, 
    PlayCircle, Lock, Zap, TrendingUp, Flame, Diamond, Users
} from 'lucide-react'
import { NyxCard } from '@/components/ui/NyxCard'
import { useState, useEffect } from 'react'

// Game Statistics Component
const GameStats = ({ icon, label, value, color = "text-yellow-400" }: {
    icon: React.ReactNode, 
    label: string, 
    value: string | number,
    color?: string
}) => (
    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-yellow-600/30">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

// VIP Casino Game Card Component
const VIPGameCard = ({ 
    href, 
    icon, 
    title, 
    description, 
    isAvailable = true, 
    minBet,
    maxWin,
    isNew = false,
    isHot = false
}: { 
    href: string, 
    icon: React.ReactNode, 
    title: string, 
    description: string,
    isAvailable?: boolean,
    minBet?: string,
    maxWin?: string,
    isNew?: boolean,
    isHot?: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const CardContent = (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={isAvailable ? { scale: 1.03, y: -5 } : {}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative overflow-hidden h-full backdrop-blur-sm rounded-2xl border-2 transition-all duration-500 group
                ${
                    isAvailable 
                        ? 'bg-gradient-to-br from-yellow-900/20 via-black/80 to-yellow-800/20 border-yellow-600/50 hover:border-yellow-400/80 hover:shadow-2xl hover:shadow-yellow-500/30 cursor-pointer' 
                        : 'bg-gray-900/50 border-gray-700/30 cursor-not-allowed opacity-75'
                }
            `}
        >
            {/* Luxury Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-600 to-amber-500 rounded-full blur-2xl" />
            </div>
            
            {/* Animated sparkles */}
            {isAvailable && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>
            )}
            
            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {isNew && (
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        NOUVEAU
                    </div>
                )}
                {isHot && (
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <Flame className="h-3 w-3" />
                        POPULAIRE
                    </div>
                )}
                {!isAvailable && (
                    <div className="px-3 py-1 bg-gray-700/90 text-gray-300 text-xs font-bold rounded-full flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        BIENTÔT
                    </div>
                )}
            </div>

            <div className="relative p-8 h-full flex flex-col z-10">
                {/* Game Icon */}
                <motion.div 
                    animate={isHovered && isAvailable ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`
                        w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl border-2 text-4xl
                        ${
                            isAvailable 
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400/50 text-white shadow-2xl shadow-yellow-500/50' 
                                : 'bg-gray-700/50 border-gray-600/50 text-gray-400'
                        }
                    `}
                >
                    {icon}
                </motion.div>
                
                {/* Game Title */}
                <h2 className={`text-3xl font-bold text-center mb-3 ${
                    isAvailable ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500' : 'text-gray-400'
                }`}>
                    {title}
                </h2>
                
                {/* Description */}
                <p className="text-gray-300 text-center text-sm mb-6 flex-grow leading-relaxed">
                    {description}
                </p>
                
                {/* Game Stats */}
                <div className="space-y-3 mb-6">
                    {minBet && (
                        <GameStats 
                            icon={<Coins className="h-4 w-4 text-yellow-400" />} 
                            label="Mise minimum" 
                            value={minBet}
                            color="text-yellow-400"
                        />
                    )}
                    {maxWin && (
                        <GameStats 
                            icon={<TrendingUp className="h-4 w-4 text-green-400" />} 
                            label="Gain maximum" 
                            value={maxWin}
                            color="text-green-400"
                        />
                    )}
                </div>
                
                {/* Action Button */}
                <motion.div 
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    className={`
                        mt-auto p-4 rounded-xl text-center font-bold transition-all duration-300 flex items-center justify-center gap-3
                        ${
                            isAvailable 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-400 hover:to-orange-500 shadow-lg hover:shadow-yellow-500/50' 
                                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isAvailable ? (
                        <>
                            <PlayCircle className="h-5 w-5" />
                            Jouer maintenant
                        </>
                    ) : (
                        <>
                            <Lock className="h-5 w-5" />
                            Bientôt disponible
                        </>
                    )}
                </motion.div>
            </div>
            
            {/* Hover Glow Effect */}
            {isAvailable && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.2 : 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl"
                />
            )}
        </motion.div>
    );

    return isAvailable ? (
        <Link href={href} className="block h-full">
            {CardContent}
        </Link>
    ) : CardContent;
};

// Floating gold particles
const FloatingGoldParticle = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ 
            opacity: [0, 1, 0], 
            y: [-20, -100],
            x: [0, Math.random() * 100 - 50]
        }}
        transition={{
            duration: 4,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"
        style={{
            left: `${Math.random() * 100}%`,
            bottom: '10%'
        }}
    />
);

export default function CasinoVIPHome() {
    const [currentTime, setCurrentTime] = useState('');
    
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full text-white relative">
            
            <div className="relative z-10 px-8 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center mb-16"
                >
                    {/* Main Title */}
                    <div className="mb-6 flex items-center justify-center gap-6">
                        <motion.div 
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl shadow-yellow-500/50"
                        >
                            <Crown className="h-12 w-12 text-white" />
                        </motion.div>
                        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            Carré VIP
                        </h1>
                        <motion.div 
                            animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: 1
                            }}
                            className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl shadow-yellow-500/50"
                        >
                            <Diamond className="h-12 w-12 text-white" />
                        </motion.div>
                    </div>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                    >
                        Bienvenue dans l'espace exclusif du casino. Découvrez nos jeux de luxe et tentez de remporter le jackpot ! 🎰✨
                    </motion.p>
                    
                    {/* VIP Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-500/50 rounded-full backdrop-blur-sm"
                    >
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-300 font-bold">Accès VIP Exclusif</span>
                        <Star className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                    
                    {/* Status Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center justify-center gap-8 text-sm text-gray-400 mt-6"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Casino ouvert 24/7</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span>{currentTime}</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Games Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-yellow-400" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                            Nos Jeux Exclusifs
                        </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Slot Machine - Available */}
                        <VIPGameCard 
                            href="/dashboard/mini-jeu/casino"
                            icon={<span className="text-4xl">🎰</span>}
                            title="Slot Machine"
                            description="La machine à sous classique ! Alignez les symboles et remportez des gains incroyables. Jackpot progressif disponible !"
                            isAvailable={true}
                            minBet="10 pièces"
                            maxWin="x50 multiplicateur"
                            isHot={true}
                        />
                        
                        {/* Rainbow Cascade - NEW */}
                        <VIPGameCard 
                            href="/dashboard/mini-jeu/rainbow-cascade"
                            icon={<span className="text-4xl">🌈</span>}
                            title="Rainbow Cascade"
                            description="Une balle tombe à travers des obstacles et change de couleur ! Visez l'arc-en-ciel pour le jackpot x10 !"
                            isAvailable={true}
                            minBet="10 pièces"
                            maxWin="x10 multiplicateur"
                            isNew={true}
                        />

                        {/* Blackjack - NEW */}
                        <VIPGameCard
                            href="/dashboard/mini-jeu/blackjack"
                            icon={<Dices />}
                            title="Blackjack"
                            description="Le classique du casino. Affrontez le croupier, visez 21 et montrez votre maîtrise de la stratégie."
                            isAvailable={true}
                            minBet="100 pièces"
                            maxWin="x2.5 (Blackjack)"
                            isNew={true}
                        />

                    


                    </div>
                </motion.div>

                {/* Coming Soon Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-20 text-center"
                >
                    <NyxCard delay={0}>
                        <div className="p-8 text-center bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-600/30 rounded-2xl">
                            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 mb-3">
                                Plus de Jeux à Venir
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Nous préparons d'autres jeux exclusifs pour le carré VIP. Blackjack, Poker, Roulette et bien plus encore !
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span>Jackpots progressifs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-yellow-400" />
                                    <span>Bonus quotidiens</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-400" />
                                    <span>Tournois VIP</span>
                                </div>
                            </div>
                        </div>
                    </NyxCard>
                </motion.div>
            </div>
        </div>
    );
}
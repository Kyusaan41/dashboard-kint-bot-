'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Swords, Users, Gamepad2, Trophy, Zap, Coins, Star, 
    PlayCircle, Lock, Crown, Target, Sparkles, Flame, Gift
} from 'lucide-react'
import { NyxCard } from '@/components/ui/NyxCard'
import { useState, useEffect } from 'react'
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

// Game Statistics Component
const GameStats = ({ icon, label, value, color = "text-purple-secondary" }: {
    icon: React.ReactNode, 
    label: string, 
    value: string | number,
    color?: string
}) => (
    <div className="flex items-center gap-3 p-3 bg-card-dark/30 rounded-lg border border-gray-700/50">
        <div className="w-8 h-8 rounded-lg bg-purple-primary/20 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

// Enhanced Game Card Component
const GameCard = ({ 
    href, 
    icon, 
    title, 
    description, 
    isAvailable = true, 
    players,
    rewards,
    difficulty,
    isNew = false,
    isPopular = false
}: { 
    href: string, 
    icon: React.ReactNode, 
    title: string, 
    description: string,
    isAvailable?: boolean,
    players?: string,
    rewards?: string,
    difficulty?: 'Facile' | 'Moyen' | 'Difficile',
    isNew?: boolean,
    isPopular?: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const difficultyColors = {
        'Facile': 'text-green-400 bg-green-400/20 border-green-400/50',
        'Moyen': 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50',
        'Difficile': 'text-red-400 bg-red-400/20 border-red-400/50'
    };

    const CardContent = (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={isAvailable ? { scale: 1.03, y: -5 } : {}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative overflow-hidden h-full backdrop-blur-sm rounded-2xl border transition-all duration-500 group
                ${
                    isAvailable 
                        ? 'bg-gradient-to-br from-card-dark/80 to-purple-primary/10 border-gray-700/50 hover:border-purple-primary/50 hover:shadow-2xl hover:shadow-purple-primary/20 cursor-pointer' 
                        : 'bg-gray-800/50 border-gray-700/30 cursor-not-allowed opacity-75'
                }
            `}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-purple rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-secondary/20 rounded-full blur-xl" />
            </div>
            
            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {isNew && (
                    <div className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        NOUVEAU
                    </div>
                )}
                {isPopular && (
                    <div className="px-3 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        POPULAIRE
                    </div>
                )}
                {!isAvailable && (
                    <div className="px-3 py-1 bg-gray-600/90 text-gray-300 text-xs font-bold rounded-full flex items-center gap-1">
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
                                ? 'bg-gradient-purple border-purple-primary/50 text-white shadow-lg shadow-purple-primary/30' 
                                : 'bg-gray-700/50 border-gray-600/50 text-gray-400'
                        }
                    `}
                >
                    {icon}
                </motion.div>
                
                {/* Game Title */}
                <h2 className={`text-3xl font-bold text-center mb-3 ${
                    isAvailable ? 'text-white' : 'text-gray-400'
                }`}>
                    {title}
                </h2>
                
                {/* Difficulty Badge */}
                {difficulty && (
                    <div className={`mx-auto mb-4 px-3 py-1 rounded-lg text-xs font-bold border ${
                        difficultyColors[difficulty]
                    }`}>
                        {difficulty}
                    </div>
                )}
                
                {/* Description */}
                <p className="text-gray-400 text-center text-sm mb-6 flex-grow leading-relaxed">
                    {description}
                </p>
                
                {/* Game Stats */}
                <div className="space-y-3 mb-6">
                    {players && (
                        <GameStats 
                            icon={<Users className="h-4 w-4 text-blue-400" />} 
                            label="Joueurs actifs" 
                            value={players}
                            color="text-blue-400"
                        />
                    )}
                    {rewards && (
                        <GameStats 
                            icon={<Coins className="h-4 w-4 text-yellow-400" />} 
                            label="Récompenses" 
                            value={rewards}
                            color="text-yellow-400"
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
                                ? 'btn-nyx-primary group-hover:shadow-lg group-hover:shadow-purple-primary/50' 
                                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isAvailable ? (
                        <>
                            <PlayCircle className="h-5 w-5" />
                            {title === "Casino VIP" ? "Entrer dans le carré VIP" : "Entrer dans l'arène"}
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
                    animate={{ opacity: isHovered ? 0.3 : 0 }}
                    className="absolute inset-0 bg-gradient-purple rounded-2xl"
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


// Statistics Card Component
const StatsCard = ({ icon, title, value, description }: {
    icon: React.ReactNode,
    title: string,
    value: string,
    description: string
}) => (
    <NyxCard delay={0.4}>
        <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-purple flex items-center justify-center">
                {icon}
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
            <p className="text-3xl font-bold text-purple-secondary mb-2">{value}</p>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </NyxCard>
);

const FloatingParticle = ({ delay }: { delay: number }) => (
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
        className="absolute w-2 h-2 bg-purple-primary rounded-full"
        style={{
            left: `${Math.random() * 100}%`,
            bottom: '10%'
        }}
    />
);

export default function MiniJeuHome() {
    const [currentTime, setCurrentTime] = useState('');
    const [stats, setStats] = useState<{ activePlayers: number; gamesPlayed: number; pointsDistributed: number } | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);
    
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch aggregated mini-jeu stats from the dashboard API
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/mini-jeu/stats');
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const data = await res.json();
                setStats(data);
            } catch (e: any) {
                console.error('Erreur en récupérant les stats mini-jeu:', e);
                setStatsError('Impossible de récupérer les statistiques');
            }
        };

        fetchStats();
    }, []);

    return (
        <WithMaintenanceCheck pageId="mini-jeu">
            <div className="min-h-screen bg-background text-white relative overflow-hidden">
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <FloatingParticle key={i} delay={i * 0.5} />
                ))}
            </div>
            
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
                            className="p-4 bg-gradient-purple rounded-2xl shadow-2xl shadow-purple-primary/50"
                        >
                            <Gamepad2 className="h-12 w-12 text-white" />
                        </motion.div>
                        <h1 className="text-6xl font-extrabold bg-gradient-purple bg-clip-text text-transparent">
                            Arène NyxBot
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
                            className="p-4 bg-gradient-purple rounded-2xl shadow-2xl shadow-purple-primary/50"
                        >
                            <Trophy className="h-12 w-12 text-white" />
                        </motion.div>
                    </div>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
                    >
                        Plongez dans l'univers gaming de NyxBot. Affrontez vos amis, gagnez des récompenses exclusives et 
                        gravissez les classements dans des mini-jeux palpitants.
                    </motion.p>
                    
                    {/* Live Stats */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center justify-center gap-8 text-sm text-gray-500"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Serveur en ligne</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>24/7 disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            <span>{currentTime}</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
                    <StatsCard 
                        icon={<Users className="h-8 w-8 text-white" />}
                        title="Joueurs Actifs"
                        value={stats ? stats.activePlayers.toLocaleString('fr-FR') : (statsError ? 'Erreur' : 'Chargement...')}
                        description="Dans toutes les arènes"
                    />
                    <StatsCard 
                        icon={<Trophy className="h-8 w-8 text-white" />}
                        title="Parties Jouées"
                        value={stats ? stats.gamesPlayed.toLocaleString('fr-FR') : (statsError ? 'Erreur' : 'Chargement...')}
                        description="Total de kints joués"
                    />
                    <StatsCard 
                        icon={<Coins className="h-8 w-8 text-white" />}
                        title="Points Distribués"
                        value={stats ? stats.pointsDistributed.toLocaleString('fr-FR') : (statsError ? 'Erreur' : 'Chargement...')}
                        description="En récompenses"
                    />
                </div>

                {/* Games Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center text-white mb-12 flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-purple-primary" />
                        Choisissez Votre Défi
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <GameCard 
                            href="/dashboard/mini-jeu/kint"
                            icon={<Swords />}
                            title="KINT Arena"
                            description="Déclarez vos victoires, assumez vos défaites, et grimpez dans le classement de l'arène pour devenir légende."
                            isAvailable={true}
                            players={stats ? `${stats.activePlayers.toLocaleString('fr-FR')} en ligne` : (statsError ? 'N/A' : '- en ligne')}
                            rewards="0-100 Points"
                            difficulty="Moyen"
                            isPopular={true}
                        />
                         <GameCard
                            href="/dashboard/mini-jeu/casino-vip"
                            icon={<Coins />}
                            title="Casino VIP"
                            description="Accédez au carré VIP et découvrez une collection exclusive de jeux de casino de luxe. Sensations fortes garanties !"
                            isAvailable={true}
                            rewards="Multiplicateur de Points"
                            difficulty="Facile"
                        />
                        
                        <GameCard 
                            href="/dashboard/mini-jeu/gacha"
                            icon={<Gift />}
                            title="Anime Gacha"
                            description="Collectionnez des cartes d'anime rares ! Tirez votre chance et complétez votre collection de personnages légendaires."
                            isAvailable={true}
                            rewards="Cartes Exclusives"
                            difficulty="Facile"
                        />
                        
                        <GameCard 
                            href="/dashboard/mini-jeu/1v1"
                            icon={<Target />}
                            title="Duels 1v1"
                            description="Défiez directement un adversaire dans des combats intenses. Modes variés, récompenses exclusives et classements personnalisés vous attendent."
                            isAvailable={false}
                            players="Bientôt"
                            rewards="100-1000 Pièces"
                            difficulty="Difficile"
                        />
                    </div>
                </motion.div>

                {/* Coming Soon Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-20 text-center"
                >
                    <NyxCard delay={0}>
                        <div className="p-8 text-center">
                            <Crown className="h-12 w-12 mx-auto mb-4 text-purple-primary" />
                            <h3 className="text-2xl font-bold text-white mb-3">Plus de Jeux à Venir</h3>
                            <p className="text-gray-400 mb-6">
                                Nous préparons de nouveaux défis passionnants. Poker, quiz, jeux de rôle et bien plus encore !
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    <span>Tournois planifiés</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Récompenses améliorées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span>Nouveaux classements</span>
                                </div>
                            </div>
                        </div>
                    </NyxCard>
                </motion.div>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}

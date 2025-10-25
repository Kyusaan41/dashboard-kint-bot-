'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, Coins, Zap, Crown, Award, Medal, Loader2, RefreshCw, Trophy, 
    Sparkles, TrendingUp, Users, Gift
} from 'lucide-react';
import { getXPLeaderboard, getCurrencyLeaderboard, getPointsLeaderboard } from '@/utils/api';
import { NyxCard } from '@/components/ui/NyxCard';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';

// --- Types (inchangÃ©s) ---
type LeaderboardEntry = {
    userId: string;
    username?: string;
    avatar?: string;
    xp?: number;
    balance?: number;
    points?: number;
};
type LeaderboardData = {
    xp: LeaderboardEntry[];
    currency: LeaderboardEntry[];
    points: LeaderboardEntry[];
};

// --- COMPOSANTS MIS Ã€ JOUR ---

const PodiumCard = ({ entry, rank, icon: Icon }: { entry: LeaderboardEntry, rank: number, icon: React.ElementType }) => {
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;
    const rankConfig = {
        1: { 
            border: 'border-yellow-400/50', 
            bg: 'bg-gradient-to-br from-yellow-400/20 via-yellow-500/10 to-amber-600/20', 
            text: 'text-yellow-400', 
            height: 'h-72', 
            y: 0, 
            icon: Crown, 
            glowColor: 'rgba(255, 223, 0, 0.25)',
            shadow: 'shadow-2xl shadow-yellow-400/40',
            avatarBorder: 'border-yellow-400',
            iconBg: 'bg-yellow-400/20'
        },
        2: { 
            border: 'border-gray-300/50', 
            bg: 'bg-gradient-to-br from-gray-300/20 via-gray-400/10 to-gray-500/20', 
            text: 'text-gray-300', 
            height: 'h-64', 
            y: '2rem', 
            icon: Award, 
            glowColor: 'rgba(209, 213, 219, 0.2)',
            shadow: 'shadow-xl shadow-gray-300/30',
            avatarBorder: 'border-gray-300',
            iconBg: 'bg-gray-300/20'
        },
        3: { 
            border: 'border-orange-400/50', 
            bg: 'bg-gradient-to-br from-orange-400/20 via-amber-500/10 to-orange-600/20', 
            text: 'text-orange-400', 
            height: 'h-60', 
            y: '3rem', 
            icon: Medal, 
            glowColor: 'rgba(251, 146, 60, 0.2)',
            shadow: 'shadow-xl shadow-orange-400/30',
            avatarBorder: 'border-orange-400',
            iconBg: 'bg-orange-400/20'
        },
    };
    const config = rankConfig[rank as keyof typeof rankConfig];

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.8, 
                delay: (4 - rank) * 0.15, 
                type: 'spring', 
                stiffness: 100,
                damping: 15
            }}
            className="relative flex flex-col items-center justify-end group"
            style={{ marginTop: config.y }}
        >
            {/* Crown/Award Icon */}
            <motion.div 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: (4 - rank) * 0.2 + 0.5, type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 rounded-2xl ${config.iconBg} ${config.border} border-2 flex items-center justify-center mb-4 ${config.shadow} z-20`}
            >
                <config.icon className={`${config.text}`} size={28} />
            </motion.div>
            
            {/* Avatar */}
            <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: (4 - rank) * 0.2 + 0.3, type: 'spring', stiffness: 150 }}
                className="relative z-20 mb-6"
            >
                <div className={`p-1 rounded-full bg-gradient-to-br from-card-dark to-background border-4 ${config.avatarBorder} ${config.shadow}`}>
                    <Image 
                        src={entry.avatar || '/default-avatar.png'} 
                        alt={entry.username || 'avatar'} 
                        width={96} 
                        height={96} 
                        className="rounded-full"
                    />
                </div>
                {/* Rank Badge */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${config.bg} ${config.border} border-2 flex items-center justify-center font-bold ${config.text} text-sm z-30`}>
                    #{rank}
                </div>
            </motion.div>
            
            {/* Podium Card */}
            <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: (4 - rank) * 0.2, duration: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "bottom" }}
                className={`relative flex flex-col items-center justify-end p-6 pt-16 ${config.height} w-full rounded-t-2xl ${config.bg} ${config.border} border-2 border-b-0 backdrop-blur-sm ${config.shadow} group-hover:scale-105 transition-transform duration-300`}
            >
                {/* Username */}
                <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (4 - rank) * 0.2 + 0.8 }}
                    className="font-bold text-xl text-white truncate max-w-full mb-2"
                >
                    {entry.username || 'Inconnu'}
                </motion.h3>
                
                {/* Value */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (4 - rank) * 0.2 + 1 }}
                    className="flex items-center justify-center gap-3 text-3xl font-bold mt-2"
                >
                    <Icon size={20} className={config.text} />
                    <span className={config.text}>{value.toLocaleString()}</span>
                </motion.div>
                
                {/* Podium Base Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-primary/10 to-transparent rounded-t-2xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-purple opacity-50 blur-sm" />
            </motion.div>
            
             {/* Glow Effect */}
            <div
                className="absolute bottom-0 w-[250%] h-72 opacity-60 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 100%, ${config.glowColor} 0%, transparent 70%)` }}
            />
            
            {/* Particles Effect for 1st Place */}
            {rank === 1 && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ 
                                opacity: [0, 1, 0], 
                                scale: [0, 1, 0.5], 
                                y: [-20, -60, -100],
                                x: [0, Math.random() * 40 - 20]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut"
                            }}
                            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            style={{
                                left: `${20 + i * 10}%`,
                                top: '20%'
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const LeaderboardRow = ({ entry, rank, sessionUserId, icon: Icon }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string, icon: React.ElementType }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
                duration: 0.6, 
                delay: (rank - 4) * 0.05, 
                type: 'spring', 
                stiffness: 100 
            }}
            whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={`
                relative flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 border group
                ${
                    isCurrentUser 
                        ? 'bg-purple-primary/20 border-purple-primary shadow-purple border-2' 
                        : 'bg-card-dark/50 border-gray-700/50 hover:border-purple-primary/50 hover:bg-purple-primary/10'
                }
            `}
        >
            {/* Current User Glow Effect */}
            {isCurrentUser && (
                <div className="absolute inset-0 bg-gradient-purple opacity-5 rounded-xl" />
            )}
            
            {/* Rank Number */}
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (rank - 4) * 0.05 + 0.2, type: 'spring' }}
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 flex-shrink-0
                    ${
                        isCurrentUser 
                            ? 'bg-purple-primary/30 border-purple-primary text-purple-secondary'
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-400 group-hover:border-purple-primary/50 group-hover:text-purple-secondary'
                    }
                `}
            >
                #{rank}
            </motion.div>
            
            {/* Avatar */}
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (rank - 4) * 0.05 + 0.3, type: 'spring' }}
                className="relative flex-shrink-0"
            >
                <div className={`
                    p-1 rounded-full border-2 bg-gradient-to-br from-card-dark to-background
                    ${
                        isCurrentUser 
                            ? 'border-purple-primary shadow-purple' 
                            : 'border-gray-600/50 group-hover:border-purple-primary/50'
                    }
                `}>
                    <Image 
                        src={entry.avatar || '/default-avatar.png'} 
                        alt={entry.username || 'avatar'} 
                        width={48} 
                        height={48} 
                        className="rounded-full"
                    />
                </div>
                
                {/* Online Status for Current User */}
                {isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-card-dark" />
                )}
            </motion.div>
            
            {/* Username */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (rank - 4) * 0.05 + 0.4 }}
                className="flex-1 min-w-0"
            >
                <h3 className={`
                    font-bold text-lg truncate
                    ${
                        isCurrentUser 
                            ? 'text-white' 
                            : 'text-white group-hover:text-purple-secondary'
                    }
                `}>
                    {entry.username || 'Utilisateur Inconnu'}
                    {isCurrentUser && (
                        <span className="ml-2 text-xs bg-purple-primary/20 text-purple-secondary px-2 py-1 rounded-lg">
                            Vous
                        </span>
                    )}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                    #{entry.userId.slice(-8)}
                </p>
            </motion.div>
            
            {/* Score */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rank - 4) * 0.05 + 0.5, type: 'spring' }}
                className={`
                    flex items-center gap-3 px-4 py-2 rounded-xl border flex-shrink-0
                    ${
                        isCurrentUser 
                            ? 'bg-purple-primary/20 border-purple-primary/50 text-purple-secondary' 
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 group-hover:border-purple-primary/50 group-hover:text-purple-secondary'
                    }
                `}
            >
                <Icon size={18} className={isCurrentUser ? 'text-purple-primary' : 'text-gray-400 group-hover:text-purple-primary'} />
                <span className="font-bold text-xl">{value.toLocaleString()}</span>
            </motion.div>
            
            {/* Trend Indicator */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (rank - 4) * 0.05 + 0.6 }}
                className="flex-shrink-0"
            >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function ClassementPage() {
    const { data: session, status } = useSession();
    const [leaderboards, setLeaderboards] = useState<LeaderboardData | null>(null);
    const [activeTab, setActiveTab] = useState<'xp' | 'currency' | 'points'>('xp');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const [xpData, currencyData, pointsData] = await Promise.all([
                getXPLeaderboard(), getCurrencyLeaderboard(), getPointsLeaderboard()
            ]);
            setLeaderboards({ xp: xpData, currency: currencyData, points: pointsData });
        } catch (err) {
            setError("Impossible de charger les classements. Veuillez rÃ©essayer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (status === 'authenticated') fetchData(); }, [status]);

    const tabs = [
        { id: 'xp', label: 'Expérience', icon: Star, color: 'text-blue-400', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/50' },
        { id: 'currency', label: 'Pièces', icon: Coins, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/50' },
        { id: 'points', label: 'Points NyxBot', icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-400/20', borderColor: 'border-purple-400/50' },
    ];

    const currentLeaderboard = leaderboards ? leaderboards[activeTab] : [];
    const topThree = currentLeaderboard.slice(0, 3);
    const restOfLeaderboard = currentLeaderboard.slice(3);
    const activeIcon = tabs.find(t => t.id === activeTab)?.icon || Star;
    const activeTabData = tabs.find(t => t.id === activeTab);
    
    if (loading || status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <Loader2 className="animate-spin h-12 w-12 text-purple-primary" />
                        <div className="absolute inset-0 animate-ping h-12 w-12 rounded-full bg-purple-primary/20" />
                    </div>
                    <p className="text-gray-400 font-medium">Chargement des classements...</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Trophy className="h-4 w-4" />
                        <span>Analyse des performances en cours</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <NyxCard delay={0}>
                    <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Erreur de Chargement</h2>
                        <p className="text-red-400 mb-6">{error}</p>
                        <motion.button 
                            onClick={fetchData} 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-nyx-primary flex items-center gap-3 mx-auto"
                        >
                            <RefreshCw className="h-5 w-5" /> 
                            Réessayer
                        </motion.button>
                    </div>
                </NyxCard>
            </div>
        );
    }

    return (
        <WithMaintenanceCheck pageId="classement">
            <div className="min-h-screen bg-background text-white">
                <div className="px-8 py-6 space-y-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold bg-gradient-purple bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
                        <div className="p-4 bg-gradient-purple rounded-2xl">
                            <Trophy className="h-10 w-10 text-white" />
                        </div>
                        Classements NyxBot
                    </h1>
                    <p className="text-gray-400 text-lg">Comparez vos performances avec les autres membres du serveur</p>
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{currentLeaderboard.length} joueurs actifs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>Mis à jour en temps réel</span>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card-dark/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50"
                >
                    <div className="grid grid-cols-3 gap-2 relative">
                        {tabs.map((tab, index) => (
                            <motion.button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id as any)} 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    relative flex items-center justify-center gap-3 px-6 py-4 font-bold rounded-xl transition-all duration-300 z-10
                                    ${
                                        activeTab === tab.id 
                                            ? `${tab.bgColor} ${tab.color} border-2 ${tab.borderColor}` 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                                    }
                                `}
                            >
                                <tab.icon size={20} /> 
                                <span className="text-sm font-semibold">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/10 to-transparent rounded-xl" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Leaderboard Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="space-y-12"
                    >
                        {/* Podium Section */}
                        {topThree.length >= 1 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="relative"
                            >
                                {/* Podium Background */}
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-primary/5 to-transparent rounded-3xl" />
                                <div className="relative grid grid-cols-3 gap-6 items-end pt-16 pb-8 px-6">
                                    {topThree[1] && <PodiumCard entry={topThree[1]} rank={2} icon={activeIcon} />}
                                    {topThree[0] && <PodiumCard entry={topThree[0]} rank={1} icon={activeIcon} />}
                                    {topThree[2] && <PodiumCard entry={topThree[2]} rank={3} icon={activeIcon} />}
                                </div>
                                
                                {/* Podium Statistics */}
                                {activeTabData && topThree[0] && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 }}
                                        className="text-center mt-8 p-6 bg-card-dark/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
                                    >
                                        <p className="text-gray-400 text-sm mb-2">Champion actuel en {activeTabData.label}</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <activeTabData.icon className={activeTabData.color} size={20} />
                                            <span className="text-2xl font-bold text-white">
                                                {(topThree[0].xp ?? topThree[0].balance ?? topThree[0].points ?? 0).toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-400">points</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Rankings List */}
                        {restOfLeaderboard.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-primary/20 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-purple-primary" />
                                    </div>
                                    Classement complet
                                    <div className="ml-auto px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-lg">
                                        {restOfLeaderboard.length} autres joueurs
                                    </div>
                                </h2>
                                <div className="space-y-3">
                                    {restOfLeaderboard.map((entry, index) => (
                                        <LeaderboardRow 
                                            key={entry.userId} 
                                            entry={entry} 
                                            rank={index + 4}
                                            sessionUserId={session?.user?.id}
                                            icon={activeIcon}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Empty State */}
                        {currentLeaderboard.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center py-20"
                            >
                                <NyxCard delay={0}>
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                                            <Trophy className="h-10 w-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Aucune donnée</h3>
                                        <p className="text-gray-400 mb-6">
                                            Aucune donnée disponible pour ce classement.
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                            {activeTabData && <activeTabData.icon className="h-4 w-4" />}
                                            <span>Les statistiques apparaîtront dès que les joueurs seront actifs</span>
                                        </div>
                                    </div>
                                </NyxCard>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}

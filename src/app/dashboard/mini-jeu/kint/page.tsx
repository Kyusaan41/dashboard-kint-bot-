'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints, getInventory, sendKintLogToDiscord, getDetailedKintLogs, getActiveEffects } from '@/utils/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Crown, Shield, Loader2, Trophy, History, Swords, Award, Medal, CheckCircle, BarChart2, X, Target, FlameKindling, User } from 'lucide-react';
import { NyxCard } from '@/components/ui/NyxCard';


// --- Fonctions API (inchangÃ©es) ---
async function fetchKintLeaderboard() {
    const response = await fetch(`/api/kint-stats/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch KINT leaderboard');
    return response.json();
}

async function updateKintStats(userId: string, responseType: 'oui' | 'non') {
    const response = await fetch(`/api/kint-stats/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseType }),
    });
    if (!response.ok) throw new Error('Failed to update KINT stats');
    return response.json();
}

// --- Types (inchangÃ©s) ---
type LeaderboardEntry = { userId: string; points: number; username?: string; avatar?: string; };
type HistoryEntry = { userId: string; username: string; avatar?: string; actionType: 'GAGNÉ' | 'PERDU'; points: number; currentBalance: number; effect?: string; date: string; reason: string; source: 'Discord' | 'Dashboard'; };
type InventoryItem = { id: string; name: string; quantity: number; };
type Notification = { show: boolean; message: string; type: 'success' | 'error' };
type KintStatEntry = { userId: string; username: string; avatar: string; total: number; oui: number; non: number; lossRate: number; };
type UserEffect = {
    type: string;
    expiresAt: string;
} | null;

// --- MODERN NYXBOT UI COMPONENTS ---

const StatCard = ({ icon, title, value, subtitle, delay = 0 }: { icon: React.ReactNode; title: string; value: string | number; subtitle?: string; delay?: number }) => (
    <NyxCard delay={delay} className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-purple opacity-5 rounded-full blur-2xl" />
        <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                    <p className="text-sm text-purple-secondary">{title}</p>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
            </div>
        </div>
    </NyxCard>
);

const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry, rank: number }) => {
    const rankConfig = {
        1: {
            border: 'border-yellow-400/50',
            bg: 'bg-gradient-to-br from-yellow-400/20 via-yellow-500/10 to-amber-600/20',
            text: 'text-yellow-400',
            height: 'h-80',
            icon: Crown,
            shadow: 'shadow-2xl shadow-yellow-400/40',
            avatarBorder: 'border-yellow-400',
            iconBg: 'bg-yellow-400/20'
        },
        2: {
            border: 'border-gray-300/50',
            bg: 'bg-gradient-to-br from-gray-300/20 via-gray-400/10 to-gray-500/20',
            text: 'text-gray-300',
            height: 'h-72',
            icon: Award,
            shadow: 'shadow-xl shadow-gray-300/30',
            avatarBorder: 'border-gray-300',
            iconBg: 'bg-gray-300/20'
        },
        3: {
            border: 'border-orange-400/50',
            bg: 'bg-gradient-to-br from-orange-400/20 via-amber-500/10 to-orange-600/20',
            text: 'text-orange-400',
            height: 'h-68',
            icon: Medal,
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
        >
            {/* Rank Icon */}
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
                <div className={`p-1 rounded-full bg-gradient-to-br from-bg-primary to-bg-secondary border-4 ${config.avatarBorder} ${config.shadow}`}>
                    <Image
                        src={entry.avatar || '/default-avatar.png'}
                        alt={entry.username || 'avatar'}
                        width={96}
                        height={96}
                        className="rounded-full"
                    />
                </div>
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
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (4 - rank) * 0.2 + 0.8 }}
                    className="font-bold text-xl text-white truncate max-w-full mb-2"
                >
                    {entry.username || 'Inconnu'}
                </motion.h3>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (4 - rank) * 0.2 + 1 }}
                    className="flex items-center justify-center gap-3 text-3xl font-bold mt-2"
                >
                    <Zap size={20} className={config.text} />
                    <span className={config.text}>{entry.points?.toLocaleString() || 0}</span>
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-purple-primary/10 to-transparent rounded-t-2xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-purple opacity-50 blur-sm" />
            </motion.div>
        </motion.div>
    );
};

const LeaderboardRow = ({ entry, rank, sessionUserId }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    
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
            {isCurrentUser && (
                <div className="absolute inset-0 bg-gradient-purple opacity-5 rounded-xl" />
            )}
            
            <div className="w-8 text-center font-bold text-purple-secondary">
                #{rank}
            </div>
            
            <div className="relative">
                <Image
                    src={entry.avatar || '/default-avatar.png'}
                    alt={entry.username || 'avatar'}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-purple-primary/30"
                />
                {isCurrentUser && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-primary rounded-full border-2 border-bg-primary flex items-center justify-center">
                        <User size={8} className="text-white" />
                    </div>
                )}
            </div>
            
            <span className="font-medium text-white flex-1 truncate">
                {entry.username || 'Inconnu'}
            </span>
            
            <div className="flex items-center gap-2 font-bold text-purple-secondary">
                <Zap size={16} className="text-yellow-400" />
                <span>{entry.points?.toLocaleString() || 0}</span>
            </div>
        </motion.div>
    );
};

const HistoryItem = ({ item }: { item: HistoryEntry }) => {
    const formattedDate = new Date(item.date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const isKShieldLog = item.reason === 'Protégé par KShield';
    const isGain = item.actionType === 'GAGNÉ';
    
    const Icon = isKShieldLog ? Shield : (isGain ? TrendingUp : TrendingDown);
    const iconColor = isKShieldLog ? 'text-blue-400' : (isGain ? 'text-green-400' : 'text-red-400');
    const textColor = isKShieldLog ? 'text-blue-300' : (isGain ? 'text-green-400' : 'text-red-400');
    const bgColor = isKShieldLog ? 'bg-blue-500/10' : (isGain ? 'bg-green-500/10' : 'bg-red-500/10');
    const actionSign = isGain ? '+' : '-';
    const logText = isKShieldLog ? `a perdu ${item.points} pts` : `a ${item.actionType.toLowerCase()} ${actionSign}${item.points} pts`;
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border border-purple-primary/20 ${bgColor} hover:bg-purple-primary/5 transition-all duration-300`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{formattedDate}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    item.source === 'Discord' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                    {item.source === 'Discord' ? '🎮 Discord' : '🌐 Dashboard'}
                </span>
            </div>
            
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${iconColor.replace('text-', 'bg-').replace('-400', '-400/20')} flex items-center justify-center`}>
                    <Icon size={16} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                        {item.username} <span className={textColor}>{logText}</span>
                    </p>
                    <p className="text-sm text-gray-400">({item.reason})</p>
                    {item.effect && item.effect !== "Aucun effet" && (
                        <p className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                            <FlameKindling size={12} /> Effet: {item.effect}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};


export default function KintMiniGamePage() {
    const { data: session, status } = useSession();
    // ... (toute la logique et les Ã©tats restent les mÃªmes)
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>('');
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [kintLeaderboard, setKintLeaderboard] = useState<KintStatEntry[]>([]);
    const [mostGuez, setMostGuez] = useState<KintStatEntry | null>(null);
    const [activeEffect, setActiveEffect] = useState<UserEffect>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    const fetchData = async () => {
        if (!session?.user?.id) return;
        try {
            const [leaderboardData, pointsData, detailedHistoryData, inventoryData, kintBoardData, effectsData] = await Promise.all([
                getPointsLeaderboard(),
                fetchPoints(session.user.id),
                getDetailedKintLogs(),
                getInventory(),
                fetchKintLeaderboard(),
                getActiveEffects(session.user.id),
            ]);
            const membersMap = new Map<string, { username?: string; avatar?: string; }>(leaderboardData.map((p: LeaderboardEntry) => [p.userId, { username: p.username, avatar: p.avatar }]));
            const enrichedHistory = detailedHistoryData.map((log: HistoryEntry) => ({...log, username: membersMap.get(log.userId)?.username || log.username, avatar: membersMap.get(log.userId)?.avatar || log.avatar,})).filter((log: HistoryEntry) => log.userId === session.user.id);
            setLeaderboard(leaderboardData);
            setUserPoints(pointsData.points);
            setInventory(inventoryData);
            setHistory(enrichedHistory);
            setKintLeaderboard(kintBoardData.leaderboard);
            setMostGuez(kintBoardData.mostGuez);
            setActiveEffect(effectsData.effect);
        } catch (error) {
            console.error("Erreur de chargement des donnÃ©es du jeu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            setLoading(true);
            fetchData();
            const intervalId = setInterval(fetchData, 15000);
            return () => clearInterval(intervalId);
        }
    }, [status, session]);

    const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
        if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount)) || !session?.user?.id || !session.user.name || !session.user.image) {
            showNotification("Veuillez entrer un nombre de points valide.", "error");
            return;
        }

        setIsSubmitting(true);
        let amount = Number(manualPointsAmount);
        let effectType = "Aucun effet";

        if (actionType === 'add' && activeEffect && activeEffect.type === 'epee-du-kint' && new Date(activeEffect.expiresAt).getTime() > Date.now()) {
            amount *= 2;
            effectType = 'Ã‰pÃ©e du KINT âš”ï¸';
        }

        const pointsToModify = actionType === 'add' ? amount : -amount;
        const actionText = actionType === 'add' ? 'GAGNÉ' : 'PERDU';
        const reasonText = actionType === 'add' ? 'Victoire Dashboard' : 'DÃ©faite Dashboard';
        const statsUpdateType = actionType === 'add' ? 'non' : 'oui';
        const source = "Dashboard";

        try {
            await updatePoints(session.user.id, pointsToModify, source);
            await updateKintStats(session.user.id, statsUpdateType);
            const updatedPointsData = await fetchPoints(session.user.id);
            const newCurrentBalance = updatedPointsData.points;

            // Ajouter des points au Season Pass (montant/2) si c'est une victoire
            if (actionType === 'add') {
                const seasonPassPoints = Math.floor(Number(manualPointsAmount) / 2);
                if (seasonPassPoints > 0) {
                    await fetch('/api/season-pass', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'add_points',
                            amount: seasonPassPoints,
                            source: 'kint_victory'
                        })
                    });
                }
            }

            await sendKintLogToDiscord({
                userId: session.user.id, username: session.user.name,
                avatar: session.user.image, actionType: actionText,
                points: Number(manualPointsAmount),
                currentBalance: newCurrentBalance,
                effect: effectType,
                date: new Date().toISOString(),
                source: source, reason: reasonText
            });
            await fetchData();
            showNotification("Votre KINT a bien Ã©tÃ© pris en compte !");
        } catch (error) {
            showNotification(`Ã‰chec de la mise Ã  jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        } finally {
            setManualPointsAmount('');
            setIsSubmitting(false);
        }
    };

    if (loading || status === 'loading') {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    }

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);
    const isSwordActive = activeEffect && activeEffect.type === 'epee-du-kint' && new Date(activeEffect.expiresAt).getTime() > Date.now();

    return (
        <div className="space-y-8">
            {/* Notifications */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-xl ${
                            notification.type === 'success'
                                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                                : 'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}
                    >
                        <CheckCircle size={20} />
                        <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
                
                {/* KINT Stats Modal */}
                {isStatsModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsStatsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="nyx-card w-full max-w-4xl shadow-2xl max-h-[80vh] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-purple-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                                        <BarChart2 size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">🏆 Statistiques KINT</h2>
                                        <p className="text-sm text-gray-400">Classement des performances</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => setIsStatsModalOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50">
                                {kintLeaderboard.map((user, index) => (
                                    <motion.div
                                        key={user.userId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-4 bg-purple-primary/5 rounded-xl border border-purple-primary/20 hover:bg-purple-primary/10 transition-all duration-300"
                                    >
                                        <div className="w-8 text-center font-bold text-purple-secondary">
                                            #{index + 1}
                                        </div>
                                        <Image
                                            src={user.avatar}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="rounded-full border-2 border-purple-primary/30"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate">{user.username}</p>
                                            <p className="text-xs text-gray-400">Total: {user.total} parties</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-green-400 font-bold">✅ {user.non}</p>
                                                <p className="text-xs text-gray-400">Victoires</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-red-400 font-bold">❌ {user.oui}</p>
                                                <p className="text-xs text-gray-400">Défaites</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-yellow-400 font-bold">{user.lossRate.toFixed(1)}%</p>
                                                <p className="text-xs text-gray-400">Taux d'échec</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {mostGuez && (
                                <div className="p-6 border-t border-purple-primary/20">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center"
                                    >
                                        <h3 className="font-bold text-orange-400 mb-2 flex items-center justify-center gap-2">
                                            💩 Mention spéciale
                                        </h3>
                                        <p className="text-gray-300">
                                            <strong className="text-white">{mostGuez.username}</strong> détient le record
                                            avec <strong className="text-red-400">{mostGuez.lossRate.toFixed(1)}%</strong> de défaites !
                                        </p>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden"
            >
                <NyxCard className="relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-purple opacity-5 rounded-full blur-3xl" />
                    <div className="relative flex items-center justify-between p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center">
                                <Swords size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gradient-purple">Arène KINT</h1>
                                <p className="text-gray-400 mt-2 text-lg">Déclarez vos victoires, affrontez le classement</p>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => setIsStatsModalOpen(true)}
                            className="btn-nyx-secondary flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <BarChart2 size={18} />
                            <span className="hidden sm:inline">Statistiques</span>
                        </motion.button>
                    </div>
                </NyxCard>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Target size={24} className="text-white" />}
                    title="Score Actuel"
                    value={userPoints ?? '...'}
                    subtitle="Points KINT"
                    delay={0.1}
                />
                <StatCard
                    icon={<Shield size={24} className="text-white" />}
                    title="KShields"
                    value={inventory.find(i => i.id === 'KShield')?.quantity || 0}
                    subtitle="Protection disponible"
                    delay={0.2}
                />
                <StatCard
                    icon={<History size={24} className="text-white" />}
                    title="Parties Récentes"
                    value={history.length}
                    subtitle="Cette session"
                    delay={0.3}
                />
            </div>

            {/* Podium */}
            {topThree.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">🏆 Podium des Champions</h2>
                        <p className="text-gray-400">Les maîtres de l'arène KINT</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                        {topThree[1] && <PodiumCard entry={topThree[1]} rank={2} />}
                        {topThree[0] && <PodiumCard entry={topThree[0]} rank={1} />}
                        {topThree[2] && <PodiumCard entry={topThree[2]} rank={3} />}
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Panel */}
                <div className="lg:col-span-1">
                    <NyxCard delay={0.6} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-purple opacity-10 rounded-full blur-2xl" />
                        <div className="relative p-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <Image
                                        src={session?.user?.image || '/default-avatar.png'}
                                        alt="avatar"
                                        width={64}
                                        height={64}
                                        className="rounded-full border-4 border-purple-primary/50"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-bg-primary flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{session?.user?.name}</h2>
                                    <p className="text-sm text-gray-400">Gladiateur KINT</p>
                                </div>
                            </div>

                            {/* Current Score */}
                            <div className="text-center mb-6 p-6 bg-purple-primary/10 rounded-xl border border-purple-primary/20">
                                <p className="text-sm text-gray-400 mb-2">Score Actuel</p>
                                <div className="flex items-center justify-center gap-3">
                                    <Zap size={24} className="text-yellow-400" />
                                    <span className="text-5xl font-bold text-gradient-purple">
                                        {userPoints ?? '...'}
                                    </span>
                                </div>
                                
                                {isSwordActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-4 flex items-center justify-center gap-2 text-yellow-400 font-semibold bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/30"
                                    >
                                        <Swords size={16} />
                                        <span>Épée du KINT Active - Points x2 !</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Action Panel */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Target size={18} className="text-purple-secondary" />
                                    Déclarer un résultat
                                </h3>
                                
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Nombre de points"
                                        value={manualPointsAmount}
                                        onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-bg-secondary border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-primary focus:ring-1 focus:ring-purple-primary transition-colors"
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            onClick={() => handleManualPointsAction('add')}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                                            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        >
                                            <TrendingUp size={18} />
                                            Victoire
                                        </motion.button>
                                        
                                        <motion.button
                                            onClick={() => handleManualPointsAction('subtract')}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                                            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        >
                                            <TrendingDown size={18} />
                                            Défaite
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NyxCard>
                </div>

                {/* History & Leaderboard */}
                <div className="lg:col-span-2 space-y-8">
                    {/* History */}
                    <NyxCard delay={0.7}>
                        <div className="flex items-center gap-3 mb-6 p-6 pb-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                                <History size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Historique des Parties</h2>
                                <p className="text-sm text-gray-400">Vos dernières performances</p>
                            </div>
                            <div className="ml-auto px-3 py-1 bg-purple-primary/20 text-purple-secondary text-xs rounded-lg">
                                {history.length} entrées
                            </div>
                        </div>
                        
                        <div className="px-6 pb-6">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50">
                                <AnimatePresence>
                                    {history.length > 0 ? (
                                        history.map((item, index) => (
                                            <HistoryItem
                                                key={`${item.userId}-${item.date}-${index}`}
                                                item={item}
                                            />
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <History size={32} className="text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Aucune partie récente</p>
                                            <p className="text-gray-600 text-sm mt-1">Déclarez votre première victoire !</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </NyxCard>

                    {/* Leaderboard */}
                    <NyxCard delay={0.8}>
                        <div className="flex items-center gap-3 mb-6 p-6 pb-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                                <Trophy size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Classement de l'Arène</h2>
                                <p className="text-sm text-gray-400">Combattants suivants</p>
                            </div>
                        </div>
                        
                        <div className="px-6 pb-6">
                            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50">
                                {restOfLeaderboard.length > 0 ? (
                                    restOfLeaderboard.map((player, index) => (
                                        <LeaderboardRow
                                            key={player.userId}
                                            entry={player}
                                            rank={index + 4}
                                            sessionUserId={session?.user?.id}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                                            <Trophy size={32} className="text-gray-500" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Classement en cours de formation</p>
                                        <p className="text-gray-600 text-sm mt-1">Soyez parmi les premiers à vous distinguer !</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </NyxCard>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState, FC, ReactNode } from 'react';
import Image from 'next/image';
import { useHasMounted } from '@/hooks/useHasMounted';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getInventory, getAllAchievements, fetchGazette } from '@/utils/api';
import {
    Coins, Gift, Loader2, Package, Star, Zap, Trophy,
    BookOpen, Crown, Gem, CheckCircle, Newspaper, 
    Bot, TrendingUp, Activity, Users, Shield, Sparkles, Settings
} from 'lucide-react';
import { FavoritesBar } from '@/components/FavoritesBar';
import { NyxCard } from '@/components/ui/NyxCard';
import { ThemeSelector } from '@/components/ThemeSelector';

// --- Types (inchangÃ©s) ---
type UserStats = {
    currency: number; currencyRank: number | null;
    xp: number; xpRank: number | null;
    points: number; pointsRank: number | null;
    equippedTitle: string | null;
};
type PatchNote = { title: string; ajouts: string[]; ajustements: string[]; };
type KintHistoryData = { day: string; points: number; };
type HistoryEntry = {
    actionType: 'GAGNÉ' | 'PERDU';
    points: number;
    date: string;
    reason: string;
    effect?: string;
};
type ServerInfo = { id: string; name: string; icon: string | null; };
type InventoryItem = { id: string; name: string; quantity: number; icon?: string; };
type AllAchievements = { [key: string]: { name: string; description: string; } };
type Notification = { show: boolean; message: string; type: 'success' | 'error' };
type Article = {
    id: string;
    timestamp: string;
    title: string;
    content: string;
    type: 'community' | 'economy' | 'kint';
    icon: string;
};

// --- NYXBOT COMPONENTS ---

const SectionHeader: FC<{ icon: ReactNode; title: string; badgeText?: string; badgeClassName?: string }>
  = ({ icon, title, badgeText, badgeClassName }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center"
             style={{
               background: 'var(--theme-gradient)',
               boxShadow: '0 0 10px var(--theme-primary)30'
             }}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white" style={{ color: 'var(--theme-text)' }}>{title}</h3>
        {badgeText && (
            <div className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium ${badgeClassName || 'bg-purple-primary/20 text-purple-secondary'}`}
                 style={{
                   backgroundColor: 'var(--theme-primary)20',
                   color: 'var(--theme-secondary)'
                 }}>
                {badgeText}
            </div>
        )}
    </div>
);

const StatCard: FC<{
    icon: ReactNode;
    title: string;
    value: number;
    rank: number | null;
    trend?: number;
    delay?: number;
}> = ({ icon, title, value, rank, trend, delay = 0 }) => {
    const formatRank = (r: number | null) => {
        if (!r) return <span className="text-gray-500" style={{ color: 'var(--theme-text-secondary)' }}>(Non classe)</span>;
        const rankColor = r <= 3 ? "var(--theme-secondary)" : "var(--theme-text-secondary)";
        return <span className="font-semibold" style={{ color: rankColor }}>#{r}</span>;
    };

    return (
        <NyxCard delay={delay} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"
                 style={{ background: 'var(--theme-gradient)' }}></div>
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                         style={{
                           background: 'var(--theme-gradient)',
                           boxShadow: '0 0 15px var(--theme-primary)40'
                         }}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                            trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-3xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{value.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{title}</span>
                        {formatRank(rank)}
                    </div>
                </div>
            </div>
        </NyxCard>
    );
};

const WelcomeHeader: FC<{ user: any; server: ServerInfo | null }> = ({ user, server }) => {
    const hasMounted = useHasMounted();
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        if (hasMounted) {
            const updateTime = () => {
                setTime(new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                }));
            };
            updateTime();
            const interval = setInterval(updateTime, 1000);
            return () => clearInterval(interval);
        }
    }, [hasMounted]);

    return (
        <NyxCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl"
                 style={{ background: 'var(--theme-gradient)' }}></div>
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl p-[2px]"
                             style={{
                               background: 'var(--theme-gradient)',
                               boxShadow: '0 0 20px var(--theme-primary)40'
                             }}>
                            <Image
                                src={user?.image || '/default-avatar.png'}
                                alt="Avatar"
                                width={76}
                                height={76}
                                className="rounded-[14px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 rounded-xl p-2"
                             style={{
                               background: 'var(--theme-gradient)',
                               boxShadow: '0 0 10px var(--theme-primary)60'
                             }}>
                            <Crown size={16} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
                                Salut,
                            </h1>
                            <span className="text-3xl font-bold text-gradient-purple">
                                {user?.name || 'Utilisateur'}
                            </span>
                            <motion.div
                                animate={{ rotate: [0, 20, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                👋
                            </motion.div>
                        </div>
                        <p className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
                            <Bot size={16} style={{ color: 'var(--theme-secondary)' }} />
                            NyxBot Dashboard • {server?.name || 'Serveur'}
                            {hasMounted && (
                                <span style={{ color: 'var(--theme-secondary)' }} className="ml-2">{time}</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Statut</p>
                        <div className="flex items-center gap-2 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">En ligne</span>
                        </div>
                    </div>
                </div>
            </div>
        </NyxCard>
    );
};

export default function DashboardHomePage() {
    const { data: session, status } = useSession();
    const hasMounted = useHasMounted();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [unlockedSuccesses, setUnlockedSuccesses] = useState<string[]>([]);
    const [allAchievements, setAllAchievements] = useState<AllAchievements>({});
    const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
    const [kintHistoryData, setKintHistoryData] = useState<KintHistoryData[]>([]);
    const [availableTitles, setAvailableTitles] = useState<string[]>([]);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [claimStatus, setClaimStatus] = useState({ canClaim: false, timeLeft: '00:00:00' });
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
    const [previousWeekStats, setPreviousWeekStats] = useState<{ currency: number; xp: number; points: number } | null>(null);
    const [nextClaimAt, setNextClaimAt] = useState<number | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Calculate trend percentage from current vs previous data
    const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate activity trend from the last 7 days data
    const calculateActivityTrend = (historyData: KintHistoryData[]): number => {
        if (historyData.length < 4) return 0;
        
        const firstHalf = historyData.slice(0, Math.floor(historyData.length / 2));
        const secondHalf = historyData.slice(Math.floor(historyData.length / 2));
        
        const firstHalfTotal = firstHalf.reduce((sum, entry) => sum + Math.abs(entry.points), 0);
        const secondHalfTotal = secondHalf.reduce((sum, entry) => sum + Math.abs(entry.points), 0);
        
        if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;
        return Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100);
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [statsData, successData, patchnoteData, titles, currency, server, inventoryData, allAchievementsData, kintHistoryRaw, gazetteData] = await Promise.all([
                        fetch(`/api/stats/me`).then(res => res.json()),
                        fetch(`/api/success/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/patchnote`).then(res => res.json()),
                        fetch(`/api/titres/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/currency/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/server/info`).then(res => res.json()),
                        getInventory(),
                        getAllAchievements(),
                        fetch(`/api/kint-detailed-logs?userId=${session.user.id}`).then(res => res.json()),
                        fetchGazette(),
                    ]);

                    setStats(statsData);
                    setPatchNotes(patchnoteData);
                    setArticles(gazetteData);

                    const processedKintHistory = (kintHistoryRaw as HistoryEntry[]).filter(entry => entry.reason !== 'Protégé par KShield').reduce((acc: { [key: string]: number }, entry) => {
                        const dayKey = new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                        acc[dayKey] = (acc[dayKey] || 0) + (entry.actionType === 'GAGNÉ' ? entry.points : -entry.points);
                        return acc;
                    }, {});

                    const last7DaysMap = new Map<string, number>();
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        last7DaysMap.set(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), 0);
                    }
                    for (const day in processedKintHistory) {
                        if (last7DaysMap.has(day)) last7DaysMap.set(day, processedKintHistory[day]);
                    }

                    const historyDataArray = Array.from(last7DaysMap.entries()).map(([day, points]) => ({ day, points }));
                    setKintHistoryData(historyDataArray);
                    setUnlockedSuccesses(successData.succes || []);
                    setAllAchievements(allAchievementsData || {});
                    setAvailableTitles(titles.titresPossedes || []);
                    setServerInfo(server);
                    setInventory(inventoryData || []);

                    // Simulate previous week stats for trend calculation
                    // In a real app, you would fetch historical data from your API
                    const simulatedPreviousStats = {
                        currency: Math.max(0, (statsData?.currency || 0) - Math.floor((statsData?.currency || 0) * 0.1 + Math.random() * 200)),
                        xp: Math.max(0, (statsData?.xp || 0) - Math.floor((statsData?.xp || 0) * 0.05 + Math.random() * 500)),
                        points: Math.max(0, (statsData?.points || 0) - Math.floor((statsData?.points || 0) * 0.15 + Math.random() * 100))
                    };
                    setPreviousWeekStats(simulatedPreviousStats);

                    if (currency) {
                        const now = Date.now();
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        const lastClaimTime = currency.lastBonus;
                        if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
                            const target = lastClaimTime + twentyFourHours;
                            setNextClaimAt(target);
                            const timeLeftValue = target - now;
                            const hours = Math.floor(timeLeftValue / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeftValue % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((timeLeftValue % (1000 * 60)) / 1000);
                            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            setClaimStatus({ canClaim: false, timeLeft: timeString });
                        } else {
                            setNextClaimAt(null);
                            setClaimStatus({ canClaim: true, timeLeft: '' });
                        }
                    }
                    if (statsData) setSelectedTitle(statsData.equippedTitle || '');
                } catch (error) {
                    console.error("Erreur de chargement:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [status, session]);
    
    useEffect(() => {
        if (articles.length > 1) {
            const timer = setInterval(() => {
                setCurrentArticleIndex(prevIndex => (prevIndex + 1) % articles.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [articles.length]);

    // Timer en temps réel pour la récompense quotidienne (calcul local, pas de refetch)
    useEffect(() => {
        if (!nextClaimAt) {
            return;
        }
        const interval = setInterval(() => {
            const now = Date.now();
            const timeLeftValue = nextClaimAt - now;
            if (timeLeftValue > 0) {
                const hours = Math.floor(timeLeftValue / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeftValue % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeftValue % (1000 * 60)) / 1000);
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                setClaimStatus({ canClaim: false, timeLeft: timeString });
            } else {
                setClaimStatus({ canClaim: true, timeLeft: '' });
                setNextClaimAt(null);
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [nextClaimAt]);

    const handleClaimReward = async () => {
        if (!claimStatus.canClaim || isClaiming || !session?.user?.id) return;
        setIsClaiming(true);
        try {
            const res = await fetch(`/api/currency/claim/${session.user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'bonus' }),
            });
            const data = await res.json();
            if (res.ok) {
                showNotification(data.message || "RÃ©compense rÃ©clamÃ©e !");
                setStats(prev => prev ? { ...prev, currency: data.newBalance } : null);
                const now = Date.now();
                const twentyFourHours = 24 * 60 * 60 * 1000;
                const nextClaimTime = now + twentyFourHours;
                setNextClaimAt(nextClaimTime);
                const timeLeftValue = nextClaimTime - now;
                const hours = Math.floor(timeLeftValue / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeftValue % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeftValue % (1000 * 60)) / 1000);
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                setClaimStatus({ canClaim: false, timeLeft: timeString });
            } else {
                showNotification(data.error || "Impossible de rÃ©clamer.", "error");
            }
        } catch (error) {
            showNotification("Une erreur est survenue.", "error");
        } finally {
            setIsClaiming(false);
        }
    };

    const handleEquipTitle = async () => {
        if (!selectedTitle || !session?.user?.id) return;
        try {
            await fetch(`/api/titres/${session.user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nouveauTitre: selectedTitle })
            });
            setStats(prev => prev ? { ...prev, equippedTitle: selectedTitle } : null);
            setIsTitleModalOpen(false);
            showNotification("Titre Ã©quipÃ© avec succÃ¨s!");
        } catch (error) {
            showNotification("Une erreur est survenue.", "error");
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="nyx-spinner mb-4"></div>
                    <p className="text-gray-300">NyxBot Dashboard se charge...</p>
                </div>
            </div>
        );
    }

    const totalAchievementsCount = Object.keys(allAchievements).length;

    return (
        <WithMaintenanceCheck pageId="dashboard">
        <div className="space-y-8">
            {/* Notifications */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50, scale: 0.9 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                        className={`fixed top-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl z-50 backdrop-blur-xl ${
                            notification.type === 'success' 
                                ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                                : 'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}
                    >
                        {notification.type === 'success' ? 
                            <CheckCircle size={20} /> : 
                            <Shield size={20} />
                        }
                        <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Welcome Header */}
            <WelcomeHeader user={session?.user} server={serverInfo} />

            {/* Barre de favoris */}
            <FavoritesBar />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats ? (
                    <>
                        <StatCard 
                            icon={<Coins size={24} className="text-white" />} 
                            title="Pièces" 
                            value={stats.currency} 
                            rank={stats.currencyRank}
                            trend={previousWeekStats ? calculateTrend(stats.currency, previousWeekStats.currency) : undefined}
                            delay={0}
                        />
                        <StatCard 
                            icon={<Star size={24} className="text-white" />} 
                            title="Expérience" 
                            value={stats.xp} 
                            rank={stats.xpRank}
                            trend={previousWeekStats ? calculateTrend(stats.xp, previousWeekStats.xp) : undefined}
                            delay={0.1}
                        />
                        <StatCard 
                            icon={<Zap size={24} className="text-white" />} 
                            title="Points KIP" 
                            value={stats.points} 
                            rank={stats.pointsRank}
                            trend={previousWeekStats ? calculateTrend(stats.points, previousWeekStats.points) : undefined}
                            delay={0.2}
                        />
                        <StatCard 
                            icon={<Trophy size={24} className="text-white" />} 
                            title="Succès" 
                            value={unlockedSuccesses.length} 
                            rank={null}
                            trend={unlockedSuccesses.length > 0 ? Math.floor(Math.random() * 10 + 5) : undefined}
                            delay={0.3}
                        />
                    </>
                ) : (
                    // Loading skeleton for stats cards
                    Array.from({ length: 4 }, (_, i) => (
                        <NyxCard key={i} delay={i * 0.1} className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-400 opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-700/50 animate-pulse"></div>
                                    <div className="w-12 h-6 bg-gray-700/50 rounded-lg animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="w-24 h-8 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                                    <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </NyxCard>
                    ))
                )}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Analytics */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart */}
                    <NyxCard delay={0.4} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full blur-3xl transform translate-x-8 -translate-y-8"
                             style={{ background: 'var(--theme-gradient)' }}></div>
                        <div className="relative">
                            {(() => {
                                const activityTrend = calculateActivityTrend(kintHistoryData);
                                const badge = activityTrend !== 0 ? `${activityTrend > 0 ? '+' : ''}${activityTrend}% cette semaine` : undefined;
                                const badgeClass = activityTrend > 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
                                return (
                                    <SectionHeader
                                        icon={<Activity size={18} className="text-white" />}
                                        title="Activité NyxBot (7 derniers jours)"
                                        badgeText={badge}
                                        badgeClassName={badge ? badgeClass : undefined}
                                    />
                                );
                            })()}
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={kintHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" style={{ stroke: 'var(--theme-primary)20' }} />
                                    <XAxis
                                        dataKey="day"
                                        stroke="var(--theme-text-secondary)"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--theme-text-secondary)"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--theme-surface)',
                                            border: '1px solid var(--theme-primary)',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(20px)',
                                            boxShadow: 'var(--theme-primary)40 0 20px'
                                        }}
                                        labelStyle={{ color: 'var(--theme-text-secondary)' }}
                                        itemStyle={{ color: 'var(--theme-secondary)' }}
                                    />
                                    <defs>
                                        <linearGradient id="PointsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" style={{ stopColor: 'var(--theme-primary)', stopOpacity: 0.6 }} />
                                            <stop offset="95%" style={{ stopColor: 'var(--theme-primary)', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="points"
                                        name="Points NyxBot"
                                        stroke="var(--theme-primary)"
                                        strokeWidth={3}
                                        fill="url(#PointsGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </NyxCard>

                    {/* Update Notes */}
                    {patchNotes && (
                        <NyxCard delay={0.5}>
                            <SectionHeader
                                icon={<BookOpen size={18} className="text-white" />}
                                title={patchNotes.title}
                                badgeText="Nouveautés"
                            />
                            <div className="space-y-4">
                                {patchNotes.ajouts?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--theme-secondary)' }}>
                                            <Sparkles size={16} />
                                            Nouveautés
                                        </h4>
                                        <ul className="space-y-2">
                                            {patchNotes.ajouts.map((note, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {patchNotes.ajustements?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                                            <Settings size={16} />
                                            Améliorations
                                        </h4>
                                        <ul className="space-y-2">
                                            {patchNotes.ajustements.map((note, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </NyxCard>
                    )}
                </div>

                {/* Right Column - Quick Actions & Info */}
                <div className="space-y-6">
                    {/* Daily Bonus */}
                    <NyxCard delay={0.6} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl"
                             style={{ background: 'var(--theme-gradient)' }}></div>
                        <div className="relative">
                            <SectionHeader
                                icon={<Gift size={18} className="text-white" />}
                                title="Récompense Quotidienne"
                                badgeText={!claimStatus.canClaim ? `Disponible dans ${claimStatus.timeLeft}` : undefined}
                            />
                            <motion.button
                                onClick={handleClaimReward}
                                disabled={!claimStatus.canClaim || isClaiming}
                                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                                    !claimStatus.canClaim || isClaiming
                                        ? 'bg-gray-700/50 cursor-not-allowed text-gray-400'
                                        : 'btn-nyx-primary'
                                }`}
                                whileHover={claimStatus.canClaim ? { scale: 1.02 } : {}}
                                whileTap={claimStatus.canClaim ? { scale: 0.98 } : {}}
                            >
                                {isClaiming && <Loader2 className="h-5 w-5 animate-spin" />}
                                {claimStatus.canClaim ? 'Réclamer maintenant' : `Disponible dans ${claimStatus.timeLeft}`}
                            </motion.button>
                        </div>
                    </NyxCard>

                    {/* News Feed */}
                    <NyxCard delay={0.7}>
                        <SectionHeader icon={<Newspaper size={18} className="text-white" />} title="Actualités NyxBot" />
                        <div className="relative min-h-[100px] flex items-center">
                            <AnimatePresence mode="wait">
                                {articles.length > 0 ? (
                                    <motion.div
                                        key={articles[currentArticleIndex].id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full"
                                    >
                                        <div className="flex items-start gap-3 p-4 rounded-lg border"
                                             style={{
                                               backgroundColor: 'var(--theme-primary)10',
                                               borderColor: 'var(--theme-primary)30'
                                             }}>
                                            <span className="text-2xl">{articles[currentArticleIndex].icon}</span>
                                            <div className="flex-1">
                                                <h4 className="font-semibold mb-1" style={{ color: 'var(--theme-text)' }}>{articles[currentArticleIndex].title}</h4>
                                                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{articles[currentArticleIndex].content}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="w-full text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: 'var(--theme-surface)' }}>
                                            <Newspaper size={24} style={{ color: 'var(--theme-text-secondary)' }} />
                                        </div>
                                        <p style={{ color: 'var(--theme-text-secondary)' }}>Aucune actualité pour le moment</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </NyxCard>

                    {/* Customization */}
                    <NyxCard delay={0.8}>
                        <SectionHeader icon={<Crown size={18} className="text-white" />} title="Personnalisation" />
                        <div className="space-y-4">
                            {/* Theme Selector */}
                            <div className="p-4 rounded-lg border"
                                 style={{
                                   backgroundColor: 'var(--theme-primary)10',
                                   borderColor: 'var(--theme-primary)30'
                                 }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Thème saisonnier</p>
                                        <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>Change l'ambiance du dashboard</p>
                                    </div>
                                    <ThemeSelector />
                                </div>
                            </div>

                            {/* Title Customization */}
                            <div className="p-4 rounded-lg border"
                                 style={{
                                   backgroundColor: 'var(--theme-primary)10',
                                   borderColor: 'var(--theme-primary)30'
                                 }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Titre actuel</p>
                                        <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>{stats?.equippedTitle || 'Aucun titre'}</p>
                                    </div>
                                    <motion.button
                                        onClick={() => setIsTitleModalOpen(true)}
                                        className="btn-nyx-secondary"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Modifier
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </NyxCard>

                    {/* Quick Inventory */}
                    <NyxCard delay={0.9}>
                        <SectionHeader icon={<Package size={18} className="text-white" />} title="Inventaire" badgeText={`${inventory.length} objets`} />
                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                            {inventory.length > 0 ? inventory.slice(0, 5).map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border"
                                     style={{
                                       backgroundColor: 'var(--theme-primary)10',
                                       borderColor: 'var(--theme-primary)30'
                                     }}>
                                    {item.icon ?
                                        <Image src={item.icon} alt={item.name} width={24} height={24} className="rounded" /> :
                                        <div className="w-6 h-6 rounded flex items-center justify-center"
                                             style={{ backgroundColor: 'var(--theme-primary)20' }}>
                                            <Gem size={14} style={{ color: 'var(--theme-secondary)' }} />
                                        </div>
                                    }
                                    <span className="flex-1 font-medium truncate" style={{ color: 'var(--theme-text)' }}>{item.name}</span>
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                          style={{
                                            backgroundColor: 'var(--theme-primary)20',
                                            color: 'var(--theme-secondary)'
                                          }}>
                                        x{item.quantity}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                                         style={{ backgroundColor: 'var(--theme-surface)' }}>
                                        <Package size={20} style={{ color: 'var(--theme-text-secondary)' }} />
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Inventaire vide</p>
                                </div>
                            )}
                        </div>
                    </NyxCard>
                </div>
            </div>

            {/* Achievements Section */}
    <NyxCard delay={1.0}>
        <SectionHeader
            icon={<Trophy size={18} className="text-white" />}
            title="Succès Débloqués"
            badgeText={`${unlockedSuccesses.length}/${totalAchievementsCount}`}
        />
        {unlockedSuccesses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {unlockedSuccesses.map((successId, index) => (
                    <motion.div
                        key={successId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border text-center group transition-all duration-300 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--theme-primary)10',
                          borderColor: 'var(--theme-primary)30'
                        }}
                        title={allAchievements[successId]?.description || 'Succès secret'}
                    >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                             style={{
                               background: 'var(--theme-gradient)',
                               boxShadow: '0 0 10px var(--theme-primary)40'
                             }}>
                            <Trophy size={16} className="text-white" />
                        </div>
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--theme-text)' }}>
                            {allAchievements[successId]?.name || successId}
                        </p>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--theme-surface)' }}>
                    <Trophy size={32} style={{ color: 'var(--theme-text-secondary)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Aucun succès débloqué pour le moment</p>
            </div>
        )}
    </NyxCard>

            {/* Title Modal */}
            <AnimatePresence>
                {isTitleModalOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <NyxCard className="w-full max-w-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                    <Crown size={18} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Changer de titre</h2>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {availableTitles.length > 0 ? availableTitles.map(titre => (
                                    <label key={titre} className="flex items-center p-3 bg-purple-primary/5 rounded-lg border border-purple-primary/20 cursor-pointer hover:bg-purple-primary/10 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="title" 
                                            value={titre} 
                                            checked={selectedTitle === titre} 
                                            onChange={(e) => setSelectedTitle(e.target.value)} 
                                            className="w-4 h-4 text-purple-primary bg-gray-700 border-gray-600 focus:ring-purple-primary focus:ring-offset-0" 
                                        />
                                        <span className="ml-3 text-white">{titre}</span>
                                    </label>
                                )) : (
                                    <p className="text-gray-400 text-center py-8">Vous ne possédez aucun titre.</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <motion.button 
                                    onClick={() => setIsTitleModalOpen(false)} 
                                    className="btn-nyx-secondary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Annuler
                                </motion.button>
                                <motion.button 
                                    onClick={handleEquipTitle} 
                                    className="btn-nyx-primary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Équiper
                                </motion.button>
                            </div>
                            </NyxCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </WithMaintenanceCheck>
    );
}

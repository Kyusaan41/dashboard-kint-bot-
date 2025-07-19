'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Zap, Crown, Award, Medal, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { getXPLeaderboard, getCurrencyLeaderboard, getPointsLeaderboard } from '@/utils/api';

// --- Types (inchangés) ---
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

// --- COMPOSANTS MIS À JOUR ---

const PodiumCard = ({ entry, rank, icon: Icon }: { entry: LeaderboardEntry, rank: number, icon: React.ElementType }) => {
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;
    const rankConfig = {
        1: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/30', text: 'text-yellow-400', height: 'h-64', y: 0, icon: Crown, glowColor: 'rgba(255, 223, 0, 0.15)' },
        2: { border: 'border-gray-300', shadow: 'shadow-gray-300/20', text: 'text-gray-300', height: 'h-56', y: '2rem', icon: Award, glowColor: 'rgba(209, 213, 219, 0.15)' },
        3: { border: 'border-orange-400', shadow: 'shadow-orange-400/20', text: 'text-orange-400', height: 'h-52', y: '3rem', icon: Medal, glowColor: 'rgba(251, 146, 60, 0.15)' },
    };
    const config = rankConfig[rank as keyof typeof rankConfig];

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: (4 - rank) * 0.2, type: 'spring', stiffness: 80 }}
            className="relative flex flex-col items-center justify-end"
            style={{ marginTop: config.y }}
        >
            <config.icon className={`${config.text} mb-2`} size={32}/>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={80} height={80} className="rounded-full border-4 border-gray-600 shadow-lg z-10" />
            <div className={`futuristic-card relative flex flex-col items-center justify-center p-4 pt-12 ${config.height} w-full rounded-t-lg ${config.border} border-b-0`}>
                <h3 className="font-bold text-lg text-white truncate max-w-full">{entry.username || 'Inconnu'}</h3>
                {/* ▼▼▼ MODIFICATION ICI : Centrage des valeurs ▼▼▼ */}
                <div className="flex items-center justify-center gap-2 text-2xl font-bold mt-1">
                    <Icon size={16} className={config.text} />
                    <span className={config.text}>{value.toLocaleString()}</span>
                </div>
            </div>
             {/* Effet de lumière volumétrique */}
            <div
                className="absolute bottom-0 w-[200%] h-64 opacity-50"
                style={{ background: `radial-gradient(circle at 50% 100%, ${config.glowColor} 0%, transparent 60%)` }}
            />
        </motion.div>
    );
};

const LeaderboardRow = ({ entry, rank, sessionUserId, icon: Icon }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string, icon: React.ElementType }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: (rank - 4) * 0.07 }}
            className={`futuristic-card flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${isCurrentUser ? 'border-cyan-500 scale-[1.01]' : 'border-transparent'}`}
        >
            <div className="w-8 text-center font-bold text-gray-400 text-lg">{rank}.</div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" />
            <span className="font-medium text-white truncate">{entry.username || 'Utilisateur Inconnu'}</span>
            {/* ▼▼▼ MODIFICATION ICI : Points rapprochés de l'utilisateur ▼▼▼ */}
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 ml-auto">
                <Icon size={16}/> {value.toLocaleString()}
            </div>
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
            setError("Impossible de charger les classements. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (status === 'authenticated') fetchData(); }, [status]);

    const tabs = [
        { id: 'xp', label: 'Expérience', icon: Star },
        { id: 'currency', label: 'Pièces', icon: Coins },
        { id: 'points', label: 'Points KINT', icon: Zap },
    ];

    const currentLeaderboard = leaderboards ? leaderboards[activeTab] : [];
    const topThree = currentLeaderboard.slice(0, 3);
    const restOfLeaderboard = currentLeaderboard.slice(3);
    const activeIcon = tabs.find(t => t.id === activeTab)?.icon || Star;
    
    if (loading || status === 'loading') {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-8">
                <p>{error}</p>
                <button onClick={fetchData} className="mt-4 flex items-center gap-2 mx-auto futuristic-button">
                    <RefreshCw size={18} /> Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Trophy /> Classements du Serveur</h1>
            
            <div className="p-1 futuristic-card rounded-lg flex gap-1 relative">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`w-full relative flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors duration-300 z-10 ${ activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white' }`}
                    >
                        <tab.icon size={18} /> <span>{tab.label}</span>
                    </button>
                ))}
                <AnimatePresence>
                    {activeTab && (
                        <motion.div
                            layoutId="active-tab-indicator"
                            className="absolute inset-0 bg-cyan-600/30 rounded-md"
                            style={{ width: `${100 / tabs.length}%`, left: `${(tabs.findIndex(t => t.id === activeTab) * 100) / tabs.length}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-12"
                >
                    {topThree.length >= 1 && (
                        <div className="grid grid-cols-3 gap-4 items-end pt-12">
                            {topThree[1] && <PodiumCard entry={topThree[1]} rank={2} icon={activeIcon} />}
                            {topThree[0] && <PodiumCard entry={topThree[0]} rank={1} icon={activeIcon} />}
                            {topThree[2] && <PodiumCard entry={topThree[2]} rank={3} icon={activeIcon} />}
                        </div>
                    )}

                    <div className="space-y-3">
                        {restOfLeaderboard.length > 0 && restOfLeaderboard.map((entry, index) => (
                            <LeaderboardRow 
                                key={entry.userId} 
                                entry={entry} 
                                rank={index + 4}
                                sessionUserId={session?.user?.id}
                                icon={activeIcon}
                            />
                        ))}
                    </div>
                    
                    {currentLeaderboard.length === 0 && (
                        <div className="text-center text-gray-500 py-16">
                            <p>Aucune donnée pour ce classement.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
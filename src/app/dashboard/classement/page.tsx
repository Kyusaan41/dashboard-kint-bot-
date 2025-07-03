'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Zap, Crown, Award, Medal, Loader2, RefreshCw } from 'lucide-react';
import { getXPLeaderboard, getCurrencyLeaderboard, getPointsLeaderboard } from '@/utils/api';

// --- Types de Données ---
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

// --- Composant pour une seule ligne de classement (à partir de la 4ème place) ---
const LeaderboardRow = ({ entry, rank, sessionUserId }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;

    const getRankIndicator = () => {
        if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
        if (rank === 2) return <Award className="text-gray-300" size={20} />;
        if (rank === 3) return <Medal className="text-yellow-600" size={20} />;
        return <span className="text-gray-400 font-bold">{rank}.</span>;
    };

    return (
        <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (rank - 4) * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-cyan-900/60' : 'hover:bg-gray-800'}`}
        >
            <div className="w-8 text-center flex-shrink-0">{getRankIndicator()}</div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" />
            <span className="font-medium text-white flex-1 truncate">{entry.username || 'Utilisateur Inconnu'}</span>
            <span className="font-bold text-cyan-300">{value.toLocaleString()}</span>
        </motion.li>
    );
};

// --- Composant pour une carte du Podium ---
const PodiumCard = ({ entry, rank, icon: Icon }: { entry: LeaderboardEntry, rank: number, icon: React.ElementType }) => {
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;
    const rankColors = {
        1: { border: 'border-yellow-400', text: 'text-yellow-400', icon: Crown },
        2: { border: 'border-gray-300', text: 'text-gray-300', icon: Award },
        3: { border: 'border-yellow-600', text: 'text-yellow-600', icon: Medal },
    };
    const { border, text, icon: RankIcon } = rankColors[rank as keyof typeof rankColors];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: rank * 0.1 }}
            className={`bg-[#1e2530] p-6 rounded-2xl border-2 ${border} flex flex-col items-center text-center shadow-lg transform ${rank === 1 ? 'scale-110 z-10' : 'scale-100'}`}
        >
            <RankIcon className={`${text} mb-2`} size={32} />
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={80} height={80} className="rounded-full border-4 border-gray-600" />
            <span className="font-bold text-xl text-white mt-4 truncate max-w-full">{entry.username || 'Inconnu'}</span>
            <div className="flex items-center gap-2 mt-2 font-semibold text-lg">
                <Icon className={text} size={20} />
                <span className={text}>{value.toLocaleString()}</span>
            </div>
        </motion.div>
    );
};


// --- Le Composant Principal de la Page ---
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
            console.error("Erreur de chargement des classements:", err);
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
                <button onClick={fetchData} className="mt-4 flex items-center gap-2 mx-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                    <RefreshCw size={18} /> Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center text-cyan-400">🏆 Classements du Serveur 🏆</h1>
            
            <nav className="flex justify-center border-b border-gray-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors duration-200 ${
                            activeTab === tab.id
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <tab.icon size={18} />
                        {/* --- CORRECTION : Le label est maintenant dans un <span> --- */}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {topThree.length === 3 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end mb-12">
                            <PodiumCard entry={topThree[1]} rank={2} icon={activeIcon} />
                            <PodiumCard entry={topThree[0]} rank={1} icon={activeIcon} />
                            <PodiumCard entry={topThree[2]} rank={3} icon={activeIcon} />
                        </div>
                    )}

                    {restOfLeaderboard.length > 0 ? (
                        <ul className="space-y-2 bg-[#1e2530] p-4 rounded-lg">
                            {restOfLeaderboard.map((entry, index) => (
                                <LeaderboardRow 
                                    key={entry.userId} 
                                    entry={entry} 
                                    rank={index + 4}
                                    sessionUserId={session?.user?.id}
                                />
                            ))}
                        </ul>
                    ) : topThree.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Aucune donnée pour ce classement.</p>
                    ) : null}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
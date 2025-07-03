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

// --- Composant pour une seule ligne de classement ---
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
            transition={{ duration: 0.3, delay: rank * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-cyan-900/60' : 'hover:bg-gray-800'}`}
        >
            <div className="w-8 text-center flex-shrink-0">{getRankIndicator()}</div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" />
            <span className="font-medium text-white flex-1 truncate">{entry.username || 'Utilisateur Inconnu'}</span>
            <span className="font-bold text-cyan-300">{value.toLocaleString()}</span>
        </motion.li>
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
        setLoading(true);
        setError(null);
        try {
            const [xpData, currencyData, pointsData] = await Promise.all([
                getXPLeaderboard(),
                getCurrencyLeaderboard(),
                getPointsLeaderboard()
            ]);
            setLeaderboards({ xp: xpData, currency: currencyData, points: pointsData });
        } catch (err) {
            console.error("Erreur de chargement des classements:", err);
            setError("Impossible de charger les classements. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const tabs = [
        { id: 'xp', label: 'Expérience', icon: Star },
        { id: 'currency', label: 'Pièces', icon: Coins },
        { id: 'points', label: 'Points KINT', icon: Zap },
    ];

    const currentLeaderboard = leaderboards ? leaderboards[activeTab] : [];

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
                        {tab.label}
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
                    {currentLeaderboard.length > 0 ? (
                        <ul className="space-y-2 bg-[#1e2530] p-4 rounded-lg">
                            {currentLeaderboard.map((entry, index) => (
                                <LeaderboardRow 
                                    key={entry.userId} 
                                    entry={entry} 
                                    rank={index + 1} 
                                    sessionUserId={session?.user?.id}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Aucune donnée pour ce classement.</p>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
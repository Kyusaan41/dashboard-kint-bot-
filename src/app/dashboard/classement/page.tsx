'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Zap, Crown, Award, Medal, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { getXPLeaderboard, getCurrencyLeaderboard, getPointsLeaderboard } from '@/utils/api';

// --- Types ---
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

// --- Composant Card (pour la cohérence) ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

// --- Nouveaux Composants de Classement ---
const PodiumCard = ({ entry, rank, icon: Icon }: { entry: LeaderboardEntry, rank: number, icon: React.ElementType }) => {
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;
    const rankConfig = {
        1: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/20', icon: Crown, text: 'text-yellow-400', placement: '1er' },
        2: { border: 'border-gray-300', shadow: 'shadow-gray-300/20', icon: Award, text: 'text-gray-300', placement: '2ème' },
        3: { border: 'border-orange-400', shadow: 'shadow-orange-400/20', icon: Medal, text: 'text-orange-400', placement: '3ème' },
    };
    const config = rankConfig[rank as keyof typeof rankConfig];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: rank * 0.1, type: 'spring' }}
            className={`relative rounded-xl bg-[#1c222c] border ${config.border} p-6 text-center shadow-2xl ${config.shadow} ${rank === 1 ? 'scale-110 z-10' : 'lg:mt-8'}`}
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <config.icon className={config.text} size={32}/>
            </div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={80} height={80} className="rounded-full mx-auto mt-4 border-4 border-gray-600" />
            <h3 className="font-bold text-xl text-white mt-4 truncate max-w-full">{entry.username || 'Inconnu'}</h3>
            <p className={`font-semibold text-lg ${config.text}`}>{value.toLocaleString()}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Icon size={16}/><span>{config.placement}</span>
            </div>
        </motion.div>
    );
};

const LeaderboardRow = ({ entry, rank, sessionUserId, icon: Icon }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string, icon: React.ElementType }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    const value = entry.xp ?? entry.balance ?? entry.points ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (rank - 4) * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-cyan-900/60' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}
        >
            <div className="w-8 text-center font-bold text-gray-400">{rank}.</div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" />
            <span className="font-medium text-white flex-1 truncate">{entry.username || 'Utilisateur Inconnu'}</span>
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Icon size={16}/> {value.toLocaleString()}
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
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Trophy /> Classements du Serveur</h1>
            
            <div className="flex gap-4 border-b border-white/10 pb-4">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${ activeTab === tab.id ? 'bg-cyan-600 text-white' : 'bg-gray-800/50 hover:bg-gray-700/70' }`}>
                        <tab.icon size={18} /> <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {topThree.length >= 1 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-16">
                            {topThree[1] && <PodiumCard entry={topThree[1]} rank={2} icon={activeIcon} />}
                            {topThree[0] && <PodiumCard entry={topThree[0]} rank={1} icon={activeIcon} />}
                            {topThree[2] && <PodiumCard entry={topThree[2]} rank={3} icon={activeIcon} />}
                        </div>
                    )}

                    {restOfLeaderboard.length > 0 && (
                        <Card>
                            <div className="space-y-2">
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
                        </Card>
                    )}
                    
                    {currentLeaderboard.length === 0 && (
                        <p className="text-center text-gray-500 py-16">Aucune donnée pour ce classement.</p>
                    )}
                </motion.div>
            </AnimatePresence>
            <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
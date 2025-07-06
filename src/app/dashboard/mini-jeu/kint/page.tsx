'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints, getInventory } from '@/utils/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Crown, Shield, Loader2, Trophy, History, Swords, Award, Medal } from 'lucide-react';

// --- Types ---
type LeaderboardEntry = { userId: string; points: number; username?: string; avatar?: string; };
type HistoryEntry = { amount: number; date: string; reason: string; type?: 'shield' };
type InventoryItem = { id: string; name: string; quantity: number; };

// --- Composant Card (pour la cohérence) ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
);

// --- Sous-composants pour la clarté ---

const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry, rank: number }) => {
    const rankConfig = {
        1: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/20', icon: Crown },
        2: { border: 'border-gray-300', shadow: 'shadow-gray-300/20', icon: Award },
        3: { border: 'border-orange-400', shadow: 'shadow-orange-400/20', icon: Medal },
    };
    const config = rankConfig[rank as keyof typeof rankConfig];
    
    return (
         <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: rank * 0.1, type: 'spring' }} className={`relative rounded-xl bg-[#1c222c] border-2 ${config.border} p-6 text-center shadow-2xl ${config.shadow} ${rank === 1 ? 'scale-110 z-10' : 'lg:mt-8'}`}>
            <config.icon className={config.border.replace('border-', 'text-')} size={32} />
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={80} height={80} className="rounded-full mx-auto my-4 border-4 border-gray-600" />
            <h3 className="font-bold text-xl text-white truncate max-w-full">{entry.username || 'Inconnu'}</h3>
            <p className={`font-semibold text-lg ${config.border.replace('border-', 'text-')}`}>{entry.points?.toLocaleString()} pts</p>
        </motion.div>
    );
};

const LeaderboardRow = ({ entry, rank, sessionUserId }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: (rank - 4) * 0.05 }} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-cyan-900/60' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}>
            <div className="w-8 text-center font-bold text-gray-400">{rank}.</div>
            <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" />
            <span className="font-medium text-white flex-1 truncate">{entry.username || 'Inconnu'}</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1.5"><Zap size={14}/> {entry.points?.toLocaleString()}</span>
        </motion.div>
    );
};

const HistoryItem = ({ item }: { item: HistoryEntry }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex items-center justify-between text-sm bg-gray-800/50 p-3 rounded-md">
        <div className="flex items-center gap-3">
            {item.type === 'shield' ? <Shield size={18} className="text-blue-400"/> : item.amount > 0 ? <TrendingUp className="text-green-500" size={18}/> : <TrendingDown className="text-red-500" size={18}/>}
            <div>
                <p className={`font-bold ${item.type === 'shield' ? 'text-blue-300' : item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{item.type === 'shield' ? 'KShield Activé' : `${item.amount > 0 ? '+' : ''}${item.amount} pts`}</p>
                <p className="text-xs text-gray-500">{item.reason}</p>
            </div>
        </div>
        <p className="text-xs text-gray-400 flex-shrink-0">{new Date(item.date).toLocaleTimeString('fr-FR')}</p>
    </motion.div>
);

// --- Composant Principal ---
export default function KintMiniGamePage() {
    const { data: session, status } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>('');

    const fetchData = async () => {
        if (!session?.user?.id) return;
        try {
            const [leaderboardData, pointsData, historyData, inventoryData] = await Promise.all([
                getPointsLeaderboard(),
                fetchPoints(session.user.id),
                fetch(`/api/points/${session.user.id}/history`).then(res => res.json()),
                getInventory(),
            ]);
            setLeaderboard(leaderboardData);
            setUserPoints(pointsData.points);
            setHistory(historyData);
            setInventory(inventoryData);
        } catch (error) {
            console.error("Erreur de chargement des données du jeu:", error);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            setLoading(true);
            fetchData().finally(() => setLoading(false));
        }
    }, [status, session]);
    
    const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
        if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount)) || !session?.user?.id) return;
        
        setIsSubmitting(true);
        const amount = Number(manualPointsAmount);
        const pointsToSend = actionType === 'add' ? amount : -amount;

        try {
            await updatePoints(session.user.id, pointsToSend);
            await fetchData();
            alert('Points mis à jour !');
        } catch (error) {
            alert(`Échec de la mise à jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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

    return (
        <div className="space-y-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Swords /> Arène KINT</h1>
                <p className="text-gray-400 mt-1">Consultez les scores, déclarez une victoire ou une défaite et suivez vos parties.</p>
            </motion.div>

            {/* Podium */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                    {topThree[1] && <PodiumCard entry={topThree[1]} rank={2} />}
                    {topThree[0] && <PodiumCard entry={topThree[0]} rank={1} />}
                    {topThree[2] && <PodiumCard entry={topThree[2]} rank={3} />}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    {/* PANNEAU JOUEUR UNIFIÉ */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <Image src={session?.user?.image || '/default-avatar.png'} alt="avatar" width={64} height={64} className="rounded-full border-2 border-cyan-500"/>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{session?.user?.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-blue-300">
                                        <Shield size={16}/>
                                        <span>KShields: {inventory.find(i => i.id === 'KShield')?.quantity || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-400">Score KINT Actuel</p>
                                <p className="text-7xl font-bold text-cyan-400 my-1">{userPoints ?? '...'}</p>
                            </div>
                            
                            <div className="bg-black/20 p-4 rounded-lg">
                                <label className="block text-sm font-medium mb-2 text-white">Déclarer un résultat</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="Points" value={manualPointsAmount} onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#12151d] p-3 rounded-md border border-white/20"/>
                                    <motion.button whileTap={{scale: 0.95}} onClick={() => handleManualPointsAction('add')} disabled={isSubmitting} title="Victoire" className="p-3 bg-green-600 rounded-md font-bold hover:bg-green-700 disabled:opacity-50">
                                        <TrendingUp size={20}/>
                                    </motion.button>
                                    <motion.button whileTap={{scale: 0.95}} onClick={() => handleManualPointsAction('subtract')} disabled={isSubmitting} title="Défaite" className="p-3 bg-red-600 rounded-md font-bold hover:bg-red-700 disabled:opacity-50">
                                        <TrendingDown size={20}/>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History/> Historique des parties</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                <AnimatePresence>
                                    {history.length > 0 ? history.map((item, index) => (
                                        <HistoryItem key={index} item={item} />
                                    )) : <p className="text-gray-500 text-center py-4">Aucune transaction récente.</p>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Trophy/> Classement de l'Arène</h2>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {restOfLeaderboard.length > 0 ? restOfLeaderboard.map((player, index) => (
                                    <LeaderboardRow key={player.userId} entry={player} rank={index + 4} sessionUserId={session?.user?.id} />
                                )) : (
                                    <p className="text-gray-500 text-center py-4">Pas d'autres joueurs dans le classement.</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
             <style jsx global>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints } from '@/utils/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, ChevronsRight, Crown, User, AlertTriangle } from 'lucide-react';

// --- Définition des Types ---
type LeaderboardEntry = { userId: string; points: number; username?: string; avatar?: string; };
type HistoryEntry = { amount: number; date: string; reason: string; };

// --- Le Composant Principal ---
export default function KintMiniGamePage() {
    const { data: session, status } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>('');

    const fetchData = async () => {
        if (!session?.user?.id) return;
        try {
            const [leaderboardData, pointsData, historyData] = await Promise.all([
                getPointsLeaderboard(),
                fetchPoints(session.user.id),
                fetch(`/api/points/${session.user.id}/history`).then(res => res.json())
            ]);
            setLeaderboard(leaderboardData);
            setUserPoints(pointsData.points);
            setHistory(historyData);
        } catch (error) {
            console.error("Erreur de chargement des données du jeu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
        if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount)) || userPoints === null || !session?.user?.id) return;
        
        const amount = Number(manualPointsAmount);
        const newPoints = actionType === 'add' ? userPoints + amount : userPoints - amount;
        const previousPoints = userPoints;
        setUserPoints(newPoints); 

        try {
            await updatePoints(session.user.id, newPoints);
            fetchData(); // On recharge tout pour être à jour
        } catch (error) {
            setUserPoints(previousPoints); 
            alert("Échec de la mise à jour des points.");
        } finally {
            setManualPointsAmount('');
        }
    };

    if (loading || status === 'loading') {
        return <div className="text-center text-gray-400 animate-pulse">Chargement du jeu Kint...</div>;
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-bold text-center text-cyan-400">Classement KINT ⚡</h1>
                <p className="text-center text-gray-400 mt-2">Gérez vos points et consultez l'historique de vos actions.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Image src={session?.user?.image || '/default-avatar.png'} alt="avatar" width={48} height={48} className="rounded-full"/>
                        {session?.user?.name}
                    </h2>
                    <div className="text-center bg-black/20 p-6 rounded-lg">
                        <p className="text-sm text-gray-400">Votre score actuel</p>
                        <p className="text-7xl font-bold text-cyan-400 my-2">{userPoints}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block font-medium">Modifier le score</label>
                            {/* --- CORRECTION : Ajout de 'inline-block' pour empêcher le conteneur de s'étirer --- */}
                            <div className="relative group inline-block">
                                <AlertTriangle className="h-5 w-5 text-red-500 cursor-help"/>
                                <div className="absolute bottom-full mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Attention ! La logique du KShield n'est pas encore active sur le dashboard. Si vous voulez utiliser votre Shield en cas de défaite, faites-le sur Discord !
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Montant..." value={manualPointsAmount} onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-md"/>
                            <button onClick={() => handleManualPointsAction('add')} className="p-3 bg-green-600 rounded-md font-bold hover:bg-green-700"><TrendingUp size={20}/></button>
                            <button onClick={() => handleManualPointsAction('subtract')} className="p-3 bg-red-600 rounded-md font-bold hover:bg-red-700"><TrendingDown size={20}/></button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Historique Récent</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        <AnimatePresence>
                            {history.length > 0 ? history.map((item, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="flex items-center justify-between text-sm bg-gray-800 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        {item.amount > 0 ? <TrendingUp className="text-green-500" size={18}/> : <TrendingDown className="text-red-500" size={18}/>}
                                        <div>
                                            <p className={`font-bold ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{item.amount > 0 ? `+${item.amount}` : item.amount} points</p>
                                            <p className="text-xs text-gray-500">{item.reason}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</p>
                                </motion.div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">Aucune transaction récente.</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Classement</h2>
                    <ul className="space-y-2">
                        {leaderboard.length > 0 ? leaderboard.map((player, index) => (
                            <motion.li key={player.userId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.15 }} className={`flex items-center gap-3 p-2 rounded-md ${player.userId === session?.user?.id ? 'bg-cyan-900/50' : ''}`}>
                                <div className="w-8 text-center font-bold text-gray-400">{index === 0 ? <Crown size={20} className="text-yellow-400 mx-auto"/> : `${index + 1}.`}</div>
                                <Image src={player.avatar || '/default-avatar.png'} alt={player.username || 'avatar'} width={36} height={36} className="rounded-full"/>
                                <span className="font-medium text-gray-200 flex-1 truncate">{player.username}</span>
                                <span className="font-bold text-cyan-400">{player.points}</span>
                            </motion.li>
                        )) : (
                            <p className="text-gray-500 text-center py-4">Aucun joueur dans le classement.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
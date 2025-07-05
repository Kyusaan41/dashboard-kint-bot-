'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints, getInventory } from '@/utils/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Crown, User, Shield, Loader2 } from 'lucide-react';

// --- Types ---
type LeaderboardEntry = { userId: string; points: number; username?: string; avatar?: string; };
type HistoryEntry = { amount: number; date: string; reason: string; type?: 'shield' };
type InventoryItem = { id: string; name: string; quantity: number; };

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

    // Fonction pour charger toutes les données
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

    // Chargement initial des données
    useEffect(() => {
        if (status === 'authenticated') {
            setLoading(true);
            fetchData().finally(() => setLoading(false));
        }
    }, [status, session]);
    
    // Logique d'envoi de la modification de points
    const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
        if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount)) || !session?.user?.id) return;
        
        setIsSubmitting(true);
        const amount = Number(manualPointsAmount);
        const pointsToSend = actionType === 'add' ? amount : -amount;
        
        console.log(`[DEBUG KINT] Tentative d'envoi de ${pointsToSend} points.`);

        try {
            await updatePoints(session.user.id, pointsToSend);
            // Après la mise à jour, on recharge toutes les données pour être sûr
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
        return <div className="text-center text-gray-400 animate-pulse">Chargement du jeu Kint...</div>;
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-bold text-center text-cyan-400">Classement KINT ⚡</h1>
                <p className="text-center text-gray-400 mt-2">Gérez vos points et consultez l'historique de vos actions.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* --- Section Joueur et Actions --- */}
                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Image src={session?.user?.image || '/default-avatar.png'} alt="avatar" width={48} height={48} className="rounded-full"/>
                        {session?.user?.name}
                    </h2>
                    <div className="text-center bg-black/20 p-6 rounded-lg">
                        <p className="text-sm text-gray-400">Votre score actuel</p>
                        <p className="text-7xl font-bold text-cyan-400 my-2">{userPoints ?? '...'}</p>
                        <p className="text-sm text-gray-400">KShields possédés : <span className="font-bold text-white">{inventory.find(i => i.id === 'KShield')?.quantity || 0}</span></p>
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Modifier le score (Victoire / Défaite)</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Montant..." value={manualPointsAmount} onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-md"/>
                            <button onClick={() => handleManualPointsAction('add')} disabled={isSubmitting} className="p-3 bg-green-600 rounded-md font-bold hover:bg-green-700 cursor-pointer disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <TrendingUp size={20}/>}
                            </button>
                            <button onClick={() => handleManualPointsAction('subtract')} disabled={isSubmitting} className="p-3 bg-red-600 rounded-md font-bold hover:bg-red-700 cursor-pointer disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <TrendingDown size={20}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Section Historique --- */}
                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Historique Récent</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        <AnimatePresence>
                            {history.length > 0 ? history.map((item, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="flex items-center justify-between text-sm bg-gray-800 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        {item.amount > 0 ? ( <TrendingUp className="text-green-500" size={18}/> ) : ( <TrendingDown className="text-red-500" size={18}/> )}
                                        <div>
                                            <p className={`font-bold ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{item.amount > 0 ? `+${item.amount}` : item.amount} points</p>
                                            <p className="text-xs text-gray-500">{item.reason}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString('fr-FR')}</p>
                                </motion.div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">Aucune transaction récente.</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- Section Classement --- */}
                <div className="lg:col-span-1 bg-[#1e2530] p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Classement</h2>
                    <ul className="space-y-2">
                        {leaderboard.length > 0 ? leaderboard.map((player, index) => (
                            <motion.li key={player.userId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }} className={`flex items-center gap-3 p-2 rounded-md ${player.userId === session?.user?.id ? 'bg-cyan-900/50' : ''}`}>
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
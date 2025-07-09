'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints, getInventory, sendKintLogToDiscord, getDetailedKintLogs } from '@/utils/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Crown, Shield, Loader2, Trophy, History, Swords, Award, Medal, CheckCircle, BarChart2 } from 'lucide-react';

// --- NOUVELLES FONCTIONS API ---
async function fetchKintStats(userId: string) {
    const response = await fetch(`/api/kint-stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch KINT stats');
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

// --- Types ---
type LeaderboardEntry = { userId: string; points: number; username?: string; avatar?: string; };
type HistoryEntry = { userId: string; username: string; avatar?: string; actionType: 'GAGNÉ' | 'PERDU'; points: number; currentBalance: number; effect?: string; date: string; reason: string; source: 'Discord' | 'Dashboard'; };
type InventoryItem = { id: string; name: string; quantity: number; };
type Notification = { show: boolean; message: string; type: 'success' | 'error' };
type KintStats = { total: number; oui: number; non: number };


const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
);
const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry, rank: number }) => {
    const rankConfig = { 1: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/20', icon: Crown }, 2: { border: 'border-gray-300', shadow: 'shadow-gray-300/20', icon: Award }, 3: { border: 'border-orange-400', shadow: 'shadow-orange-400/20', icon: Medal }, };
    const config = rankConfig[rank as keyof typeof rankConfig];
    return ( <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: rank * 0.1, type: 'spring' }} className={`relative rounded-xl bg-[#1c222c] border-2 ${config.border} p-6 text-center shadow-2xl ${config.shadow} ${rank === 1 ? 'scale-110 z-10' : 'lg:mt-8'}`}> <config.icon className={config.border.replace('border-', 'text-')} size={32} /> <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={80} height={80} className="rounded-full mx-auto my-4 border-4 border-gray-600" /> <h3 className="font-bold text-xl text-white truncate max-w-full">{entry.username || 'Inconnu'}</h3> <p className={`font-semibold text-lg ${config.border.replace('border-', 'text-')}`}>{entry.points?.toLocaleString()} pts</p> </motion.div> );
};
const LeaderboardRow = ({ entry, rank, sessionUserId }: { entry: LeaderboardEntry, rank: number, sessionUserId?: string }) => {
    const isCurrentUser = entry.userId === sessionUserId;
    return ( <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: (rank - 4) * 0.05 }} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-cyan-900/60' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}> <div className="w-8 text-center font-bold text-gray-400">{rank}.</div> <Image src={entry.avatar || '/default-avatar.png'} alt={entry.username || 'avatar'} width={40} height={40} className="rounded-full" /> <span className="font-medium text-white flex-1 truncate">{entry.username || 'Inconnu'}</span> <span className="font-bold text-cyan-300 flex items-center gap-1.5"><Zap size={14}/> {entry.points?.toLocaleString()}</span> </motion.div> );
};
const HistoryItem = ({ item }: { item: HistoryEntry }) => {
    const formattedDate = new Date(item.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const isKShieldLog = item.reason === 'Protégé par KShield';
    const Icon = isKShieldLog ? Shield : (item.actionType === 'GAGNÉ' ? TrendingUp : TrendingDown);
    const iconColor = isKShieldLog ? 'text-blue-400' : (item.actionType === 'GAGNÉ' ? 'text-green-500' : 'text-red-500');
    const textColor = isKShieldLog ? 'text-blue-300' : (item.actionType === 'GAGNÉ' ? 'text-green-400' : 'text-red-400');
    const actionSign = item.actionType === 'GAGNÉ' ? '+' : '-';
    const logText = isKShieldLog ? `a perdu ${item.points} pts` : `a ${item.actionType.toLowerCase()} ${actionSign}${item.points} pts`;
    return ( <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex flex-col text-sm bg-gray-800/50 p-3 rounded-md"> <p className="text-gray-400 mb-1">{formattedDate} <span className={item.source === 'Discord' ? 'text-purple-400 font-semibold' : 'text-blue-400 font-semibold'}>({item.source})</span></p> <div className="flex items-center gap-2"> <Icon className={iconColor} size={18}/> <p className="font-semibold text-white truncate">{item.username} <span className={textColor}>{logText}</span> ({item.reason})</p> </div> {item.effect && item.effect !== "Aucun effet" && (<p className="text-xs text-gray-500 mt-1">Effet: {item.effect}</p>)} </motion.div> );
};


export default function KintMiniGamePage() {
    const { data: session, status } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>('');
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });
    const [kintStats, setKintStats] = useState<KintStats>({ total: 0, oui: 0, non: 0 });
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // État pour la modale

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    const fetchData = async () => {
        if (!session?.user?.id) return;
        try {
            const [leaderboardData, pointsData, detailedHistoryData, inventoryData, statsData] = await Promise.all([
                getPointsLeaderboard(),
                fetchPoints(session.user.id),
                getDetailedKintLogs(),
                getInventory(),
                fetchKintStats(session.user.id),
            ]);
            const membersMap = new Map<string, { username?: string; avatar?: string; }>(leaderboardData.map((p: LeaderboardEntry) => [p.userId, { username: p.username, avatar: p.avatar }]));
            const enrichedHistory = detailedHistoryData.map((log: HistoryEntry) => ({...log, username: membersMap.get(log.userId)?.username || log.username, avatar: membersMap.get(log.userId)?.avatar || log.avatar,})).filter((log: HistoryEntry) => log.userId === session.user.id);
            setLeaderboard(leaderboardData);
            setUserPoints(pointsData.points);
            setInventory(inventoryData);
            setHistory(enrichedHistory);
            setKintStats(statsData);
        } catch (error) {
            console.error("Erreur de chargement des données du jeu:", error);
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

    // --- MODIFICATION DE LA FONCTION DE MISE À JOUR ---
    const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
        if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount)) || !session?.user?.id || !session.user.name || !session.user.image) {
            showNotification("Veuillez entrer un nombre de points valide.", "error");
            return;
        }

        setIsSubmitting(true);
        const amount = Number(manualPointsAmount);
        const pointsToModify = actionType === 'add' ? amount : -amount;
        const actionText = actionType === 'add' ? 'GAGNÉ' : 'PERDU';
        const reasonText = actionType === 'add' ? 'Victoire Dashboard' : 'Défaite Dashboard';
        const statsUpdateType = actionType === 'add' ? 'non' : 'oui'; // 'non' pour victoire, 'oui' pour défaite
        const source = "Dashboard";

        try {
            await updatePoints(session.user.id, pointsToModify, source);
            await updateKintStats(session.user.id, statsUpdateType); // MISE À JOUR DES STATS
            const updatedPointsData = await fetchPoints(session.user.id);
            const newCurrentBalance = updatedPointsData.points;
            await sendKintLogToDiscord({
                userId: session.user.id, username: session.user.name,
                avatar: session.user.image, actionType: actionText,
                points: amount, currentBalance: newCurrentBalance,
                effect: "Manuel Dashboard", date: new Date().toISOString(),
                source: source, reason: reasonText
            });
            await fetchData();
            showNotification("Votre KINT a bien été pris en compte !");
        } catch (error) {
            showNotification(`Échec de la mise à jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
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
    const winRate = kintStats.total > 0 ? ((kintStats.non / kintStats.total) * 100).toFixed(0) : 0;

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {notification.show && ( <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }} className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 bg-green-600 text-white"> <CheckCircle /> <span className="font-semibold">{notification.message}</span> </motion.div> )}
                
                {/* --- MODALE POUR LES STATS KINT --- */}
                {isStatsModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsStatsModalOpen(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-[#1c222c] p-6 rounded-2xl border border-cyan-700 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-bold mb-5 text-center text-cyan-400">Statistiques KINT</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-300">Parties Jouées</span>
                                    <span className="font-bold text-xl">{kintStats.total}</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-900/50 p-3 rounded-lg">
                                    <span className="font-semibold text-green-300">Victoires (NON)</span>
                                    <span className="font-bold text-xl text-green-300">{kintStats.non}</span>
                                </div>
                                <div className="flex justify-between items-center bg-red-900/50 p-3 rounded-lg">
                                    <span className="font-semibold text-red-300">Défaites (OUI)</span>
                                    <span className="font-bold text-xl text-red-300">{kintStats.oui}</span>
                                </div>
                                <div className="text-center pt-2">
                                    <p className="text-sm text-cyan-400">Votre Ratio de Victoire</p>
                                    <p className="text-4xl font-bold">{winRate}%</p>
                                </div>
                            </div>
                            <button onClick={() => setIsStatsModalOpen(false)} className="mt-6 w-full py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 font-semibold transition">Fermer</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Swords /> Arène KINT</h1>
                <p className="text-gray-400 mt-1">Consultez les scores, déclarez une victoire ou une défaite et suivez vos parties.</p>
            </motion.div>

            {topThree.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">{topThree[1] && <PodiumCard entry={topThree[1]} rank={2} />}{topThree[0] && <PodiumCard entry={topThree[0]} rank={1} />}{topThree[2] && <PodiumCard entry={topThree[2]} rank={3} />}</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <Card><div className="p-6"><div className="flex items-center gap-4 mb-6"><Image src={session?.user?.image || '/default-avatar.png'} alt="avatar" width={64} height={64} className="rounded-full border-2 border-cyan-500"/><div><h2 className="text-2xl font-bold text-white">{session?.user?.name}</h2><div className="flex items-center gap-2 text-sm text-blue-300"><Shield size={16}/><span>KShields: {inventory.find(i => i.id === 'KShield')?.quantity || 0}</span></div></div></div><div className="text-center mb-6"><p className="text-sm text-gray-400">Score KINT Actuel</p><p className="text-7xl font-bold text-cyan-400 my-1">{userPoints ?? '...'}</p></div><div className="bg-black/20 p-4 rounded-lg"><label className="block text-sm font-medium mb-2 text-white">Déclarer un résultat</label><div className="flex items-center gap-2"><input type="number" placeholder="Points" value={manualPointsAmount} onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#12151d] p-3 rounded-md border border-white/20"/><motion.button whileTap={{scale: 0.95}} onClick={() => handleManualPointsAction('add')} disabled={isSubmitting} title="Victoire" className="p-3 bg-green-600 rounded-md font-bold hover:bg-green-700 disabled:opacity-50"><TrendingUp size={20}/></motion.button><motion.button whileTap={{scale: 0.95}} onClick={() => handleManualPointsAction('subtract')} disabled={isSubmitting} title="Défaite" className="p-3 bg-red-600 rounded-md font-bold hover:bg-red-700 disabled:opacity-50"><TrendingDown size={20}/></motion.button></div></div></div></Card>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card><div className="p-6"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History/> Historique des parties</h2><div className="space-y-3 max-h-[400px] overflow-y-auto pr-2"><AnimatePresence>{history.length > 0 ? history.map((item, index) => <HistoryItem key={`${item.userId}-${item.date}-${index}`} item={item} />) : <p className="text-gray-500 text-center py-4">Aucune transaction récente.</p>}</AnimatePresence></div></div></Card>
                    <Card>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Trophy/> Classement de l'Arène</h2>
                                {/* --- BOUTON POUR OUVRIR LA MODALE --- */}
                                <button onClick={() => setIsStatsModalOpen(true)} className="flex items-center gap-1.5 text-sm bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-md hover:bg-cyan-700/50">
                                    <BarChart2 size={14} /> Stats
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">{restOfLeaderboard.length > 0 ? restOfLeaderboard.map((player, index) => <LeaderboardRow key={player.userId} entry={player} rank={index + 4} sessionUserId={session?.user?.id} />) : <p className="text-gray-500 text-center py-4">Pas d'autres joueurs dans le classement.</p>}</div>
                        </div>
                    </Card>
                </div>
            </div>
             <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
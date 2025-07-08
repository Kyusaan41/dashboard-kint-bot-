"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState, FC, ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getInventory, getAllAchievements } from '@/utils/api';
import {
    Coins, Gift, Loader2, Package, Star, Zap, Trophy,
    BookOpen, Crown, Gem, CheckCircle
} from 'lucide-react';

// --- Types Corrigés ---
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


// --- UI Components ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={`bg-[#1c222c] border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden group ${className}`}
    >
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const StatCard: FC<{ icon: ReactNode; title: string; value: number; rank: number | null; color: string }> = ({ icon, title, value, rank, color }) => {
    const formatRank = (r: number | null) => {
        if (!r) return <span className="text-gray-500">(Non classé)</span>;
        const rankColor = r <= 3 ? "text-yellow-500" : "text-gray-400";
        return <span className={`font-semibold ${rankColor}`}>({r}e)</span>;
    };
    return (
        <Card className="flex-1">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                </div>
                <div className="ml-auto">{formatRank(rank)}</div>
            </div>
        </Card>
    );
};

const WelcomeHeader: FC<{ user: any; server: ServerInfo | null }> = ({ user, server }) => (
    <div className="flex items-center gap-4">
        <Image src={user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full border-2 border-cyan-500" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bienvenue, <span className="text-cyan-400">{user?.name || 'Utilisateur'}</span>!</h1>
            <p className="text-gray-400">Ravi de vous revoir sur le dashboard de {server?.name || 'KTS'}.</p>
        </div>
    </div>
);

export default function DashboardHomePage() {
    const { data: session, status } = useSession();
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

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [statsData, successData, patchnoteData, titles, currency, server, inventoryData, allAchievementsData, kintHistoryRaw] = await Promise.all([
                        fetch(`/api/stats/me`).then(res => res.json()),
                        fetch(`/api/success/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/patchnote`).then(res => res.json()),
                        fetch(`/api/titres/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/currency/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/server/info`).then(res => res.json()),
                        getInventory(),
                        getAllAchievements(),
                        fetch(`/api/kint-detailed-logs?userId=${session.user.id}`).then(res => res.json()),
                    ]);

                    setStats(statsData);

                    const processedKintHistory = (kintHistoryRaw as HistoryEntry[])
                        .filter(entry => entry.reason !== 'Protégé par KShield')
                        .reduce((acc: { [key: string]: number }, entry) => {
                            const dayKey = new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                            const points = entry.actionType === 'GAGNÉ' ? entry.points : -entry.points;
                            acc[dayKey] = (acc[dayKey] || 0) + points;
                            return acc;
                        }, {});

                    const last7DaysMap = new Map<string, number>();
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dayKey = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                        last7DaysMap.set(dayKey, 0);
                    }

                    for (const day in processedKintHistory) {
                        if (last7DaysMap.has(day)) {
                            last7DaysMap.set(day, processedKintHistory[day]);
                        }
                    }

                    const finalChartData = Array.from(last7DaysMap.entries()).map(([day, points]) => ({ day, points }));
                    setKintHistoryData(finalChartData);

                    setUnlockedSuccesses(successData.succes || []);
                    setAllAchievements(allAchievementsData || {});
                    setPatchNotes(patchnoteData);
                    setAvailableTitles(titles.titresPossedes || []);
                    setServerInfo(server);
                    setInventory(inventoryData || []);

                    if (currency) {
                        const now = Date.now();
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        const lastClaimTime = currency.lastClaim;
                        if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
                            const timeLeftValue = twentyFourHours - (now - lastClaimTime);
                            const displayTime = new Date(Math.max(0, timeLeftValue)).toISOString().substr(11, 8);
                            setClaimStatus({ canClaim: false, timeLeft: displayTime });
                        } else {
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

    const handleClaimReward = async () => {
        if (!claimStatus.canClaim || isClaiming || !session?.user?.id) return;
        setIsClaiming(true);
        try {
            const res = await fetch(`/api/currency/claim/${session.user.id}`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                showNotification(data.message || "Récompense réclamée !");
                setStats(prev => prev ? { ...prev, currency: data.newBalance } : null);
                setClaimStatus({ canClaim: false, timeLeft: '24:00:00' });
            } else {
                showNotification(data.error || "Impossible de réclamer.", "error");
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
            showNotification("Titre équipé avec succès!");
        } catch (error) {
            showNotification("Une erreur est survenue.", "error");
        }
    };

    if (loading || status === 'loading') {
        return <div className="flex h-full items-center justify-center text-gray-400"><Loader2 className="h-8 w-8 animate-spin mr-3" /> KINT by Kyû</div>;
    }

    const totalAchievementsCount = Object.keys(allAchievements).length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 md:space-y-8"
            >
                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            <CheckCircle />
                            <span className="font-semibold">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <WelcomeHeader user={session?.user} server={serverInfo} />

                <div className="flex flex-col md:flex-row gap-6">
                    {stats && <StatCard icon={<Coins size={28} />} title="Pièces" value={stats.currency} rank={stats.currencyRank} color="bg-yellow-500/20 text-yellow-400" />}
                    {stats && <StatCard icon={<Star size={28} />} title="Expérience" value={stats.xp} rank={stats.xpRank} color="bg-green-500/20 text-green-400" />}
                    {stats && <StatCard icon={<Zap size={28} />} title="Points KINT" value={stats.points} rank={stats.pointsRank} color="bg-cyan-500/20 text-cyan-400" />}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap size={18} /> Historique des Points KINT sur 7 jours</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={kintHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(28, 34, 48, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.75rem',
                                            backdropFilter: 'blur(4px)'
                                        }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                        itemStyle={{ color: '#22d3ee' }}
                                    />
                                    <defs>
                                        <linearGradient id="kintPointsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="points" name="Points KINT" stroke="#22d3ee" strokeWidth={2} fill="url(#kintPointsGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                        {patchNotes && (
                            <Card>
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={18} /> {patchNotes.title}</h3>
                                <div className="space-y-4 text-gray-300">
                                    {patchNotes.ajouts?.length > 0 && <div><h4 className="font-semibold text-cyan-400 mb-2">Ajouts</h4><ul className="list-disc list-inside space-y-1 text-sm">{patchNotes.ajouts.map((note, i) => <li key={i}>{note}</li>)}</ul></div>}
                                    {patchNotes.ajustements?.length > 0 && <div><h4 className="font-semibold text-green-400 mb-2">Ajustements</h4><ul className="list-disc list-inside space-y-1 text-sm">{patchNotes.ajustements.map((note, i) => <li key={i}>{note}</li>)}</ul></div>}
                                </div>
                            </Card>
                        )}
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-500 to-amber-500 text-white"><Gift size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-white">Récompense Quotidienne</h3>
                                    <p className="text-sm text-gray-400">Réclamez 500 pièces !</p>
                                </div>
                            </div>
                            <button onClick={handleClaimReward} disabled={!claimStatus.canClaim || isClaiming} className={`w-full px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center ${!claimStatus.canClaim || isClaiming ? 'bg-gray-700/50 cursor-not-allowed text-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isClaiming && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                                {claimStatus.canClaim ? 'Réclamer' : `Prochaine dans ${claimStatus.timeLeft}`}
                            </button>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Gem size={18} /> Personnalisation</h3>
                            <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Titre Actuel</p>
                                    <p className="font-semibold text-white">{stats?.equippedTitle || 'Aucun'}</p>
                                </div>
                                <button onClick={() => setIsTitleModalOpen(true)} className="bg-cyan-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition">Changer</button>
                            </div>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Package size={18} /> Inventaire</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {inventory.length > 0 ? inventory.map(item => (
                                    <div key={item.id} className="flex items-center bg-gray-800/50 p-2 rounded-md">
                                        {item.icon ? <Image src={item.icon} alt={item.name} width={20} height={20} /> : <Gem size={20} className="text-gray-500" />}
                                        <span className="ml-3 flex-1 font-semibold truncate">{item.name}</span>
                                        <span className="text-xs font-bold bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full">x{item.quantity}</span>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 py-4">Votre inventaire est vide.</p>}
                            </div>
                        </Card>
                    </div>
                </div>

                <Card>
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy size={20} />Succès Débloqués ({unlockedSuccesses.length}/{totalAchievementsCount})</h2>
                    {unlockedSuccesses.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {unlockedSuccesses.map(successId => (
                                <div key={successId} className="bg-gray-800/50 p-3 rounded-lg text-center truncate group hover:bg-gray-700/70 transition-colors" title={allAchievements[successId]?.description || 'Succès secret'}>
                                    <p className="text-sm font-semibold text-white">{allAchievements[successId]?.name || successId}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 text-sm text-center py-8">Aucun succès débloqué.</p>}
                </Card>

                {isTitleModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1c222c] p-6 rounded-2xl border border-cyan-700 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-5">Changer de titre</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {availableTitles.length > 0 ? availableTitles.map(titre => (
                                    <label key={titre} className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                        <input type="radio" name="title" value={titre} checked={selectedTitle === titre} onChange={(e) => setSelectedTitle(e.target.value)} className="form-radio h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500 focus:ring-offset-0" />
                                        <span className="ml-4">{titre}</span>
                                    </label>
                                )) : <p className="text-gray-400 text-center py-4">Vous ne possédez aucun titre.</p>}
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button onClick={() => setIsTitleModalOpen(false)} className="px-5 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition">Annuler</button>
                                <button onClick={handleEquipTitle} className="px-5 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 font-bold transition">Équiper</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
            </motion.div>
        </AnimatePresence>
    );
}
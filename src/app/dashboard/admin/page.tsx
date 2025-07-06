'use client';

import { useState, useEffect, useRef, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// --- fetchCurrency et fetchPoints sont maintenant importés ---
import { getUsers, giveMoney, giveKip, restartBot, getBotLogs, getKintLogs, fetchCurrency, fetchPoints } from '@/utils/api'; 
import Image from 'next/image';
import { Power, RefreshCw, Shield, TrendingDown, TrendingUp, Users, Terminal, Zap, Coins, Search, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
type UserEntry = { id: string; username: string; avatar: string; };
type LogEntry = { timestamp: string; log: string; };
type KintLogEntry = {
    userId: string;
    username: string;
    amount: number;
    date: string;
    reason: string;
    type?: 'shield';
};
// --- Nouveau type pour les stats de l'utilisateur sélectionné ---
type SelectedUserStats = {
    currency: number | null;
    points: number | null;
};

// --- Composant Card (réutilisé du dashboard) ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl p-6 shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);


export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [moneyAmount, setMoneyAmount] = useState<number | ''>('');
    const [pointsAmount, setPointsAmount] = useState<number | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- Nouvel état pour les stats de l'utilisateur sélectionné ---
    const [selectedUserStats, setSelectedUserStats] = useState<SelectedUserStats>({ currency: null, points: null });
    const [loadingUserStats, setLoadingUserStats] = useState(false);

    const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
    const [loadingBotLogs, setLoadingBotLogs] = useState(true);
    const botLogsEndRef = useRef<HTMLDivElement>(null);

    const [kintLogs, setKintLogs] = useState<KintLogEntry[]>([]);
    const [loadingKintLogs, setLoadingKintLogs] = useState(true);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            getUsers().then(setUsers).catch(console.error).finally(() => setLoadingUsers(false));
            getKintLogs().then(setKintLogs).catch(console.error).finally(() => setLoadingKintLogs(false));
            const fetchBotLogs = () => {
                getBotLogs().then(data => setBotLogs(data.logs.reverse())).catch(console.error).finally(() => setLoadingBotLogs(false));
            };
            fetchBotLogs();
            const logInterval = setInterval(fetchBotLogs, 5000);
            return () => clearInterval(logInterval);
        }
    }, [status, session]);

    // --- NOUVEL EFFET : Récupère les stats quand un utilisateur est sélectionné ---
    useEffect(() => {
        if (selectedUser) {
            setLoadingUserStats(true);
            setSelectedUserStats({ currency: null, points: null }); // Reset
            Promise.all([
                fetchCurrency(selectedUser.id),
                fetchPoints(selectedUser.id)
            ]).then(([currencyData, pointsData]) => {
                setSelectedUserStats({
                    currency: currencyData.balance ?? 0,
                    points: pointsData.points ?? 0
                });
            }).catch(error => {
                console.error("Erreur de chargement des stats de l'utilisateur:", error);
                alert("Impossible de charger les stats de cet utilisateur.");
            }).finally(() => {
                setLoadingUserStats(false);
            });
        }
    }, [selectedUser]);
    
    useEffect(() => {
        botLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [botLogs]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    const handleStatAction = async (action: (userId: string, amount: number) => Promise<any>, amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(Number(amount)) : Number(amount);
        try {
            await action(selectedUser.id, finalAmount);
            alert(`Action réussie pour ${selectedUser.username}`);
            // Rafraîchir les données après l'action
            if (action === giveKip) {
                fetchPoints(selectedUser.id).then(data => setSelectedUserStats(prev => ({...prev, points: data.points ?? 0})));
                getKintLogs().then(setKintLogs);
            } else if (action === giveMoney) {
                 fetchCurrency(selectedUser.id).then(data => setSelectedUserStats(prev => ({...prev, currency: data.balance ?? 0})));
            }
        } catch (error) {
            alert(`Échec : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    const handleRestart = async () => {
        if (!confirm("Êtes-vous sûr de vouloir redémarrer le bot ?")) return;
        try {
            const res = await restartBot();
            alert(res.message);
        } catch (error) {
            alert(`Échec du redémarrage : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (status === 'loading') return <p className="text-center animate-pulse">Chargement...</p>;
    if (session?.user?.role !== 'admin') return null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-cyan-400">Panneau d'Administration</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRestart}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
                >
                    <Power className="h-5 w-5"/> Redémarrer le Bot
                </motion.button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users /> Gérer un utilisateur</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input
                                type="text"
                                placeholder="Rechercher un membre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#12151d] p-2 pl-10 rounded-md text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        {loadingUsers ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-cyan-600' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}>
                                        <Image src={user.avatar || '/default-avatar.png'} alt={user.username} width={40} height={40} className="rounded-full" />
                                        <span className="ml-3 font-medium">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {selectedUser && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <UserCheck /> Actions pour: <span className="text-cyan-400">{selectedUser.username}</span>
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-300 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><Coins size={16}/> Gérer l'Argent</span>
                                            {loadingUserStats ? <span className="text-xs text-gray-500">...</span> : <span className="font-bold text-yellow-400">{selectedUserStats.currency?.toLocaleString() ?? 'N/A'}</span>}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant..." value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction(giveMoney, moneyAmount)} className="px-3 bg-green-600 rounded-md font-semibold hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction(giveMoney, moneyAmount, true)} className="px-3 bg-red-600 rounded-md font-semibold hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-300 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><Zap size={16}/> Gérer les Points KINT</span>
                                             {loadingUserStats ? <span className="text-xs text-gray-500">...</span> : <span className="font-bold text-cyan-400">{selectedUserStats.points?.toLocaleString() ?? 'N/A'}</span>}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant..." value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction(giveKip, pointsAmount)} className="px-3 bg-green-600 rounded-md font-semibold hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction(giveKip, pointsAmount, true)} className="px-3 bg-red-600 rounded-md font-semibold hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                <div className="xl:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Terminal /> Logs du Bot <span className="text-xs text-gray-500">(Rafraîchissement auto)</span>
                        </h2>
                        {loadingBotLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[400px]">
                                {botLogs.length > 0 ? botLogs.map((log, index) => (
                                    <p key={index}><span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span><span className="ml-2">{log.log}</span></p>
                                )) : <p>Aucun log à afficher.</p>}
                                <div ref={botLogsEndRef} />
                            </div>
                        )}
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap /> Logs KINT (Transactions de points)</h2>
                        {loadingKintLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[400px]">
                                {kintLogs.length > 0 ? kintLogs.map((log, index) => (
                                    <div key={index} className="flex items-center gap-3 py-1 hover:bg-white/5 px-2 rounded">
                                        <span className="text-gray-500 flex-shrink-0">{new Date(log.date).toLocaleString('fr-FR')}</span>
                                        <span className="font-semibold text-cyan-400 w-32 truncate" title={log.username}>{log.username}</span>
                                        <span className="flex-grow flex items-center gap-1.5">
                                            {log.type === 'shield' ? <><Shield size={14} className="text-blue-400"/> {log.reason}</>
                                            : log.amount > 0 ? <><TrendingUp size={14} className="text-green-400"/> a gagné {log.amount} pts ({log.reason})</>
                                            : <><TrendingDown size={14} className="text-red-400"/> a perdu {Math.abs(log.amount)} pts ({log.reason})</>
                                            }
                                        </span>
                                    </div>
                                )) : <p>Aucun log KINT à afficher.</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
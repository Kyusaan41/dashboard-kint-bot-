'use client';

import { useState, useEffect, useRef, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Importez getDetailedKintLogs au lieu de getKintLogs
import { getUsers, giveMoney, giveKip, restartBot, getBotLogs, getDetailedKintLogs, fetchCurrency, fetchPoints } from '@/utils/api'; 
import Image from 'next/image';
import { Power, Shield, TrendingDown, TrendingUp, Users, Terminal, Zap, Coins, Search, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types (MIS À JOUR pour les logs détaillés) ---
type UserEntry = { id: string; username: string; avatar: string; };
type LogEntry = { timestamp: string; log: string; };

// Le type KintLogEntry est maintenant plus détaillé pour correspondre aux logs
type KintLogEntry = {
    userId: string;
    username: string;
    avatar?: string; // Ajouté si disponible dans les logs
    actionType: 'GAGNÉ' | 'PERDU'; // Ajouté
    points: number; // Renommé 'amount' en 'points' pour clarté
    currentBalance: number; // Ajouté
    effect?: string; // Ajouté
    date: string; // Date et heure de l'action
    reason: string; // Raison spécifique (ex: "Victoire", "Défaite Dashboard")
    source: 'Discord' | 'Dashboard'; // <-- NOUVELLE CLÉ IMPORTANTE
};
type SelectedUserStats = {
    currency: number | null;
    points: number | null;
};

// --- Composant Card ---
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
    
    const [selectedUserStats, setSelectedUserStats] = useState<SelectedUserStats>({ currency: null, points: null });
    const [loadingUserStats, setLoadingUserStats] = useState(false);

    const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
    const [loadingBotLogs, setLoadingBotLogs] = useState(true);
    const botLogsContainerRef = useRef<HTMLDivElement>(null);
    const botLogsEndRef = useRef<HTMLDivElement>(null);

    // Utilisez le nouveau type KintLogEntry
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
            
            // Appelle la nouvelle fonction pour les logs Kint détaillés
            getDetailedKintLogs()
                .then(data => {
                    // Trie les logs par date décroissante pour afficher les plus récents en premier
                    const sortedLogs = data.sort((a: KintLogEntry, b: KintLogEntry) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    setKintLogs(sortedLogs);
                })
                .catch(console.error)
                .finally(() => setLoadingKintLogs(false));
            
            const fetchBotLogs = () => {
                const container = botLogsContainerRef.current;
                const isScrolledToBottom = container ? container.scrollHeight - container.scrollTop <= container.clientHeight + 50 : true;

                getBotLogs()
                    .then(data => {
                        setBotLogs(data.logs.reverse());
                        if (isScrolledToBottom) {
                            setTimeout(() => {
                                botLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    })
                    .catch(console.error)
                    .finally(() => setLoadingBotLogs(false));
            };

            fetchBotLogs();
            const logInterval = setInterval(fetchBotLogs, 5000);
            return () => clearInterval(logInterval);
        }
    }, [status, session]);

    useEffect(() => {
        if (selectedUser) {
            setLoadingUserStats(true);
            setSelectedUserStats({ currency: null, points: null });
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
            if (action === giveKip) {
                fetchPoints(selectedUser.id).then(data => setSelectedUserStats(prev => ({...prev, points: data.points ?? 0})));
                // Pas besoin d'appeler getKintLogs ici, car le tableau se mettra à jour via l'intervalle si fetchData est appelée
                // ou via une refetch complète de getDetailedKintLogs si l'action donne des points.
                // NOTE: Si giveKip ne génère pas de log détaillé pour le moment, il n'apparaîtra pas ici.
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
                            <div ref={botLogsContainerRef} className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
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
                            <div className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
                                {kintLogs.length > 0 ? kintLogs.map((log, index) => {
                                    // Formatte la date comme "JJ/MM/AAAA HH:MM:SS"
                                    const formattedDate = new Date(log.date).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    });

                                    const actionSign = log.actionType === 'GAGNÉ' ? '+' : ''; // Pas de signe moins pour 'perdu', la valeur est déjà négative
                                    const actionColor = log.actionType === 'GAGNÉ' ? 'text-green-400' : 'text-red-400';
                                    const sourceColor = log.source === 'Discord' ? 'text-purple-400' : 'text-blue-400';


                                    return (
                                        <div key={index} className="flex flex-col gap-1 py-1 hover:bg-white/5 px-2 rounded">
                                            <span className="text-gray-500 flex-shrink-0">
                                                {formattedDate} {' '}
                                                <span className={`${sourceColor} font-semibold`}>
                                                    ({log.source})
                                                </span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {log.actionType === 'GAGNÉ' ? <TrendingUp size={14} className="text-green-400"/> : <TrendingDown size={14} className="text-red-400"/>}
                                                <span className="font-semibold text-white truncate" title={log.username}>
                                                    {log.username} {' '}
                                                    <span className={`${actionColor}`}>
                                                        a {log.actionType.toLowerCase()} {actionSign}{log.points} pts
                                                    </span>
                                                    {' '} ({log.reason})
                                                </span>
                                            </div>
                                            {log.effect && log.effect !== "Aucun effet" && (
                                                <span className="text-xs text-gray-500 ml-6">
                                                    Effet: {log.effect}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }) : <p>Aucun log KINT à afficher.</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
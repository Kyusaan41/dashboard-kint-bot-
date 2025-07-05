'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUsers, giveMoney, giveKip, restartBot, getBotLogs, getKintLogs } from '@/utils/api'; 
import Image from 'next/image';
import { Power, RefreshCw, Shield, TrendingDown, TrendingUp } from 'lucide-react';

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

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [moneyAmount, setMoneyAmount] = useState<number | ''>('');
    const [pointsAmount, setPointsAmount] = useState<number | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // State pour les logs du bot
    const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
    const [loadingBotLogs, setLoadingBotLogs] = useState(true);
    const botLogsEndRef = useRef<HTMLDivElement>(null);

    // State pour les logs KINT
    const [kintLogs, setKintLogs] = useState<KintLogEntry[]>([]);
    const [loadingKintLogs, setLoadingKintLogs] = useState(true);

    // Effet pour vérifier les permissions
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Effet pour charger toutes les données
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            getUsers()
                .then(setUsers)
                .catch(err => console.error("Erreur chargement utilisateurs:", err))
                .finally(() => setLoadingUsers(false));

            const fetchBotLogs = () => {
                getBotLogs()
                    .then(data => setBotLogs(data.logs.reverse())) 
                    .catch(err => console.error("Erreur chargement logs bot:", err))
                    .finally(() => setLoadingBotLogs(false));
            };
            fetchBotLogs();
            const logInterval = setInterval(fetchBotLogs, 5000);

            getKintLogs()
                .then(setKintLogs)
                .catch(err => console.error("Erreur chargement logs KINT:", err))
                .finally(() => setLoadingKintLogs(false));

            return () => clearInterval(logInterval);
        }
    }, [status, session]);
    
    // Effet pour scroller au bas des logs du bot
    useEffect(() => {
        botLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [botLogs]);

    // Liste des utilisateurs filtrée pour la recherche
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    // Gère les actions sur les stats (argent, points)
    const handleStatAction = async (action: (userId: string, amount: number) => Promise<any>, amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(Number(amount)) : Number(amount);
        try {
            await action(selectedUser.id, finalAmount);
            alert(`Action réussie pour ${selectedUser.username}`);
            // Recharger les logs KINT après une action sur les points
            if (action === giveKip) {
                getKintLogs().then(setKintLogs);
            }
        } catch (error) {
            alert(`Échec : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    // Gère le redémarrage du bot
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
    if (session?.user?.role !== 'admin') return <p className="text-center">Accès refusé.</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-cyan-400">Panneau d'Administration</h1>
                <button onClick={handleRestart} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105">
                    <Power className="h-5 w-5"/> Redémarrer le Bot
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- Colonne de gauche (Utilisateurs et Actions) --- */}
                <div className="space-y-6">
                    <div className="bg-[#1e2530] p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 p-2 rounded-md mb-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        {loadingUsers ? <p>Chargement...</p> : (
                            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedUser?.id === user.id ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                        <Image src={user.avatar || '/default-avatar.png'} alt={user.username} width={40} height={40} className="rounded-full" />
                                        <span className="ml-3">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedUser && (
                        <div className="bg-[#1e2530] p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">Actions pour : <span className="text-cyan-400">{selectedUser.username}</span></h2>
                            <div className="space-y-6 pt-2">
                                <div>
                                    <label className="block mb-2 font-medium">Gérer l'Argent</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Montant..." value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full bg-gray-800 p-2 rounded-md" />
                                        <button onClick={() => handleStatAction(giveMoney, moneyAmount)} className="px-4 bg-green-600 rounded-md font-semibold hover:bg-green-700">Ajouter</button>
                                        <button onClick={() => handleStatAction(giveMoney, moneyAmount, true)} className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-700">Enlever</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Gérer les Points KIP</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Montant..." value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full bg-gray-800 p-2 rounded-md" />
                                        <button onClick={() => handleStatAction(giveKip, pointsAmount)} className="px-4 bg-green-600 rounded-md font-semibold hover:bg-green-700">Ajouter</button>
                                        <button onClick={() => handleStatAction(giveKip, pointsAmount, true)} className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-700">Enlever</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Colonne de droite (Logs) --- */}
                <div className="space-y-6">
                    <div className="bg-[#12151d] p-6 rounded-lg border border-gray-700 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <RefreshCw className={`h-5 w-5 mr-2 ${loadingBotLogs ? 'animate-spin' : ''}`} /> Logs du Bot
                        </h2>
                        {loadingBotLogs ? <p>Chargement...</p> : (
                            <div className="flex-1 bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-96">
                                {botLogs.length > 0 ? botLogs.map((log, index) => (
                                    <p key={index} className="whitespace-pre-wrap break-all">
                                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                                        <span className="ml-2">{log.log}</span>
                                    </p>
                                )) : <p>Aucun log à afficher.</p>}
                                <div ref={botLogsEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="bg-[#12151d] p-6 rounded-lg border border-gray-700 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <RefreshCw className={`h-5 w-5 mr-2 ${loadingKintLogs ? 'animate-spin' : ''}`} /> Logs KINT
                        </h2>
                        {loadingKintLogs ? <p>Chargement...</p> : (
                            <div className="flex-1 bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-96">
                                {kintLogs.length > 0 ? kintLogs.map((log, index) => (
                                    <div key={index} className="flex items-center gap-3 py-1 hover:bg-white/5 px-2 rounded">
                                        <span className="text-gray-500 text-nowrap">{new Date(log.date).toLocaleTimeString('fr-FR')}</span>
                                        <span className="font-semibold text-cyan-400 w-32 truncate" title={log.username}>{log.username}</span>
                                        {log.type === 'shield' ? (
                                            <span className="flex items-center gap-1 text-blue-400"><Shield size={14}/> {log.reason}</span>
                                        ) : log.amount > 0 ? (
                                            <span className="flex items-center gap-1 text-green-400"><TrendingUp size={14}/> a gagné {log.amount} pts ({log.reason})</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-400"><TrendingDown size={14}/> a perdu {log.amount} pts ({log.reason})</span>
                                        )}
                                    </div>
                                )) : <p>Aucun log KINT à afficher.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
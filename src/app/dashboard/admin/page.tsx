"use client";

import { useState, useEffect, useRef, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUsers, restartBot, getBotLogs, getDetailedKintLogs, fetchCurrency, fetchPoints, updatePoints, updateCurrency } from '@/utils/api';
import Image from 'next/image';
import { Power, Shield, TrendingDown, TrendingUp, Users, Terminal, Zap, Coins, Search, UserCheck, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type UserEntry = { id: string; username: string; avatar: string; };
type LogEntry = { timestamp: string; log: string; };
type KintLogEntry = {
    userId: string;
    username: string;
    avatar?: string;
    actionType: 'GAGNÉ' | 'PERDU';
    points: number;
    currentBalance: number;
    effect?: string;
    date: string;
    reason: string;
    source: 'Discord' | 'Dashboard' | 'admin_dashboard';
};
type SelectedUserStats = {
    currency: number | null;
    points: number | null;
};
type Notification = { show: boolean; message: string; type: 'success' | 'error' };


// --- Composants UI ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl p-6 shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

const AnalysisRenderer: FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-3 text-sm text-gray-300">
            {lines.map((line, index) => {
                if (line.trim() === '') return null;
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
                if (/^\s*\d+\.\s/.test(line)) {
                    return <h3 key={index} className="text-base font-bold text-cyan-400 mt-4 first:mt-0" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\s*\d+\.\s/, '') }} />;
                }
                if (line.trim().startsWith('* ')) {
                    const listItemContent = formattedLine.trim().substring(1).trim();
                    return (
                        <div key={index} className="flex items-start pl-4">
                            <span className="mr-2 mt-1 text-cyan-500">&bull;</span>
                            <p dangerouslySetInnerHTML={{ __html: listItemContent }} />
                        </div>
                    );
                }
                return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
            })}
        </div>
    );
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

    const [selectedUserStats, setSelectedUserStats] = useState<SelectedUserStats>({ currency: null, points: null });
    const [loadingUserStats, setLoadingUserStats] = useState(false);

    const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
    const [loadingBotLogs, setLoadingBotLogs] = useState(true);
    const botLogsContainerRef = useRef<HTMLDivElement>(null);
    const botLogsEndRef = useRef<HTMLDivElement>(null);

    const [kintLogs, setKintLogs] = useState<KintLogEntry[]>([]);
    const [loadingKintLogs, setLoadingKintLogs] = useState(true);

    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    const refreshAllLogs = () => {
        getDetailedKintLogs()
            .then(data => {
                if (Array.isArray(data)) {
                    const sortedLogs = data.sort((a: KintLogEntry, b: KintLogEntry) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    setKintLogs(sortedLogs);
                } else {
                    setKintLogs([]);
                }
            })
            .catch(error => {
                setKintLogs([]);
            })
            .finally(() => setLoadingKintLogs(false));
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            getUsers().then(setUsers).catch(console.error).finally(() => setLoadingUsers(false));
            refreshAllLogs();

            const fetchBotLogs = () => {
                const container = botLogsContainerRef.current;
                const isScrolledToBottom = container ? Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 1 : true;

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
                showNotification("Impossible de charger les stats de cet utilisateur.", "error");
            }).finally(() => {
                setLoadingUserStats(false);
            });
        }
    }, [selectedUser]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    const handleStatAction = async (actionType: 'points' | 'currency', amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(Number(amount)) : Number(amount);
        const source = "admin_dashboard";

        setLoadingUserStats(true);
        try {
            if (actionType === 'points') {
                await updatePoints(selectedUser.id, finalAmount, source);
            } else if (actionType === 'currency') {
                await updateCurrency(selectedUser.id, finalAmount, source);
            }
            showNotification(`Profil de ${selectedUser.username} mis à jour !`);

            const updatedCurrencyData = await fetchCurrency(selectedUser.id);
            const updatedPointsData = await fetchPoints(selectedUser.id);
            setSelectedUserStats({
                currency: updatedCurrencyData.balance ?? 0,
                points: updatedPointsData.points ?? 0
            });
            refreshAllLogs();
        } catch (error) {
            showNotification(`Échec de la mise à jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        } finally {
            setLoadingUserStats(false);
        }
    };

    const handleRestart = async () => {
        if (!confirm("Êtes-vous sûr de vouloir redémarrer le bot ?")) return;
        try {
            const res = await restartBot();
            showNotification(res.message);
        } catch (error) {
            showNotification(`Échec du redémarrage : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const response = await fetch('/api/admin/analyze-logs');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "L'analyse a échoué avec le statut " + response.status);
            }
            setAnalysisResult(data.analysis);
        } catch (error) {
            showNotification(error instanceof Error ? error.message : 'Erreur de communication avec l\'API', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (status === 'loading') return <p className="text-center animate-pulse">Chargement...</p>;
    if (session?.user?.role !== 'admin') return null;

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 bg-green-600 text-white"
                    >
                        <CheckCircle />
                        <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                        <label className="flex items-center justify-between mb-2 font-medium text-gray-300">
                                            <span className="flex items-center gap-2"><Coins size={16}/> Gérer l'Argent</span>
                                            {loadingUserStats ? <span className="text-xs text-gray-500">...</span> : <span className="font-bold text-yellow-400">{selectedUserStats.currency?.toLocaleString() ?? 'N/A'}</span>}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant..." value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction('currency', moneyAmount)} className="px-3 bg-green-600 rounded-md font-semibold hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('currency', moneyAmount, true)} className="px-3 bg-red-600 rounded-md font-semibold hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center justify-between mb-2 font-medium text-gray-300">
                                            <span className="flex items-center gap-2"><Zap size={16}/> Gérer les Points KINT</span>
                                             {loadingUserStats ? <span className="text-xs text-gray-500">...</span> : <span className="font-bold text-cyan-400">{selectedUserStats.points?.toLocaleString() ?? 'N/A'}</span>}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant..." value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction('points', pointsAmount)} className="px-3 bg-green-600 rounded-md font-semibold hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('points', pointsAmount, true)} className="px-3 bg-red-600 rounded-md font-semibold hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                <div className="xl:col-span-2 space-y-8">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Terminal /> Logs du Bot <span className="text-xs text-gray-500">(Rafraîchissement auto)</span>
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAnalysis}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16}/>}
                                {isAnalyzing ? 'Analyse...' : 'Analyser la journée'}
                            </motion.button>
                        </div>
                        {loadingBotLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div ref={botLogsContainerRef} className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
                                {botLogs.length > 0 ? botLogs.map((log, index) => (
                                    <p key={index}><span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span><span className="ml-2">{log.log}</span></p>
                                )) : <p className="text-gray-500 text-center py-4">Aucun log à afficher.</p>}
                                <div ref={botLogsEndRef} />
                            </div>
                        )}
                    </Card>

                    <AnimatePresence>
                        {analysisResult && (
                             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Card>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400"><BrainCircuit /> Résumé de la journée</h2>
                                    <AnalysisRenderer content={analysisResult} />
                                </Card>
                             </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap /> Logs KINT (Transactions de points)</h2>
                        {loadingKintLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
                                {kintLogs.length > 0 ? kintLogs.map((log, index) => {
                                    const formattedDate = new Date(log.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                    const sourceColor = log.source === 'Discord' ? 'text-purple-400' : (log.source === 'admin_dashboard' ? 'text-yellow-500' : 'text-blue-400');
                                    
                                    const isKShieldLog = log.reason === 'Protégé par KShield';
                                    const Icon = isKShieldLog ? Shield : (log.actionType === 'GAGNÉ' ? TrendingUp : TrendingDown);
                                    const iconColor = isKShieldLog ? 'text-blue-400' : (log.actionType === 'GAGNÉ' ? 'text-green-500' : 'text-red-500');
                                    const textColor = isKShieldLog ? 'text-blue-300' : (log.actionType === 'GAGNÉ' ? 'text-green-400' : 'text-red-400');
                                    const actionSign = log.actionType === 'GAGNÉ' ? '+' : '-';
                                    const logText = isKShieldLog ? `a perdu ${log.points} pts` : `a ${log.actionType.toLowerCase()} ${actionSign}${log.points} pts`;

                                    return (
                                        <div key={index} className="flex flex-col gap-1 py-1 hover:bg-white/5 px-2 rounded">
                                            <span className="text-gray-500 flex-shrink-0">
                                                {formattedDate} {' '}
                                                <span className={`${sourceColor} font-semibold`}>
                                                    ({log.source === 'admin_dashboard' ? 'Admin' : log.source})
                                                </span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} className={iconColor}/>
                                                <span className="font-semibold text-white truncate" title={log.username}>
                                                    {log.username} {' '}
                                                    <span className={`${textColor}`}>
                                                        {logText}
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
                                }) : <p className="text-gray-500 text-center py-4">Aucun log KINT à afficher.</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
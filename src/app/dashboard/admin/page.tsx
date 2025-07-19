"use client";

import { useState, useEffect, useRef, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    getUsers, restartBot, getBotLogs, getDetailedKintLogs, fetchCurrency, 
    fetchPoints, updatePoints, updateCurrency, fetchEvents, createEvent, deleteEvent 
} from '@/utils/api';
import Image from 'next/image';
import { 
    Power, Shield, Users, Terminal, Zap, Coins, Search, UserCheck, 
    CheckCircle, BrainCircuit, Loader2, Calendar, PlusCircle, Trash2, TrendingUp, TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types (inchangés) ---
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
type EventEntry = { id: string; title: string; date: string; };

// --- COMPOSANTS UI ADAPTÉS AU THÈME ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`futuristic-card rounded-xl shadow-xl relative overflow-hidden group p-6 ${className}`}
    >
        <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
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
    
    // --- Logique métier (inchangée) ---
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

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    const [events, setEvents] = useState<EventEntry[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '' });

    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    const refreshEvents = () => {
        setLoadingEvents(true);
        fetchEvents().then(setEvents).catch(() => showNotification("Impossible de charger les événements.", "error")).finally(() => setLoadingEvents(false));
    };

    const refreshAllLogs = () => {
        setLoadingKintLogs(true);
        getDetailedKintLogs()
            .then(data => {
                if (Array.isArray(data)) {
                    const sortedLogs = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setKintLogs(sortedLogs);
                } else {
                    setKintLogs([]);
                }
            })
            .catch(() => setKintLogs([]))
            .finally(() => setLoadingKintLogs(false));
    };

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.role !== 'admin') {
                router.push('/dashboard');
            } else {
                getUsers().then(setUsers).catch(console.error).finally(() => setLoadingUsers(false));
                refreshEvents();
                refreshAllLogs();
                const fetchBotLogs = () => {
                  getBotLogs().then(data => setBotLogs(data.logs.reverse())).catch(console.error).finally(() => setLoadingBotLogs(false));
                };
                fetchBotLogs();
                const logInterval = setInterval(fetchBotLogs, 5000);
                return () => clearInterval(logInterval);
            }
        }
    }, [status, session, router]);
    
    useEffect(() => {
        if (selectedUser) {
            setLoadingUserStats(true);
            Promise.all([fetchCurrency(selectedUser.id), fetchPoints(selectedUser.id)])
                .then(([currencyData, pointsData]) => {
                    setSelectedUserStats({
                        currency: currencyData.balance ?? 0,
                        points: pointsData.points ?? 0
                    });
                })
                .catch(() => showNotification("Impossible de charger les stats de cet utilisateur.", "error"))
                .finally(() => setLoadingUserStats(false));
        }
    }, [selectedUser]);


    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    const handleStatAction = async (actionType: 'points' | 'currency', amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(Number(amount)) : Number(amount);
        setLoadingUserStats(true);
        try {
            if (actionType === 'points') await updatePoints(selectedUser.id, finalAmount, "admin_dashboard");
            else await updateCurrency(selectedUser.id, finalAmount, "admin_dashboard");
            showNotification(`Profil de ${selectedUser.username} mis à jour !`);
            const [currencyData, pointsData] = await Promise.all([fetchCurrency(selectedUser.id), fetchPoints(selectedUser.id)]);
            setSelectedUserStats({ currency: currencyData.balance ?? 0, points: pointsData.points ?? 0 });
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
            if (!response.ok) throw new Error(data.error || "L'analyse a échoué.");
            setAnalysisResult(data.analysis);
        } catch (error) {
            showNotification(error instanceof Error ? error.message : 'Erreur de communication avec l\'API', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time) {
            return showNotification("Veuillez remplir tous les champs de l'événement.", "error");
        }
        try {
            await createEvent({
                title: newEvent.title,
                description: newEvent.description,
                date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
                organizer: session?.user?.name || 'Admin'
            });
            showNotification("Événement créé avec succès !");
            setNewEvent({ title: '', description: '', date: '', time: '' });
            refreshEvents();
        } catch (error) {
            showNotification(`Échec de la création : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
        try {
            await deleteEvent(eventId);
            showNotification("Événement supprimé.");
            refreshEvents();
        } catch (error) {
            showNotification(`Échec de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    if (status === 'loading') return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-cyan-400" /></div>;
    if (session?.user?.role !== 'admin') return null;

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {notification.show && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <CheckCircle /> <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Shield/>Panneau d'Administration</h1>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRestart} className="futuristic-button bg-red-600/50 hover:bg-red-700/50">
                    <Power className="h-5 w-5"/> <span>Redémarrer le Bot</span>
                </motion.button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users /> Gérer un utilisateur</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full futuristic-input pl-10"/>
                        </div>
                        {loadingUsers ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-cyan-600/30' : 'bg-gray-800/50 hover:bg-white/5'}`}>
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
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserCheck /> Actions pour: <span className="text-cyan-400">{selectedUser.username}</span></h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center justify-between mb-2"><span className="flex items-center gap-2"><Coins size={16}/> Gérer l'Argent</span>{loadingUserStats ? '...' : <span className="font-bold text-yellow-400">{selectedUserStats.currency?.toLocaleString()}</span>}</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant" value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full futuristic-input" />
                                            <button onClick={() => handleStatAction('currency', moneyAmount)} className="px-3 bg-green-600 rounded-md hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('currency', moneyAmount, true)} className="px-3 bg-red-600 rounded-md hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center justify-between mb-2"><span className="flex items-center gap-2"><Zap size={16}/> Gérer les Points KINT</span>{loadingUserStats ? '...' : <span className="font-bold text-cyan-400">{selectedUserStats.points?.toLocaleString()}</span>}</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant" value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full futuristic-input" />
                                            <button onClick={() => handleStatAction('points', pointsAmount)} className="px-3 bg-green-600 rounded-md hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('points', pointsAmount, true)} className="px-3 bg-red-600 rounded-md hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                    
                     <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar /> Gérer les Événements</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4 p-4 bg-black/20 rounded-lg">
                            <input type="text" placeholder="Titre de l'événement" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full futuristic-input"/>
                            <textarea placeholder="Description..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full futuristic-input h-20"/>
                            <div className="flex gap-4">
                                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-1/2 futuristic-input"/>
                                <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-1/2 futuristic-input"/>
                            </div>
                            <button type="submit" className="w-full futuristic-button flex items-center justify-center gap-2"><PlusCircle size={18}/> Créer</button>
                        </form>
                        
                        <h3 className="text-lg font-bold my-4">Événements programmés</h3>
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                            {loadingEvents ? <p className="text-center text-gray-500">Chargement...</p> : events.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md">
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-xs text-gray-400">{new Date(event.date).toLocaleString('fr-FR')}</p>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Terminal /> Logs du Bot</h2>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAnalysis} disabled={isAnalyzing} className="futuristic-button text-sm p-2 flex items-center gap-2 disabled:opacity-50">
                                {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16}/>}
                                {isAnalyzing ? 'Analyse...' : 'Analyser'}
                            </motion.button>
                        </div>
                        {loadingBotLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div ref={botLogsContainerRef} className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
                                {botLogs.map((log, index) => (
                                    <p key={index}><span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span><span className="ml-2">{log.log}</span></p>
                                ))}
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
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap /> Logs KINT (Transactions)</h2>
                        {loadingKintLogs ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-[300px]">
                                {kintLogs.length > 0 ? kintLogs.map((log, index) => {
                                    const formattedDate = new Date(log.date).toLocaleString('fr-FR');
                                    const sourceColor = log.source === 'Discord' ? 'text-purple-400' : (log.source === 'admin_dashboard' ? 'text-yellow-500' : 'text-blue-400');
                                    const Icon = log.reason === 'Protégé par KShield' ? Shield : (log.actionType === 'GAGNÉ' ? TrendingUp : TrendingDown);
                                    const iconColor = log.reason === 'Protégé par KShield' ? 'text-blue-400' : (log.actionType === 'GAGNÉ' ? 'text-green-500' : 'text-red-500');
                                    const textColor = log.reason === 'Protégé par KShield' ? 'text-blue-300' : (log.actionType === 'GAGNÉ' ? 'text-green-400' : 'text-red-400');
                                    const actionSign = log.actionType === 'GAGNÉ' ? '+' : '-';
                                    const logText = log.reason === 'Protégé par KShield' ? `a perdu ${log.points} pts` : `a ${log.actionType.toLowerCase()} ${actionSign}${log.points} pts`;

                                    return (
                                        <div key={index} className="flex flex-col gap-1 py-1 hover:bg-white/5 px-2 rounded">
                                            <span className="text-gray-500">{formattedDate} <span className={`${sourceColor} font-semibold`}>({log.source === 'admin_dashboard' ? 'Admin' : log.source})</span></span>
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} className={iconColor}/>
                                                <span className="font-semibold text-white truncate" title={log.username}>{log.username} <span className={`${textColor}`}>{logText}</span> ({log.reason})</span>
                                            </div>
                                            {log.effect && log.effect !== "Aucun effet" && (<span className="text-xs text-gray-500 ml-6">Effet: {log.effect}</span>)}
                                        </div>
                                    );
                                }) : <p className="text-gray-500 text-center py-4">Aucun log KINT à afficher.</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <style jsx global>{`input[type="date"], input[type="time"] { color-scheme: dark; }`}</style>
        </div>
    );
}
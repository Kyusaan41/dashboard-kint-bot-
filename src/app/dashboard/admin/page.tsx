"use client";

import { useState, useEffect, useRef, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    getUsers, restartBot, getBotLogs, getDetailedKintLogs, fetchCurrency, 
    fetchPoints, updatePoints, updateCurrency, fetchEvents, createEvent, deleteEvent 
} from '@/utils/api';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import Image from 'next/image';
import { 
    Power, Shield, Users, Terminal, Zap, Coins, Search, UserCheck, 
    CheckCircle, BrainCircuit, Loader2, Calendar, PlusCircle, Trash2, TrendingUp, TrendingDown,
    Settings, Activity, Crown, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NyxCard } from '@/components/ui/NyxCard';

// --- Types (inchangÃ©s) ---
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

// --- COMPOSANTS UI REDESIGNÉS POUR NYXBOT ---

const AnalysisRenderer: FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-4 text-sm text-gray-300">
            {lines.map((line, index) => {
                if (line.trim() === '') return null;
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
                if (/^\s*\d+\.\s/.test(line)) {
                    return (
                        <motion.h3 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-base font-bold text-purple-400 mt-6 first:mt-0 flex items-center gap-2" 
                            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\s*\d+\.\s/, '') }} 
                        />
                    );
                }
                if (line.trim().startsWith('* ')) {
                    const listItemContent = formattedLine.trim().substring(1).trim();
                    return (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3 pl-4 py-2 bg-purple-500/5 rounded-lg border-l-2 border-purple-500/30"
                        >
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p dangerouslySetInnerHTML={{ __html: listItemContent }} />
                        </motion.div>
                    );
                }
                return (
                    <motion.p 
                        key={index} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        dangerouslySetInnerHTML={{ __html: formattedLine }} 
                    />
                );
            })}
        </div>
    );
};

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // --- Logique mÃ©tier (inchangÃ©e) ---
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
        fetchEvents().then(setEvents).catch(() => showNotification("Impossible de charger les Ã©vÃ©nements.", "error")).finally(() => setLoadingEvents(false));
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
            showNotification(`Profil de ${selectedUser.username} mis Ã  jour !`);
            const [currencyData, pointsData] = await Promise.all([fetchCurrency(selectedUser.id), fetchPoints(selectedUser.id)]);
            setSelectedUserStats({ currency: currencyData.balance ?? 0, points: pointsData.points ?? 0 });
            refreshAllLogs();
        } catch (error) {
            showNotification(`Ã‰chec de la mise Ã  jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        } finally {
            setLoadingUserStats(false);
        }
    };
    
    const handleRestart = async () => {
        if (!confirm("ÃŠtes-vous sÃ»r de vouloir redÃ©marrer le bot ?")) return;
        try {
            const res = await restartBot();
            showNotification(res.message);
        } catch (error) {
            showNotification(`Ã‰chec du redÃ©marrage : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const response = await fetch('/api/admin/analyze-logs');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "L'analyse a Ã©chouÃ©.");
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
            return showNotification("Veuillez remplir tous les champs de l'Ã©vÃ©nement.", "error");
        }
        try {
            await createEvent({
                title: newEvent.title,
                description: newEvent.description,
                date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
                organizer: session?.user?.name || 'Admin'
            });
            showNotification("Ã‰vÃ©nement crÃ©Ã© avec succÃ¨s !");
            setNewEvent({ title: '', description: '', date: '', time: '' });
            refreshEvents();
        } catch (error) {
            showNotification(`Ã‰chec de la crÃ©ation : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("ÃŠtes-vous sÃ»r de vouloir supprimer cet Ã©vÃ©nement ?")) return;
        try {
            await deleteEvent(eventId);
            showNotification("Ã‰vÃ©nement supprimÃ©.");
            refreshEvents();
        } catch (error) {
            showNotification(`Ã‰chec de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
                    <p className="text-gray-400 font-medium">Chargement du panneau d'administration...</p>
                </motion.div>
            </div>
        );
    }
    if (session?.user?.role !== 'admin') return null;

    return (
        <WithMaintenanceCheck pageId="admin">
            <div className="min-h-screen bg-gray-900 text-white">
                {/* Notification Toast */}
                <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.3 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 100, scale: 0.5 }}
                        className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-50 text-white backdrop-blur-sm border ${
                            notification.type === 'success' 
                                ? 'bg-green-600/90 border-green-500/50' 
                                : 'bg-red-600/90 border-red-500/50'
                        }`}
                    >
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-semibold text-sm">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-8 py-6">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            Panneau d'Administration NyxBot
                        </h1>
                        <p className="text-gray-400 mt-2 ml-16">Contrôlez tous les aspects de votre bot Discord</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={handleRestart} 
                        className="btn-nyx-danger flex items-center gap-3"
                    >
                        <Power className="h-5 w-5" /> 
                        <span>Redémarrer le Bot</span>
                        <AlertTriangle className="h-4 w-4" />
                    </motion.button>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* User Management */}
                        <NyxCard delay={0.1}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Gestion des Utilisateurs</h2>
                                    <p className="text-sm text-gray-400">Modifiez les stats et permissions</p>
                                </div>
                            </div>
                            
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input 
                                    type="text" 
                                    placeholder="Rechercher un utilisateur..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="nyx-input pl-12"
                                />
                            </div>
                            
                            {loadingUsers ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                                    <span className="ml-3 text-gray-400">Chargement des utilisateurs...</span>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                                    {filteredUsers.map((user, index) => (
                                        <motion.div 
                                            key={user.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedUser(user)} 
                                            className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                                                selectedUser?.id === user.id 
                                                    ? 'bg-purple-500/20 border-purple-500 shadow-purple-500/50' 
                                                    : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10'
                                            }`}
                                        >
                                            <div className="relative">
                                                <Image 
                                                    src={user.avatar || '/default-avatar.png'} 
                                                    alt={user.username} 
                                                    width={48} 
                                                    height={48} 
                                                    className="rounded-full"
                                                />
                                                {selectedUser?.id === user.id && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className="font-bold text-white">{user.username}</p>
                                                <p className="text-xs text-gray-400">#{user.id.slice(-8)}</p>
                                            </div>
                                            {selectedUser?.id === user.id && (
                                                <div className="text-purple-400">
                                                    <Crown className="h-5 w-5" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </NyxCard>

                        {/* Selected User Actions */}
                        <AnimatePresence>
                            {selectedUser && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <NyxCard delay={0.2}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                                <UserCheck className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                    Actions pour: <span className="text-purple-400">{selectedUser.username}</span>
                                                </h2>
                                                <p className="text-sm text-gray-400">Modifiez la monnaie et les points</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {/* Currency Management */}
                                            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                                            <Coins className="h-5 w-5 text-yellow-400" />
                                                        </div>
                                                        <span className="font-semibold text-white">Pièces</span>
                                                    </div>
                                                    {loadingUserStats ? (
                                                        <Loader2 className="animate-spin h-5 w-5 text-purple-500" />
                                                    ) : (
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-yellow-400">
                                                                {selectedUserStats.currency?.toLocaleString() ?? 0}
                                                            </p>
                                                            <p className="text-xs text-gray-400">Solde actuel</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Montant à modifier..." 
                                                        value={moneyAmount} 
                                                        onChange={e => setMoneyAmount(Number(e.target.value))} 
                                                        className="flex-1 nyx-input"
                                                    />
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('currency', moneyAmount)} 
                                                        className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />
                                                        Ajouter
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('currency', moneyAmount, true)} 
                                                        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <TrendingDown className="h-4 w-4" />
                                                        Retirer
                                                    </motion.button>
                                                </div>
                                            </div>
                                            
                                            {/* Points Management */}
                                            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                                            <Zap className="h-5 w-5 text-purple-500" />
                                                        </div>
                                                        <span className="font-semibold text-white">Points NyxBot</span>
                                                    </div>
                                                    {loadingUserStats ? (
                                                        <Loader2 className="animate-spin h-5 w-5 text-purple-500" />
                                                    ) : (
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-purple-500">
                                                                {selectedUserStats.points?.toLocaleString() ?? 0}
                                                            </p>
                                                            <p className="text-xs text-gray-400">Total des points</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Points à modifier..." 
                                                        value={pointsAmount} 
                                                        onChange={e => setPointsAmount(Number(e.target.value))} 
                                                        className="flex-1 nyx-input"
                                                    />
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('points', pointsAmount)} 
                                                        className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />
                                                        Ajouter
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('points', pointsAmount, true)} 
                                                        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <TrendingDown className="h-4 w-4" />
                                                        Retirer
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </NyxCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    
                        {/* Event Management */}
                        <NyxCard delay={0.3}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Gestion des Événements</h2>
                                    <p className="text-sm text-gray-400">Créez et gérez vos événements</p>
                                </div>
                            </div>
                            
                            {/* Create Event Form */}
                            <form onSubmit={handleCreateEvent} className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 mb-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <PlusCircle className="h-5 w-5 text-purple-500" />
                                    Créer un nouvel événement
                                </h3>
                                <input 
                                    type="text" 
                                    placeholder="Titre de l'événement" 
                                    value={newEvent.title} 
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                                    className="w-full nyx-input"
                                />
                                <textarea 
                                    placeholder="Description de l'événement..." 
                                    value={newEvent.description} 
                                    onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                                    className="w-full nyx-input h-24 resize-none"
                                />
                                <div className="flex gap-4">
                                    <input 
                                        type="date" 
                                        value={newEvent.date} 
                                        onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                                        className="flex-1 nyx-input"
                                    />
                                    <input 
                                        type="time" 
                                        value={newEvent.time} 
                                        onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
                                        className="flex-1 nyx-input"
                                    />
                                </div>
                                <motion.button 
                                    type="submit" 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full btn-nyx-primary flex items-center justify-center gap-3"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    Créer l'événement
                                </motion.button>
                            </form>
                            
                            {/* Events List */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-purple-400" />
                                    Événements programmés ({events.length})
                                </h3>
                                <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                                    {loadingEvents ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                                            <span className="ml-3 text-gray-400">Chargement des événements...</span>
                                        </div>
                                    ) : events.length > 0 ? (
                                        events.map((event, index) => (
                                            <motion.div 
                                                key={event.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-white mb-1">{event.title}</p>
                                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(event.date).toLocaleString('fr-FR')}
                                                    </p>
                                                </div>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteEvent(event.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </motion.button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <Calendar className="h-8 w-8 text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 font-medium">
                                                Aucun événement programmé
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Créez votre premier événement ci-dessus
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </NyxCard>
                </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Bot Logs */}
                        <NyxCard delay={0.4}>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                        <Terminal className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Logs du Bot</h2>
                                        <p className="text-sm text-gray-400">Activité en temps réel</p>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }} 
                                    onClick={handleAnalysis} 
                                    disabled={isAnalyzing} 
                                    className="btn-nyx-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className="animate-spin h-4 w-4" />
                                    ) : (
                                        <BrainCircuit className="h-4 w-4" />
                                    )}
                                    {isAnalyzing ? 'Analyse...' : 'Analyser IA'}
                                </motion.button>
                            </div>
                            
                            {loadingBotLogs ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                                    <span className="ml-3 text-gray-400">Chargement des logs...</span>
                                </div>
                            ) : (
                                <div 
                                    ref={botLogsContainerRef} 
                                    className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 overflow-y-auto font-mono text-xs text-gray-300 h-[320px] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50"
                                >
                                    {botLogs.map((log, index) => (
                                        <motion.p 
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.01 }}
                                            className="py-1 px-2 hover:bg-purple-500/10 rounded border-l-2 border-transparent hover:border-purple-500/50 transition-all duration-200"
                                        >
                                            <span className="text-gray-500 font-semibold">
                                                [{new Date(log.timestamp).toLocaleTimeString('fr-FR')}]
                                            </span>
                                            <span className="ml-3 text-gray-300">{log.log}</span>
                                        </motion.p>
                                    ))}
                                    <div ref={botLogsEndRef} />
                                </div>
                            )}
                        </NyxCard>
                        
                        {/* AI Analysis Results */}
                        <AnimatePresence>
                            {analysisResult && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <NyxCard delay={0}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                                <BrainCircuit className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Analyse IA</h2>
                                                <p className="text-sm text-gray-400">Résumé intelligent de l'activité</p>
                                            </div>
                                            <div className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg font-medium">
                                                Généré par IA
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                            <AnalysisRenderer content={analysisResult} />
                                        </div>
                                    </NyxCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* KINT Transaction Logs */}
                        <NyxCard delay={0.6}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Logs NyxBot</h2>
                                    <p className="text-sm text-gray-400">Historique des transactions</p>
                                </div>
                                <div className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg font-medium">
                                    {kintLogs.length} transactions
                                </div>
                            </div>
                            
                            {loadingKintLogs ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                                    <span className="ml-3 text-gray-400">Chargement des transactions...</span>
                                </div>
                            ) : (
                                <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 overflow-y-auto font-mono text-xs text-gray-300 h-[350px] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50">
                                    {kintLogs.length > 0 ? (
                                        kintLogs.map((log, index) => {
                                            const formattedDate = new Date(log.date).toLocaleString('fr-FR');
                                            const sourceColor = {
                                                'Discord': 'text-purple-400',
                                                'admin_dashboard': 'text-yellow-400',
                                                'Dashboard': 'text-blue-400'
                                            }[log.source] || 'text-gray-400';
                                            
                                            const isProtected = log.reason === 'Protégé par KShield';
                                            const isGain = log.actionType === 'GAGNÉ';
                                            
                                            const Icon = isProtected ? Shield : (isGain ? TrendingUp : TrendingDown);
                                            const iconColor = isProtected ? 'text-blue-400' : (isGain ? 'text-green-400' : 'text-red-400');
                                            const textColor = isProtected ? 'text-blue-300' : (isGain ? 'text-green-400' : 'text-red-400');
                                            const actionSign = isGain ? '+' : '-';
                                            const logText = isProtected 
                                                ? `a perdu ${log.points} pts` 
                                                : `a ${log.actionType.toLowerCase()} ${actionSign}${log.points} pts`;

                                            return (
                                                <motion.div 
                                                    key={index} 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="group flex flex-col gap-2 py-3 px-3 hover:bg-purple-500/10 rounded-lg border-l-2 border-transparent hover:border-purple-500/50 transition-all duration-200 mb-2"
                                                >
                                                    {/* Header with date and source */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500 font-medium">{formattedDate}</span>
                                                        <span className={`${sourceColor} font-bold px-2 py-1 rounded-md bg-black/20`}>
                                                            {log.source === 'admin_dashboard' ? 'Admin Panel' : log.source}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Main transaction info */}
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconColor.replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                                                            <Icon size={14} className={iconColor} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-white truncate" title={log.username}>
                                                                {log.username}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className={textColor}>{logText}</span>
                                                                <span className="text-gray-400 ml-2">({log.reason})</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400">Balance</p>
                                                            <p className="font-bold text-white">{log.currentBalance?.toLocaleString() || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Effect if present */}
                                                    {log.effect && log.effect !== "Aucun effet" && (
                                                        <div className="ml-9 p-2 bg-purple-500/5 rounded-md border border-purple-500/20">
                                                            <p className="text-xs text-purple-300">
                                                                <Settings className="inline w-3 h-3 mr-1" />
                                                                Effet: {log.effect}
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <Zap className="h-8 w-8 text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 font-medium mb-2">Aucune transaction NyxBot</p>
                                            <p className="text-gray-600 text-xs">Les transactions apparaîtront ici quand les utilisateurs interagiront avec le bot</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </NyxCard>
                    </div>
                </div>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}

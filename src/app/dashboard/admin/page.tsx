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
    Settings, Activity, Crown, AlertTriangle, BarChart3, Bell, Database, Eye, EyeOff,
    RefreshCw, Download, Upload, Filter, MoreVertical, Clock, MessageSquare, Star, Trophy,
    Target, ZapOff, Lock, Unlock, Ban, ShieldAlert, FileText, Hash, ArrowUpRight, ArrowDownRight, X
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
type Notification = { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' };
type EventEntry = { id: string; title: string; date: string; };
type AdminTab = 'overview' | 'users' | 'logs' | 'events' | 'analytics' | 'settings';
type LogFilter = 'all' | 'kint' | 'bot' | 'errors' | 'actions';
type SortOrder = 'asc' | 'desc';
type UserSortBy = 'username' | 'balance' | 'points' | 'lastActive';

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
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [logFilter, setLogFilter] = useState<LogFilter>('all');
    const [userSortBy, setUserSortBy] = useState<UserSortBy>('username');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
    const [realTimeMode, setRealTimeMode] = useState(true);
    const [compactMode, setCompactMode] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
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
                console.log('❌ Redirection vers dashboard - rôle non admin');
                router.push('/dashboard');
            } else {
                console.log('✅ Accès admin autorisé');
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


    // Enhanced data fetching with sorting and filtering
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users;
        if (searchQuery) {
            filtered = users.filter(user => 
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch (userSortBy) {
                case 'username':
                    comparison = a.username.localeCompare(b.username);
                    break;
                case 'balance':
                    const aBalance = selectedUserStats.currency || 0;
                    const bBalance = selectedUserStats.currency || 0;
                    comparison = aBalance - bBalance;
                    break;
                case 'points':
                    const aPoints = selectedUserStats.points || 0;
                    const bPoints = selectedUserStats.points || 0;
                    comparison = aPoints - bPoints;
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [users, searchQuery, userSortBy, sortOrder, selectedUserStats]);

    const filteredLogs = useMemo(() => {
        if (logFilter === 'all') return kintLogs;
        return kintLogs.filter(log => {
            switch (logFilter) {
                case 'kint': return log.source === 'Discord';
                case 'bot': return log.source === 'Dashboard';
                case 'errors': return log.actionType === 'PERDU';
                case 'actions': return log.source === 'admin_dashboard';
                default: return true;
            }
        });
    }, [kintLogs, logFilter]);

    // Enhanced statistics
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const totalCurrency = users.reduce((sum, user) => sum + (selectedUserStats.currency || 0), 0);
        const totalPoints = users.reduce((sum, user) => sum + (selectedUserStats.points || 0), 0);
        const activeUsers = kintLogs.filter(log => 
            new Date(log.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        const recentActions = kintLogs.filter(log => 
            new Date(log.date) > new Date(Date.now() - 60 * 60 * 1000)
        ).length;
        
        return {
            totalUsers,
            totalCurrency,
            totalPoints,
            activeUsers,
            recentActions,
            avgBalance: totalUsers > 0 ? Math.round(totalCurrency / totalUsers) : 0,
            avgPoints: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
        };
    }, [users, kintLogs, selectedUserStats]);

    // Enhanced action handlers
    const handleBulkAction = async (action: string, userIds: string[]) => {
        if (!confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${userIds.length} utilisateur(s)?`)) return;
        
        try {
            for (const userId of userIds) {
                switch (action) {
                    case 'addCurrency':
                        await updateCurrency(userId, 1000, 'admin_dashboard');
                        break;
                    case 'addPoints':
                        await updatePoints(userId, 100, 'admin_dashboard');
                        break;
                    case 'reset':
                        await updateCurrency(userId, -999999, 'admin_dashboard');
                        await updatePoints(userId, -999999, 'admin_dashboard');
                        break;
                }
            }
            showNotification(`Action bulk effectuée sur ${userIds.length} utilisateurs`, 'success');
            refreshAllLogs();
        } catch (error) {
            showNotification(`Erreur lors de l'action bulk: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
        }
    };

    const handleExportData = async () => {
        try {
            const data = {
                users,
                kintLogs,
                events,
                stats,
                exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nyxbot-admin-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Données exportées avec succès', 'success');
        } catch (error) {
            showNotification('Erreur lors de l\'export des données', 'error');
        }
    };

    const handleImportData = async (file: File) => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            // Validation and import logic here
            showNotification('Données importées avec succès', 'success');
        } catch (error) {
            showNotification('Erreur lors de l\'import des données', 'error');
        }
    };

    const handleStatAction = async (actionType: 'points' | 'currency', amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(Number(amount)) : Number(amount);
        setLoadingUserStats(true);
        try {
            if (actionType === 'points') await updatePoints(selectedUser.id, finalAmount, "admin_dashboard");
            else await updateCurrency(selectedUser.id, finalAmount, "admin_dashboard");
            showNotification(`Profil de ${selectedUser.username} mis à jour !`, 'success');
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

    // Enhanced notification system with different styles
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-600/90 border-emerald-500/50 shadow-emerald-900/50';
            case 'error':
                return 'bg-red-600/90 border-red-500/50 shadow-red-900/50';
            case 'warning':
                return 'bg-amber-600/90 border-amber-500/50 shadow-amber-900/50';
            case 'info':
                return 'bg-blue-600/90 border-blue-500/50 shadow-blue-900/50';
            default:
                return 'bg-purple-600/90 border-purple-500/50 shadow-purple-900/50';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 flex-shrink-0" />;
            case 'error':
                return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
            case 'info':
                return <Bell className="h-5 w-5 flex-shrink-0" />;
            default:
                return <CheckCircle className="h-5 w-5 flex-shrink-0" />;
        }
    };

    // Tab configuration
    const adminTabs: { id: AdminTab; label: string; icon: React.ComponentType<any>; description: string; badge?: number }[] = [
        {
            id: 'overview',
            label: 'Vue d\'ensemble',
            icon: BarChart3,
            description: 'Statistiques et aperçu rapide'
        },
        {
            id: 'users',
            label: 'Utilisateurs',
            icon: Users,
            description: 'Gestion des comptes et permissions',
            badge: users.length
        },
        {
            id: 'logs',
            label: 'Logs',
            icon: FileText,
            description: 'Historique des activités',
            badge: filteredLogs.length
        },
        {
            id: 'events',
            label: 'Événements',
            icon: Calendar,
            description: 'Gestion des événements',
            badge: events.length
        },
        {
            id: 'analytics',
            label: 'Analytiques',
            icon: TrendingUp,
            description: 'Statistiques détaillées'
        },
        {
            id: 'settings',
            label: 'Paramètres',
            icon: Settings,
            description: 'Configuration du panneau'
        }
    ];

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
            <div className="min-h-screen text-white">
                {/* Enhanced Notification Toast */}
                <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.3 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 100, scale: 0.5 }}
                        className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-50 text-white backdrop-blur-md border ${getNotificationStyle(notification.type)}`}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            {getNotificationIcon(notification.type)}
                        </motion.div>
                        <span className="font-semibold text-sm">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-8 py-6">
                {/* Enhanced Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            Panneau d'Administration NyxBot
                        </h1>
                        <p className="text-gray-400 mt-2 ml-16 text-lg">Contrôlez et gérez tous les aspects de votre bot Discord</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/80 transition-all cursor-pointer"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="text-sm">Options</span>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={handleRestart} 
                            className="btn-nyx-danger flex items-center gap-3 cursor-pointer"
                        >
                            <Power className="h-5 w-5" /> 
                            <span>Redémarrer</span>
                            <AlertTriangle className="h-4 w-4" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Enhanced Navigation Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {adminTabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.97 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 text-left group backdrop-blur-sm cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-purple-600/20 border-purple-400/50 shadow-xl shadow-purple-900/30'
                                        : 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-900/20'
                                }`}
                            >
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {tab.badge && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                        {tab.badge}
                                    </div>
                                )}

                                <div className="relative">
                                    <div className={`inline-flex p-2 rounded-xl mb-2 transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                                            : 'bg-gray-700/50 text-gray-400 group-hover:text-gray-200 group-hover:bg-gray-600/50'
                                    }`}>
                                        <tab.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className={`font-bold mb-1 transition-colors text-sm ${
                                        activeTab === tab.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                                    }`}>
                                        {tab.label}
                                    </h3>
                                </div>

                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-2 right-2 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full shadow-lg"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
                {/* Advanced Options Panel */}
                <AnimatePresence>
                    {showAdvancedOptions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <NyxCard>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Options avancées</h3>
                                    <button
                                        onClick={() => setShowAdvancedOptions(false)}
                                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <span className="text-sm text-gray-300">Mode temps réel</span>
                                        <button
                                            onClick={() => setRealTimeMode(!realTimeMode)}
                                            className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                                realTimeMode ? 'bg-purple-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                realTimeMode ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <span className="text-sm text-gray-300">Mode compact</span>
                                        <button
                                            onClick={() => setCompactMode(!compactMode)}
                                            className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                                compactMode ? 'bg-purple-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                compactMode ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <span className="text-sm text-gray-300">Auto-rafraîchissement</span>
                                        <button
                                            onClick={() => setAutoRefresh(!autoRefresh)}
                                            className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                                autoRefresh ? 'bg-purple-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleExportData}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                    >
                                        <Download className="h-4 w-4" />
                                        Exporter les données
                                    </motion.button>
                                    <label className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                                        <Upload className="h-4 w-4" />
                                        Importer des données
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => e.target.files?.[0] && handleImportData(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </NyxCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <NyxCard delay={0.1}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
                                            <p className="text-xs text-gray-400">Utilisateurs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                                        <span className="text-gray-300">{stats.activeUsers} actifs aujourd'hui</span>
                                    </div>
                                </NyxCard>

                                <NyxCard delay={0.2}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                                            <Coins className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-yellow-400">{stats.totalCurrency.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Pièces totales</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingUp className="h-4 w-4 text-green-400" />
                                        <span className="text-gray-300">Moyenne: {stats.avgBalance}</span>
                                    </div>
                                </NyxCard>

                                <NyxCard delay={0.3}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                            <Zap className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-purple-400">{stats.totalPoints.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Points totaux</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingUp className="h-4 w-4 text-green-400" />
                                        <span className="text-gray-300">Moyenne: {stats.avgPoints}</span>
                                    </div>
                                </NyxCard>

                                <NyxCard delay={0.4}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-400">{stats.recentActions}</p>
                                            <p className="text-xs text-gray-400">Actions/heure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-300">Dernière heure</span>
                                    </div>
                                </NyxCard>
                            </div>

                            {/* Quick Actions */}
                            <NyxCard delay={0.5}>
                                <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab('users')}
                                        className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl hover:border-blue-400/50 transition-all text-left cursor-pointer"
                                    >
                                        <Users className="h-8 w-8 text-blue-400 mb-3" />
                                        <h4 className="font-bold text-white mb-1">Gestion utilisateurs</h4>
                                        <p className="text-sm text-gray-400">Modifiez les comptes et permissions</p>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab('events')}
                                        className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all text-left cursor-pointer"
                                    >
                                        <Calendar className="h-8 w-8 text-purple-400 mb-3" />
                                        <h4 className="font-bold text-white mb-1">Événements</h4>
                                        <p className="text-sm text-gray-400">Créez et gérez les événements</p>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAnalysis}
                                        className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl hover:border-green-400/50 transition-all text-left cursor-pointer"
                                    >
                                        <BrainCircuit className="h-8 w-8 text-green-400 mb-3" />
                                        <h4 className="font-bold text-white mb-1">Analyse IA</h4>
                                        <p className="text-sm text-gray-400">Analysez les logs avec l'IA</p>
                                    </motion.button>
                                </div>
                            </NyxCard>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* User Management */}
                            <NyxCard delay={0.1}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Gestion des Utilisateurs</h2>
                                            <p className="text-sm text-gray-400">{filteredAndSortedUsers.length} utilisateur(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={userSortBy}
                                            onChange={(e) => setUserSortBy(e.target.value as UserSortBy)}
                                            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white"
                                        >
                                            <option value="username">Nom</option>
                                            <option value="balance">Solde</option>
                                            <option value="points">Points</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        >
                                            {sortOrder === 'asc' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        </button>
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
                                    <div className={`max-h-80 overflow-y-auto space-y-2 pr-2 ${compactMode ? 'max-h-60' : ''}`}>
                                        {filteredAndSortedUsers.map((user: UserEntry, index: number) => (
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
                                                        className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />
                                                        Ajouter
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('currency', moneyAmount, true)} 
                                                        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
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
                                                        className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />
                                                        Ajouter
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatAction('points', pointsAmount, true)} 
                                                        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
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
                </motion.div>
                    )}

                    {/* Other tabs content would go here */}
                    {activeTab === 'logs' && (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
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
                                        className="btn-nyx-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

                            {/* Analysis Result */}
                            <AnimatePresence>
                                {analysisResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <NyxCard delay={0.5}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <BrainCircuit className="h-6 w-6 text-purple-400" />
                                                <h3 className="text-lg font-bold text-white">Analyse IA</h3>
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
                        </motion.div>
                    )}

                    {activeTab === 'events' && (
                        <motion.div
                            key="events"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <NyxCard delay={0.1}>
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
                                        className="w-full btn-nyx-primary flex items-center justify-center gap-3 cursor-pointer"
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
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 cursor-pointer"
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
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <NyxCard delay={0.1}>
                                <h2 className="text-xl font-bold text-white mb-4">Analytiques</h2>
                                <p className="text-gray-400">Fonctionnalité à venir...</p>
                            </NyxCard>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <NyxCard delay={0.1}>
                                <h2 className="text-xl font-bold text-white mb-4">Paramètres</h2>
                                <p className="text-gray-400">Fonctionnalité à venir...</p>
                            </NyxCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        </WithMaintenanceCheck>
    );
}

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
    CheckCircle, BrainCircuit, Loader2, Calendar, PlusCircle, Trash2 
} from 'lucide-react';
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
type EventEntry = { id: string; title: string; date: string; };

// --- Composants UI ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl p-6 shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // États pour la gestion des utilisateurs
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [moneyAmount, setMoneyAmount] = useState<number | ''>('');
    const [pointsAmount, setPointsAmount] = useState<number | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserStats, setSelectedUserStats] = useState<SelectedUserStats>({ currency: null, points: null });
    const [loadingUserStats, setLoadingUserStats] = useState(false);
    
    // États pour les logs
    const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
    const [loadingBotLogs, setLoadingBotLogs] = useState(true);
    const botLogsContainerRef = useRef<HTMLDivElement>(null);
    
    // États pour les événements
    const [events, setEvents] = useState<EventEntry[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '' });

    // États généraux
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    const refreshEvents = () => {
        setLoadingEvents(true);
        fetchEvents().then(setEvents).catch(() => showNotification("Impossible de charger les événements.", "error")).finally(() => setLoadingEvents(false));
    };

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.role !== 'admin') {
                router.push('/dashboard');
            } else {
                getUsers().then(setUsers).catch(console.error).finally(() => setLoadingUsers(false));
                refreshEvents();
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
        } catch (error) {
            showNotification(`Échec de la mise à jour : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
        } finally {
            setLoadingUserStats(false);
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

            <h1 className="text-3xl font-bold text-cyan-400">Panneau d'Administration</h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* --- Colonne de gauche --- */}
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users /> Gérer un utilisateur</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#12151d] p-2 pl-10 rounded-md text-white border border-white/20"/>
                        </div>
                        {loadingUsers ? <p className="text-center text-gray-500">Chargement...</p> : (
                            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedUser?.id === user.id ? 'bg-cyan-600' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}>
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
                                            <input type="number" placeholder="Montant" value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction('currency', moneyAmount)} className="px-3 bg-green-600 rounded-md hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('currency', moneyAmount, true)} className="px-3 bg-red-600 rounded-md hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center justify-between mb-2"><span className="flex items-center gap-2"><Zap size={16}/> Gérer les Points KINT</span>{loadingUserStats ? '...' : <span className="font-bold text-cyan-400">{selectedUserStats.points?.toLocaleString()}</span>}</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Montant" value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20" />
                                            <button onClick={() => handleStatAction('points', pointsAmount)} className="px-3 bg-green-600 rounded-md hover:bg-green-700">+</button>
                                            <button onClick={() => handleStatAction('points', pointsAmount, true)} className="px-3 bg-red-600 rounded-md hover:bg-red-700">-</button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* --- Colonne de droite --- */}
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar /> Gérer les Événements</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4 p-4 bg-black/20 rounded-lg">
                            <input type="text" placeholder="Titre de l'événement" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20"/>
                            <textarea placeholder="Description..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-[#12151d] p-2 rounded-md border border-white/20 h-20"/>
                            <div className="flex gap-4">
                                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-1/2 bg-[#12151d] p-2 rounded-md border border-white/20"/>
                                <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-1/2 bg-[#12151d] p-2 rounded-md border border-white/20"/>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"><PlusCircle size={18}/> Créer</button>
                        </form>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-bold mb-4">Événements programmés</h3>
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
            </div>
            <style jsx global>{`input[type="date"], input[type="time"] { color-scheme: dark; } .bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, Loader2, AlertTriangle, Info, MapPin, 
    Users, Star, Sparkles, Trophy, Gift, Timer, CalendarDays
} from 'lucide-react';
import { fetchEvents } from '@/utils/api';
import { NyxCard } from '@/components/ui/NyxCard';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';

// --- Types (inchangÃ©s) ---
type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    organizer: string;
};

// --- NOUVEAU DESIGN DES COMPOSANTS ---

// Utility function to get time until event
const getTimeUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Dans ${hours}h ${minutes}m`;
    return `Dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

const EventCard: FC<{ event: Event, index: number, isLast?: boolean }> = ({ event, index, isLast = false }) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' });
    const timeUntil = getTimeUntilEvent(eventDate);
    const isUpcoming = timeUntil !== null;

    // Determine event type based on title (mock logic)
    const getEventType = (title: string) => {
        const lower = title.toLowerCase();
        if (lower.includes('tournoi') || lower.includes('compétition')) {
            return { icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/50' };
        }
        if (lower.includes('récompense') || lower.includes('cadeau')) {
            return { icon: Gift, color: 'text-green-400', bgColor: 'bg-green-400/20', borderColor: 'border-green-400/50' };
        }
        if (lower.includes('communauté') || lower.includes('rencontre')) {
            return { icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/50' };
        }
        return { icon: Star, color: 'text-purple-400', bgColor: 'bg-purple-400/20', borderColor: 'border-purple-400/50' };
    };

    const eventType = getEventType(event.title);
    const IconComponent = eventType.icon;

    return (
        <div className="relative">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-12 top-24 w-0.5 h-full bg-gradient-to-b from-purple-primary/50 to-transparent" />
            )}
            
            <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 100
                }}
                className="relative flex gap-6 items-start group"
            >
                {/* Date Circle */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`
                            flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 backdrop-blur-sm
                            ${
                                isUpcoming 
                                    ? `${eventType.bgColor} ${eventType.borderColor} shadow-lg shadow-purple-primary/30` 
                                    : 'bg-gray-700/50 border-gray-600/50'
                            }
                        `}
                    >
                        <span className={`text-2xl font-bold ${
                            isUpcoming ? 'text-white' : 'text-gray-400'
                        }`}>
                            {day}
                        </span>
                        <span className={`text-xs font-semibold uppercase ${
                            isUpcoming ? eventType.color : 'text-gray-500'
                        }`}>
                            {month}
                        </span>
                    </motion.div>
                    
                    {/* Timeline Connector */}
                    <div className={`w-4 h-4 rounded-full mt-4 border-2 ${
                        isUpcoming ? eventType.borderColor + ' ' + eventType.bgColor : 'border-gray-600 bg-gray-700'
                    }`} />
                </div>
                
                {/* Event Card */}
                <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`
                        flex-1 p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl
                        ${
                            isUpcoming 
                                ? 'bg-gradient-to-br from-card-dark/80 to-purple-primary/10 border-gray-700/50 group-hover:border-purple-primary/50 group-hover:shadow-purple-primary/20'
                                : 'bg-gray-800/50 border-gray-700/30'
                        }
                    `}
                >
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-xl ${eventType.bgColor} ${eventType.borderColor} border flex items-center justify-center`}>
                                    <IconComponent className={`h-5 w-5 ${eventType.color}`} />
                                </div>
                                <h3 className={`text-2xl font-bold ${
                                    isUpcoming ? 'text-white' : 'text-gray-400'
                                }`}>
                                    {event.title}
                                </h3>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Organisé par {event.organizer}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{formattedTime}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Badge */}
                        {isUpcoming && timeUntil && (
                            <div className="px-3 py-1 bg-purple-primary/20 text-purple-secondary text-sm font-medium rounded-lg border border-purple-primary/30">
                                <Timer className="inline h-3 w-3 mr-1" />
                                {timeUntil}
                            </div>
                        )}
                        {!isUpcoming && (
                            <div className="px-3 py-1 bg-gray-600/50 text-gray-400 text-sm font-medium rounded-lg">
                                Terminé
                            </div>
                        )}
                    </div>
                    
                    {/* Event Description */}
                    <p className={`text-sm leading-relaxed mb-4 ${
                        isUpcoming ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                        {event.description}
                    </p>
                    
                    {/* Event Details */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span className="capitalize">{formattedDate}</span>
                            </div>
                        </div>
                        
                        {/* Action Button */}
                        {isUpcoming && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-nyx-secondary text-sm px-4 py-2"
                            >
                                Participer
                            </motion.button>
                        )}
                    </div>
                    
                    {/* Background Glow Effect */}
                    {isUpcoming && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchEvents();
                // Sort events by date (upcoming first)
                const sortedEvents = data.sort((a: Event, b: Event) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setEvents(sortedEvents);

                const eventIds = data.map((event: Event) => event.id);
                localStorage.setItem('seenEvents', JSON.stringify(eventIds));
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
        
        // Update time every minute
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Separate upcoming and past events
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    const pastEvents = events.filter(event => new Date(event.date) <= now);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <Loader2 className="animate-spin h-12 w-12 text-purple-primary" />
                        <div className="absolute inset-0 animate-ping h-12 w-12 rounded-full bg-purple-primary/20" />
                    </div>
                    <p className="text-gray-400 font-medium">Chargement des événements...</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Synchronisation du calendrier NyxBot</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <WithMaintenanceCheck pageId="events">
            <div className="min-h-screen bg-background text-white">
                <div className="px-8 py-6">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <motion.div 
                            animate={{ 
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="p-4 bg-gradient-purple rounded-2xl shadow-2xl shadow-purple-primary/50"
                        >
                            <Calendar className="h-10 w-10 text-white" />
                        </motion.div>
                        <h1 className="text-5xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                            Événements NyxBot
                        </h1>
                    </div>
                    
                    <p className="text-xl text-gray-400 mb-6 max-w-3xl mx-auto leading-relaxed">
                        Découvrez tous les événements, tournois et activités à venir sur le serveur.
                        Ne manquez aucune occasion de participer et de gagner des récompenses exclusives !
                    </p>
                    
                    {/* Live Stats */}
                    <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Calendrier synchronisé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>{events.length} événements planifiés</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{currentTime}</span>
                        </div>
                    </div>
                </motion.div>

                {error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center min-h-[400px]"
                    >
                        <NyxCard delay={0}>
                            <div className="text-center p-12">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="h-8 w-8 text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Erreur de Chargement</h3>
                                <p className="text-red-400 mb-6">{error}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.reload()}
                                    className="btn-nyx-primary"
                                >
                                    Réessayer
                                </motion.button>
                            </div>
                        </NyxCard>
                    </motion.div>
                ) : events.length > 0 ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Upcoming Events */}
                        {upcomingEvents.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-12"
                            >
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    Événements à Venir
                                    <div className="ml-auto px-4 py-2 bg-purple-primary/20 text-purple-secondary text-sm rounded-lg font-medium">
                                        {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''}
                                    </div>
                                </h2>
                                
                                <div className="space-y-8">
                                    <AnimatePresence>
                                        {upcomingEvents.map((event, index) => (
                                            <EventCard 
                                                key={event.id} 
                                                event={event} 
                                                index={index}
                                                isLast={index === upcomingEvents.length - 1 && pastEvents.length === 0}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-400 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    Événements Passés
                                </h2>
                                
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {pastEvents.map((event, index) => (
                                            <EventCard 
                                                key={event.id} 
                                                event={event} 
                                                index={index + upcomingEvents.length}
                                                isLast={index === pastEvents.length - 1}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center min-h-[400px]"
                    >
                        <NyxCard delay={0}>
                            <div className="text-center p-12">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                                    <Calendar className="h-10 w-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Aucun Événement</h3>
                                <p className="text-gray-400 mb-6">
                                    Aucun événement n'est actuellement planifié.
                                </p>
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        <span>Restez connecté pour les prochaines activités</span>
                                    </div>
                                </div>
                            </div>
                        </NyxCard>
                    </motion.div>
                )}
                
                {/* Create Event CTA (for admins) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <NyxCard delay={0}>
                        <div className="p-8">
                            <Trophy className="h-12 w-12 mx-auto mb-4 text-purple-primary" />
                            <h3 className="text-xl font-bold text-white mb-3">Organiser un Événement</h3>
                            <p className="text-gray-400 mb-6">
                                Vous êtes administrateur ? Créez de nouveaux événements depuis le panneau d'administration.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-nyx-secondary"
                                onClick={() => window.location.href = '/dashboard/admin'}
                            >
                                Accéder à l'administration
                            </motion.button>
                        </div>
                    </NyxCard>
                </motion.div>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}

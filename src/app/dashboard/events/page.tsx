'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Loader2, AlertTriangle, Info } from 'lucide-react';
import { fetchEvents } from '@/utils/api';

// --- Types ---
type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    organizer: string;
};

// --- Composants UI ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10 p-6">{children}</div>
    </div>
);

const EventCard: FC<{ event: Event, index: number }> = ({ event, index }) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="h-full flex flex-col">
                <h3 className="text-xl font-bold text-cyan-400">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-4">Organisé par : {event.organizer}</p>
                <p className="text-gray-300 flex-grow">{event.description}</p>
                <div className="mt-6 border-t border-white/10 pt-4 flex justify-between items-center text-gray-400">
                    <div className="flex items-center gap-2"><Calendar size={16} /><span className="font-semibold">{formattedDate}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} /><span className="font-semibold">{formattedTime}</span></div>
                </div>
            </Card>
        </motion.div>
    );
};

// --- La Page Principale ---
export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchEvents();
                setEvents(data);

                // ▼▼▼ CORRECTION ICI ▼▼▼
                // On précise le type de la variable "event" pour aider TypeScript.
                const eventIds = data.map((event: Event) => event.id);
                localStorage.setItem('seenEvents', JSON.stringify(eventIds));
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Calendar /> Événements à Venir</h1>
                <p className="text-gray-400 mt-1">Consultez le programme des prochaines activités du serveur.</p>
            </motion.div>

            {error ? (
                <Card className="text-center text-red-400 flex items-center justify-center gap-3"><AlertTriangle /> {error}</Card>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {events.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <Card className="text-center text-gray-500 flex items-center justify-center gap-3"><Info /> Aucun événement n'est prévu pour le moment.</Card>
            )}
            
             <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}
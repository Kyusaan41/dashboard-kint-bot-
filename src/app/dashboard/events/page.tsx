'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Loader2, AlertTriangle, Info } from 'lucide-react';
import { fetchEvents } from '@/utils/api';

// --- Types (inchangés) ---
type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    organizer: string;
};

// --- NOUVEAU DESIGN DES COMPOSANTS ---

const EventCard: FC<{ event: Event, index: number }> = ({ event, index }) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="futuristic-card flex gap-6 p-6 items-start"
        >
            <div className="flex flex-col items-center justify-center w-20 h-20 bg-cyan-600/20 border border-cyan-500/50 rounded-lg flex-shrink-0">
                <span className="text-3xl font-bold text-white">{day}</span>
                <span className="text-sm font-semibold text-cyan-300 uppercase">{month}</span>
            </div>
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-cyan-400">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-3">Par {event.organizer} à {formattedTime}</p>
                <p className="text-gray-300">{event.description}</p>
            </div>
        </motion.div>
    );
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchEvents();
                setEvents(data);

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
                <div className="futuristic-card text-center text-red-400 flex items-center justify-center gap-3 p-6"><AlertTriangle /> {error}</div>
            ) : events.length > 0 ? (
                <div className="space-y-6">
                    <AnimatePresence>
                        {events.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="futuristic-card text-center text-gray-500 flex items-center justify-center gap-3 p-12"><Info /> Aucun événement n'est prévu pour le moment.</div>
            )}
        </div>
    );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useEffect, useState } from 'react';
import { subscribeToItemEvents, fetchEvents } from '@/utils/api';
import InteractionPopup from '@/components/InteractionPopup';

// --- Types ---
type ItemUsedEvent = {
  interactionId: string;
  itemId: string;
  itemName: string;
  fromUser: { id: string; username: string; };
  champName?: string;
};
type EventEntry = { id: string; };

const pages = [
  { id: '', label: 'Accueil' },
  { id: 'events', label: 'Événements' },
  { id: 'mini-jeu', label: 'Mini-Jeux' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'classement', label: 'Classement' },
  { id: 'admin', label: 'Admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [interactionEvent, setInteractionEvent] = useState<ItemUsedEvent | null>(null);
  const [hasNewEvents, setHasNewEvents] = useState(false);

  // ... (toute votre logique useEffect existante reste la même)
  useEffect(() => {
    if (status === 'authenticated') {
      const checkEvents = async () => {
        try {
          const currentEvents = await fetchEvents();
          const seenEvents = JSON.parse(localStorage.getItem('seenEvents') || '[]');
          const isNew = currentEvents.some((event: EventEntry) => !seenEvents.includes(event.id));
          setHasNewEvents(isNew);
        } catch (error) { console.error("Impossible de vérifier les nouveaux événements:", error); }
      };
      checkEvents();
      const interval = setInterval(checkEvents, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);
  
  useEffect(() => {
    if (session?.user?.id) {
        const unsubscribe = subscribeToItemEvents(session.user.id, (data) => {
            if (data.type === 'interaction_request') setInteractionEvent(data.payload);
            else if (data.type === 'new_event_created') setHasNewEvents(true);
        });
        return () => unsubscribe();
    }
  }, [session]);
  
  useEffect(() => {
    if (pathname.endsWith('/events')) {
      setHasNewEvents(false);
    }
  }, [pathname]);

  const handleInteractionResponse = async (accepted: boolean) => {
      if (!interactionEvent) return;
      try {
          await fetch('/api/interaction-response', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ interactionId: interactionEvent.interactionId, accepted: accepted }),
          });
      } catch (error) { console.error(error); }
      setInteractionEvent(null);
  };
  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '').split(',').map(id => id.trim());
  const getAvatarUrl = () => {
    if (!session?.user?.id) return '/default-avatar.png';
    const defaultDiscordAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.id.slice(-1)) % 5}.png`;
    return session.user.image ?? defaultDiscordAvatar;
  };
  const filteredPages = pages.filter(page => page.id !== 'admin' || (session?.user?.id && adminIds.includes(session.user.id)));

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0d13]"><p className="animate-pulse text-white">Chargement...</p></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d13] text-white">
      <InteractionPopup event={interactionEvent} onResponse={handleInteractionResponse} />
      
      {/* ▼▼▼ MODIFICATION ICI ▼▼▼ */}
      {/* On s'assure que la barre latérale prend toute la hauteur et reste fixe */}
      <aside className="w-64 bg-[#12151d] p-6 border-r border-cyan-700/20 flex flex-col h-screen sticky top-0">
        <div>
          {session && (
            <div className="flex items-center space-x-4 mb-10">
              <Image src={getAvatarUrl()} alt="Avatar" width={56} height={56} className="w-14 h-14 rounded-full border-2 border-cyan-500 shadow-md" />
              <div className="truncate max-w-[calc(100%-70px)]">
                <p className="font-semibold text-cyan-400 truncate">{session.user.name}</p>
                <p className="text-sm text-gray-400">Connecté</p>
              </div>
            </div>
          )}
          <nav className="flex flex-col space-y-3">
            {filteredPages.map((page) => {
              const isActive = pathname === `/dashboard/${page.id}` || (page.id === '' && pathname === '/dashboard');
              const showNotification = page.id === 'events' && hasNewEvents;

              return (
                <button key={page.id} onClick={() => router.push(`/dashboard/${page.id}`)} className={`relative w-full text-left px-5 py-3 rounded-lg font-medium transition ${isActive ? (page.id === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'bg-cyan-600 text-white shadow-md') : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  {page.label}
                  {showNotification && (
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#12151d]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ▼▼▼ MODIFICATION ICI ▼▼▼ */}
        {/* On ajoute "mt-auto" pour pousser cet élément tout en bas de son conteneur flex */}
        <div className="mt-auto">
            {session && (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold">
                  Déconnexion
              </button>
            )}
        </div>
      </aside>
      
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-y-auto">
        {children}
      </main>
      <FeedbackWidget />
    </div>
  );
}
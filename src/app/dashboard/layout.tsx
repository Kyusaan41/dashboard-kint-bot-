'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useEffect, useState } from 'react';
import { subscribeToItemEvents, fetchEvents } from '@/utils/api';
import InteractionPopup from '@/components/InteractionPopup';
import { LogOut, Home, CalendarRange, BarChart2, ShoppingCart, Settings, Shield } from 'lucide-react';

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
  { id: '', label: 'Accueil', icon: Home },
  { id: 'events', label: 'Évenements', icon: CalendarRange },
  { id: 'classement', label: 'Classement', icon: BarChart2 },
  { id: 'shop', label: 'Magasin', icon: ShoppingCart },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [interactionEvent, setInteractionEvent] = useState<ItemUsedEvent | null>(null);
  const [hasNewEvents, setHasNewEvents] = useState(false);

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
  
  const filteredPages = pages.filter(page => !page.adminOnly || (session?.user?.id && adminIds.includes(session.user.id)));

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><p className="animate-pulse">Chargement...</p></div>;
  }

  return (
    <div className="flex min-h-screen text-white">
      <InteractionPopup event={interactionEvent} onResponse={handleInteractionResponse} />
      
      <aside className="w-20 hover:w-64 transition-all duration-300 ease-in-out bg-[rgba(18,18,24,0.8)] border-r border-white/10 flex flex-col h-screen sticky top-0 group">
        <div className="p-4 flex items-center gap-4 border-b border-white/10">
          {session && (
            <>
              <Image src={getAvatarUrl()} alt="Avatar" width={48} height={48} className="rounded-full border-2 border-cyan-500 shadow-md flex-shrink-0" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                <p className="font-semibold text-cyan-400 truncate">{session.user.name}</p>
                <p className="text-sm text-gray-400">Connecté</p>
              </div>
            </>
          )}
        </div>
        
        <nav className="flex flex-col space-y-2 mt-4 flex-grow px-4">
            {filteredPages.map((page) => {
              const isActive = pathname === `/dashboard/${page.id}` || (page.id === '' && pathname === '/dashboard');
              const showNotification = page.id === 'events' && hasNewEvents;

              return (
                <button 
                    key={page.id} 
                    onClick={() => router.push(`/dashboard/${page.id}`)} 
                    className={`w-full flex items-center gap-4 p-3 rounded-lg font-medium transition-colors duration-200 ${isActive ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                  <page.icon className="flex-shrink-0 h-6 w-6" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">{page.label}</span>
                  {showNotification && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
        </nav>

        <div className="p-4 border-t border-white/10">
            {session && (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-4 p-3 rounded-lg font-medium text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors duration-200">
                  <LogOut className="flex-shrink-0 h-6 w-6"/>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">Déconnexion</span>
              </button>
            )}
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-10 max-w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <FeedbackWidget />
    </div>
  );
}
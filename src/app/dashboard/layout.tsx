'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useEffect, useState } from 'react';
import { subscribeToItemEvents, fetchEvents } from '@/utils/api';
import InteractionPopup from '@/components/InteractionPopup';
import { LogOut, Home, CalendarRange, BarChart2, ShoppingCart, Shield, GamepadIcon } from 'lucide-react';

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
  { id: 'mini-jeu', label: 'Mini-Jeux', icon: GamepadIcon },
  { id: 'classement', label: 'Classement', icon: BarChart2 },
  { id: 'boutique', label: 'Magasin', icon: ShoppingCart },
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
        } catch (error) {
          console.error("Erreur lors de la vérification des événements :", error);
        }
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
        body: JSON.stringify({ interactionId: interactionEvent.interactionId, accepted }),
      });
    } catch (error) {
      console.error(error);
    }
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d13]">
        <p className="animate-pulse text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d13] text-white">
      <InteractionPopup event={interactionEvent} onResponse={handleInteractionResponse} />

      <aside className="w-[70px] hover:w-72 transition-all duration-500 bg-[#0d1117]/80 backdrop-blur-xl border-r border-white/[0.02] flex flex-col h-screen sticky top-0 group">
        {/* Profil utilisateur */}
        <div className="p-4 flex items-center gap-3">
          {session && (
            <>
              <div className="relative">
                <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                  <Image 
                    src={getAvatarUrl()} 
                    alt="Avatar" 
                    width={38} 
                    height={38} 
                    className="rounded-[10px] object-cover" 
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0d1117]"></div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden pl-1">
                <p className="font-semibold text-sm tracking-wide truncate">{session.user.name}</p>
                <p className="text-[11px] text-cyan-400">connecté</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-auto opacity-0 group-hover:opacity-100 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {filteredPages.map((page) => {
            const isActive = pathname === `/dashboard/${page.id}` || (page.id === '' && pathname === '/dashboard');
            const showNotification = page.id === 'events' && hasNewEvents;

            return (
              <button
                key={page.id}
                onClick={() => router.push(`/dashboard/${page.id}`)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium 
                  transition-all duration-300 relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <page.icon size={18} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 truncate">
                  {page.label}
                </span>
                {showNotification && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="border-t border-white/5 pt-3 flex items-center justify-center">
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] backdrop-blur">
                <p className="text-[10px] font-medium text-gray-400">
                  KINT DASHBOARD
                  <span className="block text-center mt-0.5 text-cyan-500/50 font-mono">v2.10 by Kyû</span>
                </p>
              </div>
            </div>
          </div>
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

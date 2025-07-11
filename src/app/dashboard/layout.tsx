// src/app/dashboard/layout.tsx

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useEffect, useState } from 'react';
import { subscribeToItemEvents } from '@/utils/api';
import InteractionPopup from '@/components/InteractionPopup'; // Importer notre nouveau composant

// Le type pour l'événement
type ItemUsedEvent = {
  interactionId: string;
  itemId: string;
  itemName: string;
  fromUser: {
      id: string;
      username: string;
  };
  champName?: string;
};

const pages = [
  { id: '', label: 'Accueil' },

  { id: 'mini-jeu', label: 'Mini-Jeux' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'classement', label: 'Classement' },
  { id: 'admin', label: 'Admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // NOUVEAU : État pour gérer la popup au niveau global
  const [interactionEvent, setInteractionEvent] = useState<ItemUsedEvent | null>(null);

  useEffect(() => {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
    if (isMaintenanceMode && status === 'authenticated') {
      signOut({ callbackUrl: '/login' });
    }
  }, [status]);

  // NOUVEAU : Logique d'écoute SSE globale
  useEffect(() => {
    if (session?.user?.id) {
        console.log(`[Layout] Connexion au flux SSE pour l'utilisateur: ${session.user.id}`);
        const unsubscribe = subscribeToItemEvents(session.user.id, (data) => {
            if (data.type === 'interaction_request') {
                setInteractionEvent(data.payload);
            }
        });

        return () => {
            console.log("[Layout] Fermeture de la connexion SSE.");
            unsubscribe();
        };
    }
  }, [session]);

  const handleInteractionResponse = async (accepted: boolean) => {
      if (!interactionEvent) return;
      try {
          const response = await fetch('/api/interaction-response', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  interactionId: interactionEvent.interactionId,
                  accepted: accepted
              }),
          });
          if (!response.ok) {
              throw new Error("La réponse à l'interaction a échoué.");
          }
          // On pourrait afficher une notif de succès ici si besoin
      } catch (error) {
          console.error(error);
          alert(error instanceof Error ? error.message : "Une erreur est survenue.");
      }
      setInteractionEvent(null);
  };

  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '').split(',').map(id => id.trim());

  const getAvatarUrl = () => {
    if (!session?.user?.id) return '/default-avatar.png';
    const defaultDiscordAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.id.slice(-1)) % 5}.png`;
    return session.user.image ?? defaultDiscordAvatar;
  };

  const filteredPages = pages.filter(page => {
    if (page.id === 'admin') {
      if (!session?.user?.id) return false;
      return adminIds.includes(session.user.id);
    }
    return true;
  });

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d13] text-white">
        <p className="animate-pulse">Chargement de la session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d13] text-white">
      {/* NOUVEAU : On affiche la popup ici pour qu'elle soit globale */}
      <InteractionPopup event={interactionEvent} onResponse={handleInteractionResponse} />
      
      <aside className="w-64 bg-[#12151d] p-6 border-r border-cyan-700/20 flex flex-col justify-between">
        <div>
          {session && (
            <div className="flex items-center space-x-4 mb-10">
              <Image src={getAvatarUrl()} alt="Avatar utilisateur" width={56} height={56} className="w-14 h-14 rounded-full border-2 border-cyan-500 shadow-md" />
              <div className="truncate max-w-[calc(100%-70px)]">
                <p className="font-semibold text-cyan-400 truncate">{session.user.name}</p>
                <p className="text-sm text-gray-400">Connecté</p>
              </div>
            </div>
          )}
          <nav className="flex flex-col space-y-3">
            {filteredPages.map((page) => {
              const isActive = pathname === `/dashboard/${page.id}` || (page.id === '' && pathname === '/dashboard');
              return (
                <button key={page.id} onClick={() => router.push(`/dashboard/${page.id}`)} className={`w-full text-left px-5 py-3 rounded-lg font-medium transition ${isActive ? (page.id === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'bg-cyan-600 text-white shadow-md') : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`} aria-current={isActive ? 'page' : undefined}>
                  {page.label}
                </button>
              );
            })}
          </nav>
        </div>
        {session && (
          <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-6 w-full px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold">
            Déconnexion
          </button>
        )}
      </aside>
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-auto">
        {children}
      </main>
      <FeedbackWidget />
    </div>
  );
}
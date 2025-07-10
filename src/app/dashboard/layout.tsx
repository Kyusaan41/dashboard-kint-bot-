'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useEffect } from 'react'; // 1. Importer useEffect

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

  // --- 2. Logique de déconnexion en cas de maintenance ---
  useEffect(() => {
    // On lit la variable d'environnement de maintenance
    const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';

    // Si le mode maintenance est actif ET que l'utilisateur est connecté
    if (isMaintenanceMode && status === 'authenticated') {
      // On force la déconnexion. NextAuth le redirigera vers la page de connexion,
      // qui affichera alors l'écran de maintenance.
      signOut({ callbackUrl: '/login' });
    }
    // On exécute cet effet à chaque fois que le statut de la session change
  }, [status]);
  // --- Fin de la logique de maintenance ---


  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '')
    .split(',')
    .map(id => id.trim());

  const getAvatarUrl = () => {
    if (!session?.user?.id) {
      return '/default-avatar.png'; 
    }
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
      {/* Barre Latérale (Sidebar) */}
      <aside className="w-64 bg-[#12151d] p-6 border-r border-cyan-700/20 flex flex-col justify-between">
        <div>
          {session && (
            <div className="flex items-center space-x-4 mb-10">
              <Image
                src={getAvatarUrl()}
                alt="Avatar utilisateur"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full border-2 border-cyan-500 shadow-md"
              />
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
                <button
                  key={page.id}
                  onClick={() => router.push(`/dashboard/${page.id}`)}
                  className={`w-full text-left px-5 py-3 rounded-lg font-medium transition ${
                    isActive
                      ? page.id === 'admin'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-cyan-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page.label}
                </button>
              );
            })}
          </nav>
        </div>

        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-6 w-full px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold"
          >
            Déconnexion
          </button>
        )}
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-auto">
        {children}
      </main>

      <FeedbackWidget />

    </div>
  );
}
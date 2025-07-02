'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image'; // Important: Importer le composant Image

// Il n'est plus nécessaire d'importer useState et useEffect pour l'avatar

const pages = [
  { id: '', label: 'Accueil' },
  { id: 'mini-jeu', label: 'Mini-Jeux' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'classement', label: 'Classement' },
  { id: 'admin', label: 'Admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // On supprime le useState et le useEffect

  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '')
    .split(',')
    .map(id => id.trim());

  const filteredPages = pages.filter(page => {
    if (page.id === 'admin') {
      if (!session?.user?.id) return false;
      return adminIds.includes(session.user.id);
    }
    return true;
  });

  // On calcule l'URL de l'avatar directement ici
  const getAvatarUrl = () => {
    if (!session?.user) return '/default-avatar.png'; // Un avatar par défaut en cas de non session
    const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.id) % 5}.png`;
    return session.user.image ?? defaultAvatar;
  };

  return (
    <div className="flex min-h-screen bg-[#0b0d13] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#12151d] p-6 border-r border-cyan-700 flex flex-col justify-between">
        <div>
          {session && (
            <div className="flex items-center space-x-4 mb-10">
              {/* --- CORRECTION ICI --- */}
              {/* On utilise le composant Image de Next.js */}
              <Image
                src={getAvatarUrl()}
                alt="Avatar utilisateur"
                width={56}  // La taille en pixels (w-14)
                height={56} // La taille en pixels (h-14)
                className="rounded-full border-2 border-cyan-500 shadow-md"
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
                  className={`w-full text-left px-5 py-3 rounded-lg font-medium transition 
                    ${
                      isActive
                        ? page.id === 'admin'
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-cyan-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-cyan-700 hover:text-white'
                    }
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bouton Déconnexion */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-6 w-full px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Déconnexion
          </button>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-auto">
        {children}
      </main>
    </div>
  );
}
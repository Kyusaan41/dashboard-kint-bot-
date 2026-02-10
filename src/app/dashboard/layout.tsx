'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import FeedbackWidget from '@/components/FeedbackWidget';
import RoleGranter from '@/components/RoleGranter';
import { useEffect, useState } from 'react';
import { subscribeToItemEvents, fetchEvents } from '@/utils/api';
import InteractionPopup from '@/components/InteractionPopup';
import WarningModal from '@/components/WarningModal';
import { LogOut, Home, CalendarRange, BarChart2, ShoppingCart, Shield, GamepadIcon, Bot, Sparkles, Settings, User, Store, Menu, X, Trophy } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeedInsights } from "@vercel/speed-insights/next"

type ItemUsedEvent = {
  interactionId: string;
  itemId: string;
  itemName: string;
  fromUser: { id: string; username: string; };
  champName?: string;
};
type EventEntry = { id: string; };
type PageType = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
};

const pages: PageType[] = [
  { id: '', label: 'Dashboard', icon: Home },
  { id: 'events', label: 'Événements', icon: CalendarRange },
  { id: 'mini-jeu', label: 'Mini-Jeux', icon: GamepadIcon },
  { id: 'season-pass', label: 'Season Pass', icon: Trophy },
  { id: 'classement', label: 'Classements', icon: BarChart2 },
  { id: 'boutique', label: 'Boutique', icon: ShoppingCart },
  { id: 'market', label: 'Marché', icon: Store },
  { id: 'admin', label: 'Administration', icon: Shield, adminOnly: true },
  { id: 'super-admin', label: 'Haute Administration', icon: Shield, superAdminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { currentTheme, themeConfig } = useTheme();

  const [interactionEvent, setInteractionEvent] = useState<ItemUsedEvent | null>(null);
  const [hasNewEvents, setHasNewEvents] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const checkEvents = async () => {
        try {
          const currentEvents = await fetchEvents();
          const seenEvents = JSON.parse(localStorage.getItem('seenEvents') || '[]');
          const isNew = currentEvents.some((event: EventEntry) => !seenEvents.includes(event.id));
          setHasNewEvents(isNew);
        } catch (error) {
          console.error("Erreur lors de la vÃ©rification des Ã©vÃ©nements :", error);
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
  const superAdminIds = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim());
  const getAvatarUrl = () => {
    if (!session?.user?.id) return '/default-avatar.png';
    const defaultDiscordAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.id.slice(-1)) % 5}.png`;
    return session.user.image ?? defaultDiscordAvatar;
  };
  const filteredPages = pages.filter(page => {
    if (page.superAdminOnly && session?.user?.id) {
      return superAdminIds.includes(session.user.id);
    }
    if (page.adminOnly && session?.user?.id) {
      return adminIds.includes(session.user.id);
    }
    return !page.adminOnly && !page.superAdminOnly;
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-nyx flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="nyx-spinner mb-4"></div>
          <p className="text-gray-300 text-lg">NyxBot Dashboard se charge...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nyx">
      <InteractionPopup event={interactionEvent} onResponse={handleInteractionResponse} />
      <WarningModal />

      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-primary)',
          boxShadow: '0 0 10px var(--theme-primary)30'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isMobileSidebarOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} style={{ color: 'var(--theme-text)' }} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} style={{ color: 'var(--theme-text)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 group
          ${isMobileSidebarOpen ? 'w-80' : 'w-20 hover:w-80'}
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        initial={false}
      >
        <div className="h-full nyx-card-glass backdrop-blur-xl border-r" style={{ borderColor: 'var(--theme-primary)' }}>
          {/* Header avec logo NyxBot */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--theme-primary)' }}>
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: 'var(--theme-gradient)',
                  boxShadow: '0 0 15px var(--theme-primary)40'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bot size={24} className="text-white" />
              </motion.div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gradient-purple">NyxBot</h1>
                  {themeConfig.icons?.mascot && (
                    <span className="text-sm animate-pulse" style={{ color: 'var(--theme-accent)' }}>
                      {themeConfig.icons.mascot}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Profil utilisateur */}
          <div className="p-4 border-b border-purple-primary/10">
            {session && (
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl p-[2px] transition-all duration-300"
                    style={{
                      background: 'var(--theme-gradient)',
                      boxShadow: '0 0 10px var(--theme-primary)30'
                    }}
                  >
                    <Image
                      src={getAvatarUrl()}
                      alt="Avatar"
                      width={44}
                      height={44}
                      className="rounded-[10px] object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--success)',
                      borderColor: 'var(--theme-surface)'
                    }}
                  ></div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{session.user.name}</p>
                  <p className="text-xs text-purple-secondary">En ligne</p>
                </div>
                <motion.button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredPages.map((page, index) => {
              const isActive = pathname === `/dashboard/${page.id}` || (page.id === '' && pathname === '/dashboard');
              const showNotification = page.id === 'events' && hasNewEvents;

              return (
                <motion.button
                  key={page.id}
                  onClick={() => {
                    router.push(`/dashboard/${page.id}`);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group/item
                    ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                    }`}
                  style={{
                    background: isActive ? 'var(--theme-gradient)' : undefined,
                    boxShadow: isActive ? '0 0 20px var(--theme-primary)40' : undefined,
                  }}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className={`transition-transform duration-200 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover/item:scale-105'}`}
                    whileHover={{ rotate: isActive ? 0 : 5 }}
                  >
                    <page.icon size={20} />
                  </motion.div>
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 truncate">
                    {page.label}
                  </span>
                  {showNotification && (
                    <motion.span 
                      className="absolute right-3 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
                      style={{ backgroundColor: 'var(--theme-accent)' }}
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--theme-primary)' }}>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-400/10">
                  <Sparkles size={12} className="text-purple-secondary" />
                  <span className="text-xs font-medium text-purple-secondary">
                    NyxBot Dashboard
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  v3.0 • NyxBot créé par Kyû 💜
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="md:pl-20">
        <motion.main 
          className="min-h-screen p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>

      <FeedbackWidget />
      <RoleGranter />
    </div>
  );
}

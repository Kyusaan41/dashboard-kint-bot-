'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Flame, TreePine, Cherry } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEMES, ThemeType } from '@/config/themes';

import { getCurrentSeason } from '@/config/themes';

// Fonction pour déterminer le thème saisonnier automatique
const getSeasonalTheme = (): ThemeType => {
  return getCurrentSeason();
};

const THEME_ICONS: Record<ThemeType, React.ComponentType<any>> = {
  default: Palette,
  halloween: Flame,
  christmas: TreePine,
  'chinese-new-year': Cherry,
  spring: Cherry,
  summer: () => <span>☀️</span>,
  autumn: () => <span>🍂</span>,
  winter: () => <span>❄️</span>,
};

export function ThemeSelector() {
  const { currentTheme, setTheme, isAutoTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleThemeSelect = (isSeasonal: boolean) => {
    if (isSeasonal) {
      // Mode saisonnier automatique
      setTheme(null); // null = automatique
    } else {
      // Mode classique
      setTheme('default');
    }
    setIsOpen(false);
  };

  // Déterminer l'icône et le nom à afficher
  const getCurrentDisplay = () => {
    if (isAutoTheme) {
      const seasonalTheme = getSeasonalTheme();
      const seasonalConfig = THEMES[seasonalTheme];
      const SeasonalIcon = THEME_ICONS[seasonalTheme];
      return {
        icon: SeasonalIcon,
        name: `Saisonnier (${seasonalConfig.displayName})`,
        isSeasonal: true
      };
    } else {
      return {
        icon: Palette,
        name: 'Classique',
        isSeasonal: false
      };
    }
  };

  const { icon: CurrentIcon, name: currentName, isSeasonal: currentIsSeasonal } = getCurrentDisplay();

  return (
    <div className="relative">
      {/* Bouton principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-nyx-secondary flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CurrentIcon size={18} className="text-white" />
        </motion.div>
        <span className="text-sm text-white font-semibold">
          {currentName}
        </span>

        {currentIsSeasonal && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={12} className="text-yellow-400" />
          </motion.div>
        )}
      </motion.button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="fixed w-80 max-w-[calc(100vw-2rem)] bg-gray-950/95 backdrop-blur-xl rounded-xl border border-purple-400/60 shadow-2xl shadow-purple-900/70 z-[60] overflow-hidden"
              style={{
                top: 'auto',
                left: 'auto',
                right: '1rem',
                bottom: '1rem'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Palette size={18} className="text-purple-400" />
                  Choix du thème
                </h3>

                <div className="space-y-2">
                  {/* Option Classique */}
                  <motion.button
                    onClick={() => handleThemeSelect(false)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      !isAutoTheme
                        ? 'bg-purple-600/30 border border-purple-300 text-purple-100 shadow-inner'
                        : 'bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-gray-200 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Palette size={18} className={!isAutoTheme ? 'text-purple-200' : 'text-gray-300'} />
                    <div className="text-left">
                      <div className="font-semibold">Classique</div>
                      <div className="text-xs opacity-80">Thème par défaut stable</div>
                    </div>
                    {!isAutoTheme && (
                      <div className="ml-auto w-2.5 h-2.5 bg-purple-300 rounded-full animate-pulse" />
                    )}
                  </motion.button>

                  {/* Option Saisonnier */}
                  <motion.button
                    onClick={() => handleThemeSelect(true)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      isAutoTheme
                        ? 'bg-purple-600/30 border border-purple-300 text-purple-100 shadow-inner'
                        : 'bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-gray-200 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={18} className={isAutoTheme ? 'text-yellow-300' : 'text-gray-300'} />
                    <div className="text-left">
                      <div className="font-semibold">Saisonnier</div>
                      <div className="text-xs opacity-80">Change automatiquement selon la période</div>
                    </div>
                    {isAutoTheme && (
                      <div className="ml-auto w-2.5 h-2.5 bg-purple-300 rounded-full animate-pulse" />
                    )}
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
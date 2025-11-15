'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Snowflake, Flame, TreePine, Cherry, Sun, Leaf } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEMES, ThemeType } from '@/config/themes';

const THEME_ICONS: Record<ThemeType, React.ComponentType<any>> = {
  default: Palette,
  halloween: Flame,
  christmas: TreePine,
  'chinese-new-year': Cherry,
  spring: Cherry,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

export function ThemeSelector() {
  const { currentTheme, setTheme, isAutoTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleThemeSelect = (theme: ThemeType | null) => {
    setTheme(theme);
    setIsOpen(false);
  };

  const currentThemeConfig = THEMES[currentTheme];
  const CurrentIcon = THEME_ICONS[currentTheme];

  return (
    <div className="relative">
      {/* Bouton principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CurrentIcon size={16} className="text-purple-400" />
        </motion.div>
        <span className="text-sm text-white font-medium">
          {currentThemeConfig.displayName}
        </span>
        {isAutoTheme && (
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
              className="absolute top-full mt-2 right-0 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Palette size={18} className="text-purple-400" />
                  Thèmes Saisonniers
                </h3>

                <div className="space-y-2">
                  {/* Option automatique */}
                  <motion.button
                    onClick={() => handleThemeSelect(null)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      isAutoTheme
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={16} className={isAutoTheme ? 'text-purple-400' : 'text-gray-400'} />
                    <div className="text-left">
                      <div className="font-medium">Automatique</div>
                      <div className="text-xs opacity-75">Change selon la saison</div>
                    </div>
                    {isAutoTheme && (
                      <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </motion.button>

                  {/* Séparateur */}
                  <div className="border-t border-gray-700/50 my-3" />

                  {/* Thèmes manuels */}
                  {Object.entries(THEMES).map(([themeKey, themeConfig]) => {
                    const Icon = THEME_ICONS[themeKey as ThemeType];
                    const isSelected = !isAutoTheme && currentTheme === themeKey;

                    return (
                      <motion.button
                        key={themeKey}
                        onClick={() => handleThemeSelect(themeKey as ThemeType)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/50 text-purple-300'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon size={16} className={isSelected ? 'text-purple-400' : 'text-gray-400'} />
                        <div className="text-left">
                          <div className="font-medium">{themeConfig.displayName}</div>
                          {themeConfig.effects && (
                            <div className="text-xs opacity-75 flex gap-1">
                              {themeConfig.effects.snow && <Snowflake size={10} />}
                              {themeConfig.effects.particles && <Sparkles size={10} />}
                              {themeConfig.effects.animatedBg && <div className="w-1 h-1 bg-current rounded-full animate-pulse" />}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400 text-center">
                    🎨 Tous les thèmes sont gratuits !
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, TestTube } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEMES, ThemeType } from '@/config/themes';

export function ThemeTester() {
  const { currentTheme, setTheme, themeConfig } = useTheme();

  const handleThemeTest = (theme: ThemeType) => {
    setTheme(theme);
  };

  const handleResetToAuto = () => {
    setTheme(null); // null = automatique
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="nyx-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${themeConfig.colors.primary ? '' : 'bg-gradient-to-br from-purple-500 to-purple-600'} flex items-center justify-center shadow-lg`}
             style={{ background: themeConfig.colors.gradient }}>
          <TestTube size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">Testeur de Thèmes</h3>
          <p className="text-sm text-gray-400">Testez rapidement tous les thèmes saisonniers</p>
        </div>
      </div>

      {/* Thème actuel */}
      <div className="mb-6 p-4 rounded-lg border-2"
           style={{
             background: `linear-gradient(135deg, ${themeConfig.colors.surface}, ${themeConfig.colors.background})`,
             borderColor: themeConfig.colors.primary
           }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Thème actuel</p>
            <p className="text-lg font-bold" style={{ color: themeConfig.colors.text }}>
              {themeConfig.displayName}
            </p>
          </div>
          <motion.button
            onClick={handleResetToAuto}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
            style={{
              background: themeConfig.colors.primary,
              color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Automatique
          </motion.button>
        </div>

        {/* Aperçu des couleurs */}
        <div className="mt-4 flex gap-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ background: themeConfig.colors.primary }} title="Primaire" />
            <div className="w-4 h-4 rounded" style={{ background: themeConfig.colors.secondary }} title="Secondaire" />
            <div className="w-4 h-4 rounded" style={{ background: themeConfig.colors.accent }} title="Accent" />
          </div>
          <div className="text-xs text-gray-400 ml-2">
            {themeConfig.effects?.snow && '❄️ Neige'}
            {themeConfig.effects?.particles && '✨ Particules'}
            {themeConfig.effects?.animatedBg && '🌊 Arrière-plan animé'}
          </div>
        </div>
      </div>

      {/* Grille des thèmes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(THEMES).map(([themeKey, theme], index) => {
          const isActive = currentTheme === themeKey;
          const Icon = themeKey === 'default' ? Palette :
                      themeKey === 'halloween' ? () => <span>🎃</span> :
                      themeKey === 'christmas' ? () => <span>🎄</span> :
                      themeKey === 'chinese-new-year' ? () => <span>🐉</span> :
                      themeKey === 'spring' ? () => <span>🌸</span> :
                      themeKey === 'summer' ? () => <span>☀️</span> :
                      themeKey === 'autumn' ? () => <span>🍂</span> :
                      () => <span>❄️</span>;

          return (
            <motion.button
              key={themeKey}
              onClick={() => handleThemeTest(themeKey as ThemeType)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'border-white shadow-lg scale-105'
                  : 'border-gray-600 hover:border-gray-400 hover:scale-102'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.background})`,
                borderColor: isActive ? theme.colors.primary : undefined
              }}
              whileHover={{ scale: isActive ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Glow effect pour le thème actif */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: `0 0 20px ${theme.colors.primary}40, inset 0 0 20px ${theme.colors.primary}20`
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              <div className="relative z-10 text-center">
                <div className="text-2xl mb-2">
                  <Icon />
                </div>
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: theme.colors.text }}
                >
                  {theme.displayName}
                </div>

                {/* Indicateurs d'effets */}
                <div className="flex justify-center gap-1 mt-1">
                  {theme.effects?.snow && <span className="text-xs">❄️</span>}
                  {theme.effects?.particles && <span className="text-xs">✨</span>}
                  {theme.effects?.animatedBg && <span className="text-xs">🌊</span>}
                </div>
              </div>

              {/* Badge actif */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Sparkles size={12} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Palette size={14} />
          Informations
        </h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Cliquez sur un thème pour l'appliquer instantanément</p>
          <p>• "Automatique" détecte la saison actuelle</p>
          <p>• Les préférences sont sauvegardées automatiquement</p>
          <p>• Tous les thèmes sont gratuits et disponibles pour tous</p>
        </div>
      </div>
    </motion.div>
  );
}
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
      className="relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-purple-600/10" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-xl" />

      <div className="relative">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <TestTube className="h-8 w-8 text-purple-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-gray-900 animate-pulse" />
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Testeur de Thèmes
            </h3>
            <p className="text-gray-300 text-base mt-1">Testez rapidement tous les thèmes saisonniers disponibles</p>
          </div>
        </div>

        {/* Thème actuel */}
        <div className="mb-8 p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Thème actuel</p>
              <p className="text-xl font-bold text-white">
                {themeConfig.displayName}
              </p>
            </div>
            <motion.button
              onClick={handleResetToAuto}
              className="px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Automatique
            </motion.button>
          </div>

          {/* Aperçu des couleurs */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-lg shadow-sm" style={{ background: themeConfig.colors.primary }} title="Primaire" />
              <div className="w-5 h-5 rounded-lg shadow-sm" style={{ background: themeConfig.colors.secondary }} title="Secondaire" />
              <div className="w-5 h-5 rounded-lg shadow-sm" style={{ background: themeConfig.colors.accent }} title="Accent" />
            </div>
            <div className="text-sm text-gray-400">
              {themeConfig.effects?.snow && '❄️ Neige'}
              {themeConfig.effects?.particles && '✨ Particules'}
              {themeConfig.effects?.animatedBg && '🌊 Arrière-plan animé'}
            </div>
          </div>
        </div>

        {/* Grille des thèmes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  isActive
                    ? 'border-purple-400 shadow-xl shadow-purple-900/30 scale-105'
                    : 'border-gray-600/50 hover:border-gray-500/70 hover:scale-105'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.background})`,
                  borderColor: isActive ? theme.colors.primary : undefined
                }}
                whileHover={{ scale: isActive ? 1.05 : 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Glow effect pour le thème actif */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      boxShadow: `0 0 25px ${theme.colors.primary}50, inset 0 0 25px ${theme.colors.primary}20`
                    }}
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-3">
                    <Icon />
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.displayName}
                  </div>

                  {/* Indicateurs d'effets */}
                  <div className="flex justify-center gap-1 mt-2">
                    {theme.effects?.snow && <span className="text-sm">❄️</span>}
                    {theme.effects?.particles && <span className="text-sm">✨</span>}
                    {theme.effects?.animatedBg && <span className="text-sm">🌊</span>}
                  </div>
                </div>

                {/* Badge actif */}
                {isActive && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Sparkles size={16} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Informations supplémentaires */}
        <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <Palette className="h-5 w-5 text-purple-400" />
            Informations
          </h4>
          <div className="text-sm text-gray-400 space-y-2">
            <p>• Cliquez sur un thème pour l'appliquer instantanément</p>
            <p>• "Automatique" détecte la saison actuelle</p>
            <p>• Les préférences sont sauvegardées automatiquement</p>
            <p>• Tous les thèmes sont gratuits et disponibles pour tous</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
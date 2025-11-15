'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, THEMES, getActiveTheme } from '@/config/themes';

interface ThemeContextType {
  currentTheme: ThemeType;
  themeConfig: typeof THEMES.default;
  setTheme: (theme: ThemeType | null) => void; // null = automatique
  isAutoTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [manualTheme, setManualTheme] = useState<ThemeType | null>(null);
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  // Charger la préférence utilisateur au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nyx-theme');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.manualTheme) {
            setManualTheme(parsed.manualTheme);
            setIsAutoTheme(false);
          }
        } catch (e) {
          console.warn('Erreur chargement thème:', e);
        }
      }
    }
  }, []);

  // Mettre à jour le thème actif quand manualTheme change
  useEffect(() => {
    const activeTheme = getActiveTheme(manualTheme);
    setCurrentTheme(activeTheme);
  }, [manualTheme]);

  // Sauvegarder la préférence utilisateur
  const saveThemePreference = (theme: ThemeType | null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyx-theme', JSON.stringify({
        manualTheme: theme,
        timestamp: Date.now()
      }));
    }
  };

  const setTheme = (theme: ThemeType | null) => {
    setManualTheme(theme);
    setIsAutoTheme(theme === null);
    saveThemePreference(theme);
  };

  const themeConfig = THEMES[currentTheme];

  // Appliquer les variables CSS globales et classes du thème
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Appliquer les couleurs du thème
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });

      // Appliquer la classe du thème au body
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${currentTheme}`);

      // Appliquer le fond dynamique selon le thème
      const backgroundStyle = themeConfig.colors.gradient
        ? `linear-gradient(135deg, ${themeConfig.colors.background} 0%, ${themeConfig.colors.surface} 100%)`
        : themeConfig.colors.background;

      document.body.style.background = backgroundStyle;
      document.body.style.backgroundAttachment = 'fixed';

      // Pour les thèmes avec effets spéciaux, ajouter des propriétés CSS supplémentaires
      if (themeConfig.effects?.animatedBg) {
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.animation = 'pan-bg 20s ease infinite';
      } else {
        document.body.style.backgroundSize = '';
        document.body.style.animation = '';
      }
    }
  }, [currentTheme, themeConfig]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeConfig,
      setTheme,
      isAutoTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
export type ThemeType = 'default' | 'halloween' | 'christmas' | 'chinese-new-year' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
  };
  effects?: {
    snow?: boolean;
    particles?: boolean;
    animatedBg?: boolean;
  };
  icons?: {
    mascot?: string;
    decorations?: string[];
  };
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: 'Classique',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      border: '#334155',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    },
  },
  halloween: {
    name: 'halloween',
    displayName: 'Halloween',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#000000',
      background: '#1a0f0a',
      surface: '#2a1810',
      text: '#ffffff',
      textSecondary: '#ffedd5',
      border: '#7c2d12',
      gradient: 'linear-gradient(135deg, #ff6b35, #f7931e, #000000)',
    },
    effects: {
      particles: true,
      animatedBg: true,
    },
    icons: {
      mascot: '🎃',
      decorations: ['🦇', '👻', '🕷️', '🕸️'],
    },
  },
  christmas: {
    name: 'christmas',
    displayName: 'Noël',
    colors: {
      primary: '#dc2626',
      secondary: '#16a34a',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#ffffff',
      textSecondary: '#e2e8f0',
      border: '#475569',
      gradient: 'linear-gradient(135deg, #dc2626, #16a34a, #fbbf24)',
    },
    effects: {
      snow: true,
      animatedBg: true,
    },
    icons: {
      mascot: '🎄',
      decorations: ['🎅', '❄️', '🎁', '🔔'],
    },
  },
  'chinese-new-year': {
    name: 'chinese-new-year',
    displayName: 'Nouvel An Chinois',
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: '#0f0f0a',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#fef3c7',
      border: '#92400e',
      gradient: 'linear-gradient(135deg, #dc2626, #ea580c, #fbbf24)',
    },
    effects: {
      particles: true,
      animatedBg: true,
    },
    icons: {
      mascot: '🐉',
      decorations: ['🧧', '🎆', '🪔', '🐯'],
    },
  },
  spring: {
    name: 'spring',
    displayName: 'Printemps',
    colors: {
      primary: '#16a34a',
      secondary: '#84cc16',
      accent: '#eab308',
      background: '#0f1b0f',
      surface: '#1e2e1e',
      text: '#ffffff',
      textSecondary: '#dcfce7',
      border: '#166534',
      gradient: 'linear-gradient(135deg, #16a34a, #84cc16, #eab308)',
    },
    effects: {
      particles: true,
    },
    icons: {
      mascot: '🌸',
      decorations: ['🌷', '🌺', '🍀', '🦋'],
    },
  },
  summer: {
    name: 'summer',
    displayName: 'Été',
    colors: {
      primary: '#0284c7',
      secondary: '#0891b2',
      accent: '#f59e0b',
      background: '#0f1419',
      surface: '#1e293b',
      text: '#ffffff',
      textSecondary: '#e0f2fe',
      border: '#0e7490',
      gradient: 'linear-gradient(135deg, #0284c7, #0891b2, #f59e0b)',
    },
    effects: {
      animatedBg: true,
    },
    icons: {
      mascot: '☀️',
      decorations: ['🏖️', '🌊', '🍉', '🕶️'],
    },
  },
  autumn: {
    name: 'autumn',
    displayName: 'Automne',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#d97706',
      background: '#1c120a',
      surface: '#2e1c0f',
      text: '#ffffff',
      textSecondary: '#fed7aa',
      border: '#9a3412',
      gradient: 'linear-gradient(135deg, #ea580c, #dc2626, #d97706)',
    },
    effects: {
      particles: true,
    },
    icons: {
      mascot: '🍂',
      decorations: ['🍁', '🎃', '🌰', '🦔'],
    },
  },
  winter: {
    name: 'winter',
    displayName: 'Hiver',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#e5e7eb',
      background: '#0f1419',
      surface: '#1e293b',
      text: '#ffffff',
      textSecondary: '#f1f5f9',
      border: '#475569',
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1, #e5e7eb)',
    },
    effects: {
      snow: true,
    },
    icons: {
      mascot: '❄️',
      decorations: ['⛄', '🧣', '☕', '🎿'],
    },
  },
};

// Fonction pour détecter automatiquement la saison selon les périodes spéciales
export function getCurrentSeason(): ThemeType {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() retourne 0-11
  const day = now.getDate();

  // Noël : 20 décembre au 1er janvier
  if ((month === 12 && day >= 20) || (month === 1 && day <= 1)) {
    return 'christmas';
  }

  // Halloween : 30 octobre au 1er novembre
  if ((month === 10 && day >= 30) || (month === 11 && day <= 1)) {
    return 'halloween';
  }

  // Nouvel An Chinois : période approximative (fin janvier à mi-février)
  if ((month === 1 && day >= 25) || (month === 2 && day <= 15)) {
    return 'chinese-new-year';
  }

  // Détection des saisons régulières
  if (month >= 3 && month <= 5) {
    return 'spring'; // Mars à Mai
  } else if (month >= 6 && month <= 8) {
    return 'summer'; // Juin à Août
  } else if (month >= 9 && month <= 11) {
    return 'autumn'; // Septembre à Novembre
  } else {
    return 'winter'; // Décembre à Février
  }
}

// Fonction pour obtenir le thème actuel (manuel ou automatique)
export function getActiveTheme(manualTheme?: ThemeType | null): ThemeType {
  return manualTheme || getCurrentSeason();
}
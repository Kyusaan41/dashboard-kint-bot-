'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

// Hook pour détecter les performances
const usePerformanceMode = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};

// Composant pour les décorations de Noël - OPTIMISÉ
const ChristmasDecorations = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire drastiquement : 3 sapins -> 1, 6 lumières -> 2, 4 boules -> 1
  const decorations = useMemo(() => [
    // Un seul sapin
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `bg-tree-${i}`,
      type: 'tree',
      x: 50 + Math.random() * 20,
      y: 70 + Math.random() * 20,
      size: 50 + Math.random() * 20,
      rotation: -2 + Math.random() * 4,
    })),
    // 2 lumières seulement
    ...Array.from({ length: reducedMotion ? 0 : 2 }).map((_, i) => ({
      id: `light-${i}`,
      type: 'light',
      x: 20 + (i * 60) + Math.random() * 20,
      y: 30 + Math.random() * 40,
      size: 5 + Math.random() * 3,
      color: ['#ff0000', '#00ff00', '#ffff00'][Math.floor(Math.random() * 3)],
    })),
    // 1 boule seulement
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `bauble-${i}`,
      type: 'bauble',
      x: 50 + Math.random() * 30,
      y: 40 + Math.random() * 30,
      size: 12 + Math.random() * 4,
      color: ['#ff4444', '#44ff44', '#4444ff'][Math.floor(Math.random() * 3)],
    })),
  ], [reducedMotion]);

  if (reducedMotion || decorations.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'tree') {
          return (
            <div
              key={decoration.id}
              className="absolute text-green-600/40 drop-shadow-lg"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                transform: `rotate(${decoration.rotation}deg)`,
                animation: 'treeSway 8s ease-in-out infinite',
                willChange: 'transform',
              }}
            >
              🎄
            </div>
          );
        }

        if (decoration.type === 'light') {
          return (
            <div
              key={decoration.id}
              className="absolute rounded-full"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                width: `${decoration.size}px`,
                height: `${decoration.size}px`,
                backgroundColor: decoration.color,
                boxShadow: `0 0 ${decoration.size * 2}px ${decoration.color}80`,
                animation: 'lightFlicker 3s ease-in-out infinite',
                animationDelay: `${Math.random() * 2}s`,
                willChange: 'opacity, transform',
              }}
            />
          );
        }

        if (decoration.type === 'bauble') {
          return (
            <div
              key={decoration.id}
              className="absolute rounded-full border-2 border-white/30"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                width: `${decoration.size}px`,
                height: `${decoration.size}px`,
                backgroundColor: decoration.color,
                boxShadow: `0 0 ${decoration.size}px ${decoration.color}60`,
                animation: 'baubleSwing 6s ease-in-out infinite',
                willChange: 'transform',
              }}
            />
          );
        }

        return null;
      })}
      <style jsx>{`
        @keyframes treeSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes lightFlicker {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes baubleSwing {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

// Composant pour les décorations d'Halloween - OPTIMISÉ
const HalloweenDecorations = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire : 2 citrouilles -> 1, 3 chauves-souris -> 1, 2 toiles -> 1
  const decorations = useMemo(() => [
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `pumpkin-${i}`,
      type: 'pumpkin',
      x: 50 + Math.random() * 30,
      y: 75 + Math.random() * 15,
      size: 35 + Math.random() * 15,
    })),
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `bat-${i}`,
      type: 'bat',
      x: Math.random() * 100,
      y: 10 + Math.random() * 30,
      size: 20 + Math.random() * 10,
    })),
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `web-${i}`,
      type: 'web',
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 30 + Math.random() * 20,
      rotation: Math.random() * 360,
    })),
  ], [reducedMotion]);

  if (reducedMotion || decorations.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'pumpkin') {
          return (
            <div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                animation: 'pumpkinGlow 4s ease-in-out infinite',
                willChange: 'filter',
              }}
            >
              🎃
            </div>
          );
        }

        if (decoration.type === 'bat') {
          return (
            <div
              key={decoration.id}
              className="absolute text-gray-800/60"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                animation: 'batFly 12s ease-in-out infinite',
                willChange: 'transform',
              }}
            >
              🦇
            </div>
          );
        }

        if (decoration.type === 'web') {
          return (
            <div
              key={decoration.id}
              className="absolute text-gray-400/20"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                transform: `rotate(${decoration.rotation}deg)`,
                animation: 'webPulse 6s ease-in-out infinite',
                willChange: 'opacity',
              }}
            >
              🕸️
            </div>
          );
        }

        return null;
      })}
      <style jsx>{`
        @keyframes pumpkinGlow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 140, 0, 0.5)); }
          50% { filter: drop-shadow(0 0 15px rgba(255, 140, 0, 0.8)); }
        }
        @keyframes batFly {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(50px, -20px) rotate(10deg); }
        }
        @keyframes webPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// Composant pour les décorations du Nouvel An Chinois - OPTIMISÉ
const ChineseNewYearDecorations = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire : 1 de chaque seulement, ou rien si reducedMotion
  const decorations = useMemo(() => [
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `lantern-${i}`,
      type: 'lantern',
      x: 50 + Math.random() * 30,
      y: 30 + Math.random() * 30,
      size: 30 + Math.random() * 10,
    })),
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `dragon-${i}`,
      type: 'dragon',
      x: Math.random() * 100,
      y: 20 + Math.random() * 20,
      size: 35 + Math.random() * 15,
    })),
    ...Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `firework-${i}`,
      type: 'firework',
      x: Math.random() * 100,
      y: 60 + Math.random() * 30,
      size: 20 + Math.random() * 8,
    })),
  ], [reducedMotion]);

  if (reducedMotion || decorations.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'lantern') {
          return (
            <div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                animation: 'lanternSway 5s ease-in-out infinite',
                willChange: 'transform',
              }}
            >
              🏮
            </div>
          );
        }

        if (decoration.type === 'dragon') {
          return (
            <div
              key={decoration.id}
              className="absolute text-red-600/60"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                animation: 'dragonMove 20s ease-in-out infinite',
                willChange: 'transform',
              }}
            >
              🐉
            </div>
          );
        }

        if (decoration.type === 'firework') {
          return (
            <div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                animation: 'fireworkBurst 4s ease-out infinite',
                willChange: 'transform, opacity',
              }}
            >
              🎆
            </div>
          );
        }

        return null;
      })}
      <style jsx>{`
        @keyframes lanternSway {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes dragonMove {
          0%, 100% { transform: translateX(0) scale(0.8); }
          50% { transform: translateX(50px) scale(1.2); }
        }
        @keyframes fireworkBurst {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export function SeasonalDecorations() {
  const { currentTheme } = useTheme();
  const reducedMotion = usePerformanceMode();

  // Si l'utilisateur préfère réduire les animations, désactiver toutes les décorations
  if (reducedMotion) {
    return null;
  }

  switch (currentTheme) {
    case 'christmas':
      return <ChristmasDecorations />;
    case 'halloween':
      return <HalloweenDecorations />;
    case 'chinese-new-year':
      return <ChineseNewYearDecorations />;
    default:
      return null;
  }
}

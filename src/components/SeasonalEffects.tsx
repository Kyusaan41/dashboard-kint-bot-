'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

// Hook pour détecter les performances et désactiver les effets si nécessaire
const usePerformanceMode = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier la préférence système pour réduire les animations
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};

// Composant pour la neige - OPTIMISÉ avec CSS pur
const SnowEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire drastiquement le nombre de flocons (de 50 à 15)
  const snowflakes = useMemo(() =>
    Array.from({ length: reducedMotion ? 5 : 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      size: 2 + Math.random() * 3,
    })), [reducedMotion]
  );

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ willChange: 'transform' }}>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white opacity-50"
          style={{
            left: `${flake.x}%`,
            top: '-10px',
            fontSize: `${flake.size}px`,
            animation: `snowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            willChange: 'transform',
          }}
        >
          ❄️
        </div>
      ))}
      <style jsx>{`
        @keyframes snowfall {
          to {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les particules colorées - OPTIMISÉ
const ParticlesEffect = ({ colors, theme }: { colors: string[]; theme: string }) => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire le nombre de particules (de 20 à 8)
  const particleCount = reducedMotion ? 0 : (theme === 'chinese-new-year' ? 5 : 8);
  
  const particles = useMemo(() =>
    Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 12 + Math.random() * 8,
      size: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    })), [colors, particleCount]
  );

  if (reducedMotion || particleCount === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ willChange: 'transform' }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -20px) scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour l'arrière-plan animé - OPTIMISÉ avec CSS
const AnimatedBackground = ({ colors }: { colors: string[] }) => {
  const reducedMotion = usePerformanceMode();

  if (reducedMotion) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${colors[0]} 0%, transparent 50%)`,
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-5">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${colors[0]} 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, ${colors[1]} 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, ${colors[2]} 0%, transparent 50%)`,
          animation: 'backgroundShift 30s ease infinite',
          willChange: 'background-position',
        }}
      />
      <style jsx>{`
        @keyframes backgroundShift {
          0%, 100% {
            background-position: 0% 0%, 100% 0%, 50% 100%;
          }
          50% {
            background-position: 100% 100%, 0% 100%, 50% 0%;
          }
        }
      `}</style>
    </div>
  );
};

export function SeasonalEffects() {
  const { themeConfig, currentTheme } = useTheme();
  const reducedMotion = usePerformanceMode();

  // Si l'utilisateur préfère réduire les animations, désactiver tous les effets
  if (reducedMotion) {
    return null;
  }

  const effects = themeConfig.effects || {};
  const colors = [
    themeConfig.colors.primary,
    themeConfig.colors.secondary,
    themeConfig.colors.accent,
  ];

  return (
    <>
      {effects.snow && <SnowEffect />}
      {effects.particles && <ParticlesEffect colors={colors} theme={currentTheme} />}
      {effects.animatedBg && <AnimatedBackground colors={colors} />}
    </>
  );
}

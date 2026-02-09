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

// Composant pour les effets de neige sur les cartes - OPTIMISÉ
const SnowEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 8 à 3 flocons
  const snowflakes = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 3 }).map((_, i) => ({
      id: `snow-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2,
      size: 2 + Math.random() * 2,
    })), [reducedMotion]
  );

  if (reducedMotion || snowflakes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ willChange: 'transform' }}>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white/40"
          style={{
            left: `${flake.x}%`,
            top: '-10px',
            fontSize: `${flake.size}px`,
            animation: `cardSnowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            willChange: 'transform',
          }}
        >
          ❄️
        </div>
      ))}
      <style jsx>{`
        @keyframes cardSnowfall {
          to {
            transform: translateY(120px) translateX(10px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les toiles d'araignée - OPTIMISÉ
const SpiderWebEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 3 à 1 toile
  const webs = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `web-${i}`,
      x: 50 + Math.random() * 20,
      y: 50 + Math.random() * 20,
      rotation: Math.random() * 360,
      scale: 0.4 + Math.random() * 0.3,
    })), [reducedMotion]
  );

  if (reducedMotion || webs.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {webs.map((web) => (
        <div
          key={web.id}
          className="absolute text-gray-400/10"
          style={{
            left: `${web.x}%`,
            top: `${web.y}%`,
            transform: `rotate(${web.rotation}deg) scale(${web.scale})`,
            fontSize: '20px',
            animation: 'webPulse 6s ease-in-out infinite',
            willChange: 'opacity',
          }}
        >
          🕸️
        </div>
      ))}
      <style jsx>{`
        @keyframes webPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

// Composant pour les feuilles qui tombent - OPTIMISÉ
const FallingLeavesEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 5 à 2 feuilles
  const leaves = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 2 }).map((_, i) => ({
      id: `leaf-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 5 + Math.random() * 2,
      rotation: Math.random() * 360,
      color: ['#dc2626', '#ea580c', '#d97706'][Math.floor(Math.random() * 3)],
    })), [reducedMotion]
  );

  if (reducedMotion || leaves.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ willChange: 'transform' }}>
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: '-10px',
            fontSize: '12px',
            color: leaf.color,
            animation: `leafFall ${leaf.duration}s ease-in infinite`,
            animationDelay: `${leaf.delay}s`,
            willChange: 'transform',
          }}
        >
          🍂
        </div>
      ))}
      <style jsx>{`
        @keyframes leafFall {
          to {
            transform: translateY(140px) translateX(15px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les pétales de fleurs - OPTIMISÉ
const FlowerPetalsEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 6 à 2 pétales
  const petals = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 2 }).map((_, i) => ({
      id: `petal-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2,
      rotation: Math.random() * 360,
      emoji: ['🌸', '🌺'][Math.floor(Math.random() * 2)],
    })), [reducedMotion]
  );

  if (reducedMotion || petals.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ willChange: 'transform' }}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute text-pink-300/40"
          style={{
            left: `${petal.x}%`,
            top: '-10px',
            fontSize: '10px',
            animation: `petalFall ${petal.duration}s ease-out infinite`,
            animationDelay: `${petal.delay}s`,
            willChange: 'transform',
          }}
        >
          {petal.emoji}
        </div>
      ))}
      <style jsx>{`
        @keyframes petalFall {
          to {
            transform: translateY(120px) translateX(20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les étoiles filantes - OPTIMISÉ
const ShootingStarsEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 3 à 1 étoile
  const stars = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `star-${i}`,
      startX: Math.random() * 100,
      startY: 20 + Math.random() * 30,
      endX: Math.random() * 100,
      endY: 60 + Math.random() * 20,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 1,
    })), [reducedMotion]
  );

  if (reducedMotion || stars.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ willChange: 'transform' }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-yellow-300"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            fontSize: '6px',
            animation: `starShoot ${star.duration}s ease-out infinite`,
            animationDelay: `${star.delay}s`,
            willChange: 'transform',
          }}
        >
          ⭐
        </div>
      ))}
      <style jsx>{`
        @keyframes starShoot {
          to {
            transform: translate(${stars[0]?.endX ? stars[0].endX - stars[0].startX : 0}vw, ${stars[0]?.endY ? stars[0].endY - stars[0].startY : 0}vh);
            opacity: 0;
            scale: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les lucioles - OPTIMISÉ
const FirefliesEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 4 à 2 lucioles
  const fireflies = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 2 }).map((_, i) => ({
      id: `firefly-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    })), [reducedMotion]
  );

  if (reducedMotion || fireflies.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            animation: 'fireflyGlow 3s ease-in-out infinite',
            animationDelay: `${firefly.delay}s`,
            willChange: 'opacity, transform',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fireflyGlow {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour les étincelles - OPTIMISÉ
const SparklesEffect = () => {
  const reducedMotion = usePerformanceMode();
  
  // Réduire de 3 à 1 étincelle
  const sparkles = useMemo(() =>
    Array.from({ length: reducedMotion ? 0 : 1 }).map((_, i) => ({
      id: `sparkle-${i}`,
      x: 50 + Math.random() * 20,
      y: 50 + Math.random() * 20,
      delay: Math.random() * 3,
      color: ['#ff0000', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 3)],
    })), [reducedMotion]
  );

  if (reducedMotion || sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute text-lg"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            color: sparkle.color,
            animation: 'sparklePulse 3s ease-in-out infinite',
            animationDelay: `${sparkle.delay}s`,
            willChange: 'transform, opacity',
          }}
        >
          ✨
        </div>
      ))}
      <style jsx>{`
        @keyframes sparklePulse {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export function CardEffects() {
  const { currentTheme } = useTheme();
  const reducedMotion = usePerformanceMode();

  // Si l'utilisateur préfère réduire les animations, désactiver tous les effets
  if (reducedMotion) {
    return null;
  }

  switch (currentTheme) {
    case 'christmas':
    case 'winter':
      return <SnowEffect />;
    case 'halloween':
      return <SpiderWebEffect />;
    case 'autumn':
      return <FallingLeavesEffect />;
    case 'spring':
      return <FlowerPetalsEffect />;
    case 'summer':
      return Math.random() > 0.5 ? <ShootingStarsEffect /> : <FirefliesEffect />;
    case 'chinese-new-year':
      return <SparklesEffect />;
    default:
      return null;
  }
}

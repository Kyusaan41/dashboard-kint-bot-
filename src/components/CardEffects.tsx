'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

// Composant pour les effets de neige sur les cartes (Noël/Hiver)
const SnowEffect = () => {
  const snowflakes = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      id: `snow-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white/60"
          style={{
            left: `${flake.x}%`,
            top: '-10px',
            fontSize: `${flake.size}px`,
          }}
          animate={{
            y: [0, 120],
            x: [0, Math.random() * 20 - 10],
            opacity: [0, 0.8, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
        >
          ❄️
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les toiles d'araignée sur les cartes (Halloween)
const SpiderWebEffect = () => {
  const webs = useMemo(() =>
    Array.from({ length: 3 }).map((_, i) => ({
      id: `web-${i}`,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      rotation: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.4,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {webs.map((web) => (
        <motion.div
          key={web.id}
          className="absolute text-gray-400/20"
          style={{
            left: `${web.x}%`,
            top: `${web.y}%`,
            transform: `rotate(${web.rotation}deg) scale(${web.scale})`,
            fontSize: '20px',
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [web.scale, web.scale * 1.1, web.scale],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🕸️
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les feuilles qui tombent (Automne)
const FallingLeavesEffect = () => {
  const leaves = useMemo(() =>
    Array.from({ length: 5 }).map((_, i) => ({
      id: `leaf-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
      rotation: Math.random() * 720,
      color: ['#dc2626', '#ea580c', '#d97706', '#65a30d'][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: '-10px',
            fontSize: '14px',
            color: leaf.color,
          }}
          animate={{
            y: [0, 140],
            x: [0, Math.random() * 30 - 15],
            rotate: leaf.rotation,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'easeIn',
          }}
        >
          🍂
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les pétales de fleurs (Printemps)
const FlowerPetalsEffect = () => {
  const petals = useMemo(() =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: `petal-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      rotation: Math.random() * 360,
      emoji: ['🌸', '🌺', '🌹', '🌷'][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-pink-300/60"
          style={{
            left: `${petal.x}%`,
            top: '-10px',
            fontSize: '12px',
          }}
          animate={{
            y: [0, 120],
            x: [0, Math.sin(petal.rotation / 180 * Math.PI) * 20],
            rotate: petal.rotation,
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'easeOut',
          }}
        >
          {petal.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les étoiles filantes (Été)
const ShootingStarsEffect = () => {
  const stars = useMemo(() =>
    Array.from({ length: 3 }).map((_, i) => ({
      id: `star-${i}`,
      startX: Math.random() * 100,
      startY: 10 + Math.random() * 40,
      endX: Math.random() * 100,
      endY: 60 + Math.random() * 30,
      delay: Math.random() * 8,
      duration: 1.5 + Math.random() * 1,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute text-yellow-300"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            fontSize: '8px',
          }}
          animate={{
            x: `${star.endX - star.startX}vw`,
            y: `${star.endY - star.startY}vh`,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeOut',
          }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les lucioles (Été)
const FirefliesEffect = () => {
  const fireflies = useMemo(() =>
    Array.from({ length: 4 }).map((_, i) => ({
      id: `firefly-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: [0, Math.random() * 20 - 10],
            y: [0, Math.random() * 20 - 10],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: firefly.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Composant pour les étincelles (Nouvel An Chinois)
const SparklesEffect = () => {
  const sparkles = useMemo(() =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: `sparkle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      color: ['#ff0000', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute text-lg"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            color: sparkle.color,
          }}
          animate={{
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export function CardEffects() {
  const { currentTheme } = useTheme();

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
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

// Composant pour la neige
const SnowEffect = () => {
  const snowflakes = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      size: 2 + Math.random() * 4,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white opacity-70"
          style={{
            left: `${flake.x}%`,
            fontSize: `${flake.size}px`,
          }}
          initial={{ y: -10, opacity: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 0.7, 0.7, 0],
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

// Composant pour les particules colorées
const ParticlesEffect = ({ colors }: { colors: string[] }) => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 8,
      size: 1 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    })), [colors]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Composant pour l'arrière-plan animé
const AnimatedBackground = ({ colors }: { colors: string[] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, ${colors[0]} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 20%, ${colors[1]} 0%, transparent 50%)`,
            `radial-gradient(circle at 40% 80%, ${colors[2]} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 50%, ${colors[0]} 0%, transparent 50%)`,
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export function SeasonalEffects() {
  const { themeConfig } = useTheme();

  const effects = themeConfig.effects || {};
  const colors = [
    themeConfig.colors.primary,
    themeConfig.colors.secondary,
    themeConfig.colors.accent,
  ];

  return (
    <>
      {effects.snow && <SnowEffect />}
      {effects.particles && <ParticlesEffect colors={colors} />}
      {effects.animatedBg && <AnimatedBackground colors={colors} />}
    </>
  );
}
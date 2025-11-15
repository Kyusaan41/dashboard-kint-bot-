'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

// Types pour les décorations
type TreeDecoration = {
  id: string;
  type: 'tree';
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type LightDecoration = {
  id: string;
  type: 'light';
  x: number;
  y: number;
  size: number;
  color: string;
};

type BaubleDecoration = {
  id: string;
  type: 'bauble';
  x: number;
  y: number;
  size: number;
  color: string;
};

type ChristmasDecoration = TreeDecoration | LightDecoration | BaubleDecoration;

// Composant pour les décorations de Noël
const ChristmasDecorations = () => {
  const decorations: ChristmasDecoration[] = useMemo(() => [
    // Sapins
    ...Array.from({ length: 3 }).map((_, i): TreeDecoration => ({
      id: `tree-${i}`,
      type: 'tree',
      x: 10 + (i * 25) + Math.random() * 10,
      y: 70 + Math.random() * 20,
      size: 40 + Math.random() * 20,
      rotation: -5 + Math.random() * 10,
    })),
    // Guirlandes lumineuses
    ...Array.from({ length: 8 }).map((_, i): LightDecoration => ({
      id: `light-${i}`,
      type: 'light',
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
      size: 3 + Math.random() * 4,
      color: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'][Math.floor(Math.random() * 6)],
    })),
    // Boules de Noël
    ...Array.from({ length: 5 }).map((_, i): BaubleDecoration => ({
      id: `bauble-${i}`,
      type: 'bauble',
      x: Math.random() * 100,
      y: 30 + Math.random() * 50,
      size: 8 + Math.random() * 6,
      color: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'][Math.floor(Math.random() * 5)],
    })),
  ], []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'tree') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                transform: `rotate(${decoration.rotation}deg)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.1, 1],
                opacity: [0, 0.8, 0.6],
                rotate: [decoration.rotation, decoration.rotation + 2, decoration.rotation],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            >
              <div
                className="text-green-600 drop-shadow-lg"
                style={{ fontSize: `${decoration.size}px` }}
              >
                🎄
              </div>
              {/* Petite guirlande sur le sapin */}
              <motion.div
                className="absolute -top-1 -left-1 text-yellow-400"
                style={{ fontSize: `${decoration.size * 0.3}px` }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✨
              </motion.div>
            </motion.div>
          );
        }

        if (decoration.type === 'light') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute rounded-full"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                width: `${decoration.size}px`,
                height: `${decoration.size}px`,
                backgroundColor: decoration.color,
                boxShadow: `0 0 ${decoration.size * 2}px ${decoration.color}80`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          );
        }

        if (decoration.type === 'bauble') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute rounded-full border-2 border-white/50"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                width: `${decoration.size}px`,
                height: `${decoration.size}px`,
                backgroundColor: decoration.color,
                boxShadow: `0 0 ${decoration.size}px ${decoration.color}60`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

// Types pour Halloween
type PumpkinDecoration = {
  id: string;
  type: 'pumpkin';
  x: number;
  y: number;
  size: number;
  flickerDelay: number;
};

type BatDecoration = {
  id: string;
  type: 'bat';
  x: number;
  y: number;
  size: number;
  speed: number;
};

type WebDecoration = {
  id: string;
  type: 'web';
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type HalloweenDecoration = PumpkinDecoration | BatDecoration | WebDecoration;

// Composant pour les décorations d'Halloween
const HalloweenDecorations = () => {
  const decorations: HalloweenDecoration[] = useMemo(() => [
    // Citrouilles
    ...Array.from({ length: 4 }).map((_, i): PumpkinDecoration => ({
      id: `pumpkin-${i}`,
      type: 'pumpkin',
      x: 15 + (i * 20) + Math.random() * 15,
      y: 75 + Math.random() * 15,
      size: 35 + Math.random() * 15,
      flickerDelay: Math.random() * 3,
    })),
    // Chauves-souris
    ...Array.from({ length: 6 }).map((_, i): BatDecoration => ({
      id: `bat-${i}`,
      type: 'bat',
      x: Math.random() * 100,
      y: 10 + Math.random() * 30,
      size: 20 + Math.random() * 10,
      speed: 8 + Math.random() * 8,
    })),
    // Toiles d'araignée
    ...Array.from({ length: 3 }).map((_, i): WebDecoration => ({
      id: `web-${i}`,
      type: 'web',
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 40 + Math.random() * 20,
      rotation: Math.random() * 360,
    })),
  ], []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'pumpkin') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 5px rgba(255, 140, 0, 0.5))',
                  'drop-shadow(0 0 15px rgba(255, 140, 0, 0.8))',
                  'drop-shadow(0 0 5px rgba(255, 140, 0, 0.5))',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: decoration.flickerDelay,
              }}
            >
              🎃
            </motion.div>
          );
        }

        if (decoration.type === 'bat') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute text-gray-800"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: decoration.speed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 5,
              }}
            >
              🦇
            </motion.div>
          );
        }

        if (decoration.type === 'web') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute text-gray-400/30"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
                transform: `rotate(${decoration.rotation}deg)`,
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🕸️
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
};

// Types pour le Nouvel An Chinois
type LanternDecoration = {
  id: string;
  type: 'lantern';
  x: number;
  y: number;
  size: number;
  swayDelay: number;
};

type DragonDecoration = {
  id: string;
  type: 'dragon';
  x: number;
  y: number;
  size: number;
  speed: number;
};

type FireworkDecoration = {
  id: string;
  type: 'firework';
  x: number;
  y: number;
  size: number;
  burstDelay: number;
};

type ChineseNewYearDecoration = LanternDecoration | DragonDecoration | FireworkDecoration;

// Composant pour les décorations du Nouvel An Chinois
const ChineseNewYearDecorations = () => {
  const decorations: ChineseNewYearDecoration[] = useMemo(() => [
    // Lanternes rouges
    ...Array.from({ length: 5 }).map((_, i): LanternDecoration => ({
      id: `lantern-${i}`,
      type: 'lantern',
      x: 10 + (i * 18) + Math.random() * 10,
      y: 20 + Math.random() * 40,
      size: 25 + Math.random() * 15,
      swayDelay: Math.random() * 2,
    })),
    // Dragons
    ...Array.from({ length: 3 }).map((_, i): DragonDecoration => ({
      id: `dragon-${i}`,
      type: 'dragon',
      x: Math.random() * 100,
      y: 15 + Math.random() * 20,
      size: 30 + Math.random() * 20,
      speed: 12 + Math.random() * 8,
    })),
    // Feux d'artifice
    ...Array.from({ length: 4 }).map((_, i): FireworkDecoration => ({
      id: `firework-${i}`,
      type: 'firework',
      x: Math.random() * 100,
      y: 60 + Math.random() * 30,
      size: 20 + Math.random() * 10,
      burstDelay: Math.random() * 10,
    })),
  ], []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {decorations.map((decoration) => {
        if (decoration.type === 'lantern') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
              }}
              animate={{
                y: [0, -5, 0],
                rotate: [-2, 2, -2],
                filter: [
                  'drop-shadow(0 0 5px rgba(255, 0, 0, 0.5))',
                  'drop-shadow(0 0 15px rgba(255, 0, 0, 0.8))',
                  'drop-shadow(0 0 5px rgba(255, 0, 0, 0.5))',
                ],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: decoration.swayDelay,
                },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: decoration.swayDelay,
                },
                filter: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: decoration.swayDelay + 1,
                },
              }}
            >
              🏮
            </motion.div>
          );
        }

        if (decoration.type === 'dragon') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute text-red-600"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
              }}
              animate={{
                x: [-50, 150, -50],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: decoration.speed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 5,
              }}
            >
              🐉
            </motion.div>
          );
        }

        if (decoration.type === 'firework') {
          return (
            <motion.div
              key={decoration.id}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: `${decoration.size}px`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: decoration.burstDelay,
              }}
            >
              🎆
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
};

export function SeasonalDecorations() {
  const { currentTheme } = useTheme();

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
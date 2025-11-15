"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { FAVORITABLE_PAGES, FavoritePage } from '@/config/favorites-config';
import { CardEffects } from './CardEffects';

export const FavoritesBar: React.FC = () => {
  const { favorites } = useFavorites();

  const favoritePages = FAVORITABLE_PAGES.filter((page: FavoritePage) => favorites.includes(page.id));

  if (favoritePages.length === 0) {
    return null; // Ne rien afficher si aucun favori
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.01,
        y: -2,
        transition: { duration: 0.2 }
      }}
      className="
        bg-gradient-to-br from-card-dark/80 to-purple-primary/10
        backdrop-blur-sm
        rounded-2xl
        border border-gray-700/50
        hover:border-purple-primary/50
        transition-all duration-300
        shadow-xl
        hover:shadow-2xl hover:shadow-purple-primary/20
        relative
        overflow-hidden
        group
        mb-6
      "
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Seasonal card effects */}
      <CardEffects />

      {/* Card content */}
      <div className="relative z-10 p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--theme-text-secondary)' }}>Raccourcis</h3>
        <div className="flex flex-wrap gap-4">
        {favoritePages.map((page: FavoritePage, index: number) => (
          <Link href={page.path} key={page.id} passHref>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-2 transition-colors cursor-pointer w-20 text-center relative"
              style={{
                color: 'var(--theme-text-secondary)'
              }}
              whileHover={{
                color: 'var(--theme-text)'
              }}
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center border transition-all relative"
                style={{
                  backgroundColor: 'var(--theme-secondary)15',
                  borderColor: 'var(--theme-secondary)',
                  boxShadow: '0 0 10px var(--theme-secondary)40'
                }}
              >
                <page.Icon className="w-6 h-6" style={{ color: 'var(--theme-text)' }} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-black font-bold">★</span>
                </div>
              </div>
              <span className="text-xs font-medium truncate w-full" style={{ color: 'var(--theme-text)' }}>{page.name}</span>
            </motion.div>
          </Link>
        ))}
        </div>
      </div>
    </motion.div>
  );
};
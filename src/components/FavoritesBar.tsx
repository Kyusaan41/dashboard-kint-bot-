"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { FAVORITABLE_PAGES, FavoritePage } from '@/config/favorites-config';

export const FavoritesBar: React.FC = () => {
  const { favorites } = useFavorites();

  const favoritePages = FAVORITABLE_PAGES.filter((page: FavoritePage) => favorites.includes(page.id));

  if (favoritePages.length === 0) {
    return null; // Ne rien afficher si aucun favori
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">Raccourcis</h3>
      <div className="flex flex-wrap gap-4">
        {favoritePages.map((page: FavoritePage, index: number) => (
          <Link href={page.path} key={page.id} passHref>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer w-20 text-center"
            >
              <div className="w-14 h-14 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                <page.Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium truncate w-full">{page.name}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};
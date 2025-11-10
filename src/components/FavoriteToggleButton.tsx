"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteToggleButtonProps {
  pageId: string;
}

export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({ pageId }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(pageId);

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(pageId);
    } else {
      addFavorite(pageId);
    }
  };

  return (
    <motion.button onClick={toggleFavorite} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-white/60 hover:text-yellow-400 hover:bg-white/10 transition-colors duration-200" title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}>
      <Star className={`w-5 h-5 transition-all duration-300 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent'}`} />
    </motion.button>
  );
};
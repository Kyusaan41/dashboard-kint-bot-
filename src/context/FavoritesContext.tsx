"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (pageId: string) => void;
  removeFavorite: (pageId: string) => void;
  isFavorite: (pageId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('userFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((pageId: string) => {
    setFavorites((prev) => [...new Set([...prev, pageId])]);
  }, []);

  const removeFavorite = useCallback((pageId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== pageId));
  }, []);

  const isFavorite = useCallback((pageId: string) => favorites.includes(pageId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
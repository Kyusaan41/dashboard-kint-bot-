"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ANIME_CARDS, CardRarity } from './cards';
import seedrandom from 'seedrandom';

const BANNER_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

export interface FeaturedCharacter {
    id: string;
    name: string;
    anime: string;
    image: string;
    power: number;
    pity: number;
    lastRotation: number;
    rarity: CardRarity; // Add rarity here
}

interface GachaContextType {
    featuredCharacters: FeaturedCharacter[];
    setFeaturedCharacters: React.Dispatch<React.SetStateAction<FeaturedCharacter[]>>;
    currentFeatured: number;
    setCurrentFeatured: React.Dispatch<React.SetStateAction<number>>;
    timeRemaining: number;
}

const GachaContext = createContext<GachaContextType | undefined>(undefined);

const shuffleArray = (array: any[], seed: string) => {
    const rng = seedrandom(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateFeaturedCharacters = (rotationSeed: string, rotationStartTime: number): FeaturedCharacter[] => {
    const mythicCards = ANIME_CARDS.filter(card => card.rarity === 'Mythique');
    const shuffledMythics = shuffleArray([...mythicCards], rotationSeed);
    return shuffledMythics.slice(0, 3).map(card => ({
        id: card.id,
        name: card.name,
        anime: card.anime,
        image: card.image,
        power: card.power,
        pity: 0, // Initialisé à 0, sera mis à jour depuis le serveur
        lastRotation: rotationStartTime,
        rarity: card.rarity // Assign rarity
    }));
};

export const GachaProvider = ({ children }: { children: ReactNode }) => {
    const [featuredCharacters, setFeaturedCharacters] = useState<FeaturedCharacter[]>([]);
    const [currentFeatured, setCurrentFeatured] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        const now = Date.now();
        const rotationIndex = Math.floor(now / BANNER_DURATION_MS);
        const rotationSeed = `gacha-banner-${rotationIndex}`;
        const rotationStartTime = rotationIndex * BANNER_DURATION_MS;

        const storedState = localStorage.getItem('gachaBannerState');
        let loadedCharacters: FeaturedCharacter[] | null = null;

        if (storedState) {
            try {
                const { characters, seed } = JSON.parse(storedState);
                if (seed === rotationSeed) {
                    loadedCharacters = characters;
                }
            } catch (e) {
                console.error("Failed to parse gacha banner state from localStorage", e);
            }
        }

        const characters = loadedCharacters || generateFeaturedCharacters(rotationSeed, rotationStartTime);
        setFeaturedCharacters(characters);
        localStorage.setItem('gachaBannerState', JSON.stringify({ characters, seed: rotationSeed }));
    }, []); // S'exécute une seule fois au montage

    useEffect(() => {
        if (featuredCharacters.length > 0) {
            const timer = setInterval(() => {
                const now = Date.now();
                const rotationEndTime = featuredCharacters[currentFeatured].lastRotation + BANNER_DURATION_MS;
                setTimeRemaining(Math.max(0, rotationEndTime - now));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [featuredCharacters, currentFeatured]);

    return (
        <GachaContext.Provider value={{
            featuredCharacters,
            setFeaturedCharacters,
            currentFeatured,
            setCurrentFeatured,
            timeRemaining
        }}>
            {children}
        </GachaContext.Provider>
    );
};

export const useGacha = (): GachaContextType => {
    const context = useContext(GachaContext);
    if (context === undefined) {
        throw new Error('useGacha must be used within a GachaProvider');
    }
    return context;
};
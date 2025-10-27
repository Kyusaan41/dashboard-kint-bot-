"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ANIME_CARDS, CardRarity } from './cards';

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

const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateInitialFeatured = (): FeaturedCharacter[] => {
    const mythicCards = ANIME_CARDS.filter(card => card.rarity === 'Mythique');
    const shuffledMythics = shuffleArray([...mythicCards]);
    return shuffledMythics.slice(0, 3).map((card, index) => ({ // Use index for unique key if needed, but card.id is better
        id: card.id,
        name: card.name,
        anime: card.anime,
        image: card.image,
        power: card.power,
        pity: 0,
        lastRotation: Date.now(),
        rarity: card.rarity // Assign rarity
    }));
};

export const GachaProvider = ({ children }: { children: ReactNode }) => {
    const [featuredCharacters, setFeaturedCharacters] = useState<FeaturedCharacter[]>([]);
    const [currentFeatured, setCurrentFeatured] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        const storedState = localStorage.getItem('gachaBannerState');
        if (storedState) { // Check if storedState exists and is valid JSON
            const { characters, current } = JSON.parse(storedState);
            setFeaturedCharacters(characters);
            setCurrentFeatured(current);
        } else { // If no stored state, generate initial featured characters
            setFeaturedCharacters(generateInitialFeatured());
        }
    }, []);

    useEffect(() => {
        if (featuredCharacters.length > 0) {
            localStorage.setItem('gachaBannerState', JSON.stringify({ characters: featuredCharacters, current: currentFeatured }));

            const timer = setInterval(() => { // Update time remaining every second
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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { CardImage } from './CardImage';
import { AnimeCard } from './cards';

interface RevealedCardProps {
    card: AnimeCard;
    isNew: boolean;
    rarityStyles: {
        border: string;
        text: string;
        bg: string;
        shadow: string;
    };
    rarityStars: React.ReactNode[];
    isHighRarity: boolean;
    delay: number;
}

export function RevealedCard({ card, isNew, rarityStyles, rarityStars, isHighRarity, delay }: RevealedCardProps) {
    // Effet de lueur pour les cartes de haute rareté
    const highRarityGlow = isHighRarity && (
        <div className={`absolute inset-0 rounded-xl blur-xl ${
            card.rarity === 'Mythique' ? 'bg-yellow-500/30' : 'bg-purple-500/30'
        } -z-10`} />
    );
    
    return (
        <div className="relative w-full aspect-[5/7] bg-black/50 rounded-xl overflow-hidden">
            {/* Lignes de balayage en fond */}
            <motion.div
                className="absolute top-0 left-0 w-full h-2 bg-white/20"
                animate={{ y: [0, '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: delay * 0.1 }}
            />

            {/* Carte qui apparaît avec un effet de glitch */}
            <motion.div
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ 
                    opacity: [0, 0.5, 1, 0.8, 1],
                    filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                    scale: [1.1, 1],
                    x: [0, -10, 10, -5, 5, 0],
                }}
                transition={{ duration: 0.8, ease: "circOut", delay: delay * 0.1 + 0.5 }}
                className={`w-full h-full rounded-xl border-2 ${rarityStyles.border} bg-transparent 
                            flex flex-col justify-between p-3 text-center
                            shadow-lg ${rarityStyles.shadow} ${isHighRarity ? `shadow-2xl ${rarityStyles.shadow}` : ''} backdrop-blur-sm`}
            >
                {highRarityGlow}
                
                <motion.div 
                    className="relative z-10 flex-1 flex flex-col justify-center items-center overflow-hidden rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay * 0.1 + 1 }}
                >
                    <CardImage card={card} className="object-cover" />
                </motion.div>
                
                <motion.div 
                    className="relative z-10 flex-shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay * 0.1 + 1.1 }}
                >
                    <h3 className={`font-bold text-white text-sm mb-1 truncate ${isHighRarity ? 'tracking-wide' : ''}`}>{card.name}</h3>
                    <p className={`text-xs font-semibold mb-2 ${rarityStyles.text}`}>{card.rarity}</p>
                    <div className="flex justify-center gap-1">
                        {rarityStars}
                    </div>
                </motion.div>

                {isNew && (
                    <motion.div 
                        className="absolute top-2 right-2 px-2 py-0.5 bg-green-600/30 border border-green-500/50 rounded-full text-xs text-green-300 font-semibold z-20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: delay * 0.1 + 1.3 }}
                    >
                        NOUVEAU
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
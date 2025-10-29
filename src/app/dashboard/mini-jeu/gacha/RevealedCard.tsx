import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
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
    onAnimationComplete?: () => void;
}

export function RevealedCard({ card, isNew, rarityStyles, rarityStars, isHighRarity, onAnimationComplete }: RevealedCardProps) {
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        
        // Appelle la fonction de fin d'animation pour permettre de passer à la suivante
        timers.push(setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, 2500));

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [onAnimationComplete]);

    const cardVariants = {
        initial: { opacity: 0, y: 100, scale: 0.7 },
        enter: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
        },
        exit: { 
            opacity: 0, 
            y: -100, 
            scale: 0.8,
            transition: { duration: 0.4, ease: [0.45, 0, 0.55, 1] as const }
        }
    };

    return (
        <motion.div
            className="w-full max-w-xs md:max-w-sm h-auto"
            variants={cardVariants}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            <div className="w-full aspect-[5/7] perspective-1000">
                <div
                    className="relative w-full h-full"
                >
                    {/* Face de la carte (Personnage) */}
                    <div className={`absolute w-full h-full bg-gray-900 rounded-xl border-4 overflow-hidden ${rarityStyles.border}`}>
                        {isHighRarity && (
                            <>
                                <motion.div 
                                    className={`absolute inset-0 rounded-xl blur-2xl ${rarityStyles.bg} -z-10`} 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.4, transition: { delay: 0.5, duration: 0.5 } }}
                                />
                                <motion.div 
                                    className={`absolute inset-0 rounded-xl pointer-events-none`} 
                                    style={{ boxShadow: `inset 0 0 40px 10px ${rarityStyles.text.replace('text-', 'var(--color-')})` }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5, transition: { delay: 0.5, duration: 0.5 } }}
                                />
                            </>
                        )}
                        
                        <div className="absolute inset-0">
                            <CardImage card={card} className="absolute inset-0 w-full h-full object-cover" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                            <h3 className={`font-bold text-white text-2xl mb-1 truncate [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)] ${isHighRarity ? 'tracking-wide' : ''}`}>{card.name}</h3>
                            <p className={`text-md font-semibold mb-2 ${rarityStyles.text}`}>{card.rarity}</p>
                            <div className="flex justify-center gap-1.5">{rarityStars}</div>
                        </div>

                        {isNew && (
                            <motion.div
                                className="absolute top-2 right-2 px-3 py-1 bg-green-600/90 border border-green-400 rounded-full text-sm text-white font-semibold z-20"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 15, delay: 1 } }}
                            >
                                NOUVEAU
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
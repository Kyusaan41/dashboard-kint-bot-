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
	return (
		<motion.div
			className={`relative w-full aspect-[5/7] rounded-xl border-2 ${rarityStyles.border} overflow-hidden shadow-lg ${rarityStyles.shadow}`}
			initial={{ opacity: 0, scale: 0.8, y: 50 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut', delay: delay * 0.1 }}
		>
			{isHighRarity && <div className={`absolute inset-0 rounded-xl blur-xl ${card.rarity === 'Mythique' ? 'bg-yellow-500/30' : 'bg-purple-500/30'} -z-10`} />}
			
			{/* L'image prend maintenant tout l'espace */}
			<div className="absolute inset-0">
				<CardImage card={card} className="absolute inset-0 w-full h-full object-cover" />
			</div>

			{/* Les informations sont superposées en bas avec un dégradé */}
			<motion.div 
				className="absolute bottom-0 left-0 right-0 p-3 text-center bg-gradient-to-t from-black/80 via-black/50 to-transparent"
				initial={{ y: "100%", opacity: 0 }}
				animate={{ y: "0%", opacity: 1 }}
				transition={{ duration: 0.4, ease: 'easeOut', delay: delay * 0.1 + 0.3 }}
			>
				<h3 className={`font-bold text-white text-sm mb-1 truncate ${isHighRarity ? 'tracking-wide' : ''}`}>{card.name}</h3>
				<p className={`text-xs font-semibold mb-2 ${rarityStyles.text}`}>{card.rarity}</p>
				<div className="flex justify-center gap-1">{rarityStars}</div>
			</motion.div>

			{isNew && (
				<motion.div
					className="absolute top-2 right-2 px-2 py-0.5 bg-green-600/90 border border-green-400 rounded-full text-xs text-white font-semibold z-20"
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 300, damping: 15, delay: delay * 0.1 + 0.5 }}
				>
					NOUVEAU
				</motion.div>
			)}
		</motion.div>
	);
}
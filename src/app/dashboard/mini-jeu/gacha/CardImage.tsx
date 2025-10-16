import React, { useState } from 'react';
import { useCharacterImage } from './useCharacterImage';
import { AnimeCard } from './cards';

interface CardImageProps {
    card: AnimeCard;
    className?: string;
}

/**
 * Composant pour afficher l'image d'une carte avec chargement dynamique depuis Jikan API
 */
export function CardImage({ card, className = '' }: CardImageProps) {
    const [imageError, setImageError] = useState(false);
    const dynamicImageUrl = useCharacterImage(card.malId);

    // Si l'image dynamique n'est pas encore chargée ou a échoué
    if (!dynamicImageUrl || imageError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${className}`}>
                <span className="text-9xl">🎴</span>
            </div>
        );
    }

    // Afficher l'image chargée depuis l'API
    return (
        <img 
            src={dynamicImageUrl} 
            alt={card.name}
            className={`w-full h-full object-contain ${className}`}
            onError={() => setImageError(true)}
        />
    );
}
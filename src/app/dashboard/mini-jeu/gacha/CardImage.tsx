import React, { useState } from 'react';
import { AnimeCard } from './cards';

interface CardImageProps {
    card: AnimeCard;
    className?: string;
}

/**
 * Composant pour afficher l'image d'une carte à partir de l'URL fournie dans l'objet carte.
 */
export function CardImage({ card, className = '' }: CardImageProps) {
    const [imageError, setImageError] = useState(false);

    // Si l'URL de l'image n'est pas définie ou si une erreur de chargement s'est produite
    if (!card.image || imageError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${className}`}>
                <span className="text-6xl md:text-8xl opacity-50">🎴</span>
            </div>
        );
    }

    // Afficher l'image depuis l'URL directe
    return (
        <img 
            src={card.image} 
            alt={card.name}
            className={`w-full h-full object-cover ${className}`}
            onError={() => setImageError(true)}
        />
    );
}
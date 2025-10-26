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
    // Affiche directement l'image locale de la carte.
    // La logique de fallback n'est plus nécessaire car les images sont maintenant stockées localement.
    return (
        <img 
            src={card.image} 
            alt={card.name}
            className={`w-full h-full object-cover ${className}`}
        />
    );
}
import { useState, useEffect } from 'react';
import { getCharacterImage } from './jikanService';

/**
 * Hook React pour charger dynamiquement l'image d'un personnage depuis Jikan API
 * @param malId - MyAnimeList Character ID
 * @returns L'URL de l'image ou une chaîne vide si non chargée/erreur
 */
export function useCharacterImage(malId: number | undefined): string {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!malId) {
            setImageUrl('');
            return;
        }

        setIsLoading(true);
        
        getCharacterImage(malId)
            .then(url => {
                setImageUrl(url);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(`Failed to load image for character ${malId}:`, err);
                setImageUrl('');
                setIsLoading(false);
            });
    }, [malId]);

    return imageUrl;
}
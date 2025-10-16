// Service pour interagir avec l'API Jikan (MyAnimeList)
// Documentation: https://docs.api.jikan.moe/

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

interface CachedImage {
    url: string;
    timestamp: number;
}

// Cache en mémoire pour éviter trop d'appels API
const imageCache = new Map<number, CachedImage>();

/**
 * Récupère l'image d'un personnage depuis l'API Jikan
 * @param characterId - L'ID du personnage sur MyAnimeList
 * @returns L'URL de l'image du personnage
 */
export async function getCharacterImage(characterId: number): Promise<string> {
    // Vérifier le cache d'abord
    const cached = imageCache.get(characterId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.url;
    }

    try {
        // Respecter le rate limit de Jikan (3 requêtes par seconde)
        await new Promise(resolve => setTimeout(resolve, 350));

        const response = await fetch(`${JIKAN_BASE_URL}/characters/${characterId}`);
        
        if (!response.ok) {
            throw new Error(`Jikan API error: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.data?.images?.jpg?.image_url || data.data?.images?.webp?.image_url;

        if (!imageUrl) {
            throw new Error('No image found for character');
        }

        // Mettre en cache
        imageCache.set(characterId, {
            url: imageUrl,
            timestamp: Date.now()
        });

        // Sauvegarder dans localStorage pour persistance
        try {
            const localCache = JSON.parse(localStorage.getItem('jikan_image_cache') || '{}');
            localCache[characterId] = {
                url: imageUrl,
                timestamp: Date.now()
            };
            localStorage.setItem('jikan_image_cache', JSON.stringify(localCache));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }

        return imageUrl;
    } catch (error) {
        console.error(`Error fetching character ${characterId}:`, error);
        // Retourner une image par défaut en cas d'erreur
        return '';
    }
}

/**
 * Précharge les images de plusieurs personnages
 * @param characterIds - Liste des IDs de personnages
 */
export async function preloadCharacterImages(characterIds: number[]): Promise<void> {
    // Charger depuis localStorage d'abord
    try {
        const localCache = JSON.parse(localStorage.getItem('jikan_image_cache') || '{}');
        for (const [id, data] of Object.entries(localCache)) {
            const cached = data as CachedImage;
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                imageCache.set(parseInt(id), cached);
            }
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
    }

    // Charger les images manquantes par lots pour respecter le rate limit
    const missingIds = characterIds.filter(id => !imageCache.has(id));
    
    for (const id of missingIds) {
        await getCharacterImage(id);
    }
}

/**
 * Nettoie le cache expiré
 */
export function cleanExpiredCache(): void {
    const now = Date.now();
    for (const [id, cached] of imageCache.entries()) {
        if (now - cached.timestamp >= CACHE_DURATION) {
            imageCache.delete(id);
        }
    }

    // Nettoyer localStorage aussi
    try {
        const localCache = JSON.parse(localStorage.getItem('jikan_image_cache') || '{}');
        const cleaned: Record<string, CachedImage> = {};
        
        for (const [id, data] of Object.entries(localCache)) {
            const cached = data as CachedImage;
            if (now - cached.timestamp < CACHE_DURATION) {
                cleaned[id] = cached;
            }
        }
        
        localStorage.setItem('jikan_image_cache', JSON.stringify(cleaned));
    } catch (e) {
        console.warn('Failed to clean localStorage:', e);
    }
}
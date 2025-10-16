// Types pour le système de collection de cartes

export interface CardInCollection {
    cardId: string;
    count: number; // Nombre de fois que l'utilisateur possède cette carte
    obtainedAt: string; // Date d'obtention de la première carte
}

export interface AnimeCollection {
    anime: string; // Nom de l'anime
    cards: CardInCollection[]; // Cartes de cet anime
}

export interface UserCollection {
    userId: string; // Discord User ID
    username: string; // Discord Username
    collections: AnimeCollection[]; // Collections organisées par anime
    totalCards: number; // Nombre total de cartes (incluant les doublons)
    uniqueCards: number; // Nombre de cartes uniques
    lastUpdated: string; // Dernière mise à jour
}

export interface CollectionResponse {
    success: boolean;
    data?: UserCollection;
    error?: string;
}

export interface AddCardRequest {
    userId: string;
    username: string;
    cardId: string;
    anime: string;
}
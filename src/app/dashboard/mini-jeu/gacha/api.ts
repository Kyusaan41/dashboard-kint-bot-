/**
 * URL de base pour l'API du bot NyxNode.
 * Assurez-vous que cette URL est correcte pour votre environnement.
 */
export const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://193.70.34.25:20007';

export const API_ENDPOINTS = {
    casinoStats: `${BOT_API_URL}/api/casino/stats`,
    gachaCollection: `${BOT_API_URL}/api/gacha/collection`,
    userEconomy: `${BOT_API_URL}/api/currency/me`, // Endpoint pour la monnaie de l'utilisateur connecté
};
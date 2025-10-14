/**
 * Configuration des URLs d'API
 */

// URL de l'API NyxNode (bot Discord)
export const NYXNODE_API_URL = 'http://193.70.34.25:20007';

// Détermine si on utilise l'API du bot directement ou via les API routes Next.js
// En production, on utilise l'API du bot directement depuis le navigateur
// En développement, on utilise les API routes Next.js (proxy)
const USE_DIRECT_BOT_API = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';

// Endpoints du casino
export const CASINO_ENDPOINTS = {
    jackpot: USE_DIRECT_BOT_API ? `${NYXNODE_API_URL}/api/casino/jackpot` : '/api/casino/jackpot',
    jackpotIncrease: USE_DIRECT_BOT_API ? `${NYXNODE_API_URL}/api/casino/jackpot/increase` : '/api/casino/jackpot/increase',
    jackpotReset: USE_DIRECT_BOT_API ? `${NYXNODE_API_URL}/api/casino/jackpot/reset` : '/api/casino/jackpot/reset',
    topWins: USE_DIRECT_BOT_API ? `${NYXNODE_API_URL}/api/casino/top-wins` : '/api/casino/top-wins',
    stats: USE_DIRECT_BOT_API ? `${NYXNODE_API_URL}/api/casino/stats` : '/api/casino/stats',
};
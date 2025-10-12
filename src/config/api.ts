/**
 * Configuration des URLs d'API
 */

// URL de l'API NyxNode (bot Discord)
export const NYXNODE_API_URL = 'http://193.70.34.25:20007';

// Endpoints du casino (utilise les APIs Next.js locales pour éviter les problèmes de Mixed Content)
export const CASINO_ENDPOINTS = {
    jackpot: '/api/casino/jackpot',
    jackpotIncrease: '/api/casino/jackpot/increase',
    jackpotReset: '/api/casino/jackpot/reset',
    topWins: '/api/casino/top-wins',
};
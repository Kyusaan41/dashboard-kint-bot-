/**
 * Configuration des URLs d'API
 */

// URL de l'API NyxNode (bot Discord) - utilisée par les API routes Next.js
export const NYXNODE_API_URL = 'http://193.70.34.25:20007';

// Endpoints du casino - toujours via les API routes Next.js (proxy)
// Les API routes Next.js font le pont entre le navigateur et le bot
export const CASINO_ENDPOINTS = {
    jackpot: '/api/casino/jackpot',
    jackpotIncrease: '/api/casino/jackpot/increase',
    jackpotReset: '/api/casino/jackpot/reset',
    topWins: '/api/casino/top-wins',
    stats: '/api/casino/stats',
    xp: '/api/casino/xp',

    //GACHA
    marketplaceListings: `/api/gacha/marketplace`,
    marketplaceBuy: `/api/gacha/marketplace/buy`,
    marketplaceSell: `/api/gacha/marketplace/sell`

};
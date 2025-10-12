/**
 * Configuration des URLs d'API
 */

// URL de l'API NyxNode (bot Discord)
export const NYXNODE_API_URL = 'http://193.70.34.25:20007';

// Endpoints du casino
export const CASINO_ENDPOINTS = {
    jackpot: `${NYXNODE_API_URL}/api/casino/jackpot`,
    jackpotIncrease: `${NYXNODE_API_URL}/api/casino/jackpot/increase`,
    jackpotReset: `${NYXNODE_API_URL}/api/casino/jackpot/reset`,
};
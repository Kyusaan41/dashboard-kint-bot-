export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-domaine.com' 
  : '';

export const API_ENDPOINTS = {
  GACHA_COLLECTION: (userId) => `${API_BASE_URL}/api/bot/gacha/collection/${userId}`,
  GACHA_ADD_CARD: `${API_BASE_URL}/api/bot/gacha/collection`,
};
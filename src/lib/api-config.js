export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-domaine.com' 
  : '';
 
export const API_ENDPOINTS = {
  GACHA_COLLECTION: (userId) => `${API_BASE_URL}/api/bot/gacha/collection/${userId}`,
  GACHA_ADD_CARD: `${API_BASE_URL}/api/bot/gacha/collection`,
  // --- Nouveaux endpoints pour les Vœux ---
  gachaWishes: (userId) => `/api/gacha/wishes/${userId}`, // Pour récupérer le solde
  gachaBuyWishes: `/api/gacha/wishes/buy`,           // Pour acheter des vœux
  gachaSpendWishes: `/api/gacha/wishes/spend`,       // Pour dépenser des vœux (faire un tirage)
};
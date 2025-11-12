export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://193.70.34.25:20007' 
  : '';
 
export const API_ENDPOINTS = {
  GACHA_COLLECTION: (userId) => `/api/gacha/collection/${userId}`, // ✨ CORRECTION: Pointe vers la route proxy du dashboard
  GACHA_ADD_CARD: `${API_BASE_URL}/api/gacha/collection`,
  // --- Nouveaux endpoints pour les Vœux ---
  gachaWishes: (userId) => `/api/gacha/wishes/${userId}`, // Pour récupérer le solde
  gachaBuyWishes: `/api/gacha/wishes/buy`,           // Pour acheter des vœux
  gachaSpendWishes: (userId) => `/api/gacha/wishes/${userId}`, // Utilise la route dynamique
  gachaSellCard: `/api/gacha/collection/sell`,       // ✨ CORRECTION: Pointe vers la bonne route proxy
  // --- Nouveaux endpoints pour le Marché ---
  marketplaceListings: `/api/gacha/marketplace`,
  marketplaceBuy: `/api/gacha/marketplace/buy`, // Cette route devra être créée dans le dashboard
  marketplaceSell: `/api/gacha/marketplace`, // Pointe maintenant vers la route POST principale
  marketplaceRemove: `/api/gacha/marketplace/remove`
};
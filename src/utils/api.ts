// src/utils/api.ts

// Helper pour gérer les réponses de manière cohérente
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({ message: `Erreur réseau: ${response.statusText}` }));
        throw new Error(errorInfo.message || 'Une erreur inconnue est survenue.');
    }
    return response.json();
}

// --- Fonctions pour l'Administration ---

export async function getUsers() {
    return handleApiResponse(await fetch('/api/admin/users'));
}

export async function giveMoney(userId: string, amount: number) {
    return handleApiResponse(await fetch('/api/admin/give-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
    }));
}

export async function giveKip(userId: string, amount: number) {
    return handleApiResponse(await fetch('/api/admin/give-kip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
    }));
}

export async function restartBot() {
    return handleApiResponse(await fetch('/api/admin/restart-bot', {
        method: 'POST',
    }));
}

export async function giveItem(userId: string, itemName: string) {
    return handleApiResponse(await fetch('/api/admin/give-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemName }),
    }));
}

// --- Fonction pour les Logs ---

export async function getBotLogs() {
    const response = await fetch('/api/logs');
    if (!response.ok) {
        throw new Error('Impossible de récupérer les logs du bot.');
    }
    return handleApiResponse(response);
}

// --- Fonctions pour l'XP ---

export async function getXPByUser(userId: string) {
    return handleApiResponse(await fetch(`/api/users/${userId}/xp`));
}

export async function updateXP(userId: string, newXP: number) {
    return handleApiResponse(await fetch(`/api/users/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: newXP }),
    }));
}

// --- Fonctions pour la Monnaie (Currency) ---

export async function fetchCurrency(userId: string) {
    return handleApiResponse(await fetch(`/api/currency/${userId}`));
}

export async function updateCurrency(userId: string, newBalance: number) {
    return handleApiResponse(await fetch(`/api/currency/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: newBalance }),
    }));
}

// --- Fonctions pour les Points ---

export async function fetchPoints(userId: string) {
    return handleApiResponse(await fetch(`/api/points/${userId}`));
}

export async function updatePoints(userId: string, newPoints: number) {
    return handleApiResponse(await fetch(`/api/points/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPoints }),
    }));
}

// --- Fonctions pour le Classement ---

export async function getXPLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/xp'));
}

export async function getCurrencyLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/currency'));
}

export async function getPointsLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/points'));
}

// --- Fonctions pour le Magasin ---
export async function getShopItems(): Promise<any[]> {
    return handleApiResponse(await fetch('/api/shop'));
}

// --- MODIFICATION IMPORTANTE ICI ---
// buyItem accepte maintenant un tableau d'IDs d'objets et l'envoie correctement
export async function buyItem(itemIds: string[]) {
    return handleApiResponse(await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemIds }), // Le corps envoie un objet avec une clé 'items'
    }));
}

// --- Fonctions pour l'Inventaire ---

export async function getInventory() {
    return handleApiResponse(await fetch('/api/inventory'));
}

// --- AJOUT ET EXPORTATION DE LA FONCTION ---
/**
 * Récupère le statut du cooldown pour le KShield pour un utilisateur donné.
 * @param userId L'ID de l'utilisateur.
 */
export async function getKshieldStatus(userId: string) {
    return handleApiResponse(await fetch(`/api/shop/kshield-status/${userId}`));
}

export async function useKshield() {
    return handleApiResponse(await fetch('/api/kint/use-shield', {
        method: 'POST',
    }));
}

export async function getKintLogs() {
    return handleApiResponse(await fetch('/api/admin/kint-logs'));
}

export async function getAllAchievements() {
    return handleApiResponse(await fetch('/api/success/all'));
}

// --- NOUVELLE FONCTION POUR ENVOYER UN LOG DÉTAILLÉ À DISCORD VIA LE BOT ---
export async function sendKintLogToDiscord(logData: {
    userId: string;
    username: string;
    avatar: string;
    actionType: 'GAGNÉ' | 'PERDU';
    points: number;
    currentBalance: number;
    effect?: string;
}) {
    return handleApiResponse(await fetch('/api/log-kint-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
    }));
}
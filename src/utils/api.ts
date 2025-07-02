// src/utils/api.ts

// Helper pour gérer les réponses de manière cohérente
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({ message: `Erreur réseau: ${response.statusText}` }));
        throw new Error(errorInfo.message || 'Une erreur inconnue est survenue.');
    }
    return response.json();
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
    return handleApiResponse(await fetch(`/api/users/${userId}/currency`));
}

export async function updateCurrency(userId: string, newBalance: number) {
    return handleApiResponse(await fetch(`/api/users/${userId}/currency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: newBalance }),
    }));
}

// --- Fonctions pour les Points ---
export async function fetchPoints(userId: string) {
    return handleApiResponse(await fetch(`/api/users/${userId}/points`));
}

export async function updatePoints(userId: string, newPoints: number) {
    return handleApiResponse(await fetch(`/api/users/${userId}/points`, {
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
export async function getShopItems() {
    return handleApiResponse(await fetch('/api/shop'));
}

export async function buyItem(itemId: string) {
    return handleApiResponse(await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
    }));
}

// --- Fonctions pour l'Administration ---
export async function getUsers() {
    return handleApiResponse(await fetch('/api/admin/users'));
}

export async function giveItem(userId: string, itemName: string) {
    return handleApiResponse(await fetch('/api/admin/give-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemName }),
    }));
}

export async function giveKip(userId: string, amount: number) {
    return handleApiResponse(await fetch('/api/admin/give-kip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
    }));
}

export async function giveMoney(userId: string, amount: number) {
    return handleApiResponse(await fetch('/api/admin/give-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
    }));
}

// --- Fonctions pour l'Inventaire ---
export async function getInventory() {
    return handleApiResponse(await fetch('/api/inventory'));
}
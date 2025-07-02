// src/utils/api.ts

// Helper pour gérer les réponses
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({ message: `Erreur réseau: ${response.statusText}` }));
        throw new Error(errorInfo.message || 'Une erreur inconnue est survenue.');
    }
    return response.json();
}

// --- Fonctions que vos composants réclamaient ---

// Récupère les stats d'un utilisateur spécifique
export async function getXPByUser(userId: string) {
    return handleApiResponse(await fetch(`/api/user/${userId}/xp`));
}

export async function fetchCurrency(userId: string) {
    return handleApiResponse(await fetch(`/api/user/${userId}/currency`));
}

export async function fetchPoints(userId: string) {
    return handleApiResponse(await fetch(`/api/user/${userId}/points`));
}

// Met à jour les stats d'un utilisateur
export async function updateXP(userId: string, newXP: number) {
    return handleApiResponse(await fetch(`/api/user/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: newXP }),
    }));
}

export async function updateCurrency(userId: string, newBalance: number) {
    return handleApiResponse(await fetch(`/api/user/${userId}/currency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: newBalance }),
    }));
}

export async function updatePoints(userId: string, newPoints: number) {
    return handleApiResponse(await fetch(`/api/user/${userId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPoints }),
    }));
}


// --- Fonctions que nous avions déjà ---

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

export async function getXPLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/xp'));
}

export async function getCurrencyLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/currency'));
}

export async function getPointsLeaderboard() {
    return handleApiResponse(await fetch('/api/leaderboard/points'));
}

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

export async function getInventory() {
    return handleApiResponse(await fetch('/api/inventory'));
}
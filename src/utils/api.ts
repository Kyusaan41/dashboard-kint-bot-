// src/utils/api.ts

// Helper pour gérer les réponses de manière cohérente
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({ message: `Erreur réseau: ${response.statusText}` }));
        throw new Error(errorInfo.message || 'Une erreur inconnue est survenue.');
    }
    return response.json();
}

// --- FONCTION SSE MODIFIÉE ---
/**
 * S'abonne au flux d'événements SSE du serveur.
 * @param userId - L'ID de l'utilisateur qui s'abonne. Important pour que le bot sache à qui parler.
 * @param onEvent - Une fonction callback qui sera appelée à chaque fois qu'un événement est reçu.
 * @returns Une fonction pour se désabonner et fermer la connexion.
 */
export function subscribeToItemEvents(userId: string, onEvent: (data: any) => void) {
    if (!userId) {
        console.error("Impossible de s'abonner aux événements SSE sans userId.");
        return () => {}; // Retourne une fonction vide si pas d'ID
    }

    // On ajoute l'ID de l'utilisateur comme paramètre de requête.
    const eventSource = new EventSource(`/api/events?userId=${userId}`);

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onEvent(data);
        } catch (error) {
            console.error("Erreur de parsing des données SSE:", event.data);
        }
    };

    eventSource.onerror = (err) => {
        console.error("Erreur de connexion EventSource:", err);
        eventSource.close();
    };

    // Retourne une fonction de nettoyage pour fermer la connexion proprement
    return () => {
        eventSource.close();
    };
}


// --- Fonctions pour l'Administration ---

export async function getUsers() {
    return handleApiResponse(await fetch('/api/admin/users'));
}

export async function getServerMembers() {
    const serverInfo = await handleApiResponse(await fetch('/api/server/info'));
    return serverInfo.members || [];
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

export async function updateCurrency(userId: string, amountChange: number, source?: string) {
    return handleApiResponse(await fetch(`/api/currency/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountChange, source: source }),
    }));
}

// --- Fonctions pour les Points ---

export async function fetchPoints(userId: string) {
    return handleApiResponse(await fetch(`/api/points/${userId}`));
}

export async function updatePoints(userId: string, amountChange: number, source?: string) {
    return handleApiResponse(await fetch(`/api/points/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountChange, source: source }),
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

export async function buyItem(itemIds: string[]) {
    return handleApiResponse(await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemIds }),
    }));
}

// --- Fonctions pour l'Inventaire ---

export async function getInventory() {
    return handleApiResponse(await fetch('/api/inventory'));
}

export async function getKshieldStatus(userId: string) {
    return handleApiResponse(await fetch(`/api/shop/kshield-status/${userId}`));
}

export async function useItem(itemId: string, extraData: object = {}) {
    return handleApiResponse(await fetch('/api/inventory/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, extraData }),
    }));
}

export async function useKshield() {
    return handleApiResponse(await fetch('/api/kint/use-shield', {
        method: 'POST',
    }));
}

// --- Fonctions diverses ---

export async function getKintLogs() {
    return handleApiResponse(await fetch('/api/admin/kint-logs'));
}

export async function getAllAchievements() {
    return handleApiResponse(await fetch('/api/success/all'));
}

export async function sendKintLogToDiscord(logData: {
    userId: string;
    username: string;
    avatar: string;
    actionType: 'GAGNÉ' | 'PERDU';
    points: number;
    currentBalance: number;
    effect?: string;
    date: string;
    source: 'Discord' | 'Dashboard';
    reason: string;
}) {
    return handleApiResponse(await fetch('/api/log-kint-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
    }));
}

export async function getDetailedKintLogs(userId?: string): Promise<any[]> {
    const url = userId ? `/api/kint-detailed-logs?userId=${userId}` : '/api/kint-detailed-logs';
    return handleApiResponse(await fetch(url));
}

export async function getActiveEffects(userId: string) {
    return handleApiResponse(await fetch(`/api/effects/${userId}`));
}
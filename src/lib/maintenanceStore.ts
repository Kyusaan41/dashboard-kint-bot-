import { kv } from '@vercel/kv';

export interface MaintenanceStatus {
  status: 'online' | 'maintenance';
  message?: string;
  reason?: string;
  estimatedTime?: number; // en millisecondes
  lastUpdated: string;
  updatedBy?: string;
}

const getPageKey = (pageId: string): string => `maintenance:${pageId}`;

/**
 * Récupère le statut de maintenance pour une page spécifique depuis Vercel KV.
 * @param pageId L'identifiant de la page.
 * @returns Le statut de maintenance ou null si non trouvé.
 */
export async function getPageMaintenance(pageId: string): Promise<MaintenanceStatus | null> {
  try {
    const status = await kv.get<MaintenanceStatus>(getPageKey(pageId));
    return status;
  } catch (error) {
    console.error(`[Vercel KV] Erreur lors de la récupération du statut pour ${pageId}:`, error);
    return null;
  }
}

/**
 * Met à jour le statut de maintenance pour une page spécifique dans Vercel KV.
 * @param pageId L'identifiant de la page.
 * @param status Le nouveau statut de maintenance.
 */
export async function setPageMaintenance(pageId: string, status: MaintenanceStatus): Promise<void> {
  try {
    // Le TTL (Time To Live) est de 24 heures (en secondes).
    // Cela évite que des statuts de maintenance "oubliés" restent indéfiniment.
    await kv.set(getPageKey(pageId), status, { ex: 86400 });
  } catch (error) {
    console.error(`[Vercel KV] Erreur lors de la mise à jour du statut pour ${pageId}:`, error);
  }
}

/**
 * Supprime le statut de maintenance pour une page spécifique de Vercel KV.
 * @param pageId L'identifiant de la page.
 */
export async function clearPageMaintenance(pageId: string): Promise<void> {
  try {
    await kv.del(getPageKey(pageId));
  } catch (error) {
    console.error(`[Vercel KV] Erreur lors de la suppression du statut pour ${pageId}:`, error);
  }
}

/**
 * Récupère les statuts de maintenance pour toutes les pages.
 * @returns Un objet avec les pageIds comme clés et leurs statuts comme valeurs.
 */
export async function getAllMaintenanceStatus(): Promise<Record<string, MaintenanceStatus>> {
  const statuses: Record<string, MaintenanceStatus> = {};
  try {
    // Utilise un itérateur pour scanner toutes les clés correspondant au pattern.
    // C'est plus efficace que `keys` pour un grand nombre de clés.
    for await (const key of kv.scanIterator({ match: 'maintenance:*' })) {
      const pageId = key.replace('maintenance:', '');
      const status = await kv.get<MaintenanceStatus>(key);
      if (status) {
        statuses[pageId] = status;
      }
    }
    return statuses;
  } catch (error) {
    console.error('[Vercel KV] Erreur lors de la récupération de tous les statuts de maintenance:', error);
    return statuses; // Retourne un objet vide en cas d'erreur
  }
}
import { kv } from '@vercel/kv';

export interface MaintenanceStatus {
  status: 'online' | 'maintenance';
  message?: string;
  reason?: string;
  estimatedTime?: number; // en millisecondes
  lastUpdated: string;
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
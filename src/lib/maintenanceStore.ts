import redisClient, { ensureRedisConnection } from '@/lib/redis';

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
  await ensureRedisConnection();
  try {
    const statusString = await redisClient.get(getPageKey(pageId));
    if (!statusString) {
      return null;
    }
    // Redis stocke des chaînes, il faut donc parser le JSON.
    return JSON.parse(statusString) as MaintenanceStatus;
  } catch (error) {
    console.error(`[Redis] Erreur lors de la récupération du statut pour ${pageId}:`, error);
    return null;
  }
}

/**
 * Met à jour le statut de maintenance pour une page spécifique dans Vercel KV.
 * @param pageId L'identifiant de la page.
 * @param status Le nouveau statut de maintenance.
 */
export async function setPageMaintenance(pageId: string, status: MaintenanceStatus): Promise<void> {
  await ensureRedisConnection();
  try {
    // Le TTL (Time To Live) est de 24 heures (en secondes).
    // Cela évite que des statuts de maintenance "oubliés" restent indéfiniment.
    // Redis attend une chaîne, nous devons donc stringify l'objet.
    await redisClient.set(getPageKey(pageId), JSON.stringify(status), { EX: 86400 });
  } catch (error) {
    console.error(`[Redis] Erreur lors de la mise à jour du statut pour ${pageId}:`, error);
  }
}

/**
 * Supprime le statut de maintenance pour une page spécifique de Vercel KV.
 * @param pageId L'identifiant de la page.
 */
export async function clearPageMaintenance(pageId: string): Promise<void> {
  await ensureRedisConnection();
  try {
    await redisClient.del(getPageKey(pageId));
  } catch (error) {
    console.error(`[Redis] Erreur lors de la suppression du statut pour ${pageId}:`, error);
  }
}

/**
 * Récupère les statuts de maintenance pour toutes les pages.
 * @returns Un objet avec les pageIds comme clés et leurs statuts comme valeurs.
 */
export async function getAllMaintenanceStatus(): Promise<Record<string, MaintenanceStatus>> {
  const statuses: Record<string, MaintenanceStatus> = {};
  await ensureRedisConnection();
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: 'maintenance:*',
        COUNT: 100,
      });

      cursor = reply.cursor;
      const keys = reply.keys;

      if (keys.length > 0) {
        const values = await redisClient.mGet(keys);
        values.forEach((value, index) => {
          if (value) {
            const pageId = keys[index].replace('maintenance:', '');
            statuses[pageId] = JSON.parse(value) as MaintenanceStatus;
          }
        });
      }
    } while (cursor !== 0);

    return statuses;
  } catch (error) {
    console.error('[Redis] Erreur lors de la récupération de tous les statuts de maintenance:', error);
    return statuses; // Retourne un objet vide en cas d'erreur
  }
}
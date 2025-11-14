import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || process.env.KV_REDIS_URL;

if (!redisUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('La variable d\'environnement REDIS_URL est requise en production.');
  }
  console.warn('La variable d\'environnement REDIS_URL n\'est pas définie. Le service Redis sera indisponible.');
}

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Erreur du client Redis:', err));

/**
 * S'assure que le client Redis est connecté.
 * Ne fait rien si la connexion est déjà ouverte.
 */
export async function ensureRedisConnection() {
  if (!redisClient.isOpen && redisUrl) {
    await redisClient.connect();
  }
}

export default redisClient;
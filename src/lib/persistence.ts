import { store, Sanction } from './dataStore'
import redisClient, { ensureRedisConnection } from './redis'

const SANCTIONS_KEY = 'nyx:sanctions:v2'

export async function loadSanctionsFromDisk() {
  try {
    await ensureRedisConnection()
    const content = await redisClient.get(SANCTIONS_KEY)
    if (content) {
      const parsed: Sanction[] = JSON.parse(content)
      if (Array.isArray(parsed)) {
        store.sanctions = parsed
      }
    }
  } catch (e) {
    console.error('[Sanctions Persistence] Failed to load from Redis:', e)
    // Keep current in-memory data
  }
}

export async function saveSanctionsToDisk() {
  try {
    await ensureRedisConnection()
    const serialized = JSON.stringify(store.sanctions, null, 2)
    await redisClient.set(SANCTIONS_KEY, serialized)
  } catch (e) {
    console.error('[Sanctions Persistence] Failed to save to Redis:', e)
  }
}

/**
 * Centralized maintenance status storage using Redis
 * Migrated from @vercel/kv to redis client for better control and flexibility
 */

import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  const url = process.env.REDIS_URL
  if (!url) {
    throw new Error('REDIS_URL environment variable is not set')
  }

  redisClient = createClient({ url })
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  await redisClient.connect()
  return redisClient
}

export interface MaintenanceRecord {
  status: 'online' | 'maintenance'
  message?: string
  reason?: string
  estimatedTime?: number // in milliseconds
  lastUpdated: string
  updatedBy?: string
}

const KV_PREFIX = 'maintenance:'

// Helper function to build KV key
function getKey(pageId: string): string {
  return `${KV_PREFIX}${pageId}`
}

// Helper function to safely handle Redis operations with fallback
async function withFallback<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`⚠️ Redis operation failed (${operationName}):`, error)
    console.log(`⚠️ Using fallback for ${operationName}`)
    return fallbackValue
  }
}

// Set page maintenance status
export async function setPageMaintenance(
  pageId: string,
  record: Omit<MaintenanceRecord, 'lastUpdated'>
): Promise<void> {
  const maintenanceRecord: MaintenanceRecord = {
    ...record,
    lastUpdated: new Date().toISOString()
  }

  await withFallback(
    async () => {
      const client = await getRedisClient()
      await client.set(getKey(pageId), JSON.stringify(maintenanceRecord))
    },
    undefined,
    `setPageMaintenance(${pageId})`
  )

  console.log(`✅ Maintenance status updated for page: ${pageId}`)
}

// Get page maintenance status
export async function getPageMaintenance(
  pageId: string
): Promise<MaintenanceRecord | undefined> {
  return withFallback(
    async () => {
      const client = await getRedisClient()
      const data = await client.get(getKey(pageId))
      return data ? JSON.parse(data) : undefined
    },
    undefined,
    `getPageMaintenance(${pageId})`
  )
}

// Get all maintenance statuses
export async function getAllMaintenanceStatus(): Promise<
  Record<string, MaintenanceRecord>
> {
  return withFallback(
    async () => {
      const client = await getRedisClient()
      const keys = await client.keys(`${KV_PREFIX}*`)
      if (keys.length === 0) return {}

      const result: Record<string, MaintenanceRecord> = {}

      for (const key of keys) {
        const pageId = key.replace(KV_PREFIX, '')
        const data = await client.get(key)
        if (data) {
          result[pageId] = JSON.parse(data)
        }
      }

      return result
    },
    {},
    'getAllMaintenanceStatus'
  )
}

// Clear page maintenance status
export async function clearPageMaintenance(pageId: string): Promise<void> {
  await withFallback(
    async () => {
      const client = await getRedisClient()
      await client.del(getKey(pageId))
    },
    undefined,
    `clearPageMaintenance(${pageId})`
  )

  console.log(`✅ Maintenance status cleared for page: ${pageId}`)
}

// Check if page is in maintenance
export async function isPageInMaintenance(pageId: string): Promise<boolean> {
  const status = await getPageMaintenance(pageId)
  return status?.status === 'maintenance'
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import redisClient, { ensureRedisConnection } from '@/lib/redis'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await ensureRedisConnection()

    // Get all ban keys and delete them
    const keys = await redisClient.keys('ban:*')
    if (keys.length > 0) {
      await redisClient.del(keys)
    }

    return NextResponse.json({ success: true, message: `Removed ${keys.length} bans` })
  } catch (error) {
    console.error('Error resetting bans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
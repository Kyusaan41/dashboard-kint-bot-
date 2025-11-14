import { NextResponse } from 'next/server'
import redisClient, { ensureRedisConnection } from '@/lib/redis'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ banned: false })
    }

    await ensureRedisConnection()
    const banData = await redisClient.get(`ban:${userId}`)

    if (!banData) {
      return NextResponse.json({ banned: false })
    }

    const ban = JSON.parse(banData)
    const now = Date.now()

    // Check if ban has expired
    if (ban.expiresAt && ban.expiresAt <= now) {
      // Ban expired, remove it
      await redisClient.del(`ban:${userId}`)
      return NextResponse.json({ banned: false })
    }

    return NextResponse.json({
      banned: true,
      reason: ban.reason,
      expiresAt: ban.expiresAt || null,
      bannedAt: ban.bannedAt,
    })
  } catch (error) {
    console.error('ban-check error', error)
    return NextResponse.json({ banned: false })
  }
}

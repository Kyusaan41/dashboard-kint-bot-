import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import redisClient, { ensureRedisConnection } from '@/lib/redis'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await ensureRedisConnection()

    // Get all ban keys
    const keys = await redisClient.keys('ban:*')
    const bans = []

    for (const key of keys) {
      const userId = key.replace('ban:', '')
      const data = await redisClient.get(key)
      if (data) {
        try {
          const ban = JSON.parse(data)
          bans.push({
            userId,
            ...ban
          })
        } catch (e) {
          console.error('Error parsing ban data for', userId, e)
        }
      }
    }

    return NextResponse.json({ bans })
  } catch (error) {
    console.error('Error fetching bans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, reason, duration } = body

    if (!userId || !reason) {
      return NextResponse.json({ error: 'Missing userId or reason' }, { status: 400 })
    }

    await ensureRedisConnection()

    const now = Date.now()
    const banData = {
      reason,
      bannedAt: now,
      expiresAt: duration ? now + (duration * 60 * 1000) : null, // duration in minutes
      bannedBy: session.user.id
    }

    await redisClient.set(`ban:${userId}`, JSON.stringify(banData))

    return NextResponse.json({ success: true, ban: { userId, ...banData } })
  } catch (error) {
    console.error('Error creating ban:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    await ensureRedisConnection()
    await redisClient.del(`ban:${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing ban:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
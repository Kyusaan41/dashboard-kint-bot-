import { NextResponse } from 'next/server'
import { store } from '@/lib/dataStore'
import { loadSanctionsFromDisk } from '@/lib/persistence'

let sanctionsLoaded = false
async function ensureSanctionsLoaded() {
  if (!sanctionsLoaded) {
    await loadSanctionsFromDisk()
    sanctionsLoaded = true
  }
}

export async function GET(request: Request) {
  try {
    await ensureSanctionsLoaded()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ banned: false })
    }

    const now = Date.now()
    const activeBan = store.sanctions.find(s => {
      if (!s.active) return false
      if (s.userId !== userId) return false
      if (s.type !== 'ban') return false
      if (s.expiresAt && new Date(s.expiresAt).getTime() <= now) return false
      return true
    })

    if (!activeBan) {
      return NextResponse.json({ banned: false })
    }

    return NextResponse.json({
      banned: true,
      reason: activeBan.reason,
      expiresAt: activeBan.expiresAt || null,
      createdAt: activeBan.createdAt,
    })
  } catch (error) {
    console.error('ban-check error', error)
    return NextResponse.json({ banned: false })
  }
}

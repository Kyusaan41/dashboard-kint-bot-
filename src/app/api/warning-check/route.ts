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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ warning: null })
    }

    await ensureSanctionsLoaded()

    // Find active warnings for this user
    const activeWarning = store.sanctions.find(s =>
      s.userId === userId &&
      s.type === 'warn' &&
      s.active &&
      (!s.expiresAt || new Date(s.expiresAt) > new Date())
    )

    if (!activeWarning) {
      return NextResponse.json({ warning: null })
    }

    return NextResponse.json({
      warning: {
        id: activeWarning.id,
        reason: activeWarning.reason,
        createdAt: activeWarning.createdAt,
        expiresAt: activeWarning.expiresAt,
      }
    })
  } catch (error) {
    console.error('warning-check error', error)
    return NextResponse.json({ warning: null })
  }
}
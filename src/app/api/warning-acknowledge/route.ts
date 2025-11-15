import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'
import { loadSanctionsFromDisk, saveSanctionsToDisk } from '@/lib/persistence'

let sanctionsLoaded = false
async function ensureSanctionsLoaded() {
  if (!sanctionsLoaded) {
    await loadSanctionsFromDisk()
    sanctionsLoaded = true
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { warningId } = body

    if (!warningId) {
      return NextResponse.json({ error: 'Missing warningId' }, { status: 400 })
    }

    await ensureSanctionsLoaded()

    const warningIndex = store.sanctions.findIndex(s =>
      s.id === warningId &&
      s.userId === session.user.id &&
      s.type === 'warn' &&
      s.active
    )

    if (warningIndex === -1) {
      return NextResponse.json({ error: 'Warning not found or not active' }, { status: 404 })
    }

    // Mark the warning as inactive (acknowledged)
    store.sanctions[warningIndex].active = false
    await saveSanctionsToDisk()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error acknowledging warning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
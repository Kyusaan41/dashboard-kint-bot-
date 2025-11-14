import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'
import { saveSanctionsToDisk } from '@/lib/persistence'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Reset sanctions to empty array
    store.sanctions = []
    await saveSanctionsToDisk()

    return NextResponse.json({ success: true, message: 'All sanctions have been reset' })
  } catch (error) {
    console.error('Error resetting sanctions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
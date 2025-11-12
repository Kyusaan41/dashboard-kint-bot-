import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { store } from '@/lib/dataStore'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Pages are maintained in-memory in store.pages for now

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const pages = store.pages

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
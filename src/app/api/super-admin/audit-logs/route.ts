import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim())

// Simple in-memory storage for audit logs (replace with DB in production)
let auditLogs: Array<{
  id: string
  timestamp: string
  adminId: string
  adminName: string
  action: string
  targetId?: string
  targetName?: string
  details: string
  status: 'success' | 'failed'
}> = []

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    const paginatedLogs = auditLogs.slice(-limit - offset, -offset || undefined).reverse()

    return NextResponse.json({
      logs: paginatedLogs,
      total: auditLogs.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
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
    const { action, targetId, targetName, details, status = 'success' } = body

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      adminId: session.user.id,
      adminName: session.user.name || 'Unknown',
      action,
      targetId,
      targetName,
      details,
      status,
    }

    auditLogs.push(logEntry)

    // Keep only last 1000 logs in memory
    if (auditLogs.length > 1000) {
      auditLogs = auditLogs.slice(-1000)
    }

    return NextResponse.json({ success: true, log: logEntry })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
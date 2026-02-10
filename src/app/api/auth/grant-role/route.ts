import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId') || process.env.DEFAULT_GUILD_ID;
    
    if (!guildId) {
      return NextResponse.json({ error: 'No guildId provided' }, { status: 400 });
    }

    const roleEndpoint = process.env.DASHBOARD_ROLE_ENDPOINT || (process.env.SERVER_URL ? `${process.env.SERVER_URL.replace(/\/+$/,'')}/api/grant-role` : null);
    
    if (!roleEndpoint) {
      console.warn('[grant-role] no SERVER_URL or DASHBOARD_ROLE_ENDPOINT configured');
      return NextResponse.json({ error: 'Role endpoint not configured' }, { status: 500 });
    }

    // Create payload for bot
    const payload = {
      uid: session.user.id,
      guildId: guildId,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes expiry
    };
    
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', process.env.DASHBOARD_SECRET || '').update(payloadB64).digest('hex');

    const payloadForBot = { token: payloadB64, sig: hmac };
    
    console.log('[grant-role] calling bot role endpoint', { guildId, userId: session.user.id });
    
    const botRes = await fetch(roleEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadForBot),
    });

    if (!botRes.ok) {
      const text = await botRes.text().catch(() => '<no body>');
      console.warn('[grant-role] bot role endpoint returned non-OK', { status: botRes.status, body: text });
      return NextResponse.json({ error: 'Failed to grant role', details: text }, { status: botRes.status });
    }

    console.log('[grant-role] bot role endpoint succeeded');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[grant-role] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

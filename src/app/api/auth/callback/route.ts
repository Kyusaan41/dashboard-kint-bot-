import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenParam = searchParams.get('token');
  const sigParam = searchParams.get('sig') || searchParams.get('signature');

  console.log('[auth/callback] incoming query', { code: !!code, hasToken: !!tokenParam, sigParam: !!sigParam });

  // If a token is provided by the bot, verify HMAC and create a session cookie
  if (tokenParam) {
    const dashboardSecret = process.env.DASHBOARD_SECRET;
    console.log('[auth/callback] token flow started');
    if (!dashboardSecret) {
      console.warn('[auth/callback] DASHBOARD_SECRET is not set');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // token may be of form "payload.sig" or payload + separate sig query
    let payloadB64 = tokenParam;
    let sig = sigParam || '';
    if (tokenParam.includes('.')) {
      const parts = tokenParam.split('.');
      payloadB64 = parts[0];
      sig = parts[1] || '';
    }

    // compute HMAC-SHA256 over the base64url payload
    const hmac = crypto.createHmac('sha256', dashboardSecret).update(payloadB64).digest('hex');
    try {
      const sigBuf = Buffer.from(sig, 'hex');
      const hmacBuf = Buffer.from(hmac, 'hex');
      if (sigBuf.length !== hmacBuf.length || !crypto.timingSafeEqual(sigBuf, hmacBuf)) {
        console.warn('[auth/callback] HMAC verification failed');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      console.log('[auth/callback] HMAC verification succeeded');
    } catch (e) {
      console.error('[auth/callback] HMAC verification error', String(e));
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // decode base64url payload
    let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    let payloadJson: any;
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      payloadJson = JSON.parse(decoded);
      console.log('[auth/callback] payload decoded', { keys: Object.keys(payloadJson || {}) });
    } catch (e) {
      console.error('[auth/callback] payload decode error', String(e));
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // check expiry (assume exp is in seconds)
    if (payloadJson.exp && Number(payloadJson.exp) * 1000 < Date.now()) {
      console.warn('[auth/callback] token expired');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    const maxAge = payloadJson.exp ? Math.max(0, Math.floor((Number(payloadJson.exp) * 1000 - Date.now()) / 1000)) : 60 * 60 * 24 * 7;
    response.cookies.set('session', JSON.stringify(payloadJson), {
      httpOnly: true,
      maxAge,
      path: '/',
    });
    console.log('[auth/callback] session cookie set', { maxAge });

    // Attempt to notify the bot to grant the role automatically
    (async () => {
      try {
        const roleEndpoint = process.env.DASHBOARD_ROLE_ENDPOINT || (process.env.SERVER_URL ? `${process.env.SERVER_URL.replace(/\/+$/,'')}/api/dashboard/grant-role` : null);
        if (!roleEndpoint) {
          console.warn('[auth/callback] no SERVER_URL or DASHBOARD_ROLE_ENDPOINT configured, skipping role grant');
          return;
        }

        const payloadForBot = { token: payloadB64, sig: hmac };
        console.log('[auth/callback] calling bot role endpoint', { roleEndpoint });
        const botRes = await fetch(roleEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadForBot),
        });

        if (!botRes.ok) {
          const text = await botRes.text().catch(() => '<no body>');
          console.warn('[auth/callback] bot role endpoint returned non-OK', { status: botRes.status, body: text });
        } else {
          console.log('[auth/callback] bot role endpoint succeeded');
        }
      } catch (e) {
        console.error('[auth/callback] error calling bot role endpoint', String(e));
      }
    })();

    return response;
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const data = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    scope: 'identify guilds',
  });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const tokenJson = await tokenRes.json();
  const access_token = tokenJson.access_token;

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userJson = await userRes.json();

  const response = NextResponse.redirect(new URL('/dashboard', request.url));

  response.cookies.set('user', JSON.stringify(userJson), {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}


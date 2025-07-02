import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

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

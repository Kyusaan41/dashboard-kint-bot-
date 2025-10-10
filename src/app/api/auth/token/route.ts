import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json();

  const params = new URLSearchParams();
  params.append('client_id', process.env.DISCORD_CLIENT_ID!);
  params.append('client_secret', process.env.DISCORD_CLIENT_SECRET!);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI!);
  params.append('scope', 'identify guilds');

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 });
  }

  const data = await response.json();

  return NextResponse.json(data);
}


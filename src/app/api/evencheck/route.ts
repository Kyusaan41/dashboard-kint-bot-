import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET ? 'set' : 'unset',
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });
}

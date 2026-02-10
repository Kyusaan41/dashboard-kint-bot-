import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get('guildId');
  
  // Redirect to login page with guildId if provided
  const callbackUrl = guildId ? `/login?guildId=${guildId}` : '/login';
  
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}

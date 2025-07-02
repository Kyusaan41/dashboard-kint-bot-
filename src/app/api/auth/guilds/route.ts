import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Auth Header:', authHeader);

  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: authHeader,
    },
  });

  console.log('Discord response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Discord API error:', errorText);
    return NextResponse.json({ error: 'Failed to fetch guilds', details: errorText }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

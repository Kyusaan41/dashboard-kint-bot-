import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

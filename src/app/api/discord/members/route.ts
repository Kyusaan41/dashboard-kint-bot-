import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
  try {
    const res = await fetch(`${BOT_API_URL}/serverinfo`);
    if (!res.ok) {
      const text = await res.text();
      console.error(`Bot API /serverinfo error ${res.status}: ${text}`);
      return NextResponse.json({ members: [] }, { status: res.status });
    }
    const data = await res.json();
    const members = Array.isArray(data?.members) ? data.members : [];

    const simplified = members.map((m: any) => ({
      id: m.id,
      username: m.username,
      avatar: m.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(String(m.id).slice(-1)) % 5}.png`,
    }));

    return NextResponse.json({ members: simplified });
  } catch (e) {
    console.error('Error fetching discord members:', e);
    return NextResponse.json({ members: [] }, { status: 500 });
  }
}

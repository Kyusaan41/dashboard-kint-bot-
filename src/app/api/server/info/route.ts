import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://193.70.34.25:20007/api/server/info', { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ id: '', name: 'Serveur', icon: null }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur dans /api/server/info:', error);
    return NextResponse.json({ id: '', name: 'Serveur', icon: null }, { status: 200 });
  }
}


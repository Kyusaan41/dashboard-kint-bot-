import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://193.70.34.25:20007/api/server/info');
    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur lors de la rÃ©cupÃ©ration des infos serveur' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur dans /api/server/info:', error);
    return NextResponse.json({ error: 'Impossible de charger les infos serveur' }, { status: 500 });
  }
}


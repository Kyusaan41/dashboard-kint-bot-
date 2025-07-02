import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://51.83.103.24:20077/api/serverinfo');
    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des infos serveur' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur dans /api/server/info:', error);
    return NextResponse.json({ error: 'Impossible de charger les infos serveur' }, { status: 500 });
  }
}

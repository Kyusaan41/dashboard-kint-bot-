// app/api/logs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // L'URL de ton bot hébergé sur Katabump
    const response = await fetch('http://51.83.103.24:20077/api/logs');

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur côté bot lors de la récupération des logs' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ logs: data.logs || [] });
  } catch (error) {
    console.error('Erreur dans l\'API logs (route.ts) :', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les logs du bot.' },
      { status: 500 }
    );
  }
}

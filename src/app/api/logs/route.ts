// app/api/logs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // L'URL de ton bot hÃ©bergÃ© sur Katabump
    const response = await fetch('http://193.70.34.25:20007/api/logs');

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur cÃ´tÃ© bot lors de la rÃ©cupÃ©ration des logs' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ logs: data.logs || [] });
  } catch (error) {
    console.error('Erreur dans l\'API logs (route.ts) :', error);
    return NextResponse.json(
      { error: 'Impossible de rÃ©cupÃ©rer les logs du bot.' },
      { status: 500 }
    );
  }
}


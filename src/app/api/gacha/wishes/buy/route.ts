import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // On se contente de faire suivre la requête au bot.
    // Le bot est responsable de la logique d'ajout des vœux.
    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de l\'achat de vœux' }, { status: 500 });
  }
}


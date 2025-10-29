import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Body envoyé au bot:', body);

    const res = await fetch(`${BOT_BASE_URL}/gacha/cards/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text(); // Lire en texte brut
    let data;
    try {
      data = JSON.parse(text); // Essayer de parser en JSON
    } catch {
      data = { error: 'Réponse du bot non valide', raw: text };
    }

    console.log('Réponse du bot:', data);

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur relai sell card:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la vente de la carte' }, { status: 500 });
  }
}



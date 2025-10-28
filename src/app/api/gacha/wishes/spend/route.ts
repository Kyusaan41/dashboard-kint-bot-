import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // On fait suivre la requête de dépense de vœux au bot.
    // Le bot gérera la déduction des vœux et le tirage des cartes.
    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la dépense de vœux' }, { status: 500 });
  }
}


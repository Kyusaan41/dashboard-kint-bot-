// c:\Users\Kyusa\Documents\dashboard-kint-bot-clean\src\app\api\gacha\wishes\[userId]\route.ts

import { NextRequest, NextResponse } from 'next/server';

// L'adresse de votre bot
const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

// Cette fonction est appelée quand une requête GET est faite à /api/gacha/wishes/[quelquechose]
export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  // 1. ✨ CORRECTION: On attend que les paramètres soient disponibles
  const { userId } = context.params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
  }

  try {
    // 2. On transmet la demande au bot en utilisant cet ID
    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/${userId}`);
    
    // 3. On récupère la réponse du bot
    const data = await res.json();
    
    // 4. On renvoie la réponse du bot au front-end
    return NextResponse.json(data);
  } catch (error) {
    // En cas d'erreur, on renvoie une erreur au front-end
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ✨ AJOUT: Cette fonction est appelée quand une requête POST est faite (pour dépenser des vœux)
export async function POST(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const body = await request.json(); // On récupère le corps de la requête
    // On fait suivre la requête de dépense de vœux au bot.
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

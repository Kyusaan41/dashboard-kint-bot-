// c:\Users\Kyusa\Documents\dashboard-kint-bot-clean\src\app\api\gacha\wishes\[userId]\route.ts

import { NextRequest, NextResponse } from 'next/server';

// Adresse de votre bot
const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

// =======================
// GET : récupérer les vœux d'un utilisateur
// =======================
export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/${userId}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// =======================
// POST : dépenser des vœux
// =======================
export async function POST(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const body = await request.json();

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

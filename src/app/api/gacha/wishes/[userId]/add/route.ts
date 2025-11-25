import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

// POST : ajouter des vœux (pour season pass, etc.)
export async function POST(req: NextRequest, ctx: any) {
  const { userId } = ctx.params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Appeler l'API bot pour ajouter des wishes
    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        amount
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur POST add wishes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'ajout de vœux' },
      { status: 500 }
    );
  }
}
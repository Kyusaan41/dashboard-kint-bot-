import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

// GET : récupérer les vœux
export async function GET(req: NextRequest, ctx: any) {
  const { userId } = ctx.params;

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

// POST : dépenser des vœux
export async function POST(req: NextRequest, ctx: any) {
  const { userId } = ctx.params; // optionnel, si ton bot en a besoin

  try {
    const body = await req.json();

    const res = await fetch(`${BOT_BASE_URL}/gacha/wishes/spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur lors de la dépense de vœux' },
      { status: 500 }
    );
  }
}

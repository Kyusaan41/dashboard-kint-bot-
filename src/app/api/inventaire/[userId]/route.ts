import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }  // params est une promesse maintenant
) {
  const params = await context.params; // await ici !
  const { userId } = params;

  try {
    const res = await fetch(`${BOT_BASE_URL}/inventaire/${userId}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur récupération inventaire bot' }, { status: res.status });
    }
    const inventaire = await res.json();

    return NextResponse.json(inventaire);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params;
  const { userId } = params;
  const body = await request.json();

  console.log('[POST /api/inventaire]', { userId, body });

  try {
    const res = await fetch(`${BOT_BASE_URL}/inventaire/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[POST /api/inventaire] erreur bot:', errorText);
      return NextResponse.json({ error: `Erreur mise à jour inventaire: ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    console.log('[POST /api/inventaire] succès:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/inventaire] erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

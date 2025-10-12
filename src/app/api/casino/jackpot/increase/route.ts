import { NextRequest, NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// POST /api/casino/jackpot/increase - Augmenter le jackpot sur NyxNode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    const res = await fetch(`${BOT_API_URL}/casino/jackpot/increase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error || 'Erreur serveur NyxNode' },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log(`[JACKPOT] Augmenté de ${amount} → Nouveau total: ${data.newAmount || data.amount}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur increase jackpot:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'augmentation du jackpot' },
      { status: 500 }
    );
  }
}
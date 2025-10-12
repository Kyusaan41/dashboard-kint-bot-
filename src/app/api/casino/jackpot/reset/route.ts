import { NextRequest, NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// POST /api/casino/jackpot/reset - Réinitialiser le jackpot sur NyxNode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    // Montant par défaut si non spécifié
    const resetAmount = typeof amount === 'number' && amount >= 0 ? amount : 10000;

    const res = await fetch(`${BOT_API_URL}/casino/jackpot/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: resetAmount })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error || 'Erreur serveur NyxNode' },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log(`[JACKPOT] Réinitialisé à ${resetAmount}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur reset jackpot:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du jackpot' },
      { status: 500 }
    );
  }
}
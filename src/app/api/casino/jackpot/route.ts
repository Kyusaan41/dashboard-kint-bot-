import { NextRequest, NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET /api/casino/jackpot - Récupérer le jackpot actuel depuis NyxNode
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BOT_API_URL}/casino/jackpot`);
    
    if (!res.ok) {
      console.warn('Erreur récupération jackpot depuis NyxNode, status:', res.status);
      // Retourner une valeur par défaut si le serveur ne répond pas
      return NextResponse.json({ amount: 10000 }, { status: 200 });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur GET jackpot:', error);
    // Retourner une valeur par défaut en cas d'erreur
    return NextResponse.json({ amount: 10000 }, { status: 200 });
  }
}

// POST /api/casino/jackpot - Mettre à jour le jackpot sur NyxNode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    const res = await fetch(`${BOT_API_URL}/casino/jackpot`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur POST jackpot:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du jackpot' },
      { status: 500 }
    );
  }
}
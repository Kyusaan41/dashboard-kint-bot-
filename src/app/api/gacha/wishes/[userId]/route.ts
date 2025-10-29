// c:\Users\Kyusa\Documents\dashboard-kint-bot-clean\src\app\api\gacha\wishes\[userId]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

// Cette fonction est appelée quand une requête GET est faite à /api/gacha/wishes/[quelquechose]
export async function GET(
  // ✨ CORRECTION: La signature de la fonction est mise à jour pour correspondre à ce que Next.js attend.
  // Le premier argument est la requête, le second est le contexte avec les paramètres.
  request: Request, 
  { params }: { params: { userId: string } }
) {
  // 1. ✨ CORRECTION: On attend que les paramètres soient disponibles
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
  }

  try {
    // 2. On transmet la demande au bot en utilisant cet ID
    const res = await fetch(`${NYXNODE_API_URL}/api/gacha/wishes/${userId}`);
    
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
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json(); // On récupère le corps de la requête
    // On fait suivre la requête de dépense de vœux au bot.
    const res = await fetch(`${NYXNODE_API_URL}/api/gacha/wishes/spend`, {
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

import { NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

/**
 * Supprimer une annonce du marché (par son propriétaire)
 * Proxy vers NyxNode: POST /api/gacha/marketplace/remove
 * Body attendu: { userId: string, listingId: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.userId || !body?.listingId) {
      return NextResponse.json({ success: false, message: 'Paramètres manquants' }, { status: 400 });
    }

    const botResponse = await fetch(`${NYXNODE_API_URL}/api/gacha/marketplace/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseData = await botResponse.json();
    return NextResponse.json(responseData, { status: botResponse.status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[MARKETPLACE REMOVE] Erreur:', error);
    return NextResponse.json({ success: false, message: 'Erreur de communication avec le serveur du bot.' }, { status: 502 });
  }
}

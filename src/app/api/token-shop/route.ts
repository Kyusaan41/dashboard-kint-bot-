import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET pour récupérer les offres de la boutique de jetons
export async function GET() {
  try {
    // Si ton routeur shop est monté sur /api/shop, le chemin complet sera /api/shop/shopjetons
    const response = await fetch(`${BOT_API_URL}/shop/shopjetons`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur de l'API du bot (shopjetons) [${response.status}]: ${errorText}`);
      return NextResponse.json(
        { message: "Impossible de récupérer les offres de la boutique de jetons." },
        { status: response.status }
      );
    }

    const items = await response.json();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erreur interne du dashboard (token-shop):', error);
    return NextResponse.json(
      { message: "Impossible de contacter le serveur du bot pour la boutique de jetons." },
      { status: 500 }
    );
  }
}

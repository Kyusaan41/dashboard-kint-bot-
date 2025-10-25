import { NextRequest, NextResponse } from 'next/server';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params; // await ici obligatoire
  const { userId } = params;

  console.log('[GET] userId:', userId);

  try {
    const res = await fetch(`${BOT_BASE_URL}/currency/${userId}`);
    if (!res.ok) {
      console.error('[GET] Erreur récupération coins bot:', res.status);
      return NextResponse.json(
        { error: 'Erreur récupération coins bot' },
        { status: res.status }
      );
    }
    const data = await res.json();

    const coins = data.coins ?? data.amount ?? data.balance ?? 0;

    console.log('[GET] coins:', coins);

    return NextResponse.json({ coins });
  } catch (error) {
    console.error('[GET] Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params; // await ici obligatoire
  const { userId } = params;
  const { itemId } = await request.json();

  console.log('[POST] userId:', userId, 'itemId:', itemId);

  if (!itemId) {
    console.warn('[POST] ItemId manquant');
    return NextResponse.json({ error: 'ItemId manquant' }, { status: 400 });
  }

  try {
    // Récupérer la boutique
    console.log('[POST] Récupération de la boutique...');
    const shopRes = await fetch(`${BOT_BASE_URL}/shop`);
    if (!shopRes.ok) {
      console.error('[POST] Erreur récupération boutique:', shopRes.status);
      throw new Error('Erreur récupération boutique');
    }
    const shopItems = await shopRes.json();

    const item = shopItems.find((i: any) => i.id === itemId);
    if (!item) {
      console.warn('[POST] Item non trouvé:', itemId);
      return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 });
    }
    console.log('[POST] Item trouvé:', item);

    // Récupérer le solde utilisateur
    console.log('[POST] Récupération du solde utilisateur...');
    const currencyRes = await fetch(`${BOT_BASE_URL}/currency/${userId}`);
    if (!currencyRes.ok) {
      console.error('[POST] Erreur récupération monnaie:', currencyRes.status);
      throw new Error('Erreur récupération monnaie');
    }
    const currencyData = await currencyRes.json();
    console.log('[POST] Solde utilisateur:', currencyData.balance);

    if ((currencyData.balance ?? 0) < item.price) {
      console.warn('[POST] Solde insuffisant:', currencyData.balance, '<', item.price);
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 });
    }

    // Faire l'achat
    console.log('[POST] Tentative d\'achat...');
    const buyRes = await fetch(`${BOT_BASE_URL}/shop/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });

    if (!buyRes.ok) {
      const errText = await buyRes.text();
      console.error('[POST] Erreur achat:', errText);
      throw new Error(`Erreur achat : ${errText}`);
    }
    console.log('[POST] Achat réussi');

    // Récupérer nouveau solde après achat
    console.log('[POST] Récupération nouveau solde...');
    const newCurrencyRes = await fetch(`${BOT_BASE_URL}/currency/${userId}`);
    const newCurrencyData = await newCurrencyRes.json();
    console.log('[POST] Nouveau solde:', newCurrencyData.balance);

    return NextResponse.json({
      success: true,
      userId,
      itemId,
      newBalance: newCurrencyData.balance,
    });
  } catch (error: any) {
    console.error('[POST] Erreur lors de l\'achat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

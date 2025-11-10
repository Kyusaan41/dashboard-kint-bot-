import { NextResponse } from 'next/server';

// L'URL de l'API du bot, déterminée par l'environnement.
const BOT_API_ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'http://193.70.34.25:20007/api/banque/add'
  : 'http://localhost:20007/api/banque/add';

/**
 * @swagger
 * /api/casino/banque:
 *   post:
 *     summary: Met à jour le montant de la banque du casino.
 *     description: Reçoit un montant et le transfère à la banque via l'API du bot.
 *     tags: [Casino]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Le montant à ajouter à la banque.
 *     responses:
 *       200:
 *         description: La banque a été mise à jour avec succès.
 *       400:
 *         description: Requête invalide.
 *       500:
 *         description: Erreur de communication avec le bot.
 */
export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Appeler l'API du bot pour ajouter le montant à la banque
    const botResponse = await fetch(BOT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si votre bot nécessite une clé d'API, ajoutez-la ici.
        // 'Authorization': `Bearer ${process.env.BOT_API_TOKEN}`
      },
      body: JSON.stringify({ amount }),
    });

    if (!botResponse.ok) {
      const errorBody = await botResponse.text();
      console.error(`[API BANQUE] Erreur de l'API du bot (status ${botResponse.status}):`, errorBody);
      return NextResponse.json({ error: `Erreur de communication avec le service de la banque.` }, { status: 502 }); // 502 Bad Gateway
    }

    const result = await botResponse.json();
    console.log(`[API BANQUE] Appel au bot réussi. Nouveau solde de la banque: ${result.newBalance}`);

    return NextResponse.json({ message: 'La banque a été mise à jour.', newBalance: result.newBalance });

  } catch (error) {
    console.error('[API BANQUE] Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

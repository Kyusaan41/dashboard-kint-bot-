import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET : Récupère le solde et le dernier claim d'un utilisateur
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        const res = await fetch(`${BOT_API_URL}/currency/${userId}`);
        if (!res.ok) {
            throw new Error(`Erreur du bot API: ${res.statusText}`);
        }
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans GET /api/currency/[userId]:", error);
        return NextResponse.json({ balance: 0, lastClaim: null }, { status: 500 });
    }
}


// POST : Met à jour le solde d'un utilisateur
export async function POST(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = await params;
        // Le frontend envoie la différence de montant dans le champ 'amount'.
        const { amount } = await request.json();

        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Le montant est invalide' }, { status: 400 });
        }

        // 1. Récupérer le solde actuel depuis le bot
        const currentCurrencyRes = await fetch(`${BOT_API_URL}/currency/${userId}`);
        if (!currentCurrencyRes.ok) {
             throw new Error("Impossible de récupérer le solde actuel de l'utilisateur avant la mise à jour.");
        }
        const currentCurrencyData = await currentCurrencyRes.json();
        const currentBalance = currentCurrencyData.balance || 0;

        // 2. Calculer le nouveau solde
        const newBalance = currentBalance + amount;

        // 3. Envoyer le nouveau solde total à l'API du bot
        // Le bot s'attend probablement à recevoir le nouveau total sous la clé 'coins'.
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: newBalance }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Erreur du bot API lors de la mise à jour.');
        }

                // ✅ Retour standardisé
        return NextResponse.json({
            success: true,
            message: 'Solde mis à jour avec succès',
            newBalance,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Erreur dans POST /api/currency/[userId]:", errorMessage);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
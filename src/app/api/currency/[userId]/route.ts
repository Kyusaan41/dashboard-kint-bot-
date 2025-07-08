import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// GET : Récupère le solde et le dernier claim d'un utilisateur
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

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
        console.error("Erreur dans /api/currency/[userId]:", error);
        return NextResponse.json({ balance: 0, lastClaim: null }, { status: 500 });
    }
}

// POST : Met à jour le solde d'un utilisateur
export async function POST(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;
        const { amount, source } = await request.json(); // On attend une différence (amount) et une source

        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Le montant est invalide' }, { status: 400 });
        }

        // On appelle l'API du bot pour appliquer la différence
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, source }), // On transmet la différence et la source
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Erreur du bot API');
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans POST /api/currency/[userId]:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
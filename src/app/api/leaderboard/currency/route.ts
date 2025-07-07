// src/app/api/currency/[userId]/route.ts

import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// Cette route récupère le solde ET le dernier claim d'un utilisateur
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

// POST : Met à jour la monnaie d'un utilisateur
// Modification : Attend maintenant 'amount' (différence) et 'source'
export async function POST(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;
        const { amount, source } = await request.json(); // <-- Récupère la différence (amount) et la source

        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Le montant de la monnaie est invalide' }, { status: 400 });
        }

        // Appelle l'API du bot pour qu'elle gère la mise à jour réelle
        // L'API du bot s'attend à recevoir une différence et la source.
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: amount, source: source }), // <-- Transmet la différence et la source
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
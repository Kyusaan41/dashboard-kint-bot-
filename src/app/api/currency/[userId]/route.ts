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
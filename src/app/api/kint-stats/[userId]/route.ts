// src/app/api/kint-stats/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// On utilise la même signature que vos autres routes fonctionnelles
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }
        
        const res = await fetch(`${BOT_API_URL}/kint-stats/${userId}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        // En cas d'erreur ou si l'utilisateur n'existe pas, renvoyer des valeurs par défaut
        return NextResponse.json({ total: 0, oui: 0, non: 0 }, { status: 200 });
    }
}

// On applique aussi la correction à la fonction POST
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        
        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        const { responseType } = await request.json();
        const res = await fetch(`${BOT_API_URL}/kint-stats/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responseType }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Échec de la mise à jour des stats KINT sur le bot: ${errorText}`);
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
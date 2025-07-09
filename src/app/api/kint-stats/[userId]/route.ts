// src/app/api/kint-stats/[userId]/route.ts
import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// Fonction GET pour lire les stats
export async function GET(request: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;
    if (!userId) return NextResponse.json({ error: "User ID manquant" }, { status: 400 });

    try {
        const res = await fetch(`${BOT_API_URL}/kint-stats/${userId}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ total: 0, oui: 0, non: 0 }, { status: 500 });
    }
}

// Fonction POST pour mettre à jour les stats
export async function POST(request: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;
    if (!userId) return NextResponse.json({ error: "User ID manquant" }, { status: 400 });

    try {
        const { responseType } = await request.json(); // 'oui' ou 'non'
        const res = await fetch(`${BOT_API_URL}/kint-stats/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responseType }),
        });

        if (!res.ok) throw new Error('Échec de la mise à jour des stats KINT sur le bot');
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On utilise la signature simplifiée avec 'any' pour le contexte
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        const res = await fetch(`${BOT_API_URL}/points/${userId}/history`);
        if (!res.ok) {
            throw new Error('Erreur de l\'API du bot');
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/points/[userId]/history:", error);
        return NextResponse.json([], { status: 500 });
    }
}
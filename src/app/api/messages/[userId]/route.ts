import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On utilise la signature simplifiée avec 'any' qui passe le build Vercel
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        const res = await fetch(`${BOT_API_URL}/messages/${userId}`);
        if (!res.ok) {
            throw new Error(`Erreur du bot API: ${res.statusText}`);
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/messages/[userId]:", error);
        // Renvoyer une structure de données vide en cas d'erreur pour que le graphique ne plante pas
        return NextResponse.json({ messagesLast7Days: [] }, { status: 500 });
    }
}
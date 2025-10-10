import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// On utilise la signature 'any' qui passe le build Vercel
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = params;

        const res = await fetch(`${BOT_API_URL}/points/${userId}/history`);
        if (!res.ok) throw new Error('Erreur de l\'API du bot');
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/points/[userId]/history:", error);
        return NextResponse.json([], { status: 500 }); // Renvoyer un tableau vide en cas d'erreur
    }
}
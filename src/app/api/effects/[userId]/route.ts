import { NextResponse, NextRequest } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// On utilise la signature 'any' qui passe le build Vercel
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }
        
        // Cet endpoint doit être créé sur votre bot pour retourner les effets actifs d'un utilisateur
        const res = await fetch(`${BOT_API_URL}/effects/${userId}`);
        
        if (!res.ok) {
            // Si l'utilisateur n'a pas d'effets, on retourne un objet vide
            if (res.status === 404) {
                return NextResponse.json({ effect: null });
            }
            throw new Error('Erreur API Bot');
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans /api/effects/[userId]:", error);
        return NextResponse.json({ effect: null }, { status: 500 });
    }
}
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// On utilise la signature simplifiée avec 'any' pour le contexte
export async function GET(request: NextRequest, context: any) {
    try {
        const { params } = context;
        const { userId } = await params;

        const res = await fetch(`${BOT_API_URL}/titres/${userId}`);
        if (!res.ok) {
            // Si l'utilisateur n'est pas trouvé (404), on renvoie une structure vide
            if (res.status === 404) {
                return NextResponse.json({ titresPossedes: [], titreActuel: null });
            }
            throw new Error(`Erreur du bot API: ${res.statusText}`);
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans GET /api/titres/[userId]:", error);
        return NextResponse.json({ titresPossedes: [], titreActuel: null }, { status: 500 });
    }
}

// On utilise aussi la signature simplifiée pour la fonction POST
export async function POST(request: NextRequest, context: any) {
    const session = await getServerSession(authOptions);
    const { params } = context;
    const { userId } = await params;

    if (session?.user?.id !== userId) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    try {
        const { nouveauTitre } = await request.json();
        if (!nouveauTitre) {
            return NextResponse.json({ error: 'Le champ nouveauTitre est requis' }, { status: 400 });
        }

        const res = await fetch(`${BOT_API_URL}/titres/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nouveauTitre }),
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || `Erreur du bot API: ${res.statusText}`);
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans POST /api/titres/[userId]:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
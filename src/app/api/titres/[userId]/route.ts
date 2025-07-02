import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// GET : Récupère les titres de l'utilisateur
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;
        const res = await fetch(`${BOT_API_URL}/titres/${userId}`);
        if (!res.ok && res.status === 404) {
            return NextResponse.json({ titresPossedes: [], titreActuel: null });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans GET /api/titres/[userId]:", error);
        return NextResponse.json({ titresPossedes: [], titreActuel: null }, { status: 500 });
    }
}

// --- AJOUT DE LA FONCTION POST ---
// POST : Met à jour le titre équipé de l'utilisateur
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    const session = await getServerSession(authOptions);
    const { userId } = params;

    // Sécurité : on vérifie que l'utilisateur modifie bien son propre titre
    if (session?.user?.id !== userId) {
        return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
    }
    
    try {
        const { nouveauTitre } = await request.json();
        if (!nouveauTitre) {
            return NextResponse.json({ error: 'Le champ nouveauTitre est requis' }, { status: 400 });
        }

        // On transmet la requête au bot
        const res = await fetch(`${BOT_API_URL}/titres/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nouveauTitre }),
        });
        
        const data = await res.json();
        if (!res.ok) {
            // Si le bot renvoie une erreur, on la transmet au client
            throw new Error(data.error || "Erreur de l'API du bot");
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur dans POST /api/titres/[userId]:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
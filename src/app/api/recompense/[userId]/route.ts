import { NextResponse, NextRequest } from 'next/server';

// On utilise une signature simplifiée avec 'any' pour le contexte
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        // On récupère les paramètres à l'intérieur de la fonction
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant dans l'URL" }, { status: 400 });
        }

        // --- Logique métier ---
        const userRewards = [
            { id: 'daily_login', name: 'Récompense journalière' },
        ];
        // --------------------

        return NextResponse.json(userRewards);

    } catch (error) {
        console.error(`Erreur API /recompense/[userId]:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
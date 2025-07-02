import { NextResponse, NextRequest } from 'next/server';

// On utilise une signature simplifiée avec 'any' pour le contexte
export async function GET(request: NextRequest, context: any) {
    try {
        // On récupère les paramètres à l'intérieur de la fonction
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant dans l'URL" }, { status: 400 });
        }

        // --- Logique métier ---
        const userTitles = [
            { id: 'newbie', name: 'Le Novice' },
        ];
        // --------------------

        return NextResponse.json(userTitles);

    } catch (error) {
        console.error(`Erreur API /titres/[userId]:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
import { NextResponse, NextRequest } from 'next/server';

// L'URL de base de votre bot
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, context: { params: { userId: string } }) {
    try {
        const { userId } = context.params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        // On appelle la route /messages/:userId de votre bot
        const res = await fetch(`${BOT_API_URL}/messages/${userId}`);

        // Si le bot renvoie une erreur (ex: utilisateur non trouvé), on la transmet
        if (!res.ok) {
            console.error(`Erreur de l'API du bot pour les messages : ${res.statusText}`);
            // On renvoie un tableau vide pour que le graphique ne plante pas
            return NextResponse.json({ messagesLast7Days: [] }, { status: res.status });
        }
        
        // On récupère les données et on les renvoie au dashboard
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/messages/[userId]:", error);
        // En cas d'erreur critique, on renvoie aussi un tableau vide
        return NextResponse.json({ messagesLast7Days: [] }, { status: 500 });
    }
}
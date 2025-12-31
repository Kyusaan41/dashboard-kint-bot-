import { NextResponse, NextRequest } from 'next/server';

// La seule signature qui passe le build Vercel dans votre cas
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant dans l'URL" }, { status: 400 });
        }

        // --- Logique métier pour récupérer les pièces (coins) ---
        // Vous contacteriez ici l'API de votre bot
        // const botResponse = await fetch(`http://YOUR_BOT_API/currency/${userId}`);
        // const data = await botResponse.json();
        // const userCoins = data.balance;
        
        // Pour l'exemple, on renvoie une valeur factice
        const userCoins = { balance: 1250 };
        // ----------------------------------------------------

        return NextResponse.json(userCoins);

    } catch (error) {
        console.error(`Erreur API /users/[userId]/coins:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
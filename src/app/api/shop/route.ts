import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET pour rÃ©cupÃ©rer les articles
export async function GET() {
    try {
        // Assurez-vous que l'endpoint `/shop` existe sur votre bot et renvoie les articles
        const response = await fetch(`${BOT_API_URL}/shop`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur de l'API du bot [${response.status}]: ${errorText}`);
            return NextResponse.json({ message: "Impossible de rÃ©cupÃ©rer les articles du magasin." }, { status: response.status });
        }

        const items = await response.json();
        return NextResponse.json(items);

    } catch (error) {
        console.error("Erreur interne du dashboard:", error);
        return NextResponse.json({ message: 'Impossible de contacter le serveur du bot.' }, { status: 500 });
    }
}

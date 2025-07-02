import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// GET pour récupérer les articles
export async function GET() {
    try {
        // Assurez-vous que l'endpoint `/shop` existe sur votre bot et renvoie les articles
        const response = await fetch(`${BOT_API_URL}/shop`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur de l'API du bot [${response.status}]: ${errorText}`);
            return NextResponse.json({ message: "Impossible de récupérer les articles du magasin." }, { status: response.status });
        }

        const items = await response.json();
        return NextResponse.json(items);

    } catch (error) {
        console.error("Erreur interne du dashboard:", error);
        return NextResponse.json({ message: 'Impossible de contacter le serveur du bot.' }, { status: 500 });
    }
}
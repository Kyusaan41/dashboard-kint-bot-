import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    try {
        const response = await fetch(`${BOT_API_URL}/currency`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur de l'API du bot [${response.status}]: ${errorText}`);
            return NextResponse.json({ message: "Erreur lors de la récupération du classement des pièces depuis le bot." }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur interne du dashboard:", error);
        return NextResponse.json({ message: 'Impossible de contacter le serveur du bot.' }, { status: 500 });
    }
}
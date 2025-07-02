import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // <--- On importe depuis le nouveau fichier

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions); // On utilise la config importée

    if (!session) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { itemId } = await request.json();
        const userId = session.user.id;

        const response = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, itemId }),
        });

        const responseData = await response.json();
        if (!response.ok) {
            return NextResponse.json({ message: responseData.message || "L'achat a échoué" }, { status: response.status });
        }
        return NextResponse.json(responseData);

    } catch (error) {
        return NextResponse.json({ message: "Une erreur interne s'est produite." }, { status: 500 });
    }
}
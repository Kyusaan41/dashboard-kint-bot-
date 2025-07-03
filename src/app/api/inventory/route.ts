import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/inventaire/${session.user.id}`);
        if (!res.ok) {
            // Si l'inventaire est vide (404), on renvoie un tableau vide.
            if (res.status === 404) {
                return NextResponse.json([]);
            }
            throw new Error('Erreur API Bot');
        }
        const data = await res.json();
        // On transforme l'objet en tableau pour une utilisation plus simple
        const inventoryArray = Object.entries(data).map(([id, item]) => ({ id, ...(item as object) }));
        return NextResponse.json(inventoryArray);

    } catch (error) {
        console.error("Erreur API /api/inventory:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
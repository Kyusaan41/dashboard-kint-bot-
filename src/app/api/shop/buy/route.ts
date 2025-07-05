import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { items } = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Le panier est vide ou invalide." }, { status: 400 });
        }
        
        // --- NOUVELLE VÉRIFICATION CÔTÉ SERVEUR ---
        
        // 1. On récupère l'inventaire de l'utilisateur et les données de la boutique
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${session.user.id}`),
            fetch(`${BOT_API_URL}/shop`)
        ]);

        const userInventory = inventoryRes.ok ? await inventoryRes.json() : {};
        const allShopItems = shopRes.ok ? await shopRes.json() : [];

        // 2. On vérifie chaque article du panier
        for (const itemId of items) {
            const itemDetails = allShopItems.find((i: any) => i.id === itemId);
            
            // Si l'article est de type "Personnalisation" (unique) et qu'il est déjà dans l'inventaire
            if (itemDetails && itemDetails.type === 'Personnalisation' && userInventory[itemId]) {
                // On bloque l'achat et on renvoie une erreur claire
                return NextResponse.json(
                    { error: `Vous possédez déjà l'article "${itemDetails.name}".` },
                    { status: 400 } // 400 Bad Request
                );
            }
        }
        // --- FIN DE LA VÉRIFICATION ---


        // Si tout est bon, on procède à l'achat
        const bodyToSend = {
            userId: session.user.id,
            items: items
        };

        const res = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || "Une erreur est survenue côté bot." }, { status: res.status });
        }
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erreur dans /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
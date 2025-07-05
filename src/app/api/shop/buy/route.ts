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
        const { items } = await request.json(); // `items` est un tableau d'IDs venant du panier

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Le panier est vide ou invalide." }, { status: 400 });
        }

        console.log(`[ACHAT DEBUG] L'utilisateur ${session.user.id} essaie d'acheter :`, items);

        // --- VRAIE VÉRIFICATION CÔTÉ SERVEUR ---

        // 1. On récupère l'inventaire et la boutique en même temps
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${session.user.id}`),
            fetch(`${BOT_API_URL}/shop`)
        ]);

        const userInventory = inventoryRes.ok ? await inventoryRes.json() : {};
        const allShopItems = shopRes.ok ? await shopRes.json() : [];
        
        console.log(`[ACHAT DEBUG] Inventaire actuel:`, JSON.stringify(userInventory));

        // 2. On vérifie chaque article du panier
        for (const itemId of items) {
            const itemDetails = allShopItems.find((i: any) => i.id === itemId);

            // Si on ne trouve pas l'article dans la boutique, on continue (le bot lèvera une erreur)
            if (!itemDetails) {
                console.log(`[ACHAT DEBUG] Article ${itemId} non trouvé dans la boutique. La validation est laissée au bot.`);
                continue;
            }
            
            console.log(`[ACHAT DEBUG] Détails de l'article ${itemId}: type='${itemDetails.type}'`);

            // La condition est maintenant stricte : le type doit être 'Personnalisation'
            const isUniqueAndOwned = itemDetails.type === 'Personnalisation' && userInventory.hasOwnProperty(itemId);
            
            console.log(`[ACHAT DEBUG] L'article est-il unique et possédé ? ${isUniqueAndOwned}`);

            if (isUniqueAndOwned) {
                // Si l'article est unique ET déjà possédé, on bloque l'achat.
                console.error(`[ACHAT DEBUG] ACHAT BLOQUÉ pour ${itemId}. L'utilisateur le possède déjà.`);
                return NextResponse.json(
                    { error: `Vous possédez déjà l'article "${itemDetails.name}".` },
                    { status: 400 } // Erreur 400 (Bad Request)
                );
            }
        }
        // --- FIN DE LA VÉRIFICATION ---

        console.log(`[ACHAT DEBUG] Vérifications passées. Appel de l'API du bot pour finaliser l'achat.`);
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
            console.error(`[ACHAT DEBUG] Le bot a renvoyé une erreur:`, data);
            return NextResponse.json({ error: data.error || "Une erreur est survenue côté bot." }, { status: res.status });
        }
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("[ACHAT DEBUG] Erreur critique dans la route /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
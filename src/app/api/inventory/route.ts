import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${userId}`),
            fetch(`${BOT_API_URL}/shop`)
        ]);

        if (!shopRes.ok) {
            console.error("Erreur API /inventory: Impossible de récupérer les articles de la boutique.");
            return NextResponse.json({ message: "Impossible de charger la boutique." }, { status: 502 });
        }
        const shopItems = await shopRes.json();

        let userInventory = {};
        if (inventoryRes.ok) {
            userInventory = await inventoryRes.json();
        } else {
            console.warn(`Avertissement API /inventory: La requête pour l'inventaire de ${userId} a échoué. Statut: ${inventoryRes.status}. On continue avec un inventaire vide.`);
        }

        const enrichedInventory = Object.entries(userInventory).map(([itemId, itemData]) => {
            const shopItem = shopItems.find((s: any) => s.id === itemId);
            const data = itemData as { quantity: number };

            return {
                id: itemId,
                quantity: data.quantity,
                name: shopItem?.name || itemId,
                icon: shopItem?.icon || null,
                description: shopItem?.description || "Aucune description disponible." // <-- CORRECTION ICI
            };
        });

        return NextResponse.json(enrichedInventory);

    } catch (error) {
        console.error("Erreur critique dans API /api/inventory:", error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
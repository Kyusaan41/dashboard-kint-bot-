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
        // --- CORRECTION : On récupère l'inventaire ET la boutique en même temps ---
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${session.user.id}`),
            fetch(`${BOT_API_URL}/shop`) // L'API qui liste tous les objets
        ]);

        if (inventoryRes.status === 404) {
            return NextResponse.json([]); // L'utilisateur a un inventaire vide, on renvoie un tableau vide.
        }

        if (!inventoryRes.ok || !shopRes.ok) {
            throw new Error("Impossible de récupérer les données de l'inventaire ou de la boutique depuis le bot.");
        }
        
        const userInventory = await inventoryRes.json();
        const shopItems = await shopRes.json();

        // On "enrichit" l'inventaire avec les détails de la boutique
        const enrichedInventory = Object.entries(userInventory).map(([itemId, itemData]) => {
            const shopItem = shopItems.find((s: any) => s.id === itemId);
            const data = itemData as { quantity: number };

            return {
                id: itemId,
                quantity: data.quantity,
                name: shopItem?.name || itemId, // Si l'objet n'est plus en boutique, on affiche son ID
                icon: shopItem?.icon || null
            };
        });

        return NextResponse.json(enrichedInventory);

    } catch (error) {
        console.error("Erreur API /api/inventory:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
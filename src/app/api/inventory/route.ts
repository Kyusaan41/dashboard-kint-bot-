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
            // Important : Katabump peut renvoyer une chaîne vide si l'inventaire n'existe pas
            const inventoryText = await inventoryRes.text();
            userInventory = inventoryText ? JSON.parse(inventoryText) : {};
        } else {
            console.warn(`Avertissement API /inventory: La requête pour l'inventaire de ${userId} a échoué. Statut: ${inventoryRes.status}. On continue avec un inventaire vide.`);
        }

        const enrichedInventory = Object.entries(userInventory).map(([itemName, itemData]) => {
            // --- CORRECTION ICI ---
            // On cherche maintenant en comparant le nom de l'objet, pas son ID.
            const shopItem = shopItems.find((s: any) => s.name === itemName);
            const data = itemData as { quantity: number };

            return {
                id: shopItem?.id || itemName, // On prend l'ID de la boutique s'il existe
                quantity: data.quantity,
                name: itemName, // Le nom est la clé de l'inventaire
                icon: shopItem?.icon || null,
                description: shopItem?.description || "Aucune description disponible."
            };
        });

        return NextResponse.json(enrichedInventory);

    } catch (error) {
        console.error("Erreur critique dans API /api/inventory:", error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
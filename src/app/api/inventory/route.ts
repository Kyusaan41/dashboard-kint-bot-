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

    console.log(`[API /inventory] Début de la récupération pour l'utilisateur : ${userId}`);

    try {
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${userId}`),
            fetch(`${BOT_API_URL}/shop`)
        ]);

        console.log(`[API /inventory] Statut de la réponse du bot pour l'inventaire : ${inventoryRes.status}`);
        console.log(`[API /inventory] Statut de la réponse du bot pour la boutique : ${shopRes.status}`);

        if (!shopRes.ok) {
            console.error("[API /inventory] Erreur critique: Impossible de récupérer les articles de la boutique.");
            return NextResponse.json({ message: "Impossible de charger la boutique." }, { status: 502 });
        }
        const shopItems = await shopRes.json();
        console.log('[API /inventory] Articles de la boutique chargés :', shopItems);


        let userInventory = {};
        if (inventoryRes.ok) {
            const inventoryText = await inventoryRes.text();
            userInventory = inventoryText ? JSON.parse(inventoryText) : {};
        }
        console.log('[API /inventory] Inventaire brut de l\'utilisateur reçu du bot :', userInventory);


        const enrichedInventory = Object.entries(userInventory).map(([itemName, itemData]) => {
            // --- CORRECTION DÉFINITIVE ---
            // On cherche un objet dans la boutique dont le NOM correspond à la clé dans l'inventaire
            const shopItem = shopItems.find((s: any) => s.name === itemName);
            
            if (!shopItem) {
                console.warn(`[API /inventory] Attention : L'objet "${itemName}" de l'inventaire n'a pas été trouvé dans la boutique.`);
            }

            const data = itemData as { quantity: number };

            return {
                id: shopItem?.id || itemName, // On utilise l'ID de la boutique, ou le nom si non trouvé
                quantity: data.quantity,
                name: itemName,
                icon: shopItem?.icon || null,
                description: shopItem?.description || "Aucune description disponible."
            };
        });

        console.log('[API /inventory] Inventaire final envoyé au dashboard :', enrichedInventory);

        return NextResponse.json(enrichedInventory);

    } catch (error) {
        console.error("Erreur critique dans la route API /api/inventory:", error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ message: 'Non autorisÃ©' }, { status: 401 });
    }

    console.log(`[API /inventory] DÃ©but de la rÃ©cupÃ©ration pour l'utilisateur : ${userId}`);

    try {
        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${userId}`, { cache: 'no-store' }),
            fetch(`${BOT_API_URL}/shop`, { cache: 'no-store' })
        ]);

        console.log(`[API /inventory] Statut de la rÃ©ponse du bot pour l'inventaire : ${inventoryRes.status}`);
        console.log(`[API /inventory] Statut de la rÃ©ponse du bot pour la boutique : ${shopRes.status}`);

        if (!shopRes.ok) {
            console.error("[API /inventory] Erreur critique: Impossible de rÃ©cupÃ©rer les articles de la boutique.");
            // Fallback sÃ»r: retour d'une liste vide pour ne pas casser le dashboard
            return NextResponse.json([], { status: 200 });
        }
        const shopItems = await shopRes.json();
        console.log('[API /inventory] Articles de la boutique chargÃ©s :', shopItems);


        let userInventory = {} as Record<string, { quantity: number }>;
        if (inventoryRes.ok) {
            const inventoryText = await inventoryRes.text();
            console.log('[API /inventory] Inventaire brut (texte) reÃ§u du bot :', inventoryText);
            try {
                userInventory = inventoryText ? JSON.parse(inventoryText) : {};
            } catch (e) {
                console.warn('[API /inventory] JSON invalide pour inventaire, fallback {}');
                userInventory = {} as Record<string, { quantity: number }>;
            }
        }
        console.log('[API /inventory] Inventaire brut (JSON) de l\'utilisateur :', userInventory);


        const enrichedInventory = Object.entries(userInventory).map(([itemName, itemData]) => {
            // --- CORRECTION DÃ‰FINITIVE AVEC TOLÃ‰RANCE ---
            // On nettoie les noms pour la comparaison : tout en minuscules et sans espaces superflus.
            const normalizedItemName = itemName.trim().toLowerCase();
            
            const shopItem = shopItems.find(
                (s: any) => s.name && s.name.trim().toLowerCase() === normalizedItemName
            );
            
            if (!shopItem) {
                console.warn(`[API /inventory] Attention : L'objet "${itemName}" de l'inventaire n'a pas Ã©tÃ© trouvÃ© dans la boutique.`);
            }

            const data = itemData as { quantity: number };

            return {
                id: shopItem?.id || itemName,
                quantity: data.quantity,
                name: shopItem?.name || itemName, // On garde le nom original de la boutique pour l'affichage
                icon: shopItem?.icon || null,
                description: shopItem?.description || "Aucune description disponible."
            };
        });

        console.log('[API /inventory] Inventaire final "enrichi" envoyÃ© au dashboard :', enrichedInventory);

        return NextResponse.json(enrichedInventory, { status: 200 });

    } catch (error) {
        console.error("Erreur critique dans la route API /api/inventory:", error);
        // Fallback pour ne pas faire Ã©chouer le Promise.all du dashboard
        return NextResponse.json([], { status: 200 });
    }
}

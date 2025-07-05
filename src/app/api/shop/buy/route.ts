import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { items } = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
        }

        const [inventoryRes, shopRes] = await Promise.all([
            fetch(`${BOT_API_URL}/inventaire/${userId}`),
            fetch(`${BOT_API_URL}/shop`)
        ]);

        if (!shopRes.ok) throw new Error("Impossible de charger les articles de la boutique.");
        const allShopItems = await shopRes.json();
        
        const userInventory = inventoryRes.ok ? await inventoryRes.json() : {};

        for (const itemId of items) {
            const itemDetails = allShopItems.find((i: any) => i.id === itemId);

            // --- NOUVELLE LOGIQUE DE VÉRIFICATION ---
            // On ne bloque que les articles de type "Personnalisation" qui ne sont PAS des couleurs.
            if (itemDetails && itemDetails.type === 'Personnalisation' && itemDetails.action !== 'color' && userInventory.hasOwnProperty(itemId)) {
                return NextResponse.json(
                    { error: `Vous possédez déjà l'article unique "${itemDetails.name}".` },
                    { status: 400 }
                );
            }
        }

        const bodyToSend = { userId, items };
        const buyRes = await fetch(`${BOT_API_URL}/shop/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend),
        });

        const data = await buyRes.json();
        return buyRes.ok 
            ? NextResponse.json(data) 
            : NextResponse.json({ error: data.error || "Erreur du bot." }, { status: buyRes.status });

    } catch (error) {
        console.error("Erreur dans /api/shop/buy:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur du dashboard.' }, { status: 500 });
    }
}
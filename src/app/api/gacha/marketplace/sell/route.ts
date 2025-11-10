import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

interface MarketplaceSellRequest {
    userId: string;
    username: string;
    cardId: string;
    price: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: MarketplaceSellRequest = await request.json();
        console.log('🔍 [MARKETPLACE SELL] Relais vers NyxNode:', body);

        // Validation basique
        if (!body.userId || !body.username || !body.cardId || !body.price) {
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        const botResponse = await fetch(`${NYXNODE_API_URL}/api/gacha/marketplace/sell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const responseData = await botResponse.json();
        console.log('🔍 [MARKETPLACE SELL] Réponse NyxNode:', responseData);

        return NextResponse.json(responseData, { 
            status: botResponse.status, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        console.error('[MARKETPLACE SELL] Erreur:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Erreur de communication avec le serveur du bot.' 
        }, { status: 502 });
    }
}
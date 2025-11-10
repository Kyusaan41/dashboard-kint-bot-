import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

// GET - Récupérer les listings du marketplace
export async function GET(): Promise<NextResponse> {
    try {
        console.log('🔍 [MARKETPLACE GET] Relais vers:', `${NYXNODE_API_URL}/api/gacha/marketplace`);
        
        const botResponse = await fetch(`${NYXNODE_API_URL}/api/gacha/marketplace`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!botResponse.ok) {
            throw new Error(`NyxNode error: ${botResponse.status}`);
        }

        const data = await botResponse.json();
        return NextResponse.json(data, { status: botResponse.status });
    } catch (error) {
        console.error('[MARKETPLACE GET] Erreur:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Erreur interne du serveur.',
            listings: []
        }, { status: 500 });
    }
}

// POST - Mettre une carte en vente (alternative à /sell)
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        console.log('🔍 [MARKETPLACE POST] Relais vers NyxNode:', body);

        const botResponse = await fetch(`${NYXNODE_API_URL}/api/gacha/marketplace/sell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const responseData = await botResponse.json();
        console.log('🔍 [MARKETPLACE POST] Réponse NyxNode:', responseData);

        return NextResponse.json(responseData, { 
            status: botResponse.status, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        console.error('[MARKETPLACE POST] Erreur:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Erreur de communication avec le serveur du bot.' 
        }, { status: 502 });
    }
}
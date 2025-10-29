import { NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

export async function GET() {
    try {
        // On relaie la requête GET à l'API du bot
        const botResponse = await fetch(`${NYXNODE_API_URL}/api/gacha/marketplace`);
        const data = await botResponse.json();
        return NextResponse.json(data, { status: botResponse.status });
    } catch (error) {
        console.error('[MARKETPLACE GET] Erreur lors de la récupération des offres:', error);
        return NextResponse.json({ success: false, message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

/**
 * Relaye une requête POST vers l'API du bot et retourne la réponse.
 * @param endpoint L'endpoint de l'API du bot (ex: '/gacha/marketplace/sell')
 * @param request La requête Next.js originale.
 */
async function proxyPostToBot(endpoint: string, request: Request) {
    try {
        const body = await request.json();
        const botResponse = await fetch(`${NYXNODE_API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const responseData = await botResponse.json();
        return new NextResponse(JSON.stringify(responseData), { status: botResponse.status, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(`[PROXY ERROR] Erreur lors du relais vers ${endpoint}:`, error);
        return NextResponse.json({ success: false, message: 'Erreur de communication avec le serveur du bot.' }, { status: 502 }); // 502 Bad Gateway
    }
}

export async function POST(request: Request) {
    return proxyPostToBot('/api/gacha/marketplace/sell', request);
}
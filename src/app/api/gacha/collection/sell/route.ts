import { NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

/**
 * Relaye une requête POST vers l'API du bot et retourne la réponse.
 * @param endpoint L'endpoint de l'API du bot (ex: '/api/gacha/cards/sell')
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
        return NextResponse.json({ success: false, message: 'Erreur de communication avec le serveur du bot.' }, { status: 502 });
    }
}

export async function POST(request: Request) {
    return proxyPostToBot('/api/gacha/cards/sell', request);
}

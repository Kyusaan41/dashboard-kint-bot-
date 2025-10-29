import { NextResponse } from "next/server";

export const BOT_API_URL = process.env.BOT_API_URL || 'http://193.70.34.25:20007/api';

/**
 * Relaye une requête vers l'API du bot et retourne la réponse.
 * @param endpoint L'endpoint de l'API du bot (ex: '/gacha/marketplace/buy')
 * @param request La requête Next.js originale.
 */
export async function proxyToBot(endpoint: string, request: Request) {
    const body = await request.json();
    const botResponse = await fetch(`${BOT_API_URL}${endpoint}`, {
        method: request.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    return new NextResponse(botResponse.body, { status: botResponse.status, headers: { 'Content-Type': 'application/json' } });
}
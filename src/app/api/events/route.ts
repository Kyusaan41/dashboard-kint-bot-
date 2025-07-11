// src/app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import http from 'http';

const BOT_HOST = '51.83.103.24';
const BOT_PORT = 20077;

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // --- CORRECTION ---
    // On utilise `nextUrl.searchParams` pour lire les paramètres de l'URL
    const userId = request.nextUrl.searchParams.get('userId');
    if (session.user.id !== userId) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const options = {
                hostname: BOT_HOST,
                port: BOT_PORT,
                // On transmet l'userId au bot
                path: `/api/events?userId=${userId}`,
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                }
            };

            const botRequest = http.request(options, (botResponse) => {
                console.log(`[SSE Proxy] Connexion établie avec le bot pour l'utilisateur ${userId}`);
                botResponse.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
                botResponse.on('end', () => {
                    console.log('[SSE Proxy] Le bot a fermé la connexion.');
                    controller.close();
                });
            });

            botRequest.on('error', (err) => {
                console.error('[SSE Proxy] Erreur de connexion au bot:', err);
                controller.error(err);
            });

            request.signal.onabort = () => {
                console.log('[SSE Proxy] Le client a fermé la connexion.');
                botRequest.abort();
                controller.close();
            };

            botRequest.end();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        },
    });
}
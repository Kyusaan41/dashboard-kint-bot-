// src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import http from 'http';

// L'URL de votre bot. Assurez-vous que c'est la bonne.
const BOT_API_URL = 'http://51.83.103.24:20077/api/events';

export async function GET(request: Request) {
    // 1. Vérification de la session utilisateur
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Création d'un flux (Stream) pour envoyer les données au client
    const stream = new ReadableStream({
        start(controller) {
            // Options pour la requête vers le bot
            const options = {
                hostname: '51.83.103.24',
                port: 20077,
                path: '/api/events',
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            };

            // 3. Établissement de la connexion avec le bot
            const botRequest = http.request(options, (botResponse) => {
                console.log('[SSE Proxy] Connexion établie avec le bot.');

                // 4. Dès qu'on reçoit des données du bot...
                botResponse.on('data', (chunk) => {
                    // ...on les envoie directement au client (le navigateur)
                    controller.enqueue(chunk);
                });

                botResponse.on('end', () => {
                    console.log('[SSE Proxy] Le bot a fermé la connexion.');
                    controller.close();
                });
            });

            // Gère les erreurs de connexion au bot
            botRequest.on('error', (err) => {
                console.error('[SSE Proxy] Erreur de connexion au bot:', err);
                controller.error(err);
            });

            // Gère la déconnexion du client (si l'utilisateur ferme l'onglet)
            request.signal.onabort = () => {
                console.log('[SSE Proxy] Le client a fermé la connexion.');
                botRequest.abort(); // On termine la requête vers le bot
                controller.close();
            };

            botRequest.end();
        },
    });

    // 5. On renvoie le flux au client
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
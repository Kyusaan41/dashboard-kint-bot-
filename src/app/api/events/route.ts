// Fichier : src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET : Retourne un flux Server-Sent Events pour les événements en temps réel
export async function GET(request: Request) {
    // On vérifie la session pour s'assurer que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    const accept = request.headers.get('accept') || '';

    // Si on demande du JSON (ex: fetch côté client pour check périodique), on renvoie une liste JSON
    if (!accept.includes('text/event-stream')) {
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }
        try {
            const res = await fetch(`${BOT_API_URL}/events`, { cache: 'no-store' });
            if (!res.ok) {
                return NextResponse.json([], { status: 200 });
            }
            const data = await res.json();
            return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
        } catch (error) {
            console.error('[Events] Erreur JSON GET /api/events:', error);
            return NextResponse.json([], { status: 200 });
        }
    }

    // Sinon: on sert le flux SSE
    if (!session?.user?.id) {
        return new NextResponse(
            `data: ${JSON.stringify({ error: 'Non autorisé' })}\n\n`,
            {
                status: 401,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            }
        );
    }

    try {
        const userId = session.user.id;
        console.log(`[SSE] Connexion établie pour l'utilisateur: ${userId}`);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`));
                    // Preload des événements avec timeout court pour éviter un blocage de 10s sur Vercel
                    try {
                        const controllerAbort = new AbortController();
                        const t = setTimeout(() => controllerAbort.abort(), 6000);
                        const res = await fetch(`${BOT_API_URL}/events`, { cache: 'no-store', signal: controllerAbort.signal });
                        clearTimeout(t);
                        if (res.ok) {
                            const data = await res.json();
                            if (Array.isArray(data)) {
                                for (const event of data) {
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', data: event })}\n\n`));
                                }
                            }
                        }
                    } catch (e) {
                        // En cas de timeout/échec on continue le flux sans précharger
                        console.warn('[SSE] Préchargement des événements ignoré (timeout/échec).');
                    }
                    let heartbeatCount = 0;
                    let isClosed = false;
                    const heartbeatInterval = setInterval(() => {
                        if (!isClosed) {
                            try {
                                controller.enqueue(encoder.encode(`: heartbeat ${heartbeatCount++}\n\n`));
                            } catch (error) {
                                console.error('[SSE] Erreur lors du heartbeat:', error);
                                clearInterval(heartbeatInterval);
                            }
                        }
                    }, 30000);

                    const handleClose = () => {
                        isClosed = true;
                        clearInterval(heartbeatInterval);
                        controller.close();
                        console.log(`[SSE] Connexion fermée pour l'utilisateur: ${userId}`);
                    };
                    // Note: Next.js n'expose pas un hook direct ici pour close; on garderait cela si on écoute abortSignal, etc.
                } catch (error) {
                    console.error('[SSE] Erreur lors de l\'initialisation:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Erreur interne du serveur.' })}\n\n`));
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (error) {
        console.error('[SSE] Erreur dans /api/events:', error);
        const encoder = new TextEncoder();
        return new NextResponse(
            encoder.encode(`data: ${JSON.stringify({ error: 'Erreur interne du serveur.' })}\n\n`),
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                },
            }
        );
    }
}

// POST : Permet de créer un nouvel événement (sera utilisé par le panneau admin)
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    // On s'assure que seul un admin peut créer un événement
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const res = await fetch(`${BOT_API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json({ error: errorData.error }, { status: res.status });
        }
        
        const newEvent = await res.json();
        return NextResponse.json(newEvent, { status: 201 });

    } catch (error) {
        console.error("Erreur dans POST /api/events:", error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
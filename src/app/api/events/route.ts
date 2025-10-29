﻿// Fichier : src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

// GET : Retourne un flux Server-Sent Events pour les événements en temps réel
export async function GET(request: Request) {
    // On vérifie la session pour s'assurer que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        // Retourne une réponse d'erreur avec le bon content-type pour SSE
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
        // Récupère l'ID utilisateur depuis la session
        const userId = session.user.id;
        console.log(`[SSE] Connexion établie pour l'utilisateur: ${userId}`);

        // Crée un custom encoder pour streamer les données
        const encoder = new TextEncoder();

        // Crée un ReadableStream pour streamer les événements
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Envoie un message d'initialisation
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`));

                    // Récupère les événements actuels de l'API du bot
                    const res = await fetch(`${BOT_API_URL}/events`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            // Envoie chaque événement
                            for (const event of data) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', data: event })}\n\n`));
                            }
                        }
                    }

                    // Garde la connexion ouverte avec des heartbeats
                    let heartbeatCount = 0;
                    let isClosed = false; // ✨ AJOUT: Flag pour suivre l'état de la connexion

                    const heartbeatInterval = setInterval(() => {
                        // ✨ CORRECTION: On vérifie si la connexion n'est pas déjà fermée
                        if (!isClosed) {
                            try {
                                controller.enqueue(encoder.encode(`: heartbeat ${heartbeatCount++}\n\n`));
                            } catch (error) {
                                console.error('[SSE] Erreur lors du heartbeat (connexion probablement fermée):', error);
                                clearInterval(heartbeatInterval);
                            }
                        }
                    }, 30000); // Toutes les 30 secondes

                    // Gère la fermeture de la connexion
                    const handleClose = () => {
                        isClosed = true; // ✨ AJOUT: On met le flag à jour
                        clearInterval(heartbeatInterval);
                        controller.close();
                        console.log(`[SSE] Connexion fermée pour l'utilisateur: ${userId}`);
                    };

                    // Dans un environnement réel, il y aurait ici une logique pour envoyer les nouveaux événements
                    // Pour maintenant, la connexion reste ouverte avec des heartbeats

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
                'X-Accel-Buffering': 'no', // Pour Nginx
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
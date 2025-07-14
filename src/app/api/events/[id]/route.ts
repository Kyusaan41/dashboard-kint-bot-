// Fichier : src/app/api/events/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// ▼▼▼ CORRECTION MAJEURE DE LA SIGNATURE ▼▼▼
// Nous n'utilisons plus le deuxième argument { params }.
// Nous allons extraire l'ID directement depuis l'URL de la requête.
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // On extrait l'ID de la fin de l'URL.
    // Exemple: pour /api/events/123, pathname est "/api/events/123"
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop(); // "pop()" prend le dernier élément

    if (!id) {
        return NextResponse.json({ error: "L'ID de l'événement est manquant dans l'URL." }, { status: 400 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/events/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error || "Erreur du bot lors de la suppression." }, { status: res.status });
        }

        return NextResponse.json({ message: 'Événement supprimé avec succès.' });

    } catch (error) {
        console.error(`Erreur dans DELETE /api/events/${id}:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
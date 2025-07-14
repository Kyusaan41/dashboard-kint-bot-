// Fichier : src/app/api/events/[userId]/route.ts
// NOTE : Ce fichier devrait s'appeler [id]/route.ts pour être cohérent.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// La correction est ici : on s'attend à recevoir un paramètre `userId`
// car votre dossier s'appelle [userId].
export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // On utilise `userId` au lieu de `id` pour correspondre au nom du paramètre.
    const eventId = params.userId; 
    if (!eventId) {
        return NextResponse.json({ error: "L'ID de l'événement est manquant." }, { status: 400 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/events/${eventId}`, { // On utilise eventId ici
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error || "Erreur du bot lors de la suppression." }, { status: res.status });
        }

        return NextResponse.json({ message: 'Événement supprimé avec succès.' });

    } catch (error) {
        console.error(`Erreur dans DELETE /api/events/[id]:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
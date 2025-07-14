// Fichier : src/app/api/events/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// DELETE /api/events/[id] : Supprime un événement spécifique
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    // Seuls les admins peuvent supprimer
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: "L'ID de l'événement est manquant." }, { status: 400 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/events/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json({ error: errorData.error || "Erreur du bot lors de la suppression." }, { status: res.status });
        }

        return NextResponse.json({ message: 'Événement supprimé avec succès.' });

    } catch (error) {
        console.error(`Erreur dans DELETE /api/events/${id}:`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
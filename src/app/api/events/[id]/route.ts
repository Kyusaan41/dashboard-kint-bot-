// Fichier : src/app/api/events/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// On n'a plus besoin de définir un type DeleteContext séparé.
// type DeleteContext = {
//     params: {
//         id: string;
//     }
// };

// DELETE /api/events/[id] : Supprime un événement spécifique
// CORRECTION ICI : Le type du 'context' est défini directement dans la signature.
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // On récupère l'id depuis l'objet "context"
    const { id } = context.params;
    if (!id) {
        return NextResponse.json({ error: "L'ID de l'événement est manquant." }, { status: 400 });
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
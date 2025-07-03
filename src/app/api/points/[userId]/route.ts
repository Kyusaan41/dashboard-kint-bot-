// src/app/api/points/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, context: any) {
    // --- Vérification du mode maintenance (comme sur les autres routes API) ---
    const session = await getServerSession(authOptions);
    const isMaintenanceMode = process.env.BOT_MAINTENANCE_MODE === 'true';
    const isAdmin = session?.user?.role === 'admin';

    if (isMaintenanceMode && !isAdmin) {
        return NextResponse.json(
            { error: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || 'Le bot est en maintenance.' },
            { status: 503 } // Service Unavailable
        );
    }
    // --- FIN Vérification du mode maintenance ---

    try {
        const { params } = context;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID manquant" }, { status: 400 });
        }

        // Appelle l'API de votre bot pour récupérer les points de l'utilisateur
        const res = await fetch(`${BOT_API_URL}/points/${userId}`); // Assurez-vous que votre bot a cette route!
        
        if (!res.ok) {
            // Si le bot renvoie un 404 (utilisateur non trouvé), on peut renvoyer 0 points
            if (res.status === 404) {
                return NextResponse.json({ points: 0 });
            }
            throw new Error(`Erreur du bot API: ${res.statusText || res.status}`);
        }
        
        const data = await res.json();
        // Assurez-vous que la réponse du bot contient bien une propriété 'points'
        return NextResponse.json({ points: data.points || 0 });

    } catch (error) {
        console.error("Erreur dans GET /api/points/[userId]:", error);
        return NextResponse.json({ points: 0, error: 'Impossible de récupérer les points de l\'utilisateur.' }, { status: 500 });
    }
}

// NOTE: La fonction POST est déjà gérée par /api/kint ou /api/admin/give-kip si vous les utilisez pour la mise à jour des points.
// Cette route est principalement pour le GET des points de l'utilisateur.
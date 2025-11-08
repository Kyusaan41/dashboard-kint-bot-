import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NYXNODE_API_URL } from '@/config/api';

/**
 * Relaye une requête POST vers l'API du bot pour réclamer une récompense de niveau.
 * @param request La requête Next.js originale.
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { level } = await request.json();

        if (typeof level !== 'number' || level <= 1) {
            return NextResponse.json({ success: false, message: 'Niveau invalide.' }, { status: 400 });
        }

        const botResponse = await fetch(`${NYXNODE_API_URL}/api/casino/claim-reward`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: session.user.name, level }),
        });

        const responseData = await botResponse.json();

        if (!botResponse.ok) {
            return NextResponse.json(responseData, { status: botResponse.status });
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("[PROXY ERROR] Erreur lors du relais vers /api/casino/claim-reward:", error);
        return NextResponse.json({ success: false, message: 'Erreur de communication avec le serveur du bot.' }, { status: 502 });
    }
}

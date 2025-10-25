import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const res = await fetch(`${BOT_API_URL}/points/${userId}`);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error('Erreur bot /points/:', res.status, text);
            return NextResponse.json({ points: 0 }, { status: 502 });
        }
        const data = await res.json();
        // Expecting { points: number }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur dans /api/points/me GET:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const body = await request.json();
        const { amount, source } = body;
        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        const res = await fetch(`${BOT_API_URL}/points/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: amount, source: source || 'dashboard-casino' })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error('Erreur bot POST /points/:', res.status, data);
            return NextResponse.json({ error: data?.error || 'Erreur bot' }, { status: 502 });
        }

        // After update, fetch current points to return canonical value
        const current = await fetch(`${BOT_API_URL}/points/${userId}`);
        const currentData = current.ok ? await current.json() : { points: null };
        return NextResponse.json({ updated: data, current: currentData });

    } catch (error) {
        console.error('Erreur dans /api/points/me POST:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

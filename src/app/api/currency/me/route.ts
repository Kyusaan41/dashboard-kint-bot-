import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = session.user.id;

    try {
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`);
        if (!res.ok) return NextResponse.json({ balance: 0 }, { status: 502 });
        const data = await res.json();
        // Normalize to { balance }
        return NextResponse.json({ balance: data.balance ?? data.coins ?? 0 });
    } catch (error) {
        console.error('Erreur /api/currency/me GET:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = session.user.id;

    try {
        const { amount } = await request.json();
        if (typeof amount !== 'number') return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });

        // Fetch current balance
        const currentRes = await fetch(`${BOT_API_URL}/currency/${userId}`);
        if (!currentRes.ok) return NextResponse.json({ error: 'Impossible de récupérer le solde actuel' }, { status: 502 });
        const currentData = await currentRes.json();
        const currentBalance = currentData.balance ?? currentData.coins ?? 0;

        const newBalance = currentBalance + amount;

        // send new total to bot
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: newBalance })
        });

        const data = await res.json();
        if (!res.ok) return NextResponse.json({ error: data?.error || 'Erreur bot' }, { status: 502 });

        return NextResponse.json({ updated: true, balance: newBalance });
    } catch (error) {
        console.error('Erreur /api/currency/me POST:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    try {
        const { userId, amount } = await await request.json();
        
        // On récupère le solde actuel d'abord
        const currentCurrencyRes = await fetch(`${BOT_API_URL}/currency/${userId}`);
        const currentCurrencyData = await currentCurrencyRes.json();
        const currentBalance = currentCurrencyData.balance || 0;
        
        // On calcule le nouveau solde
        const newBalance = currentBalance + amount;

        // On envoie la mise à jour au bot
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: newBalance }),
        });

        if (!res.ok) throw new Error('Échec de la mise à jour des pièces');
        
        return NextResponse.json({ success: true, newBalance });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
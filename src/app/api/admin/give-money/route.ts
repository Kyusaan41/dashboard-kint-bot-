import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'AccÃ¨s interdit' }, { status: 403 });
    }

    try {
        const { userId, amount } = await await request.json();
        
        // On rÃ©cupÃ¨re le solde actuel d'abord
        const currentCurrencyRes = await fetch(`${BOT_API_URL}/currency/${userId}`);
        const currentCurrencyData = await currentCurrencyRes.json();
        const currentBalance = currentCurrencyData.balance || 0;
        
        // On calcule le nouveau solde
        const newBalance = currentBalance + amount;

        // On envoie la mise Ã  jour au bot
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coins: newBalance }),
        });

        if (!res.ok) throw new Error('Ã‰chec de la mise Ã  jour des piÃ¨ces');
        
        return NextResponse.json({ success: true, newBalance });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

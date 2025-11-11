import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_BASE_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { action, amount } = await request.json();
        
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        if (action !== 'buy' && action !== 'sell') {
            return NextResponse.json({ error: 'Action invalide. Utilisez "buy" ou "sell".' }, { status: 400 });
        }

        console.log(`🔄 ${action.toUpperCase()} de jetons demandé:`, { userId: session.user.id, amount });

        const endpoint = action === 'buy' ? 'buy' : 'sell';
        const res = await fetch(`${BOT_BASE_URL}/exchange/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                amount: amount
            }),
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: 'Réponse du bot non valide', raw: text };
        }

        console.log(`📡 Réponse du bot pour ${action}:`, data);

        if (!res.ok) {
            return NextResponse.json({ 
                error: data.message || `Erreur lors de l'${action === 'buy' ? 'achat' : 'vente'}` 
            }, { status: res.status });
        }

        // Adapter la réponse au format attendu
        if (action === 'buy') {
            return NextResponse.json({
                success: true,
                currencyBalance: data.newBalance.coins,
                jetonsBalance: data.newBalance.tokens,
                cost: data.transaction.coinsSpent,
                bought: amount
            });
        } else {
            return NextResponse.json({
                success: true,
                currencyBalance: data.newBalance.coins,
                jetonsBalance: data.newBalance.tokens,
                gain: data.transaction.coinsReceived,
                sold: amount
            });
        }

    } catch (error) {
        console.error('💥 Erreur échange jetons:', error);
        return NextResponse.json({ 
            error: 'Erreur de connexion avec le serveur d\'échange' 
        }, { status: 500 });
    }
}
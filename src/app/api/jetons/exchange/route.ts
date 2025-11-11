import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

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

        console.log(`🔄 ${action.toUpperCase()} de jetons:`, { userId: session.user.id, amount });

        // Appeler votre bot Express pour l'échange
        const res = await fetch(`${BOT_API_URL}/exchange/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                amount: amount
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Erreur du serveur' }));
            return NextResponse.json({ 
                error: errorData.message || `Erreur lors de l'${action === 'buy' ? 'achat' : 'vente'}` 
            }, { status: res.status });
        }

        const data = await res.json();

        console.log(`✅ ${action.toUpperCase()} réussi:`, data);

        // Formater la réponse selon l'action
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
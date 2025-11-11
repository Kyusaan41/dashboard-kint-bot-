import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NYXNODE_API_URL } from '@/config/api'; // ← Utilisez la même config

export async function POST(request: NextRequest) {
    console.log('✅ Route /api/jetons/exchange appelée');
    
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        console.log('❌ Non autorisé - Session utilisateur non trouvée');
        return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔍 Session trouvée:', {
        userId: session.user.id,
        name: session.user.name
    });

    try {
        const { action, amount } = await request.json();
        
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        // Désormais, seule l'action d'achat est autorisée
        if (action !== 'buy') {
            return NextResponse.json({ error: 'La revente de jetons est désactivée.' }, { status: 400 });
        }

        console.log(`🔄 ${action.toUpperCase()} de jetons:`, { 
            userId: session.user.id, 
            amount 
        });

        // UTILISEZ LE PROXY COMME L'AUTRE ROUTE
        console.log("🌐 Requête envoyée à:", `${NYXNODE_API_URL}/api/tokens/exchange/buy`);
        const botResponse = await fetch(`${NYXNODE_API_URL}/api/tokens/exchange/buy`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                amount: amount
            }),
        });

        const responseData = await botResponse.json();

        if (!botResponse.ok) {
            console.log('❌ Erreur du bot:', responseData);
            return NextResponse.json(responseData, { status: botResponse.status });
        }

        console.log(`✅ BUY réussi:`, responseData);

        // Formater la réponse pour l'achat uniquement
        return NextResponse.json({
            success: true,
            currencyBalance: responseData.newBalance.coins,
            jetonsBalance: responseData.newBalance.tokens,
            cost: responseData.transaction.coinsSpent,
            bought: amount
        });

    } catch (error) {
        console.error('💥 Erreur échange jetons:', error);
        return NextResponse.json({ 
            error: 'Erreur de connexion avec le serveur d\'échange' 
        }, { status: 500 });
    }
}
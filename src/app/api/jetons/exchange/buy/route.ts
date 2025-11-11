import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { amount } = await request.json();
        
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        const BUY_RATE = 0.5; // 1000 Jetons = 500 Pièces (soit 1 Jeton = 0.5 Pièce)
        const costInCurrency = amount * BUY_RATE;

        // 1. Vérifier et déduire les pièces
        const currencyRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/currency/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ amount: -costInCurrency }),
        });

        if (!currencyRes.ok) {
            const errorData = await currencyRes.json();
            return NextResponse.json({ 
                error: errorData.error || 'Solde de pièces insuffisant' 
            }, { status: 400 });
        }

        // 2. Ajouter les jetons
        const jetonsRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jetons/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ amount: amount }),
        });

        if (!jetonsRes.ok) {
            // Rembourser les pièces en cas d'erreur
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/currency/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({ amount: costInCurrency }),
            });
            
            const errorData = await jetonsRes.json();
            return NextResponse.json({ 
                error: errorData.error || 'Erreur lors de l\'ajout des jetons' 
            }, { status: 500 });
        }

        const updatedCurrency = await currencyRes.json();
        const updatedJetons = await jetonsRes.json();

        return NextResponse.json({
            success: true,
            currencyBalance: updatedCurrency.balance,
            jetonsBalance: updatedJetons.balance,
            cost: costInCurrency,
            bought: amount
        });

    } catch (error) {
        console.error('Erreur achat jetons:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}